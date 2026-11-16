/* V86: Lagerort-Teilbestände mit konservativer Migration und revisionsgesicherter Umlagerung.
   Gesamtlagerbestand bleibt aus initial_stock + Bewegungen abgeleitet. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LVStockBinsV86Core=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const EPS=1e-7;
 const round=x=>Math.round(Number(x)*1e8)/1e8;
 const binKey=(warehouseId,location)=>JSON.stringify([Number(warehouseId)||null,String(location||'').trim()]);
 function validateQty(value,unit){
  const text=String(value??'').trim().replace(',','.');
  if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(text))throw Error('Bitte eine gültige positive Menge ohne Tausendertrennzeichen eingeben.');
  const n=Number(text);if(!Number.isFinite(n)||n<=0||n>1e12)throw Error('Menge muss größer als 0 sein.');
  if(['stk.','stk','stück','satz','rolle','packung','karton'].includes(String(unit||'').toLowerCase())&&!Number.isInteger(n))throw Error('Bei Stückartikeln sind nur ganze Mengen erlaubt.');
  return round(n);
 }
 function plan(rows,selection,{mode='all',warehouse_id,location='',target_warehouse_id,target_location='',quantity=0}={}){
  const fromWarehouse=String(warehouse_id??''),fromLocation=String(location||'').trim(),targetWarehouse=String(target_warehouse_id??''),targetLocation=String(target_location||'').trim();
  // Massentransfer darf niemals versehentlich alle Lager zugleich als Quelle nutzen.
  if(mode==='all'&&!fromWarehouse)throw Error('Bitte fuer die Sammelumlagerung zuerst ein konkretes Quelllager auswaehlen.');
  const byId=new Map(rows.map(x=>[Number(x.id),x]));
  const eligible=rows.filter(x=>(!fromWarehouse||String(x.warehouse_id??'')===fromWarehouse)&&(!fromLocation||x.location===fromLocation)&&Number(x.quantity)>EPS);
  const source=mode==='all'?eligible:mode==='selected'?[(byId.get(Number(selection))||null)].filter(Boolean):[];
  if(mode!=='all'&&mode!=='selected')throw Error('Unbekannter Umlagerungsmodus.');
  if(!source.length)throw Error('Keine passenden Lagerort-Teilbestände gefunden.');
  const result=source.map(x=>{
   if(mode==='selected'&&!eligible.some(e=>e.id===x.id))throw Error('Der gewählte Quellbestand gehört nicht zum Quelllagerort.');
   const qty=mode==='selected'?validateQty(quantity,x.unit):round(x.quantity);
   if(qty-Number(x.quantity)>EPS)throw Error('Nicht genügend Bestand im Quelllagerort: '+x.article_no);
   if(binKey(x.warehouse_id,x.location)===binKey(targetWarehouse,targetLocation))throw Error('Quelle und Ziel sind identisch.');
   return {bin_id:Number(x.id),article_id:Number(x.article_id),article_no:String(x.article_no),description:String(x.description||''),unit:String(x.unit||''),from_warehouse_id:Number(x.warehouse_id)||null,from_location:String(x.location||''),to_warehouse_id:Number(targetWarehouse)||null,to_location:targetLocation,quantity:qty};
  });
  return result;
 }
 function create(deps){
  const {run,rows,scalar,persist,audit,stamp,transaction,backup,guard,authorized,state}=deps;
  function init(){
   run(`CREATE TABLE IF NOT EXISTS stock_bins_v86(id INTEGER PRIMARY KEY AUTOINCREMENT,article_id INTEGER NOT NULL,warehouse_id INTEGER,location TEXT NOT NULL DEFAULT '',bin_key TEXT NOT NULL,quantity REAL NOT NULL CHECK(quantity>=0),UNIQUE(article_id,bin_key))`);
   run(`CREATE TABLE IF NOT EXISTS stock_bin_moves_v86(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,article_id INTEGER NOT NULL,article_no TEXT NOT NULL,quantity REAL NOT NULL,source_warehouse_id INTEGER,source_location TEXT NOT NULL,target_warehouse_id INTEGER,target_location TEXT NOT NULL,operator TEXT NOT NULL,reason TEXT NOT NULL)`);
   if(!scalar("SELECT COUNT(*) FROM app_settings WHERE setting_key='stock_bins_migrated_v86'")){
    const materials=rows(`SELECT a.id,a.location,a.warehouse_id,a.initial_stock+COALESCE(SUM(CASE WHEN m.movement_type='IN' THEN m.quantity ELSE -m.quantity END),0) stock FROM articles a LEFT JOIN movements m ON a.id=m.article_id GROUP BY a.id`);
    for(const a of materials)if(Number(a.stock)>EPS){
     const wid=Number(a.warehouse_id)||null,key=binKey(wid,a.location);
     run('INSERT OR IGNORE INTO stock_bins_v86(article_id,warehouse_id,location,bin_key,quantity) VALUES(?,?,?,?,?)',[a.id,wid,a.location||'',key,round(a.stock)]);
    }
    run("INSERT OR REPLACE INTO app_settings(setting_key,setting_value) VALUES('stock_bins_migrated_v86','1')");
   }
  }
  function reconcile(){
   // Reserven bei Alt-Buchungen konservativ korrigieren, niemals Gesamtbestand aendern.
   const expected=rows(`SELECT a.id,a.location,a.warehouse_id,a.initial_stock+COALESCE(SUM(CASE WHEN m.movement_type='IN' THEN m.quantity ELSE -m.quantity END),0) stock FROM articles a LEFT JOIN movements m ON a.id=m.article_id GROUP BY a.id`);
   const valid=new Set(expected.map(x=>Number(x.id)));
   for(const old of rows('SELECT DISTINCT article_id FROM stock_bins_v86'))if(!valid.has(Number(old.article_id)))run('DELETE FROM stock_bins_v86 WHERE article_id=?',[old.article_id]);
   for(const a of expected){
    const target=round(Math.max(0,Number(a.stock)||0));
    const bins=rows('SELECT * FROM stock_bins_v86 WHERE article_id=? ORDER BY CASE WHEN bin_key=? THEN 0 ELSE 1 END,id',[a.id,binKey(a.warehouse_id,a.location)]);
    const assigned=round(bins.reduce((v,b)=>v+Number(b.quantity),0));let delta=round(target-assigned);
    if(Math.abs(delta)<=EPS)continue;
    if(delta>EPS){
     const id=bins.find(b=>b.bin_key===binKey(a.warehouse_id,a.location));
     if(id)run('UPDATE stock_bins_v86 SET quantity=quantity+? WHERE id=?',[delta,id.id]);
     else run('INSERT INTO stock_bins_v86(article_id,warehouse_id,location,bin_key,quantity) VALUES(?,?,?,?,?)',[a.id,Number(a.warehouse_id)||null,a.location||'',binKey(a.warehouse_id,a.location),delta]);
    }else{
     // Alt-Entnahme ohne Quelllagerort: zuerst Standardlagerort, danach weitere.
     for(const b of bins){if(delta>=-EPS)break;const take=Math.min(-delta,Number(b.quantity));run('UPDATE stock_bins_v86 SET quantity=? WHERE id=?',[round(Number(b.quantity)-take),b.id]);delta=round(delta+take)}
    }
   }
   run('DELETE FROM stock_bins_v86 WHERE quantity<=0.00000001');
  }
  function signature(articleId){return JSON.stringify(rows('SELECT warehouse_id,location,quantity FROM stock_bins_v86 WHERE article_id=? AND quantity>0.00000001 ORDER BY bin_key',[Number(articleId)]));}
  function assignInventory(articleId,parts,total){
   const sum=round(parts.reduce((n,x)=>n+Number(x.quantity),0));
   if(Math.abs(sum-Number(total))>EPS)throw Error('Teilzählungen stimmen nicht mit dem Gesamtzählwert überein.');
   const keys=new Set();for(const p of parts){
    validatePlace(p.warehouse_id,p.location);
    const key=binKey(p.warehouse_id,p.location);if(keys.has(key))throw Error('Doppelter Teilzählort');keys.add(key);
    if(Number(p.quantity)<0||!Number.isFinite(Number(p.quantity)))throw Error('Ungültige Teilzählmenge.');
   }
   run('DELETE FROM stock_bins_v86 WHERE article_id=?',[Number(articleId)]);
   for(const x of parts)if(Number(x.quantity)>EPS)run('INSERT INTO stock_bins_v86(article_id,warehouse_id,location,bin_key,quantity) VALUES(?,?,?,?,?)',[Number(articleId),Number(x.warehouse_id)||null,String(x.location||''),binKey(x.warehouse_id,x.location),round(x.quantity)]);
   if(parts.length===1)run('UPDATE articles SET location=?,warehouse_id=?,warehouse_selection_set=1 WHERE id=?',[parts[0].location,parts[0].warehouse_id,Number(articleId)]);
  }
  function refs(){return rows(`SELECT b.id,b.article_id,a.article_no,a.description,a.unit,b.warehouse_id,b.location,b.quantity, w.name warehouse_name FROM stock_bins_v86 b JOIN articles a ON a.id=b.article_id LEFT JOIN inventory_warehouses w ON w.id=b.warehouse_id WHERE b.quantity>0.00000001 ORDER BY a.article_no,w.name,b.location`)}
  function validatePlace(wid,location){
   const id=Number(wid)||null;const name=String(location||'').trim();
   if(id&&!scalar('SELECT COUNT(*) FROM inventory_warehouses WHERE id=?',[id]))throw Error('Ziellager ist unbekannt.');
   if(name){const place=rows('SELECT * FROM locations WHERE name=? AND active=1',[name])[0];if(!place)throw Error(`Ziel-Lagerort „${name}“ fehlt. Bitte zuerst anlegen.`);
    if(Number(place.warehouse_id||0)!==Number(id||0))throw Error('Ziellager und Lagerort gehören nicht zusammen.');}
   return {warehouse_id:id,location:name};
  }
  function sourcePlan(d){
   const target=validatePlace(d.target_warehouse_id,d.target_location);
   const selection=d.mode==='selected'?d.bin_id:null;
   return plan(refs(),selection,{mode:d.mode||'all',warehouse_id:d.warehouse_id,location:d.location,target_warehouse_id:target.warehouse_id,target_location:target.location,quantity:d.quantity});
  }
  async function execute(d,opt){
   await guard();if(!await authorized(d,opt))throw Error('Zum Umlagern bitte den Administratorbereich freischalten.');
   const expected=String(d.expected_revision_id||'');if(!expected||expected!==state().revision_id)throw Error('Datenstand hat sich geändert. Bitte Umlagerung neu prüfen.');
   if(d.confirm!==true)throw Error('Die Umlagerung muss ausdrücklich bestätigt werden.');
   const moves=sourcePlan(d);if(moves.length>600)throw Error('Bitte höchstens 600 Teilbestände auf einmal umlagern.');
   await backup('Sicherheitsbackup','Vor Lagerort-Umlagerung V86');
   if(state().revision_id!==expected)throw Error('Während der Sicherung hat sich der Datenstand geändert. Bitte neu prüfen.');
   transaction(()=>{
    // Reihenfolge, verfügbare Teilmengen und Zielort bei jeder Operation erneut prüfen.
    for(const x of moves){
     const actual=rows('SELECT * FROM stock_bins_v86 WHERE id=?',[x.bin_id])[0];
     if(!actual||actual.article_id!==x.article_id||Number(actual.quantity)+EPS<x.quantity)throw Error('Quellbestand zwischenzeitlich verändert: '+x.article_no);
     run('UPDATE stock_bins_v86 SET quantity=? WHERE id=?',[round(Number(actual.quantity)-x.quantity),x.bin_id]);
     const key=binKey(x.to_warehouse_id,x.to_location),dest=rows('SELECT id,quantity FROM stock_bins_v86 WHERE article_id=? AND bin_key=?',[x.article_id,key])[0];
     if(dest)run('UPDATE stock_bins_v86 SET quantity=? WHERE id=?',[round(Number(dest.quantity)+x.quantity),dest.id]);
     else run('INSERT INTO stock_bins_v86(article_id,warehouse_id,location,bin_key,quantity) VALUES(?,?,?,?,?)',[x.article_id,x.to_warehouse_id,x.to_location,key,x.quantity]);
     const event=(globalThis.crypto?.randomUUID?.()||'v86-'+Date.now()+'-'+Math.random());
     run('INSERT INTO stock_bin_moves_v86(id,created_at,article_id,article_no,quantity,source_warehouse_id,source_location,target_warehouse_id,target_location,operator,reason) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[event,stamp(),x.article_id,x.article_no,x.quantity,x.from_warehouse_id,x.from_location,x.to_warehouse_id,x.to_location,String(d.technician||'Techniker'),String(d.reason||'Umlagerung')]);
     audit(d.technician||'Techniker','UMLAGERUNG','Artikel',String(x.article_id),`${x.article_no}: ${x.quantity} ${x.unit} von ${x.from_location||'(ohne Lagerort)'} nach ${x.to_location||'(ohne Lagerort)'}; Grund: ${d.reason||'Umlagerung'}`);
    }
    run('DELETE FROM stock_bins_v86 WHERE quantity<=0.00000001');
    // Artikel-Stamm ist nur noch ein bevorzugter Lagerort (bei Mehrfachlagerung keine eindeutige Zuordnung).
    for(const aid of new Set(moves.map(x=>x.article_id))){
     const bins=rows('SELECT * FROM stock_bins_v86 WHERE article_id=? AND quantity>0.00000001 ORDER BY quantity DESC,id',[aid]);
     if(bins.length===1)run('UPDATE articles SET warehouse_id=?,location=?,warehouse_selection_set=1 WHERE id=?',[bins[0].warehouse_id,bins[0].location,aid]);
    }
   });
   await persist();return {ok:true,moved:moves.length,total_quantity:round(moves.reduce((s,x)=>s+x.quantity,0)),revision:state().revision_id};
  }
  return {init,reconcile,refs,signature,assignInventory,async handle(action,d,opt){
   if(action==='index')return {bins:refs(),revision:state().revision_id,history:rows('SELECT * FROM stock_bin_moves_v86 ORDER BY created_at DESC LIMIT 100')};
   if(action==='preview')return {items:sourcePlan(d),revision:state().revision_id};
   if(action==='execute')return execute(d,opt);
   throw Error('Unbekannte Lagerortfunktion.');
  }};
 }
 return {binKey,validateQty,plan,create};
});
