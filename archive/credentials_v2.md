# Credentials Inventory

**Version:** 2 | **Last updated:** 2026-05-03 (Session 9 — Phase B6 in flight: AI Q&A code shipped; `ANTHROPIC_API_KEY` row reflects active build status; Worker renamed `baseball-daily-submit` → `baseball-daily-api` reflecting dual-route purpose; awaiting owner-side credential creation + Worker deploy to flip status to ✅)

This is the canonical, living record of every credential (API key, token, account login) that the **baseball-daily** project uses. Updated whenever a credential is added, rotated, or revoked.

The doc lists *what exists* and *where it lives* — never the actual values. Real values live only in the owner's password manager + the encrypted secret stores listed below.

> **Maintenance trigger:** Per `CLAUDE.md` § Session-End Protocol Step 2, this doc must be updated in any session where a credential is added, rotated, revoked, moved between storage locations, or has a status change. If you're reading this doc and notice it's out of date with reality, update it as part of whatever session you're in.

---

## Table of Contents

1. [Quick primer](#quick-primer)
2. [Storage locations](#storage-locations)
3. [Active credentials inventory](#active-credentials-inventory)
4. [Sibling-project sharing posture](#sibling-project-sharing-posture)
5. [Adding a new credential — checklist](#adding-a-new-credential--checklist)
6. [Rotating a credential — checklist](#rotating-a-credential--checklist)
7. [Lost / leaked credential — recovery procedure](#lost--leaked-credential--recovery-procedure)
8. [Per-credential detail sections](#per-credential-detail-sections)
9. [Maintenance log](#maintenance-log)

---

## Quick primer

A **credential** is a string of characters that proves identity to a third-party service (Google, Resend, GitHub, Cloudflare, Anthropic). Holding the credential = ability to act as the owner on that service. Treat each one like a house key.

### Flavors

- **API key** — long random string from a service's dashboard. Most common.
- **Personal Access Token (PAT)** — GitHub-specific API key, can be scoped narrowly.
- **OAuth token** — auto-managed when clicking "Allow" in a browser-based login flow. Not handled directly.
- **Account password / 2FA** — what the owner remembers + their phone.
- **Service-managed CLI token** — auto-stored after `wrangler login` / `gh auth login`. Not touched directly.

### The non-negotiable rules

1. **Never commit a credential to git.** Public repo = compromised forever. The `scripts/check-secrets.js` gate catches this on the way in.
2. **Each credential has one job.** Don't share across projects unless the rationale is documented (see § Sibling-project sharing posture).
3. **Scope as narrowly as the service allows.** Fine-grained > broad. Single-API-restriction > full-account.
4. **You cannot recover a credential — only replace it.** Services show the value once. If lost: delete the dead one, create a new one.
5. **Rotation is normal.** Replace each credential annually or on suspicion of leakage. Process: create new → paste into all storage locations → revoke old.

---

## Storage locations

Five distinct places credentials live in this project:

| Location | What it is | Visible to | Used when |
|---|---|---|---|
| **Owner's password manager** | Personal copy of every credential. Canonical home maintained by the owner. | Owner only. | Source of truth — where the owner pastes *from* into all other locations. |
| **Local `.env` file** | Plain-text file at project root. Gitignored. Never leaves the owner's Windows machine. | Owner + anything running on the machine. | Running ingestion locally (`node ingestion/fetch-daily.js`, etc.). |
| **GitHub repository Secrets** | Encrypted in GitHub's vault. Readable only by workflows. | The workflow at runtime. Not even the owner can read after pasting (only delete + re-paste). | GitHub Actions runs the daily workflow. |
| **Cloudflare Worker secrets** | Encrypted in Cloudflare's vault. Readable only by the deployed Worker. | The Worker at runtime. Not even the owner can read after pasting. | Worker is deployed and receiving requests (Phase B6 forward). |
| **Service-managed CLI auth** | Hidden token files written by `wrangler login` / `gh auth login`. | The CLIs only. | Running a wrangler / gh command from the terminal. |

**Direction of movement:** password manager → all other locations (one-way). Never the other direction. If the password manager copy is lost, re-create at the source service rather than trying to extract from a deployment location.

---

## Active credentials inventory

Quick-reference table. Detailed sections below.

| Name | Type | Status | Created | Used by | Where stored | Manage at |
|---|---|---|---|---|---|---|
| **`YOUTUBE_API_KEY`** | API key (Google) | ✅ Active | 2026-04-20 (Phase 3A) | `ingestion/lib/youtube-api.js` (highlight ingestion) | Local `.env` + GitHub Secret | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| **`RESEND_API_KEY`** | API key (Resend) | ✅ Active | 2026-05-01 (Session 4 — Phase B1) | `ingestion/send-email.js` | GitHub Secret | [Resend → API Keys](https://resend.com/api-keys) |
| **`EMAIL_RECIPIENTS`** | Plain config | ✅ Active (3 recipients) | 2026-05-01 (Session 4 — initial 1 recipient) | `ingestion/send-email.js` | GitHub Secret | [Repo Secrets](https://github.com/jjmgladden/baseball-daily/settings/secrets/actions) |
| **`EMAIL_FROM`** | Plain config (sender address) | ✅ Active | 2026-05-01 (Session 4) | `ingestion/send-email.js` | GitHub Secret | [Repo Secrets](https://github.com/jjmgladden/baseball-daily/settings/secrets/actions) |
| **`ANTHROPIC_API_KEY`** | API key (Anthropic) | ⏸ Phase B6 — code shipped, awaiting owner creation | — | Cloudflare Worker `baseball-daily-api` `/ai` route (KB-0033) | Will be: Local `.env` + GitHub Secret + Cloudflare Worker secret | [console.anthropic.com → API keys](https://console.anthropic.com/settings/keys) |
| **`glad-fam.com`** (domain) | Owned domain | ✅ Active (shared with pickleball) | 2026-04-24 (pickleball Session 6) | Resend sender (`baseball@glad-fam.com`) | Cloudflare Registrar (account credentials in owner's password manager) | [Cloudflare Registrar](https://dash.cloudflare.com/?to=/:account/registrar) |
| **`GITHUB_TOKEN`** (Worker — submission route) | Fine-grained PAT | ⏸ Pending owner deploy (KB-0024 — optional for Phase B6) | — | `worker/src/index.js` (`/submit` route — scaffolded; AI route is the primary B6 use case) | Cloudflare Worker secret | [GitHub PAT settings](https://github.com/settings/personal-access-tokens) |
| **Anthropic Console account** | Account credentials | ✅ Active (created during pickleball Session 8) | 2026-04-26 | Holds the future `ANTHROPIC_API_KEY` + spend cap + billing | Owner's password manager | https://console.anthropic.com |
| **Cloudflare account login** | Account credentials | ✅ Active (created during pickleball Session 6) | 2026-04-24 | Owns `glad-fam.com` + DNS + future baseball Worker | Owner's password manager + wrangler OAuth | [Cloudflare dashboard](https://dash.cloudflare.com) |
| **Google Cloud account** | Account credentials | ✅ Active (pre-existing) | (pre-existing) | Hosts the YouTube key project | Owner's password manager | [Google Cloud Console](https://console.cloud.google.com) |
| **Resend account** | Account credentials | ✅ Active (shared with pickleball) | 2026-04-23 (pickleball Session 6) | Holds the Resend API key | Owner's password manager | https://resend.com |
| **GitHub account** | Account credentials | ✅ Active (pre-existing) | (pre-existing) | Repo + Actions + future PAT | Owner's password manager | https://github.com |
| **GitHub git push auth** | OAuth (Windows Credential Manager) | ✅ Active | (pre-existing) | `git push` from terminal | Windows Credential Store | Windows Credential Manager (`cmdkey /list`) |

Status legend: ✅ Active · ⏸ Not yet created (or not yet needed)

---

## Sibling-project sharing posture

The **baseball-daily** and **pickleball-daily** projects are independent sibling projects but share a small number of credentials and assets where the owner pays once and uses across both. This section is the canonical record of what's shared and why.

| Asset | Sharing | Reason | Risk if compromised |
|---|---|---|---|
| **`YOUTUBE_API_KEY`** | Same value in both projects' `.env` + GitHub Secrets | Single Google Cloud project, single API quota (10K units/day). Daily usage across both projects is well under 1% of quota. | Low — read-only API; rotation is fast at console.cloud.google.com. |
| **`RESEND_API_KEY`** | Same value in both projects' GitHub Secrets | Single Resend account (`jjmgladden`); free tier (3,000 emails/mo) is shared headroom. Daily sends across both = ~6/day, ~180/mo — far under cap. | Low — sending-only scope; rotation is fast at resend.com/api-keys. |
| **`glad-fam.com`** domain | Owned by pickleball's Cloudflare account; both projects use as Resend sender domain (`baseball@glad-fam.com` vs `daily@glad-fam.com`) | Domain verified once on Resend; any sender on the domain works. ~$10/year renewal. | Low — losing the domain forces fallback to Resend default sender (Path A) for both projects. Auto-renewal at Cloudflare prevents this. |
| **Cloudflare account** | Same account; will eventually host two Workers (`pickleball-daily-api` already deployed; `baseball-daily-api` planned for Phase B6) | One account = one billing relationship + one set of credentials to rotate | Medium — compromised Cloudflare account could redirect DNS or serve attacker content. 2FA on the account is the mitigation. |
| **Anthropic Console account** | Same account; spend cap is account-wide (currently $20/mo set by pickleball) | One billing relationship; cap protects both projects from runaway costs | Phase B6 will need a separate `ANTHROPIC_API_KEY` value scoped to the new baseball Worker. The shared item is the *account*, not the key. |
| **GitHub account** | Same account; two separate repos (`jjmgladden/baseball-daily` + `jjmgladden/pickleball-daily`) | One identity, two repos | Both repos compromised together if account compromised; 2FA mandatory. |

**NOT shared (kept separate by design):**

- **GitHub repo Secrets** — each repo has its own `EMAIL_RECIPIENTS`, `EMAIL_FROM`, etc. Even though the underlying value of `RESEND_API_KEY` is the same, the *secret entries* live in two different places and rotate independently.
- **Future Cloudflare Worker PATs** — when baseball deploys its Worker, it gets a new fine-grained PAT scoped only to `jjmgladden/baseball-daily`. Pickleball's PAT is not reused.
- **`ANTHROPIC_API_KEY` value** — Phase B6 will create a fresh key (workspace = Default, name `baseball-daily-prod` or similar) so the two projects can be revoked independently if either leaks.

---

## Adding a new credential — checklist

Repeatable process for any new credential:

1. **Decide on the name.** Use `UPPER_SNAKE_CASE` for env-var-style names (`RESEND_API_KEY`, not `resend-api-key`). Be specific (`GITHUB_TOKEN_WORKER`, not just `GITHUB_TOKEN`, if multiple are present).
2. **Generate at the source service.** Log into the dashboard, create the credential, **copy the value before closing the dialog** (most services show only once).
3. **Paste into the password manager FIRST.** Before doing anything else with it. This is the canonical home.
4. **Paste into the deployment location(s):**
   - For GitHub Actions: [Repo Secrets page](https://github.com/jjmgladden/baseball-daily/settings/secrets/actions) → New repository secret.
   - For Cloudflare Worker: `cd worker && npx wrangler secret put NAME_HERE`.
   - For local development: edit `.env` (project root, gitignored).
5. **Update `.env.example`** with a commented line documenting the variable name (NOT the value):
   ```
   # NEW_CREDENTIAL_NAME=...
   ```
6. **Update this document** (`docs/credentials.md`) — add a row to the inventory table + a per-credential detail section below.
7. **Update KB if appropriate** — for credentials that come with policy decisions (sharing posture, rotation cadence), add or update a KB entry.
8. **Verify it works** — run a workflow / Worker / local script that exercises the new credential. Check the log for success.
9. **Commit the doc + .env.example + KB changes** in one bundled commit.

---

## Rotating a credential — checklist

Recommended cadence: annually, OR immediately on suspicion of leakage.

1. **Generate a NEW credential** at the source service. Most services let you have multiple active credentials at once — useful for zero-downtime rotation.
2. **Paste new value into all storage locations** (password manager → GitHub Secret / Cloudflare Worker secret / local `.env`).
3. **Verify the new credential works** by triggering whatever uses it (workflow run, Worker request, local script).
4. **Revoke the OLD credential** at the source service. Don't leave orphans — every active credential is an attack surface.
5. **Update this doc** — change the "last rotated" date in the credential's detail section.
6. **If the credential is shared with the sibling pickleball project** (see § Sibling-project sharing posture), rotate in *both* projects' Secrets in the same session and verify both workflows.

---

## Lost / leaked credential — recovery procedure

If a credential has been lost or is suspected compromised (committed to git accidentally, screenshot leaked, etc.):

1. **Treat as compromised immediately.** Don't wait to confirm. Time matters.
2. **Revoke the existing credential** at the source service first. This stops the bleed.
3. **Generate a new credential** at the source service.
4. **Paste new value into all storage locations.**
5. **Verify replacement works.**
6. **Investigate the leak** (if relevant). Check `git log` for the offending commit; rotate any other credentials that may have been exposed in the same incident.
7. **Update this doc.** Note what happened in the credential's detail section as a maintenance log entry.

---

## Per-credential detail sections

### `YOUTUBE_API_KEY`

- **Type:** Google Cloud API key, restricted to YouTube Data API v3.
- **Used by:** `ingestion/lib/youtube-api.js` — fetches Cardinals + Nationals highlight videos for the Daily tab + email Top Highlights section.
- **Storage:** Local `.env` (for local ingestion runs) + GitHub Secret named `YOUTUBE_API_KEY` (for the daily workflow).
- **Source dashboard:** https://console.cloud.google.com/apis/credentials
- **Format:** `AIza...` followed by ~35 alphanumeric characters.
- **Quota:** 10,000 units/day. Daily ingestion (Cards + Nats searches) uses ~10–20 units. Plenty of headroom even shared with pickleball.
- **Restrictions to apply:** API restriction = "YouTube Data API v3 only".
- **Sharing:** ✅ Same key value used in pickleball's `.env` + GitHub Secret. Single Google Cloud project, shared quota. See § Sibling-project sharing posture.
- **If lost:** revoke at the dashboard, create new key with same restrictions, update both projects' storage locations, run `node ingestion/fetch-highlights.js` in each to verify.
- **Rotation history:**
  - 2026-04-20 (Phase 3A) — initial creation; activated end-to-end (KB-0003).
- **Cross-reference:** [KB-0003](knowledge-base.md#kb-0003--youtube-api-ingestion-code-landed-key-acquisition-pending) · `docs/youtube-api-setup.md`

### `RESEND_API_KEY`

- **Type:** Resend API key, scoped to "Sending access".
- **Used by:** `ingestion/send-email.js` — sends the daily morning briefing email.
- **Storage:** GitHub Secret named `RESEND_API_KEY`. (Removed from local `.env` in Session 5 to enforce single source-of-truth posture.)
- **Source dashboard:** https://resend.com/api-keys
- **Format:** `re_` followed by ~30 alphanumeric characters.
- **Quota:** Free tier — 100 emails/day, 3,000/month. Daily briefing uses 1 send per recipient (currently 3 recipients = 3 sends/day = ~90/mo). Combined with pickleball's ~3 recipients, ~180/mo total — far under the 3,000 cap.
- **Restrictions to apply:** Permission = "Sending access" (NOT "Full access"). Domain = "All domains".
- **Sharing:** ✅ Same key value used in pickleball's GitHub Secret. Single Resend account (`jjmgladden`). See § Sibling-project sharing posture.
- **If lost:** revoke at the Resend dashboard, create new key with "Sending access", update both projects' GitHub Secrets, dispatch a test workflow run in each to verify.
- **Rotation history:**
  - 2026-05-01 (Session 4 — Phase B1) — first added to baseball as a GitHub Secret. Same key value already in use by pickleball since 2026-04-23. First baseball send via run `25228703199`, Resend id `328b5393-a842-4939-ab8d-27c49bd725e9`. KB-0025 closed.
- **Cross-reference:** [KB-0025](knowledge-base.md#kb-0025--daily-morning-email-via-resend) · `docs/email-setup.md` · `docs/Daily-Email-Setup-Guide.docx`

### `EMAIL_RECIPIENTS`

- **Type:** Plain config string (comma-separated email addresses, no spaces). Not a true credential, but stored as a Secret for workflow access + privacy hygiene.
- **Used by:** `ingestion/send-email.js`.
- **Storage:** GitHub Secret named `EMAIL_RECIPIENTS`. (Removed from local `.env` in Session 5 to enforce single source-of-truth posture.)
- **Format example:** `you@example.com,reader@example.com`
- **Editing:** GitHub Secrets are pure-replace — to add or remove a recipient, click the edit icon next to the secret on the Repo Secrets page, paste the new full comma-separated list, save. **Always include EVERY current recipient + EVERY new recipient in one full string.** Forgetting an existing recipient silently drops them from future sends.
- **Where the canonical list lives:** owner's password manager has the actual comma-separated string. This doc tracks WHO is on the list (descriptors only, no actual addresses) so future sessions can see membership without seeing values.
- **Current value:** 3 recipients as of 2026-05-02 (Session 5):
  - Owner's primary address (added 2026-05-01, Session 4 — Path B activation)
  - Owner's brother (eastern-zone reader, added 2026-05-02, Session 5)
  - Owner's brother's wife (added 2026-05-02, Session 5)
- **Recipient change log:**
  - 2026-05-01 (Session 4) — initial: owner only (smoke test for Path B baseball-side activation; `EMAIL_FROM` = `baseball@glad-fam.com`)
  - 2026-05-02 (Session 5, ~02:51 UTC) — expanded to 3 recipients via owner direct edit of GitHub Secret in the UI. Verification deferred to next 07:00 UTC scheduled cron (post-Session-5).
- **Sibling-project relationship:** Pickleball maintains its own separate `EMAIL_RECIPIENTS` Secret with the same 3 addresses (owner + brother + brother's wife). Manual sync if either list changes; small enough volume that this is acceptable.

### `EMAIL_FROM`

- **Type:** Plain config string — sender display name + address.
- **Used by:** `ingestion/send-email.js`. If unset, would default to Resend's `onboarding@resend.dev` (Path A — owner-only sending due to Resend free-tier restriction).
- **Storage:** GitHub Secret named `EMAIL_FROM`. (Removed from local `.env` in Session 5.)
- **Current value:** `Ozark Joe's Baseball Daily <baseball@glad-fam.com>` (Path B — multi-recipient sending via verified domain)
- **Format:** `Display Name <localpart@verified-domain>` — must be a sender on a domain verified at Resend.
- **Source dashboard:** [Repo Secrets](https://github.com/jjmgladden/baseball-daily/settings/secrets/actions) for the value · Resend dashboard for domain verification status (Domains tab).
- **If lost / accidentally cleared:** the workflow falls back to the Path A default sender (`onboarding@resend.dev`), which silently restricts sends back to owner-only. To restore: edit the Secret with the same value (display + verified-domain address). Domain verification on Resend is unaffected by losing this Secret.
- **Maintenance log:**
  - 2026-05-01 (Session 4) — first set; reuses `glad-fam.com` domain verified on Resend during pickleball Session 6 (no DNS work needed; any sender on the domain is pre-authorized).

### `ANTHROPIC_API_KEY` (Phase B6 — code shipped, awaiting owner-side creation)

- **Type:** Anthropic API key (Workspace-scoped).
- **Used by:** Cloudflare Worker `baseball-daily-api` `/ai` route (KB-0033 Phase B6 — AI Q&A layer). Mirrors pickleball's KB-0008 architecture.
- **Storage (when created):**
  - Local `.env` (for local test scripts that hit the API directly during build/verification)
  - GitHub Secret named `ANTHROPIC_API_KEY` (kept available for future workflow-side AI tooling)
  - Cloudflare Worker secret (set via `wrangler secret put` from `worker/` after Worker deploys)
- **Source dashboard:** [console.anthropic.com → Organization settings → API keys](https://console.anthropic.com/settings/keys)
- **Format:** `sk-ant-api03-` followed by ~95 alphanumeric characters (mixed case + symbols).
- **Account:** Workspace = "Default" (the only workspace on the owner's account). Created during pickleball Session 8.
- **Spend posture (account-level, shared with pickleball):**
  - $20 prepaid credit balance (purchased during pickleball Session 8 — 2026-04-26; expires 1 year after purchase per Anthropic policy)
  - Monthly spend cap: $20 (Anthropic Console → Organization settings → Limits → Spend limits)
  - Auto-reload: **OFF** (kept off so the spend cap is a true ceiling, not a refill trigger)
  - Email alerts at $1 / $5 / $15 of monthly spend
- **Sharing:** ❌ Key VALUE will be a fresh key (`baseball-daily-prod` or similar) so it can be revoked independently of pickleball's `pickleball-daily-prod` key. The Anthropic *account* is shared (one billing relationship + one spend cap covering both projects).
- **Restrictions to apply at creation:** Workspace = Default. Permissions = Default / All.
- **If lost or compromised (when active):** Anthropic Console → API keys → click the trash icon next to the key name to revoke immediately. Then create a new key (same name + suffix `-v2`), paste new value into the three storage locations above, dispatch a smoke test against the Worker `/ai` route, confirm response, then delete the revoked key entry.
- **Rotation history:** N/A — not yet created.
- **Cross-reference:** [KB-0033](knowledge-base.md#kb-0033--phase-b6--ai-qa-layer) · [KB-0028 Phase B6](knowledge-base.md#kb-0028--pickleball-parity-multi-phase-plan-b1---b2---b3-b7-pending) · pickleball KB-0008 (architecture parent) · pickleball KB-0042 (cost posture)

### `GITHUB_TOKEN` (Worker — fine-grained PAT, KB-0024)

- **Type:** Fine-grained GitHub Personal Access Token.
- **Used by:** `worker/src/index.js` `/submit` route — creates Issues from form submissions ("Suggest a player or moment" footer link).
- **Storage:** Cloudflare Worker secret (will be set via `npx wrangler secret put GITHUB_TOKEN` from `worker/` once Worker is deployed).
- **Source dashboard:** https://github.com/settings/personal-access-tokens
- **Format:** `github_pat_` followed by ~80 alphanumeric characters.
- **Status:** Not yet created — Worker not deployed (KB-0024 awaiting owner deploy; will revive in Phase B6 alongside the AI Q&A Worker).
- **When created, scope must be:**
  - **Repository access:** Only select repositories → choose `jjmgladden/baseball-daily` (single repo, not "all repositories")
  - **Repository permissions → Issues:** Read and write
  - **All other permissions:** leave at "No access"
  - **Expiration:** 1 year recommended.
- **Sharing:** ❌ Separate from pickleball's eventual Worker PAT. Each Worker gets its own fine-grained PAT scoped to its own repo only.
- **If lost:** revoke at the GitHub PAT settings page, create new with identical scope, run `npx wrangler secret put GITHUB_TOKEN` from `worker/` to update the Worker, submit a test form to verify.
- **Cross-reference:** [KB-0024](knowledge-base.md#kb-0024--curation-pipeline-weekly-batch-workflow--public-submission-worker) · `worker/README.md`

### Cloudflare account login

- **Type:** Account credentials.
- **Used by:** Multiple — (a) owns `glad-fam.com` domain via Cloudflare Registrar; (b) hosts DNS for `glad-fam.com` (Resend SPF/DKIM/DMARC records); (c) will host the deployed `baseball-daily-api` Worker (KB-0028 Phase B6); (d) already hosts the deployed `pickleball-daily-api` Worker (sibling project) and the `jjmgladden.workers.dev` subdomain (permanent — will host all future Workers across all owner projects).
- **Storage:** Account credentials in owner's password manager. Wrangler stores an OAuth token at `C:\Users\John & Cindy Gladden\AppData\Roaming\xdg.config\.wrangler\config\` after `wrangler login` (refreshes automatically; never click Cancel on unprompted Cloudflare consent popups during wrangler-related work — those are silent token refreshes per pickleball's Session 8 lesson).
- **Source:** https://dash.cloudflare.com (existing account — created during pickleball Session 6 alongside `glad-fam.com` purchase).
- **Status:** ✅ Active (account exists, owns `glad-fam.com`, hosts its DNS, runs the live `pickleball-daily-api` Worker).
- **Worker assets owned via this account (state at baseball Session 6):**
  - `pickleball-daily-api` Worker — deployed 2026-04-27 (sibling project).
  - `jjmgladden.workers.dev` subdomain (one-time per-account registration; permanent).
  - `baseball-daily-api` Worker — pending Phase B6 deployment.

### `glad-fam.com` domain

- **Type:** Owned domain name.
- **Used by:** Resend sender address (`baseball@glad-fam.com` via baseball's `EMAIL_FROM` Secret). Pickleball uses `daily@glad-fam.com` from the same domain.
- **Storage:**
  - **Registrar:** Cloudflare Registrar (linked to owner's Cloudflare account)
  - **DNS host:** Cloudflare DNS (auto-set when Cloudflare is the registrar)
  - **Renewal:** annual, ~$10/year at Cloudflare's at-cost pricing
- **DNS records currently active (managed by pickleball — baseball reuses):**
  - `MX send.glad-fam.com → feedback-smtp.us-east-1.amazonses.com` (Resend bounce handling)
  - `TXT resend._domainkey.glad-fam.com` (Resend DKIM public key)
  - `TXT send.glad-fam.com` (Resend SPF: `v=spf1 include:amazonses.com ~all`)
- **Source dashboard:**
  - Domain ownership / renewal: [Cloudflare Registrar](https://dash.cloudflare.com/?to=/:account/registrar)
  - DNS records: Cloudflare DNS dashboard for `glad-fam.com`
  - Resend domain status: https://resend.com/domains
- **Verification status on Resend:** ✅ Verified (2026-04-24 during pickleball Session 6).
- **Sharing:** ✅ Domain is shared between baseball + pickleball. Any sender on the domain works without additional verification.
- **If lost:** if the domain registration lapses (failure to renew), Resend will eventually fail to verify SPF/DKIM/DMARC and email sending will degrade in BOTH projects. To prevent: keep auto-renewal enabled at Cloudflare; renewal reminder emails go to owner's primary address.
- **Status:** ✅ Active.

### Anthropic Console account

- **Type:** Account credentials (shared with pickleball).
- **Used by:** Holds the future `ANTHROPIC_API_KEY` for baseball's Phase B6 Worker, alongside pickleball's already-active key. Single billing relationship with $20/mo spend cap covering both projects.
- **Storage:** Owner's password manager.
- **Created:** 2026-04-26 (pickleball Session 8).
- **Username:** `jjmgladden@gmail.com`
- **Plan:** Pay-as-you-go with prepaid credit; $20/mo cap.
- **Notes:** Account is independent of any Claude.ai subscription (Pro / Max plans don't grant API credit).

### Google Cloud account

- **Type:** Account credentials (pre-existing, owned personally).
- **Used by:** Hosts the GCP project that owns the `YOUTUBE_API_KEY` (shared with pickleball).
- **Storage:** Owner's password manager.
- **Notes:** YouTube Data API v3 is free at the projects' usage volumes. A misconfigured restriction or an enabled-paid-API could surprise the owner — keep the project scoped to YouTube Data API v3 only.

### Resend account

- **Type:** Account credentials (shared with pickleball).
- **Used by:** Holds the `RESEND_API_KEY`.
- **Storage:** Owner's password manager.
- **Created:** 2026-04-23 (pickleball Session 6).
- **Username:** `jjmgladden`
- **Plan:** Free tier (100 emails/day, 3,000/month).

### GitHub account

- **Type:** Account credentials (pre-existing, owned personally).
- **Used by:** Owns the `baseball-daily` repo, the workflows, the Repo Secrets, and (eventually) the fine-grained PAT for the Worker. Same account also owns sibling `pickleball-daily` repo.
- **Storage:** Owner's password manager.
- **Notes:** 2FA is strongly recommended for any GitHub account that owns a PAT or hosts repos with Secrets.

### GitHub git push auth (Windows Credential Manager)

- **Type:** OAuth credential auto-managed by Git Credential Manager on Windows.
- **Used by:** Every `git push` from the terminal.
- **Storage:** Windows Credential Store. View with `cmdkey /list | grep git` from a command prompt.
- **Created:** Pre-existing.
- **If lost:** Git will prompt for re-auth on next push; a browser window opens for GitHub login, token gets re-stored automatically.

---

## Maintenance log

Significant credential events worth recording:

- **2026-04-20 (Phase 3A)** — `YOUTUBE_API_KEY` set up; ingestion verified end-to-end. Pasted into local `.env` + GitHub Secret. KB-0003 closed.
- **2026-05-01 (Session 4 — Phase B1)** — `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS` first added to baseball's GitHub Secrets via `gh secret set` from local `.env` (option β walkthrough — owner pasted values once into local `.env`, Claude piped each to the GitHub API without echoing to chat). `RESEND_API_KEY` value already in use by pickleball since 2026-04-23 — same key reused. `EMAIL_FROM = "Ozark Joe's Baseball Daily <baseball@glad-fam.com>"` reuses `glad-fam.com` domain verified by pickleball Session 6. `EMAIL_RECIPIENTS` = 1 recipient (smoke test). First send via run `25228703199`, Resend id `328b5393-a842-4939-ab8d-27c49bd725e9`. KB-0025 closed.
- **2026-05-02 (Session 5 — Phase B2)** — `EMAIL_RECIPIENTS` expanded from 1 to 3 recipients via owner direct edit of GitHub Secret in the UI (owner + brother + brother's wife). Resend trio (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_RECIPIENTS`) removed from local `.env` to enforce single source-of-truth posture (matches pickleball's posture). Verification of 3-recipient send deferred to next 07:00 UTC scheduled cron.
- **2026-05-02 (Session 6 — Phase B3)** — This document created as the canonical credentials inventory for baseball-daily. Initial baseline = 4 active credentials (`YOUTUBE_API_KEY`, `RESEND_API_KEY`, `EMAIL_RECIPIENTS`, `EMAIL_FROM`) + 1 owned domain (`glad-fam.com`, shared with pickleball) + accounts (Resend, Google Cloud, GitHub, Cloudflare, Anthropic). No credentials added or rotated this session — pure documentation port from pickleball's `docs/credentials.md`.
- **2026-05-03 (Session 9 — Phase B6 in flight)** — Doc rolled v1 → v2. Worker rewritten + renamed `baseball-daily-submit` → `baseball-daily-api` (dual-route: AI Q&A primary, submission route scaffolded). `ANTHROPIC_API_KEY` row updated from "not yet created" to "code shipped, awaiting owner creation". `GITHUB_TOKEN` (Worker) row clarified as optional for Phase B6 (AI route doesn't need it). No credential VALUES changed this session — owner-side creation + Worker deploy + secret upload are the next steps to flip both `ANTHROPIC_API_KEY` and (optionally) `GITHUB_TOKEN` to ✅. KB-0033 added.

---

## Related documents

- `docs/knowledge-base.md` — KB entries reference specific credentials and policy decisions.
- `.env.example` — template showing which env vars exist (without values).
- `.gitignore` — ensures `.env` is never committed.
- `scripts/check-secrets.js` — pre-commit/pre-push gate that scans for known credential patterns.
- `worker/README.md` — Worker deployment walkthrough including PAT creation.
- `CLAUDE.md` § Session-End Protocol Step 2 — mandate to update this doc.
- Sibling project: `C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Pickleball Project\docs\credentials.md` — pickleball's parallel inventory; cross-reference when sharing posture changes.
