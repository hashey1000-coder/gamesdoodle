import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { getCategoryBySlug, getGamesByCategory } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';

const GAMES_PER_PAGE = 12;

export default function CategoryPage({ slug }) {
  const [searchParams] = useSearchParams();
  const category = getCategoryBySlug(slug);
  const { toggleFavorite, isFavorite } = useFavorites();

  const allGames = getGamesByCategory(slug);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const paginatedGames = allGames.slice(startIndex, startIndex + GAMES_PER_PAGE);

  const pageTitle = currentPage > 1
    ? `${category.name} – Page ${currentPage}`
    : category.name;

  const canonical = currentPage > 1
    ? `/${slug}/?page=${currentPage}`
    : `/${slug}/`;

  const SITE_URL = 'https://gamesdoodle.org';
  const prevUrl = currentPage > 1
    ? (currentPage === 2 ? `${SITE_URL}/${slug}/` : `${SITE_URL}/${slug}/?page=${currentPage - 1}`)
    : null;
  const nextUrl = currentPage < totalPages
    ? `${SITE_URL}/${slug}/?page=${currentPage + 1}`
    : null;

  return (
    <>
      <SEO
        title={`${pageTitle} - Games Doodle`}
        description={category.metaDescription}
        canonical={canonical}
        ogType="article"
        schemaType="category"
        schemaData={{
          slug: slug,
          categoryName: category.name,
        }}
      />
      <Helmet>
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}
      </Helmet>
      <div className="page-content">
        <h1 className="page-title">{category.name}</h1>
        {category.description && (
          <p className="category-description">{category.description}</p>
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
                to={currentPage === 2 ? `/${slug}/` : `/${slug}/?page=${currentPage - 1}`}
                className="pagination-link"
              >
                ← Prev
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Link
                key={page}
                to={page === 1 ? `/${slug}/` : `/${slug}/?page=${page}`}
                className={`pagination-link ${page === currentPage ? 'active' : ''}`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                to={`/${slug}/?page=${currentPage + 1}`}
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
