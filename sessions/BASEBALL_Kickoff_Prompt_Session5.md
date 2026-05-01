# Ozark Joe's Baseball Daily Intelligence Report — Session 5 Kickoff Prompt

**Prepared:** 2026-05-01 (end of Session 4)
**Session Start:** Session 5
**Handoff:** V4 (Session 4) · V3 (Session 3) · V2 (Session 2) · V1 (Session 1)
**KB:** 28 entries (KB-0001 through KB-0028)
**CLAUDE.md:** v12 (unchanged)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — project rules, critical boundaries, mandatory protocols
2. **`sessions/BASEBALL_Handoff_Prompt_V4.md`** — Session 4 record (Pickleball-parity plan locked; Phase B1 done)
3. **`sessions/BASEBALL_Handoff_Prompt_V3.md`** — Session 3 (Pickleball sibling-project bootstrap)
4. **`sessions/BASEBALL_Handoff_Prompt_V2.md`** — Session 2 (email feature code shipped)
5. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (original full build; still authoritative for architecture)
6. **`docs/knowledge-base.md`** — 28 entries with statuses
7. **This file** (Kickoff Session 5) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md + Handoff V4 + V3 + V2 + V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0028  T2  Owner+Claude   Pickleball-parity plan B2-B7 — ACTIVE ROADMAP
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
   Should show `generatedAt` within the last 24 hours (07:00 UTC daily cron).
