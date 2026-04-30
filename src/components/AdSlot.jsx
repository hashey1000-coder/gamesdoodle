import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Trigger Advergic / Prebid.js to run a fresh auction for all visible ad units.
 * Called 300ms after React finishes painting new ad divs on each route change
 * (the delay ensures the DOM is fully settled before the ad script scans it).
 */
function triggerAvAds() {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    try {
      // 1. Advergic site-specific init (avads.live wrapper)
      if (typeof window.av_gamesdoodle === 'function') {
        window.av_gamesdoodle();
        return;
      }
      // 2. Standard Prebid.js queue — most Prebid wrappers expose window.pbjs
      if (window.pbjs) {
        (window.pbjs.que = window.pbjs.que || []).push(() => {
          if (typeof window.pbjs.requestBids === 'function') {
            window.pbjs.requestBids({});
          }
        });
        return;
      }
      // 3. Advergic internal Prebid instance (avpb)
      if (window.avpb) {
        (window.avpb.que = window.avpb.que || []).push(() => {
          if (typeof window.avpb.requestBids === 'function') {
            window.avpb.requestBids({});
          }
        });
        return;
      }
      // 4. Google Publisher Tag fallback
      if (window.googletag?.pubads) {
        (window.googletag.cmd = window.googletag.cmd || []).push(() => {
          window.googletag.pubads().refresh();
        });
      }
    } catch (e) { /* ignore */ }
  }, 300);
}

/** Shared hook: re-trigger ad auction on every route change */
function useAdRefresh() {
  const location = useLocation();
  useEffect(() => {
    triggerAvAds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);
}

/**
 * Named banner slot — id must match exactly what Advergic configured
 * (e.g. GD_Game_Top, GD_Game_Bottom)
 */
export function AdSlot({ id, className = '' }) {
  useAdRefresh();
  return <div id={id} className={`ad-unit${className ? ` ${className}` : ''}`} />;
}

/**
 * In-content lazy ad.
 * Uses a counter ref so the inner div gets a new React key on every navigation —
 * forcing a full DOM remount that Advergic/Prebid can detect as a fresh node.
 */
export function LazyAd({ className = '' }) {
  const location = useLocation();
  const countRef = useRef(0);
  const prevPath = useRef(location.pathname);
  if (prevPath.current !== location.pathname) {
    prevPath.current = location.pathname;
    countRef.current += 1;
  }

  useEffect(() => {
    triggerAvAds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return (
    <div className={`ad-unit${className ? ` ${className}` : ''}`}>
      {/* key forces full DOM remount on navigation so Advergic finds a fresh node */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div key={countRef.current} className="lazy" {...{ 'parent-unit': 'Incontent_Lazy' }} />
    </div>
  );
}
