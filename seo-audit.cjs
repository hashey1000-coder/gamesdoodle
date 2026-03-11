const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/data/games.js', 'utf8');

// Extract all game slugs (skip category slugs which come first)
const allSlugs = [...content.matchAll(/slug: '([^']+)'/g)].map(m => m[1]);
const catSlugs = ['google-doodle-games', 'online-games', 'google-tools', 'google-easter-egg'];
const gameSlugs = allSlugs.filter(s => !catSlugs.includes(s));

// Extract metaDescriptions
const metaDescs = [...content.matchAll(/metaDescription: '([^']*)'/g)].map(m => m[1]);
const catMetaDescs = metaDescs.slice(0, 4);
const gameMetaDescs = metaDescs.slice(4);

// Extract titles
const titles = [...content.matchAll(/title: '([^']*)'/g)].map(m => m[1]);
const catTitles = titles.slice(0, 4);
const gameTitles = titles.slice(4);

// Extract thumbnails
const thumbs = [...content.matchAll(/thumbnail: '([^']*)'/g)].map(m => m[1]);

console.log('=== DEEP SEO AUDIT ===\n');
console.log('--- DATA OVERVIEW ---');
console.log('Game slugs:', gameSlugs.length);
console.log('Category slugs:', catSlugs.length);
console.log('Game metaDescriptions:', gameMetaDescs.length);
console.log('Game titles:', gameTitles.length);
console.log('Game thumbnails:', thumbs.length);

// 1. META DESCRIPTION AUDIT
console.log('\n--- 1. META DESCRIPTION ISSUES ---');
const emptyMD = gameMetaDescs.filter(m => !m || m.trim() === '');
console.log('Empty:', emptyMD.length);

const shortMD = gameMetaDescs.filter(m => m.length < 70);
if (shortMD.length) {
  console.log('Too short (<70 chars):', shortMD.length);
  shortMD.forEach(m => console.log('  -', m.length, 'chars:', m.substring(0, 60)));
}

const longMD = gameMetaDescs.filter(m => m.length > 160);
if (longMD.length) {
  console.log('Too long (>160 chars):', longMD.length);
  longMD.forEach(m => console.log('  -', m.length, 'chars:', m.substring(0, 80) + '...'));
} else {
  console.log('Too long (>160 chars): 0');
}

// Check category meta descriptions
console.log('\nCategory meta description lengths:');
catSlugs.forEach((s, i) => {
  console.log('  ', s, ':', catMetaDescs[i].length, 'chars');
});

// 2. TITLE AUDIT
console.log('\n--- 2. TITLE TAG ISSUES ---');
const shortT = gameTitles.filter(t => t.length < 20);
if (shortT.length) {
  console.log('Too short (<20 chars):', shortT.length);
  shortT.forEach(t => console.log('  -', t.length, ':', t));
} else {
  console.log('Too short (<20 chars): 0');
}

// Game titles get " – Games Doodle" appended by CategoryPage but NOT by GameDetail
// GameDetail uses the raw title from data
// HomePage uses fixed "Games Doodle – Play Google Doodle Games"
// Let's check actual rendered title lengths
const longT = gameTitles.filter(t => t.length > 60);
if (longT.length) {
  console.log('Title tag over 60 chars (Google cutoff ~60):', longT.length);
  longT.slice(0, 15).forEach(t => console.log('  -', t.length, ':', t.substring(0, 80)));
  if (longT.length > 15) console.log('  ... and', longT.length - 15, 'more');
} else {
  console.log('Title tag over 60 chars: 0');
}

// Duplicate titles
const titleCounts = {};
gameTitles.forEach(t => { titleCounts[t] = (titleCounts[t] || 0) + 1; });
const dupTitles = Object.entries(titleCounts).filter(([_, c]) => c > 1);
if (dupTitles.length) {
  console.log('Duplicate titles:', dupTitles.length);
  dupTitles.forEach(([t, c]) => console.log('  -', c, 'x:', t.substring(0, 60)));
}

