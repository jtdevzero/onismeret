/* ═══ SHARED HELPERS ═══ */
window.H = (function(){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const sum=a=>a.reduce((x,y)=>x+y,0);
  const r1=x=>Math.round(x*10)/10;
  const r2=x=>Math.round(x*100)/100;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

  function cards(list){
    return `<div class="score-grid">${list.map(c=>`<div class="score-card" style="--sc:${c.color}">
      <div class="abbr">${c.abbr||''}</div><h4>${c.name}</h4>
      <div class="val">${c.val}</div><div class="out">${c.out||''}</div>
      ${c.band?`<span class="band">${c.band}</span>`:''}
      <div class="bar"><div class="bar-fill" style="width:${clamp(c.pct,0,100)}%"></div></div></div>`).join('')}</div>`;
  }
  function bars(title,groups){
    return `<div class="facet-list"><h3>${title}</h3>${groups.map(g=>`<div class="facet-group" style="--fg-color:${g.color}">
      ${g.title?`<div class="facet-group-head"><h4>${g.title}</h4></div>`:''}
      ${g.rows.map(r=>`<div class="facet-row"><span class="facet-row-name">${r.name}</span><span class="facet-row-val">${r.val}<span>${r.unit||''}</span></span>
        <div class="facet-row-track"><div class="facet-row-fill" style="width:${clamp(r.pct,0,100)}%;background:${r.color||g.color}"></div></div></div>`).join('')}
    </div>`).join('')}</div>`;
  }
  function rank(title,items){
    return `<div class="rank-list"><h3>${title}</h3>${items.map((it,i)=>`<div class="rank-item${it.top?' top':''}" style="--rc:${it.color};--top-color:${it.color}">
      <div class="rank-pos">${i+1}.</div>
      <div><div class="rank-name">${it.name}${it.sub?` <em>${it.sub}</em>`:''}</div>${it.desc?`<div class="rank-desc">${it.desc}</div>`:''}</div>
      <div class="rank-score">${it.score}<span>${it.unit||''}</span></div></div>`).join('')}</div>`;
  }
  function interp(title,sections){
    return `<div class="interp-card"><h3>${title}</h3>${sections.filter(Boolean).map(s=>`<div class="interp-section" style="--sc:${s.color||'var(--c1)'}"><h4>${s.h}</h4>${s.html}</div>`).join('')}</div>`;
  }
  function chart(title,sub,inner,legend){
    return `<div class="chart-card"><h3>${title}</h3><div class="chart-sub">${sub}</div>${inner}${legend?`<div class="chart-legend">${legend.map(l=>`<div class="chart-legend-item"><span class="chart-legend-swatch" style="background:${l.color}"></span><span><strong>${l.label}</strong> ${l.val??''}</span></div>`).join('')}</div>`:''}</div>`;
  }
  function callout(html,color){return `<div class="callout" style="--cc:${color||'var(--gold-bright)'}">${html}</div>`;}
  function refs(list){return `<div class="refs-card"><h3>Tudományos <em>háttér</em></h3>${list.map(r=>`<div class="ref-item">${r}</div>`).join('')}</div>`;}

  function radar(data,opts){
    opts=opts||{};
    const W=480,H=480,cx=W/2,cy=H/2,R=160,n=data.length,step=(2*Math.PI)/n,start=-Math.PI/2;
    const max=opts.max,min=opts.min||0,levels=opts.levels||4,sc=opts.stroke||'#60a5fa',fc=opts.fill||'rgba(96,165,250,0.28)';
    let h='';
    for(let g=1;g<=levels;g++){const gr=R*g/levels;let p='';for(let i=0;i<n;i++){const a=start+i*step;p+=`${cx+gr*Math.cos(a)},${cy+gr*Math.sin(a)} `;}
      h+=`<polygon points="${p.trim()}" fill="none" stroke="rgba(147,197,253,0.18)" stroke-width="${g===levels?1.5:1}" stroke-dasharray="${g===levels?'':'3,4'}"/>`;}
    for(let i=0;i<n;i++){const a=start+i*step;h+=`<line x1="${cx}" y1="${cy}" x2="${cx+R*Math.cos(a)}" y2="${cy+R*Math.sin(a)}" stroke="rgba(147,197,253,0.18)"/>`;}
    let dp='';const dots=[];
    for(let i=0;i<n;i++){const a=start+i*step;const r=clamp((data[i].value-min)/(max-min),0,1)*R;const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);dp+=`${x},${y} `;dots.push({x,y,c:data[i].color||sc});}
    h+=`<polygon points="${dp.trim()}" fill="${fc}" stroke="${sc}" stroke-width="2.5" stroke-linejoin="round"/>`;
    dots.forEach(d=>{h+=`<circle cx="${d.x}" cy="${d.y}" r="6" fill="${d.c}" stroke="#fff" stroke-width="2"/>`;});
    for(let i=0;i<n;i++){const a=start+i*step,lr=R+32,x=cx+lr*Math.cos(a),y=cy+lr*Math.sin(a);
      let an='middle';if(Math.cos(a)>0.3)an='start';else if(Math.cos(a)<-0.3)an='end';
      h+=`<text x="${x}" y="${y-4}" text-anchor="${an}" font-family="Fraunces,Cardo,serif" font-size="13.5" font-weight="500" fill="#f1f5f9">${data[i].label}</text>`;
      h+=`<text x="${x}" y="${y+13}" text-anchor="${an}" font-family="Manrope,sans-serif" font-size="12" font-weight="700" fill="${data[i].color||sc}">${data[i].shown??data[i].value}</text>`;}
    return `<svg class="chart-svg" viewBox="-40 0 560 ${H}">${h}</svg>`;
  }
  function gauge(o){
    // o: {name,sub,val,unit,min,max,color,zones:[{from,to,color}],labels:[..],desc}
    const pos=v=>((v-o.min)/(o.max-o.min))*100;
    return `<div class="gauge-row" style="--gc:${o.color}"><div class="gauge-head"><span class="nm">${o.name}${o.sub?` <em>${o.sub}</em>`:''}</span><span class="vl">${o.shown??o.val}<span>${o.unit||''}</span></span></div>
      <div class="zone-track">${(o.zones||[]).map(z=>`<div class="zone" style="left:${pos(z.from)}%;width:${pos(z.to)-pos(z.from)}%;background:${z.color}"></div>`).join('')}
      <div class="mark" style="left:${clamp(pos(o.val),0,100)}%;background:${o.color}"></div></div>
      ${o.labels?`<div class="zone-labels">${o.labels.map(l=>`<span>${l}</span>`).join('')}</div>`:''}
      ${o.desc?`<div class="gauge-desc">${o.desc}</div>`:''}</div>`;
  }
  return {esc,mean,sum,r1,r2,clamp,cards,bars,rank,interp,chart,callout,refs,radar,gauge};
})();

