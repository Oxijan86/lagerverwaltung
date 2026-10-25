(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LVServicePDFCore=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clean=v=>String(v??'').replace(/\u00ad/g,'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
 const norm=v=>clean(v).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function unit(value){const u=norm(value).replace(/[.()]/g,'');if(/^(stuck|stueck|stk|st|pcs?|pieces?|ea)$/.test(u))return 'Stk.';if(/^(m|meter|metre|meters|metres)$/.test(u))return 'm';if(/^(l|liter|litre|liters|litres)$/.test(u))return 'l';if(/^(kg|kilogramm|kilogram)$/.test(u))return 'kg';if(/^(g|gramm|gram)$/.test(u))return 'g';return clean(value)}
 function date(value){const s=clean(value);let y,m,d,a;if((a=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/))){[,d,m,y]=a}else if((a=s.match(/^(\d{4})-(\d{2})-(\d{2})$/))){[,y,m,d]=a}else return '';const v=new Date(Date.UTC(+y,+m-1,+d));return v.getUTCFullYear()===+y&&v.getUTCMonth()===+m-1&&v.getUTCDate()===+d?`${y}-${m}-${d}`:''}
 // The first eight digits of the export timestamp are YYYYMMDD; time is ignored.
 function filenameDate(value){const m=clean(value).replace(/^.*[\\/]/,'').match(/(?:^|[^0-9])((?:19|20|21)\d{2})(\d{2})(\d{2})(?=\d{6}(?:[^0-9]|$)|[^0-9]|$)/);return m?date(`${m[1]}-${m[2]}-${m[3]}`):''}
 function historyMatches(history,customer,dates,doc={}){const name=norm(customer),days=new Set(dates.filter(Boolean));if(!name||!days.size)return [];return (history||[]).filter(h=>norm(h.customer)===name&&days.has(h.movement_date)&&!(h.file_hash&&h.file_hash===doc.file_hash)&&!(h.content_hash&&[doc.content_hash,doc.legacy_content_hash].includes(h.content_hash)))}
 function historyKey(matches){return JSON.stringify(matches.map(h=>[h.customer,h.movement_date,h.filename||'',h.ticket||'',h.source||'',h.created_at||'',h.file_hash||'',h.content_hash||'']).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))}
 function quantity(value){const s=clean(value);if(!/^[+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(s))return null;const n=Number(s.replace(',','.'));return Number.isFinite(n)&&n>0?n:null}
 function serviceReason(no,description,u){
  if(['10000074','10000082','10000084','10000099'].includes(clean(no)))return 'Arbeitszeit, Reisezeit, Wartungsleistung oder Fahrtkosten';
  if(/^(?:h|std\.?|stunden?(?:\(n\))?|hours?|hrs?|min(?:uten?)?|km|kilometer|kilometre|miles?)$/i.test(clean(u)))return 'Zeit- oder Kilometerposition';
  if(/(?:fahr\s*[-/]?\s*reisezeit|fahrzeit|reisezeit|arbeitszeit|fahrtkosten|travel\s*(?:time|costs?)|working\s*time|labou?r\s*(?:time|costs?)|inspection\s*\/\s*maintenance|inspektion\s*\/\s*wartung|versandkosten|frachtkosten|shipping\s*costs?)/i.test(description))return 'Dienstleistungs- oder Kostenposition';
  return '';
 }
 function groupItems(items,page=1,ocr=false){
  const parts=(items||[]).filter(p=>p&&clean(p.str)).map(p=>({text:clean(p.str),x:Number(p.x??p.transform?.[4]),y:Number(p.y??p.transform?.[5]),width:Number(p.width)||0,height:Math.abs(Number(p.height)||Number(p.transform?.[3])||8)})).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).sort((a,b)=>b.y-a.y||a.x-b.x),lines=[];
  for(const p of parts){let l=lines.findLast(x=>Math.abs(x.y-p.y)<=(ocr?5:Math.max(1.5,Math.min(3,p.height*.25))));if(!l){l={page,y:p.y,parts:[]};lines.push(l)}l.parts.push(p)}
  for(const l of lines){l.parts.sort((a,b)=>a.x-b.x);l.text=l.parts.map(x=>x.text).join('\t')}
  return lines.sort((a,b)=>b.y-a.y);
 }
 function parseDocument(doc){
  if(!doc||!Array.isArray(doc.pages)||doc.pages.length<1||doc.pages.length>80)throw Error('Ungültige PDF-Seiten. Maximal 80 Seiten pro Bericht.');
  const pages=doc.pages.map((p,i)=>({...p,number:Number(p.number)||i+1,lines:groupItems(p.items,Number(p.number)||i+1,!!p.ocr)})),lines=pages.flatMap(p=>p.lines),all=lines.map(l=>l.text).join('\n');
  if(!/RONDO/i.test(all)||!/(?:Ticket\s*\d+|Servicebericht|Service\s*report)/i.test(all))throw Error('Kein erkennbarer RONDO-Servicebericht. Bitte die richtige PDF auswählen.');
  const ticket=all.match(/\bTicket\s*([0-9]+)/i)?.[1]||'',first=pages[0],ticketLine=first.lines.findIndex(l=>/\bTicket\s*\d+/i.test(l.text));
  const address=first.lines.slice(0,ticketLine<0?0:ticketLine).map(l=>clean(l.parts.filter(p=>p.x<(Number(first.width)||595)*.52).map(p=>p.text).join(' '))).filter(x=>x&&!/@|rondo|www\.|^tel\.|^fax\./i.test(x));
  const field=label=>{const l=lines.find(l=>clean(l.text).includes(label+':'));return l?clean(l.text).split(label+':')[1].split(/\s+[A-ZÄÖÜ][A-ZÄÖÜ -]{2,}:/)[0].trim():''};
  const machineLine=lines.find(l=>/^Anlage\s*:/i.test(clean(l.text))),machine=(machineLine?clean(machineLine.text.replace(/^Anlage\s*:\s*/i,'')):field('REGISTRIERTES PRODUKT')).split(/\s+(?:Art|Typ)\s*:/i)[0];
  const metadata={ticket,customer:address[0]||'',machine,technician:field('SERVICETECHNIKER'),reported_date:date(field('GEMELDET AM')),service_date:filenameDate(doc.filename)};
  const items=[],excluded=[],warnings=[];let tableCount=0;
  for(const p of pages){
   let header=null,pending=null;
   const flush=()=>{
    if(!pending)return;
    const x=pending;pending=null;x.description=clean(x.description);x.source_text=clean(x.source_text).slice(0,1800);
    const match=clean(x.amount).match(/^([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))\s*(.*)$/),rawUnit=match?.[2]||'',reason=serviceReason(x.article_no,x.description,rawUnit);
    if(reason){excluded.push({...x,reason});return}
    x.quantity=quantity(match?.[1]||'');x.unit=unit(rawUnit);x.movement_date=date(x.raw_date);x.warnings=[];
    if(!x.quantity)x.warnings.push('Menge fehlt, ist ungültig oder nicht positiv.');
    if(!metadata.service_date&&!x.movement_date)x.warnings.push('Leistungsdatum fehlt. Bitte ergänzen.');
    if(p.ocr)x.warnings.push('Texterkennung (OCR): Artikelnummer und Menge sorgfältig prüfen.');
    x.ocr=!!p.ocr;x.position_key='material:'+items.length;items.push(x);
   };
   for(const l of p.lines){
    const product=l.parts.find(x=>/^(?:Produkt|Product|Artikel(?:nummer)?)$/i.test(x.text)),description=l.parts.find(x=>/^(?:Beschreibung|Description|Bezeichnung)$/i.test(x.text)),amount=l.parts.find(x=>/^(?:Istmenge|Actual\s*quantity|Menge|Quantity)$/i.test(x.text)),day=l.parts.find(x=>/^(?:Datum|Date)$/i.test(x.text));
    if(product&&description&&amount){flush();header={product:product.x,description:description.x,amount:amount.x,date:day?.x??Infinity,id:++tableCount};continue}
    if(!header)continue;
    if(/(?:Unterschrift|Untertickets|Komplementar|Sparkasse|Deutsche Bank|Commerzbank|IBAN|USt\.-Id|Rechtsform|Steuer-Nr|^Ticket\b|RONDO GmbH)/i.test(l.text)){flush();header=null;continue}
    const join=(lo,hi)=>clean(l.parts.filter(x=>x.x>=lo-3&&x.x<hi-3).map(x=>x.text).join(' '));
    const no=join(header.product,header.description).replace(/\s+/g,''),desc=join(header.description,header.amount),qty=join(header.amount,header.date),dt=Number.isFinite(header.date)?join(header.date,Infinity):'';
    if(/^(?=.*\d)[A-Za-z0-9][A-Za-z0-9_./-]{1,39}$/.test(no)){
     flush();pending={article_no:no,description:desc,amount:qty,raw_date:dt,source_text:l.text,page:p.number,table:header.id};
    }else if(pending&&!no&&(desc||qty||dt)){
     pending.description+=' '+desc;if(qty){if(pending.amount)pending.amount+=' ';pending.amount+=qty}if(dt)pending.raw_date+=' '+dt;pending.source_text+=' '+l.text;
    }
   }
   flush();
   if(p.text_missing)warnings.push(`Seite ${p.number}: kein auslesbarer Text. Bei einem Scan die OCR-Option aktivieren.`);
  }
  const seen=new Map();
  for(const x of items){const k=[norm(x.article_no),x.quantity].join('|'),old=seen.get(k);x.possible_duplicate=!!(old&&old.table!==x.table&&(metadata.service_date||!old.movement_date||!x.movement_date||old.movement_date===x.movement_date));if(x.possible_duplicate)x.warnings.push(`Mögliche Wiederholung einer Position aus Tabelle ${old.table}. Nur bei zusätzlichem Verbrauch auswählen.`);if(!old)seen.set(k,x)}
  if(!tableCount)warnings.push('Keine Materialtabelle mit Produkt, Beschreibung und Istmenge erkannt. Angaben im Fließtext werden nicht automatisch abgebucht.');
  // Keep V77's signature so its already booked rows remain protected after updating.
  const legacy_canonical=JSON.stringify({ticket,customer:metadata.customer,machine,items:items.map(x=>[x.article_no,x.quantity,x.unit,x.movement_date])});
  for(const x of items){x.reported_movement_date=x.movement_date;if(metadata.service_date)x.movement_date=metadata.service_date}
  if(!metadata.service_date)warnings.push('Kein gültiges Datum im PDF-Dateinamen erkannt. Leistungsdatum aus der Tabelle prüfen oder ergänzen.');
  const dates=metadata.service_date?[metadata.service_date]:[...new Set([...items.map(x=>x.movement_date),...excluded.map(x=>date(x.raw_date))].filter(Boolean))];
  return {metadata,items,excluded,warnings,table_count:tableCount,dates,legacy_canonical,canonical:JSON.stringify({ticket,customer:metadata.customer,machine,items:items.map(x=>[x.article_no,x.quantity,x.movement_date])})};
 }
 return {clean,norm,unit,date,filenameDate,historyMatches,historyKey,quantity,serviceReason,groupItems,parseDocument};
});
