# Ozark Joe's Baseball Daily Intelligence Report — Handoff V4

**Session:** 4
**Date:** 2026-05-01 (single-day session)
**Predecessor:** [BASEBALL_Handoff_Prompt_V3.md](BASEBALL_Handoff_Prompt_V3.md) (Session 3, 2026-04-22 — Pickleball sibling-project bootstrap)
**Successor Kickoff:** [BASEBALL_Kickoff_Prompt_Session5.md](BASEBALL_Kickoff_Prompt_Session5.md)

---

## Session Scope — One Paragraph

Single-track session executing **Pickleball-parity multi-phase plan, Phase B1 — Activation**. Owner asked Claude to bring baseball up to pickleball's current feature level (pickleball is at Session 9 with daily email + AI Q&A + News + Learn tab + custom domain all live; baseball was at Session 3 with email code shipped but not activated, GitHub Actions on `@v4` heading toward Sept 2026 Node-20 deprecation, no push-race protection). After deep review of the Pickleball Project (`CLAUDE.md`, KB v18 with 47 entries, V9 handoff), Claude produced a 7-phase plan (B1-B7) covering email activation + email v2 upgrade + process improvements + UI polish + News tab + AI Q&A + TOC-accordion backport. Owner answered 8 scoping questions and ATP'd the 7-phase sequencing. **Phase B1 executed and verified end-to-end this session.**

