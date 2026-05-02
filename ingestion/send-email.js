#!/usr/bin/env node
/**
 * send-email — v3
 *
 * Sends the morning briefing via Resend. Runs after fetch-daily.js +
 * fetch-news.js and the snapshot commit in .github/workflows/daily.yml.
 * Locally, runs via `node ingestion/send-email.js` with env vars set.
 *
 * v3: reads BOTH the main snapshot and the separate news snapshot
 * (`data/snapshots/news-latest.json`) and passes both to buildEmail.
 * If news-latest.json is missing or unparseable, the email still sends —
 * the Top News section is simply omitted.
 *
 * v2 baseline (unchanged): rendering in email-template.js v3 includes
 * Today's Schedule, highlight thumbnails, all-NL+AL standings, notable
 * games one-liners, and recap details (W/L/Sv + first scoring play)
 * inside the Cards/Nats pins. Requires snapshot schemaVersion >= 5.
 *
 * Required env:
 *   RESEND_API_KEY      — from resend.com dashboard
 *   EMAIL_RECIPIENTS    — comma-separated list (e.g. "a@b.com,c@d.com")
 *
 * Optional env:
 *   EMAIL_FROM          — default "Ozark Joe's Baseball Daily <onboarding@resend.dev>"
 *                          override with verified-domain address (e.g. "daily@ozarkjoe.com")
 *   EMAIL_DRY_RUN       — "1" to log the email without sending
 *
 * Exit codes:
 *   0  — email sent (or dry-run completed, or skipped with reason logged)
 *   1  — fatal error (missing snapshot, API failure on non-skip conditions)
 *
 * Skip-without-failing conditions (exit 0, log reason):
 *   - RESEND_API_KEY not set (we don't fail the daily workflow just because
 *     email isn't configured yet)
 *   - EMAIL_RECIPIENTS empty
 */

const fs = require('fs');
const path = require('path');

// Tolerant .env loader for local runs
try { require('./lib/env').loadEnvFile(); } catch {}

const { buildEmail } = require('./lib/email-template');

const DEFAULT_FROM = "Ozark Joe's Baseball Daily <onboarding@resend.dev>";
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT_PATH = path.join(PROJECT_ROOT, 'data', 'snapshots', 'latest.json');
const NEWS_SNAPSHOT_PATH = path.join(PROJECT_ROOT, 'data', 'snapshots', 'news-latest.json');

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const recipientsRaw = process.env.EMAIL_RECIPIENTS || '';
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const dryRun = process.env.EMAIL_DRY_RUN === '1';

  if (!apiKey) {
    console.log('[send-email] RESEND_API_KEY not set — skipping (configure in GitHub Secrets to activate)');
    return;
  }

  const recipients = recipientsRaw.split(',').map(s => s.trim()).filter(Boolean);
  if (!recipients.length) {
    console.log('[send-email] EMAIL_RECIPIENTS empty — skipping (add comma-separated addresses to GitHub Secret)');
    return;
  }

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(`[send-email] Snapshot not found at ${SNAPSHOT_PATH}. Run fetch-daily.js first.`);
    process.exit(1);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));

  // News is optional — missing or unparseable means "no Top News section",
  // not a failure. fetch-news.js writes this file alongside the daily snapshot.
  let newsData = null;
  if (fs.existsSync(NEWS_SNAPSHOT_PATH)) {
    try {
      newsData = JSON.parse(fs.readFileSync(NEWS_SNAPSHOT_PATH, 'utf8'));
      const itemCount = newsData?.items?.length || 0;
      console.log(`[send-email] News: ${itemCount} item${itemCount === 1 ? '' : 's'} loaded from news-latest.json`);
    } catch (err) {
      console.log(`[send-email] News: parse error in news-latest.json (${err.message}) — omitting Top News`);
      newsData = null;
    }
  } else {
    console.log('[send-email] News: news-latest.json not present — omitting Top News');
  }

  const { subject, html, text } = buildEmail(snapshot, newsData);

  console.log(`[send-email] Recipients: ${recipients.length}  From: ${from}`);
  console.log(`[send-email] Subject: ${subject}`);

  if (dryRun) {
    console.log('[send-email] DRY RUN — not sending. HTML size:', html.length, 'bytes');
    console.log('---- plain text preview ----');
    console.log(text);
    console.log('---- end preview ----');
    return;
  }

  // Resend API — https://resend.com/docs/api-reference/emails/send-email
  const payload = {
    from,
    to: recipients,
    subject,
    html,
    text,
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[send-email] Resend API ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
    process.exit(1);
  }

  const result = await res.json();
  console.log(`[send-email] Sent. Resend id: ${result.id}`);
}

main().catch(err => {
  console.error(`[send-email] FATAL: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
