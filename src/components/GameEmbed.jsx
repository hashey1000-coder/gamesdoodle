import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRelatedGames } from '../data/games';

export default function GameEmbed({ game }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const relatedGames = getRelatedGames(game.relatedSlugs || []);
  const isExternal = Boolean(game.externalUrl);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const showIframe = isPlaying && !isExternal;

  return (
    <div className={`game-embed-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="game-embed-toolbar">
        <div className="related-quick-links">
          {relatedGames.map(rg => (
            <Link key={rg.slug} to={`/${rg.slug}/`} className="quick-link">
              {rg.title.split('–')[0].trim()}
            </Link>
          ))}
        </div>
        <div className="embed-actions">
          {showIframe && (
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
            </button>
          )}
        </div>
      </div>
      <div className="game-iframe-container">
        {!isPlaying ? (
          /* Thumbnail + play button overlay for ALL games */
          <button
            className="game-play-overlay"
            onClick={isExternal ? undefined : handlePlay}
            aria-label={`Play ${game.title}`}
          >
            {isExternal && (
              <a
                href={game.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="game-play-external-link"
                aria-label={`Play ${game.title} (opens in new tab)`}
              />
            )}
            <img
              src={game.thumbnail}
              alt={game.title}
              className="game-play-thumb"
              loading="eager"
            />
            <div className="game-play-btn">
              <span className="game-play-icon">▶</span>
              <span className="game-play-label">Play Now</span>
            </div>
          </button>
        ) : (
          <iframe
            src={game.embedUrl}
            title={game.title}
            className="game-iframe"
            allowFullScreen
            allow="autoplay; fullscreen; gamepad"
            {...(!game.noSandbox && { sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals' })}
          />
        )}
      </div>
    </div>
  );
}
