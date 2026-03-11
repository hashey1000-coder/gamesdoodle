import { useParams } from 'react-router-dom';
import { getGameBySlug, getCategoryBySlug } from '../data/games';
import { staticPages } from '../data/staticPages';
import CategoryPage from './CategoryPage';
import StaticPage from './StaticPage';
import GameDetail from './GameDetail';
import NotFoundPage from './NotFoundPage';

export default function GamePage() {
  const { slug } = useParams();

  // Check if it's a category page
  const category = getCategoryBySlug(slug);
  if (category) {
    return <CategoryPage slug={slug} />;
  }

  // Check if it's a static page
  if (staticPages[slug]) {
    return <StaticPage slug={slug} />;
  }

  // Check if it's a game page
  const game = getGameBySlug(slug);
  if (game) {
    return <GameDetail game={game} />;
  }

  // Nothing matched - 404
  return <NotFoundPage />;
}
