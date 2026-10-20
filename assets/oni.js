/* GENERÁLT FÁJL (tools/build.py): assets/registry.js + assets/oni-core.js + assets/oni-rules.js — ne szerkeszd kézzel, a forrásfájlokat módosítsd. */
/* ── assets/registry.js ── */
/* Önismereti térképek — KÖZÖS TESZTNYILVÁNTARTÁS. Egy teszt = egy sor; minden lista ebből készül
   (közös mag: IDKEY, VERS · adatlapok: link, bizonyítékszint · összegzés · főoldal · válaszséma · tesztek).
   Mezők:
     id     a teszt azonosítója (ONI.save első paramétere)
     key    a válaszok localStorage-kulcsa
     card   a főoldali kártya data-key értéke (általában = key; a saját tárolású teszteknél @név)
     cat    témakör (az összegzés csoportosítása)
     name   megjelenített név
     link   oldal és fül
     n      kérdésszám a főoldali haladásjelzőhöz
     ev     bizonyítékszint: valid | model | pop | own (tests-data.js: ONI_EV_LABEL)
     badge  főoldali státuszcímke: valid | check | part | own | frame
     v      kérdéssor- (q), pontozás- (s) és fordításverzió (t). Ha a tételek, a pontozás vagy a magyar
            szöveg érdemben változik, emeld a megfelelő számot, és írj bejegyzést a valtozasok.html-be.
   Új teszt: egy sor ide + a kérdőív (src/hubs/*.tests.js) + főoldali kártya; utána build, schema, npm test. */
