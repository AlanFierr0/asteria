import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const markup = html.slice(0, html.indexOf('<script>'));
const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
const cases = JSON.parse(script.match(/const sourceCases=(\[[^\n]+\]);/)[1]);
assert.equal(cases.length, 7);
assert.equal(cases.reduce((total, item) => total + item.failures.length, 0), 22);
assert.equal(cases.reduce((total, item) => total + item.solutions.length, 0), 8);
assert.equal(cases.reduce((total, item) => total + item.guarantees.length, 0), 11);
assert.ok(cases.every(item => item.solutions.every(({ tradeoff }) =>
  tradeoff.can.length > 0 && tradeoff.limits.length > 0 && tradeoff.cost.length > 20
)), 'Each solution needs capabilities, limitations and an accepted cost');
assert.match(cases.find(item => item.id === 'capacity').solutions[1].tradeoff.cost, /reserva que puede no ajustarse a la carga global/);
assert.match(cases.find(item => item.id === 'payments').solutions[0].tradeoff.limits.join(' '), /no define el comportamiento ante una partición/);
const corrected = Object.fromEntries(cases.map(item => [item.id, item]));
assert.match(corrected.rewards.problem, /victoria o derrota/);
assert.match(corrected.rewards.solutions[0].full, /combate, jugador y tipo/);
assert.match(corrected.rewards.solutions[0].full, /menor latencia/);
assert.match(corrected.entry.solutions[0].full, /no todos los datos del jugador/);
assert.match(corrected.market.solutions[0].full, /identificador se registra en la misma transacción/);
assert.match(corrected.market.solutions[0].full, /mayoría \(2 de 3 datacenters\)/);
assert.match(corrected.payments.solutions[0].full, /consulta al proveedor de pagos para recuperar autorizaciones/);
assert.match(corrected.capacity.solutions[0].full, /Si no hay capacidad, conservan prioridad de ingreso/);
assert.match(corrected.directory.solutions[0].full, /se rechaza el ingreso y se actualiza la información/);
const dataSource = script.slice(script.indexOf('const groups='), script.indexOf("let activeView="));
const exportSource = script.slice(script.indexOf('function mermaidActive('), script.indexOf('function downloadFile('));
const stepsSource = script.match(/function currentSteps\(\)\{[^\n]+/)[0];
const exportContext = vm.createContext({ activeView: 'solutions', activeCase: 'capacity' });
vm.runInContext(dataSource + stepsSource + '\n' + exportSource, exportContext);
const flows = vm.runInContext('cases', exportContext);
assert.match(flows.find(item => item.id === 'timeout').steps.at(-1)[3], /victoria o derrota/);
assert.match(flows.find(item => item.id === 'entry').steps.map(step => step[2]).join(' '), /WAL 2\/3/);
assert.match(flows.find(item => item.id === 'payments').steps.at(-1)[3], /proveedor de pagos/);
assert.match(flows.find(item => item.id === 'market').faults[0][1], /mismo identificador/);
vm.runInContext("caseById.capacity.variant='s2'", exportContext);
assert.equal(exportContext.mermaidActive().filename, 'asteria_06_capacity_s2.mmd');
assert.equal(exportContext.mermaidActive().code.match(/->>/g).length, 5);
const pdf = vm.runInContext('originalPdfs.brief', exportContext);
assert.equal(Buffer.from(pdf, 'base64').subarray(0, 5).toString(), '%PDF-');

vm.runInContext(script.slice(script.indexOf('const graphRoutes='), script.indexOf('let zoom=')), exportContext);
const { mods, edgeDefs, graphRoutes } = vm.runInContext('({mods,edgeDefs,graphRoutes})', exportContext);
assert.deepEqual(Object.keys(graphRoutes).sort(), Array.from(edgeDefs, ([a, b]) => `${a}-${b}`).sort());
const onBorder = ([x, y], box) => x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h &&
  (x === box.x || x === box.x + box.w || y === box.y || y === box.y + box.h);
const segments = [];
for (const [a, b] of edgeDefs) {
  const points = graphRoutes[`${a}-${b}`];
  assert.ok(onBorder(points[0], mods[a]) && onBorder(points.at(-1), mods[b]), `${a}-${b}: wrong arrow endpoints`);
  assert.ok(exportContext.pathBetween(a, b).startsWith('M'));
  for (let i = 1; i < points.length; i++) {
    const [p, q] = [points[i - 1], points[i]];
    assert.ok(p[0] === q[0] || p[1] === q[1], `${a}-${b}: diagonal segment`);
    for (const box of Object.values(mods)) {
      const cutsCard = p[0] === q[0]
        ? p[0] > box.x && p[0] < box.x + box.w && Math.max(Math.min(p[1], q[1]), box.y) < Math.min(Math.max(p[1], q[1]), box.y + box.h)
        : p[1] > box.y && p[1] < box.y + box.h && Math.max(Math.min(p[0], q[0]), box.x) < Math.min(Math.max(p[0], q[0]), box.x + box.w);
      assert.ok(!cutsCard, `${a}-${b}: arrow cuts through a module`);
    }
    segments.push({ edge: `${a}-${b}`, p, q });
  }
}
const crossings = new Set();
for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) {
  const a = segments[i], b = segments[j];
  if (a.edge === b.edge) continue;
  const vertical = a.p[0] === a.q[0] ? a : b;
  const horizontal = vertical === a ? b : a;
  if (vertical.p[0] !== vertical.q[0] || horizontal.p[1] !== horizontal.q[1]) continue;
  const x = vertical.p[0], y = horizontal.p[1];
  if (x >= Math.min(horizontal.p[0], horizontal.q[0]) && x <= Math.max(horizontal.p[0], horizontal.q[0]) &&
      y >= Math.min(vertical.p[1], vertical.q[1]) && y <= Math.max(vertical.p[1], vertical.q[1])) crossings.add(`${x},${y}`);
}
assert.ok(crossings.size <= 6, `Architecture has ${crossings.size} arrow crossings; expected at most 6`);

