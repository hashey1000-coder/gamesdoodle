import { useCallback } from 'react';
import { usePlayQueue } from '../hooks/usePlayQueue';
import { useToast } from './Toast';

export default function PlayQueueButton({ slug, title }) {
  const { isInQueue, addToQueue, removeFromQueue } = usePlayQueue();
  const showToast = useToast();
  const inQueue = isInQueue(slug);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inQueue) {
      removeFromQueue(slug);
      showToast('Removed from Play Next queue');
    } else {
      addToQueue(slug);
      showToast('Added to Play Next queue! 📋');
    }
  }, [slug, inQueue, addToQueue, removeFromQueue, showToast]);

  return (
    <button
      className={`action-btn queue-btn${inQueue ? ' active' : ''}`}
      onClick={handleClick}
      title={inQueue ? 'Remove from Play Next' : 'Add to Play Next'}
    >
      {inQueue ? '✓ Queued' : '📋 Play Next'}
    </button>
  );
}
