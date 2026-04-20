# YouTube Data API v3 — Setup Guide

**Version:** 1 | **Date:** 2026-04-20

Purpose: get an API key, paste it into two places, verify highlights start showing up.

Per CLAUDE.md § Secret Safety, the key is used **only in Node.js ingestion** (local or GitHub Actions). It never reaches the browser. Output from ingestion is normal video IDs + thumbnails written into the snapshot JSON — which IS public but contains no secret.

---

## Step 1 — Create / select a Google Cloud project

1. Open https://console.cloud.google.com/
2. Sign in with your Google account
3. Top of page, click the project dropdown → **New Project**
4. Name: `Baseball Daily` (or anything you like)
5. Organization / location: leave default
6. Click **Create**
7. Wait a few seconds, then select the new project from the dropdown so it's active

---

## Step 2 — Enable the YouTube Data API

1. Left sidebar → **APIs & Services** → **Library**
   (if sidebar is hidden, click the hamburger menu top-left)
2. In the search box: type `YouTube Data API v3`
3. Click the result
4. Click the blue **Enable** button
5. Wait a few seconds until the page redirects to the API's overview

---

## Step 3 — Create an API key

1. Left sidebar → **APIs & Services** → **Credentials**
2. Near the top: **+ Create Credentials** → **API key**
3. A dialog appears showing the newly-generated key (starts with `AIza...`)
4. **Copy this key and paste it into a temporary scratch file.** You'll need it twice.
5. Click **Close**

---

## Step 4 — Restrict the key (recommended)

A restricted key is safer in case it leaks. Even though we keep it out of the public repo, restrictions limit the blast radius.

1. On the Credentials page, click the new key's name (e.g. `API key 1`) to open its settings
2. Under **Application restrictions**: leave as **None** (fine for our use case — the key never leaves your machine or GitHub Secrets)
3. Under **API restrictions**: select **Restrict key**
4. In the dropdown that appears, check **YouTube Data API v3** only
5. Click **Save**

The key is now usable only for the YouTube API. If it leaks, an attacker can burn your free quota but can't use it to access other Google services.

---

## Step 5 — Paste the key locally

This lets `npm run fetch:daily` fetch highlights when you run it on your own machine.

1. Open a Command Prompt in the project folder
2. If a `.env` file doesn't exist yet, create one from the template:
   ```
   copy .env.example .env
   ```
3. Open `.env` in any text editor (Notepad works)
4. Find the line `YOUTUBE_API_KEY=` and paste your key after the `=`:
   ```
   YOUTUBE_API_KEY=AIza...your_key_here
   ```
5. Save and close

Verify: `.env` is already gitignored, so this key will never enter the repo. If you're paranoid, run `npm run check-secrets` — it should still say **OK**.

---

## Step 6 — Add the key to GitHub Actions Secrets

This lets the daily cron workflow fetch highlights in the cloud.

1. Open https://github.com/jjmgladden/baseball-daily/settings/secrets/actions
   (Sign in to GitHub if prompted)
2. Click **New repository secret**
3. Name: `YOUTUBE_API_KEY` (exact, case-sensitive)
4. Secret: paste the same key
5. Click **Add secret**

The workflow file already references this secret name (`.github/workflows/daily.yml`), so no code change is needed.

---

## Step 7 — Verify locally

```
npm run fetch:daily
```

Look for log lines like:
```
[fetch-daily] Cards highlights: 3 videos
[fetch-daily] Nats highlights: 1 videos
```

Then start the local server:
```
npm run serve
```

Open http://localhost:1882 → the Daily Report tab should show a **Highlight Videos** section below the Cardinals and Nationals pins, with embedded video players.

---

## Step 8 — Verify in the cloud

1. Go to https://github.com/jjmgladden/baseball-daily/actions/workflows/daily.yml
2. Click **Run workflow** (top right) → **Run workflow**
3. Wait ~30 sec for the run to complete
4. Refresh https://jjmgladden.github.io/baseball-daily/ after the Pages redeploy (~2 min total)
5. The highlights should appear on the deployed site

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `YOUTUBE_API_KEY is not set` | `.env` missing or key line empty | Step 5 |
| `YouTube API 400` | Key is wrong / expired | Step 3 – regenerate |
| `YouTube API 403 quotaExceeded` | Hit the 10k daily limit (very unlikely with our usage) | Wait 24 hours, then consider reducing `maxResults` in `ingestion/fetch-highlights.js` |
| `YouTube API 403 disabled` | API not enabled on the project | Step 2 |
| Local highlights work but cloud doesn't | Secret not set in GitHub | Step 6 — check name is exactly `YOUTUBE_API_KEY` |
| No videos returned at all, no error | Nothing posted to MLB channel in the lookback window (unusual but possible during offseason) | Not a bug — arrays will populate during the regular season |

---

## Cost

- **Free tier:** 10,000 units/day from Google.
- **Our usage:** 2 × `search.list` calls per day = **200 units** (~2% of quota).
- You will not be billed. There is no billing account attached unless you add one intentionally.

---

## If you want to rotate / revoke the key

1. Google Cloud Console → APIs & Services → Credentials
2. Click the key name → **Regenerate key** OR **Delete**
3. If you regenerate: update the value in `.env` AND in GitHub Secrets
4. If you delete: create a new one via Step 3 and update both places

The key is never stored in the repo or in any committed file, so regeneration only affects your local `.env` and the GitHub Secret.
