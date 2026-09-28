/* Önismereti térképek — egységes eredményfelépítés, tesztadatlapok, saját jegyzetek.
   Minden oldalon fut (defer). Adatok: assets/tests-data.js, eredmények: ONI (assets/oni-core.js). */
(function(){
  if(!window.ONI||!window.ONI_DATA)return;
  var D=window.ONI_DATA,L=window.ONI_LINK||{},NK='onismeret-notes-v1',SK='onismeret-settings-v1';
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  function jget(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
  function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  var page=document.documentElement.getAttribute('data-page');
  /* oldalanként: ONI-azonosító → panel és eredménykonténer */
  var MAP={};
  ['ecr','smi','tas','iief','pedt','sdi','des','ssss','nsss','saq','love','apo','imago','bf','via','las','tki','gott','fti','pvq','ft','kolbe','meq','ips','ders','scs','tfeq']
    .forEach(function(id){MAP[id]={panel:'#test-'+id,res:'#'+id+'-results'}});
  if(page==='maia2')MAP.maia2={panel:'body',res:'#results'};
  if(page==='sis-ses')MAP.sisses={panel:'body',res:'#results'};

  /* ── Tesztadatlap a kérdések fölött ── */
  function sheet(id){
    var d=D[id];if(!d)return '';
    return '<details class="oni-sheet"><summary><span>Tesztadatlap</span><em>'+esc(d.n)+' · kb. '+d.min+' perc</em></summary><dl>'+
      '<dt>Mit vizsgál</dt><dd>'+esc(d.what)+'</dd><dt>Kinek szól</dt><dd>'+esc(d.who)+'</dd><dt>Milyen időszakra kérdez</dt><dd>'+esc(d.period)+'</dd>'+
      '<dt>Időigény</dt><dd>kb. '+d.min+' perc</dd><dt>Változat</dt><dd>'+esc(d.ver)+'</dd><dt>Mire nem alkalmas</dt><dd>'+esc(d.notFor)+'</dd></dl></details>';
  }
  function insertSheets(){
    Object.keys(MAP).forEach(function(id){
      var panel=document.querySelector(MAP[id].panel);if(!panel||panel.querySelector('.oni-sheet'))return;
      var target=panel.querySelector('.progress-shell, .progress-wrap, .progress-bar-wrap')||(panel.querySelector('.q')&&panel.querySelector('.q').parentElement);
      if(!target||!target.parentElement)return;
      target.insertAdjacentHTML('beforebegin',sheet(id));
    });
  }

  /* ── Röviden-kártya + lenyitható részletes elemzés + jegyzetek ── */
  var FIT=[['fits','Ez illik rám'],['not','Ez nem jellemző rám'],['explore','Ezt szeretném megérteni']];
  var COND=[['calm','Nyugodt voltam'],['tired','Fáradt voltam'],['stress','Stresszes napom volt'],['rush','Siettem'],['interrupted','Megszakítva töltöttem ki']];
  function last(id){var h=ONI.all()[id];return h&&h.length?h[h.length-1]:null}
  function topDims(r){
    var e=Object.entries(r.d||{}).filter(function(x){return typeof x[1][1]==='number'});
    if(e.length>5)e=e.map(function(x){var d=x[1],n=(d[1]-d[2])/((d[3]-d[2])||1);return [x[0],d,n]}).sort(function(a,b){return b[2]-a[2]}).slice(0,4).map(function(x){return [x[0],x[1]]});
    return e.slice(0,5);
  }
  function brief(id,r){
    var d=D[id]||{},notes=jget(NK,{}),n=((notes[id]||{})[r.sid||'_'])||{fit:[],cond:[],text:''};
    var dims=topDims(r).map(function(x){var v=x[1];return '<span class="oni-dim"><b>'+esc(v[0])+'</b> '+v[1]+'<small> ('+v[2]+'–'+v[3]+')</small></span>'}).join('');
    var nx=d.next&&L[d.next[0]]?'<a href="'+L[d.next[0]]+'">'+esc(d.next[1])+' ›</a>':'<a href="osszegzes.html">Összegzés ›</a>';
    var chip=function(group,arr,sel){return arr.map(function(c){return '<button type="button" class="oni-chip'+(sel.indexOf(c[0])>-1?' on':'')+'" data-g="'+group+'" data-v="'+c[0]+'" aria-pressed="'+(sel.indexOf(c[0])>-1)+'">'+c[1]+'</button>'}).join('')};
    return '<section class="oni-brief" data-id="'+id+'" data-sid="'+esc(r.sid||'_')+'">'+
      '<div class="oni-eyebrow">Röviden</div>'+
      '<p class="oni-head">'+esc(r.h||d.n||'')+'</p>'+
      (dims?'<div class="oni-dims">'+dims+'</div>':'')+
      '<div class="oni-grid">'+
        '<div><h5>Értelmezési korlát</h5><p>'+esc(d.limit||'Önbevallásos kérdőív: tendenciát mutat, nem diagnózist.')+'</p></div>'+
        '<div><h5>Kérdés magadnak</h5><p class="oni-q">'+esc(d.q||'Mi az, ami ebből igaz rád, és mi nem?')+'</p></div>'+
        '<div><h5>Egy lehetséges következő lépés</h5><p>'+nx+'</p></div>'+
      '</div>'+
      '<div class="oni-notes"><h5>A saját tapasztalatod <small>(a pontszámot nem módosítja)</small></h5>'+
        '<div class="oni-chips">'+chip('fit',FIT,n.fit||[])+'</div>'+
        '<h5>Kitöltési körülmények <small>(nem kötelező)</small></h5><div class="oni-chips">'+chip('cond',COND,n.cond||[])+'</div>'+
        '<textarea rows="2" placeholder="Saját jegyzet: mi jutott eszedbe, mi lepett meg, mit kérdeznél meg valakitől?">'+esc(n.text||'')+'</textarea>'+
        '<span class="oni-saved" aria-live="polite"></span></div>'+
      '<button type="button" class="oni-more" aria-expanded="false">Részletes elemzés ▾</button>'+
    '</section>';
  }
  function saveNote(box){
    var id=box.getAttribute('data-id'),sid=box.getAttribute('data-sid'),all=jget(NK,{});
    var pick=function(g){return [].map.call(box.querySelectorAll('.oni-chip.on[data-g="'+g+'"]'),function(b){return b.getAttribute('data-v')})};
    all[id]=all[id]||{};all[id][sid]={fit:pick('fit'),cond:pick('cond'),text:box.querySelector('textarea').value.slice(0,4000),t:new Date().toISOString()};
    jset(NK,all);var s=box.querySelector('.oni-saved');s.textContent='Jegyzet mentve ✓';clearTimeout(s._t);s._t=setTimeout(function(){s.textContent=''},1600);
  }
  function enhance(id,tries){
    tries=tries||0;var m=MAP[id];if(!m)return;
    var res=document.querySelector(m.res),r=last(id);
    if(!res||!r||(!res.classList.contains('visible')&&getComputedStyle(res).display==='none')||!res.children.length){if(tries<20)setTimeout(function(){enhance(id,tries+1)},100);return;}
    var old=res.querySelector(':scope > .oni-brief');if(old)old.remove();
    var det=res.querySelector(':scope > details.oni-detail');
    if(!det){det=document.createElement('details');det.className='oni-detail';det.innerHTML='<summary>Részletes elemzés</summary>';
      while(res.firstChild)det.appendChild(res.firstChild);
      /* a summary maradjon az első */
      det.insertBefore(det.querySelector(':scope > summary'),det.firstChild);
      res.appendChild(det);}
    var st=jget(SK,{});det.open=!!st.detailOpen;
    res.insertAdjacentHTML('afterbegin',brief(id,r));
    var box=res.querySelector(':scope > .oni-brief'),more=box.querySelector('.oni-more');
    var sync=function(){more.textContent=det.open?'Részletes elemzés elrejtése ▴':'Részletes elemzés ▾';more.setAttribute('aria-expanded',det.open)};sync();
    more.onclick=function(){det.open=!det.open;var s=jget(SK,{});s.detailOpen=det.open;jset(SK,s);sync();if(det.open)det.scrollIntoView({behavior:'smooth',block:'start'})};
    det.addEventListener('toggle',sync);
    box.addEventListener('click',function(e){var c=e.target.closest('.oni-chip');if(!c)return;c.classList.toggle('on');c.setAttribute('aria-pressed',c.classList.contains('on'));
      if(c.getAttribute('data-g')==='fit'&&c.classList.contains('on')&&c.getAttribute('data-v')!=='explore')[].forEach.call(box.querySelectorAll('.oni-chip[data-g=fit]'),function(o){if(o!==c&&o.getAttribute('data-v')!=='explore'){o.classList.remove('on');o.setAttribute('aria-pressed','false')}});
      saveNote(box);});
    var ta=box.querySelector('textarea'),tm;ta.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){saveNote(box)},500)});
  }
  window.addEventListener('oni:saved',function(e){if(MAP[e.detail.id])setTimeout(function(){enhance(e.detail.id)},60)});
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details.oni-detail'),function(d){d.dataset.wasOpen=d.open;d.open=true})});
  window.addEventListener('afterprint',function(){[].forEach.call(document.querySelectorAll('details.oni-detail'),function(d){d.open=d.dataset.wasOpen==='true'})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insertSheets);else insertSheets();
  window.ONI_NOTES={get:function(){return jget(NK,{})},FIT:FIT,COND:COND};
})();
