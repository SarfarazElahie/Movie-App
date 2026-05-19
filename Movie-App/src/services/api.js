const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const normalize = (item) => ({
    ...item,
    title:        item.title        || item.name,
    release_date: item.release_date || item.first_air_date,
    media_type:   item.media_type   || 'movie',
});

//Home shows movies + series (trending/all)
export const getPopularAll = async (page = 1) => {
    const res  = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    return {results: data.results.filter(i => i.media_type !== 'person').map(normalize),
            totalPages: data.total_pages };
};

// Series pill
export const getPopularSeries = async (page = 1) => {
    const res  = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    return {
        results: data.results.map(item => normalize({ ...item, media_type: 'tv' })),
        totalPages: data.total_pages
    };
};

//Genre filter shows movies + series
export const getByGenre = async (genreId, page = 1) => {
    const [movieRes, tvRes] = await Promise.all([
        fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`),
        fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`)
    ]);
    const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);

    const movies = movieData.results.map(i => normalize({ ...i, media_type: 'movie' }));
    const series = tvData.results.map(i => normalize({ ...i, media_type: 'tv' }));
    const combined = [...movies, ...series].sort((a, b) => b.popularity - a.popularity);

    return {
        results:    combined,
        totalPages: Math.max(movieData.total_pages, tvData.total_pages)
    };
};

// ─── Search ───────────────────────────────────────────────────────
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

// ─── Details (movie or tv) ────────────────────────────────────────
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

// ─── Recommendations ───────────────────────────────────
export const getRecommendations = async (type, id) => {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results
        .map(i => normalize({ ...i, media_type: i.media_type || type }))
        .slice(0, 12);
};

// ─── Person / Cast member ─────────────────────────────
export const getPersonDetails = async (personId) => {
    const res  = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}`);
    return res.json();
};

export const getPersonCredits = async (personId) => {
    const res  = await fetch(`${BASE_URL}/person/${personId}/combined_credits?api_key=${API_KEY}`);
    const data = await res.json();
    // deduplicate by id, sort by popularity
    const seen = new Set();
    return (data.cast || [])
        .map(i => normalize({ ...i, media_type: i.media_type || 'movie' }))
        .filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; })
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 24);
};