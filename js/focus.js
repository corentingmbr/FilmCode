const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOTk2OTA2N2EzMjE4Y2U0M2M0OTE1ODYwZmI1YTY4MSIsIm5iZiI6MTczOTg4NDM3My4yMTIsInN1YiI6IjY3YjQ4NzU1OTFkN2U2NmM2NTZkZDFmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6Br1nDrZmToRWUlTfdv90vyrGd0XTKU4tOu8X23lkBY";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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
    }
}


// Affiche les détails du film sur la page
async function displayElementDetails() {
    const { type, id } = getElementFromUrl();
    if (!type || !id) return;

    const element = await fetchElementDetails(type, id);
    if (!element || element.success === false) return;

    // Modify the background image (backdrop)
    if (element.backdrop_path) {
        document.querySelector(".banner").style.backgroundImage = `url(${IMAGE_BASE_URL + element.backdrop_path})`;
    }

    // Modify the page info
    const posterImg = document.querySelector(".banner img");
    posterImg.src = IMAGE_BASE_URL + element.poster_path;
    posterImg.classList.add("poster");

    const score = Math.round(element.vote_average * 10);
    const title = element.title || element.name;
    const releaseDate = element.first_air_date || element.release_date;
    const genres = element.genres.map(g => g.name).join(", ");
    const details = type === "tv"
        ? `${element.number_of_seasons} ${element.number_of_seasons > 1 ? 'saisons' : 'saison'}, ${element.number_of_episodes} ${element.number_of_episodes > 1 ? 'épisodes' : 'épisode'}`
        : `${element.runtime} min`;
    const overview = element.overview;

    document.querySelector(".score").textContent = `${score}%`;
    document.querySelector(".title-date h1").textContent = `${title} (${new Date(releaseDate).getFullYear()})`;
    document.querySelector(".title-date span").textContent = `${releaseDate} - ${genres} - ${details}`;
    document.querySelector(".synopsis p").textContent = overview;

    // Log details to the console
    console.log("Score:", score);
    console.log("Title:", title);
    console.log("Release Date:", releaseDate);
    console.log("Genres:", genres);
    console.log("Details:", details);
    console.log("Overview:", overview);

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
        const actorImage = actor.profile_path ? `${IMAGE_BASE_URL + actor.profile_path}` : 'img/iconhuman.png';
        actorElement.innerHTML = `
            <img src="${actorImage}" alt="${actor.name}">
            <h4>${actor.name}</h4>
            <span>${actor.character}</span>
        `;
        actorsContainer.appendChild(actorElement);
    });
}


document.addEventListener("DOMContentLoaded", displayElementDetails);
