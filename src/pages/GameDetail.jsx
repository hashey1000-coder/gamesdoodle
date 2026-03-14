import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameEmbed from '../components/GameEmbed';
import VoteButtons from '../components/VoteButtons';
import GameCard from '../components/GameCard';
import { getCategoryBySlug, getRelatedGames, getTagsForGame } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../components/Toast';

function trackRecentlyPlayed(slug) {
  try {
    let recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    recent = recent.filter(s => s !== slug);
    recent.unshift(slug);
    recent = recent.slice(0, 12);
    localStorage.setItem('recentlyPlayed', JSON.stringify(recent));
  } catch { /* ignore */ }
}

export default function GameDetail({ game }) {
  const category = getCategoryBySlug(game.category);
  const relatedGames = getRelatedGames(game.relatedSlugs || []);
  const gameTags = getTagsForGame(game);
  const { toggleFavorite, isFavorite } = useFavorites();
  const showToast = useToast();
  const fav = isFavorite(game.slug);

  // Show 'continue' toast only once per session per game
  useEffect(() => {
    try {
      const sessionKey = `welcomed_${game.slug}`;
      if (sessionStorage.getItem(sessionKey)) return;
      const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      if (recent.includes(game.slug)) {
        sessionStorage.setItem(sessionKey, '1');
        setTimeout(() => showToast('Welcome back! 👾 Jump straight in ▶'), 800);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.slug]);

  // Track this game as recently played
  useEffect(() => {
    trackRecentlyPlayed(game.slug);
  }, [game.slug]);

  const handleShare = useCallback(async () => {
    const url = `https://gamesdoodle.org/${game.slug}/`;
    const title = game.title.split(/[–\-]/)[0].trim();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    }
  }, [game.slug, game.title, showToast]);

  const handleFavorite = useCallback(() => {
    toggleFavorite(game.slug);
    showToast(fav ? 'Removed from favorites' : 'Added to favorites! ❤️');
  }, [game.slug, fav, toggleFavorite, showToast]);

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
          <div className="game-action-bar">
            <button className={`action-btn fav-btn${fav ? ' active' : ''}`} onClick={handleFavorite}>
              {fav ? '❤️' : '🤍'} {fav ? 'Favorited' : 'Favorite'}
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              📤 Share
            </button>
          </div>
        </div>

        <GameEmbed game={game} />

        <VoteButtons slug={game.slug} />

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

        {gameTags.length > 0 && (
          <div className="game-tags">
            <span className="tag-label">Tags:</span>
            <div className="game-tags-list">
              {gameTags.map(tag => (
                <Link key={tag.slug} to={`/tag/${tag.slug}/`} className="game-tag-pill">
                  {tag.emoji} {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Games Section */}
        {relatedGames.length > 0 && (
          <section className="related-games-section">
            <h2 className="related-games-heading">🎮 You May Also Like</h2>
            <div className="related-games-strip">
              {relatedGames.map(rg => (
                <GameCard key={rg.slug} game={rg} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
