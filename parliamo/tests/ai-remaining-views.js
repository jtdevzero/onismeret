#!/usr/bin/env node
/* Remaining AI views: late daily stories, grammar answers and course-writing feedback stay in their session. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.join(ROOT,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
let browser,count=0;const errors=[],uploads=[];function check(v,title){assert.ok(v,title);count++;console.log('  ✓ '+title);}
const story={hu:'Egy rövid történet',cast:{A:{name:'Alex'},B:{name:'Sam'}},lines:Array.from({length:5},(_,i)=>({s:'N',it:'Story sentence '+i+'.',hu:'Történetmondat '+i+'.'}))};
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))uploads.push(r.url());});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('parliamo.v1'))localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en',sound:false}}));});
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.waitForSelector('#hRound');
  await p.evaluate(()=>{
    window.__aiCalls=[];window.__playedStories=[];getSample=async()=>{
      const request=(kind,prompt,opts)=>new Promise(resolve=>window.__aiCalls.push({kind,prompt,signal:opts.signal,resolve}));
      const sample=(prompt,opts)=>request('text',prompt,opts);sample.json=(prompt,opts)=>request('json',prompt,opts);return sample;
    };say=async()=>{};playAi=data=>window.__playedStories.push({l:lang(),data});
  });
  const tick=()=>p.evaluate(()=>new Promise(r=>setTimeout(r,0)));
  const begin=async action=>{const i=await p.evaluate(()=>window.__aiCalls.length);await action();await p.waitForFunction(i=>window.__aiCalls.length===i+1,i);return i;};
  const reply=async(i,data)=>{await p.evaluate(({i,data})=>window.__aiCalls[i].resolve(data),{i,data});await tick();};
  const progress=()=>p.evaluate(()=>JSON.stringify({xp:S.xp,wc:S.wc||{},ai:S.ai,ev:S.ev}));

  await p.evaluate(()=>switchLang('it'));await p.evaluate(()=>{go('gyakorlas');S.ai={};});
  const oldStory=await begin(()=>p.evaluate(()=>{aiStory();}));check(await p.evaluate(i=>window.__aiCalls[i].prompt.includes('olaszul'),oldStory),'daily story request captures the selected Italian language');
  const oldStoryState=await progress();await p.evaluate(()=>switchLang('en'));await reply(oldStory,story);
  check(await progress()===oldStoryState&&await p.evaluate(()=>window.__playedStories.length===0),'late Italian story neither populates an English cache nor starts playback');
  check(await p.evaluate(i=>window.__aiCalls[i].signal.aborted,oldStory),'language switch aborts the old story request');
  const englishStory=await begin(()=>p.evaluate(()=>{aiStory();}));await reply(englishStory,story);await p.waitForFunction(()=>!!S.ai.en?.data);
  check(await p.evaluate(()=>S.ai.en.data.title==="Today's story"&&window.__playedStories.length===1&&window.__playedStories[0].l==='en'),'current English story uses its English fallback title and plays once');
  await p.evaluate(()=>{delete S.ai.en;go('gyakorlas');});const abandonedStory=await begin(()=>p.evaluate(()=>{aiStory();}));const abandonedState=await progress();await p.click('#aBack');await tick();await reply(abandonedStory,story);
  check(await p.evaluate(()=>route==='gyakorlas'&&!S.ai.en&&window.__playedStories.length===1)&&await progress()===abandonedState,'Back abandons the daily story without saving or playing a late result');
  check(await p.evaluate(i=>window.__aiCalls[i].signal.aborted,abandonedStory),'daily-story Back releases the pending AI request');

  await p.evaluate(()=>go('nyelvtan'));await p.waitForSelector('#gq');await p.fill('#gq','My first grammar question.');const oldGrammar=await begin(()=>p.click('#gask'));
  await p.fill('#gq','My second grammar question.');const newGrammar=await begin(()=>p.click('#gask'));await reply(oldGrammar,{text:'OBSOLETE GRAMMAR ANSWER'});
  check(!await p.locator('#gans').innerText().then(t=>t.includes('OBSOLETE'))&&await p.evaluate(i=>window.__aiCalls[i].signal.aborted,oldGrammar),'a new grammar question cancels the old answer and ignores its late response');
  await reply(newGrammar,{text:'New answer <img src=x onerror="window.__unsafeGrammar=1">'});await p.waitForFunction(()=>document.querySelector('#gans').textContent.startsWith('New answer'));
  check(await p.locator('#gans img').count()===0&&!await p.evaluate(()=>window.__unsafeGrammar),'grammar AI output is rendered as plain text');
  await p.fill('#gq','Keep this grammar question after cancellation.');const cancelledGrammar=await begin(()=>p.click('#gask'));await p.click('#gCancel');await p.waitForFunction(()=>document.querySelector('#gans').textContent.includes('megszakítottad'));const cancelText=await p.locator('#gans').innerText();await reply(cancelledGrammar,{text:'LATE CANCELLED GRAMMAR'});
  check(await p.locator('#gq').inputValue()==='Keep this grammar question after cancellation.'&&await p.locator('#gans').innerText()===cancelText,'grammar cancellation preserves the question and rejects a late answer');

  const openWriting=async()=>{await p.evaluate(()=>{go('gyakorlas');renderWCourse();});await p.locator('[data-wc]').first().click();await p.click('#wcTab [data-v="write"]');};
  const fillWriting=async()=>{const n=await p.locator('[data-wp]').count();for(let i=0;i<n;i++)await p.fill(`[data-wp="${i}"]`,'This paragraph contains enough words for a useful writing practice.');return n;};
  const writingReply=n=>({parts:Array.from({length:n},()=>({score:4,comment:'Jó rész.',corrected:'A corrected paragraph.'})),summary:'Current writing feedback.',tip:'Use clear links.'});
  await openWriting();let n=await fillWriting();const awayWriting=await begin(()=>p.click('#wcSend'));const awayState=await progress();await p.evaluate(()=>go('ma'));await reply(awayWriting,writingReply(n));
  check(await progress()===awayState&&await p.evaluate(()=>WC===null),'leaving writing practice prevents stale feedback, saved scores and XP');
  await openWriting();n=await fillWriting();const replacedWriting=await begin(()=>p.click('#wcSend'));const replacedState=await progress();await p.evaluate(()=>{WC={m:XT.writing[1]||XT.writing[0],tab:'write',txt:{},res:null};drawWC();});await reply(replacedWriting,writingReply(n));
  check(await progress()===replacedState&&await p.evaluate(()=>WC.res===null),'a new writing session cannot receive the previous session feedback or XP');
  n=await fillWriting();const tabWriting=await begin(()=>p.click('#wcSend'));const tabState=await progress();await p.click('#wcTab [data-v="model"]');await reply(tabWriting,writingReply(n));
  check(await progress()===tabState&&await p.evaluate(()=>WC.tab==='model'&&WC.res===null),'changing a writing tab cancels and ignores pending feedback');
  await p.click('#wcTab [data-v="write"]');check((await p.locator('[data-wp="0"]').inputValue()).startsWith('This paragraph'),'writing text survives a tab change');
  const cancelledWriting=await begin(()=>p.click('#wcSend'));await p.click('#wcCancel');await p.waitForFunction(()=>!WC.request);await reply(cancelledWriting,writingReply(n));
  check(await progress()===tabState&&await p.locator('#wcSend').isEnabled()&&await p.locator('[data-wp="0"]').evaluate(el=>!el.readOnly),'writing cancellation preserves progress and re-enables the existing draft');
  const currentWriting=await begin(()=>p.click('#wcSend'));const xp=await p.evaluate(()=>S.xp);await reply(currentWriting,writingReply(n));await p.waitForFunction(()=>!!WC.res);
  check(await p.evaluate(({xp,n})=>S.xp===xp+8&&WC.res.score===n*4&&S.wc[WC.m.id].score===n*4,{xp,n}),'current writing feedback saves its score and awards XP once');
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'remaining AI views fit the mobile viewport');check(uploads.length===0,'all AI responses are mocked without external requests');check(errors.length===0,'no uncaught remaining-AI-view errors: '+errors.join('; '));
  await ctx.close();console.log(`\n${count} remaining AI-view browser checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
