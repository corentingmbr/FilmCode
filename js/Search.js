// Imports des configurations depuis Script.js
const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOTk2OTA2N2EzMjE4Y2U0M2M0OTE1ODYwZmI1YTY4MSIsIm5iZiI6MTczOTg4NDM3My4yMTIsInN1YiI6IjY3YjQ4NzU1OTFkN2U2NmM2NTZkZDFmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6Br1nDrZmToRWUlTfdv90vyrGd0XTKU4tOu8X23lkBY";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMAGE = "img/PopCorn.png";

const fetchConfig = {
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

// Fonction pour formater la date (réutilisée de Script.js)
function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Fonction pour obtenir l'URL du poster
function getPosterUrl(posterPath) {
    return posterPath ? `${IMAGE_BASE_URL}${posterPath}` : FALLBACK_IMAGE;
}

// Fonction de recherche multi-critères (films et séries)
async function searchMulti(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=fr-FR`, fetchConfig);
        const data = await response.json();
        return data.results.filter(item => item.media_type !== 'person'); // Exclure les personnes des résultats
    } catch (error) {
        console.error('Erreur de recherche:', error);
        return [];
    }
}

// Fonction pour créer un élément de liste déroulante
function createDropdownItem(item) {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;
    const year = date ? new Date(date).getFullYear() : 'N/A';
    const mediaTypeLabel = type === 'tv' ? 'Série' : 'Film';

    const itemElement = document.createElement('a');
    itemElement.href = `focus.html?type=${type}&id=${item.id}`;
    itemElement.className = 'dropdown-item';
    itemElement.innerHTML = `
        <img src="${getPosterUrl(item.poster_path)}" alt="${title}" onerror="this.src='${FALLBACK_IMAGE}'">
        <div class="item-details">
            <span class="item-title">${title}</span>
            <span class="item-meta">${mediaTypeLabel} • ${year}</span>
        </div>
        <i class="fas fa-arrow-right item-link-icon"></i>
    `;
    return itemElement;
}

// Fonction pour afficher les résultats de recherche dans une liste déroulante
function displaySearchResults(results) {
    const searchContainer = document.querySelector('.saveMe');
    let dropdownMenu = document.getElementById('search-dropdown');

    // Créer le menu déroulant s'il n'existe pas
    if (!dropdownMenu) {
        dropdownMenu = document.createElement('div');
        dropdownMenu.id = 'search-dropdown';
        dropdownMenu.className = 'search-dropdown';
        searchContainer.appendChild(dropdownMenu);
    }

    // Réinitialiser le contenu
    dropdownMenu.innerHTML = '';

    // Vérifier s'il y a des résultats
    if (results.length === 0) {
        dropdownMenu.innerHTML = '<div class="dropdown-item no-results">Aucun résultat trouvé</div>';
        return;
    }

    // Limiter à 8 résultats
    results.slice(0, 8).forEach(item => {
        const resultItem = createDropdownItem(item);
        dropdownMenu.appendChild(resultItem);
    });
}

// Gestion de la recherche en temps réel
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-container input');
    const searchContainer = document.querySelector('.saveMe');

    // Debounce pour éviter trop d'appels API
    let searchTimeout;
    searchInput.addEventListener('input', async (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        const dropdownMenu = document.getElementById('search-dropdown');

        // Masquer les résultats si la recherche est vide
        if (query.length < 2) {
            if (dropdownMenu) dropdownMenu.remove();
            return;
        }

        // Délai pour réduire le nombre de requêtes
        searchTimeout = setTimeout(async () => {
            const results = await searchMulti(query);
            displaySearchResults(results);
        }, 300);
    });

    // Fermer les résultats de recherche si on clique ailleurs
    document.addEventListener('click', (e) => {
        const dropdownMenu = document.getElementById('search-dropdown');
        if (dropdownMenu && !searchContainer.contains(e.target)) {
            dropdownMenu.remove();
        }
    });

    // Empêcher la propagation des clics dans le menu déroulant
    searchContainer.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', setupSearchFunctionality);