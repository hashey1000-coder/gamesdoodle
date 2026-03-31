import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastProvider } from './components/Toast';

function GATracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location]);
  return null;
}
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import CookieConsent from './components/CookieConsent';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import TagPage from './pages/TagPage';
import TopGamesPage from './pages/TopGamesPage';
import NewGamesPage from './pages/NewGamesPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';
import { getTagBySlug } from './data/games';
import './App.css';

function TagRoute() {
  const { tagSlug } = useParams();
  const tag = getTagBySlug(tagSlug);
  if (!tag) return <NotFoundPage />;
  return <TagPage slug={tagSlug} />;
}

function App() {
  return (
    <ToastProvider>
      <GATracker />
      <ScrollToTop />
      <div className="site-wrapper">
        <Header />
        <main className="site-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/top-games" element={<TopGamesPage />} />
            <Route path="/new-games" element={<NewGamesPage />} />
            <Route path="/tag/:tagSlug" element={<TagRoute />} />
            <Route path="/:slug" element={<GamePage />} />
            <Route path="/:slug/page/:page" element={<GamePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </div>
    </ToastProvider>
  );
}

export default App;
