/* Parliamo AI-szerver.
   A webapp ide küldi a beszélgetést, a szerver hozzáteszi a titkos Claude API-kulcsot, és csak a válasz szövegét adja vissza.
   Védelem: engedélyezett eredet (ALLOWED_ORIGINS), belépőkód (APP_PASSWORD), percenkénti korlát, méretkorlát. */
import Anthropic from "@anthropic-ai/sdk";
import { publicKey, subscribe, unsubscribe, sendPush, runReminders } from "./push.js";

const MAX_MESSAGES = 40;
const MAX_CHARS = 40000;
const PUSH_SUBJECT = "https://jtdevzero.github.io/onismeret/parliamo/";

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, "content-type": "application/json" } });
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
  let body = {};
  try { body = await req.json(); } catch { /* üres törzs is jó a kulcskéréshez */ }
  if (path === "/push/key") return json({ key: await publicKey(env.PUSH) }, 200, cors);
  if (path === "/push/subscribe") return (await subscribe(env.PUSH, body)) ? json({ ok: true }, 200, cors) : json({ error: "bad_request" }, 400, cors);
  if (path === "/push/unsubscribe") { await unsubscribe(env.PUSH, body.endpoint); return json({ ok: true }, 200, cors); }
  if (!body.subscription || typeof body.subscription.endpoint !== "string") return json({ error: "bad_request" }, 400, cors);
  const status = await sendPush(env.PUSH, body.subscription, { title: "Parliamo", body: "Így fog kinézni a napi emlékeztető.", url: "./#ma" }, PUSH_SUBJECT).catch(() => 0);
  return json({ ok: status >= 200 && status < 300, status }, 200, cors);
}

/* Haladás-szinkron: egyetlen tanuló állapota a KV-ban ("sync:main").
   A rev mezővel a szerver visszautasítja az elavult írást (409), ilyenkor a kliens összefésüli és újraküldi. */
const MAX_STATE = 1500000;
async function handleSync(path, req, env, cors) {
  if (!env.PUSH) return json({ error: "push_unavailable" }, 501, cors);
  const rec = await env.PUSH.get("sync:main", "json");
  if (path === "/sync/get") return json(rec || { rev: 0, state: null }, 200, cors);
  const raw = await req.text();
  if (raw.length > MAX_STATE) return json({ error: "too_big" }, 413, cors);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400, cors); }
  if (!body || typeof body.state !== "object" || body.state === null || Array.isArray(body.state) || typeof body.state.xp !== "number") return json({ error: "bad_request" }, 400, cors);
  const rev = rec ? rec.rev : 0;
  if ((parseInt(body.base, 10) || 0) !== rev) return json({ error: "conflict", rev }, 409, cors);
  await env.PUSH.put("sync:main", JSON.stringify({ rev: rev + 1, at: Date.now(), state: body.state }));
  return json({ rev: rev + 1 }, 200, cors);
}

export default {
  async scheduled(event, env, ctx) {
    if (env.PUSH) ctx.waitUntil(runReminders(env.PUSH, PUSH_SUBJECT));
  },

  async fetch(req, env) {
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
    if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    const path = new URL(req.url).pathname;
    if (req.method !== "POST" || !["/chat", "/push/key", "/push/subscribe", "/push/unsubscribe", "/push/test", "/sync/get", "/sync/put"].includes(path)) return json({ error: "not_found" }, 404, cors);
    if (!originOk) return json({ error: "origin" }, 403, cors);
    if (!env.APP_PASSWORD || !safeEqual(req.headers.get("x-app-key") || "", env.APP_PASSWORD)) return json({ error: "unauthorized" }, 401, cors);
    if (path.startsWith("/push/")) return handlePush(path, req, env, cors);
    if (path.startsWith("/sync/")) return handleSync(path, req, env, cors);
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: "parliamo" });
      if (!success) return json({ error: "rate_limited" }, 429, cors);
    }

    let body;
    try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400, cors); }
    const messages = cleanMessages(body && body.messages);
    if (!messages) return json({ error: "bad_request" }, 400, cors);

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
