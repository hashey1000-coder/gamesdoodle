import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';
import SEO from '../components/SEO.jsx';
import TrendingGames from '../components/TrendingGames.jsx';
import { LazyAd } from '../components/AdSlot.jsx';
import { featuredHomeGames, homeCollectionPreviews, homeTagCounts, popularGoogleGames, latestGoogleDoodles } from '../data/homeData.js';
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

        {/* Popular Google Games */}
        <section className="homepage-section">
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">🎮 Popular Google Games</h2>
            <a href="/google-doodle-games/" className="homepage-section-link">All Google games →</a>
          </div>
          <div className="games-grid">
            {popularGoogleGames.map(game => (
              <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>

        {/* Latest Google Doodles */}
        <section className="homepage-section">
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">✨ Latest Google Doodles</h2>
            <a href="/google-doodle-games/" className="homepage-section-link">View all doodles →</a>
          </div>
          <div className="games-grid">
            {latestGoogleDoodles.map(game => (
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
          <p>Google Doodle games turn the search engine’s iconic logo into playable interactive experiences, celebrating holidays, historic events, and cultural moments from around the world. From the Halloween-themed Magic Cat Academy to the Olympic hurdles runner, each game offers a unique creative twist that blends art, music, and gameplay into something anyone can enjoy in seconds.</p>
          <p>Games Doodle brings together these beloved browser-based experiences alongside other popular web games so you can discover, replay, and share them all in one place. Whether you’re looking for a quick puzzle break, a nostalgic classic, or a brand-new challenge, every title runs directly in your browser with no downloads or sign-ups required.</p>
          <p>Google games span decades of internet history. The first playable Google Doodle was the iconic Pac-Man anniversary edition in 2010, which racked up over a billion plays in just two days. Since then, Google Doodle games have grown far more ambitious — from simple click challenges to full RPGs like Doodle Champion Island with seven sports, 22 side quests, and hundreds of hidden secrets. These are not just logos; they are genuinely great games.</p>
          <p>Some of the best Google Doodles to play right now include <a href="/quick-draw/">Quick Draw</a>, where Google’s AI guesses your sketches in real time; <a href="/doodle-baseball/">Doodle Baseball</a>, the beloved Fourth of July classic; <a href="/google-cricket/">Google Cricket</a>, a fan-favourite from the ICC Champions Trophy; and <a href="/magic-cat-academy/">Magic Cat Academy</a>, the Halloween doodle where you draw spells to defeat ghosts. Each of these hidden Google games takes just seconds to start and can entertain for hours.</p>
          <p>If you want to play Google games online, you’ve come to the right place. Games Doodle archives the most popular and beloved Doodles so they’re always available — no hunting through archive pages or worrying about broken links. Whether you’re a returning player chasing a high score or a newcomer exploring Google Doodle games for the first time, every title here is free, fast, and ready to play instantly.</p>
          <p>Beyond the classic doodles, we also feature the best Google Easter eggs — hidden surprises like <a href="/google-gravity/">Google Gravity</a>, <a href="/google-minesweeper/">Google Minesweeper</a>, and <a href="/google-snake/">Google Snake</a> that most people never discover. Explore our complete collection of Google games by category, from sports and arcade to puzzle and creative — and you’ll find something new to play every visit.</p>
        </div>
      </div>
    </>
  );
}
