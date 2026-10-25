(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LVOrderExcelCore=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
 const norm=v=>clean(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function quantity(value){if(typeof value==='number')return Number.isFinite(value)&&value>0?value:null;const s=clean(value);if(!/^\+?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(s))return null;const n=Number(s.replace(',','.'));return n>0&&Number.isFinite(n)?n:null}
 function parseWorkbook(wb,X){
  const items=[],errors=[],ignored=[];let tables=0;const identities=[];
  for(const name of wb.SheetNames||[]){
   const sheet=wb.Sheets[name];if(!sheet?.['!ref'])continue;const range=X.utils.decode_range(sheet['!ref']);
   if(range.e.r>10000||range.e.c>100)throw Error('Die Excel-Liste ist zu groß. Bitte die originale Materialanforderung verwenden.');
   const data=X.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true,range:0});
   if(!data.slice(0,10).some(r=>r.some(v=>/materialanforderung/i.test(clean(v)))))continue;
   let header=null,consumer=null;
   for(let i=0;i<data.length;i++){
    const row=data[i],n=row.map(norm),no=n.findIndex(v=>/^(artikelnummer|materialnummer|material)$/.test(v)),qty=n.findIndex(v=>/^(menge|anzahl)$/.test(v)),desc=n.findIndex(v=>/^(bezeichnung|beschreibung)$/.test(v));
    if(no>=0&&qty>=0&&desc>=0){header={no,qty,desc};consumer=null;tables++;identities.push([name,data.slice(0,i)]);continue}
    if(row.some(v=>/verbrauchsmaterial ohne nummer/i.test(clean(v)))){header=null;consumer={qty:1,desc:2};continue}
    if(!header){if(consumer&&clean(row[consumer.desc])&&norm(row[consumer.desc])!=='bezeichnung')ignored.push(`${name}, Zeile ${i+1}: ${clean(row[consumer.desc])} – ohne Artikelnummer, nicht eingebucht.`);continue}
    const article_no=clean(row[header.no]),description=clean(row[header.desc]),raw=row[header.qty];
    if(!article_no&&!description&&clean(raw)==='')continue;
    // Pos., Lager Abgang/Zugang and hidden technician tables are never amounts.
    if(!article_no){ignored.push(`${name}, Zeile ${i+1}: ${description||'Material ohne Artikelnummer'} – nicht im nummerierten Lager buchbar.`);continue}
    const amount=quantity(raw);
    if(amount===null){errors.push(`${name}, Zeile ${i+1}: Ungültige oder fehlende Anzahl für ${article_no}.`);continue}
    if(!/^[A-Za-z0-9][A-Za-z0-9_./-]{0,59}$/.test(article_no)){errors.push(`${name}, Zeile ${i+1}: Artikelnummer prüfen.`);continue}
    items.push({article_no,description,quantity:amount,sheet:name,row:i+1});
   }
  }
  if(!tables)throw Error('Keine Materialanforderung mit Menge, Artikelnummer und Bezeichnung erkannt. Bitte die exportierte Bestell-Excel verwenden.');
  if(items.length>995)throw Error('Höchstens 995 Materialpositionen pro Bestellung.');
  if(!items.length)throw Error(errors.join('\n')||'Keine nummerierten Materialpositionen mit positiver Anzahl gefunden.');
  return {items,errors,ignored,canonical:JSON.stringify({identities,items:items.map(x=>[x.article_no,x.description,x.quantity])})};
 }
 function importText(parsed){return 'IMPORTTYP: EINBUCHUNG\n'+parsed.items.map(x=>[x.article_no,String(x.quantity),x.description.replace(/[;|\t\r\n]/g,' ')||'Material'].join('\t')).join('\n')}
 return {parseWorkbook,importText,quantity};
});
