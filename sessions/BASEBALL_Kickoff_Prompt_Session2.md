# Ozark Joe's Baseball Daily Intelligence Report — Session 2 Kickoff Prompt

**Prepared:** April 20, 2026 (end of Session 1)
**Session Start:** Session 2
**Handoff:** V1 (full Session 1 record)
**KB:** v1 (24 entries — KB-0001 through KB-0024)
**CLAUDE.md:** v12

---

## Read These First (in order)

1. **`CLAUDE.md`** (auto-loaded) — project rules, critical boundaries, mandatory protocols
2. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — full Session 1 record (what exists, why, how)
3. **`docs/knowledge-base.md`** — all 24 KB entries with statuses
4. **`memory/MEMORY.md`** + linked files — GitHub identity, SW cache rule (cross-session reference)
5. **This file** (Kickoff Session 2) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work. In particular:

1. Read CLAUDE.md + Handoff V1 + KB
2. **Dump open KB items to screen:**
   - Dynamic: KB-0007 (T3), KB-0013, KB-0020 (T2), KB-0021 (T2), KB-0022 (T3), KB-0024 (pending owner deploy)
3. **Check snapshot freshness:**
   ```
   cat data/snapshots/latest.json | head -5
   ```
   Should show a `generatedAt` within the last 24 hours (cron fires at 07:00 UTC daily).
4. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   If Monday has passed since Session 1, there will be a new batch Issue (#4) awaiting approval.
5. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   Only populated if the owner has deployed the Worker and someone has submitted.
6. **Report session health**: `[SESSION HEALTH] Compacted: No | Context Load: Light | Risk: nominal` (assumes fresh session).

---

## What Just Happened (Session 1 — One-Paragraph Summary)

In a single extended session 2026-04-19 through 2026-04-20, the project went from zero to a fully deployed, autonomous MLB intelligence site: **https://jjmgladden.github.io/baseball-daily/**. Phases 0–3B delivered plus substantial content-and-polish work: YouTube highlight ingestion, game recaps with scoring plays, 30 curated legends + 10 brothers + 12 strangest plays + 20 narrative stories + 30 trivia questions, weekly curation workflow with checkbox approval Issues, public submission Cloudflare Worker (code ready, owner must still deploy), splash screen intro for the owner's brother in Virginia, unified Stories content hub, dedicated Trivia tab. 14 commits pushed. CLAUDE.md rolled 12 times. SW cache rolled 14 times. Only two known incidents (SW stale-shell after UI update; ESM import syntax error) — both documented as rules in CLAUDE.md v12.

---

## Top Priorities for Session 2 — Pick ONE Main Track

### Option A — **Pickleball sibling project (major new build)**

Equivalent scope to the entire baseball project. Owner flagged this at the end of Session 1 as a separate full development effort. **Recommendation: start in a NEW project folder**, mirror the baseball conventions.

- New folder: `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\`
- Fresh `CLAUDE.md` (copy the Critical Rules section from baseball's v12; adjust project-specific content)
- Fresh Phase 0 planning (data source research: PPA Tour, MLP, APP Tour, DUPR — all less mature than MLB Stats API)
- Owner's working style is the same — ATP discipline, whole-number versioning, MODR conventions

**Why new folder, not a tab in this project:** the baseball Stories Hub dilution taught the lesson — different domains live better in parallel projects than unified UI. Reference baseball's architecture via `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project\` for structural patterns only.

Expected Session 2 output if Option A: Phase 0 proposal (architecture, data sources, tab layout, folder structure) awaiting owner ATP. Actual Phase 1 code probably needs Session 3.

### Option B — **Deploy the Submission Worker (30 min)**

Code is committed and ready. Owner needs to:

1. Create Cloudflare account (free)
2. `cd worker && npx wrangler login`
3. Create a fine-grained GitHub PAT scoped to Issues-write on `jjmgladden/baseball-daily`
4. `npx wrangler secret put GITHUB_TOKEN`
5. `npx wrangler deploy`
6. Copy the Worker URL → update `SUBMIT_URL` constant in `app/js/components/suggest.js`
7. Commit + push → Suggestion modal goes live

Closes KB-0024 Open status. Walkthrough is in `worker/README.md`.

### Option C — **Knock out a backlog item (1–2 hours)**

- **KB-0021 (T2)** — Auto-reload on SW update (~15 lines; eliminates "hard-refresh twice" user friction). Implementation sketch is in the KB entry.
- **KB-0020 (T2)** — Public on-demand refresh button (Cloudflare Worker proxy pattern; larger than KB-0021).

### Option D — **Weekly batch triage + expansion**

If Monday has passed:

1. Open Issue #4 (new weekly batch). 10 pending entries from backlog.
2. Owner taps ✅ Approve ALL (or individual boxes).
3. Claude applies entries to appropriate main files (`legends-general.json`, `historical-videos.json`, `stories.json`).
4. Flip backlog statuses.
5. Consider: expand curation-backlog.json if it's below ~30 pending entries.

---

## Side Tasks (Interleave as Appropriate)

- **On-This-Day expansion (KB-0013)** — add 10-20 more entries to `data/master/on-this-day-seed.json` to cover gaps in the calendar. Content-only, no schema change.
- **Trivia expansion** — tell Claude in chat *"do a [theme] trivia batch"*. Owner approves via Issue → Claude applies.
- **Themed legend batches** — similarly, *"do a brothers in baseball batch"* / *"father-son duos"* / *"WWII veterans"* / *"Cardinals managers"* / *"iconic umpire moments"*.

---

## Expected Deliverables from Session 2

Minimum:
- One main-track option A/B/C executed
- Updated `docs/knowledge-base.md` (any KB changes)
- Handoff V2 + Kickoff for Session 3 at session end

Ambitious:
- Main track + 1-2 side tasks
- KB entries closed as appropriate (KB-0024 closes on Worker deploy; KB-0021 or KB-0020 on build)

---

## System State Snapshot (End of Session 1)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC (3 AM EDT / 2 AM EST)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Owner's local:** `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project\`
- **Local dev server:** `npm run serve` → `http://localhost:1882/`
- **Most recent commit at session close:** Session 1 handoff commit (this push)
- **CLAUDE.md:** v12
- **SW cache:** v14
- **Snapshot schema:** v5
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending, 20 active
- **Open Issues:** none at session close

---

## Critical Reminders (Things That Bit Us in Session 1)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` change MUST bump `CACHE` in `app/sw.js` in the same commit. This rule is now in CLAUDE.md § Critical Rules. Rule was violated once; the Refresh Data button was invisible to the owner's browser until v2→v3 cache bump.
2. **`node --check` misses ESM syntax errors** — run `node -e "import('./file.js')"` for every changed `app/js/` file before committing. This rule is now in CLAUDE.md § Critical Rules. Rule was violated once; a `\\'s` escape in stories.js blanked the deployed site until line 255 was fixed.
3. **GitHub Issues need @mention for email notifications** — the weekly-batch workflow includes `@jjmgladden` in every Issue body so the owner gets email. Don't remove this.
4. **Approve ALL checkbox at top of weekly Issues** — owner loves this (one tap vs ten). Added mid-Session 1 after tedium. Preserved in the workflow generator.
5. **MLB YouTube channel disables third-party embedding** — YouTube highlights are rendered as clickable thumbnails that open on youtube.com, NOT iframes. Error 153 if iframes are attempted.
6. **Pages needs 1–2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.
7. **Worker is not yet deployed** — the site's "Suggest a player or moment" footer link opens a modal that shows "not yet configured" on submit. This is GRACEFUL — don't break it while the Worker is pending.

---

## Session-End Reminders (For When Session 2 Closes)

Per CLAUDE.md § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items
2. Archive previous CLAUDE.md / data schema versions if any rolled
3. Write `sessions/BASEBALL_Handoff_Prompt_V2.md` — full Session 2 record
4. Write `sessions/BASEBALL_Kickoff_Prompt_Session3.md` — concise start-here for Session 3
5. List file changes for the owner
6. Release-readiness check: summarize shipped user-facing changes in CHANGELOG-compatible format
7. Report: what was done, what's next, blockers

---

**End of Kickoff Session 2. Site is autonomous; content pipeline is running. Main-track choice is yours — Pickleball (new project), Worker deploy (short), backlog item (medium), or weekly batch triage (whenever Monday hits).**
