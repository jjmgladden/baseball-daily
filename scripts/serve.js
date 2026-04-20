#!/usr/bin/env node
/**
 * Local static server for Baseball Daily Intelligence.
 *
 * Serves /app/ and /data/ from the project root.
 * A live server is required because browsers block fetch() over file://.
 *
 * Usage:  node scripts/serve.js    (or:  npm run serve)
 * Then open http://localhost:1882
 *
 * Port 1882 was chosen as the Cardinals' franchise-founding year —
 * a baseball-themed, uncommon default that won't collide with the
 * typical 3000/5000/8080/8000 used by other local dev servers.
 * Override with: set PORT=xxxx && npm run serve
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 1882;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  try {
    let url = decodeURI((req.url || '/').split('?')[0]);
    if (url === '/' || url === '') url = '/index.html';

    // Project-root files are valid: /index.html (redirect), /.nojekyll, /icon.svg fallback
    let file = path.join(PROJECT_ROOT, url);

    // Prevent path traversal
    const resolved = path.resolve(file);
    if (!resolved.startsWith(PROJECT_ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(resolved, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Not found: ${url}`);
        return;
      }
      const ext = path.extname(resolved).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`\nBaseball Daily Intelligence — local server`);
  console.log(`  Root:  ${PROJECT_ROOT}`);
  console.log(`  URL:   http://localhost:${PORT}/`);
  console.log(`  Stop:  Ctrl+C\n`);
});
