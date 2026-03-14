#!/usr/bin/env node
/**
 * submit-indexnow.cjs
 *
 * Submits new/changed URLs to Bing IndexNow after a build.
 *
 * Usage:
 *   node submit-indexnow.cjs                        # submits ALL sitemap URLs
 *   node submit-indexnow.cjs /path/prev-sitemap.xml # submits only NEW URLs
 *
 * Requires env var INDEXNOW_KEY (or uses the hardcoded key below).
 */

'use strict';
const fs   = require('fs');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '4aa56dab9c758816f479a1f2583759a2';
const HOST         = 'gamesdoodle.org';
const SITEMAP_PATH = 'public/sitemap.xml';
const ENDPOINT     = 'api.indexnow.org';   // official aggregator → distributes to Bing, Yandex, etc.
const BATCH_SIZE   = 10_000;               // IndexNow max per request
// ─────────────────────────────────────────────────────────────────────────────

function extractUrls(xmlContent) {
  return [...xmlContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

function post(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req  = https.request(
      {
        hostname: ENDPOINT,
        path:     '/indexnow',
        method:   'POST',
        headers:  {
          'Content-Type':   'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let raw = '';
        res.on('data', d => (raw += d));
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`❌  Sitemap not found at ${SITEMAP_PATH} — run "npm run build" first.`);
    process.exit(1);
  }

  const currentUrls = extractUrls(fs.readFileSync(SITEMAP_PATH, 'utf8'));

  // Optionally diff against a previous sitemap to submit only new URLs
  const prevSitemapArg = process.argv[2];
  let urlsToSubmit;

  if (prevSitemapArg && fs.existsSync(prevSitemapArg)) {
    const prevUrls = new Set(extractUrls(fs.readFileSync(prevSitemapArg, 'utf8')));
    urlsToSubmit   = currentUrls.filter(u => !prevUrls.has(u));
    console.log(`🔍  Comparing sitemaps → ${urlsToSubmit.length} new URL(s) found.`);
  } else {
    urlsToSubmit = currentUrls;
    console.log(`🌐  Submitting all ${urlsToSubmit.length} URL(s) from sitemap.`);
  }

  if (urlsToSubmit.length === 0) {
    console.log('✅  No new URLs to submit — nothing to do.');
    return;
  }

  // Submit in batches
  for (let i = 0; i < urlsToSubmit.length; i += BATCH_SIZE) {
    const batch = urlsToSubmit.slice(i, i + BATCH_SIZE);
    const payload = {
      host:        HOST,
      key:         INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList:     batch,
    };

    console.log(`📤  Sending batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} URLs…`);
    try {
      const { status, body } = await post(payload);
      if (status === 200 || status === 202) {
        console.log(`✅  Batch accepted (HTTP ${status})`);
      } else if (status === 422) {
        console.log(`⚠️   HTTP 422 — URLs already submitted recently, nothing to do.`);
      } else {
        console.error(`❌  Unexpected HTTP ${status}: ${body}`);
        process.exitCode = 1;
      }
    } catch (err) {
      console.error(`❌  Request failed: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();
