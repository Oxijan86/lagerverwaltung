'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs');
const SW=require('./service-worker.js'),Bulk=require('./v88_17_bulk_core.js'),Match=require('./v88_13_pdf_match.js');
const samples=[
 {id:1,article_no:'I1000339',description:'USB-Stick zur Datensicherung',stock:3,active:1,unit:'Stk.'},
 {id:2,article_no:'11000339',description:'USB-Stick zur Datensicherung',stock:0,active:1,unit:'Stk.'},
 {id:3,article_no:'I1000214',description:'Filzband 2650 x 635 mm',stock:1,active:1,unit:'Stk.'},
 {id:4,article_no:'11000214',description:'Filzband 2650 x 635 mm',stock:0,active:1,unit:'Stk.'},
 {id:5,article_no:'I1000055',description:'Sensor',stock:0,active:1,unit:'Stk.'},
 {id:6,article_no:'11000055',description:'Sensor mit Kabel',stock:0,active:1,unit:'Stk.'}
];
const inventory=[
 {article_id:1,article_no:'I1000339',description:samples[0].description,counted_stock:2,stock:3,unit:'Stk.'},
 {article_id:2,article_no:'11000339',description:samples[1].description,counted_stock:null,stock:0,unit:'Stk.'},
 {article_id:3,article_no:'I1000214',description:samples[2].description,counted_stock:1,stock:1,unit:'Stk.'},
 {article_id:4,article_no:'11000214',description:samples[3].description,counted_stock:null,stock:0,unit:'Stk.'}
];
test('V88.17 registriert beide Sammelmodule in Abhaengigkeitsreihenfolge',()=>{
 const a=SW.ADDONS||[];const p=SW.injectHtml('<html><body><script src="inventory_ui.js"></script></body></html>');
 assert.ok(p.includes('v88_17_bulk_core.js?v=88.17'));assert.ok(p.includes('v88_17_bulk_ui.js?v=88.17'));
 assert.ok(p.indexOf('v88_17_bulk_core.js?v=88.17')<p.indexOf('v88_17_bulk_ui.js?v=88.17'));
 assert.ok(p.indexOf('v88_17_bulk_ui.js?v=88.17')<p.indexOf('v88_4_export.js?v=88.17'));
 assert.ok(SW.FILES.includes('v88_17_bulk_core.js')&&SW.FILES.includes('v88_17_bulk_ui.js'));
 assert.ok(fs.readFileSync('./v88_4_export.js','utf8').includes('LV8817BulkUI.mount'));
});
test('Sicherheit: gleichlautende I/1-Artikel werden aufgefuehrt, abweichende Bezeichnungen markiert',()=>{
 const pairs=Bulk.pairs(samples,inventory);assert.equal(pairs.length,3);
 assert.equal(pairs.find(p=>p.numberI==='I1000339').nameSame,true);
 assert.equal(pairs.find(p=>p.numberI==='I1000055').nameSame,false);
 assert.equal(pairs.find(p=>p.numberI==='I1000339').countI,2);
 assert.equal(pairs.find(p=>p.numberI==='I1000339').stockI,3);
});
test('Sammelzuordnung blockiert Fall mit einer bereits falschen Quelle mit gezaehltem Wert',()=>{
 const row={page:4,position:6,article_no:'11000339',description:'USB-Stick zur Datensicherung',verified:true,key:'4:6'};
 const p=Bulk.proposals([row],inventory);assert.equal(p.length,1);assert.equal(p[0].target,'I1000339');assert.equal(p[0].sourceCount,null);assert.equal(p[0].selectable,true);
 const swapped=inventory.map(i=>({...i}));swapped[0].counted_stock=null;swapped[1].counted_stock=2;
 const blocked=Bulk.proposals([row],swapped);assert.equal(blocked[0].selectable,false);assert.match(blocked[0].status,/NICHT VERSCHIEBEN/);
});
test('Abweichende Bezeichnung und doppelt vergebene Zielnummer werden nicht gesammelt umhaengt',()=>{
 const mismatch=Bulk.proposals([{page:4,position:1,key:'4:1',article_no:'11000339',description:'Zahnriemen',verified:true}],inventory);
 assert.equal(mismatch.length,0);
 const rows=[{page:4,position:1,key:'4:1',article_no:'11000339',description:samples[0].description,verified:true},{page:4,position:2,key:'4:2',article_no:'I1000339',description:samples[0].description,verified:true}];
 assert.equal(Bulk.proposals(rows,inventory).length,0);
 const rows2=[{page:4,position:1,key:'4:1',article_no:'11000339',description:samples[0].description,verified:true},{page:4,position:2,key:'4:2',article_no:'11000339',description:samples[0].description,verified:true}];
 const p=Bulk.proposals(rows2,inventory);assert.equal(p.length,2);assert.ok(p.every(x=>!x.selectable));
});
test('Sammelzuteilung aendert nur Kopien des PDF-Positionskatalogs, niemals inventarische Zahlen',()=>{
 const original=[{page:4,position:6,key:'4:6',article_no:'11000339',description:samples[1].description,verified:true},{page:7,position:1,key:'7:1',article_no:'11000214',description:samples[3].description,verified:true}];
 const proposed=Bulk.proposals(original,inventory);assert.equal(proposed.length,2);
 const after=original.map(r=>({...r}));for(const p of proposed)Match.assign(after,p.key,p.article,()=>true);
 assert.deepEqual(after.map(r=>r.article_no),['I1000339','I1000214']);
 assert.deepEqual(original.map(r=>r.article_no),['11000339','11000214']);
 assert.equal(inventory[0].counted_stock,2);assert.equal(inventory[2].counted_stock,1);
});
test('Massnahmen für Stammdaten greifen nur auf vorhandene sichere Vorschau-API mit Backup zurueck',()=>{
 const code=fs.readFileSync('./v88_17_bulk_ui.js','utf8');
 assert.match(code,/ocr-repair\/preview/);assert.match(code,/ocr-repair\/commit/);
 assert.match(code,/result\.safe|latest\.safe/);assert.match(code,/expected_source_id/);
 assert.match(code,/root\.confirm/);assert.match(code,/Sicherheitsbackup|Sicherheitsprüfung|Sicherheitspruefung/i);
 assert.doesNotMatch(code,/DELETE FROM articles|UPDATE articles SET|UPDATE inventory_counts SET/);
});
test('Bereits in der OCR-Import-Prüftabelle gibt es Sammelabgleich mit atomarem Vorab-Test',()=>{
 const src=fs.readFileSync('./v88_3_review.js','utf8');
 assert.match(src,/LV8817_IMPORT_BULK_I1/);
 assert.match(src,/I\/1: \$\{pairs\.length\}/);
 assert.match(src,/const draft=rows\.map\(x=>\(\{\.\.\.x\}\)\)/);
 assert.match(src,/for\(const p of pairs\)adopt\(draft\[p\.i\]/);
 assert.match(src,/for\(const p of pairs\)Object\.assign\(rows\[p\.i\],draft\[p\.i\]\)/);
 assert.match(src,/runUpdate\(\)/);
});
test('Referenzlisten-Dubletten nicht alleine wegen I/1 als nachgewiesene Fehlartikel deklarieren',()=>{
 const p=Bulk.pairs(samples,inventory);
 const inconsistent=p.find(x=>x.numberI==='I1000055');
 assert.equal(inconsistent.nameSame,false);
 // Auch ein 0-Lagerartikel wird nicht unbesehen zur Loeschung markiert.
 assert.ok(fs.readFileSync('./v88_17_bulk_ui.js','utf8').includes('Sicherheitsprüfung für alle Paare'));
 assert.ok(fs.readFileSync('./v88_17_bulk_ui.js','utf8').includes('!pair.nameSame'));
});
