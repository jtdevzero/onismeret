#!/usr/bin/env node
/* Real service worker: controlling-cache handshake, persisted media and navigation without a network. */
const assert=require('node:assert/strict'),{chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.join(ROOT,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
let browser,count=0;const errors=[];function check(v,title){assert.ok(v,title);count++;console.log('  ✓ '+title);}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(()=>{if(!localStorage.getItem('parliamo.v1'))localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en',sound:false}}));});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForSelector('#hRound');await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const cachedWorlds=await page.evaluate(async()=>{const targets=await offlineCacheTargets();return Promise.all(['en','it','es'].map(async l=>{const file=`img/world-${l}.webp`,response=await targets.shell.match(new URL(file,targets.base).href);return targets.precache.includes(file)&&response&&response.ok&&(await response.blob()).size>1000;}));});
  check(cachedWorlds.every(Boolean),'the real controlling worker precaches all three homepage illustrations');
  const download=await page.evaluate(()=>downloadOfflineLanguages(['en']));
  check(download.ok&&download.missing.length===0&&download.total>100,'the English course and media are verified in actual CacheStorage');
  await context.setOffline(true);await page.reload();await page.waitForSelector('#hRound');
  for(const l of ['en','it','es']){
    if(l!=='en'){await page.click('#langBtn');await page.click(`[data-lang="${l}"]`);}
    await page.waitForFunction(l=>lang()===l&&document.querySelector('.world-landmark img')?.complete&&document.querySelector('.world-landmark img')?.naturalWidth>0,l);
    check(await page.evaluate(l=>document.documentElement.dataset.learnLang===l&&document.querySelector('.world-landmark img').getAttribute('src')===`img/world-${l}.webp`,l),`${l}: homepage and artwork load after switching languages offline`);
  }
  await page.click('#langBtn');await page.click('[data-lang="en"]');await page.waitForFunction(()=>lang()==='en'&&document.querySelector('#hRound'));
  const audio=await page.evaluate(async()=>{const pack=await (await fetch('data/en.json')).json(),response=await fetch(`audio/${pack.units[0].id}.json`);return response.ok&&typeof await response.json()==='object';});
  check(audio,'downloaded course audio remains readable with the network disabled');
  await page.evaluate(()=>{go('gyakorlas');renderSerials();});await page.click('[data-ser="s3"]');await page.locator('.serial-intro [data-story-atlas]').scrollIntoViewIfNeeded();await page.waitForSelector('.serial-intro .is-atlas');
  check(await page.locator('.serial-intro .is-atlas').count()===1,'the generated story atlas is available offline');
  check(errors.length===0,'offline flows have no uncaught UI errors: '+errors.join('; '));
  await context.close();console.log(`\n${count} offline PWA checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
