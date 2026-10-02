(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVV69Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';

 const REQUIRED_HEADERS=['Material','Bezeichnung zum Material','Lagerort','Bezeichnung des Lagerorts','Frei verwendbar'];
 function text(v){return String(v??'').replace(/^\uFEFF/,'').trim()}
 function normalizedHeader(v){return text(v).toLowerCase().replace(/\s+/g,' ')}
 function parseQty(value){
  if(value===null||value===undefined)return {valid:false,empty:true,value:null};
  if(typeof value==='number')return Number.isFinite(value)?{valid:true,empty:false,value}:{valid:false,empty:false,value:null};
  let s=text(value);if(!s)return {valid:false,empty:true,value:null};
  if(/^=\".*\"$/.test(s))s=s.slice(2,-1).replace(/\"\"/g,'\"');
  s=s.replace(/\s/g,'');
  // German company files use comma decimals. Also accept decimal point, but do not guess from unrelated columns.
  if(/^[-+]?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(s))s=s.replace(/\./g,'').replace(',','.');
  else if(/^[-+]?\d+(?:,\d+)?$/.test(s))s=s.replace(',','.');
  else if(!/^[-+]?\d+(?:\.\d+)?$/.test(s))return {valid:false,empty:false,value:null};
  const n=Number(s);return Number.isFinite(n)?{valid:true,empty:false,value:n}:{valid:false,empty:false,value:null};
 }
 function articleText(value){
  let s=text(value);
  if(/^=\".*\"$/.test(s))s=s.slice(2,-1).replace(/\"\"/g,'\"');
  return s;
 }
 function findHeaderRow(rows){
  for(let i=0;i<Math.min(rows.length,20);i++){
   const row=(rows[i]||[]).map(normalizedHeader);
   const map={};
   for(const h of REQUIRED_HEADERS){const ix=row.indexOf(normalizedHeader(h));if(ix>=0)map[h]=ix}
   if(Object.keys(map).length===REQUIRED_HEADERS.length)return {index:i,map};
  }
  return null;
 }
 function parseCompanyRows(rows){
  const header=findHeaderRow(rows||[]);
  if(!header)return {items:[],errors:[{line:1,error:'Die Firmenüberschriften wurden nicht vollständig gefunden.'}],duplicates:[],header:null};
  const items=[],errors=[],duplicates=[];const seen=new Map();
  for(let r=header.index+1;r<(rows||[]).length;r++){
   const row=rows[r]||[];
   if(!row.some(v=>text(v)!==''))continue;
   const article_no=articleText(row[header.map['Material']]);
   const description=text(row[header.map['Bezeichnung zum Material']]);
   const company_location=articleText(row[header.map['Lagerort']]);
   const company_location_description=text(row[header.map['Bezeichnung des Lagerorts']]);
   const qty=parseQty(row[header.map['Frei verwendbar']]);
   const line=r+1;
   if(!article_no){errors.push({line,article_no:'',error:'Material/Artikelnummer ist leer.'});continue}
   if(!qty.valid){errors.push({line,article_no,error:qty.empty?'Frei verwendbar ist leer.':'Frei verwendbar enthält keine gültige Menge.'});continue}
   const key=article_no.toLocaleLowerCase('de-DE');
   if(seen.has(key)){
    const first=seen.get(key);const d={line,article_no,error:`Doppelte Artikelnummer; bereits in Zeile ${first}.`};errors.push(d);duplicates.push(d);continue;
   }
   seen.set(key,line);
   items.push({line,article_no,description,quantity:qty.value,company_location,company_location_description});
  }
  return {items,errors,duplicates,header};
 }
 function escapeCsv(v){return `"${String(v??'').replace(/"/g,'""')}"`}
 function deNumber(v){const n=Number(v);if(!Number.isFinite(n))return '';return String(n).replace('.',',')}
 function companyCsv(rows,location='1025',locationDescription='Lovrencic Tobias'){
  const header=REQUIRED_HEADERS;
  const body=(rows||[]).map(x=>[
   articleText(x.article_no),String(x.description??''),String(location??''),String(locationDescription??''),deNumber(x.stock)
  ]);
  return '\uFEFF'+[header,...body].map(r=>r.map(escapeCsv).join(';')).join('\r\n');
 }
 function previewCompanyItems(parsed,articleMap,mode,processedLookup){
  const out=[];const errors=[...(parsed.errors||[])];
  for(const x of parsed.items||[]){
   const a=articleMap.get(String(x.article_no));
   const processed=processedLookup?processedLookup(x):null;
   const appStock=a?Number(a.stock||0):null;
   let planned=null,error='';
   if(mode==='inventory'){if(Number(x.quantity)<0)error='Für Inventur/Bestandsabgleich darf der Vergleichsbestand nicht negativ sein.';planned=a?Number(x.quantity)-appStock:Number(x.quantity);}
   else if(mode==='inbook'){
    if(!(Number(x.quantity)>0))error='Für Einbuchungen muss die Zugangsmenge größer als 0 sein.';
    planned=Number(x.quantity);
   }else error='Unbekannter Importmodus.';
   if(error)errors.push({line:x.line,article_no:x.article_no,error});
   out.push({...x,article_id:a?.id||0,app_stock:appStock,planned_change:planned,status:processed?'processed':(a?'known':'unknown'),processed:!!processed,error});
  }
  return {items:out,errors};
 }
 return {REQUIRED_HEADERS,parseQty,articleText,findHeaderRow,parseCompanyRows,companyCsv,previewCompanyItems};
});
