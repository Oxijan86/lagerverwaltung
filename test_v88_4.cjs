'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const Setup=require('./v88_3_setup.js');
const SW=require('./service-worker.js');
const Catalog=require('./v88_2_catalog.js');
const docPath='/mnt/data/Inventurliste Lovrencic 1025.pdf';
const file=(name,size=1024)=>({name,size,arrayBuffer:async()=>new Uint8Array(size).buffer});

test('Ohne Import erstellt die Auswahl eine leere Datenbank ohne Dateipflicht',()=>{
 const empty=Setup.validateChoice('none',null);
 assert.equal(empty.mode,'none');assert.equal(empty.kind,'empty');assert.equal(empty.file,null);
 assert.deepEqual(Setup.MODES,['none','pdf','sap']);
});
test('RONDO-PDF benötigt eine echte PDF-Datei',()=>{
 assert.equal(Setup.validateChoice('pdf',file('liste.PDF')).kind,'file');
 assert.throws(()=>Setup.validateChoice('pdf',null),/PDF auswählen/);
 assert.throws(()=>Setup.validateChoice('pdf',file('datei.xlsx')),/PDF-Datei/);
 assert.throws(()=>Setup.validateChoice('pdf',file('datei.pdf',29*1024*1024)),/28 MB/);
});
test('SAPUI5 Import akzeptiert CSV, XLS, XLSX und keine andere Erweiterung',()=>{
 for(const ext of ['csv','xls','xlsx'])assert.equal(Setup.validateChoice('sap',file('sapui5.'+ext)).mode,'sap');
 assert.throws(()=>Setup.validateChoice('sap',null),/SAPUI5/);
 assert.throws(()=>Setup.validateChoice('sap',file('datei.pdf')),/xlsx/);
 assert.throws(()=>Setup.validateChoice('sap',file('datei.csv',16*1024*1024)),/15 MB/);
});
test('SAP-Vorschau aus CSV-Center-API wird nicht als eigene Buchung behandelt',()=>{
 assert.equal(Setup.validateSapPreview({items:[{article_no:'00123',quantity:0},{article_no:'A246',quantity:1.25}],errors:[],operation_id:'x'}).count,2);
 assert.throws(()=>Setup.validateSapPreview({items:[],errors:[]}),/keine gültigen/);
 assert.throws(()=>Setup.validateSapPreview({items:[{article_no:'1',quantity:-1}],errors:[]}),/Ungültige/);
 assert.throws(()=>Setup.validateSapPreview({items:[{article_no:'1',quantity:1},{article_no:'1',quantity:1}],errors:[]}),/Doppelte/);
 assert.throws(()=>Setup.validateSapPreview({items:[{article_no:'1',quantity:1}],errors:[{error:'Frei verwendbar fehlt'}]}),/Frei verwendbar fehlt/);
});
test('Keine nicht existierende Importoption zulässig',()=>{
 assert.throws(()=>Setup.validateChoice('inbook',null),/gültige Einrichtungsart/);
});
test('Script-Reihenfolge: Setup-Helfer vor V87-UI und normalem PDF/OCR',()=>{
 const html=SW.injectHtml('<html><body>Hallo</body></html>');
 assert.ok(html.includes('v88_3_setup.js'));
 assert.ok(html.indexOf('v88_2_catalog.js')<html.indexOf('v88_3_setup.js'));
 assert.ok(html.indexOf('v88_3_setup.js')<html.indexOf('v87_ui.js'));
 assert.equal(SW.injectHtml(html),html);
 assert.match(SW.CACHE_NAME,/lv88-4/);
});
test('Quellcode-Patch stellt beim ersten Einrichten drei Startwege dar',()=>{
 // Realitätsnaher Ausschnitt aus V87.1. Scanner-Zeilen erzwingen denselben Patching-Pfad.
 const code=`async function scan(file,onProgress=()=>{}){\nlet pdf=null,worker=null;try{if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');\nconst previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];\nif(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;\nawait storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});\n}finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}\n}\n`+
 `function setupPicker(){const step=$('setupStep5');if(!step||$('lv87SetupChoice'))return;
  const div=document.createElement('div');div.innerHTML=\`<div>
   <label><input type="radio" name="lv87ImportMode" value="pdf" checked> RONDO-Inventurliste (PDF) – Artikel übernehmen, anschließend <b>verbindlich zählen</b></label><br>
   <label><input type="radio" name="lv87ImportMode" value="sap"> SAP-Excel/CSV – Firmenbestände übernehmen, Inventur freiwillig</label><br>
   <label><input type="radio" name="lv87ImportMode" value="none"> Ohne Datei starten (leere Datenbank)</label>
   <div id="lv87SetupFileBox">\${makeFileInput('pdf').replace('id="lv87ChooseFile"','id="lv87SetupUpload"')}</div><p class="lv87-hint" id="lv87SetupHint">Bei der RONDO-PDF fehlen Mengen. Ohne vollständige Zählung ist der Anfangsbestand nicht verlässlich.</p>\`;
  for(const el of div.querySelectorAll('[name=lv87ImportMode]'))el.onchange=()=>{const mode=div.querySelector('[name=lv87ImportMode]:checked').value;$('lv87SetupFileBox').innerHTML=mode==='none'?'':makeFileInput(mode==='pdf'?'pdf':'sap').replace('id="lv87ChooseFile"','id="lv87SetupUpload"');$('lv87SetupHint').textContent=mode==='pdf'?'Die Inventur muss durchgeführt werden, kann aber unterbrochen und später fortgesetzt werden.':mode==='sap'?'SAP-Mengen werden als Anfangsbestand übernommen. Eine anschließende Inventur ist freiwillig.':'Ohne Dateiangaben bleiben Artikel und Bestände leer. Manuelle Einrichtung ist möglich.'};
  const original=window.completeFirstSetup;if(typeof original==='function'&&!original._lv87){
   window.completeFirstSetup=async function(){const mode=div.querySelector('[name=lv87ImportMode]:checked')?.value||'pdf';const file=$('lv87SetupUpload')?.files[0];
    if(mode!=='none'&&!file)return alert('Bitte die Datei für den gewählten Importweg auswählen.');
    if(file&&mode==='pdf'&&!/\\.pdf$/i.test(file.name))return alert('Bitte eine RONDO-PDF auswählen.');
    try{await original();const status=await window.api('/api/setup/status');if(status?.setup_required)throw Error('Bitte zuerst die Ersteinrichtung erfolgreich abschließen.');await onboarding(mode,file)}catch(e){console.error(e);alert('Einrichtung konnte nicht vollständig abgeschlossen werden: '+e.message)};
   };window.completeFirstSetup._lv87=true;
  }
 }
 async function annualCard(){};
`;
 const patched=SW.patchV87Ui(code);
 assert.match(patched,/LV883_SETUP_3WAYS/,'Startauswahl muss wirklich im gelieferten V87-Quellcode geändert werden');
 assert.match(patched,/value="none" checked/);
 assert.match(patched,/validateChoice\(mode,file\)/);
 assert.match(patched,/mode==='sap'/);
 assert.match(patched,/company-import\/file-preview/);
 assert.doesNotMatch(patched,/value="pdf" checked/);
 assert.equal(SW.patchV87Ui(patched),patched,'Patch darf nicht doppelt erfolgen');
 // Der Testausschnitt enthält ein absichtlich syntaktisch falsches continue ohne Schleife.
 // Hier deshalb nur die Setup-spezifische statische Transformation prüfen.
});
test('Original-RONDO-Import von V88.2 ist weiterhin unverändert vorhanden',async t=>{
 const pages=Catalog.pages();assert.equal(pages.length,72);assert.equal(pages.flatMap(p=>p.positions).length,719);
 if(fs.existsSync(docPath)){
  const bytes=fs.readFileSync(docPath);
  const match=await Catalog.scanKnown({name:'Inventurliste Lovrencic 1025.pdf',size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer});
  assert.ok(match);assert.equal(match.reviewRequired,76);
 }else t.diagnostic('Original-PDF im uploadfreien Testordner nicht verfügbar');
});
test('Version und PWA-Cache stimmen überein',()=>{
 const root=__dirname;
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 assert.match(manifest.name,/88\.4/);
 assert.match(fs.readFileSync(path.join(root,'v88_ocr.js'),'utf8'),/88\.4/);
 assert.match(fs.readFileSync(path.join(root,'service-worker.js'),'utf8'),/lv88-4/);
});

const Review=require('./v88_3_review.js');
test('OCR-Zeile ist mit exakter Artikelnummer sofort in vorhandener DB erkennbar',()=>{
 const items=[{article_no:'11006138',description:'Sicherungsklemme SP = 10mm',unit:'Stk.'},{article_no:'11006139',description:'Anderes Material'}];
 const match=Review.candidates({article_no:'11006138',description:'Sicherungsklemme SP = 10mm'},items);
 assert.equal(match[0].article.article_no,'11006138');assert.equal(match[0].exact,true);
});
test('OCR-Zahlendreher schlägt vorhandenen Artikel vor, aber korrigiert ihn nicht automatisch',()=>{
 const scanned={article_no:'1100613B',description:'Sicherungsklemme SP = 10mm',verified:false};
 const candidate=Review.candidates(scanned,[{article_no:'11006138',description:'Sicherungsklemme SP = 10mm'}]);
 assert.equal(candidate[0].article.article_no,'11006138');assert.equal(candidate[0].exact,false);
 assert.equal(scanned.article_no,'1100613B');assert.equal(scanned.verified,false);
});
test('Übernahme eines DB-Stamms korrigiert nur OCR-Zeile, nicht Lagerbestand',()=>{
 const master={article_no:'11006138',description:'Sicherungsklemme SP = 10mm',unit:'Stk.',stock:8};
 const scan={article_no:'1100613B',description:'Sicherungsklemme SP = 10mm',verified:false};
 Review.adopt(scan,master,[scan],0,n=>/^\d{8}$/.test(n));
 assert.equal(scan.verified,true);assert.equal(scan.article_no,'11006138');assert.equal(scan.description,master.description);
 assert.equal(master.stock,8);
});
test('Manuelle Bestätigung geschieht unmittelbar in derselben Zeile',()=>{
 const row={article_no:'11006138',description:'Sicherungsklemme SP = 10mm',verified:false};
 Review.approve(row,[row],0,n=>/^\d{8}$/.test(n));assert.equal(row.verified,true);assert.ok(row.checked_at);
});
test('Doppelte Artikelnummer bleibt gesperrt statt stillschweigend zusammengeführt',()=>{
 const rows=[{article_no:'11006138',description:'X',verified:false},{article_no:'11006138',description:'Y',verified:false}];
 assert.equal(Review.duplicates(rows).size,2);
 assert.throws(()=>Review.approve(rows[0],rows,0,()=>true),/mehrfach/);
 assert.throws(()=>Review.adopt(rows[0],{article_no:'11006138',description:'X'},rows,0,()=>true),/schon einer anderen/);
});
test('Sammelbestätigung nur bei exakter Nummer und starker Bezeichnungsübereinstimmung',()=>{
 const db=[{article_no:'11006138',description:'Sicherungsklemme SP 10mm'},{article_no:'11006139',description:'Feder groß'}];
 const rows=[{article_no:'11006138',description:'Sicherungsklemme SP 10mm',verified:false},{article_no:'1100613B',description:'Sicherungsklemme SP 10mm',verified:false},{article_no:'11006139',description:'Schrauben M8',verified:false}];
 assert.equal(Review.batchEligible(rows[0],db,rows,0),true);
 assert.equal(Review.batchEligible(rows[1],db,rows,1),false);
 assert.equal(Review.batchEligible(rows[2],db,rows,2),false);
});
test('Die UI-Bibliothek für Zeilenprüfung wird vor V87 geladen und im Script-Patch aufgerufen',()=>{
 const s=SW.injectHtml('<html><body>Prüfung</body></html>');
 assert.ok(s.indexOf('v88_3_review.js')>=0);
 assert.ok(s.indexOf('v88_3_review.js')<s.indexOf('v87_ui.js'));
 const js=SW.patchV87Ui(`async function scan(file,onProgress=()=>{}){let pdf=null,worker=null;try{if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');\nconst previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});}finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}}\nasync function renderReview(){dialog(\`<p>Materialpositionen</p>\`,'RONDO-Artikel prüfen');\n  $('lv87ReviewFilter').value=reviewFilter;for(const el of $('lv87ModalBody').querySelectorAll('[data-v87-row]'))el.addEventListener('change',e=>{const r=state.rows[Number(e.target.dataset.v87Row)];r[e.target.dataset.field]=e.target.value.trim();r.verified=Core.validNo(r.article_no)&&!!r.description;saveReviewLater();});}`);
 assert.match(js,/LV883_ROW_REVIEW/);
 assert.match(js,/LV883Review\?\.enhance/);
 assert.match(js,/r\.verified=false;saveReviewLater\(\)/);
 assert.doesNotMatch(js,/pdf\.numPages!==72/);
});
test('Reale 719 PDF-Zeilen bleiben nach Ergänzung der Prüflogik vorhanden',()=>{
 const pages=Catalog.pages(),rows=pages.flatMap(x=>x.positions);
 assert.equal(rows.length,719);
 const suspicious=rows.filter(r=>r.verified===false);
 assert.equal(suspicious.length,76);
});

