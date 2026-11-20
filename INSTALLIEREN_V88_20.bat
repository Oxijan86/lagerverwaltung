@echo off
chcp 65001 >NUL
setlocal
cd /d "%~dp0"
echo.
echo    LAGERVERWALTUNG LOVRENCIC V88.20

echo 1. GitHub-Projekt als ZIP herunterladen und entpacken.
echo 2. Den entpackten Projektordner auf diese Datei ziehen.
echo 3. Die sechs geaenderten Quelldateien auf GitHub hochladen.
echo.
if "%~1"=="" (
  echo FEHLER: Bitte den entpackten GitHub-Projektordner auf diese BAT-Datei ziehen.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install_V88_20.ps1" -RepoPath "%~1"
if errorlevel 1 (
  echo.
  echo FEHLER! Kein GitHub-Upload erfolgt. Bitte Screenshot schicken.
  pause
  exit /b 1
)
echo.
echo Lokale Dateien sind vorbereitet. Bitte jetzt die sechs Dateien hochladen.
pause
