import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function notifyAdScript() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event('resize'));
  document.dispatchEvent(new CustomEvent('gamesdoodle:ads:refresh'));
}

export function AdSlot({ id, className = '' }) {
  const location = useLocation();

  useEffect(() => {
    notifyAdScript();
  }, [location.pathname, location.search]);

  return (
    <div className={`site-ad-slot ${className}`.trim()}>
      <div id={id} />
    </div>
  );
}

export function LazyAd({ className = '' }) {
  const location = useLocation();

  useEffect(() => {
    notifyAdScript();
  }, [location.pathname, location.search]);

  return (
    <div className={`site-ad-slot site-ad-slot-lazy ${className}`.trim()}>
      <div className="lazy" parent-unit="Incontent_Lazy" />
    </div>
  );
}