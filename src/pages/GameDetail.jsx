import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GameEmbed from '../components/GameEmbed';
import VoteButtons from '../components/VoteButtons';
import GameCard from '../components/GameCard';
import { games, getCategoryBySlug, getRelatedGames, getTagsForGame } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';
import { usePlayStreak } from '../hooks/usePlayStreak';
import { usePlayCount, formatPlayCount } from '../hooks/usePlayCount';
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
  const { current: streakCurrent, best: streakBest, recordPlay } = usePlayStreak();
  const streak = { current: streakCurrent, best: streakBest };
  const { playCount, incrementPlay } = usePlayCount(game.slug);
  const showToast = useToast();
  const fav = isFavorite(game.slug);

  // Smart "You Might Also Like" — tag-based recommendations beyond relatedSlugs
  const smartRecommendations = getSmartRecommendations(game, relatedGames);

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

  // Track this game as recently played + record streak + play count
  useEffect(() => {
    trackRecentlyPlayed(game.slug);
    recordPlay();
    incrementPlay();
  }, [game.slug, recordPlay, incrementPlay]);

  const handleShare = useCallback(async () => {
    const url = `https://gamesdoodle.org/${game.slug}/`;
    const title = game.title.split(' – ')[0].trim();
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

  // Build FAQ items for schema
  const faqItems = buildFAQ(game, category);

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
          faqItems,
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
            <span>{game.title.split(' – ')[0].trim()}</span>
          </nav>
          <h1 className="game-page-title">{game.title.replace(/ - /g, ' – ')}</h1>
          <div className="game-meta-bar">
            <span className="game-play-count">
              {playCount > 0 ? `🎮 ${formatPlayCount(playCount)} players` : '🎮 Be the first to play!'}
            </span>
            {streak.current > 1 && (
              <span className="game-streak-badge">🔥 {streak.current}-day streak!</span>
            )}
          </div>
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

        {/* Smart Recommendations — related + tag-based */}
        {smartRecommendations.length > 0 && (
          <section className="related-games-section">
            <h2 className="related-games-heading">🎮 You Might Also Like</h2>
            <div className="related-games-strip">
              {smartRecommendations.map(rg => (
                <GameCard key={rg.slug} game={rg} />
              ))}
            </div>
          </section>
        )}

        {/* People Also Play — tag/category discovery chips */}
        <PeopleAlsoPlay game={game} category={category} gameTags={gameTags} />
      </article>
    </>
  );
}

/**
 * People Also Play — surface related tags, category, and relevant collections as chips.
 * Helps with internal linking depth and discovery.
 */
function PeopleAlsoPlay({ game, category, gameTags }) {
  if (!category && gameTags.length === 0) return null;

  return (
    <div className="people-also-play">
      <h3 className="people-also-play-heading">Explore More Like This</h3>
      <div className="people-also-play-chips">
        {category && (
          <Link to={`/${category.slug}/`} className="pap-chip pap-chip-category">
            📁 All {category.name}
          </Link>
        )}
        {gameTags.map(tag => (
          <Link key={tag.slug} to={`/tag/${tag.slug}/`} className="pap-chip pap-chip-tag">
            {tag.emoji} More {tag.name} Games
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Smart recommendations: starts with explicit relatedSlugs,
 * then fills remaining slots with games sharing the same tags,
 * excluding the current game and already-listed games.
 */
function getSmartRecommendations(game, relatedGames) {
  const MAX = 6;
  const seen = new Set([game.slug, ...relatedGames.map(g => g.slug)]);
  const result = [...relatedGames.slice(0, MAX)];

  if (result.length >= MAX) return result;

  // Find games sharing any tag with this game
  if (game.tags && game.tags.length > 0) {
    const tagMatches = games
      .filter(g => !seen.has(g.slug) && g.tags && g.tags.some(t => game.tags.includes(t)))
      .sort((a, b) => {
        // Score by number of overlapping tags
        const scoreA = a.tags.filter(t => game.tags.includes(t)).length;
        const scoreB = b.tags.filter(t => game.tags.includes(t)).length;
        return scoreB - scoreA;
      });

    for (const match of tagMatches) {
      if (result.length >= MAX) break;
      result.push(match);
      seen.add(match.slug);
    }
  }

  // Fill with same-category games if still short
  if (result.length < MAX) {
    const catMatches = games.filter(g => !seen.has(g.slug) && g.category === game.category);
    for (const match of catMatches) {
      if (result.length >= MAX) break;
      result.push(match);
      seen.add(match.slug);
    }
  }

  return result;
}

/**
 * Build FAQ items for a game page for FAQPage schema.
 */
function buildFAQ(game, category) {
  const shortTitle = game.title.split(' – ')[0].trim();
  const faqs = [];

  faqs.push({
    question: `How do you play ${shortTitle}?`,
    answer: `You can play ${shortTitle} directly in your browser — no downloads needed. Simply click the "Play Now" button on the game page and follow the on-screen instructions to get started.`,
  });

  faqs.push({
    question: `Is ${shortTitle} free to play?`,
    answer: `Yes, ${shortTitle} is completely free to play on Games Doodle. No sign-up, no downloads, and no hidden fees. Just open the page and start playing instantly.`,
  });

  if (category) {
    faqs.push({
      question: `What type of game is ${shortTitle}?`,
      answer: `${shortTitle} is a ${category.name.toLowerCase().replace(/s$/, '')} game. You can find more similar games in the ${category.name} category on Games Doodle.`,
    });
  }

  faqs.push({
    question: `Can I play ${shortTitle} on my phone?`,
    answer: `Yes! ${shortTitle} works on both desktop and mobile browsers. It's fully responsive and optimized for touchscreen controls on smartphones and tablets.`,
  });

  return faqs;
}
