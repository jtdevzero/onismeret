/* ============ COURSE DATA ============ */
const OLD_GRAMMAR={u1:[0],u2:[1,3],u3:[2,8],u4:[7,9],u5:[5,6],u6:[10],u8:[4],u10:[11]};
const LANGS={
  en:{code:"EN",name:"Angol",nat:"English",adj:"angol",adv:"angolul",teacher:"angoltanár",tts:"en-GB",vbPron:[""],art:/^(to|the|a|an)\s/,
    ok:["Spot on!","Perfect!","Nice one!","Exactly!"],fin:["Brilliant!","Well done!","You made it!"],wotd:"Word of the day",
    hello:"Good morning! Kezdjük?",goalDone:"Brilliant! Megvan a mai cél.",goalLeft:n=>"Keep going! Még "+n+" XP a célig.",range:"A1–C1",
    levels:["A1","A2","B1","B2","C1"],hero:"hero-en",drills:["mock","examiner","journal","serial","colloc","import","shadow","read","miss","pod","pron","acc","exam","wcourse","build","ai","speak","story","conj","tenses","articles","preps","phrasal","cond","dict"],write:"Write here in English…",native:"egy angol anyanyelvű",
    ask:"Mi a különbség a present perfect és a past simple között?",free:["Free chat","Emma, egy barátságos londoni angoltanár, aki kötetlenül beszélget a tanulóval"]},
  it:{code:"IT",name:"Olasz",nat:"Italiano",adj:"olasz",adv:"olaszul",teacher:"olasztanár",tts:"it-IT",vbPron:["io","tu","lui","noi","voi","loro"],art:/^(il|lo|la|l'|i|gli|le)\s?/,
    ok:["Esatto!","Giusto!","Perfetto!","Bravo!"],fin:["Fantastico!","Molto bene!","Ce l'hai fatta!"],wotd:"La parola del giorno",
    hello:"Buongiorno! Kezdjük?",goalDone:"Bravissimo! Megvan a mai cél.",goalLeft:n=>"Avanti così! Még "+n+" XP a célig.",range:"A1–B1",
    levels:["A1","A2","B1"],hero:"hero",drills:["serial","import","shadow","read","miss","pod","pron","exam","build","ai","speak","story","conj","cong","impp","art","prep","dict","num"],write:"Scrivi qui in italiano…",native:"egy olasz",
    ask:"Mi a különbség a sapere és a conoscere között?"},
  es:{code:"ES",name:"Spanyol",nat:"Español",adj:"spanyol",adv:"spanyolul",teacher:"spanyoltanár",tts:"es-ES",vbPron:["yo","tú","él","nosotros","vosotros","ellos"],art:/^(el|la|los|las)\s/,
    ok:["¡Muy bien!","¡Perfecto!","¡Genial!","¡Exacto!"],fin:["¡Fantástico!","¡Muy bien!","¡Lo has conseguido!"],wotd:"La palabra del día",
    hello:"¡Buenos días! Kezdjük?",goalDone:"¡Genial! Megvan a mai cél.",goalLeft:n=>"¡Ánimo! Még "+n+" XP a célig.",range:"A1–B1",
    levels:["A1","A2","B1"],hero:"hero-es",drills:["serial","import","shadow","read","miss","pod","pron","exam","build","ai","speak","story","conj","serestar","pretimp","porpara","dict"],write:"Escribe aquí en español…",native:"egy spanyol anyanyelvű",
    ask:"Mi a különbség a ser és az estar között?",free:["Conversación libre","Lucía, egy kedves madridi spanyoltanár, aki kötetlenül beszélget a tanulóval"]}
};
/* English is the default for new learners; the switcher offers every language in LANGS. */
const lang=()=>LANGS[S.settings.lang]?S.settings.lang:"en";
const langOf=id=>id.startsWith("en-")?"en":id.startsWith("es-")?"es":"it";
const LG=()=>LANGS[lang()];
let XT={pods:[],pron:[],exam:null,acc:[],packs:[],off:{reads:[],dialogs:[]},writing:[],vt:null,gram:[],mock:[],ser:[],speak:null,col:[]}, CORE=null, LESSONS=[], STORIES=[], VB=null, POOL=[], WORDS=[], TRACKS=null, SCEN=[], CDRILLS={};
const AUDIO_IDX={};
let COURSE_LOAD_N=0,COURSE_LANG="",COURSE_LOADING=false,COURSE_ERROR=false;
const courseReady=()=>COURSE_LANG===lang()&&!COURSE_LOADING;
const vbKey=(i,f)=>LG().vbPron[i]?LG().vbPron[i]+" "+f:f;
const vbBundle=v=>lang()==="en"?"vb-en":lang()==="es"?"vb-es-"+v.inf:"vb-"+v.inf;
async function loadCourse(){
  const get=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.json();});
  const l=lang(),generation=++COURSE_LOAD_N,current=()=>generation===COURSE_LOAD_N&&l===lang(),wantsCore=Object.keys(coreOn()).length>0;
  COURSE_LOADING=true;COURSE_ERROR=false;COURSE_LANG="";EXTRA_P={};EXTRA_DONE={};
  try{
  const [pack,st,vb,dr]=await Promise.all([get(`data/${l}.json`),get(`data/stories-${l}.json`).catch(()=>({stories:[]})),get(`data/verbs-${l}.json`).catch(()=>null),get(`data/drills-${l}.json`).catch(()=>({}))]);
  if(!current())return false;
  const opt=n=>get(`data/${n}-${l}.json`).catch(()=>null),en=n=>l==="en"?opt(n):Promise.resolve(null);
  const [pods,prs,exam,packs,acc,off,wr,vt,core]=await Promise.all([opt("podcasts"),opt("pron"),opt("exam"),opt("packs"),en("accents"),en("offline"),en("writing"),en("vocabtest"),wantsCore?opt("core"):Promise.resolve(null)]);
  if(!current())return false;
  /* Build the entire language pack before publishing it. Delayed loads must never
     combine another language's words with the currently selected labels or prune its progress. */
  const nextAudio={},nextExtra={pods:pods?pods.podcasts:[],pron:prs?prs.sets:[],exam:exam||null,acc:acc?acc.items:[],packs:packs?packs.packs:[],off:off||{reads:[],dialogs:[]},writing:wr?wr.modules:[],vt:vt||null,
    gram:[],mock:[],ser:[],speak:null,col:[]};
  const nextLessons=pack.units.map(u=>{
    const w=u.items.filter(i=>i.k==="w"), s=u.items.filter(i=>i.k==="s");
    u.items.forEach(i=>nextAudio[i.it]=u.id);
    return {id:u.id,level:u.level,track:u.track,role:u.role,t:u.title,hu:u.hu,goal:u.grammar.map(g=>g.h).join(" · "),
      notes:u.grammar.map(g=>`<b>${esc(g.h)}</b><br>${esc(g.p)}`),
      words:w.map(i=>[i.it,i.hu,i.alt||[],i.id]),phrases:s.map(i=>[i.it,i.hu,i.alt||[],i.id]),
      grammar:l==="it"?(OLD_GRAMMAR[u.id]||[]).flatMap(k=>OLD[k].grammar):[]};
  });
  const nextStories=st.stories||[];
  nextStories.forEach(s=>s.lines.forEach(x=>{if(x.it)nextAudio[x.it]=nextAudio[x.it]||"st-"+s.id;}));
  nextExtra.pods.forEach(p=>p.lines.forEach(x=>nextAudio[x.it]=nextAudio[x.it]||"pod-"+p.id));
  nextExtra.packs.forEach(pk=>pk.items.forEach(x=>{nextAudio[x.it]=nextAudio[x.it]||`pk-${l}-${pk.id}`;nextAudio[x.ex]=nextAudio[x.ex]||`pk-${l}-${pk.id}`;}));
  nextExtra.off.dialogs.forEach(d=>d.turns.forEach(t=>nextAudio[t.p]=nextAudio[t.p]||"dl-en"));
  nextExtra.pron.forEach(st=>[...st.pairs.flat(),...st.sentences].forEach(t=>nextAudio[t]=nextAudio[t]||"pron-"+l));
  if(vb)vb.verbs.forEach(v=>Object.values(v.forms).forEach(fs=>fs.forEach((f,i)=>{const pron=LANGS[l].vbPron[i];nextAudio[pron?pron+" "+f:f]=l==="en"?"vb-en":l==="es"?"vb-es-"+v.inf:"vb-"+v.inf;})));
  if(core)core.levels.forEach(L=>L.words.forEach(w=>nextAudio[w.it]=nextAudio[w.it]||w.b));
  const nextScenarios=l==="it"?SCENARIOS.map(x=>Object.assign({img:"sc-"+x.id,av:x.id==="libero"?"teacher":"sc-"+x.id},x))
    :nextLessons.filter(L=>L.role).map(L=>({id:L.id,t:L.t,d:L.role,role:`${L.role} (a lecke témája: ${L.t}). Te játszod az ${LANGS[l].adv} beszélő másik felet ebben a helyzetben.`,img:L.id,av:L.id}))
      .concat([{id:"free",t:LANGS[l].free[0],d:"Kötetlen beszélgetés bármiről.",role:LANGS[l].free[1],img:LANGS[l].hero,av:LANGS[l].hero}]);
  const nextPool=[];nextLessons.forEach((L,li)=>{L.words.forEach(w=>nextPool.push({id:w[3],it:w[0],hu:w[1],alt:w[2],li}));L.phrases.forEach(p=>nextPool.push({id:p[3],it:p[0],hu:p[1],alt:p[2],li,ph:1}));});
  CDRILLS=dr||{};XT=nextExtra;CORE=core;TRACKS=pack.tracks||null;LESSONS=nextLessons;STORIES=nextStories;VB=vb;SCEN=nextScenarios;POOL=nextPool;WORDS=nextPool.filter(c=>!c.ph);
  for(const k of Object.keys(AUDIO_IDX))delete AUDIO_IDX[k];Object.assign(AUDIO_IDX,nextAudio);
  if(core){EXTRA_DONE[l+":core"]=1;EXTRA_P[l+":core"]=Promise.resolve(core);}
  COURSE_LANG=l;COURSE_LOADING=false;pickVoice();rebuildOwn();pruneState();return true;
  }catch(error){
    if(!current())return false;
    COURSE_LOADING=false;COURSE_ERROR=true;throw error;
  }
}
/* Larger, optional data (core vocabulary, handbook, mock exams, serials, speaking tasks, collocations) loads only when
   a view needs it, once per language; each loader also registers the recorded audio of its texts. */
