/**
 * Email template builder — v2
 *
 * Builds the rich HTML body + plain-text fallback + subject for the
 * morning email from a fresh daily snapshot. No external dependencies.
 *
 * v2 sections (in display order):
 *   1. Header
 *   2. Cardinals pin       — adds scoring play + W/L/Sv decisions
 *   3. Nationals pin       — adds scoring play + W/L/Sv decisions
 *   4. Today's Schedule    — NEW. Cards/Nats + up to 3 league marquee games
 *                              with probable pitchers (snapshot v6+)
 *   5. Top Highlights      — NEW. Cards + Nats highlights with mqdefault
 *                              thumbnails (120×68) and click-out links
 *   6. Division Standings  — NEW. All NL + AL, top 3 per division (18 rows)
 *                              Cards highlighted in NL Central; Nats in NL East
 *   7. Notable Games       — NEW. One-liners from snapshot.notableGames
 *                              (one-run / shutout / blowout / slugfest /
 *                              pitchers' duel)
 *   8. On This Day         — top 2 entries (unchanged)
 *   9. CTA button          — unchanged
 *  10. Stats footer        — unchanged
 *
 * Design goals (unchanged):
 *   - Renders well in Gmail, Outlook, Apple Mail, mobile clients
 *   - Inline styles only (many clients strip <style> blocks)
 *   - Degrades to plain text if HTML is blocked
 *   - Dark-theme-friendly background but readable in light mode too
 */

const SITE_URL = 'https://jjmgladden.github.io/baseball-daily/';
const CARDS_ID = 138;
const NATS_ID = 120;

// MLB Stats API division IDs
const DIVISION_LABELS = {
  201: 'AL East',
  202: 'AL Central',
  200: 'AL West',
  204: 'NL East',
  205: 'NL Central',
  203: 'NL West',
};
// Display order: AL East/Central/West, then NL East/Central/West
const DIVISION_ORDER = [201, 202, 200, 204, 205, 203];

// Classic rivalries (team-id pairs, unordered). Used as a tiebreaker signal
// when picking marquee games for Today's Schedule.
const RIVALRY_PAIRS = [
  [147, 111], // Yankees - Red Sox
  [119, 137], // Dodgers - Giants
  [121, 143], // Mets - Phillies
  [145, 112], // White Sox - Cubs
  [147, 121], // Yankees - Mets
  [133, 137], // Athletics - Giants
  [134, 142], // Pirates - Twins (historic Game 7 1991... weak; keeping list short)
];

const COLORS = {
  bg:        '#0E1821',
  card:      '#1E3148',
  cardLow:   '#152230',
  border:    '#2A3F5A',
  text:      '#E8EAED',
  textDim:   '#C4C7CC',
  white:     '#FFFFFF',
  cardsRed:  '#C41E3A',
  natsRed:   '#AB0003',
  cardsGold: '#FEDB00',
  accent:    '#00B4D8',
  win:       '#4ADE80',
  loss:      '#F87171',
};

