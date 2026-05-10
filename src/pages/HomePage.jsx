import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';
import SEO from '../components/SEO.jsx';
import TrendingGames from '../components/TrendingGames.jsx';
import { LazyAd } from '../components/AdSlot.jsx';
import { featuredHomeGames, homeCollectionPreviews, homeTagCounts } from '../data/homeData.js';
import { getGameBySlug } from '../data/games.js';
import { tagMeta as tags } from '../data/tagMeta.js';
import { useFavorites } from '../hooks/useFavorites.js';

function getRecentlyPlayed() {
  try {
    const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    const legacy = JSON.parse(localStorage.getItem('recentlyPlayedGames') || '[]');
    const stored = Array.isArray(recent) && recent.length > 0 ? recent : legacy;
    if (!Array.isArray(stored)) return [];

    return stored
      .map(item => (typeof item === 'string' ? getGameBySlug(item) : item))
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
    const timer = setTimeout(() => setRecentGames(getRecentlyPlayed()), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO
        title="Games Doodle - Play Google Doodle Games Online"
        description="Play fun and interactive Google Doodle Games online. Enjoy classic and new doodles with creative gameplay, browser games, challenges, and endless entertainment."
        canonical="/"
        image="/favicon-192x192.png"
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

        {/* Trending Games — from Firebase play counts */}
        <TrendingGames />

        <LazyAd className="page-ad-slot" />

        {/* Featured Games Grid */}
        <section className="homepage-section">
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">⭐ Featured Games</h2>
            <Link to="/google-doodle-games/" className="homepage-section-link">All doodle games →</Link>
          </div>
          <div className="games-grid">
            {featuredHomeGames.map((game, index) => (
              <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} priority={index === 0} />
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
                <span className="genre-card-count">{homeTagCounts[tag.slug] || 0} games</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Curated Collections Preview */}
        <LazyAd className="page-ad-slot" />
        <section className="homepage-section">
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">🎯 Game Collections</h2>
            <Link to="/collections/" className="homepage-section-link">All collections →</Link>
          </div>
          <div className="collections-preview-grid">
            {homeCollectionPreviews.map(col => (
              <Link key={col.slug} to={`/collections/${col.slug}/`} className="collection-preview-card">
                <span className="collection-preview-emoji">{col.emoji}</span>
                <span className="collection-preview-title">{col.title}</span>
                <span className="collection-preview-count">{col.gameCount} games</span>
              </Link>
            ))}
          </div>
        </section>

        <LazyAd className="page-ad-slot" />

        <div className="homepage-seo-text">
          <p>Google Doodle games turn the search engine's iconic logo into playable interactive experiences, celebrating holidays, historic events, and cultural moments from around the world. From the Halloween-themed Great Ghoul Duel to the Olympic hurdles runner, each game offers a unique creative twist that blends art, music, and gameplay into something anyone can enjoy in seconds.</p>
          <p>Games Doodle brings together these beloved browser-based experiences alongside other popular web games so you can discover, replay, and share them all in one place. Whether you're looking for a quick puzzle break, a nostalgic classic, or a brand-new challenge, every title runs directly in your browser with no downloads or sign-ups required.</p>
        </div>
      </div>
    </>
  );
}
