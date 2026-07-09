---
description: Pillar + satellites strategy from a seed keyword (DataForSEO) enriched with the LLM signal (Mentionable MCP)
argument-hint: <seed keyword>
allowed-tools: Bash, Read, Write, AskUserQuestion
---

You are an SEO + GEO strategist. From the seed keyword `$ARGUMENTS`, you produce an actionable **pillar + satellites** editorial plan that crosses the SERP signal (DataForSEO) with the LLM signal (Mentionable MCP). The goal: pages that rank both on the Google SERP **and** in LLM answers.

## Output language

Produce everything the end user reads (the deliverable's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

If `$ARGUMENTS` is empty, ask the user for the seed keyword.

## Prerequisites (check at the very start, once)

1. `package.json` at the root and a `node_modules` folder present. If missing → `npm install`.
2. `.env` file at the root with `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`. If missing → tell the user to copy `.env.example` to `.env` and fill in their credentials (see [docs/dataforseo-setup.md](../../docs/dataforseo-setup.md)).
3. Mentionable MCP installed (the tools `list_projects`, `list_fan_outs`, `list_competitors`, `list_llm_sources` must be available). If missing → point to [docs/getting-started.md](../../docs/getting-started.md).
4. Node ≥ 18 (`node --version`).

If any is missing, stop and clearly explain the command to run.

## Step 1 — Select the Mentionable project

Before launching the DataForSEO pipeline (which consumes credits), confirm the project against which you will cross the LLM signal.

### Mode A — With `--from-cluster <path>` (recommended if you're coming from `/mentionable-clusters`)

If `$ARGUMENTS` contains `--from-cluster projects/<slug>/discovery/<date>/clusters.json#cluster-N`:

1. Extract `projectSlug` from the path and `clusterId` from the `#cluster-N` fragment.
2. Read `projects/<projectSlug>/.project.json` → `projectId`, `projectName`.
3. Read `projects/<projectSlug>/discovery/<date>/clusters.json`, find the cluster whose `id` matches `clusterId`.
4. Store the cluster's fields in memory: `theme`, `intent`, `fanOuts`, `promptIds`, `seedSuggested`.
5. If `$ARGUMENTS` does not contain a positional seed keyword, **use the cluster's `seedSuggested` as the seed**.
6. Go directly to step 2.

Benefits: skip the project selection, reuse the already-collected fan-outs (step 4 enriched without a new MCP call), traceability of the source cluster in the generated `plan.md`.

### Mode B — Without `--from-cluster` (interactive selection)

1. `list_projects()` → list of projects.
2. **If a single project**: use it, display its name for visual confirmation and continue.
3. **If multiple projects**: use `AskUserQuestion` to let the user choose (label = project name, description = main domain if available). No "Other" — the user must choose among the existing projects.
4. **If zero projects**: stop and tell the user to create a project on [app.mentionable.ai](https://app.mentionable.ai) before re-running.

### Common to both modes

Store `projectId`, `projectName` and compute `projectSlug` (kebab-case of the name, no accents, max 60 chars) — reused in steps 2, 4, 5, 6.

**Product context (if available)**: with `Read`, check whether `projects/<projectSlug>/value-proposition.md` exists. If it does, read it (`productContext` = problem solved, USP, ICP / personas, use cases, named competitors). You'll use it in the `plan.md` synthesis step to: (1) verify that the pillar truly serves the ICP, (2) **prioritize satellites aligned with the product's use cases and personas**, (3) flag SERP-only satellites outside the ICP as "traffic but low purchase intent". If it doesn't exist, continue without it (prioritization by SERP × LLM signal alone).

You can also recommend `/mentionable-clusters` to the user beforehand if they haven't yet explored the project's fan-outs: it's the dedicated command for turning the raw LLM signal into seeds ready to pass here.

## Step 2 — DataForSEO pipeline

Run the script from the repo root, passing the `projectSlug`:

```bash
npm run pillar -- "$ARGUMENTS" --project-slug <projectSlug>
```

The script writes `./projects/<projectSlug>/pillars/<seedSlug>/brief.json` containing:
- `pillar`: chosen pillar keyword, volume, KD, target length, top 10 SERP with domains, shared semantic terms, sample of competitor headings
- `satellites`: clusters grouped by intent and theme, with their candidate articles (title, volume, KD)

> **Storage convention**: everything related to a Mentionable project lives under `projects/<projectSlug>/` (`.project.json`, `pillars/`, `articles/`). See README.

Retrieve the `slug` (seed-slug) shown in the script's output. The working directory for the rest is `./projects/<projectSlug>/pillars/<slug>/`.

If the file `./projects/<projectSlug>/.project.json` does not exist, create it now with the Write tool:

```json
{
  "projectId": "<projectId>",
  "projectName": "<projectName>",
  "projectUrl": "<project url if available>",
  "createdAt": "<ISO date>"
}
```

This file lets downstream commands (`/mentionable-article`, `/mentionable-images`) find the Mentionable project without re-asking.

## Step 3 — Read the brief

`Read ./projects/<projectSlug>/pillars/<slug>/brief.json` — this is your source of truth for the rest. Note:
- `pillar.targetKeyword` (the pillar keyword)
- `pillar.top10Serp[].domain` (list of domains to cross in step 4)
- `satellites[].theme` (each theme will be enriched in step 4)

## Step 4 — Cross-signal A: LLM demand per cluster (`list_fan_outs`)

You already have `projectId` from step 1. **For each satellite cluster** (and for the pillar itself), run:

> **`--from-cluster` mode**: you already have the fan-outs in memory (source cluster). You can **skip** the `list_fan_outs(search: source_cluster_theme)` call for that central theme and use the in-memory fan-outs directly. Keep calling `list_fan_outs` for the *other* DataForSEO clusters that weren't in the source cluster, so you don't lose signal.

```
list_fan_outs(projectId, filters: { search: "<cluster theme>" }, limit: 20, sortBy: "frequency")
```

Run the calls **in parallel** (a single message, N tool calls). For each cluster note:
- `fanOutsMatched`: number of fan-outs found
- `cumulativeFrequency`: sum of frequencies
- `llmsConcerned`: union of the LLMs that surface these fan-outs
- `promptIds`: parent ids (reused in step 5)

Tag each cluster:
- `double_demande` if `cumulativeFrequency ≥ 5` → high priority (Google volume **and** LLM demand)
- `serp_only` if `fanOutsMatched == 0` → classic SEO, no GEO bet
- `geo_dominant` if low Google volume but high fanOutsMatched → pure GEO bet (rare)

## Step 5 — Cross-signal B: SERP competitors vs LLM competitors (`list_competitors`)

A single call:

```
list_competitors(projectId, limit: 30, filters: { status: ["CONFIRMED"] }, sortBy: "mentions_desc")
```

Retrieve the set of domains (`competitor.domain` normalized without `www.`).

For each URL in `pillar.top10Serp`, set a flag:
- `llmStatus = "✓"` if the domain is in the set of LLM competitors
- `llmStatus = "✗"` otherwise

Compute two global signals:
- `hegemonicCount`: number of top 10 SERP domains that are also top LLM competitors → if ≥ 4, the niche is locked on both sides
- `serpOnlyCount`: number of top 10 SERP domains **absent** from the LLM competitors → GEO opportunity on the pillar

## Step 6 — Cross-signal C: authority sources to cite (`list_llm_sources`)

Aggregate all the `promptIds` collected in step 4 (deduplicate). Run:

```
list_llm_sources(projectId, filters: { promptIds: [...all-promptIds] }, limit: 30, sortBy: "appearances_desc")
```

Keep the **8 domains** most cited by the LLMs on these prompts. These are the authority sources that the articles (pillar + satellites) will need to cite in outbound to resemble the pages the LLMs already trust.

If zero `promptIds` were collected (no fan-out found in step 4), skip this step and note it in the report.

## Step 7 — Recompute the satellite score

For each satellite cluster:

```
score_final = score_dataforseo × (1 + 0.5 × min(cumulativeFrequency / 10, 2))
```

(The base DataForSEO score = `totalVolume × (100 − avg_KD) / 100`. If KD isn't available, use 50.)

Re-sort the satellites by descending `score_final`.

## Step 8 — Produce the markdown plan

Write `./projects/<projectSlug>/pillars/<slug>/plan.md` with this exact structure. **No lorem ipsum** — real titles, real anchors, real domains extracted from the data.

```markdown
# SEO + GEO strategy: <seed>

> Mentionable project: `<projectName>` · Loc <LOCATION_CODE> · Lang <LANGUAGE_CODE> · Generated on <date> · `npm run pillar -- "<seed>"`
> Source: <if --from-cluster, path of clusters.json#cluster-N; otherwise "direct seed">.

## TL;DR

- **Chosen pillar**: `<targetKeyword>` (vol=<volume>, KD=<difficulty>, intent=<intent>)
- **<N> satellite clusters** (<X> with dual SERP+LLM demand, <Y> SERP-only)
- **LLM niche**: <hegemonicCount>/10 top-SERP domains also dominate the LLMs → [locked / mixed / open]
- **Next action**: <satellite #1 or pillar — see roadmap>

## 🏛️ Pillar article

- **Target keyword**: `<targetKeyword>` · volume=<vol> · KD=<kd> · intent=<intent>
- **Target length**: <targetWordCount> words (competitors = <avgWordCount> on average)
- **LLM demand**: <cumulativeFrequency> cumulative fan-outs across <N> LLMs (<list>)

### Proposed H1 + H2/H3 outline

Cover the required semantic terms and answer the LLM fan-outs found.

- H1: <reformulation of the targetKeyword as an editorial title>
- H2 — <section 1 inspired by competitors>
  - H3 — <sub-section>
- ... (aim for 6-10 H2s, including one "FAQ" H2)

### Top 10 SERP — who also dominates in LLMs?

| Rank | Domain | URL | LLM | Words |
|---|---|---|---|---|
| 1 | <domain> | <url> | <✓/✗> | <wordCount> |
| ... | | | | |

**Reading**: <hegemonicCount> SERP domains are also LLM tops (dual-front enemies). <serpOnlyCount> are SERP-only (GEO opportunity).

### Authority sources to cite in outbound

Domains the LLMs actually read for this type of query — cite 4-6 in outbound:

| Domain | LLM appearances | Why |
|---|---|---|

### Semantic terms to integrate

<comma-separated list of pillar.semanticTermsToCover>

### Differentiating angles (vs top 10 SERP)

3 angles the competitors do NOT cover, deduced from `competitorHeadingsSample`:

- <angle 1>
- <angle 2>
- <angle 3>

## 🛰️ Satellite pack

Sorted by descending `score_final`.

### Satellite #1 — <theme> [<tag: double_demande / serp_only / geo_dominant>]

- **Intent**: <intent>
- **Cumulative volume**: <totalVolume>
- **LLM demand**: <cumulativeFrequency> fan-outs · LLMs: <list>
- **Final score**: <score>
- **Candidate articles**:

  | Title / keyword | Volume | KD |
  |---|---|---|
  | <keyword> | <vol> | <kd> |

- **Editorial angle**: <1 sentence>
- **Sources to cite**: <2-3 from step 5>

### Satellite #2 — ...

(repeat for each cluster, sorted by score_final)

## 🔗 Internal linking

- **Scheme**: each satellite → link to the pillar (anchor = semantic variation of `<targetKeyword>`)
- **Cross-links**: satellites of the same intent cite each other when relevant
- **Dedicated section in the pillar**: an H2 "Going further" pointing to the N satellites with descriptive anchors
- **Recommended anchors** (sample):
  - Pillar ← Satellite "<theme>": "<concrete anchor>"
  - ...

## 📋 Production roadmap

**Order**: <pillar-first | satellites-first>

Rationale:
- If `hegemonicCount ≥ 4` AND the pillar is KD-hard (>50) → **satellites-first** on the 2-3 double_demande clusters to build authority before attacking the pillar
- Otherwise → **pillar-first** (centralizes authority, then the satellites link toward it)

| Order | Article | Cluster | Score | Why |
|---|---|---|---|---|
| 1 | <title> | <theme or "pillar"> | <score> | <reason> |
| ... | | | | |

## Suggested chaining

To go further, run:
- `/mentionable-brief "<satellite #1 keyword>"` — detailed brief for the first article to produce
- `/mentionable-content-gap` — matches the fan-outs not covered by this plan
- `/mentionable-images <path-to-article.md>` — illustrations once the article is written
```

## Step 9 — Final summary in chat

Show in 3 bullets:

```
✅ Plan generated: ./projects/<projectSlug>/pillars/<slug>/plan.md
   - Mentionable project: "<projectName>"
   - Pillar: "<targetKeyword>" (vol=X, KD=Y)
   - <N> priority satellites, of which <X> with dual SERP+LLM demand
   - Next: /mentionable-article ./projects/<projectSlug>/pillars/<slug>
```

## Strict rules

- **No invention**: every domain, fan-out, competitor, source must come from real data (DataForSEO + MCP). If data is missing, flag it explicitly in the plan rather than inventing.
- **MCP calls in parallel when possible**: a single message with N tool calls for the `list_fan_outs` of step 4.
- **Stable slug**: always use the slug returned by the script — do not re-generate it.
- **Confirm before re-running DataForSEO**: if `./projects/<projectSlug>/pillars/<slug>/brief.json` already exists, ask whether to re-run the pipeline (each run costs DataForSEO credits) or work from the existing file.
- **Exec, factual tone**: no marketing prose, no superlatives.
