#!/usr/bin/env python3
"""Apply Lagerverwaltung V88.20 to a locally downloaded V88.19 GitHub repository.

Only local source files are modified. Creates backups and fails closed on unexpected
source structure. User uploads the resulting changed files to GitHub themselves.
"""
from pathlib import Path
import re, shutil, sys

ROOT = Path(__file__).resolve().parent
TARGET = Path(sys.argv[1]).expanduser().resolve() if len(sys.argv)>1 else ROOT

BACKEND_INSERT = r''' 
 /* LV88_20_SAFE_BATCH_ARCHIVE: SELECT / PREVIEW / COMMIT - never force-delete history */
 if(p==='/api/articles/v88-20/archive-preview'||p==='/api/articles/v88-20/archive-commit'){
  if(!await adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet. Bitte zuerst als Administrator anmelden.');
  const ids=[...new Set((Array.isArray(d.ids)?d.ids:[]).map(Number))];
  if(!ids.length||ids.length>200||ids.some(x=>!Number.isInteger(x)||x<1))throw Error('Bitte 1 bis 200 gültige Artikel auswählen.');
  const exists=(t)=>Number(scalar('SELECT COUNT(*) FROM sqlite_master WHERE type=\'table\' AND name=?',[t])||0)>0;
  const refCount=(table,id)=>exists(table)?Number(scalar('SELECT COUNT(*) FROM '+table+' WHERE article_id=?',[id])||0):0;
  function check(id){
   const a=articles().find(x=>Number(x.id)===id);
   if(!a)return {id,article_no:'?',reasons:['Artikel nicht gefunden'],allowed:false};
   const reasons=[];
   if(Number(a.active)!==1)reasons.push('Bereits archiviert oder inaktiv');
   if(Math.abs(Number(a.stock||0))>0.0000001)reasons.push('Buchbestand ist nicht null');
   if(Math.abs(Number(a.initial_stock||0))>0.0000001)reasons.push('Anfangsbestand ist nicht null');
   const references=[
    ['movements','Buchungshistorie vorhanden'],
    ['inventory_counts','In einer Inventur verwendet'],
    ['service_pdf_imports','Mit Servicebericht verknüpft'],
    ['service_pdf_machine_usage','In Servicebericht-Auswertung verwendet'],
    ['stock_bins_v86','Lagerplatz-Eintrag vorhanden'],
    ['stock_bin_moves_v86','Umlagerungsprotokoll vorhanden'],
    ['import_position_results','Importprotokoll vorhanden']
   ];
   for(const [table,label] of references){if(refCount(table,id)>0)reasons.push(label)}
   return {id,article_no:String(a.article_no),description:String(a.description||''),allowed:reasons.length===0,reasons};
  }
  let candidates=ids.map(check),allowed=candidates.filter(x=>x.allowed),blocked=candidates.filter(x=>!x.allowed);
  if(p.endsWith('/archive-preview'))return response({ok:true,allowed,blocked,requested:ids.length});
  if(d.confirmation!=='ARCHIVIEREN')throw Error('Bitte die Archivierung ausdrücklich bestätigen.');
  if(!allowed.length)return response({ok:false,archived:0,blocked,reason:'Keine sicher archivierbaren Artikel'},409);
  await createBackup('Sicherheitsbackup','V88.20 – sichere Sammelarchivierung von '+allowed.length+' Artikeln');
  // Recheck in the same synchronous transaction before changing anything.
  const completed=[];
  runTransaction(()=>{
   for(const proposal of allowed){
    const current=check(proposal.id);
    if(!current.allowed)throw Error('Artikel '+proposal.article_no+' wurde zwischenzeitlich verändert. Es wurde nichts archiviert.');
    run('UPDATE articles SET active=0 WHERE id=? AND active=1',[proposal.id]);
    audit('Administrator','ARCHIVIERUNG','Artikel',String(proposal.id),'V88.20 sicher archiviert: '+proposal.article_no+' – '+proposal.description);
    completed.push(proposal.id);
   }
  });
  await persist();
  return response({ok:true,archived:completed.length,ids:completed,blocked,backup:true});
 }
'''

def add_backend(text):
    if 'LV88_20_SAFE_BATCH_ARCHIVE' in text:
        return text, False
    anchor=" if(p==='/api/article/delete'){"
    if text.count(anchor)!=1:
        raise ValueError('Backend-Anker /api/article/delete nicht eindeutig gefunden; keine Änderung vorgenommen.')
    return text.replace(anchor,BACKEND_INSERT+'\n'+anchor),True

