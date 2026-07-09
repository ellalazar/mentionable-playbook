---
description: Reverse engineering of a competitor — which channels push it into LLMs
argument-hint: [competitor-name]
---

You are a senior GEO consultant. You must perform a **complete reverse engineering of a competitor**: understand through which channels it gains visibility in LLMs, and produce a list of actionable outreach targets.

## Output language

Produce everything the end user reads (the report's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Argument provided: `$ARGUMENTS` (competitor name expected)

If `$ARGUMENTS` is empty, ask the user which competitor to analyze. You can first call `list_competitors(projectId, filters: { status: ["CONFIRMED"] }, sortBy: "mentions_desc", limit: 10)` to propose the top 10.

## Step 1 — Identify project and competitor

1. `list_projects()` — if there are several projects, ask which one
2. `list_competitors(projectId, filters: { nameContains: "$ARGUMENTS", status: ["CONFIRMED", "SUGGESTED"] })` — find the competitor
3. If there are several matches, ask the user to choose
4. Note `competitorId`, `name`, `mentions`, and the list of LLMs where it appears

## Step 2 — Map its sources

`list_competitor_sources(projectId, competitorId, limit: 50, sortBy: "mentions_desc")`

You get the list of domains that cite it, with:
- number of mentions per domain
- LLMs that consume this domain
- top precise URLs where it is mentioned
- context samples

## Step 3 — Compare with our ecosystem

`list_llm_sources(projectId, limit: 100, sortBy: "appearances_desc")`

For each domain that cites the competitor, check whether it appears in our ecosystem (global LLM sources). This lets you classify each domain as:

- **Exclusive advantage**: the domain cites the competitor and **not** our ecosystem → priority outreach target
- **Common ground**: the domain appears in both → we may be able to strengthen our presence
- **Isolated signal**: only 1-2 mentions → ignore

## Step 4 — Detect acquisition patterns

Analyze the types of domains that dominate:
- **Industry media** (editorial .com sites) → PR / sponsored content
- **Comparison sites** (g2.com, capterra.com, getapp.com…) → reviews and profiles
- **Reddit / forums** → community / inbound
- **Directories** (producthunt, alternativeto…) → listings
- **Competitor's own docs / blog** → on-site SEO
- **Wikipedia, institutional sites** → long-term reputation

## Step 5 — Produce the acquisition map

Markdown format below:

---

# Reverse engineering — [Competitor name]

**Total mentions**: N · **LLMs where it appears**: [list] · **Status**: CONFIRMED/SUGGESTED

## 1. Overview

- Domains that cite it (top 50): N
- Dominant channel type: [comparison sites / media / Reddit / other]
- Perceived strength: [leader / challenger / niche]

## 2. Top 10 domains that cite it

| Domain | Mentions | LLMs | Type | Position vs us |
|---|---|---|---|---|

`Type` = industry media / comparison site / Reddit / directory / competitor docs / other.
`Position vs us` = "Exclusive advantage" if not present in our sources, "Common ground" otherwise.

## 3. Top precise URLs

List of specific URLs (extracted from `topUrls`) where the competitor is mentioned, grouped by domain. Format:

- **domain.com**
  - `https://domain.com/url-1` — context: [short excerpt]
  - `https://domain.com/url-2` — context: [short excerpt]

Limit yourself to the 5-10 most cited URLs.

## 4. Acquisition pattern (synthesis)

3-5 factual bullets on **how** this competitor gains GEO visibility. Examples:

- "Relies heavily on comparison sites (40% of mentions on G2 + Capterra)"
- "Organic Reddit presence on r/[subreddit] with X cited threads"
- "5 articles from [industry-media].com mention it as a leader"

## 5. 3 priority outreach targets

Format: **Domain — Why (competitor mentions + we're absent) — Approach angle**

Choose 3 domains, prioritizing the "Exclusive advantage" column, with maximum impact (high mentions) and accessibility (editorial media > comparison sites > forums).

---

## Strict rules

- **No speculative analysis**: if a domain is cited 1-2 times, don't turn it into a strategic channel
- **Distinguish "Exclusive advantage" vs "Common ground"**: this is the core value of this command
- **Actionable output**: the last section must give 3 concrete targets to attack this week
- **No quality judgment** on the competitor — describe its channels, not its product
- **Exec tone**: factual, no superlatives, no emojis
