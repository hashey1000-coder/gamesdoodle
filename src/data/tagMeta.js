export const tagMeta = [
  { slug: 'arcade', name: 'Arcade', emoji: '👾' },
  { slug: 'racing', name: 'Racing', emoji: '🏎️' },
  { slug: 'shooter', name: 'Shooter', emoji: '🔫' },
  { slug: 'puzzle', name: 'Puzzle', emoji: '🧩' },
  { slug: 'sports', name: 'Sports', emoji: '⚽' },
  { slug: 'io', name: '.io Games', emoji: '🌐' },
  { slug: 'word-and-trivia', name: 'Word & Trivia', emoji: '📝' },
  { slug: 'strategy', name: 'Strategy', emoji: '♟️' },
  { slug: 'music-and-creative', name: 'Music & Creative', emoji: '🎵' },
  { slug: 'simulation', name: 'Simulation', emoji: '🎮' },
  { slug: 'card-and-board', name: 'Card & Board', emoji: '♠️' },
  { slug: 'platformer', name: 'Platformer', emoji: '🦘' },
];

export function getTagMetaBySlug(slug) {
  return tagMeta.find((tag) => tag.slug === slug);
}

export function getTagMetaForGame(game) {
  if (!game?.tags) return [];
  return game.tags.map(getTagMetaBySlug).filter(Boolean);
}

export function isNewGame(game, days = 30) {
  if (!game?.dateAdded) return !!game?.isNew;
  const added = new Date(game.dateAdded);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return added >= cutoff;
}
