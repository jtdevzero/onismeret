/* Közös hullám és Sztorilánc — eredeti, egy telefonon játszható játékok. */
(function () {
  'use strict';

  const PAIRS = [
    ['erdő', 'ünnep'], ['hajó', 'álom'], ['villamos', 'sütemény'], ['hó', 'zene'],
    ['könyvtár', 'tenger'], ['sárkány', 'reggeli'], ['színház', 'kert'], ['robot', 'nyaralás'],
    ['lámpa', 'barátság'], ['esernyő', 'tánc'], ['hegy', 'levél'], ['kulcs', 'szivárvány'],
    ['sziget', 'csokoládé'], ['csillag', 'cipő'], ['múzeum', 'kávé'], ['bicikli', 'varázslat'],
    ['tükör', 'utazás'], ['labda', 'hold'], ['vonat', 'virág'], ['híd', 'mese'],
    ['jégkrém', 'sivatag'], ['óra', 'madár'], ['papír', 'vihar'], ['konyha', 'űrhajó'],
    ['homok', 'születésnap'], ['zokni', 'kincsesláda'], ['kastély', 'telefon'], ['toll', 'óceán'],
    ['szél', 'mozi'], ['piac', 'csend'], ['felhő', 'gitár'], ['palacsinta', 'iránytű']
  ];
  const SEEDS = [
    'A lift ajtaja kinyílt, és egy pingvin lépett be egy bőrönddel.',
    'Reggelre az összes utcatábla süteményrecepteket mutatott.',
    'A szomszédom becsöngetett, hogy kölcsönkérje a Holdat.',
    'A vonaton egyetlen szabály volt: a harmadik alagútnál tilos nevetni.',
    'A kávéfőző ma először név szerint üdvözölt.',
    'A térképen tegnap még nem volt ott az a kis lila sziget.',
    'Valaki egy hatalmas kulcsot hagyott a postaládámban.',
    'Az esküvőn a torta egyszer csak megszólalt.',
    'A kutyám munkába indult, és engem kért meg, hogy vigyázzak a lakásra.',
    'Az utolsó busz sofőrje egy ezüst koronát viselt.',
    'A könyvtári könyv minden reggel egy új fejezetet írt saját magába.',
    'A nyaralás első napján kiderült, hogy rossz bolygón szálltunk le.',
    'A piacon valaki palackozott csendet árult.',
    'A nagymamám régi kabátjának zsebében egy világító meghívót találtam.',
    'Éjfélkor minden növény egyszerre fordult a hűtőszekrény felé.',
    'A rendkívüli értekezletet egy beszélő kenyérpirító hívta össze.',
    'A tó közepén egy reggel megjelent egy működő telefonfülke.',
    'A sárkány nem kincset őrzött, hanem egy szigorúan titkos receptet.',
    'A születésnapi ajándékdobozban egy apró, esőfelhős város lapult.',
    'A fodrász megkérdezte, hogy a frizurámmal együtt a tegnapot is levágja-e.',
    'A múzeumban az egyik szobor unottan kérte, hogy cseréljünk helyet.',
    'A csapatépítő kirándulás akkor lett furcsa, amikor a hegy elindult.',
    'A pizzafutár egy üzenetet hozott a jövő heti önmagamtól.',
    'A metróban egy utas minden megállónál egy évvel fiatalabb lett.',
    'Egy nap az árnyékom előbb indult el otthonról, mint én.',
    'A játékbolt kirakatában egy tábla állt: ma a játékok választanak gazdát.'
  ];

  Object.assign(GAMES, {
    wave: { name: 'Közös hullám', emo: '〰️', c: '#59dfb3', desc: 'Két külön szóból induljatok, amíg ugyanazt nem mondjátok.', min: 2, max: 24, time: '5–10 perc', difficulty: 'Könnyű', tags: ['kooperatív', 'nyugodt', 'szavak'] },
    story: { name: 'Sztorilánc', emo: '📜', c: '#ffb17e', desc: 'Csak az előző mondatot látod. Mi sül ki a közös történetből?', min: 3, max: 24, time: '10–20 perc', difficulty: 'Könnyű', tags: ['kreatív', 'nyugodt', 'kooperatív'] }
  });

  const normalWord = word => String(word).normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('hu-HU');
  const stopReading = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  const pairState = () => R.games.wave = R.games.wave || { phase: 'setup', pair: [], history: [] };
  const storyState = () => R.games.story = R.games.story || { phase: 'setup', rounds: 1 };
  const restartButton = (action, text = 'Új játék') => `<button class="btn primary big" data-a="${action}">${text}</button>`;

  function selectedPair(s) {
    const valid = (s.pair || []).filter(n => S.players.includes(n));
    S.players.forEach(n => { if (valid.length < 2 && !valid.includes(n)) valid.push(n); });
    s.pair = valid.slice(0, 2);
    return s.pair;
  }
  function pairSetup(s) {
    const pair = selectedPair(s);
    return `${crewLine(2)}
      <div class="panel"><h2>Találkozzon a gondolatotok!</h2>
        <p class="muted">Ketten játszotok, a többiek szurkolhatnak. Először titokban megnéztek egy-egy különböző szót. Háromra mondjatok egyszerre egy hozzá kapcsolódó új szót.</p>
        <p class="muted">Ha eltérnek, a következő körben már a két kimondott szóból induljatok. A cél, hogy egyszerre ugyanazt mondjátok. Ne beszéljétek meg előre!</p>
        ${[0, 1].map(i => `<h3>${i + 1}. játékos</h3><div class="chips">${S.players.map((n, index) => `<button class="chip ${pair[i] === n ? 'on' : ''}" data-a="wavePlayer" data-v="${i}:${index}" ${pair[1 - i] === n ? 'disabled' : ''}>${esc(n)}</button>`).join('')}</div>`).join('')}
      </div>
      <button class="btn primary big" data-a="waveStart" ${pair.length < 2 ? 'disabled' : ''}>Titkos kezdőszavak</button>`;
  }
  function finishWave(s) {
    if (s.phase === 'end') return;
    s.phase = 'end';
    s.deal = null;
    if (!s.recorded) {
      s.recorded = true;
      const points = Math.max(1, 11 - s.round);
      if (typeof recordResult === 'function') recordResult('wave', s.pair.map(name => ({ name, points })));
    }
  }

  V.wave = () => {
    const s = pairState();
    if (s.phase === 'setup') return pairSetup(s);
    if (s.phase === 'deal') return dealView(s, (name, i) => `<div class="bigcard"><div class="kicker">${esc(name)} kezdőszava</div><div class="huge">${esc(s.words[i])}</div><div class="sub">Jegyezd meg, de még ne mondd ki!</div></div>`, 'Elrejtem, jöhet a közös kör');
    if (s.phase === 'end') return `<div class="bigcard"><div style="font-size:64px">🎉</div><div class="kicker">Egy hullámhosszon</div><div class="say">${esc(s.pair.join(' és '))}</div><div class="sub">${s.round} kör alatt találkoztak a gondolataitok.${s.lastMatch ? `<br>A közös szó: <b>${esc(s.lastMatch)}</b>` : ''}<br>Közös pont: ${Math.max(1, 11 - s.round)}</div></div>
      ${s.history.length ? `<details class="panel"><summary>Az eddigi szópárok</summary>${s.history.map((pair, i) => `<p>${i + 1}. ${pair.map(esc).join(' · ')}</p>`).join('')}</details>` : ''}
      ${restartButton('waveStart', 'Új kezdőszavak')}
      <button class="btn ghost" data-a="waveSetup">Másik páros</button>`;
    if (s.phase === 'input') return `<div class="counter">${s.round}. kör · ${s.pair.map(esc).join(' és ')}</div>
      <form class="panel" data-a="waveWords"><h2>Mit mondtatok egyszerre?</h2>
        <p class="muted small">Csak a már hangosan elmondott szavakat írjátok be. Ezek lesznek a következő kör kiindulópontjai.</p>
        ${s.pair.map((n, i) => `<label for="waveWord${i}">${esc(n)} szava</label><div class="field"><input id="waveWord${i}" name="w${i}" required maxlength="50" autocomplete="off" value="${esc((s.draft || [])[i] || '')}"></div>`).join('')}
        ${s.error ? `<p role="alert">${esc(s.error)}</p>` : ''}
        <button class="btn primary big">Jöhet a következő kör</button>
      </form><button class="btn ghost" data-a="waveMatched">Ugyanazt mondtuk!</button>`;
    return `<div class="counter">${s.round}. kör · ${s.pair.map(esc).join(' és ')}</div>
      <div class="bigcard"><div class="kicker">Gondolkodjatok csendben</div><div class="say">3, 2, 1… mondjátok!</div>
        ${s.round > 1 ? `<div class="sub">Ebből a két szóból induljatok:<br><b>${s.words.map(esc).join(' · ')}</b></div>` : '<div class="sub">A saját titkos kezdőszavatokra asszociáljatok. Egyszerre mondjatok egy új szót!</div>'}</div>
      ${restartButton('waveMatched', 'Ugyanazt mondtuk! 🎉')}
      <button class="btn ghost big" data-a="waveDifferent">Különböző szavakat mondtunk</button>
      <button class="btn ghost" data-a="waveSetup">Párosváltás, új játék</button>`;
  };
  A.wavePlayer = value => {
    const [slot, index] = value.split(':').map(Number), s = pairState(), name = S.players[index];
    if (s.phase === 'setup' && (slot === 0 || slot === 1) && name && s.pair[1 - slot] !== name) s.pair[slot] = name;
  };
  A.waveStart = () => {
    const s = pairState(), pair = selectedPair(s).slice();
    if (pair.length !== 2) return;
    const words = pick(PAIRS).slice();
    Object.assign(s, { phase: 'deal', pair, words, round: 1, history: [], lastMatch: '', recorded: false, draft: ['', ''], error: '', deal: { order: pair.slice(), i: 0, shown: false } });
  };
  DEAL_DONE.wave = s => { s.phase = 'say'; };
  A.waveDifferent = () => { const s = pairState(); if (s.phase === 'say') { s.phase = 'input'; s.error = ''; } };
  A.waveWords = form => {
    const s = pairState(); if (s.phase !== 'input') return;
    const words = [form.elements.w0.value, form.elements.w1.value].map(w => w.trim().replace(/\s+/g, ' ').slice(0, 50));
    s.draft = words;
    if (words.some(w => !w)) { s.error = 'Mindkét kimondott szót írjátok be.'; return; }
    s.history.push(words.slice()); s.error = '';
    if (normalWord(words[0]) === normalWord(words[1])) { s.lastMatch = words[0]; finishWave(s); return; }
    s.words = words; s.round++; s.draft = ['', '']; s.phase = 'say';
  };
  A.waveMatched = () => { const s = pairState(); if (s.phase === 'say' || s.phase === 'input') finishWave(s); };
  A.waveSetup = () => { const s = pairState(); if (s.phase !== 'setup' && s.phase !== 'end' && !confirm('Új párost választasz? A mostani menet véget ér.')) return false; s.phase = 'setup'; s.deal = null; };

  function storyHelp() {
    return `<div class="panel"><h2>Egy mondat, aztán tovább!</h2><p class="muted">A telefon mindig csak az előző mondatot mutatja. Írj hozzá egy új mondatot, majd elrejtve add tovább. Ne meséld el a többieknek, mit olvastál!</p><p class="muted small">A végén együtt olvassátok el vagy hallgassátok meg az egész történetet. Nincs rossz válasz és nincs verseny.</p></div>`;
  }
  function storySetup(s) {
    return `${crewLine(3)}${storyHelp()}
      <div class="panel"><h3>Hányszor kerüljön sor mindenkire?</h3>
        <div class="chips">${[1, 2, 3].map(n => `<button class="chip ${s.rounds === n ? 'on' : ''}" data-a="storyRounds" data-v="${n}">${n} kör</button>`).join('')}</div>
        <p class="muted small">${S.players.length * s.rounds} saját mondat készül. Egy mondat legfeljebb 240 karakter.</p>
      </div><button class="btn primary big" data-a="storyStart" ${S.players.length < 3 ? 'disabled' : ''}>Induljon a történet</button>`;
  }
  function finishStory(s) {
    s.phase = 'end'; s.shown = false; s.draft = '';
    if (!s.recorded) {
      s.recorded = true;
      if (typeof recordResult === 'function') recordResult('story', s.order.map(name => ({ name, points: s.rounds })));
    }
  }
  V.story = () => {
    const s = storyState();
    if (s.phase === 'setup') return storySetup(s);
    if (s.phase === 'end') return `<div class="panel"><h2>Elkészült a közös történet! 📜</h2><p class="muted small">${s.order.length} szerző · ${s.sentences.length - 1} saját mondat</p>
        ${s.sentences.map((item, i) => `<div class="story-paragraph"><p style="overflow-wrap:anywhere">${esc(item.text)}</p><small class="muted">${i ? esc(item.author) : 'A kezdőmondat'}</small></div>`).join('')}
      </div><div class="btn-row"><button class="btn ghost" data-a="storyRead">🔊 Felolvasás</button><button class="btn ghost" data-a="storyStop">Leállítás</button></div>
      <p class="muted small">A felolvasáshoz a Beállításokban legyen bekapcsolva a felolvasás, és a készüléken legyen elérhető beszédhang.</p>
      ${restartButton('storyStart', 'Új történet ugyanígy')}<button class="btn ghost" data-a="storySetup">Körök, játékosok</button>`;
    const name = s.order[s.step % s.order.length], total = s.order.length * s.rounds;
    if (!s.shown) return `<div class="counter">${s.step + 1} / ${total} mondat · ${Math.floor(s.step / s.order.length) + 1}. kör</div>
      <div class="bigcard"><div class="kicker">Add a telefont neki:</div><div class="huge">${esc(name)}</div><div class="sub">Csak te nézz rá! Az előző mondat még rejtve van.</div></div>
      ${restartButton('storyShow', `Én vagyok ${esc(name)}, mutasd`)}
      <button class="btn ghost" data-a="storySetup">Játék megszakítása</button>`;
    const previous = s.sentences[s.sentences.length - 1].text;
    return `<div class="counter">${esc(name)} · ${s.step + 1} / ${total} mondat</div>
      <div class="panel"><h3>Csak ezt tudod az eddigiekből:</h3><p style="font-size:21px;overflow-wrap:anywhere">${esc(previous)}</p></div>
      <form class="panel" data-a="storySubmit"><label for="storySentence">Írj hozzá egy új mondatot:</label>
        <textarea id="storySentence" name="sentence" rows="4" required maxlength="240" autocomplete="off" placeholder="És ekkor…">${esc(s.draft || '')}</textarea>
        <p class="muted small">Legfeljebb 240 karakter. Ne írd le újra az előző mondatot.</p>
        ${s.error ? `<p role="alert">${esc(s.error)}</p>` : ''}
        <button class="btn primary big">${s.step + 1 === total ? 'Kész, olvassuk el együtt!' : 'Elrejtem és továbbadom'}</button>
      </form><button class="btn ghost" data-a="storyHide">Mondat elrejtése</button>`;
  };
  A.storyRounds = value => { const s = storyState(), rounds = Number(value); if (s.phase === 'setup' && [1, 2, 3].includes(rounds)) s.rounds = rounds; };
  A.storyStart = () => {
    const s = storyState(); if (S.players.length < 3) return;
    stopReading();
    Object.assign(s, { phase: 'write', rounds: [1, 2, 3].includes(s.rounds) ? s.rounds : 1, order: S.players.slice(), step: 0, shown: false, draft: '', error: '', recorded: false, sentences: [{ author: '', text: pick(SEEDS) }] });
  };
  A.storyShow = () => {
    const s = storyState(); if (s.phase !== 'write') return;
    s.shown = true;
    after = () => { const el = document.getElementById('storySentence'); if (el && typeof el.focus === 'function') el.focus(); };
  };
  A.storyHide = () => { storyState().shown = false; };
  A.storySubmit = form => {
    const s = storyState(); if (s.phase !== 'write' || !s.shown) return;
    const text = form.elements.sentence.value.trim().replace(/\s+/g, ' ').slice(0, 240);
    if (!text) { s.error = 'Írj egy mondatot, mielőtt továbbadod.'; return; }
    if (normalWord(text) === normalWord(s.sentences[s.sentences.length - 1].text)) { s.error = 'Az előző mondat már megvan. Folytasd egy újjal!'; return; }
    s.sentences.push({ author: s.order[s.step % s.order.length], text });
    s.step++; s.shown = false; s.draft = ''; s.error = '';
    if (s.step >= s.order.length * s.rounds) finishStory(s);
  };
  A.storyRead = () => { const s = storyState(); if (s.phase === 'end') speak(s.sentences.map(item => item.text).join(' ')); return false; };
  A.storyStop = () => { stopReading(); return false; };
  A.storySetup = () => { const s = storyState(); if (s.phase === 'write' && !confirm('Befejezed ezt a történetet? Új játékot a kezdőképernyőről indíthatsz.')) return false; stopReading(); s.phase = 'setup'; s.shown = false; };

  // A piszkozat a frissítésen és a titkos nézet automatikus takarásán is túlél.
  document.addEventListener('input', event => {
    const target = event.target;
    if (R.view === 'story' && target.id === 'storySentence') { const s = storyState(); if (s.phase === 'write' && s.shown) { s.draft = target.value.slice(0, 240); save(); } }
    if (R.view === 'wave' && (target.id === 'waveWord0' || target.id === 'waveWord1')) {
      const s = pairState(); if (s.phase === 'input') { s.draft = s.draft || ['', '']; s.draft[target.id === 'waveWord0' ? 0 : 1] = target.value.slice(0, 50); save(); }
    }
  });
  if (typeof PRIVACY !== 'undefined') PRIVACY.push(() => {
    const w = R.games.wave, s = R.games.story;
    if (w && w.deal) w.deal.shown = false;
    if (s && s.phase === 'write') s.shown = false;
  });
})();
