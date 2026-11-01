/* Páros est. A válaszok kizárólag memóriában élnek; újratöltéskor törlődnek. */
/* A kör (run) fázisai:
   limits-cover → limits (18+ címkézett csomagnál, mindkét játékosnak) → buildDeck()
   beszélgetős és Igazság vagy kihívás: talk → result
   titkos választós: cover → answer → (guess a kvízben) → … → result
   bármikor: halt (18+ Állj), empty (a határok mindent kizártak); a takarás (masked) a fázistól független. */
'use strict';
const DATA=window.PAIR_DATA, PACKS=window.PAIR_PACKS, KEY='paros.preferences.v1';
const GAMES={
 closer:{graded:true,name:'Közelebb hozzád',symbol:'☕',desc:'Kérdések, amelyekből beszélgetés lesz. Lépésről lépésre személyesebben.',type:'talk',time:'10–20 perc',adult:false},
 radar:{name:'Flörtradar',symbol:'✦',desc:'Külön választotok, együtt fedezitek fel, miben vagytok egy hullámhosszon.',type:'radar',time:'5–10 perc',adult:false},
 truth:{name:'Igazság vagy kihívás',symbol:'♧',desc:'Őszinte mondatok és játékos, romantikus ötletek. Bármelyik kör passzolható.',type:'truth',time:'10–15 perc',adult:false},
 match:{name:'Igen, nem, talán',symbol:'◒',desc:'Kíváncsiság, közös ötletek. A végén kizárólag a kölcsönös igenek látszanak.',type:'match',time:'5–10 perc',adult:true},
 honest:{name:'Szexről őszintén',symbol:'♡',desc:'Nyugodt beszélgetés a közelségről, vágyakról, határokról és figyelemről.',type:'talk',time:'15–25 perc',adult:true},
 quiz:{name:'Mennyire ismersz?',symbol:'◎',desc:'Mit választanál te, és mit gondolsz a másikról? Titkos tippek, közös felfedés.',type:'quiz',time:'10–15 perc',adult:false},
 memories:{name:'Emlékösvény',symbol:'❧',desc:'Közös történetek, elfelejtett apróságok és pillanatok, amiket újra felidéznétek.',type:'talk',time:'10–20 perc',adult:false},
 future:{name:'Jövőnk mozaikja',symbol:'◇',desc:'Kis közös tervek és nagy ötletek. Miről álmodtok, és mi lehet az első lépés?',type:'talk',time:'15–25 perc',adult:false},
 bucket:{name:'Közös bakancslista',symbol:'☀',desc:'Válasszatok titokban programötleteket. A közös listára csak a két igen kerül.',type:'match',time:'5–10 perc',adult:false},
 spin:{spin:true,name:'Pajzán pörgető',symbol:'✺',desc:'Egy pörgetés: mit, hol és meddig. Ti döntitek el, belefér-e.',type:'talk',time:'5–15 perc',adult:true},
 dice:{dice:true,name:'Póz- és helyszínkocka',symbol:'⚄',desc:'Egy dobás: póz, hely a lakásban és időtartam. Csak ha mindkettőtöknek belefér.',type:'talk',time:'10–30 perc',adult:true},
 wish:{name:'Titkos kívánság',symbol:'✧',desc:'Mindketten titokban leírtok egy kívánságot. Csak akkor derül ki, ha ugyanarra vágytok.',type:'wish',time:'5 perc',adult:true},
 scene:{name:'Szerepjáték',symbol:'◐',desc:'Két szerep, egy helyszín, egy kezdőmondat és egy csavar félidőben. Ti írjátok tovább.',type:'talk',time:'20–40 perc',adult:true}
};
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let prefs={names:['Első játékos','Második játékos']};
try {const p=JSON.parse(localStorage.getItem(KEY));if(p&&Array.isArray(p.names)&&p.names.length===2)prefs.names=p.names.map((x,i)=>typeof x==='string'&&x.trim()?x.trim().slice(0,24):prefs.names[i]);}catch{}
let moodLight=false,installPrompt=null;
let adult=false,run=null,masked=false,view='home',notice='',updateReady=false,arc=null;
// Közös lista és jelölt kártyák: alapból csak memóriában, tárolás külön kapcsolóval (külön kulcsok).
const TOGETHER_KEY='paros.together.v1',MARKS_KEY='paros.marks.v1';
let together={remember:false,items:[]},marks={remember:false,fav:[],never:[]};
try{const t=JSON.parse(localStorage.getItem(TOGETHER_KEY));if(t&&Array.isArray(t.items))together={remember:true,items:t.items.filter(x=>typeof x?.t==='string').map(x=>({t:x.t.slice(0,140),adult:!!x.adult,done:!!x.done})).slice(0,300)};}catch{}
try{const m=JSON.parse(localStorage.getItem(MARKS_KEY));if(m&&Array.isArray(m.fav)&&Array.isArray(m.never))marks={remember:true,fav:m.fav.filter(x=>typeof x==='string').slice(0,500),never:m.never.filter(x=>typeof x==='string').slice(0,500)};}catch{}
function saveStore(key,on,data){try{on?localStorage.setItem(key,JSON.stringify(data)):localStorage.removeItem(key);}catch{notice='Ezt most nem tudjuk megjegyezni ezen az eszközön.';}}
const saveTogether=()=>saveStore(TOGETHER_KEY,together.remember,{items:together.items});
const saveMarks=()=>saveStore(MARKS_KEY,marks.remember,{fav:marks.fav,never:marks.never});
// Saját kártyák: alapból csak memóriában; a tárolás külön kapcsolóval kérhető.
const CUSTOM_KEY='paros.custom.v1',KIND={talk:'Beszélgetés',truth:'Igazság',dare:'Kihívás'};
let custom={remember:false,cards:[]};
try{const c=JSON.parse(localStorage.getItem(CUSTOM_KEY));if(c&&Array.isArray(c.cards))custom={remember:true,cards:c.cards.filter(x=>typeof x?.t==='string'&&x.t.trim()).map(x=>({t:x.t.trim().slice(0,140),kind:Object.hasOwn(KIND,x.kind)?x.kind:'talk'})).slice(0,200)};}catch{}
function saveCustom(){try{custom.remember?localStorage.setItem(CUSTOM_KEY,JSON.stringify({cards:custom.cards})):localStorage.removeItem(CUSTOM_KEY);}catch{notice='A saját kártyákat most nem tudjuk megjegyezni.';}}
const A={};
let filter='all';
const packChoice={},roundChoice={};
function hide(){stopTimer();if(!run)return;masked=true;if(['answer','guess','wish'].includes(run.phase)){run.resume=run.phase;run.phase='cover';run.selected=null;}if(run.phase==='limits'){run.phase='limits-cover';run.draft=new Set();}}
const TAGS=new Set(['anal','oral','testnedv','fajdalom','kotozes','foto','szerep','jatekszer','harmadik','mult','erintes','meztelen','pozicio']);
const PACK_LVL={scene:3,chemistry:2,spark:2,desires:2,intimacy:2,fire:3,naughty:3,wishlist:3,frank:3};
// Minden kártya egységes objektum: {t, opts?, lvl, tags, sec, body}. A data.js-ben szöveg, tömb vagy objektum is lehet.
function card(x,lvl){
 if(typeof x==='string')return {t:x,lvl,tags:[],sec:0,body:null};
 if(Array.isArray(x)){const m=x[3]&&typeof x[3]==='object'?x[3]:{};return {t:x[0],opts:[x[1],x[2]],lvl:m.lvl||lvl,tags:m.tags||[],sec:0,body:m.body||null};}
 return {tags:[],sec:0,body:null,...x,lvl:x.lvl||lvl};
}
const packCache=new Map();
function packsFor(key){
 if(!Object.hasOwn(GAMES,key))return [];
 if(packCache.has(key))return packCache.get(key);
 const base=GAMES[key].type==='truth'?{truth:DATA.truth,dare:DATA.dare}:{items:key==='scene'?window.PAIR_SCENES:DATA[key]};
 const list=[{id:'base',name:'Alapcsomag',adult:GAMES[key].adult,...base},...(PACKS[key]||[])].map(p=>{const lvl=PACK_LVL[p.id]||(p.id==='base'&&PACK_LVL[key])||1,norm=cards=>cards?.map(c=>card(c,lvl));return {...p,lvl,items:norm(p.items),truth:norm(p.truth),dare:norm(p.dare)};});
 packCache.set(key,list);return list;
}
const packFor=(key,id='base')=>packsFor(key).find(p=>p.id===id);
const SPICY=new Set(['fire','naughty','wishlist','frank']);
const adultPacks=key=>(PACKS[key]||[]).filter(p=>p.adult);
const packLabel=p=>p.name.split(' · ')[0];
const cardCount=()=>Object.values(DATA).reduce((sum,cards)=>sum+cards.length,0)+Object.values(PACKS).flat().reduce((sum,p)=>sum+(p.items?.length||0)+(p.truth?.length||0)+(p.dare?.length||0),0);

