# Baseball Daily Intelligence — Knowledge Base

Living record of decisions, open issues, and action items. Updated every session.

**Last updated:** 2026-04-20

**Tier convention (dynamic types only — adopted from MODR):**
- **T1** — Critical / production-impacting; fix first
- **T2** — Near-Term; planned for an upcoming session
- **T3** — Deferred; someday / research

Static types (Reference, Decision, Limitation) omit Tier.

---

## Entries

### KB-0001 | Tech stack: vanilla ES modules + static JSON
- **Type:** Decision
- **Date:** 2026-04-19
- **Category:** Architecture / Stack
- **Finding:** Vanilla ES modules + CSS variables + JSON data layer. No build step, no React. Service worker (Phase 3A) provides PWA offline.
- **Status:** Closed
- **Cross-ref:** CLAUDE.md § Data Flow Architecture · app/sw.js

### KB-0002 | MLB Stats API as primary source
- **Type:** Reference
- **Date:** 2026-04-19
- **Category:** Data / APIs
- **Finding:** `statsapi.mlb.com/api/v1`. No auth. Team IDs: Cardinals=138, Nationals=120. Leagues: AL=103, NL=104.
- **Status:** Closed
- **Cross-ref:** ingestion/lib/mlb-api.js

### KB-0003 | YouTube API: ingestion-only, defer key acquisition
- **Type:** Decision
- **Date:** 2026-04-19
- **Category:** Data / APIs / Security
- **Finding:** YouTube API key used ONLY in local ingestion. Key in `.env` (gitignored). Deferred to Phase 3B when highlight ingestion is triggered.
- **Status:** Open (Phase 3B)
- **Cross-ref:** CLAUDE.md § Secret Safety

### KB-0004 | Player index scope: all-time (Chadwick, 1871+)
- **Type:** Decision
- **Date:** 2026-04-19
- **Category:** Data / Players
- **Finding:** Universal search over ~23k MLB players from Chadwick. 19th-century gaps render as "—". Sorted by yearsInMLB desc.
- **Status:** Closed
- **Cross-ref:** scripts/build-player-index.js · app/js/tabs/players.js

### KB-0005 | Repo privacy: local-first, public later with safeguards
- **Type:** Decision
- **Date:** 2026-04-19
- **Category:** Deployment / Security
- **Finding:** No remote yet. Phase 3B: `.gitignore` enforcement, check-secrets clean, CLAUDE.md PII-strip, narrow scope, John ATP. GitHub username confirmed `jjmgladden` (see memory).
- **Status:** Open (awaiting Phase 3B trigger)
- **Cross-ref:** CLAUDE.md § Repo Privacy Posture · memory/github_deployment.md

### KB-0006 | Versioning convention: whole numbers
- **Type:** Decision
- **Date:** 2026-04-19
- **Finding:** All versioning uses whole numbers. Every change rolls. Previous archives to `archive/` subfolder.
- **Status:** Closed
- **Cross-ref:** CLAUDE.md § Versioning · archive/CLAUDE_v1.md · archive/CLAUDE_v2.md

### KB-0007 | PWA icons — SVG delivered, PNG deferred
- **Type:** Action
- **Date:** 2026-04-19
- **Category:** UI / PWA
- **Finding:** Phase 3A ships `app/icon.svg` (baseball on deep-navy). Works on modern browsers and Android. iOS Safari full-PWA support still prefers PNG — deferred to Phase 4.
- **Status:** Open (Phase 4 — PNG set)
- **Cross-ref:** app/icon.svg · app/manifest.webmanifest

### KB-0008 | Season-progress exact dates
- **Type:** Limitation → Closed
- **Date:** 2026-04-19
- **Finding:** Phase 3A switched `computeSeasonProgress` to call `/seasons/{season}` via `mlb.getSeasonDates`. Falls back to hardcoded dates only if API errors. Snapshot now carries `seasonProgress.source: 'api'|'fallback'`.
- **Status:** Closed
- **Cross-ref:** ingestion/fetch-daily.js § computeSeasonProgress

### KB-0009 | Injury tracker (required)
- **Type:** Action → Closed
- **Date:** 2026-04-19
- **Finding:** Delivered Phase 2. Per-team 40-man roster scan, IL codes D7/D10/D15/D60 etc. Cardinals/Nationals pins show IL badge.
- **Status:** Closed
- **Cross-ref:** ingestion/fetch-injuries.js · app/js/tabs/daily.js

### KB-0010 | Creative features slate
- **Type:** Decision → Closed
- **Date:** 2026-04-19
- **Finding:** All committed creative features delivered by end of Phase 3A:
  1. ✅ On This Day (Phase 2)
  2. ✅ Cardinals streak tracker (Phase 3A — also Nationals)
  3. ✅ Player comparison (Phase 3A)
  4. ✅ Favorite players / localStorage (Phase 3A)
  5. ✅ Daily trivia (Phase 3A)
  6. ✅ Trade tracker (Phase 2)
  Stretch Cardinals Legends Timeline: partially realized via the Cardinals tab's HOFer table and historic seasons.
- **Status:** Closed
- **Cross-ref:** CLAUDE.md § Current Phase

### KB-0011 | Chadwick CSV: local-file workflow preferred
- **Type:** Decision
- **Date:** 2026-04-19
- **Finding:** Build script tries live download, falls back to local files in `data/master/chadwick/`.
- **Status:** Closed
- **Cross-ref:** scripts/build-player-index.js

### KB-0012 | Stories dataset — accuracy is a hard requirement
- **Type:** Decision
- **Date:** 2026-04-19
- **Finding:** 20-story seed, each with `sources` field. New entries must cite verifiable public records. Same rule now applies to `cardinals-deep.json` and `trivia.json`.
- **Status:** Closed (policy standing)
- **Cross-ref:** data/master/stories.json · data/master/cardinals-deep.json · data/master/trivia.json

