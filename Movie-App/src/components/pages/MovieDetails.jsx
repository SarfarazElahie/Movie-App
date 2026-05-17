import React , { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieCredits, getMovieVideos } from '../../services/api';
import { useMovieContext } from '../../contexts/MovieContext';
import "../../css/MovieDetails.css";

const MovieDetails = () => {

    const { id } = useParams(); 
    const navigate = useNavigate();

    const [movie, setMovie]   = useState(null);
    const [cast, setCast]     = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const { isFavorite, addTofavorites, removeTofavorites } = useMovieContext();

    useEffect(()=>{
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [details, credits, video] = await Promise.all([
                    getMovieDetails(id),
                    getMovieCredits(id),
                    getMovieVideos(id),
                ]);
                setMovie(details);
                setCast(credits.slice(0, 10)); 
                setTrailer(video);
            } catch (err) {
                setError("Failed to load movie details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    },[id])

    if (loading) return <div className="details-loading">Loading...</div>;
    if (error)   return <div className="details-error">{error}</div>;
    if (!movie)  return null;

    const favorite = isFavorite(movie.id);
    const onFavoriteClick = () => {
        if (favorite) removeTofavorites(movie.id);
        else addTofavorites(movie);
    };
    
    return (
        <div className="movie-details">
            {/* Back button */}
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <div className="details-top">
                {/* Poster */}
                <img
                    className="details-poster"
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title}
                />

                {/* Info */}
                <div className="details-info">
                    <h1>{movie.title}</h1>

                    <div className="details-meta">
                        <span>📅 {movie.release_date}</span>
                        <span>⭐ {movie.vote_average?.toFixed(1)} / 10</span>
                        <span>🕐 {movie.runtime} min</span>
                    </div>

                    {/* Genres */}
                    <div className="details-genres">
                        {movie.genres?.map(genre => (
                            <span key={genre.id} className="genre-tag">{genre.name}</span>
                        ))}
                    </div>

                    {/* Overview */}
                    <div className="details-overview">
                        <h3>Overview</h3>
                        <p>{movie.overview}</p>
                    </div>

                    {/* Favorite button */}
                    <button
                        className={`details-fav-btn ${favorite ? "active" : ""}`}
                        onClick={onFavoriteClick}
                    >
                        {favorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
                    </button>
                </div>
            </div>

            {/* Trailer */}
            {trailer && (
                <div className="details-section">
                    <h3>Trailer</h3>
                    <div className="trailer-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            title="Movie Trailer"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
                <div className="details-section">
                    <h3>Cast</h3>
                    <div className="cast-grid">
                        {cast.map(member => (
                            <div key={member.id} className="cast-card">
                                <img
                                    src={
                                        member.profile_path
                                            ? `https://image.tmdb.org/t/p/w185/${member.profile_path}`
                                            : "https://via.placeholder.com/185x278?text=No+Image"
                                    }
                                    alt={member.name}
                                />
                                <p className="cast-name">{member.name}</p>
                                <p className="cast-character">{member.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MovieDetails