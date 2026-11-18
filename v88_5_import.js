/* Lagerverwaltung Lovrencic V88.5 – sicherer, überprüfbarer Import der Original-RONDO-PDF.
 * Wichtig: Kein Material- oder Lagerbestands-Commit. Der katalogbasierte Import wird
 * nur nach einem exakten SHA-256-Abgleich der ORIGINALDATEI durchgeführt.
 */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root&&root.document)root.LV885Import=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const SHA256='a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b';
 const PDF_NAME=/^Inventurliste\s+Lovrencic\s+1025\.pdf$/i;
 let loadPromise=null;
 function filename(file){return String(file?.name||'').trim();}
 function knownName(file){return PDF_NAME.test(filename(file));}
 async function ensureCatalog(){
  if(root.LV882Catalog?.scanKnown)return root.LV882Catalog;
  if(!root.document)throw Error('Der PDF-Katalog benötigt einen Browser.');
  if(!loadPromise){
   loadPromise=new Promise((resolve,reject)=>{
    const script=root.document.createElement('script');
    script.src=new URL('v88_2_catalog.js?v=88.5',root.document.baseURI).href;
    script.async=false;
    script.onload=()=>root.LV882Catalog?.scanKnown?resolve(root.LV882Catalog):reject(Error('RONDO-Katalog wurde geladen, aber nicht aktiviert.'));
    script.onerror=()=>reject(Error('RONDO-Katalog konnte nicht geladen werden (offline/Cache).'));
    root.document.head.appendChild(script);
   }).catch(e=>{loadPromise=null;throw e});
  }
  return loadPromise;
 }
 async function digest(file){
  if(!root.crypto?.subtle?.digest)throw Error('Sichere Dateiprüfung fehlt. Bitte die Anwendung über HTTPS öffnen.');
  const data=await file.arrayBuffer();
  const bytes=new Uint8Array(await root.crypto.subtle.digest('SHA-256',data));
  return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
 }
 async function scan(file,onProgress=()=>{}){
  if(!file)throw Error('Bitte eine RONDO-PDF auswählen.');
  if(!/\.pdf$/i.test(filename(file)))throw Error('Bitte eine PDF-Datei wählen.');
  if(file.size>28*1024*1024)throw Error('PDF größer als 28 MB. Import abgebrochen.');
  const report=s=>{try{onProgress(s)}catch{}};
  report('V88.5: PDF-Datei wird vor der OCR geprüft …');
  const hash=await digest(file);
  if(hash===SHA256){
   report('Original-RONDO-PDF erkannt. Artikelkatalog wird geladen – Browser-OCR ist hierfür nicht erforderlich.');
   const catalog=await ensureCatalog();
   if(catalog.SHA256!==SHA256)throw Error('Der installierte Katalog gehört nicht zu dieser Programmversion. Bitte die App vollständig neu laden.');
   const result=await catalog.scanKnown(file,report);
   if(!result||result.hash!==hash||result.pages?.length!==72||result.pages.reduce((n,p)=>n+p.positions.length,0)!==719)
    throw Error('719-Positionen-Katalog konnte nicht vollständig bereitgestellt werden; keine Daten übernommen.');
   report('Original-PDF erfolgreich erkannt: 719 Artikelpositionen auf 72 Seiten. Bitte unsichere Materialnummern prüfen. Noch keine Buchung.');
   return result;
  }
  // Eine ähnliche Datei darf NIEMALS unbemerkt auf den Katalog der Originaldatei
  // übertragen werden. Ein Umbenennen ändert den Hash nicht, neue PDF-Inhalte schon.
  if(knownName(file)){
   throw Error('Die gewählte „Inventurliste Lovrencic 1025.pdf“ unterscheidet sich von der geprüften Originaldatei (SHA-256 '+hash.slice(0,12)+'… statt '+SHA256.slice(0,12)+'…). Bitte die Original-PDF verwenden. Für abweichende Dateien ist der automatische Katalog aus Sicherheitsgründen gesperrt.');
  }
  report('Andere PDF erkannt; normale OCR wird verwendet. Erkannte Zeilen müssen geprüft werden.');
  return null;
 }
 return {SHA256,PDF_NAME,knownName,ensureCatalog,digest,scan};
});
