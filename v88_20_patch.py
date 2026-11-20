#!/usr/bin/env python3
"""Lagerverwaltung Lovrencic V88.20: install actual source changes in GitHub project folder.

No database file is opened or modified here. Existing source is backed up. Refuses
unknown layouts instead of silently applying incomplete changes. Idempotent.
"""
from pathlib import Path
import re, shutil, sys

ROOT=Path(__file__).resolve().parent
TARGET=Path(sys.argv[1]).expanduser().resolve() if len(sys.argv)>1 else ROOT
VERSION='88.20'


def exactly_once(source, before, after, desc):
    count=source.count(before)
    if count!=1:
        raise ValueError(f'{desc}: erwartete Stelle fehlt oder ist mehrfach vorhanden ({count}). Update abgebrochen.')
    return source.replace(before,after,1)


def add_backend(source):
    marker='LV88_20_SAFE_BATCH_ARCHIVE'
    if marker not in source:
        insert=(ROOT/'v88_20_backend_insert.txt').read_text(encoding='utf-8')
        source=exactly_once(source," if(p==='/api/article/delete'){",insert+"\n if(p==='/api/article/delete'){",'Stammdaten-API')
    if 'LV88_20_REVIEW_API' not in source:
        insert=(ROOT/'v88_20_review_api.txt').read_text(encoding='utf-8')
        source=exactly_once(source," if(opt.method!=='POST'){",insert+"\n if(opt.method!=='POST'){",'PDF-Prüfung-API')
    if 'LV88_20_DUPLICATE_REVIEW_API' not in source:
        insert=(ROOT/'v88_20_duplicate_api.txt').read_text(encoding='utf-8')
        source=exactly_once(source," /* LV88_20_REVIEW_API:",insert+"\n /* LV88_20_REVIEW_API:",'Dublettenprüfung-API')
    source=source.replace("if(p==='/api/info')return response({version:'86.0',", "if(p==='/api/info')return response({version:'88.20',")
    for marker in ['LV88_20_SAFE_BATCH_ARCHIVE','LV88_20_REVIEW_API','LV88_20_DUPLICATE_REVIEW_API',"version:'88.20'"]:
        if marker not in source:raise ValueError('Die Backend-Ergänzung ist unvollständig: '+marker)
    return source


def add_sw(text):
    if 'LV88_20_PATCHED' not in text:
        text,count=re.subn(r"const CACHE_NAME='lv88-[^']+';", "const CACHE_NAME='lv88-20-2026-11-20-release-r2';",text,count=1)
        if count!=1:raise ValueError('Service-Worker-Cache-Version wurde nicht gefunden.')
        text=exactly_once(text,"'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js',",
          "'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js','v88_20_core.js','v88_20_report.js','v88_20_assistant.js',",'Service-Worker-Dateiliste')
        text=exactly_once(text," ['v88_ocr.js','LV88OCR'],",
          " ['v88_ocr.js','LV88OCR'],\n ['v88_20_core.js','LV8820Core'],\n ['v88_20_report.js','LV8820Report'],\n ['v88_20_assistant.js','LV8820'],",'Service-Worker-Ladereihenfolge')
        text=exactly_once(text,"if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;",
          "if(out.includes('Lagerverwaltung V88.20:')&&out.includes('data-lv88-boot='))return out;",'Service-Worker-HTML-Versionsprüfung')
        text=exactly_once(text,'<!-- Lagerverwaltung V88.19:', '<!-- Lagerverwaltung V88.20:', 'Service-Worker-HTML-Kennung')
        # For old offline V88.19 HTML, retrofit new modules before returning cached response.
        fallback=""" if(out.includes('data-lv88-boot=')){
  if(!out.includes('v88_20_assistant.js'))out=out.replace(/<\\/body\\s*>/i,
   '<script src="v88_20_core.js?v=88.20" defer></script>\\n<script src="v88_20_report.js?v=88.20" defer></script>\\n<script src="v88_20_assistant.js?v=88.20" defer></script>\\n</body>');"""
        text=exactly_once(text," if(out.includes('data-lv88-boot=')){",fallback,'Service-Worker-Offline-HTML-Nachrüstung')
        text=text.replace('v=88.19','v=88.20')
        text='/* LV88_20_PATCHED – release V88.20, safe migration from V88.19. */\n'+text
    else:
        text=re.sub(r"const CACHE_NAME='lv88-[^']+';","const CACHE_NAME='lv88-20-2026-11-20-release-r2';",text,count=1)
        if 'v88_20_assistant.js' not in text:raise ValueError('Service Worker sagt V88.20, lädt neue Module aber nicht.')
    for required in ["'v88_20_core.js','LV8820Core'","'v88_20_assistant.js','LV8820'", "V88.20:"]:
        if required not in text:raise ValueError('Service Worker unvollständig: '+required)
    return text


def add_export(source):
    wrong="normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.')"
    right="normalizeCount(inv.counted_stock,row.unit||inv.unit||'Stk.')"
    if wrong in source:source=source.replace(wrong,right)
    if right not in source:raise ValueError('Der PDF-Export hat eine unerwartete Mengenlogik.')
    old="'linked_article_id','checked_at'"
    new="'linked_article_id','checked_at','review_v8820','reviewed_at'"
    if new not in source and old in source:source=source.replace(old,new)
    if new not in source:raise ValueError('JSON-Prüfstand-Felder konnten nicht erweitert werden.')
    return source


def add_sync_merge(source):
    marker="'inventory_company_v86','app_settings'];"
    updated="'inventory_company_v86','app_settings','rondo_pdf_review_v8820','rondo_duplicate_review_v8820'];"
    if updated in source:return source
    return exactly_once(source,marker,updated,'Cloud-Konfliktarchiv')


def upgrade(path):
    files=['local_backend.js','service-worker.js','v88_4_export.js','sync_merge_v82.js']
    missing=[f for f in files if not (path/f).is_file()]
    if missing:raise FileNotFoundError('Bitte den entpackten GitHub-Projektordner auswählen. Fehlt: '+', '.join(missing))
    original={f:(path/f).read_text(encoding='utf-8') for f in files}
    updated={
        'local_backend.js':add_backend(original['local_backend.js']),
        'service-worker.js':add_sw(original['service-worker.js']),
        'v88_4_export.js':add_export(original['v88_4_export.js']),
        'sync_merge_v82.js':add_sync_merge(original['sync_merge_v82.js']),
    }
    modules=['v88_20_core.js','v88_20_report.js','v88_20_assistant.js']
    for f in modules:
        if not (ROOT/f).is_file():raise FileNotFoundError('Programm-Modul fehlt: '+f)
    # No writing until all modules and all anchor checks have passed.
    for f in files:
        if original[f]!=updated[f]:
            backup=path/(f+'.v88_19_backup')
            if not backup.exists():shutil.copy2(path/f,backup)
            (path/f).write_text(updated[f],encoding='utf-8')
    for f in modules:
        src=ROOT/f
        if src.resolve()!=(path/f).resolve():shutil.copy2(src,path/f)
    changed=[f for f in files if original[f]!=updated[f]]+modules
    print('V88.20 Quellcode erfolgreich vorbereitet:',path)
    print('Zum Hochladen bei GitHub:')
    for f in sorted(set(changed)):
        print(' +',f)
    print('Wichtig: Es wurden keine Datenbankdateien geöffnet oder verändert.')
    return changed

if __name__=='__main__':
    try:upgrade(TARGET)
    except Exception as exc:
        print('ABBRUCH – Update nicht vollständig vorbereitet:',str(exc),file=sys.stderr)
        sys.exit(1)
