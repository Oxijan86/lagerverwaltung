# V85 Testergebnisse (12.11.2026)

- `npm test`: **79 automatisierte Tests bestanden, 0 fehlgeschlagen**. Umfasst alle bestehenden V80–V84-Tests sowie fünf neue V85-Such-/Kontexttests.
- `npm run test:syntax`: **31 JavaScript-Dateien** syntaktisch geprüft, Programm-/Backend-Version 85.0 und Cachekennung erfolgreich validiert.
- `python tests_v84/test_inventory_browser.py`: Chromium erfolgreich mit 390px und 1280px Ansichtsbreite; bestehende Sortimo-, Nachzählungs- und Suchfunktionen weiterhin geprüft.
- `python tests_v85/test_inventory_browser.py`: Chromium erfolgreich bei 390px und 1280px Ansichtsbreite; Lagerortfilter, alle/ohne Lagerort, exakte Suche außerhalb der Filter, neue Sortimo-Kiste über Enter, Vorschlags-Vorausfüllung bei nicht zugeordnetem Artikel, Übernahme erst nach Zählung, Addition und individuelle Lagerortänderung geprüft.

**Einschränkungen:** Browserprüfungen verwenden eine simulierte API mit Beispieldaten. Kein Live-Test mit der produktiven `lager.db`, dem wirklichen OneDrive oder zwei zeitgleich synchronisierenden Geräten. Vor der produktiven Inventur die Datei sichern und neue Funktionen mit einer Kopie ausprobieren.
