param([string]$RepoPath = '')
$ErrorActionPreference = 'Stop'
$Release = $PSScriptRoot
$Output = Join-Path $Release 'GITHUB_UPLOAD_V88_20'
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function ReadUtf8([string]$File) { return [IO.File]::ReadAllText($File,[Text.Encoding]::UTF8) }
function ReplaceOnce([string]$Text,[string]$Before,[string]$After,[string]$Label) {
  $Count=([regex]::Matches($Text,[regex]::Escape($Before))).Count
  if($Count -ne 1) { throw "$Label – unerwarteter GitHub-Dateistand (Anker $Count-mal vorhanden). Keine Änderung vorbereitet." }
  return $Text.Replace($Before,$After)
}
function Need([string]$Path) { if(-not (Test-Path -LiteralPath $Path -PathType Leaf)) { throw "Datei fehlt: $Path" } }

Write-Host ''
Write-Host 'LAGERVERWALTUNG LOVRENCIC V88.20 – REGULÄRES GITHUB-UPDATE' -ForegroundColor Cyan
if([string]::IsNullOrWhiteSpace($RepoPath)) {
  Write-Host 'Lade den aktuellen Original-Quellcode von GitHub herunter ...'
  $Temp = Join-Path $env:TEMP ('lv8820_github_'+[guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $Temp | Out-Null
  $Zip = Join-Path $Temp 'original_main.zip'
  $Src = Join-Path $Temp 'unpacked'
  try {
    Invoke-WebRequest -Uri 'https://github.com/Oxijan86/lagerverwaltung/archive/refs/heads/main.zip' -OutFile $Zip -UseBasicParsing -ErrorAction Stop
    Expand-Archive -Path $Zip -DestinationPath $Src -Force
    $Found=Get-ChildItem -Path $Src -Directory | Select-Object -First 1
    if(-not $Found) { throw 'Heruntergeladenes GitHub-Archiv ist leer.' }
    $Repo=$Found.FullName
  } catch {
    throw "GitHub-Download fehlgeschlagen: $($_.Exception.Message). Alternative: im GitHub unter Code > Download ZIP den Projektordner entpacken und auf INSTALL_V88_20.bat ziehen."
  }
} else {
  $Repo=[IO.Path]::GetFullPath($RepoPath)
  Write-Host "Verwende lokalen GitHub-Projektordner: $Repo"
}
foreach($f in @('local_backend.js','service-worker.js','v88_4_export.js','sync_merge_v82.js')) { Need (Join-Path $Repo $f) }
foreach($f in @('v88_20_backend_insert.txt','v88_20_review_api.txt','v88_20_duplicate_api.txt','v88_20_core.js','v88_20_report.js','v88_20_assistant.js')) { Need (Join-Path $Release $f) }

$Backend = ReadUtf8 (Join-Path $Repo 'local_backend.js')
$Sw = ReadUtf8 (Join-Path $Repo 'service-worker.js')
$Export = ReadUtf8 (Join-Path $Repo 'v88_4_export.js')
$Sync = ReadUtf8 (Join-Path $Repo 'sync_merge_v82.js')
if(-not $Backend.Contains('LV88_20_SAFE_BATCH_ARCHIVE')) {
  $Snippet = ReadUtf8 (Join-Path $Release 'v88_20_backend_insert.txt')
  $Backend = ReplaceOnce $Backend " if(p==='/api/article/delete'){" ($Snippet+"`n if(p==='/api/article/delete'){") 'Sichere Sammelarchivierung'
}
if(-not $Backend.Contains('LV88_20_REVIEW_API')) {
  $Snippet = ReadUtf8 (Join-Path $Release 'v88_20_review_api.txt')
  $Backend = ReplaceOnce $Backend " if(opt.method!=='POST'){" ($Snippet+"`n if(opt.method!=='POST'){") 'PDF-Prüfung mit Cloud-Datenbank'
}
if(-not $Backend.Contains('LV88_20_DUPLICATE_REVIEW_API')) {
  $Snippet = ReadUtf8 (Join-Path $Release 'v88_20_duplicate_api.txt')
  $Backend = ReplaceOnce $Backend " /* LV88_20_REVIEW_API:" ($Snippet+"`n /* LV88_20_REVIEW_API:") 'Unabhängige I/1-Dublettenprüfung'
}
$Backend = $Backend.Replace("if(p==='/api/info')return response({version:'86.0',", "if(p==='/api/info')return response({version:'88.20',")
if(-not $Backend.Contains("version:'88.20'")) { throw 'Die Versionsanzeige konnte nicht auf V88.20 gesetzt werden.' }

if(-not $Sw.Contains('LV88_20_PATCHED')) {
  $Regex = [regex]::new("const CACHE_NAME='lv88-[^']+';")
  if($Regex.Matches($Sw).Count -ne 1) {throw 'Cache-Kennung im Service Worker nicht eindeutig.'}
  $Sw=$Regex.Replace($Sw,"const CACHE_NAME='lv88-20-2026-11-20-release-r2';",1)
  $Sw = ReplaceOnce $Sw "'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js'," "'v88_10_inventory_focus.js','v87_ui.js','v88_ocr.js','v88_20_core.js','v88_20_report.js','v88_20_assistant.js'," 'V88.20-Dateiliste'
  $Sw = ReplaceOnce $Sw " ['v88_ocr.js','LV88OCR']," (" ['v88_ocr.js','LV88OCR'],"+"`n ['v88_20_core.js','LV8820Core'],"+"`n ['v88_20_report.js','LV8820Report'],"+"`n ['v88_20_assistant.js','LV8820'],") 'V88.20-Skriptladen'
  $Sw = ReplaceOnce $Sw "if(out.includes('Lagerverwaltung V88.19:')&&out.includes('data-lv88-boot='))return out;" "if(out.includes('Lagerverwaltung V88.20:')&&out.includes('data-lv88-boot='))return out;" 'Alte HTML-Version'
  $Sw = ReplaceOnce $Sw '<!-- Lagerverwaltung V88.19:' '<!-- Lagerverwaltung V88.20:' 'Neue HTML-Version'
  $Fallback=@'
 if(out.includes('data-lv88-boot=')){
  if(!out.includes('v88_20_assistant.js'))out=out.replace(/<\/body\s*>/i,
   '<script src="v88_20_core.js?v=88.20" defer></script>\n<script src="v88_20_report.js?v=88.20" defer></script>\n<script src="v88_20_assistant.js?v=88.20" defer></script>\n</body>');
'@
  $Sw=ReplaceOnce $Sw " if(out.includes('data-lv88-boot=')){" $Fallback 'Ältere Offline-HTML-Fassung'
  $Sw=$Sw.Replace('v=88.19','v=88.20')
  $Sw="/* LV88_20_PATCHED – release V88.20, safe migration from V88.19. */`n"+$Sw
} else {
  $Sw=[regex]::Replace($Sw,"const CACHE_NAME='lv88-[^']+';","const CACHE_NAME='lv88-20-2026-11-20-release-r2';")
}
foreach($Name in @('v88_20_core.js','v88_20_report.js','v88_20_assistant.js')) {
  if(-not $Sw.Contains($Name)) {throw "Service Worker lädt $Name nicht. Abbruch."}
}
$Wrong="normalizeCount(inv.counted_stock,inv.unit||row.unit||'Stk.')"
$Right="normalizeCount(inv.counted_stock,row.unit||inv.unit||'Stk.')"
if($Export.Contains($Wrong)) {$Export=$Export.Replace($Wrong,$Right)}
if(-not $Export.Contains($Right)) {throw 'RONDO-Einheitenprüfung konnte nicht aktualisiert werden.'}
$OldFields="'linked_article_id','checked_at'"
$NewFields="'linked_article_id','checked_at','review_v8820','reviewed_at'"
if(-not $Export.Contains($NewFields) -and $Export.Contains($OldFields)) {$Export=$Export.Replace($OldFields,$NewFields)}
if(-not $Export.Contains($NewFields)) {throw 'JSON-Sicherung der Prüfentscheidungen fehlt.'}

$OldAux="'inventory_company_v86','app_settings'];"
$NewAux="'inventory_company_v86','app_settings','rondo_pdf_review_v8820','rondo_duplicate_review_v8820'];"
if(-not $Sync.Contains($NewAux)) {$Sync=ReplaceOnce $Sync $OldAux $NewAux 'Cloud-Konfliktschutz'}

# No installation in the user's data folder: stage uploadable source files separately.
if(-not (Test-Path $Output)) {New-Item -ItemType Directory -Path $Output | Out-Null}
[IO.File]::WriteAllText((Join-Path $Output 'local_backend.js'),$Backend,$Utf8)
[IO.File]::WriteAllText((Join-Path $Output 'service-worker.js'),$Sw,$Utf8)
[IO.File]::WriteAllText((Join-Path $Output 'v88_4_export.js'),$Export,$Utf8)
[IO.File]::WriteAllText((Join-Path $Output 'sync_merge_v82.js'),$Sync,$Utf8)
foreach($f in @('v88_20_core.js','v88_20_report.js','v88_20_assistant.js')) {Copy-Item (Join-Path $Release $f) (Join-Path $Output $f) -Force}
$Files=@('local_backend.js','service-worker.js','v88_4_export.js','sync_merge_v82.js','v88_20_core.js','v88_20_report.js','v88_20_assistant.js')
$Node=Get-Command node -ErrorAction SilentlyContinue
if($Node) {foreach($File in $Files) {
  & $Node.Source --check (Join-Path $Output $File)
  if($LASTEXITCODE -ne 0) { throw "Syntaxfehler in $File. NICHT HOCHLADEN." }
}}
$ZipOutput=Join-Path $Release 'GITHUB_UPLOAD_V88_20_FERTIG.zip'
if(Test-Path $ZipOutput) {Remove-Item $ZipOutput -Force}
Compress-Archive -Path (Join-Path $Output '*.js') -DestinationPath $ZipOutput -Force
Write-Host ''
Write-Host 'ERFOLGREICH: Sieben FERTIGE GitHub-Dateien sind erzeugt.' -ForegroundColor Green
Write-Host "Ordner: $Output"
Write-Host "ZIP:    $ZipOutput"
Write-Host 'Bei GitHub > Add file > Upload files die sieben .js-Dateien aus GITHUB_UPLOAD_V88_20 hochladen.'
Write-Host 'Die lokale lager.db und der vorhandene GitHub-Projektordner wurden NICHT verändert.'
Write-Host 'Danach App schließen, neu öffnen und sichtbare Version V88.20 kontrollieren.'
