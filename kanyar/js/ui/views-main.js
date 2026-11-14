/* Kezdőlap, első indítás, tananyag, napló, beállítások. */
import { h, clear, fmtDate, fmtSec, toast } from './dom.js';
import { page, card, btn, link, note, list, choice, benchmark } from './widgets.js';
import { D, S, saveSettings, sportName, levelName, lessonsFor } from './data.js';
import { kvGet, itemsAll, itemDelete, wipeAll, exportAll } from './store.js';
import { getProfile } from './views-train.js';

const LEVEL_DESC = {
  ski: ['Most kezdem, vagy hóekével csúszom és fékezek.', 'Kék pályán kanyarodom, a kanyar végén már zárom a léceket.', 'Párhuzamos lécekkel kanyarodom kék és piros pályán.', 'Piros pályán élen vezetett íveket is húzok.', 'Bármilyen pályán magabiztosan, élen csúszom.'],
  snowboard: ['Most kezdem: oldalcsúszás, falevél.', 'Megvannak az első kanyarok mindkét élen, de még megállok köztük.', 'Kék és piros pályán folyamatosan kötöm a kanyarokat.', 'Élen vezetett íveket is húzok, csúsztatás nélkül.', 'Bármilyen pályán magabiztosan, élen csúszom.'],
};

export async function startView() {
  const f = { sport: (S.settings && S.settings.sport) || 'ski', level: (S.settings && S.settings.level) || 1, stance: (S.settings && S.settings.stance) || 'regular', pain: !!(S.settings && S.settings.health && S.settings.health.pain), accepted: false };
  const levels = h('div'), stance = h('div');
  const draw = () => {
    clear(levels).append(choice('level', LEVEL_DESC[f.sport].map((d, i) => [i + 1, `${i + 1}. ${D.lessons.levels[f.sport][i]}: ${d}`]), f.level, v => { f.level = v; }));
    clear(stance);
    if (f.sport === 'snowboard') stance.append(h('h3', null, 'Melyik lábad van elöl?'), choice('stance', [['regular', 'Bal (regular)'], ['goofy', 'Jobb (goofy)']], f.stance, v => { f.stance = v; }));
  };
  draw();
  const accept = h('input', { type: 'checkbox', onchange: () => { f.accepted = accept.checked; go.disabled = !f.accepted; } });
  const go = h('button', { type: 'button', class: 'btn primary', disabled: true, onclick: async () => {
    await saveSettings({ sport: f.sport, level: Number(f.level), stance: f.sport === 'snowboard' ? f.stance : null, health: { pain: f.pain }, accepted: Date.now() });
    location.hash = '#/';
  } }, 'Kezdjük');
  return h('div', { class: 'page' },
    h('header', { class: 'hero' }, h('h1', null, 'Kanyar'), h('p', { class: 'hero-lead' }, 'Sí- és snowboard-edző a zsebedben: felkészít a szezonra, és a videódból megmondja, min javíts.')),
    card(h('h2', null, 'Mit űzöl?'), choice('sport', [['ski', 'Sí'], ['snowboard', 'Snowboard']], f.sport, v => { f.sport = v; f.level = 1; draw(); }), stance),
    card(h('h2', null, 'Melyik írja le legjobban a tudásod?'), levels),
    card(h('h2', null, 'Egészség'),
      h('p', null, 'Van most fájdalmad, friss sérülésed, vagy volt műtéted az elmúlt fél évben?'),
      choice('pain', [['no', 'Nincs'], ['yes', 'Van']], f.pain ? 'yes' : 'no', v => { f.pain = v === 'yes'; }),
      note('Ha van, a program ugrások nélkül készül, és azt kérjük, előbb beszélj orvossal vagy gyógytornásszal.', 'small')),
    card(h('h2', null, 'Mielőtt elkezded'),
      list(['Az app nem helyettesíti az oktatót, és nem ad orvosi tanácsot.', 'A mérés egy kamerából készül, ezért tévedhet; a határértékek szakmai becslések.', 'A gyakorlatokat saját felelősségedre végzed, a tudásodnak megfelelő terepen.', 'A videóid a telefonodon maradnak. Másokat csak a beleegyezésükkel filmezz.']),
      h('label', { class: 'check' }, accept, h('span', null, 'Megértettem és elfogadom.'))),
    go);
}

