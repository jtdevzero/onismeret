/* Állóképesség (kardió) napló pulzuszónákkal, és a napi „hogy vagy?” ellenőrzés edzés előtt. */
import { h, clear, fmtDate, uid, toast } from './dom.js';
import { page, card, btn, link, note, choice, list } from './widgets.js';
import { D, profile } from './data.js';
import { kvSet, itemPut, itemsAll, itemDelete } from './store.js';
import { latestAssessment, evaluateItem } from './state.js';
import { hrZones, weeklyCardio, cardioPlan, readiness, maxHr } from '../core/cardio.js';
import { SESSION_TITLES } from '../core/program.js';

export const CARDIO_TYPES = [['walk', 'Tempós séta'], ['jog', 'Kocogás'], ['run', 'Futás'], ['bike', 'Kerékpár'], ['swim', 'Úszás'], ['other', 'Egyéb']];
const TYPE = Object.fromEntries(CARDIO_TYPES);
export const cardioItems = () => itemsAll('cardio');

export async function cardioView() {
  const items = await cardioItems(), last = await latestAssessment();
  const ev = last ? evaluateItem(last) : null, p = profile();
  const rhr = last && last.vitals ? last.vitals.rhr : null;
  const zones = hrZones(p.age, rhr), week = weeklyCardio(items), plan = cardioPlan(ev && ev.areas.cardio ? ev.areas.cardio.score : null, week);
  const st = { type: 'walk', minutes: 30, intensity: 'moderate' };
  const mins = h('input', { type: 'number', inputMode: 'numeric', min: 5, max: 300, value: 30, id: 'cmin', oninput: () => { st.minutes = Number(mins.value); } });
  const list = h('div');
  const draw = all => clear(list).append(all.length ? h('ul', { class: 'rows' }, all.slice(0, 20).map(i => h('li', null,
    h('span', { class: 'log-item' }, h('strong', null, `${TYPE[i.type] || 'Kardió'}, ${i.minutes} perc`), h('span', { class: 'muted small' }, fmtDate(i.date) + (i.intensity === 'vigorous' ? ' · intenzív' : ' · közepes'))),
    btn('Törlés', async () => { if (!confirm('Törlöd ezt a bejegyzést?')) return; await itemDelete(i.id); location.hash = '#/cardio'; dispatchEvent(new HashChangeEvent('hashchange')); }, 'small')))) : h('p', { class: 'muted' }, 'Még nincs bejegyzés.'));
  draw(items);
  return page('Állóképesség',
    h('p', { class: 'muted' }, 'A fittségi korodat leginkább ez javítja. Az erő- és mobilitásnapok mellé, külön alkalomként.'),
    card(h('h2', null, 'E heti kardió'),
      h('div', { class: 'goal' }, h('progress', { max: 100, value: week.pct, 'aria-label': `Heti kardiócél: ${week.pct}%` }),
        h('p', null, h('strong', null, `${week.equivalent} / ${week.goal} perc`), h('span', { class: 'muted small' }, ' (az intenzív perc duplán számít, a WHO ajánlása szerint)'))),
      h('p', null, plan.text), plan.left ? h('p', { class: 'small muted' }, `Ezen a héten még ${plan.left} perc van hátra.`) : h('p', { class: 'small' }, 'Megvan a heti cél. 🎉')),
    card(h('h2', null, 'Futóprogram nulláról 5 km-ig'), h('p', null, '9 hét, hetente 3 alkalom: séta–futás intervallumokkal jutsz el a 30 perc folyamatos futásig. Hangosan vezet, és magától naplóz.'), h('div', { class: 'row' }, link('#/run', 'Futóprogram', 'btn primary'))),
    card(h('h2', null, 'A pulzustartományaid'),
      zones.length ? h('ul', { class: 'rows' }, zones.map(z => h('li', null, h('span', { class: 'log-item' }, h('strong', null, z.name), h('span', { class: 'muted small' }, z.what)), h('span', { class: 'badge mid' }, `${z.lo}–${z.hi}`)))) : null,
      h('p', { class: 'small muted' }, `Becsült maximális pulzus: ${maxHr(p.age) ?? '–'} ütés/perc (Tanaka-képlet). ` + (zones[0] && zones[0].method === 'reserve' ? `A felmérésben megadott nyugalmi pulzusod (${rhr}) alapján, pulzustartalékkal számolva.` : 'Nyugalmi pulzus nélkül a maximum százalékában; a felmérés alapadataival pontosabb.')),
      note('Óra nélkül a beszédteszt is jó: a 2. zónában még tudsz beszélgetni. Béta-blokkoló vagy szívbetegség esetén a pulzuszónák nem érvényesek: az orvosod mondja meg a tartományt.', 'small')),
    card(h('h2', null, 'Új bejegyzés'),
      choice('ctype', CARDIO_TYPES, st.type, v => { st.type = v; }, 'Mozgásforma'),
      h('label', { class: 'field' }, 'Időtartam (perc)', mins),
      h('h3', null, 'Intenzitás'),
      choice('cint', [['moderate', 'Közepes: még tudok beszélgetni (1–3. zóna)'], ['vigorous', 'Intenzív: csak pár szó fér ki (4. zóna fölött)']], st.intensity, v => { st.intensity = v; }, 'Intenzitás'),
      h('div', { class: 'row' }, btn('Mentés', async () => {
        if (!(st.minutes >= 5 && st.minutes <= 300)) { toast('Az időtartam 5 és 300 perc között lehet.'); return; }
        await itemPut({ id: uid(), kind: 'cardio', date: Date.now(), type: st.type, minutes: Math.round(st.minutes), intensity: st.intensity });
        toast('Bekerült a naplóba.');
        location.hash = '#/cardio'; dispatchEvent(new HashChangeEvent('hashchange'));
      }, 'primary'))),
    card(h('h2', null, 'Korábbiak'), list));
}

