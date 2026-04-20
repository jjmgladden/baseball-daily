#!/usr/bin/env node
/**
 * build-player-index — Phase 2
 *
 * One-time / periodic build step. Reads the Chadwick Bureau register
 * (16 sharded CSVs, `people-0.csv` through `people-f.csv`) from either:
 *   a) local files at data/master/chadwick/people-*.csv, OR
 *   b) a live download from github.com/chadwickbureau/register
 *
 * Filters to players with `mlb_played_first` populated (= has played in MLB),
 * extracts bio fields, and writes a single JSON file:
 *   data/master/player-index.json
 *
 * The resulting file is loaded directly by the browser for universal search.
 *
 * Usage:
 *   node scripts/build-player-index.js            # auto-detect / download
 *   node scripts/build-player-index.js --offline  # require local files only
 *
 * Manual download (if scripted download fails):
 *   1. Visit https://github.com/chadwickbureau/register/tree/master/data
 *   2. Download people-0.csv through people-f.csv
 *   3. Place them in  data/master/chadwick/
 *   4. Re-run this script
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CHADWICK_DIR = path.join(PROJECT_ROOT, 'data', 'master', 'chadwick');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'data', 'master', 'player-index.json');

const SHARDS = '0123456789abcdef'.split('');
const BASE_URL = 'https://raw.githubusercontent.com/chadwickbureau/register/master/data';

const offline = process.argv.includes('--offline');

async function main() {
  ensureDir(CHADWICK_DIR);

  const shardFiles = [];
  for (const shard of SHARDS) {
    const file = path.join(CHADWICK_DIR, `people-${shard}.csv`);
    if (!fs.existsSync(file)) {
      if (offline) {
        console.error(`Missing: ${file}  (--offline mode; not downloading)`);
        process.exit(1);
      }
      await downloadTo(`${BASE_URL}/people-${shard}.csv`, file);
    }
    shardFiles.push(file);
  }

  console.log(`[build-player-index] Parsing ${shardFiles.length} shards...`);
  const all = [];
  for (const file of shardFiles) {
    const rows = parseCSVFile(file);
    all.push(...rows);
  }
  console.log(`[build-player-index] ${all.length} total register rows`);

  const players = [];
  for (const row of all) {
    if (!row.mlb_played_first) continue;   // must have played in MLB
    const player = normalizePlayer(row);
    if (!player) continue;
    players.push(player);
  }

  console.log(`[build-player-index] ${players.length} MLB players after filter`);

  // Sort by relevance (years in MLB desc, then MLB debut year desc, then name)
  players.sort((a, b) => {
    if (b.yearsInMLB !== a.yearsInMLB) return b.yearsInMLB - a.yearsInMLB;
    if ((b.mlbFirst || 0) !== (a.mlbFirst || 0)) return (b.mlbFirst || 0) - (a.mlbFirst || 0);
    return (a.nameLast || '').localeCompare(b.nameLast || '');
  });

  const payload = {
    schemaVersion: 1,
    source: 'Chadwick Bureau Register (public domain)',
    sourceUrl: 'https://github.com/chadwickbureau/register',
    generatedAt: new Date().toISOString(),
    count: players.length,
    players,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload));
  const bytes = fs.statSync(OUTPUT_FILE).size;
  console.log(`[build-player-index] Wrote ${OUTPUT_FILE}  (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
}

function normalizePlayer(row) {
  const toInt = v => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  const first = toInt((row.mlb_played_first || '').slice(0, 4));
  const last = toInt((row.mlb_played_last || '').slice(0, 4));
  if (!first) return null;

  return {
    mlbamId: toInt(row.key_mlbam),
    retroId: row.key_retro || null,
    bbrefId: row.key_bbref || null,
    nameFirst: (row.name_first || '').trim(),
    nameLast: (row.name_last || '').trim(),
    nameGiven: (row.name_given || '').trim() || null,
    nameNick: (row.name_nick || '').trim() || null,
    birth: {
      year: toInt(row.birth_year),
      month: toInt(row.birth_month),
      day: toInt(row.birth_day),
      country: row.birth_country || null,
      state: row.birth_state || null,
      city: row.birth_city || null,
    },
    death: row.death_year ? {
      year: toInt(row.death_year),
      month: toInt(row.death_month),
      day: toInt(row.death_day),
      country: row.death_country || null,
    } : null,
    mlbFirst: first,
    mlbLast: last || first,
    yearsInMLB: last && first ? (last - first + 1) : 1,
  };
}

function parseCSVFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = splitLines(text);
  if (!lines.length) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = parseCSVLine(line);
    const row = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cols[j] ?? '';
    rows.push(row);
  }
  return rows;
}

/**
 * Naive line splitter that respects quoted fields containing newlines.
 * Chadwick data rarely has embedded newlines but we handle them safely.
 */
function splitLines(text) {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      current += c;
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (current) out.push(current);
      current = '';
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += c;
    }
  }
  if (current) out.push(current);
  return out;
}

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      cur += c; i++;
    } else {
      if (c === ',') { fields.push(cur); cur = ''; i++; continue; }
      if (c === '"' && cur === '') { inQuotes = true; i++; continue; }
      cur += c; i++;
    }
  }
  fields.push(cur);
  return fields;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadTo(url, dest) {
  console.log(`[build-player-index] GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

main().catch(err => { console.error(err); process.exit(1); });
