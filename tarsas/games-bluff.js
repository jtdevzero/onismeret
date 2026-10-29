/* Kamulexikon — saját megfogalmazású feladványok, ellenőrzött szótári jelentésekkel.
   Forrás: HUN-REN Nyelvtudományi Kutatóközpont, Új magyar etimológiai szótár.
   A kérdésenkénti forrás csak a közös leleplezéskor jelenik meg. */
(function () {
  'use strict';
  const source = word => 'https://uesz.nytud.hu/index.html?searchmode=lemma&searchstr=' + encodeURIComponent(word);
  const QUESTIONS = [
    ['tiló', 'Mire való a tiló a kender feldolgozásakor?', 'A növény fás szárát töri meg, hogy a rostokat meg lehessen tisztítani.', 'tiló'],
    ['légely', 'Miféle tárgy a légely?', 'Fából összeállított, folyadék szállítására használt kis hordó.', null, 'https://mek.oszk.hu/02100/02115/html/3-1247.html'],
    ['rokka', 'Mire szolgál a rokka a háziiparban?', 'Fonál készítésére használt fonóeszköz.', 'rokka'],
    ['guzsaly', 'Mire való a guzsaly a kézi fonásban?', 'A kézi fonáshoz előkészített szöszt vagy gyapjút tartja a pálcája.', 'guzsaly'],
    ['gúzs', 'Mit neveztek eredetileg gúzsnak?', 'Hajlékony vesszőkből összecsavart kötözőkötelet.', 'gúzs'],
    ['csobolyó', 'Milyen edény a csobolyó?', 'Kisméretű hordóféle ivóedény.', 'csobolyó'],
    ['csanak', 'Mire használták az edényként emlegetett csanakot?', 'Ital merítésére vagy ivásra, például fából készített pohárként.', 'csanak'],
    ['csoroszlya', 'Mi a csoroszlya az ekén?', 'Az ekevas előtt dolgozó, függőlegesen álló vágókés.', 'csoroszlya'],
    ['kalamáris', 'Mit tartottak a kalamárisban?', 'Az íráshoz használt tintát.', 'kalamáris'],
    ['szuszék', 'Mire való a szuszék a gazdaságban?', 'Gabonát tartottak benne; egy tárolóláda.', 'szuszék'],
    ['gereben', 'Mire szolgál a gereben a rostfeldolgozásban?', 'Vasfogakkal fésüli és rendezi a kenderrostokat.', 'gereben'],
    ['kaláris', 'Mit visel az, akinek a nyakában kaláris van?', 'Nyakláncot, eredeti jelentése szerint korallból készült ékszert.', 'kaláris'],
    ['petrence', 'Mit raknak össze, amikor petrencét készítenek?', 'Kisebb csomót szénából vagy más szálas takarmányból.', 'petrence'],
    ['cséphadaró', 'Mi a cséphadaró egy kézi cséplőszerszámon?', 'A nyélhez szíjjal kapcsolt rövidebb ütőrész.', 'cséphadaró'],
    ['pityke', 'Mi a pityke egy hagyományos ruhán?', 'Fémből készült ruhagomb.', 'pityke'],
    ['mángorol', 'Mit tesz, aki vásznat mángorol?', 'Egy erre való eszközzel simára dolgozza a vásznat.', 'mángorol'],
    ['szelence', 'Milyen tároló a szelence a szó régi használatában?', 'Kisebb doboz vagy persely.', 'szelence'],
    ['bodnár', 'Milyen mestert jelent a bodnár szó a hordókészítésben?', 'Kádárt, aki hordókat készít.', 'bodnár'],
    ['csutora', 'Mi lehetett a csutora, ha folyadékot vittek benne?', 'Lapos kulacs vagy kisméretű hordó.', 'csutora'],
    ['pikszis', 'Mi a pikszis szó szerinti jelentése?', 'Szelence vagy kisebb tárolódoboz.', 'pikszis'],
    ['bognár', 'Mi a bognár hagyományos mestersége?', 'Kerekek és szekerek készítése.', 'bognár'],
    ['kádár', 'Milyen használati tárgyat készít a kádár?', 'Fából készült hordót.', 'kádár'],
    ['tímár', 'Mivel foglalkozik a tímár mint kézműves?', 'Állati bőr cserzésével és feldolgozásával.', 'tímár'],
    ['csuta', 'Mit jelenthet a csuta, ha egy almáról beszélünk?', 'A gyümölcs megmaradó magházát és torzsáját.', 'csuta']
  ].map(([word, question, answer, lookup, url]) => ({ word, question, answer, source: url || source(lookup || word) }));

  GAMES.bluff = { name: 'Kamulexikon', emo: '🎭', c: '#f0a6ff', desc: 'Írj hihető kamut, és találd meg az igazat!', min: 3, max: 12, time: '15–25 perc', difficulty: 'Közepes', tags: ['blöff', 'beszélgetés', 'baráti'] };
  const clean = value => String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  const norm = value => clean(value).toLocaleLowerCase('hu-HU').replace(/[.,!?;:„”"'…–—-]/g, '').replace(/\s+/g, ' ').trim();
  const state = () => R.games.bluff = R.games.bluff || { phase: 'setup', rounds: 3 };
  const question = s => QUESTIONS[s.deck[s.round]];
  const notice = s => s.error ? `<p class="small" role="alert" style="color:var(--red)">${esc(s.error)}</p>` : '';
  const heading = s => `<div class="counter">${s.round + 1}. kör / ${s.rounds}</div><div class="panel center"><h2>${esc(question(s).word)}</h2><p>${esc(question(s).question)}</p></div>`;
  function table(s, delta) {
    return `<div class="panel"><h3>Pontállás</h3><div class="tally">${s.roster.map((name, i) => ({ name, i, points: s.scores[i] })).sort((a, b) => b.points - a.points || a.i - b.i).map(p => `<div><span>${esc(p.name)}${delta && s.delta[p.i] ? `<small>Ebben a körben +${s.delta[p.i]}</small>` : ''}</span><b>${p.points}</b></div>`).join('')}</div></div>`;
  }
  function cover(s, owner, action) {
    return `${heading(s)}<div class="bigcard"><div class="kicker">Add a telefont neki:</div><div class="huge">${esc(s.roster[owner])}</div><div class="sub">A többiek forduljanak el. Csak te nézd a kijelzőt!</div></div><button class="btn primary big" data-a="${action}">Én vagyok ${esc(s.roster[owner])}, mutasd</button>`;
  }
  function beginRound(s) {
    s.phase = 'write'; s.idx = 0; s.opened = false; s.entries = []; s.options = []; s.votes = []; s.knowers = []; s.accepted = [];
    s.baseScores = s.scores.slice(); s.delta = s.roster.map(() => 0); s.selected = null; s.error = '';
  }
  function scoreRound(s) {
    const d = s.roster.map(() => 0);
    const known = new Set(s.knowers.concat(s.accepted));
    known.forEach(i => { d[i] = 2; });
    s.votes.forEach(v => {
      const o = s.options[v.option];
      if (o.correct || o.owners.some(i => known.has(i))) { if (!known.has(v.owner)) d[v.owner] += 2; }
      else o.owners.forEach(i => { d[i]++; });
    });
    s.delta = d; s.scores = s.baseScores.map((n, i) => n + d[i]);
  }
  function resolve(s) {
    s.phase = 'result'; s.opened = false; s.error = ''; scoreRound(s);
  }
  function prepareVotes(s) {
    const truth = question(s).answer, options = [{ text: truth, owners: [], correct: true }];
    s.entries.forEach(e => {
      if (norm(e.text) === norm(truth)) { s.knowers.push(e.owner); return; }
      options.push({ text: e.text, owners: [e.owner], correct: false });
    });
    s.options = shuffle(options); s.voteOrder = s.roster.map((_, i) => i).filter(i => !s.knowers.includes(i));
    s.voteIndex = 0; s.selected = null; s.opened = false; s.error = '';
    if (s.voteOrder.length) s.phase = 'vote'; else resolve(s);
  }

  V.bluff = () => {
    const s = state();
    if (s.phase === 'setup') return `${crewLine(3)}<div class="panel"><h2>Ki írja a leghihetőbb kamut?</h2><p>Egy ritka szóhoz mindenki titokban ír egy hihető magyarázatot. Az app ezek közé keveri a valódi jelentést. Ezután mindenki titokban szavaz.</p><p class="muted small">Helyes tipp: +2 pont. A kamudra érkező minden szavazat: +1 pont. Saját válaszra nem szavazhatsz. Ne írd bele a nevedet! Ha ismered a szót, írd le a jelentését; az egyenértékű választ a leleplezésnél közösen elfogadhatjátok.</p><div class="setting-label"><span>Körök száma</span>${stepper('bluffRounds', s.rounds, 1, 8)}</div>${S.players.length > 12 ? '<p class="small" style="color:var(--red)">Ehhez a játékhoz legfeljebb 12 nevet adj meg.</p>' : ''}</div><button class="btn primary big" data-a="bluffStart" ${S.players.length < 3 || S.players.length > 12 ? 'disabled' : ''}>Kezdjük</button>`;
    if (s.phase === 'write') {
      if (!s.opened) return cover(s, s.idx, 'bluffOpen');
      return `${heading(s)}<form class="panel" data-a="bluffSubmit"><h3>${esc(s.roster[s.idx])}, írj hihető magyarázatot!</h3><label for="bluff-answer">A válaszod</label><textarea id="bluff-answer" name="answer" rows="3" minlength="5" maxlength="180" required autocomplete="off" spellcheck="false" placeholder="Egy rövid, hihető mondat…">${esc(s.draft || '')}</textarea><p class="muted small">5–180 karakter. A valódi jelentést még senki nem látja.</p>${notice(s)}<button class="btn primary big">Mentem és elrejtem</button></form><div class="counter">${s.idx + 1} / ${s.roster.length} válasz</div>`;
    }
    if (s.phase === 'vote') {
      const owner = s.voteOrder[s.voteIndex];
      if (!s.opened) return cover(s, owner, 'bluffOpen');
      return `${heading(s)}<div class="panel"><h3>${esc(s.roster[owner])}, melyik az igazi?</h3><p class="muted small">Titkos szavazás · ${s.voteIndex + 1}/${s.voteOrder.length}. játékos. Válassz, erősítsd meg, majd add tovább a letakart képernyőt. A saját válaszod nem választható.</p>${s.options.map((o, i) => `<button class="btn ${s.selected === i ? 'primary' : 'ghost'}" data-a="bluffVote" data-v="${i}" ${o.owners.includes(owner) ? 'disabled' : ''}>${esc(o.text)}${o.owners.includes(owner) ? ' · saját válasz' : ''}</button>`).join('')}${notice(s)}<button class="btn primary big" data-a="bluffConfirmVote" ${s.selected == null ? 'disabled' : ''}>Szavazok és elrejtem</button></div><div class="counter">${s.voteIndex + 1} / ${s.voteOrder.length} szavazat</div>`;
    }
    if (s.phase === 'result') {
      const q = question(s);
      return `${heading(s)}<div class="bigcard"><div class="kicker">A valódi jelentés</div><div class="say">${esc(q.answer)}</div><a class="small" href="${esc(q.source)}" target="_blank" rel="noopener noreferrer">Szótári forrás megnyitása</a></div><div class="panel"><h3>Így született a megtévesztés</h3>${s.options.map((o, i) => {
        const voters = s.votes.filter(v => v.option === i).map(v => s.roster[v.owner]);
        return `<div><b>${o.correct ? '✓ Valódi jelentés' : o.owners.map(j => esc(s.roster[j])).join(', ')}</b><p>${esc(o.text)}</p><p class="muted small">${voters.length ? 'Erre szavazott: ' + voters.map(esc).join(', ') : 'Nem érkezett rá szavazat.'}</p>${!o.correct ? o.owners.map(j => `<button class="btn ghost" data-a="bluffAccept" data-v="${j}">${s.accepted.includes(j) ? '✓ Elfogadva helyesnek · visszavonom' : 'Ez is helyes jelentés (+2)'}</button>`).join('') : ''}</div>`;
      }).join('<hr>')}${s.knowers.length ? `<p class="small">Pontos jelentést írt (+2): ${s.knowers.map(i => esc(s.roster[i])).join(', ')}.</p>` : ''}<p class="muted small">Ha valaki más szavakkal ugyanazt a jelentést írta, közösen fogadjátok el helyesnek. Ő és az erre szavazók 2 pontot kapnak; erre a válaszra nem jár megtévesztési pont.</p></div>${table(s, true)}<button class="btn primary big" data-a="bluffNext">${s.round + 1 < s.rounds ? 'Következő kör' : 'Végeredmény'}</button>${s.round + 1 < s.rounds ? '<button class="btn ghost" data-a="bluffFinish">Most befejezzük</button>' : ''}`;
    }
    return `<div class="bigcard"><div style="font-size:64px">🎭</div><div class="kicker">Kamulexikon</div><div class="say">${esc(s.roster.filter((_, i) => s.scores[i] === Math.max(...s.scores)).join(' és '))} ${s.scores.filter(n => n === Math.max(...s.scores)).length > 1 ? 'holtversenyben nyert!' : 'nyert!'}</div></div>${table(s)}<button class="btn primary big" data-a="bluffReset">Új játék</button>`;
  };
  A.bluffRounds = d => { const s = state(); s.rounds = clamp(s.rounds + Number(d), 1, 8); };
  A.bluffStart = () => {
    const s = state(); if (S.players.length < 3 || S.players.length > 12) return;
    s.roster = S.players.slice(); s.scores = s.roster.map(() => 0); s.deck = shuffle(QUESTIONS.map((_, i) => i)); s.round = 0; s.recorded = false; s.draft = ''; beginRound(s);
  };
  A.bluffOpen = () => { const s = state(); if (s.phase === 'write' || s.phase === 'vote') { s.opened = true; s.error = ''; } };
  A.bluffSubmit = form => {
    const s = state(); if (s.phase !== 'write' || !s.opened) return;
    const text = clean(form.elements.answer.value); s.draft = text;
    if (text.length < 5 || text.length > 180) { s.error = 'Írj 5–180 karakterből álló választ.'; return; }
    if (s.entries.some(e => norm(e.text) === norm(text))) { s.error = 'Ilyen megfogalmazás már szerepel. Találj ki egy másikat!'; return; }
    s.entries.push({ owner: s.idx, text }); s.idx++; s.opened = false; s.error = ''; s.draft = '';
    if (s.idx === s.roster.length) prepareVotes(s);
  };
  A.bluffVote = v => {
    const s = state(), i = Number(v);
    if (s.phase !== 'vote' || !s.opened || !Number.isInteger(i) || !s.options[i] || s.options[i].owners.includes(s.voteOrder[s.voteIndex])) return;
    s.selected = i;
  };
  A.bluffConfirmVote = () => {
    const s = state(); if (s.phase !== 'vote' || !s.opened || s.selected == null) return;
    const owner = s.voteOrder[s.voteIndex], o = s.options[s.selected]; if (!o || o.owners.includes(owner)) return;
    s.votes.push({ owner, option: s.selected }); s.voteIndex++; s.selected = null; s.opened = false;
    if (s.voteIndex === s.voteOrder.length) resolve(s);
  };
  A.bluffAccept = v => {
    const s = state(), owner = Number(v); if (s.phase !== 'result' || !s.entries.some(e => e.owner === owner) || s.knowers.includes(owner)) return;
    s.accepted = s.accepted.includes(owner) ? s.accepted.filter(i => i !== owner) : s.accepted.concat(owner); scoreRound(s);
  };
  A.bluffNext = () => { const s = state(); if (s.phase !== 'result') return; if (s.round + 1 >= s.rounds) { A.bluffFinish(); return; } s.round++; beginRound(s); };
  A.bluffFinish = () => {
    const s = state(); if (s.phase !== 'result') return;
    s.phase = 'end'; if (!s.recorded && typeof recordResult === 'function') { recordResult('bluff', s.roster.map((name, i) => ({ name, points: s.scores[i] }))); s.recorded = true; }
  };
  A.bluffReset = () => { const s = state(); if (s.phase === 'end') R.games.bluff = { phase: 'setup', rounds: s.rounds }; };
  PRIVACY.push(() => { const s = R.games.bluff; if (s && (s.phase === 'write' || s.phase === 'vote')) { s.opened = false; s.selected = null; s.draft = ''; } });
})();
