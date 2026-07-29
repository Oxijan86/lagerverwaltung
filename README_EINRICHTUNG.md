# Lagerverwaltung Lovrencic V27 Cloud – Stammdaten-Fix

## Behoben

Version 26 konnte die Stammdaten sichtbar freischalten, obwohl die gespeicherte Sitzung im Backend nicht mehr gültig war. Dadurch erschien beim Anlegen eines Technikers weiterhin „Stammdaten sind nicht freigeschaltet“.

Version 27:

- prüft ein gespeichertes Passwort beim App-Start erneut,
- zeigt die Stammdaten nur nach erfolgreicher Prüfung als freigeschaltet,
- sendet das Passwort bei jeder Anlage von Technikern, Maschinen und Lagerorten ausdrücklich mit,
- erkennt korrekt, ob überhaupt ein Passwort vorhanden ist,
- ermöglicht bei alten Datenbanken die erstmalige Passwortanlage,
- löscht ungültige alte Sitzungsdaten automatisch,
- meldet doppelte Techniker oder Stammdaten verständlich.

## Nach dem Update

1. Dateien in GitHub vollständig ersetzen.
2. Commit durchführen.
3. Einige Minuten warten.
4. Seite mit Strg+F5 neu laden.
5. Unter Stammdaten das Passwort erneut eingeben.
6. Danach Techniker anlegen.

Falls Version 26 angezeigt wird, die Website-Daten bzw. die installierte PWA löschen und neu öffnen.
