import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import forceAtlas2 from 'graphology-layout-forceatlas2';

const STRUCTURAL_RELATIONS = new Set(['PART_OF']);
const RELATION_WEIGHTS = {
  CALCULATED_FROM: 1.00,
  VIOLATES: 0.90,
  STATE_VARIABLE_OF: 0.92,
  DISCRETIZED_AS: 0.86,
  REDUCES_CONTRIBUTION_OF: 0.82,
  ACCOUNTS_FOR: 0.82,
  DETECTS: 0.78,
  SUPPORTS: 0.76,
  VARIES: 0.70,
  ADDRESSES: 0.68,
  USED_BY: 0.56,
  DERIVED_FROM: 1.00,
  DEFINED_BY: 0.98,
  PARAMETER_OF: 0.96,
  MODELED_BY: 0.94,
  DEPENDS_ON: 0.90,
  CAUSES: 0.90,
  RESULTS_FROM: 0.86,
  COUPLED_TO: 0.84,
  AFFECTS: 0.82,
  PRODUCES: 0.80,
  DECREASES: 0.78,
  REQUIRES: 0.78,
  TESTED_BY: 0.78,
  VALIDATED_BY: 0.78,
  SUPPORTED_BY: 0.76,
  PROBES: 0.74,
  CHARACTERIZES: 0.72,
  REPRESENTED_BY: 0.70,
  DESCRIBED_BY: 0.68,
  APPROXIMATED_BY: 0.64,
  LIMITED_BY: 0.62,
  ESTIMATED_BY: 0.62,
  IS_A: 0.58,
  HAS_COMPONENT: 0.56,
  HAS_SUBTYPE: 0.56,
  USES: 0.34,
  APPEARS_IN: 0.20,
  RELATED_TO: 0.15,
  TOPIC_PROXIMITY: 0.42,
  GRAPH_PROXIMITY: 0.24,
  DOMAIN_PROXIMITY: 0.08,
};
const RESOLUTIONS = [0.7, 0.9, 1.1, 1.3];
const COMMUNITY_PALETTE = [
  '#ef5b5b', '#4f7fe5', '#f29a3f', '#37c997', '#bc56d8', '#49b9de',
  '#e5c34f', '#8b72e8', '#5dbb63', '#df6fa9', '#69a8a3', '#c78d58',
  '#7aa6f7', '#ef8354', '#45b7a0', '#d66ba0', '#9a8cdb', '#8fbf5f',
  '#4ca3c7', '#d89d3c', '#6f8fcb', '#c979c6',
];

function hash32(value) {
  let h = 2166136261;
  const s = String(value);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function relationWeight(type) { return RELATION_WEIGHTS[type] ?? 0.42; }
function pairKey(a, b) { return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`; }
function minMax(values) {
  if (!values.length) return {min: 0, max: 1};
  return {min: Math.min(...values), max: Math.max(...values)};
}
function normalized(value, range) {
  const span = range.max - range.min;
  return span > 1e-12 ? (value - range.min) / span : 0;
}
function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] === undefined ? sorted[base] : sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

function buildCollapsedEdges(documents, rawEdges, siteConfig = {}) {
  const byId = new Map(documents.map((doc) => [doc.id, doc]));
  const noteDocs = documents.filter((d) => String(d.file || '').startsWith('note/'));
  const noteIds = new Set(noteDocs.map((d) => d.id));
  const titleToId = new Map();
  for (const doc of documents) {
    for (const value of [doc.title, doc.title_en, ...(doc.aliases || [])]) {
      if (value) titleToId.set(String(value).trim().toLowerCase(), doc.id);
    }
  }
  const structural = [];
  const merged = new Map();
  const directDegree = Object.fromEntries(noteDocs.map((doc) => [doc.id, 0]));

  function upsert(source, target, relation, weight, options = {}) {
    if (!noteIds.has(source) || !noteIds.has(target) || source === target) return;
    const key = pairKey(source, target);
    let item = merged.get(key);
    if (!item) {
      item = {
        source: source < target ? source : target,
        target: source < target ? target : source,
        weight: 0,
        maxWeight: 0,
        dominantRelation: relation,
        relationTypes: [],
        directedRelations: [],
        synthetic: true,
        scaffoldKinds: [],
      };
      merged.set(key, item);
    }
    if (!item.relationTypes.includes(relation)) item.relationTypes.push(relation);
    if (options.scaffoldKind && !item.scaffoldKinds.includes(options.scaffoldKind)) item.scaffoldKinds.push(options.scaffoldKind);
    item.directedRelations.push({
      source, target, relation,
      confidence: Number(options.confidence ?? 1),
      synthetic: Boolean(options.synthetic),
      weight,
    });
    if (!options.synthetic) item.synthetic = false;
    if (weight > item.maxWeight) {
      item.maxWeight = weight;
      item.dominantRelation = relation;
    }
  }

  for (const edge of rawEdges) {
    const sourceIsNote = noteIds.has(edge.source);
    const targetIsNote = noteIds.has(edge.target);
    if (!sourceIsNote || !targetIsNote || STRUCTURAL_RELATIONS.has(edge.relation)) {
      structural.push(edge);
      continue;
    }
    const weight = relationWeight(edge.relation) * Number(edge.confidence ?? 1);
    upsert(edge.source, edge.target, edge.relation, weight, {confidence: edge.confidence, synthetic: false});
    directDegree[edge.source] += weight;
    directDegree[edge.target] += weight;
  }

  const enableScaffold = siteConfig.graphScaffold !== false;

  // Project note -> TopicMap membership into weak note-to-note proximity edges.
  // These edges are layout scaffolds, not new scientific claims.
  const topicChildren = new Map();
  for (const edge of rawEdges) {
    if (edge.relation !== 'PART_OF' || !noteIds.has(edge.source)) continue;
    const target = byId.get(edge.target);
    if (target?.type !== 'TopicMap') continue;
    if (!topicChildren.has(edge.target)) topicChildren.set(edge.target, []);
    topicChildren.get(edge.target).push(edge.source);
  }
  if (enableScaffold) {
    for (const [topicId, rawChildren] of topicChildren.entries()) {
      const children = [...new Set(rawChildren)].sort();
      if (children.length < 2) continue;
      const pairWeight = 0.42 / Math.max(1, children.length - 1);
      for (let i = 0; i < children.length; i += 1) {
        for (let j = i + 1; j < children.length; j += 1) {
          upsert(children[i], children[j], 'TOPIC_PROXIMITY', pairWeight, {synthetic: true, scaffoldKind: topicId});
        }
      }
    }
  
    // Cross-domain graph documents provide a small number of curated bridge sets.
    const wikiRe = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
    for (const doc of documents.filter((item) => item.type === 'GraphView')) {
      const linked = [];
      for (const match of String(doc.body || '').matchAll(wikiRe)) {
        const id = titleToId.get(match[1].trim().toLowerCase());
        if (id && noteIds.has(id) && !linked.includes(id)) linked.push(id);
      }
      if (linked.length < 2) continue;
      const pairWeight = 0.24 / Math.max(1, linked.length - 1);
      for (let i = 0; i < linked.length; i += 1) {
        for (let j = i + 1; j < linked.length; j += 1) {
          upsert(linked[i], linked[j], 'GRAPH_PROXIMITY', pairWeight, {synthetic: true, scaffoldKind: doc.id});
        }
      }
    }
  
    // Connect topic clusters within each domain by a very weak representative chain.
    // This prevents hundreds of isolated islands while preserving cross-domain semantic bridges.
    const topicsByDomain = new Map();
    for (const [topicId, childrenRaw] of topicChildren.entries()) {
      const topic = byId.get(topicId);
      const children = [...new Set(childrenRaw)];
      if (!topic?.domain || !children.length) continue;
      const representative = children.slice().sort((a, b) => (directDegree[b] || 0) - (directDegree[a] || 0) || a.localeCompare(b))[0];
      if (!topicsByDomain.has(topic.domain)) topicsByDomain.set(topic.domain, []);
      topicsByDomain.get(topic.domain).push({topicId, representative});
    }
    for (const [domain, itemsRaw] of topicsByDomain.entries()) {
      const items = itemsRaw.slice().sort((a, b) => a.topicId.localeCompare(b.topicId));
      for (let i = 0; i + 1 < items.length; i += 1) {
        upsert(items[i].representative, items[i + 1].representative, 'DOMAIN_PROXIMITY', 0.08, {synthetic: true, scaffoldKind: `domain:${domain}`});
      }
    }
  }

  for (const item of merged.values()) {
    const weights = item.directedRelations.map((r) => Number(r.weight ?? relationWeight(r.relation) * Number(r.confidence ?? 1))).sort((a, b) => b - a);
    item.weight = Math.min(1.8, weights[0] + 0.25 * weights.slice(1).reduce((sum, value) => sum + value, 0));
    item.weak = item.synthetic || item.maxWeight < 0.45;
    item.relationTypes.sort();
    item.scaffoldKinds.sort();
  }
  return {noteIds, semanticEdges: [...merged.values()], structuralEdges: structural};
}

function graphFromData(noteDocs, semanticEdges) {
  const graph = new Graph({type: 'undirected', multi: false, allowSelfLoops: false});
  for (const doc of noteDocs) graph.addNode(doc.id, {label: doc.title, domain: doc.domain, type: doc.type, status: doc.status});
  for (const edge of semanticEdges) {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target) || edge.source === edge.target) continue;
    graph.addUndirectedEdgeWithKey(pairKey(edge.source, edge.target), edge.source, edge.target, {
      weight: edge.weight,
      dominantRelation: edge.dominantRelation,
      weak: edge.weak,
    });
  }
  return graph;
}

function communityCandidate(graph, resolution) {
  const result = louvain.detailed(graph, {getEdgeWeight: 'weight', resolution, randomWalk: false});
  const sizes = new Map();
  for (const community of Object.values(result.communities)) sizes.set(community, (sizes.get(community) || 0) + 1);
  const sorted = [...sizes.values()].sort((a, b) => a - b);
  const maxShare = sorted.length ? sorted[sorted.length - 1] / graph.order : 1;
  const tiny = sorted.filter((size) => size <= 2).length;
  const countPenalty = result.count < 10 ? (10 - result.count) * 0.055 : result.count > 24 ? (result.count - 24) * 0.04 : 0;
  const giantPenalty = Math.max(0, maxShare - 0.34) * 0.9;
  const tinyPenalty = tiny * 0.018;
  const score = result.modularity - countPenalty - giantPenalty - tinyPenalty;
  return {
    resolution,
    count: result.count,
    modularity: result.modularity,
    communities: result.communities,
    sizes: Object.fromEntries([...sizes.entries()].sort((a, b) => b[1] - a[1])),
    maxShare,
    tiny,
    score,
  };
}

function mergeTinyCommunities(graph, inputCommunities, minSize = 3) {
  const communities = {...inputCommunities};
  for (let pass = 0; pass < 3; pass += 1) {
    const groups = new Map();
    for (const [node, community] of Object.entries(communities)) {
      if (!groups.has(community)) groups.set(community, []);
      groups.get(community).push(node);
    }
    let changed = false;
    for (const [community, nodes] of groups.entries()) {
      if (nodes.length >= minSize) continue;
      const neighborWeights = new Map();
      for (const node of nodes) {
        graph.forEachNeighbor(node, (neighbor) => {
          const targetCommunity = communities[neighbor];
          if (targetCommunity === community) return;
          const edge = graph.edge(node, neighbor);
          const weight = Number(graph.getEdgeAttribute(edge, 'weight') ?? 1);
          neighborWeights.set(targetCommunity, (neighborWeights.get(targetCommunity) || 0) + weight);
        });
      }
      const best = [...neighborWeights.entries()].sort((a, b) => b[1] - a[1])[0];
      if (!best) continue;
      for (const node of nodes) communities[node] = best[0];
      changed = true;
    }
    if (!changed) break;
  }
  return communities;
}

function seedPositions(graph, communities) {
  const grouped = new Map();
  for (const node of graph.nodes().sort()) {
    const c = communities[node];
    if (!grouped.has(c)) grouped.set(c, []);
    grouped.get(c).push(node);
  }
  const groups = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length || Number(a[0]) - Number(b[0]));
  const ring = Math.max(2.3, groups.length * 0.58);
  groups.forEach(([community, nodes], groupIndex) => {
    const angle = -Math.PI / 2 + (groupIndex * Math.PI * 2) / groups.length;
    const cx = Math.cos(angle) * ring;
    const cy = Math.sin(angle) * ring;
    const localRadius = 0.28 + Math.sqrt(nodes.length) * 0.055;
    nodes.forEach((node, index) => {
      const h = hash32(`${community}|${node}`);
      const a = ((h % 100000) / 100000) * Math.PI * 2 + index * 0.77;
      const r = localRadius * (0.25 + ((h >>> 8) % 1000) / 1100);
      graph.setNodeAttribute(node, 'x', cx + Math.cos(a) * r);
      graph.setNodeAttribute(node, 'y', cy + Math.sin(a) * r);
    });
  });
}

function weightedDegree(graph) {
  const result = {};
  graph.forEachNode((node) => { result[node] = 0; });
  graph.forEachEdge((edge, attributes, source, target) => {
    const weight = Number(attributes.weight ?? 1);
    result[source] += weight;
    result[target] += weight;
  });
  return result;
}

function pagerank(graph, damping = 0.85, iterations = 120) {
  const nodes = graph.nodes();
  const n = nodes.length;
  const degree = weightedDegree(graph);
  let rank = Object.fromEntries(nodes.map((node) => [node, 1 / n]));
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const next = Object.fromEntries(nodes.map((node) => [node, (1 - damping) / n]));
    let dangling = 0;
    for (const node of nodes) {
      if (degree[node] <= 1e-12) { dangling += rank[node]; continue; }
      graph.forEachNeighbor(node, (neighbor) => {
        const edge = graph.edge(node, neighbor);
        const weight = Number(graph.getEdgeAttribute(edge, 'weight') ?? 1);
        next[neighbor] += damping * rank[node] * weight / degree[node];
      });
    }
    const danglingShare = damping * dangling / n;
    let delta = 0;
    for (const node of nodes) { next[node] += danglingShare; delta += Math.abs(next[node] - rank[node]); }
    rank = next;
    if (delta < 1e-12) break;
  }
  return rank;
}

function betweenness(graph) {
  const nodes = graph.nodes();
  const cb = Object.fromEntries(nodes.map((node) => [node, 0]));
  for (const source of nodes) {
    const stack = [];
    const predecessors = Object.fromEntries(nodes.map((node) => [node, []]));
    const sigma = Object.fromEntries(nodes.map((node) => [node, 0]));
    const distance = Object.fromEntries(nodes.map((node) => [node, -1]));
    sigma[source] = 1;
    distance[source] = 0;
    const queue = [source];
    for (let head = 0; head < queue.length; head += 1) {
      const v = queue[head];
      stack.push(v);
      graph.forEachNeighbor(v, (w) => {
        if (distance[w] < 0) { queue.push(w); distance[w] = distance[v] + 1; }
        if (distance[w] === distance[v] + 1) { sigma[w] += sigma[v]; predecessors[w].push(v); }
      });
    }
    const dependency = Object.fromEntries(nodes.map((node) => [node, 0]));
    while (stack.length) {
      const w = stack.pop();
      for (const v of predecessors[w]) dependency[v] += (sigma[v] / sigma[w]) * (1 + dependency[w]);
      if (w !== source) cb[w] += dependency[w];
    }
  }
  const scale = nodes.length > 2 ? 1 / ((nodes.length - 1) * (nodes.length - 2)) : 1;
  for (const node of nodes) cb[node] = cb[node] * scale;
  return cb;
}

function connectedComponents(graph) {
  const seen = new Set();
  const components = [];
  for (const start of graph.nodes()) {
    if (seen.has(start)) continue;
    const comp = [];
    const queue = [start];
    seen.add(start);
    for (let head = 0; head < queue.length; head += 1) {
      const node = queue[head]; comp.push(node);
      graph.forEachNeighbor(node, (neighbor) => { if (!seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); } });
    }
    components.push(comp);
  }
  return components.sort((a, b) => b.length - a.length);
}

function normalizeLayout(raw, components) {
  const normalizedLayout = {};
  const normalizeComponent = (component, centerX, centerY, targetSpan) => {
    const values = component.map((id) => raw[id]);
    const xs = values.map((p) => p.x); const ys = values.map((p) => p.y);
    const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2; const cy = (minY + maxY) / 2;
    const span = Math.max(maxX - minX, maxY - minY, 1e-9);
    component.forEach((id) => {
      normalizedLayout[id] = {
        x: centerX + (raw[id].x - cx) / span * targetSpan,
        y: centerY + (raw[id].y - cy) / span * targetSpan,
      };
    });
  };
  const main = components[0] || Object.keys(raw);
  normalizeComponent(main, 0, 0, 1.72);
  const satellites = components.slice(1);
  const mainSize = Math.max(1, main.length);
  satellites.forEach((component, index) => {
    const ringIndex = Math.floor(index / 10);
    const slot = index % 10;
    const slots = Math.min(10, satellites.length - ringIndex * 10);
    const angle = -Math.PI * 0.72 + slot * Math.PI * 2 / Math.max(1, slots);
    const radius = 1.18 + ringIndex * 0.48;
    const localSpan = Math.max(0.08, Math.min(0.42, 0.52 * Math.sqrt(component.length / mainSize)));
    normalizeComponent(component, Math.cos(angle) * radius, Math.sin(angle) * radius, localSpan);
  });
  return normalizedLayout;
}

function layoutQuality(layout, graph, communities) {
  const nodes = graph.nodes();
  let edgeLength = 0; let edgeCount = 0;
  graph.forEachEdge((edge, attributes, source, target) => {
    const a = layout[source]; const b = layout[target];
    edgeLength += Math.hypot(a.x - b.x, a.y - b.y); edgeCount += 1;
  });
  const groups = new Map();
  for (const node of nodes) {
    const c = communities[node];
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(node);
  }
  let intra = 0; let intraCount = 0;
  const centroids = [];
  for (const group of groups.values()) {
    const cx = group.reduce((s, id) => s + layout[id].x, 0) / group.length;
    const cy = group.reduce((s, id) => s + layout[id].y, 0) / group.length;
    centroids.push({x: cx, y: cy});
    for (const id of group) { intra += Math.hypot(layout[id].x - cx, layout[id].y - cy); intraCount += 1; }
  }
  let inter = 0; let interCount = 0;
  for (let i = 0; i < centroids.length; i += 1) for (let j = i + 1; j < centroids.length; j += 1) {
    inter += Math.hypot(centroids[i].x - centroids[j].x, centroids[i].y - centroids[j].y); interCount += 1;
  }
  let overlaps = 0;
  for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) {
    if (Math.hypot(layout[nodes[i]].x - layout[nodes[j]].x, layout[nodes[i]].y - layout[nodes[j]].y) < 0.018) overlaps += 1;
  }
  return {
    averageEdgeLength: edgeCount ? edgeLength / edgeCount : 0,
    averageIntraCommunityRadius: intraCount ? intra / intraCount : 0,
    averageInterCommunityDistance: interCount ? inter / interCount : 0,
    separationRatio: intraCount && interCount ? (inter / interCount) / (intra / intraCount) : 0,
    overlapPairs: overlaps,
  };
}

function computeLayout(graph, communities, variant) {
  const work = graph.copy();
  seedPositions(work, communities);
  const settings = variant === 'linlog'
    ? {barnesHutOptimize: true, barnesHutTheta: 0.5, edgeWeightInfluence: 1.2, gravity: 1.35, linLogMode: true, outboundAttractionDistribution: false, scalingRatio: 6.5, slowDown: 5.5, strongGravityMode: false}
    : {barnesHutOptimize: true, barnesHutTheta: 0.5, edgeWeightInfluence: 1.1, gravity: 0.55, linLogMode: false, outboundAttractionDistribution: false, scalingRatio: 16, slowDown: 4, strongGravityMode: false};
  forceAtlas2.assign(work, {iterations: variant === 'linlog' ? 1550 : 1250, settings});
  const raw = {};
  work.forEachNode((node, attributes) => { raw[node] = {x: attributes.x, y: attributes.y}; });
  const components = connectedComponents(graph);
  const positions = normalizeLayout(raw, components);
  return {variant, settings, positions, quality: layoutQuality(positions, graph, communities)};
}

function communityMetadata(noteDocs, communities, centrality, labelOverrides = {}) {
  const byId = new Map(noteDocs.map((doc) => [doc.id, doc]));
  const groups = new Map();
  for (const [node, community] of Object.entries(communities)) {
    if (!groups.has(community)) groups.set(community, []);
    groups.get(community).push(node);
  }
  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || Number(a[0]) - Number(b[0]));
  const remap = new Map(ordered.map(([old], index) => [old, index]));
  const remapped = Object.fromEntries(Object.entries(communities).map(([node, old]) => [node, remap.get(old)]));
  const meta = ordered.map(([old, nodes], index) => {
    const ranked = nodes.slice().sort((a, b) => centrality[b].score - centrality[a].score);
    const domainCounts = new Map();
    for (const node of nodes) {
      const domain = byId.get(node)?.domain || 'general';
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
    const topNodes = ranked.slice(0, 4).map((id) => ({id, title: byId.get(id)?.title || id}));
    const override = labelOverrides[String(old)] || labelOverrides[String(index)] || null;
    const label = override || topNodes.slice(0, 2).map((item) => item.title).filter(Boolean).join('·') || '주제 군집';
    return {
      id: index,
      originalId: old,
      size: nodes.length,
      label,
      color: COMMUNITY_PALETTE[index % COMMUNITY_PALETTE.length],
      topNodes,
      domains: [...domainCounts.entries()].sort((a, b) => b[1] - a[1]).map(([domain, count]) => ({domain, count})),
    };
  });
  return {communities: remapped, metadata: meta};
}

export function buildGraphArtifacts(documents, rawEdges, siteConfig = {}) {
  const noteDocs = documents.filter((doc) => String(doc.file || '').startsWith('note/'));
  const {semanticEdges, structuralEdges} = buildCollapsedEdges(documents, rawEdges, siteConfig);
  const graph = graphFromData(noteDocs, semanticEdges);
  if (graph.order === 0) {
    return {
      semantic: {nodes: [], edges: semanticEdges, communities: [], selectedResolution: null, modularity: 0, layoutVariant: 'linlog'},
      structural: {edges: structuralEdges},
      prototypes: {standard: {nodes: [], quality: {}, settings: {}}, linlog: {nodes: [], quality: {}, settings: {}}},
      metrics: {nodeCount: 0, semanticEdgeCount: 0, directSemanticEdgeCount: 0, scaffoldEdgeCount: 0, scaffoldEdgeTypes: {}, structuralOrExcludedEdgeCount: structuralEdges.length, rawRelationCount: rawEdges.length, connectedComponents: [], isolatedNodes: [], communityCandidates: [], selectedResolution: null, selectedCommunityCount: 0, modularity: 0, communitySizes: [], layoutQuality: {}, centralityQuantiles: {q50: 0, q90: 0, q99: 0}},
    };
  }
  const candidates = graph.order === 1
    ? [{resolution: 1, count: 1, modularity: 0, communities: {[graph.nodes()[0]]: 0}, sizes: {0: 1}, maxShare: 1, tiny: 1, score: 0}]
    : RESOLUTIONS.map((resolution) => communityCandidate(graph, resolution));
  const selected = candidates.slice().sort((a, b) => b.score - a.score)[0];
  const degree = weightedDegree(graph);
  const rank = pagerank(graph);
  const between = betweenness(graph);
  const degreeRange = minMax(Object.values(degree));
  const rankRange = minMax(Object.values(rank));
  const betweenRange = minMax(Object.values(between));
  const provisionalCentrality = {};
  for (const doc of noteDocs) {
    const id = doc.id;
    const wd = normalized(degree[id] || 0, degreeRange);
    const pr = normalized(rank[id] || 0, rankRange);
    const bw = normalized(between[id] || 0, betweenRange);
    provisionalCentrality[id] = {weightedDegree: degree[id] || 0, pagerank: rank[id] || 0, betweenness: between[id] || 0, score: 0.58 * wd + 0.22 * pr + 0.20 * bw};
  }
  const mergedCommunities = mergeTinyCommunities(graph, selected.communities, Number(siteConfig.minimumCommunitySize || 3));
  const communityData = communityMetadata(noteDocs, mergedCommunities, provisionalCentrality, siteConfig.communityLabels || {});
  const communities = communityData.communities;
  const crossDegree = Object.fromEntries(noteDocs.map((doc) => [doc.id, 0]));
  for (const edge of semanticEdges) if (communities[edge.source] !== communities[edge.target]) {
    crossDegree[edge.source] += edge.weight;
    crossDegree[edge.target] += edge.weight;
  }
  const centrality = {};
  for (const doc of noteDocs) centrality[doc.id] = {...provisionalCentrality[doc.id], crossCommunityDegree: crossDegree[doc.id] || 0};
  const prototypeA = computeLayout(graph, communities, 'standard');
  const prototypeB = computeLayout(graph, communities, 'linlog');
  const components = connectedComponents(graph);
  const finalLayout = prototypeB;
  const nodes = noteDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    domain: doc.domain,
    type: doc.type,
    status: doc.status,
    community: communities[doc.id],
    x: finalLayout.positions[doc.id].x,
    y: finalLayout.positions[doc.id].y,
    xStandard: prototypeA.positions[doc.id].x,
    yStandard: prototypeA.positions[doc.id].y,
    ...centrality[doc.id],
  }));
  const sizeValues = nodes.map((node) => node.score).sort((a, b) => a - b);
  const q50 = quantile(sizeValues, 0.5); const q90 = quantile(sizeValues, 0.9); const q99 = quantile(sizeValues, 0.99);
  return {
    semantic: {
      nodes,
      edges: semanticEdges,
      communities: communityData.metadata,
      selectedResolution: selected.resolution,
      modularity: selected.modularity,
      layoutVariant: finalLayout.variant,
    },
    structural: {edges: structuralEdges},
    prototypes: {
      standard: {nodes: nodes.map((node) => ({id: node.id, x: node.xStandard, y: node.yStandard})), quality: prototypeA.quality, settings: prototypeA.settings},
      linlog: {nodes: nodes.map((node) => ({id: node.id, x: node.x, y: node.y})), quality: prototypeB.quality, settings: prototypeB.settings},
    },
    metrics: {
      nodeCount: graph.order,
      semanticEdgeCount: graph.size,
      directSemanticEdgeCount: semanticEdges.filter((edge) => !edge.synthetic).length,
      scaffoldEdgeCount: semanticEdges.filter((edge) => edge.synthetic).length,
      scaffoldEdgeTypes: Object.fromEntries([...semanticEdges.filter((edge) => edge.synthetic).reduce((map, edge) => map.set(edge.dominantRelation, (map.get(edge.dominantRelation) || 0) + 1), new Map()).entries()].sort()),
      structuralOrExcludedEdgeCount: structuralEdges.length,
      rawRelationCount: rawEdges.length,
      connectedComponents: components.map((component) => component.length),
      isolatedNodes: components.filter((component) => component.length === 1).flat(),
      communityCandidates: candidates.map(({communities, ...rest}) => rest),
      selectedResolution: selected.resolution,
      selectedCommunityCount: communityData.metadata.length,
      modularity: selected.modularity,
      communitySizes: communityData.metadata.map((community) => community.size),
      layoutQuality: {standard: prototypeA.quality, linlog: prototypeB.quality},
      centralityQuantiles: {q50, q90, q99},
    },
  };
}
