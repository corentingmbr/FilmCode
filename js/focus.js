const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOTk2OTA2N2EzMjE4Y2U0M2M0OTE1ODYwZmI1YTY4MSIsIm5iZiI6MTczOTg4NDM3My4yMTIsInN1YiI6IjY3YjQ4NzU1OTFkN2U2NmM2NTZkZDFmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6Br1nDrZmToRWUlTfdv90vyrGd0XTKU4tOu8X23lkBY";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER = "img/PopCorn.png";       // Image de secours pour les posters
const FALLBACK_BACKDROP = "img/default-backdrop.jpg"; // Image de secours pour le backdrop (à créer ou remplacer)
const FALLBACK_PROFILE = "img/iconhuman.png";    // Image de secours pour les profils

const fetchConfig = {
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

// Récupère l'ID du film depuis l'URL
function getElementFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type"); // "movie" ou "tv"
    const id = params.get("id"); // ID du film ou de la série

    console.log("Type récupéré :", type);
    console.log("ID récupéré :", id);

    return { type, id };
}

// Récupère les détails du film depuis l'API
async function fetchElementDetails(type, id) {
    const url = `${BASE_URL}/${type}/${id}?language=fr-FR`;
    try {
        const response = await fetch(url, fetchConfig);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error);
        return null;
    }
}

// Récupère le casting du film
async function fetchElementCredits(type, id) {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/credits?language=fr-FR`, fetchConfig);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération du casting:", error);
        return null;
    }
}

// Fonction pour obtenir l'URL de l'image ou l'image de secours si nécessaire
function getImageUrl(path, type = 'poster') {
    if (!path) {
        // Retourne l'image de secours appropriée selon le type d'image
        switch(type) {
            case 'backdrop': return FALLBACK_BACKDROP;
            case 'profile': return FALLBACK_PROFILE;
            default: return FALLBACK_POSTER;
        }
    }
    return IMAGE_BASE_URL + path;
}

// Format date pour l'affichage
function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Affiche les détails du film sur la page
async function displayElementDetails() {
    const { type, id } = getElementFromUrl();
    if (!type || !id) return;

    const element = await fetchElementDetails(type, id);
    if (!element || element.success === false) return;

    // Modify the background image (backdrop)
    const bannerElement = document.querySelector(".banner");
    bannerElement.style.backgroundImage = `url(${getImageUrl(element.backdrop_path, 'backdrop')})`;

    // En cas d'erreur de chargement du backdrop
    const backdropImage = new Image();
    backdropImage.src = getImageUrl(element.backdrop_path, 'backdrop');
    backdropImage.onerror = () => {
        bannerElement.style.backgroundImage = `url(${FALLBACK_BACKDROP})`;
    };

    // Modify the page info
    const posterImg = document.querySelector(".banner img");
    posterImg.src = getImageUrl(element.poster_path, 'poster');
    posterImg.onerror = function() { this.src = FALLBACK_POSTER; };
    posterImg.classList.add("poster");

    const score = Math.round(element.vote_average * 10);
    const title = element.title || element.name;
    const releaseDate = element.first_air_date || element.release_date;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const genres = element.genres.map(g => g.name).join(", ");
    const details = type === "tv"
        ? `${element.number_of_seasons} ${element.number_of_seasons > 1 ? 'saisons' : 'saison'}, ${element.number_of_episodes} ${element.number_of_episodes > 1 ? 'épisodes' : 'épisode'}`
        : `${element.runtime} min`;
    const overview = element.overview || 'Aucune description disponible.';

    document.querySelector(".score").textContent = `${score}%`;
    document.querySelector(".title-date h1").textContent = `${title} (${releaseYear})`;
    document.querySelector(".title-date span").textContent = `${formatDate(releaseDate)} - ${genres} - ${details}`;
    document.querySelector(".synopsis p").textContent = overview;

    // Load the cast
    displayElementCredits(type, id);
}

async function displayElementCredits(type, id) {
    const credits = await fetchElementCredits(type, id);
    if (!credits) return;

    const actorsContainer = document.querySelector(".actors");
    actorsContainer.innerHTML = "";

    credits.cast.slice(0, 8).forEach(actor => {
        const actorElement = document.createElement("div");
        actorElement.className = "actor";

        actorElement.innerHTML = `
        <img src="${getImageUrl(actor.profile_path, 'profile')}" alt="${actor.name}" onerror="this.src='${FALLBACK_PROFILE}'">
        <h4>${actor.name}</h4>
        <span>${actor.character || 'Rôle inconnu'}</span>
    `;
        actorsContainer.appendChild(actorElement);
    });
}

document.addEventListener("DOMContentLoaded", displayElementDetails);