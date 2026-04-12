import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { db } from '../firebase';

const REACTIONS = [
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'love', emoji: '🥰', label: 'Love it' },
  { key: 'laugh', emoji: '😂', label: 'Funny' },
  { key: 'skull', emoji: '💀', label: 'Hard' },
  { key: 'trophy', emoji: '🏆', label: 'Best' },
];

/**
 * Hook to manage emoji reactions for a game.
 * Reactions stored in Firebase at reactions/{slug}/{reactionKey}
 * User's reaction stored in localStorage to prevent duplicates.
 */
export function useReactions(slug) {
  const [counts, setCounts] = useState({});
  const [userReaction, setUserReaction] = useState(null);

  // Load user's previous reaction
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reaction_${slug}`);
      if (stored) setUserReaction(stored);
    } catch { /* ignore */ }
  }, [slug]);

  // Subscribe to real-time reaction counts
  useEffect(() => {
    if (!db) return;
    const reactionsRef = ref(db, `reactions/${slug}`);
    const unsubscribe = onValue(reactionsRef, (snapshot) => {
      setCounts(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, [slug]);

  const react = useCallback((reactionKey) => {
    if (!db) return;
    const prev = userReaction;

    if (prev === reactionKey) {
      // Undo reaction
      const rRef = ref(db, `reactions/${slug}/${reactionKey}`);
      runTransaction(rRef, (current) => Math.max((current || 0) - 1, 0));
      setUserReaction(null);
      try { localStorage.removeItem(`reaction_${slug}`); } catch { /* ignore */ }
      return;
    }

    // Remove previous reaction
    if (prev) {
      const prevRef = ref(db, `reactions/${slug}/${prev}`);
      runTransaction(prevRef, (current) => Math.max((current || 0) - 1, 0));
    }

    // Apply new reaction
    const newRef = ref(db, `reactions/${slug}/${reactionKey}`);
    runTransaction(newRef, (current) => (current || 0) + 1);
    setUserReaction(reactionKey);
    try { localStorage.setItem(`reaction_${slug}`, reactionKey); } catch { /* ignore */ }
  }, [slug, userReaction]);

  return { counts, userReaction, react, REACTIONS };
}

export { REACTIONS };
