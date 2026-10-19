/* Személyiség hub — Big Five (IPIP-NEO-60) és VIA-72. A kézzel írt szemelyiseg.html-ből átköltöztetve;
   a pontozás, a tételsorrend (és így a mentett válaszok) változatlan. */

/* ═══════════ 1. BIG FIVE (IPIP-NEO-60) ═══════════ */
(function(){
const SCALE=[{v:1,l:'nem'},{v:2,l:'inkább nem'},{v:3,l:'semleges'},{v:4,l:'inkább igen'},{v:5,l:'teljesen'}];
// 5 domén × 6 facet × 2 tétel; r = fordított pontozású
const ITEMS=[
  ['N','N1-Anxiety','Gyakran aggódom.'],['N','N1-Anxiety','Ritkán érzem magam idegesnek vagy feszültnek.',1],
  ['N','N2-Anger','Könnyen felmérgesítenek.'],['N','N2-Anger','Ritkán vagyok dühös.',1],
  ['N','N3-Depression','Gyakran érzem magam kékben vagy szomorúnak.'],['N','N3-Depression','Ritkán érzem magam letörtnek.',1],
  ['N','N4-Self-Consciousness','Könnyen zavarba jövök.'],['N','N4-Self-Consciousness','Nem érdekel, mit gondolnak rólam.',1],
  ['N','N5-Immoderation','Nehezen tudok ellenállni a kísértéseknek.'],['N','N5-Immoderation','Ritkán engedek a hirtelen késztetéseknek.',1],
  ['N','N6-Vulnerability','Stressz alatt könnyen szétesek.'],['N','N6-Vulnerability','Nyomás alatt is higgadt maradok.',1],
  ['E','E1-Friendliness','Könnyen barátkozom új emberekkel.'],['E','E1-Friendliness','Tartok másoktól.',1],
  ['E','E2-Gregariousness','Szeretem a nagy társaságokat.'],['E','E2-Gregariousness','Kerülöm a tömeget.',1],
  ['E','E3-Assertiveness','Természetes vezető vagyok.'],['E','E3-Assertiveness','Hagyom, hogy mások irányítsanak.',1],
  ['E','E4-Activity','Mindig elfoglalt vagyok.'],['E','E4-Activity','Kényelmes, laza tempóban élek.',1],
  ['E','E5-Excitement-Seeking','Szeretek kockázatot vállalni.'],['E','E5-Excitement-Seeking','Kerülöm az izgalmas, veszélyes helyzeteket.',1],
  ['E','E6-Cheerfulness','Gyakran érzem magam boldognak és jókedvűnek.'],['E','E6-Cheerfulness','Ritkán vagyok igazán vidám.',1],
  ['O','O1-Imagination','Gazdag képzelőerőm van.'],['O','O1-Imagination','Nem szeretem az elvont gondolkodást.',1],
  ['O','O2-Artistic-Interests','Érzékeny vagyok a szépségre — művészet, természet.'],['O','O2-Artistic-Interests','A művészet nem érdekel különösebben.',1],
  ['O','O3-Emotionality','Mélyen átélem az érzéseimet.'],['O','O3-Emotionality','Ritkán vagyok érzelmileg felkavart.',1],
  ['O','O4-Adventurousness','Szeretem a változatosságot és a kalandot.'],['O','O4-Adventurousness','Az ismerős rutinokat részesítem előnyben.',1],
  ['O','O5-Intellect','Élvezem a komplex, elméleti problémákon való gondolkodást.'],['O','O5-Intellect','Nem érdekelnek az absztrakt kérdések.',1],
  ['O','O6-Liberalism','Nyitott vagyok az új, szokatlan értékekre.'],['O','O6-Liberalism','A hagyományos értékek melletti vagyok.',1],
  ['A','A1-Trust','Alapvetően bízom másokban.'],['A','A1-Trust','Gyanakvó vagyok mások szándékaival szemben.',1],
  ['A','A2-Morality','Őszintén viselkedem minden helyzetben.'],['A','A2-Morality','Készen állok blöffölni, ha az érdekem úgy kívánja.',1],
  ['A','A3-Altruism','Élvezem, ha segíthetek másoknak.'],['A','A3-Altruism','Nem érdekelnek mások problémái.',1],
  ['A','A4-Cooperation','Inkább együttműködök, mint versenyzek.'],['A','A4-Cooperation','Szeretem a konfliktust, ha kell.',1],
  ['A','A5-Modesty','Ritkán dicsekszem a teljesítményeimmel.'],['A','A5-Modesty','Úgy érzem, jobb vagyok, mint mások.',1],
  ['A','A6-Sympathy','Együttérzek a nehéz helyzetben lévőkkel.'],['A','A6-Sympathy','A "puha szívűség" a gyengeség jele.',1],
  ['C','C1-Self-Efficacy','Hiszek abban, hogy amit elkezdek, sikeresen befejezem.'],['C','C1-Self-Efficacy','Sokszor kudarcot vallok.',1],
  ['C','C2-Orderliness','Rendszeretők vagyok, minden a helyén van.'],['C','C2-Orderliness','Rendetlen vagyok.',1],
  ['C','C3-Dutifulness','Betartom a szabályokat és megígért dolgokat.'],['C','C3-Dutifulness','A szabályok nem mindig érvényesek rám.',1],
  ['C','C4-Achievement-Striving','Magas célokat tűzök ki magam elé.'],['C','C4-Achievement-Striving','Elégedett vagyok a jelenlegi teljesítményemmel.',1],
  ['C','C5-Self-Discipline','A kellemetlen feladatokat is befejezem.'],['C','C5-Self-Discipline','Halogatok.',1],
  ['C','C6-Cautiousness','Alaposan végiggondolom a döntéseimet.'],['C','C6-Cautiousness','Gyorsan, néha meggondolatlanul döntök.',1]];
const FACET={};ITEMS.forEach((x,i)=>FACET[i+1]=x[1]);
const DOMAINS={
  O:{name:'Nyitottság',en:'Openness to Experience',color:'#a78bfa',desc:'Új élmények, ötletek, esztétika iránti érzékenység.'},
  C:{name:'Lelkiismeretesség',en:'Conscientiousness',color:'#34d399',desc:'Szervezettség, kitartás, kötelesség-tudat, önkontroll.'},
  E:{name:'Extraverzió',en:'Extraversion',color:'#fbbf24',desc:'Társasági orientáció, energiaszint, pozitív érzelmek.'},
  A:{name:'Barátságosság',en:'Agreeableness',color:'#2dd4bf',desc:'Együttműködés, empátia, mások iránti bizalom.'},
  N:{name:'Neuroticizmus',en:'Neuroticism',color:'#fb7185',desc:'Érzelmi instabilitás, negatív érzelmek gyakorisága. <em>Alacsony érték</em> = érzelmi stabilitás.'}};
const SECTIONS={
  N:{title:'I. rész — Neuroticizmus (érzelmi stabilitás)',desc:'Anxiety · Anger · Depression · Self-Consciousness · Immoderation · Vulnerability. Alacsony érték = stabil; magas = reaktív.'},
  E:{title:'II. rész — Extraverzió',desc:'Friendliness · Gregariousness · Assertiveness · Activity · Excitement-Seeking · Cheerfulness.'},
  O:{title:'III. rész — Nyitottság az élményekre',desc:'Imagination · Artistic Interests · Emotionality · Adventurousness · Intellect · Liberalism.'},
  A:{title:'IV. rész — Barátságosság',desc:'Trust · Morality · Altruism · Cooperation · Modesty · Sympathy.'},
  C:{title:'V. rész — Lelkiismeretesség',desc:'Self-Efficacy · Orderliness · Dutifulness · Achievement-Striving · Self-Discipline · Cautiousness.'}};
// Tájékoztató sávok a skála terjedelme alapján (12–60), nem publikált normák.
function band(score,isN){
  if(isN){
    if(score<=22)return{key:'vlow',label:'Nagyon alacsony',color:'#34d399',desc:'kiemelkedő érzelmi stabilitás'};
    if(score<=30)return{key:'low',label:'Alacsony',color:'#2dd4bf',desc:'stabil érzelmi működés'};
    if(score<=42)return{key:'mid',label:'Közepes',color:'#fbbf24',desc:'a skála középső része'};
    if(score<=50)return{key:'high',label:'Magas',color:'#fb923c',desc:'emelkedett érzelmi reaktivitás'};
    return{key:'vhigh',label:'Nagyon magas',color:'#fb7185',desc:'kiemelkedő érzelmi reaktivitás'};
  }
  if(score<=22)return{key:'vlow',label:'Nagyon alacsony',color:'#93c5fd',desc:'a skála legalsó része'};
  if(score<=30)return{key:'low',label:'Alacsony',color:'#7dd3fc',desc:'a skála alsó része'};
  if(score<=42)return{key:'mid',label:'Közepes',color:'#60a5fa',desc:'a skála középső része'};
  if(score<=50)return{key:'high',label:'Magas',color:'#818cf8',desc:'a skála felső része'};
  return{key:'vhigh',label:'Nagyon magas',color:'#a78bfa',desc:'a skála legfelső része'};
}
const INTERP={
  N:{vlow:`<strong>Kiemelkedő érzelmi stabilitás.</strong> Ritkán aggódsz, nem kavarnak fel a stresszes helyzetek, nyugodt vagy nyomás alatt is. Ez jelentős erőforrás. Tisztázó kérdés: előfordul, hogy a nehéz érzéseket (a sajátodat vagy másokét) később veszed észre, mint szeretnéd?`,
    low:`Stabil érzelmi működés. Az élet stresszforrásait viszonylag könnyen kezeled. Nem vagy immunis a szorongásra vagy szomorúságra — de nem a domináns hangolódásod.`,
    mid:`Tipikus tartomány. Vannak érzelmi hullámhegyek és hullámvölgyek, ami normális. A stresszkezelési képességed helyzet- és kontextusfüggő.`,
    high:`<strong>Emelkedett érzelmi reaktivitás.</strong> Erősebb, gyakrabban felszínre törő negatív érzelmek (aggodalom, düh, szomorúság). Nem "gyengeség" — a magasabb neuroticizmus együtt jár a kreativitással, empátiával, önreflexióval is. Klinikai szempontból figyelemre méltó, ha distresszt okoz.`,
    vhigh:`<strong>Kiemelkedő reaktivitás.</strong> Az érzelmi élet intenzitása és a stresszorokra adott válasz erősen kifejezett. Ha ez distresszt okoz, mindfulness-alapú és kognitív munka (CBT, ACT) hatékony módszerek. A DERS és PHQ-9/GAD-7 skálák pontosabban célzottan mérnek.`},
  E:{vlow:`<strong>Erős introvertált profil.</strong> Az energiádat egyedül tölted fel, kis csoportokat és mély beszélgetéseket preferálsz.`,
    low:`Introvertált oldal. A hosszabb szociális interakciók fárasztanak, csendes idő szükséges a regenerációhoz.`,
    mid:`Kiegyensúlyozott (ambivert). Néha keresed a társaságot, néha a magányt — kontextus-függő.`,
    high:`Extravertált oldal. Az energiádat emberek között kapod, kereseted a szociális interakciót.`,
    vhigh:`<strong>Erős extravertált profil.</strong> Magas szociális energia, aktivitás, kereskedelmi keresés. Több emberrel körülvéve érzed magad a legjobban.`},
  O:{vlow:`<strong>Konvencionális gondolkodás.</strong> A hagyományos, jól bevált utakat kedveled, kevésbé keresed az újat, absztraktot vagy szokatlant.`,
    low:`Gyakorlatiasabb, konkrét gondolkodás. Az elméleti absztrakciók vagy művészi élmények kevésbé fontosak.`,
    mid:`Kiegyensúlyozott. Nyitott vagy az újra, de nem élsz állandó keresésben.`,
    high:`Nyitott gondolkodás. Kereseted az új élményeket, ötleteket, esztétikai tapasztalatokat.`,
    vhigh:`<strong>Erősen nyitott profil.</strong> Kreativitás, intellektuális kíváncsiság, esztétikai érzékenység, filozófiai gondolkodás. Gyakran együtt jár a szokatlansággal.`},
  A:{vlow:`<strong>Versenyző, direkt orientáció.</strong> Az együttműködés és mások szempontjai kevésbé vezérelnek — a saját céljaid előrébb valók.`,
    low:`Kritikus, néha távolságtartó orientáció. Nem vagy naiv, gyanakvóbb vagy mások szándékaival kapcsolatban.`,
    mid:`Kiegyensúlyozott. Együttműködsz, de nem áldozod fel a saját érdekedet minden áron.`,
    high:`Együttműködő, empatikus profil. Fontos számodra a harmónia, mások segítése, a bizalom.`,
    vhigh:`<strong>Erősen barátságos profil.</strong> Nagyfokú együttműködés, empátia, altruizmus. Kockázat: túlzott alkalmazkodás, önmagad háttérbe helyezése.`},
  C:{vlow:`<strong>Impulzív, spontán orientáció.</strong> A struktúra, tervezés, kötelesség-tudat kevésbé domináns. Kreatív rugalmasság — vagy káosz.`,
    low:`Lazább, kevésbé strukturált stílus. Nem szeretsz szabályokhoz és rutinokhoz kötve lenni.`,
    mid:`Kiegyensúlyozott. Van struktúrád, de nem merev vagy.`,
    high:`Szervezett, kitartó, célorientált. Betartod a szabályokat, végigviszed amit elkezdesz.`,
    vhigh:`<strong>Kiemelkedően lelkiismeretes profil.</strong> Erős struktúra, kötelesség-érzet, tökéletességre törekvés. Kockázat: perfekcionizmus, burnout, rugalmatlan kontrollra való igény.`}};
const ORDER=['O','C','E','A','N'];
makeTest({
  id:'bf',key:'bf-responses-v1',name:'Big Five',c1:'#60a5fa',c2:'#a78bfa',
  tab:'Big Five',tabSub:'IPIP-NEO-60 · 60 item',scale:SCALE,
  header:{status:'model',statusText:'Modell-alapú rövid változat · nem hivatalos tételkészlet',
    eyebrow:'IPIP-alapú 60 tételes változat · a NEO-PI-R 30 facetjének szerkezetére (Johnson, 2014)',
    title:'A te <em style="color:#60a5fa">OCEAN-profilod</em>',
    lead:'A Big Five modell 60 éves konszenzus arról, hogy 5 alapdimenzió mentén szisztematikusan leírhatók a személyiségjegyek. Ez a legjobban validált, kultúrákon átívelő személyiségmodell a pszichológiában.',
    intro:'<p><strong>Kitöltési útmutató:</strong> 60 állítást olvasol. Mindegyiknél értékeld 1–5 skálán, mennyire igaz rád. Ne "az ideális self"-et válaszold — hanem az aktuális működésedet.</p><p>1 = egyáltalán nem igaz · 2 = inkább nem · 3 = semleges · 4 = inkább igen · 5 = teljesen igaz. Bizonyos itemek fordított pontozásúak (a rendszer kezeli).</p>'},
  sections:['N','E','O','A','C'].map(d=>({title:SECTIONS[d].title,desc:SECTIONS[d].desc,items:ITEMS.filter(x=>x[0]===d).map(x=>Object.assign({s:x[0],t:x[2]},x[3]?{r:true}:{}))})),
  score(R){const o={};ORDER.forEach(d=>o[d]=R.sum(d));
    const fac={};R.items.forEach(i=>{fac[FACET[i.n]]=(fac[FACET[i.n]]||0)+i.v;});o.facets=fac;return o;},
  sum(s){return {d:Object.fromEntries(ORDER.map(k=>[k,[DOMAINS[k].name,s[k],12,60]]))};},
  render(R,s){
    const radar=H.radar(ORDER.map(d=>({label:DOMAINS[d].name,value:s[d],shown:s[d]+'/60'})),{max:60,min:12,stroke:'#60a5fa',fill:'rgba(96,165,250,0.28)'});
    const legend=ORDER.map(d=>({color:DOMAINS[d].color,label:DOMAINS[d].name,val:'· '+s[d]+'/60'}));
    const cards=`<div class="score-grid">${ORDER.map(d=>{const v=s[d],dm=DOMAINS[d],b=band(v,d==='N');
      return `<div class="score-card" style="--sc:${b.color}"><div class="abbr">${d} · ${dm.en}</div><h4><em>${dm.name}</em></h4><div class="val">${v}</div><div class="out">/ 60 · ${b.label}</div><div class="band">${b.desc}</div><div class="bar"><div class="bar-fill" style="width:${(v-12)/48*100}%"></div></div></div>`;}).join('')}</div>`;
    const facets=H.bars('Facet-szintű <em>bontás</em>',ORDER.map(d=>({title:DOMAINS[d].name,color:DOMAINS[d].color,
      rows:[...new Set(ITEMS.filter(x=>x[0]===d).map(x=>x[1]))].map(f=>({name:f.split('-').slice(1).join('-'),val:s.facets[f],unit:'/10',pct:(s.facets[f]-2)/8*100}))})));
    const interp=H.interp('Klinikai <em>értelmezés</em>',ORDER.map(d=>{const v=s[d],dm=DOMAINS[d],b=band(v,d==='N');
      return {h:`${dm.name} — ${b.label} (${v}/60)`,color:dm.color,html:`<p style="font-size:13px;color:var(--ink-lite-muted);font-style:italic;margin-bottom:8px">${dm.desc}</p><p>${INTERP[d][b.key]}</p>`};}));
    return `<div class="res-eyebrow">Eredmény · Big Five profil · Facet-szint</div>
      <h2 class="res-title">A te <em>OCEAN-térképed</em></h2>
      <p class="res-lead">Öt domén-pontszám + 30 facet-pontszám. A domén az általános tendencia, a facet a részlet. A sávok (alacsony–magas) a skála terjedelméből számolt <strong>tájékoztató</strong> határok, nem publikált normák.</p>
      ${H.chart('Big Five <em>térkép</em>','Öt tengely · min 12 · max 60',radar,legend)}
      ${cards}${facets}${interp}
      ${H.refs(['<strong>Costa, P. T., & McCrae, R. R. (1992).</strong> Revised NEO Personality Inventory (NEO-PI-R). Psychological Assessment Resources.',
        '<strong>Johnson, J. A. (2014).</strong> Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. <em>Journal of Research in Personality, 51</em>, 78–89.',
        '<strong>Goldberg, L. R. (1993).</strong> The structure of phenotypic personality traits. <em>American Psychologist, 48(1)</em>, 26–34.',
        '<strong>Soto, C. J., & John, O. P. (2017).</strong> The next Big Five Inventory (BFI-2). <em>Journal of Personality and Social Psychology, 113(1)</em>, 117–143.'])}`;
  }
});
})();

