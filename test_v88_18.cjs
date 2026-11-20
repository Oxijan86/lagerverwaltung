'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=__dirname,source=n=>fs.readFileSync(path.join(base,n),'utf8');
const match=require('./v88_13_pdf_match.js'),print=require('./v88_4_export.js'),bulk=require('./v88_17_bulk_core.js'),sw=require('./service-worker.js');
const row=(no,description='Hebel')=>({page:1,position:1,key:'1:1',article_no:no,description,unit:'Stk.',verified:true});
test('Vorhandener ungezählter Artikel mit Buchbestand null wird als PDF-Zuordnung akzeptiert',()=>{
 const material={article_no:'I1002345',description:'Hebel',id:44,counted_stock:null,stock:0};
 assert.equal(match.candidates(row('11002345'),[material]).length,1);
 const open=match.summarize([row('I1002345')],[material]);assert.equal(open.length,0);
 const all=match.summarize([row('I1002345')],[material],{includeMatched:true});assert.equal(all.length,1);assert.match(all[0].kind,/zugeordnet/);
});
test('Ungeprüfter OCR-Treffer wird auch als ungezählter Kandidat angeboten',()=>{
 const material={article_no:'I1002345',description:'Hebel',id:44,counted_stock:null,stock:0};
 const r={...row('11002345'),verified:false};
 const open=match.summarize([r],[material]);assert.equal(open.length,1);assert.equal(open[0].options[0].article.article_no,'I1002345');
});
test('Bestätigte neue Zuordnung verschwindet aus offenen Positionen ohne Mengenerfassung',()=>{
 const a={article_no:'I1002345',description:'Hebel',id:44,counted_stock:null},r={...row('11002345'),verified:false};
 match.assign([r],r.key,a,()=>true);assert.equal(r.manual_link,true);assert.equal(match.summarize([r],[a]).length,0);
});
test('Zurückgestellte Position bleibt sichtbar und erzeugt keine Menge im PDF',()=>{
 const r={...row('I1002345'),verified:false,review_action:'defer'};const inv={items:[{article_no:'I1002345',counted_stock:0,unit:'Stk.'}]};
 assert.equal(match.summarize([r],inv.items).length,1);
 const report=print.buildPrintData([r],inv,x=>Number(x));assert.equal(report.printed,0);assert.equal(report.blank,1);
});
test('Buchbestand null ist niemals eine bestätigte Nullzählung',()=>{
 const r=row('I1002345');const inv={items:[{article_no:'I1002345',description:'Hebel',counted_stock:null,base_stock:0,unit:'Stk.'}]};
 const report=print.buildPrintData([r],inv,x=>Number(x));assert.equal(report.printed,0);
 inv.items[0].counted_stock=0;const counted=print.buildPrintData([r],inv,x=>Number(x));assert.equal(counted.printed,1);assert.equal(counted.quantities['1:1'],0);
});
test('Sammelvorschlag I/1 wird bei vorhandener falscher Zählung gesperrt',()=>{
 const source={article_no:'11002345',description:'Hebel',counted_stock:2},target={article_no:'I1002345',description:'Hebel',counted_stock:null};
 const suggestions=bulk.proposals([row(source.article_no)],[source,target]);assert.equal(suggestions.length,1);assert.equal(suggestions[0].selectable,false);
});
test('Sammelvorschlag I/1 darf beide ungezählten Positionen nach Bestätigung verknüpfen',()=>{
 const source={article_no:'11002345',description:'Hebel',counted_stock:null},target={article_no:'I1002345',description:'Hebel',counted_stock:null};
 const suggestions=bulk.proposals([row(source.article_no)],[source,target]);assert.equal(suggestions.length,1);assert.equal(suggestions[0].selectable,true);
});
test('Snapshot-Patch unterstützt Mehrfachverknüpfung und leere reine Zwischenstandssicherung',()=>{
 const code=source('service-worker.js');
 assert.match(code,/LV8818_SNAPSHOT_BATCH/);assert.doesNotMatch(code,/changes\.length!==1/);assert.match(code,/await storePdf\(update\)/);
 assert.doesNotThrow(()=>new Function(code));
});
test('Zwischenspeichern und manuelles Anlegen mit Anfangsbestand null in PDF-Export vorhanden',()=>{
 const src=source('v88_4_export.js');for(const marker of ['lv8818SaveProgress','Zur Prüfung zurückholen','create-import','initial_stock:0','inventory-v75/refresh','notInInventory:true','matchItems=await allMatchItems','v88_17_bulk_ui'])if(marker==='v88_17_bulk_ui')continue;else assert.ok(src.includes(marker),marker);
});
test('Separater JSON-Prüfstand mit PDF-Hash und DB-ID, ohne Zählmengenüberschreiben',()=>{
 const src=source('v88_4_export.js');
 for(const marker of ['lv8818ExportProgress','lv8818ImportProgress','RONDO-PDF-PRUEFSTAND','pdf_hash:stored.hash','database_id:index.database_id','if(obj.format','ctx.saveMappings(revised)'])assert.ok(src.includes(marker),marker);
 assert.doesNotMatch(src,/UPDATE inventory_counts SET/);
});
test('Startreihenfolge: Lagerortkern synchron vor Inventur-UI, PDF-Module danach',()=>{
 const baseHtml='<html><body><script src="inventory_v85_core.js"></script><script src="inventory_ui.js"></script></body></html>';
 const html=sw.injectHtml(baseHtml);
 assert.ok(html.indexOf('v88_11_location_core.js?v=88.19')<html.indexOf('<script src="inventory_ui.js"'));
 assert.ok(html.includes('v88_17_bulk_core.js?v=88.19'));
 assert.ok(html.includes('v88_17_bulk_ui.js?v=88.19'));
 assert.ok(html.includes('v88_4_export.js?v=88.19'));
});
