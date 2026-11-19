'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const SW=require('./service-worker.js');
const htmlFixture='<html><head><title>Test</title></head><body><div id="inventory75"></div><script src="inventory_ui.js"></script><script>window.appBooted=!!window.LVInventory</script></body></html>';

test('V88.15: erforderlicher Lagerort-Kern synchron VOR inventory_ui.js geladen, nicht im Footer',()=>{
 const html=SW.injectHtml(htmlFixture);
 const pre=html.indexOf('<script src="v88_11_location_core.js?v=88.15"></script>');
 const entry=html.indexOf('<script src="inventory_ui.js"></script>');
 assert.ok(pre>0 && entry>pre, 'Location core must be loaded synchronously before legacy inventory_ui.js');
 assert.ok(html.indexOf('v88_7_inventory_guard.js?v=88.15')>pre && html.indexOf('v88_7_inventory_guard.js?v=88.15')<entry);
 assert.equal((html.match(/src="v88_11_location_core\.js/g)||[]).length,1,'dependency should only load once');
 assert.equal((html.match(/src="v88_7_inventory_guard\.js/g)||[]).length,1,'click guard should only load once');
 assert.match(html,/Lagerverwaltung V88\.15:/);
 assert.match(SW.CACHE_NAME,/^lv88-15-/);
});

test('V88.15: urspruenglicher LVInventory-is-not-defined Ablauf vorgefuehrt und durch Lade-Reihenfolge verhindert',()=>{
 const html=SW.injectHtml(htmlFixture);
 const scripts=[...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)].map(m=>m[1].split('?')[0]);
 const early=scripts.slice(0,scripts.indexOf('inventory_ui.js'));
 assert.deepEqual(early,['v88_11_location_core.js','v88_7_inventory_guard.js']);
 const stub="if(!window.LV8811LocationCore)throw Error('Lagerort-Schutzmodul nicht geladen'); window.LVInventory={open(){return 'ok';}};";
 const broken={};broken.window=broken;vm.createContext(broken);
 assert.throws(()=>vm.runInContext(stub,broken),/Lagerort-Schutzmodul/);
 const fixed={module:{exports:{}}};fixed.window=fixed;vm.createContext(fixed);
 vm.runInContext(fs.readFileSync('./v88_11_location_core.js','utf8'),fixed);
 vm.runInContext(fs.readFileSync('./v88_7_inventory_guard.js','utf8'),fixed);
 vm.runInContext(stub,fixed);
 assert.equal(fixed.LVInventory.open(),'ok');
 assert.equal(typeof fixed.LV8811LocationCore.correctTotal,'function');
});

test('V88.15: bei zwei laufenden Inventuren NIE stillschweigend eine auswaehlen oder neu anlegen',async()=>{
 const logs=[];
 const selector={scrollIntoView:()=>logs.push('scroll'),value:''};
 const overlay={hidden:false};
 const status={textContent:'',setAttribute(){}};
 const ctx={module:{exports:{}},console,document:{getElementById:id=>id==='inv75Session'?selector:id==='lv87Modal'?overlay:id==='inv75Msg'?status:null},api:async()=>({sessions:[{id:'one',status:'draft'},{id:'two',status:'draft'}]}),show:async()=>logs.push('show'),LVInventory:{open:async()=>logs.push('open'),current:()=>({session:{id:'one',status:'draft'}}),create:async()=>logs.push('CREATE'),cancel:async()=>logs.push('CANCEL')}};
 ctx.window=ctx;vm.createContext(ctx);
 vm.runInContext(fs.readFileSync('./v88_7_inventory_guard.js','utf8'),ctx);
 const result=await ctx.module.exports.handoff('Neue Inventur');
 assert.equal(result.kind,'choose');assert.equal(result.count,2);
 assert.ok(status.textContent.includes('2 laufende Inventuren'));
 assert.ok(!logs.includes('CREATE')&&!logs.includes('CANCEL'));
 assert.deepEqual(logs,['show','open','scroll']);
 assert.equal(overlay.hidden,true);
});
