'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const L=require('./v88_11_location_core.js'),SW=require('./service-worker.js');
const loc=(location,warehouse_id=1)=>({location,warehouse_id});
const row={article_id:7,article_no:'Transportband',unit:'Stk.',counted_stock:null,location:'Alter Stammdaten-Ort',warehouse_id:1,bin_parts_json:''};
const r=(parts,total)=>({...row,counted_stock:total,bin_parts_json:JSON.stringify(parts)});
test('Erstzählung nutzt den aktiven Fundort, nie den alten Stammdatenort',()=>{
 const a=L.first(row,5,loc('Fach A'));assert.deepEqual(a.parts,[{...loc('Fach A'),quantity:5}]);assert.equal(row.location,'Alter Stammdaten-Ort');
});
test('Zählung ohne aktiven Ort blockiert',()=>assert.throws(()=>L.first(row,5,null),/aktuellen Zähl-Lagerort/));
test('Neue Menge an B: gesamt 8 und A 5, B 3',()=>{
 const a=L.addition(r([{...loc('Fach A'),quantity:5}],5),3,loc('Fach B'));
 assert.equal(a.total,8);assert.deepEqual(a.parts,[{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}]);
});
test('Weiterer Fund an B addiert nur dort',()=>{
 const a=L.addition(r([{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}],8),2,loc('Fach B'));
 assert.equal(a.total,10);assert.deepEqual(a.parts.map(p=>p.quantity),[5,5]);
});
test('Bisher gezählt, aber Erstlagerort nicht eindeutig: neue Menge blockiert',()=>{
 const old={...row,counted_stock:5};assert.throws(()=>L.addition(old,3,loc('Fach B')),/Erstlagerort.*nicht sicher/);assert.equal(old.counted_stock,5);
});
test('Legacy-Erstlagerort wird ausdrücklich zugewiesen; danach darf addiert werden',()=>{
 const c=L.changeFirst({...row,counted_stock:5},loc('Fach A'));
 assert.equal(c.legacy,true);assert.equal(L.addition(r(c.parts,5),3,loc('Fach B')).total,8);
});
test('Erstlagerort-Korrektur ändert keine zweite Teilmenge',()=>{
 const old=r([{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}],8);
 const changed=L.changeFirst(old,loc('Fach C'));
 assert.deepEqual(changed.parts,[{...loc('Fach C'),quantity:5},{...loc('Fach B'),quantity:3}]);assert.equal(old.location,'Alter Stammdaten-Ort');
});
test('Erstlagerort-Korrektur zu zweitem Ort führt Mengen zusammen',()=>{
 const old=r([{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}],8);
 assert.deepEqual(L.changeFirst(old,loc('Fach B')).parts,[{...loc('Fach B'),quantity:8}]);
});
test('Erstzählung Null merkt sich dennoch den Ort',()=>{
 const first=L.first(row,0,loc('Fach A'));assert.equal(first.parts[0].quantity,0);
 const added=L.addition(r(first.parts,0),2,loc('Fach B'));assert.deepEqual(added.parts.map(p=>p.quantity),[0,2]);
});
test('Korrektur der Gesamtmenge nur bei einem Zählort erlaubt',()=>{
 const one=r([{...loc('Fach A'),quantity:5}],5);
 assert.deepEqual(L.correctTotal(one,2).parts,[{...loc('Fach A'),quantity:2}]);
 const two=r([{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}],8);
 assert.throws(()=>L.correctTotal(two,9),/mehreren Zähl-Lagerorten/);
});
test('Menge eines einzelnen Lagerortes kann unabhängig korrigiert werden',()=>{
 const two=r([{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}],8);
 const fixed=L.correctPart(two,loc('Fach B'),2);assert.equal(fixed.total,7);assert.deepEqual(fixed.parts.map(x=>x.quantity),[5,2]);
});
test('Unterschiedliche Lager-IDs erhalten separate Teilmengen',()=>{
 const a=L.addition(r([{...loc('Fach A',1),quantity:5}],5),3,loc('Fach A',2));assert.equal(a.parts.length,2);
});
test('Defekte / doppelte Teildaten werden niemals verarbeitet',()=>{
 assert.throws(()=>L.addition({...row,counted_stock:5,bin_parts_json:'defekt'},1,loc('Fach B')),/beschädigt/);
 assert.throws(()=>L.addition(r([{...loc('Fach A'),quantity:4}],5),1,loc('Fach B')),/stimmen nicht/);
});
test('Erstentwurf beim Weitertippen bindet ursprünglichen Fundort',()=>{
 L.markDraft(7,true);const saved=r([{...loc('Fach A'),quantity:1}],1);
 assert.equal(L.first(saved,12,loc('Fach B')).parts[0].location,'Fach A');L.markDraft(7,false);
});
test('Versionsdateien laden den Ortskern vor Inventur und Fokus-Schutz',()=>{
 const html=SW.injectHtml('<html><body>App<script src="inventory_ui.js"></script></body></html>');
 assert.match(html,/Lagerverwaltung V88\.19/);
 assert.ok(html.indexOf('v88_11_location_core.js?v=88.19')<html.indexOf('v87_ui.js?v=88.19'));
 assert.ok(html.indexOf('v88_11_location_core.js?v=88.19')<html.indexOf('v88_10_inventory_focus.js?v=88.19'));
 assert.ok(SW.FILES.includes('v88_11_location_core.js'));
 assert.match(SW.CACHE_NAME,/lv88-19-/);
});
test('Inventurabschluss verwendet tatsächlich gezählte positive Ortsmengen für Hauptlagerort',()=>{
 const raw="if(x.location!==x.current_location||x.warehouse_id!==x.current_warehouse_id){run('UPDATE articles SET location=?,warehouse_id=? WHERE id=?',[x.location,x.warehouse_id,x.article_id]);locations++}";
 const patched=SW.patchV8811InventoryCore(raw);assert.match(patched,/LV8811_PRIMARY_FROM_COUNT/);
 assert.match(patched,/find\(p=>p.quantity>0\)/);assert.doesNotThrow(()=>new Function('return function check(x,parseParts,run){let locations=0;'+patched+';return locations;}'));
});
test('Neue Fokusabsicherung erlaubt Tippen bis zum Verlassen der Erstzaehlung',()=>{
 const s=fs.readFileSync(__dirname+'/v88_10_inventory_focus.js','utf8');
 assert.match(s,/LV8811LocationCore\?\.isDraft/);assert.match(s,/LV8811LocationCore\.markDraft\(id,false\)/);
});
const vm=require('node:vm');
function integration(legacy=false){
 let src=fs.readFileSync(__dirname+'/test_source_inventory_ui.js','utf8');
 src=src.replace('let data=null,pending','let data=window.__mockData,pending')
  .replace('function context(){}','function context(){return window.__mockContext;}')
  .replace('function flush(){}','async function flush(){return true;}')
  .replace('function message(){}','function message(text){window.__messages.push(text)}');
 const patched=SW.patchV8811InventoryUi(src);const elements={};
 for(const id of ['inv75-count-7','inv84-add-7','inv84-result-7','inv75-location-7','inv75-warehouse-7','inv75ReviewBox','inv75Search'])
  elements[id]={id,value:'',hidden:false,readOnly:false,focus(){},select(){}};
 const initial={...row,counted_stock:legacy?5:null,location:'Fach A',base_location:'Fach A',warehouse_id:1,base_warehouse_id:1};
 const data={session:{status:'draft'},items:[initial],locations:[{name:'Fach A',warehouse_id:1},{name:'Fach B',warehouse_id:1}],default_warehouse_id:1};
 const mockContext={warehouse_id:1,location:'Fach A',apply:true};
 const doc={activeElement:null,getElementById:id=>elements[id]||null};
 const V84={countContext(_row,c,locations){if(!c.apply)return null;const found=locations.find(x=>x.name===c.location);if(!found)throw Error('Zählbereich noch nicht angelegt.');return {warehouse_id:found.warehouse_id,location:found.name}},
  addCount(old,delta){const a=Number(old||0),b=Number(delta);return {old:a,delta:b,total:a+b,wasCounted:old!==null}},quantity(value){const n=Number(String(value).replace(',','.'));if(!Number.isFinite(n))throw Error('Ungültig');return n}};
 const win={__mockData:data,__mockContext:mockContext,__messages:[],LVInventoryV84Core:V84,LVInventoryV85Core:{},LV8811LocationCore:L,LV889CountCore:require('./v88_9_count_core.js'),LV8810InventoryFocus:{isProtected:()=>false,protectAll(){}}};
 const sandbox={window:win,document:doc,console,confirm:()=>true,prompt:()=>null,clearTimeout(){},setTimeout(){}};
 vm.runInNewContext(patched,sandbox);return {inv:win.LVInventory,data,ctx:mockContext,els:elements,messages:win.__messages};
}
test('Integration: die erfassten 5 werden SOFORT zusammen mit Fach A als Entwurf gespeichert',()=>{
 const e=integration();e.inv.edit(7,'counted_stock','5');
 const got=e.data.items[0];assert.equal(got.counted_stock,'5');
 assert.equal(L.parseParts(got.bin_parts_json)[0].location,'Fach A');
 assert.equal(L.parseParts(got.bin_parts_json)[0].quantity,5);
 assert.equal(got.location,'Fach A');L.markDraft(7,false);
});
test('Integration: derselbe Artikel an Fach B addiert ohne den Erstort zu veraendern',async()=>{
 const e=integration();e.inv.edit(7,'counted_stock','5');L.markDraft(7,false);
 e.ctx.location='Fach B';e.els['inv84-add-7'].value='3';
 await e.inv.addCount(7);
 assert.equal(e.data.items[0].counted_stock,'8');
 assert.deepEqual(L.parseParts(e.data.items[0].bin_parts_json),[{...loc('Fach A'),quantity:5},{...loc('Fach B'),quantity:3}]);
 assert.equal(e.data.items[0].location,'Fach A');
});
test('Integration: historischer Erstlagerort muss vorher bestaetigt werden',async()=>{
 const e=integration(true);e.ctx.location='Fach B';e.els['inv84-add-7'].value='3';
 await e.inv.addCount(7);assert.equal(e.data.items[0].counted_stock,5);
 assert.ok(e.messages.some(x=>/Erstlagerort/.test(x)));
 e.ctx.location='Fach A';e.inv.changeFirstLocation(7);
 e.ctx.location='Fach B';await e.inv.addCount(7);
 assert.equal(e.data.items[0].counted_stock,'8');
 assert.deepEqual(L.parseParts(e.data.items[0].bin_parts_json).map(p=>[p.location,p.quantity]),[['Fach A',5],['Fach B',3]]);
});
test('Zeilenfeld zeigt NUR gespeicherten Erstlagerort und sperrt direkte Änderungen',()=>{
 const src=fs.readFileSync(__dirname+'/test_source_inventory_ui.js','utf8');
 const patched=SW.patchV8811InventoryUi(src);
 assert.match(patched,/lv11FirstPlace\?lv11FirstPlace\.location/);
 assert.match(patched,/const suggestion=LV11\.hasCount\(x\.counted_stock\)\?null/);
 assert.match(patched,/readonly title="Erstlagerort geschützt/);
 assert.match(patched,/disabled title="Erstlagerort geschützt/);
 assert.match(patched,/if\(LV11\.hasCount\(row\.counted_stock\)\)\{/);
 assert.doesNotThrow(()=>new Function(patched));
});
test('Die zwei schreibgeschützten Stammdatenfelder können nach einer Zählung nicht heimlich überschrieben werden',async()=>{
 const e=integration();e.inv.edit(7,'counted_stock','5');L.markDraft(7,false);
 await e.inv.locationChangedInline(7,'Fach B');e.inv.warehouseChanged(7,'2');
 assert.equal(e.data.items[0].location,'Fach A');
 assert.deepEqual(L.parseParts(e.data.items[0].bin_parts_json),[{...loc('Fach A'),quantity:5}]);
});
