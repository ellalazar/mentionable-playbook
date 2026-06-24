#!/usr/bin/env node
/**
 * editorial-calendar.mjs
 *
 * Génère un calendrier éditorial daté à partir d'un clusters.json produit par
 * /mentionable-clusters. Un "slot" = un sujet. En mode bilingue, les versions
 * FR et EN d'un sujet sortent le MÊME jour (un seul slot pour les deux).
 *
 * Les sujets sont ordonnés par priorité éditoriale (cluster.priorityRank croissant,
 * puis ordre des topics dans le cluster), et datés à partir de --start en avançant
 * de --cadence-days jours à chaque slot.
 *
 * Le champ publishDate alimente le frontmatter `date:` des articles (= date de mise
 * en ligne réelle dans le système de publication). /mentionable-article lit ce
 * fichier pour stamper le bon `date:` au lieu de la date du jour.
 *
 * Usage :
 *   node scripts/editorial-calendar.mjs --project-slug exolead --snapshot 2026-06-01 \
 *        --start 2026-06-09 --cadence-days 2
 *
 * Options :
 *   --project-slug <slug>   (requis) dossier projects/<slug>/
 *   --snapshot <YYYY-MM-DD> (requis) sous-dossier discovery/<snapshot>/clusters.json
 *   --start <YYYY-MM-DD>    (requis) date de publication du 1er slot
 *   --cadence-days <int>    (défaut 2) jours entre deux publications
 *   --order <a,b,c>         (optionnel) ids de clusters dans l'ordre voulu ;
 *                           sinon tri par priorityRank croissant
 *
 * Idempotent vis-à-vis du statut : si editorial-calendar.json existe déjà, le champ
 * `status` (pending|done) de chaque sujet est préservé par slug canonique.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { args[key] = next; i++; }
      else { args[key] = true; }
    }
  }
  return args;
}

function isoDateUTC(baseISO, addDays) {
  const [y, m, d] = baseISO.split('-').map(Number);
  const ms = Date.UTC(y, m - 1, d) + addDays * 86400000;
  const dt = new Date(ms);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

const args = parseArgs(process.argv);
const projectSlug = args['project-slug'];
const snapshot = args['snapshot'];
const start = args['start'];
const cadence = parseInt(args['cadence-days'] || '2', 10);

if (!projectSlug || !snapshot || !start) {
  console.error('Usage: node scripts/editorial-calendar.mjs --project-slug <slug> --snapshot <YYYY-MM-DD> --start <YYYY-MM-DD> [--cadence-days 2] [--order id1,id2,...]');
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
  console.error(`--start invalide: "${start}" (attendu YYYY-MM-DD)`);
  process.exit(1);
}

const root = process.cwd();
const clustersPath = join(root, 'projects', projectSlug, 'discovery', snapshot, 'clusters.json');
if (!existsSync(clustersPath)) {
  console.error(`clusters.json introuvable: ${clustersPath}`);
  process.exit(1);
}
const clustersDoc = JSON.parse(readFileSync(clustersPath, 'utf8'));

// Ordre des clusters
let clusters = [...clustersDoc.clusters];
if (typeof args['order'] === 'string') {
  const order = args['order'].split(',').map((s) => s.trim());
  clusters.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
} else {
  clusters.sort((a, b) => (a.priorityRank ?? 99) - (b.priorityRank ?? 99));
}

// Préserver statut + date des articles déjà produits (done = épinglé à sa date)
const outJsonPath = join(root, 'projects', projectSlug, 'editorial-calendar.json');
const prevStatus = {};
const prevDate = {};
if (existsSync(outJsonPath)) {
  try {
    const prev = JSON.parse(readFileSync(outJsonPath, 'utf8'));
    for (const it of prev.items || []) { prevStatus[it.topicSlug] = it.status; prevDate[it.topicSlug] = it.publishDate; }
  } catch { /* ignore */ }
}

// Aplatir les sujets dans l'ordre des clusters (priorityRank)
const flat = [];
for (const cluster of clusters) {
  for (const t of cluster.topics || []) {
    flat.push({ cluster, t, topicSlug: t.slugEn }); // slug canonique = dossier (EN)
  }
}

