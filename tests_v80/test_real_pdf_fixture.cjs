const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require('../service_pdf_core.js');
global.LVServicePDFCore=core;
require('../service_pdf_v80.js');
const el=(str,x,y)=>({str,x,y,width:String(str).length*5,height:9});
const children=[['31482','SCM50.A10','Croissomat'],['31497','SRL550.A','BrotStar 3000'],['31498','SFA6127H.A0','Compas 3000'],['36415','ZKWV6007P.D','Kalibrierwalzwerk'],['36385','','Abwieger CTT7500']];
const tb=(y,no,qty)=>[el('Produkt',50,y),el('Beschreibung',200,y),el('Istmenge',400,y),el(no,50,y-20),el('Material '+no,200,y-20),el(''+qty,400,y-20)];
test('Zusammengefasster RONDO-Bericht: Hauptticket und fünf Untertickets korrekt zugeordnet',()=>{
 const doc={filename:'ZusFassung_20261027160441.pdf',pages:[
  {number:1,width:595,items:[el('RONDO',450,800),el('Bäckerei Borggräfe GmbH & Co. KG',55,730),el('Ticket 36416',55,700),el('REGISTRIERTES PRODUKT: Polyline 7,6m mit Touch Panel',55,610),el('PRODUKT ID: PMML113.B',55,580)]},
  {number:2,width:595,items:[el('Ticket 36416',55,760),...tb(700,'121321',1),el('Untertickets',55,640),el('Nummer Betreff Angelegt am',55,619),...children.map(([ticket,code,machine],i)=>el(`${ticket} Wartung Bäckerei Borggräfe GmbH & Co. KG ${code} ${machine} 27.10.2026`,55,600-i*21)),...tb(445,'120667',1)]},
  {number:3,width:595,items:[el('Ticket 36416',55,760),...tb(700,'50928',1),...tb(530,'122775T03',4),...tb(360,'GE063580020A',1),...tb(190,'I1000007',1)]}]};
 const parsed=core.parseDocument(doc);
 assert.deepEqual(parsed.items.map(i=>i.ticket),['36416','31482','31497','31498','36415','36385']);
 assert.equal(parsed.items[0].machine_code,'PMML113.B');
 assert.equal(parsed.items[2].machine_code,'SRL550.A');
 assert.equal(parsed.items[5].machine_code,'');
 assert.equal(parsed.items[5].machine,'Abwieger CTT7500');
 assert.equal(parsed.table_count,6);
 assert.equal(parsed.metadata.service_date,'2026-10-27');
});
