#!/usr/bin/env node
/* Late mock/report/device responses must never update another language or replacement view. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
  const state={language:'en',calls:[],xp:0,misses:[],saved:0,events:[],audio:null};
  const page={nodes:{}};
  class Element{
    constructor(){this.parts={};this.hidden=false;this.disabled=false;this.classList={toggle(){}};}
    set innerHTML(html){this.html=String(html);for(const match of this.html.matchAll(/id="([^"]+)"/g))page.nodes['#'+match[1]]=new Element();}
    get innerHTML(){return this.html||'';}
    querySelector(selector){return this.parts[selector]||(this.parts[selector]=new Element());}
    insertAdjacentHTML(_,html){this.innerHTML=this.innerHTML+html;}
  }
  const view={firstElementChild:null,set innerHTML(html){page.nodes={};this.firstElementChild={};this.html=html;const e=new Element();e.innerHTML=html;},get innerHTML(){return this.html;}};
  const sample=(prompt,opts)=>new Promise(resolve=>state.calls.push({kind:'text',prompt,signal:opts.signal,resolve}));
  sample.json=(prompt,opts)=>new Promise(resolve=>state.calls.push({kind:'json',prompt,signal:opts.signal,resolve}));
  const S={settings:{lang:'en',proxy:'',pass:'',cloud:false},days:{},log:{},ev:{},mock:{},ai:{},spk:[],journal:[]};
  const locale=()=>({name:state.language==='en'?'Angol':'Olasz',adj:state.language==='en'?'angol':'olasz',tts:state.language==='en'?'en-GB':'it-IT'});
  const ctx=vm.createContext({console,AbortController,setTimeout,clearTimeout,setInterval,clearInterval,Date,Map,Set,Promise,S,view,
    $:selector=>page.nodes[selector]||null,lang:()=>state.language,LG:locale,getSample:async()=>sample,IS_WEB:true,
    esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    aiErr:e=>e?.code||'error',aiMissing:()=>'AI nincs beállítva',
    player:{pause(){}},speechSynthesis:{getVoices:()=>[{lang:'en-GB'},{lang:'hu-HU'}],cancel(){}},
    navigator:{storage:{estimate:async()=>({usage:0}),persisted:async()=>false}},window:{scrollTo(){},print(){}},
    matchMedia:()=>({matches:false}),canSpeak:()=>false,say:()=>state.audio||Promise.resolve(),listen:async()=>['hello'],micMsg:()=>'',
    WORDS:[{it:'hello'}],AUDIO_IDX:{hello:'en-u1'},XT:{mock:[]},SKILLS:[],CRIT:[['content'],['communicative'],['organisation'],['language']],
    monthMisses:()=>[],packCards:()=>[],doneCount:()=>0,skillEst:()=>null,today:()=>100,
    logMiss:(...args)=>state.misses.push(args),addXP:n=>state.xp+=n,incEv:k=>state.events.push(k),save:()=>state.saved++,skillLog(){},confetti(){},essayHtml:()=>'<p>Essay feedback</p>',
    stopViews:()=>vm.runInContext('NAVN++;cancelAIRequests("stale");',ctx),
    state
  });
  vm.runInContext('let NAVN=0;',ctx);
  for(const file of ['67-ai-requests.js','48-device-check.js','54-mock-exams.js','64-monthly-report.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/js',file),'utf8'),ctx,{filename:file});
  return {state,ctx,S,view,node:id=>page.nodes[id],run:s=>vm.runInContext(s,ctx)};
}
const mock=`MK={m:{id:'b2',title:'Mock',level:'B2',minutes:30,parts:[{type:'writing',title:'Writing',etype:'Essay',task:'Write an essay.'}]},left:1200,timer:null,playing:false,text:Array(45).fill('word').join(' '),done:false};`;
const result={scores:{content:4,communicative:4,organisation:4,language:4},errors:[{wrong:'wrong',right:'right',why:'reason'}]};
(async()=>{
  let checks=0;
  {
    const h=harness();h.run(mock);const work=h.run('submitMock(false)');await tick();assert.equal(h.state.calls.length,1);
    h.state.language='it';h.run('NAVN++;MK={replacement:true};');h.view.innerHTML='<div id="replacement">Other language</div>';
    h.state.calls[0].resolve(result);await work;assert.equal(h.state.xp,0);assert.equal(h.state.misses.length,0);assert.equal(Object.keys(h.S.mock).length,0);assert.match(h.view.innerHTML,/Other language/);checks+=4;
  }
  {
    const h=harness();h.run(mock);const work=h.run('submitMock(false)');await tick();h.state.calls[0].resolve(result);await work;
    assert.equal(h.state.xp,30);assert.equal(h.S.mock.b2[0].l,'en');assert.equal(h.state.misses.length,1);assert.match(h.node('#mkRes').innerHTML,/Essay feedback/);checks+=4;
    h.state.language='it';assert.equal(h.run("mkHist('b2').length"),0);checks++;
  }
  {
    const h=harness();h.run(mock);const work=h.run('submitMock(false)');await tick();h.node('#mkCancelAI').onclick();await work;
    assert.equal(h.state.calls[0].signal.aborted,true);assert.equal(h.S.mock.b2[0].parts[0].pct,0);assert.match(h.node('#mkRes').innerHTML,/megszakítottad/);checks+=3;
    h.state.calls[0].resolve(result);await tick();assert.equal(h.state.misses.length,0);checks++;
  }
  {
    const h=harness();h.run('renderReport()');const work=h.node('#repAI').onclick();await tick();
    assert.equal(h.state.calls[0].kind,'text');h.state.language='it';h.run('renderReport()');const replacement=h.node('#repAIout');h.state.calls[0].resolve({text:'Old English summary'});await work;
    assert.equal(Object.keys(h.S.ai).length,0);assert.doesNotMatch(replacement.innerHTML,/Old English/);checks+=3;
    const current=h.node('#repAI').onclick();await tick();h.state.calls[1].resolve({text:'Current Italian summary'});await current;
    assert.equal(h.S.ai['report-it'].text,'Current Italian summary');assert.match(h.node('#repAIout').innerHTML,/Current Italian/);checks+=2;
    h.S.mock={b2:[{at:Date.now(),pct:80},{at:Date.now(),l:'it',pct:60}]};assert.equal(h.run('reportData().mocks.length'),1);assert.equal(h.run('reportData().mocks[0].pct'),60);checks+=2;
  }
  {
    const h=harness();let finishAudio;h.state.audio=new Promise(resolve=>finishAudio=resolve);await h.run('renderCheck()');const playback=h.node('#ckPlay').onclick();h.run('renderCheck()');await tick();const replacement=h.node('#ckYes');replacement.hidden=true;finishAudio();await playback;assert.equal(replacement.hidden,true);checks++;
    h.run('cancelAIRequests("stale")');
  }
  {
    const h=harness();let finishVoices;h.ctx.speechSynthesis.getVoices=()=>[];h.ctx.speechSynthesis.addEventListener=(_,fn)=>finishVoices=fn;h.ctx.speechSynthesis.removeEventListener=()=>{};
    const work=h.run('renderCheck()');h.state.language='it';h.view.innerHTML='<div id="ck-tts"></div>';const replacement=h.node('#ck-tts');finishVoices();await work;
    assert.equal(replacement.className,undefined);assert.equal(h.state.calls.length,0);checks+=2;
  }
  {
    const h=harness();const job=h.run('createAIRequest(()=>true,{timeoutMs:5})'),work=job.text('A plain request');await assert.rejects(work,e=>e.code==='timeout');assert.equal(h.state.calls[0].signal.aborted,true);checks+=2;
    h.state.calls[0].resolve({text:'too late'});await tick();
  }
  console.log(`Mock, device and monthly-report lifecycle: ${checks} checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
