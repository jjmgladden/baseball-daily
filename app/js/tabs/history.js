/**
 * History tab — v1
 *
 * Franchise history tree + On-This-Day panel.
 * Franchise tree highlights relocations and name changes (e.g.
 * Washington Senators → Minnesota Twins / Texas Rangers).
 */

import { loadFranchises } from '../data-loader.js';

export async function renderHistory(root, snap) {
  if (!root) return;
  root.innerHTML = `<h1>History</h1><div class="card"><p class="loading">Loading…</p></div>`;

  let data;
  try { data = await loadFranchises(); }
  catch (err) {
    root.innerHTML = `<h1>History</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const franchises = data.franchises || [];
  const events = snap?.onThisDay || [];

  root.innerHTML = `
    <h1>History</h1>

    ${renderOnThisDay(events)}

    <h2>Franchise Lineages</h2>
    <p class="muted" style="margin-bottom: 1rem;">
      Franchises with relocations or major name changes. Original-era names in parentheses.
    </p>
    <div class="grid grid-2">
      ${franchises
        .filter(f => (f.history || []).length > 1)
        .sort((a, b) => a.founded - b.founded)
        .map(f => renderLineageCard(f))
        .join('')}
    </div>

    <h2 style="margin-top: 2rem;">All Franchises</h2>
    <div class="grid grid-3">
      ${franchises.slice().sort((a, b) => a.founded - b.founded).map(f => `
        <div class="lineage-compact">
          <div><strong>${escapeHtml(f.name)}</strong></div>
          <div class="muted">${f.founded} · ${escapeHtml(f.league)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLineageCard(f) {
  return `
    <div class="card">
      <h3>${escapeHtml(f.name)}</h3>
      <div class="muted" style="margin-bottom: 0.5rem;">${f.founded} · ${escapeHtml(f.league)} ${escapeHtml(f.division)}</div>
      <ol class="franchise-timeline">
        ${f.history.map(h => `
          <li>
            <span class="year-badge">${h.year}</span>
            <div>
              <strong>${escapeHtml(h.name)}</strong>
              ${h.league ? ` <span class="muted">(${escapeHtml(h.league)})</span>` : ''}
              ${h.note ? `<div class="muted">${escapeHtml(h.note)}</div>` : ''}
            </div>
          </li>
        `).join('')}
      </ol>
    </div>
  `;
}

function renderOnThisDay(events) {
  if (!events.length) {
    return `
      <h2>On This Day</h2>
      <div class="card">
        <p class="muted">No curated events for today's date yet. Expand the seed at <code>data/master/on-this-day-seed.json</code>.</p>
      </div>
    `;
  }
  return `
    <h2>On This Day</h2>
    <div class="card">
      <ul class="on-this-day-list">
        ${events.map(e => `
          <li>
            <span class="year-badge">${escapeHtml(String(e.year || '—'))}</span>
            <div>
              <strong>${escapeHtml(e.title || '')}</strong>
              ${e.description ? `<div class="muted">${escapeHtml(e.description)}</div>` : ''}
              ${e.tags?.length ? `<div class="tag-row">${e.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
