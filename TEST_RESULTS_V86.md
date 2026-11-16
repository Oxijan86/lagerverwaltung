# V86-Testbericht

Prüfstand: 16.11.2026, Testdaten. Produktivdatenbank und OneDrive nicht verbunden.

- `npm test`: **91/91 Tests bestanden**, **0 Fehler**.
- `npm run test:syntax`: **34 JavaScript-Dateien bestanden**, zusätzlich HTML-/PWA-/Backend-Versionsprüfung.
- `python tests_v85/test_inventory_browser.py`: Chromium **390 px und 1280 px**, Filter, Kisten-/Lagerortauswahl, Zählen/Nachzählen, Fokus nach Enter, individuelle Ortszuordnung.
- `python tests_v86/test_browser_v86.py`: Chromium **390 px und 1280 px**, Einbindung der Firmenlisten-Oberfläche, Quell- und Ziellager, Lagerortoptionen, Vorschau, Bestätigung/Revision, kein JavaScript-Laufzeitfehler.

Wichtige getrennte Prüfszenarien: erste Migration aus alten Einzel-Lagerortbeständen; Umbuchen eines Teils aus einem Fach; Umlagern aller Teilbestände eines ausgewählten alten Lagers; Untersagung leerer Quelle; Abbruch bei veralteter Revision oder unbekanntem Ziel; Gesamtbestand unverändert; Mengenaufteilung bei Inventur; derselbe Artikel an mehreren Lagerorten über Filter auffindbar; keine Doppelzählung bei mehreren SAP-Zeilen je Material.

**Offen für Praxistest:** originale Nutzer-`lager.db`, reales PDF/Fotoscannergebnis, tatsächliche OneDrive-Rechte und gleichzeitige Änderungen auf zwei Geräten. File-System-Ordner kann keine echte Cloud-Server-Sperre garantieren.
