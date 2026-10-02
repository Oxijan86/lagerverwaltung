# Geänderte Dateien – V73 gegenüber V72

- `index.html`: Button und Sammelauswahl für gültige unbekannte Artikel im Firmenimport; Anzahl, Statushinweis und Sperre während Dateiprüfung/Buchung. Einzelne Ausnahmen und erneute Prüfung verwenden die bestehende Auswahlverwaltung. Aktive Version 73.0.
- `local_backend.js`: ausschließlich aktive Versions- und Datenbankversionsangaben auf 73 aktualisiert; Buchungslogik unverändert.
- `manifest.webmanifest`, `package.json`, `package-lock.json`: aktive Versionsangaben auf V73 / 73.0.0.
- `service-worker.js`: neuer Cache `lv73-company-bulk-create-1`.
- `tests/v72-company-ui-playwright.py`, `tests/v72-company-ui.spec.js`: bisherigen XLSX-Test um Sammelauswahl mit echten Klicks, individuelle Ausnahmen, erneute Prüfung, Dateiauswahl und vollständigen Bestandsabgleich erweitert.
- `tests/build-integrity-v64.spec.js`, `tests/service-worker.spec.js`: aktive Version geprüft.
- `README_V73.md`, `CHANGED_FILES_V73.md`, `TEST_RESULTS_V73.txt`: neue Versionsdokumentation.

Alle Excel-Vorlagen und Testdateien sind unverändert.
