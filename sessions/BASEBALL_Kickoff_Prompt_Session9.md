# Ozark Joe's Baseball Daily Intelligence Report — Session 9 Kickoff Prompt

**Prepared:** 2026-05-02 (end of Session 8)
**Session Start:** Session 9
**Handoff:** V8 (Session 8) · V7 (Session 7) · V6 (Session 6) · V5 (Session 5) · V4 (Session 4) · V3 (Session 3) · V2 (Session 2) · V1 (Session 1)
**KB:** 32 entries (KB-0001 through KB-0032)
**CLAUDE.md:** v13
**Snapshot schema (main):** v6
**News snapshot schema:** v1 (NEW Session 8)
**Email template:** v3 (NEW Session 8)
**SW cache:** **v17** (rolled this session)
**APP_VERSION pill:** **v17** (rolled this session)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — v13: APP_VERSION pairing rule + Session-End Step 2 credentials.md mandate
2. **`sessions/BASEBALL_Handoff_Prompt_V8.md`** — Session 8 record (Phase B5 done)
3. **`sessions/BASEBALL_Handoff_Prompt_V7.md`** — Session 7 (Phase B4)
4. **`sessions/BASEBALL_Handoff_Prompt_V6.md`** — Session 6 (Phase B3)
5. **`sessions/BASEBALL_Handoff_Prompt_V5.md`** — Session 5 (Phase B2)
6. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (still authoritative for architecture)
7. **`docs/knowledge-base.md`** — 32 entries with statuses
8. **`docs/credentials.md`** — credentials inventory (no changes since Session 6)
9. **This file** (Kickoff Session 9) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md (v13) + Handoffs V8 → V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0028  T2  Owner+Claude   Pickleball-parity plan B6-B7 — ACTIVE ROADMAP (B1-B5 done)
     KB-0020  T2  Claude         Public on-demand refresh
     KB-0021  T2  Claude         Auto-reload on SW update
     KB-0013  —   Claude         On-This-Day seed expansion (content-only)

   OPEN (static awaiting owner action):
     KB-0024  —   Owner          Submission Worker — will revive in Phase B6 for AI proxy
   ```
3. **Check main snapshot freshness:**
   ```
   head -5 data/snapshots/latest.json
   ```
   Should show `schemaVersion: 6` and `generatedAt` within the last 24 hours.
4. **Check news snapshot freshness (NEW Session 8):**
   ```
   head -10 data/snapshots/news-latest.json
   ```
   Should show `schemaVersion: 1`, `ok: true`, and a `generatedAt` from this morning's cron.
5. **Daily-cron health check** — the 3-recipient v3-template scheduled-cron send is now LIVE. First v3 send was due 2026-05-03T07:00 UTC. Spot-check:
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   ```
   Latest scheduled run should be `success` with reasonable duration (likely 15-25s — slightly longer than v2 due to fetch-news step). Pull the run log if you want to confirm news was fetched: look for `[fetch-news] Wrote N items from M/M sources` and `[send-email] News: N items loaded`.
6. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   Next weekly-batch fire date: **Monday 2026-05-04**. If Session 9 happens after that, expect an Issue.
7. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
8. **Check GitHub Secrets state** — should still show 4 active secrets:
   ```
   gh secret list --repo jjmgladden/baseball-daily
   # Expected: EMAIL_FROM, EMAIL_RECIPIENTS, RESEND_API_KEY, YOUTUBE_API_KEY
   ```
9. **(Per CLAUDE.md v13 Session-End Step 2):** If any work this session touches credentials, plan to update `docs/credentials.md` at session-end. Phase B6 (if chosen) WILL trigger this — first new credential (`ANTHROPIC_API_KEY`) since the doc was created.
10. **Confirm no stale files need archiving** per versioning rules. None expected unless B6+ rolls a version.
11. **Verify APP_VERSION pill renders v17 on the live site** — quick visual: visit `https://jjmgladden.github.io/baseball-daily/` and confirm the small `V17` pill appears next to the brand name in the header. If still showing v16, the SW cache rule did its job — owner needs one hard-refresh to land on v17.
12. **Verify News tab on the live site** — click the 8th nav button "News". Should render the morning's items in Today/This Week/Recent buckets. Source line should show 6 source names with item counts.
13. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 8 — One Paragraph)

