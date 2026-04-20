# Content Curation Workflow

**Version:** 1 | **Date:** 2026-04-20

How new legends, moments, and stories get added to the site. Two inputs feed the pipeline: the weekly batch proposer (owner-driven) and the public suggestion form (visitor-driven).

---

## The flow at a glance

```
                    ┌────────────────────────────────────────┐
                    │                                        │
  Weekly batch      │   data/master/curation-backlog.json    │
  workflow (Mon) ──▶│   (150+ pending entries, hand-seeded)  │
                    │                                        │
                    └────────┬───────────────────────────────┘
                             │ picks next 10 pending
                             ▼
                    ┌──────────────────────────────────────┐
                    │  GitHub Issue:                       │
                    │  "Weekly curation batch YYYY-MM-DD"  │
                    └────────┬─────────────────────────────┘
                             │ owner approves/edits in chat
                             ▼
                    ┌───────────────────────────┐
                    │  Claude moves entries to: │
                    │  cardinals-links.json     │
                    │  historical-videos.json   │
                    │  stories.json             │
                    └───────────────────────────┘

  Public form      ┌─────────────────────────────────┐
  (any visitor)  ──▶  Cloudflare Worker              │
                    │  (baseball-daily-submit)        │
                    └────────┬───────────────────────┘
                             │ POST → GitHub API
                             ▼
                    ┌──────────────────────────────────┐
                    │  GitHub Issue:                   │
                    │  "Submission: player — {name}"   │
                    │  labeled submission              │
                    └────────┬─────────────────────────┘
                             │ owner reviews in chat
                             ▼
                   Added to curation-backlog OR a main
                   data file directly, OR closed as rejected.
```

---

## Weekly batch (owner-driven)

### What fires

`.github/workflows/weekly-batch.yml` — Monday 08:00 UTC (4:00 AM EDT / 3:00 AM EST).

### What it does

1. Reads `data/master/curation-backlog.json`
2. Filters entries where `status === "pending"`
3. Sorts by priority (1 highest, then 2, then 3) with tie-breaker on `id` alphabetical
4. Slices the first 10
5. Creates a GitHub Issue listing them with their summaries

### How you respond

Open the Issue (email notification arrives automatically):

**Approve everything:**
```
approve all
```

**Line-by-line:**
```
1 approve
2 reject — already covered by stories.json entry
3 edit: Dizzy Dean, lead with "1934 NL MVP and last NL 30-game winner" instead
4 approve
...
```

**Skip this week:**
```
hold all — revisit next week
```

Close the Issue when you're done deciding (or I'll close it after applying your decisions).

### What Claude does next session

- Reads your response on the Issue
- For each approved entry:
  - Fills in the full entry in the appropriate main file (cardinals-links.json, historical-videos.json, or stories.json) with source links and any curated YouTube content
  - Changes `status: "pending"` → `status: "active"` in the backlog
- For each rejected entry: `status: "pending"` → `status: "rejected"` with a one-line reason in a new `rejectedReason` field
- For each edited entry: applies edits, then treats as approved
- Commits and pushes in a single "Apply weekly batch YYYY-MM-DD" commit

### Backlog depth

Seed is 150 entries. At 10/week, that's ~15 weeks of proposals. When the backlog gets thin (say, under 20 pending), Claude asks if you want to expand it in chat. You can add ideas at any time — just edit the JSON directly or tell Claude "add X, Y, Z to the backlog."

### Manual trigger

Don't want to wait for Monday? Trigger the workflow on demand:
```
https://github.com/jjmgladden/baseball-daily/actions/workflows/weekly-batch.yml
```
→ Run workflow → optionally adjust batch size.

---

## Public submissions (visitor-driven)

### What's live

A **"Suggest a player or moment"** link in the site footer. Clicking opens a modal with a form:
- Type (player / moment / other)
- Name or title
- Why they're notable
- Source link (optional)
- Submitter name and email (both optional)

### What happens when someone submits

1. Browser POSTs to the Cloudflare Worker (`baseball-daily-submit`)
2. Worker validates, rate-limits (3/IP/10min), strips a honeypot
3. Worker creates a GitHub Issue titled `Submission: {type} — {name}`, labeled `submission` and `submission:{type}`
4. You receive a GitHub notification

### Triage workflow

Open the submission Issue. Three decisions:

**Add it directly** to a main file:
- "Claude, apply this one to historical-videos.json"
- Claude opens the file, adds the entry with curated links, closes the Issue

**Add it to the backlog** for a future weekly batch:
- "Claude, add this to the backlog at priority 2"
- Claude appends to curation-backlog.json, closes the submission Issue referencing the backlog entry

**Reject** with a note:
- "Claude, close this — duplicate of existing entry"
- Claude closes with a polite comment

### Rate-limiting posture

Worker allows 3 submissions per IP per 10 minutes. Honeypot field silently absorbs bot submissions. If spam becomes a problem, we can bolt on Cloudflare Turnstile later (free, one extra setup step).

### Who can submit

Anyone who visits the public site. They do NOT need a GitHub account. They get a confirmation message and a link to their Issue (if they want to track it).

---

## Main file conventions

When an entry graduates from the backlog or a submission Issue into a main file:

- **cardinals-links.json** — Cardinals legends, retired numbers, historic seasons
- **historical-videos.json** — iconic moments (Aaron 715, Mays Catch, etc.) with video links
- **stories.json** — in-depth written stories (military service, faith, charity, etc.) with `body` prose
- **on-this-day-seed.json** — date-specific events (MM-DD indexed)
- **franchises.json** — structural franchise data (not typically updated via this workflow)

Claude picks the right destination based on type and content. No strict rules — editorial judgment.

---

## Questions

- **Can I edit entries after they're added?** Yes, just tell Claude "update the Bottomley entry to mention X."
- **What if I disagree with Claude's summary?** Edit in chat; Claude rewrites.
- **Can I bulk-reject?** Yes — "reject 3, 5, 7."
- **What if nobody submits anything?** The weekly batch still runs — the public form is supplementary, not required.
- **Can my brother submit?** Yes — he just uses the form. No account needed. His submissions show up as Issues alongside strangers'.
