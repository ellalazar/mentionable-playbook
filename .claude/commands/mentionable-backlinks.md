---
description: Backlink buying plan prioritized by impact/price — actionable budget
argument-hint: [budget-in-€]
---

You are a senior GEO link builder. You must build a **prioritized backlink buying plan** under a budget constraint, with an impact / price / providers mix and a rationale for each target.

## Output language

Produce everything the end user reads (the report's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Argument provided: `$ARGUMENTS` (total budget in €, e.g. "5000". Empty = no budget constraint)

## Step 1 — Identify the project

`list_projects()` → `projectId`. If several, ask.

## Step 2 — Collect the opportunities (3 angles)

Run in parallel:

1. **Buyable opportunities sorted by impact/price**:
   `list_backlink_opportunities(projectId, limit: 50, filters: { hasOffer: true }, sortBy: "best_impact_price_ratio")`

2. **Highest-impact opportunities (even without an offer)**:
   `list_backlink_opportunities(projectId, limit: 30, sortBy: "impact_score_desc")`

3. **Competitors' sources for cross-reference** (the domains that cite the competitors and could cite us too):
   `list_competitors(projectId, filters: { status: ["CONFIRMED"] }, limit: 5, sortBy: "mentions_desc")`
   Then for each: `list_competitor_sources(projectId, competitorId, limit: 20, sortBy: "mentions_desc")`

## Step 3 — Build the portfolio

Categorize each opportunity:

- **Quick wins**: high impact_score + price < €200 + offer available
- **Strategic targets**: impact_score top 10% (with or without a direct offer)
- **Volume / long tail**: medium impact_score + price < €100
- **Reject**: impact_score < minimum threshold, or price > €500 without a very high impact justification

If `$ARGUMENTS` (budget) is specified, optimize the portfolio to stay within budget while maximizing cumulative impact.

## Step 4 — Competitor cross-reference

For each retained opportunity, check whether it is cited by a confirmed competitor (step 2.3). Mark:
- **Competitor source**: cited by ≥ 1 competitor → easier outreach angle (the domain already covers the topic)
- **Neutral source**: not cited by the competitors

## Step 5 — Produce the plan

---

# GEO Backlink Buying Plan — [Project name]

> Budget: [$ARGUMENTS € or "unconstrained"] · Suggested execution period: 1 quarter

## 1. Overview

- Opportunities analyzed: N
- Retained in the plan: M
- Total cost: €X
- Estimated cumulative impact: N (sum of impact_score)
- Impact/€ ratio: X

## 2. Prioritized buying plan

| # | Domain | Impact | Price | Provider | Category | Competitor source? |
|---|---|---|---|---|---|---|

Sort by category (Quick wins → Strategic → Volume), then descending impact. Include top 15 max.

## 3. Detail per target

For each target in the top 10, give:

### [Domain]

- **Impact / Price**: N / €X
- **Provider**: [marketplace]
- **Cited by**: [list of competitors that appear on this domain, if applicable]
- **Outreach angle / brief**: [1-2 lines — suggested article topic or type of placement]
- **Priority level**: high / medium

## 4. "High impact" targets without a direct offer

High-impact_score domains that are not in a marketplace. Manual outreach approach.

| Domain | Impact | Cited by competitor | Outreach angle |
|---|---|---|---|

Top 5.

## 5. Suggested budget allocation

If the budget is constrained, propose an allocation:
- Quick wins: €X
- Strategic: €Y
- Volume: €Z

## 6. 12-week execution plan

- **Weeks 1-4**: Quick wins (marketplace purchases)
- **Weeks 3-8**: Manual outreach on strategic targets
- **Weeks 6-12**: Volume / long tail

---

## Strict rules

- **Do not invent prices**: only reference the `offers` actually present in the data
- **If a domain has no direct offer**, place it in "high impact without offer" (manual outreach) — not in the buying plan
- **Factual competitor cross-reference**: do not mark "Competitor source" without data confirming it
- **Exec tone**: factual, no superlatives
- **No results guarantee**: we talk about **estimated impact**, not guaranteed
