import { useState } from 'react';

/**
 * Collapsible "How to Play" section for game pages.
 * Renders a toggle that reveals step-by-step instructions.
 */
export default function HowToPlay({ game }) {
  const [open, setOpen] = useState(false);

  // Extract how-to-play from game content if it has an H2 with "How to Play"
  // Otherwise use game.howToPlay if provided
  const howToPlay = game.howToPlay || extractHowToPlay(game.content);

  if (!howToPlay) return null;

  return (
    <div className="how-to-play">
      <button
        className={`how-to-play-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="how-to-play-icon">🕹️</span>
        <span>How to Play {game.title.split(' – ')[0].trim()}</span>
        <span className={`how-to-play-arrow${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <div
          className="how-to-play-content"
          dangerouslySetInnerHTML={{ __html: howToPlay }}
        />
      )}
    </div>
  );
}

/**
 * Extracts the "How to Play" section from game HTML content.
 * Looks for an H2 containing "how to play" and grabs all content
 * until the next H2 or end of content.
 */
function extractHowToPlay(content) {
  if (!content) return null;

  // Find the H2 that contains "how to play" (case insensitive)
  const h2Regex = /<h2[^>]*>([^<]*how\s+to\s+play[^<]*)<\/h2>/i;
  const match = content.match(h2Regex);
  if (!match) return null;

  // Get everything after this H2 until the next H2 or end
  const startIdx = match.index + match[0].length;
  const restContent = content.slice(startIdx);
  const nextH2 = restContent.match(/<h2[^>]*>/i);
  const sectionContent = nextH2
    ? restContent.slice(0, nextH2.index)
    : restContent;

  return sectionContent.trim() || null;
}
