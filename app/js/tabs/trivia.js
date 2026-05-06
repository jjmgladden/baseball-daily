/**
 * Trivia tab — v2
 *
 * Two modes:
 *  - "Today's set" (default): 5 deterministic-by-date picks from the full pool.
 *    Same picks for every visitor on a given day; rotates daily. First card
 *    matches the daily-report trivia card (pickDaily) so the home tab and
 *    trivia tab are consistent. A "🎲 Different 5" button reshuffles
 *    without changing the date (sessionStorage seeds the offset).
 *  - "Search the pool" (auto-engaged when ANY filter is active): shows ALL
 *    matching questions from the full pool, not just today's 5. So filters
 *    can mine the full library while the landing view stays bounded.
 *
 * Session-based tracking of revealed questions (sessionStorage) so a
 * user can filter to "Unrevealed only" during a quiz session.
 *
 * To expand trivia: tell Claude in chat "do a [theme] trivia batch"
 * and approve via the same Issue-with-checkboxes pattern as weekly
 * curation batches, OR add entries directly to data/master/trivia.json.
 */

import { loadTrivia } from '../data-loader.js';

const SESSION_KEY = 'baseball-daily.trivia-revealed.v1';
const RESHUFFLE_KEY = 'baseball-daily.trivia-reshuffle.v1';
const DAILY_SET_SIZE = 5;

const state = {
  questions: [],
  filters: {
    search: '',
    category: 'all',
    onlyUnrevealed: false,
  },
  rootEl: null,
};

function getRevealedSet() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveRevealedSet(set) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set])); } catch {}
}
function markRevealed(id) { const s = getRevealedSet(); s.add(String(id)); saveRevealedSet(s); }
function isRevealed(id) { return getRevealedSet().has(String(id)); }

export async function renderTrivia(root) {
  if (!root) return;
  state.rootEl = root;
  root.innerHTML = `<h1>Baseball Trivia</h1><div class="card"><p class="loading">Loading…</p></div>`;

  let data;
  try { data = await loadTrivia(); }
  catch (err) {
    root.innerHTML = `<h1>Baseball Trivia</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const questions = data.questions || [];
  state.questions = questions;

  if (!questions.length) {
    root.innerHTML = `<h1>Baseball Trivia</h1><div class="card"><p class="muted">No questions yet.</p></div>`;
    return;
  }

  const categories = Array.from(new Set(questions.map(q => q.category).filter(Boolean))).sort();

  root.innerHTML = `
    <h1>Baseball Trivia <span class="muted">(pool: ${questions.length})</span></h1>

    <div class="card trivia-filters">
      <div class="trivia-filter-row">
        <input type="search" id="trivia-search" class="search-input"
               placeholder="Search the full pool…" autocomplete="off" />
        <button id="trivia-reshuffle" class="btn-random" title="Pick a different 5 from today's pool (date stays the same)">🎲 Different 5</button>
        <button id="trivia-random" class="btn-random" title="Jump to a random unrevealed question from the full pool">🎯 Random unrevealed</button>
      </div>
      <div class="trivia-filter-row">
        <div class="category-filter">
          <button class="tag active" data-category="all">All (${questions.length})</button>
          ${categories.map(c => {
            const count = questions.filter(q => q.category === c).length;
            return `<button class="tag" data-category="${escapeAttr(c)}">${escapeHtml(formatCategory(c))} (${count})</button>`;
          }).join('')}
        </div>
      </div>
      <div class="trivia-filter-row trivia-filter-bottom">
        <label class="story-toggle"><input type="checkbox" id="only-unrevealed" /> <span>Unrevealed only</span></label>
        <span class="story-result-count muted" id="trivia-count"></span>
      </div>
    </div>

    <div class="card trivia-howto">
      <p class="muted" style="margin: 0;">Showing today's 5 by default. <strong>Search</strong>, <strong>category</strong>, or <strong>unrevealed-only</strong> mines the whole ${questions.length}-question pool. Want more? Tell Claude in chat: <em>"do a [theme] trivia batch"</em> — e.g., <em>Cardinals trivia</em>, <em>1980s postseason trivia</em>. Approved via Issue checkboxes the same way as legends + stories.</p>
    </div>

    <h2 id="trivia-mode-heading" style="margin-top: 1.5rem;">Today's 5</h2>
    <div class="grid grid-2" id="trivia-grid"></div>
  `;

  wireFilterControls();
  wireRandomButton();
  wireReshuffleButton();
  refreshGrid();
}

function wireFilterControls() {
  const root = state.rootEl;
  const searchEl = root.querySelector('#trivia-search');
  const unrevealedEl = root.querySelector('#only-unrevealed');

  let debounceTimer = null;
  searchEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.filters.search = searchEl.value.trim().toLowerCase();
      refreshGrid();
    }, 150);
  });

  unrevealedEl.addEventListener('change', () => {
    state.filters.onlyUnrevealed = unrevealedEl.checked;
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
  const btn = state.rootEl.querySelector('#trivia-random');
  btn.addEventListener('click', () => {
    // The Random button always queries the full pool (not today's 5),
    // so it stays useful even when filters are active.
    const unrevealed = state.questions.filter(q => !isRevealed(q.id));
    const pool = unrevealed.length ? unrevealed : state.questions;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;
    // Random forces "search the pool" mode by clearing filter state implicitly
    // via the search input — but a cleaner approach is just to render the
    // current view, find or scroll-to the card. If today's-set is active and
    // the picked card isn't in it, switch to all-pool view first.
    if (isDailySetMode() && !todaysSetIds().includes(String(pick.id))) {
      // Force a search query on the pick's id-derived keyword (the question text)
      // so the user sees ONLY that card; cleanest UX without adding new state.
      const searchEl = state.rootEl.querySelector('#trivia-search');
      if (searchEl) {
        searchEl.value = pick.question.split(/\s+/).slice(0, 4).join(' ');
        state.filters.search = searchEl.value.toLowerCase();
      }
    }
    refreshGrid();
    const el = state.rootEl.querySelector(`.trivia-card[data-id="${escapeAttr(String(pick.id))}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      revealAnswer(el, pick);
    }
  });
}

