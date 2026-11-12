# V84 – Änderungen

- `inventory_v84_core.js` – Mengenprüfung, Addieren und Zählbereich-Regeln (neu).
- `inventory_ui.js` – Sortimo-Zählbereich, Schnell-Suche, Nachzählen und manuelle Cloud-Option.
- `index.html` – responsive Eingabefelder und Version 84.0.
- `local_backend.js` – während laufender Inventur keine automatische Cloud-Synchronisierung bei manueller Präferenz; Offline-Hilfe aktualisiert.
- `sync_ui_v81.js` – unterdrückt Inventur-Popup, zeigt Status weiterhin an.
- `service-worker.js`/`manifest.webmanifest` – Cache- und PWA-Versionswechsel.
- `hilfe/14-inventur.md` und `hilfe/30-inventur-sortimo-und-nachzaehlung-v84.md` – ausführliche Anleitung.
- `package.json`, `package-lock.json`, `tests_v80`, `tests_v83`, `tests_v84` – Version und Testabdeckung.

Keine Artikel, Buchungen oder Tabellen aus einer bestehenden `lager.db` werden absichtlich gelöscht.