/**
 * Build email fields from a snapshot.
 * @param {object} snapshot  — parsed data/snapshots/latest.json
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildEmail(snapshot) {
  const date = snapshot?.date || new Date().toISOString().slice(0, 10);
  const dateFormatted = formatLongDate(date);

  const cardsLine = oneLineGameResult(snapshot?.cardinals?.game, CARDS_ID, 'Cardinals');
  const natsLine = oneLineGameResult(snapshot?.nationals?.game, NATS_ID, 'Nationals');

  const subject = buildSubject(cardsLine, natsLine, dateFormatted);
  const html = buildHtml(snapshot, dateFormatted, cardsLine, natsLine);
  const text = buildPlainText(snapshot, dateFormatted, cardsLine, natsLine);

  return { subject, html, text };
}

function buildSubject(cardsLine, natsLine, dateFormatted) {
  // Prefer leading with Cardinals result, since they're the pinned team.
  if (cardsLine && cardsLine.status === 'Final') {
    const verb = cardsLine.won ? 'win' : 'fall';
    const opp = cardsLine.opponent || 'opponent';
    return `⚾ Cardinals ${verb} ${cardsLine.score} vs ${opp} — ${dateFormatted}`;
  }
  if (natsLine && natsLine.status === 'Final') {
    const verb = natsLine.won ? 'win' : 'fall';
    const opp = natsLine.opponent || 'opponent';
    return `⚾ Nationals ${verb} ${natsLine.score} vs ${opp} — ${dateFormatted}`;
  }
  return `⚾ Ozark Joe's Baseball Daily — ${dateFormatted}`;
}

// ---------------------------------------------------------------------------
// HTML BODY
// ---------------------------------------------------------------------------

function buildHtml(snap, dateFormatted, cardsLine, natsLine) {
  const onThisDay = (snap?.onThisDay || []).slice(0, 2);
  const tradesCount = (snap?.trades || []).length;
  const injuriesCount = (snap?.injuries || []).length;
  const gamesCount = (snap?.scoreboard || []).length;

  const cardsRecap = snap?.cardinals?.recap;
  const natsRecap = snap?.nationals?.recap;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:${COLORS.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:${COLORS.text};">
  <div style="max-width:600px; margin:0 auto; padding:24px 16px;">

    ${headerHtml(dateFormatted)}

    ${teamPinHtml({
      label: 'St. Louis Cardinals',
      accent: COLORS.cardsRed,
      line: cardsLine,
      recap: cardsRecap,
      highlightsCount: snap?.cardinals?.highlights?.length || 0,
    })}

    ${teamPinHtml({
      label: 'Washington Nationals',
      accent: COLORS.natsRed,
      line: natsLine,
      recap: natsRecap,
      highlightsCount: snap?.nationals?.highlights?.length || 0,
    })}

    ${todaysScheduleHtml(snap)}

    ${highlightsHtml(snap)}

    ${standingsHtml(snap)}

    ${notableGamesHtml(snap)}

    ${onThisDayHtml(onThisDay)}

    <!-- Call-to-action button -->
    <div style="text-align:center; margin:32px 0 20px;">
      <a href="${SITE_URL}" style="background:${COLORS.cardsRed}; color:${COLORS.white}; text-decoration:none; padding:14px 28px; border-radius:8px; font-size:16px; font-weight:600; display:inline-block;">
        Open the full report →
      </a>
    </div>

    <!-- Stats footer -->
    <div style="text-align:center; font-size:12px; color:${COLORS.textDim}; margin-top:20px;">
      ${gamesCount} game${gamesCount === 1 ? '' : 's'} yesterday
      ${tradesCount ? ` · ${tradesCount} trade${tradesCount === 1 ? '' : 's'}` : ''}
      ${injuriesCount ? ` · ${injuriesCount} on the IL league-wide` : ''}
    </div>

    <!-- Meta footer -->
    <div style="border-top:1px solid ${COLORS.border}; padding-top:16px; margin-top:28px; font-size:11px; color:${COLORS.textDim}; text-align:center;">
      You're subscribed to the daily morning briefing from Ozark Joe's Baseball Daily Intelligence Report.<br>
      <a href="${SITE_URL}" style="color:${COLORS.accent}; text-decoration:none;">${SITE_URL}</a>
    </div>

  </div>
</body>
</html>`.trim();
}

function headerHtml(dateFormatted) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="left">
          <div style="font-size:28px;">⚾</div>
          <div style="font-size:20px; font-weight:700; color:${COLORS.white}; margin-top:6px;">
            Ozark Joe's Baseball Daily
          </div>
          <div style="font-size:13px; color:${COLORS.textDim}; margin-top:2px;">
            ${escapeHtml(dateFormatted)}
          </div>
        </td>
      </tr>
    </table>`;
}

function teamPinHtml({ label, accent, line, recap, highlightsCount }) {
  const decisionsLine = recapDecisionsHtml(recap, line);
  const scoringLine = recapFirstScoringHtml(recap);

  return `
    <div style="background:${COLORS.card}; border:1px solid ${COLORS.border}; border-left:4px solid ${accent}; border-radius:8px; padding:16px; margin-top:20px;">
      <div style="font-size:13px; color:${COLORS.textDim}; text-transform:uppercase; letter-spacing:0.06em;">${escapeHtml(label)}</div>
      <div style="font-size:18px; color:${COLORS.white}; margin-top:4px; font-weight:600;">
        ${line ? formatGameLineHtml(line) : `<span style="color:${COLORS.textDim};">No game scheduled</span>`}
      </div>
      ${decisionsLine ? `<div style="font-size:13px; color:${COLORS.textDim}; margin-top:6px;">${decisionsLine}</div>` : ''}
      ${scoringLine ? `<div style="font-size:13px; color:${COLORS.text}; margin-top:8px; line-height:1.4;">${scoringLine}</div>` : ''}
      ${highlightsCount ? `<div style="font-size:12px; color:${COLORS.accent}; margin-top:8px;">▸ ${highlightsCount} highlight video${highlightsCount === 1 ? '' : 's'} below</div>` : ''}
    </div>`;
}

function recapDecisionsHtml(recap, line) {
  if (!recap?.decisions) return '';
  if (line && line.status !== 'Final') return '';
  const d = recap.decisions;
  const parts = [];
  if (d.winner?.name) parts.push(`<span style="color:${COLORS.win};">WP</span> ${escapeHtml(d.winner.name)}`);
  if (d.loser?.name) parts.push(`<span style="color:${COLORS.loss};">LP</span> ${escapeHtml(d.loser.name)}`);
  if (d.save?.name) parts.push(`<span style="color:${COLORS.accent};">SV</span> ${escapeHtml(d.save.name)}`);
  return parts.join(' &nbsp;·&nbsp; ');
}

function recapFirstScoringHtml(recap) {
  const sp = recap?.scoringPlays?.[0];
  if (!sp?.description) return '';
  const inning = sp.halfInning && sp.inning
    ? `${sp.halfInning === 'top' ? 'Top' : 'Bot'} ${sp.inning}`
    : '';
  const prefix = inning ? `<strong>${inning}:</strong> ` : '';
  return `${prefix}${escapeHtml(sp.description)}`;
}

// --- Today's Schedule ------------------------------------------------------

function todaysScheduleHtml(snap) {
  const all = snap?.todaysSchedule || [];
  if (!all.length) return '';

  const standings = snap?.standings || {};
  const picks = pickMarqueeGames(all, standings);
  if (!picks.length) return '';

  const dateStr = snap?.todaysScheduleDate || '';
  const dateLabel = dateStr ? ` — ${escapeHtml(formatShortDate(dateStr))}` : '';

  const rows = picks.map(({ game, kind }) => {
    const home = game.home || {};
    const away = game.away || {};
    const homeName = teamShortName(home.name);
    const awayName = teamShortName(away.name);
    const homePP = home.probablePitcher?.name;
    const awayPP = away.probablePitcher?.name;
    const time = game.gameDate ? formatTimeET(game.gameDate) : '';
    const venue = game.venue ? `· ${escapeHtml(game.venue)}` : '';

    const matchupColor = kind === 'cards'
      ? COLORS.cardsRed
      : kind === 'nats'
        ? COLORS.natsRed
        : COLORS.accent;
    const tag = kind === 'cards'
      ? '<span style="background:#3a1424; color:#ffb3c1; font-size:10px; padding:2px 6px; border-radius:3px; text-transform:uppercase; letter-spacing:0.05em;">Cards</span>'
      : kind === 'nats'
        ? '<span style="background:#3a1414; color:#ffb3b3; font-size:10px; padding:2px 6px; border-radius:3px; text-transform:uppercase; letter-spacing:0.05em;">Nats</span>'
        : '<span style="background:#0e3a4a; color:#9be3f0; font-size:10px; padding:2px 6px; border-radius:3px; text-transform:uppercase; letter-spacing:0.05em;">Marquee</span>';

    const matchup = `<strong style="color:${COLORS.white};">${escapeHtml(awayName)}</strong> @ <strong style="color:${COLORS.white};">${escapeHtml(homeName)}</strong>`;
    const pitchers = (awayPP || homePP)
      ? `<div style="font-size:12px; color:${COLORS.textDim}; margin-top:3px;">${escapeHtml(awayPP || 'TBD')} <span style="color:${COLORS.border};">vs</span> ${escapeHtml(homePP || 'TBD')}</div>`
      : '';

    return `
      <div style="background:${COLORS.cardLow}; border:1px solid ${COLORS.border}; border-left:3px solid ${matchupColor}; border-radius:6px; padding:10px 14px; margin-top:8px;">
        <div style="font-size:14px; color:${COLORS.text};">
          ${tag} &nbsp; ${matchup}
        </div>
        ${pitchers}
        <div style="font-size:11px; color:${COLORS.textDim}; margin-top:4px;">${time}${time && venue ? ' ' : ''}${venue}</div>
      </div>`;
  }).join('');

  return `
    <div style="margin-top:24px;">
      <div style="font-size:15px; font-weight:600; color:${COLORS.cardsGold}; text-transform:uppercase; letter-spacing:0.08em;">Today's Games${dateLabel}</div>
      ${rows}
    </div>`;
}

/**
 * Marquee selection: always Cards + Nats games (if any). Then up to 3 league
 * games chosen by signal in priority order: division leader vs division
 * leader → both teams ≥ .550 → classic rivalry → first three remaining.
 * Caps at 5 total. Dedup by gamePk.
 */
