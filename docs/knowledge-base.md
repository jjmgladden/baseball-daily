# Baseball Daily Intelligence — Knowledge Base

Living record of decisions, open issues, and action items. Updated every session.

**Last updated:** 2026-04-22 (Session 3)

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

### KB-0003 | YouTube API: ingestion code landed, key acquisition pending
- **Type:** Decision
- **Date:** 2026-04-19 (updated 2026-04-20 — code delivered, awaiting owner key setup)
- **Category:** Data / APIs / Security
- **Tags:** youtube, secrets, highlights
- **Finding:** YouTube API key used ONLY in local Node ingestion (or GitHub Actions via the `YOUTUBE_API_KEY` secret) — never in the browser.

  **Delivered 2026-04-20:**
  - `ingestion/lib/youtube-api.js` — API wrapper
  - `ingestion/fetch-highlights.js` — team-keyed search against the official MLB channel (48h lookback, 3 results default)
  - `ingestion/fetch-daily.js` v4 — orchestrates highlights; snapshot `schemaVersion` rolled to 4; adds `cardinals.highlights`, `nationals.highlights`, `youtubeEnabled` flag
  - `app/js/components/highlights.js` — responsive iframe embeds (youtube-nocookie.com, lazy-loaded)
  - `app/js/tabs/daily.js` — Highlight Videos section below Recent Form with a helpful placeholder when the key isn't set
  - `docs/youtube-api-setup.md` — step-by-step guide covering Google Cloud Console → `.env` → GitHub Secrets → verification
  - Graceful degradation: if key is missing, highlights arrays are empty; UI shows a polite placeholder instead of breaking.

  **Activation completed 2026-04-20:** key created in Google Cloud Console "My First Project" (shared with owner's other Google APIs), restricted to YouTube Data API v3 only, pasted into local `.env` and GitHub Secret `YOUTUBE_API_KEY`. Verified end-to-end — local `npm run fetch:daily` returns 3 Cards + 3 Nats videos; cloud workflow log confirms `key set: true` with same results.
- **Status:** Closed (fully operational)
- **Cross-ref:** docs/youtube-api-setup.md · ingestion/fetch-highlights.js · ingestion/lib/youtube-api.js · ingestion/lib/env.js · app/js/components/highlights.js

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
- **Tier:** T3
- **Dependency:** Claude
- **Date:** 2026-04-19 (updated 2026-04-20 with comprehensive reference doc)
- **Category:** UI / PWA
- **Tags:** pwa, icons, ios, apple-touch-icon, deferred
- **Finding:** Phase 3A ships `app/icon.svg` (baseball on deep-navy). Works on modern browsers and Android Chrome (which reads SVG in manifest and even generates a WebAPK — a real installed Android app). iOS Safari historically ignores SVG for the home-screen icon and looks for a legacy `<link rel="apple-touch-icon" href="...png">` tag with a PNG at 180×180. Without PNGs, an iPhone user installing the site to their home screen sees a generic grey square or a low-res screenshot instead of the intended baseball graphic. **Functionally nothing breaks** — only icon polish on iOS is affected.

  **Implementation when picked up:**
  1. Generate PNGs from `app/icon.svg` at 180×180, 192×192, 512×512 (via online converter, a Node script using `sharp`, or a vector editor)
  2. Save as `app/icon-180.png`, `app/icon-192.png`, `app/icon-512.png`
  3. Add `<link rel="apple-touch-icon" href="icon-180.png">` to `app/index.html`
  4. Add PNG entries to `app/manifest.webmanifest` alongside the existing SVG entry
  5. Add the new PNG files to `SHELL_FILES` in `app/sw.js` and bump `CACHE` (per CLAUDE.md § Service Worker Cache rule)

  **Comprehensive background** — how PWAs differ from native apps, how iOS treats them differently than Android, what "install" actually means on each platform, and the full before/after impact of this work: see [docs/pwa-platform-reference.md](pwa-platform-reference.md).
- **Status:** Open (deferred — functional impact is zero, polish-only, only for iPhone home-screen installs)
- **Cross-ref:** app/icon.svg · app/manifest.webmanifest · docs/pwa-platform-reference.md

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

### KB-0025 | Daily morning email via Resend
- **Type:** Action
- **Tier:** T2
- **Dependency:** Owner (activation) / Claude (code shipped)
- **Date:** 2026-04-22
- **Source:** Chat session 2026-04-22 — owner prompt: *"my thinking is that every morning, after the daily ingestion, you would send him and me an email with the links so that he can just open the email and press the link for the latest. is that workable??"*
- **Category:** Features / Delivery / Ops
- **Tags:** email, resend, notifications, brother, pickleball-parallel

- **Four decisions that shaped the build (owner confirmed):**
  1. **Provider:** Resend.com (developer-API, 3,000 emails/month free tier).
  2. **Recipients:** Owner + brother initially; extensible via comma-separated `EMAIL_RECIPIENTS` GitHub Secret. Add/remove without code change.
  3. **Sender domain:** Start with Resend default (`onboarding@resend.dev`); custom domain (~$10/yr Cloudflare Registrar) path documented for later.
  4. **Format:** Rich HTML preview + CTA link — Cardinals/Nats pins, On This Day, stats footer, button to the site.

- **Delivered 2026-04-22 (commit `e60891f`):**
  - `ingestion/lib/email-template.js` — HTML + plain-text + subject builder from snapshot. Inline styles only (email-client compat), dark theme with Cardinals red/gold accents.
  - `ingestion/send-email.js` — Reads `data/snapshots/latest.json`, POSTs to `api.resend.com/emails`. Graceful skip (exit 0) if `RESEND_API_KEY` or `EMAIL_RECIPIENTS` missing — disabling is a secret-delete, no YAML edits. Supports `EMAIL_DRY_RUN=1` for local testing.
  - `.github/workflows/daily.yml` — New "Send morning email" step after snapshot commit. Reads `RESEND_API_KEY`, `EMAIL_RECIPIENTS`, `EMAIL_FROM` from GitHub Secrets.
  - `docs/email-setup.md` — Short Markdown setup walkthrough (5 steps + optional custom domain).
  - `docs/Daily-Email-Setup-Guide.docx` — **Comprehensive Word-doc reference** covering origin, decisions, architecture, baseball + pickleball setup, GitHub-vs-local distinction, recipient management (including the "two parallel lists" sync question), troubleshooting, costs, checklist. Generated by `scripts/build-email-doc.py` (re-runnable).

- **Architecture notes:**
  - GitHub Actions runs the entire email pipeline — no local dependency in production.
  - Local `.env` is ONLY for dev/testing; `EMAIL_DRY_RUN=1` prints preview without sending.
  - **Resend API key is shared across projects:** one Resend account + one `re_...` key pasted into both baseball and (future) pickleball repos' Secrets. GitHub Secrets are scoped per repo — they do not travel.
  - **Recipient lists are per-repo:** baseball and pickleball keep independent `EMAIL_RECIPIENTS` lists. For typical change frequency (1-3 edits/year), manual sync is acceptable; escalation options (shared gist, shared config repo, GitHub Org) documented in the Word doc §7.2.

- **Owner activation tasks (pending):**
  1. Sign up at https://resend.com/signup
  2. Create API key (sending access), copy `re_...` value
  3. Add GitHub Secrets `RESEND_API_KEY` + `EMAIL_RECIPIENTS` at https://github.com/jjmgladden/baseball-daily/settings/secrets/actions
  4. Trigger test: `gh workflow run daily.yml --repo jjmgladden/baseball-daily`
  5. *(Optional, future)* Register custom domain, add `EMAIL_FROM` secret.

- **Status:** Open (code shipped; awaiting owner Resend signup + Secrets config to activate)
- **Cross-ref:** docs/Daily-Email-Setup-Guide.docx · docs/email-setup.md · ingestion/send-email.js · ingestion/lib/email-template.js · .github/workflows/daily.yml · scripts/build-email-doc.py

### KB-0026 | Pickleball Daily Intelligence Report — sibling project bootstrapped
- **Type:** Reference
- **Date:** 2026-04-22
- **Source:** Chat session 2026-04-22 — Session 3 Option A executed
- **Category:** Sibling-projects / Cross-references
- **Tags:** pickleball, sibling-project, bootstrap, kickoff-prompt, ai-qa-future
- **Finding:** Owner confirmed and created sibling project folder at `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\`. Separate Claude Code project, separate folder, separate future git repo, separate CLAUDE.md. Bootstrap deliverables produced this session and placed in the new folder:
  - `CLAUDE.md` — 18-line bootstrap stub. Auto-loads when Claude Code opens the folder; redirects to the kickoff prompt. Will be replaced by the pickleball Phase 0 deliverable §8.4 (full pickleball CLAUDE.md v1).
  - `PICKLEBALL_Session1_KickoffPrompt.md` — 523-line comprehensive kickoff. Identity, working style, project concept, read-these-first paths to baseball + PBX reference files, Critical Rules verbatim from Baseball CLAUDE.md v12 (all 9), locked tech stack inheritance, cross-project sharing rules, Phase 0 research brief (compressed from owner's Perplexity draft — PPA / MLP / DUPR / USAP / video / influencer / feeder ecosystem coverage), five Phase 0 deliverables, phased roadmap (Phase 0 → 4), future AI Q&A schema implications, MODR conventions, 10 lessons learned from baseball, closing instructions, inherit-vs-decide quick-reference table.

  **Cross-project sharing rules locked in the kickoff:**
  - Resend account/key: **shared** (paste same `re_...` into pickleball's `RESEND_API_KEY` Secret)
  - YouTube API key: **shared** (same `AIza...`)
  - GitHub repo: **separate** (`jjmgladden/pickleball-daily` proposed)
  - Email recipient list: **separate per repo** (manual sync if owner wants identical)
  - PAT for Cloudflare Worker: **separate per repo** (minimum-scope posture)
  - KB, CLAUDE.md, sessions/, memory: **separate per project** (automatic — Claude Code memory is per-project)

  **Future feature noted for schema-design implications now (Phase 4 add-on, not initial build):**
  Natural-language Q&A layer (Claude API or similar) over the JSON corpus. The kickoff requires Phase 0 schemas to be designed AI-retrievable: stable IDs, ID-not-name cross-references, ISO 8601 timestamps with timezone, denormalized text fields for retrieval, structured source citations (`{sourceId, url, retrievedAt}`), T1/T2/T3 confidence as first-class fields, append-only snapshot history. Cheap now, expensive to retrofit.

  **Owner workflow after this session:** Open Claude Code in `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\`, submit `PICKLEBALL_Session1_KickoffPrompt.md` contents as the first message. Pickleball Session 1 begins there. Baseball stays unaffected.
- **Status:** Closed (baseball-side spawn complete; pickleball is now its own independent project)
- **Cross-ref:** `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\PICKLEBALL_Session1_KickoffPrompt.md` · `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\CLAUDE.md`

### KB-0024 | Curation pipeline: weekly-batch workflow + public submission Worker
- **Type:** Action
- **Date:** 2026-04-20
- **Category:** Features / Ops
- **Tags:** curation, weekly-batch, cloudflare-worker, submissions
- **Finding:** Two-input curation pipeline delivered. (1) **Weekly batch:** `.github/workflows/weekly-batch.yml` fires every Monday 08:00 UTC, slices the next 10 pending entries from `data/master/curation-backlog.json` (150-entry seed), and opens a labeled review Issue. Owner replies in chat with per-entry approve/reject/edit decisions; Claude moves approved entries into the appropriate main file on the next session. (2) **Public submissions:** A Cloudflare Worker (`worker/`) exposes a POST endpoint that accepts form submissions from the site's "Suggest a player or moment" footer link; Worker creates a labeled GitHub Issue. Rate-limited 3/IP/10min; honeypot field catches bots. Owner triages Issues in chat — add to backlog / add directly / reject. Worker deployment requires a fine-grained GitHub PAT scoped to Issues-write on this repo only; setup walkthrough in `worker/README.md`.
  
  **Status at time of close:**
  - Weekly batch workflow: committed, will fire next Monday (or via workflow_dispatch today).
  - Worker code: committed to `worker/`. **Owner still needs to deploy** per `worker/README.md` (first-time Cloudflare setup + PAT creation + `wrangler deploy`). After deploy, update `SUBMIT_URL` in `app/js/components/suggest.js`.
  - Until Worker is deployed, the Suggest modal opens but shows a "not yet configured" message on submit — graceful degradation.
- **Status:** Open (code ready; awaiting owner Worker deployment)
- **Cross-ref:** data/master/curation-backlog.json · .github/workflows/weekly-batch.yml · worker/ · app/js/components/suggest.js · docs/curation.md

### KB-0023 | Game recaps + curated deep-content + weekly index refresh
- **Type:** Action
- **Date:** 2026-04-20
- **Category:** Features
- **Tags:** recaps, curated-links, cardinals-legends, weekly-refresh
- **Finding:** Large feature batch delivered 2026-04-20 addressing user request for richer, dig-deep content:
  1. **Game recaps** — snapshot schemaVersion rolled 4 → 5. Cardinals and Nationals pinned games now include structured recap with scoring plays (narrative descriptions from play-by-play), linescore table (R/H/E per inning), W/L/Sv decisions, attendance, game duration, weather, venue. Additional scoreboard games classified as "notable" (one-run games, shutouts, blowouts, slugfests, pitchers' duels) get compact recaps in a new "Other Notable Games" section.
  2. **Cardinals legends deep-dive** — `data/master/cardinals-links.json` seeded with 15 entries (Musial, Gibson, Pujols, Molina, Brock, Smith, Dean, Hornsby, Slaughter, Schoendienst, Sutter, Simmons, Herzog, La Russa + a **featured Jim Bottomley** deep-dive added at owner's request — close friend of owner's grandfather Riley Gladden). Each entry links to BBref, SABR BioProject, Hall of Fame, MLB.com, Wikipedia, and YouTube search URLs.
  3. **History links + iconic moments** — `data/master/history-links.json` with curated external refs for 15 franchises (expanding). `data/master/historical-videos.json` with 10 iconic moments (Robinson debut, Mays Catch, Maris 61, Aaron 715, Fisk wave, Gibson walk-off, Ripken 2131, McGwire 62, Cubs 2016, Galarraga/Joyce).
  4. **Weekly player-index refresh** — `.github/workflows/weekly-index.yml` rebuilds `data/master/player-index.json` every Monday 08:00 UTC from Chadwick. Commits back only if changed.
  5. Players tab now shows `generatedAt` timestamp of the index.
- **Status:** Closed
- **Cross-ref:** ingestion/lib/recap.js · app/js/components/recap.js · data/master/cardinals-links.json · data/master/history-links.json · data/master/historical-videos.json · .github/workflows/weekly-index.yml

### KB-0022 | GitHub Actions Node 20 deprecation
- **Type:** Action
- **Tier:** T3
- **Dependency:** Claude
- **Date:** 2026-04-20
- **Source:** Observed in `daily.yml` workflow log 2026-04-20
- **Category:** CI / Maintenance
- **Tags:** github-actions, node, deprecation
- **Finding:** GitHub Actions emitted a warning that Node.js 20 will be removed from the runner on 2026-09-16. Two actions in `.github/workflows/daily.yml` (`actions/checkout@v4`, `actions/setup-node@v4`) will need to run on Node 24 by default after June 2, 2026. The fix is trivial — update `node-version` to `'22'` or later in the `setup-node` step, and bump checkout/setup-node minor versions if newer ones are out by then. No action needed today; the workflow continues to run fine.
- **Status:** Open (monitor; fix before September 2026)
- **Cross-ref:** .github/workflows/daily.yml

### KB-0021 | Auto-reload on service-worker update
- **Type:** Action
- **Tier:** T2
- **Dependency:** Claude
- **Date:** 2026-04-20
- **Source:** Chat 2026-04-20 — after repeated manual cache-clear incidents when the shell updated
- **Category:** UI / PWA / UX
- **Tags:** service-worker, auto-reload, pwa, ux
- **Finding:** Currently when the app shell updates, returning visitors must hard-refresh twice, open in incognito, or manually unregister the SW via DevTools to see the new version (workaround documented in `docs/deployment.md` § Seeing old content after an update). An auto-reload pattern in `app/js/app.js` can detect when a new SW takes control and reload the page once invisibly, eliminating the friction.

  **Implementation sketch (~15 lines in `app/js/app.js` registerServiceWorker):**
  ```js
  const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtLoad) return;  // first install — don't reload
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
  ```

  **Trade-offs:**
  - **Pros:** Zero manual cache-clear for returning users. Matches the behavior visitors expect from a modern web app.
  - **Cons:** More SW lifecycle code to maintain. Every deploy causes one extra page reload for anyone with the app open at that moment.
  - **One-time caveat:** On the deploy that introduces this logic, *existing* users still need a manual cache-clear once to pick up the new `app.js` containing the auto-reload handler. Every deploy after that is seamless.

  Decision deferred. Current manual workaround is documented and acceptable for owner-level use; may become more important if the site sees external traffic or frequent updates.
- **Status:** Open
- **Cross-ref:** CLAUDE.md § Service Worker Cache · docs/deployment.md § Seeing old content after an update

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

  Until then: daily cron handles freshness for all visitors (3 AM Eastern / 07:00 UTC); owner can manually trigger via GitHub Actions UI or `gh workflow run`.
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
- KB-0007 — PNG icon set for iOS — Action, **T3** (deferred, Phase 4)
- KB-0013 — On-This-Day seed expansion — Limitation (content-only, no work item)
- KB-0020 — Public on-demand refresh — Action, **T2** (near-term enhancement)
- KB-0021 — Auto-reload on service-worker update — Action, **T2** (near-term enhancement)
- KB-0022 — GitHub Actions Node 20 deprecation — Action, **T3** (low-priority maintenance)
- KB-0024 — Submission Worker — Action (code ready, awaiting owner deploy)

**Closed:**
KB-0001, KB-0002, KB-0003, KB-0004, KB-0006, KB-0008, KB-0009, KB-0010, KB-0011, KB-0012, KB-0014, KB-0015, KB-0016, KB-0017, KB-0018, KB-0019, KB-0023, KB-0026
