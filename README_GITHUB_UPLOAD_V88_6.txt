Lagerverwaltung Lovrencic – V88.6
=================================

Diese ZIP-Datei enthält DIREKT hochladbare Dateien für:
https://github.com/Oxijan86/lagerverwaltung

1. Vor der Änderung eine Sicherung der lager.db erstellen.
2. ZIP lokal entpacken.
3. GitHub-Repository / Hauptverzeichnis öffnen: Add file -> Upload files.
4. ALLE Dateien aus dem ZIP auf die gleiche Ebene hochladen, nicht den ZIP-Ordner.
5. Änderungen bestätigen und auf den GitHub-Pages-Deploy warten.
6. PWA vollständig schließen und wieder öffnen, Version 88.6 prüfen.
7. Bitte KEINE Browserdaten, IndexedDB oder vorhandene lager.db löschen.

WICHTIG: Die Datei "Inventurliste Lovrencic 1025.pdf" wird NICHT in diesem
Upload-Paket mitveröffentlicht (Firmendaten). Sie wird vom Benutzer lokal im
Browser ausgewählt. Die bisher geprüfte Original-PDF erkennt die App an ihrer
SHA-256-Prüfsumme; ihr Katalog enthält 719 Positionen auf 72 Seiten.

Neuerungen V88.6
----------------
* PDF-Ausgabe wird als verlustfreies, inkrementelles PDF-Update erzeugt.
  Die ORIGINAL-PDF-Bytes bleiben vollständig erhalten. Keine Neurasterung.
* Zählmengen werden LINKS neben der Einheit ST bzw. M gedruckt. Die vorhandene
  Statuszeile "Noch nicht gezählt" wird NICHT geändert oder übermalt.
* Name des Technikers und aktuelles Exportdatum stehen auf ihren jeweiligen
  vorgedruckten Linien bei Zähler und Date. Signatur bleibt leer.
* PDF-Zwischenstand auch vor Inventurabschluss und nach Abschluss abrufbar.
  Ein Export verändert NIEMALS den Lagerbestand.
* Per Zeile "Später zuordnen" für unklare OCR-Materialpositionen. Daten bleiben
  für spätere Zuteilung gespeichert, ohne Anlage oder Bestandsbuchung.
* Filter "Später zuordnen" und "Zur Prüfung zurückholen".
* Nummernvorschläge vergleichen auch mögliche Zeichenverwechslungen I/1,
  O/0, B/8 und S/5, zusammen mit der Beschreibung – nur als Vorschlag.
* Direkte Zeilenprüfung und sichere Sammelbestätigung bleiben vorhanden.
* Ersteinrichtung: Ohne Import / RONDO-PDF / SAPUI5-CSV/XLSX/XLS.

WARNUNG / bewusste Sicherheitsschranke
-------------------------------------
Der verlustfreie PDF-Export ist für die bytegenau geprüfte RONDO-Vorlage
(72 Seiten, Version 2026) implementiert. Eine abweichende PDF wird mit einer
klaren Fehlermeldung abgewiesen – NICHT auf Verdacht neu gerastert.
Für spätere RONDO-Vorlagen muss das Layout neu überprüft werden.

Testhinweise
------------
node --test test_v88_6.cjs
Für echte 72-Seiten-PDF-Tests:
RONDO_ORIGINAL_PDF=/Pfad/zur/Inventurliste.pdf node --test test_v88_6.cjs

Der automatisierte Test wurde mit der vom Benutzer hochgeladenen ORIGINAL-PDF
in der Entwicklungsumgebung ausgeführt. Chromium-Praxistest im lokalen Browser
war durch die Umgebung blockiert; Browser-Einsatz auf Benutzergeräten bleibt
noch zu verifizieren. Die resultierende 72-seitige PDF wurde mit unabhängigen
PDF-Lesern und gerenderten Seiten kontrolliert.

Dies ist ein UPDATE, keine neue Datenbank und keine Migration.
