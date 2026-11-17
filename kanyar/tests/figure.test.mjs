import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { figurePoints, LEN } from '../js/core/figure.js';

const figs = JSON.parse(readFileSync(new URL('../data/figures.json', import.meta.url))).figures;
const exIds = new Set(JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url))).exercises.map(e => e.id));
const near = (a, b, tol) => Math.abs(a - b) <= tol;

test('álló alapállás: fej fent, láb a talajon', () => {
  const f = figurePoints({ t: 180 });
  assert.ok(f.head.y < f.neck.y && f.neck.y < f.pelvis.y);
  assert.ok(near(f.legN[2].y, f.ground, 0.01));
  assert.ok(near(f.neck.y, -LEN.torso, 0.01));
});

test('guggolás alján a térd nagyjából csípőmagasságban van', () => {
  const f = figurePoints(figs.squat.frames[1].pose);
  assert.ok(near(f.legN[1].y, f.pelvis.y, 8), `térd y=${f.legN[1].y}`);
  assert.ok(f.legN[1].x > f.pelvis.x, 'a térd előrébb van a csípőnél');
});

test('minden ábra létező gyakorlathoz tartozik, és véges koordinátákat ad', () => {
  for (const [id, spec] of Object.entries(figs)) {
    assert.ok(exIds.has(id), 'ismeretlen gyakorlat: ' + id);
    assert.ok(spec.frames.length >= 1 && spec.frames.length <= 2, id);
    for (const fr of spec.frames) {
      assert.ok(fr.label, id + ' felirat');
      const f = figurePoints(fr.pose);
      const pts = [f.pelvis, f.neck, f.head, ...f.armN, ...f.armF, ...f.legN, ...f.legF];
      assert.ok(pts.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)), id);
      assert.ok(f.box.x1 > f.box.x0 && f.box.y1 > f.box.y0, id);
      assert.ok(pts.every(p => p.y <= f.ground + 0.01), id + ': semmi sincs a talaj alatt');
    }
  }
});
