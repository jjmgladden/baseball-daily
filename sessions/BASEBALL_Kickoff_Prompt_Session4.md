# Ozark Joe's Baseball Daily Intelligence Report — Session 4 Kickoff Prompt

**Prepared:** 2026-04-22 (end of Session 3)
**Session Start:** Session 4
**Handoff:** V3 (covers Session 3) · V2 (Session 2) · V1 (Session 1)
**KB:** 26 entries (KB-0001 through KB-0026)
**CLAUDE.md:** v12 (unchanged)

---

## Read These First (In Order)

1. **`CLAUDE.md`** (auto-loaded) — project rules, critical boundaries, mandatory protocols
2. **`sessions/BASEBALL_Handoff_Prompt_V3.md`** — Session 3 record (the Pickleball-bootstrap session)
3. **`sessions/BASEBALL_Handoff_Prompt_V2.md`** — Session 2 record (the email feature session)
4. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 record (the original full build; still authoritative for architecture)
5. **`docs/knowledge-base.md`** — 26 KB entries with statuses
6. **`docs/Daily-Email-Setup-Guide.docx`** — if email questions come up
7. **This file** (Kickoff Session 4) — what to do right now

---

## Session-Start Protocol (MANDATORY — CLAUDE.md § Session-Start Protocol)

Run every item before proposing work:

1. Read CLAUDE.md + Handoff V3 + V2 + V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0025  T2  Owner          Daily email — Resend signup + Secrets pending
     KB-0020  T2  Claude         Public on-demand refresh
     KB-0021  T2  Claude         Auto-reload on SW update
     KB-0007  T3  Claude         PNG icon set for iOS
     KB-0022  T3  External       Node 20 deprecation before Sept 2026
     KB-0013  —   Claude         On-This-Day seed expansion (content-only)

   OPEN (static awaiting owner action):
     KB-0024  —   Owner          Submission Worker deployment
     KB-0025  —   Owner          Email activation
   ```
3. **Check snapshot freshness:**
   ```
   head -5 data/snapshots/latest.json
   ```
   Should show a `generatedAt` within the last 24 hours.
4. **Check for open weekly-batch Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   ```
   Between Session 3 (2026-04-22, Wednesday) and Session 4, **2026-04-27 (Monday)** is the next fire date. If Session 4 happens after that, expect 1+ batch Issue waiting.
5. **Check for open submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   Only populated if owner has deployed the Worker (KB-0024) and someone submits.
6. **Check email activation status:**
   ```
   gh secret list --repo jjmgladden/baseball-daily
   ```
   If `RESEND_API_KEY` is listed, email is active — flip KB-0025 to Closed.
7. **Check pickleball-side cross-pollination signals** (new this session — Session 3 spawned pickleball):
   - Has owner reported back from pickleball Phase 0 with anything baseball should adopt? (E.g., a better source-confidence pattern, a cleaner JSON schema convention.)
   - If yes: list as a candidate side-task. If no: skip.
8. **Report session health** — one line: `[SESSION HEALTH] Compacted: No | Context Load: Light | Risk: nominal`.

---

## What Just Happened (Session 3 — One Paragraph)

