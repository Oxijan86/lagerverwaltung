/* V81: Nach jeder erfolgreichen lokalen Speicherung: klares, nicht-blockierendes Sync-Angebot. */
(function(){'use strict';
 const $=id=>document.getElementById(id);
 const escapeHtml=t=>String(t??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 let timer=null,pending=false,busy=false,conflictData=null,choices={};
 const els=()=>({prompt:$('lv81SyncPrompt'),badge:$('headerSyncStatus'),text:$('lv81SyncText'),message:$('lv81SyncMessage'),btn:$('lv81SyncNow'),later:$('lv81SyncLater'),review:$('lv81SyncReview'),grant:$('lv81SyncGrant')});
 function syncOpen(show){const e=els().prompt;if(e)e.hidden=!show}
 async function refresh(showPrompt=false){
  const st=await window.LVSyncNoticeState.get();const e=els();
  const failure=!!st.errorCode||!!st.writeBlocked,unsynced=st.dirty;
  if(e.badge){e.badge.title='Prüfung der verbundenen Ordnerdatei. Ein OneDrive-Serverupload kann nicht bestätigt werden.';e.badge.className='lv81-status '+(failure?'error':unsynced?'pending':'synced');e.badge.textContent=failure?'🔴 Synchronisierung prüfen':unsynced?'🟡 Cloud ausstehend':st.cloudConnected?'🟢 Ordnerdatei bestätigt':'⚪ Lokal gespeichert';}
  if(e.text)e.text.textContent=unsynced?`${st.pendingChanges||1} Änderung(en) lokal gespeichert. Möchtest du jetzt mit dem Cloud-Ordner synchronisieren?`:'Keine ungespeicherten Cloud-Änderungen.';
  if(e.message){e.message.textContent=st.errorMessage||(!st.cloudConnected?'Kein Cloud-Ordner verbunden. Die Daten bleiben lokal gespeichert.':'');e.message.hidden=!e.message.textContent;}
  if(e.review)e.review.hidden=!failure;
  if(e.grant)e.grant.hidden=st.errorCode!=='permission_required'&&st.errorCode!=='permission_denied';
  // V84: Bei laufender Inventur keine Pop-up-Flut nach jeder lokal gespeicherten Zaehleinheit.
  // Gelb/Rot im Header bleibt sichtbar und manuell synchronisieren bleibt moeglich.
  const countingManual=!!window.LVInventory?.cloudPaused?.();
  if(countingManual)syncOpen(false);
  else if(showPrompt&&unsynced)syncOpen(true);
  if(!unsynced&&!failure)syncOpen(false);
  return st;
 }
 async function sync(){
  if(busy)return;busy=true;const e=els();if(e.btn)e.btn.disabled=true;
  try{
   const st=await window.LVSyncNoticeState.get();
   if(!st.cloudConnected){
    if(e.message){e.message.hidden=false;e.message.textContent='Bitte zuerst einen Cloud-Synchronisationsordner verbinden.'}
    if(typeof window.show==='function')await window.show('sync');return;
   }
   const syncResult=await window.LVSync.sync(false);
   if(syncResult?.reloaded){await refresh(false);window.location.reload();return}
   let result=await window.LVSync.verifyFolder();
   if(!result.verified){
    // A new booking may have been saved while the first snapshot was being written.
    // Retry only via the normal guarded sync, never by forcing cloud overwrite.
    try{await window.LVSync.sync(false);result=await window.LVSync.verifyFolder()}catch(e){/* conflict/permission stays visible */}
   }
   await refresh(!result.verified);
   if(!result.verified&&e.message){e.message.hidden=false;e.message.textContent='Ordnerdatei geprüft; mindestens eine neuere lokale Änderung wartet noch. Bitte erneut synchronisieren oder Datenstände vergleichen.';}
  }catch(err){await refresh(true);if(e.message){e.message.hidden=false;e.message.textContent=err.message||String(err)}}
  finally{busy=false;if(e.btn)e.btn.disabled=false}
 }
 async function grant(){
  try{await window.LVSync.reauthorize();await sync()}
  catch(err){const e=els().message;if(e){e.hidden=false;e.textContent=err.message||String(err)}}
 }
 function later(){syncOpen(false);refresh(false).catch(console.warn)}
 function showView(){syncOpen(false);if(typeof window.show==='function')window.show('sync').then(()=>window.LVSyncUI81.review()).catch(console.warn)}
 function reviewField(key,val){choices[key]=val;review(true).catch(console.warn)}
 async function review(keep=false){
  const display=$('lv81MergeOverlay'),box=$('lv81MergeBody');if(!display||!box)return;
  try{
   const data=await window.LVSyncMergeState.compare(choices);conflictData=data;
   const table=(rows,cols,limit=70)=>{
    const a=rows.slice(0,limit);
    return `<div class="lv81-table-scroll"><table><thead><tr>${cols.map(c=>`<th>${escapeHtml(c[0])}</th>`).join('')}</tr></thead><tbody>${a.map(x=>`<tr>${cols.map(c=>`<td>${escapeHtml(c[1](x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`+(rows.length>limit?`<p class="small">${rows.length-limit} weitere Einträge; die Zusammenführung berücksichtigt alle.</p>`:'');
   };
   const issue=data.issues.length?`<div class="message error" style="display:block">${data.issues.map(escapeHtml).join('<br>')}</div>`:'';
   const movements=data.movementChanges.filter(x=>x.local||x.cloud).map(x=>({id:x.id,article:x.local?.article_no||x.cloud?.article_no||'?',device:x.action==='local'?'Lokal übernehmen':x.action==='cloud'?'Cloud beibehalten':'Entscheidung nötig',type:x.local?.movement_type||x.cloud?.movement_type||'',qty:x.local?.quantity??x.cloud?.quantity??'',date:x.local?.movement_date||x.cloud?.movement_date||'',created:x.local?.created_at||x.cloud?.created_at||'',customer:x.local?.customer||x.cloud?.customer||'',ticket:x.local?.ticket||x.cloud?.ticket||x.local?.delivery_note||x.cloud?.delivery_note||'',machine:x.local?.machine||x.cloud?.machine||'',deleted:!x.local?'Lokal gelöscht':!x.cloud?'Cloud gelöscht':''}));
   const conflicts=data.conflicts.map(x=>`<div class="lv81-conflict-row"><div><b>${escapeHtml(x.title)}</b><div class="small">Lokal: ${escapeHtml(typeof x.local==='object'?JSON.stringify(x.local):x.local)} | Cloud: ${escapeHtml(typeof x.cloud==='object'?JSON.stringify(x.cloud):x.cloud)}</div></div><select aria-label="Konfliktentscheidung ${escapeHtml(x.title)}" data-v81-choice="${escapeHtml(x.key)}"><option value="">Bitte wählen</option><option value="local" ${choices[x.key]==='local'?'selected':''}>Lokale Änderung</option><option value="cloud" ${choices[x.key]==='cloud'?'selected':''}>Cloud-Änderung</option></select></div>`).join('');
   box.innerHTML=`<p><b>Gemeinsame Basis:</b> ${escapeHtml(data.baseRevision?.slice(0,12)||'nicht nachweisbar')} &nbsp; <b>Lokale Revision:</b> ${escapeHtml(data.localRevision?.slice(0,12))} &nbsp; <b>Cloud-Revision:</b> ${escapeHtml(data.cloudRevision?.slice(0,12))}</p>`+
    issue+`<h4>Bestandsunterschiede (${data.stockDiffs.length})</h4>`+table(data.stockDiffs,[['Artikel',x=>x.article_no],['Lokal',x=>x.local??'–'],['Cloud',x=>x.cloud??'–']])+`<h4>Buchungen mit Änderungen (${movements.length})</h4>`+table(movements,[['Datum',x=>x.date],['Artikel',x=>x.article],['Art',x=>x.type],['Menge',x=>x.qty],['Kunde',x=>x.customer],['Ticket',x=>x.ticket],['Maschine',x=>x.machine],['Geloescht?',x=>x.deleted],['Vorschlag',x=>x.device]])+`<h4>Stammdatenunterschiede (${data.articleChanges.length+data.masterChanges.length})</h4>`+
    table(data.articleChanges,[['Artikel',x=>x.article_no],['Feld',x=>x.field||'Artikel'],['Lokal',x=>typeof x.local==='object'?'Eintrag':x.local??'–'],['Cloud',x=>typeof x.cloud==='object'?'Eintrag':x.cloud??'–'],['Vorschlag',x=>x.action]])+
    (data.masterChanges.length?`<h4>Weitere Stammdaten</h4>${table(data.masterChanges,[['Bereich',x=>x.table],['Lokale Änderungen',x=>x.local_changed?'Ja':'Nein'],['Cloud-Änderungen',x=>x.cloud_changed?'Ja':'Nein']])}`:'')+
    (data.deletionChanges?.length?`<h4>Löschprotokoll (${data.deletionChanges.length})</h4>${table(data.deletionChanges,[['Art',x=>x.local?.entity_type||x.cloud?.entity_type],['Schlüssel',x=>x.local?.entity_key||x.cloud?.entity_key],['Kunde',x=>x.local?.customer||x.cloud?.customer],['Ticket',x=>x.local?.ticket||x.cloud?.ticket],['Ursprung',x=>x.action]])}`:'')+
    (conflicts?`<h4>Entscheidungen (${data.conflicts.length})</h4>${conflicts}`:'')+
    `<p class="small">Bei unsicherer Ausgangsbasis, parallelen Importen oder geänderten Inventur-/Lagerstammdaten wird die automatische Zusammenführung gesperrt. Beide Originaldatenstände werden vor jeder zulässigen Zusammenführung gesichert.</p>`;
   box.querySelectorAll('[data-v81-choice]').forEach(select=>select.addEventListener('change',()=>reviewField(select.dataset.v81Choice,select.value)));
   const btn=$('lv81MergeConfirm');if(btn){btn.disabled=!data.safe||!data.hasBase;btn.title=btn.disabled?'Noch nicht sicher zusammenführbar':'Bestätigte Zusammenführung starten'}
   display.hidden=false;
  }catch(err){box.innerHTML='<div class="message error" style="display:block">'+escapeHtml(err.message||String(err))+'</div>';display.hidden=false;$('lv81MergeConfirm').disabled=true}
 }
 async function merge(){
  if(!conflictData?.safe)return;
  if(typeof levelDrafts!=='undefined'&&levelDrafts?.size){alert('Bitte zuerst ungespeicherte Lagerbestand-Änderungen speichern.');return}
  if(!confirm('Beide Datenstände werden gesichert. Nur die geprüften Änderungen zusammenführen und die Cloud-Datenbank anschließend ersetzen?'))return;
  const btn=$('lv81MergeConfirm');btn.disabled=true;
  try{const result=await window.LVSyncMergeState.merge(choices);$('lv81MergeOverlay').hidden=true;choices={};await refresh(result.dirty);location.reload()}
  catch(err){$('lv81MergeBody').insertAdjacentHTML('afterbegin','<div class="message error" style="display:block">'+escapeHtml(err.message||String(err))+'</div>');btn.disabled=false}
 }
 function closeReview(){$('lv81MergeOverlay').hidden=true;choices={};conflictData=null}
 window.LVSyncUI81={refresh,sync,later,grant,review,merge,closeReview,showView};
 window.addEventListener('lv81:local-saved',()=>{clearTimeout(timer);timer=setTimeout(()=>refresh(true).catch(console.warn),500)});
 window.addEventListener('lv81:sync-ok',()=>refresh(false).catch(console.warn));
 window.addEventListener('lv81:sync-error',()=>refresh(true).catch(console.warn));
 window.addEventListener('DOMContentLoaded',()=>{window.LVBackend?.ready?.then(()=>refresh(false)).catch(console.warn)});
})();
