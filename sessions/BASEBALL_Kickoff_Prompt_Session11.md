# Ozark Joe's Baseball Daily Intelligence Report — Session 11 Kickoff Prompt

**Prepared:** 2026-05-06 (end of Session 10)
**Session Start:** Session 11
**Handoff:** [V10](BASEBALL_Handoff_Prompt_V10.md) (Session 10, multi-day 2026-05-04 → 2026-05-06 — 7-track omnibus)
**Predecessor chain:** V10 → V9 (B6 LIVE) → V8 (B5) → V7 (B4) → V6 (B3) → V5 (B2) → V4 (B1) → V3 → V2 → V1
**KB:** 34 entries (KB-0001 through KB-0034)
**[CLAUDE.md](../CLAUDE.md):** v13 (project) + user-level v1 with XPL-001..006
**Snapshot schemas:** main v6 · news v1 · ai-context v1
**Email template:** **v4** (rolled v3 → v4 — CTA at top per owner feedback)
**SW cache + APP_VERSION pill:** **v22** (rolled v18 → v22 across the session)
**Worker:** **3 routes LIVE** at `https://baseball-daily-api.jjmgladden.workers.dev` (`/ai`, `/submit`, `/refresh`) + `/health`
**Pickleball-parity roadmap:** **COMPLETE** (KB-0028 closes — B7 done)

---

## Read These First (In Order)

1. **`CLAUDE.md` (project)** — v13: APP_VERSION pairing rule + Session-End Step 2 [credentials.md](../docs/credentials.md) mandate
2. **`~/.claude/CLAUDE.md` (user-level)** — XPL-001..006 cross-project lessons + mandatory session-end XPL audit instruction
3. **`sessions/BASEBALL_Handoff_Prompt_V10.md`** — full Session 10 record (7 tracks)
4. **`sessions/BASEBALL_Handoff_Prompt_V9.md`** — Session 9 (Phase B6)
5. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (still authoritative for architecture)
6. **`docs/knowledge-base.md`** — 34 entries; KB-0034 documents Session 10 in full detail
7. **`docs/credentials.md`** — v3 (5 active credentials; `GITHUB_TOKEN` Worker secret is the one outstanding owner action)
8. **This file** (Kickoff Session 11) — what to do right now

---

## Session-Start Protocol (MANDATORY)

Run every item before proposing work:

1. Read CLAUDE.md (project v13) + user-level CLAUDE.md (XPL-001..006) + Handoffs V10 → V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0013  —    Limitation     On-This-Day seed expansion (closing path identified — trivia-style backlog flow)
     KB-0020  —    Owner          Public on-demand refresh — code shipped + deployed; awaits owner PAT (~5 min)

   OPEN (static awaiting owner action):
     KB-0024  —    Owner          Submission Worker — code LIVE; Suggest UI hookup separate
                                  (same GITHUB_TOKEN PAT as KB-0020 covers it)
   ```
3. **Check main snapshot freshness:**
   ```
   head -5 data/snapshots/latest.json
   ```
4. **Check news snapshot freshness:**
   ```
   head -10 data/snapshots/news-latest.json
   ```
5. **Check ai-context bundle freshness:**
   ```
   head -8 data/snapshots/ai-context.json
   ```
6. **Daily-cron health check:**
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   ```
   First v4-email cron will be the one after Session 10 commits land. Spot-check the Resend id.
7. **Worker health (3 routes now):**
   ```
   curl https://baseball-daily-api.jjmgladden.workers.dev/health
   ```
   Expected: `{"ok":true,"worker":"baseball-daily-api","routes":["POST /submit","POST /ai","POST /refresh"],"aiEnabled":true,"refreshEnabled":<true|false>}`. If owner has uploaded `GITHUB_TOKEN` between sessions, `refreshEnabled` flips to true.
8. **KB-0020 smoke test (only if `refreshEnabled:true`):**
   ```
   curl -X POST https://baseball-daily-api.jjmgladden.workers.dev/refresh \
     -H "Origin: http://localhost:1882" -H "Content-Type: application/json" -d '{}'
   ```
   Should return 202 with `{ok:true, dispatched:true, workflow:"daily.yml", ref:"main", etaSeconds:45, runsUrl:"..."}`.
