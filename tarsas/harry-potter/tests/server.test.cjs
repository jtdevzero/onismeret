'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createQuizServer } = require('../server.cjs');
const { questions, films } = require('../questions.js');
const { deck, points } = require('../engine.cjs');
const settings = { films: [1, 2, 3, 4, 5, 6, 7, 8], mode: 'mixed', count: 5, seconds: 20 };
async function harness(t, options) {
  const server = createQuizServer(options); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function call(route, data, token, headers = {}) {
    const response = await fetch(base + '/api/' + route, { method: data === undefined ? 'GET' : 'POST', headers: { ...(data === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...headers }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    return { status: response.status, body: await response.json() };
  }
  return { call, base };
}
test('all eight films have three choice, one picture and one numeric question; filters never repeat', () => {
  assert.equal(films.length, 8); assert.equal(questions.length, 40);
  for (let film = 1; film <= 8; film++) {
    const items = questions.filter(q => q.film === film);
    assert.equal(items.length, 5);
    assert.deepEqual(items.map(q => q.type).sort(), ['choice', 'choice', 'choice', 'number', 'picture']);
    for (const mode of ['mixed', 'choice', 'number', 'picture']) {
      const chosen = deck({ ...settings, films: [film], count: 40, mode });
      assert(chosen.every(q => q.film === film && (mode === 'mixed' || q.type === mode)));
      assert.equal(new Set(chosen.map(q => q.id)).size, chosen.length);
      chosen.filter(q => q.options).forEach(q => assert.equal(q.options[q.answer], questions.find(x => x.id === q.id).options[0]));
    }
  }
  assert.equal(points({ type: 'number', answer: 11 }, 11), 1000);
  assert.equal(points({ type: 'number', answer: 11 }, 12), 500);
});
test('real HTTP multiplayer: auth, hidden answers, host control, duplicate/stale answers and final standings', async t => {
  const { call } = await harness(t);
  const created = await call('rooms', { name: '<img src=x>', settings }); assert.equal(created.status, 201);
  const host = created.body.token, code = created.body.state.code;
  assert.match(code, /^\d{6}$/); assert.equal(created.body.state.question, null);
  const joined = await call('rooms/' + code + '/join', { name: 'Ron' }); assert.equal(joined.status, 201);
  const guest = joined.body.token;
  assert.equal((await call('rooms/' + code + '/join', { name: 'RON' })).status, 409);
  assert.equal((await call('rooms/' + code)).status, 401);
  assert.equal((await call('rooms/' + code + '/start', {}, guest)).status, 403);
  let state = (await call('rooms/' + code + '/start', {}, host)).body;
  assert.equal(state.phase, 'question');
  assert.equal((await call('rooms/' + code + '/join', { name: 'Késő' })).status, 409);
  for (let round = 0; round < state.total; round++) {
    assert.equal(state.round, round);
    assert(!Object.hasOwn(state.question, 'answer')); assert(!Object.hasOwn(state.question, 'explanation'));
    assert(!Object.hasOwn(state, 'answers')); assert(!JSON.stringify(state).includes(host)); assert(!JSON.stringify(state).includes(guest));
    assert.equal((await call('rooms/' + code + '/next', { round }, host)).status, 409);
    assert.equal((await call('rooms/' + code + '/answer', { round, answer: '0' }, guest)).status, 400);
    const q = state.question, canonical = questions.find(x => x.id === q.id);
    const answer = q.type === 'number' ? canonical.answer : q.options.indexOf(canonical.options[canonical.answer]);
    const first = await call('rooms/' + code + '/answer', { round, answer }, host); assert.equal(first.status, 200);
    assert.equal(first.body.phase, 'question'); assert(!Object.hasOwn(first.body, 'answer'));
    assert.equal((await call('rooms/' + code + '/answer', { round, answer }, host)).status, 409);
    state = (await call('rooms/' + code + '/answer', { round, answer }, guest)).body;
    assert.equal(state.phase, 'reveal'); assert.equal(state.answer, answer);
    assert(state.players.every(p => p.score === (round + 1) * 1000));
    assert.equal((await call('rooms/' + code + '/next', { round }, guest)).status, 403);
    state = (await call('rooms/' + code + '/next', { round }, host)).body;
    assert.equal((await call('rooms/' + code + '/next', { round }, host)).status, 409);
  }
  assert.equal(state.phase, 'end'); assert(state.players.every(p => p.score === 5000));
});
test('server deadline, reconnect and expiry do not double-score; no source disclosure or CORS', async t => {
  let time = 1000000;
  const { call, base } = await harness(t, { now: () => time });
  const created = (await call('rooms', { name: 'Harry', settings })).body;
  const { code } = created.state, host = created.token;
  await call('rooms/' + code + '/join', { name: 'Ron' });
  await call('rooms/' + code + '/start', {}, host);
  time += 21000;
  assert.equal((await call('rooms/' + code + '/answer', { round: 0, answer: 0 }, host)).status, 409);
  let state = (await call('rooms/' + code, undefined, host)).body;
  assert.equal(state.phase, 'reveal'); assert(state.players.every(p => p.score === 0));
  state = (await call('rooms/' + code, undefined, host)).body; assert(state.players.every(p => p.score === 0));
  assert.equal((await call('rooms', { name: 'Evil', settings }, null, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await fetch(base + '/server.cjs')).status, 404);
  assert.equal((await fetch(base + '/tests/server.test.cjs')).status, 404);
  const html = await fetch(base + '/'); assert.match(html.headers.get('content-security-policy'), /connect-src 'self'/);
  time += 2 * 3600000 + 1;
  assert.equal((await call('rooms/' + code, undefined, host)).status, 404);
});
test('invalid settings and room limits fail without creating orphan rooms', async t => {
  const { call } = await harness(t, { maxRooms: 1 });
  assert.equal((await call('rooms', { name: 'Harry', settings: { ...settings, films: [] } })).status, 400);
  assert.equal((await call('rooms', { name: 'Harry', settings: { ...settings, seconds: 1 } })).status, 400);
  assert.equal((await call('rooms', { name: '', settings })).status, 400);
  assert.equal((await call('rooms', { name: 'Harry', settings })).status, 201);
  assert.equal((await call('rooms', { name: 'Ron', settings })).status, 503);
});
