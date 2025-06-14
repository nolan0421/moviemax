const API_KEY = '6fcb6a54a1cf6dcf2802fc1d9af8b3c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// Trending fetchers
async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}
async function fetchTrendingAnime() {
  let all = [];
  for (let p=1; p<=15; p++) {
    const { results } = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${p}`).then(r=>r.json());
    all.push(...results.filter(i=> i.original_language==='ja' && i.genre_ids.includes(16)));
  }
  return all;
}
async function fetchTrendingKoreanTV() {
  let all = [];
  for (let p=1; p<=5; p++) {
    const { results } = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${p}`).then(r=>r.json());
    all.push(...results.filter(i=> i.original_language==='ko'));
  }
  return all;
}

// Banner carousel
let bannerMovies = [];
let currentScroll = 0;
async function fetchTrendingBanners() {
  const { results } = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`).then(r=> r.json());
  bannerMovies = results.filter(m=> m.backdrop_path || m.poster_path);
  renderBanners();
}
function renderBanners() {
  const track = document.getElementById('banner-track');
  track.innerHTML = '';
  bannerMovies.forEach(movie => {
    const imgPath = movie.backdrop_path || movie.poster_path;
    const item = document.createElement('div');
    item.className = 'banner-item';
    item.style.backgroundImage = `url(${IMG_URL}${imgPath})`;
    item.innerHTML = `<h3>${movie.title||movie.name}</h3>`;
    item.onclick = () => showDetails(movie);
    track.appendChild(item);
  });
}
function scrollBanner(direction) {
  const scrollAmt = 240;
  currentScroll = Math.min(
    Math.max(currentScroll + direction*scrollAmt, 0),
    (bannerMovies.length - 5)*scrollAmt
  );
  document.getElementById('banner-track').style.transform = `translateX(-${currentScroll}px)`;
}

// Show details
function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average/2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}
function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type==='movie'? 'movie': 'tv';
  let url = '';
  if (server==='vidsrc.cc') url = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  if (server==='vidsrc.me') url = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  if (server==='player.videasy.net') url = `https://player.videasy.net/${type}/${currentItem.id}`;
  document.getElementById('modal-video').src = url;
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// Search
function openSearchModal() { document.getElementById('search-modal').style.display='flex'; document.getElementById('search-input').focus(); }
function closeSearchModal() { document.getElementById('search-modal').style.display='none'; document.getElementById('search-results').innerHTML=''; }
async function searchTMDB() {
  const q = document.getElementById('search-input').value.trim();
  const container = document.getElementById('search-results');
  if (!q) return container.innerHTML='';
  const { results } = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${q}`).then(r=> r.json());
  container.innerHTML = '';
  results.forEach(item=>{
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title||item.name;
    img.onclick = ()=>{ closeSearchModal(); showDetails(item); };
    container.appendChild(img);
  });
}

// Category loader
function loadCategory(cat) {
  let url, typeMap;
  if (cat==='tv') { url=`${BASE_URL}/discover/tv?api_key=${API_KEY}`; typeMap='tv'; }
  else if (cat==='anime') { url=`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja`; typeMap='tv'; }
  else { url=`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${cat}`; typeMap='movie'; }
  fetch(url).then(r=>r.json()).then(data=>{
    displayCategoryMovies(data.results.map(item=>({...item, media_type:typeMap})));  });
}
function displayCategoryMovies(items) {
  const cont = document.getElementById('movies');
  cont.innerHTML = '';
  cont.style.display='grid';
  cont.style.gridTemplateColumns = 'repeat(auto-fit,minmax(150px,1fr))';
  cont.style.gap='20px';
  items.forEach(item=>{
    if (!item.poster_path) return;
    const d = document.createElement('div'); d.className='movie'; d.style.cursor='pointer';
    d.innerHTML = `<img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${item.title||item.name}" /><p>${item.title||item.name}</p>`;
    d.onclick = ()=> showDetails(item);
    cont.appendChild(d);
  });
}

// Init
async function init() {
  fetchTrendingBanners();
  const [movies, tv, anime, kdrama] = await Promise.all([
    fetchTrending('movie'),
    fetchTrending('tv'),
    fetchTrendingAnime(),
    fetchTrendingKoreanTV()
  ]);
  displayList(movies, 'movies-list');
  displayList(tv, 'tvshows-list');
  displayList(anime, 'anime-list');
  displayList(kdrama, 'kdrama-list');
}

document.addEventListener('DOMContentLoaded', init);

// Reuse displayList
function displayList(items, id) {
  const c = document.getElementById(id); c.innerHTML='';
  items.forEach(i=>{
    if (!i.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${i.poster_path}`;
    img.alt = i.title||i.name;
    img.onclick = ()=> showDetails(i);
    c.appendChild(img);
  });
}
