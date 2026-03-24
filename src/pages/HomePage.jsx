import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { games, tags, featuredGameSlugs, getGameBySlug } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

// Count games per tag (computed once at module level)
const tagGameCounts = {};
games.forEach(game => {
  (game.tags || []).forEach(tagSlug => {
    tagGameCounts[tagSlug] = (tagGameCounts[tagSlug] || 0) + 1;
  });
});

function getRecentlyPlayed() {
  try {
    const stored = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    return stored
      .map(slug => getGameBySlug(slug))
      .filter(Boolean)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [recentGames, setRecentGames] = useState([]);
  const [genreExpanded, setGenreExpanded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    setRecentGames(getRecentlyPlayed());
  }, []);

  const featuredGames = featuredGameSlugs
    .map(slug => games.find(g => g.slug === slug))
    .filter(Boolean);

  return (
    <>
      <SEO
        title="Games Doodle - Play Google Doodle Games Online"
        description="Play fun and interactive Google Doodle Games online. Enjoy classic and new doodles with creative gameplay, challenges, and endless entertainment!"
        canonical="/"
        schemaType="homepage"
      />
      <div className="page-content">
        {/* Hero Section - matches WP H1 exactly */}
        <section className="hero-section">
          <h1 className="hero-title">
            Games Doodle – Play Google Doodle Games
          </h1>
        </section>

        {/* Continue Playing — for returning visitors */}
        {recentGames.length > 0 && (
          <section className="homepage-section">
            <div className="homepage-section-header">
              <h2 className="homepage-section-title">▶ Continue Playing</h2>
              <span className="homepage-section-sub">Pick up where you left off</span>
            </div>
            <div className="games-grid">
              {recentGames.map(game => (
                <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Games Grid */}
        <section className="homepage-section">
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">⭐ Featured Games</h2>
            <Link to="/google-doodle-games/" className="homepage-section-link">View all →</Link>
          </div>
          <div className="games-grid">
            {featuredGames.map(game => (
              <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>

        {/* Browse by Genre */}
        <section className="homepage-section">
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">Browse by Genre</h2>
            <button
              className="genre-toggle-btn"
              onClick={() => setGenreExpanded(v => !v)}
              aria-expanded={genreExpanded}
            >
              {genreExpanded ? 'Hide ▲' : 'Show all ▼'}
            </button>
          </div>
          <div className={`genre-grid${genreExpanded ? ' genre-grid--expanded' : ''}`}>
            {tags.map(tag => (
              <Link key={tag.slug} to={`/tag/${tag.slug}/`} className="genre-card">
                <span className="genre-card-emoji">{tag.emoji}</span>
                <span className="genre-card-name">{tag.name}</span>
                <span className="genre-card-count">{tagGameCounts[tag.slug] || 0} games</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="homepage-seo-text">
          <p>Google Doodle games turn the search engine's iconic logo into playable interactive experiences, celebrating holidays, historic events, and cultural moments from around the world. From the Halloween-themed Great Ghoul Duel to the Olympic hurdles runner, each game offers a unique creative twist that blends art, music, and gameplay into something anyone can enjoy in seconds.</p>
          <p>Games Doodle brings together these beloved browser-based experiences alongside other popular web games so you can discover, replay, and share them all in one place. Whether you're looking for a quick puzzle break, a nostalgic classic, or a brand-new challenge, every title runs directly in your browser with no downloads or sign-ups required.</p>
        </div>
      </div>
    </>
  );
}
