import React from 'react'
import "../css/MovieCard.css";
import { useMovieContext } from '../contexts/MovieContext';

const MovieCard = ({movie}) => {

    const {isFavorite, addTofavorites, removeTofavorites} = useMovieContext();
    const favorite = isFavorite(movie.id);

    const isFav = isFavorite(movie.id)

    function onFavoriteClick(e) {
        e.preventDefault();
        if(favorite) removeTofavorites(movie.id);
        else addTofavorites(movie);
    }
    

  return (
    <>
        <div className="movie-card">
            <div className="movie-poster">
                <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
                <div className="movie-overlay">
                    <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                        &#10084;
                    </button>
                     <div className="movie-hover-info">
                        <p className="movie-overview">
                            {movie.overview ? movie.overview.slice(0, 120) + "..." : "No description available."}
                        </p>
                        <div className="movie-hover-stats">
                            <span>⭐ {movie.vote_average?.toFixed(1)} / 10</span>
                            <span>🗳️ {movie.vote_count?.toLocaleString()} votes</span>
                        </div>
                     </div>
                </div>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.release_date}</p>
                <h3>{movie.rating}</h3>
            </div>
        </div>
    </>
  )
}

export default MovieCard