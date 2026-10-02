# Geänderte Dateien – V70

- `index.html`: fehlende Downloadfunktion, Exportmeldungen, vollständiger Smartphone-Einrichtungsweg, responsive Einrichtung, Startdialog-Reihenfolge, Verbrauchsmaterial-Katalog und Bestellpositionen, optionale Lagerortfelder, Firmenvorschau-Sperre und Entscheidungserhalt, Legacy-Inventurfehler.
- `local_backend.js`: zusätzliche Tabelle und API für Verbrauchsmaterial, Excel-Zuordnung beider Vorlagen und Verifikation, exportierbare lager.db, optionale Lagerorte in allen Anlagewegen, Legacy-Inventur mit 0/Leerwertprüfung, UTF-8/Windows-1252-CSV-Dekodierung, Startstatus mit Einrichtungszustand, V70-Version und eingebettete Hilfe.
- `manifest.webmanifest`, `service-worker.js`: V70 und neuer Cache.
- `package.json`, `package-lock.json`, `.github/workflows/ci.yml`: reproduzierbare Testabhängigkeiten und Browserinstallation.
- `hilfe/00-erste-schritte.md`, `02-neues-material.md`, `06-materialanforderung.md`, `07-materialanforderung.md`, `07-csv-center.md`, `12-mobile-bedienung.md`: passende Bedienungsanleitungen.
- `tests/v70-ui-playwright.py`, `tests/v70-ui.spec.js`, `tests/requirements.txt`: echte Oberfläche, SQLite/IndexedDB, CSV/XLSX-Downloads, Smartphone-Setup, Ordnerpfade und Neuanlagen.
- `tests/help-ui-playwright.py`: vorhandenen oder von Playwright installierten Chromium verwenden.
- `tests/build-integrity-v64.spec.js`, `tests/service-worker.spec.js`, `tests/ui-v65.spec.js`: aktuelle Version und optionalen Lagerort prüfen.

Die beiden originalen Excel-Vorlagendateien sind bytegleich zu V69. Bestehende Datenbanktabellen werden nicht destruktiv migriert.
