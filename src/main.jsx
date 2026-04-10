
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');

// React 19 + react-helmet-async v3: Helmet renders <title>, <meta>, <link> as
// React elements that React 19 hoists to <head>. The prerender script already
// placed these in <head> for non-JS crawlers, but React 19 doesn't know about
// them and adds a second set during hydration → duplicate tags.
// Fix: remove the prerendered SEO tags before hydration so React 19 creates
// one clean set. Non-JS crawlers already saw the static HTML version.
if (container.children.length > 0) {
  document.head.querySelectorAll('[data-rh="true"]').forEach(el => el.remove());
}

const app = (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

// Hydrate if there's prerendered content, otherwise mount fresh
if (container.children.length > 0) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
