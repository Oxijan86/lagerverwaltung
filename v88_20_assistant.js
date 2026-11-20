/* Lagerverwaltung Lovrencic V88.20 – geführte PDF-Sichtprüfung und sichere Sammelarchivierung.
 * Voraussetzung: v88_20_core.js, bestehende LV87-PDF-IndexedDB und lokale API.
 * Kein automatischer Inventurabschluss, keine Mengen- oder Buchungsänderung.
 */
(function(root){'use strict';
 const Core=root.LV8820Core;
 if(!Core){console.error('V88.20: Prüfmodul fehlt.');return}
 const $=id=>document.getElementById(id);
 const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=v=>Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:4});
 const post=(path,body)=>root.api(path,{method:'POST',body:JSON.stringify(body)});
 const shell={snap:null,dbId:'',rows:[],articles:[],idx:0,filter:'pending',busy:false,full:false,scale:2.25,pdf:null,pdfHash:'',canvasKey:'',selected:new Set(),preview:null,visible:[],dataVersion:''};
 let installed=false;
 const css=document.createElement('style');css.textContent=`
 .lv8820-card{border:2px solid #86a8a0;border-radius:12px;background:#fff;color:#1b2723;padding:16px;margin:14px 0;box-sizing:border-box;max-width:100%}
 .lv8820-card h3{margin:0 0 8px}.lv8820-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}.lv8820-actions button{max-width:100%;white-space:normal}
 .lv8820-modal[hidden]{display:none!important}.lv8820-modal{position:fixed;z-index:20000;inset:0;background:rgba(0,0,0,.65);padding:10px;overflow:auto;display:flex;align-items:flex-start;justify-content:center}
 .lv8820-dialog{width:min(1040px,100%);background:#fff;color:#1b2723;border-radius:14px;padding:18px;box-sizing:border-box;margin:12px auto;box-shadow:0 9px 36px #2227}
 .lv8820-dialog h2{font-size:1.35rem;margin:0 0 10px}.lv8820-status{margin:8px 0;padding:9px;background:#eff5f4;border-left:4px solid #286553;border-radius:6px;line-height:1.5}
 .lv8820-error{background:#fff0ee;border-color:#b92b18}.lv8820-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.lv8820-columns>*{min-width:0}
 .lv8820-pdf{max-width:100%;overflow:auto;background:#e9edef;border:1px solid #abb9b7;border-radius:8px;padding:8px;min-height:100px}.lv8820-pdf canvas{display:block;max-width:100%;height:auto;margin:auto}
 .lv8820-dialog label{display:block;margin:9px 0}.lv8820-dialog input[type=text],.lv8820-dialog input[type=search]{width:100%;max-width:100%;font-size:1.05rem;box-sizing:border-box;padding:10px;border:1px solid #6d8e88;border-radius:6px}
 .lv8820-reviewrow{display:flex;align-items:center;gap:8px;border:1px solid #dadfdf;border-radius:8px;padding:8px;margin:7px 0}.lv8820-reviewrow label{flex:1;min-width:0;margin:0}.lv8820-small{font-size:.89rem;color:#51625c}
 .lv8820-list{max-height:350px;overflow:auto}.lv8820-note{background:#f3f7f7;padding:9px;border-radius:7px}.lv8820-tag{font-size:.8rem;padding:3px 7px;background:#ddebe7;border-radius:10px}
 .lv8820-table{width:100%;border-collapse:collapse}.lv8820-table td,.lv8820-table th{padding:6px;text-align:left;border-bottom:1px solid #e2e7e5;vertical-align:top}
 .lv8820-only{margin:8px 0}.lv8820-dialog button{cursor:pointer}.lv8820-dialog button:disabled{cursor:not-allowed;opacity:.55}
 @media(max-width:680px){.lv8820-dialog{padding:12px}.lv8820-columns{grid-template-columns:1fr}.lv8820-modal{padding:0}.lv8820-dialog{margin:0;border-radius:0}}
 `;document.head.appendChild(css);
 function make(tag,text,props={}){const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);Object.assign(e,props);return e}
 function message(text,bad=false,selector='lv8820Status'){const el=$(selector);if(!el)return;el.textContent=text;el.className='lv8820-status'+(bad?' lv8820-error':'')}
 function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('lv87-rondo-pdf',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('snapshots'))req.result.createObjectStore('snapshots')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
 async function storedPdf(change){const db=await openDb();try{
  if(change){return await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite'),os=tx.objectStore('snapshots'),req=os.get(shell.dbId);let updated=null;
   req.onsuccess=()=>{try{const old=req.result;if(!old||old.hash!==shell.snap.hash)throw Error('Die PDF-Datei wurde zwischenzeitlich geändert. Bitte neu öffnen.');
    updated=change(old);os.put(updated,shell.dbId)}catch(e){try{tx.abort()}catch{};reject(e)}};
   req.onerror=()=>reject(req.error);tx.oncomplete=()=>resolve(updated);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Prüfstand konnte nicht gespeichert werden.'))})}
  return await new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readonly'),r=t.objectStore('snapshots').get(shell.dbId);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})
 }finally{db.close()}}
 function flat(snap){const rows=Array.isArray(snap?.edited)&&snap.edited.length?snap.edited:(root.LV87Core?.checkRows?.(snap.pages)?.rows||[]);
  const review=snap?.review_v8820||{};
  return rows.map(r=>{const carried={...(review[Core.rowKey(r)]||{})};
   if(!carried.review_v8820&&!r.review_v8820){
    if(r.review_action==='defer')carried.review_v8820='later';
    else if(r.checked_at&&r.verified===true)carried.review_v8820='confirmed';
   }return {...r,...carried}});}
 async function loadPDF(){const index=await root.api('/api/inventory-v75/index');shell.dbId=index.database_id||'current';
  shell.snap=await storedPdf();if(!shell.snap?.bytes||!shell.snap?.pages?.length)throw Error('Zuerst die Original-RONDO-PDF über die vorhandene RONDO-PDF-Importfunktion einlesen.');
  shell.rows=flat(shell.snap);shell.articles=await root.api('/api/articles');if(!Array.isArray(shell.articles))shell.articles=[];
  shell.pdf=null;shell.pdfHash='';shell.canvasKey='';shell.idx=0;const pending=Core.remaining(shell.rows);if(pending.length)shell.idx=pending[0].index;
 }
 function ensureModal(){let modal=$('lv8820Modal');if(modal)return modal;
  modal=make('div',undefined,{id:'lv8820Modal',className:'lv8820-modal',hidden:true});modal.innerHTML=`<div class="lv8820-dialog" role="dialog" aria-modal="true" aria-label="RONDO-PDF Sichtprüfung">
  <div class="lv8820-actions" style="justify-content:space-between;margin-top:0"><h2>RONDO-PDF – Sichtprüfung</h2><button type="button" id="lv8820Close" class="secondary">Schließen</button></div>
  <div id="lv8820Status" role="status" class="lv8820-status"></div><div id="lv8820Row"></div></div>`;
  document.body.appendChild(modal);$('lv8820Close').onclick=()=>{modal.hidden=true;shell.pdf=null;shell.canvasKey=''};return modal;
 }
 async function openReview(){const previous=$('lv87Modal');if(previous&&!previous.hidden)throw Error('Bitte zuerst die bisherige PDF-Prüfung schließen, damit sich beide Prüfbereiche nicht gegenseitig überschreiben.');const modal=ensureModal();modal.hidden=false;message('Lade gespeicherten PDF-Prüfstand …');try{await loadPDF();renderReview()}catch(e){message(e.message,true);$('lv8820Row').innerHTML=`<p>Öffne in der Inventur zunächst die vorhandene Funktion „RONDO-PDF einlesen“.</p><button id="lv8820Old" type="button">Vorhandene PDF-Funktion öffnen</button>`;
   $('lv8820Old').onclick=()=>{modal.hidden=true;root.LV87?.restorePdf?.()}}}
 function showIndex(i){shell.idx=Math.min(shell.rows.length-1,Math.max(0,i));shell.full=false;renderReview()}
 function nextOpen(){const pending=Core.remaining(shell.rows,['open']);
  if(!pending.length){const later=Core.remaining(shell.rows,['later']);const area=$('lv8820Row');
   area.innerHTML=`<h3>Alle aktuell offenen PDF-Positionen bearbeitet</h3><p>${later.length} Positionen stehen noch auf „Später prüfen“.</p><div class="lv8820-actions"><button type="button" id="lv8820LaterList" class="secondary">Zurückgestellte Positionen öffnen</button><button type="button" id="lv8820Done" class="primary">Zur Inventur zurück</button></div>`;
   $('lv8820LaterList').onclick=()=>later.length?showIndex(later[0].index):$('lv8820Modal').hidden=true;
   $('lv8820Done').onclick=()=>$('lv8820Modal').hidden=true;return;}
  const next=pending.find(x=>x.index>shell.idx)||pending[0];showIndex(next.index)}
 function previewFor(row){const p=Core.proposals(row,shell.articles);const all=[...p.exact,...p.confusable];return all.map(a=>`<li><b>${html(a.article_no)}</b> – ${html(a.description)}${Core.compact(a.article_no)!==Core.compact(row.article_no)?' <span class="lv8820-tag">mögliche I/1- oder O/0-Verwechslung</span>':''}</li>`).join('')||'<li>Kein passender Artikel im vorhandenen Stamm gefunden</li>'}
 function renderReview(){const stats=Core.reviewStats(shell.rows),row=shell.rows[shell.idx],area=$('lv8820Row');if(!row){area.innerHTML='<p>Keine erkannten PDF-Positionen vorhanden.</p>';return}
  const position=Number(row.position),page=Number(row.page); const old=Core.compact(row.ocr_original_no||row.article_no),current=Core.compact(row.article_no);
  message(`${stats.reviewed} geprüft · ${stats.later} später prüfen · ${stats.open} offen. Die Prüfung verändert keine Zählmengen.`);
  area.innerHTML=`<div class="lv8820-actions"><b>Seite ${page}, Position ${position}</b><span class="lv8820-tag">${html(row.review_v8820==='confirmed'?'Geprüft':row.review_v8820==='corrected'?'Korrigiert':row.review_v8820==='later'?'Zurückgestellt':'Offen')}</span><button class="secondary" id="lv8820Prev">Zurück</button><button class="secondary" id="lv8820Next">Nächster offener Artikel</button></div>
   <div class="lv8820-columns"><div><h3>Original-PDF</h3><div class="lv8820-actions"><button type="button" class="secondary" id="lv8820Zoom">${shell.full?'Nur Zeile anzeigen':'Ganze Seite anzeigen'}</button></div><div id="lv8820PdfImage" class="lv8820-pdf" aria-label="Original-PDF-Ausschnitt"><span class="lv8820-small">Original wird geladen …</span></div></div>
   <div><h3>Artikel vergleichen</h3><p><b>OCR/ursprüngliche Nummer:</b> ${html(old)}</p><p><b>Aktuelle Nummer:</b> ${html(current)}</p><p class="lv8820-small">${html(row.description||'Keine Bezeichnung erkannt')} · Einheit aus RONDO-PDF: ${html(row.unit||'–')}</p>
   <label><b>Richtige Artikelnummer</b><input type="text" id="lv8820ManualNo" maxlength="48" autocomplete="off" spellcheck="false" value="${html(current)}" list="lv8820Suggest"><datalist id="lv8820Suggest"></datalist></label>
   <p class="lv8820-small">Bei unsicherer Erkennung die Nummer direkt aus dem Originalbild abtippen.</p><div id="lv8820Matches" class="lv8820-note"><b>Passende Stammdaten:</b><ul>${previewFor(row)}</ul></div>
   <div class="lv8820-actions"><button id="lv8820Confirm" type="button" class="primary">Artikel prüfen und weiter</button><button id="lv8820Later" class="secondary" type="button">Später prüfen</button></div>
   <p class="lv8820-small">Die bestätigte PDF-Nummer wird gespeichert. Kein Lagerartikel wird angelegt, zusammengeführt oder gelöscht.</p></div></div>
   <div class="lv8820-actions"><label class="lv8820-small">Position suchen <input id="lv8820Jump" type="search" placeholder="z. B. I1000329 oder 4:5" style="max-width:250px"></label><button id="lv8820JumpGo" type="button">Finden</button></div>`;
  $('lv8820Prev').onclick=()=>showIndex(shell.idx-1);
  $('lv8820Next').onclick=nextOpen;
  $('lv8820Zoom').onclick=()=>{shell.full=!shell.full;renderReview()};
  $('lv8820Confirm').onclick=()=>confirmRow().catch(e=>message(e.message,true));
  $('lv8820Later').onclick=()=>saveRow('later',row.article_no).catch(e=>message(e.message,true));
  $('lv8820JumpGo').onclick=()=>{const k=Core.compact($('lv8820Jump').value);const found=shell.rows.findIndex(x=>Core.compact(x.article_no)===k||Core.rowKey(x)===k);if(found<0)message('Artikel in dieser PDF nicht gefunden.',true);else showIndex(found)};
  const input=$('lv8820ManualNo'),list=$('lv8820Suggest');
  const refill=()=>{const value=Core.compact(input.value),matches=shell.articles.filter(a=>a.active!==0&&Core.compact(a.article_no).includes(value)).slice(0,25);
   list.innerHTML=matches.map(a=>`<option value="${html(a.article_no)}">${html(a.description)}</option>`).join('');
   $('lv8820Matches').innerHTML='<b>Passende Stammdaten:</b><ul>'+previewFor({...row,article_no:value})+'</ul>'};
  input.addEventListener('input',refill);refill();showPDF(row,page,position).catch(e=>{$('lv8820PdfImage').textContent='Originalausschnitt nicht verfügbar: '+e.message+' – Artikelnummer bitte nur nach Sichtkontrolle bestätigen.'});
 }
 async function saveRow(action,number){if(shell.busy)return;shell.busy=true;try{
  const base=shell.rows[shell.idx],original=Core.compact(base.article_no),changed=action==='later'?null:Core.compact(number);
  const upd=Core.normalizeRow(base,{action:action==='later'?'later':changed===original?'confirmed':'corrected',article_no:changed||base.article_no});
  // Multiple positions may share a number: never infer an automatic counting transfer.
  if(action!=='later'&&shell.rows.some((r,i)=>i!==shell.idx&&Core.compact(r.article_no)===upd.article_no)){
   if(!confirm('Diese Artikelnummer steht bereits an einer anderen PDF-Position. Beide Positionen behalten und nur die Nummer prüfen?'))return;
  }
  const key=Core.rowKey(base),updated=await storedPdf(old=>{
   const list=flat(old),at=list.findIndex(r=>Core.rowKey(r)===key);if(at<0)throw Error('Die PDF-Position wurde zwischenzeitlich geändert.');
   // Protect concurrent edits of the SAME row; unrelated review progress is preserved.
   if(Core.compact(list[at].article_no)!==original||(String(list[at].reviewed_at||'')!==String(base.reviewed_at||'')))throw Error('Diese Position wurde in einem anderen Fenster geändert. Bitte neu öffnen und beide Prüfergebnisse vergleichen.');
   const full=Core.normalizeRow(list[at],{action:upd.review_v8820==='later'?'later':upd.review_v8820,article_no:upd.article_no});
   list[at]=full;const review={...(old.review_v8820||{})};review[key]={review_v8820:full.review_v8820,reviewed_at:full.reviewed_at};
   return {...old,edited:list,review_v8820:review,updated:new Date().toISOString()}
  });
  shell.snap=updated;shell.rows=flat(updated);message(action==='later'?'Position zurückgestellt.':'Artikelnummer geprüft und gespeichert.');nextOpen();
 }finally{shell.busy=false}}
 async function confirmRow(){const input=$('lv8820ManualNo');const number=Core.compact(input?.value);if(!Core.validArticle(number))throw Error('Bitte eine vollständige gültige Artikelnummer eingeben.');
  const old=shell.rows[shell.idx],p=Core.proposals({...old,article_no:number},shell.articles);
  if(p.exact.length===0&&!confirm('Diese Artikelnummer wurde im aktiven Artikelstamm nicht gefunden. Nur die PDF-Nummer als geprüft speichern? Es wird KEIN neuer Artikel angelegt.'))return;
  await saveRow('confirmed',number);
 }
 async function showPDF(row,page,position){const el=$('lv8820PdfImage');if(!el||!shell.snap?.bytes)throw Error('Keine Original-PDF gespeichert');const hash=shell.snap.hash;
  if(!shell.pdf||shell.pdfHash!==hash){const pdfjs=await import('./vendor/pdfjs/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='./vendor/pdfjs/pdf.worker.min.mjs';
   const arr=shell.snap.bytes instanceof Uint8Array?shell.snap.bytes:new Uint8Array(shell.snap.bytes);
   shell.pdf=await pdfjs.getDocument({data:arr.slice()}).promise;shell.pdfHash=hash}
  const documentPage=await shell.pdf.getPage(page),viewport=documentPage.getViewport({scale:shell.scale}),source=document.createElement('canvas');source.width=Math.ceil(viewport.width);source.height=Math.ceil(viewport.height);
  await documentPage.render({canvasContext:source.getContext('2d'),viewport}).promise;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');let srcY=0,srcH=source.height;
  if(!shell.full&&Number.isInteger(position)&&position>=1&&position<=10){const factor=viewport.height/841.68;
   srcY=Math.round((264+(position-1)*45.4)*factor);srcH=Math.round(49*factor);srcY=Math.max(0,Math.min(srcY,source.height-1));srcH=Math.min(srcH,source.height-srcY)}
  canvas.width=source.width;canvas.height=srcH;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,srcY,source.width,srcH,0,0,canvas.width,canvas.height);
  // Rendering can finish after the user changed the selected row.
  if(el!==$('lv8820PdfImage')||shell.rows[shell.idx]!==row)return;
  el.replaceChildren(canvas);
 }
 // Stammdaten: a separate safe path. In particular, NEVER call /api/article/delete with force.
 function archivePanel(){const d=make('details',undefined,{id:'lv8820Archive',className:'lv8820-card'});d.innerHTML=`<summary><b>V88.20 – Mehrfachauswahl fehlerhafter Artikel (sicher archivieren)</b></summary>
  <p class="lv8820-small">Artikel auswählen, Schutzprüfung durchführen und nur nach Bestätigung archivieren. Gezählt, gebucht oder mit Bestand: gesperrt. Keine Buchungen werden gelöscht.</p>
  <label>Suchen <input type="search" id="lv8820ArchiveSearch" placeholder="Artikelnummer oder Bezeichnung"></label>
  <label><input type="checkbox" id="lv8820ArchiveSuspects" checked> Nur mögliche I/1-Fehlartikel anzeigen</label>
  <div id="lv8820ArchiveStatus" role="status" class="lv8820-status">Öffnen zum Laden.</div>
  <div class="lv8820-actions"><button type="button" id="lv8820ArchiveLoad" class="secondary">Artikel laden</button><button type="button" id="lv8820ArchiveAll" class="secondary">Sichtbare markieren</button><button type="button" id="lv8820ArchiveClear" class="secondary">Auswahl aufheben</button></div>
  <div id="lv8820ArchiveList" class="lv8820-list"></div><div class="lv8820-actions"><button type="button" id="lv8820ArchiveCheck" class="primary">Auswahl auf Sicherheit prüfen</button></div><div id="lv8820ArchivePreview"></div>`;
  d.addEventListener('toggle',()=>{if(d.open&&!shell.archiveLoaded)loadArticles().catch(e=>archiveMessage(e.message,true))});
  $('master').insertBefore(d,$('master').children[1]||null);
  $('lv8820ArchiveLoad').onclick=()=>loadArticles().catch(e=>archiveMessage(e.message,true));
  $('lv8820ArchiveSearch').oninput=renderArchiveList;
  $('lv8820ArchiveSuspects').onchange=renderArchiveList;
  $('lv8820ArchiveAll').onclick=()=>{for(const a of shell.visible)shell.selected.add(Number(a.id));renderArchiveList()};
  $('lv8820ArchiveClear').onclick=()=>{shell.selected.clear();renderArchiveList()};
  $('lv8820ArchiveCheck').onclick=()=>archivePreview().catch(e=>archiveMessage(e.message,true));
 }
 function archiveMessage(messageText,error=false){message(messageText,error,'lv8820ArchiveStatus')}
 async function loadArticles(){const result=await root.api('/api/articles');if(!Array.isArray(result))throw Error('Artikelstamm konnte nicht gelesen werden.');
  shell.articles=result;shell.archiveLoaded=true;shell.preview=null;renderArchiveList();archiveMessage('Artikel geladen. Wähle Fehlartikel aus und starte die Sicherheitsprüfung.')}
 function renderArchiveList(){if(!shell.archiveLoaded)return;const query=Core.compact($('lv8820ArchiveSearch').value),onlySuspects=$('lv8820ArchiveSuspects').checked;
  const allActive=shell.articles.filter(a=>Number(a.active)!==0),byCode=new Set(allActive.map(a=>Core.compact(a.article_no)));
  const filtered=allActive.filter(a=>(!query||Core.compact(a.article_no).includes(query)||String(a.description||'').toUpperCase().includes(query))&&
   (!onlySuspects||Core.compact(a.article_no).startsWith('1')&&byCode.has('I'+Core.compact(a.article_no).slice(1))));
  shell.visible=filtered.slice(0,100);archiveMessage(`${filtered.length} passende Artikel (max. 100 gleichzeitig angezeigt), ${shell.selected.size} ausgewählt.`);
  const list=$('lv8820ArchiveList');list.innerHTML='';
  for(const a of shell.visible){const wrap=make('div',undefined,{className:'lv8820-reviewrow'}),label=make('label'),check=make('input',undefined,{type:'checkbox',checked:shell.selected.has(Number(a.id))});
   check.setAttribute('aria-label','Artikel '+a.article_no+' auswählen');check.onchange=()=>{if(check.checked)shell.selected.add(Number(a.id));else shell.selected.delete(Number(a.id));archiveMessage(`${shell.selected.size} Artikel ausgewählt.`)};
   label.append(make('b',a.article_no),document.createTextNode(' – '+String(a.description||'')+' · Bestand: '+fmt(a.stock)));
   wrap.append(check,label);list.append(wrap)}
  $('lv8820ArchivePreview').replaceChildren();shell.preview=null;
 }
 async function archivePreview(){const ids=[...shell.selected];if(!ids.length)throw Error('Bitte mindestens einen Artikel auswählen.');if(ids.length>200)throw Error('Maximal 200 Artikel pro Sicherheitsprüfung.');
  const result=await post('/api/articles/v88-20/archive-preview',{ids});shell.preview=result;
  const holder=$('lv8820ArchivePreview');holder.innerHTML=`<div class="lv8820-card"><h3>Sicherheitsprüfung</h3>
   <p><b>${(result.allowed||[]).length} sicher archivierbar</b> · ${(result.blocked||[]).length} gesperrt</p>
   <p class="lv8820-small">Archivierung blendet die gewählten unbenutzten Fehlartikel aus, ohne eine einzige Buchung zu löschen. Bestand oder Zählungen bleiben unverändert.</p>
   <div class="lv8820-list"><table class="lv8820-table"><thead><tr><th>Artikel</th><th>Ergebnis</th></tr></thead><tbody>${[...(result.allowed||[]).map(x=>`<tr><td>${html(x.article_no)}</td><td>Archivierung möglich</td></tr>`),...(result.blocked||[]).map(x=>`<tr><td>${html(x.article_no||x.id)}</td><td>${html((x.reasons||[]).join('; '))}</td></tr>`)].join('')}</tbody></table></div>
   <div class="lv8820-actions"><button type="button" id="lv8820ArchiveCommit" class="primary" ${(result.allowed||[]).length?'':'disabled'}>Nur freigegebene Artikel archivieren</button></div></div>`;
  $('lv8820ArchiveCommit').onclick=()=>archiveCommit().catch(e=>archiveMessage(e.message,true));
 }
 async function archiveCommit(){const allowed=shell.preview?.allowed||[];if(!allowed.length)throw Error('Keine Artikel freigegeben.');
  if(!confirm(`Es werden ${allowed.length} unbenutzte Artikel archiviert. Keine Buchungen oder Zählungen werden gelöscht. Fortfahren?`))return;
  const typed=prompt('Zur zweiten Bestätigung bitte ARCHIVIEREN eingeben.');if(typed!=='ARCHIVIEREN')return;
  const ids=allowed.map(x=>Number(x.id));const response=await post('/api/articles/v88-20/archive-commit',{ids,confirmation:'ARCHIVIEREN'});
  shell.selected.clear();shell.preview=null;await loadArticles();archiveMessage(`${response.archived} Artikel archiviert. Backup und Audit-Protokoll wurden erstellt.`);
 }

 // Sonderbericht nur für tatsächlich gezählte Artikel, die nicht sicher in der Firmen-PDF stehen.
 async function openExtraReport(){
  let modal=$('lv8820ReportModal');if(!modal){modal=make('div',undefined,{id:'lv8820ReportModal',className:'lv8820-modal',hidden:true});
   modal.innerHTML=`<div class="lv8820-dialog" role="dialog" aria-modal="true" aria-label="RONDO Zusatzliste">
   <div class="lv8820-actions" style="justify-content:space-between;margin-top:0"><h2>Zusatzliste – gezählte Artikel außerhalb der RONDO-PDF</h2><button type="button" class="secondary" id="lv8820ReportClose">Schließen</button></div>
   <p>Die Liste enthält nur tatsächlich gezählte Artikel. Unsichere mögliche OCR-Treffer werden ausdrücklich gekennzeichnet.</p>
   <label>Inventur auswählen <select id="lv8820ReportSession" style="width:100%;padding:10px"></select></label>
   <div id="lv8820ReportStatus" class="lv8820-status" role="status"></div>
   <div class="lv8820-actions"><button class="primary" id="lv8820ReportPDF" type="button">PDF herunterladen</button><button class="secondary" id="lv8820ReportDOCX" type="button">Word-Dokument herunterladen</button></div></div>`;
   document.body.appendChild(modal);$('lv8820ReportClose').onclick=()=>modal.hidden=true}
  modal.hidden=false;
  try{
   const index=await root.api('/api/inventory-v75/index');
   const select=$('lv8820ReportSession');select.innerHTML=(index.sessions||[]).map(v=>`<option value="${html(v.id)}">${html(v.name)} – ${html(v.status)}</option>`).join('');
   if(!select.options.length)throw Error('Noch keine gespeicherte Inventur vorhanden.');
   $('lv8820ReportStatus').textContent='Inventur auswählen und PDF oder Word herunterladen.';
   $('lv8820ReportPDF').onclick=()=>downloadExtraReport('pdf').catch(e=>$('lv8820ReportStatus').textContent=e.message);
   $('lv8820ReportDOCX').onclick=()=>downloadExtraReport('docx').catch(e=>$('lv8820ReportStatus').textContent=e.message);
  }catch(e){$('lv8820ReportStatus').textContent=e.message}
 }
 function downloadBlob(data,filename,mime){const url=URL.createObjectURL(new Blob([data],{type:mime}));const a=make('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 async function downloadExtraReport(kind){const state=$('lv8820ReportStatus'),reporter=root.LV8820Report;
  if(!root.LV8814Report||!reporter)throw Error('Der Zusatzbericht ist nicht geladen. Bitte die Seite aktualisieren.');
  const id=$('lv8820ReportSession').value;if(!id)throw Error('Bitte eine Inventur wählen.');
  state.textContent='Vergleiche gezählte Artikel mit der gespeicherten Original-PDF …';
  const index=await root.api('/api/inventory-v75/index');shell.dbId=index.database_id||'current';
  const pdf=await storedPdf();if(!pdf?.pages?.length)throw Error('Zuerst die Firmen-PDF einlesen.');
  const inventory=await root.api('/api/inventory-v75/get?id='+encodeURIComponent(id));
  const articles=await root.api('/api/articles');
  const result=root.LV8814Report.build(flat(pdf),articles,inventory);
  const counted=reporter.makeRows(result),date=new Date().toISOString().slice(0,10);
  if(kind==='pdf')downloadBlob(reporter.pdf(result),'RONDO_Gezaehlt_ohne_PDF_'+date+'.pdf','application/pdf');
  else downloadBlob(await reporter.docx(result,root.JSZip),'RONDO_Gezaehlt_ohne_PDF_'+date+'.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  state.textContent=`${counted.length} gezählte Artikel übernommen. Keine ungeprüften Nullmengen hinzugefügt. Keine Lagerdaten geändert.`;
 }

 function inventoryPanel(){const section=$('inventory75');if(!section)return;
  const d=make('div',undefined,{id:'lv8820Inventory',className:'lv8820-card'});d.innerHTML=`<h3>V88.20 – Geführte RONDO-PDF-Sichtprüfung</h3>
  <p>Rote oder unsichere Artikel direkt im vergrößerten Original prüfen, Artikelnummern manuell korrigieren und Positionen als erledigt markieren – ohne Zählmengen zu ändern.</p>
  <div class="lv8820-actions"><button class="primary" type="button" id="lv8820Open">PDF-Prüfung starten / fortsetzen</button><button class="secondary" type="button" id="lv8820OldReview">Bisherige RONDO-PDF-Funktion</button></div>
  <div class="lv8820-actions"><button class="secondary" id="lv8820CompanyReport" type="button">Gezählte Artikel ohne Firmen-PDF-Position als PDF/Word</button></div><p class="lv8820-small">PDF-Prüfdaten liegen zunächst in diesem Browser. Vor einem Gerätewechsel den JSON-Prüfstand sichern und Synchronisierung kontrollieren. Die Original-PDF muss vorher über die bestehende Importfunktion einmal eingelesen worden sein.</p>`;
  section.insertBefore(d,section.children[1]||null);
  $('lv8820Open').onclick=()=>openReview().catch(e=>alert(e.message));
  $('lv8820OldReview').onclick=()=>root.LV87?.restorePdf?.();
  $('lv8820CompanyReport').onclick=()=>openExtraReport().catch(e=>alert(e.message));
 }
 function helpPanel(){const section=$('help');if(!section||$('lv8820Help'))return;
  const d=make('details',undefined,{id:'lv8820Help',className:'lv8820-card'});
  d.innerHTML=`<summary><b>V88.20 – Kurzanleitung: PDF-Prüfung und fehlerhafte Artikel</b></summary>
  <p><b>1.</b> Original-RONDO-PDF mit der vorhandenen Importfunktion einlesen. <b>2.</b> Unter Inventur „PDF-Prüfung starten“ wählen.</p>
  <p><b>3.</b> Die hervorgehobene Originalzeile ansehen. Falls die Nummer falsch erkannt wurde, die richtige Artikelnummer eintippen und „Artikel prüfen und weiter“ wählen.</p>
  <p><b>4.</b> Bei Unsicherheit „Später prüfen“ wählen. Geprüfte Zeilen bleiben gespeichert. Mengen bleiben unverändert und ungezählte Artikel erhalten keine Null.</p>
  <p><b>5.</b> Unter Stammdaten falsche Artikel mehrfach auswählen, „Auf Sicherheit prüfen“ wählen und nur freigegebene Artikel archivieren. Buchungen und Zählungen werden nicht gelöscht.</p>
  <p><b>6.</b> Unter Inventur den Bericht „Gezählte Artikel ohne Firmen-PDF-Position“ bei Bedarf als PDF/Word herunterladen.</p>
  <p><b>Gerätewechsel:</b> Den PDF-Prüfstand als JSON sichern und die vorhandene Dateisynchronisierung kontrollieren. Die lokale PDF-Datei und dieser Prüfdialog werden noch nicht automatisch über die Cloud mit einem anderen Gerät synchronisiert.</p>`;
  section.insertBefore(d,section.children[1]||null);
 }
 function init(){if(installed)return;installed=true;inventoryPanel();archivePanel();helpPanel();root.LV8820={openReview,loadPDF,archivePreview,Core};}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof window!=='undefined'?window:globalThis);
