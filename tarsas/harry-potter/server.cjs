/* Node 20+, külső csomag nélkül. Egy folyamat, memóriában tartott szobák. */
'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomBytes, randomInt } = require('node:crypto');
const { deck, validAnswer, points, publicQuestion } = require('./engine.cjs');
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const token = () => randomBytes(24).toString('hex');
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
function createQuizServer({ now = Date.now, maxRooms = 200 } = {}) {
  const rooms = new Map(), rates = new Map();
  const cleanup = () => {
    for (const [code, r] of rooms) if (now() - r.touched > 2 * 3600000 || now() - r.created > 8 * 3600000) rooms.delete(code);
    for (const [ip, rate] of rates) if (now() - rate.start > 60000) rates.delete(ip);
  };
  const interval = setInterval(cleanup, 60000); interval.unref();
  function settle(r) {
    if (r.phase !== 'question') return;
    if (now() < r.deadline && !r.players.every(p => Object.hasOwn(r.answers, p.id))) return;
    r.phase = 'reveal';
    const q = r.deck[r.round];
    r.players.forEach(p => { const a = r.answers[p.id]; p.gain = a === undefined ? 0 : points(q, a); p.score += p.gain; });
  }
  function snapshot(r, p) {
    settle(r);
    const q = r.deck[r.round];
    return {
      code: r.code, phase: r.phase, host: p.id === r.host, me: p.id,
      settings: r.settings, round: r.round, total: r.deck.length,
      serverNow: now(), deadline: r.deadline || null,
      players: r.players.map(x => ({ id: x.id, name: x.name, score: x.score, gain: x.gain || 0, answered: Object.hasOwn(r.answers, x.id) })),
      question: q && r.phase !== 'lobby' ? publicQuestion(q) : null,
      submitted: Object.hasOwn(r.answers, p.id),
      ...(Object.hasOwn(r.answers, p.id) ? { ownAnswer: r.answers[p.id] } : {}),
      ...(r.phase === 'reveal' ? { answer: q.answer, explanation: q.explanation, answers: r.answers } : {})
    };
  }
  const nameOf = value => {
    if (typeof value !== 'string') fail(400, 'Adj meg egy nevet!');
    const name = value.trim().replace(/\s+/g, ' ');
    if (!name || name.length > 24 || /[\u0000-\u001f]/.test(name)) fail(400, 'A név 1–24 karakter lehet.');
    return name;
  };
  const addPlayer = (r, value) => {
    const name = nameOf(value);
    if (r.players.length >= 24) fail(409, 'A szoba megtelt (24 fő).');
    if (r.players.some(p => p.name.toLocaleLowerCase('hu') === name.toLocaleLowerCase('hu'))) fail(409, 'Ez a név már foglalt a szobában.');
    const p = { id: token(), token: token(), name, score: 0 };
    r.players.push(p); return p;
  };
  function send(res, status, value) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
  async function body(req) {
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, 'JSON tartalom szükséges.');
    let text = '', size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 4096) fail(413, 'Túl nagy kérés.'); text += chunk; }
    try { const data = JSON.parse(text); if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error(); return data; }
    catch { fail(400, 'Hibás JSON.'); }
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('Referrer-Policy', 'no-referrer');
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { quiz: 'harry-potter', version: 1 });
      if (url.pathname.startsWith('/api/')) {
        // No CORS. Browsers may only operate rooms on this server's own origin.
        const origin = req.headers.origin;
        if (origin) {
          let parsed; try { parsed = new URL(origin); } catch { fail(403, 'Idegen eredetű kérés.'); }
          if (parsed.host !== req.headers.host) fail(403, 'Idegen eredetű kérés.');
        }
        const ip = req.socket.remoteAddress || 'local';
        let rate = rates.get(ip);
        if (!rate || now() - rate.start > 60000) { rate = { start: now(), reads: 0, writes: 0 }; rates.set(ip, rate); }
        if (req.method === 'GET' ? ++rate.reads > 3000 : ++rate.writes > 300) fail(429, 'Túl sok kérés. Egy perc múlva próbáld újra.');
        if (url.pathname === '/api/rooms' && req.method === 'POST') {
          const data = await body(req); cleanup();
          if (rooms.size >= maxRooms) fail(503, 'A szerver megtelt. Próbáld később!');
          let selected; try { selected = deck(data.settings); } catch (e) { fail(400, e.message); }
          let code; do { code = String(randomInt(100000, 1000000)); } while (rooms.has(code));
          const r = { code, created: now(), touched: now(), phase: 'lobby', round: -1, deck: selected, settings: { films: [...new Set(data.settings.films)], mode: data.settings.mode, count: data.settings.count, seconds: data.settings.seconds }, players: [], answers: {} };
          const p = addPlayer(r, data.name); r.host = p.id; rooms.set(code, r);
          return send(res, 201, { token: p.token, state: snapshot(r, p) });
        }
        const match = /^\/api\/rooms\/([0-9]{6})(?:\/(join|start|answer|next))?$/.exec(url.pathname);
        if (!match) fail(404, 'Ismeretlen végpont.');
        const [, code, action] = match;
        cleanup(); const r = rooms.get(code);
        if (!r) fail(404, 'Nincs ilyen szoba, vagy már lejárt.');
        if (action === 'join' && req.method === 'POST') {
          if (r.phase !== 'lobby') fail(409, 'A játék már elindult. Várj új szobára!');
          const data = await body(req), p = addPlayer(r, data.name); r.touched = now();
          return send(res, 201, { token: p.token, state: snapshot(r, p) });
        }
        const auth = /^Bearer ([a-f0-9]{48})$/.exec(req.headers.authorization || '');
        const p = auth && r.players.find(p => p.token === auth[1]);
        if (!p) fail(401, 'Lépj be újra a szobába!');
        r.touched = now(); settle(r);
        if (!action && req.method === 'GET') return send(res, 200, snapshot(r, p));
        if (req.method !== 'POST') fail(405, 'Ez a művelet POST kérést vár.');
        const data = await body(req);
        if (action === 'answer') {
          if (r.phase !== 'question' || data.round !== r.round) fail(409, 'Ez a kérdés már lezárult.');
          if (Object.hasOwn(r.answers, p.id)) fail(409, 'A válaszodat már rögzítettük.');
          if (!validAnswer(r.deck[r.round], data.answer)) fail(400, 'Érvénytelen válasz.');
          r.answers[p.id] = data.answer;
        } else {
          if (p.id !== r.host) fail(403, 'Ezt csak a játékmester teheti meg.');
          if (action === 'start') {
            if (r.phase !== 'lobby' || r.players.length < 2) fail(409, 'Legalább két játékos kell az induláshoz.');
          } else if (action === 'next') {
            if (r.phase !== 'reveal' || data.round !== r.round) fail(409, 'Előbb záruljon le a jelenlegi kérdés!');
          } else fail(404, 'Ismeretlen művelet.');
          r.round++;
          if (r.round >= r.deck.length) { r.phase = 'end'; r.round = r.deck.length - 1; }
          else { r.phase = 'question'; r.answers = {}; r.players.forEach(p => { p.gain = 0; }); r.deadline = now() + r.settings.seconds * 1000; }
        }
        return send(res, 200, snapshot(r, p));
      }
      if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'Nem támogatott kérés.');
      // Explicit allowlist: never expose server source, tests, or local secrets.
      const assets = new Set(['index.html', 'app.js', 'style.css', 'questions.js']);
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      if (!assets.has(file) && !/^images\/(owl|diary|map|goblet|quill|potion|locket|hallows)\.svg$/.test(file)) fail(404, 'Az oldal nem található.');
      const data = await fs.readFile(path.join(__dirname, file));
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] + '; charset=utf-8', 'Cache-Control': 'no-cache' }); res.end(req.method === 'HEAD' ? undefined : data);
    } catch (e) { send(res, e.status || 500, { error: e.status ? e.message : 'Szerverhiba. Próbáld újra!' }); }
  });
  server.on('close', () => clearInterval(interval));
  return server;
}
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createQuizServer().listen(port, '0.0.0.0', () => console.log('Harry Potter-kvíz: http://localhost:' + port));
}
module.exports = { createQuizServer };
