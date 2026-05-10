import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { games, getTagsForGame, tags, categories } from '../data/games';

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function fuzzyTokenScore(queryToken, targetToken) {
  if (!queryToken || !targetToken) return 0;
  if (targetToken === queryToken) return 55;
  if (targetToken.startsWith(queryToken)) return 38;
  if (targetToken.includes(queryToken)) return 28;

  const distance = levenshtein(queryToken, targetToken);
  const maxLen = Math.max(queryToken.length, targetToken.length);
  const tolerance = queryToken.length <= 4 ? 1 : 2;

  if (distance <= tolerance) return 24 - distance * 5;
  if (distance <= Math.ceil(maxLen * 0.28)) return 12;
  return 0;
}

function scoreText(query, target, weight = 1) {
  const normalizedTarget = normalize(target);
  if (!query || !normalizedTarget) return 0;
  if (normalizedTarget === query) return 120 * weight;
  if (normalizedTarget.startsWith(query)) return 85 * weight;
  if (normalizedTarget.includes(query)) return 60 * weight;

  const queryTokens = query.split(' ').filter(Boolean);
  const targetTokens = normalizedTarget.split(' ').filter(Boolean);
  const tokenScore = queryTokens.reduce((sum, queryToken) => {
    const best = Math.max(0, ...targetTokens.map(targetToken => fuzzyTokenScore(queryToken, targetToken)));
    return sum + best;
  }, 0);

  return tokenScore * weight;
}

function getCategoryName(slug) {
  return categories.find(category => category.slug === slug)?.name || slug;
}

function getSearchScore(game, query) {
  const shortTitle = game.title.split(' – ')[0].trim();
  const tagText = (game.tags || []).join(' ');
  const categoryName = getCategoryName(game.category);

  return (
    scoreText(query, shortTitle, 1.4) +
    scoreText(query, game.title, 1.1) +
    scoreText(query, game.slug, 1) +
    scoreText(query, tagText, 0.75) +
    scoreText(query, categoryName, 0.65)
  );
}

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback((term) => {
    const normalized = normalize(term);
    if (!normalized) {
      setResults([]);
      setCategorySuggestions([]);
      setTagSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const matched = games
      .map(game => ({ game, score: getSearchScore(game, normalized) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.game)
      .slice(0, 8);

    const matchedCategories = categories
      .map(category => ({ category, score: Math.max(scoreText(normalized, category.name), scoreText(normalized, category.slug)) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.category)
      .slice(0, 4);

    const matchedTags = tags
      .map(tag => ({ tag, score: Math.max(scoreText(normalized, tag.name), scoreText(normalized, tag.slug)) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.tag)
      .slice(0, 6);

    setResults(matched);
    setCategorySuggestions(matchedCategories);
    setTagSuggestions(matchedTags);
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
            placeholder={`Search ${games.length}+ games...`}
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
            {results.map((game, i) => {
              const gameTags = getTagsForGame(game);
              return (
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
                        {game.title.split(' – ')[0].trim()}
                      </span>
                      <span className="search-result-meta">
                        <span className="search-result-cat">
                          {game.category.replace(/-/g, ' ')}
                        </span>
                        {gameTags.length > 0 && (
                          <span className="search-result-tags">
                            {gameTags.slice(0, 2).map(t => (
                              <span key={t.slug} className="search-result-tag">{t.emoji}</span>
                            ))}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="search-result-play">▶</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {query.trim() && results.length === 0 && (
          <div className="search-no-results">
            <p className="search-no-results-msg">No games found for "<strong>{query}</strong>"</p>
            <div className="search-suggestions">
              <span className="search-suggestions-label">Try these categories:</span>
              <div className="search-suggestions-chips">
                {categories.map(cat => (
                  <Link key={cat.slug} to={`/${cat.slug}/`} className="search-suggestion-chip" onClick={onClose}>
                    {cat.name}
                  </Link>
                ))}
              </div>
              <span className="search-suggestions-label" style={{ marginTop: 10 }}>Popular tags:</span>
              <div className="search-suggestions-chips">
                {tags.slice(0, 6).map(tag => (
                  <Link key={tag.slug} to={`/tag/${tag.slug}/`} className="search-suggestion-chip search-suggestion-tag" onClick={onClose}>
                    {tag.emoji} {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        {query.trim() && (categorySuggestions.length > 0 || tagSuggestions.length > 0) && (
          <div className="search-suggestions search-fuzzy-suggestions">
            {categorySuggestions.length > 0 && (
              <>
                <span className="search-suggestions-label">Matching categories:</span>
                <div className="search-suggestions-chips">
                  {categorySuggestions.map(cat => (
                    <Link key={cat.slug} to={`/${cat.slug}/`} className="search-suggestion-chip" onClick={onClose}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {tagSuggestions.length > 0 && (
              <>
                <span className="search-suggestions-label" style={{ marginTop: 10 }}>Matching tags:</span>
                <div className="search-suggestions-chips">
                  {tagSuggestions.map(tag => (
                    <Link key={tag.slug} to={`/tag/${tag.slug}/`} className="search-suggestion-chip search-suggestion-tag" onClick={onClose}>
                      {tag.emoji} {tag.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
