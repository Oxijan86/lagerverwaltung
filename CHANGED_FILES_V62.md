# Geänderte Dateien V62

- `index.html`
  - Startdialog um direkte Ordnerfreigabe ergänzt
  - Anzeigezustände für `permission_denied` korrigiert
  - `LVStartup.reauthorizeCloud()` ergänzt
  - Version auf 62.0 aktualisiert
- `local_backend.js`
  - Version/database_version auf V62 aktualisiert
  - eingebettete Hilfe aktualisiert
- `manifest.webmanifest`
  - Version/Name auf V62
- `service-worker.js`
  - neuer V62-Cache
- `package.json`
  - Testpaket auf V62
- `hilfe/12-mobile-bedienung.md`
- `hilfe/13-fehlerbehebung.md`
- `README_V62.md`
- `tests/startup-permission.spec.js`

Bestehende SQLite-Schemata, Buchungen, Artikel, Auditdaten, Backup- und Synchronisationslogik wurden nicht destruktiv verändert.
