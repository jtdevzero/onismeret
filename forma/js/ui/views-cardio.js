/* Állóképesség (kardió) napló pulzuszónákkal, és a napi „hogy vagy?” ellenőrzés edzés előtt. */
import { h, clear, fmtDate, uid, toast } from './dom.js';
import { page, card, btn, link, note, choice, list, artBanner } from './widgets.js';
import { profile } from './data.js';
import { kvSet, itemPut, itemsAll, itemDelete, commit } from './store.js';
import { latestAssessment, evaluateItem } from './state.js';
import { hrZones, weeklyCardio, cardioPlan, readiness, maxHr } from '../core/cardio.js';
import { parseGpx, parseCsv } from '../core/extras.js';
import { SESSION_TITLES } from '../core/program.js';
import { dayKey } from '../core/wellness.js';
import { tr } from './i18n.js';

export const CARDIO_TYPES = [['walk', tr('Tempós séta')], ['jog', tr('Kocogás')], ['run', tr('Futás')], ['bike', tr('Kerékpár')], ['swim', tr('Úszás')], ['other', tr('Egyéb')]];
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
    h('span', { class: 'log-item' }, h('strong', null, `${TYPE[i.type] || 'Kardió'}, ${i.minutes} perc` + (i.km ? `, ${String(i.km).replace('.', ',')} km` : '')), h('span', { class: 'muted small' }, fmtDate(i.date) + (i.intensity === 'vigorous' ? tr(' · intenzív') : tr(' · közepes')))),
    btn(tr('Törlés'), async () => { if (!confirm(tr('Törlöd ezt a bejegyzést?'))) return; await itemDelete(i.id); location.hash = '#/cardio'; dispatchEvent(new HashChangeEvent('hashchange')); }, 'small')))) : h('p', { class: 'muted' }, tr('Még nincs bejegyzés.')));
  draw(items);
  return page(tr('Állóképesség'),
    artBanner('cardio', tr('Heti cél: 150 perc'), tr('Mozogj a zónádban')),
    h('p', { class: 'muted' }, tr('A fittségi korodat leginkább ez javítja. Az erő- és mobilitásnapok mellé, külön alkalomként.')),
    card(h('h2', null, tr('E heti kardió')),
      h('div', { class: 'goal' }, h('progress', { max: 100, value: week.pct, 'aria-label': tr('Heti kardiócél: {p0}%', { p0: week.pct }) }),
        h('p', null, h('strong', null, `${week.equivalent} / ${week.goal} perc`), h('span', { class: 'muted small' }, tr(' (az intenzív perc duplán számít, a WHO ajánlása szerint)')))),
      h('p', null, plan.text), plan.left ? h('p', { class: 'small muted' }, tr('Ezen a héten még {p0} perc van hátra.', { p0: plan.left })) : h('p', { class: 'small' }, tr('Megvan a heti cél. 🎉'))),
    card(h('h2', null, tr('Futóprogram nulláról 5 km-ig')), h('p', null, tr('9 hét, hetente 3 alkalom: séta–futás intervallumokkal jutsz el a 30 perc folyamatos futásig. Hangosan vezet, és magától naplóz.')), h('div', { class: 'row' }, link('#/run', tr('Futóprogram'), 'btn primary'))),
    card(h('h2', null, tr('A pulzustartományaid')),
      zones.length ? h('ul', { class: 'rows' }, zones.map(z => h('li', null, h('span', { class: 'log-item' }, h('strong', null, z.name), h('span', { class: 'muted small' }, z.what)), h('span', { class: 'badge mid' }, `${z.lo}–${z.hi}`)))) : null,
      h('p', { class: 'small muted' }, tr('Becsült maximális pulzus: {p0} ütés/perc (Tanaka-képlet). ', { p0: maxHr(p.age) ?? '–' }) + (zones[0] && zones[0].method === 'reserve' ? tr('A felmérésben megadott nyugalmi pulzusod ({p0}) alapján, pulzustartalékkal számolva.', { p0: rhr }) : tr('Nyugalmi pulzus nélkül a maximum százalékában; a felmérés alapadataival pontosabb.'))),
      note(tr('Óra nélkül a beszédteszt is jó: a 2. zónában még tudsz beszélgetni. Béta-blokkoló vagy szívbetegség esetén a pulzuszónák nem érvényesek: az orvosod mondja meg a tartományt.'), 'small')),
    card(h('h2', null, tr('Új bejegyzés')),
      choice('ctype', CARDIO_TYPES, st.type, v => { st.type = v; }, tr('Mozgásforma')),
      h('label', { class: 'field' }, tr('Időtartam (perc)'), mins),
      h('h3', null, tr('Intenzitás')),
      choice('cint', [['moderate', tr('Közepes: még tudok beszélgetni (1–3. zóna)')], ['vigorous', tr('Intenzív: csak pár szó fér ki (4. zóna fölött)')]], st.intensity, v => { st.intensity = v; }, tr('Intenzitás')),
      h('div', { class: 'row' }, btn(tr('Mentés'), async () => {
        if (!(st.minutes >= 5 && st.minutes <= 300)) { toast('Az időtartam 5 és 300 perc között lehet.'); return; }
        await itemPut({ id: uid(), kind: 'cardio', date: Date.now(), type: st.type, minutes: Math.round(st.minutes), intensity: st.intensity });
        toast('Bekerült a naplóba.');
        location.hash = '#/cardio'; dispatchEvent(new HashChangeEvent('hashchange'));
      }, 'primary'))),
    card(h('h2', null, tr('Import okosóráról vagy futóappból')),
      h('p', { class: 'small muted' }, tr('GPX-fájl (egy edzés, az időt és a távot olvasom ki) vagy CSV (soronként: dátum; perc; típus, pl. 2026-11-20;35;futás). Exportáld az órád alkalmazásából, és válaszd ki itt. A fájl a telefonon marad.')),
      h('label', { class: 'btn' }, tr('Fájl kiválasztása'), h('input', { type: 'file', accept: '.gpx,.csv,.txt,application/gpx+xml,text/csv', class: 'visually-hidden', onchange: async e => {
        const f = e.target.files && e.target.files[0]; e.target.value = '';
        if (!f) return;
        const text = await f.text();
        let rows = [];
        if (/\.gpx$/i.test(f.name) || /<gpx[\s>]/.test(text.slice(0, 2000))) { const g = parseGpx(text, t => new DOMParser().parseFromString(t, 'application/xml')); if (g) rows = [g]; }
        else rows = parseCsv(text, CARDIO_TYPES.map(([k]) => k));
        if (!rows.length) { toast('Nem találtam beolvasható edzést a fájlban.'); return; }
        for (const r of rows) await itemPut({ id: uid(), kind: 'cardio', date: r.date, type: r.type, minutes: r.minutes, intensity: 'moderate', ...(r.km ? { km: r.km } : {}) });
        toast(tr('{p0} edzést beolvastam.', { p0: rows.length })); location.hash = '#/cardio'; dispatchEvent(new HashChangeEvent('hashchange'));
      } }))),
    card(h('h2', null, tr('Korábbiak')), list));
}

