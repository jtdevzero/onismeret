import hu from './hu.json';

type Dict = Record<string, string>;
const dict: Dict = hu;

/** Fordítás {param} helyettesítéssel. Hiányzó kulcsnál magát a kulcsot adja vissza. */
export function t(keyName: string, params?: Record<string, string | number>): string {
  const raw = dict[keyName] ?? keyName;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

const ft = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 });

export function money(n: number): string {
  return `${ft.format(Math.round(n))} Ft`;
}

export function signedMoney(n: number): string {
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${ft.format(Math.abs(Math.round(n)))} Ft`;
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
