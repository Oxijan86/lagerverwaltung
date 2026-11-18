# Lagerverwaltung Lovrencic V88.0 – RONDO-Inventur-OCR

Diese Version korrigiert ausschließlich den PDF-Import der RONDO-Inventurliste. **Keine Änderung an Lagerbeständen, Datenbankstruktur, Materialentnahmen oder Serviceberichten.**

## Fehler und Verbesserungen

- Gescanntes Canon-RONDO-PDF enthält keine Textschicht. Die Erkennung liest daher das Bild.
- PDF.js lädt die lokalen WASM-/Font-/CMAP-Ressourcen explizit; leere Renderings werden erkannt.
- OCR-Durchlauf 1 mit 2,5x; bei fehlenden Positionen zweiter Durchlauf in 3,15x mit Kontraststeigerung und Tabellenbereich, alternativem Segmentierungsmodus.
- OCR-Wörter aus Blöcken, direkten Wörtern, Zeilen oder TSV; ROI-Koordinaten zurück in die Seitenkoordinaten.
- OCR-Ausfälle zeigen einen konkreten Fehler; es werden **niemals automatisch Artikelnummern geraten**.
- Unsichere Positionsnummern, Einheiten, Lagerorte und Artikelnummern müssen kontrolliert werden.
- Original-PDF und bereits geprüfte Korrekturen bleiben erhalten, der gleiche Import kann fortgesetzt werden.
- Bei vollständig erkannten Seiten werden Wiederholungen vermieden. Alle drei Seiten wird ein Zwischenstand gespeichert; Canvas-Speicher wird freigegeben.
- Explizite Bestätigung, dass Artikel anhand des Original-PDF geprüft wurden, bevor neue Artikel registriert werden.
- Leere Zählmengen bleiben `null` (nicht gezählt). Dieser Import bucht **keine** Lagerbewegungen.

## Bereitstellung

Mit `build_v88.py` und Internetverbindung die vier neuesten Originaldateien aus `Oxijan86/lagerverwaltung/main` beziehen, gezielt korrigieren, lokale Tests ausführen und die Ersatzdateien in `V88_ZUM_GITHUB_HOCHLADEN.zip` packen. **Das Archiv enthält nur die vier Dateien zum Ersetzen, nicht das gesamte Repository**. Im Repository GitHub -> Add file -> Upload files. **Vorher unbedingt `lager.db` sichern.**

## Tests und Grenzen

Der Builder prüft bei der Erstellung, dass die erwarteten Codepassagen genau einmal vorkommen, und führt mit Node.js (falls vorhanden) Syntax- und Komponententests durch. Die original hochgeladene PDF hat 72 Bildseiten; mit lokalem Tesseract konnte Seite 1 außerhalb des Browsers gelesen werden. Ein vollständiger Live-Test auf dem betroffenen Android-Gerät ist ohne Zugriff auf das Telefon nicht möglich. Daher keine Garantie, dass jede einzelne gescannte Zeile erkannt wird. Zur Sicherheit verhindert die App die ungeprüfte Bestandsübernahme.
