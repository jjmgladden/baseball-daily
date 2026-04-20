/**
 * Player comparison widget — v1
 *
 * Side-by-side bio and MLB-span display for two players from the Chadwick
 * index. Comparison is bio-level only (Phase 2 index has no career stats —
 * stats join is a Phase 4 enhancement). External links let the user jump
 * to MLB.com and Baseball Reference for full career numbers.
 */

const COMPARE_STATE = { a: null, b: null };

export function resetComparison() {
  COMPARE_STATE.a = null;
  COMPARE_STATE.b = null;
}

export function addToComparison(player) {
  if (!player) return null;
  if (!COMPARE_STATE.a) { COMPARE_STATE.a = player; return 'a'; }
  if (!COMPARE_STATE.b) { COMPARE_STATE.b = player; return 'b'; }
  // Both full — replace slot A, shuffle
  COMPARE_STATE.a = COMPARE_STATE.b;
  COMPARE_STATE.b = player;
  return 'b';
}

export function removeFromComparison(slot) {
  if (slot === 'a') COMPARE_STATE.a = null;
  if (slot === 'b') COMPARE_STATE.b = null;
}

export function getComparisonState() {
  return { ...COMPARE_STATE };
}

export function renderComparison() {
  const { a, b } = COMPARE_STATE;
  if (!a && !b) return '';
  return `
    <h2>Comparison</h2>
    <div class="card comparison-card">
      <div class="comparison-grid">
        ${renderSlot(a, 'A')}
        ${renderSlot(b, 'B')}
      </div>
      ${a && b ? `
        <div class="comparison-summary">
          <strong>Debut gap:</strong> ${Math.abs((a.mlbFirst || 0) - (b.mlbFirst || 0))} years ·
          <strong>Career length:</strong> ${a.yearsInMLB} vs ${b.yearsInMLB}
        </div>
      ` : '<p class="muted">Pick two players to compare. Click the Compare button on any player card.</p>'}
    </div>
  `;
}

function renderSlot(p, label) {
  if (!p) {
    return `<div class="comparison-slot empty"><div class="muted">Slot ${label} — empty</div></div>`;
  }
  const birthDate = p.birth?.year ? formatDate(p.birth.year, p.birth.month, p.birth.day) : '—';
  const birthPlace = [p.birth?.city, p.birth?.state, p.birth?.country].filter(Boolean).join(', ') || '—';
  const mlbLink = p.mlbamId ? `https://www.mlb.com/player/${p.mlbamId}` : null;
  const bbrefLink = p.bbrefId ? `https://www.baseball-reference.com/players/${p.bbrefId[0]}/${p.bbrefId}.shtml` : null;

  return `
    <div class="comparison-slot">
      <div class="comparison-label">Slot ${label}</div>
      <h3>${escapeHtml(p.nameFirst)} ${escapeHtml(p.nameLast)}</h3>
      <div class="muted">${p.mlbFirst}–${p.mlbLast} · ${p.yearsInMLB} yr${p.yearsInMLB === 1 ? '' : 's'}</div>
      <dl class="cmp-list">
        <dt>Born</dt><dd>${escapeHtml(birthDate)}</dd>
        <dt>Place</dt><dd>${escapeHtml(birthPlace)}</dd>
        <dt>MLB debut</dt><dd>${p.mlbFirst ?? '—'}</dd>
        <dt>MLB final</dt><dd>${p.mlbLast ?? '—'}</dd>
        ${p.death?.year ? `<dt>Died</dt><dd>${formatDate(p.death.year, p.death.month, p.death.day)}</dd>` : ''}
      </dl>
      <div class="external-links" style="margin-top: 0.5rem;">
        ${mlbLink ? `<a href="${mlbLink}" target="_blank" rel="noopener">MLB.com →</a>` : ''}
        ${bbrefLink ? `<a href="${bbrefLink}" target="_blank" rel="noopener">BBRef →</a>` : ''}
      </div>
    </div>
  `;
}

function formatDate(year, month, day) {
  if (!year) return '—';
  if (!month) return String(year);
  const mm = String(month).padStart(2, '0');
  if (!day) return `${year}-${mm}`;
  return `${year}-${mm}-${String(day).padStart(2, '0')}`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
