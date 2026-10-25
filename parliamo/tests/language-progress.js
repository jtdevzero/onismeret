#!/usr/bin/env node
/* Three languages may reuse serial IDs, but their chapter/shadowing progress must remain separate. */
const assert=require('node:assert/strict'),{chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.join(ROOT,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
let browser,count=0;function check(value,title){assert.ok(value,title);count++;console.log('  ✓ '+title);}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(()=>{if(localStorage.getItem('parliamo.v1'))return;localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en',sound:false},ser:{s1:{0:{ok:2,n:2,d:1}},s2:{0:{ok:2,n:2,d:1}},s3:{0:{ok:2,n:2,d:1}}},shadow:{'ser-s1-0':8,'ser-s2-0':4,'ser-s3-0':5,'st-en-s1':3,'st-s1':6,'pod-it-p1':2,'pod-es-p1':7}}));});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForSelector('#hRound');
  const legacy=await page.evaluate(()=>JSON.stringify({ser:S.ser,shadow:S.shadow}));
  check(await page.evaluate(()=>Object.keys(serOf('s1')).length===0),'ambiguous legacy serial s1 does not unlock English chapters');
  check(await page.evaluate(()=>serOf('s2')[0]?.ok===2&&serOf('s3')[0]?.ok===2),'uniquely English legacy serials retain their results');
  check(await page.evaluate(()=>shadowProgress('ser-s1-0')===0&&shadowProgress('ser-s2-0')===4&&shadowProgress('ser-s3-0')===5),'only unambiguous legacy serial shadowing counts');
  check(await page.evaluate(()=>shadowProgress('st-en-s1')===3&&shadowProgress('st-s1')===0&&shadowProgress('pod-it-p1')===0),'legacy short-story and podcast shadowing keep their language');
  for(const l of ['en','it','es']){
    if(l!=='en')await page.evaluate(l=>switchLang(l),l);
    await page.evaluate(()=>{go('gyakorlas');renderSerials();});await page.waitForSelector('[data-ser="s1"]');await page.click('[data-ser="s1"]');
    check(await page.locator('[data-ch="1"]').isDisabled(),`${l}: other languages do not unlock chapter 2`);
    await page.click('[data-ch="0"]');check(await page.evaluate(()=>![...view.querySelectorAll('[data-sq]')].some(el=>el.hasAttribute('lang'))),`${l}: Hungarian comprehension questions inherit the Hungarian interface language`);const answers=await page.evaluate(()=>SER.s.chapters[0].questions.map(q=>q.a));
    for(let j=0;j<answers.length;j++)await page.click(`[data-sq="${j}"][data-o="${answers[j]}"]`);
    check(await page.evaluate(l=>S.ser[l+':s1']?.[0]?.ok===SER.s.chapters[0].questions.length,l),`${l}: chapter result is written with its language`);
    await page.evaluate(()=>openSerial('s1'));
    check(!await page.locator('[data-ch="1"]').isDisabled(),`${l}: the completed chapter unlocks its own next chapter`);
    check(await page.evaluate(()=>shadowProgress('ser-s1-0')===0),`${l}: another language's shadowing remains unseen`);
    await page.evaluate(async()=>{await loadExtra('serials');const src=shSources().find(s=>s.id==='ser-s1-0');SH={src,l:lang(),n:3};shFinish();});
    check(await page.evaluate(l=>S.shadow[l+':ser-s1-0']===3&&shadowProgress('ser-s1-0')===3,l),`${l}: shadowing result is written with its language`);
    if(l==='it')check(await page.evaluate(()=>shadowProgress('st-s1')===6&&shadowProgress('pod-it-p1')===2&&shadowProgress('st-en-s1')===0),'Italian legacy story and podcast results remain readable only in Italian');
    if(l==='es')check(await page.evaluate(()=>shadowProgress('pod-es-p1')===7&&shadowProgress('st-s1')===0),'Spanish legacy podcast remains readable only in Spanish');
  }
  check(await page.evaluate(()=>['en','it','es'].every(l=>S.ser[l+':s1']?.[0]&&S.shadow[l+':ser-s1-0']===3)),'all three languages retain independent results');
  check(await page.evaluate(legacy=>JSON.stringify({ser:Object.fromEntries(Object.entries(S.ser).filter(([k])=>!k.includes(':'))),shadow:Object.fromEntries(Object.entries(S.shadow).filter(([k])=>!k.includes(':')))})===legacy,legacy),'ambiguous original progress remains stored without destructive migration');
  await page.evaluate(()=>go('ma'));await page.reload();await page.waitForSelector('#hRound');check(await page.evaluate(()=>lang()==='es'&&serOf('s1')[0]?.ok>0&&shadowProgress('ser-s1-0')===3),'separate progress survives reload');
  check(errors.length===0,'no uncaught errors: '+errors.join('; '));await context.close();console.log(`\n${count} language-progress checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
