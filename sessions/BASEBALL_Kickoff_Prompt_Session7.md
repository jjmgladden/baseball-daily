# Ozark Joe's Baseball Daily Intelligence Report — Session 7 Kickoff Prompt

**Prepared:** 2026-05-02 (end of Session 6)
**Session Start:** Session 7
**Handoff:** V6 (Session 6) · V5 (Session 5) · V4 (Session 4) · V3 (Session 3) · V2 (Session 2) · V1 (Session 1)
**KB:** 30 entries (KB-0001 through KB-0030)
**CLAUDE.md:** **v13** (rolled this session)
**Snapshot schema:** v6
**Email template:** v2
**SW cache:** **v15** (rolled this session)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — **v13**: now includes APP_VERSION pairing rule + Session-End Step 2 credentials.md mandate
2. **`sessions/BASEBALL_Handoff_Prompt_V6.md`** — Session 6 record (Phase B3 done)
3. **`sessions/BASEBALL_Handoff_Prompt_V5.md`** — Session 5 (Phase B2)
4. **`sessions/BASEBALL_Handoff_Prompt_V4.md`** — Session 4 (Phase B1)
5. **`sessions/BASEBALL_Handoff_Prompt_V3.md`** — Session 3 (Pickleball sibling-project bootstrap)
6. **`sessions/BASEBALL_Handoff_Prompt_V2.md`** — Session 2 (email feature code shipped)
7. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (original full build; still authoritative for architecture)
8. **`docs/knowledge-base.md`** — 30 entries with statuses
9. **`docs/credentials.md`** — NEW canonical credentials inventory (created Session 6); skim once to know it exists
10. **This file** (Kickoff Session 7) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md (v13) + Handoffs V6 → V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0028  T2  Owner+Claude   Pickleball-parity plan B4-B7 — ACTIVE ROADMAP (B1, B2, B3 done)
     KB-0020  T2  Claude         Public on-demand refresh
     KB-0021  T2  Claude         Auto-reload on SW update
     KB-0007  T3  Claude         PNG icon set for iOS — will close in Phase B4
     KB-0013  —   Claude         On-This-Day seed expansion (content-only)

   OPEN (static awaiting owner action):
     KB-0024  —   Owner          Submission Worker — will revive in Phase B6 for AI proxy
   ```
3. **Check snapshot freshness:**
   ```
   head -5 data/snapshots/latest.json
   ```
   Should show `schemaVersion: 6` and `generatedAt` within the last 24 hours (07:00 UTC daily cron).
4. **CRITICAL: Verify the FIRST-EVER 3-recipient v2 email scheduled cron delivered cleanly.** This is **deferred from both Session 5 AND Session 6** — it has now had a full additional 24 hours since Session 6 closed for the natural cron to fire. Two failure modes to watch for:
   - **Silent email failure** — `[send-email] RESEND_API_KEY not set` or any non-200 Resend response. Workflow exits 0 even on skip — green workflow does NOT prove email arrived.
   - **Push-race retry triggering** — first scheduled cron with concurrency group + retry-with-rebase loop in active production traffic. If the loop fires, that's still success but worth noting.
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   gh run view <latest-scheduled-run-id> --repo jjmgladden/baseball-daily --log | grep -E '\[send-email\]|Resend id|Sent\.|Push attempt|main -> main|Recipients'
   ```
   Look for: **`Recipients: 3`** + `Sent. Resend id: ...` + clean push (`main -> main` on first attempt).
5. **Confirm with owner that all 3 recipients received the email in their inboxes.** Schedule and Resend may report success but a recipient might still be missing it (spam folder, address typo, etc.).
6. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   Next weekly-batch fire date after Session 6 close: **Monday 2026-05-04**. If Session 7 happens after that, expect an Issue.
7. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
8. **Check GitHub Secrets state** — should still show 4 active secrets (no expected change since Session 6):
   ```
   gh secret list --repo jjmgladden/baseball-daily
   # Expected: EMAIL_FROM, EMAIL_RECIPIENTS, RESEND_API_KEY, YOUTUBE_API_KEY
   ```
9. **NEW (per CLAUDE.md v13 Session-End Step 2):** If any work this session touches credentials, plan to update `docs/credentials.md` at session-end.
10. **Confirm no stale files need archiving** per versioning rules. None expected unless B4 or later phases roll a version.
11. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 6 — One Paragraph)

