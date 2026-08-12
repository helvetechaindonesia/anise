<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Database Connection
try {
    $pdo = new PDO("pgsql:host=db;port=5432;dbname=anise_db", "anise_user", "anise_password", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

// JWT Config
$jwt_secret = 'super-secret-key-anise-2026';

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function generate_jwt($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64url_encode($signature);
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt, $secret) {
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) !== 3) return false;
    
    $header = base64_decode(strtr($tokenParts[0], '-_', '+/'));
    $payload = base64_decode(strtr($tokenParts[1], '-_', '+/'));
    $signature_provided = $tokenParts[2];

    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64url_encode($signature);

    if (hash_equals($base64UrlSignature, $signature_provided)) {
        return json_decode($payload, true);
    }
    return false;
}

// Endpoint: Login User
if ($uri === '/api/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Username dan password wajib diisi']);
        exit;
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown_ip';

    // Cek Rate Limiting
    $stmtRate = $pdo->prepare("SELECT failed_attempts, last_attempt FROM login_attempts WHERE ip_address = :ip");
    $stmtRate->execute(['ip' => $ip]);
    $attemptRecord = $stmtRate->fetch();

    if ($attemptRecord && $attemptRecord['failed_attempts'] >= 5) {
        $lastAttemptTime = strtotime($attemptRecord['last_attempt']);
        if (time() - $lastAttemptTime < 300) { // 300 detik = 5 menit
            http_response_code(429);
            echo json_encode(['status' => 'error', 'message' => 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.']);
            exit;
        } else {
            // Sudah lewat 5 menit, reset attempts
            $pdo->prepare("DELETE FROM login_attempts WHERE ip_address = :ip")->execute(['ip' => $ip]);
        }
    }

    $stmt = $pdo->prepare("
        SELECT 
            u.id, u.full_name, u.username, u.email, u.role_type, u.avatar_url, u.face_descriptor, u.token_version, u.password_hash,
            s.nisn, s.nis, s.gender, s.birth_place, s.birth_date, s.behavior_points,
            c.name as class_name,
            m.name as major_name,
            ay.name as academic_year,
            g.nip_nuptk,
            (SELECT string_agg(DISTINCT sub.name, ', ') 
             FROM schedules sch 
             JOIN subjects sub ON sch.subject_id = sub.id 
             WHERE sch.teacher_id = u.id) as subjects,
            (SELECT cl.name FROM classes cl WHERE cl.homeroom_teacher_id = u.id LIMIT 1) as homeroom_class,
            (SELECT string_agg(sa.role_title::text, ', ') FROM structural_assignments sa WHERE sa.guru_id = u.id) as structural_roles
        FROM users u
        LEFT JOIN siswa_profiles s ON u.id = s.user_id
        LEFT JOIN guru_profiles g ON u.id = g.user_id
        LEFT JOIN class_students cs ON s.user_id = cs.student_id AND cs.status = 'AKTIF'
        LEFT JOIN classes c ON cs.class_id = c.id
        LEFT JOIN majors m ON c.major_id = m.id
        LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
        WHERE u.username = :username
        LIMIT 1
    ");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Hapus password_hash dari response agar aman
        unset($user['password_hash']);
        
        // Buat Device Fingerprint
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown_device';
        $fingerprint = md5($userAgent);

        // Buat Token JWT dengan Token Version & Fingerprint (TANPA LIMIT WAKTU)
        $payload = [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'token_version' => $user['token_version'],
            'device_fingerprint' => $fingerprint
        ];
        $token = generate_jwt($payload, $jwt_secret);

        // Hapus IP dari daftar blacklist (kalau ada)
        $pdo->prepare("DELETE FROM login_attempts WHERE ip_address = :ip")->execute(['ip' => $ip]);

        echo json_encode(['status' => 'success', 'token' => $token, 'data' => $user]);
    } else {
        // Catat kegagalan login
        $pdo->prepare("
            INSERT INTO login_attempts (ip_address, failed_attempts, last_attempt) 
            VALUES (:ip, 1, CURRENT_TIMESTAMP) 
            ON CONFLICT (ip_address) 
            DO UPDATE SET failed_attempts = login_attempts.failed_attempts + 1, last_attempt = CURRENT_TIMESTAMP
        ")->execute(['ip' => $ip]);

        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Username atau password salah']);
    }
    exit;
}

// Endpoint: Get Current User (Validasi Token)
if ($uri === '/api/user/me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Gunakan $_SERVER['HTTP_AUTHORIZATION'] karena apache_request_headers kadang tidak konsisten di built-in server PHP
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        
        if ($payload) {
            
            // Verifikasi Device Fingerprint
            $currentUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown_device';
            $currentFingerprint = md5($currentUserAgent);
            
            if (!isset($payload['device_fingerprint']) || $payload['device_fingerprint'] !== $currentFingerprint) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Device mismatch']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT 
                    u.id, u.full_name, u.username, u.email, u.role_type, u.avatar_url, u.face_descriptor, u.token_version,
                    s.nisn, s.nis, s.gender, s.birth_place, s.birth_date, s.behavior_points,
                    c.name as class_name, m.name as major_name, ay.name as academic_year,
                    g.nip_nuptk,
                    (SELECT string_agg(DISTINCT sub.name, ', ') 
                     FROM schedules sch 
                     JOIN subjects sub ON sch.subject_id = sub.id 
                     WHERE sch.teacher_id = u.id) as subjects,
                    (SELECT cl.name FROM classes cl WHERE cl.homeroom_teacher_id = u.id LIMIT 1) as homeroom_class,
                    (SELECT string_agg(sa.role_title::text, ', ') FROM structural_assignments sa WHERE sa.guru_id = u.id) as structural_roles
                FROM users u
                LEFT JOIN siswa_profiles s ON u.id = s.user_id
                LEFT JOIN guru_profiles g ON u.id = g.user_id
                LEFT JOIN class_students cs ON s.user_id = cs.student_id AND cs.status = 'AKTIF'
                LEFT JOIN classes c ON cs.class_id = c.id
                LEFT JOIN majors m ON c.major_id = m.id
                LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
                WHERE u.id = :id LIMIT 1
            ");
            $stmt->execute(['id' => $payload['user_id']]);
            $user = $stmt->fetch();
            
            if ($user) {
                // Verifikasi Token Version
                if (!isset($payload['token_version']) || (int)$payload['token_version'] !== (int)$user['token_version']) {
                    http_response_code(401);
                    echo json_encode(['status' => 'error', 'message' => 'Token revoked']);
                    exit;
                }

                echo json_encode(['status' => 'success', 'data' => $user]);
                exit;
            }
        }
    }
    
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

// Endpoint: Logout User (Revoke Token)
if ($uri === '/api/logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        
        if ($payload && isset($payload['user_id'])) {
            $stmt = $pdo->prepare("UPDATE users SET token_version = token_version + 1 WHERE id = :id");
            $stmt->execute(['id' => $payload['user_id']]);
            
            echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
            exit;
        }
    }
    
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

// Endpoint: Jurnal Guru
if ($uri === '/api/jurnal/guru') {
    // Auth Check
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
        }
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $kelas = $input['kelas'] ?? '';
        $mapel = $input['mapel'] ?? '';
        $materi = $input['materi'] ?? '';
        $catatan = $input['catatan'] ?? '';

        if (!$kelas || !$mapel || !$materi) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Kelas, mapel, dan materi wajib diisi']);
            exit;
        }

        // Simpan ke dummy logs (atau bisa insert ke tabel journals betulan)
        // Karena ini demo, kita simpan di tabel presensi_logs aja pakai format json, atau mock aja
        echo json_encode(['status' => 'success', 'message' => 'Jurnal berhasil disimpan']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Return dummy history for demo
        echo json_encode(['status' => 'success', 'data' => [
            [
                'kelas' => 'XII RPL 1',
                'mapel' => 'Pemrograman Dasar',
                'materi' => 'Fungsi Rekursif pada PHP',
                'catatan' => 'Sebagian siswa kesulitan memahami *base case*.',
                'tanggal' => date('d M Y')
            ],
            [
                'kelas' => 'XII RPL 2',
                'mapel' => 'Pemrograman Dasar',
                'materi' => 'Pengenalan Array Multidimensi',
                'catatan' => 'Tugas halaman 42.',
                'tanggal' => date('d M Y', strtotime('-1 day'))
            ]
        ]]);
        exit;
    }
}

