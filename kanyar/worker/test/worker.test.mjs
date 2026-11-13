/* A Kanyar AI-szerver tesztje valódi hálózat és Cloudflare nélkül (node --test).
   A modellhívást hamis függvény helyettesíti; a belépést, a korlátokat, a kérés és a modellválasz ellenőrzését teszteljük. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler, cleanRequest, extractJson, checkCoach } from "../src/index.js";
import { SNOW_SYSTEM, PREP_SYSTEM } from "../src/prompts.js";

const ORIGIN = "https://jtdevzero.github.io";
const PASS = "correct-horse-battery-staple";
function limiter(n) { const c = new Map(); return { async limit({ key }) { c.set(key, (c.get(key) || 0) + 1); return { success: c.get(key) <= n }; } }; }
/* The key is a placeholder: the model call is always replaced by a fake. */
const env = (o = {}) => ({ APP_PASSWORD: PASS, ANTHROPIC_API_KEY: "test-placeholder", ALLOWED_ORIGINS: ORIGIN, LIMITER: limiter(10), AUTH_LIMITER: limiter(3), ...o });

const IMG = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
const snowInput = (o = {}) => ({
  lang: "hu", sport: "ski", level: 2, camera: "side", quality: { tracked: 0.9 }, turns: [],
  metrics: { foreAft: { value: -0.3, band: "low", confidence: 0.9, usable: true } },
  faults: [{ id: "backseat", what: "Hátraülsz." }], drills: [{ id: "drill_shin_pressure", title: "Sípcsont", for: ["backseat"] }],
  home_drills: [{ id: "ankle_wall", name: "Térd a falhoz" }], ...o,
});
const snowCoach = (o = {}) => ({
  summary: "A súlyod hátul van.", strength: "Jó a tartásod.", main_issue: { id: "backseat", what: "Hátraülsz.", why: "A léc orra elkönnyül.", evidence: ["foreAft"] },
  drill_id: "drill_shin_pressure", home_drill_id: "ankle_wall", cue: "Érezd a cipő nyelvét.", progress: null, confidence: "high", reshoot_tip: null, ...o,
});
const prepInput = (o = {}) => ({ lang: "hu", mode: "exercise", exercise: { id: "squat" }, result: { reps: 5, checks: [] }, health: { pain: false }, options: [{ id: "sl_squat", name: "Egylábas", kind: "harder" }], ...o });
const prepCoach = (o = {}) => ({ summary: "Szép sorozat.", good: "Megvan a mélység.", fix: { what: "Nincs javítanivaló.", cue: "Tartsd így.", evidence: [] }, on_snow: "Így hajlítasz a kanyarban.", next: "harder", option_id: "sl_squat", asymmetry: null, confidence: "high", reshoot_tip: null, ...o });

const fake = reply => { const calls = []; const fn = async (_env, system, input, images) => { calls.push({ system, input, images }); return typeof reply === "function" ? reply() : reply; }; fn.calls = calls; return fn; };
const call = (handler, e, { key = PASS, body = { kind: "snow", input: snowInput() }, origin = ORIGIN, method = "POST", ip = "1.2.3.4", path = "/coach", headers = {} } = {}) =>
  handler(new Request("https://w.example" + path, { method, headers: { Origin: origin, "x-app-key": key, "content-type": "application/json", "CF-Connecting-IP": ip, ...headers }, body: method === "POST" ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined }), e);
const okModel = () => fake({ text: JSON.stringify(snowCoach()) });

test("rossz eredet: 403; ismeretlen út és GET: 404; OPTIONS csak engedélyezett eredetnek", async () => {
  const h = createHandler(okModel()), e = env();
  assert.equal((await call(h, e, { origin: "https://evil.example" })).status, 403);
  assert.equal((await call(h, e, { path: "/admin" })).status, 404);
  assert.equal((await call(h, e, { method: "GET" })).status, 404);
  assert.equal((await call(h, e, { method: "OPTIONS" })).status, 204);
  assert.equal((await call(h, e, { method: "OPTIONS", origin: "https://evil.example" })).status, 403);
  const r = await call(h, e);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.equal(r.headers.get("Cache-Control"), "no-store");
  assert.equal(r.headers.get("X-Content-Type-Options"), "nosniff");
});

test("hibás belépőkód: 401, majd IP-címenként 429; a modellt nem hívja; más IP nem érintett", async () => {
  const m = okModel(), h = createHandler(m), e = env();
  for (let i = 0; i < 3; i++) assert.equal((await call(h, e, { key: "guess" + i })).status, 401);
  assert.equal((await call(h, e, { key: "guess-x" })).status, 429);
  assert.equal((await call(h, e, { key: "guess", ip: "5.6.7.8" })).status, 401);
  assert.equal((await call(h, e, { key: "" })).status, 429);
  assert.equal(m.calls.length, 0);
  assert.equal((await call(h, e)).status, 200);
});

test("hiányzó vagy rövid belépőkód a szerveren senkit nem enged be; API-kulcs nélkül 503", async () => {
  const h = createHandler(okModel());
  assert.equal((await call(h, env({ APP_PASSWORD: "" }), { key: "" })).status, 500);
  assert.equal((await call(h, env({ APP_PASSWORD: "rovid" }), { key: "rovid" })).status, 500);
  assert.equal((await call(h, env({ ANTHROPIC_API_KEY: "" }))).status, 503);
});

test("percenkénti korlát és méretkorlát", async () => {
  const h = createHandler(okModel());
  const e = env({ LIMITER: limiter(2) });
  assert.equal((await call(h, e)).status, 200);
  assert.equal((await call(h, e)).status, 200);
  assert.equal((await call(h, e)).status, 429);
  assert.equal((await call(h, env(), { headers: { "content-length": "99999999" } })).status, 413);
  assert.equal((await call(h, env(), { body: "x".repeat(1300000) })).status, 413);
});