Single-track session executing **Pickleball-parity Phase B3 — process improvements + CLAUDE.md v13**. Owner gave terse delegation ("you are doing the work") after Claude recommended Option A. Three primary deliverables shipped: (1) `docs/credentials.md` ported from pickleball — full inventory + sibling-sharing posture; (2) CLAUDE.md v12 → v13 — adds APP_VERSION pairing Critical Rule (B4 forward-debt) + Session-End Step 2 mandating credentials.md updates whenever credentials change; (3) `scripts/check-esm.js` + `npm run check:esm` script. First check:esm run revealed baseball's `app/js/app.js` calls `main()` synchronously at module load and triggers `window is not defined` async-rejection — exit 1, useless as a gate. Fix: applied `if (typeof document !== 'undefined') main();` guard mirroring pickleball's pattern. That `app/` change triggered the SW cache rule → CACHE v14 → v15. APP_VERSION pairing not yet applicable (pill is added in B4); commit message flags this as B4 forward-debt per the new rule's escape clause. Re-ran check:esm: 18 OK, exit 0. ✓ KB-0030 added; KB-0028 B3 sub-task marked done. Email-verification of the 3-recipient scheduled cron deferred to Session 7 per owner direction.

---

## Top Priorities for Session 7 — Pick ONE Main Track

The pickleball-parity plan (KB-0028) defines 4 remaining phases (B4-B7). **B4 is the natural next step** — it uses B3's APP_VERSION pairing rule and closes the long-standing iOS PNG icon item (KB-0007).

### Option A — **Phase B4: UI polish (RECOMMENDED, ~2-3 hr)**

Four deliverables:

