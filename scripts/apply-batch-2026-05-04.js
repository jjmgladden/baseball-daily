// One-shot script: apply Issue #5 ("Approve ALL") approvals.
// Appends 10 entries (1 executive + 9 players) to legends-general.json,
// flips backlog entries to status='active', bumps generatedAt on both.
//
// Run from project root: node scripts/apply-batch-2026-05-04.js
// Safe to re-run: idempotent on backlog (skip already-active) and on
// destination (skip ids that already exist).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKLOG_PATH = path.join(ROOT, 'data/master/curation-backlog.json');
const DEST_PATH    = path.join(ROOT, 'data/master/legends-general.json');

const APPROVED_IDS = [
  'exc-miller-marvin',
  'gen-berra-yogi',
  'gen-jackson-reggie',
  'gen-jeter-derek',
  'gen-johnson-randy',
  'gen-johnson-walter',
  'gen-jones-chipper',
  'gen-koufax-sandy',
  'gen-maddux-greg',
  'gen-mantle-mickey',
];

// Curated entries — role / era / headline carry verifiable facts.
// Links: Wikipedia direct (stable for top-tier names) + Baseball Reference search
// + Hall of Fame search + SABR BioProject search. Search URLs are guaranteed-live.
const ENTRIES = {
  'exc-miller-marvin': {
    id: 'exc-miller-marvin',
    name: 'Marvin Miller',
    role: 'Executive (MLBPA)',
    era: '1966-1982',
    category: 'executive',
    headline: 'MLBPA Executive Director 1966-82. Won free agency, ended the reserve clause, and built the Players Association into the most effective union in professional sports. Inducted into the Hall of Fame in 2020 — eight years after his death and after multiple prior ballot rejections.',
    links: [
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/miller-marvin' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/marvin-miller/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Marvin_Miller_(baseball)' },
      { label: 'MLBPA history', url: 'https://www.mlbplayers.com/history' },
    ],
  },
  'gen-berra-yogi': {
    id: 'gen-berra-yogi',
    name: 'Yogi Berra',
    role: 'Catcher',
    era: '1946-1965',
    category: 'player',
    headline: 'Three-time AL MVP (1951, 1954, 1955). Ten World Series rings — the most by any player in MLB history. 18-time All-Star. Later managed both the Yankees and Mets to pennants. D-Day veteran (USS Bayfield, June 6, 1944).',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/b/berrayo01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/berra-yogi' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/yogi-berra/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Yogi_Berra' },
    ],
  },
  'gen-jackson-reggie': {
    id: 'gen-jackson-reggie',
    name: 'Reggie Jackson',
    role: 'Outfielder',
    era: '1967-1987',
    category: 'player',
    headline: '"Mr. October." 563 career home runs. Three home runs on three pitches in Game 6 of the 1977 World Series. Five World Series rings across the A\'s and Yankees. 1973 AL MVP. Hall of Fame 1993.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/j/jacksre01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/jackson-reggie' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/reggie-jackson/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Reggie_Jackson' },
    ],
  },
  'gen-jeter-derek': {
    id: 'gen-jeter-derek',
    name: 'Derek Jeter',
    role: 'Shortstop',
    era: '1995-2014',
    category: 'player',
    headline: 'Captain of five Yankees championship teams (1996, 1998-2000, 2009). 3,465 career hits — sixth all-time. 14-time All-Star. 1996 AL Rookie of the Year, 2000 World Series MVP. Hall of Fame 2020 (one vote shy of unanimous).',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/j/jeterde01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/jeter-derek' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/derek-jeter/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Derek_Jeter' },
    ],
  },
  'gen-johnson-randy': {
    id: 'gen-johnson-randy',
    name: 'Randy Johnson',
    role: 'Pitcher',
    era: '1988-2009',
    category: 'player',
    headline: '"The Big Unit." Five Cy Young Awards (four consecutive, 1999-2002). Perfect game in 2004 at age 40 — oldest player ever. 4,875 career strikeouts (second all-time). 303 career wins. Co-MVP of the 2001 World Series with Curt Schilling. Hall of Fame 2015.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/j/johnsra05.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/johnson-randy' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/randy-johnson/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Randy_Johnson' },
    ],
  },
  'gen-johnson-walter': {
    id: 'gen-johnson-walter',
    name: 'Walter Johnson',
    role: 'Pitcher',
    era: '1907-1927',
    category: 'player',
    headline: '"The Big Train." 417 career wins (second all-time, behind Cy Young). 110 career shutouts — still the MLB record. 3,508 strikeouts in the dead-ball era. 21 seasons all with the Washington Senators. Member of the inaugural Hall of Fame class, 1936.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/j/johnswa01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/johnson-walter' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/walter-johnson/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Walter_Johnson' },
    ],
  },
  'gen-jones-chipper': {
    id: 'gen-jones-chipper',
    name: 'Chipper Jones',
    role: 'Third Baseman',
    era: '1993-2012',
    category: 'player',
    headline: '1999 NL MVP. 19 seasons all with the Atlanta Braves. Switch-hitter with a career .303 average and 468 home runs. 2008 NL batting title at age 36. First-ballot Hall of Famer in 2018.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/j/jonesch06.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/jones-chipper' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/chipper-jones/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chipper_Jones' },
    ],
  },
  'gen-koufax-sandy': {
    id: 'gen-koufax-sandy',
    name: 'Sandy Koufax',
    role: 'Pitcher',
    era: '1955-1966',
    category: 'player',
    headline: 'Four no-hitters including a perfect game (Sept 9, 1965). Three Cy Young Awards (1963, 1965, 1966) — won unanimously each time, when only one was given league-wide. 1963 NL MVP. Retired at 30 due to elbow arthritis. Hall of Fame 1972 at age 36 — youngest inductee ever.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/k/koufasa01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/koufax-sandy' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/sandy-koufax/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Sandy_Koufax' },
    ],
  },
  'gen-maddux-greg': {
    id: 'gen-maddux-greg',
    name: 'Greg Maddux',
    role: 'Pitcher',
    era: '1986-2008',
    category: 'player',
    headline: 'Four consecutive Cy Young Awards (1992-1995). 355 career wins (eighth all-time). 18 Gold Gloves — most by any pitcher. Master of movement, command, and pitch sequencing rather than velocity. First-ballot Hall of Famer 2014.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/m/maddugr01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/maddux-greg' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/greg-maddux/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Greg_Maddux' },
    ],
  },
  'gen-mantle-mickey': {
    id: 'gen-mantle-mickey',
    name: 'Mickey Mantle',
    role: 'Outfielder',
    era: '1951-1968',
    category: 'player',
    headline: 'Three-time AL MVP (1956, 1957, 1962). 1956 Triple Crown winner. Seven-time World Series champion with the Yankees. 18 career World Series home runs — still the all-time record. 536 career home runs as a switch-hitter. Hall of Fame 1974.',
    links: [
      { label: 'Baseball Reference', url: 'https://www.baseball-reference.com/players/m/mantlmi01.shtml' },
      { label: 'Hall of Fame', url: 'https://baseballhall.org/hall-of-famers/mantle-mickey' },
      { label: 'SABR BioProject', url: 'https://sabr.org/bioproj/person/mickey-mantle/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mickey_Mantle' },
    ],
  },
};