const routeSource = script.slice(script.indexOf('function parseRoute('), script.indexOf('function restoreRoute('));
let written;
const context = vm.createContext({
  URLSearchParams,
  recordViews: ['cases', 'problems', 'failures', 'guarantees', 'solutions', 'tradeoffs'],
  viewNames: ['brief', 'cases', 'problems', 'failures', 'guarantees', 'solutions', 'tradeoffs', 'architecture', 'deployment'],
  routeReady: true, activeView: 'failures', activeRecord: 'market',
  selectedFailure: 2, selectedSolution: 0, activeCase: 'capacity', activeStep: 3,
  activeFault: 1, activeModule: 'payments', dcMode: 'partition',
  caseById: { capacity: { variant: 's2' } },
  el: () => ({ value: 'oro & ítems' }),
  location: { hash: '' },
  history: {
    replaceState: (_, __, hash) => { written = hash; },
    pushState: (_, __, hash) => { written = hash; },
  },
});
vm.runInContext(routeSource, context);
assert.equal(context.parseRoute('#unknown?case=market').view, 'brief');
assert.equal(context.parseRoute('#cases?case=capacity').view, 'cases');
assert.equal(context.parseRoute('#records?case=market').view, 'problems', 'Keep old case links working');
assert.equal(context.parseRoute('#flows?case=capacity&variant=s2').view, 'solutions', 'Old process links open Solution');
assert.equal(context.parseRoute('#flows?case=capacity&step=3').params.get('step'), '3');
context.writeRoute();
assert.equal(context.parseRoute(written).params.has('q'), false, 'Case routes no longer serialize search');
assert.equal(context.parseRoute(written).params.get('failure'), '2');
for (const view of context.recordViews) {
  context.activeView = view;
  context.writeRoute();
  assert.equal(context.parseRoute(written).view, view);
  assert.equal(context.parseRoute(written).params.get('case'), 'market');
}
const nav = markup.match(/<nav class="nav-main"[\s\S]*?<\/nav>/)[0];
assert.deepEqual([...nav.split('Diseño integrado')[0].matchAll(/data-view="([^"]+)"/g)].map(m => m[1]), ['brief']);
assert.deepEqual([...nav.split('Diseño integrado')[1].matchAll(/data-view="([^"]+)"/g)].map(m => m[1]), ['cases', 'problems', 'failures', 'guarantees', 'solutions', 'tradeoffs', 'architecture', 'deployment']);
const sections = ['recordProblem', 'recordFailures', 'recordGuarantees', 'caseSolutions', 'caseTradeoffs'].map(id => markup.indexOf(`id="${id}"`));
assert.ok(sections.every((position, i) => position >= 0 && (i === 0 || position > sections[i - 1])), 'Cases must follow document order');
const element = tagName => ({ tagName, children: [], textContent: '', append(...items) { this.children.push(...items); }, replaceChildren(...items) { this.children = items; } });
const aggregate = { caseSolutions: element('div'), caseTradeoffs: element('div') };
const aggregateContext = vm.createContext({ document: { createElement: element }, el: id => aggregate[id], selectedSolution: 1 });
vm.runInContext(script.slice(script.indexOf('function renderTradeoff('), script.indexOf('function renderRecordSolution(')), aggregateContext);
const content = node => [node.textContent, ...node.children.map(content)].join('\n');
for (const item of cases) {
  aggregateContext.renderCaseOverview(item);
  assert.equal(aggregate.caseSolutions.children.length, item.solutions.length);
  assert.equal(aggregate.caseTradeoffs.children.length, item.solutions.length);
  item.solutions.forEach((solution, index) => {
    const article = aggregate.caseSolutions.children[index];
    assert.equal(article.children[0].textContent, solution.id);
    assert.equal(article.children.slice(1).map(node => node.textContent).join('\n\n'), solution.full, 'Full solution text must remain unchanged');
    assert.ok(content(aggregate.caseTradeoffs.children[index]).includes(solution.tradeoff.cost));
  });
}
assert.equal(aggregateContext.selectedSolution, 1, 'Reading all solutions must not change the selected variant');
context.activeView = 'solutions';
context.activeRecord = 'capacity';
context.selectedFailure = 0;
context.selectedSolution = 1;
context.el = () => ({ value: '' });
context.writeRoute();
assert.equal(written, '#solutions?case=capacity&solution=1&step=3');
context.activeView = 'architecture';
context.writeRoute(true);
assert.equal(written, '#architecture?module=payments');
context.activeView = 'deployment';
context.writeRoute();
assert.equal(written, '#deployment?mode=partition');
context.routeReady = false;
context.activeView = 'brief';
context.writeRoute();
assert.equal(written, '#deployment?mode=partition', 'Restoring a URL must not overwrite it');

if (process.argv.includes('--fixtures')) {
  const dir = new URL('.qa/', root);
  mkdirSync(dir, { recursive: true });
  for (const [name, css] of Object.entries({
    light: html.replaceAll('@media(prefers-color-scheme:dark)', '@media not all'),
    print: html.replaceAll('@media(prefers-color-scheme:dark)', '@media not all').replaceAll('@media print', '@media all'),
    reduced: html.replaceAll('@media(prefers-reduced-motion:reduce)', '@media all'),
  })) writeFileSync(new URL(`${name}.html`, dir), css);
  console.log(`Media fixtures: ${fileURLToPath(dir)}`);
}
console.log('PASS: script syntax, unique IDs, source counts, architecture routing (21 connections, no card intersections), Mermaid/PDF payloads, and URL state.');
