'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const OCR=require('./v88_ocr.js');
const SW=require('./service-worker.js');
const fs=require('node:fs');
const path=require('node:path');
const parser=(text,page,words)=>({page,positions:(words||[]).map((w,i)=>({position:i+1,article_no:w.text,description:'Rondo Testteil',verified:true,counted_stock:null}))});
test('HTML-Update lädt V87/V88 in korrekter Reihenfolge',()=>{
 const html='<!doctype html><body><script src="app.js"></script></body>';
 const out=SW.injectHtml(html);
 assert.ok(out.indexOf('v87_core.js')<out.indexOf('v87_pdf.js'));
 assert.ok(out.indexOf('v87_pdf.js')<out.indexOf('v87_ui.js'));
 assert.ok(out.indexOf('v87_ui.js')<out.indexOf('v88_ocr.js'));
 assert.ok(out.indexOf('tesseract.min.js')<out.indexOf('v87_core.js'));
 assert.equal((out.match(/v88_ocr\.js/g)||[]).length,1);
 assert.equal(SW.injectHtml(out),out,'mehrmaliges Einlesen darf nicht doppelt injizieren');
});
test('Bereits eingebaute V87-Skripte werden nicht doppelt injiziert',()=>{
 const html='<body><script src="v87_core.js"></script><script src="v87_pdf.js"></script><script src="v87_ui.js"></script></body>';
 const out=SW.injectHtml(html);
 assert.equal((out.match(/src="v87_core\.js"/g)||[]).length,1);
 assert.equal((out.match(/src="v88_ocr\.js"/g)||[]).length,1);
});
test('72. Seite verlangt 9, übrige Seiten 10 Zählpositionen',()=>{
 assert.equal(OCR.expectedCount(1),10);assert.equal(OCR.expectedCount(71),10);assert.equal(OCR.expectedCount(72),9);
});
test('Unleserliche Positionen und doppelte Positionen werden markiert',()=>{
 const input={page:1,positions:[
  {position:1,article_no:'11006138',description:'Sicherungsklemme',verified:true,counted_stock:5},
  {position:1,article_no:'11006489',description:'Transportband',verified:true,counted_stock:7},
  {position:2,article_no:'(?)',description:'?',verified:false,counted_stock:0}]};
 const res=OCR.auditPositions(input,null,[]);
 assert.equal(res.positions.length,2);
 assert.equal(res.positions[0].counted_stock,null);
 assert.equal(res.positions[0].verified,false);
 assert.equal(res.positions[1].verified,false);
 assert.ok(res.warnings.some(w=>w.includes('mehrfach')));
 assert.ok(res.warnings.some(w=>w.includes('2/10')));
});
test('Widerspruch zwischen zeilenbasierter und positionsbasierter OCR sperrt Verifikation',()=>{
 const spatial={parseRondoSpatial:()=>[{position:1,article_no:'22000661'}]};
 const r=OCR.auditPositions({page:1,positions:[{position:1,article_no:'22000662',description:'Welle',verified:true}]},spatial,[]);
 assert.equal(r.positions[0].verified,false);
 assert.match(r.positions[0].warning,/stimmt.*nicht überein/);
});
test('Nicht gezählt bleibt verschieden von ausdrücklich gezählter Null',()=>{
 assert.equal(OCR.isCounted({counted_stock:null}),false);
 assert.equal(OCR.isCounted({counted_stock:''}),false);
 assert.equal(OCR.isCounted({counted_stock:0}),true);
});
test('Qualität des zweiten OCR-Laufs wird objektiv bewertet',()=>{
 const first={data:{text:'',confidence:30}};
 const second={data:{text:'',confidence:75,blocks:[{paragraphs:[{lines:[{words:[
  {text:'11006138',bbox:{x0:30,y0:40,x1:100,y1:60}},
  {text:'11006489',bbox:{x0:30,y0:90,x1:100,y1:110}}
 ]}]}]}]}};
 const a=OCR.rateOcr(first,parser,1,{width:200,height:250});
 const b=OCR.rateOcr(second,parser,1,{width:200,height:250});
 assert.equal(a.positions,0);assert.equal(b.positions,2);
 assert.equal(OCR.chooseOcr(first,second,parser,1,{width:200,height:250},{width:200,height:250}),second);
});
test('Bounding Boxes werden nach Skalierung wieder auf Originalbild bezogen',()=>{
 const o={data:{blocks:[{bbox:{x0:0,x1:400,y0:0,y1:400},paragraphs:[{lines:[{words:[
  {text:'1000',bbox:{x0:200,x1:400,y0:100,y1:150}}
 ]}]}]}]}};
 OCR.rescaleOcrBboxes(o,0.5,0.25);
 assert.equal(o.data.blocks[0].paragraphs[0].lines[0].words[0].bbox.x0,100);
 assert.equal(o.data.blocks[0].paragraphs[0].lines[0].words[0].bbox.y0,25);
});
test('Service-Worker-Cache und Manifest tragen V88 und alle Update-Dateien sind vorhanden',()=>{
 assert.match(SW.CACHE_NAME,/lv88-1/);
 for(const f of ['service-worker.js','manifest.webmanifest','v88_ocr.js'])assert.ok(fs.statSync(path.join(__dirname,f)).size>100);
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.webmanifest')));
 assert.match(manifest.name,/V88\.1/);
});
test('V87-Quellcode wird ohne zusätzliche Benutzerschritte für V88 erweitert',()=>{
 const src=`async function scan(file,onProgress=()=>{}){
 const hash='x',bytes=new Uint8Array();const task={destroy:async()=>{}};let pdf=null,worker=null;
 try{
 pdf={numPages:72};if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');
 const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];
 for(let n=1;n<=pdf.numPages;n++){
 if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;
 await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});
 }
 return pages;
 }finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}
 }`;
 const transformed=SW.patchV87Ui(src);
 assert.match(transformed,/LV88_V87_UI_PATCH/);
 assert.match(transformed,/n%4===0/);
 assert.match(transformed,/pdf.numPages!==72/);
 assert.match(transformed,/pages.length>lastSavedCount/);
 assert.match(transformed,/x.positions.every\(r=>r.verified!==false\)/);
 assert.equal(SW.patchV87Ui(transformed),transformed);
 const vm=require('node:vm');
 assert.doesNotThrow(()=>new vm.Script(transformed));
});
test('719 Positionen der RONDO-Liste ohne stilles Hochzählen abbildbar',()=>{
 const pages=Array.from({length:72},(_,i)=>({
  page:i+1, positions:Array.from({length:OCR.expectedCount(i+1)},(_,j)=>({
   position:j+1,article_no:String(11000000+i*10+j),description:'Testartikel',counted_stock:null,verified:true
  }))
 }));
 const result=pages.map(p=>OCR.auditPositions(p,{
  parseRondoSpatial:(_w,page)=>pages[page-1].positions.map(r=>({...r}))
 },[]));
 const rows=result.flatMap(x=>x.positions);
 assert.equal(rows.length,719);
 assert.equal(rows.filter(r=>OCR.isCounted(r)).length,0);
 assert.ok(result.every(p=>!p.warnings.length));
});


