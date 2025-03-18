const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOTk2OTA2N2EzMjE4Y2U0M2M0OTE1ODYwZmI1YTY4MSIsIm5iZiI6MTczOTg4NDM3My4yMTIsInN1YiI6IjY3YjQ4NzU1OTFkN2U2NmM2NTZkZDFmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6Br1nDrZmToRWUlTfdv90vyrGd0XTKU4tOu8X23lkBY";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// API fetch configuration
const fetchConfig = {
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

// Fetch trending movies/shows
async function fetchTrending(timeWindow = 'day') {
    try {
        const response = await fetch(`${BASE_URL}/trending/all/${timeWindow}?language=fr-FR`, fetchConfig);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending:', error);
        return [];
    }
}

// Fetch TV shows (popular or top rated)
async function fetchTVShows(category = 'top_rated') {
    try {
        const response = await fetch(`${BASE_URL}/tv/${category}?language=fr-FR`, fetchConfig);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        return [];
    }
}

// Format date to French format
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Calculate score class based on vote average
function getScoreClass(vote) {
    if (vote >= 8) return '80';
    if (vote >= 6) return '60';
    if (vote >= 4) return '40';
    return '20';
}

// Display trending content
async function displayTrending(timeWindow = 'day') {
    const trending = await fetchTrending(timeWindow);
    const container = document.getElementById('tendances');
    container.innerHTML = '';

    trending.slice(0, 4).forEach(item => {
        const score = Math.round(item.vote_average * 10);
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date;

        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <a href="#">
                <img src="${IMAGE_BASE_URL}${item.poster_path}" alt="${title}" onerror="this.onerror=null;this.src='img/PopCorn.png';">
                <div class="score">
                    <p>${score}%</p>
                </div>
                <h5>${title}</h5>
                <p>${formatDate(date)}</p>
            </a>
        `;
        container.appendChild(movieElement);
    });
}

// Display TV shows
async function displayTVShows(category = 'top_rated') {
    const shows = await fetchTVShows(category);
    const container = document.getElementById('populaires');
    container.innerHTML = '';

    shows.slice(0, 4).forEach(show => {
        const score = Math.round(show.vote_average * 10);

        const showElement = document.createElement('div');
        showElement.className = 'movie';
        showElement.innerHTML = `
            <a href="#">
                <img src="${IMAGE_BASE_URL}${show.poster_path}" alt="${show.name}" onerror="this.onerror=null;this.src='img/PopCorn.png';">
                <div class="score">
                    <p>${score}%</p>
                </div>
                <h5>${show.name}</h5>
                <p>${formatDate(show.first_air_date)}</p>
            </a>
        `;
        container.appendChild(showElement);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    displayTrending('day');
    displayTVShows('top_rated');

    // Trending filters
    document.getElementById('day').addEventListener('click', (e) => {
        document.querySelectorAll('#title-tendances button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        displayTrending('day');
    });

    document.getElementById('week').addEventListener('click', (e) => {
        document.querySelectorAll('#title-tendances button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        displayTrending('week');
    });

    // TV Show filters
    document.getElementById('top_rated').addEventListener('click', (e) => {
        document.querySelectorAll('#title-category button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        displayTVShows('top_rated');
    });

    document.getElementById('popular').addEventListener('click', (e) => {
        document.querySelectorAll('#title-category button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        displayTVShows('popular');
    });

    // Mobile menu
    const mobileNav = document.getElementById('mobileNav');
    const barr = document.getElementById('barr');
    barr.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
    });
});