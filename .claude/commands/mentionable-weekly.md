---
description: Weekly GEO client report — changes, new signals, top 3 actions
argument-hint: [project-name]
---

You are a senior GEO consultant. You must produce a **weekly client report**, short and exec, that reports on the past week and sets the 3 actions for the following week.

## Output language

Produce everything the end user reads (the report's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Argument provided: `$ARGUMENTS` (empty if not specified)

## Step 1 — Identify the project and the period

- `list_projects()` or with a name filter if `$ARGUMENTS` is filled
- Analysis period: **last 7 days** (the week just ended)
- Comparison period: **previous 7 days** (the week before)

## Step 2 — Collect the signals from the last 7 days (in parallel)

1. `list_prompts(projectId, limit: 100)` — current state of the prompts
2. `list_competitors(projectId, filters: { status: ["CONFIRMED"] }, limit: 20, sortBy: "mentions_desc")`
3. `list_llm_sources(projectId, limit: 50, filters: { dateRange: { from: "<D-7>", to: "<today>" } }, sortBy: "appearances_desc")`
4. `list_fan_outs(projectId, limit: 50, sortBy: "recent")` — recent fan-outs

## Step 3 — Detect the changes

For the weekly report, we need something comparative. If the API doesn't directly provide historical snapshots, you can:
- Ask the user whether they have a previous week's report to provide as context
- Otherwise, do a point-in-time snapshot + alerting based on the `recent` flags

Changes to watch:
- **Competitors**: new SUGGESTED statuses that appeared, mentions up/down
- **Sources**: new domains detected (first appearance in the window)
- **Fan-outs**: new fan-outs detected (first `firstSeen` in the window)
- **Prompts**: visibility per LLM up/down

## Step 4 — Produce the report

---

# GEO Report — [Project name]

> Week of [D-7] to [today]

## TL;DR (3 lines)

3 lines maximum:
- The main change (positive or negative)
- The most important alert (if applicable)
- The priority action for next week

## 1. Overall visibility

- **Tracked prompts**: N (vs N previous week)
- **Average visibility rate**: X% (Δ vs W-1 if available)
- **LLMs where we appear**: ChatGPT (X%), Perplexity (X%), Gemini (X%), …

## 2. Share of Voice — top 5

| Competitor | Mentions W | Δ vs W-1 | Posture |
|---|---|---|---|

(Include the project's brand in bold and `(us)`)

## 3. New signals of the week

### New fan-outs detected

List 5-10 fan-outs that appeared for the first time this week (firstSeen ≥ D-7):

| Fan-out | Frequency | LLMs | Covered? |
|---|---|---|---|

### New domains in the ecosystem

List 5 domains whose first appearance is this week:

| Domain | Appearances | Type |
|---|---|---|

### Newly suggested competitors

List the competitors that moved to `SUGGESTED` this week (to validate):

| Competitor | Mentions | To handle |
|---|---|---|

## 4. Actions taken this week

If the user provides context on what was done (publications, purchases, Reddit comments) → include it here. Otherwise, omit this section.

## 5. Top 3 actions for next week

Prioritized by impact / feasibility, formatted:

1. **Short action** — why (1 line) — how (slash command) — owner if relevant
2. **Short action** — ...
3. **Short action** — ...

---

## Strict rules

- **Max 1 printed page**: the report must be readable in 2 minutes
- **No fabricating Δ**: if no comparison is possible, write "first week of tracking" or "comparison not available"
- **TL;DR at the top, always**: a client reads the first line, not the rest
- **Exec tone**: factual, no jargon, no superlatives, no emojis
- **Markdown format**: sendable by email as-is