9. **Live AI smoke test (still useful):**
   ```
   curl -X POST https://baseball-daily-api.jjmgladden.workers.dev/ai \
     -H "Origin: http://localhost:1882" -H "Content-Type: application/json" \
     -d '{"question":"How are the Cardinals doing this season?"}'
   ```
10. **Check open Issues:**
    ```
    gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
    gh issue list --repo jjmgladden/baseball-daily --label submission --state open
    gh issue list --repo jjmgladden/baseball-daily --state closed --limit 3
    ```
    Note: weekly-batch fires every Monday — by Session 11 there'll likely be a fresh closed-and-pending-application Issue from a recent Monday. If trivia stubs are surfacing, the Issue body shows "1. Q: ... A: ..." line items. **Read the closed Issue body even if no Issue is open** — that's where Session 10 got bitten.
11. **Check GitHub Secrets state** — should still show 5:
    ```
    gh secret list --repo jjmgladden/baseball-daily
    ```
12. **Confirm no stale files need archiving** per versioning rules.
13. **Verify APP_VERSION pill renders v22 on the live site.** If owner has had a PWA install across the SW v18 → v22 transition, the auto-reload (KB-0021) should have fired on first visit after the deploy.
14. **Verify "Refresh now" link in the footer** renders. Click only if `refreshEnabled:true`.
15. **Verify Trivia tab renders v2** — should show "Today's 5" by default with 5 cards + 🎲 Different 5 button + filters that bypass to full pool.
16. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 10 — One Paragraph)

