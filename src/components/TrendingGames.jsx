import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByValue, limitToLast } from 'firebase/database';
import { db } from '../firebase';
import { getGameBySlug } from '../data/games';
import { formatPlayCount } from '../hooks/usePlayCount';

const FALLBACK_TRENDING_SLUGS = [
  'doodle-baseball',
  'drive-mad',
  'google-cricket',
  'google-snake',
  'dinosaur-game',
  'google-pacman',
  'slope-unblocked',
  'google-tic-tac-toe',
];

const FALLBACK_TRENDING = FALLBACK_TRENDING_SLUGS
  .map((slug, index) => {
    const game = getGameBySlug(slug);
    return game ? { ...game, _playCount: [5400, 3300, 1500, 1200, 1000, 900, 800, 700][index] } : null;
  })
  .filter(Boolean);

/**
 * Trending Games section — shows top games by recent play count.
 * Pulls from Firebase playCounts and displays as a horizontal strip.
 */
export default function TrendingGames() {
  const [trending, setTrending] = useState(FALLBACK_TRENDING);

  useEffect(() => {
    if (!db) return;
    let unsubscribe;

    const subscribe = () => {
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

    const timer = setTimeout(subscribe, 2500);
    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (trending.length === 0) return null;

  return (
    <section className="homepage-section trending-section">
      <div className="homepage-section-header">
        <h2 className="homepage-section-title">🔥 Trending Now</h2>
        <Link to="/top-games/" className="homepage-section-link">See all →</Link>
      </div>
      <div className="trending-strip">
        {trending.map((game, i) => {
          const shortTitle = game.title.split(' – ')[0].trim();
          return (
            <Link key={game.slug} to={`/${game.slug}/`} className="trending-card">
              <span className="trending-rank">#{i + 1}</span>
              <div className="trending-thumb">
                {game.thumbnail && (
                  <img src={game.thumbnail} alt={shortTitle} loading="lazy" width="120" height="68" />
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
