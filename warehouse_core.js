(function(root){'use strict';root.LVWarehouseCore={create(d){
 const {run,rows,scalar,setting,setSetting,persist,audit,stamp,transaction,guard}=d;
 function init(){
  for(const table of ['articles','inventory_counts']){
   const cols=rows('PRAGMA table_info('+table+')').map(x=>x.name);
   if(!cols.includes('warehouse_id'))run('ALTER TABLE '+table+' ADD COLUMN warehouse_id INTEGER');
   if(table==='inventory_counts'&&!cols.includes('base_warehouse_id'))run('ALTER TABLE inventory_counts ADD COLUMN base_warehouse_id INTEGER');
  }
  if(!rows('PRAGMA table_info(articles)').some(x=>x.name==='warehouse_selection_set'))run('ALTER TABLE articles ADD COLUMN warehouse_selection_set INTEGER NOT NULL DEFAULT 0');
  if(setting('warehouse_v76_migrated','')!=='1'){
   run('UPDATE articles SET warehouse_id=(SELECT warehouse_id FROM locations WHERE locations.name=articles.location) WHERE warehouse_id IS NULL');
   run('UPDATE inventory_counts SET warehouse_id=(SELECT warehouse_id FROM locations WHERE locations.name=inventory_counts.location),base_warehouse_id=(SELECT warehouse_id FROM locations WHERE locations.name=inventory_counts.base_location)');
   run('UPDATE articles SET warehouse_selection_set=1 WHERE warehouse_id IS NOT NULL');
   setSetting('warehouse_v76_migrated','1');
  }
 }
 function id(value){if(value===null||value===undefined||value===''||value===0||value==='0')return null;const n=Number(value);if(!Number.isInteger(n)||n<1||!scalar('SELECT COUNT(*) FROM inventory_warehouses WHERE id=?',[n]))throw Error('Das gewählte Lager ist nicht vorhanden.');return n}
 const defaultId=()=>{const n=Number(setting('default_warehouse_id','0'));return rows('SELECT id FROM inventory_warehouses WHERE id=?',[n]).length?n:null};
 const refs=()=>({warehouses:rows('SELECT * FROM inventory_warehouses ORDER BY name'),locations:rows('SELECT id,name,warehouse_id FROM locations WHERE active=1 ORDER BY name'),default_warehouse_id:defaultId()});
 function resolve(p,fallback={},useDefault=false){
  const location=String(p.location??fallback.location??'').trim(),loc=location?rows('SELECT * FROM locations WHERE name=? AND active=1',[location])[0]:null;
  if(location&&!loc&&location!==fallback.location)throw Error('Der Lagerort ist nicht mehr vorhanden.');
  const explicit=Object.prototype.hasOwnProperty.call(p,'warehouse_id');
  const warehouse_id=explicit?id(p.warehouse_id):loc?.warehouse_id?id(loc.warehouse_id):fallback.warehouse_id?id(fallback.warehouse_id):useDefault?defaultId():null;
  if(loc?.warehouse_id&&warehouse_id!==Number(loc.warehouse_id))throw Error('Der Lagerort gehört zu einem anderen Lager. Bitte Lager und Lagerort passend auswählen.');
  return {warehouse_id,location};
 }
 function assign(articleId,p={},fallback={},useDefault=false){const x=resolve(p,fallback,useDefault);run('UPDATE articles SET warehouse_id=?,location=?,warehouse_selection_set=? WHERE id=?',[x.warehouse_id,x.location,('warehouse_id' in p)||x.warehouse_id!==null?1:Number(fallback.warehouse_selection_set||0),articleId]);return x}
 let queue=Promise.resolve(),needsPersistence=false;
 async function durable(){needsPersistence=true;await persist();needsPersistence=false}
 async function change(action,p){
  await guard();if(needsPersistence)await durable();
  if(action==='default'){
   const next=id(p.warehouse_id),old=defaultId();if(next===old)return {...refs(),unchanged:true};
   transaction(()=>{setSetting('default_warehouse_id',next||'');audit(setting('primary_technician','Techniker'),'STANDARDLAGER','Lager',String(next||''),`Standardlager: ${old||'—'} → ${next||'—'}`)});await durable();return refs();
  }
  const name=String(p.name||'').trim();if(!name||name.length>120)throw Error('Bitte einen Namen mit höchstens 120 Zeichen eingeben.');
  let created;
  if(action==='warehouse'){
   created=rows('SELECT * FROM inventory_warehouses WHERE name=? COLLATE NOCASE',[name])[0];
   if(created)return {...refs(),created,existing:true};
   transaction(()=>{run('INSERT INTO inventory_warehouses(name,created_at) VALUES(?,?)',[name,stamp()]);created=rows('SELECT * FROM inventory_warehouses WHERE id=?',[scalar('SELECT last_insert_rowid()')])[0];audit(setting('primary_technician','Techniker'),'ANLAGE','Lager',String(created.id),name)});
  }else if(action==='location'){
   const wid=id(p.warehouse_id),w=wid?rows('SELECT * FROM inventory_warehouses WHERE id=?',[wid])[0]:null,full=w?`${w.name} / ${name}`:name;
   created=rows('SELECT * FROM locations WHERE name=? COLLATE NOCASE',[full])[0];
   if(created){if(!created.active||Number(created.warehouse_id||0)!==Number(wid||0))throw Error('Dieser Lagerortname ist bereits anderweitig vergeben.');return {...refs(),created,existing:true}}
   transaction(()=>{run('INSERT INTO locations(name,warehouse_id) VALUES(?,?)',[full,wid]);created=rows('SELECT * FROM locations WHERE id=?',[scalar('SELECT last_insert_rowid()')])[0];audit(setting('primary_technician','Techniker'),'ANLAGE','Lagerort',String(created.id),full)});
  }else throw Error('Unbekannte Lagerfunktion.');
  await durable();return {...refs(),created};
 }
 return {init,refs,resolve,assign,defaultId,id,handle(action,p){if(action==='index')return Promise.resolve(refs());const result=queue.then(()=>change(action,p));queue=result.catch(()=>{});return result}};
}}})(typeof window!=='undefined'?window:globalThis);
