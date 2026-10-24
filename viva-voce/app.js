/* Viva Voce — app logika. Nincs build lépés, nincs függőség. */
'use strict';

const STORE_KEY = 'vivavoce.v1';
const PACK_URL = 'data/it.json?v=6';
const KEY_STORE = 'vivavoce.apikey';
const AI_MODEL = 'claude-haiku-5-5';
const { review: fsrsReview, retrievability, dayIndex, DAY } = window.FSRS;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $('#app');
const sheet = $('#sheet');

/* ---------- Állapot ---------- */
const DEFAULT_SETTINGS = { newPerDay: 8, targetR: 0.9, rate: 0.9, speak: true, autoplay: true, sound: true, reviewLimit: 150, theme: 'dark', goalMin: 10, remindAt: '19:00' };
let state = loadState();
let PACK = null, ITEMS = {}, ORDER = [];
let session = null;
let talk = null;

function loadState() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { s = {}; }
  return {
    cards: s.cards || {}, log: s.log || [], days: s.days || {}, focus: s.focus || null, stamps: s.stamps || {},
    time: s.time || {}, stories: s.stories || {}, drill: s.drill || {}, goalHit: s.goalHit || {},
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
const IT = (s, tag = 'span') => `<${tag} class="it" lang="it">${esc(s)}</${tag}>`;

/* Illusztrációk: a Higgsfield CDN-ről, kicsi WebP a listákhoz, teljes PNG a nagy képekhez */
const imgUrl = (base, big) => base + (big ? '.png' : '_min.webp');
function art(base, { big = false, cls = '', eager = false } = {}) {
  if (!base) return `<div class="art ${cls}"></div>`;
  return `<div class="art ${cls}"><img src="${imgUrl(base, big)}" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${imgUrl(base, !big)}'}else{this.remove()}"></div>`;
}

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

/* ---------- Hang ----------
   A tananyag minden kifejezéséhez előre felvett hangfájl tartozik (audio/<nyelv>/<id>.mp3, Kokoro neurális hang).
   Ez minden telefonon szól, a némító kapcsoló sem némítja. A böngésző felolvasója csak az AI-beszélgetés
   szabad szövegeihez kell, tartaléknak. */
let itVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const it = speechSynthesis.getVoices().filter(v => /^it([-_]|$)/i.test(v.lang));
  itVoice = it.find(v => /google|natural|premium|enhanced|neural|alice|federica|luca/i.test(v.name)) || it[0] || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

const AUDIO_URL = {}; // olasz szöveg → hangfájl
const player = new Audio();
player.preload = 'auto';
let playerBtn = null;
let actx = null;
const clearSpeaking = () => { if (playerBtn) playerBtn.classList.remove('speaking'); playerBtn = null; };
player.addEventListener('ended', clearSpeaking);

function stopAudio() {
  try { player.pause(); } catch (e) {}
  clearSpeaking();
  if ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
}

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
  const url = AUDIO_URL[text];
  if (url) {
    player.src = url;
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

function chime(kind) {
  if (navigator.vibrate) navigator.vibrate(kind === 'bad' ? [30, 40, 30] : kind === 'stamp' ? [10, 60, 40] : 12);
  if (!state.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const N = {
      ok: [[659.25, 0], [987.77, .09]],
      hard: [[587.33, 0], [739.99, .09]],
      bad: [[220, 0], [174.6, .1]],
      done: [[523.25, 0], [659.25, .1], [783.99, .2], [1046.5, .32]],
      stamp: [[130.8, 0], [523.25, .12], [783.99, .22], [1046.5, .34], [1318.5, .46]]
    }[kind] || [];
    const t0 = actx.currentTime;
    for (const [f, d] of N) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'bad' || (kind === 'stamp' && d === 0) ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0 + d);
      g.gain.linearRampToValueAtTime(kind === 'bad' ? .12 : .15, t0 + d + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + d + .4);
      o.connect(g).connect(actx.destination);
      o.start(t0 + d); o.stop(t0 + d + .45);
    }
  } catch (e) { /* nincs hang */ }
}

const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  slow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h13a4 4 0 0 0 4-4V9"/><path d="M5 17c0-4 2.5-7 6-7s5 2.5 5 5"/><circle cx="20" cy="7" r="2"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
};
const playBtn = (text, label = 'Meghallgatom', cls = '', rate = '') =>
  `<button class="icon-btn ${cls}" data-say="${esc(text)}" ${rate ? `data-rate="${rate}"` : ''} aria-label="${label}" title="${label}">${rate ? ICON.slow : ICON.play}</button>`;

document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.preventDefault(); say(b.dataset.say, b.dataset.rate ? +b.dataset.rate : undefined, b); }
});