4. **Verify daily email is still firing.** Email is now LIVE — silent failure mode is the danger:
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   gh run view <latest-run-id> --repo jjmgladden/baseball-daily --log | grep -E '\[send-email\]|Resend id|Sent\.'
   ```
   Look for `Sent. Resend id: ...` lines. If you see `[send-email] RESEND_API_KEY not set` or any non-200 response, escalate.
5. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   Next weekly-batch fire date after Session 4 close: Monday 2026-05-04. If Session 5 happens after that, expect an Issue.
6. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   Only populated if owner deploys the Worker (KB-0024) — still pending; will be revived in Phase B6.
7. **Check GitHub Secrets state** — should show 4 active secrets:
   ```
   gh secret list --repo jjmgladden/baseball-daily
   # Expected: EMAIL_FROM, EMAIL_RECIPIENTS, RESEND_API_KEY, YOUTUBE_API_KEY
   ```
   If any are missing, escalate.
8. **Verify the @v6 Actions bumps held** — first scheduled cron after `1fb2520` should be 2026-05-02T07:00Z. Check:
   ```
   gh run view <latest-scheduled-run-id> --repo jjmgladden/baseball-daily --json conclusion --jq '.conclusion'
   ```
   Should be `success`.
9. **Confirm no stale files need archiving** per versioning rules.
10. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 4 — One Paragraph)

Single-track session executing **Pickleball-parity Phase B1 — Activation**. Owner asked Claude to bring baseball up to pickleball's current feature level. Claude conducted deep review of the Pickleball Project (CLAUDE.md, KB v18 with 47 entries, V9 handoff covering email + AI Q&A + News + Learn + custom domain + many more features), produced a 7-phase plan covering email activation through TOC-accordion backport, owner answered 8 scoping questions and ATP'd the sequencing, B1 executed and verified end-to-end. Three workflow files bumped `@v4` → `@v6/@v6` (closes KB-0022). Daily.yml hardened with concurrency group + timeout + 3-attempt push-with-rebase retry loop (closes new KB-0027 ported from pickleball KB-0027). Email activation: owner pasted 3 secrets into local `.env`, Claude piped each via `gh secret set` over stdin, manual workflow run `25228703199` succeeded in 18s, Resend id `328b5393-a842-4939-ab8d-27c49bd725e9`, owner confirmed Gmail inbox delivery (closes KB-0025 via Path A 1-recipient activation reusing pickleball's verified `glad-fam.com` Path B domain). KB updated v3 → v4 with 3 closures (KB-0005 housekeeping, KB-0022, KB-0025) + 2 new entries (KB-0027 push-race port, KB-0028 7-phase roadmap). Two commits: `1fb2520` (workflow hardening) + this session-close commit (KB + Handoff + Kickoff).

---

## Top Priorities for Session 5 — Pick ONE Main Track

The pickleball-parity plan (KB-0028) defines 6 remaining phases. **B2 is the natural next step** — visible user-facing improvement, builds directly on the now-active email channel. But owner has full discretion on which to pick.

### Option A — **Phase B2: Email v2 upgrade (RECOMMENDED, ~3-4 hr)**

Roll `ingestion/lib/email-template.js` v1 → v2 with these new sections (display order):

| # | Section | Source data | Notes |
|---|---|---|---|
| 1 | Header | unchanged | ⚾ + brand + date |
| 2 | Cardinals pin | `snapshot.cardinals.game` + `recap` | Add: 1-line scoring play from `snapshot.cardinals.recap.scoringPlays[0]` if Final, W/L/Sv pitcher names from `recap.decisions` |
| 3 | Nationals pin | same upgrade | |
| 4 | **Today's Schedule** *(NEW)* | `snapshot.scoreboard` filtered for today | Cards/Nats games + 3-5 league marquee games (playoff-implication, ace-vs-ace, division-leader-vs-division-leader, rivalry) |
| 5 | **Top Highlights with thumbnails** *(NEW)* | `snapshot.cardinals.highlights[]` + `nationals.highlights[]` | Mirror pickleball videoRowHtml: 120×68 ytimg.com mqdefault.jpg + title + channel + date, click-out link |
| 6 | **All NL + AL Standings (top 3 per division)** *(NEW)* | `snapshot.standings` | 6 divisions × top-3 = 18 rows compact; Cards highlighted in NL Central; Nats in NL East |
| 7 | **Notable Games one-liners** *(NEW)* | `snapshot.scoreboard` notable-game classifications already in `recap.js` | one-run / shutout / blowout / slugfest / pitchers' duel |
| 8 | On This Day | unchanged | top 2 entries |
| 9 | CTA button | unchanged | |
| 10 | Stats footer | unchanged | games / trades / injuries counts |

**Subject line — already in v1.** v1 already has "Cardinals win 10-5 vs Pittsburgh Pirates" action-lead subject. Optional v2 polish: add "Live: Cards vs Cubs (T6, 3-2)" if Cards game is in-progress.

**Owner-locked answers from Session 4 are recorded in KB-0028** — no new ATP needed for B2 scope itself; just ATP to start the work.

**Files touched:**
```
M  ingestion/lib/email-template.js     (v1 → v2; ~+250 lines for new sections)
M  ingestion/send-email.js             (signature unchanged, version comment)
A  archive/email-template_v1.js        (v1 archive per CLAUDE.md whole-number versioning)
M  docs/knowledge-base.md              (new KB-00XX entry for v2 launch)
M  README.md                           (note v2 email contents)
```

**Triggers:** SW cache rule does NOT apply (no `app/` changes). Pre-push ESM check does NOT apply (CommonJS, not ESM). Whole-number version bump applies (archive v1 to `archive/email-template_v1.js`).

**Recommended sub-step at end of B2:** expand `EMAIL_RECIPIENTS` from 1 to 3 (matching pickleball list) once owner is happy with v2 format. Single-line .env edit + `gh secret set` push.

### Option B — **Phase B3: Process improvements (~2-3 hr)**

Three deliverables:
1. **`docs/credentials.md`** — port skeleton from pickleball KB-0029, populate with baseball's 4 active secrets (YOUTUBE, RESEND, EMAIL_FROM, EMAIL_RECIPIENTS) + `glad-fam.com` domain entry.
2. **CLAUDE.md v12 → v13** — add Session-End Protocol Step 2 (credentials.md update mandate) + APP_VERSION pairing rule for SW cache bumps. Archive v12 to `archive/CLAUDE_v12.md`.
3. **`scripts/check-esm.js`** — port from pickleball's standalone runtime-import script.
4. *Optional:* Cross-link to pickleball's `docs/concepts-primer.md` from baseball CLAUDE.md (no duplication).

### Option C — **Phase B4: UI polish (~2-3 hr)**

Four deliverables:
1. **APP_VERSION pill** in `app/index.html` header (paired with SW CACHE constant) — visible version signal for stale-cache debugging.
2. **iOS PNG icons** via `scripts/build-icons.js` + `sharp` (port from pickleball KB-0024) → closes KB-0007.
3. **`error-messages.js` component** — port from pickleball KB-0021 item 4, retrofit baseball tabs (mainly daily.js).
4. **`date-utils.js` audit + port** — check baseball date rendering for UTC→local off-by-one (pickleball KB-0016 pattern); port helpers if any are needed.

**Triggers:** SW cache + APP_VERSION bump (paired). Pre-push ESM check on any `app/js/` change.

### Option D — **Phase B5: News tab (~3-4 hr)**

Direct port of pickleball KB-0035:
- `ingestion/lib/rss-parser.js` — RSS 2.0 + Atom 1.0 with auto-detection (no deps)
- `ingestion/fetch-news.js` — orchestrator, dedupe by URL + normalized title, sort newest-first, MAX_PER_SOURCE=15 + MAX_ITEMS=40
- 7 sources (T1+T2 mix): MLB.com + MLB Trade Rumors + ESPN MLB + Viva El Birdos + Cardinals.com + Federal Baseball + MASN
- `app/js/components/news-card.js` + `confidence-badge.js`
- `app/js/tabs/news.js` — Today/This Week/Recent buckets
- Top News section appended to email v2 template (depends on B2 done)

**Triggers:** SW cache + APP_VERSION bump. Pre-push ESM check.

### Option E — **Phase B6: AI Q&A layer (~6-8 hr)**

Largest single phase. Mirrors pickleball KB-0008 architecture end-to-end. **Recommend doing this AFTER B2-B5 ship** — wait until baseball email recipients are demonstrably reading the app daily (per CLAUDE.md AI-Q&A trigger condition #1) AND/OR owner ATPs as skill-development exercise (condition #2). Owner ATP'd this as a phase in Session 4, so condition #2 is technically satisfied — but doing UI/content phases first builds context bundle quality before paying for AI inference.

### Option F — **Phase B7: TOC + accordion backport (~3-4 hr)**

Depends on B5 done. Refactors Cardinals tab + History tab + News tab to TOC + accordion pattern from pickleball KB-0040 Phase L1.

### Option G — **Side task only (~30 min each)**

- On-This-Day expansion (KB-0013) — content-only
- Themed trivia batches via chat-prompt → Claude drafts → owner approves → applies
- Themed legend batches (Cardinals managers, WWII veterans, brothers in baseball, etc.)
- Recipient expansion: 1 → 3 recipients (single-line .env edit + `gh secret set`)
- Investigate weekly-batch Issue #4 contents (closed Session 3; review what was approved/rejected if owner wants)

### Option H — **Continue without main-track work**

Cron is autonomous. If the morning email arrived clean for several days running and owner just wants a status check, this can be a 5-min "everything green, see you next session" close.

---

## Side Tasks (Interleave as Appropriate)

Same as before:
- On-This-Day expansion
- Themed trivia/legend batches
- Cardinals-deep enrichment
- Recipient expansion to 3 (1-line owner action — paste comma-separated list into `.env`, Claude re-pushes secret)

---

## Expected Deliverables from Session 5

**Minimum:**
- One main-track option (A-G) executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Handoff V5 + Kickoff Session 6 at session end

**Ambitious:**
- Main track (B2 most likely) + 1-2 side tasks
- KB entries flipped to Closed as appropriate

---

## System State Snapshot (End of Session 4)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous; sends email each morning to 1 recipient (owner)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Most recent commit:** `1fb2520` (Phase B1 workflow hardening) + session-close commit (KB + Handoff + Kickoff)
- **CLAUDE.md:** v12 (B3 will roll v12 → v13)
- **SW cache:** v14
- **Snapshot schema:** v5
- **Email feature:** **LIVE** — `baseball@glad-fam.com` sender, 1 recipient (owner), Path A activated
- **GitHub Secrets:** 4 active (`YOUTUBE_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6` across all 3 workflows
- **Push-race protection:** active in daily.yml (3-attempt retry-with-rebase)
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at session close
- **Pickleball sibling project:** Session 9 closed 2026-04-28; Session 10 awaiting owner; baseball did not touch pickleball repo this session

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md §4.8.) Session 4 did NOT touch `app/`, so no bump needed. **B2 (email) does not trigger this; B4/B5/B7 will.**

2. **`node --check` misses ESM syntax errors** — run `node -e "import('./file.js')"` for every changed `app/js/` file before committing. (Critical Rule in CLAUDE.md §4.9.) Session 4 did not touch ESM files. **B2 does not trigger this (CommonJS); B4/B5/B7 will.** Phase B3 will add `scripts/check-esm.js` to make this easier.

3. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden`. Don't remove.

