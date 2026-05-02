# Ozark Joe's Baseball Daily Intelligence Report

Automated daily MLB updates, historical research, and curated baseball intelligence — with the St. Louis Cardinals pinned at the top and the Washington Nationals secondary.

**Version:** 1 (Phase 1 — Foundations)

---

## What this is

A personal tool that runs every morning, pulls yesterday's MLB games, standings, and team detail, and renders it as a fast static dashboard. No backend, no build step, no runtime API calls from the browser.

**Pipeline:**
```
3:00 AM Eastern →  GitHub Actions cron  →  ingestion/fetch-daily.js
                                     ↓
                  data/snapshots/YYYY-MM-DD.json + latest.json
                                     ↓
                  app/ (open in browser)  →  renders from JSON
```

---

## Quick start

### Prerequisites
- [Node.js 18+](https://nodejs.org/) (native `fetch`)
- Windows (the `.bat` runner targets Task Scheduler; the Node scripts themselves are cross-platform)

### First-time setup
```bash
# 1. Copy the env template (key acquisition deferred until YouTube ingestion lands)
copy .env.example .env

# 2. Pull today's data
npm run fetch:daily

# 3. Start the local server
npm run serve

# 4. Open http://localhost:1882 in your browser
```

If you see "No snapshot yet" on the Daily Report tab, run `npm run fetch:daily` first.

### Daily automation (Windows Task Scheduler)

1. Open **Task Scheduler** → **Create Basic Task**
2. Name: *Baseball Daily Ingestion*
3. Trigger: **Daily** at **3:00 AM** (or any time you prefer — this path is a backup to the GitHub Actions cron)
4. Action: **Start a program** → browse to `run_daily.bat` in this folder
5. Start in: this project's folder (important — paths are relative)
6. Test: right-click the task → **Run**. Check `logs/ingestion.log` afterward.

---

## Project layout

See [CLAUDE.md](CLAUDE.md) for the full layout and conventions. Quick version:

- `app/` — static frontend (HTML + CSS + vanilla ES modules)
- `ingestion/` — Node scripts that fetch from MLB Stats API and write JSON
- `data/snapshots/` — daily JSON snapshots (one per day, plus `latest.json`)
- `data/master/` — stable historical data (franchises, player index, stories)
- `scripts/` — local server + secret scanner
- `docs/` — knowledge base + architecture + data-source docs

---

## Scripts

| Command | What it does |
|---|---|
| `npm run fetch:daily` | Pull yesterday's scoreboard, standings, Cardinals/Nationals box scores |
| `npm run serve` | Start a local static server at `http://localhost:1882` (Cardinals founding year — avoids conflict with other projects on 8080) |
| `npm run check-secrets` | Scan the repo for leaked API keys / private keys |

---

## Current phase

**Phase 1 — Foundations** (current). See [CLAUDE.md](CLAUDE.md) § Current Phase for Phase 2–4 roadmap.

Phase 1 delivers the Daily Report tab backed by real MLB Stats API data. Cardinals, Teams, Players, History, and Stories tabs are placeholders until Phase 2+.

---

## Data sources

All real, no hallucination. See [docs/data-sources.md](docs/data-sources.md) for detail.

- MLB Stats API (`statsapi.mlb.com`) — primary
- Chadwick Bureau — historical player index
- YouTube Data API v3 — highlights (active; see [docs/youtube-api-setup.md](docs/youtube-api-setup.md) for one-time key setup)
- Retrosheet — historical play-by-play (future)

---

## Daily morning email

A briefing email goes out every morning at ~3 AM Eastern (07:00 UTC) right after the snapshot commits, sent via [Resend](https://resend.com) from `baseball@glad-fam.com`. **Email template v2** (live since Session 5, May 2026) includes:

- Cardinals + Nationals pin lines (with W/L/Sv decisions and the first scoring play of the game)
- **Today's Games** — Cards/Nats matchups + up to 3 marquee league games with probable pitchers (snapshot schema v6+)
- **Top Highlights** with click-out YouTube thumbnails
- **Division standings** — top 3 per division, all 6 divisions (Cards/Nats highlighted)
- **Notable games** one-liners (one-run / shutout / blowout / slugfest / pitchers' duel)
- On This Day, CTA, stats footer

Configured via 3 GitHub Secrets: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`. If `RESEND_API_KEY` is unset, the workflow skips email silently — adding/removing recipients is a Secrets edit, no code change.

See [`ingestion/lib/email-template.js`](ingestion/lib/email-template.js) for layout and [`docs/Daily-Email-Setup-Guide.docx`](docs/Daily-Email-Setup-Guide.docx) for the full setup walkthrough.

---

## Snapshot schema

Current schema: **v6** (added `todaysSchedule[]` + `todaysScheduleDate`). Older snapshots in `data/snapshots/` may be earlier versions; the app + email template degrade gracefully.

Schema history: v1 (initial scoreboard) → v2 (Cardinals deep) → v3 (`recentForm`, `seasonProgress.source`) → v4 (`highlights`) → v5 (`recap`, `notableGames`) → **v6 (`todaysSchedule`)**.

---

## Secret safety

- `.env` is gitignored. Never commit it.
- Run `npm run check-secrets` before any commit.
- The YouTube API key is used only in local ingestion — never in the browser.
- See [CLAUDE.md](CLAUDE.md) § Secret Safety for full rules.
