// build-ai-context.js — KB-0033 curated context bundle for the AI Q&A layer.
//
// Reads data/snapshots/latest.json (produced by fetch-daily.js) plus the news
// snapshot and a few stable seed files, distills them into a compact text
// block (~5-7K tokens), and writes data/snapshots/ai-context.json. The Worker
// fetches this file on each /ai request and ships it to Claude with prompt
// caching (cache_control: ephemeral).
//
// Run order (mirrored in .github/workflows/daily.yml):
//   node ingestion/fetch-daily.js     # produces latest.json
//   node ingestion/fetch-news.js      # produces news-latest.json
//   node ingestion/build-ai-context.js  # produces ai-context.json

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SNAP_DIR = path.join(ROOT, 'data', 'snapshots');
const MASTER_DIR = path.join(ROOT, 'data', 'master');
const LATEST = path.join(SNAP_DIR, 'latest.json');
const NEWS_LATEST = path.join(SNAP_DIR, 'news-latest.json');
const OUT = path.join(SNAP_DIR, 'ai-context.json');

// MLB division IDs → human names. Stable across seasons.
const DIVISION_NAMES = {
  200: 'AL West',
  201: 'AL East',
  202: 'AL Central',
  203: 'NL West',
  204: 'NL East',
  205: 'NL Central'
};

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toISOString().slice(0, 10); }
  catch { return iso; }
}

function approxTokens(text) {
  return Math.ceil((text || '').length / 4);
}

function teamPin(label, side) {
  // side === snapshot.cardinals or snapshot.nationals
  if (!side || !side.game) return '## ' + label + '\n(no game data)';
  const g = side.game;
  const us = g.home && g.home.id && (label === 'CARDINALS' ? g.home.id === 138 : g.home.id === 120) ? g.home : g.away;
  const them = us === g.home ? g.away : g.home;
  const recap = side.recap || {};
  const lines = ['## ' + label];
  const status = g.status || '—';
  const score = (us.score != null && them.score != null) ? (us.score + '-' + them.score) : '—';
  const result = us.score > them.score ? 'WIN' : (us.score < them.score ? 'LOSS' : 'TIE');
  const venue = g.venue || '—';
  lines.push('Most recent game (' + fmtDate(side.game.gameDate || g.gameDate) + ', ' + status + '): ' + result + ' ' + score + ' vs ' + (them.name || '—') + ' at ' + venue + '.');
  if (us.record) {
    lines.push('Season record: ' + us.record.wins + '-' + us.record.losses + ' (' + (us.record.pct || '—') + ').');
  }
  if (recap.decisions) {
    const d = recap.decisions;
    const bits = [];
    if (d.winner && d.winner.name) bits.push('W: ' + d.winner.name);
    if (d.loser && d.loser.name) bits.push('L: ' + d.loser.name);
    if (d.save && d.save.name) bits.push('Sv: ' + d.save.name);
    if (bits.length) lines.push('Decisions: ' + bits.join(' · '));
  }
  if ((recap.scoringPlays || []).length) {
    lines.push('Key scoring plays:');
    for (const sp of recap.scoringPlays.slice(0, 4)) {
      const half = sp.halfInning ? sp.halfInning + ' ' : '';
      lines.push('- ' + half + sp.inning + ': ' + (sp.description || '').slice(0, 200));
    }
  }
  if (side.recentForm) {
    const rf = side.recentForm;
    const last10 = rf.last10 ? (rf.last10.wins + '-' + rf.last10.losses) : '—';
    const streak = rf.streakCode || '—';
    const ha = rf.homeAway ? ('home ' + rf.homeAway.home + ' / road ' + rf.homeAway.away) : '—';
    lines.push('Recent form (14d, ' + (rf.gamesAnalyzed || 0) + ' games): last 10 ' + last10 + ', streak ' + streak + ', ' + ha + '.');
  }
  const inj = side.injuries || [];
  if (inj.length) {
    lines.push('Active injuries (' + inj.length + ' total). Top:');
    for (const i of inj.slice(0, 5)) {
      lines.push('- ' + i.playerName + ' (' + (i.position || '—') + ', ' + (i.statusLabel || i.statusCode || '—') + ')');
    }
  }
  if ((side.highlights || []).length) {
    lines.push('Highlight videos:');
    for (const v of side.highlights.slice(0, 3)) {
      lines.push('- "' + (v.title || '').slice(0, 120) + '" (' + (v.channelTitle || 'YouTube') + ', ' + (v.publishedAt ? fmtDate(v.publishedAt) : '—') + ')');
      if (v.url) lines.push('  ' + v.url);
    }
  }
  return lines.join('\n');
}

