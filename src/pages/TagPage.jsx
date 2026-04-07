import { useSearchParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { getTagBySlug, getGamesByTag, tags } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';
import { COLLECTIONS } from './CollectionPage';

const GAMES_PER_PAGE = 48;

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
        {currentPage === 1 && tag.introContent && (
          <p className="category-intro-content">{tag.introContent}</p>
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

        {/* Related tags */}
        <div className="related-tags-section">
          <h3 className="related-tags-heading">Explore Other Game Types</h3>
          <div className="related-tags-chips">
            {tags.filter(t => t.slug !== slug).map(t => (
              <Link key={t.slug} to={`/tag/${t.slug}/`} className="related-tag-chip">
                {t.emoji} {t.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Related collections */}
        {COLLECTIONS.filter(col => col.filter && col.slug.includes(slug.split('-')[0]) || COLLECTIONS.find(c => c.slug === `best-${slug}-games`)).length > 0 && (
          <div className="related-tags-section" style={{ marginTop: 0 }}>
            <h3 className="related-tags-heading">Curated {tag.name} Collections</h3>
            <div className="related-tags-chips">
              {COLLECTIONS.filter(col => {
                // Show collections that match this tag's games
                const tagGames = getGamesByTag(slug);
                return tagGames.some(g => col.filter(g));
              }).map(col => (
                <Link key={col.slug} to={`/collection/${col.slug}/`} className="related-tag-chip related-tag-chip-collection">
                  {col.emoji} {col.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
