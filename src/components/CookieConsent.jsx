import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show in browser, not during SSR
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-inner">
        <p className="cookie-text">
          We use cookies to improve your experience and serve personalised ads.
          By continuing, you agree to our <Link to="/privacy-policy/">Privacy Policy</Link>.
        </p>
        <div className="cookie-actions">
          <button className="cookie-btn cookie-accept" onClick={accept}>Accept All</button>
          <button className="cookie-btn cookie-decline" onClick={decline}>Decline</button>
        </div>
      </div>
    </div>
  );
}
