import { useState, useEffect } from 'react';
import { useVotes } from '../hooks/useVotes';

export default function VoteButtons({ slug }) {
  const { votes, userVote, castVote } = useVotes(slug);
  const [ready, setReady] = useState(false);

  // Fade in once hydrated on client
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const total = votes.up + votes.down;
  const pct = total > 0 ? Math.round((votes.up / total) * 100) : 0;

  return (
    <div className={`vote-section${ready ? ' visible' : ''}`}>
      <span className="vote-label">Rate this game:</span>
      <button
        className={`vote-btn vote-up${userVote === 'up' ? ' active' : ''}`}
        onClick={() => castVote('up')}
        aria-label="Thumbs up"
      >
        👍 {votes.up > 0 && <span className="vote-count">{votes.up}</span>}
      </button>
      <button
        className={`vote-btn vote-down${userVote === 'down' ? ' active' : ''}`}
        onClick={() => castVote('down')}
        aria-label="Thumbs down"
      >
        👎 {votes.down > 0 && <span className="vote-count">{votes.down}</span>}
      </button>
      {total > 0 && (
        <div className="vote-bar-area">
          <div className="vote-bar">
            <div className="vote-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="vote-pct">{pct}%</span>
        </div>
      )}
    </div>
  );
}
