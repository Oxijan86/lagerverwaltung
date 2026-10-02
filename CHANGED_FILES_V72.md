# Geänderte Dateien – V72 gegenüber V71

- `local_backend.js`: Firmen-Mengenspalte aus numerischen Zellwerten lesen und formatierte Identifikatoren erhalten; aktive Versionsangaben auf 72 aktualisiert.
- `index.html`, `manifest.webmanifest`, `package.json`, `package-lock.json`: aktive Version 72.0 / 72.0.0.
- `service-worker.js`: neuer Cache `lv72-company-numeric-quantity-1`.
- `tests/v72-company-ui-playwright.py`, `tests/v72-company-ui.spec.js`: echte XLSX-Einbuchung aller 630 Zeilen, Bestandsvergleich, Wiederholung, Neustart und Grenzfälle.
- `tests/fixtures_Bestandsliste_Lovrencic_ST.xlsx`: unveränderte Kopie der angehängten Firmenvorlage mit ST/M/L-Anzeigeformaten zur Fehlerreproduktion.
- `tests/build-integrity-v64.spec.js`, `tests/service-worker.spec.js`: aktive Versionsprüfung aktualisiert.
- `README_V72.md`, `CHANGED_FILES_V72.md`, `TEST_RESULTS_V72.txt`: neue Versionsdokumentation.

Die beiden Materialanforderungs-Vorlagen und die bisherige Firmen-Testvorlage sind unverändert. Die ursprüngliche hochgeladene Excel-Datei wird nicht bearbeitet.
