"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/v88_4_export.js','utf8');
const sw=fs.readFileSync(__dirname+'/service-worker.js','utf8');
const a=src.indexOf("  $('lv8818ExportProgress').onclick=()=>{");
const z=src.indexOf("  $('lv8818ImportProgress').onclick",a);
assert.ok(a>0&&z>a,'JSON download event bound');
const snippet=src.slice(a,z);
test('JSON-Sicherung ist eine eigenstaendige lesende Operation, ohne await speichern',()=>{
 assert.doesNotMatch(snippet,/await\s+ctx\.saveMappings/);
 assert.doesNotMatch(snippet,/ctx\.saveMappings/);
 assert.match(src,/LV8819_READ_ONLY_JSON_BACKUP/);
 assert.match(src,/id="lv8819BackupStatus"/);
});
test('JSON-Sicherung wird synchron durch Benutzerklick gestartet, auch wenn offene/rote Zeilen existieren',()=>{
 const events=[],fakeElements={},feedback={textContent:''},status={textContent:''};
 fakeElements['lv8818ExportProgress']={disabled:false};fakeElements.lv8819BackupStatus=feedback;
 const $=id=>fakeElements[id];
 const blobUrls=new Map();let n=0;
 const FakeURL={createObjectURL:b=>{const url='blob:test-'+(++n);blobUrls.set(url,b);return url},revokeObjectURL:u=>events.push('revoke:'+u)};
 const fakeDoc={body:{appendChild:el=>events.push('append:'+el.download)},createElement:()=>({href:'',download:'',click(){events.push('click:'+this.download)},remove(){events.push('remove')}})};
 const progressData=()=>({format:'RONDO-PDF-PRUEFSTAND',pdf_hash:'ab',database_id:'id',positions:[{key:'1:1',article_no:'I1000007',verified:false,review_action:'defer'}]});
 const saveMappings=()=>{throw Error('Konflikt darf nicht aufgerufen werden')};
 const txt=(el,s)=>{el.textContent=s};
 const root={ $,progressData,Blob,URL:FakeURL,document:fakeDoc,setTimeout:()=>{},txt,status,ctx:{saveMappings},console};
 const vm=require('node:vm');vm.runInNewContext(snippet,root);
 root.$('lv8818ExportProgress').onclick();
 assert.equal(events.filter(x=>x.startsWith('click:')).length,1);
 assert.match(events.find(x=>x.startsWith('click:')),/RONDO_PDF_Pruefstand_/);
 assert.match(feedback.textContent,/inklusive offener\/roter Positionen/);
 assert.equal(fakeElements.lv8818ExportProgress.disabled,false);
});
test('Downloadfehler wird im sichtbaren Status am Knopf ausgegeben',()=>{
 const feedback={textContent:''},status={textContent:''},btn={disabled:false};
 const root={$:id=>id==='lv8819BackupStatus'?feedback:btn,progressData:()=>({positions:[{key:'1:1'}]}),Blob,URL:{createObjectURL:()=>{throw Error('Download gesperrt')}},document:{},setTimeout:()=>{},txt:(el,s)=>{el.textContent=s},status};
 require('node:vm').runInNewContext(snippet,root);btn.onclick();
 assert.match(feedback.textContent,/Download gesperrt/);assert.match(status.textContent,/Download gesperrt/);
});
test('SW-Cache und alle Module verwenden neue Version zur Cache-Invalidierung',()=>{
 assert.match(sw,/CACHE_NAME='lv88-19-/);
 assert.match(sw,/v88_4_export\.js\?v=88\.19/);
 assert.match(sw,/v88_11_location_core\.js\?v=88\.19/);
 assert.doesNotMatch(sw,/\?v=88\.18/);
 assert.match(sw,/Lagerverwaltung V88\.19:/);
});
