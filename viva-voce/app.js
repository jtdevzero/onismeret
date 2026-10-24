/* Viva Voce — app logika. Nincs build lépés, nincs függőség. */
'use strict';

const STORE_KEY = 'vivavoce.v1';
const PACK_URL = 'data/it.json';
const { review: fsrsReview, retrievability, dayIndex, DAY } = window.FSRS;

const $ = (sel, root = document) => root.querySelector(sel);
const app = $('#app');

/* ---------- Állapot ---------- */
const DEFAULT_SETTINGS = { newPerDay: 8, targetR: 0.9, rate: 0.9, speak: true, autoplay: true, reviewLimit: 150 };
let state = loadState();
let PACK = null;
let ITEMS = {};      // id -> item (+ unit)
let ORDER = [];      // tananyag-sorrend
let session = null;

function loadState() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { s = {}; }
  return {
    cards: s.cards || {},
    log: s.log || [],
    days: s.days || {},
    focus: s.focus || null,
    settings: Object.assign({}, DEFAULT_SETTINGS, s.settings || {})
  };
}
function saveState() {
  if (state.log.length > 20000) state.log = state.log.slice(-20000);
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* tele a tárhely vagy privát mód */ }
}

/* ---------- Segédek ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const today = () => dayIndex();

function norm(s) {
  return String(s).normalize('NFC').toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?¿¡;:«»"“”()…\-–—]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
const ARTICLE_RE = /^(il|lo|la|i|gli|le|un|uno|una) |^(l'|un')/;
const stripArticle = s => s.replace(ARTICLE_RE, '');

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const similarity = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);

/* Gépelt válasz értékelése. Visszaad: { grade 1–3, note } */
function evaluate(input, item) {
  const n = norm(input);
  if (!n) return { grade: 1 };
  const targets = [item.it].concat(item.alt || []).map(norm);
  if (targets.includes(n)) return { grade: 3 };
  for (const t of targets) {
    if (stripAccents(t) === stripAccents(n)) return { grade: 2, note: 'Az ékezet hiányzik vagy rossz. Olaszul az ékezet jelentést hordoz: e = és, è = van.' };
  }
  for (const t of targets) {
    const ta = stripArticle(t);
    if (ta !== t && stripAccents(ta) === stripAccents(n)) return { grade: 2, note: 'Majdnem: a névelővel együtt tanuld, abból tudod a nemét.' };
  }
  for (const t of targets) {
    const a = stripAccents(t), b = stripAccents(n);
    const tol = a.length >= 12 ? 2 : a.length >= 5 ? 1 : 0;
    if (lev(a, b) <= tol) return { grade: 2, note: 'Kis elírás. Elfogadom, de nézd meg a helyes alakot.' };
  }
  return { grade: 1 };
}

/* ---------- Hang: felolvasás és beszédfelismerés ---------- */
let itVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  const it = vs.filter(v => /^it([-_]|$)/i.test(v.lang));
  itVoice = it.find(v => /google|natural|premium|enhanced|neural|alice|federica|luca/i.test(v.name)) || it[0] || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', pickVoice) : (speechSynthesis.onvoiceschanged = pickVoice);
}
const ttsOK = () => 'speechSynthesis' in window && !!itVoice;

const stopAudio = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };

function say(text, rate) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = (PACK && PACK.tts) || 'it-IT';
  if (itVoice) u.voice = itVoice;
  u.rate = rate || state.settings.rate;
  speechSynthesis.speak(u);
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srOK = () => !!SR;
function listenOnce() {
  return new Promise((resolve, reject) => {
    const r = new SR();
    r.lang = (PACK && PACK.tts) || 'it-IT';
    r.interimResults = false;
    r.maxAlternatives = 5;
    let got = false;
    r.onresult = e => { got = true; resolve(Array.from(e.results[0]).map(a => a.transcript)); };
    r.onerror = e => reject(e.error || 'error');
    r.onend = () => { if (!got) resolve([]); };
    r.start();
    setTimeout(() => { try { r.stop(); } catch (e) {} }, 8000);
  });
}

const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  slow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>'
};
const playBtn = (text, label = 'Meghallgatom', cls = '') =>
  `<button class="icon-btn ${cls}" data-say="${esc(text)}" aria-label="${label}" title="${label}">${ICON.play}</button>`;

document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.preventDefault(); say(b.dataset.say, b.dataset.rate ? +b.dataset.rate : undefined); }
});

/* ---------- Tananyag ---------- */
async function loadPack() {
  const res = await fetch(PACK_URL);
  PACK = await res.json();
  ITEMS = {}; ORDER = [];
  PACK.units.forEach((u, ui) => {
    u.index = ui;
    u.items.forEach(it => { it.unit = u; ITEMS[it.id] = it; ORDER.push(it.id); });
  });
  for (const id of Object.keys(state.cards)) if (!ITEMS[id]) delete state.cards[id];
}

function cardStatus(id) {
  const c = state.cards[id];
  if (!c) return 'new';
  if (c.s < 3) return 'learning';
  if (c.s < 21) return 'young';
  return 'mature';
}

