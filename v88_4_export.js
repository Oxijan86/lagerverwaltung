/* Lagerverwaltung Lovrencic V88.4 – gespeicherte Zwischenstände oder abgeschlossene
 * Inventuren jederzeit in die Original-RONDO-PDF zurückschreiben.
 * Ein Export liest nur; einzig vor dem Export der AKTUELLEN offenen Inventur
 * wird der Inventur-Zwischenstand gesichert. KEIN Inventurabschluss.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV884Export=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clean=v=>String(v??'').normalize('NFKC').toLocaleUpperCase('de-DE').replace(/[\s_.]/g,'').trim();
 const label=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;',"'":'&#39;'}[c]));
 const counted=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
 function formatTodayDE(date=new Date()){
  if(!(date instanceof Date)||Number.isNaN(date.getTime()))throw Error('Das aktuelle Datum kann nicht ermittelt werden.');
  return [String(date.getDate()).padStart(2,'0'),String(date.getMonth()+1).padStart(2,'0'),String(date.getFullYear())].join('.');
 }
 function printMeta(technician,date=new Date()){
  const counter=String(technician??'').trim().replace(/\s+/g,' ');
  if(!counter)throw Error('Bitte den Namen des Zählers/Technikers eintragen.');
  if(counter.length>100)throw Error('Der Zählername ist zu lang (maximal 100 Zeichen).');
  return {counter,date:formatTodayDE(date)};
 }
 function buildPrintData(lines,inventory,normalizeCount){
  if(!Array.isArray(lines)||!lines.length)throw Error('Die originale Inventurliste hat keine geprüften Materialpositionen.');
  if(!inventory||!Array.isArray(inventory.items))throw Error('Kein gespeicherter Inventur-Zählstand ausgewählt.');
  const match=new Map((inventory.items||[]).map(i=>[clean(i.article_no),i]));
  const times=new Map();for(const row of lines){const key=clean(row.article_no);if(key)times.set(key,(times.get(key)||0)+1)}
  const quantities={},missing=[],uncertain=[],repeated=[],errors=[];
  for(const row of lines){
   const key=String(row.key??(row.page+':'+row.position));
   const material=clean(row.article_no);
   if(!material||row.verified===false){uncertain.push({key,material:row.article_no||'',reason:'Materialnummer noch nicht geprüft'});continue}
   if(times.get(material)>1){repeated.push({key,material:row.article_no,reason:'Material mehrfach im PDF; keine Gesamtzählung doppelt ausdrucken'});continue}
   const inv=match.get(material);
   if(!inv||!counted(inv.counted_stock)){missing.push({key,material:row.article_no||'',reason:'Noch nicht gezählt'});continue}
   try{quantities[key]=normalizeCount(inv.counted_stock,row.unit||inv.unit||'Stk.')}catch(e){errors.push({key,material:row.article_no||'',reason:e.message})}
  }
  return {quantities,printed:Object.keys(quantities).length,total:lines.length,blank:lines.length-Object.keys(quantities).length,missing,uncertain,repeated,errors};
 }
 function filename(status,name,date){
  const kind=status==='completed'?'Abgeschlossen':status==='draft'?'Zwischenstand':'Abgebrochen';
  const slug=String(name||'Inventur').normalize('NFKC').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,45).replace(/_+$/,'')||'Inventur';
  const day=String(date||new Date().toISOString().slice(0,10)).slice(0,10);
  return `RONDO_Inventur_${kind}_${slug}_${day}.pdf`;
 }
 function planStatus(session,print){
  const status=session?.status||'draft';
  const phase=status==='completed'?'Abgeschlossen – endgültige Zählwerte':status==='draft'?'Zwischenstand – Lagerbestände noch unverändert':'Abgebrochen – archivierte Zählwerte';
  const incomplete=print.blank?`${print.blank} Positionen bleiben im PDF unbeschriftet.`:'Alle Positionen haben Zählwerte.';
  return `${phase}. ${print.printed} von ${print.total} Positionen werden ausgefüllt. ${incomplete}`;
 }
 async function run(ctx){
  if(!ctx||typeof ctx.getStored!=='function'||typeof ctx.api!=='function'||!ctx.pdf)throw Error('RONDO-PDF-Ausgabe nicht richtig eingerichtet.');
  const stored=await ctx.getStored();if(!stored?.bytes)throw Error('Die Original-RONDO-PDF fehlt. Bitte die PDF erneut importieren.');
  const lines=stored.edited?.length?stored.edited:ctx.core.checkRows(stored.pages).rows;
  if(!lines?.length)throw Error('Die PDF enthält noch keine gespeicherten Materialpositionen.');
  const index=await ctx.api('/api/inventory-v75/index');
  const sessions=(index?.sessions||[]).filter(s=>['draft','completed','cancelled'].includes(s.status));
  if(!sessions.length)throw Error('Es existiert noch keine Inventur. Bitte zuerst eine Inventur anlegen und Zählwerte erfassen.');
  const masterdata=await ctx.api('/api/masterdata').catch(()=>({}));
  const defaultTechnician=String(masterdata?.default_technician||'').trim();
  const current=ctx.inventory?.current?.();
  const chosen=current?.session?.id&&sessions.some(s=>s.id===current.session.id)?current.session.id:(sessions.find(s=>s.status==='draft')||sessions.find(s=>s.status==='completed')||sessions[0]).id;
  const content=ctx.dialog(`<p><b>RONDO-Inventur als ausgefüllte PDF</b></p>
    <p>Du kannst die PDF <b>jederzeit während der Zählung</b> als Zwischenstand oder <b>nach der Inventur</b> erneut erzeugen.</p>
    <label>Gespeicherte Inventur auswählen <select id="lv884PdfSession">${sessions.map(s=>`<option value="${label(s.id)}" ${s.id===chosen?'selected':''}>${label(s.name||'Inventur')} – ${s.status==='completed'?'Abgeschlossen':s.status==='draft'?'In Arbeit':'Abgebrochen'} (${Number(s.counted||0)}/${Number(s.total||0)})</option>`).join('')}</select></label>
    <div class="lv87-grid" style="margin-top:12px">
      <label>Zähler / Techniker <input id="lv884PdfCounter" type="text" maxlength="100" autocomplete="name" value="${label(defaultTechnician)}" placeholder="Name des Technikers" required></label>
      <label>Datum <input type="text" value="${formatTodayDE()}" readonly aria-label="Datum des heutigen Tages"></label>
    </div>
    <p class="lv87-hint">Zähler und heutiges Datum werden auf jeder Seite in die Original-RONDO-Vorlage geschrieben. Die Signatur bleibt frei.</p>
    <p id="lv884PdfInfo" class="lv87-hint">Fehlende Zählwerte bleiben leer. Nullbestände (0) werden ausdrücklich als 0 gedruckt.</p>
    <div class="lv87-flex"><button id="lv884PdfStart" type="button" class="primary">PDF mit bisherigen Zählwerten erzeugen</button><button id="lv884PdfCancel" type="button" class="secondary" hidden>Erstellung abbrechen</button></div>
    <div id="lv884PdfStatus" class="lv87-status" role="status">Die PDF-Erstellung verändert KEINE Lagerbestände. Erst „Inventur verbindlich abschließen“ übernimmt Bestände.</div>`, 'Ausgefüllte RONDO-PDF erzeugen');
  const $=id=>content.querySelector('#'+id);
  const select=$('lv884PdfSession'),submit=$('lv884PdfStart'),cancel=$('lv884PdfCancel'),status=$('lv884PdfStatus'),counterInput=$('lv884PdfCounter');
  let stopped=false,busy=false;
  cancel.onclick=()=>{stopped=true;status.textContent='Abbruch angefordert. Bereits gespeicherte Zählungen bleiben unverändert.'};
  select.onchange=()=>{$('lv884PdfInfo').textContent='Die ausgewählte Inventur wird nur für die PDF-Ausgabe gelesen. Eine offene Inventur wird nicht abgeschlossen.'};
  submit.onclick=async()=>{
   if(busy)return;
   busy=true;stopped=false;submit.disabled=true;select.disabled=true;cancel.hidden=false;
   try{
    const metadata=printMeta(counterInput.value);
    const id=select.value,ses=sessions.find(s=>String(s.id)===String(id));
    if(!ses)throw Error('Inventur konnte nicht gefunden werden.');
    if(ses.status==='draft'&&current?.session?.id===id){
     status.textContent='Offenen Zählzwischenstand speichern – keine Bestandsbuchung …';
     if(typeof ctx.inventory.save!=='function'||!await ctx.inventory.save())throw Error('Zählzwischenstand wurde noch nicht dauerhaft gespeichert. PDF-Ausgabe zum Schutz vor falschen Mengen abgebrochen.');
    }
    const snapshot=await ctx.api('/api/inventory-v75/get?id='+encodeURIComponent(id));
    if(snapshot?.database_id!==index.database_id)throw Error('Inventur stammt aus einer anderen Datenbank. Export abgebrochen.');
    if(snapshot?.session?.id!==id)throw Error('Inventurzuordnung hat sich geändert. Export abgebrochen.');
    const result=buildPrintData(lines,snapshot,ctx.core.normCount);
    $('lv884PdfInfo').textContent=planStatus(snapshot.session,result);
    if(result.blank){
     const details=[result.uncertain.length&&`${result.uncertain.length} OCR-Positionen noch ungeprüft`,result.repeated.length&&`${result.repeated.length} Doppelnummern`,result.errors.length&&`${result.errors.length} ungültige Zählmengen`].filter(Boolean).join(', ');
     if(!ctx.confirm(`${result.printed} von ${result.total} Positionen sind druckbar. ${result.blank} bleiben im Originalbeleg leer.${details?'\nAchtung: '+details+'.':''}\n\nEine TEILWEISE ausgefüllte RONDO-PDF erzeugen? Die Inventur und der Lagerbestand bleiben unverändert.`))return;
    }
    // Auch ein noch leerer Zwischenstand darf als Kopie mit Zähler und Datum gedruckt werden.
    const beforePrint=snapshot?.session?.status;
    status.textContent=`${result.printed} Zählwerte werden in die Original-PDF geschrieben – ${beforePrint==='completed'?'abgeschlossene Inventur':'Zwischenstand, keine Bestandsbuchung'} …`;
    const blob=await ctx.pdf.render(stored.bytes,lines,result.quantities,msg=>{status.textContent=msg+' · Es werden keine Lagerbestände geändert.'},()=>stopped,metadata);
    if(stopped)throw Error('PDF-Ausgabe abgebrochen. Keine Bestände verändert.');
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename(beforePrint,snapshot.session.name);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    status.textContent=`PDF erzeugt: ${result.printed}/${result.total} Positionen ausgefüllt${result.blank?' · '+result.blank+' bleiben leer':''}. ${beforePrint==='completed'?'Inventur war bereits abgeschlossen.':'Lagerbestände bleiben bis zum Inventurabschluss unverändert.'}`;
   }catch(e){status.textContent='Fehler beim PDF-Erzeugen: '+(e?.message||e);status.style.color='#a20d0d'}
   finally{busy=false;submit.disabled=false;select.disabled=false;cancel.hidden=true}
  };
  return {sessions:sessions.length,selected:chosen};
 }
 return {clean,counted,formatTodayDE,printMeta,buildPrintData,filename,planStatus,run};
});
