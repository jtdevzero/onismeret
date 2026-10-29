/* Társasest — egy telefonos buli- és társasjáték-gyűjtemény.
   Állapot: S (játékosok, beállítások) localStorage-ben, R (aktuális nézet és a játékok menete) sessionStorage-ben,
   így véletlen frissítés után is ott folytatódik a játék, ahol abbamaradt. */
'use strict';
const D = window.TARSAS_DATA;
const SKEY = 'tarsas.v1', RKEY = 'tarsas.run.v1';

const S = Object.assign({ players: [], settings: { spicy: false, sound: true, vibrate: true, tts: true, revealRole: true } }, read(localStorage, SKEY));
S.settings = Object.assign({ spicy: false, sound: true, vibrate: true, tts: true, revealRole: true }, S.settings);
const R = Object.assign({ view: 'home', back: 'home', games: {}, results: [] }, read(sessionStorage, RKEY));
const TICKERS = {}, PRIVACY = [];
let privacyCovered = false;
function recordResult(game, entries) {
  R.results = Array.isArray(R.results) ? R.results : [];
  const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  R.results.push({ id, game, entries: entries.map(x => ({ name: String(x.name), points: Number(x.points) || 0 })), at: Date.now() });
  R.results = R.results.slice(-100);
  save();
  return id;
}
function updateResult(s, game, entries) {
  const result = (R.results || []).find(x => x.id === s.resultId);
  if (result) result.entries = entries;
  else s.resultId = recordResult(game, entries);
}

function read(store, key) { try { return JSON.parse(store.getItem(key)) || {}; } catch (e) { return {}; } }
function save() {
  try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {}
  try { sessionStorage.setItem(RKEY, JSON.stringify(R)); } catch (e) {}
}

