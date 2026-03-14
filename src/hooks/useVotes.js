import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { db } from '../firebase';

/**
 * Hook to manage thumbs-up / thumbs-down votes for a game.
 * Votes are persisted in Firebase Realtime Database and
 * the user's choice is stored in localStorage to prevent double-voting.
 */
export function useVotes(slug) {
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null

  // Read the user's previous vote from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`vote_${slug}`);
      if (stored === 'up' || stored === 'down') {
        setUserVote(stored);
      }
    } catch { /* ignore */ }
  }, [slug]);

  // Subscribe to real-time vote counts from Firebase
  useEffect(() => {
    if (!db) return;

    const votesRef = ref(db, `votes/${slug}`);
    const unsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      setVotes({
        up: data?.up || 0,
        down: data?.down || 0,
      });
    });

    return () => unsubscribe();
  }, [slug]);

  const castVote = useCallback((type) => {
    if (!db) return;

    const prev = userVote;
    // If clicking the same vote again, undo it
    if (prev === type) {
      // Remove vote
      const voteRef = ref(db, `votes/${slug}/${type}`);
      runTransaction(voteRef, (current) => Math.max((current || 0) - 1, 0));
      setUserVote(null);
      try { localStorage.removeItem(`vote_${slug}`); } catch { /* ignore */ }
      return;
    }

    // If switching vote, undo previous first
    if (prev) {
      const prevRef = ref(db, `votes/${slug}/${prev}`);
      runTransaction(prevRef, (current) => Math.max((current || 0) - 1, 0));
    }

    // Apply new vote
    const newRef = ref(db, `votes/${slug}/${type}`);
    runTransaction(newRef, (current) => (current || 0) + 1);
    setUserVote(type);
    try { localStorage.setItem(`vote_${slug}`, type); } catch { /* ignore */ }
  }, [slug, userVote]);

  return { votes, userVote, castVote };
}
