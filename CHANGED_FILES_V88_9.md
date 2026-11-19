# Lagerverwaltung Lovrencic V88.9 – Änderungen

## Neu/angepasst

- **`v88_9_count_core.js` (neu):** Reine Zähl-/Lagerortlogik; schützt bestehende Teilmengen und unterscheidet Lagerorte anhand von Lager-ID und Ort. Verhindert unbestätigte Zuordnungen, beschädigte Teilzählungen und falsche Summen.
- **`service-worker.js`:** Version 88.9, neue Cache-Kennung. Der Artikelvorschlag führt bei bereits gezählten Artikeln zu **Weitere Menge**. Bindet die bestehende Inventurmaske an den neuen, lagerortbezogenen Zählweg an; erlaubt bewusste Gesamtkorrekturen. Keine Migration bestehender Datenbankdateien.
- **`v88_ocr.js`, `manifest.webmanifest`:** Versionsanzeige 88.9.
- **`v88_4_help.js`:** Hilfethema zur Mehrfachzählung an mehreren Lagerorten.
- **`test_v88_9.cjs` (neu):** Regressions- und Teilbestandsprüfungen.
- **`test_v88_7.cjs`, `test_v88_8.cjs`:** Alte Funktionen werden weiterhin getestet; Erwartungen für die neu angezeigte Version aktualisiert.

## Unverändert aus V88.8

RONDO-Import (719 Positionen/72 Seiten), Bestätigung OCR-Material, zurückgestellte Artikel, SAPUI5-Ersteinrichtung, Schutz vor irrtümlichem Inventur-Neustart, verlustfreier Original-PDF-Export, Technikerhinweis beim reinen Artikelimport.

## Besondere Sicherheitsregeln

1. Bereits gezählte Menge wird durch die schnelle Artikelsuche nie ersetzt.
2. Bei zusätzlichem Fund bleibt der ursprüngliche Zählort mit seiner Teilmenge erhalten.
3. Neue Lagerorte werden nicht ohne Bestätigung als Stammdaten angelegt.
4. Bei mehreren möglichen Zählorten muss der konkrete Ort ausgewählt sein.
5. Erst Inventurabschluss = echte Bestandsänderung. PDF-Export und Zwischenspeicherung sind keine Lagerbuchung.
