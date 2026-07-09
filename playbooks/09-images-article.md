# Playbook 09 — Article images via Gemini

> You've written an article (or a brief). This command generates **the accompanying visuals** — hero cover, social thumbnail, inline illustrations — via the Google Gemini API, without leaving Claude Code.

## Goal

Produce, in a single command, **1 to N consistent images** to accompany an article:
- Horizontal 16:9 cover (hero at the top of the page)
- Square 1:1 thumbnail (LinkedIn, X, OG image)
- Inline illustrations to support key sections
- Simple conceptual diagrams (frameworks, comparisons)

All images from the same run share **one palette and one style** to stay editorially consistent.

## Who it's for

- **Writers / content marketers** who deliver the article + its visuals
- **SEO content** people who want an article visual quickly, without Midjourney or Canva
- **Agencies** industrializing GEO editorial production

## Prerequisites

- **Node.js ≥ 18** + **npm** (install: https://nodejs.org → "LTS" if you don't have it — no need to know JS)
- **Google Gemini API key with billing enabled** (Tier 1) — see [docs/gemini-api-key.md](../docs/gemini-api-key.md)
- The source article or brief: a local `.md` file **or** present in the current Claude conversation

## Setup (one time only)

```bash
# From the repo root
npm install
cp .env.example .env
# edit .env, paste your GEMINI_API_KEY
```

See [docs/images-setup.md](../docs/images-setup.md) for details.

## Tools used

- **No MCP** — this command doesn't use Mentionable
- Local script: `scripts/generate-image.mjs` (wrapper around `@google/genai`)
- Model: `gemini-2.5-flash-image` (aka "nano banana")

## Structure convention

Each article lives in its own folder under `articles/`:

```
articles/cnv-au-travail/
├── index.md           ← article content
└── images/            ← generated images
    ├── 1-cover.png
    └── ...
```

In the markdown, reference images relatively: `![alt](images/1-cover.png)`.

## In Claude Code

```
/mentionable-images articles/cnv-au-travail
```

```
/mentionable-images articles/cnv-au-travail/index.md
```

```
/mentionable-images           # uses the article from the current chat
```

```
/mentionable-images "La CNV au travail"   # searches for a matching article
```

Claude asks you:
1. **How many images?** (1, 2, 3, 4+)
2. **Which style?** (photo / illustration / 3D / sketch)
3. **Which types?** (cover / social / illustration / diagram, multi-select)

Then it builds the visual prompts (in English, consistent palette), runs the script in parallel, and writes the files to `articles/<slug>/images/`.

## In Cursor / Claude Desktop / another client

If you don't have Claude Code, copy-paste this prompt into your client:

```text
You are an editorial art director. From the following article, generate N illustration images via the `scripts/generate-image.mjs` script.

Article: <paste the content or the .md path here>
Number of images: <N>
Types: <cover | social | illustration | diagram, list>

Steps:
1. Summarize: title, intent, 3-5 key visual ideas, tone, kebab-case slug (max 40 chars)
2. For each image, build an English prompt:
   - Concrete subject (object, scene, metaphor)
   - Style: editorial flat illustration, minimal, professional, muted palette with one accent color
   - Ratio: 16:9 cover / 1:1 social / 4:3 illustration
   - Palette shared across all images in the run
   - Constraints: no text, no logo, no UI
3. For each prompt, run in parallel:
   npm run generate:image -- --prompt "<prompt>" --out "articles/<slug>/images/<n>-<type>.png" --aspect-ratio <16:9|1:1|4:3>
4. Write articles/<slug>/images/prompts.json with [{ file, type, section, prompt }]
5. Produce a recap (title, folder, list of generated files)

Rules: prompts in English, consistent palette, never any text in the image, don't reinvent the article's content.
```

## Sample deliverable

For the article `articles/cnv-au-travail/index.md` with 3 images (1 cover + 2 illustrations):

```
articles/cnv-au-travail/
├── index.md
└── images/
    ├── 1-cover.png          # Cover 16:9 — two colleagues in calm dialogue
    ├── 2-illustration.png   # "Disagreement with a manager" section
    ├── 3-illustration.png   # "Setting your boundaries" section
    └── prompts.json         # Reusable for iterating
```

Excerpt from `prompts.json`:

```json
[
  {
    "file": "1-cover.png",
    "type": "cover",
    "section": "hero",
    "prompt": "Editorial flat illustration, 16:9 hero, two professional colleagues seated across a table in a light-filled office, having an empathetic conversation. Geometric simplified figures, no faces. Muted cream/sage/terracotta palette, single warm gold accent. No text, no logos."
  },
  {
    "file": "2-illustration.png",
    "type": "illustration",
    "section": "Le désaccord avec un manager",
    "prompt": "Editorial flat illustration, 4:3, a person calmly raising a hand to express disagreement in a meeting, the manager listens attentively. Same muted palette as cover. No text."
  }
]
```

## CLI usage (without Claude)

The script can be used standalone, without going through a slash command:

```bash
npm run generate:image -- \
  --prompt "Professional editorial photography, 16:9, calm conversation at work, natural light." \
  --out articles/mon-article/images/1-cover.png \
  --aspect-ratio 16:9
```

Args:
- `--prompt` (required) — description in English
- `--out` (required) — output `.png` path
- `--aspect-ratio` (optional) — default `16:9`. Values: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9`, `5:4`, `4:5`
- `--model` (optional) — default `gemini-2.5-flash-image`

## Cost

1 image = 1 billed Gemini call. Pricing: https://ai.google.dev/gemini-api/docs/pricing
For 3 images per article, expect a few cents.

## Variants

- **Realistic photo style**: replace "editorial flat illustration" with "professional editorial photography, natural light, shallow depth of field"
- **Isometric style**: "isometric illustration, 3/4 perspective, soft shadows, vector style"
- **Sketch style**: "hand-drawn sketch, ink lines, watercolor accents, journal aesthetic"
- **Consistency across N articles in a series**: lock the palette in the prompt template ("always use palette: #F4EFE6 cream, #8A9A7B sage, #C97B4D terracotta")
- **Re-generate a single image**: rerun `npm run generate:image` with the prompt from `prompts.json` and a different `--out` (e.g. `1-cover-v2.png`) to iterate without redoing everything

## Troubleshooting

| Error | Fix |
|---|---|
| `Cannot find module '@google/genai'` | `npm install` |
| `GEMINI_API_KEY manquante` | Create `.env` from `.env.example` and fill in your key |
| `429 free_tier_requests, limit: 0` | Enable billing — see [docs/gemini-api-key.md](../docs/gemini-api-key.md) |
| Image with illegible text | Rephrase the prompt: add "absolutely no text, no logos, no watermarks, no UI" |
| Inconsistent style between 2 images | Lock the HEX palette in the prompt template |

## Going further

- [Full article brief](05-brief-article.md) — produces the brief upstream
- [Content gap](04-fan-outs-pour-briefs-articles.md) — choose the next topic
- [docs/gemini-api-key.md](../docs/gemini-api-key.md) — create a Gemini key with billing
- [docs/images-setup.md](../docs/images-setup.md) — detailed technical setup
