import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { LazyAd } from '../components/AdSlot';
import { games, getGameBySlug, categories } from '../data/games';
import { useAchievements, ACHIEVEMENT_DEFS } from '../hooks/useAchievements';

function getRecentlyPlayed() {
  try {
    return JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
  } catch { return []; }
}

function getStreak() {
  try {
    return JSON.parse(localStorage.getItem('playStreak') || '{}');
  } catch { return {}; }
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favoriteGames') || '[]');
  } catch { return []; }
}

function getVoteCount() {
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vote_')) count++;
    }
  } catch { /* ignore */ }
  return count;
}

function getCategoryBreakdown(played) {
  const catCounts = {};
  for (const slug of played) {
    const game = getGameBySlug(slug);
    if (game?.category) {
      catCounts[game.category] = (catCounts[game.category] || 0) + 1;
    }
  }
  return Object.entries(catCounts)
    .map(([slug, count]) => {
      const cat = categories.find(c => c.slug === slug);
      return { slug, name: cat?.name || slug, count };
    })
    .sort((a, b) => b.count - a.count);
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const { unlocked, definitions, totalAchievements, checkAndUnlock } = useAchievements();

  useEffect(() => {
    const played = getRecentlyPlayed();
    const streak = getStreak();
    const favorites = getFavorites();
    const voteCount = getVoteCount();
    const catBreakdown = getCategoryBreakdown(played);
    const recentGames = played.slice(0, 10).map(s => getGameBySlug(s)).filter(Boolean);
    const favGames = favorites.slice(0, 10).map(s => getGameBySlug(s)).filter(Boolean);

    setStats({
      totalPlayed: played.length,
      totalGames: games.length,
      currentStreak: streak.current || 0,
      bestStreak: streak.best || 0,
      totalFavorites: favorites.length,
      totalVotes: voteCount,
      catBreakdown,
      recentGames,
      favGames,
    });

    checkAndUnlock();
  }, [checkAndUnlock]);

  const unlockedCount = Object.keys(unlocked).length;

  return (
    <>
      <SEO
        title="My Stats - Your Gaming Dashboard | Games Doodle"
        description="View your personal gaming stats, achievements, play streaks, and more on Games Doodle."
        canonical="/my-stats/"
        ogType="article"
        schemaType="category"
        schemaData={{ slug: 'my-stats', categoryName: 'My Stats' }}
      />
      <div className="page-content stats-page">
        <h1 className="page-title">📊 My Stats</h1>
        <p className="category-description">Your personal gaming dashboard — track your progress and unlock achievements.</p>

        {!stats ? (
          <div className="stats-loading">Loading your stats…</div>
        ) : (
          <>
            <LazyAd className="page-ad-slot" />

            {/* Overview Cards */}
            <div className="stats-overview">
              <div className="stat-card">
                <span className="stat-card-emoji">🎮</span>
                <span className="stat-card-value">{stats.totalPlayed}</span>
                <span className="stat-card-label">Games Played</span>
                <span className="stat-card-sub">of {stats.totalGames} total</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-emoji">🔥</span>
                <span className="stat-card-value">{stats.currentStreak}</span>
                <span className="stat-card-label">Day Streak</span>
                <span className="stat-card-sub">Best: {stats.bestStreak} days</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-emoji">❤️</span>
                <span className="stat-card-value">{stats.totalFavorites}</span>
                <span className="stat-card-label">Favorites</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-emoji">🗳️</span>
                <span className="stat-card-value">{stats.totalVotes}</span>
                <span className="stat-card-label">Votes Cast</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-emoji">🏅</span>
                <span className="stat-card-value">{unlockedCount}/{totalAchievements}</span>
                <span className="stat-card-label">Achievements</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="stats-progress-section">
              <h2>🗺️ Exploration Progress</h2>
              <div className="stats-progress-bar">
                <div
                  className="stats-progress-fill"
                  style={{ width: `${Math.round((stats.totalPlayed / stats.totalGames) * 100)}%` }}
                />
              </div>
              <span className="stats-progress-text">
                {Math.round((stats.totalPlayed / stats.totalGames) * 100)}% explored ({stats.totalPlayed}/{stats.totalGames})
              </span>
            </div>

            {/* Category Breakdown */}
            {stats.catBreakdown.length > 0 && (
              <div className="stats-section">
                <h2>📁 Categories Played</h2>
                <div className="stats-cat-grid">
                  {stats.catBreakdown.map(cat => (
                    <Link key={cat.slug} to={`/${cat.slug}/`} className="stats-cat-card">
                      <span className="stats-cat-name">{cat.name}</span>
                      <span className="stats-cat-count">{cat.count} games</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="stats-section">
              <h2>🏆 Achievements ({unlockedCount}/{totalAchievements})</h2>
              <div className="achievements-grid">
                {definitions.map(def => {
                  const isUnlocked = !!unlocked[def.id];
                  return (
                    <div key={def.id} className={`achievement-card${isUnlocked ? ' unlocked' : ' locked'}`}>
                      <span className="achievement-emoji">{def.emoji}</span>
                      <span className="achievement-title">{def.title}</span>
                      <span className="achievement-desc">{def.description}</span>
                      {isUnlocked && <span className="achievement-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Games */}
            <LazyAd />
            {stats.recentGames.length > 0 && (
              <div className="stats-section">
                <h2>🕐 Recently Played</h2>
                <div className="stats-game-list">
                  {stats.recentGames.map(game => (
                    <Link key={game.slug} to={`/${game.slug}/`} className="stats-game-item">
                      <div className="stats-game-thumb">
                        {game.thumbnail && <img src={game.thumbnail} alt="" width="80" height="45" loading="lazy" />}
                      </div>
                      <span className="stats-game-title">{game.title.split(' – ')[0].trim()}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Games */}
            {stats.favGames.length > 0 && (
              <div className="stats-section">
                <h2>❤️ Favorite Games</h2>
                <div className="stats-game-list">
                  {stats.favGames.map(game => (
                    <Link key={game.slug} to={`/${game.slug}/`} className="stats-game-item">
                      <div className="stats-game-thumb">
                        {game.thumbnail && <img src={game.thumbnail} alt="" width="80" height="45" loading="lazy" />}
                      </div>
                      <span className="stats-game-title">{game.title.split(' – ')[0].trim()}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <LazyAd className="page-ad-slot" />
          </>
        )}
      </div>
    </>
  );
}
