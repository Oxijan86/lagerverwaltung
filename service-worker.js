/* Lagerverwaltung Lovrencic V88.7 – sicherer Import, Prüf-Rückstellung und Original-PDF-Overlay und sichere Inventurfortsetzung des bestehenden V86/V87-Repos.
 * Das bisherige index.html wird beim Abruf um die bereits im Repo befindlichen
 * V87-Module und um die V88-OCR-Prüfung ergänzt. Die DB bleibt unverändert.
 */
'use strict';
const CACHE_NAME='lv88-7-2026-11-19-safe-export-active-session-v1';
const FILES=[
 './','index.html','manifest.webmanifest','v87_core.js','v87_pdf.js','v88_2_catalog.js','v88_3_setup.js','v88_3_review.js','v88_4_export.js','v88_4_help.js','v88_5_import.js','v88_6_pdf.js','v88_7_inventory_guard.js','v87_ui.js','v88_ocr.js',
 'inventory_core.js','inventory_ui.js','inventory_v84_core.js','inventory_v85_core.js',
 'inventory_company_v86.js','service_pdf_core.js','service_pdf_reader.js','service_pdf_ui.js',
 'service_pdf_backend.js','local_backend.js','app_rules.js','auth_core.js','sync_core.js',
 'warehouse_core.js','warehouse_ui.js','v66_core.js','v67_core.js','v68_core.js','v69_core.js',
 'sync_ui_v81.js','sync_ui_v82.js','sync_merge_v81.js','sync_merge_v82.js',
 'material_booking_v83_core.js','material_booking_v83_ui.js','stock_bins_v86.js',
 'stock_bins_v86_ui.js',
 'vendor/pdfjs/pdf.min.mjs','vendor/pdfjs/pdf.worker.min.mjs',
 'vendor/tesseract/tesseract.min.js','vendor/tesseract/worker.min.js',
 'v88_5_import.js?v=88.7','v88_6_pdf.js?v=88.7','v88_7_inventory_guard.js?v=88.7','v88_4_export.js?v=88.7','v87_pdf.js?v=88.7','v87_ui.js?v=88.7','v88_2_catalog.js?v=88.7'
];
const ADDONS=[
 ['vendor/tesseract/tesseract.min.js','Tesseract'],
 ['v87_core.js','LV87Core'],
 ['v87_pdf.js','LV87PDF'],
 ['v88_6_pdf.js','LV886PDF'],
 ['v88_2_catalog.js','LV882Catalog'],
 ['v88_3_setup.js','LV883Setup'],
 ['v88_3_review.js','LV883Review'],
 ['v88_4_export.js','LV884Export'],
 ['v88_4_help.js','LV884Help'],
 ['v88_5_import.js','LV885Import'],
 ['v87_ui.js','LV87'],
 ['v88_ocr.js','LV88OCR'],
 ['v88_7_inventory_guard.js','LV887InventoryGuard']
];
function injectHtml(html){
 let out=String(html);
 if(!/<\/body\s*>/i.test(out))return out;
 if(out.includes('Lagerverwaltung V88.7:')&&out.includes('data-lv88-boot='))return out;
 // Eine alte Offline-Antwort kann bereits ein V88.1/V88.4-Scriptpaket enthalten.
 // Dieses vollständig ersetzen; sonst bliebe die neue PDF-Einleselogik unsichtbar.
 out=out.replace(/<!--\s*Lagerverwaltung V88[\s\S]*?-->\s*<span data-lv88-boot=\"1\" hidden><\/span>[\s\S]*?(?=<\/body\s*>)/i,'');
 if(out.includes('data-lv88-boot='))return out;
 const extra=ADDONS.filter(([src])=>!new RegExp('<script\\b[^>]*\\bsrc=["\\\']'+src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\']','i').test(out))
   .map(([src])=>'<script src="'+src+'?v=88.7" defer></script>').join('\n');
 // Nicht direkt im head einhängen: Das vollständige V86-App-Gerüst muss vorliegen.
 return out.replace(/<\/body\s*>/i,'\n<!-- Lagerverwaltung V88.7: Datenbestand unverändert, verlustfreier PDF-Export und geprüfter PDF-Import -->\n<span data-lv88-boot="1" hidden></span>\n'+extra+'\n</body>');
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
    s.src=new URL('v88_5_import.js?v=88.7',document.baseURI).href;
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

/* V88.7: Markierungen "Später zuordnen" bleiben in der gespeicherten
 * PDF-Prüfliste. Nur eindeutig bestätigte Positionen werden angelegt.
 */
function patchV886Ui(source){
 let out=patchV885Ui(source);
 if(out.includes('/* LV886_DEFERRED_IMPORT */'))return out;
 const start='async function commitRows(){\n  const rows=state.rows;';
 if(!out.includes(start))throw Error('V88.7: Commit-Stelle in v87_ui.js wurde verändert. Kein unsicheres Update.');
 out=out.replace(start,`async function commitRows(){
  /* LV886_DEFERRED_IMPORT */
  const deferred=state.rows.filter(x=>x.review_action==='defer');
  const rows=state.rows.filter(x=>x.review_action!=='defer');
  if(!rows.length)throw Error('Noch keine Artikelposition zur Übernahme freigegeben. Zurückgestellte Artikel bleiben gespeichert.');`);
 const all="const all=state.rows.map((r,i)=>({r,i,status:rowStatus(r,cmp)}));";
 if(!out.includes(all))throw Error('V88.7: Prüfansicht konnte nicht sicher aktualisiert werden.');
 out=out.replace(all,"const all=state.rows.map((r,i)=>({r,i,status:r.review_action==='defer'?'deferred':rowStatus(r,cmp)}));");
 const errors="const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>!Core.validNo(x.article_no)||!x.description||x.verified===false);";
 if(!out.includes(errors))throw Error('V88.7: Prüfzählung nicht gefunden.');
 out=out.replace(errors,"const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>x.review_action!=='defer'&&(!Core.validNo(x.article_no)||!x.description||x.verified===false));");
 const option='<option value="unsicher">Unsicher</option>';
 if(!out.includes(option))throw Error('V88.7: Prüf-Filter fehlt.');
 out=out.replace(option,option+'<option value="deferred">Später zuordnen</option>');
 const done="state.verified=true;";
 if(!out.includes(done))throw Error('V88.7: Prüfstatus fehlt.');
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
 if(!match)throw Error('V88.7: PDF-Renderfunktion unbekannt. Kein riskanter Weißseitenexport.');
 const replacement=match[0]+`
  /* LV886_SAFE_PDF_DELEGATE */
  if(!window.LV886PDF?.render)throw Error('Verlustfreier RONDO-PDF-Export V88.7 ist nicht geladen. Bitte Version 88.7 aktualisieren.');
  return window.LV886PDF.render(originalBytes,rows,quantities,onProgress,cancelled,typeof meta!=='undefined'?meta:{});
 `;
 return out.replace(match[0],replacement);
}

async function shapeResponse(response,pathname,navigation){
 if(!response||!response.ok)return response;
 if(navigation)return withV88Html(response);
 if(!pathname.endsWith('/v87_ui.js')&&!pathname.endsWith('/v87_pdf.js'))return response;
 const code=pathname.endsWith('/v87_pdf.js')?patchV886Pdf(await response.text()):patchV886Ui(await response.text());
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
if(typeof module==='object'&&module.exports)module.exports={injectHtml,patchV87Ui,patchV885Ui,patchV886Ui,patchV87Pdf,patchV886Pdf,FILES,CACHE_NAME};
