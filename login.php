<?php
session_start();
include 'db.php';

$emailError = $passwordError = "";
$email = ""; // Store email input

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];  // Preserve the email
    $password = $_POST['password'];

    $sql = "SELECT id, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $hashed_password);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            $_SESSION['user_id'] = $id;
            header("Location: profile.php");
            exit;
        } else {
            $passwordError = "Incorrect password!";
        }
    } else {
        $emailError = "User not found! Please register.";
        $email = ""; // Clear email if it's incorrect
    }

    $stmt->close();
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css"/>
    <title>Skill Barter - Login</title>
    <style>
        .error { color: red; font-size: 14px; margin-top: 5px; }
    </style>
</head>
<body>
    <nav class="navbar">
    <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
    <img class="logoimage" height="80" width="80" src="logo.png" alt="logo">
    <div ><a href="home.php" style="color: white; text-decoration:none;">Skill Barter</a></div>
        </div>
    </nav>
    
    <div class="container">
        <h1>Login for Skill Barter</h1>
        
        <form method="POST" action="login.php">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
                <div class="error"><?php echo $emailError; ?></div>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <div class="error"><?php echo $passwordError; ?></div>
            </div>
            <button type="submit" class="btnregister">Login</button>
        </form>
        <p class="text-center">Don't have an account? <a href="register.php" style="color:white;">Register here</a></p>
    </div>
</body>
</html>