function pickMarqueeGames(all, standings) {
  const picks = [];
  const used = new Set();

  const cardsG = all.find(g => g.home?.id === CARDS_ID || g.away?.id === CARDS_ID);
  const natsG = all.find(g => g.home?.id === NATS_ID || g.away?.id === NATS_ID);
  if (cardsG) { picks.push({ game: cardsG, kind: 'cards' }); used.add(cardsG.gamePk); }
  if (natsG) { picks.push({ game: natsG, kind: 'nats' }); used.add(natsG.gamePk); }

  const divisionLeaders = new Set();
  const winPctOf = new Map();
  for (const div of Object.values(standings || {})) {
    for (const t of (div.teams || [])) {
      if (String(t.divisionRank) === '1') divisionLeaders.add(t.teamId);
      const pct = parseFloat(t.winPct);
      if (!Number.isNaN(pct)) winPctOf.set(t.teamId, pct);
    }
  }

  const remaining = all.filter(g => !used.has(g.gamePk));
  const ranked = remaining.map(g => {
    const hId = g.home?.id;
    const aId = g.away?.id;
    let score = 0;
    if (divisionLeaders.has(hId) && divisionLeaders.has(aId)) score += 100;
    const hPct = winPctOf.get(hId) || 0;
    const aPct = winPctOf.get(aId) || 0;
    if (hPct >= 0.550 && aPct >= 0.550) score += 50;
    if (isRivalry(hId, aId)) score += 30;
    score += (hPct + aPct) * 10; // gentle tiebreaker by combined record
    return { game: g, score };
  }).sort((a, b) => b.score - a.score);

  for (const r of ranked) {
    if (picks.length >= 5) break;
    picks.push({ game: r.game, kind: 'marquee' });
  }

  return picks.slice(0, 5);
}