1. **APP_VERSION pill in `app/index.html` header** — visible version label (e.g., `v15` or `v16` after this session's bumps). Paired with SW CACHE constant per B3's pairing rule. Establishes the visible-version-pill pattern; sunsets the "B4 forward-debt" escape clause from the v13 rule.

2. **iOS PNG icons via `scripts/build-icons.js` + `sharp`** — port from pickleball's icon-generation pattern. Generate 180×180, 192×192, 512×512 PNGs from `app/icon.svg`. Add `<link rel="apple-touch-icon">` to index.html. Update `app/manifest.webmanifest` with PNG entries. Add to `SHELL_FILES` in `app/sw.js`. **Closes KB-0007** (T3 → Closed).

3. **`error-messages.js` component** — port from pickleball KB-0021 item 4. Severity-gated soft-banner pattern. Retrofit baseball tabs (mainly `daily.js` for snapshot-load failures and `players.js` for index-load failures).

4. **`date-utils.js` audit + port if needed** — check baseball date rendering for UTC→local off-by-one (pickleball KB-0016 pattern: a snapshot date in YYYY-MM-DD parses as UTC midnight, displays as previous day in negative-offset timezones). Port `parseLocalDate` + `fmtDateShort` helpers if any baseball date renders off-by-one.

**Triggers:** SW cache + APP_VERSION bump (paired). Pre-push ESM check on any `app/js/` change. Whole-number version bump if any schema rolls (none expected).

**Files touched (estimated):**
```
A  scripts/build-icons.js                 (NEW; ~30 lines)
A  app/icon-180.png                       (NEW; ~8KB)
A  app/icon-192.png                       (NEW; ~10KB)
A  app/icon-512.png                       (NEW; ~30KB)
M  app/index.html                         (+APP_VERSION pill, +apple-touch-icon link)
M  app/manifest.webmanifest               (+PNG icon entries)
M  app/sw.js                              (CACHE v15 → v16, +PNGs in SHELL_FILES)
A  app/js/components/error-messages.js    (NEW; ~50 lines)
M  app/js/tabs/daily.js                   (retrofit error-messages)
M  app/js/tabs/players.js                 (retrofit error-messages)
A  app/js/utils/date-utils.js             (NEW if any baseball date is off-by-one; otherwise skip)
M  package.json                           (sharp devDep + build:icons script)
M  docs/knowledge-base.md                 (KB-00XX entry for B4 closure; close KB-0007)
```

### Option B — **Phase B5: News tab (~3-4 hr)**

Direct port of pickleball KB-0035:
- `ingestion/lib/rss-parser.js` — RSS 2.0 + Atom 1.0 with auto-detection (no deps)
- `ingestion/fetch-news.js` — orchestrator, dedupe by URL + normalized title, sort newest-first, `MAX_PER_SOURCE=15` + `MAX_ITEMS=40`
- 7 sources: MLB.com + MLB Trade Rumors + ESPN MLB + Viva El Birdos + Cardinals.com + Federal Baseball + MASN
- `app/js/components/news-card.js` + `confidence-badge.js`
- `app/js/tabs/news.js` — Today/This Week/Recent buckets
- Top News section appended to email v2 template

**Triggers:** SW cache + APP_VERSION bump. Pre-push ESM check.

### Option C — **Phase B6: AI Q&A layer (~6-8 hr)**

Largest single phase. Mirrors pickleball KB-0008 architecture end-to-end. **Recommend doing this AFTER B4-B5 ship** for context-bundle quality. Will create the `ANTHROPIC_API_KEY` for baseball (separate value from pickleball's; same Anthropic account) — first credentials.md update under v13's Step 2 mandate.

### Option D — **Phase B7: TOC + accordion backport (~3-4 hr)**

Depends on B5 done. Refactors Cardinals tab + History tab + News tab to TOC + accordion pattern from pickleball KB-0040 Phase L1.

### Option E — **Side task only (~30 min each)**

- On-This-Day expansion (KB-0013) — content-only
- Themed trivia batches via chat-prompt → Claude drafts → owner approves → applies
- Themed legend batches (Cardinals managers, WWII veterans, brothers in baseball, etc.)
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one

### Option F — **Status close**

Cron is autonomous. If the morning email arrived clean for several days running and owner just wants a status check, this can be a 5-min "everything green, see you next session" close.

---

## Side Tasks (Interleave as Appropriate)

Same as before:
- On-This-Day expansion
- Themed trivia/legend batches
- Cardinals-deep enrichment
- Marquee selection algorithm tuning if owner has feedback after a few days of v2 emails
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one (depending on when Session 7 starts)

---

## Expected Deliverables from Session 7

**Minimum:**
- Session-start protocol checks (especially the 3-recipient cron verification — twice-deferred now)
- One main-track option (A-F) executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Updated `docs/credentials.md` (if any session work touches credentials — required by CLAUDE.md v13 Session-End Step 2)
- Handoff V7 + Kickoff Session 8 at session end

**Ambitious (if main = B4):**
- B4 fully shipped (APP_VERSION pill + iOS PNGs + error-messages component + date-utils if needed)
- KB-0007 closed; KB-0028 B4 sub-task marked done
- 1 side task

---

## System State Snapshot (End of Session 6)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous
- **Daily email:** **LIVE v2 with 3 recipients** (first scheduled multi-recipient send pending — twice-deferred verification)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Most recent commits (will be at Session 7 start):**
  - B3 commit + Session 6 close commit (this session)
  - `8a8a42b Daily snapshot 2026-05-02` (Session 5 workflow auto-push)
  - `223550e feat: Phase B2 — email template v2 + snapshot schema v6 (Today's Schedule)`
- **CLAUDE.md:** **v13** (rolled Session 6)
- **SW cache:** **v15** (rolled Session 6 — triggered by `app/js/app.js` `typeof document` guard)
- **Snapshot schema:** v6
- **Email template:** v2
- **`fetch-daily.js`:** v6
- **`send-email.js`:** v2
- **GitHub Secrets:** 4 active (`EMAIL_FROM`, `EMAIL_RECIPIENTS` [3 addresses], `RESEND_API_KEY`, `YOUTUBE_API_KEY`)
- **Local `.env`:** 1 key only (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6` across all 3 workflows
- **Push-race protection:** active in daily.yml
- **`docs/credentials.md`:** v1 — baseline of 4 active credentials documented
- **`scripts/check-esm.js`:** active; `npm run check:esm` exits 0 on current `app/js/`
- **App-side bootstrap:** `app/js/app.js` guarded with `typeof document` check (zero browser impact)
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at session close
- **Pickleball sibling project:** Session 9 closed 2026-04-28; Session 10 awaiting owner; baseball did not modify pickleball this session (read-only inspection of 4 files for B3 reference)

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md v13.) Session 6 triggered this via the `app/js/app.js` guard fix → CACHE v14 → v15.

2. **APP_VERSION pairing rule (NEW v13)** — when bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/index.html` header pill in the same commit. Pill is created in **Phase B4**; until then, this rule applies forward-only with the documented "B4 forward-debt" escape clause. Session 6 used the escape clause; Session 7 (if it does B4) sunsets it.

3. **`node --check` misses ESM syntax errors** — run `npm run check:esm` before push for any `app/js/` changes. (Critical Rule in CLAUDE.md.) New tool added in Session 6; integrate into pre-push habit.

4. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden`. Don't remove.

5. **Approve ALL checkbox at top of weekly Issues** — preserved. Don't remove.

6. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in app + email v2. Pickleball confirmed PPA + MLP allow embedding (KB-0013 there); baseball does NOT.

7. **Pages needs 1-2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

8. **Email is LIVE with 3 recipients** — failure mode is silent. `[send-email] RESEND_API_KEY not set` would skip silently and exit 0; the cron would look green but no email would arrive. Always check the most recent run's send-email step output during session-start. **First 3-recipient scheduled v2 send is TWICE-deferred (Sessions 5 + 6) — verify FIRST THING in Session 7.**

9. **Worker is not yet deployed (KB-0024)** — Suggest modal still shows "not yet configured" message. Will revive in Phase B6.

10. **Never commit `.env`** — `check-secrets.js` will flag it; gitignored anyway. Owner has cleaned `.env` to only `YOUTUBE_API_KEY`.

11. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing is limited to: shared Resend account/key, shared YouTube API key, shared `glad-fam.com` Path B domain, shared Cloudflare account, shared Anthropic account. **All sharing posture is now documented in `docs/credentials.md` § Sibling-project sharing posture (NEW Session 6).**

12. **Cross-project secret transfer pattern (Session 4)** — when sharing a secret value between projects, owner pastes once into receiving project's local `.env` (gitignored), Claude pipes via `gh secret set NAME --repo X` over stdin. NEVER echo secret values to chat. NEVER use `--body` flag.

13. **GitHub Secrets are write-only** — there is no `gh secret get` command. Source of truth is owner's password manager + the deployment locations (now documented in `docs/credentials.md`).

14. **Single source-of-truth for email config** — Resend trio (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`) lives ONLY in GitHub Secrets, NOT in local `.env`. If a future session needs to test email locally, supply env vars inline on the command line: `RESEND_API_KEY=re_... EMAIL_RECIPIENTS=test@me.com EMAIL_DRY_RUN=1 node ingestion/send-email.js`.

15. **Snapshot schema is v6** — `todaysSchedule[]` + `todaysScheduleDate` are top-level fields produced by `fetch-daily.js` v6. Email template v2 reads them. App tabs ignore unknown fields gracefully (forward-compat).

16. **Always flag data-shape gaps before extending ingestion (Session 5)** — never silently bump snapshot schema or extend ingestion just because a kickoff implies a field exists. Always verify and flag.

17. **NEW (Session 6) — `app/js/app.js` MUST guard `main()` invocation with `typeof document !== 'undefined'`** — without it, `npm run check:esm` exits 1 because Node import triggers `window is not defined` from splash.js. Mirror pickleball's pattern. If a future session refactors app.js, preserve the guard at the bottom (or use a `DOMContentLoaded` listener instead).

18. **NEW (Session 6) — CLAUDE.md v13 Session-End Step 2: update `docs/credentials.md` whenever credentials change.** Triggers: new key, rotation, revocation, status flip, location move. Update inventory table + per-credential detail section + maintenance log entry. Doc never lists actual values.

---

## Session-End Reminders (For When Session 7 Closes)

Per CLAUDE.md v13 § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. **(NEW v13)** Update `docs/credentials.md` if any credentials touched this session
3. Archive previous CLAUDE.md / data-schema versions if any rolled
4. Write `sessions/BASEBALL_Handoff_Prompt_V7.md` — full Session 7 record
5. Write `sessions/BASEBALL_Kickoff_Prompt_Session8.md` — concise start-here
6. List file changes for the owner
7. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
8. Report: what was done, what's next, blockers

---

**End of Kickoff Session 7. Daily email v2 with 3 recipients still has its first scheduled multi-recipient send pending verification (twice-deferred). Phase B3 complete. CLAUDE.md is now v13. SW cache is v15. `docs/credentials.md` and `scripts/check-esm.js` are live. Four phases (B4-B7) remain on the roadmap.**

**Main-track choice is yours:**
- **A — Phase B4 (UI polish + closes KB-0007 iOS PNGs + sunsets B4-forward-debt escape clause)** — recommended, ~2-3 hr
- **B — Phase B5 (News tab)** — ~3-4 hr
- **C — Phase B6 (AI Q&A)** — ~6-8 hr; recommend after B4-B5
- **D — Phase B7 (TOC+accordion backport)** — depends on B5
- **E — Side tasks only** — content expansion, etc.
- **F — Status close** — quick "everything green" session