/* ═══ TEST ENGINE ═══ */
window.TESTS={};
function makeTest(cfg){
  const items=[];let n=0;
  cfg.sections.forEach(sec=>sec.items.forEach(it=>{n++;items.push(Object.assign({n,sec},it));}));
  const TOTAL=items.length;
  let responses={};
  const $=id=>document.getElementById(cfg.id+'-'+id);
  function load(){try{const r=localStorage.getItem(cfg.key);if(r)responses=JSON.parse(r)||{};}catch(e){responses={}}}
  function save(){try{localStorage.setItem(cfg.key,JSON.stringify(responses));}catch(e){}window.hubCheckProgress&&window.hubCheckProgress();}

  function panelHTML(){
    const h=cfg.header;
    return `<section id="test-${cfg.id}" class="test-panel" role="tabpanel" style="--c1:${cfg.c1};--c2:${cfg.c2}">
    <div class="shell">
      <header>
        <span class="status-badge ${h.status}">${h.statusText}</span>
        <div class="eyebrow" style="color:${cfg.c1}">${h.eyebrow}</div>
        <h2>${h.title}</h2>
        <p class="lead">${h.lead}</p>
      </header>
      <div class="intro-box">${h.intro}</div>
      <div class="progress-shell"><div class="progress-bar"><div class="progress-fill" id="${cfg.id}-fill" style="background:linear-gradient(90deg,${cfg.c1},${cfg.c2})"></div></div><div class="progress-text"><strong id="${cfg.id}-num">0</strong> / ${TOTAL}</div></div>
      <div id="${cfg.id}-quiz"></div>
      <div class="results-trigger"><button class="btn-primary" id="${cfg.id}-show" disabled><em>Megmutatni</em> az eredményt</button></div>
      <div class="results" id="${cfg.id}-results"></div>
    </div></section>`;
  }
  function quizHTML(){
    let html='';
    cfg.sections.forEach(sec=>{
      if(sec.title)html+=`<div class="section-head"><h3>${sec.title}</h3>${sec.desc?`<p>${sec.desc}</p>`:''}</div>`;
      items.filter(it=>it.sec===sec).forEach(it=>{
        const opts=it.opts||cfg.scale;
        const choice=!!it.opts;
        const cls=choice?'opts':`scale${opts.length===4?' s4':opts.length===6?' s6':''}`;
        html+=`<div class="q" data-n="${it.n}"><div class="q-head"><span class="q-num">${it.n}.</span><span class="q-text">${it.t}</span></div>
          <div class="${cls}">${opts.map((o,i)=>{
            const val=choice?i:o.v;
            return choice?`<button class="opt-btn" data-n="${it.n}" data-v="${val}">${o.t}</button>`
                         :`<button class="scale-btn" data-n="${it.n}" data-v="${val}"><span class="v">${o.v}</span><span class="l">${o.l}</span></button>`;
          }).join('')}</div></div>`;
      });
    });
    return html;
  }
  function refreshSelection(){
    document.querySelectorAll(`#${cfg.id}-quiz [data-n]`).forEach(b=>{
      if(!b.dataset.v)return;
      b.classList.toggle('selected',String(responses[b.dataset.n])===b.dataset.v);
    });
  }
  function progress(){
    const done=items.filter(it=>responses[it.n]!==undefined).length;
    $('num').textContent=done;
    $('fill').style.width=(done/TOTAL*100)+'%';
    $('show').disabled=done<TOTAL;
  }
  function buildR(){
    const R={items:[],scales:{},picks:[]};
    items.forEach(it=>{
      const raw=responses[it.n];
      if(it.opts){const opt=it.opts[raw];R.picks.push({item:it,opt,idx:raw});R.items.push({n:it.n,t:it.t,raw,opt:opt&&opt.t});return;}
      const vals=cfg.scale.map(s=>s.v),lo=Math.min(...vals),hi=Math.max(...vals);
      const v=it.r?(lo+hi)-raw:raw;
      R.items.push({n:it.n,s:it.s,t:it.t,raw,v,r:!!it.r});
      (R.scales[it.s]=R.scales[it.s]||[]).push(v);
    });
    R.mean=s=>H.mean(R.scales[s]||[]);
    R.sum=s=>H.sum(R.scales[s]||[]);
    R.allMean=()=>H.mean(R.items.map(i=>i.v).filter(v=>v!==undefined));
    return R;
  }
  let lastResult=null;
  function show(){
    const R=buildR();
    lastResult=cfg.score?cfg.score(R):null;
    if(window.ONI&&cfg.sum){try{ONI.save(cfg.id,Object.assign({n:cfg.name},cfg.sum(lastResult,R)));}catch(e){console.warn('ONI',e)}}
    const el=$('results');
    el.innerHTML=cfg.render(R,lastResult)+`<div class="actions">
      <button class="btn-secondary" onclick="window.print()">PDF</button>
      <button class="btn-secondary" onclick="TESTS['${cfg.id}'].downloadJSON()">JSON</button>
      <button class="btn-secondary" onclick="TESTS['${cfg.id}'].reset()">Új kitöltés</button></div>`;
    el.classList.add('visible');
    setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),60);
  }
  function downloadJSON(){
    const R=buildR();
    const data={test:cfg.name,key:cfg.key,date:new Date().toISOString(),responses:R.items,result:cfg.score?cfg.score(R):null};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${cfg.id}-${new Date().toISOString().slice(0,10)}.json`;a.click();
  }
  function reset(){
    if(!confirm(`Biztos törlöd a(z) ${cfg.name} válaszaidat?`))return;
    responses={};save();refreshSelection();progress();$('results').classList.remove('visible');
    document.getElementById('test-'+cfg.id).scrollIntoView({behavior:'smooth'});
  }
  function mount(container){
    container.insertAdjacentHTML('beforeend',panelHTML());
    load();
    $('quiz').innerHTML=quizHTML();
    $('quiz').addEventListener('click',e=>{
      const b=e.target.closest('[data-v]');if(!b)return;
      responses[b.dataset.n]=Number(b.dataset.v);save();refreshSelection();progress();
    });
    $('show').addEventListener('click',show);
    refreshSelection();progress();
  }
  const api={cfg,mount,show,reset,downloadJSON,total:TOTAL,hasProgress:()=>Object.keys(responses).length>0,_fillAll:(fn)=>{items.forEach(it=>{const k=it.opts?it.opts.length:cfg.scale.length;responses[it.n]=it.opts?fn(k,it):cfg.scale[fn(k,it)].v;});save();refreshSelection();progress();}};
  TESTS[cfg.id]=api;
  return api;
}

/* ═══ HUB BOOT ═══ */
function bootHub(order){
  const nav=document.getElementById('hub-tabs'),panels=document.getElementById('panels');
  const romans=['I.','II.','III.','IV.','V.','VI.'];
  order.forEach((id,i)=>{
    const t=TESTS[id],c=t.cfg;
    nav.insertAdjacentHTML('beforeend',`<button class="hub-tab" style="--tab-color:${c.c1}" data-target="test-${id}" role="tab" aria-selected="false"><span class="check"></span><span class="num">${romans[i]}</span><span class="name">${c.tab}</span><span class="sub">${c.tabSub}</span></button>`);
    t.mount(panels);
  });
  const tabs=[...nav.querySelectorAll('.hub-tab')];
  function activate(target,scroll){
    if(!document.getElementById(target))target='test-'+order[0];
    tabs.forEach(t=>{const on=t.dataset.target===target;t.classList.toggle('active',on);t.setAttribute('aria-selected',on)});
    document.querySelectorAll('.test-panel').forEach(p=>p.classList.toggle('active',p.id===target));
    if(scroll)window.scrollTo({top:0,behavior:'smooth'});
  }
  tabs.forEach(t=>t.addEventListener('click',()=>{activate(t.dataset.target,true);history.replaceState(null,'','#'+t.dataset.target);}));
  window.hubCheckProgress=()=>order.forEach((id,i)=>tabs[i].classList.toggle('has-progress',TESTS[id].hasProgress()));
  window.hubCheckProgress();
  activate(location.hash.slice(1),false);
  window.addEventListener('hashchange',()=>activate(location.hash.slice(1),true));
}