Three workflow files modified to bump `actions/checkout@v4` → `@v6` and `actions/setup-node@v4` → `@v6` (closes KB-0022). Daily.yml additionally hardened with top-level `permissions` block, `concurrency` group, `timeout-minutes: 15`, and a 3-attempt push-with-rebase retry loop ported from pickleball KB-0027 (recorded as new baseball KB-0027). Email activation completed: owner pasted 3 secrets into local `.env` (gitignored), Claude pushed each via `gh secret set` over stdin (no value echoed to chat), manual `workflow_dispatch` triggered run `25228703199` which exited green in 18 seconds, Resend id `328b5393-a842-4939-ab8d-27c49bd725e9`, owner visually confirmed Gmail inbox delivery (closes KB-0025 via Path A 1-recipient activation reusing pickleball's verified `glad-fam.com` Path B domain).

KB updated v3 → v4: KB-0005 + KB-0022 + KB-0025 closed; new KB-0027 (push-race port) + new KB-0028 (pickleball-parity B1-B7 roadmap) added; Quick Index rewritten. No production code in `app/` or `ingestion/` touched. No CLAUDE.md or schema bump (planned for Phase B3 next session). One commit shipped: `1fb2520`.

---

## Current Versions

| Artifact | Version | Change This Session |
|---|---|---|
| CLAUDE.md (baseball) | **v12** | no change (B3 will roll v12 → v13) |
| Snapshot schema | **v5** | no change |
| SW cache (`app/sw.js`) | **v14** | no change (no `app/` changes) |
| Knowledge base | **KB-0001 → KB-0028** | **+2 entries (KB-0027, KB-0028); 3 closures (KB-0005, KB-0022, KB-0025); Quick Index rewritten** |
| Handoff prompt | **V4** | new |
| Kickoff prompt | **Session 5** | new |
| Email template | **v1** | unchanged (B2 will roll v1 → v2) |
| Email feature | **LIVE — Path A 1 recipient** | **activation completed this session** |

---

## What Happened — Work Track (Chronological)

### Track 1 — Session-Start Protocol

Read CLAUDE.md (v12), Handoff V3, Handoff V2, Handoff V1, knowledge-base.md (26 entries at start). Verified:
- Snapshot fresh: `data/snapshots/latest.json` `generatedAt: 2026-05-01T09:05:31.622Z` (today's 3 AM cron, ✓)
- Weekly-batch Issues: Issue #4 (2026-04-27 batch) already CLOSED. No open batch Issues.
- Submission Issues: none
- GitHub Secrets: only `YOUTUBE_API_KEY` set; `RESEND_API_KEY` + `EMAIL_RECIPIENTS` not yet → KB-0025 still Open at start
- Stale entry flagged: KB-0005 marked Open ("awaiting Phase 3B trigger") but Phase 3B fired in Session 1; closed as housekeeping this session
- Quick Index gap flagged: KB-0025 was missing from Quick Index Open list at start of session
- Session health reported: Compacted=No, Context Load=Light, Risk=nominal

### Track 2 — Pickleball Project deep review (Option D)

Owner asked: *"i would like to bring the Baseball Project up to the same level as the Pickleball Project where it makes sense. Not all the features in the Pickleball Project make sense in the Baseball Project. To that end - develop a detailed plan that: 0) Conduct a deep review of the Pickleball Project Claude.md, documentation, etc. to assess what is relevant and what is not relevant to the the Baseball project. 1) Creates a daily email for baseball with similar content as the Pickleball Project 2) identify other candidate features to add to the baseball project from the Pickleball project. Develop a detailed Plan only, there is no ATP to create anything."*

Read pickleball `CLAUDE.md` (v2), `sessions/PICKLEBALL_Handoff_Prompt_V9.md` (Session 9 close 2026-04-28, KB v18 with 47 entries, app v13), `ingestion/send-email.js`, `ingestion/lib/email-template.js` (368 lines pickleball email vs 233 lines baseball email), `docs/knowledge-base.md` partial read covering KB-0001 through KB-0042 + KB-0047. Compared to baseball state.

### Track 3 — Plan presented

Detailed plan covered:
- §0 Pickleball state vs baseball state (16-row comparison table)
- §1 Email upgrade detailed breakdown (10 sections proposed; 5 NEW vs current v1)
- §2 Other candidate features ranked ★★★★★ to ★★ (15 candidates: AI Q&A, News tab, Path B activation, Actions @v6 bump, push-race retry, APP_VERSION pill, iOS PNG icons, credentials.md, concepts-primer cross-link, error-messages module, check-esm script, date-utils audit, confidence-badge, Worker deployment, splash tuning)
- §3 Recommended sequencing — 6 phases (B1-B6)
- §4 8 open questions for owner before ATP
- §5 NOT-applicable list with rationale (DUPR/PPA, MLP duality, headless browser, WP REST, Glossary/Etiquette/DUPR explainer/Tournament Prep/Equipment/Courts, Ollama tunnel)

Owner answered 8 questions: Path B sender · same 3 recipients (later revised to 1 for smoke test) · all NL + all AL standings · Cards/Nats + 3-5 marquee games schedule · 7 news sources · AI Q&A as a phase (not deferred) · CLAUDE.md v12 → v13 OK · further explanation requested for TOC+accordion backport.

### Track 4 — TOC+accordion explained, B7 added

Provided detailed explanation of pickleball KB-0040 Phase L1 (Travel-RV-derived TOC + accordion pattern), candidate baseball tabs (Cardinals tab + History tab), and recommendation to do it after News tab (B5) so the pattern earns its keep across 3 tabs. Owner concurred. Plan rolled to 7 phases (B1-B7). Final sequencing locked.

### Track 5 — ATP B1, Claude-side work

Owner ATP'd Phase B1. Claude:
- Edited `.github/workflows/daily.yml` — full rewrite via Write tool: added top-level `permissions` block, `concurrency` group, `timeout-minutes: 15`, replaced single push with 3-attempt retry-with-rebase loop, bumped `@v4` → `@v6`
- Edited `.github/workflows/weekly-index.yml` — bumped `@v4` → `@v6` (both checkout and setup-node)
- Edited `.github/workflows/weekly-batch.yml` — bumped `@v4` → `@v6` (checkout only; this workflow has no setup-node)
- Verified syntax: 78 + 43 + 103 lines, no tab characters, no parse warnings
- Verified `.env` is gitignored before considering commit
- Stat: 32 insertions, 11 deletions across 3 files

### Track 6 — Owner activation walkthrough discussion

Originally walkthrough proposed 3 separate paste actions in browser GitHub Settings. Owner asked *"are you not able to pick those up from the Pickleball Project?"* Claude diagnosed: GitHub Secrets are write-only via API (no `gh secret get`), pickleball's local `.env` only contains `ANTHROPIC_API_KEY` + `YOUTUBE_API_KEY` (the Resend trio lives only in pickleball's GitHub Secrets, not on disk). Offered 3 options: α browser, β single local file, γ terminal one-by-one. Owner chose β.

### Track 7 — Owner pasted 3 secrets into Baseball Project/.env

Owner: *"i have updated 'Baseball Project/.env' with requested information. see if it works."*

Claude verified key names present (without echoing values), then ran:
```bash
for KEY in RESEND_API_KEY EMAIL_FROM EMAIL_RECIPIENTS; do
  grep "^${KEY}=" .env | sed "s/^${KEY}=//" | tr -d '\r\n' | gh secret set "$KEY" --repo jjmgladden/baseball-daily
done
```

`gh secret list` confirmed 4 secrets now present: `EMAIL_FROM`, `EMAIL_RECIPIENTS`, `RESEND_API_KEY`, `YOUTUBE_API_KEY` (timestamps 2026-05-01T19:05:39-41Z for the 3 new ones).

### Track 8 — Local dry-run

Ran `EMAIL_DRY_RUN=1 node ingestion/send-email.js` to verify template builds:
- Subject: `⚾ Cardinals win 10-5 vs Pittsburgh Pirates — Thursday, April 30, 2026` (action lead working as designed)
- HTML size: 4282 bytes
- Plain-text fallback rendered cleanly: Cards Won 10-5 @ Pirates · Nats Won 5-4 @ Mets · 2 On-This-Day entries · CTA link

**Flag raised:** `[send-email] Recipients: 1` — owner had only put 1 address in `.env`, not 3. Counted commas via awk without echoing addresses (1 comma-field, first char "j"). Pickleball KB-0033 Path A 403 risk does NOT apply because baseball uses Path B from day one (`baseball@glad-fam.com`). Multi-recipient unblocked from start. Offered owner two paths: A) activate now with 1 (smoke test, expand later) or B) update .env to 3 first.

