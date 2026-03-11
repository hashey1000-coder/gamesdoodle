import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRelatedGames } from '../data/games';

export default function GameEmbed({ game }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const relatedGames = getRelatedGames(game.relatedSlugs || []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

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
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>
      <div className="game-iframe-container">
        <iframe
          src={game.embedUrl}
          title={game.title}
          className="game-iframe"
          allowFullScreen
          allow="autoplay; fullscreen; gamepad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          loading="lazy"
        />
      </div>
      {isFullscreen && (
        <button className="fullscreen-close-btn" onClick={toggleFullscreen}>
          ✕
        </button>
      )}
    </div>
  );
}
