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
const CACHE = 'baseball-daily-shell-v16';

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
  './js/components/favorites.js',
  './js/components/trivia.js',
  './js/components/streak.js',
  './js/components/comparison.js',
  './js/components/highlights.js',
  './js/components/recap.js',
  './js/components/suggest.js',
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

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    return cached || new Response('Offline and not cached', { status: 503 });
  }
}
