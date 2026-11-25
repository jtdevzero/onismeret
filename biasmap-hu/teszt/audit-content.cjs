/* Read-only editorial/structural audit of all 137 six-step C-style stories. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const start = html.indexOf('const DATA = ') + 'const DATA = '.length;
const all = JSON.parse(html.slice(start, html.indexOf('];', start) + 1))
  .flatMap(quad => quad.flatMap(group => group.biases));
const mapped = [...html.slice(html.indexOf('const ANIM_FOR ='), html.indexOf('Object.assign(ANIM_FOR, BATCH_01)'))
  .matchAll(/"([^"]+)"\s*:\s*"([\w-]+)"/g)];
const original = new Set(mapped.map(m => m[1]));
const missing = [...new Map(all.map(b => [b.en || b.n, b])).values()]
  .filter(b => !original.has(b.en || b.n));
const records = Object.fromEntries(missing.map((b, i) => [
  `remaining-${String(i + 1).padStart(3, '0')}`,
  { name: b.n, example: b.ex, explanation: b.d, warning: b.spot, action: b.fix,
    quadrant: 'tmi', family: 'audit' }
]));
const premium = {
  'Distinction bias': 'remaining-002',
  'False consensus effect': 'remaining-025',
  'Hot-hand fallacy': 'remaining-074',
  'Illusion of control': 'remaining-082',
  'False memory': 'remaining-117'
};
const state = { window: { BiasMapRemaining: records, BiasMapPremium: premium,
  BiasAnim: { SCENES: {} } } };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'scenes/crafted-135.js'), 'utf8'), state);
vm.runInNewContext(fs.readFileSync(path.join(dir, 'scenes/storyboards-137.js'), 'utf8'), state);
const scenes = state.window.BiasAnim.SCENES;
const failures = [];
const warnings = [];
const drawings = new Map();
const keys = Object.keys(records).filter(k => !Object.values(premium).includes(k));
for (const key of keys) {
  const scene = scenes[key], data = records[key];
  if (!scene) { failures.push(`${key}: hiányzó jelenet`); continue; }
  if (scene.beats?.length !== 6 || scene.text?.hu?.caps?.length !== 6)
    failures.push(`${key}: nem hatlépéses történet`);
  const svg = scene.svg();
  if ((svg.match(/data-k=/g) || []).length !== 6)
    failures.push(`${key}: hibás SVG-jelenetszerkezet`);
  if ((svg.match(/class="craft-icon"/g) || []).length < 4)
    failures.push(`${key}: hiányos szemantikus illusztráció`);
  if (drawings.has(svg)) failures.push(`${key}: azonos rajz ${drawings.get(svg)} jelenettel`);
  drawings.set(svg, key);
  for (const [index, field] of ['example', 'warning', 'explanation', 'name', 'action'].entries()) {
    if (!data[field]?.trim()) failures.push(`${key}: üres ${field} mező`);
  }
  const caps = scene.text?.hu?.caps || [];
  if (caps[3]?.includes('észrevétlenül befolyásolhatja az ítéletünket'))
    failures.push(`${key}: sablonos csapdaleírás maradt`);
  caps.forEach((cap, i) => {
    const plain = cap.replace(/<[^>]*>/g, '');
    if (!plain.trim()) failures.push(`${key}: üres ${i + 1}. felirat`);
    if (plain.length > 175) warnings.push(`${key}: hosszú ${i + 1}. felirat (${plain.length})`);
  });
}
assert.equal(keys.length, 137);
console.log(JSON.stringify({
  concepts: all.length, reviewed: keys.length, uniqueDrawings: drawings.size,
  failures, warnings: warnings.length,
  genericTrapCaptions: warnings.filter(w => w.includes('sablonos')).length,
  longCaptions: warnings.filter(w => w.includes('hosszú')).length,
  unreviewedHumanAspects: ['fogalmi pontosság', 'vizuális olvashatóság',
    'mozgás természetessége', 'tudományos források megbízhatósága']
}, null, 2));
if (failures.length) process.exitCode = 1;
