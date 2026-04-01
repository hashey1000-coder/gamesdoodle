import { useEffect, useRef } from 'react';

const AD_KEY = '8da1dfffd9bae34b245bf6bb08476e8c';
const AD_SRC = `https://bigotliquidate.com/${AD_KEY}/invoke.js`;

export default function AdBanner() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    // Set atOptions before the invoke script loads
    window.atOptions = {
      key: AD_KEY,
      format: 'iframe',
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement('script');
    script.src = AD_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up on unmount (navigation away)
      const existing = document.querySelector(`script[src="${AD_SRC}"]`);
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div
      className="ad-banner-footer"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0',
        minHeight: '114px',
      }}
    />
  );
}
