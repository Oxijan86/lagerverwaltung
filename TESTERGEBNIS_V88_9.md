# Testergebnisse V88.9

- Aufgerufen: `node --test test_v88_7.cjs test_v88_8.cjs test_v88_9.cjs`
- Ergebnis: **40 bestanden, 0 fehlgeschlagen**.
- Abgedeckt: reale SHA-256-Prüfung der originalen RONDO-PDF mit 72 Seiten und 719 Positionen; Regressionen zu PDF-Export, SAP-Startoptionen, Technikerhinweis, OCR-Artikelprüfung, Inventur-Fortsetzen.
- Neue Prüfungen: Hinzufügen in weiterem Zählort (5 + 3), erneutes Hinzufügen zu demselben Zählort, gleiche Ortsbezeichnung in verschiedenen Lagern, echte Zähl-Null, noch nicht zugeordnete alte Menge, gesperrte Zuordnung bei mehreren Orten ohne Auswahl, beschädigte Teilmengen, UI-Patch und Such-Feldwechsel, Versionsanzeige.
- `node --check` für Service Worker und neuen Kern erfolgreich.

**Einschränkung:** Der zusätzliche Headless-Chromium-Oberflächentest konnte in der aktuellen isolierten Umgebung nicht abgeschlossen werden (Browserlaufzeit-Timeout). Ein Praxistest in einer echten installierten GitHub-Pages-PWA ist weiterhin erforderlich. Deshalb keine Behauptung über vollständige Smartphone-Verifikation.
