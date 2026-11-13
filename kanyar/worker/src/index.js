/* Kanyar AI-edző szerver.
   A webapp ide küldi a mért mutatókat és néhány lekicsinyített képkockát; a szerver hozzáteszi a titkos Claude
   API-kulcsot, és csak az ellenőrzött formájú edzői választ adja vissza. Videó soha nem érkezik ide.
   Védelem: engedélyezett eredet (ALLOWED_ORIGINS), belépőkód (APP_PASSWORD), percenkénti korlát a hívásokra és a
   hibás belépésekre (IP-címenként), méretkorlát, a kérés és a modellválasz formai ellenőrzése.
   A szerver semmit nem tárol és nem naplóz a kérés tartalmából. */
import Anthropic from "@anthropic-ai/sdk";
import { validSnowCoach, validPrepCoach } from "../../js/core/coach.js";
import { SNOW_SYSTEM, PREP_SYSTEM } from "./prompts.js";

const MAX_IMAGES = 6;
const MAX_IMAGE_CHARS = 200000;  /* egy lekicsinyített JPEG base64-ben */
const MAX_INPUT_CHARS = 60000;   /* a mutatók JSON-ja */
const MAX_BODY = MAX_IMAGES * MAX_IMAGE_CHARS + MAX_INPUT_CHARS + 2000;
const MAX_IDS = 80;
const MIN_PASSWORD = 12;
const ID = /^[a-z0-9_]{1,40}$/;
const IMAGE = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/;

/* Minden válasz: JSON, nem szippantható más típusnak, és semmilyen köztes tár nem tárolja. */
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

const idList = (arr, key = "id") => (Array.isArray(arr) && arr.length <= MAX_IDS && arr.every(o => o && typeof o === "object" && typeof o[key] === "string" && ID.test(o[key])) ? arr.map(o => o[key]) : null);

/* A kérés formai ellenőrzése. → { kind, input, images, ids } vagy null */
export function cleanRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { kind, input } = body;
  if (kind !== "snow" && kind !== "prep") return null;
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (JSON.stringify(input).length > MAX_INPUT_CHARS) return null;
  const images = body.images === undefined ? [] : body.images;
  if (!Array.isArray(images) || images.length > MAX_IMAGES) return null;
  const data = [];
  for (const img of images) {
    if (typeof img !== "string" || img.length > MAX_IMAGE_CHARS) return null;
    const m = IMAGE.exec(img);
    if (!m) return null;
    data.push(m[1]);
  }
  let ids;
  if (kind === "snow") {
    const faults = idList(input.faults), drills = idList(input.drills), homeDrills = idList(input.home_drills);
    if (!faults || !drills || !homeDrills) return null;
    if (!input.metrics || typeof input.metrics !== "object") return null;
    ids = { faults, drills, homeDrills };
  } else {
    const options = idList(input.options || []);
    if (!options || !input.result || typeof input.result !== "object") return null;
    ids = { options };
  }
  return { kind, input, images: data, ids };
}

/* A modell válaszából kiemeli a JSON-objektumot (kódblokk-jelölés vagy kísérőszöveg esetén is). */
export function extractJson(text) {
  const a = String(text || "").indexOf("{"), b = String(text || "").lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { const o = JSON.parse(text.slice(a, b + 1)); return o && typeof o === "object" && !Array.isArray(o) ? o : null; } catch { return null; }
}

/* A modell válasza adat: csak akkor adjuk tovább, ha a formája rendben van, és csak a felkínált azonosítókat használja. */
export function checkCoach(kind, coach, ids, input) {
  if (kind === "snow") return validSnowCoach(coach, ids) ? coach : null;
  if (!validPrepCoach(coach, ids.options)) return null;
  /* fájdalom jelzésekor a modell válaszától függetlenül sem megy ki nehezítés */
  if (input.health && input.health.pain && coach.next === "harder") return { ...coach, next: "keep", option_id: null };
  return coach.next === "keep" ? { ...coach, option_id: null } : coach;
}

async function callClaude(env, system, input, images) {
  const model = env.MODEL || "claude-sonnet-5-5";
  /* Szerveroldali tartalék modell, ha a fő modell biztonsági okból elutasítana egy kérést (csak az ezt támogató modelleknél). */
  const fallback = /^claude-(opus-5|fable-5|sonnet-5-5)/.test(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {};
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const content = [
    { type: "text", text: JSON.stringify(input) },
    ...images.map(data => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } })),
  ];
  const msg = await client.beta.messages.create({
    model, max_tokens: 4000, output_config: { effort: "low" }, system,
    messages: [{ role: "user", content }], ...fallback,
  });
  if (msg.stop_reason === "refusal") return { refused: true };
  return { text: msg.content.filter(b => b.type === "text").map(b => b.text).join("") };
}

/* A kezelő a modellhívót paraméterként kapja, hogy a tesztek hálózat nélkül futhassanak. */
export function createHandler(callModel = callClaude) {
  return async function fetch(req, env) {
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
    if (req.method !== "POST" || new URL(req.url).pathname !== "/coach") return json({ error: "not_found" }, 404, cors);
    if (!originOk) return json({ error: "origin" }, 403, cors);
    /* hiányzó vagy túl rövid belépőkóddal a szerver senkit nem enged be */
    if (!env.APP_PASSWORD || env.APP_PASSWORD.length < MIN_PASSWORD) return json({ error: "server_config" }, 500, cors);
    if (!safeEqual(req.headers.get("x-app-key") || "", env.APP_PASSWORD)) {
      if (env.AUTH_LIMITER) {
        const { success } = await env.AUTH_LIMITER.limit({ key: "fail:" + (req.headers.get("CF-Connecting-IP") || "unknown") });
        if (!success) return json({ error: "rate_limited" }, 429, cors);
      }
      return json({ error: "unauthorized" }, 401, cors);
    }
    if (parseInt(req.headers.get("content-length") || "0", 10) > MAX_BODY) return json({ error: "too_big" }, 413, cors);
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: "kanyar" });
      if (!success) return json({ error: "rate_limited" }, 429, cors);
    }
    if (!env.ANTHROPIC_API_KEY) return json({ error: "no_ai_key" }, 503, cors);
    let body;
    try { const raw = await req.text(); if (raw.length > MAX_BODY) return json({ error: "too_big" }, 413, cors); body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400, cors); }
    const clean = cleanRequest(body);
    if (!clean) return json({ error: "bad_request" }, 400, cors);

    try {
      const out = await callModel(env, clean.kind === "snow" ? SNOW_SYSTEM : PREP_SYSTEM, clean.input, clean.images);
      if (out.refused) return json({ error: "refused" }, 502, cors);
      const coach = checkCoach(clean.kind, extractJson(out.text), clean.ids, clean.input);
      if (!coach) return json({ error: "bad_model_output" }, 502, cors);
      return json({ coach }, 200, cors);
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return json({ error: "rate_limited" }, 429, cors);
      if (err instanceof Anthropic.AuthenticationError) return json({ error: "server_key" }, 500, cors);
      if (err instanceof Anthropic.APIError) return json({ error: "upstream", status: err.status }, 502, cors);
      return json({ error: "server" }, 500, cors);
    }
  };
}

export default { fetch: createHandler() };