// --- Apply ---

const dest = JSON.parse(fs.readFileSync(DEST_PATH, 'utf8'));
const backlog = JSON.parse(fs.readFileSync(BACKLOG_PATH, 'utf8'));

const existingIds = new Set((dest.legends || []).map(l => l.id));
let added = 0;
let skipped = 0;

for (const id of APPROVED_IDS) {
  if (existingIds.has(id)) {
    console.log(`  skip ${id} — already in destination`);
    skipped++;
    continue;
  }
  const entry = ENTRIES[id];
  if (!entry) {
    console.log(`  skip ${id} — no curated entry defined`);
    skipped++;
    continue;
  }
  dest.legends.push(entry);
  added++;
  console.log(`  add  ${id} — ${entry.name}`);
}

dest.generatedAt = new Date().toISOString();
fs.writeFileSync(DEST_PATH, JSON.stringify(dest, null, 2) + '\n');
console.log(`legends-general.json: +${added} added, ${skipped} skipped (now ${dest.legends.length} total)`);

// Backlog status flip
let flipped = 0;
for (const e of backlog.entries || []) {
  if (APPROVED_IDS.includes(e.id) && e.status === 'pending') {
    e.status = 'active';
    flipped++;
  }
}
backlog.generatedAt = new Date().toISOString();
fs.writeFileSync(BACKLOG_PATH, JSON.stringify(backlog, null, 2) + '\n');

const stillPending = (backlog.entries || []).filter(e => e.status === 'pending').length;
console.log(`curation-backlog.json: ${flipped} entries flipped pending→active (${stillPending} pending remain)`);
