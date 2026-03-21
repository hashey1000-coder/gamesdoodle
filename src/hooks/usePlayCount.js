import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { db } from '../firebase';

/**
 * Hook to track real-time play counts for a game.
 * Increments once per session per game (sessionStorage prevents re-counting page refreshes).
 * Returns { playCount, incrementPlay }.
 */
export function usePlayCount(slug) {
  const [playCount, setPlayCount] = useState(0);

  // Subscribe to real-time play count from Firebase
  useEffect(() => {
    if (!db) return;

    const countRef = ref(db, `playCounts/${slug}`);
    const unsubscribe = onValue(countRef, (snapshot) => {
      setPlayCount(snapshot.val() || 0);
    });

    return () => unsubscribe();
  }, [slug]);

  const incrementPlay = useCallback(() => {
    if (!db) return;

    // Only count once per session per game
    const sessionKey = `played_${slug}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, '1');
    } catch { /* ignore */ }

    const countRef = ref(db, `playCounts/${slug}`);
    runTransaction(countRef, (current) => (current || 0) + 1);
  }, [slug]);

  return { playCount, incrementPlay };
}

/**
 * Format a play count for display: 1234 → "1.2K", 1234567 → "1.2M"
 */
export function formatPlayCount(count) {
  if (!count) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
