LAGERVERWALTUNG LOVRENCIC – GITHUB-UPDATE VERSION 88.2
=========================================================
Stand: 18.11.2026

Was dieses Paket macht:
- BEHEBT den fehlgeschlagenen Import der konkreten, von dir hochgeladenen
  Original-PDF „Inventurliste Lovrencic 1025.pdf“ (SHA-256 a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b).
- Die 719 Positionen der 72 Seiten wurden in mehreren separaten OCR-Durchgängen
  außerhalb der App erkannt. Die Erkennung erfolgt für DIESE PDF nicht noch
  einmal im Browser. Eine andere PDF wird auf normalem Weg gescannt.
- 76 Positionen bleiben wegen OCR-Unstimmigkeiten zur Sichtprüfung markiert.
- Alle Zählmengen bleiben leer (nicht 0). Es gibt KEINE automatische
  Lagerbuchung, keine Datenbankmigration und keinen Reset.

INSTALLATION:
1. ZIP herunterladen und auf dem Computer entpacken.
2. Im bestehenden Repository https://github.com/Oxijan86/lagerverwaltung
   „Add file“ > „Upload files“ öffnen.
3. ALLE Dateien aus diesem ZIP im ROOT (Hauptverzeichnis) hochladen.
   Bestehende gleichnamige Dateien ersetzen; Ordner nicht zusätzlich anlegen.
4. Commit changes bestätigen. Die GitHub-Pages-Aktualisierung abwarten.
5. Website im Browser zweimal neu laden, bis „Version 88.2“ erscheint.
   NICHT den Browser-Speicher oder die Datenbank löschen.
6. Originaldatei (EXAKT dieselbe PDF) bei „RONDO-PDF prüfen“ auswählen.
7. In der Prüfansicht „Unsicher“ filtern und die markierten Nummern/Bezeichnungen
   an der Original-PDF prüfen und korrigieren. Erst nach Prüfung übernehmen.

HINWEISE:
- Auf einem Smartphone müssen Browser und Netzwerk ausreichend Speicher
  für die Original-PDF und die lokale Inventurdatenbank haben.
- Der Katalog ist absichtlich nur an den SHA-256-Hash dieser einen PDF gebunden.
- Die Druckausgabe der ausgefüllten 72-seitigen PDF ist NICHT vollständig
  im mobilen Browser getestet; separater Funktionstest erforderlich.
- Ein vollständiger produktiver Import wurde hier nicht auf deinem Handy getestet.

DATEIEN IM PAKET:
service-worker.js          PWA-Aktualisierung und Integration der V88.2-PDF-Logik
v88_2_catalog.js           Vorgelesene 719 RONDO-Materialpositionen, mit Prüfmarkierungen
v88_ocr.js                 Bestehender allgemeiner OCR-Pfad, Versionsanzeige
manifest.webmanifest       Versionskennung 88.2
test_v88_2.cjs             Automatisierte Import-/Sicherheitstests
CHANGED_FILES_V88_2.md    Änderungen
TESTERGEBNIS_V88_2.md    Testergebnis
