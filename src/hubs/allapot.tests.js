const FREQ_ASRS=[{v:0,l:'soha'},{v:1,l:'ritkán'},{v:2,l:'néha'},{v:3,l:'gyakran'},{v:4,l:'nagyon gyakran'}];
const FREQ_2W=[{v:0,l:'egyáltalán nem'},{v:1,l:'néhány napon'},{v:2,l:'a napok több mint felében'},{v:3,l:'majdnem minden nap'}];
const SAFETY_HTML='<div class="callout" style="--cc:#fb7185"><p><strong>Fontos.</strong> Azt jelölted, hogy az elmúlt két hétben előfordultak olyan gondolataid, hogy jobb lenne meghalni, vagy hogy kárt tegyél magadban. Ez akkor is komoly jelzés, ha most éppen nem érzed erősnek. Kérlek, beszélj erről valakivel még ma: egy megbízható emberrel, a háziorvosoddal vagy pszichológussal.</p><p>Ha most nagyon nehéz, a <strong>Lelki Elsősegély Telefonszolgálat</strong> a <a href="tel:116123">116-123</a> számon éjjel-nappal, ingyenesen és névtelenül hívható. Ha közvetlen veszélyben vagy, hívd a <a href="tel:112">112</a>-t.</p></div>';

/* ═══════════ 1. ASRS v1.1 — FELNŐTTKORI ADHD-TÜNETEK ═══════════ */
(function(){
/* A rész (1–6): az 1–3. tételnél a „néha” (2), a 4–6.-nál a „gyakran” (3) vagy afölötti válasz számít; legalább 4 jelzett tétel = tünetkonzisztens. */
const A_CUT={1:2,2:2,3:2,4:3,5:3,6:3};
makeTest({
  id:'asrs',key:'asrs-responses-v1',name:'Felnőttkori ADHD-tünetek (ASRS v1.1)',c1:'#fbbf24',c2:'#f97316',
  tab:'Figyelem',tabSub:'ASRS v1.1 · 18 item',scale:FREQ_ASRS,
  header:{status:'valid',statusText:'Validált szűrő · Kessler és mtsai (2005), WHO',
    eyebrow:'Adult ADHD Self-Report Scale v1.1 · World Health Organization',
    title:'Hogyan működik a <em style="color:#fbbf24">figyelmed</em>',
    lead:'Az ASRS v1.1 a WHO felnőttkori ADHD-szűrője, a DSM 18 tünetéhez igazodva. Az első hat kérdés (A rész) maga a szűrő: ez jelzi a legjobban, érdemes-e szakemberrel alaposabban megnézni. A további tizenkettő (B rész) árnyalja a képet.',
    intro:'<p><strong>Kitöltés:</strong> az elmúlt <strong>6 hónapra</strong> gondolva, milyen gyakran fordult elő veled az alábbi? Ne a legjobb vagy legrosszabb napjaidra gondolj, hanem az általános működésedre.</p><p>A szűrő eredménye nem diagnózis. Az ADHD megállapításához szakember (pszichiáter, klinikai szakpszichológus) részletes vizsgálata kell, a gyerekkori tünetekkel együtt.</p>'},
  sections:[
    {title:'A rész — <em>szűrő</em>',desc:'',items:[
      {s:'in',t:'Milyen gyakran nehéz befejezni egy feladat utolsó részleteit, amikor a nehezén már túl vagy?'},
      {s:'in',t:'Milyen gyakran nehéz rendet tenni a dolgokban, amikor egy feladat szervezést igényel?'},
      {s:'in',t:'Milyen gyakran felejted el a megbeszélt időpontokat vagy kötelezettségeidet?'},
      {s:'in',t:'Ha egy feladat sok gondolkodást igényel, milyen gyakran kerülöd el vagy halogatod a nekikezdést?'},
      {s:'hy',t:'Milyen gyakran fészkelődsz vagy mozgatod a kezed, lábad, ha sokáig kell ülnöd?'},
      {s:'hy',t:'Milyen gyakran érzed magad túlpörögve, mintha egy motor hajtana, és muszáj lenne csinálnod valamit?'}]},
    {title:'B rész — <em>további tünetek</em>',desc:'',items:[
      {s:'in',t:'Milyen gyakran követsz el figyelmetlenségből hibát, ha unalmas vagy nehéz munkán dolgozol?'},
      {s:'in',t:'Milyen gyakran nehéz fenntartani a figyelmedet unalmas vagy ismétlődő munka közben?'},
      {s:'in',t:'Milyen gyakran nehéz arra figyelni, amit mondanak neked, akkor is, ha közvetlenül hozzád beszélnek?'},
      {s:'in',t:'Milyen gyakran teszel el dolgokat rossz helyre, vagy nehéz megtalálnod őket otthon vagy a munkahelyen?'},
      {s:'in',t:'Milyen gyakran zavar el a körülötted zajló mozgás vagy zaj?'},
      {s:'hy',t:'Milyen gyakran állsz fel megbeszélésen vagy más olyan helyzetben, ahol ülve kellene maradnod?'},
      {s:'hy',t:'Milyen gyakran érzed magad nyugtalannak, izgágának?'},
      {s:'hy',t:'Milyen gyakran nehéz lelazulni és pihenni, amikor van időd magadra?'},
      {s:'hy',t:'Milyen gyakran beszélsz túl sokat társaságban?'},
      {s:'hy',t:'Milyen gyakran fejezed be mások mondatát, mielőtt ők befejeznék?'},
      {s:'hy',t:'Milyen gyakran nehéz kivárni a sorodat, amikor ez lenne a dolgod?'},
      {s:'hy',t:'Milyen gyakran szakítasz félbe másokat, amikor el vannak foglalva?'}]}],
  score(R){
    const v=n=>R.items.find(i=>i.n===n).raw;
    const partA=[1,2,3,4,5,6].filter(n=>v(n)>=A_CUT[n]).length;
    const partB=R.items.filter(i=>i.n>=7&&i.raw>=3).length;
    return {partA,partB,inatt:R.sum('in'),hyper:R.sum('hy'),pos:partA>=4};
  },
  sum(s){return {h:s.pos?'A szűrő tünetkonzisztens ('+s.partA+'/6)':'A szűrő nem tünetkonzisztens ('+s.partA+'/6)',d:{
    partA:['A rész: jelzett tételek',s.partA,0,6],inatt:['Figyelmetlenség',s.inatt,0,36],hyper:['Hiperaktivitás / impulzivitás',s.hyper,0,36],partB:['B rész: gyakori tünetek',s.partB,0,12]}};},
  render(R,s){
    const col=s.pos?'#f97316':'#34d399';
    const top=R.items.filter(i=>i.raw>=3).sort((a,b)=>b.raw-a.raw).slice(0,5);
    return `<div class="res-eyebrow">Eredmény · ASRS v1.1</div>
      <h2 class="res-title"><em>${s.pos?'Tünetkonzisztens szűrő':'Nem tünetkonzisztens szűrő'}</em></h2>
      <p class="res-lead">Az A rész hat tételéből <strong>${s.partA}</strong> esik a jelzett tartományba (a küszöb: legalább 4).</p>
      ${H.chart('A szűrő és a <em>két tünetcsoport</em>','A rész: 0–6 · tünetcsoportok: 0–36',
        H.gauge({name:'A rész',sub:'jelzett tételek',val:s.partA,unit:'/ 6',min:0,max:6,color:col,zones:[{from:0,to:3.5,color:'rgba(52,211,153,0.2)'},{from:3.5,to:6,color:'rgba(249,115,22,0.22)'}],labels:['0','küszöb: 4','6']})+
        H.gauge({name:'Figyelmetlenség',sub:'9 tétel',val:s.inatt,unit:'/ 36',min:0,max:36,color:'#fbbf24'})+
        H.gauge({name:'Hiperaktivitás / impulzivitás',sub:'9 tétel',val:s.hyper,unit:'/ 36',min:0,max:36,color:'#f97316'}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'A szűrő eredménye',color:col,html:s.pos?'<p>Az A rész alapján a tüneteid <strong>nagy mértékben egybevágnak</strong> a felnőttkori ADHD-val. Ez nem diagnózis: a szűrő célja annak jelzése, hogy érdemes szakemberrel alaposabban megvizsgáltatni. Az ADHD megállapításához az is kell, hogy a tünetek gyerekkorban is jelen voltak, több területen akadályoznak, és más ok (szorongás, depresszió, alváshiány, pajzsmirigy) nem magyarázza jobban őket.</p>':'<p>Az A rész alapján a tüneteid <strong>nem érik el</strong> a szűrő küszöbét. Ez nem zárja ki teljesen az ADHD-t (a szűrő nem tökéletes), de valószínűtlenebbé teszi. Ha a figyelmi nehézségek mégis sok szenvedést okoznak, érdemes más okokat is megnézni: alvás, stressz, hangulat, szorongás.</p>'},
        top.length?{h:'A leggyakoribb tüneteid',html:top.map(i=>`<p>„${i.t}” — <strong>${FREQ_ASRS[i.raw].l}</strong></p>`).join('')}:null,
        {h:'B rész',html:`<p>A B rész 12 tételéből <strong>${s.partB}</strong>-nál/-nél jelöltél „gyakran” vagy „nagyon gyakran” választ. Ez a rész nem számít bele a szűrő eredményébe, de szakemberrel beszélve hasznos kiegészítő információ.</p>`}
      ])}
      ${H.refs(['<strong>Kessler, R. C., Adler, L., Ames, M., et al. (2005).</strong> The World Health Organization Adult ADHD Self-Report Scale (ASRS): A short screening scale for use in the general population. <em>Psychological Medicine, 35</em>(2), 245–256.',
        '<strong>World Health Organization (2003).</strong> Adult ADHD Self-Report Scale (ASRS-v1.1) Symptom Checklist.'])}`;
  }
});
})();

