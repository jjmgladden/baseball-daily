/**
 * Daily Report tab — v3
 *
 * Layout:
 *   Cardinals pin (injuries badge) + Nationals pin (injuries badge)
 *   Season Progress
 *   Cardinals Recent Form + Nationals Recent Form
 *   Daily Trivia
 *   On This Day
 *   Recent Trades
 *   Scoreboard
 *   Standings
 *   League-wide Injuries
 */

import { renderRecentForm } from '../components/streak.js';
import { renderTriviaCard } from '../components/trivia.js';
import { renderHighlights } from '../components/highlights.js';
import { renderRecap, renderRecapCompact } from '../components/recap.js';

const CARDS_ID = 138;
const NATS_ID = 120;

const DIVISION_NAMES = {
  200: 'AL West', 201: 'AL East', 202: 'AL Central',
  203: 'NL West', 204: 'NL East', 205: 'NL Central',
};

export function renderDaily(root, snap) {
  if (!root) return;
  root.innerHTML = `
    <h1>Daily Report <span class="muted">— ${escapeHtml(snap.date)}</span></h1>

    ${renderTeamPin('St. Louis Cardinals', snap.cardinals, 'pinned-cards', CARDS_ID)}
    ${renderTeamPin('Washington Nationals', snap.nationals, 'pinned-nats',  NATS_ID)}

    <h2>Season Progress</h2>
    <div class="card">${renderSeasonProgress(snap.seasonProgress)}</div>

    <h2>Recent Form</h2>
    <div class="grid grid-2">
      ${renderRecentForm(snap.cardinals?.recentForm, 'Cardinals')}
      ${renderRecentForm(snap.nationals?.recentForm, 'Nationals')}
    </div>

    ${renderHighlightsSection(snap)}

    ${renderNotableGamesSection(snap.notableGames || [])}

    <h2>Daily Trivia</h2>
    <div class="card" id="trivia-mount"></div>

    ${renderOnThisDay(snap.onThisDay || [])}

    ${renderRecentTrades(snap.trades || [])}

    <h2>Scoreboard <span class="muted">(${(snap.scoreboard || []).length} games)</span></h2>
    <div class="card">${renderScoreboard(snap.scoreboard || [])}</div>

    <h2>Standings</h2>
    <div class="grid grid-2">${renderStandings(snap.standings || {})}</div>

    ${renderInjurySummary(snap.injuries || [])}
  `;

  // Mount the trivia widget (uses its own async loader)
  const triviaMount = root.querySelector('#trivia-mount');
  if (triviaMount) renderTriviaCard(triviaMount);
}

