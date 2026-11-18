#!/usr/bin/env python3
"""Build a direct-upload V88 hotfix from the public Oxijan86/lagerverwaltung/main.

Downloads only the files to be replaced. Does not change the GitHub repository.
Requires Python 3.9+ and internet on the computer running the build.
"""
import re, sys, json, os, urllib.request, zipfile, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / 'V88_ZUM_GITHUB_HOCHLADEN.zip'
FILES = ['v87_ui.js','v87_core.js','service-worker.js','manifest.webmanifest']
BRANCH = 'main'
RAW = 'https://raw.githubusercontent.com/Oxijan86/lagerverwaltung/' + BRANCH + '/'

def download(name):
    req=urllib.request.Request(RAW+name,headers={'User-Agent':'Lagerverwaltung-V88-Builder/1.0','Accept':'text/plain'})
    with urllib.request.urlopen(req,timeout=40) as res:
        return res.read().decode('utf-8-sig')

def replace_once(source,needle,replacement,name):
    count=source.count(needle)
    if count!=1: raise RuntimeError(f'{name}: erwartete Codepassage {count}x vorhanden (muss 1x sein). Abbruch ohne Ausgabe.')
    return source.replace(needle,replacement,1)

# V88 OCR fixes local to the RONDO INVENTORY import.
# Never modify service_pdf_* (service reports), material_booking_* (material movements), stock DB.
SCAN = r''' function pdfInk(canvas){
  // Small downscaled probe; do not allocate another large RGBA buffer on Android.
  const probe=document.createElement('canvas');probe.width=240;probe.height=240;
  const ctx=probe.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw Error('PDF-Vorschau konnte nicht geprüft werden (Canvas nicht verfügbar).');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,240,240);
  ctx.drawImage(canvas,canvas.width*.06,canvas.height*.19,canvas.width*.83,canvas.height*.66,0,0,240,240);
  const pixels=ctx.getImageData(0,0,240,240).data;let dark=0;
  for(let i=0;i<pixels.length;i+=4){if((pixels[i]+pixels[i+1]+pixels[i+2])/3<180)dark++;}
  probe.width=0;probe.height=0;return dark;
 }
 function v88Expected(n,total){return n===total&&total===72?9:10;}
 function v88PageComplete(p,total){
  if(!p||!Array.isArray(p.positions))return false;
  const count=v88Expected(p.page,total),nums=p.positions.map(r=>Number(r.position));
  return nums.length===count&&new Set(nums).size===count&&Array.from({length:count},(_,i)=>i+1).every(n=>nums.includes(n));
 }
 async function scan(file,onProgress=()=>{}){
  if(!file||!/\.pdf$/i.test(file.name)||file.size>28*1024*1024)throw Error('Bitte eine RONDO-PDF unter 28 MB auswählen.');
  const bytes=await file.arrayBuffer();
  if(!new TextDecoder().decode(bytes.slice(0,128)).includes('%PDF'))throw Error('Die ausgewählte Datei enthält keinen PDF-Kopf.');
  const hash=await digest(bytes),p=await import(new URL('vendor/pdfjs/pdf.min.mjs',document.baseURI).href);
  p.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.min.mjs',document.baseURI).href;
  const task=p.getDocument({data:new Uint8Array(bytes.slice(0)),isEvalSupported:false,stopAtErrors:false,
   cMapUrl:new URL('vendor/pdfjs/cmaps/',document.baseURI).href,cMapPacked:true,
   standardFontDataUrl:new URL('vendor/pdfjs/standard_fonts/',document.baseURI).href,
   wasmUrl:new URL('vendor/pdfjs/wasm/',document.baseURI).href,useSystemFonts:true});
  let pdf=null,worker=null;
  try{
   pdf=await task.promise;if(pdf.numPages<1||pdf.numPages>100)throw Error('PDF muss zwischen 1 und 100 Seiten enthalten.');
   await loadScripts('vendor/tesseract/tesseract.min.js');
   if(!window.Tesseract?.createWorker)throw Error('Die OCR-Bibliothek wurde nicht korrekt geladen.');
   worker=await window.Tesseract.createWorker('deu+eng',1,{
    workerPath:new URL('vendor/tesseract/worker.min.js',document.baseURI).href,
    corePath:new URL('vendor/tesseract/core/',document.baseURI).href,
    langPath:new URL('vendor/tesseract/lang/',document.baseURI).href
   });
   const previous=await getPdf().catch(()=>null),pages=previous?.hash===hash&&previous?.ocrVersion===88&&Array.isArray(previous.pages)?
    previous.pages.filter(x=>v88PageComplete(x,pdf.numPages)&&
     x.positions.every(r=>Core.validNo(r.article_no)&&r.description)):[];
   for(let n=1;n<=pdf.numPages;n++){
    if(scanCancelled)throw Error('Texterkennung abgebrochen. Gespeicherte Seiten bleiben erhalten.');
    if(pages.some(x=>x.page===n)){onProgress(`Seite ${n}/${pdf.numPages}: bereits vollständig erkannt`);continue;}
    const page=await pdf.getPage(n),expected=v88Expected(n,pdf.numPages),diagnostics=[];let best=null;
    try{
     for(let attempt=1;attempt<=2;attempt++){
      if(scanCancelled)throw Error('Texterkennung abgebrochen. Gespeicherte Seiten bleiben erhalten.');
      onProgress(`Seite ${n} von ${pdf.numPages}: OCR-Durchlauf ${attempt}/2 …`);
      const scale=attempt===1?2.5:3.15,vp=page.getViewport({scale}),cv=document.createElement('canvas');
      cv.width=Math.ceil(vp.width);cv.height=Math.ceil(vp.height);
      let crop=null;
      try{
       const ctx=cv.getContext('2d',{willReadFrequently:true});
       if(!ctx)throw Error('Dein Browser konnte keine PDF-Grafikfläche erstellen.');
       ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
       await page.render({canvasContext:ctx,viewport:vp,background:'rgb(255,255,255)'}).promise;
       const dark=pdfInk(cv);
       if(dark<8)throw Error('Die PDF-Seite wurde im Browser leer gerendert. PDF.js-Grafikdecoder/Cache prüfen.');
       let target=cv,region={x:0,y:0,w:1,h:1};
       if(attempt===2){
        region={x:.065,y:.18,w:.84,h:.67};crop=document.createElement('canvas');
        crop.width=Math.round(cv.width*region.w);crop.height=Math.round(cv.height*region.h);
        const c=crop.getContext('2d');if(!c)throw Error('Kein Canvas für den zweiten OCR-Durchlauf.');
        c.fillStyle='#fff';c.fillRect(0,0,crop.width,crop.height);
        c.filter='grayscale(1) contrast(1.75)';
        c.drawImage(cv,cv.width*region.x,cv.height*region.y,cv.width*region.w,cv.height*region.h,0,0,crop.width,crop.height);
        c.filter='none';target=crop;
       }
       if(worker.setParameters)await worker.setParameters({tessedit_pageseg_mode:attempt===1?'3':'11',preserve_interword_spaces:'1'});
       const result=await worker.recognize(target,{}, {text:true,blocks:true,tsv:true});
       const words=readOcrWords(result,target.width,target.height,region);
       const data=Core.parseOcrPage(result?.data?.text||'',n,words);
       diagnostics.push(`${attempt}: ${words.length} Wörter, ${String(result?.data?.text||'').length} Zeichen, ${data.positions.length}/${expected} Positionen`);
       if(!best||data.positions.length>best.positions.length)best=data;
       if(data.positions.length>=expected)break;
      }catch(e){
       diagnostics.push(`${attempt}: ${e.message}`);
       if(scanCancelled)throw e;
       if(attempt===2&&!best?.positions.length)throw Error(`Seite ${n}: ${diagnostics.join('; ')}. Keine Lagerdaten geändert.`);
      }finally{
       if(crop){crop.width=0;crop.height=0;}
       cv.width=0;cv.height=0;
      }
     }
    }finally{page.cleanup();}
    if(!best?.positions?.length)throw Error(`Seite ${n}: Die OCR hat keine Artikel erkannt. ${diagnostics.join('; ')}. Import gestoppt, keine Lagerdaten geändert.`);
    if(best.positions.length!==expected){best.warnings=[...(best.warnings||[]),
      `Seite ${n}: ${best.positions.length}/${expected} Positionen. Fehlende Positionen manuell ergänzen und mit dem PDF vergleichen.`];}
    const posSet=new Set(best.positions.map(r=>r.position));
    if(posSet.size!==best.positions.length)throw Error(`Seite ${n}: doppelte Positionsnummern erkannt. Import gestoppt.`);
    pages.push(best);pages.sort((a,b)=>a.page-b.page);
    // Persist every third page to reduce Android memory and IndexedDB churn.
    if(n%3===0||n===pdf.numPages)await storePdf({hash,filename:file.name,bytes,pages,ocrVersion:88,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});
   }
   // A prior partial import can leave the final page already in cache.
   await storePdf({hash,filename:file.name,bytes,pages,ocrVersion:88,edited:previous?.hash===hash?previous.edited:undefined,updated:new Date().toISOString()});
   return {hash,filename:file.name,bytes,pages,ocrVersion:88};
  }finally{if(worker)await worker.terminate().catch(()=>{});if(pdf)await task.destroy().catch(()=>{});}
 }
'''

