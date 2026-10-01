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
  function esc(x){ return String(x == null ? '' : x).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function fmtD(t){ try { return new Date(t).toLocaleDateString('hu-HU', {year:'numeric', month:'short', day:'numeric'}); } catch (e) { return ''; } }
  function rx(){ try { return window.ONI_RULES && window.ONI ? window.ONI_RULES({store: ONI.all(), isCur: function(i, r){ return ONI.isCur(i, r); }}) : null; } catch (e) { return null; } }
  /* kedvező irány: +1 magasabb jobb, -1 alacsonyabb jobb, 0 semleges */
  function dirFor(R, id, k, M){
    var d = R ? R.dirOf(id, k) : 0; if (d) return d;
    var sc = M && M.skalak && M.skalak[k], jo = (sc && sc.jo) || (M && M.jo);
    return jo === 'hi' ? 1 : jo === 'lo' ? -1 : 0;
  }
  /* Változás az előző kitöltéshez képest (ugyanazzal a kérdésváltozattal) */
  function changeHTML(id, r, M, R){
    var h = window.ONI ? (ONI.all()[id] || []) : [];
    if (h.length < 2) return '';
    var prev = h[h.length - 2];
    if (!prev || !prev.d || (prev.qv || 1) !== (r.qv || 1)) return '';
    var out = [];
    Object.keys(r.d).forEach(function(k){
      var a = prev.d[k], b = r.d[k];
      if (!a || !b || typeof a[1] !== 'number' || typeof b[1] !== 'number') return;
      var span = (b[3] - b[2]) || 1, n = (b[1] - a[1]) / span;
      if (Math.abs(n) < 0.10) return;
      var dr = dirFor(R, id, k, M), good = dr === 0 ? null : ((n > 0) === (dr > 0));
      out.push({l: b[0], from: a[1], to: b[1], n: n, good: good});
    });
    out.sort(function(x, y){ return Math.abs(y.n) - Math.abs(x.n); });
    var head = '<p>Az előző kitöltésed: <strong>' + fmtD(prev.done || prev.t).replace(/\.$/, '') + '</strong>. A skála tartományának legalább 10%-át elérő elmozdulások:</p>';
    if (!out.length) return head.replace(' A skála tartományának legalább 10%-át elérő elmozdulások:', '') + '<p>Egyik skálád sem mozdult el jelentősen (a tartomány 10%-ánál többet). A stabilitás is információ: ha dolgoztál valamin, lehet, hogy a változás még nem látszik a kérdőívben, vagy más területen jelenik meg.</p>';
    return head + '<ul class="om-list om-change">' + out.slice(0, 8).map(function(c){
      var tag = c.good === null ? 'elmozdulás' : c.good ? 'kedvező irány' : 'kedvezőtlen irány';
      return '<li class="' + (c.good === null ? '' : c.good ? 'om-up' : 'om-down') + '"><strong>' + esc(c.l) + ':</strong> ' + num(c.from) + ' → ' + num(c.to) + ' <span class="om-tag">' + tag + '</span></li>';
    }).join('') + '</ul><p class="om-sub2">Egy-egy kitöltés között a hangulat és a körülmények is mozgatnak az eredményen. Akkor érdemes komolyan venni, ha a változás több kitöltésen át ugyanarra mutat.</p>';
  }
  /* Tesztek közti minták, amelyekben ez a teszt is jelez */
  function crossHTML(id, R){
    if (!R) return '';
    var res; try { res = R.evalRules(); } catch (e) { return ''; }
    var mine = res.fired.filter(function(f){ return f.hits.some(function(s){ return s.test === id; }); });
    var NM = window.ONI_DATA || {};
    var nm = function(t){ return (NM[t] && NM[t].n) || t; };
    if (mine.length) {
      return mine.map(function(f){
        var tests = []; f.hits.forEach(function(s){ if (tests.indexOf(s.test) < 0) tests.push(s.test); });
        return '<div class="om-cross"><b>' + (f.r.tone === 'jelleg' ? 'Jellegzetes vonás, nem probléma · ' : '') + esc(f.r.title) + '</b><p>' + f.r.text + '</p>' +
          (f.r.action ? '<p><strong>Mit tehetsz:</strong> ' + f.r.action + '</p>' : '') +
          '<p class="om-ev">Jelzések ' + tests.length + ' tesztből: ' + f.hits.map(function(s){ return esc(s.label); }).join(' · ') + '</p></div>';
      }).join('') + '<p class="om-sub2">A minták akkor jelennek meg, ha legalább két különböző teszt ugyanabba az irányba mutat. Részletek és bizonyítékok: <a href="osszegzes.html">Összegzés ›</a></p>';
    }
    /* ha még nincs minta: melyik további teszt adna összevetést */
    var cnt = {};
    R.RULES.forEach(function(rule){
      if (!rule.sig.some(function(s){ return s.test === id; })) return;
      rule.sig.forEach(function(s){ if (s.test !== id && !R.cur(s.test)) cnt[s.test] = (cnt[s.test] || 0) + 1; });
    });
    var sug = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; }).slice(0, 3);
    if (!sug.length) return '<p>A kitöltött tesztjeid alapján ennél a tesztnél jelenleg nincs olyan minta, amelyet legalább két teszt együtt jelezne. Ez nem hiány: azt jelenti, hogy ez az eredmény most önmagában értelmezendő.</p>';
    return '<p>Ennél a tesztnél még nincs tesztek közti minta. A legtöbb összevetést ezek kitöltése adná: <strong>' + sug.map(function(t){ var L = window.ONI_LINK || {}; return L[t] ? '<a href="' + L[t] + '">' + esc(nm(t)) + '</a>' : esc(nm(t)); }).join(', ') + '</strong>.</p>';
  }
  /* Normál eloszlású közelítés a közölt átlag és szórás alapján */
  function pctOf(v, m, sd){ var z = (v - m) / sd, t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
  function normHTML(sc, v){
    if (!sc.norma || typeof v !== 'number') return '';
    var p = Math.round(pctOf(v, sc.norma.m, sc.norma.sd) * 100); p = Math.max(1, Math.min(99, p));
    return '<p class="om-norm">Összevetés egy közölt mintával (' + sc.norma.src + '): az eredményed kb. a válaszadók <strong>' + p + '%-ánál</strong> magasabb. A minta nem magyar és nem reprezentatív, ezért ez tájékoztató viszonyítás.</p>';
  }
  /* Mikor érdemes szakemberhez fordulni: tesztenkénti jelzés */
  function gv(r, k){ return r.d && r.d[k] && typeof r.d[k][1] === 'number' ? r.d[k][1] : null; }
  var HELP = {
    des: function(r){ return gv(r, 'total') >= 30; },
    ders: function(r){ return gv(r, 'total') >= 60; },
    tfeq: function(r){ return gv(r, 'EE') >= 67 || gv(r, 'UE') >= 67; },
    smi: function(r){ return gv(r, 'punitive') >= 5 || gv(r, 'vuln') >= 5; },
    scs: function(r){ var t = gv(r, 'total'); return t !== null && t <= 1.8; },
    bf: function(r){ return gv(r, 'N') >= 50; },
    phq9: function(r){ return gv(r, 'total') >= 10 || (r.x && r.x.i9 > 0); },
    gad7: function(r){ return gv(r, 'total') >= 10; }
  };
  function helpHTML(id, r){
    var f = HELP[id]; try { if (!f || !f(r)) return ''; } catch (e) { return ''; }
    return '<div class="om-sec om-help"><h4><span aria-hidden="true">🆘</span> Mikor érdemes szakemberhez fordulni?</h4>' +
      '<p>Az eredményed ezen a területen erős terhelést jelez. Ez nem diagnózis, de jó jelzés arra, hogy nem kell egyedül megoldanod. Érdemes pszichológussal, pszichiáterrel vagy a háziorvosoddal átbeszélni, különösen ha a nehézség hetek óta tart, ha az alvásod, az evésed, a munkád vagy a kapcsolataid láthatóan sínylik, vagy ha reménytelenséget érzel.</p>' +
      '<p>Ha most nagyon nehéz: <strong>Lelki Elsősegély Telefonszolgálat, 116-123</strong> (ingyenes, éjjel-nappal, névtelenül hívható). Közvetlen veszélyben: <strong>112</strong>.</p></div>';
  }
  function sec(icon, title, body, cls){ return body ? '<div class="om-sec' + (cls ? ' ' + cls : '') + '"><h4><span aria-hidden="true">' + icon + '</span> ' + title + '</h4>' + body + '</div>' : ''; }

  window.ONI_MELY = function(id, r){
    var M = window.ONI_MELY_DATA[id];
    if (!M || !r || !r.d) return '';
    var L = Object.assign({}, LV, M.szint || {});
    var R = rx();
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
        '<small> / ' + num(x.d[2]) + '–' + num(x.d[3]) + '</small></span></div><div class="om-bar"><i style="width:' + Math.round(x.p * 100) + '%"></i></div><p>' + t + '</p>' + normHTML(x.sc, x.d[1]) + '</div>';
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
      helpHTML(id, r) +
      sec('🔗', 'Kapcsolódás a többi eredményeddel', crossHTML(id, R)) +
      sec('📈', 'Változás az előző kitöltés óta', changeHTML(id, r, M, R)) +
      sec('🌳', 'Honnan ered?', ps(M.gyoker)) +
      sec('🔄', 'Hogyan jelenik meg a mindennapokban?', ps(M.mindennap)) +
      sec('🔁', 'Miért marad fenn?', M.fennmarad ? '<p>' + M.fennmarad + '</p>' : '') +
      sec('🌱', 'Hogyan dolgozz vele?', steps) +
      sec('❓', 'Kérdések önmagadhoz', M.kerdesek && M.kerdesek.length ? '<ul class="om-list om-q">' + M.kerdesek.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="om-note">' + (M.megjegyzes ? M.megjegyzes + ' ' : '') + 'A skálánkénti szöveg aszerint választódik, hogy az eredményed a skála saját tartományának alsó, középső vagy felső harmadába esik' + (rows.some(function(x){ return x.sc.cut; }) ? ' (ahol a tesztnek van saját határértéke, azt használja)' : '') + '. Ez értelmezési segítség, nem normaadat és nem diagnózis.</p>' +
    '</section>';
  };
  /* Fókusz-oldal: a kedvezőtlen irányban kiugró skálák, amelyekhez van konkrét lépés */
  window.ONI_MELY_CAND = function(id, r){
    var M = window.ONI_MELY_DATA[id]; if (!M || !r || !r.d) return [];
    var R = rx(), out = [];
    Object.keys(M.skalak || {}).forEach(function(k){
      var d = r.d[k], sc = M.skalak[k]; if (!d || typeof d[1] !== 'number') return;
      var lv = level(sc, d); if (lv === 'mid') return;
      var tip = lv === 'hi' ? sc.tipHi : sc.tipLo; if (!tip) return;
      var dr = dirFor(R, id, k, M);
      if (dr && ((lv === 'hi') === (dr > 0))) return;          /* kedvező irányban kiugró: nem fókusz */
      var p = pos(d);
      out.push({key: id + ':' + k, test: id, scale: d[0], value: d[1], lo: d[2], hi: d[3], text: sc[lv] || '', action: tip, score: Math.abs(p - .5) * 2 * (dr ? 1 : .8)});
    });
    return out;
  };
})();
