/* Biztonság (a pálya szabályai, kvíz, pályán kívüli csúszás) és snowboard beállítás-segéd. */
import { h, clear } from './dom.js';
import { page, card, btn, link, note, list, choice } from './widgets.js';
import { D, S } from './data.js';
import { stanceAdvice, STYLES, fmtAngle } from '../core/stance.js';

export async function safetyView() {
  const Q = D.safety.quiz, answered = new Map();
  const score = h('p', { class: 'lead', 'aria-live': 'polite' });
  const update = () => {
    const right = [...answered.values()].filter(Boolean).length;
    score.textContent = answered.size === Q.length ? `${right} / ${Q.length} jó válasz.` + (right === Q.length ? ' Hibátlan!' : ' Nézd át a szabályokat még egyszer.') : `${answered.size} / ${Q.length} kérdés megválaszolva.`;
  };
  const questions = Q.map((q, qi) => {
    const fb = h('div', { 'aria-live': 'polite' });
    return h('fieldset', { class: 'quiz' }, h('legend', null, `${qi + 1}. ${q.q}`),
      choice('q' + qi, q.options.map((o, i) => [i, o]), null, v => {
        const ok = Number(v) === q.answer;
        answered.set(qi, ok);
        clear(fb).append(h('p', { class: 'badge ' + (ok ? 'good' : 'warn') }, ok ? 'Jó válasz' : 'Nem ez a jó válasz'), h('p', { class: 'small' }, q.why));
        update();
      }), fb);
  });
  update();
  return page('Biztonság a pályán',
    h('p', { class: 'muted' }, 'A pálya tíz magatartási szabálya, rövid kvíz, és amit a pályán kívüli csúszásról tudnod kell.'),
    card(h('h2', null, 'A pálya szabályai'),
      h('ol', { class: 'rules' }, D.safety.rules.map(r => h('li', null, h('strong', null, r.title), h('span', null, r.text)))),
      note('A Nemzetközi Síszövetség (FIS) magatartási szabályainak saját szavas összefoglalása.', 'small')),
    card(h('h2', null, 'Kvíz'), questions, score),
    card(h('h2', null, 'Felszerelés'), list(D.safety.gear)),
    card(h('h2', null, 'Pályán kívül'), D.safety.offpiste.map((p, i) => (i === D.safety.offpiste.length - 1 ? note(p, 'warn') : h('p', null, p)))),
    link('#/learn', '← Tananyag', 'btn'));
}

export async function stanceView() {
  const f = { height: '', boot: '', style: 'allmountain' };
  const out = h('div', { 'aria-live': 'polite' });
  const height = h('input', { type: 'number', min: 120, max: 215, inputMode: 'numeric', placeholder: 'pl. 175' });
  const boot = h('input', { type: 'number', min: 30, max: 52, step: 0.5, inputMode: 'decimal', placeholder: 'pl. 43' });
  const goofy = S.settings.stance === 'goofy';
  const calc = () => {
    const r = stanceAdvice({ height: height.value, boot: boot.value === '' ? NaN : boot.value, style: f.style });
    if (r.error === 'height') { clear(out).append(h('p', null, 'Add meg a testmagasságod 120 és 215 cm között.')); return; }
    clear(out).append(
      h('h3', null, 'Javaslat'),
      h('ul', { class: 'rows' },
        h('li', null, h('span', null, 'Állásszélesség (a két kötés közepe között)'), h('strong', null, `${r.width} cm`)),
        h('li', null, h('span', null, `Első kötés (${goofy ? 'jobb' : 'bal'} láb)`), h('strong', null, fmtAngle(r.front))),
        h('li', null, h('span', null, `Hátsó kötés (${goofy ? 'bal' : 'jobb'} láb)`), h('strong', null, fmtAngle(r.back)))),
      h('p', null, r.why),
      h('p', { class: 'small' }, `A szélességnél ${r.min}–${r.max} cm között próbálgass: ha szűk, instabil leszel, ha túl széles, nehezebb hajlítani és fordulni. A pozitív szög az orr felé fordul.`),
      r.wide ? note('Nagy a cipőméreted: nézd meg, hogy a cipő orra és sarka ne lógjon túl a deszka szélén 1–2 cm-nél jobban, különben a kanyarban beleérhet a hóba. Lehet, hogy széles (wide) deszka kell.', 'warn') : null,
      note('Ez ökölszabály, nem mérés. Az első napokon apránként állíts rajta, és kérd ki egy oktató vagy szaküzlet véleményét.', 'small'));
  };
  return page('Snowboard beállítás',
    h('p', { class: 'muted' }, 'Kiinduló állásszélesség és kötésszög a magasságod és a stílusod alapján.'),
    card(
      h('label', { class: 'field' }, h('span', null, 'Testmagasság (cm)'), height),
      h('label', { class: 'field' }, h('span', null, 'Cipőméret, EU (nem kötelező)'), boot),
      h('h3', null, 'Hogyan csúszol leginkább?'),
      choice('style', Object.entries(STYLES).map(([k, s]) => [k, s.name]), f.style, v => { f.style = v; }),
      btn('Kiszámolom', calc, 'primary'), out),
    link('#/learn', '← Tananyag', 'btn'));
}
