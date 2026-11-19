/* Lagerverwaltung Lovrencic V88.14: separate, vorsichtig klassifizierte
 * Firmen-Zusatzliste fuer Artikel ausserhalb der Original-RONDO-Inventur.
 * Niemals falsche OCR-Zuordnungen als gesicherte Abwesenheit ausgeben.
 * Keine Datenbankaenderungen. Browser- und Node-kompatibel. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV8814Report=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clean=s=>String(s??'').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const folded=s=>clean(s).replace(/[I1L]/g,'1').replace(/[O0]/g,'0').replace(/[B8]/g,'8').replace(/[S5]/g,'5');
 const hasCount=x=>x!==null&&x!==undefined&&String(x).trim()!=='';
 const textScore=(a,b)=>{
  const tokens=s=>new Set(String(s||'').normalize('NFKC').toUpperCase().split(/[^A-Z0-9ÄÖÜ]+/).filter(t=>t.length>2));
  const aa=tokens(a),bb=tokens(b);if(!aa.size||!bb.size)return 0;
  let both=0;for(const w of aa)if(bb.has(w))both++;
  return 2*both/(aa.size+bb.size);
 };
 const amount=v=>v===null||v===undefined||String(v).trim()===''?'':String(v).replace('.',',');
 function inventoryLocations(row){
  if(!row)return '';
  let parts=[];try{parts=JSON.parse(row.bin_parts_json||'[]')}catch{}
  if(Array.isArray(parts)&&parts.length)return parts.map(p=>(p.location||'ohne Lagerort')+' ('+amount(p.quantity)+')').join(' | ');
  return String(row.location||'');
 }
 function build(lines,articles,session,matchCore){
  if(!Array.isArray(lines)||!lines.length)throw Error('Keine gueltigen RONDO-Belegpositionen verfuegbar.');
  if(!Array.isArray(articles))throw Error('Artikelstamm konnte nicht gelesen werden.');
  if(!session||!Array.isArray(session.items))throw Error('Keine Inventur zum Abgleich ausgewaehlt.');
  const rawPositions=[...lines];
  const counts=new Map(session.items.map(x=>[Number(x.article_id),x]));
  const missing=[],uncertain=[];
  for(const a of articles){
   if(a.active===0||a.active===false||!clean(a.article_no))continue;
   const no=clean(a.article_no);
   const confirmed=rawPositions.some(p=>{
    if(p.verified===false||p.review_action==='defer'||clean(p.article_no)!==no)return false;
    if(p.manual_link)return true;
    if(!String(p.description||'').trim()||!String(a.description||'').trim())return false;
    const sim=matchCore?.textScore?matchCore.textScore(p.description,a.description):textScore(p.description,a.description);
    return sim>=0.32;
   });
   if(confirmed)continue;
   const inventory=counts.get(Number(a.id||a.article_id));
   const counted=!!inventory&&hasCount(inventory.counted_stock),value=counted?inventory.counted_stock:null;
   const possible=rawPositions.filter(p=>{
    if(p.manual_link)return false;
    const raw=clean(p.article_no);
    const similarNumber=raw===no||(raw.length>=5&&no.length===raw.length&&folded(raw)===folded(no));
    const nameSimilarity=(matchCore?.textScore?matchCore.textScore(p.description,a.description):textScore(p.description,a.description));
    return similarNumber||nameSimilarity>=0.72;
   });
   const row={article_no:String(a.article_no),description:String(a.description||''),unit:String(a.unit||''),
    inventory_count:counted?amount(value):'',book_stock:amount(a.stock),
    location:counted?inventoryLocations(inventory):String(a.location||''),
    count_status:counted?'In dieser Inventur gezählt':'Nicht gezählt – Buchbestand nicht inventurgeprüft',
    possible_pdf_positions:possible.map(p=>'Seite '+p.page+'/Pos. '+p.position+' ('+p.article_no+')').join(' | '),
    status:possible.length?'OCR-ZUORDNUNG PRÜFEN':'NICHT IN RONDO-PDF'};
   (possible.length?uncertain:missing).push(row);
  }
  missing.sort((a,b)=>a.article_no.localeCompare(b.article_no,'de',{numeric:true}));
  uncertain.sort((a,b)=>a.article_no.localeCompare(b.article_no,'de',{numeric:true}));
  return {missing,uncertain,reportRows:[...missing,...uncertain],totalArticles:articles.filter(a=>a.active!==0&&a.active!==false).length,pdfPositions:lines.length,sessionName:String(session.session?.name||''),date:new Date().toISOString().slice(0,10)};
 }
 function csv(report){
  if(!report||!Array.isArray(report.reportRows))throw Error('Zusatzliste fehlt.');
  const columns=['Status','Artikelnummer','Bezeichnung','Einheit','Gezählte Menge','Aktueller Buchbestand','Lagerort / Inventur-Fundorte','Zählstatus','Mögliche PDF-Positionen'];
  const quote=v=>{
   let s=String(v??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;
   return '"'+s.replace(/"/g,'""')+'"';
  };
  const out=['sep=;',columns.map(quote).join(';')];
  for(const r of report.reportRows)out.push([r.status,r.article_no,r.description,r.unit,r.inventory_count,r.book_stock,r.location,r.count_status,r.possible_pdf_positions].map(quote).join(';'));
  return '\uFEFF'+out.join('\r\n')+'\r\n';
 }
 function filename(sessionName){const name=String(sessionName||'Inventur').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,36)||'Inventur';return 'RONDO_Zusatzliste_nicht_im_PDF_'+name+'_'+new Date().toISOString().slice(0,10)+'.csv';}
 return {clean,folded,hasCount,build,csv,filename};
});