// Duplicate meta descriptions
const mdCounts = {};
gameMetaDescs.forEach(m => { mdCounts[m] = (mdCounts[m] || 0) + 1; });
const dupMDs = Object.entries(mdCounts).filter(([_, c]) => c > 1);
if (dupMDs.length) {
  console.log('\nDuplicate meta descriptions:', dupMDs.length);
  dupMDs.forEach(([m, c]) => console.log('  -', c, 'x:', m.substring(0, 60)));
}

// 3. PUBLIC FILES
console.log('\n--- 3. CRITICAL SEO FILES ---');
const critFiles = ['robots.txt', 'sitemap.xml', 'logo.png', 'favicon-32x32.png', 'favicon-192x192.png', 'apple-touch-icon.png', 'favicon.ico'];
critFiles.forEach(f => {
  const exists = fs.existsSync(path.join('public', f));
  console.log(exists ? '  ✅' : '  ❌', f, exists ? '' : '--- MISSING');
});

// 4. IMAGES CHECK
console.log('\n--- 4. IMAGE/THUMBNAIL AUDIT ---');
const imgDir = 'public/images';
const images = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
console.log('Total images:', images.length);
const emptyThumbs = thumbs.filter(t => !t);
if (emptyThumbs.length) console.log('Empty thumbnail paths:', emptyThumbs.length);
const missingImgs = thumbs.filter(t => {
  if (!t) return true;
  return !fs.existsSync(path.join('public', t.replace(/^\//, '')));
});
if (missingImgs.length) {
  console.log('Missing thumbnail files:', missingImgs.length);
  missingImgs.forEach(m => console.log('  -', m));
} else {
  console.log('All thumbnail files present ✅');
}

// 5. SEO COMPONENT ANALYSIS
console.log('\n--- 5. SEO COMPONENT ANALYSIS ---');
const seoContent = fs.readFileSync('src/components/SEO.jsx', 'utf8');

// Check for critical meta tags
const criticalTags = [
  ['og:title', /og:title/],
  ['og:description', /og:description/],
  ['og:url', /og:url/],
  ['og:type', /og:type/],
  ['og:image', /og:image/],
  ['og:site_name', /og:site_name/],
  ['og:locale', /og:locale/],
  ['twitter:card', /twitter:card/],
  ['twitter:title', /twitter:title/],
  ['twitter:description', /twitter:description/],
  ['twitter:image', /twitter:image/],
  ['robots', /name="robots"/],
  ['canonical', /rel="canonical"/],
  ['description', /name="description"/],
  ['JSON-LD', /application\/ld\+json/],
];
criticalTags.forEach(([name, regex]) => {
  const found = regex.test(seoContent);
  console.log(found ? '  ✅' : '  ❌', name, found ? '' : '--- MISSING');
});

// Missing meta tags check
const missingMeta = [
  ['og:image:type', /og:image:type/],
  ['og:image:alt', /og:image:alt/],
  ['twitter:site', /twitter:site/],
  ['twitter:creator', /twitter:creator/],
  ['article:published_time', /article:published_time/],
  ['article:modified_time', /article:modified_time/],
  ['article:author', /article:author/],
  ['article:section', /article:section/],
];
console.log('\n  Optional but recommended meta tags:');
missingMeta.forEach(([name, regex]) => {
  const found = regex.test(seoContent);
  console.log(found ? '  ✅' : '  ⚠️ ', name, found ? '' : '--- not present');
});

// 6. INDEX.HTML ANALYSIS
console.log('\n--- 6. INDEX.HTML ANALYSIS ---');
const indexContent = fs.readFileSync('index.html', 'utf8');
const indexChecks = [
  ['lang="en"', /lang="en"/],
  ['charset', /charset/],
  ['viewport', /viewport/],
  ['favicon', /favicon/],
  ['apple-touch-icon', /apple-touch-icon/],
  ['theme-color', /<meta name="theme-color"/],
  ['manifest.json', /manifest/],
  ['preconnect hints', /preconnect/],
];
indexChecks.forEach(([name, regex]) => {
  const found = regex.test(indexContent);
  console.log(found ? '  ✅' : '  ⚠️ ', name, found ? '' : '--- not present');
});

// 7. JSON-LD SCHEMA AUDIT
console.log('\n--- 7. JSON-LD SCHEMA AUDIT ---');
// Check homepage schema
const hasWebSite = /WebSite/.test(seoContent);
const hasWebPage = /WebPage/.test(seoContent);
const hasOrganization = /Organization/.test(seoContent);
const hasBlogPosting = /BlogPosting/.test(seoContent);
const hasBreadcrumb = /BreadcrumbList/.test(seoContent);
const hasCollectionPage = /CollectionPage/.test(seoContent);
const hasSearchAction = /SearchAction/.test(seoContent);
const hasPerson = /Person/.test(seoContent);
const hasImageObject = /ImageObject/.test(seoContent);

console.log('  Schema types present:');
console.log('  ✅ Organization');
console.log(hasWebSite ? '  ✅' : '  ❌', 'WebSite');
console.log(hasWebPage ? '  ✅' : '  ❌', 'WebPage');
console.log(hasBlogPosting ? '  ✅' : '  ❌', 'BlogPosting');
console.log(hasBreadcrumb ? '  ✅' : '  ❌', 'BreadcrumbList');
console.log(hasCollectionPage ? '  ✅' : '  ❌', 'CollectionPage');
console.log(hasSearchAction ? '  ✅' : '  ❌', 'SearchAction');
console.log(hasPerson ? '  ✅' : '  ❌', 'Person');
console.log(hasImageObject ? '  ✅' : '  ❌', 'ImageObject');

// Check BlogPosting for missing recommended fields
console.log('\n  BlogPosting recommended fields:');
const bpFields = ['datePublished', 'dateModified', 'wordCount'];
bpFields.forEach(f => {
  const found = seoContent.includes(f);
  console.log(found ? '  ✅' : '  ❌', f, found ? '' : '--- MISSING (recommended by Google)');
});

// 8. ROUTING / URL AUDIT
console.log('\n--- 8. URL / ROUTING AUDIT ---');
const appContent = fs.readFileSync('src/App.jsx', 'utf8');

// Check trailing slashes in links
const hasTrailingSlash = /to={`\/\${[^}]+}\/`}/.test(fs.readFileSync('src/components/GameCard.jsx', 'utf8'));
console.log(hasTrailingSlash ? '  ✅' : '  ❌', 'GameCard links use trailing slash');

// Check 404 page canonical
const notFoundContent = fs.readFileSync('src/pages/NotFoundPage.jsx', 'utf8');
const has404Canonical = /canonical="\/404\/"/.test(notFoundContent);
console.log(has404Canonical ? '  ⚠️  404 has canonical /404/ (should not have canonical)' : '  ✅ 404 canonical OK');

// Check for noindex on 404
const has404Noindex = /noindex/.test(notFoundContent);
console.log(has404Noindex ? '  ✅ 404 has noindex' : '  ❌ 404 page is MISSING noindex --- CRITICAL');

// Check category page pagination canonical
const catContent = fs.readFileSync('src/pages/CategoryPage.jsx', 'utf8');
const hasPrevNext = /rel="prev"|rel="next"/.test(catContent);
console.log(hasPrevNext ? '  ✅' : '  ⚠️ ', 'Pagination prev/next links', hasPrevNext ? '' : '--- not present');

// 9. SPA / CSR CONCERNS
console.log('\n--- 9. SPA / CLIENT-SIDE RENDERING CONCERNS ---');
const hasSSR = fs.existsSync('server.js') || fs.existsSync('src/entry-server.jsx');
const hasPrerender = content.includes('prerender') || fs.existsSync('prerender.js');
console.log(hasSSR ? '  ✅ SSR detected' : '  ❌ No SSR --- search engines may struggle with CSR React app');
console.log(hasPrerender ? '  ✅ Prerendering detected' : '  ❌ No prerendering --- critical for SEO of SPA');

// Check vite config for prerender plugin
const viteContent = fs.readFileSync('vite.config.js', 'utf8');
const hasViteSSR = /ssr|prerender|ssg/i.test(viteContent);
console.log(hasViteSSR ? '  ✅ Vite SSR/prerender config found' : '  ⚠️  Vite has no SSR/prerender configuration');

// 10. HEADING HIERARCHY
console.log('\n--- 10. CONTENT / HEADING AUDIT ---');
// Check h1 usage in pages
const pages = ['HomePage.jsx', 'GameDetail.jsx', 'CategoryPage.jsx', 'StaticPage.jsx', 'NotFoundPage.jsx'];
pages.forEach(p => {
  const pageContent = fs.readFileSync(path.join('src/pages', p), 'utf8');
  const h1Count = (pageContent.match(/<h1/g) || []).length;
  const className = pageContent.match(/className="([^"]*page-title[^"]*)"/);
  console.log(h1Count === 1 ? '  ✅' : '  ❌', p, `has ${h1Count} <h1> tag(s)`, className ? '' : '');
});

// Check game content for heading hierarchy
const h2InContent = (content.match(/<h2/g) || []).length;
const h3InContent = (content.match(/<h3/g) || []).length;
console.log('  Game content <h2> tags:', h2InContent);
console.log('  Game content <h3> tags:', h3InContent);

// 11. INTERNAL LINKING
console.log('\n--- 11. INTERNAL LINKING ---');
const relatedSlugsMatches = [...content.matchAll(/relatedSlugs: \[([^\]]*)\]/g)].map(m => m[1]);
const emptyRelated = relatedSlugsMatches.filter(r => !r || r.trim() === '');
console.log('Games with empty relatedSlugs:', emptyRelated.length);
console.log('Games with relatedSlugs:', relatedSlugsMatches.length - emptyRelated.length);

// 12. ALT TEXT
console.log('\n--- 12. IMAGE ALT TEXT ---');
const gameCardContent = fs.readFileSync('src/components/GameCard.jsx', 'utf8');
const hasAltText = /alt={game\.title}/.test(gameCardContent);
console.log(hasAltText ? '  ✅' : '  ❌', 'GameCard images have alt text');
const headerContent = fs.readFileSync('src/components/Header.jsx', 'utf8');
const hasLogoAlt = /alt="Games Doodle"/.test(headerContent);
console.log(hasLogoAlt ? '  ✅' : '  ❌', 'Header logo has alt text');
const footerContent = fs.readFileSync('src/components/Footer.jsx', 'utf8');
const hasFooterLogoAlt = /alt="Games Doodle"/.test(footerContent);
console.log(hasFooterLogoAlt ? '  ✅' : '  ❌', 'Footer logo has alt text');

// GameEmbed iframe title
const embedContent = fs.readFileSync('src/components/GameEmbed.jsx', 'utf8');
const hasIframeTitle = /title={game\.title}/.test(embedContent);
console.log(hasIframeTitle ? '  ✅' : '  ❌', 'Game iframe has title attribute');

// SUMMARY
console.log('\n=============================');
console.log('=== CRITICAL ISSUES FOUND ===');
console.log('=============================');
let issues = 0;
if (!fs.existsSync('public/robots.txt')) { console.log(++issues + '. ❌ Missing robots.txt'); }
if (!fs.existsSync('public/sitemap.xml')) { console.log(++issues + '. ❌ Missing sitemap.xml'); }
if (!has404Noindex) { console.log(++issues + '. ❌ 404 page not noindexed'); }
if (has404Canonical) { console.log(++issues + '. ⚠️  404 page should NOT have a canonical URL'); }
if (!hasSSR && !hasPrerender) { console.log(++issues + '. ⚠️  No SSR/prerender (SPA SEO concern)'); }
if (!seoContent.includes('datePublished')) { console.log(++issues + '. ❌ BlogPosting missing datePublished'); }
if (!seoContent.includes('dateModified')) { console.log(++issues + '. ❌ BlogPosting missing dateModified'); }
if (!seoContent.includes('wordCount')) { console.log(++issues + '. ⚠️  BlogPosting missing wordCount'); }
if (longT.length) { console.log(++issues + '. ⚠️  ' + longT.length + ' game titles over 60 chars'); }
if (longMD.length) { console.log(++issues + '. ⚠️  ' + longMD.length + ' meta descriptions over 160 chars'); }
if (!hasPrevNext) { console.log(++issues + '. ⚠️  Pagination missing rel=prev/next'); }
if (!indexContent.includes('theme-color')) { console.log(++issues + '. ⚠️  Missing theme-color meta tag'); }
if (!fs.existsSync('public/favicon.ico')) { console.log(++issues + '. ⚠️  Missing favicon.ico (legacy browsers)'); }
console.log('\nTotal issues:', issues);
