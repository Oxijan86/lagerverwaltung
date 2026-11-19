/* Lagerverwaltung Lovrencic V88.11 – sichere Ortsbindung der Inventur-Teilmengen.
 * Kein Schreibzugriff auf die Bestandsdatenbank, nur gepruefte Plaene.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LV8811LocationCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const drafts=new Set();
 const hasCount=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
 const round=v=>Math.round(Number(v)*1e8)/1e8;
 const same=(a,b)=>Number(a?.warehouse_id||0)===Number(b?.warehouse_id||0)&&
  String(a?.location||'').trim().toLocaleLowerCase('de-DE')===String(b?.location||'').trim().toLocaleLowerCase('de-DE');
 function validPlace(place){
  const location=String(place?.location||'').trim(),warehouse_id=Number(place?.warehouse_id)||null;
  if(!location)throw Error('Bitte zuerst oben den aktuellen Zähl-Lagerort auswählen. Eine Menge ohne eindeutigen Fundort wird nicht übernommen.');
  return {warehouse_id,location};
 }
 function amount(v,unit){
  const raw=String(v??'').trim();
  if(!/^\d+(?:[.,]\d+)?$/.test(raw))throw Error('Bitte eine gültige Zählmenge eingeben.');
  const n=Number(raw.replace(',','.'));
  if(!Number.isFinite(n)||n<0||n>1e12)throw Error('Ungültige Zählmenge.');
  if(/^(?:stk\.?|stück|satz|rolle|packung|karton)$/i.test(String(unit||'').trim())&&!Number.isInteger(n))throw Error('Für Stückartikel nur ganze Mengen eingeben.');
  return n;
 }
 function parseParts(raw){
  if(!raw)return [];
  let list;try{list=JSON.parse(raw)}catch{throw Error('Lagerort-Teilmengen sind beschädigt und dürfen nicht überschrieben werden.');}
  if(!Array.isArray(list)||list.length>80)throw Error('Ungültige Lagerort-Teilmengen.');
  const seen=new Set();return list.map(p=>{
   const item={warehouse_id:Number(p?.warehouse_id)||null,location:String(p?.location||'').trim(),quantity:Number(p?.quantity)};
   if(!Number.isFinite(item.quantity)||item.quantity<0||item.quantity>1e12)throw Error('Ungültige Teilmenge.');
   const key=JSON.stringify([item.warehouse_id,item.location.toLocaleLowerCase('de-DE')]);
   if(seen.has(key))throw Error('Doppelter Lagerort innerhalb einer Teilmengen-Zählung.');seen.add(key);
   return item;
  });
 }
 function verify(parts,total){
  if(!Number.isFinite(Number(total))||Number(total)<0)throw Error('Ungültiger Gesamtzählstand.');
  const n=round(parts.reduce((s,p)=>s+Number(p.quantity),0));
  if(Math.abs(n-Number(total))>1e-7)throw Error('Lagerort-Teilmengen stimmen nicht mit dem Gesamtzählstand überein.');
  if(parts.length>80)throw Error('Zu viele Lagerorte.');
  return true;
 }
 function first(row,qty,chosen){
  if(hasCount(row?.counted_stock)&&!drafts.has(Number(row.article_id)))throw Error('Dieser Artikel wurde bereits gezählt. Bitte Weitere Menge verwenden.');
  const place=validPlace(chosen),number=amount(qty,row?.unit),previous=parseParts(row?.bin_parts_json);
  const initial=drafts.has(Number(row?.article_id))&&previous.length?previous[0]:place;
  const parts=[{warehouse_id:initial.warehouse_id,location:initial.location,quantity:number}];
  verify(parts,number);
  return {total:number,parts,firstPlace:initial};
 }
 function addition(row,delta,chosen){
  if(!hasCount(row?.counted_stock))throw Error('Bitte den Artikel zuerst im Feld „Gezählt“ erfassen.');
  const place=validPlace(chosen);
  const old=amount(row.counted_stock,row.unit),d=amount(delta,row.unit);
  if(d<=0)throw Error('Eine weitere Menge muss größer als 0 sein.');
  const parts=parseParts(row.bin_parts_json);
  if(!parts.length)throw Error('Der Erstlagerort der bisherigen '+old+' '+(row.unit||'Stk.')+' ist nicht sicher gespeichert. Bitte oben den ursprünglichen Lagerort wählen und „Erstlagerort festlegen/korrigieren“ bestätigen. Die bisherige Menge bleibt erhalten.');
  verify(parts,old);
  const target=parts.find(x=>same(x,place));
  if(target)target.quantity=round(target.quantity+d);
  else parts.push({...place,quantity:d});
  const total=round(old+d);verify(parts,total);
  return {parts,total,delta:d,old,addedNewPlace:!target,firstPlace:parts[0]};
 }
 function changeFirst(row,chosen){
  if(!hasCount(row?.counted_stock))throw Error('Dieser Artikel wurde noch nicht gezählt.');
  const place=validPlace(chosen),total=amount(row.counted_stock,row.unit),parts=parseParts(row.bin_parts_json);
  if(parts.length)verify(parts,total);
  if(!parts.length){
   const next=[{...place,quantity:total}];verify(next,total);
   return {parts:next,oldPlace:null,firstPlace:place,legacy:true,firstQuantity:total,changed:true};
  }
  const original=parts[0],oldPlace={...original};
  if(same(original,place))return {parts,oldPlace,firstPlace:place,firstQuantity:original.quantity,changed:false,legacy:false};
  const remainder=parts.slice(1);
  const match=remainder.find(x=>same(x,place));
  let next;
  if(match){
   // Ortskorrektur: die bisherige Erstmenge zum bereits gezählten Zielort addieren.
   next=[{...place,quantity:round(match.quantity+original.quantity)},...remainder.filter(x=>x!==match)];
  }else next=[{...place,quantity:original.quantity},...remainder];
  verify(next,total);
  return {parts:next,oldPlace,firstPlace:place,firstQuantity:original.quantity,changed:true,legacy:false};
 }
 function correctTotal(row,newAmount){
  const next=amount(newAmount,row.unit),parts=parseParts(row.bin_parts_json);
  if(parts.length>1)throw Error('Bei mehreren Zähl-Lagerorten bitte die Menge am jeweiligen Lagerort korrigieren, nicht die Gesamtsumme überschreiben.');
  if(!parts.length)return {parts:[],total:next};
  return {parts:[{...parts[0],quantity:next}],total:next};
 }
 function correctPart(row,chosen,newAmount){
  const place=validPlace(chosen),parts=parseParts(row?.bin_parts_json);
  if(!parts.length)throw Error('Erstlagerort zuerst festlegen.');
  verify(parts,amount(row.counted_stock,row.unit));
  const pos=parts.find(p=>same(p,place));if(!pos)throw Error('Am ausgewählten Lagerort existiert noch keine Teilzählung.');
  const before=pos.quantity,after=amount(newAmount,row.unit);pos.quantity=after;
  const total=round(parts.reduce((s,p)=>s+p.quantity,0));verify(parts,total);
  return {parts,total,before,after,place};
 }
 function status(row){
  if(!hasCount(row?.counted_stock))return 'Noch nicht gezählt';
  try{const parts=parseParts(row.bin_parts_json);return parts.length?`Erstlagerort: ${parts[0].location||'ohne Zuordnung'} · ${parts.length} Zählort(e)`:'Erstlagerort ungeprüft – bitte festlegen';}
  catch{return 'Teilmengen fehlerhaft – bitte prüfen';}
 }
 function markDraft(id,yes){if(yes)drafts.add(Number(id));else drafts.delete(Number(id));}
 return {hasCount,amount,parseParts,verify,first,addition,changeFirst,correctTotal,correctPart,status,validPlace,markDraft,isDraft:id=>drafts.has(Number(id)),same};
});
