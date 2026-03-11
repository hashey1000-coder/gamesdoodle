import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  const [imgError, setImgError] = useState(false);
  const shortTitle = game.title.split(/[–\-]/)[0].trim();

  return (
    <article className="game-card">
      <Link to={`/${game.slug}/`} className="game-card-link">
        <div className="game-card-thumb">
          {game.thumbnail && !imgError ? (
            <img
              src={game.thumbnail}
              alt={game.title}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="game-card-thumb-placeholder">
              <span>{shortTitle}</span>
            </div>
          )}
        </div>
        <div className="game-card-body">
          <h2 className="game-card-title">{shortTitle}</h2>
          <p className="game-card-excerpt">{game.excerpt}</p>
          <span className="game-card-cta">▶ Play Now</span>
        </div>
      </Link>
    </article>
  );
}
