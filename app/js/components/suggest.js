/**
 * Suggest-a-player-or-moment modal — v1
 *
 * Opens a form modal, collects a submission, posts to the Cloudflare
 * Worker (baseball-daily-submit), which opens a GitHub Issue on the
 * owner's repo for review.
 *
 * Configuration: update SUBMIT_URL below with your deployed Worker URL.
 * Until deployed, the modal shows a friendly "not yet configured" message.
 */

const SUBMIT_URL = 'https://baseball-daily-submit.REPLACE-ME.workers.dev';

export function attachSuggestHandler(triggerSelector) {
  document.addEventListener('click', e => {
    const trigger = e.target.closest(triggerSelector);
    if (!trigger) return;
    e.preventDefault();
    openModal();
  });
}

function openModal() {
  // Remove any existing modal
  document.querySelector('.suggest-modal-backdrop')?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'suggest-modal-backdrop';
  backdrop.innerHTML = `
    <div class="suggest-modal" role="dialog" aria-modal="true" aria-labelledby="suggest-title">
      <div class="suggest-modal-header">
        <h2 id="suggest-title">Suggest a player or moment</h2>
        <button class="suggest-close" aria-label="Close">×</button>
      </div>

      <form class="suggest-form" novalidate>
        <label>
          <span>Type</span>
          <select name="type" required>
            <option value="player">Player / Legend</option>
            <option value="moment">Historical Moment</option>
            <option value="other">Other (coach, umpire, broadcaster, etc.)</option>
          </select>
        </label>

        <label>
          <span>Name or title <span class="req">*</span></span>
          <input type="text" name="name" required minlength="2" maxlength="200"
                 placeholder="e.g. Curt Flood / 1960 WS Game 7 walk-off" />
        </label>

        <label>
          <span>Why they're notable <span class="req">*</span></span>
          <textarea name="reason" required minlength="10" maxlength="2000" rows="4"
                    placeholder="A few sentences. What should someone know about this person or moment?"></textarea>
        </label>

        <label>
          <span>Source link <span class="muted">(optional)</span></span>
          <input type="url" name="source" maxlength="500"
                 placeholder="https://... — Wikipedia, SABR, MLB.com, etc." />
        </label>

        <label>
          <span>Your name <span class="muted">(optional)</span></span>
          <input type="text" name="submitterName" maxlength="100" />
        </label>

        <label>
          <span>Your email <span class="muted">(optional, for follow-up)</span></span>
          <input type="email" name="submitterEmail" maxlength="200" />
        </label>

        <!-- Honeypot — bots fill this, real users don't see it -->
        <input type="text" name="website" class="suggest-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />

        <div class="suggest-message" role="status" aria-live="polite"></div>

        <div class="suggest-actions">
          <button type="button" class="btn-secondary suggest-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Submit suggestion</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  const closeBtn = backdrop.querySelector('.suggest-close');
  const cancelBtn = backdrop.querySelector('.suggest-cancel');
  const form = backdrop.querySelector('.suggest-form');
  const msg = backdrop.querySelector('.suggest-message');

  const close = () => {
    backdrop.remove();
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (SUBMIT_URL.includes('REPLACE-ME')) {
      msg.textContent = 'The submission endpoint is not yet configured. See worker/README.md.';
      msg.className = 'suggest-message error';
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (data.website && data.website.trim()) {
      // Honeypot triggered — silently close
      close();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    msg.textContent = 'Submitting…';
    msg.className = 'suggest-message';

    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        msg.textContent = result.error || `Submission failed (${res.status}).`;
        msg.className = 'suggest-message error';
        submitBtn.disabled = false;
        return;
      }

      msg.innerHTML = `Thanks! Submission received${result.issueUrl ? ` — <a href="${escapeAttr(result.issueUrl)}" target="_blank" rel="noopener">track it here</a>` : ''}.`;
      msg.className = 'suggest-message success';
      form.reset();
      setTimeout(close, 3500);
    } catch (err) {
      msg.textContent = 'Network error — please try again.';
      msg.className = 'suggest-message error';
      submitBtn.disabled = false;
    }
  });
}

function escapeAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
