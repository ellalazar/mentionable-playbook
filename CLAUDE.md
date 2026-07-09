# Writing guidelines — Mentionable Playbook

> This file is **loaded automatically** by Claude Code in every conversation and **must be re-read in full** at the start of any content-writing task (`/mentionable-article`, or any other editorial task). These rules apply to the content published by playbook users; they do not govern the repo's internal documentation.

## Output language

Published content is produced in the **project's language**, read from the `language` field in `projects/<projectSlug>/.project.json` (default: `en` when the field or file is absent).

Two rule sets live below: one for **English content**, one for **French content**. Apply the block that matches the project language. If a project targets another language, follow the English block's principles (they are largely language-agnostic) and adapt the banned-vocabulary list to that language's AI tells.

## Why these rules exist

LLMs have **statistically detectable writing tics**. Anti-AI detectors (Originality.ai, GPTZero, Copyleaks, Winston AI, Sapling) rely heavily on these signatures. More importantly: human readers recognize the patterns too, and lose trust. A good GEO strategy (cite-sources, quotation, statistics) is wasted if the prose itself screams "AI-generated."

These guidelines aim for prose that **reads like expert human content**, because editorial voice is one of the last real differentiators.

---

# English content rules

### Banned punctuation

1. **No em-dash** (`—`, U+2014). Ever. Under any form. It is the number-one signal.
2. **No en-dash** (`–`, U+2013) outside numeric ranges (`2019–2024` is fine). Never inside a sentence.
3. **No Unicode ellipsis** (`…`). If an ellipsis is truly needed, use three ASCII dots `...`, and rarely.
4. Use standard straight double quotes (`"..."`) for quotations. No smart-quote inconsistency within a document.

### Mandatory substitutions

Where an em-dash feels natural, use instead:
- **A comma**: "NVC is not a magic trick, it is an inner posture."
- **A semicolon**: "NVC takes patience; it is a practice built over months."
- **Parentheses**: "Marshall Rosenberg (an American psychologist who studied under Carl Rogers) developed the method in the 1960s."
- **Two separate sentences**: "NVC is not a magic trick. It is an inner posture."

### Banned vocabulary (English)

These words and phrases are AI tells. Remove or replace:

| Banned | Replacement |
|---|---|
| delve into / dive into | look at, examine, get into |
| navigate (figurative) | handle, work through, manage |
| crucial / essential / vital | important, or cut it |
| unlock / unleash | cut, or use a concrete verb |
| landscape / realm / tapestry (figurative) | field, world, area |
| leverage (as a verb) | use |
| seamless / robust (as filler) | cut, or be specific |
| game-changer / revolutionary | cut |
| testament to / boasts | show it instead |
| elevate / supercharge / turbocharge | cut |
| it's worth noting that | start the sentence directly |
| it is important to note that | cut |
| furthermore / moreover | also, and |
| that said / with that being said | but, still |
| in today's fast-paced world | cut |
| when it comes to X | for X, in X |
| at the end of the day | cut |
| whether you're X or Y | cut, or say it directly |

### Constructions to avoid

1. **Systematic rule of three**: "X, Y, and Z." on repeat. Fine once; not as a pattern.
2. **Anaphora in threes**: "You want X. You want Y. You want Z." Classic AI tic. Once per article maximum, and only if the rhetorical effect is deliberate.
3. **"Not X, but Y" / "It's not about X, it's Y"**: heavy tic. Once per article maximum; prefer a direct positive statement ("Y.").
4. **Rapid-fire rhetorical questions** in the intro: "Have you ever...? Do you feel...? Do you recognize...?" One hook question at most, not three.
5. **Bullet points with bold + colon + paraphrase**: `**Concept:** explanation of the concept` repeated five times in a row. Vary list structure. Prefer full sentences between bullets.
6. **Concluding paragraphs that summarize the article**: "We've seen that X, Y, and Z." Cut it. Well-written prose does not need a recap.

### Structural tics to break

