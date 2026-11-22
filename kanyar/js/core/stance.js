/* Snowboard beállítás-segéd: állásszélesség és kötésszög ökölszabályokból. Tiszta függvények.
   Kiindulópont, nem mérés: a végleges beállítást a saját érzésed és egy szakember dönti el. */

export const STYLES = {
  beginner: { name: 'Kezdő, sokoldalú', front: 15, back: 0, why: 'Enyhén előre forduló első láb, semleges hátsó: stabil és könnyen tanulható.' },
  allmountain: { name: 'Pálya és sokoldalú', front: 15, back: -6, why: 'Enyhe „kacsa” állás: mindkét irányba jól csúszol, mégis jól vezeted a kanyart.' },
  freestyle: { name: 'Park és freestyle', front: 15, back: -15, why: 'Szimmetrikus kacsa állás: ugyanúgy csúszol előre és hátra (switch).' },
  carving: { name: 'Carving és élen vezetett kanyar', front: 21, back: 6, why: 'Mindkét láb előre fordul: a test a menetirány felé néz, erősebb élterhelés.' },
};

/* o: { height: cm, boot: EU-méret, style } → javaslat vagy { error } */
export function stanceAdvice(o = {}) {
  const height = Number(o.height), boot = Number(o.boot), s = STYLES[o.style];
  if (!Number.isFinite(height) || height < 120 || height > 215) return { error: 'height' };
  if (!s) return { error: 'style' };
  /* ökölszabály: az állásszélesség a testmagasság nagyjából 29–30%-a, centiméterre kerekítve */
  const width = Math.round(height * 0.295);
  const out = { width, min: width - 2, max: width + 2, front: s.front, back: s.back, style: o.style, why: s.why, wide: null };
  if (Number.isFinite(boot) && boot >= 30 && boot <= 52) out.wide = boot >= 44.5;
  return out;
}
/* Szögek kiírása: a pozitív az orr felé fordul. */
export const fmtAngle = a => (a > 0 ? '+' : a < 0 ? '−' : '') + Math.abs(a) + '°';
