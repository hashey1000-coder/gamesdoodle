import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByValue, limitToLast } from 'firebase/database';
import { db } from '../firebase';
import { getGameBySlug } from '../data/games';
import { formatPlayCount } from '../hooks/usePlayCount';

/**
 * Trending Games section — shows top games by recent play count.
 * Pulls from Firebase playCounts and displays as a horizontal strip.
 */
export default function TrendingGames() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    if (!db) return;
    const topRef = query(ref(db, 'playCounts'), orderByValue(), limitToLast(10));
    const unsubscribe = onValue(topRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setTrending([]); return; }
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
      setTrending(resolved);
    });
    return () => unsubscribe();
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