def patch_ui(s):
    assert "/* Lagerverwaltung Lovrencic V87" in s, 'Falsche Datei: v87_ui.js'
    s=replace_once(s,"function readOcrWords(result,width,height){","function readOcrWords(result,width,height,region={x:0,y:0,w:1,h:1}){",'OCR-Wortkoordinaten')
    s=replace_once(s,"left:Number(b.x0)/width,top:Number(b.y0)/height,\n   width:(Number(b.x1)-Number(b.x0))/width,height:(Number(b.y1)-Number(b.y0))/height,",
       "left:region.x+Number(b.x0)/width*region.w,top:region.y+Number(b.y0)/height*region.h,\n   width:(Number(b.x1)-Number(b.x0))/width*region.w,height:(Number(b.y1)-Number(b.y0))/height*region.h,",'Word-BBOX')
    s=replace_once(s,"  // In some Tesseract builds blocks are omitted even when requested. TSV is a",
       "  if(!words.length)for(const word of result?.data?.words||[])append(word);\n  if(!words.length)for(const line of result?.data?.lines||[])for(const word of line.words||[])append(word);\n  // In some Tesseract builds blocks are omitted even when requested. TSV is a",'Word-Fallback')
    s=replace_once(s,"left:left/width,top:top/height,width:w/width,height:h/height,confidence:Number(c[ix.conf])",
       "left:region.x+left/width*region.w,top:region.y+top/height*region.h,width:w/width*region.w,height:h/height*region.h,confidence:Number(c[ix.conf])",'TSV-BBOX')
    pattern=r" async function scan\(file,onProgress=\(\)=>\{\}\)\{.*?\n \}\n async function readPdf\(file,mode='annual'\)\{"
    match=list(re.finditer(pattern,s,re.S))
    if len(match)!=1:raise RuntimeError(f'scan(): {len(match)} Fundstellen; Abbruch, Code ist anders als erwartet')
    s=s[:match[0].start()]+SCAN+" async function readPdf(file,mode='annual'){"+s[match[0].end():]
    old="state.rows=previous?.hash===result.hash&&previous?.edited?.length?previous.edited:reviewed.rows;state.scanWarnings=reviewed.warnings;state.verified=!!(previous?.edited?.length);"
    new="""const corrected=new Map(previous?.hash===result.hash?(previous?.edited||[]).map(r=>[r.key,r]):[]);
   state.rows=reviewed.rows.map(r=>({...r,...(corrected.get(r.key)||{}),key:r.key,page:r.page,position:r.position,counted_stock:null}));
   state.scanWarnings=reviewed.warnings;state.verified=false;"""
    s=replace_once(s,old,new,'Gespeicherte Korrekturen')
    s=replace_once(s,"const incompletePages=state.pages.filter(p=>p.positions.length!==(p.page===state.pages.length?9:10));",
       "const incompletePages=state.pages.filter(p=>!v88PageComplete(p,state.pages.length));",'Unvollständige Seiten')
    s=replace_once(s,"const incomplete=state.pages.filter(p=>p.positions.length!==(p.page===state.pages.length?9:10));",
       "const incomplete=state.pages.filter(p=>!v88PageComplete(p,state.pages.length));",'Übernahmesperre')
    s=replace_once(s,"   <div class=\"lv87-flex\"><button class=\"primary\" id=\"lv87CommitRows\" ${!state.rows.length?'disabled':''}>Geprüfte Firmenartikel übernehmen</button>",
       "   <label class=\"lv87-hint\"><input type=\"checkbox\" id=\"lv88Reviewed\"> Ich habe Artikelnummern, Bezeichnungen und Einheiten mit der Original-PDF abgeglichen; unklare Positionen sind korrigiert.</label>\n   <div class=\"lv87-flex\"><button class=\"primary\" id=\"lv87CommitRows\" ${!state.rows.length?'disabled':''}>Geprüfte Firmenartikel übernehmen</button>",
       'Prüfbestätigung')
    s=replace_once(s,"<th>Bezeichnung</th><th>Einheit</th><th>Status</th>",
       "<th>Bezeichnung</th><th>Lagerort</th><th>Einheit</th><th>Status</th>",'Prüftabelle Kopf')
    s=replace_once(s,'''<td><input data-v87-row="${i}" data-field="description" value="${safe(r.description)}" aria-label="Bezeichnung"></td><td><select data-v87-row="${i}" data-field="unit">''',
       '''<td><input data-v87-row="${i}" data-field="description" value="${safe(r.description)}" aria-label="Bezeichnung"></td><td><input data-v87-row="${i}" data-field="location" value="${safe(r.location)}" aria-label="Lagerort" inputmode="numeric"></td><td><select data-v87-row="${i}" data-field="unit">''','Lagerort zeigen')
    s=replace_once(s,"r.verified=Core.validNo(r.article_no)&&!!r.description;",
       "r.verified=Core.validNo(r.article_no)&&!!r.description&&/^\\d{3,6}$/.test(r.location||'')&&['Stk.','m','L'].includes(r.unit);",'Sicherheitsprüfung nach Korrektur')
    s=replace_once(s,"function rowStatus(r,cmp){if(!Core.validNo(r.article_no)||!r.description||r.verified===false)",
       "function rowStatus(r,cmp){if(!Core.validNo(r.article_no)||!r.description||!/^\\d{3,6}$/.test(r.location||'')||r.verified===false)",'Lagerort im Status')
    s=replace_once(s,"const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>!Core.validNo(x.article_no)||!x.description||x.verified===false);",
       "const data=await window.api('/api/articles'),cmp=Core.compare(state.rows,data),errors=state.rows.filter(x=>!Core.validNo(x.article_no)||!x.description||!/^\\d{3,6}$/.test(x.location||'')||x.verified===false);",'Fehlerstatus Lagerort')
    s=replace_once(s,"if(rows.some(x=>!Core.validNo(x.article_no)||!x.description||x.verified===false))",
       "if(rows.some(x=>!Core.validNo(x.article_no)||!x.description||!/^\\d{3,6}$/.test(x.location||'')||x.verified===false))",'Lagerort Übernahmesperre')
    s=replace_once(s,"$('lv87CommitRows').onclick=()=>commitRows().catch(e=>notification('lv87ScanStatus',e.message,true));",
       "$('lv87CommitRows').onclick=()=>{if(!$('lv88Reviewed')?.checked)return notification('lv87ScanStatus','Vor dem Übernehmen bitte alle Artikel anhand der Original-PDF überprüfen und die Prüfung bestätigen.',true);return commitRows().catch(e=>notification('lv87ScanStatus',e.message,true));};",
       'Prüfbestätigung auswerten')
    s=replace_once(s,"state.verified=!!v.edited;","state.verified=false;",'Wiederherstellung nicht automatisch verifiziert')
    s=replace_once(s,"await storePdf({hash:state.fileHash,filename:state.sourceName,bytes:loadedPdf,pages:state.pages,edited:state.rows,updated:new Date().toISOString()});","await storePdf({hash:state.fileHash,filename:state.sourceName,bytes:loadedPdf,pages:state.pages,ocrVersion:88,edited:state.rows,updated:new Date().toISOString()});",'OCR-Metadaten erhalten')
    s=replace_once(s,"if(e.textContent!=='87.1')e.textContent='87.1'","if(e.textContent!=='88.0')e.textContent='88.0'",'Versionsobserver')
    s=replace_once(s,"e.textContent='87.1'","e.textContent='88.0'",'Versions-UI')
    s=replace_once(s,"'V87.1'","'V88.0'",'Version im Titel')
    s=replace_once(s,"'Lagerverwaltung Lovrencic V87.1 PWA'","'Lagerverwaltung Lovrencic V88.0 PWA'",'Version im Manifest-Metatag')
    return s

