# Playbook 08 — Weekly client report

> The report you send your client every Monday morning.
> Short, factual, with a 3-line TL;DR and 3 clear actions for the week.

## Goal

Produce a **weekly GEO report** ready to send to the client: the week's key changes, new signals, and 3 prioritized actions for the following week.

## Who it's for

- **Freelance SEO consultant** delivering a recurring client report
- **SEO agency** automating reports across N clients
- **In-house SEO** reporting to the CMO or CEO

## Prerequisites

- Mentionable MCP installed
- A project with 2+ weeks of tracking (without it, no comparison)
- Ideally: the previous week's report provided as context (for the Δ)

## MCP tools used

- `list_projects`
- `list_prompts` — current state
- `list_competitors` — Share of Voice
- `list_llm_sources` (with `dateRange` over 7 days)
- `list_fan_outs` (sortBy: recent) — detect new ones

## In Claude Code

```
/mentionable-weekly
/mentionable-weekly project-name
```

Combine with `/loop` or `/schedule` for automatic execution:

```
/schedule every Monday 9am /mentionable-weekly project-name
```

## In Cursor / Claude Desktop / another client

```text
You are a senior GEO consultant. Produce a weekly client report.

Period: last 7 days · Comparison period: previous 7 days.

1. list_projects() → projectId
2. In parallel:
   - list_prompts(projectId, limit: 100)
   - list_competitors(projectId, filters.status: ["CONFIRMED"], limit: 20, sortBy: "mentions_desc")
   - list_llm_sources(projectId, limit: 50, filters.dateRange: { from: "D-7", to: "now" })
   - list_fan_outs(projectId, limit: 50, sortBy: "recent")

3. Detect:
   - New fan-outs (firstSeen >= D-7)
   - New domains (first appearance in the window)
   - New SUGGESTED competitors
   - Share of Voice changes if comparable

Produce a markdown report:
- TL;DR (3 lines)
- Overall visibility (prompts, average rate, LLMs)
- Top 5 Share of Voice with Δ vs W-1
- New signals (fan-outs, domains, suggested competitors)
- Top 3 actions for next week

Rules: 1 page max, TL;DR at the top, don't invent Δ, exec tone.
```

## Sample deliverable

```markdown
# GEO report — Acme SaaS

> Week of April 23-30, 2026

## TL;DR

- Overall SoV stable at 20%, but **a +6 pt jump on Perplexity** (38% → 44%) following the publication of a comparison article
- Alert: CompetitorD appeared this week as SUGGESTED with 11 mentions — validate it before it climbs
- Main action next week: attack Gemini (still at 8%) via 2 long-form articles

## 1. Overall visibility

- Tracked prompts: 24 (stable)
- Average visibility rate: 28% (+2 pts vs W-1)
- LLMs: ChatGPT 18%, Perplexity 44% (+6), Gemini 8%, Claude 22%, AIO 12%

## 2. Share of Voice — top 5

| Competitor | Mentions | Δ vs W-1 | Stance |
|---|---|---|---|
| CompetitorA | 187 | -3 | stable leader |
| **Acme SaaS (us)** | **131** | **+7** | growing challenger |
| CompetitorB | 92 | -6 | declining challenger |
| CompetitorC | 67 | 0 | stable |
| CompetitorD (new) | 11 | +11 | to watch |

## 3. New signals this week

### New fan-outs detected

| Fan-out | Freq | LLMs | Covered? |
|---|---|---|---|
| [category] vs CompetitorD comparison | 8 | 2/5 | no |
| [category] for early-stage startups | 6 | 3/5 | partial |
| best [category] plugins 2026 | 5 | 2/5 | no |
| [category] integration with [third-party tool] | 4 | 2/5 | no |
| [category] AI features comparison | 4 | 3/5 | no |

### New domains in the ecosystem

| Domain | Appearances | Type |
|---|---|---|
| [nouveau-comparateur].com | 7 | cited |
| [media-startup].fr | 4 | cited |
| [forum-niche].com | 3 | consulted |

### New suggested competitors

| Competitor | Mentions | To handle |
|---|---|---|
| CompetitorD | 11 | Validate status + launch reverse engineering |

## 4. Actions taken this week

- Published "Top 7 open source [category] 2026" → +6 pts on Perplexity confirmed
- 2 Reddit comments (r/SaaS, r/[other]) → positive upvotes
- Trustpilot audit launched (results in W+1)

## 5. Top 3 actions for next week

1. **Validate CompetitorD and launch reverse engineering** — a new competitor at 11 mentions should be analyzed while it's still small — `/mentionable-reverse CompetitorD`

2. **Attack Gemini with 2 briefs** — the stall at 8% is our weak spot — `/mentionable-content-gap` filtered on Gemini, then `/mentionable-brief` on the 2 priority fan-outs

3. **Targeted backlink purchase on [media-startup].fr** — new domain in the ecosystem, entry window — `/mentionable-backlinks` on 1 target
```

## Variants

- **Monthly report**: change the period to 30 days, add trend charts (to draw manually from the data)
- **Multi-project report (agency)**: "produce a consolidated report on projects X, Y, Z" — useful for an agency account with several clients
- **Executive report (3 lines)**: "ultra-condensed version, just TL;DR + 1 action"
- **Automatic report**: `/schedule every Monday 9am /mentionable-weekly project-name` to get it before your client does

## Going further

- [Full GEO audit when the report raises a flag](01-audit-geo-initial.md)
- [Reverse engineering when a new competitor rises](03-reverse-engineering-concurrents.md)
