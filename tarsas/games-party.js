/* Kerülőút és Mutasd! — közös, helyben mentett kétcsapatos körök. */
'use strict';
(() => {
  const tabooCards = [
    ['hetkoznap','esernyő','eső,ernyő,vizes,nyit'],
    ['hetkoznap','mosógép','ruha,mosás,dob,centrifuga'],
    ['hetkoznap','fogkefe','fog,száj,paszta,sörte'],
    ['hetkoznap','hűtőszekrény','hideg,étel,konyha,fagyasztó'],
    ['hetkoznap','ébresztőóra','reggel,cseng,alvás,idő'],
    ['hetkoznap','bevásárlókocsi','bolt,kerék,kosár,vásárlás'],
    ['hetkoznap','távirányító','tévé,gomb,csatorna,kapcsol'],
    ['hetkoznap','kulcstartó','kulcs,ajtó,csomó,zseb'],
    ['hetkoznap','hajszárító','haj,meleg,fúj,fürdőszoba'],
    ['hetkoznap','porszívó','por,takarít,szív,padló'],
    ['hetkoznap','könyvjelző','könyv,lap,olvas,oldal'],
    ['hetkoznap','palacsinta','tészta,serpenyő,lekvár,kakaó'],
    ['hetkoznap','zebrára lépés','gyalogos,csík,út,átkelés'],
    ['hetkoznap','csengő','ajtó,hang,gomb,vendég'],
    ['hetkoznap','termosz','ital,meleg,kávé,kulacs'],
    ['hetkoznap','naptár','nap,hónap,év,dátum'],
    ['hetkoznap','csipesz','ruha,szárító,fog,csíp'],
    ['hetkoznap','hátizsák','hát,táska,pánt,iskola'],
    ['hetkoznap','dugóhúzó','bor,üveg,dugó,nyit'],
    ['hetkoznap','lépcsőház','lépcső,emelet,lakás,ház'],
    ['hetkoznap','töltőkábel','telefon,áram,akku,vezeték'],
    ['hetkoznap','szalvéta','asztal,száj,papír,töröl'],
    ['hetkoznap','cipzár','ruha,fog,húz,kabát'],
    ['hetkoznap','fülhallgató','fül,zene,hang,telefon'],
    ['kaland','hőlégballon','levegő,kosár,repül,meleg'],
    ['kaland','világítótorony','fény,hajó,tenger,torony'],
    ['kaland','útlevél','határ,ország,utazás,okmány'],
    ['kaland','sátor','kemping,alszik,ponyva,tábor'],
    ['kaland','iránytű','észak,irány,tű,mágnes'],
    ['kaland','vízesés','víz,zuhan,folyó,szikla'],
    ['kaland','búvárszemüveg','víz,szem,úszik,maszk'],
    ['kaland','kötélhíd','kötél,híd,átkel,szakadék'],
    ['kaland','tábortűz','tűz,fa,este,szalonna'],
    ['kaland','hóember','hó,répa,tél,golyó'],
    ['kaland','csillagvizsgáló','csillag,távcső,ég,bolygó'],
    ['kaland','kincsesláda','kincs,kalóz,arany,láda'],
    ['kaland','hullámvasút','hullám,vidámpark,sín,sikít'],
    ['kaland','komp','hajó,autó,part,átkelés'],
    ['kaland','barlang','sötét,szikla,föld,denevér'],
    ['kaland','szánkó','hó,tél,csúszik,domb'],
    ['kaland','függőágy','ágy,fa,fekszik,lóg'],
    ['kaland','kilátó','magas,torony,táj,néz'],
    ['kaland','hegymászó','hegy,kötél,mászik,csúcs'],
    ['kaland','naplemente','nap,este,ég,piros'],
    ['kaland','térkép','út,ország,rajz,tájékozódás'],
    ['kaland','szúnyogriasztó','szúnyog,csíp,fúj,rovar'],
    ['kaland','mentőmellény','víz,hajó,úszik,mellény'],
    ['kaland','útitárs','utazás,barát,együtt,kísér'],
    ['csavar','időgép','idő,múlt,jövő,gép'],
    ['csavar','láthatatlanság','látható,eltűnik,szem,köpeny'],
    ['csavar','gondolatolvasás','gondolat,fej,tud,elme'],
    ['csavar','sárkány','tűz,repül,szörny,pikkely'],
    ['csavar','titkosügynök','kém,titok,nyomoz,ügynök'],
    ['csavar','szerencsesüti','süti,jóslat,kínai,papír'],
    ['csavar','álomfogó','álom,alvás,toll,háló'],
    ['csavar','robotporszívó','robot,por,takarít,kerek'],
    ['csavar','űrturista','űr,utazás,rakéta,turista'],
    ['csavar','tündérkeresztanya','tündér,varázslat,Hamupipőke,pálca'],
    ['csavar','szuperhős','hős,képesség,köpeny,megment'],
    ['csavar','kerti törpe','kert,törpe,sapka,dísz'],
    ['csavar','paparazzi','fotó,híres,fényképez,celeb'],
    ['csavar','szökőév','év,nap,február,négy'],
    ['csavar','visszhang','hang,vissza,kiált,hegy'],
    ['csavar','álruha','ruha,felismer,jelmez,titok'],
    ['csavar','bűvészkalap','nyúl,bűvész,kalap,varázslat'],
    ['csavar','hólabda-effektus','hó,labda,nő,gurul'],
    ['csavar','szellemvasút','szellem,vasút,ijesztő,vidámpark'],
    ['csavar','kacsacsőrű emlős','kacsa,csőr,Ausztrália,tojás'],
    ['csavar','karosszék-kalandor','szék,utazik,otthon,kaland'],
    ['csavar','kétbalkezes','kettő,bal,kéz,ügyetlen'],
    ['csavar','aranyhalmemória','hal,arany,elfelejt,emlék'],
    ['csavar','villámrandi','villám,randi,gyors,ismerkedés']
  ].map(([cat, word, banned]) => ({ cat, word, banned: banned.split(',') }));
  const actCards = [
    ['allat','Pingvin próbál felszállni egy buszra'],
    ['allat','Zsiráf hajat mos egy apró zuhanyzóban'],
    ['allat','Macska meglátja magát a tükörben'],
    ['allat','Kutya elrejti a kedvenc játékát'],
    ['allat','Lajhár versenyt fut az idővel'],
    ['allat','Béka először ugrik trambulinra'],
    ['allat','Elefánt balettozni tanul'],
    ['allat','Tyúk elvesztette a tojását'],
    ['allat','Bagoly nappali műszakba indul'],
    ['allat','Medve túl szűk hálózsákba bújik'],
    ['allat','Pók kötöget a saját hálójából'],
    ['allat','Kenguru keres valamit az erszényében'],
    ['allat','Sün felfúj egy léggömböt'],
    ['allat','Krokodil fogorvoshoz megy'],
    ['allat','Mókus elfelejtette, hová tette a diót'],
    ['allat','Kacsa elegáns cipőt próbál'],
    ['allat','Teknős lekési a rajtot'],
    ['allat','Polip egyszerre főz és mosogat'],
    ['allat','Flamingó nem tud egy lábon megállni'],
    ['allat','Oroszlán fodrásznál ül'],
    ['allat','Bálna titokban próbál tüsszenteni'],
    ['allat','Kaméleon nem talál megfelelő hátteret'],
    ['allat','Papagáj pletykát hallgat'],
    ['allat','Csiga bekapcsolja a biztonsági övét'],
    ['munka','Pincér egy túlzsúfolt tálcával egyensúlyoz'],
    ['munka','Pilóta turbulenciában issza a kávéját'],
    ['munka','Fodrász egy folyton mozgó vendéget nyír'],
    ['munka','Szakács észreveszi, hogy odaégett a vacsora'],
    ['munka','Postás egy harapós kutya mellett kézbesít'],
    ['munka','Zenekari karmester elveszti az ütemet'],
    ['munka','Festő túl rövid létráról festi a plafont'],
    ['munka','Kertész menekül a saját locsolója elől'],
    ['munka','Fogorvos maga fél a fúrótól'],
    ['munka','Pék túl nagy tésztát dagaszt'],
    ['munka','Bűvész nem találja a nyulat a kalapban'],
    ['munka','Fotós mindenkit egyszerre próbál mosolyra bírni'],
    ['munka','Színész elfelejti a szövegét a színpadon'],
    ['munka','Takarító csúszós padlón próbál egyensúlyozni'],
    ['munka','Hegedűművész elszakadt húrral folytatja'],
    ['munka','Űrhajós súlytalanságban próbál ebédelni'],
    ['munka','Méhész beesett méhet keres a ruhájában'],
    ['munka','Tanár a hátsó sor figyelmét keresi'],
    ['munka','Kém lézersugarak között lopakodik'],
    ['munka','Híradós nevetés nélkül próbálja bemondani a hírt'],
    ['munka','Zsonglőr túl sok tárgyat kap a kezébe'],
    ['munka','Bútorszerelő rájön, hogy fordítva rakta össze'],
    ['munka','Idegenvezető elvesztette a csoportját'],
    ['munka','Régész véletlenül felébreszt egy múmiát'],
    ['helyzet','Észrevétlenül távoznál egy unalmas buliból'],
    ['helyzet','Felvennél egy túl szűk farmert'],
    ['helyzet','Moziban csendben bontasz egy hangos zacskót'],
    ['helyzet','Egy láthatatlan szélviharban tartod az esernyőt'],
    ['helyzet','Túl forró levest próbálsz udvariasan megenni'],
    ['helyzet','Megpróbálsz nem tüsszenteni egy koncerten'],
    ['helyzet','Szúnyogot kergetsz, miközben aludnál'],
    ['helyzet','Életed első görkorcsolyázására indulsz'],
    ['helyzet','Beragadtál a forgóajtóba'],
    ['helyzet','A fotóhoz pózolsz, de videó készül'],
    ['helyzet','Sötétben keresed a papucsodat'],
    ['helyzet','Láthatatlan kutyát sétáltatsz'],
    ['helyzet','Egyre nehezebb bőröndöt emelsz a polcra'],
    ['helyzet','Próbálod visszahajtogatni az óriási térképet'],
    ['helyzet','Rágógumi ragadt a cipődre'],
    ['helyzet','Nagyon savanyú citromba harapsz'],
    ['helyzet','A liftben rájössz, hogy nem egyedül vagy'],
    ['helyzet','Titokban táncolsz, aztán belép valaki'],
    ['helyzet','Egy makacs befőttesüveget próbálsz kinyitni'],
    ['helyzet','Úszni tanítasz egy víztől félő robotot'],
    ['helyzet','IKEA-szatyrot próbálsz összehajtani'],
    ['helyzet','Az utolsó pillanatban eléred a vonatot'],
    ['helyzet','Véletlenül integettél egy idegennek'],
    ['helyzet','Magas sarkúban sétálsz egy hajó fedélzetén']
  ].map(([cat, word]) => ({ cat, word }));
  const defs = {
    taboo: {
      name: 'Kerülőút', emo: '🗣️', c: '#ffb55d', desc: 'Magyarázd el a szót a tiltott kifejezések nélkül!',
      min: 4, max: 24, time: '10–20 perc', difficulty: 'Könnyű', tags: ['csapat','pörgős','szavak'],
      cards: tabooCards, cats: { mix: 'Vegyes', hetkoznap: 'Hétköznapok', kaland: 'Kaland', csavar: 'Csavaros' }
    },
    act: {
      name: 'Mutasd!', emo: '🎭', c: '#ee8bdd', desc: 'Mutogasd el a feladványt, a csapatod találja ki!',
      min: 4, max: 24, time: '10–20 perc', difficulty: 'Könnyű', tags: ['csapat','pörgős','mozgás'],
      cards: actCards, cats: { mix: 'Vegyes', allat: 'Állatok', munka: 'Foglalkozások', helyzet: 'Abszurd helyzetek' }
    }
  };
  Object.entries(defs).forEach(([key, d]) => {
    const { cards, cats, ...meta } = d;
    GAMES[key] = meta;
    V[key] = () => view(key);
    TICKERS[key] = s => {
      if (!s || s.phase !== 'play' || !s.timer || s.timer.paused) return;
      if (Date.now() >= s.timer.end) { endTurn(key, s); save(); render(); }
    };
  });

  function state(key) {
    return R.games[key] = R.games[key] || { phase: 'setup', cat: 'mix', seconds: 60, rounds: 3 };
  }
  function team(s) { return s.turn % 2; }
  function member(s) {
    const list = s.teams[team(s)].members;
    return list[Math.floor(s.turn / 2) % list.length];
  }
  function deck(key, cat) {
    return shuffle(defs[key].cards.map((c, i) => i).filter(i => cat === 'mix' || defs[key].cards[i].cat === cat));
  }
  function nextCard(key, s) {
    s.pos++;
    if (s.pos >= s.deck.length) { s.deck = deck(key, s.cat); s.pos = 0; }
  }
  function scoreboard(s) {
    return `<div class="panel"><h3>Csapatpontok</h3><div class="tally">${s.teams.map(t => `<div><span><b>${esc(t.name)}</b><small>${t.members.map(esc).join(', ')}</small></span><b>${t.score}</b></div>`).join('')}</div></div>`;
  }
  function view(key) {
    const s = state(key), d = defs[key];
    if (s.phase === 'setup') return `${crewLine(4)}
      <div class="panel"><h3>Hogyan játsszuk?</h3><p class="muted small">${key === 'taboo'
        ? 'Két csapat felváltva magyaráz. A feladványt és a tiltott szavakat csak a magyarázó és az ellenfél ellenőre nézze. Ne mondd ki a feladványt, részeit vagy a tiltott szavak ragozott alakját!'
        : 'Két csapat felváltva mutogat. A feladványt csak a mutogató nézze. Beszélni, hangot adni és betűket a levegőbe írni nem ér; a csapattársak hangosan tippelnek.'}</p>
      <p class="muted small">Jó megfejtés: +1 pont. Passzolni szabad, levonás nélkül.${key === 'taboo' ? ' Tiltott szó használata: −1 pont.' : ''} A magyarázók csapaton belül váltják egymást. A legtöbb pont nyer.</p>
      <h3>Csomag</h3><div class="chips">${Object.entries(d.cats).map(([cat, name]) => `<button class="chip ${s.cat === cat ? 'on' : ''}" data-a="partyOption" data-v="${key}|cat|${cat}">${name}</button>`).join('')}</div>
      <h3>Egy kör ideje</h3><div class="chips">${[30,60,90].map(n => `<button class="chip ${s.seconds === n ? 'on' : ''}" data-a="partyOption" data-v="${key}|seconds|${n}">${n} mp</button>`).join('')}</div>
      <div class="setting-label"><span>Körök csapatonként</span>${stepper('partyRounds', s.rounds, 1, 5).replace(/data-v="(-?1)"/g, `data-v="${key}|$1"`)}</div>
      <p class="muted small">A névsorban felváltva álló játékosok kerülnek egy csapatba. A sorrendet a Társaság nézetben keverhetitek.</p></div>
      <button class="btn primary big" data-a="partyStart" data-v="${key}" ${S.players.length < 4 ? 'disabled' : ''}>Csapatok összeállítása</button>
      <button class="btn ghost" data-a="partyPractice" data-v="${key}">30 másodperces próbakör</button>`;
    if (s.phase === 'end') {
      const best = Math.max(...s.teams.map(t => t.score)), wins = s.teams.filter(t => t.score === best);
      return `<div class="bigcard"><div class="kicker">${s.practice ? 'Próbakör vége' : 'Végeredmény'}</div><div class="say">${s.practice ? 'Jöhet az igazi játék?' : wins.length > 1 ? 'Döntetlen!' : esc(wins[0].name) + ' nyert!'}</div>
        <div class="sub">${s.practice ? 'A próbakör pontjai nem kerülnek az este eredményei közé.' : 'Köszönjük a játékot! Cseréljetek csapatot, és próbáljátok másik csomaggal is.'}</div></div>${scoreboard(s)}
        <button class="btn primary big" data-a="partySetup" data-v="${key}">Új játék beállítása</button>`;
    }
    const t = s.teams[team(s)];
    const header = `<div class="counter">${s.practice ? 'Próbakör' : `${s.turn + 1} / ${s.rounds * 2}. csapatkör`} · ${esc(t.name)}</div>`;
    if (s.phase === 'ready') return `${header}
      <div class="bigcard"><div class="kicker">Add a telefont neki:</div><div class="say">${esc(member(s))}</div>
      <div class="sub">${key === 'taboo' ? 'A csapattársaid ne nézzék a képernyőt! Az ellenfél egy tagja ellenőrizheti a tiltott szavakat.' : 'Csak te nézd a feladványt! Állj úgy, hogy a csapatod a mozdulataidat lássa.'}</div>
      <div class="sub">${s.duration} másodpercetek lesz.</div></div>
      <button class="btn primary big" data-a="partyBegin" data-v="${key}">Készen állok, indulhat!</button>${scoreboard(s)}
      <button class="btn ghost" data-a="partyFinish" data-v="${key}">Játék befejezése</button>`;
    if (s.phase === 'result') return `${header}
      <div class="bigcard"><div class="kicker">Lejárt az idő!</div><div class="huge">${s.turnPoints > 0 ? '+' : ''}${s.turnPoints}</div>
      <div class="sub">${s.correct} megfejtés · ${s.passed} passz${key === 'taboo' ? ` · ${s.penalties} tiltott szó` : ''}</div></div>${scoreboard(s)}
      <button class="btn primary big" data-a="partyNext" data-v="${key}">${s.practice || s.turn + 1 >= s.rounds * 2 ? 'Végeredmény' : 'Következő csapat'}</button>
      <button class="btn ghost" data-a="partyFinish" data-v="${key}">Játék befejezése</button>`;
    if (s.phase === 'play') {
      if (s.covered || s.timer.paused) return `${header}<div class="bigcard"><div class="kicker">Szünet · a feladvány elrejtve</div><div class="say">${esc(member(s))}</div><div class="sub">A többiek ne nézzék a képernyőt. Folytatáskor az időzítő is továbbindul.</div></div>
        <button class="btn primary big" data-a="partyResume" data-v="${key}">Feladvány mutatása és folytatás</button>
        <button class="btn ghost" data-a="partyEndTurn" data-v="${key}">Kör lezárása</button>`;
      const card = d.cards[s.deck[s.pos]], left = Math.max(0, s.timer.end - Date.now());
      return `${header}<div class="panel"><div class="timer" id="tmr" aria-label="Hátralévő idő">${fmt(left)}</div></div>
        <div class="bigcard" data-private="true"><div class="kicker">${key === 'taboo' ? 'Magyarázd el:' : 'Mutasd el:'}</div><div class="say">${esc(card.word)}</div>
        ${key === 'taboo' ? `<div class="sub">Ezeket sem mondhatod:</div><div class="chips" aria-label="Tiltott szavak">${card.banned.map(w => `<span class="chip">${esc(w)}</span>`).join('')}</div>` : '<div class="sub">Beszéd és hangok nélkül!</div>'}</div>
        <div class="btn-row"><button class="btn primary" data-a="partyMark" data-v="${key}|correct">✓ Megfejtették +1</button><button class="btn ghost" data-a="partyMark" data-v="${key}|pass">Passz</button></div>
        ${key === 'taboo' ? `<button class="btn ghost" data-a="partyMark" data-v="${key}|penalty">Tiltott szót mondtam −1</button>` : ''}
        <div class="row"><span class="grow muted small">Eddig: ${s.turnPoints} pont</span><button class="btn ghost" data-a="partyPause" data-v="${key}">Szünet / elrejtés</button></div>`;
    }
    s.phase = 'setup';
    return view(key);
  }
  function newGame(key, practice) {
    const s = state(key);
    if (!practice && S.players.length < 4) return;
    const ps = S.players.length >= 4 ? S.players.slice() : ['Te', 'Társad', 'Csapattárs', 'Másik csapattárs'];
    s.teams = [0,1].map((i) => ({ name: i ? 'Kék csapat' : 'Piros csapat', members: ps.filter((_, n) => n % 2 === i), score: 0 }));
    s.practice = practice; s.turn = 0; s.phase = 'ready'; s.deck = deck(key, s.cat); s.pos = 0;
    s.duration = practice ? 30 : s.seconds; s.recorded = false; s.timer = null; s.covered = true;
  }
  function endTurn(key, s) {
    if (s.phase !== 'play') return;
    s.teams[team(s)].score += s.turnPoints;
    nextCard(key, s); // A lejárt időben képernyőn maradt feladvány se ismétlődjön a következő körben.
    s.timer = null; s.covered = true; s.phase = 'result';
  }
  function finish(key, s) {
    if (s.phase === 'play') endTurn(key, s);
    s.phase = 'end'; s.timer = null; s.covered = true;
    if (!s.recorded && !s.practice) {
      s.recorded = true;
      recordResult(key, s.teams.map(t => ({ name: t.name, points: t.score })));
    }
  }
  A.partyOption = v => {
    const [key, prop, value] = v.split('|'); if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'setup') return;
    if (prop === 'cat' && defs[key].cats[value]) s.cat = value;
    if (prop === 'seconds' && [30,60,90].includes(+value)) s.seconds = +value;
  };
  A.partyRounds = v => { const [key, n] = v.split('|'); if (defs[key] && state(key).phase === 'setup') state(key).rounds = clamp(state(key).rounds + +n, 1, 5); };
  A.partyStart = key => { if (defs[key] && state(key).phase === 'setup') newGame(key, false); };
  A.partyPractice = key => { if (defs[key] && state(key).phase === 'setup') newGame(key, true); };
  A.partyBegin = key => {
    if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'ready') return;
    s.phase = 'play'; s.covered = false; s.turnPoints = 0; s.correct = 0; s.passed = 0; s.penalties = 0;
    startTimer(s, s.duration / 60);
  };
  A.partyMark = v => {
    const [key, kind] = v.split('|'); if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'play' || s.covered || s.timer.paused) return;
    if (Date.now() >= s.timer.end) { endTurn(key, s); return; }
    if (kind === 'correct') { s.turnPoints++; s.correct++; buzz(25); }
    else if (kind === 'pass') s.passed++;
    else if (kind === 'penalty' && key === 'taboo') { s.turnPoints--; s.penalties++; }
    else return;
    nextCard(key, s);
  };
  A.partyPause = key => {
    if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'play' || !s.timer) return;
    if (!s.timer.paused) { s.timer.left = Math.max(0, s.timer.end - Date.now()); s.timer.paused = true; }
    s.covered = true;
  };
  A.partyResume = key => {
    if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'play' || !s.timer || !s.covered) return;
    if (s.timer.left <= 0) { endTurn(key, s); return; }
    s.timer.end = Date.now() + s.timer.left; s.timer.paused = false; s.covered = false;
  };
  A.partyEndTurn = key => { if (defs[key]) endTurn(key, state(key)); };
  A.partyNext = key => {
    if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'result') return;
    if (s.practice || s.turn + 1 >= s.rounds * 2) finish(key, s);
    else { s.turn++; s.phase = 'ready'; }
  };
  A.partyFinish = key => {
    if (!defs[key]) return;
    const s = state(key); if (s.phase === 'end' || s.phase === 'setup') return;
    if (!confirm('Befejezitek a játékot? Az eddigi pontok megmaradnak.')) return false;
    finish(key, s);
  };
  A.partySetup = key => {
    if (!defs[key]) return;
    const s = state(key); if (s.phase !== 'end') return;
    s.phase = 'setup'; s.practice = false; s.timer = null;
  };
  PRIVACY.push(() => {
    ['taboo','act'].forEach(key => {
      const s = R.games[key];
      if (s && s.phase === 'play') A.partyPause(key);
    });
  });
})();
