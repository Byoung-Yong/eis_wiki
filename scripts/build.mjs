import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import fg from 'fast-glob';
import yaml from 'js-yaml';
import {marked} from 'marked';
import katex from 'katex';
import {build as esbuild} from 'esbuild';
import {buildGraphArtifacts} from './graph-layout.mjs';

const root = process.cwd();
const content = path.join(root, 'content');
const dist = path.join(root, 'dist');
const siteConfig = JSON.parse(fs.readFileSync(path.join(root, 'config', 'site.json'), 'utf8'));
const domainMap = Object.fromEntries((siteConfig.domains || []).map((d) => [d.id, {label: d.label, label_en: d.label_en, color: d.color}]));
const checkOnly = process.argv.includes('--check');
const files = await fg(['note/*.md', 'moc/*.md', 'graph/*.md', 'pages/*.md'], {cwd: content, absolute: true});

const parse = (file) => {
  const raw = fs.readFileSync(file, 'utf8').normalize('NFC');
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  let meta = {}; let body = raw;
  if (match) { meta = yaml.load(match[1]) || {}; body = raw.slice(match[0].length); }
  return {file, meta, body, raw};
};
const docs = files.map(parse);
const errors = []; const warnings = []; const byId = new Map(); const titleMap = new Map();
const addTitle = (value, doc) => {
  if (!value) return;
  const key = String(value).trim().toLowerCase();
  const previous = titleMap.get(key);
  if (previous && previous.meta.id !== doc.meta.id) errors.push(`ambiguous title or alias: ${value} (${previous.meta.id}, ${doc.meta.id})`);
  else titleMap.set(key, doc);
};
for (const doc of docs) {
  const meta = doc.meta;
  if (!meta.id) errors.push(`missing id: ${doc.file}`);
  else if (byId.has(meta.id)) errors.push(`duplicate id: ${meta.id}`);
  else byId.set(meta.id, doc);
  if (!meta.title) errors.push(`missing title: ${doc.file}`);
  addTitle(meta.title, doc); addTitle(meta.title_en, doc); for (const alias of meta.aliases || []) addTitle(alias, doc);
  if (path.basename(doc.file) !== path.basename(doc.file).normalize('NFC')) errors.push(`non-NFC filename: ${doc.file}`);
  if (/source_anchor|passage_id|source_page|source_chapter|book_page/i.test(doc.raw)) errors.push(`forbidden source-location metadata: ${doc.file}`);
  if (doc.raw.includes('\uFFFD')) errors.push(`replacement character: ${doc.file}`);
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(doc.raw)) errors.push(`control character: ${doc.file}`);
}
const wikiRe = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
for (const doc of docs) {
  for (const relation of doc.meta.relations || []) {
    if (!relation.target || !byId.has(relation.target)) errors.push(`bad relation target ${relation.target} in ${doc.meta.id}`);
  }
  for (const match of doc.body.matchAll(wikiRe)) {
    if (!titleMap.has(match[1].trim().toLowerCase())) errors.push(`unresolved wikilink ${match[1]} in ${doc.meta.id}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
if (checkOnly) { console.log(JSON.stringify({documents: docs.length, errors: 0, warnings}, null, 2)); process.exit(0); }

fs.rmSync(dist, {recursive: true, force: true});
fs.mkdirSync(path.join(dist, 'assets'), {recursive: true});
fs.mkdirSync(path.join(dist, 'data'), {recursive: true});
const katexSrc = path.join(root, 'node_modules', 'katex', 'dist');
const katexDst = path.join(dist, 'assets', 'katex');
fs.mkdirSync(katexDst, {recursive: true});
fs.copyFileSync(path.join(katexSrc, 'katex.min.css'), path.join(katexDst, 'katex.min.css'));
fs.cpSync(path.join(katexSrc, 'fonts'), path.join(katexDst, 'fonts'), {recursive: true});

function renderMarkdown(markdown, documentId) {
  const tokens = [];
  const tokenSeed = crypto.createHash('sha1').update(String(documentId || markdown)).digest('hex').slice(0, 12).toUpperCase();
  const token = (index) => `@@KGW_MATH_${tokenSeed}_${index}@@`;
  let source = markdown;
  source = source.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    const index = tokens.length;
    tokens.push({html: katex.renderToString(latex.trim(), {displayMode: true, throwOnError: false}), display: true});
    return `\n${token(index)}\n`;
  });
  source = source.replace(/(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g, (_, latex) => {
    const index = tokens.length;
    tokens.push({html: katex.renderToString(latex.trim(), {displayMode: false, throwOnError: false}), display: false});
    return token(index);
  });
  source = source.replace(wikiRe, (_, target, label) => `<a href="#" class="wiki-link" data-title="${target.trim().replace(/"/g, '&quot;')}">${label || target}</a>`);
  let html = marked.parse(source, {gfm: true});
  for (let index = 0; index < tokens.length; index += 1) {
    const placeholder = token(index);
    const rendered = tokens[index].display ? `<div class="math-display">${tokens[index].html}</div>` : `<span class="math-inline">${tokens[index].html}</span>`;
    html = html.replaceAll(`<p>${placeholder}</p>`, rendered).replaceAll(placeholder, rendered);
  }
  return html;
}

