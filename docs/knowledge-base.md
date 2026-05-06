# Baseball Daily Intelligence — Knowledge Base

Living record of decisions, open issues, and action items. Updated every session.

**Last updated:** 2026-05-06 (Session 10 — **omnibus session, 7 tracks shipped**: (1) `wrangler deploy` cleanup dropped `/aitest`; (2) **Phase B7** TOC + accordion ported from pickleball L1 across Cardinals / History / News tabs — KB-0028 closes entirely; (3) **Issue #5 applied** — 10 approved curation entries (Marvin Miller + 9 player legends) appended to `legends-general.json` (20 → 30); (4) **KB-0021 closed** — auto-reload-on-SW-update implemented in `app.js` (controllerchange listener, gated by wasControlled); (5) email template **v3 → v4** — "Open the full report" CTA + brief stats summary moved from bottom to top per owner feedback; (6) **trivia tab redesign** — Today's 5 (deterministic-by-date, first card matches Daily Report) + 🎲 Different 5 reshuffle (sessionStorage-seeded) + filters bypass to mine full pool; (7) **trivia in weekly-batch flow** — `weekly-batch.yml` routing comment includes trivia.json; 20 verified trivia stubs seeded into `curation-backlog.json` (121 → 141 pending) for the next 2 Monday batches; (8) **KB-0020 closes-pending-PAT** — public on-demand refresh: `/refresh` route added to deployed Worker (rate-limited 1/10min/IP) + "Refresh now" link in footer + new `app/js/components/refresh.js` + dual-route `GITHUB_TOKEN` (Issues:write + Actions:write); (9) **Mobile-stale-snapshot bug fixed** — baseball SW was cache-first for ALL GETs including `/data/snapshots/latest.json`, mirroring pickleball's split-handler pattern (network-first for `/data/`, cache-first for shell) closes a long-standing user-facing bug; SW + APP_VERSION rolled v18 → v22 across the four shell-changing commits this session; new KB-0034 added; `docs/credentials.md` v2 → v3)

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

### KB-0007 | PWA icons — SVG + PNG set delivered
- **Type:** Action
- **Date:** 2026-04-19 (updated 2026-04-20 with comprehensive reference doc; closed 2026-05-02 Session 7)
- **Category:** UI / PWA
- **Tags:** pwa, icons, ios, apple-touch-icon
- **Finding:** Phase 3A shipped `app/icon.svg` (baseball on deep-navy). Phase B4 (Session 7) added the iOS PNG set via `scripts/build-icons.js` + `sharp` (devDep). Six PNGs generated from the single SVG source: `apple-touch-icon-180x180.png` / `167x167.png` / `152x152.png` / `120x120.png` (iOS home-screen variants) plus `icon-192.png` / `icon-512.png` (PWA manifest standard sizes). Output written to `app/icons/`. iPhone home-screen installs now show the proper baseball graphic instead of a generic grey square. `<link rel="apple-touch-icon" sizes="...">` tags added to `app/index.html` for all 4 iOS variants; `app/manifest.webmanifest` extended with PNG entries alongside the existing SVG. All 6 PNGs added to `SHELL_FILES` in `app/sw.js`; CACHE rolled v15 → v16; APP_VERSION pill introduced in same commit (paired per CLAUDE.md v13 rule). `npm run build:icons` re-runnable when icon.svg changes.

  Comprehensive background: see [docs/pwa-platform-reference.md](pwa-platform-reference.md).
- **Status:** Closed (Session 7 — Phase B4)
- **Cross-ref:** app/icon.svg · app/icons/ · app/manifest.webmanifest · scripts/build-icons.js · docs/pwa-platform-reference.md · KB-0031 · KB-0028

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
- **Date:** 2026-04-19 (last updated Session 10 — closing path identified)
- **Finding:** Seed covers ~50 landmark events. Expansion via adding entries — no schema change. Most calendar dates currently render the History tab's "On This Day" section as "No curated events for today's date yet."

  **Closing path (identified Session 10, deferred):** treat the same way trivia was treated this session — add `type: 'on-this-day'` to the curation-backlog flow + the weekly-batch routing instruction in `weekly-batch.yml`. Seed 30-50 stubs with `{date, year, title, description, source}`. The Monday cron surfaces 10/week for owner approval; apply step appends approved entries to `data/master/on-this-day-seed.json`. Closes once coverage feels right (subjective — owner declares done).
- **Status:** Open (content expansion + trivia-style backlog flow not yet wired for `type: 'on-this-day'`)
- **Cross-ref:** data/master/on-this-day-seed.json · KB-0034 § Track 5 (trivia stub seed pattern is the template)

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
  **Session 7 close (2026-05-02) — 3-recipient scheduled-cron verification CLEARED.** Owner confirmed all 3 inboxes received the v2 scheduled-cron morning email. This closes the triple-deferral from Sessions 5+6+7 (recipient expansion to 3 happened 2026-05-02T02:51:45Z, but no scheduled cron had fired between then and Sessions 5/6/7 close). The email pipeline is now fully validated end-to-end at the 3-recipient configuration.
- **Status:** Closed (Session 4 — Path A 1-recipient activated; v2 email upgrade in KB-0029; 3-recipient scheduled cron verified Session 7)
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

  **Session 9 (2026-05-03 — Phase B6) — Worker rewritten with AI route as primary purpose.** The original `baseball-daily-submit` Worker has been replaced by `baseball-daily-api` (renamed, dual-route). The `/submit` code has been preserved verbatim inside the new Worker but is no longer the primary purpose; `/ai` is. Once the owner runs `wrangler deploy` for Phase B6 (KB-0033), BOTH routes deploy simultaneously — the AI route is what drives the deploy, but the submission route comes along free. KB-0024's owner-side blocker (deployment) remains; the only thing left to wire AFTER Phase B6 deploys is updating `SUBMIT_URL` in `app/js/components/suggest.js` to point at the new Worker URL + (optionally) creating the fine-grained GitHub PAT for `/submit`. The Suggest modal's "not yet configured" graceful-degradation behavior is unchanged.
- **Status:** Open (code ready; superseded by KB-0033 Worker; awaiting owner Worker deployment which will activate both /ai and /submit simultaneously)
- **Cross-ref:** data/master/curation-backlog.json · .github/workflows/weekly-batch.yml · worker/ · app/js/components/suggest.js · docs/curation.md · KB-0033 (Worker rewritten)

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
- **Type:** Action → Closed
- **Date:** 2026-04-20 (closed Session 10 — 2026-05-06)
- **Category:** UI / PWA / UX
- **Tags:** service-worker, auto-reload, pwa, ux
- **Finding:** Implemented in Session 10 in [`app/js/app.js`](../app/js/app.js) `registerServiceWorker()`. Pattern matches the original sketch: read `wasControlled = !!navigator.serviceWorker.controller` at registration time, attach a `controllerchange` listener guarded by a `refreshing` one-shot flag plus `wasControlled` so first-time installs don't trigger a reload. Subsequent shell-cache bumps now auto-reload the page once when the new SW activates.

  **One-time caveat realized as predicted:** the *deploy that introduced the handler* (Session 10 SW v20 → v21 commit) won't trigger auto-reload for visitors still running the older v17–v20 shell — they need one manual refresh to pick up the new `app.js` containing the handler. Every deploy after that is seamless.

  **Synergy with KB-0034 mobile-stale-snapshot fix:** when the next SW bump deploys, returning mobile visitors auto-reload onto the new SW which has the network-first data fetch, fixing the "yesterday's date" mobile bug for the same visit.
- **Status:** Closed
- **Cross-ref:** CLAUDE.md § Service Worker Cache · `app/js/app.js:registerServiceWorker` · KB-0034 § Track 7 (mobile-stale-snapshot fix relies on this auto-reload to deliver the new SW)

### KB-0020 | Public on-demand refresh — anyone can trigger ingestion
- **Type:** Action
- **Tier:** T2
- **Dependency:** Owner (PAT creation only — code closed)
- **Date:** 2026-04-20 (code closed Session 10 — 2026-05-06; full close pending owner PAT)
- **Category:** Features / Deployment
- **Tags:** refresh, pwa, github-actions, public-trigger, cloudflare, kb-0020-shipped
- **Finding:** **Code complete + deployed Session 10.** `/refresh` route added to `baseball-daily-api` Worker as the third route alongside `/ai` and `/submit`. Route holds the PAT server-side (Cloudflare Worker secret `GITHUB_TOKEN`), calls `POST /repos/jjmgladden/baseball-daily/actions/workflows/daily.yml/dispatches` on click, returns 202 + run-list URL + `etaSeconds: 45`. Browser-side: footer link "Refresh now" + a status span (`#refresh-status`) wired via new component [`app/js/components/refresh.js`](../app/js/components/refresh.js); reads `workerBaseUrl` from `data/master/ai-config.json` (the same file the Ask tab uses); on success, sets a 53-second timer to `window.location.reload()` so the visitor lands on the freshly-ingested snapshot.

  **Anti-abuse posture:**
  - Per-isolate rate limit: 1 dispatch per IP per 10 min (`refreshLimit` Map in [`worker/src/index.js`](../worker/src/index.js))
  - GitHub itself enforces queueing via `concurrency: { group: daily-ingestion }` in `daily.yml` — overlapping dispatches queue rather than race
  - PAT is fine-grained, scoped to ONE repo, with `actions:write` + `issues:write` (the latter for the dual-use with `/submit`)
  - CORS locked to `https://jjmgladden.github.io` + `http://localhost:1882`

  **Owner action remaining (~5 min) to fully close:**
  1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → **Generate new token**.
  2. Name: `baseball-daily-worker-refresh-and-submit`. Expiration: 1 year. Repository access: only `jjmgladden/baseball-daily`.
  3. Permissions: **Actions: Read and write** + **Issues: Read and write** (Metadata: Read auto-required).
  4. Copy `github_pat_...`.
  5. **Cloudflare dashboard** (NOT `wrangler secret put` per XPL-001) → Workers & Pages → `baseball-daily-api` → Settings → Variables and Secrets → Add → Type: Secret → Name: `GITHUB_TOKEN` → paste → Save.
  6. Verify: `curl https://baseball-daily-api.jjmgladden.workers.dev/health` shows `"refreshEnabled":true`.
  7. Click "Refresh now" in the site footer → should show `refreshing… new data in ~45s. Reloading shortly.` → page reloads in ~53s on fresh snapshot.

  Until then: clicking "Refresh now" returns 500 with the message `Refresh is not configured (server missing GITHUB_TOKEN or GITHUB_REPO).` rendered inline in the footer status span. Daily cron continues to run at 07:00 UTC unchanged.
- **Status:** Closed-pending-owner-PAT (code shipped + deployed; same status pattern as KB-0033 was at end of Session 8)
- **Cross-ref:** CLAUDE.md § Secret Safety · `.github/workflows/daily.yml` · `worker/src/index.js:handleRefresh` · `app/js/components/refresh.js` · KB-0024 (shares the GITHUB_TOKEN PAT) · KB-0033 (Worker architecture parent)

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
  | **B4 — UI polish** | APP_VERSION pill in app header (paired with SW CACHE constant; pill text = `v16`, sunsets the v13 "B4 forward-debt" escape clause) · iOS PNG icon set via `scripts/build-icons.js` + `sharp` (closes KB-0007; 4 apple-touch-icon variants + 2 manifest PNGs) · `error-messages.js` component (severity-gated soft-banner ported from pickleball) + soft-banner/freshness-tag CSS · daily-tab snapshot-load failure + players-tab index-missing failure now use soft-banner · `date-utils.js` audit found no off-by-one risk in baseball, port skipped · SW cache v15 → v16 | ~2-3 hr | **✓ DONE Session 7 (KB-0031)** |
  | **B5 — News tab** | Direct port of pickleball KB-0035: `ingestion/lib/rss-parser.js` (RSS 2.0 + Atom 1.0 auto-detection) · `ingestion/fetch-news.js` · 7 sources (T1+T2 mix): MLB.com + MLB Trade Rumors + ESPN MLB + Viva El Birdos + Cardinals.com + Federal Baseball + MASN · `app/js/components/news-card.js` + `confidence-badge.js` · `app/js/tabs/news.js` · Top News section appended to email v2 | ~3-4 hr | **✓ DONE Session 8 (KB-0032; 6 of 7 sources active; MASN documented as disabled placeholder pending RSS endpoint)** |
  | **B6 — AI Q&A** | Mirrors pickleball KB-0008 architecture: `ingestion/build-ai-context.js` produces `data/snapshots/ai-context.json` · new Cloudflare Worker `baseball-daily-api.jjmgladden.workers.dev` (revives KB-0024 with new purpose — submission route stays scaffolded behind kill switch, AI route becomes primary) · Anthropic Haiku 4.5 with prompt caching · cost guards (spend cap $5/mo, per-IP rate limit 10/hr + 50/day, env-var kill switch `AI_DISABLED`) · `app/js/tabs/ask.js` chat tab (9th nav slot) · `data/master/ai-config.json` browser-side gate | ~6-8 hr | **✓ CODE-SHIPPED Session 9 (KB-0033). Awaiting owner-side ANTHROPIC_API_KEY creation + `wrangler deploy` + ai-config.json `workerBaseUrl` paste to flip Ask tab from soft-banner to live.** |
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
  **Sub-task ledger (closed Session 10 — 2026-05-06):**
  - B1 (push-race retry-with-rebase) — done Session 4, KB-0027
  - B2 (email v2 + snapshot v6 Today's Schedule) — done Session 5, KB-0029
  - B3 (process — credentials.md + CLAUDE.md v13 + check-esm.js) — done Session 6, KB-0030
  - B4 (PWA icons PNG set + APP_VERSION pill) — done Session 7, KB-0031
  - B5 (News tab + RSS + email v3 Top News) — done Session 8, KB-0032
  - B6 (AI Q&A — build-ai-context + Worker + Ask tab) — done Session 9, KB-0033
  - **B7 (TOC + accordion backport from pickleball L1) — done Session 10, KB-0034 § Track 2**
- **Status:** Closed (entire pickleball-parity roadmap complete — every applicable pickleball pattern is now in baseball)
- **Cross-ref:** sessions/BASEBALL_Handoff_Prompt_V4.md · sessions/BASEBALL_Kickoff_Prompt_Session5.md · KB-0007 · KB-0024 · KB-0025 · KB-0027 · KB-0029 · KB-0030 · KB-0031 · KB-0032 · KB-0033 · KB-0034 · pickleball KB-0008 · pickleball KB-0023 · pickleball KB-0027 · pickleball KB-0029 · pickleball KB-0035 · pickleball KB-0040

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

### KB-0031 | Phase B4 — UI polish (APP_VERSION pill + iOS PNGs + error-messages)
- **Type:** Action
- **Date:** 2026-05-02 (Session 7 — Phase B4)
- **Category:** UI / PWA / Pickleball-parity
- **Tags:** app-version, ios-icons, apple-touch-icon, sharp, error-messages, soft-banner, pickleball-parity
- **Source:** Session 7 chat 2026-05-02 — owner ATP'd Phase B4 from the Session 7 kickoff; Claude executed three of four sub-deliverables (date-utils audit determined the port was unnecessary)
- **Finding:** Pickleball-parity Phase B4 executed end-to-end. Three primary deliverables shipped + one audit-only deliverable resolved by skip:

  **(1) iOS PNG icon set + `scripts/build-icons.js` + `npm run build:icons`.** Direct port of pickleball's `scripts/build-icons.js` (background color adjusted from pickleball's `#0e1420` to baseball's `#0e1821`). Adds `sharp ^0.33.5` as a devDep. Generates 6 PNGs from `app/icon.svg`:
  - `apple-touch-icon-180x180.png` (5,663 bytes) — primary iOS touch icon
  - `apple-touch-icon-167x167.png` (5,374 bytes) — iPad Pro
  - `apple-touch-icon-152x152.png` (4,634 bytes) — iPad
  - `apple-touch-icon-120x120.png` (3,304 bytes) — iPhone non-Retina
  - `icon-192.png` (6,228 bytes) — PWA manifest standard
  - `icon-512.png` (20,469 bytes) — PWA manifest standard

  Output written to `app/icons/`. `app/index.html` gains 4 `<link rel="apple-touch-icon" sizes="...">` tags (one per iOS variant). `app/manifest.webmanifest` extended: original SVG entry preserved as `purpose: "any maskable"`, two PNG entries added with `purpose: "any"` (192 + 512). All 6 PNGs added to `SHELL_FILES` in `app/sw.js` so the PWA caches them offline. `npm run build:icons` is re-runnable when icon.svg changes (script overwrites in place). **Closes KB-0007** (T3 → Closed).

  **(2) APP_VERSION pill in app header (sunsets the v13 "B4 forward-debt" escape clause).** Adds `<span id="app-version" class="app-version">` to the header `.brand` div in `app/index.html`. `app/js/app.js` declares `const APP_VERSION = 'v16'` at the top with a comment documenting the SW cache pairing rule. Pill is populated in `main()` after splash + bindTabs + SW register (early enough to render before snapshot load). CSS in `app/styles/main.css`: `.app-version` rule — small uppercase muted-text pill with thin border, `0.7rem` font-size, tabular-nums, `text-transform: uppercase` (so the constant's `'v16'` displays as `V16`).

  Pairing posture going forward: Session 7 establishes the pattern. Every future shell change must roll BOTH `CACHE` in `app/sw.js` AND `APP_VERSION` in `app/js/app.js` in the same commit. The "B4 forward-debt" escape clause in CLAUDE.md v13 is now sunset — no longer applicable.

  **(3) `app/js/components/error-messages.js` + soft-banner CSS.** Direct port of pickleball's `app/js/components/error-messages.js` with baseball-specific code adjustments:
  - `MESSAGES` table adapted for baseball context (no `playwright-not-installed` since baseball doesn't scrape; added `snapshot-missing` / `snapshot-stale` / `index-missing` for baseball-specific failure modes)
  - `DEV_ONLY_CODES` set: keeps `seed-missing` + `no-youtube-key`; drops `no-handle-available` (pickleball-specific)
  - `friendlyErrorMessage()` + `errorBannerHtml()` + `freshnessTagHtml()` exports preserved; signatures identical

  CSS additions to `app/styles/main.css`: `.soft-banner` (calm card-style notice with accent-info left-border) + `.freshness-tag` (small muted "as of {timestamp}" tag for stale-data fallbacks). Adapted to baseball's CSS-variable names (`--bg-secondary`, `--accent-info`, etc.) — pickleball used `--bg-2` / `--accent`.

  Retrofit applied to two failure paths (severity-gated — only user-impacting failures show a banner):
  - `app/js/app.js` → `renderNoSnapshot()` now accepts an optional error parameter; renders `errorBannerHtml('fetch-failed', { source: 'Daily snapshot' })` on load failure or `errorBannerHtml('snapshot-missing')` on first-run.
  - `app/js/tabs/players.js` → catch-block on `loadPlayerIndex()` failure now renders `errorBannerHtml('index-missing')` and removes the raw `Error: ...` line (was leaking dev-error text to users).

  Other tabs not retrofitted this phase — they don't have hard-fail paths. Future tabs (B5 News tab) will use the helpers from day one.

  **(4) `date-utils.js` audit — port determined unnecessary, skipped.** Grepped baseball's `app/js/` for `new Date(` and `toLocaleDateString` patterns. Findings:
  - All `new Date()` calls take full ISO timestamps (e.g. `state.snapshot.generatedAt = "2026-05-02T01:06:00.625Z"`) — these include time + Z and are timezone-safe.
  - `players.js:33` uses `new Date(index.generatedAt).toLocaleDateString()` — also full ISO, safe.
  - `daily.js:32` renders `snap.date` (`"2026-05-01"`) as plain text via `escapeHtml()` — never re-parsed through `Date()`, so no off-by-one.
  - Other dates: trivia day-of-year math uses `new Date()` (no args, current time) and `new Date(year, 0, 0)` (numeric constructor) — both safe.

  Conclusion: baseball has zero off-by-one risk from the pickleball KB-0016 pattern (which was: `new Date("YYYY-MM-DD")` parses as UTC midnight and renders as previous day in negative-offset timezones). Skipping the port avoids dead code per the "don't add features beyond what the task requires" rule.

  **Files:**
  ```
  A  scripts/build-icons.js               (NEW; ~50 lines)
  A  app/icons/apple-touch-icon-180x180.png (NEW; 5,663 B)
  A  app/icons/apple-touch-icon-167x167.png (NEW; 5,374 B)
  A  app/icons/apple-touch-icon-152x152.png (NEW; 4,634 B)
  A  app/icons/apple-touch-icon-120x120.png (NEW; 3,304 B)
  A  app/icons/icon-192.png                  (NEW; 6,228 B)
  A  app/icons/icon-512.png                  (NEW; 20,469 B)
  M  app/index.html                       (+APP_VERSION pill, +4 apple-touch-icon link tags)
  M  app/manifest.webmanifest             (+2 PNG icon entries)
  M  app/sw.js                            (CACHE v15 → v16; +6 PNGs +error-messages.js in SHELL_FILES; pairing comment added)
  M  app/styles/main.css                  (+.app-version, +.soft-banner, +.freshness-tag)
  A  app/js/components/error-messages.js  (NEW; ~62 lines)
  M  app/js/app.js                        (+APP_VERSION constant, +pill wiring, +error-messages import, +renderNoSnapshot error param)
  M  app/js/tabs/players.js               (+error-messages import, index-missing soft-banner)
  M  package.json                         (+sharp devDep ^0.33.5, +"build:icons" script)
  A  .claude/launch.json                  (NEW; preview-server config for Claude Preview MCP — port 1882)
  M  docs/knowledge-base.md               (this entry; KB-0007 closed; KB-0028 B4 sub-task done; Last-updated bumped)
  ```

  **Triggers per CLAUDE.md Critical Rules:**
  - SW cache rule: **TRIGGERED** by `app/index.html`, `app/manifest.webmanifest`, `app/styles/main.css`, `app/js/app.js`, `app/js/tabs/players.js`, new `app/js/components/error-messages.js`, and 6 new PNG files. CACHE bumped v15 → v16.
  - APP_VERSION pairing rule (NEW v13 rule): **TRIGGERED** and applied — `APP_VERSION = 'v16'` in `app/js/app.js` paired with `CACHE = 'baseball-daily-shell-v16'` in `app/sw.js`. The B4 forward-debt escape clause from v13 is now sunset.
  - Pre-push ESM check: TRIGGERED → `npm run check:esm` passes with all 19 modules importing clean (was 18; +error-messages.js).
  - Whole-number version bump: applied (SW cache v15 → v16 + APP_VERSION pill set to v16).
  - Session-End Step 2 (credentials.md): NOT triggered (no credential changes this session).

  **Verification:**
  - `npm run build:icons` produced all 6 PNGs cleanly.
  - `npm run check:esm` exit 0 with 19 OK modules.
  - Live browser smoke test via Claude Preview MCP (port 1882): snapshot loaded (`Updated 5/1/2026, 8:06:00 PM` text rendered in footer), 4 apple-touch-icon links present in document head, APP_VERSION pill renders "V16" with computed color `rgb(196, 199, 204)` (= `--text-muted`), 11.2px font-size, 0.56px letter-spacing, 21.3×16.8 px bounding box, no console errors.

  **Closes:** Phase B4 sub-task of KB-0028. Three phases remain on the pickleball-parity roadmap (B5-B7). Also closes KB-0007 (long-deferred PNG icons).
- **Status:** Closed (B4 complete; B4 sub-task of KB-0028 marked done; KB-0007 closed)
- **Cross-ref:** scripts/build-icons.js · app/icons/ · app/index.html · app/manifest.webmanifest · app/sw.js · app/styles/main.css · app/js/components/error-messages.js · app/js/app.js · app/js/tabs/players.js · package.json · KB-0007 (closed) · KB-0028 (B4 done) · KB-0030 (B3 — APP_VERSION pairing rule introduced) · pickleball KB-0021 (error-messages source pattern) · pickleball KB-0016 (date-utils source — audit determined skip)

### KB-0032 | Phase B5 — News tab + email v3 Top News section
- **Type:** Action
- **Date:** 2026-05-02 (Session 8 — Phase B5)
- **Category:** Features / Ingestion / Email / Pickleball-parity
- **Tags:** news, rss, atom, rss-parser, fetch-news, email-v3, pickleball-parity, b5
- **Source:** Session 8 chat 2026-05-02 — owner ATP'd Phase B5 from the Session 8 kickoff (`ATP Phase B5`)
- **Finding:** Pickleball-parity Phase B5 executed end-to-end. Eight deliverables shipped together:

  **(1) `ingestion/lib/rss-parser.js` (NEW; ~190 lines)** — direct port of pickleball's rss-parser.js. RSS 2.0 + Atom 1.0 with auto-detection (`isAtomFeed` checks for `xmlns="http://www.w3.org/2005/Atom"` or `<feed><entry>` pattern). No dependencies — uses native `https`/`http` + regex. Handles: CDATA unwrapping, HTML entity decoding (`&amp; / &lt; / &#x... / &#nnn;`), one-redirect following, 12s timeout, `User-Agent: BaseballDailyBot/1.0`. Extracts per item: id (guid or link), title, url, summary (≤280 chars stripped of HTML), author, categories, imageUrl (from `media:content` / `media:thumbnail`), publishedAt (ISO from `pubDate`/`published`/`updated`). Per-item shape includes `tier` + `scope` (NEW vs pickleball — for Cardinals/Nationals/league bucketing).

  **(2) `data/master/news-sources.json` (NEW)** — 7 sources defined; 6 enabled, 1 placeholder:
  - `mlb-com` — MLB.com — league — T1 — `https://www.mlb.com/feeds/news/rss.xml`
  - `mlb-trade-rumors` — MLB Trade Rumors — league — T1 — `https://www.mlbtraderumors.com/feed`
  - `espn-mlb` — ESPN MLB — league — T1 — `https://www.espn.com/espn/rss/mlb/news`
  - `viva-el-birdos` — Viva El Birdos — cardinals — T2 — SBNation feed
  - `cardinals-com` — Cardinals.com — cardinals — T2 — MLB.com sub-feed
  - `federal-baseball` — Federal Baseball — nationals — T2 — SBNation feed
  - `masn` — MASN Sports — nationals — T2 — `enabled: false` (no public RSS endpoint located; documented placeholder for re-enable when found)

  Schema includes `enabled` flag so future disable/re-enable doesn't require code changes. Caveats section flags MLB Trade Rumors' rumors-tier-by-name (T1 per kickoff is owner's call) and Cardinals.com's MLB.com sub-feed posture.

  **(3) `ingestion/fetch-news.js` (NEW; ~115 lines) + `npm run fetch:news` script.** Reads news-sources.json, iterates enabled sources, calls `rss-parser.fetchFeed`, applies `MAX_PER_SOURCE=15` cap per source, dedupes across sources by URL + normalized title (lowercase + strip non-alphanumeric, first 80 chars), sorts newest-first (items missing `publishedAt` drop to back), applies `MAX_ITEMS=40` total cap. Writes to `data/snapshots/news-latest.json` (separate file per kickoff — independent freshness from main snapshot). Per-source errors recorded inside the output without failing the run; `ok: true` if any source returned items, `ok: false` only if all failed. Output schema: `{ schemaVersion: 1, generatedAt, ok, sources: [{ sourceId, sourceName, tier, scope, ok, count, error? }], items: [...], errors: [...] }`.

  **(4) `app/js/components/confidence-badge.js` (NEW; ~17 lines)** — direct port. Exports `escapeHtml` + `confidenceBadgeHtml(tier)`. T1 = no badge (default render); T2 = `<span class="badge-confidence t2">T2</span>`; T3 = "editorial" badge; "developing" = "developing" badge.

  **(5) `app/js/components/news-card.js` (NEW; ~58 lines)** — port adapted for baseball. Drops the unused `date-utils.js` import from pickleball (audit determined no off-by-one risk in baseball — Session 7 KB-0031). Exports `renderNewsCard(item)` (article card with headline link + source/tier/relative-date meta line + author + summary) and `bucketNews(items)` (Today / This Week / Recent buckets by `publishedAt` against local midnight). Local `fmtRelative(iso)` produces "5h ago" / "3d ago" labels.

  **(6) `app/js/tabs/news.js` (NEW; ~56 lines)** — async tab module. Loads via `loadNewsSnapshot()` from data-loader; on fetch error renders `errorBannerHtml('fetch-failed')`. Renders `<h1>News</h1>` + sources line ("From: MLB.com (15) · ESPN MLB (15) · ..."), then Today / This Week / Recent sections (each with `<h2>` heading + grid of news-cards). Per-source errors render as a bottom muted line. Empty-state message when no items returned.

  **(7) Wired into app shell:**
  - `app/index.html` — added `<button class="tab" data-tab="news">News</button>` (8th nav slot) + `<section id="tab-news" class="panel"></section>`.
  - `app/js/app.js` — imports `renderNews`, adds `case 'news': await renderNews(panel); break;` to switch. APP_VERSION bumped `'v16'` → `'v17'`.
  - `app/js/data-loader.js` — adds `loadNewsSnapshot()` exporting `fetch('../data/snapshots/news-latest.json', { cache: 'no-store' })`.
  - `app/sw.js` — CACHE bumped `v16` → `v17`; SHELL_FILES extended with `./js/tabs/news.js`, `./js/components/news-card.js`, `./js/components/confidence-badge.js`.
  - `app/styles/main.css` — added News tab block (`.news-list`, `.news-card`, `.news-card-link`, `.news-headline`, `.news-meta`, `.news-summary`, `.news-sources-line`, `.badge-confidence` + `.t2` / `.t3` / `.developing` variants). Adapted to baseball's CSS-variable names.

  **(8) Email template v2 → v3 + send-email v3 + archive:**
  - `archive/email-template_v2.js` — v2 archived per whole-number versioning rule.
  - `ingestion/lib/email-template.js` — v2 → v3. `buildEmail(snapshot, newsData?)` signature change (newsData optional; second arg). New `topNewsHtml(items)` renders top 4 news items between Notable Games and On This Day. Each item gets a soft-banner-style card with `border-left` color-coded by tier (T1 = info-blue, T2 = gold, lower = muted), title + source + relative date + tier badge + summary. Plain-text fallback gets a `TOP NEWS` section with title + source · date + URL per item.
  - `ingestion/send-email.js` — v2 → v3. Loads news-latest.json defensively (graceful skip with logged reason if missing or unparseable). Passes newsData to buildEmail.
  - `.github/workflows/daily.yml` — added `Fetch news headlines` step between `Fetch daily data` and `Commit and push snapshot`. Cloud cron will populate news-latest.json each morning before email sends. Existing `git add data/snapshots/` already covers the new file.

  **Files changed/added (this session):**
  ```
  A  ingestion/lib/rss-parser.js                 (NEW; ~190 lines)
  A  ingestion/fetch-news.js                     (NEW; ~115 lines)
  A  data/master/news-sources.json               (NEW; 7 sources, 6 enabled)
  A  app/js/components/confidence-badge.js       (NEW; ~17 lines)
  A  app/js/components/news-card.js              (NEW; ~58 lines)
  A  app/js/tabs/news.js                         (NEW; ~56 lines)
  A  archive/email-template_v2.js                (v2 archive)
  M  app/index.html                              (+News tab + panel)
  M  app/js/app.js                               (+renderNews import + case; APP_VERSION v16 → v17)
  M  app/js/data-loader.js                       (+loadNewsSnapshot)
  M  app/sw.js                                   (CACHE v16 → v17; +3 SHELL_FILES)
  M  app/styles/main.css                         (+News tab CSS block + badge-confidence variants)
  M  ingestion/lib/email-template.js             (v2 → v3; +topNewsHtml + plain-text TOP NEWS section)
  M  ingestion/send-email.js                     (v2 → v3; loads news-latest.json defensively)
  M  package.json                                (+fetch:news script)
  M  .github/workflows/daily.yml                 (+Fetch news headlines step)
  M  docs/knowledge-base.md                      (this entry; KB-0028 B5 done; Last-updated bumped)
  A  data/snapshots/news-latest.json             (NEW; first cloud run will overwrite — locally generated for verification)
  ```

  **Triggers per CLAUDE.md Critical Rules:**
  - SW cache rule: **TRIGGERED** — CACHE bumped v16 → v17 paired with APP_VERSION v17.
  - APP_VERSION pairing rule (v13): **TRIGGERED** and applied — both rolled together in same commit.
  - Pre-push ESM check: TRIGGERED → `npm run check:esm` exits 0 with **22 OK modules** (was 19; +confidence-badge.js, +news-card.js, +news.js).
  - Whole-number version bump: applied to email template (v2 → archive; in-tree promoted to v3) and SW/APP_VERSION (v16 → v17).
  - Session-End Step 2 (credentials.md): NOT triggered (no credential changes).

  **Verification:**
  - `npm run fetch:news` (local) — wrote 40 items from 6/6 enabled sources to news-latest.json. All sources returned full caps (15) except SBNation pair (10 each — feed depth).
  - `npm run check:esm` — exit 0 with all 22 modules importing clean.
  - Local email dry-run (`EMAIL_DRY_RUN=1`) — rendered 32,704 bytes (was 27,322 in v2; +5,382 bytes for Top News section); plain-text TOP NEWS block present with all 4 items + URLs; subject line unchanged ("⚾ Cardinals win 7-2 vs Los Angeles Dodgers — Friday, May 1, 2026").
  - Live browser smoke test via Claude Preview MCP (port 1882): cleared old SW cache → reload picked up v17 shell. APP_VERSION pill renders "V17". News tab in nav (8th slot). Activated News tab via direct call (splash overlay had to be removed for click to register, normal). Rendered: "From: MLB.com (15) · MLB Trade Rumors (15) · ESPN MLB (15) · Viva El Birdos (10) · Cardinals.com (15) · Federal Baseball (10)" — 6 sources line. Today + This Week h2 sections present. 40 news-card articles rendered. 6 `.badge-confidence.t2` badges with computed color `rgb(0, 180, 216)` (= --accent-info), background `rgba(0, 180, 216, 0.18)`, font-size 11.2px. First card: "White Sox rookie Murakami hits MLB-best 13th HR" from ESPN MLB with "1m ago" relative timestamp. Card background `rgb(30, 49, 72)` (= --bg-card). No console errors.

  **Closes:** Phase B5 sub-task of KB-0028. Two phases remain on the pickleball-parity roadmap (B6 = AI Q&A, B7 = TOC + accordion backport).

  **Decisions deviating from kickoff:**
  - **MASN as disabled placeholder, not omitted.** Kickoff said "TBD URL; flag if not findable." Schema-supported `enabled: false` keeps MASN documented + auditable in news-sources.json without breaking the fetcher. Re-enable is a one-line config edit when an RSS endpoint is found.
  - **News stored separate from main snapshot.** Per kickoff: "Writes to `data/snapshots/news-latest.json` (separate from main snapshot — independent freshness)." Send-email v3 reads both files defensively; if news-latest.json is missing the email still sends with Top News section omitted.
  - **`renderNewsCardCompact` skipped.** Pickleball's component exports a compact variant for the daily-tab Top News module. Baseball's daily tab doesn't need a Top News module (Top News appears in email + News tab; daily tab stays MLB-stats-focused). Drop avoids dead code.
  - **`date-utils.js` not introduced.** Session 7 audit (KB-0031) determined baseball has zero off-by-one risk. News-card uses `new Date(iso)` only on full ISO strings from RSS publishedAt (parsed by rss-parser via `new Date(pubDate).toISOString()`); already safe. The unused pickleball import was dropped during port.
- **Status:** Closed (B5 complete; B5 sub-task of KB-0028 marked done)
- **Cross-ref:** ingestion/lib/rss-parser.js · ingestion/fetch-news.js · data/master/news-sources.json · app/js/tabs/news.js · app/js/components/news-card.js · app/js/components/confidence-badge.js · ingestion/lib/email-template.js · archive/email-template_v2.js · app/sw.js · app/js/app.js · KB-0028 (B5 done) · KB-0031 (Session 7 — date-utils audit referenced) · pickleball KB-0035 (rss-parser + fetch-news source pattern)

### KB-0033 | Phase B6 — AI Q&A layer (build-ai-context + Worker + Ask tab)
- **Type:** Action
- **Date:** 2026-05-03 (Session 9 — Phase B6)
- **Category:** Features / AI / Cloudflare Worker / Pickleball-parity
- **Tags:** ai, anthropic, haiku, prompt-cache, cloudflare-worker, ask-tab, b6, pickleball-parity
- **Source:** Session 9 chat 2026-05-03 — owner ATP'd Phase B6 from the Session 9 kickoff (`ATP Phase B6`)
- **Finding:** Pickleball-parity Phase B6 executed code-side end-to-end. Awaiting owner-side credential creation + Worker deploy to go live. Eight deliverables shipped:

  **(1) `ingestion/build-ai-context.js` (NEW; ~290 lines)** — distills `data/snapshots/latest.json` + `data/snapshots/news-latest.json` + `data/master/*.json` into a curated text bundle written to `data/snapshots/ai-context.json`. 16 sections produced: Cardinals pin (recap + decisions + scoring plays + recent form + injuries + highlights), Nationals pin (same), Standings (all 6 divisions × top 5), Today's Schedule (probable pitchers), Recent Notable Games, On This Day, Season Progress, Top News (with URLs), Cardinals Deep (retired numbers + HOFers + historic seasons + traditions), Curated Stories, MLB Legends, Strangest Plays, Brothers in MLB, Trivia sample, MLB Franchises, Player Directory pointer. First run produced **22,224 chars / ~5,556 tokens** — well within the 5-7K target. The bundle is the input the Worker ships to Claude with `cache_control: ephemeral` for prompt caching. Direct port of pickleball's pattern; section content adapted for baseball schema (cardinals-deep `retiredNumbers` / `hallOfFamers` / `historicSeasons` / `traditions` keys; brothers `entries` key; strange-plays `plays` key; trivia `questions` key; franchises `franchises` key — all confirmed by probing the actual files since pickleball's section-builder field paths don't translate).

  **(2) Cloudflare Worker rewritten — `worker/src/index.js`** (replaces previous KB-0024 single-route Worker). Renamed `baseball-daily-submit` → `baseball-daily-api` reflecting dual-route purpose. Three routes: `GET /health` (open, returns Worker name + aiEnabled flag), `POST /ai` (proxy to Anthropic Messages API), `POST /submit` (preserved from KB-0024, dormant until Suggest UI wires up). `/ai` route handles: question 5-500 chars validation, per-IP rate limit (10/hr + 50/day with retry-min hint), kill switch via `env.AI_DISABLED === 'true'`, fetch context bundle from GitHub Pages with `cf.cacheTtl: 300` edge cache, ship to Anthropic Messages API with `cache_control: ephemeral` on context block + system prompt forbidding markdown + plain-prose-only instruction. Returns `{ok, answer, model, contextGeneratedAt, usage: {inputTokens, outputTokens, cacheReadTokens, cacheCreationTokens, cacheHit}}`. CORS locked to `https://jjmgladden.github.io` + `http://localhost:1882`. Default model: `claude-haiku-4-5-20251001`.

  **(3) `worker/wrangler.toml` updated** — name `baseball-daily-api`, AI vars (`AI_MODEL`, `AI_DISABLED`, `AI_CONTEXT_URL`), `ALLOWED_TYPES` for /submit, `WORKER_NAME`. Secrets documented in comments: `ANTHROPIC_API_KEY` (required for /ai) + `GITHUB_TOKEN` (optional, for /submit only). `worker/package.json` v1.0.0 → v2.0.0 with name change + wrangler v3 → v4. `worker/README.md` rewritten end-to-end documenting first-time setup, all routes, cost guards, kill-switch, rotation procedures.

  **(4) `app/js/tabs/ask.js` (NEW; ~200 lines)** — port of pickleball's chat tab. Loads ai-config via `loadMaster('ai-config.json')`. If `aiEnabled: false` or empty `workerBaseUrl`, renders soft-banner "AI Q&A is being configured..." (gracefully degrades when Worker not deployed). When enabled, renders chat UI: `<h1>Ask the AI</h1>`, history pane, textarea (5-500 chars), Ask + Clear buttons, hint line. Posts to Worker `/ai`. In-memory history only (resets on tab change). Defense-in-depth markdown stripper + autolinker for AI responses (model is told no markdown but stripper is a safety net). Loading "Thinking…" spinner. Error rendering for rate-limit / network / API errors.

  **(5) `data/master/ai-config.json` (NEW)** — browser-side gate. Initial state: `{workerBaseUrl: "", aiEnabled: false}` so the Ask tab renders soft-banner until owner pastes the deployed Worker URL. Two ways to disable Ask without redeploy: (a) flip `aiEnabled: false` here (browser-side), (b) `wrangler secret put AI_DISABLED` to `true` (server-side). Both must be true for Ask to be live.

  **(6) Wired into app shell:**
  - `app/index.html` — added `<button class="tab" data-tab="ask">Ask</button>` (9th nav slot) + `<section id="tab-ask" class="panel"></section>`.
  - `app/js/app.js` — imports `renderAsk`, adds `case 'ask': await renderAsk(panel); break;` to switch. APP_VERSION bumped `'v17'` → `'v18'`.
  - `app/sw.js` — CACHE bumped `v17` → `v18`; SHELL_FILES extended with `./js/tabs/ask.js`.
  - `app/styles/main.css` — added Ask tab CSS block (~120 lines): `.ask-history`, `.ask-empty`, `.ask-msg` + `.ask-msg-user/-ai/-error` variants, `.ask-msg-label`, `.ask-msg-body`, `.ask-msg-meta`, `.ask-controls`, `#ask-input`, `.ask-buttons`, `.ask-btn-primary` (Cardinals red), `.ask-btn-secondary`, `.ask-hint`. Adapted to baseball's CSS variables.

  **(7) `.github/workflows/daily.yml`** — added "Build AI context bundle" step between "Fetch news headlines" and "Commit and push snapshot". Cloud cron will regenerate `ai-context.json` each morning before commit, so the GitHub Pages-hosted bundle stays current. Existing `git add data/snapshots/` covers the new file.

  **(8) `docs/credentials.md` v1 → v2** — `ANTHROPIC_API_KEY` row updated from "not yet created" to "code shipped, awaiting owner creation". Worker references updated to new name. Maintenance log entry for Session 9. v1 archived to `archive/credentials_v1.md` per whole-number versioning rule.

  **Files changed/added (this session):**
  ```
  A  ingestion/build-ai-context.js              (NEW; ~290 lines)
  M  worker/src/index.js                        (full rewrite; +/ai route, +/health, refactored)
  M  worker/wrangler.toml                       (renamed; +AI vars)
  M  worker/package.json                        (v1 → v2; name + wrangler v3 → v4)
  M  worker/README.md                           (full rewrite for dual-route Worker)
  A  app/js/tabs/ask.js                         (NEW; ~200 lines)
  A  data/master/ai-config.json                 (NEW; aiEnabled:false until deploy)
  A  data/snapshots/ai-context.json             (NEW; first run; cloud cron will overwrite)
  M  app/index.html                             (+Ask tab + panel — 9th slot)
  M  app/js/app.js                              (+renderAsk import + case; APP_VERSION v17 → v18)
  M  app/sw.js                                  (CACHE v17 → v18; +ask.js in SHELL_FILES)
  M  app/styles/main.css                        (+Ask tab CSS block)
  M  package.json                               (+build:ai-context script)
  M  .github/workflows/daily.yml                (+Build AI context bundle step)
  M  docs/credentials.md                        (v1 → v2; ANTHROPIC_API_KEY status update)
  A  archive/credentials_v1.md                  (v1 archive)
  M  docs/knowledge-base.md                     (this entry; KB-0028 B6 done; KB-0024 superseded; Last-updated bumped)
  ```

  **Triggers per CLAUDE.md Critical Rules:**
  - SW cache rule: **TRIGGERED** — CACHE bumped v17 → v18 paired with APP_VERSION v18.
  - APP_VERSION pairing rule (v13): **TRIGGERED** and applied — both rolled together in same commit.
  - Pre-push ESM check: TRIGGERED → `npm run check:esm` exits 0 with **23 OK modules** (was 22; +ask.js).
  - Whole-number version bump: applied to credentials.md (v1 → archive) and SW/APP_VERSION (v17 → v18) and worker package (v1 → v2).
  - Session-End Step 2 (credentials.md): **TRIGGERED** — first session under v13's mandate that touched credentials. Doc rolled v1 → v2 with `ANTHROPIC_API_KEY` row + maintenance log entry.

  **Verification (code-side):**
  - `npm run build:ai-context` — wrote 22,224-char / ~5,556-token bundle. All 16 sections rendered with real content (initial run had bug — pickleball-style field paths didn't match baseball schemas; corrected by probing the actual master files).
  - `npm run check:esm` — exit 0 with all 23 modules importing clean.
  - Live browser smoke test via Claude Preview MCP (port 1882): cleared old SW cache → reload picked up v18 shell. APP_VERSION pill renders "V18". Ask tab in nav (9th slot). Activated Ask tab — rendered soft-banner "AI Q&A is being configured. The Cloudflare Worker that proxies questions to Anthropic has not been deployed yet, or aiEnabled is false in data/master/ai-config.json..." (correct posture for `aiEnabled: false`). Verified the enabled-path render via fetch monkey-patch: `#ask-input` + `#ask-history` + `#ask-send` all present, send button computed bg `rgb(196, 30, 58)` (= --accent-cards Cardinals red), history bg `rgb(21, 34, 48)` (= --bg-secondary). No console errors.

  **Owner-side action required to go live:**
  1. Create Anthropic API key at https://console.anthropic.com/settings/keys named `baseball-daily-worker` (or similar). Copy the `sk-ant-api03-...` value.
  2. (Optional) Set monthly spend cap at https://console.anthropic.com/settings/limits — recommended $5/mo on top of the existing $20 account-wide cap shared with pickleball.
  3. Run `cd worker && npx wrangler login` (one-time browser auth).
  4. Run `npx wrangler secret put ANTHROPIC_API_KEY` and paste the key.
  5. Run `npx wrangler deploy`. Wrangler prints the deployed URL (`https://baseball-daily-api.<subdomain>.workers.dev`).
  6. Smoke test: `curl https://baseball-daily-api.<subdomain>.workers.dev/health` should return `{"ok":true,"worker":"baseball-daily-api","routes":["POST /submit","POST /ai"],"aiEnabled":true}`.
  7. Paste the deployed URL into `data/master/ai-config.json`'s `workerBaseUrl` field, set `aiEnabled: true`, commit + push. Bump SW cache + APP_VERSION (v18 → v19) since `data/master/ai-config.json` is fetched but not part of SHELL_FILES — actually `ai-config.json` lives outside `app/` so the SW cache rule does NOT trigger. (The `loadMaster()` fetch hits `../data/master/ai-config.json` which is outside the SW scope — confirmed in `app/sw.js` SHELL_FILES list.) So just commit + push.
  8. Hard-refresh the deployed site once. Click Ask tab. Type a test question (e.g. "How are the Cardinals doing this season?"). Verify response renders, cache hit on second question.

  **Cost posture:**
  - Per-IP rate limits (in-Worker): 10 questions/hour, 50 questions/day.
  - Anthropic spend cap (account-level, shared with pickleball): $20/mo (already set during pickleball Session 8). For an estimate of per-question cost: ~5,556-token input × ~$1/MTok cached + ~$0.80/MTok cache-create + 600-token output × $4/MTok ≈ $0.005 per uncached question, ~$0.003 cached. 50 questions/day × $0.005 = ~$0.25/day worst case = ~$7.50/mo. Well within the $20 cap even if pickleball uses the full half.
  - Kill switch: `wrangler secret put AI_DISABLED` to `true` returns HTTP 503 from `/ai` without spending API budget.
  - CORS lock: only `jjmgladden.github.io` + `localhost:1882` can call the Worker; arbitrary origins rejected.

  **Closes:** Phase B6 sub-task of KB-0028 (code-side; owner deployment pending). One phase remains on the pickleball-parity roadmap (B7 = TOC + accordion backport).

  **KB-0024 superseded:** the original baseball-daily-submit Worker has been rewritten into baseball-daily-api with the same /submit code retained but no longer the primary purpose. KB-0024 stays Open until the Suggest UI is actually wired to the Worker (separate pickup), but the code-side blocker is gone — `wrangler deploy` from Phase B6 will deploy both routes simultaneously.

  **Decisions deviating from kickoff:**
  - **Worker named `baseball-daily-api`, not just deploying the existing `baseball-daily-submit`.** Kickoff said "revives KB-0024 with new purpose"; the cleaner path was renaming the Worker entirely (no `baseball-daily-submit` Worker is yet deployed, so no deprecation needed). Pickleball-parity matches now.
  - **Email template v3 → v4 NOT rolled.** Kickoff said "small footer addition: 'Have a question? Ask the AI on the report site →'. Decision point during execution: bump to v4 or fold into existing v3? Probably v3 stays". Decision: v3 stays; the chat link is internal to the site (Ask tab) and the email already CTAs to the site. Rolling v4 just for a footer link adds a version archive bump for marginal benefit. If owner wants it added later, single-line edit + v4 bump.
  - **`ai-config.json` lives outside `app/`.** Per app pattern: master files are fetched from `../data/master/` and are NOT cached by the SW (only `app/` shell is). This means swapping `aiEnabled: true` after Worker deploy does NOT require SW cache + APP_VERSION bump — it's a data swap, not a shell swap. Owner can flip the gate without rolling versions. (Pickleball's pattern is identical.)
  **Owner-side activation log (Session 9 same-day):**
  - 22:00 UTC — Owner created ANTHROPIC_API_KEY in Anthropic Console (workspace = Default, name `baseball-daily-worker`). Existing $20/mo cap covers both projects.
  - 22:08 UTC — `gh secret set ANTHROPIC_API_KEY` piped from local `.env` over stdin. GitHub Secrets count: 5.
  - 22:10 UTC — Owner ran `npm install -g wrangler` from baseball worker dir (`npx wrangler login` in cmd.exe failed with `'Cindy' is not recognized` — the `&` in user path breaks cmd.exe arg parsing → **lesson promoted to XPL-002**).
  - 22:25 UTC — Switched to PowerShell. `wrangler login` initially looked stuck because the OAuth browser tab popped behind PowerShell → **lesson promoted to XPL-003**. Owner clicked Authorize after Alt+Tab.
  - 22:35 UTC — `wrangler secret put ANTHROPIC_API_KEY` (PowerShell). `wrangler deploy` printed `https://baseball-daily-api.jjmgladden.workers.dev`. `/health` returned `{ok:true,aiEnabled:true,routes:["POST /submit","POST /ai"]}`.
  - 22:38 UTC — Updated `data/master/ai-config.json`: `workerBaseUrl` set + `aiEnabled: true`. Committed `21c2b57` + pushed. GitHub Pages rebuilt.
  - 22:45 UTC — First `/ai` test returned 400 with **empty body** (`content-length: 0`). Debug cycle: added verbose Worker logging, added minimal `/aitest` smoke route — even minimal call got 400-empty. Pickleball Worker confirmed still working from same machine. Diagnosed as **PowerShell wrangler-secret-put paste captured only one character of the API key** — the same Windows masked-input bug as pickleball Session 8.
  - 23:05 UTC — Re-pasted ANTHROPIC_API_KEY via Cloudflare dashboard (Settings → Variables and Secrets → Edit). Worker picked up new value within seconds.
  - 23:07 UTC — `/aitest` returned 200 with real Anthropic response. `/ai` returned a real Cardinals answer (8,105-token cache creation, 204 output tokens, plain prose, source citations in parentheses).
  - 23:15 UTC — Live browser smoke test against deployed site Ask tab returned a real chat-UI answer end-to-end. `[ai] Request log` confirms model + body bytes; meta line shows `claude-haiku-4-5-20251001 · context: 2026-05-03`.
  - 23:30 UTC — Removed `/aitest` debug route from Worker code; committed `f53b0e9`. **Cleanup `wrangler deploy` deferred to Session 10 first task** (60-sec PowerShell command — owner closed terminal at end of session). The /aitest route remains in the deployed Worker but is harmless (no public URL hits it; only debug curl during this session's debug cycle).

  **User-level cross-project KB created (Session 9 spillover):** owner asked "how do we create a cross-project KB? I am tired of having to debug the same damn problem." Created `C:\Users\John & Cindy Gladden\.claude\CLAUDE.md` (auto-loaded by Claude Code into every project session under this user account) with 6 entries (XPL-001 through XPL-006). XPL-001 documents the Windows wrangler-paste bug + Cloudflare-dashboard fix. Pointer memory files added in both baseball and pickleball auto-memory dirs (`cross_project_lessons.md`). Added mandatory session-end XPL audit instruction with summary block — runs every session, every project, automatically.

- **Status:** Closed (B6 LIVE end-to-end; one minor cleanup deferred to Session 10 — drop `/aitest` route via `wrangler deploy`)
- **Cross-ref:** ingestion/build-ai-context.js · worker/src/index.js · worker/wrangler.toml · worker/README.md · app/js/tabs/ask.js · data/master/ai-config.json · app/index.html · app/js/app.js · app/sw.js · app/styles/main.css · .github/workflows/daily.yml · docs/credentials.md (v2) · ~/.claude/CLAUDE.md (XPL-001..006 user-level) · KB-0028 (B6 done) · KB-0024 (superseded by Worker rewrite) · pickleball KB-0008 (architecture parent) · pickleball KB-0036 (same Windows wrangler-paste bug — first encounter) · commits 7f4e245 + 21c2b57 + f53b0e9 + (next: 4th commit with KB updates + handoff)

### KB-0019 | Recent-form 14-day window
- **Type:** Reference
- **Date:** 2026-04-19
- **Category:** Data / Features
- **Finding:** Recent form for Cards + Nats pulls last 14 calendar days via `mlb.getTeamSchedule`. Only `Final` games counted. Streak walks backward from most recent result. Last-10 shown separately. Home/road splits count the full 14-day window.
- **Status:** Closed
- **Cross-ref:** ingestion/fetch-daily.js § computeRecentForm · app/js/components/streak.js

### KB-0034 | Session 10 omnibus — Phase B7 + KB-0020/0021 + email v4 + trivia daily-rotation + mobile stale-snapshot SW fix
- **Type:** Action
- **Date:** 2026-05-04 → 2026-05-06 (Session 10, multi-day)
- **Category:** Multi-track session — UI / Email / Worker / SW / Content pipeline
- **Tags:** phase-b7, toc-accordion, sw-cache-fix, kb-0020, kb-0021, email-v4, trivia, mobile-bug, weekly-batch-routing, pickleball-parity-complete
- **Source:** Session 10 chat — owner ATP'd 5-step plan + KB-0020 (6 tracks) + emergent mobile-stale-snapshot bug (7th track surfaced via "this morning the email had a date of 5/5 but when i went into the link it was still 5/4 — does not happen for Pickleball")
- **Finding:** Bundled 7 tracks shipped end-to-end:

  **Track 0 — `/aitest` cleanup deferred from Session 9.** `wrangler deploy` from `worker/` (PowerShell — XPL-002) dropped the debug route. Verified `/aitest` returns 404; `/health` still green. ~30 sec.

  **Track 1 (Phase B7 — TOC + accordion backport).** Direct port of pickleball KB-0040 Phase L1 across three baseball tabs: [`app/js/tabs/cardinals.js`](../app/js/tabs/cardinals.js) (5 sections — Legends Dig Deeper open by default · Retired Numbers · Historic Seasons · Hall of Famers · Traditions), [`app/js/tabs/history.js`](../app/js/tabs/history.js) (5 sections — On This Day open · Iconic Moments · Strangest Plays · Franchise Lineages · All Franchises + new info-callout pointing to Stories tab), [`app/js/tabs/news.js`](../app/js/tabs/news.js) (collapsible Today/This Week/Recent buckets). Generic CSS pattern (`.tab-toc` / `.tab-section` / `.tab-callout`) ported into [`app/styles/main.css`](../app/styles/main.css) (~95 lines). Pickleball variable map: `--bg-2` → `--bg-secondary`, `--text-dim` → `--text-muted`, `--accent-2` → `--accent-info`, etc. Renumber-after-filter pattern: drop empty sections then re-index `num` so e.g. News tab on a low-news day reads "1. This Week (40)" cleanly instead of "2. This Week (40)" with a 1- and 3- gap.

  **Track 2 (apply Issue #5 approvals).** [Issue #5](https://github.com/jjmgladden/baseball-daily/issues/5) closed Monday May 4 with "Approve ALL" checked but unapplied. Authored verified entries for the 10 approved stubs (1 executive — Marvin Miller — + 9 player legends — Yogi Berra, Reggie Jackson, Derek Jeter, Randy Johnson, Walter Johnson, Chipper Jones, Sandy Koufax, Greg Maddux, Mickey Mantle) and appended to [`data/master/legends-general.json`](../data/master/legends-general.json) (20 → 30 entries). Curation-backlog entries flipped pending → active (131 → 121 pending). Apply script archived at `scripts/apply-batch-2026-05-04.js`.

  **Track 3 (KB-0021 closed — auto-reload on SW update).** Implemented in [`app/js/app.js`](../app/js/app.js) `registerServiceWorker()`. See KB-0021 for detail.

  **Track 4 (email template v3 → v4 — owner feedback "Open Full Report at top, not bottom").** [`ingestion/lib/email-template.js`](../ingestion/lib/email-template.js) v3 → v4: CTA button + brief stats summary (`X games yesterday · Y trades · Z on the IL league-wide`) moved from below On This Day section to directly under the header. Same change applied to plain-text fallback. v3 archived in git history (no source-code archive file — diverges from CLAUDE.md whole-number convention for build-time modules where git is authoritative). Dry-run verified the new ordering before commit.

  **Track 5 (trivia tab redesign — "Today's 5" + filters mine full pool).** [`app/js/tabs/trivia.js`](../app/js/tabs/trivia.js) v1 → v2:
  - **Default landing state:** N=5 deterministic-by-date picks via `pickDailySet(questions, 5)`. First card uses index `(dayOfYear + 0) % len` matching [`app/js/components/trivia.js`](../app/js/components/trivia.js) `pickDaily()` so the Daily Report card === Trivia tab's first card. Subsequent picks use evenly-spaced strides (`stride = floor(len / n)`) for full-pool coverage over the rotation cycle.
  - **🎲 Different 5 reshuffle button:** increments a `dayOfYear` offset stored in `sessionStorage` (`baseball-daily.trivia-reshuffle.v1`). Stable for the session — refreshing the tab keeps the picks. Hides in filter mode.
  - **Filter-bypass mode:** any filter input (search, category != "all", or unrevealed-only) auto-switches to "Search results" mode rendering ALL matching questions from the full pool. Heading swaps + reshuffle button hides. Click "All" → returns to Today's 5.
  - **Random unrevealed button:** preserved; queries the full pool regardless of mode; applies a deferred-search-injection trick to land on the picked card.

  **Track 6 (trivia in weekly-batch flow + 20 verified stubs seeded).** Updated [`weekly-batch.yml`](../.github/workflows/weekly-batch.yml) routing instruction line so future Claude knows `type: 'trivia'` → `data/master/trivia.json` (alongside legend → legends-general.json, moment → historical-videos.json, story → stories.json, umpire → legends-general.json category=umpire). Authored 20 trivia stubs across 8 categories (records 5, hall-of-fame 3, postseason 3, cardinals 2, nationals 2, military 1, civil-rights 1, franchise-history 2, umpires 1) — each carries actual `question` + `answer` strings (extended schema vs other types) so the apply step is a simple append. Seeded into [`data/master/curation-backlog.json`](../data/master/curation-backlog.json) (121 → 141 pending). Next 2 Monday batches will surface 10/week. Apply script archived at `scripts/seed-trivia-2026-05-05.js`.

  **Track 7 (KB-0020 closes-pending-PAT — public on-demand refresh).** Code complete + Worker deployed. See KB-0020 for full detail. Owner-side: create one fine-grained PAT scoped to `jjmgladden/baseball-daily` with Actions:write + Issues:write, paste into Cloudflare dashboard as Worker secret `GITHUB_TOKEN` (XPL-001 — NOT `wrangler secret put`). One paste covers BOTH `/refresh` and `/submit`. ~5 min owner work. Worker routes count: 3 (was 2: /ai, /submit; now adds /refresh). New file: [`app/js/components/refresh.js`](../app/js/components/refresh.js) (60 lines). Footer: `<a class="suggest-link" data-refresh>Refresh now</a>` + `<span id="refresh-status">` for inline status messaging.

  **Track 8 (mobile stale-snapshot bug — SW cache-first-for-everything anti-pattern).** Owner reported "this morning the email had a date of 5/5 but when i went into the link it was still 5/4 — does not happen for Pickleball" — same complaint as Session 10 day 1. Diagnosis path:
  1. Compared GitHub Pages cache headers — identical between projects (`Cache-Control: max-age=600`).
  2. Compared data-loader cache options — both projects use `cache: 'no-store'`.
  3. Compared **service worker fetch handlers** — found the divergence.
  4. Pickleball's SW differentiates: network-first for `/data/` paths, cache-first for shell. **Baseball's SW was cache-first for EVERY GET** — including `/data/snapshots/latest.json`. Once a user fetched the snapshot once, it was permanently cached in the SW until cache key bumped. The user's `cache: 'no-store'` request option got intercepted by the SW BEFORE reaching the browser HTTP cache layer.
  5. Why the user's mobile self-fixed after an hour: a previous SW cache-key bump from this session (v18 → v19 etc.) probably activated, clearing the stale entry.
  6. Why pickleball didn't have the bug: pickleball's SW was written with the split-handler pattern from day one. Baseball was written with simpler "cache-first everything" and never updated.

  **Fix:** [`app/sw.js`](../app/sw.js) fetch handler split into two branches: `if (url.pathname.includes('/data/'))` → network-first (try fetch with `cache: 'no-store'`, fall back to cache only on network error) · else → cache-first (existing behavior, with same-origin guard added on `cache.put` so cross-origin Worker/Anthropic responses don't accidentally land in the SW cache). Verified end-to-end via the preview server: pre-populated the SW cache with a stub `latest.json`, fetched, confirmed the response was the REAL fresh body not the stub. Verified shell paths still cache-first by doing the inverse test on `styles/main.css`.

  **Versioning summary across the session:**
  - SW cache + APP_VERSION rolled four times (v18 → v19 → v20 → v21 → v22), each paired
  - Email template v3 → v4
  - Worker package v2 → v3 (3 routes now)
  - Snapshot schemas unchanged (main v6, news v1, ai-context v1)
  - `docs/credentials.md` v2 → v3
  - `docs/knowledge-base.md` adds KB-0034 + closes/updates KB-0020/0021/0024/0028

  **Files touched this session (full enumeration):**
  ```
  N  scripts/apply-batch-2026-05-04.js
  N  scripts/seed-trivia-2026-05-05.js
  N  app/js/components/refresh.js
  N  archive/credentials_v2.md
  M  app/styles/main.css                 (+95 lines: TOC/section/callout)
  M  app/js/tabs/cardinals.js            (refactor → TOC + 5 sections)
  M  app/js/tabs/history.js              (refactor → TOC + 5 sections + info callout)
  M  app/js/tabs/news.js                 (refactor → TOC + collapsible buckets)
  M  app/js/tabs/trivia.js               (Today's 5 + reshuffle + filter-bypass)
  M  app/js/app.js                       (KB-0021 controllerchange + attachRefreshHandler + APP_VERSION v22)
  M  app/sw.js                           (CACHE v22 + refresh.js in SHELL_FILES + split handler for /data/ vs shell)
  M  app/index.html                      ("Refresh now" footer link + status span)
  M  ingestion/lib/email-template.js     (v3 → v4 reorder)
  M  ingestion/send-email.js             (template-version comment)
  M  worker/src/index.js                 (+/refresh route + handleRefresh + refreshLimit)
  M  worker/wrangler.toml                (REFRESH_WORKFLOW + REFRESH_REF vars + secrets-doc dual-use)
  M  .github/workflows/weekly-batch.yml  (routing comment includes trivia.json)
  M  data/master/legends-general.json    (+10 entries → 30 total)
  M  data/master/curation-backlog.json   (+20 trivia stubs; 10 flipped pending → active; 141 pending now)
  M  docs/credentials.md                 (v2 → v3)
  M  docs/knowledge-base.md              (this entry; KB-0028/0021/0020/0024 status updates; Last-updated bumped)
  ```

  **Triggers per CLAUDE.md Critical Rules:**
  - SW cache rule: TRIGGERED four times this session — `app/js/app.js` change + new `refresh.js` shell file + new fetch-handler logic in `sw.js` + final SW change for the data-path fix. CACHE bumped paired each time (v18 → v19 → v20 → v21 → v22).
  - APP_VERSION pairing rule: applied at every cache bump (paired four times).
  - Pre-push ESM check: ran 4× across the session, all green (24/24 modules clean — was 23 before refresh.js).
  - Whole-number version bump: applied for `docs/credentials.md` (v2 archived). Email template v3 → v4 — git history is authoritative for build-time modules per established pattern.
  - Session-End Step 2 (credentials.md update): triggered — `ANTHROPIC_API_KEY` row flipped ⏸ → ✅ (lag from Session 9), `GITHUB_TOKEN` row clarified for KB-0020 dual-use. Maintenance log entry added.

  **Verification end-to-end:** Cardinals/History/News tabs all render TOC + sections + open-state correctly via Claude Preview MCP (port 1882). Click-toggle on `<details>` sections confirmed open/close/open transitions. Trivia tab tested in 4 modes: default-set (5 cards, "Today's 5" heading), reshuffle (cards change, sessionStorage offset increments), filter-engaged (cards swap to full pool match, "Search results" heading, reshuffle hidden), filter-cleared (back to Today's 5). KB-0020 button tested with un-PAT'd Worker — error path renders `Refresh is not configured...` in footer status span. Mobile-stale-snapshot fix verified via stub-cache test: pre-seeded the SW cache with a fake old snapshot, fetched, confirmed the response was REAL not stub. Email v4 reorder verified via dry-run plain-text output.

  **Cross-project lesson surfaced this session for the XPL audit:** baseball's SW divergence from pickleball's pattern (cache-first-for-everything anti-pattern in PWAs) — bit ONE project so doesn't strictly meet the (a) "2+ projects" bar; not a Windows / paste / encoding gotcha so doesn't strictly meet the (b) bar either. **Marginal candidate** — recommendation: capture as PWA design lesson IN THIS KB entry rather than as an XPL, since the diagnostic *was* the cross-project comparison and the fix codifies a pattern future Claude can find by reading either project.
- **Status:** Closed (7 tracks shipped; KB-0020 closes-pending-owner-PAT)
- **Cross-ref:** `app/sw.js` (split handler) · `app/js/app.js:registerServiceWorker` · `worker/src/index.js:handleRefresh` · `app/js/components/refresh.js` · `app/js/tabs/trivia.js` (v2) · `app/js/tabs/cardinals.js` + `history.js` + `news.js` (B7 refactors) · `ingestion/lib/email-template.js` (v4) · `data/master/curation-backlog.json` · `data/master/legends-general.json` · `docs/credentials.md` (v3) · KB-0020 + KB-0021 + KB-0028 + KB-0033 + KB-0024 (related) · pickleball KB-0040 Phase L1 (B7 source pattern)

---

## Quick Index

**Open items (with tier where applicable):**
- KB-0013 — On-This-Day seed expansion — Limitation (closing path identified Session 10 — trivia-stub-style seed flow; deferred to a future session)
- KB-0020 — Public on-demand refresh — Action, **closes-pending-owner-PAT** (code shipped + Worker deployed Session 10; owner needs to create fine-grained PAT + paste via Cloudflare dashboard, ~5 min)
- KB-0024 — Submission Worker — Action (Worker code LIVE; Suggest UI hookup separate; same `GITHUB_TOKEN` PAT as KB-0020 covers it)

**Closed:**
KB-0001, KB-0002, KB-0003, KB-0004, KB-0005, KB-0006, KB-0007, KB-0008, KB-0009, KB-0010, KB-0011, KB-0012, KB-0014, KB-0015, KB-0016, KB-0017, KB-0018, KB-0019, KB-0021, KB-0022, KB-0023, KB-0025, KB-0026, KB-0027, KB-0028, KB-0029, KB-0030, KB-0031, KB-0032, KB-0033, KB-0034
