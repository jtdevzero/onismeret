/* Pózbecslés a készüléken (MediaPipe Pose Landmarker), a Kanyar pose.js-éből (élő kamera, eszközpróba).
   A kamera képe nem hagyja el a telefont: a modell és a WebAssembly-futtató a saját szerverünkről (vendor/) töltődik. */
import { pickNearest, hipOf, heightOf } from '../core/track.js';
const VENDOR = new URL('../../vendor/mediapipe/', import.meta.url);
const SAMPLE_GAP = 1 / 15; /* legfeljebb 15 minta másodpercenként */

let landmarker = null, loading = null, clock = 0;

export function loadPose() {
  if (landmarker) return Promise.resolve(landmarker);
  if (loading) return loading;
  loading = (async () => {
    const { FilesetResolver, PoseLandmarker } = await import(new URL('vision_bundle.mjs', VENDOR).href);
    const fileset = await FilesetResolver.forVisionTasks(new URL('wasm', VENDOR).href);
    const make = delegate => PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: new URL('pose_landmarker_lite.task', VENDOR).href, delegate },
      runningMode: 'VIDEO', numPoses: 3,
    });
    /* GPU-val gyorsabb; ha a készülék nem támogatja, processzoron fut */
    try { landmarker = await make('GPU'); } catch { landmarker = await make('CPU'); }
    return landmarker;
  })();
  loading.catch(() => { loading = null; });
  return loading;
}

const once = (el, ev) => new Promise((resolve, reject) => {
  const ok = () => { off(); resolve(); }, bad = () => { off(); reject(new Error('A videó nem olvasható.')); };
  const off = () => { el.removeEventListener(ev, ok); el.removeEventListener('error', bad); };
  el.addEventListener(ev, ok); el.addEventListener('error', bad);
});

function detect(lm, video, t) {
  clock = Math.max(clock + 1, Math.round(performance.now()));
  const res = lm.detectForVideo(video, clock);
  const poses = ((res && res.landmarks) || []).map(p => p.map(q => [q.x, q.y, q.z, q.visibility ?? 1]));
  /* lm: a legnagyobb alak (egyszerű esetekre); a több ember közüli választást a track.js végzi */
  const main = poses.length ? poses.reduce((a, b) => (heightOf(b) > heightOf(a) ? b : a)) : null;
  return { t, lm: main, poses };
}

/* Élő kamera: a kép nem kerül rögzítésre és nem megy sehova, csak a testpontokat mérjük képkockánként.
   → { el (előnézet), aspect, read(): a következő mért képkocka vagy null, close() } */
export async function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error('no_camera'), { code: 'no_camera' });
  const lm = await loadPose();
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } }); }
  catch (e) { throw Object.assign(new Error('camera_denied'), { code: 'camera_denied' }); }
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.autoplay = true; video.srcObject = stream;
  video.className = 'live-video';
  await video.play().catch(() => {});
  if (video.readyState < 2) await once(video, 'loadeddata');
  const start = performance.now();
  let last = -1, open = true, prevHip = null;
  const nextFrame = () => new Promise(resolve => ('requestVideoFrameCallback' in video ? video.requestVideoFrameCallback(() => resolve()) : requestAnimationFrame(() => resolve())));
  return {
    el: video,
    aspect: video.videoWidth / video.videoHeight || 4 / 3,
    async read() {
      while (open) {
        await nextFrame();
        const t = (performance.now() - start) / 1000;
        if (t - last < SAMPLE_GAP * 0.9) continue;
        last = t;
        /* élőben a legutóbb követett alakhoz legközelebbit vesszük, hogy ne ugorjon át másra */
        const f = detect(lm, video, t);
        const pick = pickNearest(f.poses, prevHip);
        if (pick) prevHip = hipOf(pick);
        return { t: f.t, lm: pick };
      }
      return null;
    },
    close() { open = false; stream.getTracks().forEach(tr => tr.stop()); video.srcObject = null; },
  };
}

/* Eszközpróba: betölti a pózbecslőt, és megméri, mennyi idő egy képkocka ezen a készüléken. */
export async function benchmark() {
  const t0 = performance.now();
  const lm = await loadPose();
  const load = performance.now() - t0;
  const c = document.createElement('canvas'); c.width = 480; c.height = 640;
  const g = c.getContext('2d'); g.fillStyle = '#8899aa'; g.fillRect(0, 0, c.width, c.height);
  const run = () => { clock = Math.max(clock + 1, Math.round(performance.now())); lm.detectForVideo(c, clock); };
  run();
  const t1 = performance.now();
  for (let i = 0; i < 5; i++) run();
  return { loadMs: Math.round(load), frameMs: Math.round((performance.now() - t1) / 5) };
}