function sectionStandings(snapshot) {
  const st = snapshot.standings || {};
  const divIds = [201, 202, 200, 204, 205, 203];  // AL East, Central, West, NL East, Central, West
  const lines = ['## STANDINGS (top 5 per division)'];
  for (const id of divIds) {
    const div = st[id] || st[String(id)];
    if (!div || !div.teams) continue;
    lines.push('');
    lines.push('### ' + (DIVISION_NAMES[id] || ('Division ' + id)));
    for (const t of div.teams.slice(0, 5)) {
      const gb = t.gamesBack && t.gamesBack !== '-' ? ' (' + t.gamesBack + ' GB)' : '';
      const streak = t.streak ? ' · ' + t.streak : '';
      lines.push('- ' + t.divisionRank + '. ' + t.name + ' ' + t.wins + '-' + t.losses + ' (' + (t.winPct || '—') + ')' + gb + streak);
    }
  }
  return lines.join('\n');
}

function sectionTodaysSchedule(snapshot) {
  const games = snapshot.todaysSchedule || [];
  if (!games.length) return '## TODAY\'S SCHEDULE\n(no games scheduled)';
  const lines = ['## TODAY\'S SCHEDULE (' + (snapshot.todaysScheduleDate || '—') + ', ' + games.length + ' games)'];
  for (const g of games.slice(0, 18)) {
    const home = g.home || {};
    const away = g.away || {};
    const homeRec = home.record ? ' (' + home.record.wins + '-' + home.record.losses + ')' : '';
    const awayRec = away.record ? ' (' + away.record.wins + '-' + away.record.losses + ')' : '';
    const homePit = home.probablePitcher && home.probablePitcher.name ? home.probablePitcher.name : 'TBD';
    const awayPit = away.probablePitcher && away.probablePitcher.name ? away.probablePitcher.name : 'TBD';
    lines.push('- ' + (away.name || '—') + awayRec + ' @ ' + (home.name || '—') + homeRec + ' · ' + awayPit + ' vs ' + homePit + ' · ' + (g.venue || '—'));
  }
  return lines.join('\n');
}

function sectionNotableGames(snapshot) {
  const ng = snapshot.notableGames || [];
  if (!ng.length) return '';
  const lines = ['## RECENT NOTABLE GAMES (yesterday)'];
  for (const g of ng.slice(0, 6)) {
    const home = g.home || {};
    const away = g.away || {};
    const reasons = (g.notableReasons || []).join(', ');
    lines.push('- ' + (away.name || '—') + ' ' + (away.score != null ? away.score : '—') + ' @ ' + (home.name || '—') + ' ' + (home.score != null ? home.score : '—') + ' (' + reasons + ')' + ' at ' + (g.venue || '—'));
    const rec = g.recap || {};
    if ((rec.scoringPlays || []).length) {
      const top = rec.scoringPlays[0];
      lines.push('  Key play: ' + (top.description || '').slice(0, 160));
    }
  }
  return lines.join('\n');
}

function sectionOnThisDay(snapshot) {
  const otd = snapshot.onThisDay || [];
  if (!otd.length) return '';
  const lines = ['## ON THIS DAY (' + (snapshot.date || '—') + ')'];
  for (const e of otd.slice(0, 10)) {
    const yr = e.year ? e.year + ' — ' : '';
    lines.push('- ' + yr + (e.title || '') + ': ' + (e.description || '').slice(0, 200));
  }
  return lines.join('\n');
}

function sectionSeasonProgress(snapshot) {
  const sp = snapshot.seasonProgress;
  if (!sp) return '';
  const lines = ['## SEASON PROGRESS'];
  lines.push('Season: ' + (snapshot.season || '—') + ' (' + (sp.phase || '—') + ', ' + Math.round((sp.regularSeasonPct || 0) * 100) + '% complete)');
  if (sp.dates) {
    lines.push('Key dates: opening ' + sp.dates.start + ' · All-Star ' + sp.dates.allStar + ' · regular-season end ' + sp.dates.regSeasonEnd + ' · postseason end ' + sp.dates.postseasonEnd);
  }
  if (sp.daysToAllStar != null) lines.push('Days to All-Star: ' + sp.daysToAllStar + ' · to playoffs: ' + sp.daysToPlayoffs);
  return lines.join('\n');
}

