// fetch-news.js — RSS-based news ingestion for baseball.
//
// Reads source list from data/master/news-sources.json. Fetches each enabled
// feed via lib/rss-parser, dedupes by URL + normalized title across sources,
// sorts newest-first, applies per-source + total caps, and writes to
// data/snapshots/news-latest.json.
//
// Output shape (data/snapshots/news-latest.json):
//   {
//     schemaVersion: 1,
//     generatedAt: ISO,
//     ok: bool,
//     sources: [{ sourceId, sourceName, tier, scope, ok, count, error? }],
//     items:   [{ id, title, url, summary, author, categories, imageUrl,
//                 publishedAt, sourceId, sourceName, tier, scope, feedUrl }],
//     errors:  [{ sourceId, message }]
//   }

const fs = require('fs');
const path = require('path');
const { fetchFeed } = require('./lib/rss-parser');

const ROOT = path.resolve(__dirname, '..');
const NEWS_SOURCES_PATH = path.join(ROOT, 'data', 'master', 'news-sources.json');
const OUT_PATH = path.join(ROOT, 'data', 'snapshots', 'news-latest.json');

const MAX_ITEMS = 40;
const MAX_PER_SOURCE = 15;

function normalizeTitle(t) {
  return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 80);
}

function loadSources() {
  if (!fs.existsSync(NEWS_SOURCES_PATH)) {
    throw new Error('news-sources.json not found at ' + NEWS_SOURCES_PATH);
  }
  const j = JSON.parse(fs.readFileSync(NEWS_SOURCES_PATH, 'utf8'));
  return (j.sources || []).filter(s => s.enabled !== false && s.feedUrl);
}

async function run() {
  const sources = loadSources();
  const errors = [];
  const perSource = [];
  let allItems = [];

  for (const src of sources) {
    try {
      const items = await fetchFeed({
        sourceId: src.id,
        sourceName: src.displayName || src.id,
        tier: src.tier || 'T2',
        scope: src.scope || 'league',
        feedUrl: src.feedUrl
      });
      const capped = items.slice(0, MAX_PER_SOURCE);
      perSource.push({
        sourceId: src.id,
        sourceName: src.displayName || src.id,
        tier: src.tier || 'T2',
        scope: src.scope || 'league',
        ok: true,
        count: capped.length
      });
      allItems = allItems.concat(capped);
    } catch (e) {
      errors.push({ sourceId: src.id, message: e.message });
      perSource.push({
        sourceId: src.id,
        sourceName: src.displayName || src.id,
        tier: src.tier || 'T2',
        scope: src.scope || 'league',
        ok: false,
        error: e.message
      });
    }
  }

  // Dedupe — primary by URL, secondary by normalized title (cross-source repeats).
  const seenUrl = new Set();
  const seenTitle = new Set();
  const deduped = [];
  for (const it of allItems) {
    const u = (it.url || '').toLowerCase();
    const t = normalizeTitle(it.title);
    if (u && seenUrl.has(u)) continue;
    if (t && seenTitle.has(t)) continue;
    if (u) seenUrl.add(u);
    if (t) seenTitle.add(t);
    deduped.push(it);
  }

  // Sort newest-first; missing publishedAt drops to the back.
  deduped.sort((a, b) => {
    const aT = a.publishedAt || '';
    const bT = b.publishedAt || '';
    if (!aT && !bT) return 0;
    if (!aT) return 1;
    if (!bT) return -1;
    return bT.localeCompare(aT);
  });

  const items = deduped.slice(0, MAX_ITEMS);
  const ok = perSource.some(s => s.ok && s.count > 0);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    ok,
    sources: perSource,
    items,
    errors
  };
}

if (require.main === module) {
  run().then(result => {
    fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
    const okCount = result.sources.filter(s => s.ok).length;
    const total = result.sources.length;
    console.log(`[fetch-news] Wrote ${result.items.length} items from ${okCount}/${total} sources to ${OUT_PATH}`);
    if (result.errors.length) {
      console.log(`[fetch-news] Per-source errors (${result.errors.length}):`);
      for (const e of result.errors) console.log(`  - ${e.sourceId}: ${e.message}`);
    }
  }).catch(e => {
    console.error('[fetch-news] FATAL:', e.message);
    console.error(e.stack);
    process.exit(1);
  });
}

module.exports = { run };