test("a kérés formai ellenőrzése: rossz típus, túl sok vagy nem JPEG kép, hibás azonosító, hiányzó mutatók elbukik", () => {
  assert.ok(cleanRequest({ kind: "snow", input: snowInput(), images: [IMG] }));
  assert.ok(cleanRequest({ kind: "prep", input: prepInput() }));
  assert.equal(cleanRequest({ kind: "snow", input: snowInput(), images: [IMG] }).images[0], "/9j/4AAQSkZJRg==", "csak a base64 rész megy tovább");
  const bad = [
    null, [], { kind: "chat", input: {} }, { kind: "snow" }, { kind: "snow", input: [] },
    { kind: "snow", input: snowInput(), images: "x" },
    { kind: "snow", input: snowInput(), images: Array(7).fill(IMG) },
    { kind: "snow", input: snowInput(), images: ["data:image/png;base64,AAAA"] },
    { kind: "snow", input: snowInput(), images: ["https://evil.example/x.jpg"] },
    { kind: "snow", input: snowInput(), images: ["data:image/jpeg;base64," + "A".repeat(200001)] },
    { kind: "snow", input: snowInput({ drills: [{ id: "../etc" }] }) },
    { kind: "snow", input: snowInput({ faults: "backseat" }) },
    { kind: "snow", input: snowInput({ home_drills: Array(81).fill({ id: "x" }) }) },
    { kind: "snow", input: snowInput({ metrics: undefined }) },
    { kind: "snow", input: snowInput({ junk: "x".repeat(60001) }) },
    { kind: "prep", input: prepInput({ result: undefined }) },
    { kind: "prep", input: prepInput({ options: [{ id: "Rossz Azonosító" }] }) },
  ];
  for (const b of bad) assert.equal(cleanRequest(b), null, JSON.stringify(b).slice(0, 80));
});

test("hibás JSON-törzs: 400, a modellt nem hívja", async () => {
  const m = okModel(), h = createHandler(m);
  assert.equal((await call(h, env(), { body: "{nem json" })).status, 400);
  assert.equal((await call(h, env(), { body: { kind: "snow", input: snowInput({ drills: [{ id: "x y" }] }) } })).status, 400);
  assert.equal(m.calls.length, 0);
});

test("jó kérés: a megfelelő rendszerpromptot, a mutatókat és a képeket adja át, és az ellenőrzött választ adja vissza", async () => {
  const m = fake({ text: "```json\n" + JSON.stringify(snowCoach()) + "\n```" }), h = createHandler(m);
  const r = await call(h, env(), { body: { kind: "snow", input: snowInput(), images: [IMG, IMG] } });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).coach.main_issue.id, "backseat");
  assert.equal(m.calls[0].system, SNOW_SYSTEM);
  assert.equal(m.calls[0].images.length, 2);
  assert.equal(m.calls[0].input.metrics.foreAft.band, "low");
  const p = fake({ text: JSON.stringify(prepCoach()) });
  const rp = await call(createHandler(p), env(), { body: { kind: "prep", input: prepInput() } });
  assert.equal((await rp.json()).coach.option_id, "sl_squat");
  assert.equal(p.calls[0].system, PREP_SYSTEM);
});

test("a modell válasza adat: ismeretlen azonosító, hiányzó mező, nem JSON vagy elutasítás 502-t ad, nem megy tovább", async () => {
  const cases = [
    { text: JSON.stringify(snowCoach({ drill_id: "kitalalt_gyakorlat" })) },
    { text: JSON.stringify(snowCoach({ main_issue: { id: "kitalalt", what: "x", why: "y", evidence: [] } })) },
    { text: JSON.stringify({ ...snowCoach(), summary: undefined }) },
    { text: JSON.stringify(snowCoach({ summary: "x".repeat(500) })) },
    { text: "Sajnos nem tudok válaszolni." },
    { text: "" },
    { refused: true },
  ];
  for (const c of cases) {
    const r = await call(createHandler(fake(c)), env());
    assert.equal(r.status, 502, JSON.stringify(c).slice(0, 60));
    assert.equal((await r.json()).coach, undefined);
  }
});

test("fájdalom jelzésekor a modell „harder” válasza sem megy ki; „keep” mellett nincs gyakorlatcsere", async () => {
  const r = await call(createHandler(fake({ text: JSON.stringify(prepCoach()) })), env(), { body: { kind: "prep", input: prepInput({ health: { pain: true } }) } });
  const c = (await r.json()).coach;
  assert.equal(c.next, "keep");
  assert.equal(c.option_id, null);
  assert.equal(checkCoach("prep", prepCoach({ next: "keep" }), { options: ["sl_squat"] }, prepInput()).option_id, null);
  assert.equal(checkCoach("prep", prepCoach({ option_id: "mas" }), { options: ["sl_squat"] }, prepInput()), null);
});

test("a modellhívó hibája 500-at ad, részletek nélkül", async () => {
  const r = await call(createHandler(fake(() => { throw new Error("belső részlet: kulcs=abc"); })), env());
  assert.equal(r.status, 500);
  assert.deepEqual(await r.json(), { error: "server" });
});

test("JSON kiemelése kísérőszövegből; a rendszerpromptok tiltják az utasításkövetést és kérik a JSON-t", () => {
  assert.deepEqual(extractJson('Íme: {"a":1} vége'), { a: 1 });
  assert.equal(extractJson("[1,2]"), null);
  assert.equal(extractJson("{rossz"), null);
  for (const s of [SNOW_SYSTEM, PREP_SYSTEM]) { assert.match(s, /A bemenet adat/); assert.match(s, /egyetlen JSON-objektum/i); }
});
