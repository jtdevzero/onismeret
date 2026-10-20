/* XII. Jóllét és stressz — WHO-5, PSS-10, Koppenhágai kiégés-kérdőív (CBI), Rövid reziliencia-skála (BRS).
   Mind szabadon használható, validált eszköz; a magyar szöveg saját fordítás. */
const WHO5_SCALE=[{v:0,l:'egyszer sem'},{v:1,l:'néha'},{v:2,l:'az idő kevesebb mint felében'},{v:3,l:'az idő több mint felében'},{v:4,l:'az idő nagy részében'},{v:5,l:'mindig'}];
const PSS_SCALE=[{v:0,l:'soha'},{v:1,l:'szinte soha'},{v:2,l:'néha'},{v:3,l:'elég gyakran'},{v:4,l:'nagyon gyakran'}];
const CBI_FREQ=[{v:0,l:'soha / szinte soha'},{v:25,l:'ritkán'},{v:50,l:'néha'},{v:75,l:'gyakran'},{v:100,l:'mindig'}];
const CBI_DEG=[{v:0,l:'nagyon kis mértékben'},{v:25,l:'kis mértékben'},{v:50,l:'közepesen'},{v:75,l:'nagy mértékben'},{v:100,l:'nagyon nagy mértékben'}];
const BRS_SCALE=[{v:1,l:'egyáltalán nem értek egyet'},{v:2,l:'nem értek egyet'},{v:3,l:'semleges'},{v:4,l:'egyetértek'},{v:5,l:'teljesen egyetértek'}];
const HELP_LINE='<p>Ha most nagyon nehéz: <strong>Lelki Elsősegély Telefonszolgálat, <a href="tel:116123">116-123</a></strong> (ingyenes, éjjel-nappal, névtelenül hívható). Közvetlen veszélyben: <a href="tel:112">112</a>.</p>';

