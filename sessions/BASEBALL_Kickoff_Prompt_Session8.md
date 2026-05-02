# Ozark Joe's Baseball Daily Intelligence Report — Session 8 Kickoff Prompt

**Prepared:** 2026-05-02 (end of Session 7)
**Session Start:** Session 8
**Handoff:** V7 (Session 7) · V6 (Session 6) · V5 (Session 5) · V4 (Session 4) · V3 (Session 3) · V2 (Session 2) · V1 (Session 1)
**KB:** 31 entries (KB-0001 through KB-0031)
**CLAUDE.md:** v13
**Snapshot schema:** v6
**Email template:** v2
**SW cache:** **v16** (rolled this session)
**APP_VERSION pill:** **v16** (NEW — introduced this session, pairing rule now active going forward)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — v13: APP_VERSION pairing rule + Session-End Step 2 credentials.md mandate
2. **`sessions/BASEBALL_Handoff_Prompt_V7.md`** — Session 7 record (Phase B4 done)
3. **`sessions/BASEBALL_Handoff_Prompt_V6.md`** — Session 6 (Phase B3)
4. **`sessions/BASEBALL_Handoff_Prompt_V5.md`** — Session 5 (Phase B2)
5. **`sessions/BASEBALL_Handoff_Prompt_V4.md`** — Session 4 (Phase B1)
6. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (still authoritative for architecture)
7. **`docs/knowledge-base.md`** — 31 entries with statuses
8. **`docs/credentials.md`** — credentials inventory (no changes since Session 6)
9. **This file** (Kickoff Session 8) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md (v13) + Handoffs V7 → V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0028  T2  Owner+Claude   Pickleball-parity plan B5-B7 — ACTIVE ROADMAP (B1-B4 done)
     KB-0020  T2  Claude         Public on-demand refresh
     KB-0021  T2  Claude         Auto-reload on SW update
     KB-0013  —   Claude         On-This-Day seed expansion (content-only)

   OPEN (static awaiting owner action):
     KB-0024  —   Owner          Submission Worker — will revive in Phase B6 for AI proxy
   ```
3. **Check snapshot freshness:**
   ```
   head -5 data/snapshots/latest.json
   ```
   Should show `schemaVersion: 6` and `generatedAt` within the last 24 hours.
4. **Daily-cron health check** — the 3-recipient scheduled send was verified clean at the end of Session 7 (owner confirmed all 3 inboxes received the morning email; KB-0025 + KB-0028 updated). Going forward this is a routine spot-check, not a critical verification:
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   ```
   Last run should show `success` with reasonable duration (~12-20s). If anything looks off, dig into the send-email step.
5. (If anything looked off in step 4, ask the owner to confirm inbox delivery.)
6. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   Next weekly-batch fire date: **Monday 2026-05-04**. If Session 8 happens after that, expect an Issue.
7. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
8. **Check GitHub Secrets state** — should still show 4 active secrets (no expected change since Session 6):
   ```
   gh secret list --repo jjmgladden/baseball-daily
   # Expected: EMAIL_FROM, EMAIL_RECIPIENTS, RESEND_API_KEY, YOUTUBE_API_KEY
   ```
9. **NEW (per CLAUDE.md v13 Session-End Step 2):** If any work this session touches credentials, plan to update `docs/credentials.md` at session-end. Phase B6 (if chosen) WILL trigger this — first new credential since the doc was created.
10. **Confirm no stale files need archiving** per versioning rules. None expected unless B5+ rolls a version.
11. **Verify APP_VERSION pill renders on the live site** — quick visual: visit `https://jjmgladden.github.io/baseball-daily/` and confirm the small `V16` pill appears next to the brand name in the header. If the deployed site still shows the old shell (no pill), the SW cache rule did its job — owner needs one hard-refresh to land on the v16 shell.
12. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 7 — One Paragraph)