- **Vary sentence length**. AI drifts toward continuous medium-long sentences (15-25 words). Humans alternate: short (3-8 words), long (30+), the occasional fragment.
- **Fragments allowed**. "Too late." "And yet." "Not that simple." Humans use them; AI avoids them.
- **Active voice first**. Not "it is necessary that communication be improved" but "we need to improve communication."
- **Not every paragraph is a transition**. If a paragraph opens with "However," "That said," "Furthermore," "Moreover," that is an AI signal. One or two transition-led paragraphs in a whole article, maximum.

---

# French content rules

### Ponctuation interdite

1. **Aucun em-dash** (`—`, U+2014). Jamais. Sous aucune forme. C'est le signal numéro un.
2. **Aucun en-dash** (`–`, U+2013) hors plages chiffrées (`2019–2024` OK). Pas dans une phrase.
3. **Pas d'ellipses Unicode** (`…`). Si une ellipse est nécessaire, utiliser trois points ASCII `...` et rarement.
4. **Pas de guillemets droits anglais** (`" "`) dans un texte français. Toujours les chevrons français : `«  »` avec espaces insécables.

### Substitutions obligatoires

Quand un em-dash semble naturel, utiliser au choix :
- **Une virgule** : « La CNV n'est pas une technique magique, c'est une posture intérieure. »
- **Un point-virgule** : « La CNV demande de la patience ; c'est un apprentissage de plusieurs mois. »
- **Une parenthèse** : « Marshall Rosenberg (psychologue américain élève de Carl Rogers) a développé la méthode dans les années 1960. »
- **Deux phrases séparées** : « La CNV n'est pas une technique magique. C'est une posture intérieure. »

### Vocabulaire banni (français)

Ces mots/expressions sont des signaux IA français. À supprimer ou remplacer :

