/* ============ COURSE DATA ============ */
const OLD_GRAMMAR={u1:[0],u2:[1,3],u3:[2,8],u4:[7,9],u5:[5,6],u6:[10],u8:[4],u10:[11]};
const LANGS={
  en:{code:"EN",name:"Angol",nat:"English",adj:"angol",adv:"angolul",teacher:"angoltanár",tts:"en-GB",vbPron:[""],art:/^(to|the|a|an)\s/,
    ok:["Spot on!","Perfect!","Nice one!","Exactly!"],fin:["Brilliant!","Well done!","You made it!"],wotd:"Word of the day",
    hello:"Good morning! Kezdjük?",goalDone:"Brilliant! Megvan a mai cél.",goalLeft:n=>"Keep going! Még "+n+" XP a célig.",range:"A1–C1",
    levels:["A1","A2","B1","B2","C1"],hero:"hero-en",drills:["read","miss","pod","pron","acc","exam","wcourse","build","ai","speak","story","conj","tenses","articles","preps","phrasal","cond","dict"],write:"Write here in English…",native:"egy angol anyanyelvű",
    ask:"Mi a különbség a present perfect és a past simple között?",free:["Free chat","Emma, egy barátságos londoni angoltanár, aki kötetlenül beszélget a tanulóval"]},
  it:{code:"IT",name:"Olasz",nat:"Italiano",adj:"olasz",adv:"olaszul",teacher:"olasztanár",tts:"it-IT",vbPron:["io","tu","lui","noi","voi","loro"],art:/^(il|lo|la|l'|i|gli|le)\s?/,
    ok:["Esatto!","Giusto!","Perfetto!","Bravo!"],fin:["Fantastico!","Molto bene!","Ce l'hai fatta!"],wotd:"La parola del giorno",
    hello:"Buongiorno! Kezdjük?",goalDone:"Bravissimo! Megvan a mai cél.",goalLeft:n=>"Avanti così! Még "+n+" XP a célig.",range:"A1–B1",
    levels:["A1","A2","B1"],hero:"hero",drills:["read","miss","pod","pron","exam","build","ai","speak","story","conj","cong","impp","art","prep","dict","num"],write:"Scrivi qui in italiano…",native:"egy olasz",
    ask:"Mi a különbség a sapere és a conoscere között?"},
  es:{code:"ES",name:"Spanyol",nat:"Español",adj:"spanyol",adv:"spanyolul",teacher:"spanyoltanár",tts:"es-ES",vbPron:["yo","tú","él","nosotros","vosotros","ellos"],art:/^(el|la|los|las)\s/,
    ok:["¡Muy bien!","¡Perfecto!","¡Genial!","¡Exacto!"],fin:["¡Fantástico!","¡Muy bien!","¡Lo has conseguido!"],wotd:"La palabra del día",
    hello:"¡Buenos días! Kezdjük?",goalDone:"¡Genial! Megvan a mai cél.",goalLeft:n=>"¡Ánimo! Még "+n+" XP a célig.",range:"A1–B1",
    levels:["A1","A2","B1"],hero:"hero-es",drills:["read","miss","pod","pron","exam","build","ai","speak","story","conj","serestar","pretimp","porpara","dict"],write:"Escribe aquí en español…",native:"egy spanyol anyanyelvű",
    ask:"Mi a különbség a ser és az estar között?",free:["Conversación libre","Lucía, egy kedves madridi spanyoltanár, aki kötetlenül beszélget a tanulóval"]}
};
/* English is the default for new learners; the switcher offers every language in LANGS. */
const lang=()=>LANGS[S.settings.lang]?S.settings.lang:"en";
const langOf=id=>id.startsWith("en-")?"en":id.startsWith("es-")?"es":"it";
const LG=()=>LANGS[lang()];
let XT={pods:[],pron:[],exam:null,acc:[],packs:[],off:{reads:[],dialogs:[]},writing:[],vt:null}, LESSONS=[], STORIES=[], VB=null, POOL=[], WORDS=[], TRACKS=null, SCEN=[], CDRILLS={};
const AUDIO_IDX={};
const vbKey=(i,f)=>LG().vbPron[i]?LG().vbPron[i]+" "+f:f;
const vbBundle=v=>lang()==="en"?"vb-en":lang()==="es"?"vb-es-"+v.inf:"vb-"+v.inf;
async function loadCourse(){
  const get=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.json();});
  const l=lang();
  const [pack,st,vb,dr]=await Promise.all([get(`data/${l}.json`),get(`data/stories-${l}.json`).catch(()=>({stories:[]})),get(`data/verbs-${l}.json`).catch(()=>null),get(`data/drills-${l}.json`).catch(()=>({}))]);
  CDRILLS=dr||{};
  const opt=n=>get(`data/${n}-${l}.json`).catch(()=>null),en=n=>l==="en"?opt(n):Promise.resolve(null);
  const [pods,prs,exam,packs,acc,off,wr,vt]=await Promise.all([opt("podcasts"),opt("pron"),opt("exam"),opt("packs"),en("accents"),en("offline"),en("writing"),en("vocabtest")]);
  XT={pods:pods?pods.podcasts:[],pron:prs?prs.sets:[],exam:exam||null,acc:acc?acc.items:[],packs:packs?packs.packs:[],off:off||{reads:[],dialogs:[]},writing:wr?wr.modules:[],vt:vt||null};
  for(const k of Object.keys(AUDIO_IDX))delete AUDIO_IDX[k];
  TRACKS=pack.tracks||null;
  LESSONS=pack.units.map(u=>{
    const w=u.items.filter(i=>i.k==="w"), s=u.items.filter(i=>i.k==="s");
    u.items.forEach(i=>AUDIO_IDX[i.it]=u.id);
    return {id:u.id,level:u.level,track:u.track,role:u.role,t:u.title,hu:u.hu,goal:u.grammar.map(g=>g.h).join(" · "),
      notes:u.grammar.map(g=>`<b>${esc(g.h)}</b><br>${esc(g.p)}`),
      words:w.map(i=>[i.it,i.hu,i.alt||[],i.id]),phrases:s.map(i=>[i.it,i.hu,i.alt||[],i.id]),
      grammar:l==="it"?(OLD_GRAMMAR[u.id]||[]).flatMap(k=>OLD[k].grammar):[]};
  });
  STORIES=st.stories||[];
  STORIES.forEach(s=>s.lines.forEach(l=>{if(l.it)AUDIO_IDX[l.it]=AUDIO_IDX[l.it]||"st-"+s.id;}));
  VB=vb;
  XT.pods.forEach(p=>p.lines.forEach(x=>AUDIO_IDX[x.it]=AUDIO_IDX[x.it]||"pod-"+p.id));
  XT.packs.forEach(pk=>pk.items.forEach(x=>{AUDIO_IDX[x.it]=AUDIO_IDX[x.it]||`pk-${l}-${pk.id}`;AUDIO_IDX[x.ex]=AUDIO_IDX[x.ex]||`pk-${l}-${pk.id}`;}));
  XT.off.dialogs.forEach(d=>d.turns.forEach(t=>AUDIO_IDX[t.p]=AUDIO_IDX[t.p]||"dl-en"));
  XT.pron.forEach(st=>[...st.pairs.flat(),...st.sentences].forEach(t=>AUDIO_IDX[t]=AUDIO_IDX[t]||"pron-"+l));
  if(VB)VB.verbs.forEach(v=>Object.values(v.forms).forEach(fs=>fs.forEach((f,i)=>AUDIO_IDX[vbKey(i,f)]=vbBundle(v))));
  SCEN=l==="it"?SCENARIOS.map(x=>Object.assign({img:"sc-"+x.id,av:x.id==="libero"?"teacher":"sc-"+x.id},x))
    :LESSONS.filter(L=>L.role).map(L=>({id:L.id,t:L.t,d:L.role,role:`${L.role} (a lecke témája: ${L.t}). Te játszod az ${LANGS[l].adv} beszélő másik felet ebben a helyzetben.`,img:L.id,av:L.id}))
      .concat([{id:"free",t:LANGS[l].free[0],d:"Kötetlen beszélgetés bármiről.",role:LANGS[l].free[1],img:LANGS[l].hero,av:LANGS[l].hero}]);
  pickVoice();
  POOL=[];LESSONS.forEach((L,li)=>{L.words.forEach(w=>POOL.push({id:w[3],it:w[0],hu:w[1],alt:w[2],li}));L.phrases.forEach(p=>POOL.push({id:p[3],it:p[0],hu:p[1],alt:p[2],li,ph:1}));});
  WORDS=POOL.filter(c=>!c.ph);
  rebuildOwn();pruneState();
}
/* Drop progress that belongs to the first-round course (its card and lesson ids no longer exist). */
function pruneState(){
  if(!POOL.length)return;
  const ids=new Set(POOL.map(c=>c.id)),l=lang();let dropped=false;
  for(const k of Object.keys(S.cards))if((langOf(k)===l&&!ids.has(k)&&!k.includes("-own-"))||S.cards[k].s==null){delete S.cards[k];dropped=true;}
  for(const k of Object.keys(S.lessons))if(!/^(u\d+|en-[ubac]\d+|es-u\d+)$/.test(k)){delete S.lessons[k];dropped=true;}
  for(const k of ["stories","miss","log","ai","rounds","ev","chal","own","hard","pods","exam","certs","plan"])if(!S[k])S[k]={};if(!Array.isArray(S.mlog))S.mlog=[];
  for(const k of Object.keys(S.miss))if(langOf(k)===l&&!ids.has(k)&&!k.includes("-own-")){delete S.miss[k];dropped=true;}
  if(dropped)save();
}