Single-track session executing **Pickleball-parity Phase B5 — News tab**. Owner ATP'd Option A from the kickoff (`ATP Phase B5`) after session-start confirmed all systems green. Eight deliverables shipped: (1) `ingestion/lib/rss-parser.js` — direct port of pickleball's RSS 2.0 + Atom 1.0 parser with baseball-specific User-Agent + `scope` field per item; no deps. (2) `data/master/news-sources.json` — 7 sources (3 league-wide T1: MLB.com / MLB Trade Rumors / ESPN MLB · 2 Cardinals T2: Viva El Birdos / Cardinals.com · 2 Nationals T2: Federal Baseball / MASN), with MASN as `enabled: false` placeholder pending RSS endpoint. (3) `ingestion/fetch-news.js` + `npm run fetch:news` — orchestrator with per-source error handling, MAX_PER_SOURCE=15, MAX_ITEMS=40, dedupe by URL + normalized title, sort newest-first, writes to `data/snapshots/news-latest.json` (separate from main snapshot per kickoff for independent freshness). (4-6) `app/js/components/confidence-badge.js` + `news-card.js` + `app/js/tabs/news.js` — direct ports adapted for baseball; news-card drops the unused date-utils import; news.js loads via new `loadNewsSnapshot()` from data-loader, renders Today/This Week/Recent buckets with `errorBannerHtml('fetch-failed')` on fetch-failure. (7) Wired into app shell — News button (8th nav slot), panel section, app.js routing case, data-loader exports, sw.js CACHE v16→v17 + 3 new SHELL_FILES, main.css News tab block + 3 badge-confidence variants. (8) Email template v2 → v3 — `archive/email-template_v2.js` archived; `email-template.js` rewritten with `buildEmail(snapshot, newsData?)` signature change + new `topNewsHtml()` rendering top 4 items between Notable Games and On This Day with tier-coded left-border colors + plain-text TOP NEWS section; `send-email.js` v2 → v3 reads news-latest.json defensively (graceful skip if missing/parse-error); `daily.yml` adds Fetch news headlines step before commit. APP_VERSION rolled v16 → v17 paired with SW cache. Verifications: `npm run fetch:news` populated 40 items from 6/6 enabled sources; `npm run check:esm` exits 0 with **22 OK modules** (was 19); local email dry-run rendered 32,704 bytes (vs 27,322 in v2); live browser smoke test confirmed v17 shell loads, News tab renders all 40 cards across Today + This Week with 6 T2 badges at correct color, no console errors. KB-0032 added; KB-0028 B5 sub-task marked done.

---

## Top Priorities for Session 9 — Pick ONE Main Track

The pickleball-parity plan (KB-0028) defines 2 remaining phases (B6-B7). With B5 shipped, **B6 is the highest-impact single phase** — biggest scope but biggest user-visible payoff (chat-style Q&A over the JSON corpus).

### Option A — **Phase B6: AI Q&A layer (~6-8 hr) — RECOMMENDED**

