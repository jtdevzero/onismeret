const AGREE4=[{v:0,l:'egyáltalán nem értek egyet'},{v:1,l:'nem értek egyet'},{v:2,l:'egyetértek'},{v:3,l:'teljesen egyetértek'}];
const TRUE4=[{v:1,l:'egyáltalán nem igaz'},{v:2,l:'alig igaz'},{v:3,l:'többé-kevésbé igaz'},{v:4,l:'teljesen igaz'}];
const CHAR5=[{v:0,l:'egyáltalán nem jellemző rám'},{v:1,l:'kicsit jellemző'},{v:2,l:'közepesen jellemző'},{v:3,l:'nagyon jellemző'},{v:4,l:'teljesen jellemző rám'}];
const AGREE5=[{v:1,l:'egyáltalán nem igaz rám'},{v:2,l:'inkább nem igaz'},{v:3,l:'részben igaz'},{v:4,l:'inkább igaz'},{v:5,l:'teljesen igaz rám'}];
const OB_REF='<strong>Bandura, A. (1997).</strong> <em>Self-efficacy: The exercise of control.</em> New York: W. H. Freeman.';

/* ═══════════ 1. RSES — ROSENBERG ÖNÉRTÉKELÉS ═══════════ */
(function(){
const band=t=>t>=26?{l:'Magas önértékelés',c:'#34d399'}:t>=15?{l:'Átlagos tartományú önértékelés',c:'#60a5fa'}:{l:'Alacsony önértékelés',c:'#e11d48'};
makeTest({
  id:'rses',key:'rses-responses-v1',name:'Önértékelés (RSES)',c1:'#10b981',c2:'#2563eb',
  tab:'Önértékelés',tabSub:'RSES · 10 item',scale:AGREE4,
  header:{status:'valid',statusText:'Validált skála · Rosenberg (1965)',
    eyebrow:'Rosenberg Self-Esteem Scale · Morris Rosenberg (1965)',
    title:'Mennyire tartod <em style="color:#10b981">értékesnek</em> magad',
    lead:'A világ leggyakrabban használt önértékelési skálája. Nem azt méri, miben vagy jó, hanem azt az alapérzést, hogy <strong>rendben vagy-e úgy, ahogy vagy</strong>: elfogadod-e magad, és egyenrangúnak érzed-e magad másokkal.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal, ha általában gondolsz magadra (nem a mai napra)? Öt állítás fordított pontozású.</p><p>Összpontszám: 0–30. A szakirodalomban gyakori tájékozódási sávok: 15 alatt alacsony, 15–25 átlagos, 26 felett magas.</p>'},
  sections:[{title:'10 állítás <em>magadról</em>',desc:'',items:[
    {s:'p',t:'Összességében elégedett vagyok magammal.'},
    {s:'p',t:'Időnként úgy gondolom, hogy semmit sem érek.',r:true},
    {s:'p',t:'Úgy érzem, számos jó tulajdonságom van.'},
    {s:'p',t:'Képes vagyok a dolgokat legalább olyan jól csinálni, mint a legtöbb ember.'},
    {s:'p',t:'Úgy érzem, nincs sok mindenre büszkének lennem.',r:true},
    {s:'p',t:'Időnként határozottan haszontalannak érzem magam.',r:true},
    {s:'p',t:'Úgy érzem, értékes ember vagyok, legalábbis egyenrangú másokkal.'},
    {s:'p',t:'Bárcsak jobban tudnám tisztelni magam.',r:true},
    {s:'p',t:'Mindent egybevetve hajlamos vagyok kudarcnak tartani magam.',r:true},
    {s:'p',t:'Pozitívan viszonyulok önmagamhoz.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Önértékelés (RSES)',s.total,0,30]}};},
  render(R,s){
    const b=band(s.total),low=R.items.filter(i=>i.v<=1).sort((a,c)=>a.v-c.v).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · Önértékelés</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">RSES összpontszám: <strong>${s.total}</strong> / 30.</p>
      ${H.chart('Önértékelés','0–30 · tájékozódási sávok: 15 és 26',H.gauge({name:'RSES',sub:b.l,val:s.total,unit:'/ 30',min:0,max:30,color:b.c,zones:[{from:0,to:14.5,color:'rgba(225,29,72,0.2)'},{from:14.5,to:25.5,color:'rgba(96,165,250,0.2)'},{from:25.5,to:30,color:'rgba(52,211,153,0.22)'}],labels:['0','15','26','30']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=26?'<p>Stabil, elfogadó viszony önmagaddal. Ez nem azonos a nárcizmussal: a magas RSES azt jelenti, hogy egyenrangúnak érzed magad, nem azt, hogy jobbnak.</p>':s.total>=15?'<p>A legtöbb felnőtt ebben a tartományban van. Az önértékelésed alapvetően működik, de bizonyos helyzetekben (kudarc, kritika, összehasonlítás) megbillenhet.</p>':'<p>Az alapérzésed most inkább az, hogy nem vagy elég. Ez nem tény rólad, hanem egy tanult nézőpont, és jól változtatható. Ha tartósan így érzed, és ez lehangoltsággal jár, érdemes szakemberrel is átbeszélni.</p>'},
        low.length?{h:'Ahol a legtöbb munka van',html:low.map(i=>`<p>„${i.t}” — <strong>${AGREE4[i.raw].l}</strong></p>`).join('')}:null,
        {h:'Kapcsolódó térképek',html:'<p>Az alacsony önértékelés gyakran a YSQ <em>Csökkentértékűség/szégyen</em> és <em>Kudarc</em> sémáival, és alacsony önegyüttérzéssel (SCS-SF) jár együtt. Az összegzés oldal ezeket egymás mellé teszi.</p>'}
      ])}
      ${H.refs(['<strong>Rosenberg, M. (1965).</strong> <em>Society and the adolescent self-image.</em> Princeton, NJ: Princeton University Press.',
        '<strong>Schmitt, D. P., & Allik, J. (2005).</strong> Simultaneous administration of the Rosenberg Self-Esteem Scale in 53 nations. <em>Journal of Personality and Social Psychology, 89</em>(4), 623–642.',
        '<strong>Orth, U., & Robins, R. W. (2014).</strong> The development of self-esteem. <em>Current Directions in Psychological Science, 23</em>(5), 381–387.'])}`;
  }
});
})();

/* ═══════════ 2. GSE — ÁLTALÁNOS ÉNHATÉKONYSÁG ═══════════ */
(function(){
const band=t=>t>=35?{l:'Magas énhatékonyság',c:'#34d399'}:t>=25?{l:'Átlagos énhatékonyság',c:'#60a5fa'}:{l:'Alacsonyabb énhatékonyság',c:'#f59e0b'};
makeTest({
  id:'gse',key:'gse-responses-v1',name:'Énhatékonyság (GSE)',c1:'#2563eb',c2:'#d4a017',
  tab:'Énhatékonyság',tabSub:'GSE · 10 item',scale:TRUE4,
  header:{status:'valid',statusText:'Validált skála · Schwarzer & Jerusalem (1995)',
    eyebrow:'General Self-Efficacy Scale · Schwarzer & Jerusalem (1995)',
    title:'Mennyire bízol abban, hogy <em style="color:#60a5fa">megoldod</em>',
    lead:'Az énhatékonyság (Bandura) az a meggyőződés, hogy nehéz helyzetben is képes vagy cselekedni és megbirkózni. Az önértékeléstől eltér: lehet valaki elfogadó magával, és mégis bizonytalan abban, hogy megoldja-e, ami jön, és fordítva.',
    intro:'<p><strong>Kitöltés:</strong> mennyire igazak rád az alábbi állítások általában?</p><p>Összpontszám: 10–40. 25 nemzetközi minta átlaga kb. 29,5 (szórás kb. 5,3); az itt használt sávok ehhez képest: 25 alatt alacsonyabb, 25–34 átlagos, 35 felett magas.</p>'},
  sections:[{title:'10 állítás',desc:'',items:[
    {s:'p',t:'Ha eléggé igyekszem, a nehéz problémákat is mindig meg tudom oldani.'},
    {s:'p',t:'Ha valaki akadályoz, akkor is megtalálom a módját, hogy elérjem, amit akarok.'},
    {s:'p',t:'Könnyen kitartok a céljaim mellett, és el is érem őket.'},
    {s:'p',t:'Biztos vagyok benne, hogy a váratlan helyzeteket is hatékonyan kezelni tudom.'},
    {s:'p',t:'A leleményességemnek köszönhetően tudom, hogyan kezeljem az előre nem látott helyzeteket.'},
    {s:'p',t:'A legtöbb problémát meg tudom oldani, ha beleteszem a szükséges erőfeszítést.'},
    {s:'p',t:'Nehézségek közepette is nyugodt tudok maradni, mert számíthatok a megküzdési képességeimre.'},
    {s:'p',t:'Ha problémával szembesülök, általában több megoldást is találok.'},
    {s:'p',t:'Ha bajban vagyok, általában eszembe jut valami megoldás.'},
    {s:'p',t:'Általában bármivel megbirkózom, ami az utamba kerül.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Énhatékonyság (GSE)',s.total,10,40]}};},
  render(R,s){
    const b=band(s.total),low=R.items.filter(i=>i.raw<=2).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · Énhatékonyság</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">GSE összpontszám: <strong>${s.total}</strong> / 40.</p>
      ${H.chart('Énhatékonyság','10–40 · nemzetközi átlag ±1 szórás: kb. 24–35',H.gauge({name:'GSE',sub:b.l,val:s.total,unit:'/ 40',min:10,max:40,color:b.c,zones:[{from:10,to:24.5,color:'rgba(245,158,11,0.2)'},{from:24.5,to:34.5,color:'rgba(96,165,250,0.2)'},{from:34.5,to:40,color:'rgba(52,211,153,0.22)'}],labels:['10','25','35','40']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=35?'<p>Erős a bizalmad abban, hogy megbirkózol a nehézségekkel. Ez a kutatásokban kitartással, jobb stresszkezeléssel és több próbálkozással jár együtt.</p>':s.total>=25?'<p>A megküzdési képességedbe vetett bizalmad átlagos. Ismerős helyzetekben stabil, új vagy váratlan helyzetekben bizonytalanabb lehet.</p>':'<p>Most kevésbé bízol abban, hogy a nehéz helyzeteket meg tudod oldani. Ez gyakran nem képességhiány, hanem kevés friss sikertapasztalat, ami gyakorlással jól építhető.</p>'},
        {h:'Hogyan épül',html:'<p>Bandura szerint az énhatékonyság négy forrásból táplálkozik, erősségük sorrendjében: <strong>saját sikerélmény</strong> (a legerősebb), <strong>mások példája</strong>, <strong>biztatás</strong>, és a <strong>testi állapot</strong> értelmezése (izgalom vagy félelem). A gyakorlatban: kicsi, de valódi kihívások, amiket végigviszel, és utána tudatosan rögzíted, hogy megcsináltad.</p>'},
        low.length?{h:'A legbizonytalanabb pontok',html:low.map(i=>`<p>„${i.t}” — <strong>${TRUE4[i.raw-1].l}</strong></p>`).join('')}:null
      ])}
      ${H.refs(['<strong>Schwarzer, R., & Jerusalem, M. (1995).</strong> Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), <em>Measures in health psychology: A user’s portfolio</em> (pp. 35–37). Windsor: NFER-NELSON.',
        '<strong>Scholz, U., Gutiérrez-Doña, B., Sud, S., & Schwarzer, R. (2002).</strong> Is general self-efficacy a universal construct? <em>European Journal of Psychological Assessment, 18</em>(3), 242–251.',OB_REF])}`;
  }
});
})();

