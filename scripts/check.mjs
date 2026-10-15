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
const dataSource = script.slice(script.indexOf('const groups='), script.indexOf("let activeView="));
const exportSource = script.slice(script.indexOf('function mermaidActive('), script.indexOf('function downloadFile('));
const stepsSource = script.match(/function currentSteps\(\)\{[^\n]+/)[0];
const exportContext = vm.createContext({ activeView: 'flows', activeCase: 'capacity' });
vm.runInContext(dataSource + stepsSource + '\n' + exportSource, exportContext);
vm.runInContext("caseById.capacity.variant='s2'", exportContext);
assert.equal(exportContext.mermaidActive().filename, 'asteria_06_capacity_s2.mmd');
assert.equal(exportContext.mermaidActive().code.match(/->>/g).length, 5);
const pdf = vm.runInContext('originalPdfs.brief', exportContext);
assert.equal(Buffer.from(pdf, 'base64').subarray(0, 5).toString(), '%PDF-');

const routeSource = script.slice(script.indexOf('function parseRoute('), script.indexOf('function restoreRoute('));
let written;
const context = vm.createContext({
  URLSearchParams,
  recordViews: ['problems', 'failures', 'solutions'],
  viewNames: ['brief', 'problems', 'failures', 'solutions', 'architecture', 'flows', 'deployment', 'guarantees'],
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
assert.equal(context.parseRoute('#flows?case=capacity&step=3').params.get('step'), '3');
context.writeRoute();
assert.equal(context.parseRoute(written).params.get('q'), 'oro & ítems');
assert.equal(context.parseRoute(written).params.get('failure'), '2');
for (const view of ['problems', 'failures', 'solutions']) {
  context.activeView = view;
  context.writeRoute();
  assert.equal(context.parseRoute(written).view, view);
  assert.equal(context.parseRoute(written).params.get('case'), 'market');
}
const nav = markup.match(/<nav class="nav-main"[\s\S]*?<\/nav>/)[0];
assert.deepEqual([...nav.split('Diseño integrado')[0].matchAll(/data-view="([^"]+)"/g)].map(m => m[1]), ['brief']);
assert.deepEqual([...nav.split('Diseño integrado')[1].matchAll(/data-view="([^"]+)"/g)].map(m => m[1]).slice(0, 3), ['problems', 'failures', 'solutions']);
context.activeView = 'flows';
context.writeRoute();
assert.equal(written, '#flows?case=capacity&step=3&fault=1&variant=s2');
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
console.log('PASS: script syntax, unique IDs, 7 cases / 22 failures / 8 solutions, Mermaid/PDF payloads, and URL state.');
