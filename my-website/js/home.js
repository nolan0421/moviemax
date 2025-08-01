const API_KEY = '6fcb6a54a1cf6dcf2802fc1d9af8b3c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 15; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}
async function fetchTrendingKoreanTV() {
  let allResults = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ko'
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();

  const container = document.getElementById('search-results');
  container.innerHTML = '';
  data.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    container.appendChild(img);
  });
}
function loadCategory(category) {
  if (category === 'tv') {
    fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const tvShows = data.results.map(show => ({
          ...show,
          media_type: "tv"
        }));
        displayCategoryMovies(tvShows);
      });
  } else if (category === 'anime') {
    fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja`)
      .then(res => res.json())
      .then(data => {
        const anime = data.results.map(anime => ({
          ...anime,
          media_type: "tv"
        }));
        displayCategoryMovies(anime);
      });
  } else {
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${category}`)
      .then(res => res.json())
      .then(data => {
        const movies = data.results.map(movie => ({
          ...movie,
          media_type: "movie"
        }));
        displayCategoryMovies(movies);
      });
  }
}


function displayCategoryMovies(items) {
  const container = document.getElementById('movies');
  container.innerHTML = '';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
  container.style.gap = '20px';

  items.forEach(item => {
    if (!item.poster_path) return;
    const div = document.createElement('div');
    div.className = 'movie';
    div.style.cursor = 'pointer';
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${item.title || item.name}" />
      <p>${item.title || item.name}</p>
    `;
    div.onclick = () => showDetails(item);
    container.appendChild(div);
  });
}

async function init() {
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();
  const kdrama = await fetchTrendingKoreanTV();

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
  displayList(kdrama, 'kdrama-list');
}


let trendingMoviePage = 1;
let trendingTVPage = 1;
let trendingAnimePage = 1;
let trendingKdramaPage = 1;


async function loadMoreTrending(type) {
  if (type === 'movie') {
    trendingMoviePage++;
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${trendingMoviePage}`);
    const data = await res.json();
    displayList(data.results, 'movies-list', true);
  } else if (type === 'tv') {
    trendingTVPage++;
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${trendingTVPage}`);
    const data = await res.json();
    displayList(data.results, 'tvshows-list', true);
  } else if (type === 'anime') {
    trendingAnimePage++;
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${trendingAnimePage}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    displayList(filtered, 'anime-list', true);
  } else if (type === 'kdrama') {
    trendingKdramaPage++;
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${trendingKdramaPage}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ko'
    );
    displayList(filtered, 'kdrama-list', true);
  }
}
function displayList(items, containerId, append = false) {
  const container = document.getElementById(containerId);
  if (!append) {
    container.innerHTML = '';
  }
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}



function setupInfiniteScroll() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.id === 'movies-trigger') {
          loadMoreTrending('movie');
        } else if (entry.target.id === 'tvshows-trigger') {
          loadMoreTrending('tv');
        } else if (entry.target.id === 'anime-trigger') {
          loadMoreTrending('anime');
        } else if (entry.target.id === 'kdrama-trigger') {
          loadMoreTrending('kdrama');
        }
      }
    });
  }, options);

  observer.observe(document.getElementById('movies-trigger'));
  observer.observe(document.getElementById('tvshows-trigger'));
  observer.observe(document.getElementById('anime-trigger'));
  observer.observe(document.getElementById('kdrama-trigger'));
}


init();init().then(setupInfiniteScroll);

