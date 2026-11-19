/* Lagerverwaltung Lovrencic V88.16 – harter Schutz gegen den historischen
 * Weissseiten-PDF-Export. Der Exportknopf wird stets vor Legacy-onclick
 * abgefangen; die ungepruefte Canvas-Rasterausgabe kann nie gestartet werden.
 * Liest RONDO-Snapshot nur aus der bestehenden IndexedDB. Stammdaten/Bestand
 * werden nur durch gesondert bestaetigte Funktionen anderer Module geaendert.
 */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root){root.LV8816ExportGuard=api;if(root.document)api.install();}
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const SAFE_SHA='a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b';
 let busy=false,installed=false;
 const $=id=>root.document.getElementById(id);
 function available(){
  return !!(root.LV884Export?.run&&root.LV886PDF?.render&&root.LV886PDF?.KNOWN_SHA===SAFE_SHA&&root.LV87Core?.checkRows&&root.LVInventory?.current);
 }
 function binary(v){return v instanceof Uint8Array?v:v instanceof ArrayBuffer?new Uint8Array(v):ArrayBuffer.isView(v)?new Uint8Array(v.buffer,v.byteOffset,v.byteLength):null;}
 function validateSnapshot(snapshot){
  const bytes=binary(snapshot?.bytes);
  if(!bytes||bytes.byteLength<1000000)throw Error('Die unveränderte RONDO-Original-PDF fehlt. Keine Weißseiten-PDF wird erzeugt. Bitte Original-PDF erneut prüfen (ohne Inventur neu zu starten).');
  if(snapshot.hash!==SAFE_SHA)throw Error('Die gespeicherte RONDO-PDF stimmt nicht mit der geprüften Originaldatei überein. Kein Export.');
  const rows=snapshot.edited?.length?snapshot.edited:root.LV87Core.checkRows(snapshot.pages).rows;
  if(!Array.isArray(rows)||rows.length!==719)throw Error('Die PDF-Zuordnung ist unvollständig. 719 Originalpositionen erwartet; nichts geändert.');
  return {bytes,rows};
 }
 function openStore(){return new Promise((resolve,reject)=>{
  const req=root.indexedDB.open('lv87-rondo-pdf',1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('snapshots'))req.result.createObjectStore('snapshots');};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });}
 async function getSnapshot(databaseId){const db=await openStore();try{return await new Promise((resolve,reject)=>{
  const req=db.transaction('snapshots','readonly').objectStore('snapshots').get(databaseId);
  req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
 });}finally{db.close()}}
 async function setSnapshot(databaseId,snapshot){const db=await openStore();try{await new Promise((resolve,reject)=>{
  const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snapshot,databaseId);
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
 });}finally{db.close()}}
 function changedRows(oldRows,newRows){
  if(!Array.isArray(newRows)||newRows.length!==oldRows.length)throw Error('Materialpositionszahl darf nicht geändert werden.');
  const changes=[];
  for(let i=0;i<oldRows.length;i++){
   const a=oldRows[i],b=newRows[i];
   if(Number(a.page)!==Number(b.page)||Number(a.position)!==Number(b.position))throw Error('RONDO-Positionen dürfen nicht verschoben werden.');
   if(String(a.article_no)!==String(b.article_no)||String(a.description)!==String(b.description)||a.verified!==b.verified||a.review_action!==b.review_action||a.manual_link!==b.manual_link||Number(a.linked_article_id||0)!==Number(b.linked_article_id||0))changes.push({before:a,after:b});
  }
  if(changes.length!==1)throw Error('Bitte immer genau eine RONDO-Position einzeln bestätigen.');
  if(changes[0].after.manual_link!==true||changes[0].after.verified!==true)throw Error('Manuelle Zuordnung muss ausdrücklich bestätigt sein.');
  return changes;
 }
 function dialog(html,title){
  let mask=$('lv87Modal');if(!mask){
   mask=root.document.createElement('div');mask.id='lv87Modal';mask.className='lv87-mask';mask.hidden=true;
   mask.innerHTML='<div class="lv87-dialog" role="dialog" aria-modal="true" aria-labelledby="lv87ModalTitle"><h2 id="lv87ModalTitle"></h2><div id="lv87ModalBody"></div><div class="lv87-flex"><button class="secondary" id="lv87Close" type="button">Zur Inventur zurück</button></div></div>';
   root.document.body.appendChild(mask);$('lv87Close').onclick=()=>{mask.hidden=true};
  }
  $('lv87ModalTitle').textContent=title||'RONDO-PDF-Ausgabe – sichere Version 88.16';
  $('lv87ModalBody').innerHTML=html;mask.hidden=false;
  return $('lv87ModalBody');
 }
 async function run(){
  if(!available())throw Error('Die sichere RONDO-PDF-Funktion ist noch nicht vollständig geladen. Bitte die App mit Version 88.16 neu starten. Alter PDF-Export wurde gesperrt.');
  if(typeof root.api!=='function')throw Error('Lagerdatenbank-Funktion fehlt. Keine PDF erzeugt.');
  const overview=await root.api('/api/inventory-v75/index'),databaseId=String(overview?.database_id||'current');
  let stored=await getSnapshot(databaseId);validateSnapshot(stored);
  // Recheck snapshot before every operation and forbid changing another database.
  const getStored=async()=>{const current=await getSnapshot(databaseId);validateSnapshot(current);return current;};
  const saveMappings=async updatedRows=>{
   const original=await getStored();
   const prior=original.edited?.length?original.edited:root.LV87Core.checkRows(original.pages).rows;
   changedRows(prior,updatedRows);
   const update={...original,edited:updatedRows.map(x=>({...x})),updated:new Date().toISOString()};
   await setSnapshot(databaseId,update);
  };
  // Keep the original safe renderer in place even if another old handler asks for it.
  if(root.LV87PDF)root.LV87PDF.render=(...args)=>root.LV886PDF.render(...args);
  return root.LV884Export.run({getStored,saveMappings,core:root.LV87Core,pdf:root.LV886PDF,
   inventory:root.LVInventory,api:root.api,dialog,confirm:message=>root.confirm(message)});
 }
 function onClick(event){
  const el=event.target?.closest?.('#lv87ExportFilled');if(!el)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  if(busy)return;
  busy=true;
  Promise.resolve().then(()=>run()).catch(e=>{
   root.alert('RONDO-PDF-Export sicherheitshalber angehalten:\n'+(e?.message||e)+'\n\nDie vorhandene Inventur wurde nicht geändert.');
  }).finally(()=>busy=false);
 }
 function install(){
  if(installed||!root.document)return false;
  installed=true;root.document.addEventListener('click',onClick,true);
  return true;
 }
 return {SAFE_SHA,available,validateSnapshot,changedRows,run,install,onClick};
});