function currentUnit() {
  if (state.focus) {
    const u = PACK.units.find(u => u.id === state.focus);
    if (u && u.items.some(i => !state.cards[i.id])) return u;
  }
  return PACK.units.find(u => u.items.some(i => !state.cards[i.id])) || PACK.units[PACK.units.length - 1];
}

function nextNewItems(n) {
  if (n <= 0) return [];
  const u = currentUnit();
  const ordered = u.items.map(i => i.id).concat(ORDER.filter(id => ITEMS[id].unit !== u));
  return ordered.filter(id => !state.cards[id]).slice(0, n);
}

function dueCards() {
  const t = today(), now = Date.now();
  return Object.entries(state.cards)
    .filter(([id, c]) => ITEMS[id] && c.due <= t)
    .map(([id, c]) => ({ id, r: retrievability(Math.max(0, (now - c.last) / DAY), c.s) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, state.settings.reviewLimit)
    .map(x => x.id);
}
const newToday = () => Object.values(state.cards).filter(c => c.intro === today()).length;
const newLeftToday = () => Math.max(0, state.settings.newPerDay - newToday());

function streak() {
  let d = today(), n = 0;
  if (!state.days[d]) d -= 1; // a mai még nem rontja el a sorozatot
  while (state.days[d]) { n++; d--; }
  return n;
}

/* ---------- Értékelés rögzítése ---------- */
function rate(id, grade) {
  const now = Date.now();
  const prev = state.cards[id];
  state.cards[id] = fsrsReview(prev, grade, now, state.settings.targetR);
  state.log.push([now, id, grade, prev && prev.reps ? 0 : 1]);
  const d = today();
  state.days[d] = (state.days[d] || 0) + 1;
  saveState();
  $('#streakN').textContent = streak();
}

/* ---------- Navigáció ---------- */
const VIEWS = { home: renderHome, library: renderLibrary, stats: renderStats, settings: renderSettings };
let currentView = 'home';
function show(view) {
  currentView = view;
  document.body.classList.remove('in-session');
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.view === view));
  stopAudio();
  VIEWS[view]();
  window.scrollTo(0, 0);
}
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
  if (session && !confirm('Kilépsz a mostani körből? Az eddigi válaszaid mentve vannak.')) return;
  session = null;
  show(b.dataset.view);
}));

/* ---------- Főoldal ---------- */
function renderHome() {
  const due = dueCards().length;
  const nl = Math.min(newLeftToday(), nextNewItems(999).length);
  const known = Object.values(state.cards).filter(c => c.s >= 21).length;
  const learned = Object.keys(state.cards).length;
  const u = currentUnit();
  const uDone = u.items.filter(i => state.cards[i.id]).length;
  const total = due + nl;
  const doneToday = state.days[today()] || 0;

  let headline, sub;
  if (!learned) { headline = 'Kezdjük az elején.'; sub = `Ma ${nl} új kifejezés vár, mindegyik hanggal és valós mondatban.`; }
  else if (total === 0) { headline = 'Mára kész vagy.'; sub = 'Az ütemező akkor hoz vissza egy szót, amikor épp felejtenéd. Holnap folytasd.'; }
  else { headline = `${total} feladat vár ma.`; sub = `${due} ismétlés és ${nl} új. Kb. ${Math.max(1, Math.round(total * 0.25))} perc.`; }

  app.innerHTML = `
    <section class="hero">
      <h2>${esc(headline)}</h2>
      <p>${esc(sub)}</p>
    </section>
    <div class="kpis">
      <div class="kpi due"><b>${due}</b><span>esedékes ismétlés</span></div>
      <div class="kpi new"><b>${nl}</b><span>új ma</span></div>
      <div class="kpi known"><b>${known}</b><span>tartósan tudod</span></div>
    </div>
    ${total ? `<button class="btn primary block lg" id="start">${learned ? 'Mai kör indítása' : 'Első lecke indítása'}</button>`
      : `<div class="card"><span class="done-badge">✓ Ma ${doneToday} választ adtál.</span>
         ${nextNewItems(1).length ? `<p class="small muted" style="margin:8px 0 12px">Ha van még kedved, vehetsz fel extra új anyagot, de a tartós tudáshoz a rendszeresség többet ér a mennyiségnél.</p>
         <button class="btn block" id="extra">+5 új kifejezés</button>` : ''}</div>`}
    <h3 class="section-title">Most tanulod</h3>
    <div class="card">
      <div class="unit-now">
        <div style="flex:1">
          <div class="tag">${u.index + 1}. lecke</div>
          <h3 style="font-size:22px">${esc(u.title)}</h3>
          <div class="muted small">${esc(u.hu)} · ${uDone}/${u.items.length} elkezdve</div>
        </div>
        <button class="btn" id="grammar">Nyelvtan</button>
      </div>
    </div>
    <h3 class="section-title">Miben más, mint a Duolingo</h3>
    <div class="surface">
      <ul class="principles">
        <li><b>FSRS ütemezés</b> (mint az Ankiban): minden kifejezést pont akkor hoz vissza, amikor 90% eséllyel még emlékszel rá.</li>
        <li><b>Felidézés, nem felismerés:</b> ahogy egy szó erősödik, a feladat nehezedik: választás → kirakás → gépelés → diktálás → kimondás.</li>
        <li><b>Valós mondatok</b> kávézóból, utazásból, üzleti megbeszélésből.</li>
        <li><b>Nincs szív, reklám, ligás nyomás.</b> Az adataid a böngésződben maradnak.</li>
      </ul>
    </div>`;

  const s = $('#start'); if (s) s.onclick = () => startSession();
  const x = $('#extra'); if (x) x.onclick = () => startSession(5);
  $('#grammar').onclick = () => showGrammar(u, () => show('home'));
}

