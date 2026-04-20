/**
 * Stories tab — v4 (unified content hub)
 *
 * Option A: merges three content sources under one browsable tab
 * with shared filtering (search, era, category, type, read/unread,
 * favorites, random).
 *
 * Sources:
 *   stories.json           -> type: 'narrative'  (long-form with body text)
 *   legends-general.json   -> type: 'legend'     (link cards)
 *   brothers.json          -> type: 'brothers'   (family groupings)
 *
 * IDs are unique across all three sources so read/fav tracking works
 * without collision. localStorage is shared (story-state.js).
 */

import { loadStories, loadLegendsGeneral, loadBrothers } from '../data-loader.js';
import { readStore, favStore } from '../components/story-state.js';

const state = {
  items: [],         // merged cross-type list
  filters: {
    search: '',
    type: 'all',
    category: 'all',
    era: 'all',
    onlyUnread: false,
    onlyFavorites: false,
  },
  rootEl: null,
};

export async function renderStories(root) {
  if (!root) return;
  state.rootEl = root;
  root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="loading">Loading…</p></div>`;

  const items = await loadAllContent();
  state.items = items;

  if (!items.length) {
    root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="muted">No content yet.</p></div>`;
    return;
  }

  const featured = pickDaily(items);
  const categories = Array.from(new Set(items.map(s => s._displayCategory).filter(Boolean))).sort();
  const eras = Array.from(new Set(items.map(s => s._displayEra).filter(Boolean))).sort();

  const counts = {
    all: items.length,
    narrative: items.filter(i => i._type === 'narrative').length,
    legend: items.filter(i => i._type === 'legend').length,
    brothers: items.filter(i => i._type === 'brothers').length,
  };

  root.innerHTML = `
    <h1>Baseball Stories <span class="muted">(${items.length})</span></h1>

    <div class="card story-filters">
      <div class="story-filter-row">
        <input type="search" id="story-search" class="search-input"
               placeholder="Search title, teaser, body, tags…" autocomplete="off" />
        <select id="story-era-select" class="story-select" aria-label="Filter by era">
          <option value="all">All eras</option>
          ${eras.map(e => `<option value="${escapeAttr(e)}">${escapeHtml(e)}</option>`).join('')}
        </select>
        <button id="story-random" class="btn-random" title="Show me a random unread item">🎲 Random unread</button>
      </div>
      <div class="story-filter-row">
        <div class="type-filter" role="group" aria-label="Content type filter">
          <button class="tag active" data-type="all">All (${counts.all})</button>
          <button class="tag" data-type="narrative">📖 Stories (${counts.narrative})</button>
          <button class="tag" data-type="legend">⭐ Legends (${counts.legend})</button>
          <button class="tag" data-type="brothers">👥 Brothers (${counts.brothers})</button>
        </div>
      </div>
      <div class="story-filter-row">
        <div class="category-filter">
          <button class="tag active" data-category="all">All categories</button>
          ${categories.map(c => `<button class="tag" data-category="${escapeAttr(c)}">${escapeHtml(formatCategory(c))}</button>`).join('')}
        </div>
      </div>
      <div class="story-filter-row story-filter-bottom">
        <label class="story-toggle"><input type="checkbox" id="only-unread" /> <span>Unread only</span></label>
        <label class="story-toggle"><input type="checkbox" id="only-favorites" /> <span>★ Favorites only</span></label>
        <span class="story-result-count muted" id="story-count"></span>
      </div>
    </div>

    <h2>Today's Feature</h2>
    <div class="card story-featured" id="story-featured">
      ${renderDetail(featured, { inFeatured: true })}
    </div>

    <h2>Browse</h2>
    <div class="grid grid-2" id="story-grid"></div>

    <div id="story-detail"></div>
  `;

  wireFilterControls();
  wireRandomButton();
  wireFeaturedClick(featured);
  refreshGrid();
}

async function loadAllContent() {
  const [stories, legends, brothers] = await Promise.all([
    loadStories().catch(() => ({ stories: [] })),
    loadLegendsGeneral().catch(() => ({ legends: [] })),
    loadBrothers().catch(() => ({ entries: [] })),
  ]);

  const narratives = (stories.stories || []).map(s => ({
    ...s,
    _type: 'narrative',
    _displayTitle: s.title,
    _displayEra: s.era || null,
    _displayCategory: s.category || null,
    _displayTeaser: s.teaser || '',
  }));

  const legendCards = (legends.legends || []).map(l => ({
    ...l,
    _type: 'legend',
    _displayTitle: l.name,
    _displayEra: l.era || null,
    _displayCategory: l.category || null,
    _displayTeaser: l.headline || '',
  }));

  const brothersGroups = (brothers.entries || []).map(b => ({
    ...b,
    _type: 'brothers',
    _displayTitle: b.title,
    _displayEra: b.era || null,
    _displayCategory: 'brothers',
    _displayTeaser: b.headline || '',
  }));

  return [...narratives, ...legendCards, ...brothersGroups];
}

