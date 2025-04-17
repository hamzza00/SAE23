const API_KEY = "c4f13e367e51d5d1afe90ae672528dd1"; // Nouvelle clé API

let allStudents = [];

// Préloader (ne perturbe pas l'affichage de la météo)
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    }, 2000);
});
function filterStudents(query) {
    const filtered = allStudents.filter(etudiant => {
        const fullName = `${etudiant.prenom_etudiant} ${etudiant.nom_etudiant}`.toLowerCase();
        const group = (etudiant.groupe || '').toLowerCase();
        const q = query.toLowerCase();

        return fullName.includes(q) || group.includes(q);
    });

    renderStudents(filtered);
}

// Fonction principale pour récupérer les données météo et les afficher
async function getWeather(villes) {
    const weatherPromises = villes.map(async (ville) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ville}&units=metric&appid=${API_KEY}`);
            const data = await response.json();

            if (data.cod !== 200) {
                throw new Error("City not found");
            }

            return {
                ville,
                temperature: data.main.temp,
                pression: data.main.pressure
            };
        } catch (err) {
            console.error(`Erreur pour ${ville}: `, err);
            return {
                ville,
                temperature: '?',
                pression: '?'
            };
        }
    });

    return Promise.all(weatherPromises);
}

// Créer la carte d'un étudiant avec les informations météo
async function createStudentCardWithWeather(etudiant) {
    const card = document.createElement('div');
    card.className = 'ville-card loading';

    const header = document.createElement('div');
    header.className = 'student-header';
    header.innerHTML = `
        <h2>${etudiant.prenom_etudiant} ${etudiant.nom_etudiant}</h2>
        <div class="student-group">${etudiant.groupe || 'Non renseigné'}</div>
    `;

    const container = document.createElement('div');
    container.className = 'student-content';
    card.append(header, container);

    // Récupérer les villes principales et secondaires
    const villes = [etudiant.ville_principale, etudiant.ville_secondaire].filter(Boolean);

    // Récupérer les données météo
    const weatherData = await getWeather(villes);

    // Afficher les informations météo pour chaque ville
    const coordSection = document.createElement('div');
    coordSection.className = 'coordonnees';

    weatherData.forEach(data => {
        const cityElement = document.createElement('div');
        cityElement.className = 'coord-item';
        cityElement.innerHTML = `
            <h3>📍 ${data.ville}</h3>
            <div class="weather-today">
                <div class="weather-temp">🌡️ Température: ${data.temperature}°C</div>
                <div class="weather-pression">💨 Pression: ${data.pression} hPa</div>
            </div>
        `;
        coordSection.append(cityElement);
    });

    container.append(coordSection);
    return card;
}

// Afficher tous les étudiants avec leurs informations et la météo
async function renderStudents(students) {
    const container = document.getElementById("meteo");
    container.innerHTML = ''; // Réinitialiser l'affichage

    // Créer et afficher chaque carte d'étudiant
    for (const etudiant of students) {
        const studentCard = await createStudentCardWithWeather(etudiant);
        container.append(studentCard);
    }
}

// Gérer la recherche par nom
document.getElementById('search').addEventListener('input', (e) => {
    filterStudents(e.target.value);
});

// Charger les étudiants depuis la base de données
fetch("https://rt-projet.pu-pm.univ-fcomte.fr/users/houajour/R209/meteo.php")
    .then(response => response.json())
    .then(etudiants => {
        allStudents = etudiants;
        renderStudents(etudiants);
    })
    .catch(error => {
        console.error("Erreur PHP :", error);
        document.getElementById("meteo").innerHTML = '<div class="error-msg">Erreur de chargement des données</div>';
    });
