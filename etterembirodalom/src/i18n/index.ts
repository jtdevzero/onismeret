import hu from './hu.json';

type Dict = Record<string, string>;
const dict: Dict = hu;

/** Fordítás {param} helyettesítéssel. Hiányzó kulcsnál magát a kulcsot adja vissza. */
export function t(keyName: string, params?: Record<string, string | number>): string {
  const raw = dict[keyName] ?? keyName;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

// A játék eurócentben számol; a kijelzés euróban történik.
const whole = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function euros(abs: number): string {
  const e = abs / 100;
  // Ezer euró fölött vagy kerek összegnél nem írunk centet.
  return abs >= 100000 || abs % 100 === 0 ? whole.format(Math.round(e)) : cents.format(e);
}

export function money(n: number): string {
  return `${n < 0 ? '−' : ''}${euros(Math.abs(Math.round(n)))} €`;
}

export function signedMoney(n: number): string {
  const r = Math.round(n);
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${euros(Math.abs(r))} €`;
}

/** Eurócentből a beviteli mezőbe írható euróérték (pl. 2610 → „26,10”). */
export function centsToInput(n: number): string {
  return n % 100 === 0 ? String(n / 100) : cents.format(n / 100).replace(/\s/g, '');
}

/** Beírt euróérték eurócentre; vesszőt és pontot is elfogad. Érvénytelen bevitelnél NaN. */
export function inputToCents(text: string): number {
  const clean = text.replace(/\s/g, '').replace(',', '.').replace('€', '');
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return NaN;
  return Math.round(Number(clean) * 100);
}

export function num(n: number, digits = 1): string {
  return new Intl.NumberFormat('hu-HU', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

/** Határozott névelő számok előtt: „az 1.”, „a 2.”, „az 5.”, „a 10.”, „az 50.”. */
export function article(n: number): string {
  const d = String(Math.abs(Math.trunc(n)));
  if (d.startsWith('5')) return 'az';
  if (d.startsWith('1') && d.length % 3 === 1) return 'az';
  return 'a';
}
