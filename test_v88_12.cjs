'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Guard=require('./v88_12_save_guard.js'),SW=require('./service-worker.js');
const subject={article_id:160,article_no:'13496',description:'Rohr PU 4050 10/8',unit:'Stk.',counted_stock:'4,7',location:'Fahrzeug / Bänder',bin_parts_json:''};
const second={article_id:182,article_no:'20055',description:'Transportband',unit:'Stk.',counted_stock:null,location:'Fach B',bin_parts_json:''};
// Faithful, non-identifying fixture from the provided recovery JSON.
const file={version:879,items:[{article_id:160,counted_stock:'4,7',location:'Fahrzeug / Bänder',warehouse_id:1},{article_id:182,warehouse_id:2,counted_stock:null}]};
test('Reale Wiederherstellungsdatei wird erkannt: Artikel 13496 4,7 Stk und zweiter Artikel bleibt gültig',()=>{
 const result=Guard.inspect(file.items,[subject,second]);
 assert.equal(result.invalid.length,1);assert.equal(result.invalid[0].article_no,'13496');
 assert.match(result.invalid[0].reason,/Stk/);assert.match(result.invalid[0].reason,/4,7 Meter/);
 assert.deepEqual(result.valid.map(x=>x.article_id),[182]);
});
test('4,7 m mit deutscher Dezimale ist zulässig; 4,7 Stk. ist NICHT zulässig',()=>{
 assert.equal(Guard.parseQuantity('4,7','m'),4.7);
 assert.equal(Guard.parseQuantity('4.7','Meter'),4.7);
 assert.equal(Guard.parseQuantity('1,25','m'),1.25);
 assert.throws(()=>Guard.parseQuantity('4,7','Stk.'),/nur ganze Mengen/);
 assert.equal(Guard.parseQuantity('0','Stk.'),0);
 assert.equal(Guard.parseQuantity(null,'Stk.'),null);
});
test('Leere Eingabe darf null werden, ohne aus Null eine ungezählte Menge zu machen',()=>{
 assert.equal(Guard.inspect([{article_id:160,counted_stock:null}],[subject]).invalid.length,0);
 assert.equal(Guard.parseQuantity('0','m'),0);
});
test('Wert mit mehreren Teillagerorten wird nicht unbemerkt in andere Summe verwandelt',()=>{
 const row={...subject,unit:'m',counted_stock:'4,7',bin_parts_json:JSON.stringify([{location:'Fach A',warehouse_id:1,quantity:2.5},{location:'Fach B',warehouse_id:1,quantity:2.2}])};
 assert.equal(Guard.inspect([{article_id:160,counted_stock:'4,7'}],[row]).invalid.length,0);
 const wrong=Guard.inspect([{article_id:160,counted_stock:'4,5'}],[row]);
 assert.equal(wrong.invalid.length,1);assert.match(wrong.invalid[0].reason,/Gesamtzählstand/);
});
test('Unbekannte Artikel und beschädigte Teilmengen bleiben im Fehlerbericht erhalten',()=>{
 const rows=[{...subject,unit:'m',bin_parts_json:'kaputt'}];
 assert.equal(Guard.inspect([{article_id:160,counted_stock:'4,7'}],rows).invalid.length,1);
 assert.equal(Guard.inspect([{article_id:999,counted_stock:'4,7'}],rows).invalid.length,1);
});
test('Abgesicherte Cloud-Anzeige referenziert kein undefiniertes syncStatus mehr',()=>{
 const html=SW.injectHtml('<html><body><script>async function refresh(){await syncStatus();}</script></body></html>');
 assert.match(html,/if\(typeof window\.syncStatus==='function'\)await window\.syncStatus\(\)/);
 assert.doesNotMatch(html,/\bawait syncStatus\(\)/);
 assert.match(html,/v88_12_save_guard\.js\?v=88\.14/);
});
test('Patches sichern PDF-Ausgabe, Lagerorte und Mengen weiterhin ab',()=>{
 const sw=fs.readFileSync(__dirname+'/service-worker.js','utf8');
 assert.match(sw,/patchV8813InventoryUi\(text\)/);
 assert.match(sw,/patchV8813InventoryCore\(text\)/);
 assert.match(sw,/patchV886Pdf\(text\)/);
 assert.match(sw,/patchV8813Backend\(text\)/);
 assert.match(SW.CACHE_NAME,/lv88-14/);
});
function patchedFixture(){
 let src=fs.readFileSync(__dirname+'/test_source_inventory_ui.js','utf8');
 src=src.replace('let data=null,pending=new Map(),busy=false,timer=null;',
  'let data=window.__data,pending=window.__pending,busy=false,timer=null,saving=null,errorState=false;');
 src=src.replace('function status(){}',`function status(){ $('inv75Saved').className=pending.size?'small inv75-dirty':'small'; }`);
 src=src.replace('function cache(){}','function cache(){window.__cached=true;}');
 src=src.replace('function message(){}','function message(t,ok){window.__messages.push({t,ok});}');
 src=src.replace('function flush(){}',`function payload(extra={}){return {id:data.session.id,version:data.session.version,database_id:data.database_id,...extra}}
 async function post(action,body){window.__posts.push({action,body});const next={...data,session:{...data.session,version:data.session.version+1}};return next;}
 async function flush(){
  clearTimeout(timer);if(saving){const ok=await saving;if(!ok)return false;if(pending.size)return flush();return true}
  if(!data||data.session.status!=='draft')return true;
  if(!pending.size&&data.durable!==false)return true;
  const sent=[...pending.values()].map(x=>({...x})),captured=new Map(sent.map(x=>[x.article_id,JSON.stringify(x)]));
  saving=(async()=>{
   try{
    const result=await post('save',payload({items:sent}));
    for(const [id,value] of captured)if(JSON.stringify(pending.get(id))===value)pending.delete(id);
    data=result;
    for(const p of pending.values()){const x=data.items.find(x=>x.article_id===p.article_id);if(x)Object.assign(x,p)}
    cache();errorState=false;message('Zwischenstand gespeichert. Bestände wurden noch nicht verändert.');
    return true;
   }catch(e){cache();errorState=true;message(e.message+' Eingaben sind noch nicht in der Lagerdatei gespeichert; die lokale Wiederherstellungskopie bleibt erhalten.',false);return false}
   finally{saving=null;status()}
  })();return saving;
 }
 async function load(id,discard=false){}`);
 src=src.replace('  contextToggle(){saveContext();contextMessage()},','  contextToggle(){saveContext();contextMessage()},\n  recovery(){window.__backup=true;},\n  save:flush,');
 return SW.patchV8812InventoryUi(src);
}
test('V88.14 UI-Patch auf Realform der V88.11-Zählfunktion ist syntaktisch gültig',()=>{
 const js=patchedFixture();assert.match(js,/LV8812_SAFE_DRAFTS/);assert.match(js,/LV8812_REPAIR_INVALID_COUNT/);
 assert.doesNotThrow(()=>new Function(js));
});
test('Gültige Änderungen werden unabhängig von einer einzigen fehlerhaften Menge gespeichert',async()=>{
 const code=patchedFixture();const messages=[],posts=[],data={session:{status:'draft',id:'test',version:879},database_id:'db',durable:true,items:[{...subject},{...second}]};
 const pending=new Map([[160,{article_id:160,counted_stock:'4,7',location:'Fahrzeug / Bänder',warehouse_id:1}],[182,{article_id:182,warehouse_id:2,counted_stock:null}]]);
 const elements=new Map([['inv75Saved',{id:'inv75Saved',className:'',parentNode:null}],['inv75-count-160',{value:'4,7'}]]);
 const doc={getElementById:id=>elements.get(id)||null};
 const ctx={window:{__data:data,__pending:pending,__posts:posts,__messages:messages,LV8812SaveGuard:Guard,LVInventoryV84Core:{},LVInventoryV85Core:{},LV8811LocationCore:require('./v88_11_location_core.js'),LV889CountCore:require('./v88_9_count_core.js'),LV8810InventoryFocus:{}},document:doc,console,confirm:()=>true,clearTimeout(){},setTimeout(){},prompt:()=>null};
 vm.runInNewContext(code,ctx);
 const saved=await ctx.window.LVInventory.save();
 assert.equal(saved,false,'Insgesamt erst true, wenn alle Eingaben sicher sind');
 assert.equal(posts.length,1,'gültige Artikel dürfen separat gespeichert werden');
 assert.deepEqual(posts[0].body.items.map(x=>x.article_id),[182]);
 assert.equal(pending.size,1);assert.ok(pending.has(160));
 assert.match(messages.at(-1).t,/13496/);
 assert.equal(data.items[0].counted_stock,'4,7');
 await ctx.window.LVInventory.repairInvalidCount(160);
 assert.equal(ctx.window.__backup,true,'Vor dem Entfernen wurde lokale Wiederherstellungskopie angefordert');
 assert.equal(posts.length,2);
 assert.equal(posts[1].body.items[0].article_id,160);
 assert.equal(posts[1].body.items[0].counted_stock,null);
 assert.equal(pending.size,0);
});
test('Fehleranzeige enthält genauen Artikel und bietet sichere Aktionen',()=>{
 const names=[];const elements=new Map();
 class Node{constructor(tag){this.tag=tag;this.children=[];this.style={};this.parentNode=null;this.textContent='';this.onclick=null;this.id='';this.className='';this.type='';}setAttribute(){}appendChild(n){this.children.push(n);n.parentNode=this;return n;}replaceChildren(){this.children=[];}insertBefore(node){node.parentNode=this;this.children.push(node);elements.set(node.id,node);}removeChild(node){this.children=this.children.filter(x=>x!==node);elements.delete(node.id)}}
 const parent=new Node('section'),anchor=new Node('p');anchor.parentNode=parent;elements.set('inv75Saved',anchor);
 const doc={getElementById:id=>elements.get(id),createElement:tag=>new Node(tag)};
 const issues=Guard.inspect([{article_id:160,counted_stock:'4,7'}],[subject]).invalid;
 Guard.render(doc,issues,{repair:id=>names.push('repair'+id),backup:()=>names.push('backup')});
 const box=elements.get('lv8812SaveIssues');assert.ok(box);assert.ok(box.children.some(x=>String(x.textContent).includes('ungespeicherte')));
 const detail=box.children.find(x=>x.tag==='div');assert.match(detail.children[0].textContent,/13496/);
 detail.children[1].onclick();box.children.at(-1).onclick();assert.deepEqual(names,['repair160','backup']);
 Guard.render(doc,[],{});assert.equal(elements.has('lv8812SaveIssues'),false);
});