export async function homeView() {
  const s = S.settings, items = await itemsAll(), profile = await getProfile(), prog = await kvGet('program', null);
  const lastSnow = items.find(i => i.kind === 'snow');
  const progDone = prog ? Object.keys(prog.done || {}).length : 0;
  let next;
  if (!profile.done) next = ['Kezdd a mozgásfelméréssel', 'Hét rövid teszt a kamerával, nagyjából 10 perc. Ebből készül a személyre szabott programod.', '#/prep', 'Felmérés indítása'];
  else if (!prog) next = ['Készítsd el a programod', `A felmérésből ${profile.done} teszt megvan. Mehet a 6 hetes program.`, '#/prep', 'Program készítése'];
  else if (!lastSnow) next = ['Folytasd az edzést', `${progDone} / 18 edzés kész. A hegyen töltsd fel az első videód.`, '#/program', 'Program megnyitása'];
  else next = ['Legutóbbi visszajelzés', lastSnow.coach.main_issue.what + (lastSnow.coach.cue ? ' ' + lastSnow.coach.cue : ''), '#/a/' + lastSnow.id, 'Megnyitás'];
  const tile = (href, icon, title, sub) => h('a', { class: 'tile', href }, h('span', { class: 'tile-ic' }, h('span', { class: 'ic ic-' + icon, 'aria-hidden': 'true' })), h('strong', null, title), h('span', null, sub));
  return h('div', { class: 'page' },
    h('header', { class: 'hero' },
      h('h1', null, 'Kanyar'),
      h('p', { class: 'hero-sub' }, `${sportName(s.sport)} · ${s.level}. szint: ${levelName(s.sport, s.level)}`),
      h('div', { class: 'hero-next' },
        h('h2', null, next[0]), h('p', null, next[1]), link(next[2], next[3], 'btn light'))),
    h('div', { class: 'grid' },
      tile('#/prep', 'train', 'Felkészülés', `Felmérés ${profile.done}/${profile.total}` + (prog ? ` · edzés ${progDone}/18` : '')),
      tile('#/snow', 'video', 'Havas elemzés', 'Videóból visszajelzés'),
      tile('#/learn', 'book', 'Tananyag', 'Leckék és gyakorlatok'),
      tile('#/log', 'log', 'Napló', items.length + ' bejegyzés')),
    s.health && s.health.pain ? note('Fájdalmat vagy sérülést jeleztél: a program kíméletes, ugrások nélkül. A Beállításokban módosíthatod.', 'warn') : null);
}

export async function learnView() {
  const sport = S.settings.sport, lv = S.settings.level;
  const levelCards = D.lessons.levels[sport].map((name, i) => {
    const ls = lessonsFor(sport, 'lesson', i + 1);
    return h('details', { class: 'card', open: i + 1 === Math.min(lv, 2) },
      h('summary', null, h('h2', null, `${i + 1}. szint: ${name}`), i + 1 === lv ? h('span', { class: 'badge good' }, 'A te szinted') : null),
      ls.length ? h('ul', { class: 'rows' }, ls.map(l => h('li', null, link('#/l/' + l.id, l.title)))) : h('p', { class: 'muted' }, 'Ennek a szintnek a leckéi még nem készültek el.'));
  });
  return page('Tananyag',
    h('p', { class: 'muted' }, sportName(sport)),
    levelCards,
    card(h('h2', null, 'Javító gyakorlatok'), h('p', null, 'Ezeket ajánlja az elemzés egy-egy hibára.'),
      h('ul', { class: 'rows' }, lessonsFor(sport, 'drill').map(l => h('li', null, link('#/l/' + l.id, l.title))))),
    card(h('h2', null, 'Útmutatók'), h('ul', { class: 'rows' }, D.lessons.lessons.filter(l => l.kind === 'guide').map(l => h('li', null, link('#/l/' + l.id, l.title))))),
    D.lessons.reviewed ? null : note('A tananyagot képesített oktató még nem lektorálta.', 'small'));
}

export async function lessonView(id) {
  const l = D.lesson[id];
  if (!l) return page('Nincs ilyen lecke', link('#/learn', '← Tananyag', 'btn'));
  return page(l.title,
    l.terrain ? h('p', { class: 'muted' }, 'Terep: ' + l.terrain) : null,
    card(l.body.map(p => h('p', null, p)),
      l.steps && l.steps.length ? [h('h2', null, l.kind === 'guide' ? 'Lépések' : 'Így gyakorold'), h('ol', null, l.steps.map(s => h('li', null, s)))] : null,
      l.check && l.check.length ? [h('h2', null, 'Ellenőrizd magad'), list(l.check)] : null),
    link('#/learn', '← Tananyag', 'btn'));
}