Largest single phase. Mirrors pickleball KB-0008 architecture end-to-end. Will create the **`ANTHROPIC_API_KEY`** for baseball (separate value from pickleball's; same Anthropic account) — **first `docs/credentials.md` update under CLAUDE.md v13's Step 2 mandate**. Also revives KB-0024 (Submission Worker code, repurposed for the AI proxy route).

Components:

1. **`ingestion/build-ai-context.js` (NEW)** — produces `data/snapshots/ai-context.json` from main snapshot + master files + news-latest.json. Aggressive denormalization for retrieval: stable IDs, ISO timestamps, source citations, T1/T2 confidence as first-class fields. Caps total size to fit Anthropic prompt cache + working budget.

2. **New Cloudflare Worker `baseball-daily-api.jjmgladden.workers.dev`** (revives KB-0024 with new purpose):
   - `/ask` route — primary; calls Anthropic API with system prompt + ai-context.json + user question
   - `/submit` route — KB-0024 submission code stays scaffolded behind a kill switch, can be activated later
   - Anthropic Haiku 4.5 (`claude-haiku-4-5-20251001`) with prompt caching enabled
   - Cost guards: monthly spend cap $5/mo (env-var enforced), per-IP rate limit 10/hr + 50/day, env-var kill switch `AI_DISABLED`
   - Owner needs new fine-grained GitHub PAT (Issues-write only, scoped to repo)

3. **`app/js/tabs/ask.js` (NEW)** — chat tab (9th nav slot). Question input, streaming answer display, "thinking..." indicator, error banner on rate-limit/network-fail.

4. **`data/master/ai-config.json` (NEW)** — browser-side gate. Worker URL, kill switch flag (so the tab can be hidden client-side too if owner flips a flag without redeploying), pre-canned prompt suggestions.

5. **Email v3 → v4(?)** — small footer addition: "Have a question? Ask the AI on the report site →". Decision point during execution: bump to v4 or fold into existing v3? Probably v3 stays — single small line in the existing footer.

**Triggers:** SW cache + APP_VERSION bump (paired). Pre-push ESM check on any `app/js/` change. New `ANTHROPIC_API_KEY` creation in Anthropic Console + paste into local `.env` + Wrangler secret upload — full credentials.md update flow per CLAUDE.md v13 Step 2.

### Option B — **Phase B7: TOC + accordion backport (~3-4 hr)**

Depends on B5 (done now). Refactors Cardinals tab + History tab + News tab to TOC + accordion pattern from pickleball KB-0040 Phase L1. Direct CSS port (`.tab-toc` / `.tab-section` / `.tab-callout` ~104 lines) + tab-by-tab refactor. Lower priority than B6 — visual polish on already-functional tabs.

### Option C — **Side task only (~30 min each)**

- On-This-Day expansion (KB-0013) — content-only
- Themed trivia batches via chat-prompt → Claude drafts → owner approves → applies
- Themed legend batches (Cardinals managers, WWII veterans, brothers in baseball, etc.)
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one
- **Auto-reload on SW update (KB-0021)** — could close as a small standalone item, ~15 lines in `app/js/app.js`. Now well-suited as a side task since the v17 SW cache bump just happened — next deploy after this would be the perfect first run with auto-reload active.
- **Themed news source expansion** — find MASN RSS endpoint and re-enable; or add a 2nd Cardinals beat (St. Louis Post-Dispatch?) and a 2nd Nationals beat

### Option D — **Status close**

If the morning email arrived clean for several days running with Top News rendering well across email clients, and the owner just wants a status check, a 5-min "everything green, see you next session" close is fine.

---

## Side Tasks (Interleave as Appropriate)

- On-This-Day expansion (KB-0013)
- Themed trivia/legend batches
- Cardinals-deep enrichment
- Auto-reload on SW update (KB-0021) — could fold into any session that touches `app/js/app.js`
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one (depending on when Session 9 starts)
- MASN RSS endpoint discovery + re-enable

---

## Expected Deliverables from Session 9

**Minimum:**
- Session-start protocol checks (especially the news-snapshot freshness verification, NEW)
- One main-track option (A-D) executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Updated `docs/credentials.md` (if any session work touches credentials — required by CLAUDE.md v13 Session-End Step 2; B6 WILL trigger this)
- Handoff V9 + Kickoff Session 10 at session end

**Ambitious (if main = B6):**
- B6 fully shipped (build-ai-context.js + Worker deploy + ask tab + ai-config.json + cost guards)
- KB-0028 B6 sub-task marked done
- KB-0024 status flipped (Submission code now part of the new Worker, scaffold-mode)
- 1 side task

---

## System State Snapshot (End of Session 8)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous; now also fetches news before email
- **Daily email:** **LIVE v3 with 3 recipients** (next scheduled cron will be the first to include Top News section)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Most recent commits (will be at Session 9 start):**
  - B5 commit + Session 8 close commit (this session)
  - `6daafba docs: 3-recipient scheduled-cron email verification cleared`
  - `63a7b55 docs: Session 7 close — Phase B4 complete; B5-B7 remain on pickleball-parity roadmap`
  - `c7125a1 feat: Phase B4 — APP_VERSION pill + iOS PNG icons + error-messages`
- **CLAUDE.md:** **v13** (unchanged Session 8)
- **SW cache:** **v17** (rolled Session 8)
- **APP_VERSION pill:** **v17** (rolled Session 8)
- **Snapshot schema (main):** v6
- **News snapshot schema:** **v1** (NEW Session 8)
- **Email template:** **v3** (NEW Session 8 — Top News section)
- **`fetch-daily.js`:** v6
- **`send-email.js`:** **v3**
- **`fetch-news.js`:** **NEW**
- **`rss-parser.js`:** **NEW**
- **GitHub Secrets:** 4 active (`EMAIL_FROM`, `EMAIL_RECIPIENTS` [3 addresses], `RESEND_API_KEY`, `YOUTUBE_API_KEY`)
- **Local `.env`:** 1 key only (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6` across all 3 workflows
- **Push-race protection:** active in daily.yml
- **`docs/credentials.md`:** v1 — no changes Session 8
- **`scripts/check-esm.js`:** active; `npm run check:esm` exits 0 with **22** modules (was 19)
- **`scripts/build-icons.js`:** unchanged
- **`app/icons/`:** 6 PNGs (unchanged)
- **News tab:** **LIVE** rendering 40 items from 6 sources across Today/This Week/Recent buckets
- **`data/master/news-sources.json`:** 7 sources defined, 6 enabled, MASN documented as disabled placeholder
- **Trivia questions:** 30 seeded (unchanged)
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at session close
- **Pickleball sibling project:** Session 9 closed 2026-04-28; baseball did not modify pickleball this session (read-only inspection of 7 files for B5 reference)

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` / `app/icons/` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md v13.)

2. **APP_VERSION pairing rule (active since Session 7)** — when bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/js/app.js` in the same commit. Pill in `app/index.html` displays the constant. No exceptions; B4 forward-debt escape clause is sunset.

3. **`node --check` misses ESM syntax errors** — run `npm run check:esm` before push for any `app/js/` changes. (Critical Rule in CLAUDE.md.) Tool now covers **22 modules**.

4. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden`. Don't remove.

5. **Approve ALL checkbox at top of weekly Issues** — preserved. Don't remove.

6. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in app + email v3.

7. **Pages needs 1-2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

8. **Email is LIVE v3 with 3 recipients — first v3 scheduled-cron send pending** — the cron will fire 07:00 UTC the morning after Session 8 close. Spot-check the most recent run's send-email step during Session 9 session-start; if anything looks off in any client, ask owner to screenshot and flag.

9. **Worker is not yet deployed (KB-0024)** — Suggest modal still shows "not yet configured" message. Will revive in Phase B6 with the AI Q&A route as primary purpose.

10. **Never commit `.env`** — `check-secrets.js` will flag it; gitignored anyway.

11. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing limited to: shared Resend account/key, shared YouTube API key, shared `glad-fam.com` Path B domain, shared Cloudflare account, shared Anthropic account. **All sharing posture documented in `docs/credentials.md`.**

12. **Cross-project secret transfer pattern** — when sharing a secret value, owner pastes once into receiving project's local `.env` (gitignored), Claude pipes via `gh secret set NAME --repo X` over stdin. NEVER echo secret values to chat. NEVER use `--body` flag.

13. **GitHub Secrets are write-only** — there is no `gh secret get` command. Source of truth is owner's password manager + the deployment locations (documented in `docs/credentials.md`).

14. **Single source-of-truth for email config** — Resend trio (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`) lives ONLY in GitHub Secrets, NOT in local `.env`.

15. **Snapshot schemas: main v6, news v1** — main has `todaysSchedule[]` + `todaysScheduleDate` top-level (Session 5 KB-0029). News has its own separate file with `{ schemaVersion: 1, generatedAt, ok, sources, items, errors }` (Session 8 KB-0032). Email template v3 reads both. Send-email loads news defensively — missing or parse-error means "no Top News section", not a failure.

16. **Always flag data-shape gaps before extending ingestion** — never silently bump snapshot schema or extend ingestion just because a kickoff implies a field exists.

17. **`app/js/app.js` MUST guard `main()` invocation with `typeof document !== 'undefined'`** — without it, `npm run check:esm` exits 1.

18. **CLAUDE.md v13 Session-End Step 2: update `docs/credentials.md` whenever credentials change.** Triggers: new key (B6 will trigger this with `ANTHROPIC_API_KEY`), rotation, revocation, status flip, location move.

19. **`scripts/build-icons.js` re-runnable.** If the SVG icon ever changes, `npm run build:icons` regenerates all 6 PNGs in place. Re-run + bump SW cache + APP_VERSION + commit.

20. **error-messages component for new tabs** — Session 8 News tab uses `errorBannerHtml('fetch-failed', { source: 'News snapshot' })` for fetch-failure. Future B6 ask tab MUST use the same helpers. Never leak raw `Error: ${err.message}` to users.

21. **`.claude/launch.json` exists.** Used by Claude Preview MCP for in-session browser smoke tests. If a future session needs the preview, the config is ready (port 1882, `npm run serve`).

22. **News separate from main snapshot** — `data/snapshots/news-latest.json` is INDEPENDENT from `data/snapshots/latest.json`. Each fetched by its own ingestion script. Each consumed independently (main snapshot by app's daily tab + email pins/standings/etc; news by app's news tab + email Top News section). DO NOT merge them. The separate-file architecture is load-bearing — it means broken news sources never break the main MLB briefing.

23. **MASN news source disabled placeholder** — `news-sources.json` lists MASN with `enabled: false` because no public RSS endpoint was located 2026-05-02. If discovered, set `enabled: true` + populate `feedUrl`; no code changes needed.

24. **Cloud cron now runs 4 steps, not 3** — `daily.yml` order is: Fetch daily data → Fetch news headlines → Commit and push → Send morning email. Run duration grew slightly (~15-25s vs ~12-20s in Session 7) due to 6 RSS fetches.

---

## Session-End Reminders (For When Session 9 Closes)

Per CLAUDE.md v13 § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. **(v13)** Update `docs/credentials.md` if any credentials touched this session (B6 will trigger this with `ANTHROPIC_API_KEY`)
3. Archive previous CLAUDE.md / data-schema versions if any rolled
4. Write `sessions/BASEBALL_Handoff_Prompt_V9.md` — full Session 9 record
5. Write `sessions/BASEBALL_Kickoff_Prompt_Session10.md` — concise start-here
6. List file changes for the owner
7. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
8. Report: what was done, what's next, blockers

---

**End of Kickoff Session 9. Phase B5 complete. SW cache + APP_VERSION rolled v16 → v17 in lockstep. Email template v2 → v3 with Top News section. News tab live (8th nav slot) with 40 items from 6 sources across Today/This Week/Recent buckets. `data/snapshots/news-latest.json` schema v1 introduced. `docs/credentials.md` is v1 (unchanged Session 8). KB-0032 added; KB-0028 B5 sub-task done. Two phases (B6-B7) remain on the pickleball-parity roadmap.**

**Main-track choice is yours:**
- **A — Phase B6 (AI Q&A)** — recommended next, ~6-8 hr; first new credential under v13 Step 2
- **B — Phase B7 (TOC+accordion backport)** — visual polish, ~3-4 hr
- **C — Side tasks only** — KB-0021 close (auto-reload), MASN endpoint discovery, content expansion
- **D — Status close** — quick "everything green" session
