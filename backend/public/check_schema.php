<?php
try {
    $pdo = new PDO("pgsql:host=db;port=5432;dbname=anise_db", "anise_user", "anise_password");
    $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: \n" . implode("\n", $tables) . "\n";
} catch (Exception $e) {
    echo $e->getMessage();
}
