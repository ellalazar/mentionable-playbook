# Playbook 07 — Prioritized backlink purchase plan

> You have a budget and a list of opportunities. This command produces the **optimal purchase plan**: quick wins, strategic targets, long tail — with an impact/price mix and a pitch per target.

## Goal

Turn the raw `list_backlink_opportunities` list from Mentionable into an **executable one-quarter purchase plan**, with an allocated budget and an outreach angle per target.

## Who it's for

- **Freelance or agency link builder**
- **In-house SEO** defending a backlink budget
- **SEO agency** industrializing purchases across N clients

## Prerequisites

- Mentionable MCP installed
- Mentionable has computed opportunities (`list_backlink_opportunities` not empty)
- At least 1-2 `CONFIRMED` competitors (for cross-referencing)

## MCP tools used

- `list_projects`
- `list_backlink_opportunities` — the raw material (with marketplace offers)
- `list_competitors` + `list_competitor_sources` — cross-reference to identify domains that already cite the competitors

## In Claude Code

```
/mentionable-backlinks
/mentionable-backlinks 5000
/mentionable-backlinks 12000
```

(the number = total budget in €)

## In Cursor / Claude Desktop / another client

```text
You are a senior GEO link builder. Build a backlink purchase plan for the budget: <BUDGET € or "unconstrained">.

1. list_projects() → projectId
2. In parallel:
   - list_backlink_opportunities(projectId, filters.hasOffer: true, limit: 50, sortBy: "best_impact_price_ratio")
   - list_backlink_opportunities(projectId, limit: 30, sortBy: "impact_score_desc")
   - list_competitors(projectId, filters.status: ["CONFIRMED"], limit: 5, sortBy: "mentions_desc")
   - For the top 5 competitors: list_competitor_sources(projectId, competitorId, limit: 20)

3. Categorize: Quick wins / Strategic / Volume / Reject
4. Cross-reference with competitor sources
5. If there is a budget: optimize to stay under it

Produce a markdown plan:
- Overview (number of opportunities, selected, cost, cumulative impact)
- Prioritized purchase plan (top 15 table)
- Detail per target (top 10) with outreach angle
- High-impact targets with no offer (manual outreach, top 5)
- Budget breakdown
- 12-week execution plan

Rules: don't invent prices, only reference real offers.
```

## Sample deliverable

```markdown
# GEO backlink purchase plan — Acme SaaS

> Budget: 5000 € · Period: 1 quarter

## 1. Overview

- Opportunities analyzed: 47
- Selected in the plan: 14
- Total cost: 4,720 €
- Estimated cumulative impact: 312
- Impact/€ ratio: 0.066

## 2. Prioritized purchase plan

| # | Domain | Impact | Price | Provider | Category | Competitor source? |
|---|---|---|---|---|---|---|
| 1 | [media-sectoriel].com | 47 | 380 € | LinkBuilder.io | Strategic | Yes (CompetitorA, B) |
| 2 | [comparateur].com | 38 | 290 € | Marketplace1 | Quick win | Yes (CompetitorA) |
| 3 | [blog-vertical].fr | 34 | 220 € | Marketplace2 | Quick win | No |
| 4 | [annuaire-pro].com | 29 | 180 € | Marketplace1 | Quick win | Yes (CompetitorB) |
| ... | | | | | | |

## 3. Detail of the top 10 targets

### [media-sectoriel].com

- **Impact / Price**: 47 / 380 €
- **Provider**: LinkBuilder.io
- **Cited by**: CompetitorA (8 mentions), CompetitorB (3 mentions)
- **Outreach angle / brief**: comparison article "Top 7 [category] for [target persona]" positioning us as a credible alternative to both competitors
- **Priority**: high

### [comparateur].com

- **Impact / Price**: 38 / 290 €
- **Provider**: Marketplace1
- **Cited by**: CompetitorA (5 mentions)
- **Outreach angle**: complete product profile + 5 authentic reviews to reach critical mass
- **Priority**: high

### [blog-vertical].fr

- **Impact / Price**: 34 / 220 €
- **Provider**: Marketplace2
- **Cited by**: – (neutral source)
- **Outreach angle**: educational guide "How to choose a [category]" as editorial sponsorship
- **Priority**: medium (neutral source, but good impact/price ratio)

[7 more entries in the same format]

## 4. "High impact" targets with no direct offer

| Domain | Impact | Cited by | Outreach angle |
|---|---|---|---|
| [média-tier1].com | 89 | CompetitorA, B, C | Op-ed pitch or case study + original data |
| [association-pro].fr | 64 | CompetitorB | Membership + editorial contribution |
| [podcast-vertical] | 51 | CompetitorA | Founder interview pitch |
| [conférence-tech].com | 47 | CompetitorB, C | Speaker submission + tier 3 sponsorship |
| [newsletter-curatée] | 39 | CompetitorA | Featured tool / targeted sponsorship |

## 5. Suggested budget breakdown

- Quick wins: 1,870 € (4 purchases < 350 €/ea)
- Strategic: 2,230 € (5 purchases 200-500 €/ea)
- Volume / long tail: 620 € (5 purchases < 150 €/ea)

**Total: 4,720 € (280 € under budget)**

## 6. 12-week execution plan

- **Weeks 1-4**: execute the 4 quick wins (Marketplace1 + 2)
- **Weeks 3-8**: start manual outreach on the 5 "high impact, no offer" targets
- **Weeks 6-12**: execute the strategic purchases + remaining volume
```

## Variants

- **No budget**: `/mentionable-backlinks` → exhaustive prioritized list, no budget cut
- **Small budget (<2000 €)**: focus on quick wins only, skip the strategic ones
- **LLM-specific**: "keep only the domains that appear in Gemini sources" if you want to boost a specific LLM
- **Provider-specific**: "only suggest opportunities via [marketplace X]" if you already have an account there

## Going further

- [Reverse engineering to identify the sources a competitor exploits](03-reverse-engineering-concurrents.md)
- [Weekly report that tracks how sources evolve after a purchase](08-reporting-hebdo-geo.md)

## Words of caution

- The impact_score is a Mentionable **estimate**, not a guarantee
- Marketplace purchases vary in quality — prefer domains with competitor sources (validated ground)
- Diversify providers and content types (article, profile, listing) to limit the risk of a penalty
