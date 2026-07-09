# Mentionable Playbook

> The open-source playbook for **actionable GEO** from Claude Code, Cursor or Claude Desktop. From raw LLM signal to published article, in 5 chainable commands.

[Mentionable](https://mentionable.ai) is a **GEO (Generative Engine Optimization)** platform: tracking, measuring and building visibility inside LLMs (ChatGPT, Perplexity, Gemini, Claude, Google AIO/AI Mode, Copilot, Grok).

The **Mentionable MCP** exposes this data to an AI agent. This repo ships **12 ready-to-use slash commands** and their detailed playbooks. Everything is scoped per client project, persisted to disk, and designed to chain together naturally.

## Who is it for?

- **Freelance SEO consultant** — audit a new client in 2 minutes, deliver an automated weekly report, produce publish-ready pillars.
- **In-house SEO** — monitor your company's GEO visibility, prioritize content and backlinks from real LLM signal.
- **SEO agency** — industrialize diagnosis and production across N clients, each filed in its own project folder.
- **Web agency** — offer a credible GEO service without building the tooling yourself.

## Practical use cases

### 1. You take on a new SEO client (3 days)

```
Day 1 — Diagnosis
  /mentionable-audit                        → exec-ready GEO audit
  /mentionable-sov                          → Share of Voice by LLM
  /mentionable-reverse <competitor>         → reverse engineering a dominant player

Day 2 — Content strategy
  /mentionable-clusters                     → topic clusters from fan-outs
  /mentionable-pillar "<top cluster seed>"  → pillar+satellites plan (DataForSEO + LLM)
  /mentionable-content-gap                  → complementary editorial backlog

Day 3 — Production
  /mentionable-article <pillar plan>        → full Princeton GEO article + JSON-LD
  /mentionable-images <article>             → 4 visuals (cover + social + flat)
```

Deliverables handed to the client: exec-ready audit, 10+ article editorial plan, first publishable article. Everything sits under `projects/<client>/`, ready to back up.

### 2. You want to produce 5 GEO-optimized articles for your site

```
/mentionable-clusters                       → pick 5 uncovered clusters
for cluster in top5:
  /mentionable-pillar "<seed>" --from-cluster <path>
  /mentionable-article <plan>
  /mentionable-images <article>
```

Each article includes a TL;DR, FAQ, sourced citations, statistics, JSON-LD (`Article` + `FAQPage` + `BreadcrumbList`), and an audit trail of the fetched sources. AI-detection avoidance is applied automatically via [`CLAUDE.md`](CLAUDE.md).

### 3. You do weekly client reporting

```
/mentionable-weekly                         → automated weekly report
/mentionable-reddit-triage                  → Reddit outreach opportunities
/mentionable-backlinks                      → prioritized backlink buying plan
```

3 exec-ready deliverables in 5 minutes, ready to send to the client as a PDF or over Slack.

### 4. You refresh a client's strategy every 2 months

```
/mentionable-clusters <project>             → new dated snapshot
```

The dated history under `discovery/<date>/` lets you track how LLM fan-outs evolve month over month (new themes, rising frequency, emerging competitors).

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/mentionable-ai/mentionable-playbook.git
cd mentionable-playbook

# 2. Install the Mentionable MCP (see docs/getting-started.md)

# 3. Optional: npm install if you want DataForSEO (/mentionable-pillar) or Gemini (/mentionable-images)
npm install

# 4. Open the repo in Claude Code and pick your entry point:
#    - Getting to know a client project:  /mentionable-audit
#    - You want to produce content:        /mentionable-clusters
```

If you don't have Claude Code, every playbook includes the **full copy-paste prompt** for Cursor, Claude Desktop or any other MCP-compatible client.

## The 12 commands, by workflow phase

### 🔍 Diagnosis & analysis

| #  | Command                                                                        | For whom               | Deliverable                                  |
| -- | ------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| 1  | [`/mentionable-audit`](.claude/commands/mentionable-audit.md)                  | Everyone, day 1        | Full exec-ready GEO audit                    |
| 2  | [`/mentionable-sov`](.claude/commands/mentionable-sov.md)                      | Consultant, agency     | Share of Voice by LLM + heatmap              |
| 3  | [`/mentionable-reverse`](.claude/commands/mentionable-reverse.md)              | Everyone               | Reverse engineering of a competitor          |
| 4  | [`/mentionable-content-gap`](.claude/commands/mentionable-content-gap.md)      | SEO content, in-house  | Editorial backlog from fan-outs              |
| 5  | [`/mentionable-clusters`](.claude/commands/mentionable-clusters.md)            | SEO content, agency    | Fan-out clusters by theme + intent, gateway to `/mentionable-pillar` |

### ✍️ Content production

| #  | Command                                                                        | For whom               | Deliverable                                  |
| -- | ------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| 6  | [`/mentionable-pillar`](.claude/commands/mentionable-pillar.md)                | SEO content, agency    | SEO+GEO pillar+satellites plan (DataForSEO × LLM) |
| 7  | [`/mentionable-brief`](.claude/commands/mentionable-brief.md)                  | Writers, content       | Full article brief                           |
| 8  | [`/mentionable-article`](.claude/commands/mentionable-article.md)              | Writers, content       | Full GEO-optimized article (Princeton) + JSON-LD |
| 9  | [`/mentionable-images`](.claude/commands/mentionable-images.md)                | Content, writers       | 4 article images via Gemini (cover, social, flat) |

### 🔗 Outreach & link building

| #  | Command                                                                        | For whom               | Deliverable                                  |
| -- | ------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| 10 | [`/mentionable-reddit-triage`](.claude/commands/mentionable-reddit-triage.md)  | Community, growth      | Weekly triage of Reddit opportunities        |
| 11 | [`/mentionable-backlinks`](.claude/commands/mentionable-backlinks.md)          | Link builder, agency   | Prioritized backlink buying plan             |

### 📊 Reporting

| #  | Command                                                                        | For whom               | Deliverable                                  |
| -- | ------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| 12 | [`/mentionable-weekly`](.claude/commands/mentionable-weekly.md)                | Consultant, freelance  | Weekly client report                         |

Each command has its **equivalent .md playbook** in [`playbooks/`](playbooks/) with context, raw prompt, sample deliverable and variants.

## Full workflow: from LLM signal to published article

```
/mentionable-clusters <project>
       ↓ projects/<project>/discovery/<date>/clusters.json (seeds ready, dated)
       ↓
       ↓ pick a cluster
       ↓
/mentionable-pillar "<seed>" --from-cluster <path>
       ↓ projects/<project>/pillars/<seed>/plan.md (pillar + N SEO×GEO satellites)
       ↓
/mentionable-brief "<title>"  [optional, to brief a human writer]
       ↓
/mentionable-article <path>
       ↓ projects/<project>/articles/<slug>/article.md (+ jsonld.json + sources.json + meta.json)
       ↓
/mentionable-images <article>
       ↓ projects/<project>/articles/<slug>/images/{1-cover, 2-3-illustration, 4-illustration-flat}.png
       ↓
[publication]
```

The pipeline is **modular**: each step produces a reusable file, each can be re-run independently, and everything is traced in the filesystem under `projects/<project>/`.

## Built-in quality guarantees

This repo isn't just a set of prompts. It builds in 4 mechanisms that make production reliable and auditable:

1. **GEO tactics validated by academic research** — `/mentionable-article` applies the 4 tactics measured by the Princeton study ["GEO: Generative Engine Optimization"](https://arxiv.org/abs/2311.09735) (Aggarwal et al., KDD 2024): `Cite_Sources` (+30-40%), `Quotation_Addition` (+25-35%), `Statistics_Addition` (+25-30%), `Fluency_Optimization` (+15-25%). Counters shown in the final summary.

2. **Strict AI-detection avoidance** — [`CLAUDE.md`](CLAUDE.md) loads automatically in every conversation: em-dashes banned, ~25 AI-typical words/phrases blacklisted, detectable patterns (triple anaphora, "not X but Y" in bursts) capped. Blocking QA check before the article is written.

3. **Anti-hallucination via fetched sources** — `/mentionable-article` fires 3-5 parallel `WebFetch` calls on the brief's authority sources to pull real stats and quotes. The `sources.json` file keeps the audit trail of the URLs actually used.

4. **SERP × LLM cross-signal** — `/mentionable-pillar` crosses DataForSEO (Google volume, top 10 SERP, KD) with the Mentionable MCP (LLM fan-outs per cluster, tracked competitors, LLM authority sources) to tell genuine double signals apart from SERP-only or GEO-only opportunities.

## Mentionable project convention

All deliverables are scoped per Mentionable project under `projects/<project-slug>/` (slug derived from the name fetched via the MCP). A `.project.json` file at the project level stores `projectId` + `projectName` so downstream commands find the project again without asking twice. It also holds a `language` field (default `en`) that sets the language of every deliverable the command produces (report, article, brief, outreach); set it to `fr` or another language code per client.

A **`value-proposition.md`** file (optional but recommended) at the project level acts as the **product source of truth**: one-liner, problem solved, USP / differentiators, ICP / personas, named competitors, benefits, honest scope. When present, the content commands read it to contextualize their output: `/mentionable-article` (ICP framing, product mention + CTA, terminology consistency), `/mentionable-brief` (differentiating angles, GEO signal), `/mentionable-pillar` (satellite prioritization by ICP fit), `/mentionable-content-gap` (product-fit multiplier in scoring) and `/mentionable-outreach` (product description + USP in messages). When absent, each command carries on normally and says so.

```
projects/
└── my-client/
    ├── .project.json
    ├── value-proposition.md  ← product source of truth (optional, read by content commands)
    ├── editorial-calendar.json ← dated schedule (publishDate → frontmatter date:), generated by scripts/editorial-calendar.mjs
    ├── editorial-calendar.md   ← readable calendar
    ├── discovery/
    │   └── 2026-05-11/
    │       ├── clusters.json     ← seeds ready, machine-readable
    │       ├── clusters.md       ← human-readable report
    │       ├── coverage-gap.md   ← uncovered themes = future backlog
    │       └── fan-outs-raw.json ← audit trail
    ├── pillars/
    │   └── communication-non-violente/
    │       ├── brief.json        ← DataForSEO output
    │       └── plan.md           ← pillar+satellites plan
    └── articles/
        └── cnv-au-travail/
            ├── article.md        ← frontmatter + GEO body
            ├── jsonld.json       ← Article + FAQPage + BreadcrumbList
            ├── sources.json      ← citation audit trail
            ├── meta.json         ← wordCount, h2Count, …
            └── images/
                └── 1-cover.png
```

The `projects/` folder is **gitignored by default** (confidential client content). For multi-client agency use, each subfolder is trivial to back up/share/hand off in isolation (`tar czf my-client.tar.gz projects/my-client/`).

## Requirements per command

| Command | Requirements | Indicative cost |
|---|---|---|
| `/mentionable-audit`, `-sov`, `-reverse`, `-content-gap`, `-clusters`, `-brief`, `-reddit-triage`, `-backlinks`, `-weekly` | Mentionable MCP installed | Free (just MCP calls) |
| `/mentionable-pillar` | + Node ≥ 18 + [DataForSEO](https://app.dataforseo.com) account ($1 free) | ~$0.05-0.15 per run |
| `/mentionable-article` | + web access (WebFetch) | Free on the third-party API side |
| `/mentionable-images` | + Node ≥ 18 + [Google Gemini](https://aistudio.google.com/apikey) key (billing enabled) | ~$0.04-0.20 for 4 images |

Detailed setup: [docs/getting-started.md](docs/getting-started.md) · [docs/dataforseo-setup.md](docs/dataforseo-setup.md) · [docs/images-setup.md](docs/images-setup.md) · [docs/gemini-api-key.md](docs/gemini-api-key.md).

## Documentation

- [Getting started](docs/getting-started.md) — install the MCP, create a project, first calls
- [GEO concepts](docs/concepts.md) — fan-outs, citations, Share of Voice, vocabulary
- [Tools reference](docs/tools-reference.md) — cheatsheet of the 12 MCP tools
- [Images setup](docs/images-setup.md) — configure Gemini for `/mentionable-images`
- [Create a Gemini key with billing](docs/gemini-api-key.md) — AI Studio / GCP Console walkthrough
- [DataForSEO setup](docs/dataforseo-setup.md) — configure DataForSEO for `/mentionable-pillar`
- [CLAUDE.md](CLAUDE.md) — anti-AI-detection style guidelines (loaded automatically)

## Contributing

Got a GEO workflow that works well with your clients? Open a PR.
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — use, fork and adapt it for your clients without restriction.

---

**Maintained by** [Mentionable](https://mentionable.ai)
