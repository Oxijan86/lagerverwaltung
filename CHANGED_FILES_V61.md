# Geänderte Dateien in V61

- `local_backend.js` – vorhandene gültige Cloud-Ordner können sicher verbunden werden; beim bloßen Verbinden findet kein Cloud-Write statt.
- `index.html` – Smartphone-/Cloud-Workflow klarer benannt; vorhandene `lager.db` wird ausdrücklich als zulässiger Synchronisationsordner erklärt.
- `manifest.webmanifest` – Versionsangaben auf V61.
- `service-worker.js` – eigener V61-Cache.
- `package.json` – Version 61.0.0.
- `hilfe/12-mobile-bedienung.md` und `hilfe/13-fehlerbehebung.md` – bestehende Synchronisationsordner dokumentiert.
- `README_EINRICHTUNG.md` und `README_V61.md` – neue Verbindungslogik beschrieben.
- `tests/existing-cloud-folder.spec.js` – Regressionstests für vorhandene `lager.db`.
- bestehende Versions-/Cachetests – auf V61 angepasst.

Nicht verändert: die beiden Materialanforderungs-Excelvorlagen und die bestehenden Nutzdatentabellen.
