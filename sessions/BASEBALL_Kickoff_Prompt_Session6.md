# Ozark Joe's Baseball Daily Intelligence Report — Session 6 Kickoff Prompt

**Prepared:** 2026-05-02 (end of Session 5)
**Session Start:** Session 6
**Handoff:** V5 (Session 5) · V4 (Session 4) · V3 (Session 3) · V2 (Session 2) · V1 (Session 1)
**KB:** 29 entries (KB-0001 through KB-0029)
**CLAUDE.md:** v12 (B3 will roll v12 → v13)
**Snapshot schema:** v6 (rolled this session)
**Email template:** v2 (rolled this session)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — project rules, critical boundaries, mandatory protocols
2. **`sessions/BASEBALL_Handoff_Prompt_V5.md`** — Session 5 record (Phase B2 done; email v2 + schema v6 live)
3. **`sessions/BASEBALL_Handoff_Prompt_V4.md`** — Session 4 (Phase B1 activation)
4. **`sessions/BASEBALL_Handoff_Prompt_V3.md`** — Session 3 (Pickleball sibling-project bootstrap)
5. **`sessions/BASEBALL_Handoff_Prompt_V2.md`** — Session 2 (email feature code shipped)
6. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (original full build; still authoritative for architecture)
7. **`docs/knowledge-base.md`** — 29 entries with statuses
8. **This file** (Kickoff Session 6) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md + Handoff V5 + V4 + V3 + V2 + V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0028  T2  Owner+Claude   Pickleball-parity plan B3-B7 — ACTIVE ROADMAP (B2 done Session 5)
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
   Should show `schemaVersion: 6` and `generatedAt` within the last 24 hours (07:00 UTC daily cron). Confirm `todaysSchedule` and `todaysScheduleDate` fields are present.
