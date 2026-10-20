/* Önismereti térképek — KÖZÖS TESZTNYILVÁNTARTÁS. Egy teszt = egy sor; minden lista ebből készül
   (közös mag: IDKEY, VERS · adatlapok: link, bizonyítékszint · összegzés · főoldal · válaszséma · tesztek).
   Mezők:
     id     a teszt azonosítója (ONI.save első paramétere)
     key    a válaszok localStorage-kulcsa
     card   a főoldali kártya data-key értéke (általában = key; a saját tárolású teszteknél @név)
     cat    témakör (az összegzés csoportosítása)
     name   megjelenített név
     link   oldal és fül
     n      kérdésszám a főoldali haladásjelzőhöz
     ev     bizonyítékszint: valid | model | pop | own (tests-data.js: ONI_EV_LABEL)
     badge  főoldali státuszcímke: valid | check | part | own | frame
     v      kérdéssor- (q), pontozás- (s) és fordításverzió (t). Ha a tételek, a pontozás vagy a magyar
            szöveg érdemben változik, emeld a megfelelő számot, és írj bejegyzést a valtozasok.html-be.
   Új teszt: egy sor ide + a kérdőív (src/hubs/*.tests.js) + főoldali kártya; utána build, schema, npm test. */
(function(g){
g.ONI_REG=[
 // Test-tudatosság
 {id:'maia2',key:'maia2-responses-v2',card:'maia2-responses-v2',cat:'Test-tudatosság',name:'MAIA-2 · Interocepció',link:'maia2.html',n:37,ev:'valid',badge:'valid',v:{q:2,s:2,t:1}},
 {id:'tas',key:'tas-20-responses-v1',card:'tas-20-responses-v1',cat:'Test-tudatosság',name:'TAS-20 · Alexitímia',link:'terkepek.html#test-tas',n:20,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'des',key:'des-2-responses-v1',card:'des-2-responses-v1',cat:'Test-tudatosság',name:'DES-II · Disszociáció',link:'funkcio.html#test-des',n:28,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Kötődés és séma
 {id:'ecr',key:'ecr-r-responses-v1',card:'ecr-r-responses-v1',cat:'Kötődés és séma',name:'ECR-R · Kötődés',link:'terkepek.html#test-ecr',n:36,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'kotodes',key:'attachment_assessment_v1',card:'@kotodes',cat:'Kötődés és séma',name:'Kötődési mélytérkép',link:'kotodes-melyterkep.html',n:60,ev:'own',badge:'own',v:{q:1,s:1,t:1}},
 {id:'ysq',key:'ysq_autosave',card:'@ysq',cat:'Kötődés és séma',name:'YSQ-L · Korai sémák',link:'ysq.html',n:244,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'smi',key:'smi-responses-v1',card:'smi-responses-v1',cat:'Kötődés és séma',name:'SMI · Séma-módok',link:'terkepek.html#test-smi',n:65,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'ssss',key:'ssss-responses-v1',card:'ssss-responses-v1',cat:'Kötődés és séma',name:'SSSS · Szexuális önkép',link:'attitudok.html#test-ssss',n:27,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Szex-funkció
 {id:'sisses',key:'sis-ses-responses-v1',card:'sis-ses-responses-v1',cat:'Szex-funkció',name:'SIS/SES · Duál kontroll',link:'sis-ses.html',n:45,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'iief',key:'iief-responses-v1',card:'iief-responses-v1',cat:'Szex-funkció',name:'IIEF-15 · Férfi funkció',link:'funkcio.html#test-iief',n:15,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'pedt',key:'pedt-responses-v1',card:'pedt-responses-v1',cat:'Szex-funkció',name:'PEDT · Ejakuláció',link:'funkcio.html#test-pedt',n:5,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'sdi',key:'sdi-2-responses-v1',card:'sdi-2-responses-v1',cat:'Szex-funkció',name:'SDI-2 · Vágy',link:'funkcio.html#test-sdi',n:14,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Szex-attitűdök
 {id:'nsss',key:'nsss-responses-v1',card:'nsss-responses-v1',cat:'Szex-attitűdök',name:'NSSS · Elégedettség',link:'attitudok.html#test-nsss',n:20,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'saq',key:'saq-responses-v1',card:'saq-responses-v1',cat:'Szex-attitűdök',name:'SAQ · Szexuális tudatosság',link:'attitudok.html#test-saq',n:36,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Kapcsolati nyelvek
 {id:'love',key:'love-responses-v1',card:'love-responses-v1',cat:'Kapcsolati nyelvek',name:'Szeretetnyelvek',link:'nyelvek.html#test-love',n:30,ev:'pop',badge:'frame',v:{q:1,s:1,t:1}},
 {id:'apo',key:'apo-responses-v1',card:'apo-responses-v1',cat:'Kapcsolati nyelvek',name:'Bocsánatkérési nyelvek',link:'nyelvek.html#test-apo',n:20,ev:'pop',badge:'frame',v:{q:1,s:1,t:1}},
 {id:'imago',key:'imago-responses-v1',card:'imago-responses-v1',cat:'Kapcsolati nyelvek',name:'Imágó',link:'nyelvek.html#test-imago',n:57,ev:'pop',badge:'frame',v:{q:1,s:1,t:1}},
 // Személyiség
 {id:'bf',key:'bf-responses-v1',card:'bf-responses-v1',cat:'Személyiség',name:'Big Five · IPIP-NEO-60',link:'szemelyiseg.html#test-bf',n:60,ev:'model',badge:'part',v:{q:1,s:1,t:1}},
 {id:'via',key:'via-responses-v1',card:'via-responses-v1',cat:'Személyiség',name:'VIA-72 · Karakter-erők',link:'szemelyiseg.html#test-via',n:72,ev:'model',badge:'part',v:{q:1,s:1,t:1}},
 // Kapcsolati dinamika
 {id:'las',key:'las-responses-v1',card:'las-responses-v1',cat:'Kapcsolati dinamika',name:'LAS-SF · Szeretetstílus',link:'kapcsolat.html#test-las',n:24,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'tki',key:'conflict-responses-v1',card:'conflict-responses-v1',cat:'Kapcsolati dinamika',name:'Konfliktusmódok',link:'kapcsolat.html#test-tki',n:25,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'gott',key:'gottman-responses-v1',card:'gottman-responses-v1',cat:'Kapcsolati dinamika',name:'Gottman-térkép',link:'kapcsolat.html#test-gott',n:32,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'fti',key:'fisher-responses-v1',card:'fisher-responses-v1',cat:'Kapcsolati dinamika',name:'Fisher-temperamentum',link:'kapcsolat.html#test-fti',n:40,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 // Értékek, cselekvés, ritmus
 {id:'pvq',key:'pvq21-responses-v1',card:'pvq21-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'PVQ-21 · Értékek',link:'cselekves.html#test-pvq',n:21,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'ft',key:'four-tendencies-responses-v1',card:'four-tendencies-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'Négy tendencia',link:'cselekves.html#test-ft',n:12,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'kolbe',key:'action-modes-responses-v1',card:'action-modes-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'Cselekvési módok',link:'cselekves.html#test-kolbe',n:24,ev:'model',badge:'own',v:{q:1,s:1,t:1}},
 {id:'meq',key:'meq-responses-v1',card:'meq-responses-v1',cat:'Értékek, cselekvés, ritmus',name:'MEQ · Kronotípus',link:'cselekves.html#test-meq',n:19,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 // Szabályozás és végrehajtás
 {id:'ips',key:'ips-responses-v1',card:'ips-responses-v1',cat:'Szabályozás és végrehajtás',name:'IPS · Halogatás',link:'szabalyozas.html#test-ips',n:9,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'ders',key:'ders-sf-responses-v1',card:'ders-sf-responses-v1',cat:'Szabályozás és végrehajtás',name:'DERS-SF · Érzelemszabályozás',link:'szabalyozas.html#test-ders',n:18,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'scs',key:'scs-sf-responses-v1',card:'scs-sf-responses-v1',cat:'Szabályozás és végrehajtás',name:'SCS-SF · Önegyüttérzés',link:'szabalyozas.html#test-scs',n:12,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 {id:'tfeq',key:'tfeq-r18-responses-v1',card:'tfeq-r18-responses-v1',cat:'Szabályozás és végrehajtás',name:'TFEQ-R18 · Evési viselkedés',link:'szabalyozas.html#test-tfeq',n:18,ev:'valid',badge:'valid',v:{q:1,s:1,t:1}},
 // Hangulat és figyelem
 {id:'asrs',key:'asrs-responses-v1',card:'asrs-responses-v1',cat:'Hangulat és figyelem',name:'ASRS v1.1 · Felnőttkori ADHD-tünetek',link:'allapot.html#test-asrs',n:18,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'phq9',key:'phq9-responses-v1',card:'phq9-responses-v1',cat:'Hangulat és figyelem',name:'PHQ-9 · Lehangoltság',link:'allapot.html#test-phq9',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'gad7',key:'gad7-responses-v1',card:'gad7-responses-v1',cat:'Hangulat és figyelem',name:'GAD-7 · Szorongás',link:'allapot.html#test-gad7',n:7,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Önbizalom és önértékelés
 {id:'rses',key:'rses-responses-v1',card:'rses-responses-v1',cat:'Önbizalom és önértékelés',name:'RSES · Önértékelés',link:'onbizalom.html#test-rses',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'gse',key:'gse-responses-v1',card:'gse-responses-v1',cat:'Önbizalom és önértékelés',name:'GSE · Énhatékonyság',link:'onbizalom.html#test-gse',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'bfne',key:'bfne2-responses-v1',card:'bfne2-responses-v1',cat:'Önbizalom és önértékelés',name:'BFNE-II · Ítélettől való félelem',link:'onbizalom.html#test-bfne',n:12,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'obgy',key:'onbizalom-gyak-responses-v1',card:'onbizalom-gyak-responses-v1',cat:'Önbizalom és önértékelés',name:'Gyakorlati önbizalom',link:'onbizalom.html#test-obgy',n:20,ev:'own',badge:'own',v:{q:1,s:1,t:1}},
 // Jóllét és stressz
 {id:'who5',key:'who5-responses-v1',card:'who5-responses-v1',cat:'Jóllét és stressz',name:'WHO-5 · Jóllét',link:'jollet.html#test-who5',n:5,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'pss',key:'pss10-responses-v1',card:'pss10-responses-v1',cat:'Jóllét és stressz',name:'PSS-10 · Észlelt stressz',link:'jollet.html#test-pss',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'cbi',key:'cbi-responses-v1',card:'cbi-responses-v1',cat:'Jóllét és stressz',name:'CBI · Kiégés',link:'jollet.html#test-cbi',n:13,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'brs',key:'brs-responses-v1',card:'brs-responses-v1',cat:'Jóllét és stressz',name:'BRS · Reziliencia',link:'jollet.html#test-brs',n:6,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Kapcsolódás, értelem, jelenlét
 {id:'ucla',key:'ucla3-responses-v1',card:'ucla3-responses-v1',cat:'Kapcsolódás, értelem, jelenlét',name:'UCLA-3 · Magányosság',link:'ertelem.html#test-ucla',n:3,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'mlq',key:'mlq-responses-v1',card:'mlq-responses-v1',cat:'Kapcsolódás, értelem, jelenlét',name:'MLQ · Az élet értelme',link:'ertelem.html#test-mlq',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'maas',key:'maas-responses-v1',card:'maas-responses-v1',cat:'Kapcsolódás, értelem, jelenlét',name:'MAAS · Tudatos jelenlét',link:'ertelem.html#test-maas',n:15,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Alvás és test
 {id:'sci',key:'sci-responses-v1',card:'sci-responses-v1',cat:'Alvás és test',name:'SCI · Alvásminőség',link:'alvas.html#test-sci',n:8,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'ess',key:'ess-responses-v1',card:'ess-responses-v1',cat:'Alvás és test',name:'Epworth · Nappali álmosság',link:'alvas.html#test-ess',n:8,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'bas',key:'bas2-responses-v1',card:'bas2-responses-v1',cat:'Alvás és test',name:'BAS-2 · Testkép',link:'alvas.html#test-bas',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Munka és célok
 {id:'uwes',key:'uwes9-responses-v1',card:'uwes9-responses-v1',cat:'Munka és célok',name:'UWES-9 · Munkahelyi bevonódás',link:'munka.html#test-uwes',n:9,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'grit',key:'grit-responses-v1',card:'grit-responses-v1',cat:'Munka és célok',name:'Grit-S · Kitartás',link:'munka.html#test-grit',n:8,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'saps',key:'saps-responses-v1',card:'saps-responses-v1',cat:'Munka és célok',name:'SAPS · Perfekcionizmus',link:'munka.html#test-saps',n:8,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Havi állapot
 {id:'pulse',key:'pulse-responses-v1',card:'pulse-responses-v1',cat:'Havi állapot',name:'Havi állapotfelmérés',link:'havi.html#test-pulse',n:20,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Erőforrások
 {id:'swls',key:'swls-responses-v1',card:'swls-responses-v1',cat:'Erőforrások',name:'SWLS · Élettel való elégedettség',link:'eroforras.html#test-swls',n:5,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'lotr',key:'lotr-responses-v1',card:'lotr-responses-v1',cat:'Erőforrások',name:'LOT-R · Optimizmus',link:'eroforras.html#test-lotr',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'gq6',key:'gq6-responses-v1',card:'gq6-responses-v1',cat:'Erőforrások',name:'GQ-6 · Hála',link:'eroforras.html#test-gq6',n:6,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'bpns',key:'bpnsfs-responses-v1',card:'bpnsfs-responses-v1',cat:'Erőforrások',name:'BPNSFS · Alapszükségletek',link:'eroforras.html#test-bpns',n:24,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 // Szokások és önkontroll
 {id:'audit',key:'audit-responses-v1',card:'audit-responses-v1',cat:'Szokások és önkontroll',name:'AUDIT · Alkoholfogyasztás',link:'szokasok.html#test-audit',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'sas',key:'sassv-responses-v1',card:'sassv-responses-v1',cat:'Szokások és önkontroll',name:'SAS-SV · Telefonhasználat',link:'szokasok.html#test-sas',n:10,ev:'valid',badge:'check',v:{q:1,s:1,t:1}},
 {id:'bscs',key:'bscs-responses-v1',card:'bscs-responses-v1',cat:'Szokások és önkontroll',name:'BSCS · Önkontroll',link:'szokasok.html#test-bscs',n:13,ev:'valid',badge:'check',v:{q:1,s:1,t:1}}
];
})(typeof window!=='undefined'?window:globalThis);
