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
