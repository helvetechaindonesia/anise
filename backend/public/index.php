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

// Endpoint: Get Current User (Simulasi Login Budi)
if ($uri === '/api/user/me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Karena belum ada sistem login JWT/Session sungguhan, kita "paksa" narik data Budi Setiawan
    $username = 'budis'; 

    $stmt = $pdo->prepare("
        SELECT 
            u.id, u.full_name, u.username, u.email, u.role_type, u.avatar_url, u.face_descriptor,
            s.nisn, s.nis, s.gender, s.birth_place, s.birth_date, s.behavior_points,
            c.name as class_name,
            m.name as major_name,
            ay.name as academic_year
        FROM users u
        LEFT JOIN siswa_profiles s ON u.id = s.user_id
        LEFT JOIN class_students cs ON s.user_id = cs.student_id AND cs.status = 'AKTIF'
        LEFT JOIN classes c ON cs.class_id = c.id
        LEFT JOIN majors m ON c.major_id = m.id
        LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
        WHERE u.username = :username
        LIMIT 1
    ");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode(['status' => 'success', 'data' => $user]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
    }
    exit;
}

// Endpoint: Update Face Descriptor
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

if ($uri === '/api/tugas' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        [
            'id' => 1,
            'subject' => 'Matematika Peminatan',
            'title' => 'Trigonometri Lanjut & Analisis Gelombang',
            'due' => 'Besok, 12:00 WIB',
            'desc' => 'Kerjakan soal latihan A-C pada buku paket halaman 45-47. Tulis tangan dan upload format PDF.',
            'points' => 100,
            'status' => 'ditugaskan'
        ]
    ]);
    exit;
}

echo json_encode(['app' => 'Anise API Server', 'version' => '1.0']);
