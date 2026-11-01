#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let file;try{const u=new URL(req.url,'http://localhost');file=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));}catch{res.writeHead(400).end();return;}if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error)res.writeHead(404).end();else res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data);});});
let count=0;function ok(value,message){assert(value,message);count++;console.log('✓ '+message);}
{const html=fs.readFileSync(path.join(ROOT,'paros/index.html'),'utf8'),sw=fs.readFileSync(path.join(ROOT,'paros/sw.js'),'utf8');const refs=[...html.matchAll(/(?:href|src)="([\w./-]+\.(?:css|js))\?v=(\d+)"/g)];
 ok(refs.length>=4&&refs.every(m=>sw.includes(`'${m[1]}?v=${m[2]}'`)),'service worker precaches exactly the asset versions index.html loads');}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{for(const width of [320,880]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});page.on('dialog',d=>d.accept());
 await page.goto(origin+'/paros/');await page.waitForSelector('.game');
 ok(await page.locator('.game').count()===14,`${width}px: fourteen separate pair games`);
 ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px: home fits viewport`);
 if(width===320)ok(await page.evaluate(()=>document.documentElement.scrollHeight<=4200&&document.querySelector('.game').getBoundingClientRect().height<=160),'320px: compact game cards keep the home page short');
 ok(await page.evaluate(()=>{updateReady=true;render();const shown=!!document.querySelector('.update-banner');updateReady=false;render();return shown;}),`${width}px: an update banner can be shown on the home page`);
 for(const mode of ['closer','radar','truth','match','honest','quiz','memories','future','bucket','spin','scene','dice','wish','jackpot']){await page.evaluate(m=>go(m),mode);ok(await page.locator('h1').innerText()!==''&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${mode} setup and layout`);}
 ok(await page.evaluate(()=>cardCount()===1488),'all 1424 base and extra cards counted once');
 ok(await page.evaluate(()=>Object.keys(GAMES).every(k=>packsFor(k).every(p=>[...(p.items||[]),...(p.truth||[]),...(p.dare||[])].every(c=>typeof c.t==='string'&&c.t&&[1,2,3].includes(c.lvl)&&c.tags.every(t=>TAGS.has(t))&&(!c.opts||c.opts.length===2))))),'every card normalises with text, level and known tags');
 ok(await page.evaluate(()=>window.PAIR_LINES('Csókold meg tíz másodpercig. ~10 #erintes !3\nSima sor').every((c,i)=>i?c==='Sima sor':c.t==='Csókold meg tíz másodpercig.'&&c.sec===10&&c.lvl===3&&c.tags[0]==='erintes')),'card line markers parse and strip correctly');
 ok(await page.evaluate(()=>{const cards=Object.keys(GAMES).filter(k=>k!=='scene').flatMap(k=>packsFor(k)).filter(p=>p.lvl===3).flatMap(p=>[...(p.items||[]),...(p.truth||[]),...(p.dare||[])]);const txt=c=>[c.t,...(c.opts||[])].join(' ');
  const guard=[[/\banál|popsidugó|fenékjáték/i,'anal'],[/fotó|videó|képet|képek/i,'foto'],[/hármas/i,'harmadik'],[/kötöz|kikötö|bilincs|nyakörv|rabszolg/i,'kotozes'],[/paskol|fenekel|harap|karmol/i,'fajdalom']];
  return cards.length===620&&cards.every(c=>guard.every(([re,tag])=>!re.test(txt(c))||c.tags.includes(tag)));}),'spicy cards carry the limit tags their text implies');
 ok(await page.evaluate(()=>Object.keys(GAMES).flatMap(k=>packsFor(k)).flatMap(p=>[...(p.items||[]),...(p.dare||[])]).filter(c=>/(egy|két|fél|tíz) (teljes )?(percig|másodpercig)/.test(c.t)&&/^(Nyúlj|Lovagolj|Csókold|A másik|Kösd|Vetkőztessétek|Simogasd|Kényeztes|Ülj|Szívd|Dörzsöld|Nyúlj)/.test(c.t)).every(c=>c.sec>0)),'timed spicy dares carry a duration');
 ok(await page.evaluate(()=>{const l=packsFor('closer')[0].items.map(c=>c.lvl);return [1,2,3].every(v=>l.filter(x=>x===v).length===16);}),'closer cards are split into three intensity levels');
 await page.evaluate(()=>{run=null;adult=false;go('radar');});await page.selectOption('#round-length','4');await page.selectOption('#pack-select','chemistry');
 ok(await page.locator('#round-length').inputValue()==='4','pack change preserves selected round length');
 ok(await page.locator('input[name="adult"]').count()===1,'adult radar pack requires confirmation');
 await page.evaluate(()=>start('radar',false,4,'chemistry'));ok(await page.evaluate(()=>run===null),'adult pack cannot bypass confirmation via a nonadult base game');
 await page.locator('input[name="adult"]').check();await page.locator('form[data-a="start"] button').click();
 ok(await page.evaluate(()=>run.adult&&run.packId==='chemistry'&&run.deck.every(c=>PACKS.radar[0].items.some(x=>x[0]===c.t))),'radar uses only selected adult pack');
 await page.evaluate(()=>{A.adultOff();render();});ok(await page.evaluate(()=>run===null&&!adult),'disabling18+ clears adult pack in otherwise nonadult radar');
 for(const [key,id] of [['truth','spark'],['honest','intimacy'],['match','desires']]){
 await page.evaluate(k=>{run=null;adult=false;go(k);},key);await page.selectOption('#pack-select',id);await page.selectOption('#round-length',key==='match'?'4':'6');await page.locator('input[name="adult"]').check();await page.locator('form[data-a="start"] button').click();
 ok(await page.evaluate(pack=>run.packId===pack,id),key+' starts selected18+ pack');
 if(key==='match'){for(let p=0;p<2;p++){await page.locator('[data-a="open"]').click();for(let i=0;i<4;i++){await page.locator(`[data-a="select"][data-v="${p===0?i-1:0}"]`).click();await page.locator('[data-a="confirm"]').click();}}ok(await page.evaluate(()=>run.rows.length===1&&run.answers.every(a=>a.length===0)),'adult matching reveals only common yes and deletes individual choices');}
 else {for(let i=0;i<6;i++){if(key==='truth')await page.locator(`[data-a="draw"][data-v="${i%2?'dare':'truth'}"]`).click();await page.locator('[data-a="next"]').click();}ok(await page.evaluate(()=>run.phase==='result'&&run.count===6),key+' adult pack completes with correct deck');}
 await page.locator('[data-a="restart"]').click();ok(await page.evaluate(pack=>run.packId===pack&&run.deck.length===(run.key==='match'?4:6),id),key+' restart preserves pack and length');}
 await page.evaluate(()=>{run=null;adult=false;Object.keys(packChoice).forEach(k=>delete packChoice[k]);Object.keys(roundChoice).forEach(k=>delete roundChoice[k]);go('home');});
 await page.evaluate(()=>go('home'));const heroH=await page.locator('.hero-actions .btn.primary').evaluate(e=>e.getBoundingClientRect().height);ok(heroH>=44&&heroH<=(width<=360?84:60),`${width}px: hero button has a normal height (${heroH})`);
 const entry=await page.locator('.adult-entry').boundingBox();ok(entry.height>=44&&entry.width>=44,`${width}px: 18+ entry is a real touch target`);
 await page.getByRole('button',{name:'18+ játékok és mocskos csomagok',exact:true}).click();ok(await page.locator('.game').count()===9,'adult filter includes adult packs without locking their base game');
 ok(await page.locator('.adult-banner').isVisible()&&(await page.locator('.game[href="#truth"]').innerText()).includes('Mocskos'),'adult filter names the spicy packs');
 await page.locator('.game[href="#truth"]').click();ok(await page.locator('#pack-select').inputValue()==='naughty','adult filter preselects the spicy pack');
 await page.evaluate(()=>{filter='all';Object.keys(packChoice).forEach(k=>delete packChoice[k]);go('truth');});ok(await page.locator('#pack-select').inputValue()==='base','other filters keep the base pack');
 await page.evaluate(()=>{filter='adult';go('home');});await page.locator('[data-a="filter"][data-v="all"]').click();
 for(const key of ['memories','future','bucket']){await page.evaluate(k=>{run=null;go(k);},key);await page.selectOption('#round-length',key==='bucket'?'4':'6');await page.locator('form[data-a="start"] button').click();ok(await page.evaluate(()=>run.deck.length)===(key==='bucket'?4:6),key+' respects chosen short round');if(key!=='bucket'){for(let i=0;i<6;i++)await page.locator('[data-a="next"]').click();ok(await page.evaluate(()=>run.phase==='result'&&run.count===6),key+' completes six questions');}else{for(let p=0;p<2;p++){await page.locator('[data-a="open"]').click();for(let i=0;i<4;i++){await page.locator('[data-a="select"][data-v="0"]').click();await page.locator('[data-a="confirm"]').click();}}ok(await page.evaluate(()=>run.rows.length===4&&run.answers.every(a=>a.length===0)),'bucket reveals only shared ideas and erases answers');}}
 await page.evaluate(()=>{run=null;start('truth',true,24);A.draw('truth');for(let i=0;i<24;i++){A.next();if(run.phase==='talk')A.draw('truth');}render();});ok(await page.evaluate(()=>run.phase==='result'&&run.count===24),'long truth round has enough unique prompts');
 await page.evaluate(()=>{run=null;adult=false;});
 for(const [key,id] of [['radar','fire'],['truth','naughty'],['match','wishlist'],['honest','frank']]){await page.evaluate(([k,p])=>{run=null;adult=false;start(k,false,4,p);},[key,id]);ok(await page.evaluate(()=>run===null),key+' '+id+' pack requires 18+ confirmation');await page.evaluate(([k,p])=>{start(k,true,24,p);adult=false;run=null;},[key,id]);}
 await page.evaluate(()=>{start('truth',true,24,'naughty');while(run&&run.phase==='limits-cover'){A.openLimits();A.limitsDone();}for(let i=0;i<24;i++){A.draw(i%2?'dare':'truth');A.next();}render();});ok(await page.evaluate(()=>run.phase==='result'&&run.count===24),'long pajzán truth round has enough prompts');
 await page.evaluate(()=>{run=null;adult=false;});
 await page.evaluate(()=>{run=null;start('memories',false,6);for(let i=0;i<6;i++)A.next();A.restart();render();});ok(await page.evaluate(()=>run.deck.length===6),'restart preserves the selected round length');await page.evaluate(()=>{run=null;});
 await page.goto(origin+'/paros/#__proto__');ok(await page.locator('.game').count()===14,'invalid prototype hash safely falls back to home');
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
 await page.evaluate(()=>{A.clear();start('radar',true,4,'fire');while(run&&run.phase==='limits-cover'){A.openLimits();A.limitsDone();}render();});
 for(const choice of [[0,0,1,1],[0,1,1,-1]]){await page.locator('[data-a="open"]').click();for(const n of choice){await page.locator(`[data-a="select"][data-v="${n}"]`).click();await page.locator('[data-a="confirm"]').click();}}
 ok(await page.evaluate(()=>run.rows.length===2&&run.rows.every(r=>r.shared&&!r.values)),'adult radar reveals only matching answers');
 ok(await page.evaluate(()=>run.answers.every(a=>a.length===0))&&(await page.locator('#app').innerText()).includes('Mindketten:'),'adult radar erases individual answers and shows the shared choice');
 await page.evaluate(()=>{A.clear();start('quiz',false);});
 for(const values of [[0,1],[1,0]]){await page.locator('[data-a="open"]').click();for(let i=0;i<8;i++){for(const n of values){await page.locator(`[data-a="select"][data-v="${n}"]`).click();await page.locator('[data-a="confirm"]').click();}}}
 ok(await page.evaluate(()=>run.scores.every(n=>n===8)),'quiz scores own answers against partner predictions');
 const scores=await page.evaluate(()=>run.scores.join(','));await page.evaluate(()=>A.confirm());ok(await page.evaluate(()=>run.scores.join(','))===scores,'repeated confirmation cannot duplicate quiz scores');
 for(const key of ['closer','honest']){await page.evaluate(k=>{A.clear();start(k,true);},key);ok(await page.evaluate(()=>new Set(run.deck).size===12),`${key}: non-repeating deck`);for(let i=0;i<12;i++)await page.locator('[data-a="next"]').click();ok(await page.evaluate(()=>run.phase==='result'&&run.count===12),`${key}: conversation completes without scoring`);}
 await page.evaluate(()=>{A.clear();start('truth',true);});await page.locator('[data-a="draw"][data-v="truth"]').click();ok(await page.evaluate(()=>typeof run.prompt?.t==='string'),'truth draws a question');await page.locator('[data-a="pass"]').click();await page.locator('[data-a="draw"][data-v="dare"]').click();ok(await page.evaluate(()=>run.kind==='dare'&&run.pos===1&&run.skipped===1),'pass switches player without penalty');await page.locator('[data-a="stop"]').click();
 await page.evaluate(()=>{A.clear();start('truth',true,24,'naughty');render();});
 ok(await page.locator('[data-a="openLimits"]').count()===1,'spicy rounds start with a private limits step');
 for(const pick of [['anal'],['foto','fajdalom']]){await page.locator('[data-a="openLimits"]').click();for(const id of pick)await page.locator(`[data-a="limit"][data-v="${id}"]`).click();await page.locator('[data-a="limitsDone"]').click();}
 ok(await page.evaluate(()=>run.phase==='talk'&&[...run.truth,...run.dare].length>0&&[...run.truth,...run.dare].every(c=>!c.tags.some(t=>['anal','foto','fajdalom'].includes(t)))),'excluded categories never reach the deck');
 ok(await page.evaluate(()=>run.excluded===null&&run.draft===null),'per-player limits are discarded once the deck is built');
 ok(!/Anál|Fotó|Fájdalom/.test(await page.locator('#app').innerText()),'limits are not revealed during play');
 await page.evaluate(()=>{A.clear();start('match',true,4,'wishlist');A.openLimits();A.limit('anal');hide();masked=false;render();});
 ok(await page.evaluate(()=>run.phase==='limits-cover'&&run.draft.size===0),'veil drops an unfinished limits choice');
 await page.evaluate(()=>{A.clear();start('match',true,12,'wishlist');for(const p of [0,1]){A.openLimits();LIMITS.forEach(([id])=>A.limit(id));run.draft.add('erintes');run.draft.add('pozicio');A.limitsDone();}render();});
 ok(await page.evaluate(()=>run.short&&run.deck.length<12)&&(await page.locator('#app').innerText()).includes('A határaitok miatt'),'tight limits shorten the round and say so');
 await page.evaluate(()=>{A.clear();start('honest',true,6,'frank');A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();render();});
 const haltBox=await page.locator('[data-a="halt"]').boundingBox();ok(haltBox&&haltBox.height>=44,'Állj is visible and touchable in adult rounds');
 await page.locator('[data-a="halt"]').click();ok(await page.evaluate(()=>run.phase==='halt'),'Állj pauses the round');
 await page.locator('[data-a="haltResume"]').click();ok(await page.evaluate(()=>run.phase==='talk'),'the round can continue after Állj');
 await page.locator('[data-a="halt"]').click();await page.locator('[data-a="haltGentle"]').click();ok(await page.evaluate(()=>run.packId==='base'&&run.key==='honest'),'Állj can continue with the gentle base pack');
 await page.evaluate(()=>{A.clear();start('closer',false,6);render();});ok(await page.locator('[data-a="halt"]').count()===0,'non-adult rounds have no Állj button');
 await page.evaluate(()=>{A.clear();start('honest',true,6,'frank');A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();render();});
 await page.keyboard.press('Escape');ok(await page.evaluate(()=>masked)&&!(await page.locator('#app').innerText()).includes('Szexről'),'Escape veils without naming the game');
 await page.evaluate(()=>{masked=false;A.clear();});
 ok(await page.evaluate(()=>{A.clear();start('closer',false,12);const l=run.deck.map(c=>c.lvl);return l.length===12&&l.every((x,i)=>!i||l[i-1]<=x)&&l[0]===1&&l[11]===3;}),'closer deck rises in intensity');
 ok(await page.evaluate(()=>{A.clear();start('truth',true,12,'naughty',{escalate:true});A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();const spark=new Set(PACKS.truth[0].truth.map(x=>typeof x==='string'?x:x.t));const first=[];for(let i=0;i<4;i++){A.draw('truth');first.push(run.prompt.t);A.next();}A.draw('truth');const later=run.prompt.t;return first.every(t=>spark.has(t))&&!spark.has(later);}),'escalating truth starts mild and turns spicy');
 await page.evaluate(()=>{A.clear();go('truth');});await page.selectOption('#pack-select','naughty');ok(await page.locator('input[name="escalate"]').count()===1,'escalation is offered for the spicy truth pack');
 await page.clock.install();
 await page.evaluate(()=>{A.clear();start('truth',true,6,'naughty');A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();run.prompt={t:'Teszt',lvl:3,tags:[],sec:30,body:null};run.kind='dare';render();});
 ok(await page.locator('#timer-left').innerText()==='30 mp','timed card shows its duration');
 await page.locator('[data-a="timerStart"]').click();await page.clock.runFor(10500);
 ok((await page.locator('#timer-left').innerText())==='20 mp'&&await page.locator('[data-a="timerStop"]').isVisible(),'timer counts down without re-rendering the card');
 await page.clock.runFor(21000);
 ok(await page.locator('#timer-live').innerText()==='Lejárt az idő'&&await page.evaluate(()=>timer===null),'timer finishes and announces the end');
 await page.evaluate(()=>{A.timerStart(30);conceal();});ok(await page.evaluate(()=>timer===null),'veil stops the timer');
 await page.evaluate(()=>{masked=false;A.clear();});
 ok(await page.evaluate(()=>{const ex=new Set(['oral','fajdalom','meztelen']);return Array.from({length:1000},()=>spinOnce(ex)).every(c=>c&&!c.tags.some(t=>ex.has(t))&&c.sec>0&&/ a másik /.test(c.t));}),'1000 spins respect limits and always carry a duration');
 ok(await page.evaluate(()=>{adult=false;start('spin',false,6);return run===null;}),'spinner requires 18+ confirmation');
 ok(await page.evaluate(()=>{start('spin',true,6);A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();return run.deck.length===6&&run.deck.every(c=>c.sec);}),'spinner builds a full round of timed spins');
 await page.evaluate(()=>{A.clear();go('settings');});
 await page.locator('#custom-text').fill('<b>Saját</b> kérdés?');await page.locator('form[data-a="customAdd"] button').click();
 ok(await page.locator('.custom-list b').count()===0&&(await page.locator('.custom-list').innerText()).includes('<b>Saját</b>'),'custom cards render as escaped text');
 ok(await page.evaluate(()=>localStorage.getItem('paros.custom.v1')===null),'custom cards are not stored by default');
 await page.evaluate(()=>go('closer'));await page.selectOption('#custom-mode','only');await page.locator('form[data-a="start"] button').click();
 ok(await page.evaluate(()=>run.deck.length===1&&run.deck[0].t==='<b>Saját</b> kérdés?'),'a round can use only the couple\'s own cards');
 await page.evaluate(()=>{A.clear();custom.cards=[];saveCustom();});
 ok(await page.evaluate(()=>{A.clear();adult=false;start('truth',false,6);return run&&run.packId==='base';}),'the base truth pack plays without 18+ confirmation');
 ok(await page.evaluate(()=>{A.clear();adult=false;start('truth',false,6,'naughty');return run===null;}),'spicy truth packs still require 18+ confirmation');
 await page.evaluate(()=>{A.clear();start('truth',true,6,'naughty');A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();run.kind='dare';run.prompt=packsFor('truth').find(p=>p.id==='naughty').dare.find(c=>c.tags.includes('foto'));render();});
 ok((await page.locator('#app').innerText()).includes('a felhőben is megmarad'),'photo cards warn that pictures persist');
 await page.evaluate(()=>{A.clear();});
 ok(await page.evaluate(()=>{seen.clear();A.clear();start('closer',false,12);const a=run.deck.map(c=>c.t);A.clear();start('closer',false,12);const b=run.deck.map(c=>c.t);A.clear();return b.every(t=>!a.includes(t));}),'a second round in the same session brings new cards');
 ok(await page.evaluate(()=>{seen.clear();A.clear();start('memories',false,6);const a=run.deck.map(c=>c.t).join();A.clear();start('memories',false,6);return run.deck.map(c=>c.t).join()!==a;}),'card order is random every time a round opens');
 ok(await page.evaluate(()=>{seen.clear();const draws=()=>{A.clear();start('truth',true,24,'naughty');A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();const t=[];for(let i=0;i<24;i++){A.draw(i%2?'dare':'truth');t.push(run.prompt.t);A.next();}return t;};const a=draws(),b=draws();A.clear();return b.every(t=>!a.includes(t));}),'spicy truth or dare does not repeat cards between rounds');
 ok(await page.evaluate(()=>{const p=Array.from({length:50},()=>planPick(30,'spicy',3));return p.every(x=>x&&x[2]<=3&&x[0]<=30&&x[1]==='spicy')&&new Set(p.map(x=>x.join())).size>1;}),'the evening wizard varies its pick among the best matches');
 ok(await page.evaluate(()=>planPick(10,'talk',1)[3]==='closer'&&planPick(60,'play',1)[2]===1),'the wizard never goes bolder than asked');
 await page.evaluate(()=>{A.clear();go('home');});await page.locator('.fold summary').first().click();await page.selectOption('#plan-mood','talk');await page.selectOption('#plan-lvl','1');await page.selectOption('#plan-min','10');await page.locator('form[data-a="plan"] button').click();
 ok(await page.evaluate(()=>view==='closer'),'the wizard opens the suggested game setup');
 ok(await page.evaluate(()=>{const a=daily(),b=daily();return a===b&&typeof a==='string'&&a.length>5;}),'the daily question is stable for the day');
 ok(await page.evaluate(()=>{A.clear();adult=true;A.arc('wild');for(const p of [0,1]){A.openLimits();A.limit('anal');A.limitsDone();}const first=run.key;run.phase='result';A.arcNext();return first==='radar'&&run.key==='truth'&&run.phase==='talk'&&run.truth.every(c=>!c.tags.includes('anal'));}),'an evening arc asks limits once and carries them to the next step');
 ok(await page.evaluate(()=>{A.clear();return arc===null;}),'clearing a round ends the evening arc and its limits');
 await page.evaluate(()=>{A.clear();start('bucket',false,4);for(const p of [0,1]){A.open();for(let i=0;i<4;i++){A.select(i<2?'0':'1');A.confirm();}}render();});
 await page.locator('[data-a="saveTogether"]').click();
 ok(await page.evaluate(()=>together.items.length===2&&localStorage.getItem('paros.together.v1')===null),'only mutual yeses go to the shared list, kept in memory by default');
 await page.evaluate(()=>{A.clear();go('home');});ok((await page.locator('#app').innerText()).includes('Közös listánk'),'the shared list shows on the home page');
 await page.evaluate(()=>{together.items=[];});
 ok(await page.evaluate(()=>{A.clear();start('truth',true,6,'spark');A.draw('truth');const before=run.prompt.t;A.swap();A.swap();const after=run.prompt.t;const left=run.jokers[0];A.swap();return before!==after&&left===0&&run.jokers[0]===0;}),'each player can swap a card twice per round');
 ok(await page.evaluate(()=>{A.clear();start('closer',false,6);const t=run.deck[0].t;A.never();A.clear();seen.clear();start('closer',false,24);const ok1=!run.deck.some(c=>c.t===t);marks.never=[];marks.fav=[];return ok1&&localStorage.getItem('paros.marks.v1')===null;}),'a card marked never again stays out of later rounds');
 await page.evaluate(()=>{A.clear();start('scene',true,1);A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();render();});
 ok(await page.locator('.scene-detail li').count()===4&&(await page.locator('.scene-detail').innerText()).includes('Kezdőmondat'),'a roleplay scene shows roles, place, opener and twist');
 ok(await page.evaluate(()=>{A.clear();start('scene',true,1);A.openLimits();A.limit('szerep');A.limitsDone();A.openLimits();A.limitsDone();return run.phase==='empty';}),'excluding roleplay leaves no scene to play');
 await page.evaluate(()=>{A.clear();});
 ok(await page.evaluate(()=>{A.clear();start('closer',false,6);render();A.follow();render();const f=run.follow;return typeof f==='string'&&FOLLOW[run.deck[0].lvl].includes(f)&&!!document.querySelector('.follow');}),'a follow-up question can be asked on a conversation card');
 ok(await page.evaluate(()=>{A.follow();const a=run.follow;A.next();return a&&run.follow===null;}),'follow-ups reset on the next card');
 ok(await page.evaluate(()=>{const ex=new Set(['oral']);return Array.from({length:500},()=>diceOnce(ex)).every(c=>c&&c.sec>=60&&!c.tags.includes('oral')&&/percig\.$/.test(c.t));}),'the position dice respects limits and always gives a duration');
 ok(await page.evaluate(()=>{A.clear();adult=false;start('dice',false,6);if(run)return false;start('dice',true,6);A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();return run.deck.length===6;}),'the position dice needs 18+ and builds a full round');
 await page.evaluate(()=>{A.clear();start('wish',true);A.open();render();});
 await page.selectOption('#wish-cat','2');await page.locator('#wish-text').fill('<i>Titkos</i> első');await page.locator('form[data-a="wishSave"] button').click();
 await page.evaluate(()=>{A.open();render();});await page.selectOption('#wish-cat','2');await page.locator('#wish-text').fill('Második kívánság');await page.locator('form[data-a="wishSave"] button').click();
 ok(await page.evaluate(()=>run.phase==='result'&&run.wishCat==='Szerepjáték'&&run.wishes===null)&&(await page.locator('#app').innerText()).includes('<i>Titkos</i> első'),'matching secret wishes are revealed as escaped text');
 ok(await page.evaluate(()=>{A.clear();start('wish',true);A.open();run.phase='wish';const f=n=>({elements:{cat:{value:String(n)},text:{value:'kívánság '+n}}});A.wishSave(f(0));A.open();A.wishSave(f(5));return run.phase==='result'&&run.wishCat===null&&run.rows.length===0&&run.wishes===null;}),'different secret wishes stay hidden and are discarded');
 ok(await page.evaluate(()=>{A.clear();start('truth',true,6,'spark',{score:true});A.draw('truth');A.next();A.draw('dare');A.next();A.draw('truth');A.pass();return run.points[0]===1&&run.points[1]===2;}),'score mode gives 1 for truth, 2 for dare and 0 for a pass');
 ok(await page.evaluate(()=>{A.clear();const d=new Date();d.setMonth(d.getMonth()-26);const m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;start('memories',false,6,'base',{since:m});const first=run.deck.slice(0,4).map(c=>c.t);return first.every(t=>t.includes('2 év és 2 hónap')||t.includes('következő évre'));}),'anniversary mode personalises the first memory cards');
 ok(await page.evaluate(()=>{A.clear();start('closer',false,6,'valentin');return run.deck.length===6&&run.packName==='Valentin-nap';}),'occasion packs are playable');
 ok(await page.evaluate(()=>{A.clear();start('closer',false,6);render();A.mood();render();const on=document.body.classList.contains('mood-light');A.mood();render();return on&&!document.body.classList.contains('mood-light');}),'mood light can be switched on and off during a round');
 await page.evaluate(()=>{A.clear();go('settings');});ok((await page.locator('#app').innerText()).includes('Tedd a kezdőképernyőre'),'settings explain how to install the app');
 await page.evaluate(()=>{A.clear();go('home');});
 ok(await page.evaluate(()=>{A.clear();adult=false;start('honest',false,24,'taboo');if(run)return false;start('honest',true,24,'taboo');for(const p of [0,1]){A.openLimits();if(!p)A.limit('harmadik');A.limitsDone();}return run.deck.length===24&&run.deck.every(c=>!c.tags.includes('harmadik'));}),'the taboo pack needs 18+ and respects the limits list');
 await page.evaluate(()=>{A.clear();});
 await page.evaluate(()=>{A.clear();Object.keys(packChoice).forEach(k=>delete packChoice[k]);filter='all';go('honest');});
 ok(await page.locator('#pack-select').inputValue()==='taboo','Szexről őszintén opens with the newest Tabuk nélkül pack');
 await page.evaluate(()=>{filter='adult';go('honest');});ok(await page.locator('#pack-select').inputValue()==='taboo','the 18+ filter also opens Tabuk nélkül');
 await page.evaluate(()=>{filter='all';go('home');});
 // Background and return with a private response selected.
 await page.evaluate(()=>{A.clear();start('match',true);A.open();A.select('1');render();conceal();});ok(await page.locator('#app').innerText().then(t=>t.includes('A kör elrejtve')),'background veil hides an opened answer');
 await page.locator('[data-a="unmask"]').click();ok(await page.evaluate(()=>!masked&&run.phase==='cover'&&run.selected===null),'veil drops the pending choice and returns to the handoff screen');
 await page.locator('[data-a="open"]').click();ok(await page.evaluate(()=>run.phase==='answer'&&run.pos===0),'owner resumes the same private question');
 await page.evaluate(()=>{A.clear();start('quiz',false,4);A.open();A.select('0');A.confirm();A.select('1');conceal();masked=false;A.open();});ok(await page.evaluate(()=>run.phase==='guess'&&run.pos===0),'veil keeps a quiz player in the guess phase');
 await page.evaluate(()=>{A.clear();start('quiz',false,4);for(const p of [0,1]){A.open();for(let i=0;i<4;i++){A.select(p===0?'0':'-1');A.confirm();A.select('0');A.confirm();}}render();});
 ok(await page.evaluate(()=>run.guessed[0]===0&&run.scores[0]===0&&run.guessed[1]===4&&run.scores[1]===4),'quiz guesses about passed answers are not scored');
 await page.evaluate(()=>{A.clear();start('quiz',false,4);render();});await page.keyboard.press('Tab');await page.locator('[data-a="open"]').focus();await page.keyboard.press('Enter');await page.locator('[data-a="select"][data-v="1"]').focus();await page.keyboard.press('Enter');
 ok(await page.evaluate(()=>document.activeElement.dataset.a==='select'&&document.activeElement.dataset.v==='1'),'keyboard focus stays on the chosen answer after re-render');
 await page.locator('[data-a="confirm"]').focus();await page.keyboard.press('Enter');ok(await page.evaluate(()=>document.activeElement.classList.contains('question')),'keyboard focus moves to the next question');
 await page.evaluate(()=>{A.clear();start('match',true);A.adultOff();render();});ok(await page.evaluate(()=>!adult&&run===null),'18+ disable erases active adult round');
 await page.evaluate(()=>go('settings'));await page.locator('[name="first"]').fill('<b>Anna</b>');await page.locator('[name="second"]').fill('Béla');await page.locator('form[data-a="names"] button').click();await page.evaluate(()=>go('radar'));await page.locator('form[data-a="start"] button').click();
 ok(await page.locator('#app b').count()===0,'names are rendered as escaped text');
 const storage=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));ok(Object.keys(storage).every(k=>k==='paros.preferences.v1')&&!JSON.stringify(storage).includes('answers'),'only names are stored, separately from Társasest');
 await page.reload();ok(await page.evaluate(()=>run===null&&!adult),'reload clears private responses and adult confirmation');
 await page.evaluate(()=>go('home'));await page.locator('.game[href="#radar"]').click();await page.goBack();ok(await page.evaluate(()=>view==='home'),'browser Back navigates the standalone page');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.evaluate(()=>go('home'));ok(await page.locator('.game').count()===14,'all fourteen games available after offline reload');
 await page.evaluate(()=>start('radar',false));await page.locator('[data-a="open"]').click();ok(await page.locator('[data-a="select"]').count()===3,'offline play includes choices and pass');
 await page.evaluate(()=>{run=null;adult=false;start('radar',false,4,'chemistry');});ok(await page.evaluate(()=>run===null),'offline adult pack still requires confirmation');await page.evaluate(()=>{start('radar',true,4,'chemistry');A.open();render();});ok(await page.locator('[data-a="select"]').count()===3&&await page.evaluate(()=>run.packId==='chemistry'&&cardCount()===1488),'all new pack data remains playable offline');
 if(width===320){await page.evaluate(()=>{run=null;go('home');});await page.screenshot({path:'/tmp/paros-home.png',fullPage:true});}
 ok(errors.length===0,`${width}px: no JavaScript errors: ${errors.join(';')}`);ok(external.length===0,`${width}px: no external requests or answer transmission`);
 await context.close();}
 console.log(`\n${count} Páros est checks passed.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
