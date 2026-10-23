# Audit-Protokoll

Das Audit-Protokoll dient der vollständigen Nachvollziehbarkeit von Änderungen und Buchungen.

## Neue Buchungen
Seit Version 55 wird **jede einzelne Buchungsposition** als eigener Audit-Eintrag gespeichert. Enthalten sind:

- Buchungs-ID
- Buchungsdatum
- Buchungsart: Einbuchung oder Entnahme
- Artikel-ID
- Artikelnummer
- Bezeichnung
- Menge
- Kunde
- Techniker
- Fahrzeug
- Maschine
- Lieferschein
- Quelle der Buchung
- Bemerkung
- Erfassungszeitpunkt

Im Audit-Bereich werden Buchungsart, Artikelnummer, Menge, Kunde und Maschine zusätzlich als eigene Spalten angezeigt. Die vollständigen Angaben stehen weiterhin im Detailfeld.

## Korrekturen und Löschungen
Bei Buchungskorrekturen werden alter und neuer Wert der geänderten Felder protokolliert. Bei Löschungen wird der vollständige Buchungsstand vor dem Löschen festgehalten.

Das Audit-Protokoll wird nicht auf die letzten 500 Einträge begrenzt; alle vorhandenen Audit-Einträge können angezeigt werden.

## Bestehende Buchungen
Beim ersten Start von Version 55 werden vorhandene Buchungen einmalig nachgetragen, sofern noch kein positionsgenauer Audit-Eintrag mit vollständigen Details existiert. Alte Zusammenfassungs-Einträge bleiben aus Nachvollziehbarkeitsgründen erhalten.
