/* XVII. Szokások és önkontroll — AUDIT (WHO), Okostelefon-függőség skála rövid változat (SAS-SV), Rövid önkontroll-skála (BSCS).
   Az AUDIT a WHO szabadon használható szűrője; a SAS-SV nyílt hozzáférésű publikációban közölt; a BSCS kutatási célra szabadon használható.
   A magyar szöveg saját fordítás. */
const AUD_FREQ=[{t:'soha',v:0},{t:'havonta egyszer vagy ritkábban',v:1},{t:'havonta 2–4 alkalommal',v:2},{t:'hetente 2–3 alkalommal',v:3},{t:'hetente 4 vagy több alkalommal',v:4}];
const AUD_OFTEN=[{t:'soha',v:0},{t:'havonta egynél ritkábban',v:1},{t:'havonta',v:2},{t:'hetente',v:3},{t:'naponta vagy majdnem naponta',v:4}];
const AUD_YN=[{t:'nem',v:0},{t:'igen, de nem az elmúlt évben',v:2},{t:'igen, az elmúlt évben',v:4}];
const SAS_SCALE=[{v:1,l:'egyáltalán nem értek egyet'},{v:2,l:'nem értek egyet'},{v:3,l:'inkább nem'},{v:4,l:'inkább igen'},{v:5,l:'egyetértek'},{v:6,l:'teljesen egyetértek'}];
const BSCS_SCALE=[{v:1,l:'egyáltalán nem jellemző rám'},{v:2,l:'kicsit jellemző'},{v:3,l:'közepesen jellemző'},{v:4,l:'nagyrészt jellemző'},{v:5,l:'nagyon jellemző rám'}];

