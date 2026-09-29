/* Önismereti térképek — DEMÓ PROFIL.
   Kitalált, nem valós személy adatai. Csak a memóriában él (osszegzes.html?demo=1),
   semmit nem ír a böngésző tárhelyére. Arra szolgál, hogy kitöltés nélkül is látszódjon,
   mit ad az összegzés: minták, változás, grafikon, idővonal. */
(function(){
  var DAY=864e5,now=Date.now();
  function at(daysAgo){var d=new Date(now-daysAgo*DAY);d.setHours(19,30,0,0);return d.toISOString()}
  var n=0;
  function rec(id,name,daysAgo,h,d,x){
    var t=at(daysAgo),v=window.ONI&&ONI.vOf?ONI.vOf(id):{q:1,s:1,t:1},r={n:name,d:d,t:t,done:t,qv:v.q,sv:v.s,tv:v.t,sid:'demo'+(++n)};
    if(h)r.h=h;if(x)r.x=x;return r;
  }
  function mk(names,vals,lo,hi){var o={};Object.keys(names).forEach(function(k,i){o[k]=[names[k],vals[i],lo,hi]});return o}
  var BF={O:'Nyitottság',C:'Lelkiismeretesség',E:'Extraverzió',A:'Barátságosság',N:'Érzelmi instabilitás'};
  var DERS={strat:'Korlátozott stratégiák',nonacc:'Érzelmek el nem fogadása',impulse:'Impulzuskontroll',goals:'Célirányos működés',aware:'Érzelmi tudatosság hiánya',clarity:'Érzelmi tisztánlátás hiánya'};
  var SCS={SK:'Önkedvesség',SJ:'Önítélkezés (nyers)',CH:'Közös emberi tapasztalat',IS:'Elszigeteltség (nyers)',MI:'Tudatos jelenlét',OI:'Túlazonosulás (nyers)'};
  function ders(v){var o={total:['DERS-SF összpontszám',v.reduce(function(a,b){return a+b},0),18,90]};Object.keys(DERS).forEach(function(k,i){o[k]=[DERS[k],v[i],3,15]});return o}
  function scs(tot,v){var o={total:['Önegyüttérzés (átlag)',tot,1,5]};Object.keys(SCS).forEach(function(k,i){o[k]=[SCS[k],v[i],1,5]});return o}
  var PVQ={SD:'Önirányítás',ST:'Stimuláció',HE:'Hedonizmus',AC:'Teljesítmény',PO:'Hatalom',SE:'Biztonság',CO:'Konformitás',TR:'Hagyomány',BE:'Jóindulat',UN:'Univerzalizmus'};

  function store(){
    n=0;
    return {
      ft:[rec('ft','Négy tendencia',412,'Kérdező (Questioner)',mk({U:'Megfelelő',Q:'Kérdező',O:'Kötelességtudó',R:'Lázadó'},[3,6,2,1],0,12),{primary:'Q',secondary:'U'})],
      kolbe:[rec('kolbe','Cselekvési módok',410,'Profil: 8–3–7–2',mk({ff:'Tényfeltáró',ft:'Rendszerező',qs:'Gyorsindító',im:'Megvalósító'},[8,3,7,2],1,10))],
      ecr:[
        rec('ecr','ECR-R',405,'Félelemteli',{anx:['Kötődési szorongás',4.9,1,7],avd:['Kötődési elkerülés',4.6,1,7]}),
        rec('ecr','ECR-R',220,'Szorongó',{anx:['Kötődési szorongás',4.6,1,7],avd:['Kötődési elkerülés',3.9,1,7]}),
        rec('ecr','ECR-R',34,'Szorongó',{anx:['Kötődési szorongás',4.1,1,7],avd:['Kötődési elkerülés',3.4,1,7]})
      ],
      bf:[
        rec('bf','Big Five',400,null,mk(BF,[47,31,29,44,43],12,60)),
        rec('bf','Big Five',215,null,mk(BF,[48,35,30,45,39],12,60)),
        rec('bf','Big Five',30,null,mk(BF,[49,38,31,45,36],12,60))
      ],
      pvq:[rec('pvq','PVQ-21',398,'Önirányítás, Univerzalizmus, Stimuláció',(function(){var d=mk(PVQ,[1.4,0.9,0.4,0.2,-1.1,-0.3,-0.9,-1.4,0.6,1.0],-3,3);d.ho_OC=['Nyitottság a változásra',0.9,-3,3];d.ho_SE=['Önérvényesítés',-0.45,-3,3];d.ho_CO=['Megőrzés',-0.87,-3,3];d.ho_ST=['Önmeghaladás',0.8,-3,3];return d})())],
      tki:[rec('tki','Konfliktusmódok',380,'Alapmód: Elkerülő',{comp:['Versengő',2.2,1,5],coll:['Együttműködő',3.1,1,5],compr:['Kompromisszumkereső',3.3,1,5],avoid:['Elkerülő',3.9,1,5],acc:['Alkalmazkodó',3.6,1,5],assert:['Önérvényesítés-index',-1.4,-4,4],coop:['Együttműködés-index',0.6,-4,4]})],
      meq:[
        rec('meq','Kronotípus (MEQ)',360,'Mérsékelten esti típus',{total:['MEQ-pontszám',38,16,86]}),
        rec('meq','Kronotípus (MEQ)',40,'Köztes típus',{total:['MEQ-pontszám',45,16,86]})
      ],
      ips:[
        rec('ips','Halogatás (IPS)',300,'Erős halogatás',{total:['IPS összpontszám',34,9,45]}),
        rec('ips','Halogatás (IPS)',120,'Közepes halogatás',{total:['IPS összpontszám',30,9,45]}),
        rec('ips','Halogatás (IPS)',25,'Közepes halogatás',{total:['IPS összpontszám',27,9,45]})
      ],
      ders:[
        rec('ders','DERS-SF',290,'Fő elakadás: Érzelmek el nem fogadása (közepes)',ders([9,11,7,10,6,8])),
        rec('ders','DERS-SF',110,'Fő elakadás: Érzelmek el nem fogadása (közepes)',ders([8,10,6,9,6,7])),
        rec('ders','DERS-SF',22,'Fő elakadás: Célirányos működés (enyhe)',ders([7,8,6,9,5,6]))
      ],
      scs:[
        rec('scs','SCS-SF',288,'Alacsony önegyüttérzés',scs(2.4,[2.0,3.9,2.5,3.6,2.8,3.8])),
        rec('scs','SCS-SF',20,'Közepes önegyüttérzés',scs(3.0,[2.9,3.2,3.1,3.0,3.3,3.2]))
      ],
      love:[rec('love','Szeretetnyelvek',260,'Minőségi idő',mk({A:'Elismerő szavak',B:'Minőségi idő',C:'Ajándék elfogadása',D:'Szolgálat',E:'Fizikai érintés'},[7,10,2,5,6],0,12))]
    };
  }
  function notes(){
    return {
      ecr:{demo5:{fit:['fits'],cond:['calm'],text:'Egy éve sokkal rosszabb volt. A szorongás megvan, de hamarabb észreveszem.',t:at(34)}},
      ips:{demo15:{fit:['explore'],cond:['tired'],text:'',t:at(25)}}
    };
  }
  window.ONI_DEMO={store:store,notes:notes,label:'Kitalált adatok, nem egy valós személy eredményei. Semmi nem kerül mentésre.'};
})();