def patch_core(s):
    assert 'function parseRondoSpatial(' in s
    # Never silently treat OCR inferred position, unit or location as verified.
    s=replace_once(s,"const y=markers.length?mid(markers[0]):approximate;",
       "const markerFound=markers.length>0;const y=markerFound?mid(markers[0]):approximate;",'Sicherer Positionsmarker')
    s=replace_once(s,"const suspicious=/[!|()]/.test(code.w.text)||code.w.confidence<55||/^I\\d/i.test(code.w.text)||/^O\\d/i.test(code.w.text);",
       "const suspicious=!markerFound||!loc||!unit||!Number.isFinite(code.w.confidence)||/[!|()]/.test(code.w.text)||code.w.confidence<65||/^I\\d/i.test(code.w.text)||/^O\\d/i.test(code.w.text);",'Unsichere Codes')
    s=replace_once(s,"warning:suspicious?'Artikelnummer bitte prüfen (Texterkennung unsicher)':!description?'Bezeichnung fehlt':'',",
       "warning:!markerFound?'Positionsnummer fehlt – Zeile prüfen':!loc?'Lagerort nicht erkannt – prüfen':!unit?'Einheit nicht erkannt – prüfen':suspicious?'Artikelnummer bitte prüfen (Texterkennung unsicher)':!description?'Bezeichnung fehlt':'',",'Warnung Position')
    s=replace_once(s,"if(pos<1||pos>20)continue;","if(pos<1||pos>10)continue;",'Positionsbereich')
    # Spatial candidates are not assumed correct if textual parser disagrees.
    return s

