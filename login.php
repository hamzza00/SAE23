<?php
$host = "mysql_serv"; // Hôte de la base de données
$dbname = "houajour_01"; // Nom de la base de données
$user = "houajour"; // Nom d'utilisateur MySQL
$pass = "Hamza2006."; // Mot de passe MySQL

// Connexion à la base de données avec PDO
$conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Active les erreurs PDO

// Récupérer les informations du formulaire de connexion
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username']; // Nom d'utilisateur envoyé via le formulaire
    $password = $_POST['password']; // Mot de passe envoyé via le formulaire

    // Vérifier si l'utilisateur existe dans la base de données
    $stmt = $conn->prepare("SELECT * FROM login WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Si l'utilisateur existe, vérifier le mot de passe
        if (password_verify($password, $user['password'])) {
            // Si le mot de passe est correct, démarrer une session
            session_start();
            $_SESSION['user'] = $user['username']; // Enregistrer le nom d'utilisateur dans la session
            header("Location: index.html"); // Redirection vers la page d'accueil ou tableau de bord
            exit();
        } else {
            // Si le mot de passe est incorrect
            header("Location: login.html?msg=Mot de passe incorrect");
            exit();
        }
    } else {
        // Si l'utilisateur n'existe pas
        header("Location: login.html?msg=Utilisateur non trouvé");
        exit();
    }
}
?>
