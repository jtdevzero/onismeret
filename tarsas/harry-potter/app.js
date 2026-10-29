/* A Pages-en egyéni játék; a mellékelt Node-szerveren valódi közös szobák. */
(() => {
  'use strict';
  const { films, questions } = window.HP_DATA;
  const app = document.getElementById('app'), notice = document.getElementById('notice');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const key = 'tarsas.hp.room.v1';
  let online = false, room = null, auth = null, solo = null, pending = false, lastSignature = '', clockOffset = 0;
  let preferences = { films: [1], mode: 'mixed', count: 10, seconds: 30 };
  let invite = new URLSearchParams(location.search).get('room') || '';
  const notify = message => { notice.textContent = message || ''; };
  const store = () => { try { if (auth) sessionStorage.setItem(key, JSON.stringify(auth)); else sessionStorage.removeItem(key); } catch {} };
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
    app.innerHTML = `<p class="eyebrow">Nyolc film · egy varázsvilág</p><h1>Mennyire ismered<br>Roxfort titkait?</h1><p class="lead">Válassz filmrészeket, ismerj fel varázstárgyakat, és mérd össze a tudásod a barátaiddal.</p>
      <div class="layout"><form class="panel" data-form="setup"><h2>Állítsd össze a próbatételt</h2>${settingsView()}<button class="primary wide" name="play" value="solo">Egyéni játék indítása →</button>${online ? '<hr><label>Neved a szobában<input name="name" maxlength="24" placeholder="Például: Hermione" autocomplete="nickname"></label><button class="wide" name="play" value="room">Kódos szoba létrehozása</button>' : ''}</form>
      <aside><section class="panel"><div class="hero-symbol" aria-hidden="true">✧</div><h3>Együtt erősebb a varázslat</h3><p class="muted">A játékmester szobát nyit, a többiek a hatjegyű kóddal csatlakoznak. Mindenki saját telefonon válaszol.</p>${online ? `<form data-form="join"><label>Neved<input name="name" maxlength="24" required autocomplete="nickname"></label><label>Szobakód<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" value="${esc(/^\d{6}$/.test(invite) ? invite : '')}" placeholder="123456" required></label><button class="primary wide">Csatlakozom →</button></form>` : '<p class="wait">Ezen a címen az egyéni mód érhető el. A szobás játékot a külön futó játékszerver címén tudjátok megnyitni.</p><details class="server-box"><summary>Van játékszerver-címed?</summary><form data-form="server"><label>A játékszerver webcíme<input type="url" name="url" placeholder="https://kviz.pelda.hu/" required></label><button class="wide">Szobás játék megnyitása ↗</button></form></details>'}</section>
      <section class="panel"><h3>Háromféle kihívás</h3><p>✦ Négy válasz, egy helyes<br>✦ Saját rajzokkal illusztrált kérdések<br>✦ Számtippek: a pontosság számít</p><p class="muted small">Helyes felelet: 1000 pont. Számtipp: 1000 ÷ (1 + eltérés), egészre kerekítve. Kihagyás: 0 pont. Nincs gyorsasági bónusz.</p></section></aside></div>`;
  }
  const leaderboard = (players, gains = false) => `<section class="panel"><h3>Ranglista</h3><div class="tally">${players.slice().sort((a, b) => b.score - a.score).map((p, i) => `<div><span>${i + 1}. ${esc(p.name)}</span><strong>${p.score} pont${gains ? ` <small>(+${p.gain || 0})</small>` : ''}</strong></div>`).join('')}</div></section>`;
  function questionView(state, isSolo) {
    const q = state.question, revealed = state.phase === 'reveal', locked = revealed || state.submitted;
    const answer = isSolo ? solo.answer : state.answer;
    return `<section class="question"><div class="row"><span class="eyebrow">${state.round + 1} / ${state.total} kérdés</span><span id="clock" class="timer" role="timer" aria-label="Hátralévő idő"></span></div><progress value="${state.round + 1}" max="${state.total}" aria-label="Haladás"></progress>
      <p class="muted small">${q.film}. ${esc(films[q.film - 1])} · ${q.type === 'number' ? 'Számtipp' : q.type === 'picture' ? 'Képes kérdés' : 'Feleletválasztás'}</p><h2>${esc(q.text)}</h2>${q.image ? `<img class="illustration" src="images/${esc(q.image)}.svg" alt="A kérdéshez tartozó varázsvilágbeli tárgy illusztrációja">` : ''}
      ${q.type === 'number' ? `<form data-form="answer"><label>A tipped<input name="answer" type="number" min="0" max="1000000" step="any" required ${locked ? 'disabled' : ''} value="${state.submitted ? esc(isSolo ? solo.guess ?? '' : state.ownAnswer ?? '') : ''}" placeholder="Írj egy számot"></label>${!locked ? '<button class="primary wide">Beküldöm a tippem</button>' : ''}</form>` : `<div class="answers">${q.options.map((text, i) => `<button class="answer ${revealed && i === answer ? 'correct' : ''}" data-answer="${i}" ${locked ? 'disabled' : ''}><b>${'ABCD'[i]}</b><span>${esc(text)}</span></button>`).join('')}</div>`}
      ${revealed ? `<section class="panel"><p class="eyebrow">A helyes válasz</p><h3>${esc(q.type === 'number' ? answer : q.options[answer])}</h3><p>${esc(isSolo ? q.explanation : state.explanation)}</p>${isSolo ? `<p class="stat">+${solo.gain} pont · Összesen ${solo.score} pont</p>` : ''}</section>${!isSolo ? leaderboard(state.players, true) : ''}${isSolo || state.host ? `<button class="primary wide" data-action="next">${state.round + 1 >= state.total ? 'Végeredmény →' : 'Következő kérdés →'}</button>` : '<p class="wait">A játékmester indítja a következő kérdést.</p>'}` : `${state.submitted ? '<p class="wait">✓ Válasz rögzítve. Várunk a többiekre vagy az idő lejártára.</p>' : ''}${!isSolo ? `<p id="answersCount" class="muted small">${state.players.filter(p => p.answered).length} / ${state.players.length} válasz érkezett.</p>` : '<p class="muted small">Az idő lejártával a kérdés lezárul.</p>'}`}
      <button class="wide" data-action="leave">Vissza a kezdőlapra</button></section>`;
  }
  function render() {
    if (solo) {
      if (solo.phase === 'end') app.innerHTML = `<section class="question center"><p class="eyebrow">Próbatétel teljesítve</p><h1>Varázslatos játék!</h1><p class="result">${solo.score} pont</p><p class="muted">${solo.deck.length} kérdés · legfeljebb ${solo.deck.length * 1000} pont</p><button class="primary" data-action="leave">Új próbatétel</button></section>`;
      else app.innerHTML = questionView({ phase: solo.phase, question: solo.deck[solo.round], round: solo.round, total: solo.deck.length, submitted: solo.guess !== undefined, deadline: solo.deadline }, true);
    } else if (room) {
      if (room.phase === 'lobby') app.innerHTML = `<section class="question"><p class="eyebrow">Gyülekező a nagyteremben</p><h1>Hívd a többieket!</h1><p>A szoba csatlakozókódja</p><div class="code">${room.code}</div><p class="muted small break">${esc(joinLink())}</p><button data-action="copy">Meghívó másolása</button><section class="panel"><h3>Játékosok · ${room.players.length} / 24</h3><div class="tally">${room.players.map(p => `<div><span>${esc(p.name)}</span><span>${p.id === room.me ? 'Te' : 'Készen áll'}</span></div>`).join('')}</div></section><p class="muted">${room.total} kérdés · ${room.settings.seconds} mp / kérdés · ${room.settings.films.map(n => n + '. rész').join(', ')}</p>${room.host ? `<button class="primary wide" data-action="start" ${room.players.length < 2 ? 'disabled' : ''}>${room.players.length < 2 ? 'Várunk még legalább egy játékosra' : 'Induljon a kvíz →'}</button>` : '<p class="wait">A játékmester hamarosan elindítja a kvízt.</p>'}<button class="wide" data-action="leave">Kilépés</button></section>`;
      else if (room.phase === 'end') app.innerHTML = `<section class="question"><p class="eyebrow">A varázspárbaj véget ért</p><h1>Íme a végeredmény!</h1>${leaderboard(room.players)}<button class="primary wide" data-action="leave">Új játék</button></section>`;
      else app.innerHTML = questionView(room, false);
    } else home();
    clock();
  }
  function joinLink() { const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('room', room.code); return url.href; }
  async function api(route, data, useAuth = true) {
    const response = await fetch('api/' + route, { method: data === undefined ? 'GET' : 'POST', headers: { ...(data === undefined ? {} : { 'Content-Type': 'application/json' }), ...(useAuth && auth ? { Authorization: 'Bearer ' + auth.token } : {}) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }), cache: 'no-store', signal: AbortSignal.timeout(7000) });
    let value; try { value = await response.json(); } catch { throw new Error('A szobaszerver nem érhető el ezen a címen.'); }
    if (!response.ok) { const e = new Error(value.error || 'Sikertelen kérés.'); e.status = response.status; throw e; }
    return value;
  }
  function applyState(state) {
    clockOffset = state.serverNow - Date.now();
    const { serverNow, ...stable } = state, signature = JSON.stringify(stable);
    const keepInput = room && room.phase === 'question' && state.phase === 'question' && room.round === state.round && room.submitted === state.submitted;
    room = state;
    if (keepInput) {
      const count = document.getElementById('answersCount');
      if (count) count.textContent = state.players.filter(p => p.answered).length + ' / ' + state.players.length + ' válasz érkezett.';
      lastSignature = signature; clock(); return;
    }
    if (signature !== lastSignature) { lastSignature = signature; render(); }
  }
  async function mutate(action, data = {}) {
    if (!auth) return;
    const result = await api('rooms/' + auth.code + '/' + action, data);
    applyState(result);
  }
  function soloStart(value) {
    const pool = shuffle(questions.filter(q => value.films.includes(q.film) && (value.mode === 'mixed' || q.type === value.mode))).slice(0, value.count).map(q => {
      if (!q.options) return { ...q };
      const order = shuffle([0, 1, 2, 3]); return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
    });
    solo = { phase: 'question', deck: pool, round: 0, score: 0, seconds: value.seconds, deadline: Date.now() + value.seconds * 1000 }; render();
  }
  async function answer(value) {
    if (solo) {
      if (solo.phase !== 'question') return;
      const q = solo.deck[solo.round];
      if (Date.now() >= solo.deadline) value = undefined;
      solo.guess = value; solo.answer = q.answer; solo.gain = value === undefined ? 0 : score(q, value); solo.score += solo.gain; solo.phase = 'reveal'; render();
    } else if (room?.phase === 'question' && !room.submitted) await mutate('answer', { round: room.round, answer: value });
  }
  async function run(fn) {
    if (pending) return; pending = true; notify('');
    try { await fn(); }
    catch (e) { notify(e.name === 'TimeoutError' || e instanceof TypeError ? 'Nem érhető el a szobaszerver. Ellenőrizd a kapcsolatot, majd próbáld újra!' : e.message); }
    finally { pending = false; }
  }
  app.addEventListener('submit', event => {
    event.preventDefault(); const form = event.target;
    run(async () => {
      if (form.dataset.form === 'setup') {
        const value = settings(form);
        if (event.submitter?.value !== 'room') return soloStart(value);
        const result = await api('rooms', { name: form.elements.name.value, settings: value }, false);
        auth = { code: result.state.code, token: result.token }; store(); applyState(result.state);
      } else if (form.dataset.form === 'join') {
        const code = form.elements.code.value.trim();
        if (!/^\d{6}$/.test(code)) throw new Error('A szobakód hat számjegyből áll.');
        const result = await api('rooms/' + code + '/join', { name: form.elements.name.value }, false);
        auth = { code, token: result.token }; store(); applyState(result.state);
      } else if (form.dataset.form === 'answer') {
        const raw = form.elements.answer.value.trim(); const value = Number(raw);
        if (!raw || !Number.isFinite(value) || value < 0 || value > 1000000) throw new Error('Adj meg egy 0 és 1 000 000 közötti számot!');
        await answer(value);
      } else if (form.dataset.form === 'server') {
        const url = new URL(form.elements.url.value);
        if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('HTTPS-címet adj meg (helyben localhost is használható).');
        location.assign(url.href);
      }
    });
  });
  app.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.answer !== undefined) { run(() => answer(Number(button.dataset.answer))); return; }
    const action = button.dataset.action; if (!action) return;
    run(async () => {
      if (action === 'leave') {
        if ((room && room.phase !== 'end') || (solo && solo.phase !== 'end')) if (!confirm('Visszalépsz a kezdőlapra? A játékod itt véget ér.')) return;
        auth = null; room = null; solo = null; lastSignature = ''; store(); render();
      } else if (action === 'copy') {
        try { await navigator.clipboard.writeText(joinLink()); notify('Meghívó kimásolva!'); }
        catch { notify('A meghívót a szobakód alatt találod; onnan kézzel is kimásolhatod.'); }
      } else if (action === 'next' && solo) {
        if (solo.phase !== 'reveal') return;
        solo.round++; solo.guess = undefined;
        solo.phase = solo.round >= solo.deck.length ? 'end' : 'question'; solo.deadline = Date.now() + solo.seconds * 1000; render();
      } else if (action === 'next' || action === 'start') await mutate(action, { round: room.round });
    });
  });
  function clock() {
    const state = solo || room;
    if (!state || state.phase !== 'question') return;
    const left = Math.max(0, Math.ceil((state.deadline - Date.now() - (solo ? 0 : clockOffset)) / 1000));
    const element = document.getElementById('clock'); if (element) element.textContent = left + ' mp';
    if (solo && left === 0) answer(undefined);
  }
  setInterval(clock, 250);
  async function poll() {
    if (!auth || pending) return;
    pending = true;
    try { applyState(await api('rooms/' + auth.code)); notify(''); }
    catch (e) {
      if (e.status === 401 || e.status === 404) { auth = null; room = null; store(); lastSignature = ''; render(); }
      notify(e.status ? e.message : 'Kapcsolódás újra… A játék frissül, amint eléred a szervert.');
    } finally { pending = false; }
  }
  async function boot() {
    render();
    try { const result = await api('health', undefined, false); online = result.quiz === 'harry-potter'; } catch {}
    if (online) {
      try { const saved = JSON.parse(sessionStorage.getItem(key)); if (/^\d{6}$/.test(saved?.code) && /^[a-f0-9]{48}$/.test(saved?.token)) auth = saved; } catch {}
      if (auth) await poll();
      setInterval(poll, 1200);
    }
    if (!room && !solo) render();
  }
  boot();
})();
