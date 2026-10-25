#!/usr/bin/env node
/* Delayed course/optional responses must never replace a newer language or prune its progress. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),src=name=>fs.readFileSync(path.join(ROOT,'src/js',name),'utf8');
const data=name=>JSON.parse(fs.readFileSync(path.join(ROOT,name),'utf8'));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
let checks=0;
function equal(actual,expected,message){assert.deepEqual(actual,expected,message);checks++;console.log('  ✓ '+message);}
function harness({realRender=false,enabledCore=false}={}){
  const holds=[],requests=[],elements=new Map(),listeners=new Map(),view={innerHTML:'',focus(){},querySelector(){return null;}},toasts=[],quickActions=[];
  const c={console,setTimeout,clearTimeout,URL,AbortController,view,OLD:Array.from({length:12},()=>({grammar:[]})),SCENARIOS:[],ROUTES:[['ma','Ma'],['leckek','Leckék']],NAVN:0,dailyActive:false,ST:null,PL:null,T:{},
    S:{onboarded:true,settings:{lang:'en'},cards:{},lessons:{},miss:{},mlog:[]},
    document:{addEventListener(){},documentElement:{},createElement(){return {}; }},window:{addEventListener(name,fn){listeners.set(name,fn);},scrollTo(){}},location:{hash:''},history:{replaceState(){}},
    esc:s=>String(s??''),coreOn:()=>enabledCore?{A1:true}:{},rebuildOwn(){},pickVoice(){},applyLanguageWorld(){},streak:()=>0,save(){},toast:s=>toasts.push(s),quickAction:shortcut=>quickActions.push({shortcut,language:c.S.settings.lang}),
    stopViews(){c.NAVN++;},I:{},$:selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:''});return elements.get(selector);},
    fetch(url){
      requests.push(url);const held=holds.find(h=>!h.used&&h.url===url);
      if(held){held.used=true;return new Promise((resolve,reject)=>{held.resolve=(value,status=200)=>resolve(response(value,status));held.reject=reject;});}
      try{return Promise.resolve(response(data(url)));}catch(e){return Promise.resolve(response(null,404));}
    }};
  function response(value,status=200){return {ok:status>=200&&status<300,status,json:async()=>JSON.parse(JSON.stringify(value))};}
  vm.createContext(c);vm.runInContext(src('02-course-data.js')+src('08-shell.js'),c);
  const run=code=>vm.runInContext(code,c),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
  run('renderChips=()=>{};');
  if(realRender)run(`for(const name of ['renderHome','renderLessons','renderCards','renderPractice','renderGrammar','renderTutor','renderStats','renderPassport','renderMap','renderCheck'])globalThis[name]=()=>{view.innerHTML='view:'+route+':'+lang()+':'+(LESSONS[0]&&LESSONS[0].id);};`);
  else run('render=()=>{view.innerHTML="render:"+lang()+":"+(LESSONS[0]&&LESSONS[0].id);};');
  const snapshot=()=>crypto.createHash('sha256').update(run('JSON.stringify({lessons:LESSONS.map(x=>x.id),words:WORDS.map(x=>x.id),stories:STORIES.map(x=>x.id),drills:CDRILLS,pods:XT.pods.map(x=>x.id),audio:AUDIO_IDX})')).digest('hex');
  return {c,view,requests,toasts,quickActions,run,json,snapshot,dispatch(name){const fn=listeners.get(name);if(fn)fn();},hold(url){const h={url,used:false};holds.push(h);return h;}};
}
(async()=>{
  let h=harness();
  const en=data('data/en.json'),englishWord=en.units[0].items.find(i=>i.k==='w');
  h.c.S.cards[englishWord.id]={s:2};
  const old=h.hold('data/it.json');
  const italian=h.run("switchLang('it')");await tick();
  const english=h.run("switchLang('en')");await english;
  const committed=h.snapshot();
  equal(h.run('lang()'),'en','latest language selection is English');
  equal(h.run('WORDS.every(x=>x.id.startsWith("en-"))'),true,'English course words publish together');
  old.resolve(data('data/it.json'));await italian;
  equal(h.snapshot(),committed,'late Italian response cannot replace lessons, word-of-day source, stories, drills or audio');
  equal(h.view.innerHTML,'render:en:en-u1','late Italian switch cannot repaint the English view');
  equal(h.c.S.cards[englishWord.id].s,2,'late Italian load cannot prune current English cards');
  equal(h.toasts,['Angol tananyag'],'only the current language completes visibly');

  h=harness({enabledCore:true});await h.run('loadCourse()');h.c.S.cards[englishWord.id]={s:2};const oldCore=h.hold('data/core-it.json');const coreSwitch=h.run("switchLang('it')");await tick();
  equal(oldCore.used,true,'enabled Italian core vocabulary participates in the pending startup transaction');
  await h.run("switchLang('en')");const currentCore=h.snapshot();oldCore.resolve(data('data/core-it.json'));await coreSwitch;
  equal(h.snapshot(),currentCore,'late enabled Italian core response cannot replace English course or audio data');
  equal(h.run('CORE.levels.every(level=>level.words.every(word=>word.id.startsWith("en-")))'),true,'enabled core vocabulary remains English after an obsolete Italian load');
  equal(h.c.S.cards[englishWord.id].s,2,'obsolete enabled-core startup cannot delete current English progress');

  h=harness();await h.run('loadCourse()');const previous=h.snapshot(),partial=h.hold('data/podcasts-it.json');const changing=h.run("switchLang('it')");await tick();
  equal(h.run('courseReady()'),false,'a language waiting for optional startup data is not marked ready');
  equal(h.snapshot(),previous,'startup data publishes atomically after every required startup response finishes');
  partial.resolve(data('data/podcasts-it.json'));await changing;
  equal(h.run('courseReady()'),true,'completed Italian startup makes its course ready');
  equal(h.run('WORDS.every(x=>!x.id.startsWith("en-")&&!x.id.startsWith("es-"))'),true,'Italian words replace the whole previous course together');

  h=harness({realRender:true});await h.run('loadCourse()');h.run("go('ma')");const navigationHold=h.hold('data/podcasts-it.json');const navigationSwitch=h.run("switchLang('it')");await tick();h.run("go('leckek')");
  equal(/Olasz tananyag betöltése/.test(h.view.innerHTML),true,'main navigation shows a loading barrier instead of the previous language course');
  equal(h.run('route'),'leckek','navigation remains usable while the selected course loads');
  navigationHold.resolve(data('data/podcasts-it.json'));await navigationSwitch;
  equal(h.view.innerHTML,'view:leckek:it:u1','course completion renders the route selected during loading');

  h=harness({realRender:true});await h.run('loadCourse()');const shortcutHold=h.hold('data/podcasts-it.json');const obsoleteShortcutSwitch=h.run("switchLang('it')");await tick();h.c.location.hash='#kor';h.dispatch('hashchange');
  equal(h.quickActions,[],'hash shortcuts cannot start a task against the previous language during loading');
  await h.run("switchLang('en')");shortcutHold.resolve(data('data/podcasts-it.json'));await obsoleteShortcutSwitch;
  equal(h.quickActions,[{shortcut:'kor',language:'en'}],'the latest successful language executes the pending shortcut exactly once');

  h=harness({realRender:true});await h.run('loadCourse()');const currentFailure=h.hold('data/es.json');const failingSwitch=h.run("switchLang('es')");await tick();currentFailure.reject(Error('current Spanish connection failed'));await failingSwitch;
  equal(h.run('courseReady()'),false,'failed current course cannot expose the previous language data');
  equal(/Nem sikerült betölteni a tananyagot/.test(h.view.innerHTML),true,'current load failure has a retryable error view');
  await h.run("switchLang('es')");
  equal(h.view.innerHTML,'view:ma:es:es-u1','retrying the selected language recovers its matching course');

  h=harness();const failed=h.hold('data/it.json');const oldSwitch=h.run("switchLang('it')");await tick();await h.run("switchLang('en')");failed.reject(Error('old Italian connection failed'));await oldSwitch;
  equal(h.view.innerHTML,'render:en:en-u1','failure from an old language cannot replace the newer successful view');
  equal(h.run('courseReady()'),true,'stale failure cannot mark the current course unavailable');

  h=harness();await h.run('loadCourse()');const oldSerial=h.hold('data/serials-en.json');const pending=h.run("loadExtra('serials')");await tick();await h.run("switchLang('it')");await h.run("switchLang('en')");await h.run("loadExtra('serials')");
  const serialTitle=h.run('XT.ser[0].title'),oldData=data('data/serials-en.json');oldData.serials[0].title='Obsolete response';oldSerial.resolve(oldData);await pending;
  equal(h.run('XT.ser[0].title'),serialTitle,'English → Italian → English does not let an old optional response replace the new serial catalogue');
  equal(h.run("extraReady('serials')"),true,'current optional data remains ready after an obsolete request finishes');

  h=harness();await h.run('loadCourse()');const oldGrammar=h.hold('data/grammar-en.json');const firstGrammar=h.run("loadExtra('grammar')");await tick();await h.run("switchLang('es')");await h.run("switchLang('en')");await h.run("loadExtra('grammar')");const grammarCount=h.requests.filter(x=>x==='data/grammar-en.json').length;
  oldGrammar.reject(Error('old grammar download failed'));await firstGrammar;await h.run("loadExtra('grammar')");
  equal(h.requests.filter(x=>x==='data/grammar-en.json').length,grammarCount,'failure of an obsolete request cannot evict the current optional-data promise');

  h=harness();await h.run('loadCourse()');const oldHandbook=h.hold('data/grammar-en.json');h.c.callbacks=[];h.run("withExtra('grammar',()=>callbacks.push('obsolete'))");await tick();await h.run('loadCourse()');h.run("withExtra('grammar',()=>callbacks.push('current'))");await tick();oldHandbook.resolve(data('data/grammar-en.json'));await tick();
  equal(h.c.callbacks,['current'],'same-language reload invalidates older optional-view callbacks even without navigation');
  console.log(`\n${checks} course-loading race checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
