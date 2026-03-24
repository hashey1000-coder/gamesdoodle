import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GA_ID = 'G-LW3QVZF18T';
const ADSENSE_PUB = 'ca-pub-4556514294983969';

function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function loadTrackingScripts() {
  // Google Analytics
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`).then(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  });

  // Google AdSense
  loadScript(
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB}`,
    { crossorigin: 'anonymous' }
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      // Returning visitor who already accepted — load scripts immediately
      loadTrackingScripts();
      return;
    }
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // consent === 'declined' — do nothing
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
    loadTrackingScripts();
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
