/* Lagerverwaltung Lovrencic V88.7 – safe handoff from RONDO PDF review into
 * an existing draft inventory. No cancellation, no silent replacement.
 * The document capturing click handler runs BEFORE the legacy onclick handler.
 */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root){root.LV887InventoryGuard=api;if(root.document)api.install();}
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const IDS=new Set(['lv87StartCount','lv87SapCount']);
 const drafts=overview=>(overview?.sessions||[]).filter(x=>x?.status==='draft');
 function plan(overview){return drafts(overview).length?'resume':'create';}
 let running=false,scanInProgress=false;
 const $=id=>root.document?.getElementById(id);
 function notify(message,bad=false){
  const target=$('inv75Msg')||$('lv87ScanStatus');
  if(target){target.textContent=message;target.setAttribute('role','status');if(bad)target.style.color='#9b1c1c';}
  else if(bad&&typeof root.alert==='function')root.alert(message);
 }
 async function handoff(requestedName='Inventur RONDO'){
  if(running)return {kind:'busy'};
  running=true;
  try{
   if(typeof root.api!=='function'||!root.LVInventory||typeof root.LVInventory.open!=='function')
    throw Error('Inventurverwaltung ist noch nicht geladen. Bitte Anwendung vollständig neu starten.');
   // Explicitly query BEFORE any create attempt. An interrupted inventory is never
   // cancelled, archived or overwritten. Its existing session ID is retained.
   const overview=await root.api('/api/inventory-v75/index');
   const existing=drafts(overview);
   if(typeof root.show==='function')await root.show('inventory75');
   const overlay=$('lv87Modal');if(overlay)overlay.hidden=true;
   await root.LVInventory.open();
   if(existing.length){
    if(existing.length>1){
     notify(`Es gibt ${existing.length} laufende Inventuren. Bitte oben bei „Gespeicherte Inventur“ ausdrücklich die richtige Inventur auswählen und dann „Ausgewählte Inventur öffnen“ klicken. Es wurde keine neue Inventur angelegt und keine laufende beendet.`);
     $('inv75Session')?.scrollIntoView?.({block:'center'});
     return {kind:'choose',count:existing.length};
    }
    let data=root.LVInventory.current?.();
    if(!existing.some(x=>x.id===data?.session?.id)){
     const chosen=existing[0];
     const selector=$('inv75Session');
     if(!selector||typeof root.LVInventory.select!=='function')
      throw Error('Laufende Inventur gefunden, konnte aber nicht eindeutig geöffnet werden. Bitte im Inventurmenü auswählen.');
     selector.value=chosen.id;
     await root.LVInventory.select();
     data=root.LVInventory.current?.();
    }
    if(!data?.session?.id||data.session.status!=='draft'||!existing.some(x=>x.id===data.session.id))
     throw Error('Laufende Inventur wurde nicht eindeutig geladen. Bitte im Inventurmenü auswählen. Es wurde nichts neu angelegt.');
    notify(`Inventur „${data.session.name||'laufende Inventur'}“ fortgesetzt. Bereits gespeicherte Zählmengen bleiben erhalten; kein Inventurabschluss und keine Bestandsbuchung.`);
    $('inv75Search')?.focus?.();
    return {kind:'resumed',id:data.session.id};
   }
   // Check once more, because a draft may have been loaded by the UI while the
   // network response was in flight. Never create a second draft in this case.
   const now=root.LVInventory.current?.();
   if(now?.session?.status==='draft'){
    notify(`Laufende Inventur „${now.session.name||''}“ fortgesetzt. Keine neue Inventur angelegt.`);
    return {kind:'resumed',id:now.session.id};
   }
   if(typeof root.confirm==='function'&&!root.confirm('Es ist keine laufende Inventur in dieser Datenbank vorhanden. Möchtest du eine NEUE Inventur anlegen? Bereits abgeschlossene/archivierte Inventuren bleiben unverändert.'))
    return {kind:'cancelled'};
   const el=$('inv75Name');if(!el)throw Error('Inventurformular ist nicht vorhanden. Bitte die Inventur manuell öffnen.');
   el.value=requestedName;
   if(typeof root.LVInventory.create!=='function')throw Error('Inventur anlegen ist nicht möglich.');
   await root.LVInventory.create();
   const newly=root.LVInventory.current?.();
   if(newly?.session?.status!=='draft')throw Error('Neue Inventur konnte nicht gestartet werden. Bitte im Inventurmenü nachsehen.');
   notify(`Neue Inventur „${newly.session.name||requestedName}“ angelegt. Noch keine Lagerbestände verändert.`);
   return {kind:'created',id:newly.session.id};
  }catch(error){notify('Inventur konnte nicht sicher geöffnet werden: '+error.message+'. Vorhandene Zählungen bleiben erhalten.',true);return {kind:'error',message:error.message}}
  finally{running=false}
 }
 function decorateButton(button){
  if(!button||button.dataset.lv887Guard==='1')return;
  button.dataset.lv887Guard='1';
  button.textContent='Inventur sicher öffnen';
  const information=root.document.createElement('p');
  information.className='lv87-hint';information.id='lv887StartHint';
  information.textContent='Sicher: Eine bereits begonnene Inventur wird fortgesetzt. Die PDF übernimmt keine Bestände und bricht keine Inventur ab.';
  button.parentNode?.insertBefore(information,button);
  if(scanInProgress)return;
  scanInProgress=true;
  Promise.resolve(root.api?.('/api/inventory-v75/index'))
   .then(v=>{const n=drafts(v).length;button.textContent=n?'Laufende Inventur fortsetzen':'Neue Inventur starten';if(n)information.textContent=`${n} laufende Inventur${n===1?'':'en'} erkannt. Vorhandene Zählungen bleiben erhalten; es wird keine zweite Inventur angelegt.`;})
   .catch(()=>{button.textContent='Inventur sicher öffnen';})
   .finally(()=>{scanInProgress=false});
 }
 function decorate(){for(const id of IDS)decorateButton($(id));}
 function onCapturedClick(event){
  const element=event.target?.closest?.('#lv87StartCount,#lv87SapCount');
  if(!element||!IDS.has(element.id))return;
  // IMPORTANT: prevent the old handler from interpreting a rejected confirm as
  // "create another inventory". Do not call LVInventory.cancel at any point.
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  handoff(element.id==='lv87SapCount'?'Erstinventur nach SAP-Import':'Jahresinventur RONDO '+new Date().getFullYear());
 }
 let installed=false;
 function install(){
  if(installed||!root.document)return false;
  installed=true;
  root.document.addEventListener('click',onCapturedClick,true);
  const observer=new root.MutationObserver(()=>decorate());
  observer.observe(root.document.body||root.document.documentElement,{childList:true,subtree:true});
  decorate();return true;
 }
 return {plan,handoff,install};
});
