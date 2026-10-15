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
const dataSource = script.slice(script.indexOf('const groups='), script.indexOf("let activeView="));
const exportSource = script.slice(script.indexOf('function mermaidActive('), script.indexOf('function downloadFile('));
const stepsSource = script.match(/function currentSteps\(\)\{[^\n]+/)[0];
const exportContext = vm.createContext({ activeView: 'solutions', activeCase: 'capacity' });
vm.runInContext(dataSource + stepsSource + '\n' + exportSource, exportContext);
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
  recordViews: ['problems', 'failures', 'guarantees', 'solutions', 'tradeoffs'],
  viewNames: ['brief', 'problems', 'failures', 'guarantees', 'solutions', 'tradeoffs', 'architecture', 'deployment'],
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
assert.equal(context.parseRoute('#records?case=market').view, 'problems', 'Keep old case links working');
assert.equal(context.parseRoute('#flows?case=capacity&variant=s2').view, 'solutions', 'Old process links open Solution');
assert.equal(context.parseRoute('#flows?case=capacity&step=3').params.get('step'), '3');
context.writeRoute();
assert.equal(context.parseRoute(written).params.get('q'), 'oro & ítems');
assert.equal(context.parseRoute(written).params.get('failure'), '2');
for (const view of context.recordViews) {
  context.activeView = view;
  context.writeRoute();
  assert.equal(context.parseRoute(written).view, view);
  assert.equal(context.parseRoute(written).params.get('case'), 'market');
}
const nav = markup.match(/<nav class="nav-main"[\s\S]*?<\/nav>/)[0];
assert.deepEqual([...nav.split('Diseño integrado')[0].matchAll(/data-view="([^"]+)"/g)].map(m => m[1]), ['brief']);
assert.deepEqual([...nav.split('Diseño integrado')[1].matchAll(/data-view="([^"]+)"/g)].map(m => m[1]), ['problems', 'failures', 'guarantees', 'solutions', 'tradeoffs', 'architecture', 'deployment']);
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
