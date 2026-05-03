import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function formatPlayCount(count) {
  if (!count) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

const FALLBACK_TRENDING = [
  { slug: 'doodle-baseball', title: 'Google Doodle Baseball - Play 4th of July Game Online', thumbnail: '/images/doodle-baseball.webp', _playCount: 5400 },
  { slug: 'drive-mad', title: 'Drive Mad - Play the Physics Driving Game Online', thumbnail: '/images/drive-mad-small.webp', _playCount: 3300 },
  { slug: 'google-cricket', title: 'Google Cricket - Play Google Doodle Cricket Online', thumbnail: '/images/google-cricket.webp', _playCount: 1500 },
  { slug: 'google-snake', title: 'Google Snake - Play Classic Snake Game Online', thumbnail: '/images/google-snake.webp', _playCount: 1200 },
  { slug: 'dinosaur-game', title: 'Google Dinosaur Game - Play Chrome Dino Run Online', thumbnail: '/images/dinosaur-game.webp', _playCount: 1000 },
  { slug: 'google-pacman', title: 'Google Pacman - Play the Game Free Online', thumbnail: '/images/google-pacman.webp', _playCount: 900 },
  { slug: 'slope-unblocked', title: 'Slope Unblocked - Play the Endless Runner Online', thumbnail: '/images/slope-unblocked.webp', _playCount: 800 },
  { slug: 'google-tic-tac-toe', title: 'Google Tic Tac Toe - Play Game Free Online', thumbnail: '/images/google-tic-tac-toe.webp', _playCount: 700 },
];

const TRENDING_THUMBS = {
  '/images/doodle-baseball.webp': '/images/doodle-baseball-tiny.webp',
  '/images/google-cricket.webp': '/images/google-cricket-tiny.webp',
  '/images/google-snake.webp': '/images/google-snake-tiny.webp',
  '/images/google-tic-tac-toe.webp': '/images/google-tic-tac-toe-tiny.webp',
};

function getTrendingThumb(src) {
  return TRENDING_THUMBS[src] || src;
}

function runAfterUserOrDelay(callback) {
  if (typeof window === 'undefined') return () => {};

  let timerId;
  let complete = false;
  const run = () => {
    if (complete) return;
    complete = true;
    window.clearTimeout(timerId);
    callback();
  };

  timerId = window.setTimeout(run, 15000);
  ['pointerdown', 'keydown', 'touchstart'].forEach(eventName => {
    window.addEventListener(eventName, run, { once: true, passive: true });
  });

  return () => {
    complete = true;
    window.clearTimeout(timerId);
    ['pointerdown', 'keydown', 'touchstart'].forEach(eventName => {
      window.removeEventListener(eventName, run);
    });
  };
}

/**
 * Trending Games section — shows top games by recent play count.
 * Pulls from Firebase playCounts and displays as a horizontal strip.
 */
export default function TrendingGames() {
  const [trending, setTrending] = useState(FALLBACK_TRENDING);

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let unsubscribe;
    let cancelled = false;

    const subscribe = async () => {
      const [{ ref, onValue, query, orderByValue, limitToLast }, { db }, { getGameBySlug }] = await Promise.all([
        import('firebase/database'),
        import('../firebase'),
        import('../data/games'),
      ]);

      if (cancelled || !db) return;

      const topRef = query(ref(db, 'playCounts'), orderByValue(), limitToLast(10));
      unsubscribe = onValue(topRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const entries = Object.entries(data)
          .map(([slug, count]) => ({ slug, count }))
          .sort((a, b) => b.count - a.count);
        const resolved = entries
          .map(e => {
            const g = getGameBySlug(e.slug);
            return g ? { ...g, _playCount: e.count } : null;
          })
          .filter(Boolean)
          .slice(0, 8);
        if (resolved.length > 0) setTrending(resolved);
      });
    };

    const cleanupDelay = runAfterUserOrDelay(subscribe);
    return () => {
      cancelled = true;
      cleanupDelay();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (trending.length === 0) return null;

  return (
    <section className="homepage-section trending-section">
      <div className="homepage-section-header">
        <h2 className="homepage-section-title">🔥 Trending Now</h2>
        <Link to="/top-games/" className="homepage-section-link">All top games →</Link>
      </div>
      <div className="trending-strip">
        {trending.map((game, i) => {
          const shortTitle = game.title.split(' – ')[0].trim();
          return (
            <Link key={game.slug} to={`/${game.slug}/`} className="trending-card">
              <span className="trending-rank">#{i + 1}</span>
              <div className="trending-thumb">
                {game.thumbnail && (
                  <img src={getTrendingThumb(game.thumbnail)} alt="" loading="lazy" decoding="async" width="48" height="28" />
                )}
              </div>
              <div className="trending-info">
                <span className="trending-title">{shortTitle}</span>
                <span className="trending-plays">{formatPlayCount(game._playCount)} plays</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
