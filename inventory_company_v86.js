/* V86: SAP-Firmenliste als Inventur-Referenz, nicht als Buchungsauftrag. */
(function(root,factory){const core=factory();if(typeof module==='object'&&module.exports)module.exports=core;else{root.LVInventoryCompanyV86Core=core;core.install?.()}})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const headers=['Material','Bezeichnung zum Material','Lagerort','Bezeichnung des Lagerorts','Frei verwendbar'];
 const norm=s=>String(s??'').trim().toLowerCase();
 function qty(v){const t=String(v??'').trim();if(typeof v==='number')return v;if(!t)return NaN;let s=t.replace(/\s/g,'');if(/^\d{1,3}(?:\.\d{3})+,\d{1,5}$/.test(s))s=s.replace(/\./g,'').replace(',','.');else if(/^\d+(?:,\d+)?$/.test(s))s=s.replace(',','.');else if(!/^\d+(?:\.\d+)?$/.test(s))return NaN;return Number(s)}
 function parseRows(data){
  if(!Array.isArray(data))throw Error('Die Firmenliste konnte nicht gelesen werden.');
  let head=-1,map=[];for(let i=0;i<Math.min(20,data.length);i++){const row=(data[i]||[]).map(norm);const inds=headers.map(h=>row.indexOf(norm(h)));if(inds.every(x=>x>=0)){head=i;map=inds;break}}
  if(head<0)throw Error('Erwartet wird die Firmenvorlage mit den fünf SAPUI5-Export-Spalten: '+headers.join('; '));
  const items=[],seen=new Set();for(let i=head+1;i<data.length;i++){
   const row=data[i]||[];if(!row.some(v=>String(v??'').trim()))continue;
   const arr=map.map(col=>row[col]??'');const material=String(arr[0]).trim(),location=String(arr[2]).trim();
   if(!material||material.length>100)throw Error(`Materialnummer fehlt/ungültig in Zeile ${i+1}.`);
   const company_stock=qty(arr[4]);if(!Number.isFinite(company_stock)||company_stock<0)throw Error(`Frei verwendbar ist ungültig bei Material ${material} (Zeile ${i+1}).`);
   const k=material.toLowerCase()+'|'+location.toLowerCase();if(seen.has(k))throw Error(`Material ${material} im Firmen-Lagerort ${location} mehrfach aufgeführt. Bitte Datei prüfen.`);seen.add(k);
   items.push({material,description:String(arr[1]||''),location,location_name:String(arr[3]||''),company_stock});
  }
  if(items.length===0||items.length>5000)throw Error('Die Firmenliste muss 1 bis 5000 Materialzeilen enthalten.');
  return items;
 }
 function compare(company,inventory){
  const map=new Map((inventory?.items||[]).map(a=>[String(a.article_no).trim().toLowerCase(),a]));
  const counts=new Map();for(const r of company){const k=norm(r.material);counts.set(k,(counts.get(k)||0)+1)}
  return company.map(r=>{
   const a=map.get(norm(r.material)),multi=counts.get(norm(r.material))>1;
   // Ein Artikel mit mehreren SAP-Positionen darf nicht je Position den Gesamtzaehlwert erhalten.
   let actual=null;
   if(a&&a.counted_stock!==null&&a.counted_stock!==undefined&&String(a.counted_stock).trim()!==''){
    if(multi){try{const parts=JSON.parse(a.bin_parts_json||'[]');const matching=parts.filter(p=>String(p.location)===String(r.location_name));if(matching.length===1)actual=Number(matching[0].quantity)}catch{}}
    else actual=Number(a.counted_stock);
   }
   const known=!!a,hasCount=actual!==null&&Number.isFinite(actual);
   return {...r,actual:hasCount?actual:null,difference:hasCount?Math.round((actual-r.company_stock)*1e8)/1e8:null,status:!known?'Artikel fehlt':!hasCount?(multi?'Mehrere SAP-Lagerorte: Teilzählung erforderlich':'Noch nicht gezählt'):'Gezählt'};
  });
 }
 function install(){if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let pending=[],loadedSession='';
  function message(txt,ok=false){const el=$('inv86CompanyMsg');el.textContent=txt;el.className='message '+(ok?'ok':'error');el.style.display='block';}
  function current(){return window.LVInventory?.current?.()}
  function render(rows,inv){const cmp=compare(rows,inv);$('inv86CompanyRows').innerHTML=cmp.slice(0,150).map(x=>`<tr><td>${esc(x.material)}</td><td>${x.company_stock.toLocaleString('de-DE')}</td><td>${x.actual===null?'–':x.actual.toLocaleString('de-DE')}</td><td>${x.difference===null?'–':x.difference.toLocaleString('de-DE')}</td><td>${esc(x.status)}</td></tr>`).join('');return cmp}
  globalThis.LVInventoryCompanyV86={
   async preview(){try{
    const inv=current();if(!inv||inv.session.status!=='draft')throw Error('Bitte zunächst eine laufende Inventur öffnen.');
    const file=$('inv86CompanyFile').files[0];if(!file)throw Error('Bitte die SAP-Excel-/CSV-Datei auswählen.');if(file.size>15*1024*1024)throw Error('Die Datei überschreitet 15 MB.');
    if(typeof XLSX==='undefined')throw Error('Excel-Importbibliothek fehlt. Bitte Seite neu laden.');
    const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellText:true,cellNF:true});const sheet=wb.Sheets['SAPUI5-Export']||wb.Sheets[wb.SheetNames[0]];
    pending=parseRows(XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false}));loadedSession=inv.session.id;
    const cmp=render(pending,inv);message(`${pending.length} Materialpositionen gefunden. ${cmp.filter(x=>x.status==='Artikel fehlt').length} Artikel fehlen. Noch keine Lagerbuchung erfolgt.`,true);$('inv86CompanyCommit').disabled=false;
   }catch(e){pending=[];$('inv86CompanyCommit').disabled=true;message(e.message)}},
   async import(){try{
    const inv=current();if(!inv||inv.session.status!=='draft'||inv.session.id!==loadedSession||!pending.length)throw Error('Bitte die Firmenliste erneut prüfen.');
    if(!confirm(`${pending.length} Positionen als Firmen-Vergleichsbestand in dieser Inventur speichern? Das erzeugt KEINE Buchung.`))return;
    if(!await window.LVInventory.save())throw Error('Inventur-Zwischenstand konnte nicht gespeichert werden.');
    const v=current();const result=await window.api('/api/inventory-v75/company-import',{method:'POST',body:JSON.stringify({id:v.session.id,version:v.session.version,database_id:v.database_id,items:pending})});
    window.LVInventory.updateFromExternal(result);pending=[];$('inv86CompanyCommit').disabled=true;render(result.company_rows||[],result);message('Firmenliste gespeichert. Die gezählten Bestände werden beim Export gegenübergestellt.',true);
   }catch(e){message(e.message)}},
   onInventory(inv){if(!inv)return;render(inv.company_rows||[],inv)},
   async export(){try{
    if(!await window.LVInventory.save())throw Error('Die Inventur wurde noch nicht gespeichert.');const inv=current();if(!inv)throw Error('Bitte eine Inventur öffnen.');
    const rows=inv.company_rows||[];if(!rows.length)throw Error('Noch keine Firmenliste importiert.');if(typeof XLSX==='undefined')throw Error('Excel-Bibliothek fehlt.');
    const cmp=compare(rows,inv);
    const original=[headers,...cmp.map(x=>[x.material,x.description,x.location,x.location_name,x.actual===null?x.company_stock:x.actual])];
    const detail=[['Material','Bezeichnung','Lagerort','Bezeichnung des Lagerorts','Firmenbestand ursprünglich','Gezählt','Differenz','Status'],...cmp.map(x=>[x.material,x.description,x.location,x.location_name,x.company_stock,x.actual??'',x.difference??'',x.status])];
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(original),'SAPUI5-Export');XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(detail),'Inventur-Abgleich');
    const blob=new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Inventur_Firmenabgleich_'+inv.session.name.replace(/[^a-z0-9_-]/gi,'_').slice(0,40)+'.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
    message(`Excel mit ${cmp.length} Positionen erstellt. Ungezählte Artikel behalten den ursprünglichen Firmenwert; Status ist im Abgleich ausgewiesen.`,true);
   }catch(e){message(e.message)}}
  };
 }
 return {parseRows,compare,install};
});
