/* Önbizalom-kurzus — felület. Az adatok csak ebben a böngészőben (localStorage) tárolódnak. */
(function(){
  'use strict';
  var K='onbizalom-kurzus-v1';
  var MODS=OB.mods.slice().sort(function(a,b){return a.id-b.id});
  var LV=['Alap','Közép','Mester'];
  var $=function(id){return document.getElementById(id)};
  var esc=function(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var strip=function(x){return String(x||'').replace(/<[^>]+>/g,'')};
  var fmt=function(t){return new Date(t).toLocaleDateString('hu-HU',{year:'numeric',month:'short',day:'numeric'})};

  /* ── leckék sorrendben ── */
  var ALL=[];
  MODS.forEach(function(m){m.levels.forEach(function(l,li){l.lessons.forEach(function(s,si){
    ALL.push({id:m.id+'-'+(li+1)+'-'+(si+1),m:m,li:li,si:si,lv:l.name,s:s});});});});
  var BY={};ALL.forEach(function(x,i){x.i=i;BY[x.id]=x});

  /* ── tároló ── */
  function load(){try{var v=JSON.parse(localStorage.getItem(K));if(v&&typeof v==='object')return {done:v.done||{},notes:v.notes||{},last:v.last||null,open:v.open||[]}}catch(e){}return {done:{},notes:{},last:null,open:[]}}
  var st=load(),saveOk=true;
  function save(){try{localStorage.setItem(K,JSON.stringify(st));saveOk=true}catch(e){saveOk=false}return saveOk}
  function toast(t){var el=$('toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){el.classList.remove('on')},2200)}

  /* ── haladás ── */
  function doneN(list){return list.filter(function(x){return st.done[x.id]}).length}
  function modLessons(m){return ALL.filter(function(x){return x.m===m})}
  function progress(){var n=doneN(ALL);$('prog-bar').style.width=(n/ALL.length*100)+'%';$('prog-txt').textContent=n+' / '+ALL.length+' lecke'}

  /* ── oldalsáv ── */
  function renderSide(cur){
    var curM=cur?cur.m.id:null,h='<a class="home-link'+(cur?'':' on')+'" href="#/">Kezdőlap</a>';
    MODS.forEach(function(m){var ls=modLessons(m),open=st.open.indexOf(m.id)>-1||m.id===curM;
      h+='<div class="mod acc-'+m.color+(open?' open':'')+'" data-m="'+m.id+'"><button type="button" aria-expanded="'+open+'"><span class="num">'+m.id+'</span><span class="mt">'+esc(m.title)+'<br><span class="mp">'+doneN(ls)+' / '+ls.length+'</span></span><span class="chev">▶</span></button><div class="lv">';
      m.levels.forEach(function(l,li){h+='<h4>'+esc(l.name)+'</h4>';l.lessons.forEach(function(s,si){var id=m.id+'-'+(li+1)+'-'+(si+1),d=!!st.done[id];
        h+='<a href="#/'+id+'" class="'+(d?'done ':'')+(cur&&cur.id===id?'on':'')+'"><span class="ck">'+(d?'✓':'')+'</span><span>'+esc(s.t)+'</span></a>'});});
      h+='</div></div>';});
    h+='<div class="side-tools"><button type="button" id="exp-md">Naplóm letöltése (Markdown)</button><button type="button" id="exp-json">Mentés fájlba</button><label>Visszaállítás fájlból<input type="file" id="imp-json" accept="application/json,.json"></label></div>';
    $('side').innerHTML=h;
    [].forEach.call($('side').querySelectorAll('.mod>button'),function(b){b.addEventListener('click',function(){
      var box=b.parentNode,id=+box.getAttribute('data-m'),o=!box.classList.contains('open');box.classList.toggle('open',o);b.setAttribute('aria-expanded',o);
      var i=st.open.indexOf(id);if(o&&i<0)st.open.push(id);if(!o&&i>-1)st.open.splice(i,1);save();});});
    $('exp-md').addEventListener('click',exportMd);$('exp-json').addEventListener('click',exportJson);$('imp-json').addEventListener('change',importJson);
  }

  /* ── kezdőlap ── */
  function renderHome(){
    var n=doneN(ALL),last=st.last&&BY[st.last],next=ALL.filter(function(x){return !st.done[x.id]})[0],h='';
    h+='<div class="hero"><span class="kick">9 modul · 81 lecke · 3 szint</span><h1>Az önbizalom <em>gyakorlat</em>, nem adottság</h1>';
    h+='<p class="lead">Ez a kurzus nem motiváló mondatokat ad, hanem lépéseket. Minden lecke rövid tananyagból, időzített gyakorlatból, naplókérdésekből és egy mérföldkőből áll. A tartalom a kognitív viselkedésterápia, Bandura énhatékonyság-elmélete, az önegyüttérzés-kutatás és a fokozatos kitettség bizonyítékaira épül.</p></div>';
    if(n||last)h+='<div class="cont acc-'+(last||next||ALL[0]).m.color+'"><div><small>'+(last&&!st.done[last.id]?'Itt tartottál':'Következő lecke')+'</small><b>'+esc((last&&!st.done[last.id]?last:next||last).s.t)+'</b></div><a class="btn" href="#/'+(last&&!st.done[last.id]?last:next||last).id+'">Folytatom</a></div>';
    else h+='<div class="cont acc-emerald"><div><small>Kezdés</small><b>'+esc(ALL[0].s.t)+'</b></div><a class="btn" href="#/'+ALL[0].id+'">Az első lecke</a></div>';
    h+='<div class="how"><div><b>Sorrendben</b>A modulok egymásra épülnek, de bármelyik megnyitható. Egy szintet érdemes egy-két hét alatt végigvinni.</div><div><b>Gyakorlat, nem olvasás</b>Egy lecke akkor kész, ha a gyakorlatot elvégezted, és a mérföldkövet teljesítetted.</div><div><b>Napló</b>A válaszaid automatikusan mentődnek, és bármikor letöltheted őket.</div><div><b>AI-tanár</b>Minden leckénél van egy kész prompt, amivel egy új beszélgetésben mélyítheted az anyagot.</div></div>';
    h+='<h2>Modulok</h2><div class="mods">'+MODS.map(function(m){var ls=modLessons(m),d=doneN(ls),first=ls.filter(function(x){return !st.done[x.id]})[0]||ls[0];
      return '<a class="mcard acc-'+m.color+'" href="#/'+first.id+'"><span class="n">'+m.id+'. modul</span><h3>'+esc(m.title)+'</h3><p>'+esc(m.sub)+'</p><div class="bar"><i style="width:'+(d/ls.length*100)+'%"></i></div><small>'+d+' / '+ls.length+' lecke kész</small></a>'}).join('')+'</div>';
    h+='<p class="note"><strong>Fontos:</strong> ez a kurzus önfejlesztő anyag, nem terápia. Ha a szorongás, a lehangoltság vagy a kerülés tartósan és sok területen korlátoz, érdemes szakemberhez (például kognitív viselkedésterapeutához) fordulni. Ha önártó gondolataid vannak, hívd a 116-123-at (Lelki Elsősegély-telefon, ingyenes, éjjel-nappal). Minden adatod (haladás, napló) csak ebben a böngészőben tárolódik, szerverre nem kerül. Ha másik eszközön is folytatnád, használd a „Mentés fájlba” és a „Visszaállítás fájlból” gombot.</p>';
    $('main').className='main';$('main').innerHTML=h;document.title='Önbizalom-kurzus — 81 lecke, 9 modul';
  }

  /* ── lecke ── */
  function aiPrompt(x){var s=x.s,n=st.notes[x.id]||{};
    var ans=s.q.map(function(q,i){return n['q'+i]&&n['q'+i].trim()?'- '+q+'\n  '+n['q'+i].trim().replace(/\n/g,'\n  '):''}).filter(Boolean).join('\n');
    return 'Te egy tapasztalt önbizalom-coach vagy, aki kognitív viselkedésterápiás, önegyüttérzés-alapú és fokozatos kitettségre épülő módszerekkel dolgozik. Magyarul, közvetlenül és őszintén beszélsz, nem hízelegsz.\n\n'+
      'Egy önbizalom-kurzust végzek. Most itt tartok: '+x.m.id+'. modul ('+x.m.title+'), '+x.lv+' szint, „'+s.t+'” lecke.\n'+
      'A lecke lényege: '+strip(s.lead)+'\n'+
      'A gyakorlat: '+s.ex.t+' ('+s.ex.min+' perc). Lépései: '+s.ex.steps.join(' ')+'\n'+
      'A mérföldkő: '+s.ms+'\n'+
      (ans?'\nA naplóválaszaim eddig:\n'+ans+'\n':'')+
      '\nKérlek:\n1. Kérdezz rá röviden, hol tartok a gyakorlattal, és mi volt nehéz.\n2. Segíts a saját helyzetemre szabni a gyakorlatot, konkrét példával.\n3. Tegyél fel egyenként 2–3 mélyítő kérdést, és várd meg a válaszom.\n4. A végén fogalmazd meg velem a következő kis, konkrét lépést.\nHa komoly szorongásra vagy lehangoltságra utaló jelet látsz, javasold, hogy forduljak szakemberhez.';}
  var timer=null;
  function renderLesson(x){
    var s=x.s,m=x.m,n=st.notes[x.id]||{},d=st.done[x.id],prev=ALL[x.i-1],next=ALL[x.i+1],h='';
    st.last=x.id;save();
    h+='<div class="crumb">'+m.id+'. modul · '+esc(m.title)+' · '+esc(x.lv)+' · '+(x.si+1)+'. lecke</div>';
    h+='<h1>'+esc(s.t)+'</h1><p class="lead">'+esc(s.lead)+'</p>';
    h+='<div class="body">'+s.body.map(function(p){return '<p>'+p+'</p>'}).join('')+'</div>';
    h+='<section class="box"><div class="ex-h"><div><div class="k">Gyakorlat · '+s.ex.min+' perc</div><h3>'+esc(s.ex.t)+'</h3></div><div class="timer"><output id="tm">'+s.ex.min+':00</output><button type="button" class="btn sm" id="tm-btn">Időzítő indítása</button></div></div><ol>'+s.ex.steps.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol></section>';
    h+='<section class="box journal"><div class="k">Napló</div><h3>Naplókérdések</h3>'+s.q.map(function(q,i){return '<label for="q'+i+'">'+esc(q)+'</label><textarea id="q'+i+'" data-k="q'+i+'" maxlength="5000">'+esc(n['q'+i]||'')+'</textarea>'}).join('')+
      '<label for="qf">Saját jegyzet: mire számítottam, mi történt?</label><textarea id="qf" data-k="free" maxlength="10000">'+esc(n.free||'')+'</textarea><div class="saved" id="saved" aria-live="polite">'+(n.t?'Utoljára mentve: '+fmt(n.t):'')+'</div></section>';
    h+='<section class="box"><div class="k">Mérföldkő</div><label class="ms'+(d?' ok':'')+'"><input type="checkbox" id="ms"'+(d?' checked':'')+'><p>'+esc(s.ms)+(d?'<br><small>Teljesítve: '+fmt(d)+'</small>':'')+'</p></label></section>';
    h+='<section class="box ai"><div class="ex-h"><div><div class="k">AI-tanár</div><h3>Mélyítsd egy beszélgetésben</h3></div><button type="button" class="btn sm" id="ai-copy">Prompt másolása</button></div><p style="color:var(--soft);font-size:14.5px;margin-top:6px">Másold be egy új Claude-beszélgetésbe. A prompt tartalmazza a lecke lényegét és az eddigi naplóválaszaidat is.</p><pre id="ai-txt"></pre></section>';
    h+='<div class="nav">'+(prev?'<a href="#/'+prev.id+'"><small>‹ Előző</small>'+esc(prev.s.t)+'</a>':'')+(next?'<a class="nx" href="#/'+next.id+'"><small>Következő ›</small>'+esc(next.s.t)+'</a>':'<a class="nx" href="#/"><small>Vége</small>Vissza a kezdőlapra</a>')+'</div>';
    var main=$('main');main.className='main acc-'+m.color;main.innerHTML=h;document.title=s.t+' — Önbizalom-kurzus';
    $('ai-txt').textContent=aiPrompt(x);
    /* napló mentése */
    var tmo=null;
    [].forEach.call(main.querySelectorAll('textarea[data-k]'),function(t){t.addEventListener('input',function(){
      $('saved').textContent='';clearTimeout(tmo);tmo=setTimeout(function(){var o=st.notes[x.id]||{};
        [].forEach.call(main.querySelectorAll('textarea[data-k]'),function(z){if(z.value.trim())o[z.getAttribute('data-k')]=z.value;else delete o[z.getAttribute('data-k')]});
        var has=Object.keys(o).some(function(k){return k!=='t'});if(has){o.t=new Date().toISOString();st.notes[x.id]=o;}else delete st.notes[x.id];
        $('saved').textContent=save()?'Mentve':'Nem sikerült menteni ezen az eszközön.';$('ai-txt').textContent=aiPrompt(x);},500);});});
    /* mérföldkő */
    $('ms').addEventListener('change',function(e){if(e.target.checked)st.done[x.id]=new Date().toISOString();else delete st.done[x.id];
      save();progress();renderSide(x);var lb=e.target.parentNode;lb.classList.toggle('ok',e.target.checked);
      if(e.target.checked){var mm=modLessons(m);toast(doneN(mm)===mm.length?'Gratulálok, a '+m.id+'. modul kész!':'Lecke teljesítve ✓');}});
    /* időzítő */
    clearInterval(timer);var left=s.ex.min*60,run=false;
    var show=function(){$('tm').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0')};
    $('tm-btn').addEventListener('click',function(){var b=$('tm-btn');
      if(run){clearInterval(timer);run=false;b.textContent='Folytatás';return;}
      if(left<=0)left=s.ex.min*60;run=true;b.textContent='Szünet';
      timer=setInterval(function(){left--;show();if(left<=0){clearInterval(timer);run=false;b.textContent='Újra';toast('Lejárt az idő. Írd le a naplóba, mi történt.');}},1000);});
    /* prompt másolása */
    $('ai-copy').addEventListener('click',function(){var t=aiPrompt(x);
      var done=function(){toast('Prompt a vágólapon')},fail=function(){var r=document.createRange();r.selectNodeContents($('ai-txt'));var sel=getSelection();sel.removeAllRanges();sel.addRange(r);toast('Jelöld ki és másold')};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,fail);else fail();});
    window.scrollTo(0,0);
  }

  /* ── export / import ── */
  function download(name,text,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
  function exportMd(){var out=['# Önbizalom-kurzus — naplóm','','Exportálva: '+fmt(Date.now())+' · '+doneN(ALL)+' / '+ALL.length+' lecke kész',''],any=false;
    MODS.forEach(function(m){var ls=modLessons(m).filter(function(x){return st.notes[x.id]||st.done[x.id]});if(!ls.length)return;out.push('## '+m.id+'. modul — '+m.title,'');
      ls.forEach(function(x){var n=st.notes[x.id]||{};any=true;out.push('### '+x.s.t+' ('+x.lv+')'+(st.done[x.id]?' ✓':''),'');
        x.s.q.forEach(function(q,i){if(n['q'+i])out.push('**'+q+'**','',n['q'+i].trim(),'')});if(n.free)out.push('**Saját jegyzet**','',n.free.trim(),'');});});
    if(!any){toast('Még nincs naplóbejegyzésed');return;}
    download('onbizalom-naplo-'+new Date().toISOString().slice(0,10)+'.md',out.join('\n'),'text/markdown');}
  function exportJson(){download('onbizalom-mentes-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({app:'onbizalom-kurzus',v:1,exported:new Date().toISOString(),data:st},null,1),'application/json');toast('Mentés letöltve')}
  function valid(d){if(!d||typeof d!=='object')return false;
    var okDone=d.done&&typeof d.done==='object'&&Object.keys(d.done).every(function(k){return BY[k]&&typeof d.done[k]==='string'&&!isNaN(Date.parse(d.done[k]))});
    var okNotes=d.notes&&typeof d.notes==='object'&&Object.keys(d.notes).every(function(k){var n=d.notes[k];return BY[k]&&n&&typeof n==='object'&&Object.keys(n).every(function(f){return /^(q[0-2]|free|t)$/.test(f)&&typeof n[f]==='string'&&n[f].length<=10000})});
    return okDone&&okNotes}
  function importJson(ev){var f=ev.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){
    try{var o=JSON.parse(r.result);if(!o||o.app!=='onbizalom-kurzus'||!valid(o.data))throw 0;
      if(!confirm('Visszaállítod a '+String(o.exported||'').slice(0,10)+' mentést? A mostani haladás és napló felülíródik.'))return;
      st={done:o.data.done,notes:o.data.notes,last:BY[o.data.last]?o.data.last:null,open:Array.isArray(o.data.open)?o.data.open.filter(function(x){return typeof x==='number'}):[]};save();route();toast('Visszaállítva');}
    catch(e){toast('Ez nem érvényes kurzus-mentés')}ev.target.value='';};r.readAsText(f);}

  /* ── útvonal ── */
  function route(){var id=(location.hash.match(/^#\/(\d+-\d+-\d+)$/)||[])[1],x=id&&BY[id];
    document.body.classList.remove('menu');$('menu-btn').setAttribute('aria-expanded','false');
    renderSide(x||null);progress();if(x)renderLesson(x);else renderHome();}
  window.addEventListener('hashchange',route);
  $('menu-btn').addEventListener('click',function(){var o=!document.body.classList.contains('menu');document.body.classList.toggle('menu',o);this.setAttribute('aria-expanded',o)});
  $('scrim').addEventListener('click',function(){document.body.classList.remove('menu');$('menu-btn').setAttribute('aria-expanded','false')});
  route();
})();
