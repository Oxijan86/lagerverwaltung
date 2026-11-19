'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const SW=require('./service-worker.js'), Match=require('./v88_13_pdf_match.js'),Export=require('./v88_4_export.js'),LV11=require('./v88_11_location_core.js');
function patchedFixture(){
 const old=fs.readFileSync(__dirname+'/test_v88_12.cjs','utf8');
 const functionSource=old.match(/function patchedFixture\(\)\{[\s\S]*?\n\}/)?.[0];
 if(!functionSource)throw Error('V88.12 fixture fehlt');
 const former=new Function('fs','__dirname','SW',functionSource+'\nreturn patchedFixture;')(fs,__dirname,SW);
 // Former fixture patches only V88.12; new function accepts it and upgrades.
 return SW.patchV8813InventoryUi(former());
}
test('V88.16 Folgeversion, RONDO-Matcher, PDF-Renderer und Module werden geladen',()=>{
 assert.match(SW.CACHE_NAME,/lv88-16/);
 assert.ok(SW.FILES.includes('v88_13_pdf_match.js'));
 const html=SW.injectHtml('<html><body><script>function renderStockRows(list){return `<td data-label="Bezeichnung">${esc(a.description)}</td>`}</script></body></html>');
 assert.ok(html.includes('Inventur-Fundorte (noch kein Bestandsabschluss)'));
 assert.ok(html.includes('v88_13_pdf_match.js'));
 const js=patchedFixture();assert.match(js,/LV8813_CORRECTION_PROMPT/);assert.doesNotThrow(()=>new Function(js));
});
test('USB-Stick: korrigierte OCR-Ziffer und Namensähnlichkeit liefern eindeutigen Vorschlag',()=>{
 const row={page:4,position:6,article_no:'1100033I',description:'USB-Stick zur Datensicherung',verified:false};
 const items=[{article_id:1,article_no:'11000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:2},{article_id:2,article_no:'11000349',description:'Filter',unit:'Stk.',counted_stock:1}];
 const result=Match.candidates(row,items);assert.equal(result[0].article.article_no,'11000339');assert.ok(result[0].score>110);
 const summary=Match.summarize([row],items);assert.equal(summary.length,1);assert.equal(summary[0].key,'4:6');assert.equal(summary[0].options[0].article.article_no,'11000339');
});
test('Katalog: Die originale RONDO-Vorlage enthält genau eine USB-Datensicherungsposition',()=>{
 const catalog=require('./v88_2_catalog.js');assert.equal(catalog.EXPECTED_ROWS,719);
 const usb=catalog.DATA.filter(a=>/USB-?Stick/i.test(a[1]));assert.equal(usb.length,1);assert.equal(usb[0][0],'11000339');
});
test('Eine unsichere PDF-Position bleibt leer, bis eine explizite Zuordnung gespeichert wurde',()=>{
 const inventory={session:{status:'draft'},items:[{article_id:1,article_no:'11000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:2}]};
 const rows=[{key:'4:6',page:4,position:6,article_no:'1100033I',description:'USB-Stick zur Datensicherung',unit:'Stk.',verified:false}];
 let printed=Export.buildPrintData(rows,inventory,(v)=>Number(v));assert.equal(printed.printed,0);
 Match.assign(rows,'4:6',inventory.items[0],n=>/^[A-Z0-9]{5,20}$/i.test(n));
 printed=Export.buildPrintData(rows,inventory,(v)=>Number(v));assert.equal(printed.printed,1);assert.equal(printed.quantities['4:6'],2);
 assert.equal(rows[0].ocr_original_no,'1100033I');assert.equal(rows[0].article_no,'11000339');assert.equal(rows[0].manual_link,true);
});
test('Ein gleiches Material darf nicht stillschweigend zwei Belegpositionen erhalten',()=>{
 const a={article_no:'11000339',description:'USB-Stick',unit:'Stk.',counted_stock:2};
 const rows=[{page:4,position:6,article_no:'1100033I',verified:false},{page:5,position:1,article_no:'11000339',verified:true}];
 assert.throws(()=>Match.assign(rows,'4:6',a,()=>true),/weiteren PDF-Zeile/);
});
test('Eine formal gültige aber falsch zugeordnete ungezählte PDF-Position wird angezeigt',()=>{
 const lines=[{page:3,position:2,article_no:'11000349',description:'USB-Stick zur Datensicherung',verified:true}];
 const items=[{article_no:'11000349',description:'Filter',counted_stock:null},{article_no:'11000339',description:'USB-Stick zur Datensicherung',counted_stock:1}];
 const open=Match.summarize(lines,items);
 assert.equal(open.length,1);assert.equal(open[0].options[0].article.article_no,'11000339');
});
test('Meter-Zählungen werden mit Komma ausgegeben; Stück muss ganzzahlig bleiben',()=>{
 const items=[{article_no:'M1234',unit:'m',counted_stock:'4,7'},{article_no:'S1234',unit:'Stk.',counted_stock:'2'}];
 const lines=[{page:1,position:1,article_no:'M1234',verified:true,unit:'Stk.'},{page:1,position:2,article_no:'S1234',verified:true,unit:'Stk.'}];
 const norm=(s,u)=>{const n=Number(String(s).replace(',','.'));if(u==='Stk.'&&!Number.isInteger(n))throw Error('Ganzzahl');return n};
 const pr=Export.buildPrintData(lines,{items},norm);assert.equal(pr.quantities['1:1'],4.7);assert.equal(pr.quantities['1:2'],2);
});
test('Prompteingabe korrigiert Mengen ohne readonly-Fokus und speichert mit Erhalt des Zählortes',async()=>{
 const patched=patchedFixture();
 const data={session:{status:'draft',id:'sess',version:1},database_id:'db',durable:true,locations:[],items:[{article_id:160,article_no:'13496',description:'Rohr',unit:'m',counted_stock:'4.7',bin_parts_json:JSON.stringify([{warehouse_id:1,location:'Fach A',quantity:4.7}]),location:'Fach A',warehouse_id:1}]};
 const pending=new Map(),messages=[],posts=[];const elements=new Map([['inv75-count-160',{id:'inv75-count-160',value:'4,7',readOnly:true}],['inv75Saved',{id:'inv75Saved',className:'',parentNode:null}],['inv75ReviewBox',{hidden:true}]]);
 const doc={getElementById:id=>elements.get(id)||{disabled:false},querySelectorAll:()=>[]};
 const ctx={document:doc,console,clearTimeout(){},setTimeout(){},confirm:()=>true,prompt:()=> '3,2',window:{__data:data,__pending:pending,__posts:posts,__messages:messages,LV8812SaveGuard:require('./v88_12_save_guard.js'),LVInventoryV84Core:{},LVInventoryV85Core:{},LV8811LocationCore:LV11,LV889CountCore:require('./v88_9_count_core.js'),LV8810InventoryFocus:{protectAll(){}}}};
 vm.runInNewContext(patched,ctx);
 await ctx.window.LVInventory.correctTotal(160);
 assert.equal(Number(data.items[0].counted_stock),3.2);
 assert.equal(JSON.parse(data.items[0].bin_parts_json)[0].quantity,3.2);
 assert.equal(elements.get('inv75-count-160').readOnly,true,'Zählfeld bleibt schreibgeschützt');
 assert.equal(posts.length,1);assert.equal(Number(posts[0].body.items[0].counted_stock),3.2);
});
test('Leeres Korrektur-Prompt entfernt nur Zählung (null), nicht als gezählte Null',async()=>{
 const patched=patchedFixture();
 const data={session:{status:'draft',id:'sess',version:1},database_id:'db',durable:true,locations:[],items:[{article_id:160,article_no:'13496',description:'Rohr',unit:'m',counted_stock:'4.7',bin_parts_json:JSON.stringify([{warehouse_id:1,location:'Fach A',quantity:4.7}]),location:'Fach A',warehouse_id:1}]};
 const pending=new Map(),messages=[],posts=[];const elements=new Map([['inv75-count-160',{id:'inv75-count-160',value:'4,7',readOnly:true}],['inv75Saved',{id:'inv75Saved',className:'',parentNode:null}],['inv75ReviewBox',{hidden:true}]]);
 const doc={getElementById:id=>elements.get(id)||{disabled:false},querySelectorAll:()=>[]};
 const ctx={document:doc,console,clearTimeout(){},setTimeout(){},confirm:()=>true,prompt:()=> '',window:{__data:data,__pending:pending,__posts:posts,__messages:messages,LV8812SaveGuard:require('./v88_12_save_guard.js'),LVInventoryV84Core:{},LVInventoryV85Core:{},LV8811LocationCore:LV11,LV889CountCore:require('./v88_9_count_core.js'),LV8810InventoryFocus:{protectAll(){}}}};
 vm.runInNewContext(patched,ctx);
 await ctx.window.LVInventory.correctTotal(160);
 assert.equal(data.items[0].counted_stock,null);assert.equal(data.items[0].bin_parts_json,'');assert.equal(posts.length,1);
});
test('Inventur-Backend hat Master-Lagerort-Mirroring nur nach gespeicherter Zählposition',()=>{
 const src="if(x.location!==x.current_location||x.warehouse_id!==x.current_warehouse_id){run('UPDATE articles SET location=?,warehouse_id=? WHERE id=?',[x.location,x.warehouse_id,x.article_id]);locations++} transaction(()=>{for(const x of changes)run('UPDATE inventory_counts SET counted_stock=?,location=?,warehouse_id=?,note=?,bin_parts_json=? WHERE session_id=? AND article_id=?',[x.quantity,x.location,x.warehouse_id,x.note,x.partsRaw,s.id,x.article_id]);touch(s.id)});";
 const out=SW.patchV8813InventoryCore(src);assert.match(out,/LV8813_MASTER_LOCATION_ON_SAVE/);
 assert.match(out,/x\.quantity!==null&&x\.partsRaw/);assert.match(out,/UPDATE inventory_counts SET base_location/);
 assert.match(out,/Keine Bestandsbuchung/);assert.doesNotMatch(out,/UPDATE articles SET stock=/);
});
test('Material-API enthält aktuelle Fundorte, ohne Maschinen- oder Mengenänderungen',()=>{
 const src="if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){const technician=String(d.technician||setting('primary_technician','Techniker')).trim();const validTech=activeTechnicianNames();if(technician===setting('primary_technician','Techniker')&&!validTech.includes(technician))validTech.push(technician);if(!technician||!validTech.includes(technician))throw Error('Techniker ist nicht gültig.');const operationId=String(d.operation_id||'').trim();} if(p==='/api/articles')return response(articles(q.q||'').map(publicArticle));";
 // Minimal source must keep expected technician check before operationId.
 assert.match(SW.patchV8813Backend(src),/LV8813_DRAFT_LOCATION_READ/);
});
