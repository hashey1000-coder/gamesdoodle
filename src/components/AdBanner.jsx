import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const containerRef = useRef(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const container = containerRef.current;

    // Script 1: atOptions config
    const s1 = document.createElement('script');
    s1.text = `
      atOptions = {
        'key' : '8da1dfffd9bae34b245bf6bb08476e8c',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    container.appendChild(s1);

    // Script 2: invoke.js — ad iframe renders right here
    const s2 = document.createElement('script');
    s2.src = 'https://bigotliquidate.com/8da1dfffd9bae34b245bf6bb08476e8c/invoke.js';
    container.appendChild(s2);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0',
        minHeight: '114px',
        textAlign: 'center',
      }}
    />
  );
}
