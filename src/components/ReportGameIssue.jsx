import { useMemo, useState } from 'react';
import { useToast } from './Toast.jsx';

const REPORT_EMAIL = 'admin@gamesdoodle.org';
const REPORT_ENDPOINT = `https://formsubmit.co/ajax/${REPORT_EMAIL}`;

const ISSUE_OPTIONS = [
  { value: 'game-not-loading', label: 'Game is not loading' },
  { value: 'wrong-thumbnail', label: 'Wrong thumbnail' },
  { value: 'broken-controls', label: 'Controls do not work' },
  { value: 'bad-embed', label: 'Wrong or unsafe game embed' },
  { value: 'other', label: 'Something else' },
];

function getBrowserInfo() {
  if (typeof navigator === 'undefined') return 'Unknown browser';
  return navigator.userAgent || 'Unknown browser';
}

function getCurrentUrl(slug) {
  if (typeof window !== 'undefined') return window.location.href;
  return `https://gamesdoodle.org/${slug}/`;
}

export default function ReportGameIssue({ game }) {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState(ISSUE_OPTIONS[0].value);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  const shortTitle = useMemo(() => game.title.split(' – ')[0].trim(), [game.title]);

  const openEmailFallback = () => {
    const subject = encodeURIComponent(`Game report: ${shortTitle}`);
    const body = encodeURIComponent([
      `Game: ${shortTitle}`,
      `Slug: ${game.slug}`,
      `Issue: ${issueType}`,
      `URL: ${getCurrentUrl(game.slug)}`,
      `Browser: ${getBrowserInfo()}`,
      '',
      message.trim() || 'No extra details provided.',
    ].join('\n'));
    window.location.href = `mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const reportMessage = message.trim().slice(0, 1000) || 'No extra details provided.';
    const payload = {
      _subject: `Game report: ${shortTitle}`,
      _template: 'table',
      _captcha: 'false',
      source: 'Games Doodle report form',
      game: shortTitle,
      slug: game.slug,
      issue: ISSUE_OPTIONS.find(option => option.value === issueType)?.label || issueType,
      issueType,
      pageUrl: getCurrentUrl(game.slug),
      browser: getBrowserInfo(),
      message: reportMessage,
    };

    setSubmitting(true);
    try {
      const response = await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Email report failed');

      setMessage('');
      setIssueType(ISSUE_OPTIONS[0].value);
      setOpen(false);
      showToast?.('Thanks — report emailed!');
    } catch {
      openEmailFallback();
      showToast?.('Opening email fallback…', 'info');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`report-game-issue${open ? ' open' : ''}`}>
      <button
        type="button"
        className="report-game-toggle"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
      >
        🚩 Report a problem
      </button>

      {open && (
        <form className="report-game-form" onSubmit={handleSubmit}>
          <label className="report-game-label">
            What is wrong?
            <select value={issueType} onChange={(event) => setIssueType(event.target.value)}>
              {ISSUE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="report-game-label">
            Extra details <span>(optional)</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength="1000"
              rows="3"
              placeholder="Example: the game loads a blank screen, or the thumbnail shows the wrong game."
            />
          </label>
          <div className="report-game-actions">
            <button type="submit" className="report-game-submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send report'}
            </button>
            <button type="button" className="report-game-cancel" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
          <p className="report-game-note">Reports are emailed to the site owner and include this page URL plus browser info.</p>
        </form>
      )}
    </div>
  );
}
