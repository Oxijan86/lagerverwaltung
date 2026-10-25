# Prüfprotokoll – Version 79.0

Stand: 25.10.2026. V79 ergänzt die Funktionen von V78 um Sollbestandsfilter.

## Automatisierte Prüfung

- `npm test`: **26 Tests bestanden, 0 fehlgeschlagen**. Darunter die 20 vorhandenen V78-Tests und 6 neue Tests für Mindest-/Sollbestand, unveränderte Standardregel, Null-/Gleichheitsgrenzen, Dezimalmengen, Suchkombination und inaktive Artikel.
- `npm run test:syntax`: alle 22 Programm-JavaScript-Dateien, 3 eingebettete Skripte sowie die Browser-Prüfskripte erfolgreich kompiliert. Lokale Skriptpfade und Versionsanzeigen passen zu V79.
- `git diff --check`: ohne Fehler.

## Bedienprüfung in Chromium 153

Die laufende Anwendung wurde mit echter SQL.js-/IndexedDB-Speicherung über HTTP geöffnet. Einrichtungs- und Testdaten wurden in einer separaten Browser-Testumgebung erzeugt; keine persönliche Lagerdatenbank wurde verändert.

| Prüfung | Ergebnis |
| --- | --- |
| Ist 4 / Mindest 5 / Soll 10 | Regulärer Vorschlag 6, Dashboard-Unterbestand 1 |
| Mindest auf 2 über die Artikeloberfläche abgesenkt | Regulärer Vorschlag verschwindet; unter Soll bleibt der Artikel mit Fehlmenge 6 sichtbar |
| „Unter Sollbestand“ im Lagerbestand | Artikel unter Soll einschließlich Mindest 0 sichtbar; volle und inaktive Artikel ausgeschlossen |
| Suchbegriff + Bestandsfilter | Passende Teilnamen werden innerhalb der gefilterten Artikel gefunden |
| Ungespeicherte Grenzwerte und Filterwechsel | Eingaben bleiben beim Hin- und Zurückwechseln erhalten |
| Materialanforderung im Standardmodus | Nur unter Mindestbestand; nach dem Absenken im Test keine regulären Vorschläge |
| Materialanforderung im Sollmodus | Drei Testartikel, vorgeschlagene Mengen 6 / 6 / 5, Ist/Soll/Mindest sichtbar |
| Vorschau und tatsächliche Excel-Ausgabe | In der Originalvorlage Mengen 6 / 6 / 5 und zugehörige Artikel A / B / D korrekt gespeichert |
| Bearbeitete Mengen beim Moduswechsel | Abbrechen erhält die Menge; Bestätigung lädt die neue Vorschlagsart |
| Datenvergleich nach Filter und Export | Istbestände und Sollwerte aller Artikel unverändert; nur die ausdrücklich gespeicherte Mindeständerung des Testartikels übernommen |
| Smartphone-Ansicht mit 390 × 844 Pixel | Filter, Fehlmengen und Bestellmengen direkt erreichbar; beide Ansichten visuell kontrolliert |
| Upgrade von echter V77-Ausführung auf V79 im selben Browser | 3 Artikel, 6 Buchungen, Bestände und Artikelfelder erhalten; keine erneute Einrichtung; alte PDF-Importkennungen weiterhin erkannt |

## Grenzen

Die Smartphone-Ansicht ist eine Chromium-Simulation, kein Test auf einem echten Android-/iOS-Gerät. Cloud-Synchronisation, OCR und Service-Worker-Updates wurden für diese Änderung nicht erneut vollständig geprüft. Die V78-Prüfungen sind separat in `TEST_RESULTS_V78.md` dokumentiert.

Die konkrete frühere Änderung im Nutzerbestand ist ohne dessen `lager.db` nicht nachprüfbar. Das berichtete Verhalten wurde anhand der bisherigen Programmregel und mit Testdaten reproduziert. Es gibt weiterhin keine automatische Verwaltung offener Bestellmengen.
