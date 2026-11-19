# Lagerverwaltung Lovrencic V88.15 — Startkorrektur

## Ursache
In V88.14 wurde `inventory_ui.js` als synchrones Skript ausgeführt, bevor die
neue Abhängigkeit `v88_11_location_core.js` aus dem *deferred* Footer-Skriptpaket
verfügbar war. Dadurch war `window.LVInventory` nicht definiert und der App-Start
beziehungsweise der Klick auf „Laufende Inventur fortsetzen“ schlug fehl.

## Änderungen
- `service-worker.js`: Lädt den Lagerort-Kern **synchron vor** `inventory_ui.js`.
  Der Schutz für die Inventurfortsetzung wird ebenfalls vor dem Inventur-UI
  geladen. Beide Module werden nicht doppelt im Footer geladen.
- `v88_7_inventory_guard.js`: Bei **mehreren laufenden Inventuren** wird keine
  neu angelegt, keine abgebrochen und keine automatisch als die richtige
  vorausgesetzt. Die Anwendung fordert zur ausdrücklichen Auswahl im Dropdown auf.
- `v88_ocr.js`, `v88_4_help.js`, `manifest.webmanifest`: Versionsanzeige V88.15.
- `test_v88_15.cjs`: Regressionstests für Startreihenfolge, reproduzierten
  Fehlerfall und mehrere laufende Inventuren.

Die Funktionen aus V88.14 (RONDO-PDF, OCR-Schnellzuordnung, Firmen-Zusatzliste,
Artikelstammkorrektur, Lagerort-/Mengenschutz) bleiben enthalten.

Es gibt **keine Datenbankmigration** und keinerlei automatische Lagerbuchung.
