import { useEffect, useId } from 'react';
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
    script.setAttribute('data-advergic', 'true');
    script.addEventListener('load', () => resolve(true), { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
    document.head.appendChild(script);
  });

  return adScriptPromise;
}

export function AdScriptLoader() {
  if (!ADS_ENABLED) return null;

  useEffect(() => {
    const load = () => {
      loadAdScript().then((loaded) => {
        if (loaded) scheduleAdRefresh();
      });
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 1600 });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timer = setTimeout(load, 1200);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

function registerNewAdNodes() {
  try {
    const foundNewUnits = window.av?.google?.go_sSN?.();
    if (foundNewUnits) window.av?.auction?.requestBids?.();
  } catch (e) { /* ignore */ }
}

function refreshPrimaryAdSlots() {
  try {
    if (document.getElementById('GD_Game_Top') || document.getElementById('GD_Game_Bottom')) {
      window.av?.google?.go_rAU?.();
    }
  } catch (e) { /* ignore */ }
}

export function scheduleAdRefresh() {
  if (!ADS_ENABLED) return;
  if (typeof window === 'undefined') return;

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
export function AdSlot({ id, className = '' }) {
  if (!ADS_ENABLED) return null;
  const routeKey = useAdRouteKey();

  return <div key={`${id}-${routeKey}`} id={id} className={className} />;
}

/** In-content lazy repeater: <div class="lazy" parent-unit="GD_Game_Bottom"></div> */
export function LazyAd({ className = '', parentUnit = 'GD_Game_Bottom' }) {
  if (!ADS_ENABLED) return null;
  const instanceId = useId().replace(/:/g, '');
  const routeKey = useAdRouteKey();

  // eslint-disable-next-line react/no-unknown-property
  return (
    <div
      key={`${parentUnit}-${instanceId}-${routeKey}`}
      className={['lazy', className].filter(Boolean).join(' ')}
      {...{ 'parent-unit': parentUnit }}
    />
  );
}
