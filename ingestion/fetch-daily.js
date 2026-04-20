#!/usr/bin/env node
/**
 * fetch-daily — orchestrator v4 (Phase 3B + KB-0003)
 *
 * Additions over v3:
 *   - YouTube highlight ingestion for Cardinals + Nationals (graceful skip when key not set)
 *   - Emits snapshot schemaVersion: 4
 */

const mlb = require('./lib/mlb-api');
const cache = require('./lib/cache');
const { fetchAllInjuries } = require('./fetch-injuries');
const { fetchTransactions } = require('./fetch-transactions');
const { eventsFor } = require('./on-this-day');
const { fetchTeamHighlights } = require('./fetch-highlights');

async function run() {
  const date = cache.yesterdayISO();
  const season = new Date().getFullYear();

  console.log(`[fetch-daily] Target: ${date}  Season: ${season}`);

  // --- Core game data ---
  const schedule = await mlb.getSchedule(date);
  const games = schedule?.dates?.[0]?.games || [];
  console.log(`[fetch-daily] ${games.length} games on ${date}`);

  const cardsGame = findTeamGame(games, mlb.TEAM_IDS.CARDINALS);
  const natsGame = findTeamGame(games, mlb.TEAM_IDS.NATIONALS);
  const cardsBox = cardsGame ? await safeBox(cardsGame.gamePk) : null;
  const natsBox = natsGame ? await safeBox(natsGame.gamePk) : null;

  const standings = await mlb.getStandings(season);

  const [
    injuries, transactions, onThisDay,
    cardsForm, natsForm, seasonProgress,
    cardsHighlights, natsHighlights,
  ] = await Promise.all([
    safeRun('injuries',         () => fetchAllInjuries()),
    safeRun('transactions',     () => fetchTransactions(7)),
    safeRun('on-this-day',      () => Promise.resolve(eventsFor())),
    safeRun('cards-form',       () => computeRecentForm(mlb.TEAM_IDS.CARDINALS)),
    safeRun('nats-form',        () => computeRecentForm(mlb.TEAM_IDS.NATIONALS)),
    safeRun('season-prog',      () => computeSeasonProgress(season)),
    safeRun('cards-highlights', () => fetchTeamHighlights('Cardinals')),
    safeRun('nats-highlights',  () => fetchTeamHighlights('Nationals')),
  ]);

  const trades = (transactions || []).filter(t => t.typeCode === 'TR');

  const snapshot = {
    schemaVersion: 4,
    date,
    generatedAt: new Date().toISOString(),
    season,
    youtubeEnabled: Boolean(process.env.YOUTUBE_API_KEY),
    scoreboard: games.map(summarizeGame),
    cardinals: {
      game: cardsGame ? summarizeGame(cardsGame) : null,
      boxscore: cardsBox ? summarizeBox(cardsBox) : null,
      injuries: filterInjuriesByTeam(injuries, mlb.TEAM_IDS.CARDINALS),
      recentForm: cardsForm,
      highlights: cardsHighlights || [],
    },
    nationals: {
      game: natsGame ? summarizeGame(natsGame) : null,
      boxscore: natsBox ? summarizeBox(natsBox) : null,
      injuries: filterInjuriesByTeam(injuries, mlb.TEAM_IDS.NATIONALS),
      recentForm: natsForm,
      highlights: natsHighlights || [],
    },
    standings: summarizeStandings(standings),
    seasonProgress: seasonProgress || fallbackSeasonProgress(season),
    injuries: injuries || [],
    transactions: transactions || [],
    trades,
    onThisDay: onThisDay || [],
  };

  cache.writeSnapshot(`${date}.json`, snapshot);
  cache.writeSnapshot('latest.json', snapshot);

  console.log(`[fetch-daily] Injuries: ${(injuries || []).length}`);
  console.log(`[fetch-daily] Transactions (7d): ${(transactions || []).length}  Trades: ${trades.length}`);
  console.log(`[fetch-daily] On-this-day events: ${(onThisDay || []).length}`);
  console.log(`[fetch-daily] Cards recent form: ${cardsForm?.streakCode || 'n/a'}  Nats: ${natsForm?.streakCode || 'n/a'}`);
  console.log(`[fetch-daily] Cards highlights: ${(cardsHighlights || []).length} videos  Nats: ${(natsHighlights || []).length} videos  (key set: ${Boolean(process.env.YOUTUBE_API_KEY)})`);
  console.log(`[fetch-daily] Done.`);
}

