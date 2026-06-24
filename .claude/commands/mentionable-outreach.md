---
description: Outreach GEO automatisé. Détecte les pages chaudes (mention sans lien, listicle de concurrents, sujet voisin) et génère email + DM LinkedIn routés par intent. URL-first.
argument-hint: [projectSlug | chemin projet] [--limit=10] [--intent=all|direct_link|listicle|guest_post]
allowed-tools: Bash, Read, Write, WebFetch, WebSearch, AskUserQuestion, Agent
---

Tu es un outreach manager GEO senior. Tu identifies les **sources chaudes** d'un projet et tu produis pour chacune un livrable d'outreach multi-canal **prêt à envoyer** : email + DM LinkedIn personnalisés, anti-IA, dans la langue de la source.

Trois intents distincts sont détectés et chacun a son propre template, parce que l'ask est très différent :

| Intent | Signal | Ask | Effort destinataire | Longueur email |
|---|---|---|---|---|
| `direct_link_request` (A) | L'article cite la marque par son nom mais sans lien hypertexte vers le site du projet | Ajout d'un lien sur la mention existante | Très faible (5 sec) | 80-120 mots |
| `listicle_inclusion` (B) | L'article est un listicle / comparatif qui liste ≥ 2 concurrents confirmés sans inclure la marque | Ajout d'une entrée dans la liste, avec blurb prêt à intégrer | Faible (2-5 min) | 150-200 mots |
| `guest_post` (C) | L'article couvre le sujet/les entités du projet sans nommer la marque ni les concurrents | Proposition d'un article invité complémentaire | Élevé (1-2 jours) | 200-300 mots |

L'ordre de ROI par effort est A > B > C. Le livrable trie en conséquence.

Argument fourni : `$ARGUMENTS` (slug ou chemin projet, optionnellement `--limit=N` pour plafonner le nombre de pitches générés. Défaut : 10).

## Étape 0 — Lire les guidelines anti-IA (OBLIGATOIRE)

Lis intégralement `CLAUDE.md` à la racine du repo avec `Read`. Les règles anti-détection IA s'appliquent à **tous les emails et DMs** que tu vas générer (cf. section explicitement étendue aux emails de prospection). Pas négociable. Garde la checklist active.

