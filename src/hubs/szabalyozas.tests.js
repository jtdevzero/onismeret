const SCALE5=[{v:1,l:'egyáltalán nem'},{v:2,l:'inkább nem'},{v:3,l:'részben'},{v:4,l:'inkább igen'},{v:5,l:'teljesen'}];
const FREQ5=[{v:1,l:'szinte soha'},{v:2,l:'ritkán'},{v:3,l:'az esetek felében'},{v:4,l:'gyakran'},{v:5,l:'szinte mindig'}];

/* ═══════════ 1. IPS — IRRACIONÁLIS HALOGATÁS ═══════════ */
(function(){
const bandIPS=t=>t>=37?{l:'Nagyon erős halogatás',c:'#fb7185'}:t>=28?{l:'Erős halogatás',c:'#f97316'}:t>=19?{l:'Mérsékelt halogatás',c:'#fbbf24'}:{l:'Alacsony halogatás',c:'#34d399'};
makeTest({
  id:'ips',key:'ips-responses-v1',name:'Halogatás (IPS)',c1:'#fbbf24',c2:'#f97316',
  tab:'Halogatás',tabSub:'IPS · 9 item',scale:SCALE5,
  header:{status:'valid',statusText:'Validált skála · Steel (2010)',
    eyebrow:'Irrational Procrastination Scale · Piers Steel (2010)',
    title:'Mennyit <em style="color:#fbbf24">halogatsz</em>',
    lead:'Steel definíciója szerint a halogatás <strong>önkéntes késleltetés annak ellenére, hogy tudod: rosszabbul jársz vele</strong>. Nem a tervezett várakozás vagy a stratégiai prioritizálás, hanem az irracionális halasztás. Az IPS ennek a legrövidebb, jól validált mérőeszköze.',
    intro:'<p><strong>Kitöltés:</strong> mennyire igazak rád az állítások általában, az elmúlt hónapokat nézve? 1 = egyáltalán nem igaz · 5 = teljesen igaz. Három tétel fordított pontozású.</p><p>Összpontszám: 9–45. A sávhatárok tájékoztató jellegűek, nem klinikai küszöbök.</p>'},
  sections:[{title:'9 állítás',desc:'',items:[
    {s:'p',t:'Olyan sokáig halogatom a dolgokat, hogy a jóllétem vagy a hatékonyságom feleslegesen kárt szenved.'},
    {s:'p',t:'Ha valamit meg kell csinálnom, előbb azzal foglalkozom, és csak utána a kevésbé fontos dolgokkal.',r:true},
    {s:'p',t:'Jobb lenne az életem, ha bizonyos feladatokat korábban elintéznék.'},
    {s:'p',t:'Amikor valamit csinálnom kellene, gyakran valami mást csinálok helyette.'},
    {s:'p',t:'A nap végén tudom, hogy jobban is eltölthettem volna az időmet.'},
    {s:'p',t:'Bölcsen bánok az időmmel.',r:true},
    {s:'p',t:'Az észszerűnél tovább halogatom a feladatokat.'},
    {s:'p',t:'Halogatok.'},
    {s:'p',t:'Mindent akkor csinálok meg, amikor úgy gondolom, hogy meg kell csinálni.',r:true}]}],
  score(R){const t=R.sum('p');return {total:t,band:bandIPS(t).l};},
  sum(s){return {h:s.band,d:{total:['IPS összpontszám',s.total,9,45]}};},
  render(R,s){
    const b=bandIPS(s.total);
    const worst=R.items.filter(i=>!i.r).sort((a,b)=>b.v-a.v).slice(0,3);
    const g=H.gauge({name:'Halogatás',sub:b.l,val:s.total,unit:'/ 45',min:9,max:45,color:b.c,zones:[{from:9,to:18.5,color:'rgba(52,211,153,0.2)'},{from:18.5,to:27.5,color:'rgba(251,191,36,0.18)'},{from:27.5,to:36.5,color:'rgba(249,115,22,0.2)'},{from:36.5,to:45,color:'rgba(251,113,133,0.25)'}],labels:['9','alacsony','mérsékelt','erős','45']});
    return `<div class="res-eyebrow">Eredmény · Halogatás</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">IPS-összpontszám: <strong>${s.total}</strong> / 45.</p>
      ${H.chart('Halogatási <em>skála</em>','9–45 · tájékoztató sávok','<div>'+g+'</div>')}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'A legerősebb állításaid',color:b.c,html:worst.map(i=>`<p>„${i.t}” — <strong>${i.v}/5</strong></p>`).join('')},
        {h:'A halogatás egyenlete (Steel)',html:'<p>Steel ideiglenes motivációelmélete szerint a motiváció ≈ <strong>(elvárás × érték) / (impulzivitás × késleltetés)</strong>. A halogatás tehát nem lustaság. Akkor nő, ha nem hiszel a sikerben, ha a feladat nem jutalmaz, ha az impulzivitásod magas, és ha a jutalom messze van.</p><p>Ebből négy beavatkozási pont következik: <strong>kis, biztosan sikerülő első lépés</strong> (elvárás), a feladat összekötése valami számodra értékessel (érték), a zavaró ingerek fizikai eltávolítása (impulzivitás), és <strong>közeli, külső határidők</strong> (késleltetés).</p>'},
        {h:'Kapcsolódó térképek',html:'<p>A <a href="cselekves.html#test-kolbe" style="color:#fde047">Cselekvési módok</a> (magas Gyorsindító, alacsony Rendszerező) és a <a href="cselekves.html#test-ft" style="color:#fde047">Négy tendencia</a> (Kötelességtudó, Lázadó) megmutatja, <em>milyen típusú</em> külső struktúra működik nálad. A <a href="#test-ders" style="color:#fde047">DERS-SF</a> azt, hogy a halogatás mögött érzelemszabályozási elakadás áll-e: sokszor a kellemetlen érzés kerülése a valódi motor.</p>'}
      ])}
      ${H.refs(['<strong>Steel, P. (2010).</strong> Arousal, avoidant and decisional procrastinators: Do they exist? <em>Personality and Individual Differences, 48</em>(8), 926–934.',
        '<strong>Steel, P. (2007).</strong> The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure. <em>Psychological Bulletin, 133</em>(1), 65–94.',
        '<strong>Svartdal, F., & Steel, P. (2017).</strong> Irrational delay revisited: Examining five procrastination scales in a global sample. <em>Frontiers in Psychology, 8</em>, 1927.'])}`;
  }
});
})();

