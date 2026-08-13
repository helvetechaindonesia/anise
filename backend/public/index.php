<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
            (SELECT string_agg(sa.role_title::text, ', ') FROM structural_assignments sa WHERE sa.guru_id = u.id) as structural_roles,
            (SELECT ROUND(AVG(jr.rating), 1) FROM journal_ratings jr JOIN journals j ON jr.journal_id = j.id WHERE j.teacher_id = u.id) as average_rating
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
                    (SELECT string_agg(sa.role_title::text, ', ') FROM structural_assignments sa WHERE sa.guru_id = u.id) as structural_roles,
                    (SELECT ROUND(AVG(jr.rating), 1) FROM journal_ratings jr JOIN journals j ON jr.journal_id = j.id WHERE j.teacher_id = u.id) as average_rating
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

// Endpoint: Presensi Harian Siswa/Guru
if ($uri === '/api/presensi' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    try {
        // Create table safely if not exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS attendances (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            tanggal DATE NOT NULL,
            jam_masuk TIMESTAMP,
            jam_pulang_awal TIMESTAMP,
            jam_masuk_kembali TIMESTAMP,
            jam_pulang_akhir TIMESTAMP,
            status VARCHAR(10) DEFAULT 'TAM',
            is_locked BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_tanggal UNIQUE (user_id, tanggal)
        )");

        // Cek apakah sudah ada absen hari ini
        $stmt = $pdo->prepare("SELECT id, jam_masuk, jam_pulang_awal, jam_masuk_kembali, jam_pulang_akhir FROM attendances WHERE user_id = :uid AND tanggal = CURRENT_DATE");
        $stmt->execute(['uid' => $userId]);
        $absen = $stmt->fetch();

        $status_absen = 'Masuk';
        if (!$absen) {
            $stmtInsert = $pdo->prepare("INSERT INTO attendances (user_id, tanggal, jam_masuk, status) VALUES (:uid, CURRENT_DATE, CURRENT_TIMESTAMP, 'HADIR')");
            $stmtInsert->execute(['uid' => $userId]);
        } else {
            // Update berdasarkan kolom yang kosong
            if (!$absen['jam_pulang_awal']) {
                $stmtUpdate = $pdo->prepare("UPDATE attendances SET jam_pulang_awal = CURRENT_TIMESTAMP WHERE id = :id");
                $stmtUpdate->execute(['id' => $absen['id']]);
                $status_absen = 'Pulang Awal';
            } else if (!$absen['jam_masuk_kembali']) {
                $stmtUpdate = $pdo->prepare("UPDATE attendances SET jam_masuk_kembali = CURRENT_TIMESTAMP WHERE id = :id");
                $stmtUpdate->execute(['id' => $absen['id']]);
                $status_absen = 'Masuk Kembali';
            } else if (!$absen['jam_pulang_akhir']) {
                $stmtUpdate = $pdo->prepare("UPDATE attendances SET jam_pulang_akhir = CURRENT_TIMESTAMP WHERE id = :id");
                $stmtUpdate->execute(['id' => $absen['id']]);
                $status_absen = 'Pulang Akhir';
            } else {
                $status_absen = 'Sudah Lengkap';
            }
        }
        
        echo json_encode([
            'status' => 'success', 
            'message' => 'Presensi berhasil disimpan',
            'data' => ['status_absen' => $status_absen]
        ]);
    } catch (PDOException $e) {
        // If table doesn't exist, we should probably run the create_attendances.sql file, but let's assume it exists or throw the DB error.
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Riwayat Presensi
if ($uri === '/api/presensi/riwayat' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        // Ensure table exists just in case they haven't posted yet
        $pdo->exec("CREATE TABLE IF NOT EXISTS attendances (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, tanggal DATE NOT NULL, jam_masuk TIMESTAMP, jam_pulang_awal TIMESTAMP, jam_masuk_kembali TIMESTAMP, jam_pulang_akhir TIMESTAMP, status VARCHAR(10) DEFAULT 'TAM', is_locked BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT unique_user_tanggal UNIQUE (user_id, tanggal))");

        $stmt = $pdo->prepare("SELECT * FROM attendances WHERE user_id = :uid ORDER BY tanggal DESC LIMIT 30");
        $stmt->execute(['uid' => $userId]);
        $rows = $stmt->fetchAll();

        $history = [];
        $stats = ['H' => 0, 'T' => 0, 'P' => 0, 'Pulang_Awal' => 0, 'Pulang' => 0, 'Kembali' => 0, 'TAM' => 0, 'TAP' => 0, 'TAMP' => 0, 'Sakit' => 0, 'Izin' => 0, 'Alpa' => 0];

        foreach($rows as $r) {
            $statusCode = $r['status'] === 'HADIR' ? 'H' : $r['status'];
            // Simple mapping for demo
            if(isset($stats[$statusCode])) $stats[$statusCode]++;
            else if ($statusCode === 'HADIR' || $statusCode === 'H') $stats['H']++;
            
            $history[] = [
                'id' => $r['id'],
                'status' => $statusCode,
                'tanggal' => date('d M Y', strtotime($r['tanggal'])),
                'jam' => $r['jam_masuk'] ? date('H:i', strtotime($r['jam_masuk'])) : '-',
                'metode' => 'Face ID'
            ];
        }

        echo json_encode([
            'status' => 'success',
            'data' => [
                'stats' => $stats,
                'history' => $history
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Teachers for Student (Guru yang mengajar kelas siswa)
if ($uri === '/api/siswa/guru' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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

    try {
        $stmt = $pdo->prepare("
            SELECT DISTINCT 
                u.id as teacher_id, 
                u.full_name as teacher_name, 
                u.avatar_url, 
                s.gender,
                (SELECT string_agg(DISTINCT sub.name, ', ') 
                 FROM schedules sch2 
                 JOIN subjects sub ON sch2.subject_id = sub.id 
                 WHERE sch2.teacher_id = u.id AND sch2.class_id = cs.class_id) as subjects,
                (
                    SELECT j.id 
                    FROM journals j 
                    WHERE j.teacher_id = u.id 
                      AND j.class_id = cs.class_id 
                      AND j.teaching_date = CURRENT_DATE 
                      AND j.start_time <= LOCALTIME 
                      AND j.end_time >= LOCALTIME
                    LIMIT 1
                ) as active_journal_id,
                EXISTS(
                    SELECT 1 
                    FROM journals j 
                    JOIN journal_attendances ja ON j.id = ja.journal_id 
                    WHERE j.teacher_id = u.id 
                      AND j.class_id = cs.class_id 
                      AND j.teaching_date = CURRENT_DATE 
                      AND j.start_time <= LOCALTIME 
                      AND j.end_time >= LOCALTIME
                      AND ja.student_id = :uid
                ) as has_presensi,
                (
                    SELECT MIN(j.start_time)
                    FROM journals j
                    WHERE j.teacher_id = u.id AND j.class_id = cs.class_id AND j.teaching_date = CURRENT_DATE AND j.start_time > LOCALTIME
                ) as next_journal_time,
                EXISTS(
                    SELECT 1 
                    FROM journals j2
                    WHERE j2.teacher_id = u.id 
                      AND j2.class_id = cs.class_id
                      AND (j2.teaching_date < CURRENT_DATE OR (j2.teaching_date = CURRENT_DATE AND j2.end_time < LOCALTIME))
                      AND NOT EXISTS (
                          SELECT 1 FROM journal_ratings jr WHERE jr.journal_id = j2.id AND jr.student_id = :uid
                      )
                ) as has_unrated_journal
            FROM schedules sch
            JOIN users u ON sch.teacher_id = u.id
            LEFT JOIN guru_profiles g ON u.id = g.user_id
            LEFT JOIN siswa_profiles s ON u.id = s.user_id
            JOIN class_students cs ON sch.class_id = cs.class_id
            WHERE cs.student_id = :uid AND cs.status = 'AKTIF'
        ");
        $stmt->execute(['uid' => $userId]);
        $teachers = $stmt->fetchAll();
        
        echo json_encode(['status' => 'success', 'data' => $teachers]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Jurnal Guru Meta (Get teacher's classes and subjects)
if ($uri === '/api/jurnal/guru/meta' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        // Find schedules for this teacher
        $stmt = $pdo->prepare("
            SELECT DISTINCT c.id as class_id, c.name as class_name, s.id as subject_id, s.name as subject_name
            FROM schedules sch
            JOIN classes c ON sch.class_id = c.id
            JOIN subjects s ON sch.subject_id = s.id
            WHERE sch.teacher_id = :uid AND sch.is_active = true
        ");
        $stmt->execute(['uid' => $userId]);
        $schedules = $stmt->fetchAll();

        // Group by classes and subjects to provide distinct lists
        $classes = [];
        $subjects = [];
        $classIds = [];
        $subjectIds = [];

        foreach ($schedules as $sch) {
            if (!in_array($sch['class_id'], $classIds)) {
                $classes[] = ['id' => $sch['class_id'], 'name' => $sch['class_name']];
                $classIds[] = $sch['class_id'];
            }
            if (!in_array($sch['subject_id'], $subjectIds)) {
                $subjects[] = ['id' => $sch['subject_id'], 'name' => $sch['subject_name']];
                $subjectIds[] = $sch['subject_id'];
            }
        }

        echo json_encode([
            'status' => 'success',
            'data' => [
                'classes' => $classes,
                'subjects' => $subjects
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
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
        $classId = $input['class_id'] ?? '';
        $subjectId = $input['subject_id'] ?? '';
        $materi = $input['materi'] ?? '';
        $catatan = $input['catatan'] ?? '';
        $startTime = $input['start_time'] ?? '';
        $endTime = $input['end_time'] ?? '';
        $link = $input['link'] ?? null;
        $imagesBase64 = $input['images_base64'] ?? [];
        
        $savedImages = [];
        if (is_array($imagesBase64) && !empty($imagesBase64)) {
            foreach ($imagesBase64 as $imgBase64) {
                if (preg_match('/^data:image\/(\w+);base64,/', $imgBase64, $type)) {
                    $imgData = substr($imgBase64, strpos($imgBase64, ',') + 1);
                    $ext = strtolower($type[1]);
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                        $imgData = base64_decode($imgData);
                        if ($imgData !== false) {
                            $filename = uniqid() . '.' . $ext;
                            $path = __DIR__ . '/uploads/journals/' . $filename;
                            file_put_contents($path, $imgData);
                            $savedImages[] = '/uploads/journals/' . $filename;
                        }
                    }
                }
            }
        }
        $imagesJson = empty($savedImages) ? null : json_encode($savedImages);

        if (!$classId || !$subjectId || !$materi || !$startTime || !$endTime) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Semua kolom (termasuk jam) wajib diisi']);
            exit;
        }

        try {
            // Check if there is a schedule ID for this match (optional, but good for data integrity)
            $stmtSch = $pdo->prepare("SELECT id FROM schedules WHERE teacher_id = :tid AND class_id = :cid AND subject_id = :sid LIMIT 1");
            $stmtSch->execute(['tid' => $userId, 'cid' => $classId, 'sid' => $subjectId]);
            $schedule = $stmtSch->fetch();
            $scheduleId = $schedule ? $schedule['id'] : null;

            $stmt = $pdo->prepare("
                INSERT INTO journals (schedule_id, teacher_id, class_id, subject_id, topic_material, teacher_message, teaching_date, start_time, end_time, link, images) 
                VALUES (:sch_id, :tid, :cid, :sid, :topic, :msg, CURRENT_DATE, :st, :et, :link, :img)
            ");
            $stmt->execute([
                'sch_id' => $scheduleId,
                'tid' => $userId,
                'cid' => $classId,
                'sid' => $subjectId,
                'topic' => $materi,
                'msg' => $catatan,
                'st' => $startTime,
                'et' => $endTime,
                'link' => $link,
                'img' => $imagesJson
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Jurnal berhasil disimpan']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save journal: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $stmt = $pdo->prepare("
                SELECT j.id, j.topic_material, j.teacher_message, c.name as class_name, s.name as subject_name, j.created_at,
                       TO_CHAR(j.start_time, 'HH24:MI') as start_time, TO_CHAR(j.end_time, 'HH24:MI') as end_time, j.teaching_date,
                       j.link, j.images,
                       (SELECT COUNT(*) FROM journal_comments jc WHERE jc.journal_id = j.id) AS comments_count
                FROM journals j
                JOIN classes c ON j.class_id = c.id
                JOIN subjects s ON j.subject_id = s.id
                WHERE j.teacher_id = :tid
                ORDER BY j.created_at DESC
            ");
            $stmt->execute(['tid' => $userId]);
            $journals = $stmt->fetchAll();

            $formatted = array_map(function($j) {
                $dateObj = new DateTime($j['created_at']);
                $days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
                $months = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                $formattedDate = $days[$dateObj->format('w')] . ', ' . $dateObj->format('j') . ' ' . $months[$dateObj->format('n')] . ' ' . $dateObj->format('Y');

                $images = [];
                if (!empty($j['images'])) {
                    $images = json_decode($j['images'], true) ?: [];
                }

                return [
                    'id' => $j['id'],
                    'kelas' => $j['class_name'],
                    'mapel' => $j['subject_name'],
                    'materi' => $j['topic_material'],
                    'catatan' => $j['teacher_message'],
                    'tanggal' => $formattedDate,
                    'start_time' => $j['start_time'],
                    'end_time' => $j['end_time'],
                    'teaching_date' => $j['teaching_date'],
                    'link' => $j['link'],
                    'images' => $images,
                    'comments_count' => (int)$j['comments_count']
                ];
            }, $journals);

            echo json_encode(['status' => 'success', 'data' => $formatted]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch journals: ' . $e->getMessage()]);
        }
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
        $journalId = $input['journal_id'] ?? '';
        $judul = $input['judul'] ?? '';
        $deskripsi = $input['deskripsi'] ?? '';
        $deadline = $input['deadline'] ?? '';

        if (!$journalId || !$judul || !$deskripsi || !$deadline) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Semua kolom wajib diisi']);
            exit;
        }

        try {
            // Cek apakah jurnal sudah punya tugas
            $stmtCheck = $pdo->prepare("SELECT id FROM journal_tasks WHERE journal_id = :jid");
            $stmtCheck->execute(['jid' => $journalId]);
            if ($stmtCheck->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Jurnal ini sudah memiliki tugas. 1 Jurnal maksimal 1 tugas.']);
                exit;
            }

            $stmtIns = $pdo->prepare("
                INSERT INTO journal_tasks (journal_id, title, instructions, due_date)
                VALUES (:jid, :title, :inst, :due)
            ");
            $stmtIns->execute([
                'jid' => $journalId,
                'title' => $judul,
                'inst' => $deskripsi,
                'due' => $deadline
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Tugas berhasil dipublish']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save task: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $stmt = $pdo->prepare("
                SELECT 
                    jt.id as task_id,
                    jt.title as judul,
                    jt.instructions as deskripsi,
                    jt.due_date as deadline,
                    j.topic_material as materi,
                    c.name as kelas,
                    c.id as class_id,
                    s.name as mapel,
                    (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = j.class_id AND cs.status = 'AKTIF') as total_siswa,
                    (SELECT COUNT(*) FROM student_task_submissions sts WHERE sts.journal_task_id = jt.id) as dikumpulkan
                FROM journal_tasks jt
                JOIN journals j ON jt.journal_id = j.id
                JOIN classes c ON j.class_id = c.id
                JOIN subjects s ON j.subject_id = s.id
                WHERE j.teacher_id = :tid
                ORDER BY jt.created_at DESC
            ");
            $stmt->execute(['tid' => $userId]);
            $tasks = $stmt->fetchAll();

            $formatted = array_map(function($t) {
                $dueObj = new DateTime($t['deadline']);
                return [
                    'id' => $t['task_id'],
                    'kelas' => $t['kelas'],
                    'mapel' => $t['mapel'],
                    'materi' => $t['materi'],
                    'judul' => $t['judul'],
                    'deskripsi' => $t['deskripsi'],
                    'deadline' => $dueObj->format('d M, H:i') . ' WIB',
                    'dikumpulkan' => (int)$t['dikumpulkan'],
                    'totalSiswa' => (int)$t['total_siswa']
                ];
            }, $tasks);

            echo json_encode(['status' => 'success', 'data' => $formatted]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch tasks: ' . $e->getMessage()]);
        }
        exit;
    }
}

// Endpoint: Daftar Tugas Siswa
if ($uri === '/api/tugas' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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

    try {
        $stmt = $pdo->prepare("
            SELECT 
                jt.id as task_id,
                s.name as subject,
                jt.title,
                jt.due_date,
                jt.instructions as desc,
                jt.max_score as points,
                (SELECT status FROM student_task_submissions sts WHERE sts.journal_task_id = jt.id AND sts.student_id = :uid LIMIT 1) as submission_status,
                (SELECT file_url FROM student_task_submissions sts WHERE sts.journal_task_id = jt.id AND sts.student_id = :uid LIMIT 1) as submitted_file
            FROM journal_tasks jt
            JOIN journals j ON jt.journal_id = j.id
            JOIN subjects s ON j.subject_id = s.id
            WHERE j.class_id IN (
                SELECT class_id FROM class_students WHERE student_id = :uid AND status = 'AKTIF'
            )
            ORDER BY jt.due_date DESC
        ");
        $stmt->execute(['uid' => $userId]);
        $tasks = $stmt->fetchAll();

        $formatted = array_map(function($t) {
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $dueObj = new DateTime($t['due_date']);
            
            $status = 'Belum Dikerjakan';
            if ($t['submission_status']) {
                if ($t['submission_status'] === 'MINTA_IZIN') {
                    $status = 'Minta Izin';
                } else if ($t['submission_status'] === 'IZIN_DIBERIKAN') {
                    $status = 'Izin Diberikan';
                } else if ($t['submission_status'] === 'IZIN_DITOLAK') {
                    $status = 'Izin Ditolak';
                } else {
                    $status = 'Selesai';
                }
            } else if ($now > $dueObj) {
                $status = 'Terlewat';
            }

            return [
                'id' => $t['task_id'],
                'subject' => $t['subject'],
                'title' => $t['title'],
                'due' => $dueObj->format('d M, H:i') . ' WIB',
                'desc' => $t['desc'],
                'points' => (int)$t['points'],
                'status' => $status,
                'submittedFile' => $t['submitted_file']
            ];
        }, $tasks);

        echo json_encode(['status' => 'success', 'data' => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch tasks: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Submit Tugas Siswa
if ($uri === '/api/tugas/submit' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $input = json_decode(file_get_contents('php://input'), true);
    $taskId = $input['task_id'] ?? '';
    $fileBase64 = $input['file_base64'] ?? '';
    $submissionText = $input['submission_text'] ?? '';

    if (!$taskId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Task ID required']);
        exit;
    }

    $fileUrl = null;
    if (!empty($fileBase64)) {
        if (preg_match('/^data:(\w+\/[\w.-]+);base64,/', $fileBase64, $type)) {
            $fileData = substr($fileBase64, strpos($fileBase64, ',') + 1);
            $mime = strtolower($type[1]);
            
            // Map MIME to extension
            $extMap = [
                'application/pdf' => 'pdf',
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'application/msword' => 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx'
            ];
            
            $ext = $extMap[$mime] ?? 'bin';
            $fileDataDecoded = base64_decode($fileData);
            if ($fileDataDecoded !== false) {
                // Ensure directory exists
                $dir = __DIR__ . '/uploads/tugas';
                if (!is_dir($dir)) {
                    mkdir($dir, 0777, true);
                }
                $filename = uniqid() . '.' . $ext;
                $path = $dir . '/' . $filename;
                file_put_contents($path, $fileDataDecoded);
                $fileUrl = '/uploads/tugas/' . $filename;
            }
        }
    }

    try {
        $stmtCheck = $pdo->prepare("SELECT id, status FROM student_task_submissions WHERE journal_task_id = :tid AND student_id = :uid");
        $stmtCheck->execute(['tid' => $taskId, 'uid' => $userId]);
        $existing = $stmtCheck->fetch();
        
        if ($existing) {
            if ($existing['status'] === 'IZIN_DIBERIKAN') {
                $stmtUpd = $pdo->prepare("
                    UPDATE student_task_submissions 
                    SET file_url = :file, submission_text = :txt, status = 'TERLAMBAT', submitted_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                ");
                $stmtUpd->execute([
                    'id' => $existing['id'],
                    'file' => $fileUrl,
                    'txt' => $submissionText
                ]);
                echo json_encode(['status' => 'success', 'message' => 'Tugas terlambat berhasil dikumpulkan']);
                exit;
            } else {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Anda sudah mengumpulkan tugas ini atau sedang menunggu izin.']);
                exit;
            }
        }

        $stmtIns = $pdo->prepare("
            INSERT INTO student_task_submissions (journal_task_id, student_id, submission_text, file_url, submitted_at, status)
            VALUES (:tid, :uid, :txt, :file, CURRENT_TIMESTAMP, 'DIKIRIM')
        ");
        $stmtIns->execute([
            'tid' => $taskId,
            'uid' => $userId,
            'txt' => $submissionText,
            'file' => $fileUrl
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Tugas berhasil dikumpulkan']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to submit task: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Minta Izin Terlambat
if ($uri === '/api/tugas/request-late' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $input = json_decode(file_get_contents('php://input'), true);
    $taskId = $input['task_id'] ?? '';
    $reason = $input['reason'] ?? '';

    if (!$taskId || !$reason) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Task ID dan Alasan wajib diisi']);
        exit;
    }

    try {
        $stmtCheck = $pdo->prepare("SELECT id FROM student_task_submissions WHERE journal_task_id = :tid AND student_id = :uid");
        $stmtCheck->execute(['tid' => $taskId, 'uid' => $userId]);
        
        if ($stmtCheck->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Anda sudah pernah request atau mengumpulkan tugas ini']);
            exit;
        }

        $stmtIns = $pdo->prepare("
            INSERT INTO student_task_submissions (journal_task_id, student_id, submission_text, submitted_at, status)
            VALUES (:tid, :uid, :txt, CURRENT_TIMESTAMP, 'MINTA_IZIN')
        ");
        $stmtIns->execute([
            'tid' => $taskId,
            'uid' => $userId,
            'txt' => $reason
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Permintaan izin berhasil dikirim ke guru']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to request late submission: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Notifikasi Guru
if ($uri === '/api/notifikasi/guru' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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

    try {
        $stmt = $pdo->prepare("
            SELECT 
                sts.id as submission_id,
                sts.submission_text as reason,
                sts.submitted_at,
                u.full_name as student_name,
                c.name as class_name,
                jt.title as task_title
            FROM student_task_submissions sts
            JOIN users u ON sts.student_id = u.id
            JOIN journal_tasks jt ON sts.journal_task_id = jt.id
            JOIN journals j ON jt.journal_id = j.id
            JOIN classes c ON j.class_id = c.id
            WHERE j.teacher_id = :tid AND sts.status = 'MINTA_IZIN'
            ORDER BY sts.submitted_at DESC
        ");
        $stmt->execute(['tid' => $userId]);
        $requests = $stmt->fetchAll();

        $notifications = array_map(function($req) {
            $dateObj = new DateTime($req['submitted_at']);
            return [
                'id' => $req['submission_id'],
                'type' => 'izin_tugas',
                'title' => 'Permintaan Izin Terlambat',
                'time' => $dateObj->format('d M, H:i'),
                'desc' => "{$req['student_name']} ({$req['class_name']}) meminta izin untuk mengumpulkan tugas '{$req['task_title']}' terlambat.\nAlasan: \"{$req['reason']}\""
            ];
        }, $requests);

        echo json_encode(['status' => 'success', 'data' => $notifications]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch notifications: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Approve Late Submission
if ($uri === '/api/tugas/approve-late' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $input = json_decode(file_get_contents('php://input'), true);
    $submissionId = $input['submission_id'] ?? '';
    $statusApproval = $input['status'] ?? ''; // 'Setuju' | 'Tolak'
    $note = $input['note'] ?? '';

    if (!$submissionId || !in_array($statusApproval, ['Setuju', 'Tolak'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid parameters']);
        exit;
    }

    try {
        $dbStatus = ($statusApproval === 'Setuju') ? 'IZIN_DIBERIKAN' : 'IZIN_DITOLAK';
        $stmt = $pdo->prepare("
            UPDATE student_task_submissions 
            SET status = :st, teacher_note = :note 
            WHERE id = :id AND status = 'MINTA_IZIN'
        ");
        $stmt->execute([
            'st' => $dbStatus,
            'note' => $note,
            'id' => $submissionId
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Berhasil memproses permintaan izin']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to approve: ' . $e->getMessage()]);
    }
    exit;
}

// Routes untuk data dari Postgres
if ($uri === '/api/presensi/riwayat' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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

    $currentMonth = date('m');
    $currentYear = date('Y');

    // 1. Get Stats for current month
    $stmtStats = $pdo->prepare("
        SELECT status, jam_pulang_akhir, jam_pulang_awal, jam_masuk_kembali
        FROM attendances 
        WHERE user_id = :uid 
          AND EXTRACT(MONTH FROM tanggal) = :m 
          AND EXTRACT(YEAR FROM tanggal) = :y
    ");
    $stmtStats->execute(['uid' => $userId, 'm' => $currentMonth, 'y' => $currentYear]);
    $attendances = $stmtStats->fetchAll();

    $stats = [
        'H' => 0, 'T' => 0, 'TAM' => 0, 'TAP' => 0, 'TAMP' => 0, 'Pulang' => 0, 'Pulang_Awal' => 0, 'Kembali' => 0, 'Sakit' => 0, 'Izin' => 0, 'Alpa' => 0
    ];

    foreach ($attendances as $att) {
        $st = $att['status'];
        if (isset($stats[$st])) $stats[$st]++;
        if ($att['jam_pulang_akhir'] !== null) $stats['Pulang']++;
        if ($att['jam_pulang_awal'] !== null) $stats['Pulang_Awal']++;
        if ($att['jam_masuk_kembali'] !== null) $stats['Kembali']++;
    }

    // 2. Get History (Last 30 days)
    $stmtHist = $pdo->prepare("
        SELECT id, tanggal, jam_masuk, jam_pulang_akhir, jam_pulang_awal, status
        FROM attendances
        WHERE user_id = :uid
        ORDER BY tanggal DESC
        LIMIT 30
    ");
    $stmtHist->execute(['uid' => $userId]);
    $historyRaw = $stmtHist->fetchAll();

    $history = [];
    foreach ($historyRaw as $row) {
        $dateObj = new DateTime($row['tanggal']);
        $days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        $months = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $formattedDate = $days[$dateObj->format('w')] . ', ' . $dateObj->format('j') . ' ' . $months[$dateObj->format('n')] . ' ' . $dateObj->format('Y');

        $timeStr = null;
        if ($row['jam_masuk']) {
            $timeObj = new DateTime($row['jam_masuk']);
            $timeStr = $timeObj->format('H:i') . ' WIB';
        } else if ($row['jam_pulang_akhir']) {
            $timeObj = new DateTime($row['jam_pulang_akhir']);
            $timeStr = $timeObj->format('H:i') . ' WIB';
        } else if ($row['jam_pulang_awal']) {
            $timeObj = new DateTime($row['jam_pulang_awal']);
            $timeStr = $timeObj->format('H:i') . ' WIB';
        }

        $history[] = [
            'id' => $row['id'],
            'tanggal' => $formattedDate,
            'status' => $row['status'],
            'jam' => $timeStr,
            'metode' => 'Wajah & GPS Terverifikasi'
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data' => [
            'stats' => $stats,
            'history' => $history
        ]
    ]);
    exit;
}
if ($uri === '/api/user/face' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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
        $pdo->beginTransaction();

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
        $scan_time = $result['scan_time'];

        $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
        $currentTime = $now->format('H:i:s');
        $currentDate = $now->format('Y-m-d');
        $currentTimestamp = $now->format('Y-m-d H:i:s');

        $stmt = $pdo->prepare("SELECT * FROM attendances WHERE user_id = :user_id AND tanggal = :tanggal");
        $stmt->execute(['user_id' => $userId, 'tanggal' => $currentDate]);
        $attendance = $stmt->fetch();

        $state_status = '';

        if (!$attendance) {
            if ($currentTime > '12:00:00') {
                if ($currentTime < '15:30:00') {
                    $state_status = 'TAM';
                    $stmt = $pdo->prepare("INSERT INTO attendances (user_id, tanggal, jam_pulang_awal, status, is_locked) VALUES (:uid, :tgl, :ts, :st, false)");
                } else {
                    $state_status = 'TAM';
                    $stmt = $pdo->prepare("INSERT INTO attendances (user_id, tanggal, jam_pulang_akhir, status, is_locked) VALUES (:uid, :tgl, :ts, :st, true)");
                }
                $stmt->execute(['uid' => $userId, 'tgl' => $currentDate, 'ts' => $currentTimestamp, 'st' => $state_status]);
            } else {
                $state_status = ($currentTime > '07:00:00') ? 'TAMP' : 'TAP';
                $stmt = $pdo->prepare("INSERT INTO attendances (user_id, tanggal, jam_masuk, status, is_locked) VALUES (:uid, :tgl, :ts, :st, false)");
                $stmt->execute(['uid' => $userId, 'tgl' => $currentDate, 'ts' => $currentTimestamp, 'st' => $state_status]);
            }
        } else {
            if ($attendance['is_locked']) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Presensi hari ini sudah selesai']);
                exit;
            }

            if ($currentTime < '15:30:00') {
                if (!$attendance['jam_pulang_awal']) {
                    $state_status = 'P';
                    $stmt = $pdo->prepare("UPDATE attendances SET jam_pulang_awal = :ts, status = :st WHERE id = :id");
                } else {
                    $jam_masuk_time = $attendance['jam_masuk'] ? (new DateTime($attendance['jam_masuk']))->format('H:i:s') : null;
                    if (!$jam_masuk_time) $state_status = 'TAM';
                    else if ($jam_masuk_time > '07:00:00') $state_status = 'TAMP';
                    else $state_status = 'TAP';
                    
                    $stmt = $pdo->prepare("UPDATE attendances SET jam_masuk_kembali = :ts, status = :st WHERE id = :id");
                }
                $stmt->execute(['ts' => $currentTimestamp, 'st' => $state_status, 'id' => $attendance['id']]);
            } else {
                $jam_masuk_time = $attendance['jam_masuk'] ? (new DateTime($attendance['jam_masuk']))->format('H:i:s') : null;
                if (!$jam_masuk_time) {
                    $state_status = 'TAM';
                } else {
                    if ($jam_masuk_time > '07:00:00') {
                        $state_status = ($currentTime > '18:00:00') ? 'TAMP' : 'T';
                    } else {
                        $state_status = 'H';
                    }
                }
                $stmt = $pdo->prepare("UPDATE attendances SET jam_pulang_akhir = :ts, status = :st, is_locked = true WHERE id = :id");
                $stmt->execute(['ts' => $currentTimestamp, 'st' => $state_status, 'id' => $attendance['id']]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Presensi berhasil disimpan',
            'data' => [
                'id' => $result['id'],
                'waktu' => $scan_time,
                'lokasi' => "$lat, $lng",
                'wajah' => 'MATCHED',
                'status_absen' => $state_status
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save presensi: ' . $e->getMessage()]);
    }
    exit;
}

if ($uri === '/api/jurnal' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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
                j.teaching_date,
                j.link, j.images,
                j.created_at AS posted_at,
                EXISTS(SELECT 1 FROM journal_tasks jt WHERE jt.journal_id = j.id) AS has_task,
                (SELECT COUNT(*) FROM journal_comments jc WHERE jc.journal_id = j.id) AS comments,
                (SELECT COUNT(*) FROM journal_reviews jr WHERE jr.journal_id = j.id AND jr.rating = 5) AS likes,
                EXISTS(SELECT 1 FROM journal_reviews jr2 WHERE jr2.journal_id = j.id AND jr2.student_id = :uid AND jr2.rating = 5) AS is_liked_by_me,
                EXISTS(SELECT 1 FROM journal_attendances ja WHERE ja.journal_id = j.id AND ja.student_id = :uid) AS has_scanned,
                EXISTS(SELECT 1 FROM journal_ratings jrat WHERE jrat.journal_id = j.id AND jrat.student_id = :uid) AS has_rated
            FROM journals j
            JOIN subjects s ON j.subject_id = s.id
            JOIN users u ON j.teacher_id = u.id
            WHERE j.class_id IN (
                SELECT class_id FROM class_students WHERE student_id = :uid AND status = 'AKTIF'
            )
            ORDER BY j.created_at DESC
        ");
        $stmt->execute(['uid' => $userId]);
        $journals = $stmt->fetchAll();

        // Format dates and booleans correctly
        $formatted = array_map(function($j) {
            $images = [];
            if (!empty($j['images'])) {
                $images = json_decode($j['images'], true) ?: [];
            }
            return [
                'id' => $j['id'],
                'time' => $j['start_time'] . ' - ' . $j['end_time'],
                'subject' => $j['subject'],
                'teacher' => $j['teacher'],
                'topic' => $j['topic'],
                'hasTask' => (bool)$j['has_task'],
                'notes' => $j['notes'],
                'link' => $j['link'],
                'images' => $images,
                'postedAt' => $j['posted_at'], // In a real app, use relative time function
                'likes' => (int)$j['likes'],
                'comments' => (int)$j['comments'],
                'isLiked' => (bool)$j['is_liked_by_me'],
                'start_time' => $j['start_time'],
                'end_time' => $j['end_time'],
                'teaching_date' => $j['teaching_date'],
                'has_scanned' => (bool)$j['has_scanned'],
                'has_rated' => (bool)$j['has_rated']
            ];
        }, $journals);

        echo json_encode(['status' => 'success', 'data' => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch journals: ' . $e->getMessage()]);
    }
    exit;
    exit;
}

// Endpoint: Beri Penilaian Jurnal
if ($uri === '/api/jurnal/rate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $input = json_decode(file_get_contents('php://input'), true);
    $journal_id = $input['journal_id'] ?? '';
    $rating = (int)($input['rating'] ?? 0);
    $comment = $input['comment'] ?? '';

    if (!$journal_id || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap atau rating tidak valid']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO journal_ratings (journal_id, student_id, rating, comment)
            VALUES (:jid, :uid, :rating, :comment)
            ON CONFLICT (journal_id, student_id) 
            DO UPDATE SET rating = :rating, comment = :comment
        ");
        $stmt->execute([
            'jid' => $journal_id,
            'uid' => $userId,
            'rating' => $rating,
            'comment' => $comment
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Penilaian berhasil disimpan']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to rate journal: ' . $e->getMessage()]);
    }
    exit;
}

// Endpoint: Like Jurnal
if ($uri === '/api/jurnal/like' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $journalId = $input['journal_id'] ?? '';

    if (!$journalId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Journal ID required']);
        exit;
    }

    try {
        $stmtCheck = $pdo->prepare("SELECT id FROM journal_reviews WHERE journal_id = :jid AND student_id = :uid AND rating = 5");
        $stmtCheck->execute(['jid' => $journalId, 'uid' => $userId]);
        
        if ($stmtCheck->rowCount() > 0) {
            // Unlike
            $stmtDel = $pdo->prepare("DELETE FROM journal_reviews WHERE journal_id = :jid AND student_id = :uid AND rating = 5");
            $stmtDel->execute(['jid' => $journalId, 'uid' => $userId]);
            echo json_encode(['status' => 'success', 'action' => 'unliked']);
        } else {
            // Like
            $stmtIns = $pdo->prepare("INSERT INTO journal_reviews (journal_id, student_id, rating) VALUES (:jid, :uid, 5)");
            $stmtIns->execute(['jid' => $journalId, 'uid' => $userId]);
            echo json_encode(['status' => 'success', 'action' => 'liked']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Add Comment
if ($uri === '/api/jurnal/comment' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $journalId = $input['journal_id'] ?? '';
    $text = $input['comment_text'] ?? '';

    if (!$journalId || !$text) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Data incomplete']);
        exit;
    }

    try {
        $stmtCheck = $pdo->prepare("SELECT id FROM journal_comments WHERE journal_id = :jid AND user_id = :uid");
        $stmtCheck->execute(['jid' => $journalId, 'uid' => $userId]);
        
        if ($stmtCheck->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Anda sudah memberikan komentar di jurnal ini']);
            exit;
        }

        $stmtIns = $pdo->prepare("INSERT INTO journal_comments (journal_id, user_id, comment_text) VALUES (:jid, :uid, :txt)");
        $stmtIns->execute(['jid' => $journalId, 'uid' => $userId, 'txt' => $text]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Comments
if (preg_match('#^/api/jurnal/comments\?journal_id=(.*)$#', $_SERVER['REQUEST_URI'], $matches) || 
    (isset($_GET['journal_id']) && $uri === '/api/jurnal/comments')) {
    
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matchesAuth)) {
        $jwt = $matchesAuth[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    $journalId = isset($_GET['journal_id']) ? $_GET['journal_id'] : $matches[1];
    
    try {
        $stmt = $pdo->prepare("
            SELECT jc.id, jc.comment_text, jc.created_at, jc.user_id AS author_id, u.full_name, u.role_type AS role, j.teacher_id
            FROM journal_comments jc
            JOIN users u ON jc.user_id = u.id
            JOIN journals j ON jc.journal_id = j.id
            WHERE jc.journal_id = :jid
            ORDER BY jc.created_at ASC
        ");
        $stmt->execute(['jid' => $journalId]);
        $comments = $stmt->fetchAll();
        
        $formatted = array_map(function($c) use ($userId) {
            return [
                'id' => $c['id'],
                'text' => $c['comment_text'],
                'author' => $c['full_name'],
                'role' => $c['role'],
                'time' => (new DateTime($c['created_at']))->format('d M H:i'),
                'can_edit' => $userId && $userId === $c['author_id'],
                'can_delete' => $userId && ($userId === $c['author_id'] || $userId === $c['teacher_id'])
            ];
        }, $comments);

        echo json_encode(['status' => 'success', 'data' => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Update Comment
if ($uri === '/api/jurnal/comment' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $commentId = $input['comment_id'] ?? '';
    $text = $input['comment_text'] ?? '';

    if (!$commentId || !$text) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Data incomplete']);
        exit;
    }

    try {
        $stmtCheck = $pdo->prepare("SELECT id FROM journal_comments WHERE id = :id AND user_id = :uid");
        $stmtCheck->execute(['id' => $commentId, 'uid' => $userId]);
        
        if ($stmtCheck->rowCount() === 0) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Anda tidak berhak mengedit komentar ini']);
            exit;
        }

        $stmtUpd = $pdo->prepare("UPDATE journal_comments SET comment_text = :txt, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
        $stmtUpd->execute(['txt' => $text, 'id' => $commentId]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Delete Comment
if ($uri === '/api/jurnal/comment' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $commentId = $input['comment_id'] ?? '';

    if (!$commentId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Data incomplete']);
        exit;
    }

    try {
        $stmtCheck = $pdo->prepare("
            SELECT jc.user_id AS author_id, j.teacher_id 
            FROM journal_comments jc 
            JOIN journals j ON jc.journal_id = j.id 
            WHERE jc.id = :id
        ");
        $stmtCheck->execute(['id' => $commentId]);
        $row = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Komentar tidak ditemukan']);
            exit;
        }

        if ($userId !== $row['author_id'] && $userId !== $row['teacher_id']) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Anda tidak berhak menghapus komentar ini']);
            exit;
        }

        $stmtDel = $pdo->prepare("DELETE FROM journal_comments WHERE id = :id");
        $stmtDel->execute(['id' => $commentId]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Generate QR Jurnal
if ($uri === '/api/jurnal/qr' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $journalId = $_GET['journal_id'] ?? '';
    $iteration = $_GET['iteration'] ?? '1';
    if (!$journalId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Journal ID missing']);
        exit;
    }

    $timestamp = time();
    $dataToSign = $journalId . ':' . $timestamp . ':' . $iteration;
    $signature = hash_hmac('sha256', $dataToSign, $jwt_secret);
    
    echo json_encode(['status' => 'success', 'data' => ['qr_data' => $dataToSign . ':' . $signature]]);
    exit;
}

// Endpoint: Scan QR Jurnal
if ($uri === '/api/jurnal/scan' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $qrData = $input['qr_data'] ?? '';
    
    $parts = explode(':', $qrData);
    if (count($parts) !== 4) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'QR tidak valid atau rusak']);
        exit;
    }
    
    list($journalId, $timestamp, $iteration, $signature) = $parts;
    
    $expectedSignature = hash_hmac('sha256', "$journalId:$timestamp:$iteration", $jwt_secret);
    if (!hash_equals($expectedSignature, $signature)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'QR dimanipulasi']);
        exit;
    }
    
    if (time() - intval($timestamp) > 900) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'QR kadaluarsa, minta guru untuk refresh layar']);
        exit;
    }
    
    if (intval($iteration) > 1) {
        echo json_encode(['status' => 'late_required_reason', 'message' => 'Anda terlambat.', 'journal_id' => $journalId]);
        exit;
    }

    try {
        $stmtIns = $pdo->prepare("INSERT INTO journal_attendances (journal_id, student_id, status) VALUES (:jid, :uid, 'HADIR') ON CONFLICT (journal_id, student_id) DO NOTHING");
        $stmtIns->execute(['jid' => $journalId, 'uid' => $userId]);
        echo json_encode(['status' => 'success', 'message' => 'Kehadiran berhasil dicatat!']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal mencatat kehadiran']);
    }
    exit;
}

// Endpoint: Submit Alasan Keterlambatan Jurnal
if ($uri === '/api/jurnal/scan_reason' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verify_jwt($jwt, $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $journalId = $input['journal_id'] ?? '';
    $reason = $input['reason'] ?? '';

    if (!$journalId || !$reason) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Alasan wajib diisi']);
        exit;
    }

    try {
        $stmtIns = $pdo->prepare("INSERT INTO journal_attendances (journal_id, student_id, status, reason) VALUES (:jid, :uid, 'TERLAMBAT', :reason) ON CONFLICT (journal_id, student_id) DO UPDATE SET status = 'TERLAMBAT', reason = :reason");
        $stmtIns->execute(['jid' => $journalId, 'uid' => $userId, 'reason' => $reason]);
        echo json_encode(['status' => 'success', 'message' => 'Kehadiran (Terlambat) berhasil dicatat!']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal mencatat kehadiran']);
    }
    exit;
}

// ==========================================
// HABITS (PEMBIASAAN) ENDPOINTS
// ==========================================

// Endpoint: Get Habits for Today
if ($uri === '/api/siswa/habits' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT habit_id FROM student_habits WHERE student_id = :uid AND date = CURRENT_DATE");
        $stmt->execute(['uid' => $userId]);
        $doneToday = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmtStreak = $pdo->prepare("SELECT habit_id, COUNT(*) as streak FROM student_habits WHERE student_id = :uid AND date >= CURRENT_DATE - INTERVAL '30 days' GROUP BY habit_id");
        $stmtStreak->execute(['uid' => $userId]);
        $streaksData = $stmtStreak->fetchAll();
        $streaks = [];
        foreach ($streaksData as $row) {
            $streaks[$row['habit_id']] = (int)$row['streak'];
        }

        echo json_encode(['status' => 'success', 'done_today' => $doneToday, 'streaks' => $streaks]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Toggle Habit
if ($uri === '/api/siswa/habits/toggle' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $habitId = $input['habit_id'] ?? '';
    $isDone = $input['is_done'] ?? false;

    if (!$habitId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'habit_id is required']);
        exit;
    }

    try {
        if ($isDone) {
            $stmt = $pdo->prepare("INSERT INTO student_habits (student_id, habit_id, date) VALUES (:uid, :hid, CURRENT_DATE) ON CONFLICT DO NOTHING");
        } else {
            $stmt = $pdo->prepare("DELETE FROM student_habits WHERE student_id = :uid AND habit_id = :hid AND date = CURRENT_DATE");
        }
        $stmt->execute(['uid' => $userId, 'hid' => $habitId]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Monthly Habits
if ($uri === '/api/siswa/habits/month' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');

    try {
        $stmt = $pdo->prepare("
            SELECT date, COUNT(habit_id) as count 
            FROM student_habits 
            WHERE student_id = :uid 
              AND EXTRACT(MONTH FROM date) = :month 
              AND EXTRACT(YEAR FROM date) = :year
            GROUP BY date
            ORDER BY date ASC
        ");
        $stmt->execute(['uid' => $userId, 'month' => $month, 'year' => $year]);
        $dailyCounts = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $dailyCounts]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Poin & Prestasi Siswa
if ($uri === '/api/poin' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        // Get Active Academic Year
        $stmtAY = $pdo->prepare("SELECT id FROM academic_years WHERE is_active = true LIMIT 1");
        $stmtAY->execute();
        $ay = $stmtAY->fetch();
        $ayId = $ay ? $ay['id'] : null;

        // Calculate Totals
        $stmtTotals = $pdo->prepare("
            SELECT type, SUM(points_change) as total
            FROM student_point_logs
            WHERE student_id = :uid AND academic_year_id = :ayid AND status = 'APPROVED'
            GROUP BY type
        ");
        $stmtTotals->execute(['uid' => $userId, 'ayid' => $ayId]);
        $totals = $stmtTotals->fetchAll();

        $prestasi = 0;
        $pelanggaran = 0;
        foreach ($totals as $t) {
            if ($t['type'] === 'PRESTASI') $prestasi = (int)$t['total'];
            if ($t['type'] === 'PELANGGARAN') $pelanggaran = (int)$t['total'];
        }

        $baseScore = 100;
        // Standar Sekolah: Nilai Sikap hanya dikurangi oleh Pelanggaran (Demerit System).
        // Prestasi tidak bisa sembarangan "menghapus" poin pelanggaran berat secara matematis.
        $finalScore = $baseScore - $pelanggaran;
        if ($finalScore < 0) $finalScore = 0;

        $grade = 'Cukup';
        if ($finalScore >= 90) $grade = 'Sangat Baik';
        else if ($finalScore >= 75) $grade = 'Baik';
        else if ($finalScore >= 60) $grade = 'Cukup';
        else $grade = 'Kurang';

        // Get History
        $stmtHistory = $pdo->prepare("
            SELECT l.id, r.title, r.category, l.type, l.points_change, l.description, l.incident_date, u.full_name as reporter_name
            FROM student_point_logs l
            JOIN point_rules r ON l.point_rule_id = r.id
            LEFT JOIN users u ON l.reporter_id = u.id
            WHERE l.student_id = :uid AND l.academic_year_id = :ayid AND l.status = 'APPROVED'
            ORDER BY l.incident_date DESC, l.created_at DESC
        ");
        $stmtHistory->execute(['uid' => $userId, 'ayid' => $ayId]);
        $historyRaw = $stmtHistory->fetchAll();

        $history = array_map(function($h) {
            $dateObj = new DateTime($h['incident_date']);
            return [
                'id' => $h['id'],
                'title' => $h['title'],
                'type' => strtolower($h['type']),
                'category' => $h['category'],
                'points' => (int)$h['points_change'],
                'notes' => $h['description'],
                'date' => $dateObj->format('d M Y'),
                'reporter' => $h['reporter_name']
            ];
        }, $historyRaw);

        echo json_encode([
            'status' => 'success',
            'data' => [
                'baseScore' => $baseScore,
                'totalPrestasi' => $prestasi,
                'totalPelanggaran' => $pelanggaran,
                'finalScore' => $finalScore,
                'grade' => $grade,
                'history' => $history
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get List of Students for Teacher
if ($uri === '/api/guru/students' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'GURU') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized or not a teacher']);
        exit;
    }

    try {
        // TODO: RBAC Implementation
        // If Wali Asuh -> join guru_wali_students
        // If BK -> join guru_bk_classes
        // For Demo: Fetch all active students
        $stmt = $pdo->prepare("
            SELECT s.user_id as id, u.full_name as name, s.nis, c.name as class_name 
            FROM siswa_profiles s 
            JOIN users u ON s.user_id = u.id 
            LEFT JOIN class_students cs ON cs.student_id = s.user_id AND cs.status = 'AKTIF'
            LEFT JOIN classes c ON cs.class_id = c.id
            WHERE s.status = 'AKTIF'
            ORDER BY c.name, u.full_name
        ");
        $stmt->execute();
        $students = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $students]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Point Rules (Katalog Pelanggaran & Prestasi)
if ($uri === '/api/poin/rules' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) $userId = $payload['user_id'];
    }
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, code, title, type, points, category FROM point_rules WHERE is_active = true ORDER BY type, category, title");
        $stmt->execute();
        $rules = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $rules]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Submit New Point Log
if ($uri === '/api/guru/poin' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'GURU') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized or not a teacher']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $studentId = $input['student_id'] ?? '';
    $ruleId = $input['point_rule_id'] ?? '';
    $incidentDate = $input['incident_date'] ?? date('Y-m-d');
    $notes = $input['notes'] ?? '';

    if (!$studentId || !$ruleId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing student_id or point_rule_id']);
        exit;
    }

    try {
        $stmtRule = $pdo->prepare("SELECT type, points FROM point_rules WHERE id = :id");
        $stmtRule->execute(['id' => $ruleId]);
        $rule = $stmtRule->fetch();
        if (!$rule) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Rule not found']);
            exit;
        }

        $stmtAY = $pdo->prepare("SELECT id FROM academic_years WHERE is_active = true LIMIT 1");
        $stmtAY->execute();
        $ay = $stmtAY->fetch();
        $ayId = $ay ? $ay['id'] : null;

        $stmt = $pdo->prepare("
            INSERT INTO student_point_logs (id, academic_year_id, student_id, reporter_id, point_rule_id, type, points_change, description, incident_date, status)
            VALUES (uuid_generate_v4(), :ayid, :sid, :rid, :prid, :type, :pts, :desc, :idate, 'APPROVED')
        ");
        $stmt->execute([
            'ayid' => $ayId,
            'sid' => $studentId,
            'rid' => $userId,
            'prid' => $ruleId,
            'type' => $rule['type'],
            'pts' => $rule['points'],
            'desc' => $notes,
            'idate' => $incidentDate
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Point recorded successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Assessment Agenda (Agenda Penilaian)
if ($uri === '/api/siswa/assessments' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'SISWA') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT a.id, a.title, a.assessment_type, a.assessment_date, 
                   TO_CHAR(a.start_time, 'HH24:MI') as start_time, 
                   TO_CHAR(a.end_time, 'HH24:MI') as end_time, 
                   a.status, a.description,
                   s.name as subject_name,
                   u.full_name as teacher_name
            FROM assessments a
            JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN users u ON a.teacher_id = u.id
            JOIN class_students cs ON a.class_id = cs.class_id
            WHERE cs.student_id = :uid 
              AND cs.status = 'AKTIF'
              AND a.academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
            ORDER BY a.assessment_date ASC, a.start_time ASC
        ");
        $stmt->execute(['uid' => $userId]);
        $assessmentsRaw = $stmt->fetchAll();

        // Separate them into upcoming vs past for convenience (frontend could also do this)
        $today = date('Y-m-d');
        $upcoming = [];
        $past = [];

        foreach ($assessmentsRaw as $a) {
            $dateObj = new DateTime($a['assessment_date']);
            $formattedDate = $dateObj->format('l, d M Y');
            // Indonesian localization for days
            $days = [
                'Sunday' => 'Minggu', 'Monday' => 'Senin', 'Tuesday' => 'Selasa',
                'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu'
            ];
            foreach ($days as $en => $id) {
                $formattedDate = str_replace($en, $id, $formattedDate);
            }
            $months = [
                'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun',
                'Jul' => 'Jul', 'Aug' => 'Agt', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'
            ];
            foreach ($months as $en => $id) {
                $formattedDate = str_replace($en, $id, $formattedDate);
            }

            $a['formatted_date'] = $formattedDate;
            
            if ($a['assessment_date'] >= $today) {
                $upcoming[] = $a;
            } else {
                $past[] = $a;
            }
        }

        echo json_encode(['status' => 'success', 'data' => ['upcoming' => $upcoming, 'past' => $past]]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Lapor Kesiswaan (GET History)
if ($uri === '/api/siswa/reports' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'SISWA') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT id, category, description, status, TO_CHAR(created_at, 'DD Mon YYYY HH24:MI') as date
            FROM student_reports
            WHERE reporter_id = :uid 
              AND academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
            ORDER BY created_at DESC
        ");
        $stmt->execute(['uid' => $userId]);
        $reports = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $reports]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Lapor Kesiswaan (POST Submit)
if ($uri === '/api/siswa/reports' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'SISWA') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $category = $input['category'] ?? '';
    $description = $input['description'] ?? '';

    if (empty($category) || empty($description)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Kategori dan deskripsi wajib diisi']);
        exit;
    }

    try {
        $stmtAY = $pdo->prepare("SELECT id FROM academic_years WHERE is_active = true LIMIT 1");
        $stmtAY->execute();
        $ay = $stmtAY->fetch();
        $ayId = $ay ? $ay['id'] : null;

        $stmt = $pdo->prepare("
            INSERT INTO student_reports (id, academic_year_id, reporter_id, category, description, status)
            VALUES (uuid_generate_v4(), :ayid, :uid, :cat, :desc, 'PENDING')
        ");
        $stmt->execute([
            'ayid' => $ayId,
            'uid' => $userId,
            'cat' => $category,
            'desc' => $description
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Laporan berhasil dikirim']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Habits for Today & Streaks
if ($uri === '/api/siswa/habits' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'SISWA') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        $today = date('Y-m-d');
        // Fetch today's done habits
        $stmt = $pdo->prepare("SELECT habit_id FROM student_habits_log WHERE student_id = :uid AND date = :today");
        $stmt->execute(['uid' => $userId, 'today' => $today]);
        $doneToday = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Fetch all logs to calculate streaks (simple continuous count from yesterday backwards)
        $stmtAll = $pdo->prepare("SELECT habit_id, date FROM student_habits_log WHERE student_id = :uid ORDER BY date DESC");
        $stmtAll->execute(['uid' => $userId]);
        $allLogs = $stmtAll->fetchAll(PDO::FETCH_ASSOC);

        $logsByHabit = [];
        foreach ($allLogs as $log) {
            $logsByHabit[$log['habit_id']][] = $log['date'];
        }

        $streaks = [];
        $habitIds = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];
        
        foreach ($habitIds as $hId) {
            $streak = 0;
            if (isset($logsByHabit[$hId])) {
                $dates = $logsByHabit[$hId];
                $checkDate = new DateTime($today);
                
                // If they haven't done it today, start checking from yesterday
                if (!in_array($today, $dates)) {
                    $checkDate->modify('-1 day');
                }
                
                foreach ($dates as $d) {
                    if ($d === $checkDate->format('Y-m-d')) {
                        $streak++;
                        $checkDate->modify('-1 day');
                    } else if ($d > $checkDate->format('Y-m-d')) {
                        // ignore dates in the future or today if we skipped it
                        continue;
                    } else {
                        // gap found
                        break;
                    }
                }
            }
            $streaks[$hId] = $streak;
        }

        echo json_encode(['status' => 'success', 'done_today' => $doneToday, 'streaks' => $streaks]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Toggle Habit
if ($uri === '/api/siswa/habits/toggle' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'SISWA') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $habitId = $input['habit_id'] ?? '';
    $isDone = $input['is_done'] ?? false;

    if (empty($habitId)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Habit ID required']);
        exit;
    }

    try {
        $today = date('Y-m-d');
        if ($isDone) {
            $stmt = $pdo->prepare("
                INSERT INTO student_habits_log (student_id, habit_id, date) 
                VALUES (:uid, :hid, :today) 
                ON CONFLICT (student_id, habit_id, date) DO NOTHING
            ");
            $stmt->execute(['uid' => $userId, 'hid' => $habitId, 'today' => $today]);
        } else {
            $stmt = $pdo->prepare("
                DELETE FROM student_habits_log 
                WHERE student_id = :uid AND habit_id = :hid AND date = :today
            ");
            $stmt->execute(['uid' => $userId, 'hid' => $habitId, 'today' => $today]);
        }
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Get Monthly Habit Stats
if ($uri === '/api/siswa/habits/month' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    $role = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
        }
    }
    if (!$userId || $role !== 'SISWA') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    try {
        // Current month bounds
        $firstDay = date('Y-m-01');
        $lastDay = date('Y-m-t');

        // Data for calendar (count of habits per day)
        $stmt = $pdo->prepare("
            SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, COUNT(habit_id) as count
            FROM student_habits_log
            WHERE student_id = :uid AND date >= :start AND date <= :end
            GROUP BY date
            ORDER BY date ASC
        ");
        $stmt->execute(['uid' => $userId, 'start' => $firstDay, 'end' => $lastDay]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Data for radar chart (distribution of habits in the current month)
        $stmtRadar = $pdo->prepare("
            SELECT habit_id, COUNT(id) as count
            FROM student_habits_log
            WHERE student_id = :uid AND date >= :start AND date <= :end
            GROUP BY habit_id
        ");
        $stmtRadar->execute(['uid' => $userId, 'start' => $firstDay, 'end' => $lastDay]);
        $radarRaw = $stmtRadar->fetchAll(PDO::FETCH_ASSOC);

        $habitNames = [
            'h1' => 'Bangun Pagi',
            'h2' => 'Beribadah',
            'h3' => 'Berolahraga',
            'h4' => 'Makan Sehat',
            'h5' => 'Gemar Belajar',
            'h6' => 'Bermasyarakat',
            'h7' => 'Tidur Cepat'
        ];

        $radarData = [];
        $countsById = [];
        foreach ($radarRaw as $r) {
            $countsById[$r['habit_id']] = (int)$r['count'];
        }

        foreach ($habitNames as $id => $name) {
            $radarData[] = [
                'subject' => $name,
                'A' => $countsById[$id] ?? 0,
                'fullMark' => 31 // Assuming max days in a month
            ];
        }

        echo json_encode(['status' => 'success', 'data' => $data, 'radar_data' => $radarData]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Change Password
if ($uri === '/api/user/password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    $userId = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $payload = verify_jwt($matches[1], $jwt_secret);
        if ($payload && isset($payload['user_id'])) {
            $userId = $payload['user_id'];
        }
    }
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $oldPass = $input['old_password'] ?? '';
    $newPass = $input['new_password'] ?? '';

    if (empty($oldPass) || empty($newPass)) {
        echo json_encode(['status' => 'error', 'message' => 'Sandi lama dan baru wajib diisi']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :uid");
        $stmt->execute(['uid' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($oldPass, $user['password_hash'])) {
            echo json_encode(['status' => 'error', 'message' => 'Sandi lama tidak sesuai']);
            exit;
        }

        $newHash = password_hash($newPass, PASSWORD_BCRYPT);
        $updateStmt = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE id = :uid");
        $updateStmt->execute(['hash' => $newHash, 'uid' => $userId]);

        echo json_encode(['status' => 'success', 'message' => 'Sandi berhasil diubah']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Endpoint: Administrasi Mengajar Guru (CP, TP, ATP, MA)
if ($uri === '/api/guru/administrasi' && $_SERVER['REQUEST_METHOD'] === 'GET') {
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

    $academicYearId = $_GET['academic_year_id'] ?? null;
    $subjectId = $_GET['subject_id'] ?? null;

    try {
        $query = "SELECT * FROM teaching_administrations WHERE teacher_id = :tid";
        $params = [':tid' => $userId];

        if ($academicYearId) {
            $query .= " AND academic_year_id = :ayid";
            $params[':ayid'] = $academicYearId;
        }
        if ($subjectId) {
            $query .= " AND subject_id = :sid";
            $params[':sid'] = $subjectId;
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'data' => $docs]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

if ($uri === '/api/guru/administrasi/upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $docType = $_POST['document_type'] ?? '';
    $subjectId = $_POST['subject_id'] ?? '';
    $academicYearId = $_POST['academic_year_id'] ?? '';

    if (empty($docType) || empty($subjectId) || empty($academicYearId)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'document_type, subject_id, and academic_year_id are required']);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded or upload error']);
        exit;
    }

    $file = $_FILES['file'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    
    $allowedExt = ['pdf', 'doc', 'docx'];
    if (!in_array(strtolower($ext), $allowedExt)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only PDF and DOC/DOCX allowed.']);
        exit;
    }

    $uploadDir = __DIR__ . '/uploads/administrasi/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = uniqid('admin_') . '.' . $ext;
    $filePath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        $fileUrl = '/uploads/administrasi/' . $fileName;

        try {
            $stmt = $pdo->prepare("
                INSERT INTO teaching_administrations 
                (teacher_id, subject_id, academic_year_id, document_type, file_name, file_url, file_size)
                VALUES (:tid, :sid, :ayid, :dtype, :fname, :furl, :fsize)
                ON CONFLICT (teacher_id, subject_id, academic_year_id, document_type) 
                DO UPDATE SET 
                    file_name = EXCLUDED.file_name,
                    file_url = EXCLUDED.file_url,
                    file_size = EXCLUDED.file_size,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            ");
            $stmt->execute([
                ':tid' => $userId,
                ':sid' => $subjectId,
                ':ayid' => $academicYearId,
                ':dtype' => $docType,
                ':fname' => $file['name'],
                ':furl' => $fileUrl,
                ':fsize' => $file['size']
            ]);
            $saved = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(['status' => 'success', 'data' => $saved]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded file']);
    }
    exit;
}

echo json_encode(['app' => 'Anise API Server', 'version' => '1.0']);