Single-track session executing **Pickleball-parity Phase B4 — UI polish**. Owner ATP'd Option A from the kickoff with `ATP Phase B4`. Three primary deliverables shipped + one audit-only deliverable resolved by skip: (1) iOS PNG icon set via new `scripts/build-icons.js` + `sharp ^0.33.5` devDep — generated 6 PNGs (4 apple-touch-icon variants + 2 manifest sizes) into `app/icons/`, manifest + index.html + SHELL_FILES all extended; **closes long-standing KB-0007**. (2) APP_VERSION pill introduced in app header — `<span id="app-version">` in `.brand` div, `const APP_VERSION = 'v16'` declared in `app/js/app.js`, paired with SW cache `v15 → v16` per CLAUDE.md v13 rule; **sunsets the B4 forward-debt escape clause**. (3) `app/js/components/error-messages.js` ported from pickleball with baseball-specific MESSAGES (added `snapshot-missing` / `index-missing`; dropped pickleball-only `playwright-not-installed`); `.soft-banner` + `.freshness-tag` CSS added; retrofit applied to daily-tab snapshot-load failure (renderNoSnapshot now accepts error param) and players-tab index-missing path (no longer leaks raw `Error: ...`). (4) `date-utils.js` audit — grepped baseball app/js for `new Date(`; all calls take full ISO timestamps with time+Z, zero off-by-one risk found; port skipped per "don't add features beyond task" rule. Verified: `npm run build:icons` produced 6 PNGs cleanly, `npm run check:esm` exit 0 with 19 OK modules (was 18; +error-messages.js), live browser smoke test via Claude Preview MCP confirmed pill renders "V16" with computed `--text-muted` color, snapshot loads, 4 apple-touch-icon links present in head, no console errors. KB-0031 added; KB-0028 B4 sub-task marked done; KB-0007 closed. Email-verification of the 3-recipient scheduled cron deferred to Session 8 per session-start protocol surfacing that the cron hadn't fired yet at 04:21 UTC (now triple-deferred — Sessions 5, 6, 7).

---

## Top Priorities for Session 8 — Pick ONE Main Track

The pickleball-parity plan (KB-0028) defines 3 remaining phases (B5-B7). **B5 is the natural next step** — establishes news-source pattern that B6's AI context bundle will benefit from.

### Option A — **Phase B5: News tab (RECOMMENDED, ~3-4 hr)**

Direct port of pickleball KB-0035:

1. **`ingestion/lib/rss-parser.js`** — RSS 2.0 + Atom 1.0 with auto-detection (no deps; pure regex/string parsing per pickleball pattern). Handles common quirks: CDATA, HTML entities, missing `<lastBuildDate>`, malformed XML.

2. **`ingestion/fetch-news.js`** — orchestrator. Reads source list from `data/master/news-sources.json` (NEW). Fetches each, parses via rss-parser, dedupes by URL + normalized title, sorts newest-first, applies `MAX_PER_SOURCE=15` + `MAX_ITEMS=40` caps. Writes to `data/snapshots/news-latest.json` (separate from main snapshot — independent freshness).

3. **7 sources** (3 league-wide + 2 Cardinals-specific + 2 Nationals-specific):
   - MLB.com (T1) — `https://www.mlb.com/feeds/news/rss.xml` (verify URL)
   - MLB Trade Rumors (T1) — `https://www.mlbtraderumors.com/feed`
   - ESPN MLB (T1) — `https://www.espn.com/espn/rss/mlb/news`
   - Viva El Birdos (T2 — Cardinals SBNation) — `https://www.vivaelbirdos.com/rss/index.xml`
   - Cardinals.com (T2) — `https://www.mlb.com/cardinals/feeds/news/rss.xml` (verify)
   - Federal Baseball (T2 — Nationals SBNation) — `https://www.federalbaseball.com/rss/index.xml`
   - MASN (T2 — Nationals broadcast) — TBD URL; flag if not findable

4. **`app/js/components/news-card.js`** — single news item card render
5. **`app/js/components/confidence-badge.js`** — T1/T2 source-confidence badge (port from pickleball)
6. **`app/js/tabs/news.js`** — Today/This Week/Recent buckets; new tab in nav
7. **`.github/workflows/daily.yml`** — add `node ingestion/fetch-news.js` step before commit
8. **Email v2 → v3 (?)** — append "Top News" section. Decision point: bump email template to v3 or fold into existing v2? Probably v3 since it's a section addition.

**Triggers:** SW cache + APP_VERSION bump (paired). Pre-push ESM check on any `app/js/` change. Whole-number version bump for email template (v2 → v3) and possibly `fetch-daily.js` if news lands in main snapshot. Likely separate news-snapshot keeps it cleaner.

### Option B — **Phase B6: AI Q&A layer (~6-8 hr)**