test('V88.1: weisse Seiten-Vorschau sperrt OCR nicht mehr vorzeitig',async()=>{
 const vm=require('node:vm');
 const code=fs.readFileSync(path.join(__dirname,'v88_ocr.js'),'utf8');
 const plainPixels=new Uint8ClampedArray(256*352*4);plainPixels.fill(255);
 const doc={
  getElementById:()=>null,querySelector:()=>null,addEventListener:()=>{},
  createElement:(tag)=>({width:256,height:352,getContext:()=>({
   drawImage:()=>{},fillRect:()=>{},putImageData:()=>{},
   getImageData:()=>({data:plainPixels})
  })})
 };
 const base={parseOcrPage:()=>({page:1,positions:[]}),parseRondoSpatial:()=>[]};
 let recognitionCalls=0;
 const worker={recognize:async()=>{recognitionCalls++;return {data:{text:'',confidence:0,blocks:[]}}}};
 const fake={document:doc,addEventListener:()=>{},navigator:{deviceMemory:4},
   LV87Core:base,Tesseract:{createWorker:async()=>worker},console:{warn:()=>{}}};
 fake.globalThis=fake;
 vm.runInNewContext(code,fake,{filename:'v88_ocr.js'});
 const wrapped=await fake.Tesseract.createWorker('deu+eng');
 const source={width:1000,height:1400};
 const result=await wrapped.recognize(source,{}, {text:true});
 assert.ok(recognitionCalls>=1,'Echter OCR-Lauf muss trotz heller Vorschau starten');
 assert.equal(result.data.text,'');
 assert.match(result.data._lv88_imageWarning,/Bildprüfung sieht kaum Schrift/);
});

test('V88.1: der Service Worker merkt sich die PDF-Datei fuer einen Retry',()=>{
 const example=`async function scan(file,onProgress=()=>{}){
 const hash='x',bytes=new Uint8Array();let pdf=null,worker=null;
 try{pdf={numPages:72};if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');
 const previous=await getPdf().catch(()=>null),pages=(previous?.hash===hash&&Array.isArray(previous.pages))?previous.pages.filter(x=>Array.isArray(x.positions)&&x.positions.length>0):[];
 for(let n=1;n<=pdf.numPages;n++){if(pages.some(x=>x.page===n&&x.positions?.length>=(n===pdf.numPages?9:10)))continue;
 await storePdf({hash,filename:file.name,bytes,pages,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});}
 return pages;
 }finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy()}
 }
 async function readPdf(file,mode='annual'){
 if(!file)return alert('Bitte zuerst die RONDO-PDF auswählen.');if(scanBusy)return;
 $('lv87Resume').onclick=()=>readPdf($('lv87ChooseFile').files[0],stagingMode)
 }`;
 const transformed=SW.patchV87Ui(example);
 assert.match(transformed,/let lv88LastReadPdf=null/);
 assert.match(transformed,/if\(!file\)file=lv88LastReadPdf/);
 assert.match(transformed,/files\[0\]\|\|lv88LastReadPdf/);
 assert.equal(SW.patchV87Ui(transformed),transformed);
});

test('V88.1: volle Bildwarnung ist ein Hinweis, keine OCR-Sperre',()=>{
 const source=fs.readFileSync(path.join(__dirname,'v88_ocr.js'),'utf8');
 assert.doesNotMatch(source,/if\(!quality\.ok\)throw Error/);
 assert.match(source,/if\(!quality\.ok\)/);
 assert.match(source,/Texterkennung wird trotzdem durchgeführt/);
});
