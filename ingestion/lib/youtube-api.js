/**
 * YouTube Data API v3 wrapper — v1
 *
 * Base: https://www.googleapis.com/youtube/v3/
 *
 * Uses a single API key from process.env.YOUTUBE_API_KEY.
 * This module is used ONLY in ingestion (Node.js). Per CLAUDE.md § Secret Safety,
 * the key never reaches the browser.
 *
 * Free quota: 10,000 units/day.
 * Cost map (roughly):
 *   - search.list   = 100 units per call
 *   - videos.list   = 1 unit per call
 *   - channels.list = 1 unit per call
 *
 * A conservative daily ingestion (2 search calls for Cardinals + Nationals) =
 * 200 units, ~2% of the free quota. Well within budget.
 */

const BASE = 'https://www.googleapis.com/youtube/v3';

function requireKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error('YOUTUBE_API_KEY is not set. See docs/youtube-api-setup.md.');
  }
  return key.trim();
}

async function get(path, params) {
  const url = new URL(BASE + path);
  url.searchParams.set('key', requireKey());
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    const preview = text.slice(0, 300);
    throw new Error(`YouTube API ${res.status} ${res.statusText}: ${preview}`);
  }
  return res.json();
}

/**
 * Search for videos. Common params:
 *   - channelId       restrict results to a channel (e.g., official MLB channel)
 *   - q               free-text query
 *   - publishedAfter  ISO 8601 timestamp
 *   - order           'date' | 'relevance' | 'viewCount' (default: relevance)
 *   - maxResults      1-50 (default: 5)
 */
async function search(params) {
  return get('/search', {
    part: 'snippet',
    type: 'video',
    maxResults: 5,
    order: 'date',
    ...params,
  });
}

module.exports = { search };

if (require.main === module) {
  (async () => {
    const r = await search({ q: 'St. Louis Cardinals highlights', maxResults: 3 });
    console.log(JSON.stringify(r.items?.map(i => i.snippet?.title), null, 2));
  })().catch(err => { console.error(err.message); process.exit(1); });
}