def patch_sw(s):
    s, count = re.subn(r"const C='lv87[^']+';", "const C='lv88-inventory-ocr-two-pass-2026-11-18';", s, count=1)
    if count!=1:raise RuntimeError('service-worker.js: Versionscache fehlt')
    return s

def patch_manifest(s):
    d=json.loads(s);d['name']='Lagerverwaltung Lovrencic V88.0';d['short_name']='Lager V88';return json.dumps(d,ensure_ascii=False,indent=2)+'\n'

TEST = r'''const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const code=fs.readFileSync(require.resolve('./v87_ui.js'),'utf8');
const core=require('./v87_core.js');
const sw=fs.readFileSync(require.resolve('./service-worker.js'),'utf8');
test('V88 scan runs two OCR passes and sets PDF wasm assets',()=>{
 assert.match(code,/for\(let attempt=1;attempt<=2;attempt\+\+\)/);
 assert.match(code,/wasmUrl:new URL\('vendor\/pdfjs\/wasm\//);
 assert.match(code,/tessedit_pageseg_mode:attempt===1\?'3':'11'/);
 assert.match(code,/pdfInk\(cv\)/);assert.match(code,/grayscale\(1\) contrast\(1\.75\)/);
});
test('V88 never interprets uncounted RONDO stock as 0',()=>{
 const x=core.parseOcrPage('Inventurbeleg 100021289\n1 11006138 1025\nSicherungsklemme SP = 10mm\nNoch nicht gezahlt\nST',1);
 assert.equal(x.positions[0].counted_stock,null);
});
test('V88 empty text cannot create fabricated material',()=>{
 assert.equal(core.parseOcrPage('',1,[]).positions.length,0);
});
test('V88 page positions are capped at 10',()=>{
 const x=core.parseOcrPage('11 123456 1025\nFalsche Pos.\nNoch nicht gezählt ST',1);
 assert.equal(x.positions.length,0);
});
test('V88 UI requires document verification before registering materials',()=>{
 assert.match(code,/id="lv88Reviewed"/);assert.match(code,/lv88Reviewed'\)\?\.checked/);
 assert.match(code,/Nicht alle Positionen erkannt/);
});
test('V88 release invalidates prior PWA cache',()=>{assert.match(sw,/lv88-inventory-ocr-two-pass/)});
'''

