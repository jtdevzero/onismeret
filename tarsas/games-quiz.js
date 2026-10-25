/* Skála és Becsüld meg! — offline, kézről kézre játszható játékok. */
(function () {
  'use strict';

  Object.assign(GAMES, {
    scale: { name: 'Skála', emo: '🎚️', c: '#d7a4ff', desc: 'Egy titkos pont, egy példa: eltaláljátok, mire gondolt?', min: 3, max: 24, time: 15, difficulty: 'Könnyű', tags: ['csapat', 'beszélgetős', 'családi'] },
    estimate: { name: 'Becsüld meg!', emo: '🔢', c: '#66dbb2', desc: 'Titkos számtippek: a legközelebbi válasz nyer.', min: 2, max: 24, time: 15, difficulty: 'Könnyű', tags: ['versengő', 'kvíz', 'családi'] }
  });

  const AXES = [
    ['Hétköznapi', 'Elképesztően luxus'], ['Apró kellemetlenség', 'Teljes katasztrófa'],
    ['Teljesen csendes', 'Fülsiketítő'], ['Kényelmes', 'Nagyon kényelmetlen'],
    ['Jéghideg', 'Tűzforró'], ['Könnyen megtanulható', 'Évekig kell gyakorolni'],
    ['Megnyugtató', 'Félelmetes'], ['Lassú', 'Villámgyors'], ['Olcsó hobbi', 'Drága hobbi'],
    ['Unalmas program', 'Életre szóló élmény'], ['Kis meglepetés', 'Óriási meglepetés'],
    ['Biztonságos', 'Kockázatos'], ['Kevés előkészület', 'Rengeteg előkészület'],
    ['Otthoni hangulat', 'Ünnepélyes hangulat'], ['Rövid utazás', 'Hosszú utazás'],
    ['Puha', 'Kemény'], ['Könnyű csomag', 'Nehéz csomag'], ['Ismerős íz', 'Szokatlan íz'],
    ['Hétköznapi ajándék', 'Nagyon személyes ajándék'], ['Egyszerű ötlet', 'Összetett ötlet'],
    ['Magányos tevékenység', 'Társas tevékenység'], ['Alig rendetlen', 'Teljes káosz'],
    ['Kicsi állat', 'Hatalmas állat'], ['Könnyű elfelejteni', 'Lehetetlen elfelejteni'],
    ['Rögtön megoldható', 'Hónapokig tartó feladat'], ['Visszafogott öltözék', 'Feltűnő öltözék'],
    ['Kevés türelem kell', 'Végtelen türelem kell'], ['Korai program', 'Késő esti program']
  ];
  const SOURCE = {
    prefix: ['BIPM · SI-előtagok', 'https://www.bipm.org/en/measurement-units/si-prefixes'],
    si: ['BIPM · SI-meghatározások', 'https://www.bipm.org/en/measurement-units/'],
    nist: ['NIST · Mértékegységek átváltása', 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9'],
    chess: ['FIDE · A sakk szabályai, 2. cikk', 'https://handbook.fide.com/chapter/e012023']
  };
  // Rögzített definíciók és az azokból számolt értékek; ellenőrizve: 2026-10-25.
  const QUESTIONS = [
    ['Hány másodperc egy pontosan 24 órás nap?', 86400, 'másodperc', '24 × 60 × 60 = 86 400.', 'nist'],
    ['Hány perc egy pontosan hétnapos hét?', 10080, 'perc', '7 × 24 × 60 = 10 080.', 'nist'],
    ['Hány másodperc telik el 3 óra 25 perc alatt?', 12300, 'másodperc', '3 × 3600 + 25 × 60 = 12 300.', 'nist'],
    ['Hány óra egy 365 napos év?', 8760, 'óra', '365 × 24 = 8760. A kérdés nem szökőévre szól.', 'nist'],
    ['Hány másodperc egy 365 napos év?', 31536000, 'másodperc', '365 × 24 × 60 × 60 = 31 536 000.', 'nist'],
    ['Hány méter egy nemzetközi tengeri mérföld?', 1852, 'méter', 'A nemzetközi tengeri mérföld definíció szerint 1852 méter.', 'nist'],
    ['Hány méter egy nemzetközi angolszász mérföld?', 1609.344, 'méter', 'Egy nemzetközi mérföld pontosan 1609,344 méter.', 'nist'],
    ['Hány centiméter egy nemzetközi láb (foot)?', 30.48, 'centiméter', '1 foot = 0,3048 méter = 30,48 centiméter.', 'nist'],
    ['Hány milliméter egy hüvelyk (inch)?', 25.4, 'milliméter', 'A hüvelyk pontos értéke 25,4 milliméter.', 'nist'],
    ['Hány centiméter egy yard?', 91.44, 'centiméter', '1 yard = 0,9144 méter = 91,44 centiméter.', 'nist'],
    ['Hány négyzetméter egy hektár?', 10000, 'négyzetméter', 'Egy hektár pontosan 10 000 négyzetméter.', 'nist'],
    ['Hány négyzetcentiméter egy négyzetméter?', 10000, 'négyzetcentiméter', 'Egy méter 100 centiméter, így 100 × 100 = 10 000.', 'prefix'],
    ['Hány köbcentiméter egy köbméter?', 1000000, 'köbcentiméter', '100 × 100 × 100 = 1 000 000.', 'prefix'],
    ['Hány milliméter hosszú 2,75 kilométer?', 2750000, 'milliméter', '2,75 × 1000 × 1000 = 2 750 000.', 'prefix'],
    ['Hány mikrogramm egy gramm?', 1000000, 'mikrogramm', 'A mikro előtag az alapegység milliomod részét jelöli.', 'prefix'],
    ['Hány nanométer egy milliméter?', 1000000, 'nanométer', '10⁻³ méter / 10⁻⁹ méter = 10⁶, vagyis egymillió.', 'prefix'],
    ['Hány megawatt egy gigawatt?', 1000, 'megawatt', 'A giga 10⁹, a mega 10⁶; a hányados 1000.', 'prefix'],
    ['Hány centimétert tesz meg a fény vákuumban egyetlen másodperc alatt?', 29979245800, 'centiméter', 'A pontos fénysebesség 299 792 458 m/s. Szorozva százzal: 29 979 245 800.', 'si'],
    ['Hány kilométert tesz meg a fény vákuumban egy másodperc alatt?', 299792.458, 'kilométer', '299 792 458 méter = 299 792,458 kilométer.', 'si'],
    ['Hány alapegysége van az SI-mértékegységrendszernek?', 7, 'alapegység', 'Másodperc, méter, kilogramm, amper, kelvin, mól és kandela.', 'si'],
    ['Hány mezője van egy szabványos sakktáblának?', 64, 'mező', 'A tábla 8 × 8, vagyis 64 mezőből áll.', 'chess'],
    ['Hány bábu áll összesen a sakktáblán a kezdőállásban?', 32, 'bábu', 'Mindkét játékos 16 bábuval indul: összesen 32.', 'chess'],
    ['Hány gyalog áll összesen a sakktáblán a kezdőállásban?', 16, 'gyalog', 'Mindkét oldalon 8 gyalog áll: 2 × 8 = 16.', 'chess'],
    ['Hány nem gyalog bábu van összesen a sakk kezdőállásában?', 16, 'bábu', 'Oldalanként 1 király, 1 vezér, 2 bástya, 2 futó és 2 huszár: 8 + 8.', 'chess'],
    ['Hány centiméterre van egymástól egy 8 × 8 mezős, mezőnként 5 cm-es sakktábla két szemközti oldala?', 40, 'centiméter', 'A FIDE szerinti 8 mezős oldal: 8 × 5 = 40 centiméter.', 'chess'],
    ['Hány percig tart 250 másodperces videóból 12 darab, szünet nélkül?', 50, 'perc', '250 × 12 = 3000 másodperc, azaz 50 perc.', 'nist'],
    ['Hány métert tesz meg egy 90 km/h-val haladó jármű egy másodperc alatt?', 25, 'méter', '90 000 méter / 3600 másodperc = 25 m/s.', 'nist'],
    ['Hány másodperc alatt telik el 2 nap 7 óra 12 perc?', 198720, 'másodperc', '2 × 86 400 + 7 × 3600 + 12 × 60 = 198 720.', 'nist']
  ];
  const number = n => new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 6 }).format(n);
  const clean = s => String(s || '').trim().replace(/\s+/g, ' ');
  const inputValue = (f, name) => f.elements ? f.elements[name].value : f[name].value;
  function parseNumber(value) {
    const text = String(value).trim().replace(/[ \u00a0\u202f]/g, '').replace(',', '.');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
    const n = Number(text);
    return Number.isFinite(n) && Math.abs(n) <= 1e15 ? n : null;
  }
  function snapshot() { return S.players.map(String).slice(0, 24); }
  function scoreList(s) {
    return `<div class="panel"><h3>Összpontszám</h3><div class="tally">${s.names.map((name, i) => ({ name, points: s.scores[i] })).sort((a, b) => b.points - a.points).map(row => `<div><b>${esc(row.name)}</b><span>${row.points} pont</span></div>`).join('')}</div></div>`;
  }
  function complete(key, s) {
    if (s.recorded) return;
    s.recorded = true;
    s.phase = 'end';
    if (typeof recordResult === 'function') recordResult(key, s.names.map((name, i) => ({ name, points: s.scores[i] })));
  }
  function handoff(name, action, message) {
    return `<div class="bigcard"><div class="kicker">Add a telefont neki:</div><div class="say">${esc(name)}</div><div class="sub">${esc(message)}</div></div><button class="btn primary big" data-a="${action}">Nálam a telefon, mutasd</button>`;
  }
  function scaleState() { return R.games.scale = R.games.scale || { phase: 'setup', cycles: 1 }; }
  function scaleRound(s) {
    if (!s.axes || !s.axes.length) s.axes = shuffle(AXES.map((_, i) => i));
    s.axis = s.axes.pop(); s.target = rnd(101); s.clue = ''; s.guess = 50; s.gain = null; s.error = '';
    s.phase = 'cluecover';
  }
  const axisLabels = axis => `<div class="score"><span>${esc(axis[0])}</span><span>${esc(axis[1])}</span></div>`;
  V.scale = () => {
    const s = scaleState();
    if (s.phase === 'setup') return `${crewLine(3)}<div class="panel"><h2>Egy példa, egy közös tipp</h2><p>A soron következő játékos titokban kap egy pontot a skálán. Mond egy példát, ami szerinte oda illik; a többiek együtt megtippelik a pont helyét.</p><p class="muted small">Példa: „hétköznapi ↔ luxus”, 80-as pont → „magánrepülő”. A pontos számot és százalékot ne mondd ki. A skála mindig balról 0-tól jobbra 100-ig tart.</p><div class="setting-label"><span>Körök játékosonként</span>${stepper('scaleCycles', s.cycles, 1, 3)}</div><p class="muted small">0–5 eltérés: 4 pont; 6–10: 3; 11–20: 2; 21–30: 1. A pontot a példát adó kapja. Döntsetek közösen!</p></div><button class="btn primary big" data-a="scaleStart" ${S.players.length < 3 ? 'disabled' : ''}>Kezdjük</button>`;
    if (s.phase === 'end') return `<div class="bigcard"><div class="huge">🎚️</div><div class="say">Megtaláltátok a közös hangot!</div><div class="sub">${s.round + 1} lejátszott kör.</div></div>${scoreList(s)}<button class="btn primary big" data-a="scaleSetup">Új játék</button>`;
    const who = s.names[s.round % s.names.length], axis = AXES[s.axis];
    const count = `<div class="counter">${s.round + 1} / ${s.total} kör · Példát ad: ${esc(who)}</div>`;
    if (s.phase === 'cluecover') return count + handoff(who, 'scaleShow', 'Csak te nézd a kijelzőt! Titkos célpontot kapsz.');
    if (s.phase === 'clue') return `${count}<div class="panel"><h3>Titkos célpont — csak ${esc(who)} lássa!</h3>${axisLabels(axis)}<meter min="0" max="100" value="${s.target}" style="width:100%;height:32px" aria-label="Titkos célpont: ${s.target} a 100-ból"></meter><div class="code">${s.target}</div><p class="muted small">Találj egy konkrét példát, ami szerinted a skála ezen pontjára illik!</p></div><form class="panel" data-a="scaleClue"><label for="scale-clue">A példád</label><input id="scale-clue" name="clue" autocomplete="off" maxlength="120" required value="${esc(s.clue)}" placeholder="Például: magánrepülő"><p class="small" role="alert">${esc(s.error || '')}</p><button class="btn primary big">Elrejtem, átadom a társaságnak</button></form>`;
    if (s.phase === 'guesscover') return count + handoff('A társaság', 'scaleGuessShow', 'A célpont már rejtve van. A példát adó játékos most ne segítsen!');
    if (s.phase === 'guess') return `${count}<div class="bigcard"><div class="kicker">A példa</div><div class="say">${esc(s.clue)}</div></div><form class="panel" data-a="scaleGuess">${axisLabels(axis)}<label for="scale-guess">Közös tippetek: <output id="scale-value">${s.guess}</output> / 100</label><input id="scale-guess" name="guess" type="range" min="0" max="100" step="1" value="${s.guess}"><p class="muted small">Beszéljétek meg, majd állítsátok a csúszkát a megfelelő helyre.</p><button class="btn primary big">Ez a tippünk, leleplezés!</button></form>`;
    const distance = Math.abs(s.target - s.guess);
    return `${count}<div class="bigcard"><div class="kicker">${esc(s.clue)}</div><div class="say">${s.gain} pont ${esc(who)} játékosnak</div><div class="sub">Célpont: <b>${s.target}</b> · Tipp: <b>${s.guess}</b><br>Eltérés: ${distance}</div></div><div class="panel">${axisLabels(axis)}<label>Célpont <meter min="0" max="100" value="${s.target}" style="width:100%;height:24px"></meter></label><label>Tippetek <meter min="0" max="100" value="${s.guess}" style="width:100%;height:24px"></meter></label></div>${scoreList(s)}<button class="btn primary big" data-a="scaleNext">${s.round + 1 >= s.total ? 'Végeredmény' : 'Következő példát adó'}</button><button class="btn ghost" data-a="scaleEnd">Játék lezárása</button>`;
  };
  A.scaleCycles = d => { const s = scaleState(); s.cycles = clamp((s.cycles || 1) + +d, 1, 3); };
  A.scaleStart = () => {
    const s = scaleState(), names = snapshot(); if (names.length < 3) return;
    Object.assign(s, { names, scores: names.map(() => 0), round: 0, total: names.length * (s.cycles || 1), axes: [], recorded: false });
    scaleRound(s);
  };
  A.scaleShow = () => { const s = scaleState(); if (s.phase === 'cluecover') s.phase = 'clue'; };
  A.scaleClue = f => {
    const s = scaleState(); if (s.phase !== 'clue') return;
    const clue = clean(inputValue(f, 'clue')).slice(0, 120);
    if (!clue) { s.error = 'Írj egy rövid példát!'; return; }
    s.clue = clue; s.error = ''; s.phase = 'guesscover';
  };
  A.scaleGuessShow = () => { const s = scaleState(); if (s.phase === 'guesscover') s.phase = 'guess'; };
  A.scaleGuess = f => {
    const s = scaleState(); if (s.phase !== 'guess') return;
    const guess = Number(inputValue(f, 'guess')); if (!Number.isFinite(guess) || guess < 0 || guess > 100) return;
    s.guess = Math.round(guess);
    const diff = Math.abs(s.target - s.guess);
    s.gain = diff <= 5 ? 4 : diff <= 10 ? 3 : diff <= 20 ? 2 : diff <= 30 ? 1 : 0;
    s.scores[s.round % s.names.length] += s.gain;
    s.phase = 'reveal';
  };
  A.scaleNext = () => {
    const s = scaleState(); if (s.phase !== 'reveal') return;
    if (s.round + 1 >= s.total) complete('scale', s);
    else { s.round++; scaleRound(s); }
  };
  A.scaleEnd = () => { const s = scaleState(); if (s.phase === 'reveal') complete('scale', s); };
  A.scaleSetup = () => { const s = scaleState(); if (s.phase === 'end') s.phase = 'setup'; };

  function estimateState() { return R.games.estimate = R.games.estimate || { phase: 'setup', rounds: 5 }; }
  function estimateRound(s) { s.answers = []; s.player = 0; s.phase = 'cover'; s.error = ''; s.roundPoints = null; }
  V.estimate = () => {
    const s = estimateState();
    if (s.phase === 'setup') return `${crewLine(2)}<div class="panel"><h2>Milyen közel jársz?</h2><p>Mindenki titokban beír egy számtippet. Ha mindenki végzett, megjelenik a helyes válasz és az összes tipp.</p><p class="muted small">A legkisebb abszolút eltérés nyer. Első hely: 3 pont, második: 2, harmadik: 1. Holtversenyben mindenki ugyanazt a helyezést és pontot kapja, a következő helyezés kimarad. Pontos válaszért további 1 pont jár.</p><div class="setting-label"><span>Kérdések száma</span>${stepper('estimateRounds', s.rounds, 3, 12)}</div><p class="muted small">Az alapcsomag idő-, mértékegység- és sakkfeladványokat tartalmaz. Tizedesvesszőt is írhatsz. Az ellenőrzött magyarázat és forrás a leleplezéskor látszik.</p></div><button class="btn primary big" data-a="estimateStart" ${S.players.length < 2 ? 'disabled' : ''}>Kezdjük</button>`;
    if (s.phase === 'end') return `<div class="bigcard"><div class="huge">🔢</div><div class="say">Megvannak az este becslői!</div><div class="sub">${s.round + 1} lejátszott kérdés.</div></div>${scoreList(s)}<button class="btn primary big" data-a="estimateSetup">Új játék</button>`;
    const q = QUESTIONS[s.deck[s.round]];
    const counter = `<div class="counter">${s.round + 1} / ${s.deck.length} kérdés</div>`;
    const card = `<div class="bigcard"><div class="kicker">Becsüld meg!</div><div class="say">${esc(q[0])}</div><div class="sub">Mértékegység: ${esc(q[2])}</div></div>`;
    if (s.phase === 'cover') return counter + handoff(s.names[s.player], 'estimateShow', 'Csak te nézd a kijelzőt! A korábbi tippeket nem látod.');
    if (s.phase === 'answer') return `${counter}${card}<form class="panel" data-a="estimateAnswer"><label for="estimate-answer">${esc(s.names[s.player])} titkos tippje (${esc(q[2])})</label><input id="estimate-answer" name="answer" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="24" required placeholder="Írj egy számot"><p class="small" role="alert">${esc(s.error || '')}</p><button class="btn primary big">Elmentem és elrejtem a tippem</button></form>`;
    const source = SOURCE[q[4]];
    const rows = s.answers.map((answer, i) => ({ name: s.names[i], answer, distance: Math.abs(answer - q[1]), points: s.roundPoints[i], rank: s.ranks[i] })).sort((a, b) => a.distance - b.distance);
    return `${counter}${card}<div class="panel center"><h3>A helyes válasz</h3><div class="say">${number(q[1])} ${esc(q[2])}</div><p>${esc(q[3])}</p><a class="muted small" href="${esc(source[1])}" target="_blank" rel="noopener noreferrer">${esc(source[0])} ↗</a><small class="muted">A forrás megnyitásához internet kell; a játék offline is működik.</small></div><div class="panel"><h3>A kör tippjei</h3><div class="tally">${rows.map(row => `<div><span><b>${row.rank}. ${esc(row.name)}</b><small>Tipp: ${number(row.answer)} · Eltérés: ${number(row.distance)}</small></span><b>+${row.points}</b></div>`).join('')}</div></div>${scoreList(s)}<button class="btn primary big" data-a="estimateNext">${s.round + 1 >= s.deck.length ? 'Végeredmény' : 'Következő kérdés'}</button><button class="btn ghost" data-a="estimateEnd">Játék lezárása</button>`;
  };
  A.estimateRounds = d => { const s = estimateState(); s.rounds = clamp((s.rounds || 5) + +d, 3, 12); };
  A.estimateStart = () => {
    const s = estimateState(), names = snapshot(); if (names.length < 2) return;
    const count = clamp(s.rounds || 5, 3, 12);
    // Minden kérdés egyszer szerepel egy játékon belül.
    Object.assign(s, { names, scores: names.map(() => 0), round: 0, deck: shuffle(QUESTIONS.map((_, i) => i)).slice(0, count), recorded: false });
    estimateRound(s);
  };
  A.estimateShow = () => { const s = estimateState(); if (s.phase === 'cover') s.phase = 'answer'; };
  A.estimateAnswer = f => {
    const s = estimateState(); if (s.phase !== 'answer') return;
    const answer = parseNumber(inputValue(f, 'answer'));
    if (answer === null) { s.error = 'Érvényes számot írj, például 1500 vagy 25,4. Legfeljebb 15 számjegyű értéket adj meg.'; return; }
    s.answers[s.player] = answer; s.error = ''; s.player++;
    if (s.player < s.names.length) { s.phase = 'cover'; return; }
    const q = QUESTIONS[s.deck[s.round]], distances = s.answers.map(n => Math.abs(n - q[1]));
    // Relatív tűrés csak a bináris lebegőpontos ábrázolás hibáját fedi le.
    const equal = (a, b) => Math.abs(a - b) <= Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b)) * 8;
    s.ranks = distances.map(d => 1 + distances.filter(other => other < d && !equal(other, d)).length);
    s.roundPoints = distances.map((d, i) => Math.max(0, 4 - s.ranks[i]) + (equal(d, 0) ? 1 : 0));
    s.scores = s.scores.map((score, i) => score + s.roundPoints[i]);
    s.phase = 'reveal';
  };
  A.estimateNext = () => {
    const s = estimateState(); if (s.phase !== 'reveal') return;
    if (s.round + 1 >= s.deck.length) complete('estimate', s);
    else { s.round++; estimateRound(s); }
  };
  A.estimateEnd = () => { const s = estimateState(); if (s.phase === 'reveal') complete('estimate', s); };
  A.estimateSetup = () => { const s = estimateState(); if (s.phase === 'end') s.phase = 'setup'; };

  document.addEventListener('input', e => {
    if (e.target.id !== 'scale-guess') return;
    const s = scaleState(); if (s.phase !== 'guess') return;
    const n = Number(e.target.value); if (!Number.isFinite(n)) return;
    s.guess = clamp(Math.round(n), 0, 100);
    const out = document.getElementById('scale-value'); if (out) out.textContent = String(s.guess);
    save();
  });
  if (typeof PRIVACY !== 'undefined') PRIVACY.push(() => {
    const scale = R.games.scale, estimate = R.games.estimate;
    if (scale && scale.phase === 'clue') scale.phase = 'cluecover';
    if (estimate && estimate.phase === 'answer') estimate.phase = 'cover';
  });
})();
