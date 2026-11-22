/* Gyakorlattár (keresés, szűrés, kedvencek), rutinok és saját edzés összeállítása. */
import { h, clear, uid, toast } from './dom.js';
import { page, card, btn, link, note, typeIcon, emptyState } from './widgets.js';
import { D } from './data.js';
import { kvGet, kvSet } from './store.js';
import { tr } from './i18n.js';

const reload = hash => { location.hash = hash; dispatchEvent(new HashChangeEvent('hashchange')); };
const getFavs = async () => new Set((await kvGet('favs', [])) || []);
export const getCustom = async () => (await kvGet('custom', [])) || [];
const doseText = d => (d.reps ? d.reps + ' ism.' : d.seconds + ' mp');

export async function libraryView() {
  const favs = await getFavs(), all = D.exercises.exercises;
  const st = { q: '', type: 'all', fav: false };
  const types = [['all', tr('Mind')], ['fav', '★ Kedvencek'], ...Object.entries(D.exercises.typeNames)];
  const listEl = h('div');
  const search = h('input', { type: 'search', placeholder: tr('Keresés név szerint…'), 'aria-label': tr('Gyakorlat keresése'), class: 'search', oninput: () => { st.q = search.value.trim().toLowerCase(); draw(); } });
  const chips = h('div', { class: 'chips', role: 'radiogroup', 'aria-label': tr('Szűrés típus szerint') }, types.map(([k, t]) =>
    h('button', { type: 'button', class: 'chip' + (k === 'all' ? ' on' : ''), role: 'radio', 'aria-checked': k === 'all' ? 'true' : 'false', onclick: e => {
      st.type = k; for (const c of chips.children) { c.classList.toggle('on', c === e.currentTarget); c.setAttribute('aria-checked', c === e.currentTarget ? 'true' : 'false'); } draw();
    } }, t)));
  function draw() {
    const items = all.filter(e => (st.type === 'all' || (st.type === 'fav' ? favs.has(e.id) : e.type === st.type)) && (!st.q || e.name.toLowerCase().includes(st.q)));
    clear(listEl).append(items.length ? h('ul', { class: 'rows lib' }, items.map(e => {
      const star = h('button', { type: 'button', class: 'star' + (favs.has(e.id) ? ' on' : ''), 'aria-pressed': favs.has(e.id) ? 'true' : 'false', 'aria-label': (favs.has(e.id) ? tr('Eltávolítás a kedvencek közül: ') : tr('Kedvencekhez: ')) + e.name, onclick: async () => {
        if (favs.has(e.id)) favs.delete(e.id); else favs.add(e.id);
        await kvSet('favs', [...favs]); star.classList.toggle('on', favs.has(e.id)); star.setAttribute('aria-pressed', favs.has(e.id) ? 'true' : 'false'); star.textContent = favs.has(e.id) ? '★' : '☆';
      } }, favs.has(e.id) ? '★' : '☆');
      return h('li', null, typeIcon(e.type), h('span', { class: 'log-item' }, link('#/ex/' + e.id, e.name), h('span', { class: 'muted small' }, D.exercises.typeNames[e.type] + (e.equipment ? tr(' · eszközzel') : '') + (e.impact ? tr(' · ugrásos') : ''))), star);
    })) : h('p', { class: 'muted' }, tr('Nincs találat.')));
  }
  draw();
  return page(tr('Gyakorlattár'), h('p', { class: 'muted' }, tr('{p0} gyakorlat. A csillaggal kedvencnek jelölheted, a kedvencekből saját edzést állíthatsz össze.', { p0: all.length })),
    search, chips, card(listEl), h('div', { class: 'row' }, link('#/routines', tr('Rutinok és saját edzések'), 'btn primary')));
}

export async function routinesView() {
  const custom = await getCustom();
  return page(tr('Rutinok'),
    h('p', { class: 'muted' }, tr('Rövid, önálló edzések a forgó rend mellé. Nem léptetik a programot, de bekerülnek a naplóba.')),
    h('ul', { class: 'menu-list' }, D.routines.map(r => h('li', null, h('a', { href: '#/session/routine-' + r.id },
      h('span', { class: 'routine-min' }, `${r.minutes}′`), h('span', null, h('strong', null, r.name), h('span', { class: 'small' }, r.about)))))),
    h('h2', { class: 'section-title' }, tr('Saját edzéseid')),
    custom.length ? h('ul', { class: 'menu-list' }, custom.map(c => h('li', null, h('a', { href: '#/session/custom-' + c.id },
      h('span', { class: 'routine-min' }, String(c.blocks.length)), h('span', null, h('strong', null, c.name), h('span', { class: 'small' }, c.blocks.map(b => D.ex[b[0]] ? D.ex[b[0]].name : '').filter(Boolean).join(', '))))))) : emptyState(tr('Még nincs saját edzésed. Jelölj kedvenceket a gyakorlattárban, és állíts össze belőlük egyet.')),
    h('div', { class: 'row' }, link('#/custom', tr('Új saját edzés'), 'btn primary'), custom.length ? link('#/custom/' + custom[0].id, tr('Szerkesztés'), 'btn small') : null));
}

