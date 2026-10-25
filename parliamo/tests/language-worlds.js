#!/usr/bin/env node
/* Built app: language themes, real bundled artwork, mobile layout and the illustrated serial. */
const assert=require('node:assert/strict'),{chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'artifacts','language-worlds');
const TYPES={'.html':'text/html; charset=utf-8','.json':'application/json','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.join(ROOT,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
let browser,count=0;const errors=[];
function check(v,title){assert.ok(v,title);count++;console.log('  ✓ '+title);}
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const url=`http://127.0.0.1:${server.address().port}/`,colours=new Set();
  for(const l of ['en','it','es'])for(const v of [{name:'desktop',width:1280,height:1000},{name:'mobile',width:390,height:844},{name:'dark',width:390,height:844,dark:true}]){
    const ctx=await browser.newContext({viewport:{width:v.width,height:v.height},colorScheme:v.dark?'dark':'light',serviceWorkers:'block'});
    await ctx.addInitScript(({l,dark})=>localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:l,theme:dark?'dark':'light',sound:false}})),{l,dark:!!v.dark});
    const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForSelector('#hRound');
    await p.waitForFunction(()=>{const img=document.querySelector('.world-landmark img');return img&&img.complete&&img.naturalWidth>0;});await p.evaluate(()=>document.fonts.ready);
    const layout=await p.evaluate(()=>({lang:document.documentElement.dataset.learnLang,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,image:document.querySelector('.world-landmark img').getAttribute('src'),colour:getComputedStyle(document.documentElement).getPropertyValue('--cobalt').trim(),ctaBottom:document.querySelector('#hRound').getBoundingClientRect().bottom,navTop:document.querySelector('#bnav').getBoundingClientRect().top}));
    check(layout.lang===l&&layout.image===`img/world-${l}.webp`,`${l} ${v.name}: language theme and actual artwork load`);
    check(layout.scrollWidth<=layout.width,`${l} ${v.name}: no horizontal overflow`);
    if(v.name==='mobile')check(layout.ctaBottom<layout.navTop,`${l}: daily action stays above the mobile navigation`);
    if(v.name==='desktop')colours.add(layout.colour);
    await p.screenshot({path:path.join(OUT,`${l}-${v.name}.png`),fullPage:true});
    if(v.name==='mobile')await p.screenshot({path:path.join(OUT,`${l}-preview.png`)});
    if(l==='en'&&v.name==='mobile'){
      await p.click('#langBtn');await p.click('[data-lang="it"]');await p.waitForFunction(()=>lang()==='it'&&document.querySelector('.world-landmark img')?.getAttribute('src')==='img/world-it.webp');
      check(await p.evaluate(()=>document.documentElement.dataset.learnLang==='it'),'language menu changes the theme and homepage together');
      await p.click('#langBtn');await p.click('[data-lang="en"]');await p.waitForFunction(()=>lang()==='en'&&document.querySelector('#hRound'));
      await p.waitForFunction(()=>!document.querySelector('#toast')||document.querySelector('#toast').hidden);
      await p.evaluate(()=>{go('gyakorlas');renderSerials();});await p.waitForSelector('[data-ser="s3"]');await p.click('[data-ser="s3"]');
      await p.locator('.serial-intro [data-story-atlas]').scrollIntoViewIfNeeded();await p.waitForSelector('.serial-intro .is-atlas');
      await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(OUT,'archive-chapters.png'),fullPage:true});
      await p.click('[data-ch="0"]');
      for(let k=0;k<6;k++){
        await p.locator('.serial-chapter-scene [data-story-atlas]').scrollIntoViewIfNeeded();await p.waitForSelector('.serial-chapter-scene .is-atlas');
        const scene=await p.locator('.serial-chapter-scene .is-atlas').evaluate(el=>({position:el.style.backgroundPosition,size:el.style.backgroundSize,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,alt:el.getAttribute('aria-label')}));
        check(scene.position===`${k%3*50}% ${Math.floor(k/3)*100}%`&&scene.size==='300% 200%'&&Math.abs(scene.width-scene.height)<1&&scene.alt.length>20,`archive chapter ${k+1}: correct square scene and accessible description`);
        check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`archive chapter ${k+1}: fits mobile width`);
        if(k===0||k===5){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(OUT,`archive-chapter-${k+1}.png`),fullPage:true});await p.screenshot({path:path.join(OUT,`archive-preview-${k+1}.png`)});}
        const answers=await p.evaluate(()=>SER.s.chapters[SER.k].questions.map(q=>q.a));
        for(let j=0;j<answers.length;j++)await p.click(`[data-sq="${j}"][data-o="${answers[j]}"]`);
        if(k<5)await p.click('#chNext');
      }
      check(await p.evaluate(()=>Object.keys(S.ser['en:s3']).length===6),'all six illustrated chapters remain playable and save their results');
    }
    await ctx.close();
  }
  check(colours.size===3,'all three languages have distinct primary colours');check(errors.length===0,'no uncaught UI errors: '+errors.join('; '));
  console.log(`\n${count} language-world checks passed. Screenshots: ${OUT}`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
