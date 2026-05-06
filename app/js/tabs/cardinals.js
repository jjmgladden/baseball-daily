/**
 * Cardinals tab — v3
 *
 * Phase B7: TOC + collapsible sections (pattern ported from pickleball KB-0040 Phase L1).
 * Snapshot panel stays pinned at top; the rest collapses into numbered sections
 * with a "Jump to section" TOC for fast nav.
 */

import { loadMaster, loadFranchises, loadCardinalsLinks } from '../data-loader.js';
import { renderRecentForm } from '../components/streak.js';

const CARDS_ID = 138;

export async function renderCardinals(root, snap) {
  if (!root) return;
  root.innerHTML = `<h1>St. Louis Cardinals</h1><div class="card"><p class="loading">Loading Cardinals content…</p></div>`;

  let deep, franchises, links;
  try {
    [deep, franchises, links] = await Promise.all([
      loadMaster('cardinals-deep.json'),
      loadFranchises(),
      loadCardinalsLinks().catch(() => null),   // graceful if not yet present
    ]);
  } catch (err) {
    root.innerHTML = `<h1>St. Louis Cardinals</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const franchise = (franchises.franchises || []).find(f => f.id === CARDS_ID);

  const sections = [
    { id: 'cards-legends',    title: 'Legends — Dig Deeper', body: renderLegendsDeepDiveBody(links),                     open: true },
    { id: 'cards-retired',    title: 'Retired Numbers',      body: renderRetiredNumbersBody(deep.retiredNumbers || []) },
    { id: 'cards-seasons',    title: 'Historic Seasons',     body: renderHistoricSeasonsBody(deep.historicSeasons || []) },
    { id: 'cards-hofers',     title: 'Hall of Famers',       body: renderHallOfFamersBody(deep.hallOfFamers || []) },
    { id: 'cards-traditions', title: 'Traditions',           body: renderTraditionsBody(deep.traditions || []) },
  ].filter(s => s.body).map((s, i) => ({ ...s, num: i + 1 })); // drop empty sections then renumber so TOC reads cleanly

  root.innerHTML = `
    <h1>St. Louis Cardinals</h1>
    ${renderSnapshotPanel(snap, franchise)}
    ${tocHtml(sections)}
    ${sections.map(sectionHtml).join('')}
  `;
}

function tocHtml(sections) {
  if (!sections.length) return '';
  const items = sections.map(s =>
    `<li><a href="#${s.id}">${s.num}. ${escapeHtml(s.title)}</a></li>`
  ).join('');
  return `
    <nav class="tab-toc" aria-label="Cardinals tab sections">
      <div class="tab-toc-title">Jump to section</div>
      <ol>${items}</ol>
    </nav>
  `;
}

function sectionHtml(s) {
  const open = s.open ? ' open' : '';
  return `
    <details class="tab-section" id="${s.id}"${open}>
      <summary>${s.num}. ${escapeHtml(s.title)}</summary>
      <div class="tab-section-body">${s.body}</div>
    </details>
  `;
}

function renderSnapshotPanel(snap, franchise) {
  const cards = snap?.cardinals || {};
  const latestGame = cards.game;
  const injuryCount = cards.injuries?.length || 0;
  const form = cards.recentForm;

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

function renderLegendsDeepDiveBody(links) {
  if (!links || !links.legends?.length) return '';

  // Featured entries (those with featured: true) render first with a deep-dive card
  const featured = links.legends.filter(l => l.featured);
  const standard = links.legends.filter(l => !l.featured);

  return `
    <p class="muted" style="margin-bottom: 1rem;">
      External links to authoritative sources — Baseball Reference, SABR BioProject, Hall of Fame, MLB.com, Wikipedia, and curated YouTube search.
    </p>

    ${featured.map(renderFeaturedLegend).join('')}

    <div class="grid grid-2">
      ${standard.map(renderLegendCard).join('')}
    </div>
  `;
}

function renderFeaturedLegend(l) {
  return `
    <div class="card legend-featured">
      <div class="legend-featured-header">
        <h3>${escapeHtml(l.name)}${l.nickname ? ` <span class="muted">"${escapeHtml(l.nickname)}"</span>` : ''}</h3>
        <div class="muted">${escapeHtml(l.position || '')} · ${escapeHtml(l.stlYears || '')}</div>
      </div>
      ${l.personalNote ? `<div class="legend-personal-note">${escapeHtml(l.personalNote)}</div>` : ''}
      <p class="legend-headline">${escapeHtml(l.headline || '')}</p>
      ${l.deepDive ? renderDeepDive(l.deepDive) : ''}
      ${renderLinkPills(l.links)}
    </div>
  `;
}

function renderDeepDive(dd) {
  const rows = [];
  if (dd.born)         rows.push(['Born',         dd.born]);
  if (dd.died)         rows.push(['Died',         dd.died]);
  if (dd.stlCareer)    rows.push(['Cardinals',    dd.stlCareer]);
  if (dd.twelveRBIgame)rows.push(['12-RBI game',  dd.twelveRBIgame]);
  if (dd.mvp1928)      rows.push(['1928 MVP',     dd.mvp1928]);
  if (dd.worldSeries)  rows.push(['World Series', dd.worldSeries]);
  if (dd.laterYears)   rows.push(['Later years',  dd.laterYears]);
  if (dd.hof)          rows.push(['Hall of Fame', dd.hof]);
  if (dd.legacy)       rows.push(['Legacy',       dd.legacy]);

  if (!rows.length) return '';
  return `
    <dl class="legend-deepdive">
      ${rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('')}
    </dl>
  `;
}

function renderLegendCard(l) {
  return `
    <div class="card">
      <h3>${escapeHtml(l.name)}${l.nickname ? ` <span class="muted">"${escapeHtml(l.nickname)}"</span>` : ''}</h3>
      <div class="muted">${escapeHtml(l.position || '')} · ${escapeHtml(l.stlYears || '')}</div>
      <p>${escapeHtml(l.headline || '')}</p>
      ${renderLinkPills(l.links)}
    </div>
  `;
}

function renderLinkPills(links) {
  if (!links?.length) return '';
  return `
    <div class="link-pills">
      ${links.map(lk => `<a href="${escapeAttr(lk.url)}" target="_blank" rel="noopener">${escapeHtml(lk.label)} →</a>`).join('')}
    </div>
  `;
}

function renderRetiredNumbersBody(nums) {
  if (!nums.length) return '';
  return `
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

function renderHistoricSeasonsBody(seasons) {
  if (!seasons.length) return '';
  return `
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

function renderHallOfFamersBody(hofers) {
  if (!hofers.length) return '';
  return `
    <p class="muted" style="margin: 0 0 0.75rem;">${hofers.length} inductees with significant time as Cardinals.</p>
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

function renderTraditionsBody(traditions) {
  if (!traditions.length) return '';
  return `
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

function escapeAttr(s) { return escapeHtml(s); }