(function(g){
g.ONI_REG=[
 // Test-tudatosság
 {id:'maia2',key:'maia2-responses-v2',card:'maia2-responses-v2',cat:'Test-tudatosság',name:'MAIA-2 · Interocepció',link:'maia2.html',n:37,ev:'valid',badge:'valid',v:{q:2,s:2,t:1}},
 {id:'tas',key:'tas-20-responses-v1',card:'tas-20-responses-v1',cat:'Test-tudatosság',name:'TAS-20 · Alexitímia',link:'terkepek.html#test-tas',n:20,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'des',key:'des-2-responses-v1',card:'des-2-responses-v1',cat:'Test-tudatosság',name:'DES-II · Disszociáció',link:'funkcio.html#test-des',n:28,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Kötődés és séma
 {id:'ecr',key:'ecr-r-responses-v1',card:'ecr-r-responses-v1',cat:'Kötődés és séma',name:'ECR-R · Kötődés',link:'terkepek.html#test-ecr',n:36,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'kotodes',key:'attachment_assessment_v1',card:'@kotodes',cat:'Kötődés és séma',name:'Kötődési mélytérkép',link:'kotodes-melyterkep.html',n:60,ev:'own',badge:'own',v:{q:1,s:1,t:1}},
 {id:'ysq',key:'ysq_autosave',card:'@ysq',cat:'Kötődés és séma',name:'YSQ-L · Korai sémák',link:'ysq.html',n:244,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'smi',key:'smi-responses-v1',card:'smi-responses-v1',cat:'Kötődés és séma',name:'SMI · Séma-módok',link:'terkepek.html#test-smi',n:65,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'ssss',key:'ssss-responses-v1',card:'ssss-responses-v1',cat:'Kötődés és séma',name:'SSSS · Szexuális önkép',link:'attitudok.html#test-ssss',n:27,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Szex-funkció
 {id:'sisses',key:'sis-ses-responses-v1',card:'sis-ses-responses-v1',cat:'Szex-funkció',name:'SIS/SES · Duál kontroll',link:'sis-ses.html',n:45,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'iief',key:'iief-responses-v1',card:'iief-responses-v1',cat:'Szex-funkció',name:'IIEF-15 · Férfi funkció',link:'funkcio.html#test-iief',n:15,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'pedt',key:'pedt-responses-v1',card:'pedt-responses-v1',cat:'Szex-funkció',name:'PEDT · Ejakuláció',link:'funkcio.html#test-pedt',n:5,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'sdi',key:'sdi-2-responses-v1',card:'sdi-2-responses-v1',cat:'Szex-funkció',name:'SDI-2 · Vágy',link:'funkcio.html#test-sdi',n:14,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Szex-attitűdök
 {id:'nsss',key:'nsss-responses-v1',card:'nsss-responses-v1',cat:'Szex-attitűdök',name:'NSSS · Elégedettség',link:'attitudok.html#test-nsss',n:20,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'saq',key:'saq-responses-v1',card:'saq-responses-v1',cat:'Szex-attitűdök',name:'SAQ · Szexuális tudatosság',link:'attitudok.html#test-saq',n:36,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Kapcsolati nyelvek
 {id:'love',key:'love-responses-v1',card:'love-responses-v1',cat:'Kapcsolati nyelvek',name:'Szeretetnyelvek',link:'nyelvek.html#test-love',n:30,ev:'pop',badge:'frame',v:{q:1,s:1,t:1}},
 {id:'apo',key:'apo-responses-v1',card:'apo-responses-v1',cat:'Kapcsolati nyelvek',name:'Bocsánatkérési nyelvek',link:'nyelvek.html#test-apo',n:20,ev:'pop',badge:'frame',v:{q:1,s:1,t:1}},
 {id:'imago',key:'imago-responses-v1',card:'imago-responses-v1',cat:'Kapcsolati nyelvek',name:'Imágó',link:'nyelvek.html#test-imago',n:57,ev:'pop',badge:'frame',v:{q:1,s:1,t:1}},
 // Személyiség
 {id:'bf',key:'bf-responses-v1',card:'bf-responses-v1',cat:'Személyiség',name:'Big Five · IPIP-NEO-60',link:'szemelyiseg.html#test-bf',n:60,ev:'model',badge:'part',v:{q:1,s:1,t:1}},
 {id:'via',key:'via-responses-v1',card:'via-responses-v1',cat:'Személyiség',name:'VIA-72 · Karakter-erők',link:'szemelyiseg.html#test-via',n:72,ev:'model',badge:'part',v:{q:1,s:1,t:1}},
 // Kapcsolati dinamika
 {id:'las',key:'las-responses-v1',card:'las-responses-v1',cat:'Kapcsolati dinamika',name:'LAS-SF · Szeretetstílus',link:'kapcsolat.html#test-las',n:24,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'tki',key:'conflict-responses-v1',card:'conflict-responses-v1',cat:'Kapcsolati dinamika',name:'Konfliktusmódok',link:'kapcsolat.html#test-tki',n:25,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'gott',key:'gottman-responses-v1',card:'gottman-responses-v1',cat:'Kapcsolati dinamika',name:'Gottman-térkép',link:'kapcsolat.html#test-gott',n:32,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'fti',key:'fisher-responses-v1',card:'fisher-responses-v1',cat:'Kapcsolati dinamika',name:'Fisher-temperamentum',link:'kapcsolat.html#test-fti',n:40,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 // Értékek, cselekvés, ritmus
 {id:'pvq',key:'pvq21-responses-v1',card:'pvq21-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'PVQ-21 · Értékek',link:'cselekves.html#test-pvq',n:21,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'ft',key:'four-tendencies-responses-v1',card:'four-tendencies-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'Négy tendencia',link:'cselekves.html#test-ft',n:12,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'kolbe',key:'action-modes-responses-v1',card:'action-modes-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'Cselekvési módok',link:'cselekves.html#test-kolbe',n:24,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'meq',key:'meq-responses-v1',card:'meq-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'MEQ · Kronotípus',link:'cselekves.html#test-meq',n:19,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 // Szabályozás és végrehajtás
 {id:'ips',key:'ips-responses-v1',card:'ips-responses-v1',cat:'Szabályozás és végrehajtás',name:'IPS · Halogatás',link:'szabalyozas.html#test-ips',n:9,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'ders',key:'ders-sf-responses-v1',card:'ders-sf-responses-v1',cat:'Szabályozás és végrehajtás',name:'DERS-SF · Érzelemszabályozás',link:'szabalyozas.html#test-ders',n:18,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'scs',key:'scs-sf-responses-v1',card:'scs-sf-responses-v1',cat:'Szabályozás és végrehajtás',name:'SCS-SF · Önegyüttérzés',link:'szabalyozas.html#test-scs',n:12,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'tfeq',key:'tfeq-r18-responses-v1',card:'tfeq-r18-responses-v1',cat:'Szabályozás és végrehajtás',name:'TFEQ-R18 · Evési viselkedés',link:'szabalyozas.html#test-tfeq',n:18,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 // Hangulat és figyelem
 {id:'asrs',key:'asrs-responses-v1',card:'asrs-responses-v1',cat:'Hangulat és figyelem',name:'ASRS v1.1 · Felnőttkori ADHD-tünetek',link:'allapot.html#test-asrs',n:18,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'phq9',key:'phq9-responses-v1',card:'phq9-responses-v1',cat:'Hangulat és figyelem',name:'PHQ-9 · Lehangoltság',link:'allapot.html#test-phq9',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'gad7',key:'gad7-responses-v1',card:'gad7-responses-v1',cat:'Hangulat és figyelem',name:'GAD-7 · Szorongás',link:'allapot.html#test-gad7',n:7,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Önbizalom és önértékelés
 {id:'rses',key:'rses-responses-v1',card:'rses-responses-v1',cat:'Önbizalom és önértékelés',name:'RSES · Önértékelés',link:'onbizalom.html#test-rses',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'gse',key:'gse-responses-v1',card:'gse-responses-v1',cat:'Önbizalom és önértékelés',name:'GSE · Énhatékonyság',link:'onbizalom.html#test-gse',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'bfne',key:'bfne2-responses-v1',card:'bfne2-responses-v1',cat:'Önbizalom és önértékelés',name:'BFNE-II · Ítélettől való félelem',link:'onbizalom.html#test-bfne',n:12,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'obgy',key:'onbizalom-gyak-responses-v1',card:'onbizalom-gyak-responses-v1',cat:'Önbizalom és önértékelés',name:'Gyakorlati önbizalom',link:'onbizalom.html#test-obgy',n:20,ev:'own',badge:'own',v:{q:1,s:1,t:1}},
 // Jóllét és stressz
 {id:'who5',key:'who5-responses-v1',card:'who5-responses-v1',cat:'Jóllét és stressz',name:'WHO-5 · Jóllét',link:'jollet.html#test-who5',n:5,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'pss',key:'pss10-responses-v1',card:'pss10-responses-v1',cat:'Jóllét és stressz',name:'PSS-10 · Észlelt stressz',link:'jollet.html#test-pss',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'cbi',key:'cbi-responses-v1',card:'cbi-responses-v1',cat:'Jóllét és stressz',name:'CBI · Kiégés',link:'jollet.html#test-cbi',n:13,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'brs',key:'brs-responses-v1',card:'brs-responses-v1',cat:'Jóllét és stressz',name:'BRS · Reziliencia',link:'jollet.html#test-brs',n:6,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Kapcsolódás, értelem, jelenlét
 {id:'ucla',key:'ucla3-responses-v1',card:'ucla3-responses-v1',cat:'Kapcsolódás, értelem, jelenlét',name:'UCLA-3 · Magányosság',link:'ertelem.html#test-ucla',n:3,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'mlq',key:'mlq-responses-v1',card:'mlq-responses-v1',cat:'Kapcsolódás, értelem, jelenlét',name:'MLQ · Az élet értelme',link:'ertelem.html#test-mlq',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'maas',key:'maas-responses-v1',card:'maas-responses-v1',cat:'Kapcsolódás, értelem, jelenlét',name:'MAAS · Tudatos jelenlét',link:'ertelem.html#test-maas',n:15,ev:'valid',badge:'check',v:{q:1,s:1,t:1}}
];
})(typeof window!=='undefined'?window:globalThis);

/* ── assets/oni-core.js ── */
/* ONI-CORE v5 — közös eredménytár + kezdő útvonal. Minden adat csak ebben a böngészőben marad. */
/* a felugró elemek (témaváltó, értesítés, kitöltés-segéd) a <main> tájolópontba kerülnek, hogy a képernyőolvasó is az oldal részeként kezelje */
function ONI_HOST(){return document.querySelector('main')||document.body}
/* Téma: sötét (alap) vagy világos; azonnal beállítva, hogy ne villanjon. */
(function(){
  var d=document.documentElement,st={};
  try{st=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{}}catch(e){}
  d.setAttribute('data-theme',st.theme==='light'?'light':'dark');
  var pg=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  d.setAttribute('data-page',pg);
  function btn(){
    if(document.getElementById('oni-theme'))return;
    var b=document.createElement('button');b.id='oni-theme';b.type='button';
    function lbl(){var dark=d.getAttribute('data-theme')==='dark';b.innerHTML=dark?'<span class="ic" aria-hidden="true">☀</span>Világos mód':'<span class="ic" aria-hidden="true">☾</span>Sötét mód';b.title=dark?'Váltás világos témára':'Váltás sötét témára';   /* az akadálymentes név a látható szöveg (Világos mód / Sötét mód) */}
    lbl();
    b.onclick=function(){var t=d.getAttribute('data-theme')==='dark'?'light':'dark';d.setAttribute('data-theme',t);lbl();
      try{var s=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{};s.theme=t;localStorage.setItem('onismeret-settings-v1',JSON.stringify(s))}catch(e){}};
    ONI_HOST().appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',btn);else btn();
})();
/* Offline működés: a service worker a statikus fájlokat menti a böngészőbe (válaszokat nem). Csak http(s) alatt. */
(function(){
  try{if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});}catch(e){}
})();
/* Vízszintesen görgethető menüsávban az aktív pont mindig középre kerül (főoldali témakörsáv, tesztfülek). */
(function(){
  var SEL='.jump,[role="tablist"],.tabs,.test-tabs';
  function center(nav){
    if(!nav||nav.scrollWidth<=nav.clientWidth+2)return;
    var a=nav.querySelector('.active,[aria-selected="true"]');if(!a)return;
    var nr=nav.getBoundingClientRect(),ar=a.getBoundingClientRect();
    var left=nav.scrollLeft+(ar.left-nr.left)-(nav.clientWidth-ar.width)/2;
    try{nav.scrollTo({left:Math.max(0,left),behavior:'smooth'})}catch(e){nav.scrollLeft=Math.max(0,left)}
  }
  window.ONI_CENTER=center;
  function boot(){
    [].forEach.call(document.querySelectorAll(SEL),function(nav){
      center(nav);if(nav.dataset.oniCenter)return;nav.dataset.oniCenter='1';
      if(window.MutationObserver){var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){center(nav)},40)}).observe(nav,{subtree:true,attributes:true,attributeFilter:['class','aria-selected']});}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('load',boot);
})();
window.ONI=window.ONI||(function(){
  var K='onismeret-results-v1';
  var LIMIT=200;   /* tesztenként ennyi kitöltés marad meg az előzményekben */
  var PATH=[
    {id:'ft',n:'Négy tendencia',href:'cselekves.html#test-ft',min:5,why:'hogyan reagálsz az elvárásokra'},
    {id:'kolbe',n:'Cselekvési módok',href:'cselekves.html#test-kolbe',min:7,why:'hogyan fogsz neki egy feladatnak'},
    {id:'ecr',n:'ECR-R · Kötődés',href:'terkepek.html#test-ecr',min:10,why:'közelség és távolság a kapcsolatokban'},
    {id:'bf',n:'Big Five',href:'szemelyiseg.html#test-bf',min:12,why:'az öt alapvonás'},
    {id:'pvq',n:'PVQ-21 · Értékek',href:'cselekves.html#test-pvq',min:6,why:'mi hajt valójában'}
  ];
  function all(){try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return {}}}
  function r(x){return Math.round(x*100)/100}
  var META='onismeret-meta-v1';
  var IDKEY={};(window.ONI_REG||[]).forEach(function(t){IDKEY[t.id]=t.key});   /* forrás: assets/registry.js */
  function meta(){try{return JSON.parse(localStorage.getItem(META))||{}}catch(e){return {}}}
  /* Kérdéssor- (q), pontozás- (s) és fordításverzió (t) tesztenként. Ha egy teszt tételei, pontozása vagy
     magyar szövege változik, itt emeld a megfelelő számot. Eltérő változatú eredményeket nem hasonlítunk össze. */
  /* minden teszt verziója explicit; új teszt felvételekor ide is be kell írni (a tesztcsomag ellenőrzi) */
  var VERS={};(window.ONI_REG||[]).forEach(function(t){VERS[t.id]=t.v});   /* forrás: assets/registry.js */
  function vOf(id){var v=VERS[id]||{};return {q:v.q||1,s:v.s||1,t:v.t||1}}
  /* két eredmény összevethető-e (azonos kérdéssor, pontozás és fordítás) */
  function same(a,b){return !!a&&!!b&&(a.qv||1)===(b.qv||1)&&(a.sv||1)===(b.sv||1)&&(a.tv||1)===(b.tv||1)}
  /* a rekord a teszt jelenlegi változatával készült-e */
  function isCur(id,r){var v=vOf(id);return !!r&&(r.qv||1)===v.q&&(r.sv||1)===v.s&&(r.tv||1)===v.t}
  function verText(r){return 'kérdéssor v'+(r.qv||1)+' · pontozás v'+(r.sv||1)+' · fordítás v'+(r.tv||1)}
  /* „Új kitöltés” jelzése: ha egy teszt válaszai kiürülnek vagy megfogyatkoznak (törlés, újrakezdés),
     a következő mentett eredmény biztosan új mérés lesz, akkor is, ha ugyanazon a napon ugyanaz a pontszám jön ki. */
  function markFresh(key){try{var m=meta();m.fresh=m.fresh||{};m.fresh[key]=new Date().toISOString();localStorage.setItem(META,JSON.stringify(m))}catch(e){}}
  /* Tartós tárolás kérése az első mentéskor: így a böngésző tárhelyhiány esetén sem törli automatikusan az adatokat. */
  var persistAsked=false;
  function persist(){if(persistAsked)return;persistAsked=true;try{var s=navigator.storage;if(s&&s.persist&&s.persisted)s.persisted().then(function(ok){if(!ok)s.persist()}).catch(function(){})}catch(e){}}
  /* Utolsó fájlba mentés ideje (a főoldali emlékeztetőhöz). */
  var SET='onismeret-settings-v1';
  function markBackup(){try{var st=JSON.parse(localStorage.getItem(SET))||{};st.lastBackup=new Date().toISOString();localStorage.setItem(SET,JSON.stringify(st))}catch(e){}}
  function backupAgeDays(){try{var st=JSON.parse(localStorage.getItem(SET))||{};return st.lastBackup?Math.floor((Date.now()-Date.parse(st.lastBackup))/864e5):null}catch(e){return null}}
  function save(id,rec,opts){
    persist();
    try{
      opts=opts||{};
      var a=all(),h=a[id]||[],m=meta(),now=new Date().toISOString();
      var key=opts.key||IDKEY[id];
      m.ans=m.ans||{};m.fresh=m.fresh||{};
      if(key&&!m.ans[key]){m.ans[key]=now;}
      var v=vOf(id),fresh=!!(key&&m.fresh[key]);
      rec.qv=opts.qv||rec.qv||v.q; rec.sv=opts.sv||rec.sv||v.s; rec.tv=opts.tv||rec.tv||v.t;
      rec.done=(key&&m.ans[key])||now;   /* a kitöltés ideje = az utolsó válasz ideje */
      rec.t=now;                          /* a kiértékelés megnyitásának ideje */
      if(rec.d)Object.keys(rec.d).forEach(function(k){var x=rec.d[k];if(x&&typeof x[1]==='number')x[1]=r(x[1]);});
      var prev=h[h.length-1];
      if(prev&&prev.done===rec.done&&(prev.qv||1)===rec.qv&&(prev.tv||1)===rec.tv){
        /* 1) Megnyitás: ugyanaz a kitöltés, csak újranyitva. Nem új mérés, a dátum marad.
              Ha közben csak a pontozás változott, a régi rekord helyére az újraszámolt eredmény kerül. */
        if((prev.sv||1)!==rec.sv){rec.sid=prev.sid;rec.rescored=true;if(prev.corrected)rec.corrected=prev.corrected;h[h.length-1]=rec;}
        else{rec=prev;}
      } else if(prev&&!fresh&&same(prev,rec)){
        /* 2) Javítás: a válaszok „Új kitöltés” nélkül változtak. Ugyanaz a mérés, módosított válaszokkal. */
        rec.sid=prev.sid;rec.corrected=(prev.corrected||0)+1;if(prev.first||prev.done)rec.first=prev.first||prev.done;h[h.length-1]=rec;
      } else {
        /* 3) Új kitöltés: saját azonosító, akkor is, ha ugyanazon a napon, ugyanazzal az eredménnyel zárul. */
        rec.sid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
        h.push(rec);
      }
      if(key&&m.fresh[key])delete m.fresh[key];
      try{localStorage.setItem(META,JSON.stringify(m))}catch(e){}
      if(h.length>LIMIT){h=h.slice(-LIMIT);try{window.ONI_TOAST&&ONI_TOAST('A legrégebbi kitöltés kikerült az előzményekből ('+LIMIT+' kitöltés a tesztenkénti korlát). Mentsd le az adataidat, ha meg akarod őrizni.',true)}catch(x){}}
      a[id]=h;
      localStorage.setItem(K,JSON.stringify(a));
      if(localStorage.getItem(K)!==JSON.stringify(a))throw new Error('verify');   /* visszaolvasva is ott van-e */
    }catch(e){
      /* a mentés nem sikerült: nem jelezzük mentettnek, és nem fut le a „mentve” esemény */
      try{window.ONI_TOAST&&ONI_TOAST('Az eredményt nem sikerült elmenteni ezen az eszközön (tele a tárhely vagy privát ablak?). Az eredmény most látható, de nem marad meg. Exportáld a válaszaidat a főoldalon.',true)}catch(x){}
      try{window.dispatchEvent(new CustomEvent('oni:savefail',{detail:{id:id}}));}catch(x){}
      return false;
    }
    try{window.dispatchEvent(new CustomEvent('oni:saved',{detail:{id:id}}));}catch(e){}
    return true;
  }
  /* ── Újramérési emlékeztető tesztenként. Beállítás: onismeret-settings-v1 → retake (alapértelmezett napok, 0 = ki)
        és remind[id] = {d: napok (0 = ki, hiányzik = alapértelmezett), s: halasztás eddig (ISO)}. A határidő a tényleges kitöltésből indul. ── */
  var SK='onismeret-settings-v1';
  function sets(){try{return JSON.parse(localStorage.getItem(SK))||{}}catch(e){return {}}}
  function remindCfg(id){var st=sets(),c=(st.remind||{})[id]||{},def=st.retake===undefined?90:st.retake;return {days:c.d!=null?c.d:def,own:c.d!=null,def:def,snooze:c.s||null}}
  function setRemind(id,patch){var st=sets();st.remind=st.remind||{};var c=st.remind[id]||{};Object.keys(patch).forEach(function(k){if(patch[k]===null)delete c[k];else c[k]=patch[k]});
    if(Object.keys(c).length)st.remind[id]=c;else delete st.remind[id];try{localStorage.setItem(SK,JSON.stringify(st))}catch(e){}}
  function due(id,rec){
    var c=remindCfg(id);if(!rec||!c.days)return {off:!c.days,due:false,at:null,days:c.days,own:c.own};
    var base=new Date(rec.done||rec.t).getTime(),at=base+c.days*864e5;
    if(c.snooze&&Date.parse(c.snooze)>at)at=Date.parse(c.snooze);
    return {off:false,due:Date.now()>=at,at:new Date(at),days:c.days,own:c.own,snoozed:!!(c.snooze&&Date.parse(c.snooze)>Date.now()),since:Math.floor((Date.now()-base)/864e5)};
  }
  function pathState(){var a=all();return PATH.map(function(p){return {id:p.id,n:p.n,href:p.href,min:p.min,why:p.why,done:!!(a[p.id]&&a[p.id].length)}});}
  function banner(savedId){
    var st=pathState(),inPath=st.some(function(p){return p.id===savedId});
    if(!inPath)return;
    var done=st.filter(function(p){return p.done}).length,next=st.filter(function(p){return !p.done})[0];
    var old=document.getElementById('oni-path-banner');if(old)old.remove();
    var el=document.createElement('div');el.id='oni-path-banner';
    el.setAttribute('style','position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;max-width:calc(100% - 24px);width:560px;display:flex;align-items:center;gap:14px;padding:14px 16px 14px 20px;border-radius:18px;background:var(--u-paper,#fff);color:var(--u-ink,#0f172a);border:1px solid var(--u-line,#cbd5e1);box-shadow:var(--u-shadow);font:500 14px/1.4 Inter,system-ui,sans-serif');
    var dots=st.map(function(p){return '<span style="width:8px;height:8px;border-radius:50%;display:inline-block;background:'+(p.done?'var(--u-emerald,#065f46)':'var(--u-bg3,#e2e8f0)')+'"></span>'}).join('');
    var lbl='font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;display:flex;gap:6px;align-items:center;';
    var cta='flex:none;padding:11px 18px;border-radius:99px;background:var(--u-cta,#0f172a);color:var(--u-on-cta,#fff);text-decoration:none;font-weight:600';
    var body=next
      ? '<div style="flex:1;min-width:0"><div style="'+lbl+'color:var(--u-gold,#8a6a1f)">Kezdő útvonal · '+done+'/5 '+dots+'</div><div style="margin-top:3px">Következő: <strong>'+next.n+'</strong> <span style="color:var(--u-muted,#5b6778)">(~'+next.min+' perc)</span></div></div><a href="'+next.href+'" style="'+cta+'">Tovább ›</a>'
      : '<div style="flex:1;min-width:0"><div style="'+lbl+'color:var(--u-emerald,#065f46)">Kezdő útvonal kész · 5/5</div><div style="margin-top:3px">Most már az összegzés valódi adatokból dolgozik.</div></div><a href="osszegzes.html" style="'+cta+'">Összegzés ›</a>';
    el.innerHTML=body+'<button type="button" aria-label="Bezár" style="flex:none;background:none;border:none;color:var(--u-muted,#5b6778);font-size:20px;cursor:pointer;padding:0 2px">×</button>';
    el.querySelector('button').onclick=function(){el.remove()};
    ONI_HOST().appendChild(el);
    if(next&&location.href.indexOf(next.href.split('#')[0])>-1){var a=el.querySelector('a');a.addEventListener('click',function(){setTimeout(function(){el.remove()},50)});}
  }

  /* ── Válaszidő rögzítése + látható mentési visszajelzés ── */
  (function(){
    try{
      var proto=Storage.prototype,orig=proto.setItem,lastToast=0;
      proto.setItem=function(k,v){
        try{orig.call(this,k,v);}
        catch(e){toast('A mentés nem sikerült ezen az eszközön (tele a tárhely vagy privát ablak?). Exportáld a válaszaidat a főoldalon.',true);throw e;}
        if(this===window.localStorage&&!window.ONI_BULK&&/-responses-v\d+$|^ysq_autosave$|^attachment_assessment_v1$/.test(k)){
          var before=prevAns[k],cur=ansOf(k,v),cs=JSON.stringify(cur);
          prevAns[k]=cur;
          if(before===undefined||JSON.stringify(before)!==cs){   /* csak valódi válaszváltozás számít kitöltési időnek */
            try{var m=JSON.parse(localStorage.getItem(META))||{};m.ans=m.ans||{};m.ans[k]=new Date().toISOString();
              var nb=before?Object.keys(before).length:0,nc=Object.keys(cur).length;
              if(nb>0&&nc<nb){m.fresh=m.fresh||{};m.fresh[k]=m.ans[k];}   /* kiürült vagy megfogyott: új kitöltés indul */
              orig.call(this,META,JSON.stringify(m));}catch(x){}
            var now=Date.now();if(now-lastToast>6000){lastToast=now;toast('Mentve ezen az eszközön ✓');}
          }
        }
      };
      /* a tárolt válaszok (a YSQ és a mélytérkép saját mezőben tartja őket) */
      var prevAns={};
      function ansOf(k,raw){var j;try{j=JSON.parse(raw)}catch(e){return {}}if(!j||typeof j!=='object')return {};
        if(k==='ysq_autosave')j=j.answers;else if(k==='attachment_assessment_v1')j=j.draft;return j&&typeof j==='object'?j:{};}
      /* induló állapot: ami már el van mentve, ahhoz hasonlítunk */
      try{for(var i=0;i<localStorage.length;i++){var kk=localStorage.key(i);if(/-responses-v\d+$|^ysq_autosave$|^attachment_assessment_v1$/.test(kk))prevAns[kk]=ansOf(kk,localStorage.getItem(kk));}}catch(e){}
    }catch(e){}
    function toast(t,bad){
      if(!document.body)return;
      var el=document.getElementById('oni-toast');if(!el){el=document.createElement('div');el.id='oni-toast';ONI_HOST().appendChild(el);}
      el.setAttribute('style','position:fixed;right:16px;top:16px;z-index:10000;max-width:320px;padding:9px 14px;border-radius:12px;font:500 12.5px/1.4 Manrope,Inter,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:opacity .4s;opacity:1;'+(bad?'background:#4c0519;color:#fecdd3;border:1px solid #fb7185':'background:rgba(6,40,30,.92);color:#a7f3d0;border:1px solid rgba(52,211,153,.5)'));
      el.textContent=t;clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity='0'},bad?9000:1800);
    }
    window.ONI_TOAST=toast;
  })();

  /* ── Olvashatósági védőháló: ha egy szöveg a saját hátterén túl halvány (WCAG AA alatt),
        a színét a téma irányába húzza (sötét háttéren világosabbra, világoson sötétebbre). Mindkét témában fut. ── */
  (function(){
    var FIX='data-oni-fix',busy=false,tm=null;
    function parse(c){var m=c&&c.match(/rgba?\(([^)]+)\)/);if(!m)return null;var p=m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}}
    function lum(c){function f(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
    function blend(t,b){return {r:t.r*t.a+b.r*(1-t.a),g:t.g*t.a+b.g*(1-t.a),b:t.b*t.a+b.b*(1-t.a),a:1}}
    function ratio(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
    /* gradiensnél a legsötétebb és a legvilágosabb színmegállót is figyelembe vesszük (legrosszabb eset) */
    function gradStops(img){var m=img.match(/rgba?\([^)]+\)|#[0-9a-f]{6}\b/gi);if(!m)return null;var cs=m.map(function(x){if(x[0]==='#'){return {r:parseInt(x.substr(1,2),16),g:parseInt(x.substr(3,2),16),b:parseInt(x.substr(5,2),16),a:1}}return parse(x)});
      cs.sort(function(a,b){return lum(a)-lum(b)});var aa=cs.reduce(function(s,c){return s+c.a},0)/cs.length;var lo=cs[0],hi=cs[cs.length-1];return [{r:lo.r,g:lo.g,b:lo.b,a:aa},{r:hi.r,g:hi.g,b:hi.b,a:aa}]}
    var cache;
    function layers(el){
      if(cache.has(el))return cache.get(el);
      var cs=getComputedStyle(el),c=parse(cs.backgroundColor),img=cs.backgroundImage,g=img&&img!=='none'?gradStops(img):null,own=[];
      if(c&&c.a>0)own.push([c,c]);if(g&&g[0].a>0)own.push(g);   /* a gradiens a szín fölött van */
      var opaque=own.some(function(x){return x[0].a>=.99});
      var under=opaque||!el.parentElement?[]:layers(el.parentElement);
      var res=under.concat(own);cache.set(el,res);return res;
    }
    function bgOf(el){var ls=layers(el),base=parse(getComputedStyle(document.documentElement).backgroundColor);if(!base||base.a<.5)base=document.documentElement.getAttribute('data-theme')==='dark'?{r:11,g:18,b:32,a:1}:{r:248,g:250,b:252,a:1};
      var lo=base,hi=base;ls.forEach(function(l){lo=blend(l[0],lo);hi=blend(l[1],hi)});return [lo,hi]}
    function mix(a,b,t){return {r:a.r+(b.r-a.r)*t,g:a.g+(b.g-a.g)*t,b:a.b+(b.b-a.b)*t,a:1}}
    function run(){
      if(busy||!document.body)return;busy=true;cache=new Map();
      try{
        var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),t,seen=new Set();
        while((t=w.nextNode())){
          var el=t.parentElement;if(!el||seen.has(el)||!t.textContent.trim())continue;seen.add(el);
          if(el.closest('svg,script,style,#oni-toast,[data-oni-nofix],:disabled'))continue;
          var cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;
          if(/text/.test(cs.webkitBackgroundClip||cs.backgroundClip||'')||cs.webkitTextFillColor==='rgba(0, 0, 0, 0)')continue;
          var r=el.getClientRects();if(!r.length)continue;
          var fg=parse(cs.color);if(!fg||fg.a===0)continue;
          var bgs=bgOf(el),f=blend(fg,bgs[0]),fs=parseFloat(cs.fontSize),big=fs>=24||(fs>=18.66&&+cs.fontWeight>=700),need=big?3:4.5;
          var rmin=function(c){return Math.min(ratio(c,bgs[0]),ratio(c,bgs[1]))};
          if(rmin(f)>=need)continue;
          var mid={r:(bgs[0].r+bgs[1].r)/2,g:(bgs[0].g+bgs[1].g)/2,b:(bgs[0].b+bgs[1].b)/2,a:1};
          var D={r:15,g:23,b:42,a:1},Lt={r:248,g:250,b:252,a:1},K={r:0,g:0,b:0,a:1},W={r:255,g:255,b:255,a:1},first=lum(mid)>.3?[D,Lt,K,W]:[Lt,D,W,K],best=null;
          for(var q=0;q<4&&!best;q++)for(var k=1;k<=10;k++){var c=mix(f,first[q],k/10);if(rmin(c)>=need+.1){best=c;break}}
          best=best||[K,W].sort(function(a,b){return rmin(b)-rmin(a)})[0];
          if(!el.hasAttribute(FIX))el.setAttribute(FIX,el.style.getPropertyValue('color')||'');
          el.style.setProperty('color','rgb('+Math.round(best.r)+','+Math.round(best.g)+','+Math.round(best.b)+')','important');
          if(cs.webkitTextFillColor&&cs.webkitTextFillColor!==cs.color)el.style.setProperty('-webkit-text-fill-color','currentColor','important');
        }
      }catch(e){}
      busy=false;
    }
    function reset(){[].forEach.call(document.querySelectorAll('['+FIX+']'),function(e){e.style.removeProperty('color');e.style.removeProperty('-webkit-text-fill-color');var o=e.getAttribute(FIX);if(o)e.style.setProperty('color',o);e.removeAttribute(FIX)})}
    function soon(ms){clearTimeout(tm);tm=setTimeout(function(){(window.requestIdleCallback||setTimeout)(run,{timeout:800})},ms||400)}
    window.ONI_CONTRAST={run:run,reset:reset,soon:soon};
    function boot(){
      soon(250);setTimeout(run,1200);
      if(window.MutationObserver)new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){if(ms[i].type==='childList'&&ms[i].addedNodes.length){soon(500);return}if(ms[i].type==='attributes'&&ms[i].attributeName==='class'&&!/oni-cur|oni-flash|selected|active/.test(ms[i].target.className||'')){soon(500);return}}})
        .observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
      document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#oni-theme')){reset();setTimeout(run,60);}else soon(600)},true);
      window.addEventListener('oni:saved',function(){soon(500);setTimeout(run,1600)});
      window.addEventListener('hashchange',function(){soon(300)});
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  })();

  /* ── Kitöltés-segéd: folytatás az első megválaszolatlannál + fókusz mód ── */
  (function(){
    var focus=false,cur=0,units=[],bar=null,pill=null,auto=true;
    try{var _st=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{};if(_st.autoAdvance===false)auto=false;}catch(e){}
    function scope(){return document.querySelector('.test-panel.active')||document.body;}
    function scan(){
      units=[].slice.call(scope().querySelectorAll('.q, .fc')).filter(function(u){return u.querySelector('button[data-n]')&&!u.parentElement.closest('.q, .fc');});
      units.forEach(function(u){u.classList.add('oni-unit')});
      a11yAll();
      return units.length>=5;
    }
    /* ── Akadálymentes válaszadás: minden válaszcsoport a kérdés szövegével címkézett csoport,
          a gombok kijelölt állapota aria-pressed, a számbillentyű a látható értéket választja ── */
    function isSel(b){return b.classList.contains('selected')||b.classList.contains('active')||b.getAttribute('aria-checked')==='true'}
    function groupsOf(u){var g={},o=[];[].forEach.call(u.querySelectorAll('button[data-n]'),function(b){var n=b.getAttribute('data-n');if(!g[n]){g[n]=[];o.push(n)}g[n].push(b)});return o.map(function(n){return g[n]})}
    function a11y(u){
      if(u.getAttribute('data-oni-a11y'))return;u.setAttribute('data-oni-a11y','1');
      var gs=groupsOf(u),multi=gs.length>1;
      gs.forEach(function(bs,i){
        var box=bs[0].parentElement;if(!box||!bs.every(function(b){return b.parentElement===box}))return;
        var lbl=qLabel(multi?(box.closest('.fc-item, .sub-q, [data-n]:not(button)')||u):u);
        if(multi&&box.previousElementSibling&&box.previousElementSibling.textContent.trim())lbl=box.previousElementSibling.textContent.replace(/\s+/g,' ').trim().slice(0,200);
        box.setAttribute('role','group');box.setAttribute('aria-label',(multi?(i+1)+'. rész: ':'')+lbl);
        bs.forEach(function(b){b.setAttribute('aria-pressed',String(isSel(b)));if(!b.getAttribute('type'))b.setAttribute('type','button')});
      });
    }
    function a11yAll(){[].forEach.call(document.querySelectorAll('.q, .fc'),function(u){if(u.querySelector('button[data-n]')&&!u.parentElement.closest('.q, .fc'))a11y(u)})}
    if(window.MutationObserver)new MutationObserver(function(ms){ms.forEach(function(m){var b=m.target;if(b.matches&&b.matches('button[data-n]')&&b.hasAttribute('aria-pressed'))b.setAttribute('aria-pressed',String(isSel(b)))})})
      .observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','aria-checked']});
    /* a számbillentyű: ha a gombokon látható szám a tárolt értékkel egyezik (pl. 0–5), a szám azt az értéket választja;
       különben a sorszámot (1 = első gomb). Így a MAIA-2 „0” válasza és az első gomb nem keverhető össze. */
    function keyPick(bs,key){
      var vis=bs.map(function(b){var m=(b.textContent||'').trim().match(/^\d+/);return m?+m[0]:null});
      var val=bs.map(function(b){var v=b.getAttribute('data-value');if(v==null)v=b.getAttribute('data-v');return v==null?null:+v});
      var numeric=vis.every(function(x,i){return x!==null&&x===val[i]&&x<=9});
      if(numeric){var i=vis.indexOf(+key);return i>-1?bs[i]:null;}
      return key==='0'?null:bs[+key-1]||null;
    }
    function answered(u){var g={};[].forEach.call(u.querySelectorAll('button[data-n]'),function(b){var n=b.getAttribute('data-n');g[n]=g[n]||b.classList.contains('selected')||b.classList.contains('active')||b.getAttribute('aria-checked')==='true';});return Object.keys(g).every(function(k){return g[k]});}
    function showBtn(){return scope().querySelector('button[id$=showResults], button[id$=-show], #showResults');}
    function firstOpen(){for(var i=0;i<units.length;i++)if(!answered(units[i]))return i;return -1;}
    function css(){
      if(document.getElementById('oni-fill-css'))return;
      var st=document.createElement('style');st.id='oni-fill-css';
      st.textContent='body.oni-focus::before,body.oni-focus::after{opacity:.15!important}body.oni-focus .hub-header,body.oni-focus .test-panel.active header,body.oni-focus .hub-tabs,body.oni-focus .progress-shell{display:none!important}body.oni-focus .oni-unit:not(.oni-cur){display:none!important}body.oni-focus .test-panel.active .section-head,body.oni-focus .test-panel.active .intro-box{display:none}'+
      'body.oni-focus .oni-sheet,body.oni-focus button[id$=showResults]:disabled,body.oni-focus button[id$=-show]:disabled{display:none!important}body.oni-focus{padding-bottom:180px}body.oni-focus .oni-unit.oni-cur{margin-top:12vh;transform:scale(1.02);box-shadow:0 0 0 2px var(--u-sapphire2,#1d4ed8),var(--u-shadow)}'+
      '.oni-unit.oni-flash{animation:oniFlash 1.6s ease}@keyframes oniFlash{0%,60%{box-shadow:0 0 0 3px var(--u-sapphire2,#1d4ed8)}100%{box-shadow:none}}'+
      '.oni-btn{white-space:nowrap;appearance:none;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(10,20,40,.92);color:#e6ecf5;font:600 12.5px/1 Manrope,Inter,system-ui,sans-serif;padding:10px 14px;border-radius:99px;backdrop-filter:blur(8px)}'+
      '.oni-btn:hover{border-color:var(--u-sapphire2,#1d4ed8)}.oni-btn.pri{background:#fbbf24;color:#0a1428;border-color:#fbbf24}'+
      '#oni-misslist{position:fixed;left:14px;bottom:64px;z-index:9999;width:min(420px,calc(100% - 28px));max-height:55vh;overflow:auto;padding:12px 14px;border-radius:14px;background:var(--u-paper,#fff);color:var(--u-ink,#0f172a);border:1px solid var(--u-line,#cbd5e1);box-shadow:var(--u-shadow);font:500 13px/1.45 Inter,system-ui,sans-serif}'+
      '#oni-misslist ul{list-style:none;margin:6px 0 4px;padding:0}#oni-misslist p{margin:6px 0;color:var(--u-soft,#334155)}#oni-misslist .oni-ml-o{color:var(--u-gold,#8a6a1f)}'+
      '.oni-ml-h{display:flex;justify-content:space-between;align-items:center}.oni-ml-x{background:none;border:none;color:var(--u-muted,#5b6778);font-size:20px;cursor:pointer;padding:0 4px}'+
      '.oni-mi{display:block;width:100%;text-align:left;background:none;border:none;color:var(--u-ink,#0f172a);font:inherit;padding:6px 8px;border-radius:8px;cursor:pointer}.oni-mi:hover,.oni-mi:focus-visible{background:var(--u-bg2,#f1f5f9);outline:2px solid var(--u-sapphire2,#1d4ed8)}.oni-mi b{color:var(--u-gold,#8a6a1f);margin-right:4px}'+
      '@media (max-width:480px){#oni-misslist{bottom:110px}}'+
      '@media (max-width:480px){body.oni-focus .oni-unit.oni-cur{margin-top:12px;transform:none}#oni-focusbar .oni-btn{padding:9px 11px;font-size:12px}#oni-pos{font-size:11.5px!important;padding:0 2px!important}}@media print{#oni-pill,#oni-focusbar,#oni-toast{display:none!important}}';
      document.head.appendChild(st);
    }
    function mkPill(){
      if(!pill){pill=document.createElement('div');pill.id='oni-pill';pill.setAttribute('style','position:fixed;left:14px;bottom:14px;z-index:9998;display:flex;gap:8px;flex-wrap:wrap;max-width:calc(100% - 28px)');ONI_HOST().appendChild(pill);}
      var ol=document.getElementById('oni-misslist');if(ol&&!focus)ol.remove();   /* elavult lista helyett a gombbal újranyitható */
      if(focus||!scan()){pill.style.display='none';return;}
      var i=firstOpen(),n=units.length,done=units.filter(answered).length;
      pill.style.display='flex';
      var sb=showBtn(),resVisible=!!scope().querySelector('.results.visible, .results[style*="block"], #results.visible, .results-wrap.visible');
      pill.innerHTML=(i>=0&&done>0?'<button class="oni-btn pri" id="oni-cont">Folytatás: '+(i+1)+'. kérdés ›</button>':'')
        +(i>=0&&done>0?'<button class="oni-btn" id="oni-miss" aria-expanded="false" aria-controls="oni-misslist" title="A hiányzó kérdések listája">'+(n-done)+' kérdés hiányzik'+(optMiss()?' ('+optMiss()+' kihagyható)':'')+' ▴</button>':'')
        +(i>=0?'<button class="oni-btn" id="oni-focus-on" title="Egyszerre egy kérdés, billentyűzettel is: a számbillentyű a gombon látható számot választja, ←/→ lapoz, Esc kilép">Fókusz mód</button>':'')
        +(i<0&&sb&&!sb.disabled&&!resVisible?'<button class="oni-btn pri" id="oni-res">Minden kérdés megvan · Eredmény megtekintése ›</button>':'');
      var rb=document.getElementById('oni-res');if(rb)rb.onclick=function(){sb.click();setTimeout(mkPill,400)};
      var c=document.getElementById('oni-cont');if(c)c.onclick=function(){go(firstOpen(),true)};
      var f=document.getElementById('oni-focus-on');if(f)f.onclick=function(){enter()};
      var ms=document.getElementById('oni-miss');if(ms)ms.onclick=function(){missList(ms)};
    }
    /* ── Kattintható lista a hiányzó kérdésekről; a szándékosan kihagyható részek külön ── */
    function optOf(u){var o=u.closest('[data-optional]');return o?o.getAttribute('data-optional'):null}
    function optMiss(){return units.filter(function(u){return !answered(u)&&optOf(u)}).length}
    function qLabel(u){var c=u.cloneNode(true);[].forEach.call(c.querySelectorAll('button,input,label,.oni-unclear,.q-num'),function(x){x.remove()});var t=c.textContent.replace(/\s+/g,' ').trim();return t.length>70?t.slice(0,68).trim()+'…':t}
    function missList(anchor){
      var old=document.getElementById('oni-misslist');if(old){old.remove();if(anchor)anchor.setAttribute('aria-expanded','false');return;}
      var req=[],opt=[];units.forEach(function(u,k){if(answered(u))return;(optOf(u)?opt:req).push(k)});
      var row=function(k){return '<li><button type="button" class="oni-mi" data-k="'+k+'"><b>'+(k+1)+'.</b> '+esc(qLabel(units[k]))+'</button></li>'};
      var el=document.createElement('div');el.id='oni-misslist';el.setAttribute('role','dialog');el.setAttribute('aria-label','Hiányzó kérdések');
      el.innerHTML='<div class="oni-ml-h"><b>Hiányzó kérdések</b><button type="button" class="oni-ml-x" aria-label="Bezár">×</button></div>'+
        (req.length?'<ul>'+req.map(row).join('')+'</ul>':'<p>Minden kötelező kérdés megvan.</p>')+
        (opt.length?'<p class="oni-ml-o">Kihagyható ('+esc(optOf(units[opt[0]]))+'): ha nem vonatkozik rád, ezek nélkül is megnyitható az eredmény.</p><ul>'+opt.map(row).join('')+'</ul>':'');
      ONI_HOST().appendChild(el);if(anchor)anchor.setAttribute('aria-expanded','true');
      el.querySelector('.oni-ml-x').onclick=function(){missList(anchor)};
      el.addEventListener('click',function(e){var b=e.target.closest('.oni-mi');if(!b)return;var k=+b.getAttribute('data-k');el.remove();if(anchor)anchor.setAttribute('aria-expanded','false');
        if(focus)show(k);else{go(k,true);var bt=units[k].querySelector('button[data-n]');if(bt)setTimeout(function(){bt.focus({preventScroll:true})},450);}});
      var first=el.querySelector('.oni-mi');if(first)first.focus();
    }
    function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function go(i,flash){if(i<0||!units[i])return;units[i].scrollIntoView({behavior:'smooth',block:'center'});if(flash){units[i].classList.remove('oni-flash');void units[i].offsetWidth;units[i].classList.add('oni-flash');}}
    function show(i){
      cur=Math.max(0,Math.min(units.length-1,i));
      units.forEach(function(u,k){u.classList.toggle('oni-cur',k===cur)});
      var fg=groupsOf(units[cur]),og=fg.filter(function(x){return !x.some(isSel)})[0]||fg[0];if(og){var fb=og.filter(isSel)[0]||og[0];setTimeout(function(){try{fb.focus({preventScroll:true})}catch(e){}},30);}
      if(bar){var d=units.filter(answered).length;bar.querySelector('#oni-pos').textContent=(cur+1)+' / '+units.length+(d<units.length?' · '+(units.length-d)+' hiányzik':' · kész');}
      /* a kérdés és minden válaszgombja férjen el a vezérlősáv fölött; ha túl magas, a tetejétől látszódjon */
      var u=units[cur],r=u.getBoundingClientRect(),bh=bar?bar.getBoundingClientRect().height+20:0,room=window.innerHeight-bh;
      var off=r.height>room-24?12:Math.max(12,Math.min(window.innerHeight*0.18,room-r.height-12));
      window.scrollTo({top:r.top+window.scrollY-off,behavior:'smooth'});
    }
    function enter(){
      if(!scan())return;focus=true;document.body.classList.add('oni-focus');
      bar=document.createElement('div');bar.id='oni-focusbar';
      bar.setAttribute('style','position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9999;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center;padding:7px;max-width:calc(100% - 16px);width:max-content;border-radius:22px;background:var(--u-paper,#fff);border:1px solid var(--u-line,#cbd5e1);box-shadow:var(--u-shadow)');
      bar.innerHTML='<label class="oni-btn" style="display:flex;gap:6px;align-items:center" title="Válasz után automatikusan a következő kérdésre lép"><input type="checkbox" id="oni-auto" '+(auto?'checked':'')+'> auto</label><button class="oni-btn" id="oni-prev" aria-label="Előző kérdés">‹ Előző</button><span id="oni-pos" style="color:var(--u-soft,#334155);font:600 12.5px Inter,sans-serif;padding:0 8px;white-space:nowrap"></span><button class="oni-btn pri" id="oni-next" aria-label="Következő kérdés">Tovább ›</button><button class="oni-btn" id="oni-fmiss" title="A hiányzó kérdések listája" aria-controls="oni-misslist">Hiányzók</button><button class="oni-btn" id="oni-exit" title="Vissza a listanézethez">Lista</button>';
      ONI_HOST().appendChild(bar);
      bar.querySelector('#oni-auto').onchange=function(e){auto=e.target.checked;try{var st=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{};st.autoAdvance=auto;localStorage.setItem('onismeret-settings-v1',JSON.stringify(st))}catch(x){}};
      bar.querySelector('#oni-prev').onclick=function(){show(cur-1)};
      bar.querySelector('#oni-next').onclick=function(){next()};
      bar.querySelector('#oni-exit').onclick=function(){exit()};
      bar.querySelector('#oni-fmiss').onclick=function(){missList(this)};
      mkPill();var i=firstOpen();show(i<0?0:i);
    }
    function exit(scrollToEnd){
      var ml=document.getElementById('oni-misslist');if(ml)ml.remove();
      focus=false;document.body.classList.remove('oni-focus');units.forEach(function(u){u.classList.remove('oni-cur')});
      if(bar){bar.remove();bar=null;}mkPill();
      if(scrollToEnd){var sb=scope().querySelector('button[id$=show], button[id$=showResults], .results-trigger button');if(sb)sb.scrollIntoView({behavior:'smooth',block:'center'});}
      else if(units[cur])go(cur);
    }
    function next(){
      var open=firstOpen();
      if(cur<units.length-1)show(cur+1);
      else if(open>=0)show(open);
      else exit(true);
    }
    document.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('button[data-n]');
      if(!t)return;
      setTimeout(function(){
        if(focus&&units[cur]&&units[cur].contains(t)&&answered(units[cur])){
          if(!auto){show(cur);return;}
          var open=firstOpen();
          if(open<0)exit(true);else if(cur<units.length-1)show(cur+1);else show(open);
        } else if(!focus)mkPill();
      },260);
    },true);
    document.addEventListener('keydown',function(e){
      if(!focus||e.metaKey||e.ctrlKey||e.altKey||/input|textarea|select/i.test((e.target.tagName||'')))return;
      if(e.key==='ArrowRight'){e.preventDefault();next();}
      else if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1);}
      else if(e.key==='Escape'){exit();}
      else if(/^[0-9]$/.test(e.key)){
        var u=units[cur];if(!u)return;var gs=groupsOf(u);
        var g=gs.filter(function(x){return !x.some(isSel)})[0]||gs[0];
        var b=g&&keyPick(g,e.key);if(b){e.preventDefault();b.click();b.focus({preventScroll:true});}
      }
    });
    function boot(){css();setTimeout(mkPill,600);}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
    window.addEventListener('hashchange',function(){if(focus)exit();setTimeout(mkPill,300)});
    document.addEventListener('click',function(e){if(!e.target.closest)return;if(e.target.closest('.hub-tab')){if(focus)exit();setTimeout(mkPill,300);}else if(e.target.closest('button[id$=showResults], button[id$=-show], #showResults, #oni-res')){setTimeout(mkPill,600);}});
  })();

  window.addEventListener('oni:saved',function(e){setTimeout(function(){banner(e.detail.id)},900);});
  return {K:K,LIMIT:LIMIT,META:META,IDKEY:IDKEY,VERS:VERS,vOf:vOf,same:same,isCur:isCur,verText:verText,markFresh:markFresh,remindCfg:remindCfg,setRemind:setRemind,due:due,all:all,save:save,r:r,PATH:PATH,pathState:pathState,markBackup:markBackup,backupAgeDays:backupAgeDays};
})();

