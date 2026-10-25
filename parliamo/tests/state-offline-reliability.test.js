#!/usr/bin/env node
/* Reset generations and verified offline download. No network or browser dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {MessageChannel}=require('node:worker_threads');
const src=name=>fs.readFileSync(path.join(__dirname,'../src/js',name),'utf8');
const stateContext={console,setTimeout(){return 1;},clearTimeout(){},window:{},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){}},queueCloud(){},renderChips(){},Date:class extends Date{static now(){return 1700000000000;}}};
vm.createContext(stateContext);
vm.runInContext(src('07-state.js')+src('32-sync-between-devices-web-app.js'),stateContext);
const evaluate=text=>vm.runInContext(text,stateContext);
assert.equal(evaluate('migrate({xp:0}).resetAt'),0);
evaluate(`S=migrate({xp:100,lessons:{a:{done:true}},cards:{a:{last:3}},own:{en:[{id:'own'}]},onboarded:true,settings:{lang:'it',proxy:'https://example.workers.dev',pass:'example',cloud:true},activeExercises:{en:{updatedAt:1,session:{i:2}}},journalDrafts:{en:{at:2,text:'draft'}},lessonCoverage:{a:{results:{x:{ok:true,at:1}}}}}); resetProgress();`);
assert.equal(evaluate('S.xp'),0);
assert.equal(evaluate('Object.keys(S.lessons).length'),0);
assert.equal(evaluate('Object.keys(S.journalDrafts).length'),0);
assert.equal(evaluate('S.settings.lang'),'it');
assert.equal(evaluate('S.onboarded'),true);
assert.equal(evaluate('S.resetAt'),1700000000000);
evaluate('resetProgress()');
assert.equal(evaluate('S.resetAt'),1700000000001,'two resets in one millisecond remain ordered');
stateContext.remote={updatedAt:9999999999999,xp:1000,lessons:{old:{done:true}},cards:{old:{last:10}},own:{en:[{id:'old'}]},resetAt:0,settings:{lang:'en'},onboarded:true};
evaluate('S=mergeState(S,remote)');
assert.equal(evaluate('S.xp'),0,'later save from a pre-reset device cannot resurrect XP');
assert.equal(evaluate('Object.keys(S.lessons).length'),0);
assert.equal(evaluate('Object.keys(S.cards).length'),0);
assert.equal(evaluate('Object.keys(S.own).length'),0);
assert.equal(evaluate('S.settings.lang'),'it');
stateContext.afterReset={resetAt:1700000000001,updatedAt:10,xp:5,lessons:{new:{done:true}},settings:{},activeExercises:{en:{updatedAt:10,session:{i:2}}},journalDrafts:{en:{text:'saved',at:10}},lessonCoverage:{new:{updatedAt:10,results:{one:{ok:true,at:10}}}}};
evaluate('S=mergeState(S,afterReset)');
assert.equal(evaluate('S.xp'),5,'new progress in the current generation survives');
assert.equal(evaluate('S.lessons.new.done'),true);
stateContext.tombstones={resetAt:1700000000001,updatedAt:20,settings:{},activeExercises:{en:{cleared:true,updatedAt:20}},journalDrafts:{en:{text:'',deleted:true,at:20}},lessonCoverage:{new:{updatedAt:20,results:{two:{ok:false,at:20}}}}};
evaluate('S=mergeState(S,tombstones); S=mergeState(S,afterReset)');
assert.equal(evaluate('S.activeExercises.en.cleared'),true);
assert.equal(evaluate('S.journalDrafts.en.deleted'),true);
assert.equal(evaluate('Object.keys(S.lessonCoverage.new.results).length'),2);
assert.equal(evaluate('cloudCopy().resetAt'),1700000000001);
assert.equal(evaluate("'pass' in cloudCopy().settings"),false);
// Seeing a reset on a different device retains that device's preferences.
stateContext.localBefore={resetAt:0,updatedAt:999,xp:200,settings:{lang:'es',theme:'dark'}};
stateContext.remoteReset={resetAt:40,updatedAt:1,xp:0,lessons:{},settings:{lang:'en'}};
assert.equal(evaluate('mergeState(localBefore,remoteReset).settings.lang'),'es');
assert.equal(evaluate('mergeState(localBefore,remoteReset).xp'),0);
// Each device may complete a different output sentence. Merge their work without moving drafts
// or assistance from a previous sentence onto the newest sentence.
stateContext.dailyLocal={updatedAt:200,settings:{},dailySessions:{en:{day:10,lessonId:'l1',at:200,output:false,outputDone:['a'],outputItemId:'b',outputHelp:false,outputAttempts:1,outputDraft:'new draft for b'}}};
stateContext.dailyRemote={updatedAt:100,settings:{},dailySessions:{en:{day:10,lessonId:'l1',at:100,output:false,outputDone:['b'],outputItemId:'a',outputHelp:true,outputAttempts:3,outputDraft:'older draft for a'}}};
evaluate('S=mergeState(dailyLocal,dailyRemote)');
assert.equal(evaluate('S.dailySessions.en.outputDone.join(",")'),'a,b','distinct completed output sentences survive synchronization');
assert.equal(evaluate('S.dailySessions.en.outputItemId'),'b');
assert.equal(evaluate('S.dailySessions.en.outputHelp'),false,'assistance stays scoped to its sentence');
assert.equal(evaluate('S.dailySessions.en.outputAttempts'),1);
assert.equal(evaluate('S.dailySessions.en.outputDraft'),'new draft for b');
evaluate('dailyLocal.evidence=[{id:"en|10|output|a",key:"a",l:"en",kind:"output",at:100}];dailyRemote.evidence=[{id:"en|10|practice|a",key:"a",l:"en",kind:"practice",at:90}];S=mergeState(dailyLocal,dailyRemote)');
assert.equal(evaluate('S.evidence.length'),1,'assisted and independent copies of the same answer do not create duplicate milestones');
assert.equal(evaluate('S.evidence[0].kind'),'practice','assistance remains recorded after moving to a different output sentence');
evaluate('dailyRemote.dailySessions.en.outputItemId="b"; dailyRemote.dailySessions.en.outputDone=["a","b"]; S=mergeState(dailyLocal,dailyRemote)');
assert.equal(evaluate('S.dailySessions.en.outputDone.join(",")'),'a,b','completion union is deduplicated');
assert.equal(evaluate('S.dailySessions.en.outputHelp'),true,'help for the same sentence cannot be undone by a stale device');
assert.equal(evaluate('S.dailySessions.en.outputAttempts'),3,'same-sentence retry count keeps its maximum');
assert.equal(evaluate('S.dailySessions.en.outputDraft'),'new draft for b','the newest draft remains editable');
evaluate('dailyRemote.dailySessions.en.output=true;dailyRemote.dailySessions.en.outputItemId="a";S=mergeState(dailyLocal,dailyRemote)');
assert.equal(evaluate('S.dailySessions.en.output'),true,'a completed daily output stage stays complete across item changes');
evaluate('dailyRemote.dailySessions.en.lessonId="l2"; S=mergeState(dailyLocal,dailyRemote)');
assert.equal(evaluate('S.dailySessions.en.outputDone.join(",")'),'a','different lessons do not share completed output sentences');
assert.equal(evaluate('S.dailySessions.en.output'),false);
evaluate('dailyRemote.updatedAt=300;dailyRemote.dailySessions.en.day=9; S=mergeState(dailyLocal,dailyRemote)');
assert.equal(evaluate('S.dailySessions.en.day'),10,'a newer save of an older day does not replace today');
assert.equal(evaluate('S.dailySessions.en.outputDone.join(",")'),'a','different days do not share completed output sentences');

// Story chapter maps merge independently and retain both language scope and old data.
stateContext.serialLocal={updatedAt:200,settings:{},ser:{'en:s1':{0:{ok:2,n:2,d:10},2:{ok:1,n:2,d:10}},'it:s1':{0:{ok:1,n:2,d:9}},s1:{0:{ok:2,n:2,d:1}}}};
stateContext.serialRemote={updatedAt:100,settings:{},ser:{'en:s1':{1:{ok:2,n:2,d:10},2:{ok:2,n:2,d:10}},'es:s1':{0:{ok:2,n:2,d:8}},s1:{1:{ok:1,n:2,d:2}}}};
evaluate('S=mergeState(serialLocal,serialRemote)');
assert.equal(evaluate("Object.keys(S.ser['en:s1']).join(',')"),'0,1,2','different chapters completed on separate devices are retained');
assert.equal(evaluate("S.ser['en:s1'][2].ok"),2,'same-day attempts retain the better chapter result');
assert.equal(evaluate("S.ser['it:s1'][0].ok"),1,'Italian progress remains separate');
assert.equal(evaluate("S.ser['es:s1'][0].ok"),2,'Spanish progress remains separate');
assert.equal(evaluate('Object.keys(S.ser.s1).length'),2,'ambiguous legacy story results remain stored');
evaluate("serialRemote.ser['en:s1'][2]={ok:0,n:2,d:11};S=mergeState(serialLocal,serialRemote)");
assert.equal(evaluate("S.ser['en:s1'][2].d"),11,'a later chapter attempt is not replaced by an older score');
assert.equal(evaluate("S.ser['en:s1'][2].ok"),0);
assert.deepEqual(JSON.parse(evaluate("JSON.stringify(mergeState(serialLocal,serialRemote).ser)")),JSON.parse(evaluate("JSON.stringify(mergeState(serialRemote,serialLocal).ser)")),'chapter merges are symmetric for real conflicting attempts');

const base='https://example.test/parliamo/';
const toURL=file=>new URL(file,base).href;
const responses={
  'data/en.json':{units:[{id:'en-u1'}]},
  'data/stories-en.json':{stories:[]},
  'data/verbs-en.json':{verbs:[]},
  'index.html':'app',
  'img/hero-en.webp':'image',
  'img/world-en.webp':'world image',
  'img/story-s3-scenes.webp':'story atlas',
  'audio/en-u1.json':{},
  'img/en-u1.webp':'image',
  'audio/vb-en.json':{},'audio/acc-en.json':{},'audio/dl-en.json':{}
};
const precache=['index.html','data/en.json','data/stories-en.json','data/verbs-en.json'];
const worker=`const SHELL = 'parliamo-shell-test';\nconst MEDIA = 'parliamo-media-test';\nconst PRECACHE = ${JSON.stringify(precache)};`;
function fakeResponse(body,status=200){return {ok:status>=200&&status<300,status,clone(){return fakeResponse(body,status);},text:async()=>typeof body==='string'?body:JSON.stringify(body),json:async()=>typeof body==='string'?JSON.parse(body):body};}
function offlineContext({failed,failedStatus,notStored,noController=false,noCache=false,oldWorker=false,manifest}={}){
  const stores=new Map();
  const storage={open:async name=>{
    if(noCache)throw Error('CacheStorage denied');
    if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
    return {match:async url=>store.get(url)?.clone(),put:async(url,response)=>{if(url!==toURL(notStored))store.set(url,response.clone());}};
  },match:async url=>{for(const store of stores.values())if(store.has(url))return store.get(url).clone();}};
  const controllingWorker={scriptURL:base+'sw.js',postMessage(message,ports){if(!oldWorker)ports[0].postMessage(manifest||{type:'parliamo-offline-manifest',shell:'parliamo-shell-active',media:'parliamo-media-active',precache});}};
  const c={URL,console,MessageChannel,setTimeout,clearTimeout,LANGS:{en:{hero:'hero-en'}},S:{core:{}},SCENARIOS:[],location:{href:base},window:{caches:storage},caches:storage,cacheNames:()=>[...stores.keys()],navigator:{serviceWorker:{controller:noController?null:controllingWorker,getRegistration:async()=>({active:{scriptURL:base+'sw.js'}})}},fetch:async url=>{
    if(url===base+'sw.js')return fakeResponse(worker);
    const key=url.slice(base.length);if(key===failed)throw Error('network disconnected');if(key===failedStatus)return fakeResponse('not found',404);
    return Object.prototype.hasOwnProperty.call(responses,key)?fakeResponse(responses[key]):fakeResponse('missing',404);
  }};
  vm.createContext(c);vm.runInContext(src('16-web-app-settings.js'),c);return c;
}
(async()=>{
  Object.assign(stateContext,{P:{old:true},CS:null,D:null,ST:null,PL:null,dailyActive:true,LESSONS:[],stopViews(){},artifactSaved:null});
  stateContext.artifactDoc={get:async()=>({exists:true,data:()=>({state:stateContext.remoteReset})}),set:async value=>{stateContext.artifactSaved=value;}};
  evaluate("S=migrate(localBefore);docRef=artifactDoc");
  await evaluate('pushRemote()');
  assert.equal(evaluate('S.resetAt'),40,'artifact path also adopts the reset generation');
  assert.equal(stateContext.artifactSaved.state.xp,0);
  assert.equal('pass' in stateContext.artifactSaved.state.settings,false);
  assert.equal(stateContext.P,null,'an old artifact exercise cannot keep writing after a reset');
  let finishPut;
  Object.assign(stateContext,{$:()=>null,proxyPost:async route=>route==='/sync/get'?{state:null,rev:1}:new Promise(resolve=>{finishPut=resolve;})});
  evaluate("docRef=null;S=fresh();S.settings.cloud=true;learningViewActive=()=>false");
  const pendingSync=evaluate('cloudSync()');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(typeof finishPut,'function');
  evaluate('resetProgress()');
  assert.equal(evaluate('cloudAgain'),true,'a reset during an in-flight upload requests another synchronization');
  finishPut({rev:2});await pendingSync;
  assert.equal(evaluate('cloudAgain'),false);
  assert.equal(evaluate('cloudT'),1,'the newer reset is scheduled after the in-flight upload ends');
  // An explicitly restored old backup belongs to the current reset generation.
  // Otherwise another device carrying the newer reset would erase that restoration.
  Object.assign(stateContext,{restoreUploads:[],restoreRenders:0,loadCourse:async()=>true,render(){stateContext.restoreRenders++;},
    proxyPost:async(route,body)=>{if(route==='/sync/get')return {rev:2};stateContext.restoreUploads.push(body.state);return {rev:3};}});
  vm.runInContext(src('41-ai-usage-and-backups.js'),stateContext);
  const restoreEpoch=evaluate('S.resetAt');evaluate("S.settings.lang='it';S.settings.pass='device-example';");
  stateContext.oldBackup={resetAt:0,xp:8,cards:{},lessons:{},settings:{lang:'en'}};
  await evaluate('cloudRestore(oldBackup)');
  assert.equal(evaluate('S.resetAt'),restoreEpoch,'restoration retains the current reset generation');
  assert.equal(evaluate('S.xp'),8,'the explicitly selected backup progress is restored');
  assert.equal(evaluate('S.settings.lang'),'it','restoration preserves device language');
  assert.equal(evaluate('S.settings.pass'),'device-example','restoration preserves device credentials locally');
  assert.equal('pass' in stateContext.restoreUploads[0].settings,false,'the restored cloud copy contains no device credential');
  assert.equal(evaluate('mergeState(S,{resetAt:0,xp:999999,settings:{}}).xp'),8,'an older device cannot replace the explicitly restored progress');
  assert.equal(stateContext.restoreRenders,1);
  stateContext.loadCourse=async()=>false;await evaluate('cloudRestore(oldBackup)');
  assert.equal(stateContext.restoreRenders,1,'an obsolete restore load cannot repaint another language');
  let c=offlineContext({failed:'audio/en-u1.json'});
  let result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,false);assert.ok(result.missing.includes('audio/en-u1.json'),'failed media is reported');
  const originalFetch=c.fetch;c.fetch=async(url,...args)=>url===toURL('audio/en-u1.json')?fakeResponse({}):originalFetch(url,...args);
  result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,true,'retry recovers missing assets and reuses verified cache entries');
  c=offlineContext({failedStatus:'audio/en-u1.json'});
  result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,false);assert.ok(result.missing.includes('audio/en-u1.json'),'HTTP 404 is not a downloaded asset');
  c=offlineContext({notStored:'audio/en-u1.json'});
  result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,false);assert.ok(result.missing.includes('audio/en-u1.json'),'HTTP success without a stored cache entry is not offline success');
  c=offlineContext({failedStatus:'img/world-en.webp'});
  result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,false);assert.ok(result.missing.includes('img/world-en.webp'),'the language-world image is required for a complete offline download');
  c=offlineContext({failedStatus:'img/story-s3-scenes.webp'});
  result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,false);assert.ok(result.missing.includes('img/story-s3-scenes.webp'),'the illustrated serial remains available offline');
  c=offlineContext({noController:true});
  await assert.rejects(vm.runInContext("downloadOfflineLanguages(['en'])",c),e=>e.code==='offline_unavailable');
  c=offlineContext({noCache:true});
  await assert.rejects(vm.runInContext("downloadOfflineLanguages(['en'])",c),e=>e.code==='offline_unavailable');
  c=offlineContext({oldWorker:true});
  await assert.rejects(vm.runInContext("downloadOfflineLanguages(['en'])",c),e=>e.code==='offline_unavailable','an older worker must be reloaded before claiming verified offline support');
  c=offlineContext({manifest:{type:'parliamo-offline-manifest',shell:'parliamo-shell-active',media:'parliamo-media-active',precache:['https://outside.test/asset']}});
  await assert.rejects(vm.runInContext("downloadOfflineLanguages(['en'])",c),e=>e.code==='offline_unavailable','the worker manifest cannot add external downloads');
  c=offlineContext();
  result=await vm.runInContext("downloadOfflineLanguages(['en'])",c);
  assert.equal(result.ok,true);assert.equal(result.missing.length,0);assert.ok(result.total>precache.length);
  assert.deepEqual(c.cacheNames(),['parliamo-shell-active','parliamo-media-active'],'download uses the controlling worker caches even when fetched sw.js describes a different version');
  console.log('state-offline-reliability: passed');
})().catch(err=>{console.error(err);process.exitCode=1;});
