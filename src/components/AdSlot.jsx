/**
 * AdSlot — simple wrappers around Advergic ad unit divs.
 * The avads.live script has "spa": true and a MutationObserver watching
 * the body, so it automatically picks up new divs as React renders them.
 * No manual re-triggering needed.
 */

/** Named banner slot: GD_Game_Top, GD_Game_Bottom */
export function AdSlot({ id, className = '' }) {
  return <div id={id} className={`ad-unit${className ? ` ${className}` : ''}`} />;
}

/** In-content lazy repeater — place between paragraphs / sections */
export function LazyAd({ className = '' }) {
  return (
    <div className={`ad-unit${className ? ` ${className}` : ''}`}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div className="lazy" {...{ 'parent-unit': 'Incontent_Lazy' }} />
    </div>
  );
}
