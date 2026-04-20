/**
 * Streak / recent-form renderer — v1
 *
 * Consumes the `recentForm` block from a snapshot (cardinals.recentForm,
 * nationals.recentForm) and renders a compact card showing streak, last 10,
 * home/road splits, and the recent game row.
 */

export function renderRecentForm(form, teamLabel) {
  if (!form || !form.gamesAnalyzed) {
    return `
      <div class="card">
        <h3>${escapeHtml(teamLabel)} · Recent Form</h3>
        <p class="muted">No completed games in the last 14 days.</p>
      </div>
    `;
  }

  const streakCls = form.streakCode?.startsWith('W') ? 'streak-win'
                  : form.streakCode?.startsWith('L') ? 'streak-loss' : '';

  return `
    <div class="card">
      <h3>${escapeHtml(teamLabel)} · Recent Form <span class="muted">(last ${form.gamesAnalyzed})</span></h3>
      <div class="grid grid-3" style="margin-bottom: 0.75rem;">
        <div>
          <div class="muted">Streak</div>
          <div class="streak-pill ${streakCls}">${escapeHtml(form.streakCode || '—')}</div>
        </div>
        <div>
          <div class="muted">Last 10</div>
          <div><strong>${form.last10?.wins ?? 0}-${form.last10?.losses ?? 0}</strong></div>
        </div>
        <div>
          <div class="muted">Home / Away</div>
          <div><strong>${escapeHtml(form.homeAway?.home || '—')}</strong> · <strong>${escapeHtml(form.homeAway?.away || '—')}</strong></div>
        </div>
      </div>
      <div class="form-strip" aria-label="Recent games">
        ${(form.games || []).map(g => {
          const cls = g.result === 'W' ? 'g-w' : 'g-l';
          const home = g.home ? 'vs' : '@';
          return `
            <span class="form-game ${cls}" title="${escapeHtml(g.date)} ${home} ${escapeHtml(g.opponent)} ${g.usScore}-${g.themScore}">
              ${g.result}
            </span>
          `;
        }).join('')}
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
