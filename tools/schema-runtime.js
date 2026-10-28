/* ── Séma-alapú segédfüggvények (a tools/schema-runtime.js-ből másolva) ── */
window.ONI_CHECK=(function(){
  var S=window.ONI_SCHEMA,BYKEY={},CACHE={},LIMIT=(window.ONI&&ONI.LIMIT)||200;
  Object.keys(S).forEach(function(id){BYKEY[S[id].k]=id});
  /* kérdésazonosító → megengedett értékek */
  function items(id){
    if(CACHE[id])return CACHE[id];var m={};
    (S[id]?S[id].g:[]).forEach(function(g){var r=g[0].match(/^(.*?)(\d+)(?:-(\d+))?$/),a=+r[2],b=r[3]?+r[3]:a;for(var i=a;i<=b;i++)m[r[1]+i]=g[1];});
    return CACHE[id]=m;
  }
  function answersOf(id,j){var c=S[id]&&S[id].c;if(!j||typeof j!=='object')return null;return c?(j[c]&&typeof j[c]==='object'?j[c]:{}):j;}
  function isObj(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
  /* A válaszok ellenőrzése: csak létező kérdés, csak a kérdésnél megengedett érték. Hibaüzenet vagy null. */
  function responses(id,j){
    var it=items(id);if(!isObj(j))return 'nem objektum';
    var a=answersOf(id,j);if(!isObj(a))return 'hiányzó válaszmező';
    var ks=Object.keys(a);
    for(var i=0;i<ks.length;i++){var q=ks[i],v=a[q];
      if(!it[q])return 'ismeretlen kérdés: '+q;
      if(it[q].indexOf(v)<0)return q+'. kérdés: nem megengedett válasz ('+JSON.stringify(v)+')';}
    return null;
  }
  function iso(x){return typeof x==='string'&&!isNaN(Date.parse(x))&&Date.parse(x)<Date.now()+864e5}
  function posInt(x){return x===undefined||(typeof x==='number'&&x>=1&&x<=99&&Math.floor(x)===x)}
  /* Egy eredményrekord szerkezete */
  function record(id,r){
    if(!isObj(r))return 'nem objektum';
    if(!iso(r.t))return 'hibás dátum';if(r.done!==undefined&&!iso(r.done))return 'hibás kitöltési dátum';
    if(r.h!=null&&typeof r.h!=='string')return 'hibás címke';if(r.n!=null&&typeof r.n!=='string')return 'hibás név';
    if(r.sid!=null&&(typeof r.sid!=='string'||r.sid.length>40))return 'hibás azonosító';
    if(!posInt(r.qv)||!posInt(r.sv)||!posInt(r.tv))return 'hibás verziószám';
    if(r.x!=null&&typeof r.x!=='object')return 'hibás kiegészítő adat';
    /* a skálakulcsokat csak a jelenlegi tesztváltozatnál ellenőrizzük; egy régi változat más skálákat használhatott */
    var allow=S[id]&&S[id].d&&(!window.ONI||!ONI.isCur||ONI.isCur(id,r))?S[id].d:null;
    if(r.d!=null){if(!isObj(r.d))return 'hibás skálák';
      var ks=Object.keys(r.d);for(var i=0;i<ks.length;i++){var d=r.d[ks[i]];
        if(allow&&allow.length&&allow.indexOf(ks[i])<0)return 'ennél a tesztnél nem létező skála: '+ks[i];
        if(!Array.isArray(d)||typeof d[0]!=='string'||typeof d[2]!=='number'||typeof d[3]!=='number'||!(d[3]>d[2]))return 'hibás skála: '+ks[i];
        if(d[1]!==null&&(typeof d[1]!=='number'||!isFinite(d[1])||d[1]<d[2]-1e-6||d[1]>d[3]+1e-6))return 'skálán kívüli érték: '+ks[i];}}
    return null;
  }
  /* Egy mentett tárolókulcs tartalma. Hibaüzenet vagy null. */
  function stored(k,v){
    if(typeof v!=='string'||v.length>3e6)return 'túl nagy vagy nem szöveg';
    var j;try{j=JSON.parse(v)}catch(e){return 'nem érvényes JSON'}
    if(BYKEY[k])return responses(BYKEY[k],j);
    if(/-responses-v\d+$/.test(k)||/^ysq_/.test(k))return 'ismeretlen teszt';
    if(k==='onismeret-results-v1'){
      if(!isObj(j))return 'nem objektum';
      var ids=Object.keys(j);for(var i=0;i<ids.length;i++){var id=ids[i],h=j[id];
        if(!S[id])return 'ismeretlen teszt: '+id;
        if(!Array.isArray(h)||h.length>LIMIT)return id+': hibás előzmény';
        for(var x=0;x<h.length;x++){var e=record(id,h[x]);if(e)return id+' '+(x+1)+'. eredmény: '+e;}}
      return null;
    }
    if(OTHER[k])return OTHER[k](j);
    return 'ismeretlen adat';
  }
  /* A többi tároló teljes sémája: jegyzetek, vállalások, jelölések, beállítások, kitöltési idők, párod adatai */
  function str(x,max){return typeof x==='string'&&x.length<=max}
  function each(o,fn){if(!isObj(o))return 'nem objektum';var ks=Object.keys(o);for(var i=0;i<ks.length;i++){var e=fn(ks[i],o[ks[i]]);if(e)return ks[i]+': '+e;}return null}
  function testId(id){return S[id]?null:'ismeretlen teszt'}
  var FITS=['fits','not','explore'],CONDS=['calm','tired','stress','rush','interrupted'],CST=['done','part','no'];
  var OTHER={
    'onismeret-notes-v1':function(j){return each(j,function(id,o){return testId(id)||each(o,function(sid,n){
      if(!isObj(n))return 'nem objektum';if(!str(sid,40))return 'hibás azonosító';
      if(!Array.isArray(n.fit)||!n.fit.every(function(x){return FITS.indexOf(x)>-1}))return 'hibás címke';
      if(!Array.isArray(n.cond)||!n.cond.every(function(x){return CONDS.indexOf(x)>-1}))return 'hibás körülmény';
      if(!str(n.text,4000))return 'hibás jegyzet';if(n.t!==undefined&&!iso(n.t))return 'hibás dátum';return null})})},
    'onismeret-commit-v1':function(j){return each(j,function(id,a){if(testId(id))return testId(id);if(!Array.isArray(a)||a.length>12)return 'hibás lista';
      for(var i=0;i<a.length;i++){var c=a[i];if(!isObj(c)||!str(c.sid,40)||!str(c.text,200)||!iso(c.t)||(c.st!=null&&CST.indexOf(c.st)<0)||(c.at!=null&&!iso(c.at)))return (i+1)+'. vállalás hibás';}return null})},
    'onismeret-unclear-v1':function(j){return each(j,function(id,o){return testId(id)||each(o,function(q,f){return isObj(f)&&iso(f.t)&&str(f.q,240)?null:'hibás jelölés'})})},
    'onismeret-settings-v1':function(j){return each(j,function(k,v){
      if(k==='theme')return v==='light'||v==='dark'?null:'hibás téma';
      if(k==='autoAdvance'||k==='detailOpen'||k==='longDesc')return typeof v==='boolean'?null:'nem logikai érték';
      if(k==='retake')return typeof v==='number'&&v>=0&&v<=3650?null:'hibás időköz';
      if(k==='remind')return each(v,function(id,c){if(testId(id))return testId(id);if(!isObj(c))return 'nem objektum';
        if(c.d!==undefined&&!(typeof c.d==='number'&&c.d>=0&&c.d<=3650))return 'hibás időköz';if(c.s!==undefined&&!(typeof c.s==='string'&&!isNaN(Date.parse(c.s))))return 'hibás halasztás';
        return Object.keys(c).every(function(x){return x==='d'||x==='s'})?null:'ismeretlen mező'});
      return 'ismeretlen beállítás'})},
    'onismeret-meta-v1':function(j){return each(j,function(k,o){if(k!=='ans'&&k!=='fresh')return 'ismeretlen mező';return each(o,function(key,t){return iso(t)?null:'hibás dátum'})})},
    'onismeret-edzes-v1':function(j){
      var AR=['KI','HA','KE','HI','LA'],EXS=['win','crit','comp','voice','no','unready','thanks','mastery','attn','ladder'],BK=['rses','gse','bfne','obgy'].concat(AR);
      var sc=function(x){return typeof x==='number'&&x>=0&&x<=10&&Math.floor(x)===x};
      return each(j,function(k,v){
        if(k==='plan'){if(!isObj(v)||!iso(v.start))return 'hibás kezdés';
          if(!Array.isArray(v.areas)||v.areas.length>2||!v.areas.every(function(a){return AR.indexOf(a)>-1}))return 'hibás terület';
          return each(v.base,function(b,n){return BK.indexOf(b)<0?'ismeretlen skála':n===null||(typeof n==='number'&&isFinite(n)&&n>=0&&n<=48)?null:'hibás érték'})}
        if(k==='log')return each(v,function(d,e){if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!iso(d+'T00:00:00'))return 'hibás nap';if(!isObj(e))return 'nem objektum';
          if(!Array.isArray(e.ex)||e.ex.length>EXS.length||!e.ex.every(function(x){return EXS.indexOf(x)>-1}))return 'hibás gyakorlatlista';
          if(e.win!==undefined&&(!Array.isArray(e.win)||e.win.length>3||!e.win.every(function(w){return str(w,300)})))return 'hibás napló';
          if(e.crit!==undefined&&(!isObj(e.crit)||!str(e.crit.a,500)||!str(e.crit.b,500)))return 'hibás kritikus-gyakorlat';
          if(e.note!==undefined&&!str(e.note,1000))return 'hibás megjegyzés';
          return Object.keys(e).every(function(x){return ['ex','win','crit','note'].indexOf(x)>-1})?null:'ismeretlen mező'});
        if(k==='ladder'){if(!Array.isArray(v)||v.length>40)return 'hibás létra';
          for(var i=0;i<v.length;i++){var r=v[i];
            if(!isObj(r)||!str(r.id,40)||!str(r.text,200)||AR.indexOf(r.area)<0||!sc(r.fear)||(r.done!==undefined&&!iso(r.done)))return (i+1)+'. lépcső hibás';
            if(!Array.isArray(r.tries)||r.tries.length>50||!r.tries.every(function(t){return isObj(t)&&iso(t.t)&&sc(t.pred)&&sc(t.real)&&str(t.note,500)}))return (i+1)+'. lépcső próbái hibásak';}
          return null}
        return 'ismeretlen mező'})},
    /* Alvásterv (alvasterv.html): terv, heti ablak-beállítások, reggeli alvásnapló */
    'onismeret-alvasterv-v1':function(j){
      var FAC=['caf','alc','scr','late','stress','nap','ex','light','wind'],HM=/^([01]\d|2[0-3]):[0-5]\d$/;
      var hm=function(x){return typeof x==='string'&&HM.test(x)},int=function(x,a,b){return typeof x==='number'&&Math.floor(x)===x&&x>=a&&x<=b};
      return each(j,function(k,v){
        if(k==='plan'){if(!isObj(v)||!iso(v.start))return 'hibás kezdés';
          if(!hm(v.wake)||!int(v.need,300,600)||(v.mode!=='rutin'&&v.mode!=='ablak'))return 'hibás beállítás';
          if(v.win!==undefined&&!int(v.win,300,600))return 'hibás alvásablak';
          if(v.adj!==undefined&&(!Array.isArray(v.adj)||v.adj.length>60||!v.adj.every(function(a){return isObj(a)&&iso(a.t)&&int(a.win,300,600)&&typeof a.se==='number'&&a.se>=0&&a.se<=1})))return 'hibás beállítás-történet';
          var e=each(v.base,function(b,n){return ['sci','ess','meq'].indexOf(b)<0?'ismeretlen skála':n===null||(typeof n==='number'&&isFinite(n)&&n>=0&&n<=86)?null:'hibás érték'});if(e)return e;
          return Object.keys(v).every(function(x){return ['start','wake','need','mode','win','adj','base'].indexOf(x)>-1})?null:'ismeretlen mező'}
        if(k==='log'){if(isObj(v)&&Object.keys(v).length>400)return 'túl sok nap';
          return each(v,function(d,e){if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!iso(d+'T00:00:00'))return 'hibás nap';if(!isObj(e))return 'nem objektum';
          if(!hm(e.bed)||!hm(e.off)||!hm(e.wake)||!hm(e.up))return 'hibás időpont';
          if(!int(e.lat,0,720)||!int(e.waso,0,720)||!int(e.q,1,5))return 'hibás érték';
          if(!Array.isArray(e.f)||e.f.length>FAC.length||!e.f.every(function(x){return FAC.indexOf(x)>-1}))return 'hibás tényezőlista';
          if(e.note!==undefined&&!str(e.note,500))return 'hibás megjegyzés';
          return Object.keys(e).every(function(x){return ['bed','off','wake','up','lat','waso','q','f','note'].indexOf(x)>-1})?null:'ismeretlen mező'})}
        return 'ismeretlen mező'})},
    'onismeret-konyvtar-v1':function(j){
      var ST=['want','doing','done'],ID=/^[a-z0-9-]{2,40}$/;
      return each(j,function(k,v){
        if(k==='list')return each(v,function(id,e){if(!ID.test(id))return 'hibás azonosító';if(!isObj(e)||ST.indexOf(e.s)<0||!iso(e.t))return 'hibás bejegyzés';
          if(e.note!==undefined&&!str(e.note,1000))return 'hibás jegyzet';return Object.keys(e).every(function(x){return ['s','t','note'].indexOf(x)>-1})?null:'ismeretlen mező'});
        if(k==='goal')return typeof v==='string'&&/^[a-z]{0,20}$/.test(v)?null:'hibás cél';
        if(k==='paths')return each(v,function(id,p){if(!ID.test(id))return 'hibás azonosító';if(!isObj(p)||!iso(p.start))return 'hibás kezdés';
          if(!Array.isArray(p.done)||p.done.length>30||!p.done.every(function(n){return typeof n==='number'&&n>=0&&n<30&&Math.floor(n)===n}))return 'hibás lépéslista';
          return Object.keys(p).every(function(x){return x==='start'||x==='done'})?null:'ismeretlen mező'});
        return 'ismeretlen mező'})},
    /* Csillagtérkép születési adatai (csillagok.html) */
    'onismeret-birth-v1':function(j){if(!isObj(j))return 'nem objektum';
      var F={name:function(v){return str(v,100)},date:function(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)},time:function(v){return v===''||(typeof v==='string'&&/^\d{2}:\d{2}$/.test(v))},
        noTime:function(v){return typeof v==='boolean'},place:function(v){return typeof v==='string'&&/^(man|\d{1,3})$/.test(v)},lat:function(v){return typeof v==='number'&&v>=-90&&v<=90},
        lon:function(v){return typeof v==='number'&&v>=-180&&v<=180},tz:function(v){return typeof v==='string'&&/^[A-Za-z_\/+-]{1,60}$/.test(v)},zone:function(v){return v==='offset'},
        offset:function(v){return typeof v==='number'&&v>=-14&&v<=14}};
      if(!F.date(j.date))return 'hibás dátum';
      return each(j,function(k,v){return F[k]?(F[k](v)?null:'hibás érték'):'ismeretlen mező'})},
    /* Fókusz-körök (fokusz.html): aktív kör és legfeljebb 20 lezárt */
    'onismeret-fokusz-v1':function(j){
      var RT=['done','part','no'];
      function round(o,closed){if(!isObj(o)||!iso(o.start))return 'hibás kezdés';if(closed&&!iso(o.end))return 'hibás zárás';
        if(!Array.isArray(o.items)||o.items.length>10)return 'hibás elemlista';
        for(var i=0;i<o.items.length;i++){var c=o.items[i];
          if(!isObj(c)||!str(c.key,200)||!str(c.title,500)||(c.kind!=null&&!str(c.kind,80))||(c.text!=null&&!str(c.text,4000))||(c.action!=null&&!str(c.action,2000)))return (i+1)+'. elem hibás';
          if(c.src!=null&&(!Array.isArray(c.src)||c.src.length>20||!c.src.every(function(s){return str(s,40)})))return (i+1)+'. elem forrása hibás';}
        if(o.checks!=null&&(!Array.isArray(o.checks)||o.checks.length>400))return 'hibás visszanézések';
        for(var x=0;x<(o.checks||[]).length;x++){var k=o.checks[x];
          if(!isObj(k)||!iso(k.t)||(k.note!=null&&!str(k.note,1000))||each(k.r,function(key,v){return str(key,200)&&RT.indexOf(v)>-1?null:'hibás értékelés'}))return (x+1)+'. visszanézés hibás';}
        return null}
      return each(j,function(k,v){
        if(k==='active')return round(v,false);
        if(k==='past'){if(!Array.isArray(v)||v.length>20)return 'hibás lista';for(var i=0;i<v.length;i++){var e=round(v[i],true);if(e)return (i+1)+'. kör: '+e;}return null}
        return 'ismeretlen mező'})},
    /* Válaszstílus-jelzések gyorstára (results-plus.js) */
    'onismeret-style-v1':function(j){var FL=['straight','extreme','middle'];
      return each(j,function(id,o){return testId(id)||(isObj(o)&&str(o.sid,40)&&iso(o.t)&&Array.isArray(o.f)&&o.f.length<=3&&o.f.every(function(x){return FL.indexOf(x)>-1})?null:'hibás jelzés')})},
    'onismeret-partner-v1':function(j){if(!isObj(j))return 'nem objektum';if(j.name!=null&&!str(j.name,40))return 'hibás név';if(!iso(j.loaded))return 'hibás dátum';
      return each(j.results,function(id,h){if(testId(id))return testId(id);if(!Array.isArray(h)||h.length>LIMIT)return 'hibás előzmény';for(var i=0;i<h.length;i++){var e=record(id,h[i]);if(e)return e;}return null})}
  };
  /* Válaszskálák egy tesztben: [{vals:[...], n:kérdésszám}], a leggyakoribb elöl */
  function scales(id){
    var it=items(id),by={};Object.keys(it).forEach(function(q){var v=it[q];if(!v.every(function(x){return typeof x==='number'}))return;var k=v.join(',');(by[k]=by[k]||{vals:v,n:0,qs:[]}).n++;by[k].qs.push(q);});
    return Object.keys(by).map(function(k){return by[k]}).sort(function(a,b){return b.n-a.n});
  }
  return {items:items,answersOf:answersOf,responses:responses,record:record,stored:stored,scales:scales,idOfKey:function(k){return BYKEY[k]||null}};
})();
