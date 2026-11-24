import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createAnatomyIsolation } from '../js/core/anatomy-isolation.js';

test('egy kiválasztott mesh izolálása elrejti a többi látható elemet, de nem módosít adatot',()=>{
  const left={visible:true,geometry:{id:1},userData:{name:'bal'}},right={visible:true},hidden={visible:false};
  const model=createAnatomyIsolation([left,right,hidden]);
  assert.equal(model.isolate(left),true);
  assert.equal(model.isIsolated(),true);
  assert.equal(model.isolatedMesh(),left);
  assert.deepEqual([left.visible,right.visible,hidden.visible],[true,false,false]);
  assert.deepEqual(left.userData,{name:'bal'});
  model.restore();
  assert.deepEqual([left.visible,right.visible,hidden.visible],[true,true,false]);
  assert.equal(model.isIsolated(),false);
});

test('izolált állapotban keresett másik elemre váltás és visszaállítás',()=>{
  const a={visible:true},b={visible:true},c={visible:true};
  const model=createAnatomyIsolation([a,b,c]);
  model.isolate(a);
  model.isolate(c);
  assert.deepEqual([a.visible,b.visible,c.visible],[false,false,true]);
  assert.equal(model.toggle(c),false);
  assert.deepEqual([a.visible,b.visible,c.visible],[true,true,true]);
  assert.equal(model.toggle(b),true);
  assert.deepEqual([a.visible,b.visible,c.visible],[false,true,false]);
});

test('rejtett réteget vagy idegen mesh-t nem engedélyez izolálni',()=>{
  const a={visible:true},hidden={visible:false},foreign={visible:true};
  const model=createAnatomyIsolation([a,hidden,a]);
  assert.equal(model.isolate(hidden),false);
  assert.equal(model.isolate(foreign),false);
  assert.equal(model.isIsolated(),false);
  assert.deepEqual([a.visible,hidden.visible],[true,false]);
});

test('BODY LAB keresés, érintés és navigáció ugyanazt az izolálási állapotot használja',()=>{
  const three=readFileSync(new URL('../js/ui/three-body.js',import.meta.url),'utf8');
  const view=readFileSync(new URL('../js/ui/views-body-lab.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(three,/const chooseMesh=object=>/);
  assert.match(three,/if\(isolation\?\.isIsolated\(\)\)isolation\.isolate\(object\)/);
  assert.match(three,/focusElement, isolateSelected, resetView/);
  assert.match(three,/const resetView=\(\)=>\{[\s\S]*?onPick\(null,null\)/);
  assert.match(three,/if\(imported\)chooseMesh\(object\)/);
  assert.match(three,/isolation\?\.restore\(\);clearHighlight\(\);disposeAnatomyModel\(imported\)/);
  assert.match(view,/isolate\.setAttribute\('aria-pressed',String\(state\.isolated\)\)/);
  assert.match(view,/isolate\.disabled=!state\.selected/);
  assert.match(view,/if\(area && area!==current\.selected\)choose\(area,true\)/);
  assert.match(view,/if\(keepModel\)renderDetail\(\);else render\(\)/);
  assert.match(css,/\.bodylab-mesh-actions \.btn \{ min-height: 44px/);
});

test('az izoláló modul a helyi offline PWA cache része, WebGL-hiba esetén a vezérlés nem látható',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(sw,/"js\/core\/anatomy-isolation\.js"/);
  assert.match(css,/\.bodylab-three\[data-webgl=unavailable\] ~ \.bodylab-mesh-inspector/);
});
