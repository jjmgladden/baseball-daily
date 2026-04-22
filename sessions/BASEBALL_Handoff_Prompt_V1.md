# Ozark Joe's Baseball Daily Intelligence Report — Handoff Prompt V1

**Session 1 | April 19–20, 2026 (single extended session)**

**Predecessors:** None — this is the inaugural session.

---

## Scope of This Session

Full bootstrap of the project from a blank folder to a deployed, autonomous MLB intelligence site — roughly equivalent to Phase 0 planning through a Phase 4 content-and-polish state.

Primary deliverable: **https://jjmgladden.github.io/baseball-daily/** — live, auto-updating every morning at 3 AM EDT.

---

## Current Document and Data Versions

| Artifact | Version | File | Notes |
|---|---|---|---|
| CLAUDE.md | **v12** | CLAUDE.md | Session 1 — adopted MODR-style session handoff methodology |
| Knowledge Base | v1 (24 entries) | docs/knowledge-base.md | KB-0001 through KB-0024 |
| Snapshot schema | **v5** | data/snapshots/*.json | Adds `recap`, `highlights`, `notableGames`, `youtubeEnabled`, per-team `recentForm` |
| SW cache | **v14** | app/sw.js | Bumped 14 times — any `app/` shell change requires a bump |
| App shell version label | v6 | app/index.html footer | Owner-facing label |
| MLB API wrapper | v3 | ingestion/lib/mlb-api.js | Now includes getGameFeed, getTeamSchedule, getSeasonDates, getTransactions, getTeams |
| YouTube API wrapper | v1 | ingestion/lib/youtube-api.js | Active; key in GitHub Secret + local .env |
| Chadwick player index | built 2026-04-19 | data/master/player-index.json | ~23k players; rebuilt weekly via GitHub Actions Monday |

### Data files created this session

| File | Entries | Purpose |
|---|---|---|
| data/master/franchises.json | 30 | All 30 MLB franchises with histories |
| data/master/stories.json | 20 | Long-form narrative stories (military, faith, charity, umpires, Negro Leagues) |
| data/master/on-this-day-seed.json | 50 | Date-indexed baseball events |
| data/master/cardinals-deep.json | — | Retired numbers (11), HOFers (19), historic seasons (12), traditions (3) |
| data/master/cardinals-links.json | 15 | Cardinals legends with external reference links (Musial, Gibson, Pujols, Molina, **Bottomley featured**, etc.) |
| data/master/historical-videos.json | 10 | Iconic moments (Robinson debut, Mays Catch, Aaron 715, Fisk wave, etc.) |
| data/master/history-links.json | 15 | Franchise external reference links |
| data/master/legends-general.json | 20 | Non-Cardinals legends (Vin Scully, Josh Gibson, Aaron, DiMaggio, Gehrig, Clemente, Griffey Jr., etc.) |
| data/master/brothers.json | 10 | Brother pair/trio entries (DiMaggios, Alous, Waners, Deans, Delahantys, Niekros, Perrys, Molinas, Boyers, Uptons) |
| data/master/strange-plays.json | 12 | Oddities (Eddie Gaedel, Disco Demolition, Dock Ellis LSD no-hitter, Pine Tar Game, Bartman, etc.) |
| data/master/trivia.json | 30 | Baseball trivia questions |
| data/master/curation-backlog.json | ~150 | Weekly-batch queue; 20 activated, 131 pending |

---

## What Happened — Chronological Work Tracks

### Phase 0 — Planning (morning of 2026-04-19)

Owner provided a detailed prompt describing the desired tool, referencing the sibling MODR-PBX-Project and Travel projects for conventions. Key Phase 0 decisions locked in:

- **Stack:** vanilla ES modules + JSON data layer + static PWA (no build step). Mirror MODR's data-first pattern.
- **Versioning:** whole numbers only (MODR convention).
- **Stories engine:** seed with curated, sourced entries; expand via weekly batch workflow later.
- **Player scope:** all-time (Chadwick 1871+), ~23k players.
- **Scheduler:** start local .bat; migrate to GitHub Actions after functional.
- **Hosting:** local first, then public GitHub repo with secret-scanner gate.
- **YouTube:** ingestion-only (never browser); key acquisition deferred until Phase 3.

ATP granted for Options A / B / C as posed. Six decisions recorded as KB-0001 through KB-0006.

### Phase 1 — Foundations

Scaffold built:

- `ingestion/lib/mlb-api.js` — MLB Stats API wrapper (no auth, stable)
- `ingestion/fetch-daily.js` — orchestrator
- `app/index.html` + `app/js/app.js` — static PWA shell with 6 tabs (Daily Report, Cardinals, Teams, Players, History, Stories)
- `app/styles/main.css` — dark theme per mandatory CSS variables
- `scripts/serve.js` — local static server on port 8080 (later moved to **1882 — Cardinals founding year** to avoid conflicts with owner's other projects)
- `scripts/check-secrets.js` — pre-commit pattern scanner
- `run_daily.bat` — Windows Task Scheduler target
- `package.json` with `"type": "module"` not set (Node defaults fine for our use)

Daily Report tab rendered Cardinals/Nationals pins, scoreboard, standings, season progress.

### Phase 2 — Depth

- Chadwick player index import (~23k players) via `scripts/build-player-index.js`
- Universal player search tab with filter + favorites + side-by-side comparison
- Franchise history module (all 30 teams)
- On-This-Day engine (seed + Chadwick birthday merge)
- Stories engine (20 curated narratives)
- **Injury tracker** (required feature)
- Trade tracker

### Phase 3A — Polish

- Dedicated Cardinals tab (retired numbers, HOFers, historic seasons, traditions)
- Player comparison tool (`components/comparison.js`)
- Favorites (`components/favorites.js`, localStorage)
- Daily trivia card on Daily Report (`components/trivia.js`)
- Cardinals + Nationals streak tracker (`components/streak.js`, 14-day form)
- PWA service worker + SVG icon
- Exact season dates from `/seasons/{season}` (replaced hardcoded approximations)
- Snapshot schema v2 → v3

### Phase 3B — Deployment

- **Public GitHub repo created:** `github.com/jjmgladden/baseball-daily`
- **GitHub Pages enabled** — `https://jjmgladden.github.io/baseball-daily/`
- Pre-push: `scripts/check-secrets.js` verified clean; CLAUDE.md stripped of PII (name/email references removed)
- Root `index.html` redirect + `.nojekyll`
- Relative paths throughout (`../data/...`) for Pages subpath compatibility
- `.github/workflows/daily.yml` — Actions cron replacing local `.bat`
- **Cron time changed during session:** 10:00 UTC (5 AM CT) → **07:00 UTC (3 AM EDT)** to align with target reader (owner's brother) in Virginia

### KB-0003 Activation — YouTube Highlights

Owner obtained the API key after following `docs/youtube-api-setup.md` step-by-step. Key restricted to YouTube Data API v3 only.

Delivered:
- `ingestion/lib/youtube-api.js`
- `ingestion/fetch-highlights.js` — team-keyed search against official MLB channel, 48-hour lookback
- `app/js/components/highlights.js` — thumbnail-link cards (initially iframes, switched after YouTube Error 153 revealed MLB disables embedding on their channel)
- `ingestion/lib/env.js` — tiny .env loader (added after initial run failed silently — `process.env.YOUTUBE_API_KEY` was empty because Node doesn't auto-load .env)
- Verified end-to-end locally and in cloud workflow

### Game Recaps + Curated Deep Content + Weekly Index Refresh (KB-0023)

User request for deeper Daily Report content and more discoverability:

- `ingestion/lib/recap.js` — classifies notable games (one-run, shutout, blowout, slugfest, pitchers' duel), builds structured recaps from `/feed/live` (scoring plays with descriptions, linescore, W/L/Sv decisions, attendance, weather)
- `app/js/components/recap.js` — renders narrative + linescore table + ordered scoring plays + decisions box
- "Other Notable Games" section on Daily Report for non-Cards/Nats games
- `data/master/cardinals-links.json` — 15 Cardinals legends with external references (BBref, SABR, HoF, MLB.com, Wikipedia, YouTube search). **Jim Bottomley entry is FEATURED with deep-dive fields and a `personalNote` acknowledging friendship with owner's grandfather Riley Gladden.**
- `data/master/history-links.json` — 15 franchise external references
- `data/master/historical-videos.json` — 10 iconic moments
- `.github/workflows/weekly-index.yml` — Monday 08:00 UTC Chadwick rebuild
- History tab enriched with Iconic Moments + franchise link-outs
- Players tab displays `generatedAt` of the index

### Curation Pipeline (KB-0024)

Two-input pipeline for content growth:

1. **Weekly batch workflow** (`.github/workflows/weekly-batch.yml`)
   - Monday 08:00 UTC
   - Reads `data/master/curation-backlog.json`, picks next 10 `pending` entries sorted by priority + id
   - Opens labeled review Issue; **@-mentions owner** (added after first Issue didn't trigger email)
   - Issue uses **task-list checkboxes** (added after first Issue had no approve UI)
   - Issue has a **"✅ Approve ALL entries below"** one-tap option at the top (added after owner found tapping 10 boxes tedious)
   - Issue footer prompts: *"Want a themed batch? Reply 'do a [theme] batch' in chat"*
2. **Public submission Worker** (`worker/`)
   - Cloudflare Worker receiving POST from site's "Suggest a player or moment" footer link
   - Validates + rate-limits (3/IP/10min) + honeypot
   - Creates labeled GitHub Issue via GitHub API
   - Fine-grained PAT scoped to Issues-write only
   - **Code ready; owner deployment pending per `worker/README.md` (15-min first-time setup)**

Seeded `curation-backlog.json` with ~150 entries. 20 approved and activated this session (Issues #1, #2, #3 closed and applied):
- 10 from Issue #1: Vin Scully, Sparky Anderson, Connie Mack, Casey Stengel, Oscar Charleston, Josh Gibson, Buck O'Neil, Cool Papa Bell, Kenesaw Mountain Landis, Bill Veeck
- 10 from Issue #3: Branch Rickey + 9 HOFers (Bench, Brett, Clemente, Cobb, DiMaggio, Gehrig, Griffey Jr., Gwynn, Henderson)
- 10 brothers from Themed Issue #2: DiMaggios, Alous, Waners, Deans, Delahantys, Niekros, Perrys, Molinas, Boyers, Uptons

### Stories Tab Filtering (Tier 1 + Tier 2)

Added at owner's request in anticipation of content growth:
- Search box (debounced 150ms)
- Era dropdown (from data)
- Category pills (existing)
- Read/unread tracking (`components/story-state.js`, localStorage)
- Favorites per story (shared mechanism)
- "Unread only" / "Favorites only" toggles
- Random unread button
- Reading time estimates (~220 WPM)

### Unified Stories Hub (Option A — user feedback fix)

Discovered: owner couldn't find the 30 new legends/brothers entries on the Stories tab — they'd landed in `legends-general.json` + `brothers.json` (rendered on History tab). Owner's mental model: "Stories = all curated content."

Fix: `app/js/tabs/stories.js` v4 loads all three files (`stories.json` + `legends-general.json` + `brothers.json`), merges with `_type` tags (narrative / legend / brothers), renders type-appropriate cards and detail views, adds type filter pills. History tab removed its duplicate sections and now has a cross-link banner pointing to Stories.

### Rename to "Ozark Joe's Baseball Daily Intelligence Report"

Owner branded the site for his brother. Updated:
- `app/index.html` (title, brand, footer)
- `app/manifest.webmanifest` (name, short_name, description)
- `README.md` + `CLAUDE.md`
- SW cache v9 → v10

### Splash Screen Intro

Once-per-session animation for the brother's "wow" moment:
- Baseball icon rolls in from the left, bounces, spins 720°
- Title assembles word-by-word (white / Cardinals gold / Cardinals red)
- Subtitle fades in
- Auto-dismisses at 7s, click anywhere to skip early
- Respects `prefers-reduced-motion`
- `app/js/components/splash.js` — sessionStorage-tracked
- SW cache v12 → v13

### Trivia Tab

New dedicated tab (`app/js/tabs/trivia.js`):
- Search box (matches question + answer + category)
- Category filter pills with per-category counts
- Random unrevealed button
- Per-card "Show answer" with fade-in animation
- "Unrevealed only" toggle for quiz mode
- Session-based revealed tracking

### Strangest Plays in History

New section on History tab:
- `data/master/strange-plays.json` — 12 curated entries with verified sources
- Amber-accent styling (distinct from blue Iconic Moments)

### Session-Handoff Methodology Adoption (this commit)

Final act of Session 1: mirror MODR's session handoff pattern. Added `sessions/` folder, Handoff V1 (this file), and Kickoff for Session 2. CLAUDE.md v11 → v12 with **MANDATORY** Session-Start / Session-End protocols including the expanded checklist (open-KB dump, weekly-batch Issue check, submission Issue check, pre-push JS import verification).

---

## Decisions Committed (Session 1)

| Topic | Decision | KB |
|---|---|---|
| Stack | Vanilla ES modules + static JSON + PWA | KB-0001 |
| Primary API | MLB Stats API (unofficial but stable) | KB-0002 |
| YouTube scope | Ingestion-only; key deferred; now active | KB-0003 |
| Player index scope | All-time (1871+, ~23k players) | KB-0004 |
| Repo privacy | Public (safeguarded via check-secrets + PII strip) | KB-0005 |
| Versioning | Whole numbers only; rolls on any change | KB-0006 |
| PWA icons | SVG shipped; PNG deferred to Phase 4 | KB-0007 |
| Season progress | Live API via `/seasons/{season}` | KB-0008 |
| Injury tracker | Required; daily 40-man roster scan | KB-0009 |
| Creative features | Full slate delivered (comparison, favorites, trivia, streak, on-this-day, trades) | KB-0010 |
| Chadwick CSVs | Local-file workflow preferred over live download | KB-0011 |
| Stories accuracy | Sourced-only, no fabrication, policy standing | KB-0012 |
| Snapshot schema | v5 (adds recap, highlights, notableGames, youtubeEnabled, recentForm) | KB-0014 |
| Cron time | 07:00 UTC (3 AM Eastern) for brother in Virginia | — |
| SW cache | Must bump on shell changes (v14 at session end) | KB-0016 |
| Weekly curation | Owner approves via checkboxes in Issue; Claude applies | KB-0024 |
| Submission Worker | Cloudflare Worker → GitHub Issue; owner deploy pending | KB-0024 |
| Stories hub | Unified narratives + legends + brothers with type filter | — |
| Pickleball | Sibling project is new-session-worthy; separate folder/repo | — |

---

## Known Issues / Tech Debt

1. **Submission Worker not yet deployed** — owner must complete `worker/README.md` steps before public submissions activate. Site's footer modal shows "not yet configured" placeholder on submit until then.
2. **PNG icons missing** — iPhone home-screen install shows fallback (KB-0007, T3).
3. **GitHub Actions Node 20 deprecation** — workflows must be updated before Sep 2026 (KB-0022, T3).
4. **SW auto-reload not implemented** — users must manually clear cache or hard-refresh twice after shell updates (KB-0021, T2).
5. **Public "Refresh data" button not built** — only authenticated repo admin can trigger; general visitors ride the daily cron (KB-0020, T2).
6. **Trivia expansion** — seed is 30 questions; expand via themed-batch requests (*"do a [theme] trivia batch"*).
7. **On-This-Day seed coverage partial** — 50 entries cover landmark dates; many MM-DD values have no curated event (KB-0013).
8. **pre-push JS import check** — added as a rule in CLAUDE.md v12 after 1 incident (stories.js `\\'s` escape blanked the site). Future sessions must run the `node -e "import(...)"` loop before pushing any `app/js/` change.

---

## Open Knowledge Base Items (End of Session 1)

**Dynamic (Action / Issue / Concept):**

| KB | Tier | Dep | Title |
|---|---|---|---|
| KB-0007 | T3 | Claude | PNG icon set for iOS PWA install |
| KB-0013 | — | — | On-This-Day seed coverage expansion (content-only) |
| KB-0020 | T2 | Claude | Public on-demand refresh (Cloudflare Worker proxy) |
| KB-0021 | T2 | Claude | Auto-reload on service-worker update |
| KB-0022 | T3 | Claude | GitHub Actions Node 20 deprecation (fix before Sep 2026) |
| KB-0024 | — | Owner | Submission Worker code ready; awaiting `wrangler deploy` |

**Static / Closed this session:** KB-0001, KB-0002, KB-0003, KB-0004, KB-0005, KB-0006, KB-0008, KB-0009, KB-0010, KB-0011, KB-0012, KB-0014, KB-0015, KB-0016, KB-0017, KB-0018, KB-0019, KB-0023.

---

## System State at End of Session 1

- **Repo:** `github.com/jjmgladden/baseball-daily` — public — `main` branch at HEAD of Session 1
- **Site:** `https://jjmgladden.github.io/baseball-daily/` — live
- **Local path:** `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project\`
- **Port for local dev:** 1882 (Cardinals founding year)
- **Cron schedules:**
  - Daily ingestion: `0 7 * * *` UTC
  - Weekly Chadwick rebuild: `0 8 * * 1` UTC
  - Weekly curation batch: `0 8 * * 1` UTC
- **API keys active:**
  - YouTube Data API v3 — in local `.env` and GitHub Secret `YOUTUBE_API_KEY`
- **Worker:** code committed, NOT deployed
- **Open GitHub Issues:** Issues #1–3 are closed (applied). No open Issues at session end.
- **Memory files:**
  - `memory/MEMORY.md` — index
  - `memory/github_deployment.md` — jjmgladden identity + gh CLI + pre-push checklist
  - `memory/service_worker_cache_bump.md` — the SW cache rule with incident reference

---

## Volume Summary (for historical reference)

- ~14 commits pushed to `main`
- ~100+ files created or substantially modified
- CLAUDE.md rolled 12 times (v1 → v12)
- SW cache rolled 14 times (v1 → v14)
- Snapshot schema: v1 → v5
- ~80 user messages exchanged
- 3 GitHub Issues opened, approved, and applied

Session 1 closes clean with all tests passing and the site fully operational on its daily + weekly autonomous schedule.
