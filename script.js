const API_KEY = "3d676299aa460a30af4bcd9b166b12f1";
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

// Fonction pour récupérer les coordonnées
async function fetchCoordinates(ville) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=${API_KEY}`);
        const data = await response.json();
        return { 
            lat: data.coord.lat.toFixed(4), 
            lon: data.coord.lon.toFixed(4),
            success: true
        };
    } catch (err) {
        return { lat: '?', lon: '?', success: false };
    }
}

// Fonction pour récupérer les prévisions météo (sur 7 jours)
async function fetchWeatherForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        return data.daily; // Retourne les prévisions sur 7 jours
    } catch (err) {
        console.error("Erreur météo", err);
        return null;
    }
}

// Créer un élément pour afficher la ville et ses coordonnées, avec la météo
async function createCityElement(ville, coord) {
    const elem = document.createElement('div');
    elem.className = 'coord-item';
    
    let weatherContent = '';
    if (coord.success) {
        const forecast = await fetchWeatherForecast(coord.lat, coord.lon);
        if (forecast) {
            const weatherToday = forecast[0]; // Météo pour aujourd'hui
            const date = new Date(weatherToday.dt * 1000);
            const iconCode = weatherToday.weather[0].icon;
            weatherContent = `
                <div class="weather-today">
                    <div class="weather-date">${date.toLocaleDateString()}</div>
                    <div class="weather-temp">🌡️ ${weatherToday.temp.day}°C</div>
                    <div class="weather-conditions">💨 ${weatherToday.weather[0].description}</div>
                    <img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Météo icon" class="weather-icon" />
                </div>
            `;
        }
    }

    elem.innerHTML = `
        <h3>📍 ${ville}</h3>
        <div class="coord-grid">
            <div class="coord-value ${coord.success ? '' : 'error'}">
                <span>Latitude</span>
                <strong>${coord.lat}</strong>
            </div>
            <div class="coord-value ${coord.success ? '' : 'error'}">
                <span>Longitude</span>
                <strong>${coord.lon}</strong>
            </div>
        </div>
        <div class="weather-container">${weatherContent}</div>  <!-- Affichage compact de la météo -->
    `;
    return elem;
}

// Créer la carte d'un étudiant
function createStudentCard(etudiant) {
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
    return { card, container };
}

// Afficher les informations de l'étudiant et de la météo
async function renderStudent(etudiant, container) {
    const villes = [...new Set([etudiant.ville, etudiant.ville_residence_secondaire].filter(Boolean))];
    const coords = await Promise.all(villes.map(fetchCoordinates));
    
    // Coordonnées et météo des villes
    const coordSection = document.createElement('div');
    coordSection.className = 'coordonnees';
    for (let i = 0; i < villes.length; i++) {
        const cityElement = await createCityElement(villes[i], coords[i]);
        coordSection.append(cityElement);
    }

    // Moyenne des coordonnées
    const validCoords = coords.filter(c => c.success);
    const moyenne = validCoords.length > 0 ? {
        lat: (validCoords.reduce((a, c) => a + parseFloat(c.lat), 0) / validCoords.length).toFixed(4),
        lon: (validCoords.reduce((a, c) => a + parseFloat(c.lon), 0) / validCoords.length).toFixed(4)
    } : { lat: '-', lon: '-' };

    const moyenneElem = document.createElement('div');
    moyenneElem.className = 'meteo-info';
    moyenneElem.innerHTML = `
        <div class="moyenne-header">Moyenne géographique</div>
        <div class="moyenne-grid">
            <div class="moyenne-value">
                <span>🌍 Latitude</span>
                <strong>${moyenne.lat}</strong>
            </div>
            <div class="moyenne-value">
                <span>🌐 Longitude</span>
                <strong>${moyenne.lon}</strong>
            </div>
        </div>
    `;

    container.append(coordSection, moyenneElem);
}

// Afficher tous les étudiants avec leurs informations et la météo
async function renderStudents(students) {
    const container = document.getElementById("meteo");
    container.innerHTML = '';
    
    for(const etudiant of students) {
        const { card, container: content } = createStudentCard(etudiant);
        container.append(card);
        await renderStudent(etudiant, content);
        card.classList.remove('loading');
    }
}

// Gérer la recherche par nom
document.getElementById('search').addEventListener('input', (e) => {
    filterStudents(e.target.value);
});

// Charger les étudiants depuis la base de données
fetch("https://rt-projet.pu-pm.univ-fcomte.fr/users/houajour/R209/getDATA.php")
    .then(response => response.json())
    .then(etudiants => {
        allStudents = etudiants;
        renderStudents(etudiants);
    })
    .catch(error => {
        console.error("Erreur PHP :", error);
        document.getElementById("meteo").innerHTML = '<div class="error-msg">Erreur de chargement des données</div>';
    });
// Fonction pour calculer la moyenne des coordonnées par groupe
async function calculateCoordinatesAverageByGroup(students) {
    let groupData = {
        LK1: { latMain: 0, lonMain: 0, countMain: 0, latSec: 0, lonSec: 0, countSec: 0 },
        LK2: { latMain: 0, lonMain: 0, countMain: 0, latSec: 0, lonSec: 0, countSec: 0 },
    };

    for (let student of students) {
        const villeMain = student.ville;
        const villeSec = student.ville_residence_secondaire;
        const group = student.groupe || '';

        // Calcul pour la ville principale
        if (villeMain) {
            const coordMain = await fetchCoordinates(villeMain);
            if (coordMain.success) {
                if (group === "LK1") {
                    groupData.LK1.latMain += parseFloat(coordMain.lat);
                    groupData.LK1.lonMain += parseFloat(coordMain.lon);
                    groupData.LK1.countMain++;
                } else if (group === "LK2") {
                    groupData.LK2.latMain += parseFloat(coordMain.lat);
                    groupData.LK2.lonMain += parseFloat(coordMain.lon);
                    groupData.LK2.countMain++;
                }
            }
        }

        // Calcul pour la ville secondaire
        if (villeSec) {
            const coordSec = await fetchCoordinates(villeSec);
            if (coordSec.success) {
                if (group === "LK1") {
                    groupData.LK1.latSec += parseFloat(coordSec.lat);
                    groupData.LK1.lonSec += parseFloat(coordSec.lon);
                    groupData.LK1.countSec++;
                } else if (group === "LK2") {
                    groupData.LK2.latSec += parseFloat(coordSec.lat);
                    groupData.LK2.lonSec += parseFloat(coordSec.lon);
                    groupData.LK2.countSec++;
                }
            }
        }
    }

    // Calculer les moyennes pour chaque groupe
    return {
        LK1: {
            main: groupData.LK1.countMain > 0 ? { lat: (groupData.LK1.latMain / groupData.LK1.countMain).toFixed(4), lon: (groupData.LK1.lonMain / groupData.LK1.countMain).toFixed(4) } : { lat: '-', lon: '-' },
            secondary: groupData.LK1.countSec > 0 ? { lat: (groupData.LK1.latSec / groupData.LK1.countSec).toFixed(4), lon: (groupData.LK1.lonSec / groupData.LK1.countSec).toFixed(4) } : { lat: '-', lon: '-' }
        },
        LK2: {
            main: groupData.LK2.countMain > 0 ? { lat: (groupData.LK2.latMain / groupData.LK2.countMain).toFixed(4), lon: (groupData.LK2.lonMain / groupData.LK2.countMain).toFixed(4) } : { lat: '-', lon: '-' },
            secondary: groupData.LK2.countSec > 0 ? { lat: (groupData.LK2.latSec / groupData.LK2.countSec).toFixed(4), lon: (groupData.LK2.lonSec / groupData.LK2.countSec).toFixed(4) } : { lat: '-', lon: '-' }
        }
    };
}

// Afficher les moyennes des coordonnées pour chaque groupe
async function renderStudents(students) {
    const container = document.getElementById("meteo");
    container.innerHTML = '';
    
    // Afficher les cartes des étudiants
    for(const etudiant of students) {
        const { card, container: content } = createStudentCard(etudiant);
        container.append(card);
        await renderStudent(etudiant, content);
        card.classList.remove('loading');
    }

    // Calculer la moyenne des coordonnées pour chaque groupe
    const averages = await calculateCoordinatesAverageByGroup(students);

    // Créer un bloc d'affichage en haut à droite pour les moyennes
    const averageSection = document.createElement('div');
    averageSection.className = 'average-coordinates';
    averageSection.innerHTML = `
        <h3>Moyenne des coordonnées</h3>
        <div class="average-values">
            <div><strong>LK1 - Principale</strong>: Lat: ${averages.LK1.main.lat}, Lon: ${averages.LK1.main.lon}</div>
            <div><strong>LK1 - Secondaire</strong>: Lat: ${averages.LK1.secondary.lat}, Lon: ${averages.LK1.secondary.lon}</div>
            <div><strong>LK2 - Principale</strong>: Lat: ${averages.LK2.main.lat}, Lon: ${averages.LK2.main.lon}</div>
            <div><strong>LK2 - Secondaire</strong>: Lat: ${averages.LK2.secondary.lat}, Lon: ${averages.LK2.secondary.lon}</div>
        </div>
    `;

    // Ajouter le bloc de moyennes en haut à droite
    document.body.append(averageSection);
}
