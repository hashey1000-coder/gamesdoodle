import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../public/images/additional');
const dataFile = path.resolve(__dirname, '../src/data/additionalGames.js');
const manifestFile = path.resolve(__dirname, '../src/data/additionalThumbnailManifest.js');

function hashString(value) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxLineLength = 22) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 3);
}

function buildSvg(game) {
  const hash = hashString(game.slug);
  const hueA = hash % 360;
  const hueB = (hash * 1.7 + 95) % 360;
  const title = game.title.replace(' – Play Free Online', '');
  const lines = wrapText(title);
  const tagLine = (game.tags || []).slice(0, 2).join(' • ').toUpperCase();

  const titleMarkup = lines
    .map((line, index) => `<tspan x="64" dy="${index === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">Local thumbnail placeholder for ${escapeXml(title)}.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hueA} 70% 54%)" />
      <stop offset="100%" stop-color="hsl(${hueB} 70% 32%)" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="32" />
  <rect x="24" y="24" width="1152" height="582" fill="rgba(8, 12, 24, 0.18)" rx="28" stroke="rgba(255,255,255,0.18)" />
  <circle cx="1040" cy="120" r="180" fill="url(#glow)" />
  <circle cx="112" cy="534" r="136" fill="rgba(255,255,255,0.08)" />
  <text x="64" y="92" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Inter, Arial, sans-serif" font-weight="700" letter-spacing="2">GAMES DOODLE</text>
  <text x="64" y="212" fill="#ffffff" font-size="64" font-family="Inter, Arial, sans-serif" font-weight="800">${titleMarkup}</text>
  <text x="64" y="498" fill="rgba(255,255,255,0.84)" font-size="24" font-family="Inter, Arial, sans-serif" font-weight="700" letter-spacing="2">${escapeXml(tagLine || 'BROWSER GAME')}</text>
  <text x="64" y="548" fill="rgba(255,255,255,0.92)" font-size="30" font-family="Inter, Arial, sans-serif">Local in-repo thumbnail</text>
  <text x="64" y="586" fill="rgba(255,255,255,0.72)" font-size="22" font-family="Inter, Arial, sans-serif">Generated asset for offline-safe game metadata</text>
</svg>`;
}

function parseAdditionalGameAssetData(source) {
  const entries = [...source.matchAll(/slug:\s*'([^']+)'[\s\S]*?thumbnail:\s*'([^']+)'/g)];

  return entries.map(([, slug, thumbnail]) => ({
    slug,
    thumbnail,
  }));
}

function inferExtension(url, contentType) {
  const pathname = new URL(url).pathname;
  const extFromPath = path.extname(pathname).toLowerCase();

  if (extFromPath && extFromPath !== '.php') {
    return extFromPath;
  }

  const normalized = (contentType || '').split(';')[0].trim().toLowerCase();
  const byType = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
  };

  return byType[normalized] || '.jpg';
}

async function downloadThumbnail(game) {
  const response = await fetch(game.thumbnail, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      referer: 'https://gamesdoodle.org/',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  const extension = inferExtension(response.url, contentType);
  const buffer = Buffer.from(await response.arrayBuffer());
  const fileName = `${game.slug}${extension}`;
  const filePath = path.join(outputDir, fileName);

  await writeFile(filePath, buffer);

  return `/images/additional/${fileName}`;
}

await mkdir(outputDir, { recursive: true });

const source = await readFile(dataFile, 'utf8');
const games = parseAdditionalGameAssetData(source);
const manifest = {};

for (const game of games) {
  if (!game.thumbnail.startsWith('http')) {
    continue;
  }

  try {
    manifest[game.slug] = await downloadThumbnail(game);
    console.log(`downloaded ${game.slug} -> ${manifest[game.slug]}`);
  } catch (error) {
    const fallbackPath = `/images/additional/${game.slug}.svg`;
    const svg = buildSvg({
      ...game,
      title: game.slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      tags: [],
    });

    await writeFile(path.join(outputDir, `${game.slug}.svg`), svg, 'utf8');
    manifest[game.slug] = fallbackPath;
    console.warn(`fallback ${game.slug}: ${error.message}`);
  }
}

const manifestSource = `export const additionalThumbnailManifest = ${JSON.stringify(manifest, null, 2)};\n`;
await writeFile(manifestFile, manifestSource, 'utf8');

console.log(`Resolved ${Object.keys(manifest).length} local additional-game thumbnails in ${outputDir}`);