function isRivalry(a, b) {
  if (a == null || b == null) return false;
  return RIVALRY_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

// --- Highlights ------------------------------------------------------------

function highlightsHtml(snap) {
  const cards = snap?.cardinals?.highlights || [];
  const nats = snap?.nationals?.highlights || [];
  const seen = new Set();
  const merged = [];
  for (const v of [...cards, ...nats]) {
    if (!v?.videoId || seen.has(v.videoId)) continue;
    seen.add(v.videoId);
    merged.push(v);
    if (merged.length >= 5) break;
  }
  if (!merged.length) return '';

  const rows = merged.map(v => {
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(v.videoId)}`;
    const thumb = v.thumbnailUrl || `https://i.ytimg.com/vi/${encodeURIComponent(v.videoId)}/mqdefault.jpg`;
    const date = v.publishedAt ? formatShortDate(v.publishedAt.slice(0, 10)) : '';
    const channel = v.channelTitle || '';
    const meta = [channel, date].filter(Boolean).join(' · ');
    return `
      <a href="${url}" style="text-decoration:none; color:inherit; display:block; margin-top:8px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.cardLow}; border:1px solid ${COLORS.border}; border-radius:6px;">
          <tr>
            <td width="120" style="padding:8px;">
              <img src="${thumb}" width="120" height="68" alt="" style="display:block; border-radius:4px; border:0;">
            </td>
            <td style="padding:8px 12px 8px 4px; vertical-align:top;">
              <div style="font-size:13px; color:${COLORS.white}; font-weight:600; line-height:1.3;">${escapeHtml(v.title || 'Highlight video')}</div>
              ${meta ? `<div style="font-size:11px; color:${COLORS.textDim}; margin-top:4px;">${escapeHtml(meta)}</div>` : ''}
            </td>
          </tr>
        </table>
      </a>`;
  }).join('');

  return `
    <div style="margin-top:24px;">
      <div style="font-size:15px; font-weight:600; color:${COLORS.cardsGold}; text-transform:uppercase; letter-spacing:0.08em;">Top Highlights</div>
      ${rows}
    </div>`;
}

