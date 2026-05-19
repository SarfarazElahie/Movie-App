import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPersonDetails, getPersonCredits } from '../../services/api';
import "../../css/PersonDetails.css";

const PersonDetails = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [person, setPerson]   = useState(null);
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            window.scrollTo(0, 0);
            try {
                const [personData, creditsData] = await Promise.all([
                    getPersonDetails(id),
                    getPersonCredits(id)
                ]);
                setPerson(personData);
                setCredits(creditsData);
            } catch {
                setError("Failed to load person details.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) return <div className="details-loading">Loading...</div>;
    if (error)   return <div className="details-error">{error}</div>;
    if (!person) return null;

    const age = person.birthday && !person.deathday
        ? Math.floor((Date.now() - new Date(person.birthday)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

    return (
        <div className="person-details">

            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            {/* ── Top: photo + info ── */}
            <div className="person-top">
                <img
                    className="person-photo"
                    src={
                        person.profile_path
                            ? `https://image.tmdb.org/t/p/w300/${person.profile_path}`
                            : "https://via.placeholder.com/300x450?text=No+Photo"
                    }
                    alt={person.name}
                />
                <div className="person-info">
                    <h1>{person.name}</h1>

                    <div className="person-meta">
                        {person.known_for_department && (
                            <span>🎬 Known for: {person.known_for_department}</span>
                        )}
                        {person.birthday && (
                            <span>
                                🎂 Born: {person.birthday}
                                {age ? ` (${age} years old)` : ''}
                            </span>
                        )}
                        {person.deathday && (
                            <span>✝ Died: {person.deathday}</span>
                        )}
                        {person.place_of_birth && (
                            <span>📍 {person.place_of_birth}</span>
                        )}
                    </div>

                    {person.biography ? (
                        <div className="person-bio">
                            <h3>Biography</h3>
                            <p>
                                {person.biography.length > 700
                                    ? person.biography.slice(0, 700) + '...'
                                    : person.biography
                                }
                            </p>
                        </div>
                    ) : (
                        <p className="person-no-bio">No biography available.</p>
                    )}
                </div>
            </div>

            {/* ── Known For / Filmography ── */}
            {credits.length > 0 && (
                <div className="person-section">
                    <h3>Known For</h3>
                    <div className="person-credits-grid">
                        {credits.map(item => (
                            // clicking a movie/series chains back to MovieDetails
                            <Link
                                to={`/${item.media_type}/${item.id}`}
                                key={`${item.media_type}-${item.id}`}
                                className="credit-card-link"
                            >
                                <div className="credit-card">
                                    <img
                                        src={
                                            item.poster_path
                                                ? `https://image.tmdb.org/t/p/w185/${item.poster_path}`
                                                : "https://via.placeholder.com/185x278?text=No+Poster"
                                        }
                                        alt={item.title}
                                    />
                                    <div className="credit-info">
                                        <p className="credit-title">{item.title}</p>
                                        <div className="credit-bottom">
                                            <span className="credit-year">
                                                {item.release_date?.split('-')[0] || 'N/A'}
                                            </span>
                                            <span className={`credit-type ${item.media_type}`}>
                                                {item.media_type === 'tv' ? 'Series' : 'Movie'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default PersonDetails;