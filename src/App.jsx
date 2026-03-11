import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import CategoryPage from './pages/CategoryPage';
import StaticPage from './pages/StaticPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="site-wrapper">
          <Header />
          <main className="site-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:slug" element={<GamePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