async function safeRun(label, fn) {
  try { return await fn(); }
  catch (err) {
    console.warn(`[fetch-daily] ${label} failed: ${err.message}`);
    return null;
  }
}

function findTeamGame(games, teamId) {
  return games.find(g =>
    g.teams?.home?.team?.id === teamId ||
    g.teams?.away?.team?.id === teamId
  );
}

async function safeBox(gamePk) {
  try { return await mlb.getBoxscore(gamePk); }
  catch (err) {
    console.warn(`[fetch-daily] Boxscore for gamePk=${gamePk}: ${err.message}`);
    return null;
  }
}

function filterInjuriesByTeam(injuries, teamId) {
  if (!injuries) return [];
  return injuries.filter(i => i.teamId === teamId);
}

function summarizeGame(g) {
  return {
    gamePk: g.gamePk,
    status: g.status?.detailedState || g.status?.abstractGameState || 'Unknown',
    home: {
      id: g.teams?.home?.team?.id,
      name: g.teams?.home?.team?.name,
      score: g.teams?.home?.score ?? null,
      record: g.teams?.home?.leagueRecord || null,
    },
    away: {
      id: g.teams?.away?.team?.id,
      name: g.teams?.away?.team?.name,
      score: g.teams?.away?.score ?? null,
      record: g.teams?.away?.leagueRecord || null,
    },
    venue: g.venue?.name || null,
    gameType: g.gameType || null,
    dayNight: g.dayNight || null,
  };
}

function summarizeBox(box) {
  const teams = box?.teams || {};
  return { home: trimTeamBox(teams.home), away: trimTeamBox(teams.away) };
}

function trimTeamBox(t) {
  if (!t) return null;
  const batters = (t.batters || []).map(id => {
    const p = t.players?.[`ID${id}`];
    if (!p) return null;
    return {
      id: p.person?.id,
      name: p.person?.fullName,
      position: p.position?.abbreviation,
      stats: p.stats?.batting || null,
    };
  }).filter(Boolean);

  const pitchers = (t.pitchers || []).map(id => {
    const p = t.players?.[`ID${id}`];
    if (!p) return null;
    return {
      id: p.person?.id,
      name: p.person?.fullName,
      stats: p.stats?.pitching || null,
    };
  }).filter(Boolean);

  return {
    teamId: t.team?.id,
    teamName: t.team?.name,
    runs: t.teamStats?.batting?.runs ?? null,
    hits: t.teamStats?.batting?.hits ?? null,
    errors: t.teamStats?.fielding?.errors ?? null,
    batters,
    pitchers,
  };
}

function summarizeStandings(s) {
  const divisions = {};
  for (const rec of s?.records || []) {
    const divId = rec.division?.id;
    if (!divId) continue;
    divisions[divId] = {
      divisionId: divId,
      leagueId: rec.league?.id,
      teams: (rec.teamRecords || []).map(t => ({
        teamId: t.team?.id,
        name: t.team?.name,
        wins: t.wins,
        losses: t.losses,
        winPct: t.winningPercentage,
        gamesBack: t.gamesBack,
        streak: t.streak?.streakCode || null,
        divisionRank: t.divisionRank,
        leagueRank: t.leagueRank,
        wildCardRank: t.wildCardRank,
      })),
    };
  }
  return divisions;
}

/**
 * Exact season progress using /seasons/{season}.
 * Falls back to hardcoded approximations if API is unavailable.
 */
