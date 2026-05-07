# Ozark Joe's Baseball Daily Intelligence Report — Handoff V11

**Session:** 11
**Date:** 2026-05-06
**Predecessor:** [BASEBALL_Handoff_Prompt_V10.md](BASEBALL_Handoff_Prompt_V10.md) (Session 10, 2026-05-04 → 2026-05-06 — 7-track omnibus)
**Successor Kickoff:** [BASEBALL_Kickoff_Prompt_Session12.md](BASEBALL_Kickoff_Prompt_Session12.md)

---

## Session Scope — One Paragraph

Single-track focused session. Owner had limited time in-session, ATP'd Option C (KB-0013 closing path) for autonomous execution while away. Track C work: (1) extended `.github/workflows/weekly-batch.yml` routing comment to include `on-this-day` → `on-this-day-seed.json` (apply step lifts the nested `seedEntry` block); (2) authored 33 verified On-This-Day stubs spanning seven clusters (5 Cardinals priority — Musial 3,000th + final game, Freese walk-off, Cards 2011 Game 7, Denkinger blown call; 4 debuts/firsts — Williams MLB debut, Frank Robinson 1st Black manager, Negro Leagues recognition, Shore relief no-no; 10 single-game performances — Koufax perfect, Rose 4,192, Williams' final-AB HR, Clemente 3,000, Clemens 20K, Seaver 19K, Ryan #1/#6/#7, Henderson SB record, Seaver 300; 5 postseason — Reggie 3 HRs, Dodgers 1955, Morris G7 1991, Angels 2002, Carter walk-off; 4 cultural — Monday flag, Piazza 9/11, Ruth's farewell, DH adopted; 4 records — Aaron 714, Bonds 715, Bonds 71, Judge rookie 50; 1 bizarre — Merkle's Boner); (3) seeded into `curation-backlog.json` via new `scripts/seed-on-this-day-2026-05-06.js` (idempotent, mirrors trivia-seed precedent), backlog 141 → 174 pending; (4) discovered + flagged a broken existing entry in `on-this-day-seed.json` line 46 (fictitious 07-17-1990 "Twins UTP" — clearly a draft typo that shipped, mid-sentence "Billy Ripken — wait, Cleveland's Carlos Baerga"); after owner ATP'd "fix", replaced it with the verified Bill Wambsganss unassisted triple play from Game 5 of the 1920 World Series (10-10-1920) — the only UTP in WS history, and the most famous UTP in MLB history; (5) updated KB-0013 status from Open(deferred) → Open(in flight) with full Session 11 progress block + Quick Index update + bumped Last-updated header. Owner ATP'd commit + push + Session Shutdown Protocol at end. No version rolls — CLAUDE.md, snapshot/news/ai-context schemas, SW + APP_VERSION, email template, Worker package, credentials.md all unchanged. KB-0020 PAT upload still pending owner-side action (independent of this session's work).

---

## Current Versions

| Artifact | Version | Change This Session |
|---|---|---|
| CLAUDE.md (baseball) | **v13** | no change |
| User-level CLAUDE.md | **v1** | no change (XPL audit produced 0 candidates this session — see audit section) |
| Snapshot schema (main) | **v6** | no change |
| News snapshot schema | **v1** | no change |
| AI context bundle schema | **v1** | no change |
| SW cache (`app/sw.js`) | **v22** | no change (no `app/` files modified) |
| APP_VERSION | **v22** | no change |
| **Knowledge base** | **KB-0001 → KB-0034** | KB-0013 status flipped Open(deferred) → Open(in flight); no new entries; Quick Index updated; Last-updated bumped |
| Handoff prompt | **V11** | new |
| Kickoff prompt | **Session 12** | new |
| Email template | **v4** | no change |
| `send-email.js` | **v3** | no change |
| `fetch-daily.js` | **v6** | no change |
| `fetch-news.js` | unchanged | unchanged |
| `build-ai-context.js` | unchanged | unchanged |
| Worker — `baseball-daily-api` | **v3.0.0** | no change (3 routes still LIVE; `/refresh` still awaits owner PAT) |
| `app/js/tabs/*` | unchanged | unchanged |
| `app/js/components/*` | unchanged | unchanged |
| Email recipient list | 3 recipients | no change |
| Local `.env` keys | 1 key (`YOUTUBE_API_KEY`) | no change |
| `docs/credentials.md` | **v3** | no change |
| **`.github/workflows/weekly-batch.yml`** | — | **routing comment extended: `on-this-day` → `on-this-day-seed.json` (apply step lifts `seedEntry` block)** |
| **`scripts/seed-on-this-day-2026-05-06.js` (NEW)** | NEW | one-shot seed script — 33 OTD stubs |
| **`data/master/curation-backlog.json`** | — | **+33 OTD stubs (141 → 174 pending; status counts: 33 OTD · 20 trivia · 121 other)** |
| **`data/master/on-this-day-seed.json`** | — | **broken line 46 entry replaced — Wambsganss 1920 UTP swapped in for fictitious Twins UTP composite** |
| GitHub Secrets | 5 active | no change |
| Cloudflare Worker secrets | 1 active (`ANTHROPIC_API_KEY`) | no change — `GITHUB_TOKEN` for KB-0020/0024 still ⏸ owner action |

