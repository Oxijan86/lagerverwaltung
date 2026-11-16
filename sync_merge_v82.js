/* Lagerverwaltung V82: konservativer Drei-Wege-Abgleich. Keine blinde Bestandsuebernahme. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVSyncMerge82=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ARTICLE_SKIP=new Set(['id','warehouse_id','machine']);
 const MOVE_SKIP=new Set(['id','article_id','sync_uuid']);
 const DETAIL_FIELDS=['movement_date','movement_type','article_no','quantity','customer','ticket','machine','machine_code','technician','vehicle','delivery_note','note','source'];
 const AUDIT_SKIP=new Set(['id','sync_uuid']);
 const AUX_TABLES=['inventory_warehouses','locations','machines','machine_aliases','machine_merge_history','technicians','vehicles','consumables','inventory_sessions','inventory_counts','stock_bins_v86','stock_bin_moves_v86','inventory_company_v86','app_settings'];
 function dbRows(db,table){
  try {const e=db.exec(`SELECT * FROM ${table}`)[0];return e?e.values.map(vals=>Object.fromEntries(e.columns.map((k,i)=>[k,vals[i]]))):[];}catch{return []}
 }
 function equal(a,b){return JSON.stringify(a)===JSON.stringify(b)}
 function plain(o,omit){if(!o)return null;const r={};Object.keys(o).filter(k=>!omit.has(k)).sort().forEach(k=>r[k]=o[k]);return r}
 function keyMap(rows,key){return Object.fromEntries(rows.map(x=>[String(key(x)),x]))}
 function normalizeMaster(rows,table,refs){
  return rows.map(row=>{
   const r={...row};delete r.id;
   if(table==='locations' && 'warehouse_id' in r){r.warehouse_name=refs.warehouses[String(r.warehouse_id)]||'';delete r.warehouse_id}
   if(table==='stock_bins_v86' || table==='stock_bin_moves_v86'){
    r.article_no=refs.articles[String(r.article_id)]||r.article_no||'';delete r.article_id;
    for(const p of ['warehouse_id','source_warehouse_id','target_warehouse_id'])if(p in r){r[p+'_name']=refs.warehouses[String(r[p])]||'';delete r[p]}
    if(table==='stock_bins_v86'){delete r.bin_key;}
   }
   if(table==='inventory_counts'){
    r.article_no=refs.articles[String(r.article_id)]||r.article_no||'';delete r.article_id;
    for(const p of ['warehouse_id','base_warehouse_id'])if(p in r){r[p+'_name']=refs.warehouses[String(r[p])]||'';delete r[p]}
   }
   if(table==='machine_aliases'){r.machine_name=refs.machines[String(r.machine_id)]||'';delete r.machine_id}
   if(table==='machine_merge_history'){
    for(const p of ['source_machine_id','target_machine_id'])if(p in r){r[p+'_name']=refs.machines[String(r[p])]||'';delete r[p]}
   }
   return r;
  }).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 }
 function ensureSchema(db){
  const sync=Object.fromEntries(dbRows(db,'sync_state').map(x=>[x.key,x.value]));
  const dbid=String(sync.database_id||'legacy');let changed=false;
  for(const [table,prefix] of [['movements','movement'],['audit_log','audit']]){
   const info=db.exec(`PRAGMA table_info(${table})`)[0];
   if(!info)continue;
   const columns=info.values.map(x=>String(x[1]));
   if(!columns.includes('sync_uuid')){db.run(`ALTER TABLE ${table} ADD COLUMN sync_uuid TEXT`);changed=true}
   for(const row of dbRows(db,table))if(!row.sync_uuid){
    db.run(`UPDATE ${table} SET sync_uuid=? WHERE id=?`,[`legacy:${dbid}:${prefix}:${row.id}`,row.id]);changed=true;
   }
   db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_v81_${table}_uuid ON ${table}(sync_uuid)`);
  }
  // V82: deletion events survive across devices, including after rows have been removed.
  db.run(`CREATE TABLE IF NOT EXISTS sync_deletions(
   event_uuid TEXT PRIMARY KEY,entity_type TEXT NOT NULL,entity_key TEXT NOT NULL,
   article_no TEXT NOT NULL DEFAULT '',customer TEXT NOT NULL DEFAULT '',
   ticket TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',
   deleted_at TEXT NOT NULL,previous_json TEXT NOT NULL DEFAULT '{}',reason TEXT NOT NULL DEFAULT '')`);
  const movementColumns=db.exec('PRAGMA table_info(movements)')[0]?.values?.map(v=>String(v[1]))||[];
  for(const col of ['ticket','machine_code'])if(!movementColumns.includes(col)){
   db.run(`ALTER TABLE movements ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`);changed=true;
  }
  return changed;
 }
 function snapshot(db){
  ensureSchema(db);
  const articles=dbRows(db,'articles'),movements=dbRows(db,'movements'),audits=dbRows(db,'audit_log');
  const aid=Object.fromEntries(articles.map(a=>[String(a.id),String(a.article_no)]));
  const warehouses=Object.fromEntries(dbRows(db,'inventory_warehouses').map(x=>[String(x.id),x.name]));
  const machineIds=Object.fromEntries(dbRows(db,'machines').map(x=>[String(x.id),x.name]));
  const refs={articles:aid,warehouses,machines:machineIds};
  const relation={};for(const x of dbRows(db,'article_machines')){
   const no=aid[String(x.article_id)],name=machineIds[String(x.machine_id)];
   if(no&&name)(relation[no]||(relation[no]=[])).push(name);
  }
  for(const arr of Object.values(relation))arr.sort();
  const ar=keyMap(articles.map(a=>({...a,warehouse_name:warehouses[String(a.warehouse_id)]||''})),a=>a.article_no),mv={};
  for(const m of movements){
   const key=String(m.sync_uuid||'');if(!key)throw Error('Buchung ohne eindeutige Sync-Kennung. Datenbank zuerst auf V81 migrieren.');
   if(mv[key])throw Error('Doppelte Sync-Kennung bei Buchungen: '+key);
   mv[key]={...m,article_no:aid[String(m.article_id)]||'',ticket:m.ticket||((m.source||'').includes('Servicebericht')?m.delivery_note:'')||''};
  }
  const al={};for(const x of audits){const key=String(x.sync_uuid||'');if(!key)throw Error('Audit-Eintrag ohne Sync-Kennung.');if(al[key])throw Error('Doppelte Audit-Kennung: '+key);al[key]=x}
  const im=keyMap(dbRows(db,'import_position_results'),x=>`${x.operation_id}\u001f${x.source}\u001f${x.position_key}`);
  const movementUuidById=Object.fromEntries(movements.map(x=>[String(x.id),x.sync_uuid]));
  for(const entry of Object.values(im))entry.movement_uuid=movementUuidById[String(entry.movement_id)]||'';
  const other={};for(const t of AUX_TABLES)other[t]=normalizeMaster(dbRows(db,t),t,refs);
  const sync=Object.fromEntries(dbRows(db,'sync_state').map(x=>[x.key,x.value]));
  const stock={};for(const [no,a] of Object.entries(ar))stock[no]=Number(a.initial_stock||0);
  for(const m of Object.values(mv))if(m.article_no)stock[m.article_no]=(stock[m.article_no]||0)+(m.movement_type==='IN'?1:-1)*Number(m.quantity||0);
  const deletions=keyMap(dbRows(db,'sync_deletions'),x=>x.event_uuid);
  return {database_id:sync.database_id||'',revision:Number(sync.revision||0),revision_id:sync.revision_id||'',articles:ar,movements:mv,audits:al,imports:im,deletions,other,relations:relation,stock,refs};
 }
 function value(a,skip){return plain(a,skip)}
 function change(before,after){if(equal(before,after))return 'equal';if(before==null)return after==null?'equal':'added';if(after==null)return 'removed';return 'modified'}
 function choiceFor(choices,k){return (choices||{})[k]||''}
 function compare(base,local,cloud,choices={}){
  if(!local||!cloud)throw Error('Lokaler und Cloud-Stand werden benötigt.');
  const result={safe:true,hasBase:!!base,issues:[],conflicts:[],articleChanges:[],movementChanges:[],auditChanges:[],importChanges:[],masterChanges:[],stockDiffs:[],deletionChanges:[],counts:{localOnly:0,cloudOnly:0,identical:0,conflicts:0}};
  if(local.database_id!==cloud.database_id || (base && base.database_id!==local.database_id)){
   result.safe=false;result.issues.push('Die Datenbank-IDs unterscheiden sich. Automatische Zusammenführung gesperrt.');return result;
  }
  if(!base){result.safe=false;result.issues.push('Die gemeinsame Ausgangsdatenbank ist auf diesem Gerät nicht vorhanden. Nur vergleichen, nicht automatisch zusammenführen.');}
  function conflict(type,id,title,lv,cv){const key=`${type}:${id}`;const selected=choiceFor(choices,key);result.conflicts.push({key,type,id,title,local:lv,cloud:cv,choice:selected,requiresChoice:true});result.counts.conflicts++;if(!['local','cloud'].includes(selected))result.safe=false;return selected}
  for(const table of AUX_TABLES){
   if(equal(local.other[table],cloud.other[table]))continue;
   const lc=base&&!equal(local.other[table],base.other[table]);
   const cc=base&&!equal(cloud.other[table],base.other[table]);
   result.masterChanges.push({table,local_changed:!!lc,cloud_changed:!!cc,local_count:local.other[table]?.length||0,cloud_count:cloud.other[table]?.length||0});
   // Die gesamte Cloud-DB bleibt Grundlage. Aenderungen auf der lokalen Seite
   // duerfen nicht durch ein stilles Merge verschwinden.
   if(lc || !base){result.safe=false;result.issues.push(`Stammdaten/Inventur „${table}“ unterscheiden sich. Bitte separat prüfen; kein automatisches Überschreiben.`)}
  }
  const numbers=new Set([...Object.keys(local.articles),...Object.keys(cloud.articles),...Object.keys(base?.articles||{})]);
  for(const no of numbers){
   const l=local.articles[no],c=cloud.articles[no],b=base?.articles[no], lk=value(l,ARTICLE_SKIP),ck=value(c,ARTICLE_SKIP),bk=value(b,ARTICLE_SKIP);
   const fields=new Set([...Object.keys(lk||{}),...Object.keys(ck||{}),...Object.keys(bk||{})]);
   if(!l||!c){
    const lc=change(bk,lk),cc=change(bk,ck);
    let action='cloud';if(lc!=='equal'&&cc==='equal')action='local';else if(lc!=='equal'&&cc!=='equal'){action=conflict('article',no,'Artikel '+no+' entfernt/neu',lk,ck)||'unresolved'};
    if(!base)action=conflict('article',no,'Artikel '+no+' ohne gemeinsame Basis',lk,ck)||'unresolved';
    if(!l&&c&&action==='local'){result.safe=false;result.issues.push(`Artikel ${no} wurde lokal gelöscht. Löschung nur mit manueller Prüfung aller Referenzen möglich.`)}
    result.articleChanges.push({article_no:no,mode:'record',action,local:l,cloud:c,base:b});continue;
   }
   for(const field of fields){
    if(['created_at'].includes(field))continue;
    const lval=lk?.[field],cval=ck?.[field],bval=bk?.[field];
    if(equal(lval,cval))continue;
    const lc=!equal(lval,bval),cc=!equal(cval,bval);
    const key=`article_field:${no}:${field}`;
    let action='cloud';if(base&&lc&&!cc)action='local';else if(base&&!lc&&cc)action='cloud';else action=conflict('article_field',`${no}:${field}`,`${no} – ${field}`,lval,cval)||'unresolved';
    result.articleChanges.push({article_no:no,field,mode:'field',action,local:lval,cloud:cval,base:bval,key});
   }
   const lm=local.relations[no]||[],cm=cloud.relations[no]||[],bm=base?.relations[no]||[];
   if(!equal(lm,cm)){
    const lc=!equal(lm,bm),cc=!equal(cm,bm);
    if(lc){result.safe=false;result.issues.push(`Maschinenzuordnung des Artikels ${no} weicht ab und muss separat geprüft werden.`)}
    if(!base)result.safe=false;
   }
  }
  // UUIDs werden als unveraenderliche Identitaeten verglichen. Gleiche lokale
  // SQLite-Zeilennummern sind ausdruecklich KEIN Nachweis gleicher Buchungen.
  for(const id of new Set([...Object.keys(local.movements),...Object.keys(cloud.movements),...Object.keys(base?.movements||{})])){
   const l=local.movements[id],c=cloud.movements[id],b=base?.movements[id],lk=value(l,MOVE_SKIP),ck=value(c,MOVE_SKIP),bk=value(b,MOVE_SKIP);
   if(equal(lk,ck)){result.counts.identical++;continue}
   let action='cloud';if(base){const lc=change(bk,lk),cc=change(bk,ck);
    if(lc!=='equal'&&cc==='equal')action='local';else if(lc!=='equal'&&cc!=='equal')action=conflict('movement',id,`Buchung ${id.slice(0,16)}`,lk,ck)||'unresolved';
   }else action=conflict('movement',id,`Buchung ${id.slice(0,16)} (ohne Basis)`,lk,ck)||'unresolved';
   if(l&&!c)result.counts.localOnly++;if(!l&&c)result.counts.cloudOnly++;
   result.movementChanges.push({id,local:l,cloud:c,base:b,action});
  }
  for(const id of new Set([...Object.keys(local.audits),...Object.keys(cloud.audits),...Object.keys(base?.audits||{})])){
   const l=local.audits[id],c=cloud.audits[id],b=base?.audits[id];if(equal(value(l,AUDIT_SKIP),value(c,AUDIT_SKIP)))continue;
   const lc=change(value(b,AUDIT_SKIP),value(l,AUDIT_SKIP)),cc=change(value(b,AUDIT_SKIP),value(c,AUDIT_SKIP));
   const action=base&&lc!=='equal'&&cc==='equal'?'local':base&&lc==='equal'?'cloud':conflict('audit',id,'Audit '+id.slice(0,16),l,c)||'unresolved';
   result.auditChanges.push({id,local:l,cloud:c,base:b,action});
  }
  for(const id of new Set([...Object.keys(local.imports),...Object.keys(cloud.imports),...Object.keys(base?.imports||{})])){
   const l=local.imports[id],c=cloud.imports[id],b=base?.imports[id];
   // Lokale Integer-IDs koennen unterschiedlich sein. Fachlich relevant sind
   // Operation/Position, Status, Artikelnummer und Menge.
   const norm=x=>x?{article_no:x.article_no,quantity:x.quantity,status:x.status,movement_uuid:x.movement_uuid||''}:null;
   if(l&&c&&l.status==='booked'&&c.status==='booked'&&l.movement_uuid&&c.movement_uuid&&l.movement_uuid!==c.movement_uuid){result.safe=false;result.issues.push(`Doppelimport-Risiko für Position ${id.slice(0,70)}. Die Buchungen müssen einzeln abgeglichen werden.`)}
   if(equal(norm(l),norm(c)))continue;
   const lc=change(norm(b),norm(l)),cc=change(norm(b),norm(c));
   let action=base&&lc!=='equal'&&cc==='equal'?'local':base&&lc==='equal'?'cloud':conflict('import',id,'Import '+id.slice(0,50),norm(l),norm(c))||'unresolved';
   result.importChanges.push({id,local:l,cloud:c,base:b,action});
  }
  for(const id of new Set([...Object.keys(local.deletions||{}),...Object.keys(cloud.deletions||{})])){
   const l=local.deletions?.[id],c=cloud.deletions?.[id];
   if(!l&&c)result.deletionChanges.push({id,local:null,cloud:c,action:'cloud'});
   if(l&&!c)result.deletionChanges.push({id,local:l,cloud:null,action:'local'});
   if(l&&c&&!equal(l,c)){result.safe=false;result.issues.push('Widersprüchliches Löschprotokoll: '+id)}
  }
  for(const no of new Set([...Object.keys(local.stock),...Object.keys(cloud.stock)])){
   const lv=local.stock[no]??null,cv=cloud.stock[no]??null;
   if(lv!==cv)result.stockDiffs.push({article_no:no,local:lv,cloud:cv});
  }
  return result;
 }
 function insertRow(db,table,row,exclude=['id']){
  const keys=Object.keys(row).filter(k=>!exclude.includes(k)&&(table==='articles'||k!=='article_no')&&k!=='movement_uuid');
  const sql=`INSERT INTO ${table} (${keys.map(k=>'"'+k+'"').join(',')}) VALUES (${keys.map(()=>'?').join(',')})`;
  db.run(sql,keys.map(k=>row[k]));
 }
 function apply({SQL,localBytes,cloudBytes,baseBytes,choices={}}){
  const l=new SQL.Database(localBytes),c=new SQL.Database(cloudBytes),base=baseBytes?new SQL.Database(baseBytes):null;
  let merged;
  try{
   const ls=snapshot(l),cs=snapshot(c),bs=base?snapshot(base):null;
   const plan=compare(bs,ls,cs,choices);
   if(!plan.safe)throw Error('Keine sichere automatische Zusammenführung möglich: '+[...plan.issues,...plan.conflicts.filter(x=>!x.choice).map(x=>x.title)].slice(0,5).join('; '));
   merged=new SQL.Database(cloudBytes);ensureSchema(merged);
   merged.run('PRAGMA foreign_keys=OFF');merged.run('BEGIN TRANSACTION');
   try{
    const findArticle=no=>dbRows(merged,'articles').find(a=>a.article_no===no);
    const articleId=no=>findArticle(no)?.id;
    const getWh=name=>dbRows(merged,'inventory_warehouses').find(x=>x.name===name)?.id||null;
    for(const a of plan.articleChanges.filter(x=>x.mode==='record'&&x.action==='local')){
     const old=findArticle(a.article_no);
     if(!a.local){if(old)throw Error('Artikellöschung wird bei parallelen Buchungen nicht automatisch übernommen: '+a.article_no);continue}
     if(old)throw Error('Artikel existiert bereits: '+a.article_no);
     const row={...a.local};delete row.id;
     const wh=ls.refs.warehouses[String(row.warehouse_id)]||'';delete row.warehouse_name;
     row.warehouse_id=wh?getWh(wh):null;
     if(wh&&!row.warehouse_id)throw Error('Lager nicht vorhanden: '+wh);
     insertRow(merged,'articles',row,[]);
     const aid=articleId(a.article_no);
     for(const name of ls.relations[a.article_no]||[]){const match=dbRows(merged,'machines').find(m=>m.name===name);if(!match)throw Error('Maschine fehlt: '+name);merged.run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,match.id])}
    }
    for(const x of plan.articleChanges.filter(x=>x.mode==='field'&&x.action==='local')){
     if(x.field==='initial_stock'&&plan.movementChanges.some(m=>(m.local?.article_no||m.cloud?.article_no)===x.article_no))throw Error('Anfangsbestand und Buchungen desselben Artikels gleichzeitig geändert; bitte manuell prüfen.');
     if(x.field==='warehouse_name'){const wid=x.local?getWh(x.local):null;if(x.local&&!wid)throw Error('Lager fehlt: '+x.local);merged.run('UPDATE articles SET warehouse_id=? WHERE article_no=?',[wid,x.article_no]);continue}
     merged.run(`UPDATE articles SET "${x.field}"=? WHERE article_no=?`,[x.local,x.article_no]);
    }
    for(const change of plan.movementChanges.filter(x=>x.action==='local')){
     const existing=dbRows(merged,'movements').find(x=>x.sync_uuid===change.id);
     if(!change.local){if(existing){
       const old={...existing,article_no:dbRows(merged,'articles').find(a=>a.id===existing.article_id)?.article_no||''};
       merged.run('INSERT OR IGNORE INTO sync_deletions(event_uuid,entity_type,entity_key,article_no,customer,ticket,machine,deleted_at,previous_json,reason) VALUES(?,?,?,?,?,?,?,?,?,?)',
        ['merge:movement:'+change.id,'movement',change.id,old.article_no,old.customer||'',old.ticket||old.delivery_note||'',old.machine||'',new Date().toISOString(),JSON.stringify(old),'Aus Konfliktvergleich übernommen']);
       merged.run('DELETE FROM movements WHERE sync_uuid=?',[change.id]);
      }continue}

     const aid=articleId(change.local.article_no);if(!aid)throw Error('Buchung verweist auf fehlenden Artikel: '+change.local.article_no);
     if(existing){const x={...change.local,article_id:aid};for(const col of Object.keys(x).filter(k=>!['id','article_no','sync_uuid'].includes(k)))merged.run(`UPDATE movements SET "${col}"=? WHERE sync_uuid=?`,[x[col],change.id]);}
     else{insertRow(merged,'movements',{...change.local,article_id:aid},['id']);}
    }
    for(const change of plan.deletionChanges.filter(x=>x.action==='local')){
     const e=change.local;
     if(!e)continue;
     merged.run('INSERT OR IGNORE INTO sync_deletions(event_uuid,entity_type,entity_key,article_no,customer,ticket,machine,deleted_at,previous_json,reason) VALUES(?,?,?,?,?,?,?,?,?,?)',
       [e.event_uuid,e.entity_type,e.entity_key,e.article_no,e.customer,e.ticket,e.machine,e.deleted_at,e.previous_json,e.reason]);
    }
    for(const change of plan.auditChanges.filter(x=>x.action==='local')){
     if(!change.local)continue;
     const exists=dbRows(merged,'audit_log').some(x=>x.sync_uuid===change.id);
     if(!exists){const audit={...change.local};if(audit.entity==='Artikel'&&audit.entity_id){const no=ls.refs.articles[String(audit.entity_id)];if(no)audit.entity_id=String(articleId(no)||audit.entity_id)}else if(audit.entity==='Buchung'&&audit.entity_id){const old=Object.values(ls.movements).find(m=>String(m.id)===String(audit.entity_id));if(old)audit.entity_id=String(dbRows(merged,'movements').find(m=>m.sync_uuid===old.sync_uuid)?.id||audit.entity_id)}insertRow(merged,'audit_log',audit,['id'])}
    }
    for(const change of plan.importChanges.filter(x=>x.action==='local')){
     if(!change.local)continue;
     const x={...change.local};x.article_id=articleId(x.article_no)||0;
     if(x.movement_uuid){x.movement_id=dbRows(merged,'movements').find(m=>m.sync_uuid===x.movement_uuid)?.id||0;if(!x.movement_id)throw Error('Importverknüpfung auf eine fehlende Buchung: '+change.id);}
     merged.run(`INSERT INTO import_position_results(operation_id,source,position_key,article_no,article_id,movement_id,quantity,status,created_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(operation_id,source,position_key) DO UPDATE SET article_no=excluded.article_no,article_id=excluded.article_id,movement_id=excluded.movement_id,quantity=excluded.quantity,status=excluded.status`,[x.operation_id,x.source,x.position_key,x.article_no,x.article_id,x.movement_id,x.quantity,x.status,x.created_at]);
    }
    const issues=merged.exec('PRAGMA integrity_check');if(!issues[0]||issues[0].values[0][0]!=='ok')throw Error('Zusammengeführte SQLite-Datenbank ist beschädigt.');
    for(const a of dbRows(merged,'articles')){
     const stock=Number(a.initial_stock||0)+dbRows(merged,'movements').filter(m=>Number(m.article_id)===Number(a.id)).reduce((sum,m)=>sum+(m.movement_type==='IN'?1:-1)*Number(m.quantity),0);
     if(stock<-0.000001)throw Error(`Negativer Bestand nach Zusammenführung: ${a.article_no}`);
    }
    merged.run('COMMIT');merged.run('PRAGMA foreign_keys=ON');
    const fk=merged.exec('PRAGMA foreign_key_check');if(fk[0]?.values?.length)throw Error('Fremdschlüsselprüfung der zusammengeführten Datenbank fehlgeschlagen.');
    return {bytes:merged.export(),plan};
   }catch(err){try{merged.run('ROLLBACK')}catch{}throw err}
  }finally{l.close();c.close();base?.close();merged?.close()}
 }

 // An archived branch may be reviewed and cherry-picked later. The current database
 // must still match the archived opposite side for each selected change. This is not
 // last-write-wins; unrelated newer bookings remain intact.
 function normalizeMovement(m){return value(m,MOVE_SKIP)}
 function recoveryPreview(source,current,other){
  if(source.database_id!==current.database_id||other.database_id!==current.database_id)
   return {blocked:true,reason:'Unterschiedliche Datenbanken dürfen nicht automatisch vermischt werden.',rows:[]};
  const rows=[];
  for(const id of new Set([...Object.keys(source.movements),...Object.keys(other.movements)])){
   const wanted=source.movements[id],before=other.movements[id];
   if(equal(normalizeMovement(wanted),normalizeMovement(before)))continue;
   const now=current.movements[id];
   const kind=!wanted?'delete':!before?'restore':'edit';
   const changedFields=kind==='edit'?DETAIL_FIELDS.filter(k=>!equal(wanted?.[k],before?.[k])):[];
   const conflicts=kind==='restore'?Boolean(now&&!equal(normalizeMovement(now),normalizeMovement(wanted)))||Boolean((current.deletions&&Object.values(current.deletions).some(x=>x.entity_type==='movement'&&x.entity_key===id)))
    :kind==='delete'?Boolean(now&&!equal(normalizeMovement(now),normalizeMovement(before)))
    :!now||changedFields.some(field=>!equal(now[field],before?.[field])&&!equal(now[field],wanted?.[field]));
   rows.push({key:'movement:'+id,id,kind,article_no:wanted?.article_no||before?.article_no||'',customer:wanted?.customer||before?.customer||'',ticket:wanted?.ticket||before?.ticket||'',machine:wanted?.machine||before?.machine||'',local:wanted||null,opposite:before||null,current:now||null,changedFields,blocked:conflicts,reason:conflicts?'Zwischenzeitlich verändert oder bereits gelöscht – zuerst manuell prüfen.':''});
  }
  for(const no of new Set([...Object.keys(source.articles),...Object.keys(other.articles)])){
   const a=source.articles[no],b=other.articles[no],now=current.articles[no];
   if(!a||!b){if(!equal(a,b))rows.push({key:'article:'+no,article_no:no,kind:a?'article_add':'article_delete',blocked:true,reason:'Artikelanlage/-löschung mit referenzierten Buchungen erfordert eine eigene Prüfung.',local:a||null,opposite:b||null});continue}
   for(const field of new Set([...Object.keys(a),...Object.keys(b)])){
    if(['id','warehouse_id','warehouse_name','machine','created_at'].includes(field)||equal(a[field],b[field]))continue;
    const blocked=!now||(!equal(now[field],b[field])&&!equal(now[field],a[field]));
    rows.push({key:'article_field:'+no+':'+field,article_no:no,kind:'article_field',field,local:a[field],opposite:b[field],current:now?.[field],blocked,reason:blocked?'Der aktuelle Wert hat sich seit dem Archiv geändert.':''});
   }
  }
  return {blocked:false,rows,counts:{ready:rows.filter(x=>!x.blocked).length,blocked:rows.filter(x=>x.blocked).length}};
 }
 function recover({SQL,currentBytes,sourceBytes,otherBytes,selected=[],details={}}){
  const current=new SQL.Database(currentBytes),source=new SQL.Database(sourceBytes),other=new SQL.Database(otherBytes);
  try{
   const state=snapshot(current),src=snapshot(source),op=snapshot(other),preview=recoveryPreview(src,state,op);
   if(preview.blocked)throw Error(preview.reason);
   const requested=[...new Set(selected.map(String))];
   if(!requested.length)throw Error('Bitte mindestens eine Änderung auswählen.');
   const candidates=requested.map(key=>{
    const row=preview.rows.find(x=>x.key===key);
    if(!row)throw Error('Änderung ist im Archiv nicht mehr eindeutig vorhanden: '+key);
    if(row.blocked)throw Error('Änderung ist nicht sicher übertragbar: '+key+' – '+row.reason);
    return row;
   });
   current.run('BEGIN TRANSACTION');let applied=0,already=0;
   try{
    for(const row of candidates){
     const setting=details[row.key]||{};
     if(row.kind==='restore'){
      let wanted={...row.local,...(setting.fields||{})};
      if(state.movements[row.id]){already++;continue}
      const art=dbRows(current,'articles').find(a=>a.article_no===wanted.article_no);
      if(!art)throw Error('Artikel für wiederherzustellende Buchung fehlt: '+wanted.article_no);
      if(!['IN','OUT'].includes(wanted.movement_type)||!(Number(wanted.quantity)>0))throw Error('Ungültige Wiederherstellungsmenge.');
      wanted.article_id=art.id;
      insertRow(current,'movements',wanted,['id']);
      const inserted=dbRows(current,'movements').find(x=>x.sync_uuid===row.id);
      // Preserve import duplicate-protection and link the restored booking to its new local ID.
      for(const imp of Object.values(src.imports).filter(x=>x.movement_uuid===row.id)){
       const old=dbRows(current,'import_position_results').find(x=>x.operation_id===imp.operation_id&&x.source===imp.source&&x.position_key===imp.position_key);
       if(old&&old.status==='booked'&&old.movement_id!==inserted.id)throw Error('Ein anderer Import wurde bereits für dieselbe Position gespeichert. Nachübernahme gesperrt.');
       current.run(`INSERT OR IGNORE INTO import_position_results(operation_id,source,position_key,article_no,article_id,movement_id,quantity,status,created_at) VALUES(?,?,?,?,?,?,?,?,?)`,
        [imp.operation_id,imp.source,imp.position_key,imp.article_no,art.id,inserted.id,imp.quantity,imp.status,imp.created_at]);
      }
      applied++;
     }else if(row.kind==='delete'){
      const existing=dbRows(current,'movements').find(x=>x.sync_uuid===row.id);
      if(!existing){already++;continue}
      const base=normalizeMovement(state.movements[row.id]);
      if(!equal(base,normalizeMovement(row.opposite)))throw Error('Buchung vor dem Löschen verändert: '+row.id);
      const event='archive:movement:'+row.id+':'+String(row.key);
      current.run('INSERT OR IGNORE INTO sync_deletions(event_uuid,entity_type,entity_key,article_no,customer,ticket,machine,deleted_at,previous_json,reason) VALUES(?,?,?,?,?,?,?,?,?,?)',
       [event,'movement',row.id,row.article_no,existing.customer||'',existing.ticket||existing.delivery_note||'',existing.machine||'',new Date().toISOString(),JSON.stringify(row.opposite),'Nachträglich aus Konfliktarchiv übernommen']);
      current.run('DELETE FROM movements WHERE sync_uuid=?',[row.id]);applied++;
     }else if(row.kind==='edit'){
      const existing=dbRows(current,'movements').find(x=>x.sync_uuid===row.id);
      if(!existing)throw Error('Zu korrigierende Buchung fehlt: '+row.id);
      const now=state.movements[row.id];
      const choice=Array.isArray(setting.fieldsToTake)?setting.fieldsToTake:row.changedFields;
      if(!choice.length){already++;continue}
      for(const field of choice){
       if(!row.changedFields.includes(field))throw Error('Unzulässiges Änderungsfeld: '+field);
       let valueNew=(setting.values||{})[field]??row.local[field];
       if(field==='quantity'){
        valueNew=Number(valueNew);
        if(!Number.isFinite(valueNew)||valueNew<=0)throw Error('Ungültige Buchungsmenge. Bitte eine Zahl größer als 0 eingeben.');
       }
       if(field==='movement_type'&&!['IN','OUT'].includes(valueNew))throw Error('Ungültige Buchungsart.');
       if(field==='movement_date'&&!/^\d{4}-\d{2}-\d{2}$/.test(String(valueNew)))throw Error('Ungültiges Buchungsdatum.');
       if(!equal(now[field],row.opposite[field])&&!equal(now[field],valueNew))throw Error('Neue Änderung im aktuellen Datenstand: '+field);
       if(field==='article_no'){
        const art=dbRows(current,'articles').find(a=>a.article_no===valueNew);if(!art)throw Error('Artikelnummer unbekannt: '+valueNew);
        current.run('UPDATE movements SET article_id=? WHERE sync_uuid=?',[art.id,row.id]);
       }else if(field!=='created_at'){current.run('UPDATE movements SET "'+field+'"=? WHERE sync_uuid=?',[valueNew,row.id]);}
      }applied++;
     }else if(row.kind==='article_field'){
      const now=dbRows(current,'articles').find(a=>a.article_no===row.article_no);if(!now)throw Error('Artikel fehlt.');
      let newVal=setting.value??row.local;
      if(['initial_stock','target_stock','minimum_stock'].includes(row.field)){
       newVal=Number(newVal);
       if(!Number.isFinite(newVal)||newVal<0)throw Error('Ungültiger Bestand/Mindestbestand für '+row.article_no);
      }
      if(!equal(now[row.field],row.opposite)&&!equal(now[row.field],newVal))throw Error('Artikelstammdaten inzwischen geändert: '+row.field);
      current.run('UPDATE articles SET "'+row.field+'"=? WHERE article_no=?',[newVal,row.article_no]);applied++;
     }
    }
    for(const a of dbRows(current,'articles')){
     const stock=Number(a.initial_stock||0)+dbRows(current,'movements').filter(m=>m.article_id===a.id).reduce((sum,m)=>sum+(m.movement_type==='IN'?1:-1)*Number(m.quantity),0);
     if(stock < -1e-8)throw Error('Negativer Bestand bei '+a.article_no+' – Übernahme abgebrochen.');
    }
    const ok=current.exec('PRAGMA integrity_check');if(ok[0]?.values?.[0]?.[0]!=='ok')throw Error('Datenbankprüfung nach Übernahme fehlgeschlagen.');
    current.run('COMMIT');return {bytes:current.export(),applied,already,preview};
   }catch(e){try{current.run('ROLLBACK')}catch{};throw e}
  }finally{current.close();source.close();other.close()}
 }
 return {snapshot,compare,apply,dbRows,ensureSchema,DETAIL_FIELDS,recoveryPreview,recover};
});