async function computeSeasonProgress(season) {
  let start, asg, regEnd, postEnd;
  let source = 'api';

  try {
    const s = await mlb.getSeasonDates(season);
    const sd = s?.seasons?.[0] || {};
    if (sd.regularSeasonStartDate) start = toDate(sd.regularSeasonStartDate);
    if (sd.allStarDate) asg = toDate(sd.allStarDate);
    if (sd.regularSeasonEndDate) regEnd = toDate(sd.regularSeasonEndDate);
    if (sd.postSeasonEndDate) postEnd = toDate(sd.postSeasonEndDate);
  } catch (err) {
    console.warn(`[fetch-daily] season dates API failed: ${err.message}`);
    source = 'fallback';
  }

  // Fallbacks for any missing fields
  start   = start   || toDate(`${season}-03-28`);
  asg     = asg     || toDate(`${season}-07-15`);
  regEnd  = regEnd  || toDate(`${season}-09-28`);
  postEnd = postEnd || toDate(`${season}-11-05`);

  const now = new Date();
  const clamp = (a, b, t) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const daysBetween = (from, to) => Math.ceil((to - from) / (1000 * 60 * 60 * 24));

  let phase;
  if (now < start) phase = 'preseason';
  else if (now < asg) phase = 'first-half';
  else if (now < regEnd) phase = 'second-half';
  else if (now < postEnd) phase = 'postseason';
  else phase = 'offseason';

  return {
    regularSeasonPct: clamp(start, regEnd, now),
    daysToAllStar: daysBetween(now, asg),
    daysToPlayoffs: daysBetween(now, regEnd),
    daysToWorldSeriesEnd: daysBetween(now, postEnd),
    phase,
    source,
    dates: {
      start: start.toISOString().slice(0, 10),
      allStar: asg.toISOString().slice(0, 10),
      regSeasonEnd: regEnd.toISOString().slice(0, 10),
      postseasonEnd: postEnd.toISOString().slice(0, 10),
    },
  };
}

function fallbackSeasonProgress(season) {
  return {
    regularSeasonPct: 0,
    daysToAllStar: null,
    daysToPlayoffs: null,
    daysToWorldSeriesEnd: null,
    phase: 'unknown',
    source: 'fallback',
    dates: {},
  };
}

/**
 * Pulls the team's last 14 days of scheduled games, filters to Finals,
 * and computes streak, last-10, and home/road splits.
 */
async function computeRecentForm(teamId) {
  const end = cache.yesterdayISO();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);
  const start = startDate.toISOString().slice(0, 10);

  const sched = await mlb.getTeamSchedule(teamId, start, end);

  const games = [];
  for (const day of sched?.dates || []) {
    for (const g of day.games || []) {
      if (g.status?.abstractGameState !== 'Final') continue;
      const homeIsUs = g.teams?.home?.team?.id === teamId;
      const us = homeIsUs ? g.teams?.home : g.teams?.away;
      const them = homeIsUs ? g.teams?.away : g.teams?.home;
      if (us?.score == null || them?.score == null) continue;
      games.push({
        date: day.date,
        opponent: them.team?.abbreviation || them.team?.name || '—',
        usScore: us.score,
        themScore: them.score,
        result: us.score > them.score ? 'W' : 'L',
        home: homeIsUs,
      });
    }
  }

  if (!games.length) {
    return { gamesAnalyzed: 0, streakCode: null, last10: null, homeAway: null, games: [] };
  }

  // Current streak — walk backwards from most recent game
  let streakResult = games[games.length - 1].result;
  let streakCount = 0;
  for (let i = games.length - 1; i >= 0; i--) {
    if (games[i].result === streakResult) streakCount++;
    else break;
  }

  const last10 = games.slice(-10);
  const last10Wins = last10.filter(g => g.result === 'W').length;

  const homeGames = games.filter(g => g.home);
  const awayGames = games.filter(g => !g.home);
  const homeWins = homeGames.filter(g => g.result === 'W').length;
  const awayWins = awayGames.filter(g => g.result === 'W').length;

  return {
    gamesAnalyzed: games.length,
    streakCode: `${streakResult}${streakCount}`,
    last10: { wins: last10Wins, losses: last10.length - last10Wins, of: last10.length },
    homeAway: {
      home: `${homeWins}-${homeGames.length - homeWins}`,
      away: `${awayWins}-${awayGames.length - awayWins}`,
    },
    games: games.slice(-10),
  };
}

function toDate(ymd) {
  // Construct local-midnight date to avoid timezone drift
  return new Date(`${ymd}T00:00:00`);
}

run().catch(err => {
  console.error(`[fetch-daily] FATAL: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