const lengths=key=>key==='wish'?[1]:key==='scene'?[1,3,6]:['talk','truth'].includes(GAMES[key].type)?[6,12,24]:[4,8,12];
const defaultLength=key=>key==='scene'||key==='wish'?1:['talk','truth'].includes(GAMES[key].type)?12:8;
const visibleGame=(g,key)=>filter==='all'||filter==='adult'&&(g.adult||(PACKS[key]||[]).some(p=>p.adult))||filter==='talk'&&g.type==='talk'||filter==='private'&&['match','radar','quiz','wish'].includes(g.type);
function savePrefs(){try{localStorage.setItem(KEY,JSON.stringify({names:prefs.names}));return true;}catch{notice='A neveket most nem tudjuk megjegyezni. A játék ettől még működik.';return false;}}
function route(){const h=location.hash.slice(1);return h==='settings'||h==='play'||Object.hasOwn(GAMES,h)?h:'home';}
function go(v){if(v!==view)hide();view=v;const hash=v==='home'?'#home':'#'+v;if(location.hash!==hash)history.pushState(null,'',hash);render();window.scrollTo(0,0);app.focus({preventScroll:true});}
window.addEventListener('popstate',()=>{hide();view=route();render();});
window.addEventListener('hashchange',()=>{hide();view=route();render();});
function conceal(){if(run){hide();render();}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(view==='settings')render();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&run&&!masked)conceal();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')conceal();});
window.addEventListener('pagehide',hide);
window.addEventListener('pageshow',()=>render());
const btn=(action,label,value='',primary=false)=>`<button class="btn${primary?' primary':''}" data-a="${action}" data-v="${value}">${label}</button>`;
const back=()=>'<a class="back small" href="#home">← A játékokhoz</a>';
const progress=s=>`${s.short?`<p class="muted small">A határaitok miatt ez a kör ${s.deck.length} kártyás.</p>`:''}<div class="counter">${esc(s.packName)} · ${s.pos+1} / ${s.deck.length}${s.opts.score?` · ${esc(s.names[0])} ${s.points[0]} – ${s.points[1]} ${esc(s.names[1])}`:''}</div><progress max="${s.deck.length}" value="${s.pos+1}" aria-label="Haladás"></progress>`;
const pass=()=>`<div class="actions">${btn('pass','Passzolok')}${btn('stop','Kör lezárása')}</div><p class="muted small">Passzolni bármikor lehet, indoklás nélkül. Egy válasz sem ígéret vagy kötelezettség.</p>`;
const MOODS={talk:'Beszélgetős',play:'Játékos',spicy:'Pajzán'};
const PLAN=[[10,'talk',1,'closer','base',6],[20,'talk',1,'memories','base',12],[30,'talk',2,'future','base',12],[30,'talk',2,'honest','intimacy',12],[60,'talk',3,'honest','frank',24],
 [10,'play',1,'quiz','base',4],[20,'play',1,'radar','base',8],[30,'play',2,'radar','chemistry',8],[30,'play',2,'truth','spark',12],[30,'play',3,'radar','fire',8],[60,'play',3,'truth','naughty',24],
 [10,'spicy',2,'match','desires',4],[10,'spicy',3,'spin','base',6],[30,'spicy',3,'match','wishlist',8],[30,'spicy',3,'spin','base',12],[60,'spicy',3,'truth','naughty',24],[60,'spicy',3,'scene','base',3]];
// A legjobban illeszkedő ajánlatok közül véletlenszerűen választ, így ugyanarra a beállításra is változatos.
function planPick(min,mood,lvl){const c=PLAN.filter(p=>p[0]<=min&&p[1]===mood&&p[2]<=lvl);if(!c.length)return null;const best=Math.max(...c.map(p=>p[2]*100+p[0]));const top=c.filter(p=>p[2]*100+p[0]>=best-30);return top[Math.floor(Math.random()*top.length)];}
const ARCS={slow:{name:'Lassú tűz',steps:[['closer','base',6],['radar','chemistry',8],['truth','spark',12],['spin','base',6]]},deep:{name:'Mély beszélgetés',steps:[['closer','base',6],['memories','base',6],['future','base',6],['honest','intimacy',6]]},wild:{name:'Vad éjszaka',steps:[['radar','fire',8],['truth','naughty',12],['match','wishlist',8],['spin','base',12]]}};
const arcStep=()=>arc&&run&&ARCS[arc.id].steps[arc.step][0]===run.key?arc.step:null;
function arcNext(){const i=arcStep();if(i===null)return '';const next=ARCS[arc.id].steps[i+1];return next?btn('arcNext',`Következő: ${GAMES[next[0]].name}`,'',true):`<p class="muted small">Ez volt „${esc(ARCS[arc.id].name)}” utolsó állomása.</p>`;}
function startStep(){const [key,packId,len]=ARCS[arc.id].steps[arc.step],pack=packFor(key,packId);if((GAMES[key].adult||pack.adult)&&!adult){packChoice[key]=packId;roundChoice[key]=len;go(key);return;}run=null;start(key,adult,len,packId);}
// Napi kérdés: a dátumból választott kártya, így két telefonon is ugyanaz, tárolás nélkül.
function daily(){const pool=[...DATA.closer,...DATA.memories],d=new Date(),k=d.getFullYear()*372+d.getMonth()*31+d.getDate();return card(pool[(Math.imul(k,2654435761)>>>0)%pool.length],1).t;}
function homeExtras(){const visible=together.items.map((x,i)=>[x,i]).filter(([x])=>!x.adult||adult);
 return `<section class="panel"><span class="eyebrow">A mai kérdésetek</span><p class="question daily">${esc(daily())}</p></section>
 <details class="panel fold"><summary>Ma este… · ajánlj nekünk valamit</summary><form class="wizard" data-a="plan"><div class="wizard-grid"><label for="plan-min">Időtök<select id="plan-min" name="min"><option value="10">kb. 10 perc</option><option value="30" selected>kb. 30 perc</option><option value="60">egy óra vagy több</option></select></label><label for="plan-mood">Hangulat<select id="plan-mood" name="mood">${Object.entries(MOODS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label for="plan-lvl">Merészség<select id="plan-lvl" name="lvl"><option value="1">Szelíd</option><option value="2">Flörtös</option><option value="3">Mocskos (18+)</option></select></label></div><button class="btn primary">Ajánlj valamit</button></form></details>
 <details class="panel fold"><summary>Az este íve · több játék egymás után</summary><p class="muted small">Több játék egymás után, egyre közelebb. A határlistát elég egyszer kitölteni, az egész ívre érvényes, és az ív végén törlődik.</p><div class="actions">${Object.entries(ARCS).map(([id,a])=>btn('arc',`${a.name} · ${a.steps.length} állomás`,id)).join('')}</div></details>
 ${visible.length?`<section class="panel"><h2>Közös listánk</h2><ul class="custom-list">${visible.map(([x,i])=>`<li><span${x.done?' class="muted"':''}>${x.done?'✓ ':''}${esc(x.t)}</span><span class="actions">${btn('togetherDone',x.done?'Mégsem':'Megvolt',String(i))}${btn('togetherDel','Törlés',String(i))}</span></li>`).join('')}</ul></section>`:''}`;}
