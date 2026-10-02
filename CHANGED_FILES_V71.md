# Geänderte Dateien – V71 gegenüber V70

- `local_backend.js`: Mengenformat in beiden Materialanforderungs-Exportpfaden korrigiert; aktive Versions- und Datenbankversionsmarkierungen auf 71 gesetzt.
- `index.html`, `manifest.webmanifest`, `package.json`, `package-lock.json`: aktive Versionsangaben auf V71 / 71.0 / 71.0.0 aktualisiert.
- `service-worker.js`: neuer Cache `lv71-quantity-format-1`.
- `tests/v70-ui-playwright.py`: Regressionstests an real exportierten XLSX-Dateien für ganze Mengen und Dezimalmengen in beiden Vorlagen, einschließlich Verbrauchsmaterial.
- `tests/v70-ui.spec.js`, `tests/build-integrity-v64.spec.js`, `tests/service-worker.spec.js`: Testbeschreibung und aktive Version aktualisiert.
- `README_V71.md`, `CHANGED_FILES_V71.md`, `TEST_RESULTS_V71.txt`: neue Versionsdokumentation.

Die beiden Originalvorlagen und alle übrigen App-Funktionen sind gegenüber V70 unverändert.