README='''# Lagerverwaltung Lovrencic V88.0 – RONDO-Inventur-OCR\n\nDiese Version korrigiert ausschließlich den PDF-Import der RONDO-Inventurliste. **Keine Änderung an Lagerbeständen, Datenbankstruktur, Materialentnahmen oder Serviceberichten.**\n\n## Fehler und Verbesserungen\n\n- Gescanntes Canon-RONDO-PDF enthält keine Textschicht. Die Erkennung liest daher das Bild.\n- PDF.js lädt die lokalen WASM-/Font-/CMAP-Ressourcen explizit; leere Renderings werden erkannt.\n- OCR-Durchlauf 1 mit 2,5x; bei fehlenden Positionen zweiter Durchlauf in 3,15x mit Kontraststeigerung und Tabellenbereich, alternativem Segmentierungsmodus.\n- OCR-Wörter aus Blöcken, direkten Wörtern, Zeilen oder TSV; ROI-Koordinaten zurück in die Seitenkoordinaten.\n- OCR-Ausfälle zeigen einen konkreten Fehler; es werden **niemals automatisch Artikelnummern geraten**.\n- Unsichere Positionsnummern, Einheiten, Lagerorte und Artikelnummern müssen kontrolliert werden.\n- Original-PDF und bereits geprüfte Korrekturen bleiben erhalten, der gleiche Import kann fortgesetzt werden.\n- Bei vollständig erkannten Seiten werden Wiederholungen vermieden. Alle drei Seiten wird ein Zwischenstand gespeichert; Canvas-Speicher wird freigegeben.\n- Explizite Bestätigung, dass Artikel anhand des Original-PDF geprüft wurden, bevor neue Artikel registriert werden.\n- Leere Zählmengen bleiben `null` (nicht gezählt). Dieser Import bucht **keine** Lagerbewegungen.\n\n## Bereitstellung\n\nMit `build_v88.py` und Internetverbindung die vier neuesten Originaldateien aus `Oxijan86/lagerverwaltung/main` beziehen, gezielt korrigieren, lokale Tests ausführen und die Ersatzdateien in `V88_ZUM_GITHUB_HOCHLADEN.zip` packen. **Das Archiv enthält nur die vier Dateien zum Ersetzen, nicht das gesamte Repository**. Im Repository GitHub -> Add file -> Upload files. **Vorher unbedingt `lager.db` sichern.**\n\n## Tests und Grenzen\n\nDer Builder prüft bei der Erstellung, dass die erwarteten Codepassagen genau einmal vorkommen, und führt mit Node.js (falls vorhanden) Syntax- und Komponententests durch. Die original hochgeladene PDF hat 72 Bildseiten; mit lokalem Tesseract konnte Seite 1 außerhalb des Browsers gelesen werden. Ein vollständiger Live-Test auf dem betroffenen Android-Gerät ist ohne Zugriff auf das Telefon nicht möglich. Daher keine Garantie, dass jede einzelne gescannte Zeile erkannt wird. Zur Sicherheit verhindert die App die ungeprüfte Bestandsübernahme.\n'''

