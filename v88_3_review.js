/* Lagerverwaltung Lovrencic V88.6 – schnelle OCR-Prüfung und spätere Zuordnung gegen bestehenden Artikelstamm.
 * Reine Daten-/Vorschlagslogik auch in Node testbar. Keine Bestandsänderungen.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV883Review=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const norm=v=>String(v??'').normalize('NFKC').toLocaleUpperCase('de-DE').replace(/\s+/g,' ').trim();
 const code=v=>norm(v).replace(/[\s_.]/g,'');
 const words=s=>new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>1&&w!=='NICHT'&&w!=='GEZAEHLT'));
 function textSimilarity(a,b){
  const A=words(a),B=words(b);if(!A.size||!B.size)return 0;
  let shared=0;for(const t of A)if(B.has(t))shared++;
  return 2*shared/(A.size+B.size);
 }
 function distance(a,b,limit=2){
  if(a===b)return 0;
  if(Math.abs(a.length-b.length)>limit)return limit+1;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
   const next=[i];let minimum=i;
   for(let j=1;j<=b.length;j++){
    const value=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    next[j]=value;minimum=Math.min(minimum,value);
   }
   if(minimum>limit)return limit+1;
   prev=next;
  }
  return prev[b.length];
 }
 function glyphKey(v){return code(v).replace(/[IL1]/g,'1').replace(/[O0]/g,'0').replace(/[B8]/g,'8').replace(/[S5]/g,'5');}
 function candidates(row,articles,max=5){
  const no=code(row?.article_no),desc=row?.description||'';
  const found=[];
  for(const a of articles||[]){
   if(!a?.article_no)continue;
   const other=code(a.article_no),exact=!!no&&no===other;
   const similarity=textSimilarity(desc,a.description);
   const diff=!exact&&no&&Math.abs(no.length-other.length)<=2?distance(no,other,2):3;
   const prefix=!!no&&other.startsWith(no)&&no.length>=3;
   const confusable=!!no&&no.length>=5&&no!==other&&glyphKey(no)===glyphKey(other);
   if(!exact&&diff>2&&!prefix&&!confusable&&similarity<0.72)continue;
   // Exact IDs first, then close OCR variants, finally name-only matches.
   const score=(exact?100:confusable?75:diff===1?60:diff===2?35:prefix?42:0)+Math.round(25*similarity);
   found.push({article:a,exact,similarity,distance:diff,score});
  }
  found.sort((a,b)=>b.score-a.score||String(a.article.article_no).localeCompare(String(b.article.article_no),'de'));
  return found.slice(0,max);
 }
 function duplicates(rows){
  const seen=new Map(),bad=new Set();
  for(let i=0;i<rows.length;i++){
   if(rows[i].review_action==='defer')continue;
   const key=code(rows[i].article_no);if(!key)continue;
   if(seen.has(key)){bad.add(i);bad.add(seen.get(key))}else seen.set(key,i);
  }
  return bad;
 }
 function batchEligible(row,articles,rows,i){
  if(!row||row.review_action==='defer'||row.verified!==false||!row.article_no||!row.description||duplicates(rows).has(i))return false;
  const matches=candidates(row,articles,1),m=matches[0];
  // Niemals allein wegen einer ähnlichen Nummer automatisch zuordnen.
  return !!(m?.exact&&m.similarity>=0.85);
 }
 function approve(row,rows,i,validator){
  const number=String(row?.article_no||'').trim(),description=String(row?.description||'').trim();
  if(!validator(number)||!description)throw Error('Bitte zuerst eine gültige Materialnummer und Bezeichnung eintragen.');
  if(duplicates(rows).has(i))throw Error('Materialnummer kommt mehrfach im Beleg vor. Bitte Doppelpositionen prüfen.');
  row.verified=true;delete row.review_action;row.warning='';row.checked_at=new Date().toISOString();
  return row;
 }
 function adopt(row,article,rows,i,validator){
  if(!article?.article_no)throw Error('Bitte einen Artikel aus der vorhandenen Datenbank auswählen.');
  const proposed=code(article.article_no);
  if(rows.some((r,j)=>i!==j&&r.review_action!=='defer'&&code(r.article_no)===proposed))throw Error('Dieser Materialstamm ist schon einer anderen PDF-Position zugeordnet.');
  if(!validator(String(article.article_no)))throw Error('Artikelnummer aus Lagerdatenbank ungültig.');
  row.article_no=String(article.article_no);
  row.description=String(article.description||row.description||'').trim();
  if(['Stk.','L','m'].includes(String(article.unit)))row.unit=article.unit;
  return approve(row,rows,i,validator);
 }
 function enhance({root,rows,articles,validate,onUpdate,onFilter}){
  if(!root||!Array.isArray(rows)||!Array.isArray(articles))return;
  const table=root.querySelector('.lv87-page table'),body=table?.querySelector('tbody');
  if(!table||!body||table.dataset.v883Review)return;
  table.dataset.v883Review='1';
  const cssId='lv883ReviewStyle';
  if(typeof document!=='undefined'&&!document.getElementById(cssId)){
   const style=document.createElement('style');style.id=cssId;style.textContent=`
    #lv87ModalBody .lv883-action{min-height:40px;white-space:normal;padding:8px 10px}
    #lv87ModalBody .lv883-actions{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
    #lv87ModalBody .lv883-actions select{min-width:155px;max-width:100%;flex:1 1 180px}
    #lv87ModalBody .lv883-hint{font-size:12px;color:#576778;display:block;margin-top:5px;max-width:400px;overflow-wrap:anywhere}
    #lv87ModalBody .lv883-reviewbar{margin:12px 0;border:1px solid #adbac6;border-radius:9px;padding:10px;background:#f5f8fa}
    #lv87ModalBody .lv883-reviewbar button{margin:3px}
    #lv87ModalBody tr.lv883-unchecked{background:#fffaf0}
    #lv87ModalBody tr.lv886-deferred{background:#eff3f6}
    @media(max-width:700px){
     #lv87ModalBody .lv87-page{max-height:62vh}
     #lv87ModalBody .lv87-table{min-width:0!important;width:100%;display:block}
     #lv87ModalBody .lv87-table thead{display:none}
     #lv87ModalBody .lv87-table tbody{display:block}
     #lv87ModalBody .lv87-table tr{display:block;border:1px solid #c6d3de;border-radius:10px;margin:0 0 10px;padding:10px;background:#fff}
     #lv87ModalBody .lv87-table tr.lv883-unchecked{background:#fff9ec}
     #lv87ModalBody .lv87-table tr.lv886-deferred{background:#eff3f6}
     #lv87ModalBody .lv87-table td{display:block;padding:5px 2px;border:0;overflow-wrap:anywhere}
     #lv87ModalBody .lv87-table td::before{content:attr(data-label);display:block;font-size:12px;color:#526273;font-weight:600;margin-bottom:3px}
     #lv87ModalBody .lv87-table input,#lv87ModalBody .lv87-table select{width:100%;max-width:100%!important;min-height:39px;box-sizing:border-box}
     #lv87ModalBody .lv883-actions button{flex:1 0 120px}
    }`;
   document.head.appendChild(style);
  }
  const head=table.querySelector('thead tr');if(head){const th=document.createElement('th');th.textContent='Direkt prüfen / Datenbankvergleich';head.appendChild(th)}
  const err=rows.filter(r=>r.verified===false&&r.review_action!=='defer').length, deferred=rows.filter(r=>r.review_action==='defer').length,duplicatesIndices=duplicates(rows);
  const toolbar=document.createElement('div');toolbar.className='lv883-reviewbar';
  const subtitle=document.createElement('div');subtitle.textContent=`${err} Positionen noch zu prüfen · ${deferred} für später zurückgestellt · ${articles.length} Materialien in der vorhandenen Datenbank`;
  toolbar.appendChild(subtitle);
  const btn=(label,callback)=>{const b=document.createElement('button');b.type='button';b.className='secondary lv883-action';b.textContent=label;b.addEventListener('click',callback);toolbar.appendChild(b);return b};
  const runUpdate=()=>Promise.resolve(onUpdate?.()).catch(e=>{console.error(e);alert('Prüfung konnte nicht gespeichert/angezeigt werden: '+e.message)});
  const eligible=rows.reduce((n,row,i)=>n+(batchEligible(row,articles,rows,i)?1:0),0);
  const batch=btn(`✓ ${eligible} eindeutige DB-Treffer gesammelt bestätigen`,()=>{
   const keys=rows.map((row,i)=>batchEligible(row,articles,rows,i)?i:-1).filter(i=>i>=0);
   if(!keys.length)return;
   if(!confirm(`${keys.length} Artikel mit identischer Materialnummer und übereinstimmender Bezeichnung als geprüft markieren? Keine Lagerbestände werden verändert.`))return;
   for(const i of keys)approve(rows[i],rows,i,validate);
   runUpdate();
  });batch.disabled=eligible===0;
  btn('⚠ Nur offene / unsichere Zeilen',()=>onFilter?.('unsicher'));
  const tableWrap=table.closest('.lv87-page');tableWrap?.parentNode?.insertBefore(toolbar,tableWrap);
  const visibleRows=[...body.querySelectorAll('tr')];
  for(const tr of visibleRows){
   const index=Number(tr.querySelector('[data-v87-row]')?.dataset.v87Row);
   if(!Number.isInteger(index)||index<0||index>=rows.length)continue;
   const r=rows[index],found=candidates(r,articles,5),exact=found.find(x=>x.exact);
   if(r.review_action==='defer')tr.classList.add('lv886-deferred');else if(r.verified===false)tr.classList.add('lv883-unchecked');
   for(const [j,cell] of [...tr.querySelectorAll('td')].entries())cell.dataset.label=['Seite / Position','Artikelnummer','Bezeichnung','Einheit','OCR-Status'][j]||'';
   const td=document.createElement('td');td.dataset.label='Schnellprüfung';
   const actions=document.createElement('div');actions.className='lv883-actions';
   const add=(label,callback,primary=false)=>{const b=document.createElement('button');b.type='button';b.className=(primary?'primary':'secondary')+' lv883-action';b.textContent=label;b.addEventListener('click',callback);actions.appendChild(b);return b};
   const flash=document.createElement('div');flash.className='lv883-hint';flash.setAttribute('role','status');
   const exec=fn=>{try{fn();runUpdate()}catch(e){flash.textContent=e.message;flash.style.color='#a20d0d'}};
   if(r.review_action==='defer'){
    add('↶ Zur Prüfung zurückholen',()=>exec(()=>{delete r.review_action;r.verified=false}),true);
    const statusCell=tr.querySelectorAll('td')[4];if(statusCell)statusCell.textContent='⏳ Später zuordnen';
   }else if(r.verified===false){
    add('✓ Diese Zeile geprüft',()=>exec(()=>approve(r,rows,index,validate)),true);
   }else{
    const good=document.createElement('span');good.textContent='✓ Geprüft';good.style.color='#166b3b';good.style.fontWeight='bold';actions.appendChild(good);
   }
   if(r.review_action!=='defer')add('⏭ Später zuordnen',()=>exec(()=>{r.review_action='defer';r.verified=false;r.checked_at=''}));
   if(r.review_action==='defer'){
    flash.textContent='Bleibt in der gespeicherten PDF-Prüfliste. Es wird kein Artikel angelegt und kein Bestand verändert.';
   }else if(exact){
    add('↳ Datenbankartikel übernehmen',()=>exec(()=>adopt(r,exact.article,rows,index,validate)));
    flash.textContent=`Im Lager vorhanden: ${exact.article.article_no} – ${exact.article.description||''}`;
   }else if(found.length){
    const select=document.createElement('select');select.setAttribute('aria-label',`Datenbankvorschlag für PDF-Seite ${r.page}, Position ${r.position}`);
    const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Passenden Lagerartikel auswählen …';select.appendChild(placeholder);
    for(let j=0;j<found.length;j++){const o=document.createElement('option');o.value=String(j);o.textContent=`${found[j].article.article_no} – ${found[j].article.description||''}`;select.appendChild(o)}
    actions.appendChild(select);
    add('Vorschlag übernehmen',()=>exec(()=>{
     if(select.value==='')throw Error('Bitte zuerst einen passenden Datenbankartikel auswählen.');
     adopt(r,found[Number(select.value)].article,rows,index,validate);
    }));
    flash.textContent='Mögliche vorhandene Artikel – nur nach Sichtprüfung übernehmen. Kein automatisches Erraten.';
   }else{flash.textContent='Kein Datenbanktreffer. Bei korrekter Artikelnummer direkt „Diese Zeile geprüft“ wählen.'}
   if(duplicatesIndices.has(index)){flash.textContent='Achtung: doppelte Materialnummer im PDF. Bitte erst korrigieren.';flash.style.color='#a20d0d'}
   td.appendChild(actions);td.appendChild(flash);tr.appendChild(td);
  }
 }
 return {norm,code,glyphKey,textSimilarity,distance,candidates,duplicates,batchEligible,approve,adopt,enhance};
});
