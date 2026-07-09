# Playbook 12 — Clusters discovery (fan-outs → pillar bridge)

> **Slash command**: [`/mentionable-clusters`](../.claude/commands/mentionable-clusters.md)
> **Who it's for**: SEO content, agencies, in-house teams who want to turn a Mentionable project's raw LLM signal into a catalog of ready-to-produce seeds
> **Deliverable**: `projects/<projet>/discovery/<YYYY-MM-DD>/{clusters.json, clusters.md, fan-outs-raw.json}`

## Why

The full GEO workflow:

```
[Raw LLM fan-outs]     ← collected by the Mentionable scan
       ↓
   Clustering          ← /mentionable-clusters (this command)
       ↓
[Ready seeds]
       ↓
   Pillar+sat. plan    ← /mentionable-pillar
       ↓
   Article brief       ← /mentionable-brief (optional)
       ↓
   GEO writing         ← /mentionable-article
       ↓
   Images              ← /mentionable-images
```

Before this command, the bridge between the **LLM fan-outs** (the real signal) and **content production** (DataForSEO + writing) was implicit: you had to manually pick a seed keyword, then run `/mentionable-pillar`. No history, no traceability.

`/mentionable-clusters` materializes that bridge as a `clusters.json` file consumable by `/mentionable-pillar --from-cluster`. Benefits:

1. **Automated discovery**: in 30 seconds you see the 15 main themes the LLMs are querying about on your project.
2. **Ready-to-pass seeds**: each cluster has a neutral `seedSuggested`, usable by DataForSEO.
3. **Dated history**: each `discovery/<date>/` snapshot keeps a picture of the LLM signal at a given point in time. You can compare month over month.
4. **Idempotence**: if you rerun the same day, the command offers to start from cache.

## Prerequisites

1. An active Mentionable project with collected fan-outs. If the scan isn't active yet, launch it on app.mentionable.ai and come back later.
2. Mentionable MCP installed (`list_projects`, `list_fan_outs`, `list_prompts` tools accessible).
3. Optional: `.project.json` already present in `projects/<projet>/` (created automatically by `/mentionable-pillar` or by this command on the first run).

## How to use

### Via Claude Code

```
/mentionable-clusters
```

The agent asks you to select the project if several are available.

### On a specific project

```
/mentionable-clusters mon-client
```

or a path:

```
/mentionable-clusters projects/mon-client
```

### Via Cursor / Claude Desktop

Copy the prompt from [`.claude/commands/mentionable-clusters.md`](../.claude/commands/mentionable-clusters.md), replace `$ARGUMENTS`.

## The pipeline in 8 steps

1. **Project selection** — from a path or interactively via `list_projects`.
2. **Cache check** — if `discovery/<today>/clusters.json` exists, offer cache or refresh.
3. **Fetch fan-outs** — `list_fan_outs(limit: 100, sortBy: frequency)`.
4. **Fetch tracked prompts** — `list_prompts(limit: 100)` for the coverage flag.
5. **Intent classification** — regex rules on the queries.
6. **Theme + intent clustering** — shared tokens, sub-clusters by intent where relevant, capped at 15.
7. **Writing** — `clusters.json`, `clusters.md`, `fan-outs-raw.json`.
8. **Console** — top 5 clusters + ready-to-paste commands.

## Structure of the `clusters.json`

```json
{
  "projectId": "...",
  "projectName": "...",
  "snapshotDate": "2026-05-11",
  "clusters": [
    {
      "id": "cluster-1",
      "rank": 1,
      "theme": "coaching",
      "intent": "commercial",
      "cumulativeFrequency": 14,
      "llmsConcerned": ["CHATGPT", "PERPLEXITY"],
      "coverageStatus": "tracked",
      "seedSuggested": "coach communication non violente en ligne",
      "suggestedCommand": "/mentionable-pillar \"...\" --project-slug ...",
      "fanOuts": [...],
      "promptIds": [...]
    }
  ]
}
```

Each cluster is **self-contained**: you can pass it as-is to `/mentionable-pillar --from-cluster`, which:
- skips project selection (implicit path)
- reuses the fan-outs without re-calling MCP
- references the source cluster in the generated `plan.md` (traceability)

## Full workflow: fan-outs → published article

```
# 1. Discovery
/mentionable-clusters mon-client
  → projects/mon-client/discovery/2026-05-11/clusters.json
  → top 5 clusters shown with suggested commands

# 2. Pick a cluster (e.g. cluster-1 = "coach CNV en ligne")
/mentionable-pillar "coach communication non violente en ligne" \
  --project-slug mon-client \
  --from-cluster projects/mon-client/discovery/2026-05-11/clusters.json#cluster-1
  → projects/mon-client/pillars/coach-cnv-en-ligne/plan.md

# 3. Write the pillar
/mentionable-article projects/mon-client/pillars/coach-cnv-en-ligne
  → projects/mon-client/articles/coach-cnv-en-ligne/article.md
  → + jsonld.json + sources.json + meta.json

# 4. Images
/mentionable-images projects/mon-client/articles/coach-cnv-en-ligne/article.md
  → projects/mon-client/articles/coach-cnv-en-ligne/images/
```

## Recommended cadence

- **First run**: as soon as a project has accumulated 30+ fan-outs (typically 2-3 weeks after activating the scan).
- **Subsequent runs**: every 2-4 weeks to observe how the fan-outs evolve (new themes, rising frequency on some clusters, competitor brands appearing).
- **When to skip it**: don't run it several times a day; the LLM signal moves on weekly/monthly cycles.

## Comparing two snapshots

To see what changed between two dates:

```bash
diff projects/<projet>/discovery/2026-05-11/clusters.json \
     projects/<projet>/discovery/2026-06-15/clusters.json
```

New clusters that appeared, frequency increases, and newly concerned LLMs are the most actionable signals.

## Difference from `/mentionable-content-gap`

`/mentionable-content-gap` produces an **article backlog** prioritized by score (info / comparison / trans / reviews) from the fan-outs. Output: a Markdown table directly actionable by a writer.

`/mentionable-clusters` produces a **seed catalog** consumable by the other commands (`/mentionable-pillar`, `/mentionable-brief`). Output: a `clusters.json` file + a `clusters.md` summary. It's more **structured data** than an editorial deliverable.

The two are complementary:
- Use `/mentionable-clusters` to steer multi-pillar production on a project (macro view, several months).
- Use `/mentionable-content-gap` to hand a writer an editorial backlog at a point in time.

## Costs

- **Claude model**: ~5-15k tokens (the fan-outs are compact, the clustering is fast).
- **Mentionable MCP**: 2 calls (`list_fan_outs`, `list_prompts`). No third-party cost.
- **DataForSEO**: none (this command doesn't touch DataForSEO).