BATCH='''@echo off\nchcp 65001 >nul\ncd /d "%~dp0"\nwhere py >nul 2>&1\nif %errorlevel%==0 (py -3 build_v88.py) else (python build_v88.py)\necho.\necho Falls erfolgreich: V88_ZUM_GITHUB_HOCHLADEN.zip bei GitHub hochladen.\npause\n'''

def make():
    print('Hole aktuelle V87.1-Quelldateien von GitHub (nur Lesen) ...')
    src={f:download(f) for f in FILES}
    print('Prüfe vorhandene Version und patchbare Code-Stellen ...')
    src['v87_ui.js']=patch_ui(src['v87_ui.js'])
    src['v87_core.js']=patch_core(src['v87_core.js'])
    src['service-worker.js']=patch_sw(src['service-worker.js'])
    src['manifest.webmanifest']=patch_manifest(src['manifest.webmanifest'])
    with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for f,contents in src.items():z.writestr(f,contents)
        z.writestr('test_v88_ocr.cjs',TEST)
        z.writestr('README_V88.md',README)
    testdir=ROOT/'_test_v88'
    testdir.mkdir(exist_ok=True)
    for f,contents in src.items():(testdir/f).write_text(contents,encoding='utf-8')
    (testdir/'test_v88_ocr.cjs').write_text(TEST,encoding='utf-8')
    try:
        print('Starte automatisierte Node.js-Syntax- und Regressionstests ...')
        for f in ['v87_ui.js','v87_core.js','service-worker.js']:
            subprocess.run(['node','--check',f],cwd=testdir,check=True)
        subprocess.run(['node','--test','test_v88_ocr.cjs'],cwd=testdir,check=True)
    except FileNotFoundError:
        print('HINWEIS: Node.js nicht installiert. Syntax- und Testlauf übersprungen.')
    print('ERFOLG:',OUT)

if __name__=='__main__':
 try:make()
 except Exception as e:
    print('ABBRUCH – kein Update hochladen:',e,file=sys.stderr)
    sys.exit(1)
