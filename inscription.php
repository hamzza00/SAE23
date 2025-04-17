<?php
$host = "mysql_serv"; // Hôte de la base de données
$dbname = "houajour_01"; // Nom de la base de données
$user = "houajour"; // Nom d'utilisateur MySQL
$password = "Hamza2006."; // Mot de passe MySQL

// Affichage des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Connexion à la base de données
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Active les erreurs PDO

    // Vérification si les champs sont envoyés via POST
    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        // Vérification que tous les champs sont remplis
        if (isset($_POST['username'], $_POST['email'], $_POST['password']) && !empty($_POST['username']) && !empty($_POST['email']) && !empty($_POST['password'])) {

            // Récupérer les valeurs des champs
            $username = $_POST['username'];
            $email = $_POST['email'];
            $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Sécurisation du mot de passe

            // Préparer la requête d'insertion
            $sql = "INSERT INTO login (username, email, password) VALUES (:username, :email, :password)";
            $stmt = $conn->prepare($sql);

            // Exécuter la requête
            $result = $stmt->execute([
                ':username' => $username,
                ':email' => $email,
                ':password' => $password
            ]);

            // Vérifier si l'insertion a réussi
            if ($result) {
                // Envoi de l'e-mail de remerciement
                $subject = " Remerciments ";
                $message = "Bonjour $username,\n\n Bonjour, nous vous remercions pour votre inscription à MétéEtudiants.

Cordialement,\n\nCordialement,\nMétéoEtudiants";
                $headers = "From: MeteoEtudiants"; // Adresse de l'expéditeur

                // Envoi de l'email
                if (mail($email, $subject, $message, $headers)) {
                    // Redirection vers la page de connexion avec un message de succès
                    header("Location: login.html?msg=Compte créé avec succès. Un e-mail de remerciement a été envoyé.");
                    exit;
                } else {
                    echo "Erreur lors de l'envoi de l'email.";
                }

            } else {
                echo "Erreur lors de l'insertion des données dans la base de données.";
            }

        } else {
            // Message d'erreur si les champs ne sont pas remplis
            die("Erreur : Tous les champs doivent être remplis.");
        }
    }

} catch (PDOException $e) {
    // Affichage des erreurs de connexion à la base de données
    die("Erreur : " . $e->getMessage());
}
?>
