/**
 * Trivia tab — v1
 *
 * Dedicated tab for baseball trivia with search, category filter,
 * "Random" button, and per-card "Show answer" reveal.
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
    <h1>Baseball Trivia <span class="muted">(${questions.length} questions)</span></h1>

    <div class="card trivia-filters">
      <div class="trivia-filter-row">
        <input type="search" id="trivia-search" class="search-input"
               placeholder="Search questions or answers…" autocomplete="off" />
        <button id="trivia-random" class="btn-random" title="Jump to a random unrevealed question">🎲 Random unrevealed</button>
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
      <p class="muted" style="margin: 0;">Want more trivia? Tell Claude in chat: <em>"do a [theme] trivia batch"</em> — e.g., <em>Cardinals trivia</em>, <em>1980s postseason trivia</em>, <em>trivia about pitchers</em>. Claude will draft new questions for your approval via the same Issue pattern as the weekly curation batches.</p>
    </div>

    <div class="grid grid-2" id="trivia-grid"></div>
  `;

  wireFilterControls();
  wireRandomButton();
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
    const unrevealed = state.questions.filter(q => !isRevealed(q.id));
    const pool = unrevealed.length ? unrevealed : state.questions;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      // Scroll to the card and reveal it
      refreshGrid();
      const el = state.rootEl.querySelector(`.trivia-card[data-id="${escapeAttr(String(pick.id))}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        revealAnswer(el, pick);
      }
    }
  });
}

function refreshGrid() {
  const root = state.rootEl;
  const filtered = applyFilters(state.questions, state.filters);
  const grid = root.querySelector('#trivia-grid');
  const count = root.querySelector('#trivia-count');

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">No questions match. Try relaxing a filter.</div>`;
  } else {
    grid.innerHTML = filtered.map(renderQuestionCard).join('');
    wireCardRevealButtons(grid);
  }

  count.textContent = `Showing ${filtered.length} of ${state.questions.length}`;
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
