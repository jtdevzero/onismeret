/* ============ STORY ILLUSTRATIONS ============ */
/* The serial atlas is one coherent cast in six scenes, in reading order (3 × 2).
   Scene captions set the moment without disclosing answers to comprehension questions.
   Existing lesson images remain contextual fallbacks; an absent atlas never blocks reading. */
const STORY_ART={
  en:{serial:{s3:{
    atlas:"img/story-s3-scenes.webp",setting:"London · levéltár",fallback:"en-c7",
    cast:[
      {name:"Helen Marsh",appearance:"Sötétbarna bobfrizura, kerek teknőcmintás szemüveg, olívazöld kardigán, törtfehér blúz."},
      {name:"Daniel",appearance:"Rövid, göndör sötét haj, sötétkék pulóver, rozsdaszínű ingkabát."},
      {name:"A látogató",appearance:"Ezüstös, rendezett haj, antracitszínű öltöny."}
    ],
    scenes:[
      {alt:"Helen és Daniel egy régi dossziét néznek át a levéltár olvasótermében.",caption:"Egy régi dosszié a londoni levéltárban."},
      {alt:"Egy öltönyös látogató Helen olvasótermi asztalához érkezik.",caption:"Váratlan látogató érkezik az olvasóterembe."},
      {alt:"Helen és Daniel feszülten beszélgetnek a levéltári polcok mellett.",caption:"Helen és Daniel között feszültté válik a beszélgetés."},
      {alt:"Helen régi leveleket rendez egy megfakult fénykép mellett.",caption:"Régi levelek és egy megfakult fénykép."},
      {alt:"Helen és Daniel egymás mellett ülve vizsgálják a levéltári iratokat.",caption:"Újra az asztalnál: Helen és Daniel átnézik a dokumentumokat."},
      {alt:"Helen az esti fényben visszahelyez egy fényképet a dossziéba.",caption:"Esti fény a levéltárban; Helen visszarendezi a dossziét."}
    ]
  }},short:{
    "en-s1":{setting:"London · kávézó",alt:"Kávé és péksütemény egy londoni kávézó pultján."},
    "en-s2":{setting:"London · útbaigazítás"},
    "en-s5":{setting:"Edinburgh · hétvégi utazás"},
    "en-s6":{setting:"Munka és döntések"},
    "en-s3":{setting:"Kapcsolatépítés"},
    "en-s4":{setting:"Munkahelyi egyeztetés"},
    "en-s7":{setting:"Szállodai helyzet"},
    "en-s8":{setting:"Döntések és lehetőségek"}
  }},
  it:{short:{
    s1:{setting:"Olasz kávézó"},s2:{setting:"Utazás Firenzébe"},s3:{setting:"Trastevere · vacsora",alt:"Terített olasz éttermi asztal, vacsorához készítve."},
    s4:{setting:"Családi emlékek"},s5:{setting:"Orvosnál"},s6:{setting:"Utazás és váratlan helyzetek"},
    s7:{setting:"Állásinterjú"},s8:{setting:"Bologna · lakáskeresés"},s9:{setting:"Tanácsok és döntések"}
  }},
  es:{short:{
    "es-s1":{setting:"Madrid · kávézó"},"es-s2":{setting:"Utazás Sevillába",alt:"Utazó bőrönddel egy spanyol pályaudvaron."},
    "es-s3":{setting:"Valencia · hétvégi utazás"},"es-s4":{setting:"Állásinterjú"}
  }}
};
const storyArtLoads=new Map();
let storyArtObserver=null;
function storyVisual(st,opts={}){
  const serial=!!opts.serial,config=(STORY_ART[lang()]||{})[serial?"serial":"short"]||{},art=config[st.id]||{};
  const chapter=Math.max(0,Math.min(5,Number.isInteger(opts.chapter)?opts.chapter:0));
  const scene=art.scenes&&art.scenes[chapter],setting=art.setting||(serial?"Hangos történet":"Rövid történet");
  const fallback=art.fallback||st.img||st.unlock;
  /* Only bundled image names may enter an image URL or a style. */
  const image=typeof fallback==="string"&&/^[a-zA-Z0-9_-]+$/.test(fallback)?fallback:null;
  const alt=art.alt||"Hangulatkép: "+(st.hu||st.title||"történet");
  const caption=scene?scene.caption:st.hu||st.title||"";
  const atlas=art.atlas&&/^img\/[a-zA-Z0-9_-]+\.webp$/.test(art.atlas)?art.atlas:null;
  const x=chapter%3*50,y=Math.floor(chapter/3)*100;
  return `<figure class="story-figure${opts.card?" story-card-figure":""}"${atlas?' data-story-prototype="archive"':""}>
    <div class="pic story-scene" role="img" aria-label="${esc(alt)}"${atlas?` data-story-atlas="${esc(atlas)}" data-story-alt="${esc(scene.alt)}" data-story-position="${x}% ${y}%" style="aspect-ratio:1/1"`:""}>
      <span class="story-scene-fallback-label" aria-hidden="true">${esc(setting)}</span>${image?`<img src="img/${esc(image)}.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.remove()">`:""}${opts.badge||""}
    </div>${opts.caption===false?"":`<figcaption class="story-caption"><span class="story-setting">${esc(setting)}</span>${!opts.card?`<span class="story-caption-text">${esc(caption)}</span>`:""}</figcaption>`}</figure>`;
}
function loadStoryAtlas(src){
  if(!storyArtLoads.has(src))storyArtLoads.set(src,new Promise(resolve=>{
    const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=src;
  }));
  return storyArtLoads.get(src);
}
function bindStoryArt(root=view){
  if(storyArtObserver){storyArtObserver.disconnect();storyArtObserver=null;}
  const scenes=[...root.querySelectorAll("[data-story-atlas]")];if(!scenes.length)return;
  const show=async el=>{
    const src=el.dataset.storyAtlas;if(!/^img\/[a-zA-Z0-9_-]+\.webp$/.test(src||""))return;
    if(!await loadStoryAtlas(src)||!el.isConnected)return;
    el.style.backgroundImage=`url("${src}")`;el.style.backgroundSize="300% 200%";el.style.backgroundPosition=el.dataset.storyPosition||"0% 0%";
    el.classList.add("is-atlas");el.setAttribute("aria-label",el.dataset.storyAlt||el.getAttribute("aria-label"));el.querySelectorAll("img,.story-scene-fallback-label").forEach(img=>img.remove());
  };
  if(typeof IntersectionObserver==="undefined"){scenes.forEach(show);return;}
  storyArtObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){storyArtObserver&&storyArtObserver.unobserve(e.target);show(e.target);}},{rootMargin:"200px"});
  scenes.forEach(el=>storyArtObserver.observe(el));
}
