/* V88.3: Gemeinsame Prüfung der drei Startwege.
 * Der SAP-Inhalt wird anschließend durch die unveränderte CSV-Center-API validiert.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.document)root.LV883Setup=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAX_SAP=15*1024*1024,MAX_PDF=28*1024*1024;
 const MODES=Object.freeze(['none','pdf','sap']);
 function validateChoice(mode,file){
  if(!MODES.includes(mode))throw Error('Bitte eine gültige Einrichtungsart wählen.');
  if(mode==='none')return {mode,kind:'empty',file:null};
  if(!file)throw Error(mode==='sap'?'Bitte den SAPUI5-Export als CSV- oder Excel-Datei auswählen.':'Bitte die RONDO-Inventurliste als PDF auswählen.');
  const name=String(file.name||'').trim();
  if(mode==='pdf'){
   if(!/\.pdf$/i.test(name))throw Error('Bitte eine PDF-Datei auswählen.');
   if(!(file.size>0)||file.size>MAX_PDF)throw Error('Die PDF ist leer oder größer als 28 MB.');
  }else{
   if(!/\.(xlsx|xls|csv)$/i.test(name))throw Error('Bitte den SAPUI5-Export als .xlsx, .xls oder .csv auswählen.');
   if(!(file.size>0)||file.size>MAX_SAP)throw Error('Die SAP-Datei ist leer oder größer als 15 MB.');
  }
  return {mode,kind:'file',file};
 }
 function validateSapPreview(preview){
  const errors=Array.isArray(preview?.errors)?preview.errors:[];
  if(errors.length){
   const first=errors[0],detail=typeof first==='string'?first:String(first?.error||'unbekannter Fehler');
   throw Error(`${errors.length} Fehler in der SAP-Importliste (z. B. ${detail}). Bitte die Datei vor der Ersteinrichtung wie im CSV-Center korrigieren.`);
  }
  const items=Array.isArray(preview?.items)?preview.items:[];
  if(!items.length)throw Error('Der SAPUI5-Export enthält keine gültigen Materialien.');
  if(items.length>5000)throw Error('Der SAPUI5-Export enthält mehr als 5000 Positionen.');
  const seen=new Set();
  for(const item of items){
   const no=String(item?.article_no||'').trim(),key=no.toLocaleLowerCase('de-DE');
   if(!no)throw Error('Eine SAP-Materialnummer fehlt.');
   if(seen.has(key))throw Error('Doppelte Materialnummer im SAPUI5-Export: '+no);
   seen.add(key);
   const q=Number(item?.quantity);
   if(!Number.isFinite(q)||q<0)throw Error('Ungültige SAP-Bestandsmenge für '+no);
  }
  return {count:items.length,items,operation_id:preview.operation_id};
 }
 return {MODES,validateChoice,validateSapPreview};
});
