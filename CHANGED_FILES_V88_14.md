# V88.14 – Aenderungen

- **Neu** `v88_14_report.js`: Bericht fuer im RONDO-Inventurbeleg nicht aufgefuehrte Artikel, getrennte OCR-Risikozeilen, Bestand und Zaehlstatus; Export Excel-kompatible CSV.
- **Erweitert** `v88_4_export.js`: Download-Button und Inventur-/Artikelstammabgleich im PDF-Exportdialog; keine Zaehlungsbuchung.
- **Korrigiert** `service-worker.js`: ungueltige Offline-Importer-URL in `patchV885Ui`; separates Berichtsmodul vor Export geladen; neuer Cache und Version.
- **Aktualisiert** `v88_ocr.js`, `manifest.webmanifest`, `v88_4_help.js`: V88.14-Anzeige und Bedienhinweise.
- **Ergaenzt** `test_v88_14.cjs`: echte Original-PDF mit 72 Seiten, Seite-4-USB-Test, OCR-Verwechslung, Bericht, Formel-Injection-Schutz und Test mit hochgeladener JSON-Wiederherstellungsdatei.
- V88.13-Korrekturen von Gesamtmenge, bestaetigten Lagerorten, manueller PDF-Zuordnung und sicherer OCR-Stammdatenkorrektur bleiben enthalten.

**Kein automatisches Editieren oder Loeschen der vorhandenen lager.db durch Installation.**
