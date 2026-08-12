<?php
try {
    $pdo = new PDO("pgsql:host=db;port=5432;dbname=anise_db", "anise_user", "anise_password", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $sql = "
    CREATE TABLE IF NOT EXISTS student_habits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        habit_id VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, habit_id, date)
    );
    ";
    
    $pdo->exec($sql);
    echo "Table student_habits created successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