Single-track documentation session on 2026-04-22. Owner presented a Perplexity-authored draft research prompt for a new pickleball project and asked it to be made effective for Claude Opus 4.7 in a fresh Claude Code project, with future AI Q&A flagged as a Phase 4 add-on. Analysis + 11-gap audit + recommended additions presented; ATP received. Owner created the destination folder `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\`. Two files written there: a 523-line comprehensive Session 1 kickoff prompt (identity, working style, Critical Rules verbatim from baseball v12, locked tech stack, cross-project sharing rules, compressed Phase 0 research brief, five Phase 0 deliverables, phased roadmap, AI Q&A schema implications, MODR conventions, 10 lessons-learned guardrails) and an 18-line bootstrap stub `CLAUDE.md` redirecting any new pickleball Claude session to read the kickoff first. Baseball-side: KB-0026 added recording the spawn; no baseball production code changed; no version bumps. Pickleball Session 1 confirmed underway in its own Claude Code project at owner's session-end report.

---

## Top Priorities for Session 4 — Pick ONE Main Track

### Option A — **Owner activation tasks (hand-walk or verify)**

The two pending Open static items have been outstanding since Session 1 / Session 2. If owner wants to clear them:

- **Email activation** (KB-0025, ~5 min) — Resend signup + two GitHub Secrets. Walkthrough: `docs/Daily-Email-Setup-Guide.docx` §4.
- **Worker deployment** (KB-0024, ~30 min) — Cloudflare account + wrangler deploy + PAT setup. Walkthrough: `worker/README.md`.

Claude's role: answer questions, verify via `gh` CLI after the fact, flip KB statuses to Closed, write a short verification log.

### Option B — **Knock out a backlog item (1–2 hours)**

- **KB-0021 (T2)** — Auto-reload on SW update. ~15 lines in `app/js/app.js`. Eliminates "hard-refresh twice" user friction. Implementation sketch is in the KB entry. Easy win. **Triggers SW cache bump rule** (CLAUDE.md §4.8) and pre-push JS check (§4.9).
- **KB-0020 (T2)** — Public on-demand refresh. Cloudflare Worker proxy pattern. Larger than KB-0021; same Cloudflare infrastructure as KB-0024 (submission Worker), so makes sense to do this *after* the owner has a Cloudflare account set up.

### Option C — **Weekly batch triage + content expansion**

If Monday 2026-04-27 (or later) has passed since Session 3 closed:

1. Open the new weekly batch Issue (#5 or later).
2. Owner taps ✅ Approve ALL (or individual boxes).
3. Claude applies approved entries to appropriate main files (`legends-general.json`, `historical-videos.json`, `stories.json`, etc.).
4. Flip backlog statuses.
5. Consider expanding `curation-backlog.json` if it's below ~30 pending entries. As of Session 3 close: still 131 pending.

### Option D — **Cross-pollinate from pickleball Phase 0**

If the pickleball project has reported back its Phase 0 deliverables to the owner, and the owner finds something worth backporting to baseball, this session can apply those backports. Possibilities:

- Improved JSON schema patterns (the AI Q&A schema constraints from pickleball kickoff §10 — stable IDs, ID-not-name cross-refs, structured source citations, T1/T2/T3 confidence as first-class fields, append-only snapshots — are all things baseball could adopt too)
- Additional source-confidence visibility on UI cards
- Alternative source-conflict resolution policy

Wait for owner direction; don't assume backports are wanted.

### Option E — **Side task only (~30 min each)**

- **On-This-Day expansion (KB-0013)** — add 10-20 more entries to `data/master/on-this-day-seed.json`. Content-only, low-risk.
- **Trivia expansion** — owner chat-prompt *"do a [theme] trivia batch"* → Claude drafts → owner approves via Issue → Claude applies.
- **Themed legend batches** — *"do a brothers in baseball batch"* / *"father-son duos"* / *"WWII veterans"* / *"Cardinals managers"*.

---

## Side Tasks (Interleave as Appropriate)

Same as Session 3:

- On-This-Day expansion
- Themed trivia batches
- Themed legend batches
- Cardinals-deep enrichment (Bottomley, Musial, Gibson, Pujols already covered; deeper biographical detail possible)

---

## Expected Deliverables from Session 4

**Minimum:**
- One main-track option (A/B/C/D/E) executed
- Updated `docs/knowledge-base.md` (any KB changes)
- Handoff V4 + Kickoff Session 5 at session end

**Ambitious:**
- Main track + 1-2 side tasks
- KB entries flipped to Closed as appropriate (KB-0024 or KB-0025 on owner activation)
- Optional: backports from pickleball Phase 0 if owner directs

---

## System State Snapshot (End of Session 3)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC (3 AM EDT / 2 AM EST) — includes email step (skips silently until Secrets set)
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch)
- **Owner's local:** `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project\`
- **Local dev server:** `npm run serve` → `http://localhost:1882/`
- **Most recent production-code commit:** `bad19a7` (Session 2 — Daily-Email-Setup-Guide.docx + KB-0025)
- **Pending commit at Session 3 close:** KB-0026 + Handoff V3 + Kickoff Session 4 (awaiting owner approval to commit)
- **CLAUDE.md:** v12
- **SW cache:** v14
- **Snapshot schema:** v5
- **Trivia questions:** 30 seeded
- **Curation backlog:** 131 pending (unchanged since Session 1)
- **Open Issues:** none at Session 3 close
- **Email feature:** **code shipped (commit `e60891f`); activation still pending owner**
- **Sibling project:** **Pickleball Project bootstrapped this session**; Phase 0 underway in its own Claude Code project; baseball not affected

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule in CLAUDE.md §4.8.) Session 3 did NOT touch `app/`, so no bump needed. **If Session 4 picks Option B (KB-0021 auto-reload), this WILL trigger the rule** — `app/js/app.js` will change.