/* ═══════════ 2. DERS-SF — ÉRZELEMSZABÁLYOZÁSI NEHÉZSÉGEK ═══════════ */
(function(){
const D={
  strat:{name:'Korlátozott stratégiák',en:'Strategies',color:'#fb7185',desc:'Az a hit, hogy ha egyszer rosszul vagy, nem tudsz ezen változtatni.',tip:'Építs <strong>előre megírt listát</strong> 3–5 bevált szabályozó lépésről (mozgás, légzés, egy ember felhívása, zuhany). Feszültségben nem kell kitalálni, csak választani.'},
  nonacc:{name:'Érzelmek el nem fogadása',en:'Non-acceptance',color:'#a78bfa',desc:'Szégyen, bűntudat vagy zavar amiatt, hogy egyáltalán ilyen érzésed van.',tip:'A „nem kéne így éreznem” második réteg fájdalmat tesz az elsőre. Gyakorlat: nevezd meg az érzést, és tedd hozzá: <strong>„érthető, hogy így érzek”</strong>.'},
  impulse:{name:'Impulzuskontroll',en:'Impulse',color:'#f97316',desc:'Feszült állapotban nehéz uralni a viselkedést.',tip:'Iktass be <strong>késleltetést</strong> a késztetés és a tett közé (10 perc, 10 lélegzet). A késztetés hulláma általában 10–20 perc alatt lecseng.'},
  goals:{name:'Célirányos működés',en:'Goals',color:'#fbbf24',desc:'Felzaklatott állapotban nehéz koncentrálni és dolgozni.',tip:'Ha fel vagy zaklatva, <strong>először szabályozz, utána dolgozz</strong>. 5 perc szabályozás gyorsabb, mint egy óra szétesett munka. Tarts egy „rossz napos” feladatlistát, amihez nem kell mély fókusz.'},
  aware:{name:'Érzelmi tudatosság hiánya',en:'Awareness',color:'#60a5fa',desc:'Nem figyelsz oda, mit érzel, és nem ismered el az érzéseidet.',tip:'Napi 2–3 <strong>érzelmi check-in</strong> (reggel, délben, este): mit érzek, hol érzem a testemben, mekkora (1–10)?'},
  clarity:{name:'Érzelmi tisztánlátás hiánya',en:'Clarity',color:'#2dd4bf',desc:'Nehéz megkülönböztetni és megnevezni, pontosan mit érzel.',tip:'Használj <strong>érzelemkereket</strong>, és a „rossz” helyett keress pontosabb szót (csalódott, megszégyenült, túlterhelt). A pontos megnevezés már önmagában csökkenti az intenzitást.'}
};
const bandM=m=>m>=3.5?'jelentős nehézség':m>=2.5?'mérsékelt nehézség':'kevés nehézség';
makeTest({
  id:'ders',key:'ders-sf-responses-v1',name:'Érzelemszabályozás (DERS-SF)',c1:'#fb7185',c2:'#a78bfa',
  tab:'Érzelemszabályozás',tabSub:'DERS-SF · 18 item',scale:FREQ5,
  header:{status:'valid',statusText:'Validált skála · Kaufman és mtsai (2016)',
    eyebrow:'Difficulties in Emotion Regulation Scale – Short Form · Gratz & Roemer (2004), Kaufman et al. (2016)',
    title:'Hol akad el az <em style="color:#fb7185">érzelemszabályozás</em>',
    lead:'A DERS a legszélesebb körben használt mérőeszköz arra, <strong>milyen ponton</strong> nehéz szabályozni az érzelmeket: észrevenni őket, elfogadni, megérteni, vagy felzaklatott állapotban is célirányosan működni. A rövid forma 6 területet mér, területenként 3 tétellel.',
    intro:'<p><strong>Kitöltés:</strong> milyen gyakran igazak rád az állítások? 1 = szinte soha · 5 = szinte mindig. Az első blokk tételei fordított pontozásúak (a rendszer kezeli).</p><p>Magasabb pontszám = <strong>nagyobb nehézség</strong>. Terület: 3–15, összpontszám: 18–90.</p>'},
  sections:[
    {title:'I. rész — <em>Figyelem az érzésekre</em>',desc:'',items:[
      {s:'aware',t:'Odafigyelek arra, hogyan érzem magam.',r:true},
      {s:'clarity',t:'Fogalmam sincs, hogyan érzem magam.'},
      {s:'clarity',t:'Nehezen tudok eligazodni az érzéseimen.'},
      {s:'aware',t:'Figyelmes vagyok az érzéseimre.',r:true},
      {s:'clarity',t:'Össze vagyok zavarodva azzal kapcsolatban, mit érzek.'},
      {s:'aware',t:'Amikor feldúlt vagyok, elismerem az érzéseimet.',r:true}]},
    {title:'II. rész — <em>Amikor feldúlt vagyok…</em>',desc:'Feldúlt = ideges, szomorú, dühös, szorongó, bármilyen erős kellemetlen állapot.',items:[
      {s:'nonacc',t:'…zavarba jövök amiatt, hogy így érzek.'},
      {s:'goals',t:'…nehezen tudom elvégezni a munkámat.'},
      {s:'impulse',t:'…elveszítem az irányítást.'},
      {s:'strat',t:'…úgy hiszem, sokáig így is maradok.'},
      {s:'strat',t:'…úgy hiszem, a végén nagyon levert leszek.'},
      {s:'goals',t:'…nehezen tudok másra összpontosítani.'},
      {s:'nonacc',t:'…szégyellem magam, amiért így érzek.'},
      {s:'nonacc',t:'…bűntudatom van, amiért így érzek.'},
      {s:'goals',t:'…nehezen tudok koncentrálni.'},
      {s:'impulse',t:'…nehezen tudom kontrollálni a viselkedésemet.'},
      {s:'strat',t:'…úgy hiszem, csak dagonyázni tudok benne.'},
      {s:'impulse',t:'…elveszítem a kontrollt a viselkedésem felett.'}]}],
  score(R){const o={total:R.sum('strat')+R.sum('nonacc')+R.sum('impulse')+R.sum('goals')+R.sum('aware')+R.sum('clarity')};Object.keys(D).forEach(k=>o[k]=R.sum(k));o.mean=H.r2(o.total/18);return o;},
  sum(s){const top=Object.keys(D).sort((a,b)=>s[b]-s[a])[0];return {h:'Fő elakadás: '+D[top].name+' ('+bandM(s.mean)+')',d:Object.assign({total:['DERS-SF összpontszám',s.total,18,90]},Object.fromEntries(Object.keys(D).map(k=>[k,[D[k].name,s[k],3,15]])))};},
  render(R,s){
    const keys=Object.keys(D),sorted=[...keys].sort((a,b)=>s[b]-s[a]);
    const radar=H.radar(keys.map(k=>({label:D[k].name.split(' ')[0]+(D[k].name.split(' ')[1]?' '+D[k].name.split(' ')[1]:''),value:s[k],shown:s[k]+'/15',color:D[k].color})),{min:3,max:15,stroke:'#fb7185',fill:'rgba(251,113,133,0.22)'});
    return `<div class="res-eyebrow">Eredmény · Érzelemszabályozás</div>
      <h2 class="res-title">Fő elakadás: <em>${D[sorted[0]].name}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 90 (tételátlag ${s.mean}, ${bandM(s.mean)}). Magasabb = nagyobb nehézség.</p>
      ${H.chart('Hat <em>terület</em>','3–15 · magasabb = nehezebb',radar)}
      ${H.rank('Területek <em>a legnehezebbtől</em>',sorted.map((k,i)=>({name:D[k].name,sub:D[k].en,desc:D[k].desc,score:s[k],unit:'/ 15',color:D[k].color,top:i===0})))}
      ${H.interp('Hol <em>érdemes kezdeni</em>',sorted.slice(0,2).map(k=>({h:D[k].name,color:D[k].color,html:`<p>${D[k].tip}</p>`})).concat([{h:'Szabályozás és végrehajtás',html:'<p>Ha a <strong>Célirányos működés</strong> vagy a <strong>Korlátozott stratégiák</strong> terület magas, a halogatás gyakran nem időbeosztási, hanem érzelmi probléma: a feladat kellemetlen érzést kelt, és az elkerülés azonnal csillapít. Ilyenkor a jobb naptár nem segít. Az segít, ha a kellemetlen érzést kisebbé teszed (kisebb első lépés), vagy előbb szabályozol.</p>'}]))}
      ${H.refs(['<strong>Gratz, K. L., & Roemer, L. (2004).</strong> Multidimensional assessment of emotion regulation and dysregulation. <em>Journal of Psychopathology and Behavioral Assessment, 26</em>(1), 41–54.',
        '<strong>Kaufman, E. A., Xia, M., Fosco, G., Yaptangco, M., Skidmore, C. R., & Crowell, S. E. (2016).</strong> The Difficulties in Emotion Regulation Scale Short Form (DERS-SF): Validation and replication in adolescent and adult samples. <em>Journal of Psychopathology and Behavioral Assessment, 38</em>(3), 443–455.'])}`;
  }
});
})();

