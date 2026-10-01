/* Önismereti térképek — mélyelemzés minden teszt eredményének végére.
   Adatok oldalanként: assets/mely/<oldal>.js → window.ONI_MELY_DATA[tesztazonosító].
   A results-plus.js hívja (window.ONI_MELY(id, rekord)); ha nincs adat, üres szöveget ad.

   Adatformátum tesztenként:
     cim        a blokk címe (nem kötelező)
     bevezeto   [bekezdés…]      mit mér a teszt, hogyan érdemes olvasni
     profil     function(r,lv)   nem kötelező: a skálák együttállásából adódó bekezdések
     skalak     {kulcs:{hi,mid,lo, tipHi, tipLo, cut:[alsó,felső]}}  skálánkénti szöveg és tipp
     mutat      {top,bottom}     sok skála esetén csak a legmagasabb/legalacsonyabb jelenik meg
     szint      {hi,mid,lo}      a szintcímkék (alap: Magas / Közepes / Alacsony)
     jo         'hi' | 'lo'      melyik irány kedvező (tesztszinten vagy skálánként); a címke színét adja
     gyoker     [bekezdés…]      honnan ered
     mindennap  [bekezdés…]      hogyan jelenik meg kapcsolatban, munkában
     fennmarad  szöveg           miért marad fenn (nem kötelező)
     lepesek    [lépés…]         általános lépések
     kerdesek   [kérdés…]
     megjegyzes szöveg           záró megjegyzés (nem kötelező)
*/
(function(){
  window.ONI_MELY_DATA = window.ONI_MELY_DATA || {};
  var LV = {hi:'Magas', mid:'Közepes', lo:'Alacsony'};
  function num(x){ return typeof x === 'number' ? (Math.round(x*100)/100).toString().replace('.', ',') : x; }
  function level(sc, d){
    var v = d[1], lo = d[2], hi = d[3];
    if (sc && sc.cut) return v >= sc.cut[1] ? 'hi' : v <= sc.cut[0] ? 'lo' : 'mid';
    var p = (v - lo) / ((hi - lo) || 1);
    return p >= 0.6667 ? 'hi' : p <= 0.3333 ? 'lo' : 'mid';
  }
  function pos(d){ return Math.max(0, Math.min(1, (d[1]-d[2]) / ((d[3]-d[2]) || 1))); }
  function ps(a){ return (a || []).map(function(t){ return '<p>' + t + '</p>'; }).join(''); }
  function sec(icon, title, body, cls){ return body ? '<div class="om-sec' + (cls ? ' ' + cls : '') + '"><h4><span aria-hidden="true">' + icon + '</span> ' + title + '</h4>' + body + '</div>' : ''; }

  window.ONI_MELY = function(id, r){
    var M = window.ONI_MELY_DATA[id];
    if (!M || !r || !r.d) return '';
    var L = Object.assign({}, LV, M.szint || {});
    /* skálák, amelyekhez van szöveg */
    var rows = Object.keys(M.skalak || {}).filter(function(k){ var d = r.d[k]; return d && typeof d[1] === 'number'; })
      .map(function(k){ var d = r.d[k], sc = M.skalak[k]; return {k:k, d:d, sc:sc, lv:level(sc, d), p:pos(d)}; });
    var lvMap = {}; rows.forEach(function(x){ lvMap[x.k] = x.lv; });
    var shown = rows;
    if (M.mutat && rows.length > (M.mutat.top + M.mutat.bottom)) {
      var srt = rows.slice().sort(function(a, b){ return b.p - a.p; });
      shown = srt.slice(0, M.mutat.top).map(function(x){ x.grp = 'top'; return x; })
        .concat(srt.slice(-M.mutat.bottom).map(function(x){ x.grp = 'bot'; return x; }));
    } else {
      /* a legkiugróbb skálák elöl */
      shown = rows.slice().sort(function(a, b){ return Math.abs(b.p - .5) - Math.abs(a.p - .5); });
    }
    var cards = shown.map(function(x){
      var t = x.grp === 'top' ? (x.sc.hi || '') : x.grp === 'bot' ? (x.sc.lo || '') : (x.sc[x.lv] || x.sc.mid || '');
      var chip = x.grp === 'top' ? 'Legerősebb' : x.grp === 'bot' ? 'Leggyengébb' : L[x.lv];
      var jo = x.sc.jo || M.jo, tone = x.grp ? (x.grp === 'top' ? ' om-good' : '') : (!jo || x.lv === 'mid' ? '' : (x.lv === jo ? ' om-good' : ' om-bad'));
      return '<div class="om-scale om-' + x.lv + tone + '"><div class="om-sh"><b>' + x.d[0] + '</b><span class="om-chip">' + chip + '</span><span class="om-val">' + num(x.d[1]) +
        '<small> / ' + num(x.d[2]) + '–' + num(x.d[3]) + '</small></span></div><div class="om-bar"><i style="width:' + Math.round(x.p * 100) + '%"></i></div><p>' + t + '</p></div>';
    }).join('');
    /* személyre szabott lépések a kiugró skálákból */
    var tips = [];
    rows.slice().sort(function(a, b){ return Math.abs(b.p - .5) - Math.abs(a.p - .5); }).forEach(function(x){
      var t = x.lv === 'hi' ? x.sc.tipHi : x.lv === 'lo' ? x.sc.tipLo : null;
      if (t && tips.length < 4) tips.push('<li><strong>' + x.d[0] + ':</strong> ' + t + '</li>');
    });
    var prof = '';
    try { prof = M.profil ? ps([].concat(M.profil(r, lvMap) || [])) : ''; } catch (e) { prof = ''; }
    var steps = (tips.length ? '<p class="om-sub">A te eredményeid alapján</p><ul class="om-list">' + tips.join('') + '</ul>' : '') +
      (M.lepesek && M.lepesek.length ? (tips.length ? '<p class="om-sub">Általánosan</p>' : '') + '<ol class="om-list">' + M.lepesek.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ol>' : '');
    return '<section class="oni-mely" data-id="' + id + '">' +
      '<div class="oni-eyebrow">Mélyelemzés</div>' +
      '<h3 class="om-title">' + (M.cim || 'Mit mond ez rólad?') + '</h3>' +
      sec('📌', 'Mit jelent?', ps(M.bevezeto) + prof) +
      sec('📊', M.mutat ? 'A legerősebb és leggyengébb skáláid' : 'A te skáláid', cards ? '<div class="om-scales">' + cards + '</div>' : '') +
      sec('🌳', 'Honnan ered?', ps(M.gyoker)) +
      sec('🔄', 'Hogyan jelenik meg a mindennapokban?', ps(M.mindennap)) +
      sec('🔁', 'Miért marad fenn?', M.fennmarad ? '<p>' + M.fennmarad + '</p>' : '') +
      sec('🌱', 'Hogyan dolgozz vele?', steps) +
      sec('❓', 'Kérdések önmagadhoz', M.kerdesek && M.kerdesek.length ? '<ul class="om-list om-q">' + M.kerdesek.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="om-note">' + (M.megjegyzes ? M.megjegyzes + ' ' : '') + 'A skálánkénti szöveg aszerint választódik, hogy az eredményed a skála saját tartományának alsó, középső vagy felső harmadába esik' + (rows.some(function(x){ return x.sc.cut; }) ? ' (ahol a tesztnek van saját határértéke, azt használja)' : '') + '. Ez értelmezési segítség, nem normaadat és nem diagnózis.</p>' +
    '</section>';
  };
})();
