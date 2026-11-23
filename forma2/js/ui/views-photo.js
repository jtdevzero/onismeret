/* Fotós változáskövető – a fájlokat csak a felhasználó választja ki, helyi tárolás. */
import { h, clear, fmtDate, toast, uid } from './dom.js';
import { page, card, note, btn } from './widgets.js';
import { photosAll, photoPut, photoDelete } from './photo-store.js';
import { validatePhotoFile, photoDimensions } from '../core/photo-tracker.js';
import { tr } from './i18n.js';

async function sanitizeImage(file) {
  let bitmap, release = () => {};
  if (typeof createImageBitmap === 'function') {
    bitmap = await createImageBitmap(file);
    release = () => bitmap.close();
  } else {
    const url = URL.createObjectURL(file);
    try {
      bitmap = await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});
    } catch(e) { URL.revokeObjectURL(url); throw e; }
    release = () => URL.revokeObjectURL(url);
  }
  try {
    const dims = photoDimensions(bitmap.width || bitmap.naturalWidth, bitmap.height || bitmap.naturalHeight);
    if (!dims) throw new Error('dimensions');
    const canvas = document.createElement('canvas'); [canvas.width, canvas.height] = dims;
    const context = canvas.getContext('2d'); if (!context) throw new Error('canvas');
    context.fillStyle = '#fff'; context.fillRect(0,0,...dims);
    context.drawImage(bitmap,0,0,...dims);
    const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));
    if (!blob) throw new Error('encode');
    return blob; /* EXIF és helyadat nem kerül a visszakódolt JPEG-fájlba */
  } finally { release(); }
}

