# Playbook 05 — Full article brief

> You have a fan-out to attack. This command produces a **ready-to-write brief**: title, H2/H3 outline, FAQ, sources to cite, competitor pages to beat.

## Goal

Turn a fan-out (from `/mentionable-content-gap` or hand-picked) into a **complete, actionable article brief**, calibrated on what the LLMs actually consult for that type of query.

## Who it's for

- **In-house or freelance writers** who need a clear framework
- **SEO content** who validate briefs before production
- **Agencies** who want to industrialize GEO brief production

## Prerequisites

- Mentionable MCP installed
- At least 1 tracked prompt covering the topic (to get the associated fan-outs and sources)
- Ideally: having run `/mentionable-content-gap` beforehand to pick a high-scoring fan-out

## MCP tools used

- `list_projects`, `list_fan_outs`
- `list_llm_sources` (filtered by `promptIds`) — authority sources
- `list_competitors`, `list_competitor_sources` — competitor pages to beat

## On Claude Code

```
/mentionable-brief "open source [category] comparison 2026"
```

```
/mentionable-brief "alternative to CompetitorA"
```

## On Cursor / Claude Desktop / another client

```text
You are a GEO content strategist. Produce a full article brief for the topic: "<TOPIC>".

1. list_projects() → projectId
2. list_fan_outs(projectId, filters.search: "<TOPIC>", limit: 20) → find the exact fan-out, note frequency, LLMs, parent promptIds
3. list_llm_sources(projectId, filters.promptIds: [...], limit: 50, sortBy: "appearances_desc") → sources the LLMs consult
4. list_competitors(projectId, filters.status: ["CONFIRMED"], limit: 10, sortBy: "mentions_desc") → top competitors
5. For the top 3 competitors: list_competitor_sources(projectId, competitorId, limit: 10) → specific URLs to beat

Return a markdown brief:
- Meta (title, slug, meta-desc, intent, format)
- H2/H3 outline (6-10 H2s)
- FAQ (5-8 questions from nearby fan-outs)
- Sources to cite (4-6 authority domains)
- Sources to beat (competitor URLs with a weakness to exploit)
- 3 differentiating angles
- GEO signal (entities, data to include)

Rules: title = reworded fan-out, outline aligned with intent, factual sources.
```

## Sample deliverable

```markdown
# Article brief — Comparison of open source [category] tools in 2026

> Topic based on the fan-out: "open source [category] comparison 2026"
> Frequency: 38 · LLMs involved: ChatGPT, Perplexity, Gemini, Claude

## 1. Meta

- **H1 title**: The 7 best open source [category] tools in 2026 — full comparison
- **Slug**: `/blog/comparatif-[categorie]-open-source-2026`
- **Meta-desc**: Our comparison of the 7 best open source [category] tools in 2026: features, community, learning curve and commercial alternatives. (152 chars)
- **Intent**: Comparative
- **Format**: Long-form article 2500-3500 words with a summary table + ItemList JSON-LD

## 2. Outline

- ## H2 — Why choose an open source [category] tool in 2026
  - ### H3 — Advantages vs proprietary solutions
  - ### H3 — Limitations to know about
- ## H2 — Our comparison methodology
  - ### H3 — Criteria evaluated
  - ### H3 — Test period
- ## H2 — Tool 1: [Name] — the most popular
  - ### H3 — Strengths
  - ### H3 — Weaknesses
  - ### H3 — Who it's for
- ## H2 — Tool 2: [Name] — the most complete
- ## H2 — Tools 3 to 7 (same structure)
- ## H2 — Summary table
- ## H2 — Open source vs commercial: which to choose?
- ## H2 — FAQ

## 3. FAQ

- **Q: What is the best open source [category] tool for an SMB?** — a synthesis of the 2-3 most accessible tools with the right simplicity/power ratio
- **Q: Is open source really free?** — clarify the hidden costs (hosting, support, maintenance)
- **Q: Can you migrate from a proprietary solution to open source?** — quick guide + migration tools
- **Q: What open source alternative to CompetitorA?** — comparison on 3 key criteria
- **Q: Which open source [category] tool to start solo?** — recommend 1 tool + reasons
- **Q: How do you assess the health of an open source project?** — checklist (commits, contributors, roadmap, community)

## 4. Sources to cite

| Domain | Why | URL if known |
|---|---|---|
| github.com | Absolute reference for project context | github.com/<project>/<repo> |
| g2.com | Structured user reviews | g2.com/categories/[category] |
| capterra.com | SMB comparison | capterra.com/[category]-software/ |
| reddit.com (r/[subreddit]) | Social proof, recent debates | – |
| [industry-media].com | Editorial authority of the sector | – |

## 5. Sources to beat (competitors that surface)

| Competitor | Competitor page | Weakness |
|---|---|---|
| CompetitorA | competitora.com/blog/best-open-source-tools | Undated, lists only 5 tools, no table |
| CompetitorB | competitorb.com/comparison/open-source | Lists 3 tools, too promotional in tone |
| [other source] | example.com/2024-comparison | Dated 2024, can be outdone by a fresh 2026 comparison |

## 6. Differentiating angles

1. **Original data**: perf/install benchmark of the 7 tools on the same VM, publishable numbers
2. **Unique format**: interactive "which tool for my use case" calculator (3 questions → 1 rec)
3. **Editorial stance**: a clear verdict in the conclusion, we name a winner per user profile

## 7. GEO signal

- Product entities: [Tools 1 to 7 + their commercial alternatives]
- Context entities: open source, SMB, self-hosted, cloud
- Data to include: install size, minimum RAM, number of GitHub stars, last release, community size
```

## Variants

- **Short brief (1500 words)**: add "condensed 1500-word article format, 5 H2s max"
- **Product landing brief**: "landing page format with hero + 3 sections + CTA"
- **Multilingual brief**: "produce the brief in FR then EN"
- **Conversational brief**: "structure for a direct LLM answer (answer-paragraph up front, visible sources)"

## Going further

- [Content gap to identify the next topic](04-fan-outs-pour-briefs-articles.md)
- [Reverse engineering to dig into the dominant competitor](03-reverse-engineering-concurrents.md)
