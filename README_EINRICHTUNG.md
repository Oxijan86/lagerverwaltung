# Lagerverwaltung Lovrencic V30

## Automatische Backups

Automatische lokale Backups sind immer aktiv, auch ohne verbundenen Cloud-Ordner.

Ein Backup wird erstellt:

- etwa 15 Sekunden nach einer gespeicherten Änderung,
- mindestens einmal täglich,
- vor Inventuren,
- vor Importen,
- vor Lieferschein-Einbuchungen,
- beim Abmelden bzw. Schließen.

Sobald ein Synchronisationsordner verbunden wurde, speichert die App Backups zusätzlich im Cloud-Unterordner `Backup`.

## Anzeige in der Kopfzeile

Oben wird angezeigt:

`Datenbank zuletzt aktualisiert: Datum und Uhrzeit`

Der Zeitstempel wird nach jeder gespeicherten Änderung aktualisiert.

## Backup-Status

Im Menü `Backups` wird angezeigt:

- lokale Backups aktiv,
- Cloud-Backups aktiv oder nicht verbunden,
- Aufbewahrung der letzten 30 Sicherungen,
- Zeitpunkt des letzten automatischen Backups.

## Hinweis

Lokale Browser-Backups können verloren gehen, wenn die Website-Daten manuell gelöscht werden. Für geräteübergreifende Sicherheit wird deshalb weiterhin ein freiwillig verbundener Cloud-Ordner empfohlen.