function home(){return `${updateReady&&!run?`<div class="panel update-banner" role="status"><span>Új változat érhető el.</span>${btn('reload','Frissítés','',true)}</div>`:''}<section class="hero pair-hero"><div class="pair-hero-copy"><div class="eyebrow">Páros est / Egy telefon · Két ember</div><h1>Egy kicsit<br>közelebb egymáshoz.</h1><p>${Object.keys(GAMES).length} játék és ${cardCount()} kérdés, kihívás vagy közös ötlet. Van helye a kíváncsiságnak, a nevetésnek és a passzolásnak is.</p><div class="actions hero-actions"><a class="btn primary" href="#closer">Kezdjük egy beszélgetéssel <span class="link-arrow" aria-hidden="true"></span></a><button class="btn adult-entry" data-a="filter" data-v="adult">18+ játékok és mocskos csomagok</button>${btn('surprise','Lepj meg egy játékkal')}</div><div class="pair-hero-meta"><span>${Object.keys(GAMES).length} játék</span><span>Csak ti ketten</span><span>A saját tempótokban</span></div></div><figure class="pair-hero-visual"><img src="images/together-photo.webp" alt="" width="900" height="1350" fetchpriority="high"><figcaption>Idő, amit egymásnak adtok.</figcaption></figure></section>${run?`<div class="panel"><h3>Van egy megkezdett körötök</h3><div class="actions">${btn('resume','Folytatjuk','',true)}${btn('clear','Törlöm a kört')}</div></div>`:''}<section class="pair-library-heading"><div><span class="eyebrow">Egy este, több lehetőség</span><h2>Most mire lenne kedvetek?</h2></div><span class="muted">Beszélgetés. Kíváncsiság. Közös élmények.</span></section><div class="actions pair-filters" role="group" aria-label="Játékok szűrése">${Object.entries({all:'Minden játék',talk:'Beszélgetés',private:'Titkos választás',adult:'18+'}).map(([key,label])=>`<button class="btn${filter===key?' selected':''}" data-a="filter" data-v="${key}" aria-pressed="${filter===key}">${label}</button>`).join('')}</div>${filter==='adult'?'<p class="adult-banner">Új: négy mocskos csomag. A játékon belül a Kérdéscsomag menüben választhatók.</p>':''}<div class="games">${Object.entries(GAMES).filter(([key,g])=>visibleGame(g,key)).map(([key,g])=>`<a class="game" href="#${key}"><span class="symbol" aria-hidden="true">${String(Object.keys(GAMES).indexOf(key)+1).padStart(2,'0')}</span><span class="title">${g.name} ${g.adult?'<span class="tag">18+</span>':''}${adultPacks(key).length?`<span class="tag">${esc(adultPacks(key).map(packLabel).join(', '))}</span>`:''}</span><span class="desc">${g.desc}</span><span class="meta">2 fő · ${g.time} ›</span></a>`).join('')}</div>${homeExtras()}<div class="panel small muted privacy-note">A válaszaitok csak a most nyitott oldal memóriájában maradnak. Újratöltéskor vagy a kör törlésekor elvesznek. A neveket ezen az eszközön megjegyezzük.</div>`;}
function settings(){return `${back()}<section class="panel"><h2>Ti ketten</h2><form data-a="names"><div class="names"><label>Első játékos<input name="first" maxlength="24" required value="${esc(prefs.names[0])}" autocomplete="off"></label><label>Második játékos<input name="second" maxlength="24" required value="${esc(prefs.names[1])}" autocomplete="off"></label></div><button class="btn primary">Nevek mentése</button></form><p class="muted small">A megkezdett körben a korábban megadott nevek maradnak.</p></section><section class="panel"><h3>18+ játékok</h3><p class="muted small">A felnőtt témák kapcsolati beszélgetést és kölcsönös döntéseket segítenek. A hozzáférést ezen az oldalon kell bekapcsolni.</p>${adult?btn('adultOff','18+ játékok kikapcsolása'):btn('adultOn','18+ játékok bekapcsolása')}</section><section class="panel"><h3>Saját kártyák</h3><p class="muted small">Saját kérdések és kihívások a beszélgetős játékokhoz és az Igazság vagy kihíváshoz. Alapból csak addig maradnak meg, amíg az oldal nyitva van.</p><form data-a="customAdd"><label for="custom-text">Új kártya<input id="custom-text" name="text" maxlength="140" required autocomplete="off"></label><label for="custom-kind">Típus<select id="custom-kind" name="kind">${Object.entries(KIND).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><button class="btn primary">Hozzáadás</button></form>${custom.cards.length?`<ul class="custom-list">${custom.cards.map((c,i)=>`<li><span>${esc(c.t)} <span class="tag">${KIND[c.kind]}</span></span>${btn('customDel','Törlés',String(i))}</li>`).join('')}</ul>${btn('customClear','Mind törlése')}`:''}<label class="check"><input type="checkbox" data-custom-remember ${custom.remember?'checked':''}><span>Megjegyzés ezen az eszközön. Bárki láthatja, aki ezt a telefont használja.</span></label></section><section class="panel"><h3>Közös lista és jelölt kártyák</h3><p class="muted small">A közös lista a kölcsönös igenekből áll; a „Soha többé” kártyák nem jönnek elő újra. ${marks.fav.length} kedvenc, ${marks.never.length} kizárt kártya.</p><label class="check"><input type="checkbox" data-store="together" ${together.remember?'checked':''}><span>A közös lista maradjon meg ezen az eszközön.</span></label><label class="check"><input type="checkbox" data-store="marks" ${marks.remember?'checked':''}><span>A kedvencek és a kizárt kártyák maradjanak meg ezen az eszközön.</span></label>${marks.fav.length?`<ul class="custom-list">${marks.fav.map(t=>`<li><span>♥ ${esc(t)}</span></li>`).join('')}</ul>`:''}${marks.never.length||marks.fav.length?btn('marksClear','Jelölések törlése'):''}</section>${matchMedia('(display-mode: standalone)').matches?'':`<section class="panel"><h3>Tedd a kezdőképernyőre</h3><p class="muted small">Így egy koppintással indul, és internet nélkül is működik.</p>${installPrompt?btn('install','Telepítés erre az eszközre','',true):''}<ul class="small"><li><b>iPhone, iPad (Safari):</b> Megosztás gomb → „Főképernyőhöz adás”.</li><li><b>Android (Chrome):</b> jobb felső menü → „Alkalmazás telepítése” vagy „Hozzáadás a kezdőképernyőhöz”.</li><li><b>Számítógép (Chrome, Edge):</b> a címsor végén a telepítés ikon.</li></ul></section>`}${run?btn('resume','Vissza a körhöz','',true):''}`;}
function setup(key){const g=GAMES[key],spicy=filter==='adult'?packsFor(key).find(p=>SPICY.has(p.id)):null,pack=packFor(key,packChoice[key]||spicy?.id||'base'),size=roundChoice[key]||defaultLength(key);return `${back()}<div class="hero"><span class="eyebrow">${g.time} · Ketten</span><h1>${g.name}</h1><p>${g.desc}</p></div><section class="panel"><h2>Így játsszatok</h2><p>${g.type==='talk'?'Felváltva kaptok egy kérdést. Hallgassátok meg egymást, időkorlát és pontozás nélkül. A kör bármikor lezárható.':g.type==='truth'?'Felváltva választotok igazságot vagy kihívást. A megjelenő ötletet közösen mérlegeljétek; érintés csak külön, kölcsönös beleegyezéssel történjen. Teljesítés és passzolás után sincs pont vagy büntetés.':g.type==='quiz'?'Mindketten titokban megadjátok a saját válaszotokat, és megtippelitek a másikét is. A második játékos csak az összes saját válasza és tippje után láthatja az eredményt. Minden helyes tipp 1 pont.':g.type==='match'?'Mindketten külön válaszoltok a kiválasztott ötletekre: igen, nem vagy talán. A passz is külön lehetőség. Kizárólag a két igenből születő egyezések látszanak; a többi egyéni válasz soha. Az egyezés beszélgetési lehetőség, nem vállalás.':(pack.adult?'Mindketten titokban választotok a kérdéseknél. A végén csak azok a kérdések látszanak, ahol ugyanazt választottátok; a többi egyéni válasz soha. A passz kimarad.':'Mindketten titokban választotok a kérdéseknél. A végén a válaszaitok együtt jelennek meg; eltérni is teljesen rendben van. A passz kimarad az összehasonlításból.')}</p><p class="muted small">A telefon átadásakor takarjuk a válaszokat. Újratöltéskor a kör és a válaszok törlődnek. Kényes beszélgetéshez nyugodt, közösen választott pillanatot keressetek.</p></section><form class="panel" data-a="start" data-v="${key}">${packsFor(key).length>1?`<label for="pack-select">Kérdéscsomag<select id="pack-select" name="pack" data-pack-game="${key}">${packsFor(key).map(p=>`<option value="${p.id}" ${p.id===pack.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><p class="muted small">A csomagot a kör indítása előtt közösen válasszátok ki. A 18+ csomagokhoz felnőtt megerősítés szükséges.</p>`:''}<label for="round-length">Körhossz<select id="round-length" name="rounds">${lengths(key).map(n=>`<option value="${n}" ${n===size?'selected':''}>${n} ${g.type==='truth'?'kártya':g.type==='talk'?'kérdés':'kérdés fejenként'}${n===lengths(key)[0]?' · rövid':n===defaultLength(key)?' · normál':' · hosszú'}</option>`).join('')}</select></label>${key==='memories'?'<label for="since">Mióta vagytok együtt? (nem kötelező)<input id="since" name="since" type="month"></label>':''}${g.type==='truth'?'<label class="check"><input name="score" type="checkbox"><span>Pontozzunk: az igazság 1, a kihívás 2 pont, a passz 0. Mínusz pont nincs.</span></label>':''}${key==='truth'&&pack.id==='naughty'?'<label class="check"><input name="escalate" type="checkbox"><span>Fokozatosan durvuljon: a kör első harmada a Flört és szikra csomagból jön.</span></label>':''}${['talk','truth'].includes(g.type)&&!g.spin&&custom.cards.length?`<label for="custom-mode">Saját kártyák<select id="custom-mode" name="custom"><option value="mix">Keverve a csomaggal</option><option value="only">Csak a sajátjaink</option><option value="none">Nélkülük</option></select></label>`:''}${(g.adult||pack.adult)&&!adult?'<label class="check"><input name="adult" type="checkbox" required><span>Mindketten elmúltunk 18 évesek, és szeretnénk megnyitni ezt a játékot.</span></label>':''}<button class="btn primary">Kezdjük · ${esc(prefs.names.join(' és '))}</button></form>`;}
function start(key,consent,length,packId='base',opts={}){const g=GAMES[key],pack=packFor(key,packId);if(!Object.hasOwn(GAMES,key)||!pack||(g.adult||pack.adult)&&!adult&&!consent)return;if(run&&!confirm('Új kör indításakor a mostani válaszok végleg törlődnek. Mehet?'))return;if(g.adult||pack.adult)adult=true;
 const type=g.type;const requested=Number(length),size=lengths(key).includes(requested)?requested:defaultLength(key);run={key,type,opts,jokers:[2,2],points:[0,0],length:size,packId:pack.id,packName:pack.name,adult:g.adult||pack.adult,names:prefs.names.slice(),pos:0,player:0,opened:false,phase:['talk','truth'].includes(type)?'talk':'cover',answers:[[],[]],guesses:[[],[]],selected:null,count:0,skipped:0,answered:[0,0],guessed:[0,0]};
 if(opts.escalate&&pack.id==='naughty')run.mild=packFor(key,'spark');
 if(type==='wish'){Object.assign(run,{deck:[null],wishes:[null,null],phase:'cover'});masked=false;go('play');masked=false;render();keepAwake(true);return;}
 const tagged=g.spin||g.dice||[...(pack.items||[]),...(pack.truth||[]),...(pack.dare||[])].some(c=>c.tags.length);
 if(run.adult&&tagged&&arc?.excluded){run.excluded=new Set(arc.excluded);buildDeck(run,pack);}
 else if(run.adult&&tagged)Object.assign(run,{phase:'limits-cover',limitPlayer:0,excluded:new Set(),draft:new Set(),pack});
 else buildDeck(run,pack);
 masked=false;go('play');masked=false;render();keepAwake(true);}
// A két játékos határainak csak az uniója szűri a paklit; a pakli összeállítása után a határok is törlődnek.
// A munkamenetben már látott kártyák (csak memóriában): az új kör először a még nem látottakból válogat.
const seen=new Map();
const seenFor=s=>{const k=s.key+':'+s.packId;if(!seen.has(k))seen.set(k,new Set());return seen.get(k);};
const freshFirst=(cards,used)=>shuffle(cards).sort((a,b)=>used.has(a.t)-used.has(b.t));
function buildDeck(s,pack){
 const used=seenFor(s);
 const ok=c=>!c.tags.some(t=>s.excluded?.has(t))&&!marks.never.includes(c.t),only=s.opts.custom==='only';
 const mine=kind=>s.opts.custom&&s.opts.custom!=='none'&&['talk','truth'].includes(s.type)&&!GAMES[s.key].spin?custom.cards.filter(c=>c.kind===kind).map(c=>card(c.t,2)):[];
 const pool=(cards,kind)=>only?mine(kind):[...(cards||[]).filter(ok),...mine(kind)];
 if(GAMES[s.key].spin)s.deck=Array.from({length:s.length},()=>spinOnce(s.excluded||new Set())).filter(Boolean);
 else if(GAMES[s.key].dice)s.deck=Array.from({length:s.length},()=>diceOnce(s.excluded||new Set())).filter(Boolean);
 else if(s.type==='truth'){
  s.truth=freshFirst(pool(pack.truth,'truth'),used).reverse();s.dare=freshFirst(pool(pack.dare,'dare'),used).reverse();
  if(s.mild&&!only)s.sources={mild:{truth:shuffle(s.mild.truth.filter(ok)),dare:shuffle(s.mild.dare.filter(ok))},hot:{truth:s.truth,dare:s.dare}};
  const total=s.truth.length+s.dare.length+(s.sources?s.sources.mild.truth.length+s.sources.mild.dare.length:0);
  s.deck=Array(Math.min(s.length,total)).fill(null);s.prompt=null;
 }else{const cards=[...anniversaryCards(s.opts.since),...pool(pack.items,'talk')];s.deck=GAMES[s.key].graded&&!only?graded(cards,s.length,used):[...cards.filter(c=>c.anniv),...freshFirst(cards.filter(c=>!c.anniv),used)].slice(0,s.length);s.deck.forEach(c=>used.add(c.t));}
 s.short=s.deck.length<s.length;s.excluded=null;s.draft=null;s.pack=null;s.mild=null;s.player=0;s.pos=0;
 s.phase=!s.deck.length?'empty':['talk','truth'].includes(s.type)?'talk':'cover';
}
// Szintenként kevert, szint szerint növekvő pakli; minden szint a körhossz arányos részét adja.
// Évforduló mód: a megadott hónapból számolt időtartammal négy személyre szabott kártya kerül a pakli elejére.
function anniversaryCards(since){
 const m=/^(\d{4})-(\d{2})$/.exec(since||'');if(!m)return [];
 const now=new Date(),months=(now.getFullYear()-Number(m[1]))*12+now.getMonth()+1-Number(m[2]);if(months<1||months>900)return [];
 const y=Math.floor(months/12),r=months%12,d=y?`${y} év${r?` és ${r} hónap`:''}`:`${r} hónap`;
 return [`Mi változott bennünk az együtt töltött ${d} alatt?`,`Melyik napunk volt a legszebb az elmúlt ${d} alatt?`,`Mire vagy a legbüszkébb kettőnkben ${d} után?`,`Mit kívánsz kettőnknek a következő ${y?'évre':'hónapokra'}?`].map(t=>({t,lvl:1,tags:[],sec:0,body:null,anniv:true}));
}
function graded(cards,size,used=new Set()){
 const levels=[1,2,3].map(l=>freshFirst(cards.filter(c=>c.lvl===l),used)).filter(x=>x.length);
 const quota=levels.map((_,i)=>Math.floor(size*(i+1)/levels.length)-Math.floor(size*i/levels.length));
 const deck=levels.flatMap((x,i)=>x.slice(0,quota[i]));
 for(const c of levels.flatMap((x,i)=>x.slice(quota[i]))){if(deck.length>=size)break;deck.push(c);}
 return deck.sort((a,b)=>a.lvl-b.lvl);
}
function diceOnce(excluded){
 const D=window.PAIR_DICE,poses=D.poses.filter(x=>!x.tags.some(t=>excluded.has(t)));
 if(!poses.length)return null;
 const pick=a=>a[Math.floor(Math.random()*a.length)],pose=pick(poses),place=pick(D.places),sec=pick(D.secs);
 return {t:`${pose.t}, ${place.t}, ${sec/60} percig.`,lvl:3,tags:[...pose.tags],sec,body:null};
}
function spinOnce(excluded){
 const S=window.PAIR_SPIN;
 const parts=S.parts.filter(p=>!(p.tags||[]).some(t=>excluded.has(t))),acts=S.acts.filter(a=>!a.tags.some(t=>excluded.has(t)));
 const pairs=parts.flatMap(p=>acts.filter(a=>p.acts.includes(a.id)).map(a=>[a,p]));
 if(!pairs.length)return null;
 const [a,p]=pairs[Math.floor(Math.random()*pairs.length)],sec=S.secs[Math.floor(Math.random()*S.secs.length)];
 return {t:`${a.t} ${p.t} ${sec} másodpercig.`,lvl:3,tags:[...a.tags,...(p.tags||[])],sec,body:null};
}
const LIMITS=[['anal','Anál'],['oral','Orális'],['testnedv','Testnedvek, elélvezés'],['fajdalom','Fájdalom, paskolás, nyomok'],['kotozes','Kötözés, irányítás, megalázás'],['foto','Fotó, videó'],['szerep','Szerepjáték'],['jatekszer','Szexjátékok'],['harmadik','Harmadik személy'],['mult','Korábbi partnerek'],['meztelen','Meztelenség']];
function limitsCover(s){return `<div class="panel"><span class="eyebrow">Határok · titokban</span><h2>Most ${esc(s.names[s.limitPlayer])} következik</h2><p class="muted">A másik játékos forduljon el. Kijelölheted, mi nem fér most bele. A másik nem látja, mit választottál.</p></div><div class="card"><span class="privacy" aria-hidden="true">◒</span><p class="question">Nálad van a telefon?</p></div>${btn('openLimits','Igen, mutasd','',true)}${btn('clear','Kör törlése')}`;}
function limits(s){return `<div class="counter">${esc(s.names[s.limitPlayer])} · Határaid</div><div class="panel"><h2>Mi az, ami most nem fér bele?</h2><p class="muted">Ezek a kártyák nem kerülnek a pakliba. Senki nem látja, ki mit jelölt; legfeljebb annyi derül ki, ha rövidebb lett a kör.</p></div><div class="choices">${LIMITS.map(([id,label])=>`<button class="btn${s.draft.has(id)?' selected':''}" aria-pressed="${s.draft.has(id)}" data-a="limit" data-v="${id}">${esc(label)}</button>`).join('')}</div>${btn('limitsDone',s.draft.size?'Kész, jöhet a másik':'Mindent vállalok','',true)}`;}
const WISH_CATS=['Romantikus este','Új hely a lakásban','Szerepjáték','Kötözés, irányítás','Orális kényeztetés','Új játékszer','Lassú, hosszú együttlét','Durvább menet','Valami, amit még sosem csináltunk'];
function wishView(s){return `<div class="counter">${esc(s.names[s.player])} · Titkos kívánság</div><form class="panel" data-a="wishSave"><h2>Mire vágysz most?</h2><p class="muted small">Válassz egy témát, és írd le pár szóban. A kívánságod csak akkor derül ki, ha a másik ugyanazt a témát választja; különben senki nem látja.</p><label for="wish-cat">Téma<select id="wish-cat" name="cat">${WISH_CATS.map((c,i)=>`<option value="${i}">${esc(c)}</option>`).join('')}</select></label><label for="wish-text">A kívánságod<textarea id="wish-text" name="text" maxlength="140" rows="3" required></textarea></label><button class="btn primary">Titokban elmentem</button></form>`;}
function cover(s){return `${s.short?`<p class="muted small">A határaitok miatt ez a kör ${s.deck.length} kártyás.</p>`:''}<div class="panel"><span class="eyebrow">${GAMES[s.key].name}</span><h2>Most ${esc(s.names[s.player])} következik</h2><p class="muted">A másik játékos forduljon el. A válaszaid a megerősítés után eltűnnek a kijelzőről.</p></div><div class="card"><span class="privacy" aria-hidden="true">◒</span><p class="question">Nálad van a telefon?</p></div>${btn('open','Igen, mutasd','',true)}${btn('clear','Kör törlése')}`;}
function play(){const html=playView(),live=run&&!masked&&['talk','answer','guess','wish'].includes(run.phase);return live?`<div class="halt-row">${btn('mood',moodLight?'Hangulatfény ki':'Hangulatfény')}${run.adult&&run.phase!=='wish'?btn('halt','Állj'):''}</div>`+html:html;}
function playView(){const s=run;if(!s)return `<div class="panel"><h2>A korábbi kör már nincs meg</h2><p>A személyes válaszokat nem mentjük. Kezdjetek új játékot!</p></div>${back()}`;
 if(masked)return `<div class="card"><span class="privacy" aria-hidden="true">🔒</span><h2>A kör elrejtve</h2><p>A megfelelő játékosnál van a telefon?</p></div>${btn('unmask','Nálam a telefon, folytatom','',true)}${btn('clear','Kör törlése')}`;
 if(s.phase==='result')return result(s);
 if(s.phase==='limits-cover')return limitsCover(s);
 if(s.phase==='wish')return wishView(s);
 if(s.phase==='limits')return limits(s);
 if(s.phase==='empty')return `<div class="panel"><h2>Ebben a csomagban most nem maradt kártya</h2><p>A határaitok mindent kizártak. Válasszatok másik csomagot, vagy kezdjétek újra.</p></div>${btn('clear','Vissza a játékokhoz','',true)}`;
 if(s.phase==='halt')return `<div class="card"><h2>Megálltunk.</h2><p>Semmit nem kell megmagyarázni. Igyatok egy pohár vizet, öleljétek meg egymást, ha jólesik.</p></div>${btn('haltResume','Folytatjuk')}${btn('haltGentle','Szelídebb csomaggal tovább','',true)}${btn('haltEnd','Vége a körnek')}`;
 if(s.phase==='cover')return cover(s);
 if(s.phase==='talk'){
 const q=s.type==='truth'?s.prompt:s.deck[s.pos];return `<div class="counter">${esc(GAMES[s.key].name)} · ${esc(s.names[s.pos%2])} köre</div>${progress(s)}<div class="card"><span class="eyebrow">${s.type==='truth'?(s.kind==='truth'?'Igazság':s.kind==='dare'?'Kihívás':'Te választasz'):GAMES[s.key].spin?'Pörgetés':GAMES[s.key].dice?'Dobás':'Beszélgetőkártya'}</span><div class="question">${q?esc(q.t):'Igazságot mondasz vagy kihívást választasz?'}</div>${photoNote(q)}</div>${q?.detail?`<ul class="scene-detail">${q.detail.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${s.follow?`<p class="follow">↳ ${esc(s.follow)}</p>`:''}${timerView(q)}${q?cardTools(s,q):''}${s.type==='truth'&&!q?`<div class="actions">${btn('draw','Igazság','truth',true)}${btn('draw','Kihívás','dare')}</div>`:btn('next',s.type==='truth'?'Kész, következő kör':(GAMES[s.key].spin?'Kész, jöhet a következő pörgetés':GAMES[s.key].dice?'Kész, dobunk újra':'Beszélgettünk, jöhet a következő'),'',true)}${pass()}`;}
 const q=s.deck[s.pos],isQuiz=s.type==='quiz';const opts=s.type==='match'?['Igen','Nem','Talán']:q.opts;
 return `<div class="counter">${esc(s.names[s.player])} · ${isQuiz&&s.phase==='guess'?'Tipp a másikról':'Saját válasz'}</div>${progress(s)}<div class="card"><span class="eyebrow">${isQuiz&&s.phase==='guess'?`Szerinted ${esc(s.names[1-s.player])} mit választott?`:'Válaszd azt, ami most igaz rád'}</span><div class="question">${esc(q.t)}</div>${photoNote(q)}</div><div class="choices">${opts.map((text,i)=>`<button class="btn${s.selected===i?' selected':''}" aria-pressed="${s.selected===i}" data-a="select" data-v="${i}">${esc(text)}</button>`).join('')}<button class="btn${s.selected===-1?' selected':''}" aria-pressed="${s.selected===-1}" data-a="select" data-v="-1">Passzolok</button></div><button class="btn primary" data-a="confirm" ${s.selected===null?'disabled':''}>${isQuiz&&s.phase==='answer'?'Válasz mentése, jöhet a tippem':'Rögzítem és továbblépek'}</button><p class="muted small">A válaszod nem kötelez semmire. ${s.type==='match'?'Csak a kölcsönös igeneket mutatjuk meg.':'Az eredmény csak mindkettőtök válaszai után jelenik meg.'}</p>${btn('clear','Kör törlése')}`;
}
function advancePrivate(s){s.pos++;s.selected=null;if(s.pos>=s.deck.length){if(s.player===0){s.player=1;s.pos=0;s.phase='cover';}else resolve(s);}else s.phase='answer';}
function resolve(s){
 const rows=[],scores=[0,0],guessed=[0,0];
 s.deck.forEach((q,i)=>{const a=s.answers[0][i],b=s.answers[1][i];if(s.type==='match'){if(a===0&&b===0)rows.push({text:q.t});return;}
 if(s.type==='radar'){if(a===null||b===null)return;if(s.adult){if(a===b)rows.push({text:q.t,shared:q.opts[a],same:true});return;}rows.push({text:q.t,values:[q.opts[a],q.opts[b]],same:a===b});return;}
 const scored=[s.guesses[0][i]!=null&&b!=null,s.guesses[1][i]!=null&&a!=null],correct=[scored[0]&&s.guesses[0][i]===b,scored[1]&&s.guesses[1][i]===a];scored.forEach((v,p)=>{if(v)guessed[p]++;if(correct[p])scores[p]++;});rows.push({text:q.t,values:[a===null?'Passz':q.opts[a],b===null?'Passz':q.opts[b]],correct});
 });s.rows=rows;s.scores=scores;s.guessed=guessed;s.answers=[[],[]];s.guesses=[[],[]];s.selected=null;s.phase='result';s.opened=false;}
function result(s){
 if(s.type==='wish')return s.wishCat?`<div class="hero"><span class="eyebrow">Titkos kívánság · ${esc(s.wishCat)}</span><h1>Ugyanarra vágytok.</h1><p>Mindketten ezt a témát választottátok. Egy közös vágy nem ígéret: beszéljétek meg, most is jólesne-e.</p></div><div class="panel">${s.rows.map((r,i)=>`<div class="match-item"><h3>${esc(s.names[i])}</h3><p>${esc(r.text)}</p></div>`).join('')}</div>${btn('restart','Új kör','',true)}${btn('clear','Törlés és vissza')}`:`<div class="hero"><span class="eyebrow">Titkos kívánság</span><h1>Most másra vágytok.</h1><p>A kívánságaitokat nem mutatjuk meg, és már nincsenek is meg. Semmit sem kell megmagyarázni.</p></div>${btn('restart','Új kör','',true)}${btn('clear','Vissza')}`;
 if(s.type==='talk'||s.type==='truth')return `<div class="hero"><span class="eyebrow">Egy közös pillanat</span><h1>Ennyi is számít.</h1><p>${s.count} kártyánál időztetek el, ${s.skipped} kártyát passzoltatok.${s.opts.score?` Pontok: ${esc(s.names[0])} ${s.points[0]}, ${esc(s.names[1])} ${s.points[1]}.`:''} Köszönjétek meg egymásnak, amit megosztottatok.</p></div>${arcNext()}${btn('restart','Új kör','',!arcStep())}${btn('clear','Kör törlése és vissza')}`;
 const matches=s.rows.filter(x=>x.same).length;return `<div class="hero"><span class="eyebrow">${GAMES[s.key].name}</span><h1>${s.type==='match'?'Amire mindketten igent mondtatok.':s.type==='quiz'?'Mennyire találtatok egymásra?':'Két nézőpont, egy közös este.'}</h1><p>${s.type==='match'?'Az egyéni nemek, talánok és passzok nem jelennek meg. Egy közös igen nem ígéret: beszéljétek meg, most is jólesne-e.':s.type==='radar'&&s.adult?'Csak az egyező válaszaitok látszanak. A többit nem mutatjuk és nem őrizzük meg.':s.type==='radar'?`${s.rows.length} közösen megválaszolt kérdésből ${matches} egyezés. Ez játék, nem összeillőségi teszt.`:'Minden helyes tipp 1 pont. Ahol a másik passzolt, ott a tipp nem számít bele. A különbségek új beszélgetéseket is indíthatnak.'}</p></div>${s.type==='quiz'?`<div class="panel score">${s.names.map((name,i)=>`<div>${esc(name)}<br><b>${s.scores[i]} / ${s.guessed[i]}</b><br><span class="small muted">helyes tipp / értékelhető tipp</span></div>`).join('')}</div>`:''}<div class="panel">${s.rows.length?s.rows.map(row=>`<div class="match-item"><h3>${esc(row.text)}</h3>${row.shared?`<p class="small"><b>Mindketten:</b> ${esc(row.shared)}</p>`:row.values?row.values.map((v,i)=>`<p class="small"><b>${esc(s.names[i])}:</b> ${esc(v)}${row.correct?` · a tipped ${row.correct[i]?'helyes':'nem adott pontot'}`:''}</p>`).join(''):'<span class="tag">Közös igen</span>'}</div>`).join(''):`<div class="empty"><h2>${s.type==='match'?'Most nincs közös igen':s.type==='radar'&&s.adult?'Most nem választottatok egyformán':'Most nincs közös válasz'}</h2><p>Ez is rendben van. Semmit sem kell teljesíteni vagy megmagyarázni.</p></div>`}</div>${s.type==='match'&&s.rows.length?btn('saveTogether','Hozzáadjuk a közös listánkhoz'):''}${arcNext()}${btn('restart','Új kör','',!arcStep())}${btn('clear','Válaszok törlése és vissza')}`;}
const FOLLOW={1:['És miért pont az?','Mikor érezted ezt utoljára?','Mit szeretnél, hogy ebből jobban értsek?','Mesélj egy konkrét pillanatot róla.'],2:['Mit érzel közben a testedben?','Mit szeretnél, hogy ebből többet csináljak?','Mi kellene ahhoz, hogy ez ma este megtörténjen?','Mitől lenne ez még jobb?'],3:['Mutasd meg, ne csak mondd.','Egytől tízig mennyire akarod ezt ma este?','Mondd el részletesebben, lassan.','Mi lenne a következő lépés, ha most elkezdenénk?']};
const photoNote=c=>c?.tags?.includes('foto')?'<p class="muted small">A kép vagy a videó a telefonon és a felhőben is megmarad. Csak akkor készítsétek el, ha ezt mindketten vállaljátok.</p>':'';
const hasHuVoice=()=>{try{return 'speechSynthesis'in window&&speechSynthesis.getVoices().some(v=>v.lang.toLowerCase().startsWith('hu'));}catch{return false;}};
function cardTools(s,q){const p=s.pos%2,tools=[];
 if(!q.sec&&!GAMES[s.key].spin&&!GAMES[s.key].dice&&!q.detail&&s.kind!=='dare')tools.push(btn('follow','Rákérdezek'));
 if(hasHuVoice())tools.push(btn('speak','Felolvasás'));
 if(s.type==='truth'&&s.prompt&&s.jokers[p])tools.push(btn('swap',`Csere · ${s.jokers[p]} joker`));
 tools.push(btn('fav',marks.fav.includes(q.t)?'Kedvenc ✓':'Kedvenc'),btn('never','Soha többé'));
 return `<div class="actions card-tools">${tools.join('')}</div>`;}
let timer=null,wake=null;
const fmt=n=>n>=60?`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`:`${n} mp`;
// Az időzítő csak a saját elemeit frissíti, hogy a másodpercenkénti frissítés ne vigye el a fókuszt.
function timerView(c){if(!c?.sec)return '';return `<div class="timer" role="group" aria-label="Időzítő"><span class="timer-left" id="timer-left">${fmt(timer?timer.left:c.sec)}</span><span id="timer-live" class="sr-only" aria-live="polite"></span>${timer?btn('timerStop','Megállítom'):btn('timerStart','Indítás',String(c.sec))}</div>`;}
function tick(){
 if(!timer)return;
 const left=Math.max(0,Math.ceil((timer.end-Date.now())/1000));
 if(left!==timer.left){timer.left=left;document.getElementById('timer-left')?.replaceChildren(fmt(left));if(left&&left<=5)document.getElementById('timer-live')?.replaceChildren(String(left));}
 if(!left){stopTimer();try{navigator.vibrate?.(200);}catch{}render();document.getElementById('timer-live')?.replaceChildren('Lejárt az idő');}
}
function stopTimer(){if(timer){clearInterval(timer.id);timer=null;}}
async function keepAwake(on){try{if(on&&!wake&&'wakeLock'in navigator){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null;});}else if(!on&&wake){const w=wake;wake=null;await w.release();}}catch{}}
function keepFocus(a,v){const same=[...app.querySelectorAll('[data-a]')].find(el=>el.dataset.a===a&&el.dataset.v===v&&!el.disabled);const target=same||app.querySelector('.question,h1,h2')||app;if(!same&&target!==app)target.tabIndex=-1;target.focus({preventScroll:true});}
function render(){document.body.dataset.view=view;document.body.classList.toggle('mood-light',moodLight&&view==='play'&&!!run&&!masked);if(Object.hasOwn(GAMES,view))app.innerHTML=setup(view);else app.innerHTML=view==='settings'?settings():view==='play'?play():home();if(notice)app.innerHTML=`<p class="notice" role="status">${esc(notice)}</p>`+app.innerHTML;}
A.names=f=>{const first=f.elements.first.value.trim().slice(0,24),second=f.elements.second.value.trim().slice(0,24);if(!first||!second)return;prefs.names=[first,second];if(savePrefs())notice='A neveket elmentettük.';};
A.start=f=>{if(arc&&ARCS[arc.id].steps[arc.step][0]!==f.dataset.v)arc=null;return start(f.dataset.v,!!f.elements.adult?.checked,f.elements.rounds.value,f.elements.pack?.value||'base',{escalate:!!f.elements.escalate?.checked,custom:f.elements.custom?.value||'none',score:!!f.elements.score?.checked,since:f.elements.since?.value||''});};
A.filter=v=>{if(!['all','talk','private','adult'].includes(v))return;filter=v;if(v==='adult')requestAnimationFrame(()=>document.querySelector('.games')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));};
A.adultOn=()=>{view='honest';history.pushState(null,'','#honest');};
A.adultOff=()=>{adult=false;if(run&&run.adult){run=null;masked=false;}notice='A 18+ hozzáférést és a felnőtt kör válaszait töröltük.';};
A.surprise=()=>{const keys=Object.keys(GAMES).filter(key=>!GAMES[key].adult||adult);const key=keys[Math.floor(Math.random()*keys.length)];if(key)go(key);};
A.resume=()=>go('play');
A.mood=()=>{moodLight=!moodLight;};
A.follow=()=>{const s=run,q=s?.type==='truth'?s.prompt:s?.deck[s.pos];if(!q||masked)return;const list=(FOLLOW[q.lvl]||FOLLOW[1]).filter(x=>x!==s.follow);s.follow=list[Math.floor(Math.random()*list.length)];};
A.install=()=>{if(!installPrompt)return;try{installPrompt.prompt();}catch{}installPrompt=null;};
A.wishSave=f=>{const s=run;if(!s||masked||s.phase!=='wish')return;const cat=Number(f.elements.cat.value),t=f.elements.text.value.trim().slice(0,140);if(!t||!WISH_CATS[cat])return;s.wishes[s.player]={cat,t};
 if(s.player===0){s.player=1;s.phase='cover';return;}
 const [a,b]=s.wishes,same=a.cat===b.cat;s.wishCat=same?WISH_CATS[a.cat]:null;s.rows=same?[{text:a.t},{text:b.t}]:[];s.wishes=null;s.phase='result';};
