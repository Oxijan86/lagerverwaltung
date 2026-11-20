/* Lagerverwaltung Lovrencic V88.20: pure validation and planning logic. */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LV8820Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const compact=value=>String(value??'').normalize('NFKC').toUpperCase().replace(/[\s.]/g,'').trim();
 const validArticle=value=>/^[A-Z0-9][A-Z0-9_\-/]{1,47}$/.test(compact(value));
 const rowKey=row=>String(row.key??`${row.page}:${row.position??row.pos}`);
 function variants(input){
  const s=compact(input),out=new Set([s]);
  if(s.startsWith('I'))out.add('1'+s.slice(1));
  if(s.startsWith('1'))out.add('I'+s.slice(1));
  if(s.includes('O'))out.add(s.replace(/O/g,'0'));
  if(s.includes('0'))out.add(s.replace(/0/g,'O'));
  return [...out].filter(validArticle);
 }
 function proposals(row,articles){
  const wanted=compact(row.article_no),alt=new Set(variants(wanted)),exact=[],confusable=[];
  for(const a of articles||[]){
   if(!a||a.active===0)continue;
   const no=compact(a.article_no);
   if(no===wanted)exact.push(a);
   else if(alt.has(no))confusable.push(a);
  }
  return {exact,confusable,otherCount:Math.max(0,(articles||[]).length-exact.length-confusable.length)};
 }
 function normalizeRow(row,update){
  const next={...row};
  if(update.action==='later')return {...next,review_v8820:'later',reviewed_at:new Date().toISOString()};
  if(!['confirmed','corrected'].includes(update.action))throw Error('Ungültige Prüfentscheidung.');
  const number=compact(update.article_no??row.article_no);
  if(!validArticle(number))throw Error('Bitte eine gültige Artikelnummer eingeben.');
  next.article_no=number;next.review_v8820=update.action;next.reviewed_at=new Date().toISOString();
  if(number!==compact(row.article_no)){next.manual_link=true;next.ocr_original_no=next.ocr_original_no||row.article_no;}
  next.verified=true;
  // A PDF article number check must NEVER alter counting, movements or stock.
  return next;
 }
 function reviewStats(rows){
  let reviewed=0,later=0,open=0;
  for(const r of rows||[]){if(r.review_v8820==='confirmed'||r.review_v8820==='corrected')reviewed++;
   else if(r.review_v8820==='later')later++;else open++;}
  return {total:(rows||[]).length,reviewed,later,open};
 }
 function archiveEligibility(article,refs={}){
  const reasons=[];
  if(!article||!Number.isInteger(Number(article.id))||Number(article.id)<1)reasons.push('Artikel nicht gefunden');
  if(article&&Number(article.active)===0)reasons.push('Bereits archiviert');
  if(article&&Math.abs(Number(article.stock)||0)>0.0000001)reasons.push('Buchbestand vorhanden');
  if(article&&Math.abs(Number(article.initial_stock)||0)>0.0000001)reasons.push('Anfangsbestand vorhanden');
  if(Number(refs.movements||0)>0)reasons.push('Buchungshistorie vorhanden');
  if(Number(refs.inventory_counts||0)>0)reasons.push('Inventurzählung vorhanden');
  if(Number(refs.service_pdf_imports||0)>0)reasons.push('Servicebericht-Verknüpfung vorhanden');
  if(Number(refs.stock_bins||0)>0)reasons.push('Lagerplatz-Bestand vorhanden');
  if(Number(refs.other||0)>0)reasons.push('Weitere Artikel-Verknüpfungen vorhanden');
  return {allowed:reasons.length===0,reasons};
 }
 function describeMatch(from,to){
  const a=compact(from),b=compact(to);
  if(a===b)return 'Unverändert';
  if(a.length===b.length&&a.slice(1)===b.slice(1)&&((a[0]==='I'&&b[0]==='1')||(a[0]==='1'&&b[0]==='I')))
    return 'Mögliche I/1-Verwechslung';
  return 'Manuell geänderte Artikelnummer';
 }
 function remaining(rows,states=['open','later']){
  return (rows||[]).map((r,i)=>({row:r,index:i})).filter(x=>states.includes(x.row.review_v8820||'open'));
 }
 function parseManualAmount(value){
  const s=String(value??'').trim();if(s==='')return null;
  const canonical=s.replace(',','.');if(!/^\d+(?:\.\d{1,4})?$/.test(canonical))throw Error('Ungültiger Zählwert.');
  return Number(canonical);
 }
 return {compact,validArticle,rowKey,variants,proposals,normalizeRow,reviewStats,archiveEligibility,describeMatch,remaining,parseManualAmount};
});
