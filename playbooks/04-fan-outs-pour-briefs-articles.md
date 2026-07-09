# Playbook 04 — Content gap via fan-outs

> Fan-outs are the **real intent** of the LLMs: the web queries they run behind the scenes to answer.
> Working the fan-outs where the brand doesn't appear = a direct GEO editorial backlog.

## Goal

Produce an **editorial backlog of 20 topics** drawn from uncovered fan-outs, ranked by priority score (frequency × intent × coverage).

## Who it's for

- **SEO content / editorial** running production
- **In-house SEO** prioritizing a publishing calendar
- **SEO agency** who has to defend a content budget to the client
- **Writers** looking for concrete article angles

## Prerequisites

- Mentionable MCP installed
- 7+ days of tracking for meaningful fan-outs (fan-outs accumulate over time)
- Ideally: 20+ tracked prompts

## MCP tools used

- `list_projects`
- `list_fan_outs` — the raw material
- `list_prompts` — to cross-check coverage / non-coverage

## On Claude Code

```
/mentionable-content-gap
```

With a topic filter:

```
/mentionable-content-gap comparison
/mentionable-content-gap "open source"
```

## On Cursor / Claude Desktop / another client

```text
You are a GEO content strategist. Build an editorial backlog from uncovered fan-outs.

1. list_projects() → projectId
2. list_fan_outs(projectId, limit: 100, sortBy: "frequency")
   [if topic filter: add filters.search: "<topic>"]
3. list_prompts(projectId, limit: 100) to identify already-covered fan-outs

For each fan-out:
- classify the intent (informational / comparative / transactional / reviews)
- assess coverage (covered / partial / not covered)
- compute a score: frequency × intent_mult × coverage_mult
  intent_mult: comparative 1.5 · transactional 1.3 · reviews 1.2 · info 1
  coverage_mult: not covered 1.5 · partial 1 · covered 0.3

Return a markdown report:
- Top 20 topics (table: topic, intent, frequency, LLMs, status, score)
- Breakdown by intent
- Breakdown by LLM
- 5 topics to attack first with suggested format and link to /mentionable-brief

Rules: topic = fan-out as-is, no rewording, group semantic duplicates.
```

## Sample deliverable

```markdown
# GEO editorial backlog — Acme SaaS

> Drawn from 87 analyzed fan-outs · Filter applied: none

## Top 20 priority topics

| # | Topic | Intent | Freq | LLMs | Status | Score |
|---|---|---|---|---|---|---|
| 1 | open source [category] comparison 2026 | Comparative | 38 | 4/5 | not covered | 85.5 |
| 2 | best [category] for SMBs 2026 | Comparative | 47 | 4/5 | partial | 70.5 |
| 3 | alternative to CompetitorA | Comparative | 24 | 3/5 | not covered | 54.0 |
| 4 | [category] vs CompetitorB reviews | Comparative | 21 | 3/5 | not covered | 47.3 |
| 5 | free [category] 2026 | Transactional | 19 | 4/5 | not covered | 37.1 |
| 6 | [category] getting-started guide | Informational | 28 | 4/5 | not covered | 42.0 |
| 7 | [category] pricing compared | Transactional | 15 | 3/5 | not covered | 29.3 |
| ... | | | | | | |

## Breakdown by intent

| Intent | Priority topics |
|---|---|
| Comparative | 11 |
| Informational | 5 |
| Transactional | 3 |
| Reviews | 1 |

## Breakdown by LLM

| LLM | Unique fan-outs | Not covered |
|---|---|---|
| ChatGPT | 64 | 41 |
| Perplexity | 71 | 22 |
| Gemini | 38 | 31 |
| Claude | 47 | 28 |
| AIO | 19 | 17 |

## 5 topics to attack first

1. **open source [category] comparison 2026**
   — Comparative intent, 4/5 LLMs, not covered
   — Format: long-form comparison article (5-7 tools, table, methodology)
   — `/mentionable-brief "open source [category] comparison 2026"`

2. **alternative to CompetitorA**
   — Capture the leader's GEO traffic
   — Format: dedicated comparison page + landing
   — `/mentionable-brief "alternative to CompetitorA"`

3. **free [category] 2026**
   — Transactional intent, classic fan-out
   — Format: free-tier comparison page + product offer
   — `/mentionable-brief "free [category] 2026"`

4. **[category] getting-started guide**
   — Informational intent but huge volume (28)
   — Format: long educational guide, diagram, FAQ
   — `/mentionable-brief "[category] getting-started guide"`

5. **[category] vs CompetitorB reviews**
   — Direct comparison, capture validation searches
   — Format: vs page with cross-referenced user reviews
   — `/mentionable-brief "[category] vs CompetitorB reviews"`
```

## Variants

- **Filter by LLM**: "focus on Gemini fan-outs" if you want to attack a specific LLM
- **Filter by competitor**: "only keep fan-outs where CompetitorA appears" (overlaps with `/mentionable-reverse`)
- **Monthly backlog**: "produce a calendar of 12 topics for the next 3 months"
- **Backlog by persona**: if personas are configured, segment by persona

## Going further

- [Full article brief on a specific fan-out](05-brief-article.md)
- [Reverse engineering to understand who already covers it](03-reverse-engineering-concurrents.md)
- [Weekly report that tracks fan-out changes](08-reporting-hebdo-geo.md)
