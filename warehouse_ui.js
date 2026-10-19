(function(){
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let refs={warehouses:[],locations:[],default_warehouse_id:null},articleId=0,busy=false;
 const post=(action,body)=>window.api('/api/warehouse76/'+action,{method:'POST',body:JSON.stringify(body)});
 function warehouses(value){return '<option value="">Ohne Lager</option>'+refs.warehouses.map(w=>`<option value="${w.id}" ${Number(value)===w.id?'selected':''}>${esc(w.name)}${w.id===refs.default_warehouse_id?' (Standard)':''}</option>`).join('')}
 function locations(wid,value=''){
  const choices=refs.locations.filter(l=>!wid||!l.warehouse_id||Number(l.warehouse_id)===Number(wid));
  if(value&&!choices.some(l=>l.name===value))choices.push({name:value});
  return '<option value="">Ohne Lagerort</option>'+choices.map(l=>`<option value="${esc(l.name)}" ${l.name===value?'selected':''}>${esc(l.name)}</option>`).join('');
 }
 function pair(prefix,wid,loc){const w=$(prefix+'warehouse'),l=$(prefix+'location');if(w){w.innerHTML=warehouses(wid);w.value=wid||''}if(l){l.innerHTML=locations(wid,loc);l.value=loc||''}}
 function changed(prefix){const w=$(prefix+'warehouse'),l=$(prefix+'location'),old=refs.locations.find(x=>x.name===l.value);pair(prefix,w.value,old?.warehouse_id&&Number(old.warehouse_id)!==Number(w.value)?'':l.value)}
 function locationChanged(prefix){const l=refs.locations.find(x=>x.name===$(prefix+'location').value);if(l?.warehouse_id)$(prefix+'warehouse').value=l.warehouse_id}
 function renderDialog(wid,loc){
  pair('wh76-',wid,loc);$('wh76-default').textContent='Standardlager: '+(refs.warehouses.find(w=>w.id===refs.default_warehouse_id)?.name||'keines');
 }
 function dialog(){if($('wh76-dialog'))return;
  const el=document.createElement('dialog');el.id='wh76-dialog';el.style.cssText='width:min(600px,calc(100vw - 32px));max-height:90dvh;overflow:auto;border:0;border-radius:16px;padding:22px;box-sizing:border-box';
  el.innerHTML=`<h2>Lager und Lagerort</h2><p class="small">Lager auswählen oder ergänzen. Ein Lagerort ist optional. Diese Funktionen sind ohne Kennwort verfügbar.</p><div class="formgrid"><label>Lager<select id="wh76-warehouse" onchange="LVWarehouses.changed('wh76-')"></select></label><label>Lagerort (optional)<select id="wh76-location" onchange="LVWarehouses.locationChanged('wh76-')"></select></label></div><p id="wh76-default" class="small"></p><button class="secondary" id="wh76-set-default" onclick="LVWarehouses.setDefault()">Ausgewähltes Lager als Standard speichern</button><p class="small">Das Standardlager wird bei neuen Materialien und noch nicht zugeordneten Artikeln vorausgewählt. Bestehende Zuordnungen bleiben erhalten.</p><div class="formgrid"><label>Neues Lager<input id="wh76-new-warehouse" maxlength="120" placeholder="z. B. Hauptlager"></label><button class="secondary" onclick="LVWarehouses.add('warehouse')">Lager anlegen</button><label>Neuer Lagerort im ausgewählten Lager<input id="wh76-new-location" maxlength="120" placeholder="z. B. Regal A"></label><button class="secondary" onclick="LVWarehouses.add('location')">Lagerort anlegen</button></div><p id="wh76-msg" role="status"></p><div class="toolbar"><button id="wh76-apply" onclick="LVWarehouses.apply()">Auswahl übernehmen</button><button class="secondary" onclick="document.getElementById('wh76-dialog').close()">Schließen</button></div>`;
  document.body.appendChild(el);
 }
 async function mutate(fn){if(busy)return;busy=true;$('wh76-dialog').querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn()}catch(e){window.msg($('wh76-msg'),e.message,false)}finally{busy=false;$('wh76-dialog').querySelectorAll('button').forEach(b=>b.disabled=false)}}
 window.LVWarehouses={
  setRefs(data){refs={warehouses:data.warehouses||[],locations:data.locations||[],default_warehouse_id:data.default_warehouse_id??null}},
  async refresh(){this.setRefs(await window.api('/api/warehouse76/index'));return refs},
  warehouses,locations,pair,changed,locationChanged,
  fields(a){const wid=a.warehouse_id??(a.warehouse_selection_set?null:refs.default_warehouse_id);return `<div class="stock-storage-fields"><label>Lager<select class="stock-location-select" id="stock-warehouse-${a.id}" onchange="LVWarehouses.stockChanged(${a.id})">${warehouses(wid)}</select></label><label>Lagerort (optional)<select class="stock-location-select" id="stock-location-${a.id}" onchange="LVWarehouses.stockLocationChanged(${a.id})">${locations(wid,a.location||'')}</select></label><button type="button" class="secondary" onclick="LVWarehouses.open(${a.id})">+ Lager / Lagerort</button></div>`},
  stockChanged(id){const p='stock-',w=$(`${p}warehouse-${id}`),l=$(`${p}location-${id}`),old=refs.locations.find(x=>x.name===l.value),value=old?.warehouse_id&&Number(old.warehouse_id)!==Number(w.value)?'':l.value;l.innerHTML=locations(w.value,value);window.markLevelDraft('stock',id)},
  stockLocationChanged(id){const l=refs.locations.find(x=>x.name===$(`stock-location-${id}`).value);if(l?.warehouse_id)$(`stock-warehouse-${id}`).value=l.warehouse_id;window.markLevelDraft('stock',id)},
  restore(id,d){const w=$(`stock-warehouse-${id}`),l=$(`stock-location-${id}`);if(w){w.innerHTML=warehouses(d.warehouse_id);w.value=d.warehouse_id||''}if(l){l.innerHTML=locations(d.warehouse_id,d.location||'');l.value=d.location||''}},
  fillMaterial(prefix='nm',reset=false){const w=$(prefix+'_warehouse'),l=$(prefix+'_location');if(!w||!l)return;const value=!reset&&w.dataset.ready?w.value:refs.default_warehouse_id,loc=reset?'':l.value;pair(prefix+'_',value,loc);w.dataset.ready='1'},
  async open(id=0){dialog();articleId=Number(id);try{await this.refresh();const w=$(`stock-warehouse-${id}`),l=$(`stock-location-${id}`);renderDialog(w?w.value:refs.default_warehouse_id,l?.value||'');$('wh76-apply').hidden=!articleId;$('wh76-msg').textContent='';$('wh76-dialog').showModal()}catch(e){alert(e.message)}},
  async add(kind){return mutate(async()=>{const input=$('wh76-new-'+kind),wid=$('wh76-warehouse').value,loc=$('wh76-location').value;const result=await post(kind,{name:input.value,warehouse_id:wid});this.setRefs(result);await window.master();window.renderStockArticlesFromCache();renderDialog(kind==='warehouse'?result.created.id:wid,kind==='location'?result.created.name:loc);input.value='';window.msg($('wh76-msg'),`${kind==='warehouse'?'Lager':'Lagerort'} ist gespeichert.`,true)})},
  async setDefault(){return mutate(async()=>{const wid=$('wh76-warehouse').value,loc=$('wh76-location').value;this.setRefs(await post('default',{warehouse_id:wid}));await window.master();window.renderStockArticlesFromCache();if($('nm_warehouse')&&!$('nm_warehouse').value&&!$('nm_location').value)LVWarehouses.fillMaterial('nm',true);renderDialog(wid,loc);window.msg($('wh76-msg'),'Standardlager gespeichert.',true)})},
  apply(){if(!articleId)return;window.stageStockWarehouse(articleId,$('wh76-warehouse').value,$('wh76-location').value);$('wh76-dialog').close()},
  async inlineLocation(prefix,name){const wid=$(prefix+'_warehouse')?.value??refs.default_warehouse_id;const r=await post('location',{name,warehouse_id:wid});this.setRefs(r);await window.master();if($(prefix+'_warehouse'))pair(prefix+'_',wid,r.created.name);else{const l=$(prefix+'_location');l.innerHTML=locations(null,r.created.name);l.value=r.created.name}return r.created}
 };
})();
