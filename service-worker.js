/* Lagerverwaltung Lovrencic V88.0 – vollständiges Update des bestehenden V86/V87-Repos.
 * Das bisherige index.html wird beim Abruf um die bereits im Repo befindlichen
 * V87-Module und um die V88-OCR-Prüfung ergänzt. Die DB bleibt unverändert.
 */
'use strict';
const CACHE_NAME='lv88-2026-11-18-ocr-2pass-v1';
const FILES=[
 './','index.html','manifest.webmanifest','v87_core.js','v87_pdf.js','v87_ui.js','v88_ocr.js',
 'inventory_core.js','inventory_ui.js','inventory_v84_core.js','inventory_v85_core.js',
 'inventory_company_v86.js','service_pdf_core.js','service_pdf_reader.js','service_pdf_ui.js',
 'service_pdf_backend.js','local_backend.js','app_rules.js','auth_core.js','sync_core.js',
 'warehouse_core.js','warehouse_ui.js','v66_core.js','v67_core.js','v68_core.js','v69_core.js',
 'sync_ui_v81.js','sync_ui_v82.js','sync_merge_v81.js','sync_merge_v82.js',
 'material_booking_v83_core.js','material_booking_v83_ui.js','stock_bins_v86.js',
 'stock_bins_v86_ui.js',
 'vendor/pdfjs/pdf.min.mjs','vendor/pdfjs/pdf.worker.min.mjs',
 'vendor/tesseract/tesseract.min.js','vendor/tesseract/worker.min.js'
];
const ADDONS=[
 ['vendor/tesseract/tesseract.min.js','Tesseract'],
 ['v87_core.js','LV87Core'],
 ['v87_pdf.js','LV87PDF'],
 ['v87_ui.js','LV87'],
 ['v88_ocr.js','LV88OCR']
];
function injectHtml(html){
 let out=String(html);
 if(!/<\/body\s*>/i.test(out))return out;
 if(out.includes('data-lv88-boot='))return out;
 const extra=ADDONS.filter(([src])=>!new RegExp('<script\\b[^>]*\\bsrc=["\\\']'+src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\']','i').test(out))
   .map(([src])=>'<script src="'+src+'" defer></script>').join('\n');
 // Nicht direkt im head einhängen: Das vollständige V86-App-Gerüst muss vorliegen.
 return out.replace(/<\/body\s*>/i,'\n<!-- Lagerverwaltung V88.0: unveränderte V86-Funktionen + V87 + V88 -->\n<span data-lv88-boot="1" hidden></span>\n'+extra+'\n</body>');
}
function patchV87Ui(source){
 const orig=String(source);
 if(!orig.includes('async function scan(file,onProgress=()=>{})')||orig.includes('/* LV88_V87_UI_PATCH */'))return orig;
 let out=orig;
 const edits=[
  [
   'let pdf=null,worker=null;',
   'let pdf=null,worker=null,previous=null,pages=[],lastSavedCount=0;'
  ],[
   "const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];",
   "previous=await getPdf().catch(()=>null);pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length===(x.page===pdf.numPages?9:10)&&x.positions.every(r=>r.verified!==false)):[];"
  ],[
   'if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))',
   'if(pages.some(x=>x.page===n&&x.positions?.length===(n===pdf.numPages?9:10)&&x.positions.every(r=>r.verified!==false)))'
  ],[
   "await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});",
   "if(n%4===0||n===pdf.numPages){await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});lastSavedCount=pages.length;}"
  ],[
   'finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}',
   'finally{if(pages.length>lastSavedCount)try{await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()})}catch(e){console.warn("V88: letzter OCR-Zwischenstand nicht speicherbar",e)};if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}'
  ]
 ];
 for(const [before,after] of edits){
  if(!out.includes(before))return orig;
  out=out.replace(before,after);
 }
 const guard="if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');";
 if(out.includes(guard))out=out.replace(guard,guard+"if(pdf.numPages!==72)throw Error('Diese RONDO-Inventurliste muss 72 Seiten umfassen. Bitte das richtige Dokument auswählen.');");
 return '/* LV88_V87_UI_PATCH */\n'+out;
}
async function shapeResponse(response,pathname,navigation){
 if(!response||!response.ok)return response;
 if(navigation)return withV88Html(response);
 if(!pathname.endsWith('/v87_ui.js'))return response;
 const code=patchV87Ui(await response.text());
 const headers=new Headers(response.headers);headers.delete('content-length');
 headers.set('content-type','application/javascript; charset=utf-8');
 return new Response(code,{status:response.status,statusText:response.statusText,headers});
}
async function withV88Html(response){
 if(!response||!response.ok)return response;
 const ct=response.headers.get('content-type')||'';
 if(!ct.includes('html'))return response;
 const html=injectHtml(await response.text());
 const h=new Headers(response.headers);h.delete('content-length');
 h.set('content-type','text/html; charset=utf-8');
 return new Response(html,{status:response.status,statusText:response.statusText,headers:h});
}
if(typeof self!=='undefined'&&self.addEventListener){
 self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await Promise.allSettled([...new Set(FILES)].map(file=>cache.add(file)));
  await self.skipWaiting();
 })()));
 self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await Promise.all((await caches.keys()).filter(k=>/^lv(?:\d|[-_])/i.test(k)&&k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
 })()));
 self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  const navigation=req.mode==='navigate';
  const networkFirst=navigation||/\.(?:html|js|mjs|webmanifest)$/.test(url.pathname);
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   const shape=async raw=>shapeResponse(raw,url.pathname,navigation);
   if(networkFirst){
    try{
     const fetched=await fetch(req,{cache:'no-store'});
     if(fetched.ok){const shaped=await shape(fetched);await cache.put(req,shaped.clone());return shaped}
     const older=await cache.match(req)||(navigation&&(await cache.match('./')||await cache.match('index.html')));return older?shape(older):fetched;
    }catch{
     const old=await cache.match(req)||await caches.match(req)||(navigation&&(await cache.match('./')||await cache.match('index.html')));
     return old?shape(old):Response.error();
    }
   }
   const old=await cache.match(req)||await caches.match(req);
   if(old)return old;
   try{const fresh=await fetch(req);if(fresh.ok)await cache.put(req,fresh.clone());return fresh}
   catch{return Response.error()}
  })());
 });
}
if(typeof module==='object'&&module.exports)module.exports={injectHtml,patchV87Ui,FILES,CACHE_NAME};
