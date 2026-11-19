'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const SW=require('./service-worker.js'),Tech=require('./v88_8_technician.js');
const pdfPath=process.env.RONDO_PDF_PATH||'/mnt/data/Inventurliste Lovrencic 1025(1).pdf';

test('Real 72-page RONDO original still matches the established SHA',t=>{
 if(!fs.existsSync(pdfPath))return t.skip('Private RONDO PDF intentionally not contained in GitHub ZIP; optional RONDO_PDF_PATH');
 const original=fs.readFileSync(pdfPath);
 const C=require('./v88_2_catalog.js');
 assert.equal(crypto.createHash('sha256').update(original).digest('hex'),C.SHA256);
 assert.equal(C.pages().length,72);
 assert.equal(C.pages().reduce((n,p)=>n+p.positions.length,0),719);
});
test('V88.18 install includes technician dialog BEFORE RONDO UI script',()=>{
 const html=SW.injectHtml('<html><body>App</body></html>');
 assert(html.indexOf('v88_8_technician.js?v=88.18')<html.indexOf('v87_ui.js?v=88.18'));
 assert.match(html,/v88_6_pdf.js\?v=88\.18/);
 assert.equal(SW.injectHtml(html),html);
 assert.match(SW.CACHE_NAME,/88-17/);
});
test('V88.7 cached HTML is replaced by V88.18, not loaded twice',()=>{
 const old=SW.injectHtml('<html><body>App</body></html>')
  .replace(/V88\.18/g,'V88.7').replace(/88\.18/g,'88.7');
 const current=SW.injectHtml(old);
 assert.match(current,/v88_8_technician\.js\?v=88\.18/);
 assert.doesNotMatch(current,/<script src="v87_ui\.js\?v=88\.7/);
 assert.equal((current.match(/<script src="v87_ui\.js/g)||[]).length,1);
});
test('Client-side confirm hook is attached idempotently, preserving old edits',()=>{
 const source='/* LV886_DEFERRED_IMPORT */\nconst post=(url,d)=>window.api(url,{method:\'POST\',body:JSON.stringify(d)});';
 const patched=SW.patchV888Ui(source);
 assert.match(patched,/LV888_TECH_CONFIRM_UI/);
 assert.match(patched,/LV888Technician\.post/);
 assert.equal(SW.patchV888Ui(patched),patched);
});
test('Server patch changes EXACTLY the article-only validator',()=>{
 const fixture=`function check(p,d){\n if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){\n  const isCreateAndBook=p==='/api/import/create-and-book';\n  const newItems=Array.isArray(isCreateAndBook?d.new_items:d.items)?(isCreateAndBook?d.new_items:d.items):[];\n  const knownItems=Array.isArray(d.known_items)?d.known_items:[];\n  const technician=String(d.technician||'Tobias').trim();\n  const validTech=['Tobias'];if(technician==='Tobias'&&!validTech.includes(technician))validTech.push(technician);\n  if(!technician||!validTech.includes(technician))throw Error('Techniker ist nicht gültig.');\n  const operationId=String(d.operation_id||'').trim();\n  return 'allowed';\n }return 'other route';\n}\nreturn check`;
 const patched=SW.patchV888Backend(fixture);
 const check=(new Function(patched))();
 const zero=[{article_no:'11006138',initial_stock:0,quantity:0}];
 assert.throws(()=>check('/api/articles/create-import',{technician:'Andere Person',items:zero}),/Techniker ist nicht gültig/);
 assert.equal(check('/api/articles/create-import',{technician:'Andere Person',items:zero,allow_technician_mismatch:true}),'allowed');
 assert.equal(check('/api/articles/create-import',{technician:'Tobias',items:zero}),'allowed');
 assert.throws(()=>check('/api/articles/create-import',{technician:'Andere Person',items:[{initial_stock:3}],allow_technician_mismatch:true}),/Techniker ist nicht gültig/);
 assert.throws(()=>check('/api/articles/create-import',{technician:'Andere Person',items:[{quantity:1}],allow_technician_mismatch:true}),/Techniker ist nicht gültig/);
 assert.throws(()=>check('/api/articles/create-import',{technician:'Andere Person',items:[],allow_technician_mismatch:true}),/Techniker ist nicht gültig/);
 assert.throws(()=>check('/api/import/create-and-book',{technician:'Andere Person',new_items:zero,allow_technician_mismatch:true}),/Techniker ist nicht gültig/);
 assert.equal(check('/api/inventory-v75/commit',{technician:'Andere Person',items:zero,allow_technician_mismatch:true}),'other route');
 assert.equal(SW.patchV888Backend(patched),patched);
});
test('Approval requires zero-stock items and no automatic error bypass',()=>{
 assert(Tech.onlyZeroStock([{initial_stock:0},{initial_stock:'0',quantity:0}]));
 assert(!Tech.onlyZeroStock([{initial_stock:1}]));
 assert(!Tech.onlyZeroStock([{quantity:4}]));
 assert(!Tech.onlyZeroStock([]));
 assert(!Tech.onlyZeroStock([{initial_stock:'abc'}]));
 assert(Tech.mismatch(new Error('Techniker ist nicht gültig.')));
 assert(!Tech.mismatch(new Error('Ungültige Bestandsmenge')));
});
test('Confirmed mismatch retries article import ONCE, and remembers across 45-item chunks',async()=>{
 const old=global.confirm;let prompts=0;global.confirm=msg=>{prompts++;assert.match(msg,/Andere Person/);assert.match(msg,/Tobias/);return true};
 let commits=[];
 const api=async(url,opt)=>{
  if(url==='/api/masterdata')return {default_technician:'Tobias',technicians:[{name:'Tobias',active:1}]};
  const data=JSON.parse(opt.body);commits.push(data);
  if(data.technician!=='Tobias'&&!data.allow_technician_mismatch)throw Error('Techniker ist nicht gültig.');
  return {ok:true,created:data.items.length};
 };
 try{
  for(let i=0;i<2;i++){
   const items=[{article_no:String(i+1),initial_stock:0,quantity:0}];
   assert.equal((await Tech.post('/api/articles/create-import',{technician:'Andere Person',items,operation_id:'real-pdf-123'},api)).created,1);
  }
  assert.equal(prompts,1);assert.equal(commits.length,3);
  assert.equal(commits[1].allow_technician_mismatch,true);
  assert.equal(commits[2].allow_technician_mismatch,true);
 }finally{if(old===undefined)delete global.confirm;else global.confirm=old}
});
test('Cancel prevents retry/commit and leaves inventory untouched',async()=>{
 const old=global.confirm;global.confirm=()=>false;let attempts=0;
 const api=async(url,opt)=>{
  if(url==='/api/masterdata')return {default_technician:'Tobias'};
  attempts++;throw Error('Techniker ist nicht gültig.');
 };
 try{await assert.rejects(Tech.post('/api/articles/create-import',{operation_id:'cancelled',technician:'Andere Person',items:[{initial_stock:0,quantity:0}]},api),/abgebrochen/);assert.equal(attempts,1)}
 finally{if(old===undefined)delete global.confirm;else global.confirm=old}
});
test('No bypass for bookings or non-technician errors',async()=>{
 const old=global.confirm;let prompts=0;global.confirm=()=>{prompts++;return true};
 const api=async(url,opt)=>{throw Error(url==='/api/articles/create-import'?'Materialnummer ungültig':'Techniker ist nicht gültig.')};
 try{
  await assert.rejects(Tech.post('/api/import/create-and-book',{technician:'Andere Person'},api),/Techniker ist nicht gültig/);
  await assert.rejects(Tech.post('/api/articles/create-import',{technician:'Andere Person',items:[{initial_stock:0}]},api),/Materialnummer ungültig/);
  assert.equal(prompts,0);
 }finally{if(old===undefined)delete global.confirm;else global.confirm=old}
});
test('Help and version are aligned',()=>{
 for(const name of ['manifest.webmanifest','v88_ocr.js','v88_4_help.js'])assert.match(fs.readFileSync(path.join(__dirname,name),'utf8'),/V88\.18|88\.18/);
 assert.match(fs.readFileSync(path.join(__dirname,'v88_4_help.js'),'utf8'),/Abweichender Technikername/);
});
