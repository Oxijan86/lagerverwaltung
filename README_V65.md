# Lagerverwaltung Lovrencic – Version 65

## Bestandslogik
- Mindestbestand = Warn-/Bestellschwelle.
- Sollbestand = Zielbestand nach Bestellung.
- Regel: `0 <= Mindestbestand <= Sollbestand`.
- Ist Mindest > Soll, wird **Soll** auf Mindest angehoben.
- Unterbestand ausschließlich bei `Ist < Mindest`.
- Materialanforderung nur bei `Ist < Mindest`; Bestellmenge `max(0, Soll - Ist)`.

## Sicherheit
- `X-LV-Admin-Unlocked` wird nicht mehr akzeptiert.
- Geschützte Aufrufe verwenden ein zufälliges Sitzungstoken, das nur nach erfolgreicher Passwortprüfung ausgestellt wird.
- Setup-Endpunkte können bestehende Passwörter nicht überschreiben.
- Mindestlänge 8 Zeichen.
- Neue Passwörter werden mit PBKDF2-SHA256 und zufälligem Salt gespeichert.
- Alte FNV-Passwörter bleiben lesbar und werden beim erfolgreichen Entsperren automatisch migriert.

## Bedienung
- Soll-/Mindest-Entwürfe anderer Zeilen bleiben beim Speichern erhalten.
- Ungespeicherte Werte werden markiert; beim Ansichtswechsel erscheint eine Warnung.
- Funktion „Alle Änderungen speichern“.
- Schreibvorgang und UI-Aktualisierung werden getrennt bewertet.
- Materialformular prüft Pflichtfelder, zeigt doppelte Artikelnummern früh an, verlangt einen Lagerort und fragt vor dem Leeren.
- Maschinenwahl im neuen Material erfolgt über Touch-freundliche Checkbox-Chips.
- Responsive Layout, größere Touchflächen, Fokusmarkierungen und modale Tastatursteuerung wurden verbessert.

## Transaktionen
Direkte Materialanlage sowie Import/Create-and-book laufen innerhalb einer SQLite-Transaktion. Bei Fehlern erfolgt `ROLLBACK`, bevor `persist()` ausgeführt wird.

## Synchronisation
Die sichere V59–V64-Synchronisationslogik bleibt erhalten. Die Statusanzeige wurde verständlicher formuliert. Die Browser-/OneDrive-Ordnersynchronisierung ist weiterhin keine atomare serverseitige Mehrgeräte-Datenbank.

## Prüfung
- 102 automatisierte Tests bestanden, 0 fehlgeschlagen.
- JavaScript-Syntax, Inline-Skripte und Manifest geprüft.
- Beide Excel-Vorlagen validiert.

## Technische Grenze
Die bestehende Ordner-/OneDrive-Dateisynchronisierung bleibt eine browserseitige Dateisynchronisation und bietet keine atomare serverseitige Compare-and-Swap-Garantie zwischen mehreren Geräten. Die vorhandenen Revisions-, Prüf- und Konfliktschutzmechanismen wurden beibehalten.
