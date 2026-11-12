/* Lagerverwaltung V82: sichtbares Konfliktarchiv, selektive Nachuebernahme, Warnung beim Fenster-X. */
(function(){'use strict';
 const by=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=t=>t?new Date(t).toLocaleString('de-DE'):'–';
 const fieldLabel={article_no:'Artikelnummer',movement_type:'Buchungsart',quantity:'Menge',movement_date:'Leistungsdatum',customer:'Kunde',ticket:'Ticket / Unterticket',machine:'Maschine',machine_code:'Technische Typkennung',delivery_note:'Lieferschein',technician:'Techniker',vehicle:'Fahrzeug',note:'Bemerkung',source:'Quelle',description:'Bezeichnung',minimum_stock:'Mindestbestand',target_stock:'Sollbestand',location:'Lagerort',unit:'Einheit'};
 const textValue=(x,max=300)=>{if(x==null)return '—';let s=typeof x==='object'?JSON.stringify(x):String(x);return s.length>max?s.slice(0,max)+' …':s};
 let active=null,loaded=null,selection=new Map(),editorDrafts=new Map(),lastDirty=false,loading=false;
 async function status(){try{const s=await window.LVSyncNoticeState.get();lastDirty=!!s.dirty;return s}catch{return null}}
 // The browser controls this native prompt. App code cannot run a cloud sync from here.
 window.addEventListener('beforeunload',e=>{if(lastDirty&&!window.__lv82ControlledExit){e.preventDefault();e.returnValue='';}});
 window.addEventListener('lv81:local-saved',()=>{lastDirty=true});
 window.addEventListener('lv81:sync-ok',()=>status());
 window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')status()});
 function help(){const e=by('lv82ArchiveHint');if(e)e.textContent='Beide Original-Datenbanken bleiben im lokalen Konfliktarchiv erhalten. Vor jeder Nachübernahme entsteht eine weitere Sicherheitskopie. Ein OneDrive-Serverupload kann durch einen Browser-Ordner nicht bestätigt werden.'}
 async function list(){
  const box=by('lv82ArchiveList');if(!box)return;
  try{
   const items=await window.LVSyncArchiveState.list();
   box.innerHTML=items.length?items.map(x=>`<div class="lv82-archive-item"><div><b>${esc(x.kind)}</b> <small>${esc(x.status||'offen')}</small><div class="small">${esc(date(x.created))} · ${esc(x.differences)} Unterschiede · ${esc(x.customerCount)} Kunden</div><div class="small">Lokal: ${esc(x.local_revision?.slice(0,10))} · Cloud: ${esc(x.cloud_revision?.slice(0,10))}</div></div><button type="button" class="secondary" data-v82-open="${esc(x.id)}">Vergleichen / übernehmen</button></div>`).join(''):'<p class="small">Noch keine archivierten Konflikte. Bei einem abweichenden Cloud-Stand wird hier vor einer Entscheidung eine Kopie beider Datenstände gesichert.</p>';
   box.querySelectorAll('[data-v82-open]').forEach(btn=>btn.addEventListener('click',()=>open(btn.dataset.v82Open)));
  }catch(err){box.textContent='Konfliktarchiv konnte nicht geladen werden: '+(err.message||err)}
 }
 function rowTitle(x){const operation={restore:'Buchung ergänzen',delete:'Buchung löschen',edit:'Buchung korrigieren',article_field:'Artikelfeld ändern',article_add:'Neuen Artikel',article_delete:'Artikel löschen'}[x.kind]||x.kind;return `${operation} · ${x.article_no||''}`}
 function rowDetails(x){
  const a=x.local,b=x.opposite;
  const prop=(title,lv,cv)=>`<tr><td>${esc(fieldLabel[title]||title)}</td><td>${esc(textValue(lv))}</td><td>${esc(textValue(cv))}</td></tr>`;
  if(x.kind==='article_field')return `<table class="lv82-fields"><thead><tr><th>Feld</th><th>Archivierter Wert</th><th>Vergleichswert</th></tr></thead><tbody>${prop(x.field,a,b)}</tbody></table>`;
  const fields=['movement_date','movement_type','quantity','customer','ticket','machine','machine_code','technician','delivery_note','vehicle','note','source'];
  return `<table class="lv82-fields"><thead><tr><th>Feld</th><th>Zu übernehmen</th><th>Anderer Stand</th></tr></thead><tbody>${fields.filter(f=>x.kind==='edit'?!Object.is(a?.[f],b?.[f]):(a?.[f]||b?.[f])).map(f=>prop(f,a?.[f],b?.[f])).join('')}</tbody></table>`;
 }
 function fieldInput(x){
  if(x.kind!=='edit'&&x.kind!=='restore')return '';
  const draft=editorDrafts.get(x.key)||{};
  const originalValues=x.kind==='restore'?['customer','ticket','machine','machine_code','note']:['customer','ticket','machine','machine_code','note'].filter(f=>x.changedFields.includes(f));
  const editor=(f)=>`<label>${esc(fieldLabel[f]||f)}<input data-v82-value="${esc(f)}" value="${esc(draft.values?.[f]??x.local?.[f]??'')}" placeholder="${esc(fieldLabel[f]||f)}"></label>`;
  let checks='';
  if(x.kind==='edit'){
   const selected=draft.fieldsToTake||x.changedFields;
   checks='<p class="small">Wähle die Felder, die aus dem archivierten Stand übernommen werden sollen. Nicht ausgewählte Felder bleiben unverändert.</p><div class="lv82-field-list">'+x.changedFields.map(f=>`<label class="lv82-field-choice"><input type="checkbox" data-v82-field-take="${esc(f)}" ${selected.includes(f)?'checked':''}><span>${esc(fieldLabel[f]||f)}: ${esc(textValue(x.local?.[f],120))}</span></label>`).join('')+'</div>';
  }
  return `<details class="lv82-extra" ${x.kind==='edit'?'open':''}><summary>Felder auswählen / weitere Angaben ergänzen</summary>${checks}${originalValues.length?`<div class="lv82-field-edit">${originalValues.map(editor).join('')}</div>`:''}</details>`;
 }
 function captureEditors(){
  by('lv82ArchiveRows')?.querySelectorAll('[data-v82-row]').forEach(el=>{
   const key=el.dataset.v82Row,values={},checks=[...el.querySelectorAll('[data-v82-field-take]')];
   el.querySelectorAll('[data-v82-value]').forEach(x=>values[x.dataset.v82Value]=x.value);
   if(checks.length||Object.keys(values).length){
    const draft={values};if(checks.length)draft.fieldsToTake=checks.filter(x=>x.checked).map(x=>x.dataset.v82FieldTake);
    editorDrafts.set(key,draft);
   }
  });
 }

 function renderRows(){
  const box=by('lv82ArchiveRows');if(!box||!loaded)return;
  const show=by('lv82ArchiveFilter')?.value||'all';const find=(by('lv82ArchiveSearch')?.value||'').toLocaleLowerCase('de-DE');
  const filtered=loaded.rows.filter(x=>{
   if(show==='ready'&&x.blocked||show==='blocked'&&!x.blocked||show==='deleted'&&!['delete','article_delete'].includes(x.kind))return false;
   return !find||[x.article_no,x.customer,x.ticket,x.machine,x.kind,x.local?.note,x.opposite?.customer,x.opposite?.ticket].some(v=>String(v||'').toLocaleLowerCase('de-DE').includes(find));
  });
  captureEditors();
  box.innerHTML=filtered.length?filtered.map(row=>{
   const checkbox=!row.blocked?`<input type="checkbox" data-v82-selection="${esc(row.key)}" ${selection.has(row.key)?'checked':''} aria-label="Übernehmen ${esc(row.article_no||row.key)}">`:'<span title="Gesperrt">🔒</span>';
   return `<section class="lv82-recover-row ${row.blocked?'blocked':''}" data-v82-row="${esc(row.key)}"><div class="lv82-recover-heading">${checkbox}<div><b>${esc(rowTitle(row))}</b><div class="small">${esc(row.customer||row.local?.customer||'Kunde nicht angegeben')} · ${esc(row.ticket||'kein Ticket')} · ${esc(row.machine||'keine Maschine')} ${row.blocked?' · <strong>Manuelle Prüfung erforderlich</strong>':''}</div></div></div>${row.blocked?`<p class="small lv82-warning">${esc(row.reason||'Nicht sicher übertragbar.')}</p>`:''}<details ${row.kind==='edit'?'open':''}><summary>Unterschiede und ursprüngliche Angaben</summary><div class="lv82-scroll">${rowDetails(row)}</div></details>${!row.blocked?fieldInput(row):''}</section>`;
  }).join(''):'<p>Für diesen Filter wurden keine Abweichungen gefunden.</p>';
  box.querySelectorAll('[data-v82-selection]').forEach(el=>el.addEventListener('change',()=>{
   if(el.checked)selection.set(el.dataset.v82Selection,true);else selection.delete(el.dataset.v82Selection);
   const n=by('lv82ArchiveSelected');if(n)n.textContent=selection.size+' Änderung(en) ausgewählt';
  }));
  const n=by('lv82ArchiveSelected');if(n)n.textContent=selection.size+' Änderung(en) ausgewählt';
 }
 async function open(id){
  if(loading)return;loading=true;active=id;selection.clear();editorDrafts.clear();
  const dlg=by('lv82ArchiveOverlay');dlg.hidden=false;by('lv82ArchiveRows').innerHTML='<p>Archivier­te Daten werden verglichen …</p>';
  try{
   await details();const title=by('lv82ArchiveTitle');if(title)title.textContent='Konfliktarchiv · '+loaded.entry.kind+' · '+date(loaded.entry.created);
  }catch(err){by('lv82ArchiveRows').textContent=err.message||String(err)}
  finally{loading=false}
 }
 async function details(){
  if(!active)return;
  const source=by('lv82ArchiveSource')?.value||'local';
  loaded=await window.LVSyncArchiveState.details(active,source);
  selection.clear();editorDrafts.clear();
  const problem=by('lv82ArchiveStatus');if(problem){problem.textContent=loaded.blocked?loaded.reason:`${loaded.rows.length} Unterschiede; ${loaded.counts.ready||0} zur manuellen Übernahme geeignet, ${loaded.counts.blocked||0} gesperrt.`;problem.className='message '+(loaded.blocked?'error':'ok');problem.style.display='block'}
  renderRows();
 }
 function close(){by('lv82ArchiveOverlay').hidden=true;active=null;loaded=null;selection.clear();editorDrafts.clear();list()}
 async function apply(){
  if(!active||!loaded||!selection.size)return alert('Bitte zunächst übernehmbare Änderungen auswählen.');
  if(typeof levelDrafts!=='undefined'&&levelDrafts?.size)return alert('Bitte zuerst ungespeicherte Änderungen im Lagerbestand sichern.');
  if(!confirm(`${selection.size} ausgewählte Änderung(en) in den aktuellen lokalen Datenstand übernehmen? Die originale Datenbank wird vorher gesichert. Die Cloud bleibt zunächst unverändert.`))return;
  captureEditors();
  const detailsPayload={};
  for(const [key] of selection){
   const draft=editorDrafts.get(key)||{};
   detailsPayload[key]={fields:draft.values||{},values:draft.values||{}};
   if(Array.isArray(draft.fieldsToTake))detailsPayload[key].fieldsToTake=draft.fieldsToTake;
  }
  const btn=by('lv82ArchiveApply');btn.disabled=true;
  try{
   const data=await window.LVSyncArchiveState.recover(active,loaded.source,[...selection.keys()],detailsPayload);
   alert(`${data.applied} Änderung(en) lokal übernommen. Die Cloud wurde noch nicht überschrieben. Die Synchronisierung wird beim nächsten Öffnen geprüft.`);
   window.__lv82ControlledExit=true;location.reload();
  }catch(err){alert('Keine Änderung übernommen: '+(err.message||err));await details();}
  finally{btn.disabled=false}
 }
 async function chooseCloud(){
  if(!confirm('Cloud-Stand als Arbeitsdatenbank laden? Der bisherige lokale Datenstand wird vorher vollständig im Konfliktarchiv und als Backup gesichert. Nicht übernommene Buchungen kannst du später im Archiv prüfen.'))return;
  try{
   await window.LVSyncArchiveState.archiveCurrent('Cloud ausgewählt','Lokaler Arbeitsstand vor bewusstem Gerätewechsel archiviert');
   await window.LVSync.load(false);
   window.__lv82ControlledExit=true;location.reload();
  }catch(e){alert('Cloud-Stand nicht übernommen: '+(e.message||e))}
 }
 async function keepLocal(){
  try{await window.LVSyncArchiveState.archiveCurrent('Lokal ausgewählt','Cloud-Stand vor lokalem Weiterarbeiten archiviert');
   window.LVSyncUI81.closeReview();alert('Lokale Datenbank bleibt aktiv. Die abweichende Cloud-Datei wurde nicht überschrieben. Später über das Konfliktarchiv vergleichen oder Änderungen übernehmen.');await list();
  }catch(e){alert(e.message||e)}
 }
 async function download(side){if(!active)return;try{await window.LVSyncArchiveState.download(active,side)}catch(e){alert(e.message||e)}}
 function init(){help();status();list();
  // Include persisted pending work when reopening after the window X or a mobile OS termination.
  window.LVBackend?.ready?.then(async()=>{const st=await status();if(st?.dirty&&!sessionStorage.getItem('lv82-prompt-resume-once')){
   sessionStorage.setItem('lv82-prompt-resume-once','1');await window.LVSyncUI81?.refresh(true);
  }}).catch(console.warn);
 }
 window.LVSyncUI82={list,open,details,close,apply,renderRows,chooseCloud,keepLocal,download,status};
 window.addEventListener('lv82:archive-changed',()=>list());
 window.addEventListener('DOMContentLoaded',init);
})();
