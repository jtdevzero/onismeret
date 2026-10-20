/* XVI. Erőforrások — Élettel való elégedettség (SWLS), optimizmus (LOT-R), hála (GQ-6), alapszükségletek (BPNSFS).
   Kutatási és nem kereskedelmi célra szabadon használható skálák; a magyar szöveg saját fordítás. */
const AGREE7=[{v:1,l:'egyáltalán nem értek egyet'},{v:2,l:'nem értek egyet'},{v:3,l:'inkább nem értek egyet'},{v:4,l:'semleges'},{v:5,l:'inkább egyetértek'},{v:6,l:'egyetértek'},{v:7,l:'teljesen egyetértek'}];
const LOT_SCALE=[{v:0,l:'egyáltalán nem értek egyet'},{v:1,l:'nem értek egyet'},{v:2,l:'semleges'},{v:3,l:'egyetértek'},{v:4,l:'teljesen egyetértek'}];
const BPN_SCALE=[{v:1,l:'egyáltalán nem igaz'},{v:2,l:'inkább nem igaz'},{v:3,l:'részben igaz'},{v:4,l:'inkább igaz'},{v:5,l:'teljesen igaz'}];

/* ═══════════ 1. SWLS — ÉLETTEL VALÓ ELÉGEDETTSÉG ═══════════ */
(function(){
/* Diener: 31–35 rendkívül elégedett · 26–30 elégedett · 21–25 kissé elégedett · 20 semleges · 15–19 kissé elégedetlen · 10–14 elégedetlen · 5–9 rendkívül elégedetlen */
const band=t=>t>=31?{l:'Rendkívül elégedett',c:'#10b981'}:t>=26?{l:'Elégedett',c:'#34d399'}:t>=21?{l:'Kissé elégedett',c:'#60a5fa'}:t===20?{l:'Semleges',c:'#94a3b8'}:t>=15?{l:'Kissé elégedetlen',c:'#f59e0b'}:t>=10?{l:'Elégedetlen',c:'#f97316'}:{l:'Rendkívül elégedetlen',c:'#e11d48'};
makeTest({
  id:'swls',key:'swls-responses-v1',name:'Élettel való elégedettség (SWLS)',c1:'#10b981',c2:'#d4a017',
  tab:'Elégedettség',tabSub:'SWLS · 5 item',scale:AGREE7,
  header:{status:'valid',statusText:'Validált skála · Diener és mtsai (1985)',
    eyebrow:'Satisfaction With Life Scale · Ed Diener',
    title:'Mennyire vagy <em style="color:#10b981">elégedett</em> az életeddel',
    lead:'Az SWLS a szubjektív jóllét kognitív oldalát méri: amikor egészében ránézel az életedre, mennyire tartod jónak a saját mércéd szerint. Nem a mai hangulatot, hanem az összképet.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal?</p><p>Összpontszám: 5–35. A szerző sávjai: 20 semleges, 21–25 kissé elégedett, 26–30 elégedett, 31 felett rendkívül elégedett.</p>'},
  sections:[{title:'5 állítás',desc:'',items:[
    {s:'p',t:'Az életem a legtöbb szempontból közel áll az ideálishoz.'},
    {s:'p',t:'Az életkörülményeim kiválóak.'},
    {s:'p',t:'Elégedett vagyok az életemmel.'},
    {s:'p',t:'Eddig megkaptam azokat a fontos dolgokat, amelyeket az élettől akartam.'},
    {s:'p',t:'Ha újraélhetném az életemet, szinte semmin nem változtatnék.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Élettel való elégedettség (SWLS)',s.total,5,35]}};},
  render(R,s){
    const b=band(s.total),i5=R.items[4].raw,i4=R.items[3].raw;
    return `<div class="res-eyebrow">Eredmény · SWLS</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 35.</p>
      ${H.chart('Élettel való elégedettség','5–35 · semleges pont: 20',H.gauge({name:'SWLS',sub:b.l,val:s.total,unit:'/ 35',min:5,max:35,color:b.c,zones:[{from:5,to:14.5,color:'rgba(225,29,72,0.2)'},{from:14.5,to:20.5,color:'rgba(245,158,11,0.2)'},{from:20.5,to:25.5,color:'rgba(96,165,250,0.2)'},{from:25.5,to:35,color:'rgba(52,211,153,0.22)'}],labels:['5','15','21','26','35']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=26?'<p>Egészében jónak tartod az életedet. Ez nem azt jelenti, hogy minden rendben van, hanem hogy az összkép a saját mércéd szerint kedvező.</p>':s.total>=20?'<p>Vegyes összkép: az életed egyes területei rendben vannak, mások nem. A legtöbb felnőtt ebben a sávban van; érdemes megnézni, melyik terület húzza le.</p>':'<p>Most elégedetlen vagy az életed összképével. Ez gyakran egy-két nagy területből fakad (munka, kapcsolat, egészség, anyagiak), vagy abból, hogy a jelen messze van attól, amit szerettél volna. Ha ez lehangoltsággal jár, töltsd ki a PHQ-9-et is.</p>'},
        (i4>=5&&i5<=3)?{h:'Elégedett a múlttal, változtatna',html:'<p>Megkaptad a fontos dolgokat, mégis sok mindenen változtatnál. Ez gyakran azt jelzi, hogy a céljaid megváltoztak: ami korábban fontos volt, ma már nem elég. Érdemes újragondolni, mi most a fontos (lásd: MLQ, PVQ-21).</p>'}:null,
        {h:'Kapcsolódó térképek',html:'<p>Az elégedettség az érzelmi jólléttel (WHO-5) és az alapszükségletek kielégülésével (BPNSFS) együtt adja a jóllét teljes képét. A kutatások szerint a legerősebb előrejelzői a kapcsolatok minősége és az, hogy az életed a saját értékeid szerint alakul.</p>'}
      ])}
      ${H.refs(['<strong>Diener, E., Emmons, R. A., Larsen, R. J., & Griffin, S. (1985).</strong> The Satisfaction With Life Scale. <em>Journal of Personality Assessment, 49</em>(1), 71–75.',
        '<strong>Pavot, W., & Diener, E. (2008).</strong> The Satisfaction With Life Scale and the emerging construct of life satisfaction. <em>Journal of Positive Psychology, 3</em>(2), 137–152.'])}`;
  }
});
})();