/* ---------- Segédek ---------- */
const $app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
function shuffle(a, r = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mulberry32(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fmt = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const g = () => R.games[R.view];
const players = () => S.players.slice();

const GAMES = {
  impostor: { name: 'Impostor', emo: '🕵️', c: '#ff5d6c', desc: 'Egy valaki nem tudja a titkos szót. Ki az?' },
  never: { name: 'Én még soha nem…', emo: '🙈', c: '#ffcf3f', desc: 'Vallomások, kínos sztorik, nevetés.' },
  likely: { name: 'Ki a legvalószínűbb?', emo: '👉', c: '#4ad6e6', desc: 'Háromra mindenki mutat valakire.' },
  bomb: { name: 'Szóbomba', emo: '💣', c: '#ff8a3d', desc: 'Mondj egy szót, és add tovább, mielőtt robban!' },
  wolf: { name: 'Vérfarkas', emo: '🐺', c: '#a98bff', desc: 'Mesélő app titkos szerepekkel, Maffia témában is.' },
  codes: { name: 'Kódnevek', emo: '🔤', c: '#4aa8ff', desc: 'Két csapat, egyszavas tippek, 25 kártya.' }
};

/* ---------- Hang, rezgés, felolvasás, ébren tartás ---------- */
let AC = null;
function audio() {
  if (!S.settings.sound) return null;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { return null; }
  return AC;
}
function beep(freq = 880, dur = 0.06, vol = 0.25, type = 'square') {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.value = freq; gn.gain.value = vol;
  gn.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(gn).connect(a.destination); o.start(); o.stop(a.currentTime + dur + 0.02);
}
function boom() {
  const a = audio(); if (!a) return;
  const len = a.sampleRate * 1.2, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  const src = a.createBufferSource(), f = a.createBiquadFilter(), gn = a.createGain();
  f.type = 'lowpass'; f.frequency.value = 900; gn.gain.value = 1;
  src.buffer = buf; src.connect(f).connect(gn).connect(a.destination); src.start();
}
function alarm() { [0, 220, 440].forEach(t => setTimeout(() => beep(660, 0.18, 0.3, 'sawtooth'), t)); buzz([200, 100, 200]); }
function buzz(p) { if (S.settings.vibrate && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }
let lastSpoken = '';
function speak(text, key) {
  if (!S.settings.tts || !('speechSynthesis' in window)) return;
  if (key && key === lastSpoken) return;
  lastSpoken = key || '';
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
    u.lang = 'hu-HU'; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(v => /^hu/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
let wake = null;
async function keepAwake(on) {
  try {
    if (on && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
    if (!on && wake) { await wake.release(); wake = null; }
  } catch (e) {}
}
function hideSecrets() {
  Object.values(R.games).forEach(s => { if (s && s.deal) s.deal.shown = false; });
  if (R.games.codes) R.games.codes.key = false;
  if (R.games.codekey) R.games.codekey.revealed = false;
  PRIVACY.forEach(fn => fn());
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    hideSecrets();
    privacyCovered = !!GAMES[R.view] || R.view === 'codekey';
    save();
    if (privacyCovered) render();
  } else { keepAwake(R.view !== 'home'); render(); }
});

/* ---------- Navigáció ---------- */
function go(view, back) {
  if (!V[view]) view = 'home';
  if (view !== R.view) { hideSecrets(); privacyCovered = false; }
  R.back = back !== undefined ? back : R.view;
  R.view = view;
  const url = view === 'home' ? location.pathname : '#' + view;
  if (location.hash !== (view === 'home' ? '' : '#' + view)) history.pushState({ view, back: R.back }, '', url);
  keepAwake(view !== 'home');
  save();
  window.scrollTo(0, 0);
  render();
  $app.focus({ preventScroll: true });
}
window.addEventListener('popstate', e => {
  hideSecrets(); privacyCovered = false;
  const v = e.state && e.state.view || location.hash.slice(1) || 'home';
  R.view = V[v] ? v : 'home';
  R.back = e.state && e.state.back || 'home';
  keepAwake(R.view !== 'home'); save(); render();
});
function inProgress(v) { const s = R.games[v]; return s && s.phase && !['setup', 'end', 'reveal'].includes(s.phase); }
document.getElementById('back').onclick = () => {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  go(GAMES[R.view] ? 'home' : (R.back || 'home'), 'home');
};
document.getElementById('settingsBtn').onclick = () => go('settings', R.view === 'settings' ? R.back : R.view);

/* ---------- Kattintások ---------- */
const A = {}; // akciók: data-a="név", data-v="érték"
A.privacyResume = () => { privacyCovered = false; };
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.tagName === 'FORM') return;
  audio(); // iOS: az első érintés oldja fel a hangot
  const fn = A[el.dataset.a]; if (!fn) return;
  const r = fn(el.dataset.v, el);
  if (r !== false) { save(); render(); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const fn = A[e.target.dataset.a]; if (fn) { fn(e.target); save(); render(); }
});

/* ---------- Render ---------- */
function render() {
  clearTimeout(render.t);
  const v = R.view;
  document.body.dataset.view = v;
  document.getElementById('back').hidden = v === 'home';
  document.getElementById('title').textContent = GAMES[v] ? GAMES[v].name : ({ players: 'Társaság', settings: 'Beállítások', codekey: 'Kémfőnöki kulcs' }[v] || 'Társasest');
  document.documentElement.style.setProperty('--c', GAMES[v] ? GAMES[v].c : (v === 'codekey' ? GAMES.codes.c : '#ffcf3f'));
  const fn = V[v] || V.home;
  if (privacyCovered) {
    $app.innerHTML = '<div class="bigcard"><div class="huge">🔒</div><h2>A játék elrejtve</h2><p class="muted">A megfelelő játékosnál van a telefon?</p></div><button class="btn primary big" data-a="privacyResume">Folytatás</button>';
    after = null; return;
  }
  $app.innerHTML = fn();
  if (after) { const f = after; after = null; f(); }
  tick();
}
let after = null;
const V = {};

/* ---------- Főoldal ---------- */
V.home = () => {
  const p = S.players;
  return `
  <button class="crew" data-a="nav" data-v="players">
    <span style="font-size:28px">👥</span>
    <span class="names"><b>Társaság · ${p.length} fő</b>${p.length ? esc(p.join(', ')) : 'Add meg a neveket, és minden játék ezt használja.'}</span>
    <span class="muted">›</span>
  </button>
  <div class="games">
    ${Object.entries(GAMES).map(([k, x]) => `
      <button class="game" style="--c:${x.c}" data-a="nav" data-v="${k}">
        <span class="emo">${x.emo}</span><b>${x.name}</b><small>${x.desc}</small>
        ${inProgress(k) ? '<small style="color:var(--c)">● folyamatban</small>' : ''}
      </button>`).join('')}
  </div>
  <p class="muted small center">Egy telefon, kézről kézre. Offline is működik.</p>`;
};
A.nav = v => go(v);

/* ---------- Társaság ---------- */
V.players = () => `
  <form class="panel" data-a="addPlayer">
    <h2>Ki játszik?</h2>
    <div class="field"><input id="pname" name="n" aria-label="Játékos neve" placeholder="Név" autocomplete="off" maxlength="18" enterkeyhint="done"><button class="btn primary">Hozzáad</button></div>
    <div class="chips">${S.players.map((n, i) => `<button type="button" class="chip" data-a="delPlayer" data-v="${i}" aria-label="${esc(n)} törlése">${esc(n)}<span class="x">✕</span></button>`).join('') || '<span class="muted small">Még senki. Írj be egy nevet!</span>'}</div>
  </form>
  ${S.players.length ? `<div class="btn-row"><button class="btn ghost" data-a="shufflePlayers">Sorrend keverése</button><button class="btn ghost" data-a="clearPlayers">Mindet törlöm</button></div>` : ''}
  <button class="btn primary big" data-a="backFromPlayers">Kész</button>`;
A.addPlayer = form => {
  const v = form.n.value.trim().slice(0,18); if (!v || ['__proto__','constructor','prototype'].includes(v)) return;
  let name = v, k = 2; while (S.players.includes(name)) name = v + ' ' + k++;
  if (S.players.length < 24) S.players.push(name);
  after = () => document.getElementById('pname').focus();
};
A.delPlayer = i => { S.players.splice(+i, 1); };
A.shufflePlayers = () => { S.players = shuffle(S.players); };
A.clearPlayers = () => { if (!confirm('Biztos törlöd az összes nevet?')) return false; S.players = []; };
A.backFromPlayers = () => { go(R.back && R.back !== 'players' ? R.back : 'home', 'home'); return false; };

function crewLine(min) {
  const n = S.players.length, ok = n >= min;
  return `<button class="crew" data-a="nav" data-v="players">
    <span style="font-size:24px">👥</span>
    <span class="names"><b>${n} játékos${!ok ? ` · legalább ${min} kell` : ''}</b>${n ? esc(S.players.join(', ')) : 'Koppints ide a nevek megadásához.'}</span>
    <span class="muted">Szerkeszt ›</span></button>`;
}

/* ---------- Beállítások ---------- */
V.settings = () => {
  const t = (k, label, sub) => `<label class="toggle"><span>${label}${sub ? `<br><span class="muted small">${sub}</span>` : ''}</span><input type="checkbox" data-a="setting" data-v="${k}" ${S.settings[k] ? 'checked' : ''}></label>`;
  return `<div class="panel">
    ${t('spicy', 'Pikáns 18+ kártyák', 'Megjelenik egy külön pikáns csomag az „Én még soha nem” és a „Ki a legvalószínűbb” játékban.')}
    <hr>${t('sound', 'Hangok', 'Ketyegés, robbanás, időzítő.')}
    <hr>${t('vibrate', 'Rezgés')}
    <hr>${t('tts', 'Felolvasás a Vérfarkas mesélőnél', 'A telefon hangosan felolvassa a mesélő szövegét (ha van magyar hang).')}
    <hr>${t('revealRole', 'Vérfarkas: halálkor kiderül a szerep')}
  </div>
  <div class="panel"><h3>Folyamatban lévő játékok</h3>
    <p class="muted small">Minden játék megjegyzi, hol tartotok, amíg nyitva van a böngésző.</p>
    <button class="btn ghost" data-a="resetGames">Minden játék nullázása</button></div>
  <p class="muted small center">A nevek és beállítások csak ezen a telefonon tárolódnak.</p>`;
};
A.setting = (k, el) => {
  if (!Object.hasOwn(S.settings, k)) return;
  S.settings[k] = !!el.checked;
  if (k === 'spicy' && !el.checked) {
    ['never', 'likely'].forEach(v => { if (R.games[v]) cardDeckState(v, D[v]); });
  }
  if (k === 'tts' && !el.checked && 'speechSynthesis' in window) speechSynthesis.cancel();
};
A.resetGames = () => { if (!confirm('Minden folyamatban lévő játék elvész. Mehet?')) return false; R.games = {}; };

/* ---------- Közös: kézről kézre osztás ---------- */
// s.deal = { order: [nevek], i, shown }
function dealView(s, cardFn, doneLabel) {
  const d = s.deal, name = d.order[d.i];
  if (!d.shown) return `
    <div class="counter">${d.i + 1} / ${d.order.length}</div>
    <div class="bigcard tap" data-a="dealShow">
      <div class="kicker">Add a telefont neki:</div>
      <div class="huge">${esc(name)}</div>
      <div class="sub">Csak te nézz rá, aztán koppints.</div>
    </div>
    <button class="btn primary big" data-a="dealShow">Én vagyok ${esc(name)}, mutasd</button>`;
  const last = d.i === d.order.length - 1;
  return `
    <div class="counter">${esc(name)}</div>
    ${cardFn(name, d.i)}
    <button class="btn primary big" data-a="dealNext">${last ? doneLabel : 'Elrejtem, jöhet a következő'}</button>`;
}
A.dealShow = () => { g().deal.shown = true; buzz(30); };
A.dealNext = () => {
  const s = g(), d = s.deal;
  d.shown = false;
  if (d.i < d.order.length - 1) d.i++;
  else { s.deal = null; DEAL_DONE[R.view](s); }
};
const DEAL_DONE = {};

/* ---------- Közös: időzítő ---------- */
// s.timer = { end, total, paused, left, rang }
function timerView(s) {
  const t = s.timer; if (!t) return '';
  const left = t.paused ? t.left : Math.max(0, t.end - Date.now());
  return `<div class="timer ${left === 0 ? 'done' : ''}" id="tmr">${fmt(left)}</div>
    <div class="btn-row">
      <button class="btn ghost" data-a="tPause">${t.paused ? 'Folytat' : 'Szünet'}</button>
      <button class="btn ghost" data-a="tAdd">+1 perc</button>
    </div>`;
}
function startTimer(s, min) { s.timer = { end: Date.now() + min * 60000, total: min * 60000, paused: false, left: 0, rang: false }; }
A.tPause = () => { const t = g().timer; if (t.paused) { t.end = Date.now() + t.left; t.paused = false; } else { t.left = Math.max(0, t.end - Date.now()); t.paused = true; } };
A.tAdd = () => { const t = g().timer; if (t.paused) t.left += 60000; else t.end = Math.max(Date.now(), t.end) + 60000; t.rang = false; };

function tick() {
  const s = g(); if (!s) return;
  const t = s.timer;
  if (t && !t.paused) {
    const left = Math.max(0, t.end - Date.now());
    const el = document.getElementById('tmr');
    if (el) { el.textContent = fmt(left); el.classList.toggle('done', left === 0); }
    if (left === 0 && !t.rang) { t.rang = true; save(); alarm(); }
  }
  if (R.view === 'bomb') bombTick(s);
  if (R.view === 'likely') likelyTick(s);
  if (TICKERS[R.view]) TICKERS[R.view](s);
}
setInterval(tick, 100);

const stepper = (a, val, min, max) => `<div class="stepper"><button data-a="${a}" data-v="-1" ${val <= min ? 'disabled' : ''}>−</button><b>${val}</b><button data-a="${a}" data-v="1" ${val >= max ? 'disabled' : ''}>+</button></div>`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =====================================================================
   1. IMPOSTOR / SPYFALL
   ===================================================================== */
function impState() {
  return R.games.impostor = R.games.impostor || { phase: 'setup', mode: 'szo', cat: 'mix', nImp: 1, hint: true, minutes: 3 };
}
V.impostor = () => {
  const s = impState();
  if (s.phase === 'setup') {
    const n = S.players.length, maxImp = Math.max(1, Math.floor((n - 1) / 3));
    s.nImp = clamp(s.nImp, 1, maxImp);
    const cats = [['mix', 'Vegyes']].concat(Object.entries(D.impostor).map(([k, c]) => [k, c.name]));
    return `${crewLine(3)}
    <div class="panel">
      <h3>Mód</h3>
      <div class="chips">
        <button class="chip ${s.mode === 'szo' ? 'on' : ''}" data-a="impSet" data-v="mode:szo">Titkos szó</button>
        <button class="chip ${s.mode === 'hely' ? 'on' : ''}" data-a="impSet" data-v="mode:hely">Helyszín + szerep (Spyfall)</button>
      </div>
      <p class="muted small">${s.mode === 'szo'
        ? 'Mindenki ugyanazt a szót kapja, kivéve az impostort. Körben mindenki mond egy szót, ami kapcsolódik hozzá, aztán szavaztok.'
        : 'Mindenki tudja a helyszínt, és kap egy szerepet, kivéve a kémet. Kérdezzétek egymást! A kém próbálja kitalálni, hol vagytok.'}</p>
      ${s.mode === 'szo' ? `<h3>Kategória</h3><div class="chips">${cats.map(([k, nm]) => `<button class="chip ${s.cat === k ? 'on' : ''}" data-a="impSet" data-v="cat:${k}">${nm}</button>`).join('')}</div>
        <label class="toggle"><span>Az impostor látja a kategóriát</span><input type="checkbox" data-a="impHint" ${s.hint ? 'checked' : ''}></label>` : ''}
      <div class="setting-label"><span>${s.mode === 'szo' ? 'Impostorok' : 'Kémek'} száma</span>${stepper('impN', s.nImp, 1, maxImp)}</div>
      <div class="setting-label"><span>Beszélgetés (perc)</span>${stepper('impMin', s.minutes, 1, 10)}</div>
    </div>
    <button class="btn primary big" data-a="impStart" ${n < 3 ? 'disabled' : ''}>Szerepek kiosztása</button>`;
  }
  if (s.phase === 'deal') return dealView(s, (name) => {
    const imp = s.imps.includes(name);
    if (s.mode === 'szo') return imp
      ? `<div class="bigcard" style="--c:var(--red)"><div class="kicker">Te vagy</div><div class="huge">IMPOSTOR</div>
         <div class="sub">${s.hint ? `Kategória: <b>${esc(s.catName)}</b><br>` : ''}Ne bukj le! Figyeld, mit mondanak a többiek.</div></div>`
      : `<div class="bigcard"><div class="kicker">A titkos szó</div><div class="huge" style="font-size:clamp(34px,11vw,56px)">${esc(s.word)}</div>
         <div class="sub">${esc(s.catName)}</div></div>`;
    return imp
      ? `<div class="bigcard" style="--c:var(--red)"><div class="kicker">Te vagy a</div><div class="huge">KÉM</div>
         <div class="sub">Nem tudod, hol vagytok. Kérdezz okosan, és találd ki!</div></div>`
      : `<div class="bigcard"><div class="kicker">Helyszín</div><div class="say">${esc(s.word)}</div>
         <div class="kicker" style="margin-top:6px">A szereped</div><div class="say" style="font-size:22px">${esc(s.roles[name])}</div></div>`;
  }, 'Kész, indulhat a beszélgetés');
  if (s.phase === 'talk') return `
    <div class="panel center"><span class="muted">Kezdi:</span><span class="say" style="font-size:26px;font-weight:800">${esc(s.starter)}</span>
      <span class="muted small">${s.mode === 'szo' ? 'Körben mindenki mond egy szót, ami a titkos szóhoz kapcsolódik.' : 'Ő kérdez valakit, aztán a kérdezett folytatja.'}</span></div>
    <div class="panel">${timerView(s)}</div>
    <button class="btn primary big" data-a="impVote">Szavazás és leleplezés</button>`;
  if (s.phase === 'vote') return `
    <div class="panel"><h3>Kire szavazott a többség?</h3>
      <div class="chips">${s.order.map(n => `<button class="chip ${s.voted === n ? 'on' : ''}" data-a="impVoted" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div></div>
    <button class="btn primary big" data-a="impReveal" ${s.voted ? '' : 'disabled'}>Leleplezés</button>`;
  if (s.phase === 'guess') return `<div class="bigcard">
    <div class="kicker">Utolsó esély</div><div class="say">${s.imps.map(esc).join(', ')}</div>
    <p>Mondjátok ki a tippet! Mi lehetett ${s.mode === 'szo' ? 'a titkos szó' : 'a helyszín'}?</p>
    <p class="muted small">A megfejtés a döntés után jelenik meg. A többiek jelöljék, hogy helyes volt-e a tipp.</p></div>
    <div class="btn-row"><button class="btn primary" data-a="impGuess" data-v="yes">Eltalálta</button><button class="btn ghost" data-a="impGuess" data-v="no">Nem találta el</button></div>`;
  // reveal
  const caught = s.imps.includes(s.voted);
  return `
    <div class="bigcard" style="--c:${caught ? 'var(--green)' : 'var(--red)'}">
      <div class="kicker">${caught ? (s.guessed ? 'Az utolsó tipp helyes!' : 'Lebukott!') : 'Rossz embert gyanúsítottatok'}</div>
      <div class="say">${s.imps.length > 1 ? 'Az impostorok' : (s.mode === 'szo' ? 'Az impostor' : 'A kém')}: ${s.imps.map(esc).join(', ')}</div>
      <div class="sub">${s.mode === 'szo' ? 'A titkos szó' : 'A helyszín'}: <b>${esc(s.word)}</b></div>
      <div class="sub">${!caught || s.guessed ? 'Az impostorok csapata nyert.' : 'A szót ismerő játékosok nyertek.'}</div>
    </div>
    <div class="btn-row"><button class="btn ghost" data-a="impSetup">Beállítások</button><button class="btn primary" data-a="impStart">Új kör</button></div>`;
};
A.impSet = v => { const [k, x] = v.split(':'); impState()[k] = x; };
A.impHint = (v, el) => { impState().hint = el.checked; };
A.impN = d => { const s = impState(); s.nImp += +d; };
A.impMin = d => { const s = impState(); s.minutes = clamp(s.minutes + +d, 1, 10); };
A.impStart = () => {
  const s = impState(), ps = players(); if (ps.length < 3) return;
  if (s.mode === 'szo') {
    const keys = s.cat === 'mix' ? Object.keys(D.impostor) : [s.cat], ck = pick(keys);
    s.word = pick(D.impostor[ck].words); s.catName = D.impostor[ck].name;
  } else {
    const loc = pick(D.helyszinek); s.word = loc.name; s.catName = 'Helyszín';
    const roles = shuffle(loc.roles); s.roles = {};
    ps.forEach((n, i) => { s.roles[n] = roles[i % roles.length]; });
  }
  s.imps = shuffle(ps).slice(0, s.nImp);
  s.order = ps; s.voted = null; s.guessed = false; s.recorded = false; s.timer = null;
  s.deal = { order: ps, i: 0, shown: false };
  s.phase = 'deal';
};
DEAL_DONE.impostor = s => { s.phase = 'talk'; s.starter = pick(s.order); startTimer(s, s.minutes); };
A.impVote = () => { const s = impState(); s.phase = 'vote'; s.timer = null; };
A.impVoted = n => { impState().voted = n; };
function impRecord(s) {
  if (s.recorded) return;
  const impostorsWin = !s.imps.includes(s.voted) || s.guessed;
  recordResult('impostor', s.order.map(name => ({ name, points: s.imps.includes(name) === impostorsWin ? 1 : 0 })));
  s.recorded = true;
}
A.impReveal = () => { const s = impState(); s.phase = s.imps.includes(s.voted) ? 'guess' : 'reveal'; if (s.phase === 'reveal') impRecord(s); buzz([60, 40, 60]); };
A.impGuess = v => { const s = impState(); if (s.phase !== 'guess') return; s.guessed = v === 'yes'; s.phase = 'reveal'; impRecord(s); };
A.impSetup = () => { impState().phase = 'setup'; };

/* =====================================================================
   5. ÉN MÉG SOHA NEM
   ===================================================================== */
function cardAllowed(src, c, i) {
  const view = src === D.never ? 'never' : 'likely';
  const blocked = S.cardPrefs && S.cardPrefs[view] && S.cardPrefs[view].blocked || [];
  return Object.hasOwn(src, c) && Array.isArray(src[c].items) && typeof src[c].items[i] === 'string' && (!src[c].spicy || S.settings.spicy) && !blocked.includes(c + '|' + i);
}
function deckOf(src, cats) {
  const all = [];
  cats.forEach(c => Object.hasOwn(src, c) && src[c].items.forEach((t, i) => { if (cardAllowed(src, c, i)) all.push([c, i]); }));
  return shuffle(all);
}
const visibleCats = src => Object.keys(src).filter(k => !src[k].spicy || S.settings.spicy);
function cardDeckState(view, src) {
  const s = R.games[view] = R.games[view] || { phase: 'setup', cats: visibleCats(src).filter(k => !src[k].spicy) };
  s.cats = (s.cats || []).filter(k => visibleCats(src).includes(k));
  if (s.phase !== 'setup' && Array.isArray(s.deck)) {
    const old = s.deck, pos = s.pos || 0;
    const valid = x => Array.isArray(x) && s.cats.includes(x[0]) && cardAllowed(src, x[0], x[1]);
    s.pos = old.slice(0, pos).filter(valid).length;
    s.deck = old.filter(valid);
    if (!s.deck.length) { if (s.phase !== 'end') s.phase = 'setup'; s.pos = 0; }
    else s.pos = Math.min(s.pos, s.deck.length - 1);
  } else if (s.phase !== 'setup' && s.phase !== 'end') s.phase = 'setup';
  return s;
}
function catChips(src, s, act) {
  return `<div class="chips">${visibleCats(src).map(k => `<button class="chip ${s.cats.includes(k) ? 'on' : ''}" data-a="${act}" data-v="${k}">${esc(src[k].name)}${src[k].spicy ? ' 🌶️' : ''}</button>`).join('')}</div>`;
}
function toggleCat(s, k) { s.cats = s.cats.includes(k) ? s.cats.filter(x => x !== k) : s.cats.concat(k); }

V.never = () => {
  const s = cardDeckState('never', D.never);
  if (s.phase === 'setup') return `
    <div class="panel"><h3>Csomagok</h3>${catChips(D.never, s, 'neverCat')}
      ${!S.settings.spicy ? '<p class="muted small">A pikáns 18+ csomag a beállításokban kapcsolható be.</p>' : ''}
      <p class="muted small">Felolvassa valaki a kártyát. Akivel már megtörtént, iszik egy kortyot, vagy lehajt egy ujjat. Akinek elfogy az öt ujja, kiesett. Sztorizni ér!</p></div>
    <button class="btn primary big" data-a="neverStart" ${s.cats.length ? '' : 'disabled'}>Kezdjük</button>`;
  const [c, i] = s.deck[s.pos];
  return `
    <div class="counter">${s.pos + 1} / ${s.deck.length} · ${esc(D.never[c].name)}</div>
    <div class="bigcard tap" data-a="neverNext">
      <div class="kicker">Én még soha nem…</div>
      <div class="say">${esc(D.never[c].items[i])}</div>
    </div>
    <div class="btn-row"><button class="btn ghost" data-a="neverPrev" ${s.pos ? '' : 'disabled'}>‹ Előző</button><button class="btn primary" data-a="neverNext">Következő ›</button></div>
    <button class="btn ghost" data-a="neverSetup">Csomagok</button>`;
};
A.neverCat = k => toggleCat(R.games.never, k);
A.neverStart = () => { const s = R.games.never; s.deck = deckOf(D.never, s.cats); s.pos = 0; s.phase = s.deck.length ? 'play' : 'setup'; };
A.neverNext = () => { const s = R.games.never; if (s.pos < s.deck.length - 1) s.pos++; else { s.deck = deckOf(D.never, s.cats); s.pos = 0; } };
A.neverPrev = () => { const s = R.games.never; s.pos = Math.max(0, s.pos - 1); };
A.neverSetup = () => { R.games.never.phase = 'setup'; };

/* =====================================================================
   6. KI A LEGVALÓSZÍNŰBB
   ===================================================================== */
V.likely = () => {
  const s = cardDeckState('likely', D.likely);
  s.tally = s.tally || {};
  if (s.phase === 'setup') return `${crewLine(0)}
    <div class="panel"><h3>Csomagok</h3>${catChips(D.likely, s, 'likelyCat')}
      ${!S.settings.spicy ? '<p class="muted small">A pikáns 18+ csomag a beállításokban kapcsolható be.</p>' : ''}
      <p class="muted small">Felolvassátok a kérdést, a telefon visszaszámol, és háromra mindenki rámutat valakire. Akire a legtöbben mutattak, az kapja a címet. A végén kiderül, ki a társaság bajnoka.</p></div>
    <button class="btn primary big" data-a="likelyStart" ${s.cats.length ? '' : 'disabled'}>Kezdjük</button>`;
  if (s.phase === 'end') {
    const rows = Object.entries(s.tally).sort((a, b) => b[1].length - a[1].length);
    return `<div class="panel"><h2>Az este címei</h2>
      <div class="tally">${rows.length ? rows.map(([n, t], i) => `<div><span>${i === 0 ? '👑 ' : ''}<b>${esc(n)}</b><small>${t.map(x => esc('…' + x)).join('<br>')}</small></span><b>${t.length}</b></div>`).join('') : '<span class="muted">Még senki nem kapott címet.</span>'}</div></div>
      <div class="btn-row"><button class="btn ghost" data-a="likelyBack">Folytatjuk</button><button class="btn primary" data-a="likelyReset">Új játék</button></div>`;
  }
  const [c, i] = s.deck[s.pos], q = D.likely[c].items[i];
  const count = s.phase === 'count' ? Math.max(0, Math.ceil((s.countEnd - Date.now()) / 1000)) : 0;
  return `
    <div class="counter">${s.pos + 1} / ${s.deck.length}</div>
    <div class="bigcard">
      <div class="kicker">Ki a legvalószínűbb, hogy…</div>
      <div class="say">${esc(q)}</div>
      ${s.phase === 'count' ? `<div class="huge" id="cnt">${count || 'MUTASS!'}</div>` : ''}
    </div>
    ${s.phase === 'card' ? `<button class="btn primary big" data-a="likelyCount">3, 2, 1… mutass!</button>` : ''}
    ${s.phase === 'vote' ? (S.players.length >= 2 ? `<div class="panel"><h3>Kire mutattak a legtöbben?</h3>
      <div class="chips">${S.players.map(n => `<button class="chip" data-a="likelyWin" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <button class="btn ghost" data-a="likelyNext">Döntetlen, kihagyom</button></div>` : `<button class="btn primary big" data-a="likelyNext">Következő</button>`) : ''}
    <div class="btn-row"><button class="btn ghost" data-a="likelySetup">Csomagok</button><button class="btn ghost" data-a="likelyEnd">Eredmények</button></div>`;
};
function likelyTick(s) {
  if (s.phase !== 'count') return;
  const left = s.countEnd - Date.now(), el = document.getElementById('cnt');
  const n = Math.max(0, Math.ceil(left / 1000));
  if (el && el.textContent !== String(n || 'MUTASS!')) { el.textContent = n || 'MUTASS!'; if (n) beep(520, 0.08); else { beep(1040, 0.25, 0.3); buzz(150); } }
  if (left < -900) { s.phase = 'vote'; save(); render(); }
}
A.likelyCat = k => toggleCat(R.games.likely, k);
A.likelyStart = () => { const s = R.games.likely; s.deck = deckOf(D.likely, s.cats); s.pos = 0; s.phase = s.deck.length ? 'card' : 'setup'; };
A.likelyCount = () => { const s = R.games.likely; s.phase = 'count'; s.countEnd = Date.now() + 3000; beep(520, 0.08); };
A.likelyWin = n => { const s = R.games.likely, [c, i] = s.deck[s.pos]; (s.tally[n] = s.tally[n] || []).push(D.likely[c].items[i]); A.likelyNext(); };
A.likelyNext = () => { const s = R.games.likely; s.phase = 'card'; if (s.pos < s.deck.length - 1) s.pos++; else { s.deck = deckOf(D.likely, s.cats); s.pos = 0; } };
A.likelySetup = () => { R.games.likely.phase = 'setup'; };
A.likelyEnd = () => {
  const s = R.games.likely;
  s.prev = s.phase === 'count' ? 'card' : s.phase; s.phase = 'end';
  const names = [...new Set(S.players.concat(Object.keys(s.tally || {})))];
  if (Object.keys(s.tally || {}).length) updateResult(s, 'likely', names.map(name => ({name, points: (s.tally[name] || []).length})));
};
A.likelyBack = () => { const s = R.games.likely; s.phase = s.deck ? (s.prev || 'card') : 'setup'; };
A.likelyReset = () => { const s = R.games.likely; s.tally = {}; s.resultId = null; s.phase = 'setup'; };

/* =====================================================================
   7. SZÓBOMBA
   ===================================================================== */
const BOMB_LEN = { rovid: [15, 30, 'Rövid'], kozepes: [25, 50, 'Közepes'], hosszu: [40, 80, 'Hosszú'] };
const BOMB_MODES = { betu: 'Betű', resz: 'Szórészlet', kat: 'Kategória', mix: 'Vegyes' };
function bombState() { return R.games.bomb = R.games.bomb || { phase: 'setup', mode: 'mix', len: 'kozepes', losses: {} }; }
function bombPrompt(mode) {
  const m = mode === 'mix' ? pick(['betu', 'resz', 'kat']) : mode, x = pick(D.bomb[m]);
  if (m === 'betu') return { k: 'Mondj egy szót, ami ezzel kezdődik:', t: x };
  if (m === 'resz') return { k: 'Mondj egy szót, amiben benne van:', t: x.toUpperCase() };
  return { k: 'Mondj egy…', t: x };
}
V.bomb = () => {
  const s = bombState();
  if (s.phase === 'setup') return `${crewLine(0)}
    <div class="panel">
      <h3>Feladvány</h3><div class="chips">${Object.entries(BOMB_MODES).map(([k, n]) => `<button class="chip ${s.mode === k ? 'on' : ''}" data-a="bombSet" data-v="mode:${k}">${n}</button>`).join('')}</div>
      <h3>Kanóc hossza</h3><div class="chips">${Object.entries(BOMB_LEN).map(([k, x]) => `<button class="chip ${s.len === k ? 'on' : ''}" data-a="bombSet" data-v="len:${k}">${x[2]} (${x[0]}–${x[1]} mp)</button>`).join('')}</div>
      <p class="muted small">Megjelenik egy feladvány. Aki fogja a telefont, mond egy jó szót, és továbbadja a szomszédjának. Ugyanazt a szót nem lehet kétszer mondani. Senki nem tudja, mikor robban. Akinél felrobban, kap egy pontot, és a legkevesebb pont nyer.</p>
    </div>
    ${scoreBoard(s.losses, 'Robbanások')}
    <button class="btn primary big" data-a="bombArm">Élesítés 💣</button>`;
  if (s.phase === 'end') return `<div class="panel"><h2>A Szóbomba eredménye mentve</h2><p class="muted">A legkevesebb robbanás nyer. Az estpontozáshoz a robbanások negatívját mentjük.</p></div>${scoreBoard(s.losses, 'Robbanások')}<button class="btn primary big" data-a="bombSetup">Folytatjuk</button>`;
  if (s.phase === 'armed') return `
    <div class="bigcard">
      <div class="kicker">${esc(s.prompt.k)}</div>
      <div class="huge" style="font-size:clamp(36px,12vw,64px)">${esc(s.prompt.t)}</div>
      <div class="bomb" id="bombEmo">💣</div>
      <div class="sub">Mondd és add tovább!</div>
    </div>
    <button class="btn ghost" data-a="bombDefuse">Leállítom</button>`;
  return `
    <div class="bigcard" style="--c:var(--red)">
      <div class="huge">BUMM! 💥</div>
      <div class="sub">Kinél robbant?</div>
      <div class="chips" style="justify-content:center">${S.players.map(n => `<button class="chip" data-a="bombLoser" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    </div>
    ${scoreBoard(s.losses, 'Robbanások')}
    <div class="btn-row"><button class="btn ghost" data-a="bombSetup">Beállítások</button><button class="btn primary" data-a="bombArm">Új kör</button></div>`;
};
function scoreBoard(obj, title) {
  const rows = Object.entries(obj).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return '';
  return `<div class="panel"><h3>${title}</h3><div class="tally">${rows.map(([n, v]) => `<div><span>${esc(n)}</span><b>${v}</b></div>`).join('')}</div>
    <div class="btn-row"><button class="btn ghost" data-a="bombClear">Pontok nullázása</button><button class="btn ghost" data-a="bombEnd">Eredmény mentése</button></div></div>`;
}
function bombTick(s) {
  if (s.phase !== 'armed') return;
  const now = Date.now();
  if (now >= s.end) {
    s.phase = 'boom'; save(); boom(); buzz([400, 80, 300]);
    document.body.classList.remove('flash'); void document.body.offsetWidth; document.body.classList.add('flash');
    render(); return;
  }
  const p = (now - s.start) / (s.end - s.start), gap = 950 - 780 * p * p; // egyre gyorsabb ketyegés
  if (!s.nextTick || now >= s.nextTick) { beep(p > .8 ? 1200 : 900, 0.04, 0.2); s.nextTick = now + gap; }
  const el = document.getElementById('bombEmo'); if (el) el.classList.toggle('fast', p > .75);
}
A.bombSet = v => { const [k, x] = v.split(':'); bombState()[k] = x; };
A.bombArm = () => {
  const s = bombState(), [a, b] = BOMB_LEN[s.len];
  s.prompt = bombPrompt(s.mode); s.start = Date.now(); s.end = s.start + (a + Math.random() * (b - a)) * 1000; s.nextTick = 0; s.phase = 'armed';
};
A.bombDefuse = () => { bombState().phase = 'setup'; };
A.bombLoser = n => { const s = bombState(); s.losses[n] = (s.losses[n] || 0) + 1; A.bombArm(); };
A.bombSetup = () => { bombState().phase = 'setup'; };
A.bombEnd = () => {
  const s = bombState(), names = [...new Set(S.players.concat(Object.keys(s.losses)))];
  if (Object.values(s.losses).some(Boolean)) updateResult(s, 'bomb', names.map(name => ({name, points: -(s.losses[name] || 0)})));
  s.phase = 'end';
};
A.bombClear = () => { const s = bombState(); s.losses = {}; s.resultId = null; };

/* =====================================================================
   8. VÉRFARKAS / MAFFIA MESÉLŐ
   ===================================================================== */
const ROLE_KEYS = ['farkas', 'latno', 'gyogyito', 'boszi', 'vadasz'];
function wolfState() { return R.games.wolf = R.games.wolf || { phase: 'setup', skin: 'farkas', counts: { farkas: 1, latno: 1, gyogyito: 1, boszi: 0, vadasz: 0 }, minutes: 4 }; }
const sk = () => D.wolfSkins[wolfState().skin];
const rn = (k, pl) => { const x = sk()[k]; return pl ? (x[1] || x[0]) : x[0]; };
const alive = s => s.players.filter(p => p.alive);
const holders = (s, role) => s.players.filter(p => p.role === role);
const aliveHolder = (s, role) => s.players.find(p => p.role === role && p.alive);

V.wolf = () => {
  const s = wolfState();
  if (s.phase === 'setup') return wolfSetup(s);
  if (s.phase === 'deal') return dealView(s, name => {
    const p = s.players.find(x => x.name === name), r = D.wolfRoles[p.role];
    const mates = p.role === 'farkas' ? holders(s, 'farkas').filter(x => x.name !== name).map(x => x.name) : [];
    return `<div class="bigcard" style="--c:${r.team === 'farkas' ? 'var(--red)' : 'var(--c)'}">
      <div style="font-size:64px">${r.icon}</div><div class="kicker">A szereped</div><div class="say">${rn(p.role)}</div>
      <div class="sub">${esc(r.desc)}</div>
      ${mates.length ? `<div class="sub">Társaid: <b>${mates.map(esc).join(', ')}</b></div>` : ''}</div>`;
  }, 'Kész, vissza a mesélőhöz');
  const panel = `<details class="panel"><summary class="muted small">Mesélői lap (csak a mesélő nézze)</summary>
    <div class="roles-list">${s.players.map(p => `<div class="${p.alive ? '' : 'dead'}"><span>${esc(p.name)}</span><span>${D.wolfRoles[p.role].icon} ${rn(p.role)}</span></div>`).join('')}</div>
    <p class="muted small">${s.witch ? `${rn('boszi')}: gyógyító ital ${s.witch.heal ? 'megvan' : 'elhasználva'}, méreg ${s.witch.poison ? 'megvan' : 'elhasználva'}.` : ''}</p>
    <button class="btn ghost" data-a="wolfQuit">Játék befejezése</button></details>`;
  if (s.phase === 'night') return wolfNight(s) + panel;
  if (s.phase === 'morning') return wolfMorning(s) + panel;
  if (s.phase === 'hunter') return wolfHunter(s) + panel;
  if (s.phase === 'day') return wolfDay(s) + panel;
  if (s.phase === 'vote') return wolfVote(s) + panel;
  if (s.phase === 'verdict') return wolfVerdict(s) + panel;
  if (s.phase === 'shot') return wolfShot(s) + panel;
  return wolfEnd(s);
};
function wolfSetup(s) {
  const n = S.players.length, special = ROLE_KEYS.slice(1).reduce((a, k) => a + s.counts[k], 0);
  const vill = n - s.counts.farkas - special, ok = n >= 5 && vill >= 0 && s.counts.farkas >= 1 && s.counts.farkas < n / 2;
  const rows = ROLE_KEYS.map(k => {
    const max = k === 'farkas' ? Math.max(1, Math.ceil(n / 2) - 1) : 1;
    return `<div class="setting-label"><span>${D.wolfRoles[k].icon} ${rn(k, k === 'farkas')}</span>${stepper('wolfCount', s.counts[k], k === 'farkas' ? 1 : 0, max).replace(/data-v="(-?1)"/g, `data-v="${k}:$1"`)}</div>`;
  }).join('');
  return `${crewLine(5)}
  <div class="panel">
    <h3>Téma</h3><div class="chips">${Object.entries(D.wolfSkins).map(([k, x]) => `<button class="chip ${s.skin === k ? 'on' : ''}" data-a="wolfSkin" data-v="${k}">${x.name}</button>`).join('')}</div>
    <h3>Szerepek</h3>${rows}
    <div class="setting-label"><span>${D.wolfRoles.falusi.icon} ${rn('falusi', true)}</span><b>${Math.max(0, vill)}</b></div>
    ${n >= 5 && vill < 0 ? '<p class="small" style="color:var(--red)">Több szerep van, mint játékos.</p>' : ''}
    <p class="muted small">Javaslat: 4–5 főre jut egy ${rn('farkas').toLowerCase()}. Te vagy a mesélő, és nem játszol: a telefon vezet végig minden éjszakán, és számolja, ki él még.</p>
    <div class="setting-label"><span>Nappali vita (perc)</span>${stepper('wolfMin', s.minutes, 1, 15)}</div>
  </div>
  <button class="btn primary big" data-a="wolfStart" ${ok ? '' : 'disabled'}>Szerepek kiosztása</button>`;
}
A.wolfSkin = k => { wolfState().skin = k; };
A.wolfCount = v => { const [k, d] = v.split(':'), s = wolfState(); s.counts[k] = Math.max(0, s.counts[k] + +d); };
A.wolfMin = d => { const s = wolfState(); s.minutes = clamp(s.minutes + +d, 1, 15); };
A.wolfStart = () => {
  const s = wolfState(), ps = shuffle(players());
  const roles = [];
  ROLE_KEYS.forEach(k => { for (let i = 0; i < s.counts[k]; i++) roles.push(k); });
  while (roles.length < ps.length) roles.push('falusi');
  const sh = shuffle(roles);
  s.players = players().map(name => ({ name, role: sh[ps.indexOf(name)], alive: true }));
  s.night = 0; s.lastProtect = null; s.witch = s.counts.boszi ? { heal: true, poison: true } : null; s.winner = null; s.timer = null;
  s.deal = { order: players(), i: 0, shown: false }; s.recorded = false; s.phase = 'deal';
};
DEAL_DONE.wolf = s => startNight(s);

function startNight(s) {
  s.night++; s.phase = 'night'; s.step = 0; s.sel = {}; s.timer = null;
  const steps = ['sleep'];
  ['gyogyito', 'latno', 'farkas', 'boszi'].forEach(k => { if (holders(s, k).length) steps.push(k); });
  steps.push('wake');
  s.steps = steps;
}
function wolfNight(s) {
  const st = s.steps[s.step], k = 'n' + s.night + st;
  const al = alive(s);
  const grid = (key, list, opts = {}) => `<div class="chips">${list.map(p => `<button class="chip ${s.sel[key] === p.name ? 'on' : ''}" data-a="wolfSel" data-v="${key}|${esc(p.name)}" ${opts.disabled && opts.disabled(p) ? 'disabled' : ''}>${esc(p.name)}</button>`).join('')}</div>`;
  let script = '', body = '', can = true;
  const deadRole = role => !aliveHolder(s, role);
  const fake = `<p class="muted small">Ez a szerep már halott. Mondd el ugyanúgy, várj pár másodpercet, mintha döntene, aztán menj tovább, így senki nem jön rá.</p>`;
  if (st === 'sleep') script = `${s.night === 1 ? 'Leszáll az első éjszaka.' : `${s.night}. éjszaka.`} Mindenki hunyja le a szemét. <em>${sk().Town}</em> alszik.`;
  if (st === 'gyogyito') {
    script = `<em>${rn('gyogyito')}</em>, ébredj! Kit védesz meg ma éjjel?`;
    if (deadRole('gyogyito')) body = fake;
    else { body = grid('protect', al, { disabled: p => p.name === s.lastProtect }) + (s.lastProtect ? `<p class="muted small">${esc(s.lastProtect)} tegnap védve volt, ma nem lehet.</p>` : ''); can = !!s.sel.protect; }
  }
  if (st === 'latno') {
    script = `<em>${rn('latno')}</em>, ébredj! Kinek a kilétére vagy kíváncsi?`;
    if (deadRole('latno')) body = fake;
    else {
      const me = aliveHolder(s, 'latno');
      body = grid('peek', al.filter(p => p !== me));
      if (s.sel.peek) {
        const bad = s.players.find(p => p.name === s.sel.peek).role === 'farkas';
        body += `<div class="center">${bad ? `<div class="result-yes">👍 IGEN, ${rn('farkas').toUpperCase()}</div>` : `<div class="result-no">👎 NEM ${rn('farkas').toLowerCase()}</div>`}<p class="muted small">Mutasd neki hüvelykujjal, szó nélkül.</p></div>`;
      }
      can = !!s.sel.peek;
    }
  }
  if (st === 'farkas') {
    script = `<em>${rn('farkas', holders(s, 'farkas').length > 1)}</em>, ébredjetek! Ki legyen ma éjjel az áldozat?`;
    body = grid('kill', al.filter(p => p.role !== 'farkas')); can = !!s.sel.kill;
  }
  if (st === 'boszi') {
    const w = s.witch, v = s.sel.kill;
    script = `<em>${rn('boszi')}</em>, ébredj! Nézz a mesélőre, és jelezd a döntésedet!`;
    if (deadRole('boszi')) body = fake;
    else {
      body += `<p>Az éjszakai célpont: <b>${esc(v || 'senki')}</b>. Ezt csak a boszorkánynak mutasd, szó nélkül.</p>`;
      if (w.heal && v) body += `<div class="chips"><button class="chip ${s.sel.heal ? 'on' : ''}" data-a="wolfToggle" data-v="heal">🧪 Megmentem</button></div>`;
      if (w.poison) body += `<p class="muted small">Méreg (nem kötelező):</p>` + grid('poison', al.filter(p => p !== aliveHolder(s, 'boszi')));
      if (!w.heal && !w.poison) body += `<p class="muted small">Már mindkét bájitalt elhasználta.</p>`;
    }
  }
  if (st === 'wake') script = 'Mindenki aludjon tovább… Kelj fel! Hajnalodik.';
  const plain = (script.replace(/<[^>]+>/g, ''));
  after = () => speak(plain, k);
  const isLast = s.step === s.steps.length - 1;
  return `
    <div class="counter">${s.night}. éjszaka · ${s.step + 1}/${s.steps.length}</div>
    <div class="panel"><div class="script">${script}</div>
      <button class="btn ghost" data-a="wolfSay" data-v="${esc(plain)}" style="align-self:flex-start;min-height:40px;padding:8px 14px">🔊 Felolvas</button></div>
    ${body ? `<div class="panel">${body}</div>` : ''}
    ${st !== 'sleep' && st !== 'wake' ? `<p class="muted small center">Ha kész: „${st === 'farkas' ? 'aludjatok' : 'aludj'} vissza”.</p>` : ''}
    <button class="btn primary big" data-a="${isLast ? 'wolfDawn' : 'wolfStep'}" ${can ? '' : 'disabled'}>${isLast ? 'Reggel' : 'Tovább'}</button>`;
}
A.wolfSay = t => { lastSpoken = ''; speak(t); return false; };
A.wolfSel = v => { const i = v.indexOf('|'), key = v.slice(0, i), n = v.slice(i + 1), s = wolfState(); s.sel[key] = s.sel[key] === n && key === 'poison' ? null : n; };
A.wolfToggle = k => { const s = wolfState(); s.sel[k] = !s.sel[k]; };
A.wolfStep = () => { wolfState().step++; };
A.wolfDawn = () => {
  const s = wolfState(), sel = s.sel, dead = [];
  if (sel.protect) s.lastProtect = sel.protect; else if (!aliveHolder(s, 'gyogyito')) s.lastProtect = null;
  if (sel.kill && sel.kill !== sel.protect && !(sel.heal && s.witch && s.witch.heal)) dead.push(sel.kill);
  if (s.witch && sel.heal && sel.kill) s.witch.heal = false;
  if (s.witch && sel.poison) { s.witch.poison = false; if (!dead.includes(sel.poison)) dead.push(sel.poison); }
  kill(s, dead);
  s.morning = dead; s.phase = 'morning';
};
function kill(s, names) { names.forEach(n => { const p = s.players.find(x => x.name === n); if (p) p.alive = false; }); s.pendingHunter = names.map(n => s.players.find(x => x.name === n)).filter(p => p && p.role === 'vadasz').map(p => p.name); }
function checkWin(s) {
  const w = alive(s).filter(p => p.role === 'farkas').length, o = alive(s).length - w;
  if (w === 0) return 'falu';
  if (w >= o) return 'farkas';
  return null;
}
const deathLine = (s, n) => { const p = s.players.find(x => x.name === n); return `<b>${esc(n)}</b>${S.settings.revealRole ? ` <span class="muted">(${D.wolfRoles[p.role].icon} ${rn(p.role)})</span>` : ''}`; };
function wolfMorning(s) {
  const d = s.morning;
  const text = d.length ? `Felkel a nap. Az éjszaka ${d.length > 1 ? 'áldozatai' : 'áldozata'}: ${d.join(' és ')}.` : 'Felkel a nap. Csoda történt: ezen az éjszakán senki nem halt meg.';
  after = () => speak(text, 'm' + s.night);
  return `<div class="bigcard"><div style="font-size:54px">🌅</div><div class="kicker">${s.night}. reggel</div>
    <div class="say">${d.length ? d.map(n => deathLine(s, n)).join('<br>') : 'Senki nem halt meg'}</div>
    ${d.length ? '<div class="sub">A halottak már nem szólhatnak bele a játékba.</div>' : ''}</div>
    <button class="btn primary big" data-a="wolfAfterDeath" data-v="day">Tovább</button>`;
}
function wolfHunter(s) {
  const h = s.pendingHunter[0];
  after = () => speak(`${h}, a ${rn('vadasz').toLowerCase()} meghalt, de még magával visz valakit. Kit választ?`, 'h' + s.night + h + s.phase);
  return `<div class="panel"><div class="script"><em>${esc(h)}</em> volt a ${rn('vadasz').toLowerCase()}! Haldokolva még magával visz valakit. Kit választ?</div>
    <div class="chips">${alive(s).map(p => `<button class="chip ${s.sel.shot === p.name ? 'on' : ''}" data-a="wolfSel" data-v="shot|${esc(p.name)}">${esc(p.name)}</button>`).join('')}</div></div>
    <button class="btn primary big" data-a="wolfShoot" ${s.sel.shot ? '' : 'disabled'}>Lő</button>`;
}
A.wolfAfterDeath = next => {
  const s = wolfState();
  s.afterHunter = next || s.afterHunter;
  if (s.pendingHunter && s.pendingHunter.length) { s.phase = 'hunter'; s.sel = s.sel || {}; s.sel.shot = null; return; }
  const w = checkWin(s); if (w) { s.winner = w; s.phase = 'end'; return; }
  if (s.afterHunter === 'day') { s.phase = 'day'; startTimer(s, s.minutes); }
  else startNight(s);
};
A.wolfShoot = () => {
  const s = wolfState(), shot = s.sel.shot, rest = s.pendingHunter.slice(1);
  kill(s, [shot]);
  s.pendingHunter = rest.concat(s.pendingHunter);
  s.shot = shot; s.phase = 'shot';
};
function wolfShot(s) {
  after = () => speak(`A lövés eltalálta: ${s.shot}.`, 'shot' + s.night + s.shot);
  return `<div class="bigcard"><div style="font-size:54px">🏹</div><div class="kicker">A lövés eltalálta</div><div class="say">${deathLine(s, s.shot)}</div></div>
    <button class="btn primary big" data-a="wolfAfterDeath">Tovább</button>`;
}
function wolfDay(s) {
  return `<div class="panel center"><div style="font-size:40px">☀️</div><h2>${s.night}. nap · vita</h2>
    <p class="muted small">Életben: ${alive(s).length} fő. Beszéljétek meg, ki gyanús!</p>${timerView(s)}</div>
    <button class="btn primary big" data-a="wolfToVote">Szavazás</button>`;
}
A.wolfToVote = () => { const s = wolfState(); s.phase = 'vote'; s.timer = null; s.sel = {}; };
function wolfVote(s) {
  return `<div class="panel"><h3>Kit végez ki ${sk().town}?</h3>
    <div class="chips">${alive(s).map(p => `<button class="chip ${s.sel.lynch === p.name ? 'on' : ''}" data-a="wolfSel" data-v="lynch|${esc(p.name)}">${esc(p.name)}</button>`).join('')}
    <button class="chip ${s.sel.lynch === '-' ? 'on' : ''}" data-a="wolfSel" data-v="lynch|-">Senkit</button></div></div>
    <button class="btn primary big" data-a="wolfLynch" ${s.sel.lynch ? '' : 'disabled'}>Ítélet</button>`;
}
A.wolfLynch = () => {
  const s = wolfState(), n = s.sel.lynch;
  if (n && n !== '-') { kill(s, [n]); s.lynched = n; } else { s.lynched = null; s.pendingHunter = []; }
  s.phase = 'verdict';
};
function wolfVerdict(s) {
  const n = s.lynched;
  const text = n ? `${sk().Town} döntött: ${n} távozik.` : `${sk().Town} ma nem végzett ki senkit.`;
  after = () => speak(text, 'v' + s.night);
  return `<div class="bigcard"><div style="font-size:54px">⚖️</div><div class="say">${n ? deathLine(s, n) : 'Senki nem távozik'}</div>
    <div class="sub">${n ? 'Ő már nem szólhat bele a játékba.' : 'Leszáll az éj…'}</div></div>
    <button class="btn primary big" data-a="wolfAfterDeath" data-v="night">Tovább</button>`;
}
function wolfEnd(s) {
  if (!s.recorded && s.winner) { s.recorded = true; recordResult('wolf', s.players.map(p => ({ name: p.name, points: D.wolfRoles[p.role].team === s.winner ? 1 : 0 }))); }
  const wolves = s.winner === 'farkas';
  const text = wolves ? `Vége! ${rn('farkas', true)} nyertek.` : `Vége! ${sk().Town} nyert, minden ${rn('farkas').toLowerCase()} lebukott.`;
  after = () => speak(text, 'end');
  return `<div class="bigcard" style="--c:${wolves ? 'var(--red)' : 'var(--green)'}"><div style="font-size:64px">${wolves ? '🐺' : '🎉'}</div>
    <div class="say">${wolves ? `${rn('farkas', true)} nyertek` : `${sk().Town} nyert`}</div></div>
    <div class="panel"><h3>Szerepek</h3><div class="roles-list">${s.players.map(p => `<div class="${p.alive ? '' : 'dead'}"><span>${esc(p.name)}</span><span>${D.wolfRoles[p.role].icon} ${rn(p.role)}</span></div>`).join('')}</div></div>
    <div class="btn-row"><button class="btn ghost" data-a="wolfQuit">Beállítások</button><button class="btn primary" data-a="wolfStart">Újra, új szerepekkel</button></div>`;
}
A.wolfQuit = () => { const s = wolfState(); if (s.phase !== 'end' && !confirm('Befejezed ezt a menetet?')) return false; s.phase = 'setup'; s.timer = null; };

/* =====================================================================
   9. KÓDNEVEK
   ===================================================================== */
function codesBoard(seed) {
  const r = mulberry32(seed * 7919 + D.CODES_VERSION);
  const words = shuffle(D.codes, r).slice(0, 25);
  const start = r() < 0.5 ? 'r' : 'b', other = start === 'r' ? 'b' : 'r';
  const colors = shuffle([].concat(Array(9).fill(start), Array(8).fill(other), Array(7).fill('n'), ['a']), r);
  return { words, colors, start };
}
const TEAM = { r: 'Piros', b: 'Kék' };
function codesState() { return R.games.codes = R.games.codes || { phase: 'setup' }; }
V.codes = () => {
  const s = codesState();
  if (s.phase === 'setup') return `
    <div class="panel">
      <p class="muted small">Két csapat (piros és kék), mindkettőben egy kémfőnök. Ő látja a kulcsot, és egyetlen szóval meg egy számmal segít a csapatának, pl. „állat 2”. A csapat a táblán koppint a tippjére. A fekete merénylőt kerüljétek, mert az azonnali vereség!</p>
      <p class="muted small">A kémfőnökök a saját telefonjukon nyissák meg a <b>Kémfőnöki kulcs</b> nézetet, és írják be a kódot. Így a tábla az asztalon maradhat.</p>
    </div>
    <button class="btn primary big" data-a="codesNew">Új tábla</button>
    <button class="btn ghost" data-a="nav" data-v="codekey">Kémfőnök vagyok (kulcs megnyitása)</button>`;
  const b = codesBoard(s.seed), left = t => b.colors.filter((c, i) => c === t && !s.rev[i]).length;
  return `
    <div class="score"><span class="r">● ${TEAM.r}: ${left('r')}</span><span class="muted small">kód: <b style="color:var(--text);letter-spacing:.1em">${s.seed}</b></span><span class="b">${TEAM.b}: ${left('b')} ●</span></div>
    ${s.phase === 'end' ? `<div class="turn ${s.winner}">${TEAM[s.winner]} csapat nyert! ${s.why || ''}</div>` : `<div class="turn ${s.turn}">${TEAM[s.turn]} csapat tippel</div>`}
    <button class="btn ghost" data-a="codesZoom">${s.zoom ? 'Normál tábla' : 'Tábla nagyítása'}</button>
    <div class="board ${s.zoom ? 'zoom' : ''}">${b.words.map((w, i) => {
      const show = s.rev[i] || s.key || s.phase === 'end';
      return `<button class="cell ${show ? b.colors[i] : ''} ${s.rev[i] ? 'rev' : (show ? 'keyonly' : '')} ${s.sel === i ? 'sel' : ''}" data-a="codesTap" data-v="${i}">${show ? `<span class="cell-mark" aria-hidden="true">${({r:'●',b:'◆',n:'○',a:'✕'})[b.colors[i]]}</span>` : ''}<span>${esc(w)}</span></button>`;
    }).join('')}</div>
    ${s.sel != null && s.phase !== 'end' ? '<p class="center small" style="color:var(--accent);margin:0">Koppints rá még egyszer a felfordításhoz.</p>' : ''}
    ${s.phase !== 'end' ? `<div class="btn-row"><button class="btn ghost" data-a="codesKey">${s.key ? 'Kulcs elrejtése' : '🔑 Kulcs (csak kémfőnök)'}</button><button class="btn primary" data-a="codesPass">Kör vége</button></div>`
      : `<button class="btn primary big" data-a="codesNew">Új tábla</button>`}
    <button class="btn ghost" data-a="codesSetup">Szabályok, új játék</button>`;
};
A.codesNew = () => { const s = codesState(); s.seed = 1000 + rnd(9000); s.rev = Array(25).fill(false); s.turn = codesBoard(s.seed).start; s.sel = null; s.key = false; s.winner = null; s.recorded = false; s.phase = 'play'; };
A.codesZoom = () => { const s = codesState(); s.zoom = !s.zoom; };
A.codesSetup = () => { codesState().phase = 'setup'; };
A.codesKey = () => { const s = codesState(); if (!s.key && !confirm('Csak a kémfőnökök nézzenek a telefonra! Mutassam a kulcsot?')) return false; s.key = !s.key; };
A.codesPass = () => { const s = codesState(); s.turn = s.turn === 'r' ? 'b' : 'r'; s.sel = null; };
function codesRecord(s) {
  if (!s.recorded) { recordResult('codes', ['r','b'].map(t => ({name: TEAM[t] + ' csapat', points: s.winner === t ? 1 : 0}))); s.recorded = true; }
}
A.codesTap = v => {
  const s = codesState(), i = +v; if (s.phase === 'end' || s.rev[i]) return;
  if (s.sel !== i) { s.sel = i; return; }
  const b = codesBoard(s.seed), c = b.colors[i], other = s.turn === 'r' ? 'b' : 'r';
  s.rev[i] = true; s.sel = null; buzz(40);
  if (c === 'a') { s.winner = other; s.why = `(${TEAM[s.turn]} a merénylőt fordította fel.)`; s.phase = 'end'; codesRecord(s); boom(); return; }
  ['r', 'b'].forEach(t => { if (!b.colors.some((x, j) => x === t && !s.rev[j])) { s.winner = t; s.why = ''; s.phase = 'end'; } });
  if (s.phase === 'end') { codesRecord(s); alarm(); return; }
  if (c !== s.turn) { s.turn = other; beep(300, 0.15, 0.2, 'triangle'); } else beep(880, 0.08, 0.2, 'triangle');
};

V.codekey = () => {
  const k = R.games.codekey = R.games.codekey || {};
  const b = k.seed && k.revealed ? codesBoard(k.seed) : null;
  return `<form class="panel" data-a="codekeySet">
    <p class="muted small">Írd be a táblán látható négyjegyű kódot. A kulcs csak a kémfőnököknek szól, a csapatod ne lássa!</p>
    <div class="field"><input name="c" aria-label="Négyjegyű táblakód" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="pl. 4821" value="${k.seed || ''}"><button class="btn primary">Mutasd</button></div></form>
    ${b ? `<div class="turn ${b.start}">${TEAM[b.start]} kezd (9 kártya)</div>
      <div class="board">${b.words.map((w, i) => `<div class="cell ${b.colors[i]}">${esc(w)}</div>`).join('')}</div>
      <p class="muted small center">A felfordított kártyákat itt nem követi a telefon, nézd a táblát.</p>` : ''}`;
};
A.codekeySet = f => { const v = +f.c.value; if (Number.isInteger(v) && v >= 1000 && v <= 9999) { R.games.codekey.seed = v; R.games.codekey.revealed = true; } };

/* ---------- Indulás ---------- */
function initTarsas() {
  const h = location.hash.slice(1);
  if (h && (V[h] || GAMES[h])) R.view = h;
  if (!V[R.view]) R.view = 'home';
  hideSecrets();
  history.replaceState({view:R.view,back:R.back}, '', R.view === 'home' ? location.pathname : '#' + R.view);
  render();
  keepAwake(R.view !== 'home');
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
}