Multi-day 7-track omnibus session. Started with Option A cleanup (`wrangler deploy` to drop `/aitest`), then ATP'd Phase B7 (TOC + accordion backport from pickleball L1) which closes KB-0028 and the entire pickleball-parity roadmap. Owner returned with three feedback items that became a 5-step plan (mobile stale-page recurrence, "CTA at top of email", "fresh trivia daily"); the trivia question expanded the plan when owner reminded that there was an existing weekly-Monday Issue-checkbox flow — investigation revealed (a) Issue #5 from Monday May 4 was closed-and-pending-application (Session 10 kickoff hadn't flagged it), (b) the curation-backlog had 131 pending entries but ZERO trivia type. Plan grew to 6 steps when owner ATP'd KB-0020 mid-session. Day 3 (May 6) the mobile bug recurred and the new clue "does not happen for Pickleball" redirected the diagnosis to a cross-project SW pattern comparison — found that baseball's SW was cache-first for EVERY GET (including `/data/snapshots/latest.json`), intercepting the data-loader's `cache: 'no-store'` directive at the SW layer. Pickleball's SW had a split handler (network-first for `/data/`, cache-first for shell) from day one. Fix ported as Track 8. All 7+ tracks shipped end-to-end with browser verification via Claude Preview MCP at port 1882; SW + APP_VERSION rolled v18 → v22 across four shell-touching commits; ESM check 24/24 green (added refresh.js); legends-general.json grew 20 → 30 (Marvin Miller + 9 player legends from Issue #5); curation-backlog.json grew 121 → 141 pending (+20 verified trivia stubs). KB-0034 added; KB-0021 + KB-0028 closed; KB-0020 closes-pending-PAT; credentials.md v2 → v3 with archive. **Owner-side activation chain remaining: ~5 min to create one fine-grained GitHub PAT with Actions:write + Issues:write scoped to baseball-daily, paste into Cloudflare dashboard as `GITHUB_TOKEN` Worker secret (XPL-001 — NOT `wrangler secret put`). One paste covers BOTH /refresh and /submit.**

---

## Top Priorities for Session 11 — Pick ONE Main Track

### Option A — **Verify KB-0020 fully closes (5 min, status close)**

If owner uploaded `GITHUB_TOKEN` between sessions, smoke-test the `/refresh` route end-to-end:
1. Verify `/health` shows `refreshEnabled:true`.
2. Click "Refresh now" in the site footer → status span should show `requesting refresh… ` then `refreshing… new data in ~45s. Reloading shortly.`
3. Page should auto-reload in ~53s.
4. After reload, snapshot's `generatedAt` should be ~now.
5. Mark KB-0020 fully closed in the KB; update credentials.md `GITHUB_TOKEN` row to ✅.

If owner hasn't done it yet, remind them of the steps + offer to walk through it.

### Option B — **Apply latest weekly-batch Issue (~30 min)**

By Session 11 there should be a fresh closed Issue from a Monday batch (May 11 cron will surface 10 entries — first 10 of the legend/moment/etc. backlog OR if trivia priorities sort first, 10 trivia stubs from the seed). Same pattern as Session 10's Issue #5 application:
1. `gh issue view <N> --repo jjmgladden/baseball-daily --json title,body,state,closedAt`
2. Author full destination entries (legend → legends-general.json, trivia → trivia.json directly using the `question`+`answer` fields, etc.)
3. Idempotent apply script in `scripts/apply-batch-YYYY-MM-DD.js`
4. Update KB Quick Index if any trivia stubs landed (trivia.json grows).

### Option C — **KB-0013 — On-This-Day seed expansion via the trivia-style backlog flow (~60 min)**

The closing path identified in Session 10:
1. Update `weekly-batch.yml` routing to handle `type: 'on-this-day'` → `data/master/on-this-day-seed.json`
2. Author 30-50 verified On-This-Day stubs with extended schema `{date, year, title, description, source}` analogous to trivia's `{question, answer}` pattern
3. Seed via one-shot script
4. Next Monday the Issue surfaces 10/week for owner approval.

### Option D — **Content expansion — trivia themed batch chat (~20-30 min)**

If owner wants to grow the trivia pool without waiting for the weekly cron, they can chat-prompt: *"do a 1980s postseason trivia batch"* or similar. Claude drafts 10-20 themed questions+answers, opens a separate themed Issue with checkboxes (or seeds directly if owner approves in chat). Extends the pool beyond the 20 stubs already seeded.

### Option E — **Status close**

If everything's running clean (cron green, email v4 arrived, KB-0020 active), 5-minute check-in.

---

## Side Tasks (Interleave as Appropriate)

- KB-0013 expansion (Option C alternative — content-only without the backlog flow if owner prefers)
- AI Q&A monitoring — `wrangler tail` to see real questions; identify gaps in ai-context.json that surface as "I don't have that information"
- MASN news source endpoint discovery + re-enable in `data/master/news-sources.json`
- Themed legend / moment / story batches via chat-prompt → owner approves
- Confirm v4 email rendering on owner's mobile + desktop email clients (gmail / outlook / apple mail) — visual review only

---

## Expected Deliverables from Session 11

**Minimum:**
- Session-start protocol checks (especially `/health` for `refreshEnabled` state + Trivia tab v2 verification + APP_VERSION pill v22 verification)
- One main-track option executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Updated `docs/credentials.md` if any credentials touched (e.g. KB-0020 closing → flip `GITHUB_TOKEN` to ✅)
- Mandatory session-end XPL audit per `~/.claude/CLAUDE.md`
- Handoff V11 + Kickoff Session 12 at session end (after explicit owner ATP)

**Ambitious:**
- Option A close + Option B apply (KB-0020 fully closed + weekly batch applied)
- Or Option C (KB-0013 closing path implemented)

---

## System State Snapshot (End of Session 10)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous; runs fetch-daily + fetch-news + build-ai-context + commit + send-email v4
- **Daily email:** LIVE v4 with 3 recipients; first v4 cron fire pending the day after Session 10 commits land
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch — now includes trivia routing)
- **Most recent commits will land at session-end push:** Session 10 omnibus + Handoff V10 + Kickoff Session 11
- **CLAUDE.md (project):** v13
- **CLAUDE.md (user-level):** v1 with XPL-001..006
- **SW cache + APP_VERSION pill:** v22
- **Snapshot schemas:** main v6, news v1, ai-context v1
- **Email template:** v4
- **Worker package:** v3 (3 routes)
- **GitHub Secrets:** 5 active
- **Cloudflare Worker secrets:** 1 active (`ANTHROPIC_API_KEY`); `GITHUB_TOKEN` ⏸ awaiting owner action
- **Local `.env`:** 1 key (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6`
- **`scripts/check-esm.js`:** active; `npm run check:esm` exits 0 with **24 modules**
- **News tab:** LIVE with collapsible buckets (B7)
- **Ask tab:** LIVE end-to-end
- **Trivia tab:** v2 LIVE — Today's 5 + reshuffle + filter-bypass
- **Cardinals + History tabs:** B7-refactored (TOC + collapsible sections)
- **Curation backlog:** 141 pending (20 trivia stubs ready for next Monday)
- **Open Issues:** none

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` / `app/icons/` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule.)
2. **APP_VERSION pairing rule** — when bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/js/app.js`. No exceptions.
3. **`node --check` misses ESM syntax errors** — run `npm run check:esm` before push for any `app/js/` change. Tool now covers **24 modules**.
4. **NEW: SW fetch handler must differentiate `/data/` from shell paths** — baseball's SW v22 forward has the split handler (network-first for `/data/`, cache-first for shell, same-origin guard on `cache.put`). DO NOT revert to "cache-first for everything" in any future SW edit. KB-0034 § Track 8 documents the bug.
5. **Approve ALL checkbox at top of weekly Issues** — preserved.
6. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in app + email v4.
7. **Pages needs 1-2 min to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner ready.
8. **Email is LIVE v4** — CTA + brief stats summary at TOP. v3 archived in git history (no source-code archive file — diverges from CLAUDE.md whole-number convention for build-time modules).
9. **Worker is LIVE with 3 routes** — `baseball-daily-api`. `/refresh` returns 500 until owner uploads `GITHUB_TOKEN`.
10. **Never commit `.env`** — `check-secrets.js` will flag it; gitignored anyway.
11. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing limited to Resend, YouTube key, glad-fam.com domain, Cloudflare account, Anthropic account. **All sharing posture documented in `docs/credentials.md` AND `~/.claude/CLAUDE.md` XPL-004/005/006.**
12. **Cross-project secret transfer pattern** — pipe via stdin (`gh secret set`); never echo to chat; never use `--body` flag. **Cloudflare Worker secrets: USE THE DASHBOARD, NOT `wrangler secret put` ON WINDOWS** (XPL-001).
13. **GitHub Secrets are write-only** — there is no `gh secret get`. Source of truth is owner's password manager + the deployment locations.
14. **Single source-of-truth for email config** — Resend trio lives ONLY in GitHub Secrets, NOT in local `.env`.
15. **Snapshot schemas: main v6, news v1, ai-context v1** — independent files, fetched independently. Email template v4 reads main + news (defensively). Worker reads ai-context. Don't merge them.
16. **Always flag data-shape gaps before extending ingestion** — never silently bump schema or extend ingestion just because a kickoff implies a field exists.
17. **`app/js/app.js` MUST guard `main()` invocation with `typeof document !== 'undefined'`** — without it, `npm run check:esm` exits 1.
18. **CLAUDE.md v13 Session-End Step 2: update `docs/credentials.md` whenever credentials change.**
19. **`scripts/build-icons.js` re-runnable.** If icon.svg changes, `npm run build:icons` regenerates all 6 PNGs. Bump SW + APP_VERSION + commit.
20. **error-messages component** — Session 8 News tab + Session 9 Ask tab + Session 10 Refresh component all use the `errorBannerHtml(...)` helper or `.refresh-status` style. Future tabs MUST use the same patterns.
21. **`.claude/launch.json`** — preview-server config for Claude Preview MCP (port 1882). Local Ask-tab + Refresh-tab testing against the live Worker works because CORS allows `localhost:1882`.
22. **News separate from main snapshot, ai-context separate from both** — three independent files. Each fetched by its own ingestion script. Each consumed independently. DO NOT merge.
23. **MASN news source disabled placeholder** — re-enable is a one-line config edit when an RSS endpoint is found.
24. **Cloud cron now runs 5 steps:** Fetch daily data → Fetch news → Build AI context → Commit + push → Send morning email. Run duration ~17-20s.
25. **AI cost guards:** per-IP 10/hr + 50/day, AI_DISABLED kill switch (env var; can be set via wrangler secret put or dashboard), Anthropic spend cap $20/mo account-wide (shared with pickleball — sufficient).
26. **ai-config.json lives outside `app/` SHELL_FILES** — flipping `aiEnabled` doesn't require SW + APP_VERSION bump. It's a data swap, not a shell swap.
27. **Session-end requires explicit ATP** — see `feedback_shutdown_atp.md` in baseball auto-memory. Do NOT initiate Handoff/Kickoff/final commit/push without owner saying "ATP shutdown" or equivalent.
28. **Mandatory session-end XPL audit** — per `~/.claude/CLAUDE.md`, every session in every project must run the XPL audit at session-end (after ATP). Output is one line if no candidates, candidate list + summary otherwise. Always wait for owner approval before adding to user-level file.
29. **Windows wrangler-paste bug → Cloudflare dashboard** — XPL-001. Do not retry `wrangler secret put` if a Worker is getting authentication-related rejections; go straight to dashboard.
30. **Windows `&` in user path** — invoke wrangler from PowerShell (not cmd.exe) + use global install. XPL-002.
31. **NEW: Trivia stubs use extended schema** — they carry `question` + `answer` fields directly so the apply step is a simple append into `trivia.json`. Different from legend/moment stubs which have `name`+`summary` and need authored full entries at apply time.
32. **NEW: One PAT for both Worker routes** — `/refresh` (Actions:write) + `/submit` (Issues:write) share a single fine-grained `GITHUB_TOKEN` scoped to `jjmgladden/baseball-daily`. Don't create separate tokens.
33. **NEW: Renumber-after-filter for TOC + collapsible sections** — pattern is `.filter(s => s.body).map((s, i) => ({ ...s, num: i + 1 }))`. Used in cardinals.js, history.js, news.js. Apply to any future tab that uses the pattern.
34. **NEW: Mobile stale-page bug fixed via SW split-handler** — KB-0021 auto-reload + KB-0034 SW data-path network-first work TOGETHER. The auto-reload delivers the new SW; the new SW has the data-path fix. Once owner's mobile picks up v22, the bug is gone permanently.

---

## Session-End Reminders (For When Session 11 Closes)

Per CLAUDE.md v13 § Session-End Protocol (MANDATORY — never skip; **requires explicit ATP from owner**):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. **(v13)** Update `docs/credentials.md` if any credentials touched (e.g. flipping `GITHUB_TOKEN` ⏸ → ✅ if KB-0020 fully closed this session)
3. Archive previous CLAUDE.md / data-schema versions if any rolled
4. Write `sessions/BASEBALL_Handoff_Prompt_V11.md` — full Session 11 record
5. Write `sessions/BASEBALL_Kickoff_Prompt_Session12.md` — concise start-here
6. List file changes for the owner
7. Release-readiness check: CHANGELOG-compatible summary
8. Run the mandatory session-end XPL audit per `~/.claude/CLAUDE.md` — propose any new XPL-NNN candidates; wait for owner approval; print summary block regardless of outcome
9. Report: what was done, what's next, blockers

---

**End of Kickoff Session 11. Pickleball-parity roadmap CLOSED. Mobile stale-snapshot bug FIXED. KB-0020 closes-pending-PAT. Trivia tab redesigned + 20 verified stubs in the weekly-batch pipeline.**

**Main-track choice is yours:**
- **A — Verify KB-0020 fully closes** (5 min if PAT is uploaded; otherwise walk through the upload steps)
- **B — Apply latest weekly-batch Issue** (~30 min — likely fresh batch awaits since Monday cron)
- **C — KB-0013 On-This-Day expansion via trivia-style backlog flow** (~60 min)
- **D — Themed trivia batch via chat-prompt** (~20-30 min content expansion)
- **E — Status close** (5 min)
