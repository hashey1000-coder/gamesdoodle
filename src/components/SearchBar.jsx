import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { games } from '../data/games';

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback((term) => {
    if (!term.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }
    const lower = term.toLowerCase();
    const matched = games
      .filter(g => g.title.toLowerCase().includes(lower) || g.slug.includes(lower))
      .slice(0, 8);
    setResults(matched);
    setSelectedIndex(-1);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigate(`/${results[selectedIndex].slug}/`);
        onClose();
      } else if (results.length > 0) {
        navigate(`/${results[0].slug}/`);
        onClose();
      }
    }
  };

  const handleResultClick = () => {
    onClose();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="search-overlay" ref={resultsRef}>
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search 328+ games..."
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button className="search-close" onClick={onClose} aria-label="Close search">
            ESC
          </button>
        </div>
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((game, i) => (
              <li key={game.slug} className={i === selectedIndex ? 'selected' : ''}>
                <Link to={`/${game.slug}/`} onClick={handleResultClick}>
                  <img
                    src={game.thumbnail}
                    alt=""
                    className="search-result-thumb"
                    loading="lazy"
                  />
                  <div className="search-result-info">
                    <span className="search-result-title">
                      {game.title.split(/[–\-]/)[0].trim()}
                    </span>
                    <span className="search-result-cat">
                      {game.category.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <span className="search-result-play">▶</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && results.length === 0 && (
          <div className="search-no-results">
            No games found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
