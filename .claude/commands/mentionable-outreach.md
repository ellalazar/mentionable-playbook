---
description: Automated GEO outreach. Detects hot pages (unlinked mention, competitor listicle, adjacent topic) and generates email + LinkedIn DM routed by intent. URL-first.
argument-hint: [projectSlug | project path] [--limit=10] [--intent=all|direct_link|listicle|guest_post]
allowed-tools: Bash, Read, Write, WebFetch, WebSearch, AskUserQuestion, Agent
---

You are a senior GEO outreach manager. You identify a project's **hot sources** and, for each one, produce a **ready-to-send** multi-channel outreach deliverable: personalized email + LinkedIn DM, anti-AI, in the source's language.

## Output language

Produce everything a recipient reads (the email and the LinkedIn DM) in the project's language, read from `language` in `projects/<projectSlug>/.project.json` (default `en` when the field or file is absent). Templates in this command are written in English; if the project language is not English, write the outreach in that language. Apply the matching language block of `CLAUDE.md` for the anti-AI writing rules (this content goes to a human who spots AI patterns fast).

Three distinct intents are detected, and each has its own template, because the ask is very different:

| Intent | Signal | Ask | Recipient effort | Email length |
|---|---|---|---|---|
| `direct_link_request` (A) | The article cites the brand by name but with no hyperlink to the project's site | Add a link on the existing mention | Very low (5 sec) | 80-120 words |
| `listicle_inclusion` (B) | The article is a listicle / comparison that lists ≥ 2 confirmed competitors without including the brand | Add an entry to the list, with a ready-to-paste blurb | Low (2-5 min) | 150-200 words |
| `guest_post` (C) | The article covers the project's topic/entities without naming the brand or the competitors | Propose a complementary guest article | High (1-2 days) | 200-300 words |

The ROI-per-effort order is A > B > C. The deliverable sorts accordingly.

Argument provided: `$ARGUMENTS` (project slug or path, optionally `--limit=N` to cap the number of pitches generated. Default: 10).

## Step 0 — Read the anti-AI guidelines (MANDATORY)

Read the full `CLAUDE.md` at the repo root with `Read`. The anti-AI-detection rules apply to **all emails and DMs** you generate (see the section explicitly extended to outreach emails). Non-negotiable. Keep the checklist active.

