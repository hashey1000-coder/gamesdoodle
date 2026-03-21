import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { games } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

export default function NewGamesPage() {
  const { toggleFavorite, isFavorite } = useFavorites();

  // Sort games by datePublished (newest first), fallback to dateAdded
  const sortedGames = [...games]
    .filter(g => g.datePublished || g.dateAdded)
    .sort((a, b) => {
      const dateA = new Date(a.datePublished || a.dateAdded);
      const dateB = new Date(b.datePublished || b.dateAdded);
      return dateB - dateA;
    })
    .slice(0, 48);

  return (
    <>
      <SEO
        title="New Games - Recently Added | Games Doodle"
        description="Discover the newest games added to Games Doodle. Browse the latest additions including Google Doodle games, online games, and fun browser games."
        canonical="/new-games/"
        ogType="article"
        schemaType="category"
        schemaData={{ slug: 'new-games', categoryName: 'New Games' }}
      />
      <div className="page-content">
        <h1 className="page-title">🆕 New Games</h1>
        <p className="category-description">
          The latest games added to Games Doodle. Check back often for fresh additions!
        </p>
        <div className="category-meta">
          🎮 Showing {sortedGames.length} newest games
        </div>
        <div className="games-grid">
          {sortedGames.map(game => (
            <GameCard
              key={game.slug}
              game={game}
              isFavorite={isFavorite(game.slug)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </>
  );
}
