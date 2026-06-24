#!/usr/bin/env node
/**
 * build-article-meta.mjs
 *
 * Génère jsonld.json + sources.json + meta.json pour un sujet, à partir des
 * article.md (fr/ et en/) et de l'entrée correspondante du editorial-calendar.json.
 *
 * Parsing : frontmatter YAML léger + corps Markdown (H2, FAQ, liens, citations, stats).
 * Les sources sont déduites des liens sortants présents dans l'article, croisés avec
 * un registre de domaines d'autorité connus.
 *
 * Usage :
 *   node scripts/build-article-meta.mjs --project-slug exolead --topic-slug alternatives-to-waalaxy
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const k = argv[i].slice(2); const n = argv[i + 1]; if (n && !n.startsWith('--')) { a[k] = n; i++; } else a[k] = true; }
  }
  return a;
}
const args = parseArgs(process.argv);
const projectSlug = args['project-slug'];
const topicSlug = args['topic-slug'];
if (!projectSlug || !topicSlug) { console.error('Usage: --project-slug <slug> --topic-slug <slug>'); process.exit(1); }

const root = process.cwd();
const cal = JSON.parse(readFileSync(join(root, 'projects', projectSlug, 'editorial-calendar.json'), 'utf8'));
const item = cal.items.find((it) => it.topicSlug === topicSlug);
if (!item) { console.error(`Sujet introuvable dans le calendrier: ${topicSlug}`); process.exit(1); }

const SOURCE_REGISTRY = {
  'business.linkedin.com': { fr: 'LinkedIn Sales Solutions', en: 'LinkedIn Sales Solutions' },
  'superoffice.com': { fr: 'SuperOffice — statistiques social selling (IDC, Accenture, Aberdeen, Sales for Life, Corporate Visions)', en: 'SuperOffice — social selling statistics (IDC, Accenture, Aberdeen, Sales for Life, Corporate Visions)' },
  'gartner.com': { fr: "Gartner — recherche sur le parcours d'achat B2B", en: 'Gartner — B2B buying journey research' },
  '6sense.com': { fr: '6sense — Buyer Experience Report (Dark Funnel)', en: '6sense — Buyer Experience Report (Dark Funnel)' },
  'linkedin.com': { fr: 'LinkedIn Help — limites et restrictions de compte', en: 'LinkedIn Help — account limits and restrictions' },
};
const BASE_URL = 'https://exolead.ai';

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return { fm, body: md };
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (mm) { let v = mm[2].trim(); if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1); fm[mm[1]] = v; }
  }
  return { fm, body: md.slice(m[0].length) };
}

function strip(s) {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`>]/g, '').replace(/\s+/g, ' ').trim();
}

function buildFor(lang) {
  const dir = join(root, 'projects', projectSlug, 'articles', topicSlug, lang);
  const mdPath = join(dir, 'article.md');
  if (!existsSync(mdPath)) return null;
  const raw = readFileSync(mdPath, 'utf8');
  const { fm, body } = parseFrontmatter(raw);

  const lines = body.split('\n');
  const h2s = lines.filter((l) => /^## /.test(l)).map((l) => l.replace(/^##\s+/, '').trim());
  const contentH2 = h2s.filter((h) => !/^(FAQ|Pour aller plus loin|Related reading)/i.test(h));

  // FAQ
  const faqIdx = lines.findIndex((l) => /^##\s+FAQ\s*$/.test(l));
  const faq = [];
  if (faqIdx >= 0) {
    let i = faqIdx + 1;
    while (i < lines.length && !/^##\s+/.test(lines[i])) {
      if (/^###\s+/.test(lines[i])) {
        const q = lines[i].replace(/^###\s+/, '').trim();
        let ans = '';
        i++;
        while (i < lines.length && !/^###\s+/.test(lines[i]) && !/^##\s+/.test(lines[i])) {
          if (lines[i].trim()) ans += (ans ? ' ' : '') + lines[i].trim();
          i++;
        }
        faq.push({ q, a: strip(ans) });
      } else i++;
    }
  }

  const outbound = [...body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
  const internal = [...body.matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)].length;
  const quoteCount = lang === 'fr' ? (body.match(/«/g) || []).length : Math.floor((body.replace(/^---[\s\S]*?---/, '').match(/"/g) || []).length / 2);
  const statCount = (body.match(/\d+\s?%|\$\s?\d|\b\d[\d.,]*\s?(millions?|million|M\b)/gi) || []).length;

  // Sources depuis les liens sortants
  const seen = new Set();
  const sources = [];
  for (const url of outbound) {
    let host; try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { continue; }
    if (!SOURCE_REGISTRY[host] || seen.has(url)) continue;
    seen.add(url);
    sources.push({ url, domain: host, title: SOURCE_REGISTRY[host][lang], usedFor: ['stat', 'fact'], extractStatus: 'ok' });
  }

  const slug = fm.slug;
  const canonical = `${BASE_URL}/${slug}`;
  const inLanguage = lang === 'fr' ? 'fr-FR' : 'en-US';
  const keywords = (fm.keywords || '').replace(/^\[|\]$/g, '').split(',').map((k) => k.trim().replace(/^"|"$/g, '')).filter(Boolean);

  const graph = [
    {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: fm.title,
      description: fm.description,
      image: null,
      datePublished: fm.date,
      dateModified: item.publishDate,
      wordCount: Number(fm.wordCount) || null,
      inLanguage,
      keywords,
      author: { '@type': 'Person', name: fm.author, url: `${BASE_URL}/a-propos`, jobTitle: lang === 'fr' ? "Fondateur d'exolead" : 'Founder of exolead' },
      publisher: { '@type': 'Organization', name: 'exolead', url: BASE_URL },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    },
  ];
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage', '@id': `${canonical}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  graph.push({
    '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'fr' ? 'Accueil' : 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: fm.title, item: canonical },
    ],
  });

  writeFileSync(join(dir, 'jsonld.json'), JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2) + '\n');
  writeFileSync(join(dir, 'sources.json'), JSON.stringify({ fetchedAt: item.publishDate, sources }, null, 2) + '\n');
  writeFileSync(join(dir, 'meta.json'), JSON.stringify({
    title: fm.title, slug, lang, topicSlug, cluster: item.cluster, publishDate: item.publishDate,
    description: fm.description, wordCount: Number(fm.wordCount) || null,
    h2Count: contentH2.length, faqCount: faq.length, outboundLinkCount: outbound.length, internalLinkCount: internal,
    quoteCount, statCount, keywords, intent: item.intent, pillarSlug: args.pillar || null, createdAt: item.publishDate,
  }, null, 2) + '\n');

  return { lang, h2: contentH2.length, faq: faq.length, outbound: outbound.length, sources: sources.length, quoteCount, statCount };
}

const out = ['fr', 'en'].map(buildFor).filter(Boolean);
for (const o of out) console.log(`  ${topicSlug}/${o.lang} : ${o.h2} H2 · ${o.faq} FAQ · ${o.outbound} liens sortants · ${o.sources} sources · ${o.quoteCount} citation(s) · ${o.statCount} stats`);
