import React , { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getDetails, getCredits, getVideos, getRecommendations  } from '../../services/api';
import { useMovieContext } from '../../contexts/MovieContext';
import MovieCard from '../MovieCard';
import "../../css/MovieDetails.css";

const MovieDetails = () => {

    const { id } = useParams(); 
    const navigate = useNavigate();
    const location     = useLocation();

    // ─── Detect type from URL path (/movie/ or /tv/) ───────────────
    const mediaType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';

    const [movie, setMovie]   = useState(null);
    const [cast, setCast]     = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const { isFavorite, addTofavorites, removeTofavorites } = useMovieContext();

    useEffect(()=>{
        const fetchAll = async () => {
            setLoading(true);
            window.scrollTo(0, 0); // scroll to top on navigation
            try {
                const [details, credits, video, recs] = await Promise.all([
                    getDetails(mediaType, id),
                    getCredits(mediaType, id),
                    getVideos(mediaType, id),
                    getRecommendations(mediaType, id),
                ]);
                setMovie(details);
                setCast(credits.slice(0, 10)); 
                setTrailer(video);
                setRecommendations(recs);
            } catch (err) {
                setError("Failed to load movie details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    },[id, mediaType])

    if (loading) return <div className="details-loading">Loading...</div>;
    if (error)   return <div className="details-error">{error}</div>;
    if (!movie)  return null;

    const favorite = isFavorite(movie.id);

    // ─── Normalize fields for TV vs Movie ──────────────────────────
    const title   = movie.title        || movie.name;
    const date    = movie.release_date || movie.first_air_date;

    // Movies have runtime (number), TV has episode_run_time (array)
    const runtime = movie.runtime
        ? `${movie.runtime} min`
        : movie.episode_run_time?.[0]
            ? `~${movie.episode_run_time[0]} min / ep`
            : null;

    // TV-only extra info
    const seasons  = movie.number_of_seasons;
    const episodes = movie.number_of_episodes;

    const onFavoriteClick = () => {
        if (favorite) removeTofavorites(movie.id);
        else addTofavorites(movie);
    };
    
    return (
         <div className="movie-details">

            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <div className="details-top">
                <img
                    className="details-poster"
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={title}
                />

                <div className="details-info">
                    {/* Type badge */}
                    <span className={`details-type-badge ${mediaType}`}>
                        {mediaType === 'tv' ? 'Series' : 'Movie'}
                    </span>

                    <h1>{title}</h1>

                    <div className="details-meta">
                        <span>📅 {date}</span>
                        <span>⭐ {movie.vote_average?.toFixed(1)} / 10</span>
                        {runtime  && <span>🕐 {runtime}</span>}
                        {seasons  && <span>📺 {seasons} Season{seasons > 1 ? 's' : ''}</span>}
                        {episodes && <span>🎬 {episodes} Episodes</span>}
                    </div>

                    <div className="details-genres">
                        {movie.genres?.map(genre => (
                            <span key={genre.id} className="genre-tag">{genre.name}</span>
                        ))}
                    </div>

                    <div className="details-overview">
                        <h3>Overview</h3>
                        <p>{movie.overview}</p>
                    </div>

                    <button
                        className={`details-fav-btn ${favorite ? "active" : ""}`}
                        onClick={() => favorite ? removeTofavorites(movie.id) : addTofavorites(movie)}
                    >
                        {favorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
                    </button>
                </div>
            </div>

            {trailer && (
                <div className="details-section">
                    <h3>Trailer</h3>
                    <div className="trailer-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            title="Trailer"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {cast.length > 0 && (
                <div className="details-section">
                    <h3>Cast</h3>
                    <div className="cast-grid">
                        {cast.map(member => (
                             <Link
                                to={`/person/${member.id}`}
                                key={member.id}
                                className="cast-card-link"   // ADD link wrapper
                            >
                                <div className="cast-card">
                                    <img
                                        src={member.profile_path
                                            ? `https://image.tmdb.org/t/p/w185/${member.profile_path}`
                                            : "https://via.placeholder.com/185x278?text=No+Image"
                                        }
                                        alt={member.name}
                                    />
                                    <p className="cast-name">{member.name}</p>
                                    <p className="cast-character">{member.character}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

             {/* Recommendations — reuses MovieCard so chain navigation works */}
            {recommendations.length > 0 && (
                <div className="details-section">
                    <h3>More Like This</h3>
                    <div className="recommendations-grid">
                        {recommendations.map(item => (
                            <MovieCard
                                key={`${item.media_type}-${item.id}`}
                                movie={item}
                            />
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default MovieDetails