/* ═══════════ 1. AUDIT — ALKOHOLFOGYASZTÁS ═══════════ */
(function(){
/* WHO kockázati zónák: 0–7 alacsony · 8–15 kockázatos · 16–19 ártalmas · 20–40 lehetséges függőség */
const zone=t=>t>=20?{l:'Lehetséges alkoholfüggőség',c:'#e11d48',z:4}:t>=16?{l:'Ártalmas alkoholfogyasztás',c:'#f97316',z:3}:t>=8?{l:'Kockázatos alkoholfogyasztás',c:'#f59e0b',z:2}:{l:'Alacsony kockázat',c:'#34d399',z:1};
makeTest({
  id:'audit',key:'audit-responses-v1',name:'Alkoholfogyasztás (AUDIT)',c1:'#d4a017',c2:'#e11d48',
  tab:'Alkohol',tabSub:'AUDIT · 10 item',scale:[],
  header:{status:'valid',statusText:'Validált szűrő · WHO, Babor és mtsai (2001)',
    eyebrow:'Alcohol Use Disorders Identification Test · World Health Organization',
    title:'Milyen az <em style="color:#d4a017">alkoholhoz</em> való viszonyod',
    lead:'Az AUDIT a WHO tíz kérdéses szűrője: a fogyasztás mennyisége és gyakorisága, a kontroll elvesztésének jelei, és az alkohol okozta következmények. Nem azt mondja meg, „alkoholista”-e valaki, hanem hogy a jelenlegi mintád milyen kockázati zónába esik.',
    intro:'<p><strong>Kitöltés:</strong> az <strong>elmúlt évre</strong> gondolj. Egy ital (egység) kb. 10 gramm alkohol: <strong>2,5 dl sör, 1 dl bor vagy 3 cl tömény ital</strong>. Egy korsó (5 dl) sör tehát kb. két ital.</p><p>Összpontszám: 0–40. A WHO zónái: 0–7 alacsony kockázat, 8–15 kockázatos, 16–19 ártalmas, 20 felett lehetséges függőség.</p>'},
  sections:[
    {title:'Fogyasztás',desc:'',items:[
      {s:'C',t:'Milyen gyakran fogyasztasz alkoholt tartalmazó italt?',opts:AUD_FREQ},
      {s:'C',t:'Egy olyan napon, amikor iszol, általában hány italt fogyasztasz?',opts:[{t:'1 vagy 2',v:0},{t:'3 vagy 4',v:1},{t:'5 vagy 6',v:2},{t:'7–9',v:3},{t:'10 vagy több',v:4}]},
      {s:'C',t:'Milyen gyakran iszol meg hat vagy több italt egy alkalommal?',opts:AUD_OFTEN}]},
    {title:'Kontroll · <em>az elmúlt évben</em> milyen gyakran fordult elő…',desc:'',items:[
      {s:'D',t:'…hogy ha egyszer elkezdtél inni, nem tudtad abbahagyni?',opts:AUD_OFTEN},
      {s:'D',t:'…hogy az ivás miatt nem tetted meg, amit általában elvárnak tőled?',opts:AUD_OFTEN},
      {s:'D',t:'…hogy egy nagyobb ivás után reggel innod kellett, hogy beinduljon a napod?',opts:AUD_OFTEN}]},
    {title:'Következmények',desc:'',items:[
      {s:'H',t:'Az elmúlt évben milyen gyakran éreztél bűntudatot vagy lelkiismeret-furdalást ivás után?',opts:AUD_OFTEN},
      {s:'H',t:'Az elmúlt évben milyen gyakran fordult elő, hogy az ivás miatt nem emlékeztél, mi történt előző este?',opts:AUD_OFTEN},
      {s:'H',t:'Megsérültél már te vagy valaki más amiatt, hogy ittál?',opts:AUD_YN},
      {s:'H',t:'Aggódott már valamelyik rokonod, barátod, orvosod vagy más egészségügyi dolgozó az ivásod miatt, vagy javasolta, hogy igyál kevesebbet?',opts:AUD_YN}]}],
  score(R){const by=s=>H.sum(R.items.filter(i=>i.n>=(s==='C'?1:s==='D'?4:7)&&i.n<=(s==='C'?3:s==='D'?6:10)).map(i=>i.raw||0));
    const C=by('C'),Dp=by('D'),Hm=by('H');return {total:C+Dp+Hm,C,D:Dp,Hm};},
  sum(s){return {h:zone(s.total).l,d:{total:['AUDIT összpontszám',s.total,0,40],C:['Fogyasztás',s.C,0,12],D:['Kontroll elvesztése',s.D,0,12],H:['Következmények',s.Hm,0,16]}};},
  render(R,s){
    const z=zone(s.total),morning=R.items[5].raw>=3;
    return `<div class="res-eyebrow">Eredmény · AUDIT</div>
      <h2 class="res-title"><em>${z.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 40.</p>
      ${H.chart('Kockázati zóna','0–40 · WHO-határok: 8, 16, 20',H.gauge({name:'AUDIT',sub:z.l,val:s.total,unit:'/ 40',min:0,max:40,color:z.c,zones:[{from:0,to:7.5,color:'rgba(52,211,153,0.2)'},{from:7.5,to:15.5,color:'rgba(245,158,11,0.2)'},{from:15.5,to:19.5,color:'rgba(249,115,22,0.22)'},{from:19.5,to:40,color:'rgba(225,29,72,0.24)'}],labels:['0','8','16','20','40']}))}
      ${H.bars('Három <em>terület</em>',[{title:'',color:z.c,rows:[
        {name:'Fogyasztás (mennyiség, gyakoriság)',val:s.C,unit:'/12',pct:s.C/12*100,color:'#d4a017'},
        {name:'A kontroll elvesztésének jelei',val:s.D,unit:'/12',pct:s.D/12*100,color:'#f97316'},
        {name:'Következmények',val:s.Hm,unit:'/16',pct:s.Hm/16*100,color:'#e11d48'}]}])}
      ${(z.z>=3||morning)?H.callout('<p><strong>Biztonság.</strong> Ha rendszeresen és sokat iszol, '+(morning?'különösen ha reggel is szükséged van italra, ':'')+'<strong>ne hagyd abba hirtelen, egyedül</strong>: a hirtelen megvonás súlyos, akár életveszélyes elvonási tünetekkel járhat (remegés, izzadás, nyugtalanság, görcsroham). Beszélj háziorvossal: ő tud biztonságos, orvosilag kísért leállást vagy csökkentést segíteni. Ha most nagyon nehéz: Lelki Elsősegély Telefonszolgálat, <a href="tel:116123">116-123</a>; vészhelyzetben <a href="tel:112">112</a>.</p>','#fb7185'):''}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:z.c,html:z.z===1?'<p>A jelenlegi fogyasztási mintád alacsony kockázatú. Az alkohol egészségügyi kockázata ennek ellenére nem nulla; a kevesebb mindig kevesebb kockázat.</p>':z.z===2?'<p>A mintád a WHO szerint <strong>kockázatos</strong>: még nincs feltétlenül baj, de ha így marad, nő az egészségügyi és a társas ártalmak esélye. Ebben a zónában a legtöbb embernek a tudatos csökkentés is jól működik.</p>':z.z===3?'<p>A mintád <strong>ártalmas</strong>: az ivás már most következményekkel jár. Érdemes háziorvossal vagy addiktológussal átbeszélni, mert ebben a zónában a szakmai segítség sokkal hatékonyabb, mint az egyedüli próbálkozás.</p>':'<p>A válaszaid <strong>alkoholfüggőség</strong> lehetőségét jelzik. Ez jól kezelhető állapot, de orvosi kísérettel: kérj időpontot háziorvoshoz vagy addiktológiai ambulanciára, és ne hagyd abba hirtelen, egyedül.</p>'},
        z.z<=2?{h:'Ha csökkentenél',html:'<p>Legyen <strong>legalább két alkoholmentes nap</strong> egy héten. Előre döntsd el, hány italt iszol egy alkalommal, és két ital között igyál egy pohár vizet. Figyeld meg, mikor nyúlsz az italhoz: stressz, unalom, társaság vagy alvás miatt? Arra a helyzetre keress más megoldást.</p>'}:null,
        {h:'Kapcsolódó térképek',html:'<p>A stresszoldó ivás gyakran együtt jár magas észlelt stresszel (PSS-10), érzelemszabályozási nehézséggel (DERS-SF) és rossz alvással (SCI). Az alkohol elaltat, de rontja az alvás második felét.</p>'}
      ])}
      ${H.refs(['<strong>Babor, T. F., Higgins-Biddle, J. C., Saunders, J. B., & Monteiro, M. G. (2001).</strong> <em>AUDIT: The Alcohol Use Disorders Identification Test. Guidelines for use in primary care</em> (2nd ed.). World Health Organization.'])}`;
  }
});
})();

