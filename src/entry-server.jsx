import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import GamePage from './pages/GamePage.jsx';
import TagPage from './pages/TagPage.jsx';
import TopGamesPage from './pages/TopGamesPage.jsx';
import NewGamesPage from './pages/NewGamesPage.jsx';
import AllGamesPage from './pages/AllGamesPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import { CollectionsIndex, CollectionDetail } from './pages/CollectionsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * Render a given URL to static HTML + extracted head tags.
 * Called by the prerender script for every route at build time.
 */
export function render(url) {
  const helmetContext = {};
  const ssrPages = {
    GamePage,
    TagPage,
    TopGamesPage,
    NewGamesPage,
    AllGamesPage,
    StatsPage,
    FavoritesPage,
    CollectionsIndex,
    CollectionDetail,
    NotFoundPage,
  };

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App ssrPages={ssrPages} />
      </StaticRouter>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet };
}