function showGrammar(u, back) {
  document.body.classList.add('in-session');
  app.innerHTML = `
    <div class="session-bar"><button class="btn ghost" id="back">← Vissza</button></div>
    <div class="mode-label">${u.index + 1}. lecke · nyelvtan</div>
    <h2 class="prompt">${esc(u.title)}</h2>
    <p class="prompt-sub">${esc(u.hu)}</p>
    <div class="card">${u.grammar.map(g => `<div class="grammar"><h3>${esc(g.h)}</h3><p>${esc(g.p)}</p></div>`).join('')}</div>`;
  $('#back').onclick = back;
}

/* ---------- Tanulási kör ---------- */
function startSession(extraNew = 0) {
  const due = dueCards();
  const news = nextNewItems(extraNew || newLeftToday());
  const queue = [];
  const seenUnits = new Set(Object.keys(state.cards).map(id => ITEMS[id] && ITEMS[id].unit.id));
  let ni = 0;
  const pushNew = () => {
    const id = news[ni++];
    const u = ITEMS[id].unit;
    if (!seenUnits.has(u.id)) { seenUnits.add(u.id); queue.push({ kind: 'unit', unit: u }); }
    queue.push({ kind: 'intro', id });
  };
  due.forEach((id, i) => {
    queue.push({ kind: 'review', id });
    if ((i + 1) % 3 === 0 && ni < news.length) pushNew();
  });
  while (ni < news.length) pushNew();
  if (!queue.length) return show('home');
  session = { queue, pos: 0, correct: 0, rated: 0, noSpeak: false };
  document.body.classList.add('in-session');
  nextStep();
}

function insertAhead(step, gap) {
  const at = Math.min(session.queue.length, session.pos + gap);
  session.queue.splice(at, 0, step);
}

function nextStep() {
  if (!session) return;
  if (session.pos >= session.queue.length) return renderSummary();
  const step = session.queue[session.pos++];
  const item = step.id ? ITEMS[step.id] : null;
  if (step.kind === 'unit') return renderUnitIntro(step.unit);
  if (step.kind === 'intro') return renderIntro(item, step);
  const mode = pickMode(item, step);
  MODES[mode](item, step);
}

function sessionShell(labelHtml, body) {
  const steps = session.queue.filter(q => q.kind !== 'unit').length;
  const done = session.queue.slice(0, session.pos - 1).filter(q => q.kind !== 'unit').length;
  const pct = Math.round(100 * done / Math.max(1, steps));
  app.innerHTML = `
    <div class="session-bar">
      <button class="btn ghost" id="quit" aria-label="Kilépés">✕</button>
      <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <span class="small muted num">${done}/${steps}</span>
    </div>
    ${labelHtml}
    <div id="stage">${body}</div>`;
  $('#quit').onclick = () => { session = null; show('home'); };
}

function pickMode(item, step) {
  const c = state.cards[item.id];
  const isS = item.k === 's';
  const canListen = ttsOK();
  const canSpeak = srOK() && state.settings.speak && !session.noSpeak;
  if (step.kind === 'retry') return isS ? 'tiles' : 'mcHuIt';
  if (step.kind === 'check' || !c) return 'mcItHu';
  let pool;
  if (c.s < 3) pool = isS ? ['tiles', 'tiles', 'mcHuIt'] : ['mcHuIt', 'mcItHu', canListen ? 'listenMc' : 'mcHuIt'];
  else if (c.s < 12) pool = isS ? ['tiles', 'type', canListen ? 'dictation' : 'tiles'] : ['type', 'type', canListen ? 'dictation' : 'mcHuIt'];
  else pool = isS ? ['type', canListen ? 'dictation' : 'type', canSpeak ? 'speak' : 'tiles'] : ['type', canListen ? 'dictation' : 'type', canSpeak ? 'speak' : 'type'];
  return pick(pool);
}

const LABEL = {
  check: ['new', 'Új · ellenőrzés'], review: ['', 'Ismétlés'], retry: ['retry', 'Még egyszer']
};
const label = (step, text) => {
  const [cls, l] = LABEL[step.kind] || ['', ''];
  return `<div class="mode-label ${cls}">${l} · ${text}</div>`;
};

