# Ozark Joe's Baseball Daily Intelligence Report — Claude Code Project Instructions

**Version:** 12 | **Date:** April 20, 2026 | **Previous:** archive/CLAUDE_v11.md

---

## Project Context

Personal tool maintained by the project owner. Directive working style — delegates execution after go/no-go, pushes back on overcomplication, wants results not explanation.

**Primary interest:** St. Louis Cardinals (pinned top). Secondary: Washington Nationals. Full MLB coverage for context, standings, and league-wide features.

**Purpose:** Long-term daily-use tool. Automated MLB intelligence with historical research, universal player search, and curated baseball stories. Built to be used every morning by the owner and his brother (target reader in Virginia).

---

## Critical Rules — Read These First

### Authorization
**Do not proceed with significant changes until receiving Authorization to Proceed (ATP).** Confirm scope first; execute on go.

### Versioning
**All document and schema versioning uses whole numbers ONLY (v1, v2, v10).** No decimals, no underscores. ANY change — no matter how small — rolls the whole number. Applies to CLAUDE.md, JSON schemas, HTML shell, ingestion libraries, docs. Previous versions archive to the parent's `archive/` subfolder.

### Data Flow Architecture

```
ingestion/ (Node scripts — local or GitHub Actions)
    ↓ live API calls to MLB Stats API / Chadwick / YouTube
data/snapshots/YYYY-MM-DD.json   ← daily cache (grows over time)
data/master/*.json               ← franchises, player-index, stories,
                                     on-this-day-seed, cardinals-deep, trivia,
                                     legends-general, brothers, strange-plays,
                                     curation-backlog
    ↓
app/ (static PWA — SW + SVG icon; consumes JSON only at runtime)
```

JSON is the single source of truth. **The browser NEVER hits a live API.** All external calls happen in `ingestion/`.

### Secret Safety (non-negotiable)
1. API keys NEVER enter the repo. `.env` is gitignored.
2. YouTube API key is used ONLY in ingestion scripts (Node.js, local or in GitHub Actions Secrets), never in the browser.
3. `scripts/check-secrets.js` scans for common key patterns. Run before every commit.
4. Files NEVER committed: `.env`, `credentials*.json`, `*.key`, `*.pem`, `secrets/`, any file containing `AIza`, `ghp_`, `AKIA`, etc.
5. Violations are treated as stop-work items.

### Flag Unrequested Features Before Building
Do not add features, behaviors, or capabilities beyond the current spec or a documented decision. When an enhancement opportunity appears: **flag, do not build.** State the idea, wait for direction.

### Don't Break Working Tools
Work deliberately. Never chase architecture at the cost of a functional tool. Prototype before full build — confirm framing before large investments.

### Be Accurate (critical for baseball data)
- Only claim what the data says. Never fabricate stats, birthdates, achievements, or biographical facts.
- If a value is missing from the API, render "—", not a guess.
- The Stories, On-This-Day, Cardinals-deep, Trivia, Legends-general, Brothers, and Strange-plays seed files must cite only publicly documented events. New entries require a verifiable source.

### Service Worker Cache — MUST bump on shell changes
**Any commit that modifies a file listed in `app/sw.js`'s `SHELL_FILES` array (or `app/index.html`, `app/styles/main.css`, any file under `app/js/`, `app/manifest.webmanifest`, `app/icon.svg`) MUST also bump the `CACHE` constant in `app/sw.js` in the same commit.**

Incident reference: 2026-04-20 — the "Refresh data" button addition was invisible to the user's browser until the cache was rolled.

### Pre-Push JS Syntax Verification
**Any commit that modifies JS files in `app/js/` MUST be verified via runtime import check before push.** `node --check` misses ES-module-specific errors (template literals, imports). Required check:

```
for f in app/js/.../*.js; do
  node -e "import('./$f').then(() => console.log('OK: $f')).catch(e => console.log('FAIL: $f -- '+e.message));"
done
```

Incident reference: 2026-04-20 — a `\\'s` escape in stories.js passed `node --check` but crashed the ESM import, blanking the deployed site until fixed.

---

## Project File Structure

