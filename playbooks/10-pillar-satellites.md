# Playbook 10 — Pillar + satellites strategy (SEO + GEO)

> **Slash command**: [`/mentionable-pillar`](../.claude/commands/mentionable-pillar.md)
> **Who it's for**: SEO content, agencies, in-house teams preparing an editorial cluster
> **Deliverable**: `projects/<projectSlug>/pillars/<slug>/plan.md` — pillar plan + N satellites enriched with the LLM signal

## Why

Classic SEO tells you what to write to rank on the Google SERP (volume, KD, intent, semantics).
GEO tells you what to write to rank in LLM answers (fan-outs, citations, LLM competitors).

Most content strategies use only **one** of the two signals. This command crosses both:

- **DataForSEO** produces the pillar + satellites from a seed.
- **Mentionable MCP** enriches each cluster with: real LLM demand, competitors who already dominate the LLMs, and the authority sources the LLMs cite.

The final plan prioritizes **dual-signal** articles (SERP + LLM) — that's where you build authority on both surfaces at once.

## Prerequisites

1. **Mentionable MCP** installed and a project configured ([docs/getting-started.md](../docs/getting-started.md)).
2. **DataForSEO account** + credentials in `.env` ([docs/dataforseo-setup.md](../docs/dataforseo-setup.md)).
3. **Node ≥ 18** + `npm install` run once at the root.

## How to use

### Via Claude Code

```
/mentionable-pillar cours de guitare
```

### Via Cursor / Claude Desktop / other

Copy-paste the full prompt from [`.claude/commands/mentionable-pillar.md`](../.claude/commands/mentionable-pillar.md), replacing `$ARGUMENTS` with your seed keyword.

### As raw CLI (no LLM)

If you just want the DataForSEO brief without the MCP/LLM layer:

```bash
npm run pillar -- "cours de guitare"
# → pillars/cours-de-guitare/brief.json
```

## The pipeline in 8 steps

1. **Prerequisites** — check `.env`, `node_modules`, MCP availability.
2. **DataForSEO** — `npm run pillar -- "<seed>"` produces `brief.json` (pillar + clusters + SERP top 10).
3. **Read the brief** — the agent parses the JSON to orchestrate the rest.
4. **Cross-signal A — LLM demand per cluster** — for each cluster, `list_fan_outs(search: theme)` → tag `double_demande` / `serp_only` / `geo_dominant`.
5. **Cross-signal B — SERP × LLM competitors** — `list_competitors` once, a binary `LLM✓/✗` flag on each URL in the SERP top 10.
6. **Cross-signal C — Authority sources** — `list_llm_sources(promptIds)` → 8 domains to cite outbound in the pillar and satellites.
7. **Recomputed score** — `score_final = score_dataforseo × (1 + 0.5 × fanouts_freq_normalisée)`.
8. **Markdown plan** — writes `projects/<projectSlug>/pillars/<slug>/plan.md`: detailed pillar, sorted satellites, internal linking, roadmap.

## What makes this plan different

| Classic pillar+satellites output | This command |
|---|---|
| Volume + KD per keyword | + cumulative LLM fan-outs per cluster |
| Raw SERP top 10 | + `LLM✓/✗` flag on each top-10 domain |
| Generic sources to cite | + domains actually cited by the LLMs on these prompts |
| Roadmap based on volume alone | + boost for dual-demand SERP+LLM clusters |

## Cost and limits

- **DataForSEO cost**: ~$0.05-0.15 per run ($1 of free credits on signup).
- **LLM cost (Claude/GPT)**: scoring happens on the agent side, ~5-10 MCP tool calls per run.
- **Location limit**: one run = one location. For a multi-country site, rerun with a different `--location`.
- **No automatic re-run**: if `projects/<projectSlug>/pillars/<slug>/brief.json` already exists, the agent asks before rerunning DataForSEO.

## Chaining with other commands

The pillar+satellites plan is the **starting point** of a full editorial workflow:

```
/mentionable-pillar "cours de guitare"
  ↓ (plan.md with N prioritized satellites)
/mentionable-brief "<satellite #1>"
  ↓ (detailed brief.md for the article)
[writing]
  ↓
/mentionable-images articles/<slug>/article.md
  ↓ (cover + social + inline illustrations)
[publication]
```

Later, to check coverage:
- `/mentionable-content-gap` — detects fan-outs not yet covered by the plan
- `/mentionable-weekly` — weekly report on visibility changes for the cluster

## Sample deliverable

For `npm run pillar -- "cours de guitare"`, the plan looks like:

```markdown
# SEO + GEO strategy: cours de guitare

## TL;DR
- Chosen pillar: `cours de guitare en ligne` (vol=8100, KD=45, intent=informational)
- 8 satellite clusters, 3 of them dual-demand SERP+LLM
- LLM niche: 5/10 top-SERP domains also dominate the LLMs → mixed
- Next action: "débutant" satellite (score 6420, dual demand)

## 🏛️ Pillar article
...

## 🛰️ Satellite pack
### Satellite #1 — débutant  [double_demande]
- Intent: informational
- Cumulative volume: 4200
- LLM demand: 12 fan-outs · LLMs: chatgpt, perplexity
- Final score: 6420
...
```

## Variants

- **Multilingual**: for an international client, rerun `npm run pillar -- "<translated-seed>" --location 2840 --language en` per market. You get one plan per country.
- **Very technical niche**: if DataForSEO returns too few keywords, drop one level of specificity (e.g. `kubernetes operator pattern` → `kubernetes operator`).
- **Existing site to audit**: first run `/mentionable-audit` to understand where you stand, then `/mentionable-pillar` on the priority seeds the audit reveals.
