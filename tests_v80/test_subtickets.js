const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const original={
 clean,
 groupItems(items){return items.map(x=>({text:x.str}));},
 parseDocument(doc){
  return {metadata:{ticket:'36416',machine:'Polyline 7,6m mit Touch Panel',customer:'Bäckerei Borggräfe GmbH & Co. KG'},
    items:doc.materials.map(x=>({...x})),excluded:[],warnings:[],table_count:doc.table_count};
 }
};
global.LVServicePDFCore=original;
const mod=require('../service_pdf_v80.js');
const subjects=[
 ['31482','Wartung Bäckerei Borggräfe GmbH SCM50.A10 Croissomat Croissantmaschine','SCM50.A10','Croissomat Croissantmaschine'],
 ['31497','Wartung Bäckerei Borggräfe GmbH & Co. KG SRL550.A BrotStar 3000','SRL550.A','BrotStar 3000'],
 ['31498','Wartung Bäckerei Borggräfe GmbH & Co. KG SFA6127H.A0 COMPAS 3000 Teigausrollau','SFA6127H.A0','COMPAS 3000 Teigausrollau'],
 ['36415','Wartung Bäckerei Borggräfe GmbH & Co. KG ZKWV6007P.D Kal.walzwerk fest,verb.,PMM','ZKWV6007P.D','Kal.walzwerk fest,verb.,PMM'],
 ['36385','Wartung Bäckerei Borggräfe GmbH & Co. KG Abwieger CTT7500 Teigteiler 7500','','Abwieger CTT7500 Teigteiler 7500']
];
function fixture(n=6){return {
 pages:[{number:1,items:[{str:'PRODUKT ID: PMML113.B'},{str:'REGISTRIERTES PRODUKT: Polyline 7,6m mit Touch Panel'}]},
        {number:4,items:[{str:'Untertickets'},{str:'Nummer Betreff Angelegt am'},...subjects.map(x=>({str:`${x[0]} ${x[1]} 15.01.2026`})),{str:'Positionen'}]}],
 table_count:n,
 materials:[{article_no:'121321',quantity:1,table:1},...subjects.map((x,i)=>({article_no:'A'+i,quantity:1,table:i+2}))]
}}
test('technische Typkennungen trotz zusätzlicher Leerzeichen normalisieren',()=>{
 assert.deepEqual(mod.machineFromSubject('Wartung Beispiel GmbH SRL 550.A Brotstar 3000'),{code:'SRL550.A',machine:'Brotstar 3000',subject:'Wartung Beispiel GmbH SRL 550.A Brotstar 3000'});
});
test('technische Typkennungen und Maschine sauber trennen',()=>{
 for(const [ticket,subject,code,machine] of subjects){
  const found=mod.machineFromSubject(subject);assert.equal(found.code,code,ticket);assert.equal(found.machine,machine,ticket);
 }
});
test('Ein Bericht mit einem Hauptticket und 5 Untertickets ordnet 6 Materialtabellen zu',()=>{
 const p=original.parseDocument(fixture());
 assert.equal(p.subtickets.length,5);
 assert.equal(p.items[0].ticket,'36416');
 assert.equal(p.items[0].machine_code,'PMML113.B');
 assert.equal(p.items[0].machine,'Polyline 7,6m mit Touch Panel');
 for(let i=0;i<5;i++){
  assert.equal(p.items[i+1].ticket,subjects[i][0]);
  assert.equal(p.items[i+1].machine_code,subjects[i][2]);
  assert.equal(p.items[i+1].machine,subjects[i][3]);
 }
});
test('Tabellenanzahl ungleich Untertickets: keine ungesicherte Maschinenzuordnung',()=>{
 const p=original.parseDocument(fixture(5));
 assert.match(p.warnings[0],/statt 6/);
 for(const r of p.items.slice(1)){assert.equal(r.machine,'');assert.equal(r.ticket,'')}
});
test('Unterticket ohne identifizierbare Maschine bleibt bewusst leer',()=>{
 const f=fixture();f.pages[1].items[2].str='31482 Wartung unlesbar 15.01.2026';
 const p=original.parseDocument(f);
 assert.equal(p.items[1].ticket,'31482');assert.equal(p.items[1].machine,'');
});
test('Hauptticket-Typkennung liefert auch Suche nach PMML113.B',()=>{
 const p=original.parseDocument(fixture());assert.equal(p.items[0].machine_code,'PMML113.B');
});
