# Lagerverwaltung Lovrencic V43

## Service-PDF-Extraktion

Die App verarbeitet nun direkt die TAB-getrennte Ausgabe des festgelegten M365-/Copilot-Prompts.

Spaltenreihenfolge:
1. Datum
2. Artikelnummer
3. Anzahl
4. Kunde
5. Maschine

Für jedes Material wird eine eigene Zeile erwartet. Eine Kopfzeile ist optional.

Fahrzeit, Arbeitszeit und Kilometer werden ignoriert. Unbekannte Maschinen werden weiterhin erst nach Bestätigung der Entnahme automatisch angelegt.

Die Excel-Vorlage für Materialanforderungen wurde nicht verändert.
