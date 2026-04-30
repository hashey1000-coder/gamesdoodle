import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { LazyAd } from '../components/AdSlot';
import GameCard from '../components/GameCard';
import { getGameBySlug } from '../data/games';
import { collections, getCollectionBySlug } from '../data/collections';
import { useFavorites } from '../hooks/useFavorites';

/**
 * CollectionsIndex — shows all curated collections
 */
export function CollectionsIndex() {
  return (
    <>
      <SEO
        title="Game Collections - Curated Playlists | Games Doodle"
        description="Explore curated game collections on Games Doodle. From chill games to brain teasers, find the perfect playlist for your mood."
        canonical="/collections/"
        ogType="article"
        schemaType="category"
        schemaData={{ slug: 'collections', categoryName: 'Game Collections' }}
      />
      <div className="page-content">
        <h1 className="page-title">🎯 Game Collections</h1>
        <p className="category-description">
          Curated playlists for every mood. Pick a collection and start playing!
        </p>
        <LazyAd className="page-ad-slot" />
        <div className="collections-grid">
          {collections.map(col => (
            <Link key={col.slug} to={`/collections/${col.slug}/`} className="collection-card">
              <span className="collection-card-emoji">{col.emoji}</span>
              <div className="collection-card-info">
                <h2 className="collection-card-title">{col.title}</h2>
                <p className="collection-card-desc">{col.description}</p>
                <span className="collection-card-count">{col.gameSlugs.length} games</span>
              </div>
            </Link>
          ))}
        </div>
        <LazyAd className="page-ad-slot" />
      </div>
    </>
  );
}

/**
 * CollectionDetail — shows a single collection's games
 */
export function CollectionDetail() {
  const { collectionSlug } = useParams();
  const collection = getCollectionBySlug(collectionSlug);
  const { toggleFavorite, isFavorite } = useFavorites();

  if (!collection) {
    return (
      <div className="page-content">
        <h1 className="page-title">Collection Not Found</h1>
        <p>This collection doesn't exist. <Link to="/collections/">Browse all collections →</Link></p>
      </div>
    );
  }

  const collectionGames = collection.gameSlugs
    .map(slug => getGameBySlug(slug))
    .filter(Boolean);

  return (
    <>
      <SEO
        title={`${collection.title} - Game Collection | Games Doodle`}
        description={collection.description}
        canonical={`/collections/${collection.slug}/`}
        ogType="article"
        schemaType="category"
        schemaData={{ slug: `collections/${collection.slug}`, categoryName: collection.title }}
      />
      <div className="page-content">
        <nav className="game-breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/collections/">Collections</Link>
          <span className="separator">/</span>
          <span>{collection.title}</span>
        </nav>
        <h1 className="page-title">{collection.emoji} {collection.title}</h1>
        <p className="category-description">{collection.description}</p>
        <LazyAd className="page-ad-slot" />
        <div className="games-grid">
          {collectionGames.map(game => (
            <GameCard
              key={game.slug}
              game={game}
              isFavorite={isFavorite(game.slug)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
        <LazyAd className="page-ad-slot" />
        <div className="collection-back">
          <Link to="/collections/" className="collection-back-link">← All Collections</Link>
        </div>
      </div>
    </>
  );
}
