import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'favoriteGames';
const isServer = typeof window === 'undefined';

function readFavorites() {
  if (isServer) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Load from localStorage after hydration to match SSR output (avoids hydration mismatch)
  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(readFavorites());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleFavorite = useCallback((slug) => {
    setFavorites(prev => {
      const next = prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((slug) => {
    return favorites.includes(slug);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
