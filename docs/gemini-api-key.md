# Create a Gemini API key with billing enabled

> Prerequisite for using `/mentionable-images`. Image generation via Gemini (`gemini-2.5-flash-image`) **is not available on the free tier** — you need a Google Cloud project with a billing account linked (Tier 1).

## TL;DR

1. https://aistudio.google.com/api-keys
2. Click **"Set up billing"** on your project
3. Link a billing account (Prepay, min. $10)
4. Your existing key automatically moves to Tier 1 — no need to recreate one

## Method 1 — Via Google AI Studio (recommended)

This is the shortest path. AI Studio creates and manages the Google Cloud project for you.

### 1. Access your keys

Go to **https://aistudio.google.com/api-keys**.

You'll see the list of your existing API keys, each with:
- The associated **Google Cloud project**
- The **Billing Tier** (Free / Tier 1 / Tier 2 / Tier 3)

If you don't have a key yet: click **"Create API key"** and choose (or let AI Studio create) a project.

### 2. Enable billing on the project

In the **Billing Tier** column, click **"Set up billing"** on the row for the project that hosts your key.

> ⚠️ Make sure you enable billing on **the same project** as the key. Enabling billing on a different project won't unlock the key.

### 3. Link a billing account

- **New account**: fill in your contact details + a payment method (card)
- **Existing account**: select it from the list

Accept the terms according to your region.

### 4. Choose the billing plan

- **Prepay** (recommended): you load a balance (minimum $10), Google draws down as you go
- **Postpay** (if eligible): monthly billing

> 💡 The $300 Google Cloud free credit **does not cover** the Gemini API. You pay from the first call.

### 5. First payment

For Prepay: make the initial payment. The project automatically moves to **Tier 1** and image generation is unlocked.

### 6. Verify

- Balance and tier: https://aistudio.google.com/billing
- Test: `npm run generate:image -- --prompt "test blue circle" --out images/test.png`

If you see `✓ images/test.png` → you're set. If you still see `429 free_tier` → the key points to a different project (back to step 1, check the association).

## Method 2 — Via Google Cloud Console

More control, more steps. Use this if you want to manage the GCP project manually (team, IAM restrictions, etc.).

### 1. Create or select a project

**https://console.cloud.google.com/** → project selector at the top → "New project" or pick an existing one.

### 2. Link a billing account

**Billing** menu → **Link a billing account** → create or link an account with a payment card.

### 3. Enable the Gemini API

**APIs & Services → Library** menu → search for **"Generative Language API"** → click **Enable**.

### 4. Create an API key

**APIs & Services → Credentials → Create credentials → API key** menu.

Copy the key that's displayed.

### 5. Restrict the key (recommended)

On the freshly created key, click **Restrict key**:
- **API restrictions** → check only **Generative Language API**
- **Application restrictions** → keep "None" for local CLI use

> 📌 Starting **June 19, 2026**, Google is deprecating unrestricted keys. Restrict it now.

### 6. Add the key to the repo

```bash
cp .env.example .env
# edit .env
GEMINI_API_KEY=AIza...
```

## Indicative costs

- Up-to-date pricing: https://ai.google.dev/gemini-api/docs/pricing
- `gemini-2.5-flash-image` ≈ a few cents per image at the time of writing
- Each `/mentionable-images` call generates N images = N paid calls

> For an article with 1 cover + 2 illustrations: expect ~3 calls.

## Important notes (2026)

- **March 2026**: new AI Studio accounts are forced onto the **Prepay** plan
- **June 2026**: keys without an API restriction will be deprecated — always restrict to "Generative Language API"
- The $300 GCP free credit does **not** apply to the Gemini API

## Troubleshooting

| Error | Likely cause | Solution |
|---|---|---|
| `429 free_tier_requests, limit: 0` | Billing isn't active on the key's project | Check the project associated with the key at https://aistudio.google.com/api-keys |
| `403 PERMISSION_DENIED` | Generative Language API not enabled | Enable it in GCP Console → APIs & Services |
| `400 API key not valid` | Wrong or revoked key | Re-copy from AI Studio, check for stray whitespace |
| `429` despite active billing | Per-minute quota exceeded | Wait a few seconds or spread out the calls |

## Useful links

- [Gemini API — Billing](https://ai.google.dev/gemini-api/docs/billing)
- [Gemini API — Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API — Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [AI Studio — API keys](https://aistudio.google.com/api-keys)
- [AI Studio — Billing](https://aistudio.google.com/billing)
