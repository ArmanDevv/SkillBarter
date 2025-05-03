<?php
session_start();
include 'db.php';

$searchResults = "";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$loggedInUserId = $_SESSION['user_id'];

// Get current user’s skills and desired skills
$userSql = "SELECT skills, desired_skills FROM users WHERE id = ?";
$userStmt = $conn->prepare($userSql);
$userStmt->bind_param("i", $loggedInUserId);
$userStmt->execute();
$userResult = $userStmt->get_result();
$currentUser = $userResult->fetch_assoc();
$userStmt->close();

// Normalize into arrays
$userSkillsArray       = array_map('trim', explode(',', strtolower($currentUser['skills'])));
$userDesiredArray      = array_map('trim', explode(',', strtolower($currentUser['desired_skills'])));

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['skill'])) {
    $searchSkill = strtolower(trim($_GET['skill']));
    if ($searchSkill !== "") {

        // Only fetch users who actually teach the searched skill
        $sql = "SELECT id, full_name, email, skills, desired_skills, bio 
                  FROM users 
                 WHERE id != ? 
                   AND FIND_IN_SET(?, LOWER(skills))";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $loggedInUserId, $searchSkill);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Build arrays for this candidate
                $theirDesiredArray = array_map('trim', explode(',', strtolower($row['desired_skills'])));

                // Always show they can teach the searched skill
                $skillMatch  = "<p class='match-info'><strong>Can teach you:</strong> {$searchSkill}</p>";

                // Determine what you can teach them
                $youCanTeach = array_intersect($userSkillsArray, $theirDesiredArray);
                if (!empty($youCanTeach)) {
                    $skillMatch .= "<p class='match-info'><strong>You can teach them:</strong> "
                                 . implode(', ', $youCanTeach) . "</p>";
                } else {
                    $skillMatch .= "<p style='color:blue;'><em>"
                                 . "They can teach you {$searchSkill}, but you have nothing they want yet."
                                 . "</em></p>";
                }

                // Render the card
                $searchResults .= "<div class='user-card'>
                    <p><strong>Name:</strong> {$row['full_name']}</p>
                    <p><strong>Email:</strong> <a href='mailto:{$row['email']}'>{$row['email']}</a></p>
                    <p><strong>Skills:</strong> {$row['skills']}</p>
                    <p><strong>Wants to Learn:</strong> {$row['desired_skills']}</p>
                    {$skillMatch}";

                if (!empty($row['bio'])) {
                    $searchResults .= "<p><strong>Bio:</strong> {$row['bio']}</p>";
                }

                // Only show Connect if mutual exchange is possible
                if (!empty($youCanTeach)) {
                    $searchResults .= "<button class='connectbtn' "
                                    . "onclick=\"window.location.href='mailto:{$row['email']}'\">Connect</button>";
                }

                $searchResults .= "</div>";
            }
        } else {
            $searchResults = "<p class='error'>No one teaches “{$searchSkill}”. Try another skill!</p>";
        }

        $stmt->close();
    }
}

$conn->close();
?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css"/>
    <title>Skill Barter - Search</title>
</head>
<body>
   <nav class="navbar">
    <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
    <img class="logoimage" height="80" width="80" src="logo.png" alt="logo">
    <div ><a href="home.php" style="color: white; text-decoration:none;">Skill Barter</a></div>
        </div>
        <div class="nav-buttons" >
            <button class="btnregister" onclick="window.location.href='profile.php'">My Profile</button>
            <button class="btnregister" onclick="window.location.href='logout.php'">Logout</button>
        </div>
    </nav>

    <div class="container">
        <h1 style="text-align:center">Find Skill Exchange Partners</h1>

        <form method="GET" action="search.php" class="search-form">
            <input type="text" name="skill" id="skillSearch" placeholder="Search for someone who knows..." autocomplete="off" class="search-input">
            <button type="submit" class="btnregister">Search</button>
        </form>

        <div class="search-results">
            <?php echo $searchResults; ?>
        </div>
    </div>
</body>
</html>
