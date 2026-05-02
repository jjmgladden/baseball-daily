// confidence-badge.js — T1/T2/T3 source-confidence badge for news items.
// Direct port of pickleball component (Session 7 reference for B5).
//
// T1 (official authoritative): no badge — items render normally.
// T2 (reliable creator): "T2" badge.
// T3 (editorial / opinion): "editorial" badge.
// developing: "developing" badge for fast-unverified content.

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function confidenceBadgeHtml(tier) {
  const t = (tier || '').toLowerCase();
  if (t === 't1') return '';
  if (t === 't2') return '<span class="badge-confidence t2">T2</span>';
  if (t === 't3') return '<span class="badge-confidence t3">editorial</span>';
  if (t === 'developing') return '<span class="badge-confidence developing">developing</span>';
  return '';
}