// --- Standings -------------------------------------------------------------

function standingsHtml(snap) {
  const standings = snap?.standings || {};
  if (!Object.keys(standings).length) return '';

  const blocks = DIVISION_ORDER.map(divId => {
    const div = standings[String(divId)] || standings[divId];
    if (!div?.teams?.length) return '';
    const top3 = div.teams.slice(0, 3);
    const rows = top3.map(t => {
      const isCards = t.teamId === CARDS_ID;
      const isNats = t.teamId === NATS_ID;
      const highlight = isCards
        ? `border-left:3px solid ${COLORS.cardsRed}; padding-left:6px;`
        : isNats
          ? `border-left:3px solid ${COLORS.natsRed}; padding-left:6px;`
          : '';
      const nameColor = (isCards || isNats) ? COLORS.white : COLORS.text;
      const nameWeight = (isCards || isNats) ? '700' : '500';
      return `
        <tr>
          <td style="padding:3px 6px; font-size:12px; color:${COLORS.textDim}; width:18px;">${escapeHtml(String(t.divisionRank || ''))}</td>
          <td style="padding:3px 6px; font-size:13px; color:${nameColor}; font-weight:${nameWeight}; ${highlight}">${escapeHtml(teamShortName(t.name))}</td>
          <td style="padding:3px 6px; font-size:12px; color:${COLORS.text}; text-align:right; font-family:Consolas,Menlo,monospace;">${escapeHtml(String(t.wins ?? '—'))}-${escapeHtml(String(t.losses ?? '—'))}</td>
          <td style="padding:3px 6px; font-size:12px; color:${COLORS.textDim}; text-align:right; font-family:Consolas,Menlo,monospace; width:34px;">${escapeHtml(String(t.gamesBack ?? '—'))}</td>
          <td style="padding:3px 6px; font-size:11px; color:${COLORS.textDim}; text-align:right; width:30px;">${escapeHtml(String(t.streak || ''))}</td>
        </tr>`;
    }).join('');
    return `
      <div style="margin-top:10px;">
        <div style="font-size:11px; color:${COLORS.accent}; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:2px;">${escapeHtml(DIVISION_LABELS[divId] || `Division ${divId}`)}</div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.cardLow}; border:1px solid ${COLORS.border}; border-radius:6px;">
          ${rows}
        </table>
      </div>`;
  }).filter(Boolean).join('');

  return `
    <div style="margin-top:24px;">
      <div style="font-size:15px; font-weight:600; color:${COLORS.cardsGold}; text-transform:uppercase; letter-spacing:0.08em;">Division Standings — Top 3</div>
      ${blocks}
    </div>`;
}