/* ── assets/oni-rules.js ── */
/* Önismereti térképek — tesztek közti minták (közös modul).
   Az összegzés, a mélyelemzés és a Fókusz-oldal ugyanezeket a szabályokat használja.
   Használat: var RX = ONI_RULES({store: ONI.all(), isCur: ONI.isCur}); RX.evalRules() → {fired, locked} */
window.ONI_RULES = function(ctx){
const store = ctx.store || {};
const last=id=>{const h=store[id];return h&&h.length?h[h.length-1]:null};
const cur=id=>{const r=last(id);return r&&(!ctx.isCur||ctx.isCur(id,r))?r:null};
let TRACK=null;
const val=(id,k)=>{const r=cur(id);if(TRACK&&r&&r.d&&r.d[k])TRACK.push([id,k]);return r&&r.d&&r.d[k]?r.d[k][1]:null};
const avgAll=id=>{const r=cur(id);if(TRACK&&r)TRACK.push([id,'*']);if(!r||!r.d)return null;const v=Object.values(r.d).map(x=>x[1]).filter(x=>typeof x==='number');return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};

/* ── Minták: legalább `min` jelzés kell ugyanabba az irányba ── */
const S=(test,label,fn)=>({test,label,fn});
const RULES=[
 {id:'anx',title:'Szorongó kötődési minta',acc:'#fb7185',min:2,
  sig:[S('ecr','ECR-R szorongás ≥ 4,5',()=>val('ecr','anx')>=4.5),S('kotodes','Mélytérkép: szorongás ≥ 50',()=>val('kotodes','anxiety')>=50),S('las','Mania (birtokló szeretet) ≥ 3',()=>val('las','mania')>=3),S('smi','Sebezhető gyermek mód ≥ 4',()=>val('smi','vuln')>=4),S('ysq','Elhagyatottság séma ≥ 4,5',()=>val('ysq','ab')>=4.5)],
  text:'Ezek az eredmények arra utalhatnak, hogy a kötődési rendszered érzékenyen reagál a másik elérhetőségére: távolság vagy bizonytalanság esetén gyorsabban jelenhet meg a nyugtalanság, a megerősítés keresése, a jelek figyelése.',
  q:'Felismersz magadon ilyen helyzetet az elmúlt hónapokból? Mi váltotta ki, és mi segített megnyugodni?',
  action:'Figyeld meg a következő „riasztásnál”, mi a kiváltó, és mit csinálsz utána (üzenet, ellenőrzés, visszahúzódás). Ezt a láncot érdemes terápiában vagy egy megbízható emberrel átbeszélni.'},
 {id:'avo',title:'Elkerülő kötődési minta',acc:'#60a5fa',min:2,
  sig:[S('ecr','ECR-R elkerülés ≥ 4,5',()=>val('ecr','avd')>=4.5),S('kotodes','Mélytérkép: elkerülés ≥ 50',()=>val('kotodes','avoidance')>=50),S('las','Ludus (játékos szeretet) ≥ 3',()=>val('las','ludus')>=3),S('smi','Elszakadó védő mód ≥ 4',()=>val('smi','detached')>=4),S('ysq','Érzelmi gátoltság séma ≥ 4,5',()=>val('ysq','ei')>=4.5)],
  text:'Ezek az eredmények arra utalhatnak, hogy a közelség nálad könnyebben élhető meg nyomásként, és a biztonságot inkább az önállóság és a kontroll adja. Ez a mélyebb érzelmi bevonódást nehezítheti.',
  q:'Van olyan kapcsolati helyzet, amikor érezted, hogy hátrébb lépsz, miközben valójában közelebb szerettél volna kerülni?',
  action:'Nézd meg, mikor húzódsz vissza: melyik helyzet után, milyen testi jelzéssel. A visszahúzódás előtti pillanat az, ahol választásod van.'},
 {id:'withdraw',title:'Kivonulás konfliktusban',acc:'#94a3b8',min:2,
  sig:[S('tki','Elkerülő konfliktusmód ≥ 3,5',()=>val('tki','avoid')>=3.5),S('gott','Falazás ≥ 3,5',()=>val('gott','stone')>=3.5),S('ecr','ECR-R elkerülés ≥ 4,5',()=>val('ecr','avd')>=4.5),S('ysq','Érzelmi gátoltság ≥ 4,5',()=>val('ysq','ei')>=4.5)],
  text:'Lehetséges, hogy feszült helyzetben hajlamos vagy lekapcsolni vagy kilépni. Ez sokszor nem tudatos döntés, hanem túlterhelődés. A másik fél viszont elutasításként élheti meg.',
  q:'Mi történik a testedben közvetlenül azelőtt, hogy egy vitából kivonulsz?',
  action:'Vezess be egy <b>bejelentett szünetet</b>: „Most túl sok, 20 perc múlva visszajövök.” A kivonulás így nem büntetésnek, hanem szabályozásnak látszik.'},
 {id:'finish',title:'Indít, de nem zár le',acc:'#fbbf24',min:2,
  sig:[S('kolbe','Gyorsindító ≥ 7',()=>val('kolbe','qs')>=7),S('kolbe','Rendszerező ≤ 4',()=>val('kolbe','ft')!==null&&val('kolbe','ft')<=4),S('bf','Lelkiismeretesség ≤ 36/60',()=>val('bf','C')!==null&&val('bf','C')<=36),S('ft','Kötelességtudó vagy Lázadó tendencia',()=>{const r=last('ft');return r&&r.x&&(r.x.primary==='O'||r.x.primary==='R')}),S('ysq','Elégtelen önkontroll séma ≥ 4,5',()=>val('ysq','is')>=4.5),S('fti','Felfedező temperamentum ≥ 38',()=>val('fti','exp')>=38),S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28)],
  text:'Ezek a jelzések olyan mintára utalhatnak, amelyben az indítás energiája erős, a lezáráshoz szükséges struktúra gyengébb. Ilyenkor a további tervezés kevésbé segít, mint egy külső lezárási pont.',
  q:'Melyik az a 2–3 elkezdett dolog, amit most lezárhatnál, mielőtt újat kezdesz?',
  action:'A befejezést ne akaraterőre bízd: <b>külső lezárási pont</b> kell (határidő valakinek, fizetett vállalás, heti beszámoló), vagy egy Rendszerező alkatú partner. Új projekt csak egy régi lezárása után.'},
 {id:'paralysis',title:'Elemzési bénultság',acc:'#818cf8',min:2,
  sig:[S('kolbe','Tényfeltáró ≥ 7',()=>val('kolbe','ff')>=7),S('kolbe','Gyorsindító ≤ 4',()=>val('kolbe','qs')!==null&&val('kolbe','qs')<=4),S('ft','Kérdező tendencia',()=>{const r=last('ft');return r&&r.x&&r.x.primary==='Q'}),S('ysq','Könyörtelen mércék ≥ 4,5',()=>val('ysq','us')>=4.5),S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28)],
  text:'Lehetséges, hogy a döntés előtti információgyűjtés biztonságot ad neked, de időnként a döntést helyettesíti.',
  q:'Melyik döntést halasztod most azzal, hogy még utánanézel valaminek?',
  action:'Minden döntésnél írd fel előre: <b>meddig gyűjtök, és milyen információ változtatná meg a döntést?</b> Ha a határidő lejárt, a legjobb elérhető opció mellett döntesz.'},
 {id:'autonomy',tone:'jelleg',title:'Autonómia a motor',acc:'#a78bfa',min:2,
  sig:[S('pvq','Önirányítás vezérérték (centrált ≥ 0,5)',()=>val('pvq','SD')>=0.5),S('ft','Lázadó vagy Kérdező tendencia',()=>{const r=last('ft');return r&&r.x&&(r.x.primary==='R'||r.x.primary==='Q')}),S('pvq','Konformitás alacsony (≤ −0,5)',()=>val('pvq','CO')!==null&&val('pvq','CO')<=-0.5),S('kolbe','Gyorsindító ≥ 7',()=>val('kolbe','qs')>=7)],
  text:'Ezek a jelzések arra utalhatnak, hogy a választás szabadsága és a saját út nálad energiaforrás, a kívülről ráerőltetett keretek pedig lemeríthetnek, akkor is, ha észszerűek.',
  q:'Hol érzed most kötelezőnek azt, amit akár saját választásként is felépíthetnél?',
  action:'A szükséges struktúrát <b>saját választásként</b> építsd fel: te döntöd el a szabályt, a határidőt, a formát. Munkában ott teremts értéket, ahol te határozod meg a hogyant.'},
 {id:'drive',title:'Teljesítmény-hajtás',acc:'#f59e0b',min:2,
  sig:[S('pvq','Teljesítmény érték (centrált ≥ 0,5)',()=>val('pvq','AC')>=0.5),S('ysq','Könyörtelen mércék ≥ 4,5',()=>val('ysq','us')>=4.5),S('smi','Követelő szülő mód ≥ 4',()=>val('smi','demanding')>=4),S('bf','Lelkiismeretesség ≥ 44/60',()=>val('bf','C')>=44),S('tki','Versengő konfliktusmód ≥ 3,5',()=>val('tki','comp')>=3.5),S('scs','Önítélkezés ≥ 3,5',()=>val('scs','SJ')>=3.5)],
  text:'A siker és a mérce nálad valószínűleg központi szerepű. Ez hajtóerő lehet, de ha a belső követelő hang túl erős, az eredmény ritkán érződik elégnek.',
  q:'Mikor pihentél utoljára bűntudat nélkül?',
  action:'Tegyél különbséget <b>vágy és kényszer</b> között: „Ezt azért csinálom, mert akarom, vagy mert különben nem vagyok elég?” Ahol a második, ott a mérce nem motivál, hanem büntet.'},
 {id:'emo',title:'Erős érzelmi reaktivitás',acc:'#fb7185',min:2,
  sig:[S('bf','Neuroticizmus ≥ 40/60',()=>val('bf','N')>=40),S('smi','Sebezhető gyermek ≥ 4',()=>val('smi','vuln')>=4),S('smi','Dühös gyermek ≥ 4',()=>val('smi','angry')>=4),S('ecr','ECR-R szorongás ≥ 4,5',()=>val('ecr','anx')>=4.5),S('gott','Elárasztás/falazás ≥ 3,5',()=>val('gott','stone')>=3.5),S('ders','DERS-SF összpontszám ≥ 54',()=>val('ders','total')>=54),S('ders','DERS impulzuskontroll ≥ 10',()=>val('ders','impulse')>=10)],
  text:'Ezek a jelzések arra utalhatnak, hogy az érzelmek nálad gyorsan és erősen jönnek, és nehezebben csillapodnak. Ez érzékenység, nem jellemhiba, és szabályozással jól kezelhető.',
  q:'Melyik az a helyzet, amelyben a leggyorsabban „felmegy” benned valami?',
  action:'A kulcs a <b>szabályozás a reakció előtt</b>: légzés, mozgás, szünet. Érdemes egy légzéstechnikát addig gyakorolni, amíg automatikus nem lesz.'},
 {id:'soothe',title:'Öncsillapító megküzdés',acc:'#2dd4bf',min:2,
  sig:[S('smi','Elterelő öncsillapító mód ≥ 4',()=>val('smi','soother')>=4),S('ysq','Elégtelen önkontroll ≥ 4,5',()=>val('ysq','is')>=4.5),S('smi','Impulzív gyermek ≥ 4',()=>val('smi','impulsive')>=4),S('bf','Neuroticizmus ≥ 40/60',()=>val('bf','N')>=40),S('tfeq','Érzelmi evés ≥ 50/100',()=>val('tfeq','EE')>=50),S('ders','DERS korlátozott stratégiák ≥ 10',()=>val('ders','strat')>=10)],
  text:'Lehetséges, hogy feszültség alatt gyors csillapításhoz nyúlsz (evés, görgetés, munka, stimuláció), ami rövid távon működik, de nem oldja meg azt, ami a feszültséget okozta.',
  q:'Mi az a csillapító, amihez a leggyakrabban nyúlsz, és mit érzel közvetlenül előtte?',
  action:'Nem tiltás kell, hanem <b>köztes lépés</b>: mielőtt a megszokott csillapítóhoz nyúlsz, 2 perc: „Mit érzek most, és mire lenne valójában szükségem?”'},
 {id:'access',title:'Nehéz hozzáférés az érzésekhez',acc:'#818cf8',min:2,
  sig:[S('tas','TAS-20 ≥ 61',()=>val('tas','total')>=61),S('maia2','MAIA-2 átlag ≤ 2,5',()=>{const a=avgAll('maia2');return a!==null&&a<=2.5}),S('ysq','Érzelmi gátoltság ≥ 4,5',()=>val('ysq','ei')>=4.5),S('smi','Elszakadó védő ≥ 4',()=>val('smi','detached')>=4),S('ders','DERS tisztánlátás ≥ 10',()=>val('ders','clarity')>=10),S('ders','DERS tudatosság ≥ 10',()=>val('ders','aware')>=10)],
  text:'Ezek az eredmények arra utalhatnak, hogy az érzések felismerése, megnevezése vagy a testi jelzések észlelése nehezebben megy. Ilyenkor az érzelmek inkább feszültségként vagy fáradtságként jelenhetnek meg.',
  q:'Tegnap milyen érzéseid voltak? Hány szóval tudnád megnevezni őket?',
  action:'Napi 2×1 perc <b>testi check-in</b>: hol érzel feszültséget, milyen a légzésed, milyen szó írja le. Az interocepció edzhető.'},
 {id:'giver',title:'Önfeláldozó minta',acc:'#34d399',min:2,
  sig:[S('las','Agape ≥ 4',()=>val('las','agape')>=4),S('tki','Alkalmazkodó konfliktusmód ≥ 3,5',()=>val('tki','acc')>=3.5),S('ysq','Önfeláldozás séma ≥ 4,5',()=>val('ysq','ss')>=4.5),S('smi','Alávető mód ≥ 4',()=>val('smi','compliant')>=4),S('ft','Kötelességtudó tendencia',()=>{const r=last('ft');return r&&r.x&&r.x.primary==='O'})],
  text:'Ezek a jelzések arra utalhatnak, hogy mások igényei gyakran megelőzik a sajátjaidat. Ha ez tartós, felgyűlhet a neheztelés.',
  q:'Mi az a saját igényed, amit mostanában nem mondtál ki?',
  action:'Hetente egy <b>kimondott saját igény</b>, kompromisszum nélkül. Figyeld, milyen érzés, és mi történik a kapcsolatban.'},
 {id:'spectator',title:'Megfigyelő mód az intimitásban',acc:'#fb7185',min:2,
  sig:[S('sisses','SIS1 (teljesítménygátlás) ≥ 3',()=>val('sisses','sis1')>=3),S('saq','Szexuális monitorozás ≥ 32',()=>val('saq','SM')>=32),S('nsss','Szexuális elégedettség ≤ 60',()=>val('nsss','total')!==null&&val('nsss','total')<=60),S('pedt','PEDT ≥ 9',()=>val('pedt','total')>=9)],
  text:'Lehetséges, hogy intim helyzetben a figyelmed egy része kívülről figyeli, hogyan teljesítesz. Ezt a „spectator mode” mintát a kutatások a teljesítményszorongással hozzák összefüggésbe.',
  q:'Mire figyelsz leginkább intim helyzetben: az érzeteidre, vagy arra, hogyan alakul?',
  action:'A figyelem visszahozása <b>az érzetekbe</b> (sensate focus): teljesítménycél nélküli érintés, a jelen pillanat érzeteire fókuszálva. Tartós panasznál szexuálterapeuta.'},
 {id:'harsh',title:'Éles kommunikáció vitában',acc:'#f97316',min:2,
  sig:[S('gott','Kritika ≥ 3,5',()=>val('gott','crit')>=3.5),S('gott','Megvetés ≥ 3',()=>val('gott','cont')>=3),S('tki','Versengő konfliktusmód ≥ 3,5',()=>val('tki','comp')>=3.5),S('smi','Támadó mód ≥ 4',()=>val('smi','bully')>=4)],
  text:'Ezek a jelzések arra utalhatnak, hogy vitában élesebben fogalmazol, mint szeretnéd: a konkrét viselkedés helyett a személyt minősíted. Gottman kutatásaiban ez a kapcsolati romlás egyik erős előrejelzője volt.',
  q:'Melyik mondatod szokott a legtöbb bajt okozni egy vitában?',
  action:'<b>Szelíd indítás</b>: „Én ___ érzek, amikor ___ történik. Azt szeretném, ha ___.” Egy hétig minden panaszt így fogalmazz meg.'},
 {id:'shame',title:'Büntető belső hang',acc:'#fb7185',min:2,
  sig:[S('scs','Önegyüttérzés ≤ 2,5',()=>val('scs','total')!==null&&val('scs','total')<=2.5),S('ysq','Büntető készenlét séma ≥ 4,5',()=>val('ysq','pu')>=4.5),S('smi','Büntető szülő mód ≥ 4',()=>val('smi','punitive')>=4),S('ders','Érzelmek el nem fogadása ≥ 10',()=>val('ders','nonacc')>=10),S('scs','Önítélkezés ≥ 3,5',()=>val('scs','SJ')>=3.5)],
  text:'Lehetséges, hogy hibázás vagy nehéz érzés után a belső hangod inkább büntet, mint támogat. A kutatások szerint ez nem növeli a motivációt, inkább a kudarctól való félelmet és az elkerülést erősíti.',
  q:'Hogyan beszélsz magadban magadhoz, amikor elrontasz valamit? Így beszélnél egy barátoddal is?',
  action:'Kudarc után <b>három mondat</b>: „Ez most nehéz. Ezt más is átéli. Mit mondanék egy barátomnak?” Az önegyüttérzés a kutatásokban több újrapróbálkozással jár, nem kevesebbel.'},
 {id:'emoproc',title:'Érzelmi halogatás',acc:'#f59e0b',min:2,
  sig:[S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28),S('ders','DERS célirányos működés ≥ 10',()=>val('ders','goals')>=10),S('ders','DERS korlátozott stratégiák ≥ 10',()=>val('ders','strat')>=10),S('scs','Túlazonosulás ≥ 3,5',()=>val('scs','OI')>=3.5)],
  text:'Ezek a jelzések arra utalhatnak, hogy a halogatás mögött nem (csak) időbeosztás áll, hanem az, hogy a feladat kellemetlen érzést kelt, és az elkerülés azonnal csillapít.',
  q:'Melyik feladatot halogatod most, és milyen érzést kelt benned, ha rágondolsz?',
  action:'A feladat előtt nevezd meg az érzést, amit kelt, és tedd <b>nevetségesen kicsivé</b> az első lépést (2 perc, egy mondat, egy fájl megnyitása). Az érzés a kezdés után sokszor gyengül.'},
 {id:'bids',title:'Minőségi idő-igény, gyenge felé fordulás',acc:'#fbbf24',min:2,
  sig:[S('love','Első szeretetnyelv: Minőségi idő',()=>{const r=last('love');if(!r)return false;const top=Object.entries(r.d).sort((a,b)=>b[1][1]-a[1][1])[0];return top&&top[0]==='B'}),S('gott','Egymás felé fordulás ≤ 3',()=>val('gott','turn')!==null&&val('gott','turn')<=3)],
  text:'A figyelem és a közös jelenlét a legfontosabb szeretetnyelved, miközben az eredmények szerint a kapcsolatban az apró kapcsolódási kísérletekre adott válasz gyengébb. Ez hiányérzethez vezethet.',
  q:'Mikor érezted utoljára, hogy a párod teljes figyelme veled van?',
  action:'Egy hétig figyeld és számold a saját és a párod <b>apró jelzéseit</b> (megjegyzés, kérdés, érintés), és hogy mennyire fordultok egymás felé.'},
 {id:'execadhd',title:'Figyelmi és végrehajtási nehézség',acc:'#f97316',min:2,
  sig:[S('asrs','ASRS A rész ≥ 4/6',()=>val('asrs','partA')>=4),S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28),S('bf','Lelkiismeretesség ≤ 36/60',()=>val('bf','C')!==null&&val('bf','C')<=36),S('ysq','Elégtelen önkontroll ≥ 4,5',()=>val('ysq','is')>=4.5),S('ders','DERS impulzuskontroll ≥ 10',()=>val('ders','impulse')>=10)],
  text:'Ezek a jelzések arra utalhatnak, hogy a nehézség nem (csak) akarat vagy motiváció kérdése: a figyelem, a kezdés és a befejezés szabályozása is érintett lehet. Ez lehet ADHD, de alváshiány, szorongás vagy depresszió is okozhatja. A szűrők nem diagnosztizálnak.',
  q:'Mióta jellemző rád ez a működés? Volt-e már gyerekkorban is?',
  action:'Ha az ASRS szűrő pozitív, érdemes <b>szakmai kivizsgálást</b> kérni (pszichiáter, klinikai szakpszichológus). Addig is: külső struktúra (naptár, határidő, közös munka) az akaraterő helyett.'},
 {id:'mood',title:'Hangulati terhelés',acc:'#60a5fa',min:2,
  sig:[S('phq9','PHQ-9 ≥ 10',()=>val('phq9','total')>=10),S('gad7','GAD-7 ≥ 10',()=>val('gad7','total')>=10),S('bf','Neuroticizmus ≥ 40/60',()=>val('bf','N')>=40),S('ders','DERS-SF összpontszám ≥ 54',()=>val('ders','total')>=54),S('scs','Önegyüttérzés ≤ 2,5',()=>val('scs','total')!==null&&val('scs','total')<=2.5)],
  text:'Ezek az eredmények együtt arra utalhatnak, hogy most nagyobb érzelmi terhelés alatt vagy. Ilyenkor a többi teszt eredménye is sötétebbnek tűnhet, mint egy nyugodtabb időszakban.',
  q:'Mi változott az utóbbi hetekben, ami ehhez hozzájárulhatott?',
  action:'Ha ez hetek óta tart, beszélj róla <b>szakemberrel</b>. Addig is: alvás, napi mozgás és legalább egy beszélgetés valakivel, akiben megbízol. Ha nagyon nehéz: Lelki Elsősegély Telefonszolgálat, 116-123.'},
 {id:'selfworth',title:'Törékeny önértékelés',acc:'#be123c',min:2,
  sig:[S('rses','Önértékelés (RSES) ≤ 14',()=>val('rses','total')!==null&&val('rses','total')<=14),S('bfne','Ítélettől való félelem (BFNE-II) ≥ 33',()=>val('bfne','total')>=33),S('scs','Önegyüttérzés ≤ 2,5',()=>val('scs','total')!==null&&val('scs','total')<=2.5),S('ysq','Csökkentértékűség/szégyen séma ≥ 4,5',()=>val('ysq','ds')>=4.5),S('obgy','Hibák kezelése ≤ 2,5',()=>val('obgy','HI')!==null&&val('obgy','HI')<=2.5)],
  text:'Ezek az eredmények együtt arra utalhatnak, hogy az önértékelésed most erősen függ attól, hogyan teljesítesz, és mit gondolnak rólad mások. Egy hiba vagy kritika ilyenkor nem egy helyzetről, hanem rólad szóló ítéletnek érződik.',
  q:'Mi az a mondat, amit egy hiba után a leggyakrabban mondasz magadnak?',
  action:'Válassz egy kis tétű helyzetet, ahol szándékosan nem tökéletesen csinálsz valamit (pl. elküldesz egy levelet háromszori átolvasás nélkül), és jegyezd fel, mi történt valójában. A változás itt a <b>tapasztalatból</b> jön, nem a meggyőzésből.'},
 {id:'depletion',title:'Kimerülés-közeli állapot',acc:'#e11d48',min:2,
  sig:[S('who5','WHO-5 jóllét ≤ 48',()=>val('who5','total')!==null&&val('who5','total')<=48),S('pss','PSS-10 ≥ 27',()=>val('pss','total')>=27),S('cbi','Személyes kiégés ≥ 50',()=>val('cbi','P')>=50),S('cbi','Munkához kötött kiégés ≥ 50',()=>val('cbi','W')>=50),S('brs','Reziliencia < 3,00',()=>val('brs','total')!==null&&val('brs','total')<3),S('phq9','PHQ-9 ≥ 10',()=>val('phq9','total')>=10)],
  text:'Ezek az eredmények együtt arra utalhatnak, hogy most többet adsz ki, mint amennyi visszatöltődik: a terhelés magas, a jóllét és a helyrejövés lassul. Ilyenkor a többi teszt eredménye is rosszabbnak látszhat, mint egy pihentebb időszakban.',
  q:'Mi az az egy dolog, amit a következő két hétben elhagyhatnál vagy átadhatnál?',
  action:'Most ne új szokást vegyél fel, hanem <b>terhet tegyél le</b>: egy vállalást, egy esti munkaórát, egy kötelességből tartott programot. Két hét múlva töltsd ki újra a WHO-5-öt. Ha a jóllét 28 alá esik, vagy hetek óta így van, beszélj róla orvossal vagy pszichológussal.'},
 {id:'disconnect',title:'Elszigeteltség és értelemhiány',acc:'#7c3aed',min:2,
  sig:[S('ucla','UCLA-3 magányosság ≥ 6',()=>val('ucla','total')>=6),S('mlq','Az értelem jelenléte ≤ 20',()=>val('mlq','P')!==null&&val('mlq','P')<=20),S('who5','WHO-5 jóllét ≤ 48',()=>val('who5','total')!==null&&val('who5','total')<=48),S('ecr','ECR-R elkerülés ≥ 4,5',()=>val('ecr','avd')>=4.5),S('phq9','PHQ-9 ≥ 10',()=>val('phq9','total')>=10)],
  text:'Ezek az eredmények arra utalhatnak, hogy most kevés olyan kapcsolódás van az életedben, amely megtart és értelmet ad. A kettő gyakran együtt jár: a jelentés nagy része a kapcsolatokból jön.',
  q:'Ki az az egy ember, akivel szívesen beszélnél, de régóta nem kerested?',
  action:'Ezen a héten keress meg <b>egy embert</b>, és beszélgess vele legalább fél órát, nem üzenetben. Írd le utána, mi változott a napodban.'}
];