/* Közös visszajelzés és továbblépés */
function finish(item, step, res) {
  const { grade, note, given, override } = res;
  if (step.kind !== 'retry') { rate(item.id, grade); session.rated++; if (grade >= 2) session.correct++; }
  if (grade === 1) insertAhead({ kind: 'retry', id: item.id }, 3);
  const cls = grade === 3 || grade === 4 ? 'ok' : grade === 2 ? 'hard' : 'bad';
  const title = grade >= 3 ? pick(['Bravo!', 'Esatto!', 'Perfetto!', 'Giusto!']) : grade === 2 ? 'Majdnem jó' : 'Nem egészen';
  const ivl = step.kind !== 'retry' && state.cards[item.id] ? state.cards[item.id].ivl : null;
  const fb = document.createElement('div');
  fb.className = `feedback ${cls}`;
  fb.innerHTML = `
    <div class="row"><h3>${title}</h3><span class="spacer"></span>${playBtn(item.it)}</div>
    <div class="solution">${esc(item.it)}</div>
    <p>${esc(item.hu)}</p>
    ${given && grade < 3 ? `<p class="small">A te válaszod: <b>${esc(given)}</b></p>` : ''}
    ${note ? `<p class="small">${esc(note)}</p>` : ''}
    ${grade === 1 ? '<p class="small">Néhány feladat múlva újra előjön.</p>' : ivl ? `<p class="small muted">Következő ismétlés: ${ivl === 1 ? 'holnap' : ivl + ' nap múlva'}.</p>` : ''}
    <div class="actions">
      ${grade === 1 && override && step.kind !== 'retry' ? `<button class="btn" id="override">${esc(override)}</button>` : ''}
      <button class="btn primary" id="next" style="flex:1">Tovább</button>
    </div>`;
  $('#stage').appendChild(fb);
  if (grade < 3 && state.settings.autoplay) say(item.it);
  const next = $('#next');
  next.focus({ preventScroll: true });
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  next.onclick = () => { stopAudio(); nextStep(); };
  const ov = $('#override');
  if (ov) ov.onclick = () => {
    // a rögzített 1-es jegy felülírása 2-esre, az ismétlés törlése
    state.log.pop();
    const d = today(); state.days[d] = Math.max(0, (state.days[d] || 1) - 1);
    if (session.prevCard) state.cards[item.id] = session.prevCard;
    const ri = session.queue.findIndex((q, i) => i >= session.pos && q.kind === 'retry' && q.id === item.id);
    if (ri >= 0) session.queue.splice(ri, 1);
    if (session.prevCard === undefined) delete state.cards[item.id];
    rate(item.id, 2); session.correct++;
    nextStep();
  };
}

function beginExercise(item) {
  session.prevCard = state.cards[item.id] ? Object.assign({}, state.cards[item.id]) : undefined;
  session.t0 = Date.now();
}

/* ---------- Gyakorlattípusok ---------- */
function renderUnitIntro(u) {
  sessionShell(`<div class="mode-label new">Új lecke · ${u.index + 1}.</div>`, `
    <h2 class="prompt">${esc(u.title)}</h2>
    <p class="prompt-sub">${esc(u.hu)}</p>
    <div class="card">${u.grammar.map(g => `<div class="grammar"><h3>${esc(g.h)}</h3><p>${esc(g.p)}</p></div>`).join('')}</div>
    <div class="next-bar"><button class="btn primary block lg" id="go">Kezdjük</button></div>`);
  const go = $('#go'); go.focus(); go.onclick = nextStep;
}

function renderIntro(item, step) {
  const ex = item.k === 'w' ? item.unit.items.find(i => i.k === 's' && norm(i.it).includes(stripArticle(norm(item.it)))) : null;
  sessionShell(`<div class="mode-label new">Új ${item.k === 's' ? 'mondat' : 'kifejezés'}</div>`, `
    <div class="card">
      <div class="row" style="align-items:flex-start">
        <div style="flex:1"><div class="big-word">${esc(item.it)}</div><div class="meaning">${esc(item.hu)}</div></div>
        <div class="row">${playBtn(item.it)}<button class="icon-btn" data-say="${esc(item.it)}" data-rate="0.6" aria-label="Lassan" title="Lassan">${ICON.slow}</button></div>
      </div>
      ${ex ? `<div class="surface" style="margin-top:14px"><div class="row"><div style="flex:1"><b>${esc(ex.it)}</b><div class="small muted">${esc(ex.hu)}</div></div>${playBtn(ex.it)}</div></div>` : ''}
      ${srOK() && state.settings.speak ? `<div class="row" style="margin-top:14px"><button class="btn" id="practice">${ICON.mic.replace('<svg', '<svg width="18" height="18"')} Mondd ki</button><span class="small muted" id="pres"></span></div>` : ''}
    </div>
    <p class="small muted">Hallgasd meg, mondd ki hangosan. Pár feladat múlva rákérdezek.</p>
    <div class="next-bar"><button class="btn primary block lg" id="go">Megvan</button></div>`);
  if (state.settings.autoplay) setTimeout(() => say(item.it), 250);
  insertAhead({ kind: 'check', id: item.id }, 2);
  const go = $('#go'); go.focus({ preventScroll: true }); go.onclick = nextStep;
  const pr = $('#practice');
  if (pr) pr.onclick = async () => {
    const out = $('#pres');
    pr.disabled = true; out.textContent = 'Hallgatlak…';
    try {
      const alts = await listenOnce();
      const best = Math.max(0, ...alts.map(a => similarity(stripAccents(norm(a)), stripAccents(norm(item.it)))));
      out.textContent = alts.length ? (best >= 0.85 ? '✓ Szépen érthető.' : best >= 0.6 ? `Majdnem: „${alts[0]}”` : `Ezt hallottam: „${alts[0]}”`) : 'Nem hallottam semmit.';
    } catch (e) { out.textContent = 'A mikrofon nem érhető el.'; }
    pr.disabled = false;
  };
}

