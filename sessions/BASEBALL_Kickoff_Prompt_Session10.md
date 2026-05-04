# Ozark Joe's Baseball Daily Intelligence Report — Session 10 Kickoff Prompt

**Prepared:** 2026-05-03 (end of Session 9)
**Session Start:** Session 10
**Handoff:** [V9](BASEBALL_Handoff_Prompt_V9.md) (Session 9 — Phase B6 LIVE)
**Predecessor chain:** V9 → V8 (B5) → V7 (B4) → V6 (B3) → V5 (B2) → V4 (B1) → V3 → V2 → V1
**KB:** 33 entries (KB-0001 through KB-0033)
**[CLAUDE.md](http://CLAUDE.md):** v13 (project) + **NEW user-level CLAUDE.md** at `C:\Users\John & Cindy Gladden\.claude\CLAUDE.md` with XPL-001..006
**Snapshot schemas:** main v6 · news v1 · **ai-context v1 (NEW)**
**SW cache + APP_VERSION pill:** **v18** (rolled this session)

---

## Read These First (In Order)

1. **`[CLAUDE.md](http://CLAUDE.md)` (project)** — v13: APP_VERSION pairing rule + Session-End Step 2 credentials.md mandate
2. **`~/.claude/CLAUDE.md` (NEW user-level)** — XPL-001..006 cross-project lessons + mandatory session-end XPL audit instruction
3. **`sessions/BASEBALL_Handoff_Prompt_V9.md`** — full Session 9 record (Phase B6 LIVE)
4. **`sessions/BASEBALL_Handoff_Prompt_V8.md`** — Session 8 (Phase B5)
5. **`sessions/BASEBALL_Handoff_Prompt_V1.md`** — Session 1 (still authoritative for architecture)
6. **`docs/[knowledge-base.md](http://knowledge-base.md)`** — 33 entries
7. **`docs/[credentials.md](http://credentials.md)`** — v2 (5 active credentials now including ANTHROPIC_API_KEY)
8. **This file** (Kickoff Session 10) — what to do right now

---

## Session-Start Protocol (MANDATORY)

Run every item before proposing work:

1. Read CLAUDE.md (project v13) + user-level CLAUDE.md (XPL-001..006) + Handoffs V9 → V1 + KB
2. **Dump open KB items to screen:**
   ```
   OPEN (dynamic):
     KB-0028  T2  Owner+Claude   Pickleball-parity plan — B7 only remaining (B1-B6 done)
     KB-0020  T2  Claude         Public on-demand refresh (could fold into baseball-daily-api as /refresh route)
     KB-0021  T2  Claude         Auto-reload on SW update (~15 lines in app.js)
     KB-0013  —   —              On-This-Day seed expansion (content-only)

   OPEN (static awaiting owner action):
     KB-0024  —   Owner          Submission Worker — code now LIVE inside baseball-daily-api;
                                 Suggest UI hookup separate (update SUBMIT_URL, optional GitHub PAT)
   ```
3. **Check main snapshot freshness:**
   ```
   head -5 data/snapshots/latest.json
   ```
4. **Check news snapshot freshness:**
   ```
   head -10 data/snapshots/news-latest.json
   ```
   The May 4 cron should be the **first** to refresh news-latest.json from cloud (Sessions 8-9 commits landed AFTER May 3 cron fired).
5. **Check ai-context bundle freshness (NEW):**
   ```
   head -5 data/snapshots/ai-context.json
   ```
   Should show `generatedAt` from this morning's cron — first cloud-built ai-context bundle.
6. **Daily-cron health check** — first cron to run all 4 ingestion steps (fetch-daily + fetch-news + build-ai-context + send-email v3 with Top News):
   ```
   gh run list --repo jjmgladden/baseball-daily --workflow=daily.yml --limit 3
   ```
   Latest scheduled run should be `success`. Run duration may be ~25-35s (added ~5 sec for build-ai-context). Pull the run log if anything looks off.
7. **Worker health:**
   ```
   curl https://baseball-daily-api.jjmgladden.workers.dev/health
   ```
   Should return `{"ok":true,"worker":"baseball-daily-api","routes":["POST /submit","POST /ai"],"aiEnabled":true}`.
8. **Live AI smoke test (optional but recommended):**
   ```
   curl -X POST https://baseball-daily-api.jjmgladden.workers.dev/ai \
     -H "Origin: http://localhost:1882" \
     -H "Content-Type: application/json" \
     -d '{"question":"How are the Cardinals doing this season?"}'
   ```
   Should return `{"ok":true,"answer":"...","model":"claude-haiku-4-5-20251001",...}`.
9. **Check for open weekly-batch / submission Issues:**
   ```
   gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open
   gh issue list --repo jjmgladden/baseball-daily --label submission --state open
   ```
   Note: weekly-batch should fire Monday May 4 — if Session 10 happens after that, expect an Issue.
10. **Check GitHub Secrets state** — should show 5 active:
    ```
    gh secret list --repo jjmgladden/baseball-daily
    # Expected: ANTHROPIC_API_KEY, EMAIL_FROM, EMAIL_RECIPIENTS, RESEND_API_KEY, YOUTUBE_API_KEY
    ```
11. **Confirm no stale files need archiving** per versioning rules. None expected unless B7 rolls a version.
12. **Verify APP_VERSION pill renders v18 on the live site.**
13. **Verify Ask tab on the live site** — click 9th nav button "Ask". Should show chat UI (input + Ask + Clear + history pane). Type a test question; verify response.
14. **Report session health** — one line: `[SESSION HEALTH] Compacted: ? | Context Load: ? | Risk: ?`

---

## What Just Happened (Session 9 — One Paragraph)

Single-track session executing **Pickleball-parity Phase B6 — AI Q&A layer** end-to-end. Eight code-side deliverables shipped: build-ai-context.js (16-section ~5,556-token bundle), Worker rewritten as `baseball-daily-api` (3 routes: /ai, /submit, /health), ask.js chat tab (9th nav slot), ai-config.json browser-side gate, wired into shell with paired SW v17→v18 + APP_VERSION v17→v18, daily.yml +Build AI context bundle step, credentials.md v1→v2 + archive. Owner-side activation chain (~90 min, mostly debug): created ANTHROPIC_API_KEY, struggled with cmd.exe ampersand-path bug (switched to PowerShell), wrangler login OAuth-tab-behind-terminal confusion, deployed Worker, flipped ai-config.json to aiEnabled:true, then hit Anthropic 400-empty for ~30 min before diagnosing the same Windows masked-input single-char paste bug as pickleball Session 8. Re-pasted via Cloudflare dashboard → immediate fix. Live `/ai` test returned a real Cardinals answer (20-13 NL Central 2nd, W6, 3-2 over Dodgers, Jordan Walker 10th HR), 8,105-token cache creation. Browser smoke test against deployed site Ask tab returned a real chat-UI answer. **Cross-project meta-deliverable:** owner asked "how do we create a cross-project KB? I am tired of having to debug the same damn problem" — created `C:\Users\John & Cindy Gladden\.claude\CLAUDE.md` (auto-loaded into every project session under this user account) with XPL-001..006 + mandatory automated session-end XPL audit with summary block. KB-0033 added; KB-0028 B6 done; KB-0024 superseded; baseball auto-memory got `feedback_shutdown_atp.md` mirroring pickleball's. One minor cleanup deferred: 60-sec `wrangler deploy` from worker/ to drop the unused `/aitest` debug route.

---

## Top Priorities for Session 10 — Pick ONE Main Track

The pickleball-parity plan (KB-0028) has only **B7** remaining. Side tasks have accumulated; quick wins are also options.

### Option A — **Session 10 First Task (Always): drop /aitest from deployed Worker (~60 sec)**

Whichever main track you pick, run this first to clean up:
```
cd "C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project\worker"
wrangler deploy
```
That's it. The `/aitest` route was removed in commit `f53b0e9` but `wrangler deploy` to push it didn't run before terminal close. After this 60-sec deploy, hit `https://baseball-daily-api.jjmgladden.workers.dev/aitest` to confirm it returns 404.

### Option B — **Phase B7: TOC + accordion backport (~3-4 hr) — finishes the pickleball-parity roadmap**

Last piece of the pickleball-parity sequence. Direct port of pickleball KB-0040 Phase L1:
- Copy `.tab-toc` / `.tab-section` / `.tab-callout` CSS from pickleball's `app/styles/main.css` (~104 lines) into baseball's
- Refactor `app/js/tabs/cardinals.js` (sections: Retired Numbers · HOFers · Historic Seasons · Traditions · Legends deep-dive)
- Refactor `app/js/tabs/history.js` (sections: On This Day · Iconic Moments · Strangest Plays · Franchise Lineages)
- Refactor `app/js/tabs/news.js` (Today / This Week / Recent buckets become collapsible)
- Optional: Ask tab gets a TOC-pinned suggestion list ("Try: 'How are the Cardinals doing?', 'Show me today's standings', etc.")
- SW cache + APP_VERSION bump v18 → v19 (paired)
- Pre-push ESM check

After B7 ships, KB-0028 closes entirely. Pickleball-parity complete.

### Option C — **Side tasks only (~30 min each)**

- **KB-0021 close** — Auto-reload on SW update. ~15-line change in `app/js/app.js`. Now ideal because we just did SW v17→v18 + the next SW bump (B7) would benefit from it. Bumps to v19 paired.
- **KB-0020 fold-in** — Add `/refresh` route to `baseball-daily-api` that triggers `daily.yml` workflow_dispatch. Reuses the now-deployed Worker (the original "deploy a new Worker just for this" cost is gone). ~30 lines in worker/src/index.js + wire a button into the app footer. Bump SW + APP_VERSION.
- **MASN news source** — find RSS endpoint and re-enable in `data/master/news-sources.json`. ~5 min if endpoint exists; ~30 min of investigation if not.
- **KB-0013 expansion** — content additions to `data/master/on-this-day-seed.json`.

### Option D — **Status close**

If everything's running clean (cron green, email arrived, AI tab working) and owner just wants confirmation, a 5-min status check works.

---

## Side Tasks (Interleave as Appropriate)

- KB-0013 On-This-Day expansion
- Themed trivia/legend batches via chat-prompt → Claude drafts → owner approves
- MASN RSS endpoint discovery + re-enable
- AI Q&A monitoring — check `wrangler tail` periodically to see real-world questions; identify gaps in ai-context.json that surface as "I don't have that information" answers
- Investigate weekly-batch Issue if Monday 2026-05-04 fired one

---

## Expected Deliverables from Session 10

**Minimum:**
- Session-start protocol checks (especially the new ai-context bundle freshness + Worker /health + Ask tab smoke test)
- Option A first (60 sec)
- One main-track option (B/C/D) executed OR clean status close
- Updated `docs/[knowledge-base.md](http://knowledge-base.md)` (any KB changes)
- Updated `docs/[credentials.md](http://credentials.md)` if any credential changes (none expected unless B7 unexpectedly touches one)
- Mandatory session-end XPL audit per the new user-level CLAUDE.md instruction
- Handoff V10 + Kickoff Session 11 at session end (after explicit owner ATP)

**Ambitious (if main = B7):**
- B7 fully shipped — KB-0028 closes entirely (last pickleball-parity phase done)
- 1 side task

---

## System State Snapshot (End of Session 9)

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Repo:** `github.com/jjmgladden/baseball-daily` (public)
- **Daily cron:** 07:00 UTC — autonomous; now does fetch-daily + fetch-news + build-ai-context + commit + send-email
- **Daily email:** LIVE v3 with 3 recipients; first v3 scheduled-cron send pending May 4
- **Weekly crons:** Monday 08:00 UTC (Chadwick rebuild + curation batch); next fire May 4
- **Worker:** **LIVE** at `https://baseball-daily-api.jjmgladden.workers.dev` with `/ai` + `/submit` + `/aitest` (debug — to drop) + `/health`
- **Most recent commits:**
  - `f53b0e9` chore: Worker — remove debug /aitest route + keep verbose [ai] error logging
  - `21c2b57` chore: enable AI Q&A — Worker deployed at baseball-daily-api.jjmgladden.workers.dev
  - `7f4e245` feat: Phase B6 — AI Q&A layer (Ask tab + Cloudflare Worker + ai-context)
  - (one more commit at session close: KB updates + Handoff V9 + Kickoff Session 10)
- **CLAUDE.md (project):** v13
- **CLAUDE.md (user-level, NEW):** v1 with XPL-001..006 + automated session-end audit
- **SW cache + APP_VERSION pill:** v18
- **Snapshot schemas:** main v6, news v1, ai-context v1
- **Email template:** v3
- **Worker package:** v2 (renamed `baseball-daily-submit` → `baseball-daily-api`)
- **GitHub Secrets:** 5 active (added ANTHROPIC_API_KEY)
- **Cloudflare Worker secrets:** 1 (ANTHROPIC_API_KEY)
- **Local `.env`:** 1 key (`YOUTUBE_API_KEY`)
- **Actions versions:** `actions/checkout@v6`, `actions/setup-node@v6`
- **`scripts/check-esm.js`:** active; `npm run check:esm` exits 0 with **23 modules**
- **News tab:** LIVE with 40 items / 6 sources
- **Ask tab:** **LIVE** end-to-end
- **Trivia:** 30 questions; Curation backlog: 131 pending
- **Open Issues:** none

---

## Critical Reminders (Things That Have Bitten Us — Do Not Forget)

1. **SW cache bump is NOT automatic** — any `app/js/` / `app/styles/` / `app/index.html` / `app/manifest.webmanifest` / `app/icon.svg` / `app/icons/` change MUST bump `CACHE` in `app/sw.js` in the same commit. (Critical Rule.)
2. **APP_VERSION pairing rule** — when bumping `CACHE` in `app/sw.js`, also bump `APP_VERSION` in `app/js/app.js`. No exceptions.
3. **`node --check` misses ESM syntax errors** — run `npm run check:esm` before push for any `app/js/` change. Tool now covers **23 modules**.
4. **Approve ALL checkbox at top of weekly Issues** — preserved.
5. **MLB YouTube channel disables third-party embedding** — highlights render as clickable thumbnails in app + email v3.
6. **Pages needs 1-2 min to rebuild after push** — verify via `gh api repos/jjmgladden/baseball-daily/pages/builds/latest --jq .status` before telling owner ready.
7. **Email is LIVE v3** — first v3 scheduled-cron send pending May 4. Spot-check the run.
8. **Worker is LIVE** — `baseball-daily-api` at `https://baseball-daily-api.jjmgladden.workers.dev`. Both `/ai` and `/submit` deployed (submit dormant pending Suggest UI hookup, KB-0024).
9. **Never commit `.env`** — `check-secrets.js` will flag it; gitignored anyway.
10. **Pickleball is a sibling project, NOT a sub-project** — no shared git history, no shared CLAUDE.md, no shared KB. Cross-project sharing limited to Resend, YouTube key, glad-fam.com domain, Cloudflare account, Anthropic account. **All sharing posture documented in `docs/[credentials.md](http://credentials.md)` AND `~/.claude/CLAUDE.md` XPL-004/005/006.**
11. **Cross-project secret transfer pattern** — pipe via stdin (`gh secret set`); never echo to chat; never use `--body` flag. **Cloudflare Worker secrets: USE THE DASHBOARD, NOT `wrangler secret put` ON WINDOWS** (XPL-001 — bit pickleball Session 8 + baseball Session 9; future projects MUST use the dashboard from the start).
12. **GitHub Secrets are write-only** — there is no `gh secret get`. Source of truth is owner's password manager + the deployment locations.
13. **Single source-of-truth for email config** — Resend trio lives ONLY in GitHub Secrets, NOT in local `.env`.
14. **Snapshot schemas: main v6, news v1, ai-context v1** — independent files, fetched independently. Email template v3 reads main + news (defensively). Worker reads ai-context. Don't merge them.
15. **Always flag data-shape gaps before extending ingestion** — never silently bump schema or extend ingestion just because a kickoff implies a field exists.
16. **`app/js/app.js` MUST guard `main()` invocation with `typeof document !== 'undefined'`** — without it, `npm run check:esm` exits 1.
17. **CLAUDE.md v13 Session-End Step 2: update `docs/[credentials.md](http://credentials.md)` whenever credentials change.**
18. **`scripts/build-icons.js` re-runnable.** If icon.svg changes, `npm run build:icons` regenerates all 6 PNGs. Bump SW + APP_VERSION + commit.
19. **error-messages component** — Session 8 News tab + Session 9 Ask tab use `errorBannerHtml(...)` and `soft-banner` for failure paths. Future tabs MUST use the same helpers.
20. **`.claude/launch.json`** — preview-server config for Claude Preview MCP (port 1882). Local Ask-tab testing against the live Worker works because CORS allows `localhost:1882`.
21. **News separate from main snapshot, ai-context separate from both** — three independent files. Each fetched by its own ingestion script. Each consumed independently. DO NOT merge.
22. **MASN news source disabled placeholder** — re-enable is a one-line config edit when an RSS endpoint is found.
23. **Cloud cron now runs 5 steps:** Fetch daily data → Fetch news → Build AI context → Commit + push → Send morning email. Run duration grew slightly.
24. **AI cost guards:** per-IP 10/hr + 50/day, AI_DISABLED kill switch (env var; can be set via wrangler secret put or dashboard), Anthropic spend cap $20/mo account-wide (shared with pickleball — sufficient).
25. **ai-config.json lives outside `app/` SHELL_FILES** — flipping `aiEnabled` doesn't require SW + APP_VERSION bump. It's a data swap, not a shell swap.
26. **Worker `/aitest` route still in deployed code** until first task of Session 10. Harmless but should be cleaned up.
27. **NEW: Session-end requires explicit ATP** — see `feedback_shutdown_atp.md` in baseball auto-memory. Do NOT initiate Handoff/Kickoff/final commit/push without owner saying "ATP shutdown" or equivalent.
28. **NEW: Mandatory session-end XPL audit** — per `~/.claude/CLAUDE.md`, every session in every project must run the XPL audit at session-end (after ATP). Output is one line if no candidates, candidate list + summary otherwise. Always wait for owner approval before adding to user-level file.
29. **NEW: Windows wrangler-paste bug → Cloudflare dashboard** — XPL-001. Do not retry `wrangler secret put` if a Worker is getting authentication-related rejections; go straight to dashboard.
30. **NEW: Windows `&` in user path** — invoke wrangler from PowerShell (not cmd.exe) + use global install. XPL-002.

---

## Session-End Reminders (For When Session 10 Closes)

Per CLAUDE.md v13 § Session-End Protocol (MANDATORY — never skip; **requires explicit ATP from owner**):

1. Update `docs/[knowledge-base.md](http://knowledge-base.md)` — add new entries, close completed items, bump Last-updated date
2. **(v13)** Update `docs/[credentials.md](http://credentials.md)` if any credentials touched
3. Archive previous CLAUDE.md / data-schema versions if any rolled
4. Write `sessions/BASEBALL_Handoff_Prompt_V10.md` — full Session 10 record
5. Write `sessions/BASEBALL_Kickoff_Prompt_Session11.md` — concise start-here
6. List file changes for the owner
7. Release-readiness check: CHANGELOG-compatible summary
8. **NEW:** Run the mandatory session-end XPL audit per `~/.claude/CLAUDE.md` — propose any new XPL-NNN candidates; wait for owner approval; print summary block regardless of outcome
9. Report: what was done, what's next, blockers

---

**End of Kickoff Session 10. Phase B6 LIVE end-to-end. Worker `baseball-daily-api` deployed. Ask tab works. User-level cross-project KB created with XPL-001..006. Mandatory session-end XPL audit instruction now active across all projects under this user. One phase remains on the pickleball-parity roadmap (B7 = TOC + accordion backport).**

**Main-track choice is yours:**
- **A — `wrangler deploy` to drop /aitest** (60 sec, do this first regardless of main track)
- **B — Phase B7 (TOC + accordion)** — last pickleball-parity phase, ~3-4 hr; closes KB-0028 entirely
- **C — Side tasks** (KB-0021 auto-reload, KB-0020 /refresh route fold-in, MASN endpoint discovery, content expansion)
- **D — Status close** — quick "everything green" session
