import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { games } from '../data/games';

// Group games by first letter at module level (computed once)
const sortedGames = [...games].sort((a, b) =>
  a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })
);

const grouped = {};
const letters = [];

sortedGames.forEach(game => {
  const firstChar = game.title.charAt(0).toUpperCase();
  const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
  if (!grouped[letter]) {
    grouped[letter] = [];
    letters.push(letter);
  }
  grouped[letter].push(game);
});

export default function AllGamesPage() {
  return (
    <>
      <SEO
        title="All Games A–Z – Browse 400+ Free Online Games | Games Doodle"
        description="Browse every game on Games Doodle alphabetically. Find Google Doodle games, online games, Easter eggs, and more — all free to play in your browser."
        canonical="/all-games/"
        ogType="article"
        schemaType="category"
        schemaData={{
          slug: 'all-games',
          categoryName: 'All Games A–Z',
        }}
      />
      <div className="page-content">
        <h1 className="page-title">All Games A–Z</h1>
        <p className="category-description">
          Browse all {games.length} games on Games Doodle. Click a letter to jump to that section.
        </p>

        {/* Letter jump nav */}
        <nav className="az-letter-nav" aria-label="Jump to letter">
          {letters.map(letter => (
            <a key={letter} href={`#letter-${letter}`} className="az-letter-link">
              {letter}
            </a>
          ))}
        </nav>

        {/* Game listings by letter */}
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`} className="az-section">
            <h2 className="az-section-heading">{letter}</h2>
            <ul className="az-game-list">
              {grouped[letter].map(game => (
                <li key={game.slug} className="az-game-item">
                  <Link to={`/${game.slug}/`} className="az-game-link">
                    <img
                      src={`/images/${game.slug}.webp`}
                      alt={game.title}
                      className="az-game-thumb"
                      loading="lazy"
                      decoding="async"
                      width="48"
                      height="27"
                    />
                    <span className="az-game-title">{game.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="az-footer-text">
          Can't find what you're looking for? Try the <Link to="/">homepage</Link> or browse by{' '}
          <Link to="/online-games/">category</Link>.
        </p>
      </div>
    </>
  );
}
