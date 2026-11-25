/* Preview-only thematic navigation for the BiasMap HU C design.
 * Connections are based on existing group membership; no causal assertion. */
(function () {
  'use strict';
  const body=document.getElementById('p-body');
  if (!body || typeof BIASES==='undefined') return;
  const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const related=b=>{
    const own=b.g.items.filter(x=>x!==b);
    const index=own.length?Math.max(0,own.findIndex(x=>x.i>b.i)):0;
    const ordered=own.slice(index).concat(own.slice(0,index));
    const chosen=ordered.slice(0,4).map(x=>({bias:x,label:'Azonos csoport'}));
    if (chosen.length<4) {
      BIASES.filter(x=>x!==b&&x.g!==b.g&&x.q===b.q).forEach(x=>{
        if(chosen.length<4)chosen.push({bias:x,label:'Azonos főterület'});
      });
    }
    return chosen;
  };
  function render() {
    if (typeof current==='undefined'||current?.type!=='b'||!body.isConnected) return;
    if (body.querySelector('.connection-map')) return;
    const b=current.b;
    const candidates=related(b);
    if (!candidates.length) return;
    const section=document.createElement('section');
    section.className='connection-map';
    section.setAttribute('aria-label','Kapcsolódó kognitív torzítások');
    section.innerHTML=`<h3>Kapcsolódó torzítások</h3>
      <p class="connection-note">Tematikus navigáció a meglévő csoportok alapján. A kapcsolat nem jelent ok-okozati összefüggést.</p>
      <div class="connection-core">${safe(b.n)}</div>
      <div class="connection-branch" aria-hidden="true"></div>
      <div class="connection-links">${candidates.map(({bias,label})=>
        `<button type="button" data-i="${bias.i}" title="${safe(bias.n)} megnyitása"><small>${label}</small>${safe(bias.n)}</button>`
      ).join('')}</div>`;
    body.append(section);
  }
  // Works for keyboard, list, map and direct-link navigation alike.
  const observer=new MutationObserver(()=>render());
  observer.observe(body,{childList:true});
  render();
})();
