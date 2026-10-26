/* Páros est. A válaszok kizárólag memóriában élnek; újratöltéskor törlődnek. */
'use strict';
const DATA=window.PAIR_DATA, PACKS=window.PAIR_PACKS, KEY='paros.preferences.v1';
const GAMES={
 closer:{name:'Közelebb hozzád',symbol:'☕',desc:'Kérdések, amelyekből beszélgetés lesz. Lépésről lépésre személyesebben.',type:'talk',time:'10–20 perc',adult:false},
 radar:{name:'Flörtradar',symbol:'✦',desc:'Külön választotok, együtt fedezitek fel, miben vagytok egy hullámhosszon.',type:'radar',time:'5–10 perc',adult:false},
 truth:{name:'Igazság vagy kihívás',symbol:'♧',desc:'Őszinte mondatok és játékos, romantikus ötletek. Bármelyik kör passzolható.',type:'truth',time:'10–15 perc',adult:true},
 match:{name:'Igen, nem, talán',symbol:'◒',desc:'Kíváncsiság, közös ötletek. A végén kizárólag a kölcsönös igenek látszanak.',type:'match',time:'5–10 perc',adult:true},
 honest:{name:'Szexről őszintén',symbol:'♡',desc:'Nyugodt beszélgetés a közelségről, vágyakról, határokról és figyelemről.',type:'talk',time:'15–25 perc',adult:true},
 quiz:{name:'Mennyire ismersz?',symbol:'◎',desc:'Mit választanál te, és mit gondolsz a másikról? Titkos tippek, közös felfedés.',type:'quiz',time:'10–15 perc',adult:false},
 memories:{name:'Emlékösvény',symbol:'❧',desc:'Közös történetek, elfelejtett apróságok és pillanatok, amiket újra felidéznétek.',type:'talk',time:'10–20 perc',adult:false},
 future:{name:'Jövőnk mozaikja',symbol:'◇',desc:'Kis közös tervek és nagy ötletek. Miről álmodtok, és mi lehet az első lépés?',type:'talk',time:'15–25 perc',adult:false},
 bucket:{name:'Közös bakancslista',symbol:'☀',desc:'Válasszatok titokban programötleteket. A közös listára csak a két igen kerül.',type:'match',time:'5–10 perc',adult:false}
};
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let prefs={names:['Első játékos','Második játékos']};
try {const p=JSON.parse(localStorage.getItem(KEY));if(p&&Array.isArray(p.names)&&p.names.length===2)prefs.names=p.names.map((x,i)=>typeof x==='string'&&x.trim()?x.trim().slice(0,24):prefs.names[i]);}catch{}
let adult=false,run=null,masked=false,view='home',notice='';
const A={};
let filter='all';
const packChoice={},roundChoice={};
function packsFor(key){
 if(!Object.hasOwn(GAMES,key))return [];
 const base=GAMES[key].type==='truth'?{truth:DATA.truth,dare:DATA.dare}:{items:DATA[key]};
 return [{id:'base',name:'Alapcsomag',adult:GAMES[key].adult,...base},...(PACKS[key]||[])];
}
const packFor=(key,id='base')=>packsFor(key).find(p=>p.id===id);
const cardCount=()=>Object.values(DATA).reduce((sum,cards)=>sum+cards.length,0)+Object.values(PACKS).flat().reduce((sum,p)=>sum+(p.items?.length||0)+(p.truth?.length||0)+(p.dare?.length||0),0);

