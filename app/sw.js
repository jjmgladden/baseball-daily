/**
 * Service Worker — v2
 *
 * Scope: /app/ (default — the SW file is at /app/sw.js).
 * Caches the app shell only. Data fetches go to /data/ which is outside
 * the SW scope, so the browser handles them directly — always fresh when
 * online, graceful failure when offline.
 *
 * All paths relative so the SW works both on localhost and under the
 * GitHub Pages subpath (/baseball-daily/app/).
 */

// CACHE name and APP_VERSION (in app/js/app.js) MUST stay in lockstep — bump both together.
const CACHE = 'baseball-daily-shell-v22';

const SHELL_FILES = [
  './',
  './index.html',
  './icon.svg',
  './icons/apple-touch-icon-180x180.png',
  './icons/apple-touch-icon-167x167.png',
  './icons/apple-touch-icon-152x152.png',
  './icons/apple-touch-icon-120x120.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest',
  './styles/main.css',
  './js/app.js',
  './js/data-loader.js',
  './js/tabs/daily.js',
  './js/tabs/cardinals.js',
  './js/tabs/teams.js',
  './js/tabs/players.js',
  './js/tabs/history.js',
  './js/tabs/stories.js',
  './js/tabs/trivia.js',
  './js/tabs/news.js',
  './js/tabs/ask.js',
  './js/components/favorites.js',
  './js/components/news-card.js',
  './js/components/confidence-badge.js',
  './js/components/trivia.js',
  './js/components/streak.js',
  './js/components/comparison.js',
  './js/components/highlights.js',
  './js/components/recap.js',
  './js/components/suggest.js',
  './js/components/refresh.js',
  './js/components/story-state.js',
  './js/components/splash.js',
  './js/components/error-messages.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// KB-0034 (Session 11): differentiate data paths from shell paths.
// Previously this handler did cache-first for EVERY GET — including
// /data/snapshots/latest.json — which meant the daily snapshot got stuck
// in cache the first time a user visited and was never refreshed until
// the SW cache key bumped. On mobile this manifested as "the email says
// today's date but the app still shows yesterday." Mirrors pickleball's
// pattern (KB-0040 reference) for parity across the two PWAs.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Network-first for /data/ — always try the wire; fall back to cache only if
  // the network fails (offline). The cache here is incidental (last-known-good)
  // not authoritative.
  if (url.pathname.includes('/data/')) {
    event.respondWith((async () => {
      try {
        return await fetch(req, { cache: 'no-store' });
      } catch {
        const cached = await caches.match(req);
        return cached || new Response(
          JSON.stringify({ error: 'offline-no-cache' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
    })());
    return;
  }

  // Cache-first for shell — fast paint on returning visits, network on miss.
  // Only same-origin successful responses get written to the cache (avoids
  // accidentally caching cross-origin Worker / Anthropic / GitHub responses).
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh.ok && url.origin === location.origin) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch {
      return cached || new Response('Offline and not cached', { status: 503 });
    }
  })());
});
