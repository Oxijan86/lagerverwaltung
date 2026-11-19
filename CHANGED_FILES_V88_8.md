# V88.8 – tatsächliche Änderungen

- `service-worker.js`: Versionscache und Skriptinjektion V88.8; gezielte, idempotente Anpassung von `v87_ui.js` und `local_backend.js`. Die Backend-Ausnahme ist ausschließlich bei einem bestätigten, mengenlosen `/api/articles/create-import` erlaubt; alle anderen Prüfroutinen bleiben unangetastet.
- `v88_8_technician.js` (neu): technischer Name-Hinweis bei tatsächlichem Validierungsfehler, ausdrückliche Fortfahren-/Abbrechen-Entscheidung und bestätigte Wiederholung je Importvorgang. Keine automatische Technikerregistrierung.
- `v88_4_help.js`: neuer Hilfebereich zur Namensabweichung.
- `v88_ocr.js`, `manifest.webmanifest`: Versionskennzeichnung V88.8.
- `test_v88_7.cjs`: vorhandene 12 Regressionstests an V88.8 angepasst.
- `test_v88_8.cjs` (neu): 10 Tests zu UI-Hinweis, bestätigter Wiederholung, Schutz aller Mengenbuchungen, Altcaches, echtem PDF-Fingerabdruck sowie Abbrechen.
- Alle übrigen V88.7-Dateien unverändert ins ZIP übernommen, damit der GitHub-Upload vollständig ist.

## Unverändert

- Kein Umbau der RONDO-PDF-Positionen, der OCR-Katalogdaten, der Inventurdatenbank oder der Lagerbuchungen.
- Keine Browserdaten/IndexedDB/Lagerdatenbank löschen.
