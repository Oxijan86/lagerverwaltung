# Geänderte Dateien – Version 66

- `index.html` – Lagerbestand-UI, mobile Darstellung, Techniker-Vorauswahl, M365-Ausgangsbestand, Entwurfsverwaltung
- `local_backend.js` – Version 66, Standard-Techniker in Masterdaten, `/api/articles/stock-settings`, Audit/Transaktionsspeicherung
- `v66_core.js` – testbare V66-Regeln für Spaltenfolge, Technikerwahl, M365-Neuanlage und Entwurfszusammenführung
- `service-worker.js` – V66-Cache und neues Kernmodul
- `manifest.webmanifest` – V66
- `package.json` – V66
- `hilfe/02-neues-material.md`
- `hilfe/03-lagerbestand.md`
- `hilfe/04-einbuchung.md`
- `hilfe/05-entnahme.md`
- `hilfe/07-csv-center.md`
- `tests/v66-features.spec.js` plus aktualisierte Build-/Service-Worker-/Draft-Tests

Nicht destruktiv verändert wurden das SQLite-Schema, bestehende Buchungen, Artikel, Auditdaten, Backups und die V59–V65-Synchronisationsmechanismen.