function renderTeamPin(label, teamData, cls, teamId) {
  if (!teamData || !teamData.game) {
    const injuryBadge = teamData?.injuries?.length
      ? ` <span class="injury-badge">${teamData.injuries.length} on IL</span>`
      : '';
    return `
      <div class="card ${cls}">
        <h2>${escapeHtml(label)}${injuryBadge}</h2>
        <p class="muted">No game yesterday.</p>
        ${renderInjuryList(teamData?.injuries || [])}
      </div>
    `;
  }
  const g = teamData.game;
  const box = teamData.boxscore;
  const homeIsUs = g.home?.id === teamId;
  const us = homeIsUs ? g.home : g.away;
  const them = homeIsUs ? g.away : g.home;
  const won = Number(us?.score ?? 0) > Number(them?.score ?? 0);

  let detail = '';
  if (box) {
    const usBox = homeIsUs ? box.home : box.away;
    if (usBox) {
      const topBat = (usBox.batters || []).slice().sort((a, b) => {
        const ah = parseInt(a.stats?.hits || '0', 10);
        const bh = parseInt(b.stats?.hits || '0', 10);
        return bh - ah;
      })[0];
      const starter = (usBox.pitchers || [])[0];

      const batLine = topBat
        ? `<strong>${escapeHtml(topBat.name || '')}</strong> — ` +
          `${topBat.stats?.hits ?? '—'}-for-${topBat.stats?.atBats ?? '—'}` +
          (topBat.stats?.homeRuns ? `, ${topBat.stats.homeRuns} HR` : '') +
          (topBat.stats?.rbi ? `, ${topBat.stats.rbi} RBI` : '')
        : '—';

      const pitchLine = starter
        ? `<strong>${escapeHtml(starter.name || '')}</strong> — ` +
          `${starter.stats?.inningsPitched ?? '—'} IP, ` +
          `${starter.stats?.strikeOuts ?? '—'} K, ` +
          `${starter.stats?.earnedRuns ?? '—'} ER`
        : '—';

      detail = `
        <div class="grid grid-2" style="margin-top: 0.85rem;">
          <div><div class="muted">Top bat</div><div>${batLine}</div></div>
          <div><div class="muted">Starter</div><div>${pitchLine}</div></div>
        </div>
      `;
    }
  }

  const injuryBadge = teamData?.injuries?.length
    ? ` <span class="injury-badge">${teamData.injuries.length} on IL</span>`
    : '';

  return `
    <div class="card ${cls}">
      <h2>${escapeHtml(label)}${injuryBadge} <span class="status-pill">${escapeHtml(g.status || '')}</span></h2>
      <div class="team-line">
        <span class="team-name">${escapeHtml(us?.name || '')}</span>
        <span class="team-score ${won ? 'winner' : ''}">${us?.score ?? '—'}</span>
      </div>
      <div class="team-line">
        <span class="team-name">${escapeHtml(them?.name || '')}</span>
        <span class="team-score ${!won ? 'winner' : ''}">${them?.score ?? '—'}</span>
      </div>
      <div class="muted" style="font-size: 0.85rem; margin-top: 0.45rem;">
        ${homeIsUs ? 'vs.' : '@'} ${escapeHtml(them?.name || '')}${g.venue ? ' · ' + escapeHtml(g.venue) : ''}
      </div>
      ${detail}
      ${teamData?.recap ? renderRecap(teamData.recap, label, teamId, g) : ''}
      ${renderInjuryList(teamData?.injuries || [])}
    </div>
  `;
}

function renderNotableGamesSection(games) {
  if (!games.length) return '';
  return `
    <h2>Other Notable Games <span class="muted">(${games.length})</span></h2>
    <p class="muted" style="margin-bottom: 0.75rem;">Games that stood out — one-run finishes, shutouts, blowouts, and slugfests.</p>
    <div class="grid grid-2">
      ${games.map(g => renderRecapCompact(g.recap, g, g.notableReasons)).join('')}
    </div>
  `;
}

function renderHighlightsSection(snap) {
  const cardsV = snap.cardinals?.highlights || [];
  const natsV = snap.nationals?.highlights || [];
  if (!cardsV.length && !natsV.length) {
    if (snap.youtubeEnabled === false) {
      return `
        <h2>Highlight Videos</h2>
        <div class="card">
          <p class="muted">Highlights will appear here once the YouTube API key is configured. See <code>docs/youtube-api-setup.md</code>.</p>
        </div>
      `;
    }
    return '';
  }
  return `
    <h2>Highlight Videos</h2>
    ${renderHighlights(cardsV, 'Cardinals')}
    ${renderHighlights(natsV, 'Nationals')}
  `;
}

function renderInjuryList(injuries) {
  if (!injuries.length) return '';
  return `
    <details class="injury-details" style="margin-top: 0.75rem;">
      <summary class="muted">Injury list (${injuries.length})</summary>
      <ul class="injury-list">
        ${injuries.map(i => `
          <li>
            <span class="injury-status">${escapeHtml(i.statusLabel)}</span>
            <strong>${escapeHtml(i.playerName || '')}</strong>
            <span class="muted">${escapeHtml(i.position || '')}</span>
          </li>
        `).join('')}
      </ul>
    </details>
  `;
}

