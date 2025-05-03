<?php
$host = "localhost";
$user = "root"; // Default user for XAMPP
$pass = ""; // No password in XAMPP
$db = "skill_barter";

$conn = new mysqli($host, $user, $pass, $db); //mysqli is an improved extension of php for accessing mysql db

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
