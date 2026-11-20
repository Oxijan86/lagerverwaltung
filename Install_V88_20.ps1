param([Parameter(Mandatory=$true)][string]$RepoPath)
$ErrorActionPreference = 'Stop'
$Release = $PSScriptRoot
$Repo = [IO.Path]::GetFullPath($RepoPath)
$utf8 = New-Object System.Text.UTF8Encoding($false)
function ReadUtf8([string]$Name) { return [IO.File]::ReadAllText((Join-Path $Repo $Name),$utf8) }
function ReplaceOnce([string]$Subject,[string]$Before,[string]$After) {
  $count = ([regex]::Matches($Subject,[regex]::Escape($Before))).Count
  if($count -ne 1) { throw "Quelldatei hat einen unerwarteten Stand. Anker '$Before' wurde $count Mal gefunden. Abbruch zum Schutz der Daten." }
  return $Subject.Replace($Before,$After)
}
function ApplyPatch {
  $mandatory = @('local_backend.js','service-worker.js','v88_4_export.js')
  foreach($name in $mandatory) {
    if(!(Test-Path (Join-Path $Repo $name))) { throw "Der GitHub-Projektordner fehlt oder ist falsch: $name nicht gefunden." }
  }
  $backend = ReadUtf8 'local_backend.js'
  $sw = ReadUtf8 'service-worker.js'
  $export = ReadUtf8 'v88_4_export.js'
  if(!$backend.Contains('LV88_20_SAFE_BATCH_ARCHIVE')) {
    $snippet = [IO.File]::ReadAllText((Join-Path $Release 'v88_20_backend_insert.txt'),$utf8)
    $backend=ReplaceOnce $backend " if(p==='/api/article/delete'){" ($snippet+"`n if(p==='/api/article/delete'){")
  }
  if(!$sw.Contains('LV88_20_PATCHED')) {
    $sw=[regex]::Replace($sw,"const CACHE_NAME='lv88-[^']+';","const CACHE_NAME='lv88-20-2026-11-20-assistant-safe-archive-v1';",1)
    $sw=ReplaceOnce $sw "'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js'," "'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js','v88_20_core.js','v88_20_report.js','v88_20_assistant.js',"
    $sw=ReplaceOnce $sw " ['v88_ocr.js','LV88OCR']," (" ['v88_ocr.js','LV88OCR'],"+"`n ['v88_20_core.js','LV8820Core'],"+"`n ['v88_20_report.js','LV8820Report'],"+"`n ['v88_20_assistant.js','LV8820'],")
    $sw=ReplaceOnce $sw "if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;" "if(out.includes('Lagerverwaltung V88.20:')&&out.includes('data-lv88-boot='))return out;"
    $sw=ReplaceOnce $sw '<!-- Lagerverwaltung V88.19:' '<!-- Lagerverwaltung V88.20:'
    $sw=$sw.Replace('v=88.19','v=88.20')
    $sw='/* LV88_20_PATCHED – safe additive upgrade; previous data preserved. */'+"`n"+$sw
  }
  $before="normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.')"
  $after="normalizeCount(inv.counted_stock,row.unit||inv.unit||'Stk.')"
  if($export.Contains($before)) {$export=$export.Replace($before,$after)}
  elseif(!$export.Contains($after)) { throw 'PDF-Exportversion ist unbekannt. Keine Änderungen.' }
  # Complete validation before first write.
  foreach($name in @('v88_20_core.js','v88_20_report.js','v88_20_assistant.js')) {
    if(!(Test-Path (Join-Path $Release $name))) { throw "V88.20-Quelldatei fehlt: $name" }
  }
  $output=@{'local_backend.js'=$backend;'service-worker.js'=$sw;'v88_4_export.js'=$export}
  foreach($name in $mandatory) {
    $path=Join-Path $Repo $name
    $old=[IO.File]::ReadAllText($path,$utf8)
    if($old -ne $output[$name]) {
      $backup=$path+'.v88_19_backup'
      if(!(Test-Path $backup)) { [IO.File]::Copy($path,$backup) }
      [IO.File]::WriteAllText($path,$output[$name],$utf8)
    }
  }
  foreach($name in @('v88_20_core.js','v88_20_report.js','v88_20_assistant.js')) {
    Copy-Item (Join-Path $Release $name) (Join-Path $Repo $name) -Force
  }
  Write-Host 'V88.20 erfolgreich im entpackten GitHub-Ordner vorbereitet.' -ForegroundColor Green
  Write-Host 'Auf GitHub hochladen: local_backend.js, service-worker.js, v88_4_export.js, v88_20_core.js, v88_20_report.js, v88_20_assistant.js'
  Write-Host 'Deine lager.db wurde nicht verändert. Source-Backups: *.v88_19_backup.'
}
try { ApplyPatch } catch { Write-Error $_.Exception.Message; exit 1 }