/* ---------- Pecsét (timbro): minden befejezett leckéért ---------- */
let stampSeq = 0;
function stampSvg(u, day) {
  const id = 'sp' + (++stampSeq);
  const d = day != null ? new Date(day * DAY + 12 * 3600000) : new Date();
  const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  const ring = `VIVA VOCE · LEZIONE ${u.index + 1} · ${u.level} · `.repeat(2);
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Pecsét: ${esc(u.title)}">
    <defs><path id="${id}" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/>
    <filter id="${id}r"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>
    <g filter="url(#${id}r)" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="94" stroke-width="5"/><circle cx="100" cy="100" r="86" stroke-width="1.5"/>
      <circle cx="100" cy="100" r="60" stroke-width="1.5"/>
      <text fill="currentColor" stroke="none" font-family="Instrument, sans-serif" font-size="12.5" font-weight="700" letter-spacing="1"><textPath href="#${id}" startOffset="0" textLength="458" lengthAdjust="spacing">${esc(ring)}</textPath></text>
      <text x="100" y="98" text-anchor="middle" fill="currentColor" stroke="none" font-family="Bodoni, serif" font-style="italic" font-size="${u.title.length > 14 ? 15 : 19}" font-weight="600">${esc(u.title)}</text>
      <text x="100" y="121" text-anchor="middle" fill="currentColor" stroke="none" font-family="Instrument, sans-serif" font-size="11" font-weight="600" letter-spacing="1">${date}</text>
      <path d="M70 132h60" stroke-width="1.2"/>
    </g></svg>`;
}

/* ---------- Tananyag ---------- */
let STORIES = [], VERBS = null;
async function loadPack() {
  const [p, st, vb] = await Promise.all([PACK_URL, 'data/stories-it.json?v=6', 'data/verbs-it.json?v=6'].map(u => fetch(u).then(r => r.json()).catch(() => null)));
  if (!p) throw new Error('pack');
  PACK = p;
  STORIES = st ? st.stories : [];
  VERBS = vb;
  STORIES.forEach(s => s.lines.forEach((l, i) => { if (l.it) AUDIO_URL[l.it] = AUDIO_URL[l.it] || `audio/${PACK.lang}/st/${s.id}-${i}.mp3`; }));
  if (VERBS) {
    const P = ['io', 'tu', 'lui', 'noi', 'voi', 'loro'];
    VERBS.verbs.forEach(v => Object.entries(v.forms).forEach(([t, fs]) => fs.forEach((f, i) => { AUDIO_URL[`${P[i]} ${f}`] = `audio/${PACK.lang}/vb/${v.inf}-${t}-${i}.mp3`; })));
  }
  ITEMS = {}; ORDER = [];
  PACK.units.forEach((u, ui) => {
    u.index = ui;
    u.items.forEach(it => { it.unit = u; ITEMS[it.id] = it; ORDER.push(it.id); AUDIO_URL[it.it] = `audio/${PACK.lang}/${it.id}.mp3`; });
  });
  for (const id of Object.keys(state.cards)) if (!ITEMS[id]) delete state.cards[id];
  // korábbi haladásból is járjon a pecsét
  PACK.units.forEach(u => { if (!state.stamps[u.id] && u.items.every(i => state.cards[i.id])) state.stamps[u.id] = today(); });
}

const level = c => !c ? 0 : c.s < 3 ? 1 : c.s < 21 ? 2 : 3;
const startedIn = u => u.items.filter(i => state.cards[i.id]).length;

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
  const u = ITEMS[id].unit;
  if (!state.stamps[u.id] && u.items.every(i => state.cards[i.id])) {
    state.stamps[u.id] = d;
    if (session) session.stamps.push(u);
  }
  saveState();
  paintStreak();
}

/* ---------- Navigáció ---------- */
const VIEWS = { home: renderHome, library: renderLibrary, practice: renderPractice, stats: renderStats, settings: renderSettings };
function show(view, arg) {
  if (view !== 'practice') talk = null;
  document.body.classList.remove('in-session', 'sheet-open');
  document.body.className = document.body.className.replace(/\bview-\w+/g, '').trim();
  document.body.classList.add('view-' + view);
  closeSheet();
  $$('.tabbar button').forEach(b => b.dataset.view === view ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  stopAudio();
  VIEWS[view](arg);
  window.scrollTo(0, 0);
}
$$('.tabbar button').forEach(b => b.addEventListener('click', () => show(b.dataset.view)));
function enterSession() { document.body.className = document.body.className.replace(/\bview-\w+/g, '').trim(); document.body.classList.add('in-session'); }
function closeSheet() { sheet.hidden = true; sheet.innerHTML = ''; document.body.classList.remove('sheet-open'); }

/* ---------- Főoldal ---------- */
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
  const planned = doneToday + left + Math.ceil(nl * 1.3);
  const minsToday = Math.floor((state.time[today()] || 0) / 60);
  const pct = Math.min(100, Math.round(100 * minsToday / state.settings.goalMin));
  const learned = Object.keys(state.cards).length;
  const hour = new Date().getHours();
  const greet = hour < 5 ? ['Buonanotte', 'Jó éjszakát'] : hour < 13 ? ['Buongiorno', 'Jó reggelt'] : hour < 18 ? ['Buon pomeriggio', 'Szép délutánt'] : ['Buonasera', 'Jó estét'];
  const date = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const u = currentUnit();
  const wod = wordOfDay();
  const mins = Math.max(2, Math.round(due * 0.3 + nl * 0.9));

  let plan;
  if (!learned) plan = `<div class="plan-line"><span class="plan-num">${nl}</span><span class="plan-txt">új kifejezés vár az első leckéből.<br>Kb. ${mins} perc, hanggal.</span></div>
      <button class="btn cta block lg" id="start">Kezdjük</button>`;
  else if (!left) plan = `<div class="plan-line"><span class="plan-num">✓</span><span class="plan-txt">Mára kész vagy. A szavak akkor jönnek vissza, amikor épp felejtenéd őket.</span></div>
      ${nextNewItems(1).length ? '<button class="btn block" id="extra">Még 5 új kifejezés</button>' : ''}`;
  else plan = `<div class="plan-line"><span class="plan-num">${left}</span><span class="plan-txt">${due ? `${due} ismétlés` : ''}${due && nl ? ' és ' : ''}${nl ? `${nl} új kifejezés` : ''}<br>Kb. ${mins} perc</span></div>
      <button class="btn cta block lg" id="start">Folytatás</button>`;

  app.innerHTML = `
    <section class="hero">
      ${art(PACK.hero, { big: true, eager: true })}
      <div class="hero-text">
        <p class="hero-date" lang="it">${esc(date)}</p>
        <h1 class="hero-greet" lang="it">${greet[0]}</h1>
        <p class="hero-sub">${greet[1]}</p>
        <div class="plan">${plan}
          ${learned ? `<div class="daybar"><i data-w="${pct}"></i></div><div class="daybar-l"><span>${minsToday >= state.settings.goalMin ? 'Napi cél teljesítve' : `Napi cél: ${minsToday}/${state.settings.goalMin} perc`}</span><span>${streak()} napos sorozat</span></div>` : ''}
        </div>
      </div>
    </section>

    <div class="sec-h"><h2 lang="it">La lezione</h2><span>${u.level} szint</span></div>
    <button class="feature" id="feature" aria-label="${esc(u.hu)} lecke">
      ${art(u.img, { big: true })}
      <div class="feature-body">
        <div class="feature-k"><span class="lvl-chip">${u.level}</span><span>${u.index + 1}. lecke</span></div>
        <div class="feature-t" lang="it">${esc(u.title)}</div>
        <div class="feature-hu">${esc(u.hu)}</div>
        <div class="feature-row"><span class="meter"><i style="width:${Math.round(100 * startedIn(u) / u.items.length)}%"></i></span><b>${startedIn(u)}/${u.items.length}</b></div>
      </div>
    </button>
    <div class="under-feature"><button class="btn" id="grammar">Nyelvtan</button><button class="btn quiet" id="words">Szavak</button></div>
    ${homeStoryTeaser()}

    <div class="sec-h"><h2 lang="it">Il percorso</h2><span>${Object.keys(state.stamps).length}/${PACK.units.length} pecsét</span></div>
    <div class="rail" id="rail">
      ${PACK.units.map(x => {
        const st = startedIn(x), done = !!state.stamps[x.id];
        const cls = done ? 'done' : x === u ? 'now' : st ? 'started' : 'locked';
        return `<button class="poster ${cls}" data-unit="${x.id}" aria-label="${x.index + 1}. lecke: ${esc(x.hu)}">
          <div style="position:relative">${art(x.img, { cls: cls === 'locked' ? 'dim' : '' })}
            <span class="poster-n">${x.index + 1}</span>
            ${done ? `<span class="poster-mark">${ICON.check}</span>` : st ? `<span class="poster-bar"><i style="width:${Math.round(100 * st / x.items.length)}%"></i></span>` : ''}
          </div>
          ${IT(x.title)}<span class="hu">${esc(x.hu)}</span>
        </button>`;
      }).join('')}
    </div>

    ${wod ? `<section class="quote">
      <p class="quote-k">A nap mondata</p>
      <div class="quote-row"><div>${IT(wod.it)}<span class="hu">${esc(wod.hu)}</span></div>${playBtn(wod.it)}</div>
    </section>` : ''}`;

  requestAnimationFrame(() => requestAnimationFrame(() => { const b = $('.daybar i'); if (b) b.style.width = b.dataset.w + '%'; }));
  const s = $('#start'); if (s) s.onclick = () => startSession();
  const x = $('#extra'); if (x) x.onclick = () => startSession(5);
  $('#feature').onclick = $('#words').onclick = () => show('library', u.id);
  $('#grammar').onclick = () => showGrammar(u, () => show('home'));
  $$('.poster').forEach(b => b.onclick = () => show('library', b.dataset.unit));
  const tz = $('#teaser'); if (tz) tz.onclick = () => startStory(tz.dataset.s);
  const now = $('.poster.now'); if (now) $('#rail').scrollLeft = Math.max(0, now.offsetLeft - 20);
}

function grammarHtml(u) {
  return u.grammar.map(g => `<div class="rule"><h3>${esc(g.h)}</h3><p>${esc(g.p)}</p></div>`).join('');
}
function showGrammar(u, back) {
  enterSession();
  app.innerHTML = `
    <div class="session-bar"><button class="quit" id="back" aria-label="Vissza">${ICON.back}</button></div>
    <div class="g-art art"><img src="${imgUrl(u.img, true)}" alt="" onerror="this.remove()"></div>
    <div class="grammar-head">${IT(u.title)}<span class="hu">${u.level}, ${u.index + 1}. lecke: ${esc(u.hu.toLowerCase())}</span></div>
    <div style="margin-top:8px">${grammarHtml(u)}</div>
    <button class="btn block" id="back2" style="margin-top:20px">Vissza</button>`;
  $('#back').onclick = $('#back2').onclick = back;
  window.scrollTo(0, 0);
}

/* ---------- Tanulási kör ---------- */
function startSession(extraNew = 0, only = null) {
  const due = only || dueCards();
  const news = only ? [] : nextNewItems(extraNew || newLeftToday());
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
  session = { only: !!only, queue, pos: 0, correct: 0, rated: 0, combo: 0, best: 0, noSpeak: false, newCount: news.length, started: Date.now(), stamps: [] };
  enterSession();
  nextStep();
}

function insertAhead(step, gap) { session.queue.splice(Math.min(session.queue.length, session.pos + gap), 0, step); }

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

function sessionShell(head, body, unit) {
  const steps = session.queue.filter(q => q.kind !== 'unit').length;
  const done = session.queue.slice(0, session.pos - 1).filter(q => q.kind !== 'unit').length;
  const pct = Math.round(100 * done / Math.max(1, steps));
  app.innerHTML = `
    ${unit && unit.img ? `<div class="backdrop" aria-hidden="true"><img src="${imgUrl(unit.img)}" alt="" onerror="this.remove()"></div>` : ''}
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
  const canSpeak = srOK() && state.settings.speak && !session.noSpeak;
  if (step.kind === 'retry') return isS ? 'tiles' : 'mcHuIt';
  if (step.kind === 'check' || !c) return 'mcItHu';
  let pool;
  if (c.s < 3) pool = isS ? ['tiles', 'tiles', 'listenMc'] : ['mcHuIt', 'mcItHu', 'listenMc'];
  else if (c.s < 12) pool = isS ? ['tiles', 'type', 'dictation'] : ['type', 'type', 'dictation'];
  else pool = isS ? ['type', 'dictation', canSpeak ? 'speak' : 'tiles'] : ['type', 'dictation', canSpeak ? 'speak' : 'type'];
  return pick(pool);
}

