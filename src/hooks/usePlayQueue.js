import { useState, useCallback, useEffect } from 'react';

const QUEUE_KEY = 'playNextQueue';
const isServer = typeof window === 'undefined';

function readQueue() {
  if (isServer) return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function usePlayQueue() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    setQueue(readQueue());
  }, []);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === QUEUE_KEY) setQueue(readQueue());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addToQueue = useCallback((slug) => {
    setQueue(prev => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromQueue = useCallback((slug) => {
    setQueue(prev => {
      const next = prev.filter(s => s !== slug);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const popNext = useCallback(() => {
    const current = readQueue();
    if (current.length === 0) return null;
    const next = current[0];
    const remaining = current.slice(1);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    setQueue(remaining);
    return next;
  }, []);

  const clearQueue = useCallback(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    setQueue([]);
  }, []);

  const isInQueue = useCallback((slug) => {
    return queue.includes(slug);
  }, [queue]);

  const reorder = useCallback((fromIndex, toIndex) => {
    setQueue(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    popNext,
    clearQueue,
    isInQueue,
    reorder,
    count: queue.length,
  };
}
