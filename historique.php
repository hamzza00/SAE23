<?php
$host = "mysql_serv";
$dbname = "houajour_01";
$user = "houajour";
$password = "Hamza2006.";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Récupération des données météo historiques
    $stmt = $conn->prepare("SELECT * FROM historique_meteo");
    $stmt->execute();
    $donnees = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
