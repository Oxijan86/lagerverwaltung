'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),SW=require('./service-worker.js'),Match=require('./v88_13_pdf_match.js'),Export=require('./v88_4_export.js');
const make=()=>`async function request(p,d,db){
const store=db.store, calls=db.calls, opt=null;
const articles=()=>store;
const publicArticle=x=>x;
const rows=(sql,args=[])=>{if(sql.includes('inventory_counts c JOIN'))return db.counts||[];if(sql.includes('FROM movements WHERE article_id'))return db.movements||[];if(sql.includes('FROM stock_bins_v86'))return db.bins||[];if(sql.includes('sqlite_master'))return [];return [];};
const scalar=(sql,args)=>0;
const tableExists=n=> n==='inventory_counts'||n==='inventory_sessions';
const response=x=>x;
const setting=()=> 'Testtechniker';
const audit=(...a)=>calls.push(['audit',...a]);
const adminAuthorized=async()=>db.admin!==false;
const createBackup=async()=>{calls.push(['backup']);};
const runTransaction=fn=>{fn();calls.push(['transaction']);};
const persist=async()=>{calls.push(['persist']);};
const stamp=()=> '2026-11-19T12:00:00';
const run=(sql,args=[])=>{calls.push(['run',sql,args]);if(sql.startsWith('UPDATE articles SET article_no')){const a=store.find(x=>x.id===args[2]);a.article_no=args[0];a.description=args[1];}if(sql.startsWith('UPDATE articles SET active=0')){const a=store.find(x=>x.id===args[1]);a.active=0;}};
const activeTechnicianNames=()=>['Testtechniker'];
let q={};
if(p==='/api/articles')return response(articles(q.q||'').map(publicArticle));
if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){
 const isCreateAndBook=p==='/api/import/create-and-book'; const newItems=Array.isArray(isCreateAndBook?d.new_items:d.items)?(isCreateAndBook?d.new_items:d.items):[];
 const technician=String(d.technician||setting('primary_technician','Techniker')).trim();const validTech=activeTechnicianNames();if(technician===setting('primary_technician','Techniker')&&!validTech.includes(technician))validTech.push(technician);if(!technician||!validTech.includes(technician))throw Error('Techniker ist nicht gültig.');
 const operationId=String(d.operation_id||'').trim();return null;
}
}`;
const src=SW.patchV8813Backend(make());
assert.doesNotThrow(()=>new Function(src));
const api=(new Function(src+'; return request'))();
const db=(stock=0,withDest=true)=>({store:[{id:17,article_no:'1100033I',description:'USB Stick',stock,initial_stock:0,active:1,unit:'Stk.',notes:''},...(withDest?[{id:22,article_no:'11000339',description:'USB-Stick zur Datensicherung',stock:1,initial_stock:1,active:1,unit:'Stk.'}]:[])],calls:[],counts:[{session_id:'sess',session_status:'draft',article_id:17,counted_stock:null,bin_parts_json:'',note:'',location:'',base_location:'',warehouse_id:null,base_warehouse_id:null}],movements:[{id:1,quantity:0,movement_type:'IN',source:'Materialanlage / CSV-SAP-Import'}],bins:[]});
const payload={source_no:'1100033I',target_no:'11000339',target_description:'USB-Stick zur Datensicherung'};
test('nachtraeglicher PDF-Importfehler mit Nullbestand: sichere Archivierung und Sicherheitsbackup',async()=>{
 const database=db();const p=await api('/api/articles/ocr-repair/preview',payload,database);
 assert.equal(p.mode,'archive');assert.equal(p.safe,true);assert.equal(p.source.id,17);assert.equal(p.target.id,22);
 const res=await api('/api/articles/ocr-repair/commit',{...payload,confirm:true,expected_mode:'archive',expected_source_id:17,expected_target_id:22},database);
 assert.equal(res.corrected,true);assert.equal(database.store[0].active,0);assert.equal(database.store[1].active,1);
 assert.equal(database.calls[0][0],'backup');assert.ok(database.calls.some(x=>x[0]==='run'&&/DELETE FROM inventory_counts/.test(x[1])));
 assert.ok(database.calls.some(x=>x[0]==='run'&&/UPDATE inventory_sessions SET version=version\+1/.test(x[1])));
 assert.ok(!database.calls.some(x=>x[0]==='run'&&/UPDATE movements|UPDATE stock_bins|DELETE FROM articles/.test(x[1])));
});
test('ohne bereits vorhandenen Zielartikel: Artikel-ID behalten und nur Nummer berichtigen',async()=>{
 const database=db(3,false);const p=await api('/api/articles/ocr-repair/preview',payload,database);assert.equal(p.mode,'rename');assert.equal(p.safe,true);
 await api('/api/articles/ocr-repair/commit',{...payload,confirm:true,expected_mode:'rename',expected_source_id:17,expected_target_id:0},database);
 assert.equal(database.store[0].id,17);assert.equal(database.store[0].article_no,'11000339');assert.equal(database.store[0].stock,3);
 assert.ok(database.calls.some(x=>x[0]==='run'&&x[1].startsWith('UPDATE inventory_counts SET article_no=')));
});
test('bestaetigte Inventurzaehlungen verhindern automatische Archivierung',async()=>{
 const database=db();database.counts[0].counted_stock=2;const p=await api('/api/articles/ocr-repair/preview',payload,database);assert.equal(p.safe,false);assert.match(p.message,/Zaehlung/);
 await assert.rejects(()=>api('/api/articles/ocr-repair/commit',{...payload,confirm:true,expected_mode:'archive',expected_source_id:17,expected_target_id:22},database));
 assert.equal(database.calls.length,0);
});
test('echte Bewegung oder Bestand verhindert stilles Zusammenfuehren',async()=>{
 const database=db(1);let p=await api('/api/articles/ocr-repair/preview',payload,database);assert.equal(p.safe,false);
 const db2=db();db2.movements.push({quantity:2,movement_type:'IN'});p=await api('/api/articles/ocr-repair/preview',payload,db2);assert.equal(p.safe,false);
});
test('Stammdaten duerfen ohne ausdrueckliche 2-Faktor-Korrekturbestaetigung nicht mutiert werden',async()=>{
 const database=db();await assert.rejects(()=>api('/api/articles/ocr-repair/commit',{...payload,confirm:true,expected_mode:'archive',expected_source_id:17,expected_target_id:23},database),/Korrekturvorschau/);
 assert.equal(database.calls.length,0);
 database.admin=false;await assert.rejects(()=>api('/api/articles/ocr-repair/commit',{...payload,confirm:true,expected_mode:'archive',expected_source_id:17,expected_target_id:22},database),/Administrator/);
 assert.equal(database.calls.length,0);
});
test('Katalogzuordnung bei abweichender Bezeichnung wird nicht automatisch bedruckt',()=>{
 const old={page:4,position:6,article_no:'11000349',description:'USB-Stick zur Datensicherung',verified:true};
 const items=[{article_no:'11000349',description:'Druckluftfilter fuer Maschinen',counted_stock:9,unit:'Stk.'},{article_no:'11000339',description:'USB-Stick zur Datensicherung',counted_stock:2,unit:'Stk.'}];
 const summary=Match.summarize([old],items);assert.equal(summary.length,1);assert.match(summary[0].kind,/Bezeichnung passt/);assert.equal(summary[0].options[0].article.article_no,'11000339');
 globalThis.LV8813PDFMatch=Match;
 const printed=Export.buildPrintData([old],{items},(s)=>Number(s));assert.equal(printed.printed,0);assert.equal(printed.uncertain.length,1);
 delete globalThis.LV8813PDFMatch;
});
