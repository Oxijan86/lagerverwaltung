'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const SW=require('./service-worker.js');
const C=require('./v88_2_catalog.js');
const OCR=require('./v88_ocr.js');
const DIR=__dirname;
const PDF=path.resolve(DIR,'../Inventurliste Lovrencic 1025.pdf');
const pdfBytes=fs.existsSync(PDF)?fs.readFileSync(PDF):null;
function file(bytes,name='Inventurliste Lovrencic 1025.pdf'){
 return {name,size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};
}
const checkIds=p=>p.flatMap(x=>x.positions.map(r=>r.article_no));

test('Datei hat genau 72 Seiten, 719 Positionen, ohne erfundene Zählmengen',()=>{
 const pages=C.pages();assert.equal(pages.length,72);
 assert.equal(pages[0].positions.length,10);assert.equal(pages[71].positions.length,9);
 assert.equal(pages.flatMap(p=>p.positions).length,719);
 assert.ok(pages.flatMap(p=>p.positions).every(x=>x.counted_stock===null));
});
test('Alle Zeilen haben eindeutige Materialnummern, Bezeichnungen und Einheit',()=>{
 const items=C.pages().flatMap(x=>x.positions),ids=checkIds(C.pages());
 assert.equal(new Set(ids).size,719);
 assert.ok(items.every(x=>/^(?=.*\d)[A-Z0-9][A-Z0-9_/-]{3,24}$/.test(x.article_no)));
 assert.ok(items.every(x=>x.description.trim().length>0));
 assert.ok(items.every(x=>['Stk.','m','L'].includes(x.unit)));
});
test('V88.2: 76 unklare OCR-Ergebnisse bleiben unbestätigt, niemals stillschweigend sicher',()=>{
 const uncertain=C.pages().flatMap(p=>p.positions).filter(r=>!r.verified);
 assert.equal(uncertain.length,76);
 assert.ok(uncertain.every(r=>r.warning.length>5));
});
test('Seite 1 und 72 entsprechen Stichproben der eingescannten Originalbelege',()=>{
 const pages=C.pages();
 assert.equal(pages[0].beleg,'100021289');assert.equal(pages[71].beleg,'100021490');
 assert.equal(pages[0].positions[0].article_no,'11006138');
 assert.equal(pages[0].positions[1].article_no,'11006489');
 assert.equal(pages[0].positions[9].article_no,'11006636');
 assert.equal(pages[71].positions[0].article_no,'5040');
 assert.equal(pages[71].positions[8].article_no,'7000');
});
test('Besonders schlecht erkennbare Originalseiten wurden visuell ergänzt',()=>{
 const pages=C.pages();
 assert.equal(pages[7].positions[7].article_no,'GE038250220A');
 assert.equal(pages[7].positions[8].article_no,'GE062190010A');
 assert.equal(pages[7].positions[9].article_no,'GE063580020A');
 assert.equal(pages[60].positions[7].article_no,'11415');
 assert.equal(pages[9].positions[1].description,'Spindel');
 assert.equal(pages[16].positions[9].description,'Dichtungsgummi');
});
test('Exakter SHA-256-Dateiabgleich mit dem Original: echter 72-Seiten-Import',async(t)=>{
 if(!pdfBytes)return t.skip('Originaldatei muss nur im Entwicklungstest vorhanden sein');
 const r=await C.scanKnown(file(pdfBytes),()=>{});
 assert.ok(r);assert.equal(r.hash,C.SHA256);
 assert.equal(r.source,'verified-file-catalog-v88.2');
 assert.equal(r.pages.length,72);
 assert.equal(r.pages.flatMap(p=>p.positions).length,719);
 assert.equal(r.reviewRequired,76);
 assert.ok(r.bytes.byteLength>3_000_000);
});
test('Ähnliche aber geänderte PDF wird NICHT fälschlich für Original gehalten',async(t)=>{
 if(!pdfBytes)return t.skip('Nur mit Originaldatei auszuführen');
 const bytes=Buffer.from(pdfBytes);bytes[bytes.length-300]^=1;
 const r=await C.scanKnown(file(bytes),()=>{});
 assert.equal(r,null);
});
test('Fremde PDF-Datei wird NICHT auf den festen Katalog umgeleitet',async()=>{
 const b=Buffer.from('%PDF-1.4\nexample\n');
 assert.equal(await C.scanKnown(file(b,'andere.pdf'),()=>{}),null);
});
test('PDF-Rückgabe ist nach voneinander unabhängigen Aufrufen unverändert',()=>{
 const first=C.pages(),second=C.pages();
 first[0].positions[0].article_no='XXXX';
 first[0].positions[0].counted_stock=42;
 assert.equal(second[0].positions[0].article_no,'11006138');
 assert.equal(second[0].positions[0].counted_stock,null);
});
test('Service Worker lädt Catalog VOR V87 UI und bewahrt alte Funktionen',()=>{
 const html='<html><body><script src="app.js"></script></body></html>';
 const transformed=SW.injectHtml(html);
 assert.ok(transformed.includes('v87_core.js'));
 assert.ok(transformed.indexOf('v88_2_catalog.js')<transformed.indexOf('v87_ui.js'));
 assert.ok(transformed.indexOf('v87_ui.js')<transformed.indexOf('v88_ocr.js'));
 assert.equal(SW.injectHtml(transformed),transformed);
 assert.match(SW.CACHE_NAME,/lv88-2/);
});
test('Scanner-Patch prüft zuerst den Hash und fällt für andere PDF auf den alten Scan zurück',()=>{
 const source=`async function scan(file,onProgress=()=>{}){
 if(!file||!/\\.pdf$/i.test(file.name))throw Error('PDF nötig');
 const hash='x',bytes=new Uint8Array();const task={destroy:async()=>{}};let pdf=null,worker=null;
 try{
 pdf={numPages:72};if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');
 const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];
 for(let n=1;n<=pdf.numPages;n++){
 if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;
 await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});
 }
 return pages;
 }finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}
 }`;
 const code=SW.patchV87Ui(source);
 assert.match(code,/LV882_EXACT_PDF_FAST_PATH/);
 assert.match(code,/if\(known\)return known/);
 assert.match(code,/n%4===0/);
 assert.doesNotThrow(()=>new vm.Script(code));
 assert.equal(SW.patchV87Ui(code),code);
});
test('Browser-Version und Manifest tragen durchgehend V88.2',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(DIR,'manifest.webmanifest'),'utf8'));
 assert.match(m.name,/88\.2/);
 assert.match(fs.readFileSync(path.join(DIR,'v88_ocr.js'),'utf8'),/88\.2/);
 assert.match(fs.readFileSync(path.join(DIR,'service-worker.js'),'utf8'),/88\.2/);
});
test('Original-Datei existiert nur zur Auswahl; ZIP enthält keinen Lagerbestand und keine private PDF',()=>{
 const files=fs.readdirSync(DIR);
 assert.ok(!files.some(f=>/\.pdf$|\.sqlite$|\.db$/i.test(f)));
 assert.ok(files.includes('v88_2_catalog.js'));
});
test('Bei PDF-Archivierung bleibt Wortpositionswarnung erhalten',()=>{
 const r=C.pages().flatMap(p=>p.positions);
 assert.ok(r.some(x=>x.warning.includes('OCR-Ergebnisse widersprechen sich')));
 assert.ok(r.some(x=>x.warning.includes('nur einmal erkannt')));
});
test('Alte unvollständige V88.1-Scans werden nicht vor dem Katalog bevorzugt',()=>{
 const s="async function scan(file,onProgress=()=>{}){\n"+
  "let pdf=null,worker=null;try{if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');"+
  "const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];"+
  "if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;"+
  "await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});"+
  "state.rows=previous?.hash===result.hash&&previous?.edited?.length?previous.edited:reviewed.rows;"+
  "}finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}}";
 const patch=SW.patchV87Ui(s);
 assert.match(patch,/previous\?\.source==='verified-file-catalog-v88\.2'/);
 assert.match(patch,/previous\?\.edited\?\.length===719/);
});
