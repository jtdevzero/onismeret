#!/usr/bin/env node
/* Actual language menu with delayed/failed fetches: labels, words, navigation and progress stay aligned. */
const assert=require('node:assert/strict'),{chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.join(ROOT,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
let browser,count=0;const errors=[];function check(v,title){assert.ok(v,title);count++;console.log('  ✓ '+title);}
function gate(){let release;return {wait:new Promise(r=>release=r),release:()=>release()};}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  await ctx.addInitScript(()=>{if(!localStorage.getItem('parliamo.v1'))localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en',sound:false}}));});
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.waitForSelector('.wotd .word');
  await p.evaluate(()=>{window.__switches=[];const original=switchLang;switchLang=to=>{const job=original(to);window.__switches.push(job);return job;};const id=WORDS[0].id;window.__savedEnglishCard=id;S.cards[id]={s:2,due:today(),last:Date.now()};save();});
  let italianGate=gate(),spanishGate=null,failItalian=false;
  await p.route('**/data/it.json',async route=>{if(failItalian)return route.abort('failed');if(italianGate)await italianGate.wait;return route.fulfill({path:path.join(ROOT,'data/it.json'),contentType:'application/json'});});
  await p.route('**/data/es.json',async route=>{if(spanishGate)await spanishGate.wait;return route.fulfill({path:path.join(ROOT,'data/es.json'),contentType:'application/json'});});
  const select=async l=>{await p.click('#langBtn');await p.click(`[data-lang="${l}"]`);};
  const verify=async(l,title)=>{
    const state=await p.evaluate(()=>({lang:lang(),course:COURSE_LANG,ready:courseReady(),word:wordOfDay(),shown:document.querySelector('.wotd .word')?.textContent,label:document.querySelector('.wotd .label')?.textContent,markupLang:document.querySelector('.wotd .word')?.getAttribute('lang'),spoken:document.querySelector('.wotd [data-say]')?.dataset.say,allWordsMatch:WORDS.filter(w=>!w.own&&!w.core).every(w=>langOf(w.id)===lang())}));
    check(state.lang===l&&state.course===l&&state.ready&&state.allWordsMatch&&state.shown===state.word.it&&state.spoken===state.word.it&&state.markupLang===l&&state.label===`A nap szava · ${title}`,`${title}: selected course, word, Hungarian label and playback text agree`);
  };
  await verify('en','Angol');
  await select('it');await p.waitForFunction(()=>COURSE_LOADING&&lang()==='it');
  await select('en');await p.waitForFunction(()=>courseReady()&&lang()==='en');const before=await p.evaluate(()=>JSON.stringify({lessons:LESSONS.map(l=>l.id),word:wordOfDay(),audio:AUDIO_IDX}));
  italianGate.release();await p.evaluate(()=>Promise.all(window.__switches));italianGate=null;
  check(await p.evaluate(()=>JSON.stringify({lessons:LESSONS.map(l=>l.id),word:wordOfDay(),audio:AUDIO_IDX}))===before,'late Italian fetch cannot replace the newer English course or daily word');
  check(await p.evaluate(()=>S.cards[window.__savedEnglishCard]?.s===2),'late stale load cannot delete saved English progress');await verify('en','Angol');
  spanishGate=gate();await select('es');await p.waitForFunction(()=>COURSE_LOADING&&lang()==='es');await p.click('#bnav [data-go="leckek"]');
  check(await p.locator('.wotd').count()===0&&await p.locator('#view').innerText().then(t=>t.includes('Spanyol tananyag betöltése')),'navigation during loading shows a barrier instead of old-language content');
  spanishGate.release();await p.evaluate(()=>Promise.all(window.__switches));spanishGate=null;await p.waitForSelector('#lSearch');
  check(await p.evaluate(()=>route==='leckek'&&LESSONS.every(l=>l.id.startsWith('es-'))),'latest course completion retains the lesson route chosen during loading');
  await p.click('#bnav [data-go="ma"]');await verify('es','Spanyol');
  failItalian=true;await select('it');await p.evaluate(()=>Promise.all(window.__switches));await p.waitForSelector('#courseRetry');
  check(await p.locator('.wotd').count()===0&&await p.evaluate(()=>lang()==='it'&&!courseReady()),'failed Italian switch exposes a retry instead of Spanish words under an Italian header');
  failItalian=false;await p.click('#courseRetry');await p.evaluate(()=>Promise.all(window.__switches));await p.waitForSelector('.wotd .word');await verify('it','Olasz');
  await p.reload();await p.waitForSelector('.wotd .word');await verify('it','Olasz');
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'language-switch and retry views fit a mobile viewport');check(errors.length===0,'no uncaught language-switching errors: '+errors.join('; '));
  await ctx.close();console.log(`\n${count} language-switching browser checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
