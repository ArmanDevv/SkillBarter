<?php
session_start();
include 'db.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css"/>
    <title>Skill Barter - Home</title>
</head>
<body>

    <nav class="navbar">
    <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
            <img class="logoimage" height="80" width="80" src="logo.png" alt="logo">
            <div >Skill Barter</div>
        </div>
        <button class="btnregister" onclick="window.location.href='register.php'">Register/Login</button>
    </nav>
    
    <section class="info-section">
        <div class="info-box">
            <i class="fas fa-user-check"></i>
            <h3>Register/Login</h3>
            <p>Start skill barter by creating an account.</p>
        </div>
        <div class="divider"></div>
        <div class="info-box">
            <i class="fas fa-users"></i>
            <h3>Find People</h3>
            <p>Find people with preferred skills and get connected.</p>
        </div>
        <div class="divider"></div>
        <div class="info-box">
            <i class="fas fa-exchange-alt"></i>
            <h3>Exchange Skills</h3>
            <p>Learn skills in exchange of your skills.</p>
        </div>
    </section>

</body>
</html>
