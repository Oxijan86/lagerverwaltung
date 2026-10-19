(function(root){
 'use strict';
 root.LVInventoryCore={create(deps){
  const {run,rows,scalar,transaction,articles,stamp,today,setting,persist,audit,book,backup,authorized,assertWritable,databaseId}=deps;
  let queue=Promise.resolve(),needsPersistence=false;
  async function durable(){needsPersistence=true;await persist();needsPersistence=false}
  const error=message=>{throw Error(message)};
  function init(){
   const schema=`CREATE TABLE IF NOT EXISTS inventory_warehouses(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL COLLATE NOCASE UNIQUE,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inventory_sessions(id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',version INTEGER NOT NULL DEFAULT 1,technician TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,completed_at TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS inventory_counts(session_id TEXT NOT NULL,article_id INTEGER NOT NULL,article_no TEXT NOT NULL,description TEXT NOT NULL,unit TEXT NOT NULL,base_stock REAL NOT NULL,base_location TEXT NOT NULL,base_marker INTEGER NOT NULL,counted_stock REAL,location TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',PRIMARY KEY(session_id,article_id),FOREIGN KEY(session_id) REFERENCES inventory_sessions(id) ON DELETE CASCADE);`;
   for(const sql of schema.split(';'))if(sql.trim())run(sql);
   if(!rows('PRAGMA table_info(locations)').some(x=>x.name==='warehouse_id'))run('ALTER TABLE locations ADD COLUMN warehouse_id INTEGER');
  }
  function session(id){return rows('SELECT * FROM inventory_sessions WHERE id=?',[String(id||'')])[0]||error('Inventur wurde nicht gefunden.')}
  function draft(d){
   if(d.database_id!==databaseId())error('Die Lagerdatei wurde gewechselt. Inventur bitte neu öffnen.');
   const s=session(d.id);
   if(s.status!=='draft')error('Diese Inventur ist bereits abgeschlossen oder abgebrochen.');
   if(!Number.isInteger(d.version)||d.version!==s.version)error('Diese Inventur wurde inzwischen geändert. Bitte den gespeicherten Stand neu laden; ungespeicherte Eingaben bleiben lokal erhalten.');
   return s;
  }
  const references=()=>deps.storage().refs();
  function markers(){return new Map(rows('SELECT article_id,MAX(id) marker FROM movements GROUP BY article_id').map(x=>[x.article_id,Number(x.marker)]))}
  function view(id){
   const s=session(id),map=new Map(articles().map(x=>[x.id,x])),last=markers(),refs=references();
   const items=rows('SELECT * FROM inventory_counts WHERE session_id=? ORDER BY article_no',[s.id]).map(x=>{
    const a=map.get(x.article_id),missing=!a||!a.active;
    const changed=missing||Number(a.stock)!==x.base_stock||(last.get(x.article_id)||0)!==x.base_marker||String(a.location||'')!==x.base_location||a.unit!==x.unit||(a.warehouse_id??null)!==(x.base_warehouse_id??null);
    return {...x,current_stock:a?Number(a.stock):null,current_location:a?.location??'',current_warehouse_id:a?.warehouse_id??null,barcode:a?.barcode||'',missing,stale:s.status==='draft'&&changed,conflict:s.status==='draft'&&x.counted_stock!==null&&changed,difference:x.counted_stock===null?null:x.counted_stock-x.base_stock};
   });
   const counted=items.filter(x=>x.counted_stock!==null);
   return {database_id:databaseId(),durable:!needsPersistence,session:s,items,...refs,stats:{total:items.length,counted:counted.length,remaining:items.length-counted.length,conflicts:counted.filter(x=>x.conflict).length,stock_changes:counted.filter(x=>Math.abs(x.difference)>1e-8).length,location_changes:counted.filter(x=>x.location!==x.base_location||x.warehouse_id!==x.base_warehouse_id).length}};
  }
  function touch(id){run('UPDATE inventory_sessions SET version=version+1,updated_at=? WHERE id=?',[stamp(),id])}
  function count(value,unit){
   if(value===null||value===undefined||String(value).trim()==='')return null;
   if(!['number','string'].includes(typeof value))error('Eine Zählmenge muss eine Zahl sein.');
   // Count inputs accept a decimal comma or point, without thousands separators.
   const text=String(value).trim();
   if(typeof value==='string'&&!/^\+?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text))error('Bitte eine gültige Zählmenge ab 0 ohne Tausendertrennzeichen eingeben.');
   const quantity=Number(text.replace(',','.'));
   if(!Number.isFinite(quantity)||quantity<0)error('Bitte eine gültige Zählmenge ab 0 eingeben. Ein leeres Feld bleibt ungezählt.');
   return quantity;
  }
  function validLocation(location,baseline){
   if(location&&location!==baseline&&!scalar('SELECT COUNT(*) FROM locations WHERE active=1 AND name=?',[location]))error(`Lagerort „${location}“ ist nicht mehr vorhanden. Bitte einen aktiven Lagerort auswählen.`);
  }
  function append(id,list){
   const last=markers();
   for(const a of list)run('INSERT INTO inventory_counts(session_id,article_id,article_no,description,unit,base_stock,base_location,base_marker,location,warehouse_id,base_warehouse_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[id,a.id,a.article_no,a.description,a.unit,Number(a.stock),a.location||'',last.get(a.id)||0,a.location||'',a.warehouse_id??(a.warehouse_selection_set?null:deps.storage().defaultId()),a.warehouse_id??null]);
  }
  function plan(d){
   const s=draft(d),v=view(s.id);
   if(!v.stats.counted)error('Bitte mindestens einen Artikel zählen.');
   if(v.stats.remaining&&d.allow_partial!==true)error(`${v.stats.remaining} Artikel sind noch ungezählt. Bitte weiterzählen oder den Teilabschluss ausdrücklich auswählen.`);
   const conflicts=v.items.filter(x=>x.conflict);
   if(conflicts.length)error(`Bestand oder Lagerort seit Beginn geändert: ${conflicts.slice(0,8).map(x=>x.article_no).join(', ')}. Bitte den Bestandsstand dieser Artikel aktualisieren und erneut zählen.`);
   for(const x of v.items.filter(x=>x.counted_stock!==null)){count(x.counted_stock,x.unit);validLocation(x.location,x.base_location);deps.storage().resolve(x,x)}
   return v;
  }
  async function action(name,d,opt){
   if(name==='index')return {database_id:databaseId(),sessions:rows(`SELECT s.*,COUNT(c.article_id) total,COUNT(c.counted_stock) counted FROM inventory_sessions s LEFT JOIN inventory_counts c ON c.session_id=s.id GROUP BY s.id ORDER BY s.updated_at DESC`),...references()};
   if(name==='get'||name==='preview')return view(d.id);
   await assertWritable();
   if(d.database_id&&d.database_id!==databaseId())error('Die Lagerdatei wurde gewechselt. Inventur bitte neu öffnen.');
   if(needsPersistence)await durable();
   if(name==='create'){
    const id=String(d.id||''),title=String(d.name||'').trim();
    if(!/^[A-Za-z0-9_-]{16,100}$/.test(id)||!title||title.length>150)error('Bitte einen Inventurnamen eingeben.');
    if(rows('SELECT id FROM inventory_sessions WHERE id=?',[id]).length)return view(id);
    const list=articles().filter(a=>a.active);if(!list.length)error('Es sind keine aktiven Artikel zum Zählen vorhanden.');
    transaction(()=>{run('INSERT INTO inventory_sessions(id,name,technician,created_at,updated_at) VALUES(?,?,?,?,?)',[id,title,setting('primary_technician','Techniker'),stamp(),stamp()]);append(id,list);audit(setting('primary_technician','Techniker'),'INVENTUR-START','Inventur',id,`${title}: ${list.length} Artikel`)});
    await durable();return view(id);
   }
   if(name==='warehouse'||name==='location')return deps.storage().handle(name,d);
   if(name==='commit'){
    const existing=session(d.id);if(existing.status==='completed')return {...view(d.id),already_completed:true};
    if(!await authorized(d,opt))error('Zum Abschließen der Inventur ist die Administratorfreigabe erforderlich.');
    plan(d);await backup('Sicherheitsbackup',`Vor Inventur ${existing.name}`);
    await assertWritable();const v=plan(d);
    if(d.movement_date&&!/^\d{4}-\d{2}-\d{2}$/.test(d.movement_date))error('Bitte ein gültiges Buchungsdatum eingeben.');
    let booked=0,locations=0;
    transaction(()=>{
     for(const x of v.items.filter(x=>x.counted_stock!==null)){
      const diff=x.counted_stock-x.current_stock;
      if(Math.abs(diff)>1e-8){book([{article_id:x.article_id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{technician:v.session.technician,movement_date:d.movement_date||today(),source:'Inventur V75',note:`${v.session.name}; gezählt ${x.counted_stock}; ${x.note}`});booked++}
      if(x.location!==x.current_location||x.warehouse_id!==x.current_warehouse_id){run('UPDATE articles SET location=?,warehouse_id=? WHERE id=?',[x.location,x.warehouse_id,x.article_id]);locations++}
      run('UPDATE articles SET warehouse_selection_set=1 WHERE id=?',[x.article_id]);
      audit(v.session.technician,'INVENTUR-ZÄHLUNG','Artikel',String(x.article_id),`Inventur: ${v.session.name}\nArtikelnummer: ${x.article_no}\nIstbestand vorher: ${x.current_stock}\nGezählt: ${x.counted_stock}\nDifferenz: ${diff}\nLagerort: ${x.current_location||'—'} → ${x.location||'—'}\nNotiz: ${x.note}`);
     }
     run("UPDATE inventory_sessions SET status='completed',completed_at=?,updated_at=?,version=version+1 WHERE id=?",[stamp(),stamp(),v.session.id]);
     audit(v.session.technician,'INVENTUR-ABSCHLUSS','Inventur',v.session.id,`${v.stats.counted} gezählt; ${v.stats.remaining} ungezählt unverändert; ${booked} Korrekturen; ${locations} Lagerortänderungen`);
    });
    await durable();return {...view(d.id),booked,location_updates:locations};
   }
   // A lost/failed storage response may be retried after the change is already
   // in memory. Acknowledge only identical saved values; never overwrite newer ones.
   if(name==='save'){
    const current=session(d.id);
    if(current.status==='draft'&&d.database_id===databaseId()&&Number.isInteger(d.version)&&d.version<current.version&&Array.isArray(d.items)&&d.items.length<=1000){
     const saved=new Map(rows('SELECT * FROM inventory_counts WHERE session_id=?',[current.id]).map(x=>[x.article_id,x]));
     if(d.items.every(p=>{const x=saved.get(Number(p.article_id));return x&&(!('counted_stock' in p)||count(p.counted_stock,x.unit)===x.counted_stock)&&(!('location' in p)||String(p.location).trim()===x.location)&&(!('warehouse_id' in p)||(Number(p.warehouse_id)||null)===x.warehouse_id)&&(!('note' in p)||String(p.note).trim()===x.note)}))return view(current.id);
    }
   }
   const s=draft(d);
   if(name==='save'){
    if(!Array.isArray(d.items)||d.items.length>1000)error('Ungültige Inventureingaben.');
    const map=new Map(rows('SELECT * FROM inventory_counts WHERE session_id=?',[s.id]).map(x=>[x.article_id,x])),seen=new Set(),changes=[];
    for(const p of d.items){
     const x=map.get(Number(p.article_id));if(!x||seen.has(x.article_id))error('Inventurposition fehlt oder wurde doppelt übermittelt.');seen.add(x.article_id);
     const quantity='counted_stock' in p?count(p.counted_stock,x.unit):x.counted_stock;
     const {location,warehouse_id}=deps.storage().resolve(p,x);const note='note' in p?String(p.note).trim():x.note;
     if(note.length>2000)error('Eine Inventurnotiz darf höchstens 2000 Zeichen haben.');validLocation(location,x.base_location);
     if(quantity!==x.counted_stock||location!==x.location||warehouse_id!==x.warehouse_id||note!==x.note)changes.push({...x,quantity,location,warehouse_id,note});
    }
    if(!changes.length)return view(s.id);
    transaction(()=>{for(const x of changes)run('UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=? WHERE session_id=? AND article_id=?',[x.quantity,x.location,x.warehouse_id,x.note,s.id,x.article_id]);touch(s.id)});
   }else if(name==='rebase'){
    const a=articles().find(x=>x.id===Number(d.article_id)&&x.active),old=rows('SELECT * FROM inventory_counts WHERE session_id=? AND article_id=?',[s.id,Number(d.article_id)])[0];
    if(!a||!old)error('Dieser Artikel ist nicht mehr aktiv vorhanden. Zählung leeren und beim Teilabschluss auslassen.');
    const location=old.location===old.base_location?(a.location||''):old.location,warehouse_id=old.warehouse_id===old.base_warehouse_id?(a.warehouse_id??null):old.warehouse_id;
    transaction(()=>{run('UPDATE inventory_counts SET base_stock=?,base_location=?,base_marker=?,counted_stock=NULL,location=?,unit=?,base_warehouse_id=?,warehouse_id=? WHERE session_id=? AND article_id=?',[a.stock,a.location||'',markers().get(a.id)||0,location,a.unit,a.warehouse_id??null,warehouse_id,s.id,a.id]);touch(s.id);audit(s.technician,'INVENTUR-NEUZÄHLUNG','Artikel',String(a.id),`Inventur ${s.name}: Zählung geleert, Bestandsstand aktualisiert.`)});
   }else if(name==='refresh'){
    const existing=new Set(rows('SELECT article_id FROM inventory_counts WHERE session_id=?',[s.id]).map(x=>x.article_id)),list=articles().filter(a=>a.active&&!existing.has(a.id));
    if(!list.length)return view(s.id);transaction(()=>{append(s.id,list);touch(s.id)});
   }else if(name==='cancel'){
    transaction(()=>{run("UPDATE inventory_sessions SET status='cancelled',version=version+1,updated_at=? WHERE id=?",[stamp(),s.id]);audit(s.technician,'INVENTUR-ABBRUCH','Inventur',s.id,`${s.name}: Zwischenstand bleibt archiviert; keine Bestandsänderung.`)});
   }else error('Inventurfunktion wurde nicht gefunden.');
   await durable();return view(s.id);
  }
  return {init,view,handle(name,data,opt){
   if(['index','get','preview'].includes(name))return Promise.resolve(action(name,data,opt));
   const result=queue.then(()=>action(name,data,opt));queue=result.catch(()=>{});return result;
  }};
 }};
})(typeof window!=='undefined'?window:globalThis);
