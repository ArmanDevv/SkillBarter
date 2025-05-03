<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$status_message = '';
$message_type = '';

// First, add the desired_skills column if it doesn't exist
$alter_table = "ALTER TABLE users ADD COLUMN IF NOT EXISTS desired_skills TEXT AFTER skills";
$conn->query($alter_table);

// Fetch user data
$sql = "SELECT full_name, email, skills, desired_skills, bio FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($full_name, $email, $skills, $desired_skills, $bio);
$stmt->fetch();
$stmt->close();

// Handle profile update
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $new_full_name = $_POST['full_name'];
    $new_skills = $_POST['skills'];
    $new_desired_skills = $_POST['desired_skills'];
    $new_bio = $_POST['bio'];

    $update_sql = "UPDATE users SET full_name = ?, skills = ?, desired_skills = ?, bio = ? WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param("ssssi", $new_full_name, $new_skills, $new_desired_skills, $new_bio, $user_id);

    if ($update_stmt->execute()) {
        $status_message = 'Profile updated successfully!';
        $message_type = 'success';
        
        // Update the displayed values
        $full_name = $new_full_name;
        $skills = $new_skills;
        $desired_skills = $new_desired_skills;
        $bio = $new_bio;
    } else {
        $status_message = 'Error updating profile. Please try again.';
        $message_type = 'error';
    }

    $update_stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css"/>
    <title>Skill Barter - Profile</title>
    <script>
        function enableEditing() {
            document.getElementById("full_name").removeAttribute("readonly");
            document.getElementById("skills").removeAttribute("readonly");
            document.getElementById("desired_skills").removeAttribute("readonly");
            document.getElementById("bio").removeAttribute("readonly");
            document.getElementById("full_name").focus();

            // Hide Edit button & show Save button
            document.getElementById("editBtn").style.display = "none";
            document.getElementById("saveBtn").style.display = "inline-block";
        }
    </script>
</head>
<body>
    <nav class="navbar">
    <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
    <img class="logoimage" height="80" width="80" src="logo.png" alt="logo">
    <div ><a href="home.php" style="color: white; text-decoration:none;">Skill Barter</a></div>
        </div>
        <button class="btnregister" onclick="window.location.href='logout.php'">Logout</button>
    </nav>

    <div class="container">
        <h1>My Profile</h1>

        <?php if ($status_message): ?>
            <div class="message <?php echo $message_type; ?>">
                <?php echo htmlspecialchars($status_message); ?>
            </div>
        <?php endif; ?>
    
        <form method="POST" style="margin-bottom: 30px">
            <div class="form-group">
                <label for="full_name">Full Name:</label>
                <input type="text" id="full_name" name="full_name" value="<?php echo htmlspecialchars($full_name); ?>" readonly required>
            </div>
            <div class="form-group">
                <label for="skills">Skills I Can Teach (comma-separated):</label>
                <input type="text" id="skills" name="skills" value="<?php echo htmlspecialchars($skills); ?>" 
                       readonly required placeholder="e.g., Python, Guitar, French">
            </div>
            <div class="form-group">
                <label for="desired_skills">Skills I Want to Learn (comma-separated):</label>
                <input type="text" id="desired_skills" name="desired_skills" 
                       value="<?php echo htmlspecialchars($desired_skills); ?>" 
                       readonly required placeholder="e.g., Piano, Spanish, Photography">
            </div>
            <div class="form-group">
                <label for="bio">Bio:</label>
                <textarea id="bio" name="bio" readonly><?php echo htmlspecialchars($bio); ?></textarea>
            </div>

            <!-- Edit & Save Buttons -->
            <div style="display:flex; justify-content: space-between;">
                <button type="button" style="margin-left:0" id="editBtn" onclick="enableEditing()" class="btnregister">Edit Profile</button>
                <button type="submit" id="saveBtn" class="btnregister" style="display: none; margin-left:0">Save Profile</button>
                <button type="button" onclick="window.location.href='search.php'" class="btnregister">Search Skills</button>
            </div>
        </form>
    </div>
</body>
</html>
