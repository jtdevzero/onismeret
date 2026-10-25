/* ============ LANGUAGE WORLDS ============ */
/* One familiar workspace, with the colours and everyday places of the language being learned.
   Artwork is bundled locally; it is decorative and has no animation or network dependency. */
/* A function keeps these values available to the early boot-time applyPrefs call,
   even though this module is assembled after 60-boot.js. */
function languageWorlds(){return {
  en:{locale:"en-GB",place:"London",eyebrow:"Angol mindennapok",title:"A little closer, every day.",copy:"Utcák, történetek és hétköznapi beszélgetések. A mai angolgyakorlásod innen indul.",caption:"London · a Temze partján",colour:"#173A5D"},
  it:{locale:"it-IT",place:"Bologna",eyebrow:"Olasz mindennapok",title:"Un passo alla volta.",copy:"Egy kávé a téren, egy új mondat olaszul. Haladj a saját ritmusodban.",caption:"Bologna · az árkádok alatt",colour:"#91492F"},
  es:{locale:"es-ES",place:"Sevilla",eyebrow:"Spanyol mindennapok",title:"Cada día, un poco más.",copy:"Beszélgetések egy napfényes téren. Egy új mondat, egy új kapcsolat.",caption:"Sevilla · egy napfényes téren",colour:"#234F69"}
};}
function applyLanguageWorld(){
  const worlds=languageWorlds(),key=typeof lang==="function"?lang():"en",l=Object.prototype.hasOwnProperty.call(worlds,key)?key:"en";
  document.documentElement.dataset.learnLang=l;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=worlds[l].colour;
}
function worldHeroHtml(){
  const worlds=languageWorlds(),key=typeof lang==="function"?lang():"en",l=Object.prototype.hasOwnProperty.call(worlds,key)?key:"en",w=worlds[l];
  const date=new Date().toLocaleDateString("hu-HU",{month:"long",day:"numeric"});
  return `<header class="world-hero" aria-labelledby="worldTitle">
    <figure class="world-landmark"><img src="img/world-${l}.webp" alt="" width="1536" height="1024" fetchpriority="high" decoding="async"><figcaption>${esc(w.caption)}</figcaption></figure>
    <div class="world-copy"><span class="world-eyebrow">${esc(w.eyebrow)} · ${esc(date)}</span><h1 id="worldTitle" lang="${w.locale}">${esc(w.title)}</h1><p>${esc(w.copy)}</p></div>
  </header>`;
}
