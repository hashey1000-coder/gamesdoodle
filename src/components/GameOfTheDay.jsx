import { Link } from 'react-router-dom';
import { useGameOfTheDay } from '../hooks/useGameOfTheDay';

export default function GameOfTheDay() {
  const { game } = useGameOfTheDay();
  if (!game) return null;

  const shortTitle = game.title.split(' – ')[0].trim();

  return (
    <section className="gotd-section">
      <div className="gotd-header">
        <span className="gotd-badge">📅 Game of the Day</span>
        <span className="gotd-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
      <Link to={`/${game.slug}/`} className="gotd-card">
        <div className="gotd-thumb">
          {game.thumbnail && (
            <img src={game.thumbnail} alt={shortTitle} loading="eager" width="600" height="338" />
          )}
          <div className="gotd-overlay">
            <span className="gotd-play-btn">▶ Play Now</span>
          </div>
        </div>
        <div className="gotd-info">
          <h3 className="gotd-title">{shortTitle}</h3>
          <p className="gotd-excerpt">{game.excerpt}</p>
        </div>
      </Link>
    </section>
  );
}