const nodes = []; const edges = []; const outputDocuments = [];
for (const doc of docs) {
  if (doc.meta.publish === false && process.env.VERCEL_ENV === 'production') continue;
  const html = renderMarkdown(doc.body, doc.meta.id || doc.file);
  const item = {...doc.meta, html, body: doc.body, file: path.relative(content, doc.file).replaceAll('\\', '/')};
  outputDocuments.push(item);
  nodes.push({id: item.id, label: item.title, label_en: item.title_en || '', type: item.type || 'Concept', domain: item.domain || 'general', degree: 0});
  for (const relation of item.relations || []) edges.push({source: item.id, target: relation.target, relation: relation.type, confidence: Number(relation.confidence ?? 1)});
}
const degree = new Map();
for (const edge of edges) { degree.set(edge.source, (degree.get(edge.source) || 0) + 1); degree.set(edge.target, (degree.get(edge.target) || 0) + 1); }
for (const node of nodes) node.degree = degree.get(node.id) || 0;

const graphArtifacts = buildGraphArtifacts(outputDocuments, edges, siteConfig);
const data = {
  version: siteConfig.version,
  generated_at: new Date().toISOString(),
  site: siteConfig,
  macros: siteConfig.macroGroups || {},
  documents: outputDocuments,
  nodes,
  edges,
  domains: domainMap,
  globalGraph: graphArtifacts.semantic,
  graphMetrics: graphArtifacts.metrics,
};
const json = JSON.stringify(data);
fs.writeFileSync(path.join(dist, 'data', 'wiki-data.json'), json);
fs.writeFileSync(path.join(dist, 'data', 'wiki-data.js'), `window.KGW_DATA=${json};`);
fs.writeFileSync(path.join(dist, 'data', 'validation.json'), JSON.stringify({
  documents: outputDocuments.length, nodes: nodes.length, edges: edges.length,
  semanticNodes: graphArtifacts.metrics.nodeCount, semanticEdges: graphArtifacts.metrics.semanticEdgeCount,
  directSemanticEdges: graphArtifacts.metrics.directSemanticEdgeCount, scaffoldEdges: graphArtifacts.metrics.scaffoldEdgeCount,
  communities: graphArtifacts.metrics.selectedCommunityCount, modularity: graphArtifacts.metrics.modularity,
  errors: 0, warnings,
}, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'graph-semantic.json'), JSON.stringify(graphArtifacts.semantic, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'graph-structural.json'), JSON.stringify(graphArtifacts.structural, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'graph-layout-prototype-a.json'), JSON.stringify(graphArtifacts.prototypes.standard, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'graph-layout-prototype-b.json'), JSON.stringify(graphArtifacts.prototypes.linlog, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'graph-layout.json'), JSON.stringify({
  variant: graphArtifacts.semantic.layoutVariant,
  nodes: graphArtifacts.semantic.nodes.map((node) => ({id: node.id, x: node.x, y: node.y, community: node.community, score: node.score, weightedDegree: node.weightedDegree, pagerank: node.pagerank, betweenness: node.betweenness, crossCommunityDegree: node.crossCommunityDegree})),
}, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'graph-metrics.json'), JSON.stringify(graphArtifacts.metrics, null, 2));
for (const filename of ['index.html', 'styles.css']) fs.copyFileSync(path.join(root, 'src', filename), path.join(dist, filename === 'index.html' ? filename : `assets/${filename}`));
await esbuild({entryPoints: [path.join(root, 'src', 'app.js')], bundle: true, platform: 'browser', format: 'iife', target: ['es2020'], outfile: path.join(dist, 'assets', 'app.js'), logLevel: 'silent'});
console.log(JSON.stringify({
  documents: outputDocuments.length, nodes: nodes.length, edges: edges.length,
  semanticNodes: graphArtifacts.metrics.nodeCount, semanticEdges: graphArtifacts.metrics.semanticEdgeCount,
  directSemanticEdges: graphArtifacts.metrics.directSemanticEdgeCount, scaffoldEdges: graphArtifacts.metrics.scaffoldEdgeCount,
  communities: graphArtifacts.metrics.selectedCommunityCount, modularity: Number((graphArtifacts.metrics.modularity || 0).toFixed(4)),
  layout: graphArtifacts.semantic.layoutVariant, dist,
}, null, 2));