// Endpoint: Daftar Tugas Guru
if ($uri === '/api/tugas/guru') {
    // Auth Check
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
        }
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $kelas = $input['kelas'] ?? '';
        $mapel = $input['mapel'] ?? '';
        $judul = $input['judul'] ?? '';
        $deskripsi = $input['deskripsi'] ?? '';
        $deadline = $input['deadline'] ?? '';

        if (!$kelas || !$mapel || !$judul || !$deskripsi || !$deadline) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Semua kolom wajib diisi']);
            exit;
        }

        // Mock success for demo
        echo json_encode(['status' => 'success', 'message' => 'Tugas berhasil dipublish']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Return dummy task history for demo
        echo json_encode(['status' => 'success', 'data' => [
            [
                'kelas' => 'XII RPL 1',
                'mapel' => 'Pemrograman Web',
                'judul' => 'Membuat Form Login React',
                'deskripsi' => 'Gunakan TailwindCSS untuk styling. Maksimal 1 file.',
                'deadline' => 'Besok, 23:59',
                'dikumpulkan' => 28,
                'totalSiswa' => 36
            ],
            [
                'kelas' => 'XII RPL 2',
                'mapel' => 'Pemrograman Dasar',
                'materi' => 'Fungsi Rekursif',
                'judul' => 'Latihan Soal Algoritma Rekursif',
                'deskripsi' => 'Kerjakan soal nomor 1-5 di LKS.',
                'deadline' => 'Hari ini, 15:00',
                'dikumpulkan' => 35,
                'totalSiswa' => 36
            ]
        ]]);
        exit;
    }
}

