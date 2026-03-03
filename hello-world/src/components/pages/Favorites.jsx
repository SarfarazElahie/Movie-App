import React from 'react'
import "../../css/favorites.css";
import { useMovieContext } from '../../contexts/MovieContext';
import MovieCard from '../MovieCard';


const Favorites = () => {
  const {favorites} = useMovieContext();

 if (favorites) {
    return (
        <div className='favorites'>
            <h2>Your Favorites</h2>
            <div className="movies-grid">
                {favorites.map((movie) =>
                    <MovieCard key={movie.id} movie={movie}/>
                )}
            </div>
        </div>
    );
}

  return (
    <>
        <div className='favorites-empty'>
            <h2>There are no favorites yet</h2>
            <p>You can add your favorite movies here</p>
        </div>
    </>
  )
}

export default Favorites