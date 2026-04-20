/**
 * Game recap renderer — v1
 *
 * Turns the structured recap payload (from ingestion/lib/recap.js) into
 * readable HTML. All values are direct API facts — this renderer just
 * presents them with narrative framing.
 */

export function renderRecap(recap, teamLabel, teamId, snapshotGame) {
  if (!recap) return '';

  const homeIsUs = snapshotGame?.home?.id === teamId;
  const usScore = homeIsUs ? recap.linescore?.totals?.home?.runs : recap.linescore?.totals?.away?.runs;
  const themScore = homeIsUs ? recap.linescore?.totals?.away?.runs : recap.linescore?.totals?.home?.runs;
  const themName = homeIsUs ? snapshotGame?.away?.name : snapshotGame?.home?.name;

  // Narrative top line — pure facts
  const resultVerb = usScore > themScore ? 'beat' : usScore < themScore ? 'fell to' : 'tied';
  const venueLine = recap.venue ? ` at ${escapeHtml(recap.venue)}` : '';
  const narrative = `The ${escapeHtml(teamLabel)} ${resultVerb} the ${escapeHtml(themName || 'opponent')} ${usScore ?? '—'}-${themScore ?? '—'}${venueLine}.`;

  return `
    <div class="recap-block">
      <div class="recap-narrative">${narrative}</div>
      ${renderGameInfoLine(recap)}
      ${renderLinescoreTable(recap.linescore, snapshotGame)}
      ${renderScoringPlays(recap.scoringPlays)}
      ${renderDecisions(recap.decisions)}
    </div>
  `;
}

/**
 * Smaller variant used for non-Cards/Nats notable games.
 */
export function renderRecapCompact(recap, game, notableReasons) {
  if (!recap) return renderCompactFallback(game, notableReasons);

  const scoringCount = (recap.scoringPlays || []).length;
  const reasonsText = notableReasons?.length ? ` · ${escapeHtml(notableReasons.join(', '))}` : '';

  return `
    <div class="card notable-game-card">
      <div class="notable-game-header">
        <span class="team-name">${escapeHtml(game.away?.name || '')}</span>
        <span class="team-score ${Number(game.away?.score) > Number(game.home?.score) ? 'winner' : ''}">${game.away?.score ?? '—'}</span>
        <span class="muted">@</span>
        <span class="team-score ${Number(game.home?.score) > Number(game.away?.score) ? 'winner' : ''}">${game.home?.score ?? '—'}</span>
        <span class="team-name">${escapeHtml(game.home?.name || '')}</span>
      </div>
      <div class="muted notable-reasons">${escapeHtml(game.status || '')}${reasonsText}</div>
      ${renderScoringPlaysCompact(recap.scoringPlays)}
      ${renderDecisions(recap.decisions)}
    </div>
  `;
}

function renderCompactFallback(game, notableReasons) {
  const reasonsText = notableReasons?.length ? ` · ${escapeHtml(notableReasons.join(', '))}` : '';
  return `
    <div class="card notable-game-card">
      <div class="notable-game-header">
        <span class="team-name">${escapeHtml(game.away?.name || '')}</span>
        <span class="team-score">${game.away?.score ?? '—'}</span>
        <span class="muted">@</span>
        <span class="team-score">${game.home?.score ?? '—'}</span>
        <span class="team-name">${escapeHtml(game.home?.name || '')}</span>
      </div>
      <div class="muted notable-reasons">${escapeHtml(game.status || '')}${reasonsText}</div>
    </div>
  `;
}

function renderGameInfoLine(recap) {
  const bits = [];
  if (recap.gameInfo?.gameDurationMinutes) {
    const h = Math.floor(recap.gameInfo.gameDurationMinutes / 60);
    const m = recap.gameInfo.gameDurationMinutes % 60;
    bits.push(`Game time ${h}:${String(m).padStart(2, '0')}`);
  }
  if (recap.gameInfo?.attendance) {
    bits.push(`Attendance ${Number(recap.gameInfo.attendance).toLocaleString()}`);
  }
  if (recap.weather) bits.push(escapeHtml(recap.weather));
  if (!bits.length) return '';
  return `<div class="muted recap-gameinfo">${bits.join(' · ')}</div>`;
}