const Export=require('./v88_4_export.js');
const Help=require('./v88_4_help.js');
test('PDF-Zwischenstand druckt gezählt 0 und lässt leere Mengen tatsächlich frei',()=>{
 const rows=[{key:'1:1',article_no:'11006138',description:'A',unit:'Stk.',verified:true},
  {key:'1:2',article_no:'11006139',description:'B',unit:'Stk.',verified:true},
  {key:'1:3',article_no:'11006140',description:'C',unit:'Stk.',verified:true}];
 const inv={items:[{article_no:'11006138',counted_stock:0},{article_no:'11006139',counted_stock:'4'},{article_no:'11006140',counted_stock:null}]};
 const result=Export.buildPrintData(rows,inv,(x,unit)=>{assert.equal(unit,'Stk.');return Number(x)});
 assert.equal(result.printed,2);assert.equal(result.blank,1);
 assert.deepEqual(result.quantities,{'1:1':0,'1:2':4});
});
test('PDF-Zwischenstand darf ungeprüfte OCR-Nummern nicht mit Mengen bestempeln',()=>{
 const x=Export.buildPrintData([{key:'1:1',article_no:'11006138',verified:false},{key:'1:2',article_no:'11006139',verified:true}],
  {items:[{article_no:'11006138',counted_stock:5},{article_no:'11006139',counted_stock:7}]},Number);
 assert.deepEqual(x.quantities,{'1:2':7});assert.equal(x.uncertain.length,1);
});
test('Doppelte PDF-Materialnummer darf nicht denselben Gesamtbestand mehrfach drucken',()=>{
 const x=Export.buildPrintData([{key:'1:1',article_no:'1000',verified:true},{key:'2:1',article_no:'1000',verified:true}],
  {items:[{article_no:'1000',counted_stock:4}]},Number);
 assert.equal(x.printed,0);assert.equal(x.repeated.length,2);
});
test('PDF Ausgabe wird nach Abschluss gekennzeichnet, ohne Abschluss-Operation',()=>{
 const f=Export.filename('completed','Inventur Jahr 2026','2026-11-18');
 assert.match(f,/Abgeschlossen_Inventur_Jahr_2026_2026-11-18\.pdf/);
 assert.match(Export.planStatus({status:'draft'}, {printed:4,total:8,blank:4}),/Lagerbestände noch unverändert/);
 assert.match(Export.planStatus({status:'completed'}, {printed:8,total:8,blank:0}),/endgültige Zählwerte/);
 const js=fs.readFileSync(path.join(__dirname,'v88_4_export.js'),'utf8');
 assert.ok(!js.includes('/api/inventory-v75/commit'));
 assert.ok(!js.includes('inventory.finalize('));
});
test('Hilfe erklärt drei Startwege, Zwischenstand, nachträglichen Download und Bestandsschutz',()=>{
 const text=Help.topics.flatMap(t=>[t.title,...t.body]).join(' ').toLowerCase();
 for(const term of ['ohne import','sapui5','rondo','zwischenstand','abgeschlossen','bestände','sicherung'])assert.ok(text.includes(term),term);
});
test('Service-Worker lädt PDF und Hilfe vor der V87-UI sowie Versionsstand 88.4',()=>{
 const html=SW.injectHtml('<html><body>Inventur</body></html>');
 for(const f of ['v88_4_export.js','v88_4_help.js']){
  assert.ok(html.includes(f));assert.ok(html.indexOf(f)<html.indexOf('v87_ui.js'));
 }
 assert.match(SW.CACHE_NAME,/lv88-4/);
 const core=fs.readFileSync(path.join(__dirname,'v88_ocr.js'),'utf8');assert.ok(core.includes('88.4'));
});
test('Service-Worker Quelltext ersetzt alten Export durch V88.4 sicher ohne doppelte Buchung',()=>{
 const stub=`async function scan(file,onProgress=()=>{}){let pdf=null,worker=null;try{\nconst previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];\nif(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;\nawait storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});\n}finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}}\n`+
  `async function exportFilled(){try{const inv=window.LVInventory.current();if(!await window.LVInventory.save())throw Error('Save');await post('/api/inventory-v75/commit',{});}catch(e){alert(e.message)}}\n function csvDownload(name,headers,rows){}\n`+
  `async function install(){fastInventory();await installTransfers();helpCard();observeInventoryCompletion();}`;
 const patched=SW.patchV87Ui(stub);
 assert.match(patched,/LV884_PDF_SNAPSHOT_EXPORT/);
 assert.match(patched,/window\.LV884Export\.run/);
 assert.match(patched,/LV884_HELP_INSTALL/);
 assert.doesNotMatch(patched,/post\('\/api\/inventory-v75\/commit'/);
 assert.equal(SW.patchV87Ui(patched),patched,'nicht doppelt patchen');
});
test('RONDO-PDF-Druckpositionierung korrigiert y-Zeilenabstand und Mengenspalte',()=>{
 const old=`async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false){
const statusY=(250.0+39.35*(pos-1))*scale,qtyY=(256.6+39.35*(pos-1))*scale;
ctx.fillRect(73*scale,(statusY-9)*1,120*scale,11*scale);
ctx.fillText('Gezählt',75*scale,statusY);
ctx.fillText(String(val).replace('.',','),270*scale,qtyY-2*scale);
    const jpeg=await new Promise((res,rej)=>cv.toBlob(`;
 const patched=SW.patchV87Pdf(old);
 assert.match(patched,/LV884_PDF_GEOMETRY_PATCH/);
 assert.match(patched,/292\.8\+45\.4/);
 assert.match(patched,/305\*scale/);
 assert.doesNotMatch(patched,/250\.0\+39\.35/);
 assert.equal(SW.patchV87Pdf(patched),patched);
});


test('RONDO-PDF: Name des Zählers und heutiges Datum, Signatur bleibt leer',()=>{
 const Export=require('./v88_4_export.js');
 assert.equal(Export.formatTodayDE(new Date(2026,10,18,23,59)),'18.11.2026');
 assert.equal(Export.formatTodayDE(new Date(2027,0,1)),'01.01.2027');
 assert.deepEqual(Export.printMeta(' Tobias Lovrencic ',new Date(2026,10,18)),{counter:'Tobias Lovrencic',date:'18.11.2026'});
 assert.throws(()=>Export.printMeta(' '),/Zählers/);
 const js=fs.readFileSync(path.join(__dirname,'v88_4_export.js'),'utf8');
 assert.match(js,/api\('\/api\/masterdata'\)/);
 assert.match(js,/id=\"lv884PdfCounter\"/);
 assert.match(js,/\(\)=>stopped,metadata\)/);
 assert.doesNotMatch(js,/inventory\.finalize/);
});

test('PDF-Renderfunktion ergänzt Zähler/Datum auf jeder Seite, ohne Signaturstempel',()=>{
 const source=`async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false){
const statusY=(250.0+39.35*(pos-1))*scale,qtyY=(256.6+39.35*(pos-1))*scale;
ctx.fillRect(73*scale,(statusY-9)*1,120*scale,11*scale);
ctx.fillText('Gezählt',75*scale,statusY);
ctx.fillText(String(val).replace('.',','),270*scale,qtyY-2*scale);
    const jpeg=await new Promise((res,rej)=>cv.toBlob(`;
 const patched=SW.patchV87Pdf(source);
 assert.match(patched,/meta=\{\}/);
 assert.match(patched,/counter=String\(meta\?\.counter/);
 assert.match(patched,/day=String\(meta\?\.date/);
 assert.match(patched,/89\*px,734\*px/);
 assert.match(patched,/89\*px,746\*px/);
 assert.doesNotMatch(patched,/fillText\('Signatur'/);
 assert.equal(SW.patchV87Pdf(patched),patched);
});
