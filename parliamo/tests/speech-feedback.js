#!/usr/bin/env node
/* Recognition must respect word order and repetition; transcript feedback cannot score pronunciation. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../src/js');
const node={innerHTML:''};
const ctx=vm.createContext({
  console,Uint16Array,Date,
  document:{querySelector:()=>node},
  S:{settings:{},mlog:[]},
  lang:()=> 'en',LG:()=>({tts:'en-GB'}),today:()=>1,
  subShell:()=>{},getSample:async()=>({json:async()=>({band:'6.5',cefr:'B2',scores:{fluency:7,lexical:6,grammar:6,pronunciation:9},comments:{pronunciation:'Perfect pronunciation.'},errors:[]})}),
  incEv:()=>{},drillStat:()=>{},addXP:()=>{},save:()=>{},spkBtn:()=>'',aiErr:String
});
for(const name of ['05-helpers.js','26-shared-bits-for-the-new-views.js','53-speaking-examiner.js','57-skill-levels.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name});
const match=(target,alts)=>vm.runInContext(`speechDetail(${JSON.stringify(target)},${JSON.stringify(alts)})`,ctx);
assert.equal(match('Hello, world!',['hello world']).score,1);
assert.equal(match('I think there are three',['I sink there are tree']).words.filter(w=>!w.ok).map(w=>w.w).join(','),'think,three');
assert.equal(match('to be or not to be',['to be']).score,2/6,'one recognised word cannot satisfy repeated target words');
assert.equal(match('dog bites man',['man bites dog']).score,1/3,'word order matters');
assert.equal(match('hello',['hello there']).score,0.5,'extra recognised words affect the match');
assert.equal(match('hello world',['wrong answer','hello world']).heard,'hello world','choose the best full recognition alternative');
assert.equal(match('',[]).score,0);
assert.equal(match(null,null).score,0);
assert.equal(match('hello',[]).score,0);
assert.equal(match('hello',[null,9]).score,0);
vm.runInContext(`S.sk={read:[{l:'en',lv:'B2',p:80},{l:'en',lv:'BAD',p:80},{l:'en',lv:'C1',p:NaN},{l:'it',lv:'A1',p:80}]}`,ctx);
assert.equal(vm.runInContext('skillEst("read").used',ctx),1,'bad persisted records and other languages do not enter estimates');
(async()=>{
  // A model may ignore the prompt. The application must still suppress invented audio scores.
  vm.runInContext('SE={set:{t:"Test"},ans:[{part:1,q:"Where?",text:"I live in a flat.",secs:15}]}',ctx);
  await vm.runInContext('scoreSE()',ctx);
  assert.equal(vm.runInContext('SE.res.scores.pronunciation',ctx),null);
  assert.match(node.innerHTML,/Hanganyag nélkül nem értékelhető/);
  assert.doesNotMatch(node.innerHTML,/Perfect pronunciation/);
  assert.match(node.innerHTML,/nem hivatalos IELTS/);
  assert.equal(vm.runInContext('S.sk.speak',ctx),undefined,'transcript examiner results must not create a measured speaking level');
  console.log('Speech feedback: 16 checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
