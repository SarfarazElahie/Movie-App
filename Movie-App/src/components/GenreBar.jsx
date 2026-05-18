import React from 'react';

export const GENRES = [
    { id: null,  label: "All"         },
    { id: 28,    label: "Action"      },
    { id: 35,    label: "Comedy"      },
    { id: 27,    label: "Horror"      },
    { id: 10749, label: "Romance"     },
    { id: 878,   label: "Sci-Fi"      },
    { id: 16,    label: "Animation"   },
    { id: 99,    label: "Documentary" },
    { id: 18,    label: "Drama"       },
];

const GenreBar = ({ activeGenreId, onGenreClick }) => {
    return (
        <div className="genre-bar">
            {GENRES.map((genre) => (
                <button
                    key={genre.id ?? 'all'}
                    className={`genre-btn ${activeGenreId === genre.id ? 'active' : ''}`}
                    onClick={() => onGenreClick(genre)}
                >
                    {genre.label}
                </button>
            ))}
        </div>
    );
};

export default GenreBar;