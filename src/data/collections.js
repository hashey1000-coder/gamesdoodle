/**
 * Curated game collections — themed game lists for discovery and engagement.
 * Each collection has a slug, title, description, emoji, and list of game slugs.
 */
export const collections = [
  {
    slug: 'chill-games',
    title: 'Chill Games',
    emoji: '😌',
    description: 'Relax and unwind with these low-stress, easy-going games perfect for a chill session.',
    gameSlugs: [
      'google-solitaire', 'flip-a-coin', 'google-dreidel', 'doodle-baseball',
      'mbira-google-doodle', 'google-earth-day-quiz', 'fischinger-google-doodle',
      'oskar-fischinger', 'google-snake', 'rock-paper-scissors',
      'google-tic-tac-toe', 'google-spinner', 'roll-a-die',
    ],
  },
  {
    slug: 'brain-teasers',
    title: 'Brain Teasers',
    emoji: '🧠',
    description: 'Put your mind to the test with puzzles, word games, and logic challenges.',
    gameSlugs: [
      'google-minesweeper', 'quick-draw', 'google-feud', 'wordle',
      'connections-game', 'memory-game', '2048', 'chess',
      'rubiks-cube', 'crossword-puzzle', 'sudoku', 'google-tic-tac-toe',
    ],
  },
  {
    slug: 'action-packed',
    title: 'Action Packed',
    emoji: '💥',
    description: 'High-octane games that test your reflexes and keep your heart pumping.',
    gameSlugs: [
      'dinosaur-game', 'vex-5', 'vex-6', 'bullet-force',
      'temple-of-boom', 'rooftop-snipers', 'stick-defenders',
      'dreadhead-parkour', 'iron-snout', 'n-gon',
    ],
  },
  {
    slug: 'multiplayer-fun',
    title: 'Play With Friends',
    emoji: '👥',
    description: 'Games you can play with friends, either locally or online.',
    gameSlugs: [
      'great-ghoul-duel', 'google-cricket', 'slitherio',
      '2v2-io', '4x4-soccer', 'soccer-skills-world-cup',
      'basket-random-pro', 'agario-sigmally', 'rooftop-snipers',
      'powerline', 'bullet-force',
    ],
  },
  {
    slug: 'retro-classics',
    title: 'Retro Classics',
    emoji: '👾',
    description: 'Throwback games that bring pure nostalgic arcade vibes.',
    gameSlugs: [
      'google-pacman', 'dinosaur-game', 'google-snake', 'google-solitaire',
      'google-minesweeper', 'tetris', 'chess', 'doodle-baseball',
      'google-cricket', '3d-championship-golf',
    ],
  },
  {
    slug: 'speed-runs',
    title: 'Speed Runs',
    emoji: '⚡',
    description: 'Fast-paced games perfect for quick breaks and speed challenges.',
    gameSlugs: [
      'dinosaur-game', 'dreadhead-parkour', 'vex-5', 'vex-6',
      'eggy-car', 'crazy-cars', 'top-speed-3d', 'city-car-driving',
      'madalin-stunt-cars-2',
    ],
  },
  {
    slug: 'hidden-gems',
    title: 'Hidden Gems',
    emoji: '💎',
    description: 'Underrated games you probably haven\'t tried yet. Give them a chance!',
    gameSlugs: [
      'fischinger-google-doodle', 'oskar-fischinger', 'mbira-google-doodle',
      'a-little-to-the-left', 'adventures-with-anxiety', 'acid-factory',
      'a-dance-of-fire-and-ice', 'brain-test', 'bob-the-robber',
    ],
  },
  {
    slug: 'google-doodle-best',
    title: 'Best Google Doodles',
    emoji: '🎨',
    description: 'The greatest interactive Google Doodle games ever created.',
    gameSlugs: [
      'google-pacman', 'great-ghoul-duel', 'dinosaur-game', 'google-cricket',
      'quick-draw', 'doodle-baseball', 'google-snake', 'fischinger-google-doodle',
      'mbira-google-doodle', 'google-earth-day-quiz',
    ],
  },
];

export function getCollectionBySlug(slug) {
  return collections.find(c => c.slug === slug);
}