function wireFilterControls() {
  const root = state.rootEl;
  const searchEl = root.querySelector('#story-search');
  const eraEl = root.querySelector('#story-era-select');
  const unreadEl = root.querySelector('#only-unread');
  const favEl = root.querySelector('#only-favorites');

  let debounceTimer = null;
  searchEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.filters.search = searchEl.value.trim().toLowerCase();
      refreshGrid();
    }, 150);
  });

  eraEl.addEventListener('change', () => {
    state.filters.era = eraEl.value;
    refreshGrid();
  });

  unreadEl.addEventListener('change', () => {
    state.filters.onlyUnread = unreadEl.checked;
    refreshGrid();
  });

  favEl.addEventListener('change', () => {
    state.filters.onlyFavorites = favEl.checked;
    refreshGrid();
  });

  root.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filters.type = btn.dataset.type;
      root.querySelectorAll('[data-type]').forEach(b => b.classList.toggle('active', b === btn));
      refreshGrid();
    });
  });

  root.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filters.category = btn.dataset.category;
      root.querySelectorAll('[data-category]').forEach(b => b.classList.toggle('active', b === btn));
      refreshGrid();
    });
  });
}

function wireRandomButton() {
  const btn = state.rootEl.querySelector('#story-random');
  btn.addEventListener('click', () => {
    const unread = state.items.filter(s => !readStore.isRead(s.id));
    const pool = unread.length ? unread : state.items;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) showDetail(pick);
  });
}

function wireFeaturedClick(featured) {
  const featuredEl = state.rootEl.querySelector('#story-featured');
  featuredEl.addEventListener('click', () => {
    if (!readStore.isRead(featured.id)) {
      readStore.markRead(featured.id);
      refreshGrid();
    }
  });
}

function refreshGrid() {
  const root = state.rootEl;
  const filtered = applyFilters(state.items, state.filters);
  const grid = root.querySelector('#story-grid');
  const count = root.querySelector('#story-count');

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">No items match. Try relaxing a filter or clearing the search.</div>`;
  } else {
    grid.innerHTML = filtered.map(renderCard).join('');
    wireCardClicks(grid);
  }

  count.textContent = `Showing ${filtered.length} of ${state.items.length}`;
}

function applyFilters(items, f) {
  return items.filter(s => {
    if (f.type !== 'all' && s._type !== f.type) return false;
    if (f.category !== 'all' && s._displayCategory !== f.category) return false;
    if (f.era !== 'all' && s._displayEra !== f.era) return false;
    if (f.onlyUnread && readStore.isRead(s.id)) return false;
    if (f.onlyFavorites && !favStore.isFavorite(s.id)) return false;
    if (f.search) {
      const hay = buildSearchHaystack(s);
      if (!hay.includes(f.search)) return false;
    }
    return true;
  });
}

function buildSearchHaystack(s) {
  const parts = [
    s._displayTitle || '',
    s._displayTeaser || '',
    s.body || '',
    (s.tags || []).join(' '),
    (s.members || []).map(m => `${m.name} ${m.note || ''}`).join(' '),
    (s.links || []).map(l => l.label || '').join(' '),
  ];
  return parts.join(' ').toLowerCase();
}

function renderCard(s) {
  const isRead = readStore.isRead(s.id);
  const isFav = favStore.isFavorite(s.id);
  const mins = s._type === 'narrative' ? estimateReadingMinutes(s.body) : null;
  const typeBadge = renderTypeBadge(s._type);

  return `
    <div class="story-card ${isRead ? 'is-read' : ''}" data-id="${escapeAttr(s.id)}">
      <div class="story-card-head">
        <div class="story-card-labels">
          ${typeBadge}
          <span class="story-category">${s._displayCategory ? escapeHtml(formatCategory(s._displayCategory)) : ''}${s._displayEra ? ` · ${escapeHtml(s._displayEra)}` : ''}</span>
        </div>
        <button class="btn-star ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Toggle favorite">★</button>
      </div>
      <h3>${escapeHtml(s._displayTitle || '')}</h3>
      <p class="muted">${escapeHtml(s._displayTeaser)}</p>
      <div class="story-card-meta">
        <span class="story-${isRead ? 'read' : 'unread'}-badge">${isRead ? '✓ read' : '● unread'}</span>
        ${mins ? `<span class="story-read-time">~${mins} min read</span>` : ''}
      </div>
    </div>
  `;
}

function renderTypeBadge(type) {
  if (type === 'narrative') return `<span class="story-type-badge badge-narrative">Story</span>`;
  if (type === 'legend')    return `<span class="story-type-badge badge-legend">Legend</span>`;
  if (type === 'brothers')  return `<span class="story-type-badge badge-brothers">Brothers</span>`;
  return '';
}

function wireCardClicks(scope) {
  scope.querySelectorAll('.story-card').forEach(card => {
    const starBtn = card.querySelector('[data-action="fav"]');
    if (starBtn) {
      starBtn.addEventListener('click', e => {
        e.stopPropagation();
        const id = card.dataset.id;
        favStore.toggle(id);
        starBtn.classList.toggle('active');
        starBtn.title = favStore.isFavorite(id) ? 'Remove from favorites' : 'Add to favorites';
        if (state.filters.onlyFavorites) refreshGrid();
      });
    }

    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const item = state.items.find(x => x.id === id);
      if (item) showDetail(item);
    });
  });
}

