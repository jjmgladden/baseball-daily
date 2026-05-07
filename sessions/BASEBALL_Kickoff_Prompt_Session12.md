# Ozark Joe's Baseball Daily Intelligence Report — Session 12 Kickoff Prompt

**Prepared:** 2026-05-06 (end of Session 11)
**Session Start:** Session 12
**Handoff:** [V11](BASEBALL_Handoff_Prompt_V11.md) (Session 11, single-track focused — Track C executed: KB-0013 closing path in flight; broken seed entry fixed)
**Predecessor chain:** V11 → V10 (omnibus) → V9 (B6) → V8 (B5) → V7 (B4) → V6 (B3) → V5 (B2) → V4 (B1) → V3 → V2 → V1
**KB:** 34 entries (KB-0001 through KB-0034); KB-0013 in flight, KB-0020 + KB-0024 closes-pending-PAT
**CLAUDE.md:** v13 (project) + user-level v1 with XPL-001..006
**Snapshot schemas:** main v6 · news v1 · ai-context v1 (no rolls)
**Email template:** v4 (no roll)
**SW cache + APP_VERSION pill:** v22 (no roll)
**Worker:** 3 routes LIVE at `https://baseball-daily-api.jjmgladden.workers.dev` (`/ai`, `/submit`, `/refresh`) + `/health`
**Curation backlog:** **174 pending** (33 OTD · 20 trivia · 121 other) — was 141 entering Session 11

---

## Read These First (In Order)

1. **`CLAUDE.md` (project)** — v13: APP_VERSION pairing rule + Session-End Step 2 credentials.md mandate
2. **`~/.claude/CLAUDE.md` (user-level)** — XPL-001..006 cross-project lessons + mandatory session-end XPL audit instruction
3. **`sessions/BASEBALL_Handoff_Prompt_V11.md`** — full Session 11 record (single-track Option C + line-46 fix)
4. **`sessions/BASEBALL_Handoff_Prompt_V10.md`** — Session 10 omnibus (7 tracks) for context on the in-flight features
5. **`docs/knowledge-base.md`** — 34 entries; KB-0013 entry has full Session 11 progress block
6. **`docs/credentials.md`** — v3 (5 active credentials; `GITHUB_TOKEN` Worker secret still ⏸ owner action)
7. **This file** (Kickoff Session 12) — what to do right now

---

## Session-Start Protocol (MANDATORY)

Run every item before proposing work:

1. Read CLAUDE.md (project v13) + user-level CLAUDE.md (XPL-001..006) + Handoffs V11 → V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0013  —    Limitation     On-This-Day seed expansion (in flight — 33 stubs in pipeline; weekly-batch routes on-this-day)
     KB-0020  —    Owner          Public on-demand refresh — code+route LIVE; awaits owner PAT (~5 min)

   OPEN (static awaiting owner action):
     KB-0024  —    Owner          Submission Worker — code LIVE; same PAT covers it; Suggest UI hookup separate
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
7. **Worker health (3 routes):**
   ```
   curl https://baseball-daily-api.jjmgladden.workers.dev/health
   ```
   If `refreshEnabled:true`, KB-0020 has been activated since Session 11 — flag it.
8. **Check open Issues — especially the Monday May 11 weekly-batch (likely the first OTD-heavy one):**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state closed --limit 3
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   **Read the latest closed weekly-batch Issue body** even if no Issue is currently open — that's where Session 10 got bitten (Issue #5 was closed-and-pending). The May 11 batch will be the first OTD-heavy Issue (priority sort puts the 19 priority-1 OTDs first; ~10 of them in the first batch).
9. **Check GitHub Secrets state** — should still show 5:
   ```
   gh secret list --repo jjmgladden/baseball-daily
   ```
10. **Confirm no stale files need archiving** per versioning rules.
11. **Verify `on-this-day-seed.json` line 46 fix is in place.** Should be a `10-10`/`1920` Wambsganss UTP entry, not the old broken `07-17`/`1990` Twins entry.
12. **Verify backlog count + priority distribution:**
    ```
    node -e "const d=JSON.parse(require('fs').readFileSync('data/master/curation-backlog.json','utf8')); const otd=d.entries.filter(e=>e.type==='on-this-day' && e.status==='pending'); console.log('OTD pending:', otd.length, 'priority-1:', otd.filter(e=>e.priority===1).length, 'priority-2:', otd.filter(e=>e.priority===2).length);"
    ```
    Expected immediately post-Session-11: 33 pending (19 priority-1, 14 priority-2). After May 11 batch lands + owner approves + apply step runs: number drops by ~10.
13. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 11 — One Paragraph)

Single-track focused session. Owner had limited time, ATP'd Option C autonomously while away. Track C executed: extended `weekly-batch.yml` routing comment to handle `on-this-day` → `on-this-day-seed.json` (apply step lifts `seedEntry` block), authored 33 verified On-This-Day stubs across 7 clusters (Cardinals priority + debuts/firsts + single-game performances + postseason + cultural + records + bizarre), seeded into `curation-backlog.json` via new `scripts/seed-on-this-day-2026-05-06.js` (idempotent; backlog 141 → 174 pending), updated KB-0013 status Open(deferred) → Open(in flight). Bonus discovery during stub-author duplicate-check: existing `on-this-day-seed.json` line 46 had a fictitious "Twins UTP 1990" entry shipping wrong info every July 17 (mid-sentence "Billy Ripken — wait, Cleveland's Carlos Baerga" looked like draft typo); after owner ATP'd "fix", replaced with verified Bill Wambsganss UTP from Game 5 of the 1920 World Series (10-10-1920) — the only postseason UTP in MLB history. No version rolls (CLAUDE.md, schemas, SW + APP_VERSION, email template, Worker, credentials all unchanged). 0 cross-project candidates from the mandatory XPL audit. KB-0020 PAT upload remains the only blocking owner-side action.

---

## Top Priorities for Session 12 — Pick ONE Main Track

### Option A — **Apply the Monday May 11 weekly-batch Issue (~30 min)**

**Likely the highest-value session-12 track.** The Monday May 11 cron should fire on schedule (08:00 UTC = 04:00 EDT) and create a fresh Issue with **10 priority-1 OTD stubs** (sorted: priority then id). Owner taps "Approve ALL" (top checkbox), closes the Issue, then Session 12:
1. `gh issue view <N> --repo jjmgladden/baseball-daily --json title,body,state,closedAt`
2. Determine approved set (top "Approve ALL" checkbox if checked, else per-line)
3. Author `scripts/apply-batch-2026-05-11.js` — idempotent. Lift `entry.seedEntry` from each approved backlog entry; append to `data/master/on-this-day-seed.json`. Flip backlog status pending → active.
4. Run; commit; push.
5. Verify next-morning daily.yml run surfaces a couple of newly-applied entries depending on date overlap (some of the OTD stubs target dates near today).

This pattern is identical to Session 10's Issue #5 application but the destination is `on-this-day-seed.json` instead of `legends-general.json` — and the apply step is even simpler (just `dest.push(entry.seedEntry)`).

### Option B — **Verify KB-0020 fully closes (5 min, status close)**

If owner uploaded `GITHUB_TOKEN` between sessions:
1. Verify `/health` shows `refreshEnabled:true`.
2. Click "Refresh now" in the site footer → status span should show `requesting refresh… ` then `refreshing… new data in ~45s. Reloading shortly.`
3. Page should auto-reload in ~53s.
4. After reload, snapshot's `generatedAt` should be ~now.
5. Mark KB-0020 fully closed in the KB; update `docs/credentials.md` `GITHUB_TOKEN` row to ✅. Same single PAT also activates KB-0024 (which is still gated on Suggest UI hookup but the backend is ready).

If owner hasn't done it yet, walk through the steps + offer to confirm afterward.

### Option C — **Themed batch via chat-prompt (~20-30 min)**

Owner specifies a theme — examples: *brothers in baseball*, *father-son duos*, *WWII veterans*, *Cardinals managers*, *iconic umpire moments*, *1985 Cardinals stories*, *Negro Leagues legends*. Claude drafts 10-20 themed entries (legend / story / moment / OTD as appropriate), opens a separate themed Issue with checkboxes (`themed-batch` label), or seeds directly if owner approves in chat. Extends the relevant pool beyond the natural Monday-cron pace.

### Option D — **Status close (~5 min)**

