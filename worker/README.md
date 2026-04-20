# baseball-daily-submit — Cloudflare Worker

A tiny Cloudflare Worker that receives submissions from the Baseball Daily site's "Suggest a player or moment" form and turns them into labeled GitHub Issues on `jjmgladden/baseball-daily`.

**Why:** the main site is static (GitHub Pages). To accept form submissions without a full backend, the Worker acts as a single-purpose adapter — browser → Worker → GitHub API.

**Why Cloudflare:** free tier covers 100,000 requests/day (we'll use maybe 10/day), no cold starts, deploy in one command, zero infrastructure you have to babysit.

---

## First-time setup (one-time, ~15 min)

### 1. Create a Cloudflare account (if you don't have one)
- Go to https://dash.cloudflare.com/sign-up
- Free tier is all you need

### 2. Install wrangler (the Cloudflare CLI)
From anywhere:
```
npm install -g wrangler
```
Or use `npx` without installing globally.

### 3. Authenticate wrangler with your Cloudflare account
```
cd worker
npx wrangler login
```
A browser window opens; click **Allow**. Closes automatically.

### 4. Create a fine-grained GitHub PAT for the Worker
This is the token the Worker uses to create Issues. **Narrowly scoped so it can do nothing but open Issues on this one repo.**

1. https://github.com/settings/personal-access-tokens/new
2. **Token name:** `baseball-daily-submit-worker`
3. **Expiration:** 1 year (recommended)
4. **Repository access:** Only select repositories → choose `jjmgladden/baseball-daily`
5. **Permissions → Repository permissions:**
   - **Issues:** Read and write
   - Leave everything else untouched
6. **Generate token** → copy the value (starts with `github_pat_`)

### 5. Set the token as a Worker secret
```
cd worker
npx wrangler secret put GITHUB_TOKEN
```
Paste the token when prompted.

### 6. Deploy the Worker
```
npx wrangler deploy
```

After ~30 seconds wrangler prints the Worker URL. It'll look like:
```
https://baseball-daily-submit.<your-subdomain>.workers.dev
```

**Copy this URL.**

### 7. Wire the URL into the site
Open `app/js/components/suggest.js` in the main repo and replace the placeholder:

```js
const SUBMIT_URL = 'https://baseball-daily-submit.REPLACE-ME.workers.dev';
```

with your actual Worker URL. Commit and push.

Done. Try the "Suggest a player or moment" link in the footer — the Worker will create a GitHub Issue with the submission.

---

## Maintenance

### View recent submissions
```
cd worker
npx wrangler tail
```
Streams live Worker logs. Ctrl+C to stop.

### Rotate the GitHub token
1. Create a new fine-grained PAT (same scope as before)
2. `npx wrangler secret put GITHUB_TOKEN` — paste new value
3. Revoke the old PAT at https://github.com/settings/personal-access-tokens

### Update the Worker code
1. Edit `worker/src/index.js`
2. `npx wrangler deploy`

### Remove the Worker entirely
1. `npx wrangler delete baseball-daily-submit`

---

## What the Worker does

1. Accepts `POST` with JSON body:
   ```json
   {
     "type": "player" | "moment" | "other",
     "name": "Curt Flood",
     "reason": "Challenged the reserve clause in 1969...",
     "source": "https://en.wikipedia.org/wiki/Curt_Flood",
     "submitterName": "Optional",
     "submitterEmail": "Optional"
   }
   ```
2. Validates fields and rate-limits (3 submissions per IP per 10 min)
3. Silently drops submissions where the `website` honeypot field is filled (bot protection)
4. Calls GitHub REST API to open an Issue titled `Submission: {type} — {name}` with labels `submission`, `submission:{type}`
5. Returns `{ ok: true, issueUrl, issueNumber }` on success

---

## Porting to other projects

The Worker is intentionally small and generic. To reuse on another project:

1. Copy this `worker/` directory
2. Edit `wrangler.toml`:
   - Change `name` to something unique
   - Update `GITHUB_REPO` to the target repo
   - Update `ALLOWED_ORIGINS` to that project's URLs
3. Create a new fine-grained PAT for that repo
4. `wrangler secret put GITHUB_TOKEN`
5. `wrangler deploy`

~5 minutes per new project once the pattern is in place.

---

## Cost

- Worker requests: 100,000/day free, we use ~10/day at most. **$0**.
- Cloudflare account: free.
- GitHub PAT: free.

No hidden costs.
