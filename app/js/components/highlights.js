/**
 * Highlights renderer — v2
 *
 * Renders YouTube videos as clickable thumbnails that open the video on
 * youtube.com in a new tab.
 *
 * Why not iframes? MLB's official YouTube channel disables third-party
 * embedding on nearly all of its videos (YouTube Error 153 when embedded).
 * Since the channel is our primary source, iframes fail. Thumbnails always
 * load, stay lightweight, and a click takes the user to the full video on
 * YouTube where it plays without restriction.
 */

export function renderHighlights(videos, label) {
  if (!videos || !videos.length) return '';
  return `
    <div class="highlights-section">
      <h3>${escapeHtml(label)}</h3>
      <div class="highlights-grid">
        ${videos.map(v => `
          <a class="highlight-card"
             href="https://www.youtube.com/watch?v=${encodeURIComponent(v.videoId)}"
             target="_blank"
             rel="noopener noreferrer"
             title="Open on YouTube: ${escapeHtml(v.title)}">
            <div class="highlight-thumb">
              ${v.thumbnailUrl
                ? `<img src="${escapeAttr(v.thumbnailUrl)}" alt="${escapeAttr(v.title)}" loading="lazy">`
                : '<div class="highlight-thumb-placeholder">▶</div>'}
              <div class="highlight-play">▶</div>
            </div>
            <div class="highlight-title">${escapeHtml(v.title)}</div>
            ${v.publishedAt ? `<div class="highlight-date muted">${escapeHtml(v.publishedAt.slice(0, 10))}</div>` : ''}
          </a>
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

function escapeAttr(s) {
  return escapeHtml(s);
}
