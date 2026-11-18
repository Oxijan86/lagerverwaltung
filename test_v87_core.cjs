const test=require('node:test');const assert=require('node:assert/strict');
const C=require('./v87_core.js');
const PAGE1=`Inventurbeleg 100021289 Geschaftsjahr 2026
Pos. Material Charge LOrt Lagerplatz
1 11006138 1025
Sicherungsklemme SP = 10mm (Nicht) Fr
Noch nicht gezahlt ST
2 11006489 1025
Transportband (Nicht) Fr
Noch nicht gezahlt ST
3 11006544 1025
Antriebswelle kpl. fur Band III (Nicht) Fr
Noch nicht gezahlt ST
4 11006630 1025
Exzenter rechts (Nicht) Fr
Noch nicht gezahlt ST
5 11006631 1025
Exzenter links (Nicht) Fr
Noch nicht gezahlt ST
6 (1006632 1025
Bolzen zu Exzenter (Nicht) Fr
Noch nicht gezahlt ST
7 11006633 1025
Hebel (Nicht) Fr
Noch nicht gezahlt ST
8 11006634 1025
Hebel (Nicht) Fr
Noch nicht gezahlt ST
9 11006635 1025
Welle (Nicht) Fr
Noch nicht gezahlt ST
10 11006636 1025
Bundbuchse (Nicht) Fr
Noch nicht gezahlt ST`;
const PAGE72=`Inventurbeleg 100021490 Geschaftsjahr 2026
41 5040 1025
Rastbolzen (Nicht) Fr
Noch nicht gezahlt ST
2 5103 1025
Rollenhalter (Nicht) Fr
Noch nicht gezahlt ST
3 5105 1025
Führung (Nicht) Fr
Noch nicht gezahlt ST
5 5349 1025
Dämpfungstülle (Nicht) Fr
Noch nicht gezahlt ST
6 6157 1025
Tüllengehäuse (Nicht) Fr
Noch nicht gezahlt ST
7 6908 1025
6kt-Mutter M12x0.8d verzinkt (Nicht) Fr
Noch nicht gezahlt ST
8 6986 1025
Distanzscheibe (Nicht) Fr
Noch nicht gezahlt ST
9 7000 1025
Scheibe ohne Fase (Nicht) Fr
Noch nicht gezahlt ST`;
test('RONDO OCR detects 10 numbered slots on first page',()=>{const x=C.parseOcrPage(PAGE1,1);assert.equal(x.beleg,'100021289');assert.equal(x.positions.length,10);assert.equal(x.positions[0].article_no,'11006138');assert.equal(x.positions[0].description,'Sicherungsklemme SP = 10mm');assert.equal(x.positions[1].counted_stock,null)});
test('Scan errors are explicitly marked – never invented',()=>{const x=C.parseOcrPage(PAGE1,1);const row=x.positions.find(r=>r.position===6);assert.ok(row);assert.equal(row.verified,false);assert.ok(row.warning)});
test('Page 72 missing codes remain open rather than being filled with invented articles',()=>{const x=C.parseOcrPage(PAGE72,72);assert.ok(x.positions.length<9);assert.ok(x.warnings.length)});
test('Uncounted differs from explicitly counted zero',()=>{const x=C.countStats([{article_no:'101'},{article_no:'102'}],{items:[{article_no:'101',counted_stock:0,base_stock:3},{article_no:'102',counted_stock:null,base_stock:8}]});assert.deepEqual([x.done,x.unknown,x.diff],[1,1,1])});
test('Both kinds of list-only materials identified',()=>{const pdf=[{key:'1:1',article_no:'1100'},{key:'1:2',article_no:'2200'}],app=[{article_no:'2200',stock:4},{article_no:'3300',stock:6}];const d=C.compare(pdf,app);assert.equal(d.firmOnly[0].article_no,'1100');assert.equal(d.appOnly[0].article_no,'3300');assert.equal(d.matched.length,1)});
test('A duplicate article number in PDF is not silently merged',()=>{const c=C.compare([{key:'1:1',article_no:'1000'},{key:'2:3',article_no:'1000'}],[]);assert.equal(c.duplicate.length,1)});
test('Part-quantity transfer does not exceed source',()=>{const rows=[{id:1,article_no:'1234',quantity:20,unit:'Stk.'},{id:2,article_no:'5678',quantity:8,unit:'Stk.'}];assert.deepEqual(C.validateTransfer([{bin_id:1,quantity:4},{bin_id:2,quantity:2}],rows).map(x=>x.quantity),[4,2]);assert.throws(()=>C.validateTransfer([{bin_id:1,quantity:21}],rows));assert.throws(()=>C.validateTransfer([{bin_id:1,quantity:0}],rows))});
test('No double allocation of the same source bin',()=>{assert.throws(()=>C.validateTransfer([{bin_id:2,quantity:2},{bin_id:2,quantity:2}],[{id:2,article_no:'X111',quantity:10,unit:'Stk.'}]))});
test('Stück quantities must be integers; meters may be decimal',()=>{assert.throws(()=>C.normCount('1,5','Stk.'));assert.equal(C.normCount('1,5','m'),1.5);assert.equal(C.normCount('0','Stk.'),0)});
