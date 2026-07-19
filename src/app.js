import Graph from 'graphology';
import Sigma from 'sigma';
const D = window.KGW_DATA;
const byId = new Map(D.documents.map((x) => [x.id, x]));
const nodeById = new Map(D.nodes.map((x) => [x.id, x]));
const titleMap = new Map();
for (const d of D.documents) {
  for (const s of [d.title, d.title_en, ...(d.aliases || [])]) {
    if (s) titleMap.set(String(s).trim().toLowerCase(), d);
  }
}
const adj = new Map();
for (const e of D.edges) {
  if (!adj.has(e.source)) adj.set(e.source, []);
  if (!adj.has(e.target)) adj.set(e.target, []);
  adj.get(e.source).push({ ...e, other: e.target, dir: 'out' });
  adj.get(e.target).push({ ...e, other: e.source, dir: 'in' });
}

const qs = (s) => document.querySelector(s);
document.documentElement.lang = D.site?.language || 'ko';
qs('#brand').innerHTML = `${D.site?.shortTitle || D.site?.title || 'Knowledge Atlas'} <b>Wiki</b>`;
qs('#search').placeholder = D.site?.searchPlaceholder || '개념, 수식, 방법, 동의어 검색';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hexToRgba = (hex, alpha = 1) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = Number.parseInt(v, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
const safeStorage = {
  get(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } },
  set(key, value) { try { window.localStorage.setItem(key, value); } catch (_) { /* file/opaque origins may deny storage */ } },
};
const hash32 = (s) => {
  let h = 2166136261;
  for (let i = 0; i < String(s).length; i += 1) {
    h ^= String(s).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

let current = D.site?.homeId || 'PAGE_HOME';
let tab = 'domains';
function findTitle(t) { return titleMap.get(String(t).trim().toLowerCase()); }
function search(q) {
  q = q.trim().toLowerCase();
  let arr = D.documents;
  if (q) {
    arr = arr.map((n) => ({
      n,
      score: (n.title?.toLowerCase().includes(q) ? 12 : 0)
        + (n.title_en?.toLowerCase().includes(q) ? 9 : 0)
        + ((n.aliases || []).join(' ').toLowerCase().includes(q) ? 7 : 0)
        + (n.body?.toLowerCase().includes(q) ? 1 : 0),
    })).filter((x) => x.score).sort((a, b) => b.score - a.score).map((x) => x.n);
  }
  return arr.slice(0, Number(D.site?.searchLimit || 700));
}
function renderSide(arr) {
  qs('#count').textContent = `${arr.length}개 문서`;
  if (tab === 'domains' && !qs('#search').value) {
    const domains = Object.entries(D.domains);
    qs('#sideContent').innerHTML = domains.map(([k, v]) => `<div class="side-item" data-domain="${k}"><b><span style="color:${v.color}">●</span> ${esc(v.label)}</b><small>${arr.filter((x) => x.domain === k).length}개 노트</small></div>`).join('');
    document.querySelectorAll('[data-domain]').forEach((x) => {
      x.onclick = () => {
        tab = 'notes';
        document.querySelectorAll('.side-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'notes'));
        renderSide(D.documents.filter((d) => d.domain === x.dataset.domain));
      };
    });
    return;
  }
  qs('#sideContent').innerHTML = arr.map((n) => `<div class="side-item ${n.id === current ? 'active' : ''}" data-id="${n.id}"><b>${esc(n.title)}</b><small>${esc(n.title_en || n.type)}</small></div>`).join('');
  document.querySelectorAll('.side-item[data-id]').forEach((x) => { x.onclick = () => show(x.dataset.id, {syncSidebar: true, sidebarBehavior: 'smooth'}); });
}
function bindLinks() {
  document.querySelectorAll('.wiki-link').forEach((a) => {
    a.onclick = (e) => {
      e.preventDefault();
      const d = findTitle(a.dataset.title);
      if (d) show(d.id, {syncSidebar: true, sidebarBehavior: 'smooth'});
    };
  });
}
function syncSidebarToNote(id, behavior = 'smooth') {
  tab = 'notes';
  document.querySelectorAll('.side-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.tab === 'notes'));
  const input = qs('#search');
  let results = search(input.value);
  if (!results.some((doc) => doc.id === id)) {
    input.value = '';
    results = D.documents;
  }
  renderSide(results);
  requestAnimationFrame(() => {
    const item = document.querySelector(`.side-item[data-id="${CSS.escape(id)}"]`);
    if (!item) return;
    const sidebar = qs('#sidebar');
    const targetTop = item.offsetTop - sidebar.clientHeight / 2 + item.offsetHeight / 2;
    sidebar.scrollTo({top: Math.max(0, targetTop), behavior});
    item.classList.add('sync-target');
    window.setTimeout(() => item.classList.remove('sync-target'), 1100);
  });
}
function show(id, options = {}) {
  const d = byId.get(id);
  if (!d) return;
  current = id;
  location.hash = encodeURIComponent(id);
  document.title = `${d.title} · ${D.site?.title || 'Knowledge Atlas'}`;
  qs('#main').innerHTML = `<article class="note">${d.html}</article>`;
  bindLinks();
  if (options.syncSidebar) syncSidebarToNote(id, options.sidebarBehavior || 'smooth');
  else renderSide(search(qs('#search').value));
  buildGraph(id);
  window.scrollTo({top: 0, behavior: 'auto'});
}
document.querySelectorAll('.side-tabs button').forEach((b) => {
  b.onclick = () => {
    tab = b.dataset.tab;
    document.querySelectorAll('.side-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    renderSide(search(qs('#search').value));
  };
});
qs('#search').oninput = (e) => {
  tab = 'notes';
  document.querySelectorAll('.side-tabs button').forEach((x) => x.classList.toggle('active', x.dataset.tab === 'notes'));
  renderSide(search(e.target.value));
};
qs('#brand').onclick = () => show(D.site?.homeId || 'PAGE_HOME');
qs('#theme').onclick = () => {
  const h = document.documentElement;
  h.dataset.theme = h.dataset.theme === 'dark' ? 'light' : 'dark';
  safeStorage.set(`${D.site?.slug || 'knowledge-atlas'}-theme`, h.dataset.theme);
};
document.documentElement.dataset.theme = safeStorage.get(`${D.site?.slug || 'knowledge-atlas'}-theme`) || 'light';
function split(el, side) {
  el.onpointerdown = (e) => {
    el.setPointerCapture(e.pointerId);
    const sx = e.clientX;
    const cs = getComputedStyle(document.documentElement);
    const start = parseFloat(cs.getPropertyValue(side === 'left' ? '--left' : '--right'));
    const mv = (ev) => {
      const v = side === 'left' ? start + ev.clientX - sx : start - (ev.clientX - sx);
      document.documentElement.style.setProperty(side === 'left' ? '--left' : '--right', `${Math.max(side === 'left' ? 190 : 300, Math.min(side === 'left' ? 520 : 760, v))}px`);
    };
    el.onpointermove = mv;
    el.onpointerup = () => { el.onpointermove = null; resize(); };
  };
}
split(qs('#splitLeft'), 'left');
split(qs('#splitRight'), 'right');

/* -------------------------------------------------------------------------- */
/* Graph visual semantics                                                     */
/* -------------------------------------------------------------------------- */
const MACRO_GROUPS = D.macros || Object.fromEntries(Object.entries(D.domains || {}).map(([id, value]) => [id, {label: value.label, color: value.color, domains: [id]}]));
const macroByDomain = new Map();
for (const [key, value] of Object.entries(MACRO_GROUPS)) for (const d of value.domains) macroByDomain.set(d, key);

const DOMAIN_COLORS = Object.fromEntries(Object.entries(D.domains || {}).map(([key, value]) => [key, value.color]));
const TYPE_GROUPS = {
  concept: { label: '개념', color: '#60a5fa', types: ['ConceptOutline', 'DomainConcept'] },
  theory: { label: '이론·법칙·근사', color: '#a78bfa', types: ['ModelOrTheory', 'Law', 'Approximation'] },
  equation: { label: '수식·수학 객체', color: '#f59e0b', types: ['Equation', 'MathematicalObject'] },
  method: { label: '실험·계산 방법', color: '#2dd4bf', types: ['ExperimentalMethod', 'ComputationalMethod'] },
  quantity: { label: '물리량·관측량', color: '#22c55e', types: ['ThermodynamicQuantity', 'PhysicalQuantity', 'TransportQuantity', 'KineticQuantity', 'StateFunction', 'Observable'] },
  process: { label: '상태·과정·조건', color: '#fb7185', types: ['Process', 'Condition', 'ThermodynamicState', 'Classification'] },
  map: { label: '지도·페이지', color: '#cbd5e1', types: ['TopicMap', 'DomainMap', 'GraphView', 'Page', 'DataStructure'] },
};
const typeGroupByType = new Map();
for (const [key, value] of Object.entries(TYPE_GROUPS)) for (const t of value.types) typeGroupByType.set(t, key);
const REVIEW_GROUPS = {
  core: { label: '핵심 검토 완료', color: '#22c55e' },
  reviewed: { label: '검토 완료', color: '#38bdf8' },
  structured: { label: '구조화 초안', color: '#f59e0b' },
  map: { label: '지도·페이지', color: '#a78bfa' },
  other: { label: '기타', color: '#94a3b8' },
};
const COMMUNITY_HUES = [235, 174, 334, 42, 195, 272, 98, 18, 187, 51, 286, 166, 346, 86];

const RELATION_STYLES = {
  hierarchy: { label: '구조·계층', color: '#94a3b8', dash: [7, 5], width: 1.15 },
  dependency: { label: '의존·유도', color: '#60a5fa', dash: [], width: 1.35 },
  causal: { label: '인과·영향', color: '#fb923c', dash: [], width: 1.55 },
  theory: { label: '이론·표현', color: '#a78bfa', dash: [12, 4], width: 1.3 },
  experiment: { label: '측정·방법', color: '#2dd4bf', dash: [], width: 1.45 },
  process: { label: '과정·메커니즘', color: '#fb7185', dash: [2, 5], width: 1.4 },
  association: { label: '직접 개념 연결', color: '#64748b', dash: [], width: 0.8 },
  scaffold: { label: '주제 근접(배치 보조)', color: '#475569', dash: [2, 5], width: 0.55 },
};
const RELATION_LABELS = {
  PART_OF: '부분/상위', TOPIC_PROXIMITY: '같은 주제 지도', GRAPH_PROXIMITY: '교차 주제 연결', DOMAIN_PROXIMITY: '같은 세부 영역',
  APPEARS_IN: '포함됨', APPROXIMATED_BY: '근사됨', ESTIMATED_BY: '추정됨', HAS_SUBTYPE: '하위 유형', SUPPORTED_BY: '지지됨',
  CALCULATED_FROM: '계산됨', MODELED_BY: '모델링됨', PARAMETER_OF: '파라미터', CONTRIBUTES_TO: '기여', LIMITED_BY: '제한', SENSITIVE_TO: '민감', VALIDATED_BY: '검증', DISTORTED_BY: '왜곡', ALTERNATIVE_TO: '대안', COMPLEMENTS: '상보', APPLIES_TO: '적용', TESTED_BY: '검사됨', TESTS: '검사', MODELS: '모델링', QUANTIFIES: '정량화', QUANTIFIED_BY: '정량화됨', CAN_CAUSE: '유발 가능', CAN_RESULT_FROM: '발생 가능', CAN_PRODUCE: '생성 가능', SUPPORTS: '지원', SUPPORTED_BY: '지원됨', LIMITS: '제한', VIOLATES: '위반', DETECTS: '탐지', ADDRESSES: '다룸', SELECTS: '선택', FITS: '피팅', CHARACTERIZED_BY: '특성화', DISCRETIZES: '이산화', DISCRETIZED_AS: '이산화됨', INVERSE_OF: '역관계', FEATURE_OF: '특징', ENABLES: '가능', MOTIVATES: '동기', COMPARED_WITH: '비교', COMBINES: '결합', COUPLES: '결합', CONTRASTS_WITH: '대조', IMPLEMENTS: '구현', INCLUDES: '포함', DOCUMENTED_BY: '문서화', ASSESSES: '평가', ANALYZES: '분석', PREDICTS: '예측', OPTIMIZES: '최적화', REDUCES: '감소', REDUCES_CONTRIBUTION_OF: '측정 기여 감소', LINEARIZES_TO: '선형화', RELATED_TO: '관련', IS_A: '종류', HAS_COMPONENT: '구성', STATE_VARIABLE_OF: '상태변수', DEPENDS_ON: '의존', ACCOUNTS_FOR: '반영', DERIVED_FROM: '유도', REQUIRES: '필요', CAUSES: '유발', AFFECTS: '영향', CONTROLS: '제어', DRIVES: '구동', DESCRIBED_BY: '기술', REPRESENTED_BY: '표현', APPROXIMATES: '근사', MEASURED_BY: '측정', USES: '사용', USED_BY: '사용됨', VARIES: '변화시킴', PROBES: '탐침', DIAGNOSES: '진단', PRODUCES: '생성', PRECEDES: '선행', INVOLVES: '포함', COUPLED_TO: '결합',
};
function relationCategory(rel) {
  if (['PART_OF','IS_A','HAS_COMPONENT','HAS_SUBTYPE','COMPOSED_OF'].includes(rel)) return 'hierarchy';
  if (['TOPIC_PROXIMITY','GRAPH_PROXIMITY','DOMAIN_PROXIMITY'].includes(rel)) return 'scaffold';
  if (['DEPENDS_ON','DERIVED_FROM','REQUIRES','CALCULATED_FROM','LIMITED_BY','APPEARS_IN','ESTIMATED_BY','STATE_VARIABLE_OF','ACCOUNTS_FOR'].includes(rel)) return 'dependency';
  if (['CAUSES','AFFECTS','CONTROLS','DRIVES','INCREASES','DECREASES','CAN_CAUSE','VIOLATES','DISTORTED_BY','REDUCES','REDUCES_CONTRIBUTION_OF'].includes(rel)) return 'causal';
  if (['DESCRIBED_BY','REPRESENTED_BY','APPROXIMATED_BY','APPROXIMATES','DEFINES','MODELED_BY','MODELS','GENERALIZES','DISCRETIZES','DISCRETIZED_AS'].includes(rel)) return 'theory';
  if (['MEASURED_BY','USES','USED_BY','VARIES','DETECTS','PROBES','DIAGNOSES','CHARACTERIZES','TESTED_BY','TESTS','VALIDATED_BY','SUPPORTED_BY','SUPPORTS','PERFORMED_BY','PERFORMS'].includes(rel)) return 'experiment';
  if (['PRODUCES', 'PRECEDES', 'INVOLVES', 'COUPLED_TO', 'RESULTS_FROM'].includes(rel)) return 'process';
  return 'association';
}
function reviewGroup(doc) {
  if (!doc) return 'other';
  if (doc.review_level === 'core-reviewed' || doc.status === 'core-reviewed') return 'core';
  if (doc.status === 'reviewed') return 'reviewed';
  if (doc.review_level === 'structured-outline' || doc.status === 'structured') return 'structured';
  if (['topic-map', 'semantic-map', 'graph-map', 'page'].includes(doc.review_level)) return 'map';
  return 'other';
}
function typeGroup(doc) { return typeGroupByType.get(doc?.type) || 'concept'; }
function isMapNode(doc) { return ['TopicMap', 'DomainMap', 'GraphView', 'Page'].includes(doc?.type); }

const partParents = new Map();
for (const e of D.edges) if (e.relation === 'PART_OF') {
  if (!partParents.has(e.source)) partParents.set(e.source, []);
  partParents.get(e.source).push(e.target);
}
function topicCommunity(id) {
  let cur = id;
  const visited = new Set();
  for (let i = 0; i < 5; i += 1) {
    if (visited.has(cur)) break;
    visited.add(cur);
    const doc = byId.get(cur);
    if (doc && ['TopicMap', 'DomainMap'].includes(doc.type)) return cur;
    const parents = partParents.get(cur) || [];
    if (!parents.length) break;
    const mapParent = parents.find((p) => ['TopicMap', 'DomainMap'].includes(byId.get(p)?.type));
    cur = mapParent || parents[0];
  }
  return `domain:${byId.get(id)?.domain || 'foundations'}`;
}
function communityLabel(key) {
  if (key.startsWith('domain:')) return D.domains[key.slice(7)]?.label || key;
  return byId.get(key)?.title || nodeById.get(key)?.label || '주제 커뮤니티';
}
function communityColor(key) { return `hsl(${COMMUNITY_HUES[hash32(key) % COMMUNITY_HUES.length]} 72% 60%)`; }

/* -------------------------------------------------------------------------- */
/* Graph engine                                                               */
/* -------------------------------------------------------------------------- */
const canvas = qs('#graphCanvas');
const ctx = canvas.getContext('2d');
const stage = qs('#graphStage');
const sigmaContainer = qs('#sigmaContainer');
const tooltip = qs('#tooltip');
const storedGraph = JSON.parse(safeStorage.get(`${D.site?.slug || 'knowledge-atlas'}-graph-options`) || '{}');
const COMMUNITY_META = new Map((D.globalGraph?.communities || []).map((item) => [Number(item.id), item]));
const GLOBAL_NODE_META = new Map((D.globalGraph?.nodes || []).map((item) => [item.id, item]));
const GLOBAL_TOP_LABELS = new Set((D.globalGraph?.nodes || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8).map((item) => item.id));
const GRAPH_DEFAULTS = {
  viewMode: 'overview', layoutVariant: 'linlog', depth: 2, colorMode: 'community', labelMode: 'auto', sizeMode: 'degree', arrows: false, showMaps: false,
  nodeScale: 1, distance: 104, repel: 90,
};
let G = {
  root: null, viewMode: storedGraph.viewMode || GRAPH_DEFAULTS.viewMode, layoutVariant: storedGraph.layoutVariant || GRAPH_DEFAULTS.layoutVariant,
  depth: Number(storedGraph.depth || GRAPH_DEFAULTS.depth), colorMode: storedGraph.colorMode || GRAPH_DEFAULTS.colorMode, labelMode: storedGraph.labelMode || GRAPH_DEFAULTS.labelMode,
  sizeMode: storedGraph.sizeMode || GRAPH_DEFAULTS.sizeMode, arrows: storedGraph.arrows ?? GRAPH_DEFAULTS.arrows, showMaps: storedGraph.showMaps ?? GRAPH_DEFAULTS.showMaps,
  nodeScale: Number(storedGraph.nodeScale || 100) / 100, distance: Number(storedGraph.distance || GRAPH_DEFAULTS.distance), repel: Number(storedGraph.repel || GRAPH_DEFAULTS.repel),
  nodes: [], links: [], map: new Map(), localRoot: null, zoom: 1, panX: 0, panY: 0, alpha: 1, running: false, paused: false,
  drag: null, pan: false, hover: null, selected: null, w: 0, h: 0, dpr: 1, pointerStart: null, pointerLast: null, moved: false,
  hiddenColors: new Set(), hiddenRelations: new Set(), sigma: null, sigmaGraph: null, sigmaHovered: null, sigmaSelected: null, sigmaNeighbors: new Set(),
  overviewFallback: false, overviewNodes: [], overviewLinks: [], overviewMap: new Map(), pointerNode: null,
};
function saveGraphOptions() {
  safeStorage.set(`${D.site?.slug || 'knowledge-atlas'}-graph-options`, JSON.stringify({
    viewMode: G.viewMode, layoutVariant: G.layoutVariant, depth: G.depth, colorMode: G.colorMode, labelMode: G.labelMode, sizeMode: G.sizeMode,
    arrows: G.arrows, showMaps: G.showMaps, nodeScale: Math.round(G.nodeScale * 100), distance: G.distance, repel: G.repel,
  }));
}
function resize() {
  const previousWidth = G.w; const previousHeight = G.h;
  const r = stage.getBoundingClientRect();
  G.w = Math.max(1, r.width); G.h = Math.max(1, r.height); G.dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(r.width * G.dpr); canvas.height = Math.round(r.height * G.dpr);
  canvas.style.width = `${r.width}px`; canvas.style.height = `${r.height}px`;
  if (G.sigma) { G.sigma.resize(); G.sigma.refresh(); }
  if (G.overviewFallback) { if (previousWidth <= 1 || previousHeight <= 1) fitOverviewCanvas(); else drawOverviewCanvas(); }
  else if (G.viewMode === 'focus') { if (previousWidth <= 1 || previousHeight <= 1) fitLocal(); else drawLocal(); }
}
new ResizeObserver(resize).observe(stage);

function edgePriority(edge, rootDomain) {
  const other = byId.get(edge.other);
  return (edge.relation === 'RELATED_TO' ? 1 : 5)
    + ((other?.domain && other.domain !== rootDomain) ? 2 : 0)
    + Math.log2((nodeById.get(edge.other)?.degree || 0) + 1)
    + Number(edge.confidence || 1);
}
function subgraph(root) {
  const rootDomain = byId.get(root)?.domain;
  const maxNodes = G.depth === 1 ? 28 : G.depth === 2 ? 62 : 90;
  const seen = new Map([[root, 0]]);
  let frontier = [root];
  for (let level = 0; level < G.depth && frontier.length && seen.size < maxNodes; level += 1) {
    const candidates = new Map();
    for (const id of frontier) {
      const edges = [...(adj.get(id) || [])].sort((a, b) => edgePriority(b, rootDomain) - edgePriority(a, rootDomain));
      for (const edge of edges) {
        if (seen.has(edge.other) || !byId.has(edge.other)) continue;
        const doc = byId.get(edge.other);
        if (!G.showMaps && isMapNode(doc)) continue;
        const score = edgePriority(edge, rootDomain);
        if (!candidates.has(edge.other) || candidates.get(edge.other) < score) candidates.set(edge.other, score);
      }
    }
    frontier = [...candidates.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxNodes - seen.size).map(([id]) => id);
    for (const id of frontier) seen.set(id, level + 1);
  }
  const ids = new Set(seen.keys());
  return {ids: [...ids], levels: seen, links: D.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))};
}
function buildLocalParentMap(root, levels) {
  const rootDomain = byId.get(root)?.domain;
  const parents = new Map([[root, null]]);
  const ordered = [...levels.entries()].sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0])));
  for (const [id, level] of ordered) {
    if (id === root || level <= 0) continue;
    let bestParent = root;
    let bestScore = -Infinity;
    for (const edge of adj.get(id) || []) {
      if (!levels.has(edge.other) || levels.get(edge.other) !== level - 1) continue;
      let score = edgePriority(edge, rootDomain);
      if (edge.relation === 'PART_OF' || edge.relation === 'HAS_PART') score += 2.4;
      if (edge.relation === 'EXPLAINS' || edge.relation === 'SUPPORTED_BY') score += 1.2;
      if (edge.relation === 'RELATED_TO') score -= 0.4;
      if (score > bestScore) { bestScore = score; bestParent = edge.other; }
    }
    parents.set(id, bestParent);
  }
  return parents;
}
function localNodeMeta(id, level, index) {
  const node = nodeById.get(id) || {};
  const doc = byId.get(id) || {};
  const angle = ((hash32(`${doc.domain}|${id}`) % 6283) / 1000) + index * 0.09;
  const radius = level ? 95 + level * 110 + (hash32(id) % 36) : 0;
  return {
    id, label: node.label || doc.title || id, domain: node.domain || doc.domain || 'foundations', type: doc.type || node.type || 'Concept',
    review: reviewGroup(doc), typeGroup: typeGroup(doc), community: topicCommunity(id), degree: node.degree || 1, level,
    x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, vx: 0, vy: 0, localDegree: 0,
    parentId: null, anchorX: Math.cos(angle) * radius, anchorY: Math.sin(angle) * radius, branchAngle: angle,
    fixed: id === G.localRoot, pinned: id === G.localRoot,
  };
}
function setLocalAnchor(node, x, y, angle) {
  const jitterX = (((hash32(`${node.id}|focus-x`) % 1000) / 1000) - 0.5) * 7;
  const jitterY = (((hash32(`${node.id}|focus-y`) % 1000) / 1000) - 0.5) * 7;
  node.anchorX = x; node.anchorY = y; node.branchAngle = angle;
  node.x = x + jitterX; node.y = y + jitterY; node.vx = 0; node.vy = 0;
}
function applyDandelionLayout(root, nodes, parents) {
  const byLocalId = new Map(nodes.map((node) => [node.id, node]));
  const children = new Map();
  for (const node of nodes) {
    node.parentId = parents.get(node.id) || null;
    node.fixed = node.id === root; node.pinned = node.id === root;
    if (node.parentId) {
      if (!children.has(node.parentId)) children.set(node.parentId, []);
      children.get(node.parentId).push(node);
    }
  }
  for (const list of children.values()) list.sort((a, b) => (b.localDegree || 0) - (a.localDegree || 0) || String(a.domain).localeCompare(String(b.domain)) || String(a.label).localeCompare(String(b.label)));
  const rootNode = byLocalId.get(root);
  if (!rootNode) return;
  setLocalAnchor(rootNode, 0, 0, 0);
  const firstLayer = children.get(root) || [];
  const startAngle = ((hash32(`${root}|dandelion`) % 6283) / 1000) - Math.PI;
  const firstRadius = 178;
  firstLayer.forEach((node, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / Math.max(1, firstLayer.length);
    setLocalAnchor(node, Math.cos(angle) * firstRadius, Math.sin(angle) * firstRadius, angle);
  });
  for (let level = 1; level < G.depth; level += 1) {
    for (const parent of nodes.filter((node) => node.level === level)) {
      const ownChildren = children.get(parent.id) || [];
      if (!ownChildren.length) continue;
      const outward = Math.atan2(parent.anchorY, parent.anchorX);
      const maxPerRing = level === 1 ? 10 : 7;
      const rings = [];
      for (let index = 0; index < ownChildren.length; index += maxPerRing) rings.push(ownChildren.slice(index, index + maxPerRing));
      rings.forEach((ring, ringIndex) => {
        const count = ring.length;
        const arc = level === 1 ? Math.PI * 1.22 : Math.PI * 1.05;
        const distance = (level === 1 ? 84 : 64) + ringIndex * (level === 1 ? 45 : 34);
        ring.forEach((node, index) => {
          const angle = count === 1 ? outward : outward - arc / 2 + (arc * index) / Math.max(1, count - 1);
          setLocalAnchor(node, parent.anchorX + Math.cos(angle) * distance, parent.anchorY + Math.sin(angle) * distance, angle);
        });
      });
    }
  }
  for (const node of nodes) {
    if (Number.isFinite(node.anchorX) && Number.isFinite(node.anchorY)) continue;
    const angle = ((hash32(`${node.id}|orphan`) % 6283) / 1000) - Math.PI;
    const radius = 178 + node.level * 100;
    setLocalAnchor(node, Math.cos(angle) * radius, Math.sin(angle) * radius, angle);
  }
}
function buildLocalGraph(root) {
  G.localRoot = root;
  const data = subgraph(root);
  G.localParents = buildLocalParentMap(root, data.levels);
  G.nodes = data.ids.map((id, index) => localNodeMeta(id, data.levels.get(id) || 0, index));
  G.map = new Map(G.nodes.map((node) => [node.id, node]));
  G.links = data.links.map((edge) => ({...edge, a: G.map.get(edge.source), b: G.map.get(edge.target), category: relationCategory(edge.relation), curve: ((hash32(`${edge.source}|${edge.target}`) % 9) - 4) * 0.012})).filter((edge) => edge.a && edge.b);
  for (const node of G.nodes) node.localDegree = 0;
  for (const edge of G.links) { edge.a.localDegree += 1; edge.b.localDegree += 1; }
  applyDandelionLayout(root, G.nodes, G.localParents);
  G.hover = null; G.selected = null; G.alpha = 0.72; G.paused = false; G.zoom = 1; G.panX = 0; G.panY = 0;
  fitLocal(); startLocalSimulation();
}
function startLocalSimulation() {
  if (G.running || G.paused || G.viewMode !== 'focus') return;
  G.running = true; requestAnimationFrame(stepLocal);
}
function stepLocal() {
  if (!G.running || G.paused || G.viewMode !== 'focus') { G.running = false; return; }
  for (let i = 0; i < G.nodes.length; i += 1) {
    const node = G.nodes[i];
    if (!node.fixed) {
      node.vx += (node.anchorX - node.x) * 0.038 * G.alpha;
      node.vy += (node.anchorY - node.y) * 0.038 * G.alpha;
    }
    for (let j = i + 1; j < G.nodes.length; j += 1) {
      const other = G.nodes[j];
      let dx = node.x - other.x; let dy = node.y - other.y; let d2 = Math.max(48, dx * dx + dy * dy); const distance = Math.sqrt(d2);
      if (!Number.isFinite(distance) || distance === 0) { dx = 0.1; dy = 0.1; d2 = 48; }
      const relatedBranch = node.parentId === other.parentId || node.parentId === other.id || other.parentId === node.id;
      const force = (G.repel * (relatedBranch ? 0.48 : 0.92) * G.alpha) / d2;
      if (!node.fixed) { node.vx += (dx / distance) * force; node.vy += (dy / distance) * force; }
      if (!other.fixed) { other.vx -= (dx / distance) * force; other.vy -= (dy / distance) * force; }
    }
  }
  for (const edge of G.links) {
    const dx = edge.b.x - edge.a.x; const dy = edge.b.y - edge.a.y; const distance = Math.max(1, Math.hypot(dx, dy));
    const treeEdge = edge.a.parentId === edge.b.id || edge.b.parentId === edge.a.id;
    const desired = treeEdge ? (Math.min(edge.a.level, edge.b.level) === 0 ? 176 : 82) : 190;
    const strength = treeEdge ? 0.0042 : 0.00008;
    const force = (distance - desired) * strength * G.alpha;
    const fx = (dx / distance) * force; const fy = (dy / distance) * force;
    if (!edge.a.fixed) { edge.a.vx += fx; edge.a.vy += fy; }
    if (!edge.b.fixed) { edge.b.vx -= fx; edge.b.vy -= fy; }
  }
  let energy = 0;
  for (const node of G.nodes) {
    if (node.fixed) { if (node.id === G.localRoot) { node.x = 0; node.y = 0; } node.vx = 0; node.vy = 0; continue; }
    node.vx *= 0.74; node.vy *= 0.74; node.x += node.vx; node.y += node.vy; energy += Math.abs(node.vx) + Math.abs(node.vy);
  }
  G.alpha *= 0.98; drawLocal();
  if ((energy > 0.02 || G.alpha > 0.025) && G.alpha > 0.01) requestAnimationFrame(stepLocal); else G.running = false;
}
function localPos(node) { return {x: G.w / 2 + (node.x + G.panX) * G.zoom, y: G.h / 2 + (node.y + G.panY) * G.zoom}; }
function localScreenToWorld(x, y) { return {x: (x - G.w / 2) / G.zoom - G.panX, y: (y - G.h / 2) / G.zoom - G.panY}; }
function overviewCommunityColor(id) { return COMMUNITY_META.get(Number(id))?.color || communityColor(`global:${id}`); }
function overviewCommunityLabel(id) {
  const meta = COMMUNITY_META.get(Number(id));
  if (!meta) return '주제 군집';
  const names = (meta.label ? [meta.label] : (meta.topNodes || []).slice(0, 2).map((item) => item.title)).filter(Boolean).join('·');
  const size = Number(meta.size || 0);
  return names ? `${names}${size ? ` ${size}` : ''}` : `주제 군집${size ? ` ${size}` : ''}`;
}
function nodeColorKey(node) {
  if (G.colorMode === 'macro') return macroByDomain.get(node.domain) || 'foundations';
  if (G.colorMode === 'domain') return node.domain;
  if (G.colorMode === 'type') return node.typeGroup;
  if (G.colorMode === 'review') return node.review;
  return node.community;
}
function harmonizeNodeColor(color) {
  if (!color || !color.startsWith('#')) return color || 'hsl(215 18% 62%)';
  const hex = color.slice(1); const full = hex.length === 3 ? [...hex].map((value) => value + value).join('') : hex;
  const r = parseInt(full.slice(0, 2), 16) / 255; const g = parseInt(full.slice(2, 4), 16) / 255; const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const delta = max - min; let hue = 0;
  if (delta) { if (max === r) hue = ((g - b) / delta) % 6; else if (max === g) hue = (b - r) / delta + 2; else hue = (r - g) / delta + 4; hue = Math.round(hue * 60); if (hue < 0) hue += 360; }
  return `hsl(${hue} 72% 60%)`;
}
function nodeColor(node) {
  if (G.colorMode === 'community') return G.viewMode === 'overview' ? overviewCommunityColor(node.community) : communityColor(node.community);
  let raw;
  if (G.colorMode === 'macro') raw = MACRO_GROUPS[nodeColorKey(node)]?.color;
  else if (G.colorMode === 'domain') raw = DOMAIN_COLORS[node.domain];
  else if (G.colorMode === 'type') raw = TYPE_GROUPS[node.typeGroup]?.color;
  else if (G.colorMode === 'review') raw = REVIEW_GROUPS[node.review]?.color;
  return harmonizeNodeColor(raw || '#94a3b8');
}
function colorLabel(key) {
  if (G.colorMode === 'community') return G.viewMode === 'overview' ? overviewCommunityLabel(key) : communityLabel(key);
  if (G.colorMode === 'macro') return MACRO_GROUPS[key]?.label || key;
  if (G.colorMode === 'domain') return D.domains[key]?.label || key;
  if (G.colorMode === 'type') return TYPE_GROUPS[key]?.label || key;
  if (G.colorMode === 'review') return REVIEW_GROUPS[key]?.label || key;
  return key;
}
function localNodeRadius(node) {
  const rootBoost = node.id === G.localRoot ? 1.35 : 1;
  if (G.sizeMode === 'uniform') return 4.8 * rootBoost;
  return (3.5 + Math.min(4.8, Math.log2((node.localDegree || 0) + 1) * 1.15)) * rootBoost;
}
function localNodeVisible(node) { return !G.hiddenColors.has(nodeColorKey(node)); }
function localLinkVisible(edge) { return localNodeVisible(edge.a) && localNodeVisible(edge.b) && !G.hiddenRelations.has(edge.category); }
function localNeighbors(id) {
  const result = new Set();
  for (const edge of G.links) { if (edge.a.id === id) result.add(edge.b.id); if (edge.b.id === id) result.add(edge.a.id); }
  return result;
}
function localCurve(edge) {
  const a = localPos(edge.a); const b = localPos(edge.b); const dx = b.x - a.x; const dy = b.y - a.y;
  return {a, b, c: {x: (a.x + b.x) / 2 - dy * edge.curve, y: (a.y + b.y) / 2 + dx * edge.curve}};
}
function quadraticAt(a, c, b, t) { const u = 1 - t; return {x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y}; }
function drawArrow(context, p1, p2, color, alpha) {
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x); const length = 5.5;
  context.save(); context.globalAlpha = alpha; context.fillStyle = color; context.beginPath(); context.moveTo(p2.x, p2.y);
  context.lineTo(p2.x - length * Math.cos(angle - 0.48), p2.y - length * Math.sin(angle - 0.48));
  context.lineTo(p2.x - length * Math.cos(angle + 0.48), p2.y - length * Math.sin(angle + 0.48)); context.closePath(); context.fill(); context.restore();
}
function drawLocal() {
  if (G.viewMode !== 'focus') return;
  ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.clearRect(0, 0, G.w, G.h);
  const focus = G.hover || G.selected; const neighbors = focus ? localNeighbors(focus.id) : null;
  for (const edge of G.links) {
    if (!localLinkVisible(edge)) continue;
    const {a, b, c} = localCurve(edge); const style = RELATION_STYLES[edge.category]; const hot = !focus || focus.id === edge.a.id || focus.id === edge.b.id;
    const alpha = hot ? (focus ? 0.8 : 0.28) : 0.035;
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = style.color; ctx.lineWidth = style.width * (focus && hot ? 1.3 : 1); ctx.setLineDash(style.dash);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(c.x, c.y, b.x, b.y); ctx.stroke(); ctx.restore();
    if (G.arrows && hot) { const p84 = quadraticAt(a, c, b, 0.84); const p89 = quadraticAt(a, c, b, 0.89); drawArrow(ctx, p84, p89, style.color, alpha); }
  }
  for (const node of [...G.nodes].sort((a, b) => (a.id === G.localRoot ? 1 : 0) - (b.id === G.localRoot ? 1 : 0))) {
    if (!localNodeVisible(node)) continue;
    const p = localPos(node); const radius = Math.max(2.8, localNodeRadius(node) * G.zoom * G.nodeScale); const color = nodeColor(node);
    const hot = !focus || focus.id === node.id || neighbors?.has(node.id); const depthAlpha = node.level === 0 ? 1 : node.level === 1 ? 0.88 : node.level === 2 ? 0.64 : 0.44;
    const alpha = (hot ? 1 : 0.12) * depthAlpha;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; if (node.id === G.localRoot || node === focus) { ctx.shadowBlur = 10; ctx.shadowColor = color; }
    ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const showLabel = G.labelMode === 'all' || (G.labelMode === 'auto' && (node.id === G.localRoot || node === focus || node.localDegree >= 6));
    if (showLabel && hot) {
      ctx.save(); ctx.globalAlpha = Math.max(0.7, alpha); ctx.font = `${node.id === G.localRoot ? 700 : 600} ${node.id === G.localRoot ? 12 : 10.5}px Pretendard, Noto Sans KR, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; let label = node.label; while (label.length > 5 && ctx.measureText(label).width > 160) label = `${label.slice(0, -2)}…`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(5,8,12,.9)'; ctx.strokeText(label, p.x, p.y + radius + 5); ctx.fillStyle = '#eef2f7'; ctx.fillText(label, p.x, p.y + radius + 5); ctx.restore();
    }
  }
}
function localHit(x, y) {
  let best = null; let distance = Infinity;
  for (const node of G.nodes) {
    if (!localNodeVisible(node)) continue;
    const p = localPos(node); const d = Math.hypot(x - p.x, y - p.y); const radius = Math.max(11, localNodeRadius(node) * G.zoom * G.nodeScale + 7);
    if (d < radius && d < distance) { best = node; distance = d; }
  }
  return best;
}
function pointerPosition(event) { const rect = canvas.getBoundingClientRect(); return {x: event.clientX - rect.left, y: event.clientY - rect.top}; }
function showTooltipNode(node, point, overview = false) {
  if (!node) { tooltip.hidden = true; return; }
  const key = nodeColorKey(node);
  const extra = overview ? `<br>가중 연결 ${node.weightedDegree.toFixed(2)} · 매개 중심성 ${node.betweenness.toFixed(3)}` : `<br>현재 그래프 연결 ${node.localDegree} · 전체 연결 ${node.degree}`;
  tooltip.innerHTML = `<b>${esc(node.label || node.title)}</b><small>${esc(colorLabel(key))} · ${esc(TYPE_GROUPS[node.typeGroup]?.label || node.type)}${extra}</small>`;
  tooltip.hidden = false; tooltip.style.left = `${Math.min(G.w - 290, Math.max(7, point.x + 13))}px`; tooltip.style.top = `${Math.min(G.h - 90, Math.max(7, point.y + 13))}px`;
}


function colorToHsl(color) {
  if (!color) return {h: 215, s: 18, l: 62};
  const hsl = String(color).match(/hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (hsl) return {h: Number(hsl[1]), s: Number(hsl[2]), l: Number(hsl[3])};
  if (String(color).startsWith('#')) {
    const hex = String(color).slice(1); const full = hex.length === 3 ? [...hex].map((v) => v + v).join('') : hex;
    const r = parseInt(full.slice(0, 2), 16) / 255; const g = parseInt(full.slice(2, 4), 16) / 255; const b = parseInt(full.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b); const min = Math.min(r, g, b); const delta = max - min;
    let h = 0; const l = (max + min) / 2; const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    if (delta) { if (max === r) h = ((g - b) / delta) % 6; else if (max === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h *= 60; if (h < 0) h += 360; }
    return {h, s: s * 100, l: l * 100};
  }
  return {h: 215, s: 18, l: 62};
}
function focusTone(color, distance) {
  const {h, s, l} = colorToHsl(color);
  if (distance == null) return color;
  if (distance <= 0) return `hsl(${h.toFixed(1)} ${Math.max(62, s).toFixed(1)}% ${Math.max(58, l).toFixed(1)}%)`;
  if (distance === 1) return `hsl(${h.toFixed(1)} ${Math.max(54, s * 0.9).toFixed(1)}% ${Math.max(50, l * 0.88).toFixed(1)}%)`;
  if (distance === 2) return `hsl(${h.toFixed(1)} ${Math.max(38, s * 0.62).toFixed(1)}% ${Math.max(36, l * 0.66).toFixed(1)}%)`;
  return `hsl(${h.toFixed(1)} ${Math.max(24, s * 0.38).toFixed(1)}% ${Math.max(27, l * 0.48).toFixed(1)}%)`;
}
function computeDistanceMap(nodeIds, neighborFn, rootId) {
  const distances = new Map();
  if (!rootId || !nodeIds.includes(rootId)) return distances;
  const queue = [rootId]; distances.set(rootId, 0);
  for (let i = 0; i < queue.length; i += 1) {
    const id = queue[i]; const nextDistance = distances.get(id) + 1;
    for (const other of neighborFn(id)) {
      if (!distances.has(other)) { distances.set(other, nextDistance); queue.push(other); }
    }
  }
  return distances;
}
function computeRadialTargets(records, rootId, neighborFn, coordinateScale = 1) {
  const ids = records.map((node) => node.id);
  const byNode = new Map(records.map((node) => [node.id, node]));
  const root = byNode.get(rootId);
  if (!root) return {targets: new Map(), distances: new Map(), extent: 1};
  const distances = computeDistanceMap(ids, neighborFn, rootId);
  const finiteMax = Math.max(1, ...distances.values());
  const layers = new Map();
  for (const node of records) {
    if (node.id === rootId) continue;
    const distance = distances.has(node.id) ? distances.get(node.id) : finiteMax + 1;
    const layer = Math.min(distance, 6);
    if (!layers.has(layer)) layers.set(layer, []);
    const bx = (node.baseX ?? node.x) - (root.baseX ?? root.x);
    const by = (node.baseY ?? node.y) - (root.baseY ?? root.y);
    layers.get(layer).push({node, rawAngle: Math.atan2(by, bx)});
  }
  const targets = new Map([[rootId, {x: 0, y: 0}]]);
  const startOffset = ((hash32(rootId) % 6283) / 1000) - Math.PI;
  let extent = 0;
  for (const [layer, entries] of [...layers.entries()].sort((a, b) => a[0] - b[0])) {
    entries.sort((a, b) => a.rawAngle - b.rawAngle);
    const count = entries.length;
    const baseRadius = (0.19 + 0.18 * Math.max(0, layer - 1)) * coordinateScale;
    entries.forEach((entry, index) => {
      const evenAngle = startOffset + (Math.PI * 2 * index) / Math.max(1, count);
      const angle = count <= 2 ? entry.rawAngle : evenAngle;
      const communityMatch = entry.node.community === root.community;
      const radialJitter = (((hash32(`${rootId}|${entry.node.id}`) % 1000) / 1000) - 0.5) * 0.045 * coordinateScale;
      const bandJitter = ((index % 3) - 1) * 0.018 * coordinateScale;
      const radius = Math.max(0.12 * coordinateScale, (baseRadius + radialJitter + bandJitter) * (communityMatch ? 0.93 : 1));
      targets.set(entry.node.id, {x: Math.cos(angle) * radius, y: Math.sin(angle) * radius});
      extent = Math.max(extent, radius);
    });
  }
  return {targets, distances, extent: Math.max(extent, 0.8 * coordinateScale)};
}
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function cancelLayoutAnimation() { if (G.layoutAnimation) cancelAnimationFrame(G.layoutAnimation); G.layoutAnimation = null; }
function animateSigmaCoordinates(targets, duration = 860, extent = 1.15) {
  if (!G.sigmaGraph || !G.sigma) return;
  cancelLayoutAnimation();
  const starts = new Map();
  G.sigmaGraph.forEachNode((id, attrs) => starts.set(id, {x: attrs.x, y: attrs.y}));
  G.sigma.setCustomBBox({x: [-extent, extent], y: [-extent, extent]});
  G.sigma.getCamera().animate({x: 0.5, y: 0.5, ratio: 1, angle: 0}, {duration: Math.min(520, duration), easing: 'quadraticInOut'});
  const started = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - started) / duration); const eased = easeInOutCubic(t);
    G.sigmaGraph.forEachNode((id) => {
      const start = starts.get(id); const target = targets.get(id) || start;
      G.sigmaGraph.setNodeAttribute(id, 'x', start.x + (target.x - start.x) * eased);
      G.sigmaGraph.setNodeAttribute(id, 'y', start.y + (target.y - start.y) * eased);
    });
    G.sigma.refresh();
    if (t < 1) G.layoutAnimation = requestAnimationFrame(tick);
    else { G.layoutAnimation = null; G.sigma.refresh(); }
  };
  G.layoutAnimation = requestAnimationFrame(tick);
}
function restoreSigmaCoordinates(duration = 560) {
  if (!G.sigmaGraph || !G.sigma) return;
  const targets = new Map(); let extent = 1;
  G.sigmaGraph.forEachNode((id, attrs) => {
    const x = attrs.baseX ?? attrs.x; const y = attrs.baseY ?? attrs.y;
    targets.set(id, {x, y}); extent = Math.max(extent, Math.abs(x), Math.abs(y));
  });
  G.sigma.setCustomBBox({x: [-extent * 1.08, extent * 1.08], y: [-extent * 1.08, extent * 1.08]});
  animateSigmaCoordinates(targets, duration, extent * 1.08);
}
function animateCanvasCoordinates(targets, duration = 860, extent = 470) {
  cancelLayoutAnimation();
  const starts = new Map(G.overviewNodes.map((node) => [node.id, {x: node.x, y: node.y}]));
  const started = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - started) / duration); const eased = easeInOutCubic(t);
    for (const node of G.overviewNodes) {
      const start = starts.get(node.id); const target = targets.get(node.id) || start;
      node.x = start.x + (target.x - start.x) * eased;
      node.y = start.y + (target.y - start.y) * eased;
    }
    fitOverviewCanvas(true, extent);
    if (t < 1) G.layoutAnimation = requestAnimationFrame(tick); else G.layoutAnimation = null;
  };
  G.layoutAnimation = requestAnimationFrame(tick);
}
function restoreCanvasCoordinates(duration = 560) {
  const targets = new Map(); let extent = 420;
  for (const node of G.overviewNodes) {
    targets.set(node.id, {x: node.baseX, y: node.baseY}); extent = Math.max(extent, Math.abs(node.baseX), Math.abs(node.baseY));
  }
  animateCanvasCoordinates(targets, duration, extent * 1.08);
}
function applyOverviewFocus(rootId, animate = true) {
  G.overviewFocusRoot = rootId && GLOBAL_NODE_META.has(rootId) ? rootId : null;
  if (G.sigmaGraph && G.sigma) {
    if (!G.overviewFocusRoot) { G.overviewDistances = new Map(); restoreSigmaCoordinates(animate ? 760 : 0); return; }
    const records = G.sigmaGraph.nodes().map((id) => globalNodeRecord(G.sigmaGraph.getNodeAttributes(id)));
    const result = computeRadialTargets(records, G.overviewFocusRoot, (id) => G.sigmaGraph.neighbors(id), 1);
    G.overviewDistances = result.distances;
    animateSigmaCoordinates(result.targets, animate ? 920 : 0, result.extent * 1.12);
    return;
  }
  if (G.overviewFallback && G.overviewNodes?.length) {
    if (!G.overviewFocusRoot) { G.overviewDistances = new Map(); restoreCanvasCoordinates(animate ? 760 : 0); return; }
    const result = computeRadialTargets(G.overviewNodes, G.overviewFocusRoot, (id) => overviewNeighbors(id), 420);
    G.overviewDistances = result.distances;
    animateCanvasCoordinates(result.targets, animate ? 920 : 0, result.extent * 1.12);
  }
}
function overviewVisualDistance(id, hoverId = null) {
  if (hoverId) {
    if (id === hoverId) return 0;
    if (G.sigmaGraph?.hasNode(hoverId) && G.sigmaGraph.neighbors(hoverId).includes(id)) return 1;
    if (G.overviewFallback && overviewNeighbors(hoverId).has(id)) return 1;
    return 3;
  }
  if (!G.overviewFocusRoot) return null;
  return G.overviewDistances.has(id) ? G.overviewDistances.get(id) : 4;
}
function globalNodeRecord(item) {
  const doc = byId.get(item.id) || {};
  return {...item, label: item.title || doc.title || item.id, type: doc.type || item.type || 'Concept', typeGroup: typeGroup(doc), review: reviewGroup(doc), degree: nodeById.get(item.id)?.degree || 0};
}
function globalNodeSize(node) {
  if (G.sizeMode === 'uniform') return 3.4 * G.nodeScale;
  const base = 2.4 + 11.5 * Math.pow(Math.max(0, node.score || 0), 0.65);
  return base * G.nodeScale * (node.id === G.root ? 1.18 : 1);
}
function globalLabelEligible(node) {
  if (G.labelMode === 'off') return false;
  if (G.labelMode === 'all') return true;
  const focus = G.sigmaHovered || G.sigmaSelected || G.overviewFocusRoot;
  if (focus) {
    const distance = overviewVisualDistance(node.id, G.sigmaHovered || null);
    return distance === 0 || distance === 1;
  }
  return GLOBAL_TOP_LABELS.has(node.id);
}
function overviewWorldPosition(node) {
  return {x: G.w / 2 + (node.x + G.panX) * G.zoom, y: G.h / 2 + (node.y + G.panY) * G.zoom};
}
function overviewNeighbors(id) {
  const set = new Set();
  for (const edge of G.overviewLinks) {
    if (edge.source === id) set.add(edge.target);
    if (edge.target === id) set.add(edge.source);
  }
  return set;
}
function overviewNodeVisible(node) { return !G.hiddenColors.has(nodeColorKey(node)); }
function overviewEdgeVisible(edge) {
  const source = G.overviewMap.get(edge.source); const target = G.overviewMap.get(edge.target);
  return source && target && overviewNodeVisible(source) && overviewNodeVisible(target) && !G.hiddenRelations.has(edge.category);
}
function fitOverviewCanvas(preserveFocusCenter = false, forcedExtent = null) {
  if (!G.overviewNodes.length) return;
  if ((preserveFocusCenter || G.overviewFocusRoot) && G.overviewFocusRoot) {
    const extent = forcedExtent || Math.max(120, ...G.overviewNodes.map((node) => Math.max(Math.abs(node.x), Math.abs(node.y))));
    G.zoom = Math.max(0.28, Math.min(2.4, Math.min(G.w / (extent * 2.18), G.h / (extent * 2.18))));
    G.panX = 0; G.panY = 0; drawOverviewCanvas(); return;
  }
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  for (const node of G.overviewNodes) { minX = Math.min(minX, node.x); maxX = Math.max(maxX, node.x); minY = Math.min(minY, node.y); maxY = Math.max(maxY, node.y); }
  const width = Math.max(100, maxX - minX + 58); const height = Math.max(100, maxY - minY + 58);
  G.zoom = Math.max(0.35, Math.min(2.4, Math.min(G.w / width, G.h / height))); G.panX = -(minX + maxX) / 2; G.panY = -(minY + maxY) / 2;
  drawOverviewCanvas();
}
function overviewHit(x, y) {
  let best = null; let bestDistance = Infinity;
  for (const node of G.overviewNodes) {
    if (!overviewNodeVisible(node)) continue;
    const point = overviewWorldPosition(node); const distance = Math.hypot(x - point.x, y - point.y);
    const radius = Math.max(8, globalNodeSize(node) * Math.max(0.8, Math.sqrt(G.zoom)) + 4);
    if (distance < radius && distance < bestDistance) { best = node; bestDistance = distance; }
  }
  return best;
}
function drawOverviewCanvas() {
  if (!G.overviewFallback || G.viewMode !== 'overview') return;
  ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.clearRect(0, 0, G.w, G.h);
  const focus = G.hover?.id || G.overviewFocusRoot || null; const neighbors = focus ? overviewNeighbors(focus) : new Set();
  for (const edge of G.overviewLinks) {
    if (!overviewEdgeVisible(edge)) continue;
    const source = G.overviewMap.get(edge.source); const target = G.overviewMap.get(edge.target);
    const a = overviewWorldPosition(source); const b = overviewWorldPosition(target);
    const sourceDistance = overviewVisualDistance(edge.source, G.hover?.id || null); const targetDistance = overviewVisualDistance(edge.target, G.hover?.id || null);
    const hot = !focus || edge.source === focus || edge.target === focus;
    const near = sourceDistance != null && targetDistance != null && Math.max(sourceDistance, targetDistance) <= 2;
    const alpha = hot ? (edge.weak ? 0.24 : 0.56) : near ? (edge.weak ? 0.10 : 0.22) : 0.045;
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#aeb8c7'; ctx.lineWidth = hot ? (edge.weak ? 0.6 : 1.0) : near ? 0.58 : 0.34;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
  }
  const ordered = [...G.overviewNodes].sort((a, b) => (a.id === focus ? 1 : 0) - (b.id === focus ? 1 : 0));
  for (const node of ordered) {
    if (!overviewNodeVisible(node)) continue;
    const point = overviewWorldPosition(node); const adjacent = neighbors.has(node.id); const hot = !focus || node.id === focus || adjacent;
    const distance = overviewVisualDistance(node.id, G.hover?.id || null);
    const radius = Math.max(2.4, globalNodeSize(node) * Math.max(0.78, Math.sqrt(G.zoom)) * (node.id === focus ? 1.28 : distance === 1 ? 1.08 : 1));
    const baseColor = nodeColor(node);
    ctx.save(); ctx.globalAlpha = distance == null ? 0.96 : distance <= 1 ? 0.98 : distance === 2 ? 0.78 : 0.58; ctx.fillStyle = focusTone(baseColor, distance);
    if (node.id === focus) { ctx.shadowBlur = 11; ctx.shadowColor = nodeColor(node); }
    ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const showLabel = G.labelMode === 'all' || (G.labelMode === 'auto' && (focus ? (node.id === focus || adjacent) : GLOBAL_TOP_LABELS.has(node.id)));
    if (showLabel && (hot || !focus)) {
      ctx.save(); ctx.globalAlpha = 0.92; ctx.font = `${node.id === focus ? 700 : 600} ${node.id === focus ? 12 : 10}px Pretendard, Noto Sans KR, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; let label = node.label;
      while (label.length > 5 && ctx.measureText(label).width > 145) label = `${label.slice(0, -2)}…`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(4,7,12,.94)'; ctx.strokeText(label, point.x, point.y + radius + 4); ctx.fillStyle = '#eef2f7'; ctx.fillText(label, point.x, point.y + radius + 4); ctx.restore();
    }
  }
}
function buildCanvasOverview(root) {
  G.overviewFallback = true; G.sigma = null; G.sigmaGraph = null; G.sigmaHovered = null; G.sigmaSelected = null; G.sigmaNeighbors = new Set();
  sigmaContainer.hidden = true; canvas.hidden = false;
  G.root = GLOBAL_NODE_META.has(root) ? root : null;
  G.overviewNodes = (D.globalGraph?.nodes || []).map((raw) => {
    const node = globalNodeRecord(raw); const x = G.layoutVariant === 'standard' ? raw.xStandard : raw.x; const y = G.layoutVariant === 'standard' ? raw.yStandard : raw.y;
    return {...node, x: x * 420, y: y * 420, baseX: x * 420, baseY: y * 420};
  });
  G.overviewMap = new Map(G.overviewNodes.map((node) => [node.id, node]));
  G.overviewLinks = (D.globalGraph?.edges || []).map((edge) => ({...edge, category: relationCategory(edge.dominantRelation)})).filter((edge) => G.overviewMap.has(edge.source) && G.overviewMap.has(edge.target));
  G.hover = null; G.selected = G.root ? G.overviewMap.get(G.root) : null; G.zoom = 1; G.panX = 0; G.panY = 0;
  fitOverviewCanvas();
  if (G.root) applyOverviewFocus(G.root, false);
}
function buildSigmaOverview(root, forceRebuild = false) {
  G.root = GLOBAL_NODE_META.has(root) ? root : null;
  if (G.sigma && !forceRebuild) { G.sigmaSelected = G.root; applyOverviewFocus(G.root, true); updateSigmaFocus(); updateLegends(); renderEdges(); updateGraphChrome(); return; }
  if (G.overviewFallback && !forceRebuild && G.overviewNodes?.length) {
    G.hover = null;
    G.selected = G.root ? G.overviewMap.get(G.root) || null : null;
    applyOverviewFocus(G.root, true);
    updateLegends();
    renderEdges();
    updateGraphChrome();
    drawOverviewCanvas();
    return;
  }
  if (G.sigma) { G.sigma.kill(); G.sigma = null; G.sigmaGraph = null; }
  const graph = new Graph({type: 'undirected', multi: false, allowSelfLoops: false});
  for (const raw of D.globalGraph?.nodes || []) {
    const node = globalNodeRecord(raw); const x = G.layoutVariant === 'standard' ? raw.xStandard : raw.x; const y = G.layoutVariant === 'standard' ? raw.yStandard : raw.y;
    graph.addNode(node.id, {...node, x, y, baseX: x, baseY: y, size: globalNodeSize(node), color: nodeColor(node), label: node.label});
  }
  let edgeIndex = 0;
  for (const edge of D.globalGraph?.edges || []) {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
    graph.addUndirectedEdgeWithKey(`g${edgeIndex++}`, edge.source, edge.target, {
      weight: edge.weight, weak: Boolean(edge.weak), relation: edge.dominantRelation, category: relationCategory(edge.dominantRelation),
      size: edge.weak ? 0.25 : 0.45 + Math.min(0.65, edge.weight * 0.38), color: edge.weak ? 'rgba(139,149,165,.12)' : 'rgba(139,149,165,.26)',
    });
  }
  G.sigmaGraph = graph; G.sigmaSelected = G.root; G.sigmaHovered = null; G.sigmaNeighbors = new Set(); G.overviewFallback = false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl');
    if (!gl) throw new Error('WebGL context is unavailable');
    G.sigma = new Sigma(graph, sigmaContainer, {
      renderEdgeLabels: false, enableEdgeEvents: false, zIndex: true, hideEdgesOnMove: true,
      labelFont: 'Pretendard, Noto Sans KR, sans-serif', labelWeight: '600', labelColor: {color: '#e8edf5'},
      labelRenderedSizeThreshold: 7.5, labelDensity: 0.08, labelGridCellSize: 130,
      defaultNodeColor: '#60a5fa', defaultEdgeColor: 'rgba(139,149,165,.2)', minCameraRatio: 0.12, maxCameraRatio: 8,
      nodeReducer: (id, data) => {
        const node = globalNodeRecord(data); const hidden = G.hiddenColors.has(nodeColorKey(node));
        const interactionFocus = G.sigmaHovered || G.sigmaSelected || G.overviewFocusRoot;
        const distance = overviewVisualDistance(id, G.sigmaHovered || null);
        const adjacent = distance === 1;
        const baseColor = nodeColor(node);
        const sizeFactor = distance === 0 ? 1.34 : adjacent ? 1.1 : 1;
        return {...data, hidden, color: interactionFocus ? focusTone(baseColor, distance) : baseColor, size: globalNodeSize(node) * sizeFactor, label: globalLabelEligible(node) ? node.label : null, zIndex: distance === 0 ? 4 : adjacent ? 3 : distance === 2 ? 2 : 1};
      },
      edgeReducer: (id, data) => {
        const [source, target] = graph.extremities(id); const sourceData = globalNodeRecord(graph.getNodeAttributes(source)); const targetData = globalNodeRecord(graph.getNodeAttributes(target));
        const hidden = G.hiddenColors.has(nodeColorKey(sourceData)) || G.hiddenColors.has(nodeColorKey(targetData)) || G.hiddenRelations.has(data.category);
        const interactionFocus = G.sigmaHovered || G.sigmaSelected || G.overviewFocusRoot;
        const sourceDistance = overviewVisualDistance(source, G.sigmaHovered || null); const targetDistance = overviewVisualDistance(target, G.sigmaHovered || null);
        const incident = interactionFocus && (source === interactionFocus || target === interactionFocus);
        const near = interactionFocus && sourceDistance != null && targetDistance != null && Math.max(sourceDistance, targetDistance) <= 2;
        const color = !interactionFocus ? data.color : incident ? (data.weak ? 'rgba(174,184,198,.38)' : 'rgba(174,184,198,.72)') : near ? (data.weak ? 'rgba(150,162,180,.16)' : 'rgba(150,162,180,.30)') : 'rgba(100,112,130,.055)';
        const size = !interactionFocus ? data.size : incident ? data.size * 1.25 : near ? Math.max(0.18, data.size * 0.72) : Math.max(0.12, data.size * 0.42);
        return {...data, hidden, color, size, zIndex: incident ? 3 : near ? 2 : 0};
      },
    });
    G.sigma.on('enterNode', ({node, event}) => { G.sigmaHovered = node; G.sigmaNeighbors = new Set(graph.neighbors(node)); const raw = globalNodeRecord(graph.getNodeAttributes(node)); showTooltipNode(raw, {x: event.x, y: event.y}, true); G.sigma.refresh(); });
    G.sigma.on('leaveNode', () => { G.sigmaHovered = null; G.sigmaNeighbors = G.sigmaSelected ? new Set(graph.neighbors(G.sigmaSelected)) : new Set(); tooltip.hidden = true; G.sigma.refresh(); });
    G.sigma.on('clickNode', ({node}) => { G.sigmaSelected = node; show(node, {syncSidebar: true, sidebarBehavior: 'smooth'}); });
    G.sigma.on('clickStage', () => { G.root = null; G.sigmaSelected = null; G.sigmaNeighbors = new Set(); applyOverviewFocus(null, true); updateGraphChrome(); G.sigma.refresh(); });
    sigmaContainer.hidden = false; canvas.hidden = true; updateSigmaFocus();
    if (G.root) applyOverviewFocus(G.root, false);
  } catch (error) {
    console.warn('WebGL graph rendering unavailable; using Canvas fallback.', error?.message || error);
    try { G.sigma?.kill(); } catch (_) { /* no-op */ }
    G.sigma = null; G.sigmaGraph = null; buildCanvasOverview(root);
  }
}
function updateSigmaFocus() {
  if (!G.sigmaGraph || !G.sigma) return;
  const focus = G.sigmaHovered || G.sigmaSelected || G.overviewFocusRoot;
  G.sigmaNeighbors = focus && G.sigmaGraph.hasNode(focus) ? new Set(G.sigmaGraph.neighbors(focus)) : new Set();
  G.sigma.refresh();
}
function fitLocal() {
  if (!G.nodes.length) return;
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  for (const node of G.nodes) { minX = Math.min(minX, node.x); maxX = Math.max(maxX, node.x); minY = Math.min(minY, node.y); maxY = Math.max(maxY, node.y); }
  const width = Math.max(100, maxX - minX + 110); const height = Math.max(100, maxY - minY + 110);
  G.zoom = Math.max(0.34, Math.min(1.8, Math.min(G.w / width, G.h / height))); G.panX = -(minX + maxX) / 2; G.panY = -(minY + maxY) / 2; drawLocal();
}
function updateGraphChrome() {
  const overview = G.viewMode === 'overview';
  qs('#graphTitle').textContent = overview ? '전체 연결 지도' : '포커스 지식 그래프';
  qs('#graphSubtitle').textContent = overview
    ? (G.overviewFocusRoot ? `선택한 개념을 중심으로 전체 지도를 재배치했습니다. 연결 거리가 가까운 개념일수록 중심 가까이에 놓이며, 비활성 노드도 원래 색조를 유지합니다.` : `직접 관계와 주제 근접 관계로 자동 탐지한 ${D.graphMetrics?.selectedCommunityCount || 0}개 커뮤니티입니다. ForceAtlas2 ${G.layoutVariant === 'linlog' ? 'LinLog' : '기본'} 좌표를 빌드 시 고정했습니다.`)
    : '현재 노트를 중심으로 1–3단계 관계를 탐색합니다. 관계 유형과 방향은 포커스 그래프에서 확인합니다.';
  if (overview) { sigmaContainer.hidden = G.overviewFallback; canvas.hidden = !G.overviewFallback; } else { sigmaContainer.hidden = true; canvas.hidden = false; }
  qs('#pause').disabled = overview; qs('#pause').title = overview ? '전체 지도 좌표는 빌드 시 고정됩니다.' : '배치 정지/재개';
  for (const id of ['depth', 'arrows', 'showMaps', 'distance', 'repel']) qs(`#${id}`).disabled = overview;
  qs('#layoutVariant').disabled = !overview;
}
function buildGraph(root, forceRebuild = false) {
  G.root = root;
  updateGraphChrome();
  if (G.viewMode === 'overview') buildSigmaOverview(root, forceRebuild);
  else { if (G.sigma) { G.sigma.kill(); G.sigma = null; G.sigmaGraph = null; } G.overviewFallback = false; buildLocalGraph(root); }
  updateGraphChrome(); updateControls(); updateLegends(); renderEdges();
}
function updateLegends() {
  const records = G.viewMode === 'overview' ? (D.globalGraph?.nodes || []).map(globalNodeRecord) : G.nodes;
  const counts = new Map();
  for (const node of records) { const key = nodeColorKey(node); counts.set(key, (counts.get(key) || 0) + 1); }
  qs('#colorLegend').innerHTML = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([key, count]) => {
    const node = records.find((item) => String(nodeColorKey(item)) === String(key));
    return `<button class="legend-chip ${G.hiddenColors.has(key) ? 'off' : ''}" data-color-key="${esc(key)}"><i class="legend-dot" style="color:${nodeColor(node)};background:currentColor"></i>${esc(colorLabel(key))} ${count}</button>`;
  }).join('');
  document.querySelectorAll('[data-color-key]').forEach((element) => { element.onclick = () => { const key = Number.isNaN(Number(element.dataset.colorKey)) ? element.dataset.colorKey : Number(element.dataset.colorKey); if (G.hiddenColors.has(key)) G.hiddenColors.delete(key); else G.hiddenColors.add(key); updateLegends(); refreshGraphDisplay(); }; });
  qs('#typeLegend').innerHTML = G.viewMode === 'overview'
    ? `<span class="legend-chip static"><i class="size-dot small"></i>주변 개념</span><span class="legend-chip static"><i class="size-dot large"></i>중심성 높은 허브</span><span class="legend-chip static"><i class="opacity-dot near"></i>선택 이웃</span><span class="legend-chip static"><i class="opacity-dot far"></i>나머지 약화</span>`
    : `<span class="legend-chip static"><i class="size-dot small"></i>연결 적음</span><span class="legend-chip static"><i class="size-dot large"></i>연결 많음</span><span class="legend-chip static"><i class="opacity-dot near"></i>가까운 노드</span><span class="legend-chip static"><i class="opacity-dot far"></i>먼 노드</span>`;
  const relationCounts = new Map();
  const relations = G.viewMode === 'overview' ? (D.globalGraph?.edges || []).map((edge) => ({category: relationCategory(edge.dominantRelation)})) : G.links;
  for (const edge of relations) relationCounts.set(edge.category, (relationCounts.get(edge.category) || 0) + 1);
  qs('#relationLegend').innerHTML = [...relationCounts.entries()].map(([key, count]) => { const style = RELATION_STYLES[key]; return `<button class="legend-chip ${G.hiddenRelations.has(key) ? 'off' : ''}" data-rel-key="${key}"><i class="relation-swatch" style="color:${style.color}"></i>${esc(style.label)} ${count}</button>`; }).join('');
  document.querySelectorAll('[data-rel-key]').forEach((element) => { element.onclick = () => { const key = element.dataset.relKey; if (G.hiddenRelations.has(key)) G.hiddenRelations.delete(key); else G.hiddenRelations.add(key); updateLegends(); refreshGraphDisplay(); }; });
  if (G.viewMode === 'overview') {
    qs('#graphStats').textContent = `개념 노드 ${D.graphMetrics?.nodeCount || 0} · 직접 개념 관계 ${D.graphMetrics?.directSemanticEdgeCount || 0} · 배치 보조 연결 ${D.graphMetrics?.scaffoldEdgeCount || 0} · 커뮤니티 ${D.graphMetrics?.selectedCommunityCount || 0} · 모듈성 ${(D.graphMetrics?.modularity || 0).toFixed(3)} · 배치 방식 ${G.layoutVariant === 'linlog' ? 'LinLog' : '기본'}`;
  } else qs('#graphStats').textContent = `표시 ${G.nodes.length} 노드 · ${G.links.length} 관계 · 깊이 ${G.depth}`;
}
function renderEdges() {
  if (G.viewMode === 'overview') {
    const top = (D.globalGraph?.nodes || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 16);
    qs('#edgeList').innerHTML = top.map((node) => `<div class="edge" data-id="${node.id}" style="--edge-color:${overviewCommunityColor(node.community)}"><small>중심성 ${(node.score || 0).toFixed(3)} · 가중 연결 ${(node.weightedDegree || 0).toFixed(1)} · 매개 ${(node.betweenness || 0).toFixed(3)}</small><span>${esc(node.title)}</span></div>`).join('');
  } else {
    const rootEdges = (adj.get(G.localRoot) || []).filter((edge) => G.map.has(edge.other)).slice().sort((a, b) => edgePriority(b, byId.get(G.localRoot)?.domain) - edgePriority(a, byId.get(G.localRoot)?.domain)).slice(0, 18);
    qs('#edgeList').innerHTML = rootEdges.map((edge) => { const style = RELATION_STYLES[relationCategory(edge.relation)]; return `<div class="edge" data-id="${edge.other}" style="--edge-color:${style.color}"><small>${edge.dir === 'out' ? '' : '← '}${esc(RELATION_LABELS[edge.relation] || edge.relation)}</small><span>${esc(nodeById.get(edge.other)?.label || edge.other)}</span></div>`; }).join('');
  }
  document.querySelectorAll('.edge').forEach((element) => { element.onclick = () => show(element.dataset.id); });
}
function updateControls() {
  qs('#viewMode').value = G.viewMode;
  const overviewButton = qs('#viewOverview');
  const focusButton = qs('#viewFocus');
  overviewButton.classList.toggle('active', G.viewMode === 'overview');
  focusButton.classList.toggle('active', G.viewMode === 'focus');
  overviewButton.setAttribute('aria-pressed', String(G.viewMode === 'overview'));
  focusButton.setAttribute('aria-pressed', String(G.viewMode === 'focus'));
  qs('#depthQuick').classList.toggle('disabled', G.viewMode === 'overview');
  qs('#layoutVariant').value = G.layoutVariant; qs('#depth').value = String(G.depth); qs('#colorMode').value = G.colorMode;
  qs('#labelMode').value = G.labelMode; qs('#sizeMode').value = G.sizeMode; qs('#arrows').checked = G.arrows; qs('#showMaps').checked = G.showMaps;
  qs('#nodeScale').value = String(Math.round(G.nodeScale * 100)); qs('#distance').value = String(G.distance); qs('#repel').value = String(G.repel);
}

function refreshGraphDisplay() {
  if (G.sigma) G.sigma.refresh();
  else if (G.overviewFallback) drawOverviewCanvas();
  else drawLocal();
}
canvas.onpointerdown = (event) => {
  const point = pointerPosition(event); canvas.setPointerCapture(event.pointerId); G.pointerStart = point; G.pointerLast = point; G.moved = false; canvas.classList.add('dragging');
  if (G.viewMode === 'overview' && G.overviewFallback) {
    const node = overviewHit(point.x, point.y); G.pointerNode = node; G.selected = node || G.selected; if (!node) G.pan = true; drawOverviewCanvas(); return;
  }
  if (G.viewMode !== 'focus') return;
  const node = localHit(point.x, point.y);
  if (node) { G.drag = node; G.selected = node; node.fixed = true; const world = localScreenToWorld(point.x, point.y); node.dragOffsetX = node.x - world.x; node.dragOffsetY = node.y - world.y; } else G.pan = true;
  drawLocal();
};
canvas.onpointermove = (event) => {
  const point = pointerPosition(event);
  if (G.viewMode === 'overview' && G.overviewFallback) {
    if (G.pointerStart) {
      if (Math.hypot(point.x - G.pointerStart.x, point.y - G.pointerStart.y) > 3) G.moved = true;
      if (G.pan) { G.panX += (point.x - G.pointerLast.x) / G.zoom; G.panY += (point.y - G.pointerLast.y) / G.zoom; }
      G.pointerLast = point; drawOverviewCanvas(); return;
    }
    G.hover = overviewHit(point.x, point.y); showTooltipNode(G.hover, point, true); drawOverviewCanvas(); return;
  }
  if (G.viewMode !== 'focus') return;
  if (G.pointerStart) {
    if (Math.hypot(point.x - G.pointerStart.x, point.y - G.pointerStart.y) > 3) G.moved = true;
    if (G.drag) { const world = localScreenToWorld(point.x, point.y); G.drag.x = world.x + G.drag.dragOffsetX; G.drag.y = world.y + G.drag.dragOffsetY; G.drag.vx = 0; G.drag.vy = 0; }
    else if (G.pan) { G.panX += (point.x - G.pointerLast.x) / G.zoom; G.panY += (point.y - G.pointerLast.y) / G.zoom; }
    G.pointerLast = point; drawLocal(); return;
  }
  G.hover = localHit(point.x, point.y); showTooltipNode(G.hover, point, false); drawLocal();
};
function releaseCanvasPointer(event) {
  const moved = G.moved; const pointerNode = G.pointerNode; const localNode = G.drag;
  canvas.classList.remove('dragging'); try { canvas.releasePointerCapture(event.pointerId); } catch (_) { /* no-op */ }
  G.drag = null; G.pointerNode = null; G.pan = false; G.pointerStart = null; G.pointerLast = null; G.moved = false;
  if (G.viewMode === 'overview' && G.overviewFallback) { if (!moved && pointerNode) { G.selected = pointerNode; show(pointerNode.id); } else if (!moved && !pointerNode) { G.root = null; G.selected = null; applyOverviewFocus(null, true); updateGraphChrome(); } drawOverviewCanvas(); return; }
  if (G.viewMode !== 'focus') return;
  if (localNode) {
    if (event.shiftKey) { localNode.fixed = true; localNode.pinned = true; }
    else if (localNode.id !== G.localRoot) { localNode.fixed = false; localNode.pinned = false; G.alpha = 0.24; startLocalSimulation(); }
    if (!moved && localNode.id !== G.localRoot) show(localNode.id);
  }
  drawLocal();
}
canvas.onpointerup = releaseCanvasPointer; canvas.onpointercancel = releaseCanvasPointer;
canvas.onpointerleave = () => { if (!G.pointerStart) { G.hover = null; tooltip.hidden = true; refreshGraphDisplay(); } };
canvas.ondblclick = (event) => {
  if (G.viewMode !== 'focus') return;
  const point = pointerPosition(event); const node = localHit(point.x, point.y);
  if (node && node.id !== G.localRoot) { node.pinned = !node.pinned; node.fixed = node.pinned; drawLocal(); }
};
canvas.onwheel = (event) => {
  if (G.viewMode !== 'focus' && !(G.viewMode === 'overview' && G.overviewFallback)) return;
  event.preventDefault(); const point = pointerPosition(event); const before = localScreenToWorld(point.x, point.y);
  G.zoom = Math.max(0.28, Math.min(5, G.zoom * Math.exp(-event.deltaY * 0.00115))); const after = localScreenToWorld(point.x, point.y);
  G.panX += after.x - before.x; G.panY += after.y - before.y; refreshGraphDisplay();
};

qs('#graphSettingsBtn').onclick = () => { qs('#graphSettings').hidden = !qs('#graphSettings').hidden; };
function setGraphView(mode) {
  if (!['overview', 'focus'].includes(mode) || G.viewMode === mode) return;
  G.viewMode = mode;
  qs('#viewMode').value = mode;
  saveGraphOptions();
  buildGraph(G.root, true);
}
qs('#viewOverview').onclick = () => setGraphView('overview');
qs('#viewFocus').onclick = () => setGraphView('focus');
qs('#viewMode').onchange = (event) => setGraphView(event.target.value);
qs('#layoutVariant').onchange = (event) => { G.layoutVariant = event.target.value; saveGraphOptions(); buildGraph(G.root, true); };
qs('#depth').onchange = (event) => { G.depth = +event.target.value; saveGraphOptions(); buildGraph(G.root, true); };
qs('#colorMode').onchange = (event) => { G.colorMode = event.target.value; G.hiddenColors.clear(); saveGraphOptions(); updateLegends(); refreshGraphDisplay(); };
qs('#labelMode').onchange = (event) => { G.labelMode = event.target.value; saveGraphOptions(); refreshGraphDisplay(); };
qs('#sizeMode').onchange = (event) => { G.sizeMode = event.target.value; saveGraphOptions(); refreshGraphDisplay(); updateLegends(); };
qs('#arrows').onchange = (event) => { G.arrows = event.target.checked; saveGraphOptions(); drawLocal(); };
qs('#showMaps').onchange = (event) => { G.showMaps = event.target.checked; saveGraphOptions(); if (G.viewMode === 'focus') buildGraph(G.root, true); };
qs('#nodeScale').oninput = (event) => { G.nodeScale = +event.target.value / 100; saveGraphOptions(); refreshGraphDisplay(); };
qs('#distance').oninput = (event) => { G.distance = +event.target.value; G.alpha = 0.8; saveGraphOptions(); startLocalSimulation(); };
qs('#repel').oninput = (event) => { G.repel = +event.target.value; G.alpha = 0.8; saveGraphOptions(); startLocalSimulation(); };
qs('#resetFocus').onclick = () => { G.root = null; G.sigmaSelected = null; G.selected = null; applyOverviewFocus(null, true); updateSigmaFocus(); updateGraphChrome(); };
qs('#restart').onclick = () => buildGraph(G.root, true);
qs('#defaults').onclick = () => { Object.assign(G, GRAPH_DEFAULTS); saveGraphOptions(); buildGraph(G.root, true); };
qs('#fit').onclick = () => { if (G.viewMode === 'overview' && G.sigma) G.sigma.getCamera().animatedReset({duration: 400}); else if (G.viewMode === 'overview' && G.overviewFallback) fitOverviewCanvas(); else fitLocal(); };
qs('#pause').onclick = () => { if (G.viewMode !== 'focus') return; G.paused = !G.paused; qs('#pause').textContent = G.paused ? '▶' : 'Ⅱ'; if (!G.paused) { G.alpha = Math.max(G.alpha, 0.25); startLocalSimulation(); } };
document.addEventListener('pointerdown', (event) => { if (!qs('#graphSettings').hidden && !qs('#graphSettings').contains(event.target) && event.target.id !== 'graphSettingsBtn') qs('#graphSettings').hidden = true; });
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'f' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) qs('#fit').click();
  if (event.code === 'Space' && G.viewMode === 'focus' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { event.preventDefault(); qs('#pause').click(); }
});

renderSide(D.documents);
show(byId.has(decodeURIComponent(location.hash.slice(1))) ? decodeURIComponent(location.hash.slice(1)) : 'PAGE_HOME');
