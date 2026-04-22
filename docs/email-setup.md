# Daily Morning Email — Setup Guide

**Version:** 1 | **Date:** 2026-04-20

Purpose: configure Resend so every morning at ~3 AM EDT, after the daily ingestion finishes, a rich HTML email briefing goes to you, your brother, and anyone else on the recipient list.

Cost: **$0 at current volume** (3,000 emails/month free tier; our usage is ~5/day = 150/month).

---

## Step 1 — Create a Resend account

1. Go to https://resend.com/signup
2. Sign up with the email address you'd like associated with the account (not necessarily a recipient — this is the account owner)
3. Verify the email (Resend will send you a confirmation)

---

## Step 2 — Create an API key

1. In the Resend dashboard, left sidebar → **API Keys**
2. Click **+ Create API Key**
3. Name: `Ozark Joe's Baseball Daily`
4. Permission: **Sending access** (full access is unnecessary)
5. Click **Add**
6. **Copy the key immediately** — it starts with `re_`. Paste into Notepad as a scratch.

---

## Step 3 — Add two GitHub Secrets

Go to: https://github.com/jjmgladden/baseball-daily/settings/secrets/actions

Click **New repository secret** twice:

**Secret 1:**
- Name: `RESEND_API_KEY`
- Value: paste your `re_...` key

**Secret 2:**
- Name: `EMAIL_RECIPIENTS`
- Value: comma-separated list of email addresses, no spaces required
- Example: `you@gmail.com,brother@gmail.com`
- To **add someone later**: edit this secret and append `,newperson@email.com`

---

## Step 4 — Verify it works

Trigger the daily workflow manually:

```
gh workflow run daily.yml --repo jjmgladden/baseball-daily
```

Or visit https://github.com/jjmgladden/baseball-daily/actions/workflows/daily.yml → **Run workflow**.

After ~90 seconds, check:
1. **Your inbox** — the email should arrive
2. **Workflow run logs** — should end with `[send-email] Sent. Resend id: <uuid>`
3. **Resend dashboard** → Emails → should show a delivered entry

If nothing arrives:
- Check spam folder (first-ever email from a new sender often gets filtered)
- Verify the Secret names are **exactly** `RESEND_API_KEY` and `EMAIL_RECIPIENTS` (case-sensitive)
- Check the workflow logs for any `[send-email]` error lines

---

## Step 5 (optional) — Use a custom sender domain

By default, emails send from `Ozark Joe's Baseball Daily <onboarding@resend.dev>`. Works fine, but Resend adds a small footer disclaiming the delivery. To remove it and use your own address:

### 5a — Register a domain (~$10/year)

Recommended registrar: **Cloudflare Registrar** — at-cost pricing, free DNS hosting, clean UI:
1. https://dash.cloudflare.com/ (sign up or log in)
2. Top-nav → **Domain Registration** → **Register Domains**
3. Search for `ozarkjoe.com` (or whatever) → add to cart → checkout
4. ~$9-10/year for .com

Alternatives: Namecheap (~$12/yr), Porkbun (~$9/yr).

### 5b — Add the domain in Resend

1. Resend dashboard → **Domains** → **+ Add Domain**
2. Enter your domain (e.g. `ozarkjoe.com`)
3. Resend displays DNS records to add — typically 3 of them:
   - `MX` record (for Resend's mail servers)
   - `TXT` record for SPF (authorizes Resend to send for your domain)
   - `TXT` record for DKIM (cryptographic signature)
   - Optionally a `TXT` DMARC record

### 5c — Add DNS records at the registrar

In Cloudflare (or your registrar's DNS manager):
1. Navigate to DNS settings for your domain
2. Add each record exactly as Resend shows (name, type, value, TTL)
3. For Cloudflare specifically: make sure the **proxy status is "DNS only"** (grey cloud) for these records — not proxied

### 5d — Verify + update the GitHub Secret

1. Back in Resend → your domain → **Verify**
2. Verification usually completes within 10-30 minutes; DNS propagation can take up to 24 hours
3. Once verified, add a **third GitHub Secret**:
   - Name: `EMAIL_FROM`
   - Value: `Ozark Joe's Baseball Daily <daily@ozarkjoe.com>` (replace with your domain and chosen mailbox)
4. Next workflow run sends from your custom address

---

## Adding / removing recipients later

To add someone:
1. Go to https://github.com/jjmgladden/baseball-daily/settings/secrets/actions
2. Click **Update** next to `EMAIL_RECIPIENTS`
3. Append `,newperson@email.com` to the existing value
4. Save

To remove someone: same flow, delete their address.

No code change needed — the workflow reads the secret at every run.

---

## Email content customization

The email body is generated in `ingestion/lib/email-template.js`. To tweak:

- **Subject line logic:** `buildSubject()` function
- **HTML body layout:** `buildHtml()` function
- **Plain-text fallback:** `buildPlainText()` function

Common tweaks:
- Change accent colors: edit the inline `style` attributes (red `#C41E3A` = Cardinals, red `#AB0003` = Nationals, gold `#FEDB00`, navy `#0E1821`, etc.)
- Reduce content density: comment out the "On This Day" block
- Add sections: pull from the snapshot (e.g. `snapshot.cardinals.highlights` for highlight titles)

Test changes locally without sending:

```
cd "C:\Users\John & Cindy Gladden\Desktop\AI\Claude\Baseball Project"
set RESEND_API_KEY=re_dummy
set EMAIL_RECIPIENTS=test@example.com
set EMAIL_DRY_RUN=1
node ingestion/send-email.js
```

Prints the subject and plain-text preview without calling Resend.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Workflow succeeds but no email arrives | Check spam folder | Mark not-spam once, future emails land in inbox |
| Log shows `RESEND_API_KEY not set` | Secret name typo or not saved | Step 3 — must be EXACTLY `RESEND_API_KEY` |
| Log shows `Resend API 403` | Invalid API key | Step 2 — regenerate key and update the GitHub Secret |
| Log shows `Resend API 422` | Invalid sender domain | If you set `EMAIL_FROM` to a custom domain, verify it's verified in Resend first |
| Email arrives but links don't work | Pages not yet rebuilt | Wait 1-2 min after workflow — email is sent before Pages finishes. Link still works; content just might be 1-2 min old |
| Custom domain DNS not verifying | Records wrong or TTL too long | Step 5c — double-check exact values; DNS can take up to 24 hr to propagate |

---

## If you want to disable the email

Delete the `RESEND_API_KEY` GitHub Secret. The workflow will detect missing credentials and skip silently — ingestion continues normally, no email sent.

To re-enable: add the secret back.
