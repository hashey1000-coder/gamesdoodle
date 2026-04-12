import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { getGameBySlug } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const favoriteGames = favorites
    .map(slug => getGameBySlug(slug))
    .filter(Boolean);

  return (
    <>
      <SEO
        title="Liked Games - Your Favorites | Games Doodle"
        description="All the games you've liked on Games Doodle, saved in one place."
        canonical="/favorites/"
        ogType="article"
        schemaType="category"
        schemaData={{ slug: 'favorites', categoryName: 'Liked Games' }}
      />
      <div className="page-content">
        <h1 className="page-title">❤️ Liked Games</h1>
        <p className="category-description">
          {favoriteGames.length > 0
            ? `${favoriteGames.length} game${favoriteGames.length !== 1 ? 's' : ''} saved to your favorites.`
            : 'You haven\'t liked any games yet.'}
        </p>

        {favoriteGames.length > 0 ? (
          <div className="games-grid">
            {favoriteGames.map(game => (
              <GameCard
                key={game.slug}
                game={game}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="favorites-empty">
            <p className="favorites-empty-hint">
              Hit the 🤍 button on any game page to save it here.
            </p>
            <Link to="/" className="favorites-browse-btn">Browse Games</Link>
          </div>
        )}
      </div>
    </>
  );
}
