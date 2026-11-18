'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');
const BASE=__dirname;
const SW=require('./service-worker.js');
const Import=require('./v88_5_import.js');
const Catalog=require('./v88_2_catalog.js');
const Export=require('./v88_4_export.js');
const PDF=process.env.RONDO_ORIGINAL_PDF||path.join(BASE,'test_fixtures','Inventurliste Lovrencic 1025.pdf');
const pdfBytes=fs.existsSync(PDF)?fs.readFileSync(PDF):null;
const fakeFile=(buffer,name='Inventurliste Lovrencic 1025.pdf')=>({name,size:buffer.length,arrayBuffer:async()=>buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength)});
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');

test('V88.5: exact uploaded 72-page PDF matches immutable SHA-256 fingerprint',{skip:!pdfBytes},()=>{
 assert.ok(pdfBytes, 'User original PDF must be available for this release test');
 assert.equal(sha(pdfBytes),Catalog.SHA256);
 assert.equal(Import.SHA256,Catalog.SHA256);
});
test('Real PDF imported using browser-independent approved catalog, no OCR',{skip:!pdfBytes},async()=>{
 globalThis.LV882Catalog=Catalog;
 const events=[];const result=await Import.scan(fakeFile(pdfBytes),txt=>events.push(txt));
 assert.equal(result.hash,Catalog.SHA256);
 assert.equal(result.pages.length,72);
 assert.equal(result.source,'verified-file-catalog-v88.2');
 assert.equal(result.pages.reduce((n,p)=>n+p.positions.length,0),719);
 assert.equal(result.pages[0].positions[0].article_no,'11006138');
 assert.equal(result.pages[71].positions[0].article_no,'5040');
 assert.equal(result.pages.flatMap(x=>x.positions).filter(x=>x.verified===false).length,76);
 assert.ok(events.some(x=>x.includes('719 Artikelpositionen')));
});
test('File can be renamed without bypassing byte comparison',{skip:!pdfBytes},async()=>{
 globalThis.LV882Catalog=Catalog;
 const result=await Import.scan(fakeFile(pdfBytes,'umbenannt.pdf'));
 assert.equal(result.pages.length,72);
});
test('Wrong SHA with same original filename generates clear error instead of running old OCR',{skip:!pdfBytes},async()=>{
 globalThis.LV882Catalog=Catalog;
 const altered=Buffer.concat([pdfBytes,Buffer.from('new byte')]);
 await assert.rejects(()=>Import.scan(fakeFile(altered)),/unterscheidet sich.*Originaldatei/);
});
test('Unknown PDF can use ordinary OCR, not misidentified as original',async()=>{
 globalThis.LV882Catalog=Catalog;
 assert.equal(await Import.scan(fakeFile(Buffer.from('%PDF-1.4\nanything'),'other.pdf')),null);
});
test('No file / invalid extension are rejected before inventory mutation',async()=>{
 await assert.rejects(()=>Import.scan(null),/auswählen/);
 await assert.rejects(()=>Import.scan(fakeFile(Buffer.from('abc'),'x.csv')),/PDF-Datei/);
});
test('Source wrapper bypasses actual OCR for known pdf (new fresh source)',async()=>{
 const ui='async function scan(file,onProgress=()=>{}){globalThis.ocrRuns++;throw Error("0 Wortpositionen")};';
 const patched=SW.patchV885Ui(ui);
 assert.match(patched,/LV885_SAFE_FILE_CATALOG/);
 new vm.Script(patched);
 const calls={ocrRuns:0,window:{LV885Import:{scan:async()=>({source:'verified',pages:[1]})}}};calls.globalThis=calls;
 vm.runInNewContext(patched,calls);
 const r=await calls.scan(fakeFile(Buffer.from('test')));
 assert.equal(calls.ocrRuns,0);
 assert.equal(r.source,'verified');
});
test('Source wrapper also repairs already marked V88.1/88.4 cached code',async()=>{
 const old='/* LV88_V87_UI_PATCH */\nasync function scan(file,onProgress=()=>{}){globalThis.ocrRuns++;throw Error("0 Wortpositionen")};';
 const patched=SW.patchV885Ui(old);
 assert.match(patched,/LV885_SAFE_FILE_CATALOG/);
 const ctx={ocrRuns:0,window:{LV885Import:{scan:async()=>({source:'verified-catalog'})}}};ctx.globalThis=ctx;
 vm.runInNewContext(patched,ctx);
 assert.equal((await ctx.scan(fakeFile(Buffer.from('test')))).source,'verified-catalog');
 assert.equal(ctx.ocrRuns,0);
 assert.equal(SW.patchV885Ui(patched),patched,'idempotent');
});
test('Cached V88.4 HTML is upgraded to V88.5 without duplicate addons',()=>{
 let html=SW.injectHtml('<html><body><p>Hello</p></body></html>');
 const original=html.replace('Lagerverwaltung V88.5: Datenbestand unverändert, deterministischer PDF-Katalog','Lagerverwaltung V88.4: unveränderte V86-Funktionen + V87 + V88').replaceAll('?v=88.5','');
 html=SW.injectHtml(original);
 assert.match(html,/v88_5_import\.js\?v=88\.5/);
 assert.match(html,/v87_ui\.js\?v=88\.5/);
 assert.equal((html.match(/<span data-lv88-boot/g)||[]).length,1);
 assert.equal((html.match(/<script src="v87_ui/g)||[]).length,1);
 assert.ok(html.indexOf('v88_5_import.js')<html.indexOf('v87_ui.js'));
 assert.equal(SW.injectHtml(html),html);
});
test('SW outputs versioned assets and content-type safe code patch',()=>{
 assert.match(SW.CACHE_NAME,/lv88-5/);
 assert.ok(SW.FILES.includes('v88_5_import.js'));
 assert.ok(SW.FILES.includes('v87_ui.js?v=88.5'));
 const manifest=JSON.parse(fs.readFileSync(path.join(BASE,'manifest.webmanifest'),'utf8'));
 assert.match(manifest.name,/V88\.5/);
});
test('Review/export remain read-only until explicit inventory commit',()=>{
 const rows=[{key:'1:1',page:1,position:1,article_no:'11006138',description:'Sicherungsklemme',unit:'Stk.',verified:true}];
 const inv={items:[{article_no:'11006138',counted_stock:0}]};
 const result=Export.buildPrintData(rows,inv,(s)=>Number(s));
 assert.deepEqual(result.quantities,{'1:1':0});
 assert.equal(result.printed,1);
 assert.equal(result.blank,0);
});
