#!/usr/bin/env node
/* Önismereti térképek — válaszséma generálása.
 * Minden tesztoldalt betölt, minden kérdésnél végigkattintja az összes választ, és rögzíti,
 * milyen kérdésazonosítók és milyen tárolt értékek létezhetnek. Ebből készül az assets/oni-schema.js,
 * amit a visszaállítás ellenőrzése és a válaszstílus-diagram használ.
 * Futtatás a repó gyökeréből, ha egy teszt kérdései vagy válaszskálája változik:  node tools/schema.js
 */
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require(require('path').join(process.env.HOME || '', '.npm-global/lib/node_modules/playwright'))); }
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const R = 'file://' + ROOT + '/';
const PAGES = ['terkepek', 'szemelyiseg', 'nyelvek', 'sis-ses', 'maia2', 'attitudok', 'funkcio', 'kapcsolat', 'cselekves', 'szabalyozas'];

/* egymást követő, azonos értékkészletű kérdések összevonása: [['1-20',[1,2,3,4,5]], ...] */
function compact(items) {
  const keys = Object.keys(items).sort((a, b) => {
    const pa = a.match(/^(.*?)(\d+)$/), pb = b.match(/^(.*?)(\d+)$/);
    return pa[1] === pb[1] ? pa[2] - pb[2] : pa[1] < pb[1] ? -1 : 1;
  });
  const out = [];
  keys.forEach(k => {
    const [, pre, num] = k.match(/^(.*?)(\d+)$/), vs = JSON.stringify(items[k]), last = out[out.length - 1];
    if (last && last.pre === pre && last.vs === vs && last.to === +num - 1) last.to = +num;
    else out.push({ pre, from: +num, to: +num, vs });
  });
  return out.map(g => [g.pre + g.from + (g.to > g.from ? '-' + g.to : ''), JSON.parse(g.vs)]);
}

(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const S = {};
  for (const f of PAGES) {
    const ctx = await browser.newContext(); const p = await ctx.newPage(); p.on('dialog', d => d.accept());
    await p.goto(R + f + '.html'); await p.waitForTimeout(200);
    const res = await p.evaluate(async () => {
      const inv = {}; Object.entries(ONI.IDKEY).forEach(([id, k]) => inv[k] = id);
      const groups = [];
      [...document.querySelectorAll('.q, .fc')].filter(u => !u.parentElement.closest('.q, .fc') && u.querySelector('button[data-n]')).forEach(u => {
        const by = {}; u.querySelectorAll('button[data-n]').forEach(x => { (by[x.dataset.n] = by[x.dataset.n] || []).push(x); });
        Object.values(by).forEach(bs => groups.push(bs));
      });
      const vals = {}, max = Math.max(...groups.map(g => g.length));
      for (let i = 0; i < max; i++) {
        groups.forEach(bs => bs[Math.min(i, bs.length - 1)].click());
        await new Promise(r => setTimeout(r, 40));
        Object.keys(inv).forEach(k => {
          const raw = localStorage.getItem(k); if (!raw) return;
          Object.entries(JSON.parse(raw)).forEach(([n, v]) => { ((vals[k] = vals[k] || {})[n] = vals[k][n] || new Set()).add(v); });
        });
      }
      const out = {};
      Object.entries(vals).forEach(([k, o]) => { out[inv[k]] = { k, items: Object.fromEntries(Object.entries(o).map(([n, s]) => [n, [...s].sort((a, b) => (a > b ? 1 : -1))])) }; });
      return out;
    });
    Object.entries(res).forEach(([id, v]) => { S[id] = { k: v.k, g: compact(v.items) }; console.log(f, id, Object.keys(v.items).length, 'kérdés'); });
    await ctx.close();
  }
  /* A két különálló oldal saját felépítésű: a kérdéslistát a forrásukból olvassuk. */
  {
    const p = await (await browser.newContext()).newPage(); p.on('dialog', d => d.dismiss());
    await p.goto(R + 'kotodes-melyterkep.html'); await p.waitForTimeout(200);
    const secs = await p.evaluate(() => SECTIONS.map(s => [s.id, s.items.length]));
    S.kotodes = { k: 'attachment_assessment_v1', c: 'draft', g: secs.map(([id, n]) => [id + '_0-' + (n - 1), [1, 2, 3, 4, 5, 6, 7]]) };
    await p.goto(R + 'ysq.html'); await p.waitForTimeout(300);
    const n = await p.evaluate(() => SCHEMAS.reduce((a, s) => Math.max(a, s.start + s.items.length - 1), 0));
    S.ysq = { k: 'ysq_autosave', c: 'answers', g: [['1-' + n, [1, 2, 3, 4, 5, 6]]] };
    console.log('kotodes', secs.reduce((a, s) => a + s[1], 0), 'kérdés; ysq', n, 'kérdés');
  }
  await browser.close();
  const order = Object.keys(ONI_ORDER()).filter(id => S[id]);
  const body = order.map(id => '  ' + id + ':' + JSON.stringify(S[id])).join(',\n');
  fs.writeFileSync(path.join(ROOT, 'assets/oni-schema.js'),
`/* Önismereti térképek — válaszséma. GENERÁLT FÁJL: node tools/schema.js
   k = tárolási kulcs, c = a válaszokat tartalmazó mező (ha nem a teljes objektum), g = [kérdésazonosítók, megengedett értékek]. */
window.ONI_SCHEMA={
${body}
};
${fs.readFileSync(path.join(__dirname, 'schema-runtime.js'), 'utf8')}`);
  console.log('assets/oni-schema.js kész,', order.length, 'teszt');

  function ONI_ORDER() {
    const src = fs.readFileSync(path.join(ROOT, 'assets/oni-core.js'), 'utf8');
    return eval('(' + src.match(/var IDKEY=(\{[^}]*\})/)[1] + ')');
  }
})();
