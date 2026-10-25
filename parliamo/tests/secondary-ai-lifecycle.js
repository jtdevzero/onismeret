#!/usr/bin/env node
/* Delayed artifact-style replies must not cross a language, form, or exercise boundary. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local').pathname,f=path.resolve(ROOT,'.'+(u.endsWith('/')?u+'index.html':u));if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});if(process.env.PARLIAMO_SOURCE_HTML&&f===path.join(ROOT,'index.html'))return res.end(fs.readFileSync(process.env.PARLIAMO_SOURCE_HTML));fs.createReadStream(f).pipe(res);});
let browser,count=0;const errors=[];function check(v,title){assert.ok(v,title);count++;console.log('  ✓ '+title);}
const tick=p=>p.evaluate(()=>new Promise(r=>setTimeout(r,10)));
async function waitCall(p,n){await p.waitForFunction(n=>window.__calls.length===n,n);}
async function resolve(p,i,r){await p.evaluate(({i,r})=>window.__calls[i].resolve(r),{i,r});await tick(p);}
async function change(p,l){await p.evaluate(l=>switchLang(l),l);await p.waitForFunction(l=>lang()===l&&courseReady(),l);}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const context=await browser.newContext({viewport:{width:390,height:860},serviceWorkers:'block'});await context.addInitScript(()=>{localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'it',sound:false}}));});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.waitForSelector('#hRound');
  await p.evaluate(()=>{window.__calls=[];getSample=async()=>({json:(prompt,options)=>new Promise(resolve=>window.__calls.push({prompt,signal:options.signal,resolve}))});say=async()=>{};});

  await p.evaluate(()=>go('kartyak'));await p.fill('#ownIn','un vecchio termine');await p.click('#ownGo');await waitCall(p,1);
  await change(p,'en');await p.evaluate(()=>go('kartyak'));await p.fill('#ownIn','a fresh English word');const beforeOwn=await p.locator('#ownOut').innerHTML();
  await resolve(p,0,{it:'parola vecchia',hu:'régi szó'});
  check(await p.locator('#ownOut').innerHTML()===beforeOwn&&await p.locator('#ownSave').count()===0,'old Italian word lookup cannot install a save button in English');
  check(await p.evaluate(()=>ownList().length===0&&window.__calls[0].signal.aborted),'switching language aborts word lookup and adds no foreign card');
  await p.click('#ownGo');await waitCall(p,2);await resolve(p,1,{it:'a fresh word',hu:'egy friss szó'});await p.click('#ownSave');
  check(await p.evaluate(()=>ownList().some(w=>w.it==='a fresh word')),'current-language word suggestion still saves after review');

  await p.evaluate(()=>{go('gyakorlas');startBuild();});await p.fill('#sbIn','something outside the local template');await p.click('#sbGo');await waitCall(p,3);const beforeBuild=await p.evaluate(()=>S.xp);
  await change(p,'es');await p.evaluate(()=>{go('gyakorlas');startBuild();});await resolve(p,2,{ok:true,fix:'old English answer'});
  check(await p.evaluate(()=>S.xp)===beforeBuild&&await p.evaluate(()=>SB.n===0&&!SB.res),'old sentence assessment cannot score the next language exercise');
  await p.evaluate(()=>{listen=()=>new Promise(resolve=>window.__micLater=resolve);});await p.click('#sbMic');await change(p,'it');await p.evaluate(()=>{go('gyakorlas');startBuild();});await p.evaluate(()=>window.__micLater(['old microphone answer']));await tick(p);
  check(await p.evaluate(()=>window.__calls.length===3&&SB.n===0),'old microphone transcript cannot launch an assessment in a new language');

  await p.evaluate(()=>{go('gyakorlas');renderImport();});await p.fill('#impText',Array(45).fill('vecchio').join(' '));await p.click('#impGo');await waitCall(p,4);const beforeImport=await p.evaluate(()=>({xp:S.xp,n:(S.imp||[]).length}));
  await change(p,'en');await p.evaluate(()=>{go('gyakorlas');renderImport();});await p.fill('#impText',Array(45).fill('fresh').join(' '));await resolve(p,3,{title:'Vecchia lezione',words:[{it:'vecchio',hu:'régi'}],cloze:[]});
  check(await p.evaluate(()=>S.xp)===beforeImport.xp&&await p.evaluate(()=>(S.imp||[]).length)===beforeImport.n,'old imported text cannot earn XP or save under the next language');
  check((await p.locator('#impText').inputValue()).startsWith('fresh'),'new import draft remains untouched by the old response');

  await p.evaluate(()=>{go('gyakorlas');renderReader();});await p.fill('#rTopic','Old topic');await p.click('#rGo');await waitCall(p,5);
  await p.fill('#rTopic','Latest topic');await p.click('#rGo');await waitCall(p,6);
  await resolve(p,4,{title:'Obsolete reader',paragraphs:['An old English paragraph.'],glossary:[],questions:[]});
  check(await p.locator('#rCancel').count()===1&&await p.evaluate(()=>!S.readLast?.en),'an earlier topic cannot replace the newer reader request');
  await resolve(p,5,{title:'Current reader',paragraphs:['A fresh English paragraph.'],glossary:[],questions:[]});await p.waitForSelector('#rBack2');
  check(await p.locator('h1').innerText()==='Current reader','latest reader request remains functional');
  await p.locator('.w').first().click();await waitCall(p,7);await change(p,'it');await p.evaluate(()=>{go('gyakorlas');renderReader();showText({title:'Lettura',topic:'Test',level:'A1',hu:'Olvasás',paragraphs:['Questa è una frase.'],glossary:[],questions:[]});});
  await resolve(p,6,{base:'old lookup',hu:'régi keresés'});
  check(await p.evaluate(()=>RD.gl.size===0&&document.querySelector('#wpop').hidden),'old word translation cannot populate another reader or its dictionary');

  await p.evaluate(()=>{for(let i=0;i<6;i++)logMiss('lesson','vecchio','wrong','right');go('stat');});await p.click('#aPlan');await waitCall(p,8);await change(p,'en');
  const item={q:'A ___ example.',a:'good',o:['good','bad','other']};await resolve(p,7,{title:'Old plan',days:Array.from({length:14},()=>({t:'Day',ex:'Explanation',items:[item]})),test:Array.from({length:10},()=>item)});
  check(await p.evaluate(()=>!S.plan.en&&!S.plan.it),'late plan generation cannot create a plan for the newly selected language');
  await p.evaluate(()=>{for(let i=0;i<6;i++)logMiss('lesson','old','wrong','right');go('stat');});await p.click('#aRun');await waitCall(p,9);await change(p,'es');await resolve(p,8,{summary:'Old English analysis',patterns:[],drill:[]});
  check(await p.evaluate(()=>!S.ai['rep-en']&&!S.ai['rep-es']),'late monthly analysis cannot save or display under another language');
  check(errors.length===0,'secondary AI flows have no uncaught errors: '+errors.join('; '));
  console.log(`\n${count} secondary AI lifecycle checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
