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
console.log('PASS: tesztútvonal, 54 meglévő jelenet, 20 új animáció, betűtípusok és HTML szintaxis.');
