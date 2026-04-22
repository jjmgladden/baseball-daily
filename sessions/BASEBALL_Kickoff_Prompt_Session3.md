# Ozark Joe's Baseball Daily Intelligence Report — Session 3 Kickoff Prompt

**Prepared:** 2026-04-22 (end of Session 2)
**Session Start:** Session 3
**Handoff:** V2 (covers Session 2; V1 covers Session 1)
**KB:** 25 entries (KB-0001 through KB-0025)
**CLAUDE.md:** v12 (unchanged this session)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — project rules, critical boundaries, mandatory protocols
2. **`sessions/BASEBALL_Handoff_Prompt_V2.md`** — Session 2 record (the email feature session)
3. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 record (the original full build; still authoritative for architecture)
4. **`docs/knowledge-base.md`** — 25 KB entries with statuses
5. **`docs/Daily-Email-Setup-Guide.docx`** — if email questions come up
6. **This file** (Kickoff Session 3) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md + Handoff V2 + Handoff V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0025  T2  Owner/Claude   Daily email — Resend signup + Secrets pending
     KB-0020  T2  Claude         Public on-demand refresh
     KB-0021  T2  Claude         Auto-reload on SW update
     KB-0007  T3  Claude         PNG icon set for iOS
     KB-0022  T3  External       Node 20 deprecation before Sept 2026

   OPEN (static awaiting owner action):
     KB-0024  —   Owner          Submission Worker deployment
     KB-0025  —   Owner          Email activation
   ```
3. **Check snapshot freshness:**
   ```
   cat data/snapshots/latest.json | head -5
   ```
   Should show a `generatedAt` within the last 24 hours.
4. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   If any Monday(s) have passed since Session 2 (2026-04-22, Wednesday), there will be batch Issues waiting. Between Session 2 and Session 3, **2026-04-27 (Monday)** is the next fire date.
5. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   Only populated if owner has deployed the Worker (KB-0024) and someone submits.
6. **Check email activation status:**
   ```
   gh secret list --repo jjmgladden/baseball-daily
   ```
   If `RESEND_API_KEY` is listed, email is active — KB-0025 can be moved to Closed.
7. **Report session health** — one line: `[SESSION HEALTH] Compacted: No | Context Load: Light | Risk: nominal`.

---

## What Just Happened (Session 2 — One Paragraph)

Narrow single-feature session on 2026-04-22. Owner asked for a daily morning email after ingestion; four design decisions confirmed (Resend provider, extensible comma-separated recipient list as GitHub Secret, default `resend.dev` sender with custom-domain path documented, rich HTML preview + CTA link). Feature built in 3 new files + 1 workflow YAML change (commit `e60891f`). Follow-up session-end docs produced: comprehensive Word-doc reference (`docs/Daily-Email-Setup-Guide.docx`, 12 sections / 11 tables) covering baseball + future pickleball setup + GitHub-vs-local + the "two parallel lists" sync question, plus KB-0025 and a re-runnable python-docx generator (commit `bad19a7`). No version bumps, no UI changes, no schema changes. Email skips silently until owner adds two GitHub Secrets (~5 min).

---

## Top Priorities for Session 3 — Pick ONE Main Track

### Option A — **Pickleball sibling project (major new build)**

Same recommendation as Kickoff Session 2. Not yet started. Owner flagged it as equivalent scope to the entire baseball project. **Start in a NEW project folder:**

- New folder: `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\`
- Fresh `CLAUDE.md` (copy Critical Rules from baseball v12)
- Fresh Phase 0 planning (data-source research: PPA Tour, MLP, APP Tour, DUPR)
- Reuse email pattern from baseball — see `docs/Daily-Email-Setup-Guide.docx` §5 for the mirror pattern (same Resend account, separate Secrets in pickleball repo)

Expected output: Phase 0 proposal (architecture, data sources, tab layout) awaiting owner ATP. Actual Phase 1 code probably needs Session 4.

### Option B — **Owner activation tasks (hand-walk or verify)**

If owner wants to knock out pending Secrets/deploys:
- **Email activation** (KB-0025, ~5 min) — Resend signup + two GitHub Secrets. Walkthrough: `docs/Daily-Email-Setup-Guide.docx` §4.
- **Worker deployment** (KB-0024, ~30 min) — Cloudflare account + wrangler deploy + PAT setup. Walkthrough: `worker/README.md`.

Claude's role: answer questions, verify via `gh` CLI after the fact, flip KB statuses to Closed.

### Option C — **Knock out a backlog item (1-2 hours)**

- **KB-0021 (T2)** — Auto-reload on SW update. ~15 lines. Eliminates "hard-refresh twice" user friction. Implementation sketch is in the KB entry.
- **KB-0020 (T2)** — Public on-demand refresh. Cloudflare Worker proxy pattern. Larger than KB-0021; requires KB-0024 (submission Worker) deployed first (same infrastructure).

### Option D — **Weekly batch triage + content expansion**

If Monday 2026-04-27 (or later) has passed:
1. Open the new weekly batch Issue (#5 or later).
2. Owner taps ✅ Approve ALL (or individual boxes).
3. Claude applies approved entries to appropriate main files (`legends-general.json`, `historical-videos.json`, `stories.json`).
4. Flip backlog statuses.
5. Consider expanding `curation-backlog.json` if it's below ~30 pending entries. As of Session 2 close: 131 pending.

---

## Side Tasks (Interleave as Appropriate)

- **On-This-Day expansion (KB-0013)** — add 10-20 more entries to `data/master/on-this-day-seed.json`. Content-only.
- **Trivia expansion** — owner chat-prompt *"do a [theme] trivia batch"* → Claude drafts → owner approves via Issue → Claude applies.
- **Themed legend batches** — *"do a brothers in baseball batch"* / *"father-son duos"* / *"WWII veterans"* / *"Cardinals managers"*.

---

## Expected Deliverables from Session 3

**Minimum:**
- One main-track option (A/B/C/D) executed
- Updated `docs/knowledge-base.md` (any KB changes)
- Handoff V3 + Kickoff Session 4 at session end

**Ambitious:**
- Main track + 1-2 side tasks
- KB entries flipped to Closed as appropriate (KB-0024 or KB-0025 on owner activation)

---

## System State Snapshot (End of Session 2)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC (3 AM EDT / 2 AM EST) — includes email step (skips silently until Secrets set)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Owner's local:** `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project\`
- **Local dev server:** `npm run serve` → `http://localhost:1882/`
- **Most recent commit at Session 2 close:** `bad19a7` (Add Daily-Email-Setup-Guide.docx + KB-0025). Session handoff commit will follow.
- **CLAUDE.md:** v12
- **SW cache:** v14
- **Snapshot schema:** v5
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at Session 2 close
- **Email feature:** **code shipped (commit e60891f); activation pending owner**

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md.) Session 2 did NOT touch `app/`, so no bump needed. If Session 3 touches `app/`, bump it.