Règles critiques à retenir pour cette commande :
- Zéro em-dash (`—`), zéro ellipse Unicode (`…`).
- Vocabulaire banni FR (plongeons, naviguer, véritable, au cœur de, incontournable, il est essentiel de, etc.) et EN (delve, dive into, navigate, crucial, essential, unlock, unleash, landscape, realm, tapestry, it's worth noting, furthermore, moreover, that said).
- Pas de « Pas X, mais Y » / anaphore par trois.
- Pas d'ouverture type « J'espère que ce message vous trouve bien » / « I hope this email finds you well ».
- Email : 200-300 mots. DM LinkedIn : 60-90 mots.

## Étape 1 — Résoudre le projet

- Si `$ARGUMENTS` est un slug ou chemin sous `projects/<slug>/` → lis `projects/<slug>/.project.json` pour récupérer `projectId`, `projectName`, `projectUrl`.
- Sinon → `list_projects()` puis `AskUserQuestion` pour choisir. Calcule alors `projectSlug` (kebab-case du nom).

**Contexte produit (source de vérité, si disponible)** : avec `Read`, vérifie si `projects/<projectSlug>/value-proposition.md` existe. S'il existe, lis-le : c'est de là que viennent la **description produit et les USP / différenciateurs** passés aux sub-agents en étape 6 (ne les invente pas). S'il n'existe pas, formule une description courte + 3 puces USP à partir du site (`projectUrl`) et signale dans le résumé final qu'un `value-proposition.md` rendrait l'outreach plus précis.

Parse `--limit=N` depuis `$ARGUMENTS` si présent (défaut : 10).

Parse `--intent=...` depuis `$ARGUMENTS` si présent. Valeurs : `all` (défaut), `direct_link`, `listicle`, `guest_post`. Filtre les sources qualifiées selon l'intent demandé.

## Étape 2 — Collecter sources LLM, concurrents et backlinks (parallèle)

Lance en parallèle :

1. `list_llm_sources(projectId, limit: 100, sortBy: "appearances_desc")` — réponse riche : chaque entrée domaine contient une liste d'URLs avec leurs appearances individuelles.
2. `list_competitors(projectId, filters: { status: ["CONFIRMED"] }, limit: 20, sortBy: "mentions_desc")` puis pour chaque concurrent (top 10) : `list_competitor_sources(projectId, competitorId, limit: 30, sortBy: "mentions_desc")`.
3. `list_backlink_opportunities(projectId, limit: 200)` — liste de prospection Mentionable. **Sémantique importante** : un domaine présent ici est par définition non-linkant. Donc `cited_domains ∩ opportunities = warm_sources` confirmées.

**Si les réponses sont trop volumineuses pour le contexte principal** (cas fréquent avec `list_llm_sources` qui peut dépasser 300k caractères), délègue l'extraction à un sub-agent Haiku qui lit le fichier de tool-result par chunks et renvoie un JSON aplati au format URL-level (voir étape 3).

À l'issue de l'étape 2, conserve en mémoire :
- `brand_terms` = `[projectName, brandName, ...brandAliases]` (récupérés via `list_projects` à l'étape 1).
- `competitor_terms` = `[canonicalName, ...aliases]` pour les top 20 concurrents confirmés.

## Étape 3 — Aplatissement URL-first + identification des pages chaudes

**Approche URL-first (par défaut)** : on raisonne au niveau **page**, pas domaine. Une même source peut héberger plusieurs pages avec des intents différents (un guide général + un listicle d'outils). Le domain-first ne voit que la page la plus citée et rate les pépites.

Construis la liste `candidate_urls` :

1. **Aplatir** `list_llm_sources` et `list_competitor_sources` au niveau URL : chaque entrée = `{url, domain, appearances, cited_count, consulted_count, fan_out_count, llms, source: "llm_sources" | "competitor_sources"}`.
2. **Filtrer** :
   - `domain` doit appartenir à `list_backlink_opportunities` (confirmation non-linkant). Conserve `impact_score` du domaine.
   - Exclure les pages d'accueil (`url === "https://domain.com/"` ou path = `/`).
   - Exclure les domaines techniques : arxiv.org, developers.google.com, docs.*, schema.org.
   - Exclure les plateformes : openai.com, anthropic.com, google.com, bing.com, youtube.com, reddit.com, x.com, linkedin.com, github.com, wikipedia.org, apps.apple.com, play.google.com.
   - Exclure les domaines techniques produit du projet lui-même.
3. **Trier** par `appearances` décroissant.
4. **Boost de priorité listicle** : URL dont le slug contient un des patterns suivants reçoit +50% sur son score de tri : `best-`, `top-`, `meilleurs-`, `meilleures-`, `outils-`, `comparatif-`, `comparaison`, `alternatives`, `-vs-`, ou un nombre suivi de tiret (`10-`, `7-`, `6-`, `5-`). Ces patterns signalent une probabilité élevée d'intent B (listicle).
5. **Plafonner** à `--limit × 2` candidates (sur-échantillonnage pour absorber les exclusions de l'étape qualification).

Si `candidate_urls` < 3, dis-le clairement et arrête : pas de pitches sur données insuffisantes.

**Fallback domain-first** : si l'API renvoie peu d'URLs distinctes (≤ 1 URL par domaine), bascule sur l'ancienne logique domain-first en prenant `top_citing_url` de chaque domaine warm. Ne s'applique qu'en dégénérescence.

## Étape 4 — Qualification + détection d'intent (sub-agents Haiku, un par URL, parallèles)

Pour chaque URL de `candidate_urls`, lance **un sub-agent Haiku** en parallèle (dans un seul message multi-tool-call). Haiku suffit ici : la détection d'intent est essentiellement du pattern matching (occurrences de brand_terms / competitor_terms, présence de liens, structure listicle).

Chaque sub-agent reçoit : l'URL à analyser, `brand_terms`, `competitor_terms`, le `projectUrl` (pour détecter les `<a href>` qui linkent).

Tâches du sub-agent :

1. **WebFetch l'URL exacte** (pas la home du domaine).
2. **Détecter l'intent** en inspectant le contenu HTML de cet article :
   - **A. `direct_link_request`** : le texte mentionne au moins un des `brand_terms` (insensible à la casse), ET il n'y a pas de lien `<a href>` vers le `projectUrl` (ou un de ses sous-domaines) dans le voisinage de cette mention. C'est le plus fort signal et le plus simple à convertir.
   - **B. `listicle_inclusion`** : l'article cite ≥ 2 termes de `competitor_terms` (insensible à la casse) ET ne mentionne aucun `brand_terms`. Signal renforcé si l'article a une structure de liste (présence de `<h2>`, `<h3>`, `<ol>`, ou patterns "Top X", "meilleurs", "best", "comparatif", "vs", "alternative", numérotation "1.", "2.").
   - **C. `guest_post`** : aucun des deux. L'article couvre le sujet/les entités du projet sans nommer ni la marque ni les concurrents.
3. **Scoring 1-5** sur autorité éditoriale + pertinence + accessibilité :
   - Autorité : si la source est dans `list_backlink_opportunities`, utilise `impact_score` (normalisé sur 5). Sinon, évalue via WebFetch home (équipe éditoriale visible, fréquence publication).
   - Pertinence : la source publie-t-elle régulièrement sur le sujet du projet ?
   - Accessibilité : présence d'une page `/contact`, `/about`, `/team`, `/ecrire-pour-nous`, `/contribute`. Pour intent A et B, l'accessibilité compte moins (l'ask est petit, email générique suffit souvent) ; pour C elle est critique.
4. **Archétype** : `media_vertical` | `blog_expert` | `comparateur` | `newsletter` | `inconnu`. Les podcasts sont exclus.
5. **Capturer les évidences** :
   - Pour A : la phrase exacte où la marque est mentionnée (max 200 caractères, pour personnaliser l'email).
   - Pour B : la liste exacte des concurrents trouvés dans l'article + le titre H1/H2 du listicle + **les entrées du listicle avec leur blurb** (nom + 1-2 lignes par outil cité, pour rédiger un blurb dans le même style).
   - Pour C : 1-2 entités principales traitées par l'article.

Output attendu : JSON
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

**Filtres + déduplication post-qualification :**

- Garder uniquement `score ≥ 4`.
- Si `--intent` est fourni et différent de `all`, filtrer en conséquence.
- **Déduplication par domaine + intent** : si plusieurs URLs d'un même domaine ressortent en intent A, garde la mieux scorée. Idem pour B et C. **Mais on peut conserver jusqu'à 2 entrées par domaine si elles ont des intents différents** (ex : Vlad Cerisier peut avoir un guide en C et un listicle en B → deux pitches angulairement différents, parfaitement légitime).
- **Trier par priorité ROI : intent A d'abord, puis B, puis C**. À l'intérieur de chaque bucket, tri par score décroissant.
- Plafonner à `--limit`.

C'est la liste `qualified_urls` (anciennement `qualified_sources`).

## Étape 5 — Enrichissement par DOMAINE (cache, sub-agents Haiku parallèles)

**Optimisation clé en URL-first** : on enrichit **par domaine unique**, pas par URL. Si 3 URLs du même domaine sont dans `qualified_urls`, on fait UN seul appel d'enrichissement (email + LinkedIn structure du site) et on partage le résultat. Économie tokens × N.

Construis `unique_domains` = `{domain → [list of (url, intent, author_from_url_qualification)]}`.

Pour chaque domaine unique, lance **en parallèle** un sub-agent Haiku qui fait :

1. **Détection langue** (sur l'URL la plus citée du domaine ; si plusieurs lang détectées au niveau article, on lock par URL au moment de la génération).
2. **Découverte email** (cascade) :
   - WebFetch `/contact`, `/contact/`, `/about`, `/a-propos`, `/team`, `/equipe`, `/ecrire-pour-nous`, `/contribute`, `/qui-sommes-nous` (essaie dans cet ordre, stoppe au premier hit).
   - Parse emails (regex), exclut `noreply@`, `privacy@`, `dpo@`, `abuse@`, `legal@`.
   - Préfère nominatif (`prenom.nom@`) sinon éditorial (`hello@`, `editorial@`, `redaction@`, `contact@`).
   - Si aucun → `email: null, email_status: "manual_required"`. **NEVER invent.**
3. **Découverte LinkedIn par URL** : pour chaque `(url, author_from_qualification)` de ce domaine :
   - Si l'étape 4 a déjà capturé un auteur, fais WebFetch sur l'URL d'article spécifique pour récupérer le lien LinkedIn de la bio auteur (si présent).
   - Sinon WebSearch `"<author>" "<domain>" site:linkedin.com/in/`.
   - Si ambigu/aucun → `linkedin_url: null, linkedin_status: "manual_required"`. **NEVER invent.**
   - Si pas d'auteur du tout : utilise la page entreprise LinkedIn comme fallback (`linkedin.com/company/<slug>`), marque `profile_confidence: medium`.

Output par sub-agent : JSON `{domain, email, email_source, email_confidence, urls: [{url, lang, author_name, linkedin_url, linkedin_headline, linkedin_confidence}, ...]}`.

Lance les sub-agents **dans un seul message multi-tool-call** pour parallélisation maximale.

## Étape 6 — Génération email + DM (sub-agents Sonnet, un par source, routés par intent)

Pour chaque source enrichie, lance **en parallèle** un sub-agent Sonnet. Le brief passé au sub-agent inclut :
- Contexte projet : `projectName`, `projectUrl`, description courte du produit/service et USP / différenciateurs en 3 puces — **tirés de `value-proposition.md`** (`productContext`) quand il existe (étape 1), sinon déduits du site. Ne pas inventer de capacité hors périmètre.
- Source : `domain`, `archetype`, `top_citing_url`, `lang`, `author_name`.
- **Intent + evidence** : tout le bloc `evidence` de l'étape 4 (snippet de mention, liste de concurrents, titre listicle, entités topic).
- Checklist anti-IA intégralement copiée depuis `CLAUDE.md` (em-dash interdits, vocabulaire banni FR + EN, pas de « Pas X, mais Y », pas d'ouverture cold email standard).

Le sub-agent doit générer email + DM en utilisant **le template correspondant à l'intent** :

### Template A — `direct_link_request` (mention sans lien)

**Email** (80-120 mots, ton direct, courtois, pas commercial) :
1. Bonjour [auteur ou équipe].
2. Phrase 1 : "Merci pour la mention de [marque] dans [titre article ou URL]." Cite la phrase exacte du snippet capturé (extrait court, entre guillemets).
3. Phrase 2 : "Il manque probablement le lien vers [projectUrl] sur cette mention. Si vous pouvez l'ajouter, ça aidera vos lecteurs à nous trouver directement."
4. Phrase 3 (optionnelle) : 1 ligne de remerciement ou contexte court.
5. Signature : prénom + URL projet.

Pas de pitch produit, pas de propal additionnelle. L'ask doit rester minuscule. Subject typique : "Petit lien manquant sur [titre article]" ou "Mention [marque] dans [titre] — lien à ajouter ?".

**DM LinkedIn** (40-70 mots, court, direct) :
- Référence immédiate à l'article + mention.
- Ask explicite : possible d'ajouter le lien ?
- Aucun pitch produit, aucun lien sortant dans le DM.

### Template B — `listicle_inclusion` (liste les concurrents sans nous)

**Email** (150-200 mots, ton confraternel, donne tout pour faciliter l'ajout) :
1. Bonjour [auteur].
2. Référence précise à l'article + listicle_title. Reconnaissance courte de la qualité de la sélection (1 phrase, factuelle, pas flagorneuse).
3. Observation : "Vous listez [competitor_1, competitor_2 (et éventuellement competitor_3)]. [Marque] n'est pas dans la sélection alors qu'elle fit la même catégorie."
4. Différenciateur en 2-3 lignes : ce que la marque fait que ces concurrents ne font pas (basé sur les USP fournis dans le brief).
5. **Blurb prêt à intégrer** (encadré ou listé) : 3-5 lignes formatées dans le style probable du listicle (titre du produit, tagline, 2-3 points clés, lien). Le sub-agent doit produire un blurb qui s'aligne sur le formatage des autres entrées si visible.
6. CTA : "Si ça vous semble pertinent, j'ai préparé le blurb ci-dessus pour faciliter l'intégration. Heureux de répondre à toute question."
7. Signature : prénom + URL projet.

Subject typique : "[Marque] manque dans votre top [N] [catégorie]" ou "Ajout possible à [titre listicle] ?".

**DM LinkedIn** (60-90 mots) :
- Référence au listicle.
- Mentionne les concurrents listés (1-2, pas tous).
- Différenciateur en 1 phrase.
- Question ouverte sur la possibilité d'ajout.
- Pas le blurb complet (réservé à l'email).

### Template C — `guest_post` (couvre le sujet sans nous ni concurrents)

**Email** (200-300 mots, structure existante) :
1. Accroche : référence à l'article (URL en clair), observation factuelle sur un point précis.
2. Le signal : l'article couvre [topic_entities] sans aborder [angle complémentaire que la marque expertise].
3. Proposition guest post : titre précis (1 ligne) + 2-3 lignes d'angle + 3 puces de plan.
4. Pourquoi cette source / pourquoi maintenant : 1-2 phrases concrètes.
5. CTA : "Si l'angle vous parle, je peux vous envoyer un outline détaillé."
6. Signature : prénom + URL projet.

**DM LinkedIn** (60-90 mots) :
- Conversationnel, ouverture sur l'article.
- Mentionne un angle complémentaire.
- Question ouverte.
- Pas de CTA commercial.

### Règle universelle pour les trois templates

**Le DM doit être angulairement différent de l'email**, pas une version raccourcie. Le destinataire ne doit pas avoir l'impression de lire deux fois le même message.

**Tutoiement vs vouvoiement** : par défaut, tutoiement pour `blog_expert` et `newsletter` (norme entre indés/opérationnels), vouvoiement pour `media_vertical` (poli avec rédactions formelles), vouvoiement pour `comparateur`. Le sub-agent décide selon l'archétype + le ton perceptible de l'article cité.

Output par sub-agent : JSON
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
  description: "Générer pitch <domain> intent=<intent>",
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: <brief complet incluant intent + evidence + template correspondant + règles anti-IA>
)
```

Tous les sub-agents lancés dans un seul message multi-tool-call.

## Étape 7 — Lint anti-IA (sub-agent Haiku, un appel groupé)

Lance un **seul** sub-agent Haiku qui reçoit tous les emails + DMs générés (avec leur `intent` associé) et vérifie :
- Zéro `—` (em-dash) dans body et subject.
- Aucun mot de la liste bannie FR/EN.
- Pas de « Pas X, mais Y » détecté.
- Pas d'ouverture standard cold email.
- Longueurs respectées **selon l'intent** :
  - `direct_link_request` : email 80-120 mots, DM 40-70 mots
  - `listicle_inclusion` : email 150-200 mots (hors blurb encadré), DM 60-90 mots
  - `guest_post` : email 200-300 mots, DM 60-90 mots

Output : JSON `[{domain, lint_status: "pass" | "fail", failures: [...]}, ...]`.

Pour les fails : relance un sub-agent Sonnet ciblé sur les messages concernés avec les failures listés, puis re-lint. Maximum 2 tours. Si toujours fail après 2 tours, marque la source `lint_status: "manual_review"` dans le livrable plutôt que de livrer un message douteux.

## Étape 8 — Écrire le livrable

Crée le dossier `projects/<projectSlug>/outreach/<YYYY-MM-DD>/` avec :

### `outreach-pitches.md` (index)

```markdown
# Sources chaudes — [projectName]

> Date : YYYY-MM-DD · Sources analysées : N · Qualifiées : M · Pitches générés : K

## Répartition par intent (ROI décroissant)

- **A. Lien direct** (mention sans lien, ask minimal) : Na
- **B. Inclusion listicle** (cite concurrents, ajout demandé) : Nb
- **C. Guest post** (couvre le sujet, propal article) : Nc

## Vue d'ensemble (triée par intent puis score, une ligne par URL pitchée)

| # | Intent | URL | Domaine | Score | Archétype | Email | LinkedIn | Lint |
|---|---|---|---|---|---|---|---|---|
| 1 | A | `/article-mention-marque` | blog-xyz.com | 5 | media_vertical | ✅ jean@blog-xyz.com | ✅ linkedin.com/in/jean-x | pass |
| 2 | B | `/top-10-tools-ia` | comparateur.com | 5 | comparateur | ✅ ... | ✅ ... | pass |
| 3 | B | `/outils-visibilite-ia` | vlad-cerisier.fr | 5 | blog_expert | ✅ ... | ✅ ... | pass |
| 4 | C | `/guide-geo-2026` | vlad-cerisier.fr | 5 | blog_expert | ✅ ... | ✅ ... | pass |
...

**Note** : un même domaine peut apparaître plusieurs fois si plusieurs de ses pages ont des intents différents (ex : Vlad Cerisier ci-dessus a un listicle B et un guide C → deux pitches angulairement différents). Ne jamais répéter le MÊME intent pour le même domaine.

## Statistiques

- Email auto-trouvé : X/K
- LinkedIn auto-trouvé : Y/K
- Lint pass au premier coup : Z/K
- À enrichir manuellement : W/K

## Sources exclues

- N sources avec score < 4 (raison : ...)
- N podcasts exclus par règle

## Prochaines actions suggérées (par bucket d'intent)

- **A — J0 (aujourd'hui)** : envoi des demandes de lien direct. Conversion attendue rapide (24-72h), effort destinataire minimal.
- **B — J0 à J+2** : envoi des demandes d'inclusion listicle avec blurb prêt à intégrer. Conversion attendue 1-2 semaines.
- **C — J+3** : envoi des propals guest post (cycle long, J+15-30 avant publication potentielle).
- **J+3 pour A/B, J+7 pour C** : DM LinkedIn de relance sur les non-répondants.
- **J+30** : vérification dans `list_llm_sources` si la marque commence à apparaître sur les domaines contactés.
```

### `pitches/<domain-slug>[--<intent>].md` (un fichier par URL pitchée)

**Convention de nommage** :
- Si un domaine n'a qu'un seul pitch : `pitches/<domain-slug>.md` (ex : `blog-xyz-com.md`).
- Si un domaine a plusieurs pitches (intents différents) : suffix d'intent, ex `vlad-cerisier-fr--listicle.md` et `vlad-cerisier-fr--guest-post.md`. Suffixes autorisés : `--direct-link`, `--listicle`, `--guest-post`.

```markdown
---
domain: blog-xyz.com
score: 5
intent: direct_link_request | listicle_inclusion | guest_post
intent_confidence: high | medium | low
archetype: media_vertical
detection_source: llm_sources + backlink_opportunities
warm_signal: "Description courte de l'évidence détectée (mention sans lien / liste concurrents / topic seul)"
evidence:
  brand_mention_snippet: "..." # rempli pour intent A
  competitors_listed: [...]    # rempli pour intent B
  listicle_title: "..."        # rempli pour intent B
  topic_entities: [...]        # rempli pour intent C
top_citing_url: https://...
lang: fr
lint_status: pass

email:
  to: jean.dupont@blog-xyz.com
  to_source: page /contact
  to_confidence: high
  subject: "[sujet email]"

linkedin:
  profile_url: https://linkedin.com/in/jean-dupont
  profile_source: bio auteur sur <top_citing_url>
  profile_confidence: high
  headline: "Rédacteur en chef @ Blog XYZ"
---

## Email

**À :** jean.dupont@blog-xyz.com
**Objet :** [sujet]

[corps email 200-300 mots]

—

## DM LinkedIn

**Profil :** https://linkedin.com/in/jean-dupont

[DM 60-90 mots]
```

**ATTENTION** : dans le rendu du fichier `pitches/*.md`, le séparateur entre les deux sections doit être une ligne `---` ASCII, **pas un em-dash**. Le caractère `—` ci-dessus est uniquement dans cette doc de skill, pas dans les fichiers livrables.

## Étape 9 — Rapport final à l'utilisateur

Une fois les fichiers écrits, affiche un résumé court :
- Chemin du dossier livrable.
- K pitches générés, dont X avec email + LinkedIn complets et prêts à envoyer.
- Liste des sources nécessitant enrichissement manuel (email ou LinkedIn).
- Suggestion : ouvrir d'abord `outreach-pitches.md` pour vue d'ensemble.

## Règles strictes

- **Approche URL-first par défaut.** On raisonne au niveau page, pas domaine. Le domain-first est un fallback dégénéré (quand l'API renvoie peu d'URLs distinctes).
- **Jamais inventer un email ou une URL LinkedIn.** Si non trouvé → `manual_required`.
- **Jamais inventer une evidence d'intent.** Si le sub-agent qualification n'a pas trouvé de mention de la marque ou de listicle clair → l'intent est `guest_post` par défaut. Ne jamais classer en A ou B sans evidence textuelle capturée.
- **Jamais inventer la liste des outils d'un listicle.** Si la page n'est pas fetchable (HTTP 403/508/paywall), marque la source en `manual_review` plutôt qu'inférer depuis le slug.
- **Anti-cache enrichissement** : enrichir une seule fois par domaine, même si plusieurs URLs du domaine sont pitchées (économie tokens).
- **Jamais d'em-dash** dans les fichiers `pitches/*.md` (ni dans subject, body email, body DM).
- **Langue = langue de l'article cité**, fallback FR.
- **Plafond strict** : `--limit` (défaut 10). Pas de génération de masse, c'est de la prospection ciblée pas du spam.
- **Podcasts exclus**.
- **Sources avec score < 4 exclues** du livrable final (mentionnées dans les "exclues" de l'index).
- **Priorité de tri** : intent A > B > C, puis score décroissant à l'intérieur de chaque bucket.
- **Coût** : utiliser Haiku pour parsing/scraping/lint, Sonnet pour qualification/rédaction, Opus uniquement pour orchestration. Ne pas appeler Opus dans les sub-agents.
- **Parallélisation** : étapes 5 et 6 lancent N sub-agents en parallèle dans un seul message multi-tool-call.
- **Pas d'engagement** : on parle de "sources chaudes potentielles", pas de "leads garantis".
