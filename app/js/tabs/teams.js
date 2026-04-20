/**
 * Teams tab — v1
 *
 * Grid of all 30 franchises, click → detail card with history timeline,
 * championships, notable eras, ballpark.
 */

import { loadFranchises } from '../data-loader.js';

export async function renderTeams(root) {
  if (!root) return;
  root.innerHTML = `<h1>Teams</h1><div class="card"><p class="loading">Loading franchises…</p></div>`;

  let data;
  try { data = await loadFranchises(); }
  catch (err) {
    root.innerHTML = `
      <h1>Teams</h1>
      <div class="card">
        <p class="muted">Failed to load franchises: ${escapeHtml(err.message || '')}</p>
      </div>
    `;
    return;
  }

  const franchises = (data.franchises || []).slice().sort((a, b) => a.name.localeCompare(b.name));

  root.innerHTML = `
    <h1>Teams <span class="muted">(${franchises.length})</span></h1>
    <div class="grid grid-3" id="team-grid">
      ${franchises.map(f => renderTeamCard(f)).join('')}
    </div>
    <div id="team-detail"></div>
  `;

  const grid = root.querySelector('#team-grid');
  const detail = root.querySelector('#team-detail');
  grid.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id, 10);
      const f = franchises.find(x => x.id === id);
      if (f) {
        detail.innerHTML = renderTeamDetail(f);
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function renderTeamCard(f) {
  const wsCount = f.worldSeries?.won ?? 0;
  return `
    <div class="team-card" data-id="${f.id}">
      <div class="team-card-name">${escapeHtml(f.name)}</div>
      <div class="muted">${escapeHtml(f.abbrev)} · ${escapeHtml(f.league)} ${escapeHtml(f.division)}</div>
      <div class="team-card-stats">
        <span><strong>${wsCount}</strong> <span class="muted">WS</span></span>
        <span><strong>${f.pennants ?? 0}</strong> <span class="muted">pennants</span></span>
        <span><strong>${new Date().getFullYear() - f.founded}</strong> <span class="muted">years</span></span>
      </div>
    </div>
  `;
}

function renderTeamDetail(f) {
  const wsYears = (f.worldSeries?.years || []).join(', ') || 'None';
  return `
    <div class="card pinned" style="border-left: 4px solid var(--accent-info);">
      <h2>${escapeHtml(f.name)} <span class="muted">· ${escapeHtml(f.abbrev)}</span></h2>
      <div class="muted">Founded ${f.founded} · ${escapeHtml(f.league)} ${escapeHtml(f.division)}${f.ballpark?.current ? ' · ' + escapeHtml(f.ballpark.current) : ''}</div>

      <h3 style="margin-top: 1rem;">World Series</h3>
      <div><strong>${f.worldSeries?.won ?? 0}</strong> titles · <span class="muted">${escapeHtml(wsYears)}</span></div>
      <div class="muted">${f.pennants ?? 0} pennants</div>

      <h3 style="margin-top: 1.25rem;">Franchise History</h3>
      <ul class="franchise-timeline">
        ${(f.history || []).map(h => `
          <li>
            <span class="year-badge">${h.year}</span>
            <div>
              <strong>${escapeHtml(h.name)}</strong>
              ${h.league ? ` <span class="muted">(${escapeHtml(h.league)})</span>` : ''}
              ${h.note ? `<div class="muted">${escapeHtml(h.note)}</div>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>

      ${(f.notableEras || []).length > 0 ? `
        <h3 style="margin-top: 1.25rem;">Notable Eras</h3>
        <ul class="era-list">
          ${f.notableEras.map(e => `
            <li>
              <strong>${escapeHtml(e.name)}</strong>
              <span class="muted">${escapeHtml(e.years || '')}</span>
              <div>${escapeHtml(e.description)}</div>
            </li>
          `).join('')}
        </ul>
      ` : ''}

      ${f.note ? `<p class="muted" style="margin-top: 1rem;">${escapeHtml(f.note)}</p>` : ''}
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