2. **`node --check` misses ESM syntax errors** — run `node -e "import('./file.js')"` for every changed `app/js/` file before committing. (Critical Rule in CLAUDE.md.) Session 2 did not touch ESM files.

3. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden` in every Issue body. Don't remove this.

4. **Approve ALL checkbox at top of weekly Issues** — preserved in the workflow generator. Don't remove.

5. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails, NOT iframes.

6. **Pages needs 1-2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

7. **Worker is not yet deployed** — "Suggest a player or moment" footer link shows graceful "not yet configured" on submit. Don't break this.

8. **Email is not yet activated** — `RESEND_API_KEY` not set. Workflow logs `[send-email] RESEND_API_KEY not set — skipping` and exits 0. Don't try to "fix" this — it's the designed behavior until the owner adds the Secret.

9. **Never commit `.env`** — `check-secrets.js` will flag it; it's gitignored anyway, but be cautious with `git add -A`.

---

## Session-End Reminders (For When Session 3 Closes)

Per CLAUDE.md § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items
2. Archive previous CLAUDE.md / data-schema versions if any rolled
3. Write `sessions/BASEBALL_Handoff_Prompt_V3.md` — full Session 3 record
4. Write `sessions/BASEBALL_Kickoff_Prompt_Session4.md` — concise start-here
5. List file changes for the owner
6. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
7. Report: what was done, what's next, blockers

---

**End of Kickoff Session 3. Site is autonomous; email code-shipped; content pipeline running. Main-track choice is yours — Pickleball kickoff (new folder), owner-activation hand-walk (5-30 min), backlog item (KB-0020 / KB-0021), or weekly batch triage once Monday 2026-04-27 fires.**
