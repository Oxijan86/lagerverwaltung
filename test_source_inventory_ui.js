(function(){
 const V84=window.LVInventoryV84Core, V85=window.LVInventoryV85Core;
 let data=null,pending=new Map(),busy=false,timer=null;
 const $=id=>document.getElementById(id); const manualPlaceOverrides=new Set();
 function context(){}function message(){}function cache(){}function status(){}function render(){}function flush(){}function saveContext(){}function contextMessage(){}
 function template(x,disabled,esc){
 const suggestion=manualPlaceOverrides.has(x.article_id)?null:V85.suggestedPlace(x,context(),data.locations);
 const shownLocation=suggestion?suggestion.location:x.location;
   const shownWarehouse=suggestion?suggestion.warehouse_id:x.warehouse_id;
 return `<select id="inv75-warehouse-${x.article_id}" ${disabled} onchange="LVInventory.warehouseChanged(${x.article_id},this.value)"></select><input id="inv75-location-${x.article_id}" list="opt"/><button onclick="LVInventory.useContextFor(${x.article_id})">Übernehmen</button><input value="${esc(x.counted_stock??'')}" ${disabled} oninput="LVInventory.edit(${x.article_id},'counted_stock',this.value)"><button type="button" class="secondary" onclick="LVInventory.confirmCount(${x.article_id})">✓ Bestätigen & weiter</button>${x.bin_parts_json?`<p class="small">Teilmengen: ${esc(x.bin_parts_json)}</p>`:''}`}
 window.LVInventory={
  correctTotal(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));
   if(!row||data.session.status!=='draft')return;
   if(!confirm('Gesamtmenge für Artikel '+row.article_no+' ausdrücklich korrigieren? Bei einer Änderung gehen bisherige Teilmengen je Lagerort verloren und müssen neu erfasst werden.'))return;
   const el=$('inv75-count-'+id);
   if(el){el.readOnly=false;el.focus();el.select();}
   message('Korrektur freigegeben. Nach Eingabe bitte ausdrücklich „Bestätigen & weiter“ wählen.');
  },
  addBinPart(id){return oldBin()},
  updateReferences(refs){},
  addCount(id){return oldAdd()},
  edit(id,field,value){
   if(!data||data.session.status!=='draft')return;
   $('inv75ReviewBox').hidden=true;
  },
  async confirmCount(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id)),el=$('inv75-count-'+id);if(!row||!el)return;
   try{V84.quantity(el.value,{unit:row.unit})}catch(e){message(e.message,false);el.focus();return}
   if(!await flush())return;
   const search=$('inv75Search');search.value='';this.filter();search.focus();search.select();
  },
  useContextFor(id){
   const row=data?.items.find(x=>Number(x.article_id)===Number(id));if(!row)return;
  },
  async locationChangedInline(id,value){
   if(!data||busy)return;
   const row=data.items.find(x=>Number(x.article_id)===Number(id));if(!row)return;
  },
  warehouseChanged(id,value){const row=data.items.find(x=>x.article_id===id);if(!row)return;},
  contextLocationChanged(value){
   const location=data?.locations.find(l=>l.name===String(value));
   if(location){$('inv84Location').value=location.name;if(location.warehouse_id)$('inv84Warehouse').value=String(location.warehouse_id)}
   saveContext();contextMessage();
  },
  contextToggle(){saveContext();contextMessage()},
 };
})();
