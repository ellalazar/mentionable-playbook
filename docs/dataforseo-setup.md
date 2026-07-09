# DataForSEO setup

`/mentionable-pillar` uses the DataForSEO API for keyword research, SERP analysis, and KD scoring. This guide takes you from zero to a working `npm run pillar`.

## 1. Create an account

1. Go to [app.dataforseo.com](https://app.dataforseo.com/register).
2. Create an account (email + password, or Google).
3. You get **$1 in free credits** on signup — enough for 5-10 `/mentionable-pillar` runs on a seed.

## 2. Get your API credentials

1. Once logged in, go to **API Access** → **API Dashboard** tab (`app.dataforseo.com/api-access`).
2. Note the two values:
   - **API Login** (often your email)
   - **API Password** (a generated string — click "Show" to reveal it)

Both values go into `.env`.

## 3. Configure the .env

At the repo root:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=xxxxxxxxxxxxxxxx

# Default location. Can be overridden via CLI: --location 2840 --language en
LOCATION_CODE=2250
LANGUAGE_CODE=fr
```

## 4. Location & language codes

DataForSEO uses numeric codes for countries. The most common ones:

| Country | `LOCATION_CODE` | `LANGUAGE_CODE` |
|---|---|---|
| France | `2250` | `fr` |
| United States | `2840` | `en` |
| United Kingdom | `2826` | `en` |
| Spain | `2724` | `es` |
| Germany | `2276` | `de` |
| Italy | `2380` | `it` |
| Belgium (FR) | `2056` | `fr` |
| Canada (FR) | `2124` | `fr` |
| Canada (EN) | `2124` | `en` |

Full list: [docs.dataforseo.com/v3/serp/google/locations/](https://docs.dataforseo.com/v3/serp/google/locations/).

## 5. Test

```bash
npm run pillar -- "cours de guitare"
```

You should see:

```
[1/4] Mots-clés autour de "cours de guitare" (loc=2250, lang=fr)…
      127 mots-clés uniques.
[2/4] Sélection de la cible pilier…
      Cible : "cours de guitare en ligne" (vol=8100, KD=45)
[3/4] Analyse SERP de "cours de guitare en ligne"…
      Longueur moyenne : 2340 mots → cible : 2808
[4/4] Clustering des satellites…
      8 clusters de satellites.

✅ Brief écrit : pillars/cours-de-guitare/brief.json
```

## 6. Cost per run

A `/mentionable-pillar` run typically consumes **$0.05 to $0.15** in DataForSEO credits:
- ~$0.01 — related keywords + suggestions (DataForSEO Labs)
- ~$0.003 — organic SERP top 10
- No extra cost for scraping competitor pages (done locally, not via DataForSEO)

With $1 in free credits, you can easily do 8-10 runs to test.

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD manquants` | `.env` missing or variables empty | See step 3 |
| `401 Authentication failed` | Wrong login / password | Re-copy from the dashboard, with no whitespace |
| `40400 No tasks available` | Credits exhausted | Top up from the dashboard |
| `Empty result` on some seeds | Seed too niche or mislocalized | Try a broader `LOCATION_CODE` or a more generic seed |

## CLI override

You can override the `.env` defaults on a per-run basis:

```bash
npm run pillar -- "yoga classes near me" --location 2840 --language en
```