let EXTRA_P={},EXTRA_DONE={};
const EXTRA={
  core:(d,l)=>{CORE=d;if(d)d.levels.forEach(L=>L.words.forEach(w=>AUDIO_IDX[w.it]=AUDIO_IDX[w.it]||w.b));},
  grammar:d=>{XT.gram=d?d.topics:[];},
  mock:(d,l)=>{XT.mock=d?d.mocks:[];XT.mock.forEach(m=>m.parts.forEach(pt=>(pt.lines||[]).forEach(x=>AUDIO_IDX[x.it]=AUDIO_IDX[x.it]||`mock-${l}-${m.id}`)));},
  serials:(d,l)=>{XT.ser=d?d.serials:[];XT.ser.forEach(se=>se.chapters.forEach(ch=>ch.lines.forEach(x=>AUDIO_IDX[x.it]=AUDIO_IDX[x.it]||`ser-${l}-${se.id}`)));},
  speaking:d=>{XT.speak=d||null;},
  colloc:(d,l)=>{XT.col=d?d.groups:[];XT.col.forEach(g=>g.items.forEach(x=>{AUDIO_IDX[x.it]=AUDIO_IDX[x.it]||`col-${l}-${g.id}`;AUDIO_IDX[x.ex]=AUDIO_IDX[x.ex]||`col-${l}-${g.id}`;}));}
};
function loadExtra(n){
  if(!courseReady())return Promise.resolve(null);
  const l=lang(),k=l+":"+n,generation=COURSE_LOAD_N;
  if(!EXTRA_P[k]){
    const promise=fetch(`data/${n}-${l}.json`).then(r=>r.ok?r.json():r.status===404?false:null).catch(()=>null)
    .then(d=>{
      /* null: network error, try again next time; false: this language has no such file. */
      if(generation!==COURSE_LOAD_N||lang()!==l||EXTRA_P[k]!==promise||!courseReady())return null;
      if(d===null){delete EXTRA_P[k];return null;}
      EXTRA[n](d||null,l);EXTRA_DONE[k]=1;return d;});
    EXTRA_P[k]=promise;
  }
  return EXTRA_P[k];
}
const extraReady=n=>courseReady()&&!!EXTRA_DONE[lang()+":"+n];
/* Runs fn once the data is there; a navigation in the meantime cancels it. */
function withExtra(n,fn){
  if(extraReady(n))return fn();
  const nav=NAVN,generation=COURSE_LOAD_N,l=lang();view.innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">Betöltés…</span></div>`;
  loadExtra(n).then(d=>{if(NAVN!==nav||generation!==COURSE_LOAD_N||lang()!==l||!courseReady())return;if(d===null){view.innerHTML=`<div class="notice stack"><span>Nem sikerült betölteni ezt a részt. Ellenőrizd a netkapcsolatot.</span><div><button class="btn" id="xRetry">Újra</button></div></div>`;$("#xRetry").onclick=()=>withExtra(n,fn);return;}fn();});
}
/* Drop progress that belongs to the first-round course (its card and lesson ids no longer exist). */
function pruneState(){
  if(!POOL.length)return;
  const ids=new Set(POOL.map(c=>c.id)),l=lang();let dropped=false;
  for(const k of Object.keys(S.cards))if((langOf(k)===l&&!ids.has(k)&&!k.includes("-own-")&&!k.includes("-core-"))||S.cards[k].s==null){delete S.cards[k];dropped=true;}
  for(const k of Object.keys(S.lessons))if(!/^(u\d+|en-[ubac]\d+|es-u\d+)$/.test(k)){delete S.lessons[k];dropped=true;}
  for(const k of ["stories","miss","log","ai","rounds","ev","chal","own","hard","pods","exam","certs","plan","core","gram","mock","ser","sk"])if(!S[k])S[k]={};if(!Array.isArray(S.mlog))S.mlog=[];
  for(const k of Object.keys(S.miss))if(langOf(k)===l&&!ids.has(k)&&!k.includes("-own-")&&!k.includes("-core-")){delete S.miss[k];dropped=true;}
  if(dropped)save();
}

