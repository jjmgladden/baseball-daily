#!/usr/bin/env node
/**
 * on-this-day — Phase 2
 *
 * Returns events matching today's MM-DD from the curated seed dataset.
 * In Phase 3 this will also pull player birthdays from the Chadwick index
 * and surface no-hitters / milestones from Retrosheet game logs.
 */

const fs = require('fs');
const path = require('path');
const cache = require('./lib/cache');

function todayMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

function loadSeed() {
  const file = path.join(cache.MASTER_DIR, 'on-this-day-seed.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadPlayerIndex() {
  const file = path.join(cache.MASTER_DIR, 'player-index.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Return events for a specific MM-DD (defaults to today).
 * Merges curated seed + HOF-caliber birthdays from the player index
 * (only if index has been built).
 */
function eventsFor(mmdd = todayMMDD()) {
  const seed = loadSeed();
  const matches = seed.filter(e => e.date === mmdd);

  const index = loadPlayerIndex();
  const birthdays = [];
  if (index?.players) {
    for (const p of index.players) {
      if (!p.birth || !p.birth.month || !p.birth.day) continue;
      const pmmdd = `${String(p.birth.month).padStart(2, '0')}-${String(p.birth.day).padStart(2, '0')}`;
      if (pmmdd !== mmdd) continue;
      // Relevance threshold: surface only players with ≥10 MLB seasons
      if ((p.yearsInMLB || 0) < 10) continue;
      birthdays.push({
        date: mmdd,
        year: p.birth.year,
        type: 'birthday',
        title: `${p.nameFirst} ${p.nameLast} born`,
        description: `${p.nameFirst} ${p.nameLast}, ${p.yearsInMLB} MLB seasons (${p.mlbFirst}-${p.mlbLast}).`,
        tags: ['birthday'],
        playerId: p.mlbamId || null,
      });
    }
  }

  // Sort curated events first, then birthdays, then by year ascending
  const combined = [...matches, ...birthdays];
  combined.sort((a, b) => {
    if (a.type === 'birthday' && b.type !== 'birthday') return 1;
    if (b.type === 'birthday' && a.type !== 'birthday') return -1;
    return (a.year || 0) - (b.year || 0);
  });
  return combined;
}

module.exports = { eventsFor, todayMMDD };

if (require.main === module) {
  const events = eventsFor();
  console.log(`[on-this-day] ${events.length} events for ${todayMMDD()}`);
  console.log(JSON.stringify(events, null, 2));
}