4. **CRITICAL: Verify the 3-recipient v2 email delivered cleanly from tomorrow's (relative to Session 5) scheduled cron.** This is the FIRST-EVER scheduled multi-recipient v2 send and the FIRST-EVER scheduled run on @v6 Actions. Two failure modes to watch for:
   - **Silent email failure** — `[send-email] RESEND_API_KEY not set` or any non-200 Resend response. Workflow exits 0 even on skip — green workflow does NOT prove email arrived.
   - **Push-race retry triggering** — first scheduled cron with concurrency group + retry-with-rebase loop in active production traffic. If the loop fires, that's still success but worth noting.
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   gh run view <latest-scheduled-run-id> --repo jjmgladden/baseball-daily --log | grep -E '\[send-email\]|Resend id|Sent\.|Push attempt|main -> main'
   ```
   Look for: `Recipients: 3` + `Sent. Resend id: ...` + clean push (`main -> main` on first attempt). If anything looks off, escalate to owner first thing.
5. **Confirm with owner that all 3 recipients received the email in their inboxes.** Schedule and Resend may report success but a recipient might still be missing it (spam folder, address typo, etc.).
6. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   Next weekly-batch fire date after Session 5 close: **Monday 2026-05-04**. If Session 6 happens after that, expect an Issue.
7. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   Only populated if owner deploys the Worker (KB-0024) — still pending; will be revived in Phase B6.
8. **Check GitHub Secrets state** — should still show 4 active secrets (no expected change since Session 5):
   ```
   gh secret list --repo jjmgladden/baseball-daily
   # Expected: EMAIL_FROM, EMAIL_RECIPIENTS, RESEND_API_KEY, YOUTUBE_API_KEY
   ```
9. **Confirm no stale files need archiving** per versioning rules. None expected unless B3 rolls CLAUDE.md.
10. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 5 — One Paragraph)

Single-track session executing **Pickleball-parity Phase B2 — email template v2 + snapshot schema v6**. Owner ATP'd path β (full v2 with schema bump in one commit) over path α (defer Today's Schedule) after Claude flagged a kickoff data-shape gap: the Session 5 Kickoff prescribed `snapshot.scoreboard filtered for today` for the email's "Today's Games" section, but `scoreboard` only ever held yesterday's games per `cache.yesterdayISO()` in fetch-daily.js. Path β added a delivery-day schedule fetch with probable pitchers, rolling snapshot schemaVersion 5 → 6 and adding two new top-level fields (`todaysSchedule[]` + `todaysScheduleDate`). Email template v1 → v2 rewrite (~570 lines, ~6.4× HTML byte size) ships five new sections — Today's Games (Cards/Nats + 3 marquee with probable pitchers + ET game time), Top Highlights with 120×68 mqdefault thumbnails, Division Standings top-3 across all 6 divisions (Cards/Nats highlighted), Notable Games one-liners with symbol icons — plus W/L/Sv decisions + first scoring play description added inside Cards/Nats pins. Bonus accuracy fix: `oneLineGameResult()` now requires `/^Final/i` status before declaring Won/Lost (in-progress games render "(current: 3-1)" instead). Verified end-to-end via manual `workflow_dispatch` run `25239891777`: snapshot v6 produced organically, Resend send succeeded (id `abc3ce3b...`), owner confirmed inbox delivery. Recipient expansion 1 → 3 executed via owner direct edit of GitHub `EMAIL_RECIPIENTS` Secret in the UI; baseball `.env` cleaned of all Resend trio (only `YOUTUBE_API_KEY` remains, matching pickleball posture). Verification of the 3-recipient send deferred to tomorrow's 07:00 UTC scheduled cron per owner direction.

---

## Top Priorities for Session 6 — Pick ONE Main Track

The pickleball-parity plan (KB-0028) defines 5 remaining phases (B3-B7). **B3 is the natural next step** — process improvements + CLAUDE.md v13 conventions used by everything after.

### Option A — **Phase B3: Process improvements + CLAUDE.md v13 (RECOMMENDED, ~2-3 hr)**

Three deliverables (all sized to fit in one session):

1. **`docs/credentials.md` (NEW)** — port skeleton from pickleball KB-0029. Populate with baseball's 4 active secrets (`YOUTUBE_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`) + `glad-fam.com` domain entry. Include where each is used, rotation procedure, account that owns it. Reference doc; not auto-loaded.

2. **CLAUDE.md v12 → v13** — two adds:
   - **Session-End Protocol Step 2** — add `docs/credentials.md` update mandate (any session that touches secrets must update this doc)
   - **APP_VERSION pairing rule** — when bumping SW `CACHE` constant, also bump `APP_VERSION` in `app/index.html` header pill (B4 will add the pill)
   
   Archive v12 to `archive/CLAUDE_v12.md` per whole-number versioning rule.

3. **`scripts/check-esm.js` (NEW)** — port from pickleball's standalone runtime-import script. Wraps the `node -e "import('./file.js')"` pattern from the Critical Rule into a re-runnable script that scans all `app/js/**/*.js` files. Adds to `package.json` scripts if pickleball did. Standalone — no SW cache rule applies (it lives in `scripts/`, not `app/`).

**Optional sub-step:** Cross-link to pickleball's `docs/concepts-primer.md` from baseball CLAUDE.md (no duplication — just a one-line reference for shared concepts that already exist in pickleball).

**Files touched:**
```
A  docs/credentials.md                  (NEW; ~150 lines based on pickleball)
M  CLAUDE.md                            (v12 → v13; +2 sections)
A  archive/CLAUDE_v12.md                (v12 archive)
A  scripts/check-esm.js                 (NEW; ~50 lines)
M  package.json                         (add `npm run check-esm` script if pickleball has it)
M  docs/knowledge-base.md               (KB-00XX entry for B3 closure + v13 note)
```

**Triggers:** SW cache rule does NOT apply (no `app/` changes). Pre-push ESM check does NOT apply (CommonJS). Whole-number version bump applies (CLAUDE.md v12 archive).

### Option B — **Phase B4: UI polish (~2-3 hr)**

Four deliverables:
1. **APP_VERSION pill** in `app/index.html` header (paired with SW CACHE constant per B3's new pairing rule).
2. **iOS PNG icons** via `scripts/build-icons.js` + `sharp` (port from pickleball KB-0024) → closes KB-0007.
3. **`error-messages.js` component** — port from pickleball KB-0021 item 4, retrofit baseball tabs (mainly daily.js).
4. **`date-utils.js` audit + port** — check baseball date rendering for UTC→local off-by-one (pickleball KB-0016 pattern); port helpers if any are needed.

**Triggers:** SW cache + APP_VERSION bump (paired). Pre-push ESM check on any `app/js/` change.

### Option C — **Phase B5: News tab (~3-4 hr)**

Direct port of pickleball KB-0035:
- `ingestion/lib/rss-parser.js` — RSS 2.0 + Atom 1.0 with auto-detection (no deps)
- `ingestion/fetch-news.js` — orchestrator, dedupe by URL + normalized title, sort newest-first, `MAX_PER_SOURCE=15` + `MAX_ITEMS=40`
- 7 sources (T1+T2 mix): MLB.com + MLB Trade Rumors + ESPN MLB + Viva El Birdos + Cardinals.com + Federal Baseball + MASN
- `app/js/components/news-card.js` + `confidence-badge.js`
- `app/js/tabs/news.js` — Today/This Week/Recent buckets
- Top News section appended to email v2 template (already exists; just plumb the new field through)

**Triggers:** SW cache + APP_VERSION bump. Pre-push ESM check.

### Option D — **Phase B6: AI Q&A layer (~6-8 hr)**

Largest single phase. Mirrors pickleball KB-0008 architecture end-to-end. **Recommend doing this AFTER B3-B5 ship** — wait until baseball email recipients are demonstrably reading the app daily AND/OR owner ATPs as skill-development exercise. Owner already ATP'd this as a phase in Session 4; doing UI/content phases first builds context bundle quality before paying for AI inference.

### Option E — **Phase B7: TOC + accordion backport (~3-4 hr)**

Depends on B5 done. Refactors Cardinals tab + History tab + News tab to TOC + accordion pattern from pickleball KB-0040 Phase L1.

### Option F — **Side task only (~30 min each)**

- On-This-Day expansion (KB-0013) — content-only
- Themed trivia batches via chat-prompt → Claude drafts → owner approves → applies
- Themed legend batches (Cardinals managers, WWII veterans, brothers in baseball, etc.)
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one

### Option G — **Continue without main-track work**

Cron is autonomous. If the morning email arrived clean for several days running and owner just wants a status check, this can be a 5-min "everything green, see you next session" close.

---

## Side Tasks (Interleave as Appropriate)

Same as before:
- On-This-Day expansion
- Themed trivia/legend batches
- Cardinals-deep enrichment
- Marquee selection algorithm tuning if owner has feedback after a few days of v2 emails (currently: division-leader-vs-leader > .550-vs-.550 > rivalry > combined record)

---

## Expected Deliverables from Session 6

**Minimum:**
- Session-start protocol checks (especially the 3-recipient cron verification)
- One main-track option (A-G) executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Handoff V6 + Kickoff Session 7 at session end

**Ambitious (if main = B3):**
- B3 fully shipped (`docs/credentials.md` + CLAUDE.md v13 + `scripts/check-esm.js`)
- KB entry added; KB-0028 B3 sub-task marked done
- 1 side task

---

## System State Snapshot (End of Session 5)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous
- **Daily email:** **LIVE v2 with 3 recipients** (queued for first multi-recipient send tomorrow morning)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Most recent commits:**
  - `8a8a42b Daily snapshot 2026-05-02` (auto-pushed by workflow_dispatch run `25239891777`)
  - `223550e feat: Phase B2 — email template v2 + snapshot schema v6 (Today's Schedule)` (Phase B2 ship)
  - + this session-close commit (Handoff V5 + Kickoff Session 6)
- **CLAUDE.md:** v12 (B3 will roll v12 → v13)
- **SW cache:** v14
- **Snapshot schema:** **v6** (rolled this session)
- **Email template:** **v2** (rolled this session)
- **`fetch-daily.js`:** v6
- **`send-email.js`:** v2
- **GitHub Secrets:** 4 active (`EMAIL_FROM`, `EMAIL_RECIPIENTS` [3 addresses], `RESEND_API_KEY`, `YOUTUBE_API_KEY`)
- **Local `.env`:** 1 key only (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6` across all 3 workflows
- **Push-race protection:** active in daily.yml (didn't fire this session)
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at session close
- **Pickleball sibling project:** Session 9 closed 2026-04-28; Session 10 awaiting owner; baseball did not touch pickleball repo this session

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md.) Session 5 did NOT touch `app/`. **B3 does not trigger this; B4/B5/B7 will. B3's planned APP_VERSION pairing rule will pair the bump going forward.**

2. **`node --check` misses ESM syntax errors** — run `node -e "import('./file.js')"` for every changed `app/js/` file before committing. (Critical Rule in CLAUDE.md.) Session 5 did not touch ESM files. **B3 will add `scripts/check-esm.js` to make this easier going forward.**

3. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden`. Don't remove.

4. **Approve ALL checkbox at top of weekly Issues** — preserved. Don't remove.

5. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in the app AND in the email v2. Pickleball confirmed PPA + MLP allow embedding (KB-0013 there); baseball does NOT.

6. **Pages needs 1-2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

7. **Email is LIVE with 3 recipients** — failure mode is silent. `[send-email] RESEND_API_KEY not set` would skip silently and exit 0; the cron would look green but no email would arrive. Always check the most recent run's send-email step output during session-start. **This is the FIRST scheduled multi-recipient v2 send happening between Session 5 and Session 6 — extra-vigilant verification warranted.**

8. **Worker is not yet deployed (KB-0024)** — Suggest modal still shows "not yet configured" graceful message. Will revive in Phase B6 for AI proxy use case.

9. **Never commit `.env`** — `check-secrets.js` will flag it; it's gitignored anyway. Owner has cleaned `.env` to only `YOUTUBE_API_KEY` this session.

10. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing is limited to: shared Resend account/key, shared YouTube API key, shared `glad-fam.com` Path B domain.

11. **Cross-project secret transfer pattern (Session 4)** — when sharing a secret value between projects, owner pastes once into receiving project's local `.env` (gitignored), Claude pipes via `gh secret set NAME --repo X` over stdin. NEVER echo secret values to chat. NEVER use `--body` flag.

12. **GitHub Secrets are write-only** — there is no `gh secret get` command. Source of truth is owner's password manager + the deployment locations.

13. **Single source-of-truth for email config (NEW Session 5)** — Resend trio (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`) lives ONLY in GitHub Secrets, NOT in local `.env`. If a future session needs to test email locally, supply env vars inline on the command line: `RESEND_API_KEY=re_... EMAIL_RECIPIENTS=test@me.com EMAIL_DRY_RUN=1 node ingestion/send-email.js`.

14. **Snapshot schema is now v6 (NEW Session 5)** — `todaysSchedule[]` + `todaysScheduleDate` are top-level fields produced by `fetch-daily.js` v6. Email template v2 reads them. App tabs ignore unknown fields gracefully (forward-compat).

15. **Always flag data-shape gaps before extending ingestion (NEW Session 5)** — Session 5's B2 found that the kickoff prescribed a snapshot field (`scoreboard filtered for today`) that didn't exist. Claude flagged path α/β/γ rather than silently bumping the schema. Owner ATP'd path β. **Never silently bump snapshot schema or extend ingestion just because a kickoff implies a field exists — always verify and flag.**

---

## Session-End Reminders (For When Session 6 Closes)

Per CLAUDE.md § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. Archive previous CLAUDE.md / data-schema versions if any rolled (B3 will roll CLAUDE.md v12 → v13)
3. Write `sessions/BASEBALL_Handoff_Prompt_V6.md` — full Session 6 record
4. Write `sessions/BASEBALL_Kickoff_Prompt_Session7.md` — concise start-here
5. List file changes for the owner
6. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
7. Report: what was done, what's next, blockers
8. **(NEW from B3)** Update `docs/credentials.md` if any session work touched secrets

---

**End of Kickoff Session 6. Daily email v2 with 3 recipients is queued for tomorrow's first scheduled multi-recipient send. Snapshot schema is v6. Email template is v2. Five phases (B3-B7) remain on the roadmap.**

**Main-track choice is yours:**
- **A — Phase B3 (process improvements + CLAUDE.md v13)** — recommended, sets conventions for B4-B7, ~2-3 hr
- **B — Phase B4 (UI polish + closes KB-0007)** — ~2-3 hr; APP_VERSION pill needs B3's pairing rule first
- **C — Phase B5 (News tab)** — ~3-4 hr
- **D — Phase B6 (AI Q&A)** — ~6-8 hr; recommend after B3-B5
- **E — Phase B7 (TOC+accordion backport)** — depends on B5
- **F — Side tasks only** — content expansion, etc.
- **G — Status close** — quick "everything green" session
