/* Lagerverwaltung Lovrencic V88.21 – safe automatic PDF review, clear original PDF
 * search, inventory-only relocations and read-only stock history.
 * This add-on deliberately never invokes inventory commit or stock booking APIs. */
(function(root){'use strict';
 const C=root.LV8821Core;if(!C){console.error('V88.21: Kernmodul fehlt.');return}
 const $=id=>document.getElementById(id),safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const post=(url,data)=>root.api(url,{method:'POST',body:JSON.stringify(data)});
 const fmt=v=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:4});
 const css=document.createElement('style');css.textContent=`
 .lv8821-box{border:2px solid #8caab7;border-radius:12px;padding:14px;background:var(--card-bg,#fff);color:var(--text-color,inherit);margin:14px 0;max-width:100%;box-sizing:border-box}
 .lv8821-box h3{margin:0 0 9px}.lv8821-flex{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.lv8821-flex>*{max-width:100%}
 .lv8821-box input,.lv8821-box select{padding:9px;border:1px solid #879ba3;border-radius:7px;box-sizing:border-box;max-width:100%}
 .lv8821-box label{display:block;margin:8px 0}.lv8821-box label input,.lv8821-box label select{display:block;width:100%;min-height:42px;margin-top:3px}
 .lv8821-box .small{font-size:.92rem;color:#576774}.lv8821-status{margin:8px 0;padding:9px;background:#eef4f7;border-left:4px solid #41728b;border-radius:5px;white-space:pre-wrap}
 .lv8821-error{background:#fff2ef;border-color:#b33228}.lv8821-result{display:block;text-align:left;padding:9px;margin:5px 0;width:100%;background:transparent;border:1px solid #ccd6dc;border-radius:6px;cursor:pointer}
 .lv8821-compare{overflow-x:auto;border:1px solid #9cadb6;border-radius:8px;background:#e9edf0;margin:10px 0;padding:8px;min-height:80px}
 .lv8821-compare canvas{max-width:none;display:block;height:auto;image-rendering:auto}.lv8821-legend{font-weight:600;color:#233d4f}
 .lv8821-modal[hidden]{display:none!important}.lv8821-modal{position:fixed;inset:0;z-index:21000;background:#172332c9;overflow-y:auto;padding:12px}
 .lv8821-dialog{max-width:950px;margin:10px auto;background:white;color:#24343c;padding:16px;border-radius:12px}
 .lv8821-table{width:100%;border-collapse:collapse}.lv8821-table td,.lv8821-table th{padding:8px;text-align:left;border-bottom:1px solid #d5dde0;vertical-align:top}
 @media(max-width:640px){.lv8821-dialog{padding:10px}.lv8821-box{padding:10px}}
 `;document.head.appendChild(css);
 const state={auto:null,autoRunning:false,autoCancel:false,viewer:{snap:null,dbid:'',pdf:null,key:'',scale:2.8},home:{article:null,refs:null,source:null,mode:'whole'},histBusy:false};
 const status=(id,message,bad=false)=>{const el=$(id);if(!el)return;el.textContent=message;el.classList.toggle('lv8821-error',bad)};
 const openDb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open('lv87-rondo-pdf',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('snapshots'))req.result.createObjectStore('snapshots')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
 async function snapshot(id){const db=await openDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly'),req=tx.objectStore('snapshots').get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}finally{db.close()}}
 function flatten(pdf){return Array.isArray(pdf?.edited)&&pdf.edited.length?pdf.edited:root.LV87Core.checkRows(pdf.pages).rows}
 async function updateLocal(id,hash,key,change){const db=await openDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots'),req=store.get(id);let result;
  req.onsuccess=()=>{try{const old=req.result;if(!old||old.hash!==hash)throw Error('Original-PDF wurde geändert. Alte Prüfung wird nicht überschrieben.');
   const rows=flatten(old).map(r=>({...r})),at=rows.findIndex(r=>C.key(r)===key);if(at<0)throw Error('PDF-Position fehlt.');
   if(rows[at].review_v8820||rows[at].review_action==='defer'||rows[at].checked_at)throw Error('Die PDF-Position wurde inzwischen manuell geprüft.');
   rows[at]={...rows[at],verified:true,review_v8820:'confirmed',review_action:'approved',reviewed_at:change.reviewed_at,checked_at:change.reviewed_at};
   const review={...(old.review_v8820||{})};review[key]={article_no:change.article_no,review_v8820:'confirmed',reviewed_at:change.reviewed_at};
   result={...old,edited:rows,review_v8820:review,updated:new Date().toISOString()};store.put(result,id);
  }catch(e){try{tx.abort()}catch{};reject(e)}};req.onerror=()=>reject(req.error);tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||Error('Browser-Speicherung fehlgeschlagen'))})}finally{db.close()}}
 async function contextPdf(){const index=await root.api('/api/inventory-v75/index'),id=index.database_id||'current',snap=await snapshot(id);if(!snap?.bytes||!snap?.pages?.length)throw Error('Die RONDO-Original-PDF wurde in diesem Browser noch nicht eingelesen. Unter Inventur → RONDO-PDF → „Letzte PDF öffnen“ prüfen.');return {id,snap}}
 function busyReviews(){return ($('lv8820Modal')&&!$('lv8820Modal').hidden)||($('lv87Modal')&&!$('lv87Modal').hidden)}
 async function loadAuto(){if(busyReviews())throw Error('Bitte zuerst die andere PDF-Prüfung schließen, bevor du die Sammelprüfung startest.');
  const {id,snap}=await contextPdf(),catalog=root.LV882Catalog;
  if(!catalog?.SHA256||snap.hash!==catalog.SHA256)throw Error('Automatische Prüfung ist ausschließlich für die exakt bekannte RONDO-Original-PDF freigegeben. Andere PDFs müssen manuell geprüft werden.');
  const rows=flatten(snap),articles=await root.api('/api/articles');let planned=C.planAuto(rows,catalog.pages(),articles,snap.hash,catalog.SHA256);
  const db=await root.api('/api/v88-20/pdf-review?hash='+encodeURIComponent(snap.hash));
  if(db.database_id!==id)throw Error('Die Datenbank wurde gewechselt. Bitte neu öffnen.');const existing=new Map((db.positions||[]).map(r=>[r.position_key,r]));
  planned={...planned,eligible:planned.eligible.filter(r=>!existing.has(r.key))};state.auto={id,snap,planned,existing};
  const manual=planned.manual.length+(planned.total-planned.manual.length-planned.eligible.length);
  status('lv8821AutoStatus',`${planned.eligible.length} sichere, noch offene Treffer gefunden. ${manual} Positionen bleiben für die manuelle Sichtprüfung. Es werden nur Prüfkennzeichen gespeichert – keine Zählmengen oder Lagerbestände verändert.`);
  const preview=$('lv8821AutoPreview');if(preview)preview.innerHTML=planned.eligible.slice(0,14).map(p=>`<div class="small">Seite ${safe(p.key.replace(':',' · Position '))} · ${safe(p.article_no)}</div>`).join('')+(planned.eligible.length>14?`<div class="small">… und ${planned.eligible.length-14} weitere eindeutig gesicherte Positionen</div>`:'');
 }
 async function runAuto(){if(state.autoRunning)return;if(!state.auto)await loadAuto();const {planned,id,snap,existing}=state.auto;if(!planned.eligible.length)return status('lv8821AutoStatus','Keine weiteren sicheren Treffer. Offene Artikel bitte manuell anhand der Original-PDF prüfen.');
  if(!confirm(`${planned.eligible.length} eindeutige Treffer als geprüft markieren?\n\nI/1- und O/0-Zweifelsfälle werden ausgelassen. Keine Bestands- oder Zähländerung.`))return;
  state.autoRunning=true;state.autoCancel=false;const btn=$('lv8821AutoGo');btn.disabled=true;let done=0,failed=0,localPending=0;
  try{for(const p of planned.eligible){if(state.autoCancel)break;
    try{const saved=await post('/api/v88-20/pdf-review',{hash:snap.hash,key:p.key,article_no:p.article_no,state:'confirmed',source_no:p.article_no,expected_reviewed_at:existing.get(p.key)?.reviewed_at||''});
      // If the IndexedDB save fails, the DB review survives; the existing V88.20 review loader mirrors it on next opening.
      try{await updateLocal(id,snap.hash,p.key,saved)}catch(e){localPending++;console.warn('Prüfstand im Browser noch nicht gespiegelt:',p.key,e)}
      done++;
    }catch(e){failed++;console.warn('Einzelposition nicht automatisch bestätigt:',p.key,e)}
    if(done%5===0||done+failed===planned.eligible.length)status('lv8821AutoStatus',`${done} von ${planned.eligible.length} Prüfentscheidungen gespeichert. ${failed} Rückmeldungen benötigen Sichtkontrolle. Keine Bestandsbuchung.`);
    if((done+failed)%20===0)await new Promise(resolve=>setTimeout(resolve,0));
  }}finally{state.autoRunning=false;btn.disabled=false;state.auto=null;
    status('lv8821AutoStatus',`${done} automatisch geprüfte Positionen · ${failed} nicht bestätigt · ${localPending} Browser-Spiegelungen bei erneutem Öffnen nachholen.${state.autoCancel?' Vorgang unterbrochen.':''}\nBitte die übrigen roten/I-1-Positionen weiter manuell kontrollieren.`);}
 }
 function autoPanel(){const section=$('inventory75');if(!section)return;const area=document.createElement('section');area.className='lv8821-box';area.id='lv8821AutoPanel';area.innerHTML=`<h3>V88.21 – Sichere PDF-Treffer automatisch prüfen</h3><p>Die Original-RONDO-PDF wird anhand ihrer Prüfsumme kontrolliert. I/1-Dubletten, abweichende Beschreibungen und zuvor bearbeitete Zeilen bleiben offen.</p>
  <div class="lv8821-flex"><button id="lv8821AutoFind" type="button" class="secondary">Sichere Treffer ermitteln</button><button id="lv8821AutoGo" type="button" class="primary">Sichere Treffer als geprüft speichern</button><button id="lv8821AutoStop" type="button" class="secondary">Abbrechen</button></div>
  <div id="lv8821AutoStatus" class="lv8821-status" role="status">Noch keine automatische Prüfung gestartet.</div><div id="lv8821AutoPreview"></div>`;
  section.insertBefore(area,section.children[1]||null);
  $('lv8821AutoFind').onclick=()=>loadAuto().catch(e=>status('lv8821AutoStatus',e.message,true));
  $('lv8821AutoGo').onclick=()=>runAuto().catch(e=>status('lv8821AutoStatus',e.message,true));
  $('lv8821AutoStop').onclick=()=>{state.autoCancel=true;status('lv8821AutoStatus','Abbruch angefordert – bereits bestätigte Prüfentscheidungen bleiben gespeichert.');};
 }
 // A clearly legible original scan next to the selected PDF position; no OCR guess is treated as image evidence.
 async function pdfSearch(){const {id,snap}=await contextPdf();state.viewer.dbid=id;state.viewer.snap=snap;
  const q=C.norm($('lv8821PdfQuery').value);if(!q){status('lv8821PdfStatus','Bitte Artikelnummer, Beschreibung oder Seite:Position eingeben.');return}
  const exactPosition=/^\d{1,3}:\d{1,2}$/.test(q);
  const found=flatten(snap).filter(r=>exactPosition?C.key(r)===q:C.norm([r.article_no,r.description,C.key(r),r.ocr_original_no].join(' ')).includes(q)).slice(0,30);
  const list=$('lv8821PdfResults');list.replaceChildren();if(!found.length)return status('lv8821PdfStatus','Keine Position in der gespeicherten Firmen-PDF gefunden.');
  status('lv8821PdfStatus',`${found.length}${found.length===30?' oder mehr':''} passende PDF-Positionen. Einen Treffer auswählen, um den Originalscan klar zu sehen.`);
  for(const p of found){const b=document.createElement('button');b.type='button';b.className='lv8821-result';b.textContent=`Seite ${p.page}, Position ${p.position}: ${p.article_no} – ${p.description}`;b.onclick=()=>showPreview(p).catch(e=>status('lv8821PdfStatus',e.message,true));list.append(b)}
  if(found.length===1)await showPreview(found[0]);
 }
 async function showPreview(row){const {snap}=state.viewer;const page=Number(row.page),position=Number(row.position);if(!snap?.bytes||!Number.isInteger(page)||!Number.isInteger(position)||page<1||page>72||position<1||position>10)throw Error('Ungültige PDF-Position.');
  const label=$('lv8821PdfLabel'),area=$('lv8821PdfCanvas');label.textContent=`ORIGINAL-RONDO-PDF · Seite ${page} · Position ${position} · ${row.article_no} – ${row.description}`;area.replaceChildren();area.textContent='Originalzeile wird in hoher Auflösung geladen …';
  const pdfjs=await import('./vendor/pdfjs/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='./vendor/pdfjs/pdf.worker.min.mjs';
  if(!state.viewer.pdf||state.viewer.key!==snap.hash){if(state.viewer.pdf)await state.viewer.pdf.destroy().catch(()=>{});const bytes=snap.bytes instanceof Uint8Array?snap.bytes:new Uint8Array(snap.bytes);state.viewer.pdf=await pdfjs.getDocument({data:bytes.slice()}).promise;state.viewer.key=snap.hash}
  const pdfPage=await state.viewer.pdf.getPage(page),zoom=Number($('lv8821PdfZoom').value)||2.8,vp=pdfPage.getViewport({scale:zoom});
  const source=document.createElement('canvas');source.width=Math.ceil(vp.width);source.height=Math.ceil(vp.height);await pdfPage.render({canvasContext:source.getContext('2d'),viewport:vp}).promise;
  const factor=source.height/841.68;let y=Math.round((253+(position-1)*45.4)*factor),h=Math.round(57*factor);y=Math.max(0,Math.min(y,source.height-1));h=Math.min(h,source.height-y);
  const c=document.createElement('canvas');c.width=source.width;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(source,0,y,source.width,h,0,0,c.width,c.height);
  // Dynamic contrast is not applied: this is the source image, not a fabricated OCR transcription.
  area.replaceChildren(c);area.scrollLeft=Math.round(45*zoom);state.viewer.row=row;state.viewer.pdfPage=page;
  const ref=root.LV882Catalog?.SHA256===snap.hash?root.LV882Catalog.pages().flatMap(p=>p.positions).find(p=>p.page===page&&p.position===position):null;
  const cmp=$('lv8821PdfCompare');cmp.textContent=`PDF-Katalog/OCR-Vergleich (immer Originalbild kontrollieren): ${ref?.article_no||'nicht verfügbar'} | Aktuelle Erkennung: ${row.article_no} | Stammdatensatz erst nach Sichtvergleich zuordnen.`;
 }
 function pdfPanel(){const section=$('inventory75');if(!section)return;const d=document.createElement('section');d.id='lv8821PdfPanel';d.className='lv8821-box';d.innerHTML=`<h3>V88.21 – Artikel in der Original-RONDO-PDF suchen</h3><p>PDF-Zeile in hoher Auflösung ansehen, unabhängig von OCR-Vorschlägen. Der Bildausschnitt ist horizontal scrollbar, nicht verkleinert und zeigt die komplette gedruckte Zeile.</p>
 <div class="lv8821-flex"><input id="lv8821PdfQuery" type="search" style="flex:1;min-width:210px" placeholder="Artikelnummer, Beschreibung oder 4:5" aria-label="Position in Original-PDF suchen"><button id="lv8821PdfFind" class="primary" type="button">Originalposition finden</button></div>
 <div class="lv8821-flex"><label>Bildvergrößerung <select id="lv8821PdfZoom"><option value="2.8">Gut lesbar (280 %)</option><option value="3.8">Sehr groß (380 %)</option><option value="1.8">Kompakt (180 %)</option></select></label></div>
 <div id="lv8821PdfStatus" class="lv8821-status" role="status">Die Original-PDF muss einmalig im Browser gespeichert sein.</div><div id="lv8821PdfResults"></div>
 <div class="lv8821-legend" id="lv8821PdfLabel">Original-Ausschnitt</div><div id="lv8821PdfCanvas" class="lv8821-compare"></div><div id="lv8821PdfCompare" class="small"></div>`;
  section.insertBefore(d,section.children[1]||null);
  $('lv8821PdfFind').onclick=()=>pdfSearch().catch(e=>status('lv8821PdfStatus',e.message,true));
  $('lv8821PdfQuery').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('lv8821PdfFind').click()}};
  $('lv8821PdfZoom').onchange=()=>{if(state.viewer.row)showPreview(state.viewer.row).catch(e=>status('lv8821PdfStatus',e.message,true))};
 }
 // Locations are editable ONLY in the draft inventory; a final stock update still
 // belongs to the existing authorized inventory close routine.
 function homePanel(){const section=$('inventory75');if(!section)return;const d=document.createElement('section');d.id='lv8821HomePanel';d.className='lv8821-box';d.innerHTML=`<h3>V88.21 – Einräumen nach dem Zählen</h3>
 <p>Ein bereits gezähltes Teil einem anderen Lagerort zuordnen. Die gezählte Menge bleibt unverändert. Lager und Lagerort werden zunächst nur in dieser laufenden Inventur gespeichert.</p>
 <label>Gezählten Artikel suchen<input id="lv8821HomeQuery" type="search" placeholder="Artikelnummer oder Bezeichnung" autocomplete="off"></label>
 <div id="lv8821HomeResults" style="max-height:240px;overflow:auto"></div>
 <div id="lv8821HomeEditor" hidden>
  <div class="lv8821-status" id="lv8821HomeCurrent"></div>
  <label>Ziel-Lager<select id="lv8821HomeWarehouse"></select></label>
  <label>Ziel-Lagerort – vorhandenen auswählen oder Namen vollständig eintippen<input id="lv8821HomeTarget" type="text" list="lv8821HomeLocations" autocomplete="off" placeholder="z. B. Garage Regal 3"></label><datalist id="lv8821HomeLocations"></datalist>
  <p class="small">Das bloße Eintippen erzeugt keinen Lagerort. Ein unbekannter Name wird beim Speichern abgelehnt.</p>
  <div class="lv8821-flex"><button id="lv8821HomeCreate" class="secondary" type="button">Neuen Lagerort ausdrücklich anlegen</button></div>
  <label>Was soll umgeräumt werden?<select id="lv8821HomeMode"><option value="whole">Gesamte gezählte Menge an den Zielort</option><option value="partial">Nur eine Teilmenge an einen anderen Ort</option></select></label>
  <div id="lv8821HomePartial" hidden><label>Von diesem bisherigen Zähl-Lagerort<select id="lv8821HomeSource"></select></label><label>Menge zum Verschieben<input id="lv8821HomeQuantity" type="text" inputmode="decimal" placeholder="Teilmenge"></label></div>
  <div class="lv8821-flex"><button id="lv8821HomeSave" type="button" class="primary">Lagerortänderung im Inventur-Zwischenstand speichern</button></div>
 </div><div id="lv8821HomeStatus" class="lv8821-status" role="status">Bitte die laufende Inventur öffnen und einen bereits gezählten Artikel suchen.</div>`;
  section.insertBefore(d,section.children[1]||null);
  $('lv8821HomeQuery').oninput=()=>renderHomeSearch().catch(e=>status('lv8821HomeStatus',e.message,true));
  $('lv8821HomeWarehouse').onchange=()=>refreshHomeLocations();
  $('lv8821HomeMode').onchange=()=>{state.home.mode=$('lv8821HomeMode').value;$('lv8821HomePartial').hidden=state.home.mode!=='partial'};
  $('lv8821HomeCreate').onclick=()=>createLocation().catch(e=>status('lv8821HomeStatus',e.message,true));
  $('lv8821HomeSave').onclick=()=>saveRelocation().catch(e=>status('lv8821HomeStatus',e.message,true));
 }
 function currentDraft(){const data=root.LVInventory?.current?.();if(!data?.session||data.session.status!=='draft')throw Error('Bitte erst die laufende Inventur öffnen. Abgeschlossene Inventuren können nicht mehr verändert werden.');return data}
 async function renderHomeSearch(){const data=currentDraft(),search=C.norm($('lv8821HomeQuery').value),el=$('lv8821HomeResults');el.replaceChildren();if(!search){state.home.article=null;$('lv8821HomeEditor').hidden=true;return}
  const found=data.items.filter(r=>C.present(r.counted_stock)&&(C.norm(r.article_no).includes(search)||C.norm(r.description).includes(search))).slice(0,25);
  if(!found.length){el.textContent='Kein bereits gezählter Artikel gefunden.';return}
  for(const row of found){const b=document.createElement('button');b.type='button';b.className='lv8821-result';b.textContent=`${row.article_no} – ${row.description} · ${fmt(row.counted_stock)} ${row.unit}`;b.onclick=()=>chooseHomeArticle(row.article_id).catch(e=>status('lv8821HomeStatus',e.message,true));el.append(b)}
 }
 async function chooseHomeArticle(id){const data=currentDraft(),row=data.items.find(r=>Number(r.article_id)===Number(id));if(!row||!C.present(row.counted_stock))throw Error('Artikel wurde in dieser Inventur noch nicht gezählt.');
  state.home.article=Number(id);state.home.refs=await root.api('/api/inventory-v75/index');$('lv8821HomeEditor').hidden=false;
  const options=(state.home.refs.warehouses||[]).map(w=>`<option value="${Number(w.id)}">${safe(w.name)}</option>`).join('');
  $('lv8821HomeWarehouse').innerHTML=options;const wid=Number(row.warehouse_id)||Number(state.home.refs.default_warehouse_id)||0;
  if((state.home.refs.warehouses||[]).some(w=>Number(w.id)===wid))$('lv8821HomeWarehouse').value=String(wid);
  refreshHomeLocations();$('lv8821HomeTarget').value=row.location||'';
  const parts=C.parseParts(row),existing=parts.length?parts:(Number(row.counted_stock)>0?[{warehouse_id:Number(row.warehouse_id)||null,location:row.location||'',quantity:Number(row.counted_stock)}]:[]);
  const selector=$('lv8821HomeSource');selector.replaceChildren();for(const part of existing){const o=document.createElement('option');o.value=C.identity(part);o.textContent=`${part.location||'Ohne Lagerort'} · ${fmt(part.quantity)} ${row.unit}`;selector.append(o)}
  $('lv8821HomeMode').value='whole';$('lv8821HomePartial').hidden=true;state.home.mode='whole';
  $('lv8821HomeCurrent').textContent=`${row.article_no}: ${fmt(row.counted_stock)} ${row.unit} gezählt. Aktueller Inventur-Lagerort: ${row.location||'ohne Lagerort'}.${existing.length>1?' Es liegen mehrere gezählte Teilmengen vor.':''}`;
  status('lv8821HomeStatus','Bitte den Zielort wählen. Noch wurde nichts verändert.');
 }
 function refreshHomeLocations(){const refs=state.home.refs;if(!refs)return;const wid=Number($('lv8821HomeWarehouse').value)||0;
  $('lv8821HomeLocations').innerHTML=(refs.locations||[]).filter(l=>Number(l.warehouse_id)===wid).map(l=>`<option value="${safe(l.name)}"></option>`).join('');
 }
 function checkedPlace(){const refs=state.home.refs;if(!refs)throw Error('Lagerorte konnten nicht gelesen werden.');const wid=Number($('lv8821HomeWarehouse').value),entered=$('lv8821HomeTarget').value.trim();
  if(!Number.isSafeInteger(wid)||wid<1)throw Error('Bitte ein Ziel-Lager wählen.');
  const match=(refs.locations||[]).find(l=>Number(l.warehouse_id)===wid&&String(l.name||'').toLocaleLowerCase('de-DE')===entered.toLocaleLowerCase('de-DE'));
  if(!match)throw Error('Der eingegebene Lagerort ist nicht vorhanden. Bitte einen Vorschlag auswählen oder ausdrücklich „Neuen Lagerort anlegen“ anklicken.');
  return {warehouse_id:wid,location:match.name}
 }
 async function createLocation(){const data=currentDraft();const refs=state.home.refs;if(!state.home.article||!refs)throw Error('Bitte zuerst einen bereits gezählten Artikel auswählen.');
  const wid=Number($('lv8821HomeWarehouse').value),name=$('lv8821HomeTarget').value.trim();
  if(!name||name.length<2||name.length>100||!Number.isSafeInteger(wid)||wid<1)throw Error('Bitte den vollständigen neuen Lagerort (mindestens zwei Zeichen) und ein Lager wählen.');
  if((refs.locations||[]).some(l=>String(l.name).toLocaleLowerCase('de-DE')===name.toLocaleLowerCase('de-DE')))throw Error('Dieser Lagerort ist schon angelegt. Bitte den vorhandenen Eintrag auswählen.');
  if(!confirm(`Neuen Lagerort „${name}“ ausdrücklich anlegen?\n\nDadurch wird nur ein Lagerort-Stammdatensatz hinzugefügt. Keine Zählmenge oder Bestandsbuchung.`))return;
  if(!await root.LVInventory.save())throw Error('Inventur-Zwischenstand konnte nicht gespeichert werden. Neuer Lagerort nicht angelegt.');
  const result=await post('/api/inventory-v75/location',{name,warehouse_id:wid,database_id:data.database_id});
  state.home.refs={...state.home.refs,locations:result.locations||state.home.refs.locations,warehouses:result.warehouses||state.home.refs.warehouses};
  root.LVInventory.updateReferences?.(state.home.refs);refreshHomeLocations();$('lv8821HomeTarget').value=result.created?.name||name;
  status('lv8821HomeStatus',`Lagerort „${name}“ angelegt. Die Teile wurden noch NICHT umgeräumt. Bitte anschließend auf „Lagerortänderung speichern“ klicken.`);
 }
 async function saveRelocation(){const data=currentDraft(),articleId=state.home.article,orig=data.items.find(r=>Number(r.article_id)===articleId);if(!orig||!C.present(orig.counted_stock))throw Error('Der gezählte Artikel ist nicht mehr vorhanden.');
  if(!await root.LVInventory.save())throw Error('Inventur-Zwischenstand konnte nicht gesichert werden. Änderung nicht gestartet.');
  const fresh=currentDraft().items.find(r=>Number(r.article_id)===articleId),target=checkedPlace(),mode=$('lv8821HomeMode').value;
  const payload=mode==='partial'?{sourceKey:$('lv8821HomeSource').value,target,quantity:$('lv8821HomeQuantity').value,whole:false}:{target,whole:true};
  const change=C.relocation(fresh,payload);if(Number(change.counted_stock)!==Number(fresh.counted_stock))throw Error('Sicherheitsabbruch: Zählmenge verändert.');
  const existing=C.parseParts(fresh);if(mode==='whole'&&existing.length>1&&!confirm(`${existing.length} gezählte Lagerort-Teilmengen sollen gemeinsam nach „${target.location}“ umziehen. Alle ${fmt(change.counted_stock)} ${fresh.unit} zuordnen?`))return;
  const notes=mode==='whole'?`Gesamte ${fmt(change.counted_stock)} ${fresh.unit} nach ${target.location}`:`${fmt(payload.quantity)} ${fresh.unit} nach ${target.location}`;
  // Use the pre-existing inventory draft editing and version-aware save path.
  // Each edit is part of the same pending row, and the backend validates the sum.
  root.LVInventory.edit(articleId,'warehouse_id',change.warehouse_id);
  root.LVInventory.edit(articleId,'location',change.location);
  root.LVInventory.edit(articleId,'bin_parts_json',JSON.stringify(change.parts));
  if(!await root.LVInventory.save())throw Error('Zwischenspeicherung fehlgeschlagen. Bitte nicht erneut einräumen, bevor die Inventur neu geladen wurde.');
  const after=currentDraft().items.find(r=>Number(r.article_id)===articleId);
  if(Math.abs(Number(after.counted_stock)-Number(orig.counted_stock))>1e-7||Math.abs(C.parseParts(after).reduce((s,p)=>s+p.quantity,0)-Number(after.counted_stock))>1e-7)throw Error('Die gespeicherten Lagerort-Teilmengen müssen überprüft werden.');
  await chooseHomeArticle(articleId);
  status('lv8821HomeStatus',`Gespeichert: ${notes}. Die Gesamtzählung bleibt ${fmt(after.counted_stock)} ${after.unit}. Keine Bestandsbuchung und kein Inventurabschluss.`);
 }
 // Historical results use completed inventory snapshots. A null count is NEVER interpreted as zero.
 async function articleHistory(articleId){if(state.histBusy)return;state.histBusy=true;try{
  const modal=historyModal();modal.hidden=false;const body=$('lv8821HistoryBody');body.textContent='Lese die abgeschlossenen Inventuren – keine Bestandsänderung …';
  const id=Number(articleId),articles=await root.api('/api/articles'),article=articles.find(a=>Number(a.id)===id);if(!article)throw Error('Artikel nicht gefunden.');
  const index=await root.api('/api/inventory-v75/index'),sessions=(index.sessions||[]).filter(s=>s.status==='completed').sort((a,b)=>String(b.completed_at||b.updated_at).localeCompare(String(a.completed_at||a.updated_at)));
  const found=[];for(const session of sessions.slice(0,25)){const snapshot=await root.api('/api/inventory-v75/get?id='+encodeURIComponent(session.id));const row=(snapshot.items||[]).find(x=>Number(x.article_id)===id||C.norm(x.article_no)===C.norm(article.article_no));if(row)found.push(C.history(row,session))}
  body.innerHTML=`<h3>${safe(article.article_no)} – ${safe(article.description)}</h3><p>Aktueller Buchbestand: <b>${fmt(article.stock)} ${safe(article.unit)}</b>. Abgeschlossene Inventuren sind historische Nachweise und lösen niemals eine automatische Einbuchung aus.</p>`+
   (found.length?`<div style="overflow-x:auto"><table class="lv8821-table"><thead><tr><th>Inventur</th><th>Vorher</th><th>Gezählt</th><th>Abweichung</th><th>Ergebnis</th></tr></thead><tbody>${found.map(x=>`<tr><td>${safe(x.name)}<div class="small">${safe(String(x.date).slice(0,10))}</div></td><td>${fmt(x.base)}</td><td>${x.uncounted?'–':fmt(x.amount)}</td><td>${x.uncounted?'–':(x.difference>0?'+':'')+fmt(x.difference)}</td><td>${safe(x.status)}</td></tr>`).join('')}</tbody></table></div>`:'<p>Für diesen Artikel wurde in den vorhandenen abgeschlossenen Inventuren noch kein Zählstand gefunden.</p>')+
   `<p class="small">Wichtig: „Nicht gezählt“ bedeutet NICHT 0. Ein damals auf 0 gezähltes Teil bleibt in der Historie als 0 dokumentiert. Bei einem späteren Fund ist ausschließlich eine separat bestätigte normale Einbuchung mit entsprechender Notiz möglich.</p>`+
   (sessions.length>25?'<p class="small">Angezeigt werden die 25 jüngsten abgeschlossenen Inventuren. Ältere bleiben im Inventurarchiv verfügbar.</p>':'');
 }catch(e){$('lv8821HistoryBody').textContent='Inventurhistorie konnte nicht angezeigt werden: '+e.message}finally{state.histBusy=false}}
 function historyModal(){let m=$('lv8821HistoryModal');if(m)return m;m=document.createElement('div');m.id='lv8821HistoryModal';m.className='lv8821-modal';m.hidden=true;m.innerHTML=`<div class="lv8821-dialog" role="dialog" aria-modal="true" aria-label="Inventurhistorie"><div class="lv8821-flex" style="justify-content:space-between"><h2>Letzte Inventuren – nur zur Information</h2><button id="lv8821HistoryClose" class="secondary" type="button">Schließen</button></div><div id="lv8821HistoryBody"></div></div>`;document.body.append(m);$('lv8821HistoryClose').onclick=()=>m.hidden=true;return m}
 function historyButtons(){const table=$('arows');if(!table)return;
  const append=()=>{for(const tr of table.querySelectorAll('tr[id^="stock-row-"]')){const id=Number(tr.id.slice('stock-row-'.length)),cell=tr.querySelector('td[data-label="Artikelnummer"]');if(!cell||cell.querySelector('.lv8821-history-btn'))continue;
    const b=document.createElement('button');b.type='button';b.className='secondary lv8821-history-btn';b.textContent='Letzte Inventur';b.style.marginTop='5px';b.onclick=()=>articleHistory(id);cell.append(b);
   }};
  const observer=new MutationObserver(append);observer.observe(table,{childList:true});append();
 }
 function init(){if($('lv8821AutoPanel'))return;const oldCreate=$('inv84AddLocation');if(oldCreate){oldCreate.hidden=true;oldCreate.style.setProperty('display','none','important')}const countDetails=$('inv75NewLocation')?.closest('details');if(countDetails)countDetails.hidden=true;autoPanel();pdfPanel();homePanel();historyButtons();root.LV8821={loadAuto,runAuto,pdfSearch,articleHistory,relocation:C.relocation,version:'88.21'};}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof window!=='undefined'?window:globalThis);
