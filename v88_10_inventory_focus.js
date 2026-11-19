/* Lagerverwaltung Lovrencic V88.11: Eingabeschutz und Zaehlort-Automatik.
   Als separater Runtime-Schutz, damit alle Wege zur Artikelauswahl sicher sind,
   auch wenn andere Module ein bereits gezaehltes Feld fokussieren.
   Keine Lagerbuchung, keine automatische Korrektur bestaetigter Mengen. */
(function(root,factory){
 'use strict';
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LV8810InventoryFocus=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
 'use strict';
 const unlocked=new Set();
 const countPresent=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
 const getRow=id=>root.LVInventory?.current?.()?.items?.find(x=>Number(x.article_id)===Number(id))||null;
 const fromCountInput=element=>{
  const match=/^inv75-count-(\d+)$/.exec(element?.id||'');
  return match?Number(match[1]):null;
 };
 const getDoc=()=>root.document;
 function isProtected(id){const row=getRow(id);return !!row&&countPresent(row.counted_stock)&&!unlocked.has(Number(id))&&!root.LV8811LocationCore?.isDraft?.(id);}
 function focusAddition(id){
  const el=getDoc()?.getElementById('inv84-add-'+id);
  if(!el||el.disabled||el.hidden)return false;
  if(getDoc().activeElement!==el)el.focus();
  if(typeof el.select==='function')el.select();
  return true;
 }
 function protectInput(input){
  const id=fromCountInput(input);
  if(id===null)return;
  if(isProtected(id)){
   input.readOnly=true;
   input.setAttribute('aria-label','Bisher gezählte Gesamtmenge – geschützt; weitere Funde unten eingeben');
   input.dataset.lv8810Protected='1';
  }else if(input.dataset?.lv8810Protected==='1'){
   input.readOnly=false;
   delete input.dataset.lv8810Protected;
  }
 }
 function protectAll(){
  ensureCorrectionWrapper();
  const doc=getDoc();if(!doc?.querySelectorAll)return;
  for(const el of doc.querySelectorAll('input[id^="inv75-count-"]'))protectInput(el);
 }
 function handleFocus(event){
  const id=fromCountInput(event.target);
  if(id===null||!isProtected(id))return;
  protectInput(event.target);
  // Direkt bei focusin umleiten, nicht auf einen bestimmten alten
  // Autocomplete-Handler oder requestAnimationFrame vertrauen.
  focusAddition(id);
 }
 function handleBeforeInput(event){
  const id=fromCountInput(event.target);
  if(id===null||!isProtected(id))return;
  event.preventDefault?.();
  focusAddition(id);
 }
 function handleInput(event){
  const id=fromCountInput(event.target);
  if(id===null||!isProtected(id))return;
  const row=getRow(id);
  if(row){event.target.value=String(row.counted_stock);}
  event.stopImmediatePropagation?.();
  focusAddition(id);
 }
 function handleFocusOut(event){
  const id=fromCountInput(event.target);
  if(id===null)return;
  if(root.LV8811LocationCore?.isDraft?.(id)){root.LV8811LocationCore.markDraft(id,false);protectInput(event.target);return;}
  if(!unlocked.has(id))return;
  unlocked.delete(id);
  protectInput(event.target);
 }
 function ensureCorrectionWrapper(){
  const inv=root.LVInventory;
  if(!inv||typeof inv.correctTotal!=='function'||inv.correctTotal._lv8810Wrapped)return;
  const original=inv.correctTotal;
  const wrapped=function(id,...args){
   const num=Number(id);
   unlocked.add(num);
   try{return original.call(this,id,...args)}
   finally{
    // Die vorhandene App fragt erst nach einer ausdruecklichen Freigabe.
    // Bei Abbrechen bleibt readonly bestehen; nur nach tatsaechlicher
    // Freigabe darf der Anwender die Gesamtmenge korrigieren.
    const field=getDoc()?.getElementById('inv75-count-'+num);
    if(!field||field.readOnly){unlocked.delete(num);if(field)protectInput(field)}
   }
  };
  wrapped._lv8810Wrapped=true;
  inv.correctTotal=wrapped;
 }
 function activateLocation(event){
  const el=event.target;
  if(el?.id!=='inv84Location'&&el?.id!=='inv84Warehouse')return;
  const chosen=String(getDoc()?.getElementById('inv84Location')?.value||'').trim();
  const warehouse=String(getDoc()?.getElementById('inv84Warehouse')?.value||'').trim();
  if(!chosen&&!warehouse)return;
  const checkbox=getDoc()?.getElementById('inv84Apply');
  if(!checkbox||checkbox.checked)return;
  checkbox.checked=true;
  // Auf bekannte Input-Auswahl folgt die normale Kontextspeicherung durch
  // inventory_ui.js; kein eigenes Stueck- oder Lagerkonto anlegen.
  root.LVInventory?.contextToggle?.();
 }
 let installed=false,observer=null;
 function install(){
  const doc=getDoc();if(!doc||installed)return false;
  installed=true;
  doc.addEventListener('focusin',handleFocus,true);
  doc.addEventListener('beforeinput',handleBeforeInput,true);
  doc.addEventListener('focusout',handleFocusOut,true);
  doc.addEventListener('input',handleInput,true);
  doc.addEventListener('change',activateLocation,true);
  protectAll();
  if(root.MutationObserver&&doc.body){
   observer=new root.MutationObserver(()=>protectAll());
   observer.observe(doc.body,{subtree:true,childList:true});
  }
  return true;
 }
 if(root.document){
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
 }
 return {countPresent,install,isProtected,focusAddition,protectAll,activateLocation,
  handleFocus,handleFocusOut,handleBeforeInput,handleInput,ensureCorrectionWrapper};
});
