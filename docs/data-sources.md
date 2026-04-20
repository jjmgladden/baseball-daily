# Data Sources — v1

All real. No hallucination. Marked clearly when something is placeholder or deferred.

---

## MLB Stats API (primary, Phase 1)

- **Base:** `https://statsapi.mlb.com/api/v1`
- **Auth:** None
- **Cost:** Free
- **Status:** Unofficial but stable — this is the same API MLB.com uses for its live scoreboard. No formal SLA, but effectively a hard dependency across the baseball-data ecosystem.

### Endpoints used

| Endpoint | Purpose | Used by |
|---|---|---|
| `/schedule?sportId=1&date=YYYY-MM-DD` | List of games on a date | `fetch-daily.js` |
| `/standings?leagueId=103,104&season=YYYY` | Division standings | `fetch-daily.js` |
| `/game/{gamePk}/boxscore` | Full box score for a game | `fetch-daily.js` (Cards, Nats) |
| `/game/{gamePk}/linescore` | Inning-by-inning line score | (Phase 2) |
| `/teams/{teamId}/roster` | Team roster with status | (Phase 2 — injuries) |
| `/people/{personId}` | Player bio + career stats | (Phase 2 — player detail) |
| `/transactions?startDate&endDate` | Trades, signings, DFA, etc. | (Phase 2 — trade tracker) |
| `/seasons/{season}` | Precise Opening Day / All-Star / playoff dates | (Phase 2 — replaces hardcoded approximations in KB-0008) |

### Reference IDs

| Name | ID |
|---|---|
| AL (league) | 103 |
| NL (league) | 104 |
| Cardinals | 138 |
| Nationals | 120 |

Division IDs: AL West 200 · AL East 201 · AL Central 202 · NL West 203 · NL East 204 · NL Central 205

### Rate limiting

No published limit. Our cache layer writes a single snapshot per day, so ordinary operation is ~30 calls/day. Safe margin.

---

## Chadwick Bureau Register (Phase 2)

- **Source:** https://github.com/chadwickbureau/register (public domain CSVs)
- **Size:** ~23,000 MLB players, 1871 → present
- **License:** CC0 / public domain
- **Use:** Universal player search, historical bios.

Build step: `scripts/build-player-index.js` (Phase 2) converts the Chadwick `people.csv` to `data/master/player-index.json`, keeping only MLB players (filtering out minor-league-only entries) and sorting by career games played for relevance. Expected output size: ~6–8 MB gzipped.

---

## ESPN Unofficial (fallback, future)

- **Base:** `site.api.espn.com`
- **Auth:** None
- **Status:** Entirely unofficial. Used only as fallback when MLB Stats API returns incomplete data, or for scraping curated news link lists.

Not used in Phase 1.

---

## YouTube Data API v3 (Phase 3, deferred)

- **Base:** `https://www.googleapis.com/youtube/v3`
- **Auth:** Required — API key
- **Status:** Key acquisition deferred per KB-0003 until ingestion blocks on it.
- **Free quota:** 10,000 units/day. A full daily highlight pull is ~200 units.

### Security posture (non-negotiable)

- Key lives in `.env` (gitignored). Never in source, never in the browser.
- `ingestion/fetch-highlights.js` runs locally (Phase 3) or in GitHub Actions (Phase 3+) with the key from env.
- Output: `data/snapshots/*.json` contains only video IDs, titles, thumbnails — no key.
- Browser embeds via `<iframe src="https://www.youtube.com/embed/VIDEOID">` — no API call from the page.

### Setup (to execute when ready)

1. https://console.cloud.google.com → create project "Baseball Daily"
2. APIs & Services → Library → enable **YouTube Data API v3**
3. APIs & Services → Credentials → Create Credentials → API key
4. Restrict key:
   - **API restrictions:** YouTube Data API v3 only
   - **Application restrictions:** IP address → your home IP (recommended, not required)
5. Copy key → paste into local `.env` as `YOUTUBE_API_KEY=...`
6. Verify `.env` is gitignored. Run `npm run check-secrets`.

---

## Retrosheet (Phase 2+)

- **Source:** https://www.retrosheet.org/
- **License:** Public (attribution required — see their license page)
- **Use:** Historical play-by-play for the Stories engine; enriches "On This Day" with specific game context.

Batch import only. Not queried at runtime.

---

## Sources we do NOT use

- **Baseball Reference** — TOS prohibits scraping. We link out to it for users.
- **FanGraphs** — same reason.
- **Twitter/X API** — off-limits for cost and reliability reasons.