const TAG = { check: ['new', 'Új'], review: ['rev', 'Ismétlés'], retry: ['again', 'Még egyszer'] };
const kind = (step, text) => {
  const [cls, l] = TAG[step.kind] || ['rev', ''];
  return `<div class="task-kind"><span class="tag ${cls}">${l}</span>${esc(text)}</div>`;
};

function finish(item, step, res) {
  const { grade, note, given, override } = res;
  if (step.kind !== 'retry') { rate(item.id, grade); session.rated++; if (grade >= 2) session.correct++; }
  if (grade >= 2) { session.combo++; session.best = Math.max(session.best, session.combo); }
  else { session.combo = 0; insertAhead({ kind: 'retry', id: item.id }, 3); }
  const combo = $('.combo');
  if (combo) { combo.textContent = session.combo >= 3 ? '×' + session.combo : ''; combo.classList.remove('pop'); void combo.offsetWidth; if (session.combo >= 3) combo.classList.add('pop'); }

  const cls = grade >= 3 ? 'ok' : grade === 2 ? 'hard' : 'bad';
  chime(cls);
  const title = grade >= 3 ? pick(['Esatto!', 'Perfetto!', 'Bravo!', 'Giusto!', 'Ottimo!', 'Benissimo!']) : grade === 2 ? 'Quasi!' : 'Peccato…';
  const ivl = step.kind !== 'retry' && state.cards[item.id] ? state.cards[item.id].ivl : null;
  const next = grade === 1 ? 'Pár feladat múlva újra előjön.' : ivl ? `Legközelebb ${ivl === 1 ? 'holnap' : ivl + ' nap múlva'} kérdezem.` : '';
  sheet.className = `sheet ${cls}`;
  sheet.innerHTML = `<div class="wrap">
    <div class="sheet-head"><h3 lang="it">${title}</h3>${playBtn(item.it)}</div>
    <div class="sol">${IT(item.it)}<span class="hu">${esc(item.hu)}</span></div>
    ${given && grade < 3 ? `<p class="note">Te ezt adtad meg: <b lang="it">${esc(given)}</b></p>` : ''}
    ${note ? `<p class="note">${note}</p>` : ''}
    ${next ? `<p class="note">${next}</p>` : ''}
    <div class="actions">
      ${grade === 1 && override && step.kind !== 'retry' ? `<button class="btn" id="override">${esc(override)}</button>` : ''}
      <button class="btn ${cls === 'bad' ? 'bad' : 'cta'} lg" id="next">Tovább</button>
    </div></div>`;
  sheet.hidden = false;
  document.body.classList.add('sheet-open');
  if (grade < 3 && state.settings.autoplay) setTimeout(() => say(item.it, null, $('.sheet .icon-btn')), 250);
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

function renderUnitIntro(u) {
  enterSession();
  const steps = session.queue.filter(q => q.kind !== 'unit').length;
  const done = session.queue.slice(0, session.pos - 1).filter(q => q.kind !== 'unit').length;
  app.innerHTML = `
    <div class="session-bar"><button class="quit" id="quit" aria-label="Kilépés a körből">${ICON.x}</button><div class="progress"><i style="width:${Math.round(100 * done / Math.max(1, steps))}%"></i></div><span class="combo"></span></div>
    <div class="enter">
      <div class="g-art art" style="margin-top:-10px">${`<img src="${imgUrl(u.img, true)}" alt="" onerror="this.remove()">`}</div>
      <div class="task-kind"><span class="tag new">Új lecke</span>${u.level}, ${u.index + 1}. lecke</div>
      <div class="grammar-head">${IT(u.title)}<span class="hu">${esc(u.hu)}</span></div>
      <div style="margin-top:6px">${grammarHtml(u)}</div>
      <button class="btn cta block lg" id="go" style="margin-top:18px">Kezdjük</button>
    </div>`;
  $('#quit').onclick = () => { session = null; show('home'); };
  const go = $('#go'); go.focus({ preventScroll: true }); go.onclick = nextStep;
  window.scrollTo(0, 0);
}

function renderIntro(item) {
  const core = stripArticle(norm(item.it));
  const ex = item.k === 'w' ? item.unit.items.find(i => i.k === 's' && norm(i.it).split(' ').includes(core.split(' ')[0])) : null;
  sessionShell(`<div class="task-kind"><span class="tag new">Új</span>${item.k === 's' ? 'mondat' : 'kifejezés'}</div>`, `
    <section class="word-card">
      ${art(item.unit.img)}
      <div class="word-body">
        <div class="big" lang="it">${esc(item.it)}</div>
        <div class="mean">${esc(item.hu)}</div>
        <div class="tools">${playBtn(item.it)}${playBtn(item.it, 'Lassan', '', '0.6')}
          ${srOK() && state.settings.speak ? `<button class="btn" id="practice" style="min-height:44px">${ICON.mic.replace('<svg', '<svg width="18" height="18"')} Mondd ki</button>` : ''}</div>
        <p class="heard" id="pres"></p>
        ${ex ? `<div class="example">${playBtn(ex.it)}<div>${IT(ex.it)}<span class="hu">${esc(ex.hu)}</span></div></div>` : ''}
      </div>
    </section>
    <p class="hint">Hallgasd meg és mondd ki hangosan. Két feladat múlva rákérdezek.</p>
    <button class="btn cta block lg" id="go" style="margin-top:18px">Megvan</button>`, item.unit);
  if (state.settings.autoplay) setTimeout(() => say(item.it, null, $('.word-card .tools .icon-btn')), 300);
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
        : best >= 0.85 ? '<b class="c-salvia">Szépen érthető.</b>' : `Ezt hallottam: ${IT(alts[0])}`;
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
    <div class="choices">${options.map((o, i) => `<button class="choice ${isIt ? 'is-it' : ''}" data-v="${esc(o)}" ${isIt ? 'lang="it"' : ''}><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`, item.unit);
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
      promptHtml: `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:26px"><h2 class="task-q it" lang="it" style="flex:1;margin:0">${esc(item.it)}</h2>${playBtn(item.it)}</div>`
    });
    if (state.settings.autoplay) say(item.it, null, $('.enter .icon-btn'));
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
      <button class="btn cta block lg" id="check" disabled>Ellenőrzés</button>`, item.unit);
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
      <button class="btn quiet block" id="cant">Most nem tudok beszélni</button>`, item.unit);
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
      <div class="input-actions"><button type="button" class="btn quiet" id="idk">Nem tudom</button><button class="btn cta lg" id="check">Ellenőrzés</button></div>
    </form>`, item.unit);
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
  show('home');
  enterSession();
  const stamped = s.stamps[s.stamps.length - 1];
  chime(stamped ? 'stamp' : 'done');
  const line = stamped ? 'Timbro!' : acc >= 90 ? 'Ottimo lavoro.' : acc >= 70 ? 'Bel lavoro.' : 'Avanti così.';
  const sub = stamped ? `Befejezted a(z) ${stamped.index + 1}. leckét, a pecsét bekerült az útleveledbe.`
    : acc >= 90 ? 'Szinte minden elsőre ment. Az ütemező ennek megfelelően ritkítja az ismétléseket.'
    : acc >= 70 ? 'Jó tempó. A hibás szavak hamarabb jönnek vissza, így rögzülnek.'
    : 'Sok volt az új vagy nehéz anyag. Holnap kevesebb újat érdemes felvenni.';
  const showUnit = stamped || currentUnit();
  app.innerHTML = `
    <div class="backdrop" aria-hidden="true"><img src="${imgUrl(showUnit.img)}" alt="" onerror="this.remove()"></div>
    <section class="finale">
      <div class="stamp">${stampSvg(showUnit, stamped ? today() : null)}</div>
      <h1 lang="it">${line}</h1>
      <p class="lead">${esc(sub)}</p>
      <div class="trio">
        <div><b class="c-salvia">${acc}%</b><span>elsőre jó</span></div>
        <div><b>${s.newCount}</b><span>új kifejezés</span></div>
        <div><b class="c-ochre">${streak()}</b><span>napos sorozat</span></div>
      </div>
      <p class="hint" style="margin:-8px auto 24px">${mins} perc. Holnapra ${tomorrow} ismétlés esedékes${s.best >= 5 ? `, a leghosszabb jó sorozatod ${s.best} volt` : ''}.</p>
      <button class="btn cta block lg" id="home">Kész</button>
    </section>`;
  if (!stamped) $('.stamp').style.opacity = '.35';
  $('#home').onclick = () => show('home');
}

/* ---------- Tananyag ---------- */
function renderLibrary(openId) {
  const cu = currentUnit();
  const open = openId || cu.id;
  app.innerHTML = `
    <h1 class="page-title" lang="it">Le lezioni</h1>
    <p class="page-sub">${PACK.units.length} lecke, ${ORDER.length} kifejezés, mindegyik hanggal</p>
    <div class="legend">
      <span><span class="lvl"><i></i><i></i><i></i></span>új</span>
      <span><span class="lvl l1"><i></i><i></i><i></i></span>tanulod</span>
      <span><span class="lvl l2"><i></i><i></i><i></i></span>rögzül</span>
      <span><span class="lvl l3"><i></i><i></i><i></i></span>tartós</span>
    </div>
    ${PACK.units.map((u, ui) => {
      const st = startedIn(u);
      const head = ui === 0 || PACK.units[ui - 1].level !== u.level ? `<div class="level-h"><b>${u.level}</b><span>${({ A1: 'Alapok', A2: 'Haladó kezdő', B1: 'Középhaladó' })[u.level]}</span></div>` : '';
      return head + `<details class="unit ${u === cu ? 'now' : ''}" id="u-${u.id}" ${u.id === open ? 'open' : ''}>
        <summary>
          ${art(u.img, { cls: 'thumb' + (st ? '' : ' dim') })}
          <span class="unit-t">${IT(u.title)}<span class="hu">${u.index + 1}. ${esc(u.hu)}</span></span>
          <span class="unit-meta">${state.stamps[u.id] ? '✓' : `${st}/${u.items.length}`}</span>
        </summary>
        <div class="unit-body">
          <div class="unit-actions">
            <button class="btn" data-grammar="${u.id}">Nyelvtan</button>
            ${u === cu ? '' : st < u.items.length ? `<button class="btn quiet" data-focus="${u.id}">Ezzel folytatom</button>` : ''}
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
  const got = Object.keys(state.stamps).length;

  app.innerHTML = `
    <h1 class="page-title" lang="it">I progressi</h1>
    <p class="page-sub">Amit eddig felépítettél</p>
    <div class="big-stats">
      <div><b>${cards.length}</b><span>elkezdett kifejezés a ${ORDER.length}-ból</span></div>
      <div><b class="c-salvia">${mature}</b><span>tartós tudás (3+ hét)</span></div>
      <div><b class="${retention != null && retention < state.settings.targetR * 100 - 5 ? 'c-campari' : ''}">${retention == null ? '–' : retention + '%'}</b><span>megtartás 30 nap alatt, cél ${Math.round(state.settings.targetR * 100)}%</span></div>
      <div><b class="c-ochre">${streak()}</b><span>napos sorozat</span></div>
    </div>

    <div class="sec-h"><h2 lang="it">Questa settimana</h2><span>heti összefoglaló</span></div>
    ${weekSummary()}

    <div class="sec-h"><h2 lang="it">Il passaporto</h2><span>${got}/${PACK.units.length} pecsét</span></div>
    <div class="passport">${PACK.units.map((u, i) => state.stamps[u.id]
      ? `<div class="slot got c${i % 3}" title="${esc(u.hu)}">${stampSvg(u, state.stamps[u.id])}</div>`
      : `<div class="slot" title="${esc(u.hu)}"><span class="empty">${u.index + 1}</span></div>`).join('')}</div>
    <p class="hint">Egy lecke pecsétje akkor jár, ha minden kifejezését elkezdted.</p>

    <div class="sec-h"><h2 lang="it">La costanza</h2><span>utolsó ${WEEKS} hét</span></div>
    <div class="panel">
      <div class="heat" aria-label="Napi aktivitás hőtérképe">${heat}</div>
      <div class="heat-legend">kevés <i style="background:var(--line)"></i><i style="background:rgba(219,165,69,.28)"></i><i style="background:rgba(219,165,69,.52)"></i><i style="background:rgba(219,165,69,.78)"></i><i style="background:var(--ochre)"></i> sok</div>
    </div>

    <div class="sec-h"><h2 lang="it">La settimana</h2><span>esedékes ismétlések</span></div>
    <div class="panel">
      <div class="bars">${forecast.map((v, i) => `<div class="b ${i === 0 ? 'now' : ''}"><em>${v || ''}</em><i style="height:${Math.round(100 * v / fmax)}%"></i><small>${i === 0 ? 'ma' : WD[weekday(t + i)]}</small></div>`).join('')}</div>
    </div>

    <p class="explain" style="margin-top:22px">A <b>megtartás</b> azt mutatja, az ismétlések hány százalékánál emlékeztél (a nehezen felidézett is számít). Ha tartósan a cél felett vagy, vehetsz fel több újat; ha alatta, kevesebbet. Egy kifejezés akkor <b>tartós</b>, ha három hét szünet után is 90% eséllyel tudod.</p>`;
}

/* ---------- Beállítások ---------- */
function applyTheme() {
  let t = state.settings.theme || 'dark';
  if (t === 'system') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  const m = $('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#0c1310' : '#f4f4f1';
}

function renderSettings() {
  const st = state.settings;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-k="${key}" data-v="${v}" aria-pressed="${String(st[key]) === String(v)}">${l}</button>`).join('')}</div>`;
  const sw = key => `<label class="switch"><input type="checkbox" data-k="${key}" ${st[key] ? 'checked' : ''}><span></span></label>`;
  app.innerHTML = `
    <h1 class="page-title" lang="it">Impostazioni</h1>
    <p class="page-sub">Beállítások</p>
    ${!srOK() ? '<div class="notice">Ez a böngésző nem ismeri fel a beszédet, ezért a kimondós feladatok kimaradnak. Chrome-ban és Safariban működik.</div>' : ''}
    <div class="panel">
      <div class="setting"><label>Megjelenés</label>${seg('theme', [['dark', 'Sötét'], ['light', 'Világos'], ['system', 'Rendszer']])}</div>
      <div class="setting"><label>Új kifejezés naponta<span class="sub">8-cal kb. 15 perc/nap hosszú távon</span></label>${seg('newPerDay', [[5, '5'], [8, '8'], [12, '12'], [20, '20']])}</div>
      <div class="setting"><label>Megtartási cél<span class="sub">Magasabb cél, több ismétlés</span></label>${seg('targetR', [[0.85, '85%'], [0.9, '90%'], [0.95, '95%']])}</div>
      <div class="setting"><label>Hang tempója</label>${seg('rate', [[0.75, 'Lassú'], [0.9, 'Közepes'], [1, 'Élő']])}</div>
      <div class="setting"><label>Automatikus lejátszás</label>${sw('autoplay')}</div>
      <div class="setting"><label>Kimondós feladatok<span class="sub">Mikrofon kell hozzá</span></label>${sw('speak')}</div>
      <div class="setting"><label>Hangjelzés válasz után</label>${sw('sound')}</div>
    </div>

    <div class="sec-h"><h2 lang="it">L'obiettivo</h2><span>napi cél és emlékeztető</span></div>
    <div class="panel">
      <div class="setting"><label>Napi cél<span class="sub">Csak a valódi tanulási idő számít</span></label>${seg('goalMin', [[5, '5'], [10, '10'], [15, '15'], [20, '20']])}</div>
      <div class="setting"><label for="remindAt">Emlékeztető időpontja</label><input type="time" id="remindAt" class="time-in" value="${esc(st.remindAt)}"></div>
      <div class="setting" style="display:block"><button class="btn block" id="remind">Napi emlékeztető a naptárba</button>
        <p class="sub" style="margin-top:8px;font-size:13px;color:var(--muted)">Letölt egy naptárbejegyzést, ami minden nap ekkor szól. iPhone-on és Androidon is egy koppintással hozzáadható, szerver és fiók nélkül.</p></div>
    </div>

    <div class="sec-h"><h2 lang="it">Il compagno</h2><span>AI beszélgetőtárs</span></div>
    <div class="panel">${keyForm()}</div>

    <div class="sec-h"><h2 lang="it">Come funziona</h2></div>
    <ol class="how">
      <li><b>Ütemezés:</b> FSRS-4.5, ugyanaz az algoritmus, mint az Ankiban. Minden kifejezést akkor hoz vissza, amikor a beállított eséllyel még emlékszel rá.</li>
      <li><b>Nehezedő feladatok:</b> ahogy egy szó erősödik, a választásból kirakás, gépelés, diktálás, végül kimondás lesz.</li>
      <li><b>Hang:</b> minden kifejezés természetes olasz hangon, felvételről szól, offline is.</li>
      <li><b>Adatok:</b> minden a böngésződben marad. Eszközváltáshoz exportáld, majd importáld.</li>
    </ol>

    <div class="sec-h"><h2 lang="it">I dati</h2></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" id="exp">Haladás exportálása</button>
      <label class="btn" style="cursor:pointer">Importálás<input type="file" id="imp" accept="application/json" hidden></label>
      <button class="btn danger" id="reset">Haladás törlése</button>
    </div>
    <p class="foot">Viva Voce · olasz A1–B1 · ${ORDER.length} kifejezés · illusztrációk: Higgsfield, hang: Kokoro</p>`;
  bindKeyForm(() => renderSettings());
  $('#remindAt').onchange = e => { st.remindAt = e.target.value || '19:00'; saveState(); };
  $('#remind').onclick = downloadReminder;
  $$('.seg button').forEach(b => b.onclick = () => {
    st[b.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; saveState();
    $$(`.seg button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
    if (b.dataset.k === 'theme') applyTheme();
    if (b.dataset.k === 'rate') say('Ciao', +b.dataset.v);
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
    const theme = state.settings.theme;
    localStorage.removeItem(STORE_KEY); state = loadState(); state.settings.theme = theme; saveState(); paintStreak(); show('home');
  };
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
  u18: 'Sztrájk van, az ügyintézővel intézed a visszatérítést',
  u19: 'Egy barát a terveidről és reményeidről kérdez',
  u20: 'Elmeséled egy barátnak, mi történt veled a múlt héten',
  u21: 'Árajánlatról tárgyalsz egy milánói ügyféllel',
  u22: 'Megbeszélést vezetsz, a kolléga ellenvetéseket tesz',
  u23: 'Egy barát elmondja, mi bántja, te reagálsz',
  u24: 'Egy régi barát a párkapcsolatodról és a családodról kérdez',
  u25: 'Albérletet nézel, a tulajdonossal egyeztetsz',
  u26: 'Edzővel beszéled meg az életmódodat',
  u27: 'Kollégával beszélgetsz a heti hírekről',
  u28: 'Egy baráttal filmet vagy kiállítást választotok',
  u29: 'Egy barát azt kérdezi, mit tennél, ha mindent megtehetnél',
  u30: 'Vitázol egy döntésről, érvekkel és ellenérvekkel'
};
const getKey = () => { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } };

function keyForm() {
  return getKey()
    ? `<div class="setting"><label>Claude API-kulcs<span class="sub">Csak ebben a böngészőben van elmentve, az exportba nem kerül bele.</span></label><button class="btn danger" id="keyDel">Kulcs törlése</button></div>`
    : `<p class="explain" style="margin-bottom:12px">A beszélgetéshez saját Claude API-kulcs kell (<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>). A kulcs csak ebben a böngészőben tárolódik, a kérések közvetlenül az Anthropichoz mennek. Egy 10 perces beszélgetés a Haiku modellel jellemzően 1 cent alatti.</p>
       <form id="keyForm" class="key-form"><input class="answer-input key-input" id="keyInp" type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" aria-label="Claude API-kulcs"><button class="btn cta">Mentés</button></form>
       <p class="small-err" id="keyErr"></p>`;
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
  enterSession();
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
    if (state.settings.autoplay) { const bs = $$('.bubble.ai .icon-btn'); say(o.reply, null, bs[bs.length - 1]); }
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
      <div class="chat-head">${art(u ? u.img : PACK.hero, { cls: 'thumb' })}<div>${IT(u ? u.title : 'Chiacchierata libera')}<span class="hu">${esc(u ? ROLES[u.id] || u.hu : 'Szabad beszélgetés')}</span></div></div>
    </div>
    <div class="chat" id="chat"></div>
    <div class="composer">
      <div class="hints" id="hints"></div>
      <form id="cf" class="cf" autocomplete="off">
        ${srOK() && state.settings.speak ? `<button type="button" class="icon-btn" id="cmic" aria-label="Diktálás olaszul">${ICON.mic}</button>` : ''}
        <input class="answer-input" id="cin" lang="it" autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Írj vagy mondd olaszul" aria-label="Üzenet olaszul">
        <button class="btn cta" id="csend">Küldés</button>
      </form>
    </div>`;
  $('#quit').onclick = () => { talk = null; stopAudio(); show('practice'); };
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
  chat.innerHTML = talk.view.map(m => m.who === 'ai'
    ? `<div class="bubble ai">${playBtn(m.text)}<div>${IT(m.text, 'p')}${m.hu ? `<details class="tr"><summary>Fordítás</summary><p class="hu">${esc(m.hu)}</p></details>` : ''}</div></div>`
    : `<div class="bubble me"><p lang="it">${esc(m.text)}</p>${m.fix ? `<div class="fix"><span class="fix-l">Helyesen:</span> ${IT(m.fix.fixed)} ${playBtn(m.fix.fixed, 'Meghallgatom', 'sm')}<p>${esc(m.fix.why || '')}</p></div>` : m.ok ? '<div class="okmark">✓ Helyes</div>' : ''}</div>`
  ).join('') + (talk.busy ? '<div class="bubble ai typing"><i></i><i></i><i></i></div>' : '')
    + (talk.error ? `<div class="notice">${esc(talk.error)} <button class="btn quiet" id="retry">Újra</button></div>` : '');
  const r = $('#retry'); if (r) r.onclick = () => { talk.error = null; askClaude(); };
  const h = $('#hints');
  if (h) {
    h.innerHTML = talk.hints.length && !talk.busy ? `<span class="hint-l">Ötlet:</span>${talk.hints.map(x => `<button class="chip" lang="it">${esc(x)}</button>`).join('')}` : '';
    $$('.chip', h).forEach(c => c.onclick = () => { $('#cin').value = c.textContent; $('#cin').focus(); });
  }
  const sb = $('#csend'); if (sb) sb.disabled = talk.busy;
  requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
}

/* ---------- Gyakorlás fül: történetek, beszélgetés, igeedző, hibák ---------- */
const storyUnlocked = s => { const u = PACK.units.find(x => x.id === s.unlock); return !u || startedIn(u) > 0; };
const unitById = id => PACK.units.find(u => u.id === id);
function mistakeItems() {
  const cut = Date.now() - 30 * DAY;
  const recentBad = new Set(state.log.filter(l => l[0] >= cut && l[2] === 1).map(l => l[1]));
  return Object.entries(state.cards)
    .filter(([id, c]) => ITEMS[id] && (c.lapses > 0 || recentBad.has(id)))
    .sort((a, b) => (b[1].lapses || 0) - (a[1].lapses || 0) || a[1].s - b[1].s)
    .map(([id]) => id);
}
function homeStoryTeaser() {
  const s = STORIES.find(x => storyUnlocked(x) && !state.stories[x.id]);
  if (!s) return '';
  return `<button class="teaser" id="teaser" data-s="${s.id}">
    ${art(unitById(s.img) && unitById(s.img).img, { cls: 'thumb' })}
    <span class="scene-t"><span class="hu" style="color:var(--ochre);font-weight:600;font-size:12.5px">Új történet · ${s.level}</span>${IT(s.title)}<span class="hu">${esc(s.hu)}, hanggal, kb. 3 perc</span></span>
  </button>`;
}

function renderPractice() {
  if (talk) return renderChat();
  const key = getKey();
  const started = PACK.units.filter(u => startedIn(u));
  const cu = currentUnit();
  const avail = started.length ? started : [cu];
  const mist = mistakeItems().length;
  app.innerHTML = `
    <h1 class="page-title" lang="it">La pratica</h1>
    <p class="page-sub">Történetek, beszélgetés és célzott gyakorlás a napi kör mellé</p>

    <div class="sec-h"><h2 lang="it">Le storie</h2><span>${Object.keys(state.stories).length}/${STORIES.length} meghallgatva</span></div>
    <div class="rail">
      ${STORIES.map(s => {
        const ok = storyUnlocked(s), done = state.stories[s.id];
        const u = unitById(s.img);
        return `<button class="poster ${ok ? '' : 'locked'}" data-story="${s.id}" ${ok ? '' : 'aria-disabled="true"'}>
          <div style="position:relative">${art(u && u.img, { cls: ok ? '' : 'dim' })}
            <span class="poster-n" style="font-size:15px">${s.level}</span>
            ${done ? `<span class="poster-mark">${ICON.check}</span>` : ''}
          </div>
          ${IT(s.title)}<span class="hu">${ok ? esc(s.hu) : `Feloldás: ${unitById(s.unlock).index + 1}. lecke`}</span>
        </button>`;
      }).join('')}
    </div>

    <div class="sec-h"><h2 lang="it">Allenamento</h2><span>célzott gyakorlás</span></div>
    <div class="scenes">
      <button class="scene" id="drill">${art(cu.img, { cls: 'thumb' })}<span class="scene-t">${IT('Coniugazioni')}<span class="hu">Igeedző: ${VERBS ? VERBS.verbs.length : 0} ige, 5 igeidő, a gyenge pontjaidra súlyozva</span></span></button>
      <button class="scene" id="mist" ${mist ? '' : 'disabled style="opacity:.5"'}>${art(PACK.units[19] ? PACK.units[19].img : cu.img, { cls: 'thumb' })}<span class="scene-t">${IT('I miei errori')}<span class="hu">${mist ? `A hibáim: ${mist} kifejezés, amit már elrontottál` : 'Még nincs elrontott kifejezésed'}</span></span></button>
    </div>

    <div class="sec-h"><h2 lang="it">Conversazione</h2><span>AI beszélgetőtárs</span></div>
    ${key ? `<div class="scenes">
        ${avail.map(u => `<button class="scene" data-u="${u.id}">${art(u.img, { cls: 'thumb' })}<span class="scene-t">${IT(u.title)}<span class="hu">${esc(ROLES[u.id] || u.hu)}</span></span><span class="lvl-chip">${u.level}</span></button>`).join('')}
        <button class="scene" data-u="free">${art(PACK.hero, { cls: 'thumb' })}<span class="scene-t">${IT('Chiacchierata libera')}<span class="hu">Szabad beszélgetés bármiről</span></span><span class="lvl-chip">${cu.level}</span></button>
      </div>`
    : `<div class="panel">${keyForm()}</div>`}`;
  if (!key) bindKeyForm(renderPractice);
  $$('.scene[data-u]').forEach(b => b.onclick = () => startTalk(b.dataset.u));
  $$('[data-story]').forEach(b => b.onclick = () => { const s = STORIES.find(x => x.id === b.dataset.story); if (storyUnlocked(s)) startStory(s.id); });
  $('#drill').onclick = () => renderDrillSetup();
  const m = $('#mist'); if (m && mist) m.onclick = () => startSession(0, mistakeItems().slice(0, 15));
}

/* ---------- Történet lejátszó ---------- */
let story = null;
function startStory(id) {
  const s = STORIES.find(x => x.id === id);
  story = { s, pos: -1, first: 0, total: s.lines.filter(l => l.q).length, tries: 0 };
  enterSession();
  const u = unitById(s.img);
  app.innerHTML = `
    <div class="session-bar"><button class="quit" id="quit" aria-label="Kilépés">${ICON.x}</button><div class="progress"><i id="sp" style="width:0%"></i></div><span class="combo"></span></div>
    <section class="story-head">
      <div class="g-art art"><img src="${imgUrl(u.img, true)}" alt="" onerror="this.remove()"></div>
      <div class="task-kind"><span class="tag new">${s.level}</span>Történet</div>
      <h1 class="it story-title" lang="it">${esc(s.title)}</h1>
      <p class="hu">${esc(s.hu)} · szereplők: ${Object.entries(s.cast).filter(([k]) => k !== 'N').map(([, c]) => esc(c.name)).join(', ')}</p>
    </section>
    <div class="story" id="story"></div>
    <div class="story-next"><button class="btn cta block lg" id="snext">Kezdjük</button></div>`;
  $('#quit').onclick = () => { story = null; show('practice'); };
  $('#snext').onclick = storyStep;
  window.scrollTo(0, 0);
}
function storyStep() {
  const st = story; if (!st) return;
  st.pos++;
  const { s } = st;
  $('#sp').style.width = Math.round(100 * st.pos / s.lines.length) + '%';
  if (st.pos >= s.lines.length) return storyEnd();
  const l = s.lines[st.pos];
  const box = $('#story');
  const btn = $('#snext');
  if (l.q) {
    btn.disabled = true; btn.textContent = 'Válaszolj a kérdésre';
    const opts = shuffle(l.o.map((o, i) => ({ o, ok: i === l.a })));
    const el = document.createElement('div');
    el.className = 'squiz rise';
    el.innerHTML = `<p class="squiz-q">${esc(l.q)}</p><div class="choices">${opts.map((x, i) => `<button class="choice" data-ok="${x.ok ? 1 : 0}"><span class="k">${i + 1}</span><span>${esc(x.o)}</span></button>`).join('')}</div>`;
    box.appendChild(el);
    let tries = 0;
    $$('.choice', el).forEach(b => b.onclick = () => {
      if (b.disabled) return;
      tries++;
      if (b.dataset.ok === '1') {
        b.classList.add('right'); chime('ok');
        $$('.choice', el).forEach(x => x.disabled = true);
        if (tries === 1) st.first++;
        btn.disabled = false; btn.textContent = 'Tovább'; btn.focus({ preventScroll: true });
      } else { b.classList.add('wrong'); b.disabled = true; chime('bad'); }
    });
  } else {
    btn.textContent = 'Tovább';
    const who = s.cast[l.s];
    const el = document.createElement('div');
    el.className = `sline rise ${l.s === 'N' ? 'narr' : who.g === 'm' ? 'm' : 'f'}`;
    el.innerHTML = l.s === 'N'
      ? `<p class="it" lang="it">${esc(l.it)}</p><p class="hu tr-hu">${esc(l.hu)}</p>`
      : `<span class="who">${esc(who.name)}</span><div class="sbub">${playBtn(l.it)}<div><p class="it" lang="it">${esc(l.it)}</p><p class="hu tr-hu">${esc(l.hu)}</p></div></div>`;
    el.onclick = e => { if (!e.target.closest('.icon-btn')) el.classList.toggle('show-hu'); };
    box.appendChild(el);
    say(l.it, null, $('.icon-btn', el));
  }
  requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
}
function storyEnd() {
  const { s, first, total } = story;
  story = null;
  state.stories[s.id] = { day: today(), score: first, of: total };
  const d = today(); state.days[d] = (state.days[d] || 0) + 1;
  saveState(); paintStreak();
  chime('done');
  app.innerHTML = `
    <section class="finale">
      <div class="g-art art" style="height:260px;margin:-30px -20px 10px"><img src="${imgUrl(unitById(s.img).img, true)}" alt="" onerror="this.remove()"></div>
      <h1 lang="it">Fine.</h1>
      <p class="lead">${first === total ? 'Minden kérdést elsőre eltaláltál. Ezt a történetet már érted olaszul.' : `${total} kérdésből ${first}-at/et találtál el elsőre. Hallgasd meg újra később, a második körre sokkal több marad meg.`}</p>
      <div class="trio"><div><b class="c-salvia">${first}/${total}</b><span>elsőre jó</span></div><div><b>${s.lines.filter(l => l.it).length}</b><span>mondat</span></div><div><b class="c-ochre">${s.level}</b><span>szint</span></div></div>
      <button class="btn cta block lg" id="done">Kész</button>
      <button class="btn quiet block" id="again" style="margin-top:8px">Újra meghallgatom</button>
    </section>`;
  $('#done').onclick = () => show('practice');
  $('#again').onclick = () => startStory(s.id);
}

/* ---------- Igeedző ---------- */
const P6 = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];
const P6a = ['io', 'tu', 'lui', 'noi', 'voi', 'loro'];
let drill = null;
function drillWeak() {
  return Object.entries(state.drill).filter(([, v]) => v.n >= 2).map(([k, v]) => ({ k, rate: v.ok / v.n, n: v.n })).sort((a, b) => a.rate - b.rate).slice(0, 4);
}
function renderDrillSetup() {
  enterSession();
  const T = VERBS.tenses;
  const sel = drill && drill.cfg || { tenses: ['pres', 'pass'], set: 'A1' };
  const weak = drillWeak();
  app.innerHTML = `
    <div class="session-bar"><button class="quit" id="back" aria-label="Vissza">${ICON.back}</button></div>
    <h1 class="page-title" lang="it">Coniugazioni</h1>
    <p class="page-sub">15 gyors feladat. Amit gyakran elrontasz, azt többször kérdezem.</p>
    <div class="sec-h" style="margin-top:22px"><h2 lang="it" style="font-size:22px">Igeidők</h2></div>
    <div class="chips" id="tch">${Object.entries(T).map(([k, v]) => `<button class="chipsel" data-t="${k}" aria-pressed="${sel.tenses.includes(k)}">${esc(v)}</button>`).join('')}</div>
    <div class="sec-h" style="margin-top:22px"><h2 lang="it" style="font-size:22px">Igék</h2></div>
    <div class="seg" id="vset"><button data-v="A1" aria-pressed="${sel.set === 'A1'}">Alap (${VERBS.verbs.filter(v => v.level === 'A1').length})</button><button data-v="all" aria-pressed="${sel.set === 'all'}">Mind (${VERBS.verbs.length})</button></div>
    ${weak.length ? `<div class="sec-h" style="margin-top:26px"><h2 lang="it" style="font-size:22px">Punti deboli</h2><span>gyenge pontjaid</span></div>
      <div class="weak">${weak.map(w => { const [inf, t] = w.k.split('|'); return `<div><span class="it">${esc(inf)}</span><span class="hu">${esc(T[t])}</span><b class="c-campari">${Math.round(w.rate * 100)}%</b></div>`; }).join('')}</div>` : ''}
    <button class="btn cta block lg" id="go" style="margin-top:28px">Indítás</button>`;
  $('#back').onclick = () => show('practice');
  $$('#tch .chipsel').forEach(b => b.onclick = () => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); });
  $$('#vset button').forEach(b => b.onclick = () => $$('#vset button').forEach(x => x.setAttribute('aria-pressed', x === b)));
  $('#go').onclick = () => {
    const tenses = $$('#tch .chipsel').filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.t);
    if (!tenses.length) return;
    startDrill({ tenses, set: $('#vset [aria-pressed="true"]').dataset.v });
  };
}
function startDrill(cfg) {
  const verbs = VERBS.verbs.filter(v => cfg.set === 'all' || v.level === 'A1');
  const cands = [];
  verbs.forEach(v => cfg.tenses.forEach(t => { for (let p = 0; p < 6; p++) {
    const st = state.drill[`${v.inf}|${t}`];
    const w = st ? 1 + 4 * (1 - st.ok / st.n) : 1.6;
    cands.push({ v, t, p, w });
  } }));
  const picked = [];
  const used = new Set();
  while (picked.length < 15 && cands.length) {
    const sum = cands.reduce((a, c) => a + c.w, 0);
    let r = Math.random() * sum, i = 0;
    while ((r -= cands[i].w) > 0) i++;
    const c = cands.splice(i, 1)[0];
    const key = c.v.inf + c.t;
    if (used.has(key) && cands.length > 30) continue; // egy ige-idő párból egy kör alatt egy elég
    used.add(key); picked.push(c);
  }
  drill = { cfg, q: picked, pos: 0, ok: 0, first: 0, started: Date.now() };
  drillStep();
}
function drillStep() {
  const d = drill;
  closeSheet();
  if (d.pos >= d.q.length) return drillEnd();
  const c = d.q[d.pos];
  const T = VERBS.tenses;
  enterSession();
  app.innerHTML = `
    <div class="session-bar"><button class="quit" id="quit" aria-label="Kilépés">${ICON.x}</button><div class="progress"><i style="width:${Math.round(100 * d.pos / d.q.length)}%"></i></div><span class="combo">${d.pos + 1}/${d.q.length}</span></div>
    <div class="enter">
      <div class="task-kind"><span class="tag ${c.retry ? 'again' : 'rev'}">${c.retry ? 'Még egyszer' : 'Ragozd'}</span>${esc(T[c.t])}</div>
      <div class="drill-card">
        <span class="it drill-inf" lang="it">${esc(c.v.inf)}</span>
        <span class="hu">${esc(c.v.hu)}</span>
        <div class="drill-p"><span class="pron">${P6[c.p]}</span><span class="hu">${esc(T[c.t])}</span></div>
      </div>
      <form id="f" autocomplete="off">
        <input class="answer-input" id="inp" lang="it" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${P6a[c.p]} …" aria-label="Ragozott alak">
        <div class="accents">${['à', 'è', 'é', 'ì', 'ò', 'ù'].map(a => `<button type="button" data-a="${a}">${a}</button>`).join('')}</div>
        <div class="input-actions"><button type="button" class="btn quiet" id="idk">Nem tudom</button><button class="btn cta lg" id="check">Ellenőrzés</button></div>
      </form>
    </div>`;
  $('#quit').onclick = () => { drill = null; show('practice'); };
  const inp = $('#inp'), f = $('#f');
  setTimeout(() => inp.focus({ preventScroll: true }), 60);
  $('.accents', f).onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const s = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, s) + b.dataset.a + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); inp.setSelectionRange(s + 1, s + 1); };
  const submit = given => {
    const target = c.v.forms[c.t][c.p];
    const alts = [target, (c.v.alt[c.t] || [])[c.p]].filter(Boolean);
    let g = 1, note = '';
    if (given != null) {
      const n = norm(given).replace(/^(io|tu|lui|lei|noi|voi|loro) /, '');
      if (alts.some(a => norm(a) === n)) g = 3;
      else if (alts.some(a => stripAccents(norm(a)) === stripAccents(n))) { g = 2; note = 'Az ékezet számít: <b>è</b>, <b>ò</b>, <b>à</b> a jövő idő és a harmadik személy jele.'; }
    }
    inp.readOnly = true; inp.classList.add(g >= 2 ? 'right' : 'wrong');
    $('.accents', f).remove(); $('.input-actions', f).remove();
    const key = `${c.v.inf}|${c.t}`;
    if (!c.retry) {
      const st = state.drill[key] || { n: 0, ok: 0 };
      st.n++; if (g >= 2) st.ok++;
      state.drill[key] = st;
      if (g >= 2) d.first++;
      const day = today(); state.days[day] = (state.days[day] || 0) + 1;
      saveState(); paintStreak();
    }
    if (g >= 2) d.ok++; else d.q.push(Object.assign({}, c, { retry: true }));
    const cls = g === 3 ? 'ok' : g === 2 ? 'hard' : 'bad';
    chime(cls);
    const forms = c.v.forms[c.t];
    sheet.className = `sheet ${cls}`;
    sheet.innerHTML = `<div class="wrap">
      <div class="sheet-head"><h3 lang="it">${g === 3 ? pick(['Esatto!', 'Perfetto!', 'Giusto!']) : g === 2 ? 'Quasi!' : 'Peccato…'}</h3>${playBtn(`${P6a[c.p]} ${target}`)}</div>
      ${note ? `<p class="note">${note}</p>` : ''}
      <table class="conj">${forms.map((x, i) => `<tr class="${i === c.p ? 'on' : ''}"><td>${P6[i]}</td><td class="it" lang="it">${esc(x)}</td></tr>`).join('')}</table>
      ${c.v.aux === 'essere' && c.t === 'pass' ? '<p class="note">Essere-vel ragozódik, ezért a végződés egyezik: nő mondja: <b>sono andata</b>, többes nőnem: <b>siamo andate</b>.</p>' : ''}
      <div class="actions"><button class="btn ${g === 1 ? 'bad' : 'cta'} lg" id="next">Tovább</button></div></div>`;
    sheet.hidden = false; document.body.classList.add('sheet-open');
    if (g < 3 || state.settings.autoplay) say(`${P6a[c.p]} ${target}`, null, $('.sheet .icon-btn'));
    const nb = $('#next'); nb.focus({ preventScroll: true }); nb.onclick = () => { d.pos++; drillStep(); };
  };
  f.onsubmit = e => { e.preventDefault(); if (!inp.value.trim()) return inp.focus(); submit(inp.value); };
  $('#idk').onclick = () => submit(null);
}
function drillEnd() {
  const d = drill;
  const total = d.q.filter(x => !x.retry).length;
  drill = { cfg: d.cfg };
  chime('done');
  const weak = drillWeak();
  app.innerHTML = `
    <section class="finale">
      <h1 lang="it">${d.first === total ? 'Perfetto.' : d.first / total >= .7 ? 'Bene così.' : 'Ancora un po’.'}</h1>
      <p class="lead">${total} alakból ${d.first} ment elsőre. A rontott alakokat a kör végén újra kérdeztem, és a következő körben is gyakrabban jönnek.</p>
      <div class="trio"><div><b class="c-salvia">${Math.round(100 * d.first / total)}%</b><span>elsőre jó</span></div><div><b>${total}</b><span>alak</span></div><div><b class="c-ochre">${Math.max(1, Math.round((Date.now() - d.started) / 60000))}</b><span>perc</span></div></div>
      ${weak.length ? `<div class="weak" style="text-align:left;margin-bottom:22px">${weak.map(w => { const [inf, t] = w.k.split('|'); return `<div><span class="it">${esc(inf)}</span><span class="hu">${esc(VERBS.tenses[t])}</span><b class="c-campari">${Math.round(w.rate * 100)}%</b></div>`; }).join('')}</div>` : ''}
      <button class="btn cta block lg" id="again">Még egy kör</button>
      <button class="btn quiet block" id="done" style="margin-top:8px">Kész</button>
    </section>`;
  $('#again').onclick = () => startDrill(d.cfg);
  $('#done').onclick = () => show('practice');
}

/* ---------- Időmérés és napi cél ---------- */
let lastAct = Date.now();
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { lastAct = Date.now(); }, { capture: true, passive: true }));
setInterval(() => {
  const active = document.visibilityState === 'visible' && Date.now() - lastAct < 90000 && (document.body.classList.contains('in-session'));
  if (!active) return;
  const d = today();
  state.time[d] = (state.time[d] || 0) + 5;
  if (!state.goalHit[d] && state.time[d] >= state.settings.goalMin * 60) {
    state.goalHit[d] = 1;
    toast(`Napi cél teljesítve: ${state.settings.goalMin} perc. Bravo!`);
    chime('stamp');
  }
  if (state.time[d] % 30 === 0) saveState();
}, 5000);
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3200);
}

/* Napi emlékeztető naptárfájlként: minden telefonon működik, szerver nélkül */
function downloadReminder() {
  const [h, m] = (state.settings.remindAt || '19:00').split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  const pad = n => String(n).padStart(2, '0');
  const dt = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
  const url = location.href.split('#')[0].split('?')[0];
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Viva Voce//HU', 'BEGIN:VEVENT',
    `UID:vivavoce-daily-${Date.now()}@vivavoce`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${dt}`, 'DURATION:PT' + state.settings.goalMin + 'M', 'RRULE:FREQ=DAILY',
    `SUMMARY:Viva Voce: ${state.settings.goalMin} perc olasz`, `DESCRIPTION:Andiamo! ${url}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Ideje egy kis olasznak', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'viva-voce-emlekezteto.ics';
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* Heti összefoglaló a Haladás fülre */
function weekSummary() {
  const t = today();
  const wd = (weekday(t) + 6) % 7; // hétfő = 0
  const thisStart = t - wd, lastStart = thisStart - 7;
  const sum = (a, b, obj) => { let s = 0; for (let d = a; d <= b; d++) s += obj[d] || 0; return s; };
  const minsThis = Math.round(sum(thisStart, t, state.time) / 60), minsLast = Math.round(sum(lastStart, lastStart + wd, state.time) / 60);
  const msStart = (thisStart) * DAY;
  const newThis = Object.values(state.cards).filter(c => c.intro >= thisStart).length;
  const revs = state.log.filter(l => dayIndex(l[0]) >= thisStart && !l[3]);
  const acc = revs.length ? Math.round(100 * revs.filter(l => l[2] >= 2).length / revs.length) : null;
  let best = null; for (let d = thisStart; d <= t; d++) if ((state.time[d] || 0) > ((best != null && state.time[best]) || 0)) best = d;
  const goalDays = Array.from({ length: wd + 1 }, (_, i) => thisStart + i).filter(d => (state.time[d] || 0) >= state.settings.goalMin * 60).length;
  const delta = minsThis - minsLast;
  return `<div class="week">
    <div class="week-row"><div><b>${minsThis}</b><span>perc a héten</span></div><div><b class="${delta >= 0 ? 'c-salvia' : 'c-campari'}">${delta >= 0 ? '+' : ''}${delta}</b><span>perc a múlt hét azonos napjaihoz képest</span></div></div>
    <div class="week-row"><div><b>${newThis}</b><span>új kifejezés</span></div><div><b>${acc == null ? '–' : acc + '%'}</b><span>ismétlés pontosság</span></div></div>
    <p class="explain" style="margin-top:12px">${goalDays}/${wd + 1} napon teljesült a napi cél${best != null && state.time[best] ? `, a legerősebb napod: ${['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'][(weekday(best) + 6) % 7]}` : ''}.</p>
  </div>`;
}

/* ---------- Indítás ---------- */
(async function init() {
  try { await loadPack(); }
  catch (e) {
    app.innerHTML = '<div class="notice">A tananyag nem töltődött be. Ha a fájlt közvetlenül nyitottad meg, indíts helyi szervert (lásd README), vagy használd a GitHub Pages címet.</div>';
    return;
  }
  saveState();
  paintStreak();
  applyTheme();
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (state.settings.theme === 'system') applyTheme(); });
  show('home');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
