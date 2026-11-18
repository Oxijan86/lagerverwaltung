# Testbericht Version 88.5

**Stand:** 18.11.2026

### Ausgeführte Tests

- `RONDO_ORIGINAL_PDF=".../Inventurliste Lovrencic 1025.pdf" node --test test_v88_4.cjs test_v88_5.cjs` → **38 von 38 Tests bestanden**, keine übersprungen.
- JavaScript-Syntaxprüfung: `service-worker.js`, `v88_5_import.js`, `v88_ocr.js`, `v88_4_help.js`, übrige aktualisierte Skripte bestanden.
- Original-PDF: SHA-256 stimmt mit dem eingebauten Katalog überein; **72 Seiten, 719 Artikelpositionen, 76 Prüfhinweise**.
- Bestehender V88.4-Cache-Sonderfall: zuvor markierte `v87_ui.js` wird in V88.5 trotzdem erweitert; altes OCR wird bei identischer Original-PDF umgangen.
- HTML bereits mit älterem Service-Worker-Boot versehen: alte Skripteinbindungen werden ersetzt, es entsteht keine doppelte neue Einbindung.
- Vorsätzlich veränderte, aber gleichnamige PDF wird nicht fälschlich dem Originalkatalog zugeordnet.
- Browser-Smoketest mit der echten PDF als `File` in Chromium: Katalogaufnahme mit **719 Positionen und 76 Warnpositionen**. Für die SHA-256-Testbrücke wurde die tatsächliche Datei-Hashsumme zuvor unabhängig in Node bestätigt; damit kein vollständig authentischer HTTPS-Service-Worker-End-to-End-Test.
- Export-Regression: Gezählte `0` bleibt druckbar und nicht gezählte Einträge bleiben leer; kein Inventurabschluss-Aufruf durch PDF-Ausgabe.

### Grenzen

Die installierte PWA auf dem Anwender-PC/Smartphone sowie Cloud-Synchronisierung und vollständiger RONDO-PDF-Rückexport wurden hier nicht als E2E-Ablauf geprüft. Für vom Original abweichende PDFs bleibt die allgemeine Browser-OCR-Implementierung bestehen und kann weiterhin unvollständige Erkennung liefern.