```
Baseball Project/ (also git repo root)
├── CLAUDE.md                    ← This file (auto-loaded by Claude Code)
├── README.md
├── index.html                   ← Root redirect → app/index.html (for GitHub Pages)
├── .nojekyll
├── package.json
├── .gitignore
├── .env.example
├── run_daily.bat                ← Local scheduler target (alternative to GitHub Actions)
│
├── .github/workflows/
│   ├── daily.yml                ← 3 AM EDT / 2 AM EST — commits fresh snapshot
│   ├── weekly-index.yml         ← Monday 4 AM EDT — rebuilds player-index from Chadwick
│   └── weekly-batch.yml         ← Monday 4 AM EDT — creates curation-review Issue
│
├── app/                         ← Static PWA (served from root or /baseball-daily/)
│   ├── index.html               ← All asset paths are RELATIVE for portability
│   ├── icon.svg
│   ├── manifest.webmanifest
│   ├── sw.js                    ← Service worker (scope: /app/, shell-only cache)
│   ├── styles/main.css
│   └── js/
│       ├── app.js               ← Bootstrap + tab routing + SW registration + splash
│       ├── data-loader.js       ← Loads JSON from ../data/... (relative)
│       ├── components/
│       │   ├── favorites.js     ← localStorage favorite players
│       │   ├── trivia.js        ← Daily trivia card (on Daily Report)
│       │   ├── streak.js        ← Recent-form renderer
│       │   ├── comparison.js    ← Player comparison widget
│       │   ├── highlights.js    ← YouTube highlight thumbnails
│       │   ├── recap.js         ← Game narrative + linescore + scoring plays + decisions
│       │   ├── suggest.js       ← "Suggest a player or moment" modal (posts to Worker)
│       │   ├── story-state.js   ← localStorage read/fav tracking for Stories tab
│       │   └── splash.js        ← Once-per-session intro animation
│       └── tabs/
│           ├── daily.js         ← Cardinals/Nats pins + streak + trivia + on-this-day + trades + scoreboard + standings + injuries + recaps + highlights + notable games
│           ├── cardinals.js     ← Retired numbers, HOFers, historic seasons, traditions, legends deep-dive
│           ├── teams.js         ← 30-team grid + franchise detail
│           ├── players.js       ← Universal search + favorites ★ + comparison ⇄
│           ├── history.js       ← On This Day + Iconic Moments + Strangest Plays + Franchise Lineages
│           ├── stories.js       ← Unified content hub: narratives + legends + brothers, all filterable
│           └── trivia.js        ← Dedicated trivia tab with filters + reveal + random
│
├── ingestion/
│   ├── fetch-daily.js           ← Orchestrator (schemaVersion=5)
│   ├── fetch-injuries.js
│   ├── fetch-transactions.js
│   ├── fetch-highlights.js      ← YouTube Data API (graceful skip without key)
│   ├── on-this-day.js
│   └── lib/
│       ├── mlb-api.js           ← MLB Stats API wrapper (incl. getGameFeed)
│       ├── youtube-api.js       ← YouTube Data API wrapper
│       ├── recap.js             ← Classifies notable games; builds structured recaps
│       ├── env.js               ← Tiny .env loader (no deps)
│       └── cache.js
│
├── data/
│   ├── master/                  ← Stable reference data (JSON)
│   │   ├── franchises.json
│   │   ├── stories.json
│   │   ├── on-this-day-seed.json
│   │   ├── cardinals-deep.json
│   │   ├── cardinals-links.json
│   │   ├── legends-general.json
│   │   ├── brothers.json
│   │   ├── strange-plays.json
│   │   ├── historical-videos.json
│   │   ├── history-links.json
│   │   ├── trivia.json
│   │   ├── curation-backlog.json
│   │   └── player-index.json    (built; chadwick/ CSVs are gitignored)
│   ├── snapshots/               ← YYYY-MM-DD.json + latest.json (schemaVersion=5)
│   └── archive/
│
├── scripts/
│   ├── serve.js                 ← Local static server (port 1882)
│   ├── check-secrets.js
│   └── build-player-index.js
│
├── worker/                      ← Cloudflare Worker (public submission endpoint)
│   ├── src/index.js             ← POST handler → GitHub Issue
│   ├── wrangler.toml
│   ├── package.json
│   └── README.md                ← Deployment walkthrough
│
├── sessions/                    ← Handoff + Kickoff prompts per session
│   ├── BASEBALL_Handoff_Prompt_V{N}.md    ← Full session record
│   └── BASEBALL_Kickoff_Prompt_Session{N+1}.md  ← Start-here for next session
│
├── docs/
│   ├── knowledge-base.md
│   ├── architecture.md
│   ├── data-sources.md
│   ├── deployment.md
│   ├── curation.md
│   ├── youtube-api-setup.md
│   └── pwa-platform-reference.md
│
├── logs/                        ← Ingestion logs (gitignored)
└── archive/                     ← Retired CLAUDE.md versions
```

