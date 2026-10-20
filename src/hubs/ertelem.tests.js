/* XIII. Kapcsolódás, értelem, jelenlét — UCLA-3 magányosság-skála, Élet értelme kérdőív (MLQ), Tudatos jelenlét skála (MAAS).
   Mind szabadon használható, validált eszköz; a magyar szöveg saját fordítás. */
const UCLA_SCALE=[{v:1,l:'szinte soha'},{v:2,l:'néha'},{v:3,l:'gyakran'}];
const MLQ_SCALE=[{v:1,l:'teljesen hamis'},{v:2,l:'többnyire hamis'},{v:3,l:'kissé hamis'},{v:4,l:'nem tudom eldönteni'},{v:5,l:'kissé igaz'},{v:6,l:'többnyire igaz'},{v:7,l:'teljesen igaz'}];
const MAAS_SCALE=[{v:1,l:'szinte mindig'},{v:2,l:'nagyon gyakran'},{v:3,l:'elég gyakran'},{v:4,l:'elég ritkán'},{v:5,l:'nagyon ritkán'},{v:6,l:'szinte soha'}];

/* ═══════════ 1. UCLA-3 — MAGÁNYOSSÁG ═══════════ */
(function(){
const band=t=>t>=6?{l:'Gyakori magányosság',c:'#e11d48'}:t>=4?{l:'Alkalmi magányosság',c:'#f59e0b'}:{l:'Ritka magányosság',c:'#34d399'};
makeTest({
  id:'ucla',key:'ucla3-responses-v1',name:'Magányosság (UCLA-3)',c1:'#7c3aed',c2:'#2563eb',
  tab:'Kapcsolódás',tabSub:'UCLA-3 · 3 item',scale:UCLA_SCALE,
  header:{status:'valid',statusText:'Validált skála · Hughes és mtsai (2004)',
    eyebrow:'Three-Item Loneliness Scale · a UCLA Loneliness Scale rövid változata',
    title:'Mennyire érzed magad <em style="color:#a78bfa">kapcsolódva</em>',
    lead:'A magányosság nem azonos az egyedülléttel: azt jelenti, hogy a kapcsolataid nem adják meg azt a közelséget, amire szükséged van. Lehet valaki sok ember között magányos, és egyedül is kapcsolódott. Ez a három kérdés a nagy nemzetközi kutatások (pl. idősödés- és egészségvizsgálatok) standard magányosság-mérője.',
    intro:'<p><strong>Kitöltés:</strong> az utóbbi időre gondolva, milyen gyakran érzed az alábbiakat?</p><p>Összpontszám: 3–9. A kutatásokban gyakran használt határ: 6 vagy afölött gyakori magányosság.</p>'},
  sections:[{title:'Milyen gyakran <em>érzed…</em>',desc:'',items:[
    {s:'p',t:'…hogy hiányzik a társaság?'},
    {s:'p',t:'…hogy kimaradsz, nem vesznek be?'},
    {s:'p',t:'…hogy elszigetelt vagy másoktól?'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Magányosság (UCLA-3)',s.total,3,9]}};},
  render(R,s){
    const b=band(s.total);
    return `<div class="res-eyebrow">Eredmény · UCLA-3</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 9.</p>
      ${H.chart('Magányosság','3–9 · határ: 6',H.gauge({name:'UCLA-3',sub:b.l,val:s.total,unit:'/ 9',min:3,max:9,color:b.c,zones:[{from:3,to:3.5,color:'rgba(52,211,153,0.2)'},{from:3.5,to:5.5,color:'rgba(245,158,11,0.2)'},{from:5.5,to:9,color:'rgba(225,29,72,0.22)'}],labels:['3','4','6','9']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=6?'<p>Gyakran érzed, hogy hiányzik a kapcsolódás. Ez nagyon gyakori élmény, és nem azt jelenti, hogy valami baj van veled. A tartós magányosság viszont a kutatások szerint a stresszt, az alvást és a hangulatot is rontja, ezért érdemes komolyan venni.</p>':s.total>=4?'<p>Időnként megjelenik a magányosság érzése, de nem uralja a mindennapjaidat. Érdemes megfigyelni, milyen helyzetekben jön elő.</p>':'<p>Ritkán érzed magad magányosnak: a kapcsolataid most megadják a közelséget, amire szükséged van.</p>'},
        s.total>=4?{h:'Mi segít',html:'<p>A kutatások szerint a magányosságon nem elsősorban a több ember segít, hanem a <strong>minőségibb, rendszeres kapcsolódás</strong>: egy-két ember, akivel hetente valódi beszélgetés van; közös tevékenység (sport, önkéntesség, csoport), ahol a kapcsolat magától épül; és annak észrevétele, mikor húzódsz vissza, mert félsz az elutasítástól.</p>'}:null
      ])}
      ${H.refs(['<strong>Hughes, M. E., Waite, L. J., Hawkley, L. C., & Cacioppo, J. T. (2004).</strong> A short scale for measuring loneliness in large surveys. <em>Research on Aging, 26</em>(6), 655–672.',
        '<strong>Holt-Lunstad, J., Smith, T. B., Baker, M., Harris, T., & Stephenson, D. (2015).</strong> Loneliness and social isolation as risk factors for mortality. <em>Perspectives on Psychological Science, 10</em>(2), 227–237.'])}`;
  }
});
})();

/* ═══════════ 2. MLQ — AZ ÉLET ÉRTELME ═══════════ */
(function(){
/* Steger (2006): jelenlét (P) és keresés (S), 5–35; a szerző által javasolt határ: 24 felett magas */
const hi=v=>v>24;
const QUAD={
  PS:{l:'Megtalált és tovább kereső értelem',d:'Érzed, hogy van értelme az életednek, és közben nyitott vagy arra, hogy mélyítsd vagy továbbgondold. Ez gyakran az aktív, fejlődő élethelyzetek mintája.'},
  P:{l:'Megtalált értelem',d:'Érzed, hogy van értelme az életednek, és most nem foglalkoztat különösebben a keresés. A kutatásokban ez jár együtt a legmagasabb elégedettséggel.'},
  S:{l:'Kereső',d:'Most kevésbé érzed, hogy az életednek világos értelme van, és aktívan keresed. Ez gyakori átmeneti időszakokban (váltás, veszteség, új életszakasz), és önmagában a változás motorja lehet.'},
  N:{l:'Nem foglalkoztat',d:'Most kevéssé érzed az élet értelmét, és nem is keresed aktívan. Ez lehet tudatos, gyakorlatias életszemlélet, de lehet kimerültség vagy lehangoltság jele is; ezt a többi skála (WHO-5, PHQ-9) segít elkülöníteni.'}};
makeTest({
  id:'mlq',key:'mlq-responses-v1',name:'Az élet értelme (MLQ)',c1:'#d4a017',c2:'#7c3aed',
  tab:'Értelem',tabSub:'MLQ · 10 item',scale:MLQ_SCALE,
  header:{status:'valid',statusText:'Validált skála · Steger és mtsai (2006)',
    eyebrow:'Meaning in Life Questionnaire · Michael F. Steger',
    title:'Mennyire érzed <em style="color:#d4a017">értelmesnek</em> az életed',
    lead:'Az MLQ két dolgot külön mér: mennyire <strong>érzed jelen</strong> az értelmet az életedben, és mennyire <strong>keresed</strong> azt. A kettő független: lehet valaki egyszerre megtalálta és tovább kereső, és lehet, hogy egyik sem jellemző rá.',
    intro:'<p><strong>Kitöltés:</strong> szánj egy pillanatot arra, mi teszi számodra fontossá az életed. Mennyire igazak rád az alábbi állítások? Egy állítás fordított pontozású.</p><p>Alskálánként 5–35. A szerző javaslata szerint 24 felett magas.</p>'},
  sections:[{title:'10 állítás',desc:'',items:[
    {s:'P',t:'Értem, mi az életem értelme.'},
    {s:'S',t:'Keresek valamit, amitől az életem értelmesnek érződik.'},
    {s:'S',t:'Mindig keresem az életem célját.'},
    {s:'P',t:'Az életemnek világos célja van.'},
    {s:'P',t:'Jól tudom, mitől értelmes az életem.'},
    {s:'P',t:'Megtaláltam egy kielégítő életcélt.'},
    {s:'S',t:'Mindig keresek valamit, amitől az életem jelentőségteljesnek érződik.'},
    {s:'S',t:'Keresem az életem célját vagy küldetését.'},
    {s:'P',t:'Az életemnek nincs világos célja.',r:true},
    {s:'S',t:'Keresem az életem értelmét.'}]}],
  score(R){const P=R.sum('P'),S=R.sum('S'),q=hi(P)&&hi(S)?'PS':hi(P)?'P':hi(S)?'S':'N';return {P,S,q};},
  sum(s){return {h:QUAD[s.q].l,d:{P:['Az értelem jelenléte',s.P,5,35],S:['Az értelem keresése',s.S,5,35]}};},
  render(R,s){
    const Q=QUAD[s.q];
    return `<div class="res-eyebrow">Eredmény · MLQ</div>
      <h2 class="res-title"><em>${Q.l}</em></h2>
      <p class="res-lead">Az értelem jelenléte: <strong>${s.P}</strong> / 35 · az értelem keresése: <strong>${s.S}</strong> / 35.</p>
      ${H.bars('Két <em>dimenzió</em>',[{title:'',color:'#d4a017',rows:[
        {name:'Az értelem jelenléte',val:s.P,unit:'/35',pct:(s.P-5)/30*100,color:'#d4a017'},
        {name:'Az értelem keresése',val:s.S,unit:'/35',pct:(s.S-5)/30*100,color:'#a78bfa'}]}])}
      ${H.interp('Mit <em>jelent</em>',[
        {h:Q.l,color:'#d4a017',html:`<p>${Q.d}</p>`},
        {h:'Ha szeretnéd erősíteni',html:'<p>Az értelem érzése a kutatások szerint három forrásból táplálkozik: <strong>kapcsolatokból</strong> (kiért fontos, amit csinálok), <strong>célokból</strong> (mi felé tartok), és abból, hogy az életed <strong>összefüggő történetnek</strong> érződik. Egyszerű gyakorlat: írd le, melyik három dolog tette értelmessé az elmúlt hetedet, és mi köti össze őket.</p>'}
      ])}
      ${H.refs(['<strong>Steger, M. F., Frazier, P., Oishi, S., & Kaler, M. (2006).</strong> The Meaning in Life Questionnaire: Assessing the presence of and search for meaning in life. <em>Journal of Counseling Psychology, 53</em>(1), 80–93.',
        '<strong>Martela, F., & Steger, M. F. (2016).</strong> The three meanings of meaning in life: Distinguishing coherence, purpose, and significance. <em>Journal of Positive Psychology, 11</em>(5), 531–545.'])}`;
  }
});
})();

/* ═══════════ 3. MAAS — TUDATOS JELENLÉT ═══════════ */
(function(){
const band=m=>m>=4.5?{l:'Erős jelenlét',c:'#34d399'}:m>3?{l:'Közepes jelenlét',c:'#60a5fa'}:{l:'Gyakori robotpilóta',c:'#f59e0b'};
makeTest({
  id:'maas',key:'maas-responses-v1',name:'Tudatos jelenlét (MAAS)',c1:'#10b981',c2:'#2563eb',
  tab:'Jelenlét',tabSub:'MAAS · 15 item',scale:MAAS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Brown & Ryan (2003)',
    eyebrow:'Mindful Attention Awareness Scale · Kirk Warren Brown & Richard M. Ryan',
    title:'Mennyire vagy <em style="color:#10b981">jelen</em>',
    lead:'A MAAS a tudatos jelenlétet a hétköznapi figyelemként méri: mennyire veszed észre, mit csinálsz, mit érzel, kivel beszélsz, vagy mennyire mész „robotpilótán”. Nem meditációs tudást mér, hanem a mindennapi figyelmet.',
    intro:'<p><strong>Kitöltés:</strong> milyen gyakran fordulnak elő veled az alábbiak? A valós tapasztalatodra gondolj, ne arra, aminek lennie kellene.</p><p>Eredmény: 1–6 átlag, magasabb = több jelenlét. Normaérték helyett tájékozódó sávok: 3 vagy alatta gyakori robotpilóta, 4,5 felett erős jelenlét.</p>'},
  sections:[{title:'Milyen gyakran <em>fordul elő</em>',desc:'',items:[
    {s:'p',t:'Átélhetek egy érzelmet úgy, hogy csak később tudatosodik bennem.'},
    {s:'p',t:'Eltörök vagy kiöntök dolgokat, mert figyelmetlen vagyok, vagy máson jár az eszem.'},
    {s:'p',t:'Nehezen tudok arra figyelni, ami éppen történik.'},
    {s:'p',t:'Sietve megyek oda, ahová tartok, és nem figyelek arra, mit tapasztalok útközben.'},
    {s:'p',t:'Nem veszem észre a testi feszültséget vagy kellemetlenséget, amíg az nagyon fel nem hívja magára a figyelmet.'},
    {s:'p',t:'Szinte azonnal elfelejtem valakinek a nevét, miután először bemutatkozott.'},
    {s:'p',t:'Úgy tűnik, mintha „automata üzemmódban” működnék, és nem nagyon tudatosítanám, mit csinálok.'},
    {s:'p',t:'Végigrohanok a tevékenységeimen anélkül, hogy igazán figyelnék rájuk.'},
    {s:'p',t:'Annyira a célra koncentrálok, hogy elveszítem a kapcsolatot azzal, amit éppen most csinálok érte.'},
    {s:'p',t:'Gépiesen végzem a munkámat vagy a feladataimat, anélkül, hogy tudatában lennék, mit csinálok.'},
    {s:'p',t:'Azon kapom magam, hogy fél füllel hallgatok valakit, közben pedig mást csinálok.'},
    {s:'p',t:'„Robotpilóta-üzemmódban” vezetek vagy közlekedem, aztán nem tudom, hogyan értem oda.'},
    {s:'p',t:'Azon kapom magam, hogy a jövővel vagy a múlttal foglalkozom.'},
    {s:'p',t:'Azon kapom magam, hogy figyelem nélkül csinálok dolgokat.'},
    {s:'p',t:'Úgy nassolok, hogy közben észre sem veszem, hogy eszem.'}]}],
  score(R){const m=H.r2(R.mean('p'));return {total:m,band:band(m).l};},
  sum(s){return {h:s.band,d:{total:['Tudatos jelenlét (MAAS)',s.total,1,6]}};},
  render(R,s){
    const b=band(s.total),auto=R.items.filter(i=>i.raw<=2).slice(0,4);
    return `<div class="res-eyebrow">Eredmény · MAAS</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 6 (magasabb = több jelenlét).</p>
      ${H.chart('Tudatos jelenlét','1–6 · tájékozódó sávok: 3 és 4,5',H.gauge({name:'MAAS',sub:b.l,val:s.total,shown:s.total.toFixed(2),unit:'/ 6',min:1,max:6,color:b.c,zones:[{from:1,to:3,color:'rgba(245,158,11,0.2)'},{from:3,to:4.5,color:'rgba(96,165,250,0.2)'},{from:4.5,to:6,color:'rgba(52,211,153,0.22)'}],labels:['1','3','4,5','6']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=4.5?'<p>A figyelmed többnyire ott van, ahol te: észreveszed a testedet, az érzéseidet és azt, amit csinálsz. A kutatásokban ez kevesebb stresszel és jobb érzelemszabályozással jár együtt.</p>':s.total>3?'<p>Közepes jelenlét: sok dolgot tudatosan csinálsz, de bizonyos helyzetekben (sietség, stressz, rutin) átvált a robotpilóta.</p>':'<p>A mindennapjaid nagy része robotpilótán megy. Ez gyakran a túlterhelés jele: ha túl sok minden fut párhuzamosan, a figyelem nem tud jelen lenni. Kis, napi gyakorlatokkal ez jól fejleszthető.</p>'},
        auto.length?{h:'Ahol a leggyakoribb a robotpilóta',html:auto.map(i=>`<p>„${i.t}” — <strong>${MAAS_SCALE[i.raw-1].l}</strong></p>`).join('')}:null,
        {h:'Napi gyakorlat',html:'<p>Válassz egyetlen rutintevékenységet (kávé, fogmosás, az első néhány perc egy beszélgetésben), és azt csináld teljes figyelemmel egy hétig. A tudatos jelenlét nem plusz idő, hanem a meglévő percek másfajta minősége.</p>'}
      ])}
      ${H.refs(['<strong>Brown, K. W., & Ryan, R. M. (2003).</strong> The benefits of being present: Mindfulness and its role in psychological well-being. <em>Journal of Personality and Social Psychology, 84</em>(4), 822–848.'])}`;
  }
});
})();
