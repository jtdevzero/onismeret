/* Kezdőképernyő (első indítás), a mai nap, napló és beállítások. */
import { h, clear, fmtDate, toast } from './dom.js';
import { page, card, btn, link, note, choice, list, sized, heroTime, artClass, emptyState } from './widgets.js';
import { D, S, saveSettings, profile, applyLook, weeklyGoal, reviewed } from './data.js';
import { exportAll, wipeAll, restoreAll } from './store.js';
import { parseBackup } from '../core/backup.js';
import { sameScoring } from '../core/assessment.js';
import { RATINGS, LADDERS, EQUIPMENT, DURATIONS, COMPLAINTS, fitSession } from '../core/program.js';
import { getProgram, setProgram, latestAssessment, workouts, assessments, evaluateItem } from './state.js';
import { ROTATION, rotationOf, SESSION_TITLES, buildSession, sessionSteps, sessionMinutes, nextKey, weekInfo, reassessDue, streak } from '../core/program.js';

import { buildDailyIcs } from '../core/calendar.js';
import { weeklyCardio, weeklyWorkouts, weeksBack, weekEnd } from '../core/cardio.js';
import { monthGrid, monthSummary, MONTHS } from '../core/history.js';
import { miniDue, currentFitnessAge } from '../core/achievements.js';
import { itemsAll } from './store.js';
import { cardioItems, CARDIO_TYPES } from './views-cardio.js';
import { GOAL_METRICS } from './views-progress.js';
import { reviewCard } from './views-wellness.js';
import { recoveryTileData } from './views-extra.js';
import { breaksIcs, CHALLENGES } from '../core/extras.js';
import { buildDashboard } from '../core/dashboard.js';
import { backupReminderCard, backupSettingsBlock } from './backup-ui.js';
import { coachCard } from './views-coach.js';

export const PARQ = [
  ['heart', 'Mondta-e valaha orvos, hogy szívbetegséged vagy magas vérnyomásod van?'],
  ['chest', 'Érzel-e mellkasi fájdalmat nyugalomban, hétköznapi tevékenység közben vagy mozgás közben?'],
  ['dizzy', 'Előfordult-e az elmúlt egy évben, hogy szédülés miatt elvesztetted az egyensúlyod, vagy elájultál?'],
  ['chronic', 'Van-e más, orvos által megállapított krónikus betegséged (például cukorbetegség, asztma, csontritkulás)?'],
  ['meds', 'Szedsz-e rendszeresen gyógyszert valamilyen krónikus betegségre?'],
  ['joint', 'Van-e olyan csont-, ízületi, izom- vagy ínproblémád, amit a több mozgás rosszabbíthat?'],
  ['supervised', 'Mondta-e orvos, hogy csak orvosi felügyelet mellett mozoghatsz?'],
];
const ageOk = a => Number.isInteger(a) && a >= 18 && a <= 99;
/* a felhasználónak látható tesztek száma (kímélő mód és korhatár szerint) */
const visibleTests = () => D.tests.tests.filter(t => !(S.settings && S.settings.lowImpact && t.impact) && !(t.minAge && !(profile().age >= t.minAge))).length;

