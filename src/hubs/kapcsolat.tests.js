const SCALE5=[{v:1,l:'egyáltalán nem'},{v:2,l:'inkább nem'},{v:3,l:'részben'},{v:4,l:'inkább igen'},{v:5,l:'teljesen'}];
const band5=m=>m>=4?'erős':m>=3?'mérsékelt':m>=2?'alacsony':'nagyon alacsony';

/* ═══════════ 1. LOVE ATTITUDES SCALE — SHORT FORM ═══════════ */
(function(){
const ST={
  eros:{name:'Eros',hu:'szenvedélyes',color:'#fb7185',desc:'Erős fizikai és érzelmi vonzalom, gyors, intenzív egymásra hangolódás, a társ ideálnak megfelelő.'},
  ludus:{name:'Ludus',hu:'játékos',color:'#fbbf24',desc:'A szerelem mint játék: élvezet, változatosság, kevés elköteleződés, kontroll megtartása.'},
  storge:{name:'Storge',hu:'baráti',color:'#34d399',desc:'Lassan, barátságból épülő, nyugodt, stabil szeretet. Közös érdeklődés, nem „villámcsapás”.'},
  pragma:{name:'Pragma',hu:'gyakorlatias',color:'#60a5fa',desc:'Tudatos párválasztás: kompatibilitás, háttér, család- és karriercélok szerinti „bevásárlólista”.'},
  mania:{name:'Mania',hu:'birtokló',color:'#a78bfa',desc:'Szorongó, függő, féltékeny szerelem. Hullámvasút: eufória és kétségbeesés, megerősítés-éhség.'},
  agape:{name:'Agape',hu:'önfeláldozó',color:'#2dd4bf',desc:'Önzetlen, adó szeretet: a társ jólléte előbbre való a sajátodnál.'}
};
makeTest({
  id:'las',key:'las-responses-v1',name:'Szeretetstílus (LAS-SF)',c1:'#fb7185',c2:'#f472b6',
  tab:'Szeretetstílus',tabSub:'LAS-SF · 24 item',scale:SCALE5,
  header:{status:'valid',statusText:'Validált kutatási skála · magyar adaptáció',
    eyebrow:'Love Attitudes Scale – Short Form · Hendrick, Hendrick & Dicke (1998)',
    title:'Hat <em style="color:#fb7185">szeretetstílus</em>',
    lead:'John Alan Lee (1973) színelmélete szerint a szerelemnek nem egy fajtája van, hanem hat alapstílusa, amelyek keverednek. Hendrick és Hendrick ezekből építette meg a <strong>Love Attitudes Scale</strong>-t, a szeretetstílus-kutatás standard mérőeszközét. A rövid forma stílusonként 4 tételt tartalmaz.',
    intro:'<p><strong>Kitöltés:</strong> gondolj a jelenlegi párodra. Ha most nincs kapcsolatod, a legutóbbi fontos kapcsolatodra, ha még nem volt ilyen, arra, ahogyan szerinted szeretnél.</p><p>1 = egyáltalán nem igaz · 5 = teljesen igaz. Nincs jó vagy rossz stílus. A profil keveréke az érdekes, nem egyetlen szám.</p>'},
  sections:[
    {title:'I. rész — <em>Vonzalom és barátság</em>',desc:'Hogyan kezdődött és hogyan él a kapcsolat.',items:[
      {s:'eros',t:'A párommal megvan köztünk a megfelelő fizikai „kémia”.'},
      {s:'eros',t:'Úgy érzem, a párommal egymásnak lettünk teremtve.'},
      {s:'eros',t:'A párommal igazán értjük egymást.'},
      {s:'eros',t:'A párom megfelel a külső szépségről alkotott ideálomnak.'},
      {s:'storge',t:'A szerelmünk azért a legjobb fajta, mert hosszú barátságból nőtt ki.'},
      {s:'storge',t:'A barátságunk idővel fokozatosan fordult át szerelembe.'},
      {s:'storge',t:'A szerelmünk valójában mély barátság, nem valami titokzatos, misztikus érzelem.'},
      {s:'storge',t:'A kapcsolatunk azért a legkielégítőbb, mert jó barátságból fejlődött ki.'}]},
    {title:'II. rész — <em>Játék és választás</em>',desc:'Kontroll, elköteleződés, tudatos szempontok.',items:[
      {s:'ludus',t:'Amit a párom nem tud rólam, az nem is fáj neki.'},
      {s:'ludus',t:'Előfordult, hogy titkolnom kellett a párom elől más kapcsolataimat.'},
      {s:'ludus',t:'A párom kiborulna, ha tudna néhány dologról, amit másokkal tettem.'},
      {s:'ludus',t:'Élvezem a „szerelmi játékot” a párommal és más partnerekkel is.'},
      {s:'pragma',t:'A párválasztásnál fontos szempont volt, hogyan illik majd a családomhoz.'},
      {s:'pragma',t:'A párválasztásnál fontos tényező volt, hogy jó szülő lesz-e.'},
      {s:'pragma',t:'A párválasztásnál szempont volt, hogyan hat majd a karrieremre.'},
      {s:'pragma',t:'Mielőtt komolyabban belebonyolódtam, végiggondoltam, mennyire illik össze a hátterünk egy esetleges közös gyerek szempontjából.'}]},
    {title:'III. rész — <em>Szorongás és odaadás</em>',desc:'Mi történik benned, amikor a kapcsolat bizonytalan, és mennyit adsz.',items:[
      {s:'mania',t:'Ha a párom nem figyel rám, fizikailag is rosszul leszek.'},
      {s:'mania',t:'Mióta szerelmes vagyok a páromba, nehezen tudok bármi másra koncentrálni.'},
      {s:'mania',t:'Nem tudok megnyugodni, ha gyanítom, hogy a párom valaki mással van.'},
      {s:'mania',t:'Ha a párom egy ideig nem foglalkozik velem, néha butaságokat csinálok, hogy visszaszerezzem a figyelmét.'},
      {s:'agape',t:'Inkább én szenvedjek, mint hogy a párom szenvedjen.'},
      {s:'agape',t:'Nem lehetek boldog, ha nem helyezem a párom boldogságát a sajátom elé.'},
      {s:'agape',t:'Általában hajlandó vagyok feláldozni a saját vágyaimat, hogy a párom elérhesse a sajátjait.'},
      {s:'agape',t:'Bármit elviselnék a párom kedvéért.'}]}
  ],
  score(R){const o={};Object.keys(ST).forEach(k=>o[k]=H.r2(R.mean(k)));return o;},
  sum(s){const k=Object.keys(ST).sort((a,b)=>s[b]-s[a]);return {h:ST[k[0]].name+' + '+ST[k[1]].name,d:Object.fromEntries(Object.keys(ST).map(x=>[x,[ST[x].name+' ('+ST[x].hu+')',s[x],1,5]]))};},
  render(R,s){
    const keys=Object.keys(ST);
    const sorted=[...keys].sort((a,b)=>s[b]-s[a]);
    const top=sorted[0],second=sorted[1];
    const radar=H.radar(keys.map(k=>({label:ST[k].name,value:s[k],shown:s[k].toFixed(1),color:ST[k].color})),{min:1,max:5,stroke:'#fb7185',fill:'rgba(251,113,133,0.22)'});
    let notes=[];
    if(s.eros>=4)notes.push('<p><strong>Magas Eros:</strong> a kutatásokban az egyik legerősebb pozitív előrejelzője a kapcsolati elégedettségnek (Hendrick & Hendrick, 1988). Kockázata: ha a kémia elmúlik, könnyű azt hinni, hogy „vége”.</p>');
    if(s.ludus>=3)notes.push('<p><strong>Emelkedett Ludus:</strong> következetesen negatív kapcsolatban áll az elégedettséggel és az elköteleződéssel. Érdemes megnézni, mennyire szolgál védekezésként: kontroll a sebezhetőség helyett. Az ECR-R <em>elkerülés</em> dimenziójával szokott együtt járni.</p>');
    if(s.mania>=3)notes.push('<p><strong>Emelkedett Mania:</strong> a kötődési szorongás „szerelmi nyelve”. Erősen korrelál az ECR-R <em>szorongás</em> dimenziójával (Feeney & Noller, 1990). A hullámvasút-élmény nem a szerelem mértéke, hanem az idegrendszer riasztása. Ha itt magas vagy, a <a href="terkepek.html#test-ecr" style="color:#c4b5fd">kötődési térkép</a> a következő lépés.</p>');
    if(s.agape>=4)notes.push('<p><strong>Magas Agape:</strong> nagylelkűség, de figyelj a határra: ha tartósan feladod a saját szükségleteidet, abból az önfeláldozás sémája lehet (YSQ). Egészséges formában kölcsönös, egyoldalúan kiégéshez vezet.</p>');
    if(s.pragma>=4)notes.push('<p><strong>Magas Pragma:</strong> tudatos, jövőorientált választás. Stabil alap, de ha az Eros alacsony mellette, a kapcsolat „jó üzlet” lehet, érzelmi fűtés nélkül.</p>');
    if(s.storge>=4)notes.push('<p><strong>Magas Storge:</strong> a legtartósabb kapcsolatok gyakran innen indulnak. Kockázata a testvéri, szenvedély nélküli állapot.</p>');
    if(!notes.length)notes.push('<p>Egyik stílus sem emelkedik ki erősen. Ez gyakran azt jelenti, hogy a jelenlegi kapcsolatban egyik minta sem aktiválódik intenzíven, vagy a kérdésekre általánosságban válaszoltál.</p>');
    return `<div class="res-eyebrow">Eredmény · Szeretetstílus-profil</div>
      <h2 class="res-title">A te <em>szeretetstílus-keveréked</em></h2>
      <p class="res-lead">Hat stílus, 1–5 átlagpontszám. A fő stílusod <strong>${ST[top].name}</strong> (${ST[top].hu}), a második <strong>${ST[second].name}</strong> (${ST[second].hu}).</p>
      ${H.chart('Szeretetstílus <em>radar</em>','Hat tengely · 1–5 átlag',radar)}
      ${H.rank('Stílusok <em>sorrendben</em>',sorted.map((k,i)=>({name:ST[k].name,sub:ST[k].hu,desc:ST[k].desc,score:s[k].toFixed(1),unit:band5(s[k]),color:ST[k].color,top:i===0})))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'A fő kombinációd: '+ST[top].name+' + '+ST[second].name,color:ST[top].color,html:`<p>${ST[top].desc}</p><p>${ST[second].desc}</p>`},
        {h:'Kiemelt jelzések',html:notes.join('')},
        {h:'Párban használva',html:'<p>A legtöbbet akkor ad, ha a párod is kitölti. Több kutatás szerint a hasonló stílus (főleg Eros és Agape egyezés) az elégedettséggel jár együtt. A Ludus–Mania párosnál üldöző–menekülő dinamika alakulhat ki.</p>'}
      ])}
      ${H.refs(['<strong>Lee, J. A. (1973).</strong> <em>Colours of Love: An Exploration of the Ways of Loving.</em> New Press.',
        '<strong>Hendrick, C., & Hendrick, S. S. (1986).</strong> A theory and method of love. <em>Journal of Personality and Social Psychology, 50</em>(2), 392–402.',
        '<strong>Hendrick, C., Hendrick, S. S., & Dicke, A. (1998).</strong> The Love Attitudes Scale: Short form. <em>Journal of Social and Personal Relationships, 15</em>(2), 147–159.',
        '<strong>Feeney, J. A., & Noller, P. (1990).</strong> Attachment style as a predictor of adult romantic relationships. <em>JPSP, 58</em>(2), 281–291.'])}`;
  }
});
})();