const lengths=key=>['talk','truth'].includes(GAMES[key].type)?[6,12,24]:[4,8,12];
const defaultLength=key=>['talk','truth'].includes(GAMES[key].type)?12:8;
const visibleGame=(g,key)=>filter==='all'||filter==='adult'&&(g.adult||(PACKS[key]||[]).some(p=>p.adult))||filter==='talk'&&g.type==='talk'||filter==='private'&&['match','radar','quiz'].includes(g.type);
function savePrefs(){try{localStorage.setItem(KEY,JSON.stringify({names:prefs.names}));return true;}catch{notice='A neveket most nem tudjuk megjegyezni. A játék ettől még működik.';return false;}}
function route(){const h=location.hash.slice(1);return h==='settings'||h==='play'||Object.hasOwn(GAMES,h)?h:'home';}
function go(v){if(v!==view&&run)masked=true;view=v;const hash=v==='home'?'#home':'#'+v;if(location.hash!==hash)history.pushState(null,'',hash);render();window.scrollTo(0,0);app.focus({preventScroll:true});}
window.addEventListener('popstate',()=>{if(run)masked=true;view=route();render();});
window.addEventListener('hashchange',()=>{if(run)masked=true;view=route();render();});
function conceal(){if(run){masked=true;render();}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')conceal();});
window.addEventListener('pagehide',()=>{if(run)masked=true;});
window.addEventListener('pageshow',()=>render());
const btn=(action,label,value='',primary=false)=>`<button class="btn${primary?' primary':''}" data-a="${action}" data-v="${value}">${label}</button>`;
const back=()=>'<a class="back small" href="#home">← A játékokhoz</a>';
const progress=s=>`<div class="counter">${esc(s.packName)} · ${s.pos+1} / ${s.deck.length}</div><progress max="${s.deck.length}" value="${s.pos+1}" aria-label="Haladás"></progress>`;
const pass=()=>`<div class="actions">${btn('pass','Passzolok')}${btn('stop','Kör lezárása')}</div><p class="muted small">Passzolni bármikor lehet, indoklás nélkül. Egy válasz sem ígéret vagy kötelezettség.</p>`;
function home(){return `<section class="hero"><div class="eyebrow">Egy telefon · Két ember</div><h1>Egy kicsit<br>közelebb egymáshoz.</h1><p>${Object.keys(GAMES).length} játék és ${cardCount()} kérdés, kihívás vagy közös ötlet. Van helye a kíváncsiságnak, a nevetésnek és a passzolásnak is.</p><div class="actions">${btn('filter','Új flörtös és 18+ csomagok','adult',true)}</div></section>${run?`<div class="panel"><h3>Van egy megkezdett körötök</h3><div class="actions">${btn('resume','Folytatjuk','',true)}${btn('clear','Törlöm a kört')}</div></div>`:''}<div class="actions" role="group" aria-label="Játékok szűrése">${Object.entries({all:'Minden játék',talk:'Beszélgetés',private:'Titkos választás',adult:'18+'}).map(([key,label])=>`<button class="btn${filter===key?' selected':''}" data-a="filter" data-v="${key}" aria-pressed="${filter===key}">${label}</button>`).join('')}</div><div class="games">${Object.entries(GAMES).filter(([key,g])=>visibleGame(g,key)).map(([key,g])=>`<a class="game" href="#${key}"><span class="symbol" aria-hidden="true">${g.symbol}</span><span class="title">${g.name} ${g.adult?'<span class="tag">18+</span>':(PACKS[key]||[]).some(p=>p.adult)?'<span class="tag">18+ csomag is</span>':''}</span><span class="desc">${g.desc}</span><span class="meta">2 fő · ${g.time} ›</span></a>`).join('')}</div><div class="panel small muted">A válaszaitok csak a most nyitott oldal memóriájában maradnak. Újratöltéskor vagy a kör törlésekor elvesznek. A neveket ezen az eszközön megjegyezzük.</div>`;}
function settings(){return `${back()}<section class="panel"><h2>Ti ketten</h2><form data-a="names"><div class="names"><label>Első játékos<input name="first" maxlength="24" required value="${esc(prefs.names[0])}" autocomplete="off"></label><label>Második játékos<input name="second" maxlength="24" required value="${esc(prefs.names[1])}" autocomplete="off"></label></div><button class="btn primary">Nevek mentése</button></form><p class="muted small">A megkezdett körben a korábban megadott nevek maradnak.</p></section><section class="panel"><h3>18+ játékok</h3><p class="muted small">A felnőtt témák kapcsolati beszélgetést és kölcsönös döntéseket segítenek. A hozzáférést ezen az oldalon kell bekapcsolni.</p>${adult?btn('adultOff','18+ játékok kikapcsolása'):btn('adultOn','18+ játékok bekapcsolása')}</section>${run?btn('resume','Vissza a körhöz','',true):''}`;}
function setup(key){const g=GAMES[key],pack=packFor(key,packChoice[key]||'base'),size=roundChoice[key]||defaultLength(key);return `${back()}<div class="hero"><span class="eyebrow">${g.time} · Ketten</span><h1>${g.name}</h1><p>${g.desc}</p></div><section class="panel"><h2>Így játsszatok</h2><p>${g.type==='talk'?'Felváltva kaptok egy kérdést. Hallgassátok meg egymást, időkorlát és pontozás nélkül. A kör bármikor lezárható.':g.type==='truth'?'Felváltva választotok igazságot vagy kihívást. A megjelenő ötletet közösen mérlegeljétek; érintés csak külön, kölcsönös beleegyezéssel történjen. Teljesítés és passzolás után sincs pont vagy büntetés.':g.type==='quiz'?'Mindketten titokban megadjátok a saját válaszotokat, és megtippelitek a másikét is. A második játékos csak az összes saját válasza és tippje után láthatja az eredményt. Minden helyes tipp 1 pont.':g.type==='match'?'Mindketten külön válaszoltok a kiválasztott ötletekre: igen, nem vagy talán. A passz is külön lehetőség. Kizárólag a két igenből születő egyezések látszanak; a többi egyéni válasz soha. Az egyezés beszélgetési lehetőség, nem vállalás.':'Mindketten titokban választotok a kérdéseknél. A végén a válaszaitok együtt jelennek meg; eltérni is teljesen rendben van. A passz kimarad az összehasonlításból.'}</p><p class="muted small">A telefon átadásakor takarjuk a válaszokat. Újratöltéskor a kör és a válaszok törlődnek. Kényes beszélgetéshez nyugodt, közösen választott pillanatot keressetek.</p></section><form class="panel" data-a="start" data-v="${key}">${packsFor(key).length>1?`<label for="pack-select">Kérdéscsomag<select id="pack-select" name="pack" data-pack-game="${key}">${packsFor(key).map(p=>`<option value="${p.id}" ${p.id===pack.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><p class="muted small">A csomagot a kör indítása előtt közösen válasszátok ki. A 18+ csomagokhoz felnőtt megerősítés szükséges.</p>`:''}<label for="round-length">Körhossz<select id="round-length" name="rounds">${lengths(key).map(n=>`<option value="${n}" ${n===size?'selected':''}>${n} ${g.type==='truth'?'kártya':g.type==='talk'?'kérdés':'kérdés fejenként'}${n===lengths(key)[0]?' · rövid':n===defaultLength(key)?' · normál':' · hosszú'}</option>`).join('')}</select></label>${(g.adult||pack.adult)&&!adult?'<label class="check"><input name="adult" type="checkbox" required><span>Mindketten elmúltunk 18 évesek, és szeretnénk megnyitni ezt a játékot.</span></label>':''}<button class="btn primary">Kezdjük · ${esc(prefs.names.join(' és '))}</button></form>`;}
function start(key,consent,length,packId='base'){const g=GAMES[key],pack=packFor(key,packId);if(!Object.hasOwn(GAMES,key)||!pack||(g.adult||pack.adult)&&!adult&&!consent)return;if(run&&!confirm('Új kör indításakor a mostani válaszok végleg törlődnek. Mehet?'))return;if(g.adult||pack.adult)adult=true;
 const type=g.type;const requested=Number(length),size=lengths(key).includes(requested)?requested:defaultLength(key);run={key,type,length:size,packId:pack.id,packName:pack.name,adult:g.adult||pack.adult,names:prefs.names.slice(),pos:0,player:0,opened:false,phase:['talk','truth'].includes(type)?'talk':'cover',answers:[[],[]],guesses:[[],[]],selected:null,count:0,skipped:0,answered:[0,0],guessed:[0,0]};
 if(type==='truth'){run.truth=shuffle(pack.truth);run.dare=shuffle(pack.dare);run.deck=Array(size).fill(null);run.prompt=null;}
 else run.deck=shuffle(pack.items).slice(0,size);
 masked=false;go('play');masked=false;render();}
function cover(s){return `<div class="panel"><span class="eyebrow">${GAMES[s.key].name}</span><h2>Most ${esc(s.names[s.player])} következik</h2><p class="muted">A másik játékos forduljon el. A válaszaid a megerősítés után eltűnnek a kijelzőről.</p></div><div class="card"><span class="privacy" aria-hidden="true">◒</span><p class="question">Nálad van a telefon?</p></div>${btn('open','Igen, mutasd','',true)}${btn('clear','Kör törlése')}`;}
function play(){const s=run;if(!s)return `<div class="panel"><h2>A korábbi kör már nincs meg</h2><p>A személyes válaszokat nem mentjük. Kezdjetek új játékot!</p></div>${back()}`;
 if(masked)return `<div class="card"><span class="privacy" aria-hidden="true">🔒</span><h2>A kör elrejtve</h2><p>A megfelelő játékosnál van a telefon?</p></div>${btn('unmask','Nálam a telefon, folytatom','',true)}${btn('clear','Kör törlése')}`;
 if(s.phase==='result')return result(s);
 if(s.phase==='cover')return cover(s);
 if(s.phase==='talk'){
 const q=s.type==='truth'?s.prompt:s.deck[s.pos];return `<div class="counter">${esc(GAMES[s.key].name)} · ${esc(s.names[s.pos%2])} köre</div>${progress(s)}<div class="card"><span class="eyebrow">${s.type==='truth'?(s.kind==='truth'?'Igazság':s.kind==='dare'?'Kihívás':'Te választasz'):'Beszélgetőkártya'}</span><div class="question">${q?esc(q):'Igazságot mondasz vagy kihívást választasz?'}</div></div>${s.type==='truth'&&!q?`<div class="actions">${btn('draw','Igazság','truth',true)}${btn('draw','Kihívás','dare')}</div>`:btn('next',s.type==='truth'?'Kész, következő kör':'Beszélgettünk, jöhet a következő','',true)}${pass()}`;}
 const q=s.deck[s.pos],isQuiz=s.type==='quiz';const opts=s.type==='match'?['Igen','Nem','Talán']:[q[1],q[2]];
 return `<div class="counter">${esc(s.names[s.player])} · ${isQuiz&&s.phase==='guess'?'Tipp a másikról':'Saját válasz'}</div>${progress(s)}<div class="card"><span class="eyebrow">${isQuiz&&s.phase==='guess'?`Szerinted ${esc(s.names[1-s.player])} mit választott?`:'Válaszd azt, ami most igaz rád'}</span><div class="question">${esc(s.type==='match'?q:q[0])}</div></div><div class="choices">${opts.map((text,i)=>`<button class="btn${s.selected===i?' selected':''}" aria-pressed="${s.selected===i}" data-a="select" data-v="${i}">${esc(text)}</button>`).join('')}<button class="btn${s.selected===-1?' selected':''}" aria-pressed="${s.selected===-1}" data-a="select" data-v="-1">Passzolok</button></div><button class="btn primary" data-a="confirm" ${s.selected===null?'disabled':''}>${isQuiz&&s.phase==='answer'?'Válasz mentése, jöhet a tippem':'Rögzítem és továbblépek'}</button><p class="muted small">A válaszod nem kötelez semmire. ${s.type==='match'?'Csak a kölcsönös igeneket mutatjuk meg.':'Az eredmény csak mindkettőtök válaszai után jelenik meg.'}</p>${btn('clear','Kör törlése')}`;
}
function advancePrivate(s){s.pos++;s.selected=null;if(s.pos>=s.deck.length){if(s.player===0){s.player=1;s.pos=0;s.phase='cover';}else resolve(s);}else s.phase='answer';}
function resolve(s){
 const rows=[],scores=[0,0];
 s.deck.forEach((q,i)=>{const a=s.answers[0][i],b=s.answers[1][i];if(s.type==='match'){if(a===0&&b===0)rows.push({text:q});return;}
 if(s.type==='radar'){if(a!==null&&b!==null)rows.push({text:q[0],values:[q[a+1],q[b+1]],same:a===b});return;}
 const correct=[s.guesses[0][i]!==null&&b!==null&&s.guesses[0][i]===b,s.guesses[1][i]!==null&&a!==null&&s.guesses[1][i]===a];correct.forEach((v,p)=>{if(v)scores[p]++;});rows.push({text:q[0],values:[a===null?'Passz':q[a+1],b===null?'Passz':q[b+1]],correct});
 });s.rows=rows;s.scores=scores;s.answers=[[],[]];s.guesses=[[],[]];s.selected=null;s.phase='result';s.opened=false;}
function result(s){if(s.type==='talk'||s.type==='truth')return `<div class="hero"><span class="eyebrow">Egy közös pillanat</span><h1>Ennyi is számít.</h1><p>${s.count} kártyánál időztetek el, ${s.skipped} kártyát passzoltatok. Köszönjétek meg egymásnak, amit megosztottatok.</p></div>${btn('restart','Új kör','',true)}${btn('clear','Kör törlése és vissza')}`;
 const matches=s.rows.filter(x=>x.same).length;return `<div class="hero"><span class="eyebrow">${GAMES[s.key].name}</span><h1>${s.type==='match'?'Amire mindketten igent mondtatok.':s.type==='quiz'?'Mennyire találtatok egymásra?':'Két nézőpont, egy közös este.'}</h1><p>${s.type==='match'?'Az egyéni nemek, talánok és passzok nem jelennek meg. Egy közös igen nem ígéret: beszéljétek meg, most is jólesne-e.':s.type==='radar'?`${s.rows.length} közösen megválaszolt kérdésből ${matches} egyezés. Ez játék, nem összeillőségi teszt.`:'Minden helyes tipp 1 pont. A különbségek új beszélgetéseket is indíthatnak.'}</p></div>${s.type==='quiz'?`<div class="panel score">${s.names.map((name,i)=>`<div>${esc(name)}<br><b>${s.scores[i]} / ${s.guessed[i]}</b><br><span class="small muted">helyes tipp / adott tipp</span></div>`).join('')}</div>`:''}<div class="panel">${s.rows.length?s.rows.map(row=>`<div class="match-item"><h3>${esc(row.text)}</h3>${row.values?row.values.map((v,i)=>`<p class="small"><b>${esc(s.names[i])}:</b> ${esc(v)}${row.correct?` · a tipped ${row.correct[i]?'helyes':'nem adott pontot'}`:''}</p>`).join(''):'<span class="tag">Közös igen</span>'}</div>`).join(''):`<div class="empty"><h2>${s.type==='match'?'Most nincs közös igen':'Most nincs közös válasz'}</h2><p>Ez is rendben van. Semmit sem kell teljesíteni vagy megmagyarázni.</p></div>`}</div>${btn('restart','Új kör','',true)}${btn('clear','Válaszok törlése és vissza')}`;}
function render(){if(Object.hasOwn(GAMES,view))app.innerHTML=setup(view);else app.innerHTML=view==='settings'?settings():view==='play'?play():home();if(notice)app.innerHTML=`<p class="notice" role="status">${esc(notice)}</p>`+app.innerHTML;}
A.names=f=>{const first=f.elements.first.value.trim().slice(0,24),second=f.elements.second.value.trim().slice(0,24);if(!first||!second)return;prefs.names=[first,second];if(savePrefs())notice='A neveket elmentettük.';};
A.start=f=>start(f.dataset.v,!!f.elements.adult?.checked,f.elements.rounds.value,f.elements.pack?.value||'base');
A.filter=v=>{if(['all','talk','private','adult'].includes(v))filter=v;};
A.adultOn=()=>{view='honest';history.pushState(null,'','#honest');};
A.adultOff=()=>{adult=false;if(run&&run.adult){run=null;masked=false;}notice='A 18+ hozzáférést és a felnőtt kör válaszait töröltük.';};
A.resume=()=>go('play');
A.unmask=()=>{masked=false;};
A.open=()=>{if(run&&run.phase==='cover')run.phase='answer';};
A.select=v=>{if(!run||masked||!['answer','guess'].includes(run.phase))return;const n=Number(v),max=run.type==='match'?2:1;if(Number.isInteger(n)&&n>=-1&&n<=max)run.selected=n;};
A.confirm=()=>{const s=run;if(!s||masked||s.selected===null||!['answer','guess'].includes(s.phase))return;const value=s.selected===-1?null:s.selected;
 if(s.phase==='answer'){s.answers[s.player][s.pos]=value;if(value!==null)s.answered[s.player]++;s.selected=null;if(s.type==='quiz')s.phase='guess';else advancePrivate(s);}
 else{s.guesses[s.player][s.pos]=value;if(value!==null)s.guessed[s.player]++;advancePrivate(s);}};
function talkNext(skipped){const s=run;if(!s||masked||s.phase!=='talk')return;if(s.type==='truth'&&!s.prompt&&!skipped)return;if(skipped)s.skipped++;else s.count++;s.pos++;s.prompt=null;s.kind=null;if(s.pos>=s.deck.length)s.phase='result';}
A.next=()=>talkNext(false);A.pass=()=>talkNext(true);
A.draw=kind=>{const s=run;if(!s||masked||s.type!=='truth'||s.phase!=='talk'||s.prompt||!['truth','dare'].includes(kind))return;s.kind=kind;s.prompt=s[kind].pop();};
A.stop=()=>{if(run&&run.phase==='talk')run.phase='result';};
A.clear=()=>{if(run&&run.phase!=='result'&&!confirm('Törlöd a kört és az összes eddigi választ?'))return;run=null;masked=false;go('home');};
A.restart=()=>{if(!run||run.phase!=='result')return;const key=run.key,length=run.length,packId=run.packId;run=null;start(key,adult,length,packId);};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el||el.tagName==='FORM')return;const action=A[el.dataset.a];if(action){notice='';action(el.dataset.v);render();}});
document.addEventListener('change',e=>{
 const key=e.target.dataset.packGame;
 if(key&&packFor(key,e.target.value)){
  const rounds=document.getElementById('round-length');
  if(rounds&&lengths(key).includes(Number(rounds.value)))roundChoice[key]=Number(rounds.value);
  packChoice[key]=e.target.value;render();document.getElementById('pack-select')?.focus();
 }
});
document.addEventListener('submit',e=>{if(!e.target.dataset.a)return;e.preventDefault();const action=A[e.target.dataset.a];if(action){notice='';action(e.target);render();}});
view=route();render();
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
 const update=()=>{document.getElementById('offline').textContent=navigator.onLine?'Offline használatra kész ✓':'Offline mód · ketten is játszhattok';};update();window.addEventListener('online',update);window.addEventListener('offline',update);
}).catch(()=>{document.getElementById('offline').textContent='Az offline csomag még nem érhető el.';});
else document.getElementById('offline').textContent='Páros est · Egy telefon, két ember';
