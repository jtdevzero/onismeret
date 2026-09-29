/* ONI-CORE v5 — közös eredménytár + kezdő útvonal. Minden adat csak ebben a böngészőben marad. */
/* Téma: világos (alap) vagy sötét; azonnal beállítva, hogy ne villanjon. */
(function(){
  var d=document.documentElement,st={};
  try{st=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{}}catch(e){}
  d.setAttribute('data-theme',st.theme==='dark'?'dark':'light');
  var pg=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  d.setAttribute('data-page',pg);
  function btn(){
    if(document.getElementById('oni-theme'))return;
    var b=document.createElement('button');b.id='oni-theme';b.type='button';
    function lbl(){var dark=d.getAttribute('data-theme')==='dark';b.innerHTML=dark?'<span class="ic" aria-hidden="true">☀</span>Világos mód':'<span class="ic" aria-hidden="true">☾</span>Sötét mód';b.setAttribute('aria-label',dark?'Váltás világos témára':'Váltás sötét témára');b.title=b.getAttribute('aria-label');}
    lbl();
    b.onclick=function(){var t=d.getAttribute('data-theme')==='dark'?'light':'dark';d.setAttribute('data-theme',t);lbl();
      try{var s=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{};s.theme=t;localStorage.setItem('onismeret-settings-v1',JSON.stringify(s))}catch(e){}};
    document.body.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',btn);else btn();
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
  var IDKEY={maia2:'maia2-responses-v2',tas:'tas-20-responses-v1',des:'des-2-responses-v1',ecr:'ecr-r-responses-v1',kotodes:'attachment_assessment_v1',ysq:'ysq_autosave',smi:'smi-responses-v1',ssss:'ssss-responses-v1',sisses:'sis-ses-responses-v1',iief:'iief-responses-v1',pedt:'pedt-responses-v1',sdi:'sdi-2-responses-v1',nsss:'nsss-responses-v1',saq:'saq-responses-v1',love:'love-responses-v1',apo:'apo-responses-v1',imago:'imago-responses-v1',bf:'bf-responses-v1',via:'via-responses-v1',las:'las-responses-v1',tki:'conflict-responses-v1',gott:'gottman-responses-v1',fti:'fisher-responses-v1',pvq:'pvq21-responses-v1',ft:'four-tendencies-responses-v1',kolbe:'action-modes-responses-v1',meq:'meq-responses-v1',ips:'ips-responses-v1',ders:'ders-sf-responses-v1',scs:'scs-sf-responses-v1',tfeq:'tfeq-r18-responses-v1'};
  function meta(){try{return JSON.parse(localStorage.getItem(META))||{}}catch(e){return {}}}
  /* Kérdéssor- (q), pontozás- (s) és fordításverzió (t) tesztenként. Ha egy teszt tételei, pontozása vagy
     magyar szövege változik, itt emeld a megfelelő számot. Eltérő változatú eredményeket nem hasonlítunk össze. */
  /* minden teszt verziója explicit; új teszt felvételekor ide is be kell írni (a tesztcsomag ellenőrzi) */
  var VERS={maia2:{q:2,s:2,t:1},tas:{q:1,s:1,t:1},des:{q:1,s:1,t:1},ecr:{q:1,s:1,t:1},kotodes:{q:1,s:1,t:1},ysq:{q:1,s:1,t:1},smi:{q:1,s:1,t:1},ssss:{q:1,s:1,t:1},sisses:{q:1,s:1,t:1},iief:{q:1,s:1,t:1},pedt:{q:1,s:1,t:1},sdi:{q:1,s:1,t:1},nsss:{q:1,s:1,t:1},saq:{q:1,s:1,t:1},love:{q:1,s:1,t:1},apo:{q:1,s:1,t:1},imago:{q:1,s:1,t:1},bf:{q:1,s:1,t:1},via:{q:1,s:1,t:1},las:{q:1,s:1,t:1},tki:{q:1,s:1,t:1},gott:{q:1,s:1,t:1},fti:{q:1,s:1,t:1},pvq:{q:1,s:1,t:1},ft:{q:1,s:1,t:1},kolbe:{q:1,s:1,t:1},meq:{q:1,s:1,t:1},ips:{q:1,s:1,t:1},ders:{q:1,s:1,t:1},scs:{q:1,s:1,t:1},tfeq:{q:1,s:1,t:1}};
  function vOf(id){var v=VERS[id]||{};return {q:v.q||1,s:v.s||1,t:v.t||1}}
  /* két eredmény összevethető-e (azonos kérdéssor, pontozás és fordítás) */
  function same(a,b){return !!a&&!!b&&(a.qv||1)===(b.qv||1)&&(a.sv||1)===(b.sv||1)&&(a.tv||1)===(b.tv||1)}
  /* a rekord a teszt jelenlegi változatával készült-e */
  function isCur(id,r){var v=vOf(id);return !!r&&(r.qv||1)===v.q&&(r.sv||1)===v.s&&(r.tv||1)===v.t}
  function verText(r){return 'kérdéssor v'+(r.qv||1)+' · pontozás v'+(r.sv||1)+' · fordítás v'+(r.tv||1)}
  /* „Új kitöltés” jelzése: ha egy teszt válaszai kiürülnek vagy megfogyatkoznak (törlés, újrakezdés),
     a következő mentett eredmény biztosan új mérés lesz, akkor is, ha ugyanazon a napon ugyanaz a pontszám jön ki. */
  function markFresh(key){try{var m=meta();m.fresh=m.fresh||{};m.fresh[key]=new Date().toISOString();localStorage.setItem(META,JSON.stringify(m))}catch(e){}}
  function save(id,rec,opts){
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
    document.body.appendChild(el);
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
      var el=document.getElementById('oni-toast');if(!el){el=document.createElement('div');el.id='oni-toast';document.body.appendChild(el);}
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
      if(!pill){pill=document.createElement('div');pill.id='oni-pill';pill.setAttribute('style','position:fixed;left:14px;bottom:14px;z-index:9998;display:flex;gap:8px;flex-wrap:wrap;max-width:calc(100% - 28px)');document.body.appendChild(pill);}
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
      document.body.appendChild(el);if(anchor)anchor.setAttribute('aria-expanded','true');
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
      document.body.appendChild(bar);
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
  return {K:K,LIMIT:LIMIT,META:META,IDKEY:IDKEY,VERS:VERS,vOf:vOf,same:same,isCur:isCur,verText:verText,markFresh:markFresh,remindCfg:remindCfg,setRemind:setRemind,due:due,all:all,save:save,r:r,PATH:PATH,pathState:pathState};
})();
