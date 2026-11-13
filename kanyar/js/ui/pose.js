/* Pózbecslés a készüléken (MediaPipe Pose Landmarker). A videó nem hagyja el a telefont:
   a modell és a WebAssembly-futtató a saját szerverünkről (vendor/) töltődik, külső hívás nincs. */
const VENDOR = new URL('../../vendor/mediapipe/', import.meta.url);
export const MIN_SECONDS = 3, MAX_SECONDS = 60;
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
      runningMode: 'VIDEO', numPoses: 1,
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

/* Videóelem egy fájlból. A hívó felel a release() meghívásáért. */
export async function openVideo(blob) {
  const url = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto'; video.src = url;
  try {
    if (video.readyState < 1) await once(video, 'loadedmetadata');
    /* egyes böngészők végtelen hosszt adnak, amíg a végére nem tekerünk */
    if (!Number.isFinite(video.duration)) { video.currentTime = 1e7; await once(video, 'seeked'); video.currentTime = 0; await once(video, 'seeked'); }
    if (video.readyState < 2) await once(video, 'loadeddata');
  } catch (e) { URL.revokeObjectURL(url); throw e; }
  return { video, release: () => { video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); } };
}

function detect(lm, video, t) {
  clock = Math.max(clock + 1, Math.round(performance.now()));
  const res = lm.detectForVideo(video, clock);
  const p = res && res.landmarks && res.landmarks[0];
  return { t, lm: p ? p.map(q => [q.x, q.y, q.z, q.visibility ?? 1]) : null };
}

/* A teljes videó feldolgozása. onProgress(0…1). → { frames, aspect, duration, seconds (feldolgozási idő) } */
export async function analyzeVideo(blob, onProgress = () => {}) {
  const started = performance.now();
  const lm = await loadPose();
  const { video, release } = await openVideo(blob);
  try {
    const duration = video.duration;
    if (!(duration >= MIN_SECONDS)) throw Object.assign(new Error('too_short'), { code: 'too_short' });
    if (duration > MAX_SECONDS) throw Object.assign(new Error('too_long'), { code: 'too_long' });
    const aspect = video.videoWidth / video.videoHeight || 16 / 9;
    /* Előbb megmérjük, mennyi idő egy képkocka a készüléken. Gyors gépen lejátszás közben mintavételezünk
       (a feldolgozás nagyjából a videó hosszáig tart); lassún képkockánként tekerünk, hogy egy minta se maradjon ki. */
    video.currentTime = 0;
    await once(video, 'seeked').catch(() => {});
    detect(lm, video, 0);
    const t0 = performance.now();
    detect(lm, video, 0);
    const cost = performance.now() - t0;
    const canPlay = 'requestVideoFrameCallback' in HTMLVideoElement.prototype && cost < 90;
    const frames = canPlay
      ? await byPlayback(lm, video, duration, onProgress, cost < 45 ? 1 : 0.5)
      : await bySeeking(lm, video, duration, onProgress);
    onProgress(1);
    return { frames, aspect, duration, seconds: (performance.now() - started) / 1000 };
  } finally { release(); }
}

/* Lejátszás közben mintavételezünk; közepesen gyors készüléken félsebességgel, hogy elég sűrű legyen a minta. */
function byPlayback(lm, video, duration, onProgress, rate) {
  return new Promise((resolve, reject) => {
    const frames = [];
    let last = -1, done = false, stall = null;
    const finish = () => { if (done) return; done = true; clearTimeout(stall); video.pause(); resolve(frames); };
    const watchdog = () => { clearTimeout(stall); stall = setTimeout(finish, 4000); };
    const step = (_now, meta) => {
      if (done) return;
      watchdog();
      const t = meta.mediaTime;
      if (t - last >= SAMPLE_GAP * 0.9) {
        try { frames.push(detect(lm, video, t)); } catch (e) { done = true; clearTimeout(stall); video.pause(); reject(e); return; }
        last = t;
        onProgress(Math.min(0.99, t / duration));
      }
      if (video.ended || t >= duration - 0.05) finish(); else video.requestVideoFrameCallback(step);
    };
    video.addEventListener('ended', finish, { once: true });
    video.requestVideoFrameCallback(step);
    watchdog();
    video.playbackRate = rate;
    video.play().catch(reject);
  });
}

async function bySeeking(lm, video, duration, onProgress) {
  const frames = [];
  for (let t = 0; t < duration; t += SAMPLE_GAP) {
    video.currentTime = t;
    await once(video, 'seeked');
    frames.push(detect(lm, video, t));
    onProgress(Math.min(0.99, t / duration));
  }
  return frames;
}

/* Lekicsinyített állóképek a megadott időpontokból (az AI-edzőnek és bélyegképnek). → JPEG data URL-ek */
export async function captureFrames(blob, times, maxSide = 512, quality = 0.6) {
  const { video, release } = await openVideo(blob);
  try {
    const k = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * k)); canvas.height = Math.max(1, Math.round(video.videoHeight * k));
    const ctx = canvas.getContext('2d'), out = [];
    for (const t of times) {
      video.currentTime = Math.min(Math.max(0, t), Math.max(0, video.duration - 0.05));
      await once(video, 'seeked');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      out.push(canvas.toDataURL('image/jpeg', quality));
    }
    return out;
  } finally { release(); }
}
