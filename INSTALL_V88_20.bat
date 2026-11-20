@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
if "%~1"=="" (
 powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL_V88_20.ps1"
) else (
 powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL_V88_20.ps1" -RepoPath "%~1"
)
if errorlevel 1 (
 echo.
 echo FEHLER: Es wurde keine lauffaehige GitHub-Version erstellt.
 echo Lies bitte die Fehlermeldung oben, bevor du etwas hochlaedst.
) else (
 echo.
 echo ERFOLG: Ordner GITHUB_UPLOAD_V88_20 enthaelt alle sieben fertigen Dateien.
)
pause
