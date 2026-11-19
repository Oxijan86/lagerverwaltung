# Lagerverwaltung Lovrencic V88.17 — I/1-Sammelzuordnung, sichere Dublettenprüfung

Stand: 19.11.2026

## Geänderte Funktion

- **Schon in der PDF-OCR-Prüfung**: Sammelbutton für I/1-Verwechslungen bei gleicher Artikelbeschreibung und identischem Nummernrest. Vollständige Vorprüfung auf Doppelzuordnung, danach bewusste Gruppenbestätigung. Nur PDF-Prüfpositionen werden angepasst; keine Buchungen, Bestände oder Zählungen.
- **RONDO-PDF-Ausgabedialog**: eigene Sammelzuordnung für I/1-Vorschläge. Vorschläge zeigen Seiten/Positionen, ursprüngliche und vorgeschlagene Nummer, Beschreibung und Zählwerte. Schon belegte oder mehrdeutige Zählungen sind nicht als unkritische Sammelzuordnung anwählbar. Zuvor Bestätigung; Speicherung als einzelner PDF-Snapshot.
- **OCR-Dublettenprüfung**: aktuelle Artikelstammdaten nach I/1-Paaren durchsuchen, alle Paare nebeneinander anzeigen und CSV-Prüfliste erzeugen. Abweichende Bezeichnungen werden sichtbar hervorgehoben, nicht pauschal gleichgesetzt.
- **Archivierung**: Erst bestehende Datenbank-API für jede potenzielle OCR-Dublette um sichere Vorschau bitten. Nur unbenutzte und nach Original-PDF bestätigte 1-Fehlartikel sind nach zweifacher Bestätigung archivierbar. Die API erstellt vor *jedem* Einzelarchiv ein Sicherheitsbackup, protokolliert die Aktion und prüft unmittelbar vorher erneut den Zustand. Bestände/Buchungen/gezählte Inventurmengen werden nicht automatisch zusammengeführt oder gelöscht.
- Hilfetexte, PWA-Version, Cache-Key und Bundle-Version aktualisiert.

## Wichtige Sicherheitsgrenzen

- **Nicht** alle führenden 1 in I konvertieren. Bei mehrdeutigen Treffern die Original-PDF und den vorhandenen Lagerartikel prüfen.
- **Nicht** gefüllte Inventur-Zählstände zwischen verschiedenen Artikeln ohne individuelle Prüfung verschieben.
- **Nicht** alle automatisch als OCR-fehlerhaft erkannten Stammdaten löschen. Selbst eine I/1-Nummernähnlichkeit kann auf zwei verschiedene Materialien zeigen.
- **Keine automatische Stammdatenmigration/Bestandsbuchung bei Installation.** Alle Änderungen an PDF-Zuordnungen und archivierungsfähigen Stammdaten erfolgen nur auf ausdrückliche Bestätigung.
- Eine Archivierung macht den alten Datensatz inaktiv, statt ihn samt Audit-/Buchungshistorie hart zu löschen.

## Dateien

Neu:
- `v88_17_bulk_core.js`
- `v88_17_bulk_ui.js`
- `test_v88_17.cjs`

Geändert:
- `v88_3_review.js`
- `v88_4_export.js`
- `service-worker.js`
- `manifest.webmanifest`
- `v88_ocr.js`
- `v88_4_help.js`
- Versionierte Regressionstests und diese Dokumentation.

## Tests

134/134 automatisierte Node-Tests erfolgreich. Die aktuelle Sicherungsdatei mit 41 I/1-Artikelpaaren wurde read-only ausgewertet. Ein vollständiger Chrome-Praxistest ist in der Umgebung trotz Versuch nicht möglich gewesen (Headless-Chromium-Start hängt); daher vor einer produktiven Sammelarchivierung auf dem Ziel-PC die Vorschau und Sicherung prüfen.
