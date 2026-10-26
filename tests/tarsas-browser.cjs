#!/usr/bin/env node
'use strict';
/* Production-script browser smoke/interaction tests. Uses the repository's existing
   Playwright dependency. Run: PW_CHROMIUM=/usr/bin/chromium node tests/tarsas-browser.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const filename=path.resolve(ROOT,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!filename.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(filename,(error,body)=>{if(error){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);});
});
const GAME_KEYS=['impostor','never','likely','bomb','wolf','codes','taboo','act','wave','story','bluff','scale','estimate','dreams'];
let assertions=0;
function check(condition,message){assert(condition,message);assertions++;console.log('✓ '+message);}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
  try{
    for(const width of [320,390]){
      const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
      const page=await context.newPage(),errors=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('request',request=>{if(!request.url().startsWith(origin)&&!request.url().startsWith('data:')&&!request.url().startsWith('blob:'))external.push(request.url());});
      page.on('dialog',dialog=>dialog.accept());
      await page.goto(origin+'/tarsas/');
      await page.waitForFunction(()=>typeof GAMES!=='undefined'&&Object.keys(GAMES).length===14);
      check(await page.locator('.game').count()===14,width+'px: all fourteen game cards render');
      await page.evaluate(()=>{S.players=['Anna','Béla','Csilla','Dani','Eszter','Feri'];S.settings.sound=false;S.settings.tts=false;save();render();});
      for(const key of GAME_KEYS){
        await page.evaluate(key=>go(key),key);
        await page.waitForTimeout(30);
        const bounds=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,win:innerWidth,app:document.getElementById('app').innerText}));
        check(bounds.doc<=bounds.win+1,width+'px: '+key+' setup has no horizontal overflow');
        check(bounds.app.length>30&&!/undefined|NaN/.test(bounds.app),width+'px: '+key+' setup has valid content');
      }
      for(const key of GAME_KEYS){
        await page.evaluate(key=>{
          go(key);
          if(key==='impostor'){A.impStart();A.dealShow();}
          else if(key==='never'){A.neverStart();}
          else if(key==='likely'){A.likelyStart();}
          else if(key==='bomb'){A.bombArm();}
          else if(key==='wolf'){A.wolfStart();A.dealShow();}
          else if(key==='codes'){A.codesNew();}
          else if(key==='taboo'||key==='act'){A.partyStart(key);A.partyBegin(key);}
          else if(key==='wave'){A.waveStart();A.dealShow();}
          else if(key==='story'){A.storyStart();A.storyShow();}
          else if(key==='bluff'){A.bluffStart();A.bluffOpen();}
          else if(key==='scale'){A.scaleStart();A.scaleShow();}
          else if(key==='estimate'){A.estimateStart();A.estimateShow();}
          else if(key==='dreams'){A.dreamStart();A.dreamOpen();}
          save();render();
        },key);
        const bounds=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,win:innerWidth,app:document.getElementById('app').innerText}));
        check(bounds.doc<=bounds.win+1,width+'px: '+key+' active game has no horizontal overflow');
        check(bounds.app.length>30&&!/undefined|NaN/.test(bounds.app),width+'px: '+key+' starts with valid content');
      }
      // Real DOM form interactions: a complete private story, escaped on reveal.
      await page.evaluate(()=>{S.players=['Anna','Béla','Csilla'];R.games.story={phase:'setup',rounds:1};go('story');});
      await page.locator('[data-a="storyStart"]').click();
      for(const sentence of ['<img src=x onerror=alert(1)> Első mondat.','Második mondat.','Harmadik mondat.']){
        await page.locator('[data-a="storyShow"]').click();
        await page.locator('#storySentence').fill(sentence);
        await page.locator('form[data-a="storySubmit"] button').click();
      }
      check(await page.evaluate(()=>R.games.story.phase)==='end',width+'px: story completes through touch/form controls');
      check(await page.locator('#app img[src="x"]').count()===0,width+'px: story author text is escaped');
      // Native browser history returns to the previous app view.
      await page.evaluate(()=>go('home'));
      await page.locator('.game[data-v="wave"]').click();
      await page.goBack();
      check(await page.evaluate(()=>R.view)==='home',width+'px: browser Back returns to app home');
      if(width===390){
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:'/tmp/tarsas-home-390.png',fullPage:true});
        await page.evaluate(()=>{R.games.estimate={phase:'setup',rounds:3};go('estimate');});
        await page.locator('[data-a="estimateStart"]').click();
        for(const guess of ['60','68','64']){
          await page.locator('[data-a="estimateShow"]').click();
          await page.locator('#estimate-answer').fill(guess);
          await page.locator('form[data-a="estimateAnswer"] button').click();
        }
        check(await page.evaluate(()=>R.games.estimate.phase)==='reveal','numeric game completes private guesses through browser forms');
        await page.screenshot({path:'/tmp/tarsas-estimate-390.png',fullPage:true});
        // Service worker and complete script shell must make a fresh page load usable offline.
        await page.evaluate(()=>navigator.serviceWorker.ready);
        await page.reload();
        await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
        await context.setOffline(true);
        await page.reload();
        check(await page.evaluate(()=>Object.keys(GAMES).length)===14,'offline reload loads all fourteen games');
        await page.evaluate(()=>go('home'));
        check(await page.locator('.game').count()===14,'offline home and navigation remain usable');
        await page.evaluate(()=>{go('dreams');A.dreamStart();A.dreamOpen();save();render();});
        check(await page.locator('.dream-art').count()===4,'offline Álomképek hand shows four illustrated cards');
        const atlas=await page.evaluate(async()=>{const r=await fetch('images/dreams-atlas.webp');return r.ok&&(await r.blob()).size>1000;});
        check(atlas,'all24 dream illustrations are available offline');
        await page.screenshot({path:'/tmp/alomkepek-preview.png',fullPage:true});
        await context.setOffline(false);
      }
      check(errors.length===0,width+'px: no browser JavaScript errors ('+errors.join('; ')+')');
      check(external.length===0,width+'px: gameplay sends no external requests');
      await context.close();
    }
    console.log('\n'+assertions+' Társasest browser assertions passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