A.plan=f=>{const p=planPick(Number(f.elements.min.value),f.elements.mood.value,Number(f.elements.lvl.value));if(!p){notice='Erre most nincs ajánlatunk. Próbáljatok több időt vagy más hangulatot.';return;}packChoice[p[3]]=p[4];roundChoice[p[3]]=p[5];go(p[3]);};
A.arc=id=>{if(!Object.hasOwn(ARCS,id))return;arc={id,step:0,excluded:null};startStep();};
A.arcNext=()=>{const i=arcStep();if(i===null||!ARCS[arc.id].steps[i+1])return;arc.step=i+1;startStep();};
A.saveTogether=()=>{const s=run;if(!s||s.type!=='match'||s.phase!=='result')return;for(const r of s.rows)if(!together.items.some(x=>x.t===r.text))together.items.push({t:r.text,adult:s.adult,done:false});saveTogether();notice=together.remember?'Hozzáadtuk a közös listához.':'Hozzáadtuk a közös listához. Csak addig marad meg, amíg az oldal nyitva van; a Beállításokban kérhetitek, hogy ez az eszköz megjegyezze.';};
A.togetherDone=i=>{const x=together.items[Number(i)];if(x){x.done=!x.done;saveTogether();}};
A.togetherDel=i=>{const n=Number(i);if(together.items[n]){together.items.splice(n,1);saveTogether();}};
A.speak=()=>{const q=run?.type==='truth'?run.prompt:run?.deck[run.pos];if(!q||!hasHuVoice())return;try{const u=new SpeechSynthesisUtterance([q.t,...(q.detail||[])].join('. '));u.voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('hu'));u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u);}catch{}};
A.swap=()=>{const s=run;if(!s||masked||s.type!=='truth'||!s.prompt||!s.kind)return;const p=s.pos%2;if(!s.jokers[p])return;const next=s[s.kind].pop();if(!next)return;s.jokers[p]--;s.prompt=next;seenFor(s).add(next.t);};
A.fav=()=>{const q=run?.type==='truth'?run.prompt:run?.deck[run.pos];if(!q)return;const i=marks.fav.indexOf(q.t);i<0?marks.fav.push(q.t):marks.fav.splice(i,1);saveMarks();};
A.never=()=>{const q=run?.type==='truth'?run.prompt:run?.deck[run.pos];if(!q||marks.never.includes(q.t))return;marks.never.push(q.t);saveMarks();notice='Ez a kártya többé nem jön elő.';talkNext(true);};
A.reload=()=>{if(!run)location.reload();};
A.timerStart=sec=>{if(!run||masked)return;stopTimer();const n=Math.min(600,Math.max(1,Number(sec)||0));timer={end:Date.now()+n*1000,left:n,id:setInterval(tick,250)};};
A.timerStop=()=>stopTimer();
A.customAdd=f=>{const t=f.elements.text.value.trim().slice(0,140),kind=f.elements.kind.value;if(!t||!Object.hasOwn(KIND,kind)||custom.cards.length>=200)return;custom.cards.push({t,kind});saveCustom();notice='A kártyát hozzáadtuk.';};
A.customDel=i=>{const n=Number(i);if(Number.isInteger(n)&&custom.cards[n]){custom.cards.splice(n,1);saveCustom();}};
A.marksClear=()=>{marks.fav=[];marks.never=[];saveMarks();notice='A jelöléseket töröltük.';};
A.customClear=()=>{custom.cards=[];saveCustom();notice='A saját kártyákat töröltük.';};
A.openLimits=()=>{if(run&&!masked&&run.phase==='limits-cover')run.phase='limits';};
A.limit=id=>{const s=run;if(!s||masked||s.phase!=='limits'||!LIMITS.some(([x])=>x===id))return;s.draft.has(id)?s.draft.delete(id):s.draft.add(id);};
A.limitsDone=()=>{const s=run;if(!s||masked||s.phase!=='limits')return;s.draft.forEach(t=>s.excluded.add(t));s.draft=new Set();if(s.limitPlayer===0){s.limitPlayer=1;s.phase='limits-cover';}else{if(arc)arc.excluded=[...s.excluded];buildDeck(s,s.pack);}};
A.halt=()=>{const s=run;if(!s||masked||!s.adult||!['talk','answer','guess'].includes(s.phase))return;stopTimer();s.haltedFrom=s.phase;s.phase='halt';s.selected=null;};
A.haltResume=()=>{const s=run;if(s?.phase==='halt'){s.phase=s.haltedFrom;s.haltedFrom=null;}};
A.haltGentle=()=>{if(run?.phase!=='halt')return;const key=run.key,length=run.length;run=null;start(key,adult,length,'base');};
A.haltEnd=()=>{if(run?.phase==='halt')run.phase='result';};
A.unmask=()=>{masked=false;};
A.open=()=>{if(run&&!masked&&run.phase==='cover'){run.phase=run.resume||(run.type==='wish'?'wish':'answer');run.resume=null;}};
A.select=v=>{if(!run||masked||!['answer','guess'].includes(run.phase))return;const n=Number(v),max=run.type==='match'?2:1;if(Number.isInteger(n)&&n>=-1&&n<=max)run.selected=n;};
A.confirm=()=>{const s=run;if(!s||masked||s.selected===null||!['answer','guess'].includes(s.phase))return;const value=s.selected===-1?null:s.selected;
 if(s.phase==='answer'){s.answers[s.player][s.pos]=value;if(value!==null)s.answered[s.player]++;s.selected=null;if(s.type==='quiz')s.phase='guess';else advancePrivate(s);}
 else{s.guesses[s.player][s.pos]=value;advancePrivate(s);}};
