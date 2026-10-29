// Alkalmazásállapot: a játékállapot, az időgyorsítás és a kiválasztott eszköz.
// A szimuláció a store-on kívül, a játékhurokban fut; a felület 4 Hz-en frissül (version).

import { create } from 'zustand';
import type { ItemKind } from './data/content';
import { t } from './i18n';
import { saveGame } from './persist';
import { storyPending } from './sim/campaign';
import { applyCommand, createGame, tick, type Command, type CommandResult } from './sim/sim';
import type { GameState } from './sim/types';

export type Tool = ItemKind | 'remove' | null;
export type Speed = 0 | 1 | 2 | 4;

interface Toast {
  id: number;
  text: string;
  kind: 'error' | 'info';
}

interface AppState {
  game: GameState | null;
  version: number;
  speed: Speed;
  lastSpeed: Exclude<Speed, 0>;
  tool: Tool;
  toast: Toast | null;
  /** Filmszerű bevezető fut (a kamera a város fölött repül, a történet utána jön). */
  cinematic: 'intro' | null;
  endCinematic: () => void;
  start: (game: GameState) => void;
  newGame: (mode: 'campaign' | 'free') => void;
  dispatch: (c: Command) => CommandResult;
  setSpeed: (s: Speed) => void;
  togglePause: () => void;
  setTool: (t: Tool) => void;
  notify: (text: string, kind?: Toast['kind']) => void;
  bump: () => void;
  save: () => Promise<void>;
}

let toastId = 0;

export const useApp = create<AppState>((set, get) => ({
  game: null,
  version: 0,
  speed: 0,
  lastSpeed: 1,
  tool: null,
  toast: null,
  cinematic: null,
  endCinematic: () => set({ cinematic: null, version: get().version + 1 }),
  start: (game) => set({ game, speed: 0, tool: null, cinematic: null, version: get().version + 1 }),
  newGame: (mode) => {
    get().start(createGame((Date.now() & 0x7fffffff) | 1, mode));
    if (mode === 'campaign') set({ cinematic: 'intro' });
  },
  dispatch: (c) => {
    const g = get().game;
    if (!g) return { ok: false, error: 'notFound' };
    const r = applyCommand(g, c);
    if (!r.ok) get().notify(t(`error.${r.error}`), 'error');
    set({ version: get().version + 1 });
    return r;
  },
  setSpeed: (speed) => set(speed === 0 ? { speed } : { speed, lastSpeed: speed }),
  togglePause: () => {
    const { speed, lastSpeed } = get();
    set({ speed: speed === 0 ? lastSpeed : 0 });
  },
  setTool: (tool) => set({ tool }),
  notify: (text, kind = 'info') => {
    const id = ++toastId;
    set({ toast: { id, text, kind } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 3200);
  },
  bump: () => set({ version: get().version + 1 }),
  save: async () => {
    const g = get().game;
    if (g) await saveGame(g);
  },
}));

// --- Játékhurok ---------------------------------------------------------------

const TICK_MS = 100;
const MAX_TICKS_PER_FRAME = 16;
const UI_INTERVAL_MS = 250;
const AUTOSAVE_MS = 60_000;

export function startLoop(): () => void {
  let acc = 0;
  let last = performance.now();
  let uiAcc = 0;
  let saveAcc = 0;
  let raf = 0;
  let lastPhase: GameState['phase'] | null = null;

  const frame = (now: number) => {
    const dt = Math.min(250, now - last);
    last = now;
    const st = useApp.getState();
    const g = st.game;
    if (g) {
      if (g.phase === 'open' && st.speed > 0 && !storyPending(g)) {
        acc += dt * st.speed;
        let n = 0;
        while (acc >= TICK_MS && n < MAX_TICKS_PER_FRAME && g.phase === 'open') {
          tick(g);
          acc -= TICK_MS;
          n++;
        }
        if (n === MAX_TICKS_PER_FRAME) acc = 0;
      } else {
        acc = 0;
      }
      if (lastPhase === 'open' && g.phase === 'dayEnd') {
        void st.save();
        st.bump();
      }
      lastPhase = g.phase;
      uiAcc += dt;
      if (uiAcc >= UI_INTERVAL_MS) {
        uiAcc = 0;
        st.bump();
      }
      saveAcc += dt;
      if (saveAcc >= AUTOSAVE_MS) {
        saveAcc = 0;
        void st.save();
      }
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
