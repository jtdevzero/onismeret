/* Harry Potter-kvíz: helyi egyéni játék és szinkronizált közös próbatétel. */
(() => {
  'use strict';
  const { films, questions } = window.HP_DATA;
  const app = document.getElementById('app'), notice = document.getElementById('notice');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let solo = null;
  let preferences = { films: [1], mode: 'mixed', count: 10, seconds: 30 };
  const notify = message => { notice.textContent = message || ''; };
  function shuffle(items) { const result = items.slice(); for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
  const score = (q, answer) => q.type === 'number' ? Math.round(1000 / (1 + Math.abs(q.answer - answer))) : (answer === q.answer ? 1000 : 0);
  function settings(form) {
    const data = new FormData(form);
    const value = { films: data.getAll('film').map(Number), mode: data.get('mode'), count: +data.get('count'), seconds: +data.get('seconds') };
    if (!value.films.length) throw new Error('Válassz legalább egy filmrészt!');
    preferences = value; return value;
  }
  function settingsView() {
    return `<fieldset><legend>Melyik részekből kérdezzünk?</legend><p class="muted small">Csak a kijelölt filmekhez tartozó kérdések jönnek. A kijelölt részek tartalmára számíts spoilerként.</p><div class="films">${films.map((name, i) => `<label class="film"><input type="checkbox" name="film" value="${i + 1}" ${preferences.films.includes(i + 1) ? 'checked' : ''}><span>${i + 1}. ${esc(name)}</span></label>`).join('')}</div></fieldset>
      <label>Kérdéstípus<select name="mode">${[['mixed', 'Vegyes próbatétel'], ['choice', 'Feleletválasztós'], ['picture', 'Képes kérdések'], ['number', 'Számtippelős']].map(([id, title]) => `<option value="${id}" ${preferences.mode === id ? 'selected' : ''}>${title}</option>`).join('')}</select></label>
      <div class="row"><label>Kérdések száma<select name="count">${[5, 10, 15, 20, 40].map(n => `<option ${preferences.count === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Idő kérdésenként<select name="seconds">${[20, 30, 45, 60].map(n => `<option value="${n}" ${preferences.seconds === n ? 'selected' : ''}>${n} mp</option>`).join('')}</select></label></div><p class="muted small">${questions.length} kérdés · részenként 5. Ha kevesebb illik a szűréshez, mindet megkapod, ismétlés nélkül.</p>`;
  }
  function home() {
    if (viewMode === 'online') { onlineHome(); return; }
    app.innerHTML = `${modeTabs()}<section class="wizard-hero"><img src="images/castle-hero.webp" class="wizard-hero-image" alt="" width="1536" height="1024" fetchpriority="high"><div class="wizard-hero-content"><p class="eyebrow">A varázsvilág kapuja nyitva áll</p><h1>Mennyire ismered<br>Roxfort titkait?</h1><p class="lead">Válassz filmrészeket, ismerj fel varázstárgyakat, és teszteld a tudásod egy saját próbatételben.</p><a class="hero-start" href="#probatetel">Belépek a varázsvilágba <span aria-hidden="true">↓</span></a><div class="wizard-stats"><span><b>08</b> legendás film</span><span><b>40</b> kérdés</span><span><b>03</b> kihívástípus</span></div></div></section>
      <div class="layout" id="probatetel"><form class="panel setup-panel" data-form="setup"><p class="eyebrow">A kaland a te kezedben van</p><h2>Állítsd össze a próbatételt</h2>${settingsView()}<button class="primary wide">Egyéni játék indítása →</button></form>
      <aside><section class="panel wizard-note"><div class="hero-symbol" aria-hidden="true">✧</div><h3>A saját roxforti próbatételed</h3><p class="muted">Válaszd ki azokat a filmeket, amelyeket már láttál. A kérdések véletlen sorrendben, ismétlés nélkül követik egymást.</p><p>✦ Négy válasz, egy helyes<br>✦ Egyedi képekkel illusztrált kérdések<br>✦ Számtippek: a pontosság számít</p></section>
      <section class="panel"><h3>Hogyan számoljuk a pontokat?</h3><p class="muted small">Helyes felelet: 1000 pont. Számtipp: 1000 ÷ (1 + eltérés), egészre kerekítve. Kihagyás: 0 pont. Nincs gyorsasági bónusz.</p><p class="muted small">A kvíz közvetlenül a böngésződben fut. Nincs szükség regisztrációra. Az oldal frissítése új játékot kezd.</p></section></aside></div>`;
  }
  function render() {
    if (viewMode === 'online') { if (shared) renderShared(); else onlineHome(); return; }
    if (!solo) { home(); return; }
    if (solo.phase === 'end') {
      app.innerHTML = `<section class="question center"><p class="eyebrow">Próbatétel teljesítve</p><h1>Varázslatos játék!</h1><p class="result">${solo.score} pont</p><p class="muted">${solo.deck.length} kérdés · legfeljebb ${solo.deck.length * 1000} pont</p><button class="primary" data-action="leave">Új próbatétel</button></section>`;
      return;
    }
    const q = solo.deck[solo.round], revealed = solo.phase === 'reveal';
    app.innerHTML = `<section class="question"><div class="row"><span class="eyebrow">${solo.round + 1} / ${solo.deck.length} kérdés</span><span id="clock" class="timer" role="timer" aria-label="Hátralévő idő"></span></div><progress value="${solo.round + 1}" max="${solo.deck.length}" aria-label="Haladás"></progress>
      <p class="muted small">${q.film}. ${esc(films[q.film - 1])} · ${q.type === 'number' ? 'Számtipp' : q.type === 'picture' ? 'Képes kérdés' : 'Feleletválasztás'}</p><h2>${esc(q.text)}</h2>${q.image ? `<img class="illustration" src="images/${esc(q.image)}.webp" alt="A kérdéshez tartozó varázsvilágbeli tárgy illusztrációja">` : ''}
      ${q.type === 'number' ? `<form data-form="answer"><label>A tipped<input name="answer" type="number" min="0" max="1000000" step="any" required ${revealed ? 'disabled' : ''} value="${esc(solo.guess ?? '')}" placeholder="Írj egy számot"></label>${!revealed ? '<button class="primary wide">Beküldöm a tippem</button>' : ''}</form>` : `<div class="answers">${q.options.map((text, i) => `<button class="answer ${revealed && i === q.answer ? 'correct' : ''} ${revealed && i === solo.guess && i !== q.answer ? 'wrong' : ''}" data-answer="${i}" ${revealed ? 'disabled' : ''}><b>${'ABCD'[i]}</b><span>${esc(text)}</span></button>`).join('')}</div>`}
      ${revealed ? `<section class="panel"><p class="eyebrow">A helyes válasz</p><h3>${esc(q.type === 'number' ? q.answer : q.options[q.answer])}</h3><p>${esc(q.explanation)}</p><p class="stat">+${solo.gain} pont · Összesen ${solo.score} pont</p></section><button class="primary wide" data-action="next">${solo.round + 1 >= solo.deck.length ? 'Végeredmény →' : 'Következő kérdés →'}</button>` : '<p class="muted small">Az idő lejártával a kérdés lezárul.</p>'}
      <button class="wide" data-action="leave">Vissza a kezdőlapra</button></section>`;
    clock();
  }
  function soloStart(value) {
    const pool = shuffle(questions.filter(q => value.films.includes(q.film) && (value.mode === 'mixed' || q.type === value.mode))).slice(0, value.count).map(q => {
      if (!q.options) return { ...q };
      const order = shuffle([0, 1, 2, 3]); return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
    });
    solo = { phase: 'question', deck: pool, round: 0, score: 0, seconds: value.seconds, deadline: Date.now() + value.seconds * 1000 }; render();
  }
  function answer(value) {
    if (!solo || solo.phase !== 'question') return;
    const q = solo.deck[solo.round];
    if (Date.now() >= solo.deadline) value = undefined;
    solo.guess = value; solo.gain = value === undefined ? 0 : score(q, value);
    solo.score += solo.gain; solo.phase = 'reveal'; render();
  }
  function run(fn) {
    notify('');
    try { fn(); } catch (e) { notify(e.message); }
  }
  app.addEventListener('submit', event => {
    event.preventDefault(); const form = event.target;
    run(() => {
      if (form.dataset.form === 'setup') soloStart(settings(form));
      else if (form.dataset.form === 'answer') {
        const raw = form.elements.answer.value.trim(), value = Number(raw);
        if (!raw || !Number.isFinite(value) || value < 0 || value > 1000000) throw new Error('Adj meg egy 0 és 1 000 000 közötti számot!');
        answer(value);
      }
    });
  });
  app.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.answer !== undefined) { answer(Number(button.dataset.answer)); return; }
    if (button.dataset.action === 'leave') {
      if (solo && solo.phase !== 'end' && !confirm('Visszalépsz a kezdőlapra? A mostani játékod véget ér.')) return;
      solo = null; notify(''); render();
    } else if (button.dataset.action === 'next' && solo?.phase === 'reveal') {
      solo.round++; solo.guess = undefined;
      solo.phase = solo.round >= solo.deck.length ? 'end' : 'question';
      solo.deadline = Date.now() + solo.seconds * 1000; render();
    }
  });
  function clock() {
    if (!solo || solo.phase !== 'question') return;
    const left = Math.max(0, Math.ceil((solo.deadline - Date.now()) / 1000));
    const element = document.getElementById('clock'); if (element) element.textContent = left + ' mp';
    if (left === 0) answer(undefined);
  }
  const apiMeta = document.querySelector('meta[name="hp-api-origin"]');
  const apiOrigin = new URL(apiMeta?.content || location.origin).origin;
  const sessionKey = 'hp.online.session';
  const readSession = () => { try { const s = JSON.parse(localStorage.getItem(sessionKey)); return /^[A-Z0-9]{8}$/.test(s?.code || '') && /^[a-f0-9]{64}$/.test(s?.memberToken || '') ? s : null; } catch { return null; } };
  const invite = new URL(location.href).searchParams.get('room') || '';
  let session = readSession(), shared = null, viewMode = invite || session ? 'online' : 'solo';
  let onlineEpoch = 0, onlineBusy = false, pollBusy = false, onlineError = '', connection = navigator.onLine === false ? 'offline' : 'connecting';
  let serverOffset = 0, sharedViewKey = '', lastAcceptedAt = 0;
  const requests = new Set();
  const knownImages = new Set(['owl', 'diary', 'map', 'goblet', 'quill', 'potion', 'locket', 'hallows']);
  const modeTabs = () => `<nav class="mode-tabs" aria-label="Játékmód"><button type="button" data-mode="solo" aria-pressed="${viewMode === 'solo'}" class="${viewMode === 'solo' ? 'active' : ''}">Egyedül</button><button type="button" data-mode="online" aria-pressed="${viewMode === 'online'}" class="${viewMode === 'online' ? 'active' : ''}">Közös játék</button></nav>`;
  function rememberSession(value) { session = value; try { if (value) localStorage.setItem(sessionKey, JSON.stringify(value)); else localStorage.removeItem(sessionKey); } catch { /* This tab also works without persistent storage. */ } }
  function abortOnline() { onlineEpoch++; for (const controller of requests) controller.abort(); requests.clear(); pollBusy = false; onlineBusy = false; }
  function clearInvite() { const url = new URL(location.href); if (url.searchParams.has('room')) { url.searchParams.delete('room'); history.replaceState({}, '', url.pathname + url.search + url.hash); } }
  function onlineMessage(message = '') { onlineError = message; const target = document.getElementById('hp-online-error'); if (target) { target.textContent = message; target.hidden = !message; } }
  function connectionView() { return `<p id="hp-connection" class="connection-status" role="status" aria-live="polite"></p><p id="hp-online-error" class="online-error" role="alert" ${onlineError ? '' : 'hidden'}>${esc(onlineError)}</p>`; }
  function setConnection(value) {
    connection = navigator.onLine === false ? 'offline' : value;
    const element = document.getElementById('hp-connection');
    if (element) { element.dataset.state = connection; element.textContent = connection === 'offline' ? 'Nincs internetkapcsolat. Visszakapcsolódás után folytatjuk.' : connection === 'connecting' ? 'Kapcsolódunk a közös játékhoz…' : connection === 'retry' ? 'A kapcsolat megszakadt. Újra próbálkozunk; a mentett játékod megmarad.' : 'Kapcsolat rendben · a közös játék automatikusan frissül'; }
  }
  function onlineHome() {
    app.innerHTML = `${modeTabs()}<section id="hp-online"><p class="eyebrow">Külön telefon · közös próbatétel</p><h1>Hívjátok össze<br>a varázslótársakat.</h1><p class="lead">Egyikőtök létrehoz egy szobát, a többiek a nyolc karakteres kóddal csatlakoznak. Ugyanazok a kérdések, saját válaszok és közös eredménytábla.</p>${connectionView()}
    <div class="layout"><form class="panel" data-online-form="create"><h2>Új közös játék</h2><label>A neved<input name="name" autocomplete="nickname" maxlength="24" required placeholder="Így szerepelsz a játékban"></label>${settingsView()}<button class="primary wide" data-online-command>Szoba létrehozása →</button></form>
    <aside><form class="panel" data-online-form="join"><h2>Van már szobakódod?</h2><label>A neved<input name="name" autocomplete="nickname" maxlength="24" required placeholder="A játékosneved"></label><label>Szobakód<input class="room-code-input" name="code" maxlength="8" minlength="8" pattern="[A-Za-z0-9]{8}" autocapitalize="characters" autocomplete="off" spellcheck="false" required value="${esc(invite.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}" placeholder="8 karakter"></label><button class="primary wide" data-online-command>Csatlakozom →</button></form>
    <section class="panel"><h3>Hogyan játszotok?</h3><ol class="online-steps"><li>Oszd meg a szobakódot vagy a meghívólinket.</li><li>A házigazda indítja a játékot, amikor mindenki megérkezett.</li><li>Válaszoljatok a saját telefonotokon. A helyes megfejtés a kör végén derül ki.</li><li>A házigazda lépteti a következő kérdést.</li></ol><p class="muted small">2–8 játékos · a szoba 24 órán át érhető el. A közös módhoz internet kell; az egyéni kvíz továbbra is szerver nélkül működik.</p></section></aside></div></section>`;
    setConnection(connection);
    if (session) { app.querySelector('#hp-online').innerHTML = `<section class="panel center"><p class="eyebrow">Vissza a közös játékba</p><h2>Megkeressük a szobádat…</h2><p class="code">${esc(session.code)}</p>${connectionView()}<button type="button" data-online-action="retry">Újrapróbálom</button> <button type="button" data-online-action="leave">Vissza a kezdőlapra</button></section>`; setConnection(connection); }
  }
  async function onlineAPI(path, { method = 'GET', body, token = session?.memberToken } = {}) {
    const epoch = onlineEpoch, controller = new AbortController(); requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(new URL('/api/hp' + path, apiOrigin), { method, credentials: 'omit', headers: { ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), ...(token ? { 'X-HP-Token': token } : {}) }, ...(method === 'POST' ? { body: JSON.stringify(body || {}) } : {}), signal: controller.signal, cache: 'no-store' });
      const data = await response.json();
      if (epoch !== onlineEpoch) throw Object.assign(new Error('Korábbi kérés.'), { stale: true });
      if (!response.ok) throw Object.assign(new Error(data.error || 'A művelet nem sikerült. Próbáld újra.'), { status: response.status, code: data.code });
      return data;
    } catch (error) {
      if (epoch !== onlineEpoch) throw Object.assign(new Error('Korábbi kérés.'), { stale: true });
      if (error.status) throw error;
      throw new Error(navigator.onLine === false ? 'Nincs internetkapcsolat. Kapcsolódás után próbáld újra.' : 'Nem sikerült kapcsolódni. A mentett válaszok megmaradnak; próbáld újra.');
    } finally { clearTimeout(timeout); requests.delete(controller); }
  }
  function handleOnlineError(error, { connected = true } = {}) {
    if (error.stale) return;
    if (connected && [401, 404, 410].includes(error.status)) {
      abortOnline(); rememberSession(null); shared = null; sharedViewKey = ''; lastAcceptedAt = 0;
      onlineError = error.status === 410 ? 'Ez a szoba lejárt. Indítsatok új közös próbatételt.' : 'Ez a szoba már nem érhető el ezen a telefonon. Csatlakozz újra vagy indíts új játékot.';
      onlineHome(); return;
    }
    onlineMessage(error.message); setConnection(error.status ? 'connected' : 'retry');
  }
  function acceptShared(data) {
    if (!session || data.code !== session.code || viewMode !== 'online') return false;
    const phases = { lobby: 0, question: 1, reveal: 2, end: 3 };
    if (!Object.prototype.hasOwnProperty.call(phases, data.phase) || !data.me || !Array.isArray(data.players)) throw new Error('A közös játék válasza most nem használható. Próbáld újra.');
    if (shared) {
      const currentRevision = Number(shared.revision ?? (shared.round * 3 + phases[shared.phase]));
      const revision = Number(data.revision ?? (data.round * 3 + phases[data.phase]));
      if (revision < currentRevision || (revision === currentRevision && Number(data.serverNow) < lastAcceptedAt)) return false;
      if (data.round === shared.round && data.phase === shared.phase && shared.me.answered && !data.me.answered) return false;
    }
    shared = data; lastAcceptedAt = Number(data.serverNow) || Date.now(); serverOffset = lastAcceptedAt - Date.now();
    onlineMessage(); setConnection('connected'); renderShared(); return true;
  }
  function scoreboard() {
    const players = [...(shared?.players || [])].sort((a, b) => Number(b.score) - Number(a.score) || String(a.name).localeCompare(String(b.name), 'hu'));
    return `<div id="hp-scoreboard" class="tally" aria-label="Közös eredménytábla">${players.map((player, index) => `<div class="hp-player" data-player-id="${esc(player.id)}"><span><b>${index + 1}.</b> ${esc(player.name)}${player.id === shared.me.id ? ' <small>(te)</small>' : ''}${shared.phase === 'question' ? `<small class="player-status">${player.answered ? '✓ Válaszolt' : 'Még gondolkodik'}</small>` : ''}</span><strong class="hp-score">${Number(player.score) || 0} pont</strong></div>`).join('')}</div>`;
  }
  function roomTop() { return `<div class="online-room-head"><span class="pill">Közös próbatétel · ${esc(shared.code)}</span><button class="quiet" type="button" data-online-action="leave">Kilépés</button></div>${connectionView()}`; }
  function renderShared() {
    if (!shared || viewMode !== 'online') return;
    const key = [shared.code, shared.phase, shared.round, shared.me.answered ? 1 : 0, shared.question?.id || '', shared.me.isHost ? 1 : 0].join(':');
    if (key === sharedViewKey && document.getElementById('hp-phase')) { updateSharedLive(); return; }
    sharedViewKey = key;
    const host = shared.me.isHost, q = shared.question;
    let content = '';
    if (shared.phase === 'lobby') {
      content = `<section class="panel center"><p class="eyebrow">A roxforti társaság gyülekezik</p><h1 class="lobby-title">Várjuk a játékosokat.</h1><p class="muted">Ezzel a kóddal csatlakozhattok a saját telefonotokról:</p><p id="hp-room-code" class="code">${esc(shared.code)}</p><button type="button" data-online-action="copy">Meghívólink másolása</button><p class="muted small">${shared.total} kérdés · kérdésenként ${shared.settings?.seconds || 30} mp · legfeljebb 8 játékos</p><div id="hp-roster">${scoreboard()}</div>${host ? '<button type="button" class="primary wide" data-online-action="start" data-online-command>Indulhat a közös játék →</button><p id="hp-start-hint" class="muted small"></p>' : '<p class="wait">A házigazda indítja a játékot, amikor mindenki megérkezett.</p>'}</section>`;
    } else if (shared.phase === 'end') {
      content = `<section class="panel center"><p class="eyebrow">Közös próbatétel teljesítve</p><h1>Varázslatos társaság!</h1><p class="muted">${shared.total} kérdés · a közös játék végeredménye</p>${scoreboard()}<button type="button" class="primary wide" data-online-action="new">Új közös próbatétel</button></section>`;
    } else if (q) {
      const revealed = shared.phase === 'reveal', answered = shared.me.answered;
      const correct = shared.reveal?.answer;
      const ownAnswer = shared.me.answer;
      const image = knownImages.has(q.image) ? `<img class="illustration" src="images/${q.image}.svg" alt="A kérdéshez tartozó varázsvilágbeli tárgy illusztrációja">` : '';
      const options = Array.isArray(q.options) ? q.options : [];
      const answers = q.type === 'number' ? `<form data-online-form="answer"><label>A tipped<input name="answer" type="number" min="0" max="1000000" step="any" inputmode="decimal" required value="${esc(ownAnswer ?? '')}" placeholder="Írj egy számot" ${revealed || answered ? 'disabled' : ''}></label>${!revealed && !answered ? '<button class="primary wide" data-online-command>Beküldöm a tippem</button>' : ''}</form>` : `<div class="answers">${options.map((option, index) => `<button type="button" class="answer ${revealed && index === correct ? 'correct' : ''} ${revealed && ownAnswer === index && index !== correct ? 'wrong' : ''}" data-online-answer="${index}" ${revealed || answered ? 'disabled' : ''}><b>${'ABCD'[index] || ''}</b><span>${esc(option)}</span></button>`).join('')}</div>`;
      const personal = (shared.reveal?.results || []).find(result => result.id === shared.me.id);
      const correctText = q.type === 'number' ? correct : options[correct];
      content = `<section class="question"><div class="row"><span class="eyebrow">${shared.round + 1} / ${shared.total} kérdés</span><span id="hp-clock" class="timer" role="timer" aria-label="Hátralévő idő"></span></div><progress value="${shared.round + 1}" max="${shared.total}" aria-label="Haladás"></progress><p class="muted small">${Number(q.film)}. ${esc(films[Number(q.film) - 1] || '')} · ${q.type === 'number' ? 'Számtipp' : q.type === 'picture' ? 'Képes kérdés' : 'Feleletválasztás'}</p><h2>${esc(q.text)}</h2>${image}${answers}
      ${revealed ? `<section class="panel reveal-panel"><p class="eyebrow">A helyes válasz</p><h3>${esc(correctText ?? '—')}</h3><p>${esc(shared.reveal?.explanation || '')}</p><p class="stat">+${Number(personal?.gain) || 0} pont ebben a körben</p></section>` : `<p id="hp-answer-status" class="wait" role="status">${answered ? ownAnswer === null ? 'Kihagytad ezt a kérdést. Várjuk a többieket.' : 'Válaszod mentve. Várjuk a többieket.' : 'Válaszolj a saját telefonodon. A többiek válaszát a kör végéig nem látod.'}</p>${!answered ? '<button class="wide quiet" type="button" data-online-action="skip" data-online-command>Kihagyom ezt a kérdést</button>' : ''}`}
      <section class="panel results-panel"><h3>Közös eredménytábla</h3>${scoreboard()}</section>
      ${host ? revealed ? `<button class="primary wide" type="button" data-online-action="next" data-online-command>${shared.round + 1 >= shared.total ? 'Végeredmény →' : 'Következő kérdés →'}</button>` : '<button class="wide quiet" type="button" data-online-action="reveal" data-online-command>Kérdés lezárása</button>' : `<p class="muted small center">${revealed ? 'A házigazda indítja a következő kérdést.' : 'Ha mindenki válaszolt vagy lejárt az idő, megmutatjuk a megfejtést.'}</p>`}</section>`;
    }
    app.innerHTML = `<section id="hp-online">${roomTop()}<div id="hp-phase" data-phase="${esc(shared.phase)}">${content}</div></section>`;
    updateSharedLive();
  }
  function onlineSeconds() { return shared?.phase === 'question' ? Math.max(0, Math.ceil((Number(shared.deadline) - (Date.now() + serverOffset)) / 1000)) : 0; }
  function updateSharedLive() {
    if (!shared || viewMode !== 'online') return;
    setConnection(connection);
    const board = document.getElementById('hp-scoreboard'); if (board) board.outerHTML = scoreboard();
    const clockElement = document.getElementById('hp-clock'); if (clockElement) clockElement.textContent = shared.phase === 'question' ? `${onlineSeconds()} mp` : 'Lezárva';
    const hint = document.getElementById('hp-start-hint'); if (hint) hint.textContent = shared.players.length < 2 ? 'Legalább két játékos szükséges az induláshoz.' : `${shared.players.length} játékos érkezett meg. Ha mindenki itt van, indulhat a játék.`;
    for (const button of app.querySelectorAll('[data-online-command]')) {
      let locked = onlineBusy;
      if (button.dataset.onlineAction === 'start') locked ||= shared.players.length < 2;
      if (button.closest('[data-online-form="answer"]') || button.dataset.onlineAction === 'skip') locked ||= shared.phase !== 'question' || shared.me.answered || onlineSeconds() <= 0;
      button.disabled = locked;
    }
    for (const button of app.querySelectorAll('[data-online-answer]')) button.disabled = onlineBusy || shared.phase !== 'question' || shared.me.answered || onlineSeconds() <= 0;
    const input = app.querySelector('[data-online-form="answer"] input'); if (input) input.disabled = onlineBusy || shared.phase !== 'question' || shared.me.answered || onlineSeconds() <= 0;
  }
  async function pollShared() {
    if (viewMode !== 'online' || !session || pollBusy || onlineBusy || document.hidden || navigator.onLine === false) return;
    const epoch = onlineEpoch, code = session.code; pollBusy = true;
    try { const data = await onlineAPI(`/rooms/${encodeURIComponent(code)}`); if (epoch === onlineEpoch && session?.code === code) acceptShared(data); }
    catch (error) { if (epoch === onlineEpoch) handleOnlineError(error); }
    finally { if (epoch === onlineEpoch) pollBusy = false; }
  }
  async function setupShared(form, join) {
    if (onlineBusy) return;
    onlineMessage(); onlineBusy = true;
    for (const button of app.querySelectorAll('[data-online-command]')) button.disabled = true;
    const epoch = onlineEpoch;
    try {
      const values = new FormData(form), name = String(values.get('name') || '').trim();
      if (!name || name.length > 24) throw new Error('Adj meg egy legfeljebb 24 karakteres játékosnevet.');
      const payload = join ? { name, code: String(values.get('code') || '').trim().toUpperCase() } : { name, settings: settings(form) };
      const data = await onlineAPI(join ? '/rooms/join' : '/rooms', { method: 'POST', body: payload, token: '' });
      if (epoch !== onlineEpoch) return;
      if (!/^[a-f0-9]{64}$/.test(data.memberToken || '') || !/^[A-Z0-9]{8}$/.test(data.code || '')) throw new Error('A csatlakozás most nem sikerült. Próbáld újra.');
      shared = null; sharedViewKey = ''; lastAcceptedAt = 0;
      rememberSession({ code: data.code, memberToken: data.memberToken }); acceptShared(data);
    } catch (error) { if (epoch === onlineEpoch) handleOnlineError(error, { connected: false }); }
    finally { if (epoch === onlineEpoch) { onlineBusy = false; if (shared) updateSharedLive(); else for (const button of app.querySelectorAll('[data-online-command]')) button.disabled = false; } }
  }
  async function sharedCommand(action, answerValue) {
    if (!session || !shared || onlineBusy) return;
    const epoch = onlineEpoch, code = session.code, round = shared.round;
    onlineBusy = true; onlineMessage(); updateSharedLive();
    try {
      const data = await onlineAPI(`/rooms/${encodeURIComponent(code)}/${action}`, { method: 'POST', body: { round, ...(action === 'answer' ? { answer: answerValue } : {}) } });
      if (epoch === onlineEpoch && session?.code === code) acceptShared(data);
    } catch (error) {
      if (epoch !== onlineEpoch) return;
      if (error.status === 409) { onlineMessage('A kör közben frissült. Megkeressük az aktuális állapotot.'); }
      else handleOnlineError(error);
    } finally { if (epoch === onlineEpoch) { onlineBusy = false; updateSharedLive(); pollShared(); } }
  }
  function leaveShared() {
    if (shared && shared.phase !== 'end' && !confirm('Kilépsz a közös játékból ezen a telefonon? A szoba a többieknek megmarad.')) return;
    abortOnline(); rememberSession(null); shared = null; sharedViewKey = ''; lastAcceptedAt = 0; clearInvite(); onlineError = ''; connection = 'connecting'; onlineHome();
  }
  function switchMode(mode) {
    if (!['solo', 'online'].includes(mode) || mode === viewMode) return;
    abortOnline(); viewMode = mode; solo = null; sharedViewKey = ''; notify('');
    render(); if (mode === 'online' && session) pollShared();
  }
  async function copySharedInvite() {
    if (!shared) return;
    const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('room', shared.code);
    try { await navigator.clipboard.writeText(url.href); onlineMessage('Meghívólink kimásolva. Küldd el a játékostársaknak!'); }
    catch { onlineMessage(`A meghívókód: ${shared.code}. Ezt írd meg a játékostársaknak.`); }
  }
  app.addEventListener('submit', event => {
    const form = event.target;
    if (!form.dataset.onlineForm) return;
    event.preventDefault();
    if (form.dataset.onlineForm === 'create' || form.dataset.onlineForm === 'join') { setupShared(form, form.dataset.onlineForm === 'join'); return; }
    if (form.dataset.onlineForm === 'answer') {
      const raw = form.elements.answer.value.trim(), value = Number(raw);
      if (!raw || !Number.isFinite(value) || value < 0 || value > 1000000) { onlineMessage('Adj meg egy 0 és 1 000 000 közötti számot!'); return; }
      sharedCommand('answer', value);
    }
  });
  app.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.mode) { switchMode(button.dataset.mode); return; }
    if (button.dataset.onlineAnswer !== undefined) { sharedCommand('answer', Number(button.dataset.onlineAnswer)); return; }
    const action = button.dataset.onlineAction;
    if (action === 'copy') copySharedInvite();
    else if (action === 'leave' || action === 'new') leaveShared();
    else if (action === 'retry') { if (session) pollShared(); }
    else if (action === 'skip') sharedCommand('answer', null);
    else if (['start', 'next', 'reveal'].includes(action)) sharedCommand(action);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pollShared(); });
  window.addEventListener('offline', () => { if (viewMode === 'online') setConnection('offline'); });
  window.addEventListener('online', () => { if (viewMode === 'online') { setConnection('connecting'); pollShared(); } });
  setInterval(pollShared, 2000);
  setInterval(() => { if (viewMode === 'online' && shared) updateSharedLive(); }, 250);

  setInterval(clock, 250);
  render();
  if (viewMode === 'online' && session) pollShared();
})();
