/* Parliamo AI-szerver.
   A webapp ide küldi a beszélgetést, a szerver hozzáteszi a titkos Claude API-kulcsot, és csak a válasz szövegét adja vissza.
   Védelem: engedélyezett eredet (ALLOWED_ORIGINS), belépőkód (APP_PASSWORD), percenkénti korlát a hívásokra és a hibás
   belépőkódokra (IP-címenként), méretkorlát, push csak ismert push-szolgáltatások címére. */
import Anthropic from "@anthropic-ai/sdk";
import { publicKey, subscribe, unsubscribe, sendPush, runReminders, validSub } from "./push.js";

const MAX_MESSAGES = 40;
const MAX_CHARS = 40000;
const MAX_BODY = 200000; /* bájt; a 40 000 karakteres üzenetkorlát JSON-ban is bőven elfér benne */
const PUSH_SUBJECT = "https://jtdevzero.github.io/onismeret/parliamo/";

/* Minden válasz: JSON, nem szippantható más típusnak, és semmilyen köztes tár (proxy, böngésző) nem tárolja. */
const SECURITY_HEADERS = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, ...SECURITY_HEADERS, "content-type": "application/json" } });
}

/* Időben állandó összehasonlítás, hogy a kód ne legyen kitalálható a válaszidőből. */
function safeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

function cleanMessages(list) {
  if (!Array.isArray(list) || !list.length || list.length > MAX_MESSAGES) return null;
  let total = 0;
  const out = [];
  for (const m of list) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    total += m.content.length;
    out.push({ role: m.role, content: m.content });
  }
  if (total > MAX_CHARS || out[0].role !== "user" || out[out.length - 1].role !== "user") return null;
  return out;
}

async function handlePush(path, req, env, cors) {
  if (!env.PUSH) return json({ error: "push_unavailable" }, 501, cors);
  /* A Content-Length fejléc hiányozhat (darabolt küldés), ezért a valódi méretet is ellenőrizzük. */
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "too_big" }, 413, cors);
  let body = {};
  try { body = JSON.parse(raw) || {}; } catch { /* üres törzs is jó a kulcskéréshez */ }
  if (path === "/push/key") return json({ key: await publicKey(env.PUSH) }, 200, cors);
  if (path === "/push/subscribe") return (await subscribe(env.PUSH, body)) ? json({ ok: true }, 200, cors) : json({ error: "bad_request" }, 400, cors);
  if (path === "/push/unsubscribe") { await unsubscribe(env.PUSH, body.endpoint); return json({ ok: true }, 200, cors); }
  if (!validSub(body.subscription)) return json({ error: "bad_request" }, 400, cors);
  const status = await sendPush(env.PUSH, body.subscription, { title: "Parliamo", body: "Így fog kinézni a napi emlékeztető.", url: "./#ma" }, PUSH_SUBJECT).catch(() => 0);
  return json({ ok: status >= 200 && status < 300, status }, 200, cors);
}

/* AI-használat havonta ("usage:YYYY-MM"): kérések, bemeneti és kimeneti tokenek, becsült költség. */
const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);
const price = env => ({ in: parseFloat(env.PRICE_IN_PER_MTOK) || 4, out: parseFloat(env.PRICE_OUT_PER_MTOK) || 20 });
const costOf = (u, p) => (u.in * p.in + u.out * p.out) / 1e6;
async function readUsage(env, month = monthKey()) {
  return (await env.PUSH.get("usage:" + month, "json")) || { calls: 0, in: 0, out: 0 };
}
async function addUsage(env, usage) {
  if (!env.PUSH || !usage) return;
  const u = await readUsage(env);
  u.calls += 1;
  u.in += (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
  u.out += usage.output_tokens || 0;
  await env.PUSH.put("usage:" + monthKey(), JSON.stringify(u), { expirationTtl: 400 * 86400 });
}
async function handleUsage(env, cors) {
  if (!env.PUSH) return json({ error: "push_unavailable" }, 501, cors);
  const p = price(env), months = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - i);
    const u = await readUsage(env, monthKey(d));
    months.push({ month: monthKey(d), ...u, cost: costOf(u, p) });
  }
  return json({ ...months[0], months, budget: parseFloat(env.MONTHLY_BUDGET_USD) || 0, priceIn: p.in, priceOut: p.out }, 200, cors);
}

/* Heti automatikus mentés a szinkronizált állapotról; az utolsó 4 marad meg ("backup:<időbélyeg>"). */
const WEEK = 7 * 86400000;
async function makeBackup(env, state) {
  const at = Date.now();
  await env.PUSH.put("backup:" + at, JSON.stringify({ at, state }));
  const list = (await env.PUSH.list({ prefix: "backup:" })).keys.map(k => k.name).sort();
  for (const k of list.slice(0, Math.max(0, list.length - 4))) await env.PUSH.delete(k);
  return at;
}

/* Haladás-szinkron: egyetlen tanuló állapota a KV-ban ("sync:main").
   A rev mezővel a szerver visszautasítja az elavult írást (409), ilyenkor a kliens összefésüli és újraküldi. */