/* ═══════════ 3. SCS-SF — ÖNEGYÜTTÉRZÉS ═══════════ */
(function(){
const C={
  SK:{name:'Önkedvesség',en:'Self-Kindness',color:'#34d399',pos:true},
  SJ:{name:'Önítélkezés',en:'Self-Judgment',color:'#fb7185',pos:false},
  CH:{name:'Közös emberi tapasztalat',en:'Common Humanity',color:'#60a5fa',pos:true},
  IS:{name:'Elszigeteltség',en:'Isolation',color:'#f97316',pos:false},
  MI:{name:'Tudatos jelenlét',en:'Mindfulness',color:'#2dd4bf',pos:true},
  OI:{name:'Túlazonosulás',en:'Over-Identification',color:'#a78bfa',pos:false}
};
const band=m=>m>=3.51?{l:'Magas önegyüttérzés',c:'#34d399'}:m>=2.5?{l:'Közepes önegyüttérzés',c:'#fbbf24'}:{l:'Alacsony önegyüttérzés',c:'#fb7185'};
makeTest({
  id:'scs',key:'scs-sf-responses-v1',name:'Önegyüttérzés (SCS-SF)',c1:'#34d399',c2:'#2dd4bf',
  tab:'Önegyüttérzés',tabSub:'SCS-SF · 12 item',scale:FREQ5,
  header:{status:'valid',statusText:'Validált skála · Raes és mtsai (2011)',
    eyebrow:'Self-Compassion Scale – Short Form · Neff (2003), Raes et al. (2011)',
    title:'Hogyan bánsz magaddal, <em style="color:#34d399">amikor elbuksz</em>',
    lead:'Kristin Neff modellje szerint az önegyüttérzés három pár ellentétből áll: <strong>önkedvesség vagy önítélkezés</strong>, <strong>közös emberi tapasztalat vagy elszigeteltség</strong>, <strong>tudatos jelenlét vagy túlazonosulás</strong>. A kutatások szerint nem a gyengeség jele: a magas önegyüttérzés több kitartással és kevesebb halogatással jár, mint a kemény önkritika.',
    intro:'<p><strong>Kitöltés:</strong> milyen gyakran viselkedsz így magaddal nehéz helyzetben? 1 = szinte soha · 5 = szinte mindig. A negatív tételek fordított pontozásúak.</p><p>Összpontszám: 1–5 átlag. 1–2,49 alacsony · 2,5–3,5 közepes · 3,51–5 magas (Neff sávjai).</p>'},
  sections:[{title:'12 állítás',desc:'',items:[
    {s:'OI',t:'Amikor valami fontosban kudarcot vallok, elborít az elégtelenség érzése.',r:true},
    {s:'SK',t:'Igyekszem megértő és türelmes lenni a személyiségem azon részeivel, amelyeket nem szeretek.'},
    {s:'MI',t:'Amikor valami fájdalmas történik, igyekszem kiegyensúlyozottan látni a helyzetet.'},
    {s:'IS',t:'Amikor le vagyok törve, hajlamos vagyok úgy érezni, hogy a legtöbb ember valószínűleg boldogabb nálam.',r:true},
    {s:'CH',t:'Igyekszem a hibáimat az emberi lét részeként látni.'},
    {s:'SK',t:'Amikor nagyon nehéz időszakon megyek át, megadom magamnak azt a törődést és gyengédséget, amire szükségem van.'},
    {s:'MI',t:'Amikor valami felzaklat, igyekszem egyensúlyban tartani az érzelmeimet.'},
    {s:'IS',t:'Amikor valami fontosban kudarcot vallok, hajlamos vagyok egyedül érezni magam a kudarcommal.',r:true},
    {s:'OI',t:'Amikor le vagyok törve, hajlamos vagyok rágódni és ráfixálódni mindarra, ami rossz.',r:true},
    {s:'CH',t:'Amikor valamiben elégtelennek érzem magam, igyekszem emlékeztetni magam, hogy ezt az érzést a legtöbb ember ismeri.'},
    {s:'SJ',t:'Elutasító és ítélkező vagyok a saját hibáimmal és hiányosságaimmal szemben.',r:true},
    {s:'SJ',t:'Türelmetlen és intoleráns vagyok a személyiségem azon részeivel, amelyeket nem szeretek.',r:true}]}],
  score(R){const o={total:H.r2(R.allMean())};Object.keys(C).forEach(k=>{const m=R.mean(k);o[k]=H.r2(C[k].pos?m:6-m);});return o;},
  sum(s){return {h:band(s.total).l,d:Object.assign({total:['Önegyüttérzés (átlag)',s.total,1,5]},Object.fromEntries(Object.keys(C).map(k=>[k,[C[k].name+(C[k].pos?'':' (nyers)'),s[k],1,5]])))};},
  render(R,s){
    const b=band(s.total);
    const pairs=[['SK','SJ'],['CH','IS'],['MI','OI']];
    const bars=H.bars('Három <em>ellentétpár</em>',pairs.map(([p,n])=>({title:C[p].name+' ↔ '+C[n].name,color:C[p].color,rows:[
      {name:C[p].name+' <span style="color:var(--ink-lite-muted);font-size:12px">· magasabb = jobb</span>',val:s[p].toFixed(1),unit:'/5',pct:(s[p]-1)/4*100,color:C[p].color},
      {name:C[n].name+' <span style="color:var(--ink-lite-muted);font-size:12px">· magasabb = erősebb</span>',val:s[n].toFixed(1),unit:'/5',pct:(s[n]-1)/4*100,color:C[n].color}]})));
    const weakest=pairs.map(([p,n])=>({p,n,gap:s[n]-s[p]})).sort((a,b)=>b.gap-a.gap)[0];
    const TIPS={SK:'<strong>A barát-teszt:</strong> amikor elrontasz valamit, írd le, mit mondanál egy jó barátodnak ugyanebben a helyzetben, és mondd ezt magadnak.',CH:'<strong>„Ez emberi”:</strong> kudarc után mondd ki: „ez most nehéz, és ezt más is átéli”. Az elszigeteltség érzése a szégyen fő erősítője.',MI:'<strong>Címkézés rágódás helyett:</strong> „most azt a gondolatot gondolom, hogy…”. Távolságot teremt a gondolat és közted.'};
    return `<div class="res-eyebrow">Eredmény · Önegyüttérzés</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 5.</p>
      ${bars}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'A leggyengébb pár: '+C[weakest.p].name+' ↔ '+C[weakest.n].name,color:C[weakest.p].color,html:`<p>${TIPS[weakest.p]}</p>`},
        {h:'Önkritika és teljesítmény',html:'<p>Gyakori félelem, hogy ha kedvesebb vagy magaddal, elengeded a mércét. A kutatás ennek az ellenkezőjét mutatja: az önegyüttérző emberek kudarc után <strong>hamarabb próbálkoznak újra</strong>, és kevésbé halogatnak (Breines & Chen, 2012; Sirois, 2014). A kemény önkritika a kudarctól való félelmet erősíti, ami pont az elkerülést táplálja.</p>'},
        {h:'Kapcsolódó térképek',html:'<p>Az alacsony önegyüttérzés gyakran a YSQ <em>Könyörtelen mércék</em> és <em>Büntető készenlét</em> sémáival, illetve az SMI <em>Követelő / Büntető szülő</em> módjával jár együtt. Az összegzés oldal ezeket egymás mellé teszi.</p>'}
      ])}
      ${H.refs(['<strong>Neff, K. D. (2003).</strong> The development and validation of a scale to measure self-compassion. <em>Self and Identity, 2</em>(3), 223–250.',
        '<strong>Raes, F., Pommier, E., Neff, K. D., & Van Gucht, D. (2011).</strong> Construction and factorial validation of a short form of the Self-Compassion Scale. <em>Clinical Psychology & Psychotherapy, 18</em>(3), 250–255.',
        '<strong>Breines, J. G., & Chen, S. (2012).</strong> Self-compassion increases self-improvement motivation. <em>Personality and Social Psychology Bulletin, 38</em>(9), 1133–1143.',
        '<strong>Sirois, F. M. (2014).</strong> Procrastination and stress: Exploring the role of self-compassion. <em>Self and Identity, 13</em>(2), 128–145.'])}`;
  }
});
})();

