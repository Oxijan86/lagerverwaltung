# Lagerverwaltung Lovrencic V31

## Startabgleich

Bei jedem neuen Start wird vor der Arbeit geprüft:

- wann der lokale Stand zuletzt geändert wurde,
- wann die Cloud-Datei zuletzt geändert wurde,
- wie viele Artikel und Buchungen lokal vorhanden sind,
- ob der lokale oder der Cloud-Stand neuer ist.

Anschließend muss bewusst gewählt werden:

- aktuellen Cloud-Stand laden,
- lokalen Stand verwenden,
- andere `lager.db` auswählen,
- neue Datenbank erstellen.

Ist die Cloud-Datei neuer, wird deutlich davor gewarnt, mit einem älteren lokalen Stand weiterzuarbeiten.

## Schließen

Beim Beenden gibt es vier Möglichkeiten:

1. Synchronisieren und schließen
2. Nur lokal speichern und schließen
3. Ohne Speichern schließen
4. Abbrechen

`Ohne Speichern schließen` verwirft alle Änderungen seit dem letzten gespeicherten Datenbankstand. Es wird weder lokal noch in die Cloud geschrieben und kein neues Backup erzeugt.
