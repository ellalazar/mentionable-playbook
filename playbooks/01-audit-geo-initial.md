# Playbook 01 — Initial GEO audit

> First reflex when you take over a Mentionable project: **where do things stand?**
> This audit gives an exec-ready status report in 2 minutes, ready to send to a client.

## Goal

Produce a complete GEO diagnosis of a project: visibility by LLM, Share of Voice, top competitors, top sources, priority fan-outs, and 3 actions to take.

## Who it's for

- **Freelance SEO consultant** taking on a new client
- **In-house SEO** setting up tracking and wanting a baseline
- **SEO agency** auditing an existing project
- **Web agency** wanting to scope a GEO engagement

## Prerequisites

- Mentionable MCP installed (see [getting-started](../docs/getting-started.md))
- At least 1 Mentionable project with tracked prompts
- 24-48h of tracking to get meaningful data

## MCP tools used

- `list_projects` — project identification
- `list_prompts` — visibility by LLM
- `list_competitors` — Share of Voice
- `list_llm_sources` — source ecosystem
- `list_fan_outs` — fan-out prompts

## On Claude Code

```
/mentionable-audit
```

With a specific project:

```
/mentionable-audit my-project-name
```

## On Cursor / Claude Desktop / another MCP client

Copy-paste the following prompt into your chat (the client will call the MCP tools automatically):

```text
You are a senior GEO consultant. Produce an exec-ready GEO audit of a Mentionable project.

1. Identify the project:
   - If I specify a name: list_projects(filters.nameContains: "<name>")
   - Otherwise: list_projects() and take the only one available (otherwise ask)

2. Collect in parallel:
   - list_prompts(projectId, limit: 100)
   - list_competitors(projectId, filters.status: ["CONFIRMED"], limit: 20, sortBy: "mentions_desc")
   - list_llm_sources(projectId, limit: 50, sortBy: "appearances_desc")
   - list_fan_outs(projectId, limit: 30, sortBy: "frequency")

3. Return a structured markdown report:
   - Overview (prompts, competitors, LLMs)
   - Visibility by LLM (table)
   - Top 5 competitors by Share of Voice (table)
   - Top 10 fan-outs with "covered / to work on" status
   - Top 10 LLM sources (table)
   - 3 priority actions (action / why / how)

Rules: data only, no invention, compact format, exec tone.
```

## Sample deliverable

```markdown
# GEO Audit — Acme SaaS

> Analysis period: last 7 days

## 1. Overview

- Tracked prompts: 24 (22 active)
- Confirmed competitors: 8
- LLMs covered: ChatGPT, Perplexity, Gemini, Claude, Google AIO
- Domains detected in the ecosystem: 142

## 2. Visibility by LLM

| LLM | Prompts covered | Average rate | Note |
|---|---|---|---|
| ChatGPT | 18/24 | 42% | medium |
| Perplexity | 22/24 | 67% | strong |
| Gemini | 9/24 | 18% | weak |
| Claude | 12/24 | 28% | medium |
| Google AIO | 6/24 | 12% | weak |

## 3. Share of Voice — Top 5 competitors

| Competitor | Mentions | LLMs present | Status |
|---|---|---|---|
| CompetitorA | 187 | 5/5 | leader |
| Acme SaaS (us) | 124 | 5/5 | challenger |
| CompetitorB | 98 | 4/5 | challenger |
| CompetitorC | 67 | 3/5 | follower |
| CompetitorD | 41 | 2/5 | niche |

## 4. Top 10 fan-outs

| Fan-out | Frequency | LLMs | Status |
|---|---|---|---|
| best [category] tool SMB 2026 | 47 | 4/5 | covered |
| open source [category] comparison | 38 | 3/5 | to work on |
| [category] user reviews | 31 | 5/5 | covered |
| ... | | | |

## 5. Top 10 ecosystem sources

| Domain | Appearances | Dominant type |
|---|---|---|
| reddit.com | 89 | cited |
| g2.com | 67 | cited |
| capterra.com | 54 | consulted |
| [industry-media].com | 41 | cited |
| ... | | |

## 6. 3 priority actions

1. **Work on Gemini visibility** (18% vs 67% on Perplexity)
   — Why: clear asymmetry, Gemini consults other sources
   — How: `/mentionable-sov` then `/mentionable-content-gap` filtered on Gemini

2. **Reverse engineer CompetitorA** (SoV leader with 35% presence)
   — Why: it dominates across all LLMs, understand its channels
   — How: `/mentionable-reverse CompetitorA`

3. **Fill the "open source comparison" fan-out** (38 occurrences, not covered)
   — Why: strong intent, we don't appear on any LLM
   — How: `/mentionable-brief open source [category] comparison`
```

## Variants

- **Weekly audit**: chain into `/mentionable-weekly` to track changes
- **Audit by persona**: add "filter prompts by personaIds: [...]" if you have personas configured
- **Audit by country**: add `filters.country: "FR"` to `list_prompts`
- **Short audit (5 prompts)**: for a client demo, ask for a "condensed 1-page version" audit

## Going further

- [Reverse engineering a competitor](03-reverse-engineering-concurrents.md) — break down the SoV leader's channels
- [Content gap via fan-outs](04-fan-outs-pour-briefs-articles.md) — editorial backlog from the audit
- [Weekly client report](08-reporting-hebdo-geo.md) — automate tracking
