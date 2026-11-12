# Änderungen in V85

- `index.html`: zusätzliche Schnellauswahl **Lagerort**, Schnellzugriff für Zählbereich, mobile Bedienelemente, Versionsanzeige 85.0.
- `inventory_ui.js`: dynamische Lagerortfilter je Lager, Suche nach exakter Artikelnummer auch außerhalb von Filtern, vorgefüllte Zähl-Lagerorte inklusive unzugeordneter Artikel, Direktanlage per Enter, Schutz expliziter per-Artikel-Auswahl.
- `inventory_v85_core.js`: testbare reine Such-, Auswahl- und Vorschlagslogik.
- `local_backend.js`: Versionsantwort 85.0 und neue Hilfe direkt in der Anwendung.
- `hilfe/31-inventur-lagerort-schnellauswahl-v85.md`: Schritt-für-Schritt-Anleitung; `hilfe/25-alle-funktionen-index.md` erweitert.
- `service-worker.js`, `manifest.webmanifest`, `package.json`: Version und Cache 85.0.
- `tests_v85`: Unit- und Chromium-Integrationstests.
- Bisherige Prüfungen auf aktuelle V85-Version aktualisiert.

Keine Datenbankstrukturänderung und keine automatisierte Änderung vorhandener Artikelstammdaten bei der Suche.
