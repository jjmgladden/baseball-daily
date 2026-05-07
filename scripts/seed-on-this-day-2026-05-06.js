// One-shot script: seed 33 verified On-This-Day stubs into curation-backlog.json
// so the Monday weekly-batch cron has fresh date-keyed historical content to surface
// for owner approval. Closes the path on KB-0013 (On-This-Day seed expansion).
//
// Schema note: on-this-day stubs use a NESTED `seedEntry` block carrying the exact
// shape of an on-this-day-seed.json record ({date, year, type, title, description, tags}).
// The future apply step lifts `entry.seedEntry` and appends to data/master/on-this-day-seed.json.
// The Issue body still renders cleanly from `name` + `summary` (extra fields ignored).
//
// Verification posture: every entry corresponds to a publicly documented event with a
// canonical Wikipedia / Baseball Reference / SABR reference. Player birthdays are
// DELIBERATELY EXCLUDED — ingestion/on-this-day.js auto-surfaces HOF-caliber births
// from Chadwick (≥10 MLB seasons), so curated birthday stubs would double-render.
//
// Run from project root: node scripts/seed-on-this-day-2026-05-06.js
// Idempotent: skips ids already present.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKLOG_PATH = path.join(ROOT, 'data/master/curation-backlog.json');

const SEED = [
  // ============================================================
  // Cardinals priority (5 entries — owner is a Cardinals fan)
  // ============================================================
  {
    id: 'otd-musial-3000th',
    category: 'milestone',
    name: 'Musial\'s 3,000th hit (1958-05-13)',
    summary: 'May 13, 1958: Stan Musial pinch-hits a double off Moe Drabowsky for career hit #3,000 at Wrigley Field.',
    seedEntry: {
      date: '05-13', year: 1958, type: 'milestone',
      title: 'Stan Musial\'s 3,000th career hit',
      description: 'Musial pinch-hit a two-run double off the Cubs\' Moe Drabowsky at Wrigley Field for hit #3,000. He became the eighth player to reach the milestone and the first National Leaguer in 16 years.',
      tags: ['cardinals', 'milestone', 'record']
    },
    source: 'https://sabr.org/gamesproj/game/may-13-1958-stan-musial-collects-3000th-hit',
    priority: 1,
  },
  {
    id: 'otd-musial-final-game',
    category: 'milestone',
    name: 'Musial\'s final game (1963-09-29)',
    summary: 'Sept 29, 1963: Stan Musial doubles off Jim Maloney in his final at-bat, ending a 22-year career with 3,630 hits.',
    seedEntry: {
      date: '09-29', year: 1963, type: 'milestone',
      title: 'Stan Musial\'s final game',
      description: 'Musial singled and doubled off Cincinnati\'s Jim Maloney at Sportsman\'s Park, finishing with 3,630 career hits — exactly half at home and half on the road. He was 42 years old. Pete Rose, in his rookie season, played second base for the Reds that day.',
      tags: ['cardinals', 'milestone']
    },
    source: 'https://sabr.org/bioproj/person/stan-musial/',
    priority: 1,
  },
  {
    id: 'otd-freese-walkoff-2011',
    category: 'world-series',
    name: 'Freese\'s Game 6 walk-off (2011-10-27)',
    summary: 'Oct 27, 2011: David Freese walks off the Rangers in the 11th of WS Game 6 — Cards won Game 7 the next night.',
    seedEntry: {
      date: '10-27', year: 2011, type: 'milestone',
      title: 'David Freese\'s Game 6 World Series walk-off',
      description: 'Down to their last strike twice, the Cardinals tied the game on Freese\'s two-out triple in the 9th, then won it on Freese\'s solo home run off Mark Lowe in the 11th. Joe Buck called it: "We will see you tomorrow night." Freese was named World Series MVP after the Cardinals won Game 7 the next night.',
      tags: ['cardinals', 'world-series', 'walk-off']
    },
    source: 'https://www.baseball-reference.com/boxes/SLN/SLN201110270.shtml',
    priority: 1,
  },
  {
    id: 'otd-cards-2011-ws-game7',
    category: 'world-series',
    name: 'Cards win 2011 WS Game 7 (2011-10-28)',
    summary: 'Oct 28, 2011: Cardinals beat Texas 6-2 in Game 7 for their 11th championship — Freese WS MVP.',
    seedEntry: {
      date: '10-28', year: 2011, type: 'milestone',
      title: 'Cardinals win 2011 World Series',
      description: 'St. Louis beat the Texas Rangers 6-2 in Game 7 at Busch Stadium for their 11th World Series title — second-most in MLB history. Chris Carpenter started on three days\' rest. David Freese, who hit the Game 6 walk-off, won World Series MVP.',
      tags: ['cardinals', 'world-series']
    },
    source: 'https://www.baseball-reference.com/postseason/2011_WS.shtml',
    priority: 1,
  },
  {
    id: 'otd-denkinger-call',
    category: 'umpires',
    name: 'Denkinger\'s blown call (1985-10-26)',
    summary: 'Oct 26, 1985: Don Denkinger calls Jorge Orta safe at first in Game 6 of the WS; replay shows out. Royals win Series.',
    seedEntry: {
      date: '10-26', year: 1985, type: 'umpires',
      title: 'Don Denkinger\'s blown call in World Series Game 6',
      description: 'With the Cardinals leading 1-0 in the bottom of the 9th, Royals pinch hitter Jorge Orta hit a chopper to first; replay clearly showed Orta out, but first-base umpire Don Denkinger called him safe. The Royals scored twice to win and forced Game 7, which they took 11-0. The call became a foundational argument for instant replay in MLB and Cardinals fans never quite forgave Denkinger.',
      tags: ['cardinals', 'royals', 'world-series', 'umpires']
    },
    source: 'https://en.wikipedia.org/wiki/1985_World_Series',
    priority: 1,
  },

  // ============================================================
  // Debuts / firsts (4)
  // ============================================================
  {
    id: 'otd-williams-mlb-debut',
    category: 'debut',
    name: 'Ted Williams MLB debut (1939-04-23)',
    summary: 'April 23, 1939: Ted Williams plays his first big-league game at Yankee Stadium for the Red Sox.',
    seedEntry: {
      date: '04-23', year: 1939, type: 'debut',
      title: 'Ted Williams\'s MLB debut',
      description: 'Twenty-year-old Williams went 1-for-4 with a double off Yankees ace Red Ruffing in his first major-league game. He would go on to a .344 career batting average, two MVP awards, two Triple Crowns, and the last .400 season in MLB history.',
      tags: ['red-sox', 'debut']
    },
    source: 'https://www.baseball-reference.com/players/w/willite01.shtml',
    priority: 2,
  },
  {
    id: 'otd-frank-robinson-manager',
    category: 'debut',
    name: 'First Black MLB manager (1975-04-08)',
    summary: 'April 8, 1975: Frank Robinson manages Cleveland in their opener — the first Black manager in MLB history. He homered in his first AB.',
    seedEntry: {
      date: '04-08', year: 1975, type: 'debut',
      title: 'Frank Robinson becomes first Black manager in MLB',
      description: 'Player-manager Frank Robinson led the Cleveland Indians out of the dugout for Opening Day against the Yankees, becoming the first Black manager in MLB history — 28 years after Jackie Robinson broke the color barrier as a player. Robinson, then 39 and still active as a hitter, homered in his first at-bat. Cleveland won 5-3.',
      tags: ['indians', 'civil-rights', 'historic-firsts']
    },
    source: 'https://baseballhall.org/discover/inside-pitch/frank-robinson-becomes-first-black-manager',
    priority: 1,
  },
  {
    id: 'otd-negro-leagues-recognition',
    category: 'milestone',
    name: 'Negro Leagues recognized (2020-12-16)',
    summary: 'Dec 16, 2020: MLB officially recognizes seven Negro Leagues (1920-1948) as Major Leagues, redefining record books.',
    seedEntry: {
      date: '12-16', year: 2020, type: 'milestone',
      title: 'MLB recognizes Negro Leagues as Major Leagues',
      description: 'MLB designated seven Negro Leagues operating between 1920 and 1948 as official Major Leagues, integrating the statistics of about 3,400 Black players (including Josh Gibson, Satchel Paige, and Oscar Charleston) into the historical record. Josh Gibson eventually became MLB\'s all-time batting average leader after the recognition.',
      tags: ['negro-leagues', 'civil-rights', 'historic']
    },
    source: 'https://www.mlb.com/news/negro-leagues-elevated-to-major-league-status',
    priority: 1,
  },
  {
    id: 'otd-shore-relief-perfect',
    category: 'milestone',
    name: 'Ernie Shore\'s 26-up relief (1917-06-23)',
    summary: 'June 23, 1917: Babe Ruth walks the leadoff batter and is ejected for arguing; Ernie Shore retires the next 26 in relief.',
    seedEntry: {
      date: '06-23', year: 1917, type: 'milestone',
      title: 'Ernie Shore\'s relief "perfect game"',
      description: 'Boston Red Sox starter Babe Ruth walked Washington\'s Ray Morgan to lead off the game, then was ejected for arguing balls and strikes. Reliever Ernie Shore came in cold; Morgan was caught stealing on Shore\'s first pitch, and Shore retired the next 26 batters in order — 27 outs total under his watch. Originally credited as a "perfect game," it was reclassified in 1991 as a combined no-hitter.',
      tags: ['red-sox', 'no-hitter', 'babe-ruth']
    },
    source: 'https://en.wikipedia.org/wiki/Ernie_Shore',
    priority: 2,
  },

  // ============================================================
  // Iconic single-game performances (10)
  // ============================================================
  {
    id: 'otd-koufax-perfect-1965',
    category: 'milestone',
    name: 'Koufax perfect game (1965-09-09)',
    summary: 'Sept 9, 1965: Sandy Koufax retires all 27 Cubs at Dodger Stadium, striking out 14. Vin Scully\'s 9th-inning call.',
    seedEntry: {
      date: '09-09', year: 1965, type: 'milestone',
      title: 'Sandy Koufax pitches a perfect game',
      description: 'Koufax retired all 27 Chicago Cubs at Dodger Stadium, striking out 14. He struck out the side in the 9th to seal his 4th career no-hitter and lone perfect game, defeating Bob Hendley 1-0. Vin Scully\'s call — "two and two to Harvey Kuenn, one strike away…" — is one of the most replayed broadcasts in baseball history.',
      tags: ['dodgers', 'cubs', 'perfect-game', 'record']
    },
    source: 'https://www.baseball-reference.com/boxes/LAN/LAN196509090.shtml',
    priority: 1,
  },
  {
    id: 'otd-rose-4192',
    category: 'record',
    name: 'Rose breaks Cobb\'s hits record (1985-09-11)',
    summary: 'Sept 11, 1985: Pete Rose singles off Eric Show for hit #4,192, passing Ty Cobb as MLB\'s all-time hits leader.',
    seedEntry: {
      date: '09-11', year: 1985, type: 'record',
      title: 'Pete Rose breaks Ty Cobb\'s all-time hits record',
      description: 'Player-manager Pete Rose lined a single to left-center off the Padres\' Eric Show at Riverfront Stadium for career hit #4,192, passing Ty Cobb on the all-time list. Riverfront erupted for over seven minutes; Marge Schott embraced Rose at first base, and his son Pete Jr. ran out from the dugout. Rose finished with 4,256 career hits.',
      tags: ['reds', 'record']
    },
    source: 'https://en.wikipedia.org/wiki/Pete_Rose',
    priority: 1,
  },
  {
    id: 'otd-williams-final-hr',
    category: 'milestone',
    name: 'Williams\' final-AB home run (1960-09-28)',
    summary: 'Sept 28, 1960: Ted Williams homers off Jack Fisher in his final at-bat at Fenway. Updike: "Hub Fans Bid Kid Adieu."',
    seedEntry: {
      date: '09-28', year: 1960, type: 'milestone',
      title: 'Ted Williams\'s final at-bat home run',
      description: 'In his final career at-bat at Fenway Park, 42-year-old Ted Williams homered off the Orioles\' Jack Fisher into the right-field bullpen — the 521st of his career. He refused a curtain call and stayed in the dugout. John Updike\'s essay "Hub Fans Bid Kid Adieu" in The New Yorker captured the moment with the line "Gods do not answer letters." Williams declined to play the season\'s final three games in New York.',
      tags: ['red-sox', 'milestone']
    },
    source: 'https://www.baseball-reference.com/boxes/BOS/BOS196009280.shtml',
    priority: 1,
  },
  {
    id: 'otd-clemente-3000th',
    category: 'milestone',
    name: 'Clemente\'s 3,000th hit (1972-09-30)',
    summary: 'Sept 30, 1972: Roberto Clemente doubles off Jon Matlack for hit #3,000 — his final regular-season at-bat. He died three months later.',
    seedEntry: {
      date: '09-30', year: 1972, type: 'milestone',
      title: 'Roberto Clemente\'s 3,000th career hit',
      description: 'Pittsburgh\'s Roberto Clemente doubled off the Mets\' Jon Matlack at Three Rivers Stadium for hit #3,000 — the 11th player to reach the milestone. It would be his final regular-season at-bat. Clemente died on December 31, 1972, in a plane crash carrying earthquake aid to Nicaragua. The Hall of Fame waived its 5-year waiting period and inducted him in 1973.',
      tags: ['pirates', 'milestone', 'humanitarian']
    },
    source: 'https://baseballhall.org/hall-of-famers/clemente-roberto',
    priority: 1,
  },
  {
    id: 'otd-clemens-20k',
    category: 'milestone',
    name: 'Clemens 20-K game (1986-04-29)',
    summary: 'April 29, 1986: Roger Clemens strikes out 20 Mariners — first pitcher to ever fan 20 in a 9-inning game.',
    seedEntry: {
      date: '04-29', year: 1986, type: 'milestone',
      title: 'Roger Clemens strikes out 20 batters',
      description: 'Boston\'s 23-year-old Roger Clemens struck out 20 Seattle Mariners at Fenway Park, beating Steve Carlton\'s and Tom Seaver\'s 19-K records. He walked none. The Red Sox won 3-1 on a Dwight Evans home run. Clemens did it again on September 18, 1996, also striking out 20.',
      tags: ['red-sox', 'record']
    },
    source: 'https://www.baseball-reference.com/boxes/BOS/BOS198604290.shtml',
    priority: 1,
  },
  {
    id: 'otd-seaver-19k',
    category: 'milestone',
    name: 'Seaver 19 K + 10 in a row (1970-04-22)',
    summary: 'April 22, 1970: Tom Seaver fans 19 Padres including a record 10 in a row to end the game.',
    seedEntry: {
      date: '04-22', year: 1970, type: 'milestone',
      title: 'Tom Seaver strikes out 19 — 10 in a row',
      description: 'Mets ace Tom Seaver struck out 19 San Diego Padres at Shea Stadium, including the final 10 batters in order — an MLB record for consecutive strikeouts that still stands. The Mets won 2-1.',
      tags: ['mets', 'record']
    },
    source: 'https://www.baseball-reference.com/boxes/NYN/NYN197004220.shtml',
    priority: 2,
  },
  {
    id: 'otd-ryan-no-hitter-1',
    category: 'milestone',
    name: 'Ryan\'s 1st no-hitter (1973-05-15)',
    summary: 'May 15, 1973: Nolan Ryan no-hits the Royals — the first of his record seven career no-hitters.',
    seedEntry: {
      date: '05-15', year: 1973, type: 'milestone',
      title: 'Nolan Ryan\'s first career no-hitter',
      description: 'California Angels pitcher Nolan Ryan no-hit the Kansas City Royals 3-0 at Royals Stadium, walking three and striking out 12. It was the first of his MLB-record seven no-hitters; he would throw a second on July 15, 1973 — the only pitcher to throw two in the same year other than Johnny Vander Meer\'s back-to-back in 1938.',
      tags: ['angels', 'no-hitter', 'record']
    },
    source: 'https://www.baseball-reference.com/boxes/KCA/KCA197305150.shtml',
    priority: 2,
  },
  {
    id: 'otd-henderson-sb-record',
    category: 'record',
    name: 'Henderson SB record + Ryan no-no #7 (1991-05-01)',
    summary: 'May 1, 1991: Rickey Henderson swipes #939 to pass Lou Brock; that same night Nolan Ryan throws his 7th no-hitter at age 44.',
    seedEntry: {
      date: '05-01', year: 1991, type: 'record',
      title: 'Henderson breaks Brock\'s SB record + Ryan\'s 7th no-hitter',
      description: 'Two records on the same day: Rickey Henderson stole his 939th career base in Oakland to pass Lou Brock\'s all-time record ("today, I am the greatest of all time"); hours later in Texas, 44-year-old Nolan Ryan no-hit the Toronto Blue Jays 3-0 for the seventh no-hitter of his career — a record likely never to be broken.',
      tags: ['athletics', 'rangers', 'no-hitter', 'record']
    },
    source: 'https://en.wikipedia.org/wiki/Rickey_Henderson',
    priority: 1,
  },
  {
    id: 'otd-ryan-no-hitter-6',
    category: 'milestone',
    name: 'Ryan\'s 6th no-hitter at 43 (1990-06-11)',
    summary: 'June 11, 1990: 43-year-old Nolan Ryan no-hits Oakland — at the time the oldest pitcher to throw a no-hitter.',
    seedEntry: {
      date: '06-11', year: 1990, type: 'milestone',
      title: 'Nolan Ryan\'s 6th no-hitter — at age 43',
      description: 'Texas Rangers pitcher Nolan Ryan, 43, no-hit the Oakland Athletics 5-0 at the Oakland Coliseum. He struck out 14, walked two, and faced an A\'s lineup including Rickey Henderson, Mark McGwire, Jose Canseco, and Carney Lansford. At the time, Ryan was the oldest pitcher to throw a no-hitter; he broke his own record the next year on May 1, 1991, at age 44.',
      tags: ['rangers', 'no-hitter', 'record']
    },
    source: 'https://www.baseball-reference.com/boxes/OAK/OAK199006110.shtml',
    priority: 2,
  },
  {
    id: 'otd-seaver-300th',
    category: 'milestone',
    name: 'Seaver\'s 300th win (1985-08-04)',
    summary: 'Aug 4, 1985: Tom Seaver, in a White Sox uniform, throws a complete game at Yankee Stadium for win #300.',
    seedEntry: {
      date: '08-04', year: 1985, type: 'milestone',
      title: 'Tom Seaver\'s 300th career win',
      description: 'Chicago White Sox pitcher Tom Seaver beat the New York Yankees 4-1 at Yankee Stadium with a complete-game six-hitter for his 300th career victory. The 40-year-old former Mets ace was pitching against the team that traded him from his original Mets glory; ex-Yankees broadcaster Phil Rizzuto wept on the air during the call.',
      tags: ['white-sox', 'mets', 'milestone']
    },
    source: 'https://www.baseball-reference.com/boxes/NYA/NYA198508040.shtml',
    priority: 2,
  },

  // ============================================================
  // Postseason / WS moments (5)
  // ============================================================
  {
    id: 'otd-reggie-3hrs',
    category: 'world-series',
    name: 'Reggie\'s 3 HRs Game 6 (1977-10-18)',
    summary: 'Oct 18, 1977: Reggie Jackson homers on three consecutive pitches off three Dodgers pitchers in Game 6 of the WS.',
    seedEntry: {
      date: '10-18', year: 1977, type: 'milestone',
      title: 'Reggie Jackson\'s 3-home-run World Series Game 6',
      description: 'Yankees right fielder Reggie Jackson hit three home runs on three consecutive pitches off three different Dodgers pitchers — Burt Hooton, Elias Sosa, and Charlie Hough — in Game 6 of the World Series at Yankee Stadium. New York won 8-4 to clinch their first championship since 1962. The performance cemented Jackson\'s "Mr. October" nickname.',
      tags: ['yankees', 'dodgers', 'world-series']
    },
    source: 'https://www.baseball-reference.com/boxes/NYA/NYA197710180.shtml',
    priority: 1,
  },
  {
    id: 'otd-dodgers-first-ws-1955',
    category: 'world-series',
    name: 'Dodgers first WS title (1955-10-04)',
    summary: 'Oct 4, 1955: Johnny Podres shuts out the Yankees 2-0 in Game 7. Brooklyn finally beats New York after seven WS losses.',
    seedEntry: {
      date: '10-04', year: 1955, type: 'milestone',
      title: 'Brooklyn Dodgers\' first World Series title',
      description: 'Johnny Podres pitched a complete-game shutout to beat the Yankees 2-0 at Yankee Stadium in Game 7 of the World Series — the only championship the Dodgers ever won in Brooklyn. The Daily News headline the next morning: "WHO\'S A BUM!" Sandy Amorós\'s running catch in left field saved a potential game-tying double in the 6th.',
      tags: ['dodgers', 'yankees', 'world-series']
    },
    source: 'https://en.wikipedia.org/wiki/1955_World_Series',
    priority: 2,
  },
  {
    id: 'otd-morris-game7-1991',
    category: 'world-series',
    name: 'Morris\'s 10-inning Game 7 (1991-10-27)',
    summary: 'Oct 27, 1991: Jack Morris pitches 10 shutout innings as the Twins beat the Braves 1-0 in Game 7 of one of the greatest WS ever.',
    seedEntry: {
      date: '10-27', year: 1991, type: 'milestone',
      title: 'Jack Morris\'s 10-inning Game 7 shutout',
      description: 'Twins ace Jack Morris pitched 10 scoreless innings against the Braves in Game 7 of the World Series at the Metrodome. Gene Larkin singled home Dan Gladden in the bottom of the 10th to give Minnesota a 1-0 win. The 1991 Series — three games into extra innings, four decided in the final at-bat — is widely regarded as one of the greatest in MLB history. Morris was named World Series MVP.',
      tags: ['twins', 'braves', 'world-series']
    },
    source: 'https://www.baseball-reference.com/boxes/MIN/MIN199110270.shtml',
    priority: 2,
  },
  {
    id: 'otd-angels-first-ws-2002',
    category: 'world-series',
    name: 'Angels first WS title (2002-10-27)',
    summary: 'Oct 27, 2002: Anaheim beats the Giants 4-1 in Game 7 for their first championship in their 42nd season.',
    seedEntry: {
      date: '10-27', year: 2002, type: 'milestone',
      title: 'Anaheim Angels win first World Series',
      description: 'The Anaheim Angels beat the San Francisco Giants 4-1 in Game 7 at Edison Field for their first championship in 42 years of franchise history. Garret Anderson\'s 3rd-inning bases-clearing double broke the game open. Troy Glaus was named World Series MVP after hitting .385 with 3 home runs. The Angels had been one strike from elimination in Game 6.',
      tags: ['angels', 'giants', 'world-series']
    },
    source: 'https://en.wikipedia.org/wiki/2002_World_Series',
    priority: 2,
  },
  {
    id: 'otd-carter-walkoff-1993',
    category: 'world-series',
    name: 'Joe Carter\'s walk-off WS HR (1993-10-23)',
    summary: 'Oct 23, 1993: Joe Carter\'s 3-run walk-off off Mitch Williams in Game 6 wins the Blue Jays back-to-back titles.',
    seedEntry: {
      date: '10-23', year: 1993, type: 'milestone',
      title: 'Joe Carter\'s walk-off World Series home run',
      description: 'Toronto\'s Joe Carter hit a 3-run home run off Phillies closer Mitch "Wild Thing" Williams in the bottom of the 9th of Game 6 at SkyDome to win the World Series — only the second walk-off home run to end a World Series, after Bill Mazeroski in 1960. Tom Cheek\'s call: "Touch \'em all, Joe! You\'ll never hit a bigger home run in your life!" The Blue Jays were the first repeat champions since the 1977-78 Yankees.',
      tags: ['blue-jays', 'phillies', 'world-series']
    },
    source: 'https://en.wikipedia.org/wiki/1993_World_Series',
    priority: 1,
  },

  // ============================================================
  // Cultural / iconic moments (4)
  // ============================================================
  {
    id: 'otd-monday-saves-flag',
    category: 'event',
    name: 'Rick Monday saves the flag (1976-04-25)',
    summary: 'April 25, 1976: Cubs CF Rick Monday rescues an American flag from two protesters trying to burn it at Dodger Stadium.',
    seedEntry: {
      date: '04-25', year: 1976, type: 'event',
      title: 'Rick Monday rescues the flag at Dodger Stadium',
      description: 'During the bottom of the 4th of a Cubs-Dodgers game at Dodger Stadium, two protesters ran into left-center field, doused an American flag with lighter fluid, and tried to set it ablaze. Cubs center fielder Rick Monday sprinted over and snatched the flag away before they could light it. The crowd sang "God Bless America." Monday was honored at the 2002 Baseball Hall of Fame ceremony for the act, which is one of the most replayed plays in MLB history.',
      tags: ['cubs', 'dodgers', 'historic']
    },
    source: 'https://www.mlb.com/news/rick-monday-flag-incident-1976',
    priority: 1,
  },
  {
    id: 'otd-piazza-911-hr',
    category: 'event',
    name: 'Piazza\'s post-9/11 HR (2001-09-21)',
    summary: 'Sept 21, 2001: Mike Piazza hits an 8th-inning go-ahead 2-run HR in NYC\'s first major sports event after 9/11.',
    seedEntry: {
      date: '09-21', year: 2001, type: 'event',
      title: 'Mike Piazza\'s post-9/11 home run',
      description: 'Ten days after the September 11 attacks, the New York Mets hosted the Atlanta Braves at Shea Stadium in the first major-league sports event in New York after the terror attacks. With the Mets trailing 2-1 in the bottom of the 8th, Mike Piazza hit a go-ahead 2-run home run off Steve Karsay. Mets won 3-2. The moment is widely remembered as a symbolic step in New York\'s recovery.',
      tags: ['mets', 'historic']
    },
    source: 'https://en.wikipedia.org/wiki/Mike_Piazza',
    priority: 1,
  },
  {
    id: 'otd-ruth-farewell-1948',
    category: 'event',
    name: 'Babe Ruth\'s Yankee Stadium farewell (1948-06-13)',
    summary: 'June 13, 1948: A frail Babe Ruth, dying of cancer, makes his final appearance at Yankee Stadium for the park\'s 25th anniversary.',
    seedEntry: {
      date: '06-13', year: 1948, type: 'event',
      title: 'Babe Ruth\'s farewell at Yankee Stadium',
      description: 'On the 25th anniversary of Yankee Stadium, an emaciated 53-year-old Babe Ruth — gravely ill with throat cancer — appeared on the field one last time, leaning on a bat for support. The Yankees retired his #3. Nat Fein\'s photograph "The Babe Bows Out," capturing Ruth from behind, won the 1949 Pulitzer Prize for Photography. Ruth died two months later, on August 16, 1948.',
      tags: ['yankees', 'historic']
    },
    source: 'https://baseballhall.org/discover/inside-pitch/the-babe-bows-out',
    priority: 2,
  },
  {
    id: 'otd-dh-adopted',
    category: 'tradition',
    name: 'AL adopts the DH (1973-01-11)',
    summary: 'Jan 11, 1973: AL owners vote 8-4 to adopt the designated hitter rule for a 3-year trial — it has been permanent ever since.',
    seedEntry: {
      date: '01-11', year: 1973, type: 'tradition',
      title: 'American League adopts the designated hitter',
      description: 'American League owners voted 8-4 to adopt the designated hitter rule for a three-year trial. Ron Blomberg of the Yankees became the first DH on Opening Day 1973. The rule remained AL-only until 2022, when MLB adopted the universal DH for both leagues.',
      tags: ['rules', 'historic']
    },
    source: 'https://en.wikipedia.org/wiki/Designated_hitter',
    priority: 2,
  },

  // ============================================================
  // Records (4)
  // ============================================================
  {
    id: 'otd-aaron-ties-714',
    category: 'record',
    name: 'Aaron ties Ruth at 714 (1974-04-04)',
    summary: 'April 4, 1974: Hank Aaron homers in his first AB of the season off Jack Billingham to tie Babe Ruth\'s career HR record.',
    seedEntry: {
      date: '04-04', year: 1974, type: 'record',
      title: 'Hank Aaron ties Babe Ruth at 714 home runs',
      description: 'On Opening Day in Cincinnati, Atlanta\'s Hank Aaron homered off Reds pitcher Jack Billingham in his first at-bat of the 1974 season — career HR #714, tying Babe Ruth\'s all-time record. He passed Ruth four days later on April 8, 1974, with #715 off Al Downing in Atlanta.',
      tags: ['braves', 'record']
    },
    source: 'https://www.baseball-reference.com/players/a/aaronha01.shtml',
    priority: 1,
  },
  {
    id: 'otd-bonds-passes-715',
    category: 'record',
    name: 'Bonds passes Ruth at 715 (2006-05-28)',
    summary: 'May 28, 2006: Barry Bonds homers off Byung-Hyun Kim for HR #715, passing Babe Ruth into 2nd place all-time.',
    seedEntry: {
      date: '05-28', year: 2006, type: 'record',
      title: 'Barry Bonds passes Babe Ruth at 715 career home runs',
      description: 'Giants left fielder Barry Bonds hit a 4th-inning home run off Colorado\'s Byung-Hyun Kim at AT&T Park for career HR #715, moving past Babe Ruth into second place on the all-time home-run list. He would pass Hank Aaron\'s record of 755 on August 7, 2007, finishing his career with 762.',
      tags: ['giants', 'record']
    },
    source: 'https://www.baseball-reference.com/players/b/bondsba01.shtml',
    priority: 2,
  },
  {
    id: 'otd-bonds-71hr',
    category: 'record',
    name: 'Bonds 71st HR / single-season record (2001-10-05)',
    summary: 'Oct 5, 2001: Barry Bonds hits HR #71 off Chan Ho Park, breaking Mark McGwire\'s 1998 single-season record of 70.',
    seedEntry: {
      date: '10-05', year: 2001, type: 'record',
      title: 'Barry Bonds breaks single-season HR record',
      description: 'Giants left fielder Barry Bonds hit his 71st home run of the season off Dodgers pitcher Chan Ho Park at Pacific Bell Park in San Francisco, breaking Mark McGwire\'s 1998 record of 70. Bonds added a 72nd in the same game and finished the season with 73 home runs — still the MLB single-season record.',
      tags: ['giants', 'record']
    },
    source: 'https://www.baseball-reference.com/boxes/SFN/SFN200110050.shtml',
    priority: 1,
  },
  {
    id: 'otd-judge-rookie-50',
    category: 'record',
    name: 'Judge sets rookie HR record (2017-09-25)',
    summary: 'Sept 25, 2017: Aaron Judge hits HR #50 to break Mark McGwire\'s 1987 rookie record of 49.',
    seedEntry: {
      date: '09-25', year: 2017, type: 'record',
      title: 'Aaron Judge breaks the MLB rookie home-run record',
      description: 'Yankees rookie Aaron Judge hit his 50th home run of the season at Yankee Stadium against the Royals, breaking Mark McGwire\'s 30-year-old rookie record of 49 home runs from 1987. Judge finished the year with 52 home runs and won AL Rookie of the Year unanimously.',
      tags: ['yankees', 'record', 'rookies']
    },
    source: 'https://www.baseball-reference.com/players/j/judgeaa01.shtml',
    priority: 2,
  },

  // ============================================================
  // Bizarre / iconic plays (1)
  // ============================================================
  {
    id: 'otd-merkles-boner',
    category: 'event',
    name: 'Merkle\'s Boner (1908-09-23)',
    summary: 'Sept 23, 1908: Giants rookie Fred Merkle fails to touch second on a winning hit; the call costs NY the pennant.',
    seedEntry: {
      date: '09-23', year: 1908, type: 'event',
      title: 'Fred Merkle\'s Boner',
      description: 'With two out in the bottom of the 9th and the Giants and Cubs tied 1-1 at the Polo Grounds, Giants rookie Fred Merkle was on first when Al Bridwell singled in the apparent winning run. Merkle, following common practice of the era, ran toward the dugout without touching second. The Cubs\' Johnny Evers retrieved a ball and stepped on second; umpires ruled Merkle out and the game a tie. The Cubs won the makeup game and the NL pennant. The play haunted Merkle for the rest of his career and gave baseball its most enduring "boner" — a synonym for blunder for decades after.',
      tags: ['giants', 'cubs', 'historic']
    },
    source: 'https://en.wikipedia.org/wiki/Merkle%27s_Boner',
    priority: 2,
  },
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
    type: 'on-this-day',
    category: stub.category,
    name: stub.name,
    summary: stub.summary,
    seedEntry: stub.seedEntry,
    source: stub.source,
    priority: stub.priority,
    status: 'pending',
  });
  added++;
}

backlog.generatedAt = new Date().toISOString();
fs.writeFileSync(BACKLOG_PATH, JSON.stringify(backlog, null, 2) + '\n');

const pending = (backlog.entries || []).filter(e => e.status === 'pending');
const otdPending = pending.filter(e => e.type === 'on-this-day').length;
const triviaPending = pending.filter(e => e.type === 'trivia').length;
console.log(`curation-backlog.json: +${added} on-this-day stubs added (${skipped} skipped — already present)`);
console.log(`Pending now: ${pending.length} total · ${otdPending} on-this-day · ${triviaPending} trivia · ${pending.length - otdPending - triviaPending} other`);
