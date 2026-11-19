const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const C=require('./v88_9_count_core.js');
const sw=require('./service-worker.js');
const A={article_id:42,article_no:'11006138',unit:'Stk.',counted_stock:5,warehouse_id:1,location:'Fach A',bin_parts_json:'',stock_bins:[]};
const qty=(old,delta)=>({old,delta,total:old+delta,wasCounted:true});
const loc=(location,warehouse_id=1)=>({location,warehouse_id});
test('bereits gezählte 5 an A, weitere 3 an B: 8 und zwei separate Lagerorte',()=>{
 const p=C.plan(A,qty(5,3),loc('Fach B'));assert.equal(p.total,8);
 assert.deepEqual(p.parts,[{warehouse_id:1,location:'Fach A',quantity:5},{warehouse_id:1,location:'Fach B',quantity:3}]);
});
test('Fortsetzung an B erhöht nur B und behält A',()=>{
 const row={...A,counted_stock:8,bin_parts_json:JSON.stringify([{warehouse_id:1,location:'Fach A',quantity:5},{warehouse_id:1,location:'Fach B',quantity:3}])};
 const p=C.plan(row,qty(8,2),loc('Fach B'));assert.equal(p.total,10);assert.deepEqual(p.parts.map(x=>x.quantity),[5,5]);
});
test('andere Lager-ID mit gleichem Lagerort ist separate Zuordnung',()=>{
 const p=C.plan(A,qty(5,3),loc('Fach A',2));assert.equal(p.parts.length,2);
});
test('bereits gezählt Null ist gezählt und neue Menge wird addiert',()=>{
 const p=C.plan({...A,counted_stock:0},qty(0,7),loc('Fach B'));assert.equal(p.total,7);assert.equal(p.parts[0].location,'Fach B');
});
test('Neuer Artikel ohne bisherigen Zählstand übernimmt gewählten Zählort',()=>{
 const p=C.plan({...A,counted_stock:null,location:'',warehouse_id:null},{old:0,delta:2,total:2},loc('Schublade C'));
 assert.deepEqual(p.parts,[{warehouse_id:1,location:'Schublade C',quantity:2}]);
});
test('Unbekannter früherer Lagerort wird nicht auf neuen umgeschrieben',()=>{
 const p=C.plan({...A,location:'',warehouse_id:null},qty(5,1),loc('Schublade C'));
 assert.equal(p.parts[0].location,'');assert.equal(p.parts[0].quantity,5);
});
test('ohne Lagerort bleibt Erfassung eines einzigen Bestands möglich',()=>{
 const p=C.plan({...A,location:'',warehouse_id:null},qty(5,1),null);
 assert.equal(p.parts.length,0);assert.equal(p.total,6);
});
test('mehrere vorhandene Teile erfordern ausdrücklichen Zählbereich',()=>{
 const row={...A,stock_bins:[{location:'Fach A'},{location:'Fach B'}]};
 assert.throws(()=>C.plan(row,qty(5,1),null),/mehrere Lagerorte/);
});
test('mehrere bisherige Zählorte erfordern Standortauswahl',()=>{
 const row={...A,counted_stock:8,bin_parts_json:JSON.stringify([{location:'Fach A',warehouse_id:1,quantity:5},{location:'Fach B',warehouse_id:1,quantity:3}])};
 assert.throws(()=>C.plan(row,qty(8,1),null),/mehrere Lagerorte/);
});
test('beschädigte / widersprüchliche Teilzählungen werden gesperrt',()=>{
 assert.throws(()=>C.plan({...A,bin_parts_json:'gar kein json'},qty(5,1),loc('Fach A')),/beschädigt/);
 assert.throws(()=>C.plan({...A,bin_parts_json:'[{"location":"Fach A","quantity":4}]'},qty(5,1),loc('Fach B')),/passen nicht/);
});
test('keine Null/Negativ-Addition',()=>{
 assert.throws(()=>C.plan(A,qty(5,0),loc('Fach A')),/Ungültig/);
 assert.throws(()=>C.plan(A,qty(5,-2),loc('Fach A')),/Ungültig/);
});
test('Bei erster gezählter Null kann alter Ort bestehen, ohne Mengenverlust',()=>{
 const p=C.plan({...A,counted_stock:0},qty(0,2),loc('Fach B'));
 assert.equal(p.parts.length,1);assert.equal(p.parts[0].location,'Fach B');
});
test('String-Entscheidung: 0 zählt als bereits gezählt',()=>{
 assert.equal(C.hasCount(0),true);assert.equal(C.hasCount('0'),true);assert.equal(C.hasCount(null),false);assert.equal(C.hasCount(''),false);
});
test('V88.10 injectHtml lädt Zählmodul vor PDF-UI',()=>{
 const html=sw.injectHtml('<html><body><p>App</p></body></html>');
 assert.ok(html.includes('v88_9_count_core.js?v=88.10'));assert.ok(html.indexOf('v88_9_count_core.js?v=88.10')<html.indexOf('v87_ui.js?v=88.10'));
});
test('V88.10 Patch für Inventur UI ersetzt nur eindeutige API-Blöcke',()=>{
 const fixture=`function renderRow(x,disabled,esc){return \`<input value="\${esc(x.counted_stock??'')}" \${disabled} oninput="change()"><button type="button" class="secondary" onclick="LVInventory.confirmCount(\${x.article_id})">✓ Bestätigen & weiter</button>\${x.bin_parts_json?\`<small>\${esc(x.bin_parts_json)}</small>\`:''}\`;}
 window.LVInventory={
  addBinPart(id){ oldPart(); },
  updateReferences(refs){},
  addCount(id){ oldAdd(); },
  edit(id,field,value){},
  async confirmCount(id){},
 };`;
 const patched=sw.patchV889InventoryUi(fixture);
 assert.ok(patched.includes('LV889_INVENTORY_ADD'));assert.ok(patched.includes('window.LV889CountCore.plan'));
 assert.ok(patched.includes('async addCount(id)'));
 assert.equal(patched.includes('oldAdd()'),false);
 assert.ok(patched.includes('updateReferences(refs)'));
 assert.doesNotThrow(()=>new Function(patched));
});
test('V88.10 Patch für PDF-Suchauswahl unterscheidet Erst- und Mehrfachzählung',()=>{
 const src=`function select(){requestAnimationFrame(()=>{$('inv75-count-'+row.article_id)?.focus();$('inv75-count-'+row.article_id)?.select();})}`;
 const out=sw.patchV889Focus(src);assert.ok(out.includes("'inv84-add-'"));assert.ok(out.includes("'inv75-count-'"));
 assert.ok(out.includes('LV889_EXISTING_FOCUS'));
});
test('V88.10 Service Worker lädt Inventory-Modul und patcht den Pfad',()=>{
 assert.ok(sw.FILES.includes('v88_9_count_core.js'));
 assert.equal(sw.CACHE_NAME.startsWith('lv88-10-'),true);
});

test('Version V88.10 wird in App, Manifest und Hilfe angezeigt',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const root=__dirname;
 assert.match(fs.readFileSync(path.join(root,'v88_ocr.js'),'utf8'),/el\.textContent='88\.10'/);
 assert.match(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'),/V88\.10/);
 assert.match(fs.readFileSync(path.join(root,'v88_4_help.js'),'utf8'),/Mehrfachzählung und mehrere Lagerorte \(V88\.10\)/);
});
