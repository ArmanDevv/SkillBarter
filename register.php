<?php
session_start();
include 'db.php';

$emailError = "";
$email = ""; // Store email input

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $full_name = $_POST['full_name'];
    $skills = $_POST['skills'];
    $desired_skills = $_POST['desired_skills'];

    $sql = "INSERT INTO users (email, password, full_name, skills, desired_skills) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $email, $password, $full_name, $skills, $desired_skills);

    try {
        if ($stmt->execute()) {
            echo "<script>alert('Registration successful!'); window.location='login.php';</script>";
        }
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) { // Duplicate entry error
            $emailError = "You have registered previously, please login!";
        } else {
            echo "<script>alert('Error: Something went wrong, please try again!');</script>";
        }
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
    <title>Skill Barter - Register</title>
    <style>
        .error { color: red; font-size: 14px; margin-top: 5px; }
        .text-center { text-align: center; margin: 15px 0; }
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
        <h1 style="text-align:center;">Register for Skill Barter</h1>
        
        <form method="POST" action="register.php" onsubmit="return validateForm()">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
                <div class="error"><?php echo $emailError; ?></div>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <div class="error" id="passwordError"></div>
            </div>
            <div class="form-group">
                <label for="full_name">Full Name:</label>
                <input type="text" id="full_name" name="full_name" required>
                <div class="error" id="nameError"></div>
            </div>
            <div class="form-group">
                <label for="skills">Skills I can teach (comma-separated):</label>
                <input type="text" id="skills" name="skills" required>
                <div class="error" id="skillsError"></div>
            </div>
            <div class="form-group">
                <label for="desired_skills">Skills I Want to Learn (comma-separated):</label>
                <input type="text" id="desired_skills" name="desired_skills" required
                       value="<?php echo isset($_POST['desired_skills']) ? htmlspecialchars($_POST['desired_skills']) : ''; ?>"
                       placeholder="e.g., Piano, Spanish, Photography">
            </div>
            <button type="submit" style="margin-left: auto margin-right: auto" class="btnregister">Register</button>
        </form>
        <p class="text-center">Already have an account? <a href="login.php" style="color:white;">Login here</a></p>
    </div>

    <script>
    function validateForm() {
        let isValid = true;

        // Full Name Validation (Only Letters & Spaces)
        let name = document.getElementById("full_name").value;
        let nameError = document.getElementById("nameError");
        let nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            nameError.innerText = "Full name should only contain letters and spaces.";
            isValid = false;
        } else {
            nameError.innerText = "";
        }

        // Skills Validation (Only Letters & No Spaces Between Skills)
        let skills = document.getElementById("skills").value;
        let skillsError = document.getElementById("skillsError");
        let skillsRegex = /^[A-Za-z\s#+.,]+$/;  // Allows C#, C++, Node.js
        if (!skillsRegex.test(skills)) {
            skillsError.innerText = "Skills can only contain letters, spaces, #, +, and .";
            isValid = false;
        } else {
            skillsError.innerText = "";
        }

        return isValid; // Prevent form submission if invalid
    }
    </script>
</body>
</html>
