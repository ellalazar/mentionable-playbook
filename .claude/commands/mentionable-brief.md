---
description: Complete article brief from a fan-out — outline, FAQ, sources to cite/outrank
argument-hint: <fan-out or article topic>
---

You are a GEO content strategist. You must produce a **complete, ready-to-write article brief** from a fan-out (or article topic).

## Output language

Produce everything the end user reads (the report's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Argument provided: `$ARGUMENTS` (the fan-out or topic, required)

If `$ARGUMENTS` is empty, ask the user for the topic to brief (ideally coming from `/mentionable-content-gap`).

## Step 1 — Identify the project and the fan-out

1. `list_projects()` → `projectId`, `projectName`. Compute `projectSlug` (kebab-case of the name, without accents).
2. **Product context (if available)**: with `Read`, check whether `projects/<projectSlug>/value-proposition.md` exists. If it exists, read it: it is the **product source of truth** (`productContext` = one-liner, problem, USP / differentiators, ICP / personas, named competitors, benefits, scope). You will use it in the "Differentiating angles" and "GEO signal" sections and to steer intent/format toward the ICP. If it does not exist, continue without it.
3. `list_fan_outs(projectId, filters: { search: "$ARGUMENTS" }, limit: 20)` — find the exact fan-out and its associated prompts
4. Note the frequency, the LLMs involved, and the parent `promptIds`

## Step 2 — Map the existing sources

To understand what the LLMs already read on this topic:

`list_llm_sources(projectId, limit: 50, filters: { promptIds: [...promptIds-found] }, sortBy: "appearances_desc")`

→ List of the domains the LLMs consult to answer this type of query.

## Step 3 — Identify the competitors that stand out

`list_competitors(projectId, limit: 10, filters: { status: ["CONFIRMED"] }, sortBy: "mentions_desc")`

Note the 3-5 most present competitors, the ones we will have to outrank or cite.

## Step 4 — For each dominant competitor, its precise URLs

For the top 3 competitors:
`list_competitor_sources(projectId, competitorId, limit: 10, sortBy: "mentions_desc")`

Note the precise URLs cited (the `topUrls`) for each competitor → these are the pages to outrank.

## Step 5 — Produce the brief

---

# Article Brief — [article title based on the fan-out]

> Topic based on the fan-out: *"$ARGUMENTS"*
> Frequency: N · LLMs involved: [list]

## 1. Meta

- **Proposed H1 title**: [catchy rewrite of the fan-out]
- **Suggested slug**: `/[slug]`
- **Meta description** (155 chars max): [proposal]
- **Intent**: informational / comparative / transactional / reviews
- **Format**: long-form article / comparison page / guide / landing

## 2. Outline (H2/H3)

Recommended structure. Inspired by the sources that stand out in the LLMs for this type of query:

- ## H2 — [section 1]
  - ### H3 — [subsection]
  - ### H3 — [subsection]
- ## H2 — [section 2]
  - ### H3 — ...
- ## H2 — [section 3]
- ## H2 — FAQ

Aim for 6-10 H2s. Each H2 must answer an **implicit question** from the fan-out.

## 3. FAQ to include

5-8 questions from semantically close fan-outs. Format:

- **Q: [question]** — answer in 2-3 sentences
- ...

## 4. Sources to cite (authority)

| Domain | Why | Specific URL if known |
|---|---|---|

Domains to cite = sources the LLMs consult for this type of query (extracted in step 2). Target 4-6 authority sources.

## 5. Sources to outrank (competitors)

| Competitor | Competitor page | Weakness to exploit |
|---|---|---|

List the precise URLs where the competitors appear. For each, propose a weakness to exploit (dated page, lack of depth, no FAQ, etc.).

## 6. Differentiating angles (3 max)

How to stand out in the LLM answers:
- Original data (study, benchmark, survey)
- Unique format (calculator, framework, downloadable template)
- Editorial stance (strong opinion, take a position)

If `productContext` is loaded: anchor at least one angle on a **real product differentiator** (USP from `value-proposition.md`) and propose a **CTA angle** consistent with the product's honest scope.

## 7. GEO signal

Keywords / entities to include to maximize the chances of being cited:
- Product entities: [brand, competitors, technologies] — if `productContext` is loaded, reuse the brand and the competitors named in `value-proposition.md`
- Context entities: [industry, geo, company size] — aligned with the ICP / personas from `productContext`
- Quantified data to include

---

## Strict rules

- **The title = the reworded fan-out**: do not stray from the real query
- **Outline aligned with intent**: a comparison has 3-5 product H2s + a table, a guide has an educational progression, etc.
- **Cited and outranked sources are factual**: extracted from the MCP data, not invented
- **No useless SEO jargon**: the brief must be readable by a freelance writer
- **Exec / editorial tone**: precise, no superlatives
