import { useEffect, useRef, useState } from 'react';

export default function AdBanner() {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;

    // atOptions config
    window.atOptions = {
      'key': '8da1dfffd9bae34b245bf6bb08476e8c',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {},
    };

    // invoke.js uses document.write() to inject the iframe.
    // Intercept it so the output lands in our container.
    // Use appendChild instead of innerHTML+= to avoid destroying the script node.
    const originalWrite = document.write.bind(document);
    document.write = (html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      while (tmp.firstChild) container.appendChild(tmp.firstChild);
    };

    // Append to <head> (not container) so innerHTML changes don't re-serialize it.
    const s = document.createElement('script');
    s.src = 'https://bigotliquidate.com/8da1dfffd9bae34b245bf6bb08476e8c/invoke.js';
    s.onload = () => { document.write = originalWrite; };
    s.onerror = () => { document.write = originalWrite; };
    document.head.appendChild(s);

    return () => {
      document.write = originalWrite;
      if (document.head.contains(s)) document.head.removeChild(s);
    };
  }, [mounted]);

  if (!mounted) return null;

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
