# V83 – technische Änderungen

- `index.html`: SAP-Materialbeleg-PDF/JPG-Importmaske mit Wahl der Buchungsrichtung; Artikel-Sprunglinks aus Dashboard/Materialanforderung; Sonderfunktionen/Excel-Entnahme; Versionsanzeige 83.0.
- `material_booking_v83_core.js`: Parsing von SAP/RONDO-Materialbelegnummern inklusive Geschäftsjahr, Positions-IDs, Mengen und Einheiten. Materialanforderungen werden ausgeschlossen. Ziel 1010/1025 wird als mögliche Einbuchung behandelt.
- `material_booking_v83_ui.js`: PDF-/JPG-Ausleseprozess, Vorschau, selektive Buchung, Artikel- und Einheitsprüfung, Excel-Sonderimport.
- `local_backend.js`: Belegpositions- und Doppelbuchungsschutz, atomare Materialbuchung, geschützte Cloud-Auto-Synchronisierung, geprüfter Cloud-Dateistatus, erweiterte eingebettete Hilfe.
- `inventory_ui.js`: Neuen Lagerort direkt im Inventur-Lagerortfeld anlegen.
- `sync_ui_v81.js`: Nach manueller Synchronisierung nochmals Lesebestätigung und gegebenenfalls sichere Wiederholung.
- `hilfe/*.md`: Überarbeitete und neue Schritt-für-Schritt-Anleitungen.
- `manifest.webmanifest`, `service-worker.js`, `package.json`, `package-lock.json`: V83-Cache und Versionskennzeichen.
- `tests_v83/`: Regressionstests für SAP-Materialbeleg, Doppelbuchungs-Schutzpfade und Browservorschau.
