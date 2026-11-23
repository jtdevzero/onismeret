import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextReps, nextWeight, parseRepsInput, parseWeightInput, adjustRestSeconds } from '../js/core/workout-quick-input.js';

test('pihenőidő +/-15 mp: határolás, sérült adat és egész másodpercek', () => {
  assert.equal(adjustRestSeconds(60, -15), 45);
  assert.equal(adjustRestSeconds(10, -15), 1);
  assert.equal(adjustRestSeconds(590, 15), 600);
  assert.equal(adjustRestSeconds(60.5, 15), null);
  assert.equal(adjustRestSeconds(60, Infinity), null);
});

test('gyors ismétlésbevitel: kézi bevitel, lépés, alsó/felső korlát', () => {
  assert.equal(parseRepsInput('12'), 12);
  assert.equal(parseRepsInput('0'), 0);
  assert.equal(parseRepsInput('-1'), null);
  assert.equal(parseRepsInput('1.5'), null);
  assert.equal(parseRepsInput('1000'), null);
  assert.equal(parseRepsInput('20x'), null);
  assert.equal(nextReps(12, -1), 11);
  assert.equal(nextReps(0, -1), 0);
  assert.equal(nextReps(999, 1), 999);
  assert.equal(nextReps(NaN, 1), null);
});

test('kg bevitel: magyar tizedesvessző, pontos léptetés, tartomány', () => {
  assert.equal(parseWeightInput('12,5'), 12.5);
  assert.equal(parseWeightInput('12.75'), 12.75);
  assert.equal(parseWeightInput('0'), 0);
  assert.equal(parseWeightInput('301'), null);
  assert.equal(parseWeightInput('-2'), null);
  assert.equal(parseWeightInput('1e9'), null);
  assert.equal(parseWeightInput('1.234'), null);
  assert.equal(nextWeight(12.5, 0.5), 13);
  assert.equal(nextWeight(0, -0.5), 0);
  assert.equal(nextWeight(300, 0.5), 300);
});
