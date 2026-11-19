/* Lagerverwaltung V88.17: Vorschlaege fuer Sammel-PDF-Zuordnung und OCR-I/1-Dubletten.
 * Reine Vorschau. Keine Stammdaten-/Zaehlungs- oder Bestandsschreibzugriffe.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LV8817BulkCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const no=s=>String(s??'').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const name=s=>String(s??'').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9ÄÖÜß]/g,'');
 const key=row=>String(row.key??row.page+':'+row.position);
 const counted=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
 function pairedI1(a,b){const x=no(a),y=no(b);return x.length>=5&&x.length===y.length&&x.slice(1)===y.slice(1)&&((x[0]==='I'&&y[0]==='1')||(x[0]==='1'&&y[0]==='I'));}
 function sameName(a,b){const x=name(a),y=name(b);return x.length>=4&&x===y;}
 function pairs(articles,items=[]){
  const byNo=new Map((articles||[]).filter(a=>a?.article_no&&a.active!==false&&a.active!==0).map(a=>[no(a.article_no),a]));
  const inv=new Map((items||[]).map(a=>[no(a.article_no),a]));
  const found=[];
  for(const [n,articleI] of byNo){if(!n.startsWith('I'))continue;const a1=byNo.get('1'+n.slice(1));if(!a1)continue;
   const nameSame=sameName(articleI.description,a1.description);
   const invI=inv.get(n),inv1=inv.get(no(a1.article_no));
   found.push({nameSame,idI:articleI.id,numberI:articleI.article_no,descI:articleI.description,stockI:Number(articleI.stock||0),countI:invI?.counted_stock??null,
    id1:a1.id,number1:a1.article_no,desc1:a1.description,stock1:Number(a1.stock||0),count1:inv1?.counted_stock??null,source:a1,target:articleI});
  }
  return found.sort((a,b)=>a.numberI.localeCompare(b.numberI,'de',{numeric:true}));
 }
 // Vorschlaege nur, wenn der zielseitige I-Artikel exakt gleiche Bezeichnung
 // und einen ausschliesslich durch das fuehrende I/1 abweichenden Code besitzt.
 // Andere OCR-Zeichenfehler bleiben in der manuellen Schnellzuordnung.
 function proposals(lines,items,{referenceRows=[]}={}){
  const byNo=new Map((items||[]).filter(a=>a?.article_no).map(a=>[no(a.article_no),a]));
  const ref=new Map((referenceRows||[]).map(r=>[key(r),r]));
  const used=new Map();for(const row of lines||[]){if(row.verified===false||row.review_action==='defer')continue;const n=no(row.article_no);if(n)used.set(n,(used.get(n)||0)+1);}
  const all=[];
  for(const row of lines||[]){
   if(row.review_action==='defer')continue;
   const n=no(row.article_no);if(!n||!n.startsWith('1'))continue;
   const desired='I'+n.slice(1),target=byNo.get(desired);
   if(!target||!sameName(row.description,target.description))continue;
   // Positionen, die bereits korrekt auf einen echten I-Artikel zeigen, nie aendern.
   // Zielartikel darf in keiner zweiten aktiven PDF-Zeile stehen.
   if(used.has(desired))continue;
   const r=ref.get(key(row)),refNo=r?.article_no||'';
   const source=byNo.get(n);
   const sourceCount=source?.counted_stock, targetCount=target.counted_stock;
   const sourceCounted=counted(sourceCount),targetCounted=counted(targetCount);
   const status=sourceCounted&&!targetCounted?'ZAeHLUNG BEI 1 - NICHT VERSCHIEBEN':sourceCounted&&targetCounted?'BEIDE GEZaEHLT':targetCounted?'I-ARTIKEL GEZaEHLT':'BEIDE UNGEZaEHLT';
   all.push({key:key(row),page:row.page,position:row.position,current:row.article_no,target:target.article_no,
    description:row.description,reference_no:refNo,sourceCount:sourceCount??null,targetCount:targetCount??null,
    sourceStock:Number(source?.stock||0),targetStock:Number(target.stock||0),status,
    // Aus einer pruefpflichtigen Position wird niemals ohne Bestätigung eine Zaehlung umgebucht.
    selectable:!sourceCounted,sourceCounted,targetCounted,article:target});
  }
  // Wiederholte Zielnummern nicht fuer Sammelzuordnung zulassen.
  const c=new Map();for(const r of all)c.set(no(r.target),(c.get(no(r.target))||0)+1);
  for(const r of all)if(c.get(no(r.target))!==1){r.selectable=false;r.status='MEHRFACH-TREFFER - EINZELN PRUEFEN';}
  return all.sort((a,b)=>Number(a.page)-Number(b.page)||Number(a.position)-Number(b.position));
 }
 return {no,name,key,counted,pairedI1,sameName,pairs,proposals};
});
