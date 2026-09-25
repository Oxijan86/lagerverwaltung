(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVV67Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function normalizeIds(ids){return [...new Set((ids||[]).map(Number).filter(x=>Number.isInteger(x)&&x>0))].sort((a,b)=>a-b)}
 class ArticleDraftStore{
  constructor(){this.map=new Map()}
  get(id){return this.map.get(Number(id))||null}
  has(id){return this.map.has(Number(id))}
  set(id,patch,base={}){const key=Number(id);if(!key)throw Error('Ungültige Artikel-ID.');const prev=this.map.get(key)||{id:key,...base};const next={...prev,...patch,id:key,dirty:true};if('machine_ids' in patch)next.machine_ids=normalizeIds(patch.machine_ids);else if('machine_ids' in prev)next.machine_ids=normalizeIds(prev.machine_ids);this.map.set(key,next);return next}
  delete(id){return this.map.delete(Number(id))}
  clear(){this.map.clear()}
  values(){return [...this.map.values()]}
  get size(){return this.map.size}
  discardAll(){const count=this.map.size;this.map.clear();return count}
 }
 class StockDetailsState{
  constructor(){this.open=new Set()}
  isOpen(id){return this.open.has(Number(id))}
  toggle(id){const k=Number(id);if(this.open.has(k)){this.open.delete(k);return false}this.open.add(k);return true}
  set(id,v){const k=Number(id);if(v)this.open.add(k);else this.open.delete(k);return !!v}
  visibleFields(id){const base=['article_no','description','stock','details_button','dirty_marker'];return this.isOpen(id)?[...base,'minimum_stock','target_stock','location','machines','save','status']:base}
 }
 function normalizePositionKey(item,index=0){const line=Number(item?.line)||index+1;const no=String(item?.article_no||'').trim().toLowerCase();return `${line}:${no}`}
 function validateBookingBatch(items,type,ctx={}){
  if(!Array.isArray(items)||!items.length)throw Error('Keine Buchungspositionen vorhanden.');
  const movementType=type==='OUT'?'OUT':'IN',tech=String(ctx.technician||'').trim();
  if(!tech)throw Error('Techniker fehlt.');
  if(Array.isArray(ctx.validTechnicians)&&ctx.validTechnicians.length&&!ctx.validTechnicians.includes(tech))throw Error('Techniker ist nicht gültig.');
  const seen=new Set(),prepared=[];
  for(let i=0;i<items.length;i++){
   const x=items[i]||{},article=ctx.resolveArticle?ctx.resolveArticle(x):x.article;
   if(!article||!Number(article.id))throw Error(`Unbekannter Artikel: ${x.article_no||x.article_id||i+1}`);
   const aid=Number(article.id);if(seen.has(aid))throw Error(`Doppelte Position für Artikel ${article.article_no||aid}.`);seen.add(aid);
   const qty=Number(x.quantity);if(!Number.isFinite(qty)||qty<=0)throw Error(`Ungültige Menge für Artikel ${article.article_no||aid}.`);
   const stock=Number(article.stock||0);if(movementType==='OUT'&&qty>stock+1e-9)throw Error(`Nicht genügend Bestand für ${article.article_no||aid}. Verfügbar: ${stock}`);
   prepared.push({...x,article_id:aid,article_no:article.article_no||x.article_no||'',quantity:qty,position_key:x.position_key||normalizePositionKey(x,i)});
  }
  return prepared;
 }
 class IdempotencyRegistry{
  constructor(){this.map=new Map()}
  key(operationId,positionKey){return `${operationId}::${positionKey}`}
  get(operationId,positionKey){return this.map.get(this.key(operationId,positionKey))||null}
  record(operationId,positionKey,result){const key=this.key(operationId,positionKey);if(this.map.has(key))return this.map.get(key);const c={...result};this.map.set(key,c);return c}
  upsert(operationId,positionKey,result){const key=this.key(operationId,positionKey),c={...(this.map.get(key)||{}),...result};this.map.set(key,c);return c}
 }
 function simulateAtomicBatch(state,work){const snapshot=JSON.parse(JSON.stringify(state));try{return work(state)}catch(e){Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,snapshot);throw e}}
 function idempotentMaterialCreation({state,registry,operationId,positionKey,articleNo,quantity,failAfter=''}){const existing=registry.get(operationId,positionKey);if(existing)return existing;return simulateAtomicBatch(state,s=>{if(s.articles.some(x=>x.article_no===articleNo))throw Error('Artikel bereits vorhanden');const article={id:s.nextArticleId++,article_no:articleNo};s.articles.push(article);if(failAfter==='article')throw Error('simulierter Fehler nach Artikel');const movement={id:s.nextMovementId++,article_id:article.id,type:'IN',quantity:Number(quantity)};s.movements.push(movement);if(failAfter==='movement')throw Error('simulierter Fehler nach Buchung');const result={article_id:article.id,movement_id:movement.id,quantity:Number(quantity),status:'booked'};registry.record(operationId,positionKey,result);return result})}
 function idempotentExistingArticleBooking({state,registry,operationId,positionKey,articleId,quantity}){const existing=registry.get(operationId,positionKey);if(existing)return existing;return simulateAtomicBatch(state,s=>{const a=s.articles.find(x=>Number(x.id)===Number(articleId));if(!a)throw Error('Artikel nicht gefunden');const movement={id:s.nextMovementId++,article_id:Number(articleId),type:'IN',quantity:Number(quantity)};s.movements.push(movement);const result={article_id:Number(articleId),movement_id:movement.id,quantity:Number(quantity),status:'booked'};registry.record(operationId,positionKey,result);return result})}
 function validateSetupPasswords(password,repeat){if(String(password||'').length<8)throw Error('Passwort muss mindestens 8 Zeichen haben.');if(String(password)!==String(repeat??''))throw Error('Die Passwörter stimmen nicht überein.');return true}
 function requireAdmin(authorized,message='Administratorfreigabe erforderlich.'){if(!authorized)throw Error(message);return true}
 function requireAdminSession(sessionManager,token,message='Administrator-Sitzung erforderlich.'){if(!sessionManager||typeof sessionManager.verify!=='function'||!sessionManager.verify(String(token||'')))throw Error(message);return true}
 return {ArticleDraftStore,StockDetailsState,normalizeIds,normalizePositionKey,validateBookingBatch,IdempotencyRegistry,simulateAtomicBatch,idempotentMaterialCreation,idempotentExistingArticleBooking,validateSetupPasswords,requireAdmin,requireAdminSession};
});
