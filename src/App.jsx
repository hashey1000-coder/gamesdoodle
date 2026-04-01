import { Routes, Route, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
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
        <AdBanner />
        <Footer />
        <BackToTop />
        <CookieConsent />
      </div>
    </ToastProvider>
  );
}

export default App;
