import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { games, tags } from '../data/games';

const navLinks = [
  { to: '/google-doodle-games/', label: 'Doodle Games' },
  { to: '/online-games/', label: 'Online Games' },
  { to: '/google-tools/', label: 'Google Tools' },
  { to: '/google-easter-egg/', label: 'Easter Eggs' },
  { to: '/top-games/', label: 'Top Games' },
  { to: '/new-games/', label: 'New Games' },
  { to: '/all-games/', label: 'All Games' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleRandomGame = () => {
    const randomGame = games[Math.floor(Math.random() * games.length)];
    setMobileOpen(false);
    navigate(`/${randomGame.slug}/`);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="site-logo" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="Games Doodle" className="logo-icon" />
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
      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
