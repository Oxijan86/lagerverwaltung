# Lagerverwaltung Lovrencic – Version 88.0

**Release:** 18. November 2026  
**Repository:** `Oxijan86/lagerverwaltung`  
**Basiert auf:** GitHub-Hauptzweig mit den bereits vorhandenen V87.1-Modulen

## Direkt hochzuladende Dateien

| Datei | Funktion |
|---|---|
| `service-worker.js` | Neuer PWA-Cache, Nachladen von V87/V88, geschützte Anpassung der vorhandenen V87-PDF-Verarbeitung zur Laufzeit |
| `v88_ocr.js` | Zweiter OCR-Erkennungsweg, Bildprüfung, sichere Zuordnung und Bestandsschutz |
| `manifest.webmanifest` | Versionsanzeige V88.0 |
| `test_v88.cjs` | Automatisierte Regressionstests |
| `README_GITHUB_UPLOAD_V88.txt` | Uploadanleitung und Grenzen |
| `CHANGED_FILES_V88.md` | Diese Versionsdokumentation |
| `TESTERGEBNIS_V88.md` | Prüfnachweis |

## Sicherheitsverhalten

- Vorhandene Datensätze werden nicht gelöscht, migriert oder automatisch umgebucht.
- PDF-OCR liest ausschließlich die RONDO-Inventurliste mit 72 Seiten; andere PDFs werden im bestehenden V87-Lesemodul durch den V88-Patch zurückgewiesen.
- Die 719 erwarteten Positionen müssen vollständig und eindeutig sein. Fehlerhafte oder unsichere Zeilen bedürfen einer manuellen Prüfung.
- Eine ungezählte Menge ist **null**, nicht die Zahl **0**.
- Der RONDO-Abgleich und das Ausfüllen der Original-PDF aus V87 bleiben erhalten.

## Technischer Hinweis

Das Update ersetzt die große `index.html` nicht und erfordert keinen separaten lokalen Build-Prozess. Bei durch den neuen Service Worker bedienten HTML-Navigationen werden die im bestehenden Repository vorhandenen `v87_core.js`, `v87_pdf.js`, `v87_ui.js` und der neue `v88_ocr.js` in dieser Reihenfolge geladen. Der bestehende V87-Scanner bekommt beim Ausliefern eine begrenzte, überprüfbare Quellcodekorrektur für seitenweise Datensicherung und strikte Dokumentkontrolle. Der GitHub-Hauptstand wird durch diese Paket-Erstellung nicht verändert.