export async function startView() {
  const st = { age: profile().age ?? null, sex: profile().sex ?? null, parq: { ...((S.settings && S.settings.parq) || {}) }, ok: false };
  const saveError = h('p', { class: 'note warn', role: 'alert', hidden: true });
  let saving = false;
  const go = btn('Kezdjük', async () => {
    if (saving || go.disabled) return;
    saving = true; go.disabled = true; go.textContent = 'Mentés…'; saveError.hidden = true;
    const previousSettings = S.settings;
    const anyYes = PARQ.some(([k]) => st.parq[k] === true);
    try {
      await saveSettings({ accepted: true, profile: { age: st.age, sex: st.sex }, parq: st.parq, lowImpact: anyYes || !!(S.settings && S.settings.lowImpact) });
      /* A megosztott URL már #/ lehet: ilyenkor nincs natív hashchange. */
      if (location.hash === '#/') dispatchEvent(new HashChangeEvent('hashchange'));
      else location.hash = '#/';
    } catch {
      S.settings = previousSettings;
      saveError.textContent = 'Nem sikerült menteni a beállításokat. A válaszaid itt megmaradtak; nyomd meg újra a Kezdjük gombot.';
      saveError.hidden = false;
    } finally {
      saving = false; go.textContent = 'Kezdjük'; refresh();
    }
  }, 'primary');
  const warn = h('div', { 'aria-live': 'polite' });
  let refresh = () => {
    const answered = PARQ.every(([k]) => typeof st.parq[k] === 'boolean');
    const anyYes = PARQ.some(([k]) => st.parq[k] === true);
    clear(warn);
    if (st.age != null && !ageOk(st.age)) warn.append(note(st.age < 18 ? 'A Forma felnőtteknek készült (18 év fölött). Gyerekeknek és serdülőknek más tesztek és normák kellenek.' : 'Adj meg egy 18 és 99 közötti életkort.', 'warn'));
    else if (st.age > 69) warn.append(note('70 év fölött a 60–69 évesek normáihoz hasonlítunk, ezért az eredmény csak tájékoztató.', 'warn'));
    if (anyYes) warn.append(note('Legalább egy kérdésre igent válaszoltál. Mielőtt elkezded a felmérést és az edzést, beszélj az orvosoddal. Az appban kímélő módot kapcsolok be: kimaradnak az ugrások és a terheléses lépcsőteszt.', 'warn'));
    go.disabled = saving || !(ageOk(st.age) && st.sex && answered && st.ok);
  };
  const age = h('input', { type: 'number', inputMode: 'numeric', min: 18, max: 99, value: st.age ?? '', 'aria-describedby': 'age-hint', oninput: () => { st.age = age.value === '' ? null : Number(age.value); refresh(); } });
  /* minden kérdés egy blokk, alatta két nagy gomb (Nem | Igen); a rádiógomb rejtett, de billentyűzettel és felolvasóval működik */
  const parq = h('div', { class: 'parq' }, PARQ.map(([k, q], i) => h('fieldset', { class: 'parq-q' },
    h('legend', null, h('span', { class: 'parq-n', 'aria-hidden': 'true' }, String(i + 1)), q),
    h('div', { class: 'seg' }, ...[[false, 'Nem'], [true, 'Igen']].map(([v, t]) =>
      h('label', { class: 'seg-item' + (v ? ' yes' : ' no') }, h('input', { type: 'radio', class: 'visually-hidden', name: 'parq-' + k, checked: st.parq[k] === v, onchange: () => { st.parq[k] = v; refresh(); } }), h('span', null, t)))))));
  const accept = h('label', { class: 'check' }, h('input', { type: 'checkbox', onchange: e => { st.ok = e.target.checked; refresh(); } }),
    h('span', null, 'Megértettem: a Forma nem orvosi eszköz és nem helyettesít orvosi vizsgálatot. Ha edzés közben fájdalmat, szédülést, mellkasi szorítást vagy szokatlan légszomjat érzek, abbahagyom.'));
  /* négy rövid lépés: bemutatás → rólad → egészségügyi szűrés → elfogadás */
  let step = 0;
  const dots = h('div', { class: 'steps-dots', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': 4, 'aria-label': 'Bevezetés lépései' }, [0, 1, 2, 3].map(() => h('i')));
  const next1 = btn('Tovább', () => goStep(2), 'primary'), next2 = btn('Tovább', () => goStep(3), 'primary');
  const back = n => btn('Vissza', () => goStep(n), 'small');
  const sections = [
    h('div', null,
      card(h('h2', null, 'Hogyan működik?'), list([
        'Kb. 25 perces felmérés otthon, eszköz nélkül: mobilitás, hajlékonyság, erő, törzs, gyorsaság, egyensúly, állóképesség.',
        'Egyes teszteket a korod és a nemed szerinti normákhoz hasonlítok, másokat funkcionális küszöbhöz vagy a saját korábbi eredményedhez.',
        (reviewed() ? 'A normák egy része becsült; a normákat, a teszteket és a gyakorlatokat szakember átnézte. ' : 'A normák egy része becsült, szakember még nem lektorálta. ') + 'A fittségi kor a pulzusodból, derékbőségedből és aktivitásodból becsült VO₂max átszámítása, nem az összes mozgásteszt eredménye.',
        'Ebből napi 15–25 perces programot kapsz. Ha egy gyakorlat könnyű, nehezebbre váltok; 6 hetente újramérünk.',
        'Minden adat a telefonodon marad. Nincs fiók, és nincs szerver.']),
        h('div', { class: 'row' }, btn('Kezdjük el', () => goStep(1), 'primary'))),
      card(h('h2', null, 'Van már mentésed?'), h('p', { class: 'small muted' }, 'Ha új telefonra költözöl, a Beállításokban készített mentésfájlból minden visszatölthető.'), h('div', { class: 'row' }, restorePicker()))),
    card(h('h2', { tabIndex: -1 }, 'Rólad'),
      h('label', { class: 'field' }, 'Életkor', h('span', { class: 'hint', id: 'age-hint' }, 'A normák korsávonként mások.'), age),
      h('p', { class: 'small muted' }, 'A normák nemenként különböznek:'),
      choice('sex', [['male', 'Férfi'], ['female', 'Nő']], st.sex, v => { st.sex = v; refresh(); }, 'Nem'),
      h('div', { class: 'row' }, next1, back(0))),
    card(h('h2', { tabIndex: -1 }, 'Egészségügyi szűrés'), h('p', { class: 'small muted' }, 'A PAR-Q+ kérdőív alapján. A válaszaid csak a telefonodon tárolódnak.'), parq,
      h('div', { class: 'row' }, next2, back(1))),
    card(h('h2', { tabIndex: -1 }, 'Utolsó lépés'), accept, saveError, h('div', { class: 'row' }, go, back(2))),
  ];
  function goStep(n) {
    step = n;
    sections.forEach((el, i) => { el.hidden = i !== n; });
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i <= n));
    dots.setAttribute('aria-valuenow', String(n + 1));
    refresh();
    const h2 = sections[n].querySelector('h2');
    if (n && h2) h2.focus({ preventScroll: false });
  }
  const oldRefresh = refresh;
  refresh = () => {
    oldRefresh();
    const answered = PARQ.every(([k]) => typeof st.parq[k] === 'boolean');
    next1.disabled = !(ageOk(st.age) && st.sex);
    next2.disabled = !answered;
  };
  goStep(0);
  return h('div', { class: 'page' },
    h('section', { class: 'hero ' + heroTime() }, h('h1', null, 'Forma'), h('p', { class: 'hero-sub' }, 'Állapotfelmérés és otthoni edzés'),
      h('p', { class: 'hero-lead' }, 'Mérd fel az erősségeidet, találd meg, min érdemes dolgoznod, és kövesd a fejlődésedet.')),
    dots, sections, warn);
}

