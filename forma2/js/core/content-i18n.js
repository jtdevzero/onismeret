/* Tartalom fordítása (tiszta függvény): a magyar adatfájlokra azonosító szerint ráteszi az angol szövegeket.
   Csak szöveges mezőket ír felül (név, leírás, pontok, mértékegység, választási címkék); számot, azonosítót,
   adagolást, normát és szerkezetet nem érint. Hiányzó fordításnál a magyar marad. */
const put = (obj, key, v) => { if (obj && typeof v === 'string' && v) obj[key] = v; };
const labels = (pairs, texts) => (Array.isArray(pairs) && Array.isArray(texts) ? pairs.map((p, i) => (Array.isArray(p) && typeof texts[i] === 'string' ? [p[0], texts[i]] : p)) : pairs);

/* ábrafeliratok (label, note) a magyar szöveg kulcsa szerint */
function captions(o, map) {
  if (Array.isArray(o)) { for (const x of o) captions(x, map); return; }
  if (!o || typeof o !== 'object') return;
  for (const [k, v] of Object.entries(o)) {
    if ((k === 'label' || k === 'note') && typeof v === 'string') { if (map[v]) o[k] = map[v]; }
    else if (v && typeof v === 'object') captions(v, map);
  }
}

export function applyContent({ exercises, tests, routines, figures }, c) {
  if (!c) return;
  if (figures && c.captions) captions(figures, c.captions);
  if (exercises) {
    if (c.typeNames) exercises.typeNames = { ...exercises.typeNames, ...c.typeNames };
    if (c.ladders) exercises.ladders = { ...exercises.ladders, ...c.ladders };
    for (const e of exercises.exercises || []) {
      const t = c.exercises && c.exercises[e.id];
      if (!t) continue;
      put(e, 'name', t.name); put(e, 'how', t.how); put(e, 'query', t.name);
      if (Array.isArray(t.points) && Array.isArray(e.points) && t.points.length === e.points.length) e.points = [...t.points];
    }
  }
  if (tests) {
    for (const a of tests.areas || []) { const t = c.areas && c.areas[a.id]; if (t) { put(a, 'name', t.name); put(a, 'short', t.short); put(a, 'about', t.about); } }
    for (const x of tests.tests || []) {
      const t = c.tests && c.tests[x.id];
      if (!t) continue;
      put(x, 'name', t.name); put(x, 'how', t.how); put(x, 'safety', t.safety);
      if (x.input) { put(x.input, 'unit', t.unit); if (t.options) x.input.options = labels(x.input.options, t.options); }
    }
    if (tests.vitals && c.vitals) {
      put(tests.vitals, 'how', c.vitals.how);
      for (const k of ['frequency', 'intensity', 'duration']) if (c.vitals[k]) tests.vitals[k] = labels(tests.vitals[k], c.vitals[k]);
    }
  }
  for (const r of routines || []) { const t = c.routines && c.routines[r.id]; if (t) { put(r, 'name', t.name); put(r, 'about', t.about); } }
}

export function applyBlocks(blocks, c) {
  for (const b of (blocks && blocks.blocks) || []) { const t = c && c.blocks && c.blocks[b.id]; if (t) { put(b, 'name', t.name); put(b, 'about', t.about); } }
  return blocks;
}
