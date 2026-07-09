# Playbook 02 — Share of Voice by LLM

> "Are we ahead or behind? On which LLM?"
> This competitor × LLM cross-analysis shows where you win, where you lose, and where to focus effort.

## Goal

Produce a **Share of Voice heatmap** by LLM (ChatGPT, Perplexity, Gemini, Claude, AIO, AI Mode, Copilot, Grok) to identify the project's weak and strong spots.

## Who it's for

- **SEO consultant** who has to prioritize the work (which LLM to attack first?)
- **SEO agency** managing several clients and comparing GEO profiles
- **In-house SEO** who has to justify content / backlink trade-offs to the leadership team

## Prerequisites

- Mentionable MCP installed
- `CONFIRMED` competitors (without them, the heatmap is empty or barely useful)
- 7+ days of tracking for stable percentages

## MCP tools used

- `list_projects`
- `list_competitors` — mentions by LLM
- `list_prompts` — visibility rate by LLM
- `list_llm_sources` — detection of active LLMs

## On Claude Code

```
/mentionable-sov
```

With a specific project:

```
/mentionable-sov project-name
```

## On Cursor / Claude Desktop / another client

```text
You are a senior GEO consultant. Produce a Share of Voice analysis by LLM.

1. list_projects() → projectId
2. In parallel:
   - list_competitors(projectId, filters.status: ["CONFIRMED"], limit: 30, sortBy: "mentions_desc")
   - list_prompts(projectId, limit: 100)
   - list_llm_sources(projectId, limit: 30, sortBy: "appearances_desc")

3. Build a competitor × LLM matrix (SoV in %).

4. Return a report:
   - Heatmap (markdown table, one row per competitor, one column per LLM)
   - Quick read (3-5 factual bullets)
   - Weak spots (LLMs where SoV < 15%)
   - Strong spots (LLMs where SoV > 30%)
   - 3 priority actions

Rules: no invention, write "–" if data is missing, exec tone.
```

## Sample deliverable

```markdown
# Share of Voice by LLM — Acme SaaS

## 1. Competitor × LLM heatmap

| Competitor | ChatGPT | Perplexity | Gemini | Claude | AIO | **Global** |
|---|---|---|---|---|---|---|
| CompetitorA | 38% | 22% | 31% | 35% | 28% | **31%** |
| **Acme SaaS (us)** | **18%** | **41%** | **8%** | **22%** | **12%** | **20%** |
| CompetitorB | 14% | 17% | 19% | 12% | 21% | **17%** |
| CompetitorC | 11% | 9% | 14% | 8% | 15% | **11%** |
| CompetitorD | 7% | 4% | 12% | 9% | 8% | **8%** |

## 2. Quick read

- We are **leader on Perplexity** (41%, +19 pts vs CompetitorA)
- We are **4th on Gemini** (8%) — big drop-off on this LLM
- CompetitorA dominates everywhere except Perplexity
- No competitor exceeds 30% on AIO → lightly defended ground, an opportunity

## 3. Weak spots

| LLM | Our SoV | Dominant competitor | Gap |
|---|---|---|---|
| Gemini | 8% | CompetitorA (31%) | -23 pts |
| AIO | 12% | CompetitorA (28%) | -16 pts |
| ChatGPT | 18% | CompetitorA (38%) | -20 pts |

## 4. Strong spots

| LLM | Our SoV | Position | Risk |
|---|---|---|---|
| Perplexity | 41% | comfortable leader | CompetitorA growing (+5 pts vs M-1) |
| Claude | 22% | challenger | stable |

## 5. 3 priority actions

1. **Attack Gemini first** — gap of -23 pts vs CompetitorA
   — Why: Gemini consults different sources (often more institutional)
   — How: `/mentionable-content-gap` then filter on Gemini fan-outs

2. **Reverse engineer CompetitorA** — leader on 4 out of 5 LLMs
   — Why: we need to understand its channels to replicate them
   — How: `/mentionable-reverse CompetitorA`

3. **Invest in AIO before competitors settle in**
   — Why: no competitor > 30%, the window is still open
   — How: `/mentionable-backlinks` targeted at sources that surface in AIO
```

## Variants

- **Monthly SoV**: add "compare with the last 30 days" to see changes
- **SoV by category**: if you have prompt categories, ask to "segment by category"
- **Country-specific SoV**: `filters.country: "FR"` on `list_prompts`

## Going further

- [Reverse engineering the dominant competitor](03-reverse-engineering-concurrents.md)
- [Content gap by LLM](04-fan-outs-pour-briefs-articles.md)
- [Weekly report that tracks SoV over time](08-reporting-hebdo-geo.md)
