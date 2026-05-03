import { lazy, Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { featuredHomeGames, homeCollectionPreviews, homeTagCounts } from '../data/homeData';
import { tagMeta as tags } from '../data/tagMeta';
import { useFavorites } from '../hooks/useFavorites';

const TrendingGames = lazy(() => import('../components/TrendingGames'));
const LazyAd = import.meta.env.PROD
  ? lazy(() => import('../components/AdSlot').then(module => ({ default: module.LazyAd })))
  : () => null;

function getRecentlyPlayed() {
  try {
    const stored = JSON.parse(localStorage.getItem('recentlyPlayedGames') || '[]');
    return Array.isArray(stored) ? stored.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [recentGames, setRecentGames] = useState([]);
  const [genreExpanded, setGenreExpanded] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    setRecentGames(getRecentlyPlayed());
  }, []);

  useEffect(() => {
    const show = () => setShowTrending(true);
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(show, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timer = setTimeout(show, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
        {showTrending && (
          <Suspense fallback={null}>
            <TrendingGames />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <LazyAd className="page-ad-slot" />
        </Suspense>

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
        <Suspense fallback={null}>
          <LazyAd className="page-ad-slot" />
        </Suspense>
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

        <Suspense fallback={null}>
          <LazyAd className="page-ad-slot" />
        </Suspense>

        <div className="homepage-seo-text">
          <p>Google Doodle games turn the search engine's iconic logo into playable interactive experiences, celebrating holidays, historic events, and cultural moments from around the world. From the Halloween-themed Great Ghoul Duel to the Olympic hurdles runner, each game offers a unique creative twist that blends art, music, and gameplay into something anyone can enjoy in seconds.</p>
          <p>Games Doodle brings together these beloved browser-based experiences alongside other popular web games so you can discover, replay, and share them all in one place. Whether you're looking for a quick puzzle break, a nostalgic classic, or a brand-new challenge, every title runs directly in your browser with no downloads or sign-ups required.</p>
        </div>
      </div>
    </>
  );
}
