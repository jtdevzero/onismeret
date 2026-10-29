// Saját szerzésű, harmonikás musette-keringő Web Audióval. Nem használ hangfájlt.
// A zene csak felhasználói kattintásra indul (a böngészők szabálya szerint).

type Note = [string, number];

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

function freq(name: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) return 440;
  const midi = 12 * (Number(m[2]) + 1) + NOTE_INDEX[m[1]!]!;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Dallam ütemenként (3/4), negyedekben mért hosszakkal.
const MELODY: Note[][] = [
  [['A4', 1], ['C5', 1], ['E5', 1]],
  [['D5', 0.5], ['C5', 0.5], ['B4', 1], ['A4', 1]],
  [['F5', 1], ['E5', 1], ['D5', 1]],
  [['A4', 2], ['D5', 1]],
  [['G#4', 1], ['B4', 1], ['D5', 1]],
  [['E5', 0.5], ['D5', 0.5], ['C5', 1], ['B4', 1]],
  [['C5', 1], ['B4', 1], ['A4', 1]],
  [['E4', 3]],
  [['A4', 1], ['C5', 1], ['F5', 1]],
  [['E5', 0.5], ['F5', 0.5], ['E5', 1], ['C5', 1]],
  [['D5', 1], ['F5', 1], ['A5', 1]],
  [['G5', 0.5], ['F5', 0.5], ['E5', 1], ['D5', 1]],
  [['B4', 1], ['D5', 1], ['G#5', 1]],
  [['A5', 0.5], ['G#5', 0.5], ['F5', 1], ['D5', 1]],
  [['C5', 1], ['E5', 0.5], ['D5', 0.5], ['B4', 1]],
  [['A4', 3]],
];

// Kíséret: basszus az első ütésre, akkord a másodikra és harmadikra.
const CHORDS: [string, string[]][] = [
  ['A2', ['A3', 'C4', 'E4']],
  ['E2', ['A3', 'C4', 'E4']],
  ['D2', ['D4', 'F4', 'A4']],
  ['A2', ['D4', 'F4', 'A4']],
  ['E2', ['G#3', 'B3', 'D4']],
  ['B2', ['G#3', 'B3', 'D4']],
  ['A2', ['A3', 'C4', 'E4']],
  ['E2', ['A3', 'C4', 'E4']],
  ['F2', ['A3', 'C4', 'F4']],
  ['C3', ['A3', 'C4', 'F4']],
  ['D2', ['D4', 'F4', 'A4']],
  ['A2', ['D4', 'F4', 'A4']],
  ['E2', ['G#3', 'B3', 'D4']],
  ['B2', ['G#3', 'B3', 'D4']],
  ['A2', ['A3', 'C4', 'E4']],
  ['E2', ['A3', 'C4', 'E4']],
];

const BEAT = 60 / 150;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let nextBarTime = 0;
let bar = 0;
let on = false;

/** Harmonikahang: két kissé elhangolt fűrészfog + négyszög, aluláteresztő szűrővel. */
function voice(f: number, start: number, dur: number, gain: number, bright = 2400): void {
  if (!ctx || !master) return;
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = bright;
  lp.Q.value = 0.7;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.03);
  g.gain.setValueAtTime(gain, start + Math.max(0.04, dur - 0.06));
  g.gain.linearRampToValueAtTime(0, start + dur);
  g.connect(lp);
  lp.connect(master);
  // Musette-hangolás: a két nyelv kicsit eltér, ettől „lebeg” a hang.
  for (const [type, detune, level] of [
    ['sawtooth', -7, 0.5],
    ['sawtooth', 7, 0.5],
    ['square', 0, 0.25],
  ] as const) {
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    og.gain.value = level;
    o.connect(og);
    og.connect(g);
    o.start(start);
    o.stop(start + dur + 0.02);
  }
}

function scheduleBar(time: number, i: number): void {
  const mel = MELODY[i % MELODY.length]!;
  let t = time;
  for (const [n, len] of mel) {
    voice(freq(n), t, len * BEAT * 0.95, 0.16);
    t += len * BEAT;
  }
  const [bass, chord] = CHORDS[i % CHORDS.length]!;
  voice(freq(bass), time, BEAT * 0.8, 0.22, 900);
  for (const beat of [1, 2]) for (const n of chord) voice(freq(n), time + beat * BEAT, BEAT * 0.45, 0.05, 1500);
}

function pump(): void {
  if (!ctx) return;
  while (nextBarTime < ctx.currentTime + 1.2) {
    scheduleBar(nextBarTime, bar);
    nextBarTime += 3 * BEAT;
    bar++;
  }
}

export function isMusicOn(): boolean {
  return on;
}

export function toggleMusic(): boolean {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (on) {
      on = false;
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      master!.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      return false;
    }
    on = true;
    void ctx.resume();
    master!.gain.setTargetAtTime(0.35, ctx.currentTime, 0.1);
    nextBarTime = ctx.currentTime + 0.1;
    pump();
    timer = window.setInterval(pump, 300);
    return true;
  } catch {
    on = false;
    return false;
  }
}
