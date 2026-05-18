import React from 'react'
import "../css/MovieCard.css";
import { useMovieContext } from '../contexts/MovieContext';
import { Link } from 'react-router-dom';

const MovieCard = ({movie}) => {

    const {isFavorite, addTofavorites, removeTofavorites} = useMovieContext();
    const favorite = isFavorite(movie.id);

    // ─── TV shows use .name and .first_air_date — normalize here ───
    const title   = movie.title        || movie.name;
    const date    = movie.release_date || movie.first_air_date;
    const type    = movie.media_type   || 'movie';          // 'movie' or 'tv'
    const detailPath = `/${type}/${movie.id}`;              // /movie/123 or /tv/456

    function onFavoriteClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if(favorite) removeTofavorites(movie.id);
        else addTofavorites(movie);
    }
    
  return (
    <>
    <Link to={detailPath} className="movie-card-link">
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
                 {/* ← type badge: Movie or Series */}
                    <span className={`card-type-badge ${type}`}>
                        {type === 'tv' ? 'Series' : 'Movie'}
                    </span>
                    <h3>{title}</h3>
                    <p>{date}</p>
            </div>
        </div>
    </Link>
    </>
  )
}

export default MovieCard