function renderLinescoreTable(ls, game) {
  if (!ls || !ls.innings?.length) return '';
  const innings = ls.innings;
  const maxInn = Math.max(9, innings.length);
  const awayName = game?.away?.name || 'Away';
  const homeName = game?.home?.name || 'Home';

  const headerCells = Array.from({ length: maxInn }, (_, i) => `<th class="num">${i + 1}</th>`).join('');
  const awayCells = Array.from({ length: maxInn }, (_, i) => {
    const v = innings[i]?.away;
    return `<td class="num">${v ?? ''}</td>`;
  }).join('');
  const homeCells = Array.from({ length: maxInn }, (_, i) => {
    const v = innings[i]?.home;
    return `<td class="num">${v ?? ''}</td>`;
  }).join('');

  return `
    <h4>Linescore</h4>
    <table class="linescore-table">
      <thead>
        <tr>
          <th></th>
          ${headerCells}
          <th class="num total-col">R</th>
          <th class="num total-col">H</th>
          <th class="num total-col">E</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(awayName)}</td>
          ${awayCells}
          <td class="num total-col">${ls.totals?.away?.runs ?? '—'}</td>
          <td class="num total-col">${ls.totals?.away?.hits ?? '—'}</td>
          <td class="num total-col">${ls.totals?.away?.errors ?? '—'}</td>
        </tr>
        <tr>
          <td>${escapeHtml(homeName)}</td>
          ${homeCells}
          <td class="num total-col">${ls.totals?.home?.runs ?? '—'}</td>
          <td class="num total-col">${ls.totals?.home?.hits ?? '—'}</td>
          <td class="num total-col">${ls.totals?.home?.errors ?? '—'}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderScoringPlays(plays) {
  if (!plays?.length) return '';
  return `
    <h4>Scoring Plays</h4>
    <ol class="scoring-plays">
      ${plays.map(p => `
        <li>
          <span class="play-inning">${formatInning(p.halfInning, p.inning)}</span>
          <span class="play-desc">${escapeHtml(p.description || '')}</span>
          <span class="play-score muted">${p.awayScore}-${p.homeScore}</span>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderScoringPlaysCompact(plays) {
  if (!plays?.length) return '';
  return `
    <details class="scoring-plays-details" style="margin-top: 0.6rem;">
      <summary class="muted">Scoring plays (${plays.length})</summary>
      <ol class="scoring-plays">
        ${plays.map(p => `
          <li>
            <span class="play-inning">${formatInning(p.halfInning, p.inning)}</span>
            <span class="play-desc">${escapeHtml(p.description || '')}</span>
            <span class="play-score muted">${p.awayScore}-${p.homeScore}</span>
          </li>
        `).join('')}
      </ol>
    </details>
  `;
}

function renderDecisions(d) {
  if (!d) return '';
  const parts = [];
  if (d.winner?.name) parts.push(`<strong>W:</strong> ${escapeHtml(d.winner.name)}`);
  if (d.loser?.name)  parts.push(`<strong>L:</strong> ${escapeHtml(d.loser.name)}`);
  if (d.save?.name)   parts.push(`<strong>Sv:</strong> ${escapeHtml(d.save.name)}`);
  if (!parts.length) return '';
  return `<div class="decisions">${parts.join(' · ')}</div>`;
}

function formatInning(halfInning, inning) {
  if (!inning) return '—';
  const arrow = halfInning === 'top' ? '▲' : '▼';
  return `<span title="${halfInning === 'top' ? 'Top' : 'Bottom'} of ${inning}">${arrow}${inning}</span>`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
