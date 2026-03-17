import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { games, featuredGameSlugs, getGameBySlug } from '../data/games';
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
        {/* Hero Section - matches WP H1 exactly */}
        <section className="hero-section">
          <h1 className="hero-title">
            Games Doodle – Play Google Doodle Games
          </h1>
        </section>

        {/* Featured Games Grid - matches WP 13-game grid */}
        <section className="homepage-section">
          <div className="games-grid">
            {featuredGames.map(game => (
              <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
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
