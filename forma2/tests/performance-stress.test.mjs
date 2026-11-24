import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createRouteLifecycle } from '../js/core/route-lifecycle.js';
import { createAnatomyIsolation } from '../js/core/anatomy-isolation.js';
import { MOTIONS, motionCycle, motionPose } from '../js/core/exercise-motion.js';
import { rendererQuality } from '../js/core/bodylab-render.js';

test('stressz: 10 000 gyors navigáció után minden korábbi képernyő pontosan egyszer szabadul fel',()=>{
  const routes=createRouteLifecycle();
  const calls=new Uint8Array(10000);
  for(let i=0;i<calls.length;i++){
    const scope=routes.begin();
    scope.onCleanup(()=>{calls[i]++;});
    if(i>0)assert.equal(calls[i-1],1);
  }
  routes.begin();
  assert.equal(calls.every(value=>value===1),true);
});

test('stressz: 634 mesh 500 izolálási ciklus után eredeti láthatósággal marad',()=>{
  const meshes=Array.from({length:634},(_,i)=>({visible:i%7!==0}));
  const original=meshes.map(mesh=>mesh.visible);
  const isolation=createAnatomyIsolation(meshes);
  for(let i=0;i<500;i++){
    const index=(i*17)%meshes.length;
    if(!original[index])continue;
    assert.equal(isolation.isolate(meshes[index]),true);
    assert.equal(meshes.filter(mesh=>mesh.visible).length,1);
    isolation.restore();
  }
  assert.deepEqual(meshes.map(mesh=>mesh.visible),original);
  assert.equal(isolation.isIsolated(),false);
});

test('stressz: 15 000 mozgásfázis és csontpont véges, határon belüli',()=>{
  for(const id of Object.keys(MOTIONS))for(let i=0;i<5000;i++){
    const cycle=motionCycle(id,i/4999);
    assert.ok(cycle.poseProgress>=0&&cycle.poseProgress<=1);
    const pose=motionPose(id,cycle.poseProgress);
    for(const point of Object.values(pose))assert.ok(point.length===3&&point.every(Number.isFinite));
  }
});

test('mobil GPU profilok: 320–430 px, alacsony memória és hibás bemenet ellenőrzése',()=>{
  for(const width of [320,375,390,430,568,812,1024])for(const dpr of [1,2,3,NaN])for(const memory of [1,2,4,null]){
    const quality=rendererQuality({width,devicePixelRatio:dpr,deviceMemory:memory,reducedMotion:true});
    assert.ok(quality.pixelRatio>=1&&quality.pixelRatio<=2);
    assert.equal(quality.animateCamera,false);
    if(memory===1||memory===2)assert.equal(quality.antialias,false);
  }
});

test('animációs teljesítményvédelem: képernyőn kívül nincs folyamatos 60 FPS-es rajzolás',()=>{
  const figure=readFileSync(new URL('../js/ui/figure.js',import.meta.url),'utf8');
  const motion=readFileSync(new URL('../js/ui/exercise-motion-studio.js',import.meta.url),'utf8');
  assert.match(figure,/rect\.bottom<=0\|\|rect\.top>=/);
  assert.match(figure,/setTimeout\(\(\)=>requestAnimationFrame\(tick\),240\)/);
  assert.match(figure,/frameInterval=Number\.isFinite\(memory\)&&memory>0&&memory<=2\?32:16/);
  assert.match(figure,/if\(ts-lastPaint<frameInterval\)/);
  assert.match(motion,/const startPoint=new T\.Vector3\(\),endPoint=new T\.Vector3\(\),delta=new T\.Vector3\(\)/);
  assert.doesNotMatch(motion,/new T\.Vector3\(\.\.\.pose\[a\]\)/);
});

test('offline indítócsomag 2 MiB alatt marad, anatómiai GLB csak igény szerint töltődik',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const files=JSON.parse(sw.match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);
  assert.ok(!files.some(path=>path.endsWith('.glb')));
  const total=files.filter(path=>path!=='./').reduce((sum,path)=>sum+statSync(new URL('../'+path,import.meta.url)).size,0);
  assert.ok(total<2*1024*1024,`Túl nagy offline shell: ${total} byte`);
});
