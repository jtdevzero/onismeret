#!/usr/bin/env node
/* First-use and placement regression tests. Run after python3 parliamo/build.py. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html; charset=utf-8','.json':'application/json','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'};
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM,args:['--no-proxy-server']}:{args:['--no-proxy-server']});
  try{
    for(const language of ['en','it','es']){
      const context=await browser.newContext({viewport:{width:390,height:860},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
      p.on('pageerror',e=>errors.push(e.message));
      await p.goto(`http://127.0.0.1:${server.address().port}/`);
      await p.click(`[data-l="${language}"]`);await p.click('[data-v="new"]');
      assert.equal(await p.locator('[data-g]').count(),0,'daily goal comes after the sample');
      await p.click('#sampleStart');
      const wrong=await p.evaluate(()=>[...document.querySelectorAll('[data-sample-o]')].find(b=>b.textContent!==OB.c.hu).dataset.sampleO);
      await p.click(`[data-sample-o="${wrong}"]`);
      assert.match(await p.locator('#sampleFeedback').innerText(),/Nézzük meg együtt/);
      await p.click('#sampleNext');assert.equal(await p.locator('#sampleCheck').isDisabled(),true);
      await p.fill('#sampleAnswer','wrong answer');await p.click('#sampleCheck');
      assert.equal(await p.locator('#sampleNext').isHidden(),true,'wrong typed answer gets a second attempt');
      await p.fill('#sampleAnswer',await p.evaluate(()=>OB.c.it));await p.click('#sampleCheck');await p.click('#sampleNext');
      await p.click('#sampleGoal');await p.click('[data-g="50"]');
      assert.deepEqual(await p.evaluate(()=>({onboarded:S.onboarded,l:lang(),sample:!!S.onboardingSample[lang()]})),{onboarded:true,l:language,sample:true});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'sample and home fit mobile viewport');
      if(language==='en'){
        await p.evaluate(()=>startPlacement(false));
        assert.deepEqual(await p.evaluate(()=>({n:PL.qs.length,typed:PL.qs.filter(q=>q.t==='type').length,listening:PL.qs.filter(q=>q.t==='listen').length})),{n:6,typed:2,listening:1});
        assert.equal(await p.evaluate(()=>new Set(PL.qs.map(q=>q.c.li)).size>1),true,'placement samples several topics');
        assert.equal(await p.evaluate(()=>PL.qs.filter(q=>q.c.ph).length),3,'placement balances words and phrases');
        for(let k=0;k<6;k++){
          const e=await p.evaluate(()=>{const q=PL.qs[PL.i];return {t:q.t,answer:q.ans,option:q.opts&&q.opts.indexOf(q.ans)};});
          if(e.t==='type'){await p.fill('#placeAnswer',e.answer[0]);await p.click('#placeSubmit');}
          else if(e.t==='listen'){await p.click('#placeNoAudio');const option=await p.evaluate(()=>PL.qs[PL.i].opts.indexOf(PL.qs[PL.i].ans));await p.click(`[data-o="${option}"]`);}
          else await p.click(`[data-o="${e.option}"]`);
        }
        assert.equal(await p.evaluate(()=>PL.levels[PL.li]),'A2');
        for(let k=0;k<6;k++)await p.click('#placeUnknown');
        assert.deepEqual(await p.evaluate(()=>({start:S.placement.en.startLevel,completed:doneCount(),skipped:LESSONS.filter((L,i)=>ls(i)?.placed).length>0,next:LESSONS[nextLesson()].level,audio:S.placement.en.withoutAudio})),{start:'A2',completed:0,skipped:true,next:'A2',audio:true});
        assert.match(await p.locator('#view').innerText(),/nem hivatalos/);
        await p.evaluate(()=>{S.lessons[LESSONS[0].id]={done:true,best:95,day:today()};startPlacement(false);});
        for(let k=0;k<6;k++){
          const e=await p.evaluate(()=>{const q=PL.qs[PL.i];return {t:q.t,option:q.opts&&q.opts.indexOf(q.ans)};});
          if(e.t==='type')await p.click('#placeUnknown');else await p.click(`[data-o="${e.option}"]`);
        }
        assert.deepEqual(await p.evaluate(()=>({start:S.placement.en.startLevel,typed:S.placement.en.results[0].typed,passed:S.placement.en.results[0].passed,done:doneCount(),skipped:LESSONS.some((L,i)=>ls(i)?.placed)})),{start:'A1',typed:0,passed:false,done:1,skipped:false},'recognition alone cannot skip a band; real completion survives re-placement');
      }
      assert.deepEqual(errors,[],language+' has no browser errors');await context.close();
      console.log('✓ onboarding and placement:',language);
    }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
