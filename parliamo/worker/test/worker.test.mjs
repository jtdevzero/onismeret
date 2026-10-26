/* A worker biztonsági útvonalainak tesztje valódi hálózat és Cloudflare nélkül (node --test).
   Az AI-hívást nem teszteljük; a belépés, a korlátok, a méretkorlát, a push-címek és a szinkron viselkedését igen. */
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { pushEndpointOk, validSub } from "../src/push.js";

const ORIGIN = "https://jtdevzero.github.io";
function kv() {
  const m = new Map();
  return {
    async get(k, t) { const v = m.get(k); return v === undefined ? null : t === "json" ? JSON.parse(v) : v; },
    async put(k, v) { m.set(k, v); }, async delete(k) { m.delete(k); },
    async list({ prefix }) { return { keys: [...m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; },
  };
}
function limiter(n) { const c = new Map(); return { async limit({ key }) { c.set(key, (c.get(key) || 0) + 1); return { success: c.get(key) <= n }; } }; }
/* The key is a placeholder: every /chat test below stops at validation before any AI call. */
const env = (o = {}) => ({ APP_PASSWORD: "correct-horse-battery-staple", ANTHROPIC_API_KEY: "test-placeholder", ALLOWED_ORIGINS: ORIGIN, PUSH: kv(), LIMITER: limiter(20), AUTH_LIMITER: limiter(3), ...o });
const call = (e, path, { key = "correct-horse-battery-staple", body = {}, origin = ORIGIN, method = "POST", ip = "1.2.3.4", headers = {} } = {}) =>
  worker.fetch(new Request("https://w.example" + path, { method, headers: { Origin: origin, "x-app-key": key, "content-type": "application/json", "CF-Connecting-IP": ip, ...headers }, body: method === "POST" ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined }), e, { waitUntil() {} });

test("rossz eredet: 403, ismeretlen út: 404", async () => {
  const e = env();
  assert.equal((await call(e, "/sync/get", { origin: "https://evil.example" })).status, 403);
  assert.equal((await call(e, "/admin")).status, 404);
  assert.equal((await call(e, "/sync/get", { method: "GET" })).status, 404);
});

test("hibás belépőkód: 401, majd IP-címenként 429; jó kód közben is működik, más IP nem érintett", async () => {
  const e = env();
  for (let i = 0; i < 3; i++) assert.equal((await call(e, "/sync/get", { key: "guess" + i })).status, 401);
  assert.equal((await call(e, "/sync/get", { key: "guess-x" })).status, 429);
  assert.equal((await call(e, "/sync/get")).status, 200);
  assert.equal((await call(e, "/sync/get", { key: "guess", ip: "5.6.7.8" })).status, 401);
});

test("hiányzó szerverbeállítás nem enged be senkit", async () => {
  assert.equal((await call(env({ APP_PASSWORD: "" }), "/sync/get", { key: "" })).status, 500);
});

test("biztonsági fejlécek minden válaszon", async () => {
  const r = await call(env(), "/sync/get");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("access-control-allow-origin"), ORIGIN);
});

test("túl nagy kérés: 413", async () => {
  const big = JSON.stringify({ messages: [{ role: "user", content: "x".repeat(250000) }] });
  assert.equal((await call(env(), "/chat", { body: big })).status, 413);
  /* Content-Length nélkül is: a push- és a szinkronútvonal a valódi törzsméretet nézi. */
  assert.equal((await call(env(), "/push/subscribe", { body: big })).status, 413);
  assert.equal((await call(env(), "/sync/backup-get", { body: JSON.stringify({ key: "backup:1", pad: "x".repeat(3e6) }) })).status, 413);
});

test("hibás üzenetformátum: 400 (AI-hívás nélkül)", async () => {
  assert.equal((await call(env(), "/chat", { body: { messages: [{ role: "system", content: "x" }] } })).status, 400);
  assert.equal((await call(env(), "/chat", { body: "{nem json" })).status, 400);
});

test("push: csak ismert push-szolgáltatás címe fogadható el (SSRF ellen)", async () => {
  assert.ok(pushEndpointOk("https://fcm.googleapis.com/fcm/send/abc"));
  assert.ok(pushEndpointOk("https://updates.push.services.mozilla.com/wpush/v2/abc"));
  assert.ok(pushEndpointOk("https://web.push.apple.com/abc"));
  assert.ok(pushEndpointOk("https://wns2-db5p.notify.windows.com/w/?token=abc"));
  for (const bad of ["http://fcm.googleapis.com/x", "https://169.254.169.254/latest", "https://evil.example/fcm.googleapis.com", "https://fcm.googleapis.com.evil.example/x", "https://user:pw@fcm.googleapis.com/x", "https://fcm.googleapis.com:8443/x", "nem url"])
    assert.equal(pushEndpointOk(bad), false, bad);
  const keys = { p256dh: "BPub", auth: "auth" };
  assert.equal(validSub({ endpoint: "https://evil.example/x", keys }), false);
  const e = env();
  assert.equal((await call(e, "/push/subscribe", { body: { subscription: { endpoint: "https://evil.example/x", keys } } })).status, 400);
  assert.equal((await call(e, "/push/test", { body: { subscription: { endpoint: "https://10.0.0.1/x", keys } } })).status, 400);
  assert.equal((await call(e, "/push/subscribe", { body: { subscription: { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys }, hour: 19 } })).status, 200);
});

test("szinkron: elavult írás 409, jó írás növeli a revíziót, hibás állapot 400", async () => {
  const e = env();
  assert.equal((await call(e, "/sync/put", { body: { base: 0, state: { xp: 5 } } })).status, 200);
  assert.equal((await call(e, "/sync/put", { body: { base: 0, state: { xp: 6 } } })).status, 409);
  assert.equal((await call(e, "/sync/put", { body: { base: 1, state: [] } })).status, 400);
  const r = await (await call(e, "/sync/get")).json();
  assert.equal(r.rev, 1);
  assert.equal((await call(e, "/sync/backup-get", { body: { key: "../sync:main" } })).status, 400);
});

test("Claude-kulcs nélkül: /chat 503 no_ai_key, a szinkron közben működik", async () => {
  const e = env({ ANTHROPIC_API_KEY: "" });
  const r = await call(e, "/chat", { body: { messages: [{ role: "user", content: "szia" }] } });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, "no_ai_key");
  assert.equal((await call(e, "/chat", { key: "rossz" })).status, 401);
  const put = await call(e, "/sync/put", { body: { base: 0, state: { xp: 5 } } });
  assert.equal(put.status, 200);
});
