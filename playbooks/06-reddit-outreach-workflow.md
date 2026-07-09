# Playbook 06 — Weekly Reddit triage

> Reddit is over-represented in LLM sources (ChatGPT in particular).
> This command triages the threads cited by the LLMs, tells you which ones are worth a comment, and cleans up the rest.

## Goal

A weekly workflow for **triaging Reddit opportunities**: ranking, selective enrichment (Bright Data scraping), a recommended comment angle, and bulk-marking the rest.

## Who it's for

- **Community manager / growth** running the Reddit presence
- **In-house SEO / agency** looking for differentiating GEO levers
- **SaaS founder** doing community-led GEO

## Prerequisites

- Mentionable MCP installed
- Mentionable tracking active for 7+ days (to have detected threads)
- AI credits available (Bright Data enrichment consumes them)
- A Reddit account with some history (brand-new accounts get banned)

## MCP tools used

- `list_projects`, `list_reddit_threads`
- `enrich_reddit_thread` — Bright Data scraping (asynchronous, paid)
- `get_reddit_thread` — polling
- `bulk_update_reddit_thread_status` — bulk cleanup

## On Claude Code

```
/mentionable-reddit-triage
```

With a subreddit filter:

```
/mentionable-reddit-triage SaaS
/mentionable-reddit-triage entrepreneur
```

## On Cursor / Claude Desktop / another client

```text
You are a senior community / SEO expert. Triage the Reddit threads cited by the LLMs.

1. list_projects() → projectId
2. list_reddit_threads(projectId, filters.status: ["NEW"], limit: 50, sortBy: "score_desc")
   [if subreddit filter: filters.subredditContains: "<sub>"]
3. Pre-sort without enrichment: Top (20%) / Medium / Low
4. Ask me for confirmation before enriching (max 5 threads, it's paid)
5. For the Top: enrich_reddit_thread, then poll get_reddit_thread every 30s (max 4 min)
6. For the Low: bulk_update_reddit_thread_status(updates: [...{status: "SKIPPED"}])
7. For each enriched thread: read title/body/topComments and propose a verdict + comment angle (non-promotional)

Return a report:
- Summary (analyzed, enriched, skipped, to comment)
- Threads to comment (title, sub, GEO signal, verdict, suggested angle 3-5 sentences)
- Automatically SKIPPED threads
- Threads to watch next week

Rules: confirmation before enrichment (paid), angle never promotional, authentic tone.
```

## Sample deliverable

```markdown
# Reddit triage — Acme SaaS

> Period: NEW threads as of today · Filter: none

## Summary

- NEW threads analyzed: 27
- Threads enriched: 4
- Threads SKIPPED in bulk: 18
- Recommended to comment: 3

## Threads to comment

### "Looking for an alternative to CompetitorA — fed up with their pricing changes"

- **r/[subreddit]** · `https://reddit.com/r/.../comments/abc123/...` · upvotes: 142 · comments: 67
- **GEO signal**: cited by 3 LLMs across 4 tracked prompts
- **Verdict**: Comment now
- **Why**: OP is actively looking for an alternative, hot thread (24h), 67 comments = engaged audience
- **Suggested angle**:
  > "We made the same switch 6 months ago. CompetitorA is solid but the per-seat pricing gets painful fast once you go past 20 users. We've been on [our brand] since then and the main difference is [concrete benefit], though we did give up [small honest trade-off]. Happy to walk you through what I actually missed during the migration if that helps."
- **Action after commenting**: mark COMMENTED in the dashboard

### "What's the ROI of [category] for a 10-person team?"

- **r/SaaS** · upvotes: 89 · comments: 34
- **GEO signal**: cited by 2 LLMs across 2 tracked prompts
- **Verdict**: Comment now
- **Why**: open question, transactional intent, little competition from quality answers
- **Suggested angle**:
  > "For 10 people it usually pays off once you're spending more than 2h a week on [manual task X]. We ran the numbers here: 4h/week × 4 weeks × hourly rate = $X. Past that point, any tool in the $50-150/month range pays for itself. The real question is more about [quality point]."

### "Self-hosted [category] vs cloud — what would you choose in 2026?"

- **r/selfhosted** · upvotes: 203 · comments: 91
- **GEO signal**: cited by 4 LLMs across 3 tracked prompts
- **Verdict**: Comment now
- **Why**: huge audience (203 upvotes), evergreen thread on a strong fan-out topic
- **Suggested angle**:
  > "Self-hosted in 2026 makes sense in 3 specific cases: strict compliance, very technical teams, or very high-volume usage. Outside of those, the hidden costs (GDPR, backups, version maintenance) quickly outweigh the equivalent SaaS. I documented a calculation on this if you're interested."

## Automatically SKIPPED threads

| # | Subreddit | Score | Reason |
|---|---|---|---|
| 1 | r/[other] | 12 | thread 8 months old, no recent LLM citation |
| 2 | r/[other] | 4 | low upvotes, 1 LLM only |
| ... | | | (18 entries total) |

## Threads to watch next week

- "Best [category] for solopreneurs in 2026" (r/Entrepreneur, upvotes 56)
- "Migration from [tool] to [other]" (r/[sub], upvotes 38)
- (4 other entries)
```

## Variants

- **Triage by subreddit**: `/mentionable-reddit-triage SaaS` to target a specific sub
- **Deeper triage**: "enrich 10 threads instead of 5" — costs more in credits
- **Triage without enrichment**: "don't enrich, just rank on the raw signals" — free
- **Retro mode**: "look at the COMMENTED threads from the last 30 days and give me feedback on the GEO impact" — useful for reporting

## Going further

- [Reverse engineering a competitor that dominates on Reddit](03-reverse-engineering-concurrents.md)
- [Weekly report including Reddit actions](08-reporting-hebdo-geo.md)

## Ethical notes

- Reddit has strict rules against promotion. **Add value first**, mention your brand only if relevant, and **disclose your affiliation** if you're an employee/founder.
- An account with 0 history that shows up to pitch a product = instant ban. Build up an account with real contributions before using this playbook.
