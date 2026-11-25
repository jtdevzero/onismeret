const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const original = fs.readFileSync(path.join(root, '../index.html'), 'utf8');
assert.match(html, /biasmap-hu\/teszt\//);
assert.doesNotMatch(original, /const BATCH_01/);
const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(inline.length, 3);
for (const [,script] of inline) new vm.Script(script);
for (const src of [...html.matchAll(/(?:href|src)="(\.\.\/[^"#?]+)"/g)]) {
  assert.ok(fs.existsSync(path.resolve(root, src[1])), `missing resource ${src[1]}`);
}
for (const font of [...html.matchAll(/url\((\.\.\/fonts\/[^)]+)\)/g)]) {
  assert.ok(fs.existsSync(path.resolve(root, font[1])), `missing font ${font[1]}`);
}
const files = [...html.matchAll(/"(\.\.\/scenes\/[^"?]+)[^\"]*"/g)].map(x => x[1]);
assert.equal(files.length,54, 'original scene mappings');
for (const file of files) assert.ok(fs.existsSync(path.resolve(root,file)),`missing scene ${file}`);
const scene = fs.readFileSync(path.join(root,'scenes/batch-01.js'),'utf8');
new vm.Script(scene);
const sandbox = {window:{BiasAnim:{SCENES:{}}}};
vm.runInNewContext(scene,sandbox);
assert.equal(Object.keys(sandbox.window.BiasAnim.SCENES).length,20);
assert.equal((html.match(/"scenes\/batch-01\.js/g)||[]).length,1);
const dataAt = html.indexOf('const DATA = ') + 'const DATA = '.length;
assert.ok(dataAt > 13, 'missing concept data');
const data = JSON.parse(html.slice(dataAt,html.indexOf('];',dataAt)+1));
const entries = data.flatMap(quad => quad.flatMap(group => group.biases));
assert.equal(new Set(entries.map(x => x.en || x.n)).size,188);
// The two handwritten maps contain 26 and 20 keys; all other unique concepts
// must be instantiated by the shared preview-only scene loader.
const mapped = [...html.slice(html.indexOf('const ANIM_FOR ='),html.indexOf('Object.assign(ANIM_FOR, BATCH_01)')).matchAll(/"([^"]+)"\s*:\s*"([\w-]+)"/g)];
assert.equal(mapped.length,46);
const missing = [...new Map(entries.map(b=>[b.en||b.n,b])).values()]
  .filter(b=>!mapped.some(x=>x[1]===(b.en||b.n)));
assert.equal(missing.length,142);
const generated = {};
const extra = fs.readFileSync(path.join(root,'scenes/remaining.js'),'utf8');
new vm.Script(extra);
vm.runInNewContext(extra, {window:{BiasMapRemaining:Object.fromEntries(
  missing.map((b,i)=>[`remaining-${String(i+1).padStart(3,'0')}`,
    {name:b.n,example:b.ex,explanation:b.d,warning:b.spot,action:b.fix,quadrant:'tmi',family:'primed'}])),
  BiasAnim:{SCENES:generated}}});
assert.equal(Object.keys(generated).length,142);
for(const [key,entry] of Object.entries(generated)) {
  assert.equal(entry.beats.length,4,key);
  assert.equal(entry.text.hu.caps.length,4,key);
  assert.equal(entry.text.hu.say.length,4,key);
  for(const phrase of entry.text.hu.say) assert.ok(phrase && phrase.length<=143,`${key}: caption overflow`);
  assert.match(entry.svg(),/<g data-k="first">/);
  const parts = Object.fromEntries(['first','bridge','second','insight','labels'].map(k=>
    [k,{style:{},setAttribute(name,value){assert.equal(name,'transform');assert.ok(!String(value).includes('NaN'));}}]));
  entry.render({first:1,bridge:1,second:1,insight:1,labels:1,zoom:1},part=>parts[part]);
  assert.equal(parts.first.style.opacity,'1');
  assert.equal(parts.insight.style.opacity,'1');
}
assert.equal((html.match(/"scenes\/remaining\.js/g)||[]).length,1);
console.log('PASS: 188 egyedi fogalom, 188 torzításanimáció (26 + 20 + 142), 54 alapjelenet és minden fájl szintaxisa.');
