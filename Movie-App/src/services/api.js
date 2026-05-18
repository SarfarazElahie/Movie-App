const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const normalize = (item) => ({
    ...item,
    title:        item.title        || item.name,
    release_date: item.release_date || item.first_air_date,
    media_type:   item.media_type   || 'movie',
});

// All functions now return { results, totalPages } instead of just results array

export const getPopularMovies = async (page = 1) => {
    const res  = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    return { results: data.results.map(normalize), totalPages: data.total_pages };
};

export const getPopularSeries = async (page = 1) => {
    const res  = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    return {
        results: data.results.map(item => normalize({ ...item, media_type: 'tv' })),
        totalPages: data.total_pages
    };
};

export const getByGenre = async (genreId, page = 1) => {
    const res  = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    );
    const data = await res.json();
    return { results: data.results.map(normalize), totalPages: data.total_pages };
};

export const searchAll = async (query, page = 1) => {
    const res  = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await res.json();
    return {
        results: data.results
            .filter(item => item.media_type !== 'person')
            .map(normalize),
        totalPages: data.total_pages
    };
};

// Details — unchanged
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