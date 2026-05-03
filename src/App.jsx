import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import { AdScriptLoader, AdSlot } from './components/AdSlot';
import './App.css';

const GamePage = lazy(() => import('./pages/GamePage'));
const TagPage = lazy(() => import('./pages/TagPage'));
const TopGamesPage = lazy(() => import('./pages/TopGamesPage'));
const NewGamesPage = lazy(() => import('./pages/NewGamesPage'));
const AllGamesPage = lazy(() => import('./pages/AllGamesPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const CollectionsIndex = lazy(() => import('./pages/CollectionsPage').then(module => ({ default: module.CollectionsIndex })));
const CollectionDetail = lazy(() => import('./pages/CollectionsPage').then(module => ({ default: module.CollectionDetail })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function runAfterCriticalWindow(callback) {
  if (typeof window === 'undefined') return () => {};

  let timerId;
  let idleId;
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timerId);
    if (idleId) window.cancelIdleCallback?.(idleId);
    callback();
  };

  const queue = () => {
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(run, { timeout: 12000 });
    }
    timerId = window.setTimeout(run, 12000);
  };

  if (document.readyState === 'complete') {
    queue();
  } else {
    window.addEventListener('load', queue, { once: true });
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach(eventName => {
    window.addEventListener(eventName, run, { once: true, passive: true });
  });

  return () => {
    done = true;
    window.clearTimeout(timerId);
    if (idleId) window.cancelIdleCallback?.(idleId);
    window.removeEventListener('load', queue);
    ['pointerdown', 'keydown', 'touchstart'].forEach(eventName => {
      window.removeEventListener(eventName, run);
    });
  };
}

function AnalyticsLoader() {
  useEffect(() => {
    if (!import.meta.env.PROD || typeof window === 'undefined') return;
    if (window.dataLayer) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };

    let script;
    const cleanup = runAfterCriticalWindow(() => {
      script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-LW3QVZF18T';
      script.async = true;
      document.head.appendChild(script);

      window.gtag('js', new Date());
      window.gtag('config', 'G-LW3QVZF18T', { send_page_view: true });
    });

    return () => {
      cleanup();
      script?.remove();
    };
  }, []);

  return null;
}

function TagRoute() {
  const { tagSlug } = useParams();
  return <TagPage slug={tagSlug} />;
}

function App() {
  const { pathname, search } = useLocation();
  const showAds = import.meta.env.PROD;

  return (
    <ToastProvider>
      <AnalyticsLoader />
      {showAds && <AdScriptLoader />}
      <ScrollToTop />
      <div className="site-wrapper">
        <Header />
        {showAds && (
          <div className="global-top-ad-shell" aria-hidden="true">
            <AdSlot
              key={`top-${pathname}${search}`}
              id="GD_Game_Top"
              className="global-top-ad-slot"
            />
          </div>
        )}
        <main className="site-main">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/top-games" element={<TopGamesPage />} />
              <Route path="/new-games" element={<NewGamesPage />} />
              <Route path="/all-games" element={<AllGamesPage />} />
              <Route path="/my-stats" element={<StatsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/collections" element={<CollectionsIndex />} />
              <Route path="/collections/:collectionSlug" element={<CollectionDetail />} />
              <Route path="/tag/:tagSlug" element={<TagRoute />} />
              <Route path="/:slug" element={<GamePage />} />
              <Route path="/:slug/page/:page" element={<GamePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          {showAds && (
            <AdSlot
              key={`bottom-${pathname}${search}`}
              id="GD_Game_Bottom"
              className="global-bottom-ad-slot"
            />
          )}
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ToastProvider>
  );
}

export default App;
