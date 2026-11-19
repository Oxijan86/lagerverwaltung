'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sw=require('./service-worker.js');
const core=require('./v88_9_count_core.js');
function mockEnvironment(){
 const listeners={};
 const items=[
  {article_id:11,article_no:'111111',counted_stock:5,unit:'Stk.',location:'Fach A',warehouse_id:1,stock_bins:[],bin_parts_json:''},
  {article_id:12,article_no:'121212',counted_stock:null,unit:'Stk.',location:'',warehouse_id:null,stock_bins:[],bin_parts_json:''},
  {article_id:13,article_no:'131313',counted_stock:0,unit:'Stk.',location:'Fach A',warehouse_id:1,stock_bins:[],bin_parts_json:''}
 ];
 const els={},doc={readyState:'complete',body:{},activeElement:null,
  addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn)},
  getElementById:id=>els[id]||null,
  querySelectorAll:selector=>selector==='input[id^="inv75-count-"]'?Object.values(els).filter(x=>/^inv75-count-/.test(x.id)):[],
  dispatch(type,target,more={}){
   const ev={target,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true},...more};
   for(const fn of listeners[type]||[]){fn(ev);if(ev.stopped)break}
   return ev;
  }
 };
 function input(id,value=''){
  const el={id,value,readOnly:false,disabled:false,hidden:false,dataset:{},attributes:{},
   focus(){if(doc.activeElement&&doc.activeElement!==el)doc.dispatch('focusout',doc.activeElement);doc.activeElement=el;doc.dispatch('focusin',el)},
   select(){el.wasSelected=true},setAttribute(k,v){el.attributes[k]=v},
   getAttribute(k){return el.attributes[k]||null}};
  els[id]=el;return el;
 }
 const originals=[input('inv75-count-11','5'),input('inv75-count-12',''),input('inv75-count-13','0')];
 const add=[input('inv84-add-11'),input('inv84-add-12'),input('inv84-add-13')];
 const location=input('inv84Location','Fach B'),warehouse=input('inv84Warehouse','1'),apply=input('inv84Apply');apply.checked=false;
 const ctxCalls=[];
 const inv={current:()=>({items}),contextToggle(){ctxCalls.push('saved')},approved:true,correctTotal(id){if(this.approved){const field=doc.getElementById('inv75-count-'+id);field.readOnly=false;field.focus()}}};
 const win={document:doc,LVInventory:inv,MutationObserver:class{observe(){}}};
 const code=fs.readFileSync(path.join(__dirname,'v88_10_inventory_focus.js'),'utf8');
 require('node:vm').runInNewContext(code,{window:win,globalThis:win,console});
 return {doc,win,items,originals,add,location,warehouse,apply,ctxCalls,api:win.LV8810InventoryFocus};
}
test('alle 3 vorhandenen Zaehlfeldvarianten: 5/leer/0',()=>{
 const e=mockEnvironment();
 e.originals[0].focus();assert.equal(e.doc.activeElement,e.add[0]);assert.equal(e.originals[0].readOnly,true);
 e.originals[1].focus();assert.equal(e.doc.activeElement,e.originals[1]);assert.equal(e.originals[1].readOnly,false);
 e.originals[2].focus();assert.equal(e.doc.activeElement,e.add[2]);assert.equal(e.originals[2].readOnly,true);
});
test('alte Suche fokussiert gezählt: Runtime faengt Fokus sicher ab',()=>{
 const e=mockEnvironment();
 function oldSelect(){e.originals[0].focus();e.originals[0].select()}
 oldSelect();assert.equal(e.doc.activeElement.id,'inv84-add-11');assert.equal(e.originals[0].value,'5');
});
test('versehentliche Eingabe in bisherige Menge wird abgefangen und wiederhergestellt',()=>{
 const e=mockEnvironment();
 const before=e.doc.dispatch('beforeinput',e.originals[0]);assert.equal(before.prevented,true);
 e.originals[0].value='77';const after=e.doc.dispatch('input',e.originals[0]);
 assert.equal(after.stopped,true);assert.equal(e.originals[0].value,'5');assert.equal(e.doc.activeElement,e.add[0]);
});
test('Gesamtmenge bewusst freigeben und nach Verlassen wieder schreibschuetzen',()=>{
 const e=mockEnvironment();
 e.win.LVInventory.correctTotal(11);
 assert.equal(e.api.isProtected(11),false);assert.equal(e.originals[0].readOnly,false);
 e.originals[0].focus();assert.equal(e.doc.activeElement,e.originals[0]);
 e.originals[0].value='8';e.items[0].counted_stock='8';e.add[0].focus();
 assert.equal(e.api.isProtected(11),true);assert.equal(e.originals[0].readOnly,true);
});
test('abgebrochene Gesamtmengen-Korrektur behaelt Eingabeschutz',()=>{
 const e=mockEnvironment();e.win.LVInventory.approved=false;
 e.win.LVInventory.correctTotal(11);
 assert.equal(e.api.isProtected(11),true);assert.equal(e.originals[0].readOnly,true);
 e.originals[0].focus();assert.equal(e.doc.activeElement,e.add[0]);
});
test('gewaehlter neuer Zaehlort aktiviert automatische Verteilung ohne extra Checkbox',()=>{
 const e=mockEnvironment();
 e.doc.dispatch('change',e.location);
 assert.equal(e.apply.checked,true);assert.deepEqual(e.ctxCalls,['saved']);
});
test('weiterer Fund in anderem Lagerort addiert, aendert den alten Lagerort nicht',()=>{
 const row={article_id:11,article_no:'111111',unit:'Stk.',counted_stock:5,location:'Fach A',warehouse_id:1,bin_parts_json:'',stock_bins:[]};
 const p=core.plan(row,{old:5,delta:3,total:8,wasCounted:true},{warehouse_id:1,location:'Fach B'});
 assert.deepEqual(p.parts,[{warehouse_id:1,location:'Fach A',quantity:5},{warehouse_id:1,location:'Fach B',quantity:3}]);
 assert.equal(p.total,8);
 const next=core.plan({...row,counted_stock:8,bin_parts_json:JSON.stringify(p.parts)},
  {old:8,delta:2,total:10,wasCounted:true},{warehouse_id:1,location:'Fach B'});
 assert.deepEqual(next.parts.map(x=>x.quantity),[5,5]);
});
test('Quell-Patch erhaelt Mengenlogik und aktiviert Lagerort automatisch',()=>{
 const fixture=`function view(x,disabled,esc){return \`<input value="\${esc(x.counted_stock??'')}" \${disabled} oninput="change()"><button type="button" class="secondary" onclick="LVInventory.confirmCount(\${x.article_id})">✓ Bestätigen & weiter</button>\${x.bin_parts_json?\`<small>\${esc(x.bin_parts_json)}</small>\`:''}\`;}
 window.LVInventory={
  addBinPart(id){return oldBin()},
  updateReferences(refs){},
  addCount(id){return oldAdd()},
  edit(id,field,value){},
 contextLocationChanged(value){if(true){updateLocation()}
   saveContext();contextMessage();
  },
  contextToggle(){saveContext();contextMessage()},
 };`;
 const out=sw.patchV8810InventoryUi(fixture);
 assert.ok(out.includes('LV8810_LOCATION_AUTO_APPLY'));
 assert.ok(out.includes('LV889_INVENTORY_ADD'));
 assert.ok(out.includes("if(String($('inv84Location')?.value||'').trim()&&!context().apply)"));
 assert.equal(out.includes('oldAdd()'),false);
 assert.doesNotThrow(()=>new Function(out));
});
test('Aktuelle HTML-Boot-Reihenfolge: Mengenlogik vor Suchfeld-Schutz',()=>{
 const html=sw.injectHtml('<html><body>App</body></html>');
 assert.match(html,/Lagerverwaltung V88.14/);
 assert.ok(html.indexOf('v88_9_count_core.js?v=88.14')<html.indexOf('v88_10_inventory_focus.js?v=88.14'));
 assert.ok(html.indexOf('v87_ui.js?v=88.14')<html.indexOf('v88_10_inventory_focus.js?v=88.14'));
 assert.ok(sw.FILES.includes('v88_10_inventory_focus.js'));
});
test('Versionierung verhindert Wiederverwendung der alten SW-Datei',()=>{
 assert.match(sw.CACHE_NAME,/lv88-14-/);
 assert.match(fs.readFileSync(path.join(__dirname,'v88_ocr.js'),'utf8'),/el\.textContent='88\.14'/);
 assert.match(fs.readFileSync(path.join(__dirname,'manifest.webmanifest'),'utf8'),/V88\.14/);
});
