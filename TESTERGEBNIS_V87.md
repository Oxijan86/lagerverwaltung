# Prüfergebnisse – Lagerverwaltung Lovrencic V87

**Stand:** 18.11.2026. Basis GitHub V86 (Commit `dc2c6f8761167de4e07d99523b907c6a7a697b60`).

## Automatische Tests

- **15 von 15 automatisierten Tests bestanden** (`node --test`).
- Syntaxprüfung aller aktualisierten JS-Dateien (`node --check`) bestanden.
- Die OCR-Struktur von **Seite 1 und Seite 72** der vorliegenden 72-seitigen RONDO-Inventurliste wurde in Testfällen nachgebildet. Die erste Seite mit zehn Positionen wird erkannt; bei undeutlichen Codes und fehlenden Positionen zeigt die Logik Prüfbedarf statt erfundene Mengen.
- Unterschied zwischen `0` und „noch nicht gezählt“, Firmen-/App-Artikelabgleich, Doppelpositionen, Menge je Umlagerung sowie überzählige Teilmengen geprüft.
- Minimale PDF-Ausgabe des PDF-Schreibers mit einem JPEG-Hintergrund wurde anschließend mit PyMuPDF geöffnet: **eine gültige Seite mit Bild**.
- Eine Prüfung auf vorhandene V86-API-Pfade und Asset-/Service-Worker-Registrierung wurde bestanden.

## Einschränkungen

**Nicht vollständig getestet**: Die durchgängige OCR-Verarbeitung aller 72 gescannten Seiten im Browser, der tatsächliche Mehrgerätebetrieb mit bestehender produktiver `lager.db`, die komplette SAP-Anfangsbestandsübernahme, der exakte Druckversatz jeder RONDO-Seite und das reale Cloud-Konfliktverhalten. Ein Chromium-Testversuch wurde von der isolierten Umgebung mit `ERR_BLOCKED_BY_ADMINISTRATOR` verhindert.

Bei gescannten Belegen ist eine manuelle Artikelkontrolle zwingend vorgesehen. **Vor betrieblichem Einsatz bitte mit einer Kopie deiner Datenbank einen Probelauf durchführen**, insbesondere den PDF-Ausdruck überprüfen und die Freigabe durch RONDO klären.

## Veröffentlichung

Das Paket ist ein fertiges GitHub-Dateiupdate auf V86 ohne Installationsskript. Der unveränderte Backendkern meldet noch `86.0` über `/api/info`; in der Oberfläche wird das V87-Modul angezeigt. Eine eigenständige ZIP-Vollversion des gesamten V86-Repositorys ist dies nicht.
