import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { AdScriptLoader, AdSlot } from './components/AdSlot';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import TagPage from './pages/TagPage';
import TopGamesPage from './pages/TopGamesPage';
import NewGamesPage from './pages/NewGamesPage';
import AllGamesPage from './pages/AllGamesPage';
import StatsPage from './pages/StatsPage';
import FavoritesPage from './pages/FavoritesPage';
import { CollectionsIndex, CollectionDetail } from './pages/CollectionsPage';
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
  const { pathname, search } = useLocation();

  return (
    <ToastProvider>
      <AdScriptLoader />
      <ScrollToTop />
      <div className="site-wrapper">
        <Header />
        <div className="global-top-ad-shell">
          <AdSlot
            key={`top-${pathname}${search}`}
            id="GD_Game_Top"
            className="global-top-ad-slot"
          />
        </div>
        <main className="site-main">
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
          <AdSlot
            key={`bottom-${pathname}${search}`}
            id="GD_Game_Bottom"
            className="global-bottom-ad-slot"
          />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ToastProvider>
  );
}

export default App;
