/* Lagerverwaltung Lovrencic V80 – read-only classification of multi-ticket PDFs.
   No stock changes occur during parsing. Every decision is auditable in preview. */
(function(root,factory){
 'use strict';
 const api=factory(root.LVServicePDFCore);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 'use strict';
 if(!core)throw Error('service_pdf_core.js muss vor service_pdf_v80.js geladen werden.');
 const clean=core.clean;
 const typePattern=/\b[A-Z]{2,8}\s*\d{1,8}[A-Z0-9]*\.[A-Z0-9]{1,8}\b/g;
 function technicalType(s){return ((clean(s).match(typePattern)||[])[0]||'').replace(/\s+/g,'');}
 function machineFromSubject(subject){
  const s=clean(subject).replace(/\s+\d{2}\.\d{2}\.\d{4}\s*$/,'');
  const typeMatch=new RegExp(typePattern.source).exec(s),code=technicalType(s);
  if(code&&typeMatch){
   const suffix=clean(s.slice(typeMatch.index+typeMatch[0].length)).replace(/^[\s:–-]+/,'');
   return {code,machine:suffix,subject:s};
  }
  // No technical type: never use the customer name as the machine.
  const m=s.match(/\b(?:GmbH(?:\s*&\s*Co\.?\s*KG)?|AG|e\.?K\.?|KG)\b\.?\s+(.+)$/i);
  return {code:'',machine:clean(m?.[1]||''),subject:s};
 }
 function ticketsFromLines(lines){
  const out=[];let active=false;
  for(const line of lines){
   const s=clean(line.text).replace(/\t/g,' ');
   if(/\bUntertickets\b/i.test(s)){active=true;continue;}
   if(!active)continue;
   if(/^(?:Positionen|Unterschrift|RONDO|Komplementar|Produkt\b)/i.test(s))break;
   if(/^Nummer\s+Betreff/i.test(s)||!s)continue;
   // The RONDO export uses one row per under-ticket. A row may have a separate date cell.
   const match=s.match(/^(\d{4,10})\s+(.+?)(?:\s+\d{2}\.\d{2}\.\d{4})?$/);
   if(!match)continue;
   const {code,machine,subject}=machineFromSubject(match[2]);
   out.push({ticket:match[1],code,machine,subject});
  }
  return out;
 }
 function valueAfterLabel(lines,label){
  const labelR=new RegExp('^'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*:', 'i');
  for(const l of lines){
   const s=clean(l.text).replace(/\t/g,' ');
   const idx=s.search(labelR);
   if(idx<0)continue;
   const rest=clean(s.slice(idx).replace(labelR,''));
   if(rest && !/^[A-ZÄÖÜ][A-ZÄÖÜ _-]{2,}\s*:/.test(rest))return rest;
  }
  return '';
 }
 function classify(doc,parsed){
  const lines=doc.pages.flatMap((page,i)=>core.groupItems(page.items,Number(page.number)||i+1,!!page.ocr));
  const mainType=technicalType(valueAfterLabel(lines,'PRODUKT ID'))||technicalType(valueAfterLabel(lines,'BETREFF'));
  const mainMachine=clean(parsed.metadata.machine||valueAfterLabel(lines,'REGISTRIERTES PRODUKT'));
  const children=ticketsFromLines(lines);
  const actualTables=parsed.table_count;
  const expectedTables=children.length+1;
  const canPair=children.length>0&&actualTables===expectedTables;
  const warning=children.length&&!canPair?`Untertickets erkannt (${children.length}), aber ${actualTables} Materialtabellen statt ${expectedTables}. Maschinen der Untertickets werden aus Sicherheitsgründen nicht automatisch zugeordnet.`:'';
  if(warning)parsed.warnings.push(warning);
  function annotate(row){
   let entry=null,status='Unbekannt';
   if(row.table===1){entry={ticket:parsed.metadata.ticket,code:mainType,machine:mainMachine};status=mainMachine?'Hauptticket':'Nicht zugeordnet';}
   else if(canPair&&row.table>=2){entry=children[row.table-2];status=entry?.machine?'Unterticket':'Nicht zugeordnet';}
   row.ticket=entry?.ticket||'';
   row.machine=entry?.machine||'';
   row.machine_label=entry?.machine||'';
   row.machine_code=entry?.code||'';
   row.assignment_status=status;
   row.is_subticket=row.table>1;
   return row;
  }
  parsed.items.forEach(annotate);
  parsed.excluded.forEach(annotate);
  parsed.metadata.machine_code=mainType;
  parsed.subtickets=children;
  return parsed;
 }
 const original=core.parseDocument;
 core.parseDocument=function(doc){return classify(doc,original(doc));};
 return {classify,technicalType,machineFromSubject,ticketsFromLines};
});

/* V87 direct GitHub upload entry. Existing V80/V86 functions above are unchanged. */
(function(){
 const modules=['v87_core.js','v87_pdf.js','v87_ui.js'];let chain=Promise.resolve();
 for(const module of modules){chain=chain.then(()=>new Promise((resolve,reject)=>{
  const el=document.createElement('script');el.src=new URL(module,document.baseURI).href;
  el.async=false;el.onload=resolve;el.onerror=()=>reject(Error('V87 Modul fehlt: '+module));
  document.head.appendChild(el);
 }));}
 chain.catch(e=>{console.error('Lagerverwaltung V87',e);const box=document.createElement('div');box.className='message error';box.style.cssText='position:fixed;z-index:2200;top:10px;left:10px;right:10px;padding:12px';box.textContent='V87 konnte nicht vollständig geladen werden: '+e.message;document.body.appendChild(box)});
})();
