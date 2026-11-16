# V86.0 – Geänderte/ergänzte Dateien

- `stock_bins_v86.js` (NEU): SQLite-Teilbestände, Erstübernahme alter Istbestände, Umlagerungshistorie, geprüfte Transaktionen, Inventurverteilung, Sicherheits- und Revisionsprüfungen.
- `stock_bins_v86_ui.js` (NEU): Lagerorte & Umlagerung, Fahrzeugwechsel/Sammelumzug, Vorschau/Bestätigung, Tabelle/Filter.
- `inventory_company_v86.js` (NEU): SAP-Excel/CSV als reiner Inventurvergleich und zweiblättriger Export.
- `inventory_core.js`: Bin-Signaturen, Schutz gegen veraltete Inventurdaten und unvollständige Mehrlagerortzählungen, neues Vergleichsdatenmodell.
- `inventory_ui.js`: Schnelle Zählung und Suche, Enter-Fokus, bewusst bestätigte Lagerortänderung, Teilmengen, Firmenlistenanzeige, neue Artikel, Artikel-Direktlink.
- `inventory_v85_core.js`: Inventurlagerort-Schnellauswahl einschließlich sekundärer und weiterer tatsächlicher Lagerorte.
- `material_booking_v83_ui.js`: Materialbuchungsbeleg-Import eindeutig im Bereich Einbuchung; klassische Excel-Entnahme bleibt als Sonderfunktion.
- `local_backend.js`: Initialisierung und Migration der Teilbestände, REST-Endpunkte, revisionsgesicherte Persistierung und erweiterte Offline-Hilfe.
- `sync_merge_v81.js`, `sync_merge_v82.js`: Neue Bin-/Umlagerungs-/Inventurvergleichstabellen bei Synchronisierung und Konfliktprüfung konservativ mitprüfen.
- `index.html`: V86-Navigation, Umlagerungs-Ansicht, SAP-Abgleich in laufender Inventur, neue Inventurknöpfe und der Materialbeleg im Einbuchungsbereich.
- `service-worker.js`, `manifest.webmanifest`, `package.json`, `package-lock.json`: Version, Ressourcen, Cache.
- `hilfe/00-erste-schritte.md`, `hilfe/19-datenimport-uebersicht.md`, `hilfe/25-alle-funktionen-index.md`: V86-Hinweise.
- `hilfe/32-mehrere-lagerorte-und-fahrzeugwechsel-v86.md` (NEU).
- `hilfe/33-inventur-firmenabgleich-und-schnellzaehlung-v86.md` (NEU).
- `hilfe/34-materialbuchungsbeleg-einbuchung-v86.md` (NEU).
- `tests_v86/test_stock_bins_v86.test.cjs` (NEU): 12 zusätzliche Tests und Integration der vorhandenen Tests.
- `tests_v86/test_browser_v86.py` (NEU): Browserintegration für Lagerort-Umlagerung.
- Anpassungen der Versions-/Oberflächentests in `tests_v80`, `tests_v83`, `tests_v85`.