| Banni | Remplacement |
|---|---|
| « plongeons dans » / « plonger au cœur de » | entrer dans, comprendre, examiner |
| « naviguer » (au sens figuré) | traverser, gérer, parcourir |
| « véritable » (adjectif d'emphase) | retirer, ou « vrai » |
| « véritablement » | vraiment, ou supprimer |
| « littéralement » (au sens figuré) | supprimer |
| « absolument » (en intensificateur) | supprimer |
| « au cœur de » | dans, au centre de, au milieu de |
| « écosystème » (hors tech) | environnement, milieu |
| « univers » (au sens figuré) | monde, domaine |
| « panorama » | aperçu, tour d'horizon |
| « fascinant » / « captivant » | retirer, ou montrer pourquoi c'est intéressant |
| « incontournable » | central, important, utile |
| « il est essentiel de » | il faut, on doit, mieux vaut |
| « il convient de » | il faut |
| « il est important de noter que » | retirer ; commencer la phrase directement |
| « il s'agit de » | c'est, ça consiste à |
| « en somme » / « en conclusion » | retirer, ou « bref » |
| « par ailleurs » | aussi, en plus |
| « en effet » (en début de phrase) | retirer souvent |
| « ainsi » (en début de phrase) | retirer, ou « donc » |
| « découvrez » / « boostez » / « transformez » (impératif marketing) | retirer |
| « révolutionnaire » | retirer |
| « unique en son genre » | retirer |
| « que vous soyez X ou Y » | retirer, ou phrasing direct |
| « n'est-ce pas justement... » | retirer |

### Constructions à éviter

1. **Triade rythmique systématique** : « X, Y et Z. » répété en boucle. Acceptable une fois ; pas en pattern.
2. **Anaphore par trois** : « Vous voulez X. Vous voulez Y. Vous voulez Z. » Tic IA classique. Maximum une fois par article, et uniquement si l'effet rhétorique est délibéré.
3. **« Pas X, mais Y » / « Il ne s'agit pas de X, c'est Y »** : tic massif. Utiliser une seule fois maximum par article, et préférer une formulation positive directe (« Y. »).
4. **Questions rhétoriques en rafale** en intro : « Avez-vous déjà... ? Vous sentez-vous... ? Vous reconnaissez-vous... ? ». Au maximum une question d'accroche, pas trois.
5. **Bullet points avec bold + colon + paraphrase** : `**Concept :** explication du concept` répété 5 fois d'affilée. Varie la structure des listes. Préfère des phrases pleines entre les bullets.
6. **Paragraphes de conclusion qui résument l'article** : « Nous avons vu que X, Y et Z. » À supprimer. Un article bien écrit n'a pas besoin de récapituler.

### Tics structurels à casser

- **Variation des longueurs de phrases**. Une IA tend vers des phrases médium-longues (15-25 mots) en continu. Les humains alternent : phrase courte (3-8 mots), phrase longue (30+), fragment occasionnel.
- **Fragments autorisés**. « Trop tard. » « Et pourtant. » « Pas si simple. » Les humains les utilisent ; les IA évitent.
- **Voix active prioritaire**. Pas « il est nécessaire que la communication soit améliorée » mais « il faut améliorer la communication ».
- **Pas tous les paragraphes en transition**. Si un paragraphe commence par « Cependant », « Toutefois », « Par ailleurs », « En outre », c'est un signal IA. Maximum 1-2 paragraphes avec transition dans un article entier.

---

# Patterns to favor (human signal)

These apply in any language:

1. **Specific, personal detail**. "Last week, in a session, a client told me..." rather than "it often happens that people...".
2. **Controlled imperfection**. A parenthesis that digresses. A firm opinion. An "I'm not convinced." An honest concession.
3. **Concrete over abstract vocabulary**. "Yesterday at 10pm, after dinner, she said..." rather than "in an evening family context."
4. **Short sentences for strong ideas**. The punchline is never a 30-word sentence.
5. **Direct quotes attributed by name**. Princeton GEO tactic (+25-35% citation rate) and a human signal (few AIs risk attributing a verbatim quote because they might invent it).

## Self-check before delivering an article

Before writing the final `article.md`, run the text mentally through this checklist (against the block matching the project language):

1. **Zero em-dash** (`—`) anywhere in the file? If any, replace each.
2. **No banned-list word** present? If any, replace.
3. **At most one anaphora-in-threes** in the whole article?
4. **At most one "not X, but Y"**?
5. **No more than two paragraphs opening with a transition** (However, That said, Furthermore / Cependant, Toutefois, Par ailleurs)?
6. **Visible sentence-length variation** in each section?
7. **At least one direct quote** with a named attribution?
8. **Specific detail** (place, time, name, number) rather than generic phrasing?

If any check fails, **fix the offending passage before writing the file**.

## Special cases

- **Code, JSON, markdown tables**: these guidelines do not apply to technical blocks. Chevrons and em-dashes may appear there if they are code.
- **Verbatim author quotes**: if an original source uses an em-dash, keep it inside the quotation marks. Never alter a quote.
- **Internal repo documentation** (README, playbooks, docs `.md` files): these files may use em-dashes and more AI-friendly structure since they are not published content.

## When these rules do not apply

- Conversations inside Claude Code (replies to the user): free, natural style.
- Generating plans, briefs, JSON, JSON-LD: technical, not concerned.
- Playbook documentation (README, docs/, playbooks/): technical, not concerned.

These rules govern **content written for publication or for identifiable one-to-one contact**:
- `article.md` produced by `/mentionable-article`, or any other long-form writing meant for a website;
- outreach emails and LinkedIn DMs produced by `/mentionable-outreach` (a human recipient spots AI patterns as fast as an article reader, often faster, because they get dozens of cold emails a week).

For emails and DMs, in addition to the rules above:
- No "I hope this email finds you well" / "J'espère que ce message vous trouve bien" openers.
- No overloaded marketing signature (4 lines + emojis + tagline). Human signature: first name + one optional link.
- Strict length: email 200-300 words max, LinkedIn DM 60-90 words.

---

**Reminder for the agent**: at the first step of `/mentionable-article` (or any long-form writing task), re-read this file in full, determine the project language, then keep the matching checklist active throughout the writing.