function sectionTopNews(news, n = 6) {
  const items = (news && news.items) || [];
  if (!items.length) return '';
  const lines = ['## TOP NEWS (recent, top ' + Math.min(n, items.length) + ')'];
  lines.push('Each item: title (source, date) + URL + Excerpt. Cite the URL when handing it to the user.');
  for (const it of items.slice(0, n)) {
    const src = it.sourceName || it.sourceId || '—';
    const url = it.url || '';
    const summary = String(it.summary || '').replace(/\s+/g, ' ').trim();
    const excerpt = summary.length > 200 ? summary.slice(0, 200).trim() + '...' : summary;
    lines.push('- "' + (it.title || '').slice(0, 120) + '" (' + src + ', ' + (it.publishedAt ? fmtDate(it.publishedAt) : '—') + ')');
    if (url) lines.push('  ' + url);
    if (excerpt) lines.push('  Excerpt: ' + excerpt);
  }
  return lines.join('\n');
}

function sectionCardinalsDeep() {
  const data = readJson(path.join(MASTER_DIR, 'cardinals-deep.json'));
  if (!data) return '';
  const lines = ['## CARDINALS DEEP (curated retired numbers, HOFers, historic seasons, traditions)'];
  if (data.retiredNumbers && data.retiredNumbers.length) {
    const parts = data.retiredNumbers.map(r => '#' + r.number + ' ' + r.player + (r.retired ? ' (' + r.retired + ')' : ''));
    lines.push('Retired numbers: ' + parts.join(', ') + '.');
  }
  if (data.hallOfFamers && data.hallOfFamers.length) {
    lines.push('Hall of Fame Cardinals (' + data.hallOfFamers.length + ' total):');
    for (const h of data.hallOfFamers.slice(0, 10)) {
      const yrs = h.stlYears ? ' (' + h.stlYears + ')' : '';
      const hof = h.hofYear ? ' · HOF ' + h.hofYear : '';
      lines.push('- ' + h.name + yrs + hof + ': ' + (h.note || '').slice(0, 160));
    }
  }
  if (data.historicSeasons && data.historicSeasons.length) {
    lines.push('Historic seasons:');
    for (const s of data.historicSeasons.slice(0, 6)) {
      lines.push('- ' + s.year + ' — ' + (s.headline || s.finish || '') + ': ' + (s.description || '').slice(0, 180));
    }
  }
  if (data.traditions && data.traditions.length) {
    lines.push('Traditions:');
    for (const t of data.traditions.slice(0, 4)) {
      lines.push('- ' + t.name + ': ' + (t.description || '').slice(0, 180));
    }
  }
  return lines.join('\n');
}

function sectionStories() {
  const data = readJson(path.join(MASTER_DIR, 'stories.json'));
  const arr = (data && data.stories) ? data.stories : (Array.isArray(data) ? data : []);
  if (!arr.length) return '';
  const lines = ['## CURATED STORIES (selected baseball narratives)'];
  for (const s of arr.slice(0, 8)) {
    const era = s.era ? ' (' + s.era + ')' : '';
    lines.push('- ' + (s.title || '') + era + ': ' + (s.teaser || '').slice(0, 200));
  }
  return lines.join('\n');
}

function sectionLegendsGeneral() {
  const data = readJson(path.join(MASTER_DIR, 'legends-general.json'));
  const arr = (data && data.legends) ? data.legends : (Array.isArray(data) ? data : []);
  if (!arr.length) return '';
  const lines = ['## MLB LEGENDS (broader hall-of-fame coverage)'];
  for (const l of arr.slice(0, 10)) {
    const role = l.role ? ' (' + l.role + (l.era ? ', ' + l.era : '') + ')' : (l.era ? ' (' + l.era + ')' : '');
    lines.push('- ' + (l.name || '') + role + ': ' + (l.headline || '').slice(0, 200));
  }
  return lines.join('\n');
}

function sectionStrangePlays() {
  const data = readJson(path.join(MASTER_DIR, 'strange-plays.json'));
  const arr = (data && data.plays) ? data.plays : (Array.isArray(data) ? data : []);
  if (!arr.length) return '';
  const lines = ['## STRANGEST PLAYS IN BASEBALL HISTORY'];
  for (const p of arr.slice(0, 8)) {
    lines.push('- ' + (p.title || '') + ' (' + (p.date || p.era || '—') + '): ' + (p.description || '').slice(0, 200));
  }
  return lines.join('\n');
}

function sectionBrothers() {
  const data = readJson(path.join(MASTER_DIR, 'brothers.json'));
  const arr = (data && data.entries) ? data.entries : (Array.isArray(data) ? data : []);
  if (!arr.length) return '';
  const lines = ['## BROTHERS IN MLB'];
  for (const b of arr.slice(0, 8)) {
    const era = b.era ? ' (' + b.era + ')' : '';
    lines.push('- ' + (b.title || '—') + era + ': ' + (b.headline || '').slice(0, 200));
  }
  return lines.join('\n');
}

