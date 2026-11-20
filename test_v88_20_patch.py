from pathlib import Path
import tempfile,subprocess,importlib.util
spec=importlib.util.spec_from_file_location('v88patch',Path(__file__).with_name('v88_20_patch.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
backend="async function handler(){const p='';const opt={};const d={}; if(p==='/api/article/delete'){return 1;} }\n"
sw="""const CACHE_NAME='lv88-19-2026-11-19-standalone-json-v1';
const FILES=['v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js',];
const ADDONS=[ ['v88_ocr.js','LV88OCR'], ];
function patchHtml(out){if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;
return '<!-- Lagerverwaltung V88.19:';}
"""
export="const x=normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.');\n"
with tempfile.TemporaryDirectory() as d:
    path=Path(d)
    for name,content in [('local_backend.js',backend),('service-worker.js',sw),('v88_4_export.js',export)]: (path/name).write_text(content)
    m.upgrade(path)
    for name in ['local_backend.js','service-worker.js','v88_4_export.js','v88_20_core.js','v88_20_report.js','v88_20_assistant.js']:
        assert (path/name).is_file(),name
        subprocess.run(['node','--check',str(path/name)],check=True,capture_output=True)
    before=(path/'local_backend.js').read_bytes()
    m.upgrade(path)
    assert (path/'local_backend.js').read_bytes()==before,'re-running the upgrade modified backend'
    assert (path/'local_backend.js.v88_19_backup').read_text()==backend
    assert (path/'service-worker.js.v88_19_backup').read_text()==sw
    assert (path/'v88_4_export.js.v88_19_backup').read_text()==export
    assert 'row.unit||inv.unit' in (path/'v88_4_export.js').read_text()
    assert 'v88_20_report.js' in (path/'service-worker.js').read_text()
    assert 'LV88_20_SAFE_BATCH_ARCHIVE' in (path/'local_backend.js').read_text()
print('PASS V88.20 patch: six source files; Node syntax; backups; idempotent; export units')
