# Lagerverwaltung Lovrencic V23 – Setup-Fix

## Behobener Fehler

Bei einer importierten oder synchronisierten bestehenden Datenbank konnte der Einrichtungsassistent weiterhin angezeigt werden, obwohl Artikel und andere Daten bereits geladen waren.

Version 23 erkennt eine vorhandene Datenbank jetzt anhand ihrer tatsächlichen Inhalte:

- Artikeldaten
- Buchungen
- Techniker
- Lagerorte
- Maschinen

Sobald eine gültige Datenbank mit vorhandenen Daten erkannt wurde, wird sie automatisch als eingerichtet übernommen und das Dashboard direkt angezeigt.

## Datenübernahme

Die lokalen Daten und die bestehende `lager.db` bleiben erhalten. Die IndexedDB-Schlüssel von Version 22 werden bewusst weiterverwendet.

## GitHub-Update

1. ZIP entpacken.
2. Alle enthaltenen Dateien in das bestehende GitHub-Repository hochladen und ersetzen.
3. Commit durchführen.
4. Einige Minuten warten.
5. Seite mit `Strg + F5` neu laden.
6. Bei installierter PWA diese vollständig schließen und erneut öffnen. Falls weiterhin Version 22 angezeigt wird, die PWA entfernen und neu installieren.

## Verhalten

- Neue, leere Datenbank: Einrichtungsassistent wird angezeigt.
- Vorhandene Datenbank mit Daten: Dashboard startet direkt.
- Vorhandene Datenbank ohne Administratorpasswort: Dashboard funktioniert; nur geschützte Stammdaten verlangen später die Festlegung eines Passworts.
