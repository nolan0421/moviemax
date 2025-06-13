function loadCategory(genreId) {
  const apiKey = '6fcb6a54a1cf6dcf2802fc1d9af8b3c8';
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("movies-list");
      container.innerHTML = '';
      data.results.forEach(movie => {
        const div = document.createElement('div');
        div.className = 'movie-item';
        div.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
          <p>${movie.title}</p>
        `;
        container.appendChild(div);
      });
    })
    .catch(error => {
      console.error("Error fetching category:", error);
    });
}
