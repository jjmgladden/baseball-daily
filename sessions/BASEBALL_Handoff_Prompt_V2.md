# Ozark Joe's Baseball Daily Intelligence Report — Handoff V2

**Session:** 2
**Date:** 2026-04-22 (single-day session)
**Predecessor:** [BASEBALL_Handoff_Prompt_V1.md](BASEBALL_Handoff_Prompt_V1.md) (Session 1, 2026-04-19 → 2026-04-20)
**Successor Kickoff:** [BASEBALL_Kickoff_Prompt_Session3.md](BASEBALL_Kickoff_Prompt_Session3.md)

---

## Session Scope — One Paragraph

Single, narrowly-scoped feature session: **daily morning email**. Owner prompt opened the session — "every morning, after the daily ingestion, send him and me an email with the links so that he can just open the email and press the link for the latest." Four design decisions confirmed (Resend, extensible recipient list, default sender with custom-domain path documented, rich preview + link). Feature built and pushed in two commits. No UI changes, no service-worker changes, no schema changes — all work was in `ingestion/` and workflow YAML. Email requires owner activation (Resend signup + two GitHub Secrets, ~5 min) but code is ready and graceful-skips if not configured. Session closed with a dedicated Word-doc reference covering baseball + future pickleball setup, GitHub-vs-local distinction, and the "two parallel lists" sync question.

---

## Current Versions

| Artifact | Version | Change This Session |
|---|---|---|
| CLAUDE.md | **v12** | no change |
| Snapshot schema | **v5** | no change |
| SW cache (`app/sw.js`) | **v14** | no change |
| Knowledge base | **KB-0001 → KB-0025** | **+1 entry (KB-0025)** |
| Handoff prompt | **V2** | new |
| Kickoff prompt | **Session 3** | new |

---

## What Happened — Work Track (Chronological)

### Track 1 — Email feature design conversation

Owner opened with: *"my thinking is that every morning, after the daily ingestion, you would send him and me an email with the links so that he can just open the email and press the link for the latest. is that workable??"*

Context established:
- "Him" = owner's brother in Virginia, the project's target reader alongside the owner.
- Brother's workflow is email-centric; asking him to bookmark a URL or install a PWA is friction.
- Existing daily ingestion at 07:00 UTC is the perfect trigger point.

Four design questions raised. Owner's decisions:

| # | Question | Decision |
|---|---|---|
| 1 | Provider? | **Resend.com** (developer-API, 3,000 emails/month free) |
| 2 | Recipients? | **Owner + brother initially**, extensible via comma-separated GitHub Secret |
| 3 | Sender domain? | **Default** (`onboarding@resend.dev`) initially; document custom-domain path for later |
| 4 | Format? | **Rich preview + link** (both, not either/or) |

### Track 2 — Build (commit `e60891f`)

Files created:
- `ingestion/lib/email-template.js` — HTML + plain-text + subject builder from `data/snapshots/latest.json`. Inline styles only (email-client compat). Cardinals pin (red stripe), Nationals pin (Nats red stripe), On This Day block (2 events), big red CTA button to the site, stats footer, plain-text fallback.
- `ingestion/send-email.js` — Entry script. Reads snapshot, builds email, POSTs to `api.resend.com/emails`. **Graceful skip** (exit 0, one log line) if `RESEND_API_KEY` or `EMAIL_RECIPIENTS` missing — disabling the feature is a secret-delete, no YAML edits. Supports `EMAIL_DRY_RUN=1` for local testing.
- `docs/email-setup.md` — Short Markdown 5-step owner walkthrough.

Files modified:
- `.github/workflows/daily.yml` — New "Send morning email" step after snapshot commit, reading `RESEND_API_KEY`, `EMAIL_RECIPIENTS`, `EMAIL_FROM` from Secrets.

Dry-run test output against 2026-04-21 snapshot:
```
Subject: ⚾ Cardinals win 5-3 vs Miami Marlins — Tuesday, April 21, 2026
HTML size: 4266 bytes
```
Plain-text preview verified — Cardinals + Nationals lines, two On-This-Day entries, full-report link.

### Track 3 — Owner Q&A on activation details

