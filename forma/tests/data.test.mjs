/* A tartalom és a build ellenőrzése: séma, hivatkozások, ábrák, generált fájlok. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { figurePoints } from '../js/core/figure.js';

const root = new URL('../', import.meta.url);
const json = f => JSON.parse(readFileSync(new URL('data/' + f, root), 'utf8'));
const tests = json('tests.json'), ex = json('exercises.json'), figs = json('figures.json').figures, norms = json('norms.json');

test('tesztek: egyedi azonosító, ismert terület, érvényes bevitel és pontozás', () => {
  const areas = new Set(tests.areas.map(a => a.id)), ids = new Set();
  for (const t of tests.tests) {
    assert.ok(!ids.has(t.id), 'ismétlődő: ' + t.id); ids.add(t.id);
    assert.ok(areas.has(t.area), t.id);
    assert.ok(['norm', 'criterion', 'baseline'].includes(t.kind), t.id);
    assert.ok(t.name && t.how && t.how.length > 60, t.id);
    if (t.input.type === 'choice') {
      assert.ok(t.input.options.length >= 2, t.id);
      if (t.kind === 'criterion') for (const [v] of t.input.options) assert.ok(t.map[String(v)] != null, `${t.id} ${v}`);
    } else {
      assert.equal(t.input.type, 'number', t.id);
      assert.ok(t.input.min < t.input.max && t.input.unit, t.id);
    }
    if (t.kind === 'criterion' && t.input.type === 'number') assert.ok(Array.isArray(t.map) && t.map.length >= 2, t.id);
    if (t.timer) assert.ok(['countdown', 'stopwatch', 'counter', 'step', 'reaction', 'sway'].includes(t.timer.mode), t.id);
  }
  /* minden területhez legalább egy pontozható teszt */
  for (const a of tests.areas) assert.ok(tests.tests.some(t => t.area === a.id && t.kind !== 'baseline'), a.id);
  /* átnézettnek csak dátummal jelölhető, és mindhárom adatfájl együtt */
  for (const d of [norms, tests, ex]) if (d.reviewed) assert.match(d.reviewDate || '', /^\d{4}-\d{2}-\d{2}$/, 'átnézés dátuma');
  assert.equal(new Set([norms.reviewed, tests.reviewed, ex.reviewed]).size, 1, 'a három adatfájl átnézési jelzése egyezik');
});

test('gyakorlatok: egyedi azonosító, adagolás, leírás, ismert típus és gyakorlatsor, létező ábra', () => {
  const ids = new Set();
  for (const e of ex.exercises) {
    assert.ok(!ids.has(e.id), 'ismétlődő: ' + e.id); ids.add(e.id);
    assert.ok(ex.typeNames[e.type], e.id);
    if (e.ladder) assert.ok(ex.ladders[e.ladder] && Number.isInteger(e.level), e.id);
    const range = e.dose.reps || e.dose.seconds;
    assert.ok(Array.isArray(range) && range.length === 2 && range[0] > 0 && range[0] <= range[1], e.id);
    assert.ok(e.how.length > 50 && e.points.length === 3, e.id);
    if (e.figure) assert.ok(figs[e.figure], 'hiányzó ábra: ' + e.figure);
    if (e.type === 'mobility') assert.ok(Array.isArray(e.target) && e.target.length, e.id);
  }
  /* a tesztek célterületeihez van mobilitási gyakorlat */
  for (const t of tests.tests.filter(t => t.target)) assert.ok(ex.exercises.some(e => (e.target || []).includes(t.target)), t.target);
  assert.ok(ex.exercises.some(e => e.id === 'warmup'));
});

test('ábrák: minden képkocka kiszámolható, véges koordinátákkal', () => {
  for (const [k, f] of Object.entries(figs)) for (const fr of f.frames) {
    const p = figurePoints(fr.pose);
    assert.ok(fr.label && Object.values(p.box).every(Number.isFinite), k);
  }
});

