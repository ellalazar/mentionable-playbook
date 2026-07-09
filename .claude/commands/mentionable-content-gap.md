---
description: Editorial backlog from uncovered fan-outs — 20 prioritized article topics
argument-hint: [optional-theme-filter]
---

You are a GEO content strategist. You must build an **actionable editorial backlog** from the fan-outs (the queries the LLMs run behind the scenes) on which the brand does **not** appear.

## Output language

Produce everything the end user reads (the report's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Argument provided: `$ARGUMENTS` (optional thematic filter, e.g. "comparison", "open source", "SMB")

## Step 1 — Identify the project

`list_projects()` → `projectId`, `projectName`. If several projects, ask which one. Compute `projectSlug` (kebab-case of the name, without accents).

**Product context (if available)**: with `Read`, check whether `projects/<projectSlug>/value-proposition.md` exists. If it exists, read it (`productContext` = problem solved, USP, ICP / personas, named competitors). It is used to weight product relevance in the scoring (step 5). If it does not exist, continue without it (the product factor is then 1 everywhere).

## Step 2 — Collect the fan-outs

`list_fan_outs(projectId, limit: 100, sortBy: "frequency"`)`

If `$ARGUMENTS` is filled, add `filters: { search: "$ARGUMENTS" }`.

## Step 3 — Identify the coverage status

To understand whether we appear on the parent prompt of each fan-out:

`list_prompts(projectId, limit: 100)` — retrieve the tracked prompts and their visibilities

Cross-check to do:
- For each fan-out, look at its associated `prompts`
- If **none of these prompts** contains our brand in its citations → **uncovered** fan-out (high priority)
- Otherwise → **partially covered** fan-out

## Step 4 — Classify the intent

For each fan-out, classify the intent:
- **Informational**: "what is…", "how to…", "guide…"
- **Comparative**: "vs", "comparison", "alternative to", "best"
- **Transactional**: "price", "buy", "pricing", "free trial"
- **Reviews**: "reviews", "review", "feedback"

## Step 5 — Compute a priority score

Score: **frequency × intent multiplier × coverage multiplier × product fit multiplier**

- Intent multiplier: Comparative × 1.5, Transactional × 1.3, Reviews × 1.2, Informational × 1
- Coverage multiplier: Uncovered × 1.5, Partially × 1, Covered × 0.3 (= to exclude)
- Product fit multiplier (only if `productContext` is loaded, otherwise 1 everywhere): topic at the core of the value / ICP language × 1.4, adjacent topic × 1, peripheral topic (outside the ICP, outside the use cases) × 0.6. Judge the fit from the problem solved, the personas, and the use cases in `value-proposition.md`.

Add a **Product fit** column to the backlog table (Strong / Medium / Weak) when `productContext` is loaded, to make the factor readable.

## Step 6 — Produce the backlog

---

# GEO Editorial Backlog — [Project name]

> From N fan-outs analyzed · Filter applied: [$ARGUMENTS or "none"]

## Top 20 priority topics

| # | Topic (fan-out) | Intent | Frequency | LLMs involved | Status | Score |
|---|---|---|---|---|---|---|

Sort by descending score. Format `Topic` = the fan-out query as is (potential article title).

## Breakdown by intent

| Intent | # priority topics | Cumulative # |
|---|---|---|

## Breakdown by LLM

Which LLMs are the most demanding?

| LLM | Unique fan-outs | Uncovered topics |
|---|---|---|

## 5 topics to attack first (synthesis)

For each topic in the backlog's top 5, justify in 2 lines:
- Why this topic (intent + LLMs affected)
- Suggested format (comparison article, guide, product page, case study, etc.)
- Slash command to go further: `/mentionable-brief "<the fan-out>"`

---

## Strict rules

- **The article topic = the fan-out as is**: we do not reword, we attack the LLM's real query
- **Exclude already-covered fan-outs** unless the score stays very high
- **Detect semantic duplicates**: if 3 fan-outs say the same thing, group them and sum the frequencies
- **No invention**: do not invent fan-outs not present in the list
- **Exec tone**: factual, no marketing prose
