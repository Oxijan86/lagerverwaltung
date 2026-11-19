/* Lagerverwaltung Lovrencic V88.8 – bewusste Technikerabweichung ausschließlich
 * für den reinen PDF-Artikelstammimport ohne Mengenübernahme.
 * Kein automatisches Anlegen eines Technikers; keine Inventurbuchung.
 */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV888Technician=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const accepted=new Set();
 const endpoint='/api/articles/create-import';
 const mismatch=e=>/Techniker ist nicht gültig\.?/i.test(String(e?.message||e||''));
 const number0=x=>{const n=Number(x??0);return Number.isFinite(n)&&n===0};
 function onlyZeroStock(rows){return Array.isArray(rows)&&rows.length>0&&rows.every(r=>r&&number0(r.initial_stock)&&number0(r.quantity))}
 function requestKey(d){return JSON.stringify([String(d?.operation_id||''),String(d?.technician||'')]);}
 function warning(name,master={}){
  const entered=String(name||'').trim()||'(nicht angegeben)';
  const current=String(master.default_technician||'').trim()||'(nicht festgelegt)';
  const active=(master.technicians||[]).filter(t=>t&&t.active!==0).map(t=>String(t.name||'').trim()).filter(Boolean);
  const options=active.length?active.join(', '):'(keine weiteren aktiven Techniker)';
  return 'Technikername weicht ab\n\n'+
   'Im Import verwendet: '+entered+'\n'+
   'Standardtechniker dieser Datenbank: '+current+'\n'+
   'Weitere freigegebene Techniker: '+options+'\n\n'+
   'Der angegebene Name ist hier nicht als gültiger Techniker registriert.\n'+
   'Du kannst diesen Hinweis IGNORIEREN und die bereits geprüften Artikel '+
   'trotzdem mit genau diesem Namen anlegen.\n\n'+
   'Es werden dabei KEINE Zählmengen übernommen und KEINE Lagerbestände verändert. '+
   'Die Abweichung wird nur für diesen reinen Artikelstammimport zugelassen.\n\n'+
   'OK = Hinweis ignorieren und Artikel importieren\nAbbrechen = keine Artikel übernehmen';
 }
 async function post(url,data,api){
  const call=(path,body)=>api(path,{method:'POST',body:JSON.stringify(body)});
  if(url!==endpoint)return call(url,data);
  const d=data||{},key=requestKey(d);
  if(accepted.has(key)&&onlyZeroStock(d.items))return call(url,{...d,allow_technician_mismatch:true});
  try{return await call(url,d)}catch(e){
   if(!mismatch(e))throw e;
   if(!onlyZeroStock(d.items))throw e; // No bypass for opening stock/real movements.
   const master=await api('/api/masterdata').catch(()=>({}));
   const technician=String(d.technician||master.default_technician||'').trim()||'Techniker';
   const ask=typeof root?.confirm==='function'?root.confirm.bind(root):null;
   if(!ask)throw Error('Technikerabweichung muss vor dem Import ausdrücklich bestätigt werden.');
   if(!ask(warning(technician,master)))throw Error('Artikelimport abgebrochen: Technikerabweichung nicht bestätigt. Alle PDF-Prüfdaten bleiben erhalten.');
   const verifiedKey=requestKey({...d,technician});
   try{
    const result=await call(url,{...d,technician,allow_technician_mismatch:true});
    accepted.add(key);accepted.add(verifiedKey);
    return result;
   }catch(err){
    if(mismatch(err))throw Error('Technikerabweichung trotz Bestätigung abgewiesen. Bitte Version 88.8 vollständig neu laden. Artikel wurden für dieses Paket nicht angelegt.');
    throw err;
   }
  }
 }
 return {post,warning,onlyZeroStock,mismatch,requestKey};
});
