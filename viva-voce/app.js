/* Viva Voce — app logika. Nincs build lépés, nincs függőség. */
'use strict';

const STORE_KEY = 'vivavoce.v1';
const PACK_URL = 'data/it.json?v=4';
const KEY_STORE = 'vivavoce.apikey';
const AI_MODEL = 'claude-haiku-5-5';
const { review: fsrsReview, retrievability, dayIndex, DAY } = window.FSRS;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $('#app');
const sheet = $('#sheet');

/* ---------- Állapot ---------- */
const DEFAULT_SETTINGS = { newPerDay: 8, targetR: 0.9, rate: 0.9, speak: true, autoplay: true, sound: true, reviewLimit: 150, theme: 'dark' };
let state = loadState();
let PACK = null, ITEMS = {}, ORDER = [];
let session = null;

function loadState() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { s = {}; }
  return {
    cards: s.cards || {}, log: s.log || [], days: s.days || {}, focus: s.focus || null,
    settings: Object.assign({}, DEFAULT_SETTINGS, s.settings || {})
  };
}
function saveState() {
  if (state.log.length > 20000) state.log = state.log.slice(-20000);
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privát mód vagy tele */ }
}

/* ---------- Segédek ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const today = () => dayIndex();
const IT = s => `<span class="it" lang="it">${esc(s)}</span>`;

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

/* Gépelt válasz értékelése → { grade 1–3, note } */
function evaluate(input, item) {
  const n = norm(input);
  if (!n) return { grade: 1 };
  const targets = [item.it].concat(item.alt || []).map(norm);
  if (targets.includes(n)) return { grade: 3 };
  for (const t of targets) if (stripAccents(t) === stripAccents(n))
    return { grade: 2, note: 'Az ékezet hiányzik vagy rossz. Olaszul jelentést hordoz: <b>e</b> = és, <b>è</b> = van.' };
  for (const t of targets) {
    const ta = stripArticle(t);
    if (ta !== t && stripAccents(ta) === stripAccents(n)) return { grade: 2, note: 'A névelő lemaradt. Abból tudod a szó nemét, ezért vele együtt tanuld.' };
  }
  for (const t of targets) {
    const a = stripAccents(t), b = stripAccents(n);
    const tol = a.length >= 12 ? 2 : a.length >= 5 ? 1 : 0;
    if (lev(a, b) <= tol) return { grade: 2, note: 'Kis elírás, elfogadom. Nézd meg a pontos alakot.' };
  }
  return { grade: 1 };
}

/* ---------- Hang ---------- */
let itVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const it = speechSynthesis.getVoices().filter(v => /^it([-_]|$)/i.test(v.lang));
  itVoice = it.find(v => /google|natural|premium|enhanced|neural|alice|federica|luca/i.test(v.name)) || it[0] || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
/* A tananyag minden kifejezéséhez előre felvett hangfájl tartozik (audio/<nyelv>/<id>.mp3, Kokoro neurális hang).
   Ez minden telefonon szól, a némító kapcsoló sem némítja. A böngésző felolvasója csak az AI-beszélgetés
   szabad szövegeihez kell, tartaléknak. */
const AUDIO_BY_TEXT = {};
const player = new Audio();
player.preload = 'auto';
let playerBtn = null;
const ttsOK = () => true; // a tananyag hangja mindig megvan
const clearSpeaking = () => { if (playerBtn) playerBtn.classList.remove('speaking'); playerBtn = null; };
player.addEventListener('ended', clearSpeaking);

function stopAudio() {
  try { player.pause(); } catch (e) {}
  clearSpeaking();
  if ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
}

/* iPhone: a hang csak akkor indulhat magától, ha egyszer már egy érintésre elindult. Az első érintéskor feloldjuk. */
let unlocked = false;
function unlockAudio() {
  if (unlocked) return; unlocked = true;
  player.src = 'audio/silence.mp3';
  player.play().then(() => player.pause()).catch(() => { unlocked = false; });
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {}
  if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(''); u.volume = 0; speechSynthesis.speak(u); }
}
document.addEventListener('pointerdown', unlockAudio, { capture: true });
document.addEventListener('keydown', unlockAudio, { capture: true });

function say(text, rate, btn) {
  stopAudio();
  const r = rate || state.settings.rate;
  const id = AUDIO_BY_TEXT[text];
  if (id) {
    player.src = `audio/${PACK.lang}/${id}.mp3`;
    player.playbackRate = Math.max(0.5, r / 0.9);
    player.preservesPitch = player.webkitPreservesPitch = true;
    if (btn) { playerBtn = btn; btn.classList.add('speaking'); }
    player.play().catch(() => { clearSpeaking(); ttsSay(text, r, btn); });
    return;
  }
  ttsSay(text, r, btn);
}

function ttsSay(text, rate, btn) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = (PACK && PACK.tts) || 'it-IT';
  if (!itVoice) pickVoice();
  if (itVoice) u.voice = itVoice;
  u.rate = rate;
  if (btn) { btn.classList.add('speaking'); u.onend = u.onerror = () => btn.classList.remove('speaking'); }
  // Chrome/Android: a cancel utáni azonnali speak néha elvész, ezért egy pillanatot várunk
  setTimeout(() => speechSynthesis.speak(u), 60);
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srOK = () => !!SR;
function listenOnce() {
  return new Promise((resolve, reject) => {
    const r = new SR();
    r.lang = (PACK && PACK.tts) || 'it-IT';
    r.interimResults = false; r.maxAlternatives = 5;
    let got = false;
    r.onresult = e => { got = true; resolve(Array.from(e.results[0]).map(a => a.transcript)); };
    r.onerror = e => reject(e.error || 'error');
    r.onend = () => { if (!got) resolve([]); };
    r.start();
    setTimeout(() => { try { r.stop(); } catch (e) {} }, 8000);
  });
}

/* Rövid hangjelzés és rezgés a visszajelzéshez */
let actx = null;
function chime(kind) {
  if (navigator.vibrate) navigator.vibrate(kind === 'bad' ? [30, 40, 30] : 12);
  if (!state.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'ok' ? [[659.25, 0], [987.77, .09]] : kind === 'hard' ? [[587.33, 0], [739.99, .09]] : kind === 'done' ? [[523.25, 0], [659.25, .1], [783.99, .2], [1046.5, .3]] : [[220, 0], [174.6, .1]];
    const t0 = actx.currentTime;
    for (const [f, d] of notes) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'bad' ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0 + d);
      g.gain.linearRampToValueAtTime(kind === 'bad' ? .12 : .16, t0 + d + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + d + .35);
      o.connect(g).connect(actx.destination);
      o.start(t0 + d); o.stop(t0 + d + .4);
    }
  } catch (e) { /* nincs hang */ }
}

const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  slow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h13a4 4 0 0 0 4-4V9"/><path d="M5 17c0-4 2.5-7 6-7s5 2.5 5 5"/><circle cx="20" cy="7" r="2"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  tilde: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 13c2-3 4-3 7 0s5 3 7 0"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
};
const playBtn = (text, label = 'Meghallgatom', cls = '', rate = '') =>
  `<button class="icon-btn ${cls}" data-say="${esc(text)}" ${rate ? `data-rate="${rate}"` : ''} aria-label="${label}" title="${label}">${rate ? ICON.slow : ICON.play}</button>`;