const DAYS = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
export function weekStrip(prog) {
  const rot = rotationOf(prog), pos = (prog.done || 0) % rot.length;
  return h('div', { class: 'week-strip', role: 'list', 'aria-label': 'A heti forgó rend' }, rot.map((k, i) =>
    h('div', { class: 'week-day' + (i < pos ? ' done' : i === pos ? ' next' : ''), role: 'listitem', 'aria-label': `${i + 1}. nap: ${SESSION_TITLES[k]}${i < pos ? ', kész' : i === pos ? ', következik' : ''}` },
      h('b', null, String(i + 1)), h('span', null, k.startsWith('strength') ? 'Erő' : k.startsWith('speed') ? 'Gyors' : 'Mobil'))));
}

export async function homeView() {
  const prog = await getProgram(), last = await latestAssessment(), ws = await workouts();
  const ev = last ? evaluateItem(last) : null;
  if (!last) {
    return h('div', { class: 'page home-page' },
      h('section', { class: 'hero ' + heroTime() + ' ' + artClass('home') }, h('h1', null, 'Forma'), h('p', { class: 'hero-sub' }, 'Kezdjük a felméréssel'),
        h('div', { class: 'hero-next' }, h('h2', null, 'Felmérés, kb. 25 perc'),
          h('p', null, `${visibleTests()} rövid teszt, egyenként vezetve. Kell hozzá egy szék, egy fal, egy mérőszalag vagy vonalzó, és ha van, egy kb. 30 cm magas lépcsőfok.`),
          link('#/assess', 'Felmérés indítása', 'btn primary home-start'))),
      card(h('h2', null, 'Mire számíts?'), list(['Bemelegítés után végezd, kipihenten.', 'Részletekben is csinálhatod: az eredmények mentődnek.', 'Ami fáj, azt hagyd ki. Kihagyott teszttel is kapsz eredményt.'])));
  }
  const kids = [];
  let dash = null;
  if (prog) {
    const key = nextKey(prog), session = fitSession(buildSession(key, prog, D.exercises.exercises), D.ex, S.settings.duration || 0), steps = sessionSteps(session, D.ex);
    const doneToday = ws.some(w => new Date(w.date).toDateString() === new Date().toDateString());
    const wk = weekInfo(prog.start);
    kids.push(h('section', { class: 'hero ' + heroTime() + ' ' + artClass(key) }, h('h1', null, doneToday ? 'Mai edzés kész' : 'Mai edzés'),
      h('p', { class: 'hero-sub' }, `${wk.week}. hét` + (wk.deload ? ' · könnyített hét' : '') + (streak(ws.map(w => w.date)) ? ` · ${streak(ws.map(w => w.date))} napos sorozat` : '')),
      h('div', { class: 'hero-next' }, h('h2', null, (doneToday ? 'Holnap: ' : '') + session.title),
        h('p', null, `Kb. ${sessionMinutes(steps)} perc · ${session.blocks.length} gyakorlat`),
        h('div', { class: 'row' }, link('#/check/' + key, doneToday ? 'Mehet még egy' : 'Indítás', 'btn primary home-start')))));
    /* két kis csempe: heti cél és regeneráció; a részletek egy koppintással elérhetők (a számok a dashboard-rétegből) */
    const everything = await itemsAll();
    dash = buildDashboard({ program: prog, items: everything, now: Date.now(), profile: profile(), norms: D.norms, weeklyGoal: weeklyGoal() });
    const ww = { n: dash.weeklyWorkouts.completed, goal: dash.weeklyWorkouts.goal, pct: dash.weeklyWorkouts.pct }, cw = dash.weeklyCardio;
    const rec = await recoveryTileData(everything);
    kids.push(h('div', { class: 'tiles' },
      h('a', { class: 'tile mini', href: '#/program', 'aria-label': `Heti cél: ${ww.n} edzés a ${ww.goal}-ből, ${cw.equivalent} kardióperc a 150-ből` },
        h('span', { class: 'muted small' }, 'Heti cél'), h('strong', null, `${ww.n} / ${ww.goal}`), h('progress', { max: 100, value: ww.pct, 'aria-hidden': 'true' }),
        h('span', { class: 'small muted' }, `kardió ${cw.equivalent} / ${cw.goal} p`)),
      h('a', { class: 'tile mini', href: rec ? '#/check/' + key : '#/pulse', 'aria-label': rec ? `Regeneráció: ${rec.score} a 100-ból` : 'Regeneráció: mérd a reggeli pulzusod' },
        h('span', { class: 'muted small' }, 'Regeneráció'), h('strong', null, rec ? `${rec.score}` : '–'), rec ? h('span', { class: 'badge ' + (rec.level === 'go' ? 'good' : rec.level === 'light' ? 'mid' : 'warn') }, { go: 'mehet', light: 'könnyíts', rest: 'pihenj' }[rec.level]) : h('span', { class: 'small muted' }, 'reggeli pulzus →'))));
  } else {
    kids.push(h('section', { class: 'hero ' + heroTime() + ' ' + artClass('home') }, h('h1', null, 'Forma'), h('div', { class: 'hero-next' }, h('h2', null, 'Megvan a felmérés'),
      h('p', null, 'Nézd meg az eredményt, és készítsd el belőle a programodat.'), link('#/result', 'Eredmény és program', 'btn primary home-start'))));
  }
  const allItems = await itemsAll();
  if (dash) {
    const g = dash.primaryGoal, a = dash.assessmentDue;
    const metric = g ? (GOAL_METRICS().find(m => m[0] === g.goal.metric) || [g.goal.metric, g.goal.metric, '']) : null;
    kids.push(h('div', { class: 'tiles' },
      g ? h('a', { class: 'tile mini', href: '#/progress', 'aria-label': `Cél: ${metric[1]} ${g.goal.target} ${metric[2]}, most ${g.current ?? 'nincs adat'}, ${g.pct}%` },
        h('span', { class: 'muted small' }, 'Cél'), h('strong', null, `${metric[1]}: ${g.goal.target}${metric[2] ? ' ' + metric[2] : ''}`), h('progress', { max: 100, value: g.pct, 'aria-hidden': 'true' }),
        h('span', { class: 'small muted' }, g.current == null ? 'még nincs mérés' : `most ${g.current}` + (g.daysLeft != null ? ` · ${g.daysLeft >= 0 ? g.daysLeft + ' nap van hátra' : 'lejárt'}` : '')))
        : h('a', { class: 'tile mini', href: '#/progress', 'aria-label': 'Cél kitűzése a Fejlődés oldalon' }, h('span', { class: 'muted small' }, 'Cél'), h('strong', null, 'Nincs még'), h('span', { class: 'small muted' }, 'kitűzés →')),
      a ? h('a', { class: 'tile mini', href: '#/assess', 'aria-label': a.due ? 'Újramérés esedékes' : `Következő felmérés ${a.daysLeft} nap múlva` },
        h('span', { class: 'muted small' }, 'Újramérés'), h('strong', null, a.due ? 'Esedékes' : `${a.daysLeft} nap`), h('span', { class: 'small muted' }, `utoljára ${a.daysSince} napja`)) : null));
    if (dash.insight) kids.push(h('p', { class: 'small muted center home-insight' }, dash.insight.text));
    if (dash.firstWeek) kids.push(card(h('h2', null, `Első heted · ${dash.firstWeek.day}. nap`),
      h('p', { class: 'small muted' }, 'Négy lépés, hogy megismerd az appot. Nem kell mind ma; ami kész, kipipálódik.'),
      h('ul', { class: 'checklist first-week' }, dash.firstWeek.steps.map(st => h('li', { class: st.done ? 'done' : '' },
        h('span', { class: 'tick', 'aria-hidden': 'true' }, st.done ? '✓' : ''), h('span', null, st.label), h('span', { class: 'visually-hidden' }, st.done ? ' – kész' : ' – még nincs kész'))))));
  }
  const br = await backupReminderCard(); if (br) kids.push(br);
  if (prog) { const cc = coachCard(prog, allItems, { compact: true }); if (cc) kids.push(cc); }
  const rv = await reviewCard(allItems, { compact: true });
  if (rv) kids.push(rv);
  if (prog && (dash ? dash.miniDue : miniDue(allItems, prog))) kids.push(card(h('h2', null, 'Félidős mini-teszt'), h('p', null, 'A ciklus közepén vagy: egy 5 perces mini-teszttel (fekvőtámasz, plank, egylábas állás) láthatod, merre haladsz.'), h('div', { class: 'row' }, link('#/mini', 'Mini-teszt', 'btn primary'))));
  if (reassessDue(last.date, prog)) kids.push(note('Eltelt 6 hét az utolsó felmérés óta: ideje újramérni, hogy lásd a fejlődésed, és a program is igazodjon.', 'warn'), h('p', null, link('#/assess', 'Újramérés', 'btn')));
  const fNow = currentFitnessAge(allItems, profile(), D.norms);
  kids.push(h('p', { class: 'center small' }, link('#/progress', `Fittségi kor: ${(fNow ? fNow.age : ev.fitnessAge) ?? '–'} év · részletek a Fejlődés oldalon`)));
  return h('div', { class: 'page home-page' }, kids);
}