/* ═══════════ 4. TFEQ-R18 — EVÉSI VISELKEDÉS ═══════════ */
(function(){
const TF=[{t:'Teljesen igaz',v:4},{t:'Inkább igaz',v:3},{t:'Inkább nem igaz',v:2},{t:'Egyáltalán nem igaz',v:1}];
const it=(s,t)=>({s,t,opts:TF});
const S={
  EE:{name:'Érzelmi evés',en:'Emotional Eating',color:'#fb7185',n:3,desc:'Evés negatív érzelmekre (szorongás, lehangoltság, magány) válaszul.'},
  UE:{name:'Kontrollálatlan evés',en:'Uncontrolled Eating',color:'#fbbf24',n:9,desc:'A kontroll elvesztésének érzése evés közben, erős éhség- és ingerérzékenység.'},
  CR:{name:'Kognitív visszafogás',en:'Cognitive Restraint',color:'#60a5fa',n:6,desc:'Tudatos visszafogás a testsúly vagy az alak befolyásolására.'}
};
makeTest({
  id:'tfeq',key:'tfeq-r18-responses-v1',name:'Evési viselkedés (TFEQ-R18)',c1:'#2dd4bf',c2:'#60a5fa',
  tab:'Evési viselkedés',tabSub:'TFEQ-R18 · 18 item',
  header:{status:'valid',statusText:'Validált skála · Karlsson és mtsai (2000)',
    eyebrow:'Three-Factor Eating Questionnaire – R18 · Stunkard & Messick (1985), Karlsson et al. (2000)',
    title:'Mit csinál az evés, <em style="color:#2dd4bf">amikor feszült vagy</em>',
    lead:'A TFEQ-R18 három evési mintát mér: <strong>érzelmi evés</strong> (evés érzelmekre válaszul), <strong>kontrollálatlan evés</strong> (a kontroll elvesztésének érzése) és <strong>kognitív visszafogás</strong> (tudatos korlátozás). Itt nem a diéta a kérdés, hanem az, hogy az evés milyen szerepet kap a feszültségszabályozásban.',
    intro:'<p><strong>Kitöltés:</strong> válaszd ki, mennyire igaz rád az állítás általában. Az utolsó néhány kérdésnek saját válaszlehetőségei vannak.</p><p>Minden skála 0–100-ra van átszámolva. Magasabb = az adott minta erősebb. Nincsenek „jó” vagy „rossz” értékek, és ez nem étkezési zavar szűrése.</p>'},
  sections:[
    {title:'I. rész — <em>Állítások</em>',desc:'',items:[
      it('UE','Ha érzem egy sercegő steak vagy egy ínycsiklandó étel illatát, nagyon nehéz megállnom, hogy ne egyek, még akkor is, ha épp most fejeztem be egy étkezést.'),
      it('CR','Szándékosan kis adagokat szedek, hogy kontrolláljam a testsúlyomat.'),
      it('EE','Amikor szorongok, azon kapom magam, hogy eszem.'),
      it('UE','Néha, ha elkezdek enni, egyszerűen nem tudom abbahagyni.'),
      it('UE','Ha valakivel vagyok, aki eszik, gyakran annyira megéhezem, hogy én is enni kezdek.'),
      it('EE','Amikor le vagyok hangolva, gyakran túleszem magam.'),
      it('UE','Ha egy igazi finomságot látok, gyakran annyira megéhezem, hogy azonnal ennem kell.'),
      it('UE','Olyan éhes szoktam lenni, hogy a gyomrom feneketlen kútnak tűnik.'),
      it('UE','Mindig éhes vagyok, ezért nehezen hagyom abba az evést, mielőtt kiürül a tányérom.'),
      it('EE','Amikor magányos vagyok, evéssel vigasztalom magam.'),
      it('CR','Étkezéskor tudatosan visszafogom magam, hogy ne hízzak.'),
      it('CR','Bizonyos ételeket nem eszem meg, mert hizlalnak.'),
      it('UE','Bármikor elég éhes vagyok ahhoz, hogy egyek.')]},
    {title:'II. rész — <em>Gyakoriság és mérték</em>',desc:'',items:[
      {s:'UE',t:'Milyen gyakran érzed magad éhesnek?',opts:[{t:'Csak étkezéskor',v:1},{t:'Néha étkezések között',v:2},{t:'Gyakran étkezések között',v:3},{t:'Szinte mindig',v:4}]},
      {s:'CR',t:'Milyen gyakran kerülöd, hogy csábító ételeket halmozz fel otthon?',opts:[{t:'Szinte soha',v:1},{t:'Ritkán',v:2},{t:'Általában',v:3},{t:'Szinte mindig',v:4}]},
      {s:'CR',t:'Mennyire valószínű, hogy tudatosan kevesebbet eszel, mint amennyit szeretnél?',opts:[{t:'Valószínűtlen',v:1},{t:'Kissé valószínű',v:2},{t:'Közepesen valószínű',v:3},{t:'Nagyon valószínű',v:4}]},
      {s:'UE',t:'Előfordul, hogy falási rohamod van, pedig nem vagy éhes?',opts:[{t:'Soha',v:1},{t:'Ritkán',v:2},{t:'Néha',v:3},{t:'Legalább hetente egyszer',v:4}]},
      {s:'CR',t:'Egy 1-től 8-ig terjedő skálán, ahol az 1 azt jelenti, hogy egyáltalán nem fogod vissza magad az evésben (azt eszel, amit akarsz, amikor akarod), a 8 pedig a teljes visszafogást (folyamatosan korlátozod a bevitelt, és soha nem „engedsz”), hányast adnál magadnak?',opts:[{t:'1',v:1},{t:'2',v:1},{t:'3',v:2},{t:'4',v:2},{t:'5',v:3},{t:'6',v:3},{t:'7',v:4},{t:'8',v:4}]}]}
  ],
  score(R){const raw={EE:0,UE:0,CR:0};R.picks.forEach(p=>raw[p.item.s]+=p.opt.v);const o={};Object.keys(S).forEach(k=>o[k]=Math.round((raw[k]-S[k].n)/(3*S[k].n)*100));o.binge=(R.picks.find(p=>/falási rohamod/.test(p.item.t))||{opt:{v:1}}).opt.v;return o;},
  sum(s){const top=Object.keys(S).sort((a,b)=>s[b]-s[a])[0];return {h:'Legerősebb minta: '+S[top].name+' ('+s[top]+'/100)',d:Object.fromEntries(Object.keys(S).map(k=>[k,[S[k].name,s[k],0,100]]))};},
  render(R,s){
    const keys=Object.keys(S);
    const bars=H.bars('Három <em>evési minta</em>',[{title:'0–100 · magasabb = erősebb minta',color:'#2dd4bf',rows:keys.map(k=>({name:S[k].name+' <span style="color:var(--ink-lite-muted);font-size:12px">· '+S[k].en+'</span>',val:s[k],unit:'/100',pct:s[k],color:S[k].color}))}]);
    const notes=[];
    if(s.EE>=50)notes.push('<p><strong>Az érzelmi evés erős.</strong> Az evés itt szabályozó funkciót kap: gyorsan és megbízhatóan csillapítja a szorongást, a lehangoltságot vagy a magányt. Ez nem akaratgyengeség. Az idegrendszer a legközelebbi, legbiztosabb megnyugtató eszközhöz nyúl. A fenntartható változás ezért nem a tiltásból jön, hanem abból, hogy <strong>legyen más szabályozó eszköz is</strong>, ami a feszültség első perceiben elérhető.</p><p>Gyakorlati lépés: amikor érzed a késztetést, iktass be 2 percet. <em>Mit érzek most? Éhes vagyok, vagy feszült, fáradt, magányos?</em> Ha nem éhség, egy dolgot próbálj ki előbb a <a href="#test-ders" style="color:#99f6e4">DERS-SF</a> stratégiái közül. Ha utána is enni akarsz, egyél, de tudatosan.</p>');
    if(s.CR>=60&&(s.UE>=50||s.EE>=50))notes.push('<p><strong>Erős visszafogás és erős kontrollvesztés együtt.</strong> A kutatásokban gyakori ciklus: a merev korlátozás növeli a kontrollvesztés esélyét, ami újabb korlátozáshoz vezet. A megszakítás kulcsa általában a rugalmasabb, kevésbé „mindent vagy semmit” jellegű étkezési keret.</p>');
    if(s.binge>=4||(s.UE>=67&&s.EE>=67))notes.push(H.callout('<strong>Ha az evés rendszeresen kontrollálhatatlannak tűnik, vagy utána erős szégyen vagy kompenzálás (koplalás, túledzés) következik,</strong> érdemes szakemberrel (pszichológussal, dietetikussal) átbeszélni. Ez gyakori, jól kezelhető, és nem kell egyedül megoldani.','#fb7185'));
    if(!notes.length)notes.push('<p>Egyik minta sem kiugró. Az evés nálad jelenleg nem tűnik fő feszültségszabályozó eszköznek.</p>');
    return `<div class="res-eyebrow">Eredmény · Evési viselkedés</div>
      <h2 class="res-title">Érzelmi evés: <em>${s.EE}</em>/100</h2>
      <p class="res-lead">Kontrollálatlan evés: <strong>${s.UE}</strong> · Kognitív visszafogás: <strong>${s.CR}</strong> (mind 0–100).</p>
      ${bars}
      ${H.interp('Mit <em>jelent</em>',[{h:'Értelmezés',color:'#2dd4bf',html:notes.join('')},
        {h:'Kapcsolódó térképek',html:'<p>Az érzelmi evés a legtöbbet a <strong>DERS-SF</strong> (milyen ponton akad el a szabályozás) és az SMI <em>Elterelő öncsillapító</em> módja mellett mond. Az összegzés oldal az „Öncsillapító megküzdés” mintában köti össze őket.</p>'}])}
      ${H.refs(['<strong>Stunkard, A. J., & Messick, S. (1985).</strong> The three-factor eating questionnaire to measure dietary restraint, disinhibition and hunger. <em>Journal of Psychosomatic Research, 29</em>(1), 71–83.',
        '<strong>Karlsson, J., Persson, L. O., Sjöström, L., & Sullivan, M. (2000).</strong> Psychometric properties and factor structure of the Three-Factor Eating Questionnaire (TFEQ) in obese men and women. <em>International Journal of Obesity, 24</em>(12), 1715–1725.',
        '<strong>de Lauzon, B., et al. (2004).</strong> The Three-Factor Eating Questionnaire-R18 is able to distinguish among different eating patterns in a general population. <em>Journal of Nutrition, 134</em>(9), 2372–2380.'])}`;
  }
});
})();
