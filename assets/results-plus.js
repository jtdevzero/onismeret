/* Önismereti térképek — egységes eredményfelépítés, tesztadatlapok, saját jegyzetek.
   Minden oldalon fut (defer). Adatok: assets/tests-data.js, eredmények: ONI (assets/oni-core.js). */
(function(){
  if(!window.ONI||!window.ONI_DATA)return;
  var D=window.ONI_DATA,L=window.ONI_LINK||{},NK='onismeret-notes-v1',SK='onismeret-settings-v1',CK='onismeret-commit-v1',UK='onismeret-unclear-v1';
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
  if(page==='ysq')MAP.ysq={panel:'#view-questionnaire',res:'#resultsContent'};
  if(page==='kotodes-melyterkep')MAP.kotodes={panel:'#view-test',res:'#result-body'};

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
  /* ── Diagramos összkép: minden dimenzió egy közös, 0–100%-os sávon, a saját skálája szerint ── */
  function chartHTML(r){
    var e=Object.entries(r.d||{}).filter(function(x){return typeof x[1][1]==='number'&&typeof x[1][2]==='number'&&typeof x[1][3]==='number'&&x[1][3]>x[1][2]});
    if(!e.length)return '';
    var total=e.length,more=0;
    if(e.length>12){e=e.slice().sort(function(a,b){return (b[1][1]-b[1][2])/(b[1][3]-b[1][2])-(a[1][1]-a[1][2])/(a[1][3]-a[1][2])});more=e.length-12;e=e.slice(0,12);}
    var rows=e.map(function(x){var d=x[1],lo=d[2],hi=d[3],v=Math.max(lo,Math.min(hi,d[1])),span=hi-lo,bar;
      if(lo<0&&hi>0){var z=(0-lo)/span*100,p=(v-lo)/span*100;bar='<span class="zero" style="left:'+z.toFixed(1)+'%"></span><i class="'+(v<0?'neg':'pos')+'" style="left:'+Math.min(z,p).toFixed(1)+'%;width:'+Math.abs(p-z).toFixed(1)+'%"></i>';}
      else bar='<i style="width:'+((v-lo)/span*100).toFixed(1)+'%"></i>';
      return '<div class="oc-row"><span class="oc-l">'+esc(d[0])+'</span><span class="oc-t" role="img" aria-label="'+esc(d[0])+': '+d[1]+' ('+lo+'–'+hi+' skálán)">'+bar+'</span><span class="oc-v">'+d[1]+'<small> / '+lo+'–'+hi+'</small></span></div>';}).join('');
    return '<figure class="oni-chart"><figcaption>Eredményprofil'+(more?' · a '+e.length+' legmagasabb a '+total+' skálából':'')+'</figcaption>'+rows+
      '<p class="oc-note">A sáv azt mutatja, hol áll az eredményed a skála saját tartományán belül'+(e.some(function(x){return x[1][2]<0})?'; a kétirányú skáláknál a függőleges vonal a nulla pont':'')+'. A skálák nem mind ugyanazt jelentik: a magas érték nem mindenhol jobb.</p></figure>';
  }
  window.ONI_CHART=chartHTML;
  function brief(id,r){
    var d=D[id]||{},notes=jget(NK,{}),n=((notes[id]||{})[r.sid||'_'])||{fit:[],cond:[],text:''};
    var dims=topDims(r).map(function(x){var v=x[1];return '<span class="oni-dim"><b>'+esc(v[0])+'</b> '+v[1]+'<small> ('+v[2]+'–'+v[3]+')</small></span>'}).join('');
    var nx=d.next&&L[d.next[0]]?'<a href="'+L[d.next[0]]+'">'+esc(d.next[1])+' ›</a>':'<a href="osszegzes.html">Összegzés ›</a>';
    var chip=function(group,arr,sel){return arr.map(function(c){return '<button type="button" class="oni-chip'+(sel.indexOf(c[0])>-1?' on':'')+'" data-g="'+group+'" data-v="'+c[0]+'" aria-pressed="'+(sel.indexOf(c[0])>-1)+'">'+c[1]+'</button>'}).join('')};
    return '<section class="oni-brief" data-id="'+id+'" data-sid="'+esc(r.sid||'_')+'">'+
      '<div class="oni-eyebrow">Röviden</div>'+
      '<p class="oni-head">'+esc(r.h||d.n||'')+'</p>'+
      (chartHTML(r)||(dims?'<div class="oni-dims">'+dims+'</div>':''))+
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
      commitHTML(id,r)+
      '<div class="oni-actions"><button type="button" class="oni-more" aria-expanded="false">Részletes elemzés ▾</button>'+
      '<button type="button" class="oni-ics" title="Letölthető naptárbejegyzés (.ics), bármelyik naptárba importálható">Újramérés a naptárba · '+retakeDays()+' nap múlva</button></div>'+
    '</section>';
  }
  /* ── Vállalás: egy kicsi, konkrét lépés; a következő kitöltésnél visszakérdez ── */
  var CST={done:'Sikerült',part:'Részben',no:'Nem sikerült'};
  function commits(){return jget(CK,{})}
  function openPrev(id,sid){var a=(commits()[id]||[]).filter(function(c){return c.sid!==sid&&!c.st&&c.text});return a[a.length-1]||null}
  function fmtD(t){return new Date(t).toLocaleDateString('hu-HU',{year:'numeric',month:'short',day:'numeric'})}
  function commitHTML(id,r){
    var sid=r.sid||'_',cur=(commits()[id]||[]).filter(function(c){return c.sid===sid})[0],pv=openPrev(id,sid);
    return '<div class="oni-commit">'+
      (pv?'<div class="oni-cprev" data-t="'+esc(pv.t)+'"><span>'+fmtD(pv.t)+' ezt vállaltad: <b>„'+esc(pv.text)+'”</b> Hogy sikerült?</span><span class="oni-chips">'+
        Object.keys(CST).map(function(k){return '<button type="button" class="oni-chip" data-cst="'+k+'">'+CST[k]+'</button>'}).join('')+'</span></div>':'')+
      '<h5>Egy vállalás a következő hetekre <small>(nem kötelező)</small></h5>'+
      '<div class="oni-crow"><input type="text" maxlength="200" aria-label="Vállalás" placeholder="Egy kicsi, konkrét lépés: mit csinálsz másképp a következő két hétben?" value="'+esc(cur?cur.text:'')+'">'+
      '<button type="button" class="oni-cbtn">'+(cur?'Módosítom':'Vállalom')+'</button></div><span class="oni-csaved" aria-live="polite"></span></div>';
  }
  function saveCommit(id,sid,text){
    var all=commits(),a=all[id]||[],i=-1;a.forEach(function(c,k){if(c.sid===sid)i=k});
    text=text.trim().slice(0,200);
    if(!text){if(i>-1)a.splice(i,1);}
    else if(i>-1){a[i].text=text;}
    else a.push({sid:sid,text:text,t:new Date().toISOString(),st:null});
    all[id]=a.slice(-12);if(!all[id].length)delete all[id];jset(CK,all);
  }
  function setCommitState(id,t,st){var all=commits();(all[id]||[]).forEach(function(c){if(c.t===t){c.st=st;c.at=new Date().toISOString()}});jset(CK,all);}
  /* ── Újramérési emlékeztető naptárfájlként ── */
  function retakeDays(){var st=jget(SK,{});return st.retake?st.retake:90}
  function icsEsc(x){return String(x).replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
  function fold(line){var out=[];while(line.length>60){out.push(line.slice(0,60));line=' '+line.slice(60)}out.push(line);return out.join('\r\n')}
  function icsFile(id){
    var d=D[id]||{},days=retakeDays(),at=new Date(Date.now()+days*864e5),end=new Date(at.getTime()+864e5);
    var ymd=function(x){return x.toISOString().slice(0,10).replace(/-/g,'')};
    var base=/^https?:/.test(location.protocol)?location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,''):'https://jtdevzero.github.io/onismeret/';
    var url=base+(L[id]||'index.html'),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    var body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Onismereti terkepek//HU','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
      'UID:'+id+'-'+Date.now()+'@onismeret','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+ymd(at),'DTEND;VALUE=DATE:'+ymd(end),
      'SUMMARY:'+icsEsc('Újramérés: '+(d.n||id)),
      'DESCRIPTION:'+icsEsc(days+' napja töltötted ki. Ha most újra kitöltöd, az összegzés megmutatja, mi változott. '+url),
      'URL:'+url,'TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc('Újramérés: '+(d.n||id)),'TRIGGER:PT9H','END:VALARM','END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/calendar;charset=utf-8'}));a.download='ujrameres-'+id+'.ics';document.body.appendChild(a);a.click();a.remove();
    return body;
  }
  window.ONI_ICS=icsFile;
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
    box.addEventListener('click',function(e){var c=e.target.closest('.oni-chip');if(!c||c.hasAttribute('data-cst'))return;c.classList.toggle('on');c.setAttribute('aria-pressed',c.classList.contains('on'));
      if(c.getAttribute('data-g')==='fit'&&c.classList.contains('on')&&c.getAttribute('data-v')!=='explore')[].forEach.call(box.querySelectorAll('.oni-chip[data-g=fit]'),function(o){if(o!==c&&o.getAttribute('data-v')!=='explore'){o.classList.remove('on');o.setAttribute('aria-pressed','false')}});
      saveNote(box);});
    var cb=box.querySelector('.oni-cbtn'),ci=box.querySelector('.oni-crow input'),cs=box.querySelector('.oni-csaved');
    var doCommit=function(){saveCommit(id,r.sid||'_',ci.value);cs.textContent=ci.value.trim()?'Vállalás mentve ✓ A főoldalon és a következő kitöltésnél emlékeztetlek rá.':'Vállalás törölve.';cb.textContent=ci.value.trim()?'Módosítom':'Vállalom'};
    cb.onclick=doCommit;ci.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doCommit()}});
    var pv=box.querySelector('.oni-cprev');if(pv)pv.addEventListener('click',function(e){var c=e.target.closest('[data-cst]');if(!c)return;e.stopPropagation();setCommitState(id,pv.getAttribute('data-t'),c.getAttribute('data-cst'));pv.innerHTML='<span>Köszönöm, rögzítve: <b>'+CST[c.getAttribute('data-cst')]+'</b>. Írhatsz új vállalást lent.</span>';});
    box.querySelector('.oni-ics').onclick=function(){icsFile(id)};
    var ta=box.querySelector('textarea'),tm;ta.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){saveNote(box)},500)});
  }
  window.addEventListener('oni:saved',function(e){if(MAP[e.detail.id])setTimeout(function(){enhance(e.detail.id)},60)});
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details.oni-detail'),function(d){d.dataset.wasOpen=d.open;d.open=true})});
  window.addEventListener('afterprint',function(){[].forEach.call(document.querySelectorAll('details.oni-detail'),function(d){d.open=d.dataset.wasOpen==='true'})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insertSheets);else insertSheets();
  /* ── Nyugodt zárás a megterhelőbb tesztek eredménye előtt ── */
  var CALM={des:1,smi:1,ysq:1};
  function calmHTML(){
    var seen=false;try{seen=sessionStorage.getItem('oni-calm')==='1'}catch(e){}
    return '<section class="oni-calm'+(seen?' min':'')+'" role="note"><div class="oni-eyebrow">Mielőtt tovább olvasol</div>'+
      '<div class="oni-calm-body"><p>Ez a kérdőív nehéz élményeket és érzéseket is érint. Az eredmény nem ítélet, és nem diagnózis. Ha kitöltés közben felkavart valami:</p><ol>'+
      '<li><b>Állj meg egy percre.</b> Érezd a talpad a padlón, lélegezz lassan, és nevezz meg magadban öt dolgot, amit most látsz.</li>'+
      '<li><b>Nem kell most mindent elolvasnod.</b> Az eredmény el van mentve, később is visszatérhetsz rá.</li>'+
      '<li><b>Ha beszélnél valakivel:</b> a Lelki Elsősegély Telefonszolgálat a <a href="tel:116123">116-123</a> számon a nap 24 órájában ingyenesen hívható. Ha közvetlen veszélyben vagy, hívd a <a href="tel:112">112</a>-t.</li></ol>'+
      '<p>Ha egy eredmény tartósan foglalkoztat, érdemes szakemberrel átbeszélni. Ehhez az <a href="osszegzes.html#rep-ui">összegzés terapeuta-összefoglalója</a> segít.</p>'+
      '<button type="button" class="oni-more oni-calm-ok">Rendben, mutasd az eredményt</button></div>'+
      '<p class="oni-calm-min">Ha felkavart valami: <a href="tel:116123">116-123</a> (ingyenes, 0–24) · <button type="button" class="oni-calm-open">Bővebben</button></p></section>';
  }
  function calm(res){
    if(!res||res.querySelector(':scope > .oni-calm'))return;
    res.insertAdjacentHTML('afterbegin',calmHTML());
    var c=res.querySelector(':scope > .oni-calm');
    c.querySelector('.oni-calm-ok').onclick=function(){c.classList.add('min');try{sessionStorage.setItem('oni-calm','1')}catch(e){}var n=c.nextElementSibling;if(n&&n.scrollIntoView)n.scrollIntoView({behavior:'smooth',block:'start'})};
    c.querySelector('.oni-calm-open').onclick=function(){c.classList.remove('min')};
  }
  window.addEventListener('oni:saved',function(e){
    var id=e.detail.id;if(!CALM[id])return;
    var tries=0;(function go(){var res=document.querySelector((MAP[id]||{}).res);
      /* a Röviden-kártya után kerüljön a legtetejére */
      if(res&&res.children.length&&res.querySelector(':scope > .oni-brief')){var old=res.querySelector(':scope > .oni-calm');if(old)old.remove();calm(res);return;}
      if(++tries<30)setTimeout(go,100);})();
  });

  /* ── „Nem értem ezt a kérdést” jelölés tételenként ── */
  var PAGEID={maia2:'maia2','sis-ses':'sisses'};
  function testOf(u){var p=u.closest('[id^="test-"]');if(p)return p.id.slice(5);return PAGEID[page]||null}
  function qText(u){var c=u.cloneNode(true);[].forEach.call(c.querySelectorAll('button,input,label,.oni-unclear'),function(x){x.remove()});return c.textContent.replace(/\s+/g,' ').trim().slice(0,240)}
  function flags(){
    var all=jget(UK,{});
    [].forEach.call(document.querySelectorAll('.q, .fc'),function(u){
      if(u.querySelector(':scope > .oni-unclear'))return;
      var b=u.querySelector('button[data-n]');if(!b||u.parentElement.closest('.q, .fc'))return;
      var id=testOf(u);if(!id)return;var n=b.getAttribute('data-n'),on=!!(all[id]&&all[id][n]);
      if(getComputedStyle(u).position==='static')u.style.position='relative';
      var f=document.createElement('button');f.type='button';f.className='oni-unclear'+(on?' on':'');f.setAttribute('data-t',id);f.setAttribute('data-q',n);
      f.setAttribute('aria-pressed',String(on));f.setAttribute('aria-label','Nem egyértelmű kérdés jelölése ('+n+'.)');
      f.title=on?'Megjelölted, hogy ez a kérdés nem egyértelmű. Kattints a visszavonáshoz.':'Nem egyértelmű ez a kérdés? Jelöld meg. A pontszámot nem befolyásolja.';
      f.textContent='?';var cs=getComputedStyle(u);if(parseFloat(cs.paddingTop)<14||parseFloat(cs.paddingRight)<14)f.classList.add('tight');u.appendChild(f);
    });
  }
  document.addEventListener('click',function(e){
    var f=e.target.closest&&e.target.closest('.oni-unclear');if(!f)return;e.preventDefault();e.stopPropagation();
    var id=f.getAttribute('data-t'),n=f.getAttribute('data-q'),all=jget(UK,{});all[id]=all[id]||{};
    if(all[id][n]){delete all[id][n];if(!Object.keys(all[id]).length)delete all[id];}
    else all[id][n]={t:new Date().toISOString(),q:qText(f.parentElement)};
    jset(UK,all);var on=!!(all[id]&&all[id][n]);f.classList.toggle('on',on);f.setAttribute('aria-pressed',String(on));
    f.title=on?'Megjelölted, hogy ez a kérdés nem egyértelmű. Kattints a visszavonáshoz.':'Nem egyértelmű ez a kérdés? Jelöld meg. A pontszámot nem befolyásolja.';
    if(window.ONI_TOAST)ONI_TOAST(on?'Megjelölve: nem egyértelmű kérdés. Az Adatok oldalon látod, és a mentésfájlba is bekerül.':'Jelölés visszavonva.');
  },true);
  var ft;function flagsSoon(){clearTimeout(ft);ft=setTimeout(flags,250)}
  function bootFlags(){flags();if(window.MutationObserver)new MutationObserver(flagsSoon).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootFlags);else bootFlags();

  window.ONI_NOTES={get:function(){return jget(NK,{})},FIT:FIT,COND:COND};
  window.ONI_COMMITS={get:commits,set:setCommitState,ST:CST};
})();