const MAX_STATE = 1500000;
async function handleSync(path, req, env, cors) {
  if (!env.PUSH) return json({ error: "push_unavailable" }, 501, cors);
  const rec = await env.PUSH.get("sync:main", "json");
  if (path === "/sync/get") return json(rec || { rev: 0, state: null }, 200, cors);
  if (path === "/sync/backups") {
    const keys = (await env.PUSH.list({ prefix: "backup:" })).keys.map(k => k.name).sort().reverse();
    const list = [];
    for (const key of keys) { const b = await env.PUSH.get(key, "json"); if (b) list.push({ key, at: b.at, xp: b.state && b.state.xp || 0 }); }
    return json({ list }, 200, cors);
  }
  if (path === "/sync/backup-now") {
    if (!rec || !rec.state) return json({ error: "no_state" }, 404, cors);
    rec.backupAt = await makeBackup(env, rec.state);
    await env.PUSH.put("sync:main", JSON.stringify(rec));
    return json({ ok: true }, 200, cors);
  }
  const raw = await req.text();
  if (raw.length > MAX_STATE) return json({ error: "too_big" }, 413, cors);
  if (path === "/sync/backup-get") {
    let key = "";
    try { key = JSON.parse(raw).key; } catch { /* lent kezeljük */ }
    if (typeof key !== "string" || !/^backup:\d+$/.test(key)) return json({ error: "bad_request" }, 400, cors);
    const b = await env.PUSH.get(key, "json");
    return b ? json({ state: b.state }, 200, cors) : json({ error: "not_found" }, 404, cors);
  }
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400, cors); }
  if (!body || typeof body.state !== "object" || body.state === null || Array.isArray(body.state) || typeof body.state.xp !== "number") return json({ error: "bad_request" }, 400, cors);
  const rev = rec ? rec.rev : 0;
  if ((parseInt(body.base, 10) || 0) !== rev) return json({ error: "conflict", rev }, 409, cors);
  let backupAt = rec && rec.backupAt || 0;
  if (Date.now() - backupAt > WEEK) backupAt = await makeBackup(env, body.state);
  await env.PUSH.put("sync:main", JSON.stringify({ rev: rev + 1, at: Date.now(), backupAt, state: body.state }));
  return json({ rev: rev + 1 }, 200, cors);
}

export default {
  async scheduled(event, env, ctx) {
    if (env.PUSH) ctx.waitUntil(env.PUSH.get("sync:main", "json").then(rec => runReminders(env.PUSH, PUSH_SUBJECT, rec && rec.state)));
  },

  async fetch(req, env, ctx) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const originOk = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": originOk ? origin : allowed[0] || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-app-key",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
    if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers: { ...cors, ...SECURITY_HEADERS } });
    const path = new URL(req.url).pathname;
    if (req.method !== "POST" || !["/chat", "/push/key", "/push/subscribe", "/push/unsubscribe", "/push/test", "/sync/get", "/sync/put", "/sync/backups", "/sync/backup-get", "/sync/backup-now", "/usage"].includes(path)) return json({ error: "not_found" }, 404, cors);
    if (!originOk) return json({ error: "origin" }, 403, cors);
    if (!env.APP_PASSWORD) return json({ error: "server_config" }, 500, cors);
    if (!safeEqual(req.headers.get("x-app-key") || "", env.APP_PASSWORD)) {
      /* A hibás belépőkódokat IP-címenként korlátozzuk, hogy a kód ne legyen végigpróbálgatható. */
      if (env.AUTH_LIMITER) {
        const { success } = await env.AUTH_LIMITER.limit({ key: "fail:" + (req.headers.get("CF-Connecting-IP") || "unknown") });
        if (!success) return json({ error: "rate_limited" }, 429, cors);
      }
      return json({ error: "unauthorized" }, 401, cors);
    }
    const len = parseInt(req.headers.get("content-length") || "0", 10);
    if (len > (path === "/sync/put" ? MAX_STATE : MAX_BODY)) return json({ error: "too_big" }, 413, cors);
    if (path === "/push/test" && env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: "push-test" });
      if (!success) return json({ error: "rate_limited" }, 429, cors);
    }
    if (path.startsWith("/push/")) return handlePush(path, req, env, cors);
    if (path.startsWith("/sync/")) return handleSync(path, req, env, cors);
    if (path === "/usage") return handleUsage(env, cors);
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: "parliamo" });
      if (!success) return json({ error: "rate_limited" }, 429, cors);
    }

    /* Claude-kulcs nélkül a szerver csak szinkronra és emlékeztetőre szolgál; az AI-t ilyenkor az artifact adja. */
    if (!env.ANTHROPIC_API_KEY) return json({ error: "no_ai_key" }, 503, cors);
    let body;
    try { const raw = await req.text(); if (raw.length > MAX_BODY) return json({ error: "too_big" }, 413, cors); body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400, cors); }
    const messages = cleanMessages(body && body.messages);
    if (!messages) return json({ error: "bad_request" }, 400, cors);

    const budget = parseFloat(env.MONTHLY_BUDGET_USD) || 0;
    if (budget && env.PUSH && costOf(await readUsage(env), price(env)) >= budget) return json({ error: "budget" }, 429, cors);

    const quick = body.tier === "quick";
    const model = env.MODEL || "claude-opus-5-5";
    /* Szerveroldali tartalék modell, ha a fő modell biztonsági okból elutasítana egy kérést (csak az ezt támogató modelleknél). */
    const fallback = /^claude-(opus-5|fable-5|sonnet-5-5)/.test(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {};
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const msg = await client.beta.messages.create({
        model,
        max_tokens: quick ? 8000 : 16000,
        output_config: { effort: quick ? "low" : "medium" },
        messages,
        ...fallback,
      });
      if (ctx && env.PUSH) ctx.waitUntil(addUsage(env, msg.usage).catch(() => {}));
      if (msg.stop_reason === "refusal") return json({ refused: true }, 200, cors);
      const text = msg.content.filter(b => b.type === "text").map(b => b.text).join("");
      return json({ text, truncated: msg.stop_reason === "max_tokens" }, 200, cors);
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return json({ error: "rate_limited" }, 429, cors);
      if (err instanceof Anthropic.AuthenticationError) return json({ error: "server_key" }, 500, cors);
      if (err instanceof Anthropic.APIError) return json({ error: "upstream", status: err.status }, 502, cors);
      return json({ error: "server" }, 500, cors);
    }
  },
};
