import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function triggerAvAds() {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.av_gamesdoodle === 'function') window.av_gamesdoodle();
  } catch (e) { /* ignore */ }
}

function useAdRefresh() {
  const location = useLocation();
  useEffect(() => {
    triggerAvAds();
  }, [location.pathname, location.search]);
}

// Renders a named Advergic banner slot — id must match exactly (e.g. GD_Game_Top)
export function AdSlot({ id, className = '' }) {
  useAdRefresh();
  return <div id={id} className={`ad-unit${className ? ` ${className}` : ''}`} />;
}

// Renders an Advergic in-content lazy ad
export function LazyAd({ className = '' }) {
  useAdRefresh();
  return (
    <div className={`ad-unit${className ? ` ${className}` : ''}`}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div className="lazy" {...{ 'parent-unit': 'Incontent_Lazy' }} />
    </div>
  );
}