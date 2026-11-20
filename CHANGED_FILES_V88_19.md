# V88.19 – Wieder funktionierende JSON-Pruefstandsicherung

- `v88_4_export.js`: JSON-Export von der speichernden API-Validierung getrennt. 
  Exportiert den aktiven Pruefstand als unveraenderte JSON-Kopie und arbeitet auch bei roten/ungeprueften PDF-Positionen.
  Download wird unmittelbar im Klick aufgerufen, keine asynchrone Browser-Aktivierung geht verloren.
  Erfolg/Fehler steht direkt am Download-Button und unten im Statusfeld.
- `service-worker.js`: neuer Cache-Name und `?v=88.19`, damit keine alten V88.18-Skripte verwendet werden.
- `test_v88_19.cjs`: Positivtest fuer offene Position, Negativtest fuer Download-Fehler, Cachetest.
- KEINE Aenderung am DB-Schema, Lagerbestand, Inventurstand oder OCR-Autoverknuepfung.
