import { useState, useCallback } from 'react';

const ACHIEVEMENTS_KEY = 'achievements';
const isServer = typeof window === 'undefined';

/**
 * Achievement definitions.
 * Each has: id, title, description, emoji, condition(stats) => boolean
 */
const ACHIEVEMENT_DEFS = [
  // Play milestones
  { id: 'first_play', title: 'First Steps', description: 'Play your first game', emoji: '👶', check: s => s.totalPlays >= 1 },
  { id: 'play_10', title: 'Getting Started', description: 'Play 10 different games', emoji: '🎮', check: s => s.uniqueGamesPlayed >= 10 },
  { id: 'play_25', title: 'Game Explorer', description: 'Play 25 different games', emoji: '🗺️', check: s => s.uniqueGamesPlayed >= 25 },
  { id: 'play_50', title: 'Adventurer', description: 'Play 50 different games', emoji: '⚔️', check: s => s.uniqueGamesPlayed >= 50 },
  { id: 'play_100', title: 'Centurion', description: 'Play 100 different games', emoji: '💯', check: s => s.uniqueGamesPlayed >= 100 },
  { id: 'play_200', title: 'Game Master', description: 'Play 200 different games', emoji: '👑', check: s => s.uniqueGamesPlayed >= 200 },

  // Streak milestones
  { id: 'streak_3', title: 'Warming Up', description: 'Get a 3-day play streak', emoji: '🔥', check: s => s.bestStreak >= 3 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Get a 7-day play streak', emoji: '⚡', check: s => s.bestStreak >= 7 },
  { id: 'streak_14', title: 'Unstoppable', description: 'Get a 14-day play streak', emoji: '🌟', check: s => s.bestStreak >= 14 },
  { id: 'streak_30', title: 'Legendary', description: 'Get a 30-day play streak', emoji: '🏆', check: s => s.bestStreak >= 30 },

  // Favorites milestones
  { id: 'fav_1', title: 'Bookmark It', description: 'Favorite your first game', emoji: '❤️', check: s => s.totalFavorites >= 1 },
  { id: 'fav_5', title: 'Collector', description: 'Favorite 5 games', emoji: '💎', check: s => s.totalFavorites >= 5 },
  { id: 'fav_20', title: 'Curator', description: 'Favorite 20 games', emoji: '🎯', check: s => s.totalFavorites >= 20 },

  // Vote milestones
  { id: 'vote_1', title: 'Voice Heard', description: 'Vote on your first game', emoji: '🗳️', check: s => s.totalVotes >= 1 },
  { id: 'vote_10', title: 'Critic', description: 'Vote on 10 games', emoji: '📊', check: s => s.totalVotes >= 10 },
  { id: 'vote_50', title: 'Influencer', description: 'Vote on 50 games', emoji: '📢', check: s => s.totalVotes >= 50 },

  // Category explorer
  { id: 'cat_all', title: 'Genre Hopper', description: 'Play a game from every category', emoji: '🌈', check: s => s.categoriesPlayed >= 4 },

  // Game of the Day
  { id: 'gotd_1', title: 'Daily Doodler', description: 'Play the Game of the Day', emoji: '📅', check: s => s.gotdPlays >= 1 },
  { id: 'gotd_7', title: 'Dedicated', description: 'Play Game of the Day 7 times', emoji: '🗓️', check: s => s.gotdPlays >= 7 },

  // Night Owl / Early Bird
  { id: 'night_owl', title: 'Night Owl', description: 'Play a game after midnight', emoji: '🦉', check: s => s.nightOwl },
  { id: 'early_bird', title: 'Early Bird', description: 'Play a game before 7 AM', emoji: '🐦', check: s => s.earlyBird },

  // Queue master
  { id: 'queue_3', title: 'Planner', description: 'Add 3 games to your Play Next queue', emoji: '📋', check: s => s.queueAdds >= 3 },
];

function loadAchievements() {
  if (isServer) return { unlocked: {}, stats: {} };
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return { unlocked: {}, stats: {} };
    return JSON.parse(raw);
  } catch {
    return { unlocked: {}, stats: {} };
  }
}

function saveAchievements(data) {
  if (isServer) return;
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/**
 * Gather stats from various localStorage sources
 */
function gatherStats() {
  if (isServer) return {};
  try {
    const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    const uniqueGamesPlayed = recentlyPlayed.length;

    const streakData = JSON.parse(localStorage.getItem('playStreak') || '{}');
    const bestStreak = streakData.best || 0;

    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    const totalFavorites = favorites.length;

    let totalVotes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vote_')) totalVotes++;
    }

    const hour = new Date().getHours();
    const saved = loadAchievements().stats || {};

    return {
      totalPlays: uniqueGamesPlayed,
      uniqueGamesPlayed,
      bestStreak,
      totalFavorites,
      totalVotes,
      categoriesPlayed: saved.categoriesPlayed || 0,
      nightOwl: saved.nightOwl || (hour >= 0 && hour < 5),
      earlyBird: saved.earlyBird || (hour >= 5 && hour < 7),
      gotdPlays: saved.gotdPlays || 0,
      queueAdds: saved.queueAdds || 0,
    };
  } catch {
    return {};
  }
}

export function useAchievements() {
  const [data, setData] = useState(() => loadAchievements());

  const checkAndUnlock = useCallback(() => {
    if (isServer) return [];
    const current = loadAchievements();
    const stats = gatherStats();
    const newUnlocks = [];

    // Merge persistent stats that shouldn't be overwritten
    stats.nightOwl = stats.nightOwl || current.stats?.nightOwl || false;
    stats.earlyBird = stats.earlyBird || current.stats?.earlyBird || false;
    stats.gotdPlays = Math.max(current.stats?.gotdPlays || 0, stats.gotdPlays || 0);
    stats.queueAdds = Math.max(current.stats?.queueAdds || 0, stats.queueAdds || 0);
    stats.categoriesPlayed = Math.max(current.stats?.categoriesPlayed || 0, stats.categoriesPlayed || 0);

    for (const def of ACHIEVEMENT_DEFS) {
      if (!current.unlocked[def.id] && def.check(stats)) {
        current.unlocked[def.id] = Date.now();
        newUnlocks.push(def);
      }
    }

    current.stats = stats;
    saveAchievements(current);
    setData({ ...current });
    return newUnlocks;
  }, []);

  const incrementStat = useCallback((key, amount = 1) => {
    const current = loadAchievements();
    current.stats = current.stats || {};
    current.stats[key] = (current.stats[key] || 0) + amount;
    saveAchievements(current);
    setData({ ...current });
  }, []);

  const setStat = useCallback((key, value) => {
    const current = loadAchievements();
    current.stats = current.stats || {};
    current.stats[key] = value;
    saveAchievements(current);
    setData({ ...current });
  }, []);

  const getUnlockedCount = useCallback(() => {
    return Object.keys(data.unlocked || {}).length;
  }, [data.unlocked]);

  return {
    unlocked: data.unlocked || {},
    stats: data.stats || {},
    definitions: ACHIEVEMENT_DEFS,
    checkAndUnlock,
    incrementStat,
    setStat,
    getUnlockedCount,
    totalAchievements: ACHIEVEMENT_DEFS.length,
  };
}

export { ACHIEVEMENT_DEFS };
