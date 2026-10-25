# Änderungen gegenüber Version 77

Laufende Anwendung:
- `index.html`: sichtbare Version 78.0, Excel-Einlesen, gemeinsame Liefer-Vorschau, Lieferbestätigung, Smartphone-Karten.
- `order_excel_core.js`: neue Erkennung der kleinen und großen Materialanforderungs-Excel.
- `service_pdf_core.js`: Datum aus Dateinamen, numerische Mengen ohne Einheitenabfrage, gemeinsame Kunden-/Datumsprüfung, V77-Kompatibilität.
- `service_pdf_backend.js`: Historienabgleich vor PDF-Entnahme, Bestätigung möglicher Wiederholungen, Schutz vor identischen Dokumenten innerhalb desselben Stapels.
- `service_pdf_ui.js`: vorausgefüllte Datumsfelder, Anzahl ohne Einheiteneingabe, frühere Buchungen und zusätzliche Bestätigung anzeigen.
- `service_pdf_reader.js`: versionsunabhängiger Ladehinweis.
- `local_backend.js`: Versionsfolge 78, aktualisierte Hilfe, geschützte Excel-Einbuchung über die gemeinsame Lieferschnittstelle und Wiederholung nach Speicherfehler.
- `manifest.webmanifest`, `service-worker.js`: Installationsanzeige und Cache-Version 78, neues Excel-Modul berücksichtigen.
- `hilfe/04-einbuchung.md`, `hilfe/18-servicebericht-pdf.md`, `hilfe/19-bestell-excel.md`: Bedienungsanleitung.

Entwicklung/Lieferung: `package.json`, `package-lock.json`, `tests/`, `README_V78.md`, `TEST_RESULTS_V78.md`, diese Änderungsliste.

`vendor`, Datenbank-Dateiformat, bestehende Artikel und historische Buchungen werden nicht ersetzt. V77-Importkennungen bleiben erhalten. Keine mitgelieferten Nutzerdaten.
