(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVAppRules=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const WHOLE_UNITS=new Set(['Stk.','Satz','Rolle','Packung','Karton']);
 function isWholeNumberUnit(unit){return WHOLE_UNITS.has(String(unit||''))}
 function normalizeQuantity(value,unit){
  let n=Number(value);
  if(!Number.isFinite(n))n=0;
  n=Math.max(0,n);
  return isWholeNumberUnit(unit)?Math.round(n):Math.round(n*1000000)/1000000;
 }
 function normalizeStockLevels(targetStock,minimumStock,unit='Stk.'){
  let target=normalizeQuantity(targetStock,unit);
  const minimum=normalizeQuantity(minimumStock,unit);
  const adjusted=minimum>target;
  if(adjusted)target=minimum;
  return {target_stock:target,minimum_stock:minimum,adjusted};
 }
 function lowStockItems(items){
  return (items||[]).filter(x=>x&&x.active!==0&&Number(x.stock)<Number(x.minimum_stock));
 }
 function lowStockSummary(items,previewLimit=8){
  const all=lowStockItems(items).sort((a,b)=>(Number(b.minimum_stock)-Number(b.stock))-(Number(a.minimum_stock)-Number(a.stock)));
  return {count:all.length,all,preview:all.slice(0,Math.max(0,Number(previewLimit)||0)),has_more:all.length>previewLimit};
 }
 function stockLevelStatus(article){
  const number=v=>Number.isFinite(Number(v))?Number(v):0;
  const stock=number(article?.stock),minimum=Math.max(0,number(article?.minimum_stock)),target=Math.max(0,number(article?.target_stock));
  return {below_minimum:stock<minimum,below_target:stock<target,missing_to_target:Math.max(0,target-stock)};
 }
 function matchesStockLevel(article,mode='all'){
  if(!article||article.active===false||Number(article.active)===0)return false;
  const status=stockLevelStatus(article);
  return mode==='target'?status.below_target:mode==='minimum'?status.below_minimum:true;
 }
 function materialRequestSuggestion(article,mode='minimum'){
  const stock=Math.max(0,Number(article?.stock||0));
  const minimum=Math.max(0,Number(article?.minimum_stock||0));
  const target=Math.max(minimum,Math.max(0,Number(article?.target_stock||0)));
  const needed=mode==='target'?stock<target:stock<minimum;
  return {goal:target,suggested_quantity:needed?Math.max(0,target-stock):0,needed};
 }
 return {stockLevelStatus,matchesStockLevel,isWholeNumberUnit,normalizeQuantity,normalizeStockLevels,lowStockItems,lowStockSummary,materialRequestSuggestion};
});
