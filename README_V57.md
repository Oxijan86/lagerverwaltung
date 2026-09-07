# Lagerverwaltung Lovrencic – Version 57

## Lagerorte und Maschinen direkt beim Material anlegen
- In der normalen Materialanlage und bei unbekannten Artikeln aus Lieferschein/Servicebericht können neue Lagerorte und Maschinen direkt angelegt werden.
- Ähnliche vorhandene Namen werden vorgeschlagen, um doppelte Stammdaten zu vermeiden.

## Maschinen-Aliase und Zusammenführen
- Eine Hauptmaschine kann mehrere alternative Ticket-Bezeichnungen besitzen.
- Alternative Bezeichnungen werden bei Serviceberichten automatisch erkannt.
- Falsche Alias-Zuordnungen können wieder getrennt werden.
- Zwei bereits getrennt angelegte Maschinen können zusammengeführt und anschließend wieder getrennt werden.

## Ersatzteil für mehrere Maschinen
- Artikel unterstützen jetzt eine echte Mehrfachzuordnung zu Maschinen.
- Bestehende Einzelzuordnungen werden beim ersten Start automatisch in das neue Datenmodell übernommen.
- Die alte `machine`-Spalte bleibt aus Kompatibilitätsgründen als lesbare Zusammenfassung erhalten.

## Audit
- Anlage/Trennung von Maschinen-Aliasen und Zusammenführungen werden im Audit protokolliert.