export async function photoTrackerView(_arg, onCleanup = () => {}) {
  const grid = h('div', { class:'photo-grid' });
  const comparison = h('div', { class:'photo-compare' });
  const status = h('p', { role:'status', class:'small muted' });
  const file = h('input', { type:'file', accept:'image/jpeg,image/png,image/webp', 'aria-label':tr('Fotó kiválasztása') });
  const comment = h('input', { type:'text', maxLength:80, placeholder:tr('Megjegyzés (nem kötelező)') });
  const previewUrls = [];
  onCleanup(()=>{for(const url of previewUrls) URL.revokeObjectURL(url);});
  async function render() {
    try {
      const entries=(await photosAll()).sort((a,b)=>b.date-a.date);
      for(const url of previewUrls.splice(0))URL.revokeObjectURL(url);
      const sources = new Map(entries.map(p=>{ const url=URL.createObjectURL(p.blob);previewUrls.push(url);return [p.id,url]; }));
      clear(comparison);
      if (entries.length >= 2) {
        const makeSelect = (index) => h('select',{ 'aria-label':tr(index===0?'Korábbi fotó':'Későbbi fotó') },
          entries.map((p,i)=>h('option',{value:p.id,selected:i===(index===0?entries.length-1:0)},fmtDate(p.date)+(p.note?' · '+p.note:''))));
        const first=makeSelect(0), second=makeSelect(1), pair=h('div',{class:'photo-compare-pair'});
        let overlay=false;
        const opacity=h('input',{type:'range',min:'0',max:'100',value:'50','aria-label':tr('Fotók átfedési aránya')});
        const offsetX=h('input',{type:'range',min:'-40',max:'40',value:'0','aria-label':tr('Fotó vízszintes igazítása')});
        const offsetY=h('input',{type:'range',min:'-40',max:'40',value:'0','aria-label':tr('Fotó függőleges igazítása')});
        const overlayControls=h('div',{class:'photo-overlay-controls'},
          h('label',{class:'photo-overlay-control'},tr('Átfedés mértéke'),opacity),
          h('label',{class:'photo-overlay-control'},tr('Vízszintes igazítás'),offsetX),
          h('label',{class:'photo-overlay-control'},tr('Függőleges igazítás'),offsetY));
        const mode=btn(tr('Átfedéses nézet'),()=>{overlay=!overlay;mode.textContent=tr(overlay?'Egymás mellett':'Átfedéses nézet');update();},'small');
        const update=()=>{
          clear(pair);
          pair.classList.toggle('photo-compare-overlay',overlay);
          overlayControls.hidden=!overlay;
          if(overlay){
            const before=h('img',{src:sources.get(first.value),alt:tr('Korábbi fotó')});
            const after=h('img',{src:sources.get(second.value),alt:tr('Későbbi fotó')});
            const adjust=()=>{after.style.opacity=String(Number(opacity.value)/100);after.style.transform=`translate(${Number(offsetX.value)}%,${Number(offsetY.value)}%)`;};
            for(const field of [opacity,offsetX,offsetY])field.oninput=adjust;adjust();
            pair.append(h('div',{class:'photo-overlay-stage'},before,after));
          }else pair.append(...[first,second].map(select=>h('figure',null,
            h('img',{src:sources.get(select.value),alt:tr('Saját előrehaladási fotó')}),
            h('figcaption',null,select.options[select.selectedIndex]?.textContent||''))));
        };
        first.addEventListener('change',update);second.addEventListener('change',update);
        comparison.append(h('h3',null,tr('Két fotó összehasonlítása')),
          h('p',{class:'muted small'},tr('Válassz két időpontot. A képek kizárólag a készülékeden jelennek meg.')),
          h('div',{class:'photo-compare-selects'},h('label',null,tr('Korábbi fotó'),first),h('label',null,tr('Későbbi fotó'),second)),
          h('div',{class:'photo-compare-options'},mode,overlayControls),pair);
        update();
      }
      clear(grid).append(entries.length ? entries.map(p=>{
        const url=sources.get(p.id);
        const download=()=>{const a=h('a',{href:url,download:'forma2-foto-'+p.id+'.jpg'});document.body.append(a);a.click();a.remove();};
        return h('article',{class:'photo-entry'},h('img',{src:url,alt:tr('Saját előrehaladási fotó'),loading:'lazy'}),
          h('strong',null,fmtDate(p.date)),p.note?h('p',{class:'small'},p.note):null,
          h('div',{class:'row'},btn(tr('Letöltés'),download,'small'),btn(tr('Fotó törlése'),async()=>{
            if(!confirm(tr('Végleg törlöd ezt a fotót? A művelet nem vonható vissza.')))return;
            try{await photoDelete(p.id);toast(tr('Fotó törölve.'));await render();}catch{status.textContent=tr('A fotót nem sikerült törölni.');}
          },'small')));
      }) : h('p',{class:'muted'},tr('Még nem mentettél fotót.')));
      status.textContent=tr('{p0} fotó csak ezen az eszközön.',{p0:entries.length});
    }catch{status.textContent=tr('A helyi fotótár most nem érhető el. Nem készült mentés.');}
  }
  let saving=false;
  const save=btn(tr('Fotó helyi mentése'),async()=>{
    if(saving)return;
    const chosen=file.files?.[0];const invalid=validatePhotoFile(chosen);
    if(invalid){status.textContent=invalid==='type'?tr('Csak JPG, PNG vagy WebP képet válassz.'):tr('A kép legyen legfeljebb 12 MB.');return;}
    saving=true;save.disabled=true;status.textContent=tr('Fotó feldolgozása…');
    try{
      const blob=await sanitizeImage(chosen);
      await photoPut({id:uid(),date:Date.now(),note:comment.value.trim().slice(0,80),blob});
      file.value='';comment.value='';toast(tr('Fotó csak a készülékeden elmentve.'));
      await render();
    }catch{status.textContent=tr('Nem sikerült menteni a fotót. Ellenőrizd a szabad tárhelyet.');}
    finally{saving=false;save.disabled=false;}
  },'primary');
  await render();
  return page(tr('Vizuális fejlődésnapló'),
    card(h('h2',null,tr('Testváltozás követése fotóval')),
      h('p',{class:'muted'},tr('Választhatsz vagy készíthetsz fotót. A képet kisebb, helyadat nélküli JPEG-fájlba alakítjuk, és külön, helyben tároljuk. Nem töltjük fel szerverre.')),
      h('label',{class:'field'},tr('Fotó'),file),h('label',{class:'field'},tr('Megjegyzés'),comment),save,status),
    note(tr('A fotók NEM részei a szokásos FORMA biztonsági mentésnek. Telefoncsere vagy böngészőadat-törlés előtt külön töltsd le őket. A tárolt képeket ezen az oldalon külön törölheted.'),'warn'),
    card(h('h2',null,tr('Fotóelőzmények')),comparison,grid),
    note(tr('Azonos fény, távolság és testhelyzet mellett készített képek könnyebben összevethetők. A rendszer nem becsül testzsírt, betegséget vagy sérülést fotóból.'),'small'));
}
