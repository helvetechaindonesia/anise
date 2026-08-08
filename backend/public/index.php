<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/api/presensi' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Presensi berhasil disimpan',
        'data' => [
            'waktu' => date('Y-m-d H:i:s'),
            'lokasi' => 'GPS OK',
            'wajah' => 'MATCHED'
        ]
    ]);
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
