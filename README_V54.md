# Lagerverwaltung Lovrencic – Version 54

## Fehlerbehebung Materialanforderung

Die interne Prüfung unterscheidet jetzt korrekt zwischen beiden Excel-Vorlagen:

- Standardvorlage bis 25 Positionen: Techniker F1, Datum H1, Bezeichnung Spalte F
- Große Vorlage ab 26 Positionen: Techniker D1, Datum F1, Bezeichnung Spalte D

Die Prüfung der leeren Restzeilen verwendet ebenfalls die richtige Vorlage und deren vorbereitete Zeilenanzahl.
