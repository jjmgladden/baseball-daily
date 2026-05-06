// news.js (tab) — curated MLB headlines from RSS sources.
//
// Phase B7: Today / This Week / Recent buckets become collapsible sections
// with a TOC for fast nav (pattern ported from pickleball KB-0040 Phase L1).

import { escapeHtml } from '../components/confidence-badge.js';
import { renderNewsCard, bucketNews } from '../components/news-card.js';
import { errorBannerHtml } from '../components/error-messages.js';
import { loadNewsSnapshot } from '../data-loader.js';

export async function renderNews(root) {
  if (!root) return;

  let news;
  try {
    news = await loadNewsSnapshot();
  } catch (err) {
    root.innerHTML =
      '<h1>News</h1>' +
      errorBannerHtml('fetch-failed', { source: 'News snapshot' });
    console.error('[news] Failed to load news-latest.json:', err);
    return;
  }

  const items = (news && news.items) || [];
  const sources = (news && news.sources) || [];
  const errors = (news && news.errors) || [];

  const sourceLine = sources.length
    ? sources.map(s => escapeHtml(s.sourceName || s.sourceId) + (s.ok ? ' (' + (s.count || 0) + ')' : ' (error)')).join(' · ')
    : '';

  if (!items.length) {
    root.innerHTML =
      '<h1>News</h1>' +
      '<div class="empty">No news items right now (all sources returned empty or errored).</div>' +
      (sourceLine ? '<div class="muted news-sources-line">Sources: ' + sourceLine + '</div>' : '') +
      (errors.length ? errorListHtml(errors) : '');
    return;
  }

  const { today, thisWeek, recent } = bucketNews(items);

  const sections = [
    { id: 'news-today',  title: `Today (${today.length})`,        body: bucketBody(today),    open: today.length > 0 },
    { id: 'news-week',   title: `This Week (${thisWeek.length})`, body: bucketBody(thisWeek), open: today.length === 0 && thisWeek.length > 0 },
    { id: 'news-recent', title: `Recent (${recent.length})`,      body: bucketBody(recent) },
  ].filter(s => s.body).map((s, i) => ({ ...s, num: i + 1 }));

  let html = '<h1>News</h1>';
  if (sourceLine) html += '<div class="muted news-sources-line">From: ' + sourceLine + '</div>';

  html += tocHtml(sections);
  html += sections.map(sectionHtml).join('');

  if (errors.length) html += errorListHtml(errors);

  root.innerHTML = html;
}

function bucketBody(items) {
  if (!items.length) return '';
  return '<div class="news-list">' + items.map(renderNewsCard).join('') + '</div>';
}

function tocHtml(sections) {
  if (!sections.length) return '';
  const items = sections.map(s =>
    '<li><a href="#' + s.id + '">' + s.num + '. ' + escapeHtml(s.title) + '</a></li>'
  ).join('');
  return (
    '<nav class="tab-toc" aria-label="News tab sections">' +
      '<div class="tab-toc-title">Jump to section</div>' +
      '<ol>' + items + '</ol>' +
    '</nav>'
  );
}

function sectionHtml(s) {
  const open = s.open ? ' open' : '';
  return (
    '<details class="tab-section" id="' + s.id + '"' + open + '>' +
      '<summary>' + s.num + '. ' + escapeHtml(s.title) + '</summary>' +
      '<div class="tab-section-body">' + s.body + '</div>' +
    '</details>'
  );
}

function errorListHtml(errors) {
  return '<div class="muted news-sources-line">Some sources errored: ' +
    errors.map(e => escapeHtml(e.sourceId + ' (' + e.message + ')')).join(', ') +
    '</div>';
}
