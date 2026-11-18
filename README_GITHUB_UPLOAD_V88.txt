LAGERVERWALTUNG LOVRENCIC – VERSION 88.0
Direktupload für das BESTEHENDE GitHub-Repository Oxijan86/lagerverwaltung
Stand: 18.11.2026

DIES IST KEIN BUILDER UND KEIN INSTALLATIONSSKRIPT.
Die Dateien dieses ZIP-Pakets werden unmittelbar im GitHub-Repository hochgeladen.
Der vorhandene Code und die bestehenden Lagerdaten bleiben erhalten.

SO LÄDST DU VERSION 88 HOCH

1. ZIP auf deinem Computer entpacken.
2. Auf https://github.com/Oxijan86/lagerverwaltung gehen.
3. Im bestehenden Repository (Branch: main) "Add file" -> "Upload files" öffnen.
4. Alle Dateien aus dem entpackten ZIP in das Stammverzeichnis ziehen.
   (Nicht den ZIP-Ordner selbst und nicht die ZIP-Datei hochladen.)
5. "Commit changes" ausführen. Vorhandene Dateien mit gleichem Namen werden ersetzt.
6. GitHub Pages aktualisieren lassen. Die App danach zweimal neu laden,
   damit der aktualisierte Service Worker die V88-Module aktiviert.
7. Prüfen, ob im Programm Version 88.0 erscheint.

WICHTIG: KEINE BROWSERSEITENDATEN / INDEXEDDB LÖSCHEN!
Dadurch könnten lokale Lagerdaten und noch nicht synchronisierte Änderungen
verloren gehen. Browser-Tabs schließen und die App normal neu laden genügt.

VORAUSSETZUNG

Im Repository müssen die bereits bestehenden V87.1-Dateien
v87_core.js, v87_pdf.js und v87_ui.js vorhanden sein.
Diese drei Dateien wurden am 18.11.2026 auf dem aktuellen GitHub-Hauptzweig
bestätigt; sie sind absichtlich nicht nochmals im ZIP enthalten.
Die große index.html bleibt unverändert: Der neue Service Worker ergänzt die
bereits vorhandenen V87-Funktionen beim Laden und aktiviert den V88-OCR-Schutz.

NEU IN V88

- Zweiter OCR-Lauf bei schwacher oder unvollständiger Erkennung:
  kontrastverstärkt, bei passenden Geräten höher aufgelöst, mit Speichergrenze.
- Positions- und Artikelnummernprüfung (Text + räumliche OCR gegenprüfen).
- Defekte/leere PDF-Renderings werden erkannt und der Import wird abgebrochen.
- Unsichere Zeilen werden für eine manuelle Prüfung markiert;
  keine stillschweigend erfundenen Materialien.
- Schutz vor doppelten Seitenpositionen, falschen Reihen und ungezählten Mengen.
- "Noch nicht gezählt" bleibt leer/null – ausdrücklich eingegebene Null ist 0.
- Festlegung auf die 72-seitige RONDO-Inventurliste (71x10 + 9 = 719 Positionen).
- Keine Zwischenstands-Schreiboperation nach JEDER gescannten Seite mehr:
  regulär nach jeweils vier Seiten, am Ende und nach Abbruch/Fehler.
- Alte/unsichere Seiten-Caches werden neu gescannt.
- V88-Anzeige, aktualisiertes App-Manifest und eigene PWA-Cachekennung.
- Vorhandene Lagerverwaltung, Cloud- und Backup-Funktionen werden nicht ersetzt.

TESTS

Syntax: node --check service-worker.js
        node --check v88_ocr.js
Automatische Tests: node --test test_v88.cjs

11/11 automatisierte Tests bestanden. Der vollständige reale Import aller 72
Seiten auf einem Android-Smartphone konnte hier nicht ausgeführt werden.
Die Automatik ersetzt deshalb KEINE Sichtkontrolle der Prüfansicht vor der
Artikelübernahme. Die Anwendung importiert keine unklaren Mengen ungefragt.

Hinweis: Es ist ein inkrementelles, direkt auf GitHub hochladbares Update-Paket
für den vorhandenen Stand, kein komplettes neues Repository.