function sectionTrivia() {
  const data = readJson(path.join(MASTER_DIR, 'trivia.json'));
  const arr = (data && data.questions) ? data.questions : (Array.isArray(data) ? data : []);
  if (!arr.length) return '';
  const lines = ['## TRIVIA (sample, ' + arr.length + ' questions in dataset)'];
  for (const q of arr.slice(0, 6)) {
    lines.push('- Q: ' + (q.question || '').slice(0, 180));
    if (q.answer) lines.push('  A: ' + String(q.answer).slice(0, 200));
  }
  return lines.join('\n');
}

function sectionPlayerIndex() {
  const data = readJson(path.join(MASTER_DIR, 'player-index.json'));
  if (!data || !data.count) return '## PLAYER DIRECTORY\n(unavailable)';
  // Player index is huge (~23k). Just summarize and note searchability;
  // the AI shouldn't be answering "tell me about player X" from a sampled
  // 50-row context anyway — those queries should hit the structured app.
  const lines = ['## PLAYER DIRECTORY'];
  lines.push('The site indexes ' + data.count + ' players from Chadwick (1871-' + (data.generatedAt ? data.generatedAt.slice(0, 4) : 'present') + '). Source: ' + (data.source || '—') + '.');
  lines.push('For a specific player, the user can search the Players tab. Do not invent player details — if a player isn\'t mentioned elsewhere in this context bundle, say "I don\'t have details on that player in today\'s context — try the Players tab on the site for the searchable directory."');
  return lines.join('\n');
}

function sectionFranchises() {
  const data = readJson(path.join(MASTER_DIR, 'franchises.json'));
  const arr = (data && data.franchises) ? data.franchises : (Array.isArray(data) ? data : []);
  if (!arr.length) return '';
  const lines = ['## MLB FRANCHISES (30 teams)'];
  const byLeague = { AL: [], NL: [] };
  for (const f of arr) {
    const lg = f.league || 'unknown';
    if (lg === 'AL' || lg === 'NL') byLeague[lg].push(f.name + ' (' + (f.abbrev || '—') + ')');
  }
  if (byLeague.AL.length) lines.push('AL: ' + byLeague.AL.join(', '));
  if (byLeague.NL.length) lines.push('NL: ' + byLeague.NL.join(', '));
  return lines.join('\n');
}

function build() {
  const snapshot = readJson(LATEST);
  if (!snapshot) {
    throw new Error('latest.json not found at ' + LATEST + ' — run fetch-daily.js first.');
  }
  const news = readJson(NEWS_LATEST);  // optional — context still builds without it

  const sections = [
    '# OZARK JOE\'S BASEBALL DAILY — AI Q&A CONTEXT BUNDLE',
    'Source: data/snapshots/latest.json + data/snapshots/news-latest.json + data/master/*.json',
    'Snapshot generated: ' + (snapshot.generatedAt || '—'),
    'Snapshot represents games played: ' + (snapshot.date || '—'),
    'News snapshot: ' + (news && news.generatedAt ? news.generatedAt : '(unavailable)'),
    '',
    teamPin('CARDINALS', snapshot.cardinals),
    '',
    teamPin('NATIONALS', snapshot.nationals),
    '',
    sectionStandings(snapshot),
    '',
    sectionTodaysSchedule(snapshot),
    '',
    sectionNotableGames(snapshot),
    '',
    sectionOnThisDay(snapshot),
    '',
    sectionSeasonProgress(snapshot),
    '',
    sectionTopNews(news, 6),
    '',
    sectionCardinalsDeep(),
    '',
    sectionStories(),
    '',
    sectionLegendsGeneral(),
    '',
    sectionStrangePlays(),
    '',
    sectionBrothers(),
    '',
    sectionTrivia(),
    '',
    sectionFranchises(),
    '',
    sectionPlayerIndex(),
    '',
    '---',
    'END OF CONTEXT BUNDLE. If a question cannot be answered from the above, say so honestly. Do not fabricate stats, dates, or biographical facts.'
  ];

  const content = sections.filter(s => s !== null && s !== undefined && s !== '').join('\n');
  const tokensApprox = approxTokens(content);
  const out = {
    sourceId: 'ai-context',
    generatedAt: new Date().toISOString(),
    snapshotGeneratedAt: snapshot.generatedAt || null,
    newsGeneratedAt: news && news.generatedAt || null,
    tokensApprox,
    chars: content.length,
    content
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log('[build-ai-context] wrote ' + OUT);
  console.log('[build-ai-context]   chars: ' + content.length + ' | approx tokens: ' + tokensApprox);
  return out;
}

if (require.main === module) {
  try { build(); }
  catch (e) { console.error(e); process.exit(1); }
}
module.exports = { build };
