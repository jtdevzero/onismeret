/* XIV. Alvás és test — Sleep Condition Indicator (SCI), Epworth Sleepiness Scale (ESS), Body Appreciation Scale-2 (BAS-2).
   A magyar szöveg saját fordítás. Az ESS nem kereskedelmi, egyéni használatra ingyenes (© M. W. Johns). */
const ESS_SCALE=[{v:0,l:'soha nem alszom el'},{v:1,l:'kis eséllyel'},{v:2,l:'közepes eséllyel'},{v:3,l:'nagy eséllyel'}];
const BAS_SCALE=[{v:1,l:'soha'},{v:2,l:'ritkán'},{v:3,l:'néha'},{v:4,l:'gyakran'},{v:5,l:'mindig'}];
const SCI_TIME=[{t:'0–15 perc',v:4},{t:'16–30 perc',v:3},{t:'31–45 perc',v:2},{t:'46–60 perc',v:1},{t:'több mint 60 perc',v:0}];
const SCI_IMPACT=[{t:'egyáltalán nem',v:4},{t:'kicsit',v:3},{t:'valamennyire',v:2},{t:'nagyon',v:1},{t:'rendkívül',v:0}];

/* ═══════════ 1. SCI — ALVÁSMINŐSÉG ═══════════ */
(function(){
/* Espie és mtsai (2014): 0–32, magasabb = jobb alvás; 16 vagy alatta valószínű álmatlanság */
const band=t=>t<=16?{l:'Valószínű álmatlanság',c:'#e11d48'}:t<=24?{l:'Közepes alvásproblémák',c:'#f59e0b'}:{l:'Jó alvás',c:'#34d399'};
makeTest({
  id:'sci',key:'sci-responses-v1',name:'Alvásminőség (SCI)',c1:'#2563eb',c2:'#7c3aed',
  tab:'Alvás',tabSub:'SCI · 8 item',scale:[],
  header:{status:'valid',statusText:'Validált skála · Espie és mtsai (2014)',
    eyebrow:'Sleep Condition Indicator · Colin A. Espie',
    title:'Mennyire jól <em style="color:#60a5fa">alszol</em>',
    lead:'Az SCI az álmatlanság (inszomnia) nemzetközi diagnosztikai szempontjaira épülő rövid kérdőív: elalvás, éjszakai ébrenlét, gyakoriság, minőség, nappali hatás és időtartam. Arra is jó, hogy a változást kövesd, ha valamit módosítasz az alvásodon.',
    intro:'<p><strong>Kitöltés:</strong> gondolj egy <strong>átlagos éjszakára az elmúlt hónapban</strong>.</p><p>Összpontszám: 0–32, magasabb = jobb alvás. 16 vagy alatta valószínű álmatlanság; ilyenkor érdemes orvossal beszélni, mert jól kezelhető.</p>'},
  sections:[
    {title:'Egy átlagos <em>éjszaka</em>',desc:'',items:[
      {s:'p',t:'Mennyi idő alatt alszol el?',opts:SCI_TIME},
      {s:'p',t:'Ha éjjel felébredsz, összesen mennyi ideig vagy ébren?',opts:SCI_TIME},
      {s:'p',t:'Hetente hány éjszakán van gondod az alvással?',opts:[{t:'0–1',v:4},{t:'2',v:3},{t:'3',v:2},{t:'4',v:1},{t:'5–7',v:0}]},
      {s:'p',t:'Milyen az alvásod minősége?',opts:[{t:'nagyon jó',v:4},{t:'jó',v:3},{t:'átlagos',v:2},{t:'rossz',v:1},{t:'nagyon rossz',v:0}]}]},
    {title:'Az alvás <em>hatása</em>',desc:'Az elmúlt hónapban mennyire…',items:[
      {s:'p',t:'…befolyásolta a rossz alvás a hangulatodat, az energiádat vagy a kapcsolataidat?',opts:SCI_IMPACT},
      {s:'p',t:'…befolyásolta a koncentrációdat, a teljesítményedet vagy azt, hogy napközben ébren tudj maradni?',opts:SCI_IMPACT},
      {s:'p',t:'…zavart általában a rossz alvás?',opts:SCI_IMPACT},
      {s:'p',t:'Mióta van gondod az alvással?',opts:[{t:'nincs gondom, vagy kevesebb mint egy hónapja',v:4},{t:'1–2 hónapja',v:3},{t:'3–6 hónapja',v:2},{t:'7–12 hónapja',v:1},{t:'több mint egy éve',v:0}]}]}],
  score(R){const t=H.sum(R.items.map(i=>i.raw||0));const w=R.items.filter(i=>i.raw<=1).map(i=>i.n);return {total:t,weak:w,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Alvásminőség (SCI)',s.total,0,32]}};},
  render(R,s){
    const b=band(s.total),weak=R.picks.filter(p=>p.idx>=3).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · SCI</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 32 (magasabb = jobb alvás).</p>
      ${H.chart('Alvásminőség','0–32 · határ: 16',H.gauge({name:'SCI',sub:b.l,val:s.total,unit:'/ 32',min:0,max:32,color:b.c,zones:[{from:0,to:16.5,color:'rgba(225,29,72,0.22)'},{from:16.5,to:24.5,color:'rgba(245,158,11,0.2)'},{from:24.5,to:32,color:'rgba(52,211,153,0.2)'}],labels:['0','16','24','32']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total<=16?'<p>A válaszaid az álmatlanság jellemző mintáját mutatják: nehéz elaludni vagy visszaaludni, gyakran, és ez napközben is érződik. Az álmatlanság jól kezelhető; a leghatékonyabb módszer nem az altató, hanem a <strong>kognitív viselkedésterápia álmatlanságra (CBT-I)</strong>. Érdemes háziorvossal beszélni, főleg ha hónapok óta tart, vagy horkolás, légzéskimaradás is előfordul.</p>':s.total<=24?'<p>Vannak alvásproblémáid, de nem minden éjszaka, vagy nem zavarnak nagyon napközben. Ez az a szint, ahol az alvási szokások kis módosítása is sokat segít.</p>':'<p>Jól alszol: gyorsan elalszol, keveset vagy ébren éjjel, és napközben sem érzed a hiányát. Ez az egyik legerősebb alap a hangulathoz és a stressz kezeléséhez.</p>'},
        weak.length?{h:'Ahol a legnagyobb a gond',html:weak.map(p=>`<p>„${p.item.t}” — <strong>${p.opt.t}</strong></p>`).join('')}:null,
        s.total<=24?{h:'Ami a leggyorsabban segít',html:'<p><strong>Rögzített kelési idő</strong> minden nap, hétvégén is. <strong>Csak akkor feküdj le, ha álmos vagy</strong>, és ha 20 perc után sem jön az álom, kelj fel, és csak álmosan feküdj vissza. Az ágy legyen alvásra (nem telefonra, munkára). Délután kettő után kevesebb koffein, este kevés alkohol: az alkohol elaltat, de rontja az alvás második felét.</p>'}:null
      ])}
      ${H.refs(['<strong>Espie, C. A., Kyle, S. D., Hames, P., Gardani, M., Fleming, L., & Cape, J. (2014).</strong> The Sleep Condition Indicator: A clinical screening tool to evaluate insomnia disorder. <em>BMJ Open, 4</em>(3), e004183.',
        '<strong>Riemann, D., és mtsai (2017).</strong> European guideline for the diagnosis and treatment of insomnia. <em>Journal of Sleep Research, 26</em>(6), 675–700.'])}`;
  }
});
})();

/* ═══════════ 2. EPWORTH — NAPPALI ÁLMOSSÁG ═══════════ */
(function(){
const band=t=>t>=16?{l:'Súlyos nappali álmosság',c:'#e11d48'}:t>=13?{l:'Közepes nappali álmosság',c:'#f97316'}:t>=11?{l:'Enyhe nappali álmosság',c:'#f59e0b'}:{l:'Normál tartomány',c:'#34d399'};
makeTest({
  id:'ess',key:'ess-responses-v1',name:'Nappali álmosság (Epworth)',c1:'#7c3aed',c2:'#2563eb',
  tab:'Álmosság',tabSub:'Epworth · 8 helyzet',scale:ESS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Johns (1991)',
    eyebrow:'Epworth Sleepiness Scale · Murray W. Johns',
    title:'Mennyire vagy <em style="color:#a78bfa">álmos</em> napközben',
    lead:'Az Epworth-skála azt méri, mekkora eséllyel bóbiskolnál el hétköznapi helyzetekben. Nem a fáradtságot (kimerültség, energiahiány), hanem a tényleges <strong>elalvási hajlamot</strong>. Magas értéke gyakran alvási apnoe, kevés alvás vagy más alvászavar jele.',
    intro:'<p><strong>Kitöltés:</strong> mekkora eséllyel bóbiskolnál el, vagy aludnál el az alábbi helyzetekben (nem csak fáradtnak éreznéd magad)? Az utóbbi időbeli szokásos életedre gondolj. Ha valamelyik helyzetben mostanában nem voltál, képzeld el, hogyan hatna rád.</p><p>Összpontszám: 0–24. 10 vagy alatta normál; 11–12 enyhe, 13–15 közepes, 16 vagy afölött súlyos nappali álmosság.</p>'},
  sections:[{title:'8 hétköznapi <em>helyzet</em>',desc:'',items:[
    {s:'p',t:'Ülve olvasok.'},
    {s:'p',t:'Tévét nézek.'},
    {s:'p',t:'Tétlenül ülök nyilvános helyen (pl. színházban, értekezleten).'},
    {s:'p',t:'Utasként ülök egy autóban egy órán át, szünet nélkül.'},
    {s:'p',t:'Délután lefekszem pihenni, ha a körülmények engedik.'},
    {s:'p',t:'Ülök és beszélgetek valakivel.'},
    {s:'p',t:'Csendben ülök egy alkohol nélküli ebéd után.'},
    {s:'p',t:'Autóban ülök, és néhány percre megállok a forgalomban.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Nappali álmosság (Epworth)',s.total,0,24]}};},
  render(R,s){
    const b=band(s.total),risky=R.items.filter(i=>(i.n===8||i.n===4||i.n===6)&&i.raw>=2);
    return `<div class="res-eyebrow">Eredmény · Epworth</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 24.</p>
      ${H.chart('Nappali álmosság','0–24 · határok: 11, 13, 16',H.gauge({name:'Epworth',sub:b.l,val:s.total,unit:'/ 24',min:0,max:24,color:b.c,zones:[{from:0,to:10.5,color:'rgba(52,211,153,0.2)'},{from:10.5,to:15.5,color:'rgba(245,158,11,0.2)'},{from:15.5,to:24,color:'rgba(225,29,72,0.22)'}],labels:['0','11','16','24']}))}
      ${risky.some(i=>i.n===8)?H.callout('<p><strong>Fontos.</strong> Azt jelölted, hogy a forgalomban rövid megálláskor is van esélyed elaludni. Ez vezetés közben balesetveszélyes: amíg orvos nem nézte meg, ha álmos vagy, ne vezess, és hosszabb úton tarts gyakori szünetet.</p>','#fb7185'):''}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=11?'<p>Az átlagosnál nagyobb eséllyel alszol el napközben. Ennek leggyakoribb okai: <strong>túl kevés alvás</strong>, <strong>alvási apnoe</strong> (horkolás, légzéskimaradás, száraz szájjal ébredés, reggeli fejfájás), egyes gyógyszerek, és ritkábban más alvászavarok. '+(s.total>=16?'Ezen a szinten mindenképp érdemes orvossal beszélni, és alváslaborvizsgálatot kérni.':'Ha ez hetek óta így van, érdemes orvossal átbeszélni.')+'</p>':'<p>A nappali álmosságod a normál tartományban van. Ha mégis sokat vagy fáradt, az inkább kimerültség (lásd: Koppenhágai kiégés-kérdőív) vagy hangulati kérdés lehet, nem elalvási hajlam.</p>'},
        {h:'Fáradtság vagy álmosság?',html:'<p>A kettő nem ugyanaz. Az <strong>álmosság</strong> az elalvási hajlam (leragad a szemed). A <strong>fáradtság</strong> energiahiány, ami pihenéssel sem múlik. Az álmosság mögött gyakran alvási ok, a fáradtság mögött gyakran terhelés, stressz vagy hangulat áll.</p>'}
      ])}
      ${H.refs(['<strong>Johns, M. W. (1991).</strong> A new method for measuring daytime sleepiness: The Epworth Sleepiness Scale. <em>Sleep, 14</em>(6), 540–545.'])}`;
  }
});
})();

/* ═══════════ 3. BAS-2 — TESTKÉP ═══════════ */
(function(){
const band=m=>m>=4?{l:'Elfogadó, értékelő testkép',c:'#34d399'}:m>=3?{l:'Vegyes testkép',c:'#60a5fa'}:{l:'Kritikus testkép',c:'#f59e0b'};
makeTest({
  id:'bas',key:'bas2-responses-v1',name:'Testkép (BAS-2)',c1:'#10b981',c2:'#d4a017',
  tab:'Testkép',tabSub:'BAS-2 · 10 item',scale:BAS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Tylka & Wood-Barcalow (2015)',
    eyebrow:'Body Appreciation Scale-2 · Tracy L. Tylka & Nichole L. Wood-Barcalow',
    title:'Hogyan viszonyulsz a <em style="color:#10b981">testedhez</em>',
    lead:'A BAS-2 nem azt kérdezi, mennyire vagy elégedett a kinézeteddel, hanem a <strong>pozitív testképet</strong>: mennyire tiszteled, fogadod el és figyeled a tested szükségleteit, függetlenül attól, hogy megfelel-e az elvárt ideálnak. Nőknek és férfiaknak egyaránt.',
    intro:'<p><strong>Kitöltés:</strong> milyen gyakran igazak rád az alábbi állítások?</p><p>Eredmény: 1–5 átlag, magasabb = elfogadóbb testkép. Tájékozódó sávok: 3 alatt kritikus, 4 felett elfogadó.</p>'},
  sections:[{title:'10 állítás',desc:'',items:[
    {s:'p',t:'Tisztelem a testemet.'},
    {s:'p',t:'Jól érzem magam a testemmel.'},
    {s:'p',t:'Úgy érzem, a testemnek van legalább néhány jó tulajdonsága.'},
    {s:'p',t:'Pozitívan viszonyulok a testemhez.'},
    {s:'p',t:'Figyelek a testem szükségleteire.'},
    {s:'p',t:'Szeretetet érzek a testem iránt.'},
    {s:'p',t:'Értékelem a testem különböző, egyedi jellegzetességeit.'},
    {s:'p',t:'A viselkedésemen látszik, hogy pozitívan viszonyulok a testemhez; például felemelt fejjel, mosolyogva járok.'},
    {s:'p',t:'Kényelmesen érzem magam a testemben.'},
    {s:'p',t:'Szépnek, vonzónak érzem magam akkor is, ha különbözöm a médiában látott vonzó emberektől.'}]}],
  score(R){const m=H.r2(R.mean('p'));return {total:m,band:band(m).l};},
  sum(s){return {h:s.band,d:{total:['Testkép (BAS-2)',s.total,1,5]}};},
  render(R,s){
    const b=band(s.total),low=R.items.filter(i=>i.raw<=2).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · BAS-2</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 5.</p>
      ${H.chart('Testkép','1–5 · tájékozódó sávok: 3 és 4',H.gauge({name:'BAS-2',sub:b.l,val:s.total,shown:s.total.toFixed(2),unit:'/ 5',min:1,max:5,color:b.c,zones:[{from:1,to:3,color:'rgba(245,158,11,0.2)'},{from:3,to:4,color:'rgba(96,165,250,0.2)'},{from:4,to:5,color:'rgba(52,211,153,0.22)'}],labels:['1','3','4','5']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=4?'<p>Elfogadóan és tisztelettel viszonyulsz a testedhez. A kutatások szerint ez nem azonos a kinézettel való elégedettséggel: az elfogadó testkép jobb egészségmagatartással, több mozgásörömmel és kevesebb önkritikával jár együtt.</p>':s.total>=3?'<p>Vegyes a viszonyod a testeddel: bizonyos helyzetekben elfogadó vagy, máskor kritikusabb. Érdemes megfigyelni, mi billenti el (összehasonlítás, közösségi média, stressz).</p>':'<p>Most inkább kritikusan viszonyulsz a testedhez. Ez nagyon gyakori, és tanult nézőpont, nem tény. A testtel való viszony javításában a kinézetre fókuszálás helyett az segít, ha arra figyelsz, mire <strong>képes</strong> a tested, és mire van <strong>szüksége</strong>. Ha a testtel való elégedetlenség evéssel, kontrollal vagy kerüléssel jár, érdemes szakemberrel beszélni.</p>'},
        low.length?{h:'Ahol a legtöbb a mozgástér',html:low.map(i=>`<p>„${i.t}” — <strong>${BAS_SCALE[i.raw-1].l}</strong></p>`).join('')}:null,
        {h:'Kapcsolódó térképek',html:'<p>A test jelzéseire való figyelmet a MAIA-2 (Test-tudatosság), a szexuális önképet az SSSS, az önmagaddal való bánásmódot az SCS-SF méri.</p>'}
      ])}
      ${H.refs(['<strong>Tylka, T. L., & Wood-Barcalow, N. L. (2015).</strong> The Body Appreciation Scale-2: Item refinement and psychometric evaluation. <em>Body Image, 12</em>, 53–67.'])}`;
  }
});
})();
