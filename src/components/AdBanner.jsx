import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const containerRef = useRef(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const container = containerRef.current;

    // 1. Config script
    const config = document.createElement('script');
    config.textContent = `
      atOptions = {
        'key' : '8da1dfffd9bae34b245bf6bb08476e8c',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    container.appendChild(config);

    // 2. Invoke script
    const invoke = document.createElement('script');
    invoke.src = 'https://bigotliquidate.com/8da1dfffd9bae34b245bf6bb08476e8c/invoke.js';
    container.appendChild(invoke);
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
