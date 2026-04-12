import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { games } from '../data/games';

/**
 * Daily Challenge — suggests a specific game + challenge goal each day.
 * Uses date hash to deterministically pick a game and challenge type.
 */
const CHALLENGE_TYPES = [
  { template: (t) => `Play ${t} and try to beat your best score!`, emoji: '🎯' },
  { template: (t) => `Can you finish ${t} without losing a single life?`, emoji: '💪' },
  { template: (t) => `Speed run! Complete ${t} as fast as you can.`, emoji: '⚡' },
  { template: (t) => `Play ${t} and share your score with a friend!`, emoji: '🤝' },
  { template: (t) => `Master ${t} — play it 3 times today!`, emoji: '🔁' },
  { template: (t) => `Explore something new: give ${t} a try!`, emoji: '🗺️' },
];

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDailyChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  const gameIndex = hashStr('challenge_game_' + today) % games.length;
  const challengeIndex = hashStr('challenge_type_' + today) % CHALLENGE_TYPES.length;
  const game = games[gameIndex];
  const challenge = CHALLENGE_TYPES[challengeIndex];
  const shortTitle = game.title.split(' – ')[0].trim();
  return {
    game,
    shortTitle,
    text: challenge.template(shortTitle),
    emoji: challenge.emoji,
    date: today,
  };
}

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const c = getDailyChallenge();
    setChallenge(c);
    try {
      const done = localStorage.getItem('dailyChallenge_' + c.date);
      if (done) setCompleted(true);
    } catch { /* ignore */ }
  }, []);

  const markCompleted = () => {
    if (!challenge) return;
    try {
      localStorage.setItem('dailyChallenge_' + challenge.date, '1');
    } catch { /* ignore */ }
    setCompleted(true);
  };

  if (!challenge) return null;

  return (
    <section className="daily-challenge-section">
      <div className="daily-challenge-header">
        <span className="daily-challenge-badge">{challenge.emoji} Daily Challenge</span>
      </div>
      <div className={`daily-challenge-card${completed ? ' completed' : ''}`}>
        <p className="daily-challenge-text">{challenge.text}</p>
        <div className="daily-challenge-actions">
          <Link to={`/${challenge.game.slug}/`} className="daily-challenge-play">
            ▶ Play {challenge.shortTitle}
          </Link>
          {!completed && (
            <button className="daily-challenge-done" onClick={markCompleted}>
              ✓ Mark Done
            </button>
          )}
          {completed && (
            <span className="daily-challenge-completed">✅ Completed!</span>
          )}
        </div>
      </div>
    </section>
  );
}
