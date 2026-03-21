import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRelatedGames } from '../data/games';

export default function GameEmbed({ game }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const relatedGames = getRelatedGames(game.relatedSlugs || []);
  const isExternal = Boolean(game.externalUrl);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setIsLoaded(false);
    // Save to recently played in localStorage
    try {
      const key = 'recentlyPlayed';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [game.slug, ...prev.filter(s => s !== game.slug)].slice(0, 12);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // localStorage unavailable — ignore
    }
  }, [game.slug]);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const wrapper = document.querySelector('.game-embed-wrapper');
    if (!isFullscreen) {
      // Request fullscreen
      if (wrapper?.requestFullscreen) {
        wrapper.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed:', err);
          setIsFullscreen(true); // Fallback to CSS fullscreen
        });
      } else {
        setIsFullscreen(true); // Fallback for browsers without Fullscreen API
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes (entering and exiting, including Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset state when navigating to a different game
  useEffect(() => {
    setIsPlaying(false);
    setIsFullscreen(false);
    setIsLoaded(false);
  }, [game.slug]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  const showIframe = isPlaying && !isExternal;

  return (
    <div className={`game-embed-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="game-embed-toolbar">
        {relatedGames.length > 0 && (
          <div className="related-quick-links">
            <span className="quick-links-label">Also try:</span>
            {relatedGames.map(rg => (
              <Link key={rg.slug} to={`/${rg.slug}/`} className="quick-link">
                <span className="quick-link-dot" />
                {rg.title.split(' – ')[0].trim()}
              </Link>
            ))}
          </div>
        )}
        <div className="embed-actions">
          {showIframe && (
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
            </button>
          )}
        </div>
      </div>
      <div className={`game-iframe-container${showIframe ? ' playing' : ''}`}>
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
              <span className="game-play-label">{isExternal ? 'Play on Official Site ↗' : 'Play Now'}</span>
            </div>
          </button>
        ) : (
          <>
            {!isLoaded && (
              <div className="game-loading-overlay">
                <div className="game-skeleton">
                  <div className="skeleton-shimmer" />
                </div>
                <div className="game-spinner" />
                <span className="game-loading-text">Loading game…</span>
              </div>
            )}
            <iframe
              src={game.embedUrl}
              title={game.title}
              className={`game-iframe${isLoaded ? ' loaded' : ''}`}
              allowFullScreen
              scrolling="auto"
              allow="autoplay; fullscreen; gamepad"
              onLoad={handleIframeLoad}
              {...(!game.noSandbox && { sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock' })}
            />
          </>
        )}
      </div>
      {isFullscreen && showIframe && (
        <button className="fullscreen-exit-float" onClick={toggleFullscreen} aria-label="Exit fullscreen">
          ✕
        </button>
      )}
    </div>
  );
}
