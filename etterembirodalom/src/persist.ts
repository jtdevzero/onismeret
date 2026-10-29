// Helyi mentés IndexedDB-be (idb-keyval). A betöltés mindig a sémaellenőrzött parseSave-en megy át.

import { get, set } from 'idb-keyval';
import { parseSave, serializeSave, type ParseResult } from './sim/save';
import type { GameState } from './sim/types';

const KEY = 'etterembirodalom:autosave';

export async function saveGame(state: GameState): Promise<void> {
  await set(KEY, serializeSave(state));
}

export async function loadGame(): Promise<ParseResult | null> {
  try {
    const text = await get<string>(KEY);
    if (!text) return null;
    return parseSave(text);
  } catch {
    return null;
  }
}
