# Geänderte Dateien – Version 68

- `index.html` – Smartphone-Suchtreffer, Trefferzahl, Tastatur-Schließen, lokale Sofortfilterung, V68-Version
- `local_backend.js` – no-op Idempotenz ohne `persist()`, Create-and-book-Einmalbuchung, V68-Version, Hilfetexte
- `v68_core.js` – testbare Such-, Persist-Entscheidungs- und Create-and-book-Regeln
- `service-worker.js` – V68 Cache und `v68_core.js`
- `manifest.webmanifest` – V68
- `package.json` – V68, Zero-Test-sicherer Runner, Build-Prüfung
- `.github/workflows/ci.yml` – CI für Tests und Syntax/Pflichtdateien
- `tests/run-tests.js`, `tests/check-build.js` – Test-/Build-Runner
- `tests/v68-search.spec.js` – Suchverhalten/Performance/Entwurfserhalt
- `tests/v68-idempotency.spec.js` – no-op Revision und Create-and-book/SQLite
- `tests/v68-sync.spec.js` – Konflikte, Prewrite-Race, Berechtigungen, Queue
- `tests/v68-ci.spec.js` – Testverzeichnis und CI
- `tests/visual_mobile_search.py` und `tests/visual/*` – gerenderte mobile Sichtbarkeitsprüfung
- `hilfe/03-lagerbestand.md`, `hilfe/12-mobile-bedienung.md`, `hilfe/07-csv-center.md`, `hilfe/04-einbuchung.md` – V68-Dokumentation

Bestehende SQLite-Tabellen und Daten werden nicht destruktiv migriert. Beide Materialanforderungs-XLSX-Vorlagen bleiben unverändert.
