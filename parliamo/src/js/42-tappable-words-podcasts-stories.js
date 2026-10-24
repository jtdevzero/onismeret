/* ============ TAPPABLE WORDS (podcasts, stories) ============ */
const wrapW=t=>esc(t).split(/(\s+)/).map(tok=>/^\s+$/.test(tok)||!tok?tok:`<span class="w" tabindex="0">${tok}</span>`).join("");
/* Points the reader's word lookup at the given lines and glossary, then wires every .w in the view. */
function bindWords(lines,gloss){
  RD={t:{paragraphs:lines},gl:new Map()};(gloss||[]).forEach(g=>RD.gl.set(norm(g.it),{w:g.it,base:g.it,hu:g.hu}));
  if(!$("#wpop"))view.insertAdjacentHTML("beforeend",`<div id="wpop" class="wpop" hidden></div>`);
  view.querySelectorAll(".w").forEach(el=>{el.onclick=e=>{e.stopPropagation();lookupWord(el);};el.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();e.stopPropagation();lookupWord(el);}};});
}

