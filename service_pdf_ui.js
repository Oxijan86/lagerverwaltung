(function(){
 'use strict';
 const $=id=>document.getElementById(id),C=window.LVServicePDFCore,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),post=(action,p)=>window.api('/api/service-pdf/'+action,{method:'POST',body:JSON.stringify(p)});
 let state=null,catalog=[],busy=false,job=0,retryPayload=null;
 function message(text,ok=true){window.msg($('pdf77Msg'),text,ok)}
 function article(row){return catalog.find(a=>a.article_no===String(row.article_no).trim())}
 function amount(row){return C.quantity(row.quantity)}
 function effectiveDate(doc,row){return row.date_override?row.movement_date:(row.movement_date||doc.movement_date||'')}
 function rowError(doc,row){
  if(row.processed)return '';
  const a=article(row),qty=amount(row);if(!a)return 'Artikelnummer nicht aktiv im Lager vorhanden.';if(qty===null)return 'Positive Menge eingeben.';
  if(window.LVAppRules.isWholeNumberUnit(a.unit)&&!Number.isInteger(qty))return 'Nur ganze Stückzahlen zulässig; es wird nicht gerundet.';
  if(!row.unit||C.norm(C.unit(row.unit))!==C.norm(C.unit(a.unit)))return `Einheit prüfen: Lager führt ${a.unit}.`;
  if(C.serviceReason(row.article_no,a.description,row.unit))return 'Dienstleistung: keine Materialentnahme.';
  if(!C.date(effectiveDate(doc,row)))return 'Leistungsdatum ergänzen.';if(!C.clean(doc.customer))return 'Kunde ergänzen.';return '';
 }
 function each(fn){state?.documents.forEach((d,i)=>d.items.forEach((r,j)=>fn(d,r,i,j)))}
 function reviewChanged(){if($('pdf77Reviewed'))$('pdf77Reviewed').checked=false}
 function update(){
  if(!state)return;
  const totals=new Map();let selected=0,invalid=0,processed=0;
  each((d,r)=>{const a=article(r);if(r.processed)processed++;else if(r.selected){selected++;if(a&&amount(r)!==null)totals.set(a.id,(totals.get(a.id)||0)+amount(r))}});
  each((d,r,i,j)=>{
   const a=article(r),base=rowError(d,r),total=a?totals.get(a.id)||0:0;
   let text=r.processed?`Bereits gebucht (${r.previous?.quantity??'—'}).`:base||'Bereit zur Prüfung.';
   const shortage=a&&total>Number(a.stock)+1e-9;
   if(shortage&&!r.processed)text=`Gesamtauswahl übersteigt Bestand (${total} ausgewählt, ${a.stock} verfügbar).`;
   if(r.selected&&!r.processed&&(base||shortage))invalid++;
   const status=$(`pdf77-status-${i}-${j}`);if(status){status.textContent=text;status.className=(base||shortage)&&!r.processed?'pdf77-error small':'small'}
   const stock=$(`pdf77-stock-${i}-${j}`);if(stock)stock.textContent=a?`${a.stock} ${a.unit} → ${Number((a.stock-total).toFixed(6))} ${a.unit}`:'—';
  });
  $('pdf77Summary').textContent=`${state.documents.length} Bericht(e) · ${selected} Position(en) ausgewählt · ${invalid} ungeklärte Auswahl(en) · ${processed} bereits gebucht. Der Bestand danach berücksichtigt die gesamte Auswahl über alle PDFs.`;
  ['pdf77Read','pdf77Files','pdf77OCR'].forEach(id=>$(id).disabled=busy||!!retryPayload);
  $('pdf77Commit').textContent=retryPayload?'Speicherung erneut versuchen':'Geprüfte Materialien entnehmen';
  $('pdf77Commit').disabled=busy||(!retryPayload&&(!selected||!!invalid||!$('pdf77Reviewed').checked));
  $('pdf77Refresh').disabled=busy;['pdf77Reviewed','pdf77Technician','pdf77Note'].forEach(id=>$(id).disabled=busy||!!retryPayload);document.querySelectorAll('#pdf77Preview input,#pdf77Preview select').forEach(e=>e.disabled=busy||!!retryPayload||e.dataset.processed==='1');
 }
 function adopt(result,preserve=false){
  const old=new Map();if(preserve)each((d,r)=>old.set(d.file_hash+':'+r.position_key,{...r}));
  const oldDocs=new Map((state?.documents||[]).map(d=>[d.file_hash,d]));catalog=result.catalog;state=result;
  for(const d of state.documents){const prev=preserve?oldDocs.get(d.file_hash):null;d.customer=prev?.customer??d.metadata.customer;d.machine=prev?.machine??d.metadata.machine;d.ticket=prev?.ticket??d.metadata.ticket;d.movement_date=prev?.movement_date??(d.dates.length===1?d.dates[0]:'');
   for(const r of d.items){const existing=old.get(d.file_hash+':'+r.position_key),a=article(r);if(existing){for(const k of ['article_no','quantity','unit','movement_date','date_override','selected'])r[k]=existing[k]}else{r.unit=r.unit||a?.unit||'';r.selected=!!(a&&!r.processed&&!r.warnings.length&&!rowError(d,r))}if(r.processed)r.selected=false}
  }
  render();
 }
 function render(){
  if(!state){$('pdf77Preview').innerHTML='';$('pdf77Actions').hidden=true;return}
  $('pdf77Actions').hidden=false;$('pdf77ArticleOptions').innerHTML=catalog.map(a=>`<option value="${esc(a.article_no)}">${esc(a.description)}</option>`).join('');
  $('pdf77Preview').innerHTML=state.documents.map((d,i)=>`<details class="card pdf77-document" open><summary><b>${esc(d.filename)}</b> · ${d.items.length} Materialposition(en) · ${d.excluded.length} Leistungsposition(en) ausgeschlossen</summary><div class="formgrid"><label>Kunde<input value="${esc(d.customer)}" oninput="LVServicePDF.doc(${i},'customer',this.value)"></label><label>Maschine<input value="${esc(d.machine)}" oninput="LVServicePDF.doc(${i},'machine',this.value)"></label><label>Ticket / Berichtnummer<input value="${esc(d.ticket)}" oninput="LVServicePDF.doc(${i},'ticket',this.value)"></label><label>Datum für Positionen ohne Leistungsdatum<input type="date" id="pdf77-date-${i}" value="${esc(d.movement_date)}" onchange="LVServicePDF.doc(${i},'movement_date',this.value)"><span class="small">Vorhandene Positionsdaten bleiben erhalten. Das Meldedatum des Tickets wird nicht als Leistungsdatum verwendet.</span></label></div>${d.warnings.map(w=>`<p class="pdf77-error">${esc(w)}</p>`).join('')}${!d.items.length?'<p>Keine Materialpositionen erkannt. Es wird nichts abgebucht. Bei Bild-PDFs die OCR-Option aktivieren und erneut einlesen.</p>':''}<div class="tablewrap"><table class="pdf77-table"><thead><tr><th>Auswahl</th><th>Artikelnummer / PDF-Bezeichnung</th><th>Menge / Einheit</th><th>Leistungsdatum</th><th>Bestand → nach Gesamtauswahl</th><th>Prüfung</th></tr></thead><tbody>${d.items.map((r,j)=>`<tr ${state.hideProcessed&&r.processed?'hidden':''}><td data-label="Auswahl"><input type="checkbox" id="pdf77-check-${i}-${j}" data-processed="${r.processed?'1':'0'}" ${r.selected?'checked':''} ${r.processed?'disabled':''} aria-label="Materialposition ${j+1} auswählen" onchange="LVServicePDF.row(${i},${j},'selected',this.checked)"></td><td data-label="Artikel"><input list="pdf77ArticleOptions" id="pdf77-no-${i}-${j}" value="${esc(r.article_no)}" data-processed="${r.processed?'1':'0'}" aria-label="Artikelnummer" onchange="LVServicePDF.row(${i},${j},'article_no',this.value)"><div>${esc(r.description)}</div><span class="small">PDF-Seite ${r.page}, Tabelle ${r.table}</span></td><td data-label="Menge / Einheit"><input id="pdf77-qty-${i}-${j}" inputmode="decimal" value="${esc(r.quantity??'')}" data-processed="${r.processed?'1':'0'}" aria-label="Entnahmemenge" oninput="LVServicePDF.row(${i},${j},'quantity',this.value)"><input id="pdf77-unit-${i}-${j}" value="${esc(r.unit)}" data-processed="${r.processed?'1':'0'}" aria-label="Einheit" onchange="LVServicePDF.row(${i},${j},'unit',this.value)"></td><td data-label="Datum"><input type="date" id="pdf77-row-date-${i}-${j}" value="${esc(effectiveDate(d,r))}" data-processed="${r.processed?'1':'0'}" aria-label="Leistungsdatum" onchange="LVServicePDF.row(${i},${j},'movement_date',this.value)"></td><td data-label="Bestand" id="pdf77-stock-${i}-${j}"></td><td data-label="Prüfung"><div id="pdf77-status-${i}-${j}"></div>${r.warnings.map(w=>`<div class="small pdf77-warning">${esc(w)}</div>`).join('')}<details><summary>Originalzeile</summary><p>${esc(r.source_text)}</p></details></td></tr>`).join('')}</tbody></table></div>${d.excluded.length?`<details><summary>Ausgeschlossene Zeit-, Kilometer- und Kostenpositionen anzeigen</summary>${d.excluded.map(x=>`<p class="small">${esc(x.article_no)} · ${esc(x.description)} · ${esc(x.amount)} – ${esc(x.reason)}</p>`).join('')}</details>`:''}</details>`).join('');
  const toggle=$('pdf77ShowBooked');if(toggle){toggle.hidden=!state.documents.some(d=>d.items.some(r=>r.processed));toggle.textContent=state.hideProcessed?'Gebuchte Positionen einblenden':'Gebuchte Positionen ausblenden'}
  update();
 }
 function setBusy(value){busy=value;$('pdf77Read').disabled=value;$('pdf77Files').disabled=value;$('pdf77OCR').disabled=value;$('pdf77Cancel').hidden=!value;update()}
 window.LVServicePDF={
  update,changed(){reviewChanged();update()},toggleBooked(){if(state){state.hideProcessed=!state.hideProcessed;render()}},
  setMaster(md){const el=$('pdf77Technician');if(!el)return;const old=el.value;el.innerHTML=(md.technicians||[]).map(t=>`<option value="${esc(t.name)}">${esc(t.name)}</option>`).join('');el.value=(md.technicians||[]).some(t=>t.name===old)?old:md.default_technician||''},
  async open(){if(state&&!busy)await this.refresh()},
  async read(){
   if(busy)return;if(retryPayload)return message('Bitte zuerst die ausstehende Speicherung erneut versuchen.',false);const files=[...$('pdf77Files').files];if(!files.length)return message('Bitte mindestens eine Servicebericht-PDF auswählen.',false);if(files.length>20)return message('Bitte höchstens 20 PDFs auf einmal auswählen.',false);
   if(state&&state.documents.some(d=>d.items.some(r=>!r.processed))&&!confirm('Bisherige PDF-Vorschau ersetzen? Noch nicht gebuchte Änderungen der Vorschau werden verworfen.'))return;
   const current=++job;setBusy(true);retryPayload=null;state=null;render();let documents=[],failures=[];
   try{
    const dbid=(await window.api('/api/inventory-v75/index')).database_id;
    for(let i=0;i<files.length;i++){
     if(current!==job)break;
     try{const source=await window.LVServicePDFReader.extract(files[i],{ocr:$('pdf77OCR').checked,cancelled:()=>current!==job,progress:text=>message(`${i+1}/${files.length}: ${files[i].name} · ${text}`)});if(current!==job)break;if(source.pages.every(p=>p.text_missing))throw Error($('pdf77OCR').checked?'Texterkennung hat keinen auswertbaren Text gefunden. Bitte eine besser lesbare PDF verwenden.':'Bild-PDF ohne auslesbaren Text. Bitte die OCR-Option aktivieren und erneut auslesen.');C.parseDocument(source);documents.push(source)}catch(e){if(current!==job)break;failures.push(files[i].name+': '+e.message)}
    }
    if(current!==job)return message('Auslesen abgebrochen. Es wurde keine Entnahme gebucht.',true);
    if(!documents.length)return message(failures.join('\n')||'Keine lesbaren PDFs vorhanden.',false);
    const result=await post('preview',{documents,database_id:dbid});adopt(result);reviewChanged();update();message(`PDFs ausgelesen. Artikelnummern, Mengen, Einheiten und Leistungsdaten prüfen. Es wurde noch nichts abgebucht.${failures.length?'\nNicht eingelesen:\n'+failures.join('\n'):''}`,!failures.length);
   }catch(e){message(e.message,false)}finally{await window.LVServicePDFReader.closeOCR().catch(()=>{});setBusy(false)}
  },
  async cancel(){job++;await window.LVServicePDFReader.closeOCR().catch(()=>{});message('Auslesen wird abgebrochen. Es wurde keine Entnahme gebucht.')},
  row(i,j,key,value){const d=state.documents[i],r=d.items[j];if(r.processed||busy||retryPayload)return;r[key]=value;if(key==='movement_date')r.date_override=true;if(key==='article_no'&&!r.unit){const a=article(r);if(a){r.unit=a.unit;$(`pdf77-unit-${i}-${j}`).value=a.unit}}reviewChanged();update()},
  doc(i,key,value){if(busy||retryPayload)return;const d=state.documents[i];d[key]=value;if(key==='movement_date')d.items.forEach((r,j)=>{if(!r.movement_date&&!r.date_override)$(`pdf77-row-date-${i}-${j}`).value=value});reviewChanged();update()},
  selectAll(value){if(busy||retryPayload)return;each((d,r,i,j)=>{if(!r.processed){r.selected=!!(value&&!r.possible_duplicate&&!r.ocr&&!rowError(d,r));$(`pdf77-check-${i}-${j}`).checked=r.selected}});reviewChanged();update()},
  async refresh(){if(!state||busy)return;try{const result=await post('refresh',{preview_id:state.preview_id,database_id:state.database_id});adopt(result,true);if(result.durable&&!retryPayload)message('Vorschau und Bestände aktualisiert. Noch nicht gebuchte Eingaben bleiben erhalten.')}catch(e){message(e.message,false)}},
  async commit(){
   if(busy||!state)return;update();if($('pdf77Commit').disabled)return;
   let payload=retryPayload;
   if(!payload){const items=[];each((d,r)=>{if(r.selected&&!r.processed)items.push({file_hash:d.file_hash,position_key:r.position_key,article_no:r.article_no,quantity:r.quantity,unit:r.unit,movement_date:effectiveDate(d,r)})});if(!confirm(`${items.length} geprüfte Materialposition(en) jetzt aus dem Lager entnehmen?`))return;payload={preview_id:state.preview_id,database_id:state.database_id,reviewed:$('pdf77Reviewed').checked,technician:$('pdf77Technician').value,note:$('pdf77Note').value,documents:state.documents.map(d=>({file_hash:d.file_hash,customer:d.customer,machine:d.machine,ticket:d.ticket,movement_date:d.movement_date})),items}}
   setBusy(true);
   try{const result=await post('commit',payload);retryPayload=null;adopt(result,true);const remaining=state.documents.reduce((n,d)=>n+d.items.filter(r=>!r.processed).length,0);state.hideProcessed=true;render();$('pdf77Files').value='';$('pdf77Note').value='';window.showBookingCompleted('OUT',{count:result.count||result.already_processed||0,items:payload.items,source:'RONDO-Servicebericht PDF',remaining,resetText:'Die Dateiauswahl und Bemerkung wurden geleert. Gebuchte Positionen sind als erledigt markiert und ausgeblendet.'});reviewChanged();message(result.count?`${result.count} Materialposition(en) entnommen und gespeichert.`:result.recovered?'Entnahmen nach dem Speicherfehler dauerhaft gespeichert. Keine erneute Abbuchung.':'Diese Positionen sind bereits gebucht. Keine erneute Abbuchung.');await Promise.allSettled([window.loadArticles(),window.dash(),window.loadRecentMovements('OUT')])}
   catch(e){try{const result=await post('refresh',{preview_id:state.preview_id,database_id:state.database_id});if(result.durable===false){retryPayload=payload;adopt(result,true)}}catch{}message(e.message+(retryPayload?' Die dauerhafte Speicherung ist noch nicht bestätigt. Bitte „Speicherung erneut versuchen“ wählen; die Entnahmen werden nicht doppelt gebucht.':''),false)}
   finally{setBusy(false)}
  },
  clear(){if(busy)return;if(retryPayload)return message('Bitte zuerst die ausstehende Speicherung erneut versuchen.',false);if(state&&!confirm('PDF-Vorschau leeren? Bereits gebuchte Entnahmen bleiben erhalten.'))return;state=null;$('pdf77Files').value='';reviewChanged();render();message('PDF-Vorschau geleert.')},
  beforeLeave(){if(busy){message('Bitte das Auslesen oder Buchen abwarten beziehungsweise das Auslesen abbrechen.',false);return false}return true}
 };
 window.addEventListener('beforeunload',e=>{if(busy||retryPayload){e.preventDefault();e.returnValue=''}});
})();
