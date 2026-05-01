import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const refreshAds = () => {
      try { window.av?.google?.go_rAU?.(); } catch (e) { /* ignore */ }
    };

    // Trigger once immediately, again after paint, then retry shortly after
    // route content settles so ads appear faster and more reliably on SPA nav.
    refreshAds();

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(refreshAds);
    });

    const t1 = setTimeout(refreshAds, 200);
    const t2 = setTimeout(refreshAds, 900);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, search]);

  return null;
}
