// Integrationstest: der ECHTE V79-PDF-Parser wird nach V80-Erweiterung aufgerufen.
// Verwendet ausschliesslich synthetische, nicht kundenbezogene Beispieldaten.
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.resolve(__dirname,'../service_pdf_core.js'));
global.LVServicePDFCore=core;
require(path.resolve(__dirname,'../service_pdf_v80.js'));
const el=(str,x,y)=>({str,x,y,width:str.length*5,height:9});
const mainNo='38201';
const under=[
  ['38202','SCM50.A10','Croissomat 50'],
  ['38203','SRL550.A','BrotStar 3000'],
  ['38204','SFA6127H.A0','Compas 3000'],
  ['38205','ZKWV6007P.D','Kalibrierwalzwerk'],
  ['38206','', 'Abwieger CTT7500']
];
function table(y,no,qty,withDate=false){
 const xs=withDate?[50,200,405,530]:[50,200,405];
 const heads=withDate?['Produkt','Beschreibung','Istmenge','Datum']:['Produkt','Beschreibung','Istmenge'];
 return [
  ...heads.map((str,i)=>el(str,xs[i],y)),
  el(no,xs[0],y-24),el('Ersatzteil '+no,xs[1],y-24),el(''+qty+(withDate?' Stueck':''),xs[2],y-24),
  ...(withDate?[el('27.10.2026',xs[3],y-24)]:[])
 ];
}
const pages=[
 {number:1,width:595,items:[
  el('RONDO',450,800),el('Baeckerei Muster GmbH & Co. KG',55,735),
  el('Ticket 38201',55,660),
  el('REGISTRIERTES PRODUKT: Polyline 7,6m mit Touch Panel',55,575),
  el('PRODUKT ID: PMML113.B',55,552)
 ]},
 {number:2,width:595,items:[
  el('RONDO',450,800),el('Ticket 38201',55,780),
  ...table(720,'121321',1,true),
  el('Untertickets',55,640),el('Nummer Betreff Angelegt am',55,617),
  ...under.flatMap(([ticket,code,machine],i)=>[el(`${ticket} Wartung Baeckerei Muster GmbH & Co. KG ${code} ${machine} 27.10.2026`,55,596-i*20)]),
  ...table(465,'50045',2)
 ]},
 {number:3,width:595,items:[
  el('RONDO',450,800),el('Ticket 38201',55,780),
  ...table(720,'50928',1),...table(560,'126335T02',3),
  ...table(400,'GE063580020A',1),...table(240,'I1000007',2),
 ]}
];
function fixture(){return {filename:'service_20261027160441.pdf',pages}}
test('Ende-zu-Ende-PDF-Parser: 1 Hauptticket und 5 Untertickets samt Materialpositionen',()=>{
 const result=core.parseDocument(fixture());
 assert.equal(result.table_count,6,JSON.stringify(result.warnings));
 assert.equal(result.items.length,6);
 assert.equal(result.subtickets.length,5);
 assert.deepEqual(result.items.map(x=>x.ticket),[mainNo,...under.map(x=>x[0])]);
 assert.deepEqual(result.items.map(x=>x.machine_code),['PMML113.B',...under.map(x=>x[1])]);
 assert.equal(result.items[2].machine,'BrotStar 3000');
 assert.equal(result.items[5].machine,'Abwieger CTT7500');
 assert.equal(result.items[5].machine_code,'');
 assert.equal(result.items[2].article_no,'50928');
 assert.equal(result.items[2].quantity,1);
});
test('Servicepositionen werden nicht versehentlich als Ersatzteile gebucht',()=>{
 const f=fixture(); f.pages[1].items.push(...table(380,'10000082',2));
 const parsed=core.parseDocument(f);
 assert.ok(parsed.excluded.some(x=>x.article_no==='10000082'));
 // Zusaetzliche Tabelle sorgt bewusst dafuer, dass die Zuordnung der Untertickets nicht erzwungen wird.
 assert.equal(parsed.items[1].machine,'');
 assert.match(parsed.warnings.join(' '),/Materialtabellen/);
});
