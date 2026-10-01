/* Önismereti térképek — egységes eredményfelépítés, tesztadatlapok, saját jegyzetek.
   Minden oldalon fut (defer). Adatok: assets/tests-data.js, eredmények: ONI (assets/oni-core.js). */
(function(){
  if(!window.ONI||!window.ONI_DATA)return;
  var D=window.ONI_DATA,L=window.ONI_LINK||{},NK='onismeret-notes-v1',SK='onismeret-settings-v1',CK='onismeret-commit-v1',UK='onismeret-unclear-v1';
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  function jget(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
  function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v));return localStorage.getItem(k)===JSON.stringify(v)}catch(e){return false}}
  var page=document.documentElement.getAttribute('data-page');
  /* oldalanként: ONI-azonosító → panel és eredménykonténer */
  var MAP={};
  ['ecr','smi','tas','iief','pedt','sdi','des','ssss','nsss','saq','love','apo','imago','bf','via','las','tki','gott','fti','pvq','ft','kolbe','meq','ips','ders','scs','tfeq','asrs','phq9','gad7']
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

  /* ── Vizuális áttekintés: profilalak, kiugró skálák, válaszstílus, változás ── */
  function numDims(r){return Object.entries(r.d||{}).filter(function(x){var d=x[1];return typeof d[1]==='number'&&typeof d[2]==='number'&&typeof d[3]==='number'&&d[3]>d[2]}).map(function(x){var d=x[1];return {k:x[0],l:d[0],v:d[1],lo:d[2],hi:d[3],p:Math.max(0,Math.min(1,(d[1]-d[2])/(d[3]-d[2])))}})}
  function short(t,n){t=String(t);return t.length>n?t.slice(0,n-1).trim()+'…':t}
  function radar(ds){
    var n=ds.length,S=320,c=S/2,R=112,pt=function(i,f){var a=-Math.PI/2+i*2*Math.PI/n;return [c+Math.cos(a)*R*f,c+Math.sin(a)*R*f]};
    var g='';[.25,.5,.75,1].forEach(function(f){g+='<polygon class="rg" points="'+ds.map(function(_,i){return pt(i,f).join(',')}).join(' ')+'"/>'});
    ds.forEach(function(_,i){var e=pt(i,1);g+='<line class="rg" x1="'+c+'" y1="'+c+'" x2="'+e[0]+'" y2="'+e[1]+'"/>'});
    g+='<polygon class="rp" points="'+ds.map(function(d,i){return pt(i,Math.max(.03,d.p)).join(',')}).join(' ')+'"/>';
    ds.forEach(function(d,i){var q=pt(i,Math.max(.03,d.p));g+='<circle class="rd" cx="'+q[0]+'" cy="'+q[1]+'" r="4"><title>'+esc(d.l)+': '+d.v+' ('+d.lo+'–'+d.hi+')</title></circle>';
      var L=pt(i,1.17),anc=Math.abs(L[0]-c)<8?'middle':L[0]>c?'start':'end';g+='<text class="rl" x="'+L[0]+'" y="'+(L[1]+4)+'" text-anchor="'+anc+'">'+esc(short(d.l,n>8?14:20))+'</text>'});
    return '<svg viewBox="-70 -10 460 340" role="img" aria-label="Profilalak: '+ds.map(function(d){return esc(d.l)+' '+Math.round(d.p*100)+'%'}).join(', ')+'">'+g+'</svg>';
  }
  /* Válaszstílus: a kérdőív saját válaszskálája alapján (assets/oni-schema.js), nem a kitöltő válaszaiból kitalálva.
     Eltérő skálájú kérdéseket nem öntünk össze: a diagram a leggyakoribb skálát mutatja, a többit megnevezi. */
  function styleHTML(id){
    var C=window.ONI_CHECK;if(!C)return '';
    var key=(ONI.IDKEY||{})[id];if(!key)return '';var j;try{j=JSON.parse(localStorage.getItem(key))}catch(e){return ''}
    var a=C.answersOf(id,j),sc=C.scales(id);if(!a||!sc.length)return '';
    var main=sc[0],bins=main.vals,vals=main.qs.map(function(q){return a[q]}).filter(function(v){return typeof v==='number'&&bins.indexOf(v)>-1});
    if(vals.length<8||bins.length<3||bins.length>11)return '';
    var cnt={},n=vals.length;bins.forEach(function(b){cnt[b]=0});vals.forEach(function(v){cnt[v]++});
    var mx=Math.max.apply(null,bins.map(function(b){return cnt[b]}))||1,lo=bins[0],hi=bins[bins.length-1];
    var ext=(cnt[lo]+cnt[hi])/n,midIdx=bins.length%2?[(bins.length-1)/2]:[bins.length/2-1,bins.length/2],mids=midIdx.reduce(function(s,i){return s+cnt[bins[i]]},0)/n;
    var bars=bins.map(function(k){return '<div class="hb"><span class="hbv">'+cnt[k]+'</span><i style="height:'+Math.round(cnt[k]/mx*100)+'%"></i><span class="hbk">'+k+'</span></div>'}).join('');
    var top=mx/n,used=bins.filter(function(k){return cnt[k]>0}).length;
    var txt=top>=.6?'A válaszaid '+Math.round(top*100)+'%-a ugyanaz az érték volt. Ha ez tényleg így igaz rád, rendben van; ha fáradtan vagy sietve töltötted ki, az eredményt érdemes óvatosan kezelni, és később újra kitölteni.'
      :ext>=.5?'A válaszaid '+Math.round(ext*100)+'%-a a skála két szélén van. Határozott válaszstílus: az eredményed kontrasztosabb lehet, mint amilyen a hétköznapokban vagy.'
      :mids>=.4?'A válaszaid '+Math.round(mids*100)+'%-a a skála közepén van. Óvatos, középre húzó válaszstílus: a skálák közti különbségek tompábbak lehetnek a valóságosnál.'
      :used<=2?'Csak '+used+' különböző értéket használtál. A skála árnyaltabb használata pontosabb képet adna.'
      :'A válaszaid a skála nagy részét használják, nem húznak erősen se a szélekre, se a közepére. Ez jó alap az értelmezéshez.';
    var other=sc.slice(1).reduce(function(s,x){return s+x.n},0);
    var note='A diagram '+n+' kérdés válaszát mutatja a kérdőív '+lo+'–'+hi+' válaszskáláján.'+(other?' A teszt további '+other+' kérdése más válaszskálát használ, ezért az nincs benne.':'');
    return '<div class="od-panel"><h6>Válaszstílus</h6><div class="hist" role="img" aria-label="Válaszok eloszlása a '+lo+'–'+hi+' skálán: '+bins.map(function(k){return k+': '+cnt[k]}).join(', ')+'">'+bars+'</div><p>'+txt+'</p><p class="oc-note">'+note+'</p></div>';
  }
  function deepHTML(id,r){
    var ds=numDims(r);if(!ds.length)return '';
    if(ds.length>2)ds=ds.filter(function(d){return !/^(total|strength|risk)$/.test(d.k)&&!/^ho_/.test(d.k)})||ds;
    var panels='';
    var rd=ds.length>12?ds.slice().sort(function(a,b){return b.p-a.p}).slice(0,12):ds;
    if(rd.length>=3)panels+='<div class="od-panel od-radar"><h6>Profilalak'+(ds.length>12?' · a 12 legmagasabb skála':'')+'</h6>'+radar(rd)+'<p>Minden tengely a saját skálája szerint 0–100%. A forma azt mutatja, merre húz a profilod, nem azt, hogy jó vagy rossz.</p></div>';
    var spread=ds.length>=3?Math.max.apply(null,ds.map(function(d){return d.p}))-Math.min.apply(null,ds.map(function(d){return d.p})):1;
    if(ds.length>=3&&spread<.06)panels+='<div class="od-panel"><h6>Kiugró skálák</h6><p style="margin-top:0">Minden skálád közel azonos szinten van (a különbség a tartomány '+Math.round(spread*100)+'%-a). Ilyenkor nincs kiemelkedő vagy visszafogott terület; a profil egyenletes.</p></div>';
    else if(ds.length>=3){var srt=ds.slice().sort(function(a,b){return b.p-a.p}),top=srt.slice(0,Math.min(3,Math.ceil(ds.length/2))),bot=srt.slice(-Math.min(3,Math.floor(ds.length/2))).reverse();
      var row=function(d,cls){return '<li><span>'+esc(d.l)+'</span><b class="'+cls+'">'+Math.round(d.p*100)+'%</b><i><u class="'+cls+'" style="width:'+Math.round(d.p*100)+'%"></u></i></li>'};
      panels+='<div class="od-panel"><h6>Leginkább jellemző</h6><ul class="od-list">'+top.map(function(d){return row(d,'hi')}).join('')+'</ul><h6 style="margin-top:14px">Legkevésbé jellemző</h6><ul class="od-list">'+bot.map(function(d){return row(d,'lo')}).join('')+'</ul>'+
        '<p>A százalék azt jelzi, hol áll az eredményed a skála saját tartományán belül. Egy fordított irányú skálán (például nehézségek, kockázatok) a magas érték nem erősség.</p></div>';}
    else panels+='<div class="od-panel"><h6>Hol állsz a skálán</h6><ul class="od-list">'+ds.map(function(d){return '<li><span>'+esc(d.l)+'</span><b class="hi">'+d.v+'</b><i><u class="hi" style="width:'+Math.round(d.p*100)+'%"></u></i></li>'}).join('')+'</ul><p>'+ds.map(function(d){return esc(d.l)+': '+d.v+' a '+d.lo+'–'+d.hi+' skálán, ez a tartomány '+Math.round(d.p*100)+'%-a.'}).join(' ')+'</p></div>';
    panels+=styleHTML(id);
    var h=(ONI.all()[id]||[]).filter(function(e){return e!==r&&e.sid!==r.sid&&ONI.same(e,r)&&e.d});
    if(h.length){var pv=h[h.length-1],ch=ds.map(function(d){var o=pv.d[d.k];return o&&typeof o[1]==='number'?{l:d.l,a:o[1],b:d.v,dp:(d.v-o[1])/(d.hi-d.lo)}:null}).filter(Boolean).sort(function(a,b){return Math.abs(b.dp)-Math.abs(a.dp)}).slice(0,6);
      if(ch.length)panels+='<div class="od-panel"><h6>Változás az előző kitöltés óta · '+new Date(pv.done||pv.t).toLocaleDateString('hu-HU',{year:'numeric',month:'short',day:'numeric'})+'</h6><ul class="od-chg">'+ch.map(function(c){var d=c.b-c.a;return '<li><span>'+esc(c.l)+'</span><b>'+c.a+' → '+c.b+'</b><em class="'+(Math.abs(c.dp)<.05?'eq':d>0?'up':'dn')+'">'+(Math.abs(c.dp)<.05?'≈':d>0?'▲':'▼')+' '+Math.abs(Math.round(c.dp*100))+'%</em></li>'}).join('')+'</ul><p>A százalék a skála teljes tartományához viszonyított elmozdulás. A ≈ jel 5% alatti elmozdulást jelöl: ez csak megjelenítési határ, nem statisztikai küszöb. Hogy egy változás valódi-e, az a teszt megbízhatóságától és a kitöltés körülményeitől is függ.</p></div>';}
    return '<section class="oni-deep"><div class="oni-eyebrow">Vizuális áttekintés</div>'+chartHTML(r)+'<div class="od-grid">'+panels+'</div></section>';
  }
  window.ONI_DEEP=deepHTML;
  /* ── Röviden: néhány mondat és a fő eredmények. A diagram a vizuális áttekintésbe, a jegyzetek a végére kerülnek. ── */
  function az(w){return /^[aáeéiíoóöőuúüű]/i.test(String(w))?'az':'a'}
  function sumText(r){
    var ds=numDims(r);if(ds.length>2){var f=ds.filter(function(d){return !/^(total|strength|risk)$/.test(d.k)&&!/^ho_/.test(d.k)});if(f.length)ds=f;}
    if(!ds.length)return '';
    var v=function(d){return '<b>'+esc(d.l)+'</b> ('+d.v+', '+d.lo+'–'+d.hi+')'};
    if(ds.length<=2)return ds.map(function(d){return esc(d.l)+': <b>'+d.v+'</b> a '+d.lo+'–'+d.hi+' skálán, ez a tartomány '+(d.p<.2?'legalsó':d.p<.4?'alsó':d.p<.6?'középső':d.p<.8?'felső':'legfelső')+' része.'}).join(' ');
    var srt=ds.slice().sort(function(a,b){return b.p-a.p}),hi=srt[0],lo=srt[srt.length-1];
    if(hi.p-lo.p<.06)return 'Minden skálád közel azonos szinten van, nincs kiugró terület.';
    return 'A saját skálájához mérten '+az(hi.l)+' '+v(hi)+' a legmagasabb, '+az(lo.l)+' '+v(lo)+' a legalacsonyabb. A többi skála e kettő között van; mindegyik a saját tartományán belül értendő, nem egymáshoz képest jobb vagy rosszabb.';
  }
  /* ── Válaszstílus-figyelmeztetés a Röviden-kártyán: ugyanazt a skálát és számítást használja, mint a részletes
     elemzés válaszstílus-panelje (ONI_CHECK), csak szigorúbb küszöbökkel; az eredményt a riport is olvassa. ── */
  var STK='onismeret-style-v1';
  function styleFlags(id){
    var C=window.ONI_CHECK,key=(ONI.IDKEY||{})[id];if(!C||!key)return [];
    var a=C.answersOf(id,jget(key,null)),sc=C.scales(id);if(!a||!sc.length)return [];
    var main=sc[0],bins=main.vals,vals=main.qs.map(function(q){return a[q]}).filter(function(v){return typeof v==='number'&&bins.indexOf(v)>-1});
    var n=vals.length;if(n<8||bins.length<3||bins.length>11)return [];
    var cnt={};bins.forEach(function(b){cnt[b]=0});vals.forEach(function(v){cnt[v]++});
    var top=Math.max.apply(null,bins.map(function(b){return cnt[b]}))/n,ext=(cnt[bins[0]]+cnt[bins[bins.length-1]])/n;
    var midIdx=bins.length%2?[(bins.length-1)/2]:[bins.length/2-1,bins.length/2],mid=midIdx.reduce(function(s,i){return s+cnt[bins[i]]},0)/n,pct=function(x){return Math.round(x*100)};
    if(top>=.85)return [['straight','A kérdések '+pct(top)+'%-ára ugyanazt a választ adtad. Ez lehet valós, de gyakran fáradtság, sietés vagy egy általános benyomás okozza; ha a kérdőívben fordított tételek is vannak, az eredmény torzulhat. Érdemes egy nyugodtabb pillanatban újra kitölteni.']];
    if(ext>=.85)return [['extreme','A válaszaid '+pct(ext)+'%-a a skála két szélén van. Ez erős meggyőződést is jelezhet, de a köztes válaszok kerülése felnagyíthatja a kiugró eredményeket.']];
    if(mid>=.7)return [['middle','A válaszaid '+pct(mid)+'%-a a skála közepén van. Ez óvatosságot vagy bizonytalanságot is jelezhet; ilyenkor a profil a valóságosnál laposabbnak tűnhet.']];
    return [];
  }
  function styleWarn(id,r){
    var f=styleFlags(id),all=jget(STK,{});all[id]={sid:r.sid||'_',f:f.map(function(x){return x[0]}),t:new Date().toISOString()};jset(STK,all);
    return f.length?'<div class="oni-style" role="note"><b>Válaszstílus:</b> '+esc(f[0][1])+' Részletek a „Részletes elemzés” válaszstílus-diagramján.</div>':'';
  }
  function evHTML(id){var E=window.ONI_EV||{},LB=window.ONI_EV_LABEL||{},l=LB[E[id]];return l?'<span class="oni-ev oni-ev-'+E[id]+'" title="'+esc(l[1])+'">'+esc(l[0])+'</span>':'';}
  function brief(id,r){
    var d=D[id]||{};
    var dims=topDims(r).map(function(x){var v=x[1];return '<span class="oni-dim"><b>'+esc(v[0])+'</b> '+v[1]+'<small> ('+v[2]+'–'+v[3]+')</small></span>'}).join('');
    var nx=d.next&&L[d.next[0]]?'<a href="'+L[d.next[0]]+'">'+esc(d.next[1])+' ›</a>':'<a href="osszegzes.html">Összegzés ›</a>';
    var st=sumText(r);
    return '<section class="oni-brief" data-id="'+id+'" data-sid="'+esc(r.sid||'_')+'">'+
      '<div class="oni-eyebrow">Röviden</div>'+
      '<p class="oni-head">'+esc(r.h||d.n||'')+'</p>'+
      '<p class="oni-ver">Kitöltve: '+fmtD(r.done||r.t)+(r.corrected?' · javított válaszokkal':'')+' · '+ONI.verText(r)+' '+evHTML(id)+'</p>'+
      (st?'<p class="oni-sum">'+st+'</p>':'')+
      (dims?'<div class="oni-dims" aria-label="Fő eredmények">'+dims+'</div>':'')+
      '<p class="oni-sum oni-q"><b>Kérdés magadnak:</b> '+esc(d.q||'Mi az, ami ebből igaz rád, és mi nem?')+'</p>'+
      '<p class="oni-lim">'+esc(d.limit||'Önbevallásos kérdőív: tendenciát mutat, nem diagnózist.')+'</p>'+
      styleWarn(id,r)+
      '<div class="oni-actions"><button type="button" class="oni-more" aria-expanded="false">Részletes elemzés ▾</button><span class="oni-next">Következő lépés: '+nx+'</span></div>'+
    '</section>';
  }
  /* ── Saját megjegyzések: tapasztalat, körülmények, jegyzet, vállalás, emlékeztető ── */
  function mineHTML(id,r){
    var notes=jget(NK,{}),n=((notes[id]||{})[r.sid||'_'])||{fit:[],cond:[],text:''};
    var chip=function(group,arr,sel){return arr.map(function(c){return '<button type="button" class="oni-chip'+(sel.indexOf(c[0])>-1?' on':'')+'" data-g="'+group+'" data-v="'+c[0]+'" aria-pressed="'+(sel.indexOf(c[0])>-1)+'">'+c[1]+'</button>'}).join('')};
    return '<section class="oni-mine" data-id="'+id+'" data-sid="'+esc(r.sid||'_')+'"><div class="oni-eyebrow">Saját megjegyzések</div>'+
      '<div class="oni-notes"><h5>A saját tapasztalatod <small>(a pontszámot nem módosítja)</small></h5>'+
        '<div class="oni-chips">'+chip('fit',FIT,n.fit||[])+'</div>'+
        '<h5>Kitöltési körülmények <small>(nem kötelező)</small></h5><div class="oni-chips">'+chip('cond',COND,n.cond||[])+'</div>'+
        '<textarea rows="2" aria-label="Saját jegyzet" placeholder="Saját jegyzet: mi jutott eszedbe, mi lepett meg, mit kérdeznél meg valakitől?">'+esc(n.text||'')+'</textarea>'+
        '<span class="oni-saved" aria-live="polite"></span></div>'+
      commitHTML(id,r)+
      remindHTML(id,r)+
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
    all[id]=a.slice(-12);if(!all[id].length)delete all[id];return jset(CK,all);
  }
  function setCommitState(id,t,st){var all=commits();(all[id]||[]).forEach(function(c){if(c.t===t){c.st=st;c.at=new Date().toISOString()}});jset(CK,all);}
  /* ── Újramérési emlékeztető naptárfájlként ── */
  /* ── Újramérési emlékeztető tesztenként: be/ki, időköz, halasztás; a naptárjavaslat a tényleges kitöltésből indul ── */
  var RDAYS=[30,60,90,180,365];
  function remindHTML(id,r){
    var c=ONI.remindCfg(id),du=ONI.due(id,r);
    var opts='<option value="">Alapértelmezett ('+(c.def?c.def+' nap':'kikapcsolva')+')</option>'+RDAYS.map(function(d){return '<option value="'+d+'"'+(c.own&&c.days===d?' selected':'')+'>'+d+' nap</option>'}).join('')+'<option value="0"'+(c.own&&c.days===0?' selected':'')+'>Kikapcsolva</option>';
    var when=du.off?'Ehhez a teszthez nincs emlékeztető.':(du.due?'Most esedékes: '+du.since+' napja töltötted ki.':'Esedékes: '+fmtD(du.at)+(du.snoozed?' (halasztva)':''));
    return '<div class="oni-remind"><h5>Újramérési emlékeztető <small>(csak ennél a tesztnél)</small></h5>'+
      '<div class="oni-crow"><label class="sr-only" for="oni-rd-'+id+'">Emlékeztető időköze</label><select id="oni-rd-'+id+'" class="oni-rsel">'+opts+'</select>'+
      (du.due?'<button type="button" class="oni-cbtn oni-snooze">Halasztás 30 nappal</button>':'')+
      '<button type="button" class="oni-ics"'+(du.off?' disabled':'')+' title="Letölthető naptárbejegyzés (.ics), bármelyik naptárba importálható">Naptárba (.ics)</button></div>'+
      '<span class="oni-rstate" aria-live="polite">'+when+'</span></div>';
  }
  function icsEsc(x){return String(x).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
  function fold(line){var out=[];while(line.length>60){out.push(line.slice(0,60));line=' '+line.slice(60)}out.push(line);return out.join('\r\n')}
  function icsFile(id){
    var d=D[id]||{},r=last(id),du=ONI.due(id,r);if(du.off||!du.at)return null;
    var at=du.at.getTime()<Date.now()?new Date(Date.now()+864e5):du.at,end=new Date(at.getTime()+864e5);
    var ymd=function(x){return x.toISOString().slice(0,10).replace(/-/g,'')};
    var base=/^https?:/.test(location.protocol)?location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,''):'https://jtdevzero.github.io/onismeret/';
    var url=base+(L[id]||'index.html'),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    var body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Onismereti terkepek//HU','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
      'UID:'+id+'-'+Date.now()+'@onismeret','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+ymd(at),'DTEND;VALUE=DATE:'+ymd(end),
      'SUMMARY:'+icsEsc('Újramérés: '+(d.n||id)),
      'DESCRIPTION:'+icsEsc('Utoljára '+fmtD(r.done||r.t)+'-n töltötted ki. Ha most újra kitöltöd, az összegzés megmutatja, mi változott. '+url),
      'URL:'+url,'TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc('Újramérés: '+(d.n||id)),'TRIGGER:PT9H','END:VALARM','END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/calendar;charset=utf-8'}));a.download='ujrameres-'+id+'.ics';document.body.appendChild(a);a.click();a.remove();
    return body;
  }
  window.ONI_ICS=icsFile;
  function saveNote(box){
    var id=box.getAttribute('data-id'),sid=box.getAttribute('data-sid'),all=jget(NK,{});
    var pick=function(g){return [].map.call(box.querySelectorAll('.oni-chip.on[data-g="'+g+'"]'),function(b){return b.getAttribute('data-v')})};
    all[id]=all[id]||{};all[id][sid]={fit:pick('fit'),cond:pick('cond'),text:box.querySelector('textarea').value.slice(0,4000),t:new Date().toISOString()};
    var ok=jset(NK,all);var s=box.querySelector('.oni-saved');s.textContent=ok?'Jegyzet mentve ✓':'A jegyzetet nem sikerült menteni ezen az eszközön.';clearTimeout(s._t);s._t=setTimeout(function(){s.textContent=''},1600);
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
    var st=jget(SK,{});det.open=st.detailOpen!==false;   /* alapból nyitva: a részletes elemzés a lényeg */
    var oldDeep=res.querySelector(':scope > .oni-deep');if(oldDeep)oldDeep.remove();
    res.insertAdjacentHTML('afterbegin',deepHTML(id,r));
    res.insertAdjacentHTML('afterbegin',brief(id,r));
    var oldMely=res.querySelector(':scope > .oni-mely');if(oldMely)oldMely.remove();
    if(window.ONI_MELY)res.insertAdjacentHTML('beforeend',window.ONI_MELY(id,r));
    var oldMine=res.querySelector(':scope > .oni-mine');if(oldMine)oldMine.remove();
    res.insertAdjacentHTML('beforeend',mineHTML(id,r));
    var more=res.querySelector(':scope > .oni-brief .oni-more'),box=res.querySelector(':scope > .oni-mine');
    var sync=function(){more.textContent=det.open?'Részletes elemzés elrejtése ▴':'Részletes elemzés ▾';more.setAttribute('aria-expanded',det.open)};sync();
    more.onclick=function(){det.open=!det.open;var s=jget(SK,{});s.detailOpen=det.open;jset(SK,s);sync();if(det.open)det.scrollIntoView({behavior:'smooth',block:'start'})};
    det.addEventListener('toggle',sync);
    box.addEventListener('click',function(e){var c=e.target.closest('.oni-chip');if(!c||c.hasAttribute('data-cst'))return;c.classList.toggle('on');c.setAttribute('aria-pressed',c.classList.contains('on'));
      if(c.getAttribute('data-g')==='fit'&&c.classList.contains('on')&&c.getAttribute('data-v')!=='explore')[].forEach.call(box.querySelectorAll('.oni-chip[data-g=fit]'),function(o){if(o!==c&&o.getAttribute('data-v')!=='explore'){o.classList.remove('on');o.setAttribute('aria-pressed','false')}});
      saveNote(box);});
    var cb=box.querySelector('.oni-cbtn'),ci=box.querySelector('.oni-crow input'),cs=box.querySelector('.oni-csaved');
    var doCommit=function(){if(!saveCommit(id,r.sid||'_',ci.value)){cs.textContent='A vállalást nem sikerült menteni ezen az eszközön.';return;}cs.textContent=ci.value.trim()?'Vállalás mentve ✓ A főoldalon és a következő kitöltésnél emlékeztetlek rá.':'Vállalás törölve.';cb.textContent=ci.value.trim()?'Módosítom':'Vállalom'};
    cb.onclick=doCommit;ci.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doCommit()}});
    var pv=box.querySelector('.oni-cprev');if(pv)pv.addEventListener('click',function(e){var c=e.target.closest('[data-cst]');if(!c)return;e.stopPropagation();setCommitState(id,pv.getAttribute('data-t'),c.getAttribute('data-cst'));pv.innerHTML='<span>Köszönöm, rögzítve: <b>'+CST[c.getAttribute('data-cst')]+'</b>. Írhatsz új vállalást lent.</span>';});
    var bindRemind=function(){
      var rm=box.querySelector('.oni-remind');
      rm.querySelector('.oni-ics').onclick=function(){icsFile(id)};
      rm.querySelector('.oni-rsel').onchange=function(e){var v=e.target.value;ONI.setRemind(id,{d:v===''?null:+v,s:null});rerender();};
      var sn=rm.querySelector('.oni-snooze');if(sn)sn.onclick=function(){ONI.setRemind(id,{s:new Date(Date.now()+30*864e5).toISOString()});rerender();};
    };
    var rerender=function(){var rm=box.querySelector('.oni-remind');rm.outerHTML=remindHTML(id,r);bindRemind();};
    bindRemind();
    var ta=box.querySelector('textarea'),tm;ta.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){saveNote(box)},500)});
  }
  window.addEventListener('oni:saved',function(e){if(MAP[e.detail.id])setTimeout(function(){enhance(e.detail.id)},60)});
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details.oni-detail'),function(d){d.dataset.wasOpen=d.open;d.open=true})});
  window.addEventListener('afterprint',function(){[].forEach.call(document.querySelectorAll('details.oni-detail'),function(d){d.open=d.dataset.wasOpen==='true'})});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insertSheets);else insertSheets();
  /* ── Nyugodt zárás a megterhelőbb tesztek eredménye előtt ── */
  var CALM={des:1,smi:1,ysq:1,phq9:1};
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
