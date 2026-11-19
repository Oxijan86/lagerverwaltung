# Lagerverwaltung Lovrencic V88.16 – Änderungen

## Behebung des weißen RONDO-PDF-Exports

Die vom Anwender hochgeladene Ausgabe `RONDO_Inventur_2026_ausgefuellt.pdf` enthält zwar 72 Seiten, aber nur ein gerastertes Bild je Seite und nicht mehr die ursprünglichen vier RONDO-Bildobjekte pro Seite. Der historische `v87_pdf.js`-Canvas-Rasterweg hatte die Originalvorlage verloren.

- **Neu: `v88_16_export_guard.js`** fängt den PDF-Exportknopf in der Capture-Phase ab, bevor der alte `onclick`-Handler reagieren kann. Keine Ausgabe ohne `LV884Export`, `LV886PDF` und überprüften PDF-Snapshot.
- Die `lv87-rondo-pdf`-IndexedDB wird nur lesend geöffnet. Ein manuelles PDF-Mapping wird separat und positionsgenau geschrieben.
- Die Original-PDF (SHA-256-Prüfung) muss mit allen 719 Positionen vorliegen; die Ausgabe wird über `v88_6_pdf.js` inkrementell auf den unberührten Originalbytes aufgebaut.
- Die bisherige V88.15-Sicherung und Inventur bleiben erhalten, eine neue Inventur wird nicht automatisch erstellt.

## Nachträgliche manuelle OCR-Zuordnung

- **`v88_13_pdf_match.js`**: Kandidaten werden anhand von Artikelnummer und Bezeichnung vorgeschlagen. „I“ und „1“ werden nur als ähnliche Zeichen behandelt, nie stillschweigend ersetzt. Bei möglichen Differenzen zur OCR-Referenzliste bleibt eine Bestätigung erforderlich.
- **`v88_4_export.js`**: Checkbox „Auch bereits zugeordnete PDF-Positionen anzeigen“ plus gezielte Suche nach Bezeichnung, Artikelnummer und PDF-Seite; für jede einzelne Position lässt sich ein vorhandener Artikel auswählen. Angebote zeigen zusätzlich den Buchbestand und Zählstand.
- `manual_link` und `linked_article_id` werden überprüft und dauerhaft im PDF-Snapshot gespeichert. Exakt eine geänderte PDF-Position pro Bestätigung.
- Die OCR-Referenzliste wird ausdrücklich nur als Hinweis behandelt; ein vorhandener gezählter Artikel mit exakt passender Materialnummer wird bei I/1-Konflikten nicht zugunsten der automatisch erkannten Ziffer unterdrückt.
- Die Funktion zum Prüfen falsch angelegter OCR-Stammdaten bleibt vorhanden und erfordert Backup sowie Prüfung auf Bestand/Buchungen.

## Gesonderte Korrektur eines falsch zugeordneten Inventur-Zählstandes

- **`service-worker.js`**: neuer abgesicherter Inventory-Core-Endpunkt `ocr-transfer-count`.
- Nur auf ausdrückliche doppelte Bestätigung, nur bei laufender Inventur, übereinstimmender Datenbank-ID/Version, vorhandener Quellzählung und bisher leerer Zielzählung.
- Vor der transaktionalen Übertragung wird ein Sicherheitsbackup erstellt.
- Kopiert nur Zählmenge, Lagerort und Teilmengen in die Zielzählung; löscht den Quellzählwert; erhöht die Inventurversion; protokolliert die Korrektur. Bestehende Bestände, Artikel und Bewegungen werden NICHT verändert.
- Für den konkreten USB-Stick `I1000339` ist nach Sichtprüfung der Originalseite in der Regel **keine** Mengenübertragung nötig – nur die manuelle PDF-Zuordnung zum bereits gezählten I-Artikel.

## Version / Bestandsschutz

- `service-worker.js` mit neuem Cache und kontrollierter Lade-Reihenfolge.
- `manifest.webmanifest`, `v88_ocr.js`, `v88_4_help.js` auf V88.16 aktualisiert.
- Kein Benutzerbestand und keine Original-PDF werden im GitHub-ZIP mitgeführt.
