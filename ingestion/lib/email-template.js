/**
 * Email template builder — v1
 *
 * Builds the rich HTML body + plain-text fallback + subject for the
 * morning email from a fresh daily snapshot. No external dependencies.
 *
 * Design goals:
 *   - Renders well in Gmail, Outlook, Apple Mail, mobile clients
 *   - Inline styles only (many clients strip <style> blocks)
 *   - Degrades to plain text if HTML is blocked
 *   - Dark-theme-friendly background but readable in light mode too
 */

const SITE_URL = 'https://jjmgladden.github.io/baseball-daily/';
const CARDS_ID = 138;
const NATS_ID = 120;

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
  // Fallback: generic subject with date
  return `⚾ Ozark Joe's Baseball Daily — ${dateFormatted}`;
}

function buildHtml(snap, dateFormatted, cardsLine, natsLine) {
  const onThisDay = (snap?.onThisDay || []).slice(0, 2);
  const cardsHighlights = snap?.cardinals?.highlights?.length || 0;
  const natsHighlights = snap?.nationals?.highlights?.length || 0;
  const tradesCount = (snap?.trades || []).length;
  const injuriesCount = (snap?.injuries || []).length;
  const gamesCount = (snap?.scoreboard || []).length;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#0E1821; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E8EAED;">
  <div style="max-width:600px; margin:0 auto; padding:24px 16px;">

    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="left">
          <div style="font-size:28px;">⚾</div>
          <div style="font-size:20px; font-weight:700; color:#FFFFFF; margin-top:6px;">
            Ozark Joe's Baseball Daily
          </div>
          <div style="font-size:13px; color:#C4C7CC; margin-top:2px;">
            ${escapeHtml(dateFormatted)}
          </div>
        </td>
      </tr>
    </table>

    <!-- Cardinals pin -->
    <div style="background:#1E3148; border:1px solid #2A3F5A; border-left:4px solid #C41E3A; border-radius:8px; padding:16px; margin-top:20px;">
      <div style="font-size:13px; color:#C4C7CC; text-transform:uppercase; letter-spacing:0.06em;">St. Louis Cardinals</div>
      <div style="font-size:18px; color:#FFFFFF; margin-top:4px; font-weight:600;">
        ${cardsLine ? formatGameLineHtml(cardsLine) : '<span style="color:#C4C7CC;">No game scheduled</span>'}
      </div>
      ${cardsHighlights ? `<div style="font-size:13px; color:#00B4D8; margin-top:8px;">▸ ${cardsHighlights} highlight video${cardsHighlights === 1 ? '' : 's'} in today's report</div>` : ''}
    </div>

    <!-- Nationals pin -->
    <div style="background:#1E3148; border:1px solid #2A3F5A; border-left:4px solid #AB0003; border-radius:8px; padding:16px; margin-top:12px;">
      <div style="font-size:13px; color:#C4C7CC; text-transform:uppercase; letter-spacing:0.06em;">Washington Nationals</div>
      <div style="font-size:18px; color:#FFFFFF; margin-top:4px; font-weight:600;">
        ${natsLine ? formatGameLineHtml(natsLine) : '<span style="color:#C4C7CC;">No game scheduled</span>'}
      </div>
      ${natsHighlights ? `<div style="font-size:13px; color:#00B4D8; margin-top:8px;">▸ ${natsHighlights} highlight video${natsHighlights === 1 ? '' : 's'} in today's report</div>` : ''}
    </div>

    <!-- On This Day -->
    ${onThisDay.length ? `
      <div style="margin-top:24px;">
        <div style="font-size:15px; font-weight:600; color:#FEDB00; text-transform:uppercase; letter-spacing:0.08em;">On This Day</div>
        ${onThisDay.map(e => `
          <div style="background:#152230; border:1px solid #2A3F5A; border-radius:6px; padding:10px 14px; margin-top:10px;">
            <div style="font-family:Consolas,Menlo,monospace; font-size:13px; color:#00B4D8;">${escapeHtml(String(e.year || '—'))}</div>
            <div style="font-size:15px; color:#FFFFFF; margin-top:4px;">${escapeHtml(e.title || '')}</div>
            ${e.description ? `<div style="font-size:13px; color:#C4C7CC; margin-top:4px;">${escapeHtml(e.description)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Call-to-action button -->
    <div style="text-align:center; margin:32px 0 20px;">
      <a href="${SITE_URL}" style="background:#C41E3A; color:#FFFFFF; text-decoration:none; padding:14px 28px; border-radius:8px; font-size:16px; font-weight:600; display:inline-block;">
        Open the full report →
      </a>
    </div>

    <!-- Small stats footer -->
    <div style="text-align:center; font-size:12px; color:#C4C7CC; margin-top:20px;">
      ${gamesCount} game${gamesCount === 1 ? '' : 's'} yesterday
      ${tradesCount ? ` · ${tradesCount} trade${tradesCount === 1 ? '' : 's'}` : ''}
      ${injuriesCount ? ` · ${injuriesCount} on the IL league-wide` : ''}
    </div>

    <!-- Meta footer -->
    <div style="border-top:1px solid #2A3F5A; padding-top:16px; margin-top:28px; font-size:11px; color:#C4C7CC; text-align:center;">
      You're subscribed to the daily morning briefing from Ozark Joe's Baseball Daily Intelligence Report.<br>
      <a href="${SITE_URL}" style="color:#00B4D8; text-decoration:none;">${SITE_URL}</a>
    </div>

  </div>
</body>
</html>`.trim();
}

function buildPlainText(snap, dateFormatted, cardsLine, natsLine) {
  const onThisDay = (snap?.onThisDay || []).slice(0, 2);
  const lines = [];

  lines.push(`OZARK JOE'S BASEBALL DAILY — ${dateFormatted}`);
  lines.push('');

  lines.push('ST. LOUIS CARDINALS');
  lines.push(cardsLine ? formatGameLineText(cardsLine) : 'No game scheduled');
  lines.push('');

  lines.push('WASHINGTON NATIONALS');
  lines.push(natsLine ? formatGameLineText(natsLine) : 'No game scheduled');
  lines.push('');

  if (onThisDay.length) {
    lines.push('ON THIS DAY');
    for (const e of onThisDay) {
      lines.push(`  ${e.year || '—'}  ${e.title || ''}`);
      if (e.description) lines.push(`        ${e.description}`);
    }
    lines.push('');
  }

  lines.push(`Open the full report: ${SITE_URL}`);
  lines.push('');
  lines.push('— Ozark Joe\'s Baseball Daily Intelligence Report');

  return lines.join('\n');
}

// ---------- helpers ----------

function oneLineGameResult(game, teamId, teamLabel) {
  if (!game) return null;
  const homeIsUs = game.home?.id === teamId;
  const us = homeIsUs ? game.home : game.away;
  const them = homeIsUs ? game.away : game.home;
  if (us?.score == null || them?.score == null) {
    return {
      status: game.status || 'Unknown',
      team: teamLabel,
      opponent: them?.name || '',
      homeIsUs,
      won: null,
      score: null,
    };
  }
  return {
    status: game.status || 'Unknown',
    team: teamLabel,
    opponent: them?.name || '',
    homeIsUs,
    won: Number(us.score) > Number(them.score),
    score: `${us.score}-${them.score}`,
  };
}

function formatGameLineHtml(line) {
  if (line.won === null) {
    return `<span style="color:#C4C7CC;">${escapeHtml(line.status)} ${line.homeIsUs ? 'vs' : '@'} ${escapeHtml(line.opponent)}</span>`;
  }
  const verb = line.won ? 'beat' : 'fell to';
  const icon = line.won ? '✓' : '×';
  const color = line.won ? '#4ADE80' : '#F87171';
  return `<span style="color:${color}; font-weight:700;">${icon} ${line.won ? 'Won' : 'Lost'}</span> <span style="color:#E8EAED;">${line.score} ${line.homeIsUs ? 'vs' : '@'} ${escapeHtml(line.opponent)}</span>`;
}

function formatGameLineText(line) {
  if (line.won === null) {
    return `  ${line.status} ${line.homeIsUs ? 'vs' : '@'} ${line.opponent}`;
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

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = { buildEmail };
