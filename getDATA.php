<?php
// Affichage des erreurs PHP pour le débogage
ini_set('display_errors', 1);
error_reporting(E_ALL);

// En-têtes pour permettre le CORS (Cross-Origin Resource Sharing)
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// Connexion à la base de données
$host = 'mysql_serv'; // Remplace par ton hôte
$dbname = 'houajour_01'; // Remplace par le nom de ta base
$user = 'houajour'; // Remplace par ton utilisateur
$pass = 'Hamza2006.'; // Remplace par ton mot de passe

// Connexion à la base de données avec gestion d'erreur
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Si erreur de connexion, renvoi d'un message JSON d'erreur
    echo json_encode(["error" => "Erreur de connexion à la base de données: " . $e->getMessage()]);
    exit;
}

// Requête SQL pour récupérer les données des étudiants, incluant ville principale et ville secondaire
$query = $pdo->query("SELECT prenom_etudiant, nom_etudiant, Groupe AS groupe, ville, ville_residence_secondaire FROM etudiants");

if ($query === false) {
    // Si la requête échoue, renvoi d'une erreur JSON
    echo json_encode(["error" => "Erreur dans la requête SQL"]);
    exit;
}

// Récupère toutes les données sous forme de tableau associatif
$result = $query->fetchAll(PDO::FETCH_ASSOC);

// Vérification si des résultats sont retournés
if ($result) {
    // Retourner les données sous forme de JSON
    echo json_encode($result);
} else {
    // Si aucune donnée trouvée, renvoyer un message d'erreur
    echo json_encode(["error" => "Aucun étudiant trouvé."]);
}
?>