/* ═══════════ 2. VIA KARAKTER-ERŐK (VIA-72) ═══════════ */
(function(){
const SCALE=[{v:1,l:'nem'},{v:2,l:'inkább nem'},{v:3,l:'néha'},{v:4,l:'gyakran'},{v:5,l:'nagyon'}];
const STRENGTHS={
  creativity:{name:'Kreativitás',en:'Creativity',v:'WK',desc:'Új, hasznos gondolatok, megoldások alkotása.',items:['Új ötleteim vannak, amik gyakran meglepik a többieket.','Élvezek elmerülni új és szokatlan gondolatokban.','Az emberek "kreatívnak" tartanak.']},
  curiosity:{name:'Kíváncsiság',en:'Curiosity',v:'WK',desc:'Aktív érdeklődés minden iránt.',items:['Sok minden felkelti az érdeklődésemet.','Élvezem az újdonságokat, akárhol találkozom velük.','Élvezettel fedezek fel új helyeket, ötleteket, tapasztalatokat.']},
  judgment:{name:'Ítélőképesség',en:'Judgment',v:'WK',desc:'Kritikus gondolkodás, minden oldal mérlegelése.',items:['Alaposan végiggondolom a dolgokat, mielőtt döntést hozok.','Meg tudom vizsgálni egy kérdés több oldalát.','Nem hozok elhamarkodott ítéleteket.']},
  learning:{name:'Tanulás szeretete',en:'Love of Learning',v:'WK',desc:'Új készségek, témák szisztematikus elsajátítása.',items:['Élvezem az új dolgok tanulását.','Bármikor lehetőségem van tanulni valami újat, kihasználom.','Az olvasás, kurzusok, könyvek fontos részei az életemnek.']},
  perspective:{name:'Bölcsesség / perspektíva',en:'Perspective',v:'WK',desc:'Az élet nagy összefüggéseinek látása; jó tanácsok másoknak.',items:['Az emberek gyakran kérnek tőlem tanácsot fontos kérdésekben.','Képes vagyok a nagy összefüggéseket látni.','A tapasztalataimból értékes tanulságokat vonok le.']},
  bravery:{name:'Bátorság',en:'Bravery',v:'CG',desc:'Nem hátrálás meg a nehézségek, fenyegetés vagy fájdalom elől.',items:['Kiállok azért, amiben hiszek, akkor is, ha népszerűtlen.','Nem hátrálok meg a nehézségektől.','Fel merek szólalni, amikor kell.']},
  perseverance:{name:'Kitartás',en:'Perseverance',v:'CG',desc:'A megkezdett dolgok végigvitele, akadályok ellenére.',items:['Amit elkezdek, azt befejezem.','Nem adom fel könnyen, még akadályok esetén sem.','Kitartó vagyok, akkor is, ha lassan halad.']},
  honesty:{name:'Őszinteség',en:'Honesty',v:'CG',desc:'Igazmondás, hiteles önmagam vállalása.',items:['Őszinte vagyok, akkor is, ha kényelmetlen.','Nem mondok olyat, ami nem igaz.','Vállalom, hogy ki vagyok.']},
  zest:{name:'Lelkesedés',en:'Zest',v:'CG',desc:'Energikus, lelkes életfelfogás.',items:['Energikusan lépek az életbe.','Lelkesedéssel csinálom, amit csinálok.','Élvezem az életet.']},
  love:{name:'Szeretet',en:'Love',v:'HU',desc:'Közeli kapcsolatokban értékelt és értékel másokat.',items:['Sokat jelentenek nekem a közeli emberi kapcsolatok.','Fontos, hogy szeretve érezzem magam.','Mély kapcsolatokat építek másokkal.']},
  kindness:{name:'Kedvesség',en:'Kindness',v:'HU',desc:'Segítségnyújtás, jóság, gondoskodás.',items:['Örömet szerez, ha segíthetek másoknak.','Kedves vagyok az emberekkel.','Odafigyelek mások szükségleteire.']},
  social_iq:{name:'Szociális intelligencia',en:'Social Intelligence',v:'HU',desc:'Mások és saját érzelmek megértése, ügyes szociális helyzetkezelés.',items:['Jól olvasom mások érzelmeit.','Tudom, hogyan érzik magukat mások, akkor is, ha nem mondják ki.','Ügyesen navigálok szociális helyzetekben.']},
  teamwork:{name:'Csapatmunka',en:'Teamwork',v:'JU',desc:'A csoport javára dolgozás, lojalitás.',items:['Élvezem a csapatban való munkát.','A csoport eredménye fontos nekem.','Lojális vagyok a csoportokhoz, amikbe tartozom.']},
  fairness:{name:'Igazságosság',en:'Fairness',v:'JU',desc:'Mindenkit egyenlően kezelése, elfogulatlanság.',items:['Igyekszem mindenkivel igazságosan bánni.','Az egyenlő elbánás fontos elvem.','Nem tervezek elfogultan.']},
  leadership:{name:'Vezetői készség',en:'Leadership',v:'JU',desc:'Csoport szervezése, motiválása, közös célok elérése.',items:['Természetesen veszem át a vezetést egy csoportban.','Jól tudok másokat motiválni közös cél felé.','Az emberek követnek engem.']},
  forgiveness:{name:'Megbocsátás',en:'Forgiveness',v:'TE',desc:'A hibázók iránti irgalom, nem bosszúállás.',items:['Meg tudok bocsátani másoknak.','Nem tartok haragot sokáig.','Elengedem a régi sérelmeket.']},
  humility:{name:'Alázat',en:'Humility',v:'TE',desc:'Saját teljesítmények nem-túlhangsúlyozása.',items:['Nem hangsúlyozom túl a saját teljesítményeimet.','Elismerem a hibáimat.','Nem érzem magam különb embernek másoknál.']},
  prudence:{name:'Óvatosság',en:'Prudence',v:'TE',desc:'Körültekintő döntéshozatal, nem-kockáztatás megbánható helyzeteken.',items:['Óvatos vagyok a döntéseimben.','Nem mondok vagy csinálok olyat, amit később megbánhatok.','Végiggondolom a következményeket.']},
  self_regulation:{name:'Önszabályozás',en:'Self-Regulation',v:'TE',desc:'Érzelmek, ösztönök, viselkedés tudatos szabályozása.',items:['Uralom a saját érzelmeimet.','Fegyelmezett vagyok.','A hosszú távú célom miatt le tudok mondani rövid távú örömről.']},
  beauty:{name:'Szépség értékelése',en:'Appreciation of Beauty',v:'TR',desc:'Természet, művészet, kiválóság iránti csodálat.',items:['Mély élvezettel csodálom a természet szépségét.','A művészet mély érzelmeket vált ki belőlem.','A kiváló emberi teljesítmény meghat.']},
  gratitude:{name:'Hála',en:'Gratitude',v:'TR',desc:'Az élet jó dolgainak tudatos észlelése és köszönete.',items:['Hálát érzek sokféle dolog iránt az életemben.','Rendszeresen köszönetet mondok azoknak, akik segítettek.','Tudatosan megállok észrevenni a jó dolgokat.']},
  hope:{name:'Remény',en:'Hope',v:'TR',desc:'Optimizmus, a jövőbe vetett bizakodás.',items:['Hiszem, hogy jó dolgok fognak történni.','Optimista vagyok a jövőmet illetően.','Nehéz helyzetekben is látom a fényt.']},
  humor:{name:'Humor',en:'Humor',v:'TR',desc:'Játékosság, nevetés-kelt, könnyed nézőpont.',items:['Szeretem megnevettetni az embereket.','A humor fontos része az életemnek.','Játékos vagyok.']},
  spirituality:{name:'Spiritualitás',en:'Spirituality',v:'TR',desc:'Az élet nagyobb értelmére, célra való érzékenység.',items:['Van egy magasabb célom, ami vezet.','Az életemnek mélyebb értelme van.','Kapcsolatot érzek valami nálam nagyobbal.']}};
const VIRTUES={WK:{name:'Bölcsesség és tudás',color:'#a78bfa'},CG:{name:'Bátorság',color:'#fb7185'},HU:{name:'Emberség',color:'#fbbf24'},
  JU:{name:'Igazságosság',color:'#60a5fa'},TE:{name:'Mértékletesség',color:'#34d399'},TR:{name:'Transzcendencia',color:'#fde047'}};
const VO=['WK','CG','HU','JU','TE','TR'];
makeTest({
  id:'via',key:'via-responses-v1',name:'VIA-72',c1:'#fbbf24',c2:'#fb7185',
  tab:'Karakter-erők',tabSub:'VIA-72 · 72 item',scale:SCALE,
  header:{status:'model',statusText:'Modell-alapú rövid változat · nem hivatalos tételkészlet',
    eyebrow:'VIA Character Strengths · Peterson & Seligman (2004)',
    title:'A te <em style="color:#fbbf24">karakter-erőid</em>',
    lead:'A VIA klasszifikáció 24 univerzális karakter-erőt ír le, 6 erény-csoportba rendezve. A pozitív pszichológia egyik alapmodellje. A cél nem a "gyengeségek javítása" — hanem a saját <em>szignatúra-erőid</em> felismerése és tudatos használata. Erős empirikus bázis: 75+ ország, 3M+ kitöltő.',
    intro:'<p><strong>Kitöltési útmutató:</strong> 72 állítás. Mindegyiknél értékeld 1–5 skálán, mennyire igaz rád. A cél nem a "kívánt" válasz, hanem a valóság.</p><p>Skála: 1 = egyáltalán nem jellemző · 2 = inkább nem · 3 = néha · 4 = gyakran · 5 = nagyon jellemző.</p>'},
  sections:Object.entries(STRENGTHS).map(([k,st])=>({title:`${st.name} <em>· ${st.en}</em>`,desc:VIRTUES[st.v].name,items:st.items.map(t=>({s:k,t}))})),
  score(R){
    const all=Object.keys(STRENGTHS).map(k=>({key:k,name:STRENGTHS[k].name,en:STRENGTHS[k].en,v:STRENGTHS[k].v,desc:STRENGTHS[k].desc,value:R.sum(k)})).sort((a,b)=>b.value-a.value);
    const virt=VO.map(v=>{const ks=Object.keys(STRENGTHS).filter(k=>STRENGTHS[k].v===v),raw=ks.reduce((x,k)=>x+R.sum(k),0);
      return {v,name:VIRTUES[v].name,color:VIRTUES[v].color,raw,avg:(raw/ks.length).toFixed(1),max:ks.length*15};});
    return {all,virt};
  },
  sum(s){return {h:s.all.slice(0,5).map(x=>x.name).join(', '),d:Object.fromEntries(s.all.map(x=>[x.key,[x.name,x.value,3,15]]))};},
  render(R,s){
    const all=s.all,top5=all.slice(0,5),bottom5=all.slice(-5).reverse(),C=v=>VIRTUES[v].color;
    const radar=H.radar(s.virt.map(v=>({label:v.name,value:parseFloat(v.avg)})),{max:15,min:3,stroke:'#fbbf24',fill:'rgba(251,191,36,0.28)'});
    const legend=s.virt.map(v=>({color:v.color,label:v.name,val:'· átlag '+v.avg+'/15'}));
    const rank=(title,list,withDesc)=>`<div class="rank-list"><h3>${title}</h3>${list.map((x,i)=>`<div class="rank-item${withDesc||i<5?' top':''}" style="--rc:${C(x.v)};--top-color:${C(x.v)}"><div class="rank-pos">${i+1}.</div><div><div class="rank-name"><em>${x.name}</em> · <span style="color:var(--ink-lite-muted);font-size:12px">${withDesc?x.en:VIRTUES[x.v].name}</span></div>${withDesc?`<div class="rank-desc">${x.desc}</div>`:''}</div><div class="rank-score">${x.value}<span>/15</span></div></div>`).join('')}</div>`;
    const topVirtue=[...s.virt].sort((a,b)=>parseFloat(b.avg)-parseFloat(a.avg))[0];
    const interp=H.interp('Klinikai <em>értelmezés</em>',[
      {h:'Szignatúra-erő (top 1) — '+top5[0].name,color:C(top5[0].v),html:`<p>${top5[0].desc} <strong>Ez az, aki tényleg vagy</strong> — nem az, ami lenni szeretnél. Seligman & Peterson kutatása azt mutatja: a szignatúra-erő <em>heti szintű tudatos használata</em> mérhető jóllét-növekedést hoz. Kérdezd meg magadtól: az elmúlt héten hol tudtad ezt használni? Hol lehetett volna még?</p>`},
      {h:'Top 2-5 — a szignatúra-portré',color:C(top5[1].v),html:`<p>A top 5 erő együtt jellemzi a "központi karakteredet" — <strong>${top5.map(x=>x.name).join(' · ')}</strong>. Ez az a kombináció, amit másokban ritkán találsz meg ugyanígy. Kérdés a hét kezdetéhez: melyik szignatúra-erődet fogod tudatosan használni a következő 7 napban?</p>`},
      {h:'Bottom 5 — a "gyengeségek" mítosza',color:C(bottom5[4].v),html:`<p>Az alsó 5: <strong>${[4,3,2,1,0].map(i=>bottom5[i].name).join(' · ')}</strong>. <strong>Ez NEM egy fejlesztendő terület lista.</strong> A pozitív pszichológia egyik központi tanulsága: az idő 80%-át a szignatúra-erők használatával, nem a gyengeségek "javításával" érdemes tölteni. A gyengeségeket ELÉG "elég jó" szinten tartani.</p>`},
      {h:'Domináns erény-csoport — '+topVirtue.name,color:topVirtue.color,html:`<p>Az erény-csoportok szintjén a <strong>${topVirtue.name}</strong> a legerősebb (átlag ${topVirtue.avg}/15). Ez az általános irányultságod — hogy milyen típusú "jóság" felé húz a rendszered természetesen.</p>`},
      {h:'Praktikus lépések',color:'var(--gold-bright)',html:`<p><strong>1. Szignatúra-erő gyakorlat</strong> (Seligman 2005 · empirikusan validált): 7 napig minden nap találj egy új módot, ahogyan a top erődet használhatod. Írd le végig — mit tettél, milyen érzés volt.</p><p><strong>2. "Erő-tudatos" partnerkommunikáció:</strong> mondd el a partnerednek, kollégáidnak, mi a top 3 szignatúra-erőd. Kérj visszajelzést: látják-e ezt benned.</p><p><strong>3. Karrier-illesztés:</strong> a saját üzleted (business/ERP consulting) mely részei használják a top 3 erődet? Melyek azok, ahol egyáltalán nem? A frusztráció-források gyakran ott vannak, ahol a szignatúra-erő NEM jut szóhoz.</p>`}]);
    return `<div class="res-eyebrow">Eredmény · 24 karakter-erő rangsora · 6 erény-csoport</div>
      <h2 class="res-title">A te <em>szignatúra-erőid</em></h2>
      <p class="res-lead">A top 5 erő a te "szignatúra-profilod" — az, ami tényleg vagy, nem az, ami lenni szeretnél. Peterson & Seligman javaslata: heti szinten használd tudatosan a szignatúra-erődet, akár egyet-egyet váltogatva.</p>
      ${H.chart('Erény-csoportok <em>térképe</em>','6 erény-csoport · átlag 3–15',radar,legend)}
      ${rank('Top 5 <em>szignatúra-erőd</em>',top5,true)}
      ${rank('Mind a 24 erő <em>rangsorolva</em>',all,false)}
      ${interp}
      ${H.refs(['<strong>Peterson, C., & Seligman, M. E. P. (2004).</strong> <em>Character strengths and virtues: A handbook and classification.</em> Oxford University Press.',
        '<strong>Niemiec, R. M. (2018).</strong> <em>Character strengths interventions: A field guide for practitioners.</em> Hogrefe.',
        '<strong>McGrath, R. E. (2015).</strong> Character strengths in 75 nations: An update. <em>Journal of Positive Psychology, 10(1)</em>, 41–52.',
        '<strong>Seligman, M. E. P., Steen, T. A., Park, N., & Peterson, C. (2005).</strong> Positive psychology progress: Empirical validation of interventions. <em>American Psychologist, 60</em>(5), 410–421.'])}`;
  }
});
})();
