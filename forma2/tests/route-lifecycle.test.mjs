import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRouteLifecycle } from '../js/core/route-lifecycle.js';

test('gyors visszalépés: csak az előző képernyő erőforrásai szabadulnak fel', () => {
  const calls = [], routes = createRouteLifecycle();
  const first = routes.begin();
  first.onCleanup(() => calls.push('first'));
  const second = routes.begin();
  second.onCleanup(() => calls.push('second'));
  assert.deepEqual(calls, ['first']);
  assert.equal(first.isActive(), false);
  assert.equal(second.isActive(), true);
  const third = routes.begin();
  assert.deepEqual(calls, ['first', 'second']);
  assert.equal(third.isActive(), true);
});

test('későn betöltődő régi nézet takarítója azonnal fut, nem szennyezi az újat', () => {
  const calls = [], routes = createRouteLifecycle();
  const first = routes.begin();
  const second = routes.begin();
  first.onCleanup(() => calls.push('late'));
  second.onCleanup(() => calls.push('current'));
  assert.deepEqual(calls, ['late']);
  routes.begin();
  assert.deepEqual(calls, ['late', 'current']);
});

test('hiba egy takarítóban nem akadályozza a többi felszabadítását', () => {
  const errors = [], calls = [], routes = createRouteLifecycle(e => errors.push(e.message));
  const scope = routes.begin();
  scope.onCleanup(() => calls.push('ok'));
  scope.onCleanup(() => { throw new Error('cleanup'); });
  routes.begin();
  assert.deepEqual(calls, ['ok']);
  assert.deepEqual(errors, ['cleanup']);
  scope.dispose();
  assert.deepEqual(calls, ['ok']);
});
