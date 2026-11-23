import { test } from 'node:test';
import assert from 'node:assert/strict';
import { swipeStep } from '../js/core/workout-navigation.js';

test('edzéslapozás: egyértelmű vízszintes mozdulat előre és vissza', () => {
  assert.equal(swipeStep(-90, 12), 'next');
  assert.equal(swipeStep(95, -15), 'back');
  assert.equal(swipeStep(50, 0), null);
  assert.equal(swipeStep(90, 90), null, 'függőleges görgetés nem lapozhat');
});

test('vezérlőn, értékelés közben vagy hibás gesztusnál nincs véletlen lapozás', () => {
  assert.equal(swipeStep(-100, 0, { interactive: true }), null);
  assert.equal(swipeStep(-100, 0, { rating: true }), null);
  assert.equal(swipeStep(NaN, 0), null);
});
