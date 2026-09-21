const C='lv60-sync-hardening-1';
const A=['./','index.html','sync_core.js','local_backend.js','manifest.webmanifest','materialanforderung_vorlage.xlsx','materialanforderung_vorlage_lang.xlsx','https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js','https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(C);await Promise.allSettled(A.map(x=>cache.add(x)));await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).pathname.startsWith('/api/'))return;
 const url=new URL(event.request.url);
 const networkFirst=event.request.mode==='navigate'||/\/(index\.html|local_backend\.js|sync_core\.js|manifest\.webmanifest)$/.test(url.pathname);
 if(networkFirst){
  event.respondWith((async()=>{try{const fresh=await fetch(event.request,{cache:'no-store'});const cache=await caches.open(C);cache.put(event.request,fresh.clone());return fresh}catch{return (await caches.match(event.request))||Response.error()}})());
 }else{
  event.respondWith((async()=>{const cached=await caches.match(event.request);if(cached)return cached;const fresh=await fetch(event.request);const cache=await caches.open(C);cache.put(event.request,fresh.clone());return fresh})());
 }
});
