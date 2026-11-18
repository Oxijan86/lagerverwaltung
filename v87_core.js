/* Lagerverwaltung Lovrencic V87 – parser and inventory comparison.
   No stock is ever created from an unknown/unfilled quantity. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LV87Core=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const norm=v=>String(v??'').normalize('NFKC').toLocaleUpperCase('de-DE').replace(/\s+/g,' ').trim();
 const normNo=v=>norm(v).replace(/[\s_.]/g,'');
 const numeric=v=>/^\d+$/.test(String(v??''));
 function cleanNo(s){return String(s||'').trim().replace(/[|;,]/g,'').replace(/^[^A-Z0-9]+/i,'').replace(/[^A-Z0-9_\/-]+$/i,'').toUpperCase();}
 function validNo(s){return /^(?=.*[0-9])[A-Z0-9][A-Z0-9_\/-]{3,24}$/.test(String(s||''));}
 function normalizeUnit(s){return /^(?:M|MTR|METER)$/i.test(String(s||'').trim())?'m':/^(?:L|LTR|LITER)$/i.test(String(s||'').trim())?'L':'Stk.';}
 function parseOcrPage(text,pageNum,words=[]){
  const raw=String(text||'').replace(/\r/g,'').split('\n');
  let beleg=(String(text||'').match(/Inventurbeleg\s*([0-9]{6,12})/i)||[])[1]||'';
  const lines=raw.map(s=>s.replace(/[\t]+/g,' ').trim()).filter(Boolean);
  const positionHits=[];
  const location=(String(text||'').match(/\b(?:LOrt|Lagerort)\s+(\d{3,6})/i)||[])[1]||'1025';
  // Most RONDO forms have ten numbered rows. A code is expected directly after the position number.
  for(let i=0;i<lines.length;i++){
   const m=lines[i].match(/^(\d{1,2})\s+([A-Z0-9(][A-Z0-9_\/-]{2,24})\s+(\d{3,6})(?:\s|$)/i)
        ||lines[i].match(/^(\d{1,2})\s+([A-Z0-9(][A-Z0-9_\/-]{2,24})(?:\s|$)/i);
   if(!m)continue;
   let pos=Number(m[1]);const suspiciousPos=pos===41&&positionHits.length===0;if(suspiciousPos)pos=1;if(pos<1||pos>20)continue;
   const originalCode=String(m[2]);const number=cleanNo(originalCode);const suspicious=suspiciousPos||/[(!|]/.test(originalCode)||/^I\d/i.test(originalCode)||/^O\d/i.test(originalCode);
   if(/^(INVENTUR|MATERIAL|GESCHAFT|STATUS|BESTAND|STICHTAG)/.test(number))continue;
   const loc=m[3]||location;
   let description='';
   for(let k=i+1;k<Math.min(i+4,lines.length);k++){
    const x=lines[k].trim();
    if(/^(?:Noch\s+nicht\s+gez|Nicht\s+gez|\(?Nicht\)?\s*Fr|\d{1,2}\s+[A-Z0-9(]{4,})/i.test(x))break;
    if(x==='ST'||x==='M'||x==='L'||/^(?:\(?Nicht\)?|\d{3,6})$/.test(x))continue;
    if(x.length>1){description=x.replace(/\s*\(?Nicht\)?\s*Fr.*$/i,'').trim();break;}
   }
   // row coordinates can be adjusted by user before exporting; OCR might miss individual codes.
   const y=guessRowY(words,number,pos);
   positionHits.push({page:pageNum,position:pos,article_no:number,description,unit:guessUnit(lines,i),location:loc,
      y,verified:validNo(number)&&!!description&&!suspicious,warning:!validNo(number)||suspicious?'Artikelnummer unsicher':!description?'Bezeichnung fehlt':'',
      counted_stock:null});
  }
  const distinct=new Map();for(const row of positionHits)if(!distinct.has(row.position))distinct.set(row.position,row);
  return {page:pageNum,beleg,positions:[...distinct.values()].sort((a,b)=>a.position-b.position),
   warnings:distinct.size<9?[`Auf Seite ${pageNum} wurden nur ${distinct.size} Positionen erkannt. Bitte PDF kontrollieren.`]:[]};
 }
 function guessUnit(lines,i){const text=lines.slice(i+1,i+4).join(' ');return /\bM\b/.test(text)?'m':/\bL\b/.test(text)?'L':'Stk.';}
 function guessRowY(words,no,pos){
  const found=(words||[]).find(w=>normNo(w.text||w.str)===normNo(no));
  if(found&&Number.isFinite(found.y))return found.y;
  return null;
 }
 function checkRows(pages){
  const rows=[];const keys=new Set(),warnings=[];
  for(const p of pages||[]){
   if(!p||!Array.isArray(p.positions))continue;
   warnings.push(...(p.warnings||[]));
   for(const r of p.positions){const key=`${p.page}:${r.position}`;
    if(keys.has(key)){warnings.push(`Doppelte Belegposition ${key}`);continue}
    keys.add(key);rows.push({...r,key,beleg:r.beleg||p.beleg||''});}
  }
  const seen=new Map();for(const r of rows){const no=normNo(r.article_no);if(seen.has(no))warnings.push(`Material ${r.article_no} auf mehreren Positionen (${seen.get(no)} und ${r.key})`);else seen.set(no,r.key)}
  return {rows,warnings};
 }
 function compare(rows,articles){
  const available=new Map((articles||[]).map(a=>[normNo(a.article_no),a]));const supplied=new Set();
  const firmOnly=[],matched=[],duplicate=[],seen=new Map();
  for(const r of rows||[]){const key=normNo(r.article_no);const a=available.get(key);
   if(seen.has(key)){duplicate.push({row:r,first:seen.get(key)});continue}seen.set(key,r);
   if(a)matched.push({row:r,article:a});else firmOnly.push(r); supplied.add(key);
  }
  const appOnly=(articles||[]).filter(a=>!supplied.has(normNo(a.article_no)));
  return {firmOnly,appOnly,matched,duplicate};
 }
 function countStats(rows,inv){const counted=new Map((inv?.items||[]).map(x=>[normNo(x.article_no),x]));let done=0,unknown=0,diff=0;const problems=[];
  for(const r of rows||[]){const match=counted.get(normNo(r.article_no));
   if(!match||match.counted_stock===null||match.counted_stock===undefined||String(match.counted_stock).trim()===''){unknown++;continue}
   done++;if(Math.abs(Number(match.base_stock||0)-Number(match.counted_stock))>1e-8)diff++;
  }return {total:rows.length,done,unknown,diff,problems};}
 function validateTransfer(items,available){
  const bins=new Map((available||[]).map(b=>[Number(b.id),b])),seen=new Set(),result=[];
  for(const v of items||[]){const b=bins.get(Number(v.bin_id));if(!b)throw Error('Unbekannter Quellbestand. Bitte aktualisieren.');if(seen.has(Number(b.id)))throw Error('Artikel wurde doppelt ausgewählt.');seen.add(Number(b.id));
   const q=String(v.quantity??'').trim().replace(',','.');if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(q))throw Error(`Ungültige Menge: ${b.article_no}`);
   const n=Number(q);if(n<=0||!Number.isFinite(n)||n-Number(b.quantity)>1e-8)throw Error(`Unzulässige Teilmenge: ${b.article_no}`);
   if(/^(?:stk\.?|stück)$/i.test(b.unit||'Stk.')&&!Number.isInteger(n))throw Error(`Nur ganze Stückzahlen: ${b.article_no}`);
   result.push({bin_id:Number(b.id),article_no:b.article_no,quantity:n});
  }return result;
 }
 function normCount(s,unit){const v=String(s??'').trim().replace(',','.');if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(v))throw Error('Ungültige Zählmenge.');const n=Number(v);if(!Number.isFinite(n)||n<0)throw Error('Ungültige Zählmenge.');if(/^(?:stk\.?|stück)$/i.test(unit)&&!Number.isInteger(n))throw Error('Bitte eine ganze Stückzahl eingeben.');return n;}
 return {norm,normNo,cleanNo,validNo,parseOcrPage,checkRows,compare,countStats,validateTransfer,normCount};
});
