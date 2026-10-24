/* ============ QUIZ RUNNER (plan days, plan tests, level tests) ============ */
/* Items are {q, a, o, why?, say?}; q may contain ___ for the gap. */
let QZ=null;
function runQuiz(o){QZ=Object.assign({i:0,ok:0,done:false,miss:[]},o);drawQuiz();}
function drawQuiz(){
  const it=QZ.items[QZ.i];if(!it){const q=QZ;QZ=null;return q.onDone(q.ok,q.items.length,q.miss);}
  if(!it._o)it._o=shuffle(it.o.slice());
  const opts=it._o;QZ.done=false;
  subShell([QZ.backLabel||"Vissza",()=>{QZ=null;(QZ_BACK||renderPractice)();}],QZ.label,esc(QZ.title||""),`<div class="pbar"><div class="track"><div class="fill" style="width:${QZ.i/QZ.items.length*100}%"></div></div><span class="small muted tnum">${QZ.i+1}/${QZ.items.length}</span></div>
    ${QZ.intro&&QZ.i===0?`<div class="card stack">${QZ.intro}</div>`:""}
    <div class="card" style="padding:1.4rem 1.1rem">${it.sub?`<span class="label">${esc(it.sub)}</span>`:""}<div class="big-q" style="font-size:1.45rem;margin-top:.3rem" ${it.huQ?"":LA()}>${blankify(it.q).replace(/___/g,'<span class="blank"></span>')}</div>${it.say?spkBtn(it.say):""}</div>
    <div class="opts">${opts.map((x,j)=>`<button class="opt" data-o="${j}" ${it.huQ?LA():""}><kbd>${j+1}</kbd>${esc(x)}</button>`).join("")}</div><div id="qfb"></div><button class="btn block" id="qgo" hidden>Tovább</button>`,`${QZ.ok} / ${QZ.i}`);
  view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(QZ.done)return;QZ.done=true;const pick=opts[+b.dataset.o],ok=pick===it.a;
    if(ok){QZ.ok++;fx("ok");}else{fx("bad");QZ.miss.push(it);logMiss(QZ.kind||"quiz",it.q,pick,it.a);}
    view.querySelectorAll("[data-o]").forEach(x=>{const v=opts[+x.dataset.o];if(v===it.a)x.classList.add("right");else if(x===b)x.classList.add("wrong");});
    $("#qfb").innerHTML=`<div class="feedback ${ok?"ok":"bad"}" role="status"><b>${ok?rnd(LG().ok):"Nem egészen."}</b>${ok?"":`<span>Helyes: <span class="ans">${esc(it.a)}</span></span>`}${it.why?`<span class="small" style="color:var(--ink)">${esc(it.why)}</span>`:""}</div>`;
    if(it.q.includes("___"))say(it.q.replace(/___/,it.a));else if(it.say)say(it.say);
    const g=$("#qgo");g.hidden=false;g.focus();g.onclick=()=>{QZ.i++;drawQuiz();};});
}
let QZ_BACK=null;
document.addEventListener("keydown",e=>{if(!QZ||e.target.matches("input,textarea"))return;const n=+e.key;if(!QZ.done&&n>=1&&n<=4){const b=view.querySelector(`[data-o="${n-1}"]`);if(b)b.click();}else if(QZ.done&&e.key==="Enter"){const g=$("#qgo");if(g)g.click();}});

