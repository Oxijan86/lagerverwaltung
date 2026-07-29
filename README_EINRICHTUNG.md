# Lagerverwaltung Lovrencic V32 – korrigierte Ausgabe

Diese Ausgabe korrigiert einen Erstellungsfehler der vorherigen V32-ZIP.

Geprüft wurde:

- `index.html` zeigt Version 32.0
- `local_backend.js` meldet Version 32.0
- Datenbankversion ist 32
- der Startabgleich liest `lager.db` aus dem verbundenen Synchronisationsordner
- die Cloud-Anzeige verwendet die Bezeichnung `Synchronisationsdatei`
- der Service-Worker verwendet einen neuen Cache `lv32-cloudstart-fix-2`

Nach dem Upload auf GitHub alle vorhandenen Dateien ersetzen und anschließend die Seite mit Strg + F5 neu laden.
