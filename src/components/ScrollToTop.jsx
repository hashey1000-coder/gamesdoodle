import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Notify Advergic of SPA route change so it re-auctions ad units
    try {
      window.av?.google?.go_rAU?.();
    } catch (e) { /* ignore */ }
  }, [pathname, search]);

  return null;
}
