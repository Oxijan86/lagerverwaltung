(function(){
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 let dbid='',data=null,index=null,pending=new Map(),timer=null,saving=null,page=0,busy=false,errorState=false;
 const pageSize=30;
 function message(text,ok=true){window.msg($('inv75Msg'),text,ok)}
 function key(){return data?`lv75-inventory:${data.database_id}:${data.session.id}`:''}
 const V84=window.LVInventoryV84Core, V85=window.LVInventoryV85Core;
 if(!V85)throw Error('inventory_v85_core.js wurde nicht geladen.');
 const manualPlaceOverrides=new Set();
 function contextKey(){return data?`lv84-counting-place:${data.database_id}:${data.session.id}`:''}
 function manualCloud(){try{return localStorage.getItem('lv84_inventory_cloud_manual')!=='0'}catch{return true}}
 function context(){return {warehouse_id:Number($('inv84Warehouse')?.value)||null,location:String($('inv84Location')?.value||'').trim(),apply:!!$('inv84Apply')?.checked}}
 function saveContext(){if(!data)return;try{localStorage.setItem(contextKey(),JSON.stringify(context()))}catch{}}
 function loadContext(){
  const w=$('inv84Warehouse'),l=$('inv84Location'),apply=$('inv84Apply');if(!w||!l||!apply||!data)return;
  let saved={};try{saved=JSON.parse(localStorage.getItem(contextKey())||'{}')||{}}catch{}
  w.value=[...w.options].some(o=>o.value===String(saved.warehouse_id||''))?String(saved.warehouse_id||''):'';
  l.value=saved.location||'';apply.checked=saved.apply!==false;contextMessage();
  const manual=$('inv84ManualCloud');if(manual)manual.checked=manualCloud();
 }
 function contextMessage(){
  const out=$('inv84ContextInfo');if(!out||!data)return;
  const c=context(),known=c.location&&data.locations.find(l=>l.name.toLocaleLowerCase('de-DE')===c.location.toLocaleLowerCase('de-DE'));
  out.textContent=c.location&&!known?`„${c.location}“ ist noch kein gespeicherter Lagerort. Bitte zuerst „Lagerort anlegen“ wählen.`:
   c.apply?(c.location?`Neue Zählungen werden „${c.location}“ zugeordnet.`:c.warehouse_id?'Neue Zählungen übernehmen das gewählte Lager.':'Bitte einen Zählbereich auswählen.'):'Automatische Lagerortübernahme ausgeschaltet.';
  out.className=c.location&&!known?'small inv75-warning':'small';
  const btn=$('inv84AddLocation');if(btn)btn.hidden=!c.location||!!known;
 }
 function cache(){if(!data)return;try{if(pending.size)localStorage.setItem(key(),JSON.stringify({version:data.session.version,items:[...pending.values()]}));else localStorage.removeItem(key())}catch{message('Lokale Wiederherstellungskopie konnte nicht gespeichert werden. Bitte jetzt zwischenspeichern.',false)}}
 function payload(extra={}){return {id:data.session.id,version:data.session.version,database_id:data.database_id,...extra}}
 async function post(action,body){return window.api('/api/inventory-v75/'+action,{method:'POST',body:JSON.stringify(body)})}
 function adopt(result){const oldId=data?.session?.id;$('inv75ReviewBox').hidden=true;data=result;dbid=result.database_id;if(oldId!==result.session.id)manualPlaceOverrides.clear();referenceOptions();if(oldId!==result.session.id)loadContext();else contextMessage();status();render()}
 function status(){
  if(!data){$('inv75Work').hidden=true;return}
  $('inv75Work').hidden=false;
  const counted=data.items.filter(x=>x.counted_stock!==null&&String(x.counted_stock).trim()!=='').length,done=data.session.status!=='draft';
  $('inv75Title').textContent=data.session.name;
  $('inv75Progress').textContent=`${counted} von ${data.items.length} Artikeln gezählt · ${data.items.length-counted} offen${done?' · '+(data.session.status==='completed'?'Abgeschlossen':'Abgebrochen'):''}`;
  $('inv75Saved').textContent=pending.size?'Ungespeicherte Eingaben · automatische Speicherung folgt':saving?'Wird gespeichert …':data.durable===false?'Noch nicht dauerhaft gespeichert · bitte erneut zwischenspeichern':`Zwischenstand gespeichert: ${new Date(data.session.updated_at).toLocaleString('de-DE')}`;
  $('inv75Saved').className=pending.size?'small inv75-dirty':'small';
  ['inv75Save','inv75Review','inv75Refresh','inv75Cancel'].forEach(id=>$(id).disabled=done||busy);
  $('inv75Review').disabled=done||busy||errorState||data.durable===false;
  document.querySelectorAll('#inv75Rows input,#inv75Rows select').forEach(el=>el.disabled=done||busy);
  ['inv75Session','inv75Name','inv75NewWarehouse','inv75NewLocation','inv75Warehouse'].forEach(id=>$(id).disabled=busy);
  ['inv84Warehouse','inv84Location','inv84Apply','inv84AddLocation'].forEach(id=>{if($(id))$(id).disabled=busy||done});
  document.querySelectorAll('#inventory75 button[onclick="LVInventory.create()"],#inventory75 button[onclick="LVInventory.select()"],#inv75Finalize').forEach(el=>el.disabled=busy||(el.id==='inv75Finalize'&&(done||!!data.stats.conflicts||!data.stats.counted)));
 }
 function refreshLocationFilterOptions(){
  const el=$('inv85LocationFilter'),w=$('inv75WarehouseFilter');if(!el||!w||(!data&&!index))return;
  const refs=data||index,selected=el.value;
  const places=V85.locationsForWarehouse(refs.locations||[],w.value);
  el.innerHTML='<option value="">Alle Lagerorte</option><option value="'+V85.NONE+'">Ohne Lagerort</option>'+places.map(l=>`<option value="${esc(l.name)}">${esc(l.name)}</option>`).join('');
  el.value=[...el.options].some(o=>o.value===selected)?selected:'';
 }
 function referenceOptions(){
  if(!data&&!index)return;const refs=data||index;
  for(const id of ['inv75Warehouse','inv75WarehouseFilter','inv84Warehouse']){
   const el=$(id),old=el.value;el.innerHTML=`<option value="">${id==='inv75Warehouse'?'Ohne übergeordnetes Lager':id==='inv84Warehouse'?'Lager auswählen':'Alle Lager'}</option>`+refs.warehouses.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('');el.value=el.dataset.ready?old:(id==='inv75Warehouse'?refs.default_warehouse_id||'':'');el.dataset.ready='1';
  }
  const datalist=$('inv84LocationOptions');if(datalist)datalist.innerHTML=V85.locationsForWarehouse(refs.locations||[],$('inv84Warehouse')?.value).map(l=>`<option value="${esc(l.name)}"></option>`).join('');
  refreshLocationFilterOptions();
 }
 function matching(){
  if(!data)return [];
  const filters={query:$('inv75Search').value,status:$('inv75Filter').value,warehouse:$('inv75WarehouseFilter').value,location:$('inv85LocationFilter')?.value||''};
  return data.items.filter(x=>V85.matches({...x,warehouse_name:data.warehouses.find(w=>Number(w.id)===Number(x.warehouse_id))?.name||''},filters));
 }
 function render(){
  if(!data)return;
  const items=matching(),pages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.min(page,pages-1);
  $('inv75PageLabel').textContent=`${items.length} Treffer · Seite ${page+1} von ${pages}`;
  const info=$('inv85FilterInfo');if(info){
   const place=$('inv85LocationFilter'),w=$('inv75WarehouseFilter'),wname=w?.selectedOptions[0]?.textContent||'Alle Lager';
   const lname=place?.selectedOptions[0]?.textContent||'Alle Lagerorte',exact=V85.norm($('inv75Search').value);
   const outside=!!exact&&items.some(x=>(V85.norm(x.article_no)===exact||V85.norm(x.barcode)===exact)&&
     (!!w?.value&&String(x.warehouse_id||'')!==w.value||!!place?.value&&(place.value===V85.NONE?!!x.location:V85.norm(x.location)!==V85.norm(place.value))));
   info.textContent=`${wname} · ${lname}: ${items.length} Treffer${outside?' · Artikelnummer auch außerhalb des Lagerorts gefunden':''}.`;
  }
  $('inv75Prev').disabled=page===0;$('inv75Next').disabled=page>=pages-1;
  const done=data.session.status!=='draft',disabled=done||busy?'disabled':'';
  $('inv75Rows').innerHTML=items.slice(page*pageSize,(page+1)*pageSize).map(x=>{
   const suggestion=manualPlaceOverrides.has(x.article_id)?null:V85.suggestedPlace(x,context(),data.locations);
   const shownLocation=suggestion?suggestion.location:x.location;
   const shownWarehouse=suggestion?suggestion.warehouse_id:x.warehouse_id;
   const choices=new Map(data.locations.filter(l=>!x.warehouse_id||!l.warehouse_id||Number(l.warehouse_id)===Number(x.warehouse_id)).map(l=>[l.name,l.name]));if(x.location)choices.set(x.location,x.location);if(shownLocation)choices.set(shownLocation,shownLocation);
   const options='<option value="">Ohne Lagerort</option>'+[...choices.keys()].map(name=>`<option value="${esc(name)}" ${name===x.location?'selected':''}>${esc(name)}</option>`).join('');
   return `<article class="inv75-row ${x.counted_stock!==null?'inv75-counted':''} ${x.stale?'inv75-conflict':''}">
    <div><b>${esc(x.article_no)}</b><div>${esc(x.description)}</div><span class="small">${esc(x.unit)} · Bestand bei Beginn: ${esc(x.base_stock)}</span>${x.stale?`<div class="inv75-warning">Bestandsstand geändert${x.missing?' / Artikel nicht mehr aktiv':''}. Bitte erneut prüfen.</div>${!x.missing?`<button class="secondary" onclick="LVInventory.rebase(${x.article_id})">Bestandsstand aktualisieren und neu zählen</button>`:''}`:''}</div>
    <div><label>Gezählt (${esc(x.unit)})<input id="inv75-count-${x.article_id}" type="text" inputmode="decimal" autocomplete="off" value="${esc(x.counted_stock??'')}" ${disabled} oninput="LVInventory.edit(${x.article_id},'counted_stock',this.value)"><span class="small">Leer = noch nicht gezählt · 0 = leerer Bestand</span></label><div class="inv84-add-row"><input id="inv84-add-${x.article_id}" aria-label="Weitere gefundene Menge für ${esc(x.article_no)}" placeholder="Weitere Menge" inputmode="decimal" autocomplete="off" ${disabled} onkeydown="if(event.key==='Enter'){event.preventDefault();LVInventory.addCount(${x.article_id})}"><button type="button" class="secondary" ${disabled} onclick="LVInventory.addCount(${x.article_id})">+ Hinzufügen</button></div><div id="inv84-result-${x.article_id}" class="small" aria-live="polite"></div></div>
    <label>Lager<select id="inv75-warehouse-${x.article_id}" ${disabled} onchange="LVInventory.warehouseChanged(${x.article_id},this.value)">${LVWarehouses.warehouses(shownWarehouse)}</select>${suggestion?'<span class="small">Zählbereich vorgewählt · erst nach Zählung gespeichert</span>':''}</label>
    <label>Lagerort (optional)<input id="inv75-location-${x.article_id}" list="inv75-location-options-${x.article_id}" value="${esc(shownLocation||'')}" ${disabled} placeholder="Lagerort wählen oder neuen eingeben" onchange="LVInventory.locationChangedInline(${x.article_id},this.value)"><datalist id="inv75-location-options-${x.article_id}">${[...choices.keys()].map(name=>`<option value="${esc(name)}"></option>`).join('')}</datalist><span class="small">${suggestion?'Vorgewählt, noch nicht gespeichert. ':' '}Neuen Lagerort auch direkt eintippen.</span></label>
    <label>Notiz<input id="inv75-note-${x.article_id}" value="${esc(x.note)}" maxlength="2000" ${disabled} oninput="LVInventory.edit(${x.article_id},'note',this.value)"></label>
   </article>`;
  }).join('')||'<p>Keine passenden Artikel gefunden.</p>';
 }
 async function flush(){
  clearTimeout(timer);if(saving){const ok=await saving;if(!ok)return false;if(pending.size)return flush();return true}
  if(!data||data.session.status!=='draft')return true;
  if(!pending.size&&data.durable!==false)return true;
  const sent=[...pending.values()].map(x=>({...x})),captured=new Map(sent.map(x=>[x.article_id,JSON.stringify(x)]));
  saving=(async()=>{
   try{
    const result=await post('save',payload({items:sent}));
    for(const [id,value] of captured)if(JSON.stringify(pending.get(id))===value)pending.delete(id);
    data=result;
    for(const p of pending.values()){const x=data.items.find(x=>x.article_id===p.article_id);if(x)Object.assign(x,p)}
    cache();errorState=false;message('Zwischenstand gespeichert. Bestände wurden noch nicht verändert.');
    return true;
   }catch(e){cache();errorState=true;message(e.message+' Eingaben sind noch nicht in der Lagerdatei gespeichert; die lokale Wiederherstellungskopie bleibt erhalten.',false);return false}
   finally{saving=null;status()}
  })();return saving;
 }
 async function load(id,discard=false){
  if(!id)return;if(!discard&&!await flush())return;
  const result=await window.api('/api/inventory-v75/get?id='+encodeURIComponent(id));
  data=result;dbid=result.database_id;pending.clear();manualPlaceOverrides.clear();errorState=false;
  try{
   const stored=JSON.parse(localStorage.getItem(key())||'null');
   if(stored?.items?.length){
    if(stored.version===data.session.version&&data.session.status==='draft'){
     for(const p of stored.items){const x=data.items.find(x=>x.article_id===p.article_id);if(x){pending.set(p.article_id,p);Object.assign(x,p)}}
     message('Lokale ungespeicherte Eingaben wiederhergestellt. Bitte zwischenspeichern.');
    }else if(stored.items.every(p=>{const x=data.items.find(x=>x.article_id===p.article_id);return x&&Object.keys(p).every(k=>String(x[k]??'')===String(p[k]??''))}))localStorage.removeItem(key());
    else{errorState=true;message('Es gibt lokale Eingaben zu einem älteren Zwischenstand. Sie bleiben als Wiederherstellungskopie im Browser erhalten. Bitte vor dem Neu-Laden über „Lokale Eingaben herunterladen“ sichern.',false)}
   }
  }catch{message('Lokale Wiederherstellungskopie konnte nicht geladen werden.',false)}
  try{localStorage.setItem('lv75-last-inventory:'+dbid,id)}catch{}
  page=0;adopt(data);loadContext();$('inv75Session').value=id;
 }
 async function list(){index=await window.api('/api/inventory-v75/index');dbid=index.database_id;referenceOptions();const old=$('inv75Session').value;$('inv75Session').innerHTML='<option value="">Inventur auswählen</option>'+index.sessions.map(s=>`<option value="${esc(s.id)}">${esc(s.name)} · ${s.counted}/${s.total} · ${s.status==='draft'?'In Arbeit':s.status==='completed'?'Abgeschlossen':'Abgebrochen'}</option>`).join('');$('inv75Session').value=old;return index}
 async function guarded(fn){if(busy)return;busy=true;status();try{return await fn()}catch(e){message(e.message,false)}finally{busy=false;status()}}
 window.LVInventory={
  updateReferences(refs){if(data){data.warehouses=refs.warehouses||[];data.locations=refs.locations||[];data.default_warehouse_id=refs.default_warehouse_id;referenceOptions();render()}if(index){index.warehouses=refs.warehouses||[];index.locations=refs.locations||[];index.default_warehouse_id=refs.default_warehouse_id}},
  async open(){return guarded(async()=>{
   if(data&&pending.size){render();return}
   const idx=await list();let id='';try{id=localStorage.getItem('lv75-last-inventory:'+dbid)||''}catch{}
   if(!idx.sessions.some(s=>s.id===id&&s.status==='draft'))id=idx.sessions.find(s=>s.status==='draft')?.id||'';
   if(id)await load(id);else if(data&&idx.sessions.some(s=>s.id===data.session.id))await load(data.session.id);else{data=null;status()}
   if(!$('inv75Name').value)$('inv75Name').value='Inventur '+new Date().toLocaleDateString('de-DE');
  })},
  async create(){return guarded(async()=>{
   if(!await flush())return;
   const title=$('inv75Name').value.trim();if(!title)return message('Bitte einen Inventurnamen eingeben.',false);
   const result=await post('create',{id:crypto.randomUUID(),name:title,database_id:dbid});pending.clear();page=0;errorState=false;$('inv75Search').value='';$('inv75Filter').value='all';$('inv75WarehouseFilter').value='';if($('inv85LocationFilter'))$('inv85LocationFilter').value='';adopt(result);loadContext();await list();$('inv75Session').value=result.session.id;try{localStorage.setItem('lv75-last-inventory:'+dbid,result.session.id)}catch{}
   message('Inventur gestartet. Leere Felder sind ungezählt und werden nicht als Nullbestand behandelt.');
  })},
  select(){return guarded(async()=>{await load($('inv75Session').value);if(data)$('inv75Session').value=data.session.id})},
  cloudPaused(){return manualCloud()&&!!data&&data.session.status==='draft'},
  cloudPreferenceChanged(checked){try{localStorage.setItem('lv84_inventory_cloud_manual',checked?'1':'0')}catch{};window.LVSyncUI81?.refresh?.(false).catch?.(console.warn)},
  async syncCloud(){if(!await flush())return;await window.LVSyncUI81.sync()},
  searchFocus(input){if(!input)return;input.select();},
  clearSearch(){const el=$('inv75Search');el.value='';this.filter();el.focus()},
  contextWarehouseChanged(value){
   if(!data)return;
   const c=context(),location=c.location&&data.locations.find(l=>l.name.toLocaleLowerCase('de-DE')===c.location.toLocaleLowerCase('de-DE'));
   if(location?.warehouse_id&&Number(location.warehouse_id)!==Number(value))$('inv84Location').value='';
   saveContext();contextMessage();referenceOptions();
  },
  contextLocationChanged(value){
   if(!data)return;const location=data.locations.find(l=>l.name.toLocaleLowerCase('de-DE')===String(value||'').trim().toLocaleLowerCase('de-DE'));
   if(location){$('inv84Location').value=location.name;if(location.warehouse_id)$('inv84Warehouse').value=String(location.warehouse_id)}
   saveContext();contextMessage();
  },
  contextToggle(){saveContext();contextMessage()},
  async addContextLocation(){return guarded(async()=>{
   if(!data||!await flush())return;
   const c=context(),name=c.location;if(!name)return message('Bitte zuerst einen Lagerort eingeben.',false);
   if(!c.warehouse_id&&!data.default_warehouse_id)return message('Bitte zuerst das zugehörige Lager (z. B. Fahrzeug) auswählen.',false);
   const known=data.locations.find(l=>l.name.toLocaleLowerCase('de-DE')===name.toLocaleLowerCase('de-DE'));
   if(known){this.contextLocationChanged(known.name);$('inv84Apply').checked=true;saveContext();contextMessage();message(`Lagerort „${known.name}“ ist vorgewählt.`);return}
   if(!confirm(`Lagerort „${name}“ neu anlegen und für die nächsten Zählungen verwenden?`))return;
   const result=await post('location',{name,warehouse_id:c.warehouse_id||data.default_warehouse_id||null,database_id:dbid});
   data.locations=result.locations||data.locations;data.warehouses=result.warehouses||data.warehouses;
   LVWarehouses.setRefs(result);referenceOptions();if(result.created?.warehouse_id)$('inv84Warehouse').value=String(result.created.warehouse_id);
   $('inv84Location').value=result.created.name;$('inv84Apply').checked=true;saveContext();contextMessage();refreshLocationFilterOptions();render();message(`Lagerort „${result.created.name}“ angelegt und vorgewählt. Auch Artikel ohne bisherigen Lagerort übernehmen ihn beim Zählen.`);
  })},
  addCount(id){
   if(!data||data.session.status!=='draft'||busy)return;
   const row=data.items.find(x=>Number(x.article_id)===Number(id)),el=$('inv84-add-'+id),result=$('inv84-result-'+id);if(!row||!el)return;
   let amount;
   try{amount=V84.addCount(row.counted_stock,el.value,row.unit)}catch(e){message(e.message,false);el.focus();return}
   const countInput=$('inv75-count-'+id);
   if(!amount.wasCounted&&!manualPlaceOverrides.has(Number(id))){try{V84.countContext(row,context(),data.locations)}catch(e){message(e.message,false);return}}
   this.edit(id,'counted_stock',String(amount.total));
   if(String(row.counted_stock)!==String(amount.total))return;
   const chosen=context();if(amount.wasCounted&&chosen.apply&&chosen.location&&chosen.location!==row.location){
    if(result)result.textContent='Achtung: Dieser Artikel wurde bereits an einem anderen Lagerort gezählt. Der bisherige Lagerort bleibt erhalten.';
   }
   if(countInput)countInput.value=String(amount.total).replace('.',',');
   el.value='';if(result)result.textContent=`${amount.old.toLocaleString('de-DE')} + ${amount.delta.toLocaleString('de-DE')} = ${amount.total.toLocaleString('de-DE')} ${row.unit||''}${amount.wasCounted&&chosen.apply&&chosen.location&&chosen.location!==row.location?' · Bisheriger Lagerort beibehalten':''}`;
   message(`${row.article_no}: ${amount.delta.toLocaleString('de-DE')} zusätzlich gezählt; neuer Gesamtzählstand ${amount.total.toLocaleString('de-DE')}. Noch keine Lagerbuchung.`);
   el.focus();
  },
  edit(id,field,value){
   if(!data||data.session.status!=='draft')return;
   $('inv75ReviewBox').hidden=true;
   const row=data.items.find(x=>x.article_id===id);if(!row)return;
   const firstCount=field==='counted_stock'&&(row.counted_stock===null||String(row.counted_stock).trim()==='')&&String(value).trim()!=='';
   const needsContext=(firstCount||field==='counted_stock'&&!row.location&&String(value).trim()!=='')&&!manualPlaceOverrides.has(Number(id));
   let place=null;
   if(needsContext){try{place=V84.countContext(row,context(),data.locations)}catch(e){message(e.message,false);const el=$('inv75-count-'+id);if(el)el.value=row.counted_stock??'';return}}
   row[field]=value===''&&field==='counted_stock'?null:value;
   pending.set(id,{...(pending.get(id)||{article_id:id}),[field]:row[field]});
   if(place){row.warehouse_id=place.warehouse_id;row.location=place.location;Object.assign(pending.get(id),place);const w=$('inv75-warehouse-'+id),l=$('inv75-location-'+id);if(w)w.value=place.warehouse_id??'';if(l)l.value=place.location;}
   if(field==='location'){const loc=data.locations.find(l=>l.name===value);if(loc?.warehouse_id){row.warehouse_id=loc.warehouse_id;pending.get(id).warehouse_id=loc.warehouse_id;const w=$('inv75-warehouse-'+id);if(w)w.value=loc.warehouse_id}}cache();status();clearTimeout(timer);timer=setTimeout(()=>flush(),750);
  },
  async locationChangedInline(id,value){
   if(!data||busy)return;
   const row=data.items.find(x=>Number(x.article_id)===Number(id));if(!row)return;
   const name=String(value||'').trim();if(!name){this.edit(id,'location','');return}
   const known=data.locations.find(l=>l.name.toLocaleLowerCase('de-DE')===name.toLocaleLowerCase('de-DE'));
   if(known){manualPlaceOverrides.add(Number(id));this.edit(id,'location',known.name);return}
   if(!confirm(`Neuen Lagerort „${name}“ direkt anlegen und bei diesem Artikel auswählen?`)){
    const el=$('inv75-location-'+id);if(el)el.value=row.location||'';return;
   }
   try{
    // Save current drafts first. Warehouse creation changes the shared masterdata.
    if(!await flush())throw Error('Bitte zuerst die Inventur-Zwischenspeicherung abschließen.');
    const result=await post('location',{name,warehouse_id:row.warehouse_id||data.default_warehouse_id||null,database_id:dbid});
    data.locations=result.locations||data.locations;data.warehouses=result.warehouses||data.warehouses;
    LVWarehouses.setRefs(result);
    manualPlaceOverrides.add(Number(id));this.edit(id,'location',result.created.name);
    refreshLocationFilterOptions();message(`Neuer Lagerort „${result.created.name}“ angelegt und beim Artikel ausgewählt.`);
   }catch(e){message(e.message,false);const el=$('inv75-location-'+id);if(el)el.value=row.location||''}
  },
  warehouseChanged(id,value){const row=data.items.find(x=>x.article_id===id);if(!row)return;manualPlaceOverrides.add(Number(id));const loc=data.locations.find(l=>l.name===row.location);this.edit(id,'warehouse_id',Number(value)||null);if(loc?.warehouse_id&&Number(loc.warehouse_id)!==Number(value))this.edit(id,'location','');render()},
  filterWarehouseChanged(){refreshLocationFilterOptions();this.filter()},
  filterFromContext(){
   const c=context();if(!data)return;
   if(c.location&&!data.locations.some(l=>V85.norm(l.name)===V85.norm(c.location)))return message('Bitte den neuen Zähl-Lagerort zuerst speichern. Danach kannst du ihn als Filter wählen.',false);
   $('inv75WarehouseFilter').value=c.warehouse_id?String(c.warehouse_id):'';
   refreshLocationFilterOptions();$('inv85LocationFilter').value=c.location||'';
   $('inv75Search').value='';this.filter();message(`Schnellauswahl: ${c.location||'Alle Lagerorte'}${c.warehouse_id?' im gewählten Lager':''}.`);
  },
  clearPlaceFilter(){if($('inv75WarehouseFilter'))$('inv75WarehouseFilter').value='';refreshLocationFilterOptions();if($('inv85LocationFilter'))$('inv85LocationFilter').value='';this.filter()},
  filter(){page=0;render()},page(delta){page=Math.max(0,page+delta);render()},save:flush,
  async reload(){return guarded(async()=>{
   if(!data)return;
   if((pending.size||errorState)&&!confirm('Gespeicherten Stand neu laden? Ungespeicherte Eingaben dieser Ansicht werden verworfen. Bei Bedarf zuerst „Lokale Eingaben herunterladen“ wählen.'))return;
   clearTimeout(timer);if(saving)await saving;pending.clear();localStorage.removeItem(key());await load(data.session.id,true);message('Gespeicherten Zwischenstand geladen.');
  })},
  async refresh(){return guarded(async()=>{if(!await flush())return;adopt(await post('refresh',payload()));message('Neue aktive Artikel ergänzt; vorhandene Zählungen bleiben erhalten.')})},
  async rebase(id){return guarded(async()=>{
   if(!await flush()||!confirm('Zählung dieses Artikels leeren und auf den aktuellen Bestandsstand wechseln? Bitte danach erneut zählen.'))return;
   adopt(await post('rebase',payload({article_id:id})));message('Bestandsstand aktualisiert. Bitte diesen Artikel erneut zählen.');
  })},
  async addReference(kind){return guarded(async()=>{
   if(!await flush())return;
   const el=$(kind==='warehouse'?'inv75NewWarehouse':'inv75NewLocation');
   const result=await post(kind,{name:el.value,warehouse_id:$('inv75Warehouse').value,database_id:dbid});
   if(data){data.warehouses=result.warehouses;data.locations=result.locations}else{index.warehouses=result.warehouses;index.locations=result.locations}
   LVWarehouses.setRefs(result);if(data)data.default_warehouse_id=result.default_warehouse_id;else index.default_warehouse_id=result.default_warehouse_id;await window.master();referenceOptions();if(kind==='warehouse')$('inv75Warehouse').value=result.created.id;el.value='';render();message(`${kind==='warehouse'?'Lager':'Lagerort'} „${result.created.name}“ ist verfügbar. Den Lagerort beim Artikel auswählen.`);
  })},
  async review(){return guarded(async()=>{
   if(!await flush())return;adopt(await window.api('/api/inventory-v75/preview?id='+encodeURIComponent(data.session.id)));
   const s=data.stats;$('inv75ReviewBox').hidden=false;
   $('inv75ReviewSummary').textContent=`${s.counted} gezählt · ${s.remaining} ungezählt · ${s.stock_changes} Bestandskorrekturen · ${s.location_changes} Lagerortänderungen · ${s.conflicts} Konflikte`;
   $('inv75PartialLabel').hidden=!s.remaining;$('inv75Partial').checked=false;
   $('inv75Finalize').disabled=!!s.conflicts||!s.counted;
   $('inv75ReviewRows').innerHTML=data.items.filter(x=>x.counted_stock!==null).map(x=>`<tr><td>${esc(x.article_no)}</td><td>${esc(x.base_stock)}</td><td>${esc(x.counted_stock)}</td><td>${esc(x.difference)}</td><td>${esc(data.warehouses.find(w=>w.id===Number(x.warehouse_id))?.name||'—')} / ${esc(x.location||'ohne Lagerort')}</td><td>${x.conflict?'Bitte neu zählen':''}</td></tr>`).join('');
  })},
  async finalize(){return guarded(async()=>{
   if(!await flush())return;
   if(data.stats.remaining&&!$('inv75Partial').checked)return message('Bitte alle Artikel zählen oder den Teilabschluss ausdrücklich auswählen.',false);
   if(!confirm('Inventur abschließen? Die gezählten Bestände und Lagerorte werden jetzt übernommen; ungezählte Artikel bleiben unverändert.'))return;
   if(!await window.ensureAdminPassword())return;
   const result=await post('commit',payload({allow_partial:$('inv75Partial').checked,movement_date:$('inv75Date').value}));
   pending.clear();cache();adopt(result);await list();message(result.already_completed?'Diese Inventur ist bereits abgeschlossen.':`Inventur abgeschlossen: ${result.booked} Bestandskorrekturen und ${result.location_updates} Lagerortänderungen.`);
   await Promise.allSettled([window.loadArticles(),window.dash()]);
  })},
  async cancel(){return guarded(async()=>{if(!await flush()||!confirm('Inventur ohne Bestandsänderung abbrechen? Der gespeicherte Zählstand bleibt archiviert.'))return;adopt(await post('cancel',payload()));await list();message('Inventur abgebrochen; der Zwischenstand bleibt archiviert.')})},
  async export(){if(!data)return;if(!await flush())return;await window.downloadCsv('/api/inventory-v75/export?id='+encodeURIComponent(data.session.id),'inv75Msg')},
  recovery(){
   const raw=key()&&localStorage.getItem(key());if(!raw)return message('Es gibt keine lokale ungespeicherte Wiederherstellungskopie.',true);
   const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Inventur_Eingaben_'+data.session.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  },
  async beforeLeave(){if(await flush())return true;return confirm('Der Zwischenstand konnte noch nicht in die Lagerdatei gespeichert werden. Eine lokale Wiederherstellungskopie bleibt im Browser. Ansicht trotzdem wechseln?')},
  pending:()=>pending.size>0||!!saving
 };
 window.addEventListener('beforeunload',e=>{if(pending.size||saving){cache();e.preventDefault();e.returnValue=''}});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&pending.size)flush()});
})();
