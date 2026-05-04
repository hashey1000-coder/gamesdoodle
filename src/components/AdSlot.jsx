/* eslint-disable react-refresh/only-export-components */
import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';

let refreshTimerIds = [];
let adScriptPromise = null;
const ADS_ENABLED = import.meta.env.PROD;

function loadAdScript() {
  if (!ADS_ENABLED) return Promise.resolve(false);
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.av) return Promise.resolve(true);
  if (adScriptPromise) return adScriptPromise;

  adScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-advergic]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://avads.live/s/av-gamesdoodle.js';
    script.async = true;
    script.fetchPriority = 'low';
    script.setAttribute('data-advergic', 'true');
    script.setAttribute('data-cfasync', 'false');
    script.addEventListener('load', () => resolve(true), { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
    document.head.appendChild(script);
  });

  return adScriptPromise;
}

function useAdsReady(delayMs = 8000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ADS_ENABLED || typeof window === 'undefined') return undefined;

    let timerId;
    let complete = false;

    const markReady = () => {
      if (complete) return;
      complete = true;
      clearTimeout(timerId);
      setReady(true);
    };

    // Keep ads out of the most critical rendering window, but don't delay them
    // so long that the site feels under-monetized to real users.
    timerId = setTimeout(markReady, delayMs);

    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(eventName => {
      window.addEventListener(eventName, markReady, { once: true, passive: true });
    });

    return () => {
      complete = true;
      clearTimeout(timerId);
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(eventName => {
        window.removeEventListener(eventName, markReady);
      });
    };
  }, [delayMs]);

  return ready;
}

export function AdScriptLoader() {
  const adsReady = useAdsReady(800);

  useEffect(() => {
    if (!ADS_ENABLED || !adsReady) return undefined;

    loadAdScript().then((loaded) => {
      if (loaded) scheduleAdRefresh();
    });

    return undefined;
  }, [adsReady]);

  return null;
}

function registerNewAdNodes() {
  try {
    const foundNewUnits = window.av?.google?.go_sSN?.();
    if (foundNewUnits) window.av?.auction?.requestBids?.();
  } catch { /* ignore */ }
}

function refreshPrimaryAdSlots() {
  try {
    if (document.getElementById('GD_Game_Top') || document.getElementById('GD_Game_Bottom')) {
      window.av?.google?.go_rAU?.();
    }
  } catch { /* ignore */ }
}

export function scheduleAdRefresh() {
  if (!ADS_ENABLED) return;
  if (typeof window === 'undefined') return;

  // The rewarded in-game flow bound to #av-reward is vendor-managed.
  // Re-registering ad nodes here can cause the rewarded overlay to be
  // rediscovered and restarted, which can create a play-loop on game pages.
  if (document.getElementById('av-reward')) return;

  refreshTimerIds.forEach(id => clearTimeout(id));
  refreshTimerIds = [];

  registerNewAdNodes();
  refreshPrimaryAdSlots();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      registerNewAdNodes();
      refreshPrimaryAdSlots();
    });
  });

  refreshTimerIds = [250, 900, 2200].map(delay => setTimeout(registerNewAdNodes, delay));
}

function useAdRouteKey() {
  const { pathname, search } = useLocation();
  return `${pathname}${search}`;
}

/**
 * AdSlot — simple wrappers around Advergic ad unit divs.
 * The avads.live script has "spa": true and a MutationObserver watching
 * the body, so it automatically picks up new divs as React renders them.
 * No manual re-triggering needed.
 */

/** Named banner slot — exactly as per guide: <div id="GD_Game_Top"></div> */
export function AdSlot({ id, className = '', reserveSpace = true, delayMs = 3500 }) {
  const routeKey = useAdRouteKey();
  const adsReady = useAdsReady(delayMs);

  if (!ADS_ENABLED) return null;

  if (!adsReady) {
    if (!reserveSpace) return null;
    return <div className={[className, 'ad-slot-placeholder'].filter(Boolean).join(' ')} aria-hidden="true" />;
  }

  return <div key={`${id}-${routeKey}`} id={id} className={className} />;
}

/** In-content lazy repeater: <div class="lazy" parent-unit="GD_Game_Bottom"></div> */
export function LazyAd({ className = '', parentUnit = 'GD_Game_Bottom', reserveSpace = true, delayMs = 3500 }) {
  const instanceId = useId().replace(/:/g, '');
  const routeKey = useAdRouteKey();
  const adsReady = useAdsReady(delayMs);

  if (!ADS_ENABLED) return null;

  if (!adsReady) {
    if (!reserveSpace) return null;
    return <div className={[className, 'ad-slot-placeholder'].filter(Boolean).join(' ')} aria-hidden="true" />;
  }

  return (
    <div
      key={`${parentUnit}-${instanceId}-${routeKey}`}
      className={['lazy', className].filter(Boolean).join(' ')}
      {...{ 'parent-unit': parentUnit }}
    />
  );
}
