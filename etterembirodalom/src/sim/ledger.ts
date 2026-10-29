// Könyvelési segédek. Minden összeg eurócentben (egész szám), így az összesítés pontos.

import type { LedgerKind, RestaurantState } from './types';

export const OPERATING: LedgerKind[] = ['revenue', 'ingredients', 'wages', 'rent', 'maintenance', 'marketing'];
export const CAPITAL: LedgerKind[] = ['purchase', 'refund', 'training', 'opening', 'style', 'reward'];

export function sumLedger(r: RestaurantState, kinds: LedgerKind[]): number {
  return r.ledger.filter((e) => kinds.includes(e.kind)).reduce((a, e) => a + e.amount, 0);
}
