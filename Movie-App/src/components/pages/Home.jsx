import React, { useEffect, useState } from 'react'
import MovieCard from '../MovieCard'
import "../../css/Home.css";
import { getPopularMovies, searchMovies } from '../../services/api';
import { useLocation, useNavigationType } from 'react-router-dom';
const Home = () => {

    const [movies, setMovies] = useState([]);
    const [searchQuerry, setSearchQuerry] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

     const loadPopularMovies = async () => {
        setSearchQuerry("");
        setLoading(true);
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
            setLoading(true);
            getPopularMovies()
            .then(popularMovies => setMovies(popularMovies))
            .catch(()=> setError("Failed to load movies.."))
            .finally(()=> setLoading(false));
        }
    }

  return (
    <>
        <div className='home'>

            <form onSubmit={handleSearch} className='search-form'>
                <input type="text" placeholder='Search for movies....' className='search-input' 
                    value={searchQuerry} onChange={handleInputChange}/>
                <button type='submit' className='search-button'>Search</button>
            </form>

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