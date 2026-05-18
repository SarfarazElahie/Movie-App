import React, { useEffect, useState, useRef } from 'react'
import MovieCard from '../MovieCard'
import GenreBar from '../GenreBar';
import "../../css/Home.css";
import { getPopularMovies, getPopularSeries , getByGenre, searchAll } from '../../services/api';
import { useLocation, useNavigationType } from 'react-router-dom';
const Home = () => {

    const [movies, setMovies] = useState([]);
    const [searchQuerry, setSearchQuerry] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false)

    const [suggestions, setSuggestions] = useState([]);      // ADD
    const [showSuggestions, setShowSuggestions] = useState(false); // ADD

    const [activeGenre, setActiveGenre]         = useState({ id: null, label: "All" });

    const [page, setPage]                       = useState(1);     
    const [hasMore, setHasMore]                 = useState(true);


    const debounceRef        = useRef(null);   // ADD — holds the debounce timer
    const searchContainerRef = useRef(null);   // ADD — ref for outside click detection

    const location = useLocation();
    const navigationType = useNavigationType()
    

     useEffect(() => {
        if (navigationType === 'POP') {
            const savedQuery   = sessionStorage.getItem('homeSearchQuery') || '';
            const savedMovies  = sessionStorage.getItem('homeSearchMovies');
            const savedGenre  = sessionStorage.getItem('homeActiveGenre');
            const savedPage   = sessionStorage.getItem('homePage');
            const savedHasMore = sessionStorage.getItem('homeHasMore');

            if (savedMovies) {
                setSearchQuerry(savedQuery);
                setMovies(JSON.parse(savedMovies));
                if (savedGenre) setActiveGenre(JSON.parse(savedGenre))
                if (savedPage)    setPage(Number(savedPage));
                if (savedHasMore) setHasMore(savedHasMore === 'true');
                setLoading(false);
                return; 
            }
        }

        loadPopularMovies();

    }, [location.key]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Helper: fetch the right data based on current state ────────
    const fetchData = async (genre, query, pageNum) => {
        if (query.trim()) {
            return await searchAll(query, pageNum);
        }
        if (genre.id === null)     return await getPopularMovies(pageNum);
        if (genre.id === "series") return await getPopularSeries(pageNum);
        return await getByGenre(genre.id, pageNum);
    };

    // ─── Helper: save everything to sessionStorage ──────────────────
    const saveSession = (query, movies, genre, pageNum, more) => {
        sessionStorage.setItem('homeSearchQuery',  query);
        sessionStorage.setItem('homeSearchMovies', JSON.stringify(movies));
        sessionStorage.setItem('homeActiveGenre',  JSON.stringify(genre));
        sessionStorage.setItem('homePage',         String(pageNum));
        sessionStorage.setItem('homeHasMore',      String(more));
    };
    
    // ─── Initial load (page 1, replaces movies) ─────────────────────
    const loadPage1 = async (genre, query) => {
        setLoading(true);
        setError(null);
        setPage(1);
        setHasMore(true);
        try {
            const { results, totalPages } = await fetchData(genre, query, 1);
            const more = 1 < Math.min(totalPages, 500); // TMDB caps at 500 pages
            setMovies(results);
            setHasMore(more);
            saveSession(query, results, genre, 1, more);
        } catch {
            setError("Failed to load content...");
        } finally {
            setLoading(false);
        }
    };

    // ─── Load More (page N, appends to movies) ──────────────────────
    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;

        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            const { results, totalPages } = await fetchData(activeGenre, searchQuerry, nextPage);
            const more = nextPage < Math.min(totalPages, 500);

            setMovies(prev => {
                const combined = [...prev, ...results];
                saveSession(searchQuerry, combined, activeGenre, nextPage, more);
                return combined;
            });
            setPage(nextPage);
            setHasMore(more);
        } catch {
            setError("Failed to load more...");
        } finally {
            setLoadingMore(false);
        }
    };

    // ─── Convenience wrappers ────────────────────────────────────────
    const loadPopularMovies = () => {
        const allGenre = { id: null, label: "All" };
        setActiveGenre(allGenre);
        setSearchQuerry("");
        setSuggestions([]);
        setShowSuggestions(false);
        loadPage1(allGenre, "");
    };

    // const movies = [
    //     {id : 1, title : "Dune: Part Two", release_date : "2024-03-01", rating : "⭐⭐⭐⭐⭐"},
    //     {id : 2, title : "Avatar: The Way of Water", release_date : "2022-12-14", rating : "⭐⭐⭐⭐"},
    //     {id : 3, title : "The Batman", release_date : "2022-03-04", rating : "⭐⭐"},
    //     {id : 4 , title : "Avengers Doomsday", release_date : "2026-12-18", rating : "⭐⭐⭐"}
    // ]

     // ─── Genre pill clicked ──────────────────────────────────────────
    const handleGenreClick = (genre) => {
        setActiveGenre(genre);
        setSearchQuerry("");
        setSuggestions([]);
        setShowSuggestions(false);
        loadPage1(genre, "");
    };

 // ─── Search submit — searches movies + series ───────────────────
    const handleSearch = async(e)=>{
        e.preventDefault();
        setShowSuggestions(false); 
        setSuggestions([]);

        if(!searchQuerry.trim()){
            handleGenreClick(activeGenre);
            return;
        }
        if (loading) return;
        loadPage1(activeGenre, searchQuerry);
    };

  // ─── Input change + debounced suggestions ────────────────────────
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuerry(value);

        if (value.trim() === "") {
            clearTimeout(debounceRef.current);
            setSuggestions([]);
            setShowSuggestions(false);
            loadPage1(activeGenre, "");
            return;
        }
        
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const { results } = await searchAll(value, 1); // suggestions always page 1
                setSuggestions(results.slice(0, 6));
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            }
        }, 350);
    }

    // ─── Suggestion clicked ──────────────────────────────────────────
    const handleSuggestionClick = (item) => {
        setSearchQuerry(item.title);
        setShowSuggestions(false);
        setSuggestions([]);
        loadPage1(activeGenre, item.title);
    };

    const getSectionHeading = () => {
        if (searchQuerry.trim())         return `Results for "${searchQuerry}"`;
        if (activeGenre.id === "series") return "Popular Series";
        if (activeGenre.id)              return `${activeGenre.label} Movies`;
        return "Popular Movies";
    };

  return (
    <>
         <div className='home'>

            {/* ── Search ── */}
            <div className="search-wrapper" ref={searchContainerRef}>
                <form onSubmit={handleSearch} className='search-form'>
                    <input
                        type="text"
                        placeholder='Search movies & series....'
                        className='search-input'
                        value={searchQuerry}
                        onChange={handleInputChange}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    <button type='submit' className='search-button'>Search</button>
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {suggestions.map((item) => (
                            <li
                                key={`${item.media_type}-${item.id}`}
                                className="suggestion-item"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSuggestionClick(item)}
                            >
                                <img
                                    className="suggestion-poster"
                                    src={
                                        item.poster_path
                                            ? `https://image.tmdb.org/t/p/w92/${item.poster_path}`
                                            : "https://via.placeholder.com/40x60?text=?"
                                    }
                                    alt={item.title}
                                />
                                <div className="suggestion-info">
                                    <span className="suggestion-title">{item.title}</span>
                                    <span className="suggestion-meta">
                                        {item.release_date?.split('-')[0] || 'N/A'}
                                        <span className={`suggestion-type ${item.media_type}`}>
                                            {item.media_type === 'tv' ? 'Series' : 'Movie'}
                                        </span>
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Genre bar ── */}
            <GenreBar activeGenreId={activeGenre.id} onGenreClick={handleGenreClick} />

            <h2 className="section-heading">{getSectionHeading()}</h2>

            {error && <div className='error'>{error}</div>}

            {/* ── Grid ── */}
            {loading ? (
                <div className='loading'>Loading....</div>
            ) : (
                <>
                    <div className="movies-grid">
                        {movies.length > 0
                            ? movies.map((item) => (
                                <MovieCard key={`${item.media_type}-${item.id}`} movie={item} />
                              ))
                            : <p className="no-results">No results found.</p>
                        }
                    </div>

                    {/* ── Load More ── */}
                    {hasMore && (
                        <div className="load-more-wrapper">
                            <button
                                className="load-more-btn"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore
                                    ? <span className="load-more-spinner" />
                                    : "Load More"
                                }
                            </button>
                        </div>
                    )}

                    {/* ── End of results ── */}
                    {!hasMore && movies.length > 0 && (
                        <p className="end-of-results">You've reached the end</p>
                    )}
                </>
            )}

        </div>
    </>
  )
}

export default Home