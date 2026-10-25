# V79 gegenüber V78

- `app_rules.js`: Status unter Soll/Mindest, gemeinsame Filterregel, optionaler Sollmodus für Bestellvorschläge.
- `local_backend.js`: optionale Abfrage `GET /api/material-request?mode=target`, Hilfe und Versionsfolge 79.
- `index.html`: Lagerbestandsfilter, Fehlmengen, farbliche und textliche Kennzeichnung, Auswahl der Bestellregel, Schutz bearbeiteter Vorschauen, mobile Karten.
- `manifest.webmanifest`, `service-worker.js`: Version/Cache 79.
- `hilfe/03-lagerbestand.md`, `hilfe/06-materialanforderung.md`, `hilfe/20-sollbestand-filter.md`: Anleitung und Erklärung der bisherigen Regel.
- `package.json`, `package-lock.json`, `tests/`, V79-Dokumentation: Version, Tests und Prüfprotokoll.

Das Uploadpaket enthält zusätzlich sämtliche benötigten Änderungen aus V78, damit es direkt auf der vollständigen V77 installiert werden kann. Keine Änderung an `vendor` und keine mitgelieferte Nutzerdatenbank. Die Mindestbestandsregel des Dashboards bleibt erhalten.