Three owner questions post-build, each captured verbatim in the Word doc §11:

1. **"where is EMAIL_RECIPIENTS"** — Clarified: it doesn't exist yet; it's a GitHub Secret the owner creates at `https://github.com/jjmgladden/baseball-daily/settings/secrets/actions`. Write-only — can't read back on web UI.

2. **"if i am using the same email for both baseball and pickleball — which github repo does it reside in"** — Clarified: GitHub Secrets are scoped per repo, but the Resend account/API key is shared. Pattern = one Resend account, paste the same `re_...` into both repos' Secrets. Recipient lists may legitimately differ.

3. **"am i keeping 2 parallel lists — one for bb and one for pb and i have to keep them synced up if i want them the same"** — Confirmed: yes, manual sync. For 1-3 changes/year, not painful. Four escalation options documented (accept duplication, shared gist, shared config repo, GitHub Org) ranked by effort; recommendation = live with duplication unless it actively bites.

### Track 4 — Comprehensive Word-doc reference (commit `bad19a7`)

Owner requested: *"capture all the details required to setup the emails, how they work, what has to be setup for Baseball, what has to be set up for pickleball, and where it has to be setup i.e. github vs local. make it a Word doc and locate it in the Baseball Project docs folder. also add it to the baseball KB."*

Files created:
- `scripts/build-email-doc.py` — python-docx generator. Re-runnable (edit source, regenerate). Uses Cardinals-red / Navy / Gold accents matching the site palette.
- `docs/Daily-Email-Setup-Guide.docx` — 12 sections, 11 tables, ~45 KB. Covers origin prompt, four decisions, architecture flow diagram, baseball 5-step setup, pickleball mirror pattern, GitHub-vs-local table, recipient management incl. the "two parallel lists" sync question, troubleshooting, costs, files-involved table, verbatim session Q&A, activation checklist for both projects.

Files modified:
- `docs/knowledge-base.md` — Added **KB-0025** (Action / T2 / Owner+Claude dependency). "Last updated" rolled to 2026-04-22.

---

## Decisions Committed (This Session)

| Decision | Reasoning | Cross-ref |
|---|---|---|
| **Email provider: Resend** | Developer-API, 3,000/month free covers ~20× current volume, 5 lines of code. | `ingestion/send-email.js` |
| **Recipients: comma-separated GitHub Secret** | No code change to add/remove people. Secret is write-only (good security posture). | `.github/workflows/daily.yml` |
| **Default sender domain initially** | Zero cost to launch. Custom-domain (~$10/yr) documented but not required. | `docs/Daily-Email-Setup-Guide.docx` §5 |
| **Rich preview + link (not just link)** | Brother-friendly: can read the gist without opening a browser, but link is there if he wants detail. | `ingestion/lib/email-template.js` |
| **Two separate repos keep independent recipient lists** | Different audiences may care about different sports. Manual sync acceptable at low change frequency. Escalation options documented. | KB-0025 · docx §7.2 |
| **Resend account + API key shared across repos** | One account handles both projects under free tier; paste same key as a Secret in each repo. | docx §5.1 |

---

## System State at End of Session 2

