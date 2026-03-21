import { useState, useEffect, useCallback } from 'react';

const STREAK_KEY = 'playStreak';

function getToday() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, lastDate: null, best: 0 };
    return JSON.parse(raw);
  } catch {
    return { current: 0, lastDate: null, best: 0 };
  }
}

function saveStreak(data) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/**
 * Hook to track consecutive-day play streaks.
 * Call `recordPlay()` whenever the user plays a game.
 * Returns { current, best, recordPlay }.
 */
export function usePlayStreak() {
  const [streak, setStreak] = useState(() => loadStreak());

  // On mount, check if streak is still valid (didn't miss a day)
  useEffect(() => {
    const data = loadStreak();
    const today = getToday();

    if (data.lastDate) {
      const last = new Date(data.lastDate);
      const now = new Date(today);
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Streak broken — reset
        const reset = { current: 0, lastDate: data.lastDate, best: data.best };
        saveStreak(reset);
        setStreak(reset);
      }
    }
  }, []);

  const recordPlay = useCallback(() => {
    const today = getToday();
    const data = loadStreak();

    if (data.lastDate === today) {
      // Already played today
      setStreak(data);
      return data;
    }

    let newCurrent;
    if (!data.lastDate) {
      newCurrent = 1;
    } else {
      const last = new Date(data.lastDate);
      const now = new Date(today);
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      newCurrent = diffDays === 1 ? data.current + 1 : 1;
    }

    const newBest = Math.max(newCurrent, data.best || 0);
    const updated = { current: newCurrent, lastDate: today, best: newBest };
    saveStreak(updated);
    setStreak(updated);
    return updated;
  }, []);

  return { current: streak.current, best: streak.best, recordPlay };
}
