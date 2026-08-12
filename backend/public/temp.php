<?php
$db = new PDO('sqlite:../database.sqlite');
$stmt = $db->query("PRAGMA table_info('users')");
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($cols, JSON_PRETTY_PRINT);
?>
