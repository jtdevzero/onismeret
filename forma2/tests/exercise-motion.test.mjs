import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOTIONS, motionFor, motionPose } from '../js/core/exercise-motion.js';

test('három gyakorlat fázisai teljesek és végesek',()=>{
  assert.deepEqual(Object.keys(MOTIONS).sort(),['glute_bridge','push_full','squat']);
  for(const id of Object.keys(MOTIONS)){
    const poses=MOTIONS[id].poses;
    assert.equal(poses.length,2);
    assert.deepEqual(Object.keys(poses[0]),Object.keys(poses[1]));
    for(const t of [0,.5,1])for(const p of Object.values(motionPose(id,t)))assert.ok(p.length===3&&p.every(Number.isFinite));
    assert.deepEqual(motionPose(id,0),poses[0]);
    assert.deepEqual(motionPose(id,1),poses[1]);
  }
  assert.equal(motionFor('unknown'),null);
  assert.equal(motionPose('squat',NaN),null);
});
