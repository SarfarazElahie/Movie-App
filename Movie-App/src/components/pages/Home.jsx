import React, { useEffect, useState, useRef } from 'react'
import MovieCard from '../MovieCard'
import "../../css/Home.css";
import { getPopularMovies, searchMovies } from '../../services/api';
import { useLocation, useNavigationType } from 'react-router-dom';
const Home = () => {

    const [movies, setMovies] = useState([]);
    const [searchQuerry, setSearchQuerry] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [suggestions, setSuggestions] = useState([]);      // ADD
    const [showSuggestions, setShowSuggestions] = useState(false); // ADD

    const debounceRef        = useRef(null);   // ADD — holds the debounce timer
    const searchContainerRef = useRef(null);   // ADD — ref for outside click detection

    const location = useLocation();
    const navigationType = useNavigationType()
    

     useEffect(() => {
        if (navigationType === 'POP') {
            const savedQuery   = sessionStorage.getItem('homeSearchQuery') || '';
            const savedMovies  = sessionStorage.getItem('homeSearchMovies');

            if (savedMovies) {
                setSearchQuerry(savedQuery);
                setMovies(JSON.parse(savedMovies));
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

     const loadPopularMovies = async () => {
        setSearchQuerry("");
        setLoading(true);
        setSuggestions([]);
        setShowSuggestions(false);
        try {
            const popularMovies = await getPopularMovies();
            setMovies(popularMovies);
            setError(null);
            sessionStorage.setItem('homeSearchQuery',  '');
            sessionStorage.setItem('homeSearchMovies', JSON.stringify(popularMovies));
        } catch (err) {
            setError("Failed to load movies...");
        } finally {
            setLoading(false);
        }
    };


    // const movies = [
    //     {id : 1, title : "Dune: Part Two", release_date : "2024-03-01", rating : "⭐⭐⭐⭐⭐"},
    //     {id : 2, title : "Avatar: The Way of Water", release_date : "2022-12-14", rating : "⭐⭐⭐⭐"},
    //     {id : 3, title : "The Batman", release_date : "2022-03-04", rating : "⭐⭐"},
    //     {id : 4 , title : "Avengers Doomsday", release_date : "2026-12-18", rating : "⭐⭐⭐"}
    // ]

    const handleSearch = async(e)=>{
        e.preventDefault();
        setShowSuggestions(false); 
        setSuggestions([]);

        if(!searchQuerry.trim()){
            await loadPopularMovies();
            return;
        }

            if(loading) return
            setLoading(true)
                try{
                    const searchResults = await searchMovies(searchQuerry);
                    setMovies(searchResults);
                    setError(null);
                    sessionStorage.setItem('homeSearchQuery',  searchQuerry); 
                    sessionStorage.setItem('homeSearchMovies', JSON.stringify(searchResults));
                }
                catch(err){
                    console.error(err);
                    setError("Failed to load movies...");
                }
                finally{
                     setLoading(false);
                };  
    };


    const handleInputChange = (e)=>{
        const value = e.target.value;
        setSearchQuerry(value);

        if(value.trim() === ""){
            clearTimeout(debounceRef.current);
            setSuggestions([]);
            setShowSuggestions(false);
            setLoading(true);
            getPopularMovies()
            .then(popularMovies => setMovies(popularMovies))
            .catch(()=> setError("Failed to load movies.."))
            .finally(()=> setLoading(false));
            return;
        }
        
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchMovies(value);
                setSuggestions(results.slice(0, 10)); // show top 6
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            }
        }, 350);
    }

    const handleSuggestionClick = async (movie) => {
        setSearchQuerry(movie.title);
        setShowSuggestions(false);
        setSuggestions([]);

        setLoading(true);
        try {
            const results = await searchMovies(movie.title);
            setMovies(results);
            setError(null);
            sessionStorage.setItem('homeSearchQuery',  movie.title);
            sessionStorage.setItem('homeSearchMovies', JSON.stringify(results));
        } catch {
            setError("Failed to load movies...");
        } finally {
            setLoading(false);
        }
    };

  return (
    <>
        <div className='home'>

            <div className="search-wrapper" ref={searchContainerRef}>

                    <form onSubmit={handleSearch} className='search-form'>
                        <input
                            type="text"
                            placeholder='Search for movies....'
                            className='search-input'
                            value={searchQuerry}
                            onChange={handleInputChange}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        />
                        <button type='submit' className='search-button'>Search</button>
                    </form>

        
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="suggestions-dropdown">
                            {suggestions.map((movie) => (
                                <li
                                    key={movie.id}
                                    className="suggestion-item"
                                    onMouseDown={(e) => e.preventDefault()} 
                                    onClick={() => handleSuggestionClick(movie)}
                                >
                                
                                    <img
                                        className="suggestion-poster"
                                        src={
                                            movie.poster_path
                                                ? `https://image.tmdb.org/t/p/w92/${movie.poster_path}`
                                                : "https://via.placeholder.com/40x60?text=?"
                                        }
                                        alt={movie.title}
                                    />
                                    <div className="suggestion-info">
                                        <span className="suggestion-title">{movie.title}</span>
                                        <span className="suggestion-year">
                                            {movie.release_date?.split('-')[0] || 'N/A'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            {error && <div className='error'>{error}</div>}
            {loading ? (<div className='loading'>Loading....</div>) :

                (<div className="movies-grid">
                    {movies.map((movie) =>
                    <MovieCard key={movie.id} movie={movie}/>)}
                </div>)

            }
            
        </div>
    </>
  )
}

export default Home