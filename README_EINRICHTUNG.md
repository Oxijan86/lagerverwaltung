# Lagerverwaltung Lovrencic V32 – Cloudstart-Fix

## Behobener Fehler

Der Synchronisationsordner wurde im Startabgleich fälschlich wie eine einzelne Datei behandelt. Dadurch erschien:

- Cloud-Stand: unbekannt
- Datei: Name des Ordners
- Klick auf „Aktuellen Cloud-Stand laden“ ohne erkennbare Reaktion

V32 liest jetzt korrekt die Datei `lager.db` innerhalb des verbundenen Synchronisationsordners.

## Startabgleich

Beim Start werden korrekt verglichen:

- letzter tatsächlicher lokaler Änderungszeitpunkt,
- Änderungszeitpunkt der Cloud-Datei `lager.db`,
- lokaler Artikelbestand,
- lokale Buchungsanzahl.

Das bloße Öffnen der App verändert den lokalen Zeitstempel nicht mehr.

## Cloud-Stand laden

Beim Klick auf `Aktuellen Cloud-Stand laden`:

1. wird die Ordnerberechtigung geprüft,
2. wird `lager.db` im verbundenen Ordner gesucht,
3. wird die SQLite-Datei geprüft,
4. wird vor dem Laden ein Sicherheitsbackup erstellt,
5. wird der Cloud-Stand lokal übernommen,
6. wird die Startauswahl bestätigt,
7. startet die App mit dem geladenen Stand neu.

Fehlt `lager.db` oder wurde die Berechtigung entzogen, erscheint eine verständliche Fehlermeldung.
