# Geänderte Dateien – Version 69

## Anwendung

- `index.html`
  - CSV-Center mit getrennten Firmenlisten-Modi Inventur/Bestandsabgleich und Einbuchung
  - Vorschautabelle mit Dateimenge, App-Bestand, geplanter Änderung und Fehlern
  - Auswahl für unbekannte Artikel und internen Lagerort
  - Firmenexport-Einstellungen und CSV-/XLSX-Exportbuttons
  - Hilfe-Lade-, Öffnungs- und Suchfunktionen angeschlossen
  - Version 69
- `local_backend.js`
  - headerbasierter Firmenlisten-Import
  - transaktionaler Firmenlisten-Commit
  - persistenter Idempotenzschutz über Vorgangs-/Positionskennung
  - Inventurwert 0 korrekt unterstützt
  - Firmen-Lagerort strikt von internen Lagerorten getrennt
  - Firmenexport CSV und XLSX
  - Firmenexport-Einstellungen
  - Legacy-Inventurvorschau auf einheitliches `{items, errors}`-Format korrigiert
  - tatsächlich angezeigte Hilfetexte aktualisiert
  - database_version/API-Version 69
- `v69_core.js`
  - reine, testbare Header-/Mengen-/Firmenformatlogik
  - CSV-Export und Roundtrip-Helfer
- `help_core.js`
  - testbare Suche über Titel und Inhalte
- `service-worker.js`
  - V69-Cache und `v69_core.js`
- `manifest.webmanifest`
- `package.json`

## Hilfe

- `hilfe/04-einbuchung.md`
- `hilfe/05-entnahme.md`
- `hilfe/07-csv-center.md`
- `hilfe/11-m365-prompts.md`
- `hilfe/14-inventur.md`

## Tests

- `tests/v69-company-format.spec.js`
- `tests/v69-company-db.spec.js`
- `tests/v69-backend-ui.spec.js`
- `tests/v69-help.spec.js`
- `tests/company-template-xlsx.py`
- `tests/help-ui-playwright.py`
- `tests/fixtures_Bestandsliste_Lovrencic_032026.xlsx`
- `tests/build-integrity-v64.spec.js` – aktive Versionsprüfung auf V69 angepasst
- `tests/service-worker.spec.js` – V69-Cache/Modulprüfung
- `tests/check-build.js` – `v69_core.js` als Pflichtdatei/Syntaxprüfung

Die bisherigen V59–V68 Synchronisations-, Sicherheits-, Revisions-, Transaktions- und UI-Tests bleiben im Paket enthalten.
