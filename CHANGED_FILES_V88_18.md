# Lagerverwaltung Lovrencic V88.18 – PDF-Prüfstand und Zuordnung ohne Inventurabschluss

## Änderungen

- `v88_13_pdf_match.js`: Kandidaten umfassen ungezählte Lagerartikel. Bereits bestätigte Materialverknüpfungen gelten unabhängig vom Zählstand als zugeordnet; `0 Buchbestand` wird nicht als `0 gezählt` ausgegeben.
- `v88_4_export.js`: Suche im vollständigen Artikelstamm (auch noch nicht in der Inventur, auch 0 Bestand), 35 PDF-Positionen pro Seite mit Navigation, Statusanzeige, gezielte Direktbestätigung bei eindeutigen Vorschlägen, ausdrückliche Zuordnung, Rückstellung für später, bestätigungspflichtige Neuanlage nur mit Anfangsbestand 0, bestehende Inventur bei Neuanlage aktualisieren, Button zum expliziten Speichern des PDF-Prüfstands, JSON-Export und -Import mit PDF-Hash/Datenbank-ID/Positionsfolge-Check.
- `service-worker.js`: atomare Stapelsicherung und reine Zwischenspeicherung mehrerer oder keiner geänderten PDF-Zuordnungen; keine bestehende Inventur oder Bestandstransaktion wird hierbei abgeschlossen. Cache und versionierte URLs V88.18.
- `v88_17_bulk_ui.js`: Hinweise für noch nicht gezählte Lagerartikel und den Unterschied zwischen Verknüpfung und Zählergebnis.
- `v88_4_help.js`: Anleitung für PDFs mit offenen Mengen, Rückstellung und Datenkopie ergänzt.
- `v88_ocr.js`, `manifest.webmanifest`: Versionsanzeige V88.18.
- `test_v88_18.cjs`: spezielle Regressionstests, weitere vorhandene Tests auf V88.18 aktualisiert.

## Sicherheit

Ein in der Datenbank gebuchter Bestand 0 wird nicht automatisch als 0 gezählt ausgegeben. Nur eine ausdrücklich bestätigte Inventur-Nullzählung erzeugt die 0 im RONDO-PDF. Stammdaten-Neuanlage verwendet `initial_stock: 0` und übernimmt keine gezählte Menge. Ohne ausdrücklichen Inventurabschluss wird kein aktueller Lagerbestand aus der Inventur gebucht. `lager.db`-Backups enthalten den separat im Browser abgelegten PDF-Prüfstand nicht automatisch; hierfür die neue JSON-Exportsicherung verwenden.

## Offene Praxisprüfung

Ein vollständiger Chromium-Durchlauf in der Testumgebung ließ sich nicht zuverlässig abschließen. Nach Upload sind Bedienung und Browsercache auf dem realen PC zu prüfen. Kein Test auf der aktuellen, seit dem letzten Datenbankupload geänderten User-Datenbank durchgeführt.
