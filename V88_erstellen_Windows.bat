@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (py -3 build_v88.py) else (python build_v88.py)
echo.
echo Falls erfolgreich: V88_ZUM_GITHUB_HOCHLADEN.zip bei GitHub hochladen.
pause
