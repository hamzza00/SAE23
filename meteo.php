<?php
// Affichage des erreurs pour le débogage
ini_set('display_errors', 1);
error_reporting(E_ALL);

// En-têtes CORS
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// Connexion à la base de données
$host = 'mysql_serv';
$dbname = 'houajour_01';
$user = 'houajour';
$pass = 'Hamza2006.';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["error" => "Erreur de connexion à la base de données: " . $e->getMessage()]);
    exit;
}

// Date du jour
$date_du_jour = date('Y-m-d');

// Récupère les données météo actuelles
$query = $pdo->query("SELECT * FROM temp");

if ($query === false) {
    echo json_encode(["error" => "Erreur dans la requête SQL"]);
    exit;
}

$result = $query->fetchAll(PDO::FETCH_ASSOC);

foreach ($result as &$row) {
    $idEtudiant = $row['id'];

    // Ajouter la date du jour à chaque ligne
    $row['date_du_jour'] = $date_du_jour;

    // Vérifie si l'historique de la météo pour cette date est déjà enregistré
    $check = $pdo->prepare("SELECT COUNT(*) FROM historique_meteo WHERE id_etudiant = :id AND date_meteo = :date");
    $check->execute([
        ':id' => $idEtudiant,
        ':date' => $date_du_jour
    ]);
    $alreadyExists = $check->fetchColumn();

    // Si les données météo ne sont pas déjà enregistrées pour aujourd'hui, on les insère
    if ($alreadyExists == 0) {
        $insert = $pdo->prepare("
            INSERT INTO historique_meteo (
                id_etudiant, date_meteo,
                ville_principale, temperature_ville_principale, pression_atmospherique_ville_principale,
                ville_secondaire, temperature_ville_secondaire, pression_atmospherique_ville_secondaire
            ) VALUES (
                :id, :date,
                :villeP, :tempP, :pressP,
                :villeS, :tempS, :pressS
            )
        ");
        $insert->execute([
            ':id' => $idEtudiant,
            ':date' => $date_du_jour,
            ':villeP' => $row['ville_principale'] ?? '',
            ':tempP' => $row['temperature_ville_principale'] ?? 0,
            ':pressP' => $row['pression_atmospherique_ville_principale'] ?? 0,
            ':villeS' => $row['ville_secondaire'] ?? '',
            ':tempS' => $row['temperature_ville_secondaire'] ?? 0,
            ':pressS' => $row['pression_atmospherique_ville_secondaire'] ?? 0
        ]);
    }
    

    // Récupérer l’historique complet pour cet étudiant
    $historique = $pdo->prepare("
        SELECT date_meteo, ville_principale, temperature_ville_principale, pression_atmospherique_ville_principale,
               ville_secondaire, temperature_ville_secondaire, pression_atmospherique_ville_secondaire
        FROM historique_meteo
        WHERE id_etudiant = :id
        ORDER BY date_meteo DESC
    ");
    $historique->execute([':id' => $idEtudiant]);

    // Récupérer les résultats de l'historique
    $row['historique'] = $historique->fetchAll(PDO::FETCH_ASSOC);
}

// Résultat final : météo actuelle + historique
echo json_encode($result);
?>
