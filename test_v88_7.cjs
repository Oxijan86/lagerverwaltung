'use strict';
/* Self-contained tests; no company PDF is included in the public repository.
 * For the complete 72-page integration test, supply the original privately.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const SW=require('./service-worker.js');
const Review=require('./v88_3_review.js');
const PDF=require('./v88_6_pdf.js');
const Export=require('./v88_4_export.js');
const Setup=require('./v88_3_setup.js');
const Guard=require('./v88_7_inventory_guard.js');
const Catalog=require('./v88_2_catalog.js');
test('Import catalogue retains 719 positions on 72 pages',()=>{
 const p=Catalog.pages();assert.equal(p.length,72);assert.equal(p.reduce((a,x)=>a+x.positions.length,0),719);
});
test('SAP, RONDO and empty-DB setup remain available',()=>{
 assert.deepEqual(Setup.MODES,['none','pdf','sap']);assert.equal(Setup.validateChoice('none',null).kind,'empty');
});
test('Ambiguous OCR glyph never becomes automatic confirmation',()=>{
 const list=[{article_no:'1100450',description:'Schutz'}];const row={article_no:'I100450',description:'Schutz',verified:false};
 assert.equal(Review.candidates(row,list)[0].article.article_no,'1100450');
 assert.equal(Review.batchEligible(row,list,[row],0),false);
});
test('Deferred article is not printed and can be reviewed later',()=>{
 const rows=[{key:'1:1',page:1,position:1,article_no:'1100450',description:'Schutz',verified:false,review_action:'defer'}];
 assert.equal(Export.buildPrintData(rows,{items:[{article_no:'1100450',counted_stock:8}]},Number).printed,0);
});
test('Confirmed counted 0 is printed, uncounted is blank',()=>{
 const rows=[{key:'1:1',page:1,position:1,article_no:'1100450',verified:true},{key:'1:2',page:1,position:2,article_no:'1100451',verified:true}];
 const r=Export.buildPrintData(rows,{items:[{article_no:'1100450',counted_stock:0},{article_no:'1100451',counted_stock:null}]},Number);
 assert.equal(r.printed,1);assert.equal(r.blank,1);assert.equal(r.quantities['1:1'],0);
});
test('PDF overlay adds only amounts and counter/date, no "Gezählt" or signature',()=>{
 const s=PDF.overlay([{page:2,position:1,key:'2:1'}],{'2:1':12},{counter:'Tobias Lovrencic',date:'19.11.2026'},2);
 assert.match(s,/\(12\) Tj/);assert.doesNotMatch(s,/Gezählt|Signatur|Signature/);
});
test('PDF exporter is pinned to known exact original SHA',()=>{
 assert.equal(PDF.KNOWN_SHA,Catalog.SHA256);
});
test('Fail-closed renderer rejects legacy white-canvas fallback',async()=>{
 global.window={LV87PDF:{render:()=>{throw Error('legacy')}}};
 await assert.rejects(Export.verifiedRenderer(),/Verlustfreier PDF-Export/);
 delete global.window;
});
test('A running inventory is ALWAYS resumed; a new one needs explicit choice',()=>{
 assert.equal(Guard.plan({sessions:[{id:'abc',status:'draft'}]}),'resume');
 assert.equal(Guard.plan({sessions:[{id:'abc',status:'completed'}]}),'create');
});
test('Service worker boot installs the safe exporter + inventory guard',()=>{
 const html=SW.injectHtml('<html><body><h1>Unchanged app</h1><script src="inventory_ui.js"></script></body></html>');
 assert.match(html,/v88_6_pdf\.js\?v=88\.15/);assert.match(html,/v88_4_export\.js\?v=88\.15/);assert.match(html,/v88_7_inventory_guard\.js\?v=88\.15/);
 assert.equal(SW.injectHtml(html),html);
});
test('The old raster PDF function is delegated or stopped, never executed',()=>{
 const s='async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false){throw Error("WHITE PDF");}';
 const patched=SW.patchV886Pdf(s);assert.match(patched,/LV886_SAFE_PDF_DELEGATE/);assert.match(patched,/LV886PDF\.render/);
});
test('Version and help are updated together',()=>{
 for(const name of ['manifest.webmanifest','v88_ocr.js','v88_4_help.js'])assert.match(fs.readFileSync(require('node:path').join(__dirname,name),'utf8'),/88\.15/);
});