---

## URL Structure (deployed)

- **Local dev:** `http://localhost:1882/` → redirects to `/app/index.html`
- **GitHub Pages:** `https://jjmgladden.github.io/baseball-daily/` → redirects to `baseball-daily/app/index.html`
- All asset paths in `app/index.html` are relative (`styles/main.css`, `js/app.js`, etc.)
- All data fetches are relative (`../data/snapshots/latest.json` from `app/` context)
- A single build works identically local or on Pages.

---

## Data Sources (real APIs — no hallucination)

| Source | URL | Use | Key |
|---|---|---|---|
| MLB Stats API | `statsapi.mlb.com/api/v1` | Scores, standings, schedule, boxes, transactions, rosters, season dates, team schedule, game feed | None |
| Chadwick Bureau | `github.com/chadwickbureau/register` | Historical player index (~23k players, 1871+) | None |
| YouTube Data API v3 | `googleapis.com/youtube/v3` | Highlight video search (ingestion only) — ACTIVE | **Required** — see [docs/youtube-api-setup.md](docs/youtube-api-setup.md) |
| Retrosheet | `retrosheet.org` | Historical play-by-play (future) | None |

**Team IDs:** Cardinals = 138 · Nationals = 120 · **League IDs:** AL = 103 · NL = 104

---

## Coding Standards

### JavaScript
- `const` by default, `let` when needed, never `var`
- `camelCase` variables/functions, `UPPER_SNAKE_CASE` constants, `PascalCase` classes
- ES modules in `app/`; CommonJS in `ingestion/` and `scripts/`
- Wrap `fetch()` in try/catch; never swallow errors silently
- Node 18+ (native `fetch`)
- Escape all user-visible strings via the `escapeHtml` helper in every tab module
- **Pre-push import check on any `app/js/` change (see Critical Rules).**

### HTML/CSS
Dark-theme CSS variables defined once in `app/styles/main.css`. Never use dim/off-white text on dark backgrounds. All interactive elements need descriptive text or `aria-label`.

### No Hardcoded Credentials
API keys ONLY in `.env` (gitignored) or GitHub Actions Secrets.

---

## Behavioral Rules

| Rule | Description |
|---|---|
| ✅ Be accurate | Only answers grounded in verifiable data |
| 🔍 Search before answering | Check KB and source files first |
| ⚠️ Flag speculation | Say "I am speculating" when inferring |
| ❌ Do not fabricate | Never invent stats, players, dates, quotes |
| 📚 Cite sources | Reference KB entry, API endpoint, or file used |
| 🔔 Flag context limits | Notify when approaching context window limits |

---

## Knowledge Base Format

Adopted from the MODR-PBX-Project convention. Every KB entry in `docs/knowledge-base.md`:

```markdown
### KB-XXXX | [Short descriptive title]
- **Type:** [Reference / Decision / Limitation / Action / Issue / Concept]
- **Tier:** [T1 / T2 / T3 — dynamic types only (Action / Issue / Concept); omit for static]
- **Dependency:** [Owner / Claude / External / Blocked (cite KB) — dynamic types only; omit when Closed]
- **Date:** YYYY-MM-DD
- **Source:** [Chat session, test result, external reference]
- **Category:** [Primary / Subcategory]
- **Tags:** [lowercase, comma-separated]
- **Finding:** [Specific, complete description]
- **Status:** [Open / Closed / Blocked (cite blocker)]
- **Cross-ref:** [Related KBs or files]
```

**Tier definitions (dynamic types only):**
- **T1** — *Critical / Production-impacting.* Something user-facing is broken or a security boundary is in question. Fix first.
- **T2** — *Near-Term.* Planned enhancement or non-critical gap. Address in an upcoming session.
- **T3** — *Deferred.* Nice-to-have or someday / research. No active commitment.

Static types (Reference, Decision, Limitation) omit Tier and Dependency.

Entry IDs continue sequentially.

---

## Session-Start Protocol (MANDATORY)

Every session must begin with:

1. **Read this CLAUDE.md** (auto-loaded by Claude Code)
2. **Read the latest Handoff** — `sessions/BASEBALL_Handoff_Prompt_V{latest}.md` — full predecessor session record
3. **Read the Kickoff** — `sessions/BASEBALL_Kickoff_Prompt_Session{this}.md` — concise "what to do in THIS session"
4. **Read `docs/knowledge-base.md`** — list ALL open entries with tier + status
5. **Dump OPEN items to screen**: every Action / Issue / Concept not Closed — show ID, title, tier, dependency. Format example:
   ```
   OPEN (dynamic):
     KB-0020  T2  Claude   Public on-demand refresh — awaiting decision
     KB-0021  T2  Claude   Auto-reload on SW update — awaiting decision
     KB-0007  T3  Claude   PNG icon set for iOS — deferred
   OPEN (static awaiting trigger):
     KB-0024  —   Owner    Submission Worker awaiting owner deploy
   ```
