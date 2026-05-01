import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scheduleAdRefresh } from './AdSlot';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    scheduleAdRefresh();
  }, [pathname, search]);

  return null;
}
