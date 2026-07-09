# Setup — Image generation (`/mentionable-images`)

The `/mentionable-images` command generates article images (cover, social, illustrations) via the **Google Gemini** API (`gemini-2.5-flash-image`). It's optional — every other command in the playbook works without it.

## Prerequisites

- **Node.js ≥ 18** (`node --version`)
- **npm** (ships with Node)
- **Google Gemini API key** with billing enabled on the project

### No Node.js yet?

Check first in a terminal:

```bash
node --version
```

If it shows `v18.x.x` or higher, you're good. Otherwise:

- **macOS**:
  - Easiest: download the installer from https://nodejs.org (pick "LTS")
  - Or via Homebrew: `brew install node`
- **Windows**:
  - Download the installer from https://nodejs.org (pick "LTS")
  - Or via winget: `winget install OpenJS.NodeJS.LTS`
- **Linux (Ubuntu/Debian)**:
  - `sudo apt install nodejs npm` (check the version; you may need [NodeSource](https://github.com/nodesource/distributions))

You **don't need** to know JavaScript or understand Node to use the command. It's just the runtime that runs the image-generation script in the background.

## Installation

```bash
# From the repo root
npm install
```

This installs `@google/genai` locally in `node_modules/`.

## Configuring the Gemini key

> 📘 **Full step-by-step walkthrough**: see [gemini-api-key.md](gemini-api-key.md) (AI Studio method + GCP Console method + troubleshooting).

Quick summary:

1. Go to https://aistudio.google.com/api-keys
2. Create (or select) a project and generate a key
3. **Enable billing** on the project — the free tier doesn't allow image generation (`limit: 0`)
4. Copy the example file:

```bash
cp .env.example .env
```

5. Open `.env` and paste your key:

```
GEMINI_API_KEY=AIza...
```

> `.env` is ignored by git — your key stays local.

## Verification

```bash
npm run generate:image -- \
  --prompt "Editorial flat illustration, minimal, two colleagues talking calmly in a bright office, muted palette." \
  --out articles/test/images/cover.png
```

You should see `✓ articles/test/images/cover.png`. Otherwise:

- `Erreur: GEMINI_API_KEY manquante` → check `.env`
- `429 — quota dépassé` → enable billing on your Google AI Studio project
- `Cannot find module '@google/genai'` → run `npm install`

## Article structure convention

Each article lives in its own folder under `articles/`:

```
articles/
└── mon-article/
    ├── index.md        ← article content
    └── images/         ← generated images (created by the command)
        ├── 1-cover.png
        ├── 2-illustration.png
        └── prompts.json
```

In the markdown, reference images relatively: `![alt](images/1-cover.png)`.

## Using it from Claude Code

```text
/mentionable-images articles/mon-article
```

or by passing the markdown file directly:

```text
/mentionable-images articles/mon-article/index.md
```

Claude reads the article, asks how many images, what style, and which types (cover / social / illustration / diagram), builds the prompts, and calls the script in parallel. Images are written to `articles/<slug>/images/`.

## Cost

Each image = 1 Gemini call. Up-to-date pricing: https://ai.google.dev/gemini-api/docs/pricing

## Using it outside Claude (direct CLI)

The script can be used on its own:

```bash
npm run generate:image -- \
  --prompt "<prompt in English>" \
  --out articles/mon-article/images/cover.png \
  --aspect-ratio 16:9 \
  --model gemini-2.5-flash-image
```

Args:
- `--prompt` (required) — image description in English
- `--out` (required) — output path `.png`
- `--aspect-ratio` (optional) — default `16:9`. Values: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9`, `5:4`, `4:5`
- `--model` (optional) — default `gemini-2.5-flash-image`
