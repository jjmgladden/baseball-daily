/**
 * Splash screen — v1
 *
 * Eye-catching intro shown once per browser session. Runs ~7.5 seconds
 * total with:
 *   - Baseball icon rolls in from the left, bounces, spins
 *   - Title lines slide up one at a time (white / gold / Cardinals red)
 *   - Subtitle fades in
 *   - Auto-dismisses at 7s, or on any click
 *
 * Skipped entirely for visitors with prefers-reduced-motion.
 * Skipped after first run per session (sessionStorage).
 */

const SESSION_KEY = 'baseball-daily.splash-shown-session.v1';

export function showSplash() {
  // Already shown this session — bail silently.
  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
  } catch { /* sessionStorage blocked — show the splash anyway */ }

  // Respect motion-sensitivity.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
    return;
  }

  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}

  const overlay = document.createElement('div');
  overlay.className = 'splash-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', "Ozark Joe's Baseball Daily Intelligence Report");
  overlay.innerHTML = `
    <div class="splash-content">
      <div class="splash-baseball" aria-hidden="true">⚾</div>
      <h1 class="splash-title">
        <span class="splash-word splash-word-1">Ozark Joe's</span>
        <span class="splash-word splash-word-2">Baseball Daily</span>
        <span class="splash-word splash-word-3">Intelligence Report</span>
      </h1>
      <div class="splash-subtitle">Cardinals pinned · Nationals up next · All MLB covered</div>
      <div class="splash-skip">click anywhere to continue</div>
    </div>
  `;

  document.body.appendChild(overlay);

  let dismissed = false;
  const dismissTimer = setTimeout(dismiss, 7000);

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(dismissTimer);
    overlay.classList.add('is-dismissing');
    setTimeout(() => overlay.remove(), 500);
  }

  overlay.addEventListener('click', dismiss);
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape' || e.key === 'Enter') {
      dismiss();
      document.removeEventListener('keydown', escHandler);
    }
  }, { once: false });
}
