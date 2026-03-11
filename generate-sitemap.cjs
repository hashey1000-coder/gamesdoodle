// Build-time sitemap generator
// Run with: node generate-sitemap.cjs
// Called automatically during build via package.json scripts

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://gamesdoodle.org';
const today = new Date().toISOString().split('T')[0];

// Parse games.js to extract slugs and categories
const content = fs.readFileSync(path.join(__dirname, 'src/data/games.js'), 'utf8');

// Category slugs
const catSlugs = ['google-doodle-games', 'online-games', 'google-tools', 'google-easter-egg'];

// Game slugs (skip category slugs)
const allSlugs = [...content.matchAll(/^\s+slug: '([^']+)'/gm)].map(m => m[1]);
const gameSlugs = allSlugs.filter(s => !catSlugs.includes(s));

// Static page slugs
const staticSlugs = ['about-us', 'privacy-policy', 'contact-us', 'editorial-policy'];

// Count games per category for pagination
const categoryCounts = {};
catSlugs.forEach(cat => {
  const regex = new RegExp(`category: '${cat}'`, 'g');
  const matches = content.match(regex);
  categoryCounts[cat] = matches ? matches.length : 0;
});

const GAMES_PER_PAGE = 12;

let urls = [];

// Homepage - highest priority
urls.push({ loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' });

// Category pages with pagination
catSlugs.forEach(slug => {
  urls.push({ loc: `${SITE_URL}/${slug}/`, priority: '0.8', changefreq: 'weekly' });
  
  const totalPages = Math.ceil(categoryCounts[slug] / GAMES_PER_PAGE);
  for (let page = 2; page <= totalPages; page++) {
    urls.push({ loc: `${SITE_URL}/${slug}/?page=${page}`, priority: '0.5', changefreq: 'weekly' });
  }
});

// Game pages
gameSlugs.forEach(slug => {
  urls.push({ loc: `${SITE_URL}/${slug}/`, priority: '0.7', changefreq: 'monthly' });
});

// Static pages (noindex, but include in sitemap for discovery — optional, but WordPress had them)
// Actually, static pages are noindexed so we should NOT include them in the sitemap.

// Build XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Write to public/ for dev and dist/ for production build
const publicPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(publicPath, xml, 'utf8');

// Also write to dist/ if it exists (post-build)
const distPath = path.join(__dirname, 'dist', 'sitemap.xml');
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.writeFileSync(distPath, xml, 'utf8');
}

console.log(`Sitemap generated: ${urls.length} URLs`);
console.log(`  - 1 homepage`);
console.log(`  - ${catSlugs.length} category pages + pagination`);
console.log(`  - ${gameSlugs.length} game pages`);
console.log(`  Written to: ${publicPath}`);