export async function logView() {
  const items = await itemsAll();
  if (!items.length) return page('Napló', card(h('p', null, 'Még nincs bejegyzésed. Az elemzéseid és a felvett gyakorlataid ide kerülnek.'), h('div', { class: 'row' }, link('#/prep', 'Felkészülés', 'btn primary'), link('#/snow', 'Havas elemzés', 'btn'))));
  const rows = h('ul', { class: 'rows log' });
  const draw = list => {
    clear(rows).append(...list.map(it => {
      if (it.kind === 'snow') return h('li', null,
        h('a', { href: '#/a/' + it.id, class: 'log-item' },
          h('strong', null, `${sportName(it.sport)} · ${fmtDate(it.date)}`),
          h('span', { class: 'muted' }, it.coach.main_issue.what)));
      const ex = D.ex[it.exercise], r = it.result;
      return h('li', null,
        h('div', { class: 'log-item' },
          h('strong', null, `${ex ? ex.name : it.exercise} · ${fmtDate(it.date)}`),
          h('span', { class: 'muted' }, (r.holdSeconds ? fmtSec(r.holdSeconds) + ' tartás' : r.reps + ' ismétlés') + ' · ' + r.checks.filter(c => c.band === 'fix').length + ' javítandó pont')),
        btn('Törlés', async () => { await itemDelete(it.id); draw(await itemsAll()); }, 'small danger'));
    }));
  };
  draw(items);
  return page('Napló', rows);
}

