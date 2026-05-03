import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
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
const AdScriptLoader = import.meta.env.PROD
  ? lazy(() => import('./components/AdSlot').then(module => ({ default: module.AdScriptLoader })))
  : () => null;
const AdSlot = import.meta.env.PROD
  ? lazy(() => import('./components/AdSlot').then(module => ({ default: module.AdSlot })))
  : () => null;

function AnalyticsLoader() {
  useEffect(() => {
    if (!import.meta.env.PROD || typeof window === 'undefined') return;
    if (window.dataLayer) return;

    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://www.googletagmanager.com';
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);

    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-LW3QVZF18T';
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-LW3QVZF18T');

    return () => {
      preconnect.remove();
      script.remove();
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
      {showAds && (
        <Suspense fallback={null}>
          <AdScriptLoader />
        </Suspense>
      )}
      <ScrollToTop />
      <div className="site-wrapper">
        <Header />
        {showAds && (
          <Suspense fallback={null}>
            <div className="global-top-ad-shell">
              <AdSlot
                key={`top-${pathname}${search}`}
                id="GD_Game_Top"
                className="global-top-ad-slot"
              />
            </div>
          </Suspense>
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
            <Suspense fallback={null}>
              <AdSlot
                key={`bottom-${pathname}${search}`}
                id="GD_Game_Bottom"
                className="global-bottom-ad-slot"
              />
            </Suspense>
          )}
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ToastProvider>
  );
}

export default App;