function talkNext(skipped){const s=run;if(!s||masked||s.phase!=='talk')return;stopTimer();if(s.type==='truth'&&!s.prompt&&!skipped)return;if(skipped)s.skipped++;else{s.count++;if(s.opts.score&&s.type==='truth')s.points[s.pos%2]+=s.kind==='dare'?2:1;}s.pos++;s.prompt=null;s.kind=null;s.follow=null;if(s.pos>=s.deck.length)s.phase='result';}
A.next=()=>talkNext(false);A.pass=()=>talkNext(true);
A.draw=kind=>{const s=run;if(!s||masked||s.type!=='truth'||s.phase!=='talk'||s.prompt||!['truth','dare'].includes(kind))return;s.kind=kind;s.follow=null;const src=s.sources?(s.pos<Math.ceil(s.deck.length/3)?s.sources.mild:s.sources.hot):s,other=s.sources&&(src===s.sources.mild?s.sources.hot:s.sources.mild);s.prompt=src[kind].pop()||other?.[kind].pop()||null;if(s.prompt)seenFor(s).add(s.prompt.t);};
A.stop=()=>{if(run&&run.phase==='talk')run.phase='result';};
A.clear=()=>{stopTimer();keepAwake(false);arc=null;if(run&&run.phase!=='result'&&!confirm('Törlöd a kört és az összes eddigi választ?'))return;run=null;masked=false;go('home');};
A.restart=()=>{if(!run||run.phase!=='result')return;const key=run.key,length=run.length,packId=run.packId,opts=run.opts;run=null;start(key,adult,length,packId,opts);};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el||el.tagName==='FORM')return;const action=A[el.dataset.a];if(action){notice='';const v=view;action(el.dataset.v);render();if(v===view)keepFocus(el.dataset.a,el.dataset.v||'');}});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-custom-remember]')){custom.remember=e.target.checked;saveCustom();return;}
 if(e.target.dataset.store==='together'){together.remember=e.target.checked;saveTogether();return;}
 if(e.target.dataset.store==='marks'){marks.remember=e.target.checked;saveMarks();return;}
 const key=e.target.dataset.packGame;
 if(key&&packFor(key,e.target.value)){
  const rounds=document.getElementById('round-length');
  if(rounds&&lengths(key).includes(Number(rounds.value)))roundChoice[key]=Number(rounds.value);
  packChoice[key]=e.target.value;render();document.getElementById('pack-select')?.focus();
 }
});
document.addEventListener('submit',e=>{if(!e.target.dataset.a)return;e.preventDefault();const action=A[e.target.dataset.a];if(action){notice='';action(e.target);render();}});
view=route();render();
// Az új service worker azonnal átveszi az irányítást, de a lap a régi fájlokkal fut tovább: ezt egy sáv jelzi, futó kör alatt nem.
if('serviceWorker'in navigator&&location.protocol!=='file:'){const hadController=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController)return;updateReady=true;if(!run&&view==='home')render();});}
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
 const update=()=>{document.getElementById('offline').textContent=navigator.onLine?'Offline használatra kész ✓':'Offline mód · ketten is játszhattok';};update();window.addEventListener('online',update);window.addEventListener('offline',update);
}).catch(()=>{document.getElementById('offline').textContent='Az offline csomag még nem érhető el.';});
else document.getElementById('offline').textContent='Páros est · Egy telefon, két ember';