4. **Approve ALL checkbox at top of weekly Issues** — preserved. Don't remove.

5. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in the app (and now in the email v2 — same pattern). Pickleball confirmed PPA + MLP allow embedding (KB-0013); baseball does NOT.

6. **Pages needs 1-2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

7. **Email is LIVE** — failure mode is silent. `[send-email] RESEND_API_KEY not set` would skip silently and exit 0; the cron would look green but no email would arrive. Always check the most recent run's send-email step output during session-start.

8. **Worker is not yet deployed (KB-0024)** — Suggest modal still shows "not yet configured" graceful message. Will revive in Phase B6 for AI proxy use case.

9. **Never commit `.env`** — `check-secrets.js` will flag it; it's gitignored anyway, but be cautious with `git add -A`. **Session 4 confirmed `.env` is gitignored — owner pasted secrets there, Claude piped to `gh secret set` over stdin without echoing values to chat.**

10. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing is limited to: shared Resend account/key, shared YouTube API key, shared `glad-fam.com` Path B domain (now extends to baseball email sender). Do not absorb pickleball work into the baseball repo.

11. **Cross-project secret transfer pattern** *(NEW Session 4)* — when sharing a secret value between projects, owner pastes once into receiving project's local `.env` (gitignored), Claude pipes via `gh secret set NAME --repo X` over stdin. NEVER echo secret values to chat (lesson from pickleball KB-0044). NEVER use `--body` flag (puts value on command line). Use `grep + cut + tr -d '\r\n' | gh secret set` chain.