If the Monday May 11 batch is still pending owner approval (owner hasn't tapped checkboxes / closed yet), and KB-0020 PAT also still pending, there's no actionable main-track work. 5-minute health check + close.

---

## Side Tasks (Interleave as Appropriate)

- AI Q&A monitoring — `wrangler tail` to see real questions; identify gaps in ai-context.json that surface as "I don't have that information"
- MASN news source endpoint discovery + re-enable in `data/master/news-sources.json`
- Scan applied OTD entries against the 6 MM-DD overlaps with existing seed (09-29, 10-27, 04-08, 09-28) — confirm the multi-entry days render cleanly in the History tab on the next time today's date matches one
- Trivia pool growth — owner can prompt themed trivia batches anytime

---

## Expected Deliverables from Session 12

**Minimum:**
- Session-start protocol checks (especially `/health` for `refreshEnabled` state + the May 11 Issue state + backlog priority distribution)
- One main-track option executed OR clean status close
- Updated `docs/knowledge-base.md` (any KB changes)
- Updated `docs/credentials.md` if any credentials touched (e.g. flipping `GITHUB_TOKEN` ⏸ → ✅ if KB-0020 closed)
- Mandatory session-end XPL audit per `~/.claude/CLAUDE.md`
- Handoff V12 + Kickoff Session 13 at session end (after explicit owner ATP)

**Ambitious:**
- Option A (May 11 batch applied — first OTD entries land) + Option B (KB-0020 closed)

---

## System State Snapshot (End of Session 11)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous; runs fetch-daily + fetch-news + build-ai-context + commit + send-email v4
- **Daily email:** LIVE v4 with 3 recipients
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch — now routes `on-this-day` type)
- **Worker `baseball-daily-api`:** 3 routes LIVE; `refreshEnabled:false` until owner PAT upload
- **CLAUDE.md (project):** v13
- **CLAUDE.md (user-level):** v1 with XPL-001..006
- **SW cache + APP_VERSION pill:** v22 (no Session-11 roll)
- **Snapshot schemas:** main v6, news v1, ai-context v1
- **Email template:** v4
- **Worker package:** v3
- **GitHub Secrets:** 5 active
- **Cloudflare Worker secrets:** 1 active (`ANTHROPIC_API_KEY`); `GITHUB_TOKEN` ⏸ awaiting owner action
- **Local `.env`:** 1 key (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6`
- **`scripts/check-esm.js`:** active; `npm run check:esm` exits 0 with **24 modules** (no Session-11 change)
- **Curation backlog:** **174 pending** (33 OTD priority-sorted: 19 priority-1, 14 priority-2; 20 trivia; 121 other)
- **`on-this-day-seed.json`:** 51 entries (Wambsganss UTP swapped in for the broken Twins-UTP entry on line 46)
- **Open Issues:** none (post-Session-11; the next one to land is the May 11 weekly-batch)

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` / `app/icons/` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule.)
2. **APP_VERSION pairing rule** — when bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/js/app.js`. No exceptions.
3. **`node --check` misses ESM syntax errors** — run `npm run check:esm` before push for any `app/js/` change. Tool covers **24 modules**.
4. **SW fetch handler must differentiate `/data/` from shell paths** — baseball's SW v22 forward has the split handler. DO NOT revert.
5. **Approve ALL checkbox at top of weekly Issues** — preserved.
6. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails.
7. **Pages needs 1-2 min to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status`.
8. **Email is LIVE v4** — CTA + brief stats summary at TOP. v3 archived in git history (no source-code archive file — diverges from CLAUDE.md whole-number convention for build-time modules).
9. **Worker is LIVE with 3 routes** — `baseball-daily-api`. `/refresh` returns 500 until owner uploads `GITHUB_TOKEN`.
10. **Never commit `.env`** — `check-secrets.js` will flag it; gitignored anyway.
11. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB.
12. **Cross-project secret transfer pattern** — pipe via stdin (`gh secret set`); never echo to chat. **Cloudflare Worker secrets: USE THE DASHBOARD, NOT `wrangler secret put` ON WINDOWS** (XPL-001).
13. **GitHub Secrets are write-only** — there is no `gh secret get`.
14. **Single source-of-truth for email config** — Resend trio lives ONLY in GitHub Secrets, NOT in local `.env`.
15. **Snapshot schemas: main v6, news v1, ai-context v1** — independent files. Email template v4 reads main + news. Worker reads ai-context. Don't merge them.
16. **Always flag data-shape gaps before extending ingestion** — never silently bump schema.
17. **`app/js/app.js` MUST guard `main()` invocation with `typeof document !== 'undefined'`** — without it, `npm run check:esm` exits 1.
18. **CLAUDE.md v13 Session-End Step 2: update `docs/credentials.md` whenever credentials change.**
19. **`scripts/build-icons.js` re-runnable.** If icon.svg changes, `npm run build:icons` regenerates all 6 PNGs. Bump SW + APP_VERSION + commit.
20. **error-messages component** — News/Ask/Refresh tabs use the `errorBannerHtml(...)` helper or `.refresh-status` style. Future tabs MUST use the same patterns.
21. **`.claude/launch.json`** — preview-server config for Claude Preview MCP (port 1882).
22. **News + ai-context separate from main snapshot** — three independent files; don't merge.
23. **MASN news source disabled placeholder** — re-enable is a one-line config edit when an RSS endpoint is found.
24. **Cloud cron now runs 5 steps:** Fetch daily data → Fetch news → Build AI context → Commit + push → Send morning email. Run duration ~17-22s.
25. **AI cost guards:** per-IP 10/hr + 50/day, AI_DISABLED kill switch, Anthropic spend cap $20/mo (shared with pickleball).
26. **ai-config.json lives outside `app/` SHELL_FILES** — flipping `aiEnabled` doesn't require SW + APP_VERSION bump.
27. **Session-end requires explicit ATP** — see `feedback_shutdown_atp.md` in baseball auto-memory.
28. **Mandatory session-end XPL audit** — per `~/.claude/CLAUDE.md`. Output is one line if no candidates, candidate list + summary otherwise. Always wait for owner approval before adding to user-level file.
29. **Windows wrangler-paste bug → Cloudflare dashboard** — XPL-001.
30. **Windows `&` in user path** — invoke wrangler from PowerShell (not cmd.exe) + use global install. XPL-002.
31. **Trivia stubs use flat extra fields** — `{question, answer}` directly attached. Different from OTD which uses nested `seedEntry`.
32. **NEW (Session 11): OTD stubs use a NESTED `seedEntry` block** — top-level fields are `{id, type:'on-this-day', category, name, summary, source, priority, status}`; the actual seed-file content lives in `seedEntry: {date, year, type, title, description, tags}`. Apply step lifts `entry.seedEntry` and appends to `on-this-day-seed.json`. Different from trivia's flat pattern.
33. **NEW (Session 11): OTD stubs deliberately exclude player birthdays** — `ingestion/on-this-day.js` auto-surfaces HOF-caliber births from Chadwick (≥10 MLB seasons). Curated birthday stubs would double-render. Future themed batches MUST follow the same exclusion.
34. **One PAT for both Worker routes** — `/refresh` (Actions:write) + `/submit` (Issues:write) share a single fine-grained `GITHUB_TOKEN` scoped to `jjmgladden/baseball-daily`. Don't create separate tokens.
35. **Renumber-after-filter for TOC + collapsible sections** — pattern is `.filter(s => s.body).map((s, i) => ({ ...s, num: i + 1 }))`. Used in cardinals.js, history.js, news.js. Apply to any future tab using the pattern.
36. **Mobile stale-page bug fixed via SW split-handler (Session 10) + auto-reload (KB-0021).** Once owner's mobile picks up v22, the bug is gone permanently.

