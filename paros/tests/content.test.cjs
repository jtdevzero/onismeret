'use strict';
// A kártyák tartalmi ellenőrzése böngésző nélkül: tiltott témák, hossz, majdnem-ismétlés, csomagméret.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','data.js'),'utf8'),ctx);
const {PAIR_DATA:D,PAIR_PACKS:P}=ctx.window;
const text=c=>typeof c==='string'?c:Array.isArray(c)?c[0]:c.t;
const packs=[...Object.entries(D).map(([k,v])=>({id:'alap:'+k,cards:v})),
 ...Object.values(P).flat().map(p=>({id:p.id,cards:[...(p.items||[]),...(p.truth||[]),...(p.dare||[])]})),
 {id:'szerepjatek',cards:ctx.window.PAIR_SCENES.flatMap(c=>[c.t,...c.detail])}];
packs.push({id:'jackpot',cards:require('../jackpot-core.js').categories.flatMap(c=>c.tasks)});
const BANNED=[/fojt/i,/légszomj|levegőt (?:se|ne)/i,/nyilvános|parkban szex|autóban szex/i,/\bvér/i,/kiskorú|iskolá|tanár|\bdiák/i,/kényszer|erőszak/i,/részeg/i,/\balvó\b|alszik.*(?:dug|szex)/i,/vérfertőz|testvér|mostoha/i];
const tri=s=>{s=s.toLowerCase();const t=new Set();for(let i=0;i<s.length-2;i++)t.add(s.slice(i,i+3));return t;};
const sim=(a,b)=>{const x=tri(a),y=tri(b);let n=0;x.forEach(v=>{if(y.has(v))n++;});return 2*n/(x.size+y.size);};

test('nincs tiltott téma egyetlen kártyán sem',()=>{
 // A fojtogatásról csak beszélgetőkérdés lehet a Tabuk nélkül csomagban; kihívás, kívánság vagy pörgetés soha.
 const discussable=(p,t,re)=>re===BANNED[0]&&p.id==='taboo'&&/\?$/.test(t);
 for(const p of packs)for(const c of p.cards)for(const re of BANNED)assert.ok(!re.test(text(c))||discussable(p,text(c),re),`${p.id}: ${text(c)} (${re})`);
});
test('minden kártya legfeljebb 110 karakter',()=>{
 for(const p of packs)for(const c of p.cards)assert.ok(text(c).length<=110,`${p.id}: ${text(c)}`);
});
test('nincs pontos vagy majdnem-ismétlés egy csomagon belül',()=>{
 for(const p of packs){const t=p.cards.map(text);
  for(let i=0;i<t.length;i++)for(let j=i+1;j<t.length;j++)assert.ok(sim(t[i],t[j])<.85,`${p.id}: „${t[i]}” ~ „${t[j]}”`);}
});
test('minden csomag elég nagy a leghosszabb körhöz',()=>{
 for(const p of packs)assert.ok(p.cards.length>=12,`${p.id}: ${p.cards.length}`);
});
test('a jelölők ismert címkéket használnak',()=>{
 const tags=new Set(['anal','oral','testnedv','fajdalom','kotozes','foto','szerep','jatekszer','harmadik','mult','erintes','meztelen','pozicio']);
 for(const p of packs)for(const c of p.cards){const t=Array.isArray(c)?c[3]?.tags||[]:c.tags||[];for(const x of t)assert.ok(tags.has(x),`${p.id}: ismeretlen címke ${x}`);}
});