/* Napi ellenőrzés edzés előtt. key: a választott edzés */
export async function checkView(key) {
  if (!SESSION_TITLES[key]) return page(tr('Nincs ilyen edzés'), link('#/program', '← Program', 'btn'));
  const st = { sleep: null, soreness: null, energy: null, pain: false };
  const out = h('div', { 'aria-live': 'polite' });
  const opts3 = (a, b, c) => [[1, a], [2, b], [3, c]];
  const refresh = async () => {
    const r = readiness(st);
    clear(out);
    if (!r) return;
    /* a legutóbbi állapot (regenerációs pontszámhoz) és a napi bejegyzés (idősorhoz) együtt; naponta egy bejegyzés, felülírva */
    const now = Date.now(), entry = { date: now, ...st, level: r.level };
    try { await commit({ readiness: entry }, [{ id: 'check-' + dayKey(now), kind: 'check', ...entry, pain: !!st.pain }]); }
    catch { await kvSet('readiness', entry).catch(() => {}); }
    out.append(card(h('p', { class: 'lead' }, r.text), h('div', { class: 'row' },
      r.level === 'go' ? link('#/session/' + key, tr('Teljes edzés: ') + SESSION_TITLES[key], 'btn primary') : null,
      r.level !== 'rest' && key !== 'mobility' ? link('#/session/' + key + '.light', tr('Könnyített edzés'), 'btn' + (r.level === 'light' ? ' primary' : '')) : null,
      link('#/session/mobility', tr('Csak mobilitás'), 'btn' + (r.level === 'rest' ? ' primary' : '')),
      r.level !== 'go' ? link('#/session/' + key, tr('Mégis a teljeset'), 'btn small') : null)));
  };
  /* rossz alvásnál tippek, és az Önismeret alvásoldala */
  const sleepTip = h('div', { 'aria-live': 'polite' });
  const showSleep = () => { clear(sleepTip); if (st.sleep === 1) sleepTip.append(card(h('h2', null, tr('Alvás és edzés')), list([tr('Ma este 30 perccel korábban feküdj le, képernyő nélkül.'), tr('Délután 2 után már ne igyál koffeint.'), tr('Rossz alvás után a könnyített edzés is teljes értékű: a fejlődés a pihenés alatt történik.')]), h('p', null, h('a', { href: '../alvas.html' }, tr('Részletesebben: az Önismeret alvásoldala'))))); };
  const pain = h('input', { type: 'checkbox', onchange: e => { st.pain = e.target.checked; refresh(); } });
  return page(tr('Hogy vagy ma?'),
    h('p', { class: 'muted' }, tr('Mielőtt elkezded: {p0}. Három gyors kérdés, hogy a mai edzés illeszkedjen a napodhoz.', { p0: SESSION_TITLES[key] })),
    card(h('h2', null, tr('Alvás')), choice('sleep', opts3(tr('Rosszul aludtam'), tr('Közepesen'), tr('Jól kialudtam magam')), null, v => { st.sleep = v; showSleep(); refresh(); }, tr('Alvás')),
      h('h3', null, tr('Izomláz')), choice('sore', opts3(tr('Erős izomlázam van'), tr('Enyhe'), tr('Nincs')), null, v => { st.soreness = v; refresh(); }, tr('Izomláz')),
      h('h3', null, tr('Energia')), choice('energy', opts3(tr('Fáradt vagyok'), tr('Átlagos'), tr('Friss vagyok')), null, v => { st.energy = v; refresh(); }, tr('Energia')),
      h('label', { class: 'check' }, pain, h('span', null, tr('Valamim fáj (nem izomláz, hanem éles vagy ízületi fájdalom)')))),
    out, sleepTip,
    h('p', null, link('#/session/' + key, tr('Kihagyom a kérdéseket, indulok'), 'small')));
}
