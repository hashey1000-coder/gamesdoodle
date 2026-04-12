import { useReactions, REACTIONS } from '../hooks/useReactions';

export default function EmojiReactions({ slug }) {
  const { counts, userReaction, react } = useReactions(slug);

  return (
    <div className="emoji-reactions">
      <span className="emoji-reactions-label">How does this game make you feel?</span>
      <div className="emoji-reactions-row">
        {REACTIONS.map(r => {
          const count = counts[r.key] || 0;
          const isActive = userReaction === r.key;
          return (
            <button
              key={r.key}
              className={`emoji-reaction-btn${isActive ? ' active' : ''}`}
              onClick={() => react(r.key)}
              aria-label={r.label}
              title={r.label}
            >
              <span className="emoji-reaction-icon">{r.emoji}</span>
              {count > 0 && <span className="emoji-reaction-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
