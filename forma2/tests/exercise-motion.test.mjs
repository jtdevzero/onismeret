import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOTIONS, motionFor, motionPose, motionCycle } from '../js/core/exercise-motion.js';

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

test('mozgásciklus négy oktatási fázissal, visszatérő pozícióval',()=>{
  for(const id of Object.keys(MOTIONS)){
    const phases=MOTIONS[id].phases;
    assert.equal(phases.length,4);
    const start=motionCycle(id,0),out=motionCycle(id,.25),turn=motionCycle(id,.5),back=motionCycle(id,.75),end=motionCycle(id,1);
    assert.equal(start.poseProgress,0);
    assert.equal(turn.poseProgress,1);
    assert.equal(end.poseProgress,0);
    assert.equal(out.phaseLabel,phases[1]);
    assert.equal(turn.phaseLabel,phases[2]);
    assert.equal(back.phaseLabel,phases[3]);
    assert.deepEqual(motionPose(id,start.poseProgress),motionPose(id,end.poseProgress));
    assert.equal(motionCycle(id,-12).cycle,0);
    assert.equal(motionCycle(id,99).cycle,1);
    assert.equal(motionCycle(id,NaN),null);
  }
  assert.equal(motionCycle('unknown',.3),null);
});