/* ═══════════ 2. PHQ-9 — LEHANGOLTSÁG ═══════════ */
(function(){
const band=t=>t>=20?{l:'Súlyos tünetek',c:'#fb7185'}:t>=15?{l:'Közepesen súlyos tünetek',c:'#f97316'}:t>=10?{l:'Közepes tünetek',c:'#fbbf24'}:t>=5?{l:'Enyhe tünetek',c:'#60a5fa'}:{l:'Minimális tünetek',c:'#34d399'};
makeTest({
  id:'phq9',key:'phq9-responses-v1',name:'Lehangoltság (PHQ-9)',c1:'#60a5fa',c2:'#818cf8',
  tab:'Hangulat',tabSub:'PHQ-9 · 9 item',scale:FREQ_2W,
  header:{status:'valid',statusText:'Validált szűrő · Kroenke, Spitzer & Williams (2001)',
    eyebrow:'Patient Health Questionnaire-9 · Kroenke, Spitzer & Williams (2001)',
    title:'Hogy <em style="color:#60a5fa">vagy</em> mostanában',
    lead:'A PHQ-9 a világon az egyik leggyakrabban használt depresszió-szűrő. Kilenc kérdése a depressziós epizód kilenc tünetét követi, az elmúlt két hétre vonatkozóan.',
    intro:'<p><strong>Kitöltés:</strong> az elmúlt <strong>2 hétben</strong> milyen gyakran zavartak az alábbi problémák?</p><p>A szűrő nem diagnózis. Ha az eredményed foglalkoztat, vagy a kérdések felkavartak, az eredmény alatt találsz elérhetőségeket.</p>'},
  sections:[{title:'Az elmúlt <em>két hét</em>',desc:'',items:[
    {s:'p',t:'Kevés érdeklődés vagy öröm abban, amit csinálsz.'},
    {s:'p',t:'Lehangoltság, levertség vagy reménytelenség érzése.'},
    {s:'p',t:'Elalvási vagy átalvási nehézség, vagy túl sok alvás.'},
    {s:'p',t:'Fáradtság vagy energiahiány.'},
    {s:'p',t:'Étvágytalanság vagy túlevés.'},
    {s:'p',t:'Rossz érzés önmagaddal kapcsolatban: hogy kudarcot vallottál, vagy cserben hagytad magad vagy a családodat.'},
    {s:'p',t:'Koncentrálási nehézség, például olvasás vagy tévénézés közben.'},
    {s:'p',t:'Olyan lassú mozgás vagy beszéd, hogy mások is észrevehették; vagy épp ellenkezőleg: olyan nyugtalanság, hogy a szokásosnál sokkal többet mozogtál.'},
    {s:'p',t:'Olyan gondolatok, hogy jobb lenne meghalni, vagy hogy valamilyen módon kárt tegyél magadban.'},
    {t:'Ha bármelyik problémát jelölted: mennyire nehezítették meg a munkádat, az otthoni teendőidet vagy a kapcsolataidat?',opts:[{t:'Egyáltalán nem'},{t:'Kissé'},{t:'Nagyon'},{t:'Rendkívül'}]}]}],
  score(R){const t=R.sum('p'),i9=R.items.find(i=>i.n===9).raw,f=R.picks[0]?R.picks[0].idx:null;return {total:t,band:band(t).l,i9,f};},
  sum(s){return {h:s.band,d:{total:['PHQ-9 összpontszám',s.total,0,27]},x:{i9:s.i9,f:s.f}};},
  render(R,s){
    const b=band(s.total),F=['egyáltalán nem','kissé','nagyon','rendkívül'];
    const top=R.items.filter(i=>i.s==='p'&&i.n!==9&&i.raw>=2).sort((a,b)=>b.raw-a.raw).slice(0,4);
    return `${s.i9>0?SAFETY_HTML:''}<div class="res-eyebrow">Eredmény · PHQ-9</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">PHQ-9 összpontszám: <strong>${s.total}</strong> / 27.${s.f!==null?` A tünetek a mindennapjaidat <strong>${F[s.f]}</strong> nehezítették meg.`:''}</p>
      ${H.chart('Tünetsúlyosság','0–27 · sávhatárok: 5, 10, 15, 20',H.gauge({name:'PHQ-9',sub:b.l,val:s.total,unit:'/ 27',min:0,max:27,color:b.c,zones:[{from:0,to:4.5,color:'rgba(52,211,153,0.2)'},{from:4.5,to:9.5,color:'rgba(96,165,250,0.2)'},{from:9.5,to:14.5,color:'rgba(251,191,36,0.2)'},{from:14.5,to:19.5,color:'rgba(249,115,22,0.22)'},{from:19.5,to:27,color:'rgba(251,113,133,0.25)'}],labels:['0','5','10','15','20','27']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=10?'<p>A 10 pont feletti eredményt a kutatásokban a további vizsgálat jelzésére használják: ilyenkor a tünetek valószínűleg érdemben befolyásolják a mindennapjaidat. Érdemes szakemberrel (háziorvos, pszichológus, pszichiáter) átbeszélni. A depresszió jól kezelhető, és minél korábban kapsz segítséget, annál könnyebb.</p>':s.total>=5?'<p>Enyhe tünetek: lehet átmeneti terhelés, stressz, alváshiány vagy egy nehéz időszak jele. Érdemes figyelni, hogyan alakul a következő hetekben; ha nem javul, vagy rosszabbodik, beszélj szakemberrel.</p>':'<p>Az elmúlt két hétben kevés vagy minimális depressziós tünetet jeleztél.</p>'},
        top.length?{h:'A leginkább jelen lévő tünetek',html:top.map(i=>`<p>„${i.t}” — <strong>${FREQ_2W[i.raw].l}</strong></p>`).join('')}:null,
        {h:'Amit most megtehetsz',html:'<p>Rendszeres alvás és ébredés, napi mozgás (akár egy séta), napfény, és legalább egy beszélgetés valakivel, akiben megbízol. Ezek nem helyettesítik a kezelést, de a hangulatra mérhetően hatnak.</p>'}
      ])}
      ${H.refs(['<strong>Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001).</strong> The PHQ-9: Validity of a brief depression severity measure. <em>Journal of General Internal Medicine, 16</em>(9), 606–613.'])}`;
  }
});
})();

