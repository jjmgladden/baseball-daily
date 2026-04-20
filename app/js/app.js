/**
 * Baseball Daily Intelligence — app bootstrap v3
 *
 * Loads the daily snapshot eagerly. All other tabs lazy-load their master
 * data on first activation, so initial paint is fast. Registers a service
 * worker for PWA offline support.
 */

import { loadLatestSnapshot } from './data-loader.js';
import { renderDaily } from './tabs/daily.js';
import { renderPlayers } from './tabs/players.js';
import { renderTeams } from './tabs/teams.js';
import { renderHistory } from './tabs/history.js';
import { renderStories } from './tabs/stories.js';
import { renderCardinals } from './tabs/cardinals.js';
import { renderTrivia } from './tabs/trivia.js';
import { attachSuggestHandler } from './components/suggest.js';
import { showSplash } from './components/splash.js';

const state = {
  snapshot: null,
  activeTab: 'daily',
  rendered: {},
};

function bindTabs() {
  document.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', () => activateTab(el.dataset.tab));
  });
}

async function activateTab(name) {
  state.activeTab = name;
  document.querySelectorAll('.tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach(el => {
    el.classList.toggle('active', el.id === `tab-${name}`);
  });

  if (state.rendered[name]) return;
  state.rendered[name] = true;

  const panel = document.getElementById(`tab-${name}`);
  try {
    switch (name) {
      case 'daily':
        if (state.snapshot) renderDaily(panel, state.snapshot);
        else renderNoSnapshot(panel);
        break;
      case 'players':   await renderPlayers(panel); break;
      case 'teams':     await renderTeams(panel); break;
      case 'history':   await renderHistory(panel, state.snapshot); break;
      case 'stories':   await renderStories(panel); break;
      case 'trivia':    await renderTrivia(panel); break;
      case 'cardinals': await renderCardinals(panel, state.snapshot); break;
      default:          panel.innerHTML = `<h1>${name}</h1>`;
    }
  } catch (err) {
    console.error(`[app] Error rendering ${name}:`, err);
    panel.innerHTML = `
      <h1>${name.charAt(0).toUpperCase() + name.slice(1)}</h1>
      <div class="card"><p class="muted">Error: ${escapeHtml(err.message || String(err))}</p></div>
    `;
  }
}

function renderNoSnapshot(panel) {
  panel.innerHTML = `
    <h1>Daily Report</h1>
    <div class="card">
      <h3>No snapshot yet</h3>
      <p class="muted">Run the daily ingestion to generate your first snapshot:</p>
      <pre>npm run fetch:daily</pre>
      <p class="muted">Or double-click <code>run_daily.bat</code>.</p>
    </div>
  `;
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;  // SW needs http(s)
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('[app] SW registered:', reg.scope))
    .catch(err => console.warn('[app] SW registration failed:', err));
}

async function main() {
  showSplash();
  bindTabs();
  registerServiceWorker();
  attachSuggestHandler('[data-suggest]');

  try {
    state.snapshot = await loadLatestSnapshot();
  } catch (err) {
    console.error('[app] Failed to load snapshot:', err);
  }

  if (state.snapshot) {
    renderDaily(document.getElementById('tab-daily'), state.snapshot);
    const d = new Date(state.snapshot.generatedAt);
    const el = document.getElementById('last-updated');
    if (el) el.textContent = `Updated ${d.toLocaleString()}`;
  } else {
    renderNoSnapshot(document.getElementById('tab-daily'));
  }
  state.rendered.daily = true;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

main();