function renderOnThisDay(events) {
  if (!events.length) return '';
  return `
    <h2>On This Day</h2>
    <div class="card">
      <ul class="on-this-day-list">
        ${events.slice(0, 6).map(e => `
          <li>
            <span class="year-badge">${escapeHtml(String(e.year || '—'))}</span>
            <div>
              <strong>${escapeHtml(e.title || '')}</strong>
              ${e.description ? `<div class="muted">${escapeHtml(e.description)}</div>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderRecentTrades(trades) {
  if (!trades.length) return '';
  return `
    <h2>Recent Trades <span class="muted">(last 7 days)</span></h2>
    <div class="card">
      <ul class="trade-list">
        ${trades.slice(0, 8).map(t => `
          <li>
            <span class="muted">${escapeHtml(t.date || '')}</span>
            <span>${escapeHtml(t.description || '')}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderScoreboard(games) {
  if (!games.length) return `<p class="muted">No games yesterday.</p>`;
  return games.map(g => {
    const homeWon = Number(g.home?.score ?? 0) > Number(g.away?.score ?? 0);
    return `
      <div class="game-row">
        <div class="team-line">
          <span class="team-name">${escapeHtml(g.away?.name || '')}</span>
          <span class="team-score ${!homeWon ? 'winner' : ''}">${g.away?.score ?? '—'}</span>
        </div>
        <div class="status-pill">${escapeHtml(g.status || '')}</div>
        <div class="team-line">
          <span class="team-score ${homeWon ? 'winner' : ''}">${g.home?.score ?? '—'}</span>
          <span class="team-name">${escapeHtml(g.home?.name || '')}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderStandings(divisions) {
  const divs = Object.values(divisions);
  if (!divs.length) return `<p class="muted">No standings data.</p>`;
  return divs.map(div => {
    const name = DIVISION_NAMES[div.divisionId] || `Division ${div.divisionId}`;
    return `
      <div class="card">
        <h3>${escapeHtml(name)}</h3>
        <table class="standings-table">
          <thead>
            <tr><th>Team</th><th class="num">W</th><th class="num">L</th><th class="num">PCT</th><th class="num">GB</th><th class="num">Strk</th></tr>
          </thead>
          <tbody>
            ${(div.teams || []).map(t => {
              const cls = t.teamId === CARDS_ID ? 'highlight-cards'
                        : t.teamId === NATS_ID  ? 'highlight-nats' : '';
              return `
                <tr class="${cls}">
                  <td>${escapeHtml(t.name || '')}</td>
                  <td class="num">${t.wins ?? '—'}</td>
                  <td class="num">${t.losses ?? '—'}</td>
                  <td class="num">${t.winPct ?? '—'}</td>
                  <td class="num">${t.gamesBack ?? '—'}</td>
                  <td class="num">${t.streak || '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

function renderInjurySummary(injuries) {
  if (!injuries.length) return '';
  const byTeam = {};
  for (const i of injuries) {
    if (!byTeam[i.teamName]) byTeam[i.teamName] = [];
    byTeam[i.teamName].push(i);
  }
  const teams = Object.keys(byTeam).sort();
  return `
    <h2>League-Wide Injuries <span class="muted">(${injuries.length} players)</span></h2>
    <div class="card">
      <details>
        <summary class="muted">Expand injury list by team</summary>
        <div class="grid grid-2" style="margin-top: 0.75rem;">
          ${teams.map(team => `
            <div>
              <strong>${escapeHtml(team)}</strong>
              <ul class="injury-list">
                ${byTeam[team].map(i => `
                  <li>
                    <span class="injury-status">${escapeHtml(i.statusLabel)}</span>
                    ${escapeHtml(i.playerName || '')}
                    <span class="muted">${escapeHtml(i.position || '')}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </details>
    </div>
  `;
}

function renderSeasonProgress(p) {
  if (!p) return `<p class="muted">No progress data.</p>`;
  const pct = Math.round((p.regularSeasonPct || 0) * 100);
  const sourceLabel = p.source === 'api' ? 'live API' : 'fallback';
  return `
    <div class="progress-block">
      <div class="progress-label">
        <span>Regular season</span>
        <span>${pct}% complete <span class="muted" style="font-size: 0.75rem;">(${escapeHtml(sourceLabel)})</span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>
    </div>
    <div class="grid grid-3" style="margin-top: 1rem;">
      <div><div class="muted">Phase</div><div><strong>${escapeHtml(p.phase || '—')}</strong></div></div>
      <div><div class="muted">Days to All-Star</div><div><strong>${formatDays(p.daysToAllStar)}</strong></div></div>
      <div><div class="muted">Days to Playoffs</div><div><strong>${formatDays(p.daysToPlayoffs)}</strong></div></div>
    </div>
  `;
}

function formatDays(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n < 0) return `${Math.abs(n)} days ago`;
  return `${n}`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
