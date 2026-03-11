import { useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/google-doodle-games/', label: 'Doodle Games' },
  { to: '/online-games/', label: 'Online Games' },
  { to: '/google-tools/', label: 'Google Tools' },
  { to: '/google-easter-egg/', label: 'Easter Eggs' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
                <Link to={link.to} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
