# Lagerverwaltung Lovrencic – V88.10 Änderungen

- `v88_10_inventory_focus.js` (neu): zusätzliche Runtime-Absicherung aller Inventur-Fokuswege; bereits gezählte Mengen können bei normaler Artikelsuche nicht unbeabsichtigt überschrieben werden. Leitet zur Zusatzmenge um. Freigabe einer Gesamtkorrektur nur bei tatsächlicher Bestätigung und nur bis zum Verlassen des Feldes.
- `service-worker.js`: V88.10 Cache-Busting und Einbindung des neuen Schutzmoduls nach `v87_ui.js`; Quellpatch aktiviert den explizit ausgewählten Lagerort automatisch. Die V88.9-Teilmengenlogik bleibt erhalten.
- `v88_4_help.js`: Bedienhinweise für automatische Lagerortwahl und sicheren Cursorwechsel.
- `v88_ocr.js` und `manifest.webmanifest`: Versionsanzeige V88.10.
- `test_v88_10.cjs` (neu): simulierte Fokus- und Eingabeereignisse einschließlich alter Suchfunktion, Nullzählung, bestätigter/abgebrochener Gesamtkorrektur und Einteilung A/B.
- Bestehende `test_v88_7.cjs`, `test_v88_8.cjs`, `test_v88_9.cjs`: Versionsabgleich auf V88.10, unveränderte Fachtests.
- Dokumentation `README_GITHUB_UPLOAD_V88_10.txt`, `TESTERGEBNIS_V88_10.md`.

Keine bestehenden `lager.db`-Daten, kein Reset von IndexedDB, keine Lagerbuchung beim Zählen, keine Änderung der Inventur-Abschlusslogik. Nicht enthalten: die unveränderte RONDO-Original-PDF und vorhandene Lagerdaten.