/* ═══════════ 2. KONFLIKTUSKEZELÉSI MÓDOK (Thomas–Kilmann-modell) ═══════════ */
(function(){
const M={
  comp:{name:'Versengő',en:'Competing',color:'#fb7185',a:1,c:0,
    desc:'Magas önérvényesítés, alacsony együttműködés. A saját álláspont érvényesítése, akár a kapcsolat rovására.',
    over:'Túlhasználva: a környezet elhallgat, nem kapsz valódi visszajelzést, az emberek „igent mondanak”, de nem köteleződnek el.',
    under:'Alulhasználva: nehezen hozol népszerűtlen döntést, és hagyod, hogy mások kihasználják a hezitálásodat.',
    when:'Vészhelyzet, gyors döntés, etikai kérdés, vagy amikor tudod, hogy igazad van, és nagy a tét.'},
  coll:{name:'Együttműködő',en:'Collaborating',color:'#34d399',a:1,c:1,
    desc:'Magas önérvényesítés és magas együttműködés. Olyan megoldás keresése, amely mindkét fél valódi érdekét kielégíti.',
    over:'Túlhasználva: apró ügyeket is hosszú egyeztetéssé fújsz fel, a döntés lelassul, mindenki kifárad.',
    under:'Alulhasználva: a megoldások felszínesek, és a közös elköteleződés hiányzik.',
    when:'Fontos, hosszú távú kapcsolat vagy döntés, amikor mindkét fél érdeke túl fontos a kompromisszumhoz.'},
  compr:{name:'Kompromisszumkereső',en:'Compromising',color:'#fbbf24',a:.5,c:.5,
    desc:'Közepes önérvényesítés és együttműködés. Gyors középút: mindkét fél enged valamennyit.',
    over:'Túlhasználva: minden „félig jó”, és elveszted a szem elől, mi lenne a valóban jó megoldás.',
    under:'Alulhasználva: kicsi ügyekben is elakadsz elvi vitákban.',
    when:'Időnyomás, egyenrangú erőviszonyok, ideiglenes megoldás kell.'},
  avoid:{name:'Elkerülő',en:'Avoiding',color:'#94a3b8',a:0,c:0,
    desc:'Alacsony önérvényesítés és alacsony együttműködés. A konfliktus elhalasztása, kikerülése.',
    over:'Túlhasználva: a problémák felhalmozódnak, a döntések mások kezébe kerülnek, a feszültség csendben nő.',
    under:'Alulhasználva: minden apróságon vitatkozol, és nem hagysz időt a lehűlésre.',
    when:'Jelentéktelen ügy, túl magas érzelmi hőfok (lehűlés kell), vagy ha nincs esélyed nyerni, és a vita többe kerül.'},
  acc:{name:'Alkalmazkodó',en:'Accommodating',color:'#60a5fa',a:0,c:1,
    desc:'Alacsony önérvényesítés, magas együttműködés. A másik igényének előtérbe helyezése.',
    over:'Túlhasználva: a saját igényeid háttérbe kerülhetnek, és idővel neheztelés gyűlhet fel.',
    under:'Alulhasználva: nehezen engedsz akkor is, ha a kapcsolat fontosabb az ügynél.',
    when:'Ha rájöttél, hogy tévedtél, ha a másiknak sokkal fontosabb, vagy ha jóindulatot akarsz építeni.'}
};
makeTest({
  id:'tki',key:'conflict-responses-v1',name:'Konfliktusmódok',c1:'#34d399',c2:'#2dd4bf',
  tab:'Konfliktusstílus',tabSub:'TKI-modell · 25 item',scale:SCALE5,
  header:{status:'model',statusText:'Modell-alapú saját itemkészlet · nem a hivatalos TKI',
    eyebrow:'Thomas–Kilmann konfliktusmodell (1974) · 5 mód · 2 dimenzió',
    title:'Hogyan <em style="color:#34d399">vitázol</em>',
    lead:'Thomas és Kilmann modellje két független dimenzióra épít: <strong>önérvényesítés</strong> (mennyire viszed a saját érdeked) és <strong>együttműködés</strong> (mennyire a másikét). A kettő kombinációja öt konfliktusmódot ad. Mindenki használja mind az ötöt, a kérdés az, <em>melyikre áll rá automatikusan</em>.',
    intro:'<p><strong>Fontos:</strong> a hivatalos TKI szerzői jogvédett, 30 kényszerválasztós tételpárból áll. Ez egy <strong>saját, a modellre épülő 25 tételes Likert-változat</strong>. A profil tájékoztató jellegű, normához nem hasonlítható.</p><p><strong>Kitöltés:</strong> gondolj azokra a helyzetekre, amikor valakivel (munkában vagy magánéletben) nem értetek egyet. Mennyire jellemző rád az állítás? 1 = egyáltalán nem · 5 = teljesen.</p>'},
  sections:[
    {title:'Amikor nézeteltérés van…',desc:'25 állítás, 5 móddal keverve.',items:[
      {s:'comp',t:'Kitartok az álláspontom mellett, akkor is, ha a másik nyomást gyakorol rám.'},
      {s:'coll',t:'Igyekszem minden szempontot az asztalra tenni, hogy közösen találjunk megoldást.'},
      {s:'compr',t:'Keresem a középutat, ahol mindkét fél enged valamennyit.'},
      {s:'avoid',t:'Ha lehet, kerülöm a feszült témákat.'},
      {s:'acc',t:'Ha a másiknak fontosabb, átengedem neki a döntést.'},
      {s:'comp',t:'Fontos nekem, hogy a vitából én kerüljek ki győztesen.'},
      {s:'coll',t:'Addig dolgozom a problémán, amíg mindkét fél számára valóban jó megoldás születik.'},
      {s:'compr',t:'Hajlandó vagyok engedni valamiből, ha a másik is enged.'},
      {s:'avoid',t:'Inkább elhalasztom a vitát, amíg nem muszáj foglalkozni vele.'},
      {s:'acc',t:'A kapcsolat békéje fontosabb nekem, mint hogy igazam legyen.'},
      {s:'comp',t:'Érvelek, meggyőzök, és nem engedek, ha biztos vagyok az igazamban.'},
      {s:'coll',t:'Kíváncsi vagyok, mi áll a másik álláspontja mögött.'},
      {s:'compr',t:'Gyors, „fele-fele” megoldásra törekszem, hogy továbbléphessünk.'},
      {s:'avoid',t:'Nem szeretem nyíltan felvállalni a nézeteltérést.'},
      {s:'acc',t:'Könnyen feladom a saját igényemet, hogy a másik elégedett legyen.'},
      {s:'comp',t:'Ha kell, a pozíciómat vagy a befolyásomat is bevetem, hogy érvényesítsem a döntést.'},
      {s:'coll',t:'A nézeteltérést lehetőségnek látom egy jobb közös megoldásra.'},
      {s:'compr',t:'Azt javaslom, osszuk meg a különbséget.'},
      {s:'avoid',t:'Ha konfliktus alakul ki, inkább kivonulok a helyzetből.'},
      {s:'acc',t:'Igyekszem megnyugtatni a másikat, még ha ez nekem kevésbé jó is.'},
      {s:'comp',t:'Gyorsan és határozottan lépek, még ha ez másoknak kellemetlen is.'},
      {s:'coll',t:'Nyíltan kimondom az érdekeimet, és a másikét is komolyan veszem.'},
      {s:'compr',t:'Egy elfogadható megoldás nekem jobb, mint egy hosszú vita a tökéletesről.'},
      {s:'avoid',t:'Sokszor hagyom, hogy a probléma „megoldja magát”.'},
      {s:'acc',t:'Inkább engedek, mint hogy megbántsak valakit.'}]}
  ],
  score(R){const o={};Object.keys(M).forEach(k=>o[k]=H.r2(R.mean(k)));
    o.assert=H.r2((o.comp+o.coll)/2-(o.avoid+o.acc)/2);
    o.coop=H.r2((o.coll+o.acc)/2-(o.comp+o.avoid)/2);return o;},
  sum(s){const k=Object.keys(M).sort((a,b)=>s[b]-s[a]);return {h:'Alapmód: '+M[k[0]].name,d:Object.assign(Object.fromEntries(Object.keys(M).map(x=>[x,[M[x].name,s[x],1,5]])),{assert:['Önérvényesítés-index',s.assert,-4,4],coop:['Együttműködés-index',s.coop,-4,4]})};},
  render(R,s){
    const keys=Object.keys(M),sorted=[...keys].sort((a,b)=>s[b]-s[a]);
    const top=sorted[0],low=sorted[sorted.length-1];
    const P={comp:[125,120],coll:[335,120],compr:[230,250],avoid:[125,370],acc:[335,370]};
    let svg=`<svg class="chart-svg" viewBox="0 0 460 470">
      <line x1="40" y1="440" x2="440" y2="440" stroke="rgba(147,197,253,0.35)"/><line x1="40" y1="440" x2="40" y2="20" stroke="rgba(147,197,253,0.35)"/>
      <line x1="230" y1="30" x2="230" y2="430" stroke="rgba(147,197,253,0.12)" stroke-dasharray="4,5"/><line x1="50" y1="230" x2="430" y2="230" stroke="rgba(147,197,253,0.12)" stroke-dasharray="4,5"/>
      <text x="240" y="462" text-anchor="middle" font-family="Manrope" font-size="11" letter-spacing="2" fill="#94a3b8">EGYÜTTMŰKÖDÉS →</text>
      <text x="20" y="230" text-anchor="middle" font-family="Manrope" font-size="11" letter-spacing="2" fill="#94a3b8" transform="rotate(-90 20 230)">ÖNÉRVÉNYESÍTÉS →</text>`;
    keys.forEach(k=>{const [x,y]=P[k],r=14+(s[k]-1)/4*46;
      svg+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${M[k].color}" fill-opacity="${k===top?0.55:0.28}" stroke="${M[k].color}" stroke-width="${k===top?3:1.5}"/>
      <text x="${x}" y="${y-r-8}" text-anchor="middle" font-family="Fraunces,serif" font-size="14" fill="#f1f5f9">${M[k].name}</text>
      <text x="${x}" y="${y+5}" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="13" fill="#fff">${s[k].toFixed(1)}</text>`;});
    svg+='</svg>';
    const axisTxt=`Önérvényesítés-index: <strong>${s.assert>0?'+':''}${s.assert}</strong> · Együttműködés-index: <strong>${s.coop>0?'+':''}${s.coop}</strong> (−4 és +4 között; 0 = kiegyensúlyozott)`;
    return `<div class="res-eyebrow">Eredmény · Konfliktusmód-profil</div>
      <h2 class="res-title">A te <em>konfliktustérképed</em></h2>
      <p class="res-lead">Az alapértelmezett módod: <strong>${M[top].name}</strong>. A legkevésbé használt: <strong>${M[low].name}</strong>. A buborék mérete az adott mód erősségét mutatja.</p>
      ${H.chart('Két dimenzió, <em>öt mód</em>','Buborékméret = pontszám (1–5)',svg+`<p style="text-align:center;font-size:13px;color:var(--ink-lite-soft);margin-top:14px">${axisTxt}</p>`)}
      ${H.rank('Módok <em>sorrendben</em>',sorted.map((k,i)=>({name:M[k].name,sub:M[k].en,desc:M[k].desc,score:s[k].toFixed(1),unit:band5(s[k]),color:M[k].color,top:i===0})))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Alapértelmezett mód: '+M[top].name,color:M[top].color,html:`<p>${M[top].desc}</p><p><strong>Kockázat:</strong> ${M[top].over}</p><p><strong>Mikor jó választás:</strong> ${M[top].when}</p>`},
        {h:'Vakfolt: '+M[low].name,color:M[low].color,html:`<p>${M[low].under}</p><p><strong>Mikor lenne rá szükséged:</strong> ${M[low].when}</p>`},
        {h:'A lényeg',html:'<p>Nincs „legjobb” mód. A konfliktuskezelés akkor érett, ha <strong>választod</strong> a módot a helyzethez, és nem a reflex választ helyetted. Kérdezd meg magadtól vita előtt: mennyire fontos nekem az ügy, és mennyire fontos a kapcsolat? A kettő együtt kijelöli a megfelelő módot.</p>'}
      ])}
      ${H.refs(['<strong>Thomas, K. W., & Kilmann, R. H. (1974).</strong> <em>Thomas–Kilmann Conflict Mode Instrument.</em> Xicom.',
        '<strong>Thomas, K. W. (1976).</strong> Conflict and conflict management. In M. D. Dunnette (Ed.), <em>Handbook of Industrial and Organizational Psychology</em>, 889–935.',
        '<strong>Rahim, M. A. (1983).</strong> A measure of styles of handling interpersonal conflict. <em>Academy of Management Journal, 26</em>(2), 368–376.',
        '<em>Ez a változat saját itemkészlet a modell dimenzióira. A hivatalos TKI a Myers-Briggs Company terméke.</em>'])}`;
  }
});
})();

/* ═══════════ 3. GOTTMAN-MODELL — KAPCSOLATI EGÉSZSÉG ═══════════ */
(function(){
const SS={
  maps:{name:'Szeretet-térkép',en:'Love Maps',color:'#34d399',anti:'Tegyél fel nyitott kérdéseket: „Mi a legnagyobb stressz most az életedben?”, „Mire vágysz a következő évben?”. Heti egy mély beszélgetés.'},
  fond:{name:'Megbecsülés és csodálat',en:'Fondness & Admiration',color:'#2dd4bf',anti:'Naponta egy konkrét, kimondott elismerés. Nem „jó vagy”, hanem „tetszett, ahogy ma kezelted X-et”.'},
  turn:{name:'Egymás felé fordulás',en:'Turning Toward',color:'#60a5fa',anti:'Figyeld a „bid”-eket (apró kapcsolatteremtési kísérleteket), és reagálj rájuk. A tartós pároknál ez ~86%, a szétvált pároknál ~33% volt Gottman megfigyelésében.'},
  repair:{name:'Javítási kísérletek',en:'Repair Attempts',color:'#a78bfa',anti:'Egyeztessetek előre „vészféket”: egy szót vagy gesztust, ami vita közben szünetet jelent. Vita után: „Mi volt benned, amikor…?”'}
};
const HR={
  crit:{name:'Kritika',en:'Criticism',color:'#fbbf24',anti:'<strong>Szelíd indítás:</strong> „Én-üzenet + érzés + konkrét kérés”. Nem „te mindig…”, hanem „Frusztrált vagyok, mert… Szeretném, ha…”.'},
  cont:{name:'Megvetés',en:'Contempt',color:'#fb7185',anti:'<strong>A megbecsülés kultúrája:</strong> a megvetés ellenszere a rendszeres, tudatos elismerés és hála. Gottman szerint ez a válás legerősebb egyedi előrejelzője.'},
  def:{name:'Védekezés',en:'Defensiveness',color:'#f97316',anti:'<strong>Felelősségvállalás:</strong> keresd meg a panaszban a rád eső részt, akár csak 5%-ot, és azt mondd ki: „Igazad van abban, hogy…”.'},
  stone:{name:'Falazás',en:'Stonewalling',color:'#94a3b8',anti:'<strong>Fiziológiai önmegnyugtatás:</strong> ha 100 fölé megy a pulzusod, kérj legalább 20 perc szünetet, és jelezd, mikor jössz vissza. Ez nem menekülés, hanem szabályozás.'}
};
makeTest({
  id:'gott',key:'gottman-responses-v1',name:'Gottman-kapcsolattérkép',c1:'#60a5fa',c2:'#818cf8',
  tab:'Gottman-térkép',tabSub:'Kapcsolati ház · 32 item',scale:SCALE5,
  header:{status:'model',statusText:'Modell-alapú saját itemkészlet · nem a Gottman Institute kérdőíve',
    eyebrow:'Sound Relationship House · Négy lovas · Gottman (1994, 1999)',
    title:'A kapcsolatod <em style="color:#60a5fa">szerkezete</em>',
    lead:'John Gottman 40 év alatt több ezer párt figyelt meg laborban, és nagy pontossággal jelezte előre, kik maradnak együtt. Két dolgot mért: a <strong>barátság alapjait</strong> (ismeritek-e egymást, van-e csodálat, egymás felé fordultok-e, tudtok-e békülni) és a <strong>négy lovast</strong>, a kapcsolat romlásának négy kommunikációs mintáját.',
    intro:'<p><strong>Fontos:</strong> Gottman eredeti kvízei szerzői jogvédettek. Ez egy <strong>saját, a modell elemeire írt 32 tételes változat</strong>, önreflexióra, nem előrejelzésre.</p><p><strong>Kitöltés:</strong> a jelenlegi kapcsolatodra gondolj. Ha nincs, a legutóbbi hosszabbra. A „lovasok” részben a <em>saját</em> viselkedésedet értékeld, ne a párodét. Ez a legnehezebb és a leghasznosabb rész.</p><p>1 = egyáltalán nem igaz · 5 = teljesen igaz.</p>'},
  sections:[
    {title:'I. rész — <em>A barátság alapjai</em>',desc:'A kapcsolati ház alsó szintjei.',items:[
      {s:'maps',t:'Ismerem a párom jelenlegi legnagyobb stresszforrását.'},
      {s:'maps',t:'Tudom, kik most a párom legközelebbi barátai.'},
      {s:'maps',t:'Ismerem a párom álmait és céljait a következő évekre.'},
      {s:'maps',t:'Tudom, mi a párom kedvenc módja a kikapcsolódásra.'},
      {s:'maps',t:'Rendszeresen kérdezek a párom belső világáról.'},
      {s:'fond',t:'Könnyen fel tudom idézni, mit csodálok a páromban.'},
      {s:'fond',t:'Gyakran kifejezem a páromnak a megbecsülésemet.'},
      {s:'fond',t:'A kapcsolatunk kezdetére szeretettel gondolok vissza.'},
      {s:'fond',t:'Érzem, hogy a párom tisztel engem.'},
      {s:'fond',t:'Büszke vagyok a páromra.'},
      {s:'turn',t:'Amikor a párom apró jelzést küld (megjegyzés, kérdés, érintés), reagálok rá.'},
      {s:'turn',t:'Figyelek a párom kis, hétköznapi kapcsolatteremtési kísérleteire.'},
      {s:'turn',t:'Érzem, hogy a párom felém fordul, amikor szólok hozzá.'},
      {s:'turn',t:'Különleges alkalom nélkül is töltünk együtt minőségi időt.'},
      {s:'turn',t:'Nem a telefonomat nézem, amikor a párom beszél hozzám.'},
      {s:'repair',t:'Vita közben valamelyikünk képes enyhíteni a feszültséget (humorral, érintéssel, bocsánatkéréssel).'},
      {s:'repair',t:'Ha elfajul egy vita, meg tudunk állni és szünetet tartani.'},
      {s:'repair',t:'Elfogadom a párom békülési gesztusait.'},
      {s:'repair',t:'Vita után vissza tudunk találni egymáshoz.'},
      {s:'repair',t:'Képes vagyok vállalni a felelősséget a probléma rám eső részéért.'}]},
    {title:'II. rész — <em>A négy lovas</em> · a saját viselkedésed',desc:'Itt a magas pontszám a kockázatot jelzi.',items:[
      {s:'crit',t:'Vitában inkább a párom személyiségét hibáztatom („mindig”, „soha”), nem egy konkrét viselkedést.'},
      {s:'crit',t:'Gyakran érzem, hogy a párommal alapvetően valami baj van.'},
      {s:'crit',t:'A panaszaimat vádként fogalmazom meg.'},
      {s:'cont',t:'Előfordul, hogy szarkasztikus vagy gúnyos vagyok a párommal.'},
      {s:'cont',t:'Vita közben forgatom a szemem, vagy lekezelően beszélek.'},
      {s:'cont',t:'Néha úgy érzem, felette állok a páromnak.'},
      {s:'def',t:'Ha a párom panaszkodik, azonnal magyarázkodom vagy visszatámadok.'},
      {s:'def',t:'Nehezen ismerem el, ha hibáztam.'},
      {s:'def',t:'Vita közben úgy érzem, ártatlan áldozat vagyok.'},
      {s:'stone',t:'Vita közben lezárok, elhallgatok, nem reagálok.'},
      {s:'stone',t:'Ha túl sok lesz, fizikailag vagy érzelmileg kivonulok.'},
      {s:'stone',t:'Vita közben elárasztanak az érzések, és nem tudok tisztán gondolkodni.'}]}
  ],
  score(R){const o={};[...Object.keys(SS),...Object.keys(HR)].forEach(k=>o[k]=H.r2(R.mean(k)));
    o.strength=H.r2(H.mean(Object.keys(SS).map(k=>o[k])));o.risk=H.r2(H.mean(Object.keys(HR).map(k=>o[k])));return o;},
  sum(s){const st=s.strength>=4&&s.risk<2.5?'Erős alap, alacsony kockázat':s.strength>=3.5&&s.risk<3?'Működő kapcsolat, fejlesztési ponttal':s.risk>=3.5?'Magas konfliktuskockázat':'Gyengülő alapok';const d={strength:['Alapok átlaga',s.strength,1,5],risk:['Négy lovas átlaga',s.risk,1,5]};Object.keys(SS).forEach(k=>d[k]=[SS[k].name,s[k],1,5]);Object.keys(HR).forEach(k=>d[k]=[HR[k].name,s[k],1,5]);return {h:st,d};},
  render(R,s){
    const pct=v=>(v-1)/4*100;
    const weakS=Object.keys(SS).sort((a,b)=>s[a]-s[b])[0];
    const topH=Object.keys(HR).sort((a,b)=>s[b]-s[a])[0];
    const status=s.strength>=4&&s.risk<2.5?'Erős alap, alacsony kockázat':s.strength>=3.5&&s.risk<3?'Működő kapcsolat, célzott fejlesztési ponttal':s.risk>=3.5?'Magas konfliktuskockázat':'Gyengülő alapok';
    const flags=[];
    if(s.cont>=3)flags.push(H.callout('<strong>Megvetés-jelzés (≥3):</strong> Gottman kutatásaiban a megvetés volt a válás legerősebb egyedi előrejelzője, és az immunrendszer gyengülésével is összefüggött a fogadó félnél. Ez a legelső terület, amivel dolgozni érdemes.','#fb7185'));
    if(s.stone>=3.5)flags.push(H.callout('<strong>Elárasztás és falazás:</strong> a falazás mögött általában fiziológiai túlterhelés áll (magas pulzus, „fight or flight”). Ilyenkor nem akaratról van szó: a gondolkodó agy lekapcsol. Szabályozás kell, nem több érv.','#94a3b8'));
    return `<div class="res-eyebrow">Eredmény · Kapcsolati ház</div>
      <h2 class="res-title"><em>${status}</em></h2>
      <p class="res-lead">Alapok átlaga: <strong>${s.strength.toFixed(1)}</strong>/5 (magasabb = jobb) · Négy lovas átlaga: <strong>${s.risk.toFixed(1)}</strong>/5 (alacsonyabb = jobb).</p>
      ${flags.join('')}
      ${H.bars('Barátság <em>alapjai</em>',[{title:'Magasabb = erősebb',color:'#34d399',rows:Object.keys(SS).map(k=>({name:SS[k].name+' <span style="color:var(--ink-lite-muted);font-size:12px">· '+SS[k].en+'</span>',val:s[k].toFixed(1),unit:'/5',pct:pct(s[k]),color:SS[k].color}))}])}
      ${H.bars('A négy <em>lovas</em>',[{title:'Magasabb = nagyobb kockázat',color:'#fb7185',rows:Object.keys(HR).map(k=>({name:HR[k].name+' <span style="color:var(--ink-lite-muted);font-size:12px">· '+HR[k].en+'</span>',val:s[k].toFixed(1),unit:'/5',pct:pct(s[k]),color:HR[k].color}))}])}
      ${H.interp('Hol <em>érdemes kezdeni</em>',[
        {h:'Leggyengébb alap: '+SS[weakS].name,color:SS[weakS].color,html:`<p>${SS[weakS].anti}</p>`},
        {h:'Legerősebb lovas: '+HR[topH].name+' → ellenszer',color:HR[topH].color,html:`<p>${HR[topH].anti}</p>`},
        {h:'Az 5:1 szabály',html:'<p>Gottman megfigyelése szerint a stabil párok konfliktus közben is nagyjából <strong>5 pozitív interakciót</strong> (érdeklődés, humor, érintés, egyetértés, elismerés) tartanak fenn minden negatívra. Nem a vita hiánya számít, hanem ez az arány.</p>'}
      ])}
      ${H.refs(['<strong>Gottman, J. M. (1994).</strong> <em>What Predicts Divorce? The Relationship Between Marital Processes and Marital Outcomes.</em> Lawrence Erlbaum.',
        '<strong>Gottman, J. M., & Silver, N. (1999).</strong> <em>The Seven Principles for Making Marriage Work.</em> Crown.',
        '<strong>Gottman, J. M., & Levenson, R. W. (2000).</strong> The timing of divorce: Predicting when a couple will divorce over a 14-year period. <em>Journal of Marriage and Family, 62</em>(3), 737–745.',
        '<strong>Driver, J. L., & Gottman, J. M. (2004).</strong> Daily marital interactions and positive affect during marital conflict among newlywed couples. <em>Family Process, 43</em>(3), 301–314.'])}`;
  }
});
})();

/* ═══════════ 4. FISHER TEMPERAMENTUM-MODELL ═══════════ */
(function(){
const T={
  exp:{name:'Felfedező',en:'Explorer',sys:'dopamin / noradrenalin',color:'#fbbf24',
    desc:'Kíváncsi, újdonságkereső, spontán, energikus, kockázatvállaló, kreatív. Hamar megunja a rutint.',
    love:'Fisher adatai szerint a Felfedezők leginkább más Felfedezőkhöz vonzódnak: a közös kaland köti össze őket.',
    shadow:'Impulzivitás, türelmetlenség, sok indítás, kevés befejezés.'},
  bld:{name:'Építő',en:'Builder',sys:'szerotonin',color:'#34d399',
    desc:'Óvatos, szabálykövető, tervező, hűséges, közösségi, a hagyományokat és a stabilitást értékeli.',
    love:'Az Építők jellemzően más Építőket választanak: közös értékek, kiszámíthatóság.',
    shadow:'Merevség, változással szembeni ellenállás, túlzott óvatosság.'},
  dir:{name:'Irányító',en:'Director',sys:'tesztoszteron',color:'#60a5fa',
    desc:'Elemző, logikus, egyenes, határozott, versengő, rendszerekben gondolkodik, mélyre fókuszál.',
    love:'Az Irányítók Fisher adataiban gyakran a Közvetítőkhöz vonzódnak: kiegészítő párosítás.',
    shadow:'Nyersesség, empátia háttérbe szorulása, érzelmek racionalizálása.'},
  neg:{name:'Közvetítő',en:'Negotiator',sys:'ösztrogén / oxitocin',color:'#a78bfa',
    desc:'Empatikus, intuitív, verbálisan erős, a nagy képet és az árnyalatokat látja, idealista, kapcsolatorientált.',
    love:'A Közvetítők gyakran az Irányítókhoz vonzódnak: az egyik a mélységet, a másik a határozottságot hozza.',
    shadow:'Döntésképtelenség a sok szempont miatt, konfliktuskerülés, túlzott alkalmazkodás.'}
};
makeTest({
  id:'fti',key:'fisher-responses-v1',name:'Fisher-temperamentum',c1:'#a78bfa',c2:'#818cf8',
  tab:'Temperamentum',tabSub:'Fisher-modell · 40 item',scale:SCALE5,
  header:{status:'model',statusText:'Modell-alapú saját itemkészlet · nem az eredeti FTI',
    eyebrow:'Fisher Temperament Inventory-modell · Fisher, Island, Rich és mtsai. (2015)',
    title:'Négy <em style="color:#a78bfa">temperamentum</em>',
    lead:'Helen Fisher antropológus négy temperamentum-dimenziót írt le, és ezeket négy neurokémiai rendszerhez kötötte. Online randioldalak több millió felhasználójának adatain azt vizsgálta, <strong>ki kihez vonzódik</strong>. A modell népszerű és jól használható, de a neurokémiai címkék <em>hipotézisek</em>, nem ezt méred itt.',
    intro:'<p><strong>Fontos:</strong> az eredeti FTI 56 tétele szerzői jogvédett. Ez egy <strong>saját, dimenziónként 10 tételes változat</strong>. Mindenkiben mind a négy megvan, a profil a kombinációt mutatja.</p><p><strong>Kitöltés:</strong> mennyire jellemző rád általában? 1 = egyáltalán nem · 5 = teljesen.</p>'},
  sections:[
    {title:'Temperamentum-állítások',desc:'40 állítás, négy dimenzióval keverve.',items:(function(){
      const E=['Új élményekre vágyom, a rutin gyorsan untat.','Spontán döntök, sokszor az utolsó pillanatban.','Energikus vagyok, sok projekt fut nálam párhuzamosan.','Szinte bármi iránt kíváncsi vagyok.','Szívesen vállalok kockázatot egy izgalmas lehetőségért.','Könnyen unatkozom ismétlődő feladatoknál.','Szeretek utazni, új helyeket felfedezni.','Optimista vagyok, főleg a lehetőségeket látom.','Gyakran előbb cselekszem, és csak utána gondolkodom.','Kreatív, szokatlan ötleteim vannak.'];
      const B=['Fontosak nekem a szabályok és a bevált rendszerek.','Előre tervezek, és ragaszkodom a tervhez.','Hűséges vagyok a barátaimhoz és a vállalásaimhoz.','A hagyományok és a család sokat jelentenek nekem.','Óvatos vagyok a pénzügyekben és a döntésekben.','Szeretem tudni, mi fog történni.','Rendszerezett, pontos ember vagyok.','Egy közösségben szívesen vállalok szervezői szerepet.','Tisztelem a tekintélyt és a jól működő hierarchiát.','Megbízható vagyok: amit elvállalok, megcsinálom.'];
      const D=['Elemző, logikus gondolkodó vagyok.','Egyenesen, kertelés nélkül mondom meg a véleményem.','Határozottan döntök, akkor is, ha a döntés népszerűtlen.','A rendszerek és szabályszerűségek érdekelnek (gépek, számok, struktúrák).','Versengő vagyok, szeretek nyerni.','Az érzelmek helyett inkább a tényekre hagyatkozom.','Egy témába nagyon mélyen bele tudom ásni magam.','Nehéz meghatni, ritkán sírok.','A small talk kevésbé érdekel, inkább a lényeg.','Magabiztosan vállalom az ütközést.'];
      const N=['Jól olvasok mások érzelmeiből és gesztusaiból.','Könnyen beleélem magam mások helyzetébe.','Egy kérdést több szempontból is látok, szeretem az árnyalatokat.','Intuitív vagyok, sokszor megérzésből döntök.','Nagyon fontos nekem a kapcsolataim mélysége.','Jól bánok a szavakkal, a nyelvvel.','Idealista vagyok, keresem a dolgok értelmét.','Könnyen elérzékenyülök.','Döntéskor sok tényezőt mérlegelek egyszerre, hálózatban gondolkodom.','Előbb bizalmat építek, és csak utána beszélek üzletről vagy tervekről.'];
      const out=[];for(let i=0;i<10;i++){out.push({s:'exp',t:E[i]},{s:'bld',t:B[i]},{s:'dir',t:D[i]},{s:'neg',t:N[i]});}return out;})()}
  ],
  score(R){const o={};Object.keys(T).forEach(k=>o[k]=R.sum(k));return o;},
  sum(s){const k=Object.keys(T).sort((a,b)=>s[b]-s[a]);return {h:T[k[0]].name+' – '+T[k[1]].name,d:Object.fromEntries(Object.keys(T).map(x=>[x,[T[x].name,s[x],10,50]]))};},
  render(R,s){
    const keys=Object.keys(T),sorted=[...keys].sort((a,b)=>s[b]-s[a]);
    const p=sorted[0],q=sorted[1];
    const radar=H.radar(keys.map(k=>({label:T[k].name,value:s[k],shown:s[k]+'/50',color:T[k].color})),{min:10,max:50,stroke:'#a78bfa',fill:'rgba(167,139,250,0.24)'});
    const close=s[p]-s[q]<=3;
    return `<div class="res-eyebrow">Eredmény · Temperamentum-profil</div>
      <h2 class="res-title"><em>${T[p].name}</em> — ${T[q].name} profil</h2>
      <p class="res-lead">Elsődleges: <strong>${T[p].name}</strong> (${s[p]}/50) · másodlagos: <strong>${T[q].name}</strong> (${s[q]}/50).${close?' A kettő közel van egymáshoz, ezért vegyes profilnak érdemes olvasni.':''}</p>
      ${H.chart('Temperamentum <em>radar</em>','Négy dimenzió · 10–50',radar)}
      ${H.rank('Dimenziók <em>sorrendben</em>',sorted.map((k,i)=>({name:T[k].name,sub:T[k].en+' · '+T[k].sys,desc:T[k].desc,score:s[k],unit:'/ 50',color:T[k].color,top:i===0})))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Elsődleges: '+T[p].name,color:T[p].color,html:`<p>${T[p].desc}</p><p><strong>Árnyoldal:</strong> ${T[p].shadow}</p>`},
        {h:'Kihez vonzódsz (Fisher hipotézise)',color:T[p].color,html:`<p>${T[p].love}</p><p style="font-size:13px;color:var(--ink-lite-muted)">Fisher a Chemistry.com randiplatform felhasználóinak adataiból vezette le (Fisher, 2009). Tendencia, nem szabály, és független replikációja korlátozott.</p>`},
        {h:'A kombináció',color:T[q].color,html:`<p>A <strong>${T[p].name}–${T[q].name}</strong> kombinációban a ${T[q].name.toLowerCase()} oldal (${T[q].desc.split('.')[0].toLowerCase()}) színezi az elsődleges temperamentumot. Egy erős Felfedező–Irányító például gyors, merész stratéga. Egy Építő–Közvetítő gondoskodó közösségszervező.</p>`}
      ])}
      ${H.refs(['<strong>Fisher, H. E., Island, H. D., Rich, J., Marchalik, D., & Brown, L. L. (2015).</strong> Four broad temperament dimensions: Description, convergent validation correlations, and comparison with the Big Five. <em>Frontiers in Psychology, 6</em>, 1098.',
        '<strong>Fisher, H. (2009).</strong> <em>Why Him? Why Her?</em> Henry Holt.',
        '<em>A neurokémiai megfeleltetés elméleti modell, nem hormonmérés. Az itemek saját fejlesztésűek.</em>'])}`;
  }
});
})();
