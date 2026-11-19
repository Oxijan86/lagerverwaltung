/* Lagerverwaltung Lovrencic V88.12 – strikte, datenverlustfreie Inventur-Vorprüfung.
 * Kein Datenbankzugriff, keine Bestandsänderung. Fehlerhafte Entwürfe bleiben
 * in der lokalen Wiederherstellungskopie; valide Artikel werden separat gespeichert.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LV8812SaveGuard=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const whole=new Set(['stk','stk.','stück','satz','rolle','packung','karton']);
 const normUnit=unit=>String(unit||'Stk.').trim().toLocaleLowerCase('de-DE');
 const isWhole=unit=>whole.has(normUnit(unit));
 const parseQuantity=(raw,unit)=>{
  if(raw===null||raw===undefined||String(raw).trim()==='')return null;
  const val=String(raw).trim();
  if(!/^\+?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(val))throw Error('Keine gültige Zahl. Verwende z. B. 4,7.');
  const n=Number(val.replace(',','.'));
  if(!Number.isFinite(n)||n<0||n>1e12)throw Error('Ungültige Zählmenge.');
  if(isWhole(unit)&&!Number.isInteger(n))throw Error('Der Artikel ist als '+(unit||'Stk.')+' hinterlegt; dafür sind nur ganze Mengen erlaubt. Für 4,7 Meter zuerst die Artikeleinheit im Artikelstamm prüfen.');
  return n;
 };
 const parseParts=(raw,unit)=>{
  if(!raw)return [];
  let parts;
  try{parts=JSON.parse(raw)}catch{throw Error('Lagerort-Teilmengen sind beschädigt.');}
  if(!Array.isArray(parts)||parts.length>80)throw Error('Ungültige Anzahl der Lagerort-Teilmengen.');
  const seen=new Set();
  return parts.map(p=>{
   const quantity=parseQuantity(p?.quantity,unit);
   if(quantity===null)throw Error('Lagerort-Teilmenge ohne Menge.');
   const key=JSON.stringify([Number(p?.warehouse_id)||null,String(p?.location||'').trim().toLocaleLowerCase('de-DE')]);
   if(seen.has(key))throw Error('Derselbe Lagerort ist mehrfach in den Teilmengen vorhanden.');
   seen.add(key);return {quantity,key};
  });
 };
 function inspect(items,rows){
  const lookup=new Map((rows||[]).map(x=>[Number(x.article_id),x]));
  const invalid=[],valid=[];
  for(const p of items||[]){
   const id=Number(p?.article_id),row=lookup.get(id);
   if(!row){invalid.push({article_id:id,article_no:String(p?.article_no||id),description:'Unbekannter Inventurartikel',unit:'',raw:'',reason:'Der Artikel gehört nicht zum geöffneten Inventurstand.',countIssue:false});continue;}
   const info={article_id:id,article_no:String(row.article_no||id),description:String(row.description||''),unit:String(row.unit||'Stk.'),raw:'counted_stock'in p?p.counted_stock:row.counted_stock,reason:'',countIssue:false};
   try{
    // Check *all* incoming fields as one atomic article update, never silently
    // drop a stock location or bin part to make the number look valid.
    let count;
    try{count=parseQuantity(info.raw,row.unit)}catch(e){info.countIssue=true;throw e;}
    const raw='bin_parts_json'in p?p.bin_parts_json:row.bin_parts_json;
    const parts=parseParts(raw,row.unit);
    if(parts.length){
     if(count===null)throw Error('Teilmengen sind erfasst, aber der Gesamtzählstand fehlt.');
     const total=parts.reduce((sum,x)=>sum+x.quantity,0);
     if(Math.abs(total-count)>1e-7)throw Error('Gesamtzählstand und Lagerort-Teilmengen stimmen nicht überein.');
    }
    valid.push(p);
   }catch(e){info.reason=e.message||String(e);invalid.push(info);}
  }
  return {valid,invalid};
 }
 function describe(issues){
  if(!issues?.length)return '';
  const first=issues[0];
  return `Speichern blockiert für ${issues.length} Artikel: ${first.article_no} (${first.unit||'ohne Einheit'}), Eingabe „${String(first.raw??'leer')}“. ${first.reason}`;
 }
 const getDoc=doc=>doc&&typeof doc.getElementById==='function'?doc:null;
 function render(doc,issues,actions={}){
  doc=getDoc(doc);if(!doc)return false;
  const anchor=doc.getElementById('inv75Saved');if(!anchor?.parentNode)return false;
  let panel=doc.getElementById('lv8812SaveIssues');
  if(!issues?.length){if(panel?.parentNode)panel.parentNode.removeChild(panel);return true;}
  if(!panel){panel=doc.createElement('section');panel.id='lv8812SaveIssues';panel.setAttribute('role','alert');panel.style.cssText='border:2px solid #b45309;border-radius:10px;padding:12px;margin:10px 0;background:#fff9ed;color:#202020';anchor.parentNode.insertBefore(panel,anchor.nextSibling)}
  panel.replaceChildren();
  const heading=doc.createElement('strong');heading.textContent='Achtung: '+issues.length+' ungespeicherte Inventureingabe(n) prüfen';panel.appendChild(heading);
  const intro=doc.createElement('p');intro.textContent='Andere gültige Artikel können gespeichert werden. Die fehlerhaften Eingaben bleiben als lokale Wiederherstellungskopie erhalten. Es wird nichts automatisch gelöscht.';panel.appendChild(intro);
  for(const issue of issues.slice(0,15)){
   const line=doc.createElement('div');line.style.cssText='border-top:1px solid #d7cbb8;padding:9px 0';
   const detail=doc.createElement('p');detail.textContent=`Artikel ${issue.article_no} – ${issue.description} · Einheit ${issue.unit||'?'}, Eingabe „${String(issue.raw??'leer')}“. ${issue.reason}`;line.appendChild(detail);
   if(issue.countIssue){
    const repair=doc.createElement('button');repair.type='button';repair.className='secondary';repair.textContent='Nur diese ungültige Zählung zurücksetzen';
    repair.onclick=()=>actions.repair?.(issue.article_id);line.appendChild(repair);
   }
   panel.appendChild(line);
  }
  const backup=doc.createElement('button');backup.type='button';backup.className='secondary';backup.textContent='Lokale Eingaben als Sicherung herunterladen';backup.onclick=()=>actions.backup?.();panel.appendChild(backup);
  return true;
 }
 return {inspect,parseQuantity,parseParts,isWhole,describe,render};
});