test('build: a generált index.html és sw.js egyezik a forrással, szigorú CSP, minden előtöltött fájl létezik', () => {
  const before = [readFileSync(new URL('index.html', root), 'utf8'), readFileSync(new URL('sw.js', root), 'utf8')];
  execFileSync('python3', [new URL('build.py', root).pathname]);
  const after = [readFileSync(new URL('index.html', root), 'utf8'), readFileSync(new URL('sw.js', root), 'utf8')];
  assert.deepEqual(after, before, 'futtasd: python3 forma/build.py');
  assert.match(after[0], /Content-Security-Policy" content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval';/);
  assert.doesNotMatch(after[0], /'unsafe-inline'|'unsafe-eval'/);
  assert.match(after[1], /const VENDOR = 'forma-vendor-[0-9a-f]{10}'/);
  const list = JSON.parse(after[1].match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);
  for (const f of list) if (f !== './') assert.ok(existsSync(new URL(f, root)), 'hiányzik: ' + f);
  /* offline teljesség: minden saját modul és adatfájl előtöltődik (egy új modul nem maradhat ki a gyorsítótárból) */
  for (const dir of ['js/core', 'js/ui', 'data']) for (const f of readdirSync(new URL(dir + '/', root))) {
    if (/\.(js|json)$/.test(f)) assert.ok(list.includes(dir + '/' + f), 'nincs az offline csomagban: ' + dir + '/' + f);
  }
});

test('biztonság: a felület nem ír HTML-t szövegből', () => {
  /* minden UI- és core-modul (az új képernyők is) */
  for (const f of [...readdirSync(new URL('js/ui/', root)).map(x => 'js/ui/' + x), ...readdirSync(new URL('js/core/', root)).map(x => 'js/core/' + x)].filter(x => x.endsWith('.js'))) {
    const src = readFileSync(new URL(f, root), 'utf8');
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, f);
  }
});

test('pózbecslő: a vendorolt fájlok megegyeznek a Kanyaréval (egy forrás, két másolat)', () => {
  for (const f of ['vision_bundle.mjs', 'pose_landmarker_lite.task', 'wasm/vision_wasm_internal.wasm', 'wasm/vision_wasm_internal.js']) {
    const a = readFileSync(new URL('vendor/mediapipe/' + f, root)), b = readFileSync(new URL('../kanyar/vendor/mediapipe/' + f, root));
    assert.ok(a.equals(b), f);
  }
});

test('szakmai átnézés csomag: generált, minden normát, tesztet és gyakorlatot tartalmaz, szkript nélkül', () => {
  const doc = readFileSync(new URL('docs/szakmai-atnezes.html', root), 'utf8');
  assert.doesNotMatch(doc, /<script/i);
  for (const t of tests.tests) assert.ok(doc.includes(t.name.replace(/&/g, '&amp;')), t.id);
  for (const e of ex.exercises) assert.ok(doc.includes(e.name.replace(/&/g, '&amp;')), e.id);
  for (const k of Object.keys(norms.tests)) assert.ok(doc.includes(`<h3>${k} `), k);
});

test('gyorsítás: minden modul előre jelezve (a pózbecslőt kivéve, az csak kameránál töltődik)', () => {
  const html = readFileSync(new URL('index.html', root), 'utf8');
  assert.ok((html.match(/rel="modulepreload"/g) || []).length >= 30);
  assert.doesNotMatch(html, /modulepreload" href="js\/ui\/pose\.js"/);
  /* a nagy, később megnyitott képernyők nem töltődnek az első képernyő előtt (az offline csomagban viszont benne vannak) */
  for (const m of ['views-assess', 'views-train', 'views-progress', 'live', 'views-run', 'views-library', 'views-posture']) assert.doesNotMatch(html, new RegExp(`modulepreload" href="js/ui/${m}\\.js"`), m);
  const sw = readFileSync(new URL('sw.js', root), 'utf8');
  for (const m of ['views-assess', 'views-train', 'views-progress', 'live']) assert.ok(sw.includes(`"js/ui/${m}.js"`), m + ' az offline csomagban');
});

test('fejlécképek: minden CSS-ben hivatkozott kép létezik, 150 kB alatti, és a service worker futás közben gyorsítótárazza', () => {
  const css = readFileSync(new URL('styles.css', root), 'utf8');
  const refs = [...new Set([...css.matchAll(/url\((assets\/art\/[a-z0-9-]+\.webp)\)/g)].map(m => m[1]))];
  assert.ok(refs.length >= 8);
  for (const r of refs) { assert.ok(existsSync(new URL(r, root)), r); assert.ok(readFileSync(new URL(r, root)).length < 150 * 1024, r + ' túl nagy'); }
  const sw = readFileSync(new URL('sw.js', root), 'utf8');
  assert.match(sw, /const ART = 'forma-art-[0-9a-f]{10}'/);
  assert.match(sw, /\/assets\/art\//);
  for (const f of readdirSync(new URL('assets/art/', root))) assert.ok(refs.includes('assets/art/' + f), 'nem használt kép: ' + f);
});