export async function settingsView() {
  const s = S.settings, ai = s.ai || {};
  const url = h('input', { type: 'url', value: ai.url || '', placeholder: 'https://…workers.dev', autocomplete: 'off', inputMode: 'url' });
  const code = h('input', { type: 'password', value: ai.code || '', autocomplete: 'off' });
  const aiMsg = h('p', { class: 'small', 'aria-live': 'polite' });
  const saveAi = async () => {
    const u = url.value.trim(), c = code.value.trim();
    if (!u && !c) { await saveSettings({ ai: null }); aiMsg.textContent = 'AI-szerver kikapcsolva: a helyi elemzés működik tovább.'; return; }
    let ok = false;
    try { const p = new URL(u); ok = p.protocol === 'https:' && /\.workers\.dev$/.test(p.hostname); } catch { ok = false; }
    if (!ok) { aiMsg.textContent = 'A cím egy https://…workers.dev cím legyen.'; return; }
    if (c.length < 8) { aiMsg.textContent = 'A belépőkód legalább 8 karakter.'; return; }
    await saveSettings({ ai: { url: u, code: c } });
    aiMsg.textContent = 'Elmentve. A következő elemzésnél már az AI-edző válaszol.';
  };
  const offMsg = h('p', { class: 'small', 'aria-live': 'polite' });
  const offline = async () => {
    offMsg.textContent = 'Letöltés…';
    try {
      const base = new URL('../../vendor/mediapipe/', import.meta.url);
      for (const f of ['vision_bundle.mjs', 'wasm/vision_wasm_internal.js', 'wasm/vision_wasm_internal.wasm', 'pose_landmarker_lite.task']) { const r = await fetch(new URL(f, base)); if (!r.ok) throw new Error(f); await r.arrayBuffer(); }
      offMsg.textContent = 'Kész: az elemzés térerő nélkül is működik.';
    } catch { offMsg.textContent = 'Nem sikerült letölteni. Próbáld újra, amikor van internet.'; }
  };
  /* Eszközpróba: mit tud ez a telefon és böngésző. Az eredmény másolható, hogy hibajelentéshez el lehessen küldeni. */
  const devOut = h('div', { 'aria-live': 'polite' });
  const deviceCheck = async () => {
    clear(devOut).append(note('Próba folyamatban… ez az első alkalommal fél percig is tarthat.', 'small'));
    const rows = [];
    const add = (name, ok, detail) => rows.push({ name, ok, detail });
    try {
      const b = await benchmark();
      const fps = Math.round(1000 / Math.max(1, b.frameMs));
      add('Pózbecslő', true, `betöltés ${(b.loadMs / 1000).toFixed(1)} mp, egy képkocka ${b.frameMs} ms (kb. ${fps} képkocka/mp)`);
      add('Sebesség', b.frameMs <= 90, b.frameMs <= 45 ? 'gyors: az elemzés nagyjából a videó hosszáig tart' : b.frameMs <= 90 ? 'közepes: az elemzés a videó hosszának kétszereséig tart' : 'lassú: az elemzés percekig tarthat, az élő számlálás akadozhat');
    } catch (e) { console.error(e); add('Pózbecslő', false, 'nem sikerült betölteni: ' + String(e && e.message || e).slice(0, 80)); }
    let cams = null;
    try { cams = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput').length; } catch { cams = null; }
    add('Kamera', !!cams, cams == null ? 'ebben a böngészőben nem érhető el' : cams ? cams + ' kamera' : 'nem találtam kamerát');
    const voices = 'speechSynthesis' in window ? speechSynthesis.getVoices() : null;
    const hu = voices ? voices.some(v => /^hu/i.test(v.lang)) : false;
    add('Hangos számolás', hu, voices == null ? 'a böngésző nem tud felolvasni' : hu ? 'van magyar hang' : voices.length ? 'nincs magyar hang telepítve: más nyelven szólalhat meg' : 'a hanglista még nem töltődött be, próbáld újra');
    let store = null;
    try { const e = await navigator.storage.estimate(); store = Math.round((e.quota - e.usage) / 1048576); } catch { store = null; }
    add('Tárhely', store == null || store > 200, store == null ? 'nem lekérdezhető' : `kb. ${store} MB szabad a videóknak`);
    add('Élő videó-mintavétel', 'requestVideoFrameCallback' in HTMLVideoElement.prototype, 'requestVideoFrameCallback' in HTMLVideoElement.prototype ? 'támogatott' : 'nem támogatott: az elemzés képkockánként tekerve fut');
    add('Telepítve', matchMedia('(display-mode: standalone)').matches, matchMedia('(display-mode: standalone)').matches ? 'alkalmazásként fut' : 'böngészőben fut');
    const text = rows.map(r => `${r.ok ? 'OK' : '!!'} ${r.name}: ${r.detail}`).join('\n') + '\n' + navigator.userAgent;
    clear(devOut).append(
      h('ul', { class: 'rows' }, rows.map(r => h('li', null, h('span', null, h('strong', null, r.name), h('br'), h('span', { class: 'muted small' }, r.detail)), h('span', { class: 'badge ' + (r.ok ? 'good' : 'warn') }, r.ok ? 'Rendben' : 'Figyelj')))),
      btn('Eredmény másolása', async () => { try { await navigator.clipboard.writeText(text); toast('Vágólapra másolva.'); } catch { toast('Nem sikerült másolni.'); } }, 'small'),
      h('pre', { class: 'devlog' }, text));
  };
  const exportData = async () => {
    const blob = new Blob([JSON.stringify(await exportAll(), null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'kanyar-mentes.json' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  return page('Beállítások',
    card(h('h2', null, 'Sportág és szint'),
      h('p', null, `${sportName(s.sport)} · ${s.level}. szint: ${levelName(s.sport, s.level)}` + (s.stance ? ` · ${s.stance}` : '')),
      h('p', null, 'Egészség: ' + (s.health && s.health.pain ? 'fájdalmat vagy sérülést jeleztél' : 'nem jeleztél panaszt') + '.'),
      link('#/start', 'Módosítás', 'btn')),
    card(h('h2', null, 'Eszközpróba'),
      h('p', null, 'Megnézi, hogy a telefonod elég gyors-e az elemzéshez, van-e kamera és magyar hang. Ha valami nem működik, innen másold ki az eredményt.'),
      btn('Eszközpróba indítása', deviceCheck), devOut),
    card(h('h2', null, 'Működés térerő nélkül'),
      h('p', null, 'A pózbecslő nagyjából 16 MB. Töltsd le wifin, hogy a hegyen is működjön az elemzés.'),
      btn('Letöltés offline használatra', offline), offMsg),
    card(h('h2', null, 'AI-edző (nem kötelező)'),
      h('p', null, 'AI-szerver nélkül a helyi, szabályalapú elemzés ad visszajelzést. Saját szerverrel az AI-edző személyesebb választ ír. A szervernek csak a mért mutatók és néhány lekicsinyített képkocka megy el, a videó nem.'),
      h('label', { class: 'field' }, h('span', null, 'A szerver címe'), url),
      h('label', { class: 'field' }, h('span', null, 'Belépőkód'), code),
      btn('Mentés', saveAi, 'primary'), aiMsg),
    card(h('h2', null, 'Adataid'),
      h('p', null, 'Minden adatod ezen a készüléken van. Fiók és felhő nincs.'),
      h('div', { class: 'row' }, btn('Mentés fájlba', exportData),
        btn('Minden adat törlése', async () => { if (confirm('Biztosan törlöd az összes elemzést, videót, a programot és a beállításokat?')) { await wipeAll(); S.settings = null; toast('Minden adat törölve.'); location.hash = '#/start'; } }, 'danger'))),
    card(h('h2', null, 'Az appról'), list([link('#/l/guide_limits', 'Mit tud és mit nem az elemzés'), link('#/l/guide_fis', 'A FIS 10 szabálya'), link('#/l/guide_filming', 'Filmezési útmutató')]),
      note('A pózbecslést a MediaPipe Pose Landmarker végzi (Apache-2.0), a készüléken.', 'small')));
}
