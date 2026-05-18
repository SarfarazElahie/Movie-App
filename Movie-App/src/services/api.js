const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// ─── normalize: TV uses .name / .first_air_date, movies use .title / .release_date
const normalize = (item) => ({
    ...item,
    title:        item.title        || item.name,
    release_date: item.release_date || item.first_air_date,
    media_type:   item.media_type   || 'movie',
});

// ─── Movies ───────────────────────────────────────────────────────
export const getPopularMovies = async () => {
    const res  = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results.map(normalize);
};

export const getByGenre = async (genreId) => {
    const res  = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
    );
    const data = await res.json();
    return data.results.map(normalize);
};

// ─── Series (TV) ──────────────────────────────────────────────────
export const getPopularSeries = async () => {
    const res  = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results.map(item => normalize({ ...item, media_type: 'tv' }));
};

// ─── Search both movies + series in one call ──────────────────────
export const searchAll = async (query) => {
    const res  = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return data.results
        .filter(item => item.media_type !== 'person') // exclude people results
        .map(normalize);
};

// ─── Details — works for both movie and tv ────────────────────────
export const getDetails = async (type, id) => {
    const res  = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    return normalize({ ...data, media_type: type });
};

export const getCredits = async (type, id) => {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
    const data = await res.json();
    return data.cast;
};

export const getVideos = async (type, id) => {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results.find(v => v.type === "Trailer" && v.site === "YouTube") || null;
};