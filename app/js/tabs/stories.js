/**
 * Stories tab — v1
 *
 * Rotating daily feature + full archive. The daily feature is picked
 * deterministically by day-of-year, so a given day always shows the same
 * story. Filter by category.
 */

import { loadStories } from '../data-loader.js';

export async function renderStories(root) {
  if (!root) return;
  root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="loading">Loading…</p></div>`;

  let data;
  try { data = await loadStories(); }
  catch (err) {
    root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="muted">${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const stories = data.stories || [];
  if (!stories.length) {
    root.innerHTML = `<h1>Baseball Stories</h1><div class="card"><p class="muted">No stories yet.</p></div>`;
    return;
  }

  const featured = pickDaily(stories);
  const categories = Array.from(new Set(stories.map(s => s.category))).sort();

  root.innerHTML = `
    <h1>Baseball Stories</h1>

    <h2>Today's Feature</h2>
    <div class="card story-featured">
      ${renderStoryFull(featured)}
    </div>

    <h2>Browse (${stories.length})</h2>
    <div class="card">
      <div class="category-filter">
        <button class="tag active" data-cat="all">All</button>
        ${categories.map(c => `<button class="tag" data-cat="${escapeHtml(c)}">${escapeHtml(formatCategory(c))}</button>`).join('')}
      </div>
    </div>

    <div class="grid grid-2" id="story-grid">
      ${stories.map(s => renderStoryCard(s)).join('')}
    </div>

    <div id="story-detail"></div>
  `;

  const grid = root.querySelector('#story-grid');
  const detail = root.querySelector('#story-detail');
  grid.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', () => {
      const s = stories.find(x => x.id === card.dataset.id);
      if (s) {
        detail.innerHTML = `<div class="card">${renderStoryFull(s)}</div>`;
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  root.querySelectorAll('.category-filter .tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      root.querySelectorAll('.category-filter .tag').forEach(b => b.classList.toggle('active', b === btn));
      grid.querySelectorAll('.story-card').forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

function pickDaily(stories) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return stories[dayOfYear % stories.length];
}

function renderStoryCard(s) {
  return `
    <div class="story-card" data-id="${escapeHtml(s.id)}" data-cat="${escapeHtml(s.category)}">
      <div class="story-category">${escapeHtml(formatCategory(s.category))}${s.era ? ` · ${escapeHtml(s.era)}` : ''}</div>
      <h3>${escapeHtml(s.title)}</h3>
      <p class="muted">${escapeHtml(s.teaser || '')}</p>
    </div>
  `;
}

function renderStoryFull(s) {
  return `
    <div class="story-category">${escapeHtml(formatCategory(s.category))}${s.era ? ` · ${escapeHtml(s.era)}` : ''}</div>
    <h2>${escapeHtml(s.title)}</h2>
    <p class="muted story-teaser">${escapeHtml(s.teaser || '')}</p>
    <div class="story-body">${formatBody(s.body || '')}</div>
    ${s.tags?.length ? `<div class="tag-row">${s.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    ${s.sources?.length ? `<div class="muted" style="font-size: 0.85rem; margin-top: 0.75rem;">Sources: ${s.sources.map(escapeHtml).join(' · ')}</div>` : ''}
  `;
}

function formatBody(body) {
  // Split on double newlines for paragraphs; single-newline is whitespace.
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
  return map[c] || c.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
