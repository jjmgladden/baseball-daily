# Baseball Daily Intelligence — Knowledge Base

Living record of decisions, open issues, and action items. Updated every session.

**Last updated:** 2026-05-02 (Session 6 — Phase B3 complete: KB-0030 added (process improvements: credentials.md + CLAUDE.md v13 + check-esm.js); B3 sub-task on KB-0028 marked done; CLAUDE.md rolled v12 → v13; SW cache rolled v14 → v15)

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

  **Session 4 (2026-05-01) — Closed.** Housekeeping closure. Phase 3B trigger fired in Session 1 — repo is public at https://github.com/jjmgladden/baseball-daily, GitHub Pages live at https://jjmgladden.github.io/baseball-daily/, daily cron firing successfully at 07:00 UTC every morning, weekly-index + weekly-batch crons firing on Mondays. KB stayed marked Open due to oversight at the Phase 3B closure session. Closing now as the work it described is long-since complete.
- **Status:** Closed (Session 4 — housekeeping; Phase 3B trigger fired Session 1)
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

- **Session 4 (2026-05-01) — Closed.** Path A activation complete end-to-end. Three GitHub Secrets pushed via `gh secret set` over stdin from local `Baseball Project/.env` (option β from owner walkthrough — owner pasted values once into local .env, Claude piped each to the GitHub API without echoing to chat):
  - `RESEND_API_KEY` — same `re_...` value already used by sibling pickleball project (Resend free-tier 3,000/mo ceiling shared across both projects)
  - `EMAIL_FROM = "Ozark Joe's Baseball Daily <baseball@glad-fam.com>"` — reuses the `glad-fam.com` Path B custom domain pickleball verified in their Session 6 (no DNS work needed; `daily@`, `baseball@`, and any other `@glad-fam.com` sender are pre-authorized)
  - `EMAIL_RECIPIENTS` — 1 address (owner-only smoke test). Expansion to 3 (owner + brother + brother's wife matching pickleball list) deferred to a follow-up; multi-recipient is unblocked from day one because Path B is in effect (no Path A free-tier 403 risk).
  
  First send via manual `workflow_dispatch` run `25228703199` succeeded in 18 seconds — `[send-email] Recipients: 1  From: ***`, `[send-email] Subject: ⚾ Cardinals win 10-5 vs Pittsburgh Pirates — Thursday, April 30, 2026`, `[send-email] Sent. Resend id: 328b5393-a842-4939-ab8d-27c49bd725e9`. Owner visually confirmed email arrived cleanly in Gmail inbox.
  
  Daily 07:00 UTC cron will now send a fresh briefing each morning. Email format is v1 — Cardinals pin + Nationals pin + On This Day (top 2) + CTA + small stats footer. v2 upgrade scoped as Phase B2 in the pickleball-parity plan (KB-0028) — adds scoring play in pin, Today's Schedule, highlight thumbnails, all-NL+AL standings, notable games, news section.
- **Status:** Closed (Session 4 — Path A 1-recipient activated; v2 email upgrade tracked under KB-0028 Phase B2)
- **Cross-ref:** docs/Daily-Email-Setup-Guide.docx · docs/email-setup.md · ingestion/send-email.js · ingestion/lib/email-template.js · .github/workflows/daily.yml · scripts/build-email-doc.py · KB-0028 (Phase B2 v2 upgrade) · workflow_dispatch run 25228703199 · Resend id 328b5393-a842-4939-ab8d-27c49bd725e9 · pickleball KB-0007 + KB-0033 + KB-0034 (Path A → Path B precedent)

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

  **Session 4 (2026-05-01) — Closed.** All 3 baseball workflows bumped: `actions/checkout@v4` → `@v6`, `actions/setup-node@v4` → `@v6` in `daily.yml` + `weekly-index.yml` + `weekly-batch.yml`. Bundled with Phase B1 hardening in commit `1fb2520`. Pickleball ran past v5 to v6 first (KB-0023 closure pattern); baseball matched. Tomorrow's 07:00 UTC scheduled cron run will be the first to execute on `@v6` actions; if green, no further action.
- **Status:** Closed (Session 4 — bumped to @v6/@v6; verification on next scheduled run)
- **Cross-ref:** .github/workflows/daily.yml · .github/workflows/weekly-index.yml · .github/workflows/weekly-batch.yml · commit `1fb2520` · KB-0027 · pickleball KB-0023

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

### KB-0027 | Push-race retry-with-rebase ported from pickleball KB-0027
- **Type:** Action
- **Date:** 2026-05-01 (Session 4)
- **Category:** Ops / CI / Hardening
- **Tags:** ci, github-actions, race-condition, hardening, snapshot-commit, pickleball-parity
- **Finding:** Direct port of pickleball KB-0027 fix to baseball's `daily.yml`. Snapshot push step wrapped in 3-attempt loop with `git pull --rebase -X theirs origin main` between retries. Defensive — protects against the same race condition pickleball hit (two cron-triggered runs starting close together both try to push, loser sees `[rejected] main -> main (fetch first)` and fails the workflow, sending the owner a "All jobs have failed" email despite ingestion being healthy).

  **Bundled with KB-0022 + KB-0025 in commit `1fb2520` (Phase B1 hardening).** Same commit also added:
  - Top-level `permissions: { contents: write }` block (was previously inline on the `ingest` job)
  - `concurrency: { group: daily-ingestion, cancel-in-progress: false }` block (queues overlapping runs instead of allowing the race in the first place — belt-and-suspenders with the retry loop)
  - `timeout-minutes: 15` on the `ingest` job

  Race itself is rare under cron-only operation; triggers when manual workflow_dispatch overlaps with the scheduled cron, or when two manual dispatches fire close together. Pickleball's incident was during a burst of manual verification runs.
- **Status:** Closed (proactive port — no in-the-wild incident in baseball; verified by passing first run on the new workflow shape via the Phase B1 activation cycle)
- **Cross-ref:** .github/workflows/daily.yml · commit `1fb2520` · pickleball KB-0027 (parent / source) · KB-0022 · KB-0025 · KB-0028

### KB-0028 | Pickleball-parity multi-phase plan (B1 ✓ · B2-B7 pending)
- **Type:** Decision
- **Tier:** T2
- **Dependency:** Owner (per-phase ATP) + Claude (implementation)
- **Date:** 2026-05-01 (Session 4)
- **Category:** Roadmap / Cross-project / Pickleball-parity
- **Tags:** pickleball-parity, phases, email, ai-qa, news, ui, roadmap
- **Source:** Session 4 chat 2026-05-01 — owner asked Claude to "bring the Baseball Project up to the same level as the Pickleball Project where it makes sense" after pickleball reached Session 9 with daily email + AI Q&A + News + Learn tab + custom domain all live. Detailed plan presented + 8 owner questions answered + ATP'd 7-phase sequencing.
- **Finding:** Multi-session plan to close the feature gap between baseball (Session 3 state) and pickleball (Session 9 state). Plan locked 2026-05-01 with 7 phases:

  | Phase | Scope | Effort | Status |
  |---|---|---|---|
  | **B1 — Activation** | Email Path A activation (KB-0025 close) · Actions @v6/@v6 bumps (KB-0022 close) · push-race retry-with-rebase port (KB-0027) | ~30 min owner + ~45 min Claude | **✓ DONE Session 4 (commit `1fb2520` + workflow run `25228703199`)** |
  | **B2 — Email upgrade** | `email-template.js` v1 → v2: Cards/Nats pins gain scoring play + W/L/Sv decisions · Today's Schedule (Cards+Nats + 3-5 league marquee games) · Top Highlights with thumbnails (mqdefault.jpg) · all-NL+AL standings (top 3 per division — 18 rows compact) · Notable Games one-liners · existing On This Day · footer | ~3-4 hr | **✓ DONE Session 5 (path β: schema bumped v5 → v6 to add `todaysSchedule[]`; KB-0029)** |
  | **B3 — Process improvements** | `docs/credentials.md` ported from pickleball · CLAUDE.md v12 → v13 (adds Session-End Step 2 credentials-update mandate + APP_VERSION pairing rule for SW cache bumps) · `scripts/check-esm.js` standalone runtime-import script + `npm run check:esm` · `app/js/app.js` `typeof document` guard so check:esm exits 0 (mirrors pickleball pattern) · SW cache v14 → v15 | ~2-3 hr | **✓ DONE Session 6 (KB-0030)** |
  | **B4 — UI polish** | APP_VERSION pill in app header (paired with SW CACHE constant) · iOS PNG icon set via `scripts/build-icons.js` + `sharp` (closes KB-0007) · `error-messages.js` component retrofit (severity-gated soft-banner from pickleball KB-0021 item 4) · `date-utils.js` audit + parseLocalDate/fmtDateShort port if any baseball date renders off-by-one | ~2-3 hr | Open |
  | **B5 — News tab** | Direct port of pickleball KB-0035: `ingestion/lib/rss-parser.js` (RSS 2.0 + Atom 1.0 auto-detection) · `ingestion/fetch-news.js` · 7 sources (T1+T2 mix): MLB.com + MLB Trade Rumors + ESPN MLB + Viva El Birdos + Cardinals.com + Federal Baseball + MASN · `app/js/components/news-card.js` + `confidence-badge.js` · `app/js/tabs/news.js` · Top News section appended to email v2 | ~3-4 hr | Open |
  | **B6 — AI Q&A** | Mirrors pickleball KB-0008 architecture: `ingestion/build-ai-context.js` produces `data/snapshots/ai-context.json` · new Cloudflare Worker `baseball-daily-api.jjmgladden.workers.dev` (revives KB-0024 with new purpose — submission route stays scaffolded behind kill switch, AI route becomes primary) · Anthropic Haiku 4.5 with prompt caching · cost guards (spend cap $5/mo, per-IP rate limit 10/hr + 50/day, env-var kill switch `AI_DISABLED`) · `app/js/tabs/ask.js` chat tab (would be 8th nav slot) · `data/master/ai-config.json` browser-side gate | ~6-8 hr | Open (largest phase) |
  | **B7 — TOC + accordion backport** | Copy `.tab-toc` / `.tab-section` / `.tab-callout` CSS from pickleball KB-0040 Phase L1 (~104 lines) into `app/styles/main.css` · Refactor `app/js/tabs/cardinals.js` (sections: Retired Numbers · HOFers · Historic Seasons · Traditions · Legends deep-dive) · Refactor `app/js/tabs/history.js` (sections: On This Day · Iconic Moments · Strangest Plays · Franchise Lineages) · Refactor B5's new `app/js/tabs/news.js` (today/this-week/recent buckets) · SW cache + APP_VERSION bump · Pre-push ESM check | ~3-4 hr | Open (depends on B5) |

  **Cumulative effort across B2-B7:** ~17-22 hr across 4-6 future sessions.

  **Owner-locked answers (Session 4):**
  1. Email sender domain: Path B `baseball@glad-fam.com` (reuse pickleball's verified domain) ✓ ACTIVATED B1
  2. Recipient list: same 3 as pickleball (deferred — currently 1, expand in B2 or sooner)
  3. Standings section in email v2: All NL + All AL (6 divisions × top-3 = 18 rows compact)
  4. Today's Schedule: Cards + Nats + 3-5 league-wide marquee games
  5. News tab sources: 7 sources (3 league-wide + 2 Cardinals-specific + 2 Nationals-specific)
  6. AI Q&A timing: Phase B6 of this build effort (NOT deferred indefinitely)
  7. CLAUDE.md v12 → v13: ATP'd for B3
  8. TOC + accordion backport: ATP'd as Phase B7

  **NOT applicable from pickleball to baseball (rationale captured for future reference):**
  - DUPR vs PPA Ratings/Rankings duality — no MLB equivalent
  - MLP team-centric vs PPA event-centric duality — single MLB season
  - Headless-browser scraping (Playwright) — MLB Stats API is clean JSON
  - WordPress REST API discovery — MLB-specific data sources differ
  - Glossary / Court Etiquette / DUPR Explainer / Tournament Prep / Equipment / Where-to-Play tab — pickleball-specific knowledge content
  - Cloudflare Tunnel → home Ollama (pickleball KB-0041) — future-design, applies equally to either project later
- **Status:** Open (B1 done; B2-B7 awaiting per-phase ATP)
- **Cross-ref:** sessions/BASEBALL_Handoff_Prompt_V4.md · sessions/BASEBALL_Kickoff_Prompt_Session5.md · KB-0007 · KB-0024 · KB-0025 · KB-0027 · pickleball KB-0008 · pickleball KB-0023 · pickleball KB-0027 · pickleball KB-0029 · pickleball KB-0035 · pickleball KB-0040

### KB-0029 | Email template v2 + snapshot schema v6 (Today's Schedule)
- **Type:** Action
- **Date:** 2026-05-02 (Session 5 — Phase B2)
- **Category:** Features / Email / Schema
- **Tags:** email, schema-bump, v6, todays-schedule, marquee, highlights, standings, notable-games, pickleball-parity
- **Source:** Session 5 chat 2026-05-02 — owner ATP'd Phase B2 (path β, full v2 with schema bump)
- **Finding:** Pickleball-parity Phase B2 executed end-to-end. Two coupled deliverables shipped together in one commit:

  **(1) Snapshot schema v5 → v6.** `ingestion/fetch-daily.js` rolled v5 → v6, adds two new top-level fields:
  - `todaysSchedule[]` — delivery-day (NOT yesterday) scheduled games via `mlb.getSchedule(todayISO, 'probablePitcher')`. Each entry: `gamePk`, `status`, `gameDate` (ISO + TZ), `home/away.{id, name, record, probablePitcher.{id, name}}`, `venue`, `gameType`, `dayNight`, `seriesDescription`. Probable pitchers may be null when MLB hasn't posted them yet.
  - `todaysScheduleDate` — the YYYY-MM-DD date the schedule fetch targeted (== `cache.todayISO()` at fetch time).

  Why coupled with the email-template change: the kickoff prescribed `snapshot.scoreboard filtered for today` for the email's "Today's Games" section, but `scoreboard` only ever held yesterday's games (per `cache.yesterdayISO()` used in fetch-daily). Owner chose path β (extend ingestion now) over path α (defer Today's Games to a follow-up).

  Helper added: `summarizeScheduledGame()` mirrors the existing `summarizeGame()` shape. `mlb.getSchedule()` extended to accept an optional `hydrate` query param (mlb-api.js stays at v3 since signature is backward-compatible with optional 2nd arg).

  **(2) Email template v1 → v2.** `ingestion/lib/email-template.js` rewritten with these section additions (v1 archived to `archive/email-template_v1.js` per whole-number versioning):
  - **Cardinals/Nationals pins** — now show W/L/Sv pitcher line (`recap.decisions.{winner, loser, save}`) + first scoring play (`recap.scoringPlays[0]`) with inning prefix
  - **Today's Games (NEW)** — Cards/Nats games always pinned at top with team-color tag chips; up to 3 marquee league games selected by signal priority: division-leader-vs-division-leader (+100) → both teams ≥ .550 winPct (+50) → classic rivalry (+30) → combined record tiebreaker. Caps at 5 total. Probable pitchers shown when available; ET game time formatted via `Intl.DateTimeFormat` with `America/New_York` timezone.
  - **Top Highlights (NEW)** — Cards + Nats highlights merged + deduped by videoId; up to 5; rendered as `<table>` rows with 120×68 `i.ytimg.com/vi/{id}/mqdefault.jpg` thumbnails + title + channel/date metadata. Click-outs to youtube.com (MLB channel still disables third-party embedding per pickleball KB-0013 baseball-side note).
  - **Division Standings (NEW)** — All 6 divisions, top 3 per division (18 rows). Cards highlighted in NL Central with red left-border; Nats highlighted in NL East with red left-border. Display order: AL East/Central/West, then NL East/Central/West.
  - **Notable Games (NEW)** — One-liners from `snapshot.notableGames` (cap 5). Symbol icons per `notableReasons` type (◐ one-run, ○ shutout, ★ blowout, ⚡ slugfest, ◇ pitchers' duel, ↻ extra innings, ✦ walk-off).
  - On This Day, CTA, stats footer — preserved verbatim from v1.

  **Bonus accuracy fix (carried inadvertently from v1 but corrected here):** `oneLineGameResult()` now requires `status` to match `/^Final/i` before declaring a Won/Lost result. In-progress games render as "In Progress vs Opponent (current: 3-1)" in dim-text style instead of misleadingly claiming a win. Real cron-time impact = zero (3 AM EDT cron always runs after games are Final), but local dry-runs and any rare delayed-game scenarios now render accurately. Aligns with CLAUDE.md "Be Accurate" rule.

  **Files:**
  ```
  M  ingestion/fetch-daily.js          (v5 → v6; +todaysSchedule fetch + summarizeScheduledGame helper)
  M  ingestion/lib/mlb-api.js          (getSchedule gains optional hydrate param)
  M  ingestion/lib/email-template.js   (v1 → v2; full rewrite, ~570 lines)
  M  ingestion/send-email.js           (header comment v1 → v2; signature unchanged)
  A  archive/email-template_v1.js      (v1 archive per whole-number versioning rule)
  M  README.md                         (added "Daily morning email" + "Snapshot schema" sections)
  M  docs/knowledge-base.md            (this entry; Quick Index updated)
  ```

  **Triggers per CLAUDE.md Critical Rules:**
  - SW cache rule: NOT triggered (no `app/` changes).
  - Pre-push ESM check: NOT triggered (CommonJS, not ESM).
  - Whole-number version bump: applied (v1 → archive).

  **Verification:** Local dry-run via `EMAIL_DRY_RUN=1 node ingestion/send-email.js` rendered cleanly: 5 Today's Games (Cards-Dodgers, Nats-Brewers, 3 marquee), 5 highlights with thumbnails, all 6 divisions × 3 rows of standings (Cards 3rd in NL Central with red highlight, Nats 3rd in NL East with red highlight), 1 notable game, 2 On This Day. HTML size 27,322 bytes (vs 4,282 in v1 — ~6.4× larger as expected for the richer content). End-to-end Resend send pending workflow_dispatch verification.

  **Closes:** Phase B2 sub-task of KB-0028. Six phases remain on the pickleball-parity roadmap (B3-B7).
- **Status:** Closed (B2 complete; B2 sub-task of KB-0028 marked done)
- **Cross-ref:** ingestion/fetch-daily.js · ingestion/lib/email-template.js · archive/email-template_v1.js · KB-0025 (parent email feature) · KB-0028 (pickleball-parity roadmap) · KB-0023 (snapshot v5 baseline) · pickleball KB-0007 (email template v2 source pattern)

### KB-0030 | Phase B3 — process improvements (credentials.md + CLAUDE.md v13 + check-esm.js)
- **Type:** Action
- **Date:** 2026-05-02 (Session 6 — Phase B3)
- **Category:** Process / Conventions / Pickleball-parity
- **Tags:** credentials, claude-md, check-esm, app-version, pickleball-parity, process
- **Source:** Session 6 chat 2026-05-02 — Claude recommended Option A (B3) as the natural next step after B2; owner ATP'd ("you are doing the work")
- **Finding:** Pickleball-parity Phase B3 executed end-to-end. Three primary deliverables + two secondary fixes shipped in one commit:

  **(1) `docs/credentials.md` (NEW, ~280 lines)** — port adapted from pickleball's `docs/credentials.md` (v3). Inventory of all credentials baseball uses: 4 active (`YOUTUBE_API_KEY`, `RESEND_API_KEY`, `EMAIL_RECIPIENTS`, `EMAIL_FROM`) + 1 owned domain (`glad-fam.com`, shared with pickleball) + accounts (Resend, Google Cloud, GitHub, Cloudflare, Anthropic). Documents storage locations, sharing posture with sibling pickleball project, add/rotate/lost-key checklists, per-credential detail sections (including pre-creation entries for the future `ANTHROPIC_API_KEY` for Phase B6 and `GITHUB_TOKEN` for KB-0024 Worker submission route). Sibling-project sharing posture section is the canonical record of what's shared (YouTube key, Resend key, glad-fam.com domain, Cloudflare account, Anthropic account) and what's separate per project (recipient lists, future Worker PATs, future API key VALUES).

  **(2) CLAUDE.md v12 → v13** — two adds:
  - **New Critical Rule: APP_VERSION pairing.** When bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/index.html` header pill in the same commit. Keeps cache version and visible version in lockstep so a returning user can confirm at-a-glance that their PWA reloaded onto the new shell. Pill itself is added in Phase B4 — until then, rule applies forward-only with a documented "B4 forward-debt" escape clause.
  - **Session-End Protocol new Step 2.** Mandates updating `docs/credentials.md` whenever credentials change (add, rotate, revoke, move between storage locations, or status flip). Subsequent steps renumbered 3–8.
  - v12 archived to `archive/CLAUDE_v12.md` per whole-number versioning rule.

  **(3) `scripts/check-esm.js` (NEW, ~46 lines) + `npm run check:esm` script.** Direct port of pickleball's `scripts/check-esm.js`. Walks `app/js/**/*.js` and runtime-imports each file via dynamic `import(pathToFileURL(...))`, catching ESM-specific errors that `node --check` misses (template-literal escapes, bad imports, etc.). Exits 0 if all 18 modules import clean; 1 on any failure. Standalone — does NOT live in `app/`, so the SW cache rule is not triggered by changes to it.

  **Secondary fixes required to make check-esm exit 0 (revealed by first-run validation):**

  **(4) `app/js/app.js` — `typeof document` guard.** Original code called `main();` synchronously at module load. `main()` is `async` and references `window.matchMedia` via `showSplash() → splash.js`. When Node imports the file, `main()` runs, hits `window`, throws `ReferenceError`, and the rejection is caught after the import promise resolves — exit code 1 even though all 18 files appeared to import cleanly. Fix: changed bottom of file from `main();` to `if (typeof document !== 'undefined') main();`. Mirrors pickleball's pattern (`if (typeof document !== 'undefined') boot();`). Zero impact in browser (where `document` always exists). Without this fix, check-esm.js would always exit 1, defeating its purpose as a pre-push gate.

  **(5) `app/sw.js` — CACHE rolled v14 → v15.** Required by the SW cache bump rule because (4) modified `app/js/app.js`. APP_VERSION pairing not yet applicable (visible pill is added in Phase B4); B4 forward-debt flagged in commit message per the new rule's escape clause.

  **Files:**
  ```
  A  docs/credentials.md           (NEW; ~280 lines)
  M  CLAUDE.md                     (v12 → v13; +2 sections)
  A  archive/CLAUDE_v12.md         (v12 archive)
  A  scripts/check-esm.js          (NEW; ~46 lines)
  M  package.json                  (added "check:esm" script)
  M  app/js/app.js                 (typeof document guard at bottom)
  M  app/sw.js                     (CACHE v14 → v15)
  M  docs/knowledge-base.md        (this entry; KB-0028 B3 sub-task done; Last-updated bumped)
  ```

  **Triggers per CLAUDE.md Critical Rules:**
  - SW cache rule: **TRIGGERED** by `app/js/app.js` change → CACHE bumped v14 → v15. Documented above.
  - APP_VERSION pairing rule (NEW v13 rule): forward-debt for B4 (visible pill not yet present in HTML).
  - Pre-push ESM check: TRIGGERED → re-ran `npm run check:esm` after the app.js guard added; exit 0 with all 18 modules importing clean.
  - Whole-number version bump: applied (CLAUDE.md v12 → archive; SW cache v14 → v15).
  - Session-End Step 2 (credentials.md): triggered by the doc's own creation; this entry serves as the maintenance-log entry for Session 6.

  **Verification:** `npm run check:esm` from baseline (no fix) reported 18 OK + caught a runtime `ReferenceError: window is not defined` and exited 1. After the `typeof document` guard, same command exits 0 with 18 OK and no trailing error. Side-by-side parity check against pickleball's check:esm output confirmed identical exit posture.

  **Closes:** Phase B3 sub-task of KB-0028. Four phases remain on the pickleball-parity roadmap (B4-B7).

  **Note on `docs/concepts-primer.md` cross-link (kickoff suggestion):** The kickoff Optional sub-step suggested cross-linking to pickleball's `docs/concepts-primer.md`. That file does not exist in pickleball (only KB references). Skipped — no useful cross-link to make. Future shared-concepts doc could be created if the patterns warrant, but not B3's job.
- **Status:** Closed (B3 complete; B3 sub-task of KB-0028 marked done)
- **Cross-ref:** docs/credentials.md · CLAUDE.md (v13) · archive/CLAUDE_v12.md · scripts/check-esm.js · package.json · app/js/app.js · app/sw.js · KB-0028 (pickleball-parity roadmap) · pickleball KB-0029 (credentials.md source pattern) · pickleball KB-0021 (check-esm.js source pattern)

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
- KB-0007 — PNG icon set for iOS — Action, **T3** (will close in Phase B4 per KB-0028)
- KB-0013 — On-This-Day seed expansion — Limitation (content-only, no work item)
- KB-0020 — Public on-demand refresh — Action, **T2** (Cloudflare Worker proxy; partially overlaps B6 Worker setup)
- KB-0021 — Auto-reload on service-worker update — Action, **T2** (could fold into B4)
- KB-0024 — Submission Worker — Action (code ready, will revive in Phase B6 for AI proxy use case)
- KB-0028 — Pickleball-parity multi-phase plan (B2-B7) — Decision, **T2** (active roadmap)

**Closed:**
KB-0001, KB-0002, KB-0003, KB-0004, KB-0005, KB-0006, KB-0008, KB-0009, KB-0010, KB-0011, KB-0012, KB-0014, KB-0015, KB-0016, KB-0017, KB-0018, KB-0019, KB-0022, KB-0023, KB-0025, KB-0026, KB-0027, KB-0029, KB-0030
