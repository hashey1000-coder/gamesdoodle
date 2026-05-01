import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';

let refreshTimerIds = [];

function runAdRefresh() {
  try {
    const foundNewUnits = window.av?.google?.go_sSN?.();
    if (foundNewUnits) window.av?.auction?.requestBids?.();
    window.av?.google?.go_rAU?.();
  } catch (e) { /* ignore */ }
}

export function scheduleAdRefresh() {
  if (typeof window === 'undefined') return;

  refreshTimerIds.forEach(id => clearTimeout(id));
  refreshTimerIds = [];

  runAdRefresh();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(runAdRefresh);
  });

  refreshTimerIds = [150, 500, 1200, 2500, 5000].map(delay => setTimeout(runAdRefresh, delay));
}

function useClientAdLifecycle() {
  const { pathname, search } = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) scheduleAdRefresh();
  }, [mounted, pathname, search]);

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