def add_sw(text):
    if 'LV88_20_PATCHED' in text:
        return text,False
    changes=0
    def one(before,after):
        nonlocal text,changes
        if text.count(before)!=1:
            raise ValueError('Service-Worker-Anker nicht eindeutig: '+before[:75])
        text=text.replace(before,after,1);changes+=1
    text,count=re.subn(r"const CACHE_NAME='lv88-[^']+';","const CACHE_NAME='lv88-20-2026-11-20-assistant-safe-archive-v1';",text,count=1)
    if count!=1:raise ValueError('Versionsmarker im Service-Worker nicht gefunden.')
    changes+=1
    one("'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js',", "'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js','v88_20_core.js','v88_20_report.js','v88_20_assistant.js',")
    one(" ['v88_ocr.js','LV88OCR'],", " ['v88_ocr.js','LV88OCR'],\n ['v88_20_core.js','LV8820Core'],\n ['v88_20_report.js','LV8820Report'],\n ['v88_20_assistant.js','LV8820'],")
    # The injectHtml marker must match new version, otherwise cached V88.19
    # HTML may be returned without new addons on some PWA installations.
    one("if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;", "if(out.includes('Lagerverwaltung V88.20:')&&out.includes('data-lv88-boot='))return out;")
    one("<!-- Lagerverwaltung V88.19:","<!-- Lagerverwaltung V88.20:")
    # Force a new URL for both newly bundled scripts. No replacement of earlier app logic.
    text=text.replace('v=88.19','v=88.20')
    text='/* LV88_20_PATCHED – safe additive upgrade; previous data preserved. */\n'+text
    return text,True

def upgrade(root):
    needed=['local_backend.js','service-worker.js','v88_4_export.js']
    missing=[n for n in needed if not (root/n).is_file()]
    if missing:raise FileNotFoundError('Das Ziel muss der entpackte GitHub-Projektordner sein. Fehlt: '+', '.join(missing))
    original={name:(root/name).read_text(encoding='utf-8') for name in needed}
    changes={}
    changes['local_backend.js'],_ = add_backend(original['local_backend.js'])
    changes['service-worker.js'],_ = add_sw(original['service-worker.js'])
    unit_before="normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.')"
    unit_after="normalizeCount(inv.counted_stock,row.unit||inv.unit||'Stk.')"
    if unit_before not in original['v88_4_export.js']:
        if unit_after not in original['v88_4_export.js']:
            raise ValueError('Unbekannte PDF-Exportversion. Einheiten-Patch wird aus Sicherheitsgründen abgebrochen.')
        changes['v88_4_export.js']=original['v88_4_export.js']
    else: changes['v88_4_export.js']=original['v88_4_export.js'].replace(unit_before,unit_after)
    # Parse both anchors first. No partial source modifications on mismatch.
    backups=[]
    for name in needed:
        if changes[name]!=original[name]:
            backup=root/(name+'.v88_19_backup')
            if not backup.exists():shutil.copy2(root/name,backup)
            backups.append(name)
    for name in needed:
        if changes[name]!=original[name]: (root/name).write_text(changes[name],encoding='utf-8')
    copied=[]
    for name in ['v88_20_core.js','v88_20_report.js','v88_20_assistant.js']:
        source=ROOT/name
        if not source.is_file():raise FileNotFoundError('Upgradedatei fehlt: '+str(source))
        shutil.copy2(source,root/name) if source.resolve()!=(root/name).resolve() else None
        copied.append(name)
    print('V88.20 erfolgreich auf lokalen Projektordner angewendet:',root)
    print('Geänderte/neu angelegte GitHub-Dateien:')
    for name in backups+copied:print(' - '+name)
    print('Backups der ersetzten Quelldateien: *.v88_19_backup')
    print('WICHTIG: Die aktuellen Lagerdaten / die lager.db wurden NICHT verändert.')
    print('Prüfe und lade die sechs Dateien in das Hauptverzeichnis deines GitHub-Repositories hoch.')

if __name__=='__main__':
    try:upgrade(TARGET)
    except Exception as exc:
        print('ABGEBROCHEN – kein Upload durchgeführt:',exc,file=sys.stderr)
        sys.exit(1)
