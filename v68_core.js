(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVV68Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function normalizeSearchText(value){
  return String(value??'').toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 }
 function articleSearchText(article){
  return normalizeSearchText([article?.article_no,article?.description,article?.location,article?.machine,...(article?.machines||[])].filter(Boolean).join(' '));
 }
 function filterStockArticles(articles,query,previewLimit=5){
  const q=normalizeSearchText(query);
  const active=(Array.isArray(articles)?articles:[]).filter(a=>a&&a.active!==false&&Number(a.active)!==0);
  const matches=q?active.filter(a=>articleSearchText(a).includes(q)):active;
  return {query:q,count:matches.length,matches,preview:q?matches.slice(0,Math.max(0,Number(previewLimit)||0)):[]};
 }
 function searchCountLabel(count){const n=Number(count)||0;return n===0?'Keine Artikel gefunden':n===1?'1 Artikel gefunden':`${n} Artikel gefunden`}
 function importCommitChanged({bookedCount=0,machineCreated=false,otherChanges=0}={}){return Number(bookedCount)>0||!!machineCreated||Number(otherChanges)>0}
 function createAndBookNewArticlePlan(item={},unit='Stk.'){
  const qty=Number(item.quantity??0);
  if(!Number.isFinite(qty)||qty<=0)throw Error('Ungültige Importmenge.');
  return {initial_stock:qty,booking_quantity:0,total_stock_effect:qty,source_quantity:qty,ignored_client_initial_stock:Number(item.initial_stock??0)};
 }
 return {normalizeSearchText,articleSearchText,filterStockArticles,searchCountLabel,importCommitChanged,createAndBookNewArticlePlan};
});