---

## Session-End Reminders (For When Session 12 Closes)

Per CLAUDE.md v13 § Session-End Protocol (MANDATORY — never skip; **requires explicit ATP from owner**):

1. Update `docs/knowledge-base.md` — add new entries, close completed items, bump Last-updated date
2. **(v13)** Update `docs/credentials.md` if any credentials touched
3. Archive previous CLAUDE.md / data-schema versions if any rolled
4. Write `sessions/BASEBALL_Handoff_Prompt_V12.md` — full Session 12 record
5. Write `sessions/BASEBALL_Kickoff_Prompt_Session13.md` — concise start-here
6. List file changes for the owner
7. Release-readiness check: CHANGELOG-compatible summary
8. Run the mandatory session-end XPL audit per `~/.claude/CLAUDE.md` — propose any new XPL-NNN candidates; wait for owner approval; print summary block regardless of outcome
9. Report: what was done, what's next, blockers

---

**End of Kickoff Session 12. KB-0013 in flight (33 OTDs pipeline; first batch on May 11 cron). Broken seed entry fixed (Wambsganss replaces fictitious Twins UTP). KB-0020 still closes-pending-PAT.**

**Main-track choice is yours:**
- **A — Apply the Monday May 11 weekly-batch Issue** (~30 min — likely fresh OTD-heavy batch awaiting; first chance to test the apply pipeline for type:'on-this-day')
- **B — Verify KB-0020 fully closes** (5 min if PAT uploaded; otherwise walk through the steps)
- **C — Themed batch via chat-prompt** (~20-30 min content expansion)
- **D — Status close** (5 min)
