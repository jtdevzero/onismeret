#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let file;try{const u=new URL(req.url,'http://localhost');file=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));}catch{res.writeHead(400).end();return;}if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error)res.writeHead(404).end();else res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data);});});
let count=0;function ok(value,message){assert(value,message);count++;console.log('✓ '+message);}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{for(const width of [320,880]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});page.on('dialog',d=>d.accept());
 await page.goto(origin+'/paros/');await page.waitForSelector('.game');
 ok(await page.locator('.game').count()===9,`${width}px: nine separate pair games`);
 ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px: home fits viewport`);
 for(const mode of ['closer','radar','truth','match','honest','quiz','memories','future','bucket']){await page.evaluate(m=>go(m),mode);ok(await page.locator('h1').innerText()!==''&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${mode} setup and layout`);}
 await page.evaluate(()=>go('home'));await page.locator('[data-a="filter"][data-v="adult"]').click();ok(await page.locator('.game').count()===3,'filter shows exactly three18+ games');await page.locator('[data-a="filter"][data-v="all"]').click();
 for(const key of ['memories','future','bucket']){await page.evaluate(k=>{run=null;go(k);},key);await page.selectOption('#round-length',key==='bucket'?'4':'6');await page.locator('form[data-a="start"] button').click();ok(await page.evaluate(()=>run.deck.length)===(key==='bucket'?4:6),key+' respects chosen short round');if(key!=='bucket'){for(let i=0;i<6;i++)await page.locator('[data-a="next"]').click();ok(await page.evaluate(()=>run.phase==='result'&&run.count===6),key+' completes six questions');}else{for(let p=0;p<2;p++){await page.locator('[data-a="open"]').click();for(let i=0;i<4;i++){await page.locator('[data-a="select"][data-v="0"]').click();await page.locator('[data-a="confirm"]').click();}}ok(await page.evaluate(()=>run.rows.length===4&&run.answers.every(a=>a.length===0)),'bucket reveals only shared ideas and erases answers');}}
 await page.evaluate(()=>{run=null;start('truth',true,24);A.draw('truth');for(let i=0;i<24;i++){A.next();if(run.phase==='talk')A.draw('truth');}render();});ok(await page.evaluate(()=>run.phase==='result'&&run.count===24),'long truth round has enough unique prompts');
 await page.evaluate(()=>{run=null;adult=false;});
 await page.evaluate(()=>{run=null;start('memories',false,6);for(let i=0;i<6;i++)A.next();A.restart();render();});ok(await page.evaluate(()=>run.deck.length===6),'restart preserves the selected round length');await page.evaluate(()=>{run=null;});
 await page.goto(origin+'/paros/#__proto__');ok(await page.locator('.game').count()===9,'invalid prototype hash safely falls back to home');
 await page.evaluate(()=>{adult=false;start('match',false);});ok(await page.evaluate(()=>run===null),'18+ cannot start without confirmation');
 await page.evaluate(()=>go('match'));await page.locator('form[data-a="start"] input[type="checkbox"]').check();await page.locator('form[data-a="start"] button').click();
 ok(await page.locator('.privacy').count()===1,'private handoff covers first answers');
 // Player1 yes,no,maybe,pass; player2 yes,yes,yes,yes: only item0 and4 can be shown.
 const one=[0,1,2,-1,0,1,2,-1],two=Array(8).fill(0);
 for(const answers of [one,two]){await page.locator('[data-a="open"]').click();for(const n of answers){await page.locator(`[data-a="select"][data-v="${n}"]`).click();await page.locator('[data-a="confirm"]').click();}}
 ok(await page.evaluate(()=>run.rows.length===2),'only mutual yeses are revealed');
 ok(await page.evaluate(()=>run.answers.every(a=>a.length===0)&&run.guesses.every(a=>a.length===0)),'raw private responses erased after matching');
 ok(!await page.locator('#app').innerText().then(t=>t.includes('Második játékos: Nem')),'private no responses never appear in summary');
 await page.evaluate(()=>{A.clear();start('radar',false);});
 for(const choice of [0,1]){await page.locator('[data-a="open"]').click();for(let i=0;i<8;i++){await page.locator(`[data-a="select"][data-v="${choice}"]`).click();await page.locator('[data-a="confirm"]').click();}}
 ok(await page.evaluate(()=>run.rows.length===8&&run.rows.every(r=>!r.same)),'radar compares both completed private sets');
 await page.evaluate(()=>{A.clear();start('quiz',false);});
 for(const values of [[0,1],[1,0]]){await page.locator('[data-a="open"]').click();for(let i=0;i<8;i++){for(const n of values){await page.locator(`[data-a="select"][data-v="${n}"]`).click();await page.locator('[data-a="confirm"]').click();}}}
 ok(await page.evaluate(()=>run.scores.every(n=>n===8)),'quiz scores own answers against partner predictions');
 const scores=await page.evaluate(()=>run.scores.join(','));await page.evaluate(()=>A.confirm());ok(await page.evaluate(()=>run.scores.join(','))===scores,'repeated confirmation cannot duplicate quiz scores');
 for(const key of ['closer','honest']){await page.evaluate(k=>{A.clear();start(k,true);},key);ok(await page.evaluate(()=>new Set(run.deck).size===12),`${key}: non-repeating deck`);for(let i=0;i<12;i++)await page.locator('[data-a="next"]').click();ok(await page.evaluate(()=>run.phase==='result'&&run.count===12),`${key}: conversation completes without scoring`);}
 await page.evaluate(()=>{A.clear();start('truth',true);});await page.locator('[data-a="draw"][data-v="truth"]').click();ok(await page.evaluate(()=>typeof run.prompt==='string'),'truth draws a question');await page.locator('[data-a="pass"]').click();await page.locator('[data-a="draw"][data-v="dare"]').click();ok(await page.evaluate(()=>run.kind==='dare'&&run.pos===1&&run.skipped===1),'pass switches player without penalty');await page.locator('[data-a="stop"]').click();
 // Background and return with a private response selected.
 await page.evaluate(()=>{A.clear();start('match',true);A.open();A.select('1');render();conceal();});ok(await page.locator('#app').innerText().then(t=>t.includes('A kör elrejtve')),'background veil hides an opened answer');
 await page.locator('[data-a="unmask"]').click();ok(await page.evaluate(()=>!masked&&run.selected===1),'owner can resume private answer');
 await page.evaluate(()=>{A.adultOff();render();});ok(await page.evaluate(()=>!adult&&run===null),'18+ disable erases active adult round');
 await page.evaluate(()=>go('settings'));await page.locator('[name="first"]').fill('<b>Anna</b>');await page.locator('[name="second"]').fill('Béla');await page.locator('form[data-a="names"] button').click();await page.evaluate(()=>go('radar'));await page.locator('form[data-a="start"] button').click();
 ok(await page.locator('#app b').count()===0,'names are rendered as escaped text');
 const storage=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));ok(Object.keys(storage).every(k=>k==='paros.preferences.v1')&&!JSON.stringify(storage).includes('answers'),'only names are stored, separately from Társasest');
 await page.reload();ok(await page.evaluate(()=>run===null&&!adult),'reload clears private responses and adult confirmation');
 await page.evaluate(()=>go('home'));await page.locator('.game[href="#radar"]').click();await page.goBack();ok(await page.evaluate(()=>view==='home'),'browser Back navigates the standalone page');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.evaluate(()=>go('home'));ok(await page.locator('.game').count()===9,'all nine games available after offline reload');
 await page.evaluate(()=>start('radar',false));await page.locator('[data-a="open"]').click();ok(await page.locator('[data-a="select"]').count()===3,'offline play includes choices and pass');
 if(width===320){await page.evaluate(()=>{run=null;go('home');});await page.screenshot({path:'/tmp/paros-home.png',fullPage:true});}
 ok(errors.length===0,`${width}px: no JavaScript errors: ${errors.join(';')}`);ok(external.length===0,`${width}px: no external requests or answer transmission`);
 await context.close();}
 console.log(`\n${count} Páros est checks passed.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
