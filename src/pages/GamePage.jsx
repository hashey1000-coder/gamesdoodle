import { useParams, Navigate } from 'react-router-dom';
import { getGameBySlug, getCategoryBySlug } from '../data/games';
import { staticPages } from '../data/staticPages';
import CategoryPage from './CategoryPage';
import StaticPage from './StaticPage';
import GameDetail from './GameDetail';
import NotFoundPage from './NotFoundPage';

export default function GamePage() {
  const { slug, page } = useParams();

  // Handle WordPress-style pagination URLs: /online-games/page/2/ → /online-games/?page=2
  if (page) {
    const pageNum = parseInt(page, 10);
    if (pageNum === 1) {
      return <Navigate to={`/${slug}/`} replace />;
    }
    return <Navigate to={`/${slug}/?page=${pageNum}`} replace />;
  }

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
