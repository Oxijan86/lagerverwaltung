(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LVMaterialBookingCore83=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const normalize=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[\u2012-\u2015]/g,'-').replace(/\s+/g,' ').trim();
 function classify(text){const t=normalize(text).toLocaleLowerCase('de-DE');if(/materialanforderung|anforderung\s+techniker|bestellanforderung/.test(t))return 'request';if(/materialbeleg\s*:?|materialbuchungsbeleg|bewegungsart\s*:\s*301|lagerplatz\s+umlager/.test(t))return 'voucher';return 'unknown'}
 function amount(v){const s=String(v||'').trim().replace(/\s+/g,'');if(!/^(?:\d+(?:[.,]\d+)?)$/.test(s))return NaN;return Number(s.replace(',','.'))}
 function metadata(raw){const t=String(raw||'');const match=t.match(/Materialbeleg\s*:?\s*(\d{7,14})\s*(?:\/\s*(\d{4}))?/i);const voucher=match?(match[1]+(match[2]?'/'+match[2]:'')):'';const date=t.match(/Buchungsdatum\s*:?\s*(\d{2})[.](\d{2})[.](\d{4})/i);const dest=/1010\s*\/\s*1025/.test(t);const move=t.match(/Bewegungsart\s*:?\s*([^\n]{1,90})/i)?.[1]||'';return {voucher,date:date?`${date[3]}-${date[2]}-${date[1]}`:'',direction:dest?'IN':'OUT',movement:normalize(move),destination1025:dest};}
 // SAP belegs have a four-digit POS followed by an alphanumeric material number.
 // Only match amounts accompanied by explicit units and a plant/storage location.
 const rowHead=/^\s*(\d{4})\s+([A-Z0-9][A-Z0-9._-]{2,25})\s+(.+)$/i;
 const qtyEnd=/(\d+(?:[.,]\d+)?)\s*(ST|STK\.?|M|KG|G|L|ML)\b\s*(?:\d{4}\s*\/\s*\d{4})\b/i;
 function parseLines(lines){const items=[],warnings=[],seen=new Set();for(let i=0;i<lines.length;i++){
  const line=normalize(lines[i]);const m=rowHead.exec(line);if(!m)continue;
  const pos=String(Number(m[1])).padStart(4,'0');if(Number(pos)<1||Number(pos)>9999)continue;
  const article_no=m[2].toUpperCase();const remain=m[3];let q=qtyEnd.exec(remain);
  if(!q&&i+1<lines.length){const later=normalize(lines[i+1]);if(!rowHead.test(later))q=qtyEnd.exec(remain+' '+later)}
  if(!q){warnings.push(`Position ${pos} (${article_no}): Menge nicht sicher erkannt; bitte im Original kontrollieren.`);items.push({position:pos,article_no,description:remain.slice(0,100),quantity:null,unit:'',uncertain:true});continue}
  const qty=amount(q[1]),unit=q[2].toUpperCase().replace('STK.','STK');
  if(!Number.isFinite(qty)||qty<=0){warnings.push(`Position ${pos}: Ungültige Menge.`);continue}
  if(seen.has(pos)){warnings.push(`Position ${pos}: Mehrfach erkannt; nur ein Eintrag wird angezeigt.`);continue}seen.add(pos);
  let description=normalize(remain.slice(0,q.index).replace(/\b\d{4}\s*\/\s*\d{4}\b.*$/,''));
  // OCR sometimes collapses the description; keep a warning rather than guess an article.
  if(!description)description=article_no;
  items.push({position:pos,article_no,description,quantity:qty,unit,uncertain:false});
 }
 return {items,warnings};}
 function parse(text){const source=String(text||'');const kind=classify(source);const rows=parseLines(source.split(/\r?\n/));return {kind,metadata:metadata(source),items:rows.items,warnings:rows.warnings};}
 function linesFromPages(pages){const all=[];for(const pg of pages||[]){const ordered=(pg.items||[]).filter(x=>x.str&&x.str.trim()).map(x=>({...x,y:Number(x.y||0),x:Number(x.x||0)})).sort((a,b)=>b.y-a.y||a.x-b.x);let bands=[];
  for(const item of ordered){let b=bands.find(a=>Math.abs(a.y-item.y)<=Math.max(3,Number(item.height||8)*0.45));if(!b){b={y:item.y,words:[]};bands.push(b)}b.words.push(item)}
  all.push(...bands.sort((a,b)=>b.y-a.y).map(b=>b.words.sort((a,c)=>a.x-c.x).map(w=>w.str).join(' ')));
 }return all;}
 return {normalize,classify,amount,parse,parseLines,metadata,linesFromPages};
});
