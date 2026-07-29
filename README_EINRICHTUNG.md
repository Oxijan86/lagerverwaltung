# Lagerverwaltung Lovrencic V40

## Neue Speicherwahl
Beim ersten Start kann jeder Benutzer zwischen lokalem Modus und Cloud-Modus wählen. Eine vorhandene Datenbank kann ebenfalls lokal übernommen werden.

## Lokal zu Cloud
Unter „Speicher & Synchronisation“ kann die aktuelle lokale Datenbank in einen leeren, selbst gewählten Ordner übernommen werden. Vorher wird ein Sicherheitsbackup erstellt. Eine dort bereits vorhandene `lager.db` wird nicht automatisch überschrieben.

## Cloud zu lokal
Beim Wechsel zurück bleibt der aktuelle Datenstand lokal erhalten. Die Verknüpfung wird entfernt; die Cloud-Datei wird nicht gelöscht.

## Voraussetzungen
Für die normale Nutzung sind weder Python noch GitHub-Einrichtung erforderlich. Die Ordnerverknüpfung hängt von der Browserunterstützung ab. Falls Android keine dauerhafte Ordnerauswahl anbietet, bleiben lokale Nutzung sowie manueller Export und Import der `lager.db` verfügbar.
