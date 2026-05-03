import { lazy, Suspense, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { tagMeta as tags } from '../data/tagMeta';
import { usePlayQueue } from '../hooks/usePlayQueue';
import { useFavorites } from '../hooks/useFavorites';

const SearchBar = lazy(() => import('./SearchBar'));
const PlayQueuePanel = lazy(() => import('./PlayQueuePanel'));

const navLinks = [
  { to: '/google-doodle-games/', label: 'Doodle Games' },
  { to: '/online-games/', label: 'Online Games' },
  { to: '/top-games/', label: 'Top Games' },
  { to: '/new-games/', label: 'New Games' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const navigate = useNavigate();
  const { count: queueCount } = usePlayQueue();
  const { favorites } = useFavorites();

  // Global keyboard shortcut: Ctrl/Cmd + K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRandomGame = async () => {
    const { games } = await import('../data/games');
    const randomGame = games[Math.floor(Math.random() * games.length)];
    setMobileOpen(false);
    navigate(`/${randomGame.slug}/`);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="site-logo" onClick={() => setMobileOpen(false)}>
          <img
            src="/favicon-192x192.png"
            srcSet="/favicon-32x32.png 32w, /favicon-192x192.png 192w"
            sizes="36px"
            alt=""
            aria-hidden="true"
            className="logo-icon"
            width="36"
            height="36"
            decoding="async"
          />
          <span className="logo-text">
            Games<span className="logo-highlight">Doodle</span>
          </span>
        </Link>
        <nav className={`main-nav${mobileOpen ? ' mobile-open' : ''}`}>
          <ul>
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => isActive ? 'nav-active' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {/* Mobile-only quick links */}
            {mobileOpen && (
              <>
                <li className="mobile-only-link">
                  <Link to="/my-stats/" onClick={() => setMobileOpen(false)}>📊 My Stats</Link>
                </li>
                <li className="mobile-only-link">
                  <Link to="/favorites/" onClick={() => setMobileOpen(false)}>❤️ Liked Games</Link>
                </li>
                <li className="mobile-only-link">
                  <button className="mobile-random-btn" onClick={handleRandomGame}>🎲 Random Game</button>
                </li>
              </>
            )}
            {/* Genres dropdown */}
            <li
              className="nav-genres-wrap"
              onMouseEnter={() => { if (!mobileOpen) setGenresOpen(true); }}
              onMouseLeave={() => { if (!mobileOpen) setGenresOpen(false); }}
            >
              <button
                className={`nav-genres-btn${genresOpen ? ' open' : ''}`}
                onClick={() => setGenresOpen(v => !v)}
                aria-expanded={genresOpen}
                aria-haspopup="true"
              >
                Genres <span className="nav-genres-chevron" aria-hidden="true">▾</span>
              </button>
              {genresOpen && (
                <div className="nav-genres-panel" role="navigation" aria-label="Browse games by genre">
                  {tags.map(tag => (
                    <Link
                      key={tag.slug}
                      to={`/tag/${tag.slug}/`}
                      className="nav-genres-link"
                      onClick={() => { setGenresOpen(false); setMobileOpen(false); }}
                    >
                      <span className="nav-genres-emoji">{tag.emoji}</span>
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <Link
            to="/my-stats/"
            className="stats-nav-btn"
            aria-label="My Stats"
            title="My Stats"
          >
            📊
          </Link>
          <Link
            to="/favorites/"
            className="fav-nav-btn"
            aria-label="Liked games"
            title="Liked games"
          >
            {favorites.length > 0 ? '❤️' : '🤍'}
            {favorites.length > 0 && <span className="queue-badge">{favorites.length}</span>}
          </Link>
          <button
            className="queue-nav-btn"
            onClick={() => setQueueOpen(true)}
            aria-label="Play Next queue"
            title="Play Next queue"
          >
            📋{queueCount > 0 && <span className="queue-badge">{queueCount}</span>}
          </button>
          <button
            className="random-game-btn"
            onClick={handleRandomGame}
            aria-label="Play a random game"
            title="I'm feeling lucky!"
          >
            🎲
          </button>
          <button
            className="search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Search games"
          >
            <span className="search-trigger-icon">🔍</span>
            <span className="search-trigger-text">Search</span>
            <kbd className="search-trigger-kbd">⌘K</kbd>
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      <Suspense fallback={null}>
        {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
        {queueOpen && <PlayQueuePanel onClose={() => setQueueOpen(false)} />}
      </Suspense>
    </header>
  );
}
