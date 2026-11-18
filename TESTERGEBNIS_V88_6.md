# Testbericht Lagerverwaltung V88.6

Datum: 18.11.2026

- 20/20 automatisierte Node-Tests mit der ORIGINAL-PDF bestanden.
- Beide vom Nutzer übermittelten Originaldateien sind byteidentisch (SHA-256: `a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b`).
- Katalogimport: 72 Seiten / 719 Materialpositionen ohne Browser-OCR; 76 Positionen zur manuellen Prüfung.
- Geänderte PDF mit gleichem Namen: zurückgewiesen, keine Katalog-Verwechslung.
- Neuer PDF-Export: 72 Seiten; alle 3.256.940 Originalbytes bleiben am Anfang der ausgegebenen PDF erhalten.
- Externer PDF-Leser (`pdfinfo`, PyMuPDF) kann die vollständige erzeugte Datei verarbeiten.
- Bildvergleich der Seiten 1, 2, 17, 36 und 72: Originalseiten sichtbar, nur zusätzlicher Text unterscheidet sich.
- Testmengen 12, 0, 1,5; Mengen links neben der Einheit gedruckt; Status „Noch nicht gezählt“ unangetastet.
- Techniker und Datum an den vorgesehenen Stellen unter Zähler und Date; Signatur nicht beschrieben.
- Automatische Tests für Ersteinrichtung (leere DB, PDF, SAPUI5), Kandidatenabgleich, Zurückstellen, Wiederaufnahme und Bestandschutz bestanden.
- Eine absichtlich veränderte PDF wird zum Schutz vor falscher Positionierung zurückgewiesen.

**Grenze:** Der vollständige produktive App-Ablauf auf dem Smartphone/PC konnte hier nicht im Browser bestätigt werden. Der lokale Chromium-Test wurde durch Umgebungsrichtlinien blockiert; dies ist kein bestandener Browser-Praxistest. Besonders den ersten Export auf dem Gerät visuell kontrollieren.
