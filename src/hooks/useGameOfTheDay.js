import { games } from '../data/games';

/**
 * Deterministic Game of the Day based on date.
 * Same game shows for all users on the same calendar day.
 * Uses a simple hash of the date string to pick from the games array.
 */
function hashDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGameOfTheDay() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const index = hashDate(today) % games.length;
  return { game: games[index], date: today };
}

export function useGameOfTheDay() {
  return getGameOfTheDay();
}