/* ═══════════ 3. GAD-7 — SZORONGÁS ═══════════ */
(function(){
const band=t=>t>=15?{l:'Súlyos szorongás',c:'#fb7185'}:t>=10?{l:'Közepes szorongás',c:'#f97316'}:t>=5?{l:'Enyhe szorongás',c:'#fbbf24'}:{l:'Minimális szorongás',c:'#34d399'};
makeTest({
  id:'gad7',key:'gad7-responses-v1',name:'Szorongás (GAD-7)',c1:'#2dd4bf',c2:'#34d399',
  tab:'Szorongás',tabSub:'GAD-7 · 7 item',scale:FREQ_2W,
  header:{status:'valid',statusText:'Validált szűrő · Spitzer és mtsai (2006)',
    eyebrow:'Generalized Anxiety Disorder-7 · Spitzer, Kroenke, Williams & Löwe (2006)',
    title:'Mennyire <em style="color:#2dd4bf">feszült</em> a rendszered',
    lead:'A GAD-7 rövid szorongás-szűrő: hét kérdés az elmúlt két hét aggódásáról, feszültségéről és nyugtalanságáról. A generalizált szorongás mellett a pánik- és szociális szorongás szűrésére is használják.',
    intro:'<p><strong>Kitöltés:</strong> az elmúlt <strong>2 hétben</strong> milyen gyakran zavartak az alábbi problémák?</p>'},
  sections:[{title:'Az elmúlt <em>két hét</em>',desc:'',items:[
    {s:'p',t:'Idegesség, szorongás vagy feszültség érzése.'},
    {s:'p',t:'Nem tudod abbahagyni vagy kontrollálni az aggódást.'},
    {s:'p',t:'Túl sokat aggódsz különböző dolgok miatt.'},
    {s:'p',t:'Nehezen tudsz ellazulni.'},
    {s:'p',t:'Olyan nyugtalanság, hogy nehéz egy helyben maradni.'},
    {s:'p',t:'Könnyen bosszús vagy ingerlékeny leszel.'},
    {s:'p',t:'Félelem, mintha valami szörnyű történhetne.'}]}],
  score(R){const t=R.sum('p');return {total:t,band:band(t).l};},
  sum(s){return {h:s.band,d:{total:['GAD-7 összpontszám',s.total,0,21]}};},
  render(R,s){
    const b=band(s.total),top=R.items.filter(i=>i.raw>=2).sort((a,b)=>b.raw-a.raw).slice(0,3);
    return `<div class="res-eyebrow">Eredmény · GAD-7</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">GAD-7 összpontszám: <strong>${s.total}</strong> / 21.</p>
      ${H.chart('Szorongás','0–21 · sávhatárok: 5, 10, 15',H.gauge({name:'GAD-7',sub:b.l,val:s.total,unit:'/ 21',min:0,max:21,color:b.c,zones:[{from:0,to:4.5,color:'rgba(52,211,153,0.2)'},{from:4.5,to:9.5,color:'rgba(251,191,36,0.2)'},{from:9.5,to:14.5,color:'rgba(249,115,22,0.22)'},{from:14.5,to:21,color:'rgba(251,113,133,0.25)'}],labels:['0','5','10','15','21']}))}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=10?'<p>A 10 pont feletti eredményt a kutatásokban a további vizsgálat jelzésére használják. A szorongás jól kezelhető (kognitív viselkedésterápia, szükség esetén gyógyszer); érdemes szakemberrel átbeszélni, főleg ha hetek óta tart, vagy akadályoz a munkában, a kapcsolatokban, az alvásban.</p>':s.total>=5?'<p>Enyhe szorongás: gyakori stresszes időszakokban. Figyeld, hogyan alakul; a rendszeres mozgás, az alvás és a légzéstechnikák sokat segíthetnek.</p>':'<p>Az elmúlt két hétben kevés szorongásos tünetet jeleztél.</p>'},
        top.length?{h:'A leginkább jelen lévő tünetek',html:top.map(i=>`<p>„${i.t}” — <strong>${FREQ_2W[i.raw].l}</strong></p>`).join('')}:null
      ])}
      ${H.refs(['<strong>Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006).</strong> A brief measure for assessing generalized anxiety disorder: The GAD-7. <em>Archives of Internal Medicine, 166</em>(10), 1092–1097.'])}`;
  }
});
})();
