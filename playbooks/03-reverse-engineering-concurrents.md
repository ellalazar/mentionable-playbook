# Playbook 03 — Reverse engineering a competitor

> "Why does this competitor rank better than me in the LLMs?"
> This command breaks down its GEO acquisition channels and gives you a list of priority outreach targets.

## Goal

For a confirmed competitor, understand **which channels drive its visibility** (industry media, comparison sites, Reddit, directories, on-site docs, etc.) and pull out 3 actionable outreach targets for this week.

## Who it's for

- **SEO consultant / agency** who has to justify a GEO strategy to a client
- **In-house SEO** who wants to close the gap on a leader
- **Link builder** looking for relevant outreach targets
- **PMM / growth** who wants to understand a competitor's GEO strategy

## Prerequisites

- Mentionable MCP installed
- At least 1 competitor with `CONFIRMED` status in the project
- Ideally: 7+ days of tracking (otherwise mentions are too volatile)

## MCP tools used

- `list_projects` — project selection
- `list_competitors` — competitor resolution
- `list_competitor_sources` — domains that cite this competitor
- `list_llm_sources` — comparison with our ecosystem

## On Claude Code

```
/mentionable-reverse CompetitorA
```

Without an argument, the agent will offer you the top 10 by Share of Voice:

```
/mentionable-reverse
```

## On Cursor / Claude Desktop / another MCP client

Copy-paste this prompt:

```text
You are a senior GEO consultant. Reverse engineer the competitor <NAME> in Mentionable.

1. list_projects() → projectId (ask if there are several)
2. list_competitors(projectId, filters.nameContains: "<NAME>", filters.status: ["CONFIRMED", "SUGGESTED"]) → competitorId
3. list_competitor_sources(projectId, competitorId, limit: 50, sortBy: "mentions_desc")
4. list_llm_sources(projectId, limit: 100, sortBy: "appearances_desc") to compare

Return a markdown report:
- Overview (mentions, LLMs, perceived strength)
- Top 10 domains that cite it (table with Type and Position vs us: "Exclusive advantage" or "Shared ground")
- Specific top URLs (extracted from topUrls)
- Acquisition pattern (3-5 factual bullets)
- 3 priority outreach targets (with an approach angle)

Rules: data only, no judgment on the competitor's quality, exec tone.
```

## Sample deliverable

```markdown
# Reverse engineering — CompetitorA

**Total mentions**: 187 · **LLMs where it appears**: ChatGPT, Perplexity, Gemini, Claude, AIO · **Status**: CONFIRMED

## 1. Overview

- Domains that cite it (top 50): 38
- Dominant type: comparison sites (42% of mentions) + Reddit (24%)
- Perceived strength: leader

## 2. Top 10 domains that cite it

| Domain | Mentions | LLMs | Type | Position vs us |
|---|---|---|---|---|
| g2.com | 31 | 5/5 | comparison site | Shared ground |
| reddit.com | 27 | 4/5 | Reddit | Shared ground |
| capterra.com | 19 | 4/5 | comparison site | Shared ground |
| competitora.com | 14 | 5/5 | competitor docs | Exclusive advantage |
| trustpilot.com | 11 | 3/5 | reviews | Exclusive advantage |
| [industry-media].com | 9 | 3/5 | industry media | Exclusive advantage |
| getapp.com | 8 | 2/5 | comparison site | Shared ground |
| producthunt.com | 7 | 2/5 | directory | Shared ground |
| alternativeto.net | 6 | 2/5 | directory | Exclusive advantage |
| [vertical-forum].com | 5 | 2/5 | forum | Exclusive advantage |

## 3. Specific top URLs

- **g2.com**
  - `https://g2.com/products/competitora/reviews` — "CompetitorA is cited as a leader for SMBs"
  - `https://g2.com/categories/[category]` — "CompetitorA in position #2 of the ranking"
- **reddit.com**
  - `https://reddit.com/r/[subreddit]/comments/abc/best-tool-for...` — "thread with 230 comments, CompetitorA mentioned 14 times"
- **competitora.com**
  - `https://competitora.com/blog/comparison-page` — "comparison page ranking for 'CompetitorA vs X' queries"

## 4. Acquisition pattern

- **Leans heavily on comparison sites**: G2, Capterra and GetApp = 58 combined mentions (31% of total)
- **Strong organic Reddit presence** on r/[subreddit] and r/[other] (27 mentions, 4/5 LLMs)
- **Aggressive on-site SEO**: its own domain generates 14 mentions via "CompetitorA vs X" comparison pages
- **Targeted editorial presence**: 1 article from [industry-media] that shows up in 3 LLMs
- **Alternative directories** (alternativeto, producthunt): 13 combined mentions

## 5. 3 priority outreach targets

1. **trustpilot.com** — 11 competitor mentions, 0 for us
   — Angle: build an active Trustpilot page, respond to negative reviews, reach the critical mass of reviews

2. **[industry-media].com** — 9 competitor mentions, 0 for us
   — Angle: pitch a comparison article or an op-ed; this outlet has strong authority and is read by 3/5 LLMs

3. **alternativeto.net** — 6 competitor mentions, 0 for us
   — Angle: create/claim our listing, list CompetitorA as an alternative to benefit from its GEO traffic
```

## Variants

- **Multi-competitor reverse**: "Compare CompetitorA and CompetitorB on their sources" → useful to spot domains that cite both but not us
- **Reverse by LLM**: "Focus only on Perplexity" → if we're losing particularly on one engine
- **Condensed reverse**: "Just give me the top 5 sources and 3 actions" → for a quick client demo

## Going further

- [Backlink purchase plan](07-backlinks-prioritisation.md) — convert "Exclusive advantage" into prioritized buys
- [Reddit outreach](07-reddit-outreach-workflow.md) — if Reddit stands out in the pattern
- [Content gap via fan-outs](04-fan-outs-pour-briefs-articles.md) — understand the queries the competitor captures