### KB-0013 | On-This-Day seed coverage
- **Type:** Limitation
- **Date:** 2026-04-19
- **Finding:** Seed covers ~50 landmark events. Expansion via adding entries — no schema change.
- **Status:** Open (content expansion)
- **Cross-ref:** data/master/on-this-day-seed.json

### KB-0014 | Snapshot schema v3
- **Type:** Decision
- **Date:** 2026-04-19
- **Finding:** schemaVersion rolled 2 → 3. Added: `cardinals.recentForm`, `nationals.recentForm`, `seasonProgress.source`, `seasonProgress.dates` (replaces `approximateDates`). App handles older snapshots gracefully.
- **Status:** Closed
- **Cross-ref:** ingestion/fetch-daily.js · app/js/components/streak.js

### KB-0015 | Tab lazy-loading pattern
- **Type:** Reference
- **Date:** 2026-04-19
- **Finding:** Only daily snapshot loads eagerly. Other tabs defer master-data fetch until first activation. Loaders memoized in `data-loader.js`.
- **Status:** Closed
- **Cross-ref:** app/js/app.js · app/js/data-loader.js

### KB-0016 | PWA service-worker strategy
- **Type:** Reference
- **Date:** 2026-04-19
- **Category:** Architecture / PWA
- **Finding:** `app/sw.js` uses cache-first for `/app/` (shell) and network-first for `/data/` (snapshots always try fresh). Cache name `baseball-daily-v1` — bump when shell changes to force reclaim. SW registered only over http(s), never file://.
- **Status:** Closed
- **Cross-ref:** app/sw.js · app/js/app.js § registerServiceWorker

### KB-0017 | Favorites storage
- **Type:** Decision
- **Date:** 2026-04-19
- **Category:** Features / UI
- **Finding:** Favorites stored in localStorage under key `baseball-daily.favorites.v1` as a JSON array of MLBAM IDs. Survives page reload; scoped per-browser (not synced). Clearing site data resets favorites.
- **Status:** Closed
- **Cross-ref:** app/js/components/favorites.js

### KB-0018 | Trivia daily pick deterministic
- **Type:** Reference
- **Date:** 2026-04-19
- **Category:** Features / Content
- **Finding:** Daily trivia question selected by `dayOfYear % questionCount`. Same date always shows same question across reloads. Answer reveal state persists per day in sessionStorage.
- **Status:** Closed
- **Cross-ref:** app/js/components/trivia.js · data/master/trivia.json

### KB-0020 | Public on-demand refresh — anyone can trigger ingestion
- **Type:** Action
- **Tier:** T2
- **Dependency:** Owner / Claude
- **Date:** 2026-04-20
- **Source:** Chat 2026-04-20 — first-pass Refresh Data button reverted
- **Category:** Features / Deployment
- **Tags:** refresh, pwa, github-actions, public-trigger, cloudflare
- **Finding:** The first-pass "Refresh data" button (added commit `3138483`, reverted commit `________`) was a deep-link to the GitHub Actions workflow page. That only works for accounts with write access to `jjmgladden/baseball-daily` — family/friends viewing the public site cannot trigger a refresh and don't even see the "Run workflow" UI. Desired behavior: **anyone viewing the site can click a button and trigger an ingestion run.**

  **Implementation options (trade-offs):**

  | Approach | Pros | Cons |
  |---|---|---|
  | Embedded fine-grained PAT in public JS | One click, zero infrastructure | Token visible to any site visitor; could be harvested for noise/abuse; rotate if leaked; posture violation of CLAUDE.md § Secret Safety |
  | **Cloudflare Worker proxy** (recommended) | One click, token stays server-side, simple rate-limiting, free tier sufficient | Adds one infrastructure dependency (cloudflare.com account, Wrangler CLI) |
  | GitHub App with installation token | Similar to Worker | More complex setup |

  **Recommended next-pass (when picked up):** Cloudflare Worker with a single `/dispatch` endpoint that holds the PAT in its secret store and calls the GitHub API to trigger `daily.yml`. Worker URL is called by a button on the app. Add basic rate-limiting (e.g. max 1 dispatch per IP per 10 min) to discourage abuse.

  Until then: daily cron handles freshness for all visitors (5 AM CDT); owner can manually trigger via GitHub Actions UI or `gh workflow run`.
- **Status:** Open
- **Cross-ref:** CLAUDE.md § Secret Safety · `.github/workflows/daily.yml`

### KB-0019 | Recent-form 14-day window
- **Type:** Reference
- **Date:** 2026-04-19
- **Category:** Data / Features
- **Finding:** Recent form for Cards + Nats pulls last 14 calendar days via `mlb.getTeamSchedule`. Only `Final` games counted. Streak walks backward from most recent result. Last-10 shown separately. Home/road splits count the full 14-day window.
- **Status:** Closed
- **Cross-ref:** ingestion/fetch-daily.js § computeRecentForm · app/js/components/streak.js

---

## Quick Index

**Open items (with tier where applicable):**
- KB-0003 — YouTube API key acquisition — Decision (static, awaiting trigger)
- KB-0005 — Public GitHub repo transition — closed 2026-04-20 when repo went live
- KB-0007 — PNG icon set for iOS — Action, **T3** (deferred, Phase 4)
- KB-0013 — On-This-Day seed expansion — Limitation (content-only, no work item)
- KB-0020 — Public on-demand refresh — Action, **T2** (near-term enhancement)

**Closed:**
KB-0001, KB-0002, KB-0004, KB-0006, KB-0008, KB-0009, KB-0010, KB-0011, KB-0012, KB-0014, KB-0015, KB-0016, KB-0017, KB-0018, KB-0019
