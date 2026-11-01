'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'); const ROOT=path.resolve(__dirname,'../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const file=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,d)=>{if(e)res.writeHead(404).end();else res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(d);});});
let count=0; const ok=(v,m)=>{assert(v,m);console.log('✓ '+m);count++;};
const options={reward:'Közös randi <img src=x onerror=alert(1)>',tags:[],custom:[]};
async function start(page,o=options,length=6) {
  await page.evaluate(([jp,n])=>{run=null;start('jackpot',true,n,'base',{jp});A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();render();},[o,length]);
}
async function roll(page,faces,wait=true) {
  await page.evaluate(f=>{window.savedRandom=Math.random;const values=f.map(x=>(x+.1)/6);Math.random=()=>values.length?values.shift():.1;},faces);
  await page.locator('[data-a="jackpotRoll"]').click();
  await page.evaluate(()=>{Math.random=window.savedRandom;delete window.savedRandom;});
  if(wait) await page.waitForFunction(()=>!run.jp.rolling);
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try {
  for(const width of [320,880]) {
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.goto(origin+'/paros/#jackpot');
   ok(await page.locator('h1').innerText()==='Vágyjackpot',width+'px: dedicated route');
   ok(!await page.evaluate(()=>!!window.THREE),'Three.js is not loaded by the setup page');
   await page.locator('#jackpot-reward').fill('Közös este');await page.locator('[data-a="start"] button[type="submit"], [data-a="start"] > button').click();
   ok(await page.locator('[name="adult"]:invalid').count()===1,'native adult confirmation is required');
   await page.evaluate(jp=>{start('jackpot',false,6,'base',{jp});},options);
   ok(await page.evaluate(()=>!run),'programmatic start also requires adult confirmation');
   await page.locator('[name="adult"]').check();
   await page.locator('#jackpot-reward').fill('   ');await page.locator('[data-a="start"] > button').click();
   ok(await page.locator('#jackpot-reward').evaluate(e=>!!e.validationMessage),'blank jackpot is rejected without discarding the form');
   await page.locator('#jackpot-reward').fill('Közös este');
   await page.locator('details summary').click();await page.locator('#jackpot-kiss').fill(Array(11).fill('Saját ötlet.').join('\n'));await page.locator('[data-a="start"] > button').click();
   ok(await page.locator('#jackpot-kiss').evaluate(e=>!!e.validationMessage)&&(await page.locator('#jackpot-reward').inputValue())==='Közös este','too many custom tasks preserve the draft and show validation');
   await page.locator('#jackpot-kiss').fill('Egy saját ötlet.');await page.locator('[data-a="start"] > button').click();
   ok(await page.evaluate(()=>run.opts.jp.custom[0].t==='Egy saját ötlet.'),'custom tasks from the setup form enter only this run');
   ok(await page.evaluate(()=>run.phase==='limits-cover'),'both players receive the existing private limits flow');
   await page.locator('[data-a="openLimits"]').click();ok(await page.locator('[data-a="limit"][data-v="pozicio"]').count()===1,'custom position tags can also be excluded');await page.locator('[data-a="limit"][data-v="erintes"]').click();await page.locator('[data-a="limitsDone"]').click();await page.locator('[data-a="openLimits"]').click();await page.locator('[data-a="limitsDone"]').click();
   ok(await page.locator('[data-a="jackpotEdit"]').count()===1&&!await page.locator('[data-a="jackpotRoll"]').count(),'empty category blocks play and offers reconfiguration');
   await page.locator('[data-a="jackpotEdit"]').click();ok(await page.evaluate(()=>!run&&view==='jackpot'),'reconfiguration erases the blocked run');
   await start(page);await page.waitForSelector('.has-3d');
   ok(await page.evaluate(()=>THREE.REVISION==='160'&&!!document.querySelector('.jackpot-canvas canvas')),'local pinned Three.js renders three dice');
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+'px: casino fits viewport');
   await roll(page,[0,1,2]);ok(await page.evaluate(()=>run.jp.result.kind==='task'),'distinct symbols give one task');
   await page.locator('[data-a="jackpotNext"]').click();ok(await page.evaluate(()=>run.pos===1&&run.count===1),'done advances to the other player');
   await roll(page,[3,3,5]);ok(await page.locator('[data-a="jackpotChoose"]').count()===2,'pair offers two distinct category tasks');
   await page.locator('[data-a="jackpotChoose"]').first().click();ok(await page.locator('[data-a="jackpotNext"]').count()===1,'choosing a bonus unlocks completion');
   await page.locator('[data-a="jackpotPass"]').click();ok(await page.evaluate(()=>run.skipped===1&&run.pos===2),'pass advances without penalty');
   await roll(page,[4,4,4]);ok(await page.evaluate(()=>run.jp.result.kind==='jackpot'&&run.jp.jackpots===1),'triple awards configured jackpot');
   ok((await page.locator('.jackpot-outcome').innerText()).includes(options.reward)&&!await page.locator('.jackpot-outcome img').count(),'custom jackpot is escaped text');
   await page.locator('[data-a="jackpotNext"]').click();await roll(page,[2,3,4],false);
   ok(await page.locator('button:disabled').count()===1,'rolling disables another throw');
   const original=await page.evaluate(()=>JSON.stringify(run.jp.result));await page.evaluate(()=>A.jackpotRoll());ok(await page.evaluate(()=>JSON.stringify(run.jp.result))===original,'repeated roll action cannot change the pending result');
   await page.locator('[data-a="halt"]').click();ok(await page.evaluate(()=>run.phase==='halt'&&!run.jp.rolling)&&!await page.locator('canvas').count(),'stop settles the roll and releases graphics');
   await page.locator('[data-a="haltResume"]').click();await page.locator('[data-a="jackpotPass"]').click();
   await roll(page,[0,2,5],false);await page.keyboard.press('Escape');
   ok(await page.evaluate(()=>masked&&!run.jp.rolling)&&!await page.locator('canvas').count(),'Escape conceals the result and cancels animation');
   await page.locator('[data-a="unmask"]').click();await page.locator('[data-a="jackpotNext"]').click();
   await roll(page,[0,1,2]);await page.locator('[data-a="jackpotNext"]').click();
   ok(await page.evaluate(()=>run.phase==='result'&&run.pos===6&&run.count===4&&run.skipped===2),'six rounds end with accurate summary');
   await page.locator('[data-a="restart"]').click();ok(await page.evaluate(()=>run.phase==='limits-cover'&&run.length===6&&run.opts.jp.reward.includes('<img')),'restart preserves options and asks boundaries again');
   await start(page,{...options,custom:[{category:'kiss',t:'<img src=x onerror=alert(2)>'}]});
   await page.evaluate(()=>{run.jp.pools[0]=[run.opts.jp.custom[0].t];});await roll(page,[0,0,1]);
   ok(!await page.locator('.jackpot-outcome img').count()&&(await page.locator('.jackpot-outcome').innerText()).includes('<img'),'custom tasks are escaped text');
   await page.evaluate(()=>{A.adultOff();render();});ok(await page.evaluate(()=>run===null&&!adult),'disabling adult mode erases the whole jackpot run');
   await start(page);await roll(page,[1,2,3],false);await page.evaluate(()=>go('home'));
   ok(!await page.locator('canvas').count()&&await page.evaluate(()=>!run.jp.rolling),'navigation stops animation and releases graphics');
   await page.evaluate(()=>{go('play');masked=false;render();});await page.locator('[data-a="jackpotEnd"]').click();
   ok(await page.evaluate(()=>run.phase==='result'),'early close reaches summary');
   ok(await page.evaluate(()=>!Object.keys(localStorage).some(k=>/jackpot/.test(k))&&!JSON.stringify(localStorage).includes('Közös randi')),'jackpot text never enters localStorage');
   await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await page.evaluate(()=>go('home'));await context.setOffline(true);await page.reload();await page.waitForSelector('.game');
   ok(await page.evaluate(()=>run===null&&!adult),'offline reload clears session and adult consent');
   await start(page);await page.waitForSelector('.has-3d');await roll(page,[5,5,5]);
   ok(await page.evaluate(()=>run.jp.result.kind==='jackpot'),'offline game includes lazily loaded local 3D');
   ok(!errors.length,'no JavaScript errors: '+errors.join('; '));ok(!external.length,'no external requests');
   if(width===880) {
    await context.setOffline(false);
    await start(page,{reward:'Egy közösen megtervezett randi',tags:[],custom:[]},12);
    await roll(page,[0,0,0]);await page.waitForSelector('.has-3d');
    await page.screenshot({path:'/workspace/vagyjackpot-preview.png',fullPage:true});
   }
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:360,height:800},reducedMotion:'reduce'});
  await context.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=new Proxy(HTMLCanvasElement.prototype.getContext,{apply(target,self,args){return /webgl/.test(args[0])?null:Reflect.apply(target,self,args);}});});
  const page=await context.newPage();await page.goto(origin+'/paros/');await start(page);await roll(page,[1,1,1]);
  ok(await page.locator('.jackpot-symbols').isVisible()&&!await page.locator('.has-3d').count(),'WebGL failure keeps readable fallback symbols');
  ok(await page.evaluate(()=>!run.jp.rolling&&run.jp.result.kind==='jackpot'),'reduced motion and fallback still complete rolls');
  await context.close();
 } finally {await browser.close();await new Promise(r=>server.close(r));}
 console.log(count+' Vágyjackpot browser checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
