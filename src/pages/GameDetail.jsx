import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameEmbed from '../components/GameEmbed';
import { getCategoryBySlug } from '../data/games';

export default function GameDetail({ game }) {
  const category = getCategoryBySlug(game.category);

  // Calculate word count from content (strip HTML tags)
  const plainText = game.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).length;

  // Use a consistent publish date (site launch) since WordPress dates aren't preserved
  const datePublished = game.datePublished || '2024-01-15T00:00:00+00:00';
  const dateModified = game.dateModified || '2025-01-15T00:00:00+00:00';

  return (
    <>
      <SEO
        title={game.title}
        description={game.metaDescription}
        canonical={`/${game.slug}/`}
        ogType="article"
        image={game.thumbnail}
        schemaType="game"
        schemaData={{
          slug: game.slug,
          category: category || null,
          image: game.thumbnail,
          datePublished,
          dateModified,
          wordCount,
        }}
      />
      <article className="game-page">
        <div className="game-page-header">
          <nav className="game-breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            {category && (
              <>
                <Link to={`/${category.slug}/`}>{category.name}</Link>
                <span className="separator">/</span>
              </>
            )}
            <span>{game.title.split(/[–\-]/)[0].trim()}</span>
          </nav>
          <h1 className="game-page-title">{game.title}</h1>
        </div>

        <GameEmbed game={game} />

        <div
          className="game-page-content"
          dangerouslySetInnerHTML={{ __html: game.content }}
        />

        {category && (
          <div className="game-category-tag">
            <span className="tag-label">Category:</span>
            <Link to={`/${category.slug}/`}>{category.name}</Link>
          </div>
        )}
      </article>
    </>
  );
}