/* Saját edzés összeállítása vagy szerkesztése. arg: a szerkesztendő edzés azonosítója */
export async function customView(arg) {
  const custom = await getCustom(), favs = await getFavs();
  const editing = custom.find(c => c.id === arg) || null;
  const chosen = new Map((editing ? editing.blocks : []).map(([id, sets, dose]) => [id, { sets, dose }]));
  const name = h('input', { type: 'text', maxLength: 40, value: editing ? editing.name : '', id: 'cname', placeholder: tr('Pl. Reggeli 10 perc') });
  const sorted = [...D.exercises.exercises].sort((a, b) => (favs.has(b.id) - favs.has(a.id)) || a.name.localeCompare(b.name, 'hu'));
  const summary = h('p', { class: 'small muted', 'aria-live': 'polite' });
  const upd = () => { summary.textContent = chosen.size ? tr('{p0} gyakorlat kiválasztva.', { p0: chosen.size }) : tr('Válassz legalább két gyakorlatot.'); };
  const rows = sorted.map(e => {
    const base = e.dose.reps ? { reps: e.dose.reps[0] } : { seconds: e.dose.seconds[0] };
    const cur = chosen.get(e.id) || { sets: 2, dose: base };
    const sets = h('input', { type: 'number', min: 1, max: 6, value: cur.sets, class: 'mini-num', 'aria-label': e.name + tr(': körök'), oninput: () => { if (chosen.has(e.id)) chosen.get(e.id).sets = Number(sets.value) || 1; } });
    const amt = h('input', { type: 'number', min: 1, max: 600, value: cur.dose.reps || cur.dose.seconds, class: 'mini-num', 'aria-label': e.name + (e.dose.reps ? tr(': ismétlés') : tr(': másodperc')), oninput: () => { if (chosen.has(e.id)) chosen.get(e.id).dose = e.dose.reps ? { reps: Number(amt.value) || 1 } : { seconds: Number(amt.value) || 5 }; } });
    const box = h('input', { type: 'checkbox', checked: chosen.has(e.id), onchange: () => {
      if (box.checked) chosen.set(e.id, { sets: Number(sets.value) || 1, dose: e.dose.reps ? { reps: Number(amt.value) || 1 } : { seconds: Number(amt.value) || 5 } }); else chosen.delete(e.id);
      upd();
    } });
    return h('li', { class: 'pick' }, h('label', { class: 'check' }, box, h('span', null, (favs.has(e.id) ? '★ ' : '') + e.name)),
      h('span', { class: 'pick-dose' }, sets, h('span', { class: 'small muted' }, '×'), amt, h('span', { class: 'small muted' }, e.dose.reps ? 'ism.' : 'mp')));
  });
  upd();
  return page(editing ? tr('Saját edzés szerkesztése') : tr('Új saját edzés'),
    card(h('label', { class: 'field' }, tr('Név'), name), summary,
      h('div', { class: 'row' }, btn(tr('Mentés'), async () => {
        const nm = name.value.trim();
        if (!nm) { toast('Adj nevet az edzésnek.'); return; }
        if (chosen.size < 2) { toast('Válassz legalább két gyakorlatot.'); return; }
        /* a sorrend a lista sorrendje (kedvencek elöl); edzés közben is lapozható */
        const blocks = sorted.filter(e => chosen.has(e.id)).map(e => { const c = chosen.get(e.id); return [e.id, Math.max(1, Math.min(6, c.sets)), c.dose]; });
        const item = { id: editing ? editing.id : uid(), name: nm.slice(0, 40), blocks };
        await kvSet('custom', [...custom.filter(c => c.id !== item.id), item]);
        toast('Elmentettem.'); reload('#/routines');
      }, 'primary'), editing ? btn(tr('Törlés'), async () => { if (!confirm(tr('Törlöd ezt a saját edzést?'))) return; await kvSet('custom', custom.filter(c => c.id !== editing.id)); reload('#/routines'); }, 'danger') : null)),
    card(h('h2', null, tr('Gyakorlatok')), h('p', { class: 'small muted' }, tr('Pipáld ki, amit szeretnél, és állítsd be a köröket és az adagot. A kedvenceid (★) elöl vannak.')), h('ul', { class: 'rows' }, rows)),
    note(tr('A saját edzés nem igazodik a szintedhez: válassz olyan változatot, ami most megy.'), 'small'));
}