6. **Check `data/snapshots/latest.json`** — confirm the morning's ingestion ran; report its timestamp
7. **Check for open weekly-batch Issues** — `gh issue list --repo jjmgladden/baseball-daily --label weekly-batch --state open` — if any are awaiting approval, flag them first thing
8. **Check for open submission Issues** — same pattern with `--label submission` — owner-facing review items
9. **Confirm no stale files need archiving** per versioning rules
10. **Report session health** — one line: context load (light / moderate / heavy), outstanding KB items, what's next

### Session-start specific to compacted sessions

If the session was resumed from a prior conversation summary (compacted), add: `[SESSION HEALTH] Compacted: Yes | Context Load: Heavy | Risk: recommend fresh session for any large build`.

---

## Session-End Protocol (MANDATORY — never skip any)

Every session must end with these steps, in order:

1. **Update `docs/knowledge-base.md`** — add new entries, close completed items, flip statuses, bump the file's "Last updated" date. This is a full merged file, never a delta.
2. **Archive any previous versions** if a whole number rolled this session (CLAUDE.md, data schemas, etc. → `archive/`). Never delete.
3. **Write the Handoff Prompt** — `sessions/BASEBALL_Handoff_Prompt_V{N+1}.md`. Full session record:
   - Session number, date range, predecessor chain
   - Current-versions table with changes bolded
   - "What Happened" — work tracks chronologically
   - Decisions committed (table)
   - System state at end
   - Known issues / tech debt
   - Open KB items — dumped with tier
4. **Write the Kickoff Prompt** — `sessions/BASEBALL_Kickoff_Prompt_Session{N+2}.md`. Concise start-here for the *next* session:
   - "Read these first" (ordered list of files)
   - Session-start protocol reminders
   - What just happened (1-paragraph summary)
   - Top priorities — Options A / B / C for main-track choice
   - Side tasks interleaved
   - Expected deliverables
   - System state snapshot (one-pager)
   - Critical reminders (things that bit us this session)
   - Session-end reminders for next session
5. **List file changes** explicitly for the owner — what changed, what's new, what moved
6. **Release-readiness check** — if any user-facing change shipped, note it in CHANGELOG-compatible format (Added / Changed / Fixed / Security)
7. **Report to owner**: brief summary — what was done, what's next, any blockers

### Naming conventions

- Handoffs are versioned **monotonically** across all sessions: `V1`, `V2`, `V3` (no reset per session)
- Kickoffs reference the **session number they open**: `Session2`, `Session3`, etc.
- Never skip numbers. Never reuse numbers.

---

## Current Phase

**Phase 3B — Deployment (complete as of Session 1)**
- Public GitHub repo live: `github.com/jjmgladden/baseball-daily`
- GitHub Pages deployed: `https://jjmgladden.github.io/baseball-daily/`
- Daily ingestion cron: 07:00 UTC (3 AM EDT / 2 AM EST) — autonomous
- Weekly Chadwick rebuild cron: Monday 08:00 UTC
- Weekly curation batch cron: Monday 08:00 UTC — creates review Issue
- All major features from Phases 1-3A live, plus YouTube highlights, game recaps, curated deep content (20 legends + 10 brothers + 12 strange plays + 30 trivia), splash screen, unified Stories hub, Trivia tab, public submission Worker (code ready, owner deployment pending per worker/README.md).

**Phase 4 — Content + Polish (future)**
- PNG icon set for iOS PWA install (KB-0007)
- Public on-demand refresh (KB-0020) — Cloudflare Worker proxy
- Auto-reload on SW update (KB-0021) — eliminates manual cache-clear
- Career statistics join (Lahman) onto player index
- Content expansion via weekly-batch workflow
- Actions Node 20 deprecation (KB-0022) before Sep 2026

**Sibling-project consideration**
- User has floated building a parallel **Pickleball Daily Intelligence Report** at equivalent scope. Recommendation: separate project folder at `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\`, started in a fresh Claude session following the same Phase-0 discipline. Do not absorb pickleball work into this (baseball) repo.
