/* Parliamo AI-szerver.
   A webapp ide küldi a beszélgetést, a szerver hozzáteszi a titkos Claude API-kulcsot, és csak a válasz szövegét adja vissza.
   Védelem: engedélyezett eredet (ALLOWED_ORIGINS), belépőkód (APP_PASSWORD), percenkénti korlát, méretkorlát. */
import Anthropic from "@anthropic-ai/sdk";

const MAX_MESSAGES = 40;
const MAX_CHARS = 40000;

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

export default {
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
    if (req.method !== "POST" || new URL(req.url).pathname !== "/chat") return json({ error: "not_found" }, 404, cors);
    if (!originOk) return json({ error: "origin" }, 403, cors);
    if (!env.APP_PASSWORD || !safeEqual(req.headers.get("x-app-key") || "", env.APP_PASSWORD)) return json({ error: "unauthorized" }, 401, cors);
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
