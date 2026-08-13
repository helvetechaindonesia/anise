<?php
try {
    $pdo = new PDO("pgsql:host=db;port=5432;dbname=anise_db", "anise_user", "anise_password", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 1. Get teacher id
    $stmt = $pdo->query("SELECT id FROM users WHERE full_name = 'Bpk. Ahmad Susanto' LIMIT 1");
    $teacherId = $stmt->fetchColumn();

    if (!$teacherId) die("Teacher not found");

    // 2. Get a class id & subject id
    $stmt = $pdo->query("SELECT id FROM classes LIMIT 1");
    $classId = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT id FROM subjects LIMIT 1");
    $subjectId = $stmt->fetchColumn();

    // 3. Get existing journal
    $stmt = $pdo->query("SELECT id FROM journals WHERE teacher_id = '$teacherId' LIMIT 1");
    $jExisting = $stmt->fetchColumn();

    // 4. Create 4 more journals
    $journals = [];
    for ($i=1; $i<=4; $i++) {
        $id = bin2hex(random_bytes(16));
        $id = sprintf('%s-%s-%s-%s-%s', substr($id, 0, 8), substr($id, 8, 4), substr($id, 12, 4), substr($id, 16, 4), substr($id, 20, 12));
        $journals[] = $id;

        $stmt = $pdo->prepare("INSERT INTO journals (id, class_id, subject_id, teacher_id, topic_material, teaching_date, start_time, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$id, $classId, $subjectId, $teacherId, "Materi Dummy $i", "2026-08-1$i", "07:00:00", "09:00:00"]);
    }

    // 5. Insert 4 tasks for new journals
    $tasks = [
        [$journals[0], 'Latihan Geometri Analitik', 'Kerjakan soal 1-5', '2026-08-11 23:59:00'], // Overdue
        [$journals[1], 'PR Aljabar Matriks', 'Tugas proyek kelompok', '2026-08-20 23:59:00'],
        [$journals[2], 'Kuis Kalkulus Lanjut', 'Kerjakan secara individu', '2026-08-25 23:59:00'],
        [$journals[3], 'Analisis Data Statistika', 'Buat grafik dari data yang diberikan', '2026-08-30 23:59:00']
    ];

    foreach ($tasks as $t) {
        $stmt = $pdo->prepare("INSERT INTO journal_tasks (journal_id, title, instructions, due_date) VALUES (?, ?, ?, ?)");
        $stmt->execute($t);
    }

    echo "Seed Success";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
