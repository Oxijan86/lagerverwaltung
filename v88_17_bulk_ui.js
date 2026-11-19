/* V88.17: Sammelpruefung PDF I/1 sowie Archivierung ausschliesslich sicherer OCR-Dubletten.
 * Ein einzelner Click aendert KEINE Bestandsmengen, eine bestaetigte PDF-Zuordnung
 * aendert NUR den PDF-Snapshot; Artikelkorrektur wird separat mit Backup bestaetigt.
 */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else if(root)root.LV8817BulkUI=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 function element(tag,text,cls=''){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;}
 function button(text,click){const b=element('button',text,'secondary');b.type='button';b.addEventListener('click',click);return b;}
 function yes(x){return x!==null&&x!==undefined&&String(x).trim()!=='';}
 function mount(o){
  const Bulk=root.LV8817BulkCore;
  const anchor=o?.root;
  if(!anchor||!Bulk||!o.api||!o.matchCore)return false;
  if(anchor.querySelector('#lv8817BulkPanel'))return true;
  const panel=element('section',undefined,'lv87-card');panel.id='lv8817BulkPanel';panel.style.cssText='margin:12px 0;border:2px solid #94adb8;padding:12px';
  panel.appendChild(element('h3','Sammelzuordnung: OCR-I/1, auch ungezaehlte Artikel'));
  panel.appendChild(element('p','Hier werden nur eindeutig gleiche Bezeichnungen und Nummern angezeigt, die sich ausschließlich am führenden I bzw. 1 unterscheiden. Die Auswahl ist ein Vorschlag und verändert keine Inventurzählung.','lv87-hint'));
  const status=element('p','Vorschläge können jetzt ermittelt werden.','lv87-hint'),table=element('div');table.style.cssText='max-height:350px;overflow:auto;margin:8px 0';
  const checked=new Map();let proposalRows=[];let locked=false;
  const toolbar=element('div',undefined,'lv87-flex');
  const scan=button('I/1-Treffer prüfen',async()=>{if(locked)return;checked.clear();await renderProposals();});
  const selectAll=button('Alle unkritischen markieren',()=>{for(const r of proposalRows)if(r.selectable)checked.set(r.key,true);drawProposals();});
  const unselect=button('Markierungen entfernen',()=>{checked.clear();drawProposals();});
  const exportCsv=button('Prüfliste herunterladen',()=>{
   const rows=[['Seite','Position','Bisherige Nummer','Vorgeschlagene Nummer','Bezeichnung','Menge bisher','Menge Ziel','Status'],...proposalRows.map(p=>[p.page,p.position,p.current,p.target,p.description,p.sourceCount??'',p.targetCount??'',p.status])];
   download('RONDO_OCR_I1_Pruefung.csv',rows);
  });
  const apply=button('Ausgewählte PDF-Zuordnungen gemeinsam speichern',async()=>{
   if(locked)return;const chosen=proposalRows.filter(r=>checked.get(r.key));
   if(!chosen.length)return set(status,'Bitte zuerst passende Vorschläge markieren.');
   if(chosen.some(r=>!r.selectable))return set(status,'Unter den ausgewählten Zeilen ist eine gezählte oder mehrdeutige Position. Bitte einzeln prüfen.');
   const prev=o.lines();const targetNumbers=new Set();const oldNumbers=[];
   let next=prev.map(x=>({...x}));
   try{
    for(const x of chosen){
     if(targetNumbers.has(Bulk.no(x.target)))throw Error('Eine Zielnummer wurde mehrfach gewählt.');targetNumbers.add(Bulk.no(x.target));
     const existing=next.find(y=>Bulk.key(y)===x.key);
     if(!existing||Bulk.no(existing.article_no)!==Bulk.no(x.current))throw Error('PDF-Zuordnung wurde inzwischen geändert: '+x.key);
     o.matchCore.assign(next,x.key,x.article,o.validate);
     oldNumbers.push(`${x.page}/${x.position}: ${x.current} → ${x.target}`);
    }
    if(!root.confirm(`${chosen.length} PDF-Positionen gemeinsam zuordnen?\n\n${oldNumbers.slice(0,12).join('\n')}${oldNumbers.length>12?'\n… und '+(oldNumbers.length-12)+' weitere':''}\n\nNur die gespeicherte PDF-Zuordnung wird geändert. Keine Lagerbestände, Zählungen oder Stammdaten werden verändert.`))return;
    locked=true;set(status,'PDF-Zuordnungen werden dauerhaft gespeichert …');
    await o.saveMappings(next);o.setLines(next);checked.clear();
    set(status,`${chosen.length} PDF-Positionen gespeichert. Zaehlergebnisse bleiben unveraendert; fehlende Zaehlergebnisse bleiben im PDF leer. Dubletten im Artikelstamm bitte unten separat prüfen.`);
    await renderProposals();
   }catch(e){set(status,'Keine Sammelzuordnung gespeichert: '+e.message)}finally{locked=false}
  });
  toolbar.append(scan,selectAll,unselect,exportCsv,apply);panel.append(toolbar,status,table);
  const header=(cols)=>{const tr=element('tr');for(const h of cols)tr.appendChild(element('th',h));return tr};
  function drawProposals(){table.replaceChildren();const t=element('table',undefined,'lv87-table');const thead=element('thead');thead.appendChild(header(['✓','Seite / Pos.','PDF-Nummer','Vorschlag','Bezeichnung','Zählwerte','Status']));t.appendChild(thead);const tb=element('tbody');
   for(const r of proposalRows){const tr=element('tr');const td=element('td'),cb=element('input');cb.type='checkbox';cb.checked=!!checked.get(r.key);cb.disabled=!r.selectable||locked;
    cb.addEventListener('change',()=>{if(cb.checked)checked.set(r.key,true);else checked.delete(r.key)});td.append(cb);tr.append(td);
    for(const v of [`${r.page}/${r.position}`,r.current,r.target,r.description,`${r.sourceCount??'–'} → ${r.targetCount??'–'}`,r.status])tr.appendChild(element('td',v));
    if(!r.selectable)tr.style.background='#fff1ea';tb.appendChild(tr);
   }t.appendChild(tb);table.appendChild(t);
  }
  async function renderProposals(){
   if(locked)return;
   const snap=o.snapshot();if(!snap?.items?.length){set(status,'Bitte zuerst eine Inventur im PDF-Ausgabedialog auswählen.');return;}
   proposalRows=Bulk.proposals(o.lines(),snap.items,{referenceRows:o.referenceRows});
   set(status,`${proposalRows.length} I/1-Zuordnungsvorschläge; ${proposalRows.filter(x=>x.selectable).length} davon ohne widersprüchliche vorhandene Zählung. Die übrigen bitte einzeln prüfen, insbesondere falls die Menge schon unter der 1-Nummer liegt.`);
   drawProposals();
  }
  const dupePanel=element('section',undefined,'lv87-card');dupePanel.id='lv8817DuplicatesPanel';dupePanel.style.cssText='margin:12px 0;border:2px solid #d9ae81;padding:12px';
  dupePanel.appendChild(element('h3','Artikelstamm: falsche I/1-Dubletten prüfen und sicher archivieren'));
  dupePanel.appendChild(element('p','Zeigt alle vorhandenen Artikelpaare mit gleicher Nummer nach dem ersten Zeichen (I/1). Ungleiche Bezeichnungen werden ausdrücklich markiert. Es erfolgt NIE eine automatische Löschung, Zusammenführung von Beständen oder Übertragung von Inventurzählungen.','lv87-hint'));
  const dupStatus=element('p','Noch keine Dublettenprüfung durchgeführt.','lv87-hint'),dupTable=element('div');dupTable.style.cssText='max-height:350px;overflow:auto;margin:8px 0';
  const dupToolbar=element('div',undefined,'lv87-flex');let dupPairs=[],dupeChecked=new Map(),safe=new Map();let scanning=false;
  const dupScan=button('I/1-Dubletten in Stammdaten suchen',async()=>{
   if(scanning)return;scanning=true;dupScan.disabled=true;set(dupStatus,'Artikel und Inventurstände werden verglichen …');dupeChecked.clear();safe.clear();
   try{const arts=await o.api('/api/articles');dupPairs=Bulk.pairs(arts,o.snapshot()?.items||[]);drawPairs();set(dupStatus,`${dupPairs.length} I/1-Artikelpaare gefunden. Die Freigabe zur Archivierung erfordert eine zusätzliche Datenbank-Sicherheitsprüfung.`);}catch(e){set(dupStatus,e.message)}finally{scanning=false;dupScan.disabled=false}
  });
  const dupPreview=button('Sicherheitsprüfung für alle Paare',async()=>{
   if(scanning||!dupPairs.length)return;scanning=true;dupPreview.disabled=true;safe.clear();dupeChecked.clear();let permitted=0;
   try{for(let k=0;k<dupPairs.length;k++){
    const pair=dupPairs[k];set(dupStatus,`Sicherheitsprüfung ${k+1}/${dupPairs.length} …`);
    if(!pair.nameSame){safe.set(pair.number1,{safe:false,message:'Abweichende Bezeichnung. Erst manuell vergleichen.'});continue;}
    const result=await o.api('/api/articles/ocr-repair/preview',{method:'POST',body:JSON.stringify({source_no:pair.number1,target_no:pair.numberI,target_description:pair.descI})});
    safe.set(pair.number1,result);if(result.safe&&result.mode==='archive')permitted++;
   }drawPairs();set(dupStatus,`${permitted} von ${dupPairs.length} Paaren technisch archivierbar. Alle anderen bleiben unverändert. Bitte zuerst anhand der Original-PDF prüfen, welche Artikelnummer korrekt ist.`);
   }catch(e){set(dupStatus,'Prüfung nicht vollständig: '+e.message+' – nichts wurde archiviert.');safe.clear();drawPairs()}finally{scanning=false;dupPreview.disabled=false}
  });
  const dupSelectAll=button('Alle sicher geprüften markieren',()=>{for(const p of dupPairs){const r=safe.get(p.number1);if(p.nameSame&&r?.safe&&r.mode==='archive')dupeChecked.set(p.number1,true)}drawPairs()});
  const dupReport=button('Dublettenkontrolle als CSV',()=>download('RONDO_I1_Dubletten_Stammdaten.csv',[
   ['I-Artikel','Bezeichnung I','Bestand I','Gezählt I','1-Artikel','Bezeichnung 1','Bestand 1','Gezählt 1','Name gleich','Sicherheitsbewertung'],
   ...dupPairs.map(p=>[p.numberI,p.descI,p.stockI,p.countI??'',p.number1,p.desc1,p.stock1,p.count1??'',p.nameSame?'Ja':'Nein',safe.get(p.number1)?.message||'noch nicht geprüft'])]));
  const archive=button('Markierte sichere OCR-Fehlartikel archivieren',async()=>{
   if(scanning)return;
   const selected=dupPairs.filter(p=>dupeChecked.get(p.number1));
   if(!selected.length)return set(dupStatus,'Keine geprüften Artikel markiert.');
   if(selected.some(p=>!safe.get(p.number1)?.safe||safe.get(p.number1).mode!=='archive'))return set(dupStatus,'Eine Auswahl ist nicht freigegeben. Bitte Sicherheitsprüfung erneuern.');
   if(!root.confirm(`ACHTUNG: ${selected.length} Artikel mit führender 1 als mögliche OCR-Fehlimporte archivieren?\n\nNur durchführen, wenn die führende I-Nummer anhand der ORIGINAL-RONDO-PDF für alle ausgewählten Artikel bestätigt wurde. Es wird VOR JEDEM Artikel automatisch ein Sicherheitsbackup erstellt; reine offene ungezaehlte Doppelpositionen werden entfernt. Es werden KEINE Lagerbestände zusammengeführt.\n\nFortfahren?`))return;
   // Zweite bewusste Bestaetigung wie in der Einzelkorrektur.
   if(!root.confirm('Zweite Bestätigung: Sind die ausgewählten 1-Artikel tatsächlich Fehlimporte und alle I-Nummern korrekt? Wenn unsicher: Abbrechen und die CSV zuerst prüfen.'))return;
   scanning=true;archive.disabled=true;let done=0;try{
    if(o.inventory?.current?.()?.session?.id===o.select.value){if(!await o.inventory.save())throw Error('Offene Inventur konnte nicht gespeichert werden. Archivierung zum Schutz der Zählungen abgebrochen.');}
    for(const p of selected){
     set(dupStatus,`${done}/${selected.length} sicher archiviert. Prüfe ${p.number1} …`);
     const latest=await o.api('/api/articles/ocr-repair/preview',{method:'POST',body:JSON.stringify({source_no:p.number1,target_no:p.numberI,target_description:p.descI})});
     if(!latest.safe||latest.mode!=='archive'||latest.source.id!==p.id1||latest.target?.id!==p.idI)throw Error(`${p.number1}: Zustand hat sich geändert: ${latest.message}`);
     await o.api('/api/articles/ocr-repair/commit',{method:'POST',body:JSON.stringify({source_no:p.number1,target_no:p.numberI,target_description:p.descI,confirm:true,expected_mode:'archive',expected_source_id:p.id1,expected_target_id:p.idI})});
     done++;dupeChecked.delete(p.number1);
    }
    set(dupStatus,`${done} Fehlartikel archiviert. Vor jedem Artikel wurde ein Backup erstellt. Bestehende Zählmengen und Buchbestände nicht zusammengeführt. Bitte Inventur und Synchronisierung prüfen.`);
   }catch(e){set(dupStatus,`${done} von ${selected.length} Archivierungen ausgeführt. Danach angehalten: ${e.message}. Kein automatischer weiterer Versuch.`)}
   finally{
    try{const id=o.select.value,snap=await o.api('/api/inventory-v75/get?id='+encodeURIComponent(id));if(o.inventory?.current?.()?.session?.id===id)o.inventory.updateFromExternal?.(snap);await o.reloadSnapshot();}catch(e){set(dupStatus,dupStatus.textContent+' Inventur neu laden: '+e.message)}
    scanning=false;archive.disabled=false;safe.clear();dupeChecked.clear();dupPairs=[];drawPairs();
   }
  });
  dupToolbar.append(dupScan,dupPreview,dupSelectAll,dupReport,archive);
  dupePanel.append(dupToolbar,dupStatus,dupTable);
  function drawPairs(){dupTable.replaceChildren();const t=element('table',undefined,'lv87-table'),thead=element('thead');thead.appendChild(header(['✓','I-Artikel (Bestand / gezählt)','1-Artikel (Bestand / gezählt)','Bezeichnungsabgleich','Archivierung']));t.appendChild(thead);const tb=element('tbody');
   for(const p of dupPairs){const tr=element('tr'),td=element('td'),cb=element('input');cb.type='checkbox';const res=safe.get(p.number1),allowed=p.nameSame&&res?.safe&&res.mode==='archive';cb.disabled=!allowed||scanning;cb.checked=!!dupeChecked.get(p.number1);cb.addEventListener('change',()=>{if(cb.checked)dupeChecked.set(p.number1,true);else dupeChecked.delete(p.number1)});td.append(cb);tr.append(td);
    for(const v of [`${p.numberI} – ${p.descI} (${p.stockI} / ${p.countI??'–'})`,`${p.number1} – ${p.desc1} (${p.stock1} / ${p.count1??'–'})`,p.nameSame?'gleich':'abweichend – einzeln prüfen',res?.safe?'Technisch sicher archivierbar':res?.message||'noch nicht geprüft'])tr.appendChild(element('td',v));if(!allowed)tr.style.background='#fff8f1';tb.appendChild(tr);
   }t.appendChild(tb);dupTable.appendChild(t);
  }
  function set(el,text){el.textContent=text}
  function download(filename,rows){const csv='\ufeff'+rows.map(a=>a.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=element('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000)}
  anchor.append(panel,dupePanel);
  return {refresh:renderProposals,reset:()=>{checked.clear();dupeChecked.clear();safe.clear()}};
 }
 return {mount};
});
