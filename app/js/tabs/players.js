/**
 * Players tab — v2
 *
 * Universal search + favorites + side-by-side comparison.
 */

import { loadPlayerIndex } from '../data-loader.js';
import { getFavorites, isFavorite, toggleFavorite } from '../components/favorites.js';
import { addToComparison, renderComparison, resetComparison } from '../components/comparison.js';

const MAX_RESULTS = 50;

export async function renderPlayers(root) {
  if (!root) return;
  root.innerHTML = `<h1>Players</h1><div class="card"><p class="loading">Loading player index…</p></div>`;

  let index;
  try { index = await loadPlayerIndex(); }
  catch (err) {
    root.innerHTML = `
      <h1>Players</h1>
      <div class="card">
        <h3>Player index not yet built</h3>
        <p class="muted">Run the one-time build to create <code>data/master/player-index.json</code>:</p>
        <pre>node scripts/build-player-index.js</pre>
        <p class="muted">Error: ${escapeHtml(err.message || '')}</p>
      </div>
    `;
    return;
  }

  const players = index.players || [];

  root.innerHTML = `
    <h1>Players <span class="muted">(${players.length.toLocaleString()} indexed)</span></h1>
    <div class="card">
      <div class="search-bar">
        <input type="search" id="player-search"
               class="search-input"
               placeholder="Search any MLB player (1871–present)..."
               autocomplete="off"
               aria-label="Player search" />
      </div>
      <p class="muted" style="margin-top: 0.5rem;">
        Results sorted by career length. Click a player name for details · ★ to favorite · ⇄ to add to comparison.
      </p>
    </div>

    <div id="favorites-panel"></div>
    <div id="comparison-panel"></div>
    <div id="player-results"></div>
    <div id="player-detail"></div>
  `;

  const input = root.querySelector('#player-search');
  const resultsEl = root.querySelector('#player-results');
  const detailEl = root.querySelector('#player-detail');
  const favEl = root.querySelector('#favorites-panel');
  const cmpEl = root.querySelector('#comparison-panel');

  const refreshFavorites = () => {
    const favs = getFavorites().map(id => players.find(p => p.mlbamId === id)).filter(Boolean);
    favEl.innerHTML = favs.length ? `
      <h2>Favorites <span class="muted">(${favs.length})</span></h2>
      <div class="grid grid-3">${favs.map(renderPlayerCard).join('')}</div>
    ` : '';
    wireCards(favEl, players, detailEl, refreshFavorites, refreshComparison);
  };

  const refreshComparison = () => {
    cmpEl.innerHTML = renderComparison();
  };

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      runSearch(input.value, players, resultsEl);
      wireCards(resultsEl, players, detailEl, refreshFavorites, refreshComparison);
    }, 200);
  });

  // Initial render
  const featured = players.slice(0, 24);
  resultsEl.innerHTML = renderResults(featured, 'Featured — longest MLB careers');
  wireCards(resultsEl, players, detailEl, refreshFavorites, refreshComparison);
  refreshFavorites();
  refreshComparison();
}

function runSearch(query, players, resultsEl) {
  const q = query.trim().toLowerCase();
  if (!q) {
    const featured = players.slice(0, 24);
    resultsEl.innerHTML = renderResults(featured, 'Featured — longest MLB careers');
    return;
  }
  const hits = [];
  for (const p of players) {
    const first = (p.nameFirst || '').toLowerCase();
    const last = (p.nameLast || '').toLowerCase();
    if (`${first} ${last}`.includes(q) || last.startsWith(q) || first.startsWith(q)) {
      hits.push(p);
      if (hits.length >= MAX_RESULTS) break;
    }
  }
  resultsEl.innerHTML = renderResults(hits, `Search results (${hits.length})`);
}

function renderResults(list, heading) {
  if (!list.length) return `<div class="card"><p class="muted">No matches.</p></div>`;
  return `
    <h2>${escapeHtml(heading)}</h2>
    <div class="grid grid-3">${list.map(renderPlayerCard).join('')}</div>
  `;
}

