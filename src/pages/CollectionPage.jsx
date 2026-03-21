import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { games, getTagsForGame, getCategoryBySlug } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

// Define all collections with hand-picked or tag/category-filtered games
export const COLLECTIONS = [
  {
    slug: 'best-puzzle-games',
    title: 'Best Puzzle Games',
    emoji: '🧩',
    description: 'The best free puzzle games you can play right in your browser. Train your brain with these top-rated logic, word, and spatial reasoning challenges.',
    metaDescription: 'Play the best free puzzle games online. Top-rated browser puzzle games — no download needed. Brain teasers, logic games, and more.',
    filter: g => g.tags && g.tags.includes('puzzle'),
    limit: 24,
  },
  {
    slug: 'best-arcade-games',
    title: 'Best Arcade Games',
    emoji: '👾',
    description: 'Classic and modern arcade games you can play free in your browser. Fast-paced action, high scores, and endless fun.',
    metaDescription: 'Play the best free arcade games online. Top-rated browser arcade games — instant play, no download.',
    filter: g => g.tags && g.tags.includes('arcade'),
    limit: 24,
  },
  {
    slug: 'best-sports-games',
    title: 'Best Sports Games',
    emoji: '⚽',
    description: 'The best free sports games to play online. Football, basketball, cricket, and more — all playable instantly in your browser.',
    metaDescription: 'Play the best free sports games online. Top browser sports games including football, basketball, and more.',
    filter: g => g.tags && g.tags.includes('sports'),
    limit: 24,
  },
  {
    slug: 'top-10-google-doodle-games',
    title: 'Top 10 Google Doodle Games',
    emoji: '🎨',
    description: "Google's most iconic and beloved Doodle games of all time, ranked and ready to play. From Pac-Man to Cricket, these are the ones everyone remembers.",
    metaDescription: 'Play the top 10 Google Doodle games of all time. Iconic browser games from Google — free, instant play.',
    filter: g => g.category === 'google-doodle-games',
    limit: 10,
  },
  {
    slug: 'best-multiplayer-io-games',
    title: 'Best Multiplayer .io Games',
    emoji: '🌐',
    description: 'The best .io multiplayer games playable free in your browser. Compete against real players worldwide in real-time battles.',
    metaDescription: 'Play the best free .io multiplayer games online. Top browser .io games — instant play against real players.',
    filter: g => g.tags && g.tags.includes('io'),
    limit: 24,
  },
  {
    slug: 'best-racing-games',
    title: 'Best Racing Games',
    emoji: '🏎️',
    description: 'Top free racing games to play in your browser. Cars, bikes, stunts — high-speed fun with zero downloads required.',
    metaDescription: 'Play the best free racing games online. Top browser racing and driving games — instant play, no download.',
    filter: g => g.tags && g.tags.includes('racing'),
    limit: 24,
  },
  {
    slug: 'best-google-easter-eggs',
    title: 'Best Google Easter Eggs',
    emoji: '🥚',
    description: "Hidden secrets and fun tricks built into Google's own products. These interactive Easter eggs are waiting to be discovered.",
    metaDescription: "Play the best Google Easter egg games and tricks online. Hidden interactive features from Google — free and instant.",
    filter: g => g.category === 'google-easter-egg',
    limit: 24,
  },
  {
    slug: 'best-strategy-games',
    title: 'Best Strategy Games',
    emoji: '♟️',
    description: 'Top free strategy games to sharpen your mind. Tower defense, resource management, and tactical challenges — all browser-based.',
    metaDescription: 'Play the best free strategy games online. Top browser strategy and tower defense games — instant play.',
    filter: g => g.tags && g.tags.includes('strategy'),
    limit: 24,
  },
];

export function getCollectionBySlug(slug) {
  return COLLECTIONS.find(c => c.slug === slug);
}

export default function CollectionPage({ slug }) {
  const collection = getCollectionBySlug(slug);
  const { toggleFavorite, isFavorite } = useFavorites();

  if (!collection) return null;

  const collectionGames = games.filter(collection.filter).slice(0, collection.limit);

  return (
    <>
      <SEO
        title={`${collection.title} – Play Free Online | Games Doodle`}
        description={collection.metaDescription}
        canonical={`/collection/${slug}/`}
        ogType="article"
        schemaType="category"
        schemaData={{ slug: `collection/${slug}`, categoryName: collection.title }}
      />
      <div className="page-content">
        <h1 className="page-title">{collection.title}</h1>
        <p className="category-description">{collection.description}</p>
        <div className="category-meta">
          {collectionGames.length} games in this collection
        </div>
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

        {/* Link to all collections */}
        <div className="collection-back">
          <Link to="/collections/" className="collection-back-link">
            ← View All Collections
          </Link>
        </div>
      </div>
    </>
  );
}
