# 🎯 Skill Barter Platform

A web-based platform designed for users to **exchange skills**. It empowers individuals to register, create profiles, and list both the skills they offer and those they seek. Through skill-based matching, users can discover mutually beneficial learning opportunities and initiate direct contact.

---

## 🚧 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript  
- **Backend**: PHP 7+  
- **Database**: MySQL (using XAMPP)  
- **Icons**: Font Awesome  
- **Server Environment**: Apache (via XAMPP)

---

## 🌟 Key Features

- **🔐 User Registration & Login**  
  Secure authentication powered by `password_hash()`.

- **👤 Profile Management**  
  Users can update their full name, a brief bio, skills they can teach, and those they wish to learn.

- **🔍 Skill-Based Search & Matchmaking**  
  - Search for any skill.  
  - View only profiles of users willing to teach that skill.  
  - If there’s a potential match (you can teach what they want to learn), a **Connect** button appears.  
  - If no match exists, a message is shown:  
    > "They can teach you `<skill>`, but you have nothing they want yet."

- **📧 Easy Communication**  
  One-click `mailto:` integration to start a conversation.

- **📱 Mobile-Responsive**  
  Designed with a mobile-first approach for optimal viewing across devices.

---

## 📁 Folder Structure

/skill-barter/  
├── db.php # Database connection  
├── home.php # Landing page  
├── register.php # User registration  
├── login.php # User login  
├── logout.php # User logout  
├── profile.php # View & edit profile  
├── search.php # Skill search & matching  
├── style.css # Site-wide styles  
└── README.md # Project documentation  

---

## 🧩 Setup & Installation

### ⚙️ Requirements

- XAMPP or any Apache‑MySQL‑PHP stack  
- MySQL privileges to create and modify databases

### 🛠 Steps

1. Clone or download this repository into your `htdocs` directory, e.g.:  
   `htdocs/skill-barter/`

2. Start **Apache** and **MySQL** using the XAMPP control panel.

3. Access **phpMyAdmin** by navigating to:  
   `http://localhost/phpmyadmin`

4. Create a new database named:  
   `skill_barter`

5. Execute the following SQL to create the users table:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  skills TEXT NOT NULL,
  desired_skills TEXT NOT NULL,
  bio TEXT
);


### In db.php, confirm your credentials:

$host = "localhost";  
$user = "root";  
$pass = "";  
$db   = "skill_barter";

### 🚀 Running the Application
Open your browser and go to:
http://localhost/skill-barter/home.php

Register a new account and log in.

Complete your profile, then begin exploring and connecting with others through the skill search page.

---

### 📑 License
This project is open‑source.
