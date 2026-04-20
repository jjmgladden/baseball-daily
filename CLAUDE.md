# Baseball Daily Intelligence — Claude Code Project Instructions

**Version:** 5 | **Date:** April 20, 2026 | **Previous:** archive/CLAUDE_v4.md

---

## Project Context

Personal tool maintained by the project owner. Directive working style — delegates execution after go/no-go, pushes back on overcomplication, wants results not explanation.

**Primary interest:** St. Louis Cardinals (pinned top). Secondary: Washington Nationals. Full MLB coverage for context, standings, and league-wide features.

**Purpose:** Long-term daily-use tool. Automated MLB intelligence with historical research, universal player search, and curated baseball stories. Built to be used every morning.

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
                                     on-this-day-seed, cardinals-deep, trivia
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
- The Stories, On-This-Day, Cardinals-deep, and Trivia seed files must cite only publicly documented events. New entries require a verifiable source.

### Service Worker Cache — MUST bump on shell changes
**Any commit that modifies a file listed in `app/sw.js`'s `SHELL_FILES` array (or `app/index.html`, `app/styles/main.css`, any file under `app/js/`, `app/manifest.webmanifest`, `app/icon.svg`) MUST also bump the `CACHE` constant in `app/sw.js` in the same commit** (e.g. `'baseball-daily-shell-v3'` → `'baseball-daily-shell-v4'`).

**Why:** the SW is cache-first for shell files. Without a cache bump, returning users keep seeing the old page even after a hard refresh — the old SW serves the old cached shell forever. The browser only detects a new SW when `sw.js` file content changes; bumping the cache string is the simplest trigger.

**How to apply:** before finishing any commit that touches the app shell, grep `app/sw.js` for `CACHE =` and increment the trailing number. Mention the bump in the commit message.

**Incident reference:** Chat 2026-04-20 — the "Refresh data" button addition was invisible to the user's browser until `baseball-daily-shell-v2` was rolled to `v3`.

---

## Project File Structure

```
Baseball Project/ (also git repo root)
├── CLAUDE.md                    ← This file (auto-loaded by Claude Code)
├── README.md
├── index.html                   ← Root redirect → app/index.html (for GitHub Pages)
├── .nojekyll                    ← Pages: disable Jekyll processing
├── package.json
├── .gitignore
├── .env.example
├── run_daily.bat                ← Local scheduler target (alternative to GitHub Actions)
│
├── .github/workflows/
│   └── daily.yml                ← Cloud cron — 5 AM CDT / 4 AM CST — commits fresh snapshot
│
├── app/                         ← Static PWA (served from root or /baseball-daily/)
│   ├── index.html               ← All asset paths are RELATIVE for portability
│   ├── icon.svg
│   ├── manifest.webmanifest
│   ├── sw.js                    ← Service worker (scope: /app/, shell-only cache)
│   ├── styles/main.css
│   └── js/
│       ├── app.js               ← Bootstrap + tab routing + SW registration
│       ├── data-loader.js       ← Loads JSON from ../data/... (relative)
│       ├── components/
│       │   ├── favorites.js     ← localStorage favorite players
│       │   ├── trivia.js        ← Daily trivia card
│       │   ├── streak.js        ← Recent-form renderer
│       │   └── comparison.js    ← Player comparison widget
│       └── tabs/
│           ├── daily.js         ← Cardinals/Nats pins + streak + trivia + on-this-day + trades + scoreboard + standings + injuries
│           ├── cardinals.js     ← Retired numbers, HOFers, historic seasons, traditions
│           ├── teams.js         ← 30-team grid + franchise detail
│           ├── players.js       ← Universal search + favorites ★ + comparison ⇄
│           ├── history.js       ← Franchise lineages + On-This-Day
│           └── stories.js       ← Rotating daily story + archive
│
├── ingestion/
│   ├── fetch-daily.js           ← Orchestrator
│   ├── fetch-injuries.js
│   ├── fetch-transactions.js
│   ├── on-this-day.js
│   └── lib/
│       ├── mlb-api.js           ← MLB Stats API wrapper
│       └── cache.js
│
├── data/
│   ├── master/                  ← Stable reference data (JSON)
│   │   ├── franchises.json
│   │   ├── stories.json
│   │   ├── on-this-day-seed.json
│   │   ├── cardinals-deep.json
│   │   ├── trivia.json
│   │   └── player-index.json    (built; chadwick/ CSVs are gitignored)
│   ├── snapshots/               ← YYYY-MM-DD.json + latest.json (schemaVersion=3)
│   └── archive/
│
├── scripts/
│   ├── serve.js                 ← Local static server (port 1882)
│   ├── check-secrets.js
│   └── build-player-index.js
│
├── docs/
│   ├── knowledge-base.md
│   ├── architecture.md
│   ├── data-sources.md
│   └── deployment.md
│
├── logs/                        ← Ingestion logs (gitignored)
└── archive/                     ← Retired documents (CLAUDE_v1..v3)
```

---

## URL Structure (deployed)

- **Local dev:** `http://localhost:1882/` → redirects to `/app/index.html`
- **GitHub Pages:** `https://jjmgladden.github.io/baseball-daily/` → redirects to `baseball-daily/app/index.html`
- All asset paths in `app/index.html` are relative (`styles/main.css`, `js/app.js`, etc.)
- All data fetches are relative (`../data/snapshots/latest.json` from `app/` context)
- This means a single build works identically local or on Pages.

---

## Data Sources (real APIs — no hallucination)

| Source | URL | Use | Key |
|---|---|---|---|
| MLB Stats API | `statsapi.mlb.com/api/v1` | Scores, standings, schedule, boxes, transactions, rosters, season dates, team schedule | None |
| Chadwick Bureau | `github.com/chadwickbureau/register` | Historical player index (~23k players, 1871+) | None |
| YouTube Data API v3 | `googleapis.com/youtube/v3` | Highlight video search (ingestion only; deferred) | **Required** |
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

See `docs/knowledge-base.md`. Every KB entry uses the template there. Entry IDs continue sequentially.

---

## Session-Start Protocol

1. Read this CLAUDE.md
2. Read `docs/knowledge-base.md` — list OPEN entries
3. Check `data/snapshots/` — confirm yesterday's ingestion succeeded
4. Confirm no stale files need archiving
5. Report session health

---

## Session-End Protocol

1. Update `docs/knowledge-base.md`
2. Archive previous versions if any whole numbers rolled
3. List file changes
4. Report: what was done, what's next, any blockers

---

## Current Phase

**Phase 3B — Deployment (in progress)**
- PII strip of CLAUDE.md — this file (v4)
- Root `index.html` + `.nojekyll` for Pages
- Relative asset and data paths (portability across local and Pages)
- `.github/workflows/daily.yml` — cron replaces local `.bat` when Actions is enabled
- `git init`, first commit, push to `github.com/jjmgladden/baseball-daily`
- Enable GitHub Pages → public URL
- YouTube API key — still deferred; Actions will pick it up from repo Secrets once added

**Phase 4 — Future**
- PNG icon set for full iOS PWA compat (KB-0007)
- Career statistics join (Lahman Batting/Pitching) onto the player index
- On-This-Day seed expansion
- Optional: Capacitor wrapper for native mobile
