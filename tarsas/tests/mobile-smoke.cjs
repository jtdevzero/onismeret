'use strict';
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true});
 const routes=['tarsas/','paros/','tarsas/activity18/','tarsas/homlok/','tarsas/atkozott/','tarsas/harry-potter/'];
 const failures=[];
 fs.mkdirSync('test-artifacts',{recursive:true});
 for(const route of routes){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400 && new URL(r.url()).origin==='http://127.0.0.1:8765') errors.push(r.status()+' '+r.url())});
  try{
   const response=await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'networkidle',timeout:30000});
   if(!response?.ok()) throw Error('HTTP '+response?.status());
   const body=await page.locator('body').innerText();
   if(body.trim().length<30)throw Error('Empty screen');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
   if(overflow)throw Error('Horizontal overflow');
   if(errors.length)throw Error(errors.join(' | '));
   await page.screenshot({path:path.join('test-artifacts',route.replaceAll('/','_')+'.png'),fullPage:true});
   console.log('PASS',route);
  }catch(e){failures.push(route+': '+e.message);console.error('FAIL',route,e.message);try{await page.screenshot({path:path.join('test-artifacts','FAILED_'+route.replaceAll('/','_')+'.png'),fullPage:true})}catch{}}
  finally{await page.close();}
 }
 // Check compact phone layouts for horizontal overflow on every app.
 for(const route of routes){
  const page=await browser.newPage({viewport:{width:320,height:740},isMobile:true,hasTouch:true});
  try{
   const response=await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'networkidle'});
   if(!response?.ok())throw Error('HTTP '+response?.status());
   const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
   if(width.scroll>width.view+3)throw Error('Horizontal overflow '+JSON.stringify(width));
   console.log('PASS small screen',route);
  }catch(e){failures.push('320px '+route+': '+e.message);try{await page.screenshot({path:path.join('test-artifacts','SMALL_'+route.replaceAll('/','_')+'.png'),fullPage:true})}catch{}}
  finally{await page.close()}
 }
 // Behavioural check: solo dilemma voting advances without showing round results.
 {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
   await page.goto('http://127.0.0.1:8765/tarsas/atkozott/',{waitUntil:'networkidle'});
   const players=page.locator('#players');
   if(await players.count()!==1)throw Error('Player selector missing');
   await players.selectOption('1');
   const before=await page.locator('#progress').innerText();
   await page.locator('[data-vote="0"]').click();
   const after=await page.locator('#progress').innerText();
   if(before===after)throw Error('Solo vote did not advance');
   if(await page.locator('#next,#restart').count())throw Error('Solo mode unexpectedly displays results');
   await page.locator('#players').selectOption('2');
   await page.locator('[data-vote="0"]').click();
   await page.locator('[data-vote="1"]').click();
   if(await page.locator('#next').count()!==1)throw Error('Multiplayer result missing');
   const stats=await page.locator('#game').innerText();
   if(!stats.includes('Eddig lezárt körök: 1')||!stats.includes('Összes A: 1')||!stats.includes('Összes B: 1'))throw Error('Multiplayer aggregate is incorrect');

   await page.locator('#next').click();
   if(await page.locator('[data-vote="0"]').count()!==1)throw Error('Next round unavailable');
   const skipBefore=await page.locator('#progress').innerText();
   await page.locator('#skip').click();
   const skipAfter=await page.locator('#progress').innerText();
   if(skipBefore===skipAfter)throw Error('Skip did not advance dilemma');
   if(await page.locator('[data-vote="0"]').count()!==1)throw Error('Vote controls missing after skip');
   await page.locator('#players').selectOption('1');
   const total=Number((await page.locator('#progress').innerText()).split('/')[1].trim());
   for(let i=0;i<total;i++)await page.locator('#skip').click();
   if(await page.locator('#restart').count()!==1)throw Error('Skipped solo deck must finish');
   const finalText=await page.locator('#game').innerText();
   if(!finalText.includes('Átugrott: '+total))throw Error('Skipped total missing from summary');
   console.log('PASS dilemma gameplay');
  }catch(e){failures.push('dilemma gameplay: '+e.message);console.error('FAIL dilemma gameplay',e.message);}
  finally{await page.close();}
 }
 // Páros est: all nine game entry points render without runtime errors.
 {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
   await page.goto('http://127.0.0.1:8765/paros/',{waitUntil:'networkidle'});
   const games=['closer','radar','truth','match','honest','quiz','memories','future','bucket','spin','scene','dice','wish'];
   for(const key of games) {
    await page.goto('http://127.0.0.1:8765/paros/#'+key,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(120);
    const heading=await page.locator('h1,h2').allInnerTexts();
    const text=(await page.locator('#app').innerText()).trim();
    if(text.length<45||!heading.length||/Betöltés…/.test(text))throw Error(key+': empty setup');
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
    if(width.scroll>width.view+3)throw Error(key+': horizontal overflow');
    await page.screenshot({path:path.join('test-artifacts','paros_'+key+'.png'),fullPage:true});
   }
   await page.goto('http://127.0.0.1:8765/paros/#home',{waitUntil:'domcontentloaded'});
   const surprise=page.getByRole('button',{name:'Lepj meg egy játékkal'});
   if(await surprise.count()!==1)throw Error('Surprise chooser button missing');
   await surprise.click();
   const selected=await page.evaluate(()=>location.hash.slice(1));
   if(!['closer','radar','truth','quiz','memories','future','bucket'].includes(selected))throw Error('Surprise chooser picked unavailable adult game: '+selected);
   console.log('PASS all thirteen couples game routes');
  }catch(e){failures.push('couples game routes: '+e.message);console.error('FAIL couples game routes',e.message);}
  finally{await page.close();}
 }
 // End-to-end: a non-sensitive couples conversation starts and can advance.
 {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
   await page.goto('http://127.0.0.1:8765/paros/#closer',{waitUntil:'networkidle'});
   const form=page.locator('form[data-a="start"]');
   if(await form.count()!==1)throw Error('Conversation start form missing');
   await form.locator('button').last().click();
   if(!page.url().endsWith('#play'))throw Error('Game did not start');
   if(await page.locator('[data-a="next"]').count()!==1)throw Error('Conversation advance missing');
   await page.locator('[data-a="next"]').click();
   if(!page.url().endsWith('#play'))throw Error('Advancing left game unexpectedly');
   await page.locator('[data-a="stop"]').click();
   const ending=await page.locator('#app').innerText();
   if(ending.length<40)throw Error('Conversation end is empty');
   console.log('PASS couples conversation flow');
  } catch(e){failures.push('couples conversation: '+e.message);console.error('FAIL couples conversation',e.message);}
  finally{await page.close();}
 }
 // Party planner: verify result-card control and in-session state after reload.
 {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
    await page.goto('http://127.0.0.1:8765/tarsas/',{waitUntil:'networkidle'});
    const planner=page.locator('[data-a="nav"][data-v="evening"]').first();
    if(await planner.count()!==1)throw Error('Evening planner navigation missing');
    await planner.click();
    if(await page.locator('[data-a="eveningCard"]').count()!==1)throw Error('PNG export control missing');
    await page.locator('form[data-a="eveningAdd"] select[name="game"]').selectOption('never');
    await page.locator('form[data-a="eveningAdd"] button').click();
    const before=await page.locator('#app').innerText();
    if(!before.includes('Én még soha'))throw Error('Planner did not accept game');
    await page.reload({waitUntil:'networkidle'});
    await page.locator('[data-a="nav"][data-v="evening"]').first().click();
    const after=await page.locator('#app').innerText();
    if(!after.includes('Én még soha'))throw Error('Planner session did not restore');
    const downloadPromise=page.waitForEvent('download',{timeout:10000});
    await page.locator('[data-a="eveningCard"]').click();
    const download=await downloadPromise;
    if(!download.suggestedFilename().endsWith('.png'))throw Error('Export is not PNG');
    const out=path.join('test-artifacts','planner-export.png');
    await download.saveAs(out);
    if(fs.statSync(out).size<1000)throw Error('Export PNG is empty');
    // A service worker must control the page before going offline.
    await page.evaluate(async()=>{if(!('serviceWorker' in navigator))throw Error('No service worker support');await navigator.serviceWorker.ready;});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:15000});
    await page.context().setOffline(true);
    try {
      await page.reload({waitUntil:'domcontentloaded'});
      const offlineText=await page.locator('#app').innerText();
      if(!offlineText.includes('Én még soha'))throw Error('Offline restored planner missing game');
    } finally {await page.context().setOffline(false);}
    console.log('PASS planner and session restore');
  }catch(e){failures.push('planner persistence: '+e.message);console.error('FAIL planner persistence',e.message);}
  finally{await page.close();}
 }
 await browser.close();
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1});
