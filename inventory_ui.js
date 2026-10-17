(function(){
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 let dbid='',data=null,index=null,pending=new Map(),timer=null,saving=null,page=0,busy=false,errorState=false;
 const pageSize=30;
 function message(text,ok=true){window.msg($('inv75Msg'),text,ok)}
 function key(){return data?`lv75-inventory:${data.database_id}:${data.session.id}`:''}
 function cache(){if(!data)return;try{if(pending.size)localStorage.setItem(key(),JSON.stringify({version:data.session.version,items:[...pending.values()]}));else localStorage.removeItem(key())}catch{message('Lokale Wiederherstellungskopie konnte nicht gespeichert werden. Bitte jetzt zwischenspeichern.',false)}}
 function payload(extra={}){return {id:data.session.id,version:data.session.version,database_id:data.database_id,...extra}}
 async function post(action,body){return window.api('/api/inventory-v75/'+action,{method:'POST',body:JSON.stringify(body)})}
 function adopt(result){$('inv75ReviewBox').hidden=true;data=result;dbid=result.database_id;referenceOptions();status();render()}
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
  document.querySelectorAll('#inventory75 button[onclick="LVInventory.create()"],#inventory75 button[onclick="LVInventory.select()"],#inv75Finalize').forEach(el=>el.disabled=busy||(el.id==='inv75Finalize'&&(done||!!data.stats.conflicts||!data.stats.counted)));
 }
 function referenceOptions(){
  if(!data&&!index)return;const refs=data||index;
  for(const id of ['inv75Warehouse','inv75WarehouseFilter']){
   const el=$(id),old=el.value;el.innerHTML=`<option value="">${id==='inv75Warehouse'?'Ohne übergeordnetes Lager':'Alle Lager'}</option>`+refs.warehouses.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('');el.value=old;
  }
 }
 function matching(){
  if(!data)return [];const q=$('inv75Search').value.trim().toLocaleLowerCase('de-DE'),filter=$('inv75Filter').value,warehouse=$('inv75WarehouseFilter').value;
  return data.items.filter(x=>{
   const counted=x.counted_stock!==null&&String(x.counted_stock).trim()!=='';
   const location=data.locations.find(l=>l.name===x.location);
   const text=`${x.article_no} ${x.description} ${x.barcode} ${x.location}`.toLocaleLowerCase('de-DE');
   return q.split(/\s+/).filter(Boolean).every(word=>text.includes(word))&&(!warehouse||String(location?.warehouse_id)===warehouse)&&(filter==='all'||filter==='open'&&!counted||filter==='counted'&&counted||filter==='conflict'&&x.stale);
  });
 }
 function render(){
  if(!data)return;
  const items=matching(),pages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.min(page,pages-1);
  $('inv75PageLabel').textContent=`${items.length} Treffer · Seite ${page+1} von ${pages}`;
  $('inv75Prev').disabled=page===0;$('inv75Next').disabled=page>=pages-1;
  const done=data.session.status!=='draft',disabled=done||busy?'disabled':'';
  $('inv75Rows').innerHTML=items.slice(page*pageSize,(page+1)*pageSize).map(x=>{
   const choices=new Map(data.locations.map(l=>[l.name,l.name]));if(x.location)choices.set(x.location,x.location);
   const options='<option value="">Ohne Lagerort</option>'+[...choices.keys()].map(name=>`<option value="${esc(name)}" ${name===x.location?'selected':''}>${esc(name)}</option>`).join('');
   return `<article class="inv75-row ${x.counted_stock!==null?'inv75-counted':''} ${x.stale?'inv75-conflict':''}">
    <div><b>${esc(x.article_no)}</b><div>${esc(x.description)}</div><span class="small">${esc(x.unit)} · Bestand bei Beginn: ${esc(x.base_stock)}</span>${x.stale?`<div class="inv75-warning">Bestandsstand geändert${x.missing?' / Artikel nicht mehr aktiv':''}. Bitte erneut prüfen.</div>${!x.missing?`<button class="secondary" onclick="LVInventory.rebase(${x.article_id})">Bestandsstand aktualisieren und neu zählen</button>`:''}`:''}</div>
    <label>Gezählt (${esc(x.unit)})<input id="inv75-count-${x.article_id}" type="text" inputmode="decimal" autocomplete="off" value="${esc(x.counted_stock??'')}" ${disabled} oninput="LVInventory.edit(${x.article_id},'counted_stock',this.value)"><span class="small">Leer = noch nicht gezählt · 0 = leerer Bestand</span></label>
    <label>Lagerort<select id="inv75-location-${x.article_id}" ${disabled} onchange="LVInventory.edit(${x.article_id},'location',this.value)">${options}</select></label>
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
  data=result;dbid=result.database_id;pending.clear();errorState=false;
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
  page=0;adopt(data);$('inv75Session').value=id;
 }
 async function list(){index=await window.api('/api/inventory-v75/index');dbid=index.database_id;referenceOptions();const old=$('inv75Session').value;$('inv75Session').innerHTML='<option value="">Inventur auswählen</option>'+index.sessions.map(s=>`<option value="${esc(s.id)}">${esc(s.name)} · ${s.counted}/${s.total} · ${s.status==='draft'?'In Arbeit':s.status==='completed'?'Abgeschlossen':'Abgebrochen'}</option>`).join('');$('inv75Session').value=old;return index}
 async function guarded(fn){if(busy)return;busy=true;status();try{return await fn()}catch(e){message(e.message,false)}finally{busy=false;status()}}
 window.LVInventory={
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
   const result=await post('create',{id:crypto.randomUUID(),name:title,database_id:dbid});pending.clear();page=0;errorState=false;$('inv75Search').value='';$('inv75Filter').value='all';$('inv75WarehouseFilter').value='';adopt(result);await list();$('inv75Session').value=result.session.id;try{localStorage.setItem('lv75-last-inventory:'+dbid,result.session.id)}catch{}
   message('Inventur gestartet. Leere Felder sind ungezählt und werden nicht als Nullbestand behandelt.');
  })},
  select(){return guarded(async()=>{await load($('inv75Session').value);if(data)$('inv75Session').value=data.session.id})},
  edit(id,field,value){
   if(!data||data.session.status!=='draft')return;
   $('inv75ReviewBox').hidden=true;
   const row=data.items.find(x=>x.article_id===id);if(!row)return;row[field]=value===''&&field==='counted_stock'?null:value;
   pending.set(id,{...(pending.get(id)||{article_id:id}),[field]:row[field]});cache();status();clearTimeout(timer);timer=setTimeout(()=>flush(),750);
  },
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
   if(!await flush()||!await window.ensureAdminPassword())return;
   const el=$(kind==='warehouse'?'inv75NewWarehouse':'inv75NewLocation');
   const result=await post(kind,{name:el.value,warehouse_id:$('inv75Warehouse').value,database_id:dbid});
   if(data){data.warehouses=result.warehouses;data.locations=result.locations}else{index.warehouses=result.warehouses;index.locations=result.locations}
   referenceOptions();if(kind==='warehouse')$('inv75Warehouse').value=result.created.id;el.value='';render();message(`${kind==='warehouse'?'Lager':'Lagerort'} „${result.created.name}“ ist verfügbar. Den Lagerort beim Artikel auswählen.`);
  })},
  async review(){return guarded(async()=>{
   if(!await flush())return;adopt(await window.api('/api/inventory-v75/preview?id='+encodeURIComponent(data.session.id)));
   const s=data.stats;$('inv75ReviewBox').hidden=false;
   $('inv75ReviewSummary').textContent=`${s.counted} gezählt · ${s.remaining} ungezählt · ${s.stock_changes} Bestandskorrekturen · ${s.location_changes} Lagerortänderungen · ${s.conflicts} Konflikte`;
   $('inv75PartialLabel').hidden=!s.remaining;$('inv75Partial').checked=false;
   $('inv75Finalize').disabled=!!s.conflicts||!s.counted;
   $('inv75ReviewRows').innerHTML=data.items.filter(x=>x.counted_stock!==null).map(x=>`<tr><td>${esc(x.article_no)}</td><td>${esc(x.base_stock)}</td><td>${esc(x.counted_stock)}</td><td>${esc(x.difference)}</td><td>${esc(x.location)}</td><td>${x.conflict?'Bitte neu zählen':''}</td></tr>`).join('');
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
