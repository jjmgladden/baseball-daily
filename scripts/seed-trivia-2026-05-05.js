// One-shot script: seed 20 trivia stubs into curation-backlog.json so the
// Monday weekly-batch cron has fresh trivia content to surface.
//
// Trivia stubs use an extended shape vs other types: they carry the actual
// `question` + `answer` strings so the apply step is a simple append into
// data/master/trivia.json. The weekly-batch Issue body still renders cleanly
// from `name` + `summary` (the extra fields are ignored by the issue builder).
//
// Run from project root: node scripts/seed-trivia-2026-05-05.js
// Idempotent: skips ids already present.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKLOG_PATH = path.join(ROOT, 'data/master/curation-backlog.json');

const SEED = [
  // --- records ---
  { id: 'triv-record-most-strikeouts', category: 'records', name: 'Career strikeouts leader', summary: 'All-time strikeouts as a pitcher.',
    question: 'Which pitcher holds the all-time MLB record for career strikeouts?',
    answer: 'Nolan Ryan — 5,714 career strikeouts. He retired in 1993 at age 46. Randy Johnson is second with 4,875.',
    priority: 1 },
  { id: 'triv-record-consecutive-games', category: 'records', name: 'Cal Ripken consecutive games', summary: 'The streak that broke Gehrig\'s 2,130.',
    question: 'On what date did Cal Ripken Jr. break Lou Gehrig\'s consecutive-games-played record, and at what number did Ripken finish?',
    answer: 'September 6, 1995 (game 2,131, vs. the Angels at Camden Yards). Ripken extended the streak to 2,632 before voluntarily ending it on September 20, 1998.',
    priority: 1 },
  { id: 'triv-record-perfect-games', category: 'records', name: 'Perfect games count', summary: 'Total perfect games in MLB history.',
    question: 'How many perfect games have been thrown in modern MLB history (since 1900)?',
    answer: '24 perfect games in MLB history through 2026. The first modern one was Cy Young in 1904.',
    priority: 2 },
  { id: 'triv-record-no-hitters-season', category: 'records', name: 'Most no-hitters in one season', summary: 'A season-long record.',
    question: 'Which pitcher threw the most no-hitters in a single MLB season, and how many?',
    answer: 'Johnny Vander Meer (Cincinnati Reds, 1938) — back-to-back no-hitters on June 11 and June 15, 1938. The only pitcher in MLB history to throw consecutive no-hitters.',
    priority: 2 },
  { id: 'triv-record-fielding-percentage', category: 'records', name: 'Hits in a season', summary: 'Single-season hits record.',
    question: 'Who holds the MLB single-season hits record, and how many?',
    answer: 'Ichiro Suzuki — 262 hits in 2004 (Seattle Mariners). Broke George Sisler\'s 1920 record of 257.',
    priority: 1 },

  // --- hall-of-fame ---
  { id: 'triv-hof-first-class', category: 'hall-of-fame', name: 'Inaugural HOF class 1936', summary: 'The first five.',
    question: 'Who were the five players elected in the inaugural 1936 Hall of Fame class?',
    answer: 'Ty Cobb, Babe Ruth, Honus Wagner, Christy Mathewson, and Walter Johnson. Cobb received the most votes (222 of 226).',
    priority: 1 },
  { id: 'triv-hof-unanimous', category: 'hall-of-fame', name: 'First unanimous HOF', summary: 'The first 100% election.',
    question: 'Who was the first player elected to the Hall of Fame with 100% of the vote?',
    answer: 'Mariano Rivera in 2019 — 425 of 425 ballots. No player had received unanimous BBWAA election in the prior 83 years.',
    priority: 1 },
  { id: 'triv-hof-youngest', category: 'hall-of-fame', name: 'Youngest HOF player', summary: 'Earliest induction by age.',
    question: 'Who is the youngest player ever inducted into the Hall of Fame?',
    answer: 'Sandy Koufax — inducted in 1972 at age 36, eligible early because injury forced his retirement at 30 (the 5-year waiting period had elapsed).',
    priority: 2 },

  // --- postseason ---
  { id: 'triv-postseason-walkoff-ws-game7', category: 'postseason', name: 'Walk-off WS Game 7 HRs', summary: 'A rare way to end the Series.',
    question: 'Which two players have hit walk-off home runs to win Game 7 of the World Series?',
    answer: 'Bill Mazeroski (Pirates, 1960, vs. Yankees) and Joe Carter (Blue Jays, 1993, vs. Phillies — actually a Game 6 walk-off, not Game 7). Only Mazeroski has hit a Game 7 walk-off WS home run.',
    priority: 2 },
  { id: 'triv-postseason-perfect-game', category: 'postseason', name: 'Postseason perfect game', summary: 'The lone postseason perfecto.',
    question: 'Who threw the only perfect game in MLB postseason history?',
    answer: 'Don Larsen (New York Yankees) — Game 5 of the 1956 World Series vs. the Brooklyn Dodgers, October 8, 1956. The only postseason perfect game ever thrown.',
    priority: 1 },
  { id: 'triv-postseason-most-ws', category: 'postseason', name: 'Most WS championships franchise', summary: 'The all-time franchise leader.',
    question: 'Which franchise has won the most World Series championships, and how many?',
    answer: 'New York Yankees — 27 championships (most recent in 2009). The Cardinals are second with 11.',
    priority: 1 },

  // --- cardinals ---
  { id: 'triv-cards-mad-dash', category: 'cardinals', name: 'Slaughter\'s Mad Dash', summary: '1946 WS Game 7.',
    question: 'In Game 7 of the 1946 World Series, who scored the winning run from first base on what is now called "The Mad Dash"?',
    answer: 'Enos Slaughter — Cardinals vs. Boston Red Sox at Sportsman\'s Park, October 15, 1946. He scored from first on a Harry Walker hit (officially scored as a double) when shortstop Johnny Pesky hesitated on the relay throw.',
    priority: 1 },
  { id: 'triv-cards-musial-mvps', category: 'cardinals', name: 'Stan Musial MVPs', summary: 'How many for "The Man".',
    question: 'How many National League MVP awards did Stan Musial win, and in which years?',
    answer: 'Three NL MVP awards — 1943, 1946, and 1948. He finished second in voting four other times.',
    priority: 2 },

  // --- nationals ---
  { id: 'triv-nats-first-ws', category: 'nationals', name: 'Nationals first WS title', summary: 'The 2019 championship.',
    question: 'In what year did the Washington Nationals win their first World Series, and who did they defeat?',
    answer: '2019 — defeated the Houston Astros 4-3 in the World Series. The road team won every game (6 of 7) — the first time that had ever happened in a major North American sports championship.',
    priority: 1 },
  { id: 'triv-nats-expansion', category: 'nationals', name: 'Senators relocation', summary: 'How the Nationals got to DC.',
    question: 'The Washington Nationals franchise originated as which earlier team, and in what year did they relocate to Washington?',
    answer: 'The Montreal Expos (1969-2004). The franchise relocated to Washington for the 2005 season, becoming the Nationals. They were the first MLB team in DC since the Senators left in 1971.',
    priority: 2 },

  // --- military ---
  { id: 'triv-mil-feller-enlist', category: 'military', name: 'First MLB to enlist after Pearl Harbor', summary: 'Cleveland\'s ace.',
    question: 'Who was the first MLB player to enlist in the U.S. military after the attack on Pearl Harbor?',
    answer: 'Bob Feller (Cleveland Indians) — enlisted in the U.S. Navy on December 8, 1941, the day after Pearl Harbor. He served four years, missing the bulk of his prime, and earned eight battle stars as a gun captain on the USS Alabama.',
    priority: 1 },

  // --- civil-rights ---
  { id: 'triv-cr-first-al-black-player', category: 'civil-rights', name: 'First Black AL player', summary: 'AL integration.',
    question: 'Who was the first African American player in the American League, and for which team?',
    answer: 'Larry Doby — debuted with the Cleveland Indians on July 5, 1947, eleven weeks after Jackie Robinson broke the NL color barrier. Hall of Fame 1998.',
    priority: 1 },

  // --- franchise-history ---
  { id: 'triv-fr-oldest-park', category: 'franchise-history', name: 'Oldest active MLB park', summary: 'Continuously used.',
    question: 'Which MLB park is the oldest still in use, and in what year did it open?',
    answer: 'Fenway Park (Boston Red Sox) — opened April 20, 1912. Wrigley Field (Cubs, 1914) is the second-oldest.',
    priority: 1 },
  { id: 'triv-fr-30th-team', category: 'franchise-history', name: 'Last MLB expansion', summary: '30 teams since when.',
    question: 'When did MLB expand to 30 teams, and which were the last two added?',
    answer: '1998 — the Arizona Diamondbacks and Tampa Bay Devil Rays (now Rays) began play. MLB has had 30 franchises since.',
    priority: 2 },

  // --- umpires ---
  { id: 'triv-ump-armando-galarraga', category: 'umpires', name: 'Galarraga "imperfect game"', summary: 'A blown call on the 27th out.',
    question: 'Which umpire blew the call on what would have been the 27th out of Armando Galarraga\'s perfect game in 2010, and how did the umpire respond afterward?',
    answer: 'Jim Joyce — first-base umpire, June 2, 2010, Tigers vs. Indians. Joyce ruled Jason Donald safe; replay showed he was out. Joyce publicly apologized in tears immediately after the game and embraced Galarraga, who delivered the lineup card the next day. The play prompted MLB to expand replay review.',
    priority: 1 },
];

// --- Apply ---

const backlog = JSON.parse(fs.readFileSync(BACKLOG_PATH, 'utf8'));
const existingIds = new Set((backlog.entries || []).map(e => e.id));

let added = 0;
let skipped = 0;
for (const stub of SEED) {
  if (existingIds.has(stub.id)) { skipped++; continue; }
  backlog.entries.push({
    id: stub.id,
    type: 'trivia',
    category: stub.category,
    name: stub.name,
    summary: stub.summary,
    question: stub.question,
    answer: stub.answer,
    priority: stub.priority,
    status: 'pending',
  });
  added++;
}

backlog.generatedAt = new Date().toISOString();
fs.writeFileSync(BACKLOG_PATH, JSON.stringify(backlog, null, 2) + '\n');

const pending = (backlog.entries || []).filter(e => e.status === 'pending');
const triviaPending = pending.filter(e => e.type === 'trivia').length;
console.log(`curation-backlog.json: +${added} trivia stubs added (${skipped} skipped — already present)`);
console.log(`Pending now: ${pending.length} total · ${triviaPending} trivia`);
