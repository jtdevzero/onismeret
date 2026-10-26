/* Álomképek — eredeti képkészlettel játszható asszociációs játék. */
(() => {
  'use strict';
  GAMES.dreams = {name:'Álomképek',emo:'🌙',c:'#c7a0ff',desc:'Egy kép, egy sejtelmes mondat. Melyikre gondolt a mesélő?',min:3,max:6,time:20,difficulty:'Közepes',tags:['kreatív','asszociáció','beszélgetős']};
  const scenes = ['Bálna az alvó város felett','Vihar egy befőttesüvegben','Óceánból a Holdra vezető lépcső','Róka vezényli az őszi leveleket','Gyökeres óra egy könyvben','Világítótorony egy teknősön','Űrhajós egy teáscsészében','Csillagos ég az esernyő alatt','Vonat egy kagylóban','Erdőt szállító papírhajó','Csillagagancsú szarvas a sivatagban','Hegyi ajtó a tengerpartra','Madár kulcsot kínál egy macskának','Vörös fonallal összekötött szigetek','Kertész bolygókat ültet','Üvegkastély az olvadó jégben','Elefánt lámpáskarnevállal','Víz alatti könyvtár','Lány megvarrja az eget','Csiga üvegházzal','Sárkányárnyékot vető szék','Papírmadarak egy tükörből','Pék felhőt dagaszt','Évszakablakok egy fán'];
  const state = () => R.games.dreams = R.games.dreams || {phase:'setup',cycles:1};
  const story = s => s.round % s.names.length;
  const pic = (id, text='') => `<span class="dream-art" role="img" aria-label="${esc(scenes[id])}" style="background-position:${id%6*20}% ${Math.floor(id/6)*100/3}%"></span>${text ? `<span class="dream-caption">${esc(text)}</span>` : ''}`;
  const error = s => s.error ? `<p role="alert">${esc(s.error)}</p>` : '';
  const header = s => `<div class="counter">${s.round+1} / ${s.total} kör · Mesélő: ${esc(s.names[story(s)])}</div>${s.clue ? `<div class="panel center"><div class="kicker">A nyom</div><h2>${esc(s.clue)}</h2></div>` : ''}`;
  function standings(s) { return `<div class="panel"><h3>Pontállás</h3><div class="tally">${s.names.map((name,i)=>({name,points:s.scores[i]})).sort((a,b)=>b.points-a.points).map(x=>`<div><b>${esc(x.name)}</b><span>${x.points} pont</span></div>`).join('')}</div></div>`; }
  function round(s) {
    const deck=shuffle(Array.from({length:24},(_,i)=>i));
    s.hands=s.names.map(()=>deck.splice(0,4)); s.picks=s.names.map(()=>null); s.votes=s.names.map(()=>null);
    s.actor=story(s);s.phase='choose';s.open=false;s.selected=null;s.clue='';s.draft='';s.error='';s.options=[];
  }
  function cover(s, action='dreamOpen') {return `${header(s)}<div class="bigcard"><div class="huge">🔒</div><div class="kicker">Add a telefont neki:</div><div class="say">${esc(s.names[s.actor])}</div><p>A többiek forduljanak el. A kezedet és a szavazatodat csak te láthatod.</p></div><button class="btn primary big" data-a="${action}">Nálam a telefon, mutasd</button>`;}
  function finish(s) { if(s.recorded)return;s.phase='end';s.recorded=true;recordResult('dreams',s.names.map((name,i)=>({name,points:s.scores[i]}))); }
  function score(s) {
    const teller=story(s), truth=s.picks[teller], voters=s.names.map((_,i)=>i).filter(i=>i!==teller);
    const hits=voters.filter(i=>s.votes[i]===truth);const special=hits.length===0||hits.length===voters.length;
    s.delta=s.names.map(()=>0);
    if(special)voters.forEach(i=>s.delta[i]=2);else {s.delta[teller]=3;hits.forEach(i=>s.delta[i]=3);}
    voters.forEach(owner=>{s.delta[owner]+=Math.min(3,voters.filter(v=>s.votes[v]===s.picks[owner]).length);});
    s.scores=s.scores.map((n,i)=>n+s.delta[i]);s.hitCount=hits.length;s.phase='result';s.open=false;
  }
  V.dreams=()=>{
    const s=state();
    if(s.phase==='setup')return `${crewLine(3)}<div class="panel"><h2>Álomképek</h2><p>24 saját, álomszerű kép, 3–6 játékos és egy telefon. Minden körben mindenki négy titkos lapot kap. A mesélő választ egyet, és ad hozzá egy szót vagy mondatot. A többiek egy-egy saját képpel próbálják megtéveszteni a társaságot.</p><p>Az összekevert képek közül titokban szavaztok a mesélőére. Saját lapra nem lehet szavazni. A mesélő nem szavaz.</p><p class="muted small">Ha néhányan, de nem mindenki találja el: a mesélő és a helyesen tippelők 3 pontot kapnak. Ha mindenki vagy senki találja el: a mesélő 0, a többiek 2 pontot kapnak. Minden más játékos lapjára érkező szavazat még +1 pont (legfeljebb +3).</p><p class="muted small">A 24 lap minden körben visszakerül és újrakeveredik, ezért képek ismétlődhetnek. Mindenki ugyanannyiszor mesélhet.</p><div class="setting-label"><span>Mesélés játékosonként</span>${stepper('dreamCycles',s.cycles,1,3)}</div>${S.players.length>6?'<p role="alert">Legfeljebb 6 játékos játszhat.</p>':''}</div><button class="btn primary big" data-a="dreamStart" ${S.players.length<3||S.players.length>6?'disabled':''}>Képek kiosztása</button>`;
    if(s.phase==='end')return `<div class="bigcard"><div class="huge">🌙</div><h2>Véget ért az álomutazás</h2><p>${s.round+1} lejátszott kör. Az eredmény az esthez is elmentve.</p></div>${standings(s)}<button class="btn primary big" data-a="dreamSetup">Új játék</button>`;
    if(s.phase==='result') {
      const truth=s.picks[story(s)];
      return `${header(s)}<div class="panel"><h3>${s.hitCount} helyes tipp</h3><p>${s.hitCount===0?'Senki nem találta el.':s.hitCount===s.names.length-1?'Mindenki eltalálta.':'A nyom éppen elég sejtelmes volt!'}</p><p>${s.names.map((n,i)=>`${esc(n)}: +${s.delta[i]}`).join(' · ')}</p></div><div class="dream-grid">${s.options.map(id=>{const owner=s.picks.indexOf(id),voters=s.names.filter((_,i)=>s.votes[i]===id);return `<div class="dream-card ${id===truth?'truth':''}">${pic(id,id===truth?'A mesélő képe':s.names[owner])}<p>${voters.length?'Szavazott: '+voters.map(esc).join(', '):'Nem érkezett szavazat'}</p></div>`;}).join('')}</div>${standings(s)}<button class="btn primary big" data-a="dreamNext">${s.round+1>=s.total?'Végeredmény':'Következő mesélő'}</button><button class="btn ghost" data-a="dreamFinish">Játék lezárása</button>`;
    }
    if(!s.open)return cover(s);
    if(s.phase==='clue')return `${header(s)}<div class="dream-card dream-chosen">${pic(s.picks[story(s)])}</div><form class="panel" data-a="dreamClue"><label for="dream-clue">${esc(s.names[s.actor])}, mi a nyomod?</label><input id="dream-clue" name="clue" maxlength="100" required autocomplete="off" value="${esc(s.draft)}" placeholder="Egy szó vagy rövid mondat…"><p class="muted small">Ne mondd ki a kép számát. Olyan nyomot adj, amit néhányan értenek meg, de nem mindenki.</p>${error(s)}<button class="btn primary big">Nyom mentése, kéz elrejtése</button></form>`;
    const voting=s.phase==='vote', cards=voting?s.options:s.hands[s.actor];
    return `${header(s)}<div class="panel"><h3>${esc(s.names[s.actor])}, ${voting?'melyik a mesélő képe?':s.actor===story(s)?'válassz egy képet a történetedhez!':'melyik képed illik a nyomhoz?'}</h3><p class="muted small">${voting?'A saját képed nem választható. A sorrend mindenkinél ugyanaz.':'Koppints egy képre, majd erősítsd meg a választásod.'}</p></div><div class="dream-grid">${cards.map((id,i)=>`<button class="dream-card ${s.selected===id?'selected':''}" data-a="dreamPick" data-v="${id}" aria-pressed="${s.selected===id}" ${voting&&s.picks[s.actor]===id?'disabled':''}>${pic(id,`${i+1}. kép${voting&&s.picks[s.actor]===id?' · saját lap':''}`)}</button>`).join('')}</div><button class="btn primary big" data-a="dreamConfirm" ${s.selected===null?'disabled':''}>${voting?'Szavazok és elrejtem':'Ezt választom'}</button>`;
  };
  A.dreamCycles=d=>{const s=state();if(s.phase==='setup')s.cycles=clamp(s.cycles+(+d),1,3);};
  A.dreamStart=()=>{if(S.players.length<3||S.players.length>6)return;const s=state();Object.assign(s,{names:players(),scores:S.players.map(()=>0),round:0,total:S.players.length*s.cycles,recorded:false});round(s);};
  A.dreamOpen=()=>{const s=state();if(['choose','clue','vote'].includes(s.phase))s.open=true;};
  A.dreamPick=v=>{const s=state(),id=Number(v);if(!s.open||!Number.isInteger(id))return;const cards=s.phase==='vote'?s.options:s.phase==='choose'?s.hands[s.actor]:[];if(cards.includes(id)&&!(s.phase==='vote'&&s.picks[s.actor]===id))s.selected=id;};
  A.dreamConfirm=()=>{const s=state();if(!s.open||s.selected===null)return;
    if(s.phase==='choose') {if(!s.hands[s.actor].includes(s.selected))return;s.picks[s.actor]=s.selected;s.selected=null;
      if(s.actor===story(s)){s.phase='clue';return;}
      const next=s.picks.findIndex((x,i)=>i!==story(s)&&x===null);s.open=false;
      if(next>=0)s.actor=next;else{s.options=shuffle(s.picks);s.phase='vote';s.actor=s.names.findIndex((_,i)=>i!==story(s));}
    }else if(s.phase==='vote'){if(!s.options.includes(s.selected)||s.selected===s.picks[s.actor])return;s.votes[s.actor]=s.selected;s.selected=null;s.open=false;
      const next=s.votes.findIndex((x,i)=>i!==story(s)&&x===null);if(next<0)score(s);else s.actor=next;
    }
  };
  A.dreamClue=f=>{const s=state();if(s.phase!=='clue'||!s.open)return;const clue=String(f.elements.clue.value).trim().replace(/\s+/g,' ').slice(0,100);if(!clue){s.error='Adj egy rövid nyomot!';return;}s.clue=clue;s.error='';s.draft='';s.phase='choose';s.actor=s.picks.findIndex(x=>x===null);s.open=false;};
  A.dreamNext=()=>{const s=state();if(s.phase!=='result')return;if(s.round+1>=s.total)finish(s);else{s.round++;round(s);}};
  A.dreamFinish=()=>{const s=state();if(s.phase==='result')finish(s);};
  A.dreamSetup=()=>{const s=state();if(s.phase==='end')s.phase='setup';};
  document.addEventListener('input',e=>{if(e.target.id==='dream-clue'){const s=state();if(s.phase==='clue'){s.draft=e.target.value.slice(0,100);save();}}});
  PRIVACY.push(()=>{const s=R.games.dreams;if(s)s.open=false;});
})();