/* ═══════════ 1. WHO-5 — JÓLLÉT ═══════════ */
(function(){
/* nyers pontszám 0–25, ×4 = 0–100. ≤50 (nyers <13) gyenge jóllét; ≤28 (nyers ≤7) esetén depresszió-szűrés javasolt (Topp és mtsai, 2015) */
const band=p=>p<=28?{l:'Nagyon alacsony jóllét',c:'#e11d48'}:p<=48?{l:'Alacsony jóllét',c:'#f59e0b'}:p<=72?{l:'Közepes jóllét',c:'#60a5fa'}:{l:'Jó közérzet',c:'#34d399'};
makeTest({
  id:'who5',key:'who5-responses-v1',name:'Jóllét (WHO-5)',c1:'#10b981',c2:'#d4a017',
  tab:'Közérzet',tabSub:'WHO-5 · 5 item',scale:WHO5_SCALE,
  header:{status:'valid',statusText:'Validált skála · WHO (1998), Topp és mtsai (2015)',
    eyebrow:'WHO-5 Well-Being Index · World Health Organization',
    title:'Milyen most a <em style="color:#10b981">közérzeted</em>',
    lead:'Öt kérdés az elmúlt két hétről: mennyire voltál jókedvű, nyugodt, energikus, kipihent, és mennyire voltak a napjaid érdekesek. A világ egyik legtöbbet használt jóllét-mérője; a kutatások szerint érzékenyen jelzi a lehangoltságot is.',
    intro:'<p><strong>Kitöltés:</strong> az elmúlt <strong>két hétre</strong> gondolva, mennyire igazak rád az alábbi állítások?</p><p>Eredmény: 0–100 (a nyers pontszám négyszerese). 50 alatt gyenge jóllétről, 28 vagy alatta erősen csökkent jóllétről beszélünk, ilyenkor érdemes a PHQ-9 kérdőívet is kitölteni.</p>'},
  sections:[{title:'Az elmúlt <em>két hét</em>',desc:'',items:[
    {s:'p',t:'Jókedvű és vidám voltam.'},
    {s:'p',t:'Nyugodt és ellazult voltam.'},
    {s:'p',t:'Aktívnak és energikusnak éreztem magam.'},
    {s:'p',t:'Frissen és kipihenten ébredtem.'},
    {s:'p',t:'A mindennapjaim tele voltak olyan dolgokkal, amelyek érdekeltek.'}]}],
  score(R){const raw=R.sum('p'),pct=raw*4;return {raw,total:pct,band:band(pct).l};},
  sum(s){return {h:s.band,d:{total:['Jóllét (WHO-5)',s.total,0,100]}};},
  render(R,s){
    const b=band(s.total),low=R.items.filter(i=>i.raw<=2).sort((a,c)=>a.raw-c.raw).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · WHO-5</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Jóllét-index: <strong>${s.total}</strong> / 100 (nyers pontszám: ${s.raw} / 25).</p>
      ${H.chart('Jóllét','0–100 · határok: 28 és 50',H.gauge({name:'WHO-5',sub:b.l,val:s.total,unit:'/ 100',min:0,max:100,color:b.c,zones:[{from:0,to:30,color:'rgba(225,29,72,0.22)'},{from:30,to:50,color:'rgba(245,158,11,0.2)'},{from:50,to:100,color:'rgba(52,211,153,0.2)'}],labels:['0','28','50','100']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total<=28?'<p>Az elmúlt két hét nagyon nehéz volt: kevés öröm, kevés energia, kevés pihenés. A WHO-5 ennél az értéknél azt javasolja, hogy nézzük meg a lehangoltságot is: töltsd ki a PHQ-9-et, és ha hetek óta így érzed, beszélj róla háziorvossal vagy pszichológussal.</p>'+HELP_LINE:s.total<=48?'<p>A közérzeted most az átlagosnál gyengébb. Ez lehet egy kimerítő időszak lenyomata (munka, alváshiány, betegség, veszteség), de ha tartósan így marad, érdemes megnézni, mi húzza le.</p>':s.total<=72?'<p>Közepes jóllét: vannak jó napjaid, de nem minden területen töltődsz. Érdemes megnézni, melyik állítás a leggyengébb, ott van a legnagyobb mozgástér.</p>':'<p>Az elmúlt két hétben jól voltál: volt energiád, nyugalmad és érdeklődésed. Ez jó kiindulópont; érdemes tudatosítani, mi tartja így.</p>'},
        low.length?{h:'Ami most a leginkább hiányzik',html:low.map(i=>`<p>„${i.t}” — <strong>${WHO5_SCALE[i.raw].l}</strong></p>`).join('')}:null
      ])}
      ${H.refs(['<strong>Topp, C. W., Østergaard, S. D., Søndergaard, S., & Bech, P. (2015).</strong> The WHO-5 Well-Being Index: A systematic review of the literature. <em>Psychotherapy and Psychosomatics, 84</em>(3), 167–176.',
        '<strong>World Health Organization (1998).</strong> <em>Wellbeing Measures in Primary Health Care: The DepCare Project.</em> WHO Regional Office for Europe.'])}`;
  }
});
})();

/* ═══════════ 2. PSS-10 — ÉSZLELT STRESSZ ═══════════ */
(function(){
const band=t=>t>=27?{l:'Magas észlelt stressz',c:'#e11d48'}:t>=14?{l:'Közepes észlelt stressz',c:'#f59e0b'}:{l:'Alacsony észlelt stressz',c:'#34d399'};
makeTest({
  id:'pss',key:'pss10-responses-v1',name:'Észlelt stressz (PSS-10)',c1:'#f59e0b',c2:'#e11d48',
  tab:'Stressz',tabSub:'PSS-10 · 10 item',scale:PSS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Cohen, Kamarck & Mermelstein (1983)',
    eyebrow:'Perceived Stress Scale · Sheldon Cohen',
    title:'Mennyire érzed <em style="color:#f59e0b">túlterheltnek</em> magad',
    lead:'A PSS nem azt méri, mennyi stresszes esemény ért, hanem azt, hogy <strong>mennyire élted meg kiszámíthatatlannak, kontrollálhatatlannak és túl soknak</strong> az életedet az elmúlt hónapban. Ugyanaz a helyzet az egyiknek kihívás, a másiknak túlterhelés.',
    intro:'<p><strong>Kitöltés:</strong> az elmúlt <strong>hónapban</strong> milyen gyakran érezted vagy gondoltad az alábbiakat? Négy kérdés fordított pontozású.</p><p>Összpontszám: 0–40. Gyakran használt tájékozódó sávok: 0–13 alacsony, 14–26 közepes, 27–40 magas észlelt stressz.</p>'},
  sections:[{title:'Az elmúlt <em>hónap</em>',desc:'Milyen gyakran…',items:[
    {s:'h',t:'…voltál felzaklatott valami váratlan esemény miatt?'},
    {s:'h',t:'…érezted úgy, hogy nem tudod irányítani az életed fontos dolgait?'},
    {s:'h',t:'…érezted magad idegesnek és stresszesnek?'},
    {s:'e',t:'…voltál biztos abban, hogy meg tudod oldani a személyes problémáidat?',r:true},
    {s:'e',t:'…érezted úgy, hogy a dolgok a kedved szerint alakulnak?',r:true},
    {s:'h',t:'…érezted úgy, hogy nem tudsz megbirkózni mindazzal, amit el kellett végezned?'},
    {s:'e',t:'…tudtad kezelni az életedben előforduló bosszúságokat?',r:true},
    {s:'e',t:'…érezted úgy, hogy ura vagy a helyzetnek?',r:true},
    {s:'h',t:'…dühített fel valami, ami rajtad kívül álló okból történt?'},
    {s:'h',t:'…érezted úgy, hogy a nehézségek annyira felhalmozódtak, hogy nem tudod leküzdeni őket?'}]}],
  score(R){const h=R.sum('h'),e=R.sum('e'),t=h+e;return {total:t,H:h,E:e,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Észlelt stressz (PSS-10)',s.total,0,40],H:['Tehetetlenség-érzés',s.H,0,24],E:['Megküzdési bizalom hiánya',s.E,0,16]}};},
  render(R,s){
    const b=band(s.total),top=R.items.filter(i=>i.v>=3).sort((a,c)=>c.v-a.v).slice(0,3);
    const which=s.H/24>s.E/16+0.15?'h':s.E/16>s.H/24+0.15?'e':'=';
    return `<div class="res-eyebrow">Eredmény · PSS-10</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">PSS-10 összpontszám: <strong>${s.total}</strong> / 40.</p>
      ${H.chart('Észlelt stressz','0–40 · tájékozódó sávok: 14 és 27',H.gauge({name:'PSS-10',sub:b.l,val:s.total,unit:'/ 40',min:0,max:40,color:b.c,zones:[{from:0,to:13.5,color:'rgba(52,211,153,0.2)'},{from:13.5,to:26.5,color:'rgba(245,158,11,0.2)'},{from:26.5,to:40,color:'rgba(225,29,72,0.22)'}],labels:['0','14','27','40']}))}
      ${H.bars('Két <em>összetevő</em>',[{title:'',color:b.c,rows:[
        {name:'Tehetetlenség-érzés <span style="color:var(--ink-lite-muted);font-size:12px">· 6 kérdés</span>',val:s.H,unit:'/24',pct:s.H/24*100,color:'#e11d48'},
        {name:'Megküzdési bizalom hiánya <span style="color:var(--ink-lite-muted);font-size:12px">· 4 kérdés, fordítva</span>',val:s.E,unit:'/16',pct:s.E/16*100,color:'#f59e0b'}]}])}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=27?'<p>Az elmúlt hónapot túl soknak és nehezen kontrollálhatónak élted meg. Tartósan ez kimeríti a szervezetet (alvás, immunrendszer, koncentráció), ezért érdemes most terhet levenni, nem újat vállalni. Ha ehhez szorongás vagy lehangoltság is társul, beszélj róla szakemberrel.</p>':s.total>=14?'<p>Közepes stressz: a felnőttek nagy része ebben a sávban van. Vannak helyzetek, amelyek túl soknak tűnnek, de összességében még tartod a lépést.</p>':'<p>Az elmúlt hónapban az életed többnyire kiszámíthatónak és kezelhetőnek tűnt. Ez jó erőforrás a nehezebb időszakokra.</p>'},
        which==='='?null:{h:which==='h'?'Inkább a tehetetlenség-érzés emeli':'Inkább a megküzdési bizalom hiánya emeli',html:which==='h'?'<p>A pontszámodat főleg az emeli, hogy a dolgok kontrollálhatatlannak és túl soknak tűnnek. Ilyenkor a legtöbbet az segít, ami visszaadja a kontroll érzését: a teendők leírása, a legfontosabb egy-két dolog kiválasztása, és a nem a te kezedben lévő ügyek tudatos elengedése.</p>':'<p>A pontszámodat főleg az emeli, hogy kevésbé bízol a saját megküzdésedben. Ilyenkor az segít, ha kicsi, végigvihető feladatokkal újra tapasztalatot szerzel arról, hogy megoldod a dolgokat (lásd még: GSE az Önbizalom témakörben).</p>'},
        top.length?{h:'A legerősebb jelzések',html:top.map(i=>`<p>„${i.t}” — <strong>${PSS_SCALE[i.raw].l}</strong></p>`).join('')}:null
      ])}
      ${H.refs(['<strong>Cohen, S., Kamarck, T., & Mermelstein, R. (1983).</strong> A global measure of perceived stress. <em>Journal of Health and Social Behavior, 24</em>(4), 385–396.',
        '<strong>Cohen, S., & Williamson, G. (1988).</strong> Perceived stress in a probability sample of the United States. In S. Spacapan & S. Oskamp (Eds.), <em>The social psychology of health</em> (pp. 31–67). Sage.'])}`;
  }
});
})();

/* ═══════════ 3. CBI — KOPPENHÁGAI KIÉGÉS-KÉRDŐÍV ═══════════ */
(function(){
const band=m=>m>=75?{l:'Magas',c:'#e11d48'}:m>=50?{l:'Közepes',c:'#f59e0b'}:{l:'Alacsony',c:'#34d399'};
makeTest({
  id:'cbi',key:'cbi-responses-v1',name:'Kiégés (CBI)',c1:'#e11d48',c2:'#7c3aed',
  tab:'Kiégés',tabSub:'CBI · 13 item',scale:CBI_FREQ,
  header:{status:'valid',statusText:'Validált skála · Kristensen és mtsai (2005)',
    eyebrow:'Copenhagen Burnout Inventory · személyes és munkához kötött kiégés',
    title:'Mennyire <em style="color:#e11d48">merültél ki</em>',
    lead:'A Koppenhágai kiégés-kérdőív a kiégést a tartós testi és lelki kimerültségként határozza meg, és külön méri, mennyire vagy kimerült <strong>általában</strong>, és mennyire <strong>a munkád miatt</strong>. A különbség sokat elárul: máshol van a teendő, ha a munka merít le, és máshol, ha minden.',
    intro:'<p><strong>Kitöltés:</strong> az utóbbi időre gondolva válaszolj. A munkára vonatkozó kérdéseknél a vállalkozói munka, a tanulás vagy a fő elfoglaltságod is munkának számít.</p><p>Eredmény: alskálánként 0–100 átlag. 50 felett közepes, 75 felett magas kiégésről beszélünk.</p>'},
  sections:[
    {title:'Személyes <em>kiégés</em>',desc:'Általános testi és lelki kimerültség, a munkától függetlenül.',items:[
      {s:'P',t:'Milyen gyakran érzed magad fáradtnak?'},
      {s:'P',t:'Milyen gyakran vagy fizikailag kimerült?'},
      {s:'P',t:'Milyen gyakran vagy érzelmileg kimerült?'},
      {s:'P',t:'Milyen gyakran gondolod azt, hogy „ezt már nem bírom tovább”?'},
      {s:'P',t:'Milyen gyakran érzed magad elcsigázottnak?'},
      {s:'P',t:'Milyen gyakran érzed magad gyengének és betegségre hajlamosnak?'}]},
    {title:'Munkához kötött <em>kiégés</em>',desc:'Az a kimerültség, amelyet a munkádnak tulajdonítasz.',items:[
      {s:'W',t:'Érzelmileg kimerítő a munkád?',scale:CBI_DEG},
      {s:'W',t:'Kiégettnek érzed magad a munkád miatt?',scale:CBI_DEG},
      {s:'W',t:'Frusztrál a munkád?',scale:CBI_DEG},
      {s:'W',t:'Milyen gyakran érzed magad elcsigázottnak a munkanap végén?'},
      {s:'W',t:'Milyen gyakran vagy kimerült már reggel, ha egy újabb munkanapra gondolsz?'},
      {s:'W',t:'Milyen gyakran érzed úgy, hogy minden munkaóra fárasztó számodra?'},
      {s:'W',t:'Milyen gyakran van elég energiád a családra és a barátokra a szabadidődben?',r:true}]}],
  score(R){const P=H.r1(R.mean('P')),W=H.r1(R.mean('W'));return {P,W,band:band(Math.max(P,W)).l};},
  sum(s){return {h:'Személyes: '+band(s.P).l.toLowerCase()+' · munkához kötött: '+band(s.W).l.toLowerCase(),d:{P:['Személyes kiégés',s.P,0,100],W:['Munkához kötött kiégés',s.W,0,100]}};},
  render(R,s){
    const bp=band(s.P),bw=band(s.W),hi=Math.max(s.P,s.W);
    const diff=s.W-s.P;
    return `<div class="res-eyebrow">Eredmény · Koppenhágai kiégés-kérdőív</div>
      <h2 class="res-title"><em>${hi>=75?'Magas kiégés':hi>=50?'Közepes kiégés':'Alacsony kiégés'}</em></h2>
      <p class="res-lead">Személyes kiégés: <strong>${s.P}</strong> · munkához kötött kiégés: <strong>${s.W}</strong> (0–100).</p>
      ${H.chart('Két terület','0–100 · határok: 50 és 75',
        H.gauge({name:'Személyes kiégés',sub:bp.l,val:s.P,unit:'/ 100',min:0,max:100,color:bp.c,zones:[{from:0,to:50,color:'rgba(52,211,153,0.2)'},{from:50,to:75,color:'rgba(245,158,11,0.2)'},{from:75,to:100,color:'rgba(225,29,72,0.22)'}],labels:['0','50','75','100']})+
        H.gauge({name:'Munkához kötött kiégés',sub:bw.l,val:s.W,unit:'/ 100',min:0,max:100,color:bw.c,zones:[{from:0,to:50,color:'rgba(52,211,153,0.2)'},{from:50,to:75,color:'rgba(245,158,11,0.2)'},{from:75,to:100,color:'rgba(225,29,72,0.22)'}],labels:['0','50','75','100']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:(hi>=75?'#e11d48':hi>=50?'#f59e0b':'#34d399'),html:hi>=75?'<p>Erős, tartós kimerültség. Ezen a szinten a pihenés már nem elég magától: a terhelést kell csökkenteni (feladatok, órák, felelősség), és érdemes orvossal is átnézni az alvást, a vérképet, a pajzsmirigyet. Ha lehangoltság vagy reménytelenség is társul, keress szakembert.</p>'+HELP_LINE:hi>=50?'<p>Közepes kiégés: a tartalékaid fogynak. Ez az a pont, ahol még kis változtatásokkal (alvás, határok, szünetek) jól vissza lehet fordítani a folyamatot.</p>':'<p>Alacsony kiégés: a terhelés és a feltöltődés most nagyjából egyensúlyban van.</p>'},
        Math.abs(diff)>=15?{h:diff>0?'A munka merít le jobban':'Nem csak a munka merít le',html:diff>0?'<p>A munkához kötött kimerültséged jóval magasabb a személyesnél. A teendő ilyenkor elsősorban a munkában van: terhelés, határok (meddig vagy elérhető), kontroll (mennyire döntesz a saját munkádról), és az, hogy mennyi benne az értelmes rész.</p>':'<p>A személyes kimerültséged magasabb a munkához kötöttnél. A forrás valószínűleg a munkán kívül is van: alvás, egészség, magánéleti terhek, gondoskodás másokról. Érdemes ezeket is felírni.</p>'}:null
      ])}
      ${H.refs(['<strong>Kristensen, T. S., Borritz, M., Villadsen, E., & Christensen, K. B. (2005).</strong> The Copenhagen Burnout Inventory: A new tool for the assessment of burnout. <em>Work & Stress, 19</em>(3), 192–207.'])}`;
  }
});
})();

/* ═══════════ 4. BRS — RÖVID REZILIENCIA-SKÁLA ═══════════ */
(function(){
const band=m=>m>4.3?{l:'Magas reziliencia',c:'#34d399'}:m>=3?{l:'Átlagos reziliencia',c:'#60a5fa'}:{l:'Alacsony reziliencia',c:'#f59e0b'};
makeTest({
  id:'brs',key:'brs-responses-v1',name:'Reziliencia (BRS)',c1:'#2563eb',c2:'#10b981',
  tab:'Reziliencia',tabSub:'BRS · 6 item',scale:BRS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Smith és mtsai (2008)',
    eyebrow:'Brief Resilience Scale · Smith, Dalen, Wiggins, Tooley, Christopher & Bernard (2008)',
    title:'Milyen gyorsan <em style="color:#60a5fa">állsz talpra</em>',
    lead:'A BRS a reziliencia legszűkebb, legmérhetőbb jelentését vizsgálja: <strong>mennyire gyorsan jössz helyre</strong> egy stresszes esemény vagy kudarc után. Nem azt, hogy mennyire vagy erős, hanem hogy mennyire rugalmas.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal? Három állítás fordított pontozású.</p><p>Eredmény: 1–5 átlag. A szerzők tájékozódó sávjai: 3,00 alatt alacsony, 3,00–4,30 átlagos, 4,30 felett magas.</p>'},
  sections:[{title:'6 állítás',desc:'',items:[
    {s:'p',t:'Nehéz időszakok után általában gyorsan talpra állok.'},
    {s:'p',t:'Nehezen vészelem át a stresszes eseményeket.',r:true},
    {s:'p',t:'Nem tart sokáig, hogy helyrejöjjek egy stresszes esemény után.'},
    {s:'p',t:'Nehezen jövök helyre, ha valami rossz történik.',r:true},
    {s:'p',t:'A nehéz időszakokon általában különösebb gond nélkül jutok át.'},
    {s:'p',t:'Hosszú időbe telik, mire túlteszem magam az életem kudarcain.',r:true}]}],
  score(R){const m=H.r2(R.mean('p'));return {total:m,band:band(m).l};},
  sum(s){return {h:s.band,d:{total:['Reziliencia (BRS)',s.total,1,5]}};},
  render(R,s){
    const b=band(s.total);
    return `<div class="res-eyebrow">Eredmény · BRS</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 5.</p>
      ${H.chart('Reziliencia','1–5 · sávhatárok: 3,00 és 4,30',H.gauge({name:'BRS',sub:b.l,val:s.total,shown:s.total.toFixed(2),unit:'/ 5',min:1,max:5,color:b.c,zones:[{from:1,to:3,color:'rgba(245,158,11,0.2)'},{from:3,to:4.3,color:'rgba(96,165,250,0.2)'},{from:4.3,to:5,color:'rgba(52,211,153,0.22)'}],labels:['1','3','4,3','5']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>4.3?'<p>Gyorsan helyrejössz a nehéz helyzetek után. Ez erős védőtényező a kiégés és a lehangoltság ellen. Érdemes azonban figyelni, hogy a gyors talpra állás ne a nehéz érzések átugrása legyen.</p>':s.total>=3?'<p>Átlagos rugalmasság: a legtöbb nehézségből idővel helyrejössz, de egy-egy nagyobb kudarc hosszabban elkísér.</p>':'<p>Most lassabban jössz helyre a nehézségek után. Ez gyakran az elhúzódó terhelés, a kevés pihenés vagy a kevés támogatás jele, és nem jellemhiba. A reziliencia jól fejleszthető: alvás, mozgás, kapcsolatok, és a nehéz helyzetek utólagos feldolgozása (mi segített, mit tanultam).</p>'},
        {h:'Mi építi',html:'<p>A kutatások szerint a reziliencia legerősebb forrásai a <strong>támogató kapcsolatok</strong>, a <strong>testi alapok</strong> (alvás, mozgás), az <strong>önegyüttérzés</strong> kudarc után, és az, hogy a nehézséget kihívásként és nem fenyegetésként értelmezed. A Szabályozás témakör SCS-SF tesztje és a Kapcsolódás témakör UCLA-3 tesztje ezekhez ad kiegészítő képet.</p>'}
      ])}
      ${H.refs(['<strong>Smith, B. W., Dalen, J., Wiggins, K., Tooley, E., Christopher, P., & Bernard, J. (2008).</strong> The Brief Resilience Scale: Assessing the ability to bounce back. <em>International Journal of Behavioral Medicine, 15</em>(3), 194–200.',
        '<strong>Smith, B. W., Epstein, E. M., Ortiz, J. A., Christopher, P. J., & Tooley, E. M. (2013).</strong> The foundations of resilience: What are the critical resources for bouncing back from stress? In S. Prince-Embury & D. H. Saklofske (Eds.), <em>Resilience in children, adolescents, and adults</em> (pp. 167–187). Springer.'])}`;
  }
});
})();
