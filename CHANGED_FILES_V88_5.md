# Lagerverwaltung Lovrencic V88.5 – PDF-Import-Reparatur

## Ursache und Reparatur

Die Fehlermeldung **„Seite 1: 0 Wortpositionen und 0 Textzeichen“** stammt aus dem alten Browser-OCR-Pfad. Obwohl Version V88.4 bereits einen separat geprüften Katalog für die Original-RONDO-PDF enthält, wurde in der gemeldeten Installation offenbar weiterhin der alte OCR-Pfad durchlaufen.

Die genaue Ursache dieser konkreten Installation ist aus einem Bildschirmfoto allein nicht abschließend bestimmbar. Der Quellcode zeigte jedoch zwei nachgewiesene Schwachstellen:

1. **Vorherige Service-Worker-Ausgaben** konnten ein bereits ergänztes HTML-Dokument aus dem Cache liefern. Die bisherige HTML-Einbindung erkannte nur die alte Boot-Markierung und übersprang dadurch das Nachladen der nächsten Module.
2. **Bereits durch einen älteren Service Worker veränderte `v87_ui.js`-Dateien** wurden aufgrund des vorhandenen Patch-Markers vollständig von weiteren Korrekturen ausgenommen.

## V88.5 behebt beide Pfade

- `service-worker.js`: Neuer Cache, versionierte Skript-URLs, zuverlässige Entfernung alter automatisch eingefügter Skriptblöcke und idempotenter Import-Patch auch für früher veränderte V88.1/V88.4-Skripte.
- `v88_5_import.js`: Prüft die PDF **vor jeder OCR** anhand der tatsächlichen SHA-256-Summe. Die mitgetestete Original-PDF wird aus `v88_2_catalog.js` mit 719 Positionen auf 72 Seiten geladen, unabhängig vom fehlerhaften Browser-OCR-Ergebnis.
- Der Katalog wird bei Bedarf ausdrücklich nachgeladen, falls er im alten Cache fehlt.
- Wenn eine gleichnamige, aber byteweise andere PDF ausgewählt wird, erscheint eine eindeutige Meldung mit den Prüfsummenanfängen. Ein fremder Scan wird niemals automatisch auf den bekannten Katalog abgebildet.
- Andere PDFs verwenden weiterhin die normale OCR (deren allgemeiner Null-Treffer-Fehler wurde mit diesem Update **nicht** grundlegend repariert).
- `manifest.webmanifest`, `v88_ocr.js`: Version 88.5.
- `v88_4_help.js`: Hinweise zur Datei-Erkennung und Versionskontrolle.

## Bestandsschutz

- Das Laden des Katalogs bewirkt weder Lagerbuchungen noch Inventurabschluss.
- 76 unsichere Materialpositionen bleiben ausdrücklich zur Prüfung markiert.
- Inventur-Zwischenstände und PDF-Druck sind weiterhin möglich. Bestände werden erst bei ausdrücklichem Inventurabschluss aktualisiert.
- Bestehende Dateien, Datenbanken, Browserdaten, Backups und Cloud-Stände werden nicht gelöscht oder migriert.

## Grenzen

Der reale Import wurde mit der vom Nutzer bereitgestellten Original-PDF und dem versionsgebundenen Katalog in Node getestet. Die Browser-Dateieingabe und Katalogdarstellung wurden zusätzlich automatisiert in Chromium geprüft. Ein vollständiger End-to-End-Test in der produktiven installierten PWA auf dem Nutzergerät einschließlich GitHub-Pages-Cache, Cloud-Synchronisierung und 72-seitigem PDF-Rückexport ist damit noch **nicht** ersetzt.
