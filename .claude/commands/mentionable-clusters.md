---
description: Clusters a project's LLM fan-outs by theme + intent, produces clusters.json consumable by /mentionable-pillar
argument-hint: [optional-project-slug-or-path]
allowed-tools: Read, Write, Bash, AskUserQuestion
---

You are a GEO analyst. From a Mentionable project's LLM fan-outs, you produce a **catalog of topic clusters** that bridges the raw signal (LLM fan-outs) and content production (`/mentionable-pillar`, `/mentionable-brief`, `/mentionable-article`).

## Output language

Produce everything the end user reads (the deliverable's headings and prose) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write all prose in that language while keeping command names, tool names, code, and data identifiers unchanged.

Goal: a machine-readable `clusters.json` file consumable by the other commands, plus a human-readable `clusters.md` to decide what to write first.

Argument provided: `$ARGUMENTS` (project slug or path under `projects/<slug>/`, optional)

## Step 1 — Identify the project

1. **If `$ARGUMENTS` is a slug or a path under `projects/<slug>/`** → extract the `projectSlug`, read `projects/<projectSlug>/.project.json` to get `projectId` and `projectName`.
2. **If `$ARGUMENTS` is empty** → `list_projects()`.
   - If a single project: use it.
   - If multiple: `AskUserQuestion` to let the user choose.
   - If zero: tell them to create a project on app.mentionable.ai.
3. Compute `projectSlug` (kebab-case of the name, no accents, max 60 chars) if absent.
4. If `projects/<projectSlug>/.project.json` does not exist, create it.

Store: `projectId`, `projectName`, `projectSlug`, `today` (`YYYY-MM-DD` ISO).

## Step 2 — Cache / idempotence

Check whether `projects/<projectSlug>/discovery/<today>/clusters.json` already exists.

- **If it exists** → `AskUserQuestion`: "Today's snapshot already present. Re-run the collection (consumes N MCP calls) or work from the existing cache?"
  - If "work from cache" → skip steps 3-7 and go directly to the console display (step 8) by reading the existing files.
  - If "re-run" → continue normally, **overwrite** the existing files.
- **If it doesn't exist** → continue normally.

## Step 3 — Collect the fan-outs

```
list_fan_outs(projectId, limit: 100, sortBy: "frequency")
```

Store the raw output in `fanOutsRaw`. If `totalCount` exceeds 100, note in the final `clusters.md` that you've seen the first 100 and that pagination is needed for completeness.

## Step 4 — Collect the tracked prompts (for the coverage flag)

```
list_prompts(projectId, limit: 100)
```

Store the set of tracked `promptId`s and their `brandVisibility` or equivalent available in the response. If the tool doesn't directly return per-brand visibility, consider that any prompt present in the list is "tracked" and stay with a binary flag `tracked / untracked`.

## Step 5 — Intent classification

For each fan-out, deduce the dominant intent from the query. Rules (cumulative, last match wins). Signals are listed for English and French; match against the project language, and add your own tokens for another target language.

| Intent | Signals in the query |
|---|---|
| `transactional` | EN: "price", "pricing", "cost", "buy", "subscription", "free", "trial", "sign up", "book", "booking", "demo" · FR: "prix", "tarif", "tarifs", "acheter", "abonnement", "gratuit", "essai", "souscrire", "réserver", "rdv", "rendez-vous" |
| `commercial` | EN: "best", "top", "comparison", "vs", "alternative", "alternatives", "which", "choose" · FR: "meilleur", "meilleurs", "comparatif", "comparaison", "lequel", "laquelle", "choisir" |
| `reviews` | EN: "review", "reviews", "opinion", "feedback", "testimonial", "experience" · FR: "avis", "retour", "retours", "témoignage", "témoignages", "expérience" |
| `navigational` | presence of a known brand name, a domain name, "official site" / "site officiel", "login", "sign in" / "connexion", or a query that explicitly designates an entity |
| `informational` (default) | everything else: EN "how", "what is", "why", "definition", "guide", "method", "example", "examples" · FR "comment", "qu'est-ce que", "pourquoi", "définition", "guide", "méthode", "exemple", "exemples", or no signal from the other categories |

If a query matches several intents, pick the most specific in the order transactional > commercial > reviews > navigational > informational.

## Step 6 — Theme + intent clustering

Algorithm:

1. **Tokenization**: for each fan-out, extract the significant tokens (words ≥ 4 characters, excluding FR/EN stop-words, normalized without accents and lowercased).
2. **Thematic grouping**: group the fan-outs that share at least **2 significant tokens in common**, or a rare salient token (appearing in < 30% of the fan-outs).
3. **Intent sub-cluster**: within a thematic cluster, if several intents coexist with comparable frequency (each ≥ 20% of the cluster), split into sub-clusters by intent. Otherwise, keep the dominant intent for the whole cluster.
4. **Cap at 15 clusters**: if more than 15 clusters emerge, merge the smallest into a `divers` cluster or drop those with cumulative freq < 2.
5. **For each cluster, compute**:
   - `theme`: the most salient and representative token (not a stop-word)
   - `intent`: dominant intent
   - `cumulativeFrequency`: sum of the `occurrences` of the cluster's fan-outs
   - `llmsConcerned`: union of the LLMs (e.g. `["CHATGPT", "PERPLEXITY"]`)
   - `promptIds`: deduplicated union
   - `coverageStatus`: `tracked` if ≥ 1 parent prompt of the cluster is in the tracked set, `untracked` otherwise
   - `seedSuggested`: the title of the cluster's most frequent fan-out, **simplified** (remove competitor brand mentions, remove marketing superlatives like "best", keep a neutral phrasing usable as a DataForSEO seed)
   - `suggestedCommand`: depending on intent and status, propose:
     - `transactional` or `commercial` → `/mentionable-pillar "<seedSuggested>" --project-slug <projectSlug>`
     - `informational` with high LLM volume → `/mentionable-pillar "<seedSuggested>" --project-slug <projectSlug>`
     - `informational` with low LLM volume (<5) → `/mentionable-brief "<seedSuggested>"`
     - `navigational` → `/mentionable-article` directly (short targeted page)
6. **Sort**: by descending `cumulativeFrequency`.

## Step 7 — Writing the files

Folder: `projects/<projectSlug>/discovery/<today>/`

### 7.1 — `clusters.json` (machine-readable)

```json
{
  "projectId": "<projectId>",
  "projectName": "<projectName>",
  "projectSlug": "<projectSlug>",
  "snapshotDate": "<today>",
  "generatedAt": "<ISO datetime>",
  "totalFanOutsAnalyzed": <int>,
  "totalClustersFound": <int>,
  "clusters": [
    {
      "id": "cluster-1",
      "rank": 1,
      "theme": "<salient token>",
      "intent": "informational|commercial|transactional|navigational|reviews",
      "cumulativeFrequency": <int>,
      "llmsConcerned": ["CHATGPT", "PERPLEXITY"],
      "coverageStatus": "tracked|untracked",
      "seedSuggested": "<seed ready to pass to /mentionable-pillar>",
      "suggestedCommand": "/mentionable-pillar \"<seed>\" --project-slug <projectSlug>",
      "fanOuts": [
        { "query": "<query>", "occurrences": <int>, "llms": [...], "promptIds": [...] }
      ],
      "promptIds": [...]
    }
  ]
}
```

### 7.2 — `clusters.md` (human-readable)

```markdown
# Discovery clusters — <projectName>

> Snapshot of <today> · <totalFanOutsAnalyzed> fan-outs analyzed · <totalClustersFound> clusters

## TL;DR

- **Top cluster**: `<theme #1>` (<intent>, freq=<X>, <coverageStatus>) — suggested seed: `<seedSuggested>`
- **<N> uncovered clusters** (GEO priority)
- **<N> tracked but under-served clusters**

## Top 5 clusters to attack

| Rank | Theme | Intent | Cumulative freq | LLMs | Coverage | Suggested command |
|---|---|---|---|---|---|---|
| 1 | `<theme>` | <intent> | <X> | <llms> | <status> | `/mentionable-pillar "<seed>" --project-slug <slug>` |
| ... | | | | | | |

## Detail per cluster

### Cluster #1 — <theme>

- **Intent**: <intent>
- **Cumulative frequency**: <X> occurrences across <N> fan-outs
- **LLMs**: <list>
- **Coverage**: <status>
- **Suggested seed**: `<seedSuggested>`
- **Command**: `<suggestedCommand>`

**Representative fan-outs**:

| Query | Occurrences | LLMs |
|---|---|---|
| <query> | <int> | <llms> |
| ... | | |

### Cluster #2 — ...

(repeat)

---

## Limits of this snapshot

- <N> fan-outs seen out of <totalCount> available (paginate if totalCount > 100)
- <other caveats>
```

### 7.3 — `fan-outs-raw.json`

The raw output of `list_fan_outs` (the data you retrieved in step 3), for later audit and to allow `/mentionable-pillar --from-cluster` to re-read it without re-calling MCP.

## Step 8 — Console summary

Show in the chat:

```
✅ Snapshot generated: projects/<projectSlug>/discovery/<today>/
   Project: <projectName>
   <totalFanOutsAnalyzed> fan-outs · <totalClustersFound> clusters

🎯 Top 5 clusters (by cumulative LLM frequency):

1. <theme> [<intent>, freq=<X>, <status>]
   → /mentionable-pillar "<seed>" --project-slug <projectSlug>

2. <theme> [<intent>, freq=<X>, <status>]
   → /mentionable-pillar "<seed>" --project-slug <projectSlug>

3. ... (etc.)

📊 Breakdown:
   - <N> informational clusters
   - <N> commercial / transactional clusters
   - <N> untracked clusters (GEO priority)

Next recommended run: in 2-4 weeks to observe how the fan-outs evolve.
```

## Strict rules

- **No invention**: the clusters and suggested seeds come ONLY from the real fan-outs collected. No guessed seed, no theoretical cluster.
- **Simplified seed**: a `seedSuggested` must be a neutral search term (2-5 words), not a full sentence. Remove brand mentions, marketing superlatives ("best", "top"), regional modifiers unless central to the theme.
- **Reasonable cap**: 15 clusters max. Beyond that, the report becomes unreadable. Merge small clusters into `divers` or drop them.
- **Persistence**: NEVER delete an existing snapshot without asking for confirmation. History is the primary value of this command.
- **Confidentiality**: `projects/` is globally gitignored. Fan-outs contain client data — no leak.

## Suggested downstream chaining

Once `clusters.json` is produced, the workflow continues manually:

1. The user picks a cluster (visually, from `clusters.md`)
2. They run the suggested command. For pillar+satellites:
   ```
   /mentionable-pillar "<seedSuggested>" --project-slug <projectSlug> --from-cluster projects/<projectSlug>/discovery/<today>/clusters.json#cluster-1
   ```
   The `--from-cluster` flag lets `/mentionable-pillar`:
   - skip the project selection (deduced from the path)
   - reuse the already-collected fan-outs (skip the list_fan_outs call in step 4)
   - reference the source cluster in the `plan.md` (traceability)
3. Then `/mentionable-article projects/<projectSlug>/pillars/<slug>` to generate the content.

See [playbooks/12-clusters-discovery.md](../../playbooks/12-clusters-discovery.md) for the detailed workflow.