/* ═══════════ 3. BFNE-II — NEGATÍV ÉRTÉKELÉSTŐL VALÓ FÉLELEM ═══════════ */
(function(){
const band=t=>t>=33?{l:'Erős félelem mások ítéletétől',c:'#be123c'}:t>=17?{l:'Közepes félelem mások ítéletétől',c:'#f59e0b'}:{l:'Enyhe félelem mások ítéletétől',c:'#34d399'};
makeTest({
  id:'bfne',key:'bfne2-responses-v1',name:'Mások ítéletétől való félelem (BFNE-II)',c1:'#be123c',c2:'#d4a017',
  tab:'Ítélettől való félelem',tabSub:'BFNE-II · 12 item',scale:CHAR5,
  header:{status:'valid',statusText:'Validált skála · Carleton és mtsai (2006)',
    eyebrow:'Brief Fear of Negative Evaluation – II · Leary (1983), Carleton et al. (2006)',
    title:'Mennyire tart vissza, <em style="color:#e11d48">mit gondolnak</em> rólad',
    lead:'A negatív értékeléstől való félelem a szociális szorongás magja, és az önbizalom egyik leggyakoribb fékje: nem az a kérdés, mit tudsz, hanem hogy mennyire foglalkoztat, mások hogyan látnak közben. A BFNE-II Leary rövid skálájának javított változata, minden tétele egyirányú.',
    intro:'<p><strong>Kitöltés:</strong> mennyire jellemzőek rád az alábbi állítások?</p><p>Összpontszám: 0–48, magasabb = erősebb félelem. Hivatalos határérték nincs; az itt használt sávok a skála harmadai (0–16, 17–32, 33–48), tájékozódásra.</p>'},
  sections:[{title:'12 állítás',desc:'',items:[
    {s:'p',t:'Akkor is aggódom amiatt, mit gondolnak rólam mások, ha tudom, hogy ennek nincs jelentősége.'},
    {s:'p',t:'Zavar, ha valaki kedvezőtlen benyomást alakít ki rólam.'},
    {s:'p',t:'Gyakran félek attól, hogy mások észreveszik a hiányosságaimat.'},
    {s:'p',t:'Aggódom amiatt, milyen benyomást teszek másokra.'},
    {s:'p',t:'Félek, hogy mások nem fognak elfogadni.'},
    {s:'p',t:'Félek, hogy az emberek hibát találnak bennem.'},
    {s:'p',t:'Foglalkoztat, mit gondolnak rólam mások.'},
    {s:'p',t:'Amikor beszélgetek valakivel, aggódom amiatt, mit gondolhat rólam.'},
    {s:'p',t:'Általában aggódom amiatt, milyen benyomást keltek.'},
    {s:'p',t:'Ha tudom, hogy valaki megítél, az általában zavar.'},
    {s:'p',t:'Néha úgy gondolom, túlságosan foglalkoztat, mit gondolnak rólam mások.'},
    {s:'p',t:'Gyakran aggódom, hogy rossz dolgot mondok vagy teszek.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Ítélettől való félelem (BFNE-II)',s.total,0,48]}};},
  render(R,s){
    const b=band(s.total),top=R.items.filter(i=>i.raw>=3).sort((a,c)=>c.raw-a.raw).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · Ítélettől való félelem</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">BFNE-II összpontszám: <strong>${s.total}</strong> / 48.</p>
      ${H.chart('Félelem a negatív értékeléstől','0–48 · tájékozódási sávok: 17 és 33',H.gauge({name:'BFNE-II',sub:b.l,val:s.total,unit:'/ 48',min:0,max:48,color:b.c,zones:[{from:0,to:16.5,color:'rgba(52,211,153,0.2)'},{from:16.5,to:32.5,color:'rgba(245,158,11,0.2)'},{from:32.5,to:48,color:'rgba(190,18,60,0.24)'}],labels:['0','17','33','48']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=33?'<p>Mások ítélete most erősen jelen van a fejedben: valószínűleg sok energia megy el arra, hogy figyeld, hogyan hatsz, és kerüld a hibát. Ez a megszólalást, a kezdeményezést és a láthatóságot is fékezi. Ha emiatt helyzeteket kerülsz el, a kognitív viselkedésterápia kifejezetten hatékony ebben.</p>':s.total>=17?'<p>Mások véleménye fontos számodra, és bizonyos helyzetekben (új emberek, értékelés, nyilvános szereplés) visszafoghat. Ez gyakori, és jól gyakorolható.</p>':'<p>Mások ítélete kevéssé szabja meg, mit mondasz vagy teszel. Érdemes azért figyelni, hogy a visszajelzéseket se engedd el teljesen.</p>'},
        {h:'Mi tartja fenn',html:'<p>A félelem a <strong>biztonsági viselkedésektől</strong> marad meg: előre begyakorolt mondatok, háttérben maradás, kerülés, utólagos rágódás („mit gondolhatott?”). Ezek rövid távon megnyugtatnak, de megakadályozzák, hogy megtapasztald: a legtöbb ember sokkal kevésbé figyel rád, mint gondolod (reflektorfény-hatás, Gilovich és mtsai, 2000).</p>'},
        top.length?{h:'Ahol a legerősebb',html:top.map(i=>`<p>„${i.t}” — <strong>${CHAR5[i.raw].l}</strong></p>`).join('')}:null
      ])}
      ${H.refs(['<strong>Leary, M. R. (1983).</strong> A brief version of the Fear of Negative Evaluation Scale. <em>Personality and Social Psychology Bulletin, 9</em>(3), 371–375.',
        '<strong>Carleton, R. N., McCreary, D. R., Norton, P. J., & Asmundson, G. J. G. (2006).</strong> Brief Fear of Negative Evaluation Scale – Revised. <em>Depression and Anxiety, 23</em>(5), 297–303.',
        '<strong>Gilovich, T., Medvec, V. H., & Savitsky, K. (2000).</strong> The spotlight effect in social judgment. <em>Journal of Personality and Social Psychology, 78</em>(2), 211–222.'])}`;
  }
});
})();

/* ═══════════ 4. GYAKORLATI ÖNBIZALOM — SAJÁT, KURZUSHOZ ═══════════ */
(function(){
const C={
  KI:{name:'Kiállás magamért',color:'#10b981'},
  HA:{name:'Határok, nemet mondás',color:'#2563eb'},
  KE:{name:'Kezdeményezés, kockázat',color:'#d4a017'},
  HI:{name:'Hibák, kudarc kezelése',color:'#be123c'},
  LA:{name:'Láthatóság, elismerés',color:'#7c3aed'}};
const band=m=>m>=3.8?{l:'Erős gyakorlati önbizalom',c:'#34d399'}:m>2.8?{l:'Közepes gyakorlati önbizalom',c:'#60a5fa'}:{l:'Fejleszthető gyakorlati önbizalom',c:'#f59e0b'};
const TIPS={
  KI:'<strong>Egy mondat naponta.</strong> Mondj ki egy olyan véleményt vagy kérést, amit eddig lenyeltél volna. Kicsiben kezdd (étterem, kolléga), és jegyezd fel, mi történt valójában, és mitől féltél.',
  HA:'<strong>Rövid nem.</strong> Gyakorold a nemet magyarázkodás nélkül: „Ezt most nem vállalom.” Figyeld meg, hogy a bűntudat hullámként jön és megy, és a kapcsolat általában kibírja.',
  KE:'<strong>Felkészületlen igen.</strong> Hetente egyszer jelentkezz valamire, mielőtt teljesen késznek éreznéd magad. Az önbizalom a cselekvés után jön, nem előtte.',
  HI:'<strong>Hiba-napló.</strong> Egy hiba után írd le három sorban: mi történt, mit tanultam, mi a következő lépés. Ez választja szét a teljesítményt az értékedtől.',
  LA:'<strong>Köszönöm, és kész.</strong> Dicséretre egyszerűen mondd: „Köszönöm.” Lekicsinylés és visszadicséret nélkül. Hetente írd le egy saját sikeredet úgy, hogy a te szereped legyen benne.'};
makeTest({
  id:'obgy',key:'onbizalom-gyak-responses-v1',name:'Gyakorlati önbizalom',c1:'#d4a017',c2:'#7c3aed',
  tab:'Gyakorlatban',tabSub:'Saját · 20 item',scale:AGREE5,
  header:{status:'model',statusText:'Saját fejlesztés · nem validált',
    eyebrow:'Önbizalom a gyakorlatban · kurzushoz készült önreflexiós skála',
    title:'Hol <em style="color:#d4a017">akad el</em> az önbizalmad',
    lead:'Az első három skála azt méri, mit gondolsz magadról. Ez azt, hogy <strong>mit csinálsz</strong>: öt hétköznapi területen, ahol az önbizalom láthatóvá válik. Kurzus előtt és után kitöltve ez mozdul el legelőször, mert közvetlenül a gyakorolt viselkedést kérdezi.',
    intro:'<p><strong>Kitöltés:</strong> mennyire igazak rád az alábbi állítások az elmúlt hetekben? Egyes tételek fordított pontozásúak.</p><p>Az eredmény területenkénti átlag (1–5, magasabb = magabiztosabb). A kérdések ehhez az oldalhoz készültek, nincsenek validálva: tájékozódásra és a változás követésére valók, nem mérésre.</p>'},
  sections:[
    {title:'Kiállás <em>magamért</em>',desc:'',items:[
      {s:'KI',t:'Ha nem értek egyet valakivel, ki tudom mondani a véleményemet.'},
      {s:'KI',t:'Meg tudom kérni, amire szükségem van, akkor is, ha ez kényelmetlen.'},
      {s:'KI',t:'Ha igazságtalanság ér, inkább lenyelem, mint hogy szóvá tegyem.',r:true},
      {s:'KI',t:'Vita közben is meg tudom tartani az álláspontomat, ha úgy gondolom, igazam van.'}]},
    {title:'Határok, <em>nemet mondás</em>',desc:'',items:[
      {s:'HA',t:'Nemet tudok mondani anélkül, hogy hosszan magyarázkodnék.'},
      {s:'HA',t:'Gyakran vállalok el olyat, amit valójában nem akarok, csak hogy ne okozzak csalódást.',r:true},
      {s:'HA',t:'Ha valaki átlépi a határomat, jelzem neki.'},
      {s:'HA',t:'Bűntudatom van, ha a saját igényemet előre helyezem.',r:true}]},
    {title:'Kezdeményezés, <em>kockázat</em>',desc:'',items:[
      {s:'KE',t:'Belevágok olyan dologba is, amiről nem vagyok biztos, hogy sikerülni fog.'},
      {s:'KE',t:'Új emberek között én is kezdeményezek beszélgetést.'},
      {s:'KE',t:'Lehetőségeket hagyok ki, mert félek, hogy nem leszek elég jó.',r:true},
      {s:'KE',t:'Jelentkezem egy feladatra vagy szerepre, mielőtt teljesen felkészültnek érezném magam.'}]},
    {title:'Hibák, <em>kudarc</em>',desc:'',items:[
      {s:'HI',t:'Egy hiba után viszonylag hamar újra tudok próbálkozni.'},
      {s:'HI',t:'Egy kudarc napokig foglalkoztat, és újra meg újra lejátszom magamban.',r:true},
      {s:'HI',t:'Egy hibát a teljesítményemről szóló információnak tekintek, nem az értékemről szóló ítéletnek.'},
      {s:'HI',t:'Ha elrontok valamit, úgy érzem, ez megmutatja, hogy valójában nem vagyok elég jó.',r:true}]},
    {title:'Láthatóság, <em>elismerés</em>',desc:'',items:[
      {s:'LA',t:'Egy dicséretet el tudok fogadni anélkül, hogy lekicsinyelném.'},
      {s:'LA',t:'Kényelmetlen, ha rám irányul a figyelem, ezért inkább háttérben maradok.',r:true},
      {s:'LA',t:'Ki tudom mondani, miben vagyok jó, anélkül, hogy kínosnak érezném.'},
      {s:'LA',t:'Úgy érzem, a sikereim inkább a szerencsén múltak, mint rajtam.',r:true}]}],
  score(R){const o={total:H.r2(R.allMean())};Object.keys(C).forEach(k=>{o[k]=H.r2(R.mean(k));});return o;},
  sum(s){return {h:band(s.total).l,d:Object.assign({total:['Gyakorlati önbizalom (átlag)',s.total,1,5]},Object.fromEntries(Object.keys(C).map(k=>[k,[C[k].name,s[k],1,5]])))};},
  render(R,s){
    const b=band(s.total),ks=Object.keys(C).sort((x,y)=>s[x]-s[y]),weak=ks[0],strong=ks[ks.length-1];
    const bars=H.bars('Öt <em>terület</em>',[{title:'',color:b.c,rows:Object.keys(C).map(k=>({name:C[k].name,val:s[k].toFixed(1),unit:'/5',pct:(s[k]-1)/4*100,color:C[k].color}))}]);
    return `<div class="res-eyebrow">Eredmény · Gyakorlati önbizalom</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 5.</p>
      ${bars}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'A legerősebb terület: '+C[strong].name,color:C[strong].color,html:'<p>Ez a kiindulópontod: itt már van tapasztalatod arról, hogy működik. Érdemes tudatosan átvinni innen a mintát a gyengébb területekre.</p>'},
        s[strong]-s[weak]>=0.5?{h:'A legtöbb munka itt van: '+C[weak].name,color:C[weak].color,html:`<p>${TIPS[weak]}</p>`}:{h:'Kiegyensúlyozott kép',html:'<p>A területek között nincs nagy különbség. Válassz egyet, amelyik a mostani céljaidhoz a legközelebb áll, és arra fókuszálj 2–3 hétig.</p>'},
        {h:'Kurzus előtt és után',html:'<p>Töltsd ki újra 6–8 hét gyakorlás után. A változás itt látszik leghamarabb; az RSES és a GSE lassabban mozdul, a BFNE-II csökkenése pedig azt jelzi, hogy a félelem is enged, nem csak a viselkedés változik.</p>'}
      ])}
      ${H.refs([OB_REF,'<strong>Alberti, R. E., & Emmons, M. L. (2017).</strong> <em>Your perfect right: Assertiveness and equality in your life and relationships</em> (10th ed.). Oakland, CA: Impact Publishers.'])}`;
  }
});
})();
