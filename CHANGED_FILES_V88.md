# Lagerverwaltung Lovrencic – Version 88.1 (OCR-Korrektur)

**Stand:** 18.11.2026  
**Basis:** V88.0 und bereits vorhandene Dateien aus V87.1.  
**Release-Typ:** direkt hochladbare Aktualisierung des bestehenden GitHub-Repositories.

## Reparatur des Smartphone-PDF-Imports

1. **Verfrühter Abbruch entfernt:** V88.0 hat bei einer grob auf 96 × 132 Pixel verkleinerten Vorschau die Meldung „Die gescannte Seite ist leer/fast weiß“ ausgelöst. V88.1 erkennt dies nur noch als Verdachtsmoment. **Die OCR läuft trotzdem an.**
2. **Feinere Bildprüfung:** Die Stichprobe umfasst nun 256 × 352 Pixel und erkennt auch hellere Grautöne. Sie ist nicht mehr die alleinige Import-Sperre.
3. **Zwei Erkennungsversuche:** Bei unvollständigem Text wird zusätzlich die kontrastverstärkte Variante verarbeitet. V88.1 wählt den plausibleren Datensatz, ohne Artikelnummern zu erfinden.
4. **Kein unnötiges erneutes Auswählen:** Bei einem erneuten Versuch hält der Dialog die zuletzt ausgewählte Datei nur im Arbeitsspeicher, solange die Seite geöffnet ist. Alternativ lässt sich eine andere Datei wählen.
5. **Sicherer Abbruch bleibt erhalten:** Werden trotz beider OCR-Läufe keine Artikelpositionen erkannt, stoppt der ursprüngliche Scanner mit einer technischen Fehlermeldung. Keine unbestätigten Artikel-/Bestandsbuchungen.
6. **PWA-Aktualisierung:** Neues Cache-Kennzeichen und Versionsanzeige 88.1.

## Austauschdateien

- `v88_ocr.js` – Verhindert den falschen „weiße Seite“-Abbruch.
- `service-worker.js` – Lädt V88.1 und hält beim erneuten Versuch die ausgewählte PDF fest.
- `manifest.webmanifest` – Version 88.1.
- `test_v88.cjs` – regressionstests inklusive früherer 88.0-Prüfungen.
- `README_GITHUB_UPLOAD_V88.txt` – Anleitung.
- `CHANGED_FILES_V88.md` – dieser Text.
- `TESTERGEBNIS_V88.md` – Testergebnis.

## Grenzen

Der reale gescannte RONDO-Beleg und ein vollständiger Import auf dem Android-Smartphone waren bei dieser Korrektur nicht als Testmaterial verfügbar. Die Korrektur beseitigt den **vorzeitigen Heuristik-Abbruch**; sie garantiert nicht, dass alle 719 Materialpositionen ohne manuelle Korrektur erkannt werden. Die Sichtprüfung vor der Übernahme bleibt verpflichtend. Keine Migration oder Löschung der bestehenden Datenbank.