2. **`node --check` misses ESM syntax errors** — run `node -e "import('./file.js')"` for every changed `app/js/` file before committing. (Critical Rule in CLAUDE.md §4.9.) Session 3 did not touch ESM files. **If Session 4 picks Option B, this rule applies.**

3. **GitHub Issues need @mention for email notifications** — weekly-batch workflow includes `@jjmgladden` in every Issue body. Don't remove this.

4. **Approve ALL checkbox at top of weekly Issues** — preserved in the workflow generator. Don't remove.

5. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails, NOT iframes.

6. **Pages needs 1–2 minutes to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner the site is ready.

7. **Worker is not yet deployed** — "Suggest a player or moment" footer link shows graceful "not yet configured" on submit. Don't break this.

8. **Email is not yet activated** — `RESEND_API_KEY` not set. Workflow logs `[send-email] RESEND_API_KEY not set — skipping` and exits 0. Don't try to "fix" this — it's the designed behavior until the owner adds the Secret.

9. **Never commit `.env`** — `check-secrets.js` will flag it; it's gitignored anyway, but be cautious with `git add -A`.

10. **Pickleball project is a sibling, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing is limited to: shared Resend account/key, shared YouTube API key. Do not absorb pickleball work into the baseball repo. (Critical reminder added Session 3.)

---

## Session-End Reminders (For When Session 4 Closes)

Per CLAUDE.md § Session-End Protocol (MANDATORY — never skip):

1. Update `docs/knowledge-base.md` — add new entries, close completed items
2. Archive previous CLAUDE.md / data-schema versions if any rolled
3. Write `sessions/BASEBALL_Handoff_Prompt_V4.md` — full Session 4 record
4. Write `sessions/BASEBALL_Kickoff_Prompt_Session5.md` — concise start-here
5. List file changes for the owner
6. Release-readiness check: CHANGELOG-compatible summary (Added / Changed / Fixed / Security)
7. Report: what was done, what's next, blockers

---

**End of Kickoff Session 4. Site is autonomous; email code-shipped (activation pending); content pipeline running; pickleball is a separate sibling project now in flight.**

**Main-track choice is yours:**
- **Owner-activation hand-walk** (5–30 min) — Email (KB-0025) or Worker deploy (KB-0024)
- **Backlog item** — KB-0021 auto-reload (small, easy) or KB-0020 public refresh (larger, needs Cloudflare account first)
- **Weekly batch triage** — if Monday 2026-04-27 has passed
- **Cross-pollinate from pickleball Phase 0** — only if owner directs
- **Side task only** — On-This-Day, themed trivia, themed legend batch