// Routes untuk data dari Postgres
if ($uri === '/api/presensi/riwayat' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? null;
    $faceDescriptor = $input['face_descriptor'] ?? null;

    if (!$userId || !$faceDescriptor) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'user_id and face_descriptor are required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET face_descriptor = :face_descriptor WHERE id = :id");
        $stmt->execute([
            'face_descriptor' => $faceDescriptor,
            'id' => $userId
        ]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Face descriptor updated successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to update face data: ' . $e->getMessage()]);
    }
    exit;
}

if ($uri === '/api/presensi' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['user_id'] ?? null;
    $lat = $input['lat'] ?? null;
    $lng = $input['lng'] ?? null;
    $snapshot = $input['snapshot'] ?? null;
    $deviceInfo = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

    if (!$userId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'user_id is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO presensi_logs (user_id, gps_lat, gps_lng, status, device_info, snapshot_url)
            VALUES (:user_id, :lat, :lng, 'MATCHED', :device_info, :snapshot)
            RETURNING id, scan_time
        ");
        $stmt->execute([
            'user_id' => $userId,
            'lat' => $lat,
            'lng' => $lng,
            'device_info' => $deviceInfo,
            'snapshot' => $snapshot
        ]);
        $result = $stmt->fetch();

        echo json_encode([
            'status' => 'success',
            'message' => 'Presensi berhasil disimpan',
            'data' => [
                'id' => $result['id'],
                'waktu' => $result['scan_time'],
                'lokasi' => "$lat, $lng",
                'wajah' => 'MATCHED'
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save presensi: ' . $e->getMessage()]);
    }
    exit;
}

if ($uri === '/api/jurnal' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                j.id,
                s.name AS subject,
                u.full_name AS teacher,
                j.topic_material AS topic,
                j.special_notes,
                j.teacher_message AS notes,
                TO_CHAR(j.start_time, 'HH24:MI') as start_time,
                TO_CHAR(j.end_time, 'HH24:MI') as end_time,
                j.created_at AS posted_at,
                EXISTS(SELECT 1 FROM journal_tasks jt WHERE jt.journal_id = j.id) AS has_task,
                (SELECT COUNT(*) FROM journal_comments jc WHERE jc.journal_id = j.id) AS comments,
                (SELECT COUNT(*) FROM journal_reviews jr WHERE jr.journal_id = j.id AND jr.rating >= 4) AS likes
            FROM journals j
            JOIN subjects s ON j.subject_id = s.id
            JOIN users u ON j.teacher_id = u.id
            ORDER BY j.created_at DESC
        ");
        $stmt->execute();
        $journals = $stmt->fetchAll();

        // Format dates and booleans correctly
        $formatted = array_map(function($j) {
            return [
                'id' => $j['id'],
                'time' => $j['start_time'] . ' - ' . $j['end_time'],
                'subject' => $j['subject'],
                'teacher' => $j['teacher'],
                'topic' => $j['topic'],
                'hasTask' => (bool)$j['has_task'],
                'notes' => $j['notes'],
                'postedAt' => $j['posted_at'], // In a real app, use relative time function
                'likes' => (int)$j['likes'],
                'comments' => (int)$j['comments']
            ];
        }, $journals);

        echo json_encode(['status' => 'success', 'data' => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch journals: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['app' => 'Anise API Server', 'version' => '1.0']);
