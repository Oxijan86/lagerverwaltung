/* V85: Pure inventory location search and context presentation helpers. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LVInventoryV85Core=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const norm=value=>String(value??'').trim().toLocaleLowerCase('de-DE');
 const NONE='__without_location__';
 const isUncounted=x=>x.counted_stock===null||x.counted_stock===undefined||String(x.counted_stock).trim()==='';
 function locationsForWarehouse(locations=[],warehouse=''){
  const id=String(warehouse||'');
  const seen=new Set();
  return locations.filter(l=>l&&l.name&&(!id||String(l.warehouse_id||'')===id)).filter(l=>{const k=norm(l.name);if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>String(a.name).localeCompare(String(b.name),'de'));
 }
 function suggestedPlace(row,context,locations=[]){
  if(!row||!isUncounted(row)||!context?.apply)return null;
  const name=norm(context.location);
  if(name){
   const known=locations.find(l=>norm(l.name)===name);
   if(!known)return null;
   if(context.warehouse_id&&known.warehouse_id&&Number(context.warehouse_id)!==Number(known.warehouse_id))return null;
   return {location:known.name,warehouse_id:known.warehouse_id||Number(context.warehouse_id)||null};
  }
  return context.warehouse_id?{location:'',warehouse_id:Number(context.warehouse_id)}:null;
 }
 function matches(row,{query='',status='all',warehouse='',location='',exactLookup=true}={}){
  if(!row)return false;
  const q=norm(query),loc=norm(location),actualLoc=norm(row.location);
  const positions=(row.stock_bins?.length?row.stock_bins:[{warehouse_id:row.warehouse_id,location:row.location}]);
  const txt=norm([row.article_no,row.description,row.barcode,row.location,row.warehouse_name,...positions.map(p=>p.location)].join(' '));
  if(q&&!q.split(/\s+/).every(w=>txt.includes(w)))return false;
  const counted=!isUncounted(row);
  if(status==='open'&&counted||status==='counted'&&!counted||status==='conflict'&&!row.stale)return false;
  const exact=!!q&&exactLookup&&(norm(row.article_no)===q||norm(row.barcode)===q);
  const inRequestedPlace=positions.some(p=>(!warehouse||String(p.warehouse_id||'')===String(warehouse))&&(!location||(location===NONE?!norm(p.location):norm(p.location)===loc)));
  return exact||inRequestedPlace;
 }
 return {NONE,norm,isUncounted,locationsForWarehouse,suggestedPlace,matches};
});
