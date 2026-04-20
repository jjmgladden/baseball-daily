/**
 * Game recap builder — v1
 *
 * Extracts narrative-quality fields from the MLB Stats API's /feed/live
 * payload. All values are direct API facts — no synthesis, no speculation.
 * The daily-tab renderer turns this structured data into readable prose.
 */

/**
 * Classify a scoreboard-level game as notable (for inclusion in the
 * "Other Notable Games" section on the Daily Report). Uses cheap data
 * already in the schedule response — no extra API calls needed.
 *
 * @param {object} game  — summarized game from scoreboard
 * @returns {string[]}   — array of reasons (empty = not notable)
 */
function classifyNotable(game) {
  const reasons = [];
  const home = Number(game.home?.score ?? 0);
  const away = Number(game.away?.score ?? 0);
  const margin = Math.abs(home - away);
  const total = home + away;

  if (game.status === 'Final' || game.status === 'Game Over' || game.status === 'Completed Early') {
    if (margin === 1) reasons.push('one-run game');
    if ((home === 0 && away > 0) || (away === 0 && home > 0)) reasons.push('shutout');
    if (margin >= 8) reasons.push('blowout');
    if (total >= 20) reasons.push('slugfest');
    if (total <= 3 && margin === 1) reasons.push('pitchers\' duel');
  }

  return reasons;
}

/**
 * Extract a structured recap from the feed/live payload.
 *
 * Shape is tuned to make client-side rendering a straightforward template
 * fill — the UI does NOT need to re-traverse the massive gumbo payload.
 */
function buildRecap(feed) {
  if (!feed) return null;

  const live = feed.liveData || {};
  const gameData = feed.gameData || {};
  const plays = live.plays || {};
  const decisions = live.decisions || {};
  const linescore = live.linescore || {};

  const allPlays = plays.allPlays || [];
  const scoringPlayIndices = plays.scoringPlays || [];

  const scoringPlays = scoringPlayIndices
    .map(idx => allPlays[idx])
    .filter(Boolean)
    .map(play => ({
      inning: play.about?.inning,
      halfInning: play.about?.halfInning,           // 'top' or 'bottom'
      description: play.result?.description || '',
      eventType: play.result?.eventType,
      rbi: play.result?.rbi,
      awayScore: play.result?.awayScore ?? 0,
      homeScore: play.result?.homeScore ?? 0,
      batter: play.matchup?.batter?.fullName || null,
      pitcher: play.matchup?.pitcher?.fullName || null,
    }));

  return {
    status: gameData.status?.detailedState || gameData.status?.abstractGameState || null,
    venue: gameData.venue?.name || null,
    weather: formatWeather(gameData.weather),
    gameInfo: {
      attendance: gameData.gameInfo?.attendance ?? null,
      firstPitch: gameData.gameInfo?.firstPitch || null,
      gameDurationMinutes: gameData.gameInfo?.gameDurationMinutes ?? null,
    },
    decisions: {
      winner: decisions.winner ? { id: decisions.winner.id, name: decisions.winner.fullName } : null,
      loser:  decisions.loser  ? { id: decisions.loser.id,  name: decisions.loser.fullName  } : null,
      save:   decisions.save   ? { id: decisions.save.id,   name: decisions.save.fullName   } : null,
    },
    linescore: {
      innings: (linescore.innings || []).map(i => ({
        num: i.num,
        home: i.home?.runs ?? null,
        away: i.away?.runs ?? null,
      })),
      totals: {
        home: {
          runs:   linescore.teams?.home?.runs   ?? null,
          hits:   linescore.teams?.home?.hits   ?? null,
          errors: linescore.teams?.home?.errors ?? null,
        },
        away: {
          runs:   linescore.teams?.away?.runs   ?? null,
          hits:   linescore.teams?.away?.hits   ?? null,
          errors: linescore.teams?.away?.errors ?? null,
        },
      },
    },
    scoringPlays,
  };
}

function formatWeather(w) {
  if (!w) return null;
  const parts = [];
  if (w.condition) parts.push(w.condition);
  if (w.temp) parts.push(`${w.temp}°F`);
  if (w.wind) parts.push(`wind ${w.wind}`);
  return parts.length ? parts.join(', ') : null;
}

module.exports = { classifyNotable, buildRecap };
