const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 3, 'inline scripts');
for (const [, source] of scripts) new vm.Script(source);

const sceneFiles = fs.readdirSync(path.join(root, 'scenes')).filter(f => f.endsWith('.js'));
for (const file of sceneFiles) new vm.Script(fs.readFileSync(path.join(root, 'scenes', file), 'utf8'));

const match = html.match(/const DATA = ([\s\S]*?);\s*const QUADS = /);
assert.ok(match, 'bias dataset found');
const data = JSON.parse(match[1]);
const biases = data.flatMap(quadrant => quadrant.flatMap(group => group.biases));
assert.equal(new Set(biases.map(b => b.en || b.n)).size, 188, '188 unique concepts');
assert.equal(biases.length, 189, '189 family placements (one repeated)');

const mapping = html.match(/const ANIM_FOR = \{([\s\S]*?)\};/);
assert.ok(mapping, 'animation mapping');
const biasAnimations = [...mapping[1].matchAll(/"[^"]+": "([^"]+)"/g)].map(x => x[1]);
assert.equal(new Set(biasAnimations).size, 26, '26 bias animations');
for (const slug of biasAnimations) assert.ok(sceneFiles.includes(slug + '.js'), `scene missing: ${slug}`);

assert.match(html, /<html lang="hu"/);
assert.match(html, /rel="canonical" href="https:\/\/jtdevzero\.github\.io\/onismeret\/biasmap-hu\/"/);
assert.doesNotMatch(html, /href="https:\/\/thebiasmap\.com\/(?:list|habits|watch)\//);
assert.doesNotMatch(html, /sfxBase: HOME/);
assert.match(html, /page: "#" \+ slug/);
assert.match(html, /A mindennapokban/);
assert.match(html, /Miért csinálja ezt az agyad/);

console.log(`PASS: 188 concepts, ${biases.length} family placements, ${biasAnimations.length} bias animations, ${sceneFiles.length} valid scene files, ${scripts.length} valid inline scripts.`);

// Extra acceptance checks for the separate 20-animation pilot, if present.
const pilotPath = path.join(root, 'scenes/batch-01.js');
if (fs.existsSync(pilotPath)) {
  const sandbox = {window: {BiasAnim: {SCENES: {}}}};
  vm.runInNewContext(fs.readFileSync(pilotPath, 'utf8'), sandbox);
  const scenes = Object.entries(sandbox.window.BiasAnim.SCENES);
  assert.equal(scenes.length, 20, 'pilot must contain exactly 20 scenes');
  const pilotMapping = html.match(/const BATCH_01 = \{([\s\S]*?)\};/);
  assert.ok(pilotMapping, 'pilot mapped in catalog');
  const mapped = [...pilotMapping[1].matchAll(/"([^"]+)":"([^"]+)"/g)];
  assert.equal(mapped.length, 20, 'all pilot mappings present');
  const knownConcepts = new Set(biases.map(b => b.en || b.n));
  for (const [,english,key] of mapped) {
    assert.ok(knownConcepts.has(english), `unknown concept: ${english}`);
    assert.ok(sandbox.window.BiasAnim.SCENES[key], `scene not registered: ${key}`);
  }
  for (const [key,scene] of scenes) {
    assert.ok(scene.text.hu.name && scene.text.hu.ecline, `Hungarian labels: ${key}`);
    assert.equal(scene.beats.length, scene.text.hu.caps.length, `caption/beat count: ${key}`);
    assert.equal(scene.beats.length, scene.text.hu.say.length, `narration/beat count: ${key}`);
    const svg = scene.svg(scene.text.hu);
    for (const anchor of ['picture','left','right','check']) assert.ok(svg.includes(`data-k="${anchor}"`), `${key}: ${anchor}`);
    const nodes = new Map();
    const getNode = name => {
      if (!nodes.has(name)) nodes.set(name, {style:{},setAttribute(k,v){this[k]=v}});
      return nodes.get(name);
    };
    scene.render({...scene.S0,picture:1,left:1,right:1,check:1,scale:1},getNode,scene.text.hu);
    assert.equal(nodes.get('picture').style.opacity,1, `final visual: ${key}`);
  }
  console.log('PASS: all 20 pilot scenes registered, mapped to existing concepts, rendered and timed with Hungarian captions.');
}
