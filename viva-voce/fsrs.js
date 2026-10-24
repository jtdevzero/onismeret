/* FSRS-4.5 ütemező (Free Spaced Repetition Scheduler) — ugyanaz az algoritmus, amit az Anki is használ.
   Jegyek: 1 = nem tudtam, 2 = nehezen, 3 = jó, 4 = könnyű.
   Kártya: { s: stabilitás (nap), d: nehézség (1–10), reps, lapses, last: ms, due: napindex } */
(function (root) {
  'use strict';
  const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
    0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  const DECAY = -0.5;
  const FACTOR = 19 / 81;
  const DAY = 86400000;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // Felejtési görbe: mekkora eséllyel emlékszel t nap után, S stabilitásnál
  const retrievability = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
  // Hány nap múlva esik a felidézési esély a cél alá
  const interval = (s, r) => s / FACTOR * (Math.pow(r, 1 / DECAY) - 1);
  const initD = g => clamp(W[4] - (g - 3) * W[5], 1, 10);
  const nextD = (d, g) => clamp(W[7] * initD(3) + (1 - W[7]) * (d - W[6] * (g - 3)), 1, 10);
  const recallS = (d, s, r, g) => s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1) + 1);
  const forgetS = (d, s, r) => W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));

  /* Napindex hajnali 4-es fordulóval, helyi idő szerint. */
  function dayIndex(ts) {
    const d = new Date((ts == null ? Date.now() : ts) - 4 * 3600000);
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / DAY);
  }

  /* Egy értékelés alkalmazása. Visszaadja az új kártyát (nem módosítja a régit). */
  function review(card, g, now, targetR) {
    now = now == null ? Date.now() : now;
    targetR = targetR || 0.9;
    let c;
    if (!card || !card.reps) {
      c = { s: W[g - 1], d: initD(g), reps: 1, lapses: g === 1 ? 1 : 0, last: now, intro: dayIndex(now) };
    } else {
      c = Object.assign({}, card);
      const t = Math.max(0, (now - c.last) / DAY);
      const r = retrievability(t, c.s);
      if (g === 1) {
        c.s = Math.max(0.1, Math.min(c.s, forgetS(c.d, c.s, r)));
        c.lapses = (c.lapses || 0) + 1;
      } else {
        c.s = recallS(c.d, c.s, r, g);
      }
      c.d = nextD(c.d, g);
      c.reps += 1;
      c.last = now;
    }
    const ivl = g === 1 ? 1 : clamp(Math.round(interval(c.s, targetR)), 1, 365);
    c.due = dayIndex(now) + ivl;
    c.ivl = ivl;
    return c;
  }

  const api = { W, retrievability, interval, initD, nextD, recallS, forgetS, review, dayIndex, DAY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FSRS = api;
})(this);
