'use strict';
const CACHE='paros-v2';
const SHELL=['./','index.html','style.css?v=2','data.js?v=2','app.js?v=2','manifest.webmanifest','icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('paros-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request,u=new URL(req.url);
 if(req.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(req.mode==='navigate')e.respondWith(fetch(req).then(res=>{if(!res.ok)throw Error('navigation');return res;}).catch(()=>caches.match('index.html')));
 else e.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});
