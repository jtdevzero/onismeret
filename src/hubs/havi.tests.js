/* Havi állapotfelmérés — WHO-5 (5), PSS-4 (4), CBI személyes kiégés (6), UCLA-3 (3), SCI-02 (2) = 20 kérdés.
   Egyetlen kitöltés, egyetlen mentett rekord ('pulse'), amely öt mutatót tárol; az eredmény a havi idővonal. */
const P_WHO=[{v:0,l:'egyszer sem'},{v:1,l:'néha'},{v:2,l:'az idő kevesebb mint felében'},{v:3,l:'az idő több mint felében'},{v:4,l:'az idő nagy részében'},{v:5,l:'mindig'}];
const P_PSS=[{v:0,l:'soha'},{v:1,l:'szinte soha'},{v:2,l:'néha'},{v:3,l:'elég gyakran'},{v:4,l:'nagyon gyakran'}];
const P_CBI=[{v:0,l:'soha / szinte soha'},{v:25,l:'ritkán'},{v:50,l:'néha'},{v:75,l:'gyakran'},{v:100,l:'mindig'}];
const P_UCLA=[{v:1,l:'szinte soha'},{v:2,l:'néha'},{v:3,l:'gyakran'}];
const P_HELP='<p>Ha most nagyon nehéz: <strong>Lelki Elsősegély Telefonszolgálat, <a href="tel:116123">116-123</a></strong> (ingyenes, éjjel-nappal, névtelenül hívható). Közvetlen veszélyben: <a href="tel:112">112</a>.</p>';

/* mutatók: kulcs, név, tartomány, irány (+1: magasabb = jobb), hol érdemes mélyebben megnézni */
const PULSE_M=[
  {k:'who5',n:'Jóllét',min:0,max:100,dir:1,link:'jollet.html#test-who5',fmt:v=>String(v)},
  {k:'pss4',n:'Stressz',min:0,max:16,dir:-1,link:'jollet.html#test-pss',fmt:v=>String(v)},
  {k:'cbiP',n:'Kimerültség',min:0,max:100,dir:-1,link:'jollet.html#test-cbi',fmt:v=>String(v)},
  {k:'ucla',n:'Magányosság',min:3,max:9,dir:-1,link:'ertelem.html#test-ucla',fmt:v=>String(v)},
  {k:'sleep',n:'Alvás',min:0,max:8,dir:1,link:'alvas.html#test-sci',fmt:v=>String(v)}];

/* havi emlékeztető naptárfájlként (minden hónap ugyanazon a napján) */
window.PULSE_ICS=function(){
  const d=new Date();d.setDate(d.getDate()+30);d.setHours(19,0,0,0);
  const p=n=>String(n).padStart(2,'0'),dt=x=>x.getFullYear()+p(x.getMonth()+1)+p(x.getDate())+'T'+p(x.getHours())+p(x.getMinutes())+'00';
  const e=new Date(d.getTime()+15*60000);
  const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Onismereti terkepek//HU','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
    'UID:havi-allapot-'+Date.now()+'@onismeret','DTSTAMP:'+dt(new Date()),'DTSTART:'+dt(d),'DTEND:'+dt(e),'RRULE:FREQ=MONTHLY',
    'SUMMARY:Havi állapotfelmérés (5 perc)','DESCRIPTION:Önismereti térképek – havi állapotfelmérés: '+location.href.split('#')[0],
    'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Havi állapotfelmérés','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/calendar;charset=utf-8'}));a.download='havi-allapotfelmeres.ics';
  (document.querySelector('main')||document.body).appendChild(a);a.click();a.remove();
};

