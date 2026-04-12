import { Link } from 'react-router-dom';
import { usePlayQueue } from '../hooks/usePlayQueue';
import { getGameBySlug } from '../data/games';

/**
 * Play Next Queue sidebar/panel — shows queued games with navigation.
 */
export default function PlayQueuePanel({ onClose }) {
  const { queue, removeFromQueue, clearQueue, popNext } = usePlayQueue();

  const queueGames = queue.map(slug => getGameBySlug(slug)).filter(Boolean);

  return (
    <div className="queue-panel-overlay" onClick={onClose}>
      <div className="queue-panel" onClick={e => e.stopPropagation()}>
        <div className="queue-panel-header">
          <h3>📋 Play Next ({queueGames.length})</h3>
          <button className="queue-panel-close" onClick={onClose}>✕</button>
        </div>

        {queueGames.length === 0 ? (
          <div className="queue-panel-empty">
            <p>Your queue is empty!</p>
            <p className="queue-panel-hint">Add games by clicking the "📋 Play Next" button on any game page.</p>
          </div>
        ) : (
          <>
            <div className="queue-panel-list">
              {queueGames.map((game, i) => {
                const shortTitle = game.title.split(' – ')[0].trim();
                return (
                  <div key={game.slug} className="queue-panel-item">
                    <span className="queue-panel-num">{i + 1}</span>
                    <Link to={`/${game.slug}/`} className="queue-panel-link" onClick={onClose}>
                      <div className="queue-panel-thumb">
                        {game.thumbnail && <img src={game.thumbnail} alt={shortTitle} width="60" height="34" />}
                      </div>
                      <span className="queue-panel-title">{shortTitle}</span>
                    </Link>
                    <button
                      className="queue-panel-remove"
                      onClick={() => removeFromQueue(game.slug)}
                      aria-label="Remove from queue"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="queue-panel-actions">
              <button className="queue-panel-clear" onClick={clearQueue}>Clear All</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
