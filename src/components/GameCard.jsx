import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isNewGame, getTagMetaForGame } from '../data/tagMeta';

const CARD_SRCSETS = {
  '/images/doodle-baseball.webp': '/images/doodle-baseball-card.webp 420w, /images/doodle-baseball.webp 640w',
};

export default function GameCard({ game, isFavorite, onToggleFavorite, priority = false }) {
  const [imgError, setImgError] = useState(false);
  const shortTitle = game.title.split(' – ')[0].trim();
  const gameTags = getTagMetaForGame(game);

  return (
    <article className="game-card">
      <Link to={`/${game.slug}/`} className="game-card-link">
        <div className="game-card-thumb">
          {isNewGame(game) && <span className="game-card-new-badge">NEW</span>}
          {game.thumbnail && !imgError ? (
            <img
              src={game.thumbnail}
              srcSet={CARD_SRCSETS[game.thumbnail]}
              sizes="(max-width: 480px) calc((100vw - 40px) / 2), (max-width: 768px) calc((100vw - 52px) / 2), (max-width: 1280px) calc((100vw - 88px) / 3), 400px"
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              width="400"
              height="250"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="game-card-thumb-placeholder">
              <span>{shortTitle}</span>
            </div>
          )}
        </div>
        <div className="game-card-body">
          <h3 className="game-card-title">{shortTitle}</h3>
          <p className="game-card-excerpt">{game.excerpt}</p>
          <span className="game-card-cta">▶ Play Now</span>
        </div>
      </Link>
      {gameTags.length > 0 && (
        <div className="game-card-tags">
          {gameTags.map(tag => (
            <Link key={tag.slug} to={`/tag/${tag.slug}/`} className="game-card-tag" onClick={(e) => e.stopPropagation()}>
              {tag.emoji} {tag.name}
            </Link>
          ))}
        </div>
      )}
      {onToggleFavorite && (
        <button
          className={`game-card-fav${isFavorite ? ' active' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(game.slug); }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
    </article>
  );
}
