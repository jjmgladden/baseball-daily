# Deployment — v1

Three targets, in order of adoption:

1. **Local** (Phase 1 — current)
2. **GitHub Pages + GitHub Actions** (Phase 3)
3. **Mobile PWA install** (Phase 4, optional)

---

## 1. Local (Phase 1)

### One-time setup

1. Install [Node.js 18+](https://nodejs.org/).
2. In the project folder, copy env template:
   ```
   copy .env.example .env
   ```
3. (Optional, deferred) Fill in `YOUTUBE_API_KEY` — not needed until Phase 3.

### Running

```
npm run fetch:daily     # Pulls yesterday's MLB data → data/snapshots/
npm run serve           # Starts http://localhost:1882
```

Open the browser to http://localhost:1882. The Daily Report tab renders from the snapshot.

**Port choice:** 1882 (Cardinals franchise founding year) was picked over the common 8080 to avoid collisions with other local dev servers. Override with `set PORT=xxxx && npm run serve` if needed.

### Daily automation (Windows Task Scheduler)

1. Open **Task Scheduler** → **Create Basic Task**.
2. Name: *Baseball Daily Ingestion*.
3. Description: *Pulls previous-day MLB data via MLB Stats API.*
4. Trigger: **Daily** · Start: 5:00 AM · Recur: every 1 day.
5. Action: **Start a program**.
   - Program/script: browse to `run_daily.bat`.
   - Start in: the project folder (important — relative paths break otherwise).
6. Finish. Then test:
   - Task Scheduler Library → right-click the task → **Run**.
   - After it completes, check `logs/ingestion.log` — should show "Ingestion complete."
   - Check `data/snapshots/` — a fresh `YYYY-MM-DD.json` and updated `latest.json`.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm run fetch:daily` prints "fetch is not defined" | Node.js < 18 | Upgrade to Node 18 or later |
| App shows "No snapshot yet" | Ingestion hasn't run | `npm run fetch:daily` |
| Task scheduler runs but nothing updates | "Start in" field blank | Set to the project folder |
| `logs/ingestion.log` shows "MLB API 404" | API path changed | Check `docs/data-sources.md` for current endpoints |
| Browser shows empty standings | Season hasn't started yet | Normal during March preseason |

---

## 2. GitHub Pages (Phase 3 — future)

**Prerequisites before this transition** (per KB-0005):
- `npm run check-secrets` passes clean
- CLAUDE.md stripped of personal identifying information
- `.env` verified gitignored (via `git status` — should not appear)
- John's explicit authorization

### Steps (documented for the future session)

1. Create a new **public** GitHub repo named `baseball-daily` (or similar — not the folder name, which contains a space).
2. `git init && git add . && git commit -m "v1 initial commit"`.
3. Add remote, push.
4. Repo Settings → Pages → Source = `main` branch, `/app` folder (or root and adjust paths).
5. Wait for initial deploy — URL appears in Pages settings.

### GitHub Actions daily cron

Add `.github/workflows/daily.yml` (not yet written — Phase 3):

```yaml
name: Daily Ingestion
on:
  schedule:
    - cron: '0 10 * * *'   # 5:00 AM CT = 10:00 UTC (adjust for DST as needed)
  workflow_dispatch:       # manual trigger
jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node ingestion/fetch-daily.js
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
      - name: Commit snapshot
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/snapshots/
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "Daily snapshot $(date -u +%Y-%m-%d)" && git push
```

Notes:
- Repo Settings → Secrets → add `YOUTUBE_API_KEY` (when Phase 3 needs it).
- The workflow commits the new snapshot back to the repo, which triggers a Pages rebuild automatically.

---

## 3. Mobile PWA install (Phase 4 — future)

Once PWA service worker (`app/sw.js`) and icons (KB-0007) are in place:

- **iOS Safari:** Open the site → Share → Add to Home Screen.
- **Android Chrome:** Open the site → menu → Install app.

The app then runs full-screen, offline-capable against the cached snapshot.

If native is needed beyond PWA, wrap with [Capacitor](https://capacitorjs.com/) — but only if a specific feature requires it.

---

## Rollback

Every snapshot is dated. To roll back the app to an earlier day's data:

```
copy data\snapshots\2026-04-15.json data\snapshots\latest.json
```

Master data (`data/master/`) is versioned separately — previous versions live in `data/archive/` once rolled.
