(function(root){'use strict';root.LVServicePDFBackend={create(d){
 const C=root.LVServicePDFCore,{run,rows,transaction,articles,persist,audit,stamp,backup,guard,databaseId,validate,book,wholeUnit}=d,previews=new Map();let queue=Promise.resolve(),retryDatabase='';
 function init(){run(`CREATE TABLE IF NOT EXISTS service_pdf_imports(file_hash TEXT NOT NULL,content_hash TEXT NOT NULL,position_key TEXT NOT NULL,filename TEXT NOT NULL,ticket TEXT NOT NULL DEFAULT '',article_id INTEGER NOT NULL,movement_id INTEGER NOT NULL,quantity REAL NOT NULL,snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(file_hash,position_key))`);run('CREATE INDEX IF NOT EXISTS service_pdf_content ON service_pdf_imports(content_hash,position_key)')}
 async function hash(value){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 function previous(doc,key){return rows('SELECT * FROM service_pdf_imports WHERE (file_hash=? OR content_hash=?) AND position_key=?',[doc.file_hash,doc.content_hash,key])[0]||null}
 function get(p){const v=previews.get(String(p.preview_id||''));if(!v)throw Error('PDF-Vorschau ist nicht mehr verfügbar. Bitte die Berichte erneut einlesen.');if(v.database_id!==databaseId()||p.database_id&&p.database_id!==databaseId())throw Error('Die Lagerdatei wurde gewechselt. Bitte die PDFs für diese Lagerdatei erneut einlesen.');return v}
 function view(v){const catalog=articles().filter(a=>a.active).map(a=>({id:a.id,article_no:a.article_no,description:a.description,stock:Number(a.stock),unit:a.unit}));return {preview_id:v.id,database_id:v.database_id,durable:retryDatabase!==v.database_id,catalog,documents:v.documents.map(doc=>({...doc,items:doc.items.map(x=>({...x,processed:!!previous(doc,x.position_key),previous:previous(doc,x.position_key)}))}))}}
 async function preview(p){
  if(!Array.isArray(p.documents)||p.documents.length<1||p.documents.length>20)throw Error('Bitte 1 bis 20 PDF-Berichte auswählen.');
  const expected=p.database_id||databaseId();if(expected!==databaseId())throw Error('Die Lagerdatei wurde gewechselt. Bitte die PDFs erneut einlesen.');
  const documents=[],seen=new Set();
  for(const source of p.documents){
   if(!/^[a-f0-9]{64}$/.test(source.file_hash||''))throw Error('PDF-Dateikennung fehlt. Bitte erneut einlesen.');
   if(seen.has(source.file_hash))continue;seen.add(source.file_hash);
   if(!Array.isArray(source.pages)||source.pages.some(p=>!Array.isArray(p.items)||p.items.length>30000||p.items.some(x=>String(x.str||'').length>5000)))throw Error('PDF-Inhalt ist zu umfangreich oder ungültig.');
   const parsed=C.parseDocument(source);if(parsed.items.length>2000)throw Error('Ein Bericht enthält mehr als 2000 Materialpositionen. Bitte aufteilen.');
   documents.push({file_hash:source.file_hash,content_hash:await hash(parsed.canonical),filename:String(source.filename||'Servicebericht.pdf').slice(0,240),metadata:parsed.metadata,items:parsed.items,excluded:parsed.excluded,warnings:parsed.warnings,dates:parsed.dates,table_count:parsed.table_count});
  }
  if(expected!==databaseId())throw Error('Die Lagerdatei wurde während des Einlesens gewechselt. Bitte erneut einlesen.');
  const id=crypto.randomUUID(),v={id,database_id:databaseId(),documents};while(previews.size>=4)previews.delete(previews.keys().next().value);previews.set(id,v);return view(v);
 }
 function prepare(v,p){
  if(p.reviewed!==true)throw Error('Bitte die Vorschau prüfen und die Prüfung bestätigen.');
  if(!Array.isArray(p.items)||!p.items.length||p.items.length>4000)throw Error('Bitte mindestens eine gültige Materialposition auswählen.');
  const catalog=articles(),seen=new Set(),plans=[],grouped=new Map(),metadata=new Map((Array.isArray(p.documents)?p.documents:[]).map(x=>[x.file_hash,x]));let already=0;
  for(const patch of p.items){
   const doc=v.documents.find(x=>x.file_hash===patch.file_hash),source=doc?.items.find(x=>x.position_key===patch.position_key);if(!doc||!source)throw Error('Eine Materialposition gehört nicht zu dieser PDF-Vorschau.');
   const key=doc.file_hash+':'+source.position_key;if(seen.has(key))throw Error('Eine PDF-Position wurde doppelt ausgewählt.');seen.add(key);
   if(previous(doc,source.position_key)){already++;continue}
   const no=String(patch.article_no||'').trim(),a=catalog.find(a=>a.active&&a.article_no===no);if(!a)throw Error(`Artikel „${no}“ ist nicht aktiv im Lager vorhanden. Bitte Artikelnummer korrigieren oder diese Position abwählen.`);
   const quantity=C.quantity(patch.quantity);if(quantity===null)throw Error(`Ungültige Entnahmemenge für ${no}.`);
   if(wholeUnit(a.unit)&&!Number.isInteger(quantity))throw Error(`Für ${no} sind nur ganze Stückzahlen zulässig. Die PDF-Menge wird nicht gerundet.`);
   const u=C.unit(patch.unit);if(!u||C.norm(u)!==C.norm(C.unit(a.unit)))throw Error(`Einheit für ${no} passt nicht zum Lager (${a.unit}). Bitte prüfen; es erfolgt keine automatische Umrechnung.`);
   if(C.serviceReason(no,a.description,u))throw Error('Zeit-, Kilometer- und Kostenpositionen können nicht als Materialentnahme gebucht werden.');
   const meta=metadata.get(doc.file_hash)||{},movement_date=C.date(patch.movement_date||meta.movement_date||source.movement_date);if(!movement_date)throw Error(`Leistungsdatum für ${no} fehlt oder ist ungültig.`);
   const customer=C.clean(meta.customer??doc.metadata.customer),machine=C.clean(meta.machine??doc.metadata.machine),ticket=C.clean(meta.ticket??doc.metadata.ticket);if(!customer)throw Error(`Kunde für ${doc.filename} fehlt. Bitte ergänzen.`);
   if(customer.length>300||machine.length>300||ticket.length>100||String(p.note||'').length>2000)throw Error('Kunden-, Maschinen- oder Bemerkungsangabe ist zu lang.');
   const plan={doc,source,article_id:a.id,article_no:a.article_no,quantity,unit:u,movement_date,customer,machine,ticket};plans.push(plan);grouped.set(a.id,{article_id:a.id,article_no:a.article_no,quantity:(grouped.get(a.id)?.quantity||0)+quantity});
  }
  if(plans.length)validate([...grouped.values()],'OUT',{technician:p.technician});
  return {plans,already};
 }
 async function commit(p){
  const v=get(p);await guard();
  const recovered=retryDatabase===v.database_id;if(recovered){await persist(false);retryDatabase=''}
  let prepared=prepare(v,p);if(!prepared.plans.length)return {...view(v),count:0,already_processed:prepared.already,no_change:true,recovered};
  await backup('Sicherheitsbackup','Vor Servicebericht-PDF-Entnahme');await guard();prepared=prepare(v,p);
  transaction(()=>{
   for(const x of prepared.plans){
    const note=[p.note||'',`RONDO-Servicebericht: ${x.doc.filename}`,x.ticket?`Ticket ${x.ticket}`:'',`PDF-Seite ${x.source.page}`,x.source.ocr?'Per OCR erkannt und geprüft':''].filter(Boolean).join('\n');
    const movement=book([{article_id:x.article_id,article_no:x.article_no,quantity:x.quantity,position_key:x.source.position_key}],'OUT',{technician:p.technician,movement_date:x.movement_date,customer:x.customer,machine:x.machine,delivery_note:x.ticket,source:'RONDO-Servicebericht PDF',note})[0];
    run('INSERT INTO service_pdf_imports(file_hash,content_hash,position_key,filename,ticket,article_id,movement_id,quantity,snapshot_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',[x.doc.file_hash,x.doc.content_hash,x.source.position_key,x.doc.filename,x.ticket,x.article_id,movement.id,x.quantity,JSON.stringify({original:x.source,booked:{article_no:x.article_no,quantity:x.quantity,unit:x.unit,movement_date:x.movement_date,customer:x.customer,machine:x.machine}}),stamp()]);
   }
   audit(p.technician||'Techniker','PDF-ENTNAHME','Servicebericht',v.id,`${prepared.plans.length} Materialpositionen aus geprüften RONDO-PDFs entnommen.`);
  });
  retryDatabase=v.database_id;await persist();retryDatabase='';return {...view(v),count:prepared.plans.length,already_processed:prepared.already,no_change:false};
 }
 return {init,handle(action,p){if(action==='preview')return preview(p);if(action==='refresh')return Promise.resolve(view(get(p)));if(action!=='commit')throw Error('PDF-Importfunktion wurde nicht gefunden.');const result=queue.then(()=>commit(p));queue=result.catch(()=>{});return result}};
}}})(typeof window!=='undefined'?window:globalThis);
