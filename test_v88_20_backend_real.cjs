/* V88.20 backend contract test, using a COPY of the actual inventoried lager.db.
 * Executes the same JS snippets later inserted into local_backend.js. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const {DatabaseSync}=require('node:sqlite');
const source=process.argv[2];if(!source||!fs.existsSync(source))throw Error('Provide the existing inventory DB as test fixture');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lv8820-test-'));
const target=path.join(directory,'lager-test.db');fs.copyFileSync(source,target);
const db=new DatabaseSync(target);db.exec('PRAGMA foreign_keys=OFF');
let backupCount=0,auditCount=0,persistCount=0,writableCount=0,allowAdmin=true;
const run=(sql,params=[])=>{if(params.length)return db.prepare(sql).run(...params);return db.exec(sql)};
const rows=(sql,params=[])=>db.prepare(sql).all(...params);
const scalar=(sql,params=[])=>{const row=db.prepare(sql).get(...params);return row?Object.values(row)[0]:null};
const articles=()=>rows(`SELECT a.*,a.initial_stock+COALESCE((SELECT SUM(CASE WHEN m.movement_type='IN' THEN m.quantity WHEN m.movement_type='OUT' THEN -m.quantity ELSE 0 END) FROM movements m WHERE m.article_id=a.id),0) stock FROM articles a`);
const runTransaction=work=>{db.exec('BEGIN IMMEDIATE');try{const v=work();db.exec('COMMIT');return v}catch(e){db.exec('ROLLBACK');throw e}};
const ctx={rows,scalar,run,articles,runTransaction,
  adminAuthorized:async()=>allowAdmin,createBackup:async()=>{backupCount++},
  assertInventoryWritable:async()=>{writableCount++},
  audit:()=>{auditCount++},persist:async()=>{persistCount++},
  response:(v,status)=>({...v,status_code:status||200}),currentDbState:()=>({database_id:'test-db'}),
  setting:()=>'',stamp:()=>new Date().toISOString()};
const params=['p','d','opt','q',...Object.keys(ctx)];
const archiveHandler=new AsyncFunction(...params,fs.readFileSync(path.join(__dirname,'v88_20_backend_insert.txt'),'utf8')+'\nreturn null;');
const reviewHandler=new AsyncFunction(...params,fs.readFileSync(path.join(__dirname,'v88_20_review_api.txt'),'utf8')+'\nreturn null;');
const duplicateHandler=new AsyncFunction(...params,fs.readFileSync(path.join(__dirname,'v88_20_duplicate_api.txt'),'utf8')+'\nreturn null;');
const archive=(action,ids,extra={})=>archiveHandler('/api/articles/v88-20/'+action,{ids,...extra},{method:'POST'},{},...Object.values(ctx));
const review=(method,d)=>reviewHandler('/api/v88-20/pdf-review',d,{method},d,...Object.values(ctx));
const duplicate=(method,d)=>duplicateHandler('/api/v88-20/duplicate-review',d,{method},d,...Object.values(ctx));
const count=(table)=>scalar('SELECT COUNT(*) FROM '+table);
const prev={article:count('articles'),mov:count('movements'),inv:count('inventory_counts'),imports:count('import_position_results'),
 counted:Number(scalar('SELECT COUNT(*) FROM inventory_counts WHERE counted_stock IS NOT NULL')),
 sum:Number(scalar('SELECT SUM(counted_stock) FROM inventory_counts WHERE counted_stock IS NOT NULL'))};
const wrong=rows("SELECT a.id,a.article_no FROM articles a WHERE a.article_no LIKE '1%' AND EXISTS (SELECT 1 FROM articles rightNo WHERE rightNo.article_no='I'||SUBSTR(a.article_no,2)) ORDER BY a.id");
(async()=>{
 assert.equal(wrong.length,46);
 const preview=await archive('archive-preview',wrong.map(x=>x.id));
 assert.equal(preview.allowed.length,45,'45 technical false I/1 rows must be eligible');
 assert.equal(preview.blocked.length,1,'32 liters Getriebeöl must stay blocked');
 assert.equal(preview.blocked[0].article_no,'11000329');
 assert(preview.blocked[0].reasons.some(r=>r.includes('Inventur wurde bereits gezählt')));
 assert(preview.allowed.every(x=>x.technicalZeroBookings===1));
 const noOp=await archive('archive-commit',[preview.blocked[0].id],{confirmation:'ARCHIVIEREN',signature:preview.signature});
 assert.equal(noOp.archived,0);assert.equal(count('articles'),prev.article);
 let failed=false;try{await archive('archive-commit',preview.allowed.map(x=>x.id),{confirmation:'ARCHIVIEREN',signature:'tampered'})}catch(e){failed=true}
 assert(failed,'unvalidated preview signature must reject');
 assert.equal(count('inventory_counts'),prev.inv);
 const done=await archive('archive-commit',preview.allowed.map(x=>x.id),{confirmation:'ARCHIVIEREN',signature:preview.signature});
 assert.equal(done.archived,45);assert.equal(done.removedEmptyRows,45);
 assert.equal(scalar("SELECT active FROM articles WHERE article_no='11000329'"),1);
 assert.equal(Number(scalar("SELECT counted_stock FROM inventory_counts WHERE article_no='11000329' AND counted_stock IS NOT NULL")),32);
 assert.equal(count('movements'),prev.mov,'bookings must remain intact');
 assert.equal(count('import_position_results'),prev.imports,'import audit records must remain intact');
 assert.equal(count('inventory_counts'),prev.inv-45);
 assert.equal(Number(scalar('SELECT COUNT(*) FROM inventory_counts WHERE counted_stock IS NOT NULL')),prev.counted);
 assert.equal(Number(scalar('SELECT SUM(counted_stock) FROM inventory_counts WHERE counted_stock IS NOT NULL')),prev.sum);
 assert.equal(count('articles'),prev.article);
 assert.equal(Number(scalar('SELECT COUNT(*) FROM articles WHERE active=0')),45);
 const restored=await archive('archive-restore',[preview.allowed[0].id],{confirmation:'WIEDERHERSTELLEN'});
 assert.equal(restored.restored,1);assert.equal(scalar('SELECT active FROM articles WHERE id=?',[preview.allowed[0].id]),1);
 assert.equal(backupCount,2,'backup before archive and restore');assert.equal(writableCount,1);assert(auditCount>=46);assert(persistCount>=2);
 console.log('PASS real lager.db archive: 45 empty I/1 OCR records handled, 32-L count protected, no booking/history/positive count lost, backup+restore');
 const hash='a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b',key='4:5';
 let r=await review('GET',{hash});assert.equal(r.positions.length,0);
 r=await review('POST',{hash,key,article_no:'I1000329',state:'corrected',source_no:'11000329',expected_reviewed_at:''});assert.equal(r.state,'corrected');
 const previousTime=r.reviewed_at;
 r=await review('GET',{hash});assert.equal(r.positions.length,1);assert.equal(r.positions[0].article_no,'I1000329');
 let conflict=false;try{await review('POST',{hash,key,article_no:'I1000339',state:'corrected',expected_reviewed_at:''})}catch(e){conflict=true}
 assert(conflict,'stale concurrent PDF review must fail');
 r=await review('POST',{hash,key,article_no:'I1000329',state:'confirmed',expected_reviewed_at:previousTime});assert.equal(r.state,'confirmed');
 assert.equal(count('movements'),prev.mov);assert.equal(Number(scalar("SELECT counted_stock FROM inventory_counts WHERE article_no='11000329' AND counted_stock IS NOT NULL")),32);
 assert(!!scalar("SELECT name FROM sqlite_master WHERE type='table' AND name='rondo_pdf_review_v8820'"));
 console.log('PASS real lager.db PDF reviews: persisted in DB, reload, optimistic concurrency, no stock/count changed');
 let dup=await duplicate('GET',{});assert.equal(dup.pairs.length,0);
 const pair={wrong_no:'11000329',correct_no:'I1000329',state:'checked',expected_reviewed_at:'',notes:'I in der PDF bestätigt'};
 let marked=await duplicate('POST',{items:[pair]});assert.equal(marked.reviewed,1);
 dup=await duplicate('GET',{});assert.equal(dup.pairs.length,1);assert.equal(dup.pairs[0].review_state,'checked');
 let duplicateConflict=false;try{await duplicate('POST',{items:[pair]})}catch(e){duplicateConflict=true};assert(duplicateConflict);
 marked=await duplicate('POST',{items:[{...pair,state:'later',expected_reviewed_at:dup.pairs[0].reviewed_at}]});assert.equal(marked.reviewed,1);
 assert.equal(count('movements'),prev.mov);assert.equal(Number(scalar("SELECT counted_stock FROM inventory_counts WHERE article_no='11000329' AND counted_stock IS NOT NULL")),32);
 console.log('PASS separate I/1 duplicate-check state, also for blocked/count-protected entries');

 allowAdmin=false;let denied=false;try{await archive('archive-preview',[wrong[0].id])}catch(e){denied=true};assert(denied);console.log('PASS admin authorization');
 db.close();
})().catch(e=>{console.error('FAIL',e.stack||e);process.exitCode=1;try{db.close()}catch{}});
