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
  }catch(e){failures.push(route+': '+e.message);console.error('FAIL',route,e.message);}
  finally{await page.close();}
 }
 await browser.close();
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1});
