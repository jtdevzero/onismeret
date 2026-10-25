#!/usr/bin/env node
/* Mocked user journeys: stale AI results, cancellation, timeouts, draft/history retention.
   Run after the Parliamo build. No external AI request is made. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local').pathname,f=path.join(root,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
const tick=p=>p.evaluate(()=>new Promise(resolve=>setTimeout(resolve,10)));
const text='Yesterday I went to the cinema with my friends and we watched a very funny film about a dog.';
const feedback={corrected:'Yesterday I went to the cinema.',errors:[{wrong:'I goed',right:'I went',hu:'mentem',why:'Rendhagyó ige.'}],natural:'I caught a film yesterday.',level:'B1',praise:'Jól érthető.',tip:'Gyakorold a múlt időt.',words:[{it:'to catch a film',hu:'megnézni egy filmet'}]};
async function mock(p){await p.evaluate(()=>{window.__aiCalls=[];getSample=async()=>({json:(prompt,opts)=>new Promise(resolve=>window.__aiCalls.push({prompt,signal:opts.signal,resolve}))});say=async()=>{};});}
async function chat(p){await p.evaluate(()=>{go('tanar');T.sc=SCEN[0];T.msgs=[{r:'ai',it:'Hello!',hu:'Szia!'}];T.level='A1';drawChat();});}
(async()=>{
 let browser;
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});
  const context=await browser.newContext({viewport:{width:390,height:860},serviceWorkers:'block'});
  await context.addInitScript(()=>{if(!localStorage.getItem('parliamo.v1'))localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en'}}));});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const url=`http://127.0.0.1:${server.address().port}/`;
  await p.goto(url);await p.waitForFunction(()=>LESSONS.length>0&&S.onboarded);await mock(p);

  await chat(p);await p.fill('#cin','I live in Budapest.');await p.click('#csend');await p.waitForFunction(()=>window.__aiCalls.length===1);
  const before=await p.evaluate(()=>({xp:S.xp,log:JSON.stringify(S.mlog)}));
  await p.click('#cCancel');await p.waitForSelector('#cRetry');
  assert.equal(await p.locator('#cin').inputValue(),'I live in Budapest.');
  assert.equal(await p.evaluate(()=>window.__aiCalls[0].signal.aborted),true);
  await p.evaluate(()=>window.__aiCalls[0].resolve({reply:'Late answer',correction:'late correction'}));await tick(p);
  assert.equal(await p.evaluate(()=>S.xp),before.xp);assert.equal(await p.evaluate(()=>JSON.stringify(S.mlog)),before.log);
  await p.click('#cRetry');await p.waitForFunction(()=>window.__aiCalls.length===2);
  await p.evaluate(()=>window.__aiCalls[1].resolve({reply:'Nice to meet you!',reply_hu:'Örvendek.',correction:null,suggestions:[]}));await p.waitForFunction(()=>!T.busy);
  assert.equal(await p.evaluate(()=>S.xp),before.xp+2);assert.equal(await p.locator('#cin').inputValue(),'');
  console.log('✓ chat cancellation ignores a late artifact-style response; retry keeps the typed sentence');

  await p.fill('#cin','English pending request');await p.click('#csend');await p.waitForFunction(()=>window.__aiCalls.length===3);
  const xp=await p.evaluate(()=>S.xp);await p.evaluate(()=>switchLang('es'));await p.waitForFunction(()=>lang()==='es'&&LESSONS.length>0);await chat(p);
  await p.evaluate(()=>window.__aiCalls[2].resolve({reply:'English stale answer',correction:'Old English correction'}));await tick(p);
  assert.equal(await p.evaluate(()=>S.xp),xp);assert.equal(await p.evaluate(()=>T.msgs.some(m=>/stale/.test(m.it))),false);
  assert.equal(await p.evaluate(()=>S.mlog.some(m=>/Old English/.test(m.c))),false);
  console.log('✓ changing language/session prevents stale chat replies, corrections and XP');

  await p.evaluate(()=>renderJournal());await p.fill('#jrText',text);await p.evaluate(()=>go('ma'));await p.evaluate(()=>renderJournal());
  assert.equal(await p.locator('#jrText').inputValue(),text,'draft survives normal navigation');
  await p.reload();await p.waitForFunction(()=>LESSONS.length>0&&S.onboarded);await mock(p);await p.evaluate(()=>renderJournal());
  assert.equal(await p.locator('#jrText').inputValue(),text,'draft survives reload');
  await p.evaluate(()=>switchLang('en'));await p.waitForFunction(()=>lang()==='en'&&LESSONS.length>0);await p.evaluate(()=>renderJournal());
  assert.equal(await p.locator('#jrText').inputValue(),'','each language has its own draft');await p.fill('#jrText',text+' English draft.');
  await p.click('#jrSend');await p.waitForFunction(()=>window.__aiCalls.length===1);
  const snapshot=await p.evaluate(()=>({xp:S.xp,journal:JSON.stringify(S.journal||[]),skills:JSON.stringify(S.sk||{})}));
  await p.evaluate(()=>switchLang('es'));await p.waitForFunction(()=>lang()==='es'&&LESSONS.length>0);await p.evaluate(()=>renderJournal());
  assert.equal(await p.locator('#jrText').inputValue(),text);
  await p.evaluate(result=>window.__aiCalls[0].resolve(result),feedback);await tick(p);
  assert.deepEqual(await p.evaluate(()=>({xp:S.xp,journal:JSON.stringify(S.journal||[]),skills:JSON.stringify(S.sk||{})})),snapshot);
  assert.equal(await p.evaluate(()=>JR.res),null);
  console.log('✓ journal drafts survive navigation/reload, remain language-specific, and reject stale results');

  await p.click('#jrSend');await p.waitForFunction(()=>window.__aiCalls.length===2);await p.click('#jrCancel');await p.waitForSelector('#jrRetry');
  assert.equal(await p.locator('#jrText').inputValue(),text);await p.evaluate(result=>window.__aiCalls[1].resolve(result),feedback);await tick(p);
  assert.equal(await p.evaluate(()=>S.xp),snapshot.xp);
  await p.clock.install();await p.click('#jrRetry');await p.waitForFunction(()=>window.__aiCalls.length===3);await p.clock.fastForward(45001);await p.waitForSelector('#jrRetry');
  assert.match(await p.locator('#jrRes').textContent(),/lassan válaszol/);assert.equal(await p.locator('#jrText').inputValue(),text);
  await p.evaluate(result=>window.__aiCalls[2].resolve(result),feedback);assert.equal(await p.evaluate(()=>S.xp),snapshot.xp);
  console.log('✓ journal cancellation and timeout restore the form and ignore late responses');

  await p.click('#jrRetry');await p.waitForFunction(()=>window.__aiCalls.length===4);await p.evaluate(result=>window.__aiCalls[3].resolve(result),feedback);await p.waitForSelector('#jrCards');
  const saved=await p.evaluate(()=>S.journal[S.journal.length-1]);assert.deepEqual(saved.feedback,feedback);
  await p.evaluate(()=>go('ma'));await p.evaluate(()=>renderJournal());await p.click('[data-journal-entry]');
  assert.match(await p.locator('#jrRes').textContent(),/Rendhagyó ige/);assert.match(await p.locator('#jrRes').textContent(),/caught a film/);
  await p.click('#jrCards');assert.equal(await p.locator('[data-jr-hu]').inputValue(),'mentem');await p.click('#jrSaveCards');
  assert.equal(await p.evaluate(()=>ownList().some(w=>w.it==='I went'&&w.hu==='mentem')),true);
  await p.click('#jrBackToDraft');assert.equal(await p.locator('#jrText').inputValue(),text);
  await p.evaluate(()=>{for(let i=0;i<12;i++)S.journal.push({id:'history-'+i,at:100+i,d:0,l:lang(),text:'Old entry',fixed:'Old entry',errs:[],n:0});renderJournal(true);});
  assert.equal(await p.locator('[data-journal-entry]').count(),10);await p.click('#jrMore');assert.equal(await p.locator('[data-journal-entry]').count(),13);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
  console.log('✓ full feedback and correction cards reopen from paged history without replacing the draft');

  await chat(p);await p.evaluate(()=>{T.msgs.push({r:'me',it:'My first answer.'},{r:'ai',it:'Another question.'},{r:'me',it:'My second answer.'});drawChat();});
  await p.click('#cSum');await p.waitForFunction(()=>window.__aiCalls.length===5);
  const summaryBefore=await p.evaluate(()=>({xp:S.xp,skills:JSON.stringify(S.sk||{})}));
  await p.evaluate(()=>go('ma'));await p.evaluate(()=>window.__aiCalls[4].resolve({summary:'An obsolete summary',score:8,level:'B2'}));await tick(p);
  assert.deepEqual(await p.evaluate(()=>({xp:S.xp,skills:JSON.stringify(S.sk||{})})),summaryBefore);
  await chat(p);await p.click('#ttab [data-v="write"]');await p.fill('#wtext','This is my English writing draft.');await p.click('#wsend');await p.waitForFunction(()=>window.__aiCalls.length===6);
  await p.evaluate(()=>switchLang('it'));await p.waitForFunction(()=>lang()==='it'&&LESSONS.length>0);await p.evaluate(()=>{go('tanar');T.tab='write';renderTutor();});
  await p.evaluate(()=>window.__aiCalls[5].resolve({corrected:'An obsolete English writing correction',errors:[],score:8}));await tick(p);
  assert.equal(await p.evaluate(()=>S.xp),summaryBefore.xp);assert.equal(await p.evaluate(()=>T.wRes),null);
  await chat(p);await p.evaluate(()=>{listen=()=>new Promise(resolve=>window.__heardLater=resolve);handsListen(true);});
  await p.evaluate(()=>switchLang('en'));await p.waitForFunction(()=>lang()==='en'&&LESSONS.length>0);await p.evaluate(()=>window.__heardLater(['late microphone transcript']));await tick(p);
  assert.equal(await p.evaluate(()=>window.__aiCalls.length),6,'an old microphone transcript never starts a new AI request');
  assert.deepEqual(errors,[]);
  console.log('✓ stale chat summaries, writing corrections and microphone transcripts cannot affect a new view');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
