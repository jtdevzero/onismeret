#!/usr/bin/env node
/* Real catalogue coverage and honest contour feedback, without a microphone or network. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const data=n=>JSON.parse(fs.readFileSync(path.join(root,'data',n+'-en.json'),'utf8'));
let level='A1';
const ctx=vm.createContext({console,Float32Array,Uint8Array,Uint16Array,Number,Math,
  XT:{pods:data('podcasts').podcasts,ser:data('serials').serials},STORIES:data('stories').stories,
  navigator:{},window:{},defLevel:()=>level,
  esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
});
for(const name of ['61-shadowing.js','65-intonation.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/js',name),'utf8'),ctx,{filename:name});
const run=code=>vm.runInContext(code,ctx);
const all=run('shSources()');
assert.equal(all.length,51,'all 51 English sources must remain available');
assert.equal(all[0].level,'A1','beginners see A1 first');
assert.ok(all.some(s=>s.type==='story'&&s.level==='A1'),'short beginner stories are not hidden behind a 40-item truncation');
const ids=new Set(all.map(s=>s.id));
assert.equal(ids.size,51);
for(const type of ['story','pod','serial']){
  const filtered=run(`shFilteredSources(shSources(),'all','${type}')`);
  assert.ok(filtered.length>0&&filtered.every(s=>s.type===type));
}
let byLevel=0;
for(const lv of ['A1','A2','B1','B2','C1']){
  const filtered=run(`shFilteredSources(shSources(),'${lv}','all')`);
  assert.ok(filtered.every(s=>s.level===lv));byLevel+=filtered.length;
}
assert.equal(byLevel,51,'level filters collectively expose every source');
level='B1';assert.equal(run('shSources()[0].level'),'B1','recommended level affects order, not availability');
assert.equal(run('shFilteredSources(shSources(),"A1","story").length'),all.filter(s=>s.type==='story'&&s.level==='A1').length);
const opposing=run(`(()=>{const a=Array.from({length:60},(_,i)=>i<45?3*Math.sin(i*Math.PI*2/45):0),b=a.map(v=>-v);return {model:a,me:b,modelS:contourStats(a),meS:contourStats(b),sim:contourSim(a,b)};})()`);
assert.ok(opposing.sim<-0.99);
ctx.opposing=opposing;const html=run('intonationHtml(opposing)');
assert.match(html,/ellentétes irányban/);
assert.doesNotMatch(html.replace(/<[^>]*>/g,''),/jól követi|Hasonlóság:|%/,'correlation is never presented as a pronunciation quality percentage');
assert.match(html,/data-intonation-cursor/);
assert.match(html,/szavak nincsenek egymáshoz igazítva/);
assert.equal(run('contourSim(Array(60).fill(1),Array(60).fill(1))'),null,'flat contours have no meaningful correlation');
assert.equal(run('contour([200,200,200,...Array(150).fill(0)])'),null,'a few voiced frames do not produce an invented full contour');
const noisy=run(`(()=>{let seed=7;const sr=16000,x=new Float32Array(sr*2);for(let i=0;i<x.length;i++){seed=(seed*1664525+1013904223)>>>0;x[i]=(seed/4294967296-.5)*.0004+(i<sr*.12?.2*Math.sin(2*Math.PI*180*i/sr):0);}const t=pitchTrack(x);return {q:pitchQuality(t),c:contour(t)};})()`);
assert.equal(noisy.q.usable,false,'short voicing in a mostly noisy clip is marked insufficient');
assert.equal(noisy.c,null);
assert.ok(run('contour([...Array(60).fill(180),...Array(100).fill(0),...Array(60).fill(220)]).some(v=>v===null)'),'long silent gaps are not bridged into fictitious pitch');
console.log('Shadowing and intonation: catalogue, filters, opposing shapes, sparse voicing, noise and time-axis checks passed.');
