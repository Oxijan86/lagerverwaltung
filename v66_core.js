(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVV66Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const STOCK_COLUMNS=['Artikelnummer','Bezeichnung','Istbestand','Mindestbestand','Sollbestand','Lagerort','Maschine/Maschinenzuordnung','Aktionen'];
 function technicianChoice(current,available,defaultTechnician){
  const list=(available||[]).map(x=>typeof x==='string'?x:x?.name).filter(Boolean);
  if(current&&list.includes(current))return current;
  if(defaultTechnician&&list.includes(defaultTechnician))return defaultTechnician;
  return list[0]||defaultTechnician||'Techniker';
 }
 function m365UnknownCreationPlan(source,quantity){
  const q=Math.max(0,Number(quantity)||0);
  return {initial_stock:q,book_after_creation:String(source)==='service',suppress_delivery_booking:String(source)==='delivery'};
 }
 function normalizeMachineIds(ids){return [...new Set((ids||[]).map(Number).filter(x=>Number.isInteger(x)&&x>0))].sort((a,b)=>a-b)}
 function mergeDraft(previous,next){return {...(previous||{}),...(next||{}),machine_ids:next&&'machine_ids'in next?normalizeMachineIds(next.machine_ids):normalizeMachineIds(previous?.machine_ids||[])}}
 function sameIds(a,b){a=normalizeMachineIds(a);b=normalizeMachineIds(b);return a.length===b.length&&a.every((x,i)=>x===b[i])}
 return {STOCK_COLUMNS,technicianChoice,m365UnknownCreationPlan,normalizeMachineIds,mergeDraft,sameIds};
});
