/**
 * MLB Stats API wrapper — v3
 *
 * Base: https://statsapi.mlb.com/api/v1
 *
 * This is the unofficial-but-stable API used by MLB.com itself.
 * No auth required. No formal SLA — cache aggressively.
 */

const BASE = 'https://statsapi.mlb.com/api/v1';

const TEAM_IDS = {
  CARDINALS: 138,
  NATIONALS: 120,
};

const LEAGUE_IDS = {
  AL: 103,
  NL: 104,
};

async function get(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MLB API ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

/**
 * Schedule for a single date (YYYY-MM-DD).
 * Returns dates[].games[].
 *
 * Optional `hydrate` argument enriches the response. Common values:
 *   - 'probablePitcher'  — adds teams.{home,away}.probablePitcher.{id,fullName}
 *   - 'team,linescore'   — adds team metadata + live linescore
 *   - 'broadcasts'       — adds TV/radio listings
 */
async function getSchedule(date, hydrate) {
  const params = { sportId: 1, date };
  if (hydrate) params.hydrate = hydrate;
  return get('/schedule', params);
}

/**
 * Schedule for a team over a date range.
 * Used for streak-tracker / recent-form computations.
 */
async function getTeamSchedule(teamId, startDate, endDate) {
  return get('/schedule', { sportId: 1, teamId, startDate, endDate });
}

/**
 * Standings for the full season — both leagues.
 */
async function getStandings(season) {
  return get('/standings', {
    leagueId: `${LEAGUE_IDS.AL},${LEAGUE_IDS.NL}`,
    season,
  });
}

async function getBoxscore(gamePk) {
  return get(`/game/${gamePk}/boxscore`);
}

async function getLinescore(gamePk) {
  return get(`/game/${gamePk}/linescore`);
}

/**
 * Full live game feed — richest endpoint. Used for recap generation.
 * Contains scoringPlays, allPlays (descriptions), decisions (W/L/SV),
 * linescore, gameInfo (attendance/duration), and weather.
 */
async function getGameFeed(gamePk) {
  const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB API ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function getTeams(season) {
  const params = { sportId: 1 };
  if (season) params.season = season;
  return get('/teams', params);
}

/**
 * Team roster.
 * rosterType options: '40Man', 'active', 'fullSeason', 'depthChart', 'allTime'
 */
async function getTeamRoster(teamId, rosterType = '40Man') {
  return get(`/teams/${teamId}/roster`, { rosterType });
}

async function getPerson(personId) {
  return get(`/people/${personId}`);
}

async function getTransactions(startDate, endDate) {
  return get('/transactions', { startDate, endDate });
}

/**
 * Season metadata (exact Opening Day, ASG, regular/postseason end dates).
 * Returns seasons[] — take [0].
 */
async function getSeasonDates(season) {
  return get(`/seasons/${season}`, { sportId: 1 });
}

module.exports = {
  TEAM_IDS,
  LEAGUE_IDS,
  getSchedule,
  getTeamSchedule,
  getStandings,
  getBoxscore,
  getLinescore,
  getGameFeed,
  getTeams,
  getTeamRoster,
  getPerson,
  getTransactions,
  getSeasonDates,
};
