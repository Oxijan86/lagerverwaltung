# Geänderte Dateien – V74 gegenüber V73

- `index.html`: drei Sammelaktionen aus Stammdaten in den Lagerbestand verschoben; Einzelbearbeitung erläutert; Entwürfe vor Sammelübernahme geschützt; Administratorfreigabe über vorhandene Tokensitzung, Sperre während Verarbeitung und Rückmeldung direkt im Lagerbestand; aktuelle Ansichten aktualisiert.
- `local_backend.js`: Sammelübernahme validiert den Modus und verarbeitet nur aktive Artikel; gemeinsame Transaktion, Audit je geändertem Artikel, korrekte Zählung, Rückmeldung angepasster Grenzen und keine Revision bei unveränderter Wiederholung; Version 74 und eingebettete Lagerbestandshilfe.
- `hilfe/03-lagerbestand.md`: Anleitung für Einzelbearbeitung und Sammelübernahme.
- `manifest.webmanifest`, `package.json`, `package-lock.json`: aktive Version V74 / 74.0.0.
- `service-worker.js`: neuer Cache `lv74-stock-level-actions-1`.
- `tests/v74-stock-ui-playwright.py`, `tests/v74-stock-ui.spec.js`: neue reale Browser-/Datenbankregression für direkte Bearbeitung und Sammelaktionen.
- `tests/build-integrity-v64.spec.js`, `tests/service-worker.spec.js`: aktive Version geprüft.
- `README_V74.md`, `CHANGED_FILES_V74.md`, `TEST_RESULTS_V74.txt`: neue Versionsdokumentation.

Alle Excel-Vorlagen und Testdateien bleiben unverändert.
