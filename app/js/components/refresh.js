/**
 * Refresh handler — KB-0020 public on-demand refresh.
 *
 * Click handler for the "Refresh now" footer link. Calls the Worker's
 * /refresh route which dispatches a workflow_dispatch on daily.yml.
 *
 * Worker URL is read from data/master/ai-config.json (same file the Ask
 * tab uses) under workerBaseUrl. If the Worker isn't configured, the
 * button silently no-ops with a "not configured" message in the status
 * span.
 */

import { loadMaster } from '../data-loader.js';

let inFlight = false;

export function attachRefreshHandler(linkSelector, statusSelector) {
  const link = document.querySelector(linkSelector);
  const status = document.querySelector(statusSelector);
  if (!link) return;

  link.addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (inFlight) return;
    inFlight = true;

    const reset = () => { inFlight = false; };

    let cfg = null;
    try { cfg = await loadMaster('ai-config.json'); } catch {}

    const baseUrl = cfg?.workerBaseUrl;
    if (!baseUrl) {
      setStatus(status, 'refresh not configured');
      reset();
      return;
    }

    setStatus(status, 'requesting refresh…');
    let res, body;
    try {
      res = await fetch(baseUrl.replace(/\/+$/, '') + '/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      body = await res.json().catch(() => ({}));
    } catch (e) {
      setStatus(status, 'refresh failed (network)');
      reset();
      return;
    }

    if (!res.ok) {
      const msg = body?.error || ('refresh failed (' + res.status + ')');
      setStatus(status, msg);
      reset();
      return;
    }

    const eta = body?.etaSeconds || 45;
    setStatus(status, 'refreshing… new data in ~' + eta + 's. Reloading shortly.');
    // Reload after eta + a small buffer so the new snapshot has time to land
    // and the SW (KB-0021 auto-reload pattern) picks up any code changes.
    setTimeout(() => { window.location.reload(); }, (eta + 8) * 1000);
    reset();
  });
}

function setStatus(el, text) {
  if (!el) return;
  el.textContent = text ? ' — ' + text : '';
}
