import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { games, featuredGameSlugs } from '../data/games';

export default function HomePage() {
  const featuredGames = featuredGameSlugs
    .map(slug => games.find(g => g.slug === slug))
    .filter(Boolean);

  return (
    <>
      <SEO
        title="Games Doodle – Play Google Doodle Games"
        description="Play the best Google Doodle Games, online games, and Google Easter eggs for free. No downloads needed – play instantly in your browser at Games Doodle."
        canonical="/"
        schemaType="homepage"
      />
      <div className="page-content">
        <h1 className="page-title">Games Doodle – Play Google Doodle Games</h1>
        <div className="games-grid">
          {featuredGames.map(game => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
        <div className="homepage-seo-text">
          <p>Google Games are widely known for their simple yet addictive gameplay, and many of the most popular titles come from interactive doodles released over the years. These google doodle games are designed to be fun, lightweight, and easy to play directly in a browser. From classic arcade-style challenges to creative puzzle experiences, they offer instant entertainment without downloads or complex setup.</p>
          <p>A large collection of doodle games allows players to revisit iconic moments transformed into playable experiences. Sports challenges, brain teasers, rhythm-based games, and time-based adventures are all part of these google games free to play. Their minimal controls and smooth performance make them accessible for all ages, whether you're playing for a few minutes or spending longer sessions mastering each game.</p>
          <p>By bringing together a wide range of google games, players can enjoy the best of google doodle games in one place. These google games free provide quick fun, nostalgia, and creativity, making them perfect for casual gaming anytime. With no installs required, doodle games remain one of the easiest and most enjoyable ways to play online.</p>
        </div>
      </div>
    </>
  );
}
