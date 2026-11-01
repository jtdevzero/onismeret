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
   await page.locator('#next').click();
   if(await page.locator('[data-vote="0"]').count()!==1)throw Error('Next round unavailable');
   console.log('PASS dilemma gameplay');
  }catch(e){failures.push('dilemma gameplay: '+e.message);console.error('FAIL dilemma gameplay',e.message);}
  finally{await page.close();}
 }
 // Páros est: all nine game entry points render without runtime errors.
 {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
   await page.goto('http://127.0.0.1:8765/paros/',{waitUntil:'networkidle'});
   const games=['closer','radar','truth','match','honest','quiz','memories','future','bucket'];
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
   console.log('PASS all nine couples game routes');
  }catch(e){failures.push('couples game routes: '+e.message);console.error('FAIL couples game routes',e.message);}
  finally{await page.close();}
 }
 await browser.close();
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1});
