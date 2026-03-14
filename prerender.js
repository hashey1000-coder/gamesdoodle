/**
 * Full SSR prerender script.
 *
 * After `vite build` (client) and `vite build --ssr` (server), this script:
 * 1. Loads the SSR render function
 * 2. Renders every route to complete HTML (body + head)
 * 3. Writes static HTML files to dist/
 *
 * The result is a fully static site — every page has complete HTML content
 * in the initial response, just like a WordPress site.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, 'dist');

// ── Import the SSR bundle ──────────────────────────────────────────────
const { render } = await import('./dist/server/entry-server.js');

// ── Read the client-built HTML template ────────────────────────────────
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

// Save a clean copy as SPA fallback (for non-prerendered routes)
fs.copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '200.html'));

// ── Collect all routes to prerender ────────────────────────────────────
const gamesSource = fs.readFileSync(path.join(__dirname, 'src/data/games.js'), 'utf8');

const CAT_SLUGS = ['google-doodle-games', 'online-games', 'google-tools', 'google-easter-egg'];
const TAG_SLUGS = ['arcade', 'racing', 'shooter', 'puzzle', 'sports', 'io', 'word-and-trivia', 'strategy', 'music-and-creative', 'simulation', 'card-and-board', 'platformer'];
const STATIC_SLUGS = ['about-us', 'privacy-policy', 'contact-us', 'editorial-policy', 'terms-of-service', 'dmca'];

const allSlugs = [...gamesSource.matchAll(/^\s+slug: '([^']+)'/gm)].map(m => m[1]);
const gameSlugs = allSlugs.filter(s => !CAT_SLUGS.includes(s));

const routes = [
  '/',
  ...CAT_SLUGS.map(s => `/${s}/`),
  ...TAG_SLUGS.map(s => `/tag/${s}/`),
  ...STATIC_SLUGS.map(s => `/${s}/`),
  ...gameSlugs.map(s => `/${s}/`),
];

console.log(`\n🔄 Static rendering ${routes.length} routes...\n`);

// ── Render each route ──────────────────────────────────────────────────

function buildPage(url) {
  const { html } = render(url);

  // react-helmet-async v3 renders head tags inline at the start of the HTML.
  // Split: Helmet head tags come before <div class="site-wrapper">, body after.
  const splitIdx = html.indexOf('<div class="site-wrapper"');
  if (splitIdx === -1) {
    throw new Error('Could not find site-wrapper in rendered HTML');
  }

  const headTags = html.slice(0, splitIdx);
  let bodyContent = html.slice(splitIdx);

  // Extract JSON-LD <script> tags from inside the body and move them to <head>
  let jsonLd = '';
  bodyContent = bodyContent.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    (match) => { jsonLd += match; return ''; }
  );

  let page = template;

  // Remove default head tags that Helmet overrides
  page = page.replace(/<title>[^<]*<\/title>/, '');
  page = page.replace(/<meta name="description"[^>]*\/>/, '');
  page = page.replace(/<meta name="robots"[^>]*\/>/, '');
  page = page.replace(/<link rel="canonical"[^>]*\/>/, '');
  page = page.replace(/<meta property="og:[^"]*"[^>]*\/>\s*\n?/g, '');
  page = page.replace(/<meta name="twitter:[^"]*"[^>]*\/>\s*\n?/g, '');

  // Inject extracted Helmet head tags + JSON-LD before </head>
  page = page.replace('</head>', `    ${headTags}\n    ${jsonLd}\n  </head>`);

  // Inject rendered body content into the SSR outlet
  page = page.replace('<!--ssr-outlet-->', bodyContent);

  return page;
}

let success = 0;
let failed = 0;

for (const route of routes) {
  try {
    const page = buildPage(route);

    const filePath = route === '/'
      ? path.join(DIST, 'index.html')
      : path.join(DIST, route, 'index.html');

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, page);
    success++;

    if (success % 50 === 0) {
      console.log(`  ✓ ${success}/${routes.length} rendered...`);
    }
  } catch (err) {
    failed++;
    console.error(`  ✗ ${route}: ${err.message}`);
  }
}

// Clean up the server bundle (not needed in the deployed output)
fs.rmSync(path.join(DIST, 'server'), { recursive: true, force: true });

console.log(`\n✅ Static render complete: ${success} succeeded, ${failed} failed out of ${routes.length} routes`);
