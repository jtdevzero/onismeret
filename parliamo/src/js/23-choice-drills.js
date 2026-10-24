/* ============ CHOICE DRILLS (tenses, articles, prepositions…) ============ */
function startChoice(k){D={k,ok:0,n:0,choice:true,done:false,queue:shuffle(CDRILLS[k].items.map((_,i)=>i)),pos:0};nextChoice();}
function fillBlanks(q,a,html){const parts=a.split(" / ");let i=0;return q.replace(/___/g,()=>{const t=parts[Math.min(i++,parts.length-1)];return html?`<b class="fillin">${esc(t)}</b>`:t;});}
function nextChoice(){
  const set=CDRILLS[D.k];if(D.pos>=D.queue.length){D.queue=shuffle(D.queue);D.pos=0;}
  const it=set.items[D.queue[D.pos++]],opts=shuffle(it.o.slice());D.done=false;
  const q=esc(it.q).replace(/___/g,'<span class="blank"></span>');
  drillShell("",`<div class="card" style="padding:1.6rem 1.2rem"><span class="label">Válaszd ki a helyes alakot</span><div class="big-q" style="font-size:1.55rem;margin-top:.4rem">${q}</div></div>
    <div class="opts">${opts.map((o,i)=>`<button class="opt" data-o="${i}"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}</div><div id="dfb"></div><button class="btn block" id="dgo" hidden>Következő</button>`);
  const btn=$("#dgo");btn.onclick=nextChoice;
  view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(D.done)return;D.done=true;const pick=opts[+b.dataset.o],ok=pick===it.a;
    D.n++;if(!ok)logMiss("drill:"+D.k,it.q,pick,it.a);if(ok){D.ok++;addXP(1);fx("ok");}else{save();fx("bad");}drillStat(D.k,ok);
    view.querySelectorAll("[data-o]").forEach(x=>{const o=opts[+x.dataset.o];if(o===it.a)x.classList.add("right");else if(x===b)x.classList.add("wrong");});
    const full=fillBlanks(it.q,it.a,false);
    $("#dfb").innerHTML=`<div class="feedback ${ok?"ok":"bad"}" role="status"><b>${ok?rnd(LG().ok):"Nem egészen."}</b><span class="ans">${fillBlanks(esc(it.q),it.a,true)}</span><span class="small" style="color:var(--ink)">${esc(it.why)}</span></div>`;
    $(".score").textContent=D.ok+" / "+D.n;say(full);btn.hidden=false;btn.focus();});
  D.keys=e=>{const n=+e.key;if(!D.done&&n>=1&&n<=opts.length)view.querySelector(`[data-o="${n-1}"]`).click();else if(D.done&&e.key==="Enter")nextChoice();};
}
function numIt(n){const u=["zero","uno","due","tre","quattro","cinque","sei","sette","otto","nove","dieci","undici","dodici","tredici","quattordici","quindici","sedici","diciassette","diciotto","diciannove"];
  const t=["","","venti","trenta","quaranta","cinquanta","sessanta","settanta","ottanta","novanta"];
  if(n<20)return u[n];if(n===100)return "cento";const a=Math.floor(n/10),b=n%10;let w=t[a];if(!b)return w;if(b===1||b===8)w=w.slice(0,-1);return w+(b===3?"tré":u[b]);}

