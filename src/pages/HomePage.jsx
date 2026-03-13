import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { games, featuredGameSlugs, categories, getGameBySlug } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

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
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    setRecentGames(getRecentlyPlayed());
  }, []);

  const featuredGames = featuredGameSlugs
    .map(slug => games.find(g => g.slug === slug))
    .filter(Boolean);

  const favoriteGames = favorites
    .map(slug => getGameBySlug(slug))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <>
      <SEO
        title="Games Doodle - Play Google Doodle Games Online"
        description="Play fun and interactive Google Doodle Games online. Enjoy classic and new doodles with creative gameplay, challenges, and endless entertainment!"
        canonical="/"
        schemaType="homepage"
      />
      <div className="page-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            <span className="gradient-text">Games Doodle</span> – Play Google Doodle Games
          </h1>
          <p className="hero-subtitle">
            Discover 328+ free games — from classic Google Doodles to the best online browser games. No downloads, no sign-ups, just play.
          </p>
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number">{games.length}+</div>
              <div className="stat-label">Games</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Free</div>
            </div>
          </div>
        </section>

        {/* Recently Played */}
        {recentGames.length > 0 && (
          <section className="homepage-section">
            <div className="section-heading">
              <h2>🕐 Continue Playing</h2>
            </div>
            <div className="games-grid">
              {recentGames.map(game => (
                <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </section>
        )}

        {/* Favorite Games */}
        {favoriteGames.length > 0 && (
          <section className="homepage-section">
            <div className="section-heading">
              <h2>❤️ Your Favorites</h2>
            </div>
            <div className="games-grid">
              {favoriteGames.map(game => (
                <GameCard key={game.slug} game={game} isFavorite={true} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Games */}
        <section className="homepage-section">
          <div className="section-heading">
            <h2>⭐ Featured Games</h2>
            <Link to="/online-games/" className="view-all">View All →</Link>
          </div>
          <div className="games-grid">
            {featuredGames.map(game => (
              <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>

        {/* Category Quick Links */}
        <section className="homepage-section">
          <div className="section-heading">
            <h2>📂 Browse Categories</h2>
          </div>
          <div className="category-cards">
            {categories.map(cat => (
              <Link key={cat.slug} to={`/${cat.slug}/`} className="category-card">
                <span className="category-card-icon">
                  {cat.slug === 'google-doodle-games' ? '🎨' :
                   cat.slug === 'online-games' ? '🎮' :
                   cat.slug === 'google-tools' ? '🔧' : '🥚'}
                </span>
                <span className="category-card-name">{cat.name}</span>
                <span className="category-card-count">
                  {games.filter(g => g.category === cat.slug).length} games
                </span>
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