---

## What Happened — Work Track (Chronological)

### Session-Start

Read CLAUDE.md (project v13 + user-level v1 with XPL-001..006), Handoff V10, Kickoff Session 11. Live-state checks all green:
- Today's daily.yml run (May 6 09:31:37Z, 21s, success). Snapshot/news/ai-context all generated 09:31:5Xs in lockstep — 5,202-token AI context bundle.
- Worker `/health`: `{ok:true, routes:["/submit","/ai","/refresh"], aiEnabled:true, refreshEnabled:false}` — 3 routes deployed; **`refreshEnabled:false`** means `GITHUB_TOKEN` not yet uploaded by owner.
- 5 GitHub Secrets active (matches Session 10 end-state).
- 0 open Issues (weekly-batch + submission). Last closed = Issue #5 from May 4, applied in Session 10.
- KB has 34 entries; KB-0028 + KB-0021 closed in Session 10 as expected.

Reported `[SESSION HEALTH] Compacted: No | Context Load: Light | Risk: None — all systems green except KB-0020 awaiting owner PAT upload`. Surfaced main-track options (A/B/C/D/E) per Kickoff. Recommended Option A (KB-0020 PAT upload, 5-min close) IF owner had time, else Option C (KB-0013 OTD expansion).

### Owner ATP — "do B and C without my involvement, will do A when I return"

Confirmed Option B not available (no closed-pending Issue exists; next batch fires May 11). Proceeded with Option C autonomously.

### Track C — KB-0013 closing path

**Step 1 — Schema research.** Read `data/master/on-this-day-seed.json` (52 existing entries; schema `{date: 'MM-DD', year, type, title, description, tags}`). Read `ingestion/on-this-day.js` — confirmed the auto-generator surfaces HOF-caliber births from Chadwick (≥10 MLB seasons) at runtime, so curated birthday stubs would double-render. Decision: exclude all birthdays from curated set. Read `scripts/seed-trivia-2026-05-05.js` and `scripts/apply-batch-2026-05-04.js` for the seed-script + apply-script patterns. Read `weekly-batch.yml` Issue body builder — confirmed it reads `e.name` + `e.summary` + `e.id` + `e.type` + `e.priority`, so OTD stubs render cleanly with no builder changes needed.

**Step 2 — Schema design.** Trivia uses flat extra fields (`question`, `answer`) since the apply step is just `{question, answer}` → trivia.json. OTD has 6 fields (date / year / type / title / description / tags) + apply target is on-this-day-seed.json. Chose **nested `seedEntry`** block over flat fields for clean apply semantics — the future apply step just lifts `entry.seedEntry` and appends. Top-level schema: `{id, type:'on-this-day', category, name, summary, source, priority, status}`. Documented in seed script header + KB-0013.

**Step 3 — Routing update.** Extended `weekly-batch.yml` routing comment line: added `on-this-day` → `on-this-day-seed.json` (apply step lifts `seedEntry` block) to the type-routing instruction string. Workflow YAML structure unchanged.

**Step 4 — Authoring 33 verified stubs.** Drafted 35 candidates, trimmed to 33 high-confidence. Verification posture: every entry corresponds to a publicly documented event with a canonical reference (Wikipedia / Baseball Reference / SABR / MLB.com). No exact (date+year) duplicates with existing seed; 6 MM-DD overlaps (different years, intentional — multiple iconic events on same calendar date are a feature, not a bug, of the OTD surfacing logic). Strongest cluster: 10-27 will surface 4 entries each year (existing Red Sox '04 + new Morris '91 + Angels '02 + Freese '11 — all WS-clinching/walk-off moments).

