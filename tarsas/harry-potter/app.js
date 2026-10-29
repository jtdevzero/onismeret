/* Egyéni Harry Potter-kvíz: teljesen a böngészőben fut, szerver nélkül. */
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
    app.innerHTML = `<p class="eyebrow">Nyolc film · egy varázsvilág</p><h1>Mennyire ismered<br>Roxfort titkait?</h1><p class="lead">Válassz filmrészeket, ismerj fel varázstárgyakat, és teszteld a tudásod egy saját próbatételben.</p>
      <div class="layout"><form class="panel" data-form="setup"><h2>Állítsd össze a próbatételt</h2>${settingsView()}<button class="primary wide">Egyéni játék indítása →</button></form>
      <aside><section class="panel"><div class="hero-symbol" aria-hidden="true">✧</div><h3>A saját roxforti próbatételed</h3><p class="muted">Válaszd ki azokat a filmeket, amelyeket már láttál. A kérdések véletlen sorrendben, ismétlés nélkül követik egymást.</p><p>✦ Négy válasz, egy helyes<br>✦ Saját rajzokkal illusztrált kérdések<br>✦ Számtippek: a pontosság számít</p></section>
      <section class="panel"><h3>Hogyan számoljuk a pontokat?</h3><p class="muted small">Helyes felelet: 1000 pont. Számtipp: 1000 ÷ (1 + eltérés), egészre kerekítve. Kihagyás: 0 pont. Nincs gyorsasági bónusz.</p><p class="muted small">A kvíz közvetlenül a böngésződben fut. Nincs szükség regisztrációra. Az oldal frissítése új játékot kezd.</p></section></aside></div>`;
  }
  function render() {
    if (!solo) { home(); return; }
    if (solo.phase === 'end') {
      app.innerHTML = `<section class="question center"><p class="eyebrow">Próbatétel teljesítve</p><h1>Varázslatos játék!</h1><p class="result">${solo.score} pont</p><p class="muted">${solo.deck.length} kérdés · legfeljebb ${solo.deck.length * 1000} pont</p><button class="primary" data-action="leave">Új próbatétel</button></section>`;
      return;
    }
    const q = solo.deck[solo.round], revealed = solo.phase === 'reveal';
    app.innerHTML = `<section class="question"><div class="row"><span class="eyebrow">${solo.round + 1} / ${solo.deck.length} kérdés</span><span id="clock" class="timer" role="timer" aria-label="Hátralévő idő"></span></div><progress value="${solo.round + 1}" max="${solo.deck.length}" aria-label="Haladás"></progress>
      <p class="muted small">${q.film}. ${esc(films[q.film - 1])} · ${q.type === 'number' ? 'Számtipp' : q.type === 'picture' ? 'Képes kérdés' : 'Feleletválasztás'}</p><h2>${esc(q.text)}</h2>${q.image ? `<img class="illustration" src="images/${esc(q.image)}.svg" alt="A kérdéshez tartozó varázsvilágbeli tárgy illusztrációja">` : ''}
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
  setInterval(clock, 250);
  render();
})();