// --- Notable Games ---------------------------------------------------------

function notableGamesHtml(snap) {
  const games = snap?.notableGames || [];
  if (!games.length) return '';
  const rows = games.slice(0, 5).map(g => {
    const home = g.home || {};
    const away = g.away || {};
    const reason = (g.notableReasons || [])[0] || '';
    const icon = notableIcon(reason);
    return `
      <div style="background:${COLORS.cardLow}; border:1px solid ${COLORS.border}; border-radius:6px; padding:8px 12px; margin-top:6px; font-size:13px;">
        <span style="color:${COLORS.cardsGold};">${icon}</span>
        <span style="color:${COLORS.white}; font-weight:600;"> ${escapeHtml(teamShortName(away.name))} ${escapeHtml(String(away.score ?? '—'))}, ${escapeHtml(teamShortName(home.name))} ${escapeHtml(String(home.score ?? '—'))}</span>
        <span style="color:${COLORS.textDim};"> &nbsp;(${escapeHtml(reason)})</span>
      </div>`;
  }).join('');
  return `
    <div style="margin-top:24px;">
      <div style="font-size:15px; font-weight:600; color:${COLORS.cardsGold}; text-transform:uppercase; letter-spacing:0.08em;">Notable Games</div>
      ${rows}
    </div>`;
}

function notableIcon(reason) {
  if (!reason) return '◆';
  const r = String(reason).toLowerCase();
  if (r.includes('one-run')) return '◐';
  if (r.includes('shutout')) return '○';
  if (r.includes('blowout')) return '★';
  if (r.includes('slugfest')) return '⚡';
  if (r.includes('pitcher')) return '◇';
  if (r.includes('extra')) return '↻';
  if (r.includes('walk-off')) return '✦';
  return '◆';
}

// --- On This Day -----------------------------------------------------------

function onThisDayHtml(entries) {
  if (!entries.length) return '';
  return `
    <div style="margin-top:24px;">
      <div style="font-size:15px; font-weight:600; color:${COLORS.cardsGold}; text-transform:uppercase; letter-spacing:0.08em;">On This Day</div>
      ${entries.map(e => `
        <div style="background:${COLORS.cardLow}; border:1px solid ${COLORS.border}; border-radius:6px; padding:10px 14px; margin-top:10px;">
          <div style="font-family:Consolas,Menlo,monospace; font-size:13px; color:${COLORS.accent};">${escapeHtml(String(e.year || '—'))}</div>
          <div style="font-size:15px; color:${COLORS.white}; margin-top:4px;">${escapeHtml(e.title || '')}</div>
          ${e.description ? `<div style="font-size:13px; color:${COLORS.textDim}; margin-top:4px;">${escapeHtml(e.description)}</div>` : ''}
        </div>`).join('')}
    </div>`;
}

// ---------------------------------------------------------------------------
// PLAIN TEXT FALLBACK
// ---------------------------------------------------------------------------