**Step 5 — Seed script + run.** Wrote `scripts/seed-on-this-day-2026-05-06.js` mirroring trivia-seed pattern. Idempotent (skip-by-id). First run: +33, 0 skipped. Second run (idempotency check): +0, 33 skipped. Backlog: 141 → 174 pending (33 OTD · 20 trivia · 121 other). Priority distribution: 19 priority-1 + 14 priority-2.

**Step 6 — KB update.** Flipped KB-0013 from Open(deferred) → Open(in flight) with full Session 11 progress block. Updated Quick Index. Did NOT bump Last-updated header at this point (per shutdown-ATP discipline; happened at session-end).

### Discovery + Fix — broken `on-this-day-seed.json` line 46

While reading the existing seed for duplicate-check during stub authoring, noticed:
```json
{ "date": "07-17", "year": 1990, "type": "milestone",
  "title": "Minnesota Twins turn unassisted triple play",
  "description": "Twins shortstop Billy Ripken — wait, Cleveland's Carlos Baerga — executed rare unassisted triples in the era." }
```

Three problems: (a) Billy Ripken was an Orioles 2B, never a Twin; (b) "— wait, Cleveland's Carlos Baerga —" reads like authoring scratchpad that escaped review; (c) 07-17-1990 doesn't correspond to a real UTP. Surfaced to owner with two options (fix / delete). Owner ATP'd "fix".

**Fix:** replaced line 46 with **Bill Wambsganss's unassisted triple play in Game 5 of the 1920 World Series** (10-10-1920) — the only UTP in WS history, and the single most famous UTP in MLB history. Cleveland Indians 2B caught a Clarence Mitchell line drive, stepped on second to double off Pete Kilduff, then tagged Otto Miller running from first. Cleveland won the game 8-1 and the Series 5-2 over Brooklyn. New tags: `["indians", "world-series", "fielding"]`. The 07-17 date now has no curated entry — fine, since the prior one wasn't real. October 10 picks up an iconic Game-5-of-the-Series moment.

### Session-end (this Handoff write)

Owner ATP'd "git push + Push to Origin + Session Shutdown Protocol". Per CLAUDE.md v13:
1. Updated `docs/knowledge-base.md` Last-updated header for Session 11.
2. `docs/credentials.md` — no change this session (no credentials touched). Skipped per CLAUDE.md v13 Step 2 conditional.
3. No version rolls — no archives needed.
4. Wrote this Handoff V11.
5. Wrote Kickoff Session 12.
6. XPL audit — see audit section below.
7. Commit + push (next).

---

## Decisions Committed