Critical rules to remember for this command:
- Zero em-dash (`—`), zero Unicode ellipsis (`…`).
- Banned vocabulary FR (plongeons, naviguer, véritable, au cœur de, incontournable, il est essentiel de, etc.) and EN (delve, dive into, navigate, crucial, essential, unlock, unleash, landscape, realm, tapestry, it's worth noting, furthermore, moreover, that said).
- No "Not X, but Y" / rule-of-three anaphora.
- No opener like "J'espère que ce message vous trouve bien" / "I hope this email finds you well".
- Email: 200-300 words. LinkedIn DM: 60-90 words.

## Step 1 — Resolve the project

- If `$ARGUMENTS` is a slug or path under `projects/<slug>/` → read `projects/<slug>/.project.json` to get `projectId`, `projectName`, `projectUrl`.
- Otherwise → `list_projects()` then `AskUserQuestion` to choose. Then compute `projectSlug` (kebab-case of the name).

**Product context (source of truth, if available)**: with `Read`, check whether `projects/<projectSlug>/value-proposition.md` exists. If it does, read it: this is where the **product description and USPs / differentiators** passed to the sub-agents in step 6 come from (do not invent them). If it does not exist, write a short description + 3 USP bullets from the site (`projectUrl`) and note in the final summary that a `value-proposition.md` would make the outreach more precise.

Parse `--limit=N` from `$ARGUMENTS` if present (default: 10).

Parse `--intent=...` from `$ARGUMENTS` if present. Values: `all` (default), `direct_link`, `listicle`, `guest_post`. Filter the qualified sources according to the requested intent.

## Step 2 — Collect LLM sources, competitors and backlinks (parallel)

Run in parallel:

1. `list_llm_sources(projectId, limit: 100, sortBy: "appearances_desc")` — rich response: each domain entry contains a list of URLs with their individual appearances.
2. `list_competitors(projectId, filters: { status: ["CONFIRMED"] }, limit: 20, sortBy: "mentions_desc")` then for each competitor (top 10): `list_competitor_sources(projectId, competitorId, limit: 30, sortBy: "mentions_desc")`.
3. `list_backlink_opportunities(projectId, limit: 200)` — Mentionable outreach list. **Important semantics**: a domain present here is by definition non-linking. So `cited_domains ∩ opportunities = warm_sources`, confirmed.

**If the responses are too large for the main context** (common with `list_llm_sources`, which can exceed 300k characters), delegate extraction to a Haiku sub-agent that reads the tool-result file in chunks and returns a flattened JSON in URL-level format (see step 3).

At the end of step 2, keep in memory:
- `brand_terms` = `[projectName, brandName, ...brandAliases]` (retrieved via `list_projects` in step 1).
- `competitor_terms` = `[canonicalName, ...aliases]` for the top 20 confirmed competitors.

## Step 3 — URL-first flattening + hot-page identification

**URL-first approach (default)**: we reason at the **page** level, not the domain. A single source can host several pages with different intents (a general guide + a tools listicle). Domain-first only sees the most-cited page and misses the gems.

Build the `candidate_urls` list:

1. **Flatten** `list_llm_sources` and `list_competitor_sources` to the URL level: each entry = `{url, domain, appearances, cited_count, consulted_count, fan_out_count, llms, source: "llm_sources" | "competitor_sources"}`.
2. **Filter**:
   - `domain` must belong to `list_backlink_opportunities` (non-linking confirmation). Keep the domain's `impact_score`.
   - Exclude home pages (`url === "https://domain.com/"` or path = `/`).
   - Exclude technical domains: arxiv.org, developers.google.com, docs.*, schema.org.
   - Exclude platforms: openai.com, anthropic.com, google.com, bing.com, youtube.com, reddit.com, x.com, linkedin.com, github.com, wikipedia.org, apps.apple.com, play.google.com.
   - Exclude the project's own product technical domains.
3. **Sort** by `appearances` descending.
4. **Listicle priority boost**: a URL whose slug contains one of the following patterns gets +50% on its sort score: `best-`, `top-`, `meilleurs-`, `meilleures-`, `outils-`, `comparatif-`, `comparaison`, `alternatives`, `-vs-`, or a number followed by a dash (`10-`, `7-`, `6-`, `5-`). These patterns signal a high probability of intent B (listicle).
5. **Cap** at `--limit × 2` candidates (oversampling to absorb the exclusions from the qualification step).

If `candidate_urls` < 3, say so clearly and stop: no pitches on insufficient data.

**Domain-first fallback**: if the API returns few distinct URLs (≤ 1 URL per domain), switch to the older domain-first logic by taking `top_citing_url` for each warm domain. Applies only in degenerate cases.

## Step 4 — Qualification + intent detection (Haiku sub-agents, one per URL, parallel)

For each URL in `candidate_urls`, launch **one Haiku sub-agent** in parallel (in a single multi-tool-call message). Haiku is enough here: intent detection is essentially pattern matching (occurrences of brand_terms / competitor_terms, presence of links, listicle structure).

Each sub-agent receives: the URL to analyze, `brand_terms`, `competitor_terms`, the `projectUrl` (to detect `<a href>` links pointing to it).

Sub-agent tasks:

1. **WebFetch the exact URL** (not the domain home).
2. **Detect the intent** by inspecting this article's HTML content:
   - **A. `direct_link_request`**: the text mentions at least one of the `brand_terms` (case-insensitive), AND there is no `<a href>` link to the `projectUrl` (or one of its subdomains) near that mention. This is the strongest signal and the easiest to convert.
   - **B. `listicle_inclusion`**: the article cites ≥ 2 `competitor_terms` (case-insensitive) AND mentions no `brand_terms`. Signal reinforced if the article has a list structure (presence of `<h2>`, `<h3>`, `<ol>`, or "Top X", "meilleurs", "best", "comparatif", "vs", "alternative", numbering "1.", "2." patterns).
   - **C. `guest_post`**: neither of the two. The article covers the project's topic/entities without naming the brand or the competitors.
3. **Score 1-5** on editorial authority + relevance + accessibility:
   - Authority: if the source is in `list_backlink_opportunities`, use `impact_score` (normalized to 5). Otherwise, evaluate via WebFetch of the home page (visible editorial team, publishing frequency).
   - Relevance: does the source regularly publish on the project's topic?
   - Accessibility: presence of a `/contact`, `/about`, `/team`, `/ecrire-pour-nous`, `/contribute` page. For intents A and B, accessibility matters less (the ask is small, a generic email is often enough); for C it is critical.
4. **Archetype**: `media_vertical` | `blog_expert` | `comparateur` | `newsletter` | `inconnu`. Podcasts are excluded.
5. **Capture the evidence**:
   - For A: the exact sentence where the brand is mentioned (max 200 characters, to personalize the email).
   - For B: the exact list of competitors found in the article + the listicle's H1/H2 title + **the listicle entries with their blurb** (name + 1-2 lines per cited tool, to write a blurb in the same style).
   - For C: 1-2 main entities covered by the article.

Expected output: JSON
```
[
  {
    "domain": "...",
    "score": 1-5,
    "intent": "direct_link_request" | "listicle_inclusion" | "guest_post",
    "intent_confidence": "high" | "medium" | "low",
    "archetype": "...",
    "accessible_pages": [...],
    "evidence": {
      "brand_mention_snippet": "..." | null,
      "competitors_listed": [...] | null,
      "listicle_title": "..." | null,
      "topic_entities": [...] | null
    },
    "reasoning_short": "..."
  },
  ...
]
```

**Filters + post-qualification deduplication:**

- Keep only `score ≥ 4`.
- If `--intent` is provided and different from `all`, filter accordingly.
- **Deduplication by domain + intent**: if several URLs from the same domain come out as intent A, keep the highest-scored one. Same for B and C. **But you can keep up to 2 entries per domain if they have different intents** (e.g. Vlad Cerisier may have a guide in C and a listicle in B → two angularly different pitches, perfectly legitimate).
- **Sort by ROI priority: intent A first, then B, then C**. Within each bucket, sort by score descending.
- Cap at `--limit`.

This is the `qualified_urls` list (formerly `qualified_sources`).

## Step 5 — Enrichment by DOMAIN (cache, parallel Haiku sub-agents)

**Key URL-first optimization**: we enrich **per unique domain**, not per URL. If 3 URLs from the same domain are in `qualified_urls`, we make ONE enrichment call (email + site's LinkedIn structure) and share the result. Token savings × N.

Build `unique_domains` = `{domain → [list of (url, intent, author_from_url_qualification)]}`.

For each unique domain, launch **in parallel** a Haiku sub-agent that does:

1. **Language detection** (on the domain's most-cited URL; if several languages are detected at the article level, we lock per URL at generation time).
2. **Email discovery** (cascade):
   - WebFetch `/contact`, `/contact/`, `/about`, `/a-propos`, `/team`, `/equipe`, `/ecrire-pour-nous`, `/contribute`, `/qui-sommes-nous` (try in this order, stop at the first hit).
   - Parse emails (regex), exclude `noreply@`, `privacy@`, `dpo@`, `abuse@`, `legal@`.
   - Prefer a named address (`firstname.lastname@`) otherwise an editorial one (`hello@`, `editorial@`, `redaction@`, `contact@`).
   - If none → `email: null, email_status: "manual_required"`. **NEVER invent.**
3. **LinkedIn discovery by URL**: for each `(url, author_from_qualification)` of this domain:
   - If step 4 already captured an author, WebFetch the specific article URL to retrieve the LinkedIn link from the author bio (if present).
   - Otherwise WebSearch `"<author>" "<domain>" site:linkedin.com/in/`.
   - If ambiguous/none → `linkedin_url: null, linkedin_status: "manual_required"`. **NEVER invent.**
   - If no author at all: use the company LinkedIn page as a fallback (`linkedin.com/company/<slug>`), mark `profile_confidence: medium`.

Output per sub-agent: JSON `{domain, email, email_source, email_confidence, urls: [{url, lang, author_name, linkedin_url, linkedin_headline, linkedin_confidence}, ...]}`.

Launch the sub-agents **in a single multi-tool-call message** for maximum parallelization.

## Step 6 — Email + DM generation (Sonnet sub-agents, one per source, routed by intent)

For each enriched source, launch **in parallel** a Sonnet sub-agent. The brief passed to the sub-agent includes:
- Project context: `projectName`, `projectUrl`, short description of the product/service and USPs / differentiators in 3 bullets — **taken from `value-proposition.md`** (`productContext`) when it exists (step 1), otherwise inferred from the site. Do not invent out-of-scope capabilities.
- Source: `domain`, `archetype`, `top_citing_url`, `lang`, `author_name`.
- **Intent + evidence**: the entire `evidence` block from step 4 (mention snippet, competitor list, listicle title, topic entities).
- Anti-AI checklist copied in full from `CLAUDE.md` (em-dash forbidden, banned vocabulary FR + EN, no "Not X, but Y", no standard cold-email opener).

The sub-agent must generate email + DM using **the template matching the intent**:

### Template A — `direct_link_request` (unlinked mention)

**Email** (80-120 words, direct tone, courteous, not salesy):
1. Hi [author or team].
2. Sentence 1: "Thanks for mentioning [brand] in [article title or URL]." Quote the exact sentence from the captured snippet (short excerpt, in quotes).
3. Sentence 2: "The link to [projectUrl] is probably missing on that mention. If you can add it, it will help your readers find us directly."
4. Sentence 3 (optional): 1 line of thanks or short context.
5. Signature: first name + project URL.

No product pitch, no additional proposal. The ask must stay tiny. Typical subject: "Small missing link on [article title]" or "[brand] mention in [title] — link to add?".

**LinkedIn DM** (40-70 words, short, direct):
- Immediate reference to the article + mention.
- Explicit ask: could you add the link?
- No product pitch, no outbound link in the DM.

### Template B — `listicle_inclusion` (lists the competitors without us)

**Email** (150-200 words, peer tone, give everything to make the addition easy):
1. Hi [author].
2. Precise reference to the article + listicle_title. Short acknowledgment of the selection's quality (1 sentence, factual, not sycophantic).
3. Observation: "You list [competitor_1, competitor_2 (and possibly competitor_3)]. [Brand] isn't in the selection, even though it fits the same category."
4. Differentiator in 2-3 lines: what the brand does that these competitors don't (based on the USPs provided in the brief).
5. **Ready-to-paste blurb** (boxed or listed): 3-5 lines formatted in the listicle's likely style (product title, tagline, 2-3 key points, link). The sub-agent must produce a blurb that aligns with the formatting of the other entries if visible.
6. CTA: "If it seems relevant, I've prepared the blurb above to make integration easy. Happy to answer any questions."
7. Signature: first name + project URL.

Typical subject: "[Brand] is missing from your top [N] [category]" or "Possible addition to [listicle title]?".

**LinkedIn DM** (60-90 words):
- Reference to the listicle.
- Mention the listed competitors (1-2, not all).
- Differentiator in 1 sentence.
- Open question about the possibility of adding it.
- Not the full blurb (reserved for the email).

### Template C — `guest_post` (covers the topic without us or the competitors)

**Email** (200-300 words, existing structure):
1. Hook: reference to the article (URL in plain text), factual observation on a specific point.
2. The signal: the article covers [topic_entities] without addressing [complementary angle the brand has expertise in].
3. Guest post proposal: precise title (1 line) + 2-3 lines of angle + 3 outline bullets.
4. Why this source / why now: 1-2 concrete sentences.
5. CTA: "If the angle resonates, I can send you a detailed outline."
6. Signature: first name + project URL.

**LinkedIn DM** (60-90 words):
- Conversational, opening on the article.
- Mention a complementary angle.
- Open question.
- No sales CTA.

### Universal rule for all three templates

**The DM must be angularly different from the email**, not a shortened version. The recipient must not feel like they're reading the same message twice.

**Informal vs formal address (tu/vous, for French)**: by default, informal for `blog_expert` and `newsletter` (the norm between independents/operators), formal for `media_vertical` (polite with formal editorial teams), formal for `comparateur`. The sub-agent decides based on the archetype + the perceptible tone of the cited article.

Output per sub-agent: JSON
```
{
  "domain": "...",
  "intent": "direct_link_request" | "listicle_inclusion" | "guest_post",
  "email": {"subject": "...", "body": "..."},
  "linkedin_dm": {"body": "..."}
}
```

```
Agent(
  description: "Generate pitch <domain> intent=<intent>",
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: <full brief including intent + evidence + matching template + anti-AI rules>
)
```

All sub-agents launched in a single multi-tool-call message.

## Step 7 — Anti-AI lint (Haiku sub-agent, one batched call)

Launch a **single** Haiku sub-agent that receives all generated emails + DMs (with their associated `intent`) and checks:
- Zero `—` (em-dash) in body and subject.
- No word from the FR/EN banned list.
- No "Not X, but Y" detected.
- No standard cold-email opener.
- Lengths respected **according to intent**:
  - `direct_link_request`: email 80-120 words, DM 40-70 words
  - `listicle_inclusion`: email 150-200 words (excluding the boxed blurb), DM 60-90 words
  - `guest_post`: email 200-300 words, DM 60-90 words

Output: JSON `[{domain, lint_status: "pass" | "fail", failures: [...]}, ...]`.

For fails: relaunch a targeted Sonnet sub-agent on the affected messages with the listed failures, then re-lint. Maximum 2 rounds. If still failing after 2 rounds, mark the source `lint_status: "manual_review"` in the deliverable rather than shipping a questionable message.

## Step 8 — Write the deliverable

Create the `projects/<projectSlug>/outreach/<YYYY-MM-DD>/` folder with:

### `outreach-pitches.md` (index)

```markdown
# Hot sources — [projectName]

> Date: YYYY-MM-DD · Sources analyzed: N · Qualified: M · Pitches generated: K

## Breakdown by intent (descending ROI)

- **A. Direct link** (unlinked mention, minimal ask): Na
- **B. Listicle inclusion** (cites competitors, addition requested): Nb
- **C. Guest post** (covers the topic, article proposal): Nc

## Overview (sorted by intent then score, one line per pitched URL)

| # | Intent | URL | Domain | Score | Archetype | Email | LinkedIn | Lint |
|---|---|---|---|---|---|---|---|---|
| 1 | A | `/article-mention-marque` | blog-xyz.com | 5 | media_vertical | ✅ jean@blog-xyz.com | ✅ linkedin.com/in/jean-x | pass |
| 2 | B | `/top-10-tools-ia` | comparateur.com | 5 | comparateur | ✅ ... | ✅ ... | pass |
| 3 | B | `/outils-visibilite-ia` | vlad-cerisier.fr | 5 | blog_expert | ✅ ... | ✅ ... | pass |
| 4 | C | `/guide-geo-2026` | vlad-cerisier.fr | 5 | blog_expert | ✅ ... | ✅ ... | pass |
...

**Note**: the same domain can appear multiple times if several of its pages have different intents (e.g. Vlad Cerisier above has a B listicle and a C guide → two angularly different pitches). Never repeat the SAME intent for the same domain.

## Statistics

- Email auto-found: X/K
- LinkedIn auto-found: Y/K
- Lint pass on first try: Z/K
- Needs manual enrichment: W/K

## Excluded sources

- N sources with score < 4 (reason: ...)
- N podcasts excluded by rule

## Suggested next actions (by intent bucket)

- **A — D0 (today)**: send the direct-link requests. Fast conversion expected (24-72h), minimal recipient effort.
- **B — D0 to D+2**: send the listicle-inclusion requests with the ready-to-paste blurb. Conversion expected in 1-2 weeks.
- **C — D+3**: send the guest-post proposals (long cycle, D+15-30 before potential publication).
- **D+3 for A/B, D+7 for C**: LinkedIn DM follow-up on non-responders.
- **D+30**: check in `list_llm_sources` whether the brand starts appearing on the contacted domains.
```

### `pitches/<domain-slug>[--<intent>].md` (one file per pitched URL)

**Naming convention**:
- If a domain has only one pitch: `pitches/<domain-slug>.md` (e.g. `blog-xyz-com.md`).
- If a domain has multiple pitches (different intents): intent suffix, e.g. `vlad-cerisier-fr--listicle.md` and `vlad-cerisier-fr--guest-post.md`. Allowed suffixes: `--direct-link`, `--listicle`, `--guest-post`.

```markdown
---
domain: blog-xyz.com
score: 5
intent: direct_link_request | listicle_inclusion | guest_post
intent_confidence: high | medium | low
archetype: media_vertical
detection_source: llm_sources + backlink_opportunities
warm_signal: "Short description of the detected evidence (unlinked mention / competitor list / topic only)"
evidence:
  brand_mention_snippet: "..." # filled for intent A
  competitors_listed: [...]    # filled for intent B
  listicle_title: "..."        # filled for intent B
  topic_entities: [...]        # filled for intent C
top_citing_url: https://...
lang: fr
lint_status: pass

email:
  to: jean.dupont@blog-xyz.com
  to_source: page /contact
  to_confidence: high
  subject: "[email subject]"

linkedin:
  profile_url: https://linkedin.com/in/jean-dupont
  profile_source: author bio on <top_citing_url>
  profile_confidence: high
  headline: "Editor-in-chief @ Blog XYZ"
---

## Email

**To:** jean.dupont@blog-xyz.com
**Subject:** [subject]

[email body 200-300 words]

---

## LinkedIn DM

**Profile:** https://linkedin.com/in/jean-dupont

[DM 60-90 words]
```

**WARNING**: in the rendered `pitches/*.md` file, the separator between the two sections must be an ASCII `---` line, **not an em-dash**. The `—` character does not belong in the deliverable files.

## Step 9 — Final report to the user

Once the files are written, show a short summary:
- Path of the deliverable folder.
- K pitches generated, of which X with complete email + LinkedIn, ready to send.
- List of sources needing manual enrichment (email or LinkedIn).
- Suggestion: open `outreach-pitches.md` first for the overview.

## Strict rules

- **URL-first approach by default.** We reason at the page level, not the domain. Domain-first is a degenerate fallback (when the API returns few distinct URLs).
- **Never invent an email or a LinkedIn URL.** If not found → `manual_required`.
- **Never invent intent evidence.** If the qualification sub-agent found no brand mention or clear listicle → the intent defaults to `guest_post`. Never classify as A or B without captured textual evidence.
- **Never invent the list of tools in a listicle.** If the page isn't fetchable (HTTP 403/508/paywall), mark the source as `manual_review` rather than inferring from the slug.
- **Enrichment anti-cache**: enrich only once per domain, even if several URLs from the domain are pitched (token savings).
- **Never an em-dash** in the `pitches/*.md` files (nor in subject, email body, DM body).
- **Language = language of the cited article**, fallback FR.
- **Strict cap**: `--limit` (default 10). No mass generation, this is targeted outreach not spam.
- **Podcasts excluded**.
- **Sources with score < 4 excluded** from the final deliverable (mentioned in the index's "excluded" section).
- **Sort priority**: intent A > B > C, then score descending within each bucket.
- **Cost**: use Haiku for parsing/scraping/lint, Sonnet for qualification/writing, Opus only for orchestration. Do not call Opus in the sub-agents.
- **Parallelization**: steps 5 and 6 launch N sub-agents in parallel in a single multi-tool-call message.
- **No guarantees**: we talk about "potential hot sources", not "guaranteed leads".
