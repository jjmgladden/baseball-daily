/**
 * Stories tab — v3 (Tier 1 + Tier 2 filters)
 *
 * Tier 1 additions: free-text search, era dropdown, result count.
 * Tier 2 additions: read/unread tracking (localStorage via story-state.js),
 *                    favorites (localStorage), random-unread button,
 *                    reading-time estimates per card.
 *
 * Filter combinations are AND-merged. Clicking a story card expands it
 * to full view AND marks it read.
 */

import { loadStories } from '../data-loader.js';
import { readStore, favStore } from '../components/story-state.js';

const state = {
  stories: [],
  filters: {
    search: '',
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

  let data;
  try { data = await loadStories(); }
  catch (err) {
    root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const stories = data.stories || [];
  state.stories = stories;

  if (!stories.length) {
    root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="muted">No stories yet.</p></div>`;
    return;
  }

  const featured = pickDaily(stories);
  const categories = Array.from(new Set(stories.map(s => s.category))).sort();
  const eras = Array.from(new Set(stories.map(s => s.era).filter(Boolean))).sort();

  root.innerHTML = `
    <h1>Baseball Stories <span class="muted">(${stories.length})</span></h1>

    <div class="card story-filters">
      <div class="story-filter-row">
        <input type="search" id="story-search" class="search-input"
               placeholder="Search title, teaser, tags…" autocomplete="off" />
        <select id="story-era-select" class="story-select" aria-label="Filter by era">
          <option value="all">All eras</option>
          ${eras.map(e => `<option value="${escapeAttr(e)}">${escapeHtml(e)}</option>`).join('')}
        </select>
        <button id="story-random" class="btn-random" title="Show me a random unread story">🎲 Random unread</button>
      </div>
      <div class="story-filter-row">
        <div class="category-filter">
          <button class="tag active" data-category="all">All</button>
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
      ${renderStoryFull(featured, { inFeatured: true })}
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
    const unread = state.stories.filter(s => !readStore.isRead(s.id));
    const pool = unread.length ? unread : state.stories;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) showDetail(pick);
  });
}

function wireFeaturedClick(featured) {
  // Featured story shows full body; mark as read if user interacts with the card.
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
  const filtered = applyFilters(state.stories, state.filters);
  const grid = root.querySelector('#story-grid');
  const count = root.querySelector('#story-count');

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">No stories match. Try relaxing a filter or clearing the search.</div>`;
  } else {
    grid.innerHTML = filtered.map(renderStoryCard).join('');
    wireCardClicks(grid);
  }

  count.textContent = `Showing ${filtered.length} of ${state.stories.length}`;
}

function applyFilters(stories, f) {
  return stories.filter(s => {
    if (f.category !== 'all' && s.category !== f.category) return false;
    if (f.era !== 'all' && s.era !== f.era) return false;
    if (f.onlyUnread && readStore.isRead(s.id)) return false;
    if (f.onlyFavorites && !favStore.isFavorite(s.id)) return false;
    if (f.search) {
      const hay = (
        (s.title || '') + ' ' +
        (s.teaser || '') + ' ' +
        (s.body || '') + ' ' +
        ((s.tags || []).join(' '))
      ).toLowerCase();
      if (!hay.includes(f.search)) return false;
    }
    return true;
  });
}

function renderStoryCard(s) {
  const isRead = readStore.isRead(s.id);
  const isFav = favStore.isFavorite(s.id);
  const mins = estimateReadingMinutes(s.body);
  return `
    <div class="story-card ${isRead ? 'is-read' : ''}" data-id="${escapeAttr(s.id)}" data-cat="${escapeAttr(s.category)}">
      <div class="story-card-head">
        <div class="story-category">${escapeHtml(formatCategory(s.category))}${s.era ? ` · ${escapeHtml(s.era)}` : ''}</div>
        <button class="btn-star ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Toggle favorite">★</button>
      </div>
      <h3>${escapeHtml(s.title)}</h3>
      <p class="muted">${escapeHtml(s.teaser || '')}</p>
      <div class="story-card-meta">
        <span class="story-${isRead ? 'read' : 'unread'}-badge">${isRead ? '✓ read' : '● unread'}</span>
        <span class="story-read-time">~${mins} min read</span>
      </div>
    </div>
  `;
}

function wireCardClicks(scope) {
  scope.querySelectorAll('.story-card').forEach(card => {
    // Star button
    const starBtn = card.querySelector('[data-action="fav"]');
    if (starBtn) {
      starBtn.addEventListener('click', e => {
        e.stopPropagation();
        const id = card.dataset.id;
        favStore.toggle(id);
        // Update just this card's star visually without full grid re-render
        starBtn.classList.toggle('active');
        starBtn.title = favStore.isFavorite(id) ? 'Remove from favorites' : 'Add to favorites';
        // If filter is "favorites only," refresh grid so non-favs disappear
        if (state.filters.onlyFavorites) refreshGrid();
      });
    }

    // Card body
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const story = state.stories.find(x => x.id === id);
      if (story) showDetail(story);
    });
  });
}

function showDetail(story) {
  const detail = state.rootEl.querySelector('#story-detail');
  detail.innerHTML = `<div class="card story-detail">${renderStoryFull(story)}</div>`;
  readStore.markRead(story.id);
  refreshGrid();
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStoryFull(s, opts = {}) {
  const isFav = favStore.isFavorite(s.id);
  const mins = estimateReadingMinutes(s.body);
  return `
    <div class="story-category">${escapeHtml(formatCategory(s.category))}${s.era ? ` · ${escapeHtml(s.era)}` : ''}</div>
    <div class="story-detail-head">
      <h2 style="margin: 0;">${escapeHtml(s.title)}</h2>
      <button class="btn-star ${isFav ? 'active' : ''}" data-story-star="${escapeAttr(s.id)}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Toggle favorite">★</button>
    </div>
    <p class="muted story-teaser">${escapeHtml(s.teaser || '')}</p>
    <div class="muted" style="font-size: 0.8rem;">~${mins} min read${opts.inFeatured ? ' · Today\\'s featured story' : ''}</div>
    <div class="story-body">${formatBody(s.body || '')}</div>
    ${s.tags?.length ? `<div class="tag-row">${s.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    ${s.sources?.length ? `<div class="muted" style="font-size: 0.85rem; margin-top: 0.75rem;">Sources: ${s.sources.map(escapeHtml).join(' · ')}</div>` : ''}
  `;
}

function pickDaily(stories) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return stories[dayOfYear % stories.length];
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
    military: 'Military Service',
    faith: 'Faith',
    charity: 'Charity',
    umpires: 'Umpires',
    coaches: 'Coaches',
    cardinals: 'Cardinals',
    washington: 'Washington',
    'civil-rights': 'Civil Rights',
    'negro-leagues': 'Negro Leagues',
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
