/**
 * History tab — v2
 *
 * Sections:
 *   - On-This-Day (from today's snapshot)
 *   - Iconic Moments (curated historical videos/links)
 *   - Franchise Lineages (multi-lineage teams with Explore link-outs)
 *   - All Franchises (compact list with link-outs)
 */

import { loadFranchises, loadHistoryLinks, loadHistoricalVideos, loadLegendsGeneral, loadBrothers } from '../data-loader.js';

export async function renderHistory(root, snap) {
  if (!root) return;
  root.innerHTML = `<h1>History</h1><div class="card"><p class="loading">Loading…</p></div>`;

  let franchisesData, historyLinks, videos, legends, brothers;
  try {
    [franchisesData, historyLinks, videos, legends, brothers] = await Promise.all([
      loadFranchises(),
      loadHistoryLinks().catch(() => null),
      loadHistoricalVideos().catch(() => null),
      loadLegendsGeneral().catch(() => null),
      loadBrothers().catch(() => null),
    ]);
  } catch (err) {
    root.innerHTML = `<h1>History</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const franchises = franchisesData.franchises || [];
  const events = snap?.onThisDay || [];
  const franchiseLinks = historyLinks?.franchiseLinks || {};
  const moments = videos?.moments || [];

  root.innerHTML = `
    <h1>History</h1>

    ${renderOnThisDay(events)}

    ${renderIconicMoments(moments)}

    ${renderGeneralLegends(legends?.legends || [])}

    ${renderBrothers(brothers?.entries || [])}

    <h2>Franchise Lineages</h2>
    <p class="muted" style="margin-bottom: 1rem;">
      Franchises with relocations or major name changes. Click any "Explore" link to dive into that team's full history.
    </p>
    <div class="grid grid-2">
      ${franchises
        .filter(f => (f.history || []).length > 1)
        .sort((a, b) => a.founded - b.founded)
        .map(f => renderLineageCard(f, franchiseLinks[String(f.id)]))
        .join('')}
    </div>

    <h2 style="margin-top: 2rem;">All Franchises <span class="muted">(${franchises.length})</span></h2>
    <div class="grid grid-3">
      ${franchises.slice().sort((a, b) => a.founded - b.founded).map(f => renderCompactFranchise(f, franchiseLinks[String(f.id)])).join('')}
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

function renderGeneralLegends(legends) {
  if (!legends.length) return '';
  const byCategory = {};
  for (const l of legends) {
    const cat = l.category || 'player';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(l);
  }
  const categoryLabels = {
    player: 'Players',
    coach: 'Coaches & Managers',
    executive: 'Executives & Pioneers',
    broadcaster: 'Broadcasters',
    'negro-leagues': 'Negro Leagues',
    umpire: 'Umpires',
  };
  const order = ['player', 'negro-leagues', 'coach', 'executive', 'broadcaster', 'umpire'];
  const sections = order.filter(c => byCategory[c]).map(c => `
    <h3 style="margin-top: 1.25rem;">${escapeHtml(categoryLabels[c] || c)} <span class="muted">(${byCategory[c].length})</span></h3>
    <div class="grid grid-2">
      ${byCategory[c].map(renderLegendCard).join('')}
    </div>
  `).join('');

  return `
    <h2>Legends <span class="muted">(${legends.length})</span></h2>
    <p class="muted" style="margin-bottom: 1rem;">
      Curated external references for Hall of Fame players, managers, executives, broadcasters, and Negro Leagues stars. Expanded weekly via approved curation batches.
    </p>
    ${sections}
  `;
}

function renderLegendCard(l) {
  return `
    <div class="card">
      <h3>${escapeHtml(l.name)}${l.nickname ? ` <span class="muted">"${escapeHtml(l.nickname)}"</span>` : ''}</h3>
      <div class="muted">${escapeHtml(l.role || '')}${l.era ? ` · ${escapeHtml(l.era)}` : ''}</div>
      <p>${escapeHtml(l.headline || '')}</p>
      ${renderLinkPills(l.links)}
    </div>
  `;
}

function renderBrothers(entries) {
  if (!entries.length) return '';
  return `
    <h2>Brothers and Families <span class="muted">(${entries.length})</span></h2>
    <p class="muted" style="margin-bottom: 1rem;">
      Brother pairs, trios, and larger family combinations who played MLB.
    </p>
    <div class="grid grid-2">
      ${entries.map(b => `
        <div class="card">
          <h3>${escapeHtml(b.title)}</h3>
          <div class="muted">${escapeHtml(b.era || '')}</div>
          <p>${escapeHtml(b.headline || '')}</p>
          ${b.members?.length ? `
            <ul class="brothers-members">
              ${b.members.map(m => `
                <li><strong>${escapeHtml(m.name)}</strong> — <span class="muted">${escapeHtml(m.note || '')}</span></li>
              `).join('')}
            </ul>
          ` : ''}
          ${renderLinkPills(b.links)}
        </div>
      `).join('')}
    </div>
  `;
}

function renderIconicMoments(moments) {
  if (!moments.length) return '';
  return `
    <h2>Iconic Moments</h2>
    <p class="muted" style="margin-bottom: 1rem;">
      Curated historical plays and milestones. Each entry links to video footage and authoritative sources.
    </p>
    <div class="grid grid-2">
      ${moments.map(m => `
        <div class="card iconic-moment">
          <div class="iconic-header">
            <span class="year-badge">${escapeHtml(m.date || m.era || '')}</span>
            <h3>${escapeHtml(m.title)}</h3>
          </div>
          ${m.teams?.length ? `<div class="muted">${escapeHtml(m.teams.join(' vs '))}</div>` : ''}
          <p>${escapeHtml(m.description || '')}</p>
          ${renderLinkPills(m.links)}
        </div>
      `).join('')}
    </div>
  `;
}

function renderLineageCard(f, links) {
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
      ${renderFranchiseLinks(links)}
    </div>
  `;
}

function renderCompactFranchise(f, links) {
  return `
    <div class="lineage-compact">
      <div><strong>${escapeHtml(f.name)}</strong></div>
      <div class="muted">${f.founded} · ${escapeHtml(f.league)}</div>
      ${renderFranchiseLinks(links, true)}
    </div>
  `;
}

function renderFranchiseLinks(links, compact = false) {
  if (!links) return '';
  const pills = [];
  if (links.bbref)     pills.push({ label: 'BBref',     url: links.bbref });
  if (links.mlb)       pills.push({ label: 'MLB.com',   url: links.mlb });
  if (links.wikipedia) pills.push({ label: 'Wiki',      url: links.wikipedia });
  if (links.youtube)   pills.push({ label: 'YouTube',   url: links.youtube });
  if (!pills.length) return '';
  return `
    <div class="link-pills ${compact ? 'link-pills-compact' : ''}" style="margin-top: ${compact ? '0.25rem' : '0.5rem'};">
      ${pills.map(p => `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener">${escapeHtml(p.label)} →</a>`).join('')}
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

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr(s) { return escapeHtml(s); }