// Les dates des articles done sont épinglées ; on ne les réattribue pas
const pinnedDates = new Set();
for (const f of flat) {
  if (prevStatus[f.topicSlug] === 'done' && prevDate[f.topicSlug]) pinnedDates.add(prevDate[f.topicSlug]);
}
// Générateur de dates séquentielles à la cadence, en sautant les dates épinglées
let dateIdx = 0;
function nextFreeDate() {
  let d;
  do { d = isoDateUTC(start, dateIdx * cadence); dateIdx++; } while (pinnedDates.has(d));
  return d;
}

const items = [];
for (const { cluster, t, topicSlug } of flat) {
  const done = prevStatus[topicSlug] === 'done' && prevDate[topicSlug];
  const publishDate = done ? prevDate[topicSlug] : nextFreeDate();
  items.push({
    slot: 0,
    publishDate,
    cluster: cluster.id,
    clusterTheme: cluster.theme,
    clusterPriority: cluster.priorityRank ?? null,
    intent: t.intent || cluster.intent,
    topicSlug,
    titleFr: t.titleFr,
    slugFr: t.slugFr,
    pathFr: `projects/${projectSlug}/articles/${topicSlug}/fr/`,
    titleEn: t.titleEn,
    slugEn: t.slugEn,
    pathEn: `projects/${projectSlug}/articles/${topicSlug}/en/`,
    status: prevStatus[topicSlug] || 'pending',
  });
}

// Tri chronologique + renumérotation des slots
items.sort((a, b) => a.publishDate.localeCompare(b.publishDate) || (a.clusterPriority - b.clusterPriority));
items.forEach((it, i) => { it.slot = i + 1; });

const lastDate = items.length ? items[items.length - 1].publishDate : start;
const out = {
  projectSlug,
  snapshotDate: snapshot,
  generatedFrom: `projects/${projectSlug}/discovery/${snapshot}/clusters.json`,
  bilingual: true,
  cadenceModel: 'one-topic-per-slot-fr-en-same-day',
  startDate: start,
  cadenceDays: cadence,
  totalSlots: items.length,
  firstPublish: items.length ? items[0].publishDate : null,
  lastPublish: lastDate,
  items,
};

mkdirSync(dirname(outJsonPath), { recursive: true });
writeFileSync(outJsonPath, JSON.stringify(out, null, 2) + '\n');

// Markdown lisible
const lines = [];
lines.push(`# Calendrier éditorial — ${projectSlug}`);
lines.push('');
lines.push(`> ${items.length} sujets · 1 sujet tous les ${cadence} jours · FR + EN publiés le même jour`);
lines.push(`> Du ${out.firstPublish} au ${out.lastPublish} · source : \`${out.generatedFrom}\``);
lines.push('');
lines.push('Le champ `publishDate` = la date du `date:` dans le frontmatter de l\'article (mise en ligne réelle). `/mentionable-article` lit ce calendrier pour stamper la bonne date.');
lines.push('');
lines.push('| # | Date | Cluster | Intent | Sujet (FR) | Statut |');
lines.push('|---|---|---|---|---|---|');
for (const it of items) {
  lines.push(`| ${it.slot} | ${it.publishDate} | ${it.clusterTheme} | ${it.intent} | ${it.titleFr} | ${it.status} |`);
}
lines.push('');
lines.push('## Ordre des clusters (priorité éditoriale)');
lines.push('');
let rank = 1;
for (const c of clusters) {
  const n = (c.topics || []).length;
  lines.push(`${rank}. **${c.theme}** (\`${c.id}\`) — ${n} sujets, intent ${c.intent}`);
  rank++;
}
lines.push('');
lines.push('> Pour ré-ordonner : `--order id1,id2,...` ; pour décaler : changer `--start` ; pour changer la cadence : `--cadence-days N`. Le statut `done` des sujets déjà produits est préservé d\'un run à l\'autre.');

const outMdPath = join(root, 'projects', projectSlug, 'editorial-calendar.md');
writeFileSync(outMdPath, lines.join('\n') + '\n');

console.log(`OK · ${items.length} slots · ${out.firstPublish} → ${out.lastPublish}`);
console.log(`  ${outJsonPath}`);
console.log(`  ${outMdPath}`);
