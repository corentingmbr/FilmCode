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
function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    console.log("Movie ID from URL:", params.get("id"));
    return params.get("id");
}

// Récupère les détails du film depuis l'API


async function fetchMovieDetails(movieId) {
    const url = `${BASE_URL}/movie/${movieId}?language=fr-FR`;
    const response = await fetch(url, fetchConfig);
    return response.json();
}


// Récupère le casting du film
async function fetchMovieCredits(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?language=fr-FR`, fetchConfig);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération du casting:", error);
    }
}

// Affiche les détails du film sur la page
async function displayMovieDetails() {
    const movieId = getMovieIdFromUrl();
    if (!movieId) return;

    const movie = await fetchMovieDetails(movieId);
    console.log(movie);

    if (!movie || movie.success === false) return;

    if (movie.backdrop_path) {
        document.querySelector(".banner").style.backgroundImage = `url(${IMAGE_BASE_URL + movie.backdrop_path})`;
    }

    document.querySelector(".banner img").src = IMAGE_BASE_URL + movie.poster_path;
    document.querySelector(".title-date h1").textContent = `${movie.title} (${new Date(movie.release_date).getFullYear()})`;
    document.querySelector(".title-date span").textContent = `${movie.release_date} - ${movie.genres.map(g => g.name).join(", ")} - ${movie.runtime} min`;
    document.querySelector(".synopsis p").textContent = movie.overview;

    displayMovieCredits(movieId);
}

async function displayMovieCredits(movieId) {
    const credits = await fetchMovieCredits(movieId);
    if (!credits) return;

    const actorsContainer = document.querySelector(".actors");
    actorsContainer.innerHTML = "";

    credits.cast.slice(0, 4).forEach(actor => {
        const actorElement = document.createElement("div");
        actorElement.className = "actor";
        actorElement.innerHTML = `
            <img src="${IMAGE_BASE_URL + actor.profile_path}" alt="${actor.name}">
            <h4>${actor.name}</h4>
            <span>${actor.character}</span>
        `;
        actorsContainer.appendChild(actorElement);
    });
}

document.addEventListener("DOMContentLoaded", displayMovieDetails);