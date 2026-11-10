import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Check, CircleHelp, Download,
  FileText, Focus, Layers, Plus, Scale, ShieldCheck, SlidersHorizontal,
  Sparkles, Trash2, X, AlertTriangle, Lightbulb, BookOpen, RotateCcw, Bot, Send, GitBranch, Menu,
} from 'lucide-react';
import './mindtrace.css';

const STORE = 'mindtrace.projects.v1';
const nodeTypes = ['Question', 'Option', 'Criterion', 'Evidence', 'Assumption', 'Risk', 'Consequence', 'Insight', 'Outcome'];
const evidenceStatuses = ['Verified', 'Disputed', 'Assumed', 'Unknown'];
const colors = ['violet', 'blue', 'orange', 'green', 'neutral'];
const starterNodes = [
  { id: 'q', type: 'Question', title: 'What should I focus on next?', body: 'Frame the decision clearly before exploring options.', x: 65, y: 80, color: 'violet' },
  { id: 'a', type: 'Option', title: 'Build a focused product', body: 'Turn one useful idea into a complete experience.', x: 365, y: 45, color: 'blue' },
  { id: 'b', type: 'Option', title: 'Explore several ideas', body: 'Prototype multiple directions and compare what works.', x: 365, y: 260, color: 'orange' },
  { id: 'c', type: 'Criterion', title: 'Long-term usefulness', body: 'Will people have a reason to return?', x: 680, y: 70, color: 'green', weight: 4, scores: {} },
  { id: 'd', type: 'Assumption', title: 'Time is limited', body: 'The available time may constrain scope.', x: 680, y: 280, color: 'neutral', status: 'Assumed' },
];
const uid = () => crypto.randomUUID();
const starter = () => {
  const ids = Object.fromEntries(starterNodes.map(n => [n.id, uid()]));
  const nodes = starterNodes.map(n => ({
    ...n,
    id: ids[n.id],
    sourceIds: n.id === 'a' || n.id === 'b' || n.id === 'd' ? [ids.q] : n.id === 'c' ? [ids.a, ids.b] : [],
  }));
  return { id: uid(), title: 'Untitled decision', updated: Date.now(), nodes };
};

function cleanNode(n) {
  if (!n || typeof n.id !== 'string' || !nodeTypes.includes(n.type)) return null;
  const scores = n.scores && typeof n.scores === 'object' && !Array.isArray(n.scores)
    ? Object.fromEntries(Object.entries(n.scores).filter(([k, v]) => typeof k === 'string' && Number.isFinite(Number(v)) && Number(v) >= 1 && Number(v) <= 5).slice(0, 100).map(([k, v]) => [k.slice(0, 100), Number(v)])) : {};
  return {
    id: n.id.slice(0, 100), type: n.type, title: String(n.title || '').slice(0, 160),
    body: String(n.body || '').slice(0, 2000),
    x: Number.isFinite(n.x) ? Math.max(0, Math.min(1000, n.x)) : 0,
    y: Number.isFinite(n.y) ? Math.max(0, Math.min(500, n.y)) : 0,
    color: colors.includes(n.color) ? n.color : 'neutral',
    weight: Number.isFinite(Number(n.weight)) ? Math.max(1, Math.min(5, Number(n.weight))) : 3,
    scores,
    status: evidenceStatuses.includes(n.status) ? n.status : (n.type === 'Evidence' ? 'Unknown' : 'Assumed'),
    likelihood: Number.isFinite(Number(n.likelihood)) ? Math.max(1, Math.min(5, Number(n.likelihood))) : 3,
    impact: Number.isFinite(Number(n.impact)) ? Math.max(1, Math.min(5, Number(n.impact))) : 3,
    relatedOptionId: typeof n.relatedOptionId === 'string' ? n.relatedOptionId.slice(0, 100) : '',
    sourceIds: Array.isArray(n.sourceIds) ? [...new Set(n.sourceIds.filter(v => typeof v === 'string').map(v => v.slice(0, 100)))].slice(0, 20) : [],
  };
}
function cleanProject(p) {
  if (!p || typeof p.id !== 'string' || typeof p.title !== 'string' || !Array.isArray(p.nodes)) return null;
  const nodes = p.nodes.slice(0, 1000).map(cleanNode).filter(Boolean);
  const ids = new Set(nodes.map(node => node.id));
  const safeNodes = nodes.map(node => ({ ...node, sourceIds: [], relatedOptionId: ids.has(node.relatedOptionId) && node.relatedOptionId !== node.id ? node.relatedOptionId : '' }));
  for (const node of nodes) {
    const target = safeNodes.find(item => item.id === node.id);
    for (const sourceId of node.sourceIds) {
      if (!ids.has(sourceId) || sourceId === node.id || target.sourceIds.length >= 20) continue;
      if (!dependsOn(sourceId, node.id, safeNodes)) target.sourceIds.push(sourceId);
    }
  }
  return { id: p.id.slice(0, 100), title: p.title.slice(0, 120), updated: Number.isFinite(Number(p.updated)) ? Number(p.updated) : Date.now(), nodes: safeNodes };
}
function readProjects() {
  try {
    const value = JSON.parse(localStorage.getItem(STORE) || '[]');
    return Array.isArray(value) ? value.slice(0, 500).map(cleanProject).filter(Boolean) : [];
  } catch { return []; }
}
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const scoreLabel = n => n >= 80 ? 'Strongest current fit' : n >= 65 ? 'Promising, with trade-offs' : n >= 50 ? 'Mixed evidence' : 'Needs more investigation';
const connectorPath = ({ from, to }) => { const forward = from.x <= to.x; const startX = forward ? from.x + 205 : from.x; const endX = forward ? to.x : to.x + 205; const direction = forward ? 1 : -1; const startY = from.y + 62; const endY = to.y + 62; return `M ${startX} ${startY} C ${startX + direction * 55} ${startY}, ${endX - direction * 55} ${endY}, ${endX} ${endY}`; };
const dependsOn = (nodeId, targetId, allNodes, visited = new Set()) => { if (nodeId === targetId) return true; if (visited.has(nodeId)) return false; visited.add(nodeId); const node = allNodes.find(item => item.id === nodeId); const deps = [...new Set([...(node?.sourceIds || []), ...(node?.relatedOptionId ? [node.relatedOptionId] : [])])]; return deps.some(sourceId => dependsOn(sourceId, targetId, allNodes, visited)); };

