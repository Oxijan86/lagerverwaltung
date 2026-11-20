from pathlib import Path
import tempfile,subprocess,importlib.util
spec=importlib.util.spec_from_file_location('updater',Path(__file__).with_name('v88_20_patch.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
backend="""async function handler(){const p='',d={},q={},opt={};
 if(opt.method!=='POST'){if(p==='/api/info')return response({version:'86.0',articles:0});}
 if(p==='/api/article/delete'){return 1;}}
"""
sw="""const CACHE_NAME='lv88-19-2026-11-19-standalone-json-v1';
const FILES=['v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js',];
const ADDONS=[ ['v88_ocr.js','LV88OCR'], ];
function injectHtml(out){if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;
 if(out.includes('data-lv88-boot=')){return out;}
 return '<!-- Lagerverwaltung V88.19:';}
"""
sync="const AUX_TABLES=['inventory_company_v86','app_settings'];\n"
exp="const progressFields=['article_no','linked_article_id','checked_at']; const x=normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.');\n"
with tempfile.TemporaryDirectory() as d:
    t=Path(d)
    for n,s in [('local_backend.js',backend),('service-worker.js',sw),('v88_4_export.js',exp),('sync_merge_v82.js',sync)]: (t/n).write_text(s)
    files=m.upgrade(t)
    assert len(files)==7,files
    for n in files:
        subprocess.run(['node','--check',str(t/n)],check=True,capture_output=True)
    old={n:(t/n).read_bytes() for n in files}
    m.upgrade(t)
    for n in files: assert (t/n).read_bytes()==old[n],n
    x=(t/'local_backend.js').read_text();y=(t/'service-worker.js').read_text();z=(t/'v88_4_export.js').read_text()
    for needle in ['LV88_20_SAFE_BATCH_ARCHIVE','LV88_20_REVIEW_API',"version:'88.20'"]:
        assert needle in x,needle
    for needle in ['v88_20_assistant.js','lv88-20-2026-11-20-release-r2','V88.20:']:
        assert needle in y,needle
    for needle in ['row.unit||inv.unit',"'review_v8820','reviewed_at'"]:
        assert needle in z,needle
    for n,s in [('local_backend.js',backend),('service-worker.js',sw),('v88_4_export.js',exp),('sync_merge_v82.js',sync)]:
        assert (t/(n+'.v88_19_backup')).read_text()==s
    assert 'rondo_duplicate_review_v8820' in (t/'sync_merge_v82.js').read_text()
print('PASS V88.20 GitHub upgrade: seven files, backend/API, version, sync conflict table visibility, safe backups, idempotent')