/* ═══════════ 2. LOT-R — OPTIMIZMUS ═══════════ */
(function(){
const band=t=>t>=19?{l:'Optimista',c:'#10b981'}:t>=14?{l:'Mérsékelten optimista',c:'#60a5fa'}:{l:'Pesszimista beállítódás',c:'#f59e0b'};
makeTest({
  id:'lotr',key:'lotr-responses-v1',name:'Optimizmus (LOT-R)',c1:'#d4a017',c2:'#10b981',
  tab:'Optimizmus',tabSub:'LOT-R · 10 item',scale:LOT_SCALE,
  header:{status:'valid',statusText:'Validált skála · Scheier, Carver & Bridges (1994)',
    eyebrow:'Life Orientation Test – Revised · Michael F. Scheier & Charles S. Carver',
    title:'Mennyire <em style="color:#d4a017">várod a jót</em>',
    lead:'A LOT-R a diszpozicionális optimizmust méri: azt az általános várakozást, hogy a jövőben inkább jó dolgok történnek veled, mint rosszak. A kutatások szerint az optimizmus nem naivitás: aktívabb megküzdéssel és jobb egészséggel jár.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal? A tíz állításból négy csak töltelék (a valódi kérdések elfedésére szolgál, nem számít bele), három fordított pontozású.</p><p>Összpontszám: 0–24. Gyakran használt tájékozódó sávok: 0–13 alacsony, 14–18 közepes, 19–24 magas.</p>'},
  sections:[{title:'10 állítás',desc:'',items:[
    {s:'O',t:'Bizonytalan időkben általában a legjobbra számítok.'},
    {s:'F',t:'Könnyen el tudok lazulni.'},
    {s:'O',t:'Ha valami elromolhat, nálam el is romlik.',r:true},
    {s:'O',t:'Mindig optimista vagyok a jövőmet illetően.'},
    {s:'F',t:'Nagyon élvezem a barátaim társaságát.'},
    {s:'F',t:'Fontos számomra, hogy elfoglalt legyek.'},
    {s:'O',t:'Szinte soha nem számítok arra, hogy a dolgok az én kedvem szerint alakulnak.',r:true},
    {s:'F',t:'Nem borulok ki könnyen.'},
    {s:'O',t:'Ritkán számítok arra, hogy jó dolgok történnek velem.',r:true},
    {s:'O',t:'Összességében több jó dolgot várok, mint rosszat.'}]}],
  score(R){const t=R.sum('O');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Optimizmus (LOT-R)',s.total,0,24]}};},
  render(R,s){
    const b=band(s.total);
    return `<div class="res-eyebrow">Eredmény · LOT-R</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 24 (a négy töltelékállítás nélkül).</p>
      ${H.chart('Optimizmus','0–24 · tájékozódó sávok: 14 és 19',H.gauge({name:'LOT-R',sub:b.l,val:s.total,unit:'/ 24',min:0,max:24,color:b.c,zones:[{from:0,to:13.5,color:'rgba(245,158,11,0.2)'},{from:13.5,to:18.5,color:'rgba(96,165,250,0.2)'},{from:18.5,to:24,color:'rgba(52,211,153,0.22)'}],labels:['0','14','19','24']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=19?'<p>Alapvetően jó kimenetre számítasz. Ez a kutatások szerint kitartóbb célkövetéssel és aktívabb problémamegoldással jár, mert érdemesnek látod a próbálkozást. Az egészséges optimizmus nem tagadja a kockázatot, csak nem bénul le tőle.</p>':s.total>=14?'<p>Mérsékelt optimizmus: helyzettől függően számítasz jóra vagy rosszra. Ez rugalmas, valószerű beállítódás.</p>':'<p>Inkább rossz kimenetre számítasz. Ez sokszor tapasztalatokból tanult óvatosság, és bizonyos helyzetekben védelmet ad. Tartósan viszont csökkenti a próbálkozás kedvét, mert nem tűnik érdemesnek. Az optimizmus a kutatások szerint tanulható.</p>'},
        {h:'Ha erősítenéd',html:'<p><strong>A legjobb lehetséges én</strong> (King, 2001): írd le 15 percben, milyen lesz az életed öt év múlva, ha minden jól alakul. Néhány alkalom után mérhetően nő az optimizmus. <strong>Magyarázati stílus</strong> (Seligman): rossz esemény után kérdezd meg, tényleg tartós, mindenre kiterjedő és csak rajtad múló-e, vagy inkább átmeneti, behatárolt és több tényezős.</p>'}
      ])}
      ${H.refs(['<strong>Scheier, M. F., Carver, C. S., & Bridges, M. W. (1994).</strong> Distinguishing optimism from neuroticism (and trait anxiety, self-mastery, and self-esteem): A reevaluation of the Life Orientation Test. <em>Journal of Personality and Social Psychology, 67</em>(6), 1063–1078.',
        '<strong>Carver, C. S., Scheier, M. F., & Segerstrom, S. C. (2010).</strong> Optimism. <em>Clinical Psychology Review, 30</em>(7), 879–889.'])}`;
  }
});
})();

/* ═══════════ 3. GQ-6 — HÁLA ═══════════ */
(function(){
/* Tájékozódás egy 1224 fős felnőtt minta eloszlása alapján (McCullough és mtsai): ≤35 alsó negyed · 36–38 alsó fél · 39–41 felső fél · 42 felső nyolcad */
const band=t=>t>=39?{l:'Erős hála-beállítódás',c:'#10b981'}:t>=36?{l:'Közepes hála-beállítódás',c:'#60a5fa'}:{l:'Ritkábban megélt hála',c:'#f59e0b'};
makeTest({
  id:'gq6',key:'gq6-responses-v1',name:'Hála (GQ-6)',c1:'#d4a017',c2:'#e11d48',
  tab:'Hála',tabSub:'GQ-6 · 6 item',scale:AGREE7,
  header:{status:'valid',statusText:'Validált skála · McCullough, Emmons & Tsang (2002)',
    eyebrow:'Gratitude Questionnaire-6 · Michael E. McCullough & Robert A. Emmons',
    title:'Mennyire van jelen a <em style="color:#d4a017">hála</em>',
    lead:'A GQ-6 a hálát mint beállítódást méri: milyen gyakran, milyen erősen és hány dolog iránt érzel hálát. A kutatások szerint a hála az egyik legerősebb, gyakorlással is fejleszthető jóllét-forrás.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal? Két állítás fordított pontozású.</p><p>Összpontszám: 6–42. Tájékozódásként egy amerikai felnőtt minta eloszlása: 35 vagy alatta az alsó negyed, 39 felett a felső fél.</p>'},
  sections:[{title:'6 állítás',desc:'',items:[
    {s:'p',t:'Nagyon sok mindenért lehetek hálás az életemben.'},
    {s:'p',t:'Ha fel kellene sorolnom mindazt, amiért hálás vagyok, nagyon hosszú lista lenne.'},
    {s:'p',t:'Ha körülnézek a világban, nem sok mindent látok, amiért hálás lehetnék.',r:true},
    {s:'p',t:'Sokféle embernek vagyok hálás.'},
    {s:'p',t:'Ahogy idősödöm, egyre jobban meg tudom becsülni azokat az embereket, eseményeket és helyzeteket, amelyek az életem részei voltak.'},
    {s:'p',t:'Hosszú idő telhet el, mire hálát érzek valami vagy valaki iránt.',r:true}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Hála (GQ-6)',s.total,6,42]}};},
  render(R,s){
    const b=band(s.total);
    return `<div class="res-eyebrow">Eredmény · GQ-6</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 42.</p>
      ${H.chart('Hála','6–42 · tájékozódás: 36 és 39',H.gauge({name:'GQ-6',sub:b.l,val:s.total,unit:'/ 42',min:6,max:42,color:b.c,zones:[{from:6,to:35.5,color:'rgba(245,158,11,0.2)'},{from:35.5,to:38.5,color:'rgba(96,165,250,0.2)'},{from:38.5,to:42,color:'rgba(52,211,153,0.22)'}],labels:['6','36','39','42']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=39?'<p>A hála gyakran és sok irányba van jelen az életedben. Ez a kutatások szerint jobb kapcsolatokkal, kevesebb irigységgel és nagyobb élettel való elégedettséggel jár.</p>':s.total>=36?'<p>Közepes hála-beállítódás: van miért hálásnak lenned, de nem mindig tudatosul. Ez tipikus, és jól erősíthető.</p>':'<p>Most ritkábban éled meg a hálát. Ez nem jellemhiba: nehéz időszakokban, terhelés alatt a figyelem természetesen a problémákra szűkül. A hála-gyakorlatok épp ezt a figyelmet tágítják ki.</p>'},
        {h:'Bizonyítottan működő gyakorlatok',html:'<p><strong>Három jó dolog:</strong> este írj le három dolgot, ami jól ment, és hogy miért (Seligman és mtsai, 2005). <strong>Hálalevél:</strong> írj levelet valakinek, akinek sosem köszönted meg rendesen, és ha lehet, olvasd fel neki. Heti 1–2 alkalom elég; a napi kötelező gyakorlat hamar gépiessé válik.</p>'}
      ])}
      ${H.refs(['<strong>McCullough, M. E., Emmons, R. A., & Tsang, J.-A. (2002).</strong> The grateful disposition: A conceptual and empirical topography. <em>Journal of Personality and Social Psychology, 82</em>(1), 112–127.',
        '<strong>Emmons, R. A., & McCullough, M. E. (2003).</strong> Counting blessings versus burdens. <em>Journal of Personality and Social Psychology, 84</em>(2), 377–389.'])}`;
  }
});
})();

/* ═══════════ 4. BPNSFS — ALAPSZÜKSÉGLETEK ═══════════ */
(function(){
const N={A:{name:'Autonómia',d:'szabadság, választás, a saját értékeid szerinti élet',color:'#2563eb'},R:{name:'Kapcsolódás',d:'szeretet, törődés, valahová tartozás',color:'#e11d48'},C:{name:'Kompetencia',d:'hatékonyság, ügyesség, a feladatok megoldása',color:'#d4a017'}};
const K=['A','R','C'];
makeTest({
  id:'bpns',key:'bpnsfs-responses-v1',name:'Alapszükségletek (BPNSFS)',c1:'#2563eb',c2:'#d4a017',
  tab:'Alapszükségletek',tabSub:'BPNSFS · 24 item',scale:BPN_SCALE,
  header:{status:'valid',statusText:'Validált skála · Chen és mtsai (2015)',
    eyebrow:'Basic Psychological Need Satisfaction and Frustration Scale · önmeghatározás-elmélet',
    title:'Megkapják-e a <em style="color:#60a5fa">lelki alapszükségleteid</em>, amire szükségük van',
    lead:'Az önmeghatározás-elmélet (Deci & Ryan) szerint három lelki alapszükséglet van: <strong>autonómia</strong> (a saját döntéseid szerint élsz), <strong>kapcsolódás</strong> (fontos vagy valakinek, és ő neked) és <strong>kompetencia</strong> (ügyesnek, hatékonynak érzed magad). Mindhármat külön méri a kielégülés és a frusztráció oldaláról: a kettő nem ugyanaz.',
    intro:'<p><strong>Kitöltés:</strong> az életedre általában gondolva, mennyire igazak rád az alábbi állítások?</p><p>Eredmény: hat alskála, mindegyik 1–5 átlag. A kielégülés magasabb értéke, a frusztráció alacsonyabb értéke kedvező.</p>'},
  sections:[{title:'24 állítás',desc:'',items:[
    {s:'AS',t:'Úgy érzem, választhatok, és szabad vagyok abban, amibe belefogok.'},
    {s:'AF',t:'A legtöbb dologról, amit csinálok, úgy érzem, hogy „muszáj”.'},
    {s:'RS',t:'Úgy érzem, azoknak, akik fontosak nekem, én is fontos vagyok.'},
    {s:'RF',t:'Úgy érzem, kirekesztenek abból a csoportból, ahová tartozni szeretnék.'},
    {s:'CS',t:'Biztos vagyok benne, hogy jól tudom csinálni a dolgokat.'},
    {s:'CF',t:'Komolyan kételkedem abban, hogy jól tudom-e csinálni a dolgokat.'},
    {s:'AS',t:'Úgy érzem, a döntéseim azt tükrözik, amit valóban akarok.'},
    {s:'AF',t:'Úgy érzem, sok olyan dologra kényszerítenek, amit magamtól nem választanék.'},
    {s:'RS',t:'Kapcsolódom olyan emberekhez, akik törődnek velem, és akikkel én is törődöm.'},
    {s:'RF',t:'Úgy érzem, akik fontosak nekem, hidegek és távolságtartók velem.'},
    {s:'CS',t:'Ügyesnek érzem magam abban, amit csinálok.'},
    {s:'CF',t:'Sok teljesítményemben csalódott vagyok.'},
    {s:'AS',t:'Úgy érzem, a döntéseim azt fejezik ki, aki valójában vagyok.'},
    {s:'AF',t:'Nyomást érzek, hogy túl sok mindent csináljak.'},
    {s:'RS',t:'Közel érzem magam és kapcsolódom azokhoz, akik fontosak nekem.'},
    {s:'RF',t:'Az a benyomásom, hogy akikkel időt töltök, nem kedvelnek.'},
    {s:'CS',t:'Képesnek érzem magam arra, hogy elérjem a céljaimat.'},
    {s:'CF',t:'Bizonytalannak érzem magam a képességeimben.'},
    {s:'AS',t:'Úgy érzem, azt csinálom, ami valóban érdekel.'},
    {s:'AF',t:'A mindennapjaim kötelességek láncolatának tűnnek.'},
    {s:'RS',t:'Melegséget érzek azokkal, akikkel időt töltök.'},
    {s:'RF',t:'Úgy érzem, a kapcsolataim csak felszínesek.'},
    {s:'CS',t:'Úgy érzem, sikeresen meg tudok oldani nehéz feladatokat is.'},
    {s:'CF',t:'Kudarcnak érzem magam a hibáim miatt.'}]}],
  score(R){const o={};K.forEach(k=>{o[k+'S']=H.r2(R.mean(k+'S'));o[k+'F']=H.r2(R.mean(k+'F'));});return o;},
  sum(s){
    const worst=K.slice().sort((a,b)=>(s[a+'S']-s[a+'F'])-(s[b+'S']-s[b+'F']))[0];
    return {h:'Leginkább frusztrált: '+N[worst].name.toLowerCase(),d:Object.fromEntries(K.flatMap(k=>[[k+'S',[N[k].name+' – kielégülés',s[k+'S'],1,5]],[k+'F',[N[k].name+' – frusztráció',s[k+'F'],1,5]]]))};
  },
  render(R,s){
    const bal=k=>s[k+'S']-s[k+'F'],ord=K.slice().sort((a,b)=>bal(a)-bal(b)),w=ord[0],best=ord[2];
    const TIP={A:'<p><strong>Autonómia:</strong> írd össze, mit csinálsz azért, mert „muszáj”, és mit azért, mert fontos neked. Keress egy kötelességet, amelyet átalakíthatsz választássá (miért fontos ez nekem?), vagy amelyet elhagyhatsz. Hetente legalább egy olyan tevékenység legyen, amit csak azért csinálsz, mert érdekel.</p>',
      R:'<p><strong>Kapcsolódás:</strong> a felszínes kapcsolatokból kevés táplálék jön. Válassz ki egy-két embert, akivel mélyebb beszélgetés lehetséges, és teremts rá rendszeres alkalmat. Lásd még: UCLA-3 és a kötődés tesztjei.</p>',
      C:'<p><strong>Kompetencia:</strong> a kompetencia érzését a kicsi, végigvitt és visszajelzett feladatok építik. Bontsd a nagy célokat két hétnél rövidebb lépésekre, és jegyezd fel, amit befejeztél. Lásd még: GSE (Önbizalom) és SAPS (Munka és célok).</p>'};
    return `<div class="res-eyebrow">Eredmény · BPNSFS</div>
      <h2 class="res-title">Leginkább táplált: <em>${N[best].name.toLowerCase()}</em></h2>
      <p class="res-lead">Leginkább frusztrált: <strong>${N[w].name.toLowerCase()}</strong>.</p>
      ${H.bars('Három <em>alapszükséglet</em>',K.map(k=>({title:N[k].name+' · '+N[k].d,color:N[k].color,rows:[
        {name:'Kielégülés <span style="color:var(--ink-lite-muted);font-size:12px">· magasabb = jobb</span>',val:s[k+'S'].toFixed(1),unit:'/5',pct:(s[k+'S']-1)/4*100,color:N[k].color},
        {name:'Frusztráció <span style="color:var(--ink-lite-muted);font-size:12px">· magasabb = nagyobb hiány</span>',val:s[k+'F'].toFixed(1),unit:'/5',pct:(s[k+'F']-1)/4*100,color:'#94a3b8'}]})))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Kielégülés és frusztráció',html:'<p>A kettő nem ugyanannak a skálának a két vége. Az alacsony kielégülés <em>hiány</em> (nincs elég belőle), a magas frusztráció <em>aktív sérülés</em> (valami vagy valaki akadályozza). A frusztráció a kutatások szerint erősebben jár együtt a kimerültséggel, a szorongással és a lehangoltsággal.</p>'},
        {h:'Ahol a legtöbbet nyerhetsz: '+N[w].name,color:N[w].color,html:TIP[w]}
      ])}
      ${H.refs(['<strong>Chen, B., Vansteenkiste, M., Beyers, W., és mtsai (2015).</strong> Basic psychological need satisfaction, need frustration, and need strength across four cultures. <em>Motivation and Emotion, 39</em>(2), 216–236.',
        '<strong>Ryan, R. M., & Deci, E. L. (2017).</strong> <em>Self-determination theory: Basic psychological needs in motivation, development, and wellness.</em> Guilford Press.'])}`;
  }
});
})();
