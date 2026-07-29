# Lagerverwaltung Lovrencic V26 – Stammdaten-Freischaltung

## Behoben

Bei übernommenen älteren Datenbanken konnten Artikel geladen werden, aber die Stammdaten blieben intern gesperrt. Dadurch ließen sich insbesondere Techniker, Lagerorte und Maschinen trotz sichtbarer Eingabefelder nicht speichern.

Version 26 trennt jetzt sauber zwischen:

- vorhandenen Lagerdaten,
- vorhandenem Administratorpasswort,
- Freischaltung der aktuellen Sitzung.

## Neues Verhalten

1. Eine alte Datenbank mit Artikeln wird direkt geladen.
2. Fehlt ein Passwort, kann einmalig ein neues Administratorpasswort festgelegt werden.
3. Nach erfolgreicher Passwortanlage sind die Stammdaten sofort freigeschaltet.
4. Die Freischaltung bleibt für die aktuelle Browser-Sitzung erhalten.
5. Techniker, Lagerorte, Maschinen, Fahrzeuge und Artikeländerungen können anschließend gespeichert werden.
6. Beim Schließen des Browsers endet die Freischaltung automatisch.

## Update auf GitHub

1. ZIP entpacken.
2. Alle Dateien in das bestehende Repository hochladen und ersetzen.
3. Commit durchführen.
4. Einige Minuten warten.
5. Seite mit `Strg + F5` neu laden.
6. Bei installierter PWA diese vollständig schließen oder neu installieren, falls weiterhin Version 25 angezeigt wird.
