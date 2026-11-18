/* Lagerverwaltung Lovrencic V87 – optional SAP first inventory, compulsory RONDO first
 * count, annual RONDO import / PDF export, discrepancy report, item-by-item transfers,
 * inventory keyboard speed search. Add-on for the unchanged V86 database/API.
 */
(function(){'use strict';
 const Core=window.LV87Core,PDF=window.LV87PDF,$=id=>document.getElementById(id);
 if(!Core||!PDF){console.error('V87-Komponenten fehlen.');return}
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const style=document.createElement('style');style.textContent=`
 .lv87-card{border:2px solid #91a5b5;border-radius:12px;padding:14px;margin:12px 0;background:var(--card-bg,#fff);min-width:0}
 .lv87-card h3{margin-top:0}.lv87-flex{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.lv87-flex>*{min-width:0}
 .lv87-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px;margin:10px 0}
 .lv87-grid label{display:block}.lv87-field{width:100%;min-width:0}.lv87-table{width:100%;border-collapse:collapse}
 .lv87-table td,.lv87-table th{border-bottom:1px solid #cdd6df;padding:7px;text-align:left;vertical-align:top}
 .lv87-table input[type=number]{width:90px;max-width:100%}.lv87-bad{color:#a20d0d;font-weight:600}
 .lv87-good{color:#176637;font-weight:600}.lv87-warn{color:#875900;font-weight:600}
 .lv87-hint{font-size:13px;color:#555;line-height:1.5}.lv87-status{padding:10px;border-radius:8px;background:#f0f4f8;margin:8px 0;white-space:pre-wrap}
 .lv87-suggestions{position:absolute;z-index:900;width:100%;max-height:240px;overflow-y:auto;background:#fff;border:1px solid #8698a8;box-shadow:0 5px 15px #0002;border-radius:6px;display:none;color:#111}
 .lv87-suggestions button{display:block;width:100%;text-align:left;border:0;border-radius:0;padding:10px;background:#fff;color:#111;cursor:pointer}
 .lv87-suggestions button[aria-selected=true]{background:#daeaff}.lv87-suggestions button:hover{background:#e5effa}
 .lv87-mask{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:1800;overflow:auto;padding:16px}
 .lv87-dialog{max-width:960px;margin:3vh auto;background:#fff;border-radius:14px;padding:20px;color:#202a32;box-sizing:border-box}
 .lv87-dialog button{min-height:43px}.lv87-dialog .small{color:#52606d}.lv87-page{max-height:45vh;overflow:auto}
 .lv87-countline{display:inline-block;padding:3px 8px;border-radius:6px;background:#e9eef3}
 @media(max-width:640px){.lv87-dialog{margin:0;padding:14px}.lv87-table{font-size:13px}.lv87-table input{max-width:95px}.lv87-grid{grid-template-columns:1fr 1fr}}
 `;document.head.appendChild(style);
 let records=[],loadedPdf=null,scanBusy=false,scanCancelled=false,stagingMode='annual',reviewPage=0,reviewFilter='all',transferBusy=false,reviewSaveTimer=null;
 const state={fileHash:'',pages:[],rows:[],sourceName:'',beleg:'',scanWarnings:[],verified:false,setupMandatory:false};
 const post=(url,d)=>window.api(url,{method:'POST',body:JSON.stringify(d)});
 const notification=(id,message,bad=false)=>{const el=$(id);if(!el)return;el.textContent=message;el.className='lv87-status'+(bad?' lv87-bad':'')};
 const fileBase64=async file=>{const buf=new Uint8Array(await file.arrayBuffer());let raw='';const size=8192;for(let i=0;i<buf.length;i+=size)raw+=String.fromCharCode(...buf.subarray(i,i+size));return btoa(raw)};
 async function dbId(){try{return (await window.api('/api/inventory-v75/index')).database_id||'current'}catch{return 'current'}}
 function key(id){return 'lv87-company-pdf:'+String(id||'current')}
 function getFlags(){try{return JSON.parse(localStorage.getItem('lv87-firstsetup:'+ (state.database_id||'current'))||'null')}catch{return null}}
 function flagSave(p){const id=state.database_id||'current';const old=getFlags()||{};localStorage.setItem('lv87-firstsetup:'+id,JSON.stringify({...old,...p,date:new Date().toISOString()}));}
 function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('lv87-rondo-pdf',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('snapshots'))req.result.createObjectStore('snapshots')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
 async function storePdf(data){const id=state.database_id||await dbId(),db=await openDb();try{await new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readwrite'),obj=t.objectStore('snapshots');obj.put(data,id);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}finally{db.close()}}
 async function getPdf(){const db=await openDb();try{return await new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readonly'),r=t.objectStore('snapshots').get(state.database_id||'current');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}finally{db.close()}}
 function ensureDialog(){let mask=$('lv87Modal');if(mask)return mask;mask=document.createElement('div');mask.id='lv87Modal';mask.className='lv87-mask';mask.hidden=true;mask.innerHTML=`<div class="lv87-dialog" role="dialog" aria-modal="true" aria-labelledby="lv87ModalTitle">
   <h2 id="lv87ModalTitle">RONDO-Firmeninventur</h2><div id="lv87ModalBody"></div>
   <div class="lv87-flex"><button class="secondary" id="lv87Close" type="button">Zur Inventur zurück</button><button class="secondary" id="lv87CancelOCR" type="button" hidden>Texterkennung abbrechen</button></div></div>`;
   document.body.appendChild(mask);$('lv87Close').onclick=()=>{if(scanBusy)return alert('Bitte erst die Texterkennung abbrechen.');mask.hidden=true};$('lv87CancelOCR').onclick=()=>{scanCancelled=true;notification('lv87ScanStatus','Abbruch angefordert, bitte warten …')};return mask}
 function dialog(html,title='RONDO-Firmeninventur'){const m=ensureDialog();$('lv87ModalTitle').textContent=title;$('lv87ModalBody').innerHTML=html;m.hidden=false;return $('lv87ModalBody')}
 function failed(s){notification('lv87ScanStatus',s,true)}
 function makeFileInput(value='pdf'){return `<label>${value==='pdf'?'RONDO-Inventurliste als PDF':'SAP-Bestandsliste als Excel/CSV'}
   <input type="file" id="lv87ChooseFile" accept="${value==='pdf'?'.pdf,application/pdf':'.xlsx,.xls,.csv'}"></label>`}
 async function onboarding(mode,file){
  state.database_id=await dbId();if(mode==='pdf'){
   state.setupMandatory=true;flagSave({mode:'pdf',completed:false});
   if(!file){dialog('<p>Die RONDO-PDF fehlt noch. Bitte Datei auswählen und den Zählbestand aufnehmen.</p>'+makeFileInput('pdf')+'<button class="primary" type="button" id="lv87Retry">PDF importieren</button>','Ersteinrichtung: Inventur erforderlich');$('lv87Retry').onclick=()=>readPdf($('lv87ChooseFile').files[0],'setup');return}
   await readPdf(file,'setup');
  }else if(mode==='sap'){
   flagSave({mode:'sap',completed:false});
   if(file)await importSap(file);else showSapDialog();
  }else flagSave({mode:'none',completed:true});
 }
 function showSapDialog(){dialog(`<p><b>SAP-Anfangsbestand:</b> Artikel und Mengen werden zunächst nur in einer Vorschau gezeigt. Nach Bestätigung als Anfangsbestand übernehmen.</p>${makeFileInput('sap')}<button id="lv87SapRead" type="button" class="primary">SAP-Datei prüfen</button><div id="lv87ScanStatus"></div>`,'Ersteinrichtung: SAP-Import');$('lv87SapRead').onclick=()=>importSap($('lv87ChooseFile').files[0]);}
 async function importSap(file){
  if(!file)return showSapDialog(); if(!/\.(xlsx|xls|csv)$/i.test(file.name))return alert('Bitte eine Excel- oder CSV-Datei auswählen.');
  dialog('<div id="lv87ScanStatus" class="lv87-status">SAP-Datei wird geprüft …</div>','SAP-Import – zunächst prüfen');
  try{
   const info=await window.api('/api/info');if(info.articles)throw Error('Der SAP-Erstimport ist nur für eine noch leere Datenbank vorgesehen. Bereits vorhandene Bestände bleiben geschützt.');
   const preview=await post('/api/company-import/file-preview',{filename:file.name,content_base64:await fileBase64(file),mode:'inventory'});
   if(preview.errors?.length)throw Error(`${preview.errors.length} Fehler in der SAP-Datei. Bitte diese zunächst im CSV-Center korrigieren.`);
   const items=preview.items||[],seen=new Set();const unknown={};for(const x of items){const k=Core.normNo(x.article_no);if(seen.has(k))throw Error('Doppelte Artikelnummer in der SAP-Liste: '+x.article_no);seen.add(k);if(!Number.isFinite(Number(x.quantity))||Number(x.quantity)<0)throw Error('Ungültige SAP-Menge: '+x.article_no);unknown[x.position_key]='create';}
   if(!items.length)throw Error('Die SAP-Datei enthält keine gültigen Artikel.');
   $('lv87ModalBody').innerHTML=`<p><b>${items.length} gültige Positionen</b> im Tabellenblatt ${safe(preview.sheet||'SAPUI5-Export')}.</p>
    <p>Die SAP-Mengen werden als <b>Anfangsbestand</b> gesetzt, nicht zusätzlich eingebucht. Für eine neue Datenbank ist das vorgesehen.</p>
    <div class="lv87-page"><table class="lv87-table"><thead><tr><th>Material</th><th>Beschreibung</th><th>Firma</th></tr></thead><tbody>${items.slice(0,40).map(x=>`<tr><td>${safe(x.article_no)}</td><td>${safe(x.description)}</td><td>${safe(x.quantity)}</td></tr>`).join('')}</tbody></table></div>
    <div class="lv87-flex"><button class="primary" id="lv87SapCommit">Anfangsbestand verbindlich übernehmen</button><button class="secondary" id="lv87SapBack">Andere Datei auswählen</button></div><div id="lv87ScanStatus"></div>`;
   $('lv87SapBack').onclick=showSapDialog;
   $('lv87SapCommit').onclick=async()=>{
    if(!confirm(`Die ${items.length} Positionen der SAP-Liste als Anfangsbestand übernehmen? Vorhandene Buchungen werden nicht verändert.`))return;
    $('lv87SapCommit').disabled=true;try{
     if(typeof window.ensureAdminPassword==='function'&&!await window.ensureAdminPassword())throw Error('Administratorfreigabe nicht erteilt.');
     const result=await post('/api/company-import/commit',{mode:'inventory',operation_id:preview.operation_id,items,unknown_actions:unknown,
      technician:(await window.api('/api/masterdata')).default_technician,internal_location:'',confirm:true,password:sessionStorage.adminPassword||''});
     notification('lv87ScanStatus',`${result.created??0} Artikel angelegt. SAP-Anfangsbestand ist gespeichert.`);flagSave({completed:true});
     await Promise.allSettled([window.loadArticles?.(),window.dash?.()]);
     $('lv87ModalBody').innerHTML=`<p><b>SAP-Anfangsbestand übernommen.</b> Möchtest du deinen tatsächlichen Bestand jetzt zählen?</p>
      <div class="lv87-flex"><button class="primary" id="lv87SapCount">Inventur jetzt starten</button><button class="secondary" id="lv87SapSkip">Später inventarisieren</button></div>`;
     $('lv87SapCount').onclick=()=>{ensureDialog().hidden=true;startInventory('Erstinventur nach SAP-Import')};
     $('lv87SapSkip').onclick=()=>{ensureDialog().hidden=true};
    }catch(e){notification('lv87ScanStatus',e.message,true);$('lv87SapCommit').disabled=false}
   };
  }catch(e){notification('lv87ScanStatus',e.message,true)}
 }
 async function digest(bytes){const h=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 async function loadScripts(url){if(window.Tesseract)return;await new Promise((resolve,reject)=>{let el=document.createElement('script');el.src=new URL(url,document.baseURI).href;el.onload=resolve;el.onerror=()=>reject(Error('OCR-Bibliothek konnte nicht geladen werden.'));document.head.appendChild(el)})}
 function readOcrWords(result,width,height){
  const words=[];
  function append(word){const b=word?.bbox;if(!b)return;words.push({
   text:String(word.text||'').trim(),left:Number(b.x0)/width,top:Number(b.y0)/height,
   width:(Number(b.x1)-Number(b.x0))/width,height:(Number(b.y1)-Number(b.y0))/height,
   confidence:Number(word.confidence??word.conf??100)
  })}
  for(const block of result?.data?.blocks||[])for(const para of block.paragraphs||[])for(const line of para.lines||[])for(const word of line.words||[])append(word);
  // In some Tesseract builds blocks are omitted even when requested. TSV is a
  // second, independent structured-word representation.
  if(!words.length&&typeof result?.data?.tsv==='string'){
   const lines=result.data.tsv.trim().split(/\r?\n/),head=lines.shift()?.split('\t')||[],ix=Object.fromEntries(head.map((x,i)=>[x,i]));
   for(const line of lines){const c=line.split('\t');if(c[+ix.level]!=='5')continue;const value=(c.slice(ix.text).join('\t')||'').trim();if(!value)continue;
    const left=Number(c[ix.left]),top=Number(c[ix.top]),w=Number(c[ix.width]),h=Number(c[ix.height]);
    if([left,top,w,h].every(Number.isFinite))words.push({text:value,left:left/width,top:top/height,width:w/width,height:h/height,confidence:Number(c[ix.conf])});
   }
  }
  return words.filter(w=>w.text&&Number.isFinite(w.left)&&Number.isFinite(w.top));
 }
 async function scan(file,onProgress=()=>{}){
  if(!file||!/\.pdf$/i.test(file.name)||file.size>28*1024*1024)throw Error('Bitte eine RONDO-PDF unter 28 MB auswählen.');
  const bytes=await file.arrayBuffer(),hash=await digest(bytes),p=await import(new URL('vendor/pdfjs/pdf.min.mjs',document.baseURI).href);
  p.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.min.mjs',document.baseURI).href;
  const task=p.getDocument({data:new Uint8Array(bytes.slice(0)),isEvalSupported:false,stopAtErrors:true});let pdf=null,worker=null;
  try{
   pdf=await task.promise;if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');
   await loadScripts('vendor/tesseract/tesseract.min.js');
   worker=await window.Tesseract.createWorker('deu+eng',1,{workerPath:new URL('vendor/tesseract/worker.min.js',document.baseURI).href,
    corePath:new URL('vendor/tesseract/core/',document.baseURI).href,langPath:new URL('vendor/tesseract/lang/',document.baseURI).href});
   const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];
   for(let n=1;n<=pdf.numPages;n++){
    if(scanCancelled)throw Error('Texterkennung wurde abgebrochen. Bisher erkannte Seiten bleiben gespeichert.');
    if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10))){onProgress(`Seite ${n} von ${pdf.numPages}: vollständig erkannte Seite wiederverwendet`);continue}
    onProgress(`Seite ${n} von ${pdf.numPages}: Texterkennung läuft …`);
    const page=await pdf.getPage(n),vp=page.getViewport({scale:2.15}),cv=document.createElement('canvas');cv.width=Math.ceil(vp.width);cv.height=Math.ceil(vp.height);
    await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
    const result=await worker.recognize(cv,{}, {text:true,blocks:true,tsv:true});
    const words=readOcrWords(result,cv.width,cv.height);
    const data=Core.parseOcrPage(result.data.text||'',n,words);
    if(!data.positions.length){
     const diagnostic=`Seite ${n}: Die OCR erkannte ${words.length} Wortpositionen und ${(result.data.text||'').length} Textzeichen, aber keine Artikelposition. `;
     throw Error(diagnostic+'Der Import wurde zum Schutz deiner Lagerdaten gestoppt. Bitte die PDF-Erkennung prüfen, statt alle 72 Seiten leer zu übernehmen.');
    }
    const oldIndex=pages.findIndex(x=>x.page===n);if(oldIndex>=0)pages.splice(oldIndex,1);
    pages.push(data);pages.sort((a,b)=>a.page-b.page);
    await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});
    cv.width=0;cv.height=0;page.cleanup();
   }
   return {hash,filename:file.name,bytes,pages};
  }finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}
 }
 async function readPdf(file,mode='annual'){
  if(!file)return alert('Bitte zuerst die RONDO-PDF auswählen.');if(scanBusy)return;
  stagingMode=mode;scanBusy=true;scanCancelled=false;const mask=ensureDialog();
  dialog(`<p>Die Vorlage wird lokal im Browser gelesen. Da die Datei eingescannt ist, kann die Texterkennung bei 72 Seiten einige Minuten dauern.</p>
   <div id="lv87ScanStatus" role="status" class="lv87-status">Datei wird geöffnet …</div>`,'RONDO-PDF einlesen');
  $('lv87CancelOCR').hidden=false;$('lv87Close').disabled=true;
  try{
   state.database_id=await dbId();const result=await scan(file,t=>notification('lv87ScanStatus',t));
   loadedPdf=result.bytes;state.fileHash=result.hash;state.sourceName=result.filename;state.pages=result.pages;
   const reviewed=Core.checkRows(result.pages);const previous=await getPdf().catch(()=>null);
   state.rows=previous?.hash===result.hash&&previous?.edited?.length?previous.edited:reviewed.rows;state.scanWarnings=reviewed.warnings;state.verified=!!(previous?.edited?.length);
   await storePdf({...result,edited:state.rows});
   reviewPage=0;reviewFilter='all';await renderReview();
  }catch(e){failed(e.message);if(stagingMode==='setup')flagSave({completed:false,mode:'pdf'});$('lv87ModalBody').insertAdjacentHTML('beforeend',`<p>Du kannst die PDF erneut auswählen. Bereits erkannte Seiten werden beim gleichen Dokument wiederverwendet.</p>${makeFileInput()}<button id="lv87Resume" class="primary">Fortsetzen</button>`);$('lv87Resume').onclick=()=>readPdf($('lv87ChooseFile').files[0],stagingMode)}
  finally{scanBusy=false;$('lv87CancelOCR').hidden=true;$('lv87Close').disabled=false}
 }
 function saveReviewLater(){clearTimeout(reviewSaveTimer);reviewSaveTimer=setTimeout(async()=>{try{const old=await getPdf();if(old?.hash===state.fileHash)await storePdf({...old,edited:state.rows,updated:new Date().toISOString()})}catch(e){console.warn('V87 Prüfdaten konnten noch nicht in Browser-DB gesichert werden',e)}},400)}
 function rowStatus(r,cmp){if(!Core.validNo(r.article_no)||!r.description||r.verified===false)return 'unsicher';if(cmp.firmOnly.some(x=>x.key===r.key))return 'new';return 'known';}
 async function renderReview(){
  const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>!Core.validNo(x.article_no)||!x.description||x.verified===false);
  const all=state.rows.map((r,i)=>({r,i,status:rowStatus(r,cmp)}));const filtered=all.filter(x=>reviewFilter==='all'||x.status===reviewFilter);
  const incompletePages=state.pages.filter(p=>p.positions.length!==(p.page===state.pages.length?9:10));
  const pageSize=40,pages=Math.max(1,Math.ceil(filtered.length/pageSize));reviewPage=Math.min(reviewPage,pages-1);
  dialog(`<p><b>${state.rows.length} Artikelpositionen aus ${state.pages.length} Seiten erkannt.</b> Erst nach deiner Prüfung werden neue Artikel in die Datenbank aufgenommen.</p>
   <div class="lv87-grid"><div class="lv87-countline">${cmp.matched.length} bereits bekannt</div><div class="lv87-countline">${cmp.firmOnly.length} fehlen in der App</div><div class="lv87-countline">${cmp.appOnly.length} nur in der App</div><div class="lv87-countline">${errors.length} unklare Positionen</div></div>
   ${state.scanWarnings.length?`<p class="lv87-warn">${state.scanWarnings.length} Warnungen bei der Erkennung. Besonders Nummern und Beschreibungen prüfen.</p>`:''}
   ${incompletePages.length?`<p class="lv87-bad">Unvollständige Seiten: ${incompletePages.map(x=>x.page+' ('+x.positions.length+' erkannt)').join(', ')}. Fehlende Positionen bitte ergänzen.</p>`:''}
   <div class="lv87-flex"><label>Filter<select id="lv87ReviewFilter"><option value="all">Alle Positionen</option><option value="unsicher">Unsicher</option><option value="new">Nur Firmenliste</option><option value="known">Bereits bekannt</option></select></label>
    <button id="lv87Prev" class="secondary" ${reviewPage===0?'disabled':''}>Zurück</button>Seite ${reviewPage+1}/${pages}<button id="lv87Next" class="secondary" ${reviewPage>=pages-1?'disabled':''}>Weiter</button></div>
   <div class="lv87-page"><table class="lv87-table"><thead><tr><th>Seite/Pos.</th><th>Materialnummer</th><th>Bezeichnung</th><th>Einheit</th><th>Status</th></tr></thead><tbody>
   ${filtered.slice(reviewPage*pageSize,(reviewPage+1)*pageSize).map(({r,i,status})=>`<tr><td>${r.page}/${r.position}</td><td><input data-v87-row="${i}" data-field="article_no" value="${safe(r.article_no)}" aria-label="Artikelnummer"></td><td><input data-v87-row="${i}" data-field="description" value="${safe(r.description)}" aria-label="Bezeichnung"></td><td><select data-v87-row="${i}" data-field="unit"><option ${r.unit==='Stk.'?'selected':''}>Stk.</option><option ${r.unit==='m'?'selected':''}>m</option><option ${r.unit==='L'?'selected':''}>L</option></select></td><td>${status==='unsicher'?'<span class="lv87-bad">Prüfen!</span>':status==='new'?'<span class="lv87-warn">Neu</span>':'Bekannt'}</td></tr>`).join('')}
   </tbody></table></div><p class="lv87-hint">Belegpositionen, die fehlen oder falsch erkannt wurden, vor dem Import korrigieren. Doppelnummern werden gesperrt.</p>
   <details class="lv87-card"><summary>Fehlende oder falsch erkannte Belegposition manuell ergänzen</summary>
    <div class="lv87-grid"><label>Seite<input id="lv87AddPage" type="number" min="1" max="${state.pages.length}"></label><label>Position<input id="lv87AddPos" type="number" min="1" max="10"></label>
    <label>Materialnummer<input id="lv87AddNo" autocomplete="off"></label><label>Bezeichnung<input id="lv87AddDesc"></label></div>
    <button class="secondary" id="lv87AddRow" type="button">Position ergänzen</button></details>
   <div class="lv87-flex"><button class="primary" id="lv87CommitRows" ${!state.rows.length?'disabled':''}>Geprüfte Firmenartikel übernehmen</button><button class="secondary" id="lv87CsvReport">Abgleich als CSV herunterladen</button></div>
   <div id="lv87ScanStatus" role="status" class="lv87-status"></div>`,'RONDO-Artikel prüfen');
  $('lv87ReviewFilter').value=reviewFilter;$('lv87ReviewFilter').onchange=e=>{reviewFilter=e.target.value;reviewPage=0;renderReview().catch(console.error)};
  $('lv87Prev').onclick=()=>{reviewPage--;renderReview().catch(console.error)};$('lv87Next').onclick=()=>{reviewPage++;renderReview().catch(console.error)};
  for(const el of $('lv87ModalBody').querySelectorAll('[data-v87-row]'))el.addEventListener('change',e=>{const r=state.rows[Number(e.target.dataset.v87Row)];r[e.target.dataset.field]=e.target.value.trim();r.verified=Core.validNo(r.article_no)&&!!r.description;saveReviewLater();});
  $('lv87CsvReport').onclick=()=>downloadDiff().catch(e=>alert(e.message));
  $('lv87AddRow').onclick=()=>{try{const p=Number($('lv87AddPage').value),pos=Number($('lv87AddPos').value),no=$('lv87AddNo').value.trim().toUpperCase(),desc=$('lv87AddDesc').value.trim();
   if(!Number.isInteger(p)||p<1||p>state.pages.length||!Number.isInteger(pos)||pos<1||pos>10||!Core.validNo(no)||!desc)throw Error('Bitte gültige Seite, Position, Materialnummer und Bezeichnung eingeben.');
   if(state.rows.some(x=>x.page===p&&x.position===pos))throw Error('Position ist bereits vorhanden. Bitte direkt in der Tabelle korrigieren.');
   const sheet=state.pages.find(x=>x.page===p);const row={page:p,position:pos,key:p+':'+pos,beleg:sheet?.beleg||'',article_no:no,description:desc,unit:'Stk.',location:'1025',counted_stock:null,verified:true};
   sheet.positions.push(row);sheet.positions.sort((a,b)=>a.position-b.position);state.rows.push(row);state.rows.sort((a,b)=>a.page-b.page||a.position-b.position);saveReviewLater();renderReview().catch(console.error);
  }catch(e){notification('lv87ScanStatus',e.message,true)}};
  $('lv87CommitRows').onclick=()=>commitRows().catch(e=>notification('lv87ScanStatus',e.message,true));
 }
 async function commitRows(){
  const rows=state.rows;
  const incomplete=state.pages.filter(p=>p.positions.length!==(p.page===state.pages.length?9:10));
  if(incomplete.length)throw Error('Nicht alle Positionen erkannt. Bitte ergänzen: Seiten '+incomplete.map(x=>x.page).join(', '));
  if(rows.some(x=>!Core.validNo(x.article_no)||!x.description||x.verified===false))throw Error('Ungeprüfte oder fehlerhafte Artikelnummern/Bezeichnungen. Bitte in der Tabelle korrigieren.');
  const seen=new Set();for(const x of rows){const n=Core.normNo(x.article_no);if(seen.has(n))throw Error('Doppelte Artikelnummer in der Firmenliste: '+x.article_no);seen.add(n)}
  const old=await window.api('/api/articles'),cmp=Core.compare(rows,old);
  const requested=cmp.firmOnly;if(!confirm(`RONDO-Liste: ${rows.length} Positionen, davon ${requested.length} neue Artikel und ${cmp.appOnly.length} Artikel nur in deiner App.\n\nNeue Artikel OHNE Bestandsmenge registrieren? Anschließend muss der tatsächliche Bestand gezählt werden.`))return;
  const btn=$('lv87CommitRows');btn.disabled=true;try{
   const tech=(await window.api('/api/masterdata')).default_technician||'Techniker',operationId='rondo-v87-'+state.fileHash.slice(0,32);
   const chunks=[];for(let i=0;i<requested.length;i+=45)chunks.push(requested.slice(i,i+45));
   let total=0;for(let i=0;i<chunks.length;i++){
    const chunk=chunks[i].map(x=>({article_no:x.article_no,description:x.description,unit:x.unit||'Stk.',location:'',initial_stock:0,target_stock:0,minimum_stock:0,
      position_key:x.key,warehouse_id:null}));
    notification('lv87ScanStatus',`Artikel werden lokal registriert: Paket ${i+1}/${chunks.length}. Keine Bestandsbuchung.`);
    const d=await post('/api/articles/create-import',{items:chunk,technician:tech,operation_id:operationId});total+=Number(d.created??chunk.length);
   }
   const now=await window.api('/api/articles'),fresh=Core.compare(rows,now);state.verified=true;
   await storePdf({hash:state.fileHash,filename:state.sourceName,bytes:loadedPdf,pages:state.pages,edited:state.rows,updated:new Date().toISOString()});
   await Promise.allSettled([window.loadArticles?.(),window.dash?.()]);
   const msgText=`${total} neue Artikel registriert. ${fresh.appOnly.length} Artikel sind ausschließlich in deiner App vorhanden. Bitte prüfen. Mengen wurden noch nicht übernommen.`;
   if(stagingMode==='setup'){flagSave({mode:'pdf',completed:false,imported:true});state.setupMandatory=true;await startInventory('Erstinventur RONDO '+new Date().getFullYear());}
   dialog(`<p><b>${safe(msgText)}</b></p><p>Als Nächstes wird eine Inventur zum Zählen der tatsächlichen Mengen gestartet. Während der Zählung werden die Lagerbestände noch nicht korrigiert.</p>
      <div class="lv87-flex"><button class="primary" id="lv87StartCount">Inventur jetzt starten</button><button class="secondary" id="lv87LaterCount">Zählung später fortsetzen</button></div><div id="lv87ScanStatus"></div>`, 'RONDO-Import abgeschlossen');
   $('lv87StartCount').onclick=async()=>{ensureDialog().hidden=true;if(stagingMode==='annual')await startInventory('Jahresinventur RONDO '+new Date().getFullYear());else $('inv75Search')?.focus()};
   $('lv87LaterCount').onclick=()=>{ensureDialog().hidden=true;document.getElementById('lv87InventoryNotice')?.scrollIntoView({block:'center'});};
  }catch(e){if(btn)btn.disabled=false;throw e}
 }
 async function startInventory(name){
  if(typeof window.show==='function')await window.show('inventory75');
  await window.LVInventory.open();const data=window.LVInventory.current();
  if(!data||data.session.status!=='draft'){const el=$('inv75Name');el.value=name;await window.LVInventory.create();}
  else if(confirm(`Es gibt bereits eine laufende Inventur „${data.session.name}“. Diese fortsetzen?`)){
   await window.LVInventory.refresh();
  }else{$('inv75Name').value=name;await window.LVInventory.create()}
  $('inv75Search')?.focus();refreshReminder();
 }
 function setupPicker(){const step=$('setupStep5');if(!step||$('lv87SetupChoice'))return;
  const div=document.createElement('div');div.className='lv87-card';div.id='lv87SetupChoice';div.innerHTML=`<h3>📋 Anfangsbestand einrichten – Datenquelle wählen</h3>
   <p>Wie soll die neue Lagerdatenbank befüllt werden?</p>
   <label><input type="radio" name="lv87ImportMode" value="pdf" checked> RONDO-Inventurliste (PDF) – Artikel übernehmen, anschließend <b>verbindlich zählen</b></label><br>
   <label><input type="radio" name="lv87ImportMode" value="sap"> SAP-Excel/CSV – Firmenbestände übernehmen, Inventur freiwillig</label><br>
   <label><input type="radio" name="lv87ImportMode" value="none"> Ohne Datei starten (leere Datenbank)</label>
   <div id="lv87SetupFileBox">${makeFileInput('pdf').replace('id="lv87ChooseFile"','id="lv87SetupUpload"')}</div><p class="lv87-hint" id="lv87SetupHint">Bei der RONDO-PDF fehlen Mengen. Ohne vollständige Zählung ist der Anfangsbestand nicht verlässlich.</p>`;
  step.querySelector('.setup-actions')?.before(div);
  for(const el of div.querySelectorAll('[name=lv87ImportMode]'))el.onchange=()=>{const mode=div.querySelector('[name=lv87ImportMode]:checked').value;$('lv87SetupFileBox').innerHTML=mode==='none'?'':makeFileInput(mode==='pdf'?'pdf':'sap').replace('id="lv87ChooseFile"','id="lv87SetupUpload"');$('lv87SetupHint').textContent=mode==='pdf'?'Die Inventur muss durchgeführt werden, kann aber unterbrochen und später fortgesetzt werden.':mode==='sap'?'SAP-Mengen werden als Anfangsbestand übernommen. Eine anschließende Inventur ist freiwillig.':'Ohne Dateiangaben bleiben Artikel und Bestände leer. Manuelle Einrichtung ist möglich.'};
  // wrap only the final step; all existing setup functions remain unchanged.
  const original=window.completeFirstSetup;if(typeof original==='function'&&!original._lv87){
   window.completeFirstSetup=async function(){const mode=div.querySelector('[name=lv87ImportMode]:checked')?.value||'pdf';const file=$('lv87SetupUpload')?.files[0];
    if(mode!=='none'&&!file)return alert('Bitte die Datei für den gewählten Importweg auswählen.');
    if(file&&mode==='pdf'&&!/\.pdf$/i.test(file.name))return alert('Bitte eine RONDO-PDF auswählen.');
    try{await original();const status=await window.api('/api/setup/status');if(status?.setup_required)throw Error('Bitte zuerst die Ersteinrichtung erfolgreich abschließen.');await onboarding(mode,file)}catch(e){console.error(e);alert('Einrichtung konnte nicht vollständig abgeschlossen werden: '+e.message)};
   };window.completeFirstSetup._lv87=true;
  }
 }
 async function annualCard(){const section=$('inventory75');if(!section||$('lv87Annual'))return;
  const card=document.createElement('div');card.id='lv87Annual';card.className='lv87-card';card.innerHTML=`<h3>📄 RONDO-Firmeninventur (PDF) – jährlich oder zur Ersteinrichtung</h3>
   <p>Inventurbeleg einlesen, mit deiner Artikelliste vergleichen, fehlende Materialien prüfen, Zählmengen erfassen und die ursprüngliche RONDO-Vorlage wieder als ausgefüllte PDF exportieren.</p>
   <div class="lv87-flex"><label>Inventur-PDF<input type="file" id="lv87AnnualFile" accept=".pdf,application/pdf"></label>
   <button type="button" class="primary" id="lv87AnnualImport">RONDO-PDF prüfen</button>
   <button type="button" class="secondary" id="lv87AnnualRestore">Letzte PDF öffnen</button></div>
   <div id="lv87InventoryNotice" class="lv87-status">Leere Zählmenge bedeutet „noch nicht gezählt“. Null bedeutet tatsächlich kein Bestand.</div>
   <div class="lv87-flex"><button id="lv87ExportFilled" type="button" class="primary">Ausgefüllte RONDO-PDF erzeugen</button>
   <button id="lv87ExportDifferences" type="button" class="secondary">Abweichungen / fehlende Materialien (CSV)</button></div>
   <p class="lv87-hint">Die PDF enthält keine SAP-Mengen. Verglichen werden Artikelbestände aus deiner Anwendung und deine eigenen Zählergebnisse. Vor dem Inventurabschluss vergessene Servicebericht-Entnahmen berücksichtigen.</p>`;
  const ref=section.querySelector('div.card');if(ref)ref.after(card);else section.prepend(card);
  $('lv87AnnualImport').onclick=()=>readPdf($('lv87AnnualFile').files[0],'annual');$('lv87AnnualRestore').onclick=restorePdf;
  $('lv87ExportFilled').onclick=exportFilled;$('lv87ExportDifferences').onclick=()=>downloadDiff().catch(e=>alert(e.message));
  await refreshReminder();
 }
 async function restorePdf(){try{state.database_id=await dbId();const v=await getPdf();if(!v)return alert('Noch keine RONDO-PDF für diese Datenbank gespeichert.');loadedPdf=v.bytes;state.pages=v.pages;state.fileHash=v.hash;state.sourceName=v.filename;
   state.rows=v.edited||Core.checkRows(v.pages).rows;state.verified=!!v.edited;dialog('<p>Die letzte RONDO-PDF und ihre Artikel wurden wiederhergestellt.</p><div class="lv87-flex"><button id="lv87SeeRows" class="primary">Artikelprüfung öffnen</button><button id="lv87BackCount" class="secondary">Zur Inventur</button></div>');$('lv87SeeRows').onclick=()=>renderReview().catch(e=>alert(e.message));$('lv87BackCount').onclick=()=>{ensureDialog().hidden=true};
  }catch(e){alert(e.message)}}
 async function exportFilled(){try{
  state.database_id=await dbId();const stored=await getPdf();if(!stored?.bytes)throw Error('Zuerst die Original-RONDO-PDF importieren.');
  const lines=stored.edited||Core.checkRows(stored.pages).rows;
  const inv=window.LVInventory.current();if(!inv)throw Error('Bitte erst eine Inventur öffnen.');if(!await window.LVInventory.save())throw Error('Die gezählten Mengen konnten nicht gespeichert werden.');
  const latest=window.LVInventory.current(),map=new Map(latest.items.map(x=>[Core.normNo(x.article_no),x]));const values={},missing=[];
  for(const r of lines){const counted=map.get(Core.normNo(r.article_no));
   if(!counted||counted.counted_stock===null||counted.counted_stock===undefined||String(counted.counted_stock).trim()===''){missing.push(r);continue}
   values[r.key]=Core.normCount(counted.counted_stock,r.unit);
  }
  if(missing.length&&!confirm(`${missing.length} Firmenpositionen sind noch nicht gezählt. Trotzdem eine teilweise ausgefüllte PDF erzeugen? Fehlende Felder bleiben leer.`))return;
  let cancelled=false;dialog('<p>Die ursprünglichen Seiten werden mit deinen Zählmengen versehen. Originalbelegnummern und Seitenlayout bleiben erhalten.</p><div id="lv87ScanStatus" class="lv87-status"></div><button id="lv87AbortExport" class="secondary">PDF-Ausgabe abbrechen</button>');$('lv87AbortExport').onclick=()=>{cancelled=true};
  const blob=await PDF.render(stored.bytes,lines,values,s=>notification('lv87ScanStatus',s),()=>cancelled);
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`RONDO_Inventur_${new Date().getFullYear()}_ausgefuellt.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  notification('lv87ScanStatus',`PDF mit ${Object.keys(values).length} gezählten Positionen erstellt. Unterschriftsfelder bleiben für die Unterschrift frei.`);
 }catch(e){alert(e.message)}}
 function csvDownload(name,headers,rows){const delim=';',quote=s=>'"'+String(s??'').replace(/"/g,'""')+'"';const text='\ufeff'+[headers,...rows].map(row=>row.map(quote).join(delim)).join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 async function downloadDiff(){state.database_id=await dbId();const stored=await getPdf();const rows=state.rows.length?state.rows:(stored?.edited||Core.checkRows(stored?.pages||[]).rows);if(!rows.length)throw Error('Bitte erst eine RONDO-PDF importieren.');
  const arts=await window.api('/api/articles'),cmp=Core.compare(rows,arts),inv=window.LVInventory.current(),counted=new Map((inv?.items||[]).map(x=>[Core.normNo(x.article_no),x]));const lines=[];
  for(const r of rows){const a=arts.find(a=>Core.normNo(a.article_no)===Core.normNo(r.article_no));const count=counted.get(Core.normNo(r.article_no));
   lines.push(['RONDO-PDF',r.page,r.beleg||'',r.position,r.article_no,r.description,r.location,a?.stock??'',count?.counted_stock??'',a?'Bekannt':'Fehlt in App',count?.counted_stock==null?'Nicht gezählt':(Math.abs(Number(count.counted_stock)-Number(a?.stock||0))>1e-8?'Bestandsabweichung':'Stimmt')]);
  }
  for(const a of cmp.appOnly)lines.push(['Nur App','','','',a.article_no,a.description,a.location,a.stock,'','Nicht auf RONDO-PDF','Zur Klärung']);
  csvDownload(`RONDO_Artikelabgleich_${new Date().getFullYear()}.csv`,['Herkunft','PDF-Seite','Belegnummer','Position','Artikelnummer','Bezeichnung','Lagerort','App-Bestand','Gezählt','Listenstatus','Zählstatus'],lines);
 }
 async function refreshReminder(){const box=$('lv87InventoryNotice');if(!box)return;state.database_id=await dbId();const marker=getFlags();
  if(marker?.mode==='pdf'&&!marker.completed){box.className='lv87-status lv87-bad';box.textContent='Ersteinrichtung mit RONDO-PDF: Die Erstinventur ist noch nicht abgeschlossen. Bitte Zählmengen aufnehmen und abschließen.';return}
  box.className='lv87-status';box.textContent='Firmeninventur: RONDO-PDF jährlich importieren, zählen, mit App vergleichen und als ausgefüllte RONDO-PDF zurückgeben.';
 }
 function fastInventory(){const search=$('inv75Search');if(!search||$('lv87Suggestions'))return;
  search.removeAttribute('list');const root=search.parentElement;root.style.position='relative';const list=document.createElement('div');list.id='lv87Suggestions';list.className='lv87-suggestions';list.setAttribute('role','listbox');root.appendChild(list);let chosen=0,candidates=[];
  const draw=()=>{const inv=window.LVInventory?.current?.();const q=Core.norm(search.value);if(!inv||!q){list.style.display='none';return}
   candidates=inv.items.filter(x=>Core.norm(x.article_no).includes(q)||Core.norm(x.description).includes(q)||Core.norm(x.barcode).includes(q)).slice(0,12);
   chosen=Math.min(chosen,Math.max(0,candidates.length-1));list.style.display=candidates.length?'block':'none';
   list.innerHTML=candidates.map((r,i)=>`<button type="button" role="option" aria-selected="${i===chosen}" data-i="${i}"><b>${safe(r.article_no)}</b> – ${safe(r.description)}${r.counted_stock!==null?' ✓':''}</button>`).join('');
   for(const b of list.querySelectorAll('button'))b.onclick=()=>select(Number(b.dataset.i));
  };
  function select(n){const row=candidates[n];if(!row)return;search.value=row.article_no;list.style.display='none';window.LVInventory.filter();requestAnimationFrame(()=>{$('inv75-count-'+row.article_id)?.focus();$('inv75-count-'+row.article_id)?.select();})}
  search.addEventListener('input',()=>{chosen=0;draw()});
  search.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key))return;
   if(e.key==='Escape'){list.style.display='none';return}
   if(!candidates.length)draw();if(!candidates.length)return;
   e.preventDefault();if(e.key==='ArrowDown')chosen=Math.min(candidates.length-1,chosen+1);else if(e.key==='ArrowUp')chosen=Math.max(0,chosen-1);else if(e.key==='Enter'){select(chosen);return}draw();
  },true);
  document.addEventListener('click',e=>{if(!root.contains(e.target))list.style.display='none'});
 }
 async function installTransfers(){const section=$('stockbins86');if(!section||$('lv87Transfers'))return;
  // Explicit individual transfer as the default; the existing all-transfer is preserved behind its radio.
  const single=section.querySelector('input[name="bin86Mode"][value="selected"]');if(single){single.checked=true;single.dispatchEvent(new Event('change'))}
  const div=document.createElement('div');div.id='lv87Transfers';div.className='lv87-card';div.innerHTML=`<h3>📦 Einzelne Artikel / Teilmengen umlagern</h3><p>Wähle nur die Artikel aus, die tatsächlich umgelagert werden sollen. Die Gesamtbestände ändern sich nicht.</p>
   <div class="lv87-flex"><label>Teilbestände suchen<input id="lv87TransferSearch" placeholder="Artikelnummer, Beschreibung, Lagerort"></label>
    <button class="secondary" id="lv87SelectAll">Alle gefilterten auswählen</button><button class="secondary" id="lv87ClearTransfers">Auswahl leeren</button><button class="secondary" id="lv87ReloadTransfers">Bestände aktualisieren</button></div>
   <div id="lv87TransferTable" class="lv87-page"></div>
   <div class="lv87-flex"><button class="primary" id="lv87TransferPreview">Ausgewählte Artikel prüfen</button><button class="primary" id="lv87TransferExecute" disabled>Auswahl verbindlich umlagern</button></div>
   <div id="lv87TransferStatus" role="status" class="lv87-status">Bitte zunächst Artikel auswählen.</div>`;
  const old=section.querySelector('div.card');old?.after(div);
  let rows=[],picked=new Map(),preview=null,token=null;
  const refresh=async()=>{const p=await window.api('/api/stock-bins-v86/index');rows=p.bins||[];token=p.revision;render();};
  const render=()=>{const q=Core.norm($('lv87TransferSearch').value),filtered=rows.filter(r=>!q||[r.article_no,r.description,r.location,r.warehouse_name].some(v=>Core.norm(v).includes(q)));
   $('lv87TransferTable').innerHTML=`<table class="lv87-table"><thead><tr><th>Auswahl</th><th>Artikel</th><th>Lager/Fach</th><th>Bestand</th><th>Menge zum Umlagern</th></tr></thead><tbody>${filtered.slice(0,250).map(r=>`<tr><td><input type="checkbox" data-bin="${r.id}" ${picked.has(Number(r.id))?'checked':''}></td><td>${safe(r.article_no)}<br>${safe(r.description)}</td><td>${safe(r.warehouse_name||'Ohne Lager')}/${safe(r.location||'ohne Fach')}</td><td>${Number(r.quantity).toLocaleString('de-DE')} ${safe(r.unit)}</td><td><input type="text" inputmode="decimal" data-qty="${r.id}" aria-label="Umlagermenge ${safe(r.article_no)}" value="${safe(picked.get(Number(r.id))??r.quantity)}"></td></tr>`).join('')}</tbody></table><p>${filtered.length} Treffer, davon maximal 250 auf einer Seite sichtbar. Enger suchen, falls erforderlich.</p>`;
   for(const b of div.querySelectorAll('[data-bin]'))b.onchange=()=>{const id=Number(b.dataset.bin),row=rows.find(x=>Number(x.id)===id);if(b.checked)picked.set(id,div.querySelector(`[data-qty="${id}"]`).value||row.quantity);else picked.delete(id);preview=null;$('lv87TransferExecute').disabled=true;};
   for(const el of div.querySelectorAll('[data-qty]'))el.oninput=()=>{const id=Number(el.dataset.qty);if(picked.has(id))picked.set(id,el.value);preview=null;$('lv87TransferExecute').disabled=true;};
  };
  $('lv87TransferSearch').oninput=render;$('lv87SelectAll').onclick=()=>{for(const r of rows.filter(r=>!Core.norm($('lv87TransferSearch').value)||[r.article_no,r.description,r.location,r.warehouse_name].some(v=>Core.norm(v).includes(Core.norm($('lv87TransferSearch').value)))))picked.set(Number(r.id),r.quantity);render();};
  $('lv87ClearTransfers').onclick=()=>{picked.clear();preview=null;render();$('lv87TransferExecute').disabled=true};$('lv87ReloadTransfers').onclick=()=>refresh().catch(e=>notification('lv87TransferStatus',e.message,true));
  $('lv87TransferPreview').onclick=async()=>{try{const items=Core.validateTransfer([...picked].map(([bin_id,quantity])=>({bin_id,quantity})),rows);if(!items.length)throw Error('Bitte mindestens einen Teilbestand auswählen.');
    const dst=Number($('bin86TargetWarehouse').value)||null,location=$('bin86TargetLocation').value;
    if(!dst&&!location)throw Error('Bitte zuerst das Ziellager und den Ziellagerort wählen.');
    const srcMap=new Map(rows.map(x=>[Number(x.id),x]));for(const x of items){const row=srcMap.get(x.bin_id);if(Number(row.warehouse_id||0)===Number(dst||0)&&row.location===location)throw Error(`Quelle und Ziel sind identisch: ${x.article_no}`)}
    preview={items,revision:token,dst,location,reason:$('bin86Reason').value};
    notification('lv87TransferStatus',`${items.length} Artikelpositionen mit ${items.reduce((n,x)=>n+x.quantity,0)} Einheiten vorgemerkt. Ziel: ${location||'(ohne Ort)'}. Gesamtbestand bleibt gleich.`);
    $('lv87TransferExecute').disabled=false;
   }catch(e){notification('lv87TransferStatus',e.message,true);$('lv87TransferExecute').disabled=true}};
  $('lv87TransferExecute').onclick=async()=>{
   if(transferBusy||!preview)return;
   if(!confirm(`${preview.items.length} ausgewählte Teilbestände umlagern?\n\nJede Position wird einzeln mit Revisionsprüfung und Sicherheitsbackup gespeichert. Bereits abgeschlossene Positionen bleiben bei einem späteren Fehler bestehen.`))return;
   transferBusy=true;$('lv87TransferExecute').disabled=true;let done=0;try{
    for(const [i,item] of preview.items.entries()){
     notification('lv87TransferStatus',`Umlagerung ${i+1}/${preview.items.length}: ${item.article_no}. Bereits abgeschlossen: ${done}.`);
     const ref=await window.api('/api/stock-bins-v86/index'),source=ref.bins.find(x=>Number(x.id)===Number(item.bin_id));
     if(!source)throw Error('Quellbestand inzwischen geändert: '+item.article_no);
     if(Number(source.quantity)+1e-8<item.quantity)throw Error('Menge inzwischen nicht mehr vorhanden: '+item.article_no);
     const args={mode:'selected',warehouse_id:String(source.warehouse_id||''),location:source.location||'',target_warehouse_id:String(preview.dst||''),target_location:preview.location,bin_id:item.bin_id,quantity:String(item.quantity),reason:preview.reason};
     const p=await post('/api/stock-bins-v86/preview',args);
     if(p.items?.length!==1||Number(p.items[0].quantity)!==item.quantity)throw Error('Vorschau weicht ab: '+item.article_no);
     await post('/api/stock-bins-v86/execute',{...args,expected_revision_id:p.revision,confirm:true,password:sessionStorage.adminPassword||''});done++;
    }
    notification('lv87TransferStatus',`${done} Artikelpositionen erfolgreich umgelagert. Alle Gesamtbestände sind unverändert.`);picked.clear();preview=null;await refresh();await Promise.allSettled([window.loadArticles?.(),window.dash?.()]);
   }catch(e){notification('lv87TransferStatus',`${done} Umlagerungen abgeschlossen, danach Fehler: ${e.message}. Bereits gebuchte Positionen NICHT erneut ausführen, sondern zunächst die Umlagerungshistorie prüfen.`,true);await refresh().catch(()=>{});}
   finally{transferBusy=false;preview=null}
  };
  await refresh().catch(e=>notification('lv87TransferStatus',e.message,true));
 }
 function helpCard(){const section=$('help');if(!section||$('lv87Help'))return;const d=document.createElement('details');d.id='lv87Help';d.className='lv87-card';d.innerHTML=`<summary><b>🆕 V87 – RONDO-PDF, Ersteinrichtung, Inventur und Umlagerung</b></summary>
   <p><b>Neue Datenbank:</b> SAP-Excel enthält Anfangsmengen (Inventur freiwillig). RONDO-PDF enthält keine Mengen (Inventur erforderlich; jederzeit unterbrechen und fortsetzen). Es werden vor Zählabschluss keine Bestände als geprüft angezeigt.</p>
   <p><b>Jahresinventur:</b> PDF importieren, Artikelnummern prüfen, fehlende Artikel anlegen, mit App vergleichen, zählen. Enter: Artikelsuche → Vorschlag wählen → Mengenfeld → Enter → nächster Artikel.</p>
   <p><b>Rückgabe:</b> „Ausgefüllte RONDO-PDF erzeugen“ druckt gezählte Mengen in den Originalbeleg; Unterschriftsfelder frei lassen. Bei nicht gezählten Positionen bestätigen, ob ein Teilbericht zulässig ist.</p>
   <p><b>Umlagerung:</b> Einzelne Artikel und Mengen auswählen; Option „Alle gefilterten auswählen“ ist bewusst getrennt. Bevor bestätigt wird, Ziel und Mengen prüfen.</p>
   <p><b>Abweichungen:</b> Neu auf RONDO-PDF, nur in der App, Bestandsdifferenz. Die PDF enthält keine SAP-Sollmenge; fehlende Artikel sind keine automatisch erkannten physischen Fehlmengen.</p>`;
  section.insertBefore(d,section.firstChild);
 }
 function version(){const e=$('appVersion');if(e){e.textContent='87.1';if(!e._lv87Observer){const watcher=new MutationObserver(()=>{if(e.textContent!=='87.1')e.textContent='87.1'});watcher.observe(e,{childList:true,subtree:true,characterData:true});e._lv87Observer=watcher}}document.title=document.title.replace(/V\d+(?:\.\d+)?/,'V87.1');const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='Lagerverwaltung Lovrencic V87.1 PWA';}
 function observeInventoryCompletion(){if(!window.LVInventory||window.LVInventory._lv87Done)return;
  const original=window.LVInventory.finalize;window.LVInventory.finalize=async function(...args){const before=this.current()?.session?.status;const res=await original.apply(this,args);const after=this.current()?.session?.status;
   if(before==='draft'&&after==='completed'){state.database_id=await dbId();if(getFlags()?.mode==='pdf'){flagSave({completed:true});await refreshReminder();alert('Erstinventur abgeschlossen: Die gezählten Mengen sind jetzt dein Anfangsbestand. Du kannst anschließend die ausgefüllte RONDO-PDF für die Firma erzeugen.')}}return res};window.LVInventory._lv87Done=true;
 }
 async function install(){if(window.LV87Installed)return;window.LV87Installed=true;version();setupPicker();await annualCard();fastInventory();await installTransfers();helpCard();observeInventoryCompletion();
  window.addEventListener('pageshow',version);
  state.database_id=await dbId();const marker=getFlags();if(marker?.mode==='pdf'&&!marker.completed)refreshReminder();
 }
 window.LV87={install,scan,parse:Core.parseOcrPage,readPdf,restorePdf,exportFilled,compare:Core.compare,onboarding};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>install().catch(console.error));else install().catch(console.error);
})();
