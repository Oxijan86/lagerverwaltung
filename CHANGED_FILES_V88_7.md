# Version 88.7 – Änderungen

- **`v88_4_export.js`** (ersetzt): PDF-Ausgabe ruft ausschließlich `LV886PDF.render` auf. Alter `ctx.pdf.render`-Canvas-Export wird bewusst ignoriert. Abweichende oder unvollständig eingebettete Originalbytes blockieren den Download. Falls nötig, lädt die Anwendung `v88_6_pdf.js?v=88.7` gezielt nach.
- **`v88_7_inventory_guard.js`** (neu): sichere Fortsetzung einer offenen Inventur, gut verständliche Beschriftung, kein zweiter Entwurf und keine versehentliche Abbruch-/Erstellen-Verzweigung.
- **`service-worker.js`** (ersetzt): Version 88.7, aktualisierte Cache-Kennung, Einbindung des Guards und versionierte Module.
- **`v88_ocr.js`**, **`manifest.webmanifest`** (ersetzt): Versionsanzeige 88.7.
- **`v88_4_help.js`** (ersetzt): Hilfe zur Fortsetzung einer laufenden Inventur und zur Fehlerbehandlung bei PDF-Ausgaben.
- **`v88_6_pdf.js`**, **`v88_5_import.js`**, **`v88_2_catalog.js`**, **`v88_3_review.js`**, **`v88_3_setup.js`**: unveränderte V88.6-Funktionalität für verlustfreien Export, verifizierten Originalimport, Zeilenprüfung, offene Zuordnungen und SAPUI5-Ersteinrichtung; enthalten für Vollständigkeit beim GitHub-Upload.
- **`test_v88_7.cjs`**: eigenständig ausführbare Regressionstests ohne Firmen-PDF.

Die vorhandene `index.html` und `lager.db` werden durch diesen Upload nicht ersetzt; die unveränderte V86-App bleibt Grundlage. **Keine Datenbankmigration, keine automatische Inventur-Buchung.**