- **Site live:** `https://jjmgladden.github.io/baseball-daily/`
- **Daily ingestion cron:** 07:00 UTC — still firing autonomously (verified Session 1).
- **Daily email:** **code shipped, owner activation pending** — skips silently until `RESEND_API_KEY` + `EMAIL_RECIPIENTS` Secrets are added.
- **Most recent commit:** `bad19a7` (Add Daily-Email-Setup-Guide.docx + KB-0025)
- **Working tree:** clean
- **Open Issues (GitHub):** none at session close (per state at Session 1 close; no weekly batch fired between sessions since Monday hasn't hit)
- **CLAUDE.md:** v12 (unchanged)
- **SW cache:** v14 (unchanged)
- **Snapshot schema:** v5 (unchanged)

---

## Known Issues / Tech Debt

No new issues introduced this session. Existing open items carried forward from Session 1:

| KB | Tier | Dep | Item |
|---|---|---|---|
| KB-0007 | T3 | Claude | PNG icon set for iOS PWA install |
| KB-0013 | — | Claude | On-This-Day seed coverage expansion (content, ongoing) |
| KB-0020 | T2 | Claude | Public on-demand refresh — Cloudflare Worker proxy pattern |
| KB-0021 | T2 | Claude | Auto-reload on service-worker update (~15 lines, eliminates "hard-refresh twice" friction) |
| KB-0022 | T3 | External | GitHub Actions Node 20 deprecation — address before Sept 2026 |
| KB-0024 | — | Owner | Cloudflare Worker (submission endpoint) awaiting owner deployment |
| **KB-0025** | **T2** | **Owner (activation) + Claude (code shipped)** | **Daily email — Resend signup + two GitHub Secrets pending** |

No stale files, no unarchived versions, no broken links, no failed tests.

---

## Release-Readiness Check (CHANGELOG-compatible)

Shipped user-facing changes this session:

### Added
- **Daily morning email** — Automated HTML briefing sent ~3 AM daily via Resend after ingestion completes. Cardinals/Nationals results, On This Day, link to full report. Graceful skip until owner configures `RESEND_API_KEY` + `EMAIL_RECIPIENTS` GitHub Secrets. (commit `e60891f`, KB-0025)
- **`docs/Daily-Email-Setup-Guide.docx`** — Comprehensive Word-doc reference covering origin, architecture, baseball + pickleball setup, GitHub-vs-local, recipient management, troubleshooting. (commit `bad19a7`)
- **`scripts/build-email-doc.py`** — python-docx generator for the Word doc (re-runnable).

### Changed
- **`.github/workflows/daily.yml`** — new "Send morning email" step after snapshot commit.

### Fixed
- (none this session)

### Security
- (none this session — new `RESEND_API_KEY` secret added to the ignore/check pattern implicitly via same mechanism as `YOUTUBE_API_KEY`; no additional hardening needed)

---

## Open KB Items (Dumped for Session-Start Protocol Continuity)

```
OPEN (dynamic):
  KB-0025  T2  Owner/Claude   Daily email — Resend signup + Secrets pending  ← NEW THIS SESSION
  KB-0020  T2  Claude         Public on-demand refresh — awaiting decision
  KB-0021  T2  Claude         Auto-reload on SW update — awaiting decision
  KB-0007  T3  Claude         PNG icon set for iOS — deferred
  KB-0022  T3  External       Node 20 deprecation before Sept 2026

OPEN (static awaiting owner action):
  KB-0024  —   Owner          Submission Worker deployment pending
  KB-0025  —   Owner          Email activation (Resend signup + Secrets)
```

---

## Files Changed This Session — Complete List

```
A  .github/workflows/daily.yml             (modified — added email step)
A  ingestion/lib/email-template.js         (new)
A  ingestion/send-email.js                 (new)
A  docs/email-setup.md                     (new — Markdown walkthrough)
A  docs/Daily-Email-Setup-Guide.docx       (new — comprehensive Word doc)
A  scripts/build-email-doc.py              (new — docx generator)
M  docs/knowledge-base.md                  (modified — added KB-0025, rolled date)
A  sessions/BASEBALL_Handoff_Prompt_V2.md  (new — this file)
A  sessions/BASEBALL_Kickoff_Prompt_Session3.md (new — next-session start-here)
```

Total: 7 new files, 2 modified.

Commits:
- `e60891f` Add daily morning email via Resend
- `bad19a7` Add Daily-Email-Setup-Guide.docx + KB-0025
- (Session handoff commit will follow this file + the Kickoff prompt)

---

## Owner Action Items Outstanding (Carried Into Session 3)

1. **Worker deployment** (KB-0024) — Cloudflare Worker for public submissions. Walkthrough in `worker/README.md`. ~30 min.
2. **Email activation** (KB-0025) — Resend signup + two GitHub Secrets. Walkthrough in `docs/Daily-Email-Setup-Guide.docx` §4. ~5 min.
3. **Custom domain** (optional, future) — ~$10/yr. Both of the above benefit from it but neither requires it.

---

**End of Handoff V2. Session 2 was a clean, narrow, single-feature session. Email is code-complete and code-tested; waiting on owner to flip the two Secrets to activate.**
