# Geänderte Dateien – V75 gegenüber V74

- `inventory_core.js`: gespeicherte Inventursitzungen und Zählpositionen in SQLite; Versionsprüfung, Wiederaufnahme, Baseline-/Buchungsprüfung, Lager-/Lagerortanlage, Teil-/Vollabschluss, Archivierung, Transaktion, Audit und persistente Wiederholbarkeit.
- `inventory_ui.js`: Inventur für PC/Smartphone, Suche, Filter, Seiten, automatische/manuelle Speicherung, lokale Wiederherstellungskopie, Lagerortzuordnung, neue Lager/Lagerorte, Abschlussvorschau und Export.
- `index.html`: Inventurreiter und Oberfläche, responsive Eingabekarten, Navigation mit Speicherung ausstehender Inventureingaben; beim lokalen Start nach Dateiübernahme globale LVSyncCore-Referenz korrigiert; Version 75.0.
- `local_backend.js`: neue Inventur-API und additive Schema-Migration, Einbindung in Backup/Dateispeicherung, Schreibschutz, CSV-Export, Versionsangaben und eingebettete Inventurhilfe.
- `hilfe/14-inventur.md`: vollständige Bedienungsanleitung.
- `service-worker.js`: neuer V75-Cache, beide Inventurmodule auch offline cachen und bei Aktualisierungen neu laden.
- `manifest.webmanifest`, `package.json`, `package-lock.json`: V75 / 75.0.0.
- `tests/v75-inventory-ui-playwright.py`, `tests/v75-inventory-ui.spec.js`: neue End-to-End-Prüfung mit realer SQLite-Datei, 630/631 Artikeln, PC-/Smartphone-Wechsel und Fehlerfällen.
- `tests/check-build.js`, `tests/build-integrity-v64.spec.js`, `tests/service-worker.spec.js`: neue Module und aktive Version prüfen.
- `README_V75.md`, `CHANGED_FILES_V75.md`, `TEST_RESULTS_V75.txt`: Versionsdokumentation.

Alle Original-Excel-Vorlagen und bisherigen Testdateien bleiben erhalten. Es wird keine produktive Lagerdatei im Paket ausgeliefert.
