/* Lagerverwaltung Lovrencic V88.7 – gespeicherte Zwischenstände oder abgeschlossene
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
   if(!material||row.verified===false||row.review_action==='defer'){uncertain.push({key,material:row.article_no||'',reason:'Materialnummer noch nicht geprüft'});continue}
   if(times.get(material)>1){repeated.push({key,material:row.article_no,reason:'Material mehrfach im PDF; keine Gesamtzählung doppelt ausdrucken'});continue}
   const inv=match.get(material);
   const checker=typeof window!=='undefined'?window.LV8813PDFMatch:globalThis.LV8813PDFMatch;
   if(!row.manual_link&&inv&&checker&&String(row.description||'').trim()&&String(inv.description||'').trim()&&checker.textScore(row.description,inv.description)<0.32){uncertain.push({key,material:row.article_no||'',reason:'Bezeichnung passt nicht zu erkannter Artikelnummer. Bitte PDF-Schnellzuordnung pruefen.'});continue}
   if(!inv||!counted(inv.counted_stock)){missing.push({key,material:row.article_no||'',reason:'Noch nicht gezählt'});continue}
   try{quantities[key]=normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.')}catch(e){errors.push({key,material:row.article_no||'',reason:e.message})}
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

 /* V88.7: Fail-closed PDF exporter. The old LV87PDF canvas renderer is NOT
  * an acceptable fallback, even if a stale service worker supplies it.
  * This code always invokes the original-byte incremental PDF renderer.
  */
 const SAFE_SHA='a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b';
 let safePdfLoading=null;
 async function verifiedRenderer(){
  const w=typeof window!=='undefined'?window:globalThis;
  if(w.LV886PDF?.KNOWN_SHA===SAFE_SHA&&typeof w.LV886PDF.render==='function')return w.LV886PDF;
  if(!w.document)throw Error('Verlustfreier PDF-Export nicht geladen (V88.7 erforderlich).');
  if(!safePdfLoading)safePdfLoading=new Promise((resolve,reject)=>{
   const node=w.document.createElement('script');
   node.src=new URL('v88_6_pdf.js?v=88.7',w.document.baseURI).href;
   node.async=false;
   node.onload=()=>w.LV886PDF?.KNOWN_SHA===SAFE_SHA&&typeof w.LV886PDF.render==='function'
    ?resolve(w.LV886PDF):reject(Error('Sicherer PDF-Exporter wurde geladen, aber nicht aktiviert.'));
   node.onerror=()=>reject(Error('Sicherer PDF-Exporter konnte nicht geladen werden. Verbindung/Cache prüfen.'));
   w.document.head.appendChild(node);
  }).catch(e=>{safePdfLoading=null;throw e});
  return safePdfLoading;
 }
 async function checkOriginalPrefix(blob,raw){
  if(!(blob instanceof Blob))throw Error('PDF-Ausgabe fehlt.');
  const original=raw instanceof Uint8Array?raw:raw instanceof ArrayBuffer?new Uint8Array(raw):ArrayBuffer.isView(raw)?new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength):null;
  if(!original||blob.size<original.length+1000)throw Error('Original-PDF konnte nicht verlustfrei eingebettet werden. Download abgebrochen.');
  const beginning=new Uint8Array(await blob.slice(0,original.length).arrayBuffer());
  for(let i=0;i<original.length;i++)if(beginning[i]!==original[i])throw Error('Originalseiten fehlen oder wurden verändert. Es wird KEINE fehlerhafte PDF heruntergeladen.');
  return true;
 }
 async function run(ctx){
  if(!ctx||typeof ctx.getStored!=='function'||typeof ctx.api!=='function'||!ctx.core)throw Error('RONDO-PDF-Ausgabe nicht richtig eingerichtet.');
  const stored=await ctx.getStored();if(!stored?.bytes)throw Error('Die Original-RONDO-PDF fehlt. Bitte die PDF erneut importieren.');
  let lines=(stored.edited?.length?stored.edited:ctx.core.checkRows(stored.pages).rows).map(x=>({...x}));
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
    <p class="lv87-hint">Zählmengen werden links neben ST/M auf die freie Linie gesetzt. Originaltext und Belege bleiben vollständig erhalten. Zähler und Datum stehen auf ihren Linien, Signatur bleibt frei.</p>
    <p id="lv884PdfInfo" class="lv87-hint">Fehlende Zählwerte bleiben leer. Nullbestände (0) werden ausdrücklich als 0 gedruckt.</p>
    <section id="lv8813MatchPanel" style="border:1px solid #a8b8c7;border-radius:10px;padding:10px;margin:12px 0">
      <h3 style="margin:0 0 8px">PDF-Positionen schnell zuordnen</h3>
      <p class="lv87-hint">Die Anwendung schlägt passende bereits gezählte Artikel anhand von Artikelnummer und Bezeichnung vor. Nur bestätigte Zuordnungen werden gespeichert; es werden keine Bestände geändert.</p>
      <label>PDF-Position oder Artikel suchen <input id="lv8813MatchSearch" placeholder="z. B. USB-Stick, 11000339, Seite 4" type="search" autocomplete="off" style="width:100%"></label>
      <div id="lv8813MatchStatus" class="lv87-hint" role="status">Zuordnungen werden geprüft ...</div>
      <div id="lv8813MatchRows" style="max-height:40vh;overflow:auto"></div>
    </section>
    <section style="border:1px solid #a8b8c7;border-radius:10px;padding:10px;margin:12px 0">
      <h3 style="margin:0 0 8px">Zusatzliste: Lagerartikel, die im RONDO-PDF fehlen</h3>
      <p class="lv87-hint">Separater CSV-Bericht fuer RONDO: Artikelnummer, Beschreibung, Lagerort, gezaehlte Menge und aktuellen Buchbestand. Moegliche OCR-Verwechslungen werden unter „OCR-ZUORDNUNG PRUEFEN“ getrennt ausgewiesen und nicht als sicher fehlend gemeldet. Ungezaehlte Werte sind ausdruecklich nur Buchbestaende.</p>
      <button id="lv8814ReportDownload" type="button" class="secondary">Zusatzliste fuer RONDO herunterladen (CSV)</button>
      <div id="lv8814ReportStatus" class="lv87-hint" role="status"></div>
    </section>
    <div class="lv87-flex"><button id="lv884PdfStart" type="button" class="primary">PDF mit bisherigen Zählwerten erzeugen</button><button id="lv884PdfCancel" type="button" class="secondary" hidden>Erstellung abbrechen</button></div>
    <div id="lv884PdfStatus" class="lv87-status" role="status">Die PDF-Erstellung verändert KEINE Lagerbestände. Erst „Inventur verbindlich abschließen“ übernimmt Bestände.</div>`, 'Ausgefüllte RONDO-PDF erzeugen');
  const $=id=>content.querySelector('#'+id);
  const select=$('lv884PdfSession'),submit=$('lv884PdfStart'),cancel=$('lv884PdfCancel'),status=$('lv884PdfStatus'),counterInput=$('lv884PdfCounter');
  let stopped=false,busy=false;
  /* LV8813_PDF_QUICK_ASSIGN: erst pruefen, dann ausdruecklich zuordnen. */
  const matchCore=typeof window!=='undefined'?window.LV8813PDFMatch:null;
  const matchRoot=$('lv8813MatchRows'),matchStatus=$('lv8813MatchStatus'),matchSearch=$('lv8813MatchSearch');
  let matchItems=[],matchSnapshot=null;
  const txt=(el,str)=>{el.textContent=String(str??'');return el};
  const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
  const setBusy=flag=>{busy=flag;submit.disabled=flag;select.disabled=flag;matchSearch.disabled=flag};
  async function matchLoad(){
   if(!matchCore){matchStatus.textContent='Artikelvergleich V88.14 nicht geladen. Bitte die Anwendung aktualisieren.';return;}
   try{
    const id=select.value;matchSnapshot=await ctx.api('/api/inventory-v75/get?id='+encodeURIComponent(id));
    if(matchSnapshot?.database_id!==index.database_id)throw Error('Inventur gehört nicht zur gewählten Datenbank.');
    matchItems=matchSnapshot.items||[];matchRender();
   }catch(e){matchStatus.textContent='Zuordnung konnte nicht geladen werden: '+e.message;}
  }
  function matchRender(){
   if(!matchCore)return;
   const all=matchCore.summarize(lines,matchItems),q=matchCore.norm(matchSearch.value);
   const relevant=q?all.filter(x=>matchCore.norm([x.row.page,x.row.position,x.row.article_no,x.row.description,x.options.map(y=>y.article.article_no+' '+y.article.description).join(' ')].join(' ')).includes(q)):all;
   matchStatus.textContent=`${all.length} nicht zugeordnete oder ungeprüfte PDF-Positionen; ${relevant.length} Treffer${relevant.length>18?' (erste 18 angezeigt)':''}. Nicht alle leeren Mengen sind Fehler: manche Artikel wurden noch nicht gezählt.`;
   matchRoot.replaceChildren();
   if(!relevant.length){matchRoot.appendChild(node('p','lv87-hint','Keine offenen PDF-Positionen für diese Suche.'));return;}
   for(const item of relevant.slice(0,18)){
    const row=item.row,wrap=node('div','lv87-card');wrap.style.cssText='margin:7px 0;padding:9px;border:1px solid #d1d9e0';
    const heading=node('div','',`Seite ${row.page}, Position ${row.position} · ${row.article_no||'(unleserlich)'} — ${row.description||'Ohne Beschreibung'}`);
    heading.style.fontWeight='600';wrap.appendChild(heading);
    const label=node('p','lv87-hint',`Status: ${item.kind}. Mögliche Treffer sind nur Vorschläge, keine automatische Änderung.`);wrap.appendChild(label);
    const options=node('select','lv87-field');options.setAttribute('aria-label','Vorhandenen Artikel zur PDF-Position auswählen');options.style.cssText='width:100%;margin:4px 0;min-height:40px';
    const addOption=(a,label)=>{const opt=node('option','',label);opt.value=String(a?.article_no||'');options.appendChild(opt)};
    addOption(null,'Bitte vorhandenen Artikel wählen ...');
    const byNo=new Set();for(const found of item.options){const a=found.article;if(byNo.has(a.article_no))continue;byNo.add(a.article_no);addOption(a,`${a.article_no} – ${a.description||''} (${a.counted_stock} ${a.unit||''}; ${found.reason})`);}
    if(item.options[0]?.score>=105)options.value=String(item.options[0].article.article_no);
    wrap.appendChild(options);
    const search=node('input','lv87-field');search.type='search';search.placeholder='Anderen Artikel suchen (Nummer oder Bezeichnung)';search.style.cssText='width:100%;margin:4px 0;min-height:40px';
    search.addEventListener('input',()=>{
     const needle=matchCore.norm(search.value);const found=needle?matchItems.filter(a=>matchCore.norm((a.article_no||'')+' '+(a.description||'')).includes(needle)).slice(0,15):[];
     options.replaceChildren();addOption(null,found.length?'Passenden Lagerartikel auswählen ...':'Kein Treffer (Suche ändern)');
     for(const a of found)addOption(a,`${a.article_no} – ${a.description} (${a.counted_stock===null?'noch nicht gezählt':a.counted_stock} ${a.unit||''})`);
    });wrap.appendChild(search);
    const button=node('button','secondary lv883-action','✓ Diesen vorhandenen Artikel zuordnen');button.type='button';
    const info=node('span','lv87-hint','');info.style.display='block';
    button.onclick=async()=>{
     const chosen=matchItems.find(a=>matchCore.no(a.article_no)===matchCore.no(options.value));
     if(!chosen){txt(info,'Bitte einen Lagerartikel aus der Liste auswählen.');return;}
     if(!ctx.saveMappings){txt(info,'Speichern der PDF-Zuordnung ist nicht verfügbar. Bitte App neu laden.');return;}
     const message=`RONDO-PDF Seite ${row.page}, Position ${row.position}:\n${row.article_no} – ${row.description}\n\nMit vorhandenen Artikel ${chosen.article_no} – ${chosen.description} verknüpfen?\nGezählt: ${chosen.counted_stock??'noch nicht gezählt'} ${chosen.unit||''}.\n\nNur die PDF-Zuordnung wird geändert, keine Lagerbestände.`;
     if(!ctx.confirm(message))return;
     button.disabled=true;
     try{
      const revised=lines.map(x=>({...x}));
      const link=matchCore.assign(revised,item.key,chosen,ctx.core.validNo);
      await ctx.saveMappings(revised);
      lines=revised;
      matchRender();
      txt(status,`PDF-Zuordnung für ${chosen.article_no} gespeichert. Die Zählmenge wird beim nächsten PDF-Export an der richtigen Position erscheinen.`);
      // Ein moeglicher falsch angelegter Lagerartikel ist SEPARAT von der
      // PDF-Zuordnung zu korrigieren; niemals beim Klick stillschweigend loeschen.
      if(matchCore.no(link.original.article_no)!==matchCore.no(chosen.article_no)){
       const repaired=await repairMasterRecord(link.original.article_no,chosen.article_no,chosen.description,true);
       if(repaired)await matchLoad();
      }
     }catch(e){txt(info,'Zuordnung nicht gespeichert: '+e.message);button.disabled=false;}
    };
    wrap.appendChild(button);wrap.appendChild(info);matchRoot.appendChild(wrap);
   }
  }
  /* LV8813_OCR_MASTER_REPAIR_UI: nachtraegliche Korrektur falsch angelegter Artikel. */
  async function repairMasterRecord(sourceNo,targetNo,targetDescription='',offerOnly=false){
   try{
    const payload={source_no:sourceNo,target_no:targetNo,target_description:targetDescription};
    const preview=await ctx.api('/api/articles/ocr-repair/preview',{method:'POST',body:JSON.stringify(payload)});
    if(!preview.source)return false; // PDF korrigiert, keine falschen Lagerstammdaten vorhanden.
    if(preview.mode==='none')return false;
    if(!preview.safe){txt(status,'PDF-Zuordnung gespeichert. Achtung: Artikelstamm-Korrektur nicht automatisch moeglich: '+preview.message+' Bitte manuell pruefen.');return false;}
    const alert=`OCR-Artikelstamm korrigieren?\n\nBisher: ${preview.source.article_no} – ${preview.source.description}\nRichtig: ${targetNo} – ${targetDescription||preview.target?.description||preview.source.description}\n\n${preview.message}\n\nEs wird VORHER ein Sicherheitsbackup erstellt. Es werden KEINE Bestandsmengen gebucht.`;
    if(!ctx.confirm(alert))return false;
    const committed=await ctx.api('/api/articles/ocr-repair/commit',{method:'POST',body:JSON.stringify({...payload,confirm:true,expected_mode:preview.mode,expected_source_id:preview.source.id,expected_target_id:preview.target?.id||0})});
    txt(status,committed.message+' Die PDF-Zuordnung bleibt gespeichert.');
    return true;
   }catch(e){txt(status,'Die PDF-Zuordnung bleibt erhalten. Artikelstamm noch nicht korrigiert: '+(e?.message||e));return false;}
  }
  const repairBox=node('div','lv87-card');repairBox.style.cssText='margin:8px 0;border:1px solid #ddd;padding:10px';
  repairBox.appendChild(node('strong','', 'Falsch angelegten OCR-Artikel nachträglich berichtigen'));
  repairBox.appendChild(node('p','lv87-hint','Wenn durch den PDF-Import eine falsche Artikelnummer entstanden ist, hier die ursprüngliche OCR-Nummer und die richtige Nummer angeben. Vor jeder Änderung wird der Bestand geprüft und ein Sicherheitsbackup erstellt.'));
  const oldInput=node('input','lv87-field');oldInput.id='lv8813WrongNo';oldInput.placeholder='Falsche OCR-Artikelnummer';oldInput.autocomplete='off';oldInput.style.width='100%';
  const newInput=node('input','lv87-field');newInput.id='lv8813CorrectNo';newInput.placeholder='Richtige Artikelnummer';newInput.autocomplete='off';newInput.style.width='100%';
  const descInput=node('input','lv87-field');descInput.id='lv8813CorrectDesc';descInput.placeholder='Richtige Artikelbezeichnung (optional)';descInput.autocomplete='off';descInput.style.width='100%';
  const repairButton=node('button','secondary','Artikelkorrektur prüfen');repairButton.type='button';
  repairButton.onclick=async()=>{
   if(!oldInput.value.trim()||!newInput.value.trim())return txt(status,'Bitte falsche und richtige Artikelnummer eingeben.');
   repairButton.disabled=true;
   try{await repairMasterRecord(oldInput.value.trim(),newInput.value.trim(),descInput.value.trim(),false);await matchLoad();}
   finally{repairButton.disabled=false;}
  };
  repairBox.append(oldInput,newInput,descInput,repairButton);
  matchRoot.parentElement.appendChild(repairBox);
  matchSearch.addEventListener('input',matchRender);
  matchLoad();
  const reportButton=$('lv8814ReportDownload'),reportStatus=$('lv8814ReportStatus');
  reportButton.onclick=async()=>{
   if(busy)return;reportButton.disabled=true;
   try{
    const core=typeof window!=='undefined'?window.LV8814Report:null;
    if(!core)throw Error('Zusatzlisten-Modul ist nicht geladen. Bitte die neue Version komplett starten.');
    const id=select.value,ses=sessions.find(s=>String(s.id)===String(id));
    if(!ses)throw Error('Bitte eine Inventur auswaehlen.');
    if(ses.status==='draft'&&current?.session?.id===id&&typeof ctx.inventory?.save==='function'){
     if(!await ctx.inventory.save())throw Error('Inventur-Zwischenstand konnte nicht gespeichert werden. Zusatzliste nicht erstellt, damit keine ungesicherten Zahlen erscheinen.');
    }
    const [snapshot,articles]=await Promise.all([
     ctx.api('/api/inventory-v75/get?id='+encodeURIComponent(id)),ctx.api('/api/articles')
    ]);
    if(snapshot?.database_id!==index.database_id||snapshot?.session?.id!==id)throw Error('Inventur und Lagerdatenbank stimmen nicht ueberein.');
    const report=core.build(lines,articles,snapshot,matchCore),body=core.csv(report);
    const file=new Blob([body],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(file);
    const a=document.createElement('a');a.href=url;a.download=core.filename(snapshot.session.name);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    reportStatus.textContent=report.missing.length+' nicht im RONDO-PDF aufgefuehrte Artikel; '+report.uncertain.length+' weitere Artikel mit moeglicher OCR-Verwechslung (separat markiert). Keine Bestandsbuchung.';
   }catch(e){reportStatus.textContent='Zusatzliste konnte nicht erstellt werden: '+(e?.message||e);}
   finally{reportButton.disabled=false}
  };
  cancel.onclick=()=>{stopped=true;status.textContent='Abbruch angefordert. Bereits gespeicherte Zählungen bleiben unverändert.'};
  select.onchange=()=>{$('lv884PdfInfo').textContent='Die ausgewählte Inventur wird nur für die PDF-Ausgabe gelesen. Eine offene Inventur wird nicht abgeschlossen.';matchLoad()};
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
    const renderer=await verifiedRenderer();
    const blob=await renderer.render(stored.bytes,lines,result.quantities,msg=>{status.textContent=msg+' · Es werden keine Lagerbestände geändert.'},()=>stopped,metadata);
    await checkOriginalPrefix(blob,stored.bytes);
    if(stopped)throw Error('PDF-Ausgabe abgebrochen. Keine Bestände verändert.');
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename(beforePrint,snapshot.session.name);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    status.textContent=`PDF erzeugt: ${result.printed}/${result.total} Positionen ausgefüllt${result.blank?' · '+result.blank+' bleiben leer':''}. ${beforePrint==='completed'?'Inventur war bereits abgeschlossen.':'Lagerbestände bleiben bis zum Inventurabschluss unverändert.'}`;
   }catch(e){status.textContent='Fehler beim PDF-Erzeugen: '+(e?.message||e);status.style.color='#a20d0d'}
   finally{busy=false;submit.disabled=false;select.disabled=false;cancel.hidden=true}
  };
  return {sessions:sessions.length,selected:chosen};
 }
 return {clean,counted,formatTodayDE,printMeta,buildPrintData,filename,planStatus,run,verifiedRenderer,checkOriginalPrefix};
});
