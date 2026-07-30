# Lagerverwaltung Lovrencic V47

## Fehlerbehebung

- Fehler `verifyPassword is not defined` behoben.
- Buchungskorrekturen funktionieren wieder.
- Buchungslöschungen funktionieren wieder.
- Für Buchungskorrekturen und Buchungslöschungen bleibt die erneute Passwortabfrage Pflicht.

## Stammdaten

- Einzelne Artikel können weiterhin über 🗑️ gelöscht werden.
- Beim Löschen eines einzelnen Artikels wird kein zusätzliches Passwort abgefragt.
- Voraussetzung ist, dass der Stammdatenbereich bereits mit dem Administratorpasswort freigeschaltet wurde.
- Sicherheitsbackup und Warnung bei vorhandenen Buchungen bleiben erhalten.

Die Materialanforderungsvorlage wurde nicht verändert.
