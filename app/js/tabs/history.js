/**
 * History tab — v3
 *
 * Phase B7: TOC + collapsible sections (pattern ported from pickleball KB-0040 Phase L1).
 * "On This Day" stays open by default; the rest collapses to keep the page short.
 */

import { loadFranchises, loadHistoryLinks, loadHistoricalVideos, loadStrangePlays } from '../data-loader.js';

export async function renderHistory(root, snap) {
  if (!root) return;
  root.innerHTML = `<h1>History</h1><div class="card"><p class="loading">Loading…</p></div>`;

  let franchisesData, historyLinks, videos, strangePlays;
  try {
    [franchisesData, historyLinks, videos, strangePlays] = await Promise.all([
      loadFranchises(),
      loadHistoryLinks().catch(() => null),
      loadHistoricalVideos().catch(() => null),
      loadStrangePlays().catch(() => null),
    ]);
  } catch (err) {
    root.innerHTML = `<h1>History</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const franchises = franchisesData.franchises || [];
  const events = snap?.onThisDay || [];
  const franchiseLinks = historyLinks?.franchiseLinks || {};
  const moments = videos?.moments || [];
  const lineageFranchises = franchises
    .filter(f => (f.history || []).length > 1)
    .sort((a, b) => a.founded - b.founded);
  const allFranchises = franchises.slice().sort((a, b) => a.founded - b.founded);

  const sections = [
    { id: 'hist-on-this-day', title: 'On This Day',                                                                  body: renderOnThisDayBody(events), open: true },
    { id: 'hist-iconic',      title: 'Iconic Moments',                                                               body: renderIconicMomentsBody(moments) },
    { id: 'hist-strange',     title: `Strangest Plays in History (${(strangePlays?.plays || []).length})`,           body: renderStrangePlaysBody(strangePlays?.plays || []) },
    { id: 'hist-lineages',    title: 'Franchise Lineages',                                                           body: renderLineagesBody(lineageFranchises, franchiseLinks) },
    { id: 'hist-all',         title: `All Franchises (${allFranchises.length})`,                                     body: renderAllFranchisesBody(allFranchises, franchiseLinks) },
  ].filter(s => s.body).map((s, i) => ({ ...s, num: i + 1 }));

  root.innerHTML = `
    <h1>History</h1>

    <div class="tab-callout info">
      <div class="tab-callout-label">Looking for player stories?</div>
      Legends (Vin Scully, Josh Gibson, Ken Griffey Jr.) and brothers in baseball (DiMaggios, Alous, Waners) live on the <strong><a href="#" onclick="document.querySelector('[data-tab=stories]').click(); return false;">Stories</a></strong> tab — fully searchable and filterable.
    </div>

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
    <nav class="tab-toc" aria-label="History tab sections">
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

function renderOnThisDayBody(events) {
  if (!events.length) {
    return `
      <div class="card">
        <p class="muted">No curated events for today's date yet. Expand the seed at <code>data/master/on-this-day-seed.json</code>.</p>
      </div>
    `;
  }
  return `
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

function renderStrangePlaysBody(plays) {
  if (!plays.length) return '';
  return `
    <p class="muted" style="margin-bottom: 1rem;">
      Oddities, bizarre feats, and you-have-to-see-it-to-believe-it moments.
    </p>
    <div class="grid grid-2">
      ${plays.map(p => `
        <div class="card strange-play">
          <div class="iconic-header">
            <span class="year-badge">${escapeHtml(p.date || p.era || '')}</span>
            <h3>${escapeHtml(p.title || '')}</h3>
          </div>
          ${p.teams?.length ? `<div class="muted">${escapeHtml(p.teams.join(' vs '))}</div>` : ''}
          <p>${escapeHtml(p.description || '')}</p>
          ${renderLinkPills(p.links)}
        </div>
      `).join('')}
    </div>
  `;
}

function renderIconicMomentsBody(moments) {
  if (!moments.length) return '';
  return `
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

function renderLineagesBody(lineageFranchises, franchiseLinks) {
  if (!lineageFranchises.length) return '';
  return `
    <p class="muted" style="margin-bottom: 1rem;">
      Franchises with relocations or major name changes. Click any "Explore" link to dive into that team's full history.
    </p>
    <div class="grid grid-2">
      ${lineageFranchises.map(f => renderLineageCard(f, franchiseLinks[String(f.id)])).join('')}
    </div>
  `;
}

function renderAllFranchisesBody(allFranchises, franchiseLinks) {
  if (!allFranchises.length) return '';
  return `
    <div class="grid grid-3">
      ${allFranchises.map(f => renderCompactFranchise(f, franchiseLinks[String(f.id)])).join('')}
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