function buildPlainText(snap, dateFormatted, cardsLine, natsLine) {
  const lines = [];

  lines.push(`OZARK JOE'S BASEBALL DAILY — ${dateFormatted}`);
  lines.push('');

  // Cardinals pin
  lines.push('ST. LOUIS CARDINALS');
  lines.push(cardsLine ? formatGameLineText(cardsLine) : '  No game scheduled');
  pinExtraText(snap?.cardinals?.recap, cardsLine, lines);
  lines.push('');

  // Nationals pin
  lines.push('WASHINGTON NATIONALS');
  lines.push(natsLine ? formatGameLineText(natsLine) : '  No game scheduled');
  pinExtraText(snap?.nationals?.recap, natsLine, lines);
  lines.push('');

  // Today's Schedule
  const picks = pickMarqueeGames(snap?.todaysSchedule || [], snap?.standings || {});
  if (picks.length) {
    const dateLabel = snap?.todaysScheduleDate ? ` (${formatShortDate(snap.todaysScheduleDate)})` : '';
    lines.push(`TODAY'S GAMES${dateLabel}`);
    for (const { game, kind } of picks) {
      const tag = kind === 'cards' ? '[CARDS] '
                : kind === 'nats' ? '[NATS]  '
                : '[MARQUEE] ';
      const time = game.gameDate ? `${formatTimeET(game.gameDate)} ` : '';
      lines.push(`  ${tag}${time}${teamShortName(game.away?.name)} @ ${teamShortName(game.home?.name)}`);
      const aPP = game.away?.probablePitcher?.name;
      const hPP = game.home?.probablePitcher?.name;
      if (aPP || hPP) {
        lines.push(`           ${aPP || 'TBD'} vs ${hPP || 'TBD'}`);
      }
    }
    lines.push('');
  }

  // Highlights
  const cardsHl = snap?.cardinals?.highlights || [];
  const natsHl = snap?.nationals?.highlights || [];
  const seen = new Set();
  const merged = [];
  for (const v of [...cardsHl, ...natsHl]) {
    if (!v?.videoId || seen.has(v.videoId)) continue;
    seen.add(v.videoId);
    merged.push(v);
    if (merged.length >= 5) break;
  }
  if (merged.length) {
    lines.push('TOP HIGHLIGHTS');
    for (const v of merged) {
      lines.push(`  • ${v.title || 'Highlight'}`);
      lines.push(`    https://www.youtube.com/watch?v=${v.videoId}`);
    }
    lines.push('');
  }

  // Standings
  const standings = snap?.standings || {};
  if (Object.keys(standings).length) {
    lines.push('DIVISION STANDINGS — TOP 3');
    for (const divId of DIVISION_ORDER) {
      const div = standings[String(divId)] || standings[divId];
      if (!div?.teams?.length) continue;
      lines.push(`  ${DIVISION_LABELS[divId] || `Division ${divId}`}`);
      for (const t of div.teams.slice(0, 3)) {
        const marker = (t.teamId === CARDS_ID || t.teamId === NATS_ID) ? '★' : ' ';
        const name = teamShortName(t.name).padEnd(14);
        const rec = `${t.wins}-${t.losses}`.padEnd(7);
        const gb = String(t.gamesBack ?? '—').padStart(4);
        const streak = (t.streak || '').padStart(4);
        lines.push(`    ${marker} ${t.divisionRank}. ${name} ${rec} ${gb}  ${streak}`);
      }
    }
    lines.push('');
  }

  // Notable games
  const notable = (snap?.notableGames || []).slice(0, 5);
  if (notable.length) {
    lines.push('NOTABLE GAMES');
    for (const g of notable) {
      const reason = (g.notableReasons || [])[0] || '';
      lines.push(`  • ${teamShortName(g.away?.name)} ${g.away?.score ?? '—'}, ${teamShortName(g.home?.name)} ${g.home?.score ?? '—'} (${reason})`);
    }
    lines.push('');
  }

  // On This Day
  const otd = (snap?.onThisDay || []).slice(0, 2);
  if (otd.length) {
    lines.push('ON THIS DAY');
    for (const e of otd) {
      lines.push(`  ${e.year || '—'}  ${e.title || ''}`);
      if (e.description) lines.push(`        ${e.description}`);
    }
    lines.push('');
  }

  lines.push(`Open the full report: ${SITE_URL}`);
  lines.push('');
  lines.push("— Ozark Joe's Baseball Daily Intelligence Report");

  return lines.join('\n');
}