### Track 9 — Owner ATP'd Path A (1-recipient smoke test)

Triggered `gh workflow run daily.yml` → run `25228703199` queued, polled to completion (~18s end-to-end). Extracted send-email log:
- `[send-email] Recipients: 1  From: ***`
- `[send-email] Subject: ⚾ Cardinals win 10-5 vs Pittsburgh Pirates — Thursday, April 30, 2026`
- `[send-email] Sent. Resend id: 328b5393-a842-4939-ab8d-27c49bd725e9`

Workflow exited 0.

### Track 10 — Commit + push

Pre-commit prep: `git pull --rebase` brought local up to `6ce103c Daily snapshot 2026-05-01` (the workflow run had pushed today's snapshot). Committed 3 workflow files as `1fb2520` with message `ci: Phase B1 workflow hardening — Actions @v6 bumps + push-race retry-with-rebase`. Pushed clean to `origin/main`.

### Track 11 — Owner confirmed inbox delivery

Owner: *"Email received cleanly"* — KB-0025 closure verified end-to-end.

### Track 12 — Session-end protocol (this section)

Updated `docs/knowledge-base.md`:
- Last-updated bumped to 2026-05-01
- KB-0005 closed (housekeeping — Phase 3B trigger fired Session 1)
- KB-0022 closed (Actions @v6 deployed)
- KB-0025 closed (Path A activation complete; Resend id recorded)
- KB-0027 added (push-race retry port)
- KB-0028 added (pickleball-parity 7-phase plan, B1 ✓ B2-B7 Open)
- Quick Index rewritten (closed list now 22 entries; open list now 6 items)

Wrote Handoff V4 + Kickoff Session 5.

---

## Decisions Committed (This Session)

| Decision | Reasoning | Cross-ref |
|---|---|---|
| **7-phase pickleball-parity plan locked (B1-B7)** | Owner ATP'd sequencing after detailed plan presentation; B1 done this session, B2-B7 per-phase ATP at owner's pace | KB-0028 |
| **Email Path A — 1 recipient (owner only) for initial smoke test** | Lower-risk staged rollout matching pickleball KB-0033 lesson; expand to 3 recipients in B2 or sooner; Path B (custom domain) means no free-tier 403 blocker | KB-0025 |
| **Reuse pickleball's `glad-fam.com` Path B domain for baseball email sender** (`baseball@glad-fam.com`) | Domain already paid for + DNS-configured + Resend-verified during pickleball Session 6 (KB-0034); zero incremental DNS work; `baseball@`/`daily@`/any-other-prefix all work without re-verification | KB-0025 |
| **Reuse pickleball's `RESEND_API_KEY` value via cross-project share** | Resend free-tier 3,000/mo ceiling shared across both projects; current usage well below limit; one key paste into baseball's GitHub Secret per minimum-friction posture | KB-0025 |
| **Use `gh secret set` over stdin with grep+cut piping for cross-project secret transfer** | Avoids loading secret values into chat transcript (lesson from pickleball KB-0044 Anthropic-key exposure); GitHub Secrets API is write-only so this is the cleanest cross-project transfer pattern given the platform constraint | KB-0025 |
| **Bump GitHub Actions to @v6 (jumping past v5)** | Mirrors pickleball KB-0023 closure pattern — both `checkout` and `setup-node` were already at v6 by 2026-05-01 | KB-0022 |
| **Port pickleball KB-0027 push-race retry-with-rebase to baseball proactively** | Defensive — same race condition exists in baseball architecture (cron + manual workflow_dispatch can overlap on snapshot push); 30-min copy-paste fix; pickleball's was reactive after a real incident, baseball's is preemptive | KB-0027 |
| **Add concurrency group to daily.yml** | Belt-and-suspenders with retry-with-rebase: queues overlapping runs at workflow level instead of letting them race at push time | KB-0027 |
| **Close KB-0005 as housekeeping** | Status was stale — Phase 3B trigger fired in Session 1, repo public + Pages live + crons firing for weeks; was an oversight at the original closure session | KB-0005 |
| **B7 (TOC+accordion backport) sequenced after B5 (News tab)** | Pattern earns its keep across 3 tabs (News + Cardinals + History) instead of 1; News tab will hit the same long-single-scroll problem if built first without the pattern | KB-0028 |
| **NOT applicable from pickleball locked** | DUPR/PPA, MLP duality, headless browser, WP REST, pickleball-specific Learn content, Ollama tunnel — captured in KB-0028 with rationale so future sessions don't re-litigate | KB-0028 |

---

## System State at End of Session 4

### Baseball repo

- **Site live:** `https://jjmgladden.github.io/baseball-daily/` (autonomous; daily cron firing fine)
- **Daily email:** **LIVE** — Path A 1 recipient (owner) sender `baseball@glad-fam.com`. First send via run `25228703199` 2026-05-01T19:07:23Z. Daily 07:00 UTC cron will now send each morning.
- **Most recent commit:** `1fb2520` (Session 4 — Phase B1 workflow hardening)
- **Most recent snapshot commit:** `6ce103c` (auto-pushed by workflow run `25228703199`)
- **Working tree at session end:** modified — `docs/knowledge-base.md` updated, Handoff V4 written, Kickoff Session 5 written. About to be committed as Session 4 close.
- **Open Issues (GitHub):** none at session close
- **CLAUDE.md:** v12 (unchanged; B3 will roll v12 → v13)
- **SW cache:** v14 (unchanged)
- **Snapshot schema:** v5 (unchanged)
- **GitHub Secrets:** 4 active — `YOUTUBE_API_KEY` (since 2026-04-20), `RESEND_API_KEY` + `EMAIL_FROM` + `EMAIL_RECIPIENTS` (since 2026-05-01)
- **GitHub Actions versions:** all bumped to `@v6/@v6` (was `@v4/@v4`)
- **Push-race protection:** active in `daily.yml` (3-attempt retry-with-rebase loop)
- **Email feature:** **LIVE** (was code-shipped-not-activated at start of session)

### Pickleball Project (sibling, unchanged this session)

- **Status:** Pickleball Session 9 closed 2026-04-28; Session 10 awaiting owner. Live at v13 with Phase 4 AI Q&A, daily email to 3 recipients, Learn tab L1 done. Baseball did not touch the pickleball repo this session.

---

## Known Issues / Tech Debt

No new issues introduced this session. Carried-forward items:

| KB | Tier | Dep | Item | Status |
|---|---|---|---|---|
| KB-0007 | T3 | Claude | PNG icon set for iOS PWA install | Open (will close in Phase B4) |
| KB-0013 | — | Claude | On-This-Day seed coverage expansion | Open (content-only) |
| KB-0020 | T2 | Claude | Public on-demand refresh — Cloudflare Worker proxy | Open (overlaps B6 Worker setup) |
| KB-0021 | T2 | Claude | Auto-reload on service-worker update | Open (could fold into B4) |
| KB-0024 | — | Owner | Submission Worker awaiting deployment | Open (will revive in Phase B6 for AI proxy) |
| KB-0028 | T2 | Owner+Claude | Pickleball-parity plan B2-B7 | Open (active roadmap; per-phase ATP) |

No stale files, no unarchived versions, no broken links.

---

## Release-Readiness Check (CHANGELOG-compatible)

### Added
- **Daily morning email — LIVE.** Activated via Path A (1 recipient = owner) with custom domain `baseball@glad-fam.com` reused from pickleball's verified Resend setup. First send 2026-05-01T19:07:23Z, Resend id `328b5393-a842-4939-ab8d-27c49bd725e9`. Daily 07:00 UTC cron now sends each morning.
- **Push-race retry-with-rebase loop** in `daily.yml` snapshot push step (3-attempt loop with `git pull --rebase -X theirs origin main` between retries). Mirrors pickleball KB-0027 fix. Defensive — protects against rare cron+manual-dispatch overlap race.
- **Workflow concurrency group** + **timeout-minutes: 15** + **top-level permissions block** on `daily.yml`.
- **KB-0027** — Push-race retry-with-rebase port from pickleball.
- **KB-0028** — Pickleball-parity multi-phase plan (B1 done; B2-B7 roadmap).

### Changed
- `.github/workflows/daily.yml` — `actions/checkout@v4` → `@v6`, `actions/setup-node@v4` → `@v6`
- `.github/workflows/weekly-index.yml` — `actions/checkout@v4` → `@v6`, `actions/setup-node@v4` → `@v6`
- `.github/workflows/weekly-batch.yml` — `actions/checkout@v4` → `@v6`
- `docs/knowledge-base.md` — KB-0005, KB-0022, KB-0025 flipped to Closed; KB-0027 + KB-0028 added; Quick Index rewritten; Last-updated bumped to 2026-05-01.

### Fixed
- KB-0022 (Node 20 deprecation) — Actions runtime now Node-24-ready well ahead of Sept 2026 deadline.
- KB-0005 (privacy posture stale-Open) — closed as housekeeping; was an oversight at the original Phase 3B closure session.
- KB-0025 quick-index gap — quick-index now in sync with closures + new entries.

### Security
- (none this session — secret transfer used `gh secret set` over stdin to avoid value exposure in chat; .env confirmed gitignored before commit)

---

## Open KB Items (Dumped for Session-Start Protocol Continuity)

```
OPEN (dynamic):
  KB-0028  T2  Owner+Claude   Pickleball-parity plan B2-B7 — active roadmap
  KB-0020  T2  Claude         Public on-demand refresh — Cloudflare Worker proxy
  KB-0021  T2  Claude         Auto-reload on SW update
  KB-0007  T3  Claude         PNG icon set for iOS — will close in Phase B4
  KB-0013  —   Claude         On-This-Day seed expansion (content-only)

OPEN (static awaiting owner action):
  KB-0024  —   Owner          Submission Worker — will revive in Phase B6 for AI proxy use case
```

---

## Files Changed This Session — Complete List

### Committed in `1fb2520`
```
M  .github/workflows/daily.yml          (32 insertions, 11 deletions — bumps + retry-with-rebase + concurrency + timeout + permissions)
M  .github/workflows/weekly-batch.yml   (1 line — checkout @v4 → @v6)
M  .github/workflows/weekly-index.yml   (2 lines — checkout + setup-node @v4 → @v6)
```

### Committed in this session-close commit
```
M  docs/knowledge-base.md                              (KB-0005 + KB-0022 + KB-0025 closed; KB-0027 + KB-0028 added; Quick Index rewritten; Last-updated bumped)
A  sessions/BASEBALL_Handoff_Prompt_V4.md              (new — this file)
A  sessions/BASEBALL_Kickoff_Prompt_Session5.md        (new — next-session start-here)
```

### Workflow runs this session
- `25228703199` — manual workflow_dispatch on `daily.yml`, success in 18s, sent first activation email (this is the verification run for KB-0025 closure)
- `25209032187` (this morning's scheduled cron — pre-activation; succeeded but with no email Secrets set, so email step skipped silently)

### Snapshot commits this session (auto-pushed by workflow runs)
- `6ce103c Daily snapshot 2026-05-01` (pushed by run 25228703199)

---

## Owner Action Items Outstanding (Carried Into Session 5)

1. **Choose next phase** — B2 (email v2 upgrade, ~3-4 hr) is the natural next step; B3-B7 also available per KB-0028.
2. **Decide on EMAIL_RECIPIENTS expansion** — currently 1 (owner only). Pickleball-parity plan assumes expansion to 3 (owner + brother + brother's wife matching pickleball list). Could happen any time — single line edit in `.env` + re-push secret. Recommended timing: end of B2 (after v2 email format reviewed and approved).
3. **CLAUDE.md v12 → v13** — already ATP'd in plan; will execute as part of Phase B3.
4. **Worker / AI Q&A account setup** — Phase B6 will need: Cloudflare account (already exists from pickleball), Anthropic billing payment-method confirmation (already set up from pickleball — same account, separate baseball Worker uses same key), new fine-grained GitHub PAT for the new baseball Worker (~5 min owner-action).
5. **Approval to commit Session 4 close** — KB update + Handoff V4 + Kickoff Session 5 (this commit, separate from Phase B1 workflow commit).

---

**End of Handoff V4. Phase B1 complete and verified end-to-end. Daily morning email is now live. Six phases (B2-B7) remain on the pickleball-parity roadmap. Baseball stays clean and operational.**
