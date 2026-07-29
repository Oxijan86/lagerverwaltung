# Lagerverwaltung Lovrencic V24

## Behobener Fehler

Bei einer vorhandenen Datenbank mit Artikeln konnte der Datenbank-Einrichtungsassistent erneut erscheinen, wenn die alte Datenbank noch kein Stammdaten-Passwort enthielt.

Version 24 trennt jetzt zwei Zustände:

- **Datenbankeinrichtung:** erscheint nur bei einer wirklich neuen oder leeren Datenbank.
- **Passworteinrichtung:** erscheint nur innerhalb des Bereichs Stammdaten, wenn für eine ältere Datenbank noch kein Passwort festgelegt wurde.

Eine vorhandene Datenbank mit 697 Artikeln öffnet daher direkt das Dashboard.

## Aktualisierung

Alle Dateien in GitHub ersetzen, Commit durchführen und die Seite mit Strg+F5 neu laden. Bei einer installierten PWA gegebenenfalls die App entfernen und neu installieren, damit der neue Service-Worker sicher geladen wird.
