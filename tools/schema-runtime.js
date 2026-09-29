/* ── Séma-alapú segédfüggvények (a tools/schema-runtime.js-ből másolva) ── */
window.ONI_CHECK=(function(){
  var S=window.ONI_SCHEMA,BYKEY={},CACHE={};
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
    if(r.d!=null){if(!isObj(r.d))return 'hibás skálák';
      var ks=Object.keys(r.d);for(var i=0;i<ks.length;i++){var d=r.d[ks[i]];
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
        if(!Array.isArray(h)||h.length>50)return id+': hibás előzmény';
        for(var x=0;x<h.length;x++){var e=record(id,h[x]);if(e)return id+' '+(x+1)+'. eredmény: '+e;}}
      return null;
    }
    return isObj(j)||Array.isArray(j)?null:'nem objektum';
  }
  /* Válaszskálák egy tesztben: [{vals:[...], n:kérdésszám}], a leggyakoribb elöl */
  function scales(id){
    var it=items(id),by={};Object.keys(it).forEach(function(q){var v=it[q];if(!v.every(function(x){return typeof x==='number'}))return;var k=v.join(',');(by[k]=by[k]||{vals:v,n:0,qs:[]}).n++;by[k].qs.push(q);});
    return Object.keys(by).map(function(k){return by[k]}).sort(function(a,b){return b.n-a.n});
  }
  return {items:items,answersOf:answersOf,responses:responses,record:record,stored:stored,scales:scales,idOfKey:function(k){return BYKEY[k]||null}};
})();