export default function MindtraceApp() {
  const [projects, setProjects] = useState(readProjects);
  const [activeId, setActiveId] = useState(() => readProjects()[0]?.id || null);
  const [selected, setSelected] = useState(null);
  const [panel, setPanel] = useState('map');
  const [showCreate, setShowCreate] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [zoom, setZoom] = useState(100);
  const [notice, setNotice] = useState('');
  const [drag, setDrag] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [scenarioWeights, setScenarioWeights] = useState({});
  const [scenarioOptionShifts, setScenarioOptionShifts] = useState({});
  const [scenarioName, setScenarioName] = useState('Alternative priorities');
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotReply, setCopilotReply] = useState('');
  const active = projects.find(p => p.id === activeId);
  const nodes = active?.nodes || [];
  const options = nodes.filter(n => n.type === 'Option');
  const criteria = nodes.filter(n => n.type === 'Criterion');
  const evidence = nodes.filter(n => n.type === 'Evidence');
  const assumptions = nodes.filter(n => n.type === 'Assumption');
  const risks = nodes.filter(n => n.type === 'Risk');

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(projects)); }
    catch { setNotice('Browser storage is full or unavailable. Export a backup before continuing.'); }
  }, [projects]);
  useEffect(() => {
    document.title = 'MINDTRACE — Instant Decision Copilot & Visual Decision Workspace | Flaredrift';
    const description = 'A local-first decision workspace with instant decision support, weighted comparisons, automatic outcome cards, connected reasoning trails, evidence checks and scenario analysis.';
    const setMeta = (selector, attr, value) => { const el = document.querySelector(selector); if (el) el.setAttribute(attr, value); };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', 'MINDTRACE — Instant Decision Copilot & Visual Decision Workspace');
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', 'MINDTRACE — Instant Decision Copilot & Visual Decision Workspace');
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', 'https://flaredrift.vercel.app/mindtrace/');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://flaredrift.vercel.app/mindtrace/';
  }, []);

  const updateActive = fn => setProjects(old => old.map(p => p.id === activeId ? { ...fn(p), updated: Date.now() } : p));
  const updateNode = (id, patch) => updateActive(p => ({ ...p, nodes: p.nodes.map(n => n.id === id ? { ...n, ...patch } : n) }));
  const setNodeSources = (nodeId, requestedIds) => {
    const current = active?.nodes || [];
    const target = current.find(node => node.id === nodeId);
    if (!target) return;
    const candidates = [...new Set(requestedIds)].filter(id => id !== nodeId && current.some(node => node.id === id)).slice(0, 20);
    let graph = current.map(node => node.id === nodeId ? { ...node, sourceIds: [] } : node);
    const accepted = [];
    for (const sourceId of candidates) {
      if (dependsOn(sourceId, nodeId, graph)) continue;
      accepted.push(sourceId);
      graph = graph.map(node => node.id === nodeId ? { ...node, sourceIds: [...accepted] } : node);
    }
    if (accepted.length !== candidates.length) setNotice('A circular reasoning link was blocked. Choose a source that does not depend on this card.');
    updateNode(nodeId, { sourceIds: accepted });
  };
  const createProject = title => {
    const p = starter(); p.title = title.trim() || 'Untitled decision';
    setProjects(old => [p, ...old]); setActiveId(p.id); setSelected(null); setPanel('map'); setShowCreate(false); setDraftTitle(''); setScenarioWeights({}); setScenarioOptionShifts({});
  };
  const addNode = type => {
    if (!active) return;
    const node = cleanNode({ id: uid(), type, title: `New ${type.toLowerCase()}`, body: 'Add context, evidence or a useful note.', x: 100 + (nodes.length % 3) * 250, y: 80 + (nodes.length % 4) * 105, color: type === 'Option' ? 'blue' : type === 'Outcome' ? 'violet' : 'neutral', weight: 3, status: type === 'Evidence' ? 'Unknown' : 'Assumed' });
    updateActive(p => ({ ...p, nodes: [...p.nodes, node] })); setSelected(node.id);
  };
  const deleteProject = id => { const next = projects.filter(p => p.id !== id); setProjects(next); if (activeId === id) { setActiveId(next[0]?.id || null); setSelected(null); } };
  const deleteNode = id => { updateActive(p => ({ ...p, nodes: p.nodes.filter(n => n.id !== id).map(n => ({ ...n, scores: Object.fromEntries(Object.entries(n.scores || {}).filter(([key]) => key !== id)), relatedOptionId: n.relatedOptionId === id ? '' : n.relatedOptionId, sourceIds: (n.sourceIds || []).filter(sourceId => sourceId !== id) })) })); setSelected(null); };
  const setCriterionScore = (criterionId, optionId, value) => {
    updateActive(p => ({ ...p, nodes: p.nodes.map(n => { if (n.id !== criterionId) return n; const scores = { ...(n.scores || {}) }; if (value === '') delete scores[optionId]; else scores[optionId] = Number(value); return { ...n, scores }; }) }));
  };
  const calculations = useMemo(() => {
    if (!options.length || !criteria.length) return [];
    return options.map(option => {
      let weighted = 0, totalWeight = 0, scored = 0;
      criteria.forEach(c => {
        const weight = Math.max(1, Math.min(5, Number(c.weight) || 3)) * (panel === 'scenarios' ? (scenarioWeights[c.id] ?? 1) : 1);
        const baseScore = Number(c.scores?.[option.id]);
        const temporaryShift = panel === 'scenarios' ? (scenarioOptionShifts[option.id] ?? 0) : 0;
        const score = Number.isFinite(baseScore) && baseScore >= 1 && baseScore <= 5 ? Math.max(1, Math.min(5, baseScore + temporaryShift)) : NaN;
        if (Number.isFinite(score)) { weighted += score * weight; totalWeight += weight; scored += 1; }
      });
      const matrixScore = totalWeight ? (weighted / (totalWeight * 5)) * 100 : 0;
      const linkedEvidence = evidence.filter(e => !e.relatedOptionId || e.relatedOptionId === option.id);
      const verified = linkedEvidence.filter(e => e.status === 'Verified').length;
      const disputed = linkedEvidence.filter(e => e.status === 'Disputed').length;
      const unknown = linkedEvidence.filter(e => e.status === 'Unknown' || e.status === 'Assumed').length;
      const linkedRisks = risks.filter(r => !r.relatedOptionId || r.relatedOptionId === option.id);
      const riskLoad = linkedRisks.length ? linkedRisks.reduce((sum, r) => sum + (r.likelihood * r.impact), 0) / linkedRisks.length : 0;
      const coverage = criteria.length ? scored / criteria.length : 0;
      const evidenceAdjustment = Math.min(8, verified * 2) - Math.min(8, disputed * 1.5) - Math.min(6, unknown * 0.75);
      const riskAdjustment = Math.min(12, riskLoad * 0.6);
      const missingScorePenalty = (1 - coverage) * 15;
      const adjusted = totalWeight ? Math.max(0, Math.min(100, matrixScore + evidenceAdjustment - riskAdjustment - missingScorePenalty)) : 0;
      return { option, matrixScore, adjusted, verified, disputed, unknown, riskLoad, coverage, scored, total: criteria.length };
    }).sort((a, b) => b.adjusted - a.adjusted);
  }, [options, criteria, evidence, risks, scenarioWeights, scenarioOptionShifts, panel]);
  const topResult = calculations.find(result => result.scored > 0) || null;
  const runnerUp = topResult ? (calculations.find(result => result.option.id !== topResult.option.id) || null) : null;
  const completeComparison = options.length >= 2 && criteria.length > 0 && options.every(option => criteria.every(criterion => Number.isFinite(Number(criterion.scores?.[option.id])) && Number(criterion.scores?.[option.id]) >= 1 && Number(criterion.scores?.[option.id]) <= 5));
  const autoOutcome = completeComparison && topResult ? { id: `auto-outcome-${activeId}`, type: 'Outcome', title: `${topResult.option.title} currently ranks highest`, body: `${topResult.adjusted.toFixed(1)}% adjusted indicator. Generated from the completed decision matrix; review evidence and trade-offs before deciding.`, x: 820, y: 190, color: 'violet', sourceIds: options.map(option => option.id), autoGenerated: true } : null;
  const mapNodes = autoOutcome ? [...nodes, autoOutcome] : nodes;
  const connections = mapNodes.flatMap(node => [...new Set([...(node.sourceIds || []), ...(node.relatedOptionId ? [node.relatedOptionId] : [])])].filter(sourceId => mapNodes.some(source => source.id === sourceId)).map(sourceId => ({ from: mapNodes.find(source => source.id === sourceId), to: node })));
  const runCopilot = () => {
    const q = copilotPrompt.trim();
    if (!q) { setCopilotReply('Ask a question about this decision, its options, evidence or priorities.'); return; }
    const lower = q.toLowerCase();
    const leader = topResult;
    const runnerUp = leader ? (calculations.find(result => result.option.id !== leader.option.id) || null) : null;
    const gaps = evidenceGaps.length;
    const incomplete = calculations.filter(item => item.coverage < 1).length;
    let response = '';
    if (!calculations.length || !criteria.length) response = 'Start by adding at least two options and one criterion, then score each option. I can analyse the comparison once there is enough structured information.';
    else if (/what if|change|priority|priorit/i.test(lower)) response = `Try the Scenario Explorer to test that change without overwriting your baseline. Your current leader is ${leader?.option.title || 'not established'} (${leader?.adjusted.toFixed(1) || '—'}% adjusted indicator). ${runnerUp ? `The next option is ${runnerUp.option.title} (${runnerUp.adjusted.toFixed(1)}%).` : ''} Scenario results are sensitivity tests, not forecasts.`;
    else if (/risk|danger|downside|failure/i.test(lower)) response = risks.length ? `You have ${risks.length} risk item(s). Review their likelihood and impact ratings on the Map. The highest combined risk load currently belongs to ${[...calculations].sort((a,b)=>b.riskLoad-a.riskLoad)[0]?.option.title || 'an unranked option'}. ${gaps ? `There are also ${gaps} unresolved evidence or assumption item(s).` : ''}` : 'No risks have been recorded yet. Add a Risk card for each plausible downside, then rate its likelihood and impact. I cannot infer risks that you have not described.';
    else if (/evidence|proof|certain|trust|source/i.test(lower)) response = `There are ${evidence.length} evidence card(s), ${evidence.filter(item=>item.status==='Verified').length} marked verified, and ${gaps} unresolved or disputed item(s). MINDTRACE does not independently verify claims; check sources yourself and classify each item honestly.`;
    else response = `${leader ? `Based on the information entered, ${leader.option.title} currently has the highest adjusted indicator (${leader.adjusted.toFixed(1)}%).` : 'There is not enough information to rank the options.'} ${runnerUp ? `${runnerUp.option.title} is next at ${runnerUp.adjusted.toFixed(1)}%, a ${Math.abs(leader.adjusted-runnerUp.adjusted).toFixed(1)} point difference.` : ''} ${incomplete ? `${incomplete} option(s) still have missing criterion scores.` : 'All options have been scored against every criterion.'} ${gaps ? `Review ${gaps} unresolved evidence or assumption item(s) before relying on this ranking.` : 'Still check whether the scores reflect reliable evidence.'} This is a structured analysis of your inputs, not a prediction or a substitute for your judgment.`;
    setCopilotReply(response);
  };
  const evidenceStats = useMemo(() => evidenceStatuses.map(status => ({ status, count: [...evidence, ...assumptions].filter(n => n.status === status).length })), [evidence, assumptions]);
  const evidenceGaps = [...evidence, ...assumptions].filter(n => n.status === 'Unknown' || n.status === 'Assumed' || n.status === 'Disputed');

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ format: 'mindtrace-backup', version: 1, projects }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'mindtrace-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importData = async file => {
    try {
      if (!file || file.size > 5 * 1024 * 1024) throw new Error('Choose a backup smaller than 5 MB.');
      const data = JSON.parse(await file.text());
      if (data.format !== 'mindtrace-backup' || data.version !== 1 || !Array.isArray(data.projects) || data.projects.length > 500) throw new Error('This backup file is not valid.');
      const safe = data.projects.map(p => { const clean = cleanProject(p); if (!clean) return null; const idMap = new Map(clean.nodes.map(node => [node.id, uid()])); return { ...clean, id: uid(), nodes: clean.nodes.map(node => ({ ...node, id: idMap.get(node.id), sourceIds: (node.sourceIds || []).map(sourceId => idMap.get(sourceId)).filter(Boolean), relatedOptionId: idMap.get(node.relatedOptionId) || '', scores: Object.fromEntries(Object.entries(node.scores || {}).map(([optionId, score]) => [idMap.get(optionId), score]).filter(([optionId]) => Boolean(optionId))) })) }; }).filter(Boolean);
      setProjects(old => [...safe, ...old].slice(0, 500)); setNotice(`Imported ${safe.length} project${safe.length === 1 ? '' : 's'}.`);
    } catch (error) { setNotice(error.message || 'Could not import this file.'); }
  };
  const reportHtml = () => {
    if (!active) return '';
    const rows = calculations.map((r, i) => `<tr><td>${i + 1}. ${escapeHtml(r.option.title)}</td><td>${r.matrixScore.toFixed(1)}%</td><td>${r.adjusted.toFixed(1)}%</td><td>${r.verified} verified · ${r.disputed} disputed · ${r.unknown} unresolved · ${Math.round(r.coverage * 100)}% scored</td></tr>`).join('');
    const criteriaRows = criteria.map(c => `<tr><td>${escapeHtml(c.title)}</td><td>${c.weight}/5</td><td>${options.map(o => `${escapeHtml(o.title)}: ${c.scores?.[o.id] ?? 'Not scored'}/5`).join('<br>')}</td></tr>`).join('');
    const evidenceRows = [...evidence, ...assumptions, ...risks, ...nodes.filter(n => n.type === 'Consequence' || n.type === 'Insight')].map(n => `<li><strong>${escapeHtml(n.type)} — ${escapeHtml(n.title)}</strong><br>${escapeHtml(n.body)}<br><small>${escapeHtml(n.status || 'Not classified')}${n.type === 'Risk' ? ` · likelihood ${n.likelihood}/5 · impact ${n.impact}/5` : ''}</small></li>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(active.title)} — MINDTRACE report</title><style>body{font:15px/1.6 system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;color:#20202a}h1,h2{letter-spacing:-.04em}small{color:#666}table{width:100%;border-collapse:collapse;margin:16px 0 28px}td,th{border:1px solid #ddd;padding:10px;text-align:left;vertical-align:top}li{margin:12px 0}.note{background:#f2f0fa;padding:14px;border-left:3px solid #8979c7}@media print{body{margin:0;max-width:none}}</style></head><body><p><strong>MINDTRACE · DECISION REPORT</strong></p><h1>${escapeHtml(active.title)}</h1><p>Generated ${new Date().toLocaleString()}</p><div class="note">This report summarizes the information entered in this workspace. Scores are decision aids, not objective predictions or guarantees.</div><h2>Current comparison</h2>${rows ? `<table><thead><tr><th>Option</th><th>Matrix score</th><th>Adjusted indicator</th><th>Evidence overview</th></tr></thead><tbody>${rows}</tbody></table>` : '<p>Add at least one option and one criterion to calculate a comparison.</p>'}<h2>Criteria and scores</h2>${criteriaRows ? `<table><thead><tr><th>Criterion</th><th>Weight</th><th>Option scores</th></tr></thead><tbody>${criteriaRows}</tbody></table>` : '<p>No criteria have been added.</p>'}<h2>Evidence, assumptions and risks</h2><ul>${evidenceRows || '<li>None added yet.</li>'}</ul><h2>Interpretation</h2><p>${topResult ? `The highest current indicator is “${escapeHtml(topResult.option.title)}” at ${topResult.adjusted.toFixed(1)}%. ${escapeHtml(scoreLabel(topResult.adjusted))}. Review evidence gaps, assumptions and risk notes before making a final decision.` : 'There is not enough scored information to rank options yet.'}</p><p><small>Created locally by MINDTRACE · Flaredrift</small></p></body></html>`;
  };
  const exportReport = () => {
    const blob = new Blob([reportHtml()], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(active?.title || 'mindtrace-decision').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mindtrace-decision'}-report.html`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Report exported. Open the HTML file and use Print → Save as PDF if you need a PDF copy.');
  };
  const printReport = () => {
    const blob = new Blob([reportHtml()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) { URL.revokeObjectURL(url); setNotice('Allow pop-ups to open the printable report, or export the HTML report instead.'); return; }
    win.addEventListener('load', () => { win.focus(); win.print(); }, { once: true });
    win.addEventListener('afterprint', () => URL.revokeObjectURL(url), { once: true });
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const tabs = [
    ['map', Focus, 'Map'], ['matrix', Scale, 'Decision matrix'], ['evidence', BookOpen, 'Evidence'],
    ['scenarios', SlidersHorizontal, 'Scenarios'], ['copilot', Bot, 'Copilot'], ['report', FileText, 'Report'],
  ];

  return <div className="mt-app">
    <aside className={`mt-sidebar ${mobileSidebarOpen ? 'is-open' : ''}`}>
      <div className="mt-sidebar-head">
        <a className="mt-brand" href="/mindtrace" aria-label="MINDTRACE home">
          <img className="mindtrace-brand-icon" src="/mindtrace.svg" alt="" />
          <span>MINDTRACE<small>BY FLAREDRIFT</small></span>
        </a>
        <button className="mt-mobile-menu" onClick={() => setMobileSidebarOpen(open => !open)} aria-label={mobileSidebarOpen ? 'Close workspace menu' : 'Open workspace menu'} aria-expanded={mobileSidebarOpen}><Menu size={17}/></button>
      </div>
      <div className="mt-side-label">WORKSPACE</div><button className="mt-new" onClick={() => setShowCreate(true)}><Plus size={16}/> New decision <span>⌘ N</span></button>
      <div className="mt-side-label mt-recent-label">YOUR THINKING <span>{projects.length}</span></div>
      <div className="mt-project-list">{projects.map(p => <button key={p.id} className={`mt-project-link ${p.id === activeId ? 'active' : ''}`} onClick={() => { setActiveId(p.id); setSelected(null); setPanel('map'); setMobileSidebarOpen(false); }}><span className="mt-project-dot"/><span>{p.title}</span></button>)}</div>
      {!projects.length && <p className="mt-empty-side">Your decisions will appear here.</p>}
      <div className="mt-side-bottom"><div className="mt-local-status"><ShieldCheck size={15}/><span>Stored on this device<small>No account. No cloud sync.</small></span></div><button className="mt-side-action" onClick={exportData}><Download size={15}/> Export backup</button><label className="mt-side-action mt-import"><Layers size={15}/> Import backup<input type="file" accept="application/json,.json" onChange={e => { importData(e.target.files?.[0]); e.target.value = ''; }}/></label><a className="mt-back" href="/"><ArrowLeft size={14}/> Back to Flaredrift</a></div>
    </aside>
    <main className="mt-main">
      <header className="mt-topbar"><div className="mt-breadcrumb">Workspace <span>/</span> <strong>{active?.title || 'Overview'}</strong></div><div className="mt-top-actions"><span className="mt-save-state"><span/> Saved locally</span><button className="mt-icon-button" title="Export backup" onClick={exportData}><Download size={17}/></button><button className="mt-avatar" title="Local workspace">MT</button></div></header>
      {!active ? <section className="mt-welcome"><div className="mt-eyebrow"><span/> A SPACE TO THINK CLEARLY</div><h1>Make room for<br/><em>better thinking.</em></h1><p>Turn complicated decisions into something you can see, question, compare and understand. MINDTRACE helps you build a transparent case—not a blind answer.</p><button className="mt-primary" onClick={() => setShowCreate(true)}><Plus size={17}/> Create your first decision</button><div className="mt-welcome-foot"><span><ShieldCheck size={15}/> Private by default</span><span><Layers size={15}/> Visual thinking space</span><span><Activity size={15}/> Transparent comparisons</span></div></section> : <>
        <section className="mt-work-head"><div><div className="mt-eyebrow">DECISION WORKSPACE <span className="mt-id">/{active.id.slice(0, 8)}</span></div><input className="mt-title-input" value={active.title} maxLength={120} onChange={e => updateActive(p => ({ ...p, title: e.target.value }))}/><p>Build the case, compare alternatives, challenge assumptions and document your reasoning.</p></div><div className="mt-head-actions"><button className="mt-outline" onClick={exportData}><Download size={15}/> Backup</button><button className="mt-icon-button" title="Delete decision" onClick={() => { if (window.confirm('Delete this decision and its local data?')) deleteProject(active.id); }}><Trash2 size={16}/></button></div></section>
        <div className="mt-toolbar mt-engine-toolbar"><div className="mt-tabs">{tabs.map(([id, Icon, label]) => <button key={id} className={panel === id ? 'selected' : ''} onClick={() => setPanel(id)}><Icon size={15}/>{label}</button>)}</div>{panel === 'map' && <div className="mt-zoom"><button onClick={() => setZoom(z => Math.max(60, z - 10))}>−</button><span>{zoom}%</span><button onClick={() => setZoom(z => Math.min(130, z + 10))}>+</button><button title="Reset zoom" onClick={() => setZoom(100)}><Focus size={14}/></button></div>}</div>

        {panel === 'map' && <>
          <div className="mt-board-wrap"><div className="mt-board" style={{ '--mt-zoom': zoom / 100 }} onPointerMove={e => { if (!drag || !active) return; const rect = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - rect.left) / (zoom / 100) - drag.dx; const y = (e.clientY - rect.top) / (zoom / 100) - drag.dy; updateNode(drag.id, { x: Math.max(0, Math.min(1000, x)), y: Math.max(0, Math.min(500, y)) }); }} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
            <svg className="mt-connectors" viewBox="0 0 1100 620" preserveAspectRatio="none" aria-hidden="true">{connections.map(({from,to}) => <path key={`${from.id}-${to.id}`} d={connectorPath({ from, to })} />)}</svg>
            {mapNodes.map(n => <article key={n.id} className={`mt-node mt-node-${n.color} ${n.autoGenerated ? 'mt-node-outcome' : ''} ${selected === n.id ? 'is-selected' : ''}`} style={{ left: n.x, top: n.y }} onClick={() => { if (!n.autoGenerated) setSelected(n.id); }} onPointerDown={e => { if (n.autoGenerated || e.target.closest('button')) return; const rect = e.currentTarget.getBoundingClientRect(); setSelected(n.id); setDrag({ id: n.id, dx: (e.clientX - rect.left) / (zoom / 100), dy: (e.clientY - rect.top) / (zoom / 100) }); e.currentTarget.setPointerCapture(e.pointerId); }}><div className="mt-node-top"><span className="mt-node-type">{n.type}{n.autoGenerated ? ' · AUTO' : ''}</span>{!n.autoGenerated && <button title="Select node" onClick={e => { e.stopPropagation(); setSelected(n.id); }}><span aria-hidden="true">···</span></button>}</div><h3>{n.title}</h3><p>{n.body}</p><span className="mt-node-handle"/></article>)}
          </div><div className="mt-board-hint">Drag nodes to arrange your thinking · Trails connect from declared source cards · Complete the matrix to generate an outcome card automatically</div><div className="mt-add-node"><span>ADD TO YOUR MAP</span>{nodeTypes.map(t => <button key={t} onClick={() => addNode(t)}>{t}<Plus size={12}/></button>)}</div></div>
          {selected && <section className="mt-inspector"><div className="mt-inspector-heading"><div><span>SELECTED ELEMENT</span><strong>Node details</strong></div><button className="mt-icon-button" onClick={() => setSelected(null)} title="Close details"><X size={16}/></button></div>{(() => { const n = nodes.find(x => x.id === selected); if (!n) return null; return <>
            <label>TYPE<select value={n.type} onChange={e => updateNode(n.id, { type: e.target.value })}>{nodeTypes.map(t => <option key={t}>{t}</option>)}</select></label>
            <label>TITLE<input value={n.title} maxLength={160} onChange={e => updateNode(n.id, { title: e.target.value })}/></label>
            <label>NOTES<textarea rows="3" maxLength={2000} value={n.body} onChange={e => updateNode(n.id, { body: e.target.value })}/></label>
            {(n.type === 'Criterion') && <label>IMPORTANCE · {n.weight}/5<input type="range" min="1" max="5" value={n.weight} onChange={e => updateNode(n.id, { weight: Number(e.target.value) })}/></label>}
            {!n.autoGenerated && <div className="mt-source-editor"><span>REASONING SOURCES</span><p>Select the cards this item is based on. Connections appear on the map.</p><div className="mt-source-list">{nodes.filter(source => source.id !== n.id).map(source => { const blocked = dependsOn(source.id, n.id, nodes); return <label key={source.id} className={blocked ? 'is-blocked' : ''}><input type="checkbox" checked={(n.sourceIds || []).includes(source.id)} disabled={blocked} onChange={e => setNodeSources(n.id, e.target.checked ? [...(n.sourceIds || []), source.id] : (n.sourceIds || []).filter(id => id !== source.id))}/><span><strong>{source.title || `Untitled ${source.type}`}</strong><small>{source.type}{blocked ? ' · loop blocked' : ''}</small></span></label>; })}</div><small className="mt-field-help">A card cannot depend on itself or on a card that already depends on it. Up to 20 direct sources.</small></div>}
            {(n.type === 'Evidence' || n.type === 'Assumption') && <label>KNOWLEDGE STATUS<select value={n.status} onChange={e => updateNode(n.id, { status: e.target.value })}>{evidenceStatuses.map(s => <option key={s}>{s}</option>)}</select></label>}
            {n.type === 'Risk' && <><label>LIKELIHOOD · {n.likelihood}/5<input type="range" min="1" max="5" value={n.likelihood} onChange={e => updateNode(n.id, { likelihood: Number(e.target.value) })}/></label><label>IMPACT · {n.impact}/5<input type="range" min="1" max="5" value={n.impact} onChange={e => updateNode(n.id, { impact: Number(e.target.value) })}/></label></>}
            {['Evidence', 'Assumption', 'Risk', 'Consequence'].includes(n.type) && <label>RELATED OPTION<select value={n.relatedOptionId || ''} onChange={e => updateNode(n.id, { relatedOptionId: e.target.value })}><option value="">All options / not linked</option>{options.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}</select></label>}
            <button className="mt-delete-node" onClick={() => deleteNode(n.id)}><Trash2 size={14}/> Remove node</button>
          </>; })()}</section>}
        </>}

        {panel === 'matrix' && <section className="mt-engine-panel"><div className="mt-section-heading"><div><span className="mt-eyebrow">01 / COMPARE ALTERNATIVES</span><h2>Decision matrix</h2><p>Score each option against the criteria that matter. Weights represent importance, not certainty.</p></div><button className="mt-primary" onClick={() => addNode('Criterion')}><Plus size={15}/> Add criterion</button></div>
          {!options.length || !criteria.length ? <div className="mt-empty-engine"><Scale size={25}/><h3>Your comparison needs options and criteria.</h3><p>Add at least two Option cards and one Criterion card in the Map tab. Then score each option here.</p><button className="mt-outline" onClick={() => setPanel('map')}>Go to map <ArrowRight size={14}/></button></div> : <div className="mt-table-scroll"><table className="mt-matrix"><thead><tr><th>Criterion / importance</th>{options.map(o => <th key={o.id}>{o.title}</th>)}</tr></thead><tbody>{criteria.map(c => <tr key={c.id}><td><button className="mt-inline-edit" onClick={() => { setPanel('map'); setSelected(c.id); }}>{c.title}<span>Edit</span></button><small>Weight {c.weight}/5</small><input aria-label={`Importance for ${c.title}`} type="range" min="1" max="5" value={c.weight} onChange={e => updateNode(c.id, { weight: Number(e.target.value) })}/></td>{options.map(o => <td key={o.id}><label className="mt-score-select"><span>{c.scores?.[o.id] ? `${c.scores[o.id]}/5` : 'Not scored'}</span><select aria-label={`${c.title} score for ${o.title}`} value={c.scores?.[o.id] ?? ''} onChange={e => setCriterionScore(c.id, o.id, e.target.value)}><option value="">—</option>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} · {['Very weak', 'Weak', 'Mixed', 'Good', 'Very strong'][v - 1]}</option>)}</select></label></td>)}</tr>)}</tbody></table></div>}
          {calculations.length > 0 && <div className="mt-results mt-matrix-results"><div className="mt-results-title"><span>Current option ranking</span><small>Weighted score adjusted for evidence gaps and risk</small></div>{calculations.map((r, i) => <article key={r.option.id}><div className="mt-result-rank">{i + 1}</div><div className="mt-result-main"><strong>{r.option.title}</strong><div className="mt-score-track"><span style={{ width: `${r.adjusted}%` }}/></div><small>{r.adjusted.toFixed(1)}% indicator · {r.scored}/{r.total} criteria scored</small></div><span className="mt-result-change">{r.scored ? scoreLabel(r.adjusted) : 'Not enough scores'}</span></article>)}</div>}
          {topResult && <div className="mt-recommendation-box"><span className="mt-eyebrow">CURRENT STRONGEST OPTION</span><h3>{topResult.option.title}</h3><p>{scoreLabel(topResult.adjusted)} based on the scores currently entered. {topResult.verified} verified evidence item(s), {topResult.disputed} disputed item(s), and {topResult.unknown} unresolved item(s) are associated with this option.</p><small>{topResult.coverage < 1 ? `Only ${Math.round(topResult.coverage * 100)}% of criteria have scores for this option. Complete the matrix before relying on its ranking.` : 'All criteria have scores. Review the underlying evidence and assumptions before deciding.'}</small></div>}
          {autoOutcome && <button className="mt-generated-outcome" onClick={() => setPanel('map')}><span><GitBranch size={15}/> AUTOMATIC OUTCOME CREATED</span><strong>{autoOutcome.title}</strong><small>{autoOutcome.body}</small><b>View connected card on map <ArrowRight size={13}/></b></button>}
          <div className="mt-engine-note"><Lightbulb size={16}/> A score is a structured judgment, not a fact. Missing scores reduce the adjusted indicator; add evidence to explain why you assigned each score.</div>
        </section>}

        {panel === 'evidence' && <section className="mt-engine-panel"><div className="mt-section-heading"><div><span className="mt-eyebrow">02 / CHECK WHAT YOU KNOW</span><h2>Evidence intelligence</h2><p>Separate what is supported from what is uncertain. This panel highlights gaps; it does not verify claims automatically.</p></div><div className="mt-inline-actions"><button className="mt-outline" onClick={() => addNode('Evidence')}><Plus size={14}/> Add evidence</button><button className="mt-primary" onClick={() => addNode('Assumption')}><Plus size={14}/> Add assumption</button></div></div>
          <div className="mt-evidence-stats">{evidenceStats.map(s => <article key={s.status}><span>{s.status}</span><strong>{s.count}</strong></article>)}</div>
          <div className="mt-evidence-columns"><div><h3>Evidence and assumptions</h3>{[...evidence, ...assumptions].length ? [...evidence, ...assumptions].map(n => <article className="mt-evidence-item" key={n.id}><div><span className={`mt-status mt-status-${n.status.toLowerCase()}`}>{n.status}</span><strong>{n.title}</strong><p>{n.body}</p></div><button className="mt-outline" onClick={() => { setPanel('map'); setSelected(n.id); }}>Edit</button></article>) : <p className="mt-muted">No evidence or assumptions added yet.</p>}</div><aside><h3>What still needs attention</h3>{evidenceGaps.length ? evidenceGaps.map(n => <div className="mt-gap-item" key={n.id}><AlertTriangle size={14}/><span><strong>{n.title}</strong><small>{n.status} · {n.type}</small></span></div>) : <div className="mt-clear-state"><Check size={17}/> No unresolved items have been classified. This does not mean every claim is verified.</div>}<div className="mt-engine-note"><ShieldCheck size={15}/> MINDTRACE never treats an assumption as verified evidence.</div></aside></div>
        </section>}

        {panel === 'scenarios' && <section className="mt-engine-panel"><div className="mt-section-heading"><div><span className="mt-eyebrow">03 / TEST DIFFERENT PRIORITIES</span><h2>Scenario explorer</h2><p>Temporarily change how much each criterion matters. Your original weights remain unchanged.</p></div><button className="mt-outline" onClick={() => { setScenarioWeights({}); setScenarioOptionShifts({}); setScenarioName('Alternative priorities'); }}><RotateCcw size={14}/> Reset scenario</button></div>
          <label className="mt-scenario-name">SCENARIO NAME<input value={scenarioName} maxLength={80} onChange={e => setScenarioName(e.target.value)}/></label>
          {!options.length || !criteria.length ? <div className="mt-empty-engine"><SlidersHorizontal size={25}/><h3>Add options and criteria first.</h3><p>Scenario comparisons need a scored decision matrix.</p><button className="mt-outline" onClick={() => setPanel('matrix')}>Open decision matrix</button></div> : <><h3 className="mt-scenario-subhead">Change what matters</h3><div className="mt-scenario-controls">{criteria.map(c => <label key={c.id}><span><strong>{c.title}</strong><small>Original importance: {c.weight}/5</small></span><select value={scenarioWeights[c.id] ?? 1} onChange={e => setScenarioWeights(old => ({ ...old, [c.id]: Number(e.target.value) }))}><option value="0.5">Half as important</option><option value="1">No change</option><option value="1.5">50% more important</option><option value="2">Twice as important</option></select></label>)}</div><h3 className="mt-scenario-subhead">Test a change in each option's outlook</h3><p className="mt-scenario-explainer">Apply a temporary score shift across that option's criteria to test a more favourable or difficult scenario. This does not edit your saved matrix.</p><div className="mt-scenario-controls">{options.map(o => <label key={o.id}><span><strong>{o.title}</strong><small>Temporary adjustment to its scores</small></span><select value={scenarioOptionShifts[o.id] ?? 0} onChange={e => setScenarioOptionShifts(old => ({ ...old, [o.id]: Number(e.target.value) }))}><option value="-2">Much less favourable (−2)</option><option value="-1">Less favourable (−1)</option><option value="0">No change</option><option value="1">More favourable (+1)</option><option value="2">Much more favourable (+2)</option></select></label>)}</div><div className="mt-results"><div className="mt-results-title"><span>{scenarioName || 'Alternative priorities'}</span><small>Compared with the current matrix</small></div>{calculations.map((r, i) => <article key={r.option.id}><div className="mt-result-rank">{i + 1}</div><div className="mt-result-main"><strong>{r.option.title}</strong><div className="mt-score-track"><span style={{ width: `${r.adjusted}%` }}/></div><small>{r.adjusted.toFixed(1)}% adjusted indicator</small></div><span className="mt-result-change">{scoreLabel(r.adjusted)}</span></article>)}</div></>}
          <div className="mt-engine-note"><Activity size={16}/> Scenario results are sensitivity tests, not forecasts. They show how your ranking responds to changed priorities.</div>
        </section>}

        {panel === 'copilot' && <section className="mt-engine-panel mt-copilot-panel"><div className="mt-section-heading"><div><span className="mt-eyebrow">INSTANT DECISION SUPPORT</span><h2>Decision Copilot</h2><p>Fast, local analysis of your current decision map. No API key, account or network request is required.</p></div><span className="mt-copilot-local"><ShieldCheck size={14}/> LOCAL ANALYSIS</span></div><div className="mt-copilot-grid"><article className="mt-copilot-summary"><span className="mt-eyebrow">CURRENT SIGNAL</span><h3>{topResult ? topResult.option.title : 'Not enough information yet'}</h3><p>{topResult ? `${topResult.adjusted.toFixed(1)}% adjusted indicator · ${topResult.scored}/${topResult.total} criteria scored` : 'Add options, criteria and ratings to begin.'}</p>{runnerUp && <small>{`Leading by ${(topResult.adjusted-runnerUp.adjusted).toFixed(1)} points over ${runnerUp.option.title}.`}</small>}</article><article className="mt-copilot-checks"><h3>What needs attention</h3><p>{evidenceGaps.length} unresolved evidence or assumption item(s)</p><p>{risks.length} risk item(s) recorded</p><p>{calculations.filter(item => item.coverage < 1).length} option(s) with incomplete ratings</p></article></div><div className="mt-copilot-chat"><div className="mt-copilot-chat-head"><Bot size={17}/><div><strong>Ask about this decision</strong><small>Answers are generated from your local workspace data.</small></div></div><form onSubmit={e => { e.preventDefault(); runCopilot(); }}><textarea rows={3} maxLength={500} value={copilotPrompt} onChange={e => setCopilotPrompt(e.target.value)} placeholder="e.g. What is making the leading option stronger? What should I investigate next? What if flexibility mattered twice as much?"/><button className="mt-primary" type="submit"><Send size={14}/> Analyse</button></form>{copilotReply && <div className="mt-copilot-reply"><span>ANALYSIS</span><p>{copilotReply}</p></div>}</div><div className="mt-engine-note"><Lightbulb size={16}/> This first version uses deterministic local reasoning, not a large language model. It cannot browse, verify facts or understand free-form questions like a hosted AI assistant. Your decision data stays in this browser.</div></section>}

        {panel === 'report' && <section className="mt-engine-panel"><div className="mt-section-heading"><div><span className="mt-eyebrow">04 / MAKE YOUR REASONING PORTABLE</span><h2>Decision report</h2><p>A concise snapshot of your current comparison, evidence quality, risks and unresolved questions.</p></div><div className="mt-inline-actions"><button className="mt-outline" onClick={exportReport}><Download size={14}/> Export HTML</button><button className="mt-primary" onClick={printReport}><FileText size={14}/> Print / Save PDF</button></div></div>
          <div className="mt-report-preview"><div className="mt-report-cover"><span>MINDTRACE / DECISION BRIEF</span><h3>{active.title}</h3><p>Generated {new Date().toLocaleDateString()}</p></div><div className="mt-report-summary"><article><span>OPTIONS</span><strong>{options.length}</strong></article><article><span>CRITERIA</span><strong>{criteria.length}</strong></article><article><span>EVIDENCE ITEMS</span><strong>{evidence.length}</strong></article><article><span>OPEN GAPS</span><strong>{evidenceGaps.length + risks.length}</strong></article></div>
            <h3>Current leading option</h3>{topResult ? <div className="mt-leading-option"><div><span>HIGHEST CURRENT INDICATOR</span><strong>{topResult.option.title}</strong><p>{scoreLabel(topResult.adjusted)} · {topResult.scored}/{topResult.total} criteria scored</p></div><b>{topResult.adjusted.toFixed(1)}%</b></div> : <p className="mt-muted">Add options, criteria and scores to generate a comparison.</p>}
            <h3>Comparison overview</h3>{calculations.length ? calculations.map((r, i) => <div className="mt-report-option" key={r.option.id}><span>{i + 1}</span><strong>{r.option.title}</strong><div className="mt-score-track"><span style={{ width: `${r.adjusted}%` }}/></div><b>{r.adjusted.toFixed(1)}%</b></div>) : <p className="mt-muted">No comparison available yet.</p>}
            <h3>Evidence gaps to review</h3>{evidenceGaps.length ? evidenceGaps.map(n => <div className="mt-gap-item" key={n.id}><AlertTriangle size={14}/><span><strong>{n.title}</strong><small>{n.status} · {n.type}</small></span></div>) : <p className="mt-muted">No unresolved items classified.</p>}
            <p className="mt-report-disclaimer">This is a structured decision aid, not an objective prediction. Review the underlying evidence, assumptions and trade-offs before acting.</p>
          </div>
        </section>}
      </>}
    </main>
    {showCreate && <div className="mt-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowCreate(false); }}><form className="mt-modal" onSubmit={e => { e.preventDefault(); createProject(draftTitle); }}><button type="button" className="mt-modal-close" onClick={() => setShowCreate(false)} aria-label="Close"><X size={18}/></button><span className="mt-eyebrow">START WITH A QUESTION</span><h2>What are you thinking through?</h2><p>Give this decision a name. You can change it any time.</p><input autoFocus value={draftTitle} onChange={e => setDraftTitle(e.target.value)} placeholder="e.g. What should I build next?" maxLength={120}/><button className="mt-primary" type="submit">Create workspace <ArrowRight size={16}/></button></form></div>}
    {notice && <div className="mt-toast" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
    <div className="mt-shortcut" aria-hidden="true">MINDTRACE <span>LOCAL-FIRST DECISION ENGINE</span></div>
  </div>;
}
