/**
 * Cardinals tab — v1
 *
 * Dedicated Cardinals content: franchise snapshot, retired numbers grid,
 * Hall of Famers roll, historic seasons, traditions, and a panel pulling
 * the latest Cardinals-specific data from today's snapshot (record, recent
 * form, injuries).
 */

import { loadMaster, loadFranchises } from '../data-loader.js';
import { renderRecentForm } from '../components/streak.js';

const CARDS_ID = 138;

export async function renderCardinals(root, snap) {
  if (!root) return;
  root.innerHTML = `<h1>St. Louis Cardinals</h1><div class="card"><p class="loading">Loading Cardinals content…</p></div>`;

  let deep, franchises;
  try {
    [deep, franchises] = await Promise.all([
      loadMaster('cardinals-deep.json'),
      loadFranchises(),
    ]);
  } catch (err) {
    root.innerHTML = `<h1>St. Louis Cardinals</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const franchise = (franchises.franchises || []).find(f => f.id === CARDS_ID);

  root.innerHTML = `
    <h1>St. Louis Cardinals</h1>
    ${renderSnapshotPanel(snap, franchise)}
    ${renderRetiredNumbers(deep.retiredNumbers || [])}
    ${renderHistoricSeasons(deep.historicSeasons || [])}
    ${renderHallOfFamers(deep.hallOfFamers || [])}
    ${renderTraditions(deep.traditions || [])}
  `;
}

function renderSnapshotPanel(snap, franchise) {
  const cards = snap?.cardinals || {};
  const latestGame = cards.game;
  const injuryCount = cards.injuries?.length || 0;
  const form = cards.recentForm;

  // Find the Cardinals row in standings if present
  let standingsLine = null;
  if (snap?.standings) {
    for (const div of Object.values(snap.standings)) {
      const t = (div.teams || []).find(x => x.teamId === CARDS_ID);
      if (t) {
        standingsLine = `${t.wins}-${t.losses} · ${t.winPct} · ${t.gamesBack} GB · division rank ${t.divisionRank}`;
        break;
      }
    }
  }

  return `
    <div class="card pinned-cards">
      <h2>Franchise Snapshot</h2>
      <div class="grid grid-2">
        <div>
          <div class="muted">Record (regular season)</div>
          <div><strong>${standingsLine || '—'}</strong></div>
          <div class="muted" style="margin-top: 0.5rem;">World Series titles</div>
          <div><strong>${franchise?.worldSeries?.won ?? 11}</strong> — ${(franchise?.worldSeries?.years || []).join(', ')}</div>
        </div>
        <div>
          <div class="muted">Yesterday</div>
          <div>${latestGame ? formatGameResult(latestGame) : 'No game'}</div>
          <div class="muted" style="margin-top: 0.5rem;">On the IL</div>
          <div><strong>${injuryCount}</strong> player${injuryCount === 1 ? '' : 's'}</div>
        </div>
      </div>
    </div>
    ${form ? renderRecentForm(form, 'Cardinals') : ''}
  `;
}

function formatGameResult(g) {
  const homeIsUs = g.home?.id === CARDS_ID;
  const us = homeIsUs ? g.home : g.away;
  const them = homeIsUs ? g.away : g.home;
  if (us?.score == null) return `${homeIsUs ? 'vs' : '@'} ${escapeHtml(them?.name || '')} — ${escapeHtml(g.status || '')}`;
  const win = us.score > them.score;
  return `${win ? 'W' : 'L'} ${us.score}-${them.score} ${homeIsUs ? 'vs' : '@'} ${escapeHtml(them?.name || '')}`;
}

function renderRetiredNumbers(nums) {
  if (!nums.length) return '';
  return `
    <h2>Retired Numbers</h2>
    <div class="card">
      <div class="retired-grid">
        ${nums.map(n => `
          <div class="retired-slot">
            <div class="retired-number">${escapeHtml(n.number)}</div>
            <div class="retired-name">${escapeHtml(n.player)}</div>
            <div class="muted retired-note">${escapeHtml(n.note || '')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderHistoricSeasons(seasons) {
  if (!seasons.length) return '';
  return `
    <h2>Historic Seasons</h2>
    <div class="grid grid-2">
      ${seasons.map(s => `
        <div class="card">
          <div class="season-header">
            <span class="season-year">${escapeHtml(String(s.year))}</span>
            <span class="season-finish muted">${escapeHtml(s.finish || '')}</span>
          </div>
          <h3>${escapeHtml(s.headline || '')}</h3>
          <p>${escapeHtml(s.description || '')}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderHallOfFamers(hofers) {
  if (!hofers.length) return '';
  return `
    <h2>Hall of Famers <span class="muted">(${hofers.length})</span></h2>
    <div class="card">
      <table class="hof-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Pos</th>
            <th>With STL</th>
            <th class="num">HOF</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${hofers.map(h => `
            <tr>
              <td><strong>${escapeHtml(h.name)}</strong></td>
              <td>${escapeHtml(h.position || '')}</td>
              <td>${escapeHtml(h.stlYears || '')}</td>
              <td class="num">${h.hofYear || '—'}</td>
              <td class="muted">${escapeHtml(h.note || '')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTraditions(traditions) {
  if (!traditions.length) return '';
  return `
    <h2>Traditions</h2>
    <div class="grid grid-2">
      ${traditions.map(t => `
        <div class="card">
          <h3>${escapeHtml(t.name)}</h3>
          <p>${escapeHtml(t.description)}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
