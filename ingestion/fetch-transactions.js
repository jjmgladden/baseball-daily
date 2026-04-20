#!/usr/bin/env node
/**
 * fetch-transactions — Phase 2
 *
 * Pulls MLB transactions (trades, signings, DFAs, recalls, etc.) over a
 * trailing window and returns normalized entries. Used for the Daily tab's
 * recent-moves strip and the Trade Tracker feature.
 */

const mlb = require('./lib/mlb-api');

const DEFAULT_WINDOW_DAYS = 7;

/**
 * TYPE CODES (from MLB Stats API)
 * We keep the raw code and provide a friendlier label for rendering.
 */
const TYPE_LABELS = {
  TR:   'Trade',
  SFA:  'Signed as Free Agent',
  SGN:  'Signed',
  REL:  'Released',
  DFA:  'Designated for Assignment',
  CU:   'Claimed Off Waivers',
  OUT:  'Outrighted',
  SE:   'Selected',
  OPT:  'Optioned',
  RET:  'Returned',
  ACT:  'Activated',
  CLP:  'Claimed',
  DES:  'Designated',
  // Unknown codes fall through to the raw code in the label
};

function formatYMD(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchTransactions(windowDays = DEFAULT_WINDOW_DAYS) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - windowDays);

  const raw = await mlb.getTransactions(formatYMD(start), formatYMD(end));
  const txs = (raw?.transactions || []).map(t => ({
    id: t.id,
    date: t.date,
    effectiveDate: t.effectiveDate || t.date,
    typeCode: t.typeCode,
    typeLabel: TYPE_LABELS[t.typeCode] || t.typeDesc || t.typeCode,
    description: t.description || '',
    playerId: t.person?.id || null,
    playerName: t.person?.fullName || null,
    fromTeamId: t.fromTeam?.id || null,
    fromTeamName: t.fromTeam?.name || null,
    toTeamId: t.toTeam?.id || null,
    toTeamName: t.toTeam?.name || null,
  }));

  txs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return txs;
}

async function fetchTrades(windowDays = DEFAULT_WINDOW_DAYS) {
  const all = await fetchTransactions(windowDays);
  return all.filter(t => t.typeCode === 'TR');
}

module.exports = { fetchTransactions, fetchTrades, TYPE_LABELS };

if (require.main === module) {
  fetchTransactions()
    .then(list => {
      console.log(`[fetch-transactions] ${list.length} transactions in last ${DEFAULT_WINDOW_DAYS} days`);
      console.log(JSON.stringify(list.slice(0, 5), null, 2));
    })
    .catch(err => { console.error(err); process.exit(1); });
}
