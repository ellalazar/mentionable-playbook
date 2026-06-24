#!/usr/bin/env node
/**
 * relink-cluster.mjs
 *
 * Backfill du maillage interne pour un cluster, à une date donnée.
 *
 * Le publishing est échelonné : un article ne peut lier que des URLs déjà en ligne.
 * Quand un nouvel article passe live, ce script régénère le bloc de liens internes
 * (entre <!-- maillage:start --> et <!-- maillage:end -->) de TOUS les articles du
 * cluster déjà en ligne à la date --as-of, pour qu'ils pointent les uns vers les
 * autres. Aucun lien mort : on ne référence que les articles dont publishDate <= as-of.
 *
 * Met aussi à jour dateModified dans jsonld.json (signal de fraîcheur).
 *
 * Usage :
 *   node scripts/relink-cluster.mjs --project-slug exolead --cluster linkedin-engagement --as-of 2026-06-05
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      const n = argv[i + 1];
      if (n && !n.startsWith('--')) { a[k] = n; i++; } else a[k] = true;
    }
  }
  return a;
}

const args = parseArgs(process.argv);
const projectSlug = args['project-slug'];
const cluster = args['cluster'];
const asOf = args['as-of'];
if (!projectSlug || !cluster || !asOf) {
  console.error('Usage: node scripts/relink-cluster.mjs --project-slug <slug> --cluster <clusterId> --as-of <YYYY-MM-DD>');
  process.exit(1);
}

const root = process.cwd();
const calPath = join(root, 'projects', projectSlug, 'editorial-calendar.json');
if (!existsSync(calPath)) { console.error(`editorial-calendar.json introuvable: ${calPath}`); process.exit(1); }
const cal = JSON.parse(readFileSync(calPath, 'utf8'));

// Articles du cluster déjà en ligne à as-of
const live = cal.items.filter((it) => it.cluster === cluster && it.publishDate <= asOf);
if (live.length === 0) { console.log(`Aucun article live pour ${cluster} au ${asOf}.`); process.exit(0); }

const LANGS = [
  { lang: 'fr', slugKey: 'slugFr', titleKey: 'titleFr', heading: 'À lire aussi' },
  { lang: 'en', slugKey: 'slugEn', titleKey: 'titleEn', heading: 'Related reading' },
];

let touched = 0;
for (const { lang, slugKey, titleKey } of LANGS) {
  for (const item of live) {
    const dir = join(root, 'projects', projectSlug, 'articles', item.topicSlug, lang);
    const mdPath = join(dir, 'article.md');
    if (!existsSync(mdPath)) continue; // pas encore généré dans cette langue

    const siblings = live
      .filter((s) => s.topicSlug !== item.topicSlug)
      .sort((a, b) => a.publishDate.localeCompare(b.publishDate));

    const links = siblings.map((s) => `- [${s[titleKey]}](/${s[slugKey]})`).join('\n');
    const block = `<!-- maillage:start -->\n${links ? links + '\n' : ''}<!-- maillage:end -->`;

    let md = readFileSync(mdPath, 'utf8');
    if (!md.includes('<!-- maillage:start -->')) continue; // pas de bloc maillage, on ne touche pas
    md = md.replace(/<!-- maillage:start -->[\s\S]*?<!-- maillage:end -->/, block);
    writeFileSync(mdPath, md);
    touched++;

    // Bump dateModified dans le JSON-LD
    const jsonldPath = join(dir, 'jsonld.json');
    if (existsSync(jsonldPath)) {
      try {
        const doc = JSON.parse(readFileSync(jsonldPath, 'utf8'));
        const graph = Array.isArray(doc['@graph']) ? doc['@graph'] : [];
        for (const node of graph) if (node['@type'] === 'Article') node.dateModified = asOf;
        writeFileSync(jsonldPath, JSON.stringify(doc, null, 2) + '\n');
      } catch { /* ignore */ }
    }
  }
}

console.log(`Relink ${cluster} @ ${asOf} : ${live.length} sujet(s) live, ${touched} fichier(s) mis à jour.`);
