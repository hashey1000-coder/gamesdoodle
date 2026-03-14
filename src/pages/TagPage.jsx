import { useSearchParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { getTagBySlug, getGamesByTag } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

const GAMES_PER_PAGE = 12;

export default function TagPage({ slug }) {
  const [searchParams] = useSearchParams();
  const tag = getTagBySlug(slug);
  const { toggleFavorite, isFavorite } = useFavorites();

  const allGames = getGamesByTag(slug);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const paginatedGames = allGames.slice(startIndex, startIndex + GAMES_PER_PAGE);

  const pageTitle = currentPage > 1
    ? `${tag.emoji} ${tag.name} Games – Page ${currentPage}`
    : `${tag.emoji} ${tag.name} Games`;

  const canonical = currentPage > 1
    ? `/tag/${slug}/?page=${currentPage}`
    : `/tag/${slug}/`;

  return (
    <>
      <SEO
        title={`${tag.name} Games – Play Free Online | Games Doodle`}
        description={tag.description}
        canonical={canonical}
        ogType="article"
        schemaType="category"
        schemaData={{
          slug: `tag/${slug}`,
          categoryName: `${tag.name} Games`,
        }}
      />
      <div className="page-content">
        <h1 className="page-title">{pageTitle}</h1>
        {tag.description && (
          <p className="category-description">{tag.description}</p>
        )}
        <div className="category-meta">
          🎯 {allGames.length} games available
        </div>
        <div className="games-grid">
          {paginatedGames.map(game => (
            <GameCard key={game.slug} game={game} isFavorite={isFavorite(game.slug)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="pagination">
            {currentPage > 1 && (
              <Link
                to={currentPage === 2 ? `/tag/${slug}/` : `/tag/${slug}/?page=${currentPage - 1}`}
                className="pagination-link"
              >
                ← Prev
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Link
                key={page}
                to={page === 1 ? `/tag/${slug}/` : `/tag/${slug}/?page=${page}`}
                className={`pagination-link ${page === currentPage ? 'active' : ''}`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                to={`/tag/${slug}/?page=${currentPage + 1}`}
                className="pagination-link"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
