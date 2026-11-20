/* Lagerverwaltung Lovrencic V88.21 – pure safe PDF and inventory helpers.
 * No mutation of the database, inventory quantities, or stock balances. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LV8821Core=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const norm=s=>String(s??'').normalize('NFKC').toUpperCase().replace(/[\s.]/g,'');
 const desc=s=>String(s??'').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9ÄÖÜ]/g,'');
 const key=r=>String(r.key||`${r.page}:${r.position??r.pos}`);
 const present=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
 const integerUnit=u=>/^(?:STK\.?|STÜCK|SATZ|ROLLE|PACKUNG|KARTON)$/i.test(String(u||'').trim());
 const alt=s=>{const n=norm(s),a=new Set();if(n.startsWith('I'))a.add('1'+n.slice(1));if(n.startsWith('1'))a.add('I'+n.slice(1));if(n.includes('O'))a.add(n.replace(/O/g,'0'));if(n.includes('0'))a.add(n.replace(/0/g,'O'));return a};
 function classify(row,reference,articles,allRows=[]){
  const reasons=[],code=norm(row?.article_no);const relevant=(articles||[]).filter(a=>Number(a.active)!==0);
  if(!row||!reference)reasons.push('Keine verifizierte Originalposition');
  if(row?.review_v8820||row?.review_action||row?.checked_at||row?.manual_link)reasons.push('Bereits manuell bearbeitet');
  if(row?.verified===false||reference?.verified!==true||reference?.warning)reasons.push('OCR-Unsicherheit');
  if(!code||code!==norm(reference?.article_no))reasons.push('Artikelnummer widerspricht Originalreferenz');
  if(!desc(row?.description)||desc(row?.description)!==desc(reference?.description))reasons.push('Bezeichnung widerspricht Originalreferenz');
  if(String(row?.unit||'').trim().toLowerCase()!==String(reference?.unit||'').trim().toLowerCase())reasons.push('PDF-Einheit unsicher');
  const exact=relevant.filter(a=>norm(a.article_no)===code);
  if(exact.length!==1)reasons.push('Kein eindeutig aktiver Stammartikel');
  if(exact.length===1&&desc(exact[0].description)!==desc(row.description))reasons.push('Stammbezeichnung weicht ab');
  const alternatives=alt(code);if(relevant.some(a=>alternatives.has(norm(a.article_no))))reasons.push('I/1- oder O/0-Dublette vorhanden');
  if(/^(?:I100\d{4}|1100\d{4})$/.test(code))reasons.push('I/1-Nummern nur mit Sichtkontrolle');
  if((allRows||[]).some(r=>r!==row&&norm(r.article_no)===code))reasons.push('Material mehrfach in der PDF');
  return {allowed:reasons.length===0,reasons,key:key(row||{}),article_no:code};
 }
 function planAuto(rows,pages,articles,hash,knownHash){
  if(hash!==knownHash||!hash||!/^[0-9a-f]{64}$/.test(hash))throw Error('Die unveränderte, bekannte Original-RONDO-PDF ist erforderlich. Bei anderer Vorlage keine automatische Freigabe.');
  const refs=new Map((pages||[]).flatMap(p=>p.positions||[]).map(p=>[key(p),p]));
  if(refs.size!==719||(rows||[]).length!==719)throw Error('Positionenzahl der bekannten RONDO-PDF ist unerwartet. Automatische Prüfung unterbrochen.');
  const eligible=[],manual=[];
  for(const row of rows){const result=classify(row,refs.get(key(row)),articles,rows);(result.allowed?eligible:manual).push(result)}
  return {eligible,manual,total:rows.length};
 }
 const round=n=>Math.round(n*1e8)/1e8;
 function number(v,unit){const s=String(v??'').trim().replace(',','.');if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(s))throw Error('Bitte eine gültige positive oder Null-Menge eingeben.');const n=Number(s);if(!Number.isFinite(n)||n<0||(integerUnit(unit)&&!Number.isInteger(n)))throw Error('Ungültige Teilmenge für die Einheit.');return n}
 const identity=p=>JSON.stringify([Number(p.warehouse_id)||null,String(p.location||'').trim().toLocaleLowerCase('de-DE')]);
 function parseParts(row){let a=[];try{a=JSON.parse(row?.bin_parts_json||'[]')}catch{throw Error('Die gespeicherten Inventur-Teilmengen sind beschädigt.')}if(!Array.isArray(a)||a.length>80)throw Error('Ungültige Lagerort-Teilmengen.');return a.map(p=>({warehouse_id:Number(p.warehouse_id)||null,location:String(p.location||''),quantity:number(p.quantity,row.unit)}))}
 function relocation(row,{sourceKey='',target,quantity,whole=false}={}){
  if(!row||!present(row.counted_stock))throw Error('Der Artikel muss zuerst gezählt worden sein.');
  const count=number(row.counted_stock,row.unit);
  if(!target||!target.location||!Number.isSafeInteger(Number(target.warehouse_id))||Number(target.warehouse_id)<1)throw Error('Bitte ein vorhandenes Lager und einen gültigen Lagerort wählen.');
  const t={warehouse_id:Number(target.warehouse_id),location:String(target.location).trim()};
  let parts=parseParts(row);
  if(parts.length===0&&count>0)parts=[{warehouse_id:Number(row.warehouse_id)||null,location:String(row.location||''),quantity:count}];
  if(parts.length&&Math.abs(round(parts.reduce((sum,p)=>sum+p.quantity,0))-count)>1e-7)throw Error('Die Gesamtzählung weicht von der Aufteilung der Lagerorte ab. Erst prüfen.');
  if(whole){return {parts:count>0?[{...t,quantity:count}]:[],location:t.location,warehouse_id:t.warehouse_id,counted_stock:count,mode:'whole'}}
  const transfer=number(quantity,row.unit);if(transfer<=0)throw Error('Die umzulagernde Teilmenge muss größer als null sein.');
  const ix=parts.findIndex(p=>identity(p)===sourceKey);if(ix<0)throw Error('Der ursprüngliche Zähl-Lagerort wurde nicht gefunden.');
  if(transfer>parts[ix].quantity+1e-7)throw Error('Mehr als die am Ursprungsort gezählte Menge ausgewählt.');
  if(identity(parts[ix])===identity(t))throw Error('Quell- und Ziellagerort sind identisch.');
  parts[ix].quantity=round(parts[ix].quantity-transfer);const at=parts.findIndex(p=>identity(p)===identity(t));
  if(at>=0)parts[at].quantity=round(parts[at].quantity+transfer);else parts.push({...t,quantity:transfer});
  parts=parts.filter(p=>p.quantity>1e-8);
  if(parts.length>80||Math.abs(round(parts.reduce((sum,p)=>sum+p.quantity,0))-count)>1e-7)throw Error('Teilmengen stimmen nicht mit der gezählten Gesamtmenge überein.');
  return {parts,location:parts.length===1?parts[0].location:String(row.location||''),warehouse_id:parts.length===1?parts[0].warehouse_id:Number(row.warehouse_id)||null,counted_stock:count,mode:'partial'};
 }
 function history(row,session){const uncounted=!present(row.counted_stock);const n=uncounted?null:Number(row.counted_stock),base=Number(row.base_stock);return {inventory_id:String(session.id),name:String(session.name),date:session.completed_at||session.updated_at,uncounted,base,amount:n,difference:uncounted?null:round(n-base),status:uncounted?'Nicht gezählt – Buchbestand unverändert':n===0?'Mit 0 gezählt':'Gezählt'};}
 return {norm,desc,key,present,classify,planAuto,number,identity,parseParts,relocation,history};
});