function pinExtraText(recap, line, lines) {
  if (!recap || !line || line.status !== 'Final') return;
  const d = recap.decisions;
  if (d) {
    const parts = [];
    if (d.winner?.name) parts.push(`WP ${d.winner.name}`);
    if (d.loser?.name) parts.push(`LP ${d.loser.name}`);
    if (d.save?.name) parts.push(`SV ${d.save.name}`);
    if (parts.length) lines.push(`  ${parts.join('  ·  ')}`);
  }
  const sp = recap.scoringPlays?.[0];
  if (sp?.description) {
    const inning = sp.halfInning && sp.inning
      ? `${sp.halfInning === 'top' ? 'Top' : 'Bot'} ${sp.inning}: `
      : '';
    lines.push(`  ${inning}${sp.description}`);
  }
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function oneLineGameResult(game, teamId, teamLabel) {
  if (!game) return null;
  const homeIsUs = game.home?.id === teamId;
  const us = homeIsUs ? game.home : game.away;
  const them = homeIsUs ? game.away : game.home;
  const status = game.status || 'Unknown';
  const isFinal = /^Final/i.test(status); // matches "Final", "Final/10", etc.

  if (us?.score == null || them?.score == null) {
    return { status, team: teamLabel, opponent: them?.name || '', homeIsUs, won: null, score: null };
  }
  // Only call a result Won/Lost when the game is actually final. In-progress
  // and suspended games show as "{Status} vs Opponent (current: 3-1)".
  if (!isFinal) {
    return {
      status,
      team: teamLabel,
      opponent: them?.name || '',
      homeIsUs,
      won: null,
      score: `${us.score}-${them.score}`,
      inProgress: true,
    };
  }
  return {
    status,
    team: teamLabel,
    opponent: them?.name || '',
    homeIsUs,
    won: Number(us.score) > Number(them.score),
    score: `${us.score}-${them.score}`,
  };
}

function formatGameLineHtml(line) {
  if (line.won === null) {
    const trail = line.inProgress && line.score
      ? ` <span style="color:${COLORS.text};">(current: ${escapeHtml(line.score)})</span>`
      : '';
    return `<span style="color:${COLORS.textDim};">${escapeHtml(line.status)} ${line.homeIsUs ? 'vs' : '@'} ${escapeHtml(line.opponent)}</span>${trail}`;
  }
  const icon = line.won ? '✓' : '×';
  const color = line.won ? COLORS.win : COLORS.loss;
  return `<span style="color:${color}; font-weight:700;">${icon} ${line.won ? 'Won' : 'Lost'}</span> <span style="color:${COLORS.text};">${escapeHtml(line.score)} ${line.homeIsUs ? 'vs' : '@'} ${escapeHtml(line.opponent)}</span>`;
}

function formatGameLineText(line) {
  if (line.won === null) {
    const trail = line.inProgress && line.score ? ` (current: ${line.score})` : '';
    return `  ${line.status} ${line.homeIsUs ? 'vs' : '@'} ${line.opponent}${trail}`;
  }
  const result = line.won ? 'Won' : 'Lost';
  return `  ${result} ${line.score} ${line.homeIsUs ? 'vs' : '@'} ${line.opponent}`;
}

function formatLongDate(isoDate) {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function formatShortDate(isoDate) {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function formatTimeET(isoTimestamp) {
  try {
    const d = new Date(isoTimestamp);
    return d.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' ET';
  } catch {
    return '';
  }
}

// Strip a few "City " prefixes for compactness when team names get long.
// Keeps the official MLB team name intact when it would still fit.
function teamShortName(name) {
  if (!name) return '—';
  // For really long ones, trim leading city.
  const LONG_THRESHOLD = 18;
  if (name.length <= LONG_THRESHOLD) return name;
  // Try to keep the last 2 words (covers "St. Louis Cardinals" → "Cardinals")
  const parts = name.split(' ');
  if (parts.length <= 2) return name;
  return parts.slice(-2).join(' ').length <= LONG_THRESHOLD
    ? parts.slice(-1).join(' ')
    : parts.slice(-2).join(' ');
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = { buildEmail };
