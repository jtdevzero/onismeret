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
  /* Kérdéssor- (q) és pontozásverzió (s) tesztenként. Ha egy teszt tételei vagy pontozása változik, itt emeld. */
  var VERS={maia2:{q:2,s:2}};
  function save(id,rec,opts){
    try{
      opts=opts||{};
      var a=all(),h=a[id]||[],m=meta(),now=new Date().toISOString();
      var key=opts.key||IDKEY[id];
      m.ans=m.ans||{};
      if(key&&!m.ans[key]){m.ans[key]=now;try{localStorage.setItem(META,JSON.stringify(m))}catch(e){}}
      var v=VERS[id]||{};
      rec.qv=opts.qv||rec.qv||v.q||1; rec.sv=opts.sv||rec.sv||v.s||1;
      rec.done=(key&&m.ans[key])||now;   /* a kitöltés ideje = az utolsó válasz ideje */
      rec.t=now;                          /* a kiértékelés megnyitásának ideje */
      if(rec.d)Object.keys(rec.d).forEach(function(k){var x=rec.d[k];if(x&&typeof x[1]==='number')x[1]=r(x[1]);});
      var prev=h[h.length-1];
      if(prev&&prev.done===rec.done){
        /* Ugyanaz a kitöltés, csak újranyitva: nem új mérés, a dátum marad. Ha közben a pontozás verziója változott, újraszámolt eredmény. */
        if((prev.sv||1)!==rec.sv||(prev.qv||1)!==rec.qv){rec.sid=prev.sid;rec.rescored=true;h[h.length-1]=rec;}
        else{rec=prev;}
      } else if(prev&&prev.done&&prev.done.slice(0,10)===rec.done.slice(0,10)&&(prev.sv||1)===rec.sv&&(prev.qv||1)===rec.qv){
        /* Ugyanazon a napon módosított válaszok: javításként kezeljük, nem új mérésként. */
        rec.sid=prev.sid;rec.corrected=true;h[h.length-1]=rec;
      } else {
        rec.sid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
        h.push(rec);
      }
      a[id]=h.slice(-24);
      localStorage.setItem(K,JSON.stringify(a));
    }catch(e){}
    try{window.dispatchEvent(new CustomEvent('oni:saved',{detail:{id:id}}));}catch(e){}
  }
  function pathState(){var a=all();return PATH.map(function(p){return {id:p.id,n:p.n,href:p.href,min:p.min,why:p.why,done:!!(a[p.id]&&a[p.id].length)}});}
  function banner(savedId){
    var st=pathState(),inPath=st.some(function(p){return p.id===savedId});
    if(!inPath)return;
    var done=st.filter(function(p){return p.done}).length,next=st.filter(function(p){return !p.done})[0];
    var old=document.getElementById('oni-path-banner');if(old)old.remove();
    var el=document.createElement('div');el.id='oni-path-banner';
    el.setAttribute('style','position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;max-width:calc(100% - 24px);width:560px;display:flex;align-items:center;gap:14px;padding:14px 16px 14px 20px;border-radius:16px;background:rgba(10,20,40,.94);color:#e6ecf5;border:1px solid rgba(251,191,36,.55);box-shadow:0 12px 40px rgba(0,0,0,.45);font:500 14px/1.4 Manrope,Inter,system-ui,sans-serif;backdrop-filter:blur(10px)');
    var dots=st.map(function(p){return '<span style="width:9px;height:9px;border-radius:50%;display:inline-block;background:'+(p.done?'#fbbf24':'rgba(148,163,184,.35)')+'"></span>'}).join('');
    var body=next
      ? '<div style="flex:1;min-width:0"><div style="font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#fbbf24;font-weight:700;display:flex;gap:6px;align-items:center">Kezdő útvonal · '+done+'/5 '+dots+'</div><div style="margin-top:3px">Következő: <strong>'+next.n+'</strong> <span style="color:#a3b3c8">(~'+next.min+' perc)</span></div></div><a href="'+next.href+'" style="flex:none;padding:10px 16px;border-radius:99px;background:#fbbf24;color:#0a1428;text-decoration:none;font-weight:700">Tovább ›</a>'
      : '<div style="flex:1;min-width:0"><div style="font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#34d399;font-weight:700">Kezdő útvonal kész · 5/5</div><div style="margin-top:3px">Most már az összegzés valódi adatokból dolgozik.</div></div><a href="osszegzes.html" style="flex:none;padding:10px 16px;border-radius:99px;background:#34d399;color:#0a1428;text-decoration:none;font-weight:700">Összegzés ›</a>';
    el.innerHTML=body+'<button type="button" aria-label="Bezár" style="flex:none;background:none;border:none;color:#6b7c94;font-size:20px;cursor:pointer;padding:0 2px">×</button>';
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
        if(this===window.localStorage&&/-responses-v\d+$|^ysq_autosave$|^attachment_assessment_v1$/.test(k)){
          try{var m=JSON.parse(localStorage.getItem(META))||{};m.ans=m.ans||{};m.ans[k]=new Date().toISOString();orig.call(this,META,JSON.stringify(m));}catch(x){}
          var now=Date.now();if(now-lastToast>6000){lastToast=now;toast('Mentve ezen az eszközön ✓');}
        }
      };
    }catch(e){}
    function toast(t,bad){
      if(!document.body)return;
      var el=document.getElementById('oni-toast');if(!el){el=document.createElement('div');el.id='oni-toast';document.body.appendChild(el);}
      el.setAttribute('style','position:fixed;right:16px;top:16px;z-index:10000;max-width:320px;padding:9px 14px;border-radius:12px;font:500 12.5px/1.4 Manrope,Inter,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:opacity .4s;opacity:1;'+(bad?'background:#4c0519;color:#fecdd3;border:1px solid #fb7185':'background:rgba(6,40,30,.92);color:#a7f3d0;border:1px solid rgba(52,211,153,.5)'));
      el.textContent=t;clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity='0'},bad?9000:1800);
    }
    window.ONI_TOAST=toast;
  })();

  /* ── Kitöltés-segéd: folytatás az első megválaszolatlannál + fókusz mód ── */
  (function(){
    var focus=false,cur=0,units=[],bar=null,pill=null,auto=true;
    try{var _st=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{};if(_st.autoAdvance===false)auto=false;}catch(e){}
    function scope(){return document.querySelector('.test-panel.active')||document.body;}
    function scan(){
      units=[].slice.call(scope().querySelectorAll('.q, .fc')).filter(function(u){return u.querySelector('button[data-n]')&&!u.parentElement.closest('.q, .fc');});
      units.forEach(function(u){u.classList.add('oni-unit')});
      return units.length>=5;
    }
    function answered(u){var g={};[].forEach.call(u.querySelectorAll('button[data-n]'),function(b){var n=b.getAttribute('data-n');g[n]=g[n]||b.classList.contains('selected')||b.classList.contains('active')||b.getAttribute('aria-checked')==='true';});return Object.keys(g).every(function(k){return g[k]});}
    function showBtn(){return scope().querySelector('button[id$=showResults], button[id$=-show], #showResults');}
    function firstOpen(){for(var i=0;i<units.length;i++)if(!answered(units[i]))return i;return -1;}
    function css(){
      if(document.getElementById('oni-fill-css'))return;
      var st=document.createElement('style');st.id='oni-fill-css';
      st.textContent='body.oni-focus::before,body.oni-focus::after{opacity:.15!important}body.oni-focus .hub-header,body.oni-focus .test-panel.active header,body.oni-focus .hub-tabs,body.oni-focus .progress-shell{display:none!important}body.oni-focus .oni-unit:not(.oni-cur){display:none!important}body.oni-focus .test-panel.active .section-head,body.oni-focus .test-panel.active .intro-box{display:none}'+
      'body.oni-focus .oni-unit.oni-cur{margin-top:18vh;transform:scale(1.02);box-shadow:0 0 0 2px rgba(251,191,36,.55),0 16px 48px rgba(0,0,0,.35)}'+
      '.oni-unit.oni-flash{animation:oniFlash 1.6s ease}@keyframes oniFlash{0%,60%{box-shadow:0 0 0 3px rgba(251,191,36,.8)}100%{box-shadow:none}}'+
      '.oni-btn{white-space:nowrap;appearance:none;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(10,20,40,.92);color:#e6ecf5;font:600 12.5px/1 Manrope,Inter,system-ui,sans-serif;padding:10px 14px;border-radius:99px;backdrop-filter:blur(8px)}'+
      '.oni-btn:hover{border-color:#fbbf24}.oni-btn.pri{background:#fbbf24;color:#0a1428;border-color:#fbbf24}'+
      '@media (max-width:480px){#oni-focusbar .oni-btn{padding:9px 11px;font-size:12px}#oni-pos{font-size:11.5px!important;padding:0 2px!important}}@media print{#oni-pill,#oni-focusbar,#oni-toast{display:none!important}}';
      document.head.appendChild(st);
    }
    function mkPill(){
      if(!pill){pill=document.createElement('div');pill.id='oni-pill';pill.setAttribute('style','position:fixed;left:14px;bottom:14px;z-index:9998;display:flex;gap:8px;flex-wrap:wrap;max-width:calc(100% - 28px)');document.body.appendChild(pill);}
      if(focus||!scan()){pill.style.display='none';return;}
      var i=firstOpen(),n=units.length,done=units.filter(answered).length;
      pill.style.display='flex';
      var sb=showBtn(),resVisible=!!scope().querySelector('.results.visible, .results[style*="block"], #results.visible, .results-wrap.visible');
      pill.innerHTML=(i>=0&&done>0?'<button class="oni-btn pri" id="oni-cont">Folytatás: '+(i+1)+'. kérdés ›</button>':'')
        +(i>=0&&done>0?'<span class="oni-btn" style="cursor:default;opacity:.85">'+(n-done)+' kérdés hiányzik</span>':'')
        +(i>=0?'<button class="oni-btn" id="oni-focus-on" title="Egyszerre egy kérdés, billentyűzettel is (1–9, ←/→)">Fókusz mód</button>':'')
        +(i<0&&sb&&!sb.disabled&&!resVisible?'<button class="oni-btn pri" id="oni-res">Minden kérdés megvan · Eredmény megtekintése ›</button>':'');
      var rb=document.getElementById('oni-res');if(rb)rb.onclick=function(){sb.click();setTimeout(mkPill,400)};
      var c=document.getElementById('oni-cont');if(c)c.onclick=function(){go(firstOpen(),true)};
      var f=document.getElementById('oni-focus-on');if(f)f.onclick=function(){enter()};
    }
    function go(i,flash){if(i<0||!units[i])return;units[i].scrollIntoView({behavior:'smooth',block:'center'});if(flash){units[i].classList.remove('oni-flash');void units[i].offsetWidth;units[i].classList.add('oni-flash');}}
    function show(i){
      cur=Math.max(0,Math.min(units.length-1,i));
      units.forEach(function(u,k){u.classList.toggle('oni-cur',k===cur)});
      if(bar){var d=units.filter(answered).length;bar.querySelector('#oni-pos').textContent=(cur+1)+' / '+units.length+(d<units.length?' · '+(units.length-d)+' hiányzik':' · kész');}
      window.scrollTo({top:units[cur].getBoundingClientRect().top+window.scrollY-window.innerHeight*0.18,behavior:'smooth'});
    }
    function enter(){
      if(!scan())return;focus=true;document.body.classList.add('oni-focus');
      bar=document.createElement('div');bar.id='oni-focusbar';
      bar.setAttribute('style','position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9999;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center;padding:7px;max-width:calc(100% - 16px);width:max-content;border-radius:22px;background:rgba(10,20,40,.94);border:1px solid rgba(251,191,36,.45);box-shadow:0 12px 40px rgba(0,0,0,.45)');
      bar.innerHTML='<label class="oni-btn" style="display:flex;gap:6px;align-items:center" title="Válasz után automatikusan a következő kérdésre lép"><input type="checkbox" id="oni-auto" '+(auto?'checked':'')+'> auto</label><button class="oni-btn" id="oni-prev" aria-label="Előző kérdés">‹ Előző</button><span id="oni-pos" style="color:#cbd5e1;font:600 12.5px Manrope,Inter,sans-serif;padding:0 8px;white-space:nowrap"></span><button class="oni-btn pri" id="oni-next" aria-label="Következő kérdés">Tovább ›</button><button class="oni-btn" id="oni-exit" title="Vissza a listanézethez">Lista</button>';
      document.body.appendChild(bar);
      bar.querySelector('#oni-auto').onchange=function(e){auto=e.target.checked;try{var st=JSON.parse(localStorage.getItem('onismeret-settings-v1'))||{};st.autoAdvance=auto;localStorage.setItem('onismeret-settings-v1',JSON.stringify(st))}catch(x){}};
      bar.querySelector('#oni-prev').onclick=function(){show(cur-1)};
      bar.querySelector('#oni-next').onclick=function(){next()};
      bar.querySelector('#oni-exit').onclick=function(){exit()};
      mkPill();var i=firstOpen();show(i<0?0:i);
    }
    function exit(scrollToEnd){
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
      else if(/^[1-9]$/.test(e.key)){
        var u=units[cur];if(!u)return;var btns=[].slice.call(u.querySelectorAll('button[data-n]'));
        var groups={};btns.forEach(function(b){var n=b.getAttribute('data-n');(groups[n]=groups[n]||[]).push(b)});
        var g=Object.keys(groups).map(function(k){return groups[k]}).filter(function(x){return !x.some(function(b){return b.classList.contains('selected')})})[0]||groups[Object.keys(groups)[0]];
        var b=g[+e.key-1];if(b){e.preventDefault();b.click();}
      }
    });
    function boot(){css();setTimeout(mkPill,600);}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
    window.addEventListener('hashchange',function(){if(focus)exit();setTimeout(mkPill,300)});
    document.addEventListener('click',function(e){if(!e.target.closest)return;if(e.target.closest('.hub-tab')){if(focus)exit();setTimeout(mkPill,300);}else if(e.target.closest('button[id$=showResults], button[id$=-show], #showResults, #oni-res')){setTimeout(mkPill,600);}});
  })();

  window.addEventListener('oni:saved',function(e){setTimeout(function(){banner(e.detail.id)},900);});
  return {K:K,META:META,IDKEY:IDKEY,VERS:VERS,all:all,save:save,r:r,PATH:PATH,pathState:pathState};
})();
