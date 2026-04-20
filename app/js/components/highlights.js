/**
 * Highlights renderer — v1
 *
 * Renders a list of YouTube highlight videos as embedded iframes.
 * Uses youtube-nocookie.com to avoid setting tracking cookies for
 * casual site visitors. Iframes are lazy-loaded.
 */

export function renderHighlights(videos, label) {
  if (!videos || !videos.length) return '';
  return `
    <div class="highlights-section">
      <h3>${escapeHtml(label)}</h3>
      <div class="highlights-grid">
        ${videos.map(v => `
          <div class="highlight-card">
            <div class="highlight-thumb">
              <iframe
                src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.videoId)}"
                title="${escapeHtml(v.title)}"
                loading="lazy"
                referrerpolicy="no-referrer"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen></iframe>
            </div>
            <div class="highlight-title">${escapeHtml(v.title)}</div>
            ${v.publishedAt ? `<div class="highlight-date muted">${escapeHtml(v.publishedAt.slice(0, 10))}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
