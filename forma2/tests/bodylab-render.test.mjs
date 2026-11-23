import test from 'node:test';
import assert from 'node:assert/strict';
import { rendererQuality, canUseLocalModel, BODYLAB_MODEL_STATUS, BODYLAB_ASSET_POLICY } from '../js/core/bodylab-render.js';
import { MOTIONS, motionStatus } from '../js/core/exercise-motion.js';

test('mobileszközön visszafogott pixelarány és energiatakarékos profil',()=>{
  assert.equal(rendererQuality({width:390,devicePixelRatio:3}).pixelRatio,1.5);
  assert.equal(rendererQuality({width:390,devicePixelRatio:3,deviceMemory:2}).pixelRatio,1);
  assert.equal(rendererQuality({width:1000,devicePixelRatio:3}).pixelRatio,2);
  assert.equal(rendererQuality({width:390,devicePixelRatio:NaN,reducedMotion:true}).animateCamera,false);
});

test('csak helyi, korlátozott méretű, ellenőrzött útvonalú GLB engedett',()=>{
  const asset={path:'./assets/models/body-v1.glb',bytes:1000,status:'illustrative'};
  assert.equal(canUseLocalModel(asset),true);
  assert.equal(canUseLocalModel({...asset,path:'./assets/models/ecorche.meshopt.glb',bytes:6004016}),true);
  assert.equal(canUseLocalModel({...asset,path:'https://example.com/body.glb'}),false);
  assert.equal(canUseLocalModel({...asset,path:'../private.glb'}),false);
  assert.equal(canUseLocalModel({...asset,bytes:BODYLAB_ASSET_POLICY.maximumModelBytes+1}),false);
  assert.equal(canUseLocalModel({...asset,status:'draft'}),false);
  assert.equal(canUseLocalModel(null),false);
});

test('a három mozgás státusza nem hamisan validált',()=>{
  assert.equal(BODYLAB_MODEL_STATUS.procedural,'illustrative');
  assert.equal(Object.keys(MOTIONS).length,3);
  for(const [id,motion] of Object.entries(MOTIONS)){
    assert.equal(motionStatus(id),'illustrative');
    assert.match(motion.evidence,/validáció nélkül/);
  }
  assert.equal(motionStatus('missing'),'draft');
});
