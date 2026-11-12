/* V84: Kleine, testbare Helfer fuer wiederholte Inventurzaehlungen. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LVInventoryV84Core=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const whole=new Set(['stk.','stk','stück','satz','rolle','packung','karton']);
 function quantity(value,{positive=false,unit=''}={}){
  const text=String(value??'').trim();
  if(!/^\+?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text))throw Error('Bitte eine gültige Zahl ohne Tausendertrennzeichen eingeben.');
  const v=Number(text.replace(',','.'));
  if(!Number.isFinite(v)||(positive?v<=0:v<0))throw Error(positive?'Die zusätzliche Menge muss größer als 0 sein.':'Die gezählte Menge muss mindestens 0 sein.');
  if(whole.has(String(unit||'').toLocaleLowerCase('de-DE'))&&!Number.isInteger(v))throw Error('Für diese Einheit sind nur ganze Stückzahlen erlaubt.');
  return v;
 }
 function addCount(current,extra,unit){
  const old=current===null||current===undefined||String(current).trim()===''?0:quantity(current,{unit});
  const delta=quantity(extra,{positive:true,unit});
  const total=Math.round((old+delta)*1e8)/1e8;
  if(!Number.isFinite(total)||total>1e12)throw Error('Die Gesamtmenge ist zu groß.');
  return {old,delta,total,wasCounted:current!==null&&current!==undefined&&String(current).trim()!==''};
 }
 function countContext(row,context,locations=[]){
  if(!context||!context.apply||!context.location&&!context.warehouse_id)return null;
  const name=String(context.location||'').trim();
  const found=name?locations.find(l=>String(l.name).toLocaleLowerCase('de-DE')===name.toLocaleLowerCase('de-DE')):null;
  if(name&&!found)throw Error(`Zählbereich „${name}“ ist noch nicht angelegt. Bitte zuerst „Lagerort anlegen“ wählen.`);
  const warehouseId=found?.warehouse_id||Number(context.warehouse_id)||null;
  if(found?.warehouse_id&&context.warehouse_id&&Number(found.warehouse_id)!==Number(context.warehouse_id))throw Error('Der ausgewählte Lagerort gehört zu einem anderen Lager. Bitte den Zählbereich prüfen.');
  return {location:found?.name||'',warehouse_id:warehouseId};
 }
 return {quantity,addCount,countContext};
});
