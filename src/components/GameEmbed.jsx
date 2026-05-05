import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getRelatedGames } from '../data/games';

export default function GameEmbed({ game }) {
  const isExternal = Boolean(game.externalUrl);
  const isEmbeddedGame = !isExternal;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(() => isEmbeddedGame);
  const relatedGames = getRelatedGames(game.relatedSlugs || []);

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
    setIsFullscreen(false);
    setIsLoaded(false);
    setHasStarted(isEmbeddedGame);
  }, [game.slug, isEmbeddedGame]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  const isSwf = /\.swf(?:[?#]|$)/i.test(game.embedUrl || '');
  const ruffleContainerRef = useRef(null);

  // Load Ruffle Flash emulator for SWF games
  useEffect(() => {
    if (!isEmbeddedGame || !hasStarted || !isSwf || !ruffleContainerRef.current) return;
    const container = ruffleContainerRef.current;
    container.innerHTML = '';

    const initRuffle = () => {
      const ruffle = window.RufflePlayer?.newest();
      if (!ruffle) return;
      const player = ruffle.createPlayer();
      player.style.width = '100%';
      player.style.height = '100%';
      container.appendChild(player);
      player.load({ url: game.embedUrl })
        .then(() => setIsLoaded(true))
        .catch(() => setIsLoaded(true));
    };

    if (window.RufflePlayer?.newest) {
      initRuffle();
    } else {
      window.RufflePlayer = window.RufflePlayer || {};
      const existing = document.querySelector('script[data-ruffle]');
      if (existing) {
        existing.addEventListener('load', initRuffle);
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@ruffle-rs/ruffle';
        script.setAttribute('data-ruffle', 'true');
        script.addEventListener('load', initRuffle);
        document.head.appendChild(script);
      }
    }

    return () => { container.innerHTML = ''; };
  }, [isEmbeddedGame, hasStarted, isSwf, game.embedUrl]);

  const showEmbeddedPlayer = isEmbeddedGame && hasStarted;
  const showIframe = showEmbeddedPlayer && !isSwf;
  const containerKey = `${game.slug}-${hasStarted ? 'started' : 'idle'}`;

  const handleStartGame = useCallback(() => {
    setHasStarted(true);
    setIsLoaded(false);
  }, []);

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
          {showEmbeddedPlayer && (
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
            </button>
          )}
        </div>
      </div>
      <div key={containerKey} id={showEmbeddedPlayer ? 'av-reward' : undefined} className={`game-iframe-container${showEmbeddedPlayer ? ' reward_game playing' : ''}`}>
        {!isEmbeddedGame ? (
          <a
            href={game.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="game-play-overlay game-play-external-link"
            aria-label={`Play ${game.title} (opens in new tab)`}
          >
            <img
              src={game.thumbnail}
              alt={game.title}
              className="game-play-thumb"
              loading="eager"
            />
            <div className="game-play-btn">
              <span className="game-play-icon">▶</span>
              <span className="game-play-label">Play on Official Site ↗</span>
            </div>
          </a>
        ) : !hasStarted ? (
          <button
            className="game-play-overlay"
            onClick={handleStartGame}
            aria-label={`Start ${game.title}`}
          >
            {game.thumbnail && (
              <img
                src={game.thumbnail}
                alt={game.title}
                className="game-play-thumb"
                loading="eager"
              />
            )}
            <div className="game-play-btn">
              <span className="game-play-icon">▶</span>
              <span className="game-play-label">Click to Start Game</span>
            </div>
          </button>
        ) : (
          <>
            {!isLoaded && (
              <div className="game-loading-overlay">
                {game.thumbnail && (
                  <img
                    src={game.thumbnail}
                    alt=""
                    className="game-loading-thumb"
                    loading="eager"
                    aria-hidden="true"
                  />
                )}
                <div className="game-spinner" />
                <span className="game-loading-text">Loading game…</span>
              </div>
            )}
            {isSwf ? (
              <div
                ref={ruffleContainerRef}
                className={`game-iframe${isLoaded ? ' loaded' : ''}`}
              />
            ) : (
              <iframe
                src={game.embedUrl}
                title={game.title}
                className={`game-iframe${isLoaded ? ' loaded' : ''}`}
                allowFullScreen
                scrolling="auto"
                allow="autoplay *; fullscreen *; gamepad; storage-access"
                onLoad={handleIframeLoad}
                {...(!game.noSandbox && { sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock allow-presentation allow-orientation-lock' })}
              />
            )}
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
