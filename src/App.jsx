import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AdScriptLoader, AdSlot } from './components/AdSlot.jsx';
import './App.css';

const LazyGamePage = lazy(() => import('./pages/GamePage.jsx'));
const LazyTagPage = lazy(() => import('./pages/TagPage.jsx'));
const LazyTopGamesPage = lazy(() => import('./pages/TopGamesPage.jsx'));
const LazyNewGamesPage = lazy(() => import('./pages/NewGamesPage.jsx'));
const LazyAllGamesPage = lazy(() => import('./pages/AllGamesPage.jsx'));
const LazyStatsPage = lazy(() => import('./pages/StatsPage.jsx'));
const LazyFavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'));
const LazyCollectionsIndex = lazy(() => import('./pages/CollectionsPage.jsx').then(module => ({ default: module.CollectionsIndex })));
const LazyCollectionDetail = lazy(() => import('./pages/CollectionsPage.jsx').then(module => ({ default: module.CollectionDetail })));
const LazyNotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function runAfterCriticalWindow(callback) {
  if (typeof window === 'undefined') return () => {};

  let timerId;
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timerId);
    callback();
  };

  timerId = window.setTimeout(run, 30000);

  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(eventName => {
    window.addEventListener(eventName, run, { once: true, passive: true });
  });

  return () => {
    done = true;
    window.clearTimeout(timerId);
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(eventName => {
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
      script.fetchPriority = 'low';
      script.setAttribute('data-cfasync', 'false');
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

function TagRoute({ Component }) {
  const { tagSlug } = useParams();
  return <Component slug={tagSlug} />;
}

function LegacyGameRoute() {
  const { slug } = useParams();
  const legacySlugMap = {
    'google-doodle-baseball': 'doodle-baseball',
  };

  return <Navigate to={`/${legacySlugMap[slug] || slug}/`} replace />;
}

function App({ ssrPages = null }) {
  const { pathname, search } = useLocation();
  const showAds = import.meta.env.PROD;
  const showTopAd = showAds && pathname !== '/';
  const GamePage = ssrPages?.GamePage || LazyGamePage;
  const TagPage = ssrPages?.TagPage || LazyTagPage;
  const TopGamesPage = ssrPages?.TopGamesPage || LazyTopGamesPage;
  const NewGamesPage = ssrPages?.NewGamesPage || LazyNewGamesPage;
  const AllGamesPage = ssrPages?.AllGamesPage || LazyAllGamesPage;
  const StatsPage = ssrPages?.StatsPage || LazyStatsPage;
  const FavoritesPage = ssrPages?.FavoritesPage || LazyFavoritesPage;
  const CollectionsIndex = ssrPages?.CollectionsIndex || LazyCollectionsIndex;
  const CollectionDetail = ssrPages?.CollectionDetail || LazyCollectionDetail;
  const NotFoundPage = ssrPages?.NotFoundPage || LazyNotFoundPage;
  const routes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<Navigate to="/about-us/" replace />} />
      <Route path="/contact" element={<Navigate to="/contact-us/" replace />} />
      <Route path="/games" element={<Navigate to="/online-games/" replace />} />
      <Route path="/doodle-games" element={<Navigate to="/google-doodle-games/" replace />} />
      <Route path="/game/:slug" element={<LegacyGameRoute />} />
      <Route path="/top-games" element={<TopGamesPage />} />
      <Route path="/new-games" element={<NewGamesPage />} />
      <Route path="/all-games" element={<AllGamesPage />} />
      <Route path="/my-stats" element={<StatsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/collections" element={<CollectionsIndex />} />
      <Route path="/collections/:collectionSlug" element={<CollectionDetail />} />
      <Route path="/tag/:tagSlug" element={<TagRoute Component={TagPage} />} />
      <Route path="/:slug" element={<GamePage />} />
      <Route path="/:slug/page/:page" element={<GamePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );

  return (
    <ToastProvider>
      <AnalyticsLoader />
      {showAds && <AdScriptLoader />}
      <ScrollToTop />
      <div className="site-wrapper">
        <Header />
        {showTopAd && (
          <div className="global-top-ad-shell" aria-hidden="true">
            <AdSlot
              key={`top-${pathname}${search}`}
              id="GD_Game_Top"
              className="global-top-ad-slot"
              reserveSpace={false}
              delayMs={0}
            />
          </div>
        )}
        <main className="site-main">
          {import.meta.env.SSR ? routes : <Suspense fallback={null}>{routes}</Suspense>}
          {showAds && (
            <AdSlot
              key={`bottom-${pathname}${search}`}
              id="GD_Game_Bottom"
              className="global-bottom-ad-slot"
              delayMs={3500}
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