function showDetail(item) {
  const detail = state.rootEl.querySelector('#story-detail');
  detail.innerHTML = `<div class="card story-detail">${renderDetail(item)}</div>`;
  readStore.markRead(item.id);
  refreshGrid();
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderDetail(s, opts = {}) {
  if (s._type === 'narrative') return renderNarrativeDetail(s, opts);
  if (s._type === 'legend')    return renderLegendDetail(s, opts);
  if (s._type === 'brothers')  return renderBrothersDetail(s, opts);
  return '';
}

function renderNarrativeDetail(s, opts) {
  const isFav = favStore.isFavorite(s.id);
  const mins = estimateReadingMinutes(s.body);
  return `
    <div class="story-type-line">
      ${renderTypeBadge('narrative')}
      <span class="story-category">${escapeHtml(formatCategory(s._displayCategory || ''))}${s._displayEra ? ` · ${escapeHtml(s._displayEra)}` : ''}</span>
    </div>
    <div class="story-detail-head">
      <h2 style="margin: 0;">${escapeHtml(s._displayTitle)}</h2>
      <button class="btn-star ${isFav ? 'active' : ''}" title="${isFav ? 'Remove' : 'Favorite'}" aria-label="Toggle favorite">★</button>
    </div>
    <p class="muted story-teaser">${escapeHtml(s._displayTeaser)}</p>
    <div class="muted" style="font-size: 0.8rem;">~${mins} min read${opts.inFeatured ? " · today's feature" : ""}</div>
    <div class="story-body">${formatBody(s.body || '')}</div>
    ${s.tags?.length ? `<div class="tag-row">${s.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    ${s.sources?.length ? `<div class="muted" style="font-size: 0.85rem; margin-top: 0.75rem;">Sources: ${s.sources.map(escapeHtml).join(' · ')}</div>` : ''}
  `;
}

function renderLegendDetail(s, opts) {
  const isFav = favStore.isFavorite(s.id);
  return `
    <div class="story-type-line">
      ${renderTypeBadge('legend')}
      <span class="story-category">${escapeHtml(formatCategory(s._displayCategory || ''))}${s._displayEra ? ` · ${escapeHtml(s._displayEra)}` : ''}</span>
    </div>
    <div class="story-detail-head">
      <h2 style="margin: 0;">${escapeHtml(s.name)}${s.nickname ? ` <span class="muted">"${escapeHtml(s.nickname)}"</span>` : ''}</h2>
      <button class="btn-star ${isFav ? 'active' : ''}" title="${isFav ? 'Remove' : 'Favorite'}" aria-label="Toggle favorite">★</button>
    </div>
    <div class="muted">${escapeHtml(s.role || '')}${opts.inFeatured ? " · today's feature" : ''}</div>
    <p class="legend-headline" style="font-style: italic; margin-top: 0.6rem;">${escapeHtml(s.headline || '')}</p>
    ${renderLinkPills(s.links)}
  `;
}

function renderBrothersDetail(s, opts) {
  const isFav = favStore.isFavorite(s.id);
  return `
    <div class="story-type-line">
      ${renderTypeBadge('brothers')}
      <span class="story-category">${s._displayEra ? escapeHtml(s._displayEra) : ''}</span>
    </div>
    <div class="story-detail-head">
      <h2 style="margin: 0;">${escapeHtml(s.title)}</h2>
      <button class="btn-star ${isFav ? 'active' : ''}" title="${isFav ? 'Remove' : 'Favorite'}" aria-label="Toggle favorite">★</button>
    </div>
    <p>${escapeHtml(s.headline || '')}${opts.inFeatured ? " · today's feature" : ''}</p>
    ${s.members?.length ? `
      <ul class="brothers-members">
        ${s.members.map(m => `<li><strong>${escapeHtml(m.name)}</strong> — <span class="muted">${escapeHtml(m.note || '')}</span></li>`).join('')}
      </ul>
    ` : ''}
    ${renderLinkPills(s.links)}
  `;
}

function renderLinkPills(links) {
  if (!links?.length) return '';
  return `
    <div class="link-pills" style="margin-top: 0.75rem;">
      ${links.map(l => `<a href="${escapeAttr(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)} →</a>`).join('')}
    </div>
  `;
}

function pickDaily(items) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return items[dayOfYear % items.length];
}

function estimateReadingMinutes(body) {
  if (!body) return 1;
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatBody(body) {
  return body.split(/\n\n+/).map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
}

function formatCategory(c) {
  const map = {
    military: 'Military',
    faith: 'Faith',
    charity: 'Charity',
    umpires: 'Umpires',
    coaches: 'Coaches',
    cardinals: 'Cardinals',
    washington: 'Washington',
    'civil-rights': 'Civil Rights',
    'negro-leagues': 'Negro Leagues',
    broadcaster: 'Broadcaster',
    coach: 'Coach',
    executive: 'Executive',
    player: 'Player',
    brothers: 'Family',
  };
  return map[c] || (c || '').replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr(s) { return escapeHtml(s); }