(function(){
makeTest({
  id:'pulse',key:'pulse-responses-v1',renewAfterDays:20,name:'Havi állapotfelmérés',c1:'#10b981',c2:'#2563eb',
  tab:'Havi állapot',tabSub:'20 kérdés',scale:P_WHO,
  header:{status:'valid',statusText:'Validált rövid skálák összeállítása',
    eyebrow:'WHO-5 · PSS-4 · CBI személyes · UCLA-3 · SCI-02',
    title:'Havi <em style="color:#10b981">állapotkép</em>',
    lead:'Húsz kérdés öt területről. Nem diagnózis, hanem havi pillanatkép: az a hasznos benne, hogyan változik hónapról hónapra.',
    intro:'<p><strong>Kitöltés:</strong> minden blokk elején ott áll, melyik időszakra gondolj (két hét, egy hónap vagy az utóbbi idő). Kb. 5 perc.</p><p>Ha valamelyik mutató tartósan rossz irányba megy, az eredmény jelzi, és megmutatja, melyik részletes teszt segít tovább.</p>'},
  sections:[
    {title:'Jóllét · <em>az elmúlt két hét</em>',desc:'WHO-5',items:[
      {s:'W',t:'Jókedvű és vidám voltam.'},
      {s:'W',t:'Nyugodt és ellazult voltam.'},
      {s:'W',t:'Aktívnak és energikusnak éreztem magam.'},
      {s:'W',t:'Frissen és kipihenten ébredtem.'},
      {s:'W',t:'A mindennapjaim tele voltak olyan dolgokkal, amelyek érdekeltek.'}]},
    {title:'Stressz · <em>az elmúlt hónap</em>',desc:'PSS-4 · Milyen gyakran…',items:[
      {s:'S',scale:P_PSS,t:'…érezted úgy, hogy nem tudod irányítani az életed fontos dolgait?'},
      {s:'S',scale:P_PSS,r:true,t:'…voltál biztos abban, hogy meg tudod oldani a személyes problémáidat?'},
      {s:'S',scale:P_PSS,r:true,t:'…érezted úgy, hogy a dolgok a kedved szerint alakulnak?'},
      {s:'S',scale:P_PSS,t:'…érezted úgy, hogy a nehézségek annyira felhalmozódtak, hogy nem tudod leküzdeni őket?'}]},
    {title:'Kimerültség · <em>az utóbbi idő</em>',desc:'Koppenhágai kiégés-kérdőív, személyes alskála',items:[
      {s:'B',scale:P_CBI,t:'Milyen gyakran érzed magad fáradtnak?'},
      {s:'B',scale:P_CBI,t:'Milyen gyakran vagy fizikailag kimerült?'},
      {s:'B',scale:P_CBI,t:'Milyen gyakran vagy érzelmileg kimerült?'},
      {s:'B',scale:P_CBI,t:'Milyen gyakran gondolod azt, hogy „ezt már nem bírom tovább”?'},
      {s:'B',scale:P_CBI,t:'Milyen gyakran érzed magad elcsigázottnak?'},
      {s:'B',scale:P_CBI,t:'Milyen gyakran érzed magad gyengének és betegségre hajlamosnak?'}]},
    {title:'Kapcsolódás · <em>az utóbbi idő</em>',desc:'UCLA-3 · Milyen gyakran érzed…',items:[
      {s:'L',scale:P_UCLA,t:'…hogy hiányzik a társaság?'},
      {s:'L',scale:P_UCLA,t:'…hogy kimaradsz, nem vesznek be?'},
      {s:'L',scale:P_UCLA,t:'…hogy elszigetelt vagy másoktól?'}]},
    {title:'Alvás · <em>az elmúlt hónap</em>',desc:'SCI rövid változat',items:[
      {s:'Z',t:'Hetente hány éjszakán van gondod az alvással?',opts:[{t:'0–1',v:4},{t:'2',v:3},{t:'3',v:2},{t:'4',v:1},{t:'5–7',v:0}]},
      {s:'Z',t:'Mennyire zavart általában a rossz alvás?',opts:[{t:'egyáltalán nem',v:4},{t:'kicsit',v:3},{t:'valamennyire',v:2},{t:'nagyon',v:1},{t:'rendkívül',v:0}]}]}],
  score(R){
    const sleep=H.sum(R.items.filter(i=>i.n>=19).map(i=>i.raw||0));
    return {who5:R.sum('W')*4,pss4:R.sum('S'),cbiP:H.r1(R.mean('B')),ucla:R.sum('L'),sleep};
  },
  sum(s){
    const worst=PULSE_M.map(m=>({m,bad:m.dir>0?(m.max-s[m.k])/(m.max-m.min):(s[m.k]-m.min)/(m.max-m.min)})).sort((a,b)=>b.bad-a.bad)[0];
    return {h:'Jóllét '+s.who5+' · stressz '+s.pss4+' · legnagyobb terhelés: '+worst.m.n.toLowerCase(),
      d:Object.fromEntries(PULSE_M.map(m=>[m.k,[m.n,s[m.k],m.min,m.max]]))};
  },
  render(R,s){
    const hist=((window.ONI&&ONI.all().pulse)||[]).filter(r=>r.d&&r.d.who5);
    const fmtD=t=>new Date(t).toLocaleDateString('hu-HU',{month:'short',day:'numeric'});
    const val=(r,k)=>r.d[k]?r.d[k][1]:null;
    const prev=hist.length>1?hist[hist.length-2]:null;
    const spark=(m)=>{const pts=hist.slice(-12).map(r=>val(r,m.k));if(pts.length<2)return '';
      const W=120,Hh=28,x=i=>i*(W/(pts.length-1)),y=v=>Hh-2-((v-m.min)/(m.max-m.min))*(Hh-4);
      return `<svg class="pulse-spark" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${m.n} az utolsó ${pts.length} kitöltésben: ${pts.join(', ')}"><polyline fill="none" stroke="currentColor" stroke-width="2" points="${pts.map((v,i)=>x(i)+','+y(v)).join(' ')}"/><circle cx="${x(pts.length-1)}" cy="${y(pts[pts.length-1])}" r="3" fill="currentColor"/></svg>`;};
    const rows=PULSE_M.map(m=>{
      const v=s[m.k],pv=prev?val(prev,m.k):null,delta=pv===null?null:Math.round((v-pv)*10)/10;
      const good=delta===null||delta===0?null:(delta*m.dir>0);
      const pctBad=m.dir>0?(m.max-v)/(m.max-m.min):(v-m.min)/(m.max-m.min);
      const col=pctBad>=0.66?'#e11d48':pctBad>=0.4?'#f59e0b':'#10b981';
      return `<div class="pulse-row" style="--pc:${col}"><div class="pulse-name"><a href="${m.link}">${m.n}</a></div>
        <div class="pulse-val">${m.fmt(v)}<span>${m.min}–${m.max}</span></div>
        <div class="pulse-delta ${good===null?'':good?'up':'down'}">${delta===null?'első mérés':(delta>0?'+':'')+delta+(good===null?'':good?' ▲ javult':' ▼ romlott')}</div>
        <div class="pulse-trend">${spark(m)}</div></div>`;}).join('');
    /* tartós romlás: ugyanaz a mutató két egymást követő kitöltésben rossz irányba ment */
    const warn=[];
    if(hist.length>=3){const [a,b,c]=hist.slice(-3);PULSE_M.forEach(m=>{const x=val(a,m.k),y=val(b,m.k),z=val(c,m.k);if(x!==null&&y!==null&&z!==null&&(y-x)*m.dir<0&&(z-y)*m.dir<0)warn.push(m);});}
    const crit=s.who5<=28;
    return `<div class="res-eyebrow">Eredmény · havi állapotkép</div>
      <h2 class="res-title"><em>${hist.length>1?hist.length+'. havi mérés':'Első havi mérés'}</em></h2>
      <p class="res-lead">${prev?'Az előző mérés: '+fmtD(prev.done||prev.t).replace(/\.$/,'')+'. A nyilak az ahhoz képest történt változást mutatják.':'Ez az első kitöltésed. A következő hónaptól az idővonal megmutatja a változást.'}</p>
      ${crit?H.callout('<p><strong>Fontos.</strong> A jóllét-mutatód 28 vagy alatta van: ez erősen csökkent jóllétet jelez. Érdemes kitölteni a PHQ-9-et (Hangulat és figyelem), és beszélni róla háziorvossal vagy pszichológussal.</p>'+P_HELP,'#fb7185'):''}
      ${warn.length?H.callout('<p><strong>Tartós változás.</strong> Két egymást követő mérésben romlott: '+warn.map(m=>`<a href="${m.link}">${m.n.toLowerCase()}</a>`).join(', ')+'. Érdemes a részletes tesztet is kitölteni, és megnézni, mi változott az életedben.</p>','#f59e0b'):''}
      <div class="chart-card pulse-card"><h3>Öt <em>mutató</em></h3><div class="chart-sub">a név a részletes tesztre visz · a görbe az utolsó 12 mérés</div>${rows}</div>
      ${H.interp('Mit <em>kezdj vele</em>',[
        {h:'Ha egy mutató kiugrik',html:'<p>A pirossal jelölt mutatóknál a legnagyobb a terhelés. Kattints a nevére: a részletes teszt mélyelemzése konkrét lépéseket ad. Egyszerre egy területtel foglalkozz.</p>'},
        {h:'Havi ritmus',html:'<p>A változás hónapos léptékű: egy-egy jobb vagy rosszabb hónap természetes. Ami számít, az a 2–3 hónapon át tartó irány. Tölts ki minden hónapban nagyjából ugyanakkor.</p><p><button type="button" class="btn-secondary" onclick="PULSE_ICS()">Havi emlékeztető a naptárba (.ics)</button></p>'}
      ])}
      ${H.refs(['<strong>Topp, C. W., és mtsai (2015).</strong> The WHO-5 Well-Being Index: A systematic review. <em>Psychotherapy and Psychosomatics, 84</em>(3), 167–176.',
        '<strong>Cohen, S., Kamarck, T., & Mermelstein, R. (1983).</strong> A global measure of perceived stress. <em>Journal of Health and Social Behavior, 24</em>(4), 385–396.',
        '<strong>Kristensen, T. S., és mtsai (2005).</strong> The Copenhagen Burnout Inventory. <em>Work & Stress, 19</em>(3), 192–207.',
        '<strong>Hughes, M. E., és mtsai (2004).</strong> A short scale for measuring loneliness in large surveys. <em>Research on Aging, 26</em>(6), 655–672.',
        '<strong>Espie, C. A., és mtsai (2014).</strong> The Sleep Condition Indicator. <em>BMJ Open, 4</em>(3), e004183.'])}`;
  }
});
})();
