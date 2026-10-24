/* Web Push a napi emlékeztetőhöz, külső csomag nélkül (WebCrypto).
   - VAPID-kulcspár: első használatkor a szerver maga generálja és a KV-ban tárolja.
   - Titkosítás: RFC 8291 (aes128gcm), így a böngésző a szöveget is megkapja.
   - Feliratkozás: KV "sub:<hash>" kulcs alatt, a kért helyi órával, időzónával és az utolsó gyakorlás napjával. */

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const concat = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };

async function vapidKeys(kv) {
  const saved = await kv.get("vapid", "json");
  if (saved) return saved;
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const keys = { privateJwk: await crypto.subtle.exportKey("jwk", pair.privateKey), publicKey: b64u(await crypto.subtle.exportKey("raw", pair.publicKey)) };
  await kv.put("vapid", JSON.stringify(keys));
  return keys;
}

export async function publicKey(kv) {
  return (await vapidKeys(kv)).publicKey;
}

async function vapidHeader(kv, endpoint, subject) {
  const keys = await vapidKeys(kv);
  const key = await crypto.subtle.importKey("jwk", keys.privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${head}.${body}`));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${keys.publicKey}`;
}

async function hkdf(salt, ikm, info, bytes) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, bytes * 8));
}

/* RFC 8291: a böngésző kulcsával (p256dh, auth) titkosított üzenettest. */
async function encrypt(sub, text) {
  const uaPublic = unb64u(sub.keys.p256dh), auth = unb64u(sub.keys.auth);
  const local = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(auth, secret, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, concat(enc.encode(text), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

export async function sendPush(kv, sub, message, subject) {
  const body = await encrypt(sub, JSON.stringify(message));
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidHeader(kv, sub.endpoint, subject),
      TTL: "3600",
      Urgency: "normal",
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
    },
    body,
  });
  return res.status;
}

async function subKey(endpoint) {
  return "sub:" + b64u(await crypto.subtle.digest("SHA-256", enc.encode(endpoint))).slice(0, 32);
}

function validSub(s) {
  return s && typeof s.endpoint === "string" && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1000 &&
    s.keys && typeof s.keys.p256dh === "string" && typeof s.keys.auth === "string";
}

export async function subscribe(kv, body) {
  if (!validSub(body.subscription)) return false;
  const hour = Math.min(23, Math.max(0, parseInt(body.hour, 10) || 18));
  const tz = Math.max(-840, Math.min(840, parseInt(body.tz, 10) || 0));
  const lastDay = /^\d{4}-\d{2}-\d{2}$/.test(body.lastDay || "") ? body.lastDay : "";
  await kv.put(await subKey(body.subscription.endpoint), JSON.stringify({ sub: body.subscription, hour, tz, lastDay }));
  return true;
}

export async function unsubscribe(kv, endpoint) {
  if (typeof endpoint === "string") await kv.delete(await subKey(endpoint));
}

const localParts = (tz, now = Date.now()) => {
  const d = new Date(now + tz * 60000);
  return { hour: d.getUTCHours(), day: d.toISOString().slice(0, 10) };
};

const REMINDERS = [
  "Pár perc, és megvan a mai cél. A napi köröd vár.",
  "Ma még nem gyakoroltál. Egy rövid napi kör, és megmarad a sorozatod.",
  "Az ismétlések akkor működnek a legjobban, ha nem maradnak ki. Gyere vissza 10 percre!",
];

/* Óránként fut: akinek most van a beállított órája, és ma még nem gyakorolt, kap egy emlékeztetőt. */
export async function runReminders(kv, subject) {
  let cursor;
  do {
    const page = await kv.list({ prefix: "sub:", cursor });
    for (const k of page.keys) {
      const rec = await kv.get(k.name, "json");
      if (!rec) continue;
      const { hour, day } = localParts(rec.tz);
      if (hour !== rec.hour || rec.lastDay === day || rec.sentDay === day) continue;
      const status = await sendPush(kv, rec.sub, { title: "Parliamo", body: REMINDERS[new Date().getUTCDate() % REMINDERS.length], url: "./#ma" }, subject).catch(() => 0);
      if (status === 404 || status === 410) await kv.delete(k.name);
      else await kv.put(k.name, JSON.stringify({ ...rec, sentDay: day }));
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}
