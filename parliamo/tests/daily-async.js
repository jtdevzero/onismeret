#!/usr/bin/env node
/* Delayed background requests and microphone results must preserve the learner's current work.
 * PW_CHROMIUM=/usr/bin/chromium node parliamo/tests/daily-async.js
 */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),PROXY='https://async-test.workers.dev';
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=path.join(ROOT,pathname.endsWith('/')?pathname+'index.html':pathname);
  if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
let browser,count=0;
const errors=[];
function check(value,title){assert.ok(value,title);count++;console.log('  ✓ '+title);}
async function open(){
  const context=await browser.newContext({viewport:{width:390,height:860},serviceWorkers:'block'});
  let releaseUsage,requests=0;
  const pendingUsage=new Promise(r=>{releaseUsage=r;});
  await context.route(PROXY+'/**',async route=>{
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'content-type,x-app-key','access-control-allow-methods':'POST'}});
    if(new URL(route.request().url()).pathname==='/usage'){
      requests++;await pendingUsage;
      return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({cost:9,calls:1,in:10,out:10,months:[]})});
    }
    return route.fulfill({status:404,headers:{'access-control-allow-origin':'*'},body:'{}'});
  });
  await context.addInitScript(({proxy})=>{
    if(!localStorage.getItem('parliamo.v1'))localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en',goal:20,sound:false,proxy,pass:'test-code',budget:10,cloud:false}}));
    window.SpeechRecognition=class {};
  },{proxy:PROXY});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.waitForSelector('#hRound');
  return {context,p,releaseUsage,usageRequests:()=>requests};
}
async function showOutput(p){
  await p.evaluate(()=>{const s=dailySession();s.review=true;s.lesson=true;saveDaily();});
  await p.click('#hRound');await p.waitForSelector('#dailyAnswer');
}
async function deferListen(p){
  await p.evaluate(()=>{listen=()=>new Promise((resolve,reject)=>{window.__resolveListen=resolve;window.__rejectListen=reject;});});
  await p.click('#dailyMic');await p.waitForFunction(()=>!!window.__resolveListen);
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  console.log('\nDelayed usage responses');
  for(const stage of ['output','lesson']){
    const {context,p,releaseUsage,usageRequests}=await open();
    if(stage==='output')await showOutput(p);
    else{await p.evaluate(()=>{dailySession().review=true;saveDaily();});await p.click('#hRound');await p.waitForSelector('#startL');}
    const selector=stage==='output'?'#dailyAnswer':'#startL';
    await p.evaluate(sel=>{window.__viewMarker=document.querySelector(sel);},selector);
    check(usageRequests()>0,'usage request is pending during guided '+stage);
    releaseUsage();await p.waitForFunction(()=>USAGE!==null);
    check(await p.evaluate(sel=>dailyActive&&document.querySelector(sel)===window.__viewMarker,selector),'usage response preserves the guided '+stage+' DOM');
    await context.close();
  }

  console.log('\nDelayed microphone results after typed success');
  for(const result of ['resolve','reject']){
    const {context,p,releaseUsage}=await open();releaseUsage();await p.waitForFunction(()=>USAGE!==null);await showOutput(p);await deferListen(p);
    const expected=await p.evaluate(()=>dailyOutputItem().it);
    await p.fill('#dailyAnswer',expected);await p.click('#dailyCheck');await p.waitForSelector('#dailyFinish');
    const success=await p.locator('#dailyFeedback').innerText();
    await p.evaluate(async kind=>{if(kind==='resolve')window.__resolveListen(['a late unrelated answer']);else window.__rejectListen('no-speech');await new Promise(r=>setTimeout(r,0));},result);
    check(await p.locator('#dailyFinish').count()===1&&await p.locator('#dailyFeedback').innerText()===success,'late microphone '+result+' preserves success and its finish action');
    check(await p.locator('#dailyAnswer').inputValue()===expected&&await p.locator('#dailyCheck').isDisabled()&&await p.locator('#dailyMic').isDisabled(),'late microphone '+result+' cannot overwrite the accepted answer or reopen controls');
    check(await p.evaluate(()=>dailySession().output&&S.evidence.filter(e=>e.kind==='output').length===1&&!dailySession().outputHelp),'late microphone '+result+' preserves one truthful independent success');
    await context.close();
  }

  console.log('\nRecognized speech draft persistence');
  {
    const {context,p,releaseUsage}=await open();releaseUsage();await p.waitForFunction(()=>USAGE!==null);await showOutput(p);await deferListen(p);
    await p.evaluate(async()=>{window.__resolveListen(['my unfinished spoken draft']);await new Promise(r=>setTimeout(r,0));});
    await p.reload();await p.waitForSelector('#hRound');await p.click('#hRound');await p.waitForSelector('#dailyAnswer');
    check(await p.inputValue('#dailyAnswer')==='my unfinished spoken draft','recognized text survives reload as an editable draft');
    await context.close();
  }

  console.log('\nNavigation and pause while asynchronous work is pending');
  {
    const {context,p,releaseUsage}=await open();releaseUsage();await p.waitForFunction(()=>USAGE!==null);await showOutput(p);await deferListen(p);
    await p.evaluate(()=>go('ma'));await p.click('#hRound');await p.waitForSelector('#dailyAnswer');
    await p.fill('#dailyAnswer','my current unfinished answer');
    await p.evaluate(async()=>{window.__resolveListen(['stale microphone transcript']);await new Promise(r=>setTimeout(r,0));});
    check(await p.locator('#dailyAnswer').inputValue()==='my current unfinished answer'&&await p.locator('#dailyFeedback').innerText()==='','stale microphone result cannot alter a newly opened exercise');
    await p.evaluate(()=>{go('ma');S.dailySessions={};const c=POOL[0];S.cards[c.id]={...sched(null,2,c.id),due:today()};save();renderHome();});await p.click('#hRound');await p.waitForSelector('#quit');
    await p.click('#quit');await p.waitForSelector('#hRound');
    check(await p.evaluate(()=>!dailyActive&&!P&&!learningViewActive()),'quitting guided review pauses the path and permits background sync');
    await context.close();
  }
  check(errors.length===0,'asynchronous transitions produce no uncaught errors: '+errors.join('; '));
  console.log(`\n${count} daily async checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