/* Napi ellenőrzés edzés előtt. key: a választott edzés */
export async function checkView(key) {
  if (!SESSION_TITLES[key]) return page('Nincs ilyen edzés', link('#/program', '← Program', 'btn'));
  const st = { sleep: null, soreness: null, energy: null, pain: false };
  const out = h('div', { 'aria-live': 'polite' });
  const opts3 = (a, b, c) => [[1, a], [2, b], [3, c]];
  const refresh = async () => {
    const r = readiness(st);
    clear(out);
    if (!r) return;
    await kvSet('readiness', { date: Date.now(), ...st, level: r.level });
    out.append(card(h('p', { class: 'lead' }, r.text), h('div', { class: 'row' },
      r.level === 'go' ? link('#/session/' + key, 'Teljes edzés: ' + SESSION_TITLES[key], 'btn primary') : null,
      r.level !== 'rest' && key !== 'mobility' ? link('#/session/' + key + '.light', 'Könnyített edzés', 'btn' + (r.level === 'light' ? ' primary' : '')) : null,
      link('#/session/mobility', 'Csak mobilitás', 'btn' + (r.level === 'rest' ? ' primary' : '')),
      r.level !== 'go' ? link('#/session/' + key, 'Mégis a teljeset', 'btn small') : null)));
  };
  /* rossz alvásnál tippek, és az Önismeret alvásoldala */
  const sleepTip = h('div', { 'aria-live': 'polite' });
  const showSleep = () => { clear(sleepTip); if (st.sleep === 1) sleepTip.append(card(h('h2', null, 'Alvás és edzés'), list(['Ma este 30 perccel korábban feküdj le, képernyő nélkül.', 'Délután 2 után már ne igyál koffeint.', 'Rossz alvás után a könnyített edzés is teljes értékű: a fejlődés a pihenés alatt történik.']), h('p', null, h('a', { href: '../alvas.html' }, 'Részletesebben: az Önismeret alvásoldala')))); };
  const pain = h('input', { type: 'checkbox', onchange: e => { st.pain = e.target.checked; refresh(); } });
  return page('Hogy vagy ma?',
    h('p', { class: 'muted' }, `Mielőtt elkezded: ${SESSION_TITLES[key]}. Három gyors kérdés, hogy a mai edzés illeszkedjen a napodhoz.`),
    card(h('h2', null, 'Alvás'), choice('sleep', opts3('Rosszul aludtam', 'Közepesen', 'Jól kialudtam magam'), null, v => { st.sleep = v; showSleep(); refresh(); }, 'Alvás'),
      h('h3', null, 'Izomláz'), choice('sore', opts3('Erős izomlázam van', 'Enyhe', 'Nincs'), null, v => { st.soreness = v; refresh(); }, 'Izomláz'),
      h('h3', null, 'Energia'), choice('energy', opts3('Fáradt vagyok', 'Átlagos', 'Friss vagyok'), null, v => { st.energy = v; refresh(); }, 'Energia'),
      h('label', { class: 'check' }, pain, h('span', null, 'Valamim fáj (nem izomláz, hanem éles vagy ízületi fájdalom)'))),
    out, sleepTip,
    h('p', null, link('#/session/' + key, 'Kihagyom a kérdéseket, indulok', 'small')));
}
