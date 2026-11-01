#!/usr/bin/env node
'use strict';
// Akadálymentességi ellenőrzés (axe-core, WCAG 2 A/AA) a Páros est fő képernyőin, telefon- és asztali szélességen.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'../..');
const AXE=require.resolve('axe-core/axe.min.js');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let file;try{const u=new URL(req.url,'http://localhost');file=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));}catch{res.writeHead(400).end();return;}if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,d)=>{if(e)res.writeHead(404).end();else res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(d);});});
const SCREENS=[
 ['jackpot beállítás',`go('jackpot')`],
 ['jackpot kockák',`run=null;start('jackpot',true,6,'base',{jp:{reward:'Közös randi',tags:[],custom:[]}});A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();render()`],
 ['jackpot választás',`run.jp.result={faces:[0,0,1],kind:'pair',tasks:['Első feladat.','Második feladat.'],chosen:null};render()`],
 ['jackpot nyeremény',`run.jp.result={faces:[0,0,0],kind:'jackpot',tasks:['Közös randi'],chosen:0};render()`],
 ['jackpot eredmény',`A.jackpotEnd();render()`],
 ['főoldal',`go('home')`],
 ['beállítások',`go('settings')`],
 ['játékbeállítás',`go('truth')`],
 ['beszélgetőkártya',`A.clear();start('closer',false,6);render()`],
 ['átadó képernyő',`A.clear();start('match',false,4);render()`],
 ['titkos választás',`A.clear();start('match',false,4);A.open();render()`],
 ['határlista',`A.clear();start('truth',true,6,'naughty');A.openLimits();render()`],
 ['Állj',`A.clear();start('honest',true,6,'frank');A.openLimits();A.limitsDone();A.openLimits();A.limitsDone();A.halt();render()`],
 ['titkos kívánság',`A.clear();start('wish',true);A.open();render()`],
 ['eredmény',`A.clear();start('closer',false,6);A.stop();render()`]
];
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const problems=[];let checks=0;
 try{for(const width of [360,1024]){
  const page=await browser.newPage({viewport:{width,height:900},bypassCSP:true});page.on('dialog',d=>d.accept());
  await page.goto(origin+'/paros/');await page.waitForSelector('.game');
  for(const [name,code] of SCREENS){
   await page.evaluate(code);await page.addScriptTag({path:AXE});
   const res=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   const bad=res.violations.filter(v=>['serious','critical'].includes(v.impact));
   checks++;
   if(bad.length)problems.push(`${width}px ${name}: `+bad.map(v=>`${v.id} (${v.nodes.length}) ${v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(', ')}`).join('; '));
   else console.log(`✓ ${width}px ${name}`);
  }
  await page.close();
 }}finally{await browser.close();server.close();}
 if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log(`\n${checks} accessibility checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
