// news-card.js — single news item card (headline + source + tier badge + date + summary).
// Click-out target opens the source URL in a new tab.

import { escapeHtml, confidenceBadgeHtml } from './confidence-badge.js';

function fmtRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffH = diffMs / 36e5;
  if (diffH < 1) {
    const m = Math.max(1, Math.floor(diffMs / 60000));
    return m + 'm ago';
  }
  if (diffH < 24) return Math.floor(diffH) + 'h ago';
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return diffD + 'd ago';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function renderNewsCard(item) {
  const url = item.url || '#';
  const title = escapeHtml(item.title || '');
  const source = escapeHtml(item.sourceName || '');
  const summary = escapeHtml(item.summary || '');
  const dateLabel = item.publishedAt ? fmtRelative(item.publishedAt) : '';
  const tierBadge = confidenceBadgeHtml(item.tier);
  const author = item.author ? '<span class="muted"> · ' + escapeHtml(item.author) + '</span>' : '';
  return (
    '<article class="card news-card">' +
      '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="news-card-link">' +
        '<h3 class="news-headline">' + title + '</h3>' +
      '</a>' +
      '<div class="news-meta">' +
        '<strong>' + source + '</strong>' + tierBadge +
        (dateLabel ? '<span class="muted"> · ' + escapeHtml(dateLabel) + '</span>' : '') +
        author +
      '</div>' +
      (summary ? '<p class="news-summary">' + summary + '</p>' : '') +
    '</article>'
  );
}

// Bucket items into Today / This Week / Recent by publishedAt (local time).
// Items missing publishedAt fall into Recent.
export function bucketNews(items) {
  const today = [];
  const thisWeek = [];
  const recent = [];
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 86400000);

  for (const it of items) {
    if (!it.publishedAt) { recent.push(it); continue; }
    const d = new Date(it.publishedAt);
    if (isNaN(d.getTime())) { recent.push(it); continue; }
    if (d >= startOfToday) today.push(it);
    else if (d >= sevenDaysAgo) thisWeek.push(it);
    else recent.push(it);
  }
  return { today, thisWeek, recent };
}
