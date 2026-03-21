import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByValue, limitToLast } from 'firebase/database';
import SEO from '../components/SEO';
import { games, getGameBySlug, getCategoryBySlug } from '../data/games';
import { db } from '../firebase';
import { formatPlayCount } from '../hooks/usePlayCount';

// Fallback shown before Firebase has any data
const FALLBACK_GAMES = games.slice(0, 30);

// Most Recent: sort by dateAdded descending, fallback to isNew flag
const RECENT_GAMES = [...games]
  .sort((a, b) => {
    const da = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
    const db_ = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
    return db_ - da;
  })
  .slice(0, 30);

function LeaderboardRow({ game, index, scoreLabel }) {
  const category = getCategoryBySlug(game.category);
  const shortTitle = game.title.split(' – ')[0].trim();
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

  return (
    <Link to={`/${game.slug}/`} className="leaderboard-row">
      <span className="leaderboard-rank">
        {medal
          ? <span className="leaderboard-medal">{medal}</span>
          : <span className="leaderboard-num">#{index + 1}</span>}
      </span>
      <div className="leaderboard-thumb">
        <img src={game.thumbnail} alt={shortTitle} loading="lazy" width="80" height="45" />
      </div>
      <div className="leaderboard-info">
        <span className="leaderboard-title">{shortTitle}</span>
        {category && <span className="leaderboard-cat">{category.name}</span>}
      </div>
      {scoreLabel && <span className="leaderboard-score">{scoreLabel}</span>}
      <span className="leaderboard-play">▶</span>
    </Link>
  );
}

export default function TopGamesPage() {
  const [topGames, setTopGames] = useState(null); // null = loading
  const [sortBy, setSortBy] = useState('plays');

  useEffect(() => {
    // Recent tab uses local data — no Firebase needed
    if (sortBy === 'recent') {
      setTopGames(RECENT_GAMES);
      return;
    }

    if (!db) { setTopGames([]); return; }

    setTopGames(null); // show skeleton while switching tabs

    const dbPath = sortBy === 'plays' ? 'playCounts' : 'votes';
    const topRef = query(ref(db, dbPath), orderByValue(), limitToLast(50));

    const unsubscribe = onValue(topRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setTopGames([]); return; }

      let entries;
      if (sortBy === 'votes') {
        entries = Object.entries(data)
          .map(([slug, val]) => ({ slug, score: (val?.up || 0) - (val?.down || 0) }))
          .sort((a, b) => b.score - a.score);
      } else {
        entries = Object.entries(data)
          .map(([slug, count]) => ({ slug, score: count }))
          .sort((a, b) => b.score - a.score);
      }

      const resolved = entries
        .map(e => { const g = getGameBySlug(e.slug); return g ? { ...g, _score: e.score } : null; })
        .filter(Boolean)
        .slice(0, 30);

      setTopGames(resolved);
    });

    return () => unsubscribe();
  }, [sortBy]);

  const isLoading = topGames === null;
  const hasData  = !isLoading && topGames.length > 0;
  const isEmpty  = !isLoading && topGames.length === 0;

  return (
    <>
      <SEO
        title="Top Games - Most Popular | Games Doodle"
        description="Play the most popular games on Games Doodle. See what everyone is playing — top-voted and most-played Google Doodle games and browser games."
        canonical="/top-games/"
        ogType="article"
        schemaType="category"
        schemaData={{ slug: 'top-games', categoryName: 'Top Games' }}
      />
      <div className="page-content">
        <h1 className="page-title">🏆 Top Games</h1>
        <p className="category-description">
          The most popular games on Games Doodle, ranked by the community.
        </p>

        <div className="top-games-tabs">
          <button className={`top-tab${sortBy === 'plays' ? ' active' : ''}`} onClick={() => setSortBy('plays')}>
            Most Played
          </button>
          <button className={`top-tab${sortBy === 'votes' ? ' active' : ''}`} onClick={() => setSortBy('votes')}>
            Top Voted
          </button>
          <button className={`top-tab${sortBy === 'recent' ? ' active' : ''}`} onClick={() => setSortBy('recent')}>
            Most Recent
          </button>
        </div>

        {isLoading && (
          <div className="leaderboard-list">
            {[...Array(10)].map((_, i) => <div key={i} className="leaderboard-skeleton" />)}
          </div>
        )}

        {hasData && (
          <div className="leaderboard-list">
            {topGames.map((game, i) => (
              <LeaderboardRow
                key={game.slug}
                game={game}
                index={i}
                scoreLabel={sortBy === 'plays'
                  ? `${formatPlayCount(game._score)} players`
                  : sortBy === 'votes'
                  ? `${game._score > 0 ? '+' : ''}${game._score} votes`
                  : game.dateAdded || ''}
              />
            ))}
          </div>
        )}

        {isEmpty && (
          <>
            <div className="leaderboard-empty-notice">
              <span className="leaderboard-empty-icon">📊</span>
              <p>Rankings build up as people play. <strong>Start playing to get on the charts!</strong></p>
              <p className="leaderboard-empty-sub">Here are some great games to kick things off:</p>
            </div>
            <div className="leaderboard-list">
              {FALLBACK_GAMES.map((game, i) => (
                <LeaderboardRow key={game.slug} game={game} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}