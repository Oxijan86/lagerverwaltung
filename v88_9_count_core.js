/* Lagerverwaltung Lovrencic V88.9 – sichere Addition je Lagerort.
 * Rein funktional / unabhängig von Datenbank und Browser testbar.
 * Änderungen an der realen Lagerdatei werden AUSSCHLIESSLICH beim
 * ausdrücklichen Inventurabschluss durch inventory_core.js vorgenommen.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LV889CountCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const nonempty=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
 const round=n=>Math.round(n*1e8)/1e8;
 const key=p=>JSON.stringify([Number(p?.warehouse_id)||null,String(p?.location||'').trim().toLocaleLowerCase('de-DE')]);
 function parseParts(raw){
  if(!nonempty(raw))return [];
  let list;try{list=JSON.parse(raw)}catch{throw Error('Gespeicherte Lagerort-Teilmengen sind beschädigt. Bitte zuerst überprüfen.');}
  if(!Array.isArray(list)||list.length>80)throw Error('Ungültige Anzahl gespeicherter Lagerort-Teilmengen.');
  const found=new Set();
  return list.map(p=>{
   const q=Number(p?.quantity),item={warehouse_id:Number(p?.warehouse_id)||null,location:String(p?.location||'').trim(),quantity:q};
   if(!Number.isFinite(q)||q<0)throw Error('Ungültige gespeicherte Lagerort-Menge.');
   if(found.has(key(item)))throw Error('Doppelter Lagerort im gespeicherten Zählstand.');
   found.add(key(item));return item;
  });
 }
 function sum(list){return round(list.reduce((v,p)=>v+p.quantity,0));}
 function plan(row,amount,requestedPlace){
  if(!row||!amount||!Number.isFinite(amount.old)||!Number.isFinite(amount.delta)||amount.delta<=0||
      !Number.isFinite(amount.total)||Math.abs(round(amount.old+amount.delta)-amount.total)>1e-7)
   throw Error('Ungültige zusätzliche Zählmenge.');
  const counted=nonempty(row.counted_stock),parts=parseParts(row.bin_parts_json);
  if(parts.length && (!counted||Math.abs(sum(parts)-amount.old)>1e-7))
   throw Error('Die gespeicherten Lagerort-Teilmengen passen nicht zum bisherigen Gesamtzählstand. Bitte zuerst überprüfen.');
  const explicit=requestedPlace&&(
   String(requestedPlace.location||'').trim()||Number(requestedPlace.warehouse_id)||0)
    ? {warehouse_id:Number(requestedPlace.warehouse_id)||null,location:String(requestedPlace.location||'').trim()} : null;
  // Bei mehreren vorhandenen Zählorten oder mehreren bestehenden Lagerfächern
  // darf ein neuer Fund niemals einem Lagerort erraten werden.
  if(!explicit&&(parts.length>1||(row.stock_bins||[]).length>1))
   throw Error('Dieser Artikel hat mehrere Lagerorte. Bitte oben den aktuellen Zählbereich (Lager und Lagerort) auswählen.');
  const prior={warehouse_id:Number(row.warehouse_id)||null,location:String(row.location||'').trim()};
  if(!parts.length&&!explicit&&!prior.location&&!prior.warehouse_id)
   return {total:amount.total,delta:amount.delta,parts:[],summary:'Noch ohne Lagerort',newPlace:false};
  const target=explicit||(parts.length===1?{warehouse_id:parts[0].warehouse_id,location:parts[0].location}:prior);
  if(!parts.length && amount.old>0){
   // Bisherigen Zählort erhalten, auch wenn er noch keinen Lagerort hatte.
   // Keine stillschweigende Umbuchung der alten Menge auf den neu gewählten Ort.
   parts.push({...prior,quantity:amount.old});
  }
  // Ohne einen zugeordneten Standort muss eine normale Ein-Ort-Zählung möglich bleiben.
  // Sobald ein Standort ausgewählt ist, werden zusätzliche Teilmengen gespeichert.
  if(!parts.length && !target.location && !target.warehouse_id){
   return {total:amount.total,delta:amount.delta,parts:[],summary:'Noch ohne Lagerort',newPlace:false};
  }
  const found=parts.find(p=>key(p)===key(target));
  if(found)found.quantity=round(found.quantity+amount.delta);
  else parts.push({...target,quantity:amount.delta});
  if(parts.length>80)throw Error('Zu viele Lagerorte für einen Artikel (maximal 80).');
  if(Math.abs(sum(parts)-amount.total)>1e-7)throw Error('Lagerort-Teilmengen und Gesamtzählstand stimmen nicht überein.');
  return {total:amount.total,delta:amount.delta,parts,
   summary:describe(parts),newPlace:!found&&counted,location:target.location||'ohne Lagerort'};
 }
 function describe(raw){
  const parts=typeof raw==='string'?parseParts(raw):Array.isArray(raw)?raw:[];
  return parts.map(p=>`${p.location||'Ohne Lagerort'}${p.warehouse_id?' (Lager '+p.warehouse_id+')':''}: ${Number(p.quantity).toLocaleString('de-DE',{maximumFractionDigits:8})}`).join(' · ');
 }
 return {plan,parseParts,describe,hasCount:nonempty};
});
