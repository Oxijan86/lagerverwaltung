/* Lagerverwaltung Lovrencic V88.13: PDF-Positionen sicher mit Inventurartikeln verknuepfen.
 * Nur Vorschlaege; KEINE stille Zuordnung, Buchung oder Bestandstransaktion.
 * Im Browser und mit Node.js testbar. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV8813PDFMatch=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const norm=s=>String(s??'').normalize('NFKC').toLocaleUpperCase('de-DE').replace(/Ä/g,'AE').replace(/Ö/g,'OE').replace(/Ü/g,'UE').replace(/ß/g,'SS').trim();
 const no=s=>norm(s).replace(/[^A-Z0-9]/g,'');
 const glyph=s=>no(s).replace(/[I1L]/g,'1').replace(/[O0]/g,'0').replace(/[B8]/g,'8').replace(/[S5]/g,'5');
 const words=s=>new Set(norm(s).split(/[^A-Z0-9]+/).filter(x=>x.length>1&&!['ZUR','ZUM','FUER','DER','DIE','DAS','UND','MIT','STK','M','NICHT','GEZAEHLT'].includes(x)));
 function textScore(a,b){
  const aa=words(a),bb=words(b);if(!aa.size||!bb.size)return 0;
  let total=0,common=0;
  // Spezifische Bezeichnungsbestandteile (USB, Datensicherung, Artikelmasse) erhalten mehr Gewicht.
  for(const w of aa){const weight=w.length>=7?1.8:w.length>=4?1.4:1;total+=weight;if(bb.has(w))common+=weight;}
  let right=0;for(const w of bb)right+=w.length>=7?1.8:w.length>=4?1.4:1;
  return 2*common/(total+right);
 }
 function editDistance(a,b,max=2){
  if(a===b)return 0;if(Math.abs(a.length-b.length)>max)return max+1;
  let prev=Array.from({length:b.length+1},(_,j)=>j);
  for(let i=1;i<=a.length;i++){
   const next=[i];let minimum=i;
   for(let j=1;j<=b.length;j++){next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));minimum=Math.min(minimum,next[j]);}
   if(minimum>max)return max+1;prev=next;
  }
  return prev[b.length];
 }
 function score(row,article){
  if(!article?.article_no)return null;
  const a=no(row?.article_no),b=no(article.article_no),name=textScore(row?.description,article.description);
  const exact=!!a&&a===b;
  const confusable=!!a&&a.length>=5&&a.length===b.length&&a!==b&&glyph(a)===glyph(b);
  const dist=!exact&&!confusable&&a?editDistance(a,b,2):3;
  const prefix=!!a&&a.length>=4&&(b.startsWith(a)||a.startsWith(b));
  if(!exact&&!confusable&&dist>2&&!prefix&&name<0.52)return null;
  const value=(exact?115:confusable?85:dist===1?64:dist===2?37:prefix?38:0)+Math.round(name*60);
  return {article,score:value,similarity:name,exact,confusable,distance:dist,
   reason:exact?'Gleiche Artikelnummer':confusable?'Möglicher OCR-Zeichenfehler':name>=0.55?'Ähnliche Bezeichnung und Artikelnummer':'Ähnliche Artikelnummer'};
 }
 function candidates(row,items,{max=7,countedOnly=true}={}){
  return (items||[]).filter(a=>a&&(!countedOnly||(a.counted_stock!==null&&a.counted_stock!==undefined&&String(a.counted_stock).trim()!=='')))
   .map(a=>score(row,a)).filter(Boolean)
   .sort((a,b)=>b.score-a.score||String(a.article.article_no).localeCompare(String(b.article.article_no),'de')).slice(0,max);
 }
 function positionKey(row){return String(row?.key??String(row?.page)+':'+String(row?.position));}
 function matches(row,article){return no(row?.article_no)!==''&&no(row.article_no)===no(article?.article_no);}
 function summarize(lines,inventoryItems,{includeMatched=false,referenceRows=[]}={}){
  const items=(inventoryItems||[]).filter(a=>a?.article_no);
  const index=new Map(items.map(i=>[no(i.article_no),i]));
  const reference=new Map((referenceRows||[]).map(r=>[positionKey(r),r]));
  const used=new Map();for(const row of lines||[]){const k=no(row.article_no);if(row.verified!==false&&row.review_action!=='defer'&&index.has(k))used.set(k,(used.get(k)||0)+1);}
  const blank=[];
  for(const row of lines||[]){
   const linked=index.get(no(row.article_no));
   const ref=reference.get(positionKey(row));
   const referenceMismatch=!!ref&&!row.manual_link&&no(ref.article_no)!==no(row.article_no);
   const suspicious=!!linked&&!!String(row.description||'').trim()&&!!String(linked.description||'').trim()&&textScore(row.description,linked.description)<0.32&&!row.manual_link;
   const already=!suspicious&&linked&&linked.counted_stock!==null&&linked.counted_stock!==undefined&&String(linked.counted_stock).trim()!==''&&row.verified!==false&&row.review_action!=='defer'&&used.get(no(row.article_no))===1;
   if(already&&!includeMatched&&!referenceMismatch)continue;
   const options=candidates(row,items,{max:7,countedOnly:!referenceMismatch}).filter(x=>used.get(no(x.article.article_no))===undefined || matches(row,x.article));
   // Der OCR-Referenzkatalog kann I/1 verwechseln. Er ist NIEMALS
   // ausschlaggebender als ein eindeutig bekannter Lagerartikel mit Zaehlung.
   // Die Vorschlaege bleiben nach Nummern- und Beschreibungsaehnlichkeit sortiert.
   blank.push({key:positionKey(row),row,options,kind:referenceMismatch?'OCR-Katalog und Artikelnummer stimmen nicht ueberein – I/1 manuell pruefen':suspicious?'Bezeichnung passt nicht zur Artikelnummer':row.review_action==='defer'?'zurueckgestellt':row.verified===false?'ungeprueft':already?'bereits-zugeordnet':linked?'ungezaehlt oder doppelt':'nicht-zugeordnet',reference_no:ref?.article_no||''});
  }
  blank.sort((a,b)=>(b.options[0]?.score||0)-(a.options[0]?.score||0)||Number(a.row.page)-Number(b.row.page)||Number(a.row.position)-Number(b.row.position));
  return blank;
 }
 function assign(lines,key,article,validator){
  if(!Array.isArray(lines))throw Error('Originale PDF-Prüfliste fehlt.');
  if(!article||!article.article_no)throw Error('Bitte einen vorhandenen Artikel auswählen.');
  if(typeof validator==='function'&&!validator(String(article.article_no)))throw Error('Ungültige Materialnummer.');
  const row=lines.find(r=>positionKey(r)===String(key));if(!row)throw Error('PDF-Position nicht gefunden.');
  const articleKey=no(article.article_no);
  if(lines.some(r=>r!==row&&r.verified!==false&&r.review_action!=='defer'&&no(r.article_no)===articleKey))throw Error('Dieser Artikel ist einer weiteren PDF-Zeile zugeordnet. Bitte beide Belegpositionen prüfen.');
  const original={article_no:row.article_no,description:row.description,verified:row.verified,review_action:row.review_action};
  // Die Zuordnung ist an der konkreten PDF-Seite/-Position gespeichert; OCR-Rohwert bleibt nachvollziehbar.
  if(!row.ocr_original_no)row.ocr_original_no=String(row.article_no||'');
  if(!row.ocr_original_description)row.ocr_original_description=String(row.description||'');
  row.article_no=String(article.article_no);row.description=String(article.description||row.description||'');
  row.unit=String(article.unit||row.unit||'Stk.');row.verified=true;delete row.review_action;
  row.manual_link=true;row.checked_at=new Date().toISOString();row.linked_article_id=Number(article.article_id||article.id)||null;
  return {row,original,article_no:article.article_no};
 }
 return {norm,no,glyph,words,textScore,editDistance,score,candidates,positionKey,summarize,assign};
});
