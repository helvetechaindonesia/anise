<?php
try {
    $pdo = new PDO("pgsql:host=db;port=5432;dbname=anise_db", "anise_user", "anise_password", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $sql = "
    CREATE TABLE IF NOT EXISTS journal_ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(journal_id, student_id)
    );
    ";
    
    $pdo->exec($sql);
    echo "Table journal_ratings created successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
