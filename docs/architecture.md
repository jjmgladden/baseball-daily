# Architecture — v1

## Summary

Three-layer application:

1. **Ingestion** (Node.js) — runs locally on a schedule, calls live APIs, writes JSON.
2. **Data** (JSON on disk) — single source of truth for the app.
3. **App** (static PWA) — reads JSON only, no runtime API calls.

```
┌──────────────────────────────────────────────────────────────┐
│  SCHEDULE                                                    │
│  Phase 1-2: Windows Task Scheduler → run_daily.bat @ 5:00 AM │
│  Phase 3+:  GitHub Actions cron                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  INGESTION (ingestion/)                                      │
│                                                              │
│   fetch-daily.js (Phase 1)                                   │
│     ├─ MLB Stats API  →  schedule + standings + boxscores    │
│     └─ writes JSON → data/snapshots/YYYY-MM-DD.json          │
│                    → data/snapshots/latest.json              │
│                                                              │
│   Phase 2+:                                                  │
│     fetch-injuries.js, fetch-transactions.js,                │
│     on-this-day.js, build-player-index.js                    │
│                                                              │
│   Phase 3+:                                                  │
│     fetch-highlights.js (YouTube API, requires key)          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  DATA LAYER (data/)                                          │
│                                                              │
│   snapshots/                                                 │
│     latest.json          ← what the app loads on open        │
│     2026-04-18.json      ← dated historical record           │
│     2026-04-17.json                                          │
│     ...                                                      │
│                                                              │
│   master/                ← stable reference data             │
│     franchises.json      (Phase 2)                           │
│     player-index.json    (Phase 2, ~23k players)             │
│     stories.json         (Phase 2, curated)                  │
│     cardinals-history.json (Phase 3)                         │
│     historical-video.json (Phase 3)                          │
└────────────────────────┬─────────────────────────────────────┘
                         │  fetch()
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  APP (app/)                                                  │
│                                                              │
│   index.html  (shell + tab nav)                              │
│   styles/main.css  (dark theme, mandatory CSS variables)     │
│   js/                                                        │
│     app.js          ← bootstrap + tab routing                │
│     data-loader.js  ← loads JSON from /data/                 │
│     tabs/                                                    │
│       daily.js      ← Phase 1 ✅                             │
│       cardinals.js  ← Phase 3                                │
│       teams.js      ← Phase 2                                │
│       players.js    ← Phase 2                                │
│       history.js    ← Phase 2                                │
│       stories.js    ← Phase 2                                │
│   sw.js             ← service worker (Phase 3)               │
│   manifest.webmanifest                                       │
└──────────────────────────────────────────────────────────────┘
```

## Why this shape

- **JSON as source of truth** — same pattern MODR and Travel projects use. Decouples ingestion from rendering. Lets us cache aggressively, work offline, and replay history (dated snapshots).
- **No backend** — GitHub Pages serves it unchanged. Zero hosting cost. Zero attack surface for credentials.
- **No build step** — vanilla ES modules ship as-is. Matches John's comfort zone from Travel project. Portable.
- **Ingestion out-of-band** — browser never touches an API, so rate limits and secrets stay server-side (or, here, local-machine-side).

## Module boundaries

| Module | Responsibility | Does NOT do |
|---|---|---|
| `ingestion/` | Fetch live data, normalize, write JSON | Any rendering, any DOM |
| `ingestion/lib/mlb-api.js` | Thin wrapper over MLB Stats API endpoints | Any data shaping |
| `ingestion/fetch-daily.js` | Orchestrate daily pulls + shape snapshot | Read from cache; it's write-only |
| `data/` | Hold files — no code | — |
| `app/js/data-loader.js` | Load JSON over HTTP | Transform data beyond JSON parse |
| `app/js/tabs/*.js` | Render one tab from a snapshot | Fetch remote data |

## Extension points

- **New tab** → add `app/js/tabs/<name>.js`, register in `app.js`, add tab button in `index.html`.
- **New data source** → add ingestion script under `ingestion/`, write to `data/master/` or `data/snapshots/`, update app consumers.
- **New feature using existing data** → tab module only; no ingestion change.
