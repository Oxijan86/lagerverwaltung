# V88.15 — Testergebnisse

Datum: 19.11.2026

- 114 von 114 automatisierten JavaScript-Tests bestanden.
- Die frühere fehlende Abhängigkeit wird im Regressionstest reproduziert;
  nach dem synchronen Laden ist `LVInventory` verfügbar.
- Die erzeugte HTML-Reihenfolge enthält den Lagerort-Kern und den
  Inventur-Fortsetzungsschutz *vor* dem synchronen `inventory_ui.js`.
- Bei zwei laufenden Inventuren wird die ausdrückliche Auswahl verlangt;
  eine neue Inventur wird nicht angelegt und keine bestehende abgebrochen.
- Frühere RONDO-PDF-, Zuordnungs-, Speicher- und Stammdaten-Regressionstests
  wurden erneut ausgeführt.
- Chromium-Starttest wurde versucht, aber die Testumgebung lieferte wegen
  Start-/Timeoutproblemen kein verwertbares Ergebnis. **Nicht bestanden gemeldet,
  sondern als nicht abgeschlossen gekennzeichnet.**
- Test im tatsächlich installierten GitHub-Pages-Browser steht noch aus.

Wichtig: Keine Benutzerdatenbank/IndexedDB löschen. Vor der erneuten Fortsetzung
Versionsanzeige V88.15 kontrollieren.
