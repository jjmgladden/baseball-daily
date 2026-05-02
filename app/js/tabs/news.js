// news.js (tab) — curated MLB headlines from RSS sources.
// Today / This Week / Recent buckets. Each item links out to the source.

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

  let html = '<h1>News</h1>';
  if (sourceLine) html += '<div class="muted news-sources-line">From: ' + sourceLine + '</div>';

  if (today.length) {
    html += '<h2>Today</h2>';
    html += '<div class="news-list">' + today.map(renderNewsCard).join('') + '</div>';
  }
  if (thisWeek.length) {
    html += '<h2>This Week</h2>';
    html += '<div class="news-list">' + thisWeek.map(renderNewsCard).join('') + '</div>';
  }
  if (recent.length) {
    html += '<h2>Recent</h2>';
    html += '<div class="news-list">' + recent.map(renderNewsCard).join('') + '</div>';
  }

  if (errors.length) html += errorListHtml(errors);

  root.innerHTML = html;
}

function errorListHtml(errors) {
  return '<div class="muted news-sources-line">Some sources errored: ' +
    errors.map(e => escapeHtml(e.sourceId + ' (' + e.message + ')')).join(', ') +
    '</div>';
}