Largest single phase. Mirrors pickleball KB-0008 architecture end-to-end. **Recommend doing this AFTER B5** for context-bundle quality. Will create the `ANTHROPIC_API_KEY` for baseball (separate value from pickleball's; same Anthropic account) — **first credentials.md update under v13's Step 2 mandate**.

Components:
- `ingestion/build-ai-context.js` → `data/snapshots/ai-context.json`
- New Cloudflare Worker `baseball-daily-api.jjmgladden.workers.dev` (revives KB-0024 with new purpose)
- Anthropic Haiku 4.5 with prompt caching (use `claude-haiku-4-5-20251001` model ID)
- Cost guards (spend cap $5/mo, per-IP rate limit, env-var kill switch)
- `app/js/tabs/ask.js` chat tab (8th nav slot)
- `data/master/ai-config.json` browser-side gate

### Option C — **Phase B7: TOC + accordion backport (~3-4 hr)**

Depends on B5 done. Refactors Cardinals tab + History tab + News tab to TOC + accordion pattern from pickleball KB-0040 Phase L1.

### Option D — **Side task only (~30 min each)**

- On-This-Day expansion (KB-0013) — content-only
- Themed trivia batches via chat-prompt → Claude drafts → owner approves → applies
- Themed legend batches (Cardinals managers, WWII veterans, brothers in baseball, etc.)
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one
- Auto-reload on SW update (KB-0021) — could close as a small standalone item, ~15 lines in `app/js/app.js`

### Option E — **Status close**

If the 3-recipient morning email arrived clean for several days running and owner just wants a status check, a 5-min "everything green, see you next session" close is fine.

---

## Side Tasks (Interleave as Appropriate)

- On-This-Day expansion (KB-0013)
- Themed trivia/legend batches
- Cardinals-deep enrichment
- Marquee selection algorithm tuning if owner has feedback after a few days of v2 emails
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one (depending on when Session 8 starts)
- Close KB-0021 (auto-reload on SW update) if combined with another `app/js/app.js` change

---

## Expected Deliverables from Session 8

**Minimum:**
- Session-start protocol checks (especially the 3-recipient cron verification — TRIPLE-deferred now)
- One main-track option (A-E) executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Updated `docs/credentials.md` (if any session work touches credentials — required by CLAUDE.md v13 Session-End Step 2; B6 will trigger this)
- Handoff V8 + Kickoff Session 9 at session end

**Ambitious (if main = B5):**
- B5 fully shipped (rss-parser + fetch-news + 7 sources + news-card + confidence-badge + news tab + workflow step + email v2 → v3)
- KB-0028 B5 sub-task marked done
- 1 side task

---

## System State Snapshot (End of Session 7)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous
- **Daily email:** **LIVE v2 with 3 recipients** (first scheduled multi-recipient send pending — triple-deferred verification)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Most recent commits (will be at Session 8 start):**
  - B4 commit + Session 7 close commit (this session)
  - `78b9b7a docs: Session 6 close — Phase B3 complete; B4-B7 remain on pickleball-parity roadmap`
  - `e9a2e4b feat: Phase B3 — credentials.md + CLAUDE.md v13 + check-esm.js`
- **CLAUDE.md:** **v13** (unchanged Session 7)
- **SW cache:** **v16** (rolled Session 7)
- **APP_VERSION pill:** **v16** (NEW Session 7)
- **Snapshot schema:** v6
- **Email template:** v2
- **`fetch-daily.js`:** v6
- **`send-email.js`:** v2
- **GitHub Secrets:** 4 active (`EMAIL_FROM`, `EMAIL_RECIPIENTS` [3 addresses], `RESEND_API_KEY`, `YOUTUBE_API_KEY`)
- **Local `.env`:** 1 key only (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6` across all 3 workflows
- **Push-race protection:** active in daily.yml
- **`docs/credentials.md`:** v1 — no changes Session 7
- **`scripts/check-esm.js`:** active; `npm run check:esm` exits 0 with 19 modules (was 18; +error-messages.js)
- **`scripts/build-icons.js`:** NEW — re-runnable when icon.svg changes
- **`app/icons/`:** 6 PNGs (180/167/152/120 apple-touch + 192/512 manifest)
- **`app/js/components/error-messages.js`:** NEW — used by app.js + players.js
- **App-side bootstrap:** `app/js/app.js` retains `typeof document` guard from Session 6; +APP_VERSION constant + pill wiring + error-messages
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at session close
- **Pickleball sibling project:** Session 9 closed 2026-04-28; Session 10 awaiting owner; baseball did not modify pickleball this session (read-only inspection of 5 files for B4 reference)

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` / `app/icons/` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md v13.)

2. **APP_VERSION pairing rule (active as of Session 7)** — when bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/js/app.js` in the same commit. Pill in `app/index.html` displays the constant. The B4 forward-debt escape clause is **SUNSET** — every shell change from Session 8 onward must roll BOTH together. No exceptions.

3. **`node --check` misses ESM syntax errors** — run `npm run check:esm` before push for any `app/js/` changes. (Critical Rule in CLAUDE.md.) Tool now covers 19 modules.

4. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden`. Don't remove.

5. **Approve ALL checkbox at top of weekly Issues** — preserved. Don't remove.

6. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in app + email v2.

7. **Pages needs 1-2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

8. **Email is LIVE with 3 recipients — verified clean end of Session 7** — failure mode is still silent (`[send-email] RESEND_API_KEY not set` would skip silently and exit 0). Spot-check the most recent run's send-email step during session-start; if anything looks off, ask owner to confirm inbox delivery.

9. **Worker is not yet deployed (KB-0024)** — Suggest modal still shows "not yet configured" message. Will revive in Phase B6.

10. **Never commit `.env`** — `check-secrets.js` will flag it; gitignored anyway.

11. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing limited to: shared Resend account/key, shared YouTube API key, shared `glad-fam.com` Path B domain, shared Cloudflare account, shared Anthropic account. **All sharing posture documented in `docs/credentials.md`.**

12. **Cross-project secret transfer pattern** — when sharing a secret value, owner pastes once into receiving project's local `.env` (gitignored), Claude pipes via `gh secret set NAME --repo X` over stdin. NEVER echo secret values to chat. NEVER use `--body` flag.

13. **GitHub Secrets are write-only** — there is no `gh secret get` command. Source of truth is owner's password manager + the deployment locations (documented in `docs/credentials.md`).

14. **Single source-of-truth for email config** — Resend trio (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`) lives ONLY in GitHub Secrets, NOT in local `.env`.

15. **Snapshot schema is v6** — `todaysSchedule[]` + `todaysScheduleDate` are top-level fields. Email template v2 reads them. App tabs ignore unknown fields gracefully.

16. **Always flag data-shape gaps before extending ingestion** — never silently bump snapshot schema or extend ingestion just because a kickoff implies a field exists.

17. **`app/js/app.js` MUST guard `main()` invocation with `typeof document !== 'undefined'`** — without it, `npm run check:esm` exits 1.

18. **CLAUDE.md v13 Session-End Step 2: update `docs/credentials.md` whenever credentials change.** Triggers: new key (B6 will trigger this), rotation, revocation, status flip, location move.

19. **NEW (Session 7) — `scripts/build-icons.js` re-runnable.** If the SVG icon ever changes, `npm run build:icons` regenerates all 6 PNGs in place. Re-run + bump SW cache + APP_VERSION + commit.

20. **NEW (Session 7) — error-messages component for new tabs.** B5's news tab + B6's ask tab MUST use `errorBannerHtml()` from day one for any failure path. Never leak raw `Error: ${err.message}` to users.

21. **NEW (Session 7) — `.claude/launch.json` exists.** Used by Claude Preview MCP for in-session browser smoke tests. If a future session needs to use the preview, the config is ready (port 1882, npm run serve).

22. **Date-utils audit conclusion (Session 7)** — baseball has zero off-by-one risk. No `new Date("YYYY-MM-DD")` patterns exist. Port was skipped. If a future session adds raw date-string parsing, evaluate whether to introduce date-utils then.

---

## Session-End Reminders (For When Session 8 Closes)

Per CLAUDE.md v13 § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. **(v13)** Update `docs/credentials.md` if any credentials touched this session (B6 will trigger this with `ANTHROPIC_API_KEY`)
3. Archive previous CLAUDE.md / data-schema versions if any rolled
4. Write `sessions/BASEBALL_Handoff_Prompt_V8.md` — full Session 8 record
5. Write `sessions/BASEBALL_Kickoff_Prompt_Session9.md` — concise start-here
6. List file changes for the owner
7. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
8. Report: what was done, what's next, blockers

---

**End of Kickoff Session 8. Daily email v2 with 3 recipients still has its first scheduled multi-recipient send pending verification (TRIPLE-deferred — Sessions 5+6+7). Phase B4 complete. CLAUDE.md is v13 (unchanged Session 7). SW cache is v16. APP_VERSION pill is v16 — pairing rule now active. KB-0007 closed. `app/icons/` + `scripts/build-icons.js` + `app/js/components/error-messages.js` are live. Three phases (B5-B7) remain on the pickleball-parity roadmap.**

**Main-track choice is yours:**
- **A — Phase B5 (News tab)** — recommended, ~3-4 hr
- **B — Phase B6 (AI Q&A)** — largest, ~6-8 hr; recommend after B5
- **C — Phase B7 (TOC+accordion backport)** — depends on B5
- **D — Side tasks only** — content expansion, KB-0021 close, etc.
- **E — Status close** — quick "everything green" session