document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.preventDefault(); say(b.dataset.say, b.dataset.rate ? +b.dataset.rate : undefined, b); }
});

/* ---------- Tananyag ---------- */
async function loadPack() {
  const res = await fetch(PACK_URL);
  PACK = await res.json();
  ITEMS = {}; ORDER = [];
  PACK.units.forEach((u, ui) => {
    u.index = ui;
    u.items.forEach(it => { it.unit = u; ITEMS[it.id] = it; ORDER.push(it.id); AUDIO_BY_TEXT[it.it] = it.id; });
  });
  for (const id of Object.keys(state.cards)) if (!ITEMS[id]) delete state.cards[id];
}

const level = c => !c ? 0 : c.s < 3 ? 1 : c.s < 21 ? 2 : 3;

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
  if (!state.days[d]) d -= 1;
  while (state.days[d]) { n++; d--; }
  return n;
}
function paintStreak() {
  const n = streak();
  $('#streakN').textContent = n;
  $('#streak').classList.toggle('zero', !n);
}

function rate(id, grade) {
  const now = Date.now();
  const prev = state.cards[id];
  state.cards[id] = fsrsReview(prev, grade, now, state.settings.targetR);
  state.log.push([now, id, grade, prev && prev.reps ? 0 : 1]);
  const d = today();
  state.days[d] = (state.days[d] || 0) + 1;
  saveState();
  paintStreak();
}

