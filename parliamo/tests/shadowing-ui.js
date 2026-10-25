#!/usr/bin/env node
/* Source filters, mobile speech controls, local recording lifecycle and real audio progress. */
const assert=require('node:assert/strict'),{chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://local').pathname),f=path.join(ROOT,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
let browser,count=0;const errors=[];function check(v,title){assert.ok(v,title);count++;console.log('  ✓ '+title);}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--no-proxy-server']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  const uploads=[];p.on('request',r=>{if(r.method()!=='GET'&&r.method()!=='HEAD')uploads.push(r.url());});
  await ctx.addInitScript(()=>{localStorage.setItem('parliamo.v1',JSON.stringify({onboarded:true,settings:{lang:'en',sound:false}}));window.SpeechRecognition=class {};});
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.waitForSelector('#hRound');
  await p.evaluate(()=>{go('gyakorlas');renderShadow();});await p.waitForSelector('#shLevelFilter');
  check(await p.locator('[data-sh]').count()===51,'all 51 sources appear by default');
  check(await p.evaluate(()=>shSources()[0].level)==='A1','beginner sources are first');
  await p.selectOption('#shLevelFilter','A1');
  check(await p.locator('[data-sh]').count()===await p.evaluate(()=>shSources().filter(s=>s.level==='A1').length),'level filter exposes every A1 source');
  await p.selectOption('#shTypeFilter','story');
  check(await p.locator('[data-sh]').count()>0&&await p.evaluate(()=>[...view.querySelectorAll('[data-sh]')].every(b=>shSources().find(s=>s.id===b.dataset.sh).type==='story')),'type and level filters combine');
  await p.selectOption('#shLevelFilter','all');await p.selectOption('#shTypeFilter','all');
  const unsafe=await p.evaluate(()=>{STORIES[0].title='<img src=x onerror="window.__unsafeSpeech=1">';renderShadowNow();return 'st-'+STORIES[0].id;});
  check(await p.locator(`[data-sh="${unsafe}"] b`).innerText()==='<img src=x onerror="window.__unsafeSpeech=1">'&&!await p.evaluate(()=>window.__unsafeSpeech),'source titles render as escaped text');
  await p.evaluate(()=>{
    window.__micRequests=0;window.__stoppedTracks=0;
    const sr=16000,n=sr*2,wav=new DataView(new ArrayBuffer(44+n*2)),write=(o,s)=>[...s].forEach((c,i)=>wav.setUint8(o+i,c.charCodeAt(0)));
    write(0,'RIFF');wav.setUint32(4,36+n*2,true);write(8,'WAVEfmt ');wav.setUint32(16,16,true);wav.setUint16(20,1,true);wav.setUint16(22,1,true);wav.setUint32(24,sr,true);wav.setUint32(28,sr*2,true);wav.setUint16(32,2,true);wav.setUint16(34,16,true);write(36,'data');wav.setUint32(40,n*2,true);for(let i=0;i<n;i++)wav.setInt16(44+i*2,Math.sin(2*Math.PI*180*i/sr)*18000,true);
    window.__audioBlob=new Blob([wav.buffer],{type:'audio/wav'});
    navigator.mediaDevices.getUserMedia=async()=>{window.__micRequests++;return {getTracks:()=>[{stop(){window.__stoppedTracks++;}}]};};
    window.MediaRecorder=class{constructor(){this.state='inactive';this.mimeType='audio/wav';}start(){this.state='recording';}stop(){if(this.state==='inactive')return;this.state='inactive';queueMicrotask(()=>{this.ondataavailable({data:window.__audioBlob});this.onstop();});}};
    player.muted=true;
  });
  await p.locator('[data-sh]').first().click();await p.waitForSelector('#shRec');
  check(await p.evaluate(()=>window.__micRequests)===0,'opening a sentence requests no microphone permission');
  check(await p.evaluate(()=>document.querySelector('.big-q').getBoundingClientRect().top<document.querySelector('.speech-guide').getBoundingClientRect().top&&!document.querySelector('.speech-guide').open),'sentence and main controls precede a collapsed guide');
  await p.click('#shRec');await p.waitForSelector('#shTimer');
  await p.waitForFunction(()=>/0:01/.test(document.querySelector('#shTimer').textContent));
  check(await p.locator('#shLevel').count()===1&&await p.evaluate(()=>window.__micRequests)===1,'record click starts the timer and local level meter with one permission request');
  await p.click('#shRec');await p.waitForSelector('#shInto svg');
  check(await p.evaluate(()=>window.__stoppedTracks===1&&!SH.stream&&!SH.rec),'stopping recording releases the microphone stream');
  await p.click('#shMine');await p.waitForFunction(()=>player.currentSrc===SH.url&&Number.isFinite(player.duration)&&player.duration>0);
  const playback=await p.evaluate(()=>{player.pause();player.currentTime=player.duration/2;player.dispatchEvent(new Event('timeupdate'));return {progress:document.querySelector('#shPlaybackProgress').value,cursor:+document.querySelector('[data-intonation-cursor]').getAttribute('x1'),visible:document.querySelector('[data-intonation-cursor]').getAttribute('visibility'),clock:document.querySelector('#shPlaybackClock').textContent};});
  check(Math.abs(playback.progress-.5)<.02&&Math.abs(playback.cursor-160)<4&&playback.visible==='visible'&&/Saját felvétel/.test(playback.clock),'progress and curve cursor use the actual audio playhead');
  await p.waitForTimeout(250);
  check(await p.evaluate(()=>player.currentSrc===SH.url&&!SH.compareTimer),'a delayed automatic comparison cannot replace explicit own-recording playback');
  check(!/Hasonlóság:\s*\d+%/.test(await p.locator('#shInto').innerText()),'intonation never presents raw correlation as a quality percentage');
  await p.click('#shNext');await p.click('#shRec');await p.waitForSelector('#shTimer');await p.click('#shNext');
  check(await p.evaluate(()=>SH.i===2&&!SH.url&&!SH.rec&&!SH.stream&&window.__stoppedTracks===2),'changing sentences discards a pending take and releases its microphone');
  await p.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>window.__grantLater=resolve);});
  await p.click('#shRec');await p.waitForFunction(()=>SH.busy);await p.click('#shNext');
  await p.evaluate(()=>window.__grantLater({getTracks:()=>[{stop(){window.__stoppedTracks++;}}]}));
  await p.waitForFunction(()=>window.__stoppedTracks===3);
  check(await p.evaluate(()=>SH.i===3&&!SH.busy&&!SH.rec&&!SH.stream),'late microphone permission after a sentence change releases the unused stream');
  await p.evaluate(()=>{go('gyakorlas');renderPron();});await p.locator('[data-s]').first().click();await p.click('#prMode [data-v="sent"]');
  check(await p.evaluate(()=>document.querySelector('.big-q').getBoundingClientRect().top<document.querySelector('[data-pr-guide]').getBoundingClientRect().top&&!document.querySelector('[data-pr-guide]').open&&!!document.querySelector('.speech-controls #prMic')),'pronunciation sentence and microphone remain before the collapsed mode-specific guide');
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'speech views fit a narrow mobile viewport');
  check(uploads.length===0,'shadowing sends no recordings or other requests to a server');
  check(errors.length===0,'no uncaught speech UI errors: '+errors.join('; '));
  console.log(`\n${count} shadowing UI checks passed.`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
