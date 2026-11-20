/* Lagerverwaltung Lovrencic V88.19 – sicherer Import, Prüf-Rückstellung und Original-PDF-Overlay und sichere Inventurfortsetzung des bestehenden V86/V87-Repos.
 * Das bisherige index.html wird beim Abruf um die bereits im Repo befindlichen
 * V87-Module und um die V88-OCR-Prüfung ergänzt. Die DB bleibt unverändert.
 */
'use strict';
const CACHE_NAME='lv88-19-2026-11-19-standalone-json-v1';
const FILES=[
 './','index.html','manifest.webmanifest','v87_core.js','v87_pdf.js','v88_2_catalog.js','v88_3_setup.js','v88_3_review.js','v88_4_export.js','v88_16_export_guard.js','v88_17_bulk_core.js','v88_17_bulk_ui.js','v88_4_help.js','v88_5_import.js','v88_6_pdf.js','v88_7_inventory_guard.js','v88_8_technician.js','v88_9_count_core.js','v88_11_location_core.js','v88_12_save_guard.js','v88_13_pdf_match.js','v88_14_report.js','v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js',
 'inventory_core.js','inventory_ui.js','inventory_v84_core.js','inventory_v85_core.js',
 'inventory_company_v86.js','service_pdf_core.js','service_pdf_reader.js','service_pdf_ui.js',
 'service_pdf_backend.js','local_backend.js','app_rules.js','auth_core.js','sync_core.js',
 'warehouse_core.js','warehouse_ui.js','v66_core.js','v67_core.js','v68_core.js','v69_core.js',
 'sync_ui_v81.js','sync_ui_v82.js','sync_merge_v81.js','sync_merge_v82.js',
 'material_booking_v83_core.js','material_booking_v83_ui.js','stock_bins_v86.js',
 'stock_bins_v86_ui.js',
 'vendor/pdfjs/pdf.min.mjs','vendor/pdfjs/pdf.worker.min.mjs',
 'vendor/tesseract/tesseract.min.js','vendor/tesseract/worker.min.js',
 'v88_16_export_guard.js?v=88.19','v88_17_bulk_core.js?v=88.19','v88_17_bulk_ui.js?v=88.19','v88_13_pdf_match.js?v=88.19','v88_5_import.js?v=88.19','v88_6_pdf.js?v=88.19','v88_7_inventory_guard.js?v=88.19','v88_8_technician.js?v=88.19','v88_4_export.js?v=88.19','v87_pdf.js?v=88.19','v87_ui.js?v=88.19','v88_2_catalog.js?v=88.19'
];
const ADDONS=[
 ['vendor/tesseract/tesseract.min.js','Tesseract'],
 ['v87_core.js','LV87Core'],
 ['v87_pdf.js','LV87PDF'],
 ['v88_6_pdf.js','LV886PDF'],
 ['v88_2_catalog.js','LV882Catalog'],
 ['v88_3_setup.js','LV883Setup'],
 ['v88_3_review.js','LV883Review'],
 ['v88_13_pdf_match.js','LV8813PDFMatch'],
 ['v88_14_report.js','LV8814Report'],
 ['v88_17_bulk_core.js','LV8817BulkCore'],
 ['v88_17_bulk_ui.js','LV8817BulkUI'],
 ['v88_4_export.js','LV884Export'],
 ['v88_16_export_guard.js','LV8816ExportGuard'],
 ['v88_4_help.js','LV884Help'],
 ['v88_5_import.js','LV885Import'],
 ['v88_8_technician.js','LV888Technician'],
 ['v88_9_count_core.js','LV889CountCore'],
 ['v88_12_save_guard.js','LV8812SaveGuard'],
 ['v87_ui.js','LV87'],
 ['v88_10_inventory_focus.js','LV8810InventoryFocus'],
 ['v88_ocr.js','LV88OCR'],
];
function injectHtml(html){
 let out=String(html);
 // Materialstammdaten zeigen sofort bestaetigte Inventur-Fundorte; nicht als echten Lagerbestand ausgeben.
 const label='<td data-label="Bezeichnung">${esc(a.description)}</td>';
 if(out.includes(label))out=out.replace(label,`<td data-label="Bezeichnung">\${esc(a.description)}\${a.inventory_count_locations?.length?\`<div class="small" style="margin-top:4px;color:#155a72"><b>Inventur-Fundorte (noch kein Bestandsabschluss):</b> \${esc(a.inventory_count_locations.join(' · '))}</div>\`:''}</td>`);
 // V88.19: a missing global syncStatus must not break other settings saves.
 out=out.replace(/await\s+syncStatus\s*\(\s*\)\s*;/g,"if(typeof window.syncStatus==='function')await window.syncStatus();");
 if(!/<\/body\s*>/i.test(out))return out;
 if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;
 // Eine alte Offline-Antwort kann bereits ein V88.1/V88.4-Scriptpaket enthalten.
 // Dieses vollständig ersetzen; sonst bliebe die neue PDF-Einleselogik unsichtbar.
 out=out.replace(/<!--\s*Lagerverwaltung V88[\s\S]*?-->\s*<span data-lv88-boot=\"1\" hidden><\/span>[\s\S]*?(?=<\/body\s*>)/i,'');
 if(out.includes('data-lv88-boot=')){
  // Eine alte bereits gepatchte Offline-Startseite darf nie wieder den
  // gefährlichen alten PDF-Export ohne Schutzschicht starten.
  if(!out.includes('v88_16_export_guard.js'))out=out.replace(/<\/body\s*>/i,'<script src="v88_16_export_guard.js?v=88.19" defer></script>\n</body>');
  if(!out.includes('v88_17_bulk_core.js'))out=out.replace(/<\/body\s*>/i,'<script src="v88_17_bulk_core.js?v=88.19" defer></script>\n<script src="v88_17_bulk_ui.js?v=88.19" defer></script>\n</body>');
  return out;
 }
 // V88.19: inventory_ui.js is a synchronous script in the legacy index.html.
 // It requires LV8811LocationCore immediately at evaluation time. Loading
 // that dependency in deferred footer ADDONS is TOO LATE and leaves
 // window.LVInventory undefined, breaking inventory resume and startup.
 const inventoryScript=/<script\b[^>]*\bsrc=["']inventory_ui\.js(?:\?[^"']*)?["'][^>]*><\/script>/i;
 if(inventoryScript.test(out))out=out.replace(inventoryScript,match=>'<script src="v88_11_location_core.js?v=88.19"></script>\n<script src="v88_7_inventory_guard.js?v=88.19"></script>\n'+match);
 const extra=ADDONS.filter(([src])=>!new RegExp('<script\\b[^>]*\\bsrc=["\\\']'+src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\']','i').test(out))
   .map(([src])=>'<script src="'+src+'?v=88.19" defer></script>').join('\n');
 // Nicht direkt im head einhängen: Das vollständige V86-App-Gerüst muss vorliegen.
 return out.replace(/<\/body\s*>/i,'\n<!-- Lagerverwaltung V88.19: Datenbestand unverändert, verlustfreier PDF-Export und geprüfter PDF-Import -->\n<span data-lv88-boot="1" hidden></span>\n'+extra+'\n</body>');
}
function patchV87Ui(source){
 const orig=String(source);
 if(!orig.includes('async function scan(file,onProgress=()=>{})')||orig.includes('/* LV88_V87_UI_PATCH */'))return orig;
 let out=orig;
 const edits=[
  [
   'let pdf=null,worker=null;',
   'let pdf=null,worker=null,previous=null,pages=[],lastSavedCount=0;'
  ],[
   "const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];",
   "previous=await getPdf().catch(()=>null);pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length===(x.page===pdf.numPages?9:10)&&x.positions.every(r=>r.verified!==false)):[];"
  ],[
   'if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))',
   'if(pages.some(x=>x.page===n&&x.positions?.length===(n===pdf.numPages?9:10)&&x.positions.every(r=>r.verified!==false)))'
  ],[
   "await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});",
   "if(n%4===0||n===pdf.numPages){await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});lastSavedCount=pages.length;}"
  ],[
   'finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}',
   'finally{if(pages.length>lastSavedCount)try{await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()})}catch(e){console.warn("V88: letzter OCR-Zwischenstand nicht speicherbar",e)};if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}'
  ]
 ];
 for(const [before,after] of edits){
  if(!out.includes(before))return orig;
  out=out.replace(before,after);
 }
 // In Chrome/Android a fresh <input type=file> cannot preserve its selection.
 // Save the File object in memory so the user can retry without selecting again.
 const readHead="async function readPdf(file,mode='annual'){";
 if(out.includes(readHead) && !out.includes('lv88LastReadPdf')){
  out=out.replace(readHead,"let lv88LastReadPdf=null;\n"+readHead);
  const oldCheck="if(!file)return alert('Bitte zuerst die RONDO-PDF auswählen.');if(scanBusy)return;";
  const newCheck="if(!file)file=lv88LastReadPdf;if(!file)return alert('Bitte zuerst die RONDO-PDF auswählen.');if(scanBusy)return;lv88LastReadPdf=file;";
  if(out.includes(oldCheck))out=out.replace(oldCheck,newCheck);
  const oldRetry="$('lv87Resume').onclick=()=>readPdf($('lv87ChooseFile').files[0],stagingMode)";
  if(out.includes(oldRetry))out=out.replace(oldRetry,"$('lv87Resume').onclick=()=>readPdf($('lv87ChooseFile').files[0]||lv88LastReadPdf,stagingMode)");
 }
 // Der Browser darf die Dateiauswahl nicht automatisch vorbefüllen;
 // deshalb zeigen wir ausdrücklich an, dass die letzte Datei intern gemerkt bleibt.
 out=out.replace('Du kannst die PDF erneut auswählen. Bereits erkannte Seiten werden beim gleichen Dokument wiederverwendet.',
   'Die zuletzt ausgewählte PDF bleibt für einen erneuten Versuch verfügbar. Du kannst alternativ eine andere PDF auswählen. Bereits erkannte Seiten werden bei derselben Datei wiederverwendet.');
 out=out.replace('id="lv87Resume" class="primary">Fortsetzen',
   'id="lv87Resume" class="primary">PDF erneut versuchen');
 // V88.4: Die Original-PDF wurde extern mit mehreren OCR-Verfahren geprüft.
 // Ein kryptografischer Dateiabgleich (SHA-256) schaltet ausschließlich bei dieser
 // EXAKTEN Datei auf den geprüften Katalog. Andere PDFs nutzen weiterhin OCR.
 const scanAnchor='async function scan(file,onProgress=()=>{}){';
 if(out.includes(scanAnchor)&&!out.includes('LV882_EXACT_PDF_FAST_PATH')){
  out=out.replace(scanAnchor,scanAnchor+`
 /* LV882_EXACT_PDF_FAST_PATH */
  if(window.LV882Catalog?.scanKnown){
    const known=await window.LV882Catalog.scanKnown(file,onProgress);
    if(known)return known;
  }
  `);
 }
 // Die eigentliche Prüfansicht erklärt auch, warum OCR-Positionen unsicher sind.
 const oldReview="status==='unsicher'?'<span class=\"lv87-bad\">Prüfen!</span>'";
 const newReview="status==='unsicher'?`<span class=\"lv87-bad\" title=\"${safe(r.warning||'Artikelnummer/Bezeichnung prüfen')}\">Prüfen! ${safe(r.warning||'')}</span>`";
 if(out.includes(oldReview))out=out.replace(oldReview,newReview);
 // Gespeicherte, unvollständige V88.1-Versuche dürfen den neuen Katalog nicht
 // wieder durch eine alte (leere) Artikelliste überschreiben. Bereits geprüfte
 // V88.4-Positionen bleiben dagegen bei erneutem Laden erhalten.
 const oldReviewed="state.rows=previous?.hash===result.hash&&previous?.edited?.length?previous.edited:reviewed.rows;";
 const newReviewed="state.rows=result?.source==='verified-file-catalog-v88.2'?(previous?.source==='verified-file-catalog-v88.2'&&previous?.hash===result.hash&&previous?.edited?.length===719?previous.edited:reviewed.rows):(previous?.hash===result.hash&&previous?.edited?.length?previous.edited:reviewed.rows);";
 if(out.includes(oldReviewed))out=out.replace(oldReviewed,newReviewed);
 // V88.4: Drei gleichberechtigte Startwege. Ohne Import ist die sichere
 // Standardauswahl; das Setup erzeugt trotzdem eine funktionsfähige leere DB.
 // SAP nutzt weiterhin *denselben* Parser/Preview/Commit wie das CSV-Center.
 const setupAnchor="function setupPicker(){const step=$('setupStep5');";
 if(out.includes(setupAnchor)&&!out.includes('LV883_SETUP_3WAYS')){
  const setupEnd='async function annualCard(){';
  let begin=out.indexOf(setupAnchor),end=out.indexOf(setupEnd,begin);
  if(end<0)return orig; // bei unerwartetem Quellformat keine riskante Teiländerung
  let block=out.slice(begin,end);
  const edits883=[
   ['value="pdf" checked> RONDO-Inventurliste', 'value="pdf"> RONDO-Inventurliste'],
   ['value="sap"> SAP-Excel/CSV – Firmenbestände übernehmen, Inventur freiwillig',
    'value="sap"> SAPUI5-Export (CSV/Excel, wie im CSV-Center) – Materialstamm und Firmenbestände übernehmen, Inventur freiwillig'],
   ['value="none"> Ohne Datei starten (leere Datenbank)',
    'value="none" checked> Ohne Import starten – neue leere Datenbank, Materialien später selbst anlegen'],
   ["<div id=\"lv87SetupFileBox\">${makeFileInput('pdf').replace('id=\"lv87ChooseFile\"','id=\"lv87SetupUpload\"')}</div><p class=\"lv87-hint\" id=\"lv87SetupHint\">Bei der RONDO-PDF fehlen Mengen. Ohne vollständige Zählung ist der Anfangsbestand nicht verlässlich.</p>",
    '<div id="lv87SetupFileBox"></div><p class="lv87-hint" id="lv87SetupHint">Es wird eine neue, leere Lagerdatenbank erstellt. Du kannst Materialien später selbst erfassen oder im CSV-Center importieren. Vorhandene Datenbanken werden nicht überschrieben.</p>'],
   ["mode==='sap'?'SAP-Mengen werden als Anfangsbestand übernommen. Eine anschließende Inventur ist freiwillig.'",
    "mode==='sap'?'Der SAPUI5-Export wird mit der CSV-Center-Prüfung als Anfangsbestand übernommen (keine zusätzliche Einbuchung). Eine Inventur ist freiwillig.'"],
   ["'Ohne Dateiangaben bleiben Artikel und Bestände leer. Manuelle Einrichtung ist möglich.'",
    "'Neue leere Datenbank ohne Materialdaten. Artikel können danach manuell angelegt oder später importiert werden.'"],
   ["const mode=div.querySelector('[name=lv87ImportMode]:checked')?.value||'pdf';",
    "/* LV883_SETUP_3WAYS */ const mode=div.querySelector('[name=lv87ImportMode]:checked')?.value||'none';"],
   ["if(mode!=='none'&&!file)return alert('Bitte die Datei für den gewählten Importweg auswählen.');\n    if(file&&mode==='pdf'&&!/\\.pdf$/i.test(file.name))return alert('Bitte eine RONDO-PDF auswählen.');\n    try{await original();",
    "try{\n     window.LV883Setup.validateChoice(mode,file);\n     if(mode==='sap'){\n      const preview=await post('/api/company-import/file-preview',{filename:file.name,content_base64:await fileBase64(file),mode:'inventory'});\n      window.LV883Setup.validateSapPreview(preview);\n     }\n     await original();"]
  ];
  for(const [from,to] of edits883){if(!block.includes(from))return orig;block=block.replace(from,to);}
  out=out.slice(0,begin)+block+out.slice(end);
 }
 // V88.4: Zeilenbezogene Schnellprüfung in der bestehenden RONDO-Prüftabelle.
 // Die neue Hilfsbibliothek verändert ausschließlich die ungeprüften OCR-Felder,
 // nicht Bestände oder die DB. Eindeutige Treffer können gruppiert bestätigt werden.
 const reviewMarker="`,'RONDO-Artikel prüfen');\n  $('lv87ReviewFilter')";
 if(out.includes(reviewMarker)&&!out.includes('LV883_ROW_REVIEW')){
  out=out.replace(reviewMarker,`\`,'RONDO-Artikel prüfen');
  /* LV883_ROW_REVIEW */
  window.LV883Review?.enhance({
   root:$('lv87ModalBody'),rows:state.rows,articles:data,
   validate:Core.validNo,
   onUpdate:()=>{saveReviewLater();return renderReview()},
   onFilter:(selected)=>{const f=$('lv87ReviewFilter');if(f){f.value=selected;f.dispatchEvent(new Event('change'))}}
  });
  $('lv87ReviewFilter')`);
 }
 // Manuelle Änderungen bleiben bis zu einem ausdrücklichen Häkchen ungeprüft.
 const oldAutoApprove="r.verified=Core.validNo(r.article_no)&&!!r.description;saveReviewLater();";
 if(out.includes(oldAutoApprove))out=out.replace(oldAutoApprove,"r.verified=false;saveReviewLater();");
  // V88.4: Export ist unabhängig vom offenen Inventurabschluss.
 // Die V88.4-Komponente greift ausschließlich auf den gewählten gespeicherten
 // Inventur-Snapshot zu. Einzig ein *offener* aktueller Zählzwischenstand wird
 // mit LVInventory.save() VOR dem Rendern gesichert (kein Lagerbestand-Commit).
 const exportStart='async function exportFilled(){try{';
 const exportEnd=' function csvDownload(';
 if(out.includes(exportStart)&&out.includes(exportEnd)&&!out.includes('LV884_PDF_SNAPSHOT_EXPORT')){
  const start=out.indexOf(exportStart),end=out.indexOf(exportEnd,start);
  if(end>start){out=out.slice(0,start)+`/* LV884_PDF_SNAPSHOT_EXPORT */
 async function exportFilled(){
  try{
   if(!window.LV884Export?.run)throw Error('PDF-Ausgabe V88.4 nicht geladen. Bitte App erneut öffnen.');
   return await window.LV884Export.run({
    getStored:async()=>{state.database_id=await dbId();return getPdf()},
    saveMappings:async(updatedRows)=>{
     state.database_id=await dbId();const snapshot=await getPdf();
     if(!snapshot?.bytes||!snapshot?.hash)throw Error('Die gespeicherte Original-PDF wurde nicht gefunden.');
     if(!Array.isArray(updatedRows)||updatedRows.length!==(snapshot.edited?.length||Core.checkRows(snapshot.pages).rows.length))throw Error('Die Zuordnung passt nicht mehr zur gespeicherten PDF. Bitte den Import überprüfen.');
     const originals=snapshot.edited?.length?snapshot.edited:Core.checkRows(snapshot.pages).rows;
     if(updatedRows.some((r,i)=>Number(r.page)!==Number(originals[i].page)||Number(r.position)!==Number(originals[i].position)))throw Error('Seiten- oder Positionsreihenfolge verändert. Keine Zuordnung gespeichert.');
     const changes=updatedRows.filter((r,i)=>r.article_no!==originals[i].article_no||r.verified!==originals[i].verified||r.review_action!==originals[i].review_action);
     // LV8818_SNAPSHOT_BATCH: eine gepruefte Stapelauswahl oder ein reiner
     // Zwischenstand wird atomar als EIN PDF-Snapshot gesichert. Die Reihenfolge
     // bleibt fix; kein Artikelstamm und keine Inventurmenge wird veraendert.
     for(const [i,r] of updatedRows.entries()){
      if(r.article_no!==originals[i].article_no&&r.manual_link!==true)throw Error('PDF-Nummer ohne ausdrueckliche manuelle Verknuepfung: Seite '+r.page+'.');
      if(r.review_action==='defer'&&r.verified!==false)throw Error('Zurueckgestellte Position muss als ungeprueft markiert sein.');
     }
     // Nur NEUE Zuordnungen gegen aktive andere PDF-Zeilen prüfen.
     // Ursprüngliche OCR-Dubletten dürfen eine reine Zwischenstandssicherung
     // nicht blockieren; sie bleiben ausdrücklich weiterhin zu prüfen.
     for(const r of changes){
      if(r.review_action==='defer'||r.verified===false)continue;
      const n=Core.normNo(r.article_no);
      if(n&&updatedRows.some(other=>other!==r&&other.review_action!=='defer'&&other.verified!==false&&Core.normNo(other.article_no)===n))throw Error('Eine neu zugeordnete Materialnummer wird bereits an einer anderen PDF-Position verwendet: '+r.article_no);
     }
     const update={...snapshot,edited:updatedRows.map(x=>({...x})),updated:new Date().toISOString()};
     await storePdf(update);
     if(state.fileHash===snapshot.hash)state.rows=updatedRows.map(x=>({...x}));
    },
    core:Core,pdf:PDF,inventory:window.LVInventory,api:window.api,
    dialog,confirm:message=>window.confirm(message)
   });
  }catch(e){window.alert('RONDO-PDF konnte nicht gestartet werden: '+e.message)}
 }
 `+out.slice(end)}
 }
 // V88.4: Anleitungen im bestehenden Hilfe-Reiter statt nur in README.
 const installMarker='fastInventory();await installTransfers();helpCard();observeInventoryCompletion();';
 if(out.includes(installMarker)&&!out.includes('LV884_HELP_INSTALL')){
  out=out.replace(installMarker,'fastInventory();await installTransfers();helpCard();/* LV884_HELP_INSTALL */ window.LV884Help?.install();observeInventoryCompletion();');
 }
 // Der Exportbutton bleibt in der laufenden und abgeschlossenen Inventur aktiv.
 const annualMarker='<button id="lv87ExportFilled" type="button" class="primary">Ausgefüllte RONDO-PDF erzeugen</button>';
 if(out.includes(annualMarker))out=out.replace(annualMarker,'<button id="lv87ExportFilled" type="button" class="primary">📄 RONDO-PDF – Zwischenstand / Abschluss herunterladen</button>');
 const noteOld='Die PDF enthält keine SAP-Mengen. Verglichen werden Artikelbestände aus deiner Anwendung';
 if(out.includes(noteOld))out=out.replace(noteOld,'Die ausgefüllte RONDO-PDF kann jederzeit während einer Zählung und nach Abschluss erneut erzeugt werden. Erst der ausdrückliche Inventurabschluss ändert Lagerbestände. Die PDF enthält keine SAP-Mengen. Verglichen werden Artikelbestände aus deiner Anwendung');
 // PDF-Dateien anderer RONDO-Jahre können eine andere Seitenanzahl aufweisen;
 // niemals global auf genau 72 Seiten zwingen.
 const guard="if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');";
 // 72 Seiten gelten nur für den per SHA-256 identifizierten Katalog von V88.2.
 return '/* LV88_V87_UI_PATCH */\n'+out;
}
// V88.4: Druckkoordinaten anhand des Original-Scans (A4, 595 x 842 pt)
// statt der bisherigen falschen Zeilenhoehe/Anfangshoehe. Ausschliesslich
// Darstellung der Werte, keine Speicherung oder Buchung.
function patchV87Pdf(source){
 const orig=String(source);
 if(orig.includes('/* LV884_PDF_GEOMETRY_PATCH */'))return orig;
 const changes=[
  ['async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false){',
   'async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false,meta={}){'],
  ['    const jpeg=await new Promise((res,rej)=>cv.toBlob(',
   `    // Zähler und Datum werden auf JEDER Originalseite beim PDF-Export aufgedruckt.
    // Die RONDO-Signaturzeile bleibt bewusst leer. Keine Bestandsbuchung.
    const counter=String(meta?.counter||'').trim();
    const day=String(meta?.date||'').trim();
    if(counter||day){
      const px=vp.width/page.getViewport({scale:1}).width;
      ctx.save();ctx.fillStyle='#111';ctx.font=String(Math.round(8.2*px))+'px Arial, sans-serif';
      ctx.textAlign='left';
      if(counter)ctx.fillText(counter,89*px,734*px,175*px);
      if(day)ctx.fillText(day,89*px,746*px,175*px);
      ctx.restore();
    }
    const jpeg=await new Promise((res,rej)=>cv.toBlob(`],
  ['(250.0+39.35*(pos-1))*scale,qtyY=(256.6+39.35*(pos-1))*scale',
   '(292.8+45.4*(pos-1))*scale,qtyY=(292.8+45.4*(pos-1))*scale'],
  ['ctx.fillRect(73*scale,(statusY-9)*1,120*scale,11*scale);',
   'ctx.fillRect(86*scale,statusY-9*scale,115*scale,14*scale);'],
  ["ctx.fillText('Gezählt',75*scale,statusY);",
   "ctx.fillText('Gezählt',87*scale,statusY);"],
  ["ctx.fillText(String(val).replace('.',','),270*scale,qtyY-2*scale);",
   "ctx.fillText(String(val).replace('.',','),305*scale,qtyY-2*scale);"]
 ];
 if(changes.some(([before])=>!orig.includes(before)))return orig;
 let out=orig;for(const [before,after] of changes)out=out.replace(before,after);
 return '/* LV884_PDF_GEOMETRY_PATCH */\n'+out;
}
/* V88.5: Diese Ergänzung wird AUCH angewendet, wenn der Browser noch eine
 * bereits durch V88.1/V88.4 veränderte v87_ui.js aus einem alten Cache hat.
 * Auf den V88.4-Patch-Marker allein ist kein Verlass.
 */
function patchV885Ui(source){
 let out=patchV87Ui(source);
 if(out.includes('/* LV885_SAFE_FILE_CATALOG */'))return out;
 const anchor='async function scan(file,onProgress=()=>{}){';
 if(!out.includes(anchor))return out;
 const code=`
  /* LV885_SAFE_FILE_CATALOG */
  if(!window.LV885Import?.scan){
   // Fallback für ältere gecachte Startseiten: neuen Importer nachladen.
   await new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=new URL('v88_5_import.js?v=88.19',document.baseURI).href;
    s.onload=()=>window.LV885Import?.scan?resolve():reject(Error('V88.5 Importer ist nicht aktiviert.'));
    s.onerror=()=>reject(Error('V88.5 Importer konnte nicht geladen werden. Bitte Online-Verbindung überprüfen und Anwendung erneut öffnen.'));
    document.head.appendChild(s);
   });
  }
  const _lv885Recognized=await window.LV885Import.scan(file,onProgress);
  if(_lv885Recognized)return _lv885Recognized;
 `;
 return out.replace(anchor,anchor+code);
}

/* V88.19: Markierungen "Später zuordnen" bleiben in der gespeicherten
 * PDF-Prüfliste. Nur eindeutig bestätigte Positionen werden angelegt.
 */
function patchV886Ui(source){
 let out=patchV885Ui(source);
 if(out.includes('/* LV886_DEFERRED_IMPORT */'))return out;
 const start='async function commitRows(){\n  const rows=state.rows;';
 if(!out.includes(start))throw Error('V88.19: Commit-Stelle in v87_ui.js wurde verändert. Kein unsicheres Update.');
 out=out.replace(start,`async function commitRows(){
  /* LV886_DEFERRED_IMPORT */
  const deferred=state.rows.filter(x=>x.review_action==='defer');
  const rows=state.rows.filter(x=>x.review_action!=='defer');
  if(!rows.length)throw Error('Noch keine Artikelposition zur Übernahme freigegeben. Zurückgestellte Artikel bleiben gespeichert.');`);
 const all="const all=state.rows.map((r,i)=>({r,i,status:rowStatus(r,cmp)}));";
 if(!out.includes(all))throw Error('V88.19: Prüfansicht konnte nicht sicher aktualisiert werden.');
 out=out.replace(all,"const all=state.rows.map((r,i)=>({r,i,status:r.review_action==='defer'?'deferred':rowStatus(r,cmp)}));");
 const errors="const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>!Core.validNo(x.article_no)||!x.description||x.verified===false);";
 if(!out.includes(errors))throw Error('V88.19: Prüfzählung nicht gefunden.');
 out=out.replace(errors,"const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>x.review_action!=='defer'&&(!Core.validNo(x.article_no)||!x.description||x.verified===false));");
 const option='<option value="unsicher">Unsicher</option>';
 if(!out.includes(option))throw Error('V88.19: Prüf-Filter fehlt.');
 out=out.replace(option,option+'<option value="deferred">Später zuordnen</option>');
 const done="state.verified=true;";
 if(!out.includes(done))throw Error('V88.19: Prüfstatus fehlt.');
 out=out.replace(done,"state.verified=state.rows.every(x=>x.review_action!=='defer'&&x.verified===true);");
 const msg="const msgText=`${total} neue Artikel registriert. ${fresh.appOnly.length} Artikel sind ausschließlich in deiner App vorhanden. Bitte prüfen. Mengen wurden noch nicht übernommen.`;";
 if(out.includes(msg))out=out.replace(msg,"const msgText=`${total} neue Artikel registriert. ${deferred.length} Positionen für später zurückgestellt (unverändert gespeichert). ${fresh.appOnly.length} Artikel sind ausschließlich in deiner App vorhanden. Mengen wurden noch nicht übernommen.`;");
 return out;
}
/* Egal ob die vorherige PWA schon eine alte/gepatchte PDF-Funktion aus dem Cache
 * geliefert hat: die gefährliche Weißseiten-Rasterfunktion wird NIE aufgerufen.
 * Bei fehlendem neuen PDF-Modul erscheint ein eindeutiger Fehler statt leerer PDF.
 */
function patchV886Pdf(source){
 let out=String(source);
 if(out.includes('/* LV886_SAFE_PDF_DELEGATE */'))return out;
 const pattern=/async function render\(originalBytes,rows,quantities,onProgress=\(\)=>\{\},cancelled=\(\)=>false(?:,meta=\{\})?\)\{/;
 const match=pattern.exec(out);
 if(!match)throw Error('V88.19: PDF-Renderfunktion unbekannt. Kein riskanter Weißseitenexport.');
 const replacement=match[0]+`
  /* LV886_SAFE_PDF_DELEGATE */
  if(!window.LV886PDF?.render)throw Error('Verlustfreier RONDO-PDF-Export V88.19 ist nicht geladen. Bitte Version 88.16 aktualisieren.');
  return window.LV886PDF.render(originalBytes,rows,quantities,onProgress,cancelled,typeof meta!=='undefined'?meta:{});
 `;
 return out.replace(match[0],replacement);
}

/* V88.19: Bei reiner Artikelanlage darf ein anderer Zähler-/Technikername
 * NUR nach ausdrücklicher Rückfrage fortgeführt werden. Andere API-Wege
 * (Einbuchung, SAP-Mengen, Inventurabschluss) bleiben unverändert.
 */
function patchV888Ui(source){
 const orig=patchV886Ui(source);
 if(orig.includes('/* LV888_TECH_CONFIRM_UI */'))return orig;
 const before="const post=(url,d)=>window.api(url,{method:'POST',body:JSON.stringify(d)});";
 if(!orig.includes(before))throw Error('V88.19: Import-API-Aktion nicht gefunden; kein unsicheres Update.');
 return orig.replace(before,"/* LV888_TECH_CONFIRM_UI */ const post=(url,d)=>window.LV888Technician?window.LV888Technician.post(url,d,window.api):window.api(url,{method:'POST',body:JSON.stringify(d)});");
}
function patchV888Backend(source){
 const orig=String(source);
 if(orig.includes('/* LV888_TECH_BACKEND */'))return orig;
 const route="if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){";
 const start=orig.indexOf(route);
 if(start<0)throw Error('V88.19: Artikelimport-Endpunkt nicht gefunden.');
 const end=orig.indexOf("const operationId=String(d.operation_id||'').trim()",start);
 if(end<0||end-start>1600)throw Error('V88.19: erwartete Validierungsstelle nicht gefunden.');
 const section=orig.slice(start,end);
 const before="if(!technician||!validTech.includes(technician))throw Error('Techniker ist nicht gültig.');";
 if(!section.includes(before))throw Error('V88.19: Technikerprüfung nicht in erwarteter Form gefunden.');
 const replacement=`/* LV888_TECH_BACKEND */
  // Ausnahme nur nach bestätigtem Warnhinweis; nur Artikelstammdaten,
  // NIE Ein-/Ausbuchung oder SAP-Bestandsimport/Inventurabschluss.
  const _lv888SafeOnly=p==='/api/articles/create-import'&&
   !isCreateAndBook&&d.allow_technician_mismatch===true&&
   newItems.length>0&&newItems.every(x=>{
    const initial=Number(x?.initial_stock??0),qty=Number(x?.quantity??0);
    return Number.isFinite(initial)&&initial===0&&Number.isFinite(qty)&&qty===0;
   });
  if(!technician||(!validTech.includes(technician)&&!_lv888SafeOnly))throw Error('Techniker ist nicht gültig.');`;
 return orig.slice(0,start)+section.replace(before,replacement)+orig.slice(end);
}


/* V88.19: Getroffene Artikel springen direkt in die zusätzliche Menge.
 * Die bisherige Menge wird niemals im normalen Scan-Ablauf ausgewählt.
 */
function patchV889Focus(source){
 const orig=String(source);
 if(orig.includes('/* LV889_EXISTING_FOCUS */'))return orig;
 const old="requestAnimationFrame(()=>{$('inv75-count-'+row.article_id)?.focus();$('inv75-count-'+row.article_id)?.select();})";
 if(!orig.includes(old))throw Error('V88.19: Erwartete Artikelauswahl nicht gefunden. Bitte App-Dateien prüfen.');
 const next="requestAnimationFrame(()=>{/* LV889_EXISTING_FOCUS */ const entry=window.LVInventory?.current?.()?.items.find(x=>Number(x.article_id)===Number(row.article_id));const counted=entry&&entry.counted_stock!==null&&entry.counted_stock!==undefined&&String(entry.counted_stock).trim()!=='';const field=$((counted?'inv84-add-':'inv75-count-')+row.article_id);field?.focus();field?.select();})";
 return orig.replace(old,next);
}
function patchV889Ui(source){return patchV889Focus(patchV888Ui(source));}
/* V88.19: UI-Patch an der bestehenden V86-Inventur, OHNE Datenbankmigration.
 * Teilzählungen werden über die vorhandenen Inventur-Zwischenstände gespeichert.
 */
function patchV889InventoryUi(source){
 const orig=String(source);
 if(orig.includes('/* LV889_INVENTORY_ADD */'))return orig;
 let out=orig;
 const start=out.indexOf('  addBinPart(id){');
 const end=out.indexOf('  updateReferences(refs){',start);
 if(start<0||end<start||end-start>5500)throw Error('V88.19: Bin-Teilmengen-Funktion wurde verändert. Bitte App-Dateien prüfen.');
 out=out.slice(0,start)+`  addBinPart(id){return this.addCount(id);},
`+out.slice(end);
 const begin=out.indexOf('  addCount(id){');
 const finish=out.indexOf('  edit(id,field,value){',begin);
 if(begin<0||finish<begin||finish-begin>5500)throw Error('V88.19: Weitere-Menge-Funktion wurde verändert. Bitte App-Dateien prüfen.');
 const block=String.raw`  /* LV889_INVENTORY_ADD */
  async addCount(id){
   if(!data||data.session.status!=='draft'||busy)return;
   let row=data.items.find(x=>Number(x.article_id)===Number(id));
   let field=$('inv84-add-'+id),result=$('inv84-result-'+id);
   if(!row||!field)return;
   const entered=field.value,submitFromKeyboard=document.activeElement===field;
   let selected,calculated,plan;
   try{
    // Der Zählbereich ist der oben vorgewählte aktuelle Fundort.
    // Bei einem neuen Namen den normalen Anlegen-Dialog wiederverwenden.
    try{selected=V84.countContext(row,context(),data.locations)}
    catch(err){
     if(!/noch nicht angelegt/i.test(String(err.message||''))||!context().apply||!context().location)throw err;
     await this.addContextLocation();
     if(!data||data.session.status!=='draft')return;
     row=data.items.find(x=>Number(x.article_id)===Number(id));
     field=$('inv84-add-'+id);result=$('inv84-result-'+id);
     if(!row||!field)return;
     field.value=entered;
     selected=V84.countContext(row,context(),data.locations);
    }
    calculated=V84.addCount(row.counted_stock,entered,row.unit);
    if(!window.LV889CountCore?.plan)throw Error('Inventur-Zusatzmodul V88.19 fehlt. Bitte die App neu laden.');
    plan=window.LV889CountCore.plan(row,calculated,selected);
   }catch(e){message(e.message,false);field?.focus();return}
   // Nur die laufende Inventur wird geändert. Kein INSERT in den echten Lagerbestand.
   this.edit(id,'counted_stock',String(calculated.total));
   if(String(row.counted_stock)!==String(calculated.total))return;
   if(plan.parts.length)this.edit(id,'bin_parts_json',JSON.stringify(plan.parts));
   const countedField=$('inv75-count-'+id);
   if(countedField)countedField.value=String(calculated.total).replace('.',',');
   field.value='';
   if(result)result.textContent=calculated.old.toLocaleString('de-DE')+' + '+calculated.delta.toLocaleString('de-DE')+' = '+calculated.total.toLocaleString('de-DE')+' '+(row.unit||'')+(plan.parts.length?' | '+plan.summary:'');
   message(row.article_no+': '+calculated.delta.toLocaleString('de-DE')+' zusätzlich gezählt. '+(plan.newPlace?'Weiterer Lagerort ergänzt. ':'')+'Neuer Gesamtzählstand: '+calculated.total.toLocaleString('de-DE')+'. Keine Lagerbuchung.');
   if(submitFromKeyboard)this.confirmCount(id).catch(e=>message(e.message,false));
  },
`;
 out=out.slice(0,begin)+block+out.slice(finish);
 // Bereits gezählte Mengen gegen versehentliches Überschreiben sichern;
 // bewusste manuelle Korrektur bleibt ausdrücklich möglich.
 const countInput='value="${esc(x.counted_stock??\'\')}" ${disabled} oninput=';
 if(!out.includes(countInput))throw Error('V88.19: Gezähltes-Menge-Feld nicht gefunden.');
 out=out.replace(countInput, 'value="${esc(x.counted_stock??\'\')}" ${disabled} ${x.counted_stock!==null?\'readonly title="Bereits gezählt – für Korrektur Freigabe wählen"\':\'\'} oninput=');
 const nextBtn='<button type="button" class="secondary" onclick="LVInventory.confirmCount(${x.article_id})">✓ Bestätigen & weiter</button>';
 if(!out.includes(nextBtn))throw Error('V88.19: Schaltfläche Bestätigen & weiter nicht gefunden.');
 out=out.replace(nextBtn,nextBtn+`\${x.counted_stock!==null?\`<button type="button" class="secondary" onclick="LVInventory.correctTotal(\${x.article_id})">Gesamtmenge korrigieren</button>\`:' '}`.replace(/\\/g,''));
 const inventoryObject=' window.LVInventory={';
 if(!out.includes(inventoryObject))throw Error('V88.19: Inventur-API nicht gefunden.');
 out=out.replace(inventoryObject,inventoryObject+String.raw`
  correctTotal(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));
   if(!row||data.session.status!=='draft')return;
   if(!confirm('Gesamtmenge für Artikel '+row.article_no+' ausdrücklich korrigieren? Bei einer Änderung gehen bisherige Teilmengen je Lagerort verloren und müssen neu erfasst werden.'))return;
   const el=$('inv75-count-'+id);
   if(el){el.readOnly=false;el.focus();el.select();}
   message('Korrektur freigegeben. Nach Eingabe bitte ausdrücklich „Bestätigen & weiter“ wählen.');
  },`);
 const oldSummary='${esc(x.bin_parts_json)}';
 if(!out.includes(oldSummary))throw Error('V88.19: Teilmengenanzeige nicht gefunden.');
 out=out.replace(oldSummary,'${esc(window.LV889CountCore?.describe(x.bin_parts_json)||x.bin_parts_json)}');
 return out;
}


/* V88.19: Einen explizit ausgewaehlten Zaehlort automatisch aktivieren.
 * Die addCount-Mengenverteilung aus V88.9 bleibt erhalten; mehrere Orte
 * werden auf Basis des aktiven Kontexts automatisch getrennt gespeichert.
 */
function patchV8810InventoryUi(source){
 let out=patchV889InventoryUi(source);
 if(out.includes('/* LV8810_LOCATION_AUTO_APPLY */'))return out;
 const marker="contextLocationChanged(value){";
 if(!out.includes(marker))throw Error('V88.19: Zaehlort-Auswahl konnte nicht sicher angebunden werden.');
 // Direkt nach normaler Standortauswahl (bekannt oder neu) darf nicht noch
 // eine separate Checkbox erforderlich sein.
 const old="   saveContext();contextMessage();\n  },\n  contextToggle()";
 if(!out.includes(old))throw Error('V88.19: Erwartete Zaehlort-Speicherstelle fehlt.');
 out=out.replace(old,"   /* LV8810_LOCATION_AUTO_APPLY */ if(String($('inv84Location')?.value||'').trim())$('inv84Apply').checked=true;\n   saveContext();contextMessage();\n  },\n  contextToggle()");
 const before="    try{selected=V84.countContext(row,context(),data.locations)}";
 if(!out.includes(before))throw Error('V88.19: Zaehlort-Leseweg fehlt.');
 // Auch bei einer aelteren gespeicherten Einstellung 'Automatik aus' eine
 // vom Nutzer aktiv ausgewaehlte Position nicht unbemerkt ignorieren.
 out=out.replace(before,"    if(String($('inv84Location')?.value||'').trim()&&!context().apply){$('inv84Apply').checked=true;saveContext();contextMessage();}\n    try{selected=V84.countContext(row,context(),data.locations)}");
 return out;
}

/* V88.19: Die erste Zaehlung wird atomar mit ihrem tatsaechlichen Fundort
 * gespeichert; spaetere Funde duerfen einen alten Stammdaten-Lagerort
 * niemals ungeprueft als ersten Zaehlort ausgeben.
 */
function patchV8811InventoryUi(source){
 let out=patchV8810InventoryUi(source);
 if(out.includes('/* LV8811_FIRST_LOCATION_ATOMIC */'))return out;
 const anchor=' const V84=window.LVInventoryV84Core, V85=window.LVInventoryV85Core;';
 if(!out.includes(anchor))throw Error('V88.19: Inventur-Kernreferenz fehlt.');
 out=out.replace(anchor,anchor+"\n const LV11=window.LV8811LocationCore; if(!LV11)throw Error('V88.19: Lagerort-Schutzmodul nicht geladen.');");
 const first='  addBinPart(id){return this.addCount(id);},';
 if(!out.includes(first))throw Error('V88.19: Ersatz fuer Teilmengenfunktion fehlt.');
 const methods=String.raw`  /* LV8811_FIRST_LOCATION_ATOMIC */
  _lv11WriteCount(id,total,parts,primary){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));
   if(!row||data.session.status!=='draft'||busy)return false;
   const all=Array.isArray(parts)?parts:LV11.parseParts(parts);
   if(all.length)LV11.verify(all,total);
   row.counted_stock=total===null?null:String(total);
   row.bin_parts_json=all.length?JSON.stringify(all):'';
   const change={article_id:Number(id),counted_stock:row.counted_stock,bin_parts_json:row.bin_parts_json};
   if(primary){row.location=primary.location;row.warehouse_id=primary.warehouse_id;change.location=primary.location;change.warehouse_id=primary.warehouse_id;const l=$('inv75-location-'+id),w=$('inv75-warehouse-'+id);if(l)l.value=primary.location;if(w)w.value=String(primary.warehouse_id||'');}
   pending.set(Number(id),{...(pending.get(Number(id))||{article_id:Number(id)}),...change});
   const field=$('inv75-count-'+id);
   if(field)field.value=total===null?'':String(total).replace('.',',');
   cache();status();clearTimeout(timer);timer=setTimeout(()=>flush(),750);
   return true;
  },
  _lv11FirstInput(id,value,row){
   const n=Number(id),raw=String(value??'').trim();
   if(!raw){
    LV11.markDraft(n,false);
    this._lv11WriteCount(n,null,[],{location:row.base_location||'',warehouse_id:row.base_warehouse_id||null});
    return;
   }
   let firstPlan;
   try{
    const chosen=LV11.isDraft(n)&&LV11.parseParts(row.bin_parts_json).length?
     LV11.parseParts(row.bin_parts_json)[0]:V84.countContext(row,context(),data.locations);
    firstPlan=LV11.first(row,raw,chosen);
   }catch(e){
    // Eine unvollstaendige Dezimale waehrend des Tippens darf das Feld
    // nicht zuruecksetzen, wird aber niemals als ungueltiger Wert gespeichert.
    if(/^\d+[,.]$/.test(raw))return;
    message(e.message,false);
    const el=$('inv75-count-'+id);if(el)el.value=row.counted_stock??'';
    return;
   }
   const wasNew=!LV11.isDraft(n);
   LV11.markDraft(n,true);
   this._lv11WriteCount(n,firstPlan.total,firstPlan.parts,firstPlan.firstPlace);
   if(wasNew)message('Erstzählung am Lagerort „'+firstPlan.firstPlace.location+'“ gespeichert. Weitere Funde werden als eigene Teilmengen erfasst.');
  },
  changeFirstLocation(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));
   if(!row||data.session.status!=='draft'||busy||!LV11.hasCount(row.counted_stock))return;
   let place,plan;
   try{place=V84.countContext(row,context(),data.locations);plan=LV11.changeFirst(row,place)}
   catch(e){message(e.message,false);return}
   if(!plan.changed){message('Dieser Erstlagerort ist bereits gespeichert.');return}
   const description=plan.legacy?'Die bisherige Zählung hatte KEINEN eindeutig gespeicherten Erstlagerort.':'Bisheriger Erstlagerort: '+(plan.oldPlace.location||'ohne Lagerort')+'.';
   if(!confirm(description+'\n\nDie erste Teilmenge ('+plan.firstQuantity+' '+row.unit+') jetzt ausdrücklich dem Lagerort „'+place.location+'“ zuordnen? Andere Teilmengen bleiben erhalten.'))return;
   LV11.markDraft(id,false);
   if(this._lv11WriteCount(id,row.counted_stock,plan.parts,plan.firstPlace)){
    message('Erstlagerort verbindlich für diese Inventur geändert: '+place.location+'. Keine Lagerbuchung.');render();
   }
  },
  correctPartQuantity(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));
   if(!row||data.session.status!=='draft'||busy||!LV11.hasCount(row.counted_stock))return;
   let place,parts;
   try{place=LV11.validPlace(V84.countContext(row,context(),data.locations));parts=LV11.parseParts(row.bin_parts_json)}
   catch(e){message(e.message,false);return}
   const part=parts.find(x=>LV11.same(x,place));
   if(!part){message('Am gewählten Lagerort „'+place.location+'“ gibt es noch keine gezählte Teilmenge.',false);return}
   const typed=prompt('Gezählte Teilmenge am Lagerort „'+place.location+'“ korrigieren (nicht die Gesamtsumme):',String(part.quantity));
   if(typed===null)return;
   let plan;try{plan=LV11.correctPart(row,place,typed)}catch(e){message(e.message,false);return}
   if(!confirm('Teilmengen-Korrektur „'+place.location+'“: '+plan.before+' → '+plan.after+' '+row.unit+'; Gesamt '+plan.total+' '+row.unit+'. Jetzt speichern?'))return;
   if(this._lv11WriteCount(id,plan.total,plan.parts)){
    message('Teilmenge am Lagerort „'+place.location+'“ korrigiert und zwischengespeichert.');render();
   }
  },
`;
 out=out.replace(first,methods+first);
 // Zusatzzahlung ohne Unterbrechung der existierenden Inventur als EIN
 // atomarer Aenderungssatz (Menge und Ortsliste zusammen) speichern.
 const beforePlan='plan=window.LV889CountCore.plan(row,calculated,selected);';
 if(!out.includes(beforePlan))throw Error('V88.19: Zusatzmengen-Planer nicht gefunden.');
 out=out.replace(beforePlan,'plan=LV11.addition(row,entered,selected);');
 const beforeSave=`   this.edit(id,'counted_stock',String(calculated.total));
   if(String(row.counted_stock)!==String(calculated.total))return;
   if(plan.parts.length)this.edit(id,'bin_parts_json',JSON.stringify(plan.parts));`;
 if(!out.includes(beforeSave))throw Error('V88.19: bestehende Additionsspeicherung nicht gefunden.');
 out=out.replace(beforeSave,'   if(!this._lv11WriteCount(id,plan.total,plan.parts))return;');
 // Die Meldung darf nicht mehr aus einem alten Feld kommen.
 out=out.replace('plan.newPlace?', 'plan.addedNewPlace?');
 out=out.replace('plan.summary:',"window.LV889CountCore.describe(plan.parts):");
 // Erst-Erfassung und Korrektur zweier verschiedener Lagerorte muessen die
 // alte Default-Ort-Umschreibung in edit() umgehen.
 const editHead="  edit(id,field,value){\n   if(!data||data.session.status!=='draft')return;";
 if(!out.includes(editHead))throw Error('V88.19: geschuetzter Edit-Einstieg fehlt.');
 out=out.replace(editHead,editHead+String.raw`
   if(field==='counted_stock'){
    const current=data.items.find(x=>Number(x.article_id)===Number(id));
    if(current&&(!LV11.hasCount(current.counted_stock)||LV11.isDraft(id))){this._lv11FirstInput(id,value,current);return;}
    if(current&&LV11.hasCount(current.counted_stock)){
     try{
      if(window.LV8810InventoryFocus?.isProtected?.(id))throw Error('Die bisherige Menge ist geschützt. Bitte „Gesamtmenge korrigieren“ wählen.');
      const fixed=LV11.correctTotal(current,value);
      this._lv11WriteCount(id,fixed.total,fixed.parts);
     }catch(e){message(e.message,false);const el=$('inv75-count-'+id);if(el)el.value=current.counted_stock??'';}
     return;
    }
   }`);
 // Nach bestaetigter Eingabe bleibt der Erstlagerort dauerhaft in den
 // Inventur-Zwischenstaenden; der Entwurfs-Fokus-Schutz endet.
 const confirmHead='  async confirmCount(id){';
 const confirmStart=out.indexOf(confirmHead);
 const confirmEnd=out.indexOf('  useContextFor(id){',confirmStart);
 if(confirmStart<0||confirmEnd<confirmStart)throw Error('V88.19: Mengenbestaetigung fehlt.');
 const confirmBlock=out.slice(confirmStart,confirmEnd);
 if(!confirmBlock.includes('if(!await flush())return;'))throw Error('V88.19: Mengenbestaetigung speichert nicht wie erwartet.');
 out=out.slice(0,confirmStart)+confirmBlock.replace('if(!await flush())return;',
  'if(!await flush())return;LV11.markDraft(id,false);window.LV8810InventoryFocus?.protectAll?.();')+out.slice(confirmEnd);
 // Mehrere Lagerorte: nicht die gesamte Summe korrigieren und damit
 // heimlich die fein aufgelösten Ortsmengen verlieren.
 const correctBegin=out.indexOf('  correctTotal(id){');
 const correctEnd=out.indexOf('  ',correctBegin+3);
 const correctText=out.slice(correctBegin,out.indexOf('  },',correctBegin)+5);
 if(!correctText.includes('if(!confirm('))throw Error('V88.19: ausdrueckliche Mengenkorrektur fehlt.');
 const corrected=correctText.replace("   if(!confirm(","   if(LV11.parseParts(row.bin_parts_json).length>1){message('Mehrere Lagerorte: Bitte die Menge am jeweiligen Lagerort korrigieren, nicht die Gesamtsumme überschreiben.',false);return;}\n   if(!confirm(")
 .replace('Bei einer Änderung gehen bisherige Teilmengen je Lagerort verloren und müssen neu erfasst werden.', 'Der erste Zählort bleibt erhalten.');
 out=out.replace(correctText,corrected);
 // Status und Korrekturwerkzeug erscheinen direkt am Artikel. Ein noch
 // ungepruefter Erstlagerort ist unuebersehbar, nie als korrekt dargestellt.
 const display="${x.bin_parts_json?`<p class=\"small\">Teilmengen: ${esc(window.LV889CountCore?.describe(x.bin_parts_json)||x.bin_parts_json)}</p>`:''}";
 if(!out.includes(display))throw Error('V88.19: Lagerort-Teilmengenanzeige nicht gefunden.');
 out=out.replace(display,display+"${x.counted_stock!==null?`<div class=\"lv87-card\"><b>${esc(LV11.status(x))}</b><div class=\"lv87-flex\"><button type=\"button\" class=\"secondary\" ${disabled} onclick=\"LVInventory.changeFirstLocation(${x.article_id})\">Erstlagerort festlegen / korrigieren</button><button type=\"button\" class=\"secondary\" ${disabled} onclick=\"LVInventory.correctPartQuantity(${x.article_id})\">Menge am aktuellen Lagerort korrigieren</button></div></div>`:''}");
 // V88.19: Ein ausgewählter NEUER Zählbereich darf niemals als alter
 // Erstlagerort direkt am schon gezählten Artikel erscheinen.
 const preview='const suggestion=manualPlaceOverrides.has(x.article_id)?null:V85.suggestedPlace(x,context(),data.locations);';
 if(!out.includes(preview))throw Error('V88.19: Anzeige der Lagerortvorschläge verändert.');
 out=out.replace(preview,`const suggestion=LV11.hasCount(x.counted_stock)?null:(manualPlaceOverrides.has(x.article_id)?null:V85.suggestedPlace(x,context(),data.locations));
   const lv11FirstPlace=LV11.hasCount(x.counted_stock)&&x.bin_parts_json?(()=>{try{return LV11.parseParts(x.bin_parts_json)[0]||null}catch{return null}})():null;`);
 const shown='const shownLocation=suggestion?suggestion.location:x.location;\n   const shownWarehouse=suggestion?suggestion.warehouse_id:x.warehouse_id;';
 if(!out.includes(shown))throw Error('V88.19: Lagerort-Anzeige konnte nicht geschützt werden.');
 out=out.replace(shown,`const shownLocation=lv11FirstPlace?lv11FirstPlace.location:(suggestion?suggestion.location:x.location);
   const shownWarehouse=lv11FirstPlace?lv11FirstPlace.warehouse_id:(suggestion?suggestion.warehouse_id:x.warehouse_id);`);
 // Direkte Lagerort-Stammdaten sind nach einer ersten Zählung gesperrt.
 const warehouseSelect='id="inv75-warehouse-${x.article_id}" ${disabled} onchange=';
 if(!out.includes(warehouseSelect))throw Error('V88.19: Zeilen-Lagerauswahl nicht gefunden.');
 out=out.replace(warehouseSelect,'id="inv75-warehouse-${x.article_id}" ${disabled} ${LV11.hasCount(x.counted_stock)?\'disabled title="Erstlagerort geschützt – über die Korrektur ändern"\':\'\'} onchange=');
 const locationInput='id="inv75-location-${x.article_id}" list=';
 if(!out.includes(locationInput))throw Error('V88.19: Zeilen-Lagerort nicht gefunden.');
 out=out.replace(locationInput,'id="inv75-location-${x.article_id}" ${LV11.hasCount(x.counted_stock)?\'readonly title="Erstlagerort geschützt – über die Korrektur ändern"\':\'\'} list=');
 const rowOverride='onclick="LVInventory.useContextFor(${x.article_id})"';
 if(!out.includes(rowOverride))throw Error('V88.19: altes Übertragen des Zählorts nicht gefunden.');
 out=out.replace(rowOverride,'${LV11.hasCount(x.counted_stock)?\'disabled title="Bei gezählten Artikeln nicht den Erstlagerort überschreiben"\':\'\'} onclick="LVInventory.useContextFor(${x.article_id})"');
 // Schutz nicht nur in der Optik, sondern auch beim direkten UI-Methodenaufruf.
 const locHandler='   const row=data.items.find(x=>Number(x.article_id)===Number(id));if(!row)return;';
 const locHandlerStart=out.indexOf('  async locationChangedInline(id,value){');
 if(locHandlerStart<0||!out.slice(locHandlerStart,locHandlerStart+250).includes(locHandler))throw Error('V88.19: Lagerortänderungsschutz fehlt.');
 out=out.slice(0,locHandlerStart)+out.slice(locHandlerStart).replace(locHandler,locHandler+String.raw`
   if(LV11.hasCount(row.counted_stock)){
    const p=LV11.parseParts(row.bin_parts_json)[0];const input=$('inv75-location-'+id);
    if(input)input.value=p?.location??row.location??'';
    message('Erstlagerort ist geschützt. Für weitere Funde oben den Zählbereich wählen. Ändern nur über „Erstlagerort festlegen / korrigieren“.',false);return;
   }`);
 const warehouseHandler='warehouseChanged(id,value){const row=data.items.find(x=>x.article_id===id);if(!row)return;';
 if(!out.includes(warehouseHandler))throw Error('V88.19: Zeilen-Lagerwechsel nicht gefunden.');
 out=out.replace(warehouseHandler,warehouseHandler+"if(LV11.hasCount(row.counted_stock)){message('Erstlager ist geschützt. Bitte über die Korrektur ändern.',false);render();return;}");
 const contextHandler='  useContextFor(id){\n   const row=data?.items.find(x=>Number(x.article_id)===Number(id));if(!row)return;';
 if(!out.includes(contextHandler))throw Error('V88.19: Kontextübernahme nicht gefunden.');
 out=out.replace(contextHandler,contextHandler+"\n   if(LV11.hasCount(row.counted_stock)){message('Der Erstlagerort ist geschützt. Für zusätzliche Funde den Zählbereich oben nutzen.',false);return;}");
 // Der Nutzer hat einen neuen Lagerort eingetippt: wie bei weiteren Mengen
 // die bestehende Stammdatenanlage anbieten, ohne extra Button.
 const locStart=out.indexOf('  contextLocationChanged(value){');
 const locEnd=out.indexOf('  contextToggle(){',locStart);
 if(locStart<0||locEnd<locStart)throw Error('V88.19: Lagerortwahl nicht gefunden.');
 let locCode=out.slice(locStart,locEnd);
 const tail='   saveContext();contextMessage();';
 if(!locCode.includes(tail))throw Error('V88.19: Lagerortwahl-Speicherung fehlt.');
 locCode=locCode.replace(tail,tail+"\n   if(String(value||'').trim()&&!location){this.addContextLocation().catch(e=>message(e.message,false));}");
 out=out.slice(0,locStart)+locCode+out.slice(locEnd);
 return out;
}

function patchV8811InventoryCore(source){
 const orig=String(source);
 if(orig.includes('/* LV8811_PRIMARY_FROM_COUNT */'))return orig;
 const old="if(x.location!==x.current_location||x.warehouse_id!==x.current_warehouse_id){run('UPDATE articles SET location=?,warehouse_id=? WHERE id=?',[x.location,x.warehouse_id,x.article_id]);locations++}";
 if(!orig.includes(old))throw Error('V88.19: Inventur-Abschluss-Lagerortschutz nicht gefunden.');
 const next=`/* LV8811_PRIMARY_FROM_COUNT */
      const _lv11Parts=x.bin_parts_json?parseParts(x.bin_parts_json,x.unit):[];
      const _lv11Primary=_lv11Parts.find(p=>p.quantity>0)||_lv11Parts[0]||{location:x.location,warehouse_id:x.warehouse_id};
      if(_lv11Primary.location!==x.current_location||_lv11Primary.warehouse_id!==x.current_warehouse_id){run('UPDATE articles SET location=?,warehouse_id=? WHERE id=?',[_lv11Primary.location,_lv11Primary.warehouse_id,x.article_id]);locations++}`;
 return orig.replace(old,next);
}

/* V88.19: preflight with article number and unit BEFORE any inventory save.
   Valid rows can be stored even while an invalid draft remains safely retained.
   This changes only inventory_ui.js (no database schema or stock postings). */
function patchV8812InventoryUi(source){
 let out=patchV8811InventoryUi(source);
 if(out.includes('/* LV8812_SAFE_DRAFTS */'))return out;
 const start=out.indexOf(' async function flush(){');
 const end=out.indexOf(' async function load(id,discard=false)',start);
 if(start<0||end<start||end-start>4800)throw Error('V88.19: sichere Speicherroutine wurde verändert; keine riskante Umstellung.');
 let block=out.slice(start,end);
 const declaration='const sent=[...pending.values()].map(x=>({...x})),captured=new Map(sent.map(x=>[x.article_id,JSON.stringify(x)]));';
 if(!block.includes(declaration))throw Error('V88.19: erwartete Entwurfszuordnung fehlt.');
 block=block.replace(declaration,`/* LV8812_SAFE_DRAFTS */
  const _lv12Raw=[...pending.values()].map(x=>({...x}));
  const _lv12Guard=window.LV8812SaveGuard;
  if(!_lv12Guard)throw Error('V88.19 Speicherprüfung fehlt. Bitte die Anwendung aktualisieren.');
  const _lv12Scan=_lv12Guard.inspect(_lv12Raw,data.items);
  const sent=_lv12Scan.valid;
  if(_lv12Scan.invalid.length&&!sent.length){
   cache();errorState=true;status();
   message(_lv12Guard.describe(_lv12Scan.invalid)+' Die übrige Inventur bleibt erhalten.',false);
   return false;
  }
  const captured=new Map(sent.map(x=>[x.article_id,JSON.stringify(x)]));`);
 const success="cache();errorState=false;message('Zwischenstand gespeichert. Bestände wurden noch nicht verändert.');\n    return true;";
 if(!block.includes(success))throw Error('V88.19: Speicherrückmeldung wurde verändert.');
 block=block.replace(success,`cache();errorState=!!_lv12Scan.invalid.length;
    if(_lv12Scan.invalid.length){
     message(_lv12Guard.describe(_lv12Scan.invalid)+' Andere gültige Zählungen sind gespeichert. Bitte nur die markierten Eingaben berichtigen.',false);
     return false;
    }
    message('Zwischenstand gespeichert. Bestände wurden noch nicht verändert.');
    return true;`);
 out=out.slice(0,start)+block+out.slice(end);
 // Persistent, explicit explanation while the user types or navigates back.
 const statusHead="$('inv75Saved').className=pending.size?'small inv75-dirty':'small';";
 if(!out.includes(statusHead))throw Error('V88.19: Anzeige des Inventur-Speicherstands fehlt.');
 out=out.replace(statusHead,statusHead+`
  window.LV8812SaveGuard?.render(document,window.LV8812SaveGuard.inspect([...pending.values()],data.items).invalid,{
   repair:id=>window.LVInventory.repairInvalidCount(id),
   backup:()=>window.LVInventory.recovery()
  });`);
 const before='  recovery(){';
 if(!out.includes(before))throw Error('V88.19: bestehende lokale Sicherung fehlt.');
 const repair=String.raw`  /* LV8812_REPAIR_INVALID_COUNT */
  async repairInvalidCount(id){
   if(!data||data.session.status!=='draft'||busy)return;
   const n=Number(id),row=data.items.find(x=>Number(x.article_id)===n),item=pending.get(n);
   if(!row||!item){message('Keine ungespeicherte Eingabe für diesen Artikel gefunden.',false);return;}
   const guard=window.LV8812SaveGuard;
   const issue=guard.inspect([item],[row]).invalid.find(x=>x.article_id===n);
   if(!issue||!issue.countIssue){message('Keine ungültige Zählmenge vorhanden.',false);return;}
   if(row.bin_parts_json||item.bin_parts_json){message('Für diesen Artikel existieren Lagerort-Teilmengen. Bitte diese zuerst prüfen; nichts wird automatisch gelöscht.',false);return;}
   const msg='Artikel '+row.article_no+' – '+row.description+'\nUngültige Zählmenge: '+String(item.counted_stock??row.counted_stock)+' '+row.unit+'\n\nNur DIESEN ungespeicherten Zählwert zurücksetzen? Bereits gespeicherte Bestände und andere Artikel bleiben unverändert. Eine lokale Sicherungsdatei wird zuvor heruntergeladen.';
   if(!confirm(msg))return;
   cache();this.recovery();
   pending.set(n,{...item,counted_stock:null,bin_parts_json:''});
   row.counted_stock=null;row.bin_parts_json='';
   window.LV8811LocationCore?.markDraft?.(n,false);
   const field=$('inv75-count-'+n);if(field)field.value='';
   cache();status();
   clearTimeout(timer);
   if(await flush())message('Ungültigen Zählwert für Artikel '+row.article_no+' zurückgesetzt; übrige Inventur erfolgreich gespeichert.');
  },
`;
 out=out.replace(before,repair+before);
 return out;
}

/* V88.19: Gesamtmengen-Korrektur ohne entsperrbaren Fokus/readonly-Status.
   Der neue Wert wird im Prompt abgefragt, validiert und nach zweiter Bestaetigung atomar gespeichert. */
function patchV8813InventoryUi(source){
 let out=patchV8812InventoryUi(source);
 if(out.includes('/* LV8813_CORRECTION_PROMPT */'))return out;
 const replacement=String.raw`  /* LV8813_CORRECTION_PROMPT */
  async correctTotal(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));
   if(!row||data.session.status!=='draft'||busy)return;
   let parts;
   try{parts=LV11.parseParts(row.bin_parts_json)}catch(e){message(e.message,false);return;}
   if(parts.length>1){message('Dieser Artikel wurde an mehreren Lagerorten gezählt. Bitte „Teilmenge am aktuellen Lagerort korrigieren“ benutzen.',false);return;}
   const entry=prompt('Artikel '+row.article_no+' – '+row.description+'\nBisherige Gesamtmenge: '+row.counted_stock+' '+row.unit+'\n\nNeue Gesamtmenge eingeben (z. B. 3 oder 4,7 bei m). Leeres Feld = Zählung zurücknehmen; 0 = wirklich Null gezählt.',String(row.counted_stock??''));
   if(entry===null)return;
   let total,chosen;
   try{if(String(entry).trim()===''){total=null;chosen=[]}else{const result=LV11.correctTotal(row,entry);total=result.total;chosen=result.parts;}}
   catch(e){message('Keine Korrektur gespeichert: '+e.message,false);return;}
   const before=String(row.counted_stock??'noch nicht gezählt');
   if(!confirm('Artikel '+row.article_no+'\nBisher: '+before+' '+row.unit+'\nNeu: '+(total===null?'noch nicht gezählt':total+' '+row.unit)+'\n\nNur diese Inventur-Zählung jetzt korrigieren? Andere Artikel und die bestehenden Lagerbestände bleiben unverändert.'))return;
   if(!this._lv11WriteCount(id,total,chosen,chosen[0]||undefined))return;
   LV11.markDraft(id,false);window.LV8810InventoryFocus?.protectAll?.();render();
   const stored=await this.save();
   if(stored)message('Korrigierte Gesamtmenge für '+row.article_no+' gespeichert. Bestehende Lagerbestände unverändert.');
   else message('Korrektur ist lokal vorgemerkt, konnte aber noch nicht dauerhaft gespeichert werden. Bitte Fehlermeldung prüfen.',false);
  },`;
 let begin=out.indexOf('  correctTotal(id){'),changes=0;
 while(begin>=0){
  const end=out.indexOf('  },',begin);
  if(end<begin||end-begin>2200)throw Error('V88.19: Gesamtmengen-Korrektur unerwartet; keine unsichere Freigabe.');
  out=out.slice(0,begin)+replacement+out.slice(end+4);
  changes++;begin=out.indexOf('  correctTotal(id){',begin+replacement.length);
 }
 if(!changes)throw Error('V88.19: Gesamtmengen-Korrektur fehlt.');
 return out;
}
/* V88.19: bestaetigte Zaehllagerorte schon beim Sichern in den Artikelstamm schreiben.
   Fuer weitere Orte bleiben die bestaetigten Inventur-Fundorte ueber das Artikel-API sichtbar;
   KEINE Bestandsverteilung oder Mengenbuchung vor dem Inventurabschluss. */
function patchV8813InventoryCore(source){
 let out=patchV8811InventoryCore(source);
 if(out.includes('/* LV8813_MASTER_LOCATION_ON_SAVE */'))return out;
 const before="transaction(()=>{for(const x of changes)run('UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=?,bin_parts_json=? WHERE session_id=? AND article_id=?',[x.quantity,x.location,x.warehouse_id,x.note,x.partsRaw,s.id,x.article_id]);touch(s.id)});";
 if(!out.includes(before))throw Error('V88.19: erwartete Speichertransaktion der Inventur fehlt. Stammdaten unveraendert.');
 const next=`transaction(()=>{
   for(const x of changes){
    run('UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=?,bin_parts_json=? WHERE session_id=? AND article_id=?',[x.quantity,x.location,x.warehouse_id,x.note,x.partsRaw,s.id,x.article_id]);
    /* LV8813_MASTER_LOCATION_ON_SAVE */
    if(x.quantity!==null&&x.partsRaw){
     const parts=parseParts(x.partsRaw,x.unit);const first=parts.find(p=>p.quantity>0)||parts[0];
     if(first){
      // Nachtraeglich korrigierte Fundorte sind explizit bestaetigt; keine alten
      // Artikelorte erraten. Die Zaehlmenge bleibt nur in inventory_counts.
      const old=articles().find(a=>Number(a.id)===Number(x.article_id));
      if(old&&(String(old.location||'')!==String(first.location||'')||Number(old.warehouse_id||0)!==Number(first.warehouse_id||0))){
       run('UPDATE articles SET location=?,warehouse_id=?,warehouse_selection_set=1 WHERE id=?',[first.location,first.warehouse_id,x.article_id]);
       run('UPDATE inventory_counts SET base_location=?,base_warehouse_id=? WHERE session_id=? AND article_id=?',[first.location,first.warehouse_id,s.id,x.article_id]);
       audit(s.technician,'INVENTUR-LAGERORT','Artikel',String(x.article_id),'Erstlagerort bei laufender Inventur bestaetigt: '+first.location+'. Keine Bestandsbuchung.');
      }
     }
    }
   }
   touch(s.id)
  });`;
 return out.replace(before,next);
}
function patchV8813Backend(source){
 let out=patchV888Backend(source);
 if(out.includes('/* LV8813_DRAFT_LOCATION_READ */'))return out;
 const before="if(p==='/api/articles')return response(articles(q.q||'').map(publicArticle));";
 if(!out.includes(before))throw Error('V88.19: Material-API nicht gefunden. Keine veraenderten Artikelstammdaten angezeigt.');
 const after=`if(p==='/api/articles'){
   /* LV8813_DRAFT_LOCATION_READ */
   const result=articles(q.q||'').map(publicArticle);
   try{
    if(tableExists('inventory_counts')&&tableExists('inventory_sessions')){
     const rowsFound=rows("SELECT c.article_id,c.bin_parts_json FROM inventory_counts c JOIN inventory_sessions s ON s.id=c.session_id WHERE s.status='draft' AND c.counted_stock IS NOT NULL ORDER BY s.updated_at DESC");
     const found=new Map();
     for(const x of rowsFound){
      if(found.has(Number(x.article_id)))continue;
      let parts=[];try{parts=JSON.parse(x.bin_parts_json||'[]')}catch{}
      if(!Array.isArray(parts))continue;
      found.set(Number(x.article_id),[...new Set(parts.filter(p=>p&&Number(p.quantity)>=0).map(p=>String(p.location||'').trim()).filter(Boolean))]);
     }
     for(const item of result)item.inventory_count_locations=found.get(Number(item.id))||[];
    }
   }catch(e){console.warn('Inventur-Fundorte konnten nicht angezeigt werden',e)}
   return response(result);
  }`;
 out=out.replace(before,after);
 const insertBefore="if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){";
 if(!out.includes(insertBefore))throw Error('V88.19: OCR-Artikelkorrektur konnte nicht sicher angebunden werden.');
 const route=String.raw`if(p==='/api/articles/ocr-repair/preview'||p==='/api/articles/ocr-repair/commit'){
  /* LV8813_OCR_MASTER_REPAIR: ausdrueckliche nachtraegliche Stammkorrektur.
     Nie neue Lagerbestandsbuchungen, nie stilles Zusammenfuehren von Zahlungen oder Lagerorten. */
  const sourceNo=String(d.source_no||'').trim(),targetNo=String(d.target_no||'').trim();
  if(!/^(?=.*[0-9])[A-Za-z0-9][A-Za-z0-9_\\/-]{3,24}$/.test(sourceNo)||!/^(?=.*[0-9])[A-Za-z0-9][A-Za-z0-9_\\/-]{3,24}$/.test(targetNo))throw Error('Bitte gueltige Materialnummern angeben.');
  const catalog=articles();
  const original=catalog.find(a=>String(a.article_no).toUpperCase()===sourceNo.toUpperCase());
  const destination=catalog.find(a=>String(a.article_no).toUpperCase()===targetNo.toUpperCase());
  const simple=x=>x?{id:Number(x.id),article_no:x.article_no,description:x.description,stock:Number(x.stock),unit:x.unit,active:!!x.active}:null;
  if(!original)return response({ok:true,mode:'none',safe:false,source:null,target:simple(destination),message:'Unter der urspruenglichen OCR-Nummer gibt es keinen Lagerartikel. Nur die PDF-Zuordnung musste berichtigt werden.'});
  if(original.id===destination?.id)return response({ok:true,mode:'none',safe:false,source:simple(original),target:simple(destination),message:'Artikelstamm und Ziel sind bereits identisch.'});
  let mode=destination?'archive':'rename';const reasons=[];
  const fromCounts=tableExists('inventory_counts')?rows('SELECT c.*,s.status session_status FROM inventory_counts c JOIN inventory_sessions s ON s.id=c.session_id WHERE c.article_id=?',[original.id]):[];
  const movements=rows('SELECT id,quantity,movement_type,source FROM movements WHERE article_id=?',[original.id]);
  const liveBins=tableExists('stock_bins_v86')?rows('SELECT id,quantity FROM stock_bins_v86 WHERE article_id=? AND ABS(quantity)>0.00000001',[original.id]):[];
  const affected=fromCounts.filter(c=>c.session_status==='draft');
  if(destination){
   if(!original.active)reasons.push('Der falsche Artikel wurde bereits archiviert.');
   if(!destination.active)reasons.push('Der Zielartikel ist inaktiv und muss zunaechst geprueft werden.');
   if(Math.abs(Number(original.initial_stock||0))>0.00000001||Math.abs(Number(original.stock||0))>0.00000001)reasons.push('Der falsche Artikel besitzt einen eigenen Lagerbestand.');
   if(movements.some(m=>Math.abs(Number(m.quantity||0))>0.00000001))reasons.push('Es gibt echte Ein-/Ausbuchungen fuer den falschen Artikel.');
   if(liveBins.length)reasons.push('Es gibt Teilbestaende an Lagerorten.');
   if(fromCounts.some(c=>c.counted_stock!==null&&c.counted_stock!==undefined || String(c.bin_parts_json||'')!=='' || String(c.note||'')!=='' || String(c.location||'')!==String(c.base_location||'') || Number(c.warehouse_id||0)!==Number(c.base_warehouse_id||0)))reasons.push('Der falsche Artikel hat bearbeitete Inventurpositionen oder eine bestaetigte Zaehlung.');
   const safeRefTables=new Set(['movements','inventory_counts','import_position_results','stock_bins_v86']);
   for(const t of rows("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")){
    const name=String(t.name||'');if(!/^[A-Za-z0-9_]+$/.test(name)||safeRefTables.has(name))continue;
    if(!rows('PRAGMA table_info("'+name+'")').some(c=>c.name==='article_id'))continue;
    const n=Number(scalar('SELECT COUNT(*) FROM "'+name+'" WHERE article_id=?',[original.id])||0);
    if(n)reasons.push('Weitere gespeicherte Verknuepfungen vorhanden ('+name+': '+n+').');
   }
  } else {
   if(!original.active)reasons.push('Der Ursprungseintrag ist inaktiv; eine manuelle Pruefung ist erforderlich.');
   // Eine Umbenennung behaelt die Artikel-ID; Buchungen und Teilbestaende bleiben damit unveraendert.
  }
  const safe=reasons.length===0;
  const result={ok:true,mode,safe,source:simple(original),target:simple(destination),
   drafted_rows:affected.length,counted_rows:fromCounts.filter(c=>c.counted_stock!==null).length,
   movements:movements.length,blocking_reasons:reasons,
   message:!safe?'Automatische Korrektur gesperrt: '+reasons.join(' '):mode==='archive'? 'Der unbenutzte OCR-Fehlartikel kann archiviert werden. Der korrekte Lagerartikel bleibt unveraendert.': 'Die Materialnummer kann im vorhandenen Artikelstamm korrigiert werden. Historie, Zaehllisten und Artikel-ID bleiben erhalten.'};
  if(p==='/api/articles/ocr-repair/preview')return response(result);
  if(!safe)throw Error(result.message);
  if(d.confirm!==true||d.expected_mode!==mode||Number(d.expected_source_id)!==Number(original.id)||Number(d.expected_target_id||0)!==Number(destination?.id||0))throw Error('Die Stammdaten haben sich moeglicherweise veraendert. Bitte erst die Korrekturvorschau aktualisieren und ausdruecklich bestaetigen.');
  if(!await adminAuthorized(d,opt))throw Error('Fuer die Korrektur des Artikelstamms ist die Administratorfreigabe erforderlich. Bitte Administratorbereich freischalten.');
  await createBackup('Sicherheitsbackup','Vor OCR-Artikelkorrektur '+original.article_no);
  const technician=setting('primary_technician','Techniker');
  runTransaction(()=>{
   if(mode==='rename'){
    run('UPDATE articles SET article_no=?,description=? WHERE id=?',[targetNo,String(d.target_description||original.description).trim()||original.description,original.id]);
    if(tableExists('inventory_counts'))run("UPDATE inventory_counts SET article_no=? WHERE article_id=? AND session_id IN (SELECT id FROM inventory_sessions WHERE status='draft')",[targetNo,original.id]);
    for(const c of affected)run('UPDATE inventory_sessions SET version=version+1,updated_at=? WHERE id=?',[stamp(),c.session_id]);
    audit(technician,'OCR-ARTIKELKORREKTUR','Artikel',String(original.id),'Artikelnummer: '+original.article_no+' -> '+targetNo+'; Artikel-ID, Bestand, Historie und Zaehlungen erhalten.');
   }else{
    run('UPDATE articles SET active=0,notes=? WHERE id=?',[(String(original.notes||'')+'\\nOCR-Fehlimport: korrigiert zu '+destination.article_no+' am '+stamp()).trim(),original.id]);
    // Ausschliesslich UNGEZAEHLTE, unveraenderte Zeilen in offenen Inventuren bereinigen.
    for(const c of affected){run('DELETE FROM inventory_counts WHERE session_id=? AND article_id=?',[c.session_id,original.id]);run('UPDATE inventory_sessions SET version=version+1,updated_at=? WHERE id=?',[stamp(),c.session_id]);}
    audit(technician,'OCR-FEHLIMPORT-ARCHIV','Artikel',String(original.id),'Unbenutzter OCR-Fehlartikel '+original.article_no+' archiviert; richtiger Artikel '+destination.article_no+' #'+destination.id+' unveraendert. Offene ungezaehlte Doppelpositionen entfernt.');
   }
  });
  await persist();
  return response({ok:true,mode,corrected:true,source:simple(original),target:simple(destination),message:mode==='rename'?'Artikelnummer im Stamm berichtigt. Bestehende Artikel-ID und Bewegungen erhalten.':'Unbenutzter falsch angelegter OCR-Artikel wurde archiviert. Richtigem Artikel wird nichts hinzugebucht.'});
 }
 `;
 out=out.replace(insertBefore,route+insertBefore);
 return out;
}

/* V88.19: Ein bereits unter falscher OCR-Artikelnummer gezaehlter
 * ENTWURFS-Zaehlstand kann nach Backup gezielt zum korrekten Artikel wandern.
 * Buchbestand, Artikelstamm, Bewegungen und sonstige Inventuren bleiben UNBERUEHRT.
 */
function patchV8816InventoryCore(source){
 let out=patchV8813InventoryCore(source);
 if(out.includes('/* LV8816_TRANSFER_COUNT */'))return out;
 const anchor=/\bconst s=draft\(d\);\s*(?=if\(name==='company-import'\)\{)/;
 if(!anchor.test(out))throw Error('V88.19: Inventur-Schutzposition fuer sichere OCR-Zaehlübertragung nicht gefunden.');
 const replacement=String.raw`   const s=draft(d);
   if(name==='ocr-transfer-count'){
    /* LV8816_TRANSFER_COUNT */
    if(d.confirm!==true||d.acknowledge_stock_unmoved!==true)error('Bitte die Uebertragung und den unveraenderten Buchbestand ausdruecklich bestaetigen.');
    const sourceId=Number(d.source_article_id),targetId=Number(d.target_article_id);
    if(!Number.isSafeInteger(sourceId)||!Number.isSafeInteger(targetId)||sourceId===targetId||sourceId<=0||targetId<=0)error('Ungueltige Artikelzuordnung.');
    const cs=rows('SELECT * FROM inventory_counts WHERE session_id=? AND article_id=?',[s.id,sourceId])[0];
    const ct=rows('SELECT * FROM inventory_counts WHERE session_id=? AND article_id=?',[s.id,targetId])[0];
    if(!cs||!ct)error('Beide Artikel muessen in dieser laufenden Inventur vorhanden sein.');
    if(String(cs.article_no).toUpperCase()!==String(d.source_no||'').trim().toUpperCase()||String(ct.article_no).toUpperCase()!==String(d.target_no||'').trim().toUpperCase())error('Artikelnummern geaendert. Bitte erneut pruefen.');
    if(cs.counted_stock===null||ct.counted_stock!==null)error('Die Quellmenge muss gezaehlt und die Zielmenge noch leer sein. Keine vorhandene Zaehlsumme ueberschreiben.');
    if(String(cs.unit).trim().toLowerCase()!==String(ct.unit).trim().toLowerCase())error('Einheiten unterschiedlich. Kein automatisches Umbuchen von Stueck und Metern.');
    if(!Number.isFinite(Number(cs.counted_stock))||Number(cs.counted_stock)<0||Math.abs(Number(cs.counted_stock)-Number(d.expected_count))>1e-8)error('Die erwartete Quellmenge hat sich geaendert. Bitte erneut abgleichen.');
    const source=articles().find(a=>Number(a.id)===sourceId),target=articles().find(a=>Number(a.id)===targetId);
    if(!source?.active||!target?.active)error('Mindestens einer der Lagerartikel ist inaktiv. Vor Korrektur pruefen.');
    const normal=x=>String(x||'').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/[^a-z0-9äöüß]/g,'');
    if(normal(cs.description)!==normal(ct.description)&&d.confirm_different_description!==true)error('Bezeichnungen weichen voneinander ab. Keine automatische Zaehlübertragung.');
    const quantity=count(cs.counted_stock,ct.unit);
    const parts=parseParts(cs.bin_parts_json,ct.unit);
    if(parts.length&&Math.abs(parts.reduce((sum,x)=>sum+x.quantity,0)-quantity)>1e-7)error('Die Lagerort-Teilmengen passen nicht zum Zaehlstand.');
    validLocation(String(cs.location||''),ct.base_location);
    await backup('Sicherheitsbackup','Vor OCR-Zaehlübertragung '+cs.article_no+' zu '+ct.article_no+' in '+s.name);
    transaction(()=>{
     run('UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=?,bin_parts_json=? WHERE session_id=? AND article_id=?',
      [quantity,cs.location,cs.warehouse_id,cs.note,cs.bin_parts_json,s.id,targetId]);
     run('UPDATE inventory_counts SET counted_stock=NULL,bin_parts_json=? WHERE session_id=? AND article_id=?',['',s.id,sourceId]);
     touch(s.id);
     audit(s.technician,'INVENTUR-OCR-ZAEHLUNG','Inventur',s.id,
      'Manuell bestaetigt: '+quantity+' '+cs.unit+' von '+cs.article_no+' (Artikel-ID '+sourceId+') auf '+ct.article_no+' (Artikel-ID '+targetId+') uebertragen. Kein Lagerbestand oder Bewegungsdatensatz geaendert.');
    });
    await durable();return view(s.id);
   }
   `;
 return out.replace(anchor,replacement);
}

async function shapeResponse(response,pathname,navigation){
 if(!response||!response.ok)return response;
 if(navigation)return withV88Html(response);
 if(!pathname.endsWith('/v87_ui.js')&&!pathname.endsWith('/v87_pdf.js')&&!pathname.endsWith('/local_backend.js')&&!pathname.endsWith('/inventory_ui.js')&&!pathname.endsWith('/inventory_core.js'))return response;
 const text=await response.text();
 const code=pathname.endsWith('/v87_pdf.js')?patchV886Pdf(text):pathname.endsWith('/v87_ui.js')?patchV889Ui(text):pathname.endsWith('/inventory_ui.js')?patchV8813InventoryUi(text):pathname.endsWith('/inventory_core.js')?patchV8816InventoryCore(text):patchV8813Backend(text);
 const headers=new Headers(response.headers);headers.delete('content-length');
 headers.set('content-type','application/javascript; charset=utf-8');
 return new Response(code,{status:response.status,statusText:response.statusText,headers});
}
async function withV88Html(response){
 if(!response||!response.ok)return response;
 const ct=response.headers.get('content-type')||'';
 if(!ct.includes('html'))return response;
 const html=injectHtml(await response.text());
 const h=new Headers(response.headers);h.delete('content-length');
 h.set('content-type','text/html; charset=utf-8');
 return new Response(html,{status:response.status,statusText:response.statusText,headers:h});
}
if(typeof self!=='undefined'&&self.addEventListener){
 self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await Promise.allSettled([...new Set(FILES)].map(file=>cache.add(file)));
  await self.skipWaiting();
 })()));
 self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await Promise.all((await caches.keys()).filter(k=>/^lv(?:\d|[-_])/i.test(k)&&k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
 })()));
 self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  const navigation=req.mode==='navigate';
  const networkFirst=navigation||/\.(?:html|js|mjs|webmanifest)$/.test(url.pathname);
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   const shape=async raw=>shapeResponse(raw,url.pathname,navigation);
   if(networkFirst){
    try{
     const fetched=await fetch(req,{cache:'no-store'});
     if(fetched.ok){const shaped=await shape(fetched);await cache.put(req,shaped.clone());return shaped}
     const older=await cache.match(req)||(navigation&&(await cache.match('./')||await cache.match('index.html')));return older?shape(older):fetched;
    }catch{
     const old=await cache.match(req)||await caches.match(req)||(navigation&&(await cache.match('./')||await cache.match('index.html')));
     return old?shape(old):Response.error();
    }
   }
   const old=await cache.match(req)||await caches.match(req);
   if(old)return old;
   try{const fresh=await fetch(req);if(fresh.ok)await cache.put(req,fresh.clone());return fresh}
   catch{return Response.error()}
  })());
 });
}
if(typeof module==='object'&&module.exports)module.exports={injectHtml,patchV87Ui,patchV885Ui,patchV886Ui,patchV87Pdf,patchV886Pdf,patchV888Ui,patchV888Backend,patchV889Focus,patchV889Ui,patchV889InventoryUi,patchV8810InventoryUi,patchV8811InventoryUi,patchV8811InventoryCore,patchV8812InventoryUi,patchV8813InventoryUi,patchV8813InventoryCore,patchV8816InventoryCore,patchV8813Backend,FILES,CACHE_NAME};
