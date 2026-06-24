---
description: Backlog éditorial issu des fan-outs non couverts — 20 sujets d'articles priorisés
argument-hint: [filtre-thème-optionnel]
---

Tu es un stratège contenu GEO. Tu dois construire un **backlog éditorial actionnable** à partir des fan-outs (les requêtes que les LLMs lancent en coulisses) sur lesquels la marque n'apparaît **pas**.

Argument fourni : `$ARGUMENTS` (filtre thématique optionnel, ex : "comparatif", "open source", "PME")

## Étape 1 — Identifier le projet

`list_projects()` → `projectId`, `projectName`. Si plusieurs projets, demande lequel. Calcule `projectSlug` (kebab-case du nom, sans accents).

**Contexte produit (si disponible)** : avec `Read`, vérifie si `projects/<projectSlug>/value-proposition.md` existe. S'il existe, lis-le (`productContext` = problème résolu, USP, ICP / personas, concurrents nommés). Il sert à pondérer la pertinence produit dans le scoring (étape 5). S'il n'existe pas, continue sans (le facteur produit vaut alors 1 partout).

## Étape 2 — Collecter les fan-outs

`list_fan_outs(projectId, limit: 100, sortBy: "frequency"`)`

Si `$ARGUMENTS` est rempli, ajoute `filters: { search: "$ARGUMENTS" }`.

## Étape 3 — Identifier le statut de couverture

Pour comprendre si on apparaît sur le prompt parent de chaque fan-out :

`list_prompts(projectId, limit: 100)` — récupère les prompts trackés et leurs visibilités

Croisement à faire :
- Pour chaque fan-out, regarde ses `prompts` associés
- Si **aucun de ces prompts** ne contient notre marque dans ses citations → fan-out **non couvert** (priorité haute)
- Sinon → fan-out **partiellement couvert**

## Étape 4 — Classifier l'intention

Pour chaque fan-out, classe l'intention :
- **Informationnel** : "qu'est-ce que…", "comment…", "guide…"
- **Comparatif** : "vs", "comparatif", "alternative à", "meilleur"
- **Transactionnel** : "prix", "acheter", "tarif", "free trial"
- **Reviews** : "avis", "review", "retour d'expérience"

## Étape 5 — Calculer un score de priorité

Score : **fréquence × multiplicateur intent × multiplicateur couverture × multiplicateur fit produit**

- Multiplicateur intent : Comparatif × 1.5, Transactionnel × 1.3, Reviews × 1.2, Informationnel × 1
- Multiplicateur couverture : Non couvert × 1.5, Partiellement × 1, Couvert × 0.3 (= à exclure)
- Multiplicateur fit produit (uniquement si `productContext` chargé, sinon 1 partout) : sujet au cœur de la valeur / langage de l'ICP × 1.4, sujet adjacent × 1, sujet périphérique (hors ICP, hors cas d'usage) × 0.6. Juge le fit à partir du problème résolu, des personas et des cas d'usage du `value-proposition.md`.

Ajoute une colonne **Fit produit** au tableau du backlog (Fort / Moyen / Faible) quand `productContext` est chargé, pour rendre le facteur lisible.

## Étape 6 — Produire le backlog

---

# Backlog éditorial GEO — [Nom du projet]

> Issu de N fan-outs analysés · Filtre appliqué : [$ARGUMENTS ou "aucun"]

## Top 20 sujets prioritaires

| # | Sujet (fan-out) | Intent | Fréquence | LLMs concernés | Statut | Score |
|---|---|---|---|---|---|---|

Tri par score décroissant. Format `Sujet` = la requête fan-out telle quelle (titre d'article potentiel).

## Répartition par intent

| Intent | Nb sujets prioritaires | Nb cumulés |
|---|---|---|

## Répartition par LLM

Quels LLMs sont les plus exigeants ?

| LLM | Fan-outs uniques | Sujets non couverts |
|---|---|---|

## 5 sujets à attaquer en priorité (synthèse)

Pour chaque sujet du top 5 du backlog, justifie en 2 lignes :
- Pourquoi ce sujet (intent + LLMs touchés)
- Format suggéré (article comparatif, guide, page produit, étude de cas, etc.)
- Slash command pour aller plus loin : `/mentionable-brief "<le fan-out>"`

---

## Règles strictes

- **Le sujet d'article = le fan-out tel quel** : on ne reformule pas, on attaque la requête réelle du LLM
- **Exclure les fan-outs déjà couverts** sauf si le score reste très élevé
- **Détecter les doublons sémantiques** : si 3 fan-outs disent la même chose, regrouper et sommer les fréquences
- **Pas d'invention** : ne pas inventer de fan-outs non présents dans la liste
- **Tone exec** : factuel, pas de prose marketing
