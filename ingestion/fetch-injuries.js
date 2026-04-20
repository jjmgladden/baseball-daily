#!/usr/bin/env node
/**
 * fetch-injuries — Phase 2
 *
 * Pulls the 40-man roster for every MLB team and flags players whose status
 * indicates an injured list assignment or other non-active status.
 *
 * MLB Stats API does not expose a dedicated injury endpoint, so we derive
 * the list from roster status codes. Roughly 30 HTTP calls per run.
 *
 * Returns: injuries payload for inclusion in the daily snapshot.
 */

const mlb = require('./lib/mlb-api');

// Status codes that indicate a player is sidelined.
// Source: MLB Stats API /teams/{id}/roster responses across teams.
const IL_STATUS_CODES = {
  'D7':   '7-day IL',
  'D10':  '10-day IL',
  'D15':  '15-day IL',
  'D60':  '60-day IL',
  'BRV':  'Bereavement List',
  'FMLA': 'Family Medical List',
  'PL':   'Paternity List',
  'RM':   'Restricted List',
  'SU':   'Suspended',
};

async function fetchAllInjuries() {
  const teams = await mlb.getTeams();
  const activeTeams = (teams?.teams || []).filter(t => t.active !== false);

  const allInjuries = [];
  for (const team of activeTeams) {
    try {
      const roster = await mlb.getTeamRoster(team.id, '40Man');
      for (const p of roster?.roster || []) {
        const code = p.status?.code;
        if (!code || !IL_STATUS_CODES[code]) continue;
        allInjuries.push({
          teamId: team.id,
          teamName: team.name,
          teamAbbrev: team.abbreviation,
          playerId: p.person?.id,
          playerName: p.person?.fullName,
          position: p.position?.abbreviation,
          statusCode: code,
          statusLabel: IL_STATUS_CODES[code],
          statusDescription: p.status?.description || null,
        });
      }
    } catch (err) {
      console.warn(`[fetch-injuries] Roster for ${team.name}: ${err.message}`);
    }
  }

  // Sort by team then player for stable output
  allInjuries.sort((a, b) => {
    if (a.teamName !== b.teamName) return a.teamName.localeCompare(b.teamName);
    return (a.playerName || '').localeCompare(b.playerName || '');
  });

  return allInjuries;
}

module.exports = { fetchAllInjuries, IL_STATUS_CODES };

// Allow direct execution: `node ingestion/fetch-injuries.js`
if (require.main === module) {
  fetchAllInjuries()
    .then(list => {
      console.log(`[fetch-injuries] ${list.length} players on IL across MLB`);
      console.log(JSON.stringify(list.slice(0, 5), null, 2));
    })
    .catch(err => { console.error(err); process.exit(1); });
}