function wireReshuffleButton() {
  const btn = state.rootEl.querySelector('#trivia-reshuffle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    bumpReshuffle();
    refreshGrid();
  });
}

function isDailySetMode() {
  const f = state.filters;
  return !f.search && f.category === 'all' && !f.onlyUnrevealed;
}

function refreshGrid() {
  const root = state.rootEl;
  const grid = root.querySelector('#trivia-grid');
  const count = root.querySelector('#trivia-count');
  const heading = root.querySelector('#trivia-mode-heading');
  const reshuffleBtn = root.querySelector('#trivia-reshuffle');

  let toRender;
  if (isDailySetMode()) {
    toRender = pickDailySet(state.questions, DAILY_SET_SIZE);
    if (heading) heading.textContent = `Today's ${toRender.length}`;
    if (reshuffleBtn) reshuffleBtn.style.display = '';
    count.textContent = `Today's ${toRender.length} · search to mine the full pool of ${state.questions.length}`;
  } else {
    toRender = applyFilters(state.questions, state.filters);
    if (heading) heading.textContent = 'Search results';
    if (reshuffleBtn) reshuffleBtn.style.display = 'none';
    count.textContent = `Showing ${toRender.length} of ${state.questions.length}`;
  }

  if (!toRender.length) {
    grid.innerHTML = `<div class="empty">No questions match. Try relaxing a filter.</div>`;
  } else {
    grid.innerHTML = toRender.map(renderQuestionCard).join('');
    wireCardRevealButtons(grid);
  }
}

// Day-index seed shared with components/trivia.js (pickDaily) — must stay
// in sync so the first card of today's set === the daily-report trivia card.
function dayOfYearLocal() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function pickDailySet(questions, n) {
  if (!questions.length) return [];
  const len = questions.length;
  const reshuffleOffset = getReshuffle();
  const dayIdx = dayOfYearLocal() + reshuffleOffset;
  // Evenly-spaced strides across the pool. Picks are stable for the day
  // (and stable across reloads thanks to sessionStorage on reshuffle).
  // First pick (when reshuffleOffset===0) matches components/trivia.js pickDaily.
  const stride = Math.max(1, Math.floor(len / n));
  const out = [];
  const seen = new Set();
  for (let i = 0; i < n && seen.size < len; i++) {
    let idx = (dayIdx + i * stride) % len;
    // Skip over already-picked indices (defensive when stride * n < len causes overlap)
    while (seen.has(idx)) idx = (idx + 1) % len;
    seen.add(idx);
    out.push(questions[idx]);
  }
  return out;
}

function todaysSetIds() {
  return pickDailySet(state.questions, DAILY_SET_SIZE).map(q => String(q.id));
}

function getReshuffle() {
  try { return parseInt(sessionStorage.getItem(RESHUFFLE_KEY) || '0', 10) || 0; }
  catch { return 0; }
}
function bumpReshuffle() {
  try { sessionStorage.setItem(RESHUFFLE_KEY, String(getReshuffle() + 1)); }
  catch {}
}

function applyFilters(questions, f) {
  return questions.filter(q => {
    if (f.category !== 'all' && q.category !== f.category) return false;
    if (f.onlyUnrevealed && isRevealed(q.id)) return false;
    if (f.search) {
      const hay = ((q.question || '') + ' ' + (q.answer || '') + ' ' + (q.category || '')).toLowerCase();
      if (!hay.includes(f.search)) return false;
    }
    return true;
  });
}

function renderQuestionCard(q) {
  const revealed = isRevealed(q.id);
  return `
    <div class="trivia-card ${revealed ? 'is-revealed' : ''}" data-id="${escapeAttr(String(q.id))}">
      <div class="trivia-category">${escapeHtml(formatCategory(q.category))}</div>
      <p class="trivia-question">${escapeHtml(q.question || '')}</p>
      <button class="btn-reveal" data-action="reveal" ${revealed ? 'hidden' : ''}>Show answer</button>
      <div class="trivia-answer" ${revealed ? '' : 'hidden'}>
        <strong>Answer:</strong> ${escapeHtml(q.answer || '')}
      </div>
    </div>
  `;
}

function wireCardRevealButtons(scope) {
  scope.querySelectorAll('.trivia-card').forEach(card => {
    const btn = card.querySelector('[data-action="reveal"]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const id = card.dataset.id;
      const q = state.questions.find(x => String(x.id) === id);
      if (q) revealAnswer(card, q);
    });
  });
}

function revealAnswer(card, q) {
  const btn = card.querySelector('[data-action="reveal"]');
  const ans = card.querySelector('.trivia-answer');
  if (btn) btn.hidden = true;
  if (ans) ans.hidden = false;
  card.classList.add('is-revealed');
  markRevealed(q.id);
  if (state.filters.onlyUnrevealed) refreshGrid();
}

function formatCategory(c) {
  const map = {
    records: 'Records',
    cardinals: 'Cardinals',
    nationals: 'Nationals',
    postseason: 'Postseason',
    military: 'Military',
    'civil-rights': 'Civil Rights',
    'hall-of-fame': 'Hall of Fame',
    'historical-firsts': 'Historical Firsts',
    'franchise-history': 'Franchise History',
    'league-history': 'League History',
    umpires: 'Umpires',
    history: 'History',
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
