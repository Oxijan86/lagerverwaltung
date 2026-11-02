# V80 – geänderte fertige Programmdateien

- `index.html` – Versionsanzeige, Maschinenbezeichnungen aus PDF, mobiles Scrollmenü, V80-Skripteinbindung.
- `local_backend.js` – Version 80 und an Artikel angehängte PDF-Maschinen-/Typkennungsinformationen.
- `service_pdf_backend.js` – per Position gültiges Ticket und Maschine, Speicherung von erkannten Typkennungen.
- `service_pdf_ui.js` – Materialregistrierung im PDF-Import, Einzelpositions-Maschinenfeld, Vorschau und Buchungsdaten.
- `service_pdf_v80.js` – neue Parser-Erweiterung für Untertickets und Typcodes.
- `v68_core.js` – Lagerbestands-Suche nach technischen Typkennungen.
- `service-worker.js` – neuer Cache-Name, aktualisierte Dateien.
- `manifest.webmanifest` – installierbarer App-Name V80.
- `package.json`, `package-lock.json` – konsistente V80-Entwicklungsangaben.
- `tests_v80/` – automatisierte Tests.

Die PDF-Bibliotheken und anderen Programmbestandteile bleiben im bestehenden Repository unverändert.