| # | Decision | Rationale |
|---|---|---|
| 1 | OTD stubs use nested `seedEntry` block (not flat fields like trivia) | Trivia has 2 extra fields (Q+A), OTD has 6 (date/year/type/title/description/tags). Nesting keeps the apply step as `dest.push(entry.seedEntry)` — single line. Flat fields would require explicit field-by-field copy. |
| 2 | Birthdays deliberately excluded from OTD stubs | `ingestion/on-this-day.js` auto-surfaces HOF-caliber births from Chadwick (≥10 MLB seasons). Curated birthday stubs would double-render on the daily report. Documented in KB-0013 + seed script header. |
| 3 | 33 stubs (vs Kickoff's "30-50" target) | Verification rigor over count. Each of the 33 has a canonical public reference. The pipeline now exists — more stubs can be added in any future session without code changes. |
| 4 | Replace broken line 46 with Wambsganss (10-10-1920) instead of finding a different real UTP for 07-17 | 07-17-1990 doesn't correspond to a real UTP. Wambsganss is by far the most iconic UTP in MLB history (and the only postseason one). 07-17 simply loses a curated entry — acceptable since the prior was fictitious. |
| 5 | Did NOT trim 10-27 cluster (4 entries on same date after this session) | Each is a Game 6 walk-off or Game 7 WS-clinching moment from a different era / fanbase. Owner can trim later if UI clutter manifests. The OTD surfacing logic handles multi-entry days fine. |
| 6 | No SW cache bump this session | None of the modified files are in `app/` or app shell paths. Per the SW-cache-bump rule, only `app/js/`, `app/styles/`, `app/index.html`, `app/manifest.webmanifest`, `app/icon.svg`, `app/icons/` changes require the bump. |
| 7 | No commit/push during the work — held for owner ATP | Per `feedback_shutdown_atp.md` memory: do not initiate session-end protocol unprompted. Owner ATP'd commit + push + shutdown at end. |

---

## System State at End

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous; runs fetch-daily + fetch-news + build-ai-context + commit + send-email v4 (verified Session 11 morning run green)
- **Daily email:** LIVE v4 with 3 recipients
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch) — curation now routes `on-this-day` type
- **Worker `baseball-daily-api`:** 3 routes LIVE at `https://baseball-daily-api.jjmgladden.workers.dev` (`/ai`, `/submit`, `/refresh`) + `/health`. `refreshEnabled:false` until owner PAT upload.
- **CLAUDE.md (project):** v13 (unchanged)
- **CLAUDE.md (user-level):** v1 with XPL-001..006 (unchanged)
- **SW cache + APP_VERSION pill:** v22 (unchanged)
- **Snapshot schemas:** main v6, news v1, ai-context v1 (all unchanged)
- **Email template:** v4 (unchanged)
- **Worker package:** v3 (unchanged)
- **GitHub Secrets:** 5 active — `ANTHROPIC_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`, `RESEND_API_KEY`, `YOUTUBE_API_KEY`
- **Cloudflare Worker secrets:** 1 active — `ANTHROPIC_API_KEY`. Owner action remaining: paste `GITHUB_TOKEN` for `/refresh` + `/submit`.
- **Local `.env`:** 1 key (`YOUTUBE_API_KEY`) — unchanged
- **Curation backlog:** **174 pending** (was 141; +33 OTD stubs). Distribution: 33 OTD · 20 trivia · 121 other.
- **`on-this-day-seed.json`:** 51 entries (count unchanged — Wambsganss replaced the fictitious Twins UTP in-place on line 46; net count flat).
- **Open Issues:** none
- **Open KB items:** KB-0013 (in flight), KB-0020 (closes-pending-PAT), KB-0024 (closes with same PAT)

---

## Known Issues / Tech Debt

- **`GITHUB_TOKEN` Worker secret still not set** (carryover from Session 10). Both `/refresh` and `/submit` return 500 until owner pastes a fine-grained PAT (Actions:write + Issues:write) via the Cloudflare dashboard (XPL-001). ~5 min of owner work; closes both KB-0020 and KB-0024.
- **KB-0013 still Open (in flight)** — no longer deferred. 33 stubs in pipeline; Monday May 11 cron will surface the first 10. Closure trigger remains owner-declared "coverage feels right."
- **KB-0020 owner-side activation chain unchanged.** Same instructions remain in Kickoff Session 11 / V10 Handoff: create fine-grained PAT scoped to `jjmgladden/baseball-daily`, paste as `GITHUB_TOKEN` Worker secret via Cloudflare dashboard.

---

## Open KB Items (post-Session-11)

```
OPEN (dynamic):
  KB-0013  —    Limitation     On-This-Day seed expansion (in flight — 33 stubs in pipeline; weekly-batch.yml routes on-this-day; awaiting owner approvals via Issue checkbox flow over coming Mondays)
  KB-0020  —    Owner          Public on-demand refresh — code shipped + deployed; awaits owner PAT (~5 min) via Cloudflare dashboard. Fully closes when /health shows refreshEnabled:true.

OPEN (static awaiting owner action):
  KB-0024  —    Owner          Submission Worker — code LIVE inside baseball-daily-api; Suggest UI hookup separate; same GITHUB_TOKEN PAT as KB-0020 covers it.
```

**Closed in this session:** none. KB-0013 status changed but remains Open (in flight, not closed — closing trigger is owner-declared coverage sufficiency).

---

## Cross-Project Lessons Surfaced This Session — XPL Audit

Mandatory session-end XPL audit per `~/.claude/CLAUDE.md`. Reflected on Session 11 work for cross-project candidates.

Reflection candidates considered + rejected:

1. **"Before extending a curation backlog with a new type, check if the surfacing layer auto-generates content for that type."** — saved me from authoring duplicate birthday OTD stubs (Chadwick auto-surfaces them). REJECTED — project-specific to baseball's player-index + on-this-day pipeline.
2. **"When extending a stubs backlog with a new type, choose nested vs flat extra-fields based on count of fields the apply step needs."** — design pattern that emerged comparing trivia (Q+A flat) vs OTD (6-field nested). REJECTED — bar (a) requires "bitten in 2+ projects"; this is a baseline schema-design judgment, not a recurring pain.
3. **"Read existing curated data before adding to it — broken entries surface during duplicate-check."** — found the line-46 typo by accident while checking for date overlap. REJECTED — this is general code-review hygiene, not a project-spanning operational gotcha. Already implicit in many existing practices.
4. **"Owner-while-away ATP'd autonomous work should never include `commit + push`."** — kept the working tree dirty through the autonomous segment, only committed after explicit shutdown ATP. REJECTED — this IS the existing rule (`feedback_shutdown_atp.md` baseball auto-memory + general session-end discipline). Already encoded.

**Decision:** No additions to `~/.claude/CLAUDE.md` this session.

```
[XPL audit] No cross-project candidates from this session.
[XPL audit summary] Nothing added. ~/.claude/CLAUDE.md unchanged. Current entry count: 6.
```

---

## Release-Readiness Summary (CHANGELOG-compatible)

- **Added:**
  - 33 verified On-This-Day stubs in `curation-backlog.json` (Cardinals priority + iconic moments + records). Surface 10/week starting May 11 Monday cron via the existing weekly-batch Issue flow.
  - `scripts/seed-on-this-day-2026-05-06.js` — one-shot seed; idempotent.
- **Changed:**
  - `weekly-batch.yml` routing comment now includes `on-this-day` → `on-this-day-seed.json` so future Claude sessions know how to apply approved OTD stubs.
  - KB-0013 status flipped Open(deferred) → Open(in flight).
- **Fixed:**
  - **Broken `on-this-day-seed.json` line 46** — the fictitious "Twins UTP 1990" entry has been live on the site since whenever it was first authored, surfacing wrong information every July 17. Replaced with **Bill Wambsganss's UTP in Game 5 of the 1920 World Series (10-10-1920)** — the only postseason UTP in MLB history.
- **Security:** none.

---

## File Changes (explicit)

**New files:**
- `scripts/seed-on-this-day-2026-05-06.js` (~280 lines)
- `sessions/BASEBALL_Handoff_Prompt_V11.md` (this file)
- `sessions/BASEBALL_Kickoff_Prompt_Session12.md`

**Modified:**
- `.github/workflows/weekly-batch.yml` (routing comment +`on-this-day` mapping)
- `data/master/curation-backlog.json` (+33 OTD stubs; backlog 141 → 174 pending)
- `data/master/on-this-day-seed.json` (line 46 broken entry replaced with verified Wambsganss UTP 1920-10-10)
- `docs/knowledge-base.md` (KB-0013 in-flight status + Quick Index update + Last-updated header bumped)

**Owner-side state changes:** none. No deploys. No secret changes. No Worker re-deploys.

---

## Report to Owner — Brief

**Done:**
- Track C — KB-0013 closing path is now in flight. 33 verified On-This-Day stubs seeded into the curation backlog. The Monday May 11 weekly-batch cron will surface 10 of them as a fresh Issue for your approval (priority sort puts the priority-1 entries — the most iconic — first; 19 of the 33 are priority 1, so the next 1-2 batches will be all OTD until that set is consumed).
- Broken `on-this-day-seed.json` line 46 fixed. The fake "Twins UTP 1990" entry that has been silently shipping wrong information every July 17 is replaced with Bill Wambsganss's iconic 1920 World Series UTP on October 10. Verified.
- KB updated; Quick Index updated; Last-updated header bumped to Session 11.
- XPL audit run — no cross-project candidates.

**Owner action remaining (~5 min) to close KB-0020 + KB-0024:**
1. Create fine-grained GitHub PAT scoped to `jjmgladden/baseball-daily` only, with `Actions: Read and write` + `Issues: Read and write`. Single PAT covers both Worker routes.
2. Paste into Cloudflare dashboard → `baseball-daily-api` → Settings → Variables and Secrets → Add → Type: Secret → Name: `GITHUB_TOKEN`. **NOT `wrangler secret put` on Windows** — XPL-001 paste-mangling bug.
3. Verify: `curl https://baseball-daily-api.jjmgladden.workers.dev/health` shows `"refreshEnabled":true`.
4. Optional smoke test: click "Refresh now" in the site footer → page reloads in ~53s on fresh snapshot.

**Blockers:** none.
