# Baseball Daily Intelligence — Claude Code Project Instructions

**Version:** 1 | **Date:** April 19, 2026

---

## Project Context

**Owner:** John Gladden — directive, efficient, delegates execution after go/no-go. Pushes back on overcomplication. Wants results, not explanation.

**Primary interest:** St. Louis Cardinals (pinned top). Secondary: Washington Nationals. Full MLB coverage for context, standings, and league-wide features.

**Purpose:** Long-term personal tool. Automated daily MLB intelligence with historical research, universal player search, and curated baseball stories. Not a demo — built to be used every morning with coffee.

---

## Critical Rules — Read These First

### Authorization
**Do not proceed with significant changes until receiving Authorization to Proceed (ATP) from John.** Confirm scope first; execute on go.

### Versioning
**All document and schema versioning uses whole numbers ONLY (v1, v2, v10).** No decimals, no underscores. ANY change — no matter how small — rolls the whole number. Applies to CLAUDE.md, JSON schemas, HTML shell, ingestion libraries, docs.

### Data Flow Architecture

```
ingestion/ (Node scripts, run locally or via GitHub Actions later)
    ↓ live API calls to MLB Stats API / Chadwick / YouTube
data/snapshots/YYYY-MM-DD.json   ← daily cache (grows over time)
data/master/*.json               ← historical: franchises, player-index, stories, video
    ↓
app/ (static PWA — consumes JSON only at runtime)
```

JSON is the single source of truth. **The browser NEVER hits a live API.** All external calls happen in `ingestion/`.

### Secret Safety (non-negotiable)
1. API keys NEVER enter the repo. `.env` is gitignored.
2. YouTube API key is used ONLY in ingestion scripts (Node.js local), never in the browser.
3. `scripts/check-secrets.js` scans for common key patterns. Run before every commit.
4. Files NEVER committed: `.env`, `credentials*.json`, `*.key`, `*.pem`, `secrets/`, any file containing `AIza`, `ghp_`, `AKIA`, etc.
5. Violations are treated as stop-work items.

### Repo Privacy Posture
- **Phase 1–2:** Local-only. No remote configured.
- **Phase 3+:** Public GitHub repo (for Pages hosting) — only after:
  - CLAUDE.md stripped of personal identifying information
  - `scripts/check-secrets.js` passes clean
  - Repo scoped narrowly — MODR/Travel folders are NOT in this repo
  - John explicitly authorizes the push
- Do not push to a remote until John approves the transition.

### Flag Unrequested Features Before Building
Do not add features, behaviors, or capabilities beyond the current spec or a documented decision. When an enhancement opportunity appears: **flag, do not build.** State the idea, wait for direction.

### Don't Break Working Tools
Work deliberately. Never chase architecture at the cost of a functional tool. Prototype before full build — confirm framing before large investments.

---

_(Full v1 content preserved here for history. Current active version: CLAUDE.md at project root. Archived on 2026-04-19 during Phase 2 rollup.)_