/* A hónap számai egy megosztható képen (vászonra rajzolva, a telefonon készül). */
async function monthImage(y, mo, s) {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#2a0f3d'); grad.addColorStop(0.6, '#8a1f6b'); grad.addColorStop(1, '#ff5a7a');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  const sun = g.createLinearGradient(0, 120, 0, 420); sun.addColorStop(0, '#ffe066'); sun.addColorStop(1, '#ff3d7f');
  g.fillStyle = sun; g.beginPath(); g.arc(W - 220, 260, 150, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = 'italic 900 120px system-ui, sans-serif'; g.fillText('FORMA', 80, 200);
  g.font = '700 54px system-ui, sans-serif'; g.fillText(`${y}. ${MONTHS[mo - 1]}`, 80, 290);
  const rows = [['Edzés', s.workouts], ['Aktív nap', s.activeDays], ['Mozgás', s.minutes + ' perc'], ['Kardió', s.cardioMinutes + ' perc'], ['Szintlépés', s.levelUps], ['Leghosszabb sorozat', s.bestStreak + ' nap']];
  rows.forEach(([k, v], i) => {
    const x = 80 + (i % 2) * 470, yy = 470 + Math.floor(i / 2) * 250;
    g.fillStyle = 'rgba(26,11,46,.55)'; g.beginPath(); g.roundRect ? g.roundRect(x, yy, 430, 210, 32) : g.rect(x, yy, 430, 210); g.fill();
    g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '600 40px system-ui, sans-serif'; g.fillText(k, x + 36, yy + 70);
    g.fillStyle = '#fff'; g.font = 'italic 900 84px system-ui, sans-serif'; g.fillText(String(v), x + 36, yy + 170);
  });
  g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '600 34px system-ui, sans-serif'; g.fillText('jtdevzero.github.io/onismeret/forma', 80, H - 70);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], `forma-${y}-${String(mo).padStart(2, '0')}.png`, { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Forma – havi összefoglaló' }); return; } } catch { /* a megosztást elvethette */ }
  const url = URL.createObjectURL(blob), a = h('a', { href: url, download: file.name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* Havi naptár: napi jelölés edzésre, kardióra, felmérésre. arg: 'ÉÉÉÉ-HH' (alapból az aktuális hónap) */
function calendarCard(all, ym) {
  const now = new Date();
  let [y, mo] = /^\d{4}-\d{2}$/.test(ym || '') ? ym.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const g = monthGrid(all, y, mo - 1), s = monthSummary(all, y, mo - 1);
  const shift = d => { const t = new Date(y, mo - 1 + d, 1); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`; };
  const delta = (a, b) => (b ? ` (${a - b >= 0 ? '+' : ''}${a - b})` : '');
  const cell = c => {
    const marks = [c.workout ? 'edzés' : null, c.cardio ? 'kardió' : null, c.assessment ? 'felmérés' : null].filter(Boolean);
    return h('div', { class: 'cal-day' + (c.inMonth ? '' : ' out') + (c.today ? ' today' : '') + (marks.length ? ' active' : ''), role: 'gridcell', 'aria-label': `${MONTHS[new Date(c.date).getMonth()]} ${c.day}.${marks.length ? ': ' + marks.join(', ') : ''}` },
      h('span', { class: 'cal-n' }, String(c.day)),
      h('span', { class: 'cal-dots', 'aria-hidden': 'true' }, c.workout ? h('i', { class: 'd-w' + (c.light ? ' light' : '') }) : null, c.cardio ? h('i', { class: 'd-c' }) : null, c.assessment ? h('i', { class: 'd-a' }) : null));
  };
  return card(
    h('div', { class: 'row tight cal-head' }, link('#/log/' + shift(-1), '‹', 'btn small'), h('h2', null, `${y}. ${MONTHS[mo - 1]}`), link('#/log/' + shift(1), '›', 'btn small')),
    h('div', { class: 'cal', role: 'grid', 'aria-label': 'Havi naptár' },
      h('div', { class: 'cal-row', role: 'row' }, ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map(d => h('div', { class: 'cal-wd', role: 'columnheader' }, d))),
      g.weeks.map(w => h('div', { class: 'cal-row', role: 'row' }, w.map(cell)))),
    h('div', { class: 'legend' }, h('span', { class: 'lg-w' }, 'edzés'), h('span', { class: 'lg-c' }, 'kardió'), h('span', { class: 'lg-a' }, 'felmérés')),
    h('div', { class: 'row' }, btn('Havi kép mentése', () => monthImage(y, mo, s), 'small')),
    h('h3', null, 'A hónap összefoglalója'),
    h('div', { class: 'stat-row' },
      h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Edzés'), h('strong', null, String(s.workouts)), h('span', { class: 'small muted' }, 'előző hónap: ' + s.prev.workouts)),
      h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Aktív nap'), h('strong', null, String(s.activeDays)), h('span', { class: 'small muted' }, `leghosszabb sorozat: ${s.bestStreak} nap`)),
      h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Mozgás'), h('strong', null, s.minutes + ' p'), h('span', { class: 'small muted' }, 'ebből kardió: ' + s.cardioMinutes + ' p' + delta(s.cardioMinutes, s.prev.cardioMinutes))),
      h('div', { class: 'stat' }, h('span', { class: 'muted' }, 'Szintlépés'), h('strong', null, String(s.levelUps)), h('span', { class: 'small muted' }, s.assessments ? 'felmérés is volt' : 'nehezebb gyakorlatra váltás'))));
}

export async function logView(ym) {
  const ws = await workouts(), as = await assessments(), all = await itemsAll();
  /* az utolsó 8 hét edzésszáma */
  const DAY = 86400000, now = new Date(); now.setHours(0, 0, 0, 0);
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weeks = Array.from({ length: 8 }, (_, i) => { const s = weeksBack(monday.getTime(), 7 - i), e = weekEnd(s); return { s, n: ws.filter(w => w.date >= s && w.date < e).length }; });
  const max = Math.max(7, ...weeks.map(w => w.n));
  const bars = h('div', { class: 'bars', role: 'img', 'aria-label': 'Edzések hetente az utolsó 8 hétben: ' + weeks.map(w => w.n).join(', ') }, weeks.map((w, i) =>
    h('div', { class: 'bar-col' }, h('span', { class: 'bar-n' }, w.n ? String(w.n) : ''),
      h('div', { class: 'bar-track' }, sized(h('div', { class: 'bar' + (w.n ? '' : ' empty') }), 'height', Math.max(4, (w.n / max) * 100))),
      h('span', { class: 'bar-l' }, i === 7 ? 'e hét' : (7 - i) + ' h'))));
  let compare = null;
  if (as.length >= 2 && sameScoring(as[0], as[as.length - 1])) {
    const first = evaluateItem(as[as.length - 1]), lastE = evaluateItem(as[0]);
    compare = card(h('h2', null, 'Fejlődés az első felmérés óta'), h('table', { class: 'tests-table' },
      h('thead', null, h('tr', null, h('th', null, 'Terület'), h('th', null, 'Első'), h('th', null, 'Utolsó'))),
      h('tbody', null, D.tests.areas.filter(a => first.areas[a.id] || lastE.areas[a.id]).map(a => {
        const f = first.areas[a.id], l = lastE.areas[a.id], d = f && l ? l.score - f.score : null;
        return h('tr', null, h('td', null, a.name), h('td', null, f ? String(f.score) : '–'), h('td', null, l ? String(l.score) + (d ? ` (${d > 0 ? '+' : ''}${d})` : '') : '–'));
      }))),
      first.fitnessAge != null && lastE.fitnessAge != null ? h('p', { class: 'small' }, `Fittségi kor: ${first.fitnessAge} → ${lastE.fitnessAge} év.`) : null);
  }
  return page('Napló',
    as.length >= 2 && !sameScoring(as[0], as[as.length - 1]) ? note('Az első és az utolsó felmérés pontozási verziója eltér vagy nem ismert. Pontszámváltozás helyett a nyers teszteredményeket érdemes összevetni.', 'small') : null,
    calendarCard(all, ym),
    card(h('h2', null, 'Edzések hetente'), bars),
    compare,
    card(h('h2', null, 'Felmérések'), as.length ? h('ul', { class: 'rows' }, as.map(a => { const e = evaluateItem(a); return h('li', null, link('#/result/' + a.id, fmtDate(a.date)), h('span', { class: 'muted small' }, (e.overall != null ? e.overall + ' / 100' : '') + (e.fitnessAge != null ? ' · fittségi kor ' + e.fitnessAge : ''))); })) : h('p', { class: 'muted' }, 'Még nincs felmérés.')),
    card(h('h2', null, 'Edzések'), ws.length ? h('ul', { class: 'rows' }, ws.slice(0, 30).map(w => h('li', null,
      h('span', { class: 'log-item' }, h('strong', null, w.title || SESSION_TITLES[w.key] || w.key), h('span', { class: 'muted small' }, fmtDate(w.date) + ' · ' + w.minutes + ' perc' + (w.partial ? ' · részben' : '') + (w.partner ? ' · ketten' : '')), w.note ? h('span', { class: 'small log-note' }, '„' + w.note + '”') : null),
      w.changes && w.changes.length ? h('span', { class: 'badge good' }, 'Szintlépés') : null))) : emptyState('Még nincs edzés. Az első mindig a legnehezebb, utána jön a lendület.', link('#/', 'Mai edzés', 'btn small'))));
}

/* Visszatöltés mentésfájlból: ellenőrzés, megerősítés, majd az app újraindítása a visszatöltött adatokkal. */
export function restorePicker() {
  const input = h('input', { type: 'file', accept: 'application/json,.json', class: 'visually-hidden', onchange: async () => {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    let res;
    try {
      if (file.size > 5 * 1024 * 1024) { toast('A fájl túl nagy.'); return; }
      res = parseBackup(await file.text(), { testIds: D.tests.tests.map(t => t.id), areaIds: D.tests.areas.map(a => a.id), ladders: LADDERS, sessionKeys: Object.keys(SESSION_TITLES), ratingKeys: RATINGS.map(([k]) => k), cardioTypes: CARDIO_TYPES.map(([k]) => k), goalMetrics: GOAL_METRICS().map(([k]) => k), exerciseIds: D.exercises.exercises.map(e => e.id), challengeIds: CHALLENGES.map(c => c.id) });
    } catch { toast('A fájlt nem sikerült beolvasni. A jelenlegi adatok megmaradtak.'); return; }
    if (!res.ok) { toast(res.error); return; }
    const { items } = res.data, na = items.filter(i => i.kind === 'assessment').length, nw = items.length - na;
    if (!confirm(`A mentésben ${na} felmérés és ${nw} egyéb bejegyzés van. Visszatöltöd? Ami most a telefonon van, annak a helyére kerül.`)) return;
    try { await restoreAll(res.data); }
    catch { toast('A visszatöltés nem sikerült. A jelenlegi adatok megmaradtak.'); return; }
    S.settings = res.data.settings;
    applyLook();
    toast('Visszatöltöttem.');
    // A nézet újrarajzolása elég; az oldal újratöltése memóriamódban adatvesztést okozna.
    if (location.hash === '#/') dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = '#/';
  } });
  return h('label', { class: 'btn' }, 'Visszatöltés fájlból', input);
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function settingsView() {
  const p = profile();
  const st = { age: p.age, sex: p.sex };
  const age = h('input', { type: 'number', inputMode: 'numeric', min: 18, max: 99, value: st.age ?? '', oninput: () => { st.age = Number(age.value); } });
  const low = h('input', { type: 'checkbox', checked: !!S.settings.lowImpact });
  const eq = new Set(S.settings.equipment || []);
  const eqBoxes = EQUIPMENT.map(([k, label]) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: eq.has(k), onchange: e => { if (e.target.checked) eq.add(k); else eq.delete(k); } }), h('span', null, label)));
  const time = h('input', { type: 'time', value: (S.settings.reminder && S.settings.reminder.time) || '07:00' });
  return page('Beállítások',
    card(h('h2', null, 'Profil'),
      h('label', { class: 'field' }, 'Életkor', age),
      choice('sex-s', [['male', 'Férfi'], ['female', 'Nő']], st.sex, v => { st.sex = v; }, 'Nem'),
      h('label', { class: 'check' }, low, h('span', null, 'Kímélő mód: ugrások és ugrásos intervallumok nélkül (ízületi panasz, túlsúly, vagy ha az orvos így javasolja)')),
      h('div', { class: 'row' }, btn('Mentés', async () => {
        if (!ageOk(st.age)) { toast('Adj meg egy 18 és 99 közötti életkort.'); return; }
        await saveSettings({ profile: { age: st.age, sex: st.sex }, lowImpact: low.checked });
        const prog = await getProgram();
        if (prog) await setProgram({ ...prog, lowImpact: low.checked });
        toast('Elmentettem.');
      }, 'primary')),
      h('p', { class: 'small muted' }, 'A korábbi felmérések a felméréskori életkorral maradnak meg.')),
    card(h('h2', null, 'Megjelenés'),
      h('h3', null, 'Téma'),
      choice('theme', [['auto', 'A telefon beállítása szerint'], ['light', 'Világos (naplemente)'], ['dark', 'Sötét (éjszakai neon)'], ['sun', 'Napfény: nagy kontraszt szabadtéren']], S.settings.theme || 'auto', async v => { await saveSettings({ theme: v }); applyLook(); }, 'Téma'),
      h('h3', null, 'Betűméret'),
      choice('size', [['normal', 'Normál'], ['large', 'Nagy (edzés közben is jól olvasható)']], S.settings.size || 'normal', async v => { await saveSettings({ size: v }); applyLook(); }, 'Betűméret')),
    card(h('h2', null, 'Heti edzéscél'),
      h('p', { class: 'small muted' }, 'Hány edzést tűzöl ki egy hétre. Ez szokáscél: a kezdőlapon, a heti áttekintésben és a Fejlődés oldalon ehhez mérem a hetedet. A forgó rend ettől nem változik.'),
      choice('wgoal', [2, 3, 4, 5, 6, 7].map(n => [n, n + ' edzés']), weeklyGoal(), async v => { await saveSettings({ weeklyGoal: v }); toast('Elmentettem a heti célt.'); }, 'Heti edzéscél')),
    card(h('h2', null, 'Edzésidő'),
      h('p', { class: 'small muted' }, 'Ha kevés az időd, az edzést a választott hosszhoz igazítom: rövidebb mobilitás és pihenő, kevesebb kör. 35 percnél a fő gyakorlatok egy kört kapnak.'),
      choice('dur', DURATIONS, S.settings.duration || 0, async v => { await saveSettings({ duration: v }); toast('Elmentettem. A következő edzéstől érvényes.'); }, 'Edzésidő')),
    card(h('h2', null, 'Panaszmód'),
      h('p', { class: 'small muted' }, 'Ha valamelyik ízületed érzékeny, a program kímélőbb változatokat ad: térdnél ugrás és mély egylábas guggolás nélkül, deréknál lendítés és hollow nélkül, vállnál fekvőtámasz térdelve és rúd nélkül. Általános, óvatos szabályok' + (reviewed() ? ', szakember átnézte' : '; szakember még nem lektorálta') + '. Tartós vagy éles fájdalommal fordulj orvoshoz vagy gyógytornászhoz.'),
      COMPLAINTS.map(([k, label]) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: (S.settings.complaints || []).includes(k), onchange: async e => {
        const set = new Set(S.settings.complaints || []); if (e.target.checked) set.add(k); else set.delete(k);
        await saveSettings({ complaints: [...set] });
        const prog = await getProgram(); if (prog) await setProgram({ ...prog, complaints: [...set] });
        toast('Elmentettem. A következő edzéstől érvényes.');
      } }), h('span', null, label)))),
    card(h('h2', null, 'Eszközeid'),
      h('p', { class: 'small muted' }, 'A húzógyakorlatok ehhez igazodnak: rúddal húzódzkodás felé haladsz, gumiszalaggal evezéssel; ha egyik sincs, asztal alatti húzással.'),
      eqBoxes,
      h('div', { class: 'row' }, btn('Eszközök mentése', async () => {
        await saveSettings({ equipment: [...eq] });
        const prog = await getProgram();
        if (prog) await setProgram({ ...prog, equipment: [...eq] });
        toast('Elmentettem. A következő edzéstől érvényes.');
      }))),
    card(h('h2', null, 'Hangos mód'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!S.settings.voiceMode, onchange: async e => { await saveSettings({ voiceMode: e.target.checked }); toast(e.target.checked ? 'Bekapcsolva: az edzés képernyő nélkül is vezet.' : 'Kikapcsolva.'); } }),
        h('span', null, 'Edzés képernyő nélkül: minden lépést és a figyelmeztetéseket is felolvasom, az ismétléses gyakorlatok után magától továbblép, és egyetlen nagy „Tovább” gomb marad.'))),
    card(h('h2', null, 'Reggeli nyújtás az ébresztő után'),
      h('p', null, 'Naptárfájl: minden reggel a választott időpontban emlékeztet az 5 perces reggeli rutinra, egy linkkel, ami egyenesen elindítja.'),
      h('div', { class: 'row' }, ...['06:00', '06:30', '07:00', '07:30'].map(t => btn(t, () => download('forma-reggeli.ics', buildDailyIcs({ time: t, start: new Date(), days: 42, minutes: 5, title: 'Forma: reggeli ébresztő (5 perc)', body: 'Nyisd meg: ' + location.origin + location.pathname + '#/session/routine-morning' }), 'text/calendar'), 'small')))),
    card(h('h2', null, 'Funkciók'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!S.settings.showAll, onchange: async e => { await saveSettings({ showAll: e.target.checked }); } }), h('span', null, 'Minden funkció mutatása rögtön (az első héten alapból csak az alapok látszanak nyitva)'))),
    card(h('h2', null, 'Mozgásszünetek munka közben'),
      h('p', null, 'Hétköznap, munkaidőben óránként 2 perces mozgásszünetre emlékeztet a naptárad (4 hétig).'),
      h('div', { class: 'row' }, ...[[8, 16], [9, 17], [10, 18]].map(([f, t]) => btn(`${f}–${t} óra`, () => download('forma-mozgasszunet.ics', breaksIcs({ from: f, to: t }), 'text/calendar'), 'small')))),
    card(h('h2', null, 'Napi emlékeztető'),
      h('p', null, 'Naptárfájlt kapsz, ami a következő 6 hétben minden nap jelez a választott időpont előtt 10 perccel. A telefon naptára emlékeztet, szerver nélkül.'),
      h('label', { class: 'field inline' }, 'Időpont', time),
      h('div', { class: 'row' }, btn('Naptárfájl letöltése', async () => {
        await saveSettings({ reminder: { time: time.value } });
        download('forma-emlekezteto.ics', buildDailyIcs({ time: time.value, start: new Date(), days: 42, title: 'Forma: mai edzés', body: 'Napi 15–25 perc. Nyisd meg a Formát, és indítsd a mai edzést.' }), 'text/calendar');
      }))),
    card(h('h2', null, 'Adataid'),
      h('p', null, 'Minden adat ezen a telefonon, ebben a böngészőben van. Ha törlöd a böngésző adatait, ezek is elvesznek: ments fájlba vagy küldd el magadnak e-mailben időnként.'),
      await backupSettingsBlock(),
      h('div', { class: 'row' },
        restorePicker(),
        btn('Minden adat törlése', async () => { if (!confirm('Biztosan törlöd az összes felmérést, edzést és beállítást? Ez nem vonható vissza.')) return; await wipeAll(); S.settings = null; location.hash = '#/start'; location.reload(); }, 'danger'))),
    card(h('h2', null, 'A normákról'),
      h('p', null, 'A percentilisek egy része publikált felnőtt normákra épül (CSEP); más normákat eltérő minták és mérési módszerek alapján becsültünk. Ezt tesztenként jelöljük. A funkcionális küszöb pontszám, nem népességi percentilis. ' + (reviewed() ? 'A normákat, a teszteket és a gyakorlatokat szakember átnézte.' : 'A normákat és a gyakorlatokat szakember még nem lektorálta.')),
      h('p', { class: 'small muted' }, 'A Forma nem orvosi eszköz.')));
}

/* Több: gyorsgombok fent, alatta csoportok. Az extrák az első héten összecsukva, hogy elsőre ne legyen túl sok. */
export async function moreView() {
  const item = (href, ic, title, sub) => h('li', null, h('a', { href }, h('span', { class: 'tile-ic' }, h('span', { class: 'ic ic-' + ic, 'aria-hidden': 'true' })), h('span', null, h('strong', null, title), h('span', { class: 'small' }, sub))));
  const quick = (href, ic, title) => h('a', { class: 'quick', href }, h('span', { class: 'ic ic-' + ic, 'aria-hidden': 'true' }), h('span', null, title));
  const first = (await workouts()).map(w => w.date).sort((x, y) => x - y)[0];
  const newbie = !(S.settings && S.settings.showAll) && (!first || Date.now() - first < 7 * 86400000);
  const group = (title, items, open = true) => h('details', { class: 'more-group', open: open || undefined }, h('summary', null, h('h2', null, title)), h('ul', { class: 'menu-list' }, items));
  return page('Több',
    h('nav', { class: 'quick-row', 'aria-label': 'Gyorsgombok' }, quick('#/assess', 'check', 'Felmérés'), quick('#/routines', 'train', 'Rutinok'), quick('#/cardio', 'chart', 'Kardió'), quick('#/log', 'log', 'Napló')),
    group('Mérések', [
      item('#/result', 'chart', 'Legutóbbi eredmény', 'Pókhálóábra, fittségi kor, területek'),
      item('#/posture', 'check', 'Testtartás', 'Szemből és oldalról, kamerával'),
      item('#/pulse', 'chart', 'Reggeli pulzus', 'Kamerával, a regenerációs pontszámhoz')]),
    group('Edzések', [
      item('#/library', 'log', 'Gyakorlattár', 'Minden gyakorlat, kedvencek, saját edzés'),
      item('#/run', 'train', 'Futóprogram', 'Nulláról 5 km-ig, 9 hét')]),
    group(newbie ? 'Extrák (az első hét után nyílik ki)' : 'Extrák', [
      item('#/blocks', 'train', 'Szezonális programok', 'Sí, nyári futás, strandszezon: 4–6 hetes blokkok'),
      item('#/challenge', 'check', '30 napos kihívás', 'Plank, guggolás, fekvőtámasz, mobilitás'),
      item('#/report', 'log', 'Összefoglaló orvosnak, edzőnek', 'Nyomtatható, PDF-be menthető')], !newbie),
    group('Beállítások és segítség', [
      item('#/settings', 'gear', 'Beállítások', 'Profil, eszközök, edzésidő, megjelenés, mentés'),
      item('#/qa', 'check', 'Kipróbálási lista', 'A valódi telefonos próba lépései'),
      item('#/diag', 'gear', 'Eszközpróba és hibajelentés', 'Ha valami nem működik'),
      item('../', 'home', 'Önismereti oldalak', 'Az Önismeret többi oldala: alvás, szokások, energia')]));
}
