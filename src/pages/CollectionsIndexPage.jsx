import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { COLLECTIONS } from './CollectionPage';
import { games } from '../data/games';

export default function CollectionsIndexPage() {
  return (
    <>
      <SEO
        title="Game Collections – Curated Free Browser Games | Games Doodle"
        description="Browse curated collections of the best free browser games. From top puzzle games to the best Google Doodles — hand-picked lists for every type of player."
        canonical="/collections/"
        ogType="website"
        schemaType="category"
        schemaData={{ slug: 'collections', categoryName: 'Game Collections' }}
      />
      <div className="page-content">
        <h1 className="page-title">Game Collections</h1>
        <p className="category-description">
          Hand-picked lists of the best free browser games, organised by genre and theme.
        </p>

        <div className="collections-grid">
          {COLLECTIONS.map(col => {
            const count = games.filter(col.filter).length;
            return (
              <Link key={col.slug} to={`/collection/${col.slug}/`} className="collection-card">
                <span className="collection-card-emoji">{col.emoji}</span>
                <div className="collection-card-info">
                  <span className="collection-card-title">{col.title}</span>
                  <p className="collection-card-desc">{col.description.split('.')[0]}.</p>
                  <span className="collection-card-count">{Math.min(count, col.limit)} games</span>
                </div>
                <span className="collection-card-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
