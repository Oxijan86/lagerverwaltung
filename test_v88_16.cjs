'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),SW=require('./service-worker.js');
const Guard=require('./v88_16_export_guard.js'),Match=require('./v88_13_pdf_match.js');
const Export=require('./v88_4_export.js'),Pdf=require('./v88_6_pdf.js'),catalog=require('./v88_2_catalog.js');
const inputPdf='/mnt/data/Inventurliste Lovrencic 1025.pdf';
const wrong={article_id:625,article_no:'I1000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:2,stock:3,active:1};
const right={article_id:767,article_no:'11000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:null,stock:0,active:1};
const reference=catalog.pages().flatMap(p=>p.positions);
const lines=reference.map(r=>({...r,verified:!!r.verified}));
const target=lines.find(r=>r.page===4&&r.position===6);
const copied=()=>lines.map(r=>r===target?{...r,article_no:'I1000339',verified:true}: {...r});
const inventory=()=>({session:{id:'save1',status:'draft',version:2},database_id:'same-db',items:[{...wrong},{...right}]});
test('V88.18: Export-Schutzmodul wird geladen und der alte Rasterweg nicht mehr ungehindert angeklickt',()=>{
 const html=SW.injectHtml('<html><body><script src="inventory_ui.js"></script></body></html>');
 assert.ok(html.indexOf('v88_6_pdf.js?v=88.18')<html.indexOf('v88_16_export_guard.js?v=88.18'));
 assert.ok(html.indexOf('v88_4_export.js?v=88.18')<html.indexOf('v88_16_export_guard.js?v=88.18'));
 assert.ok(html.includes('v88_11_location_core.js?v=88.18'));
 assert.ok(SW.FILES.includes('v88_16_export_guard.js'));
 assert.match(fs.readFileSync('./v88_16_export_guard.js','utf8'),/stopImmediatePropagation/);
 assert.match(fs.readFileSync('./v88_16_export_guard.js','utf8'),/LV884Export\.run/);
});
test('Fehlerhafte Ausgabe enthaelt nur ein Bild statt der vier Originalbilder und weniger Bytes',()=>{
 const wrongPdf='/mnt/data/RONDO_Inventur_2026_ausgefuellt.pdf';if(!fs.existsSync(wrongPdf))return;
 const raw=fs.readFileSync(wrongPdf),origin=fs.readFileSync(inputPdf);
 assert.ok(raw.length<origin.length);assert.notEqual(raw.subarray(0,512).toString(),origin.subarray(0,512).toString());
});
test('Datenbank-Sicherung: falsch angelegte I-Nummer hat gezaehlte Menge, richtige 1-Nummer nicht',()=>{
 // This fixture reproduces the material relation verified from the uploaded database.
 assert.equal(wrong.counted_stock,2);assert.equal(right.counted_stock,null);assert.equal(wrong.stock,3);
 const row=copied().find(x=>x.page===4&&x.position===6);
 const summary=Match.summarize([row],[wrong,right],{referenceRows:reference});
 assert.equal(summary.length,1);
 assert.match(summary[0].kind,/OCR-Katalog/);
 assert.equal(summary[0].reference_no,'11000339');
 assert.equal(summary[0].options[0].article.article_no,'I1000339','Der bereits gezaehlte, exakt passende I-Artikel muss bei OCR-I/1 vor dem neu angelegten 11-Artikel stehen');
});

test('Original-PDF mit Buchstabe I: bestehender gezaehlter Artikel wird manuell bestaetigt, ohne Umlagerung',()=>{
 const row=copied().find(x=>x.page===4&&x.position===6);const rr=[row];
 const originalInventory=inventory();
 Match.assign(rr,'4:6',wrong,()=>true);
 const result=Export.buildPrintData(rr,originalInventory,v=>v,{referenceRows:reference});
 assert.equal(row.article_no,'I1000339');assert.equal(row.manual_link,true);
 assert.equal(result.printed,1);assert.equal(result.quantities['4:6'],2);
 assert.equal(originalInventory.items[0].counted_stock,2);
 assert.equal(originalInventory.items[1].counted_stock,null);
});

test('Ohne manuelle Freigabe wird weder die unberechtigte I-Menge noch ein falscher exakter OCR-Treffer gedruckt',()=>{
 const row=copied().find(x=>x.page===4&&x.position===6);
 const result=Export.buildPrintData([row],inventory(),v=>v,{referenceRows:reference});
 assert.equal(result.printed,0);assert.equal(result.uncertain.length,1);
});
test('Explizite manuelle PDF-Zuordnung plus bestaetigte Zaehlungs-Uebertragung fuellt USB korrekt',()=>{
 const row=copied().find(x=>x.page===4&&x.position===6);const rr=[row];
 Match.assign(rr,'4:6',right,()=>true);
 const inv=inventory();inv.items[0].counted_stock=null;inv.items[1].counted_stock=2; // simuliert gesicherte Transaktion
 const result=Export.buildPrintData(rr,inv,v=>v,{referenceRows:reference});
 assert.equal(result.printed,1);assert.equal(result.quantities['4:6'],2);
 assert.equal(row.ocr_original_no,'I1000339');assert.equal(row.article_no,'11000339');
});
test('Referenzpruefung: selbst bei formell gueltiger Nummer mit falscher Artikelbeschreibung kein Druck',()=>{
 const row={...target,article_no:'11000349',verified:true,description:'USB-Stick zur Datensicherung'};
 const inv={items:[{article_no:'11000349',description:'Filter',counted_stock:5,unit:'Stk.'},{...right,counted_stock:2}]};
 assert.equal(Export.buildPrintData([row],inv,v=>v,{referenceRows:reference}).printed,0);
});
test('Manuelle PDF-Zuordnung darf eine, nicht mehrere Positionen veraendern',()=>{
 const rows=copied();let proposed=rows.map(x=>({...x}));
 const i=proposed.findIndex(r=>r.page===4&&r.position===6);
 Match.assign(proposed,'4:6',right,()=>true);
 assert.equal(Guard.changedRows(rows,proposed).length,1);
 const j=proposed.findIndex(r=>r.page===4&&r.position===7);proposed[j].article_no='99999';
 assert.throws(()=>Guard.changedRows(rows,proposed),/genau eine/);
});
test('Ungepruefte/fremde Original-PDF wird sicher abgelehnt',()=>{
 const rows=reference;
 assert.throws(()=>Guard.validateSnapshot({hash:'wrong',bytes:new Uint8Array(3256940),edited:rows}),/Originaldatei/);
 assert.throws(()=>Guard.validateSnapshot({hash:Guard.SAFE_SHA,bytes:new Uint8Array(300),edited:rows}),/Original-PDF fehlt/);
});
test('OCR-Transfer Endpoint ist transaktional, macht Backup und ruft keine Lagerbestands-Buchung auf',()=>{
 const source='function demo(x){if(x.location!==x.current_location||x.warehouse_id!==x.current_warehouse_id){run(\'UPDATE articles SET location=?,warehouse_id=? WHERE id=?\',[x.location,x.warehouse_id,x.article_id]);locations++}}\n'+
  'async function action(name,d){const s=draft(d);\n   if(name===\'company-import\'){return null;}\n   if(name===\'save\'){transaction(()=>{for(const x of changes)run(\'UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=?,bin_parts_json=? WHERE session_id=? AND article_id=?\',[x.quantity,x.location,x.warehouse_id,x.note,x.partsRaw,s.id,x.article_id]);touch(s.id)});} return null;}';
 const patched=SW.patchV8816InventoryCore(source);
 assert.match(patched,/LV8816_TRANSFER_COUNT/);
 assert.match(patched,/await backup\('Sicherheitsbackup'/);
 assert.match(patched,/acknowledge_stock_unmoved/);
 assert.match(patched,/await durable\(\);return view\(s\.id\)/);
 const sub=patched.slice(patched.indexOf('/* LV8816_TRANSFER_COUNT */'),patched.indexOf("if(name==='company-import')"));
 assert.doesNotMatch(sub,/UPDATE articles SET|UPDATE movements SET|DELETE FROM articles|book\(/);
 assert.doesNotThrow(()=>new Function(patched));
});

test('Integrierter OCR-Zaehlertransfer: echte Transaktion verschiebt exakt 2 Stk, bewahrt Buchbestaende und macht Backup',async()=>{
 const source="function demo(x){if(x.location!==x.current_location||x.warehouse_id!==x.current_warehouse_id){run('UPDATE articles SET location=?,warehouse_id=? WHERE id=?',[x.location,x.warehouse_id,x.article_id]);locations++}}\n"+
  "async function action(name,d){const s=draft(d);\n   if(name==='company-import'){return null;}\n   if(name==='save'){transaction(()=>{for(const x of changes)run('UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=?,bin_parts_json=? WHERE session_id=? AND article_id=?',[x.quantity,x.location,x.warehouse_id,x.note,x.partsRaw,s.id,x.article_id]);touch(s.id)});} return null;}";
 const patched=SW.patchV8816InventoryCore(source);
 let version=17,backups=0,undos=0,persists=0,auditCount=0;
 const records=[{session_id:'session1',article_id:625,article_no:'I1000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:2,location:'Fahrzeug / Sortimo',warehouse_id:1,note:'',bin_parts_json:JSON.stringify([{location:'Fahrzeug / Sortimo',warehouse_id:1,quantity:2}])},
  {session_id:'session1',article_id:767,article_no:'11000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:null,location:'',warehouse_id:null,base_location:'',note:'',bin_parts_json:''}];
 const stocks=[{id:625,active:1,stock:3,article_no:'I1000339'},{id:767,active:1,stock:0,article_no:'11000339'}];
 const read=(sql,params)=>sql.startsWith('SELECT * FROM inventory_counts')?records.filter(r=>r.session_id===params[0]&&r.article_id===params[1]):[];
 const run=(sql,args)=>{
  if(sql.startsWith('UPDATE inventory_counts SET counted_stock=?,location=')){
   const found=records.find(r=>r.article_id===args[6]);assert.ok(found);
   Object.assign(found,{counted_stock:args[0],location:args[1],warehouse_id:args[2],note:args[3],bin_parts_json:args[4]});
  }else if(sql.startsWith('UPDATE inventory_counts SET counted_stock=NULL')){
   const found=records.find(r=>r.article_id===args[2]);Object.assign(found,{counted_stock:null,bin_parts_json:''});
  }else throw Error('Unexpected database write: '+sql);
 };
 const error=message=>{throw Error(message)};
 const fn=new Function('draft','rows','articles','count','parseParts','validLocation','backup','transaction','run','touch','audit','durable','view','error','changes','locations',patched+'\nreturn action;')(
  d=>{if(d.version!==version)throw Error('Version conflict');return {id:d.id,status:'draft',name:'Inventur 12.11.2026',technician:'Techniker'};},
  read,()=>stocks,
  (v,unit)=>{assert.equal(unit,'Stk.');return Number(v)},
  s=>s?JSON.parse(s):[],()=>{},
  async()=>{backups++},fn=>{fn()},run,()=>version++,()=>auditCount++,async()=>persists++,()=>({items:records.map(x=>({...x})),session:{version}}),error,[],{length:0}
 );
 const payload={id:'session1',version:17,database_id:'same-db',source_article_id:625,target_article_id:767,source_no:'I1000339',target_no:'11000339',expected_count:2,confirm:true,acknowledge_stock_unmoved:true};
 await assert.rejects(()=>fn('ocr-transfer-count',{...payload,version:16}),/Version conflict/);
 assert.equal(backups,0);
 const out=await fn('ocr-transfer-count',payload);
 assert.equal(out.items[0].counted_stock,null);assert.equal(out.items[1].counted_stock,2);
 assert.equal(out.items[1].location,'Fahrzeug / Sortimo');assert.equal(backups,1);assert.equal(auditCount,1);assert.equal(persists,1);
 assert.equal(stocks[0].stock,3);assert.equal(stocks[1].stock,0);
 assert.equal(version,18);
 await assert.rejects(()=>fn('ocr-transfer-count',{...payload,version:18}),/Quellmenge muss gezaehlt/);
 assert.equal(backups,1);
});

test('Original-PDF ist als echte 72-seitige Originaldaten-PDF erhalten (kein Neu-Raster)',{skip:!fs.existsSync(inputPdf)},async()=>{
 const raw=new Uint8Array(fs.readFileSync(inputPdf));
 const row={page:4,position:6,key:'4:6',article_no:'I1000339',description:'USB-Stick zur Datensicherung',verified:false};
 Match.assign([row],'4:6',right,()=>true);
 const inv=inventory();inv.items[0].counted_stock=null;inv.items[1].counted_stock=2;
 const b=Export.buildPrintData([row],inv,v=>v,{referenceRows:reference});
 const output=await Pdf.render(raw,[row],b.quantities,()=>{},()=>false,{counter:'Tester',date:'19.11.2026'});
 const actual=new Uint8Array(await output.arrayBuffer());
 assert.ok(actual.byteLength>raw.length+1000);
 assert.equal(Buffer.compare(Buffer.from(actual.subarray(0,raw.length)),Buffer.from(raw)),0);
 // Output file for external PDF visual verification; no user-specific inventory overwritten.
 if(process.env.RONDO_TEST_OUTPUT)fs.writeFileSync(process.env.RONDO_TEST_OUTPUT,actual);
});
