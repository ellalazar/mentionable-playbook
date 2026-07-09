# Tools reference — Mentionable MCP

Cheatsheet of the 12 tools exposed by the MCP. For each tool: what it's for, its key inputs, and which playbook(s) it's used in.

## Discovery

### `list_projects`

Lists the projects accessible with the current API key.

| Input | Optional | Note |
|---|---|---|
| `filters.nameContains` | Yes | Search by partial name |
| `sortBy` | Yes | `recent` (default), `oldest`, `alphabetical` |
| `limit`, `cursor` | Yes | Pagination, max 100 |

**Used in**: every playbook (entry point).

### `list_prompts`

Lists a project's tracked prompts, with mention stats and **visibility per LLM**.

| Input | Note |
|---|---|
| `projectId` | Required |
| `filters.categoryIds`, `filters.personaIds` | Segmented filtering |
| `filters.country` | ISO 2-letter code |
| `filters.isActive`, `filters.textContains` | Additional filters |

**Used in**: `audit`, `sov`, `weekly`, `content-gap`.

## GEO measurement

### `list_competitors`

Tracked competitors with total mentions and presence per LLM (Share of Voice).

| Input | Note |
|---|---|
| `filters.status` | `CONFIRMED`, `SUGGESTED`, `REJECTED` |
| `sortBy` | `mentions_desc` (default), `recent`, `alphabetical` |
| `filters.minMentions` | Filter out noise |

**Used in**: `audit`, `sov`, `reverse`, `weekly`.

### `list_llm_sources`

Domains appearing in LLM answers (cited, consulted, fan-out).

| Input | Note |
|---|---|
| `filters.appearanceTypes` | `cited`, `consulted`, `fan_out` |
| `filters.llms` | Filter by LLM (ChatGPT, Perplexity, etc.) |
| `filters.dateRange` | Analysis period |
| `sortBy` | `appearances_desc`, `cited_desc`, `fan_out_desc`, `recent` |

**Used in**: `audit`, `reverse`, `backlinks`, `content-gap`.

## Reverse engineering

### `list_competitor_sources`

For a given competitor, the domains that cite it in LLMs (with top URLs and example context).

| Input | Note |
|---|---|
| `competitorId` | Required |
| `filters.minMentions` | Filter out noise |
| `sortBy` | `mentions_desc` (default), `recent` |

**Used in**: `reverse`, `backlinks` (outreach targets).

### `list_fan_outs`

The queries LLMs run behind the scenes to answer the tracked prompts. Deduplicated, ranked by frequency.

| Input | Note |
|---|---|
| `filters.search` | Text search |
| `filters.promptId` | Fan-outs for a specific prompt |
| `filters.llm` | By LLM |
| `sortBy` | `frequency` (default), `recent` |

**Used in**: `audit`, `content-gap`, `brief`.

## Reddit (GEO workflow)

### `list_reddit_threads`

Reddit threads cited by LLMs with GEO signals (citations, web searches, LLMs touched) + scraped content if enriched.

| Input | Note |
|---|---|
| `filters.status` | `NEW`, `ENRICHING`, `ENRICHED`, `COMMENTED`, `SKIPPED`, `DELETED` |
| `filters.subredditContains` | Target a subreddit |
| `filters.enrichedOnly` | Keep only threads with scraped content |
| `sortBy` | `score_desc`, `recent`, `citations_desc` |

**Used in**: `reddit-triage`.

### `enrich_reddit_thread`

Kicks off the Bright Data scraping of a Reddit thread (title, body, top comments). **Charges AI credits**. Asynchronous (1-3 min).

| Input | Note |
|---|---|
| `redditPostId` | Required |
| Idempotent | Re-calling doesn't re-charge if already in progress |

**Used in**: `reddit-triage`.

### `get_reddit_thread`

Polls a thread after `enrich_reddit_thread`. Returns the current status + scraped content if available.

**Used in**: `reddit-triage`.

### `bulk_update_reddit_thread_status`

Bulk update (max 50) of thread status. User statuses: `NEW`, `COMMENTED`, `SKIPPED`.

**Used in**: `reddit-triage`.

## Acquisition

### `list_backlink_opportunities`

Domains where buying a backlink could improve GEO visibility, with impact score and marketplace offers.

| Input | Note |
|---|---|
| `filters.providers` | Filter by marketplace |
| `filters.priceMin`, `filters.priceMax` | Budget |
| `filters.minImpactScore` | Filter out low impact |
| `filters.hasOffer` | Keep only buyable domains |
| `sortBy` | `impact_score_desc`, `cheapest_offer`, `best_impact_price_ratio`, `recent` |

**Used in**: `backlinks`.

## Hygiene / workflow

### `bulk_update_competitor_status`

Bulk update (max 50) of competitor status: `CONFIRMED`, `REJECTED`, `SUGGESTED`.

**Used in**: optional — can be grafted into `audit` or a future `competitor-triage`.

## Usage patterns

### Pagination

All `list_*` tools support `cursor` + `limit`. To iterate:

```
1. Call without cursor → response contains `nextCursor`
2. Call with cursor: <nextCursor> → next page
3. Stop when no `nextCursor` is returned
```

### Parallelization

MCP calls on different tools are **independent**: on Claude Code, they can be fired in parallel within the same turn to save time (typically in `audit`: 4 calls in parallel).

### CUID format

The `projectId`, `competitorId`, `redditPostId`, etc. are in **CUID** format (they start with `c`, e.g. `clxyz1234abcd`). If you handle these IDs manually, check the format.
