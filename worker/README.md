# baseball-daily-api — Cloudflare Worker

A small Cloudflare Worker that serves two POST routes for the Baseball Daily site:

- `/ai` — proxies AI Q&A requests to Anthropic's Messages API (KB-0033)
- `/submit` — accepts public submissions and opens GitHub Issues on `jjmgladden/baseball-daily` (KB-0024, scaffolded — Suggest UI is the future trigger)

Plus a `GET /health` for sanity checks.

**Why Cloudflare:** free tier covers 100,000 requests/day, no cold starts, one-command deploy, no infrastructure to babysit.

---

## First-time setup (~15 min)

### 1. Create a Cloudflare account (if you don't have one)
- https://dash.cloudflare.com/sign-up
- Free tier is all you need

### 2. Install wrangler (the Cloudflare CLI)
```
npm install -g wrangler
```
Or use `npx wrangler …` without installing globally.

### 3. Authenticate wrangler with your Cloudflare account
```
cd worker
npx wrangler login
```
A browser window opens; click **Allow**. Closes automatically.

### 4. Create an Anthropic API key (required for `/ai`)
1. Go to https://console.anthropic.com/settings/keys
2. Create a new key named `baseball-daily-worker` (or similar)
3. Copy the value (starts with `sk-ant-api03-`)
4. Set a monthly spend cap at https://console.anthropic.com/settings/limits — recommended **$5/mo** as a hard ceiling on top of the per-IP rate limits in this Worker.

### 5. Set the Anthropic key as a Worker secret
```
cd worker
npx wrangler secret put ANTHROPIC_API_KEY
```
Paste the key when prompted.

### 6. (Optional) Create a fine-grained GitHub PAT for `/submit`
The PAT lets the Worker open Issues on `jjmgladden/baseball-daily`. Required only when the site's "Suggest a player or moment" form is wired to this Worker; until then, the route can be left dormant.

1. https://github.com/settings/personal-access-tokens/new
2. **Token name:** `baseball-daily-api-worker`
3. **Expiration:** 1 year (recommended)
4. **Repository access:** Only select repositories → choose `jjmgladden/baseball-daily`
5. **Permissions → Repository permissions:**
   - **Issues:** Read and write
   - Leave everything else untouched
6. **Generate token** → copy the value (starts with `github_pat_`)

Then:
```
cd worker
npx wrangler secret put GITHUB_TOKEN
```

### 7. Deploy the Worker
```
npx wrangler deploy
```

After ~30 seconds wrangler prints the Worker URL, which will look like:
```
https://baseball-daily-api.<your-subdomain>.workers.dev
```

**Copy this URL** and paste it into `data/master/ai-config.json`'s `workerBaseUrl` field, then commit + push. The Ask tab will start working on the next deploy.

---

## Maintenance

### View live request logs
```
cd worker
npx wrangler tail
```
Streams live Worker logs. Ctrl+C to stop.

### Rotate the Anthropic key
1. Create a new key in the Anthropic Console
2. `npx wrangler secret put ANTHROPIC_API_KEY` — paste new value
3. Revoke the old key in the Anthropic Console

### Rotate the GitHub PAT
1. Create a new fine-grained PAT (same scope as before)
2. `npx wrangler secret put GITHUB_TOKEN` — paste new value
3. Revoke the old PAT at https://github.com/settings/personal-access-tokens

### Disable AI without redeploying
The `wrangler.toml` has `AI_DISABLED = "false"`. To kill the AI route fast:
```
npx wrangler secret put AI_DISABLED
# enter: true
```
This overrides the `[vars]` value. To re-enable: `wrangler secret delete AI_DISABLED`.

### Update the Worker code
1. Edit `worker/src/index.js`
2. `npx wrangler deploy`

### Remove the Worker entirely
```
npx wrangler delete baseball-daily-api
```

---

## Cost guards

- **Worker requests:** 100,000/day free, we use ~10-50/day at most. **$0**.
- **Anthropic API:** budgeted at **$5/mo** hard cap (set in console.anthropic.com).
- **Per-IP rate limits:** 10 questions/hour, 50 questions/day on `/ai` (in-Worker).
- **CORS:** restricted to `https://jjmgladden.github.io` + `http://localhost:1882` only.
- **Kill switch:** `AI_DISABLED=true` returns HTTP 503 without spending API budget.

---

## Routes

### `GET /health`
Open to anyone. Returns Worker name + AI-enabled flag. Use for deploy sanity checks:
```
curl https://baseball-daily-api.<subdomain>.workers.dev/health
# {"ok":true,"worker":"baseball-daily-api","routes":["POST /submit","POST /ai"],"aiEnabled":true}
```

### `POST /ai`
```json
{ "question": "Who pitched the Cardinals' last win?" }
```
Returns:
```json
{
  "ok": true,
  "answer": "...",
  "model": "claude-haiku-4-5-20251001",
  "contextGeneratedAt": "2026-05-03T08:53:00Z",
  "usage": { "inputTokens": ..., "outputTokens": ..., "cacheHit": true }
}
```
Errors return `{ "error": "..." }` with appropriate HTTP status.

### `POST /submit`
```json
{
  "type":  "player" | "moment" | "other",
  "name":  "Stan Musial",
  "reason": "Notable because …",
  "source": "https://www.baseball-reference.com/players/m/musiast01.shtml",
  "submitterName":  "Optional",
  "submitterEmail": "Optional"
}
```
Returns `{ ok: true, issueUrl, issueNumber }` on success.

---

## Architecture notes

- The Worker fetches the curated context bundle from GitHub Pages on each `/ai` request. Cloudflare's edge cache + `cf.cacheTtl: 300` mean repeated fetches within 5 min are free (no GitHub bandwidth cost).
- Anthropic prompt caching (`cache_control: ephemeral`) on the context block means after the first call within ~5 minutes, subsequent calls pay only for the question + answer tokens, not the full ~5-7K-token context. Cache hits are visible in the response's `usage.cacheReadTokens`.
- Per-isolate rate limit maps reset when the Worker restarts (Cloudflare may rotate isolates after idle). For tighter limits, switch to KV — overkill for our traffic.
