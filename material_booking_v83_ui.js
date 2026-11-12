(function(){'use strict';
 const $=id=>document.getElementById(id),Core=window.LVMaterialBookingCore83;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let parsed=null,articles=new Map(),fileHash='',working=false,files=[];
 function msg(t,ok=true){const el=$('mb83Msg');if(el){el.textContent=t;el.className='message '+(ok?'ok':'error');el.style.display='block'}}
 async function hashBytes(bytes){const data=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(data)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 function article(no){return articles.get(String(no||'').trim().toUpperCase())||null}
 function rowEl(id){return $(`mb83-row-${id}`)}
 function updateRow(i){const row=rowEl(i);if(!row)return;const no=row.querySelector('[data-no]').value.trim().toUpperCase(),q=Core.amount(row.querySelector('[data-qty]').value),a=article(no);const status=row.querySelector('[data-status]');
  let problem='';if(!a)problem='Artikel unbekannt – Artikelnummer kontrollieren oder vorher anlegen.';
  else if(!Number.isFinite(q)||q<=0)problem='Menge fehlt oder ist ungültig.';
  else if(parsed?.items?.[i]?.unit&&({ST:'STK',STK:'STK',M:'M',KG:'KG',G:'G',L:'L',ML:'ML'}[parsed.items[i].unit]||parsed.items[i].unit)!==({STK:'STK',ST:'STK',M:'M',KG:'KG',G:'G',L:'L',ML:'ML'}[String(a.unit||'').toUpperCase().replace(/[^A-Z]/g,'')]||String(a.unit||'').toUpperCase().replace(/[^A-Z]/g,'')))problem=`Einheit unterscheidet sich: Beleg ${parsed.items[i].unit}, Lager ${a.unit}. Vor Buchung prüfen.`;
  else if($('mb83Direction').value==='OUT'&&q>Number(a.stock))problem=`Nicht genügend Bestand: ${a.stock} ${a.unit}.`;
  status.innerHTML=a?`${esc(a.description)} · Bestand ${esc(a.stock)} ${esc(a.unit)}${problem?'<br><strong>'+esc(problem)+'</strong>':''}`:esc(problem);
  row.dataset.valid=problem?'0':'1';if(problem)row.classList.add('mb83-warning');else row.classList.remove('mb83-warning');
  const checkbox=row.querySelector('[data-select]');if(problem)checkbox.checked=false;
  return {a,qty:q,article_no:no,valid:!problem};}
 function check(){if(!parsed)return;let selected=0,invalid=0;for(let i=0;i<parsed.items.length;i++){const s=updateRow(i),r=rowEl(i);if(r?.querySelector('[data-select]').checked){selected++;if(!s.valid)invalid++}}
  const customer=$('mb83Customer').value.trim(),date=$('mb83Date').value,reviewed=$('mb83Reviewed').checked;
  const voucher=$('mb83Voucher').value.trim();$('mb83Commit').disabled=working||selected===0||invalid>0||!date||!customer||!reviewed||parsed.kind!=='voucher'||!voucher;
  $('mb83Summary').textContent=`${parsed.items.length} Positionen erkannt · ${selected} ausgewählt${invalid?' · '+invalid+' ungültig':''}. ${parsed.metadata.direction==='IN'?'SAP-Ziel 1010/1025 deutet auf Einbuchung hin.':''}`;
 }
 function render(){if(!parsed)return;$('mb83Preview').hidden=false;const kind=parsed.kind;
  $('mb83DocumentKind').textContent=kind==='request'?'⛔ Materialanforderung erkannt. Keine Lagerbuchung möglich.':kind==='voucher'?'✓ Materialbuchungsbeleg erkannt. Buchungsrichtung und jede Position prüfen.':'⚠ Belegtyp nicht sicher erkannt. Automatische Buchung gesperrt.';
  $('mb83DocumentKind').className='message '+(kind==='voucher'?'ok':'error');$('mb83DocumentKind').style.display='block';
  $('mb83Voucher').value=parsed.metadata.voucher||('DATEI-'+fileHash.slice(0,24));$('mb83Date').value=parsed.metadata.date||new Date().toLocaleDateString('en-CA');$('mb83Direction').value=parsed.metadata.direction;
  $('mb83DirectionWarning').textContent=parsed.metadata.direction==='IN'?'SAP-Umlagerung zum Lager 1010/1025 erkannt: vermutlich Wareneingang. Für eine Entnahme musst du die Richtung ausdrücklich ändern.':'Prüfe, ob die ausgewählten Materialien tatsächlich aus deinem Lager entnommen wurden.';
  $('mb83Reviewed').checked=false;
  $('mb83Rows').innerHTML=parsed.items.map((it,i)=>`<tr id="mb83-row-${i}" data-index="${i}"><td><input type="checkbox" data-select aria-label="Position ${esc(it.position)} auswählen"></td><td><span class="small">Pos. ${esc(it.position)}</span><input data-no value="${esc(it.article_no)}" aria-label="Artikelnummer Position ${esc(it.position)}"></td><td><input data-qty inputmode="decimal" value="${it.quantity===null?'':esc(it.quantity)}" aria-label="Menge Position ${esc(it.position)}"> <span class="small">${esc(it.unit)}</span></td><td><div>${esc(it.description)}</div><span class="small" data-status></span></td></tr>`).join('');
  $('mb83Rows').querySelectorAll('input').forEach(el=>el.addEventListener('input',check));
  check();if(parsed.warnings.length)msg(parsed.warnings.slice(0,5).join(' · '),false);else msg(`${parsed.items.length} Positionen erkannt. Bitte anhand des Originalbelegs kontrollieren.`);
 }
 async function loadImage(file){if(!window.Tesseract){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/tesseract/tesseract.min.js';script.onload=resolve;script.onerror=()=>reject(Error('OCR-Bibliothek fehlt.'));document.head.append(script)});}
  const worker=await window.Tesseract.createWorker('deu+eng',1,{workerPath:new URL('vendor/tesseract/worker.min.js',document.baseURI).href,corePath:new URL('vendor/tesseract/core/',document.baseURI).href,langPath:new URL('vendor/tesseract/lang/',document.baseURI).href});
  try{const out=await worker.recognize(file);return out.data.text||''}finally{await worker.terminate()}
 }
 async function read(){if(working)return;working=true;$('mb83Read').disabled=true;$('mb83Preview').hidden=true;try{
   files=[...$('mb83Files').files||[]];if(!files.length)throw Error('Bitte mindestens eine PDF- oder Bilddatei auswählen.');if(files.length>8)throw Error('Bitte höchstens acht Seiten gleichzeitig auswählen.');
   const docs=[],blobs=[];let page=0;for(const f of files){if(f.size>25*1024*1024)throw Error(`${f.name} ist größer als 25 MB.`);const bytes=await f.arrayBuffer();blobs.push(new Uint8Array(bytes));
    msg(`Seite ${++page} von ${files.length} wird gelesen …`);
    if(/\.pdf$/i.test(f.name)||f.type==='application/pdf'){const pdf=await window.LVServicePDFReader.extract(f,{ocr:true});docs.push(Core.linesFromPages(pdf.pages).join('\n'))}
    else if(/\.(?:jpe?g|png)$/i.test(f.name)||/^image\/(jpeg|png)$/.test(f.type)){docs.push(await loadImage(f))}
    else throw Error('Nur PDF, JPG oder PNG zulässig.');
   }
   const joined=new Uint8Array(blobs.reduce((s,b)=>s+b.length,0));let offset=0;for(const b of blobs){joined.set(b,offset);offset+=b.length}
   fileHash=await hashBytes(joined);parsed=Core.parse(docs.join('\n'));if(parsed.kind==='request')throw Error('Das Dokument ist eine Materialanforderung, kein Materialbuchungsbeleg. Bitte die richtige Datei wählen.');
   if(parsed.kind!=='voucher')throw Error('Der Materialbuchungsbeleg konnte nicht eindeutig erkannt werden. Bitte einen besser lesbaren Beleg wählen.');
   if(!parsed.items.length)throw Error('Keine eindeutigen Materialpositionen erkannt. Bitte Belegqualität und Seiten überprüfen.');
   const list=await window.api('/api/articles');articles=new Map(list.map(a=>[String(a.article_no).toUpperCase(),a]));
   const master=await window.api('/api/masterdata');$('mb83Technician').innerHTML=(master.technicians||[]).map(t=>`<option>${esc(t.name)}</option>`).join('');$('mb83Technician').value=master.default_technician||$('mb83Technician').value;
   render();
  }catch(e){parsed=null;$('mb83Preview').hidden=true;msg(e.message,false)}finally{working=false;$('mb83Read').disabled=false;}
 }
 function markKnown(){if(!parsed)return;for(let i=0;i<parsed.items.length;i++){const r=rowEl(i);r.querySelector('[data-select]').checked=r.dataset.valid==='1'}check()}
 async function commit(){if(working||!parsed)return;check();if($('mb83Commit').disabled)return;
  const items=parsed.items.map((it,i)=>{const el=rowEl(i);return el.querySelector('[data-select]').checked?{position_key:'pos:'+it.position,article_no:el.querySelector('[data-no]').value.trim().toUpperCase(),quantity:Core.amount(el.querySelector('[data-qty]').value),position:it.position}:null}).filter(Boolean);
  const dir=$('mb83Direction').value;const verb=dir==='IN'?'einbuchen':'entnehmen';if(!confirm(`${items.length} Position(en) aus Beleg ${$('mb83Voucher').value} wirklich ${verb}? Bitte Buchungsrichtung und Mengen prüfen.`))return;
  working=true;$('mb83Commit').disabled=true;try{
   const result=await window.api('/api/material-booking-v83/commit',{method:'POST',body:JSON.stringify({items,direction:dir,voucher:$('mb83Voucher').value.trim(),file_hash:fileHash,customer:$('mb83Customer').value.trim(),ticket:$('mb83Ticket').value.trim(),machine:$('mb83Machine').value.trim(),technician:$('mb83Technician').value,movement_date:$('mb83Date').value,reviewed:$('mb83Reviewed').checked,kind:parsed.kind})});
   msg(`${result.booked} Positionen ${dir==='IN'?'eingebucht':'entnommen'}, ${result.already_processed} bereits gebucht und übersprungen.`,true);
   const already=new Set(result.booked_positions||[]);for(let i=0;i<parsed.items.length;i++){const r=rowEl(i);if(already.has('pos:'+parsed.items[i].position))r.querySelector('[data-select]').checked=false}
   await window.LVSyncUI81?.refresh?.(true);if(typeof window.loadArticles==='function')await window.loadArticles();
  }catch(e){msg(e.message,false)}finally{working=false;check()}
 }

 async function readExcel(){
  const input=$('lv83LegacyExcel'),f=input?.files?.[0];if(!f){window.msg($('lv83ExcelMsg'),'Bitte eine XLSX-Datei auswählen.',false);return}
  if(!/\.xlsx$/i.test(f.name)||f.size>10*1024*1024){window.msg($('lv83ExcelMsg'),'Nur XLSX bis 10 MB zulässig.',false);return}
  try{
   if(typeof XLSX==='undefined')throw Error('Excel-Bibliothek nicht geladen. Bitte die Anwendung über ihre Webadresse neu öffnen.');
   const bytes=await f.arrayBuffer(),wb=XLSX.read(bytes,{type:'array',cellText:true,cellNF:true});let items=[];
   for(const sheetName of wb.SheetNames){
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:'',raw:false});
    let heading=-1,articleIdx=-1,amountIdx=-1,descIdx=-1;
    for(let i=0;i<Math.min(rows.length,35);i++){
     const cols=(rows[i]||[]).map(x=>String(x||'').trim().toLowerCase().replace(/[^a-zäöüß0-9]/g,''));
     const article=cols.findIndex(x=>['artikelnummer','material','artikel','materialnummer'].includes(x));
     const qty=cols.findIndex(x=>['menge','anzahl','buchungsmenge','stück','stueck'].includes(x));
     if(article>=0&&qty>=0){heading=i;articleIdx=article;amountIdx=qty;descIdx=cols.findIndex(x=>['bezeichnung','beschreibung','materialbezeichnung','kurztext'].includes(x));break}
    }
    if(heading<0)continue;
    items=rows.slice(heading+1).map((row,j)=>({position:String(j+1).padStart(4,'0'),article_no:String(row[articleIdx]||'').trim(),description:descIdx>=0?String(row[descIdx]||''):'',quantity:Core.amount(row[amountIdx]),unit:'Stk.',uncertain:false})).filter(x=>x.article_no||Number.isFinite(x.quantity));
    if(items.length)break;
   }
   if(!items.length)throw Error('Keine Spalten „Artikelnummer/Material“ und „Menge“ mit Positionen gefunden.');
   if(items.some(x=>!x.article_no||!Number.isFinite(x.quantity)||x.quantity<=0))throw Error('Ungültige oder leere Mengen/Artikelnummern in der Excel-Datei. Bitte vor dem Entnehmen korrigieren.');
   const numbers=new Set(items.map(x=>x.position));if(numbers.size!==items.length)throw Error('Doppelte Position in der Excel-Datei.');
   fileHash=await hashBytes(bytes);parsed={kind:'voucher',metadata:{voucher:'EXCEL-'+fileHash.slice(0,24),date:'',direction:'OUT',movement:'Klassische Excel-Entnahme',destination1025:false},items,warnings:[]};
   const list=await window.api('/api/articles');articles=new Map(list.map(a=>[String(a.article_no).toUpperCase(),a]));
   const master=await window.api('/api/masterdata');$('mb83Technician').innerHTML=(master.technicians||[]).map(t=>`<option>${esc(t.name)}</option>`).join('');$('mb83Technician').value=master.default_technician||'';
   await window.show('out');render();$('mb83Direction').value='OUT';$('mb83DirectionWarning').textContent='Excel-Entnahme: Bitte jede Position und Menge vor dem Ausbuchen bestätigen.';check();
   window.msg($('lv83ExcelMsg'),`${items.length} Excel-Positionen zur Entnahmevorschau übernommen.`,true);
  }catch(e){window.msg($('lv83ExcelMsg'),e.message,false)}
 }
 window.LVMaterialBookingV83={read,readExcel,markKnown,check,commit};
})();
