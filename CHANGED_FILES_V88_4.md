# Änderungen Lagerverwaltung V88.4

## Neu: RONDO-PDF mit Zähler und Datum
- Name wird aus `default_technician` vorbelegt; im Exportdialog änderbar.
- Datum ist das tatsächliche lokale Tagesdatum **des Exports** im Format `TT.MM.JJJJ`.
- Beide Angaben erscheinen auf **jeder PDF-Seite** in den Formularfeldern `Zähler` / `Date`.
- `Signatur` bleibt frei; keine elektronische Unterschrift erforderlich.
- RONDO-Druckkoordinaten für Original-72-Seiten-PDF korrigiert.

## PDF-Ausgabe jederzeit
- Neue Exportoberfläche `v88_4_export.js` zur Auswahl gespeicherter Inventuren.
- Laufende Inventur als Zwischenstand drucken, auch teilweise oder vor der ersten Zählung.
- Auch abgeschlossene Inventur erneut als ausgefüllte PDF ausgeben.
- Vor dem Export aktueller offener Inventur: nur Inventur-Zwischenstand sichern (`save`), **kein Inventurabschluss**.
- Zählmenge `0` unterscheidet sich von nicht gezählter Position; doppelte oder unsichere Materialnummern werden nicht automatisch mit Mengen versehen.

## Bereits in V88.3 enthalten
- Drei Einrichtungswege: leer / RONDO-PDF / SAPUI5-Export wie im CSV-Center.
- OCR-Schnellprüfung je Materialzeile mit Bestätigung und DB-Vorschlägen.
- Eindeutige DB-Treffer gesammelt freigeben; mehrdeutige IDs bleiben gesperrt.
- SHA-256-gebundener Katalog der Original-PDF mit 719 Positionen, davon 76 Prüfhinweise.

## Hilfe, Cache und Tests
- `v88_4_help.js`: neue, direkt zugängliche Anleitungen im Hilfe-Reiter.
- `service-worker.js`: V88.4 Cache, Einbindung und Kompatibilität zu bestehenden V87-Dateien.
- `test_v88_4.cjs`: 27 bestandene automatisierte Tests.
- Keine Datenbankmigration, keine automatische Bestandskorrektur durch PDF-Ausgabe.

**Hinweis:** Noch kein vollständiger Smartphone-/Cloud-End-to-End-Test.