function renderPlayerCard(p) {
  const fav = isFavorite(p.mlbamId);
  const place = [p.birth?.city, p.birth?.state, p.birth?.country]
    .filter(Boolean)
    .filter(x => x !== 'USA' || !p.birth?.state)  // drop USA when state present
    .join(', ');
  return `
    <div class="player-card" data-mlbam="${p.mlbamId || ''}" data-bbref="${p.bbrefId || ''}">
      <div class="player-card-head">
        <div class="player-name">${escapeHtml(p.nameFirst)} ${escapeHtml(p.nameLast)}</div>
        <div class="player-actions">
          <button class="btn-star ${fav ? 'active' : ''}" data-action="fav" title="${fav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">★</button>
          <button class="btn-compare" data-action="cmp" title="Add to comparison" aria-label="Compare">⇄</button>
        </div>
      </div>
      <div class="muted">${p.mlbFirst}–${p.mlbLast} · ${p.yearsInMLB} yr${p.yearsInMLB === 1 ? '' : 's'}</div>
      ${place ? `<div class="muted" style="font-size: 0.8rem;">${escapeHtml(place)}</div>` : ''}
    </div>
  `;
}

function wireCards(scope, players, detailEl, refreshFavs, refreshCmp) {
  if (!scope) return;
  scope.querySelectorAll('.player-card').forEach(card => {
    const mlbam = parseInt(card.dataset.mlbam, 10);
    const bbref = card.dataset.bbref;
    const p = players.find(x => (mlbam && x.mlbamId === mlbam) || (bbref && x.bbrefId === bbref));
    if (!p) return;

    // Star button
    card.querySelector('[data-action="fav"]')?.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(p.mlbamId);
      refreshFavs();
      // also update this card's star without refetching the whole list
      e.currentTarget.classList.toggle('active');
    });

    // Compare button
    card.querySelector('[data-action="cmp"]')?.addEventListener('click', e => {
      e.stopPropagation();
      addToComparison(p);
      refreshCmp();
    });

    // Rest of the card -> detail
    card.addEventListener('click', () => {
      detailEl.innerHTML = renderPlayerDetail(p);
      detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderPlayerDetail(p) {
  const birthPlace = [p.birth?.city, p.birth?.state, p.birth?.country].filter(Boolean).join(', ');
  const birthDate = p.birth?.year ? formatDate(p.birth.year, p.birth.month, p.birth.day) : null;
  const deathDate = p.death?.year ? formatDate(p.death.year, p.death.month, p.death.day) : null;
  const mlbLink = p.mlbamId ? `https://www.mlb.com/player/${p.mlbamId}` : null;
  const bbrefLink = p.bbrefId ? `https://www.baseball-reference.com/players/${p.bbrefId[0]}/${p.bbrefId}.shtml` : null;

  return `
    <div class="card player-detail">
      <h2>${escapeHtml(p.nameFirst)} ${escapeHtml(p.nameLast)}${p.nameNick ? ` <span class="muted">"${escapeHtml(p.nameNick)}"</span>` : ''}</h2>
      ${p.nameGiven && p.nameGiven !== `${p.nameFirst} ${p.nameLast}` ? `<div class="muted">Given: ${escapeHtml(p.nameGiven)}</div>` : ''}
      <div class="grid grid-2" style="margin-top: 1rem;">
        <div>
          <h3>Bio</h3>
          <div>${birthDate ? `<strong>Born:</strong> ${escapeHtml(birthDate)}` : ''}${birthPlace ? ` · ${escapeHtml(birthPlace)}` : ''}</div>
          ${deathDate ? `<div><strong>Died:</strong> ${escapeHtml(deathDate)}</div>` : ''}
        </div>
        <div>
          <h3>MLB Career</h3>
          <div><strong>${p.mlbFirst}–${p.mlbLast}</strong> · ${p.yearsInMLB} season${p.yearsInMLB === 1 ? '' : 's'}</div>
          ${p.mlbamId ? `<div class="muted">MLBAM ID: ${p.mlbamId}</div>` : ''}
          ${p.bbrefId ? `<div class="muted">BBRef: ${escapeHtml(p.bbrefId)}</div>` : ''}
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <h3>External</h3>
        <div class="external-links">
          ${mlbLink ? `<a href="${mlbLink}" target="_blank" rel="noopener">MLB.com profile →</a>` : ''}
          ${bbrefLink ? `<a href="${bbrefLink}" target="_blank" rel="noopener">Baseball Reference →</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

function formatDate(year, month, day) {
  if (!year) return null;
  if (!month) return String(year);
  const mm = String(month).padStart(2, '0');
  if (!day) return `${year}-${mm}`;
  return `${year}-${mm}-${String(day).padStart(2, '0')}`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