/* ═══════════ 2. SAS-SV — TELEFONHASZNÁLAT ═══════════ */
(function(){
/* Kwon és mtsai (2013): 10–60; a szerzők határai: férfiaknál 31, nőknél 33 */
const band=t=>t>=33?{l:'Problémás telefonhasználat',c:'#e11d48'}:t>=31?{l:'Határeset',c:'#f59e0b'}:t>=22?{l:'Mérsékelt kötődés a telefonhoz',c:'#60a5fa'}:{l:'Kontrollált telefonhasználat',c:'#34d399'};
makeTest({
  id:'sas',key:'sassv-responses-v1',name:'Telefonhasználat (SAS-SV)',c1:'#2563eb',c2:'#7c3aed',
  tab:'Telefon',tabSub:'SAS-SV · 10 item',scale:SAS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Kwon és mtsai (2013)',
    eyebrow:'Smartphone Addiction Scale – Short Version · Min Kwon és mtsai',
    title:'Te irányítod a <em style="color:#60a5fa">telefonod</em>, vagy fordítva',
    lead:'A SAS-SV nem a képernyőidőt méri, hanem azt, hogy a telefonhasználat <strong>mennyire zavarja</strong> a munkát, a figyelmet, a testet és a kapcsolatokat, és mennyire nehéz nélküle lenni. Sok telefonhasználat még nem probléma; a kontroll elvesztése az.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal? (Az eredeti skála a Facebookot és a Twittert említi; itt általánosan a közösségi médiára kérdezünk.)</p><p>Összpontszám: 10–60. A szerzők határai: férfiaknál 31, nőknél 33 felett problémás használat.</p>'},
  sections:[{title:'10 állítás',desc:'',items:[
    {s:'p',t:'A telefonhasználat miatt kimarad a tervezett munkám.'},
    {s:'p',t:'A telefonhasználat miatt nehezen tudok koncentrálni munka vagy tanulás közben.'},
    {s:'p',t:'Telefonhasználat közben fájdalmat érzek a csuklómban vagy a tarkómon.'},
    {s:'p',t:'Nem bírnám ki, hogy ne legyen nálam a telefonom.'},
    {s:'p',t:'Türelmetlen és nyugtalan vagyok, ha nincs a kezemben a telefonom.'},
    {s:'p',t:'Akkor is a telefonomon jár az eszem, amikor nem használom.'},
    {s:'p',t:'Akkor sem hagynék fel a telefonhasználattal, ha az már nagyon megzavarná a mindennapjaimat.'},
    {s:'p',t:'Folyamatosan nézem a telefonomat, hogy ne maradjak le semmiről a közösségi médiában.'},
    {s:'p',t:'Tovább használom a telefonomat, mint terveztem.'},
    {s:'p',t:'A körülöttem élők szerint túl sokat használom a telefonomat.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['Problémás telefonhasználat (SAS-SV)',s.total,10,60]}};},
  render(R,s){
    const b=band(s.total),top=R.items.filter(i=>i.raw>=5).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · SAS-SV</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összpontszám: <strong>${s.total}</strong> / 60.</p>
      ${H.chart('Telefonhasználat','10–60 · a szerzők határai: 31 (férfiak), 33 (nők)',H.gauge({name:'SAS-SV',sub:b.l,val:s.total,unit:'/ 60',min:10,max:60,color:b.c,zones:[{from:10,to:30.5,color:'rgba(52,211,153,0.2)'},{from:30.5,to:32.5,color:'rgba(245,158,11,0.22)'},{from:32.5,to:60,color:'rgba(225,29,72,0.22)'}],labels:['10','31','33','60']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=31?'<p>A telefonhasználatod már a mindennapokat zavaró mértékű: elviszi a figyelmet, a munkaidőt vagy a pihenést, és nehéz nélküle lenni. Ez nem jellemhiba: az alkalmazásokat úgy tervezik, hogy minél tovább tartsanak bent. Az ellenszer nem az akaraterő, hanem a környezet átalakítása.</p>':'<p>A telefonhasználatod most nem zavarja érdemben a mindennapjaidat. Érdemes figyelni azokra a pillanatokra, amikor gépiesen nyúlsz érte.</p>'},
        top.length?{h:'A legerősebb jelzések',html:top.map(i=>`<p>„${i.t}” — <strong>${SAS_SCALE[i.raw-1].l}</strong></p>`).join('')}:null,
        {h:'Ami tényleg működik',html:'<p><strong>Távolság:</strong> munka közben a telefon legyen másik szobában, ne csak lefordítva. <strong>Értesítések:</strong> kapcsold ki mindet, ami nem emberi üzenet. <strong>Hálószoba:</strong> a töltő legyen az ágyon kívül, ébresztőnek egy hagyományos óra. <strong>Szürke képernyő</strong> (fekete-fehér mód): kevésbé vonzó. A figyelmi következményekről lásd még: MAAS és ASRS.</p>'}
      ])}
      ${H.refs(['<strong>Kwon, M., Kim, D.-J., Cho, H., & Yang, S. (2013).</strong> The Smartphone Addiction Scale: Development and validation of a short version for adolescents. <em>PLoS ONE, 8</em>(12), e83558.'])}`;
  }
});
})();

/* ═══════════ 3. BSCS — ÖNKONTROLL ═══════════ */
(function(){
const band=m=>m>=3.67?{l:'Erős önkontroll',c:'#10b981'}:m>=2.67?{l:'Közepes önkontroll',c:'#60a5fa'}:{l:'Gyengébb önkontroll',c:'#f59e0b'};
makeTest({
  id:'bscs',key:'bscs-responses-v1',name:'Önkontroll (BSCS)',c1:'#10b981',c2:'#2563eb',
  tab:'Önkontroll',tabSub:'BSCS · 13 item',scale:BSCS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Tangney, Baumeister & Boone (2004)',
    eyebrow:'Brief Self-Control Scale · June P. Tangney, Roy F. Baumeister & Angie Luzio Boone',
    title:'Mennyire tudsz <em style="color:#10b981">ellenállni</em> a pillanatnak',
    lead:'Az önkontroll az a képesség, hogy a pillanatnyi késztetést felülírd egy fontosabb, hosszabb távú cél kedvéért. A kutatások szerint ez jobban előrejelzi a tanulmányi és munkahelyi eredményeket, a kapcsolatok minőségét és az egészségmagatartást, mint az intelligencia.',
    intro:'<p><strong>Kitöltés:</strong> mennyire jellemzőek rád az alábbi állítások? Kilenc állítás fordított pontozású.</p><p>Eredmény: 1–5 átlag. Tájékozódó sávok a skála harmadai szerint.</p>'},
  sections:[{title:'13 állítás',desc:'',items:[
    {s:'p',t:'Jól ellenállok a kísértéseknek.'},
    {s:'p',t:'Nehezen hagyom el a rossz szokásaimat.',r:true},
    {s:'p',t:'Lusta vagyok.',r:true},
    {s:'p',t:'Helytelen dolgokat mondok.',r:true},
    {s:'p',t:'Megteszek olyan dolgokat, amelyek rosszak nekem, ha szórakoztatóak.',r:true},
    {s:'p',t:'Visszautasítom azokat a dolgokat, amelyek rosszak nekem.'},
    {s:'p',t:'Bárcsak fegyelmezettebb lennék.',r:true},
    {s:'p',t:'Az emberek szerint vasfegyelmem van.'},
    {s:'p',t:'Az élvezet és a szórakozás néha megakadályoz abban, hogy elvégezzem a munkámat.',r:true},
    {s:'p',t:'Nehezen tudok koncentrálni.',r:true},
    {s:'p',t:'Hatékonyan tudok dolgozni a hosszú távú céljaimért.'},
    {s:'p',t:'Néha nem tudom visszafogni magam, hogy megtegyek valamit, még ha tudom is, hogy helytelen.',r:true},
    {s:'p',t:'Gyakran cselekszem anélkül, hogy minden lehetőséget végiggondolnék.',r:true}]}],
  score(R){const m=H.r2(R.mean('p'));return {total:m,band:band(m).l};},
  sum(s){return {h:s.band,d:{total:['Önkontroll (BSCS)',s.total,1,5]}};},
  render(R,s){
    const b=band(s.total),low=R.items.filter(i=>i.v<=2).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · BSCS</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 5.</p>
      ${H.chart('Önkontroll','1–5 · tájékozódó sávok',H.gauge({name:'BSCS',sub:b.l,val:s.total,shown:s.total.toFixed(2),unit:'/ 5',min:1,max:5,color:b.c,zones:[{from:1,to:2.67,color:'rgba(245,158,11,0.2)'},{from:2.67,to:3.67,color:'rgba(96,165,250,0.2)'},{from:3.67,to:5,color:'rgba(52,211,153,0.22)'}],labels:['1','2,7','3,7','5']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=3.67?'<p>Jól tudod a pillanatnyi késztetést a hosszú távú céljaidnak alárendelni. Érdekes kutatási eredmény: a magas önkontrollú emberek nem több akaraterőt használnak, hanem <strong>ritkábban kerülnek kísértő helyzetbe</strong>, mert úgy alakítják a környezetüket és a szokásaikat.</p>':s.total>=2.67?'<p>Közepes önkontroll: bizonyos területeken jól tartod magad, máshol a pillanat nyer. Érdemes megnézni, melyik helyzetekben gyengül (fáradtság, stressz, unalom).</p>':'<p>Most gyakran a pillanatnyi késztetés nyer. Ez sokszor nem akarathiány, hanem kimerültség, stressz vagy olyan környezet, ami folyamatosan kísért. Az önkontrollt nem az akaraterő edzése javítja leginkább, hanem a helyzetek átalakítása.</p>'},
        low.length?{h:'A leggyengébb pontok',html:low.map(i=>`<p>„${i.t}”</p>`).join('')}:null,
        {h:'Ami működik',html:'<p><strong>Ha–akkor tervek:</strong> „Ha X helyzet áll elő, akkor Y-t csinálom.” <strong>Súrlódás:</strong> tedd nehezebbé a nem kívánt viselkedést (távolabb, több lépés), és könnyebbé a kívántat. <strong>Alvás és stressz:</strong> fáradtan és stresszben mindenki önkontrollja gyengül; előbb ezeket érdemes rendbe tenni.</p>'}
      ])}
      ${H.refs(['<strong>Tangney, J. P., Baumeister, R. F., & Boone, A. L. (2004).</strong> High self-control predicts good adjustment, less pathology, better grades, and interpersonal success. <em>Journal of Personality, 72</em>(2), 271–324.',
        '<strong>Galla, B. M., & Duckworth, A. L. (2015).</strong> More than resisting temptation: Beneficial habits mediate the relationship between self-control and positive life outcomes. <em>Journal of Personality and Social Psychology, 109</em>(3), 508–525.'])}`;
  }
});
})();
