@echo off
cd /d "%~dp0"
echo Lokale Vorschau unter http://localhost:8080
echo OneDrive-Anmeldung funktioniert nur, wenn diese Adresse als SPA-Redirect-URI registriert wurde.
python -m http.server 8080
pause
