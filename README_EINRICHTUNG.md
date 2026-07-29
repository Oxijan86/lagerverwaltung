# Lagerverwaltung Lovrencic V33 – Cloudstand laden

## Behobene Fehler

1. Der verbundene Synchronisationsordner wurde bisher fälschlich wie eine Datei behandelt.
   V33 liest jetzt korrekt `lager.db` innerhalb des gewählten Ordners.

2. Beim Klick auf `Aktuellen Cloud-Stand laden` wurde die Seite zu früh neu geladen.
   Dadurch konnte die Startbestätigung nicht gespeichert werden und der Startdialog erschien erneut.

## Neuer Ablauf

Beim Klick auf `Aktuellen Cloud-Stand laden`:

1. Ordnerberechtigung prüfen
2. `lager.db` im Synchronisationsordner suchen
3. SQLite-Datenbank prüfen
4. Sicherheitsbackup des lokalen Stands erstellen
5. Cloud-Datei lokal laden
6. Startauswahl als bestätigt speichern
7. Seite einmal kontrolliert neu laden

Fehlt die Datei oder die Berechtigung, wird der konkrete Fehler direkt im Startdialog angezeigt.
