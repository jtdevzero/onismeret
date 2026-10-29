/* Társasest — játékválasztó, esttervező, saját csomagok és rövid próbakörök. */
(function () {
  'use strict';
  const baseMeta = {
    impostor: { min: 3, max: 24, time: 10, difficulty: 'Könnyű', tags: ['blöff', 'beszélgetős'] },
    never: { min: 2, max: 24, time: 10, difficulty: 'Könnyű', tags: ['beszélgetős', 'laza'] },
    likely: { min: 3, max: 24, time: 10, difficulty: 'Könnyű', tags: ['beszélgetős', 'laza'] },
    bomb: { min: 2, max: 24, time: 5, difficulty: 'Könnyű', tags: ['pörgős', 'szavak'] },
    wolf: { min: 5, max: 24, time: 30, difficulty: 'Összetettebb', tags: ['blöff', 'taktika'], extra: '+ 1 mesélő' },
    codes: { min: 4, max: 24, time: 20, difficulty: 'Közepes', tags: ['szavak', 'taktika'] }
  };
  Object.entries(baseMeta).forEach(([key, value]) => Object.assign(GAMES[key], value));
  const isObject = x => x && typeof x === 'object' && !Array.isArray(x);
  S.cardPrefs = isObject(S.cardPrefs) ? S.cardPrefs : {};
  ['never', 'likely'].forEach(key => {
    const p = isObject(S.cardPrefs[key]) ? S.cardPrefs[key] : {};
    S.cardPrefs[key] = { favorites: Array.isArray(p.favorites) ? p.favorites.filter(x => typeof x === 'string').slice(0, 2000) : [], blocked: Array.isArray(p.blocked) ? p.blocked.filter(x => typeof x === 'string').slice(0, 2000) : [] };
  });
  S.customPacks = Array.isArray(S.customPacks) ? S.customPacks.filter(p => isObject(p) && ['never', 'likely'].includes(p.game) && /^custom_[a-z0-9_]+$/.test(p.id) && typeof p.name === 'string' && Array.isArray(p.items)).slice(0, 30).map(p => ({ id: p.id, game: p.game, name: p.name.slice(0, 40).replace(/[<>]/g, ''), spicy: !!p.spicy, items: p.items.filter(x => typeof x === 'string' && x.trim()).slice(0, 100).map(x => x.trim().slice(0, 220)) })) : [];
  const installPacks = () => {
    ['never', 'likely'].forEach(key => {
      Object.keys(D[key]).filter(k => k.startsWith('custom_')).forEach(k => delete D[key][k]);
      S.customPacks.filter(p => p.game === key && p.items.length).forEach(p => { D[key][p.id] = { name: p.name, spicy: p.spicy, items: p.items.slice() }; });
    });
  };
  installPacks();
  R.cardSeen = isObject(R.cardSeen) ? R.cardSeen : {};
  let notice = '';
  const meta = key => {
    const m = Object.assign({ min: 2, max: 24, time: 10, difficulty: 'Könnyű', tags: [] }, GAMES[key]);
    const times = String(m.time).match(/\d+/g);
    m.time = typeof m.time === 'number' && Number.isFinite(m.time) ? m.time : (times ? Math.max(...times.map(Number)) : 10);
    return m;
  };
  const gameInfo = key => { const m = meta(key); return `${m.min}–${m.max} fő${m.extra ? ' ' + m.extra : ''} · kb. ${m.time} perc · ${m.difficulty}`; };
  const gameCard = key => {
    const x = GAMES[key];
    return `<button class="game" style="--c:${x.c}" data-a="nav" data-v="${key}"><span class="emo" aria-hidden="true">${x.emo}</span><b>${esc(x.name)}</b><small>${esc(x.desc)}</small><small>${esc(gameInfo(key))}</small>${inProgress(key) ? '<small style="color:var(--c)">● Folyamatban</small>' : ''}</button>`;
  };
  V.home = () => `<button class="crew" data-a="nav" data-v="players"><span style="font-size:28px" aria-hidden="true">👥</span><span class="names"><b>Társaság · ${S.players.length} fő</b>${S.players.length ? esc(S.players.join(', ')) : 'Add meg a neveket egyszer, és kezdődhet az este.'}</span><span aria-hidden="true">›</span></button>
    <div class="btn-row"><button class="btn primary" data-a="nav" data-v="recommend">Mit játsszunk?</button><button class="btn ghost" data-a="nav" data-v="evening">Est mód${R.evening && R.evening.queue ? ' · ' + R.evening.queue.filter(x => !x.done).length + ' hátra' : ''}</button></div>
    <div class="games">${Object.keys(GAMES).map(gameCard).join('')}<a class="game standalone-game" style="--c:#bb99ff" href="./activity18/"><span class="emo" aria-hidden="true">🎭</span><b>Activity 18+ <span aria-hidden="true">↗</span></b><small>840 rövid feladvány, pikáns és kreatív paklikkal, káoszkörrel.</small><small>2–6 csapat · saját csapatok és beállítások</small><small>Külön játékoldal · csak felnőtteknek</small></a></div><div class="panel"><h3>Homlok! · Színészek és filmek</h3><p class="muted small">570 feladvány, fekvő nézet, billentés, ismétlés nélküli parti és opcionális videós emlék.</p><a class="btn primary big" href="homlok/">Homlok! indítása ↗</a></div><div class="panel"><h3>Ketten játszanátok?</h3><a class="btn ghost" href="../paros/">Páros est · külön játékoldal ↗</a></div>
    <div class="btn-row"><button class="btn ghost" data-a="nav" data-v="packs">Saját csomagok</button><button class="btn ghost" data-a="nav" data-v="favorites">Kedvenc kérdések</button></div><p class="muted small center">Egy telefon, kézről kézre. Első betöltés után offline is játszhattok. A nevek és a saját tartalmak ezen az eszközön maradnak.</p>`;

  const moods = { any: 'Bármi jöhet', laza: 'Laza, beszélgetős', pörgős: 'Pörgős', blöff: 'Blöff és taktika', szavak: 'Szavak és ötletek', közös: 'Közösen, verseny nélkül' };
  const moodMatch = (m, mood) => {
    const tags = Array.isArray(m.tags) ? m.tags.join(' ').toLocaleLowerCase('hu') : String(m.tags || '').toLocaleLowerCase('hu');
    return mood === 'any' || (mood === 'laza' && /laza|beszél/.test(tags)) || (mood === 'pörgős' && /pörg|gyors|mozg/.test(tags)) || (mood === 'blöff' && /blöff|taktika/.test(tags)) || (mood === 'szavak' && /szó|szav|asszoci/.test(tags)) || (mood === 'közös' && /kooper|közös|kreatív/.test(tags));
  };
  const recommendations = () => {
    const r = R.recommend || { count: S.players.length || 4, time: 15, mood: 'any' };
    return Object.keys(GAMES).map(key => ({ key, m: meta(key) })).filter(({ m }) => r.count >= m.min && r.count <= m.max).sort((a, b) => {
      const score = m => (m.time <= r.time ? 4 : -Math.ceil((m.time - r.time) / 5)) + (moodMatch(m, r.mood) ? 3 : 0);
      return score(b.m) - score(a.m) || a.m.time - b.m.time;
    }).map(x => x.key);
  };
  V.recommend = () => {
    const r = R.recommend || { count: S.players.length || 4, time: 15, mood: 'any' }, keys = recommendations().slice(0, 4);
    return `<form class="panel" data-a="recommendSet"><h2>Mi fér bele az estébe?</h2><label>Játékosok száma <input type="number" name="count" min="2" max="24" value="${r.count}" required></label><label>Idő egy játékra <select name="time">${[5, 10, 15, 20, 30, 60].map(n => `<option value="${n}" ${+r.time === n ? 'selected' : ''}>${n} perc</option>`).join('')}</select></label><label>Hangulat <select name="mood">${Object.entries(moods).map(([key, text]) => `<option value="${key}" ${r.mood === key ? 'selected' : ''}>${text}</option>`).join('')}</select></label><button class="btn primary">Mutasd az ajánlást</button></form><p class="muted small">A megadott idő hozzávetőleges. Vérfarkasnál a mesélőt ne számold a játékosok közé.</p>${keys.length ? `<div class="games">${keys.map(gameCard).join('')}</div><button class="btn primary" data-a="eveningSuggested">Ezekből kérek egy három játékból álló estet</button>` : '<p class="panel">Ehhez a létszámhoz nincs megfelelő játék. Válassz 2–24 játékost.</p>'}`;
  };
  A.recommendSet = f => {
    const count = Number(f.elements.count.value), time = Number(f.elements.time.value), mood = f.elements.mood.value;
    if (!Number.isInteger(count) || count < 2 || count > 24 || ![5, 10, 15, 20, 30, 60].includes(time) || !moods[mood]) return;
    R.recommend = { count, time, mood };
  };

  const eveningState = () => {
    if (!isObject(R.evening) || !Array.isArray(R.evening.queue)) R.evening = { queue: [], startedAt: Date.now() };
    R.evening.queue = R.evening.queue.filter(x => x && GAMES[x.game]);
    return R.evening;
  };
  const eveningResults = () => (Array.isArray(R.results) ? R.results : []).filter(result => result && GAMES[result.game] && result.at >= eveningState().startedAt);
  const eveningScores = () => {
    const totals = new Map();
    eveningResults().forEach(result => {
      const entries = Array.isArray(result.entries) ? result.entries.filter(x => x && typeof x.name === 'string' && Number.isFinite(Number(x.points))) : [];
      const sorted = entries.slice().sort((a, b) => b.points - a.points);
      sorted.forEach(entry => { const rank = sorted.filter(other => other.points > entry.points).length; totals.set(entry.name, (totals.get(entry.name) || 0) + Math.max(1, 3 - rank)); });
    });
    return [...totals].sort((a, b) => b[1] - a[1]);
  };
  V.evening = () => {
    const s = eveningState(), rows = eveningScores(), next = s.queue.findIndex(x => !x.done);
    return `<div class="panel"><h2>Az este programja</h2><p class="muted small">Válasszatok legfeljebb három játékot. A kész köröket itt tudjátok kipipálni.</p>${s.queue.length ? s.queue.map((x, i) => `<div class="row"><span class="grow">${x.done ? '✓' : (i + 1) + '.'} ${esc(GAMES[x.game].name)}</span><button class="btn ghost" data-a="eveningToggle" data-v="${i}">${x.done ? 'Újra nyitom' : 'Kész'}</button>${!x.done ? `<button class="btn primary" data-a="nav" data-v="${x.game}">Indít</button>` : ''}</div>`).join('') : '<p>Még üres a program. Adj hozzá játékokat!</p>'}${next >= 0 ? `<button class="btn primary big" data-a="nav" data-v="${s.queue[next].game}">Következő: ${esc(GAMES[s.queue[next].game].name)}</button>` : (s.queue.length ? '<p>🎉 A program végére értetek!</p>' : '')}</div>
      ${s.queue.length < 3 ? `<form class="panel" data-a="eveningAdd"><label>Játék hozzáadása <select name="game">${Object.entries(GAMES).map(([key, x]) => `<option value="${key}">${esc(x.name)}</option>`).join('')}</select></label><button class="btn primary">Hozzáadom</button></form>` : ''}
      <div class="panel"><h3>Az este eredményei</h3><p class="muted small">A játék végén mentett eredményekből: első hely 3 estpont, második 2, minden további 1. Döntetlenben azonos helyezés jár. Az egyes játékok saját pontjai megmaradnak.</p>${rows.length ? `<div class="tally">${rows.map(([name, points]) => `<div><b>${esc(name)}</b><span>${points} estpont</span></div>`).join('')}</div>` : '<p class="muted">Még nincs mentett eredmény. A pontozás nélküli játékokat is kipipálhatjátok a programban.</p>'}${eveningResults().length ? `<details><summary>Játékonként mentett pontok</summary>${eveningResults().map(result => `<div class="panel"><b>${esc(GAMES[result.game].name)}</b>${(Array.isArray(result.entries) ? result.entries : []).filter(entry => entry && typeof entry.name === 'string' && Number.isFinite(Number(entry.points))).map(entry => `<div class="row"><span class="grow">${esc(entry.name)}</span><span>${result.game === 'bomb' ? esc(Math.abs(Number(entry.points))) + ' robbanás' : esc(entry.points) + ' pont'}</span></div>`).join('')}</div>`).join('')}</details>` : ''}</div><button class="btn ghost" data-a="eveningReset">Új est tervezése</button>`;
  };
  A.eveningAdd = f => { const s = eveningState(), key = f.elements.game.value; if (GAMES[key] && s.queue.length < 3) s.queue.push({ game: key, done: false }); };
  A.eveningToggle = index => { const item = eveningState().queue[Number(index)]; if (item) item.done = !item.done; };
  A.eveningComplete = key => { const s = eveningState(), item = s.queue.find(x => x.game === key && !x.done); if (item) item.done = true; go('evening'); };
  A.eveningReset = () => { if (!confirm('Új estet kezdesz? A mostani program kipipálásai és estpontjai lezárulnak.')) return false; R.evening = { queue: [], startedAt: Date.now() }; R.cardSeen = {}; };
  A.eveningSuggested = () => { R.evening = { queue: recommendations().slice(0, 3).map(game => ({ game, done: false })), startedAt: Date.now() }; R.cardSeen = {}; go('evening'); };

  V.packs = () => `<div class="panel"><h2>Saját kérdéscsomagok</h2><p class="muted small">Csak ezen a telefonon tárolódnak. Kérdésenként egy sort írj; a játék kezdőmondatát az app teszi elé.</p>${notice ? `<p role="status">${esc(notice)}</p>` : ''}${S.customPacks.length ? S.customPacks.map(p => `<div class="row"><span class="grow"><b>${esc(p.name)}</b><br><small>${esc(GAMES[p.game].name)} · ${p.items.length} kérdés${p.spicy ? ' · 18+' : ''}</small></span><button class="btn ghost" data-a="packRemove" data-v="${p.id}">Törlés</button></div>`).join('') : '<p class="muted">Még nincs saját csomagod.</p>'}</div><form class="panel" data-a="packCreate"><h3>Új csomag</h3><label>Játék <select name="game"><option value="never">Én még soha nem…</option><option value="likely">Ki a legvalószínűbb, hogy…</option></select></label><label>Csomag neve <input name="name" maxlength="40" required placeholder="Például: Nyaralós sztorik"></label><label>Kérdések <textarea name="items" rows="7" maxlength="22000" required placeholder="aludtam el egy strandon.&#10;felejtettem otthon az útlevelemet."></textarea></label><label class="toggle"><span>Pikáns 18+ tartalom</span><input type="checkbox" name="spicy"></label><p class="muted small">A 18+ csomag csak a külön beállítás bekapcsolása után jelenik meg a játékban. Legfeljebb 100 kérdés, kérdésenként 220 karakter.</p><button class="btn primary">Csomag mentése</button></form>`;
  A.packCreate = f => {
    notice = '';
    const name = f.elements.name.value.trim(), game = f.elements.game.value;
    const items = [...new Set(f.elements.items.value.split(/\r?\n/).map(x => x.trim()).filter(Boolean))];
    if (!['never', 'likely'].includes(game) || !name || name.length > 40 || /[<>]/.test(name)) { notice = 'Adj rövid csomagnevet, < és > jelek nélkül.'; return; }
    if (!items.length || items.length > 100 || items.some(x => x.length > 220)) { notice = 'Írj 1–100 kérdést, kérdésenként legfeljebb 220 karakterrel.'; return; }
    if (S.customPacks.length >= 30) { notice = 'Legfeljebb 30 csomag tárolható. Egy régi csomag törlésével lesz hely az újnak.'; return; }
    S.customPacks.push({ id: 'custom_' + Date.now().toString(36) + '_' + rnd(100000).toString(36), name, game, items, spicy: f.elements.spicy.checked });
    installPacks(); notice = 'Elmentve! A játék csomagválasztójában tudod bekapcsolni.';
  };
  A.packRemove = id => {
    const pack = S.customPacks.find(p => p.id === id); if (!pack || !confirm('Törlöd ezt a saját csomagot: ' + pack.name + '?')) return false;
    S.customPacks = S.customPacks.filter(p => p.id !== id); installPacks();
    const state = R.games[pack.game];
    if (state) { state.cats = (state.cats || []).filter(k => k !== id); if (state.deck) state.deck = state.deck.filter(x => x[0] !== id); state.pos = 0; if (!state.deck || !state.deck.length) state.phase = 'setup'; }
    ['favorites', 'blocked'].forEach(k => { S.cardPrefs[pack.game][k] = S.cardPrefs[pack.game][k].filter(x => !x.startsWith(id + '|')); });
    notice = 'A csomagot töröltük.';
  };

  const currentCard = key => {
    const s = R.games[key], entry = s && Array.isArray(s.deck) && s.deck[s.pos];
    if (!entry || !D[key][entry[0]] || typeof D[key][entry[0]].items[entry[1]] !== 'string') return null;
    return { id: entry[0] + '|' + entry[1], text: D[key][entry[0]].items[entry[1]], entry };
  };
  const availableCard = (key, entry) => {
    const cat = D[key][entry[0]];
    return cat && (!cat.spicy || S.settings.spicy) && typeof cat.items[entry[1]] === 'string' && !S.cardPrefs[key].blocked.includes(entry[0] + '|' + entry[1]);
  };
  const markSeen = key => {
    const card = currentCard(key); if (!card) return;
    if (!Array.isArray(R.cardSeen[key])) R.cardSeen[key] = [];
    if (!R.cardSeen[key].includes(card.id)) R.cardSeen[key].push(card.id);
  };
  const newUnseenDeck = key => {
    const s = R.games[key], all = deckOf(D[key], s.cats).filter(entry => availableCard(key, entry)), seen = R.cardSeen[key] || [];
    return all.filter(entry => !seen.includes(entry[0] + '|' + entry[1]));
  };
  const advance = key => {
    const s = R.games[key]; if (!s || !Array.isArray(s.deck)) return;
    markSeen(key);
    const next = s.deck.findIndex((entry, index) => index > s.pos && availableCard(key, entry));
    if (next >= 0) s.pos = next;
    else { s.deck = newUnseenDeck(key); s.pos = 0; }
    s.phase = s.deck.length ? (key === 'never' ? 'play' : 'card') : 'exhausted';
  };
  A.neverNext = () => advance('never');
  A.likelyNext = () => advance('likely');
  ['never', 'likely'].forEach(key => {
    const action = key + 'Start';
    A[action] = () => { const s = R.games[key]; if (!s) return; if (s.phase !== 'setup') markSeen(key); s.deck = newUnseenDeck(key); s.pos = 0; s.phase = s.deck.length ? (key === 'never' ? 'play' : 'card') : 'exhausted'; };
  });
  A.cardFavorite = key => {
    if (!S.cardPrefs[key]) return; const card = currentCard(key); if (!card) return;
    const list = S.cardPrefs[key].favorites; S.cardPrefs[key].favorites = list.includes(card.id) ? list.filter(x => x !== card.id) : list.concat(card.id);
  };
  A.cardBlock = key => { if (!S.cardPrefs[key]) return; const card = currentCard(key); if (!card) return; if (!S.cardPrefs[key].blocked.includes(card.id)) S.cardPrefs[key].blocked.push(card.id); advance(key); };
  A.cardPass = key => { if (S.cardPrefs[key]) advance(key); };
  A.cardSeenReset = key => { if (!S.cardPrefs[key] || !R.games[key]) return; R.cardSeen[key] = []; A[key + 'Start'](); };
  A.cardUnblockAll = key => { if (S.cardPrefs[key]) S.cardPrefs[key].blocked = []; };
  A.cardUnfavorite = value => { const [key, ...parts] = String(value).split(':'); if (S.cardPrefs[key]) S.cardPrefs[key].favorites = S.cardPrefs[key].favorites.filter(x => x !== parts.join(':')); };
  V.favorites = () => `<div class="panel"><h2>Kedvenc kérdések</h2><p class="muted small">A csillaggal megjelölt kártyáid. A 18+ kedvencek kikapcsolt beállítás mellett itt sem látszanak.</p></div>${['never', 'likely'].map(key => {
    const prefs = S.cardPrefs[key], cards = prefs.favorites.map(id => { const at = id.lastIndexOf('|'), cat = D[key][id.slice(0, at)], i = Number(id.slice(at + 1)); return cat && (!cat.spicy || S.settings.spicy) && typeof cat.items[i] === 'string' ? { id, text: cat.items[i] } : null; }).filter(Boolean);
    return `<div class="panel"><h3>${esc(GAMES[key].name)}</h3>${cards.length ? cards.map(card => `<div class="row"><span class="grow">${esc(card.text)}</span><button class="btn ghost" data-a="cardUnfavorite" data-v="${esc(key + ':' + card.id)}" aria-label="Kedvenc eltávolítása">★</button></div>`).join('') : '<p class="muted small">Még nincs látható kedvenced.</p>'}<p class="muted small">${prefs.blocked.length} elrejtett kérdés</p>${prefs.blocked.length ? `<button class="btn ghost" data-a="cardUnblockAll" data-v="${key}">Elrejtett kérdések visszaállítása</button>` : ''}</div>`;
  }).join('')}`;

  const tutorials = {
    dreams: ['A mesélő titokban képet választ és nyomot ír hozzá.', 'A többiek a saját lapjaikból a nyomhoz illőt választanak, majd az összekevert képekre titokban szavaznak.', 'Ha néhányan eltalálják: a mesélő és a találók 3 pontot kapnak. Ha mindenki vagy senki: csak a többiek 2 pontot. Minden megtévesztett szavazó további 1 pont.'],
    impostor: ['Mindenki megnézi a saját titkos kártyáját, majd elrejti és továbbadja a telefont.', 'Sorban mondjatok egy kapcsolódó szót. Az impostor közben próbálja kitalálni a közös megfejtést.', 'Szavazzatok, majd adjatok egy utolsó tippet az impostornak, és csak utána jöhet a megfejtés.'],
    never: ['Valaki felolvassa: „Én még soha nem aludtam el moziban.”', 'Akivel már megtörtént, jelez, például lehajt egy ujjat. A sztorizás választható.', 'Aki nem akar válaszolni, passzolhat magyarázkodás nélkül. Ezután jöhet a következő kérdés.'],
    likely: ['Olvassátok fel: „Ki a legvalószínűbb, hogy eltéved a saját utcájában?”', 'A visszaszámlálás végén mindenki egyszerre rámutat valakire.', 'Koppintsatok arra, akire a legtöbben mutattak. Döntetlennél vagy kényes kérdésnél passzoljatok.'],
    bomb: ['Olvasd el a feladványt, például: „Mondj egy állatot!”', 'Mondj egy még el nem hangzott jó választ, és add tovább a telefont.', 'Akinél robban, kap egy pontot. A kevés pont a jó; a robbanás után indulhat az új kör.'],
    wolf: ['A mesélő nem játékos. A többiek titokban megnézik a kiosztott szerepüket.', 'Éjjel csukott szemmel kövessétek a mesélőt. A döntéseket csendben, rámutatással jelzitek neki.', 'Nappal vita és szavazás következik. A falusiak minden farkast keresnek; a farkasok létszámegyenlőségre játszanak.'],
    codes: ['Alkossatok két csapatot, mindkettőben egy kémfőnökkel. Csak ők láthatják a titkos kulcsot.', 'A „háziállat 2” tipp például két, háziállattal kapcsolatos szót célozhat. Beszéljétek meg a tippet.', 'Kétszeri koppintás fordít egy lapot. A merénylő azonnali vereség; téves lap után a másik csapat jön.'],
    taboo: ['A soron lévő magyarázó egyedül nézi a feladványt és a tiltott szavakat.', 'A „strand” szóhoz mondhatja: „Ide megyünk napozni”, ha egyik tiltott szó sem szerepel benne.', 'Találatkor pont, passznál új kártya. Az idő végén a másik csapat következik.'],
    act: ['A mutogató egyedül megnézi a feladványt.', 'Beszéd és betűzés nélkül mutogat; például láthatatlan lapáttal ás, ha a szó „kertész”.', 'Találatkor pont jár. Az idő végén cseréltek, és a következő csapat mutogat.'],
    wave: ['Két játékos külön-külön megnéz egy-egy különböző kezdőszót.', 'Háromra egyszerre mondanak egy kapcsolódó szót. Például az „erdő” és az „ünnep” találkozhat a „karácsonyban”.', 'Ha nem egyezik, az új két szóból indultok tovább. A cél, hogy ugyanaz jusson eszetekbe.'],
    story: ['Add tovább a telefont; a következő játékos csak az előző mondatot olvashatja.', 'Írj hozzá egy új mondatot, aztán rejtsd el és add tovább.', 'A megadott körök után együtt olvassátok el vagy hallgassátok meg az egész történetet.'],
    bluff: ['Mindenki titokban ír egy hihető választ a kérdésre; a valódi választ még senki sem látja.', 'A válaszok összekeverednek. Mindenki a szerinte igazra szavaz, a sajátjára nem lehet.', 'A helyes tippért 2 pont, minden megtévesztett játékosért 1 pont jár. A felfedés után új kör jöhet.'],
    scale: ['Egy játékos titokban megnézi a célt a két végpont között, például „hétköznapi ↔ luxus”.', 'Mond egy példát a célhoz: egy „jacht” a luxus vége felé mutathat. A számot nem árulhatja el.', 'A többiek a csúszkán tippelnek. A célhoz közeli tipp több pontot ér; utána más adja a példát.'],
    estimate: ['Olvassátok el a számszerű kérdést, és mindenki titokban írja be a tippjét.', 'Ugyanazt a mértékegységet használjátok, amelyet a kérdés kér.', 'Felfedéskor a legközelebbi tippek kapnak pontot. Azonos távolság azonos helyezés.']
  };
  const practiceExamples = {
    dreams: ['A mesélő nyoma: „Hosszú utazás”. Hárman szavaznak, ketten eltalálják a képét. Ki kap pontot?', 'A mesélő és a két helyesen tippelő 3 pontot kap. A harmadik szavazat által kiválasztott kép gazdája további 1 pontot kap.'],
    impostor: ['A közös szó: pizza. A játékosok azt mondják: „sajt”, „sütő”, „kerek”. Melyik témára gondolhattak?', 'Például pizza. Az impostor következtet, a többiek pedig azt figyelik, ki ad túl általános választ.'],
    never: ['„Én még soha nem aludtam el moziban.” Veled már megtörtént. Mit teszel?', 'Jelzel, például lehajtasz egy ujjat. Sztorizhatsz, de nem kötelező. Kényelmetlen kérdésnél passzolhatsz.'],
    likely: ['Hárman Annára mutatnak, ketten Bélára. Kinél kell rögzíteni a címet?', 'Annánál. A telefon a közösen megállapított eredményt rögzíti, nem számolja magától a mutatásokat.'],
    bomb: ['A feladvány: állat. A „kutya” már elhangzott. Mondhatod újra?', 'Ebben a körben nem. Mondj például „zsiráfot”, és add tovább a telefont.'],
    wolf: ['Éjjel te vagy a látnok. Hangosan bemondod, kit szeretnél ellenőrizni?', 'Nem: csendben jelzed a mesélőnek, és csak te kapod meg a választ. A titkos információra vigyázzatok.'],
    codes: ['A kémfőnök azt mondja: „háziállat 2”. A táblán kutya, macska és hegy van. Melyik kettő illik hozzá?', 'A kutya és a macska. Ez csak tipp: a csapatszínt kizárólag a kémfőnök kulcsa mutatja meg.'],
    taboo: ['A megfejtés „strand”. Tiltott: víz, nyár, homok, fürdés. Adj egy szabályos körülírást!', 'Például: „Ide megyünk napozni, és belépőt is kérhetnek.” Egyik tiltott szót sem használtad.'],
    act: ['Hogyan mutogatnád el szó nélkül azt, hogy „esernyő”? Próbáld ki!', 'Tegyél úgy, mintha kinyitnál valamit a fejed fölött, aztán kerüld ki a képzeletbeli pocsolyákat.'],
    wave: ['A két szó: erdő és ünnep. Mondjatok egyszerre egy összekötő szót!', 'Lehet például „karácsony”. Nincs egyetlen jó válasz: az egyezés a cél.'],
    story: ['Az előző mondat: „A villamosvezető helyén egy pingvin ült.” Mondj hozzá egy következő mondatot!', 'Bármilyen saját folytatás jó. A következő játékos már csak ezt az új mondatot fogja látni.'],
    bluff: ['A kérdés: mi az a lombik? A te kamu válaszod: „apró erdei madár”. Miért lehet ez hasznos?', 'Ha más ezt hiszi igaznak, pontot szerzel. A valódi válasz egy laboratóriumi edény; arra tippelve is pont jár.'],
    scale: ['A skála: hideg 0 ↔ forró 100. A példád „langyos tea”. Hová tippelnél?', 'Valahová középre. A játékban a titkos célhoz való távolság számít; most csak a skálát próbáljátok ki.'],
    estimate: ['Egy óra hány másodperc? Mondjatok egy tippet!', '3600 másodperc: 60 perc × 60 másodperc. Mindig a kérdésben megadott mértékegységben tippeljetek.']
  };
  V.help = () => {
    const key = R.helpGame && GAMES[R.helpGame] ? R.helpGame : 'impostor';
    return `<div class="panel"><h2>${esc(GAMES[key].name)} · félperces szabályok</h2><ol>${tutorials[key].map(text => `<li>${esc(text)}</li>`).join('')}</ol><button class="btn primary" data-a="practiceStart" data-v="${key}">Rövid próbakör</button><button class="btn ghost" data-a="nav" data-v="${key}">Játékhoz</button></div>`;
  };
  A.help = key => { if (!tutorials[key]) return false; R.helpGame = key; go('help', key); };
  A.practiceStart = key => { if (!practiceExamples[key]) return false; R.practice = { key, revealed: false }; go('practice', 'help'); };
  V.practice = () => {
    const s = R.practice || { key: 'impostor', revealed: false }, key = practiceExamples[s.key] ? s.key : 'impostor', example = practiceExamples[key];
    return `<div class="panel"><h2>${esc(GAMES[key].name)} · próbakör</h2><p class="muted small">Ez csak egy példa, a folyamatban lévő játékot és pontokat nem módosítja.</p><p class="script">${esc(example[0])}</p>${s.revealed ? `<p>${esc(example[1])}</p><button class="btn primary" data-a="nav" data-v="${key}">Értjük, jöhet a játék!</button>` : '<button class="btn primary" data-a="practiceReveal">Mutasd a magyarázatot</button>'}<button class="btn ghost" data-a="help" data-v="${key}">Vissza a szabályokhoz</button></div>`;
  };
  A.practiceReveal = () => { if (R.practice) R.practice.revealed = true; };

  Object.keys(GAMES).forEach(key => {
    const original = V[key]; if (typeof original !== 'function') return;
    V[key] = () => {
      const s = R.games[key];
      let content;
      if (['never', 'likely'].includes(key) && s && s.phase === 'exhausted') content = `<div class="panel"><h2>Ezeket a kérdéseket már láttátok</h2>${key === 'likely' ? '<button class="btn primary" data-a="likelyEnd">Az este címei és eredményei</button>' : ''}<p>Az este során nem ismételjük meg automatikusan a kártyákat. Válassz másik csomagot, vagy indíts új kört a látott kérdésekkel is.</p><button class="btn primary" data-a="cardSeenReset" data-v="${key}">Látott kérdések újrakeverése</button><button class="btn ghost" data-a="${key}Setup">Másik csomagot választok</button></div>`;
      else content = original();
      const state = R.games[key];
      if (state && state.phase === 'setup' && tutorials[key]) content = `<button class="btn ghost" data-a="help" data-v="${key}">❔ Szabályok és rövid próbakör</button>` + content;
      if (['never', 'likely'].includes(key) && state && !['setup', 'end', 'exhausted'].includes(state.phase)) {
        const card = currentCard(key);
        if (card && !(R.cardSeen[key] || []).includes(card.id)) { markSeen(key); save(); }
        if (card) content += `<div class="panel"><div class="btn-row"><button class="btn ghost" data-a="cardPass" data-v="${key}">Passzolok</button><button class="btn ghost" data-a="cardFavorite" data-v="${key}" aria-pressed="${S.cardPrefs[key].favorites.includes(card.id)}">${S.cardPrefs[key].favorites.includes(card.id) ? '★ Kedvenc' : '☆ Kedvencnek'}</button></div><button class="btn ghost" data-a="cardBlock" data-v="${key}">Ezt ne mutasd újra</button><p class="muted small">Passzolni bármikor lehet, indoklás nélkül.</p></div>`;
      }
      if (R.evening && Array.isArray(R.evening.queue) && R.evening.queue.some(x => x.game === key && !x.done)) content += `<div class="btn-row"><button class="btn ghost" data-a="nav" data-v="evening">☷ Est programja</button><button class="btn primary" data-a="eveningComplete" data-v="${key}">Kész, következő játék</button></div>`;
      return content;
    };
  });
  const baseSettings = V.settings;
  V.settings = () => baseSettings() + '<div class="btn-row"><button class="btn ghost" data-a="nav" data-v="packs">Saját csomagok</button><button class="btn ghost" data-a="nav" data-v="favorites">Kedvencek és elrejtések</button></div>';
})();
