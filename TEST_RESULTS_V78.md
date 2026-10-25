# Prüfprotokoll – Version 78.0

Stand: 25.10.2026. Basis: veröffentlichter V77-Commit `230346f`.

## Automatisierte Tests

`npm test`: **20 Tests bestanden, 0 fehlgeschlagen**.

Geprüft:
- Leistungsdatum aus achtstelligem Datumsblock beziehungsweise 14-stelligem Exportzeitstempel, inklusive Screenshot-Beispiel, Schaltjahr, ungültigen und fehlenden Daten.
- Dateinamen-Datum hat Vorrang vor altem Ticket-Meldedatum und Tabellenzeilen; ungültige Daten werden nicht in den Folgemonat verschoben.
- Material-/Dienstleistungsabgrenzung und fehlende Einheiten.
- Exakte Dezimalmengen ohne Einheitenvergleich oder Rundung; Stammdaten-Einheit wird verwendet.
- Identischer Import, umbenannter/reexportierter Inhalt und doppelte Dokumente im selben Stapel verursachen keine zweite Entnahme.
- Importkennungen aus V77 bleiben geschützt.
- Kunden-/Datumsabgleich normalisiert Schreibweise, Akzente und Leerzeichen und verlangt eine zusätzliche Bestätigung bei Überschneidungen.
- Neue Überschneidung während des Sicherheitsbackups wird vor der Buchung erneut erkannt.
- Ungenügender Gesamtbestand, Datenbankwechsel und Speicherfehler; keine Teilbuchung bei fehlendem Bestand und keine erneute Entnahme beim Wiederholungsversuch.
- Speicherung/erneutes Öffnen der SQL.js-Datenbank mit erhaltenen Beständen und Importkennungen.
- Kleine und große Bestell-Excel, Dezimalkomma, Hilfstabellen, Lagerkennzahlen, leere Zeilen und Verbrauchsmaterial ohne Artikelnummer.
- Falsche Arbeitsmappen sowie Null-/Negativmengen werden nicht als Wareneingang übernommen.
- Stabiler Bestellabgleich und neue Kennung bei verändertem Bestelldatum; rein numerische Bezeichnungen werden nicht als Menge interpretiert.

`npm run test:syntax`: **22 JavaScript-Dateien und 3 eingebettete Skripte erfolgreich geprüft**. Lokale Skriptpfade, sichtbare Versionsnummer, Manifest und Cache-Kennung passen zu V78. `git diff --check` ohne Fehler.

## Tatsächliche Bedienwege im Browser

Umgebung: Chromium 153 im Headless-Betrieb, lokale HTTP-Bereitstellung, deutscher Browser-Locale. Die bestehenden CDN-Bibliotheken wurden für reproduzierbare Tests in denselben Versionen aus lokalen Dateien bereitgestellt. PDF.js und dessen Worker wurden tatsächlich aus `vendor` geladen. Der Service Worker war in diesen Browser-Läufen deaktiviert.

| Prüfung | Ergebnis |
| --- | --- |
| Bereitgestellte dreiseitige RONDO-PDF über Dateiauswahl auslesen | 3 Materialien erkannt; Mengen 2 / 2 / 1; Datum 23.09.2026; Zeit-/Kilometer-/Leistungspositionen ausgeschlossen |
| PDF-Entnahme bestätigen und erneut importieren | Bestände korrekt verändert; grüne Abschlussanzeige; Dateiauswahl geleert; gleicher Import sichtbar gesperrt |
| Bereitgestellte Bestell-Excel über Dateiauswahl einlesen | 13 Artikel erkannt; 0,85 erhalten; 1011 / 1025 nicht als Mengen behandelt |
| Liefermenge bearbeiten und bestätigen | Eingabe 0 sperrt die Buchung; geänderte Liefermenge 8 wird als 8 gebucht; Prüfung erforderlich; Datum und Techniker werden übernommen |
| Excel erneut einlesen | 13 bereits verarbeitete Positionen; keine zweite Einbuchung |
| Unbekanntes Excel-Material registrieren (synthetische Zusatzdatei) | Artikelnummer und Beschreibung vorausgefüllt; Menge 3 genau einmal als Anfangsbuchung übernommen; keine zusätzliche offene Lieferzeile |
| Speicherfehler nach Excel-Einbuchung (injizierter IndexedDB-Fehler) | Fehler erkannt; Wiederholungsversuch erzeugt keine zweite Einbuchung; Bestand 4 statt 5 |
| Kunden-/Datumswarnung bei verändertem Ticket | Mit simuliertem neuen PDF-Extraktionsergebnis geprüft: Vergleichshinweis, ausdrückliche Bestätigung und anschließende Auswahl zusätzlicher Materialien funktionieren |
| Berichtdatum korrigieren und zurückändern | Datumsänderung wird in alle nicht individuell korrigierten Zeilen übernommen; frühere Zusatzbestätigung wird ungültig |
| Smartphone-Ansicht | Chromium auf 390 × 844 Pixel: Mengen, Auswahl und Aktionen als Karten erreichbar; PDF- und Excel-Bedienwege erfolgreich |
| App neu laden | Tatsächliche IndexedDB-Arbeitskopie mit gebuchten Beständen und Version 78.0 erhalten |
| Tatsächlicher Versionswechsel V77 → V78 im selben Browser | V77-Skripte aus Git-Historie ausgeführt, Daten angelegt und PDF gebucht; danach V78 ohne Löschen von IndexedDB geladen: 3 Artikel und 6 Buchungen unverändert, alle Artikelfelder/Bestände und Techniker erhalten, keine erneute Einrichtung; alte PDF-Kennungen erkannt |

Die Artikelansichten wurden auf PC- und Smartphone-Breite visuell kontrolliert. Screenshots mit Quelldaten und die privaten Beispieldateien werden nicht mit ausgeliefert.

## Nicht geprüft

- Kein Test auf einem echten Android-/iOS-Gerät.
- Kein Test einer neuen GitHub-Pages-Bereitstellung dieser Version vor dem Upload.
- Kein erneuter OCR-Qualitätstest, keine neue Mehrgeräte-/Cloud-Synchronisationsprüfung und kein vollständiger Service-Worker-Update-/Offline-Durchlauf.
- Die früher genannten 346 V77-Tests lagen im Repository nicht vor. Die Ergebnisse hier beziehen sich auf die tatsächlich ausgeführten neuen Tests und Browser-Abläufe, nicht auf eine pauschale Wiederholung aller früheren Prüfungen.
