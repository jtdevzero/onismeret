/* Önismereti térképek — szimbolikus térképek: számítások.
   Csillagászati pozíciók: astronomy-engine (assets/vendor, MIT). Tropikus zodiákus, a dátum valódi ekliptikájára.
   Minden számítás a böngészőben fut; a születési adatok csak itt tárolódnak (onismeret-birth-v1). */
(function(){
  var A = window.Astronomy;
  var DEG = Math.PI / 180, mod = function(x, m){ return ((x % m) + m) % m; };

  /* ── Idő: helyi falióra-idő → UTC egy IANA-időzónában (Intl), vagy rögzített UTC-eltéréssel ── */
  function tzOffsetMin(tz, utcMs){
    var f = new Intl.DateTimeFormat('en-US', {timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'});
    var p = {}; f.formatToParts(new Date(utcMs)).forEach(function(x){ p[x.type] = +x.value; });
    var asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
    return Math.round((asUtc - utcMs) / 60000);
  }
  function toUtc(y, m, d, h, mi, zone){
    var wall = Date.UTC(y, m - 1, d, h, mi);
    if (typeof zone === 'number') return new Date(wall - zone * 60000);
    if (zone === 'local') return new Date(y, m - 1, d, h, mi);
    var g = wall - tzOffsetMin(zone, wall) * 60000;
    g = wall - tzOffsetMin(zone, g) * 60000;
    return new Date(g);
  }

  /* ── Pozíciók ── */
  function lonOf(body, t){
    if (body === 'Moon') return mod(A.EclipticGeoMoon(t).lon, 360);
    if (body === 'Sun') return mod(A.SunPosition(t).elon, 360);
    var v = A.RotateVector(A.Rotation_EQJ_ECT(t), A.GeoVector(body, t, true));
    return mod(A.SphereFromVector(v).lon, 360);
  }
  function ascMc(t, lat, lon){
    var ramc = mod(A.SiderealTime(t) * 15 + lon, 360) * DEG, e = A.e_tilt(t).tobl * DEG, f = lat * DEG;
    var asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(e) + Math.tan(f) * Math.sin(e))) / DEG;
    var mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(e)) / DEG;
    return {asc: mod(asc, 360), mc: mod(mc, 360)};
  }
  /* ellenőrzéshez: egy ekliptikai pont magassága és azimutja a megfigyelőnél */
  function horizonOfEcl(t, lat, lon, L){
    var e = A.e_tilt(t).tobl * DEG, l = L * DEG;
    var ra = mod(Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l)) / DEG, 360) / 15, dec = Math.asin(Math.sin(l) * Math.sin(e)) / DEG;
    var h = A.Horizon(t, new A.Observer(lat, lon, 0), ra, dec, null);
    return {alt: h.altitude, az: h.azimuth};
  }
  var SIGN = function(L){ return Math.floor(mod(L, 360) / 30); };
  function degIn(L){ var x = mod(L, 30); return {d: Math.floor(x), m: Math.floor((x - Math.floor(x)) * 60), cusp: x < 1 || x > 29}; }

  /* ── Kínai holdújév: a 11. hónap az a holdhónap, amely a téli napfordulót tartalmazza (kínai idő, UTC+8, naptári nap szerint);
     az újév két holdhónappal később kezdődik. (A ritka szökőhónapos éveket, pl. 2033, nem kezeli.) ── */
  function cnDay(ms){ return Math.floor((ms + 8 * 3600000) / 86400000); }
  function chineseNewYear(Y){
    var sol = A.Seasons(Y - 1).dec_solstice, sd = cnDay(sol.date.getTime());
    var nm = A.SearchMoonPhase(0, sol.AddDays(-31), 40), nx = A.SearchMoonPhase(0, nm.AddDays(1), 40);
    while (cnDay(nx.date.getTime()) <= sd) { nm = nx; nx = A.SearchMoonPhase(0, nm.AddDays(1), 40); }
    var ny = A.SearchMoonPhase(0, nx.AddDays(1), 40), cn = new Date(ny.date.getTime() + 8 * 3600000);
    return {y: cn.getUTCFullYear(), m: cn.getUTCMonth() + 1, d: cn.getUTCDate()};
  }
  function chinese(y, m, d, hour, sunLon){
    var ny = chineseNewYear(y), before = (m < ny.m) || (m === ny.m && d < ny.d), cy = before ? y - 1 : y;
    var stem = mod(cy - 4, 10);
    return {cy: cy, animal: mod(cy - 4, 12), element: Math.floor(stem / 2), yang: stem % 2 === 0,
      month: mod(Math.floor(mod(sunLon - 315, 360) / 30) + 2, 12),            /* napszakaszok: a Tigris hónapja a Lichunnal (315°) kezdődik */
      hour: hour === null ? null : mod(Math.floor((hour + 1) / 2), 12), ny: ny};
  }

  /* ── Maja Tzolk'in (GMT-korreláció, 584283) ── */
  function jdn(y, m, d){ var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3; return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; }
  function tzolkin(y, m, d){ var k = jdn(y, m, d) - 584283; return {num: mod(3 + k, 13) + 1, sign: mod(19 + k, 20)}; }

  /* ── Védikus (sziderikus, Lahiri-ayanamsa közelítése) ── */
  function ayanamsa(t){ return 23.8531 + 0.0139638 * (t.tt / 365.25); }

  /* ── Számmisztika (püthagoraszi) ── */
  function reduce(n, keep){ while (n > 9 && !(keep && (n === 11 || n === 22 || n === 33))) n = String(n).split('').reduce(function(a, b){ return a + (+b); }, 0); return n; }
  function letters(name){ return String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, ''); }
  function lv(ch){ return (ch.charCodeAt(0) - 65) % 9 + 1; }
  function numerology(name, y, m, d, now){
    var L = letters(name), V = 'AEIOU';
    var sumOf = function(f){ return L.split('').filter(f).reduce(function(a, c){ return a + lv(c); }, 0); };
    var life = reduce(reduce(m, true) + reduce(d, true) + reduce(String(y).split('').reduce(function(a, b){ return a + (+b); }, 0), true), true);
    var out = {life: life, birthday: reduce(d, true), personalYear: reduce(reduce(m) + reduce(d) + reduce(now.getFullYear()), false)};
    if (L.length) {
      out.expression = reduce(sumOf(function(){ return true; }), true);
      out.soul = reduce(sumOf(function(c){ return V.indexOf(c) > -1; }), true);
      out.personality = reduce(sumOf(function(c){ return V.indexOf(c) < 0; }), true);
      out.maturity = reduce(life + out.expression, true);
    }
    return out;
  }

  /* ── Teljes számítás egy születési rekordból ── */
  function compute(b){
    var p = b.date.split('-').map(Number), y = p[0], m = p[1], d = p[2];
    var known = !!b.time && !b.noTime, hm = known ? b.time.split(':').map(Number) : [12, 0];
    var zone = b.zone === 'offset' ? +b.offset : (b.tz || 'local');
    var utc = toUtc(y, m, d, hm[0], hm[1], zone), t = A.MakeTime(utc);
    var bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'], pos = {};
    bodies.forEach(function(x){ pos[x] = lonOf(x, t); });
    var r = {utc: utc, t: t, known: known, pos: pos};
    if (!known) {                                                            /* ismeretlen időnél a Hold jegye a nap során változhat */
      var a = lonOf('Moon', A.MakeTime(toUtc(y, m, d, 0, 0, zone))), z = lonOf('Moon', A.MakeTime(toUtc(y, m, d, 23, 59, zone)));
      r.moonRange = SIGN(a) !== SIGN(z) ? [SIGN(a), SIGN(z)] : null;
    }
    if (known && isFinite(b.lat) && isFinite(b.lon)) { var am = ascMc(t, +b.lat, +b.lon); r.asc = am.asc; r.mc = am.mc; }
    var ay = ayanamsa(t); r.ayan = ay;
    r.vedic = {sun: mod(pos.Sun - ay, 360), moon: mod(pos.Moon - ay, 360), asc: r.asc === undefined ? null : mod(r.asc - ay, 360)};
    r.nak = Math.floor(r.vedic.moon / (360 / 27)); r.pada = Math.floor(mod(r.vedic.moon, 360 / 27) / (360 / 108)) + 1;
    r.chinese = chinese(y, m, d, known ? hm[0] : null, pos.Sun);
    r.tzolkin = tzolkin(y, m, d);
    r.num = numerology(b.name, y, m, d, new Date());
    var pts = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].map(function(x){ return SIGN(pos[x]); }).concat(r.asc === undefined ? [] : [SIGN(r.asc)]);
    r.elements = [0, 0, 0, 0]; r.modes = [0, 0, 0];
    pts.forEach(function(s){ r.elements[s % 4]++; r.modes[s % 3]++; });
    return r;
  }

  window.CSILLAG = {toUtc: toUtc, tzOffsetMin: tzOffsetMin, lonOf: lonOf, ascMc: ascMc, horizonOfEcl: horizonOfEcl, sign: SIGN, degIn: degIn,
    chineseNewYear: chineseNewYear, chinese: chinese, tzolkin: tzolkin, ayanamsa: ayanamsa, numerology: numerology, reduce: reduce, compute: compute};
})();
