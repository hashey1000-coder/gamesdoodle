import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Notify Advergic of SPA route change — delay 500ms so new ad divs are painted
    const t = setTimeout(() => {
      try { window.av?.google?.go_rAU?.(); } catch (e) { /* ignore */ }
    }, 500);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return null;
}
