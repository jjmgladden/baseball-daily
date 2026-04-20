/**
 * Daily Trivia — v1
 *
 * Deterministic pick by day-of-year: the same date always shows the same
 * question, so refreshes don't re-roll. Answer is hidden until revealed.
 */

import { loadMaster } from '../data-loader.js';

const STORAGE_KEY = 'baseball-daily.trivia-revealed.v1';

export async function renderTriviaCard(mount) {
  if (!mount) return;

  let data;
  try { data = await loadMaster('trivia.json'); }
  catch (err) {
    mount.innerHTML = `<p class="muted">Trivia unavailable: ${escapeHtml(err.message)}</p>`;
    return;
  }

  const questions = data.questions || [];
  if (!questions.length) {
    mount.innerHTML = `<p class="muted">No trivia questions loaded.</p>`;
    return;
  }

  const pick = pickDaily(questions);
  const today = new Date().toISOString().slice(0, 10);
  const revealed = sessionStorage.getItem(`${STORAGE_KEY}.${today}`) === '1';

  mount.innerHTML = `
    <div class="trivia-block">
      <div class="trivia-category">${escapeHtml(formatCategory(pick.category))}</div>
      <div class="trivia-question">${escapeHtml(pick.question)}</div>
      <div class="trivia-answer-wrap">
        <button class="btn-reveal" id="trivia-reveal-btn" ${revealed ? 'hidden' : ''}>Show answer</button>
        <div class="trivia-answer" ${revealed ? '' : 'hidden'}>
          <strong>Answer:</strong> ${escapeHtml(pick.answer)}
        </div>
      </div>
    </div>
  `;

  const btn = mount.querySelector('#trivia-reveal-btn');
  const ans = mount.querySelector('.trivia-answer');
  if (btn && ans) {
    btn.addEventListener('click', () => {
      btn.hidden = true;
      ans.hidden = false;
      sessionStorage.setItem(`${STORAGE_KEY}.${today}`, '1');
    });
  }
}

function pickDaily(list) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return list[dayOfYear % list.length];
}

function formatCategory(c) {
  if (!c) return 'Trivia';
  return c.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
