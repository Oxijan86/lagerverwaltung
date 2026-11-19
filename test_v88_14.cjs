'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Match=require('./v88_13_pdf_match.js'), Report=require('./v88_14_report.js'), Export=require('./v88_4_export.js'), SW=require('./service-worker.js'), Pdf=require('./v88_6_pdf.js');
const pdfPath=process.env.RONDO_PDF_FIXTURE||'/mnt/data/Inventurliste Lovrencic 1025.pdf';
function items(){return [
 {id:1,article_id:1,article_no:'11000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',stock:5,counted_stock:2,location:'Fahrzeug',active:1},
 {id:2,article_id:2,article_no:'230087',description:'Extra Schraubenschlüssel',unit:'Stk.',stock:9,counted_stock:3,location:'Garage',active:1},
 {id:3,article_id:3,article_no:'130050',description:'Riemen fuer Messer',unit:'m',stock:8.2,counted_stock:null,location:'Regal C',active:1}
]}
const inventory=()=>({database_id:'abc',session:{id:'sess1',status:'draft',name:'RONDO Inventur'},items:items().map(x=>({...x,article_id:x.id}))});
test('Echte Original-RONDO-PDF besitzt 72 Seiten und erkannten SHA256',{skip:!fs.existsSync(pdfPath)},()=>{
 const raw=fs.readFileSync(pdfPath);const parsed=Pdf.parsedPdf(new Uint8Array(raw));assert.equal(parsed.pages.length,72);
 assert.equal(raw.subarray(0,5).toString(),'%PDF-');
});
test('OCR-Verwechslung I statt 1 am Seitenbeleg: erst ungeprueft, nach manueller Zuordnung druckbar',()=>{
 const rows=[{key:'4:6',page:4,position:6,article_no:'I1000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',verified:false}];
 const snapshot=inventory();let p=Export.buildPrintData(rows,snapshot,(v)=>Number(v));assert.equal(p.printed,0);
 let c=Match.candidates(rows[0],snapshot.items);assert.equal(c[0].article.article_no,'11000339');assert.equal(c[0].confusable,true);
 Match.assign(rows,'4:6',snapshot.items[0],()=>true);
 p=Export.buildPrintData(rows,snapshot,(v)=>Number(v));assert.equal(p.printed,1);assert.equal(p.quantities['4:6'],2);
 assert.equal(rows[0].ocr_original_no,'I1000339');assert.equal(rows[0].manual_link,true);
});
test('Nur Namenstreffer darf NICHT blind Bedruckung ausloesen',()=>{
 const rows=[{page:4,position:6,article_no:'11000349',description:'USB-Stick zur Datensicherung',verified:true}];
 const arr=[{article_no:'11000349',description:'Filter',unit:'Stk.',counted_stock:7},{article_no:'11000339',description:'USB-Stick zur Datensicherung',unit:'Stk.',counted_stock:2}];
 globalThis.LV8813PDFMatch=Match;
 assert.equal(Export.buildPrintData(rows,{items:arr},Number).printed,0);
 assert.equal(Match.summarize(rows,arr)[0].options[0].article.article_no,'11000339');
 delete globalThis.LV8813PDFMatch;
});
test('Zusatzliste enthaelt nur nicht im Beleg vorhandene Artikel; OCR-Potential als offener Prueffall',()=>{
 const rows=[{page:4,position:6,article_no:'I1000339',description:'USB-Stick zur Datensicherung',verified:false}];
 const res=Report.build(rows,items(),inventory(),Match);
 assert.equal(res.missing.length,2);assert.equal(res.uncertain.length,1);
 assert.equal(res.uncertain[0].article_no,'11000339');
 assert.ok(res.missing.some(x=>x.article_no==='230087'&&x.inventory_count==='3'));
 assert.ok(res.missing.some(x=>x.article_no==='130050'&&x.inventory_count===''&&x.book_stock==='8,2'));
 assert.match(Report.csv(res),/OCR-ZUORDNUNG PRÜFEN/);
 assert.match(Report.csv(res),/Nicht gezählt – Buchbestand nicht inventurgeprüft/);
});
test('Nach manueller Linksetzung wird Artikel aus Zusatzliste entfernt',()=>{
 const rows=[{page:4,position:6,article_no:'I1000339',description:'USB-Stick zur Datensicherung',verified:false}];
 Match.assign(rows,'4:6',items()[0],()=>true);
 const res=Report.build(rows,items(),inventory(),Match);
 assert.equal(res.uncertain.length,0);assert.equal(res.missing.length,2);
});
test('CSV-Download ist Excel-kompatibel und entschärft Tabellenformel-Eingaben',()=>{
 const report=Report.build([{page:1,position:1,article_no:'AAA',description:'Sonder'}],[{id:1,article_no:'=HYPERLINK(1)',description:'=bad',active:1,stock:0,unit:'Stk.'}],inventory(),Match);
 const body=Report.csv(report);
 assert.ok(body.startsWith('\uFEFFsep=;'));assert.match(body,/"'=bad"/);assert.match(body,/"'=HYPERLINK\(1\)"/);assert.match(body,/"0"/);
});
test('Alte Offline-Vorlage laedt Ersatz-Importer ueber gueltige URL',()=>{
 const sw=require('./service-worker.js'); const src=sw.patchV885Ui('async function scan(file,onProgress=()=>{}){ return null; }');
 assert.doesNotMatch(src,/new URL\([^)]*,[^)]*,document\.baseURI/);
 assert.match(src,/new URL\('v88_5_import\.js\?v=88\.14',document\.baseURI\)/);
});
test('Service Worker registriert Zusatzbericht vor PDF-Export',()=>{
 assert.match(SW.CACHE_NAME,/lv88-14/);
 const files=SW.FILES;assert.ok(files.includes('v88_14_report.js'));
 const html=SW.injectHtml('<html><body></body></html>');
 const start=html.indexOf('v88_14_report.js'),next=html.indexOf('v88_4_export.js');
 assert.ok(start>0&&next>start,'report before PDF export');
});
test('PDF-Overlay erhaltene Originalseiten: Mengen stehen nach bestaetigter OCR-Linksetzung an exakt gespeicherter Seite 4 Position 6',{skip:!fs.existsSync(pdfPath)},async()=>{
 const raw=new Uint8Array(fs.readFileSync(pdfPath));
 const row={page:4,position:6,key:'4:6',article_no:'I1000339',description:'USB-Stick zur Datensicherung',verified:false};
 Match.assign([row],'4:6',items()[0],()=>true);
 const print=Export.buildPrintData([row],inventory(),v=>Number(v));assert.equal(print.printed,1);
 const output=await Pdf.render(raw,[row],print.quantities,()=>{},()=>false,{counter:'Tobias Lovrencic',date:'19.11.2026'});
 const bytes=new Uint8Array(await output.arrayBuffer());assert.ok(bytes.length>raw.length+1000);
 assert.equal(Buffer.compare(Buffer.from(bytes.subarray(0,raw.length)),Buffer.from(raw)),0);
 // Nur die echte Testvorlage verwenden, niemals RONDO-Firmendokumente im GitHub-Testpaket ablegen.
 if(process.env.RONDO_TEST_OUTPUT)fs.writeFileSync(process.env.RONDO_TEST_OUTPUT,bytes);
 const parsed=Pdf.parsedPdf(raw);assert.equal(parsed.pages.length,72);
});
test('Bereitgestellte Wiederherstellungsdatei: Stk-Dezimalwert separat blockiert, andere Eingabe bleibt speicherbar',()=>{
 const fixturePath=process.env.INVENTORY_RECOVERY_FIXTURE||'/mnt/data/Inventur_Eingaben_05c82159-6859-4ee4-8594-67c4eb44551c.json';
 const data=fs.existsSync(fixturePath)?JSON.parse(fs.readFileSync(fixturePath,'utf8')):{version:879,items:[{article_id:160,counted_stock:'4,7',location:'Fahrzeug / Baender',warehouse_id:1},{article_id:182,counted_stock:null,warehouse_id:2}]};
 const guard=require('./v88_12_save_guard.js');
 const rows=[{article_id:160,article_no:'13496',description:'Rohr PU',unit:'Stk.',counted_stock:'4,7',bin_parts_json:''},{article_id:182,article_no:'123456',description:'anderer Artikel',unit:'Stk.',counted_stock:null,bin_parts_json:''}];
 const check=guard.inspect(data.items,rows);
 assert.equal(check.invalid.length,1);assert.equal(check.invalid[0].article_id,160);
 assert.equal(check.invalid[0].raw,'4,7');assert.equal(check.valid.length,1);
 assert.equal(check.valid[0].article_id,182);
 const fixed=data.items.map(x=>x.article_id===160?{...x,counted_stock:null}:x);
 assert.equal(guard.inspect(fixed,rows).invalid.length,0);
 // Dies ist die ungespeicherte JSON-Sicherung, keine komplette lager.db.
});
test('719 Materialpositionen aus der echten RONDO-Vorlage werden verglichen, inklusive korrigierter PDF-Verknuepfungen',()=>{
 const catalog=require('./v88_2_catalog.js'),lines=catalog.pages().flatMap(p=>p.positions);
 assert.equal(lines.length,719);
 const usb=lines.find(x=>x.article_no==='11000339');
 assert.ok(usb);assert.equal(usb.page,4);assert.equal(usb.position,6);
 // Ein fremder Artikel darf nicht als in der PDF vorhanden bezeichnet werden.
 const stock=[{id:23,article_no:'40000000',description:'Nur eigener Lagerartikel',active:1,stock:11,unit:'Stk.'}];
 const sess={session:{name:'Test'},items:[{article_id:23,counted_stock:10,location:'Werkstatt'}]};
 const report=Report.build(lines,stock,sess,Match);
 assert.equal(report.missing.length,1);assert.equal(report.missing[0].inventory_count,'10');
});

test('Exact erkannte Nummer mit fremder Bezeichnung gilt nicht als sicher im PDF',()=>{
 const rows=[{page:1,position:1,article_no:'11000339',description:'Filter',verified:true}];
 const report=Report.build(rows,[items()[0]],inventory(),Match);
 assert.equal(report.missing.length,0);assert.equal(report.uncertain.length,1);
 assert.equal(report.uncertain[0].status,'OCR-ZUORDNUNG PRÜFEN');
 Match.assign(rows,'1:1',items()[0],()=>true);
 assert.equal(Report.build(rows,[items()[0]],inventory(),Match).reportRows.length,0);
});