function distractors(item, field, n) {
  const sameKind = ORDER.map(id => ITEMS[id]).filter(i => i.id !== item.id && i.k === item.k);
  const seen = sameKind.filter(i => state.cards[i.id]);
  const unit = sameKind.filter(i => i.unit === item.unit);
  const pool = shuffle(unit.concat(seen)).concat(shuffle(sameKind));
  const out = [], used = new Set([norm(item[field])]);
  for (const i of pool) {
    const v = norm(i[field]);
    if (!used.has(v)) { used.add(v); out.push(i[field]); }
    if (out.length >= n) break;
  }
  return out;
}

function multipleChoice(item, step, { promptHtml, answerField, modeText }) {
  beginExercise(item);
  const options = shuffle([item[answerField]].concat(distractors(item, answerField, 3)));
  sessionShell(label(step, modeText), `
    ${promptHtml}
    <div class="choices">${options.map((o, i) => `<button class="choice" data-v="${esc(o)}"><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`);
  const btns = [...document.querySelectorAll('.choice')];
  let answered = false;
  const answer = b => {
    if (answered) return; answered = true;
    const ok = b.dataset.v === item[answerField];
    btns.forEach(x => { x.disabled = true; if (x.dataset.v === item[answerField]) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    document.removeEventListener('keydown', keys);
    finish(item, step, { grade: ok ? 3 : 1, given: ok ? null : b.dataset.v });
  };
  const keys = e => { const n = +e.key; if (n >= 1 && n <= btns.length) { e.preventDefault(); answer(btns[n - 1]); } };
  document.addEventListener('keydown', keys);
  btns.forEach(b => b.onclick = () => answer(b));
}

const MODES = {
  mcItHu(item, step) {
    multipleChoice(item, step, {
      modeText: 'Mit jelent?', answerField: 'hu',
      promptHtml: `<div class="row"><h2 class="prompt it" style="flex:1">${esc(item.it)}</h2>${playBtn(item.it)}</div><p class="prompt-sub">Válaszd ki a jelentését.</p>`
    });
    if (state.settings.autoplay) say(item.it);
  },
  mcHuIt(item, step) {
    multipleChoice(item, step, {
      modeText: 'Hogy mondod olaszul?', answerField: 'it',
      promptHtml: `<h2 class="prompt">${esc(item.hu)}</h2><p class="prompt-sub">Válaszd ki az olasz megfelelőjét.</p>`
    });
  },
  listenMc(item, step) {
    multipleChoice(item, step, {
      modeText: 'Hallás után', answerField: 'hu',
      promptHtml: `<div class="listen-box">${playBtn(item.it, 'Lejátszás', 'lg')}<button class="icon-btn" data-say="${esc(item.it)}" data-rate="0.6" aria-label="Lassan">${ICON.slow}</button><span class="muted">Mit hallasz?</span></div>`
    });
    setTimeout(() => say(item.it), 200);
  },
  tiles(item, step) {
    beginExercise(item);
    const words = item.it.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    const extra = shuffle(item.unit.items.filter(i => i.k === 'w').flatMap(i => i.it.split(/\s+/)))
      .filter(w => !words.map(norm).includes(norm(w))).slice(0, Math.min(3, Math.ceil(words.length / 2)));
    const tiles = shuffle(words.concat(extra)).map((w, i) => ({ w, i }));
    sessionShell(label(step, 'Rakd össze'), `
      <h2 class="prompt">${esc(item.hu)}</h2>
      <p class="prompt-sub">Rakd ki olaszul a szavakból.</p>
      <div class="tiles-answer" id="ans" aria-label="Válaszod"></div>
      <div class="tiles-pool" id="pool">${tiles.map(t => `<button class="tile" data-i="${t.i}">${esc(t.w)}</button>`).join('')}</div>
      <button class="btn primary block lg" id="check" disabled>Ellenőrzés</button>`);
    const ans = $('#ans'), pool = $('#pool'), check = $('#check');
    const chosen = [];
    const redraw = () => {
      ans.innerHTML = chosen.map(t => `<button class="tile" data-c="${t.i}">${esc(t.w)}</button>`).join('');
      pool.querySelectorAll('.tile').forEach(b => b.classList.toggle('used', chosen.some(t => t.i === +b.dataset.i)));
      check.disabled = !chosen.length;
    };
    pool.onclick = e => { const b = e.target.closest('.tile'); if (!b || b.classList.contains('used')) return; chosen.push(tiles.find(t => t.i === +b.dataset.i)); redraw(); };
    ans.onclick = e => { const b = e.target.closest('.tile'); if (!b) return; chosen.splice(chosen.findIndex(t => t.i === +b.dataset.c), 1); redraw(); };
    check.onclick = () => {
      check.remove(); pool.onclick = ans.onclick = null;
      const given = chosen.map(t => t.w).join(' ');
      const ok = [item.it].concat(item.alt || []).some(t => norm(t) === norm(given));
      finish(item, step, { grade: ok ? 3 : 1, given });
    };
  },
  type(item, step) { typedExercise(item, step, false); },
  dictation(item, step) { typedExercise(item, step, true); },
  speak(item, step) {
    beginExercise(item);
    sessionShell(label(step, 'Mondd ki olaszul'), `
      <h2 class="prompt">${esc(item.hu)}</h2>
      <p class="prompt-sub">Nyomd meg a mikrofont, és mondd ki olaszul.</p>
      <div class="listen-box"><button class="icon-btn lg" id="mic" aria-label="Felvétel">${ICON.mic}</button><span id="heard" class="muted">Kész vagyok, ha te is.</span></div>
      <div class="row wrap"><button class="btn ghost small" id="cant">Most nem tudok beszélni</button></div>`);
    const mic = $('#mic'), heard = $('#heard');
    $('#cant').onclick = () => { session.noSpeak = true; typedExercise(item, step, false); };
    mic.onclick = async () => {
      mic.classList.add('rec'); mic.disabled = true; heard.textContent = 'Hallgatlak…';
      let alts = [];
      try { alts = await listenOnce(); }
      catch (e) {
        mic.classList.remove('rec'); mic.disabled = false;
        heard.textContent = e === 'not-allowed' ? 'Nincs mikrofon-engedély. Gépelésre váltok.' : 'Hiba történt, próbáld újra.';
        if (e === 'not-allowed') { session.noSpeak = true; setTimeout(() => typedExercise(item, step, false), 900); }
        return;
      }
      mic.classList.remove('rec');
      if (!alts.length) { mic.disabled = false; heard.textContent = 'Nem hallottam semmit. Próbáld újra.'; return; }
      const targets = [item.it].concat(item.alt || []).map(t => stripAccents(norm(t)));
      const best = alts.map(a => ({ a, s: Math.max(...targets.map(t => similarity(stripAccents(norm(a)), t))) })).sort((x, y) => y.s - x.s)[0];
      heard.innerHTML = `Ezt hallottam: <b>„${esc(best.a)}”</b>`;
      $('#cant').parentElement.remove();
      const grade = best.s >= 0.85 ? 3 : best.s >= 0.6 ? 2 : 1;
      finish(item, step, { grade, given: best.a, override: 'Jól mondtam, elfogadom', note: grade === 2 ? 'Érthető, de nem pontos. Hallgasd meg és ismételd el.' : grade === 1 ? 'A felismerő is tévedhet: ha szerinted jó volt, fogadd el.' : null });
    };
  }
};

function typedExercise(item, step, dictation) {
  beginExercise(item);
  const accents = ['à', 'è', 'é', 'ì', 'ò', 'ù'];
  sessionShell(label(step, dictation ? 'Diktálás' : 'Írd le olaszul'), `
    ${dictation
      ? `<div class="listen-box">${playBtn(item.it, 'Lejátszás', 'lg')}<button class="icon-btn" data-say="${esc(item.it)}" data-rate="0.6" aria-label="Lassan">${ICON.slow}</button><span class="muted">Írd le, amit hallasz.</span></div>`
      : `<h2 class="prompt">${esc(item.hu)}</h2><p class="prompt-sub">${item.k === 'w' && ARTICLE_RE.test(norm(item.it)) ? 'Névelővel együtt.' : 'Gépeld be olaszul.'}</p>`}
    <form id="f" autocomplete="off">
      <input class="answer-input" id="inp" lang="it" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Válaszod…" aria-label="Válaszod">
      <div class="accents">${accents.map(a => `<button type="button" data-a="${a}">${a}</button>`).join('')}</div>
      <div class="row"><button type="button" class="btn ghost" id="idk">Nem tudom</button><span class="spacer"></span><button class="btn primary lg" id="check" style="min-width:160px">Ellenőrzés</button></div>
    </form>`);
  const inp = $('#inp'), f = $('#f');
  setTimeout(() => inp.focus(), 50);
  if (dictation) setTimeout(() => say(item.it), 250);
  f.querySelector('.accents').onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const s = inp.selectionStart ?? inp.value.length, en = inp.selectionEnd ?? s;
    inp.value = inp.value.slice(0, s) + b.dataset.a + inp.value.slice(en);
    inp.focus(); inp.setSelectionRange(s + 1, s + 1);
  };
  let done = false;
  const submit = (given) => {
    if (done) return; done = true;
    const res = given === null ? { grade: 1 } : evaluate(given, item);
    if (res.grade === 3 && Date.now() - session.t0 < 2500 + 150 * item.it.length) res.grade = 4;
    inp.readOnly = true; inp.classList.add(res.grade >= 2 ? 'right' : 'wrong');
    f.querySelector('.accents').remove(); f.querySelector('.row').remove();
    finish(item, step, Object.assign(res, { given, override: given ? 'Elírás volt, elfogadom' : null }));
  };
  f.onsubmit = e => { e.preventDefault(); if (!inp.value.trim()) return inp.focus(); submit(inp.value); };
  $('#idk').onclick = () => submit(null);
}

function renderSummary() {
  const acc = session.rated ? Math.round(100 * session.correct / session.rated) : 100;
  const tomorrow = Object.values(state.cards).filter(c => c.due <= today() + 1).length;
  session = null;
  app.innerHTML = `
    <section class="hero"><h2>Ma ennyi volt. Ottimo!</h2><p>Minden válaszod mentve, az ütemező már kiszámolta a következő ismétléseket.</p></section>
    <div class="kpis">
      <div class="kpi new"><b>${acc}%</b><span>elsőre jó</span></div>
      <div class="kpi due"><b>${tomorrow}</b><span>holnapra esedékes</span></div>
      <div class="kpi known"><b>${streak()}</b><span>napos sorozat</span></div>
    </div>
    <button class="btn primary block lg" id="home">Vissza a főoldalra</button>`;
  document.body.classList.remove('in-session');
  $('#home').onclick = () => show('home');
}

/* ---------- Tananyag nézet ---------- */
function renderLibrary() {
  const cu = currentUnit();
  app.innerHTML = `
    <div class="legend">
      <span><i class="dot"></i>új</span><span><i class="dot learning"></i>tanulod</span>
      <span><i class="dot young"></i>rögzül</span><span><i class="dot mature"></i>tartós (3+ hét)</span>
    </div>
    ${PACK.units.map(u => {
      const started = u.items.filter(i => state.cards[i.id]).length;
      return `<details class="unit" ${u === cu ? 'open' : ''}>
        <summary>
          <span class="unit-no">${u.index + 1}</span>
          <span class="unit-t"><b>${esc(u.title)}</b><span>${esc(u.hu)} · ${started}/${u.items.length}</span></span>
          <span class="mini-bar"><i style="width:${Math.round(100 * started / u.items.length)}%"></i></span>
        </summary>
        <div class="unit-body">
          <div class="row wrap" style="margin-bottom:8px">
            <button class="btn" data-grammar="${u.id}">Nyelvtan</button>
            ${u === cu ? '<span class="small" style="color:var(--gold);font-weight:700">MOST EZT TANULOD</span>'
              : started < u.items.length ? `<button class="btn ghost" data-focus="${u.id}">Ezzel folytatom</button>` : ''}
          </div>
          ${u.items.map(i => `<div class="item-row"><i class="dot ${cardStatus(i.id)}"></i>
            <div class="txt"><div class="it">${esc(i.it)}</div><div class="hu">${esc(i.hu)}</div></div>${playBtn(i.it)}</div>`).join('')}
        </div>
      </details>`;
    }).join('')}`;
  app.querySelectorAll('[data-grammar]').forEach(b => b.onclick = () => showGrammar(PACK.units.find(u => u.id === b.dataset.grammar), () => show('library')));
  app.querySelectorAll('[data-focus]').forEach(b => b.onclick = () => { state.focus = b.dataset.focus; saveState(); renderLibrary(); });
}

/* ---------- Statisztika ---------- */
function bars(values, labels, cls = '') {
  const max = Math.max(1, ...values);
  return `<div class="bars ${cls}">${values.map((v, i) => `<div class="b"><em>${v || ''}</em><i style="height:${Math.round(100 * v / max)}%"></i><small>${labels[i]}</small></div>`).join('')}</div>`;
}
const WD = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
const dayLabel = idx => WD[new Date(idx * DAY + 12 * 3600000).getUTCDay()];

function renderStats() {
  const t = today();
  const cards = Object.values(state.cards);
  const cut = Date.now() - 30 * DAY;
  const reviews30 = state.log.filter(l => l[0] >= cut && !l[3]);
  const retention = reviews30.length ? Math.round(100 * reviews30.filter(l => l[2] >= 2).length / reviews30.length) : null;
  const forecast = Array.from({ length: 7 }, (_, i) => cards.filter(c => i === 0 ? c.due <= t : c.due === t + i).length);
  const past = Array.from({ length: 14 }, (_, i) => state.days[t - 13 + i] || 0);
  const by = s => cards.filter(c => cardStatus2(c) === s).length;
  app.innerHTML = `
    <div class="stat-grid">
      <div class="kpi"><b class="num">${cards.length}</b><span>elkezdett kifejezés (${ORDER.length}-ból)</span></div>
      <div class="kpi"><b class="num" style="color:var(--emerald)">${by('mature')}</b><span>tartós (stabilitás 3+ hét)</span></div>
      <div class="kpi"><b class="num" style="color:var(--sapphire)">${retention == null ? '–' : retention + '%'}</b><span>megtartás, 30 nap (cél: ${Math.round(state.settings.targetR * 100)}%)</span></div>
      <div class="kpi"><b class="num" style="color:var(--gold)">${streak()}</b><span>napos sorozat</span></div>
    </div>
    <h3 class="section-title">Esedékes ismétlések, 7 nap</h3>
    <div class="card">${bars(forecast, forecast.map((_, i) => i === 0 ? 'ma' : dayLabel(t + i)))}</div>
    <h3 class="section-title">Válaszok, elmúlt 14 nap</h3>
    <div class="card">${bars(past, past.map((_, i) => dayLabel(t - 13 + i)), 'green')}</div>
    <h3 class="section-title">Hogyan olvasd</h3>
    <div class="surface small">
      A <b>megtartás</b> azt mutatja, az ismétlések hány százalékánál emlékeztél (a nehezen is számít). Ha tartósan a cél felett vagy, emelheted a célt vagy az új anyagot; ha alatta, csökkentsd a napi új mennyiséget. A <b>stabilitás</b> az a napszám, ami után kb. 90% eséllyel még tudod a szót.
    </div>`;
}
function cardStatus2(c) { return c.s < 3 ? 'learning' : c.s < 21 ? 'young' : 'mature'; }

/* ---------- Beállítások ---------- */
function renderSettings() {
  const st = state.settings;
  const sel = (key, opts) => `<select data-k="${key}">${opts.map(([v, l]) => `<option value="${v}" ${String(st[key]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const sw = key => `<label class="switch"><input type="checkbox" data-k="${key}" ${st[key] ? 'checked' : ''}><span></span></label>`;
  app.innerHTML = `
    ${!ttsOK() ? '<div class="notice">Ezen az eszközön nem találtam olasz hangot, ezért a hallás utáni feladatok kimaradnak. Androidon a Google Speech Services, iPhone-on a Beállítások → Kisegítő lehetőségek → Felolvasott tartalom → Hangok menüben tölthetsz le olasz hangot.</div>' : ''}
    ${!srOK() ? '<div class="notice">Ez a böngésző nem támogatja a beszédfelismerést, ezért a kimondós feladatok kimaradnak. Chrome-ban és Safariban működik.</div>' : ''}
    <div class="card">
      <div class="setting"><label>Új kifejezés naponta<span class="hint">8 kb. 15 perc/nap hosszú távon</span></label>${sel('newPerDay', [[5, '5'], [8, '8'], [10, '10'], [15, '15'], [20, '20']])}</div>
      <div class="setting"><label>Megtartási cél<span class="hint">Magasabb = több ismétlés, biztosabb tudás</span></label>${sel('targetR', [[0.85, '85%'], [0.9, '90%'], [0.95, '95%']])}</div>
      <div class="setting"><label>Felolvasás sebessége</label>${sel('rate', [[0.75, 'Lassú'], [0.9, 'Közepes'], [1, 'Természetes']])}</div>
      <div class="setting"><label>Automatikus felolvasás</label>${sw('autoplay')}</div>
      <div class="setting"><label>Kimondós feladatok<span class="hint">Mikrofon kell hozzá</span></label>${sw('speak')}</div>
    </div>
    <h3 class="section-title">Adatok</h3>
    <div class="card">
      <p class="small muted" style="margin-top:0">Minden a böngésződben tárolódik. Eszközváltáshoz exportáld, majd importáld.</p>
      <div class="row wrap">
        <button class="btn" id="exp">Haladás exportálása</button>
        <label class="btn" style="cursor:pointer">Importálás<input type="file" id="imp" accept="application/json" hidden></label>
        <span class="spacer"></span>
        <button class="btn danger" id="reset">Nullázás</button>
      </div>
    </div>
    <p class="small muted" style="text-align:center;margin-top:24px">Viva Voce · ${ORDER.length} kifejezés · FSRS-4.5</p>`;
  app.querySelectorAll('select[data-k]').forEach(s => s.onchange = () => { st[s.dataset.k] = +s.value; saveState(); });
  app.querySelectorAll('input[type=checkbox][data-k]').forEach(c => c.onchange = () => { st[c.dataset.k] = c.checked; saveState(); });
  $('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vivavoce-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#imp').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.cards) throw new Error();
      if (!confirm('Felülírjam a mostani haladást az importált fájllal?')) return;
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      state = loadState(); $('#streakN').textContent = streak(); show('home');
    } catch (err) { alert('Ez nem Viva Voce mentésfájl.'); }
  };
  $('#reset').onclick = () => {
    if (!confirm('Biztosan törlöd az összes haladást? Ez nem visszavonható.')) return;
    localStorage.removeItem(STORE_KEY); state = loadState(); $('#streakN').textContent = 0; show('home');
  };
}

/* ---------- Indítás ---------- */
(async function init() {
  try { await loadPack(); }
  catch (e) {
    app.innerHTML = '<div class="notice">Nem sikerült betölteni a tananyagot. Ha a fájlt közvetlenül nyitottad meg, indíts helyi szervert (lásd README), vagy nyisd meg a GitHub Pages címen.</div>';
    return;
  }
  $('#langName').textContent = `${PACK.name} · A1`;
  $('#streakN').textContent = streak();
  show('home');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