12. **GitHub Secrets are write-only** *(NEW Session 4)* — there is no `gh secret get` command. Source of truth is owner's password manager + the deployment locations. Don't promise to "pull values from another repo's Secrets" — the platform doesn't allow it.

---

## Session-End Reminders (For When Session 5 Closes)

Per CLAUDE.md § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. Archive previous CLAUDE.md / data-schema versions if any rolled (B3 would roll CLAUDE.md v12 → v13)
3. Write `sessions/BASEBALL_Handoff_Prompt_V5.md` — full Session 5 record
4. Write `sessions/BASEBALL_Kickoff_Prompt_Session6.md` — concise start-here
5. List file changes for the owner
6. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
7. Report: what was done, what's next, blockers

---

**End of Kickoff Session 5. Daily email is LIVE. Pickleball-parity plan B1 done; B2 (email v2 upgrade) is the natural next track. Six phases remain on the roadmap.**

**Main-track choice is yours:**
- **A — Phase B2 (email v2 upgrade)** — recommended, builds on now-active email channel, ~3-4 hr
- **B — Phase B3 (process improvements + CLAUDE.md v13)** — ~2-3 hr
- **C — Phase B4 (UI polish + closes KB-0007)** — ~2-3 hr
- **D — Phase B5 (News tab)** — ~3-4 hr; depends nothing else; email Top-News section needs B2 to land first
- **E — Phase B6 (AI Q&A)** — ~6-8 hr; recommend after B2-B5
- **F — Phase B7 (TOC+accordion backport)** — depends on B5
- **G — Side tasks only** — content expansion, recipient expansion, etc.
- **H — Status close** — if email has been arriving clean for several days, can be a quick "everything green" session
