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
            <h2 className="homepage-section-title">🎮 Browse by Genre</h2>
            <span className="homepage-section-sub">Find your favourite type of game</span>
          </div>
          <div className="genre-grid">
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
          <p>Google Games are widely known for their simple yet addictive gameplay, and many of the most popular titles come from interactive doodles released over the years. These google doodle games are designed to be fun, lightweight, and easy to play directly in a browser. From classic arcade-style challenges to creative puzzle experiences, they offer instant entertainment without downloads or complex setup.</p>
          <p>A large collection of doodle games allows players to revisit iconic moments transformed into playable experiences. Sports challenges, brain teasers, rhythm-based games, and time-based adventures are all part of these google games free to play. Their minimal controls and smooth performance make them accessible for all ages, whether you're playing for a few minutes or spending longer sessions mastering each game.</p>
          <p>By bringing together a wide range of google games, players can enjoy the best of google doodle games in one place. These google games free provide quick fun, nostalgia, and creativity, making them perfect for casual gaming anytime. With no installs required, doodle games remain one of the easiest and most enjoyable ways to play online.</p>
        </div>
      </div>
    </>
  );
}