/* ---------- Navigáció ---------- */
const VIEWS = { home: renderHome, library: renderLibrary, talk: renderTalk, stats: renderStats, settings: renderSettings };
function show(view, arg) {
  if (view !== 'talk') talk = null;
  document.body.classList.remove('in-session', 'sheet-open');
  closeSheet();
  $$('.tabbar button').forEach(b => b.dataset.view === view ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  stopAudio();
  VIEWS[view](arg);
  window.scrollTo(0, 0);
}
$$('.tabbar button').forEach(b => b.addEventListener('click', () => show(b.dataset.view)));

function closeSheet() { sheet.hidden = true; sheet.innerHTML = ''; document.body.classList.remove('sheet-open'); }

/* ---------- Főoldal ---------- */
function ringSvg(pct, big, small) {
  const r = 38, c = 2 * Math.PI * r;
  return `<div class="ring" role="img" aria-label="${big} ${small}"><svg viewBox="0 0 84 84"><circle class="track" cx="42" cy="42" r="${r}"/><circle class="val" cx="42" cy="42" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - pct)}"/></svg><b><span>${big}<small>${small}</small></span></b></div>`;
}
const animateRings = () => requestAnimationFrame(() => requestAnimationFrame(() => $$('.ring .val').forEach(el => el.style.strokeDashoffset = el.dataset.off)));

function wordOfDay() {
  const known = ORDER.filter(id => state.cards[id] && ITEMS[id].k === 's');
  const pool = known.length ? known : currentUnit().items.filter(i => i.k === 's').map(i => i.id);
  return ITEMS[pool[today() % pool.length]];
}

function renderHome() {
  const due = dueCards().length;
  const nl = Math.min(newLeftToday(), nextNewItems(999).length);
  const doneToday = state.days[today()] || 0;
  const left = due + nl;
  const plannedTotal = doneToday + left + Math.ceil(nl * 1.2); // új szavaknál ellenőrzés is jön
  const pct = left === 0 ? 1 : doneToday / Math.max(1, plannedTotal);
  const learned = Object.keys(state.cards).length;
  const hour = new Date().getHours();
  const greet = hour < 17 ? ['Buongiorno', 'Jó napot'] : ['Buonasera', 'Jó estét'];
  const u = currentUnit();
  const wod = wordOfDay();

  let h, p;
  if (!learned) { h = 'Az első lecke vár.'; p = `${nl} új kifejezés, hanggal és valós mondatokban. Kb. 10 perc.`; }
  else if (!left) { h = 'Mára kész vagy.'; p = 'Az ütemező akkor hozza vissza a szavakat, amikor épp felejtenéd. Holnap folytasd.'; }
  else { h = `${due ? `${due} ismétlés` : ''}${due && nl ? ' és ' : ''}${nl ? `${nl} új kifejezés` : ''}`; p = `Kb. ${Math.max(2, Math.round(left * 0.3 + nl * 0.4))} perc. Bármikor abbahagyhatod, minden válasz azonnal mentődik.`; }

  app.innerHTML = `
    <section class="tile-frame">
      <div class="tile-inner">
        <h1 class="greeting" lang="it">${greet[0]}</h1>
        <p class="greeting-hu">${greet[1]}</p>
        <div class="today-row">
          <div class="today-text"><h2>${esc(h)}</h2><p>${esc(p)}</p></div>
          ${ringSvg(pct, left ? doneToday : '✓', left ? 'ma kész' : 'mára')}
        </div>
        ${left ? `<button class="btn primary block lg" id="start">${learned ? 'Mai kör indítása' : 'Első lecke indítása'}</button>`
          : nextNewItems(1).length ? `<button class="btn block" id="extra">Még 5 új kifejezés</button>` : ''}
        ${wod ? `<div class="word-of-day">${playBtn(wod.it)}<div>${IT(wod.it)}<div class="hu">${esc(wod.hu)}</div></div></div>` : ''}
      </div>
    </section>

    <div class="section-h"><h2>Útvonal</h2><span>${PACK.units.length} lecke, A1–A2</span></div>
    <div class="path">
      ${PACK.units.map((x, xi) => {
        const lvlHead = xi === 0 || PACK.units[xi - 1].level !== x.level ? `<div class="level-h"><span>${x.level}</span>${x.level === 'A1' ? 'Alapok' : 'Haladó kezdő'}</div>` : '';
        const started = x.items.filter(i => state.cards[i.id]).length;
        const cls = started === x.items.length ? 'done' : x === u ? 'now' : started ? 'started' : 'locked';
        const meta = cls === 'done' ? 'kész' : cls === 'now' ? `${started}/${x.items.length}` : started ? `${started}/${x.items.length}` : '';
        return lvlHead + `<button class="stop-row ${cls}" data-unit="${x.id}" aria-label="${x.index + 1}. lecke: ${esc(x.hu)}">
          <span class="medal">${cls === 'done' ? ICON.check.replace('stroke-width="3"', 'stroke-width="3" width="22" height="22"') : x.index + 1}</span>
          <span class="stop-txt">${IT(x.title)}<span class="hu">${esc(x.hu)}</span></span>
          <span class="stop-meta">${meta}</span>
        </button>`;
      }).join('')}
    </div>`;

  animateRings();
  const s = $('#start'); if (s) s.onclick = () => startSession();
  const x = $('#extra'); if (x) x.onclick = () => startSession(5);
  $$('.stop-row').forEach(b => b.onclick = () => show('library', b.dataset.unit));
}

function grammarHtml(u) {
  return u.grammar.map(g => `<div class="rule"><h3>${esc(g.h)}</h3><p>${esc(g.p)}</p></div>`).join('');
}
function showGrammar(u, back) {
  document.body.classList.add('in-session');
  app.innerHTML = `
    <div class="session-bar"><button class="quit" id="back" aria-label="Vissza">${ICON.back}</button></div>
    <div class="grammar-head">${IT(u.title)}<span class="hu">${u.level}, ${u.index + 1}. lecke: ${esc(u.hu.toLowerCase())}</span></div>
    <div style="margin-top:8px">${grammarHtml(u)}</div>
    <button class="btn block" id="back2" style="margin-top:20px">Vissza</button>`;
  $('#back').onclick = $('#back2').onclick = back;
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
  session = { queue, pos: 0, correct: 0, rated: 0, combo: 0, best: 0, noSpeak: false, newCount: news.length, started: Date.now() };
  document.body.classList.add('in-session');
  nextStep();
}

function insertAhead(step, gap) {
  session.queue.splice(Math.min(session.queue.length, session.pos + gap), 0, step);
}

function nextStep() {
  if (!session) return;
  closeSheet();
  stopAudio();
  if (session.pos >= session.queue.length) return renderSummary();
  const step = session.queue[session.pos++];
  const item = step.id ? ITEMS[step.id] : null;
  if (step.kind === 'unit') return renderUnitIntro(step.unit);
  if (step.kind === 'intro') return renderIntro(item);
  MODES[pickMode(item, step)](item, step);
}

function sessionShell(head, body) {
  const steps = session.queue.filter(q => q.kind !== 'unit').length;
  const done = session.queue.slice(0, session.pos - 1).filter(q => q.kind !== 'unit').length;
  const pct = Math.round(100 * done / Math.max(1, steps));
  app.innerHTML = `
    <div class="session-bar">
      <button class="quit" id="quit" aria-label="Kilépés a körből">${ICON.x}</button>
      <div class="progress" role="progressbar" aria-label="Haladás a körben" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <span class="combo" title="Egymás utáni jó válaszok">${session.combo >= 3 ? '×' + session.combo : ''}</span>
    </div>
    <div class="enter">${head}${body}</div>`;
  $('#quit').onclick = () => { session = null; show('home'); };
  window.scrollTo(0, 0);
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

const PILL = { check: ['new', 'Új'], review: ['rev', 'Ismétlés'], retry: ['again', 'Még egyszer'] };
const kind = (step, text) => {
  const [cls, l] = PILL[step.kind] || ['rev', ''];
  return `<div class="task-kind"><span class="pill ${cls}">${l}</span>${esc(text)}</div>`;
};

/* Közös visszajelzés: alulról becsúszó lap */
function finish(item, step, res) {
  const { grade, note, given, override } = res;
  if (step.kind !== 'retry') {
    rate(item.id, grade); session.rated++;
    if (grade >= 2) session.correct++;
  }
  if (grade >= 2) { session.combo++; session.best = Math.max(session.best, session.combo); }
  else { session.combo = 0; insertAhead({ kind: 'retry', id: item.id }, 3); }
  const combo = $('.combo'); if (combo) combo.textContent = session.combo >= 3 ? '×' + session.combo : '';

  const cls = grade >= 3 ? 'ok' : grade === 2 ? 'hard' : 'bad';
  chime(cls);
  const title = grade >= 3 ? pick(['Esatto!', 'Perfetto!', 'Bravo!', 'Giusto!', 'Ottimo!']) : grade === 2 ? 'Majdnem' : 'Nem egészen';
  const ivl = step.kind !== 'retry' && state.cards[item.id] ? state.cards[item.id].ivl : null;
  const next = grade === 1 ? 'Pár feladat múlva újra előjön.' : ivl ? `Legközelebb ${ivl === 1 ? 'holnap' : ivl + ' nap múlva'} kérdezem.` : '';
  sheet.className = `sheet ${cls}`;
  sheet.innerHTML = `<div class="wrap">
    <div class="sheet-head"><span class="mark">${grade >= 3 ? ICON.check : grade === 2 ? ICON.tilde : ICON.x}</span><h3>${title}</h3>${playBtn(item.it)}</div>
    <div class="sol">${IT(item.it)}<span class="hu">${esc(item.hu)}</span></div>
    ${given && grade < 3 ? `<p class="note">Te ezt írtad: <b lang="it">${esc(given)}</b></p>` : ''}
    ${note ? `<p class="note">${note}</p>` : ''}
    ${next ? `<p class="note">${next}</p>` : ''}
    <div class="actions">
      ${grade === 1 && override && step.kind !== 'retry' ? `<button class="btn" id="override">${esc(override)}</button>` : ''}
      <button class="btn ${cls === 'bad' ? 'stop' : 'go'} lg" id="next">Tovább</button>
    </div></div>`;
  sheet.hidden = false;
  document.body.classList.add('sheet-open');
  if (grade < 3 && state.settings.autoplay) setTimeout(() => say(item.it), 200);
  const nb = $('#next');
  nb.focus({ preventScroll: true });
  nb.onclick = nextStep;
  const ov = $('#override');
  if (ov) ov.onclick = () => {
    state.log.pop();
    const d = today(); state.days[d] = Math.max(0, (state.days[d] || 1) - 1);
    if (session.prevCard) state.cards[item.id] = session.prevCard; else delete state.cards[item.id];
    const ri = session.queue.findIndex((q, i) => i >= session.pos && q.kind === 'retry' && q.id === item.id);
    if (ri >= 0) session.queue.splice(ri, 1);
    rate(item.id, 2); session.correct++; session.combo++;
    nextStep();
  };
}

function beginExercise(item) {
  session.prevCard = state.cards[item.id] ? Object.assign({}, state.cards[item.id]) : undefined;
  session.t0 = Date.now();
}

/* ---------- Képernyők a körön belül ---------- */
function renderUnitIntro(u) {
  sessionShell(`<div class="task-kind"><span class="pill new">Új lecke</span>${u.level}, ${u.index + 1}. lecke</div>`, `
    <div class="grammar-head">${IT(u.title)}<span class="hu">${esc(u.hu)}</span></div>
    <div style="margin-top:6px">${grammarHtml(u)}</div>
    <button class="btn primary block lg" id="go" style="margin-top:18px">Kezdjük</button>`);
  const go = $('#go'); go.focus({ preventScroll: true }); go.onclick = nextStep;
}

function renderIntro(item) {
  const core = stripArticle(norm(item.it));
  const ex = item.k === 'w' ? item.unit.items.find(i => i.k === 's' && norm(i.it).split(' ').includes(core.split(' ')[0])) : null;
  sessionShell(`<div class="task-kind"><span class="pill new">Új</span>${item.k === 's' ? 'mondat' : 'kifejezés'}</div>`, `
    <section class="tile-frame word-card"><div class="tile-inner">
      <div class="big" lang="it">${esc(item.it)}</div>
      <div class="mean">${esc(item.hu)}</div>
      <div class="tools">${playBtn(item.it)}${playBtn(item.it, 'Lassan', '', '0.6')}
        ${srOK() && state.settings.speak ? `<button class="btn" id="practice" style="min-height:44px">${ICON.mic.replace('<svg', '<svg width="18" height="18"')} Mondd ki</button>` : ''}</div>
      <p class="heard" id="pres" style="margin-top:10px"></p>
      ${ex ? `<div class="example">${playBtn(ex.it)}<div>${IT(ex.it)}<span class="hu">${esc(ex.hu)}</span></div></div>` : ''}
    </div></section>
    <p class="hint">Hallgasd meg és mondd ki hangosan. Két feladat múlva rákérdezek.</p>
    <button class="btn primary block lg" id="go" style="margin-top:18px">Megvan</button>`);
  if (state.settings.autoplay) setTimeout(() => say(item.it, null, $('.word-card .icon-btn')), 300);
  insertAhead({ kind: 'check', id: item.id }, 2);
  const go = $('#go'); go.focus({ preventScroll: true }); go.onclick = nextStep;
  const pr = $('#practice');
  if (pr) pr.onclick = async () => {
    const out = $('#pres');
    pr.disabled = true; out.textContent = 'Hallgatlak…';
    try {
      const alts = await listenOnce();
      const best = Math.max(0, ...alts.map(a => similarity(stripAccents(norm(a)), stripAccents(norm(item.it)))));
      out.innerHTML = !alts.length ? 'Nem hallottam semmit, próbáld újra.'
        : best >= 0.85 ? '<b class="c-em">Szépen érthető.</b>'
        : `Ezt hallottam: ${IT(alts[0])}`;
      if (alts.length) chime(best >= 0.85 ? 'ok' : 'hard');
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
  const isIt = answerField === 'it';
  sessionShell(kind(step, modeText), `
    ${promptHtml}
    <div class="choices">${options.map((o, i) => `<button class="choice ${isIt ? 'is-it' : ''}" data-v="${esc(o)}" ${isIt ? 'lang="it"' : ''}><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`);
  const btns = $$('.choice');
  let answered = false;
  const answer = b => {
    if (answered) return; answered = true;
    document.removeEventListener('keydown', keys);
    const ok = b.dataset.v === item[answerField];
    btns.forEach(x => { x.disabled = true; if (x.dataset.v === item[answerField]) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    finish(item, step, { grade: ok ? 3 : 1 });
  };
  const keys = e => { const n = +e.key; if (n >= 1 && n <= btns.length) { e.preventDefault(); answer(btns[n - 1]); } };
  document.addEventListener('keydown', keys);
  btns.forEach(b => b.onclick = () => answer(b));
}

const MODES = {
  mcItHu(item, step) {
    multipleChoice(item, step, {
      modeText: 'Mit jelent?', answerField: 'hu',
      promptHtml: `<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px"><h2 class="task-q it" lang="it" style="flex:1;margin:0">${esc(item.it)}</h2>${playBtn(item.it)}</div>`
    });
    if (state.settings.autoplay) say(item.it);
  },
  mcHuIt(item, step) {
    multipleChoice(item, step, { modeText: 'Hogy mondod olaszul?', answerField: 'it', promptHtml: `<h2 class="task-q">${esc(item.hu)}</h2>` });
  },
  listenMc(item, step) {
    multipleChoice(item, step, {
      modeText: 'Mit hallasz?', answerField: 'hu',
      promptHtml: `<div class="listen-stage"><div class="row">${playBtn(item.it, 'Lejátszás', 'lg')}${playBtn(item.it, 'Lassan', '', '0.6')}</div></div>`
    });
    setTimeout(() => say(item.it, null, $('.icon-btn.lg')), 250);
  },
  tiles(item, step) {
    beginExercise(item);
    const words = item.it.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    const extra = shuffle(item.unit.items.filter(i => i.k === 'w').flatMap(i => i.it.split(/\s+/)))
      .filter((w, i, a) => !words.map(norm).includes(norm(w)) && a.indexOf(w) === i)
      .slice(0, Math.min(3, Math.ceil(words.length / 2)));
    const tiles = shuffle(words.concat(extra)).map((w, i) => ({ w, i }));
    sessionShell(kind(step, 'Rakd ki olaszul'), `
      <h2 class="task-q">${esc(item.hu)}</h2>
      <div class="tiles-answer" id="ans" aria-label="Válaszod"></div>
      <div class="tiles-pool" id="pool">${tiles.map(t => `<button class="wtile" lang="it" data-i="${t.i}">${esc(t.w)}</button>`).join('')}</div>
      <button class="btn primary block lg" id="check" disabled>Ellenőrzés</button>`);
    const ans = $('#ans'), pool = $('#pool'), check = $('#check');
    const chosen = [];
    const redraw = () => {
      ans.innerHTML = chosen.map(t => `<button class="wtile" lang="it" data-c="${t.i}">${esc(t.w)}</button>`).join('');
      $$('.wtile', pool).forEach(b => { const u = chosen.some(t => t.i === +b.dataset.i); b.classList.toggle('used', u); b.tabIndex = u ? -1 : 0; });
      check.disabled = !chosen.length;
    };
    pool.onclick = e => { const b = e.target.closest('.wtile'); if (!b || b.classList.contains('used')) return; chosen.push(tiles.find(t => t.i === +b.dataset.i)); redraw(); };
    ans.onclick = e => { const b = e.target.closest('.wtile'); if (!b) return; chosen.splice(chosen.findIndex(t => t.i === +b.dataset.c), 1); redraw(); };
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
    sessionShell(kind(step, 'Mondd ki olaszul'), `
      <h2 class="task-q">${esc(item.hu)}</h2>
      <div class="listen-stage">
        <button class="icon-btn lg" id="mic" aria-label="Felvétel indítása">${ICON.mic}</button>
        <p class="heard" id="heard">Nyomd meg, és mondd ki.</p>
      </div>
      <button class="btn quiet block" id="cant">Most nem tudok beszélni</button>`);
    const mic = $('#mic'), heard = $('#heard');
    $('#cant').onclick = () => { session.noSpeak = true; typedExercise(item, step, false); };
    mic.onclick = async () => {
      mic.classList.add('rec'); mic.disabled = true; heard.textContent = 'Hallgatlak…';
      let alts = [];
      try { alts = await listenOnce(); }
      catch (e) {
        mic.classList.remove('rec'); mic.disabled = false;
        heard.textContent = e === 'not-allowed' ? 'Nincs mikrofon-engedély, gépelésre váltok.' : 'Hiba történt, próbáld újra.';
        if (e === 'not-allowed') { session.noSpeak = true; setTimeout(() => typedExercise(item, step, false), 900); }
        return;
      }
      mic.classList.remove('rec');
      if (!alts.length) { mic.disabled = false; heard.textContent = 'Nem hallottam semmit, próbáld újra.'; return; }
      const targets = [item.it].concat(item.alt || []).map(t => stripAccents(norm(t)));
      const best = alts.map(a => ({ a, s: Math.max(...targets.map(t => similarity(stripAccents(norm(a)), t))) })).sort((x, y) => y.s - x.s)[0];
      heard.innerHTML = `Ezt hallottam: ${IT(best.a)}`;
      $('#cant').remove();
      const grade = best.s >= 0.85 ? 3 : best.s >= 0.6 ? 2 : 1;
      finish(item, step, {
        grade, given: best.a, override: 'Jól mondtam, elfogadom',
        note: grade === 2 ? 'Érthető, de nem pontos. Hallgasd meg és ismételd el.' : grade === 1 ? 'A felismerő is tévedhet. Ha szerinted jó volt, fogadd el.' : null
      });
    };
  }
};

function typedExercise(item, step, dictation) {
  beginExercise(item);
  const accents = ['à', 'è', 'é', 'ì', 'ò', 'ù'];
  const needsArt = item.k === 'w' && ARTICLE_RE.test(norm(item.it));
  sessionShell(kind(step, dictation ? 'Írd le, amit hallasz' : needsArt ? 'Írd le olaszul, névelővel' : 'Írd le olaszul'), `
    ${dictation
      ? `<div class="listen-stage"><div class="row">${playBtn(item.it, 'Lejátszás', 'lg')}${playBtn(item.it, 'Lassan', '', '0.6')}</div></div>`
      : `<h2 class="task-q">${esc(item.hu)}</h2>`}
    <form id="f" autocomplete="off">
      <input class="answer-input" id="inp" lang="it" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Válaszod olaszul" aria-label="Válaszod olaszul">
      <div class="accents">${accents.map(a => `<button type="button" data-a="${a}" aria-label="${a} beszúrása">${a}</button>`).join('')}</div>
      <div class="input-actions"><button type="button" class="btn quiet" id="idk">Nem tudom</button><button class="btn primary lg" id="check">Ellenőrzés</button></div>
    </form>`);
  const inp = $('#inp'), f = $('#f');
  setTimeout(() => inp.focus({ preventScroll: true }), 60);
  if (dictation) setTimeout(() => say(item.it, null, $('.icon-btn.lg')), 300);
  $('.accents', f).onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const s = inp.selectionStart ?? inp.value.length, en = inp.selectionEnd ?? s;
    inp.value = inp.value.slice(0, s) + b.dataset.a + inp.value.slice(en);
    inp.focus(); inp.setSelectionRange(s + 1, s + 1);
  };
  let done = false;
  const submit = given => {
    if (done) return; done = true;
    const res = given === null ? { grade: 1 } : evaluate(given, item);
    if (res.grade === 3 && Date.now() - session.t0 < 2500 + 150 * item.it.length) res.grade = 4;
    inp.readOnly = true; inp.blur(); inp.classList.add(res.grade >= 2 ? 'right' : 'wrong');
    $('.accents', f).remove(); $('.input-actions', f).remove();
    finish(item, step, Object.assign(res, { given, override: given ? 'Elírás volt, elfogadom' : null }));
  };
  f.onsubmit = e => { e.preventDefault(); if (!inp.value.trim()) return inp.focus(); submit(inp.value); };
  $('#idk').onclick = () => submit(null);
}

function renderSummary() {
  const s = session;
  const acc = s.rated ? Math.round(100 * s.correct / s.rated) : 100;
  const mins = Math.max(1, Math.round((Date.now() - s.started) / 60000));
  const tomorrow = Object.values(state.cards).filter(c => c.due <= today() + 1).length;
  session = null;
  document.body.classList.remove('in-session');
  closeSheet();
  chime('done');
  const line = acc >= 90 ? 'Ottimo lavoro.' : acc >= 70 ? 'Bel lavoro.' : 'Avanti così.';
  const sub = acc >= 90 ? 'Szinte minden elsőre ment. Az ütemező ennek megfelelően ritkítja az ismétléseket.'
    : acc >= 70 ? 'Jó tempó. A hibás szavak hamarabb jönnek vissza, így rögzülnek.'
    : 'Sok volt az új vagy nehéz anyag. Holnap kevesebb újat érdemes felvenni.';
  app.innerHTML = `
    <section class="finale">
      <div class="tile-frame"><div class="tile-inner"><span><b>${acc}%</b><small>elsőre jó</small></span></div></div>
      <h1 lang="it">${line}</h1>
      <p>${sub}</p>
      <div class="finale-stats">
        <div><b class="c-em">${s.newCount}</b><span>új kifejezés</span></div>
        <div><b class="c-sa">${mins}</b><span>perc</span></div>
        <div><b class="c-go">${streak()}</b><span>napos sorozat</span></div>
      </div>
      <p class="small" style="margin:-8px auto 22px;color:var(--muted)">Holnapra ${tomorrow} ismétlés esedékes${s.best >= 5 ? `, a leghosszabb jó sorozatod ma ${s.best} volt` : ''}.</p>
      <button class="btn primary block lg" id="home">Kész</button>
    </section>`;
  $('#home').onclick = () => show('home');
}

/* ---------- Tananyag ---------- */
function renderLibrary(openId) {
  const cu = currentUnit();
  const open = openId || cu.id;
  app.innerHTML = `
    <div class="section-h" style="margin-top:6px"><h2>Tananyag</h2><span>${ORDER.length} kifejezés</span></div>
    <div class="legend">
      <span><span class="lvl"><i></i><i></i><i></i></span>új</span>
      <span><span class="lvl l1"><i></i><i></i><i></i></span>tanulod</span>
      <span><span class="lvl l2"><i></i><i></i><i></i></span>rögzül</span>
      <span><span class="lvl l3"><i></i><i></i><i></i></span>tartós</span>
    </div>
    ${PACK.units.map((u, ui) => {
      const started = u.items.filter(i => state.cards[i.id]).length;
      const cls = started === u.items.length ? 'done' : u === cu ? 'now' : started ? 'started' : 'locked';
      const head = ui === 0 || PACK.units[ui - 1].level !== u.level ? `<div class="level-h"><span>${u.level}</span>${u.level === 'A1' ? 'Alapok' : 'Haladó kezdő'}</div>` : '';
      return head + `<details class="unit" id="u-${u.id}" ${u.id === open ? 'open' : ''}>
        <summary class="stop-row ${cls}" style="padding:12px 16px">
          <span class="medal">${cls === 'done' ? ICON.check.replace('stroke-width="3"', 'stroke-width="3" width="20" height="20"') : u.index + 1}</span>
          <span class="stop-txt">${IT(u.title)}<span class="hu">${esc(u.hu)}</span></span>
          <span class="stop-meta">${started}/${u.items.length}</span>
        </summary>
        <div class="unit-body">
          <div class="unit-actions">
            <button class="btn" data-grammar="${u.id}">Nyelvtan</button>
            ${u === cu ? '' : started < u.items.length ? `<button class="btn quiet" data-focus="${u.id}">Ezzel folytatom</button>` : ''}
          </div>
          ${u.items.map(i => `<div class="item-row"><span class="lvl l${level(state.cards[i.id])}" title="${['új', 'tanulod', 'rögzül', 'tartós'][level(state.cards[i.id])]}"><i></i><i></i><i></i></span>
            <div>${IT(i.it)}<span class="hu">${esc(i.hu)}</span></div>${playBtn(i.it)}</div>`).join('')}
        </div>
      </details>`;
    }).join('')}`;
  $$('[data-grammar]').forEach(b => b.onclick = () => showGrammar(PACK.units.find(u => u.id === b.dataset.grammar), () => show('library', b.dataset.grammar)));
  $$('[data-focus]').forEach(b => b.onclick = () => { state.focus = b.dataset.focus; saveState(); show('home'); });
  if (openId) setTimeout(() => { const el = $('#u-' + openId); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
}

/* ---------- Haladás ---------- */
const WD = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
const weekday = idx => new Date(idx * DAY + 12 * 3600000).getUTCDay();

function renderStats() {
  const t = today();
  const cards = Object.values(state.cards);
  const cut = Date.now() - 30 * DAY;
  const reviews30 = state.log.filter(l => l[0] >= cut && !l[3]);
  const retention = reviews30.length ? Math.round(100 * reviews30.filter(l => l[2] >= 2).length / reviews30.length) : null;
  const forecast = Array.from({ length: 7 }, (_, i) => cards.filter(c => i === 0 ? c.due <= t : c.due === t + i).length);
  const fmax = Math.max(1, ...forecast);
  const mature = cards.filter(c => c.s >= 21).length;

  const WEEKS = 16;
  const start = t - ((weekday(t) + 6) % 7) - (WEEKS - 1) * 7;
  const heat = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const d = start + i, n = state.days[d] || 0;
    const h = d > t ? 'future' : n >= 60 ? 'h4' : n >= 30 ? 'h3' : n >= 10 ? 'h2' : n > 0 ? 'h1' : '';
    return `<i class="${h} ${d === t ? 'today' : ''}" title="${n} válasz"></i>`;
  }).join('');
  const activeDays = Object.keys(state.days).filter(d => +d > t - 30 && state.days[d]).length;

  app.innerHTML = `
    <div class="section-h" style="margin-top:6px"><h2>Haladás</h2><span>${activeDays} aktív nap az elmúlt 30-ból</span></div>
    <div class="stat-hero">
      <div><b class="c-sa">${cards.length}</b><span>elkezdett kifejezés a ${ORDER.length}-ból</span></div>
      <div><b class="c-em">${mature}</b><span>tartós tudás (3+ hét)</span></div>
      <div><b class="${retention != null && retention < state.settings.targetR * 100 - 5 ? 'c-bu' : 'c-sa'}">${retention == null ? '–' : retention + '%'}</b><span>megtartás 30 nap alatt, cél ${Math.round(state.settings.targetR * 100)}%</span></div>
      <div><b class="c-go">${streak()}</b><span>napos sorozat</span></div>
    </div>

    <div class="section-h"><h2>Gyakorlás</h2><span>utolsó ${WEEKS} hét</span></div>
    <div class="panel">
      <div class="heat" aria-label="Napi aktivitás hőtérképe">${heat}</div>
      <div class="heat-legend">kevés <i style="background:var(--surface)"></i><i style="background:var(--h1)"></i><i style="background:var(--h2)"></i><i style="background:var(--h3)"></i><i style="background:var(--h4)"></i> sok</div>
    </div>

    <div class="section-h"><h2>Előttünk álló hét</h2><span>esedékes ismétlések</span></div>
    <div class="panel">
      <div class="bars">${forecast.map((v, i) => `<div class="b ${i === 0 ? 'now' : ''}"><em>${v || ''}</em><i style="height:${Math.round(100 * v / fmax)}%"></i><small>${i === 0 ? 'ma' : WD[weekday(t + i)]}</small></div>`).join('')}</div>
    </div>

    <div class="section-h"><h2>Hogyan olvasd</h2></div>
    <p class="explain">A <b>megtartás</b> azt mutatja, az ismétlések hány százalékánál emlékeztél (a nehezen felidézett is számít). Ha tartósan a cél felett vagy, vehetsz fel több újat. Ha alatta, vegyél fel kevesebbet. Egy kifejezés akkor <b>tartós</b>, ha három hét szünet után is 90% eséllyel tudod.</p>`;
}

/* ---------- Beállítások ---------- */
function renderSettings() {
  const st = state.settings;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-k="${key}" data-v="${v}" aria-pressed="${String(st[key]) === String(v)}">${l}</button>`).join('')}</div>`;
  const sw = key => `<label class="switch"><input type="checkbox" data-k="${key}" ${st[key] ? 'checked' : ''}><span></span></label>`;
  app.innerHTML = `
    <div class="section-h" style="margin-top:6px"><h2>Beállítások</h2></div>
    ${!itVoice ? '<div class="notice">A leckék hangja felvételről szól, az mindenhol működik. A beszélgetőtárs szabad mondatait viszont a telefon felolvasója mondja, és ezen az eszközön nem találtam olasz hangot. Androidon a Google Speech Services, iPhone-on a Beállítások → Kisegítő lehetőségek → Felolvasott tartalom → Hangok menüben tölthetsz le olaszt.</div>' : ''}
    ${!srOK() ? '<div class="notice">Ez a böngésző nem ismeri fel a beszédet, ezért a kimondós feladatok kimaradnak. Chrome-ban és Safariban működik.</div>' : ''}
    <div class="panel">
      <div class="setting"><label>Megjelenés</label>${seg('theme', [['dark', 'Sötét'], ['light', 'Világos'], ['system', 'Rendszer']])}</div>
      <div class="setting"><label>Új kifejezés naponta<span class="sub">8-cal kb. 15 perc/nap hosszú távon</span></label>${seg('newPerDay', [[5, '5'], [8, '8'], [12, '12'], [20, '20']])}</div>
      <div class="setting"><label>Megtartási cél<span class="sub">Magasabb cél, több ismétlés</span></label>${seg('targetR', [[0.85, '85%'], [0.9, '90%'], [0.95, '95%']])}</div>
      <div class="setting"><label>Felolvasás tempója</label>${seg('rate', [[0.75, 'Lassú'], [0.9, 'Közepes'], [1, 'Élő']])}</div>
      <div class="setting"><label>Automatikus felolvasás</label>${sw('autoplay')}</div>
      <div class="setting"><label>Kimondós feladatok<span class="sub">Mikrofon kell hozzá</span></label>${sw('speak')}</div>
      <div class="setting"><label>Hangjelzés válasz után</label>${sw('sound')}</div>
    </div>

    <div class="section-h"><h2>Hogyan működik</h2></div>
    <ol class="how">
      <li><b>Ütemezés:</b> FSRS-4.5, ugyanaz az algoritmus, mint az Ankiban. Minden kifejezést akkor hoz vissza, amikor a beállított eséllyel még emlékszel rá.</li>
      <li><b>Nehezedő feladatok:</b> ahogy egy szó erősödik, a választásból kirakás, gépelés, diktálás, végül kimondás lesz.</li>
      <li><b>Hibák:</b> a rossz válasz pár feladat múlva könnyebb formában visszajön. Ékezet- és névelőhiba félig jónak számít.</li>
      <li><b>Adatok:</b> minden a böngésződben marad. Eszközváltáshoz exportáld, majd importáld.</li>
    </ol>

    <div class="section-h"><h2>Adatok</h2></div>
    <div class="panel" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" id="exp">Haladás exportálása</button>
      <label class="btn" style="cursor:pointer">Importálás<input type="file" id="imp" accept="application/json" hidden></label>
      <button class="btn danger" id="reset" style="margin-left:auto">Haladás törlése</button>
    </div>
    <div class="section-h"><h2>Beszélgetőtárs</h2></div>
    <div class="panel">${keyForm()}</div>
    <p class="foot">Viva Voce, olasz A1–A2, ${ORDER.length} kifejezés</p>`;
  bindKeyForm(() => renderSettings());
  $$('.seg button').forEach(b => b.onclick = () => {
    st[b.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; saveState();
    if (b.dataset.k === 'theme') applyTheme();
    $$(`.seg button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
    if (b.dataset.k === 'rate') say('Ciao, come stai?');
  });
  $$('input[type=checkbox][data-k]').forEach(c => c.onchange = () => { st[c.dataset.k] = c.checked; saveState(); if (c.dataset.k === 'sound' && c.checked) chime('ok'); });
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
      state = loadState(); paintStreak(); applyTheme(); show('home');
    } catch (err) { alert('Ez a fájl nem Viva Voce mentés.'); }
  };
  $('#reset').onclick = () => {
    if (!confirm('Biztosan törlöd az összes haladást? Ez nem vonható vissza.')) return;
    localStorage.removeItem(STORE_KEY); state = loadState(); paintStreak(); show('home');
  };
}

/* ---------- Téma ---------- */
function applyTheme() {
  let t = state.settings.theme || 'dark';
  if (t === 'system') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  const m = $('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#0b1324' : '#f8fafc';
}

/* ---------- Beszélgetőtárs (Claude API, a felhasználó saját kulcsával) ---------- */
const ROLES = {
  u1: 'Egy római bárban megismerkedsz valakivel',
  u2: 'Rendelsz a kávézóban, a barista kiszolgál',
  u3: 'Egy baráttal egyeztetsz időpontot',
  u4: 'Jegyet veszel a Termini pályaudvaron',
  u5: 'Vacsorázol egy trattoriában, a pincér kiszolgál',
  u6: 'Vásárolsz a piacon, az árus alkudozik',
  u7: 'Első megbeszélés egy olasz ügyféllel',
  u8: 'Utat kérdezel egy járókelőtől',
  u9: 'Hétvégi programot terveztek egy baráttal',
  u10: 'Egy barát a múlt hétvégédről kérdez',
  u11: 'Egy kolléga a napi rutinodról kérdez',
  u12: 'Egy idős olasz néni a gyerekkoráról mesél, te kérdezel',
  u13: 'Szívességet kérsz a szálloda recepcióján',
  u14: 'Egy barát a jövő évi terveidről kérdez',
  u15: 'Telefonon egyeztetsz egy olasz cég asszisztensével',
  u16: 'Orvosnál vagy, elmondod a panaszaidat',
  u17: 'Egy kollégával vitatkoztok egy új ötletről',
  u18: 'Sztrájk van, az ügyintézővel intézed a visszatérítést'
};
const getKey = () => { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } };
let talk = null; // { unit, msgs: [{role, content}], view: [...] }

function keyForm() {
  const has = !!getKey();
  return has
    ? `<div class="setting"><label>Claude API-kulcs<span class="sub">Csak ebben a böngészőben van elmentve, az exportba nem kerül bele.</span></label><button class="btn danger" id="keyDel">Kulcs törlése</button></div>`
    : `<p class="explain" style="margin-bottom:12px">A beszélgetéshez saját Claude API-kulcs kell (<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style="color:var(--sapphire)">console.anthropic.com</a>). A kulcs csak ebben a böngészőben tárolódik, a kérések közvetlenül az Anthropichoz mennek. Egy 10 perces beszélgetés a Haiku modellel jellemzően 1 cent alatti.</p>
       <form id="keyForm" class="key-form"><input class="answer-input key-input" id="keyInp" type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" aria-label="Claude API-kulcs"><button class="btn primary">Mentés</button></form>
       <p class="heard small-err" id="keyErr"></p>`;
}
function bindKeyForm(after) {
  const del = $('#keyDel');
  if (del) del.onclick = () => { if (!confirm('Törlöd az API-kulcsot ebből a böngészőből?')) return; try { localStorage.removeItem(KEY_STORE); } catch (e) {} after(); };
  const f = $('#keyForm');
  if (f) f.onsubmit = e => {
    e.preventDefault();
    const v = $('#keyInp').value.trim();
    if (!/^sk-ant-/.test(v)) { $('#keyErr').textContent = 'Ez nem Claude API-kulcsnak tűnik (sk-ant- kezdetű).'; return; }
    try { localStorage.setItem(KEY_STORE, v); } catch (err) {}
    after();
  };
}

function renderTalk() {
  if (talk) return renderChat();
  const key = getKey();
  const started = PACK.units.filter(u => u.items.some(i => state.cards[i.id]));
  const cu = currentUnit();
  const avail = started.length ? started : [cu];
  app.innerHTML = `
    <section class="tile-frame"><div class="tile-inner">
      <h1 class="greeting" lang="it">Parliamo!</h1>
      <p class="greeting-hu">Beszéljünk!</p>
      <p class="explain" style="margin-top:14px">Valós helyzetet játszol el egy olasz partnerrel, a már tanult szavaiddal. Minden válaszod után megmutatja, hogyan mondanád helyesen, és miért. Beszélhetsz vagy gépelhetsz.</p>
    </div></section>
    ${key ? `
      <div class="section-h"><h2>Válassz helyzetet</h2><span>${avail.length} elérhető</span></div>
      <div class="scenes">
        ${avail.map(u => `<button class="scene" data-u="${u.id}"><span class="lvl-tag">${u.level}</span><span class="scene-t">${IT(u.title)}<span class="hu">${esc(ROLES[u.id] || u.hu)}</span></span></button>`).join('')}
        <button class="scene" data-u="free"><span class="lvl-tag">${cu.level}</span><span class="scene-t">${IT('Chiacchierata libera')}<span class="hu">Szabad beszélgetés bármiről</span></span></button>
      </div>
      ${started.length < PACK.units.length ? `<p class="hint">Minden elkezdett lecke új helyzetet nyit meg.</p>` : ''}`
    : `<div class="section-h"><h2>Beállítás</h2></div><div class="panel">${keyForm()}</div>`}`;
  if (!key) return bindKeyForm(renderTalk);
  $$('.scene').forEach(b => b.onclick = () => startTalk(b.dataset.u));
}

function knownVocab(limit = 120) {
  const ids = ORDER.filter(id => state.cards[id]);
  return (ids.length ? ids : currentUnit().items.map(i => i.id)).slice(-limit).map(id => ITEMS[id].it);
}

function systemPrompt(u) {
  const level = u ? u.level : currentUnit().level;
  const scene = u ? `${ROLES[u.id] || u.hu} (lesson theme: ${u.title} / ${u.hu}). Play the Italian counterpart in this situation.` : 'A relaxed free chat with a friendly Italian from Bologna. You pick everyday topics.';
  return `You are a warm, natural Italian conversation partner inside a language-learning app. The learner is a Hungarian speaker at CEFR level ${level}.
Scene: ${scene}
Respond ONLY with one JSON object and nothing else:
{"reply": "...", "hu": "...", "correction": null, "hints": ["...", "..."]}
- reply: your next line in Italian, in character, 1–2 short sentences at ${level} level. Prefer words the learner knows: ${knownVocab().join(', ')}. Usually end with a question so the conversation continues.
- hu: Hungarian translation of reply.
- correction: if the learner's LAST message contains a grammar, vocabulary, accent or spelling mistake (ignore capitalisation and punctuation), return {"fixed": "<the full corrected Italian sentence>", "why": "<one short explanation in Hungarian>"}. If the learner wrote in Hungarian or English, put the Italian version in fixed and why = "Így mondanád olaszul.". If it was correct, or there is no learner message yet, use null.
- hints: two short, different things the learner could say next, in Italian, at their level.
Stay in character. Never break the JSON format.`;
}

function startTalk(uid) {
  const u = uid === 'free' ? null : PACK.units.find(x => x.id === uid);
  talk = { unit: u, msgs: [{ role: 'user', content: '(A jelenet kezdődik. Szólalj meg először.)' }], view: [], busy: false, hints: [] };
  document.body.classList.add('in-session');
  renderChat();
  askClaude();
}

function parseReply(text) {
  try { const m = text.match(/\{[\s\S]*\}/); const o = JSON.parse(m ? m[0] : text); if (o.reply) return o; } catch (e) {}
  return { reply: text.trim(), hu: '', correction: null, hints: [] };
}

async function askClaude() {
  talk.busy = true; paintChat();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': getKey(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: AI_MODEL, max_tokens: 700, system: systemPrompt(talk.unit), messages: talk.msgs })
    });
    if (!res.ok) {
      const msg = res.status === 401 ? 'Az API-kulcs érvénytelen. Ellenőrizd a Beállításokban.'
        : res.status === 429 || res.status === 529 ? 'A szolgáltatás most túlterhelt. Várj pár másodpercet, és küldd újra.'
        : res.status === 400 ? 'A kérés hibás volt (lehet, hogy elfogyott a keret a fiókodon).'
        : `Hiba történt (${res.status}).`;
      throw new Error(msg);
    }
    const data = await res.json();
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    talk.msgs.push({ role: 'assistant', content: text });
    const o = parseReply(text);
    const lastUser = [...talk.view].reverse().find(v => v.who === 'me');
    if (lastUser && o.correction && o.correction.fixed && norm(o.correction.fixed) !== norm(lastUser.text)) lastUser.fix = o.correction;
    else if (lastUser) lastUser.ok = true;
    talk.view.push({ who: 'ai', text: o.reply, hu: o.hu });
    talk.hints = Array.isArray(o.hints) ? o.hints.slice(0, 3) : [];
    talk.busy = false;
    paintChat();
    if (state.settings.autoplay) say(o.reply, null, $('.bubble.ai:last-of-type .icon-btn'));
  } catch (e) {
    talk.busy = false;
    talk.error = e.message && !/fetch/i.test(e.message) ? e.message : 'Nincs kapcsolat. Ellenőrizd a netet.';
    paintChat();
  }
}

function sendTalk(text) {
  text = text.trim();
  if (!text || talk.busy) return;
  talk.error = null;
  talk.view.push({ who: 'me', text });
  talk.msgs.push({ role: 'user', content: text });
  const d = today(); state.days[d] = (state.days[d] || 0) + 1; saveState(); paintStreak();
  askClaude();
}

function renderChat() {
  const u = talk.unit;
  app.innerHTML = `
    <div class="session-bar">
      <button class="quit" id="quit" aria-label="Beszélgetés vége">${ICON.x}</button>
      <div class="chat-title">${IT(u ? u.title : 'Chiacchierata libera')}<span class="hu">${esc(u ? ROLES[u.id] || u.hu : 'Szabad beszélgetés')}</span></div>
    </div>
    <div class="chat" id="chat"></div>
    <div class="composer">
      <div class="hints" id="hints"></div>
      <form id="cf" class="cf" autocomplete="off">
        ${srOK() && state.settings.speak ? `<button type="button" class="icon-btn" id="cmic" aria-label="Diktálás olaszul">${ICON.mic}</button>` : ''}
        <input class="answer-input" id="cin" lang="it" autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Írj vagy mondd olaszul" aria-label="Üzenet olaszul">
        <button class="btn primary" id="csend" aria-label="Küldés">Küldés</button>
      </form>
    </div>`;
  $('#quit').onclick = () => { talk = null; stopAudio(); show('talk'); };
  $('#cf').onsubmit = e => { e.preventDefault(); const i = $('#cin'); sendTalk(i.value); i.value = ''; };
  const mic = $('#cmic');
  if (mic) mic.onclick = async () => {
    mic.classList.add('rec-small'); mic.disabled = true;
    try { const a = await listenOnce(); if (a[0]) $('#cin').value = a[0]; } catch (e) { /* nincs mikrofon */ }
    mic.classList.remove('rec-small'); mic.disabled = false; $('#cin').focus();
  };
  paintChat();
}

function paintChat() {
  const chat = $('#chat'); if (!chat) return;
  chat.innerHTML = talk.view.map((m, i) => m.who === 'ai'
    ? `<div class="bubble ai">${playBtn(m.text)}<div><p class="it" lang="it">${esc(m.text)}</p>${m.hu ? `<details class="tr"><summary>Fordítás</summary><p class="hu">${esc(m.hu)}</p></details>` : ''}</div></div>`
    : `<div class="bubble me"><p lang="it">${esc(m.text)}</p>${m.fix ? `<div class="fix"><span class="fix-l">Helyesen:</span> ${IT(m.fix.fixed)} ${playBtn(m.fix.fixed, 'Meghallgatom', 'sm')}<p>${esc(m.fix.why || '')}</p></div>` : m.ok ? '<div class="okmark">✓ Helyes</div>' : ''}</div>`
  ).join('') + (talk.busy ? '<div class="bubble ai typing"><i></i><i></i><i></i></div>' : '')
    + (talk.error ? `<div class="notice">${esc(talk.error)} <button class="btn quiet" id="retry">Újra</button></div>` : '');
  const r = $('#retry'); if (r) r.onclick = () => { talk.error = null; askClaude(); };
  const h = $('#hints');
  if (h) {
    h.innerHTML = talk.hints.length && !talk.busy ? `<span class="hint-l">Ötlet:</span>${talk.hints.map(x => `<button class="chip" lang="it">${esc(x)}</button>`).join('')}` : '';
    $$('.chip', h).forEach(c => c.onclick = () => { $('#cin').value = c.textContent; $('#cin').focus(); });
  }
  $('#csend') && ($('#csend').disabled = talk.busy);
  requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
}

/* ---------- Indítás ---------- */
(async function init() {
  try { await loadPack(); }
  catch (e) {
    app.innerHTML = '<div class="notice">A tananyag nem töltődött be. Ha a fájlt közvetlenül nyitottad meg, indíts helyi szervert (lásd README), vagy használd a GitHub Pages címet.</div>';
    return;
  }
  paintStreak();
  applyTheme();
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (state.settings.theme === 'system') applyTheme(); });
  show('home');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
