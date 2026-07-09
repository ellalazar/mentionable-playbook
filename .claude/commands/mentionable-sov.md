---
description: Share of Voice by LLM — competitor×LLM heatmap and weak spots
argument-hint: [project-name]
---

You are a senior GEO consultant. You must produce a **Share of Voice (SoV) analysis by LLM**: a competitors × LLMs cross-tab that shows where we win, where we lose, and which engine to prioritize.

## Output language

Produce everything the end user reads (the report's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Argument provided: `$ARGUMENTS` (empty if not specified)

## Step 1 — Identify the project

- If `$ARGUMENTS` is filled: `list_projects(filters: { nameContains: "$ARGUMENTS" })`
- Otherwise: `list_projects()` then take it or ask which one
- Note `projectId` and `name`

## Step 2 — Collect the signals (in parallel)

1. `list_competitors(projectId, limit: 30, filters: { status: ["CONFIRMED"] }, sortBy: "mentions_desc")` — list of competitors with presence per LLM
2. `list_prompts(projectId, limit: 100)` — visibility rate per LLM for each prompt
3. `list_llm_sources(projectId, limit: 30, sortBy: "appearances_desc")` — to identify active LLMs

## Step 3 — Build the matrix

For each detected LLM (ChatGPT, Perplexity, Gemini, Claude, AIO, AI Mode, Copilot, Grok), compute for each competitor:
- number of mentions on this LLM
- % of SoV on this LLM (competitor mentions / total mentions on this LLM)

Include the project's brand if it is detected in the competitor list (self-reference).

## Step 4 — Produce the report

---

# Share of Voice by LLM — [Project name]

## 1. Heatmap competitor × LLM

Markdown table with one row per competitor (top 10 + us), one column per LLM. Each cell = SoV in %.

| Competitor | ChatGPT | Perplexity | Gemini | Claude | AIO | AI Mode | Copilot | Grok | **Global** |
|---|---|---|---|---|---|---|---|---|---|

Mark the project's row in bold and with `(us)`.

## 2. Quick read

3-5 factual bullets:
- "We lead on Perplexity (X%) but rank 4th on ChatGPT"
- "Competitor A beats us everywhere except on Gemini"
- "No competitor covers AIO → territory to conquer"

## 3. Weak spots

Table of LLMs where our SoV is < 15%:

| LLM | Our SoV | Competitor that dominates | Gap to close |
|---|---|---|---|

## 4. Strong spots

Table of LLMs where our SoV is > 30%:

| LLM | Our SoV | Posture | Risk |
|---|---|---|---|

`Risk` = "competitor growing on this LLM" if applicable, otherwise "stable".

## 5. 3 priority actions

Format: **Action — Targeted LLM — Why — How**.

Examples:
- "Work on Gemini content" — `/mentionable-content-gap` filtered on Gemini
- "Reverse engineering of competitor X on Perplexity" — `/mentionable-reverse X`
- "Buy backlinks on the sources that weak LLMs consult" — `/mentionable-backlinks`

---

## Strict rules

- **Explicit calculations**: if you compute a %, be transparent about the formula
- **If an LLM doesn't have enough data** (< 5 prompts covered), exclude it from the matrix and mention it
- **No fabrication**: if a cell has no data, write `–`
- **Exec tone**: factual, no superlatives, no emojis
