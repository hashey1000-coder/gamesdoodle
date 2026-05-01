import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';

let refreshTimerIds = [];

function registerNewAdNodes() {
  try {
    const foundNewUnits = window.av?.google?.go_sSN?.();
    if (foundNewUnits) window.av?.auction?.requestBids?.();
  } catch (e) { /* ignore */ }
}

export function scheduleAdRefresh() {
  if (typeof window === 'undefined') return;

  refreshTimerIds.forEach(id => clearTimeout(id));
  refreshTimerIds = [];

  registerNewAdNodes();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(registerNewAdNodes);
  });

  refreshTimerIds = [250, 900, 2200].map(delay => setTimeout(registerNewAdNodes, delay));
}

export function hasRewardedGameAd() {
  if (typeof window === 'undefined') return false;
  try { return Boolean(window.av?.visitor?.vi_c?.('rewarded')); } catch { return false; }
}

export function requestGameRewardAd() {
  if (typeof window === 'undefined') return false;

  try {
    if (hasRewardedGameAd()) return false;
    if (!window.av?.gr?.gr_rP) return false;

    window.av.gr.gr_rP();
    return true;
  } catch {
    return false;
  }
}

function useClientAdLifecycle() {
  const { pathname, search } = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return { mounted, routeKey: `${pathname}${search}` };
}

/**
 * AdSlot — simple wrappers around Advergic ad unit divs.
 * The avads.live script has "spa": true and a MutationObserver watching
 * the body, so it automatically picks up new divs as React renders them.
 * No manual re-triggering needed.
 */

/** Named banner slot — exactly as per guide: <div id="GD_Game_Top"></div> */
export function AdSlot({ id, className = '' }) {
  const { mounted, routeKey } = useClientAdLifecycle();

  if (!mounted) return null;

  return <div key={`${id}-${routeKey}`} id={id} className={className} />;
}

/** In-content lazy repeater: <div class="lazy" parent-unit="GD_Game_Bottom"></div> */
export function LazyAd({ className = '', parentUnit = 'GD_Game_Bottom' }) {
  const instanceId = useId().replace(/:/g, '');
  const { mounted, routeKey } = useClientAdLifecycle();

  if (!mounted) return null;

  // eslint-disable-next-line react/no-unknown-property
  return (
    <div
      key={`${parentUnit}-${instanceId}-${routeKey}`}
      className={['lazy', className].filter(Boolean).join(' ')}
      {...{ 'parent-unit': parentUnit }}
    />
  );
}
