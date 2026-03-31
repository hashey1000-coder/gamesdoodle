import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ADSENSE_PUB = 'ca-pub-4556514294983969';

function grantConsent() {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  });
}

function loadAdSense() {
  const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB}`;
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.setAttribute('crossorigin', 'anonymous');
  document.head.appendChild(s);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      // Returning visitor — upgrade consent immediately (GA4 already loaded)
      grantConsent();
      loadAdSense();
      return;
    }
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // consent === 'declined' — stays at default denied
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
    grantConsent();
    loadAdSense();
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