function evalRules(){
  const fired=[],locked=[];
  RULES.forEach(r=>{
    const avail=r.sig.filter(s=>cur(s.test));
    const hits=avail.filter(s=>{TRACK=[];let h=false;try{h=!!s.fn()}catch(e){}s.used=TRACK;TRACK=null;return h});
    const hitTests=new Set(hits.map(s=>s.test)),availTests=new Set(avail.map(s=>s.test));
    if(hitTests.size>=r.min)fired.push({r,avail,hits,nT:hitTests.size,aT:availTests.size});
    else if(availTests.size<r.min)locked.push(r);
  });
  return {fired,locked};
}

/* Változás iránya skálánként: +1 = magasabb kedvezőbb, -1 = magasabb kedvezőtlenebb, 0 = semleges (alapértelmezett) */
const DIR={ecr:{anx:-1,avd:-1},kotodes:{anxiety:-1,avoidance:-1,earned:1},tas:'-',des:'-',ysq:'-',ips:'-',ders:'-',pedt:'-',maia2:'+',nsss:'+',
  smi:{happy:1,healthy:1,wise:1,vuln:-1,angry:-1,impulsive:-1,compliant:-1,detached:-1,soother:-1,grandiose:-1,bully:-1,punitive:-1,demanding:-1},
  gott:{maps:1,fond:1,turn:1,repair:1,strength:1,crit:-1,cont:-1,def:-1,stone:-1,risk:-1},
  scs:{total:1,SK:1,CH:1,MI:1,SJ:-1,IS:-1,OI:-1},bf:{N:-1},iief:'+',asrs:'-',phq9:'-',gad7:'-',rses:'+',gse:'+',bfne:'-',obgy:'+',who5:'+',pss:'-',cbi:'-',brs:'+',ucla:'-',mlq:{P:1,S:0},maas:'+'};
function dirOf(id,k){const d=DIR[id];if(!d)return 0;if(d==='+')return 1;if(d==='-')return -1;return d[k]||0;}
return {RULES:RULES,evalRules:evalRules,val:val,avgAll:avgAll,cur:cur,last:last,DIR:DIR,dirOf:dirOf};
